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

/*
Hierarchy:
    - ScaledGrid (aux class)
        - Scale
        - Grid
    - Scale
    - Grid
        - HorizontalLine
        - GridLineArea (set) - primary, secondary, tertiary
            - TickMark 
            - (TickValueLabel) - not for tertiary by default    
*/

var classes = {

    // this class must be imported by a high-level class which embeds elements that share the same scale
    ScaleContext: {
        context: {
            scale: mustBeDefined
        }
    },

    Scale: o(        
        {        
        /*
        requires: 
         - maxValue
         - size (size of the scale in pixels)            
        provides:
         - tickMark (step)
         - maxScale (maximum value of the scale)
        */
        "class": "ScaleCalc",
        context: {
            simplifiedScale: false,
            maxValue: mustBeDefined,
            size: [offset, { type: "left" }, { type: "right" }],
            primaryValues: o(0, [{ maxScale: _ }, [me]])            
        },
        position: {
            //left: must be defined
            //right: must be defined
            height: 0
        }
    }, 
    {
        qualifier: { simplifiedScale: false },        
        context: {
            secondaryValues: [
                n([{ primaryValues: _ }, [me]]),
                [scaleTickmarkValues, [{ tickMark: _ }, [me]], [{ maxScale: _ }, [me]]]
            ],
            tertiaryStep: [div, [{ tickMark: _ }, [me]], 10],
            tertiaryValues: [
                n(o([{ primaryValues: _ }, [me]], [{ secondaryValues: _ }, [me]])),
                [scaleTickmarkValues, [{ tertiaryStep: _ }, [me]], [{ maxScale: _ }, [me]]]
            ]
        }
    },
    {
            qualifier: { roundScaleMax: false },
            context: {
                primaryValues: 0
            }
        }),


    // assumes scale starts from zero
    PositionOnScale: {
        context: {
            typePositionOfMe: mustBeDefined,
            value: mustBeDefined,
            scale: mustBeDefined,
            pixelsPerUnitValue: [div,
                [{ size: _ }, [{ scale: _ }, [me]]],
                [{ maxScale: _ }, [{ scale: _ }, [me]]]
            ],
            valueToOffset: [defun,
                o("value"),
                [
                    round,
                    [
                        mul,
                        "value",
                        [{ pixelsPerUnitValue: _ }, [me]] // defined internally
                    ]
                ]
            ],
            offsetFromZero: [
                [{ valueToOffset: _ }, [me]],
                [{ value: _ }, [me]]
            ]
        },
        position: {
            horizontalPositioning: {
                point1: { element: [{ scale: _ }, [me]], type: "left" },
                point2: { type: [{ typePositionOfMe: _ }, [me]] },
                equals: [{ offsetFromZero: _ }, [me]]
            }
        }
    },

    ScaleCalc: o(
        {
            context: {
                /// The scale positions values between 0 and maxValue
                maxValue: mustBeDefined,
                /// When true, the max value of the scale is rounded to a secondary
                /// tickmark; when false, it's maxValue
                roundScaleMax: true,
                /// size of the scale in pixels
                size: mustBeDefined,
                /// Minimum distance between two secondary tickmarks; increasing this
                /// number will result in a higher increment.
                minDistanceBetweenSecondaryTickMarks: 90,

                exponent: [ceil, [log10, [{ maxValue: _ }, [me]]]],
                fraction: [div, [{ maxValue: _ }, [me]], [pow, 10, [{ exponent: _ }, [me]]]],
                /// The normalized fraction is a number between 10 and 100 and is
                /// used to determine the appropriate secondary tickmark.
                normalizedFraction: [ceil, [mul, [{ fraction: _ }, [me]], 100]],

                nrSteps: [max,
                    [floor,
                        [div,
                            [{ size: _ }, [me]],
                            [{ minDistanceBetweenSecondaryTickMarks: _ }, [me]]
                        ]
                    ],
                    1
                ],
                idealDivisor: [div, [{ normalizedFraction: _ }, [me]], [{ nrSteps: _ }, [me]]],
                firstAcceptableStep: [first,
                    [
                        r([{ idealDivisor: _ }, [me]], Infinity),
                        o(0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50)
                    ]
                ],

                /// The size of tickmarks
                tickMark: [
                    mul,
                    [
                        cond, [empty, [{ firstAcceptableStep: _ }, [me]]], o(
                            { on: true, use: 100 },
                            { on: false, use: [{ firstAcceptableStep: _ }, [me]] }
                        )
                    ],
                    [
                        div,
                        [pow, 10, [{ exponent: _ }, [me]]],
                        100
                    ]
                ]

            }
        },
        {
            qualifier: { roundScaleMax: true },
            context: {
                /// Maximum value for the scale; round up to the next tickmark
                maxScale: [
                    mul,
                    [ceil, [div, [{ maxValue: _ }, [me]], [{ tickMark: _ }, [me]]]],
                    [{ tickMark: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { roundScaleMax: false },
            context: {
                // When not rounded up, take the original maxValue
                maxScale: [{ maxValue: _ }, [me]]
            }
        }
    ),

    /*
    ScaledGrid class
    aux class to make a separate scaled grid
    */
    ScaledGridContext: {
        context: {
            scaledGridStartEndMargin: 20
        }
    },

    ScaledGrid: {
        "class": "ScaledGridContext",
        context: {
            maxValue: mustBeDefined,
            scale: [{ children: { scale: _ } }, [me]],
            tickPosition: mustBeDefined,
        },
        children: {
            scale: {
                description: {
                    "class": "Scale",
                    context: {
                        maxValue: [{ maxValue: _ }, [embedding]]
                    },
                    position: {
                        left: [{ scaledGridStartEndMargin: _ }, [myContext, "ScaledGrid"]],
                        right: [{ scaledGridStartEndMargin: _ }, [myContext, "ScaledGrid"]]
                    }
                }
            },
            grid: {
                description: {
                    "class": "Grid",
                    context: {
                        scale: [{ children: { scale: _ } }, [embedding]],
                        tickPosition: [{ tickPosition: _ }, [embedding]]
                    }
                }
            }
        },
        display: {
            //borderWidth: 1,
            //borderStyle: "dashed",
        }
    },

    /*
    Grid Class
    */
    GridContext: {
        context: {
            fontFamily: '"Open Sans",Roboto,sans-serif',
            fontWeight: 300,
            verticalDistanceFromTickmark: 2,
            primaryFontSize: 12,
            secondaryFontSize: 10,
            tickmarkColor: "#666",
            tickmarkPrimaryHeight: 6,
            tickmarkSecondaryHeight: 4,
            tickmarkTertiaryHeight: 2
        }
    },

    Grid: o(
        {
            "class": "GridContext",
            context: {
                tickPosition: mustBeDefined,
                scale: mustBeDefined,
                showLabelValue: true, // default
                showAxisLine: true,
                showPrimaryGridLines: true,
                showSecondaryGridLines: true,
                showTertiaryGridLines: true
            },
            position: {
                "class": "MinWrapVerticallyEmbedded",
                left: 0,
                right: 0
            },
            /*display: {
                borderStyle: "dashed",
                borderWidth: 1
            }*/
        },
        {
            qualifier: { showAxisLine: true },
            children: {
                horizontalLine: {
                    description: {
                        "class": "GridHorizontalLine"
                    }
                }
            }
        },
        {
            qualifier: { showPrimaryGridLines: true },
            children: {
                primaryGridLines: {
                    data: [{ primaryValues: _ }, [{ scale: _ }, [me]]],
                    description: {
                        "class": "GridLineArea",
                        context: {
                            type: "primary"
                        }
                    }
                }
            }
        },
        {
            qualifier: { showSecondaryGridLines: true },
            children: {
                secondaryGridLines: {
                    data: [{ secondaryValues: _ }, [{ scale: _ }, [me]]],
                    description: {
                        "class": "GridLineArea",
                        context: {
                            type: "secondary"
                        }
                    }
                }
            }
        },
        {
            qualifier: { showTertiaryGridLines: true },
            children: {
                tertiaryGridLines: {
                    data: [{ tertiaryValues: _ }, [{ scale: _ }, [me]]],
                    description: {
                        "class": "GridLineArea",
                        context: {
                            type: "tertiary"
                        }
                    }
                }
            }
        }
    ),

    GridHorizontalLine: o(
        {
            context: {
                scale: [{ scale: _ }, [myContext, "Grid"]],
                tickPosition: [{ tickPosition: _ }, [myContext, "Grid"]],
                height: 1
            },
            position: {
                height: [{ height: _ }, [me]],
                leftWithscale: {
                    point1: { element: [{ scale: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
                rightWithscale: {
                    point1: { element: [{ scale: _ }, [me]], type: "right" },
                    point2: { type: "right" },
                    equals: 0
                }
            },
            display: {
                borderWidth: [{ height: _ }, [me]],
                borderStyle: "solid",
                borderColor: "black"
            }
        },
        {
            qualifier: { tickPosition: "top" },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: { tickPosition: "bottom" },
            position: {
                top: 0
            }
        }
    ),

    GridLineArea: o(
        {
            "class": "PositionOnScale",
            context: {
                showLabelValue: [{ showLabelValue: _ }, [myContext, "Grid"]],
                scale: [{ scale: _ }, [embedding]],
                value: [{ param: { areaSetContent: _ } }, [me]],
                typePositionOfMe: "horizontal-center",
                last: [equal,
                    [{ value: _ }, [me]],
                    [{ maxScale: _ }, [{ scale: _ }, [me]]]
                ],
                myTickmark: [{ children: { tickMark: _ } }, [me]]
            },
            position: {
                //top: 0,
                //bottom: 0,
                "class": "MinWrapVerticallyEmbedded",
                leftOfTickmark: {
                    point1: { type: "left" },
                    point2: { element: [{ myTickmark: _ }, [me]], type: "left" },
                    min: 0
                },
                rightOfTickmark: {
                    point1: { element: [{ myTickmark: _ }, [me]], type: "right" },
                    point2: { type: "right" },
                    min: 0
                }
            },
            children: {
                tickMark: {
                    description: {
                        "class": "TickMark"
                    }
                }
            }
        },
        {
            qualifier: { type: o("primary", "secondary"), showLabelValue: true },
            children: {
                valueLabel: {
                    description: {
                        "class": "TickValueLabel",
                        position: {
                            // stretch parent to fit the value
                            left: 0,
                            right: 0
                        }
                    }
                }
            }
        }
    ),

    TickMark: o(
        {
            context: {
                tickPosition: [{ tickPosition: _ }, [myContext, "Grid"]], // top|bottom
                last: [{ last: _ }, [embedding]],
                type: [{ type: _ }, [embedding]], // primary|secondary|tertiary
                scale: [{ scale: _ }, [embedding]],
                width: 1
            },
            position: {
                width: [{ width: _ }, [me]]
            },
            display: {
                borderWidth: [{ width: _ }, [me]],
                //borderLeftStyle: "solid",
                borderStyle: "solid",
                borderColor: [{ tickmarkColor: _ }, [myContext, "Grid"]],
            }
        },
        {
            qualifier: { type: "primary" },
            position: {
                height: [{ tickmarkPrimaryHeight: _ }, [myContext, "Grid"]],
            }
        },
        {
            qualifier: { type: "secondary" },
            position: {
                height: [{ tickmarkSecondaryHeight: _ }, [myContext, "Grid"]],
            }
        },
        {
            qualifier: { type: "tertiary" },
            position: {
                height: [{ tickmarkTertiaryHeight: _ }, [myContext, "Grid"]],
            }
        },
        {
            qualifier: { last: false },
            position: {
                "horizontal-center": 0
            }
        },
        {
            qualifier: { last: true },
            position: {
                endOfScale: {
                    point1: { type: "right" },
                    point2: { element: [{ scale: _ }, [me]], type: "right" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { tickPosition: "top" },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: { tickPosition: "bottom" },
            position: {
                top: 0
            }
        }
    ),

    TickValueLabel: o(
        {
            context: {
                value: [{ value: _ }, [embedding]],
                valueText: [translateNumToSuffixBaseFormat,
                    [{ value: _ }, [me]],
                    "financialSuffix",
                    1,
                    true //useStandardPrecision
                ],
                type: [{ type: _ }, [embedding]], // primary|secondary|tertiary
                tickElement: [{ children: { tickMark: _ } }, [embedding]],
                tickPosition: [{ tickPosition: _ }, [myContext, "Grid"]], // top|bottom                
            },
            position: {
                horizontallyCenteredWithGridLineArea: {
                    point1: { element: [embedding], type: "horizontal-center" },
                    point2: { type: "horizontal-center" },
                    equals: 0
                },
                width: [displayWidth],
                height: [displayHeight]
            },
            display: {
                text: {
                    fontFamily: [{ fontFamily: _ }, [myContext, "Grid"]],
                    fontWeight: [{ fontWeight: _ }, [myContext, "Grid"]],
                    value: [{ valueText: _ }, [me]]
                }
            }
        },
        {
            qualifier: { tickPosition: "top" },
            position: {
                aboveTickElement: {
                    point1: { type: "bottom" },
                    point2: { element: [{ tickElement: _ }, [me]], type: "top" },
                    equals: [{ verticalDistanceFromTickmark: _ }, [myContext, "Grid"]],
                }
            }
        },
        {
            qualifier: { tickPosition: "bottom" },
            position: {
                belowTickElement: {
                    point1: { element: [{ tickElement: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: [{ verticalDistanceFromTickmark: _ }, [myContext, "Grid"]],
                }
            }
        },
        {
            qualifier: { type: "primary" },
            display: {
                text: {
                    fontSize: [{ primaryFontSize: _ }, [myContext, "Grid"]],
                }
            }
        },
        {
            qualifier: { type: "secondary" },
            display: {
                text: {
                    fontSize: [{ secondaryFontSize: _ }, [myContext, "Grid"]],
                }
            }
        }
    )

}