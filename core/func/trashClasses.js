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

// %%classfile%%: <trashDesignClasses.js>

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class represents the area over which, when in the open state, overlays in the Trashed state are positioned.
    // It inherits BottomView. it embeds the TrashDisplay, which displays an icon of a trash can.
    // 
    // this class stores its open state as appData.
    //
    // when a trashable visible overlay overlaps the AppTrash, it gives a visual indication, so as to help the user determine when a MouseUp would result in the completion of a 
    // drag&drop trashing of an overlay.
    // 
    // API:
    // 1. horizontalSpacingFromMinimizedOverlaysView (when trash is closed)
    // 2. verticalSpacingAboveAppTrash
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    AppTrash: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^open": false,
                overlayTabSelected: [
                    [{ selectedTab: _ }, [me]],
                    [{ overlayTabData: _ }, [me]]
                ],
                facetTabSelected: [
                    [{ selectedTab: _ }, [me]],
                    [{ facetTabData: _ }, [me]]
                ],
                savedViewTabSelected: [
                    [{ selectedTab: _ }, [me]],
                    [{ savedViewTabData: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("AppTrashDesign", "GeneralArea", "TrackOverlayMaximization"),
            context: {
                overlayTabData: [{ myApp: { overlayEntityStrPlural: _ } }, [me]],
                facetTabData: [{ myApp: { facetEntityStrPlural: _ } }, [me]],
                savedViewTabData: [{ myApp: { viewEntityStrPlural: _ } }, [me]],
                tabData: o(
                    [{ overlayTabData: _ }, [me]],
                    [{ facetTabData: _ }, [me]],
                    [{ savedViewTabData: _ }, [me]]
                ),
                defaultSelectedTab: [first, [{ tabData: _ }, [me]]],
                "^selectedTabAD": o(),
                selectedTab: [mergeWrite,
                    [{ selectedTabAD:_ }, [me]],
                    [{ defaultSelectedTab:_ }, [me]]
                ],

                verticalSpacingAboveAppTrash: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
                hoveringOverTrash: [and,
                    [overlap, [{ children: { trashDisplay: _ } }, [me]], [pointer]],
                    [
                        { draggingToTrash: true },
                        [areaOfClass, "DraggableToTrashElement"]
                    ]
                ],
                horizontalOffsetFromZoomBoxOrnament: bFSAppPosConst.marginFromZoomBoxOrnament
            },
            position: {
                anchorRightRelativeToZoomBoxOrnament: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "right"
                    },
                    equals: [{ horizontalOffsetFromZoomBoxOrnament: _ }, [me]]
                },
                attachToBottomOfZoomBoxOrnament: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "bottom", content: true },
                    equals: 0
                }
            },
            children: {
                trashDisplay: {
                    description: {
                        "class": "TrashDisplay"
                    }
                }
            },
            stacking: {
                aboveZoomBoxOrnament: {
                    higher: [me],
                    lower: [areaOfClass, "ZoomBoxOrnament"]
                }
            }
        },
        {
            qualifier: { open: false },
            context: {
                horizontalSpacingFromMinimizedOverlaysView: bFSAppPosConst.horizontalOffsetMinimizedOverlaysViewToClosedAppTrash
            },
            position: {
                height: bFSAppPosConst.bottomViewHeight,
                attachHorizontallyToMinimizedOverlaysView: {
                    point1: {
                        element: [areaOfClass, "MinimizedOverlaysView"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalSpacingFromMinimizedOverlaysView: _ }, [me]]
                },
                attachVerticallyToAreaAbove: compileMinimizedOverlays ?
                    {} :
                    {
                        point1: {
                            element: [areaOfClass, "ExpandedFacetViewPane"],
                            type: "bottom"
                        },
                        point2: {
                            type: "top"
                        },
                        equals: [{ verticalSpacingAboveAppTrash: _ }, [me]]
                    }
            }
        },
        {
            qualifier: { open: true },
            context: {
                tabNameWidth: [{ bFSAppTrashPosConst: { tabNameWidth: _ } }, [globalDefaults]],

                horizontalOffsetFromZoomBoxOrnament: 0
            },
            position: {
                anchorLeftRelativeToZoomBoxOrnament: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalOffsetFromZoomBoxOrnament: _ }, [me]]
                },
                attachVerticallyToAreaAbove: {
                    point1: {
                        element: compileMinimizedOverlays ? [areaOfClass, "MinimizedOverlaysView"] : [areaOfClass, "ExpandedFacetViewPane"],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ verticalSpacingAboveAppTrash: _ }, [me]]
                }
            },
            children: {
                tabs: {
                    data: [{ tabData: _ }, [me]],
                    description: {
                        "class": "TrashTab"
                    }
                },
                selectedTabView: {
                    description: {
                        "class": "TrashTabView"
                    }
                },
                trashTabViewHandle: {
                    description: {
                        "class": "TrashTabViewHandle"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The trash icon displayed on, and embedded in, the AppTrash class.
    // This class can be clicked to toggle the AppTrash open/closed
    //
    // API:
    // 2. verticalRefPoint: "vertical-center" by default
    // 3. offsetFromVerticalRefPoint: default provided. note the offset is *to* the AppTrash's vertical reference point, and not *from* it: 
    //    a positive value for offsetFromViewVerticalRefPoint will position the inheriting area above it's view's vertical reference point.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                open: [{ appTrashOpen: _ }, [me]],
                trashEmpty: [not,
                    [
                        { trashed: _ },
                        o(
                            [{ myApp: { overlayData: _ } }, [me]],
                            [{ myApp: { facetData: _ } }, [me]],
                            [{ myApp: { saveViewController: { savedViewData: _ } } }, [me]]
                        )
                    ]
                ],
                hoveringOverTrash: [{ appTrash: { hoveringOverTrash: _ } }, [me]]
            }
        },
        { // default
            "class": o("TrashDisplayDesign", "TooltipableControl", "TrackAppTrash"),
            context: {
                dimension: [densityChoice, [{ bFSAppTrashPosConst: { trashDisplayDimension: _ } }, [globalDefaults]]],
                tooltipText: [concatStr,
                    o(
                        [cond,
                            [{ open: _ }, [me]],
                            o(
                                { on: true, use: "Close" },
                                { on: false, use: "Open" }
                            )
                        ],
                        " ",
                        "Trash"
                    )
                ]
            },
            position: {
                right: bFSAppPosConst.marginAroundTrashDisplay,
                width: [{ dimension: _ }, [me]],
                height: [{ dimension: _ }, [me]]
            },
            write: {
                onTrashDisplayClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleOpen: {
                            to: [{ open: _ }, [me]],
                            merge: [not, [{ open: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { open: false },
            position: {
                left: bFSAppPosConst.marginAroundTrashDisplay,
                bottom: [densityChoice, [{ bFSAppTrashPosConst: { trashDisplayBottomMargin: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { open: true },
            position: {
                "vertical-center": [{ bFSAppTrashPosConst: { offsetOfTrashDisplayFromEmbeddingVerticalCenter: _ } }, [globalDefaults]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackAppTrash: o(
        { // variant-controller
            qualifier: "!",
            context: {
                appTrashOpen: [{ appTrash: { open: _ } }, [me]],
                trashOverlayTabSelected: [{ appTrash: { overlayTabSelected: _ } }, [me]],
                trashFacetTabSelected: [{ appTrash: { facetTabSelected: _ } }, [me]],
                trashSavedViewTabSelected: [{ appTrash: { savedViewTabSelected: _ } }, [me]],

                trashModalDialogOn: [areaOfClass, "TrashModalDialog"]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                appTrash: [areaOfClass, "AppTrash"],
                trashTabView: [areaOfClass, "TrashTabView"],
                trashTabViewHandle: [areaOfClass, "TrashTabViewHandle"],
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashTab: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectedTab: [
                    [{ appTrash: { selectedTab: _ } }, [me]],
                    [{ tabData: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("TrashTabDesign", "GeneralArea", "MemberOfLeftToRightAreaOS", "TrackAppTrash"),
            context: {
                tabData: [{ param: { areaSetContent: _ } }, [me]],
                areaOS: [{ appTrash: { children: { tabs: _ } } }, [me]],
                displayText: [{ tabData: _ }, [me]],
                heightOfUnselectedTab: [densityChoice, [{ bFSAppTrashPosConst: { heightOfUnselectedTab: _ } }, [globalDefaults]]],
                /*[densityChoice, [{ bFSAppTrashPosConst: { tabNameHeight: _ } }, [globalDefaults]]],*/
                incHeightOfSelectedTab: [densityChoice, [{ bFSAppTrashPosConst: { incHeightOfSelectedTab: _ } }, [globalDefaults]]],
            },
            children: {
                name: {
                    description: {
                        "class": "TrashTabName"
                    }
                }
            },
            position: {
                top: [densityChoice, [{ bFSAppTrashPosConst: { marginAboveTab: _ } }, [globalDefaults]]]/*,
                width: [densityChoice, [{ bFSAppTrashPosConst: { tabNameWidth: _ } }, [globalDefaults]]]*/
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                attachLeftToTabViewLeft: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [{ trashTabView: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { selectedTab: false },
            position: {
                height: [{ heightOfUnselectedTab: _ }, [me]]
            },
            write: {
                onTrashTabClick: {
                    "class": "OnMouseClick",
                    true: {
                        setMeAsSelectedTab: {
                            to: [{ appTrash: { selectedTab: _ } }, [me]],
                            merge: [{ tabData: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { selectedTab: true },
            position: {
                height: [plus, [{ heightOfUnselectedTab: _ }, [me]], [{ incHeightOfSelectedTab: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashTabName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectedTab: [{ selectedTab: _ }, [embedding]]
            }
        },
        { // default
            "class": o("TrashTabNameDesign", "GeneralArea", "TrackAppTrash"),
            context: {
                displayText: [{ displayText: _ }, [embedding]]
            },
            position: {
                top: 0,
                bottom: 0,
                width: [{ appTrash: { tabNameWidth: _ } }, [me]]
                // left/right constraints - see the Design class.            
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashTabView: o(
        { // default
            "class": o("GeneralArea", "ExpandableTop", "VerticalScrollableWrapAroundView", "TrackAppTrash"),
            context: {
                attachScrollbarOn: "end", // override VerticalScrollableWrapAroundView default

                heightOfTrashedElement: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]],
                verticalSpacingBetweenTrashedElements: [densityChoice, [{ bFSAppTrashPosConst: { trashedElementVerticalSpacing: _ } }, [globalDefaults]]],
                // ExpandableTop params:
                initialExpandableHeight: [plus,
                    [{ heightOfTrashedElement:_ }, [me]],
                    [mul, 2, [{ verticalSpacingBetweenTrashedElements:_ }, [me]]]
                ],
                // override the default handleDraggingPriority of strongerThanDefaultPressure, as it needs to overcome the expansionary force applied
                // by the Slider and by the OverlaySolutionSetView to take up as much vertical space as possible - these attempt to expand at a priority
                // of strongerThanDefaultPressure, so we need to either remove them while we drag here, or simply drag with greater force. we do the latter
                handleDraggingPriority: positioningPrioritiesConstants.weakerThanDefault,
                lengthAxisHandleAnchor: atomic({
                    element: [{ trashTabViewHandle: _ }, [me]],
                    type: "top"
                }),
                lowHTMLGirthHandleAnchor: atomic({
                    element: [{ trashTabViewHandle: _ }, [me]],
                    type: "left"
                }),
                highHTMLGirthHandleAnchor: atomic({
                    element: [{ trashTabViewHandle: _ }, [me]],
                    type: "right"
                }),


                wheelScrollInPixels: [plus, // override default UpDownOnArrowOrWheel param (via ContMovableController and MatrixView)
                    // this ensures that a turn of the mouse wheel will feel like a "next"/"prev" of matrix cells.
                    [{ heightOfTrashedElement:_ }, [me]],
                    [{ verticalSpacingBetweenTrashedElements: _ }, [me]]
                ] 
            },
            position: {
                attachToFrozenFacetViewPane: {
                    point1: {
                        element: [areaOfClass, "FrozenFacetViewPane"],
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: 0
                },
                attachToTrashDisplay: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "TrashDisplay"],
                        type: "left"
                    },
                    equals: bFSAppPosConst.marginAroundTrashDisplay
                },
                // top: see TrashTabViewHandle for constraint
                bottom: 0,
                minHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    min: [{ initialExpandableHeight: _ }, [me]]
                }
            }
        },
        {
            qualifier: { trashOverlayTabSelected: true },
            children: {
                trashedOverlaysDoc: {
                    description: {
                        "class": "TrashedVisibleOverlaysDoc"
                    }
                }
            }
        },
        {
            qualifier: { trashFacetTabSelected: true },
            children: {
                trashedFacetsDoc: {
                    description: {
                        "class": "TrashedFacetsDoc"
                    }
                }
            }
        },
        {
            qualifier: { trashSavedViewTabSelected: true },
            children: {
                trashedFacetsDoc: {
                    description: {
                        "class": "TrashedSavedViewsDoc"
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    TrashedElementsDoc: {
        "class": "VerticalScrollableWrapAroundDoc",
        context: {
            // override default VerticalScrollableWrapAroundDoc params: 
            wrapAroundSpacing: [densityChoice, [{ bFSAppTrashPosConst: { trashedElementHorizontalSpacing: _ } }, [globalDefaults]]],
            wrapAroundSecondaryAxisSpacing: [{ verticalSpacingBetweenTrashedElements:_ }, [embedding]]
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // Note that this document does not actually embed the trashed VisibleOverlays, but rather defines its dimensions based on them: it is a 'virtual' document   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedVisibleOverlaysDoc: {
        "class": "TrashedElementsDoc",
        context: {
            // override default VerticalScrollableWrapAroundDoc params: 
            wrapArounds: [{ myApp: { trashedOverlays: { myVisibleOverlay: _ } } }, [me]],
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // Note that this document does not actually embed the trashed facets, but rather defines its dimensions based on them: it is a 'virtual' document   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedFacetsDoc: {
        "class": "TrashedElementsDoc",
        context: {
            // override default VerticalScrollableWrapAroundDoc params: 
            wrapArounds: [{ myApp: { trashedFacets: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedSavedViewsDoc: {
        "class": "TrashedElementsDoc",
        context: {
            // override default VerticalScrollableWrapAroundDoc params: 
            wrapArounds: [{ children: { trashedViews: _ } }, [me]],

            saveViewController: [{ myApp: { saveViewController: _ } }, [me]],
            savedViewData: [{ saveViewController: { savedViewData: _ } }, [me]]
        },
        children: {
            trashedViews: {
                data: [identify,
                    { uniqueID: _ }, // identify by the uniqueID, not the name (which the user may change)
                    [ // select only those which match the currentSearchStr
                        { trashed: true },
                        [{ savedViewData: _ }, [me]]
                    ]
                ],
                description: {
                    "class": "SavedView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashTabViewHandle: {
        "class": o("TrashTabViewHandleDesign", "GeneralArea", "TrackAppTrash"),
        position: {
            attachLeftToTabViewLeft: {
                point1: {
                    type: "left"
                },
                point2: {
                    element: [{ trashTabView: _ }, [me]],
                    type: "left"
                },
                equals: 0
            },
            attachRightToTabViewRight: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ trashTabView: _ }, [me]],
                    type: "right"
                },
                equals: 0
            },
            attachToSelectedTab: {
                point1: {
                    element: [{ selectedTab: true }, [areaOfClass, "TrashTab"]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            attachBottomToTabViewTop: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ trashTabView: _ }, [me]],
                    type: "top"
                },
                equals: [densityChoice, [{ bFSAppTrashPosConst: { marginBelowTrashTabViewHandle: _ } }, [globalDefaults]]]
            },
            height: [{ topBorderWidth: _ }, [me]] // via the inheritance of TrashTabViewHandleDesign
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. trashed: a ->AD that allows to set the element's trash state to false. 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    TrashableElement: o(
        { // 
            "class": "GeneralArea",
        },
        {
            qualifier: { trashed: true },
            "class": "TrashedElement"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedElement: {
        "class": o("WrapAround", "TrackAppTrash"),
        position: {
            height: [{ trashTabView: { heightOfTrashedElement:_ } }, [me]] 
        },
        children: {
            untrashControl: {
                description: {
                    "class": "UntrashControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTrashable 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    TrashedElementName: {
        context: {
            tooltipEditable: false,
            createTooltip: [and,
                [{ defaultTooltipableCreateTooltip: _ }, [me]],
                [notEqual,
                    [{ tooltipText: _ }, [me]],
                    ""
                ],
                [cond, // if it's of EditableTooltipable, create a tooltip only if it's not the defaultTooltipText
                    ["EditableTooltipable", [classOfArea, [me]]],
                    o(
                        {
                            on: true,
                            use: [notEqual,
                                [{ tooltipText: _ }, [me]],
                                [{ defaultTooltipText: _ }, [me]]
                            ]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ]
            ]
            // no tooltip if it has nothing of interest to say
            // whereas before we trash an element, we want to show the tooltip,
            // so the user can edit it!
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. TrashedElementName API 
    // 2. trashedOrder: ->AD of uniqueIDs of trashableElements in their trashed state (referenced by UntrashControl)
    // 3. expandedOrder: ->AD of uniqueIDs of trashableElements in their non-trashed (and expanded!) state (referenced by UntrashControl)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedReorderableElementName: {
        "class": "TrashedElementName"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTrashable: the TrashableElement
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    UntrashControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofTrashedfReorderableElement: [
                    { myTrashable: [{ myTrashable: _ }, [me]] },
                    [areaOfClass, "TrashedReorderableElementName"]
                ]
            }
        },
        { // default
            "class": o("UntrashControlDesign", "GeneralArea", "AboveSiblings", "AppControl"),
            context: {
                myTrashable: [embedding],
                tooltipText: "Extract from Trash",
                dimension: [minus, [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]], 2]
            },
            position: {
                right: 0,
                "vertical-center": 0
            },
            write: {
                onUntrashControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        // see variant below, or sibling classes
                    }
                }
            }
        },
        {
            qualifier: { ofTrashedfReorderableElement: true },
            write: {
                onUntrashControlClick: {
                    // upon: see default above
                    true: {
                        untrash: {
                            to: [{ myTrashable: { trashed: _ } }, [me]],
                            merge: false
                        },
                        removeFromTrashedOrder: {
                            to: [
                                [{ myTrashable: { uniqueID: _ } }, [me]],
                                [{ myTrashable: { trashedOrder: _ } }, [me]]
                            ],
                            merge: o()
                        },
                        pushInExpandedOrder: {
                            to: [{ myTrashable: { expandedOrder: _ } }, [me]],
                            merge: o(
                                [{ myTrashable: { uniqueID: _ } }, [me]],
                                [{ myTrashable: { expandedOrder: _ } }, [me]]
                            )
                        }
                    }
                }
            }
        }
    )
};