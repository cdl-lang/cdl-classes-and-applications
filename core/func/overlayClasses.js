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
// This is the overlays library. 
// An overlay is a set of items, which are defined by multiple attributes, at least one of them (itemUniqueID, below) being unique. For example, in a stock database, this would be
// the stock ticker.
// overlays can be categorized based on different dimensions:
// 1. GlobalBaseOverlay: the application comes with one global base overlay, which could be thought of as an extensional overlay that includes the entire universe of available items.
//    This is the default baseSet, and cannot be trashed.
// 2. extensional vs. intensional: 
//    an extensional overlay is made up of a set of items: its solutionSet. The items are selected from a baseSet.
//    an intensional overlay is defined by a set of selections in different facets (slider/ms/rating/OMF). the application of these selections on the baseSet defines a 
//    solutionSet.
// 3. permanent vs. ephemeral: 
//    in our application, we have permanent overlays, whether intensional or extensional, which can only be deleted explicitly by the user. 
//    there are also ephemeral overlays: these are two application-defined overlays, one intensional and one extensional, which should be thought of as something akin to a clipboard:
//    the user can readily make selections to these overlays (and doesn't need to create the overlay first), and readily erase them (though they cannot be deleted!). the user can also
//    easily convert a particular set of selections defining an ephemeral overlay (whether intensional or extensional) as a permanent overlay. 
//    Finally, the user can readily oscillate between the two ephemeral overlays: 
//    When assigning selections to one of them, the application highlights associated values. 
//    For example, when making selections to the ephemeral intensional overlay (aka ephIntOverlay), the solutionSetItems on display (for permanent overlays!) are "highlighted"
//    if they're also in its solutionSet. Similarly, when making selections to define the ephemeral extensional overlay (aka ephExtOverlay), the projections of this solutionSet,
//    visualized as ms values and slider valueMarkers are "highlighted". 
//    By clicking on "highlighted" elements, the user can define them as selections in the *other* ephemeral overlay. for example, when we select "Good" and "Excellent" in the Quality facet
//    for the ephIntOverlay, some SolutionSetItems may be highlighted. If we click on one of them, all of them will be added to the ephExtOverlay, and the ephIntOverlay will be reset. 
//    Similarly, if we select items "ABC", and "DEF", their values in the different facets will be highlighted. if both are of "NYSE" Exchange, then by clicking on the "NYSE" highlighted 
//    ms value, we will define "Exchange": "NYSE" as the selection for the ephIntOverlay, and the ephExtOverlay will be reset.
//    This conversion of "highlighted" elements to selections allows transitioning from an extensional overlay to a related intensional overlay, and vice-versa.
// 4. blacklistOverlay: this is a special permanent extensional overlay that the application defines, and cannot be trashed by the user. All permanent intensional overlays start out
//    as excluding the blacklist's solutionSet from their solutionSet - this use can change this default exclusion.
// 5. permanent overlay states: 
// 5.1. zoomBoxed vs. zoomBoxing:
//      the application defines a AppFrame. Overlays inside the AppFrame are zoomBoxed. Overlays in the AppFrame are referred to as zoomBoxing overlays.
//      The AppFrame initially includes only the GlobalBaseOverlay - it is the only overlay in the AppFrame and so it is also the effectiveBaseOverlay. 
//      The other overlays start out as zoomBoxed inside this frame, meaning their selections are limited to the solutionSet of the effectiveBaseOverlay. the user may choose to push any of the 
//      zoomBoxed overlays into the AppFrame, where they'd be added as the topmost layer of the AppFrame, thus becoming the effectiveBaseOverlay. The AppFrame is therefore a
//      stack of overlays, always with the GlobalBaseOverlay at the bottom of the stack, and the topmost overlay being defined as the effectiveBaseOverlay.
//      Just like we can add an overlay to the AppFrame, we can pop overlays out of it - we do this by specifying a zoomBoxing overlay other than the effectiveBaseOverlay to be the new
//      effectiveBaseOverlay. by doing this, the zoomBoxing overlays above it in the stack are popped back out of it, and once again become zoomBoxed.
// 5.2  zoomBoxed overlays viewing states: Maximized/Standard/Minimized/Trashed: 
//      A zoomBoxed permanent overlay can be in the Standard viewing state, sharing the main viewing area with other overlays in that state. It could be in the Maximized state, in which
//      case it's the only permanent overlay on display. It can be minimized, which would produce a smaller icon summarizing its name and solutionSet size, and offering its controls.
//      Finally, it can be Trashed, in which case it is no longer showing in the amoebas/OMF, and its summary icon be only be viewed by opening up the overlay trash.
// 5.2.2 Show vs. Hide: a permanent overlay on Show shows more (its OverlayXWidgets, its OMF). This control is available only to  
// 5.2.3 Showing Solution Set Items: zoomBoxed overlays in Standard/Maximized state, and the effectiveBaseOverlay can all be either in a state where they show the individual items in their 
//       solutionSet, or not. Multiple overlays can be in this state, equally sharing the available real-estate allocated to this purpose.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <overlayDesignClasses.js>

var defaultRatioOfJITViewToOverlaySolutionSetView = 1.1;

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Overlay Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the global base overlay, which is not to be confused with the effective base, a user-specified subset of the global base overlay.
    // It inherits Permanent Overlay (Lean/Fat).
    // 
    // This overlay cannot be popped out of the AppFrame, unlike other overlays who can be pushed onto the AppFrame, but then can also be popped back out. Nor can it be trashed.
    // This class embeds a visibleOverlay, if the AppFrame isn't minimized.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    GlobalBaseOverlay: {
        context: {
            solutionSetItems: [{ content: _ }, [areaOfClass, "GlobalBaseItemSet"]],
            stableSolutionSetItems: [{ solutionSetItems: _ }, [me]], // no meaningful distinction between the stable and transient solutionSets here.
            embedVisibleOverlay: false // override attribute definition provided in LeanPermOverlay/FatPermOverlay, its sibling classes: no 
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanGlobalBaseOverlay: {
        "class": o("GlobalBaseOverlay", "LeanPermOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatGlobalBaseOverlay: {
        "class": o("GlobalBaseOverlay", "FatPermOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An overlay represents a set of items, obtained explicitly (extensional overlay) or implied through a set of selections on their attributes (facets) (intensional overlay).
    // An overlay is defined by a uniqueID (not displayed a name (displayed), a color, and a set of selections.
    // An areaSet of Overlays is embedded in FSApp. Qualifiers are defined based on the areaSetContent, and in those qualifiers, type-specific classes are inherited:
    // 1. Global Base Overlay (Lean/Fat)
    // 2. Permanent Intensional Overlay (Lean/Fat)
    // 3. Permanent Extensional Overlay (Lean/Fat)
    //
    // The overlay's content is a writable ref to the 'selections' attribute in the overlay's object included in the FSApp's overlayData. 
    // This attribute is initialized:
    // 1. For extensional overlays: an object pertaining to the itemUniqueID attribute, and its value is initialized to o().
    // 2. For intensional overlays: an object pertaining to the blacklist overlay, and its value is initialized to o().
    // 
    // The overlay covers the embedding FSApp. It has no visual presence - rather, it embeds VisibleOverlay, its visible manifestation.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Overlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                type: [{ dataObj: { type: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "ItemUniqueIDFuncs", "VisibleOverlayClipper"),
            context: {
                // itemUniqueID: see ExtOverlay and IntOverlay. IntOverlays do not define their own itemUniqueID; ExtOverlays may do so.

                uniqueID: [{ param: { areaSetContent: _ } }, [me]],
                dataObj: [
                    { uniqueID: [{ uniqueID: _ }, [me]] },
                    [{ myApp: { overlayData: _ } }, [me]]
                ],
                currentViewOverlayDataObj: [
                    { uniqueID: [{ uniqueID: _ }, [me]] },
                    [{ myApp: { currentView: { overlayData: _ } } }, [me]]
                ],
                crossViewOverlayDataObj: [
                    { uniqueID: [{ uniqueID: _ }, [me]] },
                    [{ myApp: { crossViewOverlayData: _ } }, [me]]
                ],

                name: [{ crossViewOverlayDataObj: { name: _ } }, [me]],
                nameWasEdited: [{ crossViewOverlayDataObj: { nameWasEdited: _ } }, [me]],

                overlayCounter: [{ dataObj: { overlayCounter: _ } }, [me]],
                color: [
                    [{ myApp: { getOverlayColor: _ } }, [me]],
                    [{ overlayCounter: _ }, [me]]
                ],
                solutionSetSize: [size, [{ solutionSetItems: _ }, [me]]],
                stableSolutionSetSize: [size, [{ stableSolutionSetItems: _ }, [me]]],
                emptyStableSolutionSet: [equal, [{ stableSolutionSetSize: _ }, [me]], 0],

                stableSolutionSetUniqueIDs: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ stableSolutionSetItems: _ }, [me]]
                ],
                stableSolutionSetUniqueIDsSize: [size, [{ stableSolutionSetUniqueIDs: _ }, [me]]],

                sortedStableSolutionSetItems: [sort,
                    [{ stableSolutionSetItems: _ }, [me]],
                    [{ myApp: { sortKeys: _ } }, [me]]
                ],
                sortedStableSolutionSetUniqueIDs: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ sortedStableSolutionSetItems: _ }, [me]]
                ],

                myOverlay: [me] // more resilient cdl this way
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanOverlay: o(
        { // default
            "class": "Overlay"
        },
        {
            qualifier: { type: "GlobalBase" },
            "class": "LeanGlobalBaseOverlay"
        },
        {
            qualifier: { type: "Intensional" },
            "class": "LeanPermIntOverlay"
        },
        {
            qualifier: { type: "Extensional" },
            "class": "LeanPermExtOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOverlay: o(
        { // default
            "class": "Overlay"
        },
        {
            qualifier: { type: "GlobalBase" },
            "class": "FatGlobalBaseOverlay"
        },
        {
            qualifier: { type: "Intensional" },
            "class": "FatPermIntOverlay"
        },
        {
            qualifier: { type: "Extensional" },
            "class": "FatPermExtOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PermExtOverlay (the permanent overlay). It inherits IntExtOverlay.
    // Note that an extensional overlay is defined by a set of uniqueIDs of items in the baseSetItems. In this sense, it can be viewed as a selection, an intensional selection, on a base
    // set. all this to say, that an extensional overlay is also limited to a base set, just like an intensional overlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExtOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                allowRecordIDAsItemUniqueID: [{ myApp: { allowRecordIDAsItemUniqueID: _ } }, [me]],
                selectionsMade: [notEqual,
                    0,
                    [{ solutionSetSize: _ }, [me]]
                ],
                draggedSolutionSetItemHoveringOverMe: [and,
                    [overlap, [{ myVisibleOverlay: _ }, [me]], [pointer]],
                    [{ draggedSolutionSetItem: _ }, [me]]
                ]
            }
        },
        { // default
            context: {
                // the itemUniqueID is the name of the attribute that is used to identify the selections defining an extensional overlay. for example, 
                // in a stock database, it would be the "ticker".
                // the problem that needs to be solved is how to handle lists (extOverlays) that were defined over one database, and are now viewed over 
                // another. they should at the very least be empty (previously, when they were defined based on the recordId, then the list simply 
                // selected the corresponding items from the newly-opened database, resulting in a surprising, some may say nonsensical, UX).
                // there are two layers of itemUniqueID AD:
                // the first is itemUniqueIDOfOverlay: an extOverlay-specific value, stored in the crossViewOverlayData.
                // the second is the application-wide value, stored in FSApp.
                // itemUniqueID is defined to take the itemUniqueIDOfOverlay, if it is defined, otherwise, to use the default one defined in the App.
                // if itemUniqueID is not valid (if it is not in the currently loaded db; and recordId isn't valid!), the user is forced to make a selection 
                // before adding an item to it.
                // if the App's itemUniqueID isn't valid, then when writing to itemUniqueIDOfOverlay, we also write the App's itemUniqueID.
                // when we open a second extOverlay, its itemUniqueIDOfOverlay is the App's itemUniqueID (the new list doesn't have its own just yet), so no 
                // need to force the user to pick now. but the new extOverlay's itemUniqueIDOfOverlay will be updated on the first item added 
                // (so it doesn't continue to rely on the App's itemUniqueID).
                // when we switch to a db from a different time frame - all lists should work as intended.
                // when we switch to a completely different db (stocks -> refrigerators):
                // the extOverlays' itemUniqueID is not valid, and so they should appear disabled, or something to that effect.
                // when after replacing the database, we open a new list, it will force the user to pick an itemUniqueIDOfOverlay for it, 
                // as the App's itemUniqueID isn't valid (as before - this time not because it's "recordId", but because it is "ticker", and "ticker" is not 
                // part of the refrigerators db)

                // ItemUniqueIDFuncs param: if the overlay defines an itemUniqueID, use it, otherwise, take the one defined in the app!
                itemUniqueIDOfOverlay: [{ crossViewOverlayDataObj: { itemUniqueID: _ } }, [me]],
                itemUniqueID: [first,
                    o(
                        [{ itemUniqueIDOfOverlay: _ }, [me]],
                        [{ myApp: { itemUniqueID: _ } }, [me]]
                    )
                ],

                solutionSetUniqueIDs: [{ content: _ }, [me]],

                solutionSetItems: [ // select from the baseSetItems, by the uniqueID attribute.
                    [
                        [{ itemUniqueIDFunc: _ }, [me]], // form something like { symbol: o("ABC", "MMM") }
                        [{ solutionSetUniqueIDs: _ }, [me]]
                    ],
                    [{ baseSetItems: _ }, [me]]
                ],

                // no difference between the stableSolutionSet and (transient)SolutionSet in an extOverlay. We define the stableSolutionSet anyway, to facilitate referencing
                // by other areas (e.g. the OverlaySolutionSetView, which embeds an areaSet of SolutionSetItems).
                stableSolutionSetItems: [{ solutionSetItems: _ }, [me]],

                draggedSolutionSetItem: [{ mySolutionSetItem: _ }, [areaOfClass, "SolutionSetItemDragged"]]
            },
            content: [{ crossViewOverlayDataObj: { included: _ } }, [me]],
            write: {
                onExtOverlayReset: {
                    upon: [{ msgType: "Reset" }, [myMessage]],
                    true: {
                        "class": "ResetExtOverlay"
                    }
                }
            }
        },
        {
            qualifier: { allowRecordIDAsItemUniqueID: true },
            context: {
                itemUniqueIDValid: true // override the definition in ItemUniqueIDFuncs
            }
        },
        {
            qualifier: { draggedSolutionSetItemHoveringOverMe: true },
            context: {
                draggedSolutionSetItemUniqueID: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ draggedSolutionSetItem: { content: _ } }, [me]]
                ],
                draggedSolutionSetItemAlreadyInOverlay: [
                    [{ draggedSolutionSetItemUniqueID: _ }, [me]],
                    [{ content: _ }, [me]]
                ]
            },
            children: {
                dropSiteFrame: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": o("Border", "Icon", "MatchArea"), // awaiting yuval's specs
                        context: {
                            myVisibleOverlay: [{ myVisibleOverlay: _ }, [expressionOf]],
                            match: [{ myVisibleOverlay: _ }, [me]]
                        },
                        stacking: {
                            keepBelowVisibleOverlayZTop: {
                                lower: [me],
                                higher: {
                                    element: [{ myVisibleOverlay: _ }, [me]],
                                    label: "zTop"
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                draggedSolutionSetItemHoveringOverMe: true,
                draggedSolutionSetItemAlreadyInOverlay: false
            },
            write: {
                onVisibleExtOverlayMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        addItemToContent: {
                            to: [{ content: _ }, [me]],
                            merge: push([{ draggedSolutionSetItemUniqueID: _ }, [me]])
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PermIntOverlay and EphIntOverlay.
    //
    // The stableSolutionSetItems is what's defined by the stable selections. The solutionSetItems is what's defined by the transient 
    // (i.e. "real-time" selections).
    // Each of the embedded SelectableFacetXIntOverlays for which selections were made contributes a selection function.
    // selectionsMade: true iff one of the following is true:
    // 1. a discreteFacet's selectionsObj in the overlay's content has an "included" attribute that's not o().
    // 2. a sliderFacet's selectionsObj in the overlay's content has a highVal/lowVal that's not +infinity/-infinity.
    // 3. an oMF's selectionsObj is defined.
    //
    // SelectableFacetXIntOverlay: 
    // This class embeds an areaSet of SelectableFacetXIntOverlays, each representing a facet in which a selection can be made (Slider/MS/Rating/OMF). 
    //
    // API: 
    // 1. selectableFacetUniqueIDs - the uniqueIDs of the facets that should be represented, an object per such ID.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // if false, that means this intensional overlay calculates the union of its selections, and not their intersection.
                intersectionMode: [mergeWrite,
                    [{ crossViewOverlayDataObj: { intersectionMode: _ } }, [me]],
                    true
                ],

                // true iff at least one of the children selectableFacetXIntOverlays has selectionsMade: true
                // currently doesn't have to be in the variant-controller. placed here nonetheless so as to be symmetric wrt ExtOverlay
                selectionsMade: [{ children: { selectableFacetXIntOverlays: { selectionsMade: true } } }, [me]]
            }
        },
        { // default
            context: {
                itemUniqueID: "recordId",

                solutionSetUniqueIDs: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ solutionSetItems: _ }, [me]]
                ],

                // preparation work for selectableFacetUniqueIDs calculation in inheriting classes: 
                // obtain the uniqueIDs of slider/discrete facets
                nonOMFInventoryUniqueIDs: [
                    { uniqueID: _ },
                    [areaOfClass, "FacetWithAmoeba"]
                ],

                // preparaing summaryStr
                loadedFacetXIntOverlays: [
                    {
                        myOverlay: [me],
                        selectionsMade: true
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                loadedOMFacetXIntOverlays: [
                    [areaOfClass, "OMFacetXIntOverlay"],
                    [{ loadedFacetXIntOverlays: _ }, [me]]
                ],
                loadedNonOMFacetXIntOverlays: [
                    { disabled: false },
                    [
                        n([{ loadedOMFacetXIntOverlays: _ }, [me]]),
                        [{ loadedFacetXIntOverlays: _ }, [me]]
                    ]
                ],

                oMFsSummaryStr: [cond,
                    [{ loadedOMFacetXIntOverlays: _ }, [me]],
                    o(
                        {
                            on: false, use: o()
                        },
                        {
                            on: true,
                            use: [cond,
                                [and,
                                    [greaterThan, [size, [{ loadedOMFacetXIntOverlays: _ }, [me]]], 1],
                                    [not, [{ intersectionMode: _ }, [me]]]
                                ],
                                o(
                                    {
                                        on: true,
                                        use: [concatStr,
                                            o(
                                                "Union of: ",
                                                [concatStr,
                                                    [{ loadedOMFacetXIntOverlays: { selectionsStr: _ } }, [me]],
                                                    ", "
                                                ]
                                            )
                                        ]
                                    },
                                    {
                                        on: false,
                                        use: [{ loadedOMFacetXIntOverlays: { selectionsStr: _ } }, [me]]
                                    }
                                )
                            ]
                        }
                    )
                ],

                facetsSummaryStr: o(
                    [{ oMFsSummaryStr: _ }, [me]],
                    [{ loadedNonOMFacetXIntOverlays: { selectionsStr: _ } }, [me]]
                ),
                parsedFacetsSummaryStr: [cond,
                    [greaterThan, [size, [{ facetsSummaryStr: _ }, [me]]], 1],
                    o(
                        {
                            on: false,
                            use: [{ facetsSummaryStr: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [concatStr,
                                [map,
                                    [defun,
                                        o("str"),
                                        [concatStr,
                                            o(
                                                [plus, [index, [{ facetsSummaryStr: _ }, [me]], "str"], 1],
                                                ") ",
                                                "str"
                                            )
                                        ]
                                    ],
                                    [{ facetsSummaryStr: _ }, [me]]
                                ],
                                "\n"
                            ]
                        }
                    )
                ],
                parsedFacetsSelectionSummaryStr: [concatStr,
                    o(
                        "Selections: \n",
                        [{ parsedFacetsSummaryStr: _ }, [me]]
                    )
                ],
                selectionsData: [{ crossViewOverlayDataObj: { selectionsData: _ } }, [me]],

                meaningfulSelectableFacetUniqueIDs: [_, // compression operator
                    o(
                        [
                            { uniqueID: _ },
                            [
                                o(
                                    { included: true },
                                    { excluded: true },
                                    { highVal: true },
                                    { lowVal: true },
                                    { selectionMode: true }
                                ),
                                [{ selectionsData: _ }, [me]]
                            ]
                        ],
                        [
                            { uniqueID: _ },
                            [
                                { beingModified: true, myFacet: _ },
                                [{ myOverlay: [me] }, [areaOfClass, "SliderIntOverlayXWidget"]]
                            ]
                        ],
                        [
                            { uniqueID: _ },
                            [
                                { readyForSelection: true, myFacet: _ },
                                [{ myOverlay: [me] }, [areaOfClass, "HistogramBar"]]
                            ]
                        ]

                    )
                ]
            },
            children: {
                // this logic follows a mojor revision commited on June 9th 2016 (FacetXOverlay optimization):
                // instead of keeping a SelectableFacetXIntOverlay for all facets,  
                // we keep only those for which there is (or has been) an active selection
                selectableFacetXIntOverlays: {
                    data: [identify, // this is to ensure that the default identity that relies on position within the os is not the one used:
                        // e.g. when adding facets, reordering them, etc.
                        _,
                        [{ meaningfulSelectableFacetUniqueIDs: _ }, [me]]
                    ],
                    description: {
                        "class": "SelectableFacetXIntOverlay"
                    }
                }
            },
            content: [
                {
                    selectionsMade: true,
                    stableSelectionsObj: _
                },
                [{ children: { selectableFacetXIntOverlays: _ } }, [me]]
            ],
            write: {
                onIntOverlayReset: {
                    upon: [{ msgType: "Reset" }, [myMessage]],
                    true: {
                        resetSelectionsData: {
                            to: [{ selectionsData: _ }, [me]],
                            merge: o()
                        },
                        resetIntersectionMode: {
                            to: [{ intersectionMode: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { intersectionMode: true },
            context: {
                stableSolutionSetItems: [multiQuery,
                    [{ children: { selectableFacetXIntOverlays: { stableSelectionQuery: _ } } }, [me]],
                    [{ baseSetItems: _ }, [me]]
                ],
                solutionSetItems: [multiQuery,
                    [{ children: { selectableFacetXIntOverlays: { transientSelectionQuery: _ } } }, [me]],
                    [{ baseSetItems: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { intersectionMode: false },
            context: {
                // when in union mode, we take the union of the OMFs' selections, and *intersect* it (not unionize it!) with the selections
                // of the other facets.

                // first, we prepare the union of the OMFs' selections 
                myOMFacetXIntOverlays: [
                    {
                        myOverlay: [me],
                        ofOMF: true
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                myNonOMFacetXIntOverlays: [
                    {
                        myOverlay: [me],
                        ofOMF: false
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                // perform the union of the solutionSet (stable and transient) defined by the union on the OMF selections
                oMFStableSolutionSetItems: [{ myOMFacetXIntOverlays: { myStableSelectionSolutionSet: _ } }, [me]],
                oMFSolutionSetItems: [{ myOMFacetXIntOverlays: { myTransientSelectionSolutionSet: _ } }, [me]],
                // project the uniqueIDs of these unionized sets
                unionOMFStableSolutionSetItemsUniqueID: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ oMFStableSolutionSetItems: _ }, [me]]
                ],
                unionOMFSolutionSetItemsUniqueID: [
                    [{ itemUniqueIDProjectionQuery: _ }, [me]],
                    [{ oMFSolutionSetItems: _ }, [me]]
                ],
                // create a selection query from these projections (which will be fed to multiQuery below)
                unionOMFStableSolutionSetItemsSelectionQuery: [
                    [{ itemUniqueIDFunc: _ }, [me]],
                    [{ unionOMFStableSolutionSetItemsUniqueID: _ }, [me]]
                ],
                unionOMFSolutionSetItemsSelectionQuery: [
                    [{ itemUniqueIDFunc: _ }, [me]],
                    [{ unionOMFSolutionSetItemsUniqueID: _ }, [me]]
                ],
                // run multiQuery: from the OMFs, take the selection query calculated herein for their union). for the other facets, take their
                // selectionQuery (stable/transient, as the case may be)
                stableSolutionSetItems: [multiQuery,
                    o(
                        [{ myNonOMFacetXIntOverlays: { stableSelectionQuery: _ } }, [me]],
                        [{ unionOMFStableSolutionSetItemsSelectionQuery: _ }, [me]]
                    ),
                    [{ baseSetItems: _ }, [me]]
                ],
                solutionSetItems: [multiQuery,
                    o(
                        [{ myNonOMFacetXIntOverlays: { transientSelectionQuery: _ } }, [me]],
                        [{ unionOMFSolutionSetItemsSelectionQuery: _ }, [me]]
                    ),
                    [{ baseSetItems: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent overlay - all overlays, including the GlobalBaseOverlay, are permanent overlays, except for the two application-defined ephemeral overlays.
    // It is inherited by the GlobalBaseOverlay, as well as by the PermIntExtOverlay.
    //
    // embedVisibleOverlay: a variant-controller that determines whether this class will embed a VisibleOverlay (the visible elements of an overlay) (Lean/Fat).
    // 
    // permanent overlay state: 
    // 1. The variant-controller defines several writable references which point to the overlay's areaSetContent, obtained from the FSApp's overlayData:
    //    state/showSolutionSet/show.
    // 3. In this class we define several variant-controllers which are aggregation of several possible states - used in this class and its embedded areas.
    //    It also defines a variant-controller to override the overlay's 'state' appData with a calculated value for the ZoomBoxing state.
    //
    // reordering of overlays:
    // there's a single ordering of overlays, which the user can modify, by dragging overlays wrt one another. the overlays in the Standard / Minimized / Trashed views are displayed per 
    // the appropriate subset of this single ordering.
    //
    // API:
    // 1. visibleOverlayFrameWidth: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inZoomBoxingOverlays: [
                    [me],
                    [{ myApp: { zoomBoxingOverlays: _ } }, [me]]
                ],
                embedVisibleOverlay: o(
                    [and,
                        compileMinimizedOverlays ? [{ zoomBoxed: _ }, [me]] : [{ expanded: _ }, [me]],
                        [not, [{ maximizedOverlayExists: _ }, [me]]]
                    ],
                    [{ maximized: _ }, [me]],
                    [and,
                        [not, [{ appFrameMinimized: _ }, [me]]],
                        [
                            [me],
                            [{ myApp: { visibleZoomBoxingOverlays: _ } }, [me]]
                        ]
                    ],
                    [and,
                        [{ trashed: _ }, [me]],
                        [{ appTrashOpen: _ }, [me]],
                        [{ trashOverlayTabSelected: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "TrackAppTrash", "TrackAppFrameMinimization", "TrackOverlayMaximization"),
            context: {
                state: [mergeWrite,
                    [{ currentViewOverlayDataObj: { state: _ } }, [me]],
                    [{ dataObj: { state: _ } }, [me]]
                ],
                showZoomBoxed: [mergeWrite,
                    [{ currentViewOverlayDataObj: { showZoomBoxed: _ } }, [me]],
                    [{ dataObj: { showZoomBoxed: _ } }, [me]]
                ],
                showZoomBoxing: [mergeWrite,
                    [{ currentViewOverlayDataObj: { showZoomBoxing: _ } }, [me]],
                    [{ dataObj: { showZoomBoxing: _ } }, [me]]
                ],
                showSolutionSet: [mergeWrite,
                    [{ currentViewOverlayDataObj: { showSolutionSet: _ } }, [me]],
                    [{ dataObj: { showSolutionSet: _ } }, [me]]
                ],

                trashed: [{ crossViewOverlayDataObj: { trashed: _ } }, [me]], // note 'trashed' is crossView!
                zoomBoxed: [and,
                    [not, [{ zoomBoxing: _ }, [me]]],
                    [not, [{ trashed: _ }, [me]]]
                ],
                expanded: [and,
                    [{ zoomBoxed: _ }, [me]],
                    [
                        [{ uniqueID: _ }, [me]],
                        [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]]
                    ]
                ],
                minimized: [and,
                    [{ zoomBoxed: _ }, [me]],
                    [not, [{ expanded: _ }, [me]]]
                ],

                myDelayedInAreaElements: [
                    {
                        myOverlay: [me],
                        delayedInArea: true // the operations here are clicks, and so we look at (the delayed) inArea
                    },
                    o( // all these classes are to inherit DelayedInArea - see interactingWithOverlayElements below
                        [areaOfClass, "OMF"],
                        [areaOfClass, "OverlayXWidget"],
                        [areaOfClass, "OverlayXWidgetLegend"],
                        [areaOfClass, "HistogramBar"],
                        [areaOfClass, "OSR"],
                        [areaOfClass, "MSFacetXIntOSRExtension"]
                    )
                ],
                myOperatedOnElements: [
                    {
                        myOverlay: [me],
                        delayedInFocus: true // the operations here are drags, so we look at (the delayed) inFocus
                    },
                    [areaOfClass, "SliderIntOverlayXWidget"]
                ],
                myInAreaElements: [
                    {
                        myOverlay: [me],
                        inArea: true
                    },
                    [areaOfClass, "OverlayMoreControls"]
                ],

                visibleOverlayFrameWidth: bFSAppPosConst.visibleOverlayFrameWidth,
                myVisibleOverlay: [
                    { myOverlay: [me] },
                    [areaOfClass, "VisibleOverlay"]
                ]
            }
        },
        {
            qualifier: { inZoomBoxingOverlays: true },
            "class": "ZoomBoxingOverlay" // will assign value to state, overriding (though not over-writing!) the appData value
        },
        {
            qualifier: { inZoomBoxingOverlays: false }, // i.e. a zoomBoxed overlay
            context: {
                show: [{ showZoomBoxed: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PermOverlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisibleOverlayClipper: {
        "class": o("GeneralArea", "DraggableToReorderClipper"),
        context: {
            // Clipper param
            clipper: [cond,
                [{ myVisibleOverlay: { myView: _ } }, [me]],
                o(
                    {
                        on: true,
                        use: [cond,
                            [{ clippedDraggedToReorder: _ }, [me]],
                            o(
                                { on: true, use: [areaOfClass, "ZoomBoxOrnament"] },
                                { on: false, use: [{ myVisibleOverlay: { myView: _ } }, [me]] }
                            )
                        ]
                    },
                    {
                        on: false,
                        use: [{ myApp: _ }, [me]]
                    }
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanPermOverlay: o(
        { // default
            "class": "PermOverlay"
        },
        {
            qualifier: { embedVisibleOverlay: true },
            children: {
                visibleOverlay: {
                    description: {
                        "class": "LeanVisibleOverlay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermOverlay: o(
        { // default
            "class": "PermOverlay"
        },
        {
            qualifier: { embedVisibleOverlay: true },
            children: {
                visibleOverlay: {
                    description: {
                        "class": "FatVisibleOverlay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. baseSetItems: the os of items used to calculate the overlay's stable/transient solutionSets. default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingOverlay: {
        context: {
            zoomBoxing: true,
            show: [{ showZoomBoxing: _ }, [me]],

            // the baseSet is the globalBaseOverlay's stableSolutionSetItems
            // this is not the same 'base' which this class uses to support the calculation of the effectiveBaseSetItems.
            baseSetItems: [{ myApp: { globalBaseOverlay: { stableSolutionSetItems: _ } } }, [me]],
            inclusiveZoomBoxing: [
                [me],
                [{ myApp: { inclusiveZoomBoxingOverlays: _ } }, [me]]
            ],
            exclusiveZoomBoxing: [
                [me],
                [{ myApp: { exclusiveZoomBoxingOverlays: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in FSApp. It represents the effective base overlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseOverlay: o(
        { // default
            "class": o("Overlay", "TrackAppFrameMinimization"),
            context: {
                name: [{ myApp: { name: _ } }, [me]],
                uniqueID: [ // as it is not provided a uniqueID otherwise..
                    getOverlayUniqueID,
                    fsAppConstants.effectiveBaseOverlayCounter
                ],
                itemUniqueID: "recordId",
                color: [{ myApp: { globalBaseOverlay: { color: _ } } }, [me]],
                show: [mergeWrite,
                    [{ currentViewOverlayDataObj: { show: _ } }, [me]],
                    false
                ],

                unsortedSolutionSetItems: [
                    { stableSolutionSetItems: _ },
                    [last, [{ children: { effectiveBaseAuxs: _ } }, [me]]]
                ],
                solutionSetItems: [{ unsortedSolutionSetItems: _ }, [me]],
                // We currently do not distinguish between the stable and transient solutionSets of the effective base.
                // Where could one have made that distinction? Say an intensional overlay is defined as zoomboxing. If the user changes the slider selections for that overlay, while the mouse
                // is still down, one could consider discussing a stable effective base (defined by the slider's selection prior to the mouseDown) vs. the transient effective base (which
                // reflects the slider's current selection, while the mouse is still down).
                stableSolutionSetItems: [{ unsortedSolutionSetItems: _ }, [me]]
            },
            children: {
                effectiveBaseAuxs: {
                    data: [{ myApp: { zoomBoxingOverlays: _ } }, [me]],
                    description: {
                        "class": "EffectiveBaseOverlayAux"
                    }
                }
            }
        },
        {
            qualifier: { appFrameMinimized: false },
            children: {
                effectiveBaseSummary: {
                    description: {
                        "class": "EffectiveBaseSummary"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseSummary: o(
        { // default
            "class": o("GeneralArea", "MinWrap", "TrackDataSourceApp"),
            context: {
                minWrapAround: 0,
                minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure
            },
            position: {
                attachLeftToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: bFSAppPosConst.effectiveBaseSummaryLeftOffset
                },
            },
            children: {
                name: {
                    description: {
                        "class": "EffectiveBaseName"
                    }
                },
                counter: {
                    description: {
                        "class": "EffectiveBaseCounter"
                    }
                }
            }
        },
        {
            qualifier: { ofZCApp: false },
            "class": "PositionAtTopOfAppFrame",
        },
        {
            qualifier: { ofZCApp: true },
            position: {
                // top constraint: see DataSourceSelectors,
                /*attachToZoomBox: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ZoomBox"], type: "top" },
                    equals: [densityChoice, [{ fsAppPosConst: { effectiveBaseSummaryVerticalMargin: _ } }, [globalDefaults]]]
                }*/
                attachToAuxTopBar: {
                    point1: { type: "vertical-center" },
                    point2: { element: [areaOfClass, "AuxTopBar"], type: "vertical-center" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofZCApp: true,
                ofPreloadedApp: false
            },
            children: {
                dataSourceSelectorsViewControl: {
                    description: {
                        "class": "DataSourceSelectorsViewControl"
                    }
                }
            }
        },
        { // in preloadedApp openSesame=false mode
            qualifier: {
                ofPreloadedApp: true,
                allowDataSourceUploading: false
            },
            children: {
                preloadedDBControls: {
                    description: {
                        "class": "PreloadedDBControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseName: o(
        { // default
            "class": o("EffectiveBaseNameDesign",
                "DisplayDimension", // provides the width
                "OverlayNameCore",
                "TrackDataSourceApp"),
            context: {
                displayText: [{ myOverlay: { name: _ } }, [me]]
            }
        },
        {
            qualifier: { ofZCApp: false },
            position: {
                left: 0
            }
        },
        {
            qualifier: { ofZCApp: true },
            position: {
                attachToDataSourceSelectorsViewControl: {
                    point1: {
                        element: [areaOfClass, "DataSourceSelectorsViewControl"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalMargin: _ }, [me]]
                }
            }
        },
        {
            qualifier: { allowDataSourceUploading: true },
            "class": "ShowDataSourcePaneControlHandler"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseCounter: {
        "class": o("EffectiveBaseCounterDesign", "OverlaySolutionSetCounterCore"),
        context: {
            myOverlayName: [{ children: { name: _ } }, [embedding]] // override OverlaySolutionSetCounter's definition.
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseShowControl: {
        "class": o("TrackMyOverlay", // should be inherited before superclass to override its definition for myOverlay (provided by OSRControl)
            "OverlayShowControl"),
        position: {
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseOverlayAux: o(
        { // default
            "class": o("GeneralArea", "TrackMyOverlay"),
            context: {
                myOverlay: [{ param: { areaSetContent: _ } }, [me]]
            }
        },
        {
            qualifier: { ofFirstZoomBoxingOverlay: true },
            context: {
                stableSolutionSetItems: [{ myOverlay: { stableSolutionSetItems: _ } }, [me]]
            }
        },
        {
            qualifier: {
                ofFirstZoomBoxingOverlay: false,
                ofInclusiveZoomBoxingOverlay: true
            },
            context: {
                stableSolutionSetItems: [
                    [{ myOverlay: { stableSolutionSetItems: _ } }, [me]],
                    [{ stableSolutionSetItems: _ }, [prev, [me]]]
                ]
            }
        },
        {
            qualifier: {
                ofFirstZoomBoxingOverlay: false,
                ofExclusiveZoomBoxingOverlay: true
            },
            context: {
                stableSolutionSetItems: [
                    n([{ myOverlay: { stableSolutionSetItems: _ } }, [me]]),
                    [{ stableSolutionSetItems: _ }, [prev, [me]]]
                ]
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PermIntOverlay and PermExtOverlay.
    // It inherits:
    // 1. PermOverlay (Lean/Fat).
    // 2. MoreControlsController: the class that allows to control an *moreControlsOpen appData.
    // 3. several Tracking classes.
    // 
    // state: 
    // This class includes a variant-controller to override the overlay's 'state' appData with a calculated value for the Maximized state.
    //
    // baseSetItems: if this class is zoomBoxed, the effectiveBaseOverlay's sorted solutionSet is its baseSetItems. Otherwise, it is the solutionSet of the preceeding overlay in the AppFrame.
    //
    // upon handlers:
    // this class defines a few handlers that map changes in the overlay's 'state' to changes to its show/showSolutionSet writable references.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntExtOverlay: o(
        { // default
            "class": "MoreControlsController",
            context: {
                maximized: [equal,
                    [{ uniqueID: _ }, [me]],
                    [{ myApp: { maximizedOverlayUniqueID: _ } }, [me]]
                ]
            }
        },
        { // i.e. all except for the trashed, and zoomBoxing overlays
            qualifier: { zoomBoxed: true },
            context: {
                baseSetItems: [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanPermIntExtOverlay: {
        "class": o("PermIntExtOverlay", "LeanPermOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermIntExtOverlay: o(
        { // default
            "class": o("PermIntExtOverlay", "FatPermOverlay"),
            context: {
                // this is to support the overlay trashing operation - when that is done, the overlay should be removed from the definition of all intensional overlays that it defines 
                // directly!
                intOverlaysDefinedByMeDirectly: [
                    { overlaysDefiningMeDirectly: [me] },
                    [areaOfClass, "PermIntOverlay"]
                ],
                intOverlaysIncludingMeDirectly: [
                    { overlaysIncludedInMeDirectly: [me] },
                    [areaOfClass, "PermIntOverlay"]
                ],
                intOverlaysExcludingMeDirectly: [
                    { overlaysExcludedFromMeDirectly: [me] },
                    [areaOfClass, "PermIntOverlay"]
                ]
            },
            write: {
                // so that when they return to be zoomBoxed, and they will start there as Minimized, they will be on show, and won't show their solutionSet.
                onPermIntExtOverlayZoomBoxed: {
                    upon: [not, [{ zoomBoxed: _ }, [me]]],
                    true: {
                        turnOffOverlayShowSolutionSet: {
                            to: [{ showSolutionSet: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent intensional overlay. 
    // it is inherited by the Overlay class variant for intensional overlays. It inherits PermIntExtOverlay (common code to permanent overlays), and by IntOverlay (common code
    // to intensional overlays - permanent and ephemeral).
    //
    // this class calculates the nonOMFInventoryUniqueIDs, and adds to them the uniqueIDs for the OMFs (excluding the OMF representing this very overlay), to form the 
    // selectableFacetUniqueIDs needed to construct the data for the areaSet of selectableFacetXIntOverlays in IntOverlay.
    //
    // overlays defining me: we calculate both the overlays defining me directly and indirectly. those defining me indirectly are calculated recursively: they are those defining the
    // overlays defining me directly.
    // for example, if oA := oB, and oB := oC X oD, then oA is defined directly by oB, and indirectly by oC and oD.
    // these relationships are used in allowing an overlay to prevent circular dependencies in the definition of intensional overlays. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntOverlay: {
        "class": o("IntOverlay"),
        context: {
            // unify the uniqueID of the other overlays (regardless of whether they are currently used to define this intensional overlay!)
            // and the nonOMFacets: this is to allow all SelectableFacets (including those not yet created, for OMFs not yet showing) to be represented in the PermIntOverlay's content
            selectableFacetUniqueIDs: o(
                [{ nonOMFInventoryUniqueIDs: _ }, [me]], // see IntOverlay
                // Obtain the uniqueIDs of *other* overlays.
                // Note: the OMFs have the uniqueID of their corresponding Overlay, but we don't query the OMFs, as some overlays may participate in the 
                // selection before having an OMF, and can do so without ever having an OMF - currently the only example is the blacklist overlay, whose
                // solutionSet is excluded by default from the intensional overlays solutionSet, and to which the user may add items without ever showing the
                // blacklist's OMF - by clicking on the black X on the item row.
                // In short, we query the uniqueID of the Overlay, and not the OMF, as that's guaranteed to include the blacklist's uniqueID.
                [
                    n([{ uniqueID: _ }, [me]]),
                    [{ uniqueID: _ }, [areaOfClass, "Overlay"]]
                ]
            ),
            selectionsObjOfOMFsIncludedInMe: [
                { selectionMode: "included" },
                [{ content: _ }, [me]]
            ],
            selectionsObjOfOMFsExcludedFromMe: [
                { selectionMode: "excluded" },
                [{ content: _ }, [me]]
            ],
            overlaysIncludedInMeDirectly: [
                { uniqueID: [{ selectionsObjOfOMFsIncludedInMe: { uniqueID: _ } }, [me]] },
                [areaOfClass, "Overlay"]
            ],
            overlaysExcludedFromMeDirectly: [
                { uniqueID: [{ selectionsObjOfOMFsExcludedFromMe: { uniqueID: _ } }, [me]] },
                [areaOfClass, "Overlay"]
            ],
            // to be used by the intensional OMF variant to calculate which OSRS it should intersect with
            // the uniqueID of the OMF is the same as the uniqueID of the corresponding Overlay
            overlaysDefiningMeDirectly: o(
                [{ overlaysIncludedInMeDirectly: _ }, [me]],
                [{ overlaysExcludedFromMeDirectly: _ }, [me]]
            ),
            // the recursive step: those indirectly defining me are those defining the overlays directly defining me
            // may be repetitions with respect to overlaysDefiningMeDirectly (e.g. two intensional overlays, A & B, where A := B, and both also have Not(Blacklist), by default)                
            overlaysDefiningMeIndirectly: [{ overlaysDefiningMeDirectly: { overlaysDefiningMe: _ } }, [me]],
            overlaysDefiningMe: o(
                [{ overlaysDefiningMeDirectly: _ }, [me]],
                [{ overlaysDefiningMeIndirectly: _ }, [me]]
            )
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanPermIntOverlay: {
        "class": o("LeanPermIntExtOverlay", "PermIntOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermIntOverlay: {
        "class": o("FatPermIntExtOverlay", "PermIntOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent extensional overlay. it inherits ExtOverlay PermIntExtOverlay.
    //
    // overlaysDefiningMe: defined to be the empty os - required for the intensional overlays' recursive calculation of overlaysDefiningMe.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermExtOverlay: {
        "class": o("ExtOverlay"),
        context: {
            overlaysDefiningMe: o()
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanPermExtOverlay: {
        "class": o("LeanPermIntExtOverlay", "PermExtOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermExtOverlay: {
        "class": o("FatPermIntExtOverlay", "PermExtOverlay")
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A few auxiliary classes, inherited by overlay classes. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An auxiliary class which resets an extensional overlay. It is inherited by write handlers in the IntExtOverlay class
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ResetExtOverlay: {
        resetContent: {
            to: [{ content: _ }, [me]],
            merge: o()
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // in a ZCApp which is not a preloaded app, we require the user to select the facet that uniquely identifies items in an extensional overlay ("List").
    // API: 
    // 1. myOverlay
    // 2. positioning
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOverlayUniqueIDFacetSelectionMenuable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                updateAppItemUniqueID: o(
                    [not, [{ myApp: { itemUniqueIDValid: _ } }, [me]]],
                    [{ myApp: { itemUniqueID: "recordId" } }, [me]]
                ),
                logicalSelectionInCurrentDatasource: [
                    [{ dropDownMenuLogicalSelection: _ }, [me]],
                    [{ myApp: { facetData: { uniqueID: _ } } }, [me]]
                ]
            }
        },
        { // default
            "class": "DropDownMenuable",
            context: {
                dropDownMenuLogicalSelectionsOS: [{ myApp: { itemUniqueIDCandidateFacets: { uniqueID: _ } } }, [me]],
                dropDownMenuDisplaySelectionsOS: [{ myApp: { itemUniqueIDCandidateFacets: { name: _ } } }, [me]],
                dropDownMenuLogicalSelection: [{ myOverlay: { crossViewOverlayDataObj: { itemUniqueID: _ } } }, [me]]
            },
            position: {
                width: [densityChoice, [{ facetNameTextSize: { maxWidth: _ } }, [globalDefaults]]],
            }
        },
        { // after the user made teh selection, they may switch to another datasource, in which the itemUniqueID is not present.
            // in that case, we want to display dropDownMenuTextForNoSelection
            qualifier: { logicalSelectionInCurrentDatasource: false },
            context: {
                displayText: [{ dropDownMenuTextForNoSelection: _ }, [me]]
            }
        },
        {
            qualifier: { updateAppItemUniqueID: true },
            write: {
                onExtOverlayUniqueIDFacetSelectionMenuableChangedSelection: {
                    upon: [and,
                        [{ dropDownMenuLogicalSelection: _ }, [me]],
                        [changed, [{ dropDownMenuLogicalSelection: _ }, [me]]]
                    ],
                    true: {
                        setAppItemUniqueID: {
                            to: [{ myApp: { itemUniqueID: _ } }, [me]],
                            merge: [{ dropDownMenuLogicalSelection: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            context: {
                displayDropDownMenuSearchBox: false
            },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ExtOverlayUniqueIDFacetSelectionMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOverlayUniqueIDFacetSelectionMenu: {
        "class": "DropDownMenu",
        context: {
            scrollbar: {
                attachToView: "end",
                attachToViewOverlap: true
            }
        },
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "ExtOverlayUniqueIDFacetSelectionMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExtOverlayUniqueIDFacetSelectionMenuLine: {
        "class": o("ExtOverlayUniqueIDFacetSelectionMenuLineDesign", "GeneralArea", "DropDownMenuLine")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Overlay Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A tracking class that allows access to an overlay's state.
    //
    // API: an areaRef to myOverlay (by default, it's the embedding overlay)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofZoomBoxedOverlay: [{ myOverlay: { zoomBoxed: _ } }, [me]],
                ofExpandedOverlay: [{ myOverlay: { expanded: _ } }, [me]],
                ofMaximizedOverlay: [{ myOverlay: { maximized: _ } }, [me]],
                ofExpandedOrMaximizedOverlay: o(
                    [{ ofExpandedOverlay: _ }, [me]],
                    [{ ofMaximizedOverlay: _ }, [me]]
                ),
                ofMinimizedOverlay: [{ myOverlay: { minimized: _ } }, [me]],
                ofTrashedOverlay: [{ myOverlay: { trashed: _ } }, [me]],
                ofZoomBoxedOrTrashed: o(
                    [{ ofZoomBoxedOverlay: _ }, [me]],
                    [{ ofTrashedOverlay: _ }, [me]]
                ),
                ofZoomBoxingOverlay: [{ myOverlay: { zoomBoxing: _ } }, [me]],
                ofFirstZoomBoxingOverlay: [equal,
                    [{ myOverlay: _ }, [me]],
                    [{ myApp: { firstZoomBoxingOverlay: _ } }, [me]]
                ],
                ofLastZoomBoxingOverlay: [equal,
                    [{ myOverlay: _ }, [me]],
                    [{ myApp: { lastZoomBoxingOverlay: _ } }, [me]]
                ],
                ofGlobalBaseOverlay: [equal,
                    [{ myOverlay: _ }, [me]],
                    [{ myApp: { globalBaseOverlay: _ } }, [me]]
                ],
                ofEffectiveBaseOverlay: [equal,
                    [{ myOverlay: _ }, [me]],
                    [{ myApp: { effectiveBaseOverlay: _ } }, [me]]
                ],

                ofBlacklistOverlay: [equal, // we check the uniqueID, as there may not be a blacklist at all (e.g. myLean)
                    [{ myOverlay: { uniqueID: _ } }, [me]],
                    [
                        getOverlayUniqueID,
                        fsAppConstants.defaultBlacklistCounter
                    ]
                ],

                ofIntOverlay: [
                    "PermIntOverlay",
                    [classOfArea, [{ myOverlay: _ }, [me]]]
                ],
                ofExtOverlay: [
                    "PermExtOverlay",
                    [classOfArea, [{ myOverlay: _ }, [me]]]
                ],
                ofIntersectionModeOverlay: [{ myOverlay: { intersectionMode: _ } }, [me]], // defined only for an intensional overlay!

                showSolutionSet: [{ myOverlay: { showSolutionSet: _ } }, [me]],
                show: [{ myOverlay: { show: _ } }, [me]],

                additionalOverlayControlsOpen: [{ myOverlay: { moreControlsOpen: _ } }, [me]],
                interactingWithOverlayElements: [{ myOverlay: { interactingWithOverlayElements: _ } }, [me]],

                intOverlaysDirectlyDefinedByMyOverlayExist: [{ myOverlay: { intOverlaysDefinedByMeDirectly: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myOverlay: [
                    [embeddingStar, [me]],
                    [areaOfClass, "Overlay"]
                ],
                myVisibleOverlay: [{ myOverlay: { myVisibleOverlay: _ } }, [me]],

                myOSR: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OSR"]
                ],
                myOSRControls: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OSRControls"]
                ],
                mySolutionSetViewControl: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "SolutionSetViewControl"]
                ],
                myOverlayMoreControls: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OverlayMoreControls"]
                ],
                myOverlayName: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OverlayName"]
                ],

                overlayTypeString: [cond,
                    [{ ofIntOverlay: _ }, [me]],
                    o(
                        { on: true, use: "Filter" },
                        { on: false, use: "List" }
                    )
                ],
                overlayColor: [{ myOverlay: { color: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of VisibleOverlay classes & their embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the PermIntExtOverlay and in the GlobalBaseOverlay.
    //
    // It has a set of variants corresponding to the different overlay states, in which addendum classes are inherited (other than ZoomBoxingVisibleOverlay, the rest are Lean/Fat).
    // These variants each define osOfPeerVisibleOverlays - the subset of VisibleOverlays pertaining to the Overlays which share a given state (e.g. minimized).
    // 
    // It inherits:
    // 1. VisibleOverlayLayout: the class that handles most of the visible overlay's positioning. Separated for readability.
    // 
    // It embeds:
    // 1. OSR: Overlay Summary Row (Lean/Fat).
    // 2. SolutionSetView: when the overlay is in the appropriate state, the solution set view is displayed.
    //
    // API:
    // 1. osOfPeerVisibleOverlays: an os of areas inheriting VisibleOverlay, all sharing the same viewing state. It is used to position the VisibleOverlay.    
    // 2. Vertical/Horizontal: the inheriting class should inherit exactly one of the two at any given moment.
    // 3. myView: an areaRef to an OverlaysView class.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisibleOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedOSR: o(
                    [{ inView: _ }, [me]],
                    [{ iAmDraggedToReorder: _ }, [me]]
                )
            }
        },
        { // default
            "class": o(
                "MinWrap",
                "ZTop",
                "TrashableElement",
                "TrackAppTrash",
                "TrackMyOverlay"
            ),
            context: {
                // TrashableElement params:
                uniqueID: [{ myOverlay: { uniqueID: _ } }, [me]],
                trashedOrder: [{ myApp: { trashedOrderOverlayUniqueID: _ } }, [me]],
                expandedOrder: [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]],

                // MinWrap param:
                minWrapAround: 0,

                osOfPeerVisibleOverlays: [cond,
                    [{ ofMaximizedOverlay: _ }, [me]],
                    o(
                        { on: true, use: [me] }, // if a maximized overlay, then it's the only one in its set, by definition.
                        {
                            on: false,
                            use: [ // select those visible overlays with a similar expansion state to mine
                                { ofExpandedOverlay: [{ ofExpandedOverlay: _ }, [me]] },
                                [{ myApp: { permOverlays: { myVisibleOverlay: _ } } }, [me]]
                            ]
                        }
                    )
                ],
                // osOfPeerVisibleOverlays provided by the classes inherited by the variants below
                firstInVisibleOverlaysPeerOS: [equal,
                    [me],
                    [first, [{ osOfPeerVisibleOverlays: _ }, [me]]]
                ],
                lastInVisibleOverlaysPeerOS: [equal,
                    [me],
                    [last, [{ osOfPeerVisibleOverlays: _ }, [me]]]
                ],
                prevInPeerVisibleOverlaysOS: [prev,
                    [{ osOfPeerVisibleOverlays: _ }, [me]],
                    [me]
                ],

                verticalVisibleOverlay: [
                    "Vertical",
                    [classOfArea, [me]]
                ],

                // TrashableElement param:
                trashed: [{ myOverlay: { trashed: _ } }, [me]]

            },
            stacking: {
                aboveOverlaysView: {
                    lower: { element: [areaOfClass, "OverlaysView"] },
                    higher: { element: [me] }
                }
            }
        },
        {
            qualifier: { showSolutionSet: false },
            position: {
                attachToBottomOfOSR: {
                    point1: {
                        element: [{ children: { oSR: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom",
                        content: true
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { showSolutionSet: true },
            position: {
                attachToBottomOfSolutionSetView: {
                    point1: {
                        element: [{ children: { solutionSetView: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom",
                        content: true
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofTrashedOverlay: true },
            "class": "TrashedVisibleOverlay"
        },
        // layout in minimized/trashed will be done by the Matrix classes
        {
            qualifier: { ofExpandedOverlay: true },
            "class": "VisibleOverlayLayout"
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            "class": "VisibleOverlayLayout"
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            "class": compileMinimizedOverlays ? "MinimizedVisibleOverlay" : o()
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            stacking: {
                belowLayerAboveOverlaysZBottom: {
                    lower: [me],
                    higher: {
                        element: [{ myApp: _ }, [me]],
                        label: "layerAboveOverlaysZBottom"
                    }
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            stacking: {
                aboveLayerAboveOverlaysZBottom: {
                    lower: {
                        element: [{ myApp: _ }, [me]],
                        label: "layerAboveOverlaysZBottom"
                    },
                    higher: [me]
                },
                belowLayerAboveOverlaysZTop: {
                    lower: [me],
                    higher: {
                        element: [{ myApp: _ }, [me]],
                        label: "layerAboveOverlaysZTop"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanVisibleOverlay: o(
        { // default
            "class": "VisibleOverlay"
        },
        {
            qualifier: { embedOSR: true },
            children: {
                oSR: { // OverlaySummaryRow
                    description: {
                        "class": "LeanOSR"
                    }
                }
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            "class": "LeanZoomBoxingVisibleOverlay"
        },
        {
            qualifier: { ofExpandedOverlay: true },
            "class": "LeanExpandedVisibleOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatVisibleOverlay: o(
        { // default
            "class": o("VisibleOverlay",
                "TrackOverlayMaximization"
            )
        },
        {
            qualifier: { embedOSR: true },
            children: {
                oSR: { // OverlaySummaryRow
                    description: {
                        "class": "FatOSR"
                    }
                }
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            "class": "FatZoomBoxingVisibleOverlay"
        },
        {
            qualifier: { ofExpandedOverlay: true },
            "class": "FatExpandedVisibleOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the VisibleOverlay class when the embedding overlay is either in expanded or maximized.
    // It inherits:
    // 1. VerticalReorderableVisibleOverlay, which allows it to be reordered by drag&drop on the vertical axis (Fat).
    // 2. TrashableVisibleOverlay, which allows switching the embedding overlay to Trashed by a drag&drop of the VisibleOverlay on the trash (Fat).
    //
    // This class embeds OverlaySolutionSetView, when it's in the appropriate state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedVisibleOverlay: o(
        { // default
            "class": o("Vertical", "VerticalReorderableVisibleOverlay", "TrashableVisibleOverlay"),
            context: {
                inView: true, // doesn't inherit InView, so this is the default def
                myView: [areaOfClass, "ExpandedOverlaysView"],
                // VerticalReorderableVisibleOverlay param 
                reorderingZPlaneAboveApp: false // flipping the default value, so that the *dragged* visible overlay would appear below the facet panes, and their embedded facets.                
            },
            position: {
                leftConstraint: {
                    point1: {
                        element: [{ myView: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                rightConstraint: {
                    point1: {
                        element: [{ myView: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0
                }
            },
            // When a visible overlay in the standard view is dragged towards the minimized overlays view, at some point its state is changed to "Minimize".
            // currently: when the dragged visible overlay's top is below the minimized overlays view's top.
            write: {
                onExpandedVisibleOverlayDraggedToMinimization: {
                    upon: [and,
                        [{ inDraggingOperation: _ }, [me]],
                        [greaterThan,
                            [offset,
                                {
                                    element: [areaOfClass, "MinimizedOverlaysView"],
                                    type: "top"
                                },
                                {
                                    type: "top"
                                }
                            ],
                            0
                        ]
                    ],
                    true: {
                        "class": "MinimizeOverlayAction"
                    }
                },
                onExpandedVisibleOverlayPushedToMinimization: {
                    upon: [and,
                        [not, [{ inDraggingOperation: _ }, [me]]],
                        [greaterThan,
                            [offset,
                                {
                                    element: [areaOfClass, "ExpandedOverlaysView"],
                                    type: "bottom"
                                },
                                { type: "top" }
                            ],
                            0
                        ]
                    ],
                    true: {
                        "class": "MinimizeOverlayAction"
                    }
                }
            }
        },
        {
            qualifier: { showSolutionSet: true },
            "class": compileItems ? "EmbedSolutionSetView" : o()
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbedSolutionSetView: {
        children: {
            solutionSetView: {
                description: {
                    "class": "OverlaySolutionSetView"
                }
            },
            solutionSetScrollbar: {
                description: {
                    "class": "OverlaySolutionSetScrollbar"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetScrollbar: o(
        { // default
            "class": o("GeneralArea", "VerticalScrollbarContainerOfSnappable", "AboveSiblings", "TrackMyOverlay"),
            context: {
                // VerticalScrollbarContainerOfSnappable params
                showOnlyWhenInView: true,
                movableController: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OverlaySolutionSetView"]
                ],
                createButtons: false, // override default definition
                attachToViewOverlap: true, // override default definition 
                view: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "OverlaySolutionSetViewInFrozenPane"]
                ]
            },
            stacking: {
                keepBelowVisibleOverlayZTop: {
                    // because it inherited AboveSiblings, we need to re-specify it's z-lower than the author-defined label: "zTop" of the embedding* VisibleOverlay
                    lower: [me],
                    higher: {
                        element: [{ myVisibleOverlay: _ }, [me]],
                        label: "zTop"
                    }
                }
            }
        },
        {
            qualifier: { overlaySolutionSetViewScrollbarABTest: "V1" },
            context: {
                attachToView: "beginning"
            }
        },
        {
            qualifier: { overlaySolutionSetViewScrollbarABTest: "V2" },
            context: {
                attachToView: "end",
                attachToViewEndAnchor: [{ myApp: { rightOfFrozenFacetViewPane: _ } }, [me]]
            }
        },
        {
            qualifier: { overlaySolutionSetViewScrollbarABTest: "V3" },
            context: {
                attachToView: "end"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanExpandedVisibleOverlay: {
        "class": "ExpandedVisibleOverlay"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatExpandedVisibleOverlay: {
        "class": "ExpandedVisibleOverlay"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the VisibleOverlay class when the embedding overlay is minimized.
    // It inherits:
    // 1. HorizontalReorderableVisibleOverlay, which allows it to be reordered by drag&drop on the horizontal axis (Fat).
    // 2. TrashableVisibleOverlay, which allows switching the embedding overlay to Trashed by a drag&drop of the VisibleOverlay on the trash (Fat).
    // 3. If the visible overlay is dragged: StateChangeWhileBeingDraggedUp, a class that allows changing the embedding overlay's state when dragged up beyond a threshold (Fat).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedVisibleOverlay: o(
        {
            qualifier: "!",
            context: {
                matchSearchStr: [
                    s([{ currentSearchStr: _ }, [areaOfClass, "MinimizedOverlaySearchBox"]]),
                    [{ myOverlay: { name: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o(
                "StateChangeWhileBeingDraggedUp",
                "TrashableVisibleOverlay",
                "TrackAppTrash"
            ),
            context: {
                // VisibleOverlay param
                myView: [areaOfClass, "MinimizedOverlaysView"]
            },
            write: {
                onVisibleOverlayDraggedAboveExpansionThreshold: {
                    // upon: defined in StateChangeWhileBeingDraggedUp
                    true: {
                        "class": "ExpandOverlayAction"
                    }
                }
            }
        },
        {
            qualifier: { matchSearchStr: false },
            "class": o("ZeroDimensions")
        },
        {
            qualifier: { matchSearchStr: true },
            "class": "MatrixVisibleOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandOverlayAction: {
        expandOverlay: {
            to: [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]],
            merge: o(
                [{ myOverlay: { uniqueID: _ } }, [me]],
                [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]]
            )
        },
        showSolutionSet: {
            to: [{ showSolutionSet: _ }, [me]],
            merge: true
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizeOverlayAction: {
        minimizeOverlay: {
            to: [ // remove myOverlay's uniqueID from expandedOverlayUniqueIDs
                [{ myOverlay: { uniqueID: _ } }, [me]],
                [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]]
            ],
            merge: o()
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the VisibleOverlay when in the Standard/Minimized states. 
    // It tracks whether it overlaps with the AppTrash. If so, this class defines a modal dialog on mouseUp, to obtain the user's OK for trashing operation
    //
    // It's OnAct (enabledActModalDialogActControl) handler handles the modification of the embedding overlay's state to Trashed.
    // If there are intensional overlays directly defined by the overlay being trashed, then this class sets the selectionsObj in their content which pertains to the overlay being
    // trashed, to "notDefined" (i.e. removes the "exclude"/"include" selection that was previously there).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashableVisibleOverlay: o(
        { // default 
        },
        {
            qualifier: { ofBlacklistOverlay: false },
            "class": o("DraggableToTrashElement"), // used when dropping a VisibleOverlay on the Trash
            context: {
                // DraggableToTrashElement param
                draggingToTrash: [{ inDraggingOperation: _ }, [me]]
            },
            write: {
                onTrashableVisibleOverlayOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        trashOverlay: {
                            to: [{ ofTrashedOverlay: _ }, [me]],
                            merge: true
                        },
                        removeFromExpandedOverlayUniqueIDs: {
                            to: [
                                [{ myOverlay: { uniqueID: _ } }, [me]],
                                [{ myApp: { expandedOverlayUniqueIDs: _ } }, [me]]
                            ],
                            merge: o()
                        },
                        markAsFirstInTrashedOrderOverlayUniqueID: {
                            to: [{ myApp: { trashedOrderOverlayUniqueID: _ } }, [me]],
                            merge: push([{ myOverlay: { uniqueID: _ } }, [me]])
                        },
                        selectTrashOverlayTab: { // if the trash will be opened now, it will be on the overlay tab
                            to: [{ appTrash: { selectedTab: _ } }, [me]],
                            merge: [{ appTrash: { overlayTabData: _ } }, [me]]
                        }
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
                        "class": "TrashOverlayModalDialog"
                    }
                }
            }
        },
        {
            qualifier: { intOverlaysDirectlyDefinedByMyOverlayExist: true },
            context: {
                stableSelectionsObj: [
                    {
                        uniqueID: [{ myOverlay: { uniqueID: _ } }, [me]],
                        myOverlay: [{ myOverlay: { intOverlaysDefinedByMeDirectly: _ } }, [me]]
                    },
                    [areaOfClass, "OMFacetXIntOverlay"]
                ]
            },
            write: {
                onTrashableVisibleOverlayOnAct: {
                    // upon: see variant above
                    true: {
                        // disconnect the overlay being trashed from those intensional overlays in whose definition it participates. 
                        // We do this by resetting the selectionMode field in the object describing my overlay in the OMFacetXIntOverlay of the intensional overlay 
                        // directly defined by my overlay. Note that there could be multiple such intensional overlays.
                        resetSelectionMode: {
                            to: [{ stableSelectionsObj: { selectionMode: _ } }, [me]],
                            merge: "notDefined"
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the VisibleOverlay class when the embedding overlay is trashed.
    // See TrashedVisibleOverlaysDoc
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedVisibleOverlay: {
        "class": "InView",
        context: {
            myView: [areaOfClass, "TrashTabView"], // VisibleOverlay param, for clipping when scrolled out of view!
            // Override WrapAround params (via TrashableElement)
            waController: [areaOfClass, "TrashedVisibleOverlaysDoc"]
        },
        position: {
            width: [densityChoice, [{ fsAppPosConst: { widthOfOSRControls: _ } }, [globalDefaults]]],
            height: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixVisibleOverlay: {
        "class": o(
            "ReorderableVisibleOverlayCore", // appears before MatrixCell to override its definition of inDraggingOperation 
            "MatrixCell",
            "InView"),
        context: {
            // MatrixCell params:
            matrixUniqueID: [{ myOverlay: { uniqueID: _ } }, [me]],
            myMatrix: [
                [areaOfClass, "Matrix"],
                [embedded, [{ myView: _ }, [me]]]
            ],
            // inDraggingOperation: see ReorderableVisibleOverlayCore - overrides default definition in MatrixCell
            tmd: [{ myReorderHandle: { tmd: _ } }, [me]],
            entireCellDraggable: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an auxiliary inherited by TrashedVisibleOverlay/MinimizedVisibleOverlay. 
    // API:
    // 1. myView: an areaRef to the view over which the VisibleOverlay is positioned.
    // 2. onVisibleOverlayDraggedAboveExpansionThreshold's true clause (and/or "false", for that matter)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StateChangeWhileBeingDraggedUp: o(
        {
            qualifier: { iAmDraggedToReorder: true },
            write: {
                onVisibleOverlayDraggedAboveExpansionThreshold: {
                    upon: [greaterThan,
                        [offset,
                            {
                                type: "bottom"
                            },
                            {
                                element: [areaOfClass, "FrozenFacetViewPane"],
                                type: "bottom"
                            }
                        ],
                        0
                    ]
                    // true: provided by inheriting classes
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows a visible overlay to be reordered along the vertical axis, wrt other visible overlays sharing its state.
    // It is inherited by the ExpandedVisibleOverlay. It inherits ReorderableVisibleOverlay, and VerticalVisReorderable.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalReorderableVisibleOverlay: {
        "class": o("ReorderableVisibleOverlay", // should appear before the VisReorderable so as to override its default definitions
            "VerticalVisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows a visible overlay to be reordered along the horizontal axis, wrt other visible overlays sharing its state.
    // it is inherited by the MinimizedVisibleOverlay and the TrashedVisibleOverlay. it inherits ReorderableVisibleOverlay, and HorizontalVisReorderable.
    //
    // when being dragged, its vertical-center is to match the vertical-center of its view
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*HorizontalReorderableVisibleOverlay: o(
        { // default
            "class": o("ReorderableVisibleOverlay", // should appear before the VisReorderable so as to override its default definitions
                       "HorizontalVisReorderable")
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            "class": "VerticalPositionWRTView"
        }
    ),*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows VisibleOverlays to position themselves verticall wrt their view. It is currently inherited by overlays in the minimized and trashed states.
    //    
    // API:
    // 1. myView: an areaRef to its view.
    // 2. viewVerticalRefPoint: "vertical-center" by default
    // 3. offsetFromViewVerticalRefPoint: default provided. note the offset is *to* the view's vertical reference point, and not *from* it: 
    //    a positive value for offsetFromViewVerticalRefPoint will position the inheriting area above it's view's vertical reference point.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalPositionWRTView: {
        context: {
            viewVerticalRefPoint: "vertical-center",
            offsetFromViewVerticalRefPoint: bFSAppPosConst.visibleOverlayVerticalOffsetFromViewRefPoint
        },
        position: {
            verticalPositionWRTView: {
                point1: {
                    type: [{ viewVerticalRefPoint: _ }, [me]]
                },
                point2: {
                    element: [{ myView: _ }, [me]],
                    type: [{ viewVerticalRefPoint: _ }, [me]]
                },
                equals: [{ offsetFromViewVerticalRefPoint: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReorderableVisibleOverlayCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inDraggingOperation: o( // also param for MatrixCell, overriding its default value
                    [{ iAmDraggedToReorder: _ }, [me]],
                    // i.e. dragged&dropped over the AppTrash, and awaiting user's response to confirmation dialog
                    [{ droppedElementForModalDialogable: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("DraggableToReorder", "TrackAppTrash", "TrackMyOverlay"),
            context: {
                myReorderHandle: [{ myOSR: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class supports a visible overlay which can be reordered wrt its peers (i.e. other VisibleOverlays whose embedding Overlay shares the same state) via drag&drop.
    // The inheriting classes, HorizontalReorderableVisibleOverlay/VerticalReorderableVisibleOverlay, also inherit HorizontalVisReorderable/VerticalVisReorderable, respectively.
    // 
    // This class positions the visible overlay wrt its peers. it also handles the visible overlay's zIndex, both when dragged and not.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReorderableVisibleOverlay: {
        "class": o("ReorderableVisibleOverlayCore"),
        context: {
            // VisReorderable Params (beginDraggedToReorder defined in variant-controller above)
            reorderableController: [{ myApp: _ }, [me]],
            myReorderable: [{ myOverlay: { uniqueID: _ } }, [me]],
            visReordered: [{ osOfPeerVisibleOverlays: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the VisibleOverlay. It defines its position on the main axis of the view it's on (vertical in Standard View, horizontal otherwise).
    // Note that logicalBeginning/logicalEnd here are provided by the sibling VisReorderable, where these are mapped to the reordering beginningOfVisReorderable/endOfVisReorderable 
    // posPoint labels
    // 
    // API:
    // 1. firstInVisibleOverlaysPeerOS/lastInVisibleOverlaysPeerOS
    // 2. myView
    //    (this is beginning/end in the Lean version, and the beginningOfVisReorderable/endOfVisReorderable in the Fat version).
    // 3. Horizontal/Vertical.
    // 4. firstVisibleOverlayFromBeginningOfView/visibleOverlaySpacingFromItsPrev: default values provided, per vertical/horizontal visible overlay.
    // 5. prevInPeerVisibleOverlaysOS,
    // 6. spacingFromPrev
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisibleOverlayLayout: o(
        { // default
            "class": o("GeneralArea", "MemberOfPositionedAreaOS"),
            context: {
                myAreaOSPosPoint: [{ logicalBeginning: _ }, [me]],
                myPrevInAreaOSPosPoint: [{ prevInPeerVisibleOverlaysOS: { logicalEnd: _ } }, [me]]
            }
        },
        {
            qualifier: { verticalVisibleOverlay: true },
            context: {
                firstVisibleOverlayFromBeginningOfView: bFSAppPosConst.firstVerticalVisibleOverlayFromTopOfView,
                spacingFromPrev: bFSAppPosConst.verticalVisibleOverlaysSpacing
            }
        },
        {
            qualifier: { verticalVisibleOverlay: false },
            context: {
                firstVisibleOverlayFromBeginningOfView: bFSAppPosConst.firstHorizontalVisibleOverlayFromLeftOfView,
                spacingFromPrev: bFSAppPosConst.horizontalVisibleOverlaysSpacing
            }
        },
        {
            qualifier: { firstInVisibleOverlaysPeerOS: true },
            position: {
                firstVisibleOverlayToView: {
                    point1: [{ myView: { beginningOfOverlaysView: _ } }, [me]],
                    point2: [{ logicalBeginning: _ }, [me]],
                    equals: [{ firstVisibleOverlayFromBeginningOfView: _ }, [me]]
                }
            }
        },
        {
            qualifier: { lastInVisibleOverlaysPeerOS: true },
            position: {
                lastVisibleOverlayToEndBeforeEndOfView: {
                    point1: [{ logicalEnd: _ }, [me]],
                    point2: [{ myView: { endOfOverlaysView: _ } }, [me]],
                    min: 0, // min and not equals as there could be a single expanded visible overlay that's not showing its OverlaySolutionSetView, 
                    // and so its endOfVisReorderable doesn't match the bottom of ExpandedOverlaysView
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the VisibleOverlay class when the embedding overlay is in the ZoomBoxing state.
    // If this class is of the effectiveBaseOverlay, and that effectiveBaseOverlay is in the showSolutionSet state, it embeds an OverlaySolutionSetView.
    // 
    // osOfPeerVisibleOverlays: unlike the zoomBoxed overlays, which calculate their osOfPeerVisibleOverlays off of the permOverlays, 
    // here we rely on the zoomBoxingOverlays os, into which we *push* the areaRef of the overlay being moved to the AppFrame
    //
    // API:
    // 1. horizontalSpacingOfOSRs: default provided
    // 2. osOfPeerVisibleOverlays: the os of VisibleOverlays from which they will be laid out sequentially. 
    //    Default value provided: the VisibleOverlays of all visibleZoomBoxingOverlays.
    // 3. The horizontal positioning of the OSRS of the osOfPeerVisibleOverlays (and not of the VisibleOverlay areas, as those extend across the entire 
    //    width of the app, in case the zoomBoxing overlay displays its OverlaySolutionSetView)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingVisibleOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inView: true // override the VerticalInView inherited in VisibleOverlay
            }
        },
        { // default
            "class": "Horizontal",
            context: {
                myView: [areaOfClass, "ZoomBoxingOverlaysClipper"],
                osOfPeerVisibleOverlays: [{ myApp: { visibleZoomBoxingOverlays: { children: { visibleOverlay: _ } } } }, [me]],

                horizontalSpacingOfOSRs: bFSAppPosConst.horizontalSpacingOfZoomBoxingOSRs
            }
        },
        {
            qualifier: {
                ofZoomBoxingOverlay: true,
                showSolutionSet: true
            },
            "class": "EmbedSolutionSetView",
            position: {
                attachToBottomOfZoomBoxTop: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "ZoomBoxTop"],
                        type: "bottom"
                    },
                    equals: bFSAppPosConst.bottomOfZoomBoxingVisibleOverlayToBottomOfZoomBoxTop
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The only reason we need Lean* and Fat* here is so that the definition of osOfPeerVisibleOverlays provided in ZoomBoxingVisibleOverlay overrides the default definition provided 
    // in LeanVisibleOverlay's default clause.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanZoomBoxingVisibleOverlay: {
        "class": "ZoomBoxingVisibleOverlay"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatZoomBoxingVisibleOverlay: {
        "class": "ZoomBoxingVisibleOverlay"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of VisibleOverlay Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the Overlay Summary Row, a row which displays the overlay's type (intensional/extensional), and its solutionSet's size. If the overlay is an intensional
    // one, this row also displays its selections in the various facets. 
    // This Overlay Summary Row embeds various controls of the overlay's state.
    //
    // It is embedded in the VisibleOverlay.  
    // It embeds:
    // 1. OSRControls (Lean/Fat)
    // 2. OverlayHandle (Fat): if createOverlayHandle is true (which happens if we're in a Standard/Minimized/Trashed overlay, and are either hovering over the OSRControls, or already 
    //    with a mouseDown on the overlayHandle, this class creates an intersection area OverlayHandle, which allows dragging the overlay around the zoomBox, thus changing its
    //    order relative to other overlays and/or its state.
    //
    // Inheritance (Fat):
    // when this class is in an intensional overlay in the expanded state, it inherits StandardIntOSR, which provides the copy-paste of selections functionality (see documentation there).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                oSRDraggable: [and,
                    [{ ofZoomBoxedOverlay: _ }, [me]],
                    [not, [{ ofMaximizedOverlay: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("OSRDesign", "GeneralArea", "OverlayDelayedInArea", "TrackMyOverlay", "TrackAppTrash"),
            context: {
                height: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]]
            },
            position: {
                top: 0,
                height: [{ height: _ }, [me]]
            }
        },
        {
            qualifier: { ofExpandedOverlay: true },
            context: {
                height: [densityChoice, [{ fsAppPosConst: { expandedOSRHeight: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { ofZoomBoxedOrTrashed: true },
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            context: {
                hoveringOverFillableFacetInfoIcon: [
                    { inFocus: true },
                    [areaOfClass, "FillableFacetInfo"]
                ],
                embedInfoFrame: [and,
                    [not, [{ myOverlay: { emptyStableSolutionSet: _ } }, [me]]],
                    [{ hoveringOverFillableFacetInfoIcon: _ }, [me]]
                ]
            },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: {
                ofMinimizedOverlay: true,
                embedInfoFrame: true
            },
            "class": "EmbedInfoFrame"
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            position: {
                anchorToZoomBoxingOverlaysViewTop: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxingOverlaysView"],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: bFSAppPosConst.marginAboveZoomBoxingOSR
                },
                anchorToZoomBoxingOverlaysViewBottom: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "ZoomBoxingOverlaysView"],
                        type: "bottom"
                    },
                    equals: bFSAppPosConst.marginBelowZoomBoxingOSR
                }
            }
        },
        {
            qualifier: { ofMaximizedOverlay: true },
            position: {
                left: 0
            }
        },
        {
            qualifier: { oSRDraggable: true },
            "class": "OverlayHandle"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanOSR: {
        "class": "OSR",
        children: {
            oSRControls: {
                description: {
                    "class": "LeanOSRControls"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOSR: o(
        { // default
            "class": "OSR"
        },
        {
            qualifier: {
                ofIntOverlay: true,
                ofExpandedOverlay: true
            },
            "class": "StandardIntOSR"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by a variant of the OSR class. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StandardIntOSR: {
        context: {
            // for now, mySelectableFacetXIntOSRs is only for the facets in the moving pane - i.e. not for the OMFs
            mySelectableFacetXIntOSRs: [
                { myOSR: [me] },
                [areaOfClass, "NonOMFacetXIntOSR"]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // OSRControls are the container in which most of the controls of an OSR are embedded. It is embedded in the OSR.
    // It embeds:
    // 1. OverlayName.
    // 2. OverlaySolutionSetCounter (Lean/Fat)
    // 3. SolutionSetViewControl (if in the effectiveBaseOverlay, or in an overlay that's either in Standard/Maximized state).
    //
    // API:
    // 1. embedSolutionSetViewControl: default provided (Mon0 overrides this).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRControls: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedSolutionSetViewControl: o( 
                    [{ ofZoomBoxingOverlay: _ }, [me]],
                    [{ ofExpandedOverlay: _ }, [me]]
                ),
                createHoveringMinimizationControl: [and,
                    [not, [{ additionalOverlayControlsOpen: _ }, [me]]],
                    [{ ofExpandedOverlay: _ }, [me]],
                    o(
                        [and, // hovering over the overlay's part that overlaps the frozen facet pane.
                            [overlap, [{ myVisibleOverlay: _ }, [me]], [pointer]],
                            [overlap, [areaOfClass, "FrozenFacetViewPane"], [pointer]]
                        ],
                        // or OSRControls is inFocus (includes the case where we stand over the minimization control itself, 
                        // as it has propagatePointerInArea to its expressionOf)
                        [{ inFocus: _ }, [me]]
                    )
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "TrackMyOverlay", "TrackOverlayMaximization"),
            context: {
                minWrapAround: 0
            },
            children: {
                name: {
                    description: {
                        "class": "OverlayName"
                    }
                }
            },
            position: {
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { embedSolutionSetViewControl: true },
            children: {
                solutionSetViewControl: {
                    description: {
                        "class": "SolutionSetViewControl"
                    }
                }
            }
        },
        {
            qualifier: { ofExpandedOverlay: true },
            position: {
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [plus,
                        [densityChoice, [{ fsAppPosConst: { widthOfOSRControls: _ } }, [globalDefaults]]],
                        [plus,
                            [densityChoice, bFSAppPosConst.solutionSetViewControlDimension],
                            [mul, bFSAppPosConst.solutionSetViewControlHotspotMargin, 2]
                        ]
                    ]
                },
                rightConstraint: {
                    point1: {
                        type: "right"
                    },
                    point2: [{ myApp: { rightOfFrozenFacetViewPane: _ } }, [me]],
                    equals: [div, generalPosConst.expansionHandle1DShortLength, 2] // so that the moreC
                }
            }
        },
        {
            qualifier: { ofExpandedOverlay: false },
            position: {
                right: 0
            }
        },
        {
            qualifier: { ofTrashedOverlay: false },
            children: {
                solutionSetCounter: {
                    description: {
                        "class": "OverlaySolutionSetCounter"
                    }
                }
            }
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            write: {
                onOSRControlsMouseDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        "class": "ExpandOverlayAction"
                    }
                }
            }
        },
        {
            qualifier: { createHoveringMinimizationControl: true },
            children: {
                level0MinimizationControl: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "OverlayLevel0MinimizationControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanOSRControls: {
        "class": "OSRControls",
        position: {
            left: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOSRControls: {
        "class": "OSRControls",
        position: {
            minLeftFromEmbedding: {
                point1: {
                    element: [embedding],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                min: 0
            },
            attachToEmbeddingLeftI: {
                point1: {
                    element: [embedding],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "oSRControlsLeft" }
                // inheriting classes may add constraints here - see Mon0, for example.
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. inheriting class should determine the area's width
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayNameCore: {
        "class": o("GeneralArea", "TrackMyOverlay"),
        context: {
            horizontalMargin: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
        },
        position: {
            height: [displayHeight]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the overlay's name. it is embedded in the OSRControls.
    // if this class is of a ZoomBoxing overlay that isn't the effectiveBaseOverlay, then clicking on it (it is underlined in this state), makes it into the new effectiveBaseOverlay, and pops all the
    // ZoomBoxing overlays pushed on it, back into the appFrame - i.e. they become ZoomBoxed.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                blockMouseDown: false, // so that one can drag the OSR by the OverlayName
                blockMouseDoubleClickExpired: false // to allow the doubleClick (a subType of to MouseGestureExpired) to propagate through to the VisibleOverlay.
            }
        },
        { // default 
            "class": o(
                "OverlayNameDesign",
                "OverlayNameCore",
                "TextInput",
                "EditableTooltipable"
            ),
            context: {
                // TextInput params
                mouseEventToEdit: "DoubleClickExpired",
                mouseToEdit: [not, [{ ofTrashedOverlay: _ }, [me]]],

                rememberTextWasEdited: true, // override default                             
                // rewire default AD definitions to myOverlay's crossViewOverlayDataObj:
                textWasEdited: [{ myOverlay: { crossViewOverlayDataObj: { nameWasEdited: _ } } }, [me]],
                tooltipTextAppData: [{ myOverlay: { crossViewOverlayDataObj: { tooltipTextAppData: _ } } }, [me]],
                // for user defined overlays, we initialize them to tooltipEditable: true, and with the Tooltipable (i.e. overlayName) text in edit mode                
                placeholderInputText: [
                    [{ myApp: { placeholderInputTextGenerator: _ } }, [me]],
                    [{ myApp: { overlayEntityStr: _ } }, [me]]
                ],
                inputAppData: [{ myOverlay: { name: _ } }, [me]],
                inputTextValuesAlreadyUsed: [ // names of other overlays
                    n([{ myOverlay: { name: _ } }, [me]]),
                    [{ name: _ }, [areaOfClass, "PermOverlay"]]
                ],
                inputTextAlreadyBeingUsedMsg: [
                    [{ myApp: { inputTextAlreadyBeingUsedMsgGenerator: _ } }, [me]],
                    [{ myApp: { overlayEntityStr: _ } }, [me]]
                ],

                tooltipDisplaysMeaningfulInfo: o( // override default definition 
                    [{ defaultTooltipDisplaysMeaningfulInfo: _ }, [me]],
                    // other meaningful info scenarios: content spills over, or there are meaningful selections to display
                    [{ contentSpillsOver: _ }, [me]],
                    [and,
                        [{ ofIntOverlay: _ }, [me]],
                        [{ myOverlay: { selectionsMade: _ } }, [me]]
                    ]
                )
            },
            position: {
                "vertical-center": 0,
                minLeftFromEmbedding: {
                    point1: {
                        element: [embedding],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [{ horizontalMargin: _ }, [me]]
                },
                minLeftFromSolutionSetViewControl: {
                    point1: {
                        element: [{ children: { solutionSetViewControl: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [{ horizontalMargin: _ }, [me]]
                },
                eitherLeftRelativeToEmbedding: {
                    point1: {
                        element: [embedding],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalMargin: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "overlayNameMarginOnLeft" }
                },
                orLeftRelativeToSolutionSetViewControl: {
                    point1: {
                        element: [{ children: { solutionSetViewControl: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalMargin: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "overlayNameMarginOnLeft" }
                }
            }
        },
        {
            qualifier: { tooltipEditInputText: false },
            context: {
                tooltipText: [concatStr,
                    o(
                        [cond,
                            [{ contentSpillsOver: _ }, [me]],
                            o({
                                on: true, use:
                                [concatStr,
                                    o(
                                        [{ myOverlay: { name: _ } }, [me]],
                                        "\n"
                                    )
                                ]
                            }
                            )
                        ],
                        [{ tooltipTextCore: _ }, [me]],
                        [cond,
                            [{ myOverlay: { loadedFacetXIntOverlays: _ } }, [me]],
                            o({
                                on: true, use:
                                [concatStr,
                                    o(
                                        "\n",
                                        [{ myOverlay: { parsedFacetsSelectionSummaryStr: _ } }, [me]]
                                    )
                                ]
                            })
                        ]
                    )
                ]
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
            qualifier: { ofTrashedOverlay: true },
            "class": "TrashedReorderableElementName",
            context: {
                myTrashable: [{ myVisibleOverlay: _ }, [me]]
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            position: {
                width: [densityChoice, [{ fsAppPosConst: { overlayNameWidth: _ } }, [globalDefaults]]]
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the size of the solutionSet of the embedding overlay. Note that in case of an intensional overlay, this is the transient 
    // solutionSet - i.e. the current one, being updated while the mouse is still down (unlike the stable solutionSet, which is updated only on mouseUp).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetCounterCore: o(
        { // default
            "class": o("GeneralArea", "DisplayDimension", "TrackMyOverlay"),
            context: {
                numericFormat: {
                    type: "intl",
                    useGrouping: true // comma delimited
                },
                displayText: [concatStr,
                    o(
                        "(",
                        [numberToString, [{ myOverlay: { solutionSetSize: _ } }, [me]], [{ numericFormat: _ }, [me]]],
                        ")"
                    )
                ]
            },
            position: {
                leftConstraint: {
                    point1: {
                        element: [{ myOverlayName: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
                },
                minOffsetFromRight: {
                    point1: { type: "right" },
                    point2: { element: [embedding], type: "right" },
                    min: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetCounter: {
        "class": o("OverlaySolutionSetCounterDesign", "OverlaySolutionSetCounterCore"),
        position: {
            "vertical-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the classes embedded in the OSRControls
    // API: 
    // 1. myOverlay: default value provided via TrackMyOverlay inheritance.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRControl: {
        "class": o("GeneralArea", "ControlModifiedPointer", "TrackMyOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the hiding/showing of the solution set view of the embedding overlay.  
    // When clicked on it toggles the showSolutionSet state of its overlay.
    // When clicked open w/o "Ctrl" it closes the solutionSetViews of all other overlays.
    //
    // It's embedded in the OSRControls, and as such it inherits OSRControl. It embeds SolutionSetViewControlDisplay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetViewControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                readyToShowSolutionSetOnFacetExpansion: [and,
                    [{ ofExpandedOverlay: _ }, [me]],
                    [not, // if there's already another expanded overlay that's showing its solutionSet items, then i shouldn't expand mine
                        [{ expandedOverlaysButMine: { showSolutionSet: _ } }, [me]]
                    ]
                ]
            }
        },
        { // default
            "class": "OSRControl",
            context: {
                expandedOverlaysButMine: [
                    n([{ myOverlay: _ }, [me]]),
                    [{ expanded: true }, [areaOfClass, "PermOverlay"]]
                ],
                horizontalMargin: [densityChoice, bFSAppPosConst.osrElementsHorizontalSpacing]
            },
            children: {
                display: {
                    description: {
                        "class": "SolutionSetViewControlDisplay"
                    }
                }
            },
            position: {
                "vertical-center": 0,
                minLeftFromEmbedding: {
                    point1: {
                        element: [embedding],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [{ horizontalMargin: _ }, [me]]
                },
                minLeftFromEmbeddingPreferenceMin: {
                    point1: {
                        element: [embedding],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                // no need for a complimentary orGroups here, as if we have a SolutionSetViewControl, we're guaranteed to have an adjacent OverlayName, and there we define
                // the necessary orGroups, which will anchor the overlayName as close as possible to the left of the OSR (taking into consideration the presence of an OverlayHandle,
                // and/or a SolutionSetViewControl)
                // dimensions determined by embedded Display area.
            }
        },
        {
            qualifier: { ofZoomBoxedOverlay: true },
            write: {
                onSolutionSetViewControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleShowSolutionSet: {
                            to: [{ showSolutionSet: _ }, [me]],
                            merge: [not, [{ showSolutionSet: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                ofZoomBoxedOverlay: true,
                showSolutionSet: false
            },
            write: {
                onSolutionSetViewControlCtrlMouseClick: {
                    "class": "OnCtrlMouseClick",
                    true: {
                        // this comes in addition to the toggleShowSolutionSet above
                        hideSolutionSetViewsOfOtherOverlays: {
                            to: [
                                { showSolutionSet: _ },
                                [ // all other SolutionSetViewControls but me
                                    n([me]),
                                    [areaOfClass, "SolutionSetViewControl"]
                                ]
                            ],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { readyToShowSolutionSetOnFacetExpansion: true },
            write: {
                onSolutionSetViewControlFacetExpansion: {
                    upon: [{ minimized: false }, [areaOfClass, "OMF"]], // when one of the OMFs expands..
                    true: {
                        showSolutionSet: {
                            to: [{ showSolutionSet: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            write: {
                // different handling for zoomBoxing overlays for now: at the moment we don't allow the display of the solutionSetItems for more than
                // one zoomboxing overlay. so when we show one of them, we close the others zoomboxing overlays that show their items.
                onSolutionSetViewControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleShowSolutionSet: {
                            to: [{ showSolutionSet: _ }, [me]],
                            merge: [not, [{ showSolutionSet: _ }, [me]]]
                        },
                        hideSolutionSetViewsOfOtherZoomBoxingOverlays: {
                            to: [
                                {
                                    showSolutionSet: _,
                                    ofZoomBoxingOverlay: true
                                },
                                [ // all other SolutionSetViewControls but me
                                    n([me]),
                                    [areaOfClass, "SolutionSetViewControl"]
                                ]
                            ],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in OverlayShowItemsControl, and displays its visual state (triangle pointing down/left depending on whether showing the solutionSet items or not
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetViewControlDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showSolutionSet: [{ showSolutionSet: _ }, [embedding]],
                indicateSelectability: [{ inFocus: _ }, [embedding]]
            }
        },
        { // default 
            "class": o("SolutionSetViewControlDisplayDesign", "GeneralArea", "Tooltipable", "TrackMyOverlay"),
            context: {
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { showSolutionSetView: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { itemEntityStrPlural: _ } }, [me]],
                    [{ showSolutionSet: _ }, [me]]
                ]
            },
            propagatePointerInArea: "embedding"
        },
        {
            qualifier: { showItemsControlABTest: "V1" },
            context: {
                triangleBase: [densityChoice, bFSAppPosConst.solutionSetViewControlTriangleBase],
                triangleHeight: [densityChoice, bFSAppPosConst.solutionSetViewControlTriangleHeight]
            }
        },
        {
            qualifier: { showItemsControlABTest: "V2" },
            context: {
                dimension: [densityChoice, bFSAppPosConst.solutionSetViewControlDimension]
            },
            position: {
                frame: bFSAppPosConst.solutionSetViewControlHotspotMargin,
                width: [{ dimension: _ }, [me]],
                height: [{ dimension: _ }, [me]]
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V1",
                showSolutionSet: true
            },
            position: {
                width: [{ triangleBase: _ }, [me]],
                left: bFSAppPosConst.solutionSetViewControlTriangleMarginOnSides,
                right: bFSAppPosConst.solutionSetViewControlTriangleMarginOnSides,

                height: [{ triangleHeight: _ }, [me]],
                top: bFSAppPosConst.solutionSetViewControlTriangleBaseFromEmbedding,
                bottom: bFSAppPosConst.solutionSetViewControlTriangleTipFromEmbedding
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V1",
                showSolutionSet: false
            },
            position: {
                height: [{ triangleBase: _ }, [me]],
                top: bFSAppPosConst.solutionSetViewControlTriangleMarginOnSides,
                bottom: bFSAppPosConst.solutionSetViewControlTriangleMarginOnSides,

                width: [{ triangleHeight: _ }, [me]],
                left: bFSAppPosConst.solutionSetViewControlTriangleBaseFromEmbedding,
                right: bFSAppPosConst.solutionSetViewControlTriangleTipFromEmbedding
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay state between Standard and Minimized. It's embedded in the OSRControls, and as such it inherits OSRControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMinimizationControl: o(
        { // default
            "class": "OSRControl",
            write: {
                onOverlayMinimizationControlMouseClick: {
                    "class": "OnMouseClick"
                }
            }
        },
        {
            qualifier: { ofExpandedOverlay: true },
            context: {
                mouseEventToEdit: "Click",
            },
            write: {
                onOverlayMinimizationControlMouseClick: {
                    // rest of object defined in default clause
                    true: {
                        "class": "MinimizeOverlayAction"
                    }
                }
            }
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            write: {
                onOverlayMinimizationControlMouseClick: {
                    // rest of object defined in default clause
                    true: {
                        "class": "ExpandOverlayAction"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayLevel0MinimizationControl: {
        "class": o("OverlayLevel0MinimizationControlDesign", "GeneralArea", "Icon", "AppControl", "TrackMyOverlay"),
        context: {
            myOverlay: [{ myIconable: { myOverlay: _ } }, [me]],
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { minimizeOverlay: _ } }, [globalDefaults]],
                "",
                [{ myApp: { overlayEntityStr: _ } }, [me]],
                [{ ofExpandedOverlay: _ }, [me]]
            ],
            dimensionDefinesContent: false // override AppElement's default
        },
        position: {
            attachVerticallyToOSRControls: {
                point1: { type: "vertical-center" },
                point2: {
                    element: [{ myOSRControls: _ }, [me]],
                    type: "vertical-center"
                },
                equals: 0
            },
            attachHorizontallyToOSRControls: {
                point1: { type: "right" },
                point2: {
                    element: [{ mySolutionSetViewControl: _ }, [me]],
                    type: "left"
                },
                equals: [densityChoice, [{ fsAppPosConst: { margin: _ } }, [globalDefaults]]]
            }
        },
        write: {
            onOverlayLevel0MinimizationControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    "class": "MinimizeOverlayAction"
                }
            }
        },
        stacking: {
            belowZoomBoxZTop: {
                lower: [me],
                higher: {
                    element: [areaOfClass, "ZoomBox"],
                    label: "zTop"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay's Show state. 
    // A reminder: An overlay's Show state currently controls the display of its OMF, and of its OverlayXWidgets.
    // 
    // API:
    // 1. show: the overlay's show state
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayShowControl: {
        "class": o("OSRControl", "OverlayDelayedInArea"),
        write: {
            onOverlayShowControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleOverlayShowState: {
                        to: [{ show: _ }, [me]],
                        merge: [not, [{ show: _ }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayRenameControl: {
        "class": "OSRControl",
        context: {
            displayText: "Rename"
        },
        write: {
            onOverlayRenameControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    setEditInputText: {
                        to: [{ myOverlayName: { editInputText: _ } }, [me]],
                        merge: true
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of the additional overlay controls, starting with OverlayMoreControls, their embedding area
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the more controls offered in the OSRControls. It inherits MoreControlsOnClickUX.
    // When in the open state, it embeds:
    // 1. An overlay maximization control.
    // 2. an overlay copy control and overlay zoomBoxing control (when no overlay is Maximized). 
    // 3. A trash control (except in the case of the Blacklist overlay, which cannot be trashed).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMoreControls: {
        "class": o("MoreControlsOnClickUX", "TrackMyOverlay", "TrackOverlayMaximization"),
        context: {
            // MoreControlsOnClickUX param: 
            backgroundColor: "transparent",
            tooltipText: [concatStr, o([{ myApp: { overlayEntityStr: _ } }, [me]], " ", [{ myApp: { optionEntityStrPlural: _ } }, [me]])],
            myMoreControlsController: [{ myOverlay: _ }, [me]] // override default value provided
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the control that Maximizes/unMaximizes the embedding overlay.
    // It's embedded in the OverlayMoreControls, and as such inherits OverlayMoreControl.
    // the FSApp stores the areaRef of the Maximized overlay. 
    // Note that when unMaximized, an overlay reverts to its prior state (Standard/Minimized, whichever the case may be).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMaximizationControl: o(
        { // default
            "class": o("GeneralArea", "TrackOverlayMaximization"),
            write: {
                onOverlayMaximizationControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setMaximizedOverlay: {
                            to: [{ myApp: { maximizedOverlayUniqueID: _ } }, [me]]
                            // see variants below
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofMaximizedOverlay: false },
            context: {
                displayText: [{ myApp: { maximizeOverlayMenuStr: _ } }, [me]]
            },
            write: {
                onOverlayMaximizationControlMouseClick: {
                    // rest of object defined in default clause
                    true: {
                        setMaximizedOverlay: {
                            merge: [{ myOverlay: { uniqueID: _ } }, [me]]
                        }/*, for now, maximizing an overlay will NOT also show its solutionSetItems
                        turnOnOverlayShowSolutionSet: {
                            to: [{ showSolutionSet: _ }, [me]],
                            merge: true
                        }*/
                    }
                }
            }
        },
        {
            qualifier: { ofMaximizedOverlay: true },
            write: {
                onOverlayMaximizationControlMouseClick: {
                    // rest of object defined in default clause
                    true: {
                        setMaximizedOverlay: {
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntOverlayIntersectionModeControl: {
        "class": "GeneralArea",
        write: {
            onIntOverlayIntersectionModeControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleMyOverlayIntersectionMode: {
                        to: [{ myOverlay: { intersectionMode: _ } }, [me]],
                        merge: [not, [{ myOverlay: { intersectionMode: _ } }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the control that pushes the embedding overlay to the AppFrame, thus making it the effectiveBaseOverlay (that is until another overlay is pushed on top of it, 
    // or till it's popped back out of the AppFrame).
    // It's embedded in the OverlayMoreControls, and as such inherits OverlayMoreControl.
    // The change of state is done by pushing the embedding overlay's areaRef to an os of areaRefs of overlays which the user decided to set as zoomBoxing. It is maintained by FSApp.
    // Note: popping of zoomBoxing overlays, the reversal of their pushing into the appFrame, is done elsewhere (see OverlayName, which - in the relevant state - can be clicked on
    // to pop user-defined zoomBoxing overlays back into the zoomBox).
    // 
    // API:
    // 1. newZoomBoxingOverlayObj: an object/terminal (the name is therefore a bit misleading) representing the overlay (see Mon0/Mon1 for examples).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayZoomBoxingControl: {
        "class": "GeneralArea",
        write: {
            onOverlayZoomBoxingControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    pushNewOverlayObjToZoomBoxingOverlaysByUser: {
                        to: [{ myApp: { zoomBoxingOverlaysByUser: _ } }, [me]],
                        merge: push([{ newZoomBoxingOverlayObj: _ }, [me]])
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the control that creates a permanent overlay that's a copy of the embedding overlay.
    // Note: after the copy operation, changes to one overlay will not be reflected in the other. in order to create a copy, we push onto the overlayData os in the FSApp a new object 
    // which is a copy of the embedding overlay's state, plus the new overlay's name/uniqueID/color.
    // It's embedded in the OverlayMoreControls, and as such inherits OverlayMoreControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyControlCore: {
        "class": o("GeneralArea", "AddNewOverlayControl"),
        context: {
            prefixOfNewOverlayName: [concatStr,
                o(
                    [{ myOverlay: { name: _ } }, [me]],
                    fsAppConstants.copyOfNamePrefixOfSuffix
                )
            ],
            copiedOverlayType: [{ myOverlay: { type: _ } }, [me]], // default value
            // AddNewOverlayControl param
            newOverlayDataObj: [merge,
                {
                    overlayCounter: [{ myApp: { newOverlayCounter: _ } }, [me]],
                    uniqueID: [
                        getOverlayUniqueID,
                        [{ myApp: { newOverlayCounter: _ } }, [me]]
                    ],
                    name: [generateNameFromPrefix,
                        [{ prefixOfNewOverlayName: _ }, [me]],
                        [{ name: _ }, [areaOfClass, "PermOverlay"]]
                    ],
                    color: [
                        [{ myApp: { getOverlayColor: _ } }, [me]],
                        [{ overlayCounter: _ }, [me]]
                    ],
                    nameWasEdited: [{ myApp: { newOverlayNameWasEdited: _ } }, [me]],
                    type: [{ copiedOverlayType: _ }, [me]],

                    // copy values from the origin overlay to the newly created copy:
                    showZoomBoxed: [{ myOverlay: { showZoomBoxed: _ } }, [me]],
                    showZoomBoxing: [{ myOverlay: { showZoomBoxing: _ } }, [me]],
                    showSolutionSet: [{ myOverlay: { showSolutionSet: _ } }, [me]]
                },
                [cond,
                    [{ copiedOverlayType: _ }, [me]],
                    o(
                        {
                            on: "Extensional",
                            use: {
                                included: [
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
                            }
                        },
                        {
                            on: "Intensional",
                            use: {
                                selectionsData: [{ myOverlay: { selectionsData: _ } }, [me]]
                            }
                        }
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyControl: {
        "class": "OverlayCopyControlCore"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyAsExtOverlayControl: {
        "class": "OverlayCopyControlCore",
        context: {
            copiedOverlayType: "Extensional" // override default value
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the control that switches an overlay to the Trashed state. On the way to trashing the overlay, it sets its overlay to create a verification modal dialog
    // for the user to confirm their intent.
    // The visibleOverlay is to be the expressionOf for the modal dialog, as the OverlayTrashControl may not exist by the time it's created (e.g. Mon1).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayTrashControl: {
        "class": o("GeneralArea", "CreateModalDialogOnClick"),
        context: {
            createModalDialog: [{ myVisibleOverlay: { createModalDialog: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This modal dialog is created by the OverlayTrashControl, to ensure that the user would indeed like to trash the embedding overlay.
    // It inherits OKCancelModalDialog, and MinWraps the modal dialog text area, and its embedded controls.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashOverlayModalDialog: {
        "class": "TrashModalDialog",
        children: {
            textDisplay: {
                description: {
                    "class": "TrashOverlayModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "TrashOverlayModalDialogOKControl"
                }
            }
            // cancelControl defined in OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the text that appears in the modal dialog confirming the Trashing of an overlay. 
    // It inherits TrashOverlayModalDialogElement, and is embedded in TrashOverlayModalDialog.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashOverlayModalDialogText: o(
        { // default
            "class": o("OKCancelDialogText", "TrackMyOverlay"),
            context: {
                myOverlay: [{ myModalDialogable: { myOverlay: _ } }, [me]],
                prefixDisplayText: [
                    [{ myApp: { trashDialogBoxConfirmationTextGenerator: _ } }, [me]],
                    [{ myOverlay: { name: _ } }, [me]],
                    [{ myApp: { overlayEntityStr: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { intOverlaysDirectlyDefinedByMyOverlayExist: false },
            context: {
                displayText: [{ prefixDisplayText: _ }, [me]]
            }
        },
        {
            qualifier: { intOverlaysDirectlyDefinedByMyOverlayExist: true },
            context: {
                displayText: [concatStr,
                    o(
                        [{ prefixDisplayText: _ }, [me]],
                        "\nIt will be Removed from the Definition of ",
                        [{ myApp: { overlayEntityStrPlural: _ } }, [me]],
                        " Defined by it"
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the OK control in the modal dialog confirming the Trashing of an overlay. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    TrashOverlayModalDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayResetControl: {
        "class": "OSRControl",
        write: {
            onOverlayResetControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetMyOverlay: {
                        to: [message],
                        merge: {
                            msgType: "Reset",
                            recipient: [{ myOverlay: _ }, [me]]
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of the additional overlay controls, starting with OverlayMoreControls, their embedding area
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetViewSnappableController: o(
        { // default
            "class": "TrackJIT"
        },
        {
            qualifier: { jit: true },
            "class": "VerticalJITSnappableController"
        },
        {
            qualifier: { jit: false },
            "class": "VerticalSnappableController"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the view in which the overlay's (stable) solutionSet is displayed. It is embedded in the VisibleOverlay.
    // It inherits: 
    // 1. ContiguousCoselectablesController to allow it to participate in the coselection of SolutionSetItems. Note the corresponding CoselectablesController is not this class, 
    //    but rather the EphExtOverlay - as we can coselect items from different overlays.
    // 2. VerticalSnappableController so that the scrolled items snap to the top of the view on MouseUp.
    //
    // It embeds an areaSet of solutionSetItems.
    // 
    // height: this class has a preference to have a maximum height, and height that's equal to that of all other OverlaySolutionSetViews which are open.
    //
    // Note: since JIT is a variant-controller provided by TrackJIT, if OverlaySolutionSetView inherits it directly, then the proper SnappableController would be inherited in its
    // variants, and their default values would override any context labels used by both JIT and AOT Controller classes, that OverlaySolutionSetView provides in its default clause.
    // To allow OverlaySolutionSetView's context labels to take precedence, the SnappableController classes are inherited by the OverlaySolutionSetViewSnappableController class, 
    // which is inherited in OverlaySolutionSetView's default clause.
    //
    // API:
    // 1. thicknessOfVerticalBorders: the total thickness of the bottom and top borders, to be added to the calculation of lengthOfJITElement. 0, by default.
    // 2. topBorderWidthOfSolutionSetItem/bottomBorderWidthOfSolutionSetItem: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetView: o(
        { // default 
            "class": o(
                "OverlaySolutionSetViewDesign",
                "GeneralArea",
                "ContiguousCoselectablesController",
                "OverlaySolutionSetViewSnappableController",
                "TrackMyOverlay"
            ),
            context: {
                verticalSpacingOfItems: bFSPosConst.verticalSpacingOfItems,
                topBorderWidthOfSolutionSetItem: 0,
                bottomBorderWidthOfSolutionSetItem: 1,

                // VerticalSnappableController param:
                movables: [{ children: { solutionSetItems: _ } }, [me]],
                movableSpacing: [{ verticalSpacingOfItems: _ }, [me]],
                lengthOfJITElement: [plus,
                    [plus,
                        [{ topBorderWidthOfSolutionSetItem: _ }, [me]],
                        [{ bottomBorderWidthOfSolutionSetItem: _ }, [me]]
                    ],
                    [densityChoice, bFSPosConst.itemHeight]
                ],

                movablesUniqueIDs: [{ myOverlay: { sortedStableSolutionSetUniqueIDs: _ } }, [me]],
                movablesBaseSetUniqueIDs: [{ myApp: { effectiveBaseOverlay: { sortedStableSolutionSetUniqueIDs: _ } } }, [me]],

                // ContiguousCoselectablesController param:
                coselectables: [{ children: { solutionSetItems: _ } }, [me]],
                myCoselectablesController: [{ myApp: { ephExtOverlay: _ } }, [me]]
            },
            position: {
                takeUpMaximumHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    preference: "max",
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                },
                attachLeftToExpandedOverlaysViewLeft: {
                    point1: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                attachRightToExpandedOverlaysViewRight: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "right"
                    },
                    equals: 0
                }
            },
            children: {
                solutionSetItems: {
                    data: [anonymize, [{ solutionSetItemsData: _ }, [me]]], // [anonymize]: per the JIT API!
                    description: {
                        "class": "SolutionSetItem",
                        context: {
                            borderBottomWidth: [{ bottomBorderWidthOfSolutionSetItem: _ }, [embedding]],
                            borderTopWidth: [{ topBorderWidthOfSolutionSetItem: _ }, [embedding]]
                        }
                    }
                },
                overlapWithSolutionSetView: {
                    description: {
                        "class": "OverlaySolutionSetViewInFrozenPane"
                    }
                }
            }
        },
        {
            qualifier: { jit: true },
            context: {
                solutionSetItemsData: [pos,
                    [{ jitMovablesRange: _ }, [me]],
                    [{ myOverlay: { sortedStableSolutionSetItems: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { jit: false },
            context: {
                solutionSetItemsData: [{ myOverlay: { sortedStableSolutionSetItems: _ } }, [me]]
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            position: {
                topConstraint: {
                    point1: {
                        element: [
                            { myFacet: [{ myApp: { firstFrozenFacet: _ } }, [me]] },
                            [areaOfClass, "FacetHeader"]
                        ],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: bFSAppPosConst.verticalOffsetOfBaseOverlaySolutionSetViewFromFacetHeaders
                },
                rightConstraint: {
                    point1: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "right"
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: false },
            position: {
                topConstraint: {
                    point1: {
                        element: [{ children: { oSR: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                // calculate two possible bottom points for this area:  
                // 1. at an offset which equally divides the ExpandedOverlaysView among all zoomboxed overlays with showSolutionSet: true.
                // 2. at an offset that's docLength away from the top of the OverlaySolutionSetView
                // with an orGroups we will pick the higher of the two, i.e. the one that results in a shorter OverlaySolutionSetView
                // in other words: an open OverlaySolutionSetView will share the available vertical real-estate with other overlays in the same state, 
                // unless it can't make productive use of the height offered it, in which case it will use only what it needs to display its small solutionSet
                equalHeightBottomLabelForAllZoomBoxedSolutionSetViews: {
                    pair1: {
                        point1: {
                            type: "top"
                        },
                        point2: {
                            label: "equalHeightBottom"
                        }
                    },
                    pair2: {
                        point1: {
                            element: [{ myApp: _ }, [me]],
                            label: "virtualTopOfOverlaySolutionSetView"
                        },
                        point2: {
                            element: [{ myApp: _ }, [me]],
                            label: "virtualBottomOfOverlaySolutionSetView"
                        }
                    },
                    ratio: 1
                },
                docLengthBottomLabel: {
                    pair1: {
                        point1: {
                            type: "top"
                        },
                        point2: {
                            label: "docLengthBottom"
                        }
                    },
                    pair2: {
                        point1: [{ beginningOfDocPoint: _ }, [me]],
                        point2: [{ endOfDocPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                // the set of constraints matching this area's bottom to the higher of the two posPoint labels defined above: equalHeightBottom and docLengthBottom.
                bottomAboveEqualHeightBottom: {
                    point1: { type: "bottom" },
                    point2: { label: "equalHeightBottom" },
                    min: 0
                },
                bottomAboveDocLengthBottom: {
                    point1: { type: "bottom" },
                    point2: { label: "docLengthBottom" },
                    min: 0
                },
                // the orGroups needs to be at a lower priority than the default. as is often with or-constraints in the current era in which the entire set has the same priority,
                // the system will not relax the satisfied or-constraint in order to see if that allows it to satisfy more of the constraints outside the orGroup. 
                // by giving the orGroup constraints a lower priority, we force the positioning to reevaluate the or-constraint it chose to satisfy the group, and do so after it did its
                // best to satisfy the higher (read: default priority constraints).
                bottomMatchesEqualHeightBottom: {
                    point1: { type: "bottom" },
                    point2: { label: "equalHeightBottom" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "bottomCalculation" }
                },
                orBottomMatchesDocLengthBottom: {
                    point1: { type: "bottom" },
                    point2: { label: "docLengthBottom" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "bottomCalculation" }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetViewInFrozenPane: {
        "class": o("GeneralArea", "AboveSiblings", "TrackMyOverlay"),
        position: {
            top: 0,
            bottom: 0,
            left: 0,
            attachToRightOfRightmostFrozenPane: {
                point1: { type: "right" },
                point2: [{ myApp: { rightOfFrozenFacetViewPane: _ } }, [me]],
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the logic for dragging an overlay. It is used to reorder overlays, and to change their state (Standard <-> Minimized <-> Trashed).
    // It inherits ReorderHandle/DragHandle, depending on its state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    OverlayHandle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tmd: [{ myVisibleOverlay: { iAmDraggedToReorder: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyOverlay"),
        },
        {
            qualifier: { ofExpandedOverlay: true },
            "class": "ReorderHandle",
            context: {
                // ReorderHandle param:
                visReorderable: [{ myVisibleOverlay: _ }, [me]]
            }
        },
        {
            qualifier: { ofExpandedOverlay: false },
            "class": "DragHandle"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of VisibleOverlay classes & their embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SelectableFacetXIntOverlay Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the selections of a selectable facet (Slider/MS/Rating/OMF) in an intensional overlay. Each intensional overlay embeds an areaSet 
    // of this class. So each instance of SelectableFacetXIntOverlay has an associated overlay and an associated selectableFacet, and it can be thought of as 
    // representing their conceptual "intersection". Why not an actual cdl intersection? Because the overlay and facet may not overlap (facet scrolled out 
    // of view, overlay is minimized). Moreover, the SelectableFacetXIntOverlay has no natural dimensions - all it does is logic, not display.
    // 
    // The facet's meaningful (i.e. when <> "Any") *stable* selections are actually stored in the overlay's selectionsData AD. 
    // This class stores the facet's *transient* selection values. It calculates the 1D/2D implicitSet for its associated facet/overlay (or in the 2D case, 
    // in which its facet *participates* - there's obviously another facet involved).
    // 
    // this class has a qualifier in which an addendum is inherited, corresponding to the type of facet represented: Slider/MS/Rating/OMF.
    // these addendum classes generate stableSelectionQuery and transientSelectionQuery, which the associated IntOverlay uses in its multiQuery call to 
    // calculate the stable/transient solutionSet.
    // 
    // API: addendum classes (e.g. SliderFacetXIntOverlay) are to define:
    // 1. stableSelectionQuery and transientSelectionQuery. These are obtained by multiQuery, when calculating the various itemSets.
    // 2. selectionsStr: Inheriting classes should provide a representation of the selections as a string.
    // 3. valuableSelectionsMade: boolean indicating whether selections which are not "noValue" were made
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // if there are no inclusions, only exclusions, we're in effectiveExclusion mode. otherwise, we're effectively in inclusion mode 
                // (including when there are no selections)
                // this is here, and not in DiscreteFacetXIntOverlay because Slider facets also have inclusion/exclusion of "No Value", etc.
                effectiveExclusionMode: [and,
                    [not, [{ stableSelectionsObj: { included: _ } }, [me]]],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o(
                "GeneralArea",
                "TrackMyFacetDataObj",
                "TrackMyFacet",
                "TrackMyOverlay"
            ),
            context: {
                uniqueID: [{ param: { areaSetContent: _ } }, [me]],

                myFacetUniqueID: [{ uniqueID: _ }, [me]], // TrackMyFacetDataObj param; also overrides the TrackMyFacet default def

                myFacet: [
                    { uniqueID: [{ uniqueID: _ }, [me]] },
                    [areaOfClass, "SelectableFacet"]
                ],

                mySiblingsAndI: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                name: [{ myFacetDataObj: { name: _ } }, [me]],

                nameForSelectionsStr: [concatStr, o([{ name: _ }, [me]], ": ")],

                selectionSeparatorStr: ", ", // for the selectionsStr formed in the addendum classes

                stableSelectionsObj: [mergeWrite,
                    [
                        { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                        [{ myOverlay: { selectionsData: _ } }, [me]]
                    ],
                    { // default obj
                        lowVal: Number.NEGATIVE_INFINITY,
                        highVal: Number.POSITIVE_INFINITY
                    }
                ],

                // except for when a Slider's valSelectors are being modified (see SliderFacetXIntOverlay), 
                // the rest of the time (and always for MS and OMF), the transientSelectionsObj = stableSelectionsObj
                transientSelectionsObj: [{ stableSelectionsObj: _ }, [me]],

                // obtain the transient selection queries from all my siblings - but not from myself!
                implicit1DSetItems: [multiQuery,
                    [{ myTransient1DSelectionQueries: _ }, [me]],
                    [{ myOverlay: { baseSetItems: _ } }, [me]]
                ],

                // the stableImplicit1DSetItems is currently used in the calculation of the maxValue for the histogram's scale.
                // (previously we relied solely on implicit1DSetItems, which is based on the transient values - that resulted in a histogram scale
                // changing while a slider in a neighboring facet was being moved - a rather confusing UX experience. to give more stability to the scale
                // we rely on the stableImplicit1DSetItems instead)
                stableImplicit1DSetItems: [multiQuery,
                    [{ myStable1DSelectionQueries: _ }, [me]],
                    [{ myOverlay: { baseSetItems: _ } }, [me]]
                ],

                mySecondaryAxisFacetUniqueID: [{ myFacetDataObj: { secondaryAxisFacetUniqueID: _ } }, [me]], // NOT DEFINED YET!!
                selectableFacetXIntOverlayExceptMeAndMyXAxisFacet: [
                    n(
                        [
                            { myFacetUniqueID: [{ mySecondaryAxisFacetUniqueID: _ }, [me]] },
                            [{ mySiblingsAndI: _ }, [me]]
                        ]
                    ),
                    [{ selectableFacetXIntOverlayExceptMe: _ }, [me]]
                ],

                // obtain the transient selection queries from all my siblings - but not from myself or from myFacet's secondaryAxisFacet's SelectableFacetXIntOverlay
                implicit2DSetItems: [multiQuery,
                    [{ myTransient2DSelectionQueries: _ }, [me]],
                    [{ myOverlay: { baseSetItems: _ } }, [me]]
                ],

                implicit1DSetSize: [size, [{ implicit1DSetItems: _ }, [me]]],
                implicit2DSetSize: [size, [{ implicit2DSetItems: _ }, [me]]],

                inclusionExclusionSelections: o(
                    [{ stableSelectionsObj: { included: _ } }, [me]],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ),
                inclusionExclusionSelectionsMade: [greaterThan,
                    [size, [{ inclusionExclusionSelections: _ }, [me]]],
                    0
                ],
                stableSelectionQuery: [{ coreStableSelectionQuery: _ }, [me]], // default val. overridden if noValueSelectionMade (see below)
                transientSelectionQuery: [{ coreTransientSelectionQuery: _ }, [me]], // default val. overridden if noValueSelectionMade (see below)

                replaceNoValueExpressionWithString: [defun,
                    o("osOfVals"),
                    [map,
                        [defun,
                            o("val"),
                            [cond,
                                [equal, "val", [{ myApp: { noValueExpression: _ } }, [me]]],
                                o(
                                    { on: true, use: [{ noValueStr: _ }, [me]] },
                                    { on: false, use: "val" }
                                )
                            ]
                        ],
                        "osOfVals"
                    ]
                ],
                includedForDisplayInput: [{ stableSelectionsObj: { included: _ } }, [me]], // overridden by SliderFacetXIntOverlay / DiscreteFacetXIntOverlay
                excludedForDisplayInput: [{ stableSelectionsObj: { excluded: _ } }, [me]], // overridden by SliderFacetXIntOverlay / DiscreteFacetXIntOverlay
                includedForDisplay: [
                    [{ replaceNoValueExpressionWithString: _ }, [me]],
                    [{ includedForDisplayInput: _ }, [me]]
                ],
                excludedForDisplay: [
                    [{ replaceNoValueExpressionWithString: _ }, [me]],
                    [{ excludedForDisplayInput: _ }, [me]]
                ],

                stableSelectionsMade: [{ selectionsMade: _ }, [me]] // default def. overridden by SliderFacetXIntOverlay
            }
        },
        {
            qualifier: { ofUDF: true },
            context: {
                // TrackMyFacetDataObj doesn't hold the correct value for facetType: it is determined past this object, in the UDFClipper
                // (in the UDFFacetType class). note: the UDFClipper, which always exists, unlike the UDF which is  embedded in it only when it is visible!
                facetType: [{ myFacetClipper: { facetType: _ } }, [me]]
            }
        },
        {
            qualifier: { ofOMF: false }, // i.e. ofSliderFacet: true or ofMSFacet: true or ofRatingFacet: true
            context: {
                // used in the qualifiers of the SliderFacetXIntOverlay and MSFacetXIntOverlay classes.
                // (the user may disable selections in a certain facet X overlay (essentially to see the impact of those selections on the solutionSet, etc., and allow reverting back
                // to including those selections easily).
                disabled: [{ stableSelectionsObj: { disabled: _ } }, [me]],

                noValueIncluded: [
                    [{ myApp: { noValueExpression: _ } }, [me]],
                    [{ stableSelectionsObj: { included: _ } }, [me]]
                ],
                noValueExcluded: [
                    [{ myApp: { noValueExpression: _ } }, [me]],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ],
                noValueSelectionMade: o( // can be either in Discrete or Slider facet!
                    [{ noValueIncluded: _ }, [me]],
                    [{ noValueExcluded: _ }, [me]]
                ),
                valuableSelections: [ // excluding the noValueExpression from the selections, if it is there at all
                    n([{ myApp: { noValueExpression: _ } }, [me]]),
                    o(
                        [{ stableSelectionsObj: { included: _ } }, [me]],
                        [{ stableSelectionsObj: { excluded: _ } }, [me]]
                    )
                ]

            }
        },
        {
            qualifier: {
                ofOMF: false,
                disabled: false,
                noValueIncluded: true, // if this is true, selectionsMade is also true, per the latter's definitions in the addendum classes
                effectiveExclusionMode: false
            },
            context: {
                // note that stableSelectionQuery here is defined with a c() wrapper around the selection query.
                // the reason is that this particular query is an os of two selections, one for the explicitly included values, the other for the noValue.
                // the problem is that this selectionQuery is fed into [multiQuery] and there this os is flattened alongside all other selectionQueries, 
                // and they're all interpreted as an AND of the specified selections (whereas here the intention is the OR interpretation).
                // to avoid that, we wrap it inside a c(), and thus avoid that fate.
                stableSelectionQuery: c(
                    o(
                        [{ coreStableSelectionQuery: _ }, [me]],
                        [{ noValueSelection: _ }, [me]]
                    )
                ),
                transientSelectionQuery: c(
                    o(
                        [{ coreTransientSelectionQuery: _ }, [me]],
                        [{ noValueSelection: _ }, [me]]
                    )
                )
            }
        },
        {   // if noValue was excluded and we're in effectiveExclusionMode, that means we haven't made any inclusion selections here.
            // so we take the os of the noValue exclusion selection and coreStableSelectionQuery (which may be empty), and since it's an os,
            // multiQuery will apply the AND interpretation for these selection queries, as it should.
            qualifier: {
                ofOMF: false,
                disabled: false,
                noValueExcluded: true,
                effectiveExclusionMode: true
            },
            context: {
                stableSelectionQuery: o(
                    [{ coreStableSelectionQuery: _ }, [me]],
                    [[{ facetSelectionQueryFunc: _ }, [me]], // this is the negation of myFacet.noValueSelection: selecting any "non-missing" value
                        true
                    ]
                ),
                transientSelectionQuery: o(
                    [{ coreTransientSelectionQuery: _ }, [me]],
                    [[{ facetSelectionQueryFunc: _ }, [me]], // this is the negation of myFacet.noValueSelection: selecting any "non-missing" value
                        true
                    ]
                )
            }
        },
        {
            qualifier: { ofSliderFacet: true },
            "class": "SliderFacetXIntOverlay"
        },
        {
            qualifier: { ofMSFacet: true },
            "class": "MSFacetXIntOverlay"
        },
        {
            qualifier: { ofRatingFacet: true },
            "class": "RatingFacetXIntOverlay"
        },
        {
            qualifier: { ofOMF: true },
            "class": "OMFacetXIntOverlay"
        },
        {
            qualifier: { ofIntersectionModeOverlay: true },
            context: {
                selectableFacetXIntOverlayExceptMe: [
                    n([me]),
                    [{ mySiblingsAndI: _ }, [me]]
                ],

                myTransient1DSelectionQueries: [{ selectableFacetXIntOverlayExceptMe: { transientSelectionQuery: _ } }, [me]],
                myStable1DSelectionQueries: [{ selectableFacetXIntOverlayExceptMe: { stableSelectionQuery: _ } }, [me]],

                myTransient2DSelectionQueries: [
                    { transientSelectionQuery: _ },
                    [{ selectableFacetXIntOverlayExceptMeAndMyXAxisFacet: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { ofIntersectionModeOverlay: false }, // union mode
            context: {
                selectableFacetXIntOverlayExceptMe: [ // note: here it is defined only for the Non-OMF facets!
                    n([me]),
                    [{ myOverlay: { myNonOMFacetXIntOverlays: _ } }, [me]]
                ],

                myTransient1DSelectionQueries: o(
                    [{ selectableFacetXIntOverlayExceptMe: { transientSelectionQuery: _ } }, [me]],
                    [{ myOverlay: { unionOMFSolutionSetItemsSelectionQuery: _ } }, [me]]
                ),
                myStable1DSelectionQueries: o(
                    [{ selectableFacetXIntOverlayExceptMe: { stableSelectionQuery: _ } }, [me]],
                    [{ myOverlay: { unionOMFStableSolutionSetItemsSelectionQuery: _ } }, [me]]
                ),
                myTransient2DSelectionQueries: o(
                    [
                        { transientSelectionQuery: _ },
                        [{ selectableFacetXIntOverlayExceptMeAndMyXAxisFacet: _ }, [me]]
                    ],
                    [{ myOverlay: { unionOMFStableSolutionSetItemsSelectionQuery: _ } }, [me]]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines mySelectableFacetXIntOverlay, the instance of SelectableFacetXIntOverlay which matches myFacet and myOverlay (by design, only one such area for a given pair
    // of facet and overlay).
    // API:
    // 1. myFacetUniqueID
    // 2. myOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMySelectableFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionsMade: [{ mySelectableFacetXIntOverlay: { selectionsMade: _ } }, [me]],
                stableSelectionsMade: [{ mySelectableFacetXIntOverlay: { stableSelectionsMade: _ } }, [me]],
                disabled: [{ mySelectableFacetXIntOverlay: { disabled: _ } }, [me]]
            }
        },
        { // default
            context: {
                mySelectableFacetXIntOverlay: [
                    {
                        myFacetUniqueID: [{ myFacetUniqueID: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]]
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                myIntOverlayXWidget: [
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]]
                    },
                    [areaOfClass, "PermIntOverlayXWidget"]
                ],
                implicit1DSetItems: [cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { implicit1DSetItems: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: [cond,
                                [{ myIntOverlayXWidget: { beingModified: _ } }, [me]],
                                o(
                                    { on: true, use: [{ myOverlay: { stableSolutionSetItems: _ } }, [me]] },
                                    { on: false, use: [{ myOverlay: { solutionSetItems: _ } }, [me]] }
                                )
                            ]
                        }
                    )
                ],
                stableImplicit1DSetItems: [cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { stableImplicit1DSetItems: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: [{ myOverlay: { stableSolutionSetItems: _ } }, [me]]
                        }
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayDelayedInArea: {
        "class": o("GeneralArea", "DelayedInArea"),
        context: {
            inAreaDelay: 0.25
        }
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of SelectableFacetXIntOverlay Classes
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////    
};
