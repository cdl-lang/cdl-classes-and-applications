// Copyright 2017 Yoav Seginer, Theo Vosse, Gil Harari, and Uri Kolodny.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//
// This file deals with interfacing Slider Facets and Histograms to a
//  SegmentedScaledCanvas class
//
// The main interfaces expected by a SegmentedScaledCanvas class includes:
//
//  canvasPixelSize
//  minUnit
//  niceDivisorList
//  {primaryLabel/secondarylabel/unlabeled}Spacing
//  minValue/maxValue
//  segmentList
//
// SliderCanvas can be used by a SliderFacet as its canvas,
//  providing offsetToValue/valueToOffset functions, and defining
//  edgeMarkValue/primaryLabelValue/secondaryLabelValue/unlabeledValue
//  for the places where tick-marks should be placed
//
// most of the code below deals with the proper assignment to 'segmentList'.
// The interface with a SliderFacet definition is as follows:
//
// facetType: "SliderFacet" (interpreted by 'Facet' to select a slider facet)
// scaleMinValue/scaleMaxValue: if specified, forces the canvas end-point
//    values to be exactly the specified values; otherwise, the
//    canvas-end-points are assigned based on the base-overlay's facet values
//
// scaleType: one of 'log', 'linear', 'linearPlus', 'linearPlusMinus'
//
// for scaleType == 'log':
//
//  the actual scale used is fully logarithmic if the canvas value does not
//   traverse zero. If it does, a neighborhood of zero uses a linear segment,
//   with a logarithmic scale outside this neighborhood of zero.
//   (For negative values outside this zero-neighborhoood, a '-log(-x)' based
//    value is used)
//   In the general case, four different segments are used: a negative log
//     segment, a negative linear segment, a positive linear segment, and
//     a positive log segment. See 'SegmentedLogSliderCanvas' for additional
//     details.
//
//   scaleZeroMarginValue: can be used inside a facet definition to force
//      the abs-max value for the linear neighborhood of zero (this value is
//      used for both the positive and negative neighborhoods).
//      If this value is not specified, it is chosen as an integer power of 10
//        that would make a 'fair' percentage of the values within the linear
//        neighborhoood (assuming a single full order-of-magnitude pixel span
//        for either the positive or negative linear segment)
//
//   scaleZeroMarginRatio: can be used to affect scaleZeroMarginValue
//       calculation, such that the power of 10 selected would attempt to
//       make the percentage of negative/positive values within the neighborhood
//       out of all negative/positive values approximately the specified value
//
//
// for scaleType: 'linear':
//   no additional parameters
//
//
// for scaleType 'linearPlus', 'linearPlusMinus':
//
//   these scale types assume the primary part of the canvas is linear, but
//     still allow a logarithmic part at the edges.
//
//  scalePreLinearLogRatio: what ratio of the canvas should be allotted to the
//     negative logarithmic segments (defaults to 0.1)
//
//  scalePostLinearLogRatio: what ratio of the canvas should be allotted to the
//     positive logarithmic segment (defaults to 0.1)
//
//  scaleLinearMaxValue: the boundary between the linear segment and the
//   positive log segment
//
// scaleLinearMinValue: the boundary between the linear segment and the negative
//   log segment
//

//
// findRoundEdges():
//   return an o/s of two 'rounder' alternatives to the
//   given minData/maxData.
//
// uses the following table format:
//
// niceDivisorTable: o(
//   { divisor: 1, roundScore: log10(10) },
//   { divisor: 2, roundScore: log10((5) },
//   { divisor: 4, roundScore: log10(2.5) },
//   { divisor: 5, roundScore: log10(2) },
//   { divisor: 10, ... },
//   { divisor: 20, ... }
//    ...
//
// the score is the sum of the divisor 'roundScore' and the efficiency score.
// the efficiency score is the data-delta divided by the edge-delta, multiplied
//  by 'efficientToRoundRatio'
//
function findRoundEdges(minData, maxData, minUnit, niceDivisorTable,
    efficientToRoundRatio) {
    // if 'divisor' were chosen, then rounding wound be by 'roundingUnit',
    //  and <minData;maxData> would be rounded to <minEdge;maxEdge>
    //
    function getDivisorEdges(divisor) {
        var roundingUnit = [div, r10maxNum, divisor];
        var minEdge = floorToUnit(minData, roundingUnit);
        var maxEdge = ceilToUnit(maxData, roundingUnit);
        return o(minEdge, maxEdge);
    }

    // calculate the efficiency score for 'divisor': the ratio of
    //  dataRange (maxData-minData) to edgeDelta (maxEdge-minEdge)
    //
    function efficiencyScore(divisor) {
        var edges = getDivisorEdges(divisor);
        var minEdge = [first, edges];
        var maxEdge = [last, edges];
        var edgeDelta = [minus, maxEdge, minEdge];
        return [
            cond,
            [equal, 0, edgeDelta],
            o(
                { on: true, use: 0 },
                { on: false, use: [div, dataRange, edgeDelta] }
            )
        ];
    }

    var dataRange = [minus, maxData, minData];
    var numList = o(dataRange, minUnit);
    var r10maxNum = findSupP10(numList, minUnit);
    var scoredTable = [
        map,
        [
            defun, o("entry"),
            {
                score: [
                    plus,
                    [{ roundScore: _ }, "entry"],
                    [
                        mul,
                        efficientToRoundRatio,
                        efficiencyScore([{ divisor: _ }, "entry"])
                    ]
                ],
                divisor: [{ divisor: _ }, "entry"]
            }
        ],
        niceDivisorTable
    ];

    var maxScore = [
        max,
        [{ score: _ }, scoredTable]
    ];

    var maxScoreEntry = [
        first,
        [
            filter,
            [
                defun, o("entry"),
                [equal, [{ score: _ }, "entry"], maxScore]
            ],
            scoredTable
        ]
    ];

    var divisor = [{ divisor: _ }, maxScoreEntry];

    return getDivisorEdges(divisor);
}

//
// roundEdge():
// return a round alternative to 'rawEdge', which is an integer multiple of
//  minUnit.
// Rounding accomplished by looking at 'rawEdge' as a number in the range
//  [1, 10] multiplied by the appropriate power of 10, and using that number
// as an index to the range table 'roundingTable'.
//
// roundingTable (for rounding up) might be:
//
//  o(
//      { range: r(-Infinity, 1), value: 1 },
//      { range: Roc(1, 1.5), value: 1.5 },
//      { range: Roc(1.5, 2), value: 2 },
//      { range: Roc(2, 3), value: 3 },
//      { range: Roc(3, 5), value: 5 },
//      { range: Roc(5, 10), value: 10 }
// )
function roundEdge(rawEdge, minUnit, roundingTable) {
    var r10maxNum = findSupP10(o(rawEdge, minUnit), minUnit);
    var factor = [div, r10maxNum, 10];
    var rbase = [div, rawEdge, factor];
    var rval = [{ range: rbase, value: _ }, roundingTable];
    return [mul, rval, factor];
}

var classes = {

    //
    // fetch configuration parameters from the facet configuration into
    //  this area's context
    //
    CanvasFacetConf: {
        context: {
            roundToOOM: [
                first,
                o(
                    [{ myFacet: { dataObj: { logScaleRoundToOOM: _ } } }, [me]],
                    ["Round", [{ logScaleEdgeRoundingABTest: _ }, [me]]]
                )
            ],

            fakeZeroNegativeLogEdge: //o(
            [and,
                [equal, [{ userScaleLinearMinValue: _ }, [me]], 0],
                [lessThan, [{ scaleMinValue: _ }, [me]], 0]
            ],
            /*[and,
                [equal, [{ scaleType: _ }, [me]], "linearPlusMinus"],
                [equal, [{ minDataValue: _ }, [me]], 0]
            ]*/
            //)
        }
    },

    SliderCanvas: o(
        {
            "class": o(
                "NumericCanvas", "OneDMarkerSegmentedCanvas",
                "CanvasFacetConf", "TrackMySliderWidget"
            ),

            context: {
                numberOfDigits: [{ myFacet: { numberOfDigits: _ } }, [me]],

                maxNumberOfDigits: [max, [{ myApp: { numericFormats: { numberOfDigits: _ } } }, [me]]],
                maxNumberOfDigitsPlusOne: [plus, [{ maxNumberOfDigits: _ }, [me]], 1],

                // minDataValue/maxDataValue for EdgeRounder - see NumericCanvas
                noNegativeValues: [greaterThanOrEqual, [{ minDataValue: _ }, [me]], 0],
                noPositiveValues: [lessThanOrEqual, [{ maxDataValue: _ }, [me]], 0],

                defaultMinValue: [round, // override NumericCanvas definition
                    [{ minRoundEdge: _ }, [me]],
                    [{ numberOfDigits: _ }, [me]]
                ],
                defaultMaxValue: [round, // override NumericCanvas definition
                    [{ maxRoundEdge: _ }, [me]],
                    [{ numberOfDigits: _ }, [me]]
                ],

                // log scale only: the ratio that each zero-neighborhood section
                //  (if one even exists exists) should take out of the total
                //  pixel size of the scale
                scaleConfiguredZeroMarginRatio: [
                    { myFacet: { dataObj: { scaleZeroMarginRatio: _ } } },
                    [me]
                ],

                logScaleSymmetricZeroNeighborhood: [
                    first,
                    o(
                        // do not use symmetric scale when user resets min or max value in log scale
                        [cond,
                            [and,
                                [equal, [{ scaleType: _ }, [me]], "log"],
                                o(
                                    [{ userScaleMaxValue: _ }, [me]],
                                    [{ userScaleMinValue: _ }, [me]]
                                )
                            ],
                            o(
                                { on: true, use: false }
                            )
                        ],
                        /*[
                            {
                                myFacet: {
                                    dataObj: {
                                        logScaleSymmetricZeroNeighborhood: _ // this is never initialized
                                    }
                                }
                            },
                            [me]
                        ],*/
                        ["Symmetric", [{ logScaleZeroNeighborhoodABTest: _ }, [me]]] //Symmetric by default
                    )
                ],

                logScalePrimarySpacingCoeff: [
                    first,
                    o(
                        [{ logScalePrimarySpacingCoeffABTest: _ }, [me]],
                        1
                    )
                ],
                linearScalePrimarySpacingCoeff: [
                    first,
                    o(
                        [{ linearScalePrimarySpacingCoeffABTest: _ }, [me]],
                        3
                    )
                ],

                primarySpacingLogCoeff: [
                    cond,
                    [{ scaleType: _ }, [me]],
                    o(
                        {
                            on: "log",
                            use: [{ logScalePrimarySpacingCoeff: _ }, [me]]
                        },
                        {
                            on: n(),
                            use: [{ linearScalePrimarySpacingCoeff: _ }, [me]]
                        }
                    )
                ],

                isLinearPlusMinusWithNoNegativeValues: [and,
                    [{ noNegativeValues: _ }, [me]],
                    [equal, [{ scaleType: _ }, [me]], "linearPlusMinus"]
                ],

                isLinearPlusOrMinusWithNoPositiveValues: [and,
                    [{ noPositiveValues: _ }, [me]],
                    o(
                        [equal, [{ scaleType: _ }, [me]], "linearPlus"],
                        [equal, [{ scaleType: _ }, [me]], "linearPlusMinus"]
                    )
                ],

                useFakeZeroScaleLinearMinValue: [and,
                    [{ isLinearPlusMinusWithNoNegativeValues: _ }, [me]],
                    o(
                        [not, [{ userScaleLinearMinValue: _ }, [me]]],
                        [equal, [{ userScaleLinearMinValue: _ }, [me]], 0]
                    )
                ],

                useFakeZeroScaleLinearMaxValue: [and,
                    [{ isLinearPlusOrMinusWithNoPositiveValues: _ }, [me]],
                    o(
                        [not, [{ userScaleLinearMaxValue: _ }, [me]]],
                        [equal, [{ userScaleLinearMaxValue: _ }, [me]], 0]
                    )
                ],

            }
        },
        {
            qualifier: { useFakeZeroScaleLinearMinValue: true },
            context: {
                //scaleLinearMinValue: -0.0001                
                scaleLinearMinValue: [uminus,
                    [pow, 10, [uminus, [{ maxNumberOfDigitsPlusOne: _ }, [me]]]]
                ]
            }
        },
        {
            qualifier: { isLinearPlusMinusWithNoNegativeValues: true, userScaleMinValue: false },
            context: {
                minValue: -10
            }
        },
        {
            qualifier: { useFakeZeroScaleLinearMaxValue: true },
            context: {
                //scaleLinearMaxValue: 0.0001
                scaleLinearMaxValue: [pow, 10, [uminus, [{ maxNumberOfDigitsPlusOne: _ }, [me]]]]
            }
        },
        {
            qualifier: { isLinearPlusOrMinusWithNoPositiveValues: true, userScaleMaxValue: false },
            context: {
                maxValue: 10
            }
        }
    ),

    SliderCanvasPartition: o(
        {
            "class": o("GeneralArea", "SegmentedCanvasPartition"),

            context: {
                singleBinLogTail: ["Yes", [{ singleBinLogTailABTest: _ }, [me]]]
            }
        },

        //
        // if 'singleBinLogTail' is true, force negative/positive log tails
        //  to have a single histogram bin each
        {
            qualifier: {
                singleBinLogTail: true,
                scaleType: o("linearPlus", "linearPlusMinus")
            },

            context: {
                canvasPartitionValue: o(
                    [{ negativeTailSingleBin: _ }, [me]],
                    [
                        {
                            children: {
                                segment: {
                                    segmentCanvasPartition: _,
                                    scaleType: "linear"
                                }
                            }
                        },
                        [me]
                    ],
                    [{ positiveTailSingleBin: _ }, [me]],
                    [{ canvasEndValue: _ }, [me]]
                ),

                negativeTailSingleBin: [
                    cond,
                    [{ hasNegativeLogSegment: _ }, [me]],
                    {
                        on: true,
                        use: [{ canvasStartValue: _ }, [me]]
                    }
                ],

                positiveTailSingleBin: [
                    cond,
                    [{ hasPositiveLogSegment: _ }, [me]],
                    {
                        on: true,
                        use: [
                            max,
                            [
                                {
                                    children: {
                                        segment: {
                                            segmentEndValue: _,
                                            scaleType: "linear"
                                        }
                                    }
                                },
                                [me]
                            ]
                        ]
                    }
                ]
            }
        }
    ),

    //
    // this class derives SegmentedScaledCanvas, a canvas with
    //  labels and tick-marks that may have segments with different linear/log
    //  scales and different rates;
    // this class defines 'segmentList', which is one of the main inputs to
    //  SegmentedScaledCanvas, depending on the scaleType defined.
    // The handling of the various scaleTypes (linear/log/LinearPlusMinus) is
    //  done by a class specific for each type; SegmentedCanvasAdapter selects
    //  the correct class to derive by the value of 'scaleType'
    //
    // In addition:
    //  - it defines canvasPixelSize, niceDivisorList, canvasStartValue and
    //      the tick-mark spacing values, which are all expected
    //      by SegmentedScaledCanvas
    //  - it exports a 'positionToValue' and 'positionToRoundValue' defuns,
    //     mapping a posPoint to a value (using  'offset' and the canvas
    //     offsetToValue function)
    //  - it computes a round edges which are wider than the data min/max values
    //     without wasting 'too much' pixels on values outside the actual data
    //     range. this is done using LinearEdgeRounder and LogEdgeRounder
    //
    SegmentedCanvasAdapter: o(
        {
            "class": o(
                "GeneralArea",
                "SegmentedScaledCanvas",
                "OrientedElement"
            ),

            context: {
                canvasPixelSize: [
                    abs,
                    [
                        offset,
                        [{ minValPoint: _ }, [me]],
                        [{ maxValPoint: _ }, [me]]
                    ]
                ],

                minUnit: [pow, 10, [uminus, [{ numberOfDigits: _ }, [me]]]],

                niceDivisorList: [{ niceDivisorPrecision: { divisor: _ } }, [me]], 
                // o(1, 2, 4, 5), //3?

                // how many extra decimal digits are required by each divisor
                niceDivisorPrecision: o(
                    { divisor: 1, precision: 0 },
                    { divisor: 2, precision: 1 },
                    //{ divisor: 3, precision: 2 },
                    { divisor: 4, precision: 2 },
                    { divisor: 5, precision: 1 }
                ),

                //canvasStartValue: [{ minValue: _ }, [me]], // moved to BaseSegmentedCanvas

                // map a posPoint to its value on the canvas
                //
                positionToValue: [
                    defun, o("posPoint"),
                    [
                        [{ offsetToValue: _ }, [me]],
                        [
                            [{ scaPositionToOffset: _ }, [me]],
                            "posPoint"
                        ]
                    ]
                ],

                // map a posPoint to its pixel offset from the canvas's
                //  start position
                //
                scaPositionToOffset: [
                    defun, o("posPoint"),
                    [
                        mul,
                        [
                            offset,
                            [{ minValPoint: _ }, [me]],
                            "posPoint",
                            true
                        ],
                        [
                            cond,
                            [{ ofVerticalElement: _ }, [me]],
                            o(
                                { on: true, use: -1 },
                                { on: false, use: 1 }
                            )
                        ]
                    ]
                ],

                // positionToRoundValue(posPoint) - find a 'round' value which
                //  is near 'posPoint'. This is interpreted to mean the nearest
                //  tickmark.
                //
                // implementation first maps the posPoint to an offset using
                //  'scaPositionToOffset', then uses 'offsetToRoundValue'
                //
                positionToRoundValue: [
                    defun, o("posPoint"),
                    [
                        [{ offsetToRoundValue: _ }, [me]],
                        [
                            [{ scaPositionToOffset: _ }, [me]],
                            "posPoint"
                        ]
                    ]
                ],

                mergePartialBinThreshold: [
                    first,
                    o(
                        [{ mergePartialBinThresholdABTest: _ }, [me]],
                        0.2
                    )
                ],

                // note that 'primary' may be further increased by a coeff. of
                //  log10(canvasPixelSize)
                //  
                scaleMarkSpacingTable: o(
                    {
                        density: "V1",
                        scaleType: "any",
                        primary: 35,
                        secondary: 15,
                        unlabeled: 7,
                        oneDMarker: 8
                    },
                    {
                        density: "V1",
                        scaleType: "log",
                        primary: 22,
                        secondary: 15,
                        unlabeled: 7,
                        oneDMarker: [mul, 2, [{ "V1": _ }, bSliderPosConst.valueMarker1DRadius]] //8
                    },
                    {
                        density: "V2",
                        scaleType: "any",
                        primary: 39,
                        secondary: 19,
                        unlabeled: 8,
                        oneDMarker: [mul, 2, [{ "V2": _ }, bSliderPosConst.valueMarker1DRadius]] //8
                    },
                    {
                        density: "V2",
                        scaleType: "log",
                        primary: 24,
                        secondary: 19,
                        unlabeled: 7,
                        oneDMarker: [mul, 2, [{ "V2": _ }, bSliderPosConst.valueMarker1DRadius]] //10
                    },
                    {
                        density: "V3",
                        scaleType: "any",
                        primary: 45,
                        secondary: 23,
                        unlabeled: 10,
                        oneDMarker: [mul, 2, [{ "V3": _ }, bSliderPosConst.valueMarker1DRadius]] //10
                    },
                    {
                        density: "V3",
                        scaleType: "log",
                        primary: 28,
                        secondary: 21,
                        unlabeled: 9,
                        oneDMarker: [mul, 2, [{ "V3": _ }, bSliderPosConst.valueMarker1DRadius]] //10
                    }
                ),

                scaleMarkSpacingEntry: [
                    first,
                    o(
                        [
                            {
                                density: [{ displayDensityValue: _ }, [me]],
                                scaleType: [{ scaleType: _ }, [me]]
                            },
                            [{ scaleMarkSpacingTable: _ }, [me]]
                        ],
                        [
                            {
                                density: [{ displayDensityValue: _ }, [me]],
                                scaleType: "any"
                            },
                            [{ scaleMarkSpacingTable: _ }, [me]]
                        ]
                    )
                ],

                spacingFunc: [
                    defun, o("type"),
                    [
                        mul,
                        [{ scaleMarkSpacingABTest: _ }, [me]],
                        [
                            { "#type": _ },
                            [{ scaleMarkSpacingEntry: _ }, [me]]
                        ]
                    ]
                ],

                primaryLabelSpacing1: [
                    [{ spacingFunc: _ }, [me]],
                    "primary"
                ],

                // making this > 0 makes the primary spacing increase as the
                //  scale size increases
                primarySpacingLogCoeff: 0,
                primaryLabelSpacing: [
                    plus,
                    [{ primaryLabelSpacing1: _ }, [me]],
                    [
                        minus,
                        [
                            mul,
                            [{ primarySpacingLogCoeff: _ }, [me]],
                            [{ canvasPixelSize: _ }, [me]]
                        ],
                        [
                            mul,
                            [{ primarySpacingLogCoeff: _ }, [me]],
                            300
                        ]
                    ]
                ],

                secondaryLabelSpacing: [
                    [{ spacingFunc: _ }, [me]],
                    "secondary"
                ],

                unlabeledSpacing: [
                    [{ spacingFunc: _ }, [me]],
                    "unlabeled"
                ],

                oneDMarkerSpacing: [
                    mul,
                    [{ scale1DMarkSpacingABTest: _ }, [me]],
                    [{ oneDMarker: _ }, [{ scaleMarkSpacingEntry: _ }, [me]]]
                ]
            },

            position: {
                // as the canvas provides a service that relates only to
                //  the length axis, not the girth axis
                zeroGirth: {
                    point1: {
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { scaleType: "log" },

            "class": "SegmentedLogCanvasAdapter",
            context: {
                logEdgeRounding: true
            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "SegmentedLinearCanvasAdapter",
            context: {
                linearEdgeRounding: true
            }
        },

        {
            qualifier: { scaleType: "linearPlus" },
            "class": "SegmentedLinearPlusCanvasAdapter",
            context: {
                logEdgeRounding: true
            }
        },

        {
            qualifier: { scaleType: "linearPlusMinus" },
            "class": "SegmentedLinearPlusMinusCanvasAdapter",
            context: {
                logEdgeRounding: true
            }
        },

        {
            qualifier: { linearEdgeRounding: true },
            "class": "LinearEdgeRounder"
        },

        {
            qualifier: { logEdgeRounding: true },
            "class": "LogEdgeRounder"
        }
    ),

    //
    // this table is used when rounding linear scale edges
    //
    // the delta between the input max-value and min-value is rounded up to
    //  a power of 10. This power of 10 is then divided by each of the divisors
    //  in the table to get candidate round-to units.
    // The 'roundedness' score for each such candidate is the associated
    //  'roundScore:' attribute's value
    //
    EdgeRounderDivisorTable: {
        context: {
            niceEdgeDivisorTable: o(
                { divisor: 1, roundScore: Math.log10(10) },
                { divisor: 2, roundScore: Math.log10(5) },
                { divisor: 4, roundScore: Math.log10(2.5) },
                { divisor: 5, roundScore: Math.log10(2) },
                { divisor: 10, roundScore: Math.log10(1) },
                { divisor: 20, roundScore: Math.log10(0.5) },
                { divisor: 40, roundScore: Math.log10(0.25) },
                { divisor: 50, roundScore: Math.log(0.2) }
            )
        }
    },

    // find the divisor out of 'niceDivisorTable' (defined here below) for
    //  which the best combined score 'roundedness score' + 'efficiency score'
    //  is attained, given the raw segment 'minDataValue' - 'maxDataValue'
    //
    // the result is in 'minRoundEdge' and 'maxRoundEdge'
    //
    LinearEdgeRounder: {
        "class": o("GeneralArea", "EdgeRounderDivisorTable"),

        context: {
            roundEdges: findRoundEdges(
                [{ minDataValue: _ }, [me]],
                [{ maxDataValue: _ }, [me]],
                [{ minUnit: _ }, [me]],
                [{ niceEdgeDivisorTable: _ }, [me]],
                [{ efficientToRoundRatio: _ }, [me]]
            ),

            minRoundEdge: [first, [{ roundEdges: _ }, [me]]],
            maxRoundEdge: [last, [{ roundEdges: _ }, [me]]],

            // mul. factor for the efficiency-score -
            //    data-range / scale-range - compared to the 'roundedness'
            //    score which is the log10 of the rounding-unit
            efficientToRoundRatio: [
                first,
                o(
                    [{ linearScaleEdgeRoundingABTest: _ }, [me]],
                    8
                )
            ]
        }
    },

    // round 'minDataValue'/'maxDataValue' to 'minRoundEdge'/'maxRoundEdge':
    //
    // if minDataValue is negative and maxDataValue is positive:
    //   look (for eac of the positive and negative extremums) at the number of
    //    ooms between tyhe extremum and the least data value of the same sign
    //    (minPositiveValue/maxNegativeValue).
    // if the delta is 'small' (less that 1.5) then the rounding is done just as
    //   if this was a linear scale
    // if the delta is 'medium' (1.5 < log(extremum/least-of-same-sign) < 9)
    //   then each extremum is rounded separately using a rounding-table
    //   (described below)
    // if the delta is 'large' (log(extremum) - log(least-of-same-sign) > 9)
    //   then the rounding is to the next integer power of 10
    //
    // if the data is non-negative or non-positive, the extremum value is
    //   rounded in much the same way, while the value near 0 is:
    //    0 - if 0 is a data value
    //    rounded using the rounding-table (as in the case of 'medium' delta
    //     above)
    //
    // rounding by a rounding-table is done by first representing the value to
    //   be rounded in 'scientific notation', with a mantissa/significand in the
    //   range 1..10 . The rounding-table is a range-table with ranges that
    //    cover this range (1..10), and assign to each range a value.
    //   thus, an element in the table { range: r(1, 1.5), value: 1 } rounds
    //    (down) any value between 1 and 1.5 to 1 .
    //  
    LogEdgeRounder: o(
        {
            "class": "EdgeRounderDivisorTable",

            context: {
                // the 'ler_' variants only look at the data values,
                // and do not use 'minValue'/'maxValue'
                ler_isSingleSign: [
                    equal,
                    [sign, [{ minDataValue: _ }, [me]]],
                    [sign, [{ maxDataValue: _ }, [me]]]
                ],
                ler_isNonNegative: [
                    greaterThanOrEqual,
                    [{ minDataValue: _ }, [me]],
                    0
                ],
                ler_isNonPositive: [
                    lessThanOrEqual,
                    [{ maxDataValue: _ }, [me]],
                    0
                ],

                roundEdgeUpTable: o(
                    { range: r(-Infinity, 1), value: 1 },
                    { range: Roc(1, 1.5), value: 1.5 },
                    { range: Roc(1.5, 2), value: 2 },
                    { range: Roc(2, 3), value: 3 },
                    { range: Roc(3, 5), value: 5 },
                    { range: Roc(5, 10), value: 10 }
                ),

                roundEdgeDownTable: o(
                    { range: Roo(0, 1), value: 0 }, // to deal with very small positive numbers
                    { range: Rco(1, 1.5), value: 1 },
                    { range: Rco(1.5, 2), value: 1.5 },
                    { range: Rco(2, 3), value: 2 },
                    { range: Rco(3, 5), value: 3 },
                    { range: Rco(5, 10), value: 5 },
                    { range: r(10, Infinity), value: 10 }
                ),


                positiveScaleSizeType: [
                    cond,
                    [
                        minus,
                        [log10, [{ maxDataValue: _ }, [me]]],
                        [log10, [{ minPositiveValue: _ }, [me]]]
                    ],
                    o(
                        {
                            on: r(-Infinity, 1.5),
                            use: "small"
                        },
                        {
                            on: r(1.5, 11),
                            use: "medium"
                        },
                        {
                            on: r(11, Infinity),
                            use: "large"
                        }
                    )
                ],
                negativeScaleSizeType: [
                    cond,
                    [
                        minus,
                        [log10, [uminus, [{ minDataValue: _ }, [me]]]],
                        [log10, [uminus, [{ maxNegativeValue: _ }, [me]]]]
                    ],
                    o(
                        {
                            on: r(-Infinity, 1.5),
                            use: "small"
                        },
                        {
                            on: r(1.5, 11),
                            use: "medium"
                        },
                        {
                            on: r(11, Infinity),
                            use: "large"
                        }
                    )
                ],

                posMaxRoundEdge: [
                    cond,
                    [{ positiveScaleSizeType: _ }, [me]],
                    o(
                        {
                            on: "small",
                            use: [
                                last,
                                findRoundEdges(
                                    [{ minPositiveValue: _ }, [me]],
                                    [{ maxDataValue: _ }, [me]],
                                    [{ minUnit: _ }, [me]],
                                    [{ niceEdgeDivisorTable: _ }, [me]],
                                    [{ efficientToRoundRatio: _ }, [me]]
                                )
                            ]
                        },
                        {
                            on: "medium",
                            use: roundEdge(
                                [{ maxDataValue: _ }, [me]],
                                [{ minUnit: _ }, [me]],
                                [{ roundEdgeUpTable: _ }, [me]]
                            )
                        },
                        {
                            on: "large",
                            use: [
                                pow,
                                10,
                                [
                                    ceil,
                                    [
                                        plus,
                                        0.001,
                                        [
                                            log10,
                                            [{ maxDataValue: _ }, [me]]
                                        ]
                                    ]
                                ]
                            ]
                        },
                        {
                            on: n(),
                            use: [{ maxDataValue: _ }, [me]]
                        }
                    )
                ],

                negMinRoundEdge: [
                    cond,
                    [{ negativeScaleSizeType: _ }, [me]],
                    o(
                        {
                            on: "small",
                            use: [
                                first,
                                findRoundEdges(
                                    [{ minDataValue: _ }, [me]],
                                    [{ maxNegativeValue: _ }, [me]],
                                    [{ minUnit: _ }, [me]],
                                    [{ niceEdgeDivisorTable: _ }, [me]],
                                    [{ efficientToRoundRatio: _ }, [me]]
                                )
                            ]
                        },
                        {
                            on: "medium",
                            use: [
                                uminus,
                                roundEdge(
                                    [uminus, [{ minDataValue: _ }, [me]]],
                                    [{ minUnit: _ }, [me]],
                                    [{ roundEdgeUpTable: _ }, [me]]
                                )
                            ]
                        },
                        {
                            on: "large",
                            use: [
                                uminus,
                                [
                                    pow,
                                    10,
                                    [
                                        ceil,
                                        [
                                            plus,
                                            0.001,
                                            [
                                                log10,
                                                [
                                                    uminus,
                                                    [{ minDataValue: _ }, [me]]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        },
                        {
                            on: n(),
                            use: [{ minDataValue: _ }, [me]]
                        }
                    )
                ]
            }
        },

        {
            qualifier: { roundToOOM: true },

            // when the scale is "large", rounding is to the next integer
            //  power of 10 (up/down)
            context: {
                positiveScaleSizeType: "large",
                negativeScaleSizeType: "large"
            }
        },

        {
            qualifier: {
                ler_isNonNegative: false,
                ler_isNonPositive: false
            },

            context: {
                maxRoundEdge: [{ posMaxRoundEdge: _ }, [me]],
                minRoundEdge: [{ negMinRoundEdge: _ }, [me]]
            }
        },
        {
            qualifier: {
                ler_isNonNegative: true
            },

            context: {
                maxRoundEdge: [{ posMaxRoundEdge: _ }, [me]],
                minRoundEdge1: roundEdge(
                    [{ minPositiveValue: _ }, [me]],
                    [{ minUnit: _ }, [me]],
                    [{ roundEdgeDownTable: _ }, [me]]
                ),
                defaultMinRoundEdge: 0,
                minRoundEdge: [
                    cond,
                    [{ ler_isSingleSign: _ }, [me]],
                    o(
                        { on: true, use: [{ minRoundEdge1: _ }, [me]] },
                        { on: false, use: [{ defaultMinRoundEdge: _ }, [me]] }
                    )
                ]
            }
        },
        {
            qualifier: {
                ler_isNonPositive: true
            },

            context: {
                minRoundEdge: [{ negMinRoundEdge: _ }, [me]],
                maxRoundEdge1: [
                    uminus,
                    roundEdge(
                        [uminus, [{ maxNegativeValue: _ }, [me]]],
                        [{ minUnit: _ }, [me]],
                        [{ roundEdgeDownTable: _ }, [me]]
                    )
                ],
                maxRoundEdge: [
                    cond,
                    [{ ler_isSingleSign: _ }, [me]],
                    o(
                        { on: true, use: [{ maxRoundEdge1: _ }, [me]] },
                        { on: false, use: 0 }
                    )
                ]
            }
        }
    ),


    // this class facilitates handling the boundaries between a linear segment
    //  around zero and a log segment extending further away
    //
    // it suggests a power of 10 that would make for a 'fair' percentage of
    //  values within the linear segment
    //
    // plausible  powers of 10 are tested as the boundary; they are kept as
    //  reasonable candidates if the proportion of negative/positive
    //   values whose magnitude is greater than that power of 10
    //   compared with all negative/positive values is above
    //    'scaleLogProportionThreshold' defaulting to 0.95.
    // the power of 10 of highest magnitude surviving that test is picked as
    //  the 'computedPositiveZeroMarginValue'/'computedNegativeZeroMarginValue'
    //
    // the search is done for the positive and negative branches together
    //  if 'symmetricZeroNeighborhood' is true, and separately for each  branch
    //  otherwise
    //  
    //
    SegmentedLogZeroNeighborhood: o(
        {
            context: {
                positiveValues: [
                    Roo(0, Infinity), // FEDE: why is zero excluded here?
                    [{ values: _ }, [me]]
                ],

                negativeValues: [
                    Roo(-Infinity, 0),
                    [{ values: _ }, [me]]
                ],

                minPositiveValue: [min, [{ positiveValues: _ }, [me]]],
                maxNegativeValue: [max, [{ negativeValues: _ }, [me]]],

                /*
                computedPositiveZeroMarginValue: [
                    last,
                    [{ positiveZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                ],            

                computedNegativeZeroMarginValue: [
                    last,
                    [{ negativeZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                ],
                */

                // get the last element (highest) of positiveZeroMarginValueCandidatesComputedOnThreshold
                // except either of the following two cases occurs:
                // - there are no positive values (the user selected a maxValue>0 manually)
                // - maxValue is below the last of the positiveZeroMarginValueCandidatesComputedOnThreshold                                
                computedPositiveZeroMarginValue: [cond,
                    [and,
                        [{ positiveValues: _ }, [me]],
                        [greaterThan,
                            [{ maxValue: _ }, [me]],
                            [last,
                                [{ positiveZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                            ]
                        ]
                    ],
                    o(
                        {
                            on: true,
                            use: [
                                last,
                                [{ positiveZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                            ]
                        },
                        {
                            // this happens when the user sets the max value of the scale to
                            // a positive number when no positive values are present
                            // we take the end of the linear positive scale 3 oom lower than the maxValue
                            // e.g., if minValue is 10K the negative log scale ends at 10
                            on: false, use:
                            [pow, 10, [ceil, [minus, [log10, [{ maxValue: _ }, [me]]], 3]]],
                        }
                    )
                ],

                // get the last element (highest) of negativeZeroMarginValueCandidatesComputedOnThreshold
                // except either of the following two cases occurs:
                // - there are no negative values (the user selected a minValue<0 manually)
                // - minValue (in abs terms) is smallerThan the last of the negativeZeroMarginValueCandidatesComputedOnThreshold                                
                computedNegativeZeroMarginValue: [cond,
                    [and,
                        [{ negativeValues: _ }, [me]],
                        [greaterThan,
                            [uminus, [{ minValue: _ }, [me]]],
                            [last,
                                [{ negativeZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                            ]
                        ]
                    ],
                    o(
                        {
                            on: true,
                            use: [
                                last,
                                [{ negativeZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]
                            ]

                        },
                        {
                            // this happens when the user sets the min value of the scale to
                            // a negative number when no negative values are present
                            // we take the end of the linear negative scale 3 oom lower than the minValue
                            // e.g., if minValue is -10K the negative log scale ends at -10
                            on: false, use:
                            [pow, 10, [ceil, [minus, [log10, [uminus, [{ minValue: _ }, [me]]]], 3]]],
                        }
                    )
                ],

                positiveZeroMarginOOMs: [
                    sequence,
                    r(
                        [floor, [log10, [{ minPositiveValue: _ }, [me]]]],
                        [ceil, [log10, [{ maxValue: _ }, [me]]]]
                    )
                ],

                negativeZeroMarginOOMs: [
                    sequence,
                    r(
                        [
                            floor,
                            [log10, [uminus, [{ maxNegativeValue: _ }, [me]]]]
                        ],
                        [
                            ceil,
                            [log10, [uminus, [{ minValue: _ }, [me]]]]
                        ]
                    )
                ],

                zeroMarginOOMRefinement: o(1),

                // the "base candidates' are all the values that are initially
                //  considered as a boundary value between the linear section
                //  and the log section
                //
                positiveZeroMarginValueBaseCandidates: [
                    map,
                    [
                        defun, o("oom"),
                        [
                            mul,
                            [pow, 10, "oom"],
                            [{ zeroMarginOOMRefinement: _ }, [me]]
                        ]
                    ],
                    [{ positiveZeroMarginOOMs: _ }, [me]]
                ],

                negativeZeroMarginValueBaseCandidates: [
                    map,
                    [
                        defun, o("oom"),
                        [
                            mul,
                            [pow, 10, "oom"],
                            [{ zeroMarginOOMRefinement: _ }, [me]]
                        ]
                    ],
                    [{ negativeZeroMarginOOMs: _ }, [me]]
                ],

                // the "candidates" are derived from the "base candidates" by
                //  keeping only those values for which the ratio of elements
                //  in the logarithmic section compared to the reference set
                //  size exceeds the specified ratio
                //  ('scaleLogProportionThreshold')
                // the reference set may be the strictly positive values, the
                //  strictly negative values, or the (existing) non-zero values
                //  for positive/negative/symmetric candidates respectively
                //
                positiveZeroMarginValueCandidatesComputedOnThreshold: [
                    filter,
                    [
                        defun, o("margin"),
                        [
                            greaterThan,
                            [
                                div,
                                [
                                    size,
                                    [
                                        r(
                                            "margin",
                                            Infinity
                                        ),
                                        [{ positiveValues: _ }, [me]]
                                    ]
                                ],
                                [size, [{ positiveValues: _ }, [me]]]
                            ],
                            [{ scaleLogProportionThreshold: _ }, [me]]
                        ]
                    ],
                    [{ positiveZeroMarginValueBaseCandidates: _ }, [me]]
                ],

                negativeZeroMarginValueCandidatesComputedOnThreshold: [
                    filter,
                    [
                        defun, o("margin"),
                        [
                            greaterThan,
                            [
                                div,
                                [
                                    size,
                                    [
                                        r(
                                            -Infinity,
                                            [
                                                uminus,
                                                "margin"
                                            ]
                                        ),
                                        [{ values: _ }, [me]]
                                    ]
                                ],
                                [size, [{ negativeValues: _ }, [me]]]
                            ],
                            [{ scaleLogProportionThreshold: _ }, [me]]
                        ]
                    ],
                    [{ negativeZeroMarginValueBaseCandidates: _ }, [me]]
                ],

                scalePositiveZeroMarginValue: [
                    roundNotToZero,
                    [
                        first,
                        o(
                            [{ scaleZeroMarginValue: _ }, [me]],
                            [{ computedPositiveZeroMarginValue: _ }, [me]]
                        )
                    ],
                    [{ numberOfDigits: _ }, [me]]
                ],

                scaleNegativeZeroMarginValue: [
                    roundNotToZero,
                    [
                        first,
                        o(
                            [{ scaleZeroMarginValue: _ }, [me]],
                            [{ computedNegativeZeroMarginValue: _ }, [me]]
                        )
                    ],
                    [{ numberOfDigits: _ }, [me]]
                ],

                scaleLogProportionThreshold: 0.95
            }

        },

        {
            qualifier: { symmetricZeroNeighborhood: true },

            context: {
                //absValues: [Roo(0, Infinity), [abs, [{ values: _ }, [me]]]],
                maxPositiveValue: [max, [{ positiveValues: _ }, [me]]],
                minPositiveValue: [min, [{ positiveValues: _ }, [me]]],
                maxNegativeValue: [max, [{ negativeValues: _ }, [me]]],
                minNegativeValue: [min, [{ negativeValues: _ }, [me]]],

                //minSymmetricValue: [min, [{ absValues: _ }, [me]]],
                minSymmetricValue: [min,
                    o(
                        [{ minPositiveValue: _ }, [me]],
                        [uminus, [{ minNegativeValue: _ }, [me]]]
                    )
                ],

                //maxSymmetricValue: [max, [{ absValues: _ }, [me]]],
                maxSymmetricValue: [max,
                    o(
                        [{ maxPositiveValue: _ }, [me]],
                        [uminus, [{ maxNegativeValue: _ }, [me]]]
                    )
                ],

                symmetricZeroMarginOOMs: [
                    sequence,
                    r(
                        [floor, [log10, [{ minSymmetricValue: _ }, [me]]]],
                        [ceil, [log10, [{ maxSymmetricValue: _ }, [me]]]]
                    )
                ],

                symmetricZeroMarginValueBaseCandidates: [
                    map,
                    [
                        defun, o("oom"),
                        [
                            mul,
                            [pow, 10, "oom"],
                            [{ zeroMarginOOMRefinement: _ }, [me]]
                        ]
                    ],
                    [{ symmetricZeroMarginOOMs: _ }, [me]]
                ],

                symmetricZeroMarginValueCandidates: [
                    filter,
                    [
                        defun, o("margin"),
                        [
                            greaterThan,
                            [
                                div,
                                [plus,
                                    [size, [r("margin", Infinity), [{ positiveValues: _ }, [me]]]],
                                    [size, [r([uminus, "margin"], -Infinity), [{ negativeValues: _ }, [me]]]]
                                ],
                                [sum,
                                    [size, [{ positiveValues: _ }, [me]]],
                                    [size, [{ negativeValues: _ }, [me]]]
                                ]
                            ],
                            [{ scaleLogProportionThreshold: _ }, [me]]
                        ]
                    ],
                    [{ symmetricZeroMarginValueBaseCandidates: _ }, [me]]
                ],

                negativeZeroMarginValueCandidatesComputedOnThreshold: [
                    { symmetricZeroMarginValueCandidates: _ }, [me]
                ],
                positiveZeroMarginValueCandidatesComputedOnThreshold: [
                    { symmetricZeroMarginValueCandidates: _ }, [me]
                ]

            }
        }
    ),

    // this class generates the proper segmentList for a canvas that should
    //  appear 'logarithmic'
    //
    // if the canvas values do not traverse zero, a single 'log' segment is used
    //
    // for non-negative/non-positive canvasses, a single linear and a single
    //  log segment are created
    //
    // in the general case, 4 different segments are created: negative log,
    //   negative linear, positive linear and positive log.
    // This allows the linear negative/positive segments to span the same
    //  pixel size, while having each  take a different boundary value
    //  (zeroNeighborhood boundary value).
    // The defaults equate the pixel span of the linear segments with the
    //  pixel span of a single oom (separately for negative and positive)
    //
    SegmentedLogCanvasAdapter: o(
        {
            "class": "SegmentedLogZeroNeighborhood",

            context: {

                symmetricZeroNeighborhood: [
                    { logScaleSymmetricZeroNeighborhood: _ },
                    [me]
                ],

                isSingleSign: [
                    equal,
                    [sign, [{ minValue: _ }, [me]]],
                    [sign, [{ maxValue: _ }, [me]]]
                ],

                isNonNegative: [greaterThanOrEqual, [{ minValue: _ }, [me]], 0],
                isNonPositive: [lessThanOrEqual, [{ maxValue: _ }, [me]], 0],

                isNonSomething: [
                    or,
                    [{ isNonNegative: _ }, [me]],
                    [{ isNonPositive: _ }, [me]]
                ]
            }
        },

        {
            // all positive or all negative
            qualifier: { isSingleSign: true },
            context: {
                segmentList: {
                    type: "log",
                    segmentEndRatio: 1,
                    segmentEndValue: [{ maxValue: _ }, [me]]

                }
            }
        },

        {
            // common to 'log' scales that contain zero
            qualifier: { isSingleSign: false },
            context: {
                positiveOOMSpan: [
                    minus,
                    [log10, [{ maxValue: _ }, [me]]],
                    [
                        log10,
                        [{ scalePositiveZeroMarginValue: _ }, [me]]
                    ]
                ],
                negativeOOMSpan: [
                    minus,
                    [log10, [uminus, [{ minValue: _ }, [me]]]],
                    [
                        log10,
                        [{ scaleNegativeZeroMarginValue: _ }, [me]]
                    ]
                ]
            }
        },

        {
            // common to (non-negative or non-positive) with zeros
            qualifier: { isSingleSign: false, isNonSomething: true },
            context: {
                //    1 / (number-of-oom's-in-log-segment + 1)
                //
                scaleComputedZeroMarginRatio: [
                    div,
                    1,
                    [
                        plus,
                        1,
                        [{ oomSpan: _ }, [me]]
                    ]
                ],

                hasLogSegment: [
                    lessThan,
                    [{ scaleZeroMarginRatio: _ }, [me]],
                    1
                ],

                scaleZeroMarginValue: [
                    roundNotToZero,
                    [
                        first,
                        o(
                            [
                                { myFacet: { dataObj: { scaleZeroMarginValue: _ } } },
                                [me]
                            ],
                            [{ scaleComputedZeroMarginValue: _ }, [me]]
                        )
                    ],
                    [{ numberOfDigits: _ }, [me]]
                ],

                scaleZeroMarginRatio: [
                    first,
                    o(
                        [{ scaleConfiguredZeroMarginRatio: _ }, [me]],
                        [{ scaleComputedZeroMarginRatio: _ }, [me]]
                    )
                ]
            }
        },

        {
            // non-negative with zeros
            qualifier: { isNonNegative: true, isSingleSign: false },
            context: {
                oomSpan: [{ positiveOOMSpan: _ }, [me]],

                //scaleExtValue: [{ maxValue: _ }, [me]], //not used anywhere

                scaleComputedZeroMarginValue: [
                    { computedPositiveZeroMarginValue: _ },
                    [me]
                ],

                segmentList: o(
                    {
                        type: "linear",
                        segmentEndRatio: [
                            { scaleZeroMarginRatio: _ },
                            [me]
                        ],
                        segmentEndValue: [
                            { scaleZeroMarginValue: _ },
                            [me]
                        ],
                        markEndEdge: true
                    },
                    [
                        cond,
                        [{ hasLogSegment: _ }, [me]],
                        {
                            on: true,
                            use: {
                                type: "log",
                                segmentEndRatio: 1,
                                segmentEndValue: [{ maxValue: _ }, [me]]
                            }
                        }
                    ]
                )
            }
        },

        {
            // non-positive with zeros
            qualifier: { isNonPositive: true, isSingleSign: false },
            context: {

                oomSpan: [{ negativeOOMSpan: _ }, [me]],

                //scaleExtValue: [uminus, [{ minValue: _ }, [me]]], //not used anywhere

                scaleComputedZeroMarginValue: [
                    { computedNegativeZeroMarginValue: _ },
                    [me]
                ],

                segmentList: o(
                    [
                        cond,
                        [{ hasLogSegment: _ }, [me]],
                        {
                            on: true,
                            use: {
                                type: "log",
                                segmentEndRatio: [
                                    minus,
                                    1,
                                    [{ scaleZeroMarginRatio: _ }, [me]]
                                ],

                                segmentEndValue: [
                                    uminus,
                                    [
                                        { scaleZeroMarginValue: _ },
                                        [me]
                                    ]
                                ]
                            }
                        }
                    ],
                    {
                        type: "linear",
                        segmentEndRatio: 1, // end of scale
                        segmentEndValue: 0, // linear scale ends at 0
                        markStartEdge: true // show marker at starting point
                    }
                )
            }
        },

        {
            // a 'log' scale stretching over both negative and positive values
            qualifier: { isNonPositive: false, isNonNegative: false },
            context: {
                // allocate two linear segments around zero, of equal
                //  offset-size but independent value. The offset size
                //  is chosem such that it is (roughly) equal to the
                //  span of a single oom in a log segment

                // each linear segment is alloted a pixel-span of (roughly) a
                //  single oom (as in the log segments), thus the 2 added to
                //  the negative and positive oom count
                totalPseudoOOMSpan: [
                    plus,
                    [
                        plus,
                        [{ negativeOOMSpan: _ }, [me]],
                        [{ positiveOOMSpan: _ }, [me]]
                    ],
                    2
                ],

                // each linear segment spans
                // 1 / pseudoOOMSpan
                //  (as a ratio of the canvas pixel size)
                linearSegmentRatio: [
                    div,
                    1,
                    [{ totalPseudoOOMSpan: _ }, [me]]
                ],

                negativeLogSegmentRatio: [
                    div,
                    [{ negativeOOMSpan: _ }, [me]],
                    [{ totalPseudoOOMSpan: _ }, [me]]
                ],

                positiveLogSegmentRatio: [
                    div,
                    [{ positiveOOMSpan: _ }, [me]],
                    [{ totalPseudoOOMSpan: _ }, [me]]
                ],

                hasNegativeLogSegment: [
                    greaterThan,
                    [{ negativeLogSegmentRatio: _ }, [me]],
                    0
                ],

                hasPositiveLogSegment: [
                    greaterThan,
                    [{ positiveLogSegmentRatio: _ }, [me]],
                    0
                ],

                segmentList: o(
                    // negative log segment
                    [
                        cond,
                        [{ hasNegativeLogSegment: _ }, [me]],
                        {
                            on: true,
                            use: {
                                type: "log",
                                segmentEndRatio: [
                                    { negativeLogSegmentRatio: _ },
                                    [me]
                                ],
                                segmentEndValue: [
                                    uminus,
                                    [{ scaleNegativeZeroMarginValue: _ }, [me]]
                                ]
                            }
                        }
                    ],

                    // negative linear 0-neighborhood segment
                    {
                        type: "linear",
                        segmentEndRatio: [
                            plus,
                            [{ negativeLogSegmentRatio: _ }, [me]],
                            [{ linearSegmentRatio: _ }, [me]]
                        ],

                        segmentEndValue: 0,

                        markStartEdge: true,
                        markEndEdge: true
                    },

                    // positive linear 0-neighborhood segment
                    {
                        type: "linear",
                        segmentEndRatio: [
                            plus,
                            [{ negativeLogSegmentRatio: _ }, [me]],
                            [
                                mul,
                                2,
                                [{ linearSegmentRatio: _ }, [me]]
                            ]
                        ],
                        segmentEndValue: [
                            { scalePositiveZeroMarginValue: _ },
                            [me]
                        ],

                        markStartEdge: true,
                        markEndEdge: true
                    },

                    // positive log segment
                    [
                        cond,
                        [{ hasPositiveLogSegment: _ }, [me]],
                        {
                            on: true,
                            use: {
                                type: "log",
                                segmentEndRatio: 1,
                                segmentEndValue: [{ maxValue: _ }, [me]]
                            }
                        }
                    ]
                )
            }
        }
    ),

    // this is called 'segmented' only for uniformity; in fact, if the
    //  facet scale is defined to be linear, then there would only be a single
    //  segment
    SegmentedLinearCanvasAdapter: {
        context: {
            segmentList: {
                type: "linear",
                segmentEndRatio: 1,
                segmentEndValue: [{ maxValue: _ }, [me]]
            }
        }
    },

    //
    // this class is used by classes that have a linear segment possibly
    //  surrounded by logarithmic segments
    //
    // it defines segmentList, possing along only those segments which are
    //   actually required, and constructing it by the following labels:
    //
    //  scaleLinearMaxValue: boundary between linear segment and positive log
    //   segment
    //  scaleLinearMinValue: boundary between negative log segment and linear
    //   segment
    //  scalePreLinearLogRatio: proportion of canvas in pixels to be allotted to
    //    the negative log segment
    //  scalePostLinearLogRatio: same for the positive log segment
    //
    //  (minValue/MaxValue)
    //
    LogLinearLogCanvasAdapter: o(
        { // variant-controller
            qualifier: "!",
            "class": "SegmentedLogZeroNeighborhood",

            context: {
                segmentList: o(
                    [{ lllNegativeLogSegment: _ }, [me]],
                    [{ lllLinearSegment: _ }, [me]],
                    [{ lllPositiveLogSegment: _ }, [me]]
                ),

                hasLinearSegment: [
                    cond,
                    true,
                    o(
                        {
                            on: [
                                or,
                                [{ isNegativeLinearMinValue: true }, [me]],
                                [{ isPositiveLinearMaxValue: true }, [me]]
                            ],
                            use: true
                        },
                        { on: true, use: false }
                    )
                ],

                // no need for a negative log segment if the linear segment
                //  already covers all the negative values
                hasNegativeLogSegment: [
                    lessThan,
                    [{ minValue: _ }, [me]],
                    [{ scaleLinearMinValue: _ }, [me]]
                ],

                // no need for a positive log segment if the linear segment
                //  already covers all the positive values
                hasPositiveLogSegment: [
                    greaterThan,
                    [{ maxValue: _ }, [me]],
                    [{ scaleLinearMaxValue: _ }, [me]]
                ],

                isNegativeLinearMinValue: [
                    lessThan,
                    [{ minValue: _ }, [me]],
                    0
                ],

                isPositiveLinearMaxValue: [
                    greaterThan,
                    [{ maxValue: _ }, [me]],
                    0
                ]
            }
        },


        // if the range minValue..maxValue does not traverse 0, no need for
        //   a linear segment at all
        {
            qualifier: { isNegativeLinearMinValue: true },
            context: {
                hasLinearSegment: true
            }
        },

        {
            qualifier: { isPositiveLinearMaxValue: true },
            context: {
                hasLinearSegment: true
            }
        },

        // defaults, to be overridden by more specific variants
        {
            context: {
                lllNegativeLogRatio: 0,
                lllLinearRatio: 0,
                lllPositiveLogRatio: 0
            }
        },

        {
            qualifier: { hasLinearSegment: true },
            context: {
                lllLinearRatio: [
                    minus,
                    1,
                    [
                        plus,
                        [{ lllNegativeLogRatio: _ }, [me]],
                        [{ lllPositiveLogRatio: _ }, [me]]
                    ]
                ],

                lllLinearSegment: {
                    type: "linear",
                    segmentEndRatio: [
                        plus,
                        [{ lllNegativeLogRatio: _ }, [me]],
                        [{ lllLinearRatio: _ }, [me]]
                    ],
                    segmentEndValue: [{ scaleLinearMaxValue: _ }, [me]],
                    markStartEdge: true,
                    markEndEdge: true
                }
            }
        },

        {
            qualifier: { hasNegativeLogSegment: true },
            context: {
                scalePreLinearLogRatio: 0.1,

                lllNegativeLogRatio: [
                    first,
                    o(
                        [
                            { myFacet: { dataObj: { scalePreLinearLogRatio: _ } } },
                            [me]
                        ],
                        [{ scalePreLinearLogRatio: _ }, [me]]
                    )
                ],

                lllNegativeLogSegment: {
                    type: "log",
                    segmentEndRatio: [{ lllNegativeLogRatio: _ }, [me]],
                    segmentEndValue: [{ scaleLinearMinValue: _ }, [me]]
                }
            }
        },

        {
            qualifier: { hasPositiveLogSegment: true },
            context: {
                scalePostLinearLogRatio: 0.1,

                lllPositiveLogRatio: [
                    first,
                    o(
                        [
                            { myFacet: { dataObj: { scalePostLinearLogRatio: _ } } },
                            [me]
                        ],
                        [{ scalePostLinearLogRatio: _ }, [me]]
                    )
                ],

                lllPositiveLogSegment: {
                    type: "log",
                    segmentEndValue: [{ maxValue: _ }, [me]],
                    segmentEndRatio: 1
                }
            }
        }
    ),

    // a 'predominantly' linear scale, with a log segment towards +Infinity
    //
    // the linear segment starts at the facet def 'scaleMinValue', or at the
    //  minimal data value if not specified
    SegmentedLinearPlusCanvasAdapter: o(
        {
            "class": "SegmentedLinearPlusMinusCanvasAdapter",

            context: {
                scaleLinearMinValue: [{ minValue: _ }, [me]]
            }
        }
    ),

    // a 'predominantly' linear scale, with (possibly) log sections towards
    //  both Infinitys
    SegmentedLinearPlusMinusCanvasAdapter: o(
        {
            "class": o("GeneralArea", "LogLinearLogCanvasAdapter"),

            context: {

                //minDataValueIsZero: [equal, [{ minDataValue: _ }, [me]], 0],

                // each oom in the scale's range is multiplied by each member
                //  of this, in order to get the set of candidate values for
                //  setting the boundary between the linear segment and the
                //  log 'tail'
                //
                zeroMarginOOMRefinement: [
                    cond,
                    [{ linearPlusMinusBoundaryRoundingABTest: _ }, [me]],
                    o(
                        {
                            on: "Round",
                            use: o(1)
                        },
                        {
                            on: "Precise",
                            use: [sequence, r(1, 9)]
                        }
                    )
                ],

                // invert the logic of LogLinearLogCanvasAdapter:
                //  while that class guarantees that
                //  'positiveZeroMarginValueCandidatesComputedOnThreshold' are such that the
                //  ratio of items in the log count exceeds the specified
                //  ratio, here we want candidates where the (log-count) /
                //  (total-count) ratio is lower than the configured ratio 
                //
                computedPositiveZeroMarginValue: [
                    min,
                    [
                        n([{ positiveZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]),
                        [{ positiveZeroMarginValueBaseCandidates: _ }, [me]]
                    ]
                ],

                computedNegativeZeroMarginValue: [
                    min,
                    [
                        n([{ negativeZeroMarginValueCandidatesComputedOnThreshold: _ }, [me]]),
                        [{ negativeZeroMarginValueBaseCandidates: _ }, [me]]
                    ]
                ],

                scaleLogProportionThreshold: [
                    first,
                    o(
                        [
                            { myFacet: { dataObj: { scaleLogTailRatio: _ } } },
                            [me]
                        ],
                        [{ linearPlusMinusTailRatioABTest: _ }, [me]],
                        0.2
                    )
                ],

                userScaleLinearMinValue: [mergeWrite,
                    [{ currentViewWidgetDataObj: { userScaleLinearMinValue: _ } }, [me]],
                    //o()
                    [{ myFacet: { dataObj: { initUserScaleLinearMinValue: _ } } }, [me]]
                ],

                scaleLinearMinValue: [cond,
                    [{ userScaleLinearMinValue: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ userScaleLinearMinValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [round,
                                //[
                                //first,
                                //o(
                                [uminus,
                                    [{ computedNegativeZeroMarginValue: _ }, [me]]
                                ],
                                //)
                                //],
                                [{ numberOfDigits: _ }, [me]]
                            ]
                        }
                    )
                ],

                userScaleLinearMaxValue: [mergeWrite,
                    [{ currentViewWidgetDataObj: { userScaleLinearMaxValue: _ } }, [me]],
                    //o()
                    [{ myFacet: { dataObj: { initUserScaleLinearMaxValue: _ } } }, [me]]
                ],

                scaleLinearMaxValue: [cond,
                    [{ userScaleLinearMaxValue: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ userScaleLinearMaxValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [round,
                                //[
                                //first,
                                //o(
                                //[{ myFacet: { dataObj: { scaleLinearMaxValue: _ } } }, [me]],
                                [{ computedPositiveZeroMarginValue: _ }, [me]],
                                //)
                                //],
                                [{ numberOfDigits: _ }, [me]]
                            ]
                        }
                    )
                ],

                hasLinearSegment: [
                    greaterThan,
                    [{ scaleLinearMaxValue: _ }, [me]],
                    [{ scaleLinearMinValue: _ }, [me]]
                ]
            }
        },

        // if 'fakeZeroNegativeLogEdge' is true, the scale attempts to seem
        //  as if the negative log branch spans [minValue, 0)
        // in fact, of course, it doesn't, as the log scale cannot really
        //  approach 0. The appearence is approximated by:
        //
        // - making the negative-log-segment/linear-segment boundary very
        //    near to 0, specifically
        //      min( -minUnit, -approx(2*valueRangePerPixel) )
        //
        //
        // - separating the linear span to two linear segments, with 0 as the
        //   boundary. The first linear section, the one with negative values
        //   endinng at 0, does not have its edges marked.
        //   When a histogram is present, the negative bin is merged with the
        //    preceding bin (from the log tail)
        //
        {
            qualifier: { fakeZeroNegativeLogEdge: true },

            context: {
                scaleLinearMinValue: [
                    min,
                    o(
                        [uminus, [{ minUnit: _ }, [me]]],
                        [
                            uminus,
                            [
                                mul,
                                2,
                                [
                                    div,
                                    [{ scaleLinearMaxValue: _ }, [me]],
                                    [{ canvasPixelSize: _ }, [me]]
                                ]
                            ]
                        ]
                    )
                ],

                segmentList: o(
                    [{ lllNegativeLogSegment: _ }, [me]],
                    [{ lpmNegativeLinearSegment: _ }, [me]],
                    [{ lllLinearSegment: _ }, [me]],
                    [{ lllPositiveLogSegment: _ }, [me]]
                ),

                // default value overwritten below
                lpmNegativeLinearSegment: o()
            }
        },

        {
            qualifier: {
                fakeZeroNegativeLogEdge: true,
                hasNegativeLogSegment: true
            },

            context: {
                lpmNegativeLinearSegment: {
                    type: "linear",
                    segmentEndRatio: [{ lpmNegativeLinearRatio: _ }, [me]],
                    segmentEndValue: 0,
                    markStartEdge: false,
                    markEndEdge: true
                },

                lpmNegativeLinearRatio: [
                    plus,
                    [{ lllNegativeLogRatio: _ }, [me]],
                    [
                        mul,
                        [
                            div,
                            [abs, [{ scaleLinearMinValue: _ }, [me]]],
                            [
                                minus,
                                [{ scaleLinearMaxValue: _ }, [me]],
                                [{ scaleLinearMinValue: _ }, [me]]
                            ]
                        ],
                        [{ lllLinearRatio: _ }, [me]]
                    ]
                ],

                canvasPartitionValue: [
                    n([{ scaleLinearMinValue: _ }, [me]]),
                    o(
                        [
                            { children: { segment: { segmentCanvasPartition: _ } } },
                            [me]
                        ],
                        [{ canvasEndValue: _ }, [me]]
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // class to  be derived by an area that has a 'value' label by
    //  which it needs to be positioned on the canvas
    // override 'valPosPoint' if the attachment should not refer to the
    // center
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionOnCanvas: o(
        { // default
            "class": "PositionByCanvasOffset",
            context: {
                canvasOffset: [
                    [{ myCanvas: { valueToOffset: _ } }, [me]],
                    [{ value: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { ofVerticalElement: true },

            context: {
                valPosPoint: { type: "vertical-center" }
            }
        },

        {
            qualifier: { ofVerticalElement: false },

            context: {
                valPosPoint: { type: "horizontal-center" }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myCanvas
    // 2. valPosPoint
    // 3. canvasOffset
    // 4. highValAtLowHTMLLength: (VerticalSliderElement/HorizontalSliderElement define this, for example)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionByCanvasOffset: {
        context: {
            signedCanvasOffset: [
                mul,
                [{ canvasOffset: _ }, [me]],
                [cond,
                    [{ highValAtLowHTMLLength: _ }, [me]],
                    o(
                        { on: true, use: -1 },
                        { on: false, use: 1 }
                    )
                ]
            ]
        },
        position: {
            attachToCanvas: {
                point1: [{ myCanvas: { minValPoint: _ } }, [me]],
                point2: [{ valPosPoint: _ }, [me]],
                equals: [{ signedCanvasOffset: _ }, [me]]
            }
        }
    }

};
