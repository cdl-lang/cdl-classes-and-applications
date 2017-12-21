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
// %%classfile%%: "style.js"
// %%classfile%%: "login.js"
// %%classfile%%: "sliceEditor.js"
// %%classfile%%: "sliceViewer.js"
// %%classfile%%: "help.js"
// %%classfile%%: "clipboard.js"

var classes = {

    DataContext: o({
        "class": o("SelectionChainContext"),
        context: {
            useDB: [arg, "useDB", true],
            allDataLoaded: [
                and,
                [notEmpty, [{dataTable: _}, [me]]],
                [notEmpty, [{cciTable: _}, [me]]]
            ],
            // Table to translate "ms" facet country names to ccis
            facetTranslations: o(
                {
                    userFacet: "ms",
                    dataFacet: "cci",
                    translation: [{cci: true, ms: true}, [{ccis: _}, [me]]]
                }
            )
        }
    }, {
        qualifier: {useDB: true},
        context: {
            flatData: true,            
            dataTable: [database, [{id: _, name: "plannedvsimplemented"}, [databases]]],
            ccis: [database, [{id: _, name: "ccilookup"}, [databases]]],
            inputData: [{dimension_type: "InterventionField"}, [{dataTable: _}, [me]]],
            crossCuttingThemes: [database, [{id: _, name: "crosscuttingthemes"}, [databases]]]
        }
    }, {
        qualifier: {useDB: false},
        context: {
            flatData: [arg, "flatData", true],
            cciTable: [datatable, "./data/cci_lookup_table.json", {noIndexer: true}],
            ccis: [{data: _}, [{cciTable: _}, [me]]],
            crossCuttingThemes: [datatable, "./data/ESIF_2014-2020_Categorisation_Crosscutting_Themes_Lookup.csv"]
        }
    }, {
        qualifier: {flatData: true, useDB: false},
        context: {
            dataTable: [datatable, "./data/ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.csv"],
            inputData: [{dimension_type: "InterventionField"}, [{data: _}, [{dataTable: _}, [me]]]]
        }
    }, {
        qualifier: {flatData: false, useDB: false},
        context: {
            dataTable: [datatable, "./data/planned_vs_implemented.grouped.json", {noIndexer: false}],
            inputData: [{data: _}, [{dataTable: _}, [me]]]
        }
    }),

    AppContext: o({
        "class": o("NextIdContext", "ClipboardContext"),
        context: {
            /// Is the global slice editor visible?
            isSliceEditorVisible: [and,
                [notEmpty, [{editedSliceId: _}, [me]]],
                [{editView: _}, [me]]
            ],
            /// Definitions of all slices with initial value
            /// Should point at preferences for current view
            "^slices": o({
                id: 0,
                name: "All",
                selections: o(),
                visible: true
            }, {
                id: 1,
                name: "More developed regions",
                selections: o({facetName: "category_of_region", value: "More developed", selected: true, displayName: "More developed"}),
                visible: true
            }, {
                id: 2,
                name: "ESF",
                selections: o({facetName: "fund", value: "ESF", selected: true, displayName: "ESF"}),
                visible: true
            }),
            /// Should point at preferences for current view
            "^valueDisplayType": "absolute",
            /// OS of the ids of selected slices
            "^selectedSliceIds": o({id: 0, group: false, label: false}),
            /// Id of slice currently being edited; o() means no editing. If a
            /// slice wants to be edited, it should write its id here. Note that
            /// on changing slice sets, this should be emptied too.
            "*editedSliceId": o(),
            /// Slice area being edited
            editedSliceArea: [
                {id: [{editedSliceId: _}, [me]]},
                [areaOfClass, "Slice"]
            ],
            /// The edited slice
            editedSlice: [{editedSliceArea: {sliceContent: _}}, [me]],
            /// Selection chain of edited slice
            editedSelectionChain:
                [{editedSliceArea: {children: {selectionChain: _}}}, [me]],
            /// Name of the edited slice
            editedSliceName: [{editedSlice: {name: _}}, [me]],
            /// Selections of the edited slices
            editedSliceSelections: [{editedSlice: {selections: _}}, [me]],
            /// Space for the editor
            "^slicePanelWidthRatio": 0.3,
            /// True when intervention menu is open
            interventionMenu: [areaOfClass, "ESIFCrossCuttingTheme"],
            /// Slice set view data
            "^viewData": {
                menuStyle: "vertical"
            },
            /// Menu style
            menuStyle: [{viewData: {menuStyle: _}}, [me]],
            /// When true, login screen is shown
            "*showLoginScreen": true,
            /// When true, account create screen replaces login screen
            "*createAccount": false,
            /// True when logged in
            loggedIn: [equal, "logged in", [{loginStatus: _}, [tempAppStateConnectionInfo]]],
            /// When true, show list editor
            "*editView": false,
            /// Should point at preferences for current view
            "*climateChangeWeighting": false,
            
            // Fonts (currently used by multibar and legend)
            fontFamily: '"Open Sans",Roboto,sans-serif',
            fontWeight: 300,
            defaultTextColor: "#111111",   
        }
    }),

    App: o({
        "class": o("AppContext", "DataContext", "HelpViewerArea"),

        children: {
            toolBar: {
                description: {
                    "class": "AppToolBar",
                    position: {
                        top: 4,
                        left: 2,
                        right: 2
                    }
                }
            },

            sliceViewer: {
                description: {
                    "class": "SliceViewer",
                    context: {
                        slices: [{slices: _}, [embedding]],
                        selectedSliceIds: [{ selectedSliceIds: _ }, [embedding]]
                    }
                }
            }

        },

        position: {
            /// Don't let the panelSeparator get too close to filling the
            /// screen
            panelSeparatorNotTooCloseToEnd: {
                point1: { label: "panelSeparator" },
                point2: { type: [{menuPosLabel2: _}, [me]], element: [embedding] },
                min: 125,
                priority: 1
            }
        },

        write: {
            onLogin: {
                upon: [and,
                    [equal, [{errorId: _}, [tempAppStateConnectionInfo]], 0],
                    [equal, [{connectionState: _}, [tempAppStateConnectionInfo]], "connected"],
                    [notEqual, [{owner: _}, [tempAppStateConnectionInfo]], "anonymous"]
                ],
                true: {
                    hideLoginScreen: {
                        to: [{showLoginScreen: _}, [me]],
                        merge: false
                    },
                    cancelCreateAccount: {
                        to: [{createAccount: _}, [myContext, "App"]],
                        merge: false
                    }
                }
            }
        }

    }, {

        qualifier: {isSliceEditorVisible: true},

        children: {
            sliceEditor: {
                description: {
                    context: {
                        selections: [{editedSliceSelections: _}, [myContext, "App"]],
                        selectionChain: [{editedSelectionChain: _}, [myContext, "App"]]
                    }
                }
            },
            panelSeparationDrag: {
                description: {
                    "class": "PanelSeparationDrag",
                    context: {
                        ratioTracker: [{slicePanelWidthRatio: _}, [embedding]],
                        posLabel1: [{menuPosLabel1: _}, [embedding]],
                        posLabel2: [{menuPosLabel2: _}, [embedding]]
                    }
                }
            }
        },

        position: {
            panelSeparator: {
                ratio: [{slicePanelWidthRatio: _}, [me]]
            }
        }
    }, {

        qualifier: {menuStyle: "vertical"},

        context: {
            menuPosLabel1: "left",
            menuPosLabel2: "right"
        },

        position: {
            /// Editor should be positioned to the lefttop of the panelSeparator,
            /// results to the right.
            panelSeparator: {
                pair1: {
                    point1: { type: [{menuPosLabel1: _}, [me]] },
                    point2: { type: [{menuPosLabel2: _}, [me]] }
                },
                pair2: {
                    point1: { type: [{menuPosLabel1: _}, [me]] },
                    point2: { label: "panelSeparator" }
                },
                ratio: 0
            }
        },

        children: {
            sliceViewer: {
                description: {
                    position: {
                        "class": { name: "BelowSibling", sibling: "toolBar" },
                        left: {
                            point1: { label: "panelSeparator", element: [embedding] },
                            point2: { type: "left" },
                            equals: 1
                        },
                        bottom: 2,
                        right: 2
                    }
                }
            }
        }

    }, {

        qualifier: {menuStyle: "vertical", isSliceEditorVisible: true},

        children: {
            sliceEditor: {
                description: {
                    "class": "VerticalSliceEditor",
                    position: {
                        "class": { name: "BelowSibling", sibling: "toolBar"},
                        left: 0,
                        bottom: 2,
                        right: {
                            point1: { type: "right" },
                            point2: { label: "panelSeparator", element: [embedding] },
                            equals: 1
                        }
                    }
                }
            }
        }

    }, {

        qualifier: {menuStyle: "horizontal"},

        context: {
            menuPosLabel1: "top",
            menuPosLabel2: "bottom"
        },

        children: {
            sliceViewer: {
                description: {
                    position: {
                        top: {
                            point1: { label: "panelSeparator", element: [embedding] },
                            point2: { type: "top" },
                            equals: 1
                        },
                        left: 2,
                        bottom: 2,
                        right: 2
                    }
                }
            }
        }

    }, {

        qualifier: {menuStyle: "horizontal", isSliceEditorVisible: false},

        position: {
            /// Editor should be positioned above the panelSeparator,
            /// results below.
            fixedPanelSeparator: {
                point1: { type: "bottom", element: [{children: {toolBar: _}}, [me]] },
                point2: { label: "panelSeparator" },
                equals: 0
            }
        }

    }, {

        qualifier: {menuStyle: "horizontal", isSliceEditorVisible: true},

        position: {
            /// Editor should be positioned above the panelSeparator,
            /// results below.
            movingPanelSeparator: {
                pair1: {
                    point1: { type: [{menuPosLabel1: _}, [me]] },
                    point2: { type: [{menuPosLabel2: _}, [me]] }
                },
                pair2: {
                    point1: { type: [{menuPosLabel1: _}, [me]] },
                    point2: { label: "panelSeparator" }
                },
                ratio: 0
            },
            panelSeparatorUnderToolBar: {
                point1: { type: "bottom", element: [{children: {toolBar: _}}, [me]]},
                point2: { label: "panelSeparator" },
                min: 0
            }
        },

        children: {
            sliceEditor: {
                description: {
                    "class": "HorizontalSliceEditor",
                    position: {
                        top: 28,
                        left: 0,
                        bottom: {
                            point1: { type: "bottom" },
                            point2: { label: "panelSeparator", element: [embedding] },
                            equals: 1
                        },
                        right: 0
                    }
                }
            }
        }

    }, {
        qualifier: {showLoginScreen: true},
        children: {
            loginScreen: {
                partner: [me],
                description: {
                    "class": "ModalLayer",
                    context: {
                        openControl: [{showLoginScreen: _}, [expressionOf]],
                        showCloseControl: false
                    }
                }
            }
        }
    }, {
        qualifier: {showLoginScreen: true, loggedIn: true},
        "children.loginScreen.description": {
            "children.dialog.description": {
                "class": "LogoutScreen"
            }
        }
    }, {
        qualifier: {showLoginScreen: true, loggedIn: false, createAccount: false},
        "children.loginScreen.description": {
            "class": "ShowHelpToolTip",
            context: {
                toolTipDelay: 15,
                helpToolTipText: o(
                    "Log in using your email address and password if you want to save your work.",
                    "You can create an account if you don't have one yet.",
                    "Or skip log in and try it out; you can create an account later."
                ),
                helpToolTipTitle: "Using Accounts",
                extHelpToolTipSrc: "helpTexts/login.html",
                toolTipIsSticky: true,
                toolTipPositioningArea: o(
                    [{children: {dialog: {children: {loginButton: _}}}}, [me]],
                    [{children: {dialog: {children: {text2: _}}}}, [me]],
                    [{children: {dialog: {children: {skipButton: _}}}}, [me]]
                ),
                toolTipEdge: o("bottom", "left", "right")
            },
            "children.dialog.description": {
                "class": "LoginScreen"
            }
        }
    }, {
        qualifier: {showLoginScreen: true, loggedIn: false, createAccount: true},
        "children.loginScreen.description": {
            "children.dialog.description": {
                "class": "SignUpScreen"
            }
        }
    }),

    // This area needs to be removed, or z-lowered when done, because it
    // interferes with events in the areas it positions itself above.
    HelpViewerArea: o({
        "class": "ExtHelpSrcContext"
    }, {
        qualifier: {extHelpSrc: true},
        children: {
            helpViewer: {
                description: {
                    "class": o("HelpViewer", "ZAboveSiblings"),
                    context: {
                        extHelpSrc: [{extHelpSrc: _}, [embedding]]
                    }
                }
            }
        }
    }),

    PanelSeparationDrag: o({
        context: {
            posLabel1: mustBeDefined,
            posLabel2: mustBeDefined,
            hover: [{param: {pointerInArea: _}}, [me]],
            "*mouseDown": false,
            "*mouseDownInOtherArea": false
        },
        display: {
            pointerOpaque: true
        },
        stacking: {
            aboveSiblings: {
                lower: [embedded, [embedding]],
                higher: [me]
            }
        },
        write: {
            onMouseDownHere: {
                upon: [{type: "MouseDown"}, [myMessage]],
                true: {
                    doStartDrag: {
                        to: [{mouseDown: _}, [me]],
                        merge: true
                    },
                    changeCursor: {
                        to: [{display: {image: _}}, [pointer]],
                        merge: [{dragCursor: _}, [me]]
                    }
                }
            },
            onMouseDownElsewhere: {
                upon: [{type: "MouseDown", recipient: n("start", [me], "end")}, [message]],
                true: {
                    continuePropagation: true,
                    markMouseDown: {
                        to: [{mouseDownInOtherArea: _}, [me]],
                        merge: true
                    }
                }
            },
            onMouseUp: {
                upon: mouseUp,
                true: {
                    doEndDrag: {
                        to: [{mouseDown: _}, [me]],
                        merge: false
                    },
                    changeCursor: {
                        to: [{display: {image: _}}, [pointer]],
                        merge: "default"
                    },
                    unmarkMouseDown: {
                        to: [{mouseDownInOtherArea: _}, [me]],
                        merge: false
                    }
                }
            }
        }
    }, {
        qualifier: {hover: true, mouseDownInOtherArea: false},
        display: {
            background: "grey"
            // borderRightColor: "grey",
            // borderRightStyle: "solid",
            // borderRightWidth: 1
        }
    }, {
        qualifier: {mouseDown: true, mouseDownInOtherArea: false},
        context: {
            ratioTracker: mustBeDefined,
            embeddingWidth: [offset, {type: [{posLabel1: _}, [me]], element: [embedding]}, {type: [{posLabel2: _}, [me]], element: [embedding]}],
            pointerDistance: [offset, {type: [{posLabel1: _}, [me]], element: [embedding]}, {type: [{posLabel1: _}, [me]], element: [pointer]}],
            ratio: [div, [{pointerDistance: _}, [me]], [{embeddingWidth: _}, [me]]]
        },
        write: {
            onChangeRatio: {
                upon: [changed, [{ratio: _}, [me]]],
                true: {
                    writeRatio: {
                        to: [{ratioTracker: _}, [me]],
                        merge: [{ratio: _}, [me]]
                    }
                }
            }
        }
    }, {
        qualifier: {posLabel1: "left"},
        context: {
            dragCursor: "col-resize"
        },
        // Attempts to make the hover area wider by having an independent content
        // position lead to a loop, because when there is no display, pointerInArea
        // gets set, which constructs a display, and when the pointer is not in
        // the content display, pointerInArea becomes false, etc. It might be
        // a bug in the inclusion of the border width in the display offset or
        // something like that in MondriaDomEvent.rGetOverlappingAreas().
        // independentContentPosition: true,
        position: {
            top: 30,
            left: {
                point1: { label: "panelSeparator", element: [embedding] },
                point2: { type: [{posLabel1: _}, [me]] },
                equals: -1
            },
            bottom: 0,
            width: 2
            // contentTop: {
            //     point1: { type: "top", element: [embedding] },
            //     point2: { type: "top", content: true },
            //     equals: 30
            // },
            // contentLeft: {
            //     point1: { label: "panelSeparator", element: [embedding] },
            //     point2: { type: "left", content: true },
            //     equals: -1
            // },
            // contentBottom: {
            //     point1: { type: "bottom", content: true },
            //     point2: { type: "bottom", element: [embedding] },
            //     equals: 2
            // },
            // contentRight: {
            //     point1: { type: "left", content: true },
            //     point2: { type: "right", content: true },
            //     equals: 1
            // }
        }
    }, {
        qualifier: {posLabel1: "top"},
        context: {
            dragCursor: "row-resize"
        },
        position: {
            top: {
                point1: { label: "panelSeparator", element: [embedding] },
                point2: { type: [{posLabel1: _}, [me]] },
                equals: -1
            },
            left: 4,
            height: 2,
            right: 4
            // see other variant
        }
    }),

    ToolBarContext: {
        context: {
        }
    },

    ToolBar: {
        "class": "ToolBarContext",
        display: {
            background: "white",
            borderBottomColor: [{dividerColor: _}, [globalDefaults]],
            borderBottomWidth: 1,
            borderBottomStyle: "solid"
        },
        position: {
            belowAllChildren: {
                point1: { type: "bottom", element: o([embedded], [{children: {nextLevelToolBar: _}}, [areaOfClass, "NextLevelToolBar"]]) },
                point2: { type: "bottom" },
                min: 0
            },
            alignWithOneChild: {
                point1: { type: "bottom", element: o([embedded], [{children: {nextLevelToolBar: _}}, [areaOfClass, "NextLevelToolBar"]]) },
                point2: { type: "bottom" },
                equals: 0,
                orGroups: { label: "max", element: [me] }
            }
        }
    },

    AppToolBar: {
        "class": "ToolBar",
        children: {
            edit: {
                description: {
                    "class": o(
                        { name: "FlipButton", value: [{editView: _}, [myContext, "App"]] },
                        "ShowHelpToolTip"
                    ),
                    context: {
                        helpToolTipText: "Click here to open a panel with slice definitions and add them to the current view",
                        extHelpToolTipSrc: "helpTexts/general.html"
                    },
                    display: {
                        image: {
                            src: "design/img/ic_edit_48px.svg",
                            size: "100%"
                        }
                    },
                    position: {
                        top: 0,
                        left: 2,
                        width: 20,
                        height: 24
                    }
                }
            },
            // search: {
            //     description: {
            //         "class": "Slice", // pretends to be a slice. iffy
            //         context: {
            //             id: -1,
            //             solutionSet: o(),
            //             selectedData: o(),
            //             "*selections": o(),
            //             selectionChain: o()
            //         },
            //         display: {
            //             image: {
            //                 src: "design/img/ic_search_48px.svg",
            //                 size: "100%"
            //             }
            //         },
            //         position: {
            //             top: 0,
            //             left: 2,
            //             width: 20,
            //             height: 24
            //         },
            //         write: {
            //             onClick: {
            //                 upon: myClick,
            //                 true: {
            //                     editSearch: {
            //                         to: [{editedSliceId: _}, [myContext, "App"]],
            //                         merge: -1
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // },
            print: {
                description: {
                    "class": "DepressWhileMouseDown",
                    display: {
                        image: {
                            src: "design/img/ic_print_48px.svg",
                            size: "100%"
                        }
                    },
                    position: {
                        top: 0,
                        right: 88,
                        width: 24,
                        height: 24
                    },
                    write: {
                        onClick: {
                            upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                            true: {
                                printApp: {
                                    to: [printArea],
                                    merge: o(
                                        [{children: {sliceViewer: {children: {selectedList: {children: {items: _}}}}}}, [myContext, "App"]],
                                        [{children: {sliceViewer: {children: {selectedSliceVisualizer: {children: {sliceVisualizationArea: _}}}}}}, [myContext, "App"]]
                                    )
                                }
                            }
                        }
                    }
                }
            },
            loginSign: {
                description: {
                    "class": o(
                        { name: "FlipButton", value: [{showLoginScreen: _}, [myContext, "App"]] },
                        "RemoteConnectionStateIndicator",
                        "ShowHelpToolTip"
                    ),
                    context: {
                        helpToolTipText: "Login, logout or change account",
                        extHelpToolTipSrc: "helpTexts/login.html"
                    },
                    display: {
                        image: {
                            src: "design/img/ic_account_box_48px.svg",
                            size: "100%"
                        }
                    },
                    position: {
                        top: 0,
                        right: 32,
                        width: 24,
                        height: 24
                    }
                }
            },
            viewControl: {
                description: {
                    "class": o(
                        { name: "FlipButton", value: [{showNextLevelToolBar: _}, [me]] },
                        { name: "NextLevelToolBar", className: "ViewToolBar", offset: -4 }
                    ),
                    display: {
                        image: {
                            src: "design/img/ic_view_compact_48px.svg",
                            size: "100%"
                        },
                        hoverText: "Edit view"
                    },
                    position: {
                        top: 0,
                        width: 24,
                        right: 4,
                        height: 24
                    }
                }
            },
            helpControl: {
                description: {
                    "class": "HelpButton"
                }
            }
        }
    },

    HelpButton: o({
        "class": o(
            { name: "FlipButton", value: [{showHelpToolTip: _}, [me]] },
            "ShowHelpToolTip"
        ),
        context: {
            "*showHelpToolTip": true,
            helpToolTipText: "This controls the help tooltips. Click on it to turn them off. Click on the link below for general information.",
            extHelpToolTipSrc: "helpTexts/general.html"
        },
        display: {
            image: {
                src: "design/img/ic_help_48px.svg",
                size: "100%"
            }
        },
        position: {
            top: 0,
            width: 24,
            right: 60,
            height: 24
        }
    }, {
        qualifier: {showHelpToolTip: false},
        display: {
            opacity: 0.4
        }
    }, {
        qualifier: {showHelpToolTip: true},
        "class": "HelpToolTip",
        context: {
            close: [{extHelpSrc: _}, [myContext, "App"]]
        }
    }),

    ViewToolBarTextItem: {
        display: {
            text: {
                "class": "Font",
                fontSize: 10,
                value: "$text"
            }
        },
        position: {
            "class": { name: "RightOfSibling", sibling: "$sibling", distance: "$distance" },
            top: 0,
            bottom: 0,
            width: [displayWidth]
        }
    },

    ViewToolBarChoiceTextItem: {
        "class": o(
            "UnderlineChoice",
            { name: "MakeChoice", source: "$source", value: "$value" }
        ),
        display: {
            text: {
                "class": "Font",
                fontSize: 10,
                fontWeight: 700,
                value: "$text"
            }
        },
        position: {
            "class": { name: "RightOfSibling", sibling: "$sibling", distance: "$distance" },
            top: 0,
            bottom: 0,
            width: [displayWidth]
        }
    },

    ViewToolBar: {
        display: {
            background: "white"
        },
        children: {
            text1: {
                description: {
                    "class": { name: "ViewToolBarTextItem", text: "cc weighting:", sibling: "" },
                    position: {
                        left: 0
                    }
                }
            },
            choice1: {
                description: {
                    "class": {
                        name: "ViewToolBarChoiceTextItem",
                        sibling: "text1",
                        distance: 4,
                        text: "yes",
                        source: [{climateChangeWeighting: _}, [myContext, "App"]],
                        value: true
                    }
                }
            },
            text2: {
                description: {
                    "class": { name: "ViewToolBarTextItem", text: "/", sibling: "choice1" }
                }
            },
            choice2: {
                description: {
                    "class": {
                        name: "ViewToolBarChoiceTextItem",
                        sibling: "text2",
                        text: "no",
                        source: [{climateChangeWeighting: _}, [myContext, "App"]],
                        value: false
                    }
                }
            },
            text3: {
                description: {
                    "class": { name: "ViewToolBarTextItem", text: "value:", sibling: "choice2", distance: 16 }
                }
            },
            choice3: {
                description: {
                    "class": {
                        name: "ViewToolBarChoiceTextItem",
                        sibling: "text3",
                        distance: 4,
                        text: "absolute",
                        source: [{valueDisplayType: _}, [myContext, "App"]],
                        value: "absolute"
                    }
                }
            },
            text4: {
                description: {
                    "class": { name: "ViewToolBarTextItem", text: "/", sibling: "choice3" }
                }
            },
            choice4: {
                description: {
                    "class": {
                        name: "ViewToolBarChoiceTextItem",
                        sibling: "text4",
                        text: "percentage",
                        source: [{valueDisplayType: _}, [myContext, "App"]],
                        value: "percentage"
                    }
                }
            }
        },
        position: {
            width: 250,
            height: 24
        }
    },

    /// Underlines the text is chosen is true
    UnderlineChoice: o({
        context: {
            chosen: mustBeDefined
        }
    }, {
        qualifier: {chosen: true},
        display: {
            text: {
                textDecoration: "underline"
            }
        }
    }),

    /// Writes $value to $source on click; also defines context.chosen
    MakeChoice: {
        context: {
            chosen: [equal, "$source", "$value"]
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    setValue: {
                        to: "$source",
                        merge: "$value"
                    }
                }
            }
        }
    },

    /// When showNextLevelToolBar is true, this creates an intersection with the App
    /// area. It contains a body (with class $itemClass), and a tip. The area is
    /// positioned so that it preferably centers under the expression area; if
    /// that's not possible, the left side of the area stays to the left of the
    /// expression area, and the right side to the right, but always within
    /// App's boundaries. Distance between this area and the expressionOf can
    /// be set via $offset.
    /// Since it's an intersection, $itemClass can contain another child that
    /// inherits NextLevelToolBar. 
    NextLevelToolBar: {
        context: {
            "*showNextLevelToolBar": false
        },
        children: {
            nextLevelToolBar: {
                partner: [cond, [{showNextLevelToolBar: _}, [me]], {on: true, use: [myContext, "App"]}],
                description: {
                    independentContentPosition: false,
                    embedding: "referred",
                    children: {
                        tip: {
                            description: {
                                display: {
                                    triangle: {
                                        baseSide: "bottom",
                                        color: "white",
                                        stroke: "grey"
                                    }
                                },
                                position: {
                                    top: 0,
                                    height: 6,
                                    width: 5,
                                    center: {
                                        point1: { type: "horizontal-center", element: [expressionOf, [embedding]] },
                                        point2: { type: "horizontal-center" },
                                        equals: 0
                                    }
                                }
                            }
                        },
                        body: { // must specify height and width
                            description: {
                                "class": "$className",
                                display: {
                                    borderTopStyle: "solid",
                                    borderTopWidth: 1,
                                    borderTopColor: [{dividerColor: _}, [globalDefaults]],
                                    borderBottomStyle: "solid",
                                    borderBottomWidth: 1,
                                    borderBottomColor: [{dividerColor: _}, [globalDefaults]]
                                }
                            }
                        }
                    },
                    position: {
                        top: {
                            point1: { type: "bottom", element: [expressionOf] },
                            point2: { type: "top" },
                            equals: [replaceEmpty, "$offset", 0]
                        },
                        topAlignAboveBody: {
                            point1: { type: "top" },
                            point2: { type: "top", element: [{children: {body: _}}, [me]] },
                            equals: 5
                        },
                        leftToTheLeft: {
                            point1: { type: "left" },
                            point2: { type: "left", element: [expressionOf] },
                            min: 0,
                            priority: -1
                        },
                        leftAlignWithBody: {
                            point1: { type: "left" },
                            point2: { type: "left", element: [{children: {body: _}}, [me]] },
                            equals: 0
                        },
                        leftInsideEmbedding: {
                            point1: { type: "left", element: [embedding] },
                            point2: { type: "left" },
                            min: 2
                        },
                        rightToTheRight: {
                            point1: { type: "right", element: [expressionOf] },
                            point2: { type: "right" },
                            min: 0,
                            priority: -1
                        },
                        rightAlignWithBody: {
                            point1: { type: "right" },
                            point2: { type: "right", element: [{children: {body: _}}, [me]] },
                            equals: 0
                        },
                        rightInsideEmbedding: {
                            point1: { type: "right" },
                            point2: { type: "right", element: [embedding] },
                            min: 2
                        },
                        centerIfPossible: {
                            point1: { type: "horizontal-center" },
                            point2: { type: "horizontal-center", element: [expressionOf] },
                            min: 0,
                            priority: -2
                        },
                        bottomAlignWithBody: {
                            point1: { type: "bottom" },
                            point2: { type: "bottom", element: [{children: {body: _}}, [me]] },
                            equals: 0
                        }
                    },
                    stacking: {
                        aboveApp: {
                            lower: [embedding],
                            higher: [me]
                        }
                    }
                }
            }
        }
    },

    GlobalMenu: {
        "class": { name: "MarkArea", text: "X"},
        display: {
            boxShadow: {
                color: "grey",
                horizontal: 2,
                vertical: 0,
                blurRadius: 2,
                spread: 2
            }
        },
        position: {
            width: 300,
            height: 300
        }
    }
};

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
