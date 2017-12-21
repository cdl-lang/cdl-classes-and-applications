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

// %%classfile%%: "../26_Menu/menus.js"
// %%classfile%%: "../18_BasicClasses/matrixLayout.js"

var bgPalette = o(
    "#faed65", "#9eaf64", "#c9d2be", "#f6c794", "#efd584", "#e1bdca", "#c3b6d8", "#a6cde2",
    "#fc0", "#33391e", "#7d9165", "#db7e24", "#b69127", "#b35575", "#71559e", "#1f78b4"
);

var fgPalette = o(
    "#555555", "#555555", "#555555", "#222222", "#222222", "#222222", "#222222", "#222222",
    "#555555", "#cccccc", "#555555", "#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc"
);

var getFgColorForBgColor = [defun,
    o("color"),
    [using,
        "index",
        [index, bgPalette, "color"],
        // end of using vars
        [
            first,
            o(
                [pos, "index", fgPalette],
                "black"
            )
        ]
    ]
];

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ColorChangeableContext: {
        context: {
            selectedColor: mustBeDefined, // writable reference
            margin: mustBeDefined,
            colorBoxSize: mustBeDefined,
            matrixSpacing: mustBeDefined,
            matrixWidth: mustBeDefined,
            popUpOrientation: mustBeDefined
        }
    },

    ColorChangeablePopup: o(
        {   // default
            "class": "AreaWithPopUpAlignedToSide",
            context: {
                partnerArea: [myContext, "App"]
            },
            "children.popup.description": {
                "children.body.description": {
                    "class": "ColorGrid"
                }
            },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        showPopUp: {
                            to: [{ showPopUp: _ }, [me]],
                            merge: [not, [{ showPopUp: _ }, [me]]]
                        }
                    }
                }
            },
        }
    ),

    ColorGrid: {
        children: {
            matrix: {
                description: {
                    "class": "UniformMatrix",
                    context: {
                        orthogonalSpacing: 5,
                        matrixItems: [{ children: { matrixItems: _ } }, [me]],
                        minMatrixSpacing: [{ matrixSpacing: _ }, [myContext, "ColorChangeable"]]
                    },
                    children: {
                        matrixItems: {
                            data: bgPalette,
                            description: {
                                "class": "ColorChangableTableCell",
                            }
                        }
                    },
                    position: {
                        frame: [{ margin: _ }, [myContext, "ColorChangeable"]],
                        width: [{ matrixWidth: _ }, [myContext, "ColorChangeable"]],
                        topAlignedWithFirstItem: {
                            point1: { element: [first, [{ matrixItems: _ }, [me]]], type: "top" },
                            point2: { type: "top" },
                            equals: 0,
                        },
                        bottomAlignedWithLastItem: {
                            point1: { element: [last, [{ matrixItems: _ }, [me]]], type: "bottom" },
                            point2: { type: "bottom" },
                            equals: 0,
                        },
                    }
                }
            }
        },
        display: {
            background: "white",
            borderWidth: 1,
            borderStyle: "solid",
        }
    },

    ColorChangableTableCell: o(
        {
            // default
            "class": "UniformMatrixItem",
            context: {
                color: [{ param: { areaSetContent: _ } }, [me]],
                borderWidth: 1,
                selectedColor: [{ selectedColor: _ }, [myContext, "ColorChangeable"]], // should be a writable ref
                amISelected: [[{ selectedColor: _ }, [me]], [{ color: _ }, [me]]]
            },
            position: {                
                width: [{ colorBoxSize: _ }, [myContext, "ColorChangeable"]],
                height: [{ colorBoxSize: _ }, [myContext, "ColorChangeable"]]
            },
            write: {
                onColorChangeClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        writeSelectedColor: {
                            to: [{ selectedColor: _ }, [me]],
                            merge: [{ color: _ }, [me]]
                        },
                    }
                }
            },
            display: {
                background: [{ color: _ }, [me]],
            }
        },
        {
            qualifier: { amISelected: false },
            display: {
                borderRadius: [div, [{ colorBoxSize: _ }, [myContext, "ColorChangeable"]], 2],
            }
        }/*,
        {
            qualifier: { amISelected: true },
            
        }*/
    ),


}