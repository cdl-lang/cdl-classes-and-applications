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

// %%include%%: "../18_BasicClasses/reference.js"
// %%classfile%%: "../18_BasicClasses/wrap.js"
// %%classfile%%: "utils.js"
// %%classfile%%: "colorPalette.js"

/*
Hierarchy:
    - Multibar
        - BarsArea
            - Bar (set)
                - BarValue
            - (BottomGrid, TopGrid) - optional
*/

var classes = {

    /*--------------------
    Multibar class
    --------------------*/

    MultibarContext: {
        context: {
            scale: [{ scale: _ }, [myContext, "Scale"]],
            legend: mustBeDefined,
            labeledValues: mustBeDefined,
            type: mustBeDefined, //"Standard", "Stacked", "Embedded"                        

            // Deafault params:
            // -----------------

            // value params
            showValues: true,
            valueFontSize: 11,
            showValueOnlyIfItFits: false,

            // barArea params:
            barAreaOffsetFromBottom: 10,
            barAreaHeightRatio: 0.40,

            //type=(all) params:
            valueHorizontalMarginFromBar: 5,

            //type=Embedded params:
            percentageHeightReduction: 0.70,

            //type=Embedded/Stacked params:
            valueVerticalMarginTop: 5, // above barArea in top mode                        
            valueDistanceFromConnectionLine: 0, // distance between value and connection line in top mode
            valueVerticalStep: 3, //from value of one bar to the next when values are displayed at the Top

            //type=Standard params:
            verticalBarMargin: 4,

            topGrid: true,
            topGridValues: true,
            bottomGrid: true,
            bottomGridValues: true,
        }
    },

    Multibar: o(
        {
            "class": o("MultibarContext"),
            context: {
                barsArea: [{ children: { barsArea: _ } }, [me]]
            },
            children: {
                barsArea: {
                    description: {
                        "class": "BarsArea"
                    }
                }
            },
            /*display: {
                borderColor: "red",
                borderStyle: "dashed",
                borderWidth: 2
            }*/
        },
        {
            qualifier: { topGrid: true },
            children: {
                topGridArea: {
                    description: {
                        "class": "Grid",
                        context: {
                            scale: [{ scale: _ }, [embedding]],
                            tickPosition: "top",
                            barsArea: [{ barsArea: _ }, [embedding]],
                            showLabelValue: [{ topGridValues: _ }, [embedding]]
                        },
                        position: {
                            left: 0,
                            right: 0,
                            topOfMultibar: {
                                point1: { element: [{ barsArea: _ }, [me]], type: "top" },
                                point2: { type: "bottom" },
                                equals: 0
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { bottomGrid: true },
            children: {
                bottomGridArea: {
                    description: {
                        "class": "Grid",
                        context: {
                            scale: [{ scale: _ }, [embedding]],
                            tickPosition: "bottom",
                            barsArea: [{ barsArea: _ }, [embedding]],
                            showLabelValue: [{ bottomGridValues: _ }, [embedding]]
                        },
                        position: {
                            left: 0,
                            right: 0,
                            bottomOfMultibar: {
                                point1: { type: "top" },
                                point2: { element: [{ barsArea: _ }, [me]], type: "bottom" },
                                equals: 0
                            }
                        }
                    }
                }
            }
        }
    ),

    BarsArea: o(
        {
            context: {
                scale: [{ scale: _ }, [myContext, "Multibar"]],
                type: [{ type: _ }, [myContext, "Multibar"]],
                showValues: [{ showValues: _ }, [myContext, "Multibar"]],
                showValueOnlyIfItFits: [{ showValueOnlyIfItFits: _ }, [myContext, "Multibar"]],
                labeledValues: [{ labeledValues: _ }, [myContext, "Multibar"]],
                myBars: [{ children: { bars: _ } }, [me]],
            },
            children: {
                bars: {
                    data: [{ labeledValues: _ }, [me]],
                    description: {
                        "class": "Bar",
                        context: {
                            index: [index, [{ children: { bars: _ } }, [embedding]], [me]], // 0 for larger bar
                            indexFromLeft: [minus,
                                [size, [{ children: { bars: _ } }, [embedding]]],
                                [plus, [{ index: _ }, [me]], 1]
                            ],
                            showValue: [{ showValues: _ }, [embedding]],
                        }
                    }
                }
            },
            /*display: {
                borderColor: "blue",
                borderStyle: "solid",
                borderWidth: 1
            },*/
            position: {
                leftAlignedWithScale: {
                    point1: { element: [{ scale: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
                rightAlignedWithScale: {
                    point1: { type: "right" },
                    point2: { element: [{ scale: _ }, [me]], type: "right" },
                    equals: 0
                },
                bottom: [{ barAreaOffsetFromBottom: _ }, [myContext, "Multibar"]],
                heightConstraint: {
                    pair1: {
                        point1: { type: "top", element: [embedding] },
                        point2: { type: "bottom", element: [embedding] }
                    },
                    pair2: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    ratio: [{ barAreaHeightRatio: _ }, [myContext, "Multibar"]]
                }
            }
        },
        {
            qualifier: { showValues: true, showValueOnlyIfItFits: false },
            context: {
                myBarValues: [{ children: { barValue: _ } }, [{ myBars: _ }, [me]]],
                allValuesFittingInsideBar: [empty, [false, [{ fittingInsideBar: _ }, [{ myBarValues: _ }, [me]]]]],
                allValuesFittingOutsideBar: [empty, [false, [{ fittingOutsideBar: _ }, [{ myBarValues: _ }, [me]]]]],
            }
        },
        {
            qualifier: { showValues: true, showValueOnlyIfItFits: false, type: o("Embedded", "Stacked") },
            context: {
                gloabalBarValuePositioning: [cond,
                    [{ allValuesFittingInsideBar: _ }, [me]],
                    o(
                        { on: true, use: "left" },
                        {
                            on: false, use: [cond,
                                [{ allValuesFittingOutsideBar: _ }, [me]],
                                o(
                                    { on: true, use: "right" },
                                    { on: false, use: "top" }
                                )
                            ]
                        }
                    )
                ]
            }
        },
        {
            qualifier: { showValues: true, showValueOnlyIfItFits: true },
            context: {
                gloabalBarValuePositioning: "left"
            }
        },
        {
            qualifier: { showValues: true, showValueOnlyIfItFits: false, type: "Standard" },
            context: {
                gloabalBarValuePositioning: [cond,
                    [{ allValuesFittingInsideBar: _ }, [me]],
                    o(
                        { on: true, use: "left" },
                        {
                            on: false, use: "right"
                        }
                    )
                ]
            }
        }
    ),

    Bar: o(
        {
            "class": o("PositionOnScale"),
            context: {
                indexFromLeft: mustBeDefined, //0 based                
                showValue: mustBeDefined,
                prevBar: [prev, [me]],
                nextBar: [next, [me]],
                scale: [{ scale: _ }, [myContext, "Multibar"]],
                type: [{ type: _ }, [myContext, "Multibar"]],
                labeledValue: [{ param: { areaSetContent: _ } }, [me]],
                label: [{ label: _ }, [{ labeledValue: _ }, [me]]],
                barColor: [
                    [{ getColorForLabel: _ }, [{ legend: _ }, [myContext, "Multibar"]]],
                    [{ label: _ }, [me]]
                ],
                barTextColor: [getFgColorForBgColor,
                    [{ barColor: _ }, [me]]
                ],
                value: [{ value: _ }, [{ labeledValue: _ }, [me]]],   // redefined in stacked                   
                displayValue: [{ value: _ }, [{ labeledValue: _ }, [me]]],
                typePositionOfMe: "right" // used by PositionOnScale
            },
            position: {
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: 1,
                    priority: 1
                }
            },
            display: {
                background: [{ barColor: _ }, [me]]
            }
        },

        {
            qualifier: { type: "Embedded" },
            context: {
                heightReductionRefElement: [first, o([{ prevBar: _ }, [me]], [embedding])],
                calculatedRatio: [cond,
                    [{ prevBar: _ }, [me]],
                    o(
                        { on: true, use: [{ percentageHeightReduction: _ }, [myContext, "Multibar"]] }, // pair2 / pair1
                        { on: false, use: 1 }
                    )
                ]
            },
            position: {
                "vertical-center": 0,
                heightConstraint: {
                    pair1: {
                        point1: { type: "top", element: [{ heightReductionRefElement: _ }, [me]] },
                        point2: { type: "bottom", element: [{ heightReductionRefElement: _ }, [me]] }
                    },
                    pair2: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    ratio: [{ calculatedRatio: _ }, [me]]
                },
                leftAlignedWithCanvas: {
                    point1: { element: [embedding], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
            }
        },

        {
            qualifier: { type: "Standard" },
            context: {
                posRefPoint: [cond,
                    [{ prevBar: _ }, [me]],
                    o(
                        { on: true, use: { element: [{ prevBar: _ }, [me]], type: "top" } },
                        { on: false, use: { element: [embedding], type: "bottom" } }
                    )
                ],

                numberOfBars: [size, [{ children: { bars: _ } }, [embedding]]],

                calculatedHeight: [div, // height of embedding / number of bars
                    [minus,
                        [offset,
                            { element: [embedding], type: "top" },
                            { element: [embedding], type: "bottom" },
                        ],
                        [mul,
                            [{ verticalBarMargin: _ }, [myContext, "Multibar"]],
                            [plus, 1, [{ numberOfBars: _ }, [me]]],
                        ]
                    ],
                    [{ numberOfBars: _ }, [me]],
                ],
            },
            position: {
                abovePosRefElement: {
                    point1: { type: "bottom" },
                    point2: [{ posRefPoint: _ }, [me]],
                    equals: [{ verticalBarMargin: _ }, [myContext, "Multibar"]],
                },
                height: [{ calculatedHeight: _ }, [me]],
                leftAlignedWithCanvas: {
                    point1: { element: [embedding], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                }
            }
        },

        {
            qualifier: { type: "Stacked" },
            context: {
                prevValue: [first, o([{ value: _ }, [{ prevBar: _ }, [me]]], 0)],
                value: [plus, [{ value: _ }, [{ labeledValue: _ }, [me]]], [{ prevValue: _ }, [me]]],
                leftPoint: [cond,
                    [{ prevBar: _ }, [me]],
                    o(
                        { on: true, use: { element: [{ prevBar: _ }, [me]], type: "right" } },
                        { on: false, use: { element: [embedding], type: "left" } }
                    )
                ],
            },
            position: {
                top: 0,
                bottom: 0,
                leftAlignedWithLeftPoint: {
                    point1: [{ leftPoint: _ }, [me]],
                    point2: { type: "left" },
                    equals: 0
                },
            }
        },

        {
            qualifier: { showValue: true },
            children: {
                barValue: {
                    partner: [myContext, "Multibar"],
                    description: {
                        "class": "BarValue",
                        independentContentPosition: false,
                        embedding: "referred", // partner
                        context: {
                            myBar: [expressionOf]
                        }
                    }
                }
            }
        }
    ),

    BarValue: o(
        {
            context: {
                myBar: mustBeDefined,
                myBarIndexFromLeft: [{ indexFromLeft: _ }, [{ myBar: _ }, [me]]],
                barsArea: [embedding, [{ myBar: _ }, [me]]],
                histogramArea: [myContext, "Multibar"],
                barValueToTheRight: [{ children: { barValue: _ } }, [{ barToTheRight: _ }, [me]]],
                barTextColor: [{ barTextColor: _ }, [{ myBar: _ }, [me]]],
                barTextColorToTheRight: [first,
                    o(
                        [{ barTextColor: _ }, [{ barToTheRight: _ }, [me]]],
                        [{ defaultTextColor: _ }, [myContext, "Multibar"]]
                    )
                ],

                // global decision based on other bars
                barValuePositioning: [{ gloabalBarValuePositioning: _ }, [{ barsArea: _ }, [me]]],
                showText: [or,
                    [not, [{ showValueOnlyIfItFits: _ }, [myContext, "Multibar"]]],
                    [{ fittingInsideBar: _ }, [me]]
                ],
                type: [{ type: _ }, [myContext, "Multibar"]],
                value: [{ displayValue: _ }, [{ myBar: _ }, [me]]],
                valueText: [translateNumToSuffixBaseFormat,
                    [{ value: _ }, [me]],
                    "financialSuffix",
                    1,
                    true //useStandardPrecision
                ],
                valueHorizontalMarginFromBar: [{ valueHorizontalMarginFromBar: _ }, [myContext, "Multibar"]],
                valueVerticalMarginTop: [{ valueVerticalMarginTop: _ }, [myContext, "Multibar"]],
                minSpacingBetweenLabelsInTopPositioningMode: 20,
                myAuxDisplayTextArea: [{ children: { auxDisplayTextArea: _ } }, [me]], //[areaOfClass, "AuxDisplayTextArea"],
                calculatedDisplayWidth: [{ calculatedDisplayWidth: _ }, [{ myAuxDisplayTextArea: _ }, [me]]],
                calculatedDisplayHeight: [{ calculatedDisplayHeight: _ }, [{ myAuxDisplayTextArea: _ }, [me]]],
                totalWidth: [plus,
                    [{ calculatedDisplayWidth: _ }, [me]],
                    [mul, 2, [{ valueHorizontalMarginFromBar: _ }, [me]]]
                ],
                leftPointForSpaceToTheLeft: [cond,
                    [{ barToTheLeft: _ }, [me]],
                    o(
                        { on: true, use: { element: [{ barToTheLeft: _ }, [me]], type: "right" } },
                        { on: false, use: { element: [{ myBar: _ }, [me]], type: "left" } }
                    )
                ],
                rightPointForSpaceToTheRight: [cond,
                    [{ barToTheRight: _ }, [me]],
                    o(
                        { on: true, use: { element: [{ barToTheRight: _ }, [me]], type: "right" } },
                        { on: false, use: { element: [{ embedding: _ }, [{ myBar: _ }, [me]]], type: "right" } }
                    )
                ],
                spaceToTheLeft: [offset,
                    [{ leftPointForSpaceToTheLeft: _ }, [me]],
                    { element: [{ myBar: _ }, [me]], type: "right" }
                ],
                spaceToTheRight: [offset,
                    { element: [{ myBar: _ }, [me]], type: "right" },
                    [{ rightPointForSpaceToTheRight: _ }, [me]],
                ],
                fittingInsideBar: [greaterThanOrEqual, [{ spaceToTheLeft: _ }, [me]], [{ totalWidth: _ }, [me]]],
                fittingOutsideBar: [or,
                    [not, [{ barToTheRight: _ }, [me]]],
                    [greaterThanOrEqual, [{ spaceToTheRight: _ }, [me]], [{ totalWidth: _ }, [me]]]
                ]
            },
            position: {
                width: [{ calculatedDisplayWidth: _ }, [me]],
                height: [{ calculatedDisplayHeight: _ }, [me]]
            },            
            children: {
                auxDisplayTextArea: {
                    description: {
                        context: {
                            calculatedDisplayWidth: [displayWidth],
                            calculatedDisplayHeight: [displayHeight],
                        },
                        display: {
                            text: {
                                fontFamily: [{ fontFamily: _ }, [myContext, "App"]],
                                fontWeight: [{ fontWeight: _ }, [myContext, "App"]],
                                fontSize: [{ valueFontSize: _ }, [myContext, "Multibar"]],
                                value: [{ valueText: _ }, [embedding]]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { showText: true },
            display: {
                text: {
                    fontFamily: [{ fontFamily: _ }, [myContext, "App"]],
                    fontWeight: [{ fontWeight: _ }, [myContext, "App"]],
                    fontSize: [{ valueFontSize: _ }, [myContext, "Multibar"]],
                    value: [{ valueText: _ }, [me]],
                    color: [{ valueTextColor: _ }, [me]]
                }
            }
        },
        {
            qualifier: { type: "Embedded" },
            context: {
                barToTheRight: [{ prevBar: _ }, [{ myBar: _ }, [me]]],
                barToTheLeft: [{ nextBar: _ }, [{ myBar: _ }, [me]]],
                valueVerticalStep: [{ valueVerticalStep: _ }, [myContext, "Multibar"]],
            }
        },
        {
            qualifier: { type: "Stacked" },
            context: {
                //barToTheRight: [{ prevBar: _ }, [{ myBar: _ }, [me]]],
                //barToTheLeft: [{ nextBar: _ }, [{ myBar: _ }, [me]]],
                barToTheRight: [{ nextBar: _ }, [{ myBar: _ }, [me]]], // inverted in case of type:"Embedded"
                barToTheLeft: [{ prevBar: _ }, [{ myBar: _ }, [me]]], // inverted in case of type:"Embedded"
                valueVerticalStep: [uminus, [{ valueVerticalStep: _ }, [myContext, "Multibar"]]],
            }
        },
        {
            qualifier: { type: "Standard" },
            context: {
                barToTheRight: o(),
                barToTheLeft: o(),
            }
        },
        {
            qualifier: { barValuePositioning: "top" },
            context: {
                valueTextColor: [{ defaultTextColor: _ }, [myContext, "Multibar"]],
            },
            position: {
                topAlignedWithBarsArea: {
                    point1: { type: "bottom" },
                    point2: { element: [{ barsArea: _ }, [me]], type: "top" },
                    equals: [{ valueVerticalMarginTop: _ }, [me]],
                },
                horizontallyAlignedAfterBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    min: [{ valueHorizontalMarginFromBar: _ }, [me]],
                },
                horizontallyAsCloseAsPossibleToBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    preference: "min",
                    priority: -1,
                },
                leftOfBarValueToTheRight: {
                    point1: { type: "right" },
                    point2: { element: [{ barValueToTheRight: _ }, [me]], type: "left" },
                    min: [{ minSpacingBetweenLabelsInTopPositioningMode: _ }, [me]],
                },
            },
            children: {
                connectionLine: {
                    partner: [{ histogramArea: _ }, [me]],
                    description: {
                        "class": "BarValueConnectionLine",
                        independentContentPosition: false,
                        embedding: "referred", // partner
                        context: {
                            myValue: [expressionOf],
                            myBar: [{ myBar: _ }, [{ myValue: _ }, [me]]],
                            myBarIndexFromLeft: [{ myBarIndexFromLeft: _ }, [{ myValue: _ }, [me]]],
                            verticalBarMargin: [{ valueVerticalStep: _ }, [{ myValue: _ }, [me]]],
                        }
                    }
                }
            },
        },
        {
            qualifier: { barValuePositioning: "left" },
            context: {
                valueTextColor: [{ barTextColor: _ }, [me]],
            },

            position: {
                verticalCenteredWithMyBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "vertical-center" },
                    point2: { type: "vertical-center" },
                    equals: 0,
                },
                horizontallyAlignedBeforeBar: {
                    point1: { type: "right" },
                    point2: { element: [{ myBar: _ }, [me]], type: "right" },
                    equals: [{ valueHorizontalMarginFromBar: _ }, [me]],
                }
            },
        },
        {
            qualifier: { barValuePositioning: "right" },
            context: {
                valueTextColor: [{ barTextColorToTheRight: _ }, [me]]
                /*[cond,
                    ["Embedded", [{ type: _ }, [me]]],
                    o(
                        { on: true, use: [{ barTextColorToTheRight: _ }, [me]], },
                        { on: false, use: [{ defaultTextColor: _ }, [myContext, "Multibar"]] }
                    )
                ]*/
            },
            position: {
                verticalCenteredWithMyBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "vertical-center" },
                    point2: { type: "vertical-center" },
                    equals: 0,
                },
                horizontallyAlignedAfterBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    equals: [{ valueHorizontalMarginFromBar: _ }, [me]],
                }
            }
        }
    ),

    BarValueConnectionLine: {
        context: {
            myValue: mustBeDefined,
            myBar: mustBeDefined,
            myBarIndexFromLeft: mustBeDefined,
            verticalBarMargin: mustBeDefined
        },
        position: {
            bottomAlignedWithVerticalCenterOfBar: {
                point1: { element: [{ myBar: _ }, [me]], type: "vertical-center" },
                point2: { type: "bottom" },
                equals: [mul, [{ myBarIndexFromLeft: _ }, [me]], [{ verticalBarMargin: _ }, [me]]],
            },
            leftAlignedWithRightOfBar: {
                point1: { element: [{ myBar: _ }, [me]], type: "right" },
                point2: { type: "left" },
                equals: 0,
            },
            topAlignedWithBottomOfValue: {
                point1: { element: [{ myValue: _ }, [me]], type: "bottom" },
                point2: { type: "top" },
                equals: [{ valueDistanceFromConnectionLine: _ }, [myContext, "Multibar"]]
            },
            rightAlignedWithHorizontalCenterOfValue: {
                point1: { element: [{ myValue: _ }, [me]], type: "horizontal-center" },
                point2: { type: "right" },
                equals: 0,
            }
        },
        display: {
            borderWidth: 1,
            borderBottomStyle: "solid",
            borderRightStyle: "solid",
        }
    }


};
