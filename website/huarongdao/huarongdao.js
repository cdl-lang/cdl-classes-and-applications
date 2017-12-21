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

// %%include%%: "../../tutorial/examples/18_BasicClasses/reference.js"
// %%classfile%%: "../../tutorial/examples/18_BasicClasses/draggable.js"
// %%classfile%%: "../../tutorial/examples/18_BasicClasses/scrollableDesign.js"
// %%classfile%%: "../../tutorial/examples/25_Datathon2/misc.js"
// %%classfile%%: "../../tutorial/examples/26_Menu/menus.js"

var configurations = o(
    // Basic Hua Rong Dao
    {
        width: 4,
        height: 5,
        inset: 0.01,
        radius: 0.1,
        start: o(
            { width: 2, height: 2, row: 0, column: 1, color: "#CD8B8B", text: "王將" },
            { width: 2, height: 1, row: 2, column: 1, color: "#ADADD8", text: "玉將" },
            { width: 1, height: 2, row: 0, column: 0, color: "#ADADD8", text: "飛車" },
            { width: 1, height: 2, row: 0, column: 3, color: "#ADADD8", text: "龍王" },
            { width: 1, height: 2, row: 2, column: 0, color: "#ADADD8", text: "角行" },
            { width: 1, height: 2, row: 2, column: 3, color: "#ADADD8", text: "龍馬" },
            { width: 1, height: 1, row: 3, column: 1, color: "#ADADD8", text: "桂馬" },
            { width: 1, height: 1, row: 3, column: 2, color: "#ADADD8", text: "香車" },
            { width: 1, height: 1, row: 4, column: 0, color: "#ADADD8", text: "成香" },
            { width: 1, height: 1, row: 4, column: 3, color: "#ADADD8", text: "歩兵" }
        ),
        goal: o(
            { width: 2, height: 2, row: 3, column: 1, color: "#CD8B8B" },
            { width: 2, height: 1, row: 2, column: 2, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 0, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 1, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 2, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 3, color: "#ADADD8" },
            { width: 1, height: 1, row: 2, column: 0, color: "#ADADD8" },
            { width: 1, height: 1, row: 2, column: 1, color: "#ADADD8" },
            { width: 1, height: 1, row: 3, column: 3, color: "#ADADD8" },
            { width: 1, height: 1, row: 4, column: 3, color: "#ADADD8" }
        )
    },
    // Variation 1 from game box
    {
        width: 4,
        height: 5,
        inset: 0.01,
        radius: 0.1,
        start: o(
            { width: 2, height: 2, row: 2, column: 1, color: "#CD8B8B", text: "王將" },
            { width: 2, height: 1, row: 0, column: 1, color: "#ADADD8", text: "玉將" },
            { width: 1, height: 2, row: 0, column: 0, color: "#ADADD8", text: "飛車" },
            { width: 1, height: 2, row: 0, column: 3, color: "#ADADD8", text: "龍王" },
            { width: 1, height: 2, row: 3, column: 0, color: "#ADADD8", text: "角行" },
            { width: 1, height: 2, row: 3, column: 3, color: "#ADADD8", text: "龍馬" },
            { width: 1, height: 1, row: 1, column: 1, color: "#ADADD8", text: "桂馬" },
            { width: 1, height: 1, row: 1, column: 2, color: "#ADADD8", text: "香車" },
            { width: 1, height: 1, row: 4, column: 1, color: "#ADADD8", text: "成香" },
            { width: 1, height: 1, row: 4, column: 2, color: "#ADADD8", text: "歩兵" }
        ),
        goal: o(
            { width: 2, height: 2, row: 2, column: 2, color: "#CD8B8B" },
            { width: 2, height: 1, row: 2, column: 0, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 1, color: "#ADADD8" },
            { width: 1, height: 2, row: 0, column: 2, color: "#ADADD8" },
            { width: 1, height: 2, row: 3, column: 0, color: "#ADADD8" },
            { width: 1, height: 2, row: 3, column: 1, color: "#ADADD8" },
            { width: 1, height: 1, row: 0, column: 0, color: "#ADADD8" },
            { width: 1, height: 1, row: 1, column: 0, color: "#ADADD8" },
            { width: 1, height: 1, row: 4, column: 2, color: "#ADADD8" },
            { width: 1, height: 1, row: 4, column: 3, color: "#ADADD8" }
        )
    },
    // Rush Hour 9
    {
        width: 6,
        height: 6,
        inset: 0.067,
        radius: 0,
        blockSize: 100,
        start: o(
            {width: 2, height: 1, row: 2, column: 0, color: "hsl(0,100%,50%)", direction: "horizontal", text: "X"},

            {width: 3, height: 1, row: 3, column: 1, color: "hsl(45,60%,80%)", direction: "horizontal"},
            {width: 1, height: 3, row: 3, column: 0, color: "hsl(135,60%,80%)", direction: "vertical"},
            {width: 1, height: 3, row: 2, column: 4, color: "hsl(215,60%,80%)", direction: "vertical"},

            {width: 2, height: 1, row: 0, column: 2, color: "hsl(30,60%,80%)", direction: "horizontal"},
            {width: 2, height: 1, row: 0, column: 4, color: "hsl(90,60%,80%)", direction: "horizontal"},
            {width: 2, height: 1, row: 1, column: 4, color: "hsl(150,60%,80%)", direction: "horizontal"},

            {width: 1, height: 2, row: 0, column: 1, color: "hsl(60,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 1, column: 3, color: "hsl(120,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 2, column: 5, color: "hsl(180,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 4, column: 2, color: "hsl(240,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 4, column: 5, color: "hsl(300,60%,80%)", direction: "vertical"}
        )
    },
    // Rush Hour 13
    {
        width: 6,
        height: 6,
        inset: 0.067,
        radius: 0,
        // backgroundTile: "img/shifttile.png",
        blockSize: 100,
        start: o(
            {width: 2, height: 1, row: 0, column: 0, color: "hsl(30,60%,80%)", direction: "horizontal"},
            {width: 2, height: 1, row: 0, column: 2, color: "hsl(60,60%,80%)", direction: "horizontal"},
            {width: 1, height: 2, row: 0, column: 4, color: "hsl(90,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 1, column: 2, color: "hsl(120,60%,80%)", direction: "vertical"},
            {width: 1, height: 3, row: 1, column: 5, color: "hsl(150,60%,80%)", direction: "vertical"},
            {width: 1, height: 2, row: 2, column: 1, color: "hsl(180,60%,80%)", direction: "vertical"},
            {width: 2, height: 1, row: 2, column: 3, color: "hsl(0,100%,50%)", direction: "horizontal", text: "X"},
            {width: 2, height: 1, row: 3, column: 3, color: "hsl(210,60%,80%)", direction: "horizontal"},
            {width: 1, height: 3, row: 3, column: 0, color: "hsl(240,60%,80%)", direction: "vertical"},
            {width: 2, height: 1, row: 4, column: 4, color: "hsl(270,60%,80%)", direction: "horizontal"},
            {width: 1, height: 2, row: 4, column: 3, color: "hsl(300,60%,80%)", direction: "vertical"},
            {width: 2, height: 1, row: 5, column: 1, color: "hsl(330,60%,80%)", direction: "horizontal"},
            {width: 2, height: 1, row: 5, column: 4, color: "hsl(360,60%,80%)", direction: "horizontal"}
        ),
        goal: o(
            {width: 2, height: 1, row: 2, column: 4, color: "#A70016", text: "X"}
        )
    },
    // 15-puzzle
    {
        width: 4,
        height: 4,
        inset: 0.067,
        radius: 0,
        blockSize: 100,
        showTextInPreview: true,
        start: o(
            {width: 1, height: 1, row: 0, column: 0, color: "lightgrey", text: "15"},
            {width: 1, height: 1, row: 0, column: 1, color: "lightgrey", text: "2"},
            {width: 1, height: 1, row: 0, column: 2, color: "lightgrey", text: "1"},
            {width: 1, height: 1, row: 0, column: 3, color: "lightgrey", text: "12"},
            {width: 1, height: 1, row: 1, column: 0, color: "lightgrey", text: "8"},
            {width: 1, height: 1, row: 1, column: 1, color: "lightgrey", text: "5"},
            {width: 1, height: 1, row: 1, column: 2, color: "lightgrey", text: "6"},
            {width: 1, height: 1, row: 1, column: 3, color: "lightgrey", text: "11"},
            {width: 1, height: 1, row: 2, column: 0, color: "lightgrey", text: "4"},
            {width: 1, height: 1, row: 2, column: 1, color: "lightgrey", text: "9"},
            {width: 1, height: 1, row: 2, column: 2, color: "lightgrey", text: "10"},
            {width: 1, height: 1, row: 2, column: 3, color: "lightgrey", text: "7"},
            {width: 1, height: 1, row: 3, column: 0, color: "lightgrey", text: "3"},
            {width: 1, height: 1, row: 3, column: 1, color: "lightgrey", text: "14"},
            {width: 1, height: 1, row: 3, column: 2, color: "lightgrey", text: "13"}
        ),
        goal: o(
            {width: 1, height: 1, row: 0, column: 0, color: "lightgrey", text: "1"},
            {width: 1, height: 1, row: 0, column: 1, color: "lightgrey", text: "2"},
            {width: 1, height: 1, row: 0, column: 2, color: "lightgrey", text: "3"},
            {width: 1, height: 1, row: 0, column: 3, color: "lightgrey", text: "4"},
            {width: 1, height: 1, row: 1, column: 0, color: "lightgrey", text: "5"},
            {width: 1, height: 1, row: 1, column: 1, color: "lightgrey", text: "6"},
            {width: 1, height: 1, row: 1, column: 2, color: "lightgrey", text: "7"},
            {width: 1, height: 1, row: 1, column: 3, color: "lightgrey", text: "8"},
            {width: 1, height: 1, row: 2, column: 0, color: "lightgrey", text: "9"},
            {width: 1, height: 1, row: 2, column: 1, color: "lightgrey", text: "10"},
            {width: 1, height: 1, row: 2, column: 2, color: "lightgrey", text: "11"},
            {width: 1, height: 1, row: 2, column: 3, color: "lightgrey", text: "12"},
            {width: 1, height: 1, row: 3, column: 0, color: "lightgrey", text: "13"},
            {width: 1, height: 1, row: 3, column: 1, color: "lightgrey", text: "14"},
            {width: 1, height: 1, row: 3, column: 2, color: "lightgrey", text: "15"}
        )
    }
);

var classes = {
    App: {
        context: {
            "*configurationIndex": 1,
            configurations: configurations,
            currentConfiguration: [
                pos,
                [{configurationIndex: _}, [me]],
                [{configurations: _}, [me]]
            ],

            nrRows: [{currentConfiguration: {height: _}}, [me]],
            nrColumns: [{currentConfiguration: {width: _}}, [me]]
        },
        children: {
            initial: {
                description: {
                    "class": o(
                        "HuaRongDaoWithLabel",
                        "HighLightOnHover",
                        { name: "FlipButton", value: [{showPopUp: _}, [me]]},
                        { name: "AreaWithPopUpInPositioningPoints", popUpBodyClass: "InitialConfigurationMatrix" }
                    ),
                    context: {
                        blockSize: 20,
                        padding: 3,
                        label: "INITIAL CONFIGURATION",
                        configuration: [
                            {start: _},
                            [{currentConfiguration: _}, [my, "App"]]
                        ],
                        board: [{currentConfiguration: _}, [my, "App"]],
                        horizontalEdge: "left",
                        horizontalEdgePoint: {type: "left", element: [me]},
                        horizontalDistance: -6,
                        verticalEdge: "top",
                        verticalEdgePoint: {type: "top", element: [me]},
                        verticalDistance: -6,
                        partnerArea: [my, "App"]
                    },
                    position: {
                        "class": o(
                            { name: "AlignTopWithSibling", sibling: "game" },
                            { name: "LeftOfSibling", sibling: "game", distance: 24 }
                        )
                    }
                }
            },
            goal: {
                description: {
                    "class": "HuaRongDaoWithLabel",
                    context: {
                        blockSize: 20,
                        label: "GOAL CONFIGURATION",
                        configuration: [
                            {goal: _},
                            [{currentConfiguration: _}, [my, "App"]]
                        ],
                        board: [{currentConfiguration: _}, [my, "App"]]
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "initial", distance: 24 },
                            { name: "HorizontalAlignWithSibling", sibling: "initial" }
                        )
                    }
                }
            },
            game: {
                description: {
                    "class": "HuaRongDao",
                    context: {
                        blockSize: [replaceEmpty, [{board: {blockSize: _}}, [me]], 100],
                        borderWidth: 2,
                        // Initial configuration
                        configuration: [
                            {start: _},
                            [{currentConfiguration: _}, [my, "App"]]
                        ],
                        board: [{currentConfiguration: _}, [my, "App"]]
                    },
                    display: {
                        borderColor: "grey",
                        borderWidth: [{borderWidth: _}, [me]],
                        borderStyle: "solid"
                    },
                    position: {
                        "horizontal-center": 0,
                        "vertical-center": 0
                    },
                    write: {
                        onResetMsg: {
                            upon: [{msg: "reset"}, [myMessage]],
                            true: {
                                setAllBlocksInitialPosition: {
                                    to: [{children: {blocks: {initialPosition: _}}}, [me]],
                                    merge: true
                                },
                                clearAllHistory: {
                                    to: [{children: {blocks: {positionHistory: _}}}, [me]],
                                    merge: o()
                                },
                                clearRedo: {
                                    to: [{children: {blocks: {positionRedo: _}}}, [me]],
                                    merge: o()
                                }
                            }
                        }
                    }
                }
            },
            resetButton: {
                description: {
                    "class": "TextButton",
                    context: {
                        label: "RESET",
                        enabled: true
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "game", distance: 12},
                            { name: "AlignLeftWithSibling", sibling: "game"}
                        )
                    },
                    write: {
                        onClick: {
                            upon: myClick,
                            true: {
                                sendResetMessage: {
                                    to: [message],
                                    merge: {msg: "reset", recipient: [{children: {game: _}}, [embedding]]}
                                }
                            }
                        }
                    }
                }
            },
            undoButton: {
                description: {
                    "class": "TextButton",
                    context: {
                        label: "UNDO",
                        enabled: [{children: {game: {children: {blocks: {positionHistory: _}}}}}, [embedding]]
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "game", distance: 12 },
                            { name: "HorizontalAlignWithSibling", sibling: "game"}
                        )
                    },
                    write: {
                        onClick: {
                            qualifier: {enabled: true},
                            upon: myClick,
                            true: {
                                sendUndoMessage: {
                                    to: [message],
                                    merge: {
                                        msg: "undo",
                                        recipient: [{children: {game: _}}, [embedding]]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            redoButton: {
                description: {
                    "class": "TextButton",
                    context: {
                        label: "REDO",
                        enabled: [{children: {game: {children: {blocks: {positionRedo: _}}}}}, [embedding]]
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "game", distance: 12},
                            { name: "AlignRightWithSibling", sibling: "game"}
                        )
                    },
                    write: {
                        onClick: {
                            qualifier: {enabled: true},
                            upon: myClick,
                            true: {
                                sendRedoMessage: {
                                    to: [message],
                                    merge: {
                                        msg: "redo",
                                        recipient: [{children: {game: _}}, [embedding]]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            historyText: {
                description: {
                    "class": "TextLabel",
                    context: {
                        label: "HISTORY"
                    },
                    position: {
                        "class": o(
                            { name: "AlignTopWithSibling", sibling: "game" },
                            { name: "HorizontalAlignWithSibling", sibling: "history" }
                        )
                    }
                }
            },
            history: {
                description: {
                    "class": "VerticalScrollableWithScrollbarBasicDesign",
                    context: {
                        scrolledData: [
                            {positionHistory: _},
                            [
                                first,
                                [{children: {game: {children: {blocks: _}}}}, [embedding]]
                            ]
                        ],
                        historyLength: [size, [{scrolledData: _}, [me]]],
                        itemSize: 75,
                        itemSpacing: 16,
                        scrollbarWidth: 8,
                        scrollbarEdgeOffset: 0,
                        scrollbarCursorColor: "grey",
                        scrollbarOpacity: 0,
                        scrollbarCursorOpacity: 0.5,
                        scrollbarCursorBorderRadius: 4,
                        wasMoved: [{scrolledDocument: {wasMoved: _}}, [me]],
                        scrollToEnd: [{scrolledDocument: {scrollToEnd: _}}, [me]]
                    },
                    "children.scrollView.description": {
                        "children.scrolledDocument.description": {
                            "children.itemsInView.description": {
                                "class": "HuaRongDaoPreview",
                                context: {
                                    blockSize: 15,
                                    gameBlockWidth: [{children: {game: {blockSize: _}}}, [my, "App"]],
                                    borderWidth: 0,
                                    historyPositionIndex: [{itemIndexInDoc: _}, [me]],
                                    board: [{currentConfiguration: _}, [my, "App"]],
                                    // Data is not AVs describing setup, but the game's block areas
                                    configuration: [{children: {game: {children: {blocks: _}}}}, [my, "App"]]
                                },
                                children: {
                                    blocks: {
                                        description: {
                                            // Override properties based on history position
                                            context: {
                                                historyPositionIndex: [{historyPositionIndex: _}, [embedding]],
                                                historyPosition: [pos,
                                                    [{historyPositionIndex: _}, [me]],
                                                    [{content: {positionHistory: _}}, [me]]
                                                ],
                                                row: [div, [{historyPosition: {top: _}}, [me]], [{gameBlockWidth: _}, [embedding]]],
                                                column: [div, [{historyPosition: {left: _}}, [me]], [{gameBlockWidth: _}, [embedding]]],
                                                showText: [{showText: _}, [embedding]]
                                            },
                                            display: {
                                                qualifier: {showText: true},
                                                text: {
                                                    value: [{content: {content: {text: _}}}, [me]]
                                                }
                                            }
                                        }
                                    }
                                },
                                position: {
                                    left: 4,
                                    right: 8
                                }
                            }
                        }
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "historyText" },
                            { name: "RightOfSibling", sibling: "game", distance: 32 },
                            { name: "AlignBottomWithSibling", sibling: "game" }
                        ),
                        width: [plus, [mul, 15, [{nrColumns: _}, [my, "App"]]], 10]
                    },
                    write: {
                        onHistoryChange: {
                            upon: [changed, [{historyLength: _}, [me]]],
                            true: {
                                setWasMoved: {
                                    to: [{wasMoved: _}, [me]],
                                    merge: false
                                },
                                setScrollToEnd: {
                                    to: [{scrollToEnd: _}, [me]],
                                    merge: true
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    HuaRongDaoBase: o({
        context: {
            blockSize: mustBeDefined,
            borderWidth: 0,
            blocksCanBeMoved: mustBeDefined,
            // When true, the blocks all store their current position
            oneBlockBeingDragged: [{beingDragged: _}, [{children: {blocks: _}}, [me]]],
            configuration: mustBeDefined,
            board: mustBeDefined,
            nrRows: [{board: {height: _}}, [me]],
            nrColumns: [{board: {width: _}}, [me]],
            blockInset: [{board: {inset: _}}, [me]],
            blockRadius: [{board: {radius: _}}, [me]],
            backgroundTile: [{board: {backgroundTile: _}}, [me]]
        },
        children: {
            blocks: {
                data: [{configuration: _}, [me]],
                description: {
                    "class": "Block"
                }
            }
        },
        position: {
            "content-height": [mul, [{nrRows: _}, [me]], [{blockSize: _}, [me]]],
            "content-width": [mul, [{nrColumns: _}, [me]], [{blockSize: _}, [me]]]
        }
    }, {
        qualifier: {backgroundTile: true},
        display: {
            background: {
                image: [{backgroundTile: _}, [me]],
                repeat: o("x", "y")
            }
        }
    }),
    
    HuaRongDao: o({
        "class": "HuaRongDaoBase",
        context: {
            blocksCanBeMoved: true
        }
    }),

    HuaRongDaoPreview: o({
        "class": "HuaRongDaoBase",
        context: {
            blockSize: mustBeDefined,
            blocksCanBeMoved: false,
            showText: [{board: {showTextInPreview: _}}, [me]]
        }
    }, {
        qualifier: {showText: false},
        children: {
            blocks: {
                description: {
                    propagatePointerInArea: "embedding",
                    display: {
                        text: {
                            value: o()
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {showText: true},
        children: {
            blocks: {
                description: {
                    propagatePointerInArea: "embedding",
                    display: {
                        text: {
                            fontSize: 11
                        }
                    }
                }
            }
        }
    }),

    Block: o({
        content: [{param: {areaSetContent: _}}, [me]],
        display: {
            borderColor: "white",
            borderWidth: [max, 1,  [round, [{blockInset: _}, [me]]]],
            borderStyle: "solid",
            borderRadius: [round, [{blockRadius: _}, [me]]],
            text: {
                fontFamily: "sans-serif",
                fontSize: 36,
                fontVariant: "italic",
                color: "white",
                value: [{content: {text: _}}, [me]]
            }
        },
        context: {
            width: [{content: {width: _}}, [me]],
            height: [{content: {height: _}}, [me]],
            row: [{content: {row: _}}, [me]],
            column: [{content: {column: _}}, [me]],
            color: [{content: {color: _}}, [me]],
            image: [{content: {image: _}}, [me]],
            rotate: [{content: {rotate: _}}, [me]],
            blockInset: [mul, [{blockInset: _}, [my, "HuaRongDaoBase"]], [{blockSize: _}, [my, "HuaRongDaoBase"]]],
            blockRadius: [mul, [{blockRadius: _}, [my, "HuaRongDaoBase"]], [{blockSize: _}, [my, "HuaRongDaoBase"]]],
            topOffset: [offset, {type: "top", element: [embedding], content: true}, {type: "top"}],
            bottomOffset: [plus, [{topOffset: _}, [me]], [mul, [{height: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]]],
            rightOffset: [plus, [{leftOffset: _}, [me]], [mul, [{width: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]]],
            leftOffset: [offset, {type: "left", element: [embedding], content: true}, {type: "left"}],
            oneBlockBeingDragged: [{oneBlockBeingDragged: _}, [embedding]],
            currentPosition: {
                top: [{topOffset: _}, [me]],
                left: [{leftOffset: _}, [me]]
            },
            canBeMoved: [{blocksCanBeMoved: _}, [embedding]],
            initialPositionOrCannotBeMoved: [or,
                [{initialPosition: _}, [me]],
                [not, [{canBeMoved: _}, [me]]]
            ],
            initialPositionOrCannotBeMovedHorizontally: [or,
                [{initialPosition: _}, [me]],
                [not, [{canBeMovedHorizontally: _}, [me]]]
            ],
            initialPositionOrCannotBeMovedVertically: [or,
                [{initialPosition: _}, [me]],
                [not, [{canBeMovedVertically: _}, [me]]]
            ]
        },
        position: {
            height: [mul, [{height: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]],
            width: [mul, [{width: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]]
        }
    }, {
        qualifier: {color: true},
        display: {
            background: [{color: _}, [me]]
        }
    }, {
        qualifier: {image: true},
        display: {
            image: {
                src: [{image: _}, [me]],
                size: "100%"
            },
            transform: {
                rotate: [{rotate: _}, [me]]
            }
        }
    }, {
        qualifier: {canBeMoved: true},
        "class": o("Draggable", "StorePositionInHistory"),
        context: {
            "*initialPosition": true,
            "*positionHistory": o(),
            "*positionRedo": o(),
            "*temporaryPosition": false,
            direction: [{content: {direction: _}}, [me]],
            verticallyDraggable: [notEqual, [{direction: _}, [me]], "horizontal"],
            horizontallyDraggable: [notEqual, [{direction: _}, [me]], "vertical"],
            canBeMovedHorizontally: [and,
                [{canBeMoved: _}, [me]],
                [{horizontallyDraggable: _}, [me]]
            ],
            canBeMovedVertically: [and,
                [{canBeMoved: _}, [me]],
                [{verticallyDraggable: _}, [me]]
            ]
        },
        children: {
            positioningConstraintGenerators: {
                data: [nextPlus, [{children: {blocks: _}}, [embedding]], [me]],
                description: {
                    context: {
                        sibling: [{param: {areaSetContent: _}}, [me]]
                    },
                    position: {
                        orAboveSiblings: {
                            point1: { type: "bottom", element: [embedding] },
                            point2: { type: "top", element: [{sibling: _}, [me]] },
                            min: 0,
                            orGroups: { label: "or", element: [me] },
                            priority: -1
                        },
                        orBelowSiblings: {
                            point1: { type: "bottom", element: [{sibling: _}, [me]] },
                            point2: { type: "top", element: [embedding] },
                            min: 0,
                            orGroups: { label: "or", element: [me] },
                            priority: -1
                        },
                        orLeftOfSiblings: {
                            point1: { type: "right", element: [embedding] },
                            point2: { type: "left", element: [{sibling: _}, [me]] },
                            min: 0,
                            orGroups: { label: "or", element: [me] },
                            priority: -1
                        },
                        orRightSiblings: {
                            point1: { type: "right", element: [{sibling: _}, [me]] },
                            point2: { type: "left", element: [embedding] },
                            min: 0,
                            orGroups: { label: "or", element: [me] },
                            priority: -1
                        }
                    }
                }
            }
        },
        write: {
            onInitialPosition: {
                upon: [{initialPosition: _}, [me]],
                true: {
                    doSomething: {
                        to: [{initialPosition: _}, [me]],
                        merge: false
                    }
                }
            },
            onTemporaryPosition: {
                upon: [{temporaryPosition: _}, [me]],
                true: {
                    doSomething: {
                        to: [{temporaryPosition: _}, [me]],
                        merge: false
                    }
                }
            },
            onUndo: {
                upon: [{msg: "undo", recipient: [embedding]}, [message]],
                true: {
                    writePreviousPosition: {
                        to: [{temporaryPosition: _}, [me]],
                        merge: [last, [{positionHistory: _}, [me]]]
                    },
                    storeRedo: {
                        to: [{positionRedo: _}, [me]],
                        merge: push([{currentPosition: _}, [me]])
                    },
                    popPositionHistory: {
                        to: [{positionHistory: _}, [me]],
                        merge: [pos, Rco(0, -1), [{positionHistory: _}, [me]]]
                    }
                }
            },
            onRedo: {
                upon: [{msg: "redo", recipient: [embedding]}, [message]],
                true: {
                    writeRedoPosition: {
                        to: [{temporaryPosition: _}, [me]],
                        merge: [last, [{positionRedo: _}, [me]]]
                    },
                    storeUndo: {
                        to: [{positionHistory: _}, [me]],
                        merge: push([{currentPosition: _}, [me]])
                    },
                    popPositionRedo: {
                        to: [{positionRedo: _}, [me]],
                        merge: [pos, Rco(0, -1), [{positionRedo: _}, [me]]]
                    }
                }
            },
            onMouseUp: {
                upon: mouseUp,
                true: {
                    enableTempPos: {
                        to: [{temporaryPosition: _}, [me]],
                        merge: {
                            top: [mul,
                                [round,
                                    [div,
                                        [offset, {type: "top", element: [embedding], content: true}, {type: "top"}],
                                        [{blockSize: _}, [my, "HuaRongDaoBase"]]
                                    ]
                                ],
                                [{blockSize: _}, [my, "HuaRongDaoBase"]]
                            ],
                            left: [mul,
                                [round,
                                    [div,
                                        [offset, {type: "left", element: [embedding], content: true}, {type: "left"}],
                                        [{blockSize: _}, [my, "HuaRongDaoBase"]]
                                    ]
                                ],
                                [{blockSize: _}, [my, "HuaRongDaoBase"]]
                            ]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {canBeMovedHorizontally: true},
        position: {
            rightOfEmbeddingLeft: {
                point1: { type: "left", element: [embedding], content: true },
                point2: { type: "left" },
                min: 0
            },
            leftOfEmbeddingRight: {
                point1: { type: "right" },
                point2: { type: "right", element: [embedding], content: true },
                min: 0
            }
        }
    }, {
        qualifier: {canBeMovedVertically: true},
        position: {
            insideEmbeddingTop: {
                point1: { type: "top", element: [embedding], content: true },
                point2: { type: "top" },
                min: 0
            },
            aboveEmbeddingBottom: {
                point1: { type: "bottom" },
                point2: { type: "bottom", element: [embedding], content: true },
                min: 0
            }
        }
    }, {
        qualifier: {initialPositionOrCannotBeMovedHorizontally: true},
        position: {
            initialColumnPosition: {
                point1: { type: "left", element: [embedding], content: true },
                point2: { type: "left" },
                equals: [mul, [{column: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]]
            }
        }
    }, {
        qualifier: {initialPositionOrCannotBeMovedVertically: true},
        position: {
            initialRowPosition: {
                point1: { type: "top", element: [embedding], content: true },
                point2: { type: "top" },
                equals: [mul, [{row: _}, [me]], [{blockSize: _}, [my, "HuaRongDaoBase"]]]
            }
        }
    }, {
        qualifier: {canBeMovedHorizontally: true, temporaryPosition: true},
        position: {
            temporaryColumnPosition: {
                point1: { type: "left", element: [embedding], content: true },
                point2: { type: "left" },
                equals: [{temporaryPosition: {left: _}}, [me]]
            }
        }
    }, {
        qualifier: {canBeMovedVertically: true, temporaryPosition: true},
        position: {
            temporaryRowPosition: {
                point1: { type: "top", element: [embedding], content: true },
                point2: { type: "top" },
                equals: [{temporaryPosition: {top: _}}, [me]]
            }
        }
    }, {
        qualifier: {canBeMovedHorizontally: true, initialPosition: false, temporaryPosition: false},
        position: {
            stabilityColumnPosition: {
                point1: { type: "left", element: [embedding] },
                point2: { type: "left" },
                stability: true,
                priority: dragPriorities.wrapPriority
            }
        }
    }, {
        qualifier: {canBeMovedVertically: true, initialPosition: false, temporaryPosition: false},
        position: {
            stabilityRowPosition: {
                point1: { type: "top", element: [embedding] },
                point2: { type: "top" },
                stability: true,
                priority: dragPriorities.wrapPriority
            }
        }
    }, {
        qualifier: {canBeMoved: true, beingDragged: true, initialPosition: false},
        position: {
            "stabilityRowPosition.priority": dragPriorities.dragPriority,
            "stabilityColumnPosition.priority": dragPriorities.dragPriority
        }
    }, {
        qualifier: {canBeMoved: true, oneBlockBeingDragged: false},
        display: {
            transitions: {
                top: 0.1,
                left: 0.1
            }
        }
    }),

    StorePositionInHistory: {
        write: {
            onStorePositionInHistory: {
                upon: [{oneBlockBeingDragged: _}, [me]],
                true: {
                    storePosition: {
                        to: [{positionHistory: _}, [me]],
                        merge: push([{currentPosition: _}, [me]])
                    },
                    clearRedo: {
                        to: [{positionRedo: _}, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    TextLabel: {
        context: {
            label: mustBeDefined,
            displayWidth: [displayWidth]
        },
        display: {
            text: {
                fontFamily: "Roboto",
                fontWeight: 100,
                color: "grey",
                fontSize: 14,
                value: [{label: _}, [me]]
            }
        },
        position: {
            width: [plus, [{displayWidth: _}, [me]], 20],
            height: 20
        }
    },

    TextButton: o({
        "class": "TextLabel",
        context: {
            enabled: mustBeDefined
        }
    }, {
        qualifier: {selected: true},
        display: {
            paddingLeft: 1,
            paddingTop: 1,
            text: {
                fontSize: 13
            }
        }
    }, {
        qualifier: {enabled: true},
        "class": "Clickable",
        display: {
            text: {
                textDecoration: [cond, [{param: {pointerInArea: _}}, [me]],
                    {on: true, use: "underline"}
                ],
                color: "black"
            }
        }
    }),

    HuaRongDaoWithLabel: {
        context: {
            label: mustBeDefined,
            blockSize: mustBeDefined,
            configuration: mustBeDefined,
            board: mustBeDefined,
            padding: 0
        },
        children: {
            label: {
                description: {
                    "class": "TextLabel",
                    context: {
                        label: [{label: _}, [embedding]]
                    },
                    position: {
                        top: 0,
                        left: 0,
                        right: 0,
                        width: o()
                    }
                }
            },
            configuration: {
                description: {
                    "class": "HuaRongDaoPreview",
                    context: {
                        blockSize: [{blockSize: _}, [embedding]],
                        configuration: [{configuration: _}, [embedding]],
                        board: [{board: _}, [embedding]]
                    },
                    position: {
                        "class": o(
                            { name: "BelowSibling", sibling: "label" },
                            { name: "HorizontalAlignWithSibling", sibling: "label" }
                        )
                    }
                }
            }
        },
        position: {
            width: [plus,
                [max,
                    [mul, [{blockSize: _}, [me]], [{nrColumns: _}, [my, "App"]]],
                    [{children: {label: {displayWidth: _}}}, [me ]]
                ],
                [mul, [{padding: _}, [me]], 2]
            ],
            height: [plus,
                [plus, [mul, [{blockSize: _}, [me]], [{nrRows: _}, [my, "App"]]], 20],
                [mul, [{padding: _}, [me]], 2]
            ]
        }
    },

    HighLightOnHover: o({
        context: {
            hover: [{param: {pointerInArea: _}}, [me]]
        }
    }, {
        qualifier: {hover: true},
        display: {
            boxShadow: {
                color: "grey",
                horizontal: 0,
                vertical: 0,
                blurRadius: 3
            }
        }
    }),

    InitialConfigurationMatrix: {
        children: {
            matrix: {
                description: {
                    "class": "FixedMatrix",
                    context: {
                        matrixData: [{configurations: _}, [my, "App"]],
                        nrColumns: 2,
                        horizontalSpacing: 20,
                        verticalSpacing: 20,
                        cellHeight: 100
                    },
                    display: {
                        background: "white",
                        boxShadow: {
                            color: "grey",
                            horizontal: 0,
                            vertical: 0,
                            blurRadius: 3
                        }
                    },
                    "children.cells.description": {
                        "class": o("HuaRongDaoPreview", "HighLightOnHover", "WriteConfigOnClick"),
                        context: {
                            blockSize: 20,
                            configuration: [{param: {areaSetContent: {start: _}}}, [me]],
                            board: [{param: {areaSetContent: _}}, [me]]
                        }
                    },
                    position: {
                        frame: 5
                    },
                    write: {
                        onClick: {
                            upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                            true: {
                                closePopUp: {
                                    to: [{showPopUp: _}, [expressionOf, [embedding, [embedding]]]],
                                    merge: [{param: {areaSetAttr: _}}, [me]]
                                }
                            }
                        }
                    }
                }
            }
        },
        position: {
            height: 440,
            width: 580
        }
    },

    WriteConfigOnClick: {
        write: {
            onClick: {
                upon: [and,
                    [notEqual,
                        [{configurationIndex: _}, [my, "App"]],
                        [{param: {areaSetAttr: _}}, [me]]
                    ],
                    [{type: "MouseUp", subType: "Click"}, [myMessage]]
                ],
                true: {
                    continuePropagation: true,
                    doChangeConfig: {
                        to: [{configurationIndex: _}, [my, "App"]],
                        merge: [{param: {areaSetAttr: _}}, [me]]
                    },
                    reset: {
                        to: [message],
                        merge: {msg: "reset", recipient: [{children: {game: _}}, [my, "App"]]}
                    }
                }
            }
        }
    }
}

var screenArea = {
    children: {
        app: {
            description: {
                "class": "App",
                position: {
                    frame: 0
                }
            }
        }
    }
};
