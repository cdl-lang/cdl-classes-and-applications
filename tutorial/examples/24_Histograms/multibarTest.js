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

// %%classfile%%: "../../../../scripts/feg/test/generalClasses.js"
// %%classfile%%: "../18_BasicClasses/draggable.js"
// %%classfile%%: "../18_BasicClasses/selectable.js"
// %%classfile%%: "../18_BasicClasses/matrixLayout.js"
// %%classfile%%: "../18_BasicClasses/wrap.js"
// %%classfile%%: "multibar.js"
// %%classfile%%: "scale.js"
// %%classfile%%: "legend.js"

var classes = {

    AppContext: {
        context: {
            fontFamily: '"Open Sans",Roboto,sans-serif',
            fontWeight: 300,
            defaultTextColor: "#111111",
        }
    },

    InputValues: {
        context: {
            "^value1": 300,
            "^value2": 200,
            "^value3": 100,
            labeledValues: o(
                { label: "planned", value: [{ value1: _ }, [me]] },
                { label: "allocated", value: [{ value2: _ }, [me]] },
                { label: "spent", value: [{ value3: _ }, [me]] }
            ),
        },
        children: {
            inputLabeledValues: {
                data: [{ labeledValues: _ }, [me]],
                description: {
                    "class": "LabeledTextValueInput",
                    context: {
                        myData: [{ param: { areaSetContent: _ } }, [me]],
                        label: [{ label: _ }, [{ myData: _ }, [me]]],
                        value: [{ value: _ }, [{ myData: _ }, [me]]],
                        type: "number",
                        validFun: r(1e-20, Infinity),
                        editable: true,
                        pointAbove: [cond,
                            [prev, [me]],
                            o(
                                { on: true, use: { element: [prev, [me]], type: "bottom" } },
                                { on: false, use: { element: [embedding], type: "top" } }
                            )
                        ]
                    },
                    position: {
                        topConstraint: {
                            point1: [{ pointAbove: _ }, [me]],
                            point2: { type: "top" },
                            equals: 10,
                        },
                        left: 20,
                        height: 20,
                        width: 150
                    }
                }
            }
        }
    },

    HorizontallyDraggableSeparator: o(
        {
            "class": o("DraggableEdgeRight"),
            context: {
                initialWidth: 600,
                borderWidth: 2,
                borderColor: "black",
                draggingLine: [{ children: { line: _ } }, [me]],
                hoverOnLine: [{ param: { pointerInArea: _ } }, [{ draggingLine: _ }, [me]]]
            },
            position: {
                top: 0,
                bottom: 0,
                left: 0,
            },
            display: {
                borderRightWidth: [{ borderWidth: _ }, [me]],
                borderRightColor: [{ borderColor: _ }, [me]],
                borderRightStyle: "dashed",
            },
            children: {
                line: {
                    description: {
                        position: {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            width: 10,
                        }
                    }
                }
            }
        },
        {
            qualifier: { hoverOnLine: true },
            context: {
                //borderWidth: 10,
                borderColor: "red"
            }
        }
    ),

    HistogramTypeSelector: {
        "class": o("UniformMatrix"), //"WrapChildren"
        context: {

            // UniformMatrix params
            matrixItems: [{ children: { matrixItems: _ } }, [me]],
            minMatrixSpacing: 3,
            maxMatrixSpacing: 3,
            orthogonalSpacing: 5,

            "^histogramType": o("Embedded"),

            //WrapChildren params:
            wrapMargin: 5

        },

        position: {
            firstItemAtTop: {
                point1: { type: "top" },
                point2: {
                    type: "top",
                    element: [first, [{ matrixItems: _ }, [me]]]
                },
                equals: 0
            }
        },

        children: {
            matrixItems: {
                data: o("Standard", "Stacked", "Embedded"),
                description: {
                    "class": "SimpleSelectableItem",
                    context: {
                        selectedIds: [{ histogramType: _ }, [embedding]],
                        multipleChoice: false,
                        minWidth: 120
                    },
                }
            }
        },

        display: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "black",
        }

    },

    SimpleSelectableItem: o(
        {
            "class": o("UniformMatrixItem", "Selectable"),

            context: {
                elementId: [{ param: { areaSetContent: _ } }, [me]],
                selectedIds: mustBeDefined, // must be writable
                minWidth: 50
            },

            "children.selectableBox.description": {
                position: {
                    "vertical-center": 0,
                    left: 4,
                    width: 15,
                    height: 15
                }
            },

            position: {
                height: 30,
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ minWidth: _ }, [me]],
                },

                maxWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: 80,
                },
            },

            display: {
                text: {
                    value: [{ elementId: _ }, [me]]
                }
            }
        },
        {
            qualifier: { isNotFirstInSubSequence: false },

            position: {
                left: 0
            }
        }
    ),
};

var screenArea = {

    children: {
        mainArea: {
            description: {
                "class": o("AppContext", "ScaleContext"),
                context: {
                    scale: [{ scale: _ }, [{ children: { scaledGrid: _ } }, [me]]],
                    labeledValues: [{ labeledValues: _ }, [areaOfClass, "InputValues"]],
                    type: [{ histogramType: _ }, [{ children: { histogramTypeSelector: _ } }, [me]]],
                    scaleMaxValue: [cond,
                        ["Stacked", [{ type: _ }, [me]]],
                        o(
                            { on: true, use: [sum, [{ value: _ }, [{ labeledValues: _ }, [me]]]] },
                            { on: false, use: [max, [{ value: _ }, [{ labeledValues: _ }, [me]]]] }
                        )
                    ]
                },
                position: {
                    frame: 0
                },
                children: {
                    inputValues: {
                        description: {
                            class: "InputValues",
                            position: {
                                horizontalCenteredWithHistogram: {
                                    point1: { element: [{ children: { multibar: _ } }, [embedding]], type: "horizontal-center" },
                                    point2: { type: "horizontal-center" },
                                    equals: 0,
                                },
                                top: 50,
                                height: 100,
                                width: 150
                            },
                            display: {
                                borderWidth: 1,
                                borderStyle: "dashed",
                            }
                        }
                    },
                    scaledGrid: {
                        description: {
                            "class": o("ScaledGrid"),
                            context: {
                                tickPosition: "bottom",
                                maxValue: [{ scaleMaxValue: _ }, [embedding]]
                            },
                            position: {
                                top: 200,
                                left: 100,
                                height: 30,
                                leftOfSeparator: {
                                    point1: { type: "right" },
                                    point2: { element: [{ children: { separator: _ } }, [embedding]], type: "right" },
                                    equals: 50
                                },
                                minWidth: {
                                    point1: { type: "left" },
                                    point2: { type: "right" },
                                    min: 100,
                                },
                                initialWidth: {
                                    point1: { type: "left" },
                                    point2: { type: "right" },
                                    equals: 500,
                                    priority: -100
                                }
                            }
                        }
                    },
                    multibar: {
                        description: {
                            "class": o("Multibar"),
                            context: {
                                legend: [{ children: { legend: _ } }, [embedding]],
                                labeledValues: [{ labeledValues: _ }, [embedding]],
                                scaledGrid: [{ children: { scaledGrid: _ } }, [embedding]],
                                type: [{ type: _ }, [embedding]],
                                barAreaOffsetFromBottom: 25,
                                barAreaHeightRatio: 0.50,
                                topGrid: false,
                                topGridValues: false,
                                bottomGrid: true,
                                bottomGridValues: true,
                            },
                            position: {
                                height: 100,
                                leftOfScale: {
                                    point1: { type: "left" },
                                    point2: { element: [{ scaledGrid: _ }, [me]], type: "left" },
                                    equals: 30,
                                },
                                rightOfScale: {
                                    point1: { element: [{ scaledGrid: _ }, [me]], type: "right" },
                                    point2: { type: "right" },
                                    equals: 30,
                                },
                                bottomOfScale: {
                                    point1: { element: [{ scaledGrid: _ }, [me]], type: "bottom" },
                                    point2: { type: "top" },
                                    equals: 60,
                                }
                            },
                        }
                    },
                    legend: {
                        description: {
                            "class": o("Legend"),
                            context: {
                                "^colorSpent": "#fc0",
                                "^colorAllocated": "#1f78b4",
                                "^colorPlanned": "#a6cde2",
                                labeledColorsStandard: o(
                                    { label: "planned", color: [{ colorPlanned: _ }, [me]] },
                                    { label: "allocated", color: [{ colorAllocated: _ }, [me]] },
                                    { label: "spent", color: [{ colorSpent: _ }, [me]] }
                                ),
                                labeledColors: [cond,
                                    [{ type: _ }, [embedding]],
                                    o(
                                        { on: "Standard", use: [reverse, [{ labeledColorsStandard: _ }, [me]]] },
                                        { on: "Stacked", use: [{ labeledColorsStandard: _ }, [me]] },
                                        { on: "Embedded", use: [reverse, [{ labeledColorsStandard: _ }, [me]]] }
                                    )
                                ],
                                colorPopUpOrientation: "bottom",
                                multibar: [{ children: { multibar: _ } }, [embedding]]
                            },
                            position: {
                                horizontalCenteredWithHistogram: {
                                    point1: { type: "horizontal-center" },
                                    point2: { element: [{ multibar: _ }, [me]], type: "horizontal-center" },
                                    equals: 0,
                                },
                                bottomOfHistogram: {
                                    point1: { element: [{ multibar: _ }, [me]], type: "bottom" },
                                    point2: { type: "top" },
                                    equals: 10,
                                }
                            },
                        },
                    },
                    histogramTypeSelector: {
                        description: {
                            "class": "HistogramTypeSelector",
                            position: {
                                horizontalCenteredWithLegend: {
                                    point1: { element: [{ children: { legend: _ } }, [embedding]], type: "horizontal-center" },
                                    point2: { type: "horizontal-center" },
                                    equals: 50,
                                },
                                belowLegend: {
                                    point1: { element: [{ children: { legend: _ } }, [embedding]], type: "bottom" },
                                    point2: { type: "top" },
                                    equals: 50,
                                },
                                width: 120,
                                height: 120
                            }
                        }
                    },
                    separator: {
                        description: {
                            "class": "HorizontallyDraggableSeparator",
                        }
                    },
                }
            }
        }
    }
};


