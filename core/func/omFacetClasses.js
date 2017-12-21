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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the overlay membership facet (OMF) library: the OMF represents membership in its associated overlay, as a facet. if the overlay is an intensional one, the OMF allows adding/
// removing items from that overlay.
// At the intersection of an *intensional* OSR of overlay iA and an OMF associated with overlay B, the user can specify whether the selections specifying its solutionSet should also 
// require the inclusion/exclusion of overlay B's solutionSet.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <omFacetDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an OMF.
    //
    // It inherits:
    // 1. SelectableFacet: the user can specify a selection for the intersecting overlay (as represented by the OSR), just like the SliderFacet and the MSFacet
    // 2. SortableFacet: the user can sort the solutionSetItems by their membership in the solutionSet of the overlay associated with the OMF.
    // 
    // It embeds:
    // 1. OMFacetXIntOSR: intersection areas with some of the intensionalOSRs. why only some?
    //    if the OMF represents an extensional overlay, it should create an intersection with all zoomBoxed overlays, other than itself (see AutoOMFacetXIntOSR.
    //    if, on the other hand, the OMF represents an intensional overlay, things are a bit trickier: we want to avoid having the user define circular definitions of intensional
    //    overlays. for example, oA = oB X oC, and oB = oA. for that reason, we create the OMFacetXIntOSR intersections, which provide the UI for the intensional overlay's defining
    //    selections, so as to prevent such circular definitions. this requires tracking which overlays (recursively!) are actually used in the definition of intensional overlays.
    //    for example, let's say we have oA = oB (oB is also intensional!). this means that we placed a checkmark in the intersection of oA's OSR and oB's OMF. once we do that, 
    //    oB is included in the os of overlays defining oA. we should now avoid having oA's OMF create an intersection with oB's OSR, as that would allow oB to define itself to
    //    something like oB = oA.
    // 2. AutoOMFacetXIntOSR: for the intersection with my own OSR (applies only to intensional overlays). This is intended as a visual indication only.
    //
    // API: 
    // 1. OMFCore API
    // 2. spacingFromPrev: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMF: o(
        { // variant-controller
            qualifier: "!",
            context: {
                makeSortable: [{ myApp: { itemsShowing: _ } }, [me]]
            }
        },
        { // default
            "class": o(
                "OMFDesign",
                "FillableFacet",
                "OverlayDelayedInArea",
                "TrackMyOverlay"
            ),
            context: {
                myOverlay: [
                    { uniqueID: [{ uniqueID: _ }, [me]] }, //uniqueID defined in Facet
                    [areaOfClass, "PermOverlay"]
                ],
                color: [{ myOverlay: { color: _ } }, [me]],
                defaultDescriptionText: [{ name: _ }, [me]],
                // aux calculations for selectableFacetXIntOSRs partner definition:
                allZoomBoxedOverlaysButMe: [
                    n([{ myOverlay: _ }, [me]]),
                    [{ zoomBoxed: true }, [areaOfClass, "Overlay"]]
                ],
                showMyFacetCells: true // a constant, unlike FacetWithAmoeba's definition                
            },
            content: [{ myOverlay: { solutionSetUniqueIDs: _ } }, [me]]
        },
        {
            qualifier: { ofMovingPane: true },
            children: {
                autoIntersection: {
                    partner: [
                        {
                            ofIntOverlay: true,
                            myOverlay: [{ myOverlay: _ }, [me]] // find the OSR whose myOverlay matches my myOverlay.
                        },
                        [areaOfClass, "OSR"]
                    ],
                    description: {
                        "class": "AutoOMFacetXIntOSR" // the intersection of the OMF representing overlay X with the OSR of that very same overlay.
                    }
                }
            }
        },
        {
            qualifier: { makeSortable: true },
            // facet inherits "SortableFacet",
            context: {
                myOverlaySolutionSetItemsUniqueID: [
                    [{ myOverlay: { itemUniqueIDProjectionQuery: _ } }, [me]],
                    [{ myOverlay: { solutionSetItems: _ } }, [me]]
                ],
                "*myOverlaySolutionSetItemsUniqueIDOnLastSort": [{ myOverlaySolutionSetItemsUniqueID: _ }, [me]],
                // SortableFacet params: the sort function
                sortKey: [cond,
                    [{ sortingDirection: _ }, [me]],
                    o(
                        {
                            on: "ascending",
                            use: [
                                [{ myOverlay: { itemUniqueIDFunc: _ } }, [me]], // form something like { "symbol": c("MMM", "AKS") } to serve as selection query
                                c([{ myOverlaySolutionSetItemsUniqueIDOnLastSort: _ }, [me]])
                            ]
                        },
                        {
                            on: "descending",
                            use: [
                                [{ myOverlay: { itemUniqueIDFunc: _ } }, [me]], // form something like { "symbol": c("MMM", "AKS") } to serve as selection query
                                c(
                                    unmatched,
                                    [{ myOverlaySolutionSetItemsUniqueIDOnLastSort: _ }, [me]]
                                )
                            ]
                        }
                    )
                ]
            },
            write: {
                updateItemsInMyOverlay: {
                    // we listen for a MouseClick on the sorterUXs of mySortingController in order to update the itemsInMyOverlaySortedAlphabetically appData 
                    // with the current solutionSet of the overlay associated with the OMF
                    // we update in two separate cases: if we're sortingByMe and one of the controller's mySorterUXs is clicked
                    // or if our very own mySorterUX was clicked, in which case we do the update regardless of the value of sortingByMe
                    // (whose value changes to true only when the cycle handled by this write is completed (as it awaits completion of the write by the
                    // SorterUX to the sorting controller's specifiedSortingKey)
                    upon: o(
                        [and,
                            // if we're already sorting by the OMF, do the update when changing my sorting controller's sorting
                            [{ sortingByMe: _ }, [me]],
                            [
                                {
                                    subType: "Click",
                                    recipient: [{ mySortingController: { mySorterUXs: _ } }, [me]]
                                },
                                [message]
                            ]
                        ],
                        [ // and if it's this Sortable's own mySorterUX, update anyway, even before it becomes sortingByMe: true
                            {
                                subType: "Click",
                                recipient: [{ mySorterUX: _ }, [me]]
                            },
                            [message]
                        ]
                    ),
                    true: {
                        updateItemsInMyOverlaySortedAlphabetically: {
                            to: [{ myOverlaySolutionSetItemsUniqueIDOnLastSort: _ }, [me]],
                            merge: [{ myOverlaySolutionSetItemsUniqueID: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                isLean: true,
                ofMovingPane: true,
                ofZoomBoxedOverlay: true
            },
            children: {
                selectableFacetXIntOSRs: {
                    partner: o(),
                    description: {
                        "class": "OMFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: {
                isLean: false,
                ofMovingPane: true,
                ofZoomBoxedOverlay: true
            },
            context: {
                // see calculation of overlaysToIntersectWith in the intensional/extensional variants below
                intOSRsToIntersectWith: [
                    {
                        myOverlay: [{ overlaysToIntersectWith: _ }, [me]],
                        ofIntOverlay: true
                    },
                    [areaOfClass, "OSR"]
                ]
            },
            children: {
                selectableFacetXIntOSRs: {
                    partner: [{ intOSRsToIntersectWith: _ }, [me]],
                    description: {
                        "class": "OMFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { ofExtOverlay: true },
            "class": "ExtOMF"
        },
        {
            qualifier: { ofExtOverlay: false }, // intensional overlay & the ephemeral extensional overlay (as ofExtOverlay is defined for *Permanent* extensional overlays!)
            "class": "IntOMF"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOMF: o(
        { // default
            "class": "TrackDataSourceApp",
            context: {
                overlaysToIntersectWith: [{ allZoomBoxedOverlaysButMe: _ }, [me]],
                myOverlayCrossViewDataObj: [{ myOverlay: { crossViewOverlayDataObj: _ } }, [me]]
            }
        },
        {
            qualifier: {
                expanded: true,
                ofZCApp: true,
                ofPreloadedApp: false
            },
            "class": "MoreControlsController",
            context: {
                immunityFromClosingMoreControlsAreaRefs: o(
                    [{ defaultImmunityFromClosingMoreControlsAreaRefs: _ }, [me]],
                    [areaOfClass, "ExtOverlayUniqueIDFacetSelectionMenuLine"]
                )
            },
            children: {
                moreControls: {
                    description: {
                        "class": "ExtOMFMoreControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntOMF: {
        context: {
            // subtract from allZoomBoxedOverlaysButMe those defining me, to avoid a circular definition of intensional overlays as defined by membership in other intensional overlays
            overlaysToIntersectWith: [
                n([{ myOverlay: { overlaysDefiningMe: _ } }, [me]]),
                [{ allZoomBoxedOverlaysButMe: _ }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayTooltip: o(
                    [not, [{ ofMinimizedFacet: _ }, [me]]],
                    [and,
                        [{ ofMinimizedFacet: _ }, [me]],
                        [{ contentSpillsOver: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("OMFNameDesign", "GeneralArea"),
            context: {
                fullName: [cond,
                    [{ myFacet: { ofExtOverlay: _ } }, [me]],
                    o(
                        {
                            on: true,
                            use: [concatStr,
                                o(
                                    [{ myApp: { editStr: _ } }, [me]],
                                    [{ myFacet: { name: _ } }, [me]]
                                ),
                                " "
                            ]
                        },
                        {
                            on: false,
                            use: [concatStr,
                                o(
                                    [{ myFacet: { name: _ } }, [me]],
                                    [{ myApp: { membershipStr: _ } }, [me]]
                                ),
                                " "
                            ]
                        }
                    )
                ],
                // EditableTooltipable params                
                mouseToEdit: false // override default definition in FacetName
            }
        },
        {
            qualifier: { ofMinimizedFacet: true },
            "class": "ContentSpillsOver",
            context: {
                displayText: [{ fullName: _ }, [me]]
            }
        },
        {
            qualifier: { ofMinimizedFacet: false },
            context: {
                displayText: [
                    [{ myApp: { oMFNameSamplingFunc: _ } }, [me]],
                    [{ myFacet: { name: _ } }, [me]]
                ],
                representativeName: "MMMMMMMMM"
            },
            position: {
                // enough room for big-enough-and-of-fixed-dimension text
                "content-width": [displayWidth,
                    {
                        display: {
                            text: {
                                value: [
                                    [{ myApp: { oMFNameSamplingFunc: _ } }, [me]],
                                    [{ representativeName: _ }, [me]]
                                ]
                            }
                        }
                    }
                ],
                "content-height": [displayHeight,
                    {
                        display: {
                            text: {
                                value: [
                                    [{ myApp: { oMFNameSamplingFunc: _ } }, [me]],
                                    [{ representativeName: _ }, [me]]
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            qualifier: { displayTooltip: true },
            "class": "Tooltipable",
            context: {
                tooltipText: [{ fullName: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbedOMFLegend: {
        children: {
            overlayLegend: {
                description: {
                    "class": "OMFOverlayLegend"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFOverlayLegendCore: {
        "class": o("GeneralArea", "OverlayLegend", "TrackMyFacet"),
        context: {
            // OverlayLegend param:
            dimension: [densityChoice, bFSPosConst.oMFOverlayLegendDimension]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFOverlayLegend: {
        "class": "OMFOverlayLegendCore",
        context: {
            // OverlayLegend param:
            myOverlay: [{ myOverlay: _ }, [embedding]]
        },
        position: {
            top: bFSPosConst.oMFOverlayLegendTopMargin,
            "horizontal-center": 0
        },
        children: {
            hideOMFControl: {
                description: {
                    "class": "HideOMFControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HideOMFControl: {
        "class": "HideOverlayInFacetControlCore",
        context: {
            // HideOverlayInFacetControlCore params
            myOverlayLegend: [embedding],
            myFacet: [{ myOverlayLegend: { myFacet: _ } }, [me]],
            myOverlay: [{ myOverlayLegend: { myOverlay: _ } }, [me]]
        },
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOMFMoreControls: o(
        { // default
            "class": o("MoreControlsOnClickUX", "TrackMyFacet"),
            context: {
                myOMFName: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "FacetName"]
                ],

                backgroundColor: "transparent",
                tooltipText: [concatStr, o([{ myApp: { facetEntityStr: _ } }, [me]], " ", [{ myApp: { optionEntityStrPlural: _ } }, [me]])],
            },
            position: {
                right: 0,
                centerVerticallyWithMyOMFName: {
                    point1: { type: "vertical-center" },
                    point2: {
                        element: [{ myOMFName: _ }, [me]],
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { open: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ExtOMFMoreControlsMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOMFMoreControlsMenu: {
        "class": o("MoreControlsMenu", "TrackMyFacet"),
        context: {
            // override default definition of TrackMyFacet
            myFacet: [{ myMenuAnchor: { myFacet: _ } }, [me]]
        },
        children: {
            menuItems: {
                data: o("uniqueIDFacetSelection"),
                description: {
                    "class": "OMFMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFMenuItem: o(
        { // default
            "class": o("MenuItemDirect", "TrackMyFacet"),
            context: {
                myFacet: [{ myMenu: { myFacet: _ } }, [me]],
                uniqueID: [{ param: { areaSetContent: _ } }, [me]]
            }
        },
        {
            qualifier: { uniqueID: "uniqueIDFacetSelection" },
            "class": "OMFUniqueIDFacetSelectionMenuItem"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFUniqueIDFacetSelectionMenuItem: {
        context: {
            height: [mul, 1.5, generalPosConst.menuItemHeight],
            displayText: [concatStr,
                o(
                    [{ myApp: { uniquelyIdentifyingStr: _ } }, [me]],
                    [{ myApp: { facetEntityStr: _ } }, [me]]
                ),
                " "
            ]
        },
        children: {
            text: {
                description: {
                    "class": "OMFUniqueIDFacetSelectionMenuItemText"
                }
            },
            dropDownMenuable: {
                description: {
                    "class": "ExtOverlayUniqueIDFacetSelectionMenuable",
                    context: {
                        myOverlay: [{ myFacet: { myOverlay: _ } }, [embedding]], // ExtOverlayUniqueIDFacetSelectionMenuable param

                        closeMoreControlsOnClick: false // override MenuItemDirect default value
                    },
                    position: {
                        left: [{ horizontalMarginFromEmbedded: _ }, [embedding]],
                        right: [{ horizontalMarginFromEmbedded: _ }, [embedding]],
                        attachToText: {
                            point1: {
                                element: [{ children: { text: _ } }, [embedding]],
                                type: "bottom"
                            },
                            point2: {
                                type: "top"
                            },
                            equals: 0
                        },
                        bottom: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFUniqueIDFacetSelectionMenuItemText: {
        context: {
            defaultVerticalPositioning: false
        },
        position: {
            //top: 0, this isn't good enough - report a bug, as attachToMenuItem is needed for some reason
            attachToMenuItem: {
                point1: { element: [embedding], content: true, type: "top" },
                point2: { type: "top" },
                equals: 0
            },
            height: generalPosConst.menuItemHeight
            // bottom: provided in the InclusionExclusionModeControlToggleContainer class
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of classes of the OMF x OSR intersection
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection between an OMF and an intensional overlay's OSR. 
    // this class inherits SelectableFacetXIntOSR (and via this inheritance is embedded in its expression parent, the OMF).
    // It obtains the selection state of its associated overlay in the intensional overlay's matching SelectableFacetXIntOverlay, and allows to manipulate it via MouseClicks 
    // (a round robin on o()/"included"/"excluded").
    // If it has a defined selectionMode, then this class embeds OMFacetXIntOSRSelectionMarker, to display the selection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionMode: [
                    mergeWrite,
                    [{ stableSelectionsObj: { selectionMode: _ } }, [me]],
                    o()
                ],
            }
        },
        { // default
            "class": o("SelectableFacetXIntOSR", "ModifyPointerClickable", "TrackMyFacet"),
            children: {
                selectionControl: {
                    description: {
                        "class": "OMFacetXIntOSRSelectionControl"
                    }
                }
            },
            write: {
                onOMFacetXIntOSRClick: {
                    "class": "OnMouseClick",
                    true: {
                        setSelectionMode: {
                            to: [{ selectionMode: _ }, [me]],
                            merge: [{ nextState: _ }, [me]]
                        }
                    }
                }
            },
            // the expression in this case is also the embedding, so would get the pointer anyway, but this way the cdl is somewhat more resilient to 
            // changes in embedding of the intersection area.
            propagatePointerInArea: o("expression", "referred"),
            position: {
                rightConstraint: {
                    point1: { type: "right" },
                    point2: { element: [{ myFacet: _ }, [me]], type: "right" },
                    equals: 0
                },
                rightContentConstraint: {
                    point1: {
                        content: true,
                        type: "right"
                    },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        content: true,
                        type: "right"
                    },
                    equals: 0
                }
            }
        },
        // defining the round-robin made up of three states: o()/"included"/"excluded"
        {
            qualifier: { selectionMode: false },
            context: {
                nextState: "included"
            }
        },
        {
            qualifier: { selectionMode: "included" },
            context: {
                nextState: "excluded"
            }
        },
        {
            qualifier: { selectionMode: "excluded" },
            context: {
                nextState: o()
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of an intensional overlay's OSR with its own OMF (call it iO). 
    // This intersection does not offer any UX, unlike the intersection of  iO's OSR with other OMFs (where the user can specify iO's defined selections to include/exclude those items
    // in the solutionSet of the overlays represented by these OMFs).
    // This class is used merely to display a rectangle at the intersection, and by doing so to help the user understand the connection between iO's OSR and OMF.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AutoOMFacetXIntOSR: {
        "class": o("AutoOMFacetXIntOSRDesign", "FacetXIntOSR"),
        context: {
            color: [{ myFacet: { color: _ } }, [me]] // override the color definition provided by FacetXIntOSR
        },
        position: {
            leftConstraint: {
                point1: {
                    element: [{ myFacet: _ }, [me]],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            rightConstraint: {
                point1: {
                    element: [{ myFacet: _ }, [me]],
                    type: "right"
                },
                point2: {
                    type: "right"
                },
                equals: 0
            },
            topConstraint: {
                point1: {
                    element: [{ myOSR: { myOverlay: { myVisibleOverlay: _ } } }, [me]],
                    type: "top"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            bottomConstraint: {
                point1: {
                    element: [{ myOSR: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "bottom"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of classes of the OMF x OSR intersection
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of the OMF Cell classes - the intersection of the OMF and the SolutionSetItem
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection between an OMF (its expressionOf and embedding area) and a SolutionSetItem (its referredOf). 
    // It inherits Cell, which represents the intersection between a SolutionSet and an OMFacet or a NonOMFacet
    // this class has two variants where addendum classes are inherited, depending on whether the overlay associated with the OMF is an extensional or an intensional one.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofExtOMF: [{ myFacet: { ofExtOverlay: _ } }, [me]],
                autoOMFCell: [equal,
                    [{ myOMFOverlay: _ }, [me]],
                    [{ mySolutionSetItem: { myOverlay: _ } }, [me]] // the overlay of my referredOf solutionSetItem.
                ],
                included: [{ content: _ }, [me]]
            }
        },
        {  // default
            "class": o("Cell", "BlockMouseEvent"),
            context: {
                myOMFOverlay: [{ myFacet: { myOverlay: _ } }, [me]],

                solutionSetItemUniqueID: [
                    [{ myOMFOverlay: { itemUniqueIDProjectionQuery: _ } }, [me]], // project from the entire item object the itemUniqueID's AVP
                    [{ mySolutionSetItem: { content: _ } }, [me]]
                ]
            },
            // in the absence of the [intersection] function, i have this query for calculating the content: true iff the solutionSetItem is included in 
            // the OMF's overlay's solutionSet.
            content: [
                [{ solutionSetItemUniqueID: _ }, [me]],
                [{ myFacet: { content: _ } }, [me]]
            ],
            position: {
                // the right frame constraint missing from Cell:
                rightConstraint: {
                    point1: { type: "right" },
                    point2: { element: [{ myFacet: _ }, [me]], type: "right" },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },

                // the leftContent and rightContent constraints missing from Cell:
                leftContentConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        content: true,
                        type: "left"
                    },
                    point2: {
                        type: "left",
                        content: true
                    },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                rightContentConstraint: {
                    point1: {
                        type: "right",
                        content: true
                    },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        content: true,
                        type: "right"
                    },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                }
            }
        },
        {
            qualifier: { ofExtOMF: true },
            "class": "ExtensionalOMFCell"
        },
        {
            qualifier: { ofExtOMF: false },
            "class": "IntensionalOMFCell"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class is the addendum to OMFCell, when the overlay associated with the OMF is an extensional overlay.
    // See ExtOverlay for documentation regarding the itemUniqueID algorithm.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtensionalOMFCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                itemUniqueIDValid: [{ myOMFOverlay: { itemUniqueIDValid: _ } }, [me]],

                recordItemUniqueIDForOverlay: [and,
                    // this is true if we had a global itemUniqueID (which is why itemUniqueIDValid is true), but we don't yet have AD for the overlay
                    // recording its itemUniqueID. in that case, we want to record it explicitly, so as to no longer rely on the global itemUniqueID.
                    [{ itemUniqueIDValid: _ }, [me]],
                    [not, [{ myOMFOverlay: { itemUniqueIDOfOverlay: _ } }, [me]]]
                ]
            }
        },
        { // default
            "class": "ModifyPointerClickable",
            context: {
                myOverlay: [{ mySolutionSetItem: { myOverlay: _ } }, [me]] // this is the overlay pertaining to the row, not to the OMF itself
            },
            children: {
                selectionControl: {
                    description: {
                        "class": "ExtensionalOMFCellSelectionControl"
                    }
                }
            }
        },
        {
            qualifier: {
                itemUniqueIDValid: true,
                included: true
            },
            write: {
                onOMFCellMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        removeItemFromMyOverlay: {
                            to: [
                                [{ solutionSetItemUniqueID: _ }, [me]],
                                [{ myOMFOverlay: { content: _ } }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                itemUniqueIDValid: true,
                included: false
            },
            write: {
                onOMFCellNoShiftMouseClick: {
                    "class": "OnNoShiftMouseClick",
                    true: {
                        addItemToMyOverlay: {
                            to: [{ myOMFOverlay: { content: _ } }, [me]],
                            merge: push(
                                [ // adding only those uniqueIDs which aren't already in it.
                                    n([{ myOMFOverlay: { content: _ } }, [me]]),
                                    [{ solutionSetItemUniqueID: _ }, [me]]
                                ]
                            )
                        }
                    }
                },
                onOMFCellShiftMouseClick: {
                    "class": "OnShiftMouseClick",
                    true: {
                        addAllUpToIncludingThisItemToMyOverlay: {
                            to: [{ myOMFOverlay: { content: _ } }, [me]],
                            merge: push(
                                [ // adding only those uniqueIDs which aren't already in it.
                                    n([{ myOMFOverlay: { content: _ } }, [me]]),
                                    [prevStarInOS,
                                        [{ myOverlay: { solutionSetUniqueIDs: _ } }, [me]],
                                        [{ solutionSetItemUniqueID: _ }, [me]]
                                    ]
                                ]
                            )
                        }
                    }
                }
            }
        },
        {
            qualifier: { itemUniqueIDValid: false },
            write: {
                onOMFCellMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        openOMFDialog: { // forcing the user to pick an itemUniqueID
                            to: [{ myFacet: { moreControlsOpen: _ } }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        { // see comment in definition of recordItemUniqueIDForOverlay above.
            qualifier: { recordItemUniqueIDForOverlay: true },
            write: {
                onOMFCellMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        recordItemUniqueIDForOverlay: {
                            to: [{ myOMFOverlay: { itemUniqueIDOfOverlay: _ } }, [me]],
                            merge: [{ myApp: { itemUniqueID: _ } }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the addendum to OMFCell, when the overlay associated with the OMF is an intensional overlay.
    // If this cell is not for an intersection of overlay X's SolutionSetItems with the same overlay X's OMF (i.e. if autoOMFCell is false), and to the extent the item represented by
    // the SolutionSetItem is also a member of the solutionSet of the overlay associated with the OMF, this class embeds an OMM.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntensionalOMFCell: o(
        { // default
        },
        {
            // if autoOMFCell: false is commented out
            // then OMFs of intensional overlays won't show their OMM when intersecting with the SolutionSetItem rows of their own overlay
            // (as in a trivial way there will be an OMM there: all items of intensional overlay X pertain to overlay X.
            // note that things aren't that trivial for an extensional overlay's OMF, as the OMM there is the means of removing an item from the overlay!
            qualifier: { // autoOMFCell: false, 

                included: true
            },
            children: {
                oMM: { // OMF membership marker
                    description: {
                        "class": "OMM"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the intersection of a SolutionSetItem and an OMF. 
    // It provides a visual indication that the item represented by the SolutionSetItem is a member of the solutionSet of the overlay associated with the OMF.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMM: {
        "class": o("OMMDesign", "GeneralArea", "TrackMyFacet"),
        context: {
            radius: [densityChoice, [{ oMFConst: { oMMRadius: _ } }, [globalDefaults]]],
            myFacet: [{ myFacet: _ }, [embedding]],
            color: [{ myFacet: { color: _ } }, [me]]
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of the OMF Cell classes - the intersection of the OMF and the SolutionSetItem
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the appropriate variant of the SelectableFacetXIntOverlay, the class of the areaSet embedded in an intensional overlay, where each area
    // represents the selections/solutionSets pertaining to a single selectableFacet & the overlay.
    // For the OMF, there's no difference between the transient and the stable selections.
    // 
    // This class' selectionQuery is constructed using the App's itemUniqueIDFunc, followed by an os of the associated overlay's solutionSet's uniqueIDs - either included, or 
    // excluded (using the n() operator). In short, the selectionQuery would look something like { symbol: o("MMM", "ABC") } (in the "included" case), or 
    // { symbol: n(o("ABC", "DEF")) } (in the "excluded" case).
    //
    // myFacet vs. myOMFOverlay:
    // the OMF represented by this class may not exist (e.g the OMF's associated overlay is not on Show) - in that case myFacet, 
    // provided by SelectableFacetXIntOverlay is not defined. But the associated overlay does exist - its uniqueID is the one stored in the stableSelectionsObj.
    // Do not confuse 'myOverlay', which is the embedding overlay, provided by SelectableFacetXIntOverlay, and 'myOMFOverlay'.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionMode: [{ stableSelectionsObj: { selectionMode: _ } }, [me]],
                selectionsMade: [
                    [{ selectionMode: _ }, [me]],
                    o("included", "excluded")
                ],
                effectiveSelectionsMade: o( // a meaningful selection either when we include something other than the entire baseSet or exclude something other than the empty set.
                    [and,
                        [equal,
                            "included",
                            [{ selectionMode: _ }, [me]]
                        ],
                        [notEqual,
                            [{ myOMFOverlay: { solutionSetSize: _ } }, [me]],
                            [{ myApp: { effectiveBaseOverlay: { stableSolutionSetSize: _ } } }, [me]]
                        ]
                    ],
                    [and,
                        [equal,
                            "excluded",
                            [{ selectionMode: _ }, [me]]
                        ],
                        [notEqual,
                            [{ myOMFOverlay: { solutionSetSize: _ } }, [me]],
                            0
                        ]
                    ]
                )
            }
        },
        { // default
            context: {
                // adding the omf-specific attributes to this object (its core attributes are defined in SelectableFacetXIntOverlay)

                // see class documentation
                myOMFOverlay: [
                    { uniqueID: [{ stableSelectionsObj: { uniqueID: _ } }, [me]] },
                    [areaOfClass, "Overlay"]
                ],
                oMFSolutionSetUniqueIDs: [{ myOMFOverlay: { solutionSetUniqueIDs: _ } }, [me]],
                facetQuery: [{ myOMFOverlay: { itemUniqueIDFunc: _ } }, [me]] // override definition in TrackMyFacetDataObj
            }
        },
        {
            qualifier: { ofIntersectionModeOverlay: false }, // union mode
            context: {
                myStableSelectionSolutionSet: [
                    [{ stableSelectionQuery: _ }, [me]],
                    [{ myOverlay: { baseSetItems: _ } }, [me]]
                ],
                myTransientSelectionSolutionSet: [
                    [{ transientSelectionQuery: _ }, [me]],
                    [{ myOverlay: { baseSetItems: _ } }, [me]]
                ]
            }
        },
        // transient/stable-SelectionQuery defined in the default clause (shared by both variants of selectionMode
        {
            qualifier: {
                effectiveSelectionsMade: true,
                selectionMode: "included"
            },
            context: {
                stableSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    [{ oMFSolutionSetUniqueIDs: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                effectiveSelectionsMade: true,
                selectionMode: "excluded"
            },
            context: {
                stableSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    n([{ oMFSolutionSetUniqueIDs: _ }, [me]])
                ]
            }
        },
        {
            qualifier: { effectiveSelectionsMade: true },
            context: {
                transientSelectionQuery: [{ stableSelectionQuery: _ }, [me]]
            }
        },
        {
            qualifier: { selectionsMade: true },
            context: {
                selectionsStr: [concatStr,
                    o(
                        [cond,
                            [{ selectionMode: _ }, [me]],
                            o(
                                { on: "included", use: "In " },
                                { on: "excluded", use: "Not in " }
                            )
                        ],
                        [{ myOMFOverlay: { name: _ } }, [me]]
                    )]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFSelectionControl: {
        "class": "SelectionControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OMFacetXIntOSRSelectionControl: {
        "class": o("OMFacetXIntOSRSelectionControlDesign", "OMFSelectionControl"),
        context: {
            // SelectionControlDesign params
            included: ["included", [{ selectionMode: _ }, [embedding]]],
            excluded: ["excluded", [{ selectionMode: _ }, [embedding]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtensionalOMFCellSelectionControl: {
        "class": o("ExtensionalOMFCellSelectionControlDesign", "OMFSelectionControl"),
        context: {
            // SelectionControlDesign params
            included: [{ included: _ }, [embedding]]
        }
    }


};
