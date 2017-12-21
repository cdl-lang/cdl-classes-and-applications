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

var classes = {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrixView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^expansionAxis": "vertical",
                "^nonExpansionAxisFixed": true
            }
        },
        { // default
            "class": o("Border", "MatrixView"),
            context: {
                nr_icons: [arg, "N", 30],
                initial_nr_columns: [arg, "Nc", [floor, [sqrt, [{ nr_icons: _ }, [me]]]]],
                initial_nr_rows: [ceil, [div, [{ nr_icons: _ }, [me]], [{ initial_nr_columns: _ }, [me]]]],
                "^icons": [sequence, r(0, [{ nr_icons: _ }, [me]])],
                cell_width: 40,
                cell_height: 40,
                horizontal_spacing: 8,
                vertical_spacing: 8,
                /*scrollerDefaultColor: "white",
                scrollerOnHoverColor: "white",
                scrollerOnDraggedColor: "white",
                scrollbarBorderColor: "transparent"*/
            },
            children: {
                matrix: {
                    description: {
                        "class": "TestMatrix"
                    }
                }
            },
            position: {
                top: 10,
                left: 10
            }
        },
        {
            qualifier: {
                expansionAxis: "horizontal",
                resizeHandleNeeded: true
            },
            children: {
                horizontalResizeHandle: {
                    description: {
                        "class": "TestMatrixHorizontalResizeHandle"
                    }
                }
            }
        },
        {
            qualifier: {
                expansionAxis: "horizontal",
                nonExpansionAxisFixed: true
            },
            position: {
                testMatrixViewHeight: {
                    pair1: {
                        point1: { element: [embedding], type: "top" },
                        point2: { element: [embedding], type: "bottom" }
                    },
                    pair2: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    ratio: 0.3
                }
            },
        },
        {
            qualifier: {
                expansionAxis: "vertical",
                resizeHandleNeeded: true
            },
            children: {
                verticalResizeHandle: {
                    description: {
                        "class": "TestMatrixVerticalResizeHandle"
                    }
                }
            }
        },
        {
            qualifier: {
                expansionAxis: "vertical",
                nonExpansionAxisFixed: true
            },
            position: {
                testMatrixViewWidth: {
                    pair1: {
                        point1: { element: [embedding], type: "left" },
                        point2: { element: [embedding], type: "right" }
                    },
                    pair2: {
                        point1: { type: "left" },
                        point2: { type: "right" }
                    },
                    ratio: 0.3
                }
            }
        },
        {
            qualifier: {
                expansionAxis: "horizontal",
                nonExpansionAxisFixed: true
            },
            context: {
                fixed_height: true
            }
        },
        {
            qualifier: {
                expansionAxis: "vertical",
                nonExpansionAxisFixed: true
            },
            context: {
                fixed_width: true
            }
        }
    ),


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrix: o(
        { // variant-controller
            qualifier: "!",
            context: {
                nonExpansionAxisFixed: [{ nonExpansionAxisFixed: _ }, [embedding]]
            }
        },
        { // default
            "class": "Matrix",
            context: {
                // Matrix params
                all_data: [{ icons: _ }, [embedding]],
                cell_data: [filter, [defun, "x", [equal, [mod, "x", 2], 1]], [{ all_data: _ }, [me]]],
                myMatrixCellUniqueIDs: [{ cell_data: _ }, [me]],

                cell_width: [{ cell_width: _ }, [embedding]],
                cell_height: [{ cell_height: _ }, [embedding]],
                horizontal_spacing: [{ horizontal_spacing: _ }, [embedding]],
                vertical_spacing: [{ vertical_spacing: _ }, [embedding]],
                "^orderByRow": [{ defaultOrderByRow: _ }, [me]]
            },
            display: {
                background: "#0E506C"
            },
            children: {
                cells: {
                    data: [identify, _, [{ cell_data: _ }, [me]]],
                    description: {
                        "class": "TestMatrixCell"
                    }
                }
            }
        },
        {
            qualifier: { expansion: "vertical" },
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { expansion: "horizontal" },
            position: {
                top: 0,
                bottom: 0
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrixCell: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "MatrixCell"),
            context: {
                myMatrix: [embedding],
                displayText: [{ param: { areaSetContent: _ } }, [me]]
            },
            display: {
                text: {
                    fontFamily: "sans-serif",
                    fontSize: 18,
                    color: "white"
                }
            }
        },
        {
            qualifier: { tmd: false },
            display: {
                background: "#2061E8",
                transitions: {
                    top: 0.25,
                    left: 0.25
                },
                text: {
                    fontWeight: 300
                }
            }
        },
        {
            qualifier: { tmd: true },
            display: {
                background: "#BCCCF8",
                opacity: 0.9,
                text: {
                    fontWeight: 700
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 1. positioning
    // 2. display
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResizeHandle: {
        context: {
            myMatrix: [areaOfClass, "TestMatrix"], // MatrixResizeHandle param, required by sibling class
            length: 40,
            girth: 7
        },
        display: {
            background: "#dddddd",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "red"
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrixHorizontalResizeHandle: {
        "class": o("TestResizeHandle", "MatrixHorizontalResizeHandle"),
        position: {
            height: [{ length: _ }, [me]],
            width: [{ girth: _ }, [me]],
            "vertical-center": 0,
            right: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. positioning
    // 2. display
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrixVerticalResizeHandle: {
        "class": o("TestResizeHandle", "MatrixVerticalResizeHandle"),
        position: {
            height: [{ girth: _ }, [me]],
            width: [{ length: _ }, [me]],
            "horizontal-center": 0,
            bottom: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMatrixControl: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "Border"),
        position: {
            right: 10,
            height: 20,
            width: 200
        },
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestOrderByRowControl: {
        "class": "TestMatrixControl",
        context: {
            orderByRow: [{ orderByRow: _ }, [areaOfClass, "TestMatrix"]],
            displayText: [cond,
                [{ orderByRow: _ }, [me]],
                o(
                    { on: true, use: "Order by Row" },
                    { on: false, use: "Order by Column" }
                )
            ],
            expansionAxis: [{ expansionAxis: _ }, [areaOfClass, "TestMatrixView"]]
        },
        position: {
            top: 10
        },
        write: {
            onTestOrderByRowControlClick: {
                "class": "OnMouseClick",
                true: {
                    toggle: {
                        to: [{ orderByRow: _ }, [me]],
                        merge: [not, [{ orderByRow: _ }, [me]]]
                    }
                }
            },
            onTestOrderByRowControlExpansionAxisChange: {
                upon: [changed, [{ expansionAxis: _ }, [me]]],
                true: {
                    setOrderByRow: {
                        to: [{ orderByRow: _ }, [me]],
                        merge: [cond,
                            [{ expansionAxis: _ }, [me]],
                            o({ on: "vertical", use: true },
                                { on: "horizontal", use: false }
                            )
                        ]
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpansionAxisControl: {
        "class": "TestMatrixControl",
        context: {
            expansionAxis: [{ expansionAxis: _ }, [areaOfClass, "TestMatrixView"]],
            displayText: [cond,
                [{ expansionAxis: _ }, [me]],
                o(
                    { on: "horizontal", use: "Expand Horizontally" },
                    { on: "vertical", use: "Expand Vertically" }
                )
            ]
        },
        position: {
            top: 40
        },
        write: {
            onTestExpansionAxisControlClick: {
                "class": "OnMouseClick",
                true: {
                    toggle: {
                        to: [{ expansionAxis: _ }, [me]],
                        merge: [cond,
                            [{ expansionAxis: _ }, [me]],
                            o({ on: "vertical", use: "horizontal" },
                                { on: "horizontal", use: "vertical" })
                        ]
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestNonExpansionAxisControl: {
        "class": "TestMatrixControl",
        context: {
            nonExpansionAxisFixed: [{ nonExpansionAxisFixed: _ }, [areaOfClass, "TestMatrixView"]],
            displayText: [cond,
                [{ nonExpansionAxisFixed: _ }, [me]],
                o(
                    { on: true, use: "Non-Expansion Axis Fixed" },
                    { on: false, use: "Non-Expansion Axis Wraps" }
                )
            ]
        },
        position: {
            top: 70
        },
        write: {
            onTestNonExpansionAxisControlClick: {
                "class": "OnMouseClick",
                true: {
                    toggle: {
                        to: [{ nonExpansionAxisFixed: _ }, [me]],
                        merge: [not, [{ nonExpansionAxisFixed: _ }, [me]]]
                    }
                }
            }
        }
    }
};

var screenArea = {
    "class": "TestApp",
    children: {
        matrixView: {
            description: {
                "class": "TestMatrixView"
            }
        },
        orderByRowControl: {
            description: {
                "class": "TestOrderByRowControl"
            }
        },
        expansionAxisControl: {
            description: {
                "class": "TestExpansionAxisControl"
            }
        },
        nonExpansionAxisControl: {
            description: {
                "class": "TestNonExpansionAxisControl"
            }
        },
        show_actual_content: {
            description: {
                display: {
                    text: {
                        value: [concatStr,
                            o(
                                [debugNodeToStr, [{ icons: _ }, [areaOfClass, "TestMatrixView"]]]
                                /*,"\nactual_nr_columns: ",
                                [{ actual_nr_columns:_ }, [areaOfClass, "Matrix"]],
                                "\nactual_nr_rows: ",
                                [{ actual_nr_rows:_ }, [areaOfClass, "Matrix"]],
                                "\nsufficient_nr_columns: ",
                                [{ sufficient_nr_columns:_ }, [areaOfClass, "Matrix"]],
                                "\nsufficient_nr_rows: ",
                                [{ sufficient_nr_rows:_ }, [areaOfClass, "Matrix"]],
                                "\nnr_columns_in_view: ",
                                [{ nr_columns_in_view:_ }, [areaOfClass, "Matrix"]],
                                "\nnr_rows_in_view: ",
                                [{ nr_rows_in_view:_ }, [areaOfClass, "Matrix"]]*/
                            )]
                    }
                },
                position: {
                    height: 150,
                    left: 0,
                    right: 0,
                    bottom: 0
                }
            }
        }
    }
};
