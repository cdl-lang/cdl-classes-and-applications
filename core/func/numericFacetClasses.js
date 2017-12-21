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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This library contains common code to the SliderFacetClasses and the DateFacetClasses
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <numericFacetDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherited by NumericDataTypeFacet and by DateDataTypeFacet.
    // API:
    // 1. bigNumber: false by default. overwritten by NumericDataTypeFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericFacet: {
        "class": "UDFReferenceable",
        context: {
            maxVal: [cond,
                [{ dataObj: { maxVal: _ } }, [me]],
                o(
                    { on: true, use: [{ dataObj: { maxVal: _ } }, [me]] },
                    { on: false, use: [max, [{ compressedEffectiveBaseNumericalValues: _ }, [me]]] }
                )
            ],
            minVal: [cond,
                [{ dataObj: { minVal: _ } }, [me]],
                o(
                    { on: true, use: [{ dataObj: { minVal: _ } }, [me]] },
                    { on: false, use: [min, [{ compressedEffectiveBaseNumericalValues: _ }, [me]]] }
                )
            ],
            valRange: [minus,
                [{ maxVal: _ }, [me]],
                [{ minVal: _ }, [me]]
            ],
            meaningfulValueRange: [and,
                [{ maxVal: _ }, [me]],
                [{ minVal: _ }, [me]],
                [notEqual, [{ maxVal: _ }, [me]], [{ minVal: _ }, [me]]]
            ],

            bigNumber: false,
            defaultNumericFormatObj: [pos,
                [cond,
                    [{ dataObj: { defaultNumericFormattingObjPos: _ } }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ dataObj: { defaultNumericFormattingObjPos: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: [cond,
                                [{ bigNumber: _ }, [me]],
                                o(
                                    { on: false, use: [{ numericConstants: { defaultNumericFormattingObjPos: _ } }, [globalDefaults]] },
                                    { on: true, use: [{ numericConstants: { bigNumberNumericFormattingObjPos: _ } }, [globalDefaults]] }
                                )
                            ]
                        }
                    )
                ],
                [{ myApp: { numericFormats: _ } }, [me]]
            ],
            numericFormat: [mergeWrite,
                [{ crossViewFacetDataObj: { numericFormat: _ } }, [me]],
                [{ defaultNumericFormatObj: _ }, [me]]
            ],
            numericFormatType: [{ numericFormat: { type: _ } }, [me]],
            numberOfDigits: [{ numericFormat: { numberOfDigits: _ } }, [me]],
            commaDelimited: [{ numericFormat: { commaDelimited: _ } }, [me]],

            myHistogramBins: [
                // note we project the children, and not simply [areaOfClass], to maintain the ordering of the areaSet.
                { children: { numericBins: _ } },
                [
                    {
                        myFacet: [me],
                        ofFirstHistogram: true // we need a sample DateHistogramView, not all of them.
                    },
                    [areaOfClass, "HistogramView"]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myAnchorContinuousRange: an areaRef that will serve as the anchor for the widget's canvas.
    // 2. myCanvas and myScale: areaRef referenced by TrackMyNumericWidget, inherited by areas associated with this NumericWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericWidget: {
        "class": o("GeneralArea", "NumericElement"),
        context: {
            marginAroundExtremumPoint: 0,  // for now, i.e. if there are valueMarkers at edges, with markerByValue: true, 
            // they will 'spill' out of the continuous range.
            maxVal: [{ myFacet: { maxVal: _ } }, [me]],
            minVal: [{ myFacet: { minVal: _ } }, [me]],
            valRange: [{ myFacet: { valRange: _ } }, [me]],

            baseOverlayContinuousRangeLength: [offset,
                {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                }
            ]
        },
        position: {
            labelMaxValPoint: {
                point1: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ highValLength: _ }, [me]],
                    content: true
                },
                point2: { label: "maxValPoint" },
                equals: [{ marginAroundExtremumPoint: _ }, [me]]
            },
            labelMinValPoint: {
                point1: { label: "minValPoint" },
                point2: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ lowValLength: _ }, [me]],
                    content: true
                },
                equals: [{ marginAroundExtremumPoint: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting class to track the set of context labels defined in TrackMyWidget, including myCanvas.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyNumericWidget: o(
        { // default
            "class": o("NumericElement", "TrackMyWidget"),
            context: {
                myCanvas: [{ myWidget: { myCanvas: _ } }, [me]],
                myScale: [{ myWidget: { myScale: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericCanvas: {
        "class": o("GeneralArea", "SegmentedCanvasAdapter"),
        context: {
            values: [{ myFacet: { compressedEffectiveBaseNumericalValues: _ } }, [me]],
            minDataValue: [min, [{ values: _ }, [me]]],
            maxDataValue: [max, [{ values: _ }, [me]]],

            defaultMinValue: [first,
                o(
                    // if initUserScaleMinValue isn't defined, then defaultMinValue will be minDataValue
                    [{ myFacet: { dataObj: { initUserScaleMinValue: _ } } }, [me]],
                    [{ minDataValue: _ }, [me]]
                )
            ],
            defaultMaxValue: [first,
                o(
                    // if initUserScaleMinValue isn't defined, then defaultMaxValue will be maxDataValue
                    [{ myFacet: { dataObj: { initUserScaleMaxValue: _ } } }, [me]],
                    [{ maxDataValue: _ }, [me]]
                )
            ],

            // userScaleMaxValue/userScaleMinValue are SliderCanvas' appData and not SliderFacet's in preparation for 2D plots, and the potential need
            // to give the same slider two different user-defined scales when appearing in different plots.
            userScaleMinValue: [{ currentViewWidgetDataObj: { userScaleMinValue: _ } }, [me]],
            minValue: [mergeWrite,
                [{ userScaleMinValue: _ }, [me]],
                [{ defaultMinValue: _ }, [me]]
            ],
            minValueGreaterThanMinDataValue: [greaterThan,
                [{ minValue: _ }, [me]],
                [{ minDataValue: _ }, [me]]
            ],

            userScaleMaxValue: [{ currentViewWidgetDataObj: { userScaleMaxValue: _ } }, [me]],
            maxValue: [mergeWrite,
                [{ userScaleMaxValue: _ }, [me]],
                [{ defaultMaxValue: _ }, [me]]
            ],
            maxValueLessThanMaxDataValue: [lessThan,
                [{ maxValue: _ }, [me]],
                [{ maxDataValue: _ }, [me]]
            ],

            // this could go to a base class
            minValPoint: {
                element: [{ myWidget: _ }, [me]],
                label: "minValPoint"
            },
            maxValPoint: {
                element: [{ myWidget: _ }, [me]],
                label: "maxValPoint"
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. numericElementRef (default myFacet)
    // 2. Inherit Vertical or Horizontal
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                highValAtTop: [{ numericElementRef: { highValAtTop: _ } }, [me]],
                highValAtRight: [{ numericElementRef: { highValAtRight: _ } }, [me]],
                highValAtLowHTMLLength: o(
                    [and,
                        [{ highValAtTop: _ }, [me]],
                        [
                            "Vertical",
                            [classOfArea, [me]]
                        ]
                    ],
                    [and,
                        [not, [{ highValAtRight: _ }, [me]]],
                        [
                            "Horizontal",
                            [classOfArea, [me]]
                        ]
                    ]
                )
            }
        },
        { // default
            context: {
                numericElementRef: [{ myFacet: _ }, [me]]
                // this can be modified by other classes inheriting this via superclass
                // for instance see exportHistogram.js
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            context: {
                // i.e. highVal is top/left and lowVal is bottom/right.
                // example of use: a "normal" vertical slider, where the high value is associated with "a better value", such as "yield".
                // note that when switching to a horizontal slider, the relationship switches!
                highValLength: [{ lowHTMLLength: _ }, [me]],
                lowValLength: [{ highHTMLLength: _ }, [me]]
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            // i.e. highVal is bottom/right and lowVal is top/left
            // example of use: a ranking vertical slider, where the low value is associated with "a better value", such as "ranking" (#1 in the ranking is better than #100) 
            // note that when switching to a horizontal slider, the relationship switches!
            context: {
                highValLength: [{ highHTMLLength: _ }, [me]],
                lowValLength: [{ lowHTMLLength: _ }, [me]]
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Aux class which maps directions on the numeric axis to html points - allows inheriting classes to be axis-agnostic.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalNumericElement: {
        "class": o("NumericElement", "Vertical")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Aux class which maps directions on the numeric axis to html points - allows inheriting classes to be axis-agnostic.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalNumericElement: {
        "class": o("NumericElement", "Horizontal")
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class is inherited by SliderHistogramView and DateHistogramView.
    // Note: HistogramView inherits TrackMyHistogram which provides OrientedElement, and its refOrientedElement is myHistogram.
    // So in a Vertical primary widget, since the Histogram inherits Horizontal, so does the HistogramView. 
    // In short, and for example, when the SliderCanvas is vertical (PrimaryWidget is vertical), the NumericHistogramView's lowHTMLGirth is "top" (not "left"!)
    //
    // API:
    // 1. nonNumericalValuesExist: false, by default (is left undefined and so is evaluated as false).
    // 2. binRangeEdgeValues: the os of values that define the edges of all bins, from low value to high value. each value is to appear once.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericHistogramView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                nonNumericalValuesExist: [{ myFacet: { values: _ } }, [me]]
            }
        },
        { // default 
            "class": o(
                "OrientedElement", // required to ensure that the Vertical/Horizontal orientation of the embedding histogram overrides the 
                // ExpandableRight (and its inheritance of Horizontal) that comes with HistogramView's inheritance of ExpandableInFacet.
                "HistogramView"),
            context: {
                myCanvas: [{ myWidget: { myCanvas: _ } }, [me]], // note: we want the canvas for the numeric range, not for the histogram itself!
                lastBinRangeEnd: [ // NumericHistogramBin observes this value
                    last,
                    [{ binRangeEdgeValues: _ }, [me]]
                ]
            },
            position: {
                attachLowHTMLGirthToMyAnchorContinuousRange: {
                    point1: {
                        element: [{ myWidget: { myAnchorContinuousRange: _ } }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                }
            },
            children: {
                numericBins: {
                    // each two  adjacent partition values define one bin;
                    // an area-set member is created for each bin start value,
                    // the last bin end-value is taken from 'lastBinRangeEnd' above
                    data: [identify,
                        _,
                        [pos,
                            r(0, -2),
                            [{ binRangeEdgeValues: _ }, [me]]
                        ]
                    ],
                    description: {
                        // provided by inheriting classes
                    }
                }
            }
        },
        {
            qualifier: { nonNumericalValuesExist: false },
            position: {
                attachHighHTMLGirthToMyAnchorContinuousRange: {
                    point1: {
                        element: [{ myWidget: { myAnchorContinuousRange: _ } }, [me]],
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { nonNumericalValuesExist: true },
            position: {
                attachHighHTMLGirthToNonNumericalValuesView: {
                    point1: {
                        element: [
                            { myWidget: [{ myWidget: _ }, [me]] },
                            [areaOfClass, "SliderNonNumericalValuesView"]
                        ],
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    equals: 0
                }
            },
            children: {
                dmz: {
                    description: {
                        "class": "NumericHistogramViewDMZ"
                    }
                },
                discreteBins: {
                    // note: these are not all discrete values in the facet, only those in view!
                    // also note that the data for the areaSet is data, not areaRefs - this is because the corresponding data in a SliderHistogramView is also
                    // data, and we cannot mix data and areaRefs. the DiscreteHistogramBin uses its param.areaSetContent to obtain its myDiscreteValue.
                    data: [{ myWidget: { discreteValues: { value: _ } } }, [me]],
                    description: {
                        "class": "DiscreteHistogramBin"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by SliderHistogramBin and DateHistogramBin.
    //
    // the value range for each bin is made known to the bin as follows:
    //  - the range start is the param.areaSetContent
    //  - the range end is the range start of the [next] bin, except for the last bin, for which  the range end is the embedding's lastBinRangeEnd
    //
    // the range is closed on both ends for the last bin, while for all the other bins it is 'Rco', closed on the start value and open on the end value.
    //
    // the bin is positioned along the canvas by calculating the canvas's 'valueToOffset' of the two edges of the bin, and using that as an
    // offset from the canvas minValPoint
    // 
    // API:
    // 1. lastBinRangeEnd: should be defined in the embedding area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericHistogramBin: o(
        { // default
            "class": o("NumericElement", "HistogramBin"),
            context: {
                firstBin: [not, [prev]],
                lastBin: [not, [next]],

                myCanvas: [{ myWidget: { myCanvas: _ } }, [me]],

                binRangeStart: [{ param: { areaSetContent: _ } }, [me]],
                binRangeEnd: [
                    cond,
                    [{ lastBin: _ }, [me]],
                    o(
                        { on: true, use: [{ lastBinRangeEnd: _ }, [embedding]] },
                        { on: false, use: [{ binRangeStart: _ }, [next]] }
                    )
                ],

                binRange: [
                    cond,
                    [{ lastBin: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: r(
                                [{ binRangeStart: _ }, [me]],
                                [{ binRangeEnd: _ }, [me]]
                            )
                        },
                        {
                            on: false,
                            use: Rco(
                                [{ binRangeStart: _ }, [me]],
                                [{ binRangeEnd: _ }, [me]]
                            )
                        }
                    )
                ],

                // HistogramBin params:
                binValue: [{ binRange: _ }, [me]],
                binSelectionQuery: [
                    [{ myFacet: { facetSelectionQueryFunc: _ } }, [me]],
                    [{ binRange: _ }, [me]]
                ]
            },

            position: {
                // note: both highValLength and lowValLength are positioned wrt minValPoint!
                highValPos: { // position highValLength wrt minValPoint. the sign of the offset determined by ofVerticalElement
                    point1: [{ myCanvas: { minValPoint: _ } }, [me]],
                    point2: { type: [{ highValLength: _ }, [me]] },
                    equals: [
                        mul,
                        [
                            [{ myCanvas: { valueToOffset: _ } }, [me]],
                            [{ binRangeEnd: _ }, [me]]
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
                },

                lowValPos: { // position lowValLength wrt minValPoint. the sign of the offset determined by ofVerticalElement
                    point1: [{ myCanvas: { minValPoint: _ } }, [me]],
                    point2: { type: [{ lowValLength: _ }, [me]] },
                    equals: [
                        mul,
                        [
                            [{ myCanvas: { valueToOffset: _ } }, [me]],
                            [{ binRangeStart: _ }, [me]]
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
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            context: {
                highValLength: "top",
                lowValLength: "bottom"
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            context: {
                highValLength: "right",
                lowValLength: "left"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A control for increasing/decreasing histogram bin count
    // API:
    // 1. Inheriting class should define children called moreBinButton/lessBinButton/countDisplay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericHistogramBinCountControl: o(
        { // default
            "class": o("GeneralArea", "MinWrap", "OrientedElement", "TrackMyFacet"),
            context: {
                minWrapAround: 0,
                myHistogramsViewContainer: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "HistogramsViewContainer"]
                ],
                firstHistogramView: [
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        ofFirstHistogram: true
                    },
                    [areaOfClass, "HistogramView"]
                ]
            },
            position: {
                attachMoreToBinCount: {
                    point1: {
                        element: [{ children: { moreBinButton: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { countDisplay: _ } }, [me]],
                        type: "top"
                    },
                    equals: 0
                },
                attachBinCountToLess: {
                    point1: {
                        element: [{ children: { countDisplay: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { lessBinButton: _ } }, [me]],
                        type: "top"
                    },
                    equals: 0
                }
            },
            children: {
                moreBinButton: {
                    description: {
                        // defined by inheriting class
                    }
                },
                countDisplay: {
                    description: {
                        // defined by inheriting class
                    }
                },
                lessBinButton: {
                    description: {
                        // defined by inheriting class
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false }, // e.g. when used for a vertical slider
            position: {
                "vertical-center": 0,
                attachToMyHistogramsViewContainer: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myHistogramsViewContainer: _ }, [me]],
                        type: "right"
                    },
                    equals: [densityChoice, [{ sliderPosConst: { sliderHistogramBinCountControlFromRightmostHistogramView: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true }, // e.g. when used for a horizontal date
            position: {
                centerVerticallyWrtMyAddNewHistogramControl: {
                    pair1: {
                        point1: {
                            element: [{ myAddNewHistogramControl: _ }, [me]],
                            type: "bottom"
                        },
                        point2: {
                            type: "vertical-center"
                        }
                    },
                    pair2: {
                        point1: {
                            type: "vertical-center"
                        },
                        point2: {
                            element: [{ myPrimaryWidget: _ }, [me]],
                            type: "bottom"
                        },
                    },
                    ratio: 1
                },
                centerHorizontallyBetweenPrimaryWidgetAndHistogramViews: {
                    pair1: {
                        point1: {
                            element: [{ firstHistogramView: _ }, [me]],
                            type: "right"
                        },
                        point2: {
                            type: "horizontal-center"
                        }
                    },
                    pair2: {
                        point1: {
                            type: "horizontal-center"
                        },
                        point2: {
                            element: [{ myPrimaryWidget: _ }, [me]],
                            type: "right"
                        }
                    },
                    ratio: 1
                }
            },
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    // API:
    // 1. tooltipText
    // 2. nextBinCount
    // 3. lastBinCount
    // 4. binCount should be defined in embedding.
    // 5. histogramBinButtonTooltipTextSuffix
    ////////////////////////////////////////////////////////////////////////
    NumericHistogramBinButton: o(
        { // default
            "class": o("GeneralArea", "ControlModifiedPointer", "TrackMyFacet"),
            context: {
                activeControl: [notEmpty, [{ nextBinCount: _ }, [me]]],
                binCount: [{ binCount: _ }, [embedding]],
                ofVerticalElement: true // a vertical element (for embedded arrow)
            },
            position: {
                // dimensions: provided by Design class inherited by siblings
                "horizontal-center": 0
            }
        },
        {
            qualifier: { activeControl: true },
            "class": "Tooltipable",
            write: {
                onNumericHistogramBinButtonDoubleClickExpired: {
                    "class": "OnMouseDoubleClickExpired",
                    true: {
                        nextBinCount: {
                            to: [{ binCount: _ }, [me]],
                            merge: [{ nextBinCount: _ }, [me]]
                        }
                    }
                },
                onNumericHistogramBinButtonDoubleClicked: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        lastBinCount: {
                            to: [{ binCount: _ }, [me]],
                            merge: [{ lastBinCount: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    // API:
    // 1. NumericHistogramBinButton API
    ////////////////////////////////////////////////////////////////////////
    NumericHistogramMoreBinButton: {
        "class": "NumericHistogramBinButton",
        context: {
            tooltipText: [concatStr, o([{ myApp: { increaseStr: _ } }, [me]], " ", [{ histogramBinButtonTooltipTextSuffix: _ }, [me]])]
        },
        position: {
            top: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////
    // API:
    // 1. NumericHistogramBinButton API
    ////////////////////////////////////////////////////////////////////////
    NumericHistogramLessBinButton: {
        "class": "NumericHistogramBinButton",
        context: {
            tooltipText: [concatStr, o([{ myApp: { decreaseStr: _ } }, [me]], " ", [{ histogramBinButtonTooltipTextSuffix: _ }, [me]])]
        },
        position: {
            bottom: 0
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    ///////////////////////////////////////////////////////////////////////
    NumericHistogramBinCount: {
        "class": o("GeneralArea", "DisplayDimension", "TrackMyFacet"),
        position: {
            "horizontal-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // NOTE: Not defined properly for a horizontal slider!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericHistogramViewDMZ: {
        "class": o("NumericHistogramViewDMZDesign", "GeneralArea", "TrackMyHistogram"),
        position: {
            left: 0,
            right: 0,
            attachTopToBottomNumericHistogramBin: {
                point1: {
                    element: [
                        {
                            myFacet: [{ myFacet: _ }, [me]],
                            firstBin: true
                        },
                        [areaOfClass, "NumericHistogramBin"]
                    ],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: 0
            },
            attachBottomToTopOfNumericNonNumericalValuesView: {
                point1: { type: "bottom" },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "NumericNonNumericalValuesView"]
                    ],
                    type: "top"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // Note: tested only in a vertical slider. most likely doesn't work in a horizontal one!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    NumericNonNumericalValuesView: {
        "class": o("GeneralArea", "DiscreteValuesView", "ExpandableTop")
    }
};
