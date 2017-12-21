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
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <dateFacetDesignClasses.js>

initGlobalDefaults.dateConst = {
    maxNumBins: 75
};

var dateObjects = o(
    {
        nameSingular: "Year",
        namePlural: "Years",
        uniqueID: "years"
    },
    {
        nameSingular: "Quarter",
        namePlural: "Quarters",
        uniqueID: "quarters"
    },
    {
        nameSingular: "Month",
        namePlural: "Months",
        uniqueID: "months"
    },
    {
        nameSingular: "Week",
        namePlural: "Weeks",
        uniqueID: "weeks"
    },
    {
        nameSingular: "Day",
        namePlural: "Days",
        uniqueID: "days"
    }/*,
    {
        nameSingular: "Hour",
        namePlural: "Hours",
        uniqueID: "hours"
    },
    {
        nameSingular: "Minute",
        namePlural: "Minutes",
        uniqueID: "minutes"
    }
    */
);

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateFacet: o(
        { // default
            "class": "FacetWithAmoeba",
            context: {
                defaultShowHistogram: true,
                highValAtRight: true,

                dateInputFormat: [{ myApp: { defaultAbridgedDateFormat: _ } }, [me]],
                dateDisplayFormat: [{ myApp: { defaultDateFormat: _ } }, [me]],

                // FacetWithAmoeba's API (per the API of its embedded OverlayMeasurePairInFacet)
                valuesForMeasure: [{ myHistogramBins: { binRange: _ } }, [me]] // may be empty if this facet is not displaying its histograms
            }
        },
        {
            qualifier: { embedAmoeba: true },
            context: {
                leftExpansionPosPoint: atomic( // override ExpandableRight default value.
                    {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left"
                    }
                )
            },
            children: {
                amoeba: {
                    description: {
                        "class": compileDate ? "DateAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateAmoeba: {
        "class": "Amoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "DatePrimaryWidget"
                }
            },
            histogramsViewContainer: {
                description: {
                    "class": compileHistogram ? "DateHistogramsViewContainer" : o()
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateWidget: {
        "class": "NumericWidget",
        context: {
            myAnchorContinuousRange: [{ children: { dateContinuousRange: _ } }, [me]],
            myCanvas: [{ children: { canvas: _ } }, [me]],
            myScale: [{ children: { scale: _ } }, [me]]
        },
        children: {
            canvas: {
                description: {
                    "class": "DateCanvas"
                }
            },
            scale: {
                description: {
                    "class": "DateScale"
                }
            },
            dateContinuousRange: {
                description: {
                    "class": "DateContinuousRange"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyDateWidget: o(
        { // variant-controller 
            qualifier: "!",
            context: {
            }
        },
        { // default
            "class": "TrackMyNumericWidget",
            context: {
                myAnchorContinuousRange: [{ myWidget: { myAnchorContinuousRange: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DatePrimaryWidget: {
        "class": o(
            "HorizontalNumericElement", // takes precedence over PrimaryWidget's inheritance of Vertical class
            "PrimaryWidget",
            "DateWidget"),
        position: {
            left: 0,
            labelVerticalAnchorForHistogram: { // used to position the associated VerticalHistogramsViewContainer
                point1: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: "top"
                },
                point2: {
                    label: "verticalAnchorForHistogram"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateScale: {
        "class": o("GeneralArea", "TrackMyDateWidget"),
        children: {
            primaryLabels: {
                data: o(
                    [{ myCanvas: { minValue: _ } }, [me]],
                    [{ myCanvas: { maxValue: _ } }, [me]]
                ),
                description: {
                    "class": "DateScalePrimaryLabel"
                }
            },
            nextControl: {
                description: {
                    "class": "NextTimePeriodControl"
                }
            },
            prevControl: {
                description: {
                    "class": "PrevTimePeriodControl"
                }
            },
            fwdControl: {
                description: {
                    "class": "FwdTimePeriodControl"
                }
            },
            backControl: {
                description: {
                    "class": "BackTimePeriodControl"
                }
            }
        },
        position: {
            frame: 0 // for now, as big as the Widget
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateScaleElement: {
        "class": o(
            "GeneralArea",
            "ScaleElement",
            "TrackMyDateWidget"
        ),
        context: {
            highValAtLowHTMLLength: false, // for PositionByCanvasOffset
        },
        position: {
            attachToMyAnchorContinuousRangeBottom: {
                point1: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [densityChoice, [{ datePosConst: { dateScaleElementTopMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateScalePrimaryLabel: o(
        { // variant-controller
            qualifier: "!",
            context: {
                scaleMinValue: [
                    [{ value: _ }, [me]],
                    [{ myCanvas: { minValue: _ } }, [me]]
                ],
                scaleMaxValue: [
                    [{ value: _ }, [me]],
                    [{ myCanvas: { maxValue: _ } }, [me]]
                ],
                scaleEdgeValue: o(
                    [{ scaleMinValue: _ }, [me]],
                    [{ scaleMaxValue: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "DateScaleElement", "ScaleLabeledTickmark", "TrackMyDateWidget"),
            context: {
                // value: defined in ScaleElement via param.areaSetContent
                date: [numToDate, [{ value: _ }, [me]], [{ myFacet: { dateDisplayFormat: _ } }, [me]]],
                textToTickmarkOffset: [densityChoice, [{ datePosConst: { tickmarkToTextVerticalOffset: _ } }, [globalDefaults]]]
            },
            children: {
                text: {
                    description: {
                        "class": "DateScaleLabelText"
                    }
                },
                tickmark: {
                    description: {
                        "class": "DateScaleLabelTickmark"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    // Once this class provides better protection for the user, see SliderScaleEditableLabelText how it was done there.
    ////////////////////////////////////////////////////////////////////////
    DateScaleLabelText: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofScaleMinValuePrimaryLabel: [{ scaleMinValue: _ }, [embedding]],
                ofScaleMaxValuePrimaryLabel: [{ scaleMaxValue: _ }, [embedding]],
                ofScaleEdgePrimaryLabel: [{ scaleEdgeValue: _ }, [embedding]]
            }
        },
        { // default
            "class": o("DateScaleLabelTextDesign", "GeneralArea", "ScaleText", "TrackMyDateWidget"),
            context: {
                displayText: [{ date: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofScaleEdgePrimaryLabel: true },
            "class": "DateInput",
            context: {
                dateInputFormat: [{ myFacet: { dateInputFormat: _ } }, [me]],
                // repeat displayText definition from default clause, to override the displayText definition provided by DateInput herein
                displayText: [{ date: _ }, [embedding]],

                allowWritingInput: o(
                    [not, [{ param: { input: { value: _ } } }, [me]]], // we allow writing an o() - that resets the DateScalePrimaryLabel to its default value
                    [and,
                        [{ inputIsAValidDate: _ }, [me]],
                        [not, [{ minMaxOrderViolated: _ }, [me]]]
                    ]
                ),

                dateFormatViolated: [not, [{ inputIsAValidDate: _ }, [me]]]
            }
        },
        {
            qualifier: {
                ofScaleEdgePrimaryLabel: true,
                allowWritingInput: true
            },
            context: {
                myDateHistogramBinCountControl: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "DateHistogramBinCountControl"]
                ]
            },
            write: {
                onTextInputExitEditInputTextMode: {
                    // upon: see TextInput
                    true: {
                        resetBinCountToDefault: {
                            to: [{ myDateHistogramBinCountControl: { binCount: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                ofScaleEdgePrimaryLabel: true,
                ofScaleMinValuePrimaryLabel: true
            },
            context: {
                inputAppData: [{ myCanvas: { minValue: _ } }, [me]],
                minMaxOrderViolated: [and,
                    [{ inputIsAValidDate: _ }, [me]],
                    [greaterThanOrEqual,
                        [{ dateInputValueAsNumber: _ }, [me]],
                        [{ myCanvas: { maxValue: _ } }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: {
                ofScaleEdgePrimaryLabel: true,
                ofScaleMaxValuePrimaryLabel: true
            },
            context: {
                inputAppData: [{ myCanvas: { maxValue: _ } }, [me]],
                minMaxOrderViolated: [and,
                    [{ inputIsAValidDate: _ }, [me]],
                    [greaterThanOrEqual,
                        [{ myCanvas: { minValue: _ } }, [me]],
                        [{ dateInputValueAsNumber: _ }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: {
                editInputText: true,
                minMaxOrderViolated: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: "Beginning date must preceed end Date"
            }
        },
        {
            qualifier: {
                editInputText: true,
                dateFormatViolated: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: [concatStr,
                    o(
                        "Date format: ",
                        [{ dateInputFormat: _ }, [me]]
                    )
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateScaleLabelTickmark: {
        "class": o(
            "DateScaleLabelTickmarkDesign",
            "DateScaleTickmark"
        )
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateScaleTickmark: o(
        { // default
            "class": o("ScaleTickmark", "TrackMyDateWidget"),
        },
        {
            qualifier: { scaleAtLowHTML: true },
            context: {
                tickmarkAnchoragePosPoint: atomic(
                    {
                        element: [{ myAnchorContinuousRange: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    }
                )
            }
        },
        {
            qualifier: { scaleAtLowHTML: false },
            context: {
                tickmarkAnchoragePosPoint: atomic(
                    {
                        element: [{ myAnchorContinuousRange: _ }, [me]],
                        type: [{ highHTMLGirth: _ }, [me]]
                    }
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. activeControl: a boolean.
    // 2. newMinValue/newMaxValue
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TimePeriodControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dateResolutionOfFixedBeginning: [
                    [{ dateResolution: _ }, [me]],
                    o("years", "quarters", "months")
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "TrackMyDateWidget"),
            context: {
                minWrapAround: [{ generalDesign: { arrowHotspot: _ } }, [globalDefaults]],

                myScaleMinValueLabelText: [
                    {
                        ofScaleMinValuePrimaryLabel: true,
                        myWidget: true
                    },
                    [areaOfClass, "DateScaleLabelText"]
                ],
                myScaleMaxValueLabelText: [
                    {
                        ofScaleMaxValuePrimaryLabel: true,
                        myWidget: true
                    },
                    [areaOfClass, "DateScaleLabelText"]
                ],
                horizontalSpacing: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],

                myDateHistogramBinCountControl: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "DateHistogramBinCountControl"]
                ],

                dateResolution: [{ myDateHistogramBinCountControl: { binCount: _ } }, [me]],
                dateResolutionStr: [
                    {
                        nameSingular: _,
                        uniqueID: [{ dateResolution: _ }, [me]]
                    },
                    dateObjects
                ],

                numBins: [size,
                    [
                        {
                            myFacet: [{ myFacet: _ }, [me]],
                            ofFirstHistogram: true
                        },
                        [areaOfClass, "DateHistogramBin"]
                    ]
                ]
            },
            position: {
                alignVerticallyWithDateScalePrimaryLabelTexts: {
                    point1: {
                        element: [{ myScaleMinValueLabelText: _ }, [me]], // this one represents both edge DateScaleLabelText of edge areas
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { activeControl: true },
            "class": "TooltipableControl",
            write: {
                onTimePeriodControlClick: {
                    "class": "OnMouseClick",
                    // upon: see TimePeriodControl
                    true: {
                        updateMax: {
                            to: [{ myCanvas: { maxValue: _ } }, [me]],
                            merge: [min,
                                [max, [{ newMaxValue: _ }, [me]], 0], // the max is a protection mechanism, essentially ensuring we write a date past 1/1/70
                                [{ myCanvas: { maxDataValue: _ } }, [me]]
                            ]
                        },
                        updateMin: {
                            to: [{ myCanvas: { minValue: _ } }, [me]],
                            merge: [max,
                                [max, [{ newMinValue: _ }, [me]], 0], // the max is a protection mechanism, essentially ensuring we write a date past 1/1/70
                                [{ myCanvas: { minDataValue: _ } }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: false },
            context: {
                singleBinDelta: [cond,
                    [{ dateResolution: _ }, [me]],
                    o(
                        {
                            on: "weeks",
                            use: secondsInAWeek
                        },
                        {
                            on: "days",
                            use: secondsInADay
                        },
                        {
                            on: "hours",
                            use: secondsInAnHour
                        },
                        {
                            on: "minutes",
                            use: secondsInAMinute
                        }
                    )
                ],
                fwdBackDelta: [minus,
                    [{ myCanvas: { maxValue: _ } }, [me]],
                    [{ myCanvas: { minValue: _ } }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NextTimePeriodControl: o(
        { // default
            "class": o("NextTimePeriodControlDesign", "TimePeriodControl"),
            context: {

                // TimePeriodControl params
                activeControl: [{ myCanvas: { maxValueLessThanMaxDataValue: _ } }, [me]],
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { nextStr: _ } }, [me]],
                        [{ dateResolutionStr: _ }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                attachToMyScaleMaxValueLabelTextRight: {
                    point1: {
                        element: [{ myScaleMaxValueLabelText: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: true },
            context: {
                debug: [nextPrevLeadingDateAsNum,
                    true, // i.e. "next"
                    1, // numBinHop
                    [{ myCanvas: { maxValue: _ } }, [me]],
                    [{ dateResolution: _ }, [me]]
                ],
                newMaxValue: [cond,
                    [arg, "debugDateFunction", false],
                    o({ on: true, use: [{ debug: { value: _ } }, [me]] }, { on: false, use: [{ debug: _ }, [me]] })
                ],
                newMinValue: [first,
                    [cond,
                        [{ dateResolution: _ }, [me]],
                        o(
                            {
                                on: "years",
                                use: [{ myCanvas: { beginningOfYearsAsNum: _ } }, [me]]
                            },
                            {
                                on: "quarters",
                                use: [{ myCanvas: { beginningOfQuartersAsNum: _ } }, [me]]
                            },
                            {
                                on: "months",
                                use: [{ myCanvas: { beginningOfMonthsAsNum: _ } }, [me]]
                            }
                        )
                    ]
                ]
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: false },
            context: {
                newMaxValue: [plus, [{ myCanvas: { maxValue: _ } }, [me]], [{ singleBinDelta: _ }, [me]]],
                newMinValue: [plus, [{ myCanvas: { minValue: _ } }, [me]], [{ singleBinDelta: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PrevTimePeriodControl: o(
        { // default
            "class": o("PrevTimePeriodControlDesign", "TimePeriodControl"),
            context: {
                // TimePeriodControl params
                activeControl: [{ myCanvas: { minValueGreaterThanMinDataValue: _ } }, [me]],
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { prevStr: _ } }, [me]],
                        [{ dateResolutionStr: _ }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                attachToMyScaleMinValueLabelTextLeft: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myScaleMinValueLabelText: _ }, [me]],
                        type: "left"
                    },
                    equals: [{ horizontalSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: true },
            context: {
                debug: [nextPrevLeadingDateAsNum,
                    false, // i.e. "prev",
                    1, // "numBinHop"
                    [{ myCanvas: { minValue: _ } }, [me]],
                    [{ dateResolution: _ }, [me]]
                ],
                newMinValue: [cond,
                    [arg, "debugDateFunction", false],
                    o({ on: true, use: [{ debug: { value: _ } }, [me]] }, { on: false, use: [{ debug: _ }, [me]] })
                ],
                newMaxValue: [minus, // we calculate one day back, as the last bin is a closed one - we want it to go to 12/31/17, not 1/1/18
                    [last,
                        [cond,
                            [{ dateResolution: _ }, [me]],
                            o(
                                {
                                    on: "years",
                                    use: [{ myCanvas: { beginningOfYearsAsNum: _ } }, [me]]
                                },
                                {
                                    on: "quarters",
                                    use: [{ myCanvas: { beginningOfQuartersAsNum: _ } }, [me]]
                                },
                                {
                                    on: "months",
                                    use: [{ myCanvas: { beginningOfMonthsAsNum: _ } }, [me]]
                                }
                            )
                        ]
                    ],
                    secondsInADay
                ]
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: false },
            context: {
                newMaxValue: [minus, [{ myCanvas: { maxValue: _ } }, [me]], [{ singleBinDelta: _ }, [me]]],
                newMinValue: [minus, [{ myCanvas: { minValue: _ } }, [me]], [{ singleBinDelta: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FwdTimePeriodControl: o(
        { // default
            "class": o("FwdTimePeriodControlDesign", "TimePeriodControl"),
            context: {
                myNextTimePeriodControl: [
                    { myWidget: [{ myWidget: _ }, [me]] },
                    [areaOfClass, "NextTimePeriodControl"]
                ],
                activeControl: [{ myCanvas: { maxValueLessThanMaxDataValue: _ } }, [me]],
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { nextStr: _ } }, [me]],
                        [{ myApp: { timeFrameStr: _ } }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                attachHorizontallyToNextTimePeriodControl: {
                    point1: {
                        element: [{ myNextTimePeriodControl: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: true },
            context: {
                debug: [nextPrevLeadingDateAsNum,
                    true, // i.e. "next",
                    [{ numBins: _ }, [me]], // "numBinHop"
                    [{ myCanvas: { maxValue: _ } }, [me]],
                    [{ dateResolution: _ }, [me]]
                ],
                newMaxValue: [cond,
                    [arg, "debugDateFunction", false],
                    o({ on: true, use: [{ debug: { value: _ } }, [me]] }, { on: false, use: [{ debug: _ }, [me]] })
                ],
                newMinValue: [plus, // we calculate one day ahead, as we want to start from the day that *follows* the previous maxValue
                    [{ myCanvas: { maxValue: _ } }, [me]],
                    secondsInADay
                ]
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: false },
            context: {
                newMaxValue: [plus, [{ myCanvas: { maxValue: _ } }, [me]], [{ fwdBackDelta: _ }, [me]]],
                newMinValue: [plus, [{ myCanvas: { minValue: _ } }, [me]], [{ fwdBackDelta: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BackTimePeriodControl: o(
        { // default
            "class": o("BackTimePeriodControlDesign", "TimePeriodControl"),
            context: {
                myPrevTimePeriodControl: [
                    { myWidget: [{ myWidget: _ }, [me]] },
                    [areaOfClass, "PrevTimePeriodControl"]
                ],
                activeControl: [{ myCanvas: { minValueGreaterThanMinDataValue: _ } }, [me]],
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { prevStr: _ } }, [me]],
                        [{ myApp: { timeFrameStr: _ } }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                attachHorizontallyToPrevTimePeriodControl: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myPrevTimePeriodControl: _ }, [me]],
                        type: "left"
                    },
                    equals: [{ horizontalSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: true },
            context: {
                debug: [nextPrevLeadingDateAsNum,
                    false, // i.e. "prev",
                    [{ numBins: _ }, [me]], // "numBinHop"
                    [{ myCanvas: { minValue: _ } }, [me]],
                    [{ dateResolution: _ }, [me]]
                ],
                newMinValue: [cond,
                    [arg, "debugDateFunction", false],
                    o({ on: true, use: [{ debug: { value: _ } }, [me]] }, { on: false, use: [{ debug: _ }, [me]] })
                ],
                newMaxValue: [minus, // we calculate one day back, as the last bin is a closed one - we want it to go to 12/31/17, not 1/1/18
                    [{ myCanvas: { minValue: _ } }, [me]],
                    secondsInADay
                ]
            }
        },
        {
            qualifier: { dateResolutionOfFixedBeginning: false },
            context: {
                newMaxValue: [minus, [{ myCanvas: { maxValue: _ } }, [me]], [{ fwdBackDelta: _ }, [me]]],
                newMinValue: [minus, [{ myCanvas: { minValue: _ } }, [me]], [{ fwdBackDelta: _ }, [me]]]
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateCanvas: {
        "class": o("GeneralArea", "NumericCanvas", "TrackMyDateWidget"),
        context: {
            scaleType: "linear",

            scaleMarkSpacingTable: o(
                {
                    density: "V1",
                    scaleType: "any",
                    primary: 40,
                    secondary: 23,
                    unlabeled: 9
                },
                {
                    density: "V2",
                    scaleType: "any",
                    primary: 50,
                    secondary: 32,
                    unlabeled: 11
                },
                {
                    density: "V3",
                    scaleType: "any",
                    primary: 60,
                    secondary: 38,
                    unlabeled: 14
                }
            ),

            minValueAsDate: [numToDate, [{ minValue: _ }, [me]], [{ myFacet: { dateInputFormat: _ } }, [me]]],
            maxValueAsDate: [numToDate, [{ maxValue: _ }, [me]], [{ myFacet: { dateInputFormat: _ } }, [me]]],

            minValueLowerBound: {
                year: [year, [{ minValue: _ }, [me]]],
                quarter: [quarter, [{ minValue: _ }, [me]]],
                month: [month, [{ minValue: _ }, [me]]],
                dayOfMonth: [dayOfMonth, [{ minValue: _ }, [me]]],
                dayOfWeek: [dayOfWeek, [{ minValue: _ }, [me]]]
            },
            maxValueLowerBound: {
                year: [year, [{ maxValue: _ }, [me]]],
                quarter: [quarter, [{ maxValue: _ }, [me]]],
                month: [month, [{ maxValue: _ }, [me]]],
                dayOfMonth: [dayOfMonth, [{ maxValue: _ }, [me]]],
                dayOfWeek: [dayOfWeek, [{ maxValue: _ }, [me]]]
            },

            // years - beginning
            firstYear: [{ minValueLowerBound: { year: _ } }, [me]],
            lastYear: [{ maxValueLowerBound: { year: _ } }, [me]],
            spansAcrossMultipleYears: [greaterThan,
                [{ lastYear: _ }, [me]],
                [{ firstYear: _ }, [me]]
            ],
            yearFollowingFirstYear: [cond,
                [{ spansAcrossMultipleYears: _ }, [me]],
                o(
                    { on: true, use: [plus, [{ firstYear: _ }, [me]], 1] },
                    { on: false, use: o() }
                )
            ],

            yearsRepresentedInCanvas: [sequence,
                r(
                    [{ firstYear: _ }, [me]],
                    [{ lastYear: _ }, [me]]
                )
            ],
            yearsBeginningInCanvas: [cond,
                [{ yearFollowingFirstYear: _ }, [me]],
                o(
                    {
                        on: true,
                        use: [sequence,
                            r(
                                [{ yearFollowingFirstYear: _ }, [me]],
                                [{ lastYear: _ }, [me]]
                            )
                        ]
                    },
                    {
                        on: false,
                        use: o()
                    }
                )
            ],
            beginningOfYearsAsDate: [map,
                [defun,
                    "year",
                    [generateBeginningOfYearDate, "year"]
                ],
                [{ yearsBeginningInCanvas: _ }, [me]]
            ],
            beginningOfYearsAsNum: [map,
                [defun,
                    "yearAsDate",
                    [dateToNum,
                        "yearAsDate",
                        [{ myFacet: { dateInputFormat: _ } }, [me]]
                    ]
                ],
                [{ beginningOfYearsAsDate: _ }, [me]]
            ],
            // years - end

            // quarters - beginning
            firstQuarter: [{ minValueLowerBound: { quarter: _ } }, [me]], // number between 1-4
            lastQuarter: [{ maxValueLowerBound: { quarter: _ } }, [me]], // number between 1-4
            // remember: beginningOfQuartersAsDate does not include the minValue/maxValue, if those happen to be beginning of quarters
            // those are handled separately in edgeValuesOtherThanMinValueAndMaxValue
            beginningOfQuartersAsDate: [beginningOfYearComponentsAsDate,
                "quarters",
                [{ yearsRepresentedInCanvas: _ }, [me]],
                [{ firstQuarter: _ }, [me]],
                [{ lastQuarter: _ }, [me]]
            ],
            beginningOfQuartersAsNum: [map,
                [defun,
                    "quarterAsDate",
                    [dateToNum,
                        "quarterAsDate",
                        [{ myFacet: { dateInputFormat: _ } }, [me]]
                    ]
                ],
                [{ beginningOfQuartersAsDate: _ }, [me]]
            ],
            // quarters - end

            // months - beginning
            firstMonth: [{ minValueLowerBound: { month: _ } }, [me]], // number between 1-12
            lastMonth: [{ maxValueLowerBound: { month: _ } }, [me]], // number between 1-12
            // remember: beginningOfMonthsAsDate does not include the minValue/maxValue, if those happen to be beginning of months. 
            // those are handled separately in edgeValuesOtherThanMinValueAndMaxValue
            beginningOfMonthsAsDate: [beginningOfYearComponentsAsDate,
                "months",
                [{ yearsRepresentedInCanvas: _ }, [me]],
                [{ firstMonth: _ }, [me]],
                [{ lastMonth: _ }, [me]]
            ],
            beginningOfMonthsAsNum: [map,
                [defun,
                    "monthAsDate",
                    [dateToNum,
                        "monthAsDate",
                        [{ myFacet: { dateInputFormat: _ } }, [me]]
                    ]
                ],
                [{ beginningOfMonthsAsDate: _ }, [me]]
            ],
            // months - end

            // unlike years/quarters/months, which begin at fixed dates, weeks/days start from the minValueAsDate, in week-/day-long increments.
            // e.g. 4/4/2017 can be minValueAsDate, and that was a Tue, so the first week in the histogram will be 4/4/2017-10/4/2017
            // remember: beginningOfMonthsAsDate does not include the minValue/maxValue, if those happen to be beginning of months. 
            // those are handled separately in edgeValuesOtherThanMinValueAndMaxValue

            // weeks - beginning
            numFullWeeks: [floor,
                [div,
                    [minus, [{ maxValue: _ }, [me]], [{ minValue: _ }, [me]]],
                    secondsInAWeek
                ]
            ],
            beginningOfWeeksAsNum: [map,
                [defun,
                    "weekCounter",
                    [plus,
                        [{ minValue: _ }, [me]], // first day in the histogram
                        [mul,
                            "weekCounter",
                            secondsInAWeek
                        ]
                    ]
                ],
                [sequence, r(1, [{ numFullWeeks: _ }, [me]])]
            ],
            // weeks - end

            // days - beginning
            numFullDays: [floor,
                [div,
                    [minus, [{ maxValue: _ }, [me]], [{ minValue: _ }, [me]]],
                    secondsInADay
                ]
            ],
            beginningOfDaysAsNum: [map,
                [defun,
                    "dayCounter",
                    [plus,
                        [{ minValue: _ }, [me]], // first day in the histogram
                        [mul,
                            "dayCounter",
                            secondsInADay
                        ]
                    ]
                ],
                [sequence, r(1, [{ numFullDays: _ }, [me]])]
            ],
            // days - end

            binsDataCore: o(
                {
                    uniqueID: "years",
                    values: [{ beginningOfYearsAsNum: _ }, [me]]
                },
                {
                    uniqueID: "quarters",
                    values: [{ beginningOfQuartersAsNum: _ }, [me]]
                },
                {
                    uniqueID: "months",
                    values: [{ beginningOfMonthsAsNum: _ }, [me]]
                },
                {
                    uniqueID: "weeks",
                    values: [{ beginningOfWeeksAsNum: _ }, [me]]
                },
                {
                    uniqueID: "days",
                    values: [{ beginningOfDaysAsNum: _ }, [me]]
                }
                /*,
                        {
                            uniqueID: "hours",
                            values: [{ beginningOfHoursAsNum: _ }, [me]]
                        },
                        {
                            uniqueID: "minutes",
                            values: [{ beginningOfMinutesAsNum: _ }, [me]]
                        }
                        */
            ),

            binsData: [map,
                [defun,
                    "binsDataCoreObj",
                    [merge,
                        "binsDataCoreObj",
                        { count: [size, [{ values: _ }, "binsDataCoreObj"]] }
                    ]
                ],
                [{ binsDataCore: _ }, [me]]
            ]
        },
        position: {
            attachLowHTMLLengthOfCanvasToContinuousAnchor: {
                point1: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: 0
            },
            attachHighHTMLLengthOfCanvasToContinuousAnchor: {
                point1: {
                    element: [{ myAnchorContinuousRange: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                equals: 0
            },
            zeroGirthOfCanvas: {
                point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                point2: { type: [{ highHTMLGirth: _ }, [me]] },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateContinuousRange: {
        "class": o(/*"DateContinuousRangeDesign", */"GeneralArea", "TrackMyDateWidget"),
        context: {
            myAddNewHistogramControl: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "AddNewHistogramControl"]
            ]
        },
        position: {
            attachToLeftOfWidget: {
                point1: {
                    element: [{ myWidget: _ }, [me]],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                equals: [densityChoice, [{ datePosConst: { continousRangeMarginOnHorizontalAxis: _ } }, [globalDefaults]]]
            },
            attachToRightOfAddNewHistogramControl: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ myAddNewHistogramControl: _ }, [me]],
                    type: "left"
                },
                equals: [densityChoice, [{ datePosConst: { continousRangeMarginOnHorizontalAxis: _ } }, [globalDefaults]]]
            },
            attachToWidgetBottom: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ myWidget: _ }, [me]],
                    type: "bottom",
                    content: true
                },
                equals: [densityChoice, [{ datePosConst: { continousRangeMarginOnVerticalAxis: _ } }, [globalDefaults]]]
            },

            minWidth: {
                point1: { type: "left" },
                point2: { type: "right" },
                min: [{ datePosConst: { scaleLineDefaultLength: _ } }, [globalDefaults]]
            },
            height: 0//[densityChoice, [{ numericPosConst: { scaleLineGirth: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramsViewContainer: {
        "class": o("VerticalHistogramsViewContainer"),
        children: {
            histogramsView: {
                description: {
                    "class": "DateHistogramsView"
                }
            },
            binCountControl: {
                description: {
                    "class": "DateHistogramBinCountControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramsView: {
        "class": "HistogramsView",
        children: {
            histogramsDoc: {
                description: {
                    "class": "DateHistogramsDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramsDoc: {
        "class": "HistogramsDoc",
        children: {
            histograms: {
                // data: see HistogramsDoc
                description: {
                    "class": "DateHistogram"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogram: {
        "class": "Histogram",
        context: {
            myDateHistogramBinCountControl: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "DateHistogramBinCountControl"]
            ],
            dateResolution: [{ myDateHistogramBinCountControl: { binCount: _ } }, [me]],

            generateBarValDisplayPrefix: [defun,
                o(
                    "beginningDateAsNum",
                    "endDateAsNum" // in case we decide to use the end date too, for the text displayed to the user (e.g. "Week of 2/2/2017-8/2/2017")
                ),
                [using,
                    // beginning of using
                    "beginningDate",
                    [numToDate, "beginningDateAsNum", [{ myFacet: { dateInputFormat: _ } }, [me]]],
                    "fourDigitYearAsString", // e.g. 1995, 2008
                    [year, "beginningDateAsNum"],
                    "abbreviatedYearAsStringCore", // e.g. 95, 8
                    [cond,
                        [greaterThanOrEqual, "fourDigitYearAsString", 2000],
                        o(
                            { on: true, use: [minus, "fourDigitYearAsString", 2000] },
                            { on: false, use: [minus, "fourDigitYearAsString", 1900] }
                        )
                    ],
                    "abbreviatedYearAsString",
                    [cond, // append a 0 to the single digit years (in their abbreviated form)
                        [lessThan, "abbreviatedYearAsStringCore", 10],
                        o({ on: true, use: [concatStr, o("0", "abbreviatedYearAsStringCore")] }, { on: false, use: "abbreviatedYearAsStringCore" })
                    ],
                    "monthAsNum",
                    [month, "beginningDateAsNum"],
                    "monthAsTwoDigitNum",
                    [cond,
                        [lessThan, "monthAsNum", 10],
                        o({ on: true, use: [concatStr, o("0", "monthAsNum")] }, { on: false, use: "monthAsNum" })
                    ],
                    // end of using
                    [cond,
                        [{ dateResolution: _ }, [me]],
                        o(
                            {
                                on: "years",
                                use: [year, "beginningDateAsNum"]
                            },
                            {
                                on: "quarters",
                                use: [concatStr,
                                    o(
                                        "Q",
                                        [quarter, "beginningDateAsNum"],
                                        "/",
                                        "abbreviatedYearAsString"
                                    )
                                ]
                            },
                            {
                                on: "months",
                                use: [concatStr,
                                    o(
                                        "monthAsTwoDigitNum",
                                        "/",
                                        "abbreviatedYearAsString"
                                    )
                                ]
                            },
                            {
                                on: "weeks",
                                use: [concatStr,
                                    o(
                                        [
                                            {
                                                nameSingular: _,
                                                uniqueID: "weeks"
                                            },
                                            dateObjects
                                        ],
                                        " ",
                                        [{ myApp: { ofStr: _ } }, [me]],
                                        " ",
                                        "beginningDate"
                                    )
                                ]
                            },
                            {
                                on: "days",
                                use: "beginningDate"
                            }
                        )
                    ]
                ]
            ]
        },
        children: {
            histogramView: {
                description: {
                    "class": "DateHistogramView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramView: {
        "class": "NumericHistogramView",
        context: {
            stableExpandableIsMin: true, // override the ExpandableRight default param

            edgeValuesOtherThanMinValueAndMaxValue: [
                {
                    uniqueID: [{ myHistogram: { dateResolution: _ } }, [me]],
                    values: _
                },
                [{ myCanvas: { binsData: _ } }, [me]]
            ],
            binRangeEdgeValues: [_, // in case minValue/maxValue are identical to one of the edgeValuesOtherThanMinValueAndMaxValue
                o(
                    [{ myCanvas: { minValue: _ } }, [me]],
                    [{ edgeValuesOtherThanMinValueAndMaxValue: _ }, [me]],
                    [{ myCanvas: { maxValue: _ } }, [me]]
                )
            ],
            lengthAxisHandleAnchor: atomic({ // override definition in ExpandableRight (this class has competing inheritance of Vertical/Horizontal - long story..)
                element: [me],
                type: "right",
                content: true
            })
        },
        children: {
            numericBins: {
                // data: see NumericHistogramView
                description: {
                    "class": "DateHistogramBin"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramBinCountControl: {
        "class": o("GeneralArea", "NumericHistogramBinCountControl"),
        context: {
            myAddNewHistogramControl: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "AddNewHistogramControl"]
            ],
            myPrimaryWidget: [{ myPrimaryWidget: _ }, [embedding]],

            myDateCanvas: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "DateCanvas"]
            ],
            twoDigitCountBinsData: [
                { count: r(10, Number.MAX_VALUE) },
                [{ myDateCanvas: { binsData: _ } }, [me]]
            ],

            defaultBinCount: [
                { uniqueID: _ },
                [cond,
                    [{ twoDigitCountBinsData: _ }, [me]],
                    o(
                        { // if there are bin counts with two digits, take the first one (i.e. the lowest resolution, as binsData is sorted from 
                            // the lowest resolution to the highest)
                            on: true,
                            use: [first, [{ twoDigitCountBinsData: _ }, [me]]]
                        },
                        { // otherwise, all bin counts are single digits, so take the last one (i.e. the highest resolution)
                            // note we arrive in this branch because the data itself may have a finite resolution (e.g. days)
                            on: false,
                            use: [last, [{ myDateCanvas: { binsData: _ } }, [me]]]
                        }
                    )
                ]
            ],
            binCount: [mergeWrite,
                [{ currentViewFacetDataObj: { binCount: _ } }, [me]],
                [{ defaultBinCount: _ }, [me]]
            ]
        },
        children: {
            moreBinButton: {
                description: {
                    "class": "DateHistogramMoreBinButton"
                }
            },
            countDisplay: {
                description: {
                    "class": "DateHistogramBinCount"
                }
            },
            lessBinButton: {
                description: {
                    "class": "DateHistogramLessBinButton"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateHistogramBinButtonAddendum: {
        context: {
            histogramBinButtonTooltipTextSuffix: [concatStr,
                o(
                    [{ myApp: { histogramEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { resolutionStr: _ } }, [me]]
                )
            ],
            myDateCanvas: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "DateCanvas"]
            ],
            currentDateResolutionBinData: [
                { uniqueID: [{ binCount: _ }, [embedding]] },
                [{ myDateCanvas: { binsData: _ } }, [me]]
            ]
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateHistogramMoreBinButton: {
        "class": o("DateHistogramMoreBinButtonDesign", "NumericHistogramMoreBinButton", "DateHistogramBinButtonAddendum"),
        context: {
            // should the lastBinCount constraint be driven by the number of *bars*, and not the number of bins?
            // the issue, after all, is one of performance..
            acceptableResolutionBinsData: [
                { count: r(0, [{ dateConst: { maxNumBins: _ } }, [globalDefaults]]) },
                [{ myDateCanvas: { binsData: _ } }, [me]]
            ],

            nextBinCount: [{ uniqueID: _ }, [next, [{ acceptableResolutionBinsData: _ }, [me]], [{ currentDateResolutionBinData: _ }, [me]]]],
            lastBinCount: [{ uniqueID: _ }, [last, [{ acceptableResolutionBinsData: _ }, [me]]]]
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    DateHistogramLessBinButton: {
        "class": o("DateHistogramLessBinButtonDesign", "NumericHistogramLessBinButton", "DateHistogramBinButtonAddendum"),
        context: {
            // we use [{ myDateCanvas: { binsData:_ } }, [me]] as when reducing resolution, they are all acceptable 
            // (see DateHistogramMoreBinButton, where that statement does not hold)
            nextBinCount: [{ uniqueID: _ }, [prev, [{ myDateCanvas: { binsData: _ } }, [me]], [{ currentDateResolutionBinData: _ }, [me]]]],
            lastBinCount: [{ uniqueID: _ }, [first, [{ myDateCanvas: { binsData: _ } }, [me]]]]
        }
    },

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    DateHistogramBinCount: {
        "class": o("DateHistogramBinCountDesign", "NumericHistogramBinCount"),
        context: {
            displayText: [
                {
                    namePlural: _,
                    uniqueID: [{ binCount: _ }, [embedding]]
                },
                dateObjects
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a bin in a date histogram. It is inherited by the bins areaSet in the DateHisotgramView.
    // It inherits NumericHistogramBin.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateHistogramBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dateResolutionOfFixedBeginning: [
                    [{ myHistogram: { dateResolution: _ } }, [me]],
                    o("years", "quarters", "months") // i.e. the beginning of the bin does not depend on the dates of the range.
                ]
            }
        },
        { // default
            "class": o("DateHistogramBinDesign", "GeneralArea", "NumericHistogramBin"),
            context: {
                barValDisplayPrefix: [
                    [{ myHistogram: { generateBarValDisplayPrefix: _ } }, [me]],
                    [{ binRangeStart: _ }, [me]],
                    [{ binRangeEnd: _ }, [me]]
                ],
                lastBinOfYear: [and,
                    [ // can be true only if the histogram's resolution is quarters or months
                        [{ myHistogram: { dateResolution: _ } }, [me]],
                        o("quarters", "months")
                    ],
                    [
                        [{ binRangeEnd: _ }, [me]], // is my binRangeEnd among the beginningOfYearsAsNum values
                        [{ myCanvas: { beginningOfYearsAsNum: _ } }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: {
                dateResolutionOfFixedBeginning: true,
                firstBin: true
            },
            context: {
                barValDisplayPrefix: [concatStr,
                    o(
                        [{ myApp: { beforeStr: _ } }, [me]],
                        [
                            [{ myHistogram: { generateBarValDisplayPrefix: _ } }, [me]],
                            [{ binRangeStart: _ }, [next, [me]]], // we want the binRangeStart of the second bin!
                            [{ binRangeEnd: _ }, [me]]
                        ]
                    ),
                    " "
                ]
            }
        },
        {
            qualifier: {
                dateResolutionOfFixedBeginning: true,
                lastBin: true
            },
            context: {
                barValDisplayPrefix: [concatStr,
                    o(
                        [{ myApp: { afterStr: _ } }, [me]],
                        [
                            [{ myHistogram: { generateBarValDisplayPrefix: _ } }, [me]],
                            [{ binRangeStart: _ }, [prev, [me]]], // we want the binRangeStart of the one-before-last bin!
                            [{ binRangeEnd: _ }, [me]]
                        ]
                    ),
                    " "
                ]
            }
        },
        {
            qualifier: {
                dateResolutionOfFixedBeginning: true,
                firstBin: true,
                lastBin: true
            },
            context: {
                barValDisplayPrefix: [{ myApp: { allStr: _ } }, [me]]
            }
        }
    )
};
