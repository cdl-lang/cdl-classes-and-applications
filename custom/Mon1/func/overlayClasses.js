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

// %%classfile%%: <overlayDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofInclusiveZoomBoxingOverlay: [{ myOverlay: { inclusiveZoomBoxing: _ } }, [me]],
                ofExclusiveZoomBoxingOverlay: [{ myOverlay: { exclusiveZoomBoxing: _ } }, [me]]
            }
        },
        { // default
            "class": superclass
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisibleOverlay: {
        "class": o("VisibleOverlayDesign", superclass)
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedVisibleOverlay: {
        "class": superclass,
        context: {
            viewVerticalRefPoint: "vertical-center",
            offsetFromViewVerticalRefPoint: 0//fsAppPosConst.minimizedVisibleOverlayVerticalOffsetFromViewBottom
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingVisibleOverlay: o(
        { // default
            "class": superclass,
            children: {
                zoomBoxingModeMarkerContainer: {
                    description: {
                        "class": "ZoomBoxingModeMarkerContainer"
                    }
                }
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true },
            position: {
                attachOSRRight: {
                    point1: {
                        element: [{ children: { oSR: _ } }, [me]],
                        type: "right"
                    },
                    // point2 defined below depending on isLean
                    equals: fsAppPosConst.blacklistOSRMarginOnRight
                }
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true, isLean: true },
            position: {
                attachOSRRight: {
                    point2: {
                        element: [areaOfClass, "ZoomBoxingOverlaysView"],
                        type: "right"
                    }
                }
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true, isLean: false },
            position: {
                attachOSRRight: {
                    point2: {
                        element: [areaOfClass, "AppFrameMinimizationControl"],
                        type: "left"
                    }
                }
            }
        },
        {
            qualifier: { ofBlacklistOverlay: false },
            position: {
                attachOSRToItsPrev: {
                    point1: {
                        element: [{ children: { oSR: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ prevInPeerVisibleOverlaysOS: { children: { zoomBoxingModeMarkerContainer: _ } } }, [me]],
                        type: "left"
                    },
                    equals: [{ horizontalSpacingOfOSRs: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingModeMarkerContainer: {
        "class": o("GeneralArea", "AboveSiblings", "TrackMyOverlay"),
        context: {
            myOSR: [
                { myOverlay: [{ myOverlay: _ }, [me]] },
                [areaOfClass, "OSR"]
            ],
            dimension: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]]
        },
        position: {
            width: [{ dimension: _ }, [me]],
            height: [{ dimension: _ }, [me]],
            attachToVerticalCenterOfOSR: {
                point1: {
                    element: [{ myOSR: _ }, [me]],
                    type: "vertical-center"
                },
                point2: { type: "vertical-center" },
                equals: 0
            },
            attachRightToLeftOfOSR: {
                point1: {
                    element: [{ myOSR: _ }, [me]],
                    type: "left"
                },
                point2: { type: "right" },
                equals: 0
            }
        },
        children: {
            markerBackground: {
                description: {
                    "class": "ZoomBoxingModeMarkerBackground"
                }
            },
            markerRing: {
                description: {
                    "class": "ZoomBoxingModeMarkerRing"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An area behind the ZoomBoxingModeMarker (and its embedding ring), which has the color of the overlay, and extends to the ZoomBoxingModeMarker's 
    // horizonta-center
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingModeMarkerBackground: {
        "class": o("ZoomBoxingModeMarkerBackgroundDesign", "GeneralArea", "TrackMyOverlay"),
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]]
        },
        position: {
            top: 0,
            bottom: 0,
            right: 0,
            attachToHorizontalMiddleOfEmbedding: {
                point1: { type: "left" },
                point2: {
                    element: [embedding],
                    type: "horizontal-center"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingModeMarkerRing: {
        "class": o("ZoomBoxingModeMarkerRingDesign", "GeneralArea", "TrackMyOverlay"),
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]],
            radius: [div, [{ dimension: _ }, [embedding]], 2]
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        },
        children: {
            marker: {
                description: {
                    "class": "ZoomBoxingModeMarker"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingModeMarker: {
        "class": o("ZoomBoxingModeMarkerDesign", "GeneralArea", "TrackMyOverlay"),
        context: {
            marginAroundZoomBoxingModeMarker: fsAppPosConst.marginAroundZoomBoxingModeMarker,
            radius: [minus, [{ radius: _ }, [embedding]], [{ marginAroundZoomBoxingModeMarker: _ }, [me]]]
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOSR: {
        "class": superclass,
        children: {
            oSRControls: {
                description: {
                    "class": "FatOSRControls"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRControls: o(
        { // default 
            "class": superclass
        },
        {
            qualifier: { ofTrashedOverlay: false },
            children: {
                overlayMoreControls: {
                    description: {
                        "class": "OverlayMoreControls"
                    }
                }
            }
        },
        { // variant for a non-trashed union overlay
            qualifier: {
                ofTrashedOverlay: false,
                ofIntOverlay: true,
                ofIntersectionModeOverlay: false
            },
            children: {
                unionModeIndicator: {
                    description: {
                        "class": "OverlayUnionModeIndicator"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRControl: {
        "class": superclass,
        context: {
            myOverlay: [{ myOverlay: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Overlay MoreControls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the more controls of the overlay, embedded in the OSR.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMoreControls: o(
        { // default
            "class": superclass,
            context: {
                surroundingColor: [cond, // used by MoreControlsUXElementDesign, inherited by the embedded dot areas
                    [{ ofBlacklistOverlay: _ }, [me]],
                    o({ on: true, use: "black" }, { on: false, use: "colored" })
                ],
                horizontalMargin: [div,
                    [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing],
                    2
                ]
            },
            position: {
                "vertical-center": 0,
                // the following pos constraint was in place between ShowControl and OverlaySolutionSetCounter in Mon1
                offsetFromSolutionSetCounter: {
                    point1: {
                        element: [
                            { myOverlay: [{ myOverlay: _ }, [me]] },
                            [areaOfClass, "OverlaySolutionSetCounter"]
                        ],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalMargin: _ }, [me]]
                },
                minOffsetFromOverlayName: { // may not be a solutionCounter (when overlay is trashed, for example)
                    point1: {
                        element: [{ children: { name: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [{ horizontalMargin: _ }, [me]]
                },
                right: 0
            }
        },
        {
            qualifier: { open: true, isLean: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "LeanOverlayMoreControlsMenu"
                    }
                }
            }
        },
        {
            qualifier: { open: true, isLean: false },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "FatOverlayMoreControlsMenu"
                    }
                }
            }
        }

    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. menuData: an os of identifiers of the overlay controls offered in the more controls menu.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMoreControlsMenu: o(
        { // default
            "class": o("MoreControlsMenu", "TrackMyOverlay", "TrackAppTrash", "TrackOverlayMaximization", "TrackNoLists"),
            context: {
                myOverlay: [{ myOverlay: _ }, [expressionOf]],
                menuDefaultToLeft: false,

                ofIntOverlayWithSelectionsMade: [and,
                    [{ ofIntOverlay: _ }, [me]],
                    // this menu option should be available only if the intensional overlay has meaningful selections!
                    [{ myOverlay: { selectionsMade: _ } }, [me]]
                ],
                resetControlObj: [cond,
                    [{ myOverlay: { selectionsMade: _ } }, [me]], // applies to both extensional and intensional overlays!
                    o({ on: true, use: { uniqueID: "resetControl" } })
                ],

                // an intensional overlay can be copied only if all its stable solutionSet items have their uniquely-identifying facet value!
                makeCopyAsExtOverlayControlAvailable: [and,
                    [not, [{ noLists: _ }, [me]]],
                    [equal,
                        [size,
                            [
                                // can't simply use [{ myOverlay: { stableSolutionSetUniqueIDs: _ } }, [me]]
                                // instead of this query, as for an intensional overlay, itemUniqueID is "recordId"
                                // and that would result in an extensional overlay defined by the recordIds, something we don't do.
                                // instead, we use the App's itemUniqueID
                                // this is a proper solution for PreloadedApp's, where itemUniqueID is defined in their configuration file (e.g. stockAppSchema)
                                // this still does NOT work for myLeanZCApp - we should somehow force the user to define the itemUniqueID for this
                                // newly-formed list. TBD.
                                [{ myApp: { itemUniqueIDProjectionQuery: _ } }, [me]], // e.g. { ticker:_ }
                                [{ myOverlay: { stableSolutionSetItems: _ } }, [me]]
                            ]
                        ],
                        [{ myOverlay: { stableSolutionSetSize: _ } }, [me]]
                    ]
                ],
                coreMenuData: o(
                    { uniqueID: "renameControl" },
                    o(
                        { uniqueID: "minimizationControl" },
                        { uniqueID: "maximizationControl" },
                        [cond,
                            [{ ofIntOverlayWithSelectionsMade: _ }, [me]],
                            o({ on: true, use: { uniqueID: "expandDefiningFacetsControl" } })
                        ]
                    ),
                    [cond,
                        [{ ofIntOverlay: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: o(
                                    { uniqueID: "copyControl" },
                                    [cond,
                                        [{ makeCopyAsExtOverlayControlAvailable: _ }, [me]],
                                        o({ on: true, use: { uniqueID: "copyAsExtOverlayControl" } })
                                    ]
                                )
                            },
                            {
                                on: false,
                                use: o(
                                    [cond,
                                        o(
                                            [not, [{ myOverlay: { expanded: _ } }, [me]]],
                                            [not,
                                                [
                                                    [{ myOverlay: { uniqueID: _ } }, [me]], // identical to the corresponding OMF's uniqueID
                                                    [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                                                ]
                                            ]
                                        ),
                                        o({ on: true, use: { uniqueID: "editExtOverlayControl" } })
                                    ],
                                    { uniqueID: "copyControl" }
                                )
                            }
                        )
                    ]
                )
            },
            children: {
                menuItems: {
                    data: [{ menuData: _ }, [me]],
                    description: {
                        "class": "OverlayMenuItem"
                    }
                }
            }
        },
        {
            qualifier: { ofTrashedOverlay: true },
            context: {
                menuData: { uniqueID: "untrashControl" }
            }
        },
        {
            qualifier: {
                ofZoomBoxedOverlay: true, // also means that trashed: false
                maximizedOverlayExists: true
            },
            context: {
                menuData: o(
                    { uniqueID: "renameControl" },
                    { uniqueID: "minimizationControl" },
                    // this control (effectively 'unmaximize') will not appear in the overlay menu, but as an app-level control
                    // { uniqueID: "maximizationControl" },
                    [{ intOverlayIntersectionModeControls: _ }, [me]],
                    [{ resetControlObj: _ }, [me]]
                )
            }
        },
        {
            qualifier: {
                ofTrashedOverlay: false,
                maximizedOverlayExists: false
            },
            context: {
                menuData: o(
                    [{ coreMenuData: _ }, [me]],
                    [{ resetControlObj: _ }, [me]],
                    { uniqueID: "trashControl" }
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanOverlayMoreControlsMenu: {
        "class": "OverlayMoreControlsMenu"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOverlayMoreControlsMenu: o(
        { // default
            "class": "OverlayMoreControlsMenu"
        },
        {
            qualifier: { ofZoomBoxedOverlay: true },
            context: {
                intOverlayIntersectionModeControls: [cond,
                    [{ ofIntOverlay: _ }, [me]],
                    o(
                        { on: true, use: { uniqueID: "intersectionModeControl" } },
                        { on: false, use: o() }
                    )
                ],
                menuData: o(
                    [{ coreMenuData: _ }, [me]],
                    [{ intOverlayIntersectionModeControls: _ }, [me]],
                    [cond,
                        [{ myApp: { enableZoomBoxing: _ } }, [me]],
                        o(
                            { on: true, use: o({ uniqueID: "inclusiveZoomBoxingControl" }, { uniqueID: "exclusiveZoomBoxingControl" }) },
                            { on: false, use: o() }
                        )
                    ],
                    [{ resetControlObj: _ }, [me]],
                    { uniqueID: "trashControl" }
                )
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            context: {
                coreMenuData: o(
                    { uniqueID: "renameControl" },
                    [cond,
                        [{ ofBlacklistOverlay: _ }, [me]],
                        o(
                            { on: true, use: o() }, // a blacklist overlay cannot be zoomboxed
                            { on: false, use: { uniqueID: "zoomBoxControl" } }
                        )
                    ]
                )
            }
        },
        {
            qualifier: { ofInclusiveZoomBoxingOverlay: true },
            context: {
                menuData: o(
                    [{ coreMenuData: _ }, [me]],
                    [cond,
                        [{ myApp: { enableZoomBoxing: _ } }, [me]],
                        o(
                            { on: true, use: { uniqueID: "exclusiveZoomBoxingControl" } },
                            { on: false, use: o() }
                        )
                    ],
                    [{ resetControlObj: _ }, [me]]
                )
            }
        },
        {
            qualifier: { ofExclusiveZoomBoxingOverlay: true },
            context: {
                menuData: o(
                    [{ coreMenuData: _ }, [me]],
                    [cond,
                        [{ myApp: { enableZoomBoxing: _ } }, [me]],
                        o(
                            { on: true, use: { uniqueID: "inclusiveZoomBoxingControl" } },
                            { on: false, use: o() }
                        )
                    ],
                    [{ resetControlObj: _ }, [me]]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMenuItem: o(
        { // default
            "class": o("MenuItemDirect", "TrackMyOverlay"),
            context: {
                myOverlay: [{ myOverlay: _ }, [embedding]]
            }
        },
        {
            qualifier: { uniqueID: "renameControl" },
            "class": "OverlayRenameControl"
        },
        {
            qualifier: { uniqueID: "minimizationControl" },
            "class": "OverlayMinimizationControl"
        },
        {
            qualifier: { uniqueID: "maximizationControl" },
            "class": "OverlayMaximizationControl"
        },
        {
            qualifier: { uniqueID: "copyControl" },
            "class": "OverlayCopyControl"
        },
        {
            qualifier: { uniqueID: "copyAsExtOverlayControl" },
            "class": "OverlayCopyAsExtOverlayControl"
        },
        {
            qualifier: { uniqueID: "editExtOverlayControl" },
            "class": "OverlayEditListControl"
        },
        {
            qualifier: { uniqueID: "expandDefiningFacetsControl" },
            "class": "OverlayExpandDefiningFacetsControl"
        },
        {
            qualifier: { uniqueID: "intersectionModeControl" }, // relevant for intensional overlays only!
            "class": "IntOverlayIntersectionModeControl"
        },
        {
            qualifier: { uniqueID: "inclusiveZoomBoxingControl" },
            "class": "OverlayInclusiveZoomBoxingControl"
        },
        {
            qualifier: { uniqueID: "exclusiveZoomBoxingControl" },
            "class": "OverlayExclusiveZoomBoxingControl"
        },
        {
            qualifier: { uniqueID: "zoomBoxControl" },
            "class": "OverlayZoomBoxControl"
        },
        {
            qualifier: { uniqueID: "trashControl" },
            "class": "OverlayTrashControl"
        },
        {
            qualifier: { uniqueID: "resetControl" },
            "class": "OverlayResetControl"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay state between expanded and minimized. It's embedded in the OverlayMoreControlsMenu.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMinimizationControl: o(
        { // default
            "class": superclass,
            context: {
                myOverlay: [{ myOverlay: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofExpandedOverlay: true },
            context: {
                displayText: [{ myApp: { minimizeStr: _ } }, [me]]
            }
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            context: {
                displayText: [{ myApp: { expandStr: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay's Show state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayShowControlCore: o(
        { // default 
            "class": o("OverlayShowControlCoreDesign",
                "GeneralArea",
                "TooltipableControl",
                "OverlayDelayedInArea",
                "TrackMyOverlay"),
            context: {
                dimension: [densityChoice, fsAppPosConst.overlayShowControlDimension]
            },
            position: {
                width: [{ dimension: _ }, [me]],
                height: [{ dimension: _ }, [me]],
                "vertical-center": 0
            }
        },
        {
            qualifier: { show: true },
            context: {
                tooltipText: "Hide"
            }
        },
        {
            qualifier: { show: false },
            context: {
                tooltipText: "Show"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay's Show state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayShowControl: {
        "class": o(superclass,
            "OverlayShowControlCore"),
        position: {
            minOffsetFromSolutionSetCounter: {
                point1: {
                    element: [
                        { myOverlay: [{ myOverlay: _ }, [me]] },
                        [areaOfClass, "OverlaySolutionSetCounter"]
                    ],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                min: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayUnionModeIndicator: {
        "class": o("OverlayUnionModeIndicatorDesign", "GeneralArea", "Tooltipable", "TrackMyOverlay"),
        context: {
            tooltipText: "This filter is defined by the union of its selections on its defining slices (if any), and not by their intersection."
        },
        position: {
            width: 29, // to be replaced by a display query
            height: 17, // to be replaced by a display query
            "vertical-center": 0,
            minOffsetFromSolutionSetCounter: {
                point1: {
                    element: [
                        { myOverlay: [{ myOverlay: _ }, [me]] },
                        [areaOfClass, "OverlaySolutionSetCounter"]
                    ],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                min: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
            },
            attachToOverlayMoreControlsOnRight: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [
                        { myOverlay: [{ myOverlay: _ }, [me]] },
                        [areaOfClass, "OverlayMoreControls"]
                    ],
                    type: "left"
                },
                equals: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This control expands all facets for which the associated intensional overlay has a meaningful selection. 
    // The preexisting expanded facets are minimized. The newly-expanded facets are sorted per the complete ordering 
    // (the one also used for the minimized facets)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayExpandDefiningFacetsControl: {
        context: {
            intOverlayDefiningFacetsUniqueIDs: [
                { // select the uniqueIDs of those SelectableFacetXIntOverlay pertaining to myOverlay, which have a meaningful selection
                    myOverlay: [{ myOverlay: _ }, [me]],
                    selectionsMade: true,
                    uniqueID: _
                },
                [areaOfClass, "SelectableFacetXIntOverlay"]
            ],
            sizeIntOverlayDefiningFacetsUniqueIDs: [size, [{ intOverlayDefiningFacetsUniqueIDs: _ }, [me]]],
            displayText: [concatStr,
                o(
                    [{ myApp: { expandStr: _ } }, [me]],
                    " ",
                    [{ myApp: { filteringStr: _ } }, [me]],
                    " ",
                    [cond, [greaterThan, [{ sizeIntOverlayDefiningFacetsUniqueIDs: _ }, [me]], 1],
                        o(
                            {
                                on: true, use:
                                [{ myApp: { facetEntityStrPlural: _ } }, [me]]
                            },
                            {
                                on: false, use:
                                [{ myApp: { facetEntityStr: _ } }, [me]]
                            }
                        )
                    ],
                    " ",
                    "(",
                    [{ sizeIntOverlayDefiningFacetsUniqueIDs: _ }, [me]],
                    ")"
                )
            ]
        },
        write: {
            onOverlayExpandDefiningFacetsControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    setExpandedMovingFacets: {
                        to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
                        merge: [sort, [{ intOverlayDefiningFacetsUniqueIDs: _ }, [me]],
                            // and sort them by the master ordering of facets
                            [{ myApp: { reorderedFacetUniqueID: _ } }, [me]]
                        ]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntOverlayIntersectionModeControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                intersectionMode: [{ myOverlay: { intersectionMode: _ } }, [me]]
            }
        },
        { // default
            "class": superclass
        },
        {
            qualifier: { intersectionMode: true },
            context: {
                displayText: [{ myApp: { unionModeMenuStr: _ } }, [me]]
            }
        },
        {
            qualifier: { intersectionMode: false },
            context: {
                displayText: [{ myApp: { intersectionModeMenuStr: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyControl: {
        "class": superclass,
        context: {
            displayText: [{ myApp: { duplicateStr: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyAsExtOverlayControl: {
        "class": superclass,
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { duplicateStr: _ } }, [me]],
                    " ",
                    [{ myApp: { asStr: _ } }, [me]],
                    " ",
                    [{ myApp: { extOverlayEntityStr: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayEditListControl: {
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { editStr: _ } }, [me]],
                    [{ myApp: { extOverlayEntityStr: _ } }, [me]]
                ),
                " "
            ]
        },
        write: {
            onOverlayEditListControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    "class": "ExpandOverlayAction",
                    insertInExpandedMovingFacetUniqueIDs: {
                        to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
                        merge: o(
                            // what we want here is the corresponding OMF's uniqueID, which matches the overlay's uniqueID!
                            [{ myOverlay: { uniqueID: _ } }, [me]],
                            [
                                n([{ myOverlay: { uniqueID: _ } }, [me]]),
                                [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                            ]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayZoomBoxingControl: o(
        { // default
            // nothing for now
        },
        {
            qualifier: { ofZoomBoxingOverlay: false },
            "class": superclass,
            context: {
                newZoomBoxingOverlayObj: { overlay: [{ myOverlay: _ }, [me]] }
            }
        },
        { // if an overlay is already zoomBoxing, we need not add its object to zoomBoxingOverlayObjs; instead, we need to toggle the value stored in its objects 'mode' attribute
            // note: zoomBoxingOverlayObjs and not zoomBoxingOverlaysByUser, so as to allow toggling of the blacklist overlay as well.
            qualifier: { ofZoomBoxingOverlay: true },
            context: {
                zoomBoxingMode: [
                    {
                        overlay: [{ myOverlay: _ }, [me]],
                        mode: _
                    },
                    [{ myApp: { zoomBoxingOverlayObjs: _ } }, [me]]
                ]
            },
            write: {
                onOverlayZoomBoxingControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        modifyZoomBoxingModeInOverlayObj: {
                            to: [{ zoomBoxingMode: _ }, [me]],
                            merge: [cond,
                                [{ ofInclusiveZoomBoxingOverlay: _ }, [me]],
                                o(
                                    { on: true, use: "exclusive" },
                                    { on: false, use: "inclusive" }
                                )
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayInclusiveZoomBoxingControl: {
        "class": "OverlayZoomBoxingControl",
        context: {
            displayText: [{ myApp: { inclusiveZoomBoxingMenuStr: _ } }, [me]],
            newZoomBoxingOverlayObj: { mode: "inclusive" } //  merged with the object provided by OverlayZoomBoxingControl
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayExclusiveZoomBoxingControl: {
        "class": "OverlayZoomBoxingControl",
        context: {
            displayText: [{ myApp: { exclusiveZoomBoxingMenuStr: _ } }, [me]],
            newZoomBoxingOverlayObj: { mode: "exclusive" } //  merged with the object provided by OverlayZoomBoxingControl
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayZoomBoxControl: {
        context: {
            displayText: [{ myApp: { zoomBoxMenuStr: _ } }, [me]]
        },
        write: {
            onOverlayZoomBoxControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    removeMyOverlayFromZoomBoxingOverlaysByUser: {
                        to: [
                            { overlay: [{ myOverlay: _ }, [me]] },
                            [{ myApp: { zoomBoxingOverlaysByUser: _ } }, [me]]
                        ],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayTrashControl: {
        "class": superclass,
        context: {
            displayText: [{ myApp: { trashStr: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayResetControl: o(
        { // default
            "class": superclass,
            context: {
                myOverlay: [{ myOverlay: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofIntOverlay: true },
            context: {
                displayText: [concatStr,
                    o(
                        [{ myApp: { resetStr: _ } }, [me]],
                        " ",
                        [{ myApp: { intOverlayEntityStr: _ } }, [me]]
                    )
                ]
            }
        },
        {
            qualifier: { ofIntOverlay: false },
            context: {
                displayText: [concatStr,
                    o(
                        [{ myApp: { resetStr: _ } }, [me]],
                        " ",
                        [{ myApp: { extOverlayEntityStr: _ } }, [me]]
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Overlay MoreControls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetViewControl: {
        "class": o("SolutionSetViewControlDesign",
            superclass)
    }
};  
