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

/*  This file contains definitions for a hierarchical menu item, which can
    be used as a base for custom classes. In particular the "picked" mechanism
    is not suitable for many applications and probably must be overridden.
*/

var classes = {

    /// Display text format
    HMMenuTextStyle1: {
        fontFamily: "Roboto",
        fontSize: 11,
        fontWeight: 600,
        textAlign: "left",
        whiteSpace: "nowrap"
    },

    /// Display formatting depending on the item being highlighted or not
    HMSelectedMenuText1: o({
        display: {
            text: {
                "class": "HMMenuTextStyle1"
            }
        }
    }, {
        qualifier: {highlight: true},
        display: {
            background: "#707070",
            borderWidth: 2,
            borderColor: "white",
            borderStyle: "none",
            text: {
                color: "#F6F6F6"
            }
        }
    }),

    /// Item, displaying the text and an open/close control (when it has child
    /// items) in two child areas. The open action depends on the value of
    /// allowMultipleItemsOpen.
    HMHierarchicalMenuItem1: o({
        context: {
            /// When true, there is no restriction on the open items. When false,
            /// only one path to the root is open. This is effectuated by the
            /// write handler that opens items, so changing the value won't
            /// affect the currently open list
            allowMultipleItemsOpen: [{allowMultipleItemsOpen: _}, [embedding]],
            /// Override to highlight items
            highlight: false
        },
        display: {
            background: "#F6F6F6"
        },
        children: {
            display: {
                description: {
                    "class": "HMSelectedMenuText1",
                    display: {
                        text: {
                            value: [{text: _}, [embedding]]
                        }
                    },
                    position: {
                        top: 0,
                        left: [plus, [mul, 5, [{level: _}, [embedding]]], 15],
                        right: 0,
                        height: [{itemSize: _}, [myParams, "HierarchicalMenu"]]
                    }
                }
            }
        },
        position: {
            height: [{itemSize: _}, [myParams, "HierarchicalMenu"]]
        }
    }, {
        /// Show simple open/close control when there are children
        /// There's padding around the triangle to make it easier to hit
        qualifier: {hasChildren: true},
        children: {
            openControl: {
                description: {
                    display: {
                        padding: 2,
                        triangle: {
                            color: "#707070"
                        }
                    },
                    position: {
                        top: 2,
                        left: [plus, [mul, 5, [{level: _}, [embedding]]], 2],
                        width: 12,
                        height: 12
                    },
                    write: {
                        /// Stop propagation of the mouse down in this area, as
                        /// it starts dragging
                        onMouseDown: {
                            upon: [{type: "MouseDown"}, [myMessage]],
                            true: {
                                continuePropagation: false
                            }
                        },
                        /// Change the openItems list on a click; the actual 
                        /// value written is determined in variants below
                        onClick: {
                            upon: [{type: "MouseUp", subType: o("Click", "DoubleClick")}, [myMessage]],
                            true: {
                                switchOpen: {
                                    to: [{openItems: _}, [myParams, "HierarchicalMenu"]]
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {

        // There are lower items, control closed
        qualifier: {hasChildren: true, open: false},

        "children.openControl.description": {
            "display.triangle.baseSide": "left"
        }
    }, {

        // There are lower items, open item on click, multiple allowed
        qualifier: {hasChildren: true, open: false, allowMultipleItemsOpen: true},

        "children.openControl.description": {
            // Add item to list of open items
            "write.onClick.true.switchOpen.merge": push([{value: _}, [embedding]])
        }
    }, {

        // There are lower items, open item on click, multiple not allowed
        qualifier: {hasChildren: true, open: false, allowMultipleItemsOpen: false},

        "children.openControl.description": {
            // Replace list of open items with this items and its parents
            "write.onClick.true.switchOpen.merge": atomic(
                o(
                    [{value: _}, [embedding]],
                    [{parents: _}, [embedding]]
                )
            )
        }
    }, {

        // There are lower items, close item on click
        qualifier: {hasChildren: true, open: true},

        "children.openControl.description": {
            "display.triangle.baseSide": "top",
            // Remove item from list of open items
            "write.onClick.true.switchOpen.merge": [
                n([{value: _}, [embedding]]),
                [{openItems: _}, [embedding, [embedding]]]
            ]
        }
    }),

    // Style 2 only replaces the visuals

    /// Display text format
    HMMenuTextStyle2: {
        fontFamily: "Roboto",
        fontSize: 12,
        fontWeight: 300,
        textAlign: "left",
        whiteSpace: "nowrap",
        color: "#808080"
    },

    /// Display formatting depending on the item being highlighted or not
    HMSelectedMenuText2: o({
        display: {
            background: "#BBE4E4",
            borderWidth: 2,
            borderColor: "white",
            borderStyle: "solid",
            paddingLeft: 5,
            text: {
                "class": "HMMenuTextStyle2"
            }
        }
    }, {
        qualifier: {highlight: true},
        display: {
            background: "#FFF865"
        }
    }),

    HMHierarchicalMenuItem2: o({
        "class": "HMHierarchicalMenuItem1",
        display: {
            background: "white"
        },
        children: {
            display: {
                description: {
                    "class": "HMSelectedMenuText2"
                }
            }
        }
    }, {
        qualifier: {hasChildren: true},
        children: {
            openControl: {
                description: {
                    display: {
                        padding: 0,
                        borderRadius: 5,
                        background: "#BBE4E4",
                        text: {
                            "class": "HMMenuTextStyle2",
                            fontSize: 11,
                            textAlign: "center",
                            color: "#808080"
                        }
                    },
                    position: {
                        top: 7
                    }
                }
            }
        }
    }, {
        qualifier: {hasChildren: true, open: false},
        "children.openControl.description": {
            "display.text.value": "+"
        }
    }, {
        qualifier: {hasChildren: true, open: true},
        "children.openControl.description": {
            "display.text.value": "-"
        }
    }),

    // Style 3 is also a cosmetic change on 1

    /// Display text format
    HMMenuTextStyle3: {
        fontFamily: "Roboto",
        fontSize: 16,
        fontWeight: 300,
        textAlign: "left",
        whiteSpace: "nowrap",
        color: "#B0B0B0"
    },

    /// Display formatting depending on the item being highlighted or not
    HMSelectedMenuText3: o({
        display: {
            text: {
                "class": "HMMenuTextStyle3"
            }
        }
    }, {
        qualifier: {highlight: true},
        display: {
            background: "#B0B0B0",
            text: {
                color: "#303030"
            }
        }
    }),

    LeftMidRightSwitch: o({
        qualifier: {position: -1},
        display: {
            background: "#FF3F3F",
            text: {
                fontFamily: "sans-serif",
                fontSize: 9,
                verticalAlign: "top",
                color: "white",
                value: "×"
            }
        },
        position: {
            left: 2
        }
    }, {
        qualifier: {position: 0},
        display: {
            background: "#303030"
        },
        position: {
            "horizontal-center": 0
        }
    }, {
        qualifier: {position: 1},
        display: {
            background: "#16D816",
            text: {
                fontFamily: "sans-serif",
                fontSize: 9,
                verticalAlign: "top",
                color: "white",
                value: "+"
            }
        },
        position: {
            right: 2
        }
    }),

    HMHierarchicalMenuItem3: o({
        "class": "HMHierarchicalMenuItem1",
        display: {
            background: "#505050",
            borderWidth: 1,
            borderColor: "black",
            borderStyle: "solid"
        },
        children: {
            display: {
                description: {
                    "class": "HMSelectedMenuText3",
                    position: {
                        left: [plus, 8, [mul, 3, [{level: _}, [embedding]]]],
                        right: 64
                    }
                }
            },
            includeExcludeControl: {
                description: {
                    context: {
                        "*position": 0
                    },
                    display: {
                        borderRadius: 6,
                        borderStyle: "solid",
                        borderColor: "#B0B0B0",
                        borderWidth: 1,
                        background: "#808080"
                    },
                    position: {
                        height: 12,
                        "vertical-center": 0,
                        right: 24,
                        width: 40
                    },
                    children: {
                        switch: {
                            description: {
                                "class": "LeftMidRightSwitch",
                                context: {
                                    position: [{position: _}, [embedding]]
                                },
                                display: {
                                    borderRadius: 5
                                },
                                position: {
                                    top: 0,
                                    height: 10,
                                    width: 10
                                }
                            }
                        }
                    },
                    write: {
                        /// Stop propagation of the mouse down in this area, as
                        /// it starts dragging
                        onMouseDown: {
                            upon: [{type: "MouseDown"}, [myMessage]],
                            true: {
                                continuePropagation: false
                            }
                        },
                        /// position based on location of click
                        onClick: {
                            upon: [{type: "MouseUp", subType: o("Click")}, [myMessage]],
                            true: {
                                switchPosition: {
                                    to: [{position: _}, [me]],
                                    merge: [
                                        cond, [{relX: _}, [myMessage]], o(
                                            { on: r(0, 13), use: -1 },
                                            { on: r(14, 26), use: 0 },
                                            { on: r(27, 39), use: 1 }
                                        )
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {open: true},
        display: {
            background: "#303030"
        }
    }, {
        qualifier: {hasChildren: true},
        children: {
            openControl: {
                description: {
                    display: {
                        padding: 0
                    },
                    position: {
                        top: 7,
                        left: o(), // remove style
                        width: 12,
                        height: 12,
                        right: 12
                    }
                }
            }
        }
    }, {
        qualifier: {hasChildren: true, open: false},
        "children.openControl.description": {
            display: {
                image: {
                    src: "arrowdown48.svg",
                    size: "200%"
                }
            }
        }
    }, {
        qualifier: {hasChildren: true, open: true},
        "children.openControl.description": {
            display: {
                image: {
                    src: "arrowup48.svg",
                    size: "200%"
                }
            }
        }
    })
};
