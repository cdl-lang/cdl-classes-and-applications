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

// %%classfile%%: <saveViewDesignClasses.js>

var classes = {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows storing views of an application, loading them, modifying them, etc.
    // We distinguish between the previously saved views (savedViewData) and the currentView. the currentView may or may not originate from a view loaded
    // from the savedViewData. If it is, then loadedSavedViewUniqueID has a value.
    //
    // API:
    // 1. myApp
    // 2. myApp may define defaultCurrentView and freshView (default values provided herein).
    //    note that freshView is not written into savedViewData, but is kept as a separate, and calculated - not appData! - object.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SaveViewController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*saveAsMode": false,
                "^loadedSavedViewUniqueID": o()
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                "^savedViewData": o(),
                "^currentViewAD": o(),
                currentView: [mergeWrite,
                    [{ currentViewAD: _ }, [me]],
                    [{ myApp: { defaultCurrentView: _ } }, [me]]
                ],

                prefixForViewUniqueID: [{ myApp: { savedViewNameStrPrefix: _ } }, [me]],
                "^newViewCounterAD": o(),
                newViewCounter: [mergeWrite,
                    [{ newViewCounterAD: _ }, [me]],
                    1
                ],
                newViewUniqueID: [concatStr, o([{ prefixForViewUniqueID: _ }, [me]], [{ newViewCounter: _ }, [me]])],

                newViewObj: {
                    uniqueID: [{ newViewUniqueID: _ }, [me]],
                    name: [{ newViewUniqueID: _ }, [me]],
                    view: [{ currentView: _ }, [me]]
                },
                freshView: [cond,
                    [{ myApp: { freshView: _ } }, [me]],
                    o(
                        { on: true, use: [{ myApp: { freshView: _ } }, [me]] },
                        { on: false, use: {} }
                    )
                ],
                saveNewViewTooltipText: [concatStr, o([{ myApp: { addStr: _ } }, [me]], " ", [{ myApp: { viewEntityStr: _ } }, [me]])]
            },
            write: {
                onSaveViewControllerCtrlS: {
                    "class": "OnCtrlS"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: { loadedSavedViewUniqueID: true },
            context: {
                loadedSavedViewObj: [
                    { uniqueID: [{ loadedSavedViewUniqueID: _ }, [me]] },
                    [{ savedViewData: _ }, [me]]
                ],
                loadedSavedViewName: [{ loadedSavedViewObj: { name: _ } }, [me]],
                loadedView: [{ loadedSavedViewObj: { view: _ } }, [me]],
                loadedViewModified: [and,
                    [not, [{ saveAsMode: _ }, [me]]],
                    [notEqual,
                        [{ loadedView: _ }, [me]],
                        [{ currentView: _ }, [me]]
                    ]
                ]

            },
            write: {
                onSaveViewControllerCtrlS: {
                    // upon: see default above
                    true: {
                        saveCurrentViewOnLoadedView: {
                            to: [{ loadedView: _ }, [me]],
                            merge: atomic([{ currentView: _ }, [me]])
                        }
                    }
                }
            }
        },
        {
            qualifier: { loadedSavedViewUniqueID: false },
            write: {
                onSaveViewControllerCtrlS: {
                    // upon: see default above
                    true: {
                        "class": "NewViewActions"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackSaveViewController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                loadedSavedViewUniqueID: [{ saveViewController: { loadedSavedViewUniqueID: _ } }, [me]],
                saveAsMode: [{ saveViewController: { saveAsMode: _ } }, [me]],
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                saveViewController: [{ myApp: { saveViewController: _ } }, [me]],
                savedViewData: [{ saveViewController: { savedViewData: _ } }, [me]],
                currentView: [{ saveViewController: { currentView: _ } }, [me]],

                newViewCounter: [{ saveViewController: { newViewCounter: _ } }, [me]],
                newViewUniqueID: [{ saveViewController: { newViewUniqueID: _ } }, [me]],
                newViewObj: [{ saveViewController: { newViewObj: _ } }, [me]]
            }
        },
        {
            qualifier: { loadedSavedViewUniqueID: true },
            context: {
                loadedSavedViewName: [{ saveViewController: { loadedSavedViewName: _ } }, [me]],
                loadedViewModified: [{ saveViewController: { loadedViewModified: _ } }, [me]],
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SavedViewPane: o(
        { // variant-controller
            qualifier: "!",
            context: {
                horizontallyMinimized: [mergeWrite,
                    [{ horizontallyMinimizedAD: _ }, [me]],
                    true
                ]
            }
        },
        { // default
            "class": o("SavedViewPaneDesign", "GeneralArea", "AboveAllNonDraggedFacets", "BlockMouseEvent", "BelowAppZTop", "TrackSaveViewController"),
            context: {
                "^horizontallyMinimizedAD": o()
            },
            position: {
                attachTopToZoomBox: {
                    point1: {
                        element: [areaOfClass, "ZoomBox"],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                attachBottomToZoomBox: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "ZoomBox"],
                        type: "bottom"
                    },
                    equals: 0
                },
                attachLeftToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0//bFSAppPosConst.minimizedAppFrameWidth
                }
                // no right attachment to ZoomBox - it is juxtapositioned as the ZoomBox's left is equal to the width of the minimized SavedViewPane.
                // but when we expand the SavedViewPane, it expands to partially mask the ZoomBox (As it is z-higher - see stacking constraint below)
            },
            stacking: {
                aboveZoomBox: {
                    higher: [me],
                    lower: {
                        element: [areaOfClass, "ZoomBox"],
                        label: "zTop"
                    }
                }
            },
            children: {
                minimizationControl: {
                    description: {
                        "class": "SavedViewPaneMinimizationControl"
                    }
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewPaneExpandedWidth: _ } }, [globalDefaults]]]
            },
            children: {
                topPanel: {
                    description: {
                        "class": "SavedViewPaneTopPanel"
                    }
                },
                searchbox: {
                    description: {
                        "class": "SavedViewPaneSearchBox"
                    }
                },
                clearView: {
                    description: {
                        "class": "SavedViewPaneClearViewControl"
                    }
                },
                saveNewViewControl: {
                    description: {
                        "class": "SavedViewPaneNewViewControl"
                    }
                },
                savedViewPaneSaveAsControl: {
                    description: {
                        "class": "SavedViewPaneSaveAsControl"
                    }
                },
                mySavedViewsView: {
                    description: {
                        "class": "SavedViewsView"
                    }
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            position: {
                width: [{ leftOffset:_ }, [areaOfClass, "ZoomBox"]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    TrackSavedViewPane: o(
        { // variant-controller
            qualifier: "!"
        },
        { // default
            "class": "TrackSaveViewController",
            context: {
                mySavedViewPane: [areaOfClass, "SavedViewPane"],
                mySavedViewPaneMinimizationControl: [areaOfClass, "SavedViewPaneMinimizationControl"],
                mySearchBox: [areaOfClass, "SavedViewPaneSearchBox"],
                myClearViewControl: [areaOfClass, "SavedViewPaneClearViewControl"],
                myNewViewControl: [areaOfClass, "SavedViewPaneNewViewControl"],
                mySavedAsViewControl: [areaOfClass, "SavedViewPaneSaveAsControl"],
                mySavedViewsView: [areaOfClass, "SavedViewsView"]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    HorizontalMarginFromSavedViewPane: {
        context: {
            horizontalMarginFromSavedViewPane: [densityChoice, [{ fsAppSavedViewPosConst: { horizontalMarginFromSavedViewPane: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MarginWithinSavedViewPane: {
        context: {
            marginWithinSavedViewPane: [densityChoice, [{ fsAppSavedViewPosConst: { marginWithinSavedViewPane: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    HeightOfSavedViewPaneControl: {
        context: {
            heightOfSavedViewPaneControl: [densityChoice, [{ fsAppSavedViewPosConst: { heightOfSavedViewPaneControl: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    SavedViewPaneTopPanel: {
        "class": o("SavedViewPaneTopPanelDesign", "PaneTopPanel", "TrackSavedViewPane")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SavedViewPaneMinimizationControl: o(
        { // default
            "class": o("SavedViewPaneMinimizationControlDesign", "HorizontalMinimizationControl", "TrackSavedViewPane"),
            context: {
                // PaneMinimizationControl - override default values (inherited via HorizontalMinimizationControl) - additional values provided in Design class
                widthWhenMinimized: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],

                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { expandSavedViewsPane: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { viewEntityStrPlural: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                    [not, [{ horizontallyMinimized: _ }, [me]]] // the boolean for booleanStringFunc should be phrased in positive terms
                ],

                defaultHorizontallyMinimizedDesign: false // HorizontalMinimizationControlDesign param
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            context: {
                tooltipPositionBasedOnPointer: true
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "MarginWithinSavedViewPane",
            position: {
                right: [{ marginWithinSavedViewPane: _ }, [me]],
                top: [{ marginWithinSavedViewPane: _ }, [me]]
            }
        },
        {
            qualifier: {
                horizontallyMinimized: false,
                saveAsMode: true
            },
            write: {
                onSavedViewPaneMinimizationControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        lowerSaveAsFlag: {
                            to: [{ saveAsMode: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    SavedViewPaneClearViewControl: {
        "class": o("SavedViewPaneClearViewControlDesign", "GeneralArea", "SavedViewPaneControl", "TrackSavedViewPane"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { clearStr: _ } }, [me]],
                    [{ myApp: { viewEntityStr: _ } }, [me]]
                ),
                " "
            ],
            anchorAboveMe: [{ mySearchBox: _ }, [me]] // SavedViewPaneControl param
        },
        write: {
            onSavedViewPaneClearViewControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    clearLoaded: {
                        to: [{ loadedSavedViewUniqueID: _ }, [me]],
                        merge: o()
                    },
                    clearView: {
                        to: [{ currentView: _ }, [me]],
                        // this atomic() ensures that we do not merge freshView with whatever was in currentView, but rather override it
                        // this is important for the following scenario:
                        // 1. current view has a value set for x.
                        // 2. current view is saved.
                        // 3. the value of y is modified, and so now current view also has a value for y, which is not its default value.
                        // 4. if we now reload the saved view, which does not have a value stored for y, and it simply merges with the currentView,
                        //    then the value found there for y will be kept there. 
                        //    if, on the other hand, we write the atomic() savedView, the value of y will be erased from currentView, and the app
                        //    that looks at y using [mergeWrite] will simply revert to the default value it has for it, as intended.
                        merge: atomic([{ saveViewController: { freshView: _ } }, [me]])
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    SavedViewPaneNewViewControl: o(
        {
            qualifier: "!",
            context: {
                searchStrDefined: [{ mySearchBox: { searchStr: _ } }, [me]]
            }
        },
        { // default 
            "class": o("SavedViewPaneNewViewControlDesign", "GeneralArea", "SavedViewPaneControl", "Tooltipable", "AppNewElementContainer", "TrackSavedViewPane"),
            context: {
                labelText: [{ myApp: { viewEntityStr:_ } }, [me]],
                tooltipText: [{ saveViewController: { saveNewViewTooltipText: _ } }, [me]],

                // SavedViewPaneControl param
                anchorAboveMe: [{ myClearViewControl: _ }, [me]],
                defaultAttachRight: false,

                buttonDimension: [{ heightOfSavedViewPaneControl: _ }, [me]]
            },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { widthOfSaveNewViewAndSaveAsControls: _ } }, [globalDefaults]]],
                attachToSaveAsControl: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ mySavedAsViewControl: _ }, [me]],
                        type: "left"
                    },
                    equals: [{ marginWithinSavedViewPane: _ }, [me]]
                }
            },
            write: {
                onSavedViewPaneNewViewControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        "class": "NewViewActions",
                        scrollToTopOfListOfSavedView: { // where the new view will appear
                            to: [{ mySavedViewsView: { viewStaticPosOnDocCanvas: _ } }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: { searchStrDefined: true },
            write: {
                onSavedViewPaneNewViewControlClick: {
                    // upon: see default clause
                    true: {
                        resetSearchStr: {
                            to: [{ searchStrDefined: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Assumes TrackSavedViewPane is inherited.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewViewActions: {
        addToSavedViews: {
            to: [{ savedViewData: _ }, [me]],
            merge: o(
                [{ newViewObj: _ }, [me]],
                [{ savedViewData: _ }, [me]]
            )
        },
        loadThisNewView: {
            to: [{ loadedSavedViewUniqueID: _ }, [me]],
            merge: [{ newViewUniqueID: _ }, [me]]
        },
        incNewViewCounter: {
            to: [{ newViewCounter: _ }, [me]],
            merge: [plus, [{ newViewCounter: _ }, [me]], 1]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SavedViewPaneSaveAsControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: [{ savedViewData: _ }, [me]]
            }
        },
        { // default 
            "class": o("SavedViewPaneSaveAsControlDesign", "GeneralArea", "SavedViewPaneControl", "ControlModifiedPointer", "TrackSavedViewPane"),
            context: {
                disabled: [not, [{ enabled: _ }, [me]]], // instead of fighting the API of FSAppControlCoreBackgroundDesign...
                displayText: [cond,
                    [{ saveAsMode: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [concatStr,
                                o(
                                    [{ myApp: { saveStr: _ } }, [me]],
                                    " ",
                                    //[{ myApp: { viewEntityStr: _ } }, [me]],
                                    //" ",
                                    [{ myApp: { asStr: _ } }, [me]],
                                    "..."
                                )]
                        },
                        {
                            on: true,
                            use: [concatStr,
                                o(
                                    [{ myApp: { selectStr: _ } }, [me]],
                                    " ",
                                    [{ myApp: { viewEntityStr: _ } }, [me]])
                            ]
                        }
                    )
                ],

                // SavedViewPaneControl param:
                anchorAboveMe: [{ myClearViewControl: _ }, [me]],
                defaultAttachLeft: false
            },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { widthOfSaveNewViewAndSaveAsControls: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { enabled: true },
            write: {
                onSaveViewControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleSaveAsModeFlag: {
                            to: [{ saveAsMode: _ }, [me]],
                            merge: [not, [{ saveAsMode: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                enabled: true,
                saveAsMode: true
            },
            write: {
                onSavedViewPaneSaveAsControlMouseDownElsewhere: { // elsewhere of SavedView areas, or their scrollbar
                    upon: o(
                        escEvent,
                        [mouseDownNotHandledBy,
                            o(
                                [me], // see default clause onSaveViewControlMouseClick for handling by this area
                                [areaOfClass, "SavedView"],
                                [embeddedStar, // all elements of 
                                    [             // the scrollbar of the SavedViewsView
                                        { movableController: [{ mySavedViewsView: _ }, [me]] },
                                        [areaOfClass, "VerticalScrollbarContainer"]
                                    ]
                                ]
                            )
                        ]
                    ),
                    true: {
                        lowerSaveAsModeFlag: {
                            to: [{ saveAsMode: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    SavedViewPaneSearchBox: {
        "class": o("SavedViewPaneSearchBoxDesign", "GeneralArea", "MarginWithinSavedViewPane", "HorizontalMarginFromSavedViewPane",
            "HeightOfSavedViewPaneControl", "SearchBox", "TrackSavedViewPane"),
        context: {
            // SearchBox params
            searchStr: [mergeWrite,
                [{ myApp: { allSearchBoxesFields: { savedViewPaneSearchBox: _ } } }, [me]],
                o()
            ], // all searchStr are now centralized in FSApp.allSearchBoxesFields
            placeholderInputText: [concatStr,
                o(
                    [{ myApp: { searchStr: _ } }, [me]],
                    " ",
                    [{ myApp: { viewEntityStrPlural: _ } }, [me]]
                )
            ],
            realtimeSearch: true
        },
        position: {
            attachTopToSavedViewMinimizationControl: {
                point1: {
                    element: [{ mySavedViewPaneMinimizationControl: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ marginWithinSavedViewPane: _ }, [me]]
            },
            left: [{ horizontalMarginFromSavedViewPane: _ }, [me]],
            right: [{ horizontalMarginFromSavedViewPane: _ }, [me]],
            height: [{ heightOfSavedViewPaneControl: _ }, [me]]
        },
        write: {
            onSavedViewPaneSearchBoxOnSaveAsMode: {
                upon: [clickHandledBy,
                    [areaOfClass, "SavedViewPaneSaveAsControl"]
                ],
                true: {
                    resetCurrentSearchStr: {
                        to: [{ currentSearchStr: _ }, [me]],
                        merge: o()
                    }
                }
            }
        }

    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. anchorAboveMe: areaRef
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    SavedViewPaneControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultAttachLeft: true,
                defaultAttachRight: true
            }
        },
        { // default
            "class": o("GeneralArea", "ControlModifiedPointer", "HorizontalMarginFromSavedViewPane", "MarginWithinSavedViewPane", "HeightOfSavedViewPaneControl",
                "TrackSavedViewPane"),
            position: {
                height: [{ heightOfSavedViewPaneControl: _ }, [me]],
                attachToAnchorAboveMe: {
                    point1: {
                        element: [{ anchorAboveMe: _ }, [me]],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: [{ marginWithinSavedViewPane: _ }, [me]],
                }
            }
        },
        {
            qualifier: { defaultAttachLeft: true },
            position: {
                left: [{ horizontalMarginFromSavedViewPane: _ }, [me]]
            }
        },
        {
            qualifier: { defaultAttachRight: true },
            position: {
                right: [{ horizontalMarginFromSavedViewPane: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    SavedViewsView: o(
        { // default
            "class": o("SavedViewsViewDesign", "GeneralArea", "VerticalContMovableController",
                "HorizontalMarginFromSavedViewPane", "MarginWithinSavedViewPane", "TrackSavedViewPane"),
            context: {
                // VerticalContMovableController params
                beginningOfDocPoint: { label: "topOfSavedViewsDoc" },
                endOfDocPoint: { label: "bottomOfSavedViewsDoc" },

                blurRadius: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewNameBlurRadius: _ } }, [globalDefaults]]],
                marginAroundDoc: [cond,
                    [{ saveAsMode: _ }, [me]],
                    o(
                        { on: false, use: 0 },
                        { on: true, use: [{ blurRadius: _ }, [me]] }
                    )
                ]
            },
            position: {
                left: [{ horizontalMarginFromSavedViewPane: _ }, [me]],
                right: 0,
                attachTopToSaveAsControl: {
                    point1: {
                        element: [{ mySavedAsViewControl: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ marginWithinSavedViewPane: _ }, [me]]
                },
                bottom: [{ marginWithinSavedViewPane: _ }, [me]]
            },
            children: {
                savedViews: {
                    data: [identify,
                        { uniqueID: _ }, // identify by the uniqueID, not the name (which the user may change)
                        [ // select only those which match the currentSearchStr
                            {
                                name: s([{ mySearchBox: { currentSearchStr: _ } }, [me]]),
                                trashed: false
                            },
                            [{ savedViewData: _ }, [me]]
                        ]
                    ],
                    description: {
                        "class": "SavedView"
                    }
                },
                scrollbar: {
                    description: {
                        "class": "SavedViewsViewScrollbar"
                    }
                }
            },
            write: {
                onSavedViewsViewSearchStringInput: {
                    upon: [changed, [{ mySearchBox: { currentSearchStr: _ } }, [me]]],
                    true: {
                        setToTopOfView: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: { docLongerThanView: true },
            write: {
                onSavedViewsViewOnSaveAsControl: {
                    upon: [clickHandledBy,
                        [areaOfClass, "SavedViewPaneSaveAsControl"]
                    ],
                    true: {
                        scrollToBottom: { // perhaps scroll to the loaded SavedView, and not to the top?
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SavedView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                trashed: [{ myViewObj: { trashed: _ } }, [me]]
            }
        },
        { // default
            "class": o("SavedViewDesign", "GeneralArea", "MinWrap", "BlockMouseEvent", "TrashableElement", "TrackSavedViewPane"),
            context: {
                myViewObj: [{ param: { areaSetContent: _ } }, [me]],

                uniqueID: [{ myViewObj: { uniqueID: _ } }, [me]],
                name: [{ myViewObj: { name: _ } }, [me]],
                view: [{ myViewObj: { view: _ } }, [me]],

                semiCircleRadius: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewNameSemiCircleRadius: _ } }, [globalDefaults]]],
                blurRadius: [{ blurRadius: _ }, [embedding]]
            },
            children: {
                name: {
                    description: {
                        "class": "SavedViewName"
                    }
                }
            }
        },
        {
            qualifier: { trashed: false },
            "class": "TrashableSavedView"
        },
        {
            qualifier: { trashed: true },
            "class": "TrashedSavedView"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    TrashableSavedView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                loaded: [equal,
                    [{ uniqueID: _ }, [me]],
                    [{ loadedSavedViewUniqueID: _ }, [me]]
                ],
                loadedModified: [and, // or perhaps can be called 'lastLoaded'
                    [{ loaded: _ }, [me]], // i.e. i am the view loaded!
                    [{ loadedViewModified: _ }, [me]] // is the currentView is still identical to the savedView loaded.
                ]
            }
        },
        { // default
            "class": o("SavedViewDesign", "HorizontalMarginFromSavedViewPane", "IconableWhileDraggableOnMove", "MemberOfTopToBottomAreaOS"),
            context: {
                myView: [{ myViewObj: { view: _ } }, [me]],

                spacingFromPrev: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewNameVerticalSpacing: _ } }, [globalDefaults]]]
            },
            position: {
                height: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewHeight: _ } }, [globalDefaults]]]
            },
            write: {
                onTrashableSavedViewMouseClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        setAsLoaded: {
                            to: [{ loadedSavedViewUniqueID: _ }, [me]],
                            merge: [{ uniqueID: _ }, [me]]
                        }
                        // additional actions in variants below
                    }
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                labelTopOfSavedViewsDoc: { // define the label in SavedViewsView
                    point1: { element: [embedding], label: "topOfSavedViewsDoc" },
                    point2: { type: "top" },
                    equals: [{ marginAroundDoc: _ }, [embedding]]
                }
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                labelBottomOfSavedViewsDoc: { // define the label in SavedViewsView
                    point1: { type: "bottom" },
                    point2: { element: [embedding], label: "bottomOfSavedViewsDoc" },
                    equals: [{ marginAroundDoc: _ }, [embedding]]
                }
            }
        },
        {
            qualifier: { saveAsMode: false },
            "class": "DraggableToTrashElement",
            context: {
                // DraggableToTrashElement param
                draggingToTrash: [{ dragged: _ }, [me]]
            },
            position: {
                right: 0
            },
            write: {
                onTrashableSavedViewMouseClick: {
                    // see default clause above
                    true: {
                        // loadedSavedViewUniqueID: see default clause above
                        loadView: {
                            to: [{ currentView: _ }, [me]],
                            // this atomic() ensures that we do not merge the savedViewData with whatever was in currentViewObj, but rather override it
                            // this is important for the following scenario:
                            // 1. current view has a value set for x.
                            // 2. current view is saved.
                            // 3. the value of y is modified, and so now current view also has a value for y, which is not its default value.
                            // 4. if we now reload the saved view, which does not have a value stored for y, and it simply merges with the currentView,
                            //    then the value found there for y will be kept there. 
                            //    if, on the other hand, we write the atomic() savedView, the value of y will be erased from currentView, and the app
                            //    that looks at y using [mergeWrite] will simply revert to the default value it has for it, as intended.
                            merge: atomic([{ myView: _ }, [me]])
                        }
                    }
                },
                onTrashableSavedViewOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        trashView: {
                            to: [{ trashed: _ }, [me]],
                            merge: true
                        },
                        selectTrashSavedViewTab: { // if the trash will be opened now, it will be on the saved view tab
                            to: [{ appTrash: { selectedTab: _ } }, [me]],
                            merge: [{ appTrash: { savedViewTabData: _ } }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                saveAsMode: false,
                loaded: true
            },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { loadedSavedViewWidth: _ } }, [globalDefaults]]],
            },
            write: {
                onTrashableSavedViewOnAct: {
                    // upon: see { saveAsMode: false } variant above
                    true: {
                        markAsNoLongerLoadedView: {
                            to: [{ loadedSavedViewUniqueID: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            },
            children: {
                patchToZoomBoxOranment: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "LoadedSavedViewPatchToZoomBoxOrnament"
                    }
                }
            }
        },
        {
            qualifier: {
                saveAsMode: false,
                loaded: false
            },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { nonLoadedSavedViewWidth: _ } }, [globalDefaults]]],
            }
        },
        {
            qualifier: { saveAsMode: true },
            position: {
                width: [densityChoice, [{ fsAppSavedViewPosConst: { nonLoadedSavedViewWidth: _ } }, [globalDefaults]]],
                right: [densityChoice, [{ fsAppSavedViewPosConst: { savedViewNameRightMarginOnSaveAs: _ } }, [globalDefaults]]]
            },
            write: {
                onTrashableSavedViewMouseClick: {
                    // see default clause above
                    true: {
                        // loadedSavedViewUniqueID: see default clause above
                        saveCurrentViewOnMyView: {
                            to: [{ myView: _ }, [me]],
                            merge: atomic([{ currentView: _ }, [me]])
                        },
                        lowerSaveAsFlag: {
                            to: [{ saveAsMode: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { loadedModified: true },
            children: {
                modificationIndicator: {
                    description: {
                        "class": "LoadedSavedViewModificationIndicator"
                    }
                }
            }
        },
        {
            qualifier: { createIconWhileInOperation: true },
            children: {
                iconWhileInOperation: {
                    // see IconableWhileDraggableOnMove for partner definition
                    description: {
                        "class": "SavedViewDragged"
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable
                    description: {
                        "class": "TrashSavedViewModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    TrashedSavedView: {
        context: {
            myView: [embedding], // don't confuse the saved view with this 'myView', which rfers to the view of the wrap-around controller!!
            // Override WrapAround params (via TrashableElement)
            waController: [areaOfClass, "TrashedSavedViewsDoc"]
        },
        position: {
            width: [densityChoice, [{ fsAppSavedViewPosConst: { trashedSavedViewWidth: _ } }, [globalDefaults]]]
            // height: determined by SavedView and its embedded areas
        },
        children: {
            untrashControl: {
                description: {
                    "class": "TrashedSavedViewUntrashControlAddendum"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    TrashedSavedViewUntrashControlAddendum: {
        "class": "TrackSavedViewPane",
        context: {
            myViewObj: [{ myViewObj: _ }, [embedding]],
            myUntrashedViewObj: [merge, // place first in savedViewData, with trashed set to false
                { trashed: false },
                [{ myViewObj: _ }, [me]]
            ]
        },
        write: {
            onUntrashControlClick: {
                // upon: defined in untrashControl
                true: {
                    setUntrashedAsFirst: {
                        to: [{ savedViewData: _ }, [me]],
                        merge: o(
                            [{ myUntrashedViewObj: _ }, [me]],
                            [ // remove from its previous location in savedViewData
                                n({ uniqueID: [{ myViewObj: { uniqueID: _ } }, [me]] }),
                                [{ savedViewData: _ }, [me]]
                            ]
                        )
                    },
                    loadUntrashedViewUniqueID: {
                        to: [{ loadedSavedViewUniqueID: _ }, [me]],
                        merge: [{ myViewObj: { uniqueID: _ } }, [me]]
                    },
                    loadUntrashedView: {
                        to: [{ currentView: _ }, [me]],
                        merge: atomic([{ myViewObj: { view: _ } }, [me]])
                    },
                    scrollToTopOfListOfSavedView: { // where the untrashed view will appear
                        to: [{ mySavedViewsView: { viewStaticPosOnDocCanvas: _ } }, [me]],
                        merge: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    LoadedSavedViewPatchToZoomBoxOrnament: {
        "class": o("LoadedSavedViewPatchToZoomBoxOrnamentDesign", "GeneralArea", "Icon"),
        context: {
            mySavedView: [expressionOf],
            mySavedViewName: [
                { mySavedView: [{ mySavedView:_ }, [me]] },
                [areaOfClass, "SavedViewName"]
            ],
            mySavedViewNameTooltip: [
                { myTooltipable: [{ mySavedViewName:_ }, [me]] },
                [areaOfClass, "Tooltipable"]
            ],
            mySavedViewsView: [{ mySavedView: { mySavedViewsView: _ } }, [me]]
        },
        independentContentPosition: true,
        position: {
            attachLeft: {
                point1: { type: "left" },
                point2: { element: [{ mySavedView: _ }, [me]], type: "right", content: true },
                equals: 0
            },
            lcToLf: {
                point1: { type: "left" },
                point2: { type: "left", content: true },
                equals: 0
            },
            attachRight: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "left", content: true },
                equals: 0
            },
            rcToRf: {
                point1: { type: "right", content: true },
                point2: { type: "right" },
                equals: 0
            },
            // setting limits on the tf and bt:
            notHigherThanMySavedViewTop: {
                point1: { element: [{ mySavedView: _ }, [me]], type: "top" },
                point2: { type: "top" },
                min: 0
            },
            notHigherThanSavedViewsViewTop: {
                point1: { element: [{ mySavedViewsView: _ }, [me]], type: "top" },
                point2: { type: "top" },
                min: 0
            },
            eitherEqualsTopOfMySavedViewTop: {
                point1: { element: [{ mySavedView: _ }, [me]], type: "top" },
                point2: { type: "top" },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "patchTopFrame" }
            },
            orEqualsTopOfSavedViewsViewTop: {
                point1: { element: [{ mySavedViewsView: _ }, [me]], type: "top" },
                point2: { type: "top" },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "patchTopFrame" }
            },
            notLowerThanMySavedViewBottom: {
                point1: { type: "bottom" },
                point2: { element: [{ mySavedView: _ }, [me]], type: "bottom" },
                min: 0
            },
            notLowerThanSavedViewsViewBottom: {
                point1: { type: "bottom" },
                point2: { element: [{ mySavedViewsView: _ }, [me]], type: "bottom" },
                min: 0
            },
            eitherEqualsBottomOfMySavedViewBottom: {
                point1: { element: [{ mySavedView: _ }, [me]], type: "bottom" },
                point2: { type: "bottom" },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "patchBottomFrame" }
            },
            orEqualsBottomOfSavedViewsViewBottom: {
                point1: { element: [{ mySavedViewsView: _ }, [me]], type: "bottom" },
                point2: { type: "bottom" },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "patchBottomFrame" }
            },

            // and position tc and bc to match mySavedView, so that this area's border would get clipped when scrolled out of view.
            attachTcToMySavedViewTc: {
                point1: { element: [{ mySavedView: _ }, [me]], type: "top", content: true },
                point2: { type: "top", content: true },
                equals: 0
            },
            attachBcToMySavedViewBc: {
                point1: { element: [{ mySavedView: _ }, [me]], type: "bottom", content: true },
                point2: { type: "bottom", content: true },
                equals: 0
            }
        },
        stacking: {
            aboveZoomBoxOrnament: {
                higher: [me],
                lower: [areaOfClass, "ZoomBoxOrnament"]
            },
            belowSavedNameTooltip: {
                higher: [{ mySavedViewNameTooltip:_ }, [me]],
                lower: [me]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SavedViewDragged: {
        "class": o("SavedViewDraggedDesign", "DraggableIcon", "DisplayDimension"),
        context: {
            mySavedView: [expressionOf],
            displayText: [{ mySavedView: { name: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SavedViewName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                trashed: [{ mySavedView: { trashed: _ } }, [me]],
                loaded: [{ mySavedView: { loaded: _ } }, [me]],
                loadedModified: [{ mySavedView: { loadedModified: _ } }, [me]]
            }
        },
        { // default
            "class": o(
                "SavedViewNameDesign",
                "GeneralArea",
                "EditableTooltipable",
                "TrackSavedViewPane"
            ),
            context: {
                mySavedView: [embedding],
                name: [{ mySavedView: { myViewObj: { name: _ } } }, [me]],
                displayText: [{ name: _ }, [me]],

                // SavedView areas which are trashed are recreated separately when opening the trash to view its contents.
                // in other words, unlike facets and overlays, where the trashed element is the same area that was before, with savedViews, these are
                // two different areas - mainly, because saved views cannot be dragged-to-reorder or dragged-to-change-expansion-state.
                // what this means is that we need to store the relevant AD, including the tooltipText, separately from the area, and that we do here, 
                // but turning tooltipTextAppData into ->AD to an attribute in the data object.

                tooltipTextAppData: [{ mySavedView: { myViewObj: { tooltipText: _ } } }, [me]],
                /*
                tooltipDisplaysMeaningfulInfo: o( // override default definition 
                                                 [{ defaultTooltipDisplaysMeaningfulInfo:_ }, [me]],
                                                 // other meaningful info scenarios: content spills over, or there are meaningful selections to display
                                                 [{ contentSpillsOver:_ }, [me]]
                                                )
                */
            },
            position: {
                left: [{ mySavedView: { semiCircleRadius: _ } }, [me]],
                right: 0,
                height: [displayHeight],
                "vertical-center": 0
            }
        },
        {
            qualifier: { editInputText: false },
            "class": "ContentSpillsOver",
            context: {
                enableTextOverflowTooltip: false // override TextOverflowEllipsisDesign param, so as not to interfere with the tooltipText def in this class
            }
        },
        {
            qualifier: { tooltipEditInputText: false },
            context: {
                tooltipText: [concatStr,
                    o(
                        [cond,
                            [{ contentSpillsOver: _ }, [me]],
                            o({ on: true, use: [{ name: _ }, [me]] })
                        ],
                        [cond,
                            [{ contentSpillsOver: _ }, [me]], // ie there is a name on display
                            o({ on: true, use: "\n" }) // so put a newline in
                        ],
                        [{ tooltipTextCore: _ }, [me]]
                    )
                ]
            }
        },
        {
            qualifier: {
                trashed: false,
                saveAsMode: false,
                loaded: true,
                loadedModified: false
            },
            "class": o("ModifyPointerClickable", "TextInput"),
            context: {
                // TextInput params
                mouseEventToEdit: "DoubleClickExpired",
                inputTextValuesAlreadyUsed: [
                    n([{ name: _ }, [me]]),
                    [{ savedViewData: { name: _ } }, [me]]
                ],
                placeholderInputText: [concatStr,
                    o(
                        "<",
                        [{ myApp: { viewEntityStr: _ } }, [me]],
                        " ",
                        [{ myApp: { viewEntityStr: _ } }, [me]],
                        ">"
                    )
                ],
                inputAppData: [{ name: _ }, [me]],
                rememberTextWasEdited: true, // override default
                textWasEdited: [{ mySavedView: { myViewObj: { nameWasEdited: _ } } }, [me]], // an alternate writable ref to the default provided in TextInput

                // override TextInput default value, to allow the SavedView to be "dragged" (IconableWhileDraggableOnMove): don't block mouse down when text not edited!
                blockMouseDown: [{ editInputText: _ }, [me]]
            }
        },
        {
            qualifier: { trashed: true },
            "class": "TrashedElementName",
            context: {
                myTrashable: [{ mySavedView:_ }, [me]],
                tooltipEditable: false
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedSavedViewModificationIndicator: {
        "class": o("LoadedSavedViewModificationIndicatorDesign", "GeneralArea"),
        context: {
            displayText: "*"
        },
        position: {
            "content-width": [displayWidth],
            top: 0,
            bottom: 0,
            positionHorizontally: {
                pair1: {
                    point1: { element: [embedding], type: "left" },
                    point2: { type: "left" }
                },
                pair2: {
                    point1: { type: "right" },
                    point2: { element: [{ children: { name: _ } }, [embedding]], type: "left" }
                },
                ratio: 1
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SavedViewsViewScrollbar: {
        "class": "VerticalScrollbarContainer",
        context: {
            movableController: [embedding],
            attachToView: "beginning",
            attachToViewOverlap: true,
            showOnlyWhenInView: true,
            marginAroundScrollbar: 0,
            scrollbarBorderWidth: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashSavedViewModalDialog: {
        "class": "TrashModalDialog",
        children: {
            textDisplay: {
                description: {
                    "class": "TrashSavedViewModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "TrashSavedViewModalDialogOKControl"
                }
            }
            // cancelControl defined in OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the text that appears in the modal dialog confirming the Trashing of an overlay. 
    // It inherits TrashOverlayModalDialogElement, and is embedded in TrashOverlayModalDialog.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashSavedViewModalDialogText: {
        "class": "OKCancelDialogText",
        context: {
            mySavedView: [{ myModalDialogable: _ }, [me]],
            displayText: [
                [{ myApp: { trashDialogBoxConfirmationTextGenerator: _ } }, [me]],
                [{ mySavedView: { name: _ } }, [me]],
                [{ myApp: { viewEntityStr: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the OK control in the modal dialog confirming the Trashing of a saved view 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    TrashSavedViewModalDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugSavedViews: {
        "class": o("DebugDisplayViewAndTitle", "TrackSaveViewController"),
        context: {
            title: "Saved Views",
            debugDoc: [{ savedViewData: _ }, [me]], // DebugDisplayDoc param

            // Draggable params
            draggableInitialX: 1000
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugCurrentView: {
        "class": o("DebugDisplayViewAndTitle", "TrackSaveViewController"),
        context: {
            title: [concatStr, o("Current", " ", [{ myApp: { viewEntityStr: _ } }, [me]])],
            debugDoc: [{ currentView: _ }, [me]],

            // Draggable params
            draggableInitialX: 10
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplayViewMinimizationControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minimized: [{ minimized: _ }, [embedding]]
            }
        },
        { // default
            "class": "GeneralArea",
            write: {
                onDebugDisplayViewMinimizationControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleMinimized: {
                            to: [{ minimized: _ }, [me]],
                            merge: [not, [{ minimized: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            "class": "OnHoverFrameDesign",
            position: {
                width: 15,
                height: 15,
                top: 2,
                right: 2
            },
            display: {
                image: {
                    src: "%%image:(closeControl.svg)%%",
                    size: "100%"
                }
            }
        },
        {
            qualifier: { minimized: true },
            position: {
                frame: 0
            }
        }
    )
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of library
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
};
