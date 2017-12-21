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
//
// %%classfile%%: <segmentedCanvas.js>
// %%classfile%%: <scale.js>
//
//
// this file defines slider scale classes
//
// it defines the labeling/tick-marks along the slider scale
//
//
var classes = {
    SliderScale: o(
        {
            "class": o("GeneralArea", "Scale", "TrackMySliderWidget"),

            context: {
                // fede 8/8: this doesn't seem to be used anywhere !
                /*mySliderBaseOverlayXWidget: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "SliderBaseOverlayXWidget"]
                ]*/
            },
            children: {
                scaleLine: {
                    description: {
                        "class": "SliderScaleLine"
                    }
                },
                scaleSegmentLines: {
                    description: {
                        "class": "SliderScaleSegmentLines"
                    }
                },
                primaryLabel: {
                    description: {
                        "class": "SliderScalePrimaryLabel"
                    }
                },
                secondaryLabel: {
                    description: {
                        "class": "SliderScaleSecondaryLabel"
                    }
                },
                tickmark: {
                    description: {
                        "class": "SliderScaleUnlabeledTickmark"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MinWrapHorizontal",
            position: {
                attachLeftToWidget: {
                    point1: {
                        element: [{ myWidget: _ }, [me]],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bSliderPosConst.fromWidgetToScaleBeginningGirth
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "MinWrapVertical",
            position: {
                attachBottomToWidget: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        type: "bottom"
                    },
                    equals: bSliderPosConst.fromWidgetToScaleBeginningGirth
                }
            }
        }
    ),

    TrackMySliderScale: {
        context: {
            mySliderScale: [
                [embeddingStar, [me]],
                [areaOfClass, "SliderScale"]
            ]
        }
    },

    SliderScaleLine: o(
        { // default
            "class": o("SliderScaleLineDesign", "GeneralArea", "TrackMySliderScale", "TrackMySliderWidget"),
            context: {
                girth: [densityChoice, [{ numericPosConst: { scaleLineGirth: _ } }, [globalDefaults]]],
                myPrimaryLabels: [
                    { mySliderScale: [{ mySliderScale: _ }, [me]] },
                    [areaOfClass, "SliderScalePrimaryLabel"]
                ],
                minMaxPrimaryLabelTickmarks: [
                    { children: { tickmark: _ } },
                    o(
                        [{ myPrimaryLabels: { isScaleMinValue: true } }, [me]],
                        [{ myPrimaryLabels: { isScaleMaxValue: true } }, [me]]
                    )
                ]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MinWrapVertical",
            context: {
                minWrapRefAreas: [{ minMaxPrimaryLabelTickmarks: _ }, [me]] // in variant and not in default clause so as to override MinWrap's default
            },
            position: {
                width: [{ girth: _ }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "MinWrapHorizontal",
            context: {
                minWrapRefAreas: [{ minMaxPrimaryLabelTickmarks: _ }, [me]] // in variant and not in default clause so as to override MinWrap's default
            },
            position: {
                height: [{ girth: _ }, [me]]
            }
        }
    ),

    SliderScaleSegmentLines: o(
        { // default
            "class": o("OrientedElement", "TrackMySliderScale", "TrackMySliderWidget"),
            context: {
                mySliderScaleLine: [
                    { mySliderScale: [{ mySliderScale: _ }, [me]] },
                    [areaOfClass, "SliderScaleLine"]
                ],
                girth: [{ sliderPosConst: { scaleSegmentLineGirth: _ } }, [globalDefaults]],
                myPrimaryLabels: [
                    { mySliderScale: [{ mySliderScale: _ }, [me]] },
                    [areaOfClass, "SliderScalePrimaryLabel"]
                ],
                scaleMinValuePoint: {
                    element: [{ myPrimaryLabels: { isScaleMinValue: true } }, [me]],
                    type: [{ centerLength: _ }, [me]]
                },
                scaleMaxValuePoint: {
                    element: [{ myPrimaryLabels: { isScaleMaxValue: true } }, [me]],
                    type: [{ centerLength: _ }, [me]]
                },
                linearPlusEdgeValuePoint: {
                    element: [{ myPrimaryLabels: { isLinearPlusEdgeValue: true } }, [me]],
                    type: [{ centerLength: _ }, [me]]
                },
                linearMinusEdgeValuePoint: {
                    element: [{ myPrimaryLabels: { isLinearMinusEdgeValue: true } }, [me]],
                    type: [{ centerLength: _ }, [me]]
                }
            },
            position: {
                attachToScaleLineEndGirth: {
                    point1: {
                        element: [{ mySliderScaleLine: _ }, [me]],
                        type: [{ endGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ beginningGirth: _ }, [me]]
                    },
                    equals: bSliderPosConst.scaleLineToSegmentLinesOffset
                },
                attachToScaleLineLowHTMLLength: {
                    point1: {
                        element: [{ mySliderScaleLine: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0
                },
                attachToScaleLineHighHTMLLength: {
                    point1: {
                        element: [{ mySliderScaleLine: _ }, [me]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            },
            children: {
                segmentLines: {
                    data: [cond,
                        // if there is no positive log tail, we go straight from linearPlusEdgeValuePoint to scaleMinValuePoint
                        [not, [{ myPrimaryLabels: { isLinearPlusEdgeValue: _ } }, [me]]],
                        o(
                            {
                                on: true,
                                use: {
                                    lowHTMLLengthAnchor: [{ scaleMaxValuePoint: _ }, [me]],
                                    highHTMLLengthAnchor: [{ scaleMinValuePoint: _ }, [me]],
                                    type: "main"
                                }
                            },
                            {
                                on: false,
                                use: [cond,
                                    [not, [{ myPrimaryLabels: { isLinearMinusEdgeValue: _ } }, [me]]],
                                    o(
                                        {
                                            on: true,
                                            use: o(
                                                {
                                                    lowHTMLLengthAnchor: [{ scaleMaxValuePoint: _ }, [me]],
                                                    highHTMLLengthAnchor: [{ linearPlusEdgeValuePoint: _ }, [me]],
                                                    type: "tail"
                                                },
                                                {
                                                    lowHTMLLengthAnchor: [{ linearPlusEdgeValuePoint: _ }, [me]],
                                                    highHTMLLengthAnchor: [{ scaleMinValuePoint: _ }, [me]],
                                                    type: "main"
                                                }
                                            )
                                        },
                                        {
                                            on: false,
                                            use: o(
                                                {
                                                    lowHTMLLengthAnchor: [{ scaleMaxValuePoint: _ }, [me]],
                                                    highHTMLLengthAnchor: [{ linearPlusEdgeValuePoint: _ }, [me]],
                                                    type: "tail"
                                                },
                                                {
                                                    lowHTMLLengthAnchor: [{ linearPlusEdgeValuePoint: _ }, [me]],
                                                    highHTMLLengthAnchor: [{ linearMinusEdgeValuePoint: _ }, [me]],
                                                    type: "main"
                                                },
                                                {
                                                    lowHTMLLengthAnchor: [{ linearMinusEdgeValuePoint: _ }, [me]],
                                                    highHTMLLengthAnchor: [{ scaleMinValuePoint: _ }, [me]],
                                                    type: "tail"
                                                }
                                            )
                                        }
                                    )
                                ]
                            }
                        )
                    ],
                    description: {
                        "class": "SliderScaleSegmentLine"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                width: [{ girth: _ }, [me]],
                right: 0
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                height: [{ girth: _ }, [me]],
                top: 0
            }
        }
    ),

    SliderScaleSegmentLine: o(
        {
            "class": o("SliderScaleSegmentLineDesign", "OrientedElement", "TrackMySliderScale", "TrackMySliderWidget"),
            context: {
                type: [{ param: { areaSetContent: { type: _ } } }, [me]],
                lowHTMLLengthAnchor: [{ param: { areaSetContent: { lowHTMLLengthAnchor: _ } } }, [me]],
                highHTMLLengthAnchor: [{ param: { areaSetContent: { highHTMLLengthAnchor: _ } } }, [me]]
            },
            position: {
                attachToLowHTMLLengthAnchor: {
                    point1: [{ lowHTMLLengthAnchor: _ }, [me]],
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    equals: 0
                },
                attachToHighHTMLLengthAnchor: {
                    point1: [{ highHTMLLengthAnchor: _ }, [me]],
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                top: 0,
                bottom: 0
            }
        }
    ),

    SliderScaleElement: {
        "class": o(
            "GeneralArea",
            "ScaleElement",
            "TrackMySliderScale",
            "TrackMySliderWidget"
        ),
        context: {
            scaleAtLowHTML: [{ ofVerticalElement: _ }, [me]]
        }
    },

    SliderScaleLabeledTickmark: {
        "class": o(
            "SliderScaleLabeledTickmarkDesign",
            "SliderScaleElement",
            "ScaleLabeledTickmark",
            "TrackMySliderScale",
            "TrackMySliderWidget"
        ),
        children: {
            text: {
                description: {
                    "class": "SliderScaleLabelText"
                }
            },
            tickmark: {
                description: {
                    "class": "SliderScaleLabelTickmark"
                }
            }
        }
    },

    SliderScalePrimaryLabel: o(
        { // variant-controller
            qualifier: "!",
            context: {
                numberOfDigits: [{ primaryLabelPrecision: _ }, [embedding]],
                isScaleMinValue: [equal,
                    [{ value: _ }, [me]],
                    [{ myCanvas: { scaleMinValue: _ } }, [me]]
                ],
                isScaleMaxValue: [equal,
                    [{ value: _ }, [me]],
                    [{ myCanvas: { scaleMaxValue: _ } }, [me]]
                ],
                isLinearLogEdgeValue: [
                    [{ value: _ }, [me]],
                    [{ linearLogEdgeValue: _ }, [me]]
                ],
                isLinearPlusEdgeValue: [equal,
                    [{ value: _ }, [me]],
                    [max, [{ linearLogEdgeValue: _ }, [me]]]
                ],
                isLinearMinusEdgeValue: [and,
                    [not, [{ isLinearPlusEdgeValue: _ }, [me]]], // to verify we're not simply in linearPlus mode
                    [equal,
                        [{ value: _ }, [me]],
                        [min, [{ linearLogEdgeValue: _ }, [me]]]
                    ]
                ],
                // see if value is in the canvas' scaleEdgeValue. if we're in linearPlus/Minus mode, check if it's also a linearLogEdgeValue
                editableValue: [and,
                    [{ allowEditableSliderScaleElements: _ }, [me]],
                    [
                        [{ value: _ }, [me]],
                        o(
                            [{ myCanvas: { scaleEdgeValue: _ } }, [me]],
                            [{ linearLogEdgeValue: _ }, [me]]
                        )
                    ]
                ],

                edgeOfLinearPlusMinusScale: o( // see Design class - this gets a different color
                    [and,
                        [{ scaleType: "linearPlus" }, [me]],
                        [{ isScaleMaxValue: _ }, [me]]
                    ],
                    [and,
                        [{ scaleType: "linearPlusMinus" }, [me]],
                        o(
                            [{ isScaleMaxValue: _ }, [me]],
                            [{ isScaleMinValue: _ }, [me]]
                        )
                    ]
                )
            }
        },
        { // default
            "class": o("SliderScaleLabeledTickmark"),
            context: {
                linearLogEdgeValue: [cond,
                    [{ scaleType: o("linearPlus", "linearPlusMinus") }, [me]],
                    o({
                        on: true,
                        use: [
                            n([{ myCanvas: { scaleEdgeValue: _ } }, [me]]),
                            [{ myCanvas: { edgeMarkValue: _ } }, [me]]
                        ]
                    })
                ]
            },
            children: {
                text: {
                    description: {
                        "class": "SliderScalePrimaryLabelTextDesign"
                    }
                },
                tickmark: {
                    description: {
                        "class": "TrackMySliderScalePrimaryLabel"
                    }
                }
            }
        },
        {
            qualifier: { editableValue: true },
            "class": "SliderScaleEditableLabel"
        }
    ),

    SliderScaleSecondaryLabel: {
        "class": o("SliderScaleLabeledTickmark"),
        context: {
            numberOfDigits: [{ secondaryLabelPrecision: _ }, [embedding]]
        },
        children: {
            text: {
                description: {
                    "class": "SliderScaleSecondaryLabelTextDesign"
                }
            }
        }
    },

    SliderScaleEditableLabel: {
        context: {
            minWrapAround: [cond,
                [{ children: { text: { editInputText: _ } } }, [me]],
                o({ on: true, use: designConstants.textInputBoxShadowRadius }, { on: false, use: 0 })
            ]
        },
        children: {
            text: {
                description: {
                    "class": "SliderScaleEditableLabelText"
                }
            }
        }
    },

    TrackMySliderScalePrimaryLabel: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                isScaleMinValue: [{ mySliderScalePrimaryLabel: { isScaleMinValue: _ } }, [me]],
                isScaleMaxValue: [{ mySliderScalePrimaryLabel: { isScaleMaxValue: _ } }, [me]],
                isLinearLogEdgeValue: [{ mySliderScalePrimaryLabel: { isLinearLogEdgeValue: _ } }, [me]],
                isLinearPlusEdgeValue: [{ mySliderScalePrimaryLabel: { isLinearPlusEdgeValue: _ } }, [me]],
                isLinearMinusEdgeValue: [{ mySliderScalePrimaryLabel: { isLinearMinusEdgeValue: _ } }, [me]]
            }
        },
        { // default
            context: {
                mySliderScalePrimaryLabel: [
                    [embeddingStar, [me]],
                    [areaOfClass, "SliderScalePrimaryLabel"]
                ]
            }
        }
    ),

    SliderScaleEditableLabelText: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                allowWritingInput: o(
                    [{ inputIsEmpty: _ }, [me]], // deleting the  is interpreted (see textForAppData) as reseting the associated user* appData
                    [and,
                        [{ inputIsValidNumber: _ }, [me]],
                        [not, [{ minMaxOrderViolated: _ }, [me]]],
                        [not, [{ zeroInLogScaleSegmentViolated: _ }, [me]]]
                    ]
                )
            }
        },
        { // default
            "class": o("SliderScaleEditableLabelTextDesign", "GeneralArea", "NumberInput", "TrackMySliderScalePrimaryLabel")
        },
        {
            qualifier: { editInputText: true },
            context: {
                textForAppData: [cond,
                    [{ inputIsEmpty: _ }, [me]],
                    o(
                        {
                            on: false, // i.e. it's a valid number, and should be used as such
                            use: [{ inputAsNumber: _ }, [me]]
                        },
                        {
                            on: true, // i.e. reset the associated user* appData by writing o() to it.
                            use: o()
                        }
                    )
                ],
                otherTextLabelsInScale: [
                    n([me]),
                    [
                        { children: { text: _ } },
                        [
                            { myScale: [{ myScale: _ }, [me]] },
                            [areaOfClass, "SliderScaleLabeledTickmark"]
                        ]
                    ]
                ],
                inputGreaterThanOrEqualScaleMaxValue: [greaterThanOrEqual,
                    [{ inputAsNumber: _ }, [me]],
                    [{ myCanvas: { scaleMaxValue: _ } }, [me]]
                ],
                inputLessThanOrEqualScaleMinValue: [greaterThanOrEqual,
                    [{ myCanvas: { scaleMinValue: _ } }, [me]],
                    [{ inputAsNumber: _ }, [me]]
                ],

                inputLessThanOrEqualScaleLinearMaxValue: [greaterThanOrEqual,
                    [{ myCanvas: { scaleLinearMaxValue: _ } }, [me]],
                    [{ inputAsNumber: _ }, [me]]
                ],

                inputGreaterThanOrEqualScaleLinearMinValue: [greaterThanOrEqual,
                    [{ inputAsNumber: _ }, [me]],
                    [{ myCanvas: { scaleLinearMinValue: _ } }, [me]]
                ],

                // if scale is linearPlusMinus and there are no negative values
                // the linearMinusEdgeValue should not be greater than zero
                smallerThanZeroConstraint: [and,
                    [{ isLinearMinusEdgeValue: _ }, [me]],
                    [{ myCanvas: { noNegativeValues: _ } }, [me]]
                ],

                // if scale is linearPlusMinus and there are no positive values
                // the linearPlusEdgeValue should not be smaller than zero
                greaterThanZeroConstraint: [and,
                    [{ isLinearPlusEdgeValue: _ }, [me]],
                    [{ myCanvas: { noPositiveValues: _ } }, [me]]
                ]
            },
            position: {
                // this is really a hack: i would have liked to give the area being edited as much width as possible without expanding the SliderWidget
                // too much from its pre-editing width. this here is an approximation of that.
                "content-width": [max,
                    o(
                        [{ otherTextLabelsInScale: { width: _ } }, [me]],
                        [displayWidth, {
                            display: {
                                text: { // enough room for placeholder text
                                    value: [{ placeholderInputText: _ }, [me]],
                                    input: o()
                                }
                            }
                        }]
                    )
                ]
            }
        },
        {
            qualifier: { isScaleMinValue: true, smallerThanZeroConstraint: false },
            context: {
                displayText: [{ myCanvas: { minValue: _ } }, [me]], // overrides definition in SliderScaleLabeledTickmark                
                minMaxOrderViolated: o(
                    [{ inputGreaterThanOrEqualScaleMaxValue: _ }, [me]],
                    [and,
                        [{ myCanvas: { scaleType: "linearPlusMinus" } }, [me]],
                        [{ inputGreaterThanOrEqualScaleLinearMinValue: _ }, [me]]
                    ]
                ),
                minMaxOrderViolatedErrorMsg: [cond,
                    [{ inputGreaterThanOrEqualScaleMaxValue: _ }, [me]],
                    o(
                        { on: true, use: "Error: value must be smaller than linear scale's max value" },
                        { on: false, use: "Error: value must be smaller than linear scale's min value" }
                    )
                ],
                inputAppData: [{ myCanvas: { minValue: _ } }, [me]] // override NumberInput (TextInput param)
            }
        },
        {
            qualifier: { isScaleMaxValue: true, smallerThanZeroConstraint: false },
            context: {
                displayText: [{ myCanvas: { maxValue: _ } }, [me]], // overrides definition in SliderScaleLabeledTickmark 
                minMaxOrderViolated: o(
                    [{ inputLessThanOrEqualScaleMinValue: _ }, [me]],
                    [and, // as there is no linearMinus mode, this isn't really necessary, but put in place to mirror perfectly the isScaleMinValue variant above
                        [{ myCanvas: { scaleType: "linearPlusMinus" } }, [me]],
                        [{ inputLessThanOrEqualScaleLinearMaxValue: _ }, [me]]
                    ]
                ),
                minMaxOrderViolatedErrorMsg: [cond,
                    [{ inputGreaterThanOrEqualScaleMaxValue: _ }, [me]],
                    o(
                        { on: true, use: "Error: value must be greater than scale's min value" },
                        { on: false, use: "Error: value must be greater than linear scale's max value (change that first)" }
                    )
                ],

                inputAppData: [{ myCanvas: { maxValue: _ } }, [me]] // override NumberInput (TextInput param)
            }
        },
        {
            qualifier: { isLinearLogEdgeValue: true, smallerThanZeroConstraint: false },
            context: {
                minMaxOrderViolated: o(
                    [{ inputGreaterThanOrEqualScaleMaxValue: _ }, [me]],
                    [{ inputLessThanOrEqualScaleMinValue: _ }, [me]]
                ),
                minMaxOrderViolatedErrorMsg: "Error: value must be within scale edge values",
            }
        },
        {
            qualifier: { smallerThanZeroConstraint: true },
            context: {
                inputGreaterThanZero: [greaterThan, [{ inputAsNumber: _ }, [me]], 0],
                minMaxOrderViolated: o(
                    [{ inputGreaterThanZero: _ }, [me]],
                    [{ inputLessThanOrEqualScaleMinValue: _ }, [me]]
                ),
                minMaxOrderViolatedErrorMsg: "Error: value must be smaller or equal to zero and within scale edge values",
            }
        },
        {
            qualifier: { greaterThanZeroConstraint: true },
            context: {
                inputSmallerThanZero: [lessThan, [{ inputAsNumber: _ }, [me]], 0],
                minMaxOrderViolated: o(
                    [{ inputSmallerThanZero: _ }, [me]],
                    [{ inputGreaterThanOrEqualScaleMaxValue: _ }, [me]]
                ),
                minMaxOrderViolatedErrorMsg: "Error: value must be greater or equal to zero and within scale edge values",
            }
        },
        {
            qualifier: { isLinearPlusEdgeValue: true },
            context: {
                displayText: [{ myCanvas: { scaleLinearMaxValue: _ } }, [me]], // overrides definition in SliderScaleLabeledTickmark 
                // zeroInLogScaleSegmentViolated implicitly verifies the user is not attempting to set userScaleLinearMaxValue <= scaleLinearMinValue
                zeroInLogScaleSegmentViolated: [greaterThan, // true equality to 0 is taken care of useFakeZeroScaleLinearMinValue
                    0,
                    [{ inputAsNumber: _ }, [me]]
                ],
                zeroInLogScaleSegmentErrorMsg: "Error: value must be greater or equal to zero",
                inputAppData: [{ myCanvas: { userScaleLinearMaxValue: _ } }, [me]] // override NumberInput (TextInput param)                                               
            }
        },
        {
            qualifier: { isLinearMinusEdgeValue: true },
            context: {
                displayText: [cond, // overrides definition in SliderScaleLabeledTickmark 
                    [{ myCanvas: { fakeZeroNegativeLogEdge: _ } }, [me]],
                    o(
                        { on: true, use: 0 },
                        { on: false, use: [{ myCanvas: { scaleLinearMinValue: _ } }, [me]] }
                    )],
                // zeroInLogScaleSegmentViolated implicitly verifies the user is not attempting to set userScaleLinearMaxValue <= scaleLinearMinValue
                zeroInLogScaleSegmentViolated: [greaterThan, // true equality to 0 is taken care of useFakeZeroScaleLinearMaxValue
                    [{ inputAsNumber: _ }, [me]],
                    0
                ],
                zeroInLogScaleSegmentErrorMsg: "Error: value must be smaller than zero",
                inputAppData: [{ myCanvas: { userScaleLinearMinValue: _ } }, [me]] // override NumberInput (TextInput param)
            }
        },
        {
            qualifier: {
                editInputText: true,
                minMaxOrderViolated: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: [{ minMaxOrderViolatedErrorMsg: _ }, [me]]
            }
        },
        {
            qualifier: {
                editInputText: true,
                zeroInLogScaleSegmentViolated: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: [{ zeroInLogScaleSegmentErrorMsg: _ }, [me]]
            }
        }
    ),

    SliderScaleTickmark: o(
        {
            "class": "ScaleTickmark",
            context: {
                mySliderScaleLine: [
                    { children: { scaleLine: _ } },
                    [
                        [areaOfClass, "SliderScale"],
                        [embeddingStar]
                    ]
                ]
            }
        },
        {
            qualifier: { scaleAtLowHTML: true },
            context: {
                tickmarkAnchoragePosPoint: atomic({
                    type: [{ lowHTMLGirth: _ }, [me]],
                    element: [{ mySliderScaleLine: _ }, [me]]
                })
            }
        },
        {
            qualifier: { scaleAtLowHTML: false },
            context: {
                tickmarkAnchoragePosPoint: atomic({
                    type: [{ highHTMLGirth: _ }, [me]],
                    element: [{ mySliderScaleLine: _ }, [me]]
                })
            }
        }
    ),

    SliderScaleUnlabeledTickmark: {
        "class": o(
            "SliderScaleUnlabeledTickmarkDesign",
            "SliderScaleElement",
            "SliderScaleTickmark"
        )
    },

    SliderScaleLabelTickmark: {
        "class": o("SliderScaleLabelTickmarkDesign", "SliderScaleTickmark"),
        context: {
            scaleAtLowHTML: [{ ofVerticalElement: _ }, [me]]
        }
    },

    SliderScaleLabelText: {
        "class": o("ScaleText", "TrackMySliderWidget"),
        context: {
            width: [offset, { type: "left" }, { type: "right" }] // used by SliderScaleEditableLabelText
        }
    }
};
