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

// %%classfile%%: "misc.js"
// %%classfile%%: "../18_BasicClasses/scrollable.js"
// %%classfile%%: "../18_BasicClasses/scrollToAnchor.js"
// %%classfile%%: "../18_BasicClasses/scrollbar.js"

var classes = {

    VisualStyleContext: o({
        context: {
            "^visualStyleIndex": 1
        }
    }, {
        qualifier: { visualStyleIndex: 0 },
        context: {
            visualStyle: {

                bgColor: "#404040",
                headerColor: "#a0a0a0",
                lightBgColor:  "#a0a0a0",
                darkBgColor: "#202020",
                textHighlightColor: "404080",
                itemSelectedColor: "#808080",
                itemBackgroundColor: "#d0d0d0",
                appLeftMargin: 0,
                appRightMargin: 0,
                appTopMargin: 20,
                appBgColor: "white",
                fontFamily: 'Roboto,sans-serif',
                fontSize: 24,
                verticalSeparator: 305,
                verticalSeparatorMargin: 5,

                controlBar: {
                    bgColor: "#fbfbfb",
                    topMargin: 0
                },
                selectionGroup: {
                    closedBgColor: "#202020",
                    openBgColor: "#404040",
                    color: "white",
                    fontSize: 20,
                    fontWeight: 500,
                    textTransform: "none",
                    height: 67,
                    hoverColor: false,
                    headerHeight: 100,
                    menuItemFontWeight: 700,
                    menuItemFontSize: 20
                },
                sortControl: {
                    headerHeight: 100
                },
                result: {
                    bgColor: "white",
                    color: "#303030",
                    fontSize: 14,
                    fontWeight: 500,
                    height: 45,
                    hoverColor: false,
                    selectColor: "#808080",
                    topOffset: 2,
                    secondOffset: 36
                },
                tabHeader: {
                    fontSize: 20,
                    fontWeight: 600,
                    fontColor: "#303030",
                    bgColor: "#a0a0a0",
                    highlightFontWeight: 600,
                    highlightFontColor: "404080"
                }
            }
        }
    }, {
        qualifier: { visualStyleIndex: 1 },
        context: {
            visualStyle: {

                bgColor: "#404040",
                headerColor: "#2c4b66",
                lightBgColor:  "#a0a0a0",
                darkBgColor: "#202020",
                textHighlightColor: "404080",
                itemSelectedColor: "#808080",
                itemBackgroundColor: "#d0d0d0",
                appLeftMargin: 40,
                appRightMargin: 40,
                appTopMargin: 60,
                appBgColor: "#f4f4f4",
                fontFamily: '%%font:("Open Sans",https://fonts.googleapis.com/css?family=Open+Sans:300,400,700)%%,Arial,Sans-Serif',
                fontSize: 13,
                verticalSeparator: 300,
                verticalSeparatorMargin: 20,

                controlBar: {
                    bgColor: "#fbfbfb",
                    topMargin: 20
                },
                selectionGroup: {
                    closedBgColor: "white",
                    openBgColor: "white",
                    color: "#303030",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    height: 45,
                    hoverColor: "#f0f0f0",
                    headerHeight: 45,
                    menuItemFontWeight: 400,
                    menuItemFontSize: 13
                },
                sortControl: {
                    headerHeight: 45
                },
                result: {
                    bgColor: o("#ffffff", "#f8f8f8"),
                    color: "#303030",
                    fontSize: 14,
                    fontWeight: 700,
                    height: 58,
                    hoverColor: "#f0f0f0",
                    selectColor: "#b0b0b0",
                    topOffset: 0,
                    secondOffset: 38
                },
                tabHeader: {
                    fontSize: 13,
                    fontWeight: 400,
                    fontColor: "white",
                    bgColor: "#2c4b66",
                    highlightFontWeight: 700,
                    highlightFontColor: "white"
                }
            }
        }
    }),

    HeaderText: {
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: [{visualStyle: {fontSize: _}}, [myContext, "VisualStyle"]],
        fontWeight: 300,
        color: "white"
    },

    ChoiceMenuText: {
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: [{visualStyle: {selectionGroup: {fontSize: _}}}, [myContext, "VisualStyle"]],
        fontWeight: [{visualStyle: {selectionGroup: {fontWeight: _}}}, [myContext, "VisualStyle"]],
        color: [{visualStyle: {selectionGroup: {color: _}}}, [myContext, "VisualStyle"]],
        textTransform: [{visualStyle: {selectionGroup: {textTransform: _}}}, [myContext, "VisualStyle"]],
        textAlign: "left",
        verticalAlign: "bottom"
    },

    TabHeaderStyle: o({
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: [{visualStyle: {tabHeader: {fontSize: _}}}, [myContext, "VisualStyle"]],
        fontWeight: [{visualStyle: {tabHeader: {fontWeight: _}}}, [myContext, "VisualStyle"]],
        color: [{visualStyle: {tabHeader: {fontColor: _}}}, [myContext, "VisualStyle"]]
    }, {
        qualifier: {selected: true},
        fontWeight: [{visualStyle: {tabHeader: {highlightFontWeight: _}}}, [myContext, "VisualStyle"]],
        color: [{visualStyle: {tabHeader: {highlightFontColor: _}}}, [myContext, "VisualStyle"]]
    }),

    SelectionText: o({
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: [{visualStyle: {selectionGroup: {fontSize: _}}}, [myContext, "VisualStyle"]],
        fontWeight: 100,
        color: [{visualStyle: {selectionGroup: {color: _}}}, [myContext, "VisualStyle"]],
        textAlign: "left",
        verticalAlign: "top",
        value: [concatStr, 
            [
                {value: [{selection: _}, [embedding]], text: _},
                [{choices: _}, [embedding]]           
            ],
            ", "
        ],
        whiteSpace: "nowrap"
    }, {
        qualifier: {selection: false},
        fontStyle: "oblique",
        value: "No selection"
    }),

    MenuItemText: {
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: [{visualStyle: {selectionGroup: {menuItemFontSize: _}}}, [myContext, "VisualStyle"]],
        fontWeight: [{visualStyle: {selectionGroup: {menuItemFontWeight: _}}}, [myContext, "VisualStyle"]],
        color: "#505050",
        textAlign: "left",
        whiteSpace: "nowrap"
    },

    SliceNameText: {
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: 14,
        fontWeight: 700,
        textAlign: "left"
    },

    SliceNameValue: {
        fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
        fontSize: 14,
        fontWeight: 500,
        textAlign: "right"
    },

    // Layout of the choice areas as a series of closable menus
    SelectionControllerPresentation: {
        "class": "BasicListInArea",

        context: {
            listData: [{choicesData: _}, [me]],
            itemSpacing: 1,

            spaceForItems: [offset,
                {type: "top", element: [first, [{children: {items: _}}, [me]]]},
                {type: "bottom"}
            ],
            availableHeight: [minus,
                [{spaceForItems: _}, [me]],
                [mul,
                    [size, [{choicesData: _}, [me]]],
                    [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]]
                ]
            ],
            firstChildOffset: [{visualStyle: {selectionGroup: {headerHeight: _}}}, [myContext, "VisualStyle"]]
        },

        display: {
            borderColor: [{visualStyle: {bgColor: _}}, [myContext, "VisualStyle"]],
            borderWidth: 1,
            borderStyle: "solid"
        },

        children: {
            header: {
                description: {
                    display: {
                        background: [{visualStyle: {headerColor: _}}, [myContext, "VisualStyle"]],
                        text: {
                            "class": "HeaderText",
                            value: "Search"
                        }
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: [{visualStyle: {selectionGroup: {headerHeight: _}}}, [myContext, "VisualStyle"]],
                        right: 0
                    }
                }
            },
            items: {
                data: [{choicesData: _}, [me]],
                description: {
                    "class": "SelectionGroup"
                }
            },
            footer: {
                description: {
                    display: {
                        background: [{visualStyle: {selectionGroup: {closedBgColor: _}}}, [myContext, "VisualStyle"]],
                        transitions: {
                            top: 0.5
                        }
                    },
                    position: {
                        top: {
                            point1: { type: "bottom", element: [last, [{children: {items: _}}, [embedding]]]},
                            point2: { type: "top" },
                            equals: 1
                        },
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        }
    },

    SelectionGroupContext: {
        context: {
            label: [{content: {label: _}}, [me]],
            choices: [{content: {choices: _}}, [me]],
            singleChoice: [{content: {singleChoice: _}}, [me]],
            "*open": false,
            selection: [
                {selected: _},
                [
                    {label: [{label: _}, [me]]},
                    [{selections: _}, [embedding]]
                ]
            ],
            siblings: [
                n([me]),
                [{children: {items: _}}, [embedding]]
            ]
        }
    },

    SelectionGroup: o({
        "class": "SelectionGroupContext",

        context: {
            hover: [and,
                [{visualStyle: {selectionGroup: {hoverColor: _}}}, [myContext, "VisualStyle"]],
                [{param: {pointerInArea: _}}, [me]]
            ]
        },

        display: {
            transitions: {
                top: 0.5
            }
        },

        children: {
            header: {
                description: {
                    display: {
                        paddingLeft: 4,
                        text: {
                            "class": "ChoiceMenuText",
                            value: [{label: _}, [embedding]]
                        }
                    },
                    position: {
                        left: 0,
                        right: 30,
                        top: 0,
                        height: [div, [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]], 2]
                    }
                }
            },
            openControl: {
                description: {
                    "class": "OpenCloseControl",
                    context: {
                        open: [{open: _}, [myContext, "SelectionGroup"]]
                    },
                    position: {
                        right: 12,
                        top: 7
                    }
                }
            },
            currentChoice: {
                description: {
                    context: {
                        selection: [{selection: _}, [embedding]]
                    },
                    display: {
                        paddingLeft: 4,
                        text: {
                            "class": "SelectionText"
                        }
                    },
                    position: {
                        left: 0,
                        right: 0,
                        top: [div, [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]], 2],
                        height: [div, [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]], 2]
                    }
                }
            }
        }

    }, {

        qualifier: {hover: true},

        "display.background": [{visualStyle: {selectionGroup: {hoverColor: _}}}, [myContext, "VisualStyle"]]

    }, {
        qualifier: {open: false},

        "display.background": [{visualStyle: {selectionGroup: {closedBgColor: _}}}, [myContext, "VisualStyle"]],

        position: {
            height: [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]]
        }

    }, {

        qualifier: {open: true},

        context: {
            listData: [{choices: _}, [me]]
        },

        "display.background": [{visualStyle: {selectionGroup: {openBgColor: _}}}, [myContext, "VisualStyle"]],

        children: {
            scrolledMenu: {
                description: {
                    "class": "ScrolledMenu1",
                    position: {
                        top: [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]],
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        },

        position: {
            // Reserve all available space, unless there are less items, in
            // which case reserve the true amount.
            // Make sure there are at least 100 pixels (if available space is
            // less), but less if the items take up less space.
            height: [plus,
                [max,
                    [min,
                        100,
                        [mul, [size, [{choices: _}, [me]]], 31]
                    ],
                    [min,
                        [mul, [size, [{choices: _}, [me]]], 31],
                        [{availableHeight: _}, [embedding]]
                    ]
                ],
                [{visualStyle: {selectionGroup: {height: _}}}, [myContext, "VisualStyle"]]
            ]
        }
    }),

    ScrolledMenuContext: {
        context: {
            itemSize: 30,
            itemSpacing: 1,
            scrolledData: [{choices: _}, [embedding]]
        }
    },

    ScrolledMenu1: {
        "class": o("RLUniformScrollableWithScrollbar", "ScrolledMenuContext"),

        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "ChoiceMenuItem1"
                }
            }
        }
    },

    OpenCloseControl: o({
        "class": "MutuallyExclusiveOpenClose",
        context: {
            visualStyleIndex: [{visualStyleIndex: _}, [myContext, "VisualStyle"]]
        }
    }, {
        qualifier: {visualStyleIndex: 0},
        "class": "OpenCloseTriangle"
    }, {
        qualifier: {visualStyleIndex: 1},
        "class": "OpenCloseImage"
    }),

    MutuallyExclusiveOpenClose: {
        context: {
            open: mustBeDefined
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switch: {
                        "class": {name: "SwitchContextLabelOnWrite", label: "open"}
                    },
                    closeOthers: {
                        to: [
                            {open: _},
                            [{siblings: _}, [embedding]]
                        ],
                        merge: false
                    }
                }
            }
        }
    },

    OpenCloseTriangle: o({
        display: {
            triangle: {
                baseSide: "left",
                color: [{visualStyle: {selectionGroup: {color: _}}}, [myContext, "VisualStyle"]]
            },
            transitions: {
                transform: 0.35
            }
        },
        position: {
            width: 18,
            height: 18
        }
    }, {
        qualifier: {open: true},
        display: {
            transform: {
                rotate: 90
            }
        }
    }),

    OpenCloseImage: o({
        display: {
            image: {
                src: "%%image:(ic_keyboard_arrow_down_48px.svg)%%",
                size: "100%"
            },
            transitions: {
                transform: 0.35
            }
        },
        position: {
            width: 24,
            height: 24
        }
    }, {
        qualifier: {open: true},
        display: {
            transform: {
                flip: "vertically"
            }
        }
    }),

    ChoiceMenuItem1: o({
        context: {
            text: [{content: {text: _}}, [me]],
            value: [{content: {value: _}}, [me]],
            selected: [[{value: _}, [me]], [{selection: _}, [myContext, "SelectionGroup"]]],
            singleChoice: [{singleChoice: _}, [myContext, "SelectionGroup"]]
        },
        display: {
            background: "white",
            borderBottomColor: [{visualStyle: {lightBgColor: _}}, [myContext, "VisualStyle"]],
            borderBottomStyle: "solid",
            borderBottomWidth: 1
        },
        children: {
            selectionMarker: {
                description: {
                    context: {
                        selected: [{selected: _}, [embedding]]
                    },
                    position: {
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 24
                    }
                }
            },
            text: {
                description: {
                    display: {
                        text: {
                            "class": "MenuItemText",
                            value: [{text: _}, [embedding]]
                        }
                    },
                    position: {
                        top: 0,
                        left: 24,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        },
        position: {
            left: 0,
            right: 8
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    // merge in variants depending on singleChoice
                    switch: {
                        to: [{selection: _}, [myContext, "SelectionGroup"]]
                    }
                }
            }
        }
    }, {
        qualifier: {singleChoice: true},
        "write.onClick.true.switch.merge": [{value: _}, [me]],
        children: {
            selectionMarker: {
                description: {
                    display: {
                        "class": "SelectionButton",
                        arc: {
                            color: [{visualStyle: {lightBgColor: _}}, [myContext, "VisualStyle"]]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {singleChoice: false},
        "write.onClick.true.switch.merge": [cond, [{selected: _}, [me]], o(
            {on: true, use: [n([{value: _}, [me]]), [{selection: _}, [myContext, "SelectionGroup"]]]},
            {on: false, use: o([{selection: _}, [myContext, "SelectionGroup"]], [{value: _}, [me]])}
        )],
        children: {
            selectionMarker: {
                description: {
                    display: {
                        "class": "SelectionCheckMark"
                    }
                }
            }
        }
    }),

    SelectionButton: o({
        arc: {
            qualifier: {selected: false},
            inset: 7,
            radius: 8,
            start: 0,
            range: 1
        }
    }, {
        qualifier: {selected: true},
        arc: {
            inset: o(7, 0),
            radius: o(8, 5),
            start: o(0, 0),
            range: o(1, 1)
        }
    }),

    SelectionCheckMark: {
        text: {
            fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
            fontSize: 24,
            color: [{visualStyle: {lightBgColor: _}}, [myContext, "VisualStyle"]],
            value: [
                cond, [{selected: _}, [me]], o({
                    on: true, use: "⊠"
                }, {
                    on: false, use: "□"
                })
            ]
        }
    },

    // Classes to interface with the scrollable classes

    RLUniformScrollableWithScrollbar: {
        "class": o("RLScrollableWithScrollbar", "UniformScrollableWithScrollbar"),

        context: {
            itemSpacing: 1
        },

        "children.scrollView.description": {
            children: {
                "scrolledDocument.description": {
                    "children.itemsInView.description": {
                        "class": "UniformScrollToAnchorExt"
                    }
                }
            }
        }
    },

    RLScrollableWithScrollbar: o({
        context: {
            scrollStartEdge: "top",
            scrollbarStartEdge: "top"
        },

        children: {
            "scrollView.description": {
                "class": "RLScrollView"
            },
            "scrollbar.description": {
                "class": "RLScrollbar",
                position: {
                    top: 0,
                    bottom: 0,
                    right: -1,
                    width: 8
                }
            }
        }
    }),

    RLScrollView: {
        "children.scrolledDocument.description": {
            "class": "DraggableScrolledDocumentExt"
        },
        position: {
            frame: 0
        }
    },

    RLScrollbar: {
        "class": "RLScrollbarLayoutExt",
        
        context: {
            scrollStartEdge: [{ scrollbarStartEdge: _ }, [embedding]]
        },
        display: {
            background: "white"
        },
        "children.cursor.description": {
            display: {
                background: "#a0b0b0",
                borderRadius: 4
            }
        }
    },

    RLScrollbarLayoutExt: {
        context: {
            scrollbarGirth: 8
        },
        display: {
            borderRadius: 4,
            background: "white",
            borderStyle: "solid",
            borderColor: "grey",
            borderWidth: 1
        },
        position: {
            width: [{ scrollbarGirth: _ }, [me]]
        },
        "children.cursor.description.position": {
            left: 0,
            right: 0
        }
    },

    RLScrolledItem: {
        "class": "SelectedItemInformation",
        context: {
            isThisItemSelected: [
                [{itemIndexInDoc: _}, [me]],
                [{selectedItemsIndex: _}, [myContext, "ResultList"]]
            ],
            cciItem: [{content: _}, [me]]
        },
        children: {

            title: {
                description: {
                    display: {
                        text: {
                            fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
                            fontSize: [{visualStyle: {result: {fontSize: _}}}, [myContext, "VisualStyle"]],
                            fontWeight: [{visualStyle: {result: {fontWeight: _}}}, [myContext, "VisualStyle"]],
                            textAlign: "left",
                            verticalAlign: "top",
                            value: [{officialTitle: _}, [embedding]]
                        }
                    },
                    position: {
                        top: [{visualStyle: {result: {topOffset: _}}}, [myContext, "VisualStyle"]],
                        left: 2,
                        height: [{visualStyle: {result: {secondOffset: _}}}, [myContext, "VisualStyle"]],
                        right: 80
                    }
                }
            },

            url: {
                description: {
                    "class": "URL",
                    context: {
                        label: "cci",
                        text: [{cci: _}, [embedding]],
                        value: [{url: _}, [embedding]]
                    },
                    position: {
                        top: [{visualStyle: {result: {secondOffset: _}}}, [myContext, "VisualStyle"]],
                        left: 2,
                        height: 16,
                        width: 150
                    }
                }
            },

            managingAuthority: {
                description: {
                    "class": "URL",
                    context: {
                        label: "managing authority",
                        value: [{maURL: _}, [embedding]]
                    },
                    position: {
                        top: [{visualStyle: {result: {secondOffset: _}}}, [myContext, "VisualStyle"]],
                        left: 180,
                        height: 16,
                        right: {
                            point1: {type: "right"},
                            point2: {type: "left", element: [{children: {left_eu_amount: _}}, [embedding]]},
                            equals: 4
                        }
                    }
                }
            },

            left_eu_amount: {
                description: {
                    "class": "LabeledMonetaryValue",
                    context: {
                        label: "total left",
                            value: [minus,
                                [sum, [
                                    {planned_eu_amount: _},
                                    [{interventionFields: _}, [embedding]]
                                ]],
                                [replaceEmpty,
                                    [sum, [
                                        {eu_eligible_costs_selected_fin_data_notional: _},
                                        [{interventionFields: _}, [embedding]]
                                    ]],
                                    0
                                ]
                            ]
                    },
                    position: {
                        top: [{visualStyle: {result: {secondOffset: _}}}, [myContext, "VisualStyle"]],
                        width: 180,
                        right: 5,
                        height: 15
                    }
                }
            }
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    setSelectedItemsIndex: {
                        to: [{selectedItemsIndex: _}, [myContext, "ResultList"]],
                        merge: [{itemIndexInDoc: _}, [me]]
                    }
                }
            }
        },
        position: {
            left: 0,
            right: 8
        }
    },

    // Presentation Classes

    AppPresentation: {
        "class": "VisualStyleContext",

        display: {
            background: [{visualStyle: {appBgColor: _}}, [me]]
        },

        children: {

            controls: {
                description: {
                    "class": "SettingsToolBarPresentation",
                    position: {
                        top: [{visualStyle: {controlBar: {topMargin: _}}}, [myContext, "VisualStyle"]],
                        left: [{visualStyle: {appLeftMargin: _}}, [myContext, "VisualStyle"]],
                        right: [{visualStyle: {appRightMargin: _}}, [myContext, "VisualStyle"]],
                        height: 20
                    }
                }
            },

            selectionController: {
                description: {
                    "class": "SelectionControllerPresentation",
                    position: {
                        left: [{visualStyle: {appLeftMargin: _}}, [myContext, "VisualStyle"]],
                        top: [{visualStyle: {appTopMargin: _}}, [myContext, "VisualStyle"]],
                        bottom: 5,
                        right: {
                            point1: { type: "right" },
                            point2: { label: "verticalSeparator", element: [areaOfClass, "App"] },
                            equals: [{visualStyle: {verticalSeparatorMargin: _}}, [myContext, "VisualStyle"]]
                        }
                    }
                }
            },

            sort: {
                description: {
                    "class": "SortControllerPresentation",
                    position: {
                       left: {
                            point1: { label: "verticalSeparator", element: [areaOfClass, "App"] },
                            point2: { type: "left" },
                            equals: [{visualStyle: {verticalSeparatorMargin: _}}, [myContext, "VisualStyle"]]
                        },
                        top: [{visualStyle: {appTopMargin: _}}, [myContext, "VisualStyle"]],
                        right: [{visualStyle: {appRightMargin: _}}, [myContext, "VisualStyle"]],
                        height: [{visualStyle: {sortControl: {headerHeight: _}}}, [myContext, "VisualStyle"]]
                    }
                }
            },

            result: {
                description: {
                    "class": "ResultListPresentation",
                    position: {
                       left: {
                            point1: { label: "verticalSeparator", element: [areaOfClass, "App"] },
                            point2: { type: "left" },
                            equals: [{visualStyle: {verticalSeparatorMargin: _}}, [myContext, "VisualStyle"]]
                        },
                        top: {
                            point1: { type: "bottom", element: [{children: {sort: _}}, [embedding]] },
                            point2: { type: "top" },
                            equals: 0
                        },
                        right: [{visualStyle: {appRightMargin: _}}, [myContext, "VisualStyle"]],
                        bottom: {
                            point1: { "type": "bottom" },
                            point2: { "type": "vertical-center", element: [embedding] },
                            equals: 3
                        }
                    }
                }
            },

            selectionInfo: {
                description: {
                    "class": "SelectionInformationPresentation",
                    position: {
                       left: {
                            point1: { label: "verticalSeparator", element: [areaOfClass, "App"] },
                            point2: { type: "left" },
                            equals: [{visualStyle: {verticalSeparatorMargin: _}}, [myContext, "VisualStyle"]]
                        },
                        top: {
                            point1: { "type": "vertical-center", element: [embedding] },
                            point2: { "type": "top" },
                            equals: 3
                        },
                        right: [{visualStyle: {appRightMargin: _}}, [myContext, "VisualStyle"]],
                        bottom: 5
                    }
                }
            }
        },

        position: {
            // Separator between search/menu and result presentation
            verticalSeparator: {
                point1: { type: "left" },
                point2: { label: "verticalSeparator" },
                equals: [{visualStyle: {verticalSeparator: _}}, [me]]
            }
        }
    },

    ResultListPresentation: {
        display: {
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: [{visualStyle: {bgColor: _}}, [myContext, "VisualStyle"]]
        },
        context: {
            itemSize: 60,
            itemSpacing: 0
        },
        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "ItemPresentationBackground"
                }
            }
        }
    },
    
    ItemPresentationBackground: o({
        context: {
            visualStyleIndex: [{visualStyleIndex: _}, [myContext, "VisualStyle"]],
            hover: [
                and,
                [{visualStyle: {result: {hoverColor: _}}}, [myContext, "VisualStyle"]],
                [{param: {pointerInArea: _}}, [me]]
            ]
        },
        display: {
            background: [pos,
                [mod,
                    [{param: {areaSetContent: _}}, [me]],
                    [size, [{visualStyle: {result: {bgColor: _}}}, [myContext, "VisualStyle"]]]
                ],
                [{visualStyle: {result: {bgColor: _}}}, [myContext, "VisualStyle"]]
            ]
        }
    }, {
        qualifier: {isThisItemSelected: true},
        display: {
            background: [{visualStyle: {result: {selectColor: _}}}, [myContext, "VisualStyle"]]
        }
    }, {
        qualifier: {hover: true},
        display: {
            background: [{visualStyle: {result: {hoverColor: _}}}, [myContext, "VisualStyle"]]
        }
    }, {
        qualifier: {visualStyleIndex: 0},
        display: {
            borderBottomColor: "white",
            borderBottomStyle: "solid",
            borderBottomWidth: 1
        }
    }),

    SortControllerPresentation: {
        "class": "BasicListInArea",
        context: {
            listOrder: "left-right",
            firstChildOffset: 80,
            listData: [{facetNames: _}, [me]]
        },
        display: {
            background: [{visualStyle: {headerColor: _}}, [myContext, "VisualStyle"]],
            paddingLeft: 4,
            text: {
                "class": "HeaderText",
                textAlign: "left",
                value: "Sort by:"
            }
        },
        children: {
            items: {
                description: {
                    "class": "SortHeaderItemPresentation"
                }
            },
            direction: {
                description: {
                    "class": "SortDirectionPresentation",
                    position: {
                        "vertical-center": 0,
                        right: 4,
                        height: 20,
                        width: 28
                    }
                }
            }
        }
    },

    SortDirectionPresentation: {
        children: {
            up: {
                description: {
                    display: {
                        triangle: {
                            baseSide: "bottom",
                            color: [
                                cond, [{direction: _}, [embedding, [embedding]]],
                                o({on: true, use: "white"})
                            ],
                            stroke: "white"
                        }
                    },
                    position: {
                        top: 5,
                        left: 4,
                        bottom: 5,
                        width: 8
                    }
                }
            },
            down: {
                description: {
                    display: {
                        triangle: {
                            baseSide: "top",
                            color: [
                                cond, [{direction: _}, [embedding, [embedding]]],
                                o({on: false, use: "white"})
                            ],
                            stroke: "white"
                        }
                    },
                    position: {
                        top: 5,
                        right: 4,
                        bottom: 5,
                        width: 8
                    }
                }
            }
        }
    },

    SortHeaderItemPresentation: o({
        display: {
            background: [{visualStyle: {headerColor: _}}, [myContext, "VisualStyle"]],
            paddingLeft: 4,
            text: {
                "class": "HeaderText",
                textAlign: "left",
                value: [{text: _}, [me]]
            }
        },
        position: {
            width: 80
        }
    }, {
        qualifier: {isSelected: true},
        display: {
            text: {
                fontWeight: 700
            }
        }
    }),

    SettingsToolBarPresentation: {
        display: {
            background: [{visualStyle: {controlBar: {bgColor: _}}}, [myContext, "VisualStyle"]]
        },
        children: {
            settingsControl: {
                description: {
                    position: {
                        top: 0,
                        width: 20,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        }
    },

    SelectionInformationPresentation: {
        display: {
            background: "#e0e0e0",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "#a0a0a0"
        },
        children: {
            dimensions: {
                description: {
                    "class": "TabsPresentation",
                    position: {
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        }
    },

    TabsPresentation: {
        display: {
            background: [{visualStyle: {tabHeader: {bgColor: _}}}, [myContext, "VisualStyle"]]
        },
        children: {
            header: {
                description: {
                    "class": "TabHeaderPresentation",
                    position: {
                        height: 30
                    }
                }
            },
            item: {
                description: {
                    "class": "TabItemPresentation",
                    position: {
                        top: 35,
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            },
            selectionIndicator: {
                description: {
                    display: {
                        background: [{visualStyle: {tabHeader: {highlightFontColor: _}}}, [myContext, "VisualStyle"]],
                        transitions: {
                            left: 0.5
                        }
                    },
                    position: {
                        top: 30,
                        width: 60,
                        height: 4,
                        center: {
                            point1: {
                                type: "horizontal-center",
                                element: [pos, [{selectedTabIndex: _}, [embedding]], [{children: {header: _}}, [embedding]]]
                            },
                            point2: { type: "horizontal-center" },
                            equals: 0
                        }
                    }
                }
            }
        },
        position: {
            // Provide left and right margin for first and last tab
            leftTabMargin: {
                point1: { type: "left" },
                point2: { label: "tabStart" },
                equals: 30
            },
            rightTabMargin: {
                point1: { label: "tabEnd" },
                point2: { type: "right" },
                equals: 30
            }
        }
    },

    TabHeaderPresentation: {
        display: {
            text: {
                "class": "TabHeaderStyle",
                value: [{label: _}, [me]]
            }
        },
        position: {
            left: {
                pair1: {
                    point1: { label: "tabStart", element: [embedding] },
                    point2: { label: "tabEnd", element: [embedding] }
                },
                pair2: {
                    point1: { label: "tabStart", element: [embedding] },
                    point2: { type: "left" }
                },
                ratio: [div, [{index: _}, [me]], [{nrTabs: _}, [embedding]]]
            },
            width: {
                pair1: {
                    point1: { label: "tabStart", element: [embedding] },
                    point2: { label: "tabEnd", element: [embedding] }
                },
                pair2: {
                    point1: { type: "left" },
                    point2: { type: "right" }
                },
                ratio: [div, 1, [{nrTabs: _}, [embedding]]]
            }
        }
    },

    TabItemPresentation: {
        display: {
            background: "white"
        },
        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "TabItemListItemPresentation"
                }
            }
        }    
    },

    TabItemListItemPresentation: {
        children: {
            title: {
                description: {
                    display: {
                        text: {
                            fontFamily: [{visualStyle: {fontFamily: _}}, [myContext, "VisualStyle"]],
                            fontSize: 16,
                            fontWeight: 500,
                            textAlign: "left",
                            whiteSpace: "nowrap",
                            value: [{dimension_title: _}, [{content: _}, [embedding]]]
                        }
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: 22,
                        right: 0
                    }
                }
            },
            planned: {
                description: {
                    "class": "LabeledMonetaryValue",
                    context: {
                        label: "planned amount",
                        value: [{planned_eu_amount: _}, [{content: _}, [embedding]]]
                    },
                    position: {
                        top: 22,
                        left: 0,
                        height: 18,
                        width: 240
                    }
                }
            },
            reserved: {
                description: {
                    "class": "LabeledMonetaryValue",
                    context: {
                        label: "reserved amount",
                        value: [replaceEmpty, [{eu_eligible_costs_selected_fin_data_notional: _}, [{content: _}, [embedding]]], 0]
                    },
                    position: {
                        top: 22,
                        left: 260,
                        height: 18,
                        width: 240
                    }
                }
            },
            categoryOfRegion: {
                description: {
                    "class": "LabeledValue",
                    context: {
                        label: "category of region",
                        value: [{category_of_region: _}, [{content: _}, [embedding]]]
                    },
                    position: {
                        top: 40,
                        left: 0,
                        height: 18,
                        width: 240
                    }
                }
            }
        },
        position: {
            left: 0,
            right: 0
        }
    }
};
