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
// this file deals with Segmented Canvas - a 'combo-canvas' constructed by the
//  juxtaposition of a sequence of canvasses. Each canvas in the sequence is
//  considered a 'segment'.
// A Segmented Canvas is defined by:
//  global attributes:
//    - pixel size - how many pixels are available for the combo-canvas
//    - minUnit - any value should be a multiple of this size
//    - canvasStartValue - the lowest value represented by the canvas
//
//  per-segment attributes:
//    - segment ratio - what portion of the canvas should this segment take
//    - segment end-value (start-value is the end-value of the previous segment)
//
//
//
// A SegmentedCanvas exports two functions:
//
//  offsetToValue(offset)
//
//  valueToOffset(value)
//

/// round num to the nearest integer multiple of unit
function roundToUnit(num, unit) {
    return [mul, [round, [div, num, unit]], unit];
}

/// round num to the smallest integer multiple of unit larger than num
function ceilToUnit(num, unit) {
    var intQ = [ceil, [div, num, unit]];
    var ceilNum1 = [mul, intQ, unit];

    var ceilNum = [
        cond,
        [lessThan, ceilNum1, num],
        o(
            { on: true, use: [plus, ceilNum1, unit] },
            { on: false, use: ceilNum1 }
        )
    ];

    return ceilNum;
}

/// round num to the largest integer multiple of unit smaller than num
function floorToUnit(num, unit) {
    var intQ = [floor, [div, num, unit]];
    var floorNum1 = [mul, intQ, unit];

    var floorNum = [
        cond,
        [greaterThan, floorNum1, num],
        o(
            { on: true, use: [minus, floorNum1, unit] },
            { on: false, use: floorNum1 }
        )
    ];

    return floorNum;
}

/// return the smallest power of 10 at least as large as max(numList)
function findSupP10(numList, minUnit) {
    /// if numList is empty, don't let a valid minUnit  cover for it
    var maxNum = [
        cond,
        numList,
        o(
            { on: true, use: [max, o(numList, minUnit)] },
            { on: false, use: o() }
        )
    ];

    /// the power of 10 immediately above  maxNum
    var r10maxNum1 = [
        pow,
        10,
        [ceil, [minus, [log10, maxNum], 0.0001]]
    ];
    var r10maxNum = [
        cond,
        [lessThan, r10maxNum1, maxNum],
        o(
            { on: true, use: [mul, r10maxNum1, 10] },
            { on: false, use: r10maxNum1 }
        )
    ];

    return r10maxNum;
}

///
/// return the 'round supremum' of numList
///
/// a number is considered 'round' if it is a power of 10
///  divided by a member of niceDivisorList, that does not exceed the said power
///  of 10.
/// this number is also required to be a multiple of 'minUnit',
///  and an integer divisor of intMult - if it is specified
///
function findRoundSupremum(numList, niceDivisorList, minUnit, intMult) {
    var r10maxNum = findSupP10(numList, minUnit);

    /// candidates for being the round supremum: divisions  of r10maxNum by
    ///  niceDivisors
    var candidateList;

    candidateList = [div, r10maxNum, niceDivisorList];

    /// leave only candidates that are no less than numList, and that
    /// are an integer multiple of minUnit
    var filteredList = [
        filter,
        [defun, o("c"),
            [and,
                [lessThanOrEqual, [max, o(numList, minUnit)], "c"],
                [lessThan,
                    [abs,
                        [minus,
                            [div, "c", minUnit],
                            [round, [div, "c", minUnit]]
                        ]
                    ],
                    0.0001
                ]
            ]
        ],
        candidateList
    ];

    var filtered2List;
    if (typeof (intMult) === "undefined") {
        filtered2List = filteredList;
    } else {
        filtered2List = [
            filter,
            [defun, o("c2"),
                [lessThan,
                    [abs,
                        [minus,
                            [div, intMult, "c2"],
                            [round, [div, intMult, "c2"]],
                        ]
                    ],
                    0.0001
                ]
            ],
            filteredList];
    }

    /// this is the selected rounding of maxNum
    var roundSup = [min, filtered2List];

    return roundSup;
}

/// find a value in the range [minDelta, maxDelta], as large as possible, which
///  is an integer divisor of alignmentDelta.
/// The value should be an integer multiple of 'minUnit.
/// The 'integer multiple pf minUnit' requirement need only be exact up to
///  'precision', so that if x is a candidate:
///    * minDelta <= x <= maxDelta
///    * (alignmentDelta / x) is an integer
///  and it holds that
///    floorToUnit(x, minUnit) / ceilToUnit(x, minUnit) >= precision
///  then x is good enough
///
/// if it holds that
///
///   (alignmentDelta / (alignmentDelta + maxDelta)) * (maxDelta / minUnit)
///
/// is bigger than
///
///  1/(1-precision
///
/// then our first guess, ceil(alignmentDelta / maxDelta)
///  is used without further verificationns (as it is bound to pass the
///  required precision test)
///
/// otherwise, the candidates are the divisors in the range
///
///  ceil(alignmentDelta / maxDelta) .. floor(alignmentDelta / minDelta)
///
/// and each divisor is tested for passing the precision threshold.
///
/// the first divisor to pass the test is selected.
///
/// if no candidate passes the test, then ceil(alignmentDelta / maxDelta) is used
///   anyway
///
function findMaxSmallerDivisor(minDelta, maxDelta, minUnit, alignmentDelta,
    precision) {
    var rangeStart = [ceil, [minus, [div, alignmentDelta, maxDelta], 0.0001]];
    var rangeEnd = [floor, [plus, [div, alignmentDelta, minDelta], 0.0001]];

    var seq = [sequence, r(rangeStart, rangeEnd)];

    var filterFunc = [
        defun,
        o("v"),
        [
            lessThanOrEqual,
            [
                minus,
                1,
                [div, floorToUnit("v", minUnit), ceilToUnit("v", minUnit)]
            ],
            precision
        ]
    ];

    var candidates = [
        filter,
        filterFunc,
        seq
    ];

    var useRangeStartCriterion = [
        greaterThan,
        [
            mul,
            [div, alignmentDelta, [plus, alignmentDelta, maxDelta]],
            [div, maxDelta, minUnit]
        ],
        [div, 1, [minus, 1, precision]]
    ];

    var divisor = [
        cond,
        true,
        o(
            { on: useRangeStartCriterion, use: rangeStart },
            { on: [empty, candidates], use: rangeStart },
            { on: true, use: [first, candidates] }
        )
    ];

    return divisor;
}

var classes = {

    //////////////////////////////////////////////////////////////////////////////
    /// API:
    /// 1. segmentList: an o/s of
    ///    type
    ///    segmentEndRatio
    ///    segmentEndValue
    /// 2. minValue (assigned to canvasStartValue)
    /// 3. canvasPixelSize
    ///
    /// A SegmentedCanvas generates an area per segment, 
    /// in which the per-segment computations are performed.
    //////////////////////////////////////////////////////////////////////////////
    BaseSegmentedCanvas: {
        "class": "GeneralArea",
        context: {
            canvasStartValue: [{ minValue: _ }, [me]],

            ///
            /// return the offset (in pixels, from the canvas start-point.
            /// finds the associated segment area in 'children.segment',
            /// identified by its value-range, and defer to
            /// 'segmentValueToOffset'
            /// only defined for values within the canvas range
            ///
            valueToOffset: [
                defun,
                o("value"),
                [
                    [{ segmentValueToOffset: _ }, [me]],
                    [ // which segment 
                        { segmentValueRange: "value" },
                        [{ children: { segment: _ } }, [me]]
                    ],
                    "value"
                ]
            ],

            ///
            /// return the offset in pixels from the canvas start-point given
            /// a child 'segment' area and the value
            ///
            /// defers to the segment's own 'valueToOffset' function
            ///
            segmentValueToOffset: [
                defun,
                o("segment", "value"),
                [
                    [{ valueToOffset: _ }, "segment"],
                    "value"
                ]
            ]
        },
        // needed for segment children:
        // - canvasPixelSize
        children: {
            /// create an area per each segment in 'segmentList'
            segment: {
                data: [{ segmentList: _ }, [me]],
                description: {
                    "class": "BaseCanvasSegment"
                    // needs to define valueToOffset and segmentValueRange
                }
            }
        }
    },

    //////////////////////////////////////////////////////////////////////////////
    // API: see BaseCanvas
    //////////////////////////////////////////////////////////////////////////////
    ExportedSegmentedCanvas: {
        "class": "BaseSegmentedCanvas"
    },

    //////////////////////////////////////////////////////////////////////////////
    // API: see BaseCanvas
    //////////////////////////////////////////////////////////////////////////////
    SegmentedCanvas: {
        "class": "BaseSegmentedCanvas",
        context: {

            ///
            /// return the value associated by the canvas with a specific offset.
            /// defined only for valid canvas offsets.
            /// identifies the child segment using its offset-range, and
            /// defers to 'segmentOffsetToValue'
            ///
            offsetToValue: [
                defun,
                o("offset"),
                [
                    [{ segmentOffsetToValue: _ }, [me]],
                    [
                        { segmentOffsetRange: [round, "offset"] },
                        [{ children: { segment: _ } }, [me]]
                    ],
                    [round, "offset"]
                ]
            ],

            ///
            /// returns the value associated by the child area 'segment' with
            /// the given 'offset'. The 'offset' is assumed to be within that
            /// segment offset-range.
            /// defers to the segment's own 'offsetToValue' function
            ///
            segmentOffsetToValue: [
                defun,
                o("segment", "offset"),
                [
                    [{ offsetToValue: _ }, "segment"],
                    "offset"
                ]
            ],

            canvasEndValue: [
                { segmentEndValue: _ },
                [last, [{ segmentList: _ }, [me]]]
            ],

            ///
            /// the value range of the canvas
            canvasRange: r(
                [{ canvasStartValue: _ }, [me]], // this is not defined internally (defined in SegmentedCanvasAdapter)
                [{ canvasEndValue: _ }, [me]] // this is defined internally
            )
        },
        children: {
            /// create an area per each segment in 'segmentList'
            segment: {
                //data: defined in BaseSegmentedCanvas
                description: {
                    "class": "CanvasSegment"
                }
            }
        }

    },

    //////////////////////////////////////////////////////////////////////////////
    // Needed by BaseSegmentedCanvas:
    // 1. valueToOffset
    // 2. segmentValueRange
    //////////////////////////////////////////////////////////////////////////////
    BaseCanvasSegment: o(
        {
            //default
            "class": "GeneralArea",
            context: {
                dataObj: [{ param: { areaSetContent: _ } }, [me]],
                segmentEndRatio: [{ dataObj: { segmentEndRatio: _ } }, [me]],
                segmentEndValue: [{ dataObj: { segmentEndValue: _ } }, [me]],

                scaleType: [{ dataObj: { type: _ } }, [me]],

                isFirstSegment: [not, [prev]],
                isLastSegment: [not, [next]],

                segmentEndOffset: [
                    round,
                    [
                        mul,
                        [{ segmentEndRatio: _ }, [me]],
                        [{ canvasPixelSize: _ }, [embedding]]
                    ]
                ],

                /// (endValue - startValue)
                segmentValueDelta: [
                    minus,
                    [{ segmentEndValue: _ }, [me]],
                    [{ segmentStartValue: _ }, [me]]
                ],

                /// (endOffset - startOffset)
                segmentOffsetDelta: [
                    minus,
                    [{ segmentEndOffset: _ }, [me]],
                    [{ segmentStartOffset: _ }, [me]]
                ]

            }
        },

        /// the first segment has ranges which are closed on both sides
        /// (both the offset range and the value range)
        /// the rest of the segment use ranges which are open on the start-point
        /// and closed on the end-point
        ///
        {
            qualifier: { isFirstSegment: true },
            context: {
                segmentStartValue: [{ canvasStartValue: _ }, [embedding]],
                segmentStartOffset: 0,

                segmentValueRange: r(
                    [{ segmentStartValue: _ }, [me]],
                    [{ segmentEndValue: _ }, [me]]
                ),
                segmentOffsetRange: r(
                    [{ segmentStartOffset: _ }, [me]],
                    [{ segmentEndOffset: _ }, [me]]
                )
            }
        },

        {
            qualifier: { isFirstSegment: false },
            context: {
                segmentStartValue: [{ segmentEndValue: _ }, [prev]],
                segmentStartOffset: [{ segmentEndOffset: _ }, [prev]],

                segmentValueRange: Roc(
                    [{ segmentStartValue: _ }, [me]],
                    [{ segmentEndValue: _ }, [me]]
                ),
                segmentOffsetRange: Roc(
                    [{ segmentStartOffset: _ }, [me]],
                    [{ segmentEndOffset: _ }, [me]]
                )

            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "BaseLinearCanvasSegment"
        },
        {
            qualifier: { scaleType: "log" },
            "class": "BaseLogCanvasSegment"
        }
    ),

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    BaseLinearCanvasSegment: {
        "class": "GeneralArea",
        context: {
            // needed by valueToOffset
            segmentRatio: [
                div,
                [{ segmentOffsetDelta: _ }, [me]], // defined in BaseCanvasSegment
                [{ segmentValueDelta: _ }, [me]] // defined in BaseCanvasSegment
            ],
            valueToOffset: [
                defun,
                o("value"),
                [
                    plus,
                    [
                        round,
                        [
                            mul,
                            [minus, "value", [{ segmentStartValue: _ }, [me]]], // defined in BaseCanvasSegment
                            [{ segmentRatio: _ }, [me]] // defined internally
                        ]
                    ],
                    [{ segmentStartOffset: _ }, [me]] // defined in BaseCanvasSegment
                ]
            ]
        }
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    BaseLogCanvasSegment: o(
        {
            // default
            "class": "GeneralArea",

            context: {
                // variant controller
                isPositive: [
                    greaterThan,
                    [{ segmentStartValue: _ }, [me]],
                    0
                ],

                // needed by segmentLogDelta
                logMinValue: [log10, [{ minAbsValue: _ }, [me]]],
                logMaxValue: [log10, [{ maxAbsValue: _ }, [me]]],

                // needed by pixelPerOOM and referenceOffset
                segmentLogDelta: [
                    minus,
                    [{ logMaxValue: _ }, [me]],
                    [{ logMinValue: _ }, [me]]
                ],

                // needed by logDeltaToRelOffset
                pixelPerOOM: [
                    div,
                    [{ segmentOffsetDelta: _ }, [me]],
                    [{ segmentLogDelta: _ }, [me]]
                ],


                /// referenceLogValue and referenceOffset are a pair of a value
                ///  and an offset which are 'about right' by the uniform
                ///  mapping, and such that 'referenceLogValue' is an integer
                ///  in (or near) the segment's log10 range. The two are
                ///  fixed as matching, and are used as a basis for the
                ///  conversions offset->value, value->offset
                ///  
                /// note that the reference value could be outside
                ///  the value range (if the range is less than 1 oom)
                // needed by referenceOffset and valueToOffset
                referenceLogValue: [
                    ceil,
                    [
                        minus,
                        [{ logMinValue: _ }, [me]], //defined internally
                        0.0001
                    ]
                ],

                // needed by valueToOffset
                referenceOffset: [
                    round,
                    [
                        plus,
                        [{ minOffset: _ }, [me]], // defined internally
                        [
                            mul,
                            [
                                mul,
                                [{ logSign: _ }, [me]], //defined internally
                                [{ segmentOffsetDelta: _ }, [me]] //defined internnaly (BaseCanvasSegment)
                            ],
                            [
                                div,
                                [
                                    minus,
                                    [{ referenceLogValue: _ }, [me]], //defined internally
                                    [{ logMinValue: _ }, [me]] //defined internally
                                ],
                                [{ segmentLogDelta: _ }, [me]] //defined internally
                            ]
                        ]
                    ]
                ],

                /// find the relative offset given a 'logDelta'
                // needed by valueToOffset
                logDeltaToRelOffset: [
                    defun,
                    o("logDelta"),
                    [
                        round,
                        [
                            mul,
                            [{ logSign: _ }, [me]], //defined internally
                            [
                                mul,
                                "logDelta",
                                [{ pixelPerOOM: _ }, [me]] //defined internally
                            ]
                        ]
                    ]
                ],

                /// map a value in the segment's value-range to an offset
                ///
                /// use 'logDeltaToRelOffset' to find the relative offset
                ///  given a 'logDelta', and add the result to
                ///  the referenceOffset
                ///
                valueToOffset: [
                    defun,
                    o("value"),
                    [
                        round,
                        [
                            plus,
                            [{ referenceOffset: _ }, [me]], //defined internally
                            [
                                [{ logDeltaToRelOffset: _ }, [me]], //defined internally
                                [
                                    minus,
                                    [
                                        log10,
                                        [mul, [{ logSign: _ }, [me]], "value"] //defined internally
                                    ],
                                    [{ referenceLogValue: _ }, [me]] //defined internally
                                ]
                            ]
                        ]
                    ]
                ],
            }
        },
        {
            qualifier: { isPositive: true },
            context: {
                minAbsValue: [{ segmentStartValue: _ }, [me]], //needed by base
                maxAbsValue: [{ segmentEndValue: _ }, [me]], //needed by base
                minOffset: [{ segmentStartOffset: _ }, [me]], //needed by base
                logSign: 1 //needed by base
            }
        },
        {
            qualifier: { isPositive: false },
            context: {
                minAbsValue: [uminus, [{ segmentEndValue: _ }, [me]]], //needed by base
                maxAbsValue: [uminus, [{ segmentStartValue: _ }, [me]]], //needed by base             
                minOffset: [{ segmentEndOffset: _ }, [me]], //needed by base
                logSign: -1 //needed by base
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////////////
    /// this class is used by each segment within a segmented-canvas
    /// its inputs are its param.areaSetContent, which defines
    ///  type: 'log'/'liner'
    ///  segmentEndRatio: at what ratio of the canvas does this segment end
    ///  segmentEndValue: what is the value at the end of this segment
    /// in addition, a CanvasSegment draws values from its embedding and from
    ///  its [prev] segment, notably:
    ///
    /// embedding.minUnit (the minimal sensible resolution for values)
    /// embedding.canvasPixelSize
    /// embedding.canvasStartValue
    /// embedding.niceDivisorList - for linear segments - which divisors of 10
    ///             are to be used when there's room for sub-dividing tick-marks
    ///             if '4' is a 'nice-divisor' than (2.5, 5, 7.5, 10) is
    ///             allowed as a sub-division of 10 (and also
    ///             (250,500,750,1000) as a sub-division of 1000)
    ///
    /// embedding.primaryLabelSpacing - minimal pixel offset between two adjacent
    ///              primary label tickmarks
    /// embedding.secondaryLabelSpacing - likewise for secondary label tickmarks
    /// embedding.unlabeledSpacing - likewise for unlabeled tickmarks
    ///
    /// prev.segmentEndValue - used as this segment's startValue
    /// prev.segmentEndOffset - used as this segment's startOffset
    ///           
    /// markStartEdge/markEndEdge are used to force displaying start/end edge of the segment  
    //////////////////////////////////////////////////////////////////////////////
    CanvasSegment: o(
        {
            "class": "BaseCanvasSegment",
            context: {

                minUnit: [{ minUnit: _ }, [embedding]],

                ///
                /// force end-point offsets to return exact end-point
                ///  values
                /// otherwise, defer to 'intOffsetToValue'
                ///
                offsetToValue: [
                    defun,
                    o("offset"),
                    [
                        cond,
                        "offset",
                        o(
                            {
                                on: [{ segmentStartOffset: _ }, [me]],
                                use: [{ segmentStartValue: _ }, [me]]
                            },
                            {
                                on: [{ segmentEndOffset: _ }, [me]],
                                use: [{ segmentEndValue: _ }, [me]]
                            },
                            {
                                on: true,
                                use: [
                                    [{ intOffsetToValue: _ }, [me]],
                                    "offset"
                                ]
                            }
                        )
                    ]
                ]
            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "LinearCanvasSegment"
        },
        {
            qualifier: { scaleType: "log" },
            "class": "LogCanvasSegment"
        }
    ),

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    LinearCanvasSegment: {
        "class": "BaseLinearCanvasSegment",
        context: {

            niceDivisorList: [{ niceDivisorList: _ }, [embedding]],
            niceDivisorPrecision: [{ niceDivisorPrecision: _ }, [embedding]],

            /// the average change in value per pixel
            valueRangePerPixel: [
                div,
                [{ segmentValueDelta: _ }, [me]],
                [{ segmentOffsetDelta: _ }, [me]]
            ],

            /// the smallest 'round' (per niceDivisorList) value, at least as
            ///  large as 'valueRangePerPixel', and an integer multiple
            ///  of 'minUnit'
            /// the delta between two adjacent pixels is either '0' or
            ///  'pixelValueDelta'
            ///
            pixelValueDelta: findRoundSupremum(
                [{ valueRangePerPixel: _ }, [me]],
                [{ niceDivisorList: _ }, [me]],
                [{ minUnit: _ }, [me]]
            ),

            /// 'round' the raw linear interpolation result so that it is an
            ///   integer multiple of 'pixelValueDelta'
            intOffsetToValue: [
                defun,
                o("offset"),
                roundToUnit(
                    [
                        plus,
                        [{ segmentStartValue: _ }, [me]],
                        [
                            mul,
                            [{ valueRangePerPixel: _ }, [me]],
                            [
                                minus,
                                "offset",
                                [{ segmentStartOffset: _ }, [me]]
                            ]
                        ]
                    ],
                    [{ pixelValueDelta: _ }, [me]]
                )
            ]
        }
    },

    //////////////////////////////////////////////////////////////////////////////
    /// a canvas segment which uses a logarithmic scale
    /// it is assumed to be either all positive or all negative
    /// 'logSign' is '1' for all positive and '-1' for all negative
    ///
    /// for all negative, the values are reflected to positive
    ///
    ///  offsetToValue is forced to 'allocate' a pixel which would be
    ///    mapped to each round oom (order-of-magnitude) within the range (with
    ///    the possible exceptions of the two oom's adjacent to the end-points).
    ///  This makes pixel distribution not quite uniform - there may be
    ///   significant distortions in the immediate neighborhood of integer
    ///   powers of 10.
    ///  Also, a segment where there are too many powers of 10's compared with
    ///   pixels would break this implementation. A different implementation
    ///   should be used when there are less than, say, 3x more pixels than
    ///   ooms.
    //////////////////////////////////////////////////////////////////////////////
    LogCanvasSegment: {
        // default
        "class": "BaseLogCanvasSegment",
        context: {

            /// the integer powers of 10 within the segment value range
            oomInSegment: [
                sequence,
                r(
                    roundToUnit([{ logMinValue: _ }, [me]], 0.0001),
                    roundToUnit([{ logMaxValue: _ }, [me]], 0.0001)
                )
            ],

            /// (possibly) adding another power of 10 just below and just
            ///  above the range
            /// useful when adding sub-division tick-marks above each oom
            ///
            inclusiveOOMInSegment: [
                sequence,
                r(
                    [floor, [{ logMinValue: _ }, [me]]],
                    [ceil, [{ logMaxValue: _ }, [me]]]
                )
            ],

            ///
            /// find the value this segment associates with a given
            ///  offset
            /// the offset is divided by pixelPerOOM, and split
            ///  to 'intOOM' and the remainder ('pixelOff'). A 'pixelOff'
            ///  which is close enough to 0, or which is close enough to
            ///  pixelPerOOM, is rounded to 0 (with carry if applicable).
            ///  The remiander is then rounded.
            /// The aim is to ensure that there's a pixel offset which is
            ///  associated with the exact oom value, and also to try to
            ///  have 'fractional values' repeat in all ooms (so that if we
            ///  have 1, 4.5, 7.2, 8.3, 9.1 we'll alsdo have
            ///       10, 45, 72, 83, 91
            ///  etc)
            ///
            intOffsetToValue: [
                defun,
                o("offset"),
                [
                    [{ relOffsetToValue: _ }, [me]],
                    [
                        mul,
                        [
                            minus,
                            "offset",
                            [{ referenceOffset: _ }, [me]]
                        ],
                        [{ logSign: _ }, [me]]
                    ]
                ]
            ],

            /// find the value give a relative-offset (an offset from the
            ///  reference-offset)
            ///
            /// call 'relOffsetToValue1 with "relOff" and "intPPO" - the
            ///  integer number of 'pixelPerOffset's in 'relOff'
            ///
            relOffsetToValue: [
                defun,
                o("relOff"),
                [
                    [{ relOffsetToValue1: _ }, [me]],
                    "relOff",
                    [
                        floor,
                        [
                            plus,
                            [div, "relOff", [{ pixelPerOOM: _ }, [me]]],
                            0.0001
                        ]
                    ]
                ]
            ],

            /// call relOffsetToValue2 with the integer div ('intPPO') and
            ///  the remiander ('pixelOff')
            relOffsetToValue1: [
                defun,
                o("relOff", "intPPO"),
                [
                    [{ relOffsetToValue2: _ }, [me]],
                    "intPPO",
                    [
                        minus,
                        "relOff",
                        [
                            mul,
                            "intPPO",
                            [{ pixelPerOOM: _ }, [me]]
                        ]
                    ]
                ]
            ],

            /// if pixelOff is close enough to pixelPerOOM, wrap to the
            ///  next higher 'intPPO' (with a 0 pixelOff)
            /// otherwise, call relOffsetToValue3 with the
            ///  rounded-to-closest-pixel-offset pixelOff
            relOffsetToValue2: [
                defun,
                o("intPPO", "pixelOff"),
                [
                    cond,
                    [
                        greaterThan,
                        "pixelOff",
                        [minus, [{ pixelPerOOM: _ }, [me]], 0.6]
                    ],
                    o(
                        {
                            on: true,
                            use: [
                                [{ relOffsetToValue3: _ }, [me]],
                                [plus, "intPPO", 1],
                                0
                            ]
                        },
                        {
                            on: false,
                            use: [
                                [{ relOffsetToValue3: _ }, [me]],
                                "intPPO",
                                [round, "pixelOff"]
                            ]
                        }
                    )
                ]
            ],

            ///
            /// compute the exponent, adding 'referenceLogValue',
            ///  'intPPO' and (pixelOff/pixelPerOOM), and adjusting the
            ///  result sign
            relOffsetToValue3: [
                defun,
                o("intPPO", "pixelOff"),
                [
                    mul,
                    [{ logSign: _ }, [me]],
                    [
                        pow,
                        10,
                        [
                            plus,
                            [
                                plus,
                                "intPPO",
                                [
                                    div,
                                    "pixelOff",
                                    [{ pixelPerOOM: _ }, [me]]
                                ]
                            ],
                            [{ referenceLogValue: _ }, [me]]
                        ]
                    ]
                ]
            ]
        }
    },

    ///////////////////////////////////////////////////////////////////
    // Base version of SegmentedScaledCanvas (with only edgeMarkValue)
    ///////////////////////////////////////////////////////////////////
    BaseSegmentedScaledCanvas: {
        "class": o("GeneralArea", "BaseSegmentedCanvas"),
        context: {
            edgeMarkValue: [
                _,
                [
                    identify,
                    _,
                    [
                        { children: { segment: { edgeMarkValue: _ } } },
                        [me]
                    ]
                ]
            ],
            scaleMinValue: [min, [{ edgeMarkValue: _ }, [me]]],
            scaleMaxValue: [max, [{ edgeMarkValue: _ }, [me]]],

            primaryLabelValue: [
                { children: { segment: { primaryLabelValue: _ } } },
                [me]
            ],

            secondaryLabelValue: [
                { children: { segment: { secondaryLabelValue: _ } } },
                [me]
            ],

            unlabeledValue: [
                { children: { segment: { unlabeledValue: _ } } },
                [me]
            ],
        },
        children: {
            segment: {
                /// data: provided by "SegmentedCanvas"
                description: {
                    "class": "BaseScaledCanvasSegment"
                }
            }
        }
    },

    ///
    /// a SegmentedScaledCanvas is a SegmentedCanvas with scale tickmarks
    ///
    /// there are three levels of tickmarks: primary-label, secondary-label,
    ///  and unlabeled.
    ///
    /// the per-segment computation of tickmarks is done in the child 'segment'
    ///  embedded areas. the results are collated in this class:
    ///
    /// primaryLabelValue: overall primary label values
    /// secondaryLabelValue: overall secondary label values
    /// unlabeledValue: overall unlabeled values
    ///
    /// the function 'offsetToRoundValue' returns the value of the tickmark
    ///  closest to the given offset
    ///
    SegmentedScaledCanvas: {
        //"class": o("GeneralArea", "SegmentedCanvas"),
        "class": o("BaseSegmentedScaledCanvas", "SegmentedCanvas"),
        context: {
            // edgeMarkValue defined in BaseSegmentedScaledCanvas

            /// how many precision (post-decimal point) digits are required
            ///  in order to fully/correctly display the edge  values;
            ///  the max over all segments
            edgeMarkPrecision: [
                max,
                [
                    { children: { segment: { edgeMarkPrecision: _ } } },
                    [me]
                ]
            ],

            scaleMinValue: [min, [{ edgeMarkValue: _ }, [me]]],
            scaleMaxValue: [max, [{ edgeMarkValue: _ }, [me]]],
            scaleEdgeValue: o(
                [{ scaleMinValue: _ }, [me]],
                [{ scaleMaxValue: _ }, [me]]
            ),

            /// how many precision digits are required in order to fully display
            ///  primary label values; the max over all segments
            primaryLabelPrecision: [
                max,
                [
                    { children: { segment: { primaryLabelPrecision: _ } } },
                    [me]
                ]
            ],

            /// how many precision digits are required in order to fully display
            ///  secondary label values; the max over all segments
            secondaryLabelPrecision: [
                max,
                [
                    { children: { segment: { secondaryLabelPrecision: _ } } },
                    [me]
                ]
            ],

            tickmarkValue: o(
                [{ edgeMarkValue: _ }, [me]],
                [{ primaryLabelValue: _ }, [me]],
                [{ secondaryLabelValue: _ }, [me]],
                [{ unlabeledValue: _ }, [me]]
            ),

            offsetToRoundValue: [
                defun, o("offset"),
                [
                    [{ findNearestTickmark: _ }, [me]],
                    [
                        [{ offsetToValue: _ }, [me]],
                        "offset"
                    ],
                    "offset"
                ]
            ],

            findNearestTickmark: [
                defun, o("value", "offset"),
                [
                    [{ findNearestTickmark2: _ }, [me]],
                    [max, [r(-Infinity, "value"), [{ tickmarkValue: _ }, [me]]]],
                    [min, [r("value", Infinity), [{ tickmarkValue: _ }, [me]]]],
                    "offset"
                ]
            ],

            findNearestTickmark2: [
                defun, o("tickBelowValue", "tickAboveValue", "offset"),
                [
                    [{ findNearestTickmark3: _ }, [me]],
                    "offset",
                    [
                        [{ valueToOffset: _ }, [me]],
                        "tickBelowValue"
                    ],
                    [
                        [{ valueToOffset: _ }, [me]],
                        "tickAboveValue"
                    ],
                    "tickBelowValue",
                    "tickAboveValue"
                ]
            ],

            findNearestTickmark3: [
                defun,
                o(
                    "offset",
                    "tickBelowOffset", "tickAboveOffset",
                    "tickBelowValue", "tickAboveValue"
                ),
                [
                    cond,
                    [
                        greaterThan,
                        [minus, "tickAboveOffset", "offset"],
                        [minus, "offset", "tickBelowOffset"]
                    ],
                    o(
                        { on: true, use: "tickBelowValue" },
                        { on: false, use: "tickAboveValue" }
                    )
                ]
            ]
        },

        children: {
            segment: {
                /// data: provided by "SegmentedCanvas"
                description: {
                    "class": "ScaledCanvasSegment"
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////
    // Base version of ScaledCanvasSegment
    ///////////////////////////////////////////////////////////////////
    BaseScaledCanvasSegment: {
        "class": "GeneralArea",

        /// start edge of first segment and end edge of last segment
        ///  default to showing their edges
        ///
        context: {
            hasStartEdgeMark: [
                or,
                [{ dataObj: { markStartEdge: _ } }, [me]],
                [
                    and,
                    [{ isFirstSegment: _ }, [me]],
                    [not, [{ markStartEdge: false }, [me]]]
                ]
            ],

            hasEndEdgeMark: [
                or,
                [{ dataObj: { markEndEdge: _ } }, [me]],
                [
                    and,
                    [{ isLastSegment: _ }, [me]],
                    [not, [{ markEndEdge: false }, [me]]]
                ]
            ],

            edgeMarkValue: o(
                [
                    cond,
                    [{ hasStartEdgeMark: _ }, [me]],
                    { on: true, use: [{ segmentStartValue: _ }, [me]] }
                ],
                [
                    cond,
                    [{ hasEndEdgeMark: _ }, [me]],
                    { on: true, use: [{ segmentEndValue: _ }, [me]] }
                ]
            )
        }
    },

    ///
    /// a single segment in a SegmentedScaledCanvas
    /// add tickmarks to a CanvasSegment
    ///
    ScaledCanvasSegment: o(
        {
            "class": "BaseScaledCanvasSegment",
            //"class": "GeneralArea",

            /// start edge of first segment and end edge of last segment
            ///  default to showing their edges
            ///
            context: {
                // hasStartEdgeMark, hasEndEdgeMark, edgeMarkValue
                // defined in BaseScaledCanvasSegment

                /// find the number of precision digits required in order to
                ///  fully display "ev"; "ev" is assumed to have no more
                ///  precision digits than 'numberOfDigits'
                ///
                /// round to each plausible precision, and use the minimal
                ///  precision with which the value isn't changed
                ///  (assumes no f/p representation problems while rounding)
                ///
                findEdgePrecision: [
                    defun,
                    o("ev"),
                    [
                        min,
                        [
                            filter,
                            [
                                defun, o("p"),
                                [
                                    equal,
                                    [round, "ev", "p"],
                                    "ev"
                                ]
                            ],
                            [
                                sequence,
                                r(
                                    0,
                                    [{ findEdgePrecisionRangeMax: _ }, [me]]
                                )
                            ]
                        ]
                    ]
                ],

                /// the maximal possible precision that could apply to
                ///  a valid value on this canvas
                findEdgePrecisionRangeMax: [
                    max,
                    [
                        ceil,
                        [
                            uminus,
                            [
                                log10,
                                [{ minUnit: _ }, [me]]
                            ]
                        ]
                    ]
                ],

                startEdgePrecision: [
                    cond,
                    [{ hasStartEdgeMark: _ }, [me]],
                    {
                        on: true,
                        use: [
                            [{ findEdgePrecision: _ }, [me]],
                            [{ segmentStartValue: _ }, [me]]
                        ]
                    }
                ],

                endEdgePrecision: [
                    cond,
                    [{ hasEndEdgeMark: _ }, [me]],
                    {
                        on: true,
                        use: [
                            [{ findEdgePrecision: _ }, [me]],
                            [{ segmentEndValue: _ }, [me]]
                        ]
                    }
                ],


                edgeMarkPrecision: [
                    max,
                    o(
                        0,
                        [{ startEdgePrecision: _ }, [me]],
                        [{ endEdgePrecision: _ }, [me]]
                    )
                ],

                /// should we filter-our the first primary?
                /// yes, if
                ///  - there's an edge-mark on this segment's start and
                ///     it's too close (primaryLabelSpacing) to the first primary
                ///  - there's no edge-mark on this segment's start and
                ///     the last primary of the prev edge is too close to the
                ///     first primary (or to the recursively-defined prev-marker)
                firstPrimaryValue: [min, [{ rawPrimaryLabelValue: _ }, [me]]],

                prevMarkerValueForPrimary: [
                    cond,
                    [
                        or,
                        [{ hasStartEdgeMark: _ }, [me]],
                        [{ hasEndEdgeMark: _ }, [prev]]
                    ],
                    o(
                        {
                            on: true,
                            use: [{ segmentStartValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [
                                max,
                                [{ lastPrimaryValue: _ }, [prev]],
                                [{ prevMarkerValueForPrimary: _ }, [prev]]
                            ]
                        }
                    )
                ],

                prevMarkerTooCloseToPrimary: [
                    lessThan,
                    [
                        minus,
                        [
                            [{ valueToOffset: _ }, [me]],
                            [{ firstPrimaryValue: _ }, [me]]
                        ],
                        [
                            [{ valueToOffset: _ }, [embedding]],
                            [{ prevMarkerValueForPrimary: _ }, [me]]
                        ]
                    ],
                    [{ primaryLabelSpacing: _ }, [embedding]]
                ],

                firstPrimaryToRemove: [
                    cond,
                    [{ prevMarkerTooCloseToPrimary: _ }, [me]],
                    { on: true, use: [{ firstPrimaryValue: _ }, [me]] }
                ],

                /// should we filter-out the last primary?
                /// yes, if there's an edge-mark on this segment end and it's too
                ///     close to the last primary, or if it's too close
                ///     to the recursively-defined next-marker-value of [next]
                ///
                lastPrimaryValue: [max, [{ rawPrimaryLabelValue: _ }, [me]]],
                nextMarkerValueForPrimary: [
                    cond,
                    [
                        or,
                        [{ hasEndEdgeMark: _ }, [me]],
                        [{ hasStartEdgeMark: _ }, [next]]
                    ],
                    o(
                        {
                            on: true,
                            use: [{ segmentEndValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [{ nextMarkerValueForPrimary: _ }, [next]]
                        }
                    )
                ],

                nextMarkerTooCloseToPrimary: [
                    lessThan,
                    [
                        minus,
                        [
                            [{ valueToOffset: _ }, [embedding]],
                            [{ nextMarkerValueForPrimary: _ }, [me]]
                        ],
                        [
                            [{ valueToOffset: _ }, [me]],
                            [{ lastPrimaryValue: _ }, [me]]
                        ]
                    ],
                    [{ primaryLabelSpacing: _ }, [embedding]]
                ],

                lastPrimaryToRemove: [
                    cond,
                    [{ nextMarkerTooCloseToPrimary: _ }, [me]],
                    { on: true, use: [{ lastPrimaryValue: _ }, [me]] }
                ],

                primaryLabelValue: [
                    n(
                        [{ firstPrimaryToRemove: _ }, [me]],
                        [{ lastPrimaryToRemove: _ }, [me]]
                    ),
                    [{ rawPrimaryLabelValue: _ }, [me]]
                ],

                /// should we filter-out the first secondary label?
                /// yes, if
                ///  - there's an edge mark on this segment's start and it's
                ///        too close to the first secondary
                ///  - there's no edge mark on this segment's start and the last
                ///        primary or secondary of the previous segment is too
                ///        close to the first secondary
                firstSecondaryValue: [min, [{ rawSecondaryLabelValue: _ }, [me]]],
                lastSecondaryValue: [max, [{ rawSecondaryLabelValue: _ }, [me]]],

                prevMarkerValueForSecondary: [
                    cond,
                    [
                        or,
                        [{ hasStartEdgeMark: _ }, [me]],
                        [{ hasEndEdgeMark: _ }, [prev]]
                    ],
                    o(
                        {
                            on: true,
                            use: [{ segmentStartValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [max,
                                [{ lastPrimaryValue: _ }, [prev]],
                                [{ lastSecondaryValue: _ }, [prev]]
                            ]
                        }
                    )
                ],

                prevMarkerTooCloseToSecondary: [
                    lessThan,
                    [
                        minus,
                        [
                            [{ valueToOffset: _ }, [me]],
                            [{ firstSecondaryValue: _ }, [me]]
                        ],
                        [
                            [{ valueToOffset: _ }, [embedding]],
                            [{ prevMarkerValueForSecondary: _ }, [me]]
                        ]
                    ],
                    [{ secondaryLabelSpacing: _ }, [embedding]]
                ],

                firstSecondaryToRemove: [
                    cond,
                    [{ prevMarkerTooCloseToSecondary: _ }, [me]],
                    { on: true, use: [{ firstSecondaryValue: _ }, [me]] }
                ],

                /// should we filter-out the last secondary?
                /// yes, if there's an edge-mark on this segment's end and it's
                ///   too close to the last secondary, or if there's no edge-mark
                ///   and the last secondary is too close to the next segment's
                ///   first primary
                nextMarkerValueForSecondary: [
                    cond,
                    [
                        or,
                        [{ hasEndEdgeMark: _ }, [me]],
                        [{ hasStartEdgeMark: _ }, [next]]
                    ],
                    o(
                        {
                            on: true,
                            use: [{ segmentEndValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [{ firstPrimaryValue: _ }, [next]]
                        }
                    )
                ],

                nextMarkerTooCloseToSecondary: [
                    lessThan,
                    [
                        minus,
                        [
                            [{ valueToOffset: _ }, [embedding]],
                            [{ nextMarkerValueForSecondary: _ }, [me]]
                        ],
                        [
                            [{ valueToOffset: _ }, [me]],
                            [{ lastSecondaryValue: _ }, [me]]
                        ]
                    ],
                    [{ secondaryLabelSpacing: _ }, [embedding]]
                ],

                lastSecondaryToRemove: [
                    cond,
                    [{ nextMarkerTooCloseToSecondary: _ }, [me]],
                    { on: true, use: [{ lastSecondaryValue: _ }, [me]] }
                ],

                secondaryLabelValue: [
                    n(
                        [{ firstSecondaryToRemove: _ }, [me]],
                        [{ lastSecondaryToRemove: _ }, [me]]
                    ),
                    [{ rawSecondaryLabelValue: _ }, [me]]
                ],

                containsMaxDataValue: [lessThan,
                    [{ maxDataValue: _ }, [embedding]],
                    [{ segmentEndValue: _ }, [me]]
                ]
            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "LinearScaledSegment"
        },
        {
            qualifier: { scaleType: "log" },
            "class": "LogScaledSegment"
        }
    ),

    ///
    /// tickmark computation for linear segments:
    ///
    ///  primary-label: find the smallest round value whose offset delta is
    ///   at least as large as primaryLabelSpacing, and which is an integer
    ///   multiple of 'pixelValueDelta'
    ///
    /// secondary-label: find the smallest round value whose offset delta is
    ///    at least as large as secondaryLabelSpacing, which is an integer
    ///    multiple of minUnit, and which is a divisor of the primary-label's
    ///    delta
    ///
    /// unlabeled: likewise, such that the chosen delta is a divisor of the
    ///    chosen secondary delta
    ///
    LinearScaledSegment: {
        "class": "GeneralArea",
        context: {

            /// primaryLabelSpacing mapped to a value delta
            primaryLabelMinValueRange: [
                mul,
                [{ primaryLabelSpacing: _ }, [embedding]],
                [{ valueRangePerPixel: _ }, [me]]
            ],

            /// the chosen delta between two primary labels
            primaryLabelValueDelta: findRoundSupremum(
                [{ primaryLabelMinValueRange: _ }, [me]],
                [{ niceDivisorList: _ }, [embedding]],
                [{ pixelValueDelta: _ }, [me]]
            ),

            primaryLabelPrecision: [
                [{ findLabelPrecision: _ }, [me]],
                [{ primaryLabelValueDelta: _ }, [me]]
            ],

            ///
            /// find the precision required given the delta between label values
            ///
            /// find how many such delta's fit within "supP10", the smallest
            ///  power of 10 which is at least as big as 'delta';
            ///  this is the 'divisor', used as a key into the
            ///  'niceDivisorPrecision' table, from which the precision:
            ///  adjustment per divisor is extracted (as a divisor of '4'
            ///  adds as much two digits, e.g. .25, which a divisor of 2 or 5
            ///  only adds 1 digit, e.g. .2 or .5 )
            ///  This adjustment is added to the opposite of 'log10(supP10)',
            ///    to yield the actual precision; e.g. if supP10 is 10, and
            ///    log10(supP10) is 1, then we add -1; thus, if the divisor is 2,
            ///    the result is 0 (for labels 0, 5, 10, ..); and if the
            ///    divisor is 4 then the result is 1 (for labels
            ///    0, 2.5, 5, 7.5, ...)
            /// Finally, a 'max(0, x)' is used in order to only return
            ///   non-negative  results
            ///
            findLabelPrecision: [
                defun,
                o("delta"),
                [
                    [{ findLabelPrecision1: _ }, [me]],
                    "delta",
                    findSupP10("delta", [{ minUnit: _ }, [me]])
                ]
            ],

            findLabelPrecision1: [
                defun,
                o("delta", "supP10"),
                [
                    max,
                    0,
                    [
                        minus,
                        [
                            {
                                niceDivisorPrecision: {
                                    divisor: [
                                        round,
                                        [div, "supP10", "delta"]
                                    ],
                                    precision: _
                                }
                            },
                            [me]
                        ],
                        [
                            round,
                            [log10, "supP10"]
                        ]
                    ]
                ]
            ],

            firstPrimaryLabelValue: ceilToUnit(
                [{ segmentStartValue: _ }, [me]],
                [{ primaryLabelValueDelta: _ }, [me]]
            ),
            lastPrimaryLabelValue: floorToUnit(
                [{ segmentEndValue: _ }, [me]],
                [{ primaryLabelValueDelta: _ }, [me]]
            ),

            rawPrimaryLabelValue1: [
                mul,
                [{ primaryLabelValueDelta: _ }, [me]],
                [
                    sequence,
                    r(
                        [
                            round,
                            [
                                div,
                                [{ firstPrimaryLabelValue: _ }, [me]],
                                [{ primaryLabelValueDelta: _ }, [me]]
                            ]
                        ],
                        [
                            round,
                            [
                                div,
                                [{ lastPrimaryLabelValue: _ }, [me]],
                                [{ primaryLabelValueDelta: _ }, [me]]
                            ]
                        ]
                    )
                ]
            ],

            rawPrimaryLabelValue: [
                map,
                [
                    defun, o("v"),
                    roundToUnit("v", [{ minUnit: _ }, [me]])
                ],
                [{ rawPrimaryLabelValue1: _ }, [me]]
            ],

            /// the minimal spacing between secondary labels mapped to
            ///  value delta
            secondaryLabelMinValueRange: [
                mul,
                [{ secondaryLabelSpacing: _ }, [embedding]],
                [{ valueRangePerPixel: _ }, [me]]
            ],

            /// the chosen secondary label delta...if one exists
            secondaryLabelValueDelta1: findRoundSupremum(
                [{ secondaryLabelMinValueRange: _ }, [me]],
                [{ niceDivisorList: _ }, [embedding]],
                [{ minUnit: _ }, [me]],
                [{ primaryLabelValueDelta: _ }, [me]]
            ),

            /// if secondaryLabelValueDelta1 is o(), use 'primaryLabelValueDelta'
            ///
            /// an example of how secondaryLabelValueDelta1 may be o():
            ///  labelValueDelta is 0.25, secondaryLabelMinValueRange is 0.08
            ///  there is no round value larger than 0.08 that is an integer
            ///   divisor of 0.25 save 0.25 itself, and our candidates are
            ///   all no bigger than the next power of 10, so for 0.08 that is
            ///   0.1, and thus 0.25 is not in the candidate list
            secondaryLabelValueDelta: [
                cond,
                [{ secondaryLabelValueDelta1: _ }, [me]],
                o(
                    { on: true, use: [{ secondaryLabelValueDelta1: _ }, [me]] },
                    { on: false, use: [{ primaryLabelValueDelta: _ }, [me]] }
                )
            ],

            secondaryLabelPrecision: [
                [{ findLabelPrecision: _ }, [me]],
                [{ secondaryLabelValueDelta: _ }, [me]]
            ],

            firstSecondaryLabelValue: ceilToUnit(
                [{ segmentStartValue: _ }, [me]],
                [{ secondaryLabelValueDelta: _ }, [me]]
            ),

            lastSecondaryLabelValue: floorToUnit(
                [{ segmentEndValue: _ }, [me]],
                [{ secondaryLabelValueDelta: _ }, [me]]
            ),

            rawSecondaryLabelValue1: [
                mul,
                [{ secondaryLabelValueDelta: _ }, [me]],
                [
                    sequence,
                    r(
                        [
                            round,
                            [
                                div,
                                [{ firstSecondaryLabelValue: _ }, [me]],
                                [{ secondaryLabelValueDelta: _ }, [me]]
                            ]
                        ],
                        [
                            round,
                            [
                                div,
                                [{ lastSecondaryLabelValue: _ }, [me]],
                                [{ secondaryLabelValueDelta: _ }, [me]]
                            ]
                        ]
                    )
                ]
            ],

            rawSecondaryLabelValue: [
                map,
                [
                    defun, o("v"),
                    roundToUnit("v", [{ minUnit: _ }, [me]])
                ],
                [{ rawSecondaryLabelValue1: _ }, [me]]
            ],

            unlabeledMinValueRange: [
                mul,
                [{ unlabeledSpacing: _ }, [embedding]],
                [{ valueRangePerPixel: _ }, [me]]
            ],

            unlabeledValueDelta1: findRoundSupremum(
                [{ unlabeledMinValueRange: _ }, [me]],
                [{ niceDivisorList: _ }, [me]],
                [{ minUnit: _ }, [me]],
                [{ secondaryLabelValueDelta: _ }, [me]]
            ),

            unlabeledValueDelta: [
                cond,
                [{ unlabeledValueDelta1: _ }, [me]],
                o(
                    { on: true, use: [{ unlabeledValueDelta1: _ }, [me]] },
                    { on: false, use: [{ secondaryLabelValueDelta: _ }, [me]] }
                )
            ],

            firstUnlabeledValue: ceilToUnit(
                [{ segmentStartValue: _ }, [me]],
                [{ unlabeledValueDelta: _ }, [me]]
            ),

            lastUnlabeledValue: floorToUnit(
                [{ segmentEndValue: _ }, [me]],
                [{ unlabeledValueDelta: _ }, [me]]
            ),

            unlabeledValue: [
                mul,
                [{ unlabeledValueDelta: _ }, [me]],
                [
                    sequence,
                    r(
                        [
                            round,
                            [
                                div,
                                [{ firstUnlabeledValue: _ }, [me]],
                                [{ unlabeledValueDelta: _ }, [me]]
                            ]
                        ],
                        [
                            round,
                            [
                                div,
                                [{ lastUnlabeledValue: _ }, [me]],
                                [{ unlabeledValueDelta: _ }, [me]]
                            ]
                        ]
                    )
                ]
            ]
        }
    },

    ///
    /// tickmark computation for log segments:
    ///
    /// primary-labels: these are only allowed on exact ooms
    ///         XXX thus, this implementation does not reasonably support  XXX
    ///         XXX  a log segment which is contained within a single oom, XXX
    ///         XXX  e.g. 150 - 600.                                       XXX
    ///     starting from the reference oom, which is the oom closest to 0,
    ///     place a primary label every 'oomPerPrimaryLabel', a positive
    ///     integer which is the smallest such that the spacing constraint is
    ///     honored
    ///
    /// secondary-labels: if the primary label spacing was such that some oom's
    ///     do not yet have a label, refine the primary labeling as much as the
    ///     secondary spacing allows, such that 'oomPerSecondaryLabel' is an
    ///     integer divisor of 'oomPerPrimaryLabel'.
    ///       Otherwise, if the primary label covered all oom's, refine it by
    ///     choosing the first subdivision that still fits secondary-spacing
    ///     constraints out of 'oomSubdivision'. Each sub-division in
    ///     'oomSubdivision' has a 'subdivision' member, an o/s of the values it
    ///     suggests to mark, and a 'testcase' member, which denotes the two
    ///     closest marks. If the two testcase members have a delta whose offset
    ///     is least as large as secondary-spacing, this subdivision can be used.
    ///     However, an additional requirement of subdivisions is that they would
    ///     be allowed for the specific tickmark type, by the third member
    ///      'useFor:'.
    ///     For example, the subdivision o(1,2,5) is allowed for secondary-label,
    ///     as the label explicates the sub-division, but it is not allowed for
    ///     unlabeled tickmarks, as it is difficult for a user to guess what the
    ///     two marks stand for (are these 2 and 5, or perhaps 3.3 and 6.6?
    ///     5 and 7?)
    ///
    /// unlabeled: unlabeled refines secondary's oomPerSecondaryLabel if
    ///       secondary label did not cover all oom's.
    ///    Otherwise, it refines the sub-division provided by secondary-label.
    ///    Note that the unlabeled sub-division must be a refinement of the
    ///     secondary. Thus, if the secondary sub-division is o(1,5) than
    ///     the unlabeled sub-division cannot be o(1,2,4,6,8), but it could
    ///     be o(1,2,3,4,5,6,7,8,9) or o(1,2,5)
    ///
    LogScaledSegment: o(
        {
            "class": "GeneralArea",
            context: {
                oomSubdivision: o(
                    {
                        subdivision: o(1, 2, 3, 4, 5, 6, 7, 8, 9),
                        testcase: o(9, 10),
                        useFor: o("secondary", "unlabeled")
                    },
                    {
                        subdivision: o(1, 2, 4, 6, 8),
                        testcase: o(8, 10),
                        useFor: o("secondary", "unlabeled")
                    },
                    {
                        subdivision: o(1, 2, 5),
                        testcase: o(1, 2),
                        useFor: o("secondary")
                    },
                    {
                        subdivision: o(1, 5),
                        testcase: o(5, 10),
                        useFor: o("secondary", "unlabeled")
                    },
                    {
                        subdivision: o(1),
                        useFor: o("secondary", "unlabeled"),
                        testcase: o(1, 10)
                    }
                ),

                /// compute the test-case offset for the passed-in sub-division
                ///   object
                subdivisionTestCaseOffsetOf: [
                    defun, o("sdo"),
                    [
                        mul,
                        [{ pixelPerOOM: _ }, [me]],
                        [
                            minus,
                            [log10, [last, [{ testcase: _ }, "sdo"]]],
                            [log10, [first, [{ testcase: _ }, "sdo"]]]
                        ]
                    ]
                ],

                oomPerPrimaryLabel: [
                    ceil,
                    [
                        div,
                        [{ primaryLabelSpacing: _ }, [embedding]],
                        [{ pixelPerOOM: _ }, [me]]
                    ]
                ],

                /// equals 'oomPerPrimaryLabel', unless there were less than
                ///  two primary labels, so no actual rythm was established
                ///
                effOomPerPrimaryLabel: [
                    cond,
                    [
                        greaterThanOrEqual,
                        [
                            size,
                            // add to the primary set those elements in
                            //  rawPrimaryLabelValue which are not in
                            //  primaryLabelValue yet are in
                            //  prevMarkerValueForPrimary /
                            //   nextMarkerValueForPrimary
                            o(
                                [{ primaryLabelValue: _ }, [me]],
                                [
                                    o(
                                        [{ prevMarkerValueForPrimary: _ }, [me]],
                                        [{ nextMarkerValueForPrimary: _ }, [me]]
                                    ),
                                    [
                                        n([{ primaryLabelValue: _ }, [me]]),
                                        [{ rawPrimaryLabelValue: _ }, [me]]
                                    ]
                                ]
                            )
                        ],
                        2
                    ],
                    {
                        on: true,
                        use: [{ oomPerPrimaryLabel: _ }, [me]]
                    }
                ],

                rawPrimaryLabelValue: [
                    map,
                    [{ oom2value: _ }, [me]],
                    [
                        [{ oomSetModDelta: _ }, [me]],
                        [{ oomPerPrimaryLabel: _ }, [me]]
                    ]
                ],

                primaryLabelCoversAllOOM: [
                    equal,
                    [{ oomPerPrimaryLabel: _ }, [me]],
                    1
                ],

                /// translate an exponent to a value (throwing in the sign)
                oom2value: [
                    defun,
                    o("oom"),
                    [
                        mul,
                        [{ logSign: _ }, [me]],
                        [
                            pow,
                            10,
                            "oom"
                        ]
                    ]
                ],

                ///
                /// pick all the oom's out of 'oomInSegment' whose
                ///  oom-delta from the reference oom is a multiple of
                ///  'oomDelta'
                ///  e.g. if oomInSegment is o(2,3,4,5,6,7,8,9),
                ///  referenceLogValue is '5' and 'oomDelta' is '3', then
                ///  the result should be o(2, 5, 8)
                ///
                oomSetModDelta: [
                    defun,
                    o("oomDelta"),
                    [
                        filter,
                        [
                            defun,
                            o("oom"),
                            [
                                equal,
                                [
                                    mod,
                                    [{ referenceLogValue: _ }, [me]],
                                    "oomDelta"
                                ],
                                [mod, "oom", "oomDelta"]
                            ]
                        ],
                        [{ oomInSegment: _ }, [me]]
                    ]
                ],

                /// find the minimal integer in the range <imin..imax> which is
                ///  also an integer divisor of imax
                minDivOfMaxInRange: [
                    defun, o("imin", "imax"),
                    [
                        first,
                        [
                            filter,
                            [
                                defun, o("i"),
                                [
                                    lessThan,
                                    [
                                        abs,
                                        [
                                            minus,
                                            [round, [div, "imax", "i"]],
                                            [div, "imax", "i"]
                                        ]
                                    ],
                                    0.0001
                                ]
                            ],
                            [sequence, r("imin", "imax")]
                        ]
                    ]
                ],

                ///
                /// given a 'sub-division' entry and a pixel offset
                ///  'spacing', test whether the entry's test-case fits
                ///  within the spacing
                isSufficientForSpacing: [
                    defun,
                    o("sdo", "spacing"),
                    [
                        greaterThanOrEqual,
                        [
                            [{ subdivisionTestCaseOffsetOf: _ }, [me]],
                            "sdo"
                        ],
                        "spacing"
                    ]
                ],

                /// find the minimal oom delta that would guarantee an offset of
                ///  at least 'spacing' pixels
                ///
                minOOMBySpacing: [
                    defun,
                    o("spacing"),
                    [
                        ceil,
                        [div, "spacing", [{ pixelPerOOM: _ }, [me]]]
                    ]
                ],

                ///
                /// the primary label values are necessarily powers of 10;
                /// the number of precision digits thus depends on the value of
                ///  minimal absolute value
                primaryLabelPrecision: [
                    max,
                    0,
                    [
                        uminus,
                        [
                            round,
                            [
                                log10,
                                [
                                    min,
                                    [abs, [{ primaryLabelValue: _ }, [me]]]
                                ]
                            ]
                        ]
                    ]
                ],

                ///
                /// if the secondary label values are all powers of 10, the
                ///   largest number of precision digits is the opposite of
                ///   the log10 of the secondary label value of minimal abs-value
                /// if secondary label values sub-divide primary label values,
                ///  then they have the same precision as the primary label
                ///  preceding them (looking from 0); if that primary label is
                ///  missing, add an extra 'oomPerPrimaryLabel' (though that's
                ///  merely an upper bound, not an exact value)
                ///  
                secondaryLabelPrecision: [
                    cond,
                    [{ primaryLabelCoversAllOOM: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [
                                plus,
                                [{ primaryLabelPrecision: _ }, [me]],
                                [
                                    cond,
                                    [
                                        equal,
                                        [min, [{ primaryLabelValue: _ }, [me]]],
                                        [{ segmentStartValue: _ }, [me]]
                                    ],
                                    o(
                                        { on: true, use: 0 },
                                        {
                                            on: false,
                                            use: [{ oomPerPrimaryLabel: _ }, [me]]
                                        }
                                    )
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: [
                                max,
                                0,
                                [
                                    uminus,
                                    [
                                        round,
                                        [
                                            log10,
                                            [
                                                min,
                                                [
                                                    abs,
                                                    [
                                                        { secondaryLabelValue: _ },
                                                        [me]
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        }
                    )
                ]
            }
        },

        {
            ///
            /// secondary label handling when the primary label
            /// covered all oom's, so that the secondary label should
            ///  tyr to provide a sub-division of oom's
            ///
            qualifier: { primaryLabelCoversAllOOM: true },

            context: {
                /// keep only values within our range
                rawSecondaryLabelValue: [
                    r(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [{ secondaryLabelValue1: _ }, [me]]
                ],

                ///
                /// for each oom, map the oom to a set of values
                ///  per sub-division-element using 'secondaryLabelValueOfOOM';
                secondaryLabelValue1: [
                    map,
                    [{ secondaryLabelValueOfOOM: _ }, [me]],
                    [{ inclusiveOOMInSegment: _ }, [me]]
                ],

                secondaryLabelValueOfOOM: [
                    defun,
                    o("oom"),
                    [
                        mul,
                        [
                            [{ oom2value: _ }, [me]],
                            "oom"
                        ],
                        [{ secondarySubdivision: _ }, [me]]
                    ]
                ],

                /// get the subdivision member of the first entry in
                ///  'oomSubdivision' that is not too crowded compared to
                ///  'secondaryLabelSpacing'
                ///
                secondarySubdivision: [
                    { subdivision: _ },
                    [
                        first,
                        [
                            filter,
                            [
                                defun, o("sdo"),
                                [
                                    [{ isSufficientForSpacing: _ }, [me]],
                                    "sdo",
                                    [{ secondaryLabelSpacing: _ }, [embedding]]
                                ]
                            ],
                            [
                                { useFor: "secondary" },
                                [{ oomSubdivision: _ }, [me]]
                            ]
                        ]
                    ]
                ],

                secondaryLabelCoversAllOOM: true
            }
        },
        {
            /// secondary label handling when the primary labels did not cover
            ///  all oom's; the seondary labeling should attempt to refine
            ///  the primary oom coverage
            ///
            /// this is mostly identical to primary label handling, except that
            ///   there's an additional requirement - that the secondary
            ///   labeling would refine the primary, that is, that
            ///   'oomPerSecondaryLabel' would be a divisor of
            ///    'oomPerPrimaryLabel'
            ///
            qualifier: { primaryLabelCoversAllOOM: false },

            context: {
                minOOMPerSecondaryLabel: [
                    [{ minOOMBySpacing: _ }, [me]],
                    [{ secondaryLabelSpacing: _ }, [embedding]]
                ],

                /// find the minimal delta in the range
                ///  'minOOMPerSecondaryLabel' ... 'oomPerPrimaryLabel'
                ///  which is a divisor of 'oomPerPrimaryLabel
                /// ...
                oomPerSecondaryLabel1: [
                    [{ minDivOfMaxInRange: _ }, [me]],
                    [{ minOOMPerSecondaryLabel: _ }, [me]],
                    [{ oomPerPrimaryLabel: _ }, [me]]
                ],

                /// and if none was found (?) use oomPerPrimaryLabel
                oomPerSecondaryLabel: [
                    first,
                    o(
                        [
                            cond,
                            [empty, [{ effOomPerPrimaryLabel: _ }, [me]]],
                            {
                                on: true,
                                use: [{ minOOMPerSecondaryLabel: _ }, [me]]
                            }
                        ],
                        [{ oomPerSecondaryLabel1: _ }, [me]],
                        [{ oomPerPrimaryLabel: _ }, [me]]
                    )
                ],

                rawSecondaryLabelValue: [
                    map,
                    [{ oom2value: _ }, [me]],
                    [
                        [{ oomSetModDelta: _ }, [me]],
                        [{ oomPerSecondaryLabel: _ }, [me]]
                    ]
                ],

                secondaryLabelCoversAllOOM: [
                    equal,
                    [{ oomPerSecondaryLabel: _ }, [me]],
                    1
                ],

                /// used (and valid) only if
                ///  {secondaryLabelCoversAllOOM: true
                secondarySubdivision: o(1)
            }
        },

        {
            /// unlabeled tickmark handling when the secondary labeling
            ///  did cover all oom's
            /// in this case, unlabeled tickmarks should try to provide a
            ///  subdivision of oom's
            ///
            /// this is very similar to the handling of secondary label tickmarks
            ///  when primaryLabelCoversAllOOM:true, except that there's an
            ///  added requirement that the unlabeled tickmark subdivision would
            ///  refine the secondary subdivision; that is, that the subdivision
            ///  chosen for unlabeled tickmarks would be a super-set of the
            ///  secondary subdivision
            ///
            qualifier: { secondaryLabelCoversAllOOM: true },
            context: {
                unlabeledValue: [
                    r(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [{ unlabeledValue1: _ }, [me]]
                ],

                unlabeledValue1: [
                    map,
                    [{ unlabeledValueOfOOM: _ }, [me]],
                    [{ inclusiveOOMInSegment: _ }, [me]]
                ],

                unlabeledValueOfOOM: [
                    defun,
                    o("oom"),
                    [
                        mul,
                        [
                            [{ oom2value: _ }, [me]],
                            "oom"
                        ],
                        [{ unlabeledSubdivision: _ }, [me]]
                    ]
                ],

                /// a subdivision isa candidate if:
                ///  - its 'useFor:' includes "unlabeled"
                ///  - its testcase values are at least as spacious as
                ///     'unlabeledSpacing'
                /// - its 'subdivision' is a superset of 'secondarySubdivision'
                ///
                candidateUnlabeledSubdivision: [
                    filter,
                    [
                        defun,
                        o("sdo"),
                        [
                            and,
                            [
                                [{ isSufficientForSpacing: _ }, [me]],
                                "sdo",
                                [{ unlabeledSpacing: _ }, [embedding]]
                            ],
                            [
                                not,
                                [
                                    n([{ subdivision: _ }, "sdo"]),
                                    [{ secondarySubdivision: _ }, [me]]
                                ]
                            ]
                        ]
                    ],
                    [
                        { useFor: "unlabeled" },
                        [{ oomSubdivision: _ }, [me]]
                    ]
                ],

                unlabeledSubdivision: [
                    { subdivision: _ },
                    [
                        first,
                        [{ candidateUnlabeledSubdivision: _ }, [me]]
                    ]
                ]
            }
        },

        {
            /// unlabeled tickmark handling when the secondary label did not
            ///  cover all oom's.
            /// in this case unlabeled tickmarks should try and refine the
            ///  oom coverage.
            /// this is practically identical to the handling of secondaryLabel
            ///  when primaryLabelCoversAllOOM:false
            ///
            qualifier: { secondaryLabelCoversAllOOM: false },
            context: {
                unlabeledValue: [
                    map,
                    [{ oom2value: _ }, [me]],
                    [
                        [{ oomSetModDelta: _ }, [me]],
                        [{ oomPerUnlabeled: _ }, [me]]
                    ]
                ],

                ///
                /// the same as oomPerSecondaryLabel, except in some edge cases;
                /// if there are "very few" secondary/primary labels, then we
                ///   say that no secondary label 'rhytmus' was established, so
                ///   secondary labels are ignored for unlabeled tick mark
                ///   generation.
                ///
                effOomPerSecondaryLabel: [
                    cond,
                    true,
                    o(
                        {
                            on: [
                                greaterThanOrEqual,
                                [size, [{ secondaryLabelValue: _ }, [me]]],
                                2
                            ],
                            use: [{ oomPerSecondaryLabel: _ }, [me]]
                        },
                        {
                            on: [
                                and,
                                [{ effOomPerPrimaryLabel: _ }, [me]],
                                [
                                    greaterThan,
                                    [size, [{ secondaryLabelValue: _ }, [me]]],
                                    0
                                ]
                            ],
                            use: [{ oomPerSecondaryLabel: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [{ effOomPerPrimaryLabel: _ }, [me]]
                        }
                    )
                ],

                oomPerUnlabeled: [
                    first,
                    o(
                        [
                            cond,
                            [empty, [{ effOomPerSecondaryLabel: _ }, [me]]],
                            {
                                on: true,
                                use: [{ minOOMPerUnlabeled: _ }, [me]]
                            }
                        ],
                        [{ oomPerUnlabeled1: _ }, [me]],
                        [{ oomPerSecondaryLabel: _ }, [me]]
                    )
                ],

                oomPerUnlabeled1: [
                    [{ minDivOfMaxInRange: _ }, [me]],
                    [{ minOOMPerUnlabeled: _ }, [me]],
                    [{ effOomPerSecondaryLabel: _ }, [me]]
                ],

                minOOMPerUnlabeled: [
                    [{ minOOMBySpacing: _ }, [me]],
                    [{ unlabeledSpacing: _ }, [embedding]]
                ]
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////////////
    ///
    /// this class suggests bin ranges that are well aligned with the
    ///  edges and primary labels of a segmentedscaledcanvas
    ///
    /// The input is a desired number of bins
    ///
    /// The desired number of bins is used to calculate the desired pixel
    ///  size of each bin.
    ///
    /// It is used to find the integer multiple of primary labels to fit
    ///  inside each bin (or, if bins are to be smaller than primary label
    ///  delta, to how many bins should inter-primary-label-delta be split)
    ///
    /// The actual number of bins may differ significantly, as segment
    ///   edges may interfere with the partition
    ///
    /// Each canvas-segment area is made to inherit 'CanvasSegmentPartition';
    ///  this class
    ///  -- provides the desired alignment delta for the segment (which is
    ///      the inter-primary-label delta)
    ///  -- takes a bin pixel size and returns the set of values where a bin
    ///      in that segment should start
    ///
    /// SegmentedCanvasPartition chooses the bin size depending on scale-type;
    ///  each scale type hhas its own sub-class, which may rely on per-segment
    ///  information to choose a bin size;
    /// Depending on scale type, one segment is chosen as the 'lead-segment';
    ///  that segment is interrogated for the set of bin-widths it supports,
    ///  and these are used as the goal bin-widths of the entire scale
    ///
    /// the bin size is then passed to the per-segment class, and the bin
    ///  start locations from all segments are collected back to form the
    ///  overall set of bins
    ///
    /// this class may also intervene with secondaryLabelValue and
    ///   unlabeledValue assignment; if these are not aligned with bin
    ///   partition, then secondaryLabelValue is made a copy of
    ///   primaryLabelValue (=> no secondary labels), and unlabeledValue is
    ///   made a copy of canvasPartitionValue
    ///
    //////////////////////////////////////////////////////////////////////////////
    SegmentedCanvasPartition: o(
        {
            "class": o("GeneralArea", "TrackMyFacet"),
            context: {
                histogramBinSizePos: [{ myFacet: { currentViewFacetDataObj: { binCount: _ } } }, [me]],

                /// divide the available canvas pixel size by each of the
                ///  candidate bin-counts
                ///
                desiredBinPixelSizeList: [
                    div,
                    [{ canvasPixelSize: _ }, [me]],
                    [{ attemptedBinCountList: _ }, [me]]
                ],

                /// map each desired bin pixel size to the nearest actually
                ///  possible bin pixel size
                actualBinPixelSizeList: [
                    map,
                    [{ desiredToActualBinPixelSize: _ }, [me]],
                    [{ desiredBinPixelSizeList: _ }, [me]]
                ],

                /// return the actually available bin pixel size that is
                ///  nearest the given "desired" bin pixel size
                ///
                /// if the desired size is >= 1/2 the alignmentUnitPixelSize
                ///  of the lead segment, use the nearest multiple of
                ///  the alignment unit
                /// if the desired size is < the alignmentUnitPixelSize, use
                ///  the nearest divisor of the alignment unit
                ///
                desiredToActualBinPixelSize: [
                    defun,
                    o("desired"),
                    [
                        cond,
                        [
                            round,
                            [
                                div,
                                "desired",
                                [{ alignmentUnitPixelSize: _ }, [me]]
                            ]
                        ],
                        o(
                            {
                                on: 0,
                                use: [
                                    [{ desiredToActualBinPixelSizeZero: _ }, [me]],
                                    [
                                        round,
                                        [
                                            div,
                                            [{ alignmentUnitPixelSize: _ }, [me]],
                                            "desired"
                                        ]
                                    ]
                                ]
                            },
                            {
                                on: r(1, Infinity),
                                use: [
                                    [{ desiredToActualBinPixelSizeMore: _ }, [me]],
                                    [
                                        round,
                                        [
                                            div,
                                            "desired",
                                            [{ alignmentUnitPixelSize: _ }, [me]]
                                        ]
                                    ]
                                ]
                            }
                        )
                    ]
                ],

                /// used when the desired size is < 1/2 the alignment unit
                desiredToActualBinPixelSizeZero: [
                    defun,
                    o("binPerAlignmentUnit"),
                    [
                        div,
                        [{ alignmentUnitPixelSize: _ }, [me]],
                        "binPerAlignmentUnit"
                    ]
                ],

                /// used when the desired size is >= 1/2 of the alignment unit
                desiredToActualBinPixelSizeMore: [
                    defun,
                    o("alignmentUnitPerBin"),
                    [
                        mul,
                        [{ alignmentUnitPixelSize: _ }, [me]],
                        "alignmentUnitPerBin"
                    ]
                ],

                /// the unique values in actualBinPixelSizeList
                uniqBinPixelSizeList: [_, [{ actualBinPixelSizeList: _ }, [me]]],

                /// pick one value from the actualBinPixelSizeList, controlled
                ///  by 'histogramBinSizePos'
                binPixelSize: [
                    pos,
                    [
                        min,
                        [{ histogramBinSizePos: _ }, [me]],
                        [minus, [size, [{ uniqBinPixelSizeList: _ }, [me]]], 1]
                    ],
                    [{ uniqBinPixelSizeList: _ }, [me]]
                ],

                canvasPartitionValue: o(
                    [
                        { children: { segment: { segmentCanvasPartition: _ } } },
                        [me]
                    ],
                    [{ canvasEndValue: _ }, [me]]
                ),

                independentSecondaryLabelValue: [
                    { children: { segment: { secondaryLabelValue: _ } } },
                    [me]
                ],

                /// independentSecondaryLabelValue is considered aligned with
                ///  bin-partition-value if one is a refinement of the other
                ///  (canvasPartitionValue is allowed to be a refinement of the
                ///   union of primary, secondary and edge marker values)
                isSecondaryAlignedWithBinPartition: o(
                    [
                        empty,
                        [
                            n(
                                [{ independentSecondaryLabelValue: _ }, [me]],
                                [{ primaryLabelValue: _ }, [me]],
                                [{ edgeMarkValue: _ }, [me]]
                            ),
                            [{ canvasPartitionValue: _ }, [me]]
                        ]
                    ],
                    [
                        empty,
                        [
                            n([{ canvasPartitionValue: _ }, [me]]),
                            [{ independentSecondaryLabelValue: _ }, [me]]
                        ]
                    ]
                ),

                /// if aligned - use 'independentSecondaryLabelValue';
                /// if not, then no secondary labels
                secondaryLabelValue: [
                    cond,
                    [{ isSecondaryAlignedWithBinPartition: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ independentSecondaryLabelValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: o()
                        }
                    )
                ],

                independentUnlabeledValue: [
                    { children: { segment: { unlabeledValue: _ } } },
                    [me]
                ],

                /// independentUnlabeledValue is considered aligned with
                ///  bin-partition-value if one is a refinement of the other
                isUnlabeledAlignedWithBinPartition: o(
                    [
                        empty,
                        [
                            n(
                                [{ independentUnlabeledValue: _ }, [me]],
                                [{ independentSecondaryLabelValue: _ }, [me]],
                                [{ primaryLabelValue: _ }, [me]],
                                [{ edgeMarkValue: _ }, [me]]
                            ),
                            [{ canvasPartitionValue: _ }, [me]]
                        ]
                    ],
                    [
                        empty,
                        [
                            n([{ canvasPartitionValue: _ }, [me]]),
                            [{ independentUnlabeledValue: _ }, [me]]
                        ]
                    ]
                ),

                /// if aligned, use independentUnlabeledValue;
                /// if not, add unlabeled tick marks exactly where there are
                ///   bin edges
                ///
                unlabeledValue: [
                    cond,
                    [{ isUnlabeledAlignedWithBinPartition: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ independentUnlabeledValue: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [{ canvasPartitionValue: _ }, [me]]
                        }
                    )
                ],

                logSegment: [
                    { children: { segment: { scaleType: "log" } } },
                    [me]
                ],
                linearSegment: [
                    { children: { segment: { scaleType: "linear" } } },
                    [me]
                ],

                alignmentUnitPixelSize: [
                    { leadPartitionSegment: { segmentAlignmentPixelSize: _ } },
                    [me]
                ]
            },

            children: {
                segment: {
                    description: {
                        "class": "CanvasSegmentPartition"
                    }
                }
            }
        },

        {
            qualifier: { scaleType: "linear" },

            "class": "CanvasLinearScalePartition"
        },

        {
            qualifier: { scaleType: "log" },

            "class": "CanvasLogScalePartition"
        },

        {
            qualifier: { scaleType: o("linearPlus", "linearPlusMinus") },

            "class": "CanvasLinearPlusMinusPartition"
        }
    ),

    ///
    /// a single linear segment;
    /// round the value delta associated with desiredBinPixelSize to
    ///  the nearest multiple of primaryLabelValueDelta;
    /// if the result is '0', reverse: return the reciprocal of
    ///  the nearest integer multiple of desiredBinPixelSize in
    ///  primaryLabelValueDelta
    ///
    CanvasLinearScalePartition: o(
        {
            "class": "GeneralArea",
            context: {
                /// last - cause when faking zeroNegativeLogEdge the significant
                ///  segment is the 2nd-and-last linear segment
                leadPartitionSegment: [
                    first,
                    o(
                        [last, [{ linearSegment: _ }, [me]]],
                        [{ logSegment: _ }, [me]]
                    )
                ]
            }
        }
    ),

    ///
    /// in general, two log segments and two linear segments (around 0);
    /// however,
    ///  - both log segments (if two exist) share inter-primary-tick
    ///       distance
    ///  - the two linear segments (when they exist) have a size which
    ///     is a multiple of the same inter-primary-tick distance
    ///     (and is - currently - 1 primary tick distance per linear
    ///      segment)
    ///
    /// the desired bin pixel size is fixed by dividing total canvas
    ///   pixel size by the desired number of bins
    ///
    /// the best approximation - either above or below is chosen for the
    ///   two log segments
    /// if two linear segments exist, and both have the same pixel/value
    ///   density, then they are treated as a single segment for
    ///   partitioning. Otherwise, each is considered a single
    ///   segment, and is partitioned as such
    ///
    CanvasLogScalePartition: o(
        {
            "class": "GeneralArea",
            context: {
                leadPartitionSegment: [
                    first,
                    o(
                        [{ logSegment: _ }, [me]],
                        [{ linearSegment: _ }, [me]]
                    )
                ]
            }
        }
    ),

    CanvasLinearPlusMinusPartition: o(
        {
            "class": "GeneralArea",
            context: {
                leadPartitionSegment: [
                    first,
                    o(
                        [{ linearSegment: _ }, [me]],
                        [{ logSegment: _ }, [me]]
                    )
                ]
            }
        }
    ),

    CanvasSegmentPartition: o(
        {
            qualifier: "!",
            context: {

                /// here we'd like 0.5 to be rounded to 0
                alignmentUnitPerBin: [
                    round,
                    [
                        mul,
                        0.999,
                        [
                            div,
                            [{ binPixelSize: _ }, [embedding]],
                            [{ segmentAlignmentPixelSize: _ }, [me]]
                        ]
                    ]
                ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                mergePartialBinThreshold: [
                    { mergePartialBinThreshold: _ },
                    [embedding]
                ],

                /// filter segmentEndValue out of baseSegmentCanvasPartition.
                /// it may or may not be there; if it is there, it should
                ///   be removed, as it would be added by the next segment,
                ///   or as the end of the overall scale
                ///
                /// add segmentStartValue, unless it's already in
                ///  baseSegmentCanvasPartition
                ///
                /// merge the first bin with its next, or the last bin with its
                ///  previous, if they are too small
                ///
                segmentCanvasPartition: o(
                    [
                        n([{ mergedSortedBaseSegmentCanvasPartition: _ }, [me]]),
                        [{ segmentStartValue: _ }, [me]]
                    ],
                    [
                        n([{ segmentEndValue: _ }, [me]]),
                        [{ mergedSortedBaseSegmentCanvasPartition: _ }, [me]]
                    ]
                ),

                sortedBaseSegmentCanvasPartition: [
                    sort,
                    [{ baseSegmentCanvasPartition: _ }, [me]],
                    "ascending"
                ],

                mergeFirstBin: [
                    lessThan,
                    [
                        div,
                        [{ firstBinPixelSize: _ }, [me]],
                        [{ binPixelSize: _ }, [embedding]]
                    ],
                    [{ mergePartialBinThreshold: _ }, [me]]
                ],

                mergeLastBin: [
                    lessThan,
                    [
                        div,
                        [{ lastBinPixelSize: _ }, [me]],
                        [{ binPixelSize: _ }, [embedding]]
                    ],
                    [{ mergePartialBinThreshold: _ }, [me]]
                ],

                /// if there are only two bins, both may be partial;
                /// merge them if together they are less than
                ///  (1+threshold)*(standard bin size)
                ///
                mergeFirstAndLastBin: [
                    and,
                    [
                        equal,
                        [size, [{ sortedBaseSegmentCanvasPartition: _ }, [me]]],
                        1
                    ],
                    [
                        lessThan,
                        [
                            div,
                            [
                                plus,
                                [{ firstBinPixelSize: _ }, [me]],
                                [{ lastBinPixelSize: _ }, [me]]
                            ],
                            [{ binPixelSize: _ }, [embedding]]
                        ],
                        [plus, 1, [{ mergePartialBinThreshold: _ }, [me]]]
                    ]
                ],

                mergedSortedBaseSegmentCanvasPartition: [
                    n(
                        [
                            cond,
                            [{ mergeFirstBin: _ }, [me]],
                            {
                                on: true,
                                use: [
                                    first,
                                    [{ sortedBaseSegmentCanvasPartition: _ }, [me]]
                                ]
                            }
                        ],
                        [
                            cond,
                            [{ mergeLastBin: _ }, [me]],
                            {
                                on: true,
                                use: [
                                    last,
                                    [{ sortedBaseSegmentCanvasPartition: _ }, [me]]
                                ]
                            }
                        ],
                        [
                            cond,
                            [{ mergeFirstAndLastBin: _ }, [me]],
                            {
                                on: true,
                                use: [
                                    { sortedBaseSegmentCanvasPartition: _ },
                                    [me]
                                ]
                            }
                        ]
                    ),
                    [{ sortedBaseSegmentCanvasPartition: _ }, [me]]
                ]
            }
        },

        {
            qualifier: { alignmentUnitPerBin: 0 },

            context: {
                binPerAlignmentUnit: [
                    round,
                    [
                        div,
                        [{ segmentAlignmentPixelSize: _ }, [me]],
                        [{ binPixelSize: _ }, [embedding]]
                    ]
                ],

                alignmentUnitInternalPartition: [
                    div,
                    [
                        sequence,
                        r(0, [minus, [{ binPerAlignmentUnit: _ }, [me]], 1])
                    ],
                    [{ binPerAlignmentUnit: _ }, [me]]
                ]
            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "LinearCanvasSegmentPartition"
        },

        {
            qualifier: { scaleType: "log" },
            "class": "LogCanvasSegmentPartition"
        }
    ),

    LinearCanvasSegmentPartition: o(
        {
            "class": "GeneralArea",
            context: {
                segmentAlignmentPixelSize: [
                    div,
                    [{ primaryLabelValueDelta: _ }, [me]],
                    [{ valueRangePerPixel: _ }, [me]]
                ],

                firstBinPixelSize: [
                    div,
                    [
                        minus,
                        [first, [{ sortedBaseSegmentCanvasPartition: _ }, [me]]],
                        [{ segmentStartValue: _ }, [me]]
                    ],
                    [{ valueRangePerPixel: _ }, [me]]
                ],

                lastBinPixelSize: [
                    div,
                    [
                        minus,
                        [{ segmentEndValue: _ }, [me]],
                        [last, [{ sortedBaseSegmentCanvasPartition: _ }, [me]]]
                    ],
                    [{ valueRangePerPixel: _ }, [me]]
                ]
            }

        },

        {
            qualifier: { alignmentUnitPerBin: 0 },

            context: {

                /// take one primary back, to make sure we get also the bins
                /// before the first primary; we'll filter-out the bins outside
                ///  (before and afetr) the segment's range later on
                inclusiveRawPrimaryLabelValue: o(
                    [
                        minus,
                        [{ firstPrimaryLabelValue: _ }, [me]],
                        [{ primaryLabelValueDelta: _ }, [me]]
                    ],
                    [{ rawPrimaryLabelValue: _ }, [me]]
                ),

                baseSegmentCanvasPartition: [
                    Rco(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [
                        map,
                        [{ applySegmentInternalPartition: _ }, [me]],
                        [{ inclusiveRawPrimaryLabelValue: _ }, [me]]
                    ]
                ],

                applySegmentInternalPartition: [
                    defun,
                    o("primary"),
                    [
                        plus,
                        "primary",
                        [
                            mul,
                            [{ primaryLabelValueDelta: _ }, [me]],
                            [{ alignmentUnitInternalPartition: _ }, [me]]
                        ]
                    ]
                ]
            }
        },

        {
            qualifier: { alignmentUnitPerBin: r(1, Infinity) },

            context: {
                baseSegmentCanvasPartition: [
                    filter,
                    [{ isPartitionPrimary: _ }, [me]],
                    [{ rawPrimaryLabelValue: _ }, [me]]
                ],

                /// true if "primary" is an integer multiple of
                ///  'primaryLabelValueDelta's away from 'firstPrimaryValue'
                ///
                isPartitionPrimary: [
                    defun, o("primary"),
                    [
                        equal,
                        0,
                        [
                            mod,
                            [
                                round,
                                [
                                    div,
                                    [
                                        minus,
                                        "primary",
                                        [{ firstPrimaryLabelValue: _ }, [me]]
                                    ],
                                    [{ primaryLabelValueDelta: _ }, [me]]
                                ]
                            ],
                            [{ alignmentUnitPerBin: _ }, [me]]
                        ]
                    ]
                ]
            }
        }
    ),

    LogCanvasSegmentPartition: o(
        {
            "class": "GeneralArea",
            context: {
                segmentAlignmentPixelSize: [
                    mul,
                    [{ oomPerPrimaryLabel: _ }, [me]],
                    [{ pixelPerOOM: _ }, [me]]
                ],

                firstBinEdgeLog: [
                    log10,
                    [
                        abs,
                        [first, [{ sortedBaseSegmentCanvasPartition: _ }, [me]]]
                    ]
                ],

                lastBinEdgeLog: [
                    log10,
                    [
                        abs,
                        [last, [{ sortedBaseSegmentCanvasPartition: _ }, [me]]]
                    ]
                ],

                firstBinPixelSize: [
                    mul,
                    [{ pixelPerOOM: _ }, [me]],
                    [
                        abs,
                        [
                            minus,
                            [{ firstBinEdgeLog: _ }, [me]],
                            [
                                log10,
                                [
                                    abs,
                                    [{ segmentStartValue: _ }, [me]]
                                ]
                            ]
                        ]
                    ]
                ],

                lastBinPixelSize: [
                    mul,
                    [{ pixelPerOOM: _ }, [me]],
                    [
                        abs,
                        [
                            minus,
                            [{ lastBinEdgeLog: _ }, [me]],
                            [
                                log10,
                                [
                                    abs,
                                    [{ segmentEndValue: _ }, [me]]
                                ]
                            ]
                        ]
                    ]
                ]
            }
        },

        {
            qualifier: { alignmentUnitPerBin: 0 },

            context: {
                ///
                /// partition the value span separating two adjacent primary
                ///  labels by the unit partition in
                ///  'alignmentUnitInternalPartition' (e.g. <0;1/2>, or
                ///  <0;1/3;2/3> or <0;1/4;1/2;3/4> etc.) such that they are
                ///  positioned equi-distantly along the oomPerPrimaryLabel oom's
                ///
                alignmentUnitInternalLogPartition: [
                    map,
                    [
                        defun, o("n"),
                        [
                            pow,
                            10,
                            [mul, "n", [{ oomPerPrimaryLabel: _ }, [me]]]
                        ]
                    ],
                    [{ alignmentUnitInternalPartition: _ }, [me]]
                ],

                /// start one primary before the actual first oom, to make sure
                ///  we cover the internal partition also in the range
                ///  segmentStartValue - firstPrimaryLabel
                inclusiveRawPrimaryLabelValue: o(
                    [
                        mul,
                        [
                            div,
                            [min, [abs, [{ rawPrimaryLabelValue: _ }, [me]]]],
                            [
                                pow,
                                10,
                                [{ oomPerPrimaryLabel: _ }, [me]]
                            ]
                        ],
                        [{ logSign: _ }, [me]]
                    ],
                    [{ rawPrimaryLabelValue: _ }, [me]]
                ),

                baseSegmentCanvasPartition: [
                    Rco(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [
                        map,
                        [{ applySegmentInternalPartition: _ }, [me]],
                        [{ inclusiveRawPrimaryLabelValue: _ }, [me]]
                    ]
                ],

                applySegmentInternalPartition: [
                    defun,
                    o("primary"),
                    [
                        mul,
                        "primary",
                        [{ alignmentUnitInternalLogPartition: _ }, [me]]
                    ]
                ]
            }
        },

        {
            qualifier: { alignmentUnitPerBin: r(1, Infinity) },

            context: {
                baseSegmentCanvasPartition: [
                    map,
                    [{ oom2value: _ }, [me]],
                    [
                        [{ oomSetModDelta: _ }, [me]],
                        [
                            mul,
                            [{ oomPerPrimaryLabel: _ }, [me]],
                            [{ alignmentUnitPerBin: _ }, [me]]
                        ]
                    ]
                ]
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////////////
    ///
    /// this class provides 1D-Marker placement for segmented  canvasses.
    ///
    /// 1D-Markers are placed in each segment independently (of other segments).
    ///
    /// Each 1D-Marker is 'placed' by associating it with a value-range.
    ///
    /// 1D-Markers are aligned with secondary labels - when these exist, or with
    ///  primary labels otherwise. "Alignment" means that a 1D-Marker that
    ///  includes a primary/secondary label's value necessarily starts at this
    ///  value (=> has a range which starts at this value)
    ///
    /// The inheriting class passes the following controls (some are only
    ///  relevant for linear segments):
    ///
    ///   oneDMarkerSpacing  - the maximal pixel spacing separating two
    ///      adjacent 1D-markers (having two much empty space between adjacent
    ///      1D-markers is considered confusing for the end-user)
    ///
    ///   oneDMarkerMinRatio - (defaults to 0.65) the ratio of oneDMarkerSpacing
    ///      which would be the minimal spacing between adjacent 1D-markers
    ///
    ///   oneDMarkerNegligibleMinUnitRatio - (defaults to 0.95) the class
    ///      attempts to generate/position 1D-Markers such that they would be
    ///      equi-distant; if the ratio of the number of minUnit's
    ///      in the 'wider' 1D-Markers divided by the number of minUnit's in
    ///      the 'narrower' 1D-Marker is higher that
    ///        'oneDMarkerNegligibleMinUnitRatio', then they are considered to be
    ///         practically the same and no extended search for a 'perfect'
    ///         partition is performed
    ///
    ///  oneDMarkerSingleValueThreshold - (defaults to 0.9) the class would
    ///      jump to make each 1D value marker associated with just a single
    ///      value even if the delta between two adjacent (minUnit allowed)
    ///      values is slightly less than
    ///      namely, if it's at least
    ///       oneDMarkerSpacing * oneDMarkerMinRatio *
    ///             oneDMarkerSingleValueThreshold
    ///
    ///
    //////////////////////////////////////////////////////////////////////////////
    OneDMarkerSegmentedCanvas: {
        "class": "GeneralArea",
        context: {
            oneDMarkerValue: [
                { children: { segment: { oneDMarkerValue: _ } } },
                [me]
            ]
        },

        children: {
            segment: {
                description: {
                    "class": "OneDMarkeredCanvasSegment"
                }
            }
        }
    },

    ///
    /// this class defines the set of values at which a 1-D marker value should
    ///  be placed
    /// the set is defined as 'oneDMarkerValue'
    /// each element of the set may be a simple single value, or a range.
    /// Each entry in this set os an object of the form:
    /// {
    ///    range: <single value or range>
    ///    value: <single value or range>
    /// }
    /// The 'range' field defines the set of values which are covered
    /// by the value marker, while 'value' is the rounded value represented
    /// by the value marker. Often, the two are identical, but when the size
    /// of the range covered by the marker is close to the unit of the
    /// scale, the marker value is just a single rounded value (e.g. 0.1, 0.2,
    /// 0.3 on a sclae whose minUnit is 0.1) while the range also covers
    /// a neightborhood around it, such as r(0.05,0.15). This is needed
    /// because while most convas calculations assume that all values are
    /// in the units of the scale (that is, rounded) the actual data used
    /// to determine which value markers to show is not necessarily rounded.
    /// The set of values (rounded) is chosen such that
    ///  the values are disjoint
    ///  only multiples of minUnit are used
    ///  every multiple of minUnit within the segment must be in some range
    ///   (where a simple value x is in this case identified with the range
    ///    rCC(x,  x))
    ///
    ///  the center point of adjacent ranges must be at most
    ///   'oneDMarkerMaxSpacing' pixels apart, or closer
    ///  the spacing between center points of any two adjacent markers should be
    ///   identical throughout the segment
    ///  the spacing should be as large as possible (while being smaller than
    ///   'oneDMarkerMaxSpacing'
    ///  one-d marker values should be aligned with secondaryLabelValue; that is,
    ///   if a range includes a secondary label, the secondary label should be
    ///   an edge of that 1-D marker
    ///  (for log scales, this applies only up to oom level; if the secondary
    ///   labels are sub-oom, then one-d-markers are only aligned with primary
    ///   labels)
    ///  for linear segments:
    ///    iff minUnit and pixel/valueDelta are such that the spacing between two
    ///    adjacent ranges must be larger than oneDMarkerMaxSpacing, than the
    ///    oneDMarkers must be single-valued (or a range rCC(x,x))
    ///  log segments are considered to be "continuous", and minUnit affects
    ///   precision but does not affect the scale logic
    ///
    OneDMarkeredCanvasSegment: o(
        {
            "class": "GeneralArea",
            context: {
                oneDMarkerSpacing: [{ oneDMarkerSpacing: _ }, [embedding]],

                oneDMarkerValueInRange: [
                    r(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [{ baseOneDMarkerValue: _ }, [me]]
                ]
            }
        },

        {
            qualifier: { scaleType: "linear" },
            "class": "LinearOneDMarkeredSegment"
        },

        {
            qualifier: { scaleType: "log" },
            "class": "LogOneDMarkeredSegment"
        }
    ),

    ///
    /// convert 'oneDMarkerMaxSpacing' - a pixel offset - to a value offset
    ///   'oneDMarkerMaxDelta'
    ///
    /// find the alignment delta 'oneDAlignmentValueDelta':
    ///   it is secondaryLabelValueDelta, or - if undefined -
    ///   primaryLabelValueDelta
    ///
    /// find 'oneDMarkerValueDelta', the maximal delta no bigger than
    ///   oneDMarkerMaxDelta which is a multiple of minUnit, and which is
    ///   an integer divisor of oneDAlignmentValueDelta
    ///
    /// find 'oneDMarkerPerAlignment',
    ///     oneDAlignmentValueDelta / oneDMarkerValueDelta
    ///
    /// find 'oneDInclusiveAlignmentSet', a subset of secondaryLabelValue, in
    ///   which every two adjacent values are oneDMarkerValueDelta apart, and
    ///   such that for every value in the segment, there's a member in the set
    ///  that is <= then the value (so that, eventually, the inclusive set may
    ///   in fact include a 'secondaryLabel' which is outside the segment, and
    ///   which is not in secondaryLabelValue
    ///
    /// for each value in the inclusive alignment set, add
    ///  0..(oneDMarkerPerAlignment-1) times oneDMarkerValueDelta to that
    ///  value to get the set of oneDMarkerValue
    /// 
    LinearOneDMarkeredSegment: {
        "class": "GeneralArea",
        context: {
            oneDMarkerMaxDelta: [
                mul,
                [{ oneDMarkerSpacing: _ }, [me]],
                [{ valueRangePerPixel: _ }, [me]]
            ],

            oneDMarkerMinRatio: 0.65,
            oneDMarkerMinDelta: [
                mul,
                [{ oneDMarkerMaxDelta: _ }, [me]],
                [{ oneDMarkerMinRatio: _ }, [me]]
            ],

            oneDAlignmentValueDelta: [
                first,
                o(
                    [{ secondaryLabelValueDelta: _ }, [me]],
                    [{ primaryLabelValueDelta: _ }, [me]]
                )
            ],

            oneDMarkerNegligibleMinUnitRatio: 0.95,

            oneDMarkerAlignmentDivisor: findMaxSmallerDivisor(
                [{ oneDMarkerMinDelta: _ }, [me]],
                [{ oneDMarkerMaxDelta: _ }, [me]],
                [{ minUnit: _ }, [me]],
                [{ oneDAlignmentValueDelta: _ }, [me]],
                [{ oneDMarkerNegligibleMinUnitRatio: _ }, [me]]
            ),

            oneDMarkerValueDelta1: [
                div,
                [{ oneDAlignmentValueDelta: _ }, [me]],
                [{ oneDMarkerAlignmentDivisor: _ }, [me]]
            ],

            oneDMarkerSingleValueThreshold: 0.9,

            oneDMarkerValueDelta: [
                cond,
                [
                    greaterThan,
                    [{ minUnit: _ }, [me]],
                    [
                        mul,
                        [{ oneDMarkerMinDelta: _ }, [me]],
                        [{ oneDMarkerSingleValueThreshold: _ }, [me]]
                    ]
                ],
                o(
                    {
                        on: true,
                        use: [{ minUnit: _ }, [me]]
                    },
                    {
                        on: false,
                        use: [{ oneDMarkerValueDelta1: _ }, [me]]
                    }
                )
            ],

            oneDMarkerPerAlignment: [
                round,
                [
                    div,
                    [{ oneDAlignmentValueDelta: _ }, [me]],
                    [{ oneDMarkerValueDelta: _ }, [me]]
                ]
            ],

            firstOneDAlignmentMult: [
                floor,
                [
                    div,
                    [{ segmentStartValue: _ }, [me]],
                    [{ oneDAlignmentValueDelta: _ }, [me]]
                ]
            ],

            lastOneDAlignmentMult: [
                round,
                [
                    div,
                    [{ segmentEndValue: _ }, [me]],
                    [{ oneDAlignmentValueDelta: _ }, [me]]
                ]
            ],

            oneDInclusiveAlignmentSet: [
                mul,
                [{ oneDAlignmentValueDelta: _ }, [me]],
                [
                    sequence,
                    r(
                        [{ firstOneDAlignmentMult: _ }, [me]],
                        [{ lastOneDAlignmentMult: _ }, [me]]
                    )
                ]
            ],

            baseOneDMarkerValue: [
                map,
                [{ applyOneDAlignmentSubdivision: _ }, [me]],
                [{ oneDInclusiveAlignmentSet: _ }, [me]]
            ],

            applyOneDAlignmentSubdivision: [
                defun,
                o("alignmentValue"),
                roundToUnit(
                    [
                        plus,
                        "alignmentValue",
                        [
                            mul,
                            [{ oneDMarkerValueDelta: _ }, [me]],
                            [
                                sequence,
                                r(
                                    0,
                                    [
                                        minus,
                                        [{ oneDMarkerPerAlignment: _ }, [me]],
                                        1
                                    ]
                                )
                            ]
                        ]
                    ],
                    [{ minUnit: _ }, [me]]
                )
            ],

            manyMinUnitPerMarker: [
                lessThanOrEqual,
                [
                    div,
                    [{ minUnit: _ }, [me]],
                    [{ oneDMarkerValueDelta: _ }, [me]]
                ],
                [{ oneDMarkerNegligibleMinUnitRatio: _ }, [me]]
            ],

            oneDMarkerValue: [
                cond,
                [{ manyMinUnitPerMarker: _ }, [me]],
                o(
                    {
                        on: true,
                        use: [{ mapWithManyMinUnitPerMarker: _ }, [me]]
                    },
                    {
                        on: false,
                        use: [{ mapWithFewMinUnitPerMarker: _ }, [me]]
                    }
                )
            ],

            mapWithManyMinUnitPerMarker: [
                map,
                [
                    defun,
                    o("idx"),
                    [
                        using,
                        "x_i",
                        [
                            pos,
                            "idx",
                            [{ oneDMarkerValueInRange: _ }, [me]]
                        ],
                        "x_i+1",
                        [
                            pos,
                            [plus, "idx", 1],
                            [{ oneDMarkerValueInRange: _ }, [me]]
                        ],
                        [
                            cond,
                            [
                                and,
                                [or,
                                    [{ isLastSegment: _ }, [me]],
                                    [{ containsMaxDataValue: _ }, [me]]
                                ],
                                [
                                    equal,
                                    [plus, "idx", 2],
                                    [size, [{ oneDMarkerValueInRange: _ }, [me]]]
                                ]
                            ],
                            o(
                                {
                                    on: false,
                                    use: {
                                        range: Rco("x_i", "x_i+1"),
                                        value: Rco("x_i", "x_i+1")
                                    }
                                },
                                {
                                    on: true,
                                    use: {
                                        range: Rcc("x_i", "x_i+1"),
                                        value: Rcc("x_i", "x_i+1")
                                    }
                                }
                            )
                        ]
                    ]
                ],
                [
                    sequence,
                    r(
                        0,
                        [minus, [size, [{ oneDMarkerValueInRange: _ }, [me]]], 2]
                    )
                ]
            ],

            mapWithFewMinUnitPerMarker: o(
                [
                    using,
                    "x0",
                    [
                        pos, 0,
                        [{ oneDMarkerValueInRange: _ }, [me]]
                    ],
                    "x1",
                    [
                        pos, 1,
                        [{ oneDMarkerValueInRange: _ }, [me]]
                    ],
                    {
                        range: Rco("x0", [div, [plus, "x0", "x1"], 2]),
                        value: "x0"
                    }
                ],
                [
                    using,
                    "x_i-1",
                    [
                        defun,
                        "idx",
                        [
                            pos,
                            [minus, "idx", 1],
                            [{ oneDMarkerValueInRange: _ }, [me]]
                        ]
                    ],
                    "x_i",
                    [
                        defun,
                        "idx",
                        [
                            pos,
                            "idx",
                            [{ oneDMarkerValueInRange: _ }, [me]]
                        ]
                    ],
                    "x_i+1",
                    [
                        defun,
                        "idx",
                        [
                            pos,
                            [plus, "idx", 1],
                            [{ oneDMarkerValueInRange: _ }, [me]]
                        ]
                    ],
                    [
                        map,
                        [
                            defun,
                            o("idx"),
                            {
                                range: Rco(
                                    [
                                        div,
                                        [plus, ["x_i-1", "idx"],
                                            ["x_i", "idx"]],
                                        2
                                    ],
                                    [
                                        div,
                                        [plus, ["x_i", "idx"],
                                            ["x_i+1", "idx"]],
                                        2
                                    ]
                                ),
                                value: ["x_i", "idx"]
                            }
                        ],
                        [
                            sequence,
                            r(
                                1,
                                [
                                    minus,
                                    [size, [{ oneDMarkerValueInRange: _ }, [me]]],
                                    2
                                ]
                            )
                        ]
                    ]
                ],
                [
                    using,
                    "lastIndex",
                    [
                        minus,
                        [size, [{ oneDMarkerValueInRange: _ }, [me]]],
                        1
                    ],
                    "x_n-1",
                    [
                        pos,
                        [minus, "lastIndex", 1],
                        [{ oneDMarkerValueInRange: _ }, [me]]
                    ],
                    "x_n",
                    [
                        pos,
                        "lastIndex",
                        [{ oneDMarkerValueInRange: _ }, [me]]
                    ],
                    {
                        range: Rcc(
                            [div, [plus, "x_n-1", "x_n"], 2],
                            "x_n"
                        ),
                        value: "x_n"
                    }
                ]
            )
        }
    },

    ///
    /// convert 'oneDMarkerSpacing' - a pixel offset - to the maximal number
    ///  of oom's in each 1D marker, 'maxOOMPerOneDMarker'
    ///
    /// Find the number of OOMs in an alignment unit 'oomPerOneDMarkerAlignment':
    ///  if primaryLabelCoversAllOOM:true then it's necessarily 1;
    ///   otherwise it is oomPerSecondaryLabel; or, if that's undefined,
    ///   oomPerPrimaryLabel
    ///
    /// Find 'oneDMarkerPerAlignment',
    ///    ceil(oomPerOneDMarkerAlignment / maxOOMPerOneDMarker)
    ///
    /// find 'oneDMarkerFactor', the multiplicative factor covered by each
    ///   1D value marker,
    ///   10^(oomPerOneDMarkerAlignment/oneDMarkerPerAlignment)
    ///
    /// find 'oneDInclusiveAlignmentSet', a set of ooms where each adjacent pair
    ///  is oomPerOneDAlignment ooms apart, and where for each value in the
    ///  segment there's a member in the set which is <= than the value (in abs
    ///  value)
    ///
    /// For each oom in the inclusive oom set apply the multiplicative
    ///  factor 'oneDMarkerFactor' 0..(oneDMarkerPerAlignment-1) times
    ///
    LogOneDMarkeredSegment: {
        "class": "GeneralArea",
        context: {
            maxOOMPerOneDMarker: [
                div,
                [{ oneDMarkerSpacing: _ }, [me]],
                [{ pixelPerOOM: _ }, [me]]
            ],

            oomPerOneDMarkerAlignment: [
                cond,
                [{ primaryLabelCoversAllOOM: _ }, [me]],
                o(
                    {
                        on: true,
                        use: 1
                    },
                    {
                        on: false,
                        use: [
                            first,
                            o(
                                [{ oomPerSecondaryLabel: _ }, [me]],
                                [{ oomPerPrimaryLabel: _ }, [me]]
                            )
                        ]
                    }
                )
            ],

            oneDMarkerPerAlignment: [
                ceil,
                [
                    div,
                    [{ oomPerOneDMarkerAlignment: _ }, [me]],
                    [{ maxOOMPerOneDMarker: _ }, [me]]
                ]
            ],

            oneDMarkerFactor: [
                pow,
                10,
                [
                    div,
                    [{ oomPerOneDMarkerAlignment: _ }, [me]],
                    [{ oneDMarkerPerAlignment: _ }, [me]]
                ]
            ],

            baseOneDMarkerOOMSet: [
                map,
                [
                    defun,
                    "oom",
                    [
                        mul,
                        [pow, 10, "oom"],
                        [{ logSign: _ }, [me]]
                    ]
                ],
                [
                    [{ oomSetModDelta: _ }, [me]],
                    [{ oomPerOneDMarkerAlignment: _ }, [me]]
                ]
            ],

            oneDInclusiveAlignmentSet: o(
                [{ baseOneDMarkerOOMSet: _ }, [me]],
                [
                    mul,
                    [
                        div,
                        [min, [abs, [{ baseOneDMarkerOOMSet: _ }, [me]]]],
                        [
                            pow,
                            10,
                            [{ oomPerOneDMarkerAlignment: _ }, [me]]
                        ]
                    ],
                    [{ logSign: _ }, [me]]
                ]
            ),

            baseOneDMarkerValue: o(
                [{ segmentStartValue: _ }, [me]],
                [
                    map,
                    [{ applyOneDMultFactorSet: _ }, [me]],
                    [{ oneDInclusiveAlignmentSet: _ }, [me]]
                ],
                [
                    cond,
                    [{ isLastSegment: _ }, [me]],
                    { on: true, use: [{ segmentEndValue: _ }, [me]] }
                ]
            ),

            oneDMarkerFactorSet: [
                map,
                [defun, o("p"), [pow, [{ oneDMarkerFactor: _ }, [me]], "p"]],
                [sequence, r(0, [minus, [{ oneDMarkerPerAlignment: _ }, [me]], 1])]
            ],

            applyOneDMultFactorSet: [
                defun,
                o("oom"),
                [mul, "oom", [{ oneDMarkerFactorSet: _ }, [me]]]
            ],

            oneDMarkerValue: [
                map,
                [
                    defun,
                    o("idx"),
                    [
                        using,
                        "range",
                        [
                            [{ genOneDMarkerRange: _ }, [me]],
                            [   // from
                                pos,
                                "idx",
                                [{ sortedOneDMarkerValueInRange: _ }, [me]]
                            ],
                            [   // to
                                pos,
                                [plus, "idx", 1],
                                [{ sortedOneDMarkerValueInRange: _ }, [me]]
                            ],
                            [   // lastInSegment (to decide whether the range is close or open at the top)
                                equal,
                                "idx",
                                [
                                    minus,
                                    [
                                        size,
                                        [{ sortedOneDMarkerValueInRange: _ }, [me]]
                                    ],
                                    2
                                ]
                            ]
                        ],
                        {
                            range: "range",
                            value: "range"
                        }
                    ]
                ],
                [
                    sequence,
                    r(
                        0,
                        [
                            minus,
                            [size, [{ sortedOneDMarkerValueInRange: _ }, [me]]],
                            2
                        ]
                    )
                ]
            ],

            sortedOneDMarkerValueInRange: [filter,
                [defun, "value",
                    [greaterThanOrEqual, "value", [{ minUnit: _ }, [me]]]
                    // need to filter out values that are lower than minUnit 
                    // (since they should be taken care of by prev segments)
                ],
                [sort,
                    [
                        _,
                        [
                            identify,
                            _,
                            [
                                map,
                                [
                                    defun,
                                    o("v"),
                                    roundToUnit("v", [{ minUnit: _ }, [me]])
                                ],
                                [{ oneDMarkerValueInRange: _ }, [me]]
                            ]
                        ]
                    ],
                    "ascending"
                ]
            ],

            genOneDMarkerRange: [
                defun,
                o("from", "to", "lastInSegment"),
                [
                    cond,
                    [
                        and,
                        [{ isLastSegment: _ }, [me]],
                        "lastInSegment"
                    ],
                    o(
                        { on: true, use: Rcc("from", "to") },
                        { on: false, use: Rco("from", "to") }
                    )
                ]
            ]
        }
    }
};
