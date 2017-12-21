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
// This library includes the application-level (i.e. highest level) classes used in a faceted search application.
// The basic elements of a faceted search application:
// 1. Item: one of a collection of items that the user would like to look through.
// 2. Overlay: a collection of items, defined either extensionally (i.e. the items are identified uniquely out of a larger item set), or intensionally (the items are defined by a set
//    of selections on the attributes defining these items.
// 3. Facet: An attribute of the item, typically one by which the user can select items.
//
// URL-line parameters:
// 1. nItems: the number of items in the global base overlay. Its default value is defined by defaultNumItems.
// 2. maxInitialNumFacetsExpanded: the maximum number of expanded facets on load (could be less than specified, if their type is limited via the URL)
// 3. initialExpansionStateAllFacets: the initial expansion state of *all* facets (which can vary their ). 
//    See the facetState object in /core/fsAppConstants.js for all possible states.
// 4. initialExpansionStateByMovingFacetPos: the initial expansion state, facet by facet, in the moving facets view pane. The initial expansion state is expressed as a digit, with the 
//    first moving facet's expansion state being described by the first digit, the second facet's by the second digit, etc. This value will override initialExpansionStateAllFacets,
//    to the extent it is provided
// 5. limitExpandedFacetsType: "Slider"/"MS"/"SliderOrMS"/"Rating"/"Writable". 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <fsAppDesignClasses.js>

var defaultNumItems = Infinity;
var defaultNumFacets = 20;
var defaultExpandedFacetsType = o();
var defaultNumFrozenFacets = 1;
var defaultInitialNumFacetsExpanded = 3; // initial number of expanded moving facets
var defaultJITFlag = true;

initGlobalDefaults.debugApp = {
    numMinimizedFacets: 1
};

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. itemUniqueID: the attribute that uniquely identifies an item.
    // 2. displayedUniqueID: equal to itemUniqueID, by default, though may differ (e.g. stock name vs. ticker)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ItemUniqueIDFuncs: o(
        { // variant-controller
            qualifier: "!",
            context: {
                itemUniqueIDValid: o(
                    // is it either one of the uuniqueIDs in the facet data, or the default "recordId"
                    [
                        [{ itemUniqueID: _ }, [me]],
                        [{ myApp: { facetData: { uniqueID: _ } } }, [me]]
                    ],
                    "recordId"
                )

            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                itemUniqueIDFunc: [defun,
                    o("what"),
                    [constructAVP,
                        [{ itemUniqueID: _ }, [me]],
                        "what"
                    ]
                ],
                displayedUniqueID: [{ itemUniqueID: _ }, [me]],
                displayedUniqueIDFunc: [defun,
                    o("what"),
                    [constructAVP,
                        [{ displayedUniqueID: _ }, [me]],
                        "what"
                    ]
                ],
                itemUniqueIDProjectionQuery: [defun, o("os"), [[[{ itemUniqueIDFunc: _ }, [me]], _], "os"]],
                itemDisplayedUniqueIDProjectionQuery: [defun, o("os"), [[[{ displayedUniqueIDFunc: _ }, [me]], _], "os"]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class manages the itemDB. It merges the externalItemDB (non-writable) with the writableItemDB (writable).
    // 
    // API:
    // 1. externalItemDB: the non-writable itemDB, typically provided from an external source.
    // 2. writableItemDB: the writable itemDB, which allows adding attributes to the item (e.g. myRating). default: appData provided herein, initialized to o()
    // 3. ItemUniqueIDFuncs API
    // the output of this class is the itemDB os, and the output functions of ItemUniqueIDFuncs
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ItemDBController: {
        "class": compileUDF ? o("ItemUniqueIDFuncs", "UDFController") : o("ItemUniqueIDFuncs"),
        context: {
            "^writableItemDB": o(),

            // the items as they are in the external db
            processedExternalItemDB: [
                cond,
                [arg, "nItems", false],
                o({
                    on: true,
                    use: [
                        pos, r(0, [minus, [arg, "nItems", false], 1]),
                        [{ externalItemDB: _ }, [me]]
                    ]
                }, {
                        on: false,
                        use: [{ externalItemDB: _ }, [me]]
                    })
            ],

            itemDB: compileUDF ?
                [{ dbPostUDFs: _ }, [me]] : // dbPostUDFs is the output of the UDFController class
                [{ processedExternalItemDB: _ }, [me]],

            // UDFController params
            dbPreUDFs: [{ processedExternalItemDB: _ }, [me]],
            uDFRefElements: [sort,
                [{ myApp: { referenceableNumericOrDateDataTypeFacetData: _ } }, [me]],
                { uniqueID: c([{ expandedMovingFacetUniqueIDs: _ }, [me]]) }
            ],
            uDFAllElements: [{ myApp: { numericOrDateDataTypeFacetData: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of FacetViewPane classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by ExpandedFacetViewPane and by MinimizedFacetsView
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetViewPane: {
        "class": o("GeneralArea", "TrackSaveViewController"),
        context: {
            myFacets: [
                { myPane: [me] },
                [{ myApp: { facets: _ } }, [me]]
            ],

            firstFacetInPane: [first, [{ myFacets: _ }, [me]]],
            lastFacetInPane: [last, [{ myFacets: _ }, [me]]],
        },
        position: {
            attachBottomInAbsenceOfMinimizedOverlaysView: compileMinimizedOverlays ?
                {}
                :
                {
                    point1: { type: "bottom" },
                    point2: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "bottom",
                        content: true
                    },
                    equals: 0
                }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a view in which facets can be viewed. It is inherited by the ExpandedReorderableFacetViewPane
    // API:
    // 1. offsetFromZoomBoxTop: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedFacetViewPane: {
        "class": "FacetViewPane",
        context: {
            offsetFromZoomBoxTop: bFSAppPosConst.facetViewPaneOffsetFromZoomBoxTop,

            expandedFacetToPaneOffsetTop: bFSPosConst.verticalMarginAroundFacet,
            expandedFacetToPaneOffsetBottom: bFSPosConst.verticalMarginAroundFacet
        },
        position: {
            topConstraint: {
                point1: {
                    element: [areaOfClass, "ZoomBox"],
                    type: "top"
                },
                point2: {
                    type: "top"
                },
                equals: [{ offsetFromZoomBoxTop: _ }, [me]]
            },
            labelAnchorForFacetTop: {
                point1: {
                    type: "top",
                    content: true
                },
                point2: {
                    label: "anchorForFacetTop"
                },
                equals: [{ expandedFacetToPaneOffsetTop: _ }, [me]]
            },
            labelAnchorForFacetBottom: {
                point1: {
                    label: "anchorForFacetBottom"
                },
                point2: {
                    type: "bottom",
                    content: true
                },
                equals: [{ expandedFacetToPaneOffsetBottom: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a view in which reorderable facets can be viewed. It is inherited by the MovingFacetViewPane and the FrozenFacetViewPane.
    // It inherits ReorderableController: the facets in this pane can be reordered by dragging&dropping their facet handle.
    // Reordering of facets is done by storing an os of their uniqueIDs. Their uniqueID is used, in turn, to retrieve their
    // dataObj, which contains the rest of their definition. 
    // 
    // API:
    // 1. ExpandedFacetViewPane's API
    // 2. reorderedFacetInPaneUniqueIDs
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedReorderableFacetViewPane: o(
        { // default
            "class": "ExpandedFacetViewPane",
            context: {

                // Explanation on the calculation of myFacets: 
                // We maintain a separate ordering for each of the expanded facet panes, which differs from the default ordering, reorderedFacetDataUniqueID,
                // used in the areaSet of their embedding FacetClipper.
                // the ordering of facets in this pane is stored in reorderedFacetInPaneUniqueIDs. 
                // from that we obtain the os of the corresponding facets, to provide visReordered. 
                myFacets: [sort, // sort myFacets by their uniqueID attribute, per the ordering specified in reorderedFacetInPaneUniqueIDs
                    // see note above "Facet & Overlay Management: An important note on functional vs. appData."
                    [ // the data
                        { myPane: [me] },
                        [{ myApp: { facets: _ } }, [me]]
                    ],
                    { uniqueID: [{ reorderedFacetInPaneUniqueIDs: _ }, [me]] } // the sort key
                ]
            }
        },
        {
            qualifier: { reorderedFacetInPaneUniqueIDs: true },
            "class": "ReorderableController",
            context: {
                // ReorderableController params:
                // myReorderableController is left at its default value of [me])
                reorderingSpacing: bFSAppPosConst.expandedFacetSpacing,
                reordered: [{ reorderedFacetInPaneUniqueIDs: _ }, [me]],
                visReordered: [{ myFacets: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the frozen facets view pane. It is embedded in FSApp.
    // It inherits ExpandedReorderableFacetViewPane, and provides it with the necessary data for its facets areaSet. 
    // 
    // API:
    // 1. offsetFromFirstFacet: default provided
    // 2. offsetFromLastFacet: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FrozenFacetViewPane: o(
        { // qualifier
            qualifier: "!",
            context: {
                showPane: o( // the pane shouldn't be showing if there are no expanded overlays, or there's no OverlaySolutionSetView of a zoomboxing overlay
                    [{ expanded: _ }, [areaOfClass, "PermOverlay"]],
                    [{ ofZoomBoxingOverlay: _ }, [areaOfClass, "OverlaySolutionSetView"]]
                )
            }
        },
        { // default
            "class": "ExpandedFacetViewPane",
            position: {
                anchorLeftRelativeToZoomBoxOrnament: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bFSAppPosConst.marginFromZoomBoxOrnament
                },
                anchorToPaneOnRight: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "MovingFacetViewPane"],
                        type: "left"
                    },
                    equals: [{ offsetFromMovingPane: _ }, [me]]
                }
            }
        },
        {
            qualifier: { showPane: true },
            "class": o("FrozenFacetViewPaneDesign", "ExpandedReorderableFacetViewPane"),
            context: {
                offsetFromMovingPane: bFSAppPosConst.expandedFacetSpacing,

                // Note: this is a non-standard mergeWrite because expandedFrozenFacetUniqueIDs can store o() as a perfectly valid value.
                // if it stores that value, mergeWrite cannot differentiate between a non-existent path for its first parameter (in which case it should
                // take its second parameter), and the "valid" o() value. 
                // to work around that, we merge it with (the second parameter in the mergeWrite) an *object*, and not a terminal
                reorderedFacetInPaneUniqueIDs: [
                    { expandedFrozenFacetUniqueIDs: _ },
                    [mergeWrite,
                        [{ myApp: { currentView: _ } }, [me]],
                        { expandedFrozenFacetUniqueIDs: [{ myApp: { defaultFrozenFacetUniqueIDs: _ } }, [me]] }
                    ]
                ],

                offsetFromFirstFacet: 0,
                offsetFromLastFacet: 0,

                draggedMovingFacet: [
                    { iAmDraggedToReorder: true },
                    [areaOfClass, "MovingFacet"]
                ],

                // ModalDialogableOnDragAndDrop params
                draggedElementForModalDialogable: [{ draggedMovingFacet: _ }, [me]],
                conditionsForModalDialogable: [greaterThan,
                    [offset,
                        { element: [{ draggedMovingFacet: _ }, [me]], type: "right" },
                        { type: "right", content: true }
                    ],
                    0
                ]
            },
            position: {
                // attach to first frozen facet: see FrozenFacet class
                weaklyAttachToEndOfVisReorderableOfLast: {
                    point1: {
                        element: [last, [{ myFacets: _ }, [me]]],
                        label: "endOfVisReorderable"
                    },
                    point2: {
                        type: "right"
                    },
                    equals: [{ offsetFromLastFacet: _ }, [me]],
                    // weakerThanDefault so that if the FrozenPane is full of facets, they will overflow
                    // to the right, and trigger the minimization operation once they're fully out of view
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: {
                showPane: true,
                reorderedFacetInPaneUniqueIDs: false
            },
            "class": "MinWrapHorizontal",
            context: {
                minWrapCompressionPriority: positioningPrioritiesConstants.weakerThanDefault // higher-force compression, to win over other MinWrapHorizontals
            }
        },
        {
            qualifier: { showPane: false },
            context: {
                offsetFromMovingPane: 0
            },
            position: {
                width: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class represents the moving facets view pane - a pane of facets which can be scrolled out of view (to allow viewing other facets). It is embedded in FSApp.
    // It inherits:
    // 1. ExpandedReorderableFacetViewPane: provides it with the necessary data for its associated facets areaSet. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovingFacetViewPane: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                initialExpansionStatesAsNum: [arg, "initialExpansionStateByMovingFacetPos", o()]
            }
        },
        { // default
            "class": "ExpandedReorderableFacetViewPane",
            context: {
                // Note: this is a non-standard mergeWrite because expandedMovingFacetUniqueIDs can store o() as a perfectly valid value.
                // if it stores that value, mergeWrite cannot differentiate between a non-existent path for its first parameter (in which case it should
                // take its second parameter), and the "valid" o() value. 
                // to work around that, we merge it with (the second parameter in the mergeWrite) an *object*, and not a terminal
                reorderedFacetInPaneUniqueIDs: [
                    { expandedMovingFacetUniqueIDs: _ },
                    [mergeWrite,
                        [{ myApp: { currentView: _ } }, [me]],
                        { expandedMovingFacetUniqueIDs: [{ myApp: { defaultMovingFacetUniqueIDs: _ } }, [me]] }
                    ]
                ]
            },
            position: {
                rightConstraint: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "right"
                    },
                    equals: bFSAppPosConst.movingFacetViewPaneRightFromExpandedOverlaysViewRight
                }
            }
        },
        {
            qualifier: { initialExpansionStatesAsNum: true },
            context: {
                maxPos: [cond,
                    [lessThanOrEqual, [{ initialExpansionStatesAsNum: _ }, [me]], 0],
                    o(
                        { on: true, use: o() }, // to ensure we don't try to sequence -infinity in the definition of i that follows
                        { on: null, use: [floor, [log10, [{ initialExpansionStatesAsNum: _ }, [me]]]] }
                    )
                ],
                i: [minus, [{ maxPos: _ }, [me]], [sequence, r(0, [{ maxPos: _ }, [me]])]], // the range of indices over "num"          
                i10: [pow, 10, [{ i: _ }, [me]]], // powers of each digit
                initialExpansionStatesOS: [mod, // the separate digits
                    [floor, [div, [{ initialExpansionStatesAsNum: _ }, [me]], [{ i10: _ }, [me]]]],
                    10
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myView
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofHorizontalView: [
                    "Horizontal",
                    [classOfArea, [{ myView: _ }, [me]]]
                ]
            }
        },
        {
            qualifier: { ofHorizontalView: true },
            "class": "Horizontal"
        },
        {
            qualifier: { ofHorizontalView: false },
            "class": "Vertical"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of FacetViewPane classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of GlobalBaseItemSet and embedded classes (Overlay-related)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the global itemSet, from which overlays select items (both extensional and intensional overlays). 
    // It is embedded in AppFrame and matches its dimension. It stores the unified itemDB in its content.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    GlobalBaseItemSet: {
        "class": "GeneralArea",
        position: {
            frame: 0
        },
        content: [{ myApp: { itemDB: _ } }, [me]]
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class visually represents the effectiveBaseOverlay - that we zoomBox into (a play on sandbox, that we zoom into): 
    // its solutionSet is the itemSet out of which all zoomBoxed overlays' solutionSets are calculated. to support this notion, the AppFrame is the color of the effectiveBaseOverlay.
    // 
    // This class embeds:
    // 1. ZoomBox (Lean/Fat) - the class over which the zoomBoxed overlays are displayed.
    // 2. AppFrameMinimizationControl: the class that allows to minimize/unminimize the AppFrame.
    //
    // minimized: 
    // this class maintains an appData of whether it's minimized or not. this appData is controlled via the writable reference provided by the embedded AppFrameMinimizationControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppFrame: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minimized: [mergeWrite,
                    [{ myApp: { currentView: { appFrameMinimized: _ } } }, [me]],
                    false
                ]
            }
        },
        { // default
            "class": o("AppFrameDesign", "GeneralArea", "TrackDataSourceSelected"),
            position: {
                left: bFSAppPosConst.appFrameHorizontalMargin,
                right: bFSAppPosConst.appFrameHorizontalMargin,
                bottom: bFSAppPosConst.appFrameVerticalMargin,

                labelBottomOfAppFrameTitleRow: {
                    point1: { type: "top" },
                    point2: { label: "bottomOfAppFrameTitleRow" },
                    equals: [densityChoice, [{ fsAppPosConst: { marginBetweenZoomBoxAndExpandedFrame: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            children: {
                zoomBox: {
                    description: {
                        "class": "ZoomBox"
                    }
                },
                globalBaseItemSet: {
                    description: {
                        "class": "GlobalBaseItemSet"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanAppFrame: {
        "class": "AppFrame",
        position: {
            top: bFSAppPosConst.appFrameVerticalMargin
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatAppFrame: o(
        {
            qualifier: "!",
            context: {
                embedFrameMinimizationControl: o(
                    [not, [{ ofZCApp: _ }, [me]]],
                    [and,
                        [{ ofZCApp: _ }, [me]],
                        [{ dataSourceSelected: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": "AppFrame",
        },
        {
            qualifier: { embedFrameMinimizationControl: true },
            position: {
                attachTopToFSAppSettingsControlsBottom: {
                    point1: { element: [areaOfClass, "FSAppSettingsControls"], type: "bottom" },
                    point2: { type: "top" },
                    equals: bFSAppPosConst.appFrameVerticalMargin
                }
            },
            children: {
                appFrameMinimizationControl: {
                    description: {
                        "class": "AppFrameMinimizationControl"
                    }
                }
            }
        },
        {
            qualifier: { embedFrameMinimizationControl: false },
            position: {
                top: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to minimize/unminimize the AppFrame. It is embedded in it, too.
    // This class inherits BiStateButton, that allows it to control the appData ^minimized of the embedding area ("checked" is used as a writable reference, mapped to that appData, and
    // not as the appData that it's defined to be in BiStateButton).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppFrameMinimizationControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minimized: [{ minimized: _ }, [embedding]]
            }
        },
        { // default
            "class": o("AppFrameMinimizationControlDesign", "AboveSiblings", "AppControl"),
            context: {
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { minimizeAppFrame: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { frameEntityStr: _ } }, [me]],
                    [not, [{ minimized: _ }, [me]]] // the boolean for booleanStringFunc should be phrased in positive terms
                ]
            },
            write: {
                onAppFrameMinimizationButtonClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggle: {
                            to: [{ minimized: _ }, [me]],
                            merge: [not, [{ minimized: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            position: {
                verticalAnchor: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: bFSAppPosConst.verticalOffsetOfAppFrameMinimizationButtonFromAppFrame
                },
                horizontalAnchor: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "AppFrame"],
                        type: "right"
                    },
                    equals: bFSAppPosConst.horizontalOffsetOfAppFrameMinimizationButtonFromAppFrame
                }
            }
        },
        {
            qualifier: { minimized: true },
            position: {
                frame: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The ZoomBox is the area over which zoomBoxed overlays are displayed. It is embedded in the AppFrame.
    // It embeds:
    // 1. ZoomBoxTop/ZoomBoxMiddle/ZoomBoxBottom - three areas that cover it entirely, and are needed to support the display of the effectiveBaseOverlay's solutionSet (see ZoomBoxMiddle doc).
    // 2. ExpandedOverlaysView: the area over which overlays in the Standard (or Maximized) state are displayed.
    // 3. MinimizedOverlaysView: the area over which overlays in the Minimized state are displayed (Lean/Fat).
    // 4. AppTrash: the area over which overlays in the Trashed state are displayed (Fat).
    //
    // API:
    // 1. defaultMaximizedZoomBoxedFrameWidth (default in the sense that it doesn't apply to the top constraint). default value provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBox: o(
        { // default
            "class": o("ZoomBoxDesign", "GeneralArea", "ZTop", "TrackAppFrameMinimization", "TrackDataSourceApp", "TrackDataSourceSelected"),
            context: {
                defaultMaximizedZoomBoxedFrameWidth: bFSAppPosConst.maximizedAppFrameWidth,
                leftOffset: [plus, 2, [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]]]
            },
            children: {
                oranment: {
                    description: {
                        "class": "ZoomBoxOrnament"
                    }
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            children: {
                zoomBoxTop: {
                    description: {
                        "class": "ZoomBoxTop"
                    }
                },
                zoomBoxMiddle: {
                    description: {
                        "class": "ZoomBoxMiddle"
                    }
                },
                zoomBoxBottom: {
                    description: {
                        "class": "ZoomBoxBottom"
                    }
                },
                expandedOverlaysView: {
                    description: {
                        "class": "ExpandedOverlaysView"
                    }
                },
                appTrash: compileTrash ?
                    {
                        description: {
                            "class": "AppTrash"
                        }
                    } :
                    {},
                appSliceControlPanel: {
                    description: {
                        "class": compileMinimizedOverlays ? "FSAppSliceControlPanel" : o(),
                    }
                },
                minimizedOverlaysView: {
                    description: {
                        "class": compileMinimizedOverlays ? "MinimizedOverlaysView" : o(),
                    }
                }
            },
            position: {
                // the left side of the ZoomBox stays at htis fixed left position.
                // when we open the savedViewPane, it has a higher z-vlaue than the ZoomBox, so masks it partially.
                fixOffsetFromLeftOfApp: {
                    point1: { element: [areaOfClass, "SavedViewPane"], type: "left" },
                    point2: { type: "left" },
                    equals: [{ leftOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: { appFrameMinimized: true },
            position: {
                // left defined by SavedViewPane                
                right: bFSAppPosConst.minimizedAppFrameWidth,
                top: bFSAppPosConst.minimizedAppFrameWidth,
                bottom: bFSAppPosConst.minimizedAppFrameWidth

            }
        },
        {
            qualifier: { appFrameMinimized: false },
            position: {
                right: [{ defaultMaximizedZoomBoxedFrameWidth: _ }, [me]],
                bottom: [{ defaultMaximizedZoomBoxedFrameWidth: _ }, [me]]
            }
        },
        {
            qualifier: {
                appFrameMinimized: false,
                showDataSourcePane: false
            },
            position: {
                attachTopToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        label: "bottomOfAppFrameTitleRow"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*FSAppSliceControlPanelAndMinimizedOverlaysView: {
        "class": o("FSAppSliceControlPanelAndMinimizedOverlaysViewDesign", "MinWrap", "AboveSpecifiedAreas"),
        context: {
            minWrapAround: 0,
            areasBelowMe: [areaOfClass, "ZoomBoxBottom"]
        },
        children: {
            appSliceControlPanel: {
                description: {
                    "class": "FSAppSliceControlPanel"
                }
            },
            minimizedOverlaysView: {
                description: {
                    "class": compileMinimizedOverlays ? "MinimizedOverlaysView" : o()
                }
            }
        }
    },   */

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The common code to the three ZoomBoxPart classes: ZoomBoxTop/ZoomBoxMiddle/ZoomBoxBottom.
    // this class offers qualifiers used by the inheriting classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxPart: o(
        { // default
            "class": o("GeneralArea", "BelowOverlaysView", "TrackAppFrameMinimization", "TrackZoomBoxingOverlayShowSolutionSet"),
            position: {
                left: 0,
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Used here and by Mon1 too.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowOverlaysView: {
        stacking: {
            belowOverlaysView: {
                lower: [me],
                higher: [areaOfClass, "OverlaysView"]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the ZoomBox, and covers its top part. it inherits ZoomBoxPart.
    // its height changes depending on whether we're displaying the solutionSet of the effectiveBaseOverlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxTop: o(
        { // default
            "class": o("ZoomBoxTopDesign", "GeneralArea", "ZoomBoxPart"),
            context: {
                offsetFromBottomOfFacetHeader: 0
            },
            position: {
                top: 0,
                // hard-coded per display density as there's not guaranteed to be there a facet on whose header
                // the bottom of this area can hang on..
                /*height: [densityChoice, bFSAppPosConst.zoomBoxTopHeight]*/
                attachBottomToBottomOfFacetHeader: {
                    point1: { element: [{ myApp: _ }, [me]], label: "bottomOfFacetHeader" },
                    point2: { type: "bottom" },
                    equals: [{ offsetFromBottomOfFacetHeader: _ }, [me]]
                }
            }
        },
        {
            qualifier: { zoomBoxingOverlayShowSolutionSet: true },
            context: {
                offsetFromBottomOfFacetHeader: bFSAppPosConst.heightOfZoomBoxingOverlaySolutionSetView
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxOrnament: o(
        { // default
            "class": o("ZoomBoxOrnamentDesign", "GeneralArea", "TrackDataSourceSelected"),
            position: {
                frame: bFSAppPosConst.zoomBoxOrnamentOffsetFromZoomBox
            },
            stacking: {
                aboveZoomBoxPart: {
                    lower: [areaOfClass, "ZoomBoxPart"],
                    higher: [me]
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            "class": "BelowOverlaysView",
            children: {
                substituteAddUDFControl: compileMinimizedFacets ? // define an FSAppAddUDFacetControl when there are no minimized facets compiled!
                    {} :
                    {
                        "class": "PartnerWithIconEmbedding",
                        description: {
                            "class": compileUDF ? "FSAppAddUDFacetControl" : o(),
                            context: {
                                horizontallyMinimized: true
                            }
                        }
                    }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BEGINNING OF NEW ELEMENT CLASSES
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting class should provide the actual functionality on mouse event!
    // 2. labelText
    // 3. labelWidth: default provided
    // 4. buttonDimension: default provided.
    // 5. disabled: false, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppNewElementContainer: {
        "class": o("AppNewElementContainerDesign", "GeneralArea", "AppControl", "MinWrap"),
        context: {
            minWrapAround: 0,
            defaultWidth: false,
            defaultHeight: false,
            myLabel: [{ children: { label: _ } }, [me]],
            myButton: [{ children: { button: _ } }, [me]],
            disabled: false,
            tooltipable: false, // as the embedded 'label' area does that.

            labelWidth: [displayWidth, { display: { text: { value: [{ labelText: _ }, [me]] } } }],
            buttonDimension: [densityChoice, [{ fsAppPosConst: { newElementButtonDimension: _ } }, [globalDefaults]]]
        },
        position: {
            attachButtonToLabelHorizontally: {
                point1: {
                    element: [{ children: { button: _ } }, [me]],
                    type: "right"
                },
                point2: {
                    element: [{ children: { label: _ } }, [me]],
                    type: "left"
                },
                equals: [densityChoice, [{ bFSAppNewSlicePosConst: { buttonLabelHorizontalSpacing: _ } }, [globalDefaults]]]
            }
        },
        children: {
            button: {
                description: {
                    "class": "AppNewElementButton"
                }
            },
            label: {
                description: {
                    "class": "AppNewElementLabel"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppNewElementComponent: o(
        { // variant-controller
            qualifier: "!",
            context: {
                disabled: [{ disabled: _ }, [embedding]]
            }
        },
        { // default    
            "class": "GeneralArea",
            position: {
                "vertical-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppNewElementButton: {
        "class": o("AppNewElementButtonDesign", "AppNewElementComponent"),
        position: {
            left: 0,
            top: 0,
            bottom: 0,
            width: [{ buttonDimension: _ }, [embedding]],
            height: [{ buttonDimension: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppNewElementLabel: {
        "class": o("AppNewElementLabelDesign"),
        context: {
            displayText: [{ labelText: _ }, [embedding]]
        },
        position: {
            top: 0,
            bottom: 0,
            minContentWidth: {
                point1: { type: "left", content: true },
                point2: { type: "right", content: true },
                min: [{ labelWidth: _ }, [embedding]]
            },
            right: [densityChoice, [{ fsAppPosConst: { marginOnRightOfNewElementLabel: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // END OF NEW ELEMENT CLASSES
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BEGIN OF SLICE CONTROL PANEL CLASSES
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This is the container of the two plus buttons containers (new filter, new list), and the overlay search box
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FSAppSliceControlPanel: o(
        { //variable-controller
            qualifier: "!",
            context: {
                minimizedOverlaysCompiled: compileMinimizedOverlays,
                minimizedOverlaysExist: [areaOfClass, "MinimizedVisibleOverlay"]
            }
        },
        { //default
            "class": o("GeneralArea", "AboveSpecifiedAreas", "CalculateMaxWidthOfStrings", "TrackOverlayMaximization", "TrackAppTrash"),
            context: {
                myMinimizedOverlaySearchBox: [{ children: { minimizedOverlaySearchBox: _ } }, [me]],
                myFilterContainer: [{ children: { newFilterContainer: _ } }, [me]],
                myListContainer: [{ children: { newListContainer: _ } }, [me]],
                myFilterButton: [{ myFilterContainer: { children: { button: _ } } }, [me]],
                myListButton: [{ myListContainer: { children: { button: _ } } }, [me]],
                maxWidthOfNewSliceLabels: [
                    [{ maxWidthOfStrings: _ }, [me]],
                    [{ labelText: _ }, [areaOfClass, "AppNewSliceContainer"]]
                ],

                newSliceContainerWidth: [densityChoice, [{ fsAppPosConst: { newSliceContainerWidth: _ } }, [globalDefaults]]],
                sliceControlPanelElementHorizontalSpacing: [densityChoice, [{ bFSAppNewSlicePosConst: { horizontalOffsetBetweenFilterAndListContainers: _ } }, [globalDefaults]]],

                offsetFromAreaAttachedToAbove: bFSAppPosConst.bottomViewFromFacetViewPane,

                //AboveSpecifiedAreas params
                areasBelowMe: [areaOfClass, "ZoomBoxBottom"]
            },
            position: {
                horizontalOffsetBetweenOverlaySearchBoxAndContainers: {
                    point1: {
                        type: "right",
                        element: [{ myMinimizedOverlaySearchBox: _ }, [me]]
                    },
                    point2: {
                        type: "left",
                        element: [{ myFilterContainer: _ }, [me]]
                    },
                    equals: [{ sliceControlPanelElementHorizontalSpacing: _ }, [me]]
                },
                horizontalOffsetBetweenContainers: {
                    point1: { element: [{ myFilterContainer: _ }, [me]], type: "right" },
                    point2: { element: [{ myListContainer: _ }, [me]], type: "left" },
                    equals: [{ sliceControlPanelElementHorizontalSpacing: _ }, [me]]
                },
                appSliceControlPanelLeftConstraint: {
                    point1: {
                        element: [areaOfClass, "FrozenFacetViewPane"],
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: 0
                },
                attachToAreaAbove: {
                    point1: {
                        element: [areaOfClass, "FrozenFacetViewPane"],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ offsetFromAreaAttachedToAbove: _ }, [me]]
                }
            }
        },
        {
            qualifier: { minimizedOverlaysCompiled: false },
            position: {
                // in order to place FSAppSliceControlPanel below FrozenFacetViewPane 
                // when compileMinimizedOverlays = false
                minVerticalDistanceFromFrozenFacetViewPane: {
                    point1: {
                        element: [areaOfClass, "FrozenFacetViewPane"],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    min: 0
                }
            }
        },
        {
            qualifier: { maximizedOverlayExists: false },
            "class": "TrackNoLists",
            children: {
                minimizedOverlaySearchBox: {
                    description: {
                        "class": "MinimizedOverlaySearchBox"
                    }
                },
                newFilterContainer: {
                    description: {
                        "class": "NewFilterControl"
                    }
                }
            }
        },
        {
            qualifier: {
                maximizedOverlayExists: false,
                noLists: false
            },
            children: {
                newListContainer: {
                    description: {
                        "class": "NewListControl"
                    }
                }
            }
        },
        {
            qualifier: { minimizedOverlaysExist: true },
            children: {
                minimizedOverlaysTitle: {
                    description: {
                        "class": "MinimizedOverlaysTitle"
                    }
                }
            }
        },
        {
            qualifier: { maximizedOverlayExists: true },
            children: {
                unmaximizeOverlayControl: {
                    description: {
                        "class": "UnmaximizeOverlayControl"
                    }
                }
            }
        },
        {
            qualifier: {
                maximizedOverlayExists: true,
                appTrashOpen: false
            },
            position: {
                attachToBottomOfZoomBoxOrnament: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "bottom", content: true },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    NewFilterControl: {
        "class": o("AppNewSliceContainer", "NewIntOverlayControl"),
        context: {
            labelText: [{ myApp: { intOverlayEntityStr: _ } }, [me]],
            labelWidth: [{ maxWidthOfNewSliceLabels: _ }, [areaOfClass, "FSAppSliceControlPanel"]],
            rightmostNewSliceContainer: [{ noLists: _ }, [me]] // AppNewSliceContainer param
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    NewListControl: {
        "class": o("AppNewSliceContainer", "NewExtOverlayControl"),
        context: {
            labelText: [{ myApp: { extOverlayEntityStr: _ } }, [me]],
            labelWidth: [{ maxWidthOfNewSliceLabels: _ }, [areaOfClass, "FSAppSliceControlPanel"]],
            rightmostNewSliceContainer: [not, [{ noLists: _ }, [me]]] // AppNewSliceContainer param
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API:
    // 1. rightmostNewSliceContainer: a boolean flag. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppNewSliceContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                alignNewSliceControlsVertically: [{ alignNewSliceControlsVertically: _ }, [embedding]],
                minimizedOverlaysExist: [{ minimizedOverlaysExist: _ }, [embedding]]
            }
        },
        { // default
            "class": o("AppNewElementContainer", "TrackNoLists"),
            context: {
                verticalMargin: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
                // override AppNewElementContainer default
                buttonDimension: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]]
            },
            position: {
                width: [{ newSliceContainerWidth: _ }, [embedding]],
                top: [{ verticalMargin: _ }, [me]],
                bottom: [{ verticalMargin: _ }, [me]]
            }
        },
        {
            qualifier: {
                rightmostNewSliceContainer: true,
                minimizedOverlaysExist: false
            },
            position: {
                right: [{ sliceControlPanelElementHorizontalSpacing: _ }, [embedding]]
            }
        },
        {
            qualifier: {
                minimizedOverlaysExist: true,
                rightmostNewSliceContainer: true
            },
            position: {
                attachRightToLeftOfMinimizedOverlaysTitle: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "MinimizedOverlaysTitle"],
                        type: "left"
                    },
                    equals: [{ sliceControlPanelElementHorizontalSpacing: _ }, [embedding]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedOverlaysTitle: {
        "class": o("MinimizedOverlaysTitleDesign", "GeneralArea", "DisplayDimension"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { itemEntityStrPlural: _ } }, [me]],
                    ":"
                )
            ]
        },
        position: {
            // left constraint: see NewListControl, its neighbor on the left
            "vertical-center": 0,
            right: [{ sliceControlPanelElementHorizontalSpacing: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UnmaximizeOverlayControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minimizedOverlaysExist: [{ minimizedOverlaysExist: _ }, [embedding]]
            }
        },
        { // default
            "class": o("UnmaximizeOverlayControlDesign", "GeneralArea"),
            context: {
                displayText: [concatStr,
                    o(
                        [{ myApp: { showStr: _ } }, [me]],
                        [{ myApp: { allStr: _ } }, [me]],
                        [{ myApp: { overlayEntityStrPlural: _ } }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                left: 0,
                top: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
                height: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]],
                bottom: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
                "content-width": [displayWidth]
            },
            write: {
                UnmaximizeOverlayControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setMaximizedOverlay: {
                            to: [{ myApp: { maximizedOverlayUniqueID: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { minimizedOverlaysExist: false },
            position: {
                right: 0
            }
        },
        {
            qualifier: { minimizedOverlaysExist: true },
            position: {
                attachRightToLeftOfMinimizedOverlaysTitle: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "MinimizedOverlaysTitle"],
                        type: "left"
                    },
                    equals: [{ sliceControlPanelElementHorizontalSpacing: _ }, [embedding]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // END OF SLICE CONTROL PANEL CLASSES
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class is embedded in the ZoomBox, and covers its middle part. It inherits ZoomBoxPart.
    // its height changes depending on whether we're displaying the solutionSet of the effectiveBaseOverlay: this is what provides the visual separation between the solutionSet of the effectiveBaseOverlay
    // and the zoomBoxed overlays.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxMiddle: o(
        { // default
            "class": o("ZoomBoxMiddleDesign", "ZoomBoxPart"),
            position: {
                topConstraint: {
                    point1: {
                        element: [{ children: { zoomBoxTop: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { zoomBoxingOverlayShowSolutionSet: false },
            position: {
                height: 0
            }
        },
        {
            qualifier: { zoomBoxingOverlayShowSolutionSet: true },
            context: {
                color: [{ myApp: { effectiveBaseOverlay: { color: _ } } }, [me]]
            },
            position: {
                height: bFSAppPosConst.verticalMarginBelowZoomBoxingOverlaySolutionSetView
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class is embedded in the ZoomBox, and covers its bottom part. it inherits ZoomBoxPart.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxBottom: o(
        { // default
            "class": o("ZoomBoxBottomDesign", "ZoomBoxPart"),
            position: {
                topConstraint: {
                    point1: {
                        element: [{ children: { zoomBoxMiddle: _ } }, [embedding]],
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
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // common code to the overlays views classes - allows for easier referencing.
    // API:
    // 1. lowHTMLLength/highHTMLLength (inheriting classes currently also inherit Horizontal/Vertical, thus defining these context labels).
    // 2. leftAnchorToZoomBoxOrnament: true, by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaysView: o(
        { //variant-controller
            qualifier: "!",
            context: {
                leftAnchorToZoomBoxOrnament: true
            }
        },
        { //default
            "class": "GeneralArea",
            context: {
                // defining the beginning and end posPoints, used by VisibleOverlayLayout
                beginningOfOverlaysView: {
                    element: [me],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                endOfOverlaysView: {
                    element: [me],
                    type: [{ highHTMLLength: _ }, [me]]
                }
            },
            position: {
                overlaysViewHasNonNegativeHeight: {
                    point1: { type: "top", content: true },
                    point2: { type: "bottom", content: true },
                    min: 0
                }
            }
        },
        {
            qualifier: { leftAnchorToZoomBoxOrnament: true },
            position: {
                anchorLeftRelativeToZoomBoxOrnament: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bFSAppPosConst.marginFromZoomBoxOrnament
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the area over which overlays (in fact: their VisibleOverlay embedded area) in the Standard (and Maximized) state are positioned.
    // It inherits OverlaysView.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedOverlaysView: o(
        { // default 
            "class": o("OverlaysView", "Vertical"),
            context: {
                lastExpandedVisibleOverlay: [{ lastInVisibleOverlaysPeerOS: true }, [areaOfClass, "ExpandedVisibleOverlay"]]
            },
            position: {
                // right constraint - see MovingFacetViewPane
                topConstraint: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxBottom"],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: bFSAppPosConst.zoomBoxBottomTopFromExpandedOverlaysViewTop
                },
                compileWithoutMinimizedFacets: compileMinimizedFacets ? {} :
                    { // if we compileMinimizedFacets: false, we need to make sure the ExpandedOverlaysView is attached on the right
                        point1: { type: "right" },
                        point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "right", content: true },
                        equals: 10
                    },
                // bottom constraint - wrt FacetViewPane, and defined in FSApp.
                minAnchorToTopOfExpandedOverlaysViewForGhostRows: {
                    point1: { type: "top" },
                    point2: { label: "anchorForGhostRows" },
                    min: 0
                },
                minAnchorToEndOfVisReorderableOfLastExpandedVisibleOverlay: {
                    point1: {
                        element: [{ lastExpandedVisibleOverlay: _ }, [me]],
                        label: "endOfVisReorderable"
                    },
                    point2: { label: "anchorForGhostRows" },
                    min: 0
                },
                eitherAttachToTopOfExpandedOverlaysView: {
                    point1: { type: "top" },
                    point2: { label: "anchorForGhostRows" },
                    orGroups: "anchorForGhostRows",
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                orAttachToLastExpandedVisibleOverlay: {
                    point1: {
                        element: [{ lastExpandedVisibleOverlay: _ }, [me]],
                        label: "endOfVisReorderable"
                    },
                    point2: { label: "anchorForGhostRows" },
                    orGroups: "anchorForGhostRows",
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                // a hack! intended to prevent the OverlaySolutionSetView of the expanded overlays from briefly creating an awful lot of areas as their 
                // bottom isn't bound. it isn't bound because the ExpandedOverlaysView exists before the MinimizedOverlaysView, which is below it - in the 
                // absence of the latter, the former's bottom is unbound, and so the bottom fo the OverlaySolutionSetView is unbound.
                // to hack around that, we bound the bottom of ExpandedOverlaysView by the bottom of the app.
                keepBottomAboveAppBottom: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myApp: _ }, [me]], type: "bottom" },
                    min: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // Common code to MinimizedOverlaysView and to AppTrash.
    // It inherits OverlaysView.
    //
    // API 
    // 1. show: boolean flag, true by default.
    // 2. height (defaults provided)
    // 3. offsetFromBottom (used by inheriting classes: MinimizedOverlaysView and AppTrash) (defaults provided)
    // 4. offsetFromLeft (default provided)
    // 5. offsetFromRight (default provided)
    // 6. myOverlays: os of associated Overlays.
    // 7. overlayWidth: the width of the overlays displayed in this view - accessed by the embedded doc.
    // 8. horizontalSpacing/verticalSpacing
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BottomView: o(
        { // default
            "class": o("GeneralArea", "OverlaysView", "TrackOverlayMaximization"),
            context: {
                height: bFSAppPosConst.bottomViewHeight,
                offsetFromBottom: bFSAppPosConst.bottomViewsMarginFromBottomOfEmbedding,
                offsetFromLeft: bFSAppPosConst.bottomViewsHorizontalMarginFromEmbedding,
                offsetFromRight: bFSAppPosConst.bottomViewsHorizontalMarginFromEmbedding,
                show: true
            }
        },
        {
            qualifier: { show: true },
            "class": "MatrixView",
            context: {
                // MatrixView params:
                // nr_rows definition: see inheriting classes
                expansionAxis: "vertical",
                fixed_width: true,
                scrollbarBorderColor: "transparent",
                scrollbarSide: "end"
                // initial_nr_rows: use default value               
            },
            children: {
                doc: {
                    description: {
                        "class": "BottomViewDoc"
                    }
                }
            }
        },
        /*{
            qualifier: { show: false },
            position: {
                height: 0
            }
        },*/
        {
            qualifier: { resizeHandleNeeded: true },
            children: {
                verticalResizeHandle: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "BottomViewResizeHandle"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    BottomViewDoc: {
        "class": o("GeneralArea", "Matrix"),
        context: {
            // Matrix params:           
            myMatrixCellUniqueIDs: [
                { uniqueID: _ },
                [
                    { matchSearchStr: true },
                    [{ myOverlays: { children: { visibleOverlay: _ } } }, [embedding]]
                ]
            ],
            all_data: [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]],

            // i.e. a VisibleOverlay being reordered to 'first' place will be positioned in [pos, 1] in all_data, after the EffectiveBaseOverlay            
            firstMatrixCellInAllData: 1,
            cell_width: [{ overlayWidth: _ }, [embedding]],
            cell_height: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]],
            horizontal_spacing: [{ horizontalSpacing: _ }, [embedding]],
            vertical_spacing: [{ verticalSpacing: _ }, [embedding]]
        },
        position: {
            left: 0,
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    BottomViewResizeHandle: {
        "class": "AppMatrixElementTopResizeHandle",
        context: {
            myMatrix: [{ children: { doc: _ } }, [expressionOf]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the area over which overlays in the Minimized state are positioned.
    // It inherits BottomView, and TrackAppTrash - both which are used to determine its position.
    // API (defaults provided)
    // 1. areaRefToAttachToAbove & offsetFromAreaAttachedToAbove
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedOverlaysView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                alignVerticallyWithAppSliceControlPanel: [greaterThan,
                    [offset,
                        {
                            label: "rightOfLastMinimizedOverlayOnSingleRow"
                        },
                        {
                            element: [areaOfClass, "MinimizedOverlaysView"],
                            type: "right",
                            content: true
                        }
                    ],
                    0
                ]
            }
        },
        { // default
            "class": o("MinimizedOverlaysViewDesign", "BottomView", "TrackAppTrash", "AboveSpecifiedAreas"),
            context: {
                // BottomView params
                initial_nr_rows: [cond, // if there's a need for the second row, expand there automatically (unless the user determines otherwise via UX)
                    [lessThanOrEqual, [{ actual_nr_rows: _ }, [me]], 1],
                    o({ on: true, use: 1 }, { on: false, use: 2 })
                ],
                nr_rows: [mergeWrite, // override the default appData definition in MatrixView
                    [{ myApp: { currentView: { numRowsMinimizedOverlaysView: _ } } }, [me]],
                    [{ initial_nr_rows: _ }, [me]]
                ],
                myOverlays: [{ myApp: { minimizedOverlays: _ } }, [me]],
                overlayWidth: [densityChoice, [{ fsAppPosConst: { widthOfOSRControls: _ } }, [globalDefaults]]],
                horizontalSpacing: bFSAppPosConst.minimizedVisibleOverlayHorizontalSpacing,
                verticalSpacing: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
                leftAnchorToZoomBoxOrnament: false,
                wheelScrollInPixels: [plus, // override default UpDownOnArrowOrWheel param (via ContMovableController and MatrixView)
                    // this ensures that a turn of the mouse wheel will feel like a "next"/"prev" of matrix cells.
                    [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]], // the height of a minimized overlay (see OSR)
                    [{ verticalSpacing: _ }, [me]]
                ],

                //AboveSpecifiedAreas params
                areasBelowMe: [areaOfClass, "ZoomBoxBottom"],
                offsetFromAreaAttachedToAbove: [{ verticalSpacing: _ }, [me]]
            },
            position: {
                attachToAreaAbove: {
                    point1: {
                        element: [{ areaRefToAttachToAbove: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ offsetFromAreaAttachedToAbove: _ }, [me]]
                },
                labelRightOfLastMinimizedOverlayOnSingleRow: { // used for alignNewSliceControlsVertically calculation
                    point1: { element: [areaOfClass, "FSAppSliceControlPanel"], type: "right" },
                    point2: { label: "rightOfLastMinimizedOverlayOnSingleRow" },
                    equals: [mul,
                        // width of the minimized overlays (their VisibleOverlay, actually), if they were laid out on a single row
                        [size, [{ minimized: true }, [areaOfClass, "PermOverlay"]]],
                        [plus,
                            [{ overlayWidth: _ }, [areaOfClass, "MinimizedOverlaysView"]],
                            [{ horizontalSpacing: _ }, [areaOfClass, "MinimizedOverlaysView"]]
                        ]
                    ]
                }
            }
        },
        {
            qualifier: { appTrashOpen: false },
            position: {
                attachToBottomOfZoomBoxOrnament: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "bottom", content: true },
                    equals: [{ verticalSpacing: _ }, [me]] // when trash open, AppTrash provides the vertical constraint to this area's bottom
                },
                attachToZoomBoxWhenNoTrashCompiled: compileTrash ?
                    {} :
                    {
                        point1: { type: "right" },
                        point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "right", content: true },
                        equals: 0
                    }
            }
        },
        {
            qualifier: { appTrashOpen: true },
            position: {
                attachRightToZoombox: {
                    point1: { type: "right" },
                    point2: {
                        element: [areaOfClass, "ZoomBox"],
                        type: "right"
                    },
                    equals: [{ offsetFromRight: _ }, [me]] // when trash is closed, AppTrash provides the horizontal constraint to this area's right
                }
            }
        },
        {
            qualifier: { alignVerticallyWithAppSliceControlPanel: true },
            context: {
                areaRefToAttachToAbove: [areaOfClass, "MovingFacetViewPane"],
            },
            position: {
                alignVerticallyWithAppSliceControlPanel: {
                    point1: {
                        element: [areaOfClass, "FSAppSliceControlPanel"],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ verticalSpacing: _ }, [me]]
                },
                leftAttachToFSAppSliceControlPanel: {
                    point1: {
                        element: [areaOfClass, "FSAppSliceControlPanel"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [densityChoice, [{ bFSAppNewSlicePosConst: { horizontalOffsetBetweenNewSlicePaneAndMinimizedOverlaysView: _ } }, [globalDefaults]]],
                }
            }
        },
        {
            qualifier: { alignVerticallyWithAppSliceControlPanel: false },
            context: {
                areaRefToAttachToAbove: [areaOfClass, "FSAppSliceControlPanel"],
                offsetFromAreaAttachedToAbove: 0
            },
            position: {
                leftAttachToFSAppSliceControlPanel: {
                    point1: {
                        element: [areaOfClass, "FSAppSliceControlPanel"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // Facet modification of the embedded areaSet of ScrollableDot.
    // This class assumes it is inherited by an area that inherits DottedScroller, which has an areaSet named 'dots'.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FacetModOfScrollableDot: {
        children: {
            dots: {
                // data: see DottedScroller
                description: {
                    "class": "Tooltipable",
                    context: {
                        tooltipText: [{ snappableRepresented: { name: _ } }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the area over which the ZoomBoxing overlays are positioned. It is embedded in the AppFrame, and it inherits OverlaysView.
    // 
    // API: 
    // 1. top constraint
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingOverlaysView: {
        "class": o("OverlaysView", "Horizontal", "MinWrapVertical"),
        context: {
            minWrapRefAreas: [{ ofZoomBoxingOverlay: true }, [areaOfClass, "OSR"]],
            leftAnchorToZoomBoxOrnament: false // override OverlaysView param
        },
        position: {
            leftConstrainttoEffectiveBaseSummary: {
                point1: {
                    element: [areaOfClass, "EffectiveBaseSummary"],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 2
            },
            rightConstraintToZoomBox: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [areaOfClass, "ZoomBox"],
                    type: "right"
                },
                equals: 0
            }
            // height determined via MinWrapVertical: note the non-default value assigned to minWrapRefAreas
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of GlobalBaseItemSet and embedded classes (Overlay-related)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Application-level controls (well, almost all of them)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This control switches all facets to facetState.summary. 
    // (This differs from CORE::FacetSummaryViewControl below, which overrides the facets' state with facetState.summary - and when exiting the facetSummaryView state, they revert to their
    // previous expansion state).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryStateControl: {
        "class": "GeneralArea",
        context: {
            displayText: "Table View"
        },
        write: {
            onFacetSummaryStateControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    turnOffShowAmoeba: {
                        to: [{ showAmoeba: _ }, [areaOfClass, "FacetWithAmoeba"]],
                        merge: false
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This control switches all facets to facetState.summary.     
    // (This differs from Core::FacetSummaryViewControl below, which overrides the facets' state with facetState.summary - and when exiting the facetSummaryView state, they revert to their
    // previous expansion state).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStandardStateControl: {
        "class": "GeneralArea",
        context: {
            displayText: "Expand Facets"
        },
        write: {
            onFacetStandardStateControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    turnOnShowAmoeba: {
                        to: [{ showAmoeba: _ }, [areaOfClass, "FacetWithAmoeba"]],
                        merge: true
                    },
                    turnOffShowHistogram: {
                        to: [{ showHistogram: _ }, [areaOfClass, "FacetWithAmoeba"]],
                        merge: false
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This control switches all facets to their summary state 
    // (worth noting here: this overrides their appData, so that when turning off the facet summary view, they revert to their preexisting appData).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryViewControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                facetSummaryView: [{ myApp: { facetSummaryView: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                checked: [{ myApp: { facetSummaryView: _ } }, [me]]
            },
            write: {
                onFacetSummaryViewControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleFacetSummaryView: {
                            to: [{ facetSummaryView: _ }, [me]],
                            merge: [not, [{ facetSummaryView: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This control switches all expanded (moving) facets to the minimized state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetMinimizeStateControl: {
        "class": "GeneralArea",
        context: {
            displayText: "Minimize Facets"
        },
        write: {
            onFacetMinimizeStateControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetReorderedFacetsInPaneUniqueIDsOfMovingFacetViewOPane: {
                        to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class is the common code to the NewIntOverlayControl and NewExtOverlayControl.
    //
    // On mouseClick, it pushes a new overlay object into FSApp's overlayData os, and increments the new overlay counter appData stored there.
    // If the application is in the maximizedOverlay state, adding a new overlay results in reverting to the un-maximized state (so as to allow the user to see the new overlay).   
    //
    // API: 
    // 1. displayText: text to be displayed on the button.
    // 2. newOverlayInitAppData: myApp's permExtOverlayInitAppData/permIntOverlayInitAppData
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewOverlayControl: o(
        { // default
            "class": o("GeneralArea", "AddNewOverlayControl", "AddOMFacetHandler", "TrackOverlayMaximization"),
            context: {
                // AddNewOverlayControl param
                newOverlayDataObj: [merge,
                    {
                        overlayCounter: [{ myApp: { newOverlayCounter: _ } }, [me]],
                        uniqueID: [
                            getOverlayUniqueID,
                            [{ myApp: { newOverlayCounter: _ } }, [me]]
                        ],
                        // override default values provided by newOverlayInitAppData
                        showSolutionSet: false
                    },
                    [{ newOverlayInitAppData: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { maximizedOverlayExists: true },
            write: {
                onNewOverlayControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        resetMaximizedOverlay: {
                            to: [{ myApp: { maximizedOverlayUniqueID: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An auxiliary class inherited by buttons that create new overlays.
    // API: 
    // 1. newOverlayDataObj
    // 2. uponForAddingOverlay. default value is mouseClickEvent (see OverlayCopyAsExtOverlayControl where the default is overridden)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddNewOverlayControl: {
        "class": "GeneralArea",
        write: {
            onAddNewOverlayControlEvent: {
                "class": "OnMouseClick",
                true: {
                    incrementNewOverlayCounter: {
                        to: [{ myApp: { newOverlayCounter: _ } }, [me]],
                        merge: [plus, [{ myApp: { newOverlayCounter: _ } }, [me]], 1]
                    },
                    // the existence of the overlay is stored in crossViewOverlayData.
                    // the ordering is kept separately in reorderedOverlayUniqueID; still, we add the new overlays' dataObj
                    // to the overlayData appData per the same rule as the addition of its uniqueID to the ordering appData.
                    // the reason is that when we load a saved view, we first display the overlays that are included in
                    // its reorderedOverlayUniqueID, and then display all *other* overlays (essentially all overlays which
                    // were not yet in existence when that view was saved). it makes sense to display all those other overlays
                    // in the order in which they were added to the app, i.e. with the latest overlay added being on top.
                    addNewOverlayObj: {
                        to: [{ myApp: { crossViewOverlayData: _ } }, [me]],
                        merge: o(
                            [first, [{ myApp: { crossViewOverlayData: _ } }, [me]]],
                            // insert the new overlay's dataObj right after the base overlay!
                            [{ newOverlayDataObj: _ }, [me]],
                            [nextPlus,
                                [{ myApp: { crossViewOverlayData: _ } }, [me]],
                                [first, [{ myApp: { crossViewOverlayData: _ } }, [me]]]
                            ]
                        )
                    },
                    addNewOverlayUniqueIDInOrdering: {
                        to: [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]],
                        merge: o(
                            [first, [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]]],
                            // insert the new overlay's uniqueID right after the base overlay's
                            [
                                getOverlayUniqueID,
                                [{ myApp: { newOverlayCounter: _ } }, [me]]
                            ],
                            [nextPlus,
                                [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]],
                                [first, [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]]]
                            ]
                        )
                    },
                    scrollToTopOfMinimizedOverlaysDoc: { // so the user sees the new overlay created
                        to: [{ viewStaticPosOnDocCanvas: _ }, [areaOfClass, "MinimizedOverlaysView"]],
                        merge: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class is used to create a new OMF when a new overlay (both int and ext) is created
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    AddOMFacetHandler: {
        "class": o("GeneralArea"),
        context: {
            overlayUniqueID: [{ newOverlayDataObj: { uniqueID: _ } }, [me]],
            primaryOverlayUniqueID: [
                getOverlayUniqueID,
                fsAppConstants.primaryOverlayCounter
            ]
        },
        write: {
            onAddOMFacetHandlerMouseClick: {
                "class": "OnMouseClick",
                "true": {
                    pushInReorderedFacetUniqueID: {
                        to: [{ myApp: { reorderedFacetUniqueID: _ } }, [me]],
                        merge: o(
                            [cond,
                                [ // is the primaryOverlayUniqueID already in the ordering? it may not be there if noList=true, and the user has yet
                                    // to add a second overlay to the application. when they do, we want to make sure the new overlay is added, as well as 
                                    // the primaryOverlay's uniqueID, so that *both* would have an OMF representation
                                    [{ primaryOverlayUniqueID: _ }, [me]],
                                    [{ myApp: { reorderedFacetUniqueID: _ } }, [me]]
                                ],
                                o(
                                    {
                                        on: false,
                                        use: [{ primaryOverlayUniqueID: _ }, [me]]
                                    }
                                )
                            ],
                            [{ overlayUniqueID: _ }, [me]],
                            [{ myApp: { reorderedFacetUniqueID: _ } }, [me]]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the button for creating a new intensional overlay. it is inherited by a variant of AppControlPanelButton. it inherits NewOverlayControl.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewIntOverlayControl: {
        "class": o("NewOverlayControl"),
        context: {
            // NewOverlayControl param
            newOverlayInitAppData: [merge,
                {
                    name: [concatStr,
                        o(
                            fsAppConstants.newIntOverlayNamePrefix,
                            [{ myApp: { newOverlayCounter: _ } }, [me]]
                        )
                    ]
                },
                { nameWasEdited: [{ myApp: { newOverlayNameWasEdited: _ } }, [me]] },
                [{ myApp: { permIntOverlayInitAppData: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class represents the button for creating a new extensional overlay. it is inherited by a variant of AppControlPanelButton. it inherits NewOverlayControl.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewExtOverlayControl: {
        "class": o("NewOverlayControl"),
        context: {
            // NewOverlayControl param
            newOverlayInitAppData: [merge,
                {
                    name: [concatStr,
                        o(
                            fsAppConstants.newExtOverlayNamePrefix,
                            [{ myApp: { newOverlayCounter: _ } }, [me]]
                        )
                    ]
                },
                { nameWasEdited: [{ myApp: { newOverlayNameWasEdited: _ } }, [me]] },
                [{ myApp: { permExtOverlayInitAppData: _ } }, [me]]
            ]
        },
        write: {
            onNewExtOverlayControlMouseClick: {
                "class": "OnMouseClick",
                true: { // its OMF should be expanded
                    expandAssociatedOMF: {
                        to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
                        merge: o(
                            [{ newOverlayDataObj: { uniqueID: _ } }, [me]],
                            [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A placeholder
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreOptionsControl: {
        // nothing for now
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Application-level controls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Core
    /// This is the faceted-search application class, which encompasses the entire application. It stores plenty of appData information (more below).
    /// It inherits: 
    /// 1. App: to allow various embeddedStar areas, which all inherit GeneralArea, to access appData stored in this class via their myApp context label.
    /// 3. SortingController: to support the sorting by facets.
    /// 4. ItemDBController: to handle the merging of the external item db with the internal one.
    /// 5. ReorderableController: to support the reordering of overlays
    //
    // It embeds (Lean/Fat):
    // 1. AppFrame
    // 2. FrozenFacetViewPane/MovingFacetViewPane: the two viewing panes for facets - one whose facets cannot be scrolled (frozen), and one whose facets can be scrolled (moving)
    // 3. overlays: an areaSet of Overlays. initially these are the overlays defined by initOverlayData, but from that point on, the user may add new overlays.
    // 4. ZoomBoxingOverlaysView: the class over which the zoomBoxing overlays are displayed - needs to be embedded here and not anywhere deeper in teh embedding tree, as the design
    //    (Mon1, for example), positions the zoomboxing visible overlays outside the GlobalBaseItemSet.
    // 5. AppButtonsControlPanel (Fat only): a control panel of several application-level control buttons (see documentation there).
    //
    // Facet & Overlay Management: An important note on functional vs. appData.
    // When ordering these, we distinguish between the definition of the relevant universe, which is functional, and so gets updated automatically (for example
    // when changing the dataSource), and the sorting key, which is appData. the sortingKey can be partial, and can contain values that are irrelevant 
    // to the current universe being investigated (e.g. uniqueID of reordered facets from a dataSource explored previously). The [sort] function ensures
    // that such values are simply ignored, if they are not found in the data (that is the universe) it sorts.
    //
    // zoomBoxingOverlays:
    // This class stores the os of areaRefs of the overlays in the zoomBoxing state. It has two components: the zoomboxing overlays provided by the app (zoomBoxingOverlaysByApp), 
    // and those added to it by the user (zoomBoxingOverlaysByUser).
    // By having this information stored by the app, and not the overlays themselves, we are able to maintain the sequence in which overlays were added to the set of zoomBoxing overlays.
    // Note that the information provided per overlay is determined by the inheriting class. Mon0, for example, for a zoomBoxing overlay merely stores its areaRef. 
    // Mon1 stores an object of both the areaRef and the zoomBoxing mode (inclusive/exclusive).
    //
    // API:
    // 0. defaultFrozenFacetUniqueIDs / defaultMovingFacetUniqueIDs
    // 1. Inheriting area should also inherit AppSchema.
    // 2. ^crossViewOverlayData (overlayData that is cross-view): 
    //    an os used to create all overlays and to store their state 
    //    it is initialized to initOverlayData, which includes the definitions to application-defined overlays: 
    // 2.1 The primary overlay - a freebie intensional overlay, for the user's enjoyment.
    // 2.2 The favorites overlay: an extensional overlay in which the user can store their favorite items.
    // 2.3 The blacklist overlay: an externsional overlay in which the user can store the items they don't want included in their intensional overlays. 
    // 3. zoomBoxing: 
    // 3.1 zoomBoxingOverlays: As noted (see above), the constituent os may be a flat os (Mon0), or an os of objects (Mon1)
    // 3.1.1 zoomBoxingOverlaysByApp: the os describing the overlays that are the fixed part of the zoomBoxing frame. 
    // 3.1.2 zoomBoxingOverlaysByUser: the os describing the overlays that were moved to the zoomBoxing frame by the user.
    // 3.1.3 zoomBoxingOverlays: this is an os of areaRefs. inherting classes should perform a projection on zoomBoxingOverlaysByApp/zoomBoxingOverlaysByUser, if need be.
    // 3.2 visibleZoomBoxingOverlays: by default, excludes the GlobalBaseOverlay (Mon0 overrides this definition, to allow it to have a VisibleOverlay)
    // 4. AppSchema API
    // 5. overlay colors: 
    // 5.1 overlayCoreColors: an os of objects of the form { uniqueID:<>, color:<> }. 
    //     Values should be provided to the default overlays provided by the system (global base overlay, favorites, blacklist, and ephExt overlay - 
    //     using their bFSAppConstants uniqueIDs.
    //     In addition, overlayCoreColors should include overlayFormulaColors, an os of such objects, which includes the primaryOverlay, and the set of objects to be used for the
    //     first set of new overlays. Additional new overlays beyond that will calculate their value given their 'row' (their uniqueID divMod [size, overlayFormulaColors], i.e.
    //     division w/o remainder), and their 'column' (their uniqueID mod [size, overlayFormulaColors])
    //     Addditional new areas beyond this first set will calculate their color based on the colors of the first set.
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////   
    FSApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dataSourceSelected: true
            }
        },
        { // default
            "class": o("GeneralArea", "FSAppStrings", "App", "OverlayColorController", "TrackSaveViewController"),
            context: {
                companyName: "Mondria",
                productName: "Tenzing",
                oMFNameSamplingFunc: [defun,
                    o("fullName"),
                    [subStr, r(0, 0), "fullName"]
                ],

                noValueExpression: "__Mon__No__Value__", // something we won't find in actual db we process
                numericFormats: numericFormats,
                defaultNumberOfDigits: [
                    { numberOfDigits: _ },
                    [pos,
                        [{ numericConstants: { defaultNumericFormattingObjPos: _ } }, [globalDefaults]],
                        [{ numericFormats: _ }, [me]]
                    ]
                ],

                allowRecordIDAsItemUniqueID: [arg, "allowRecordIDAsItemUniqueID", false]
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            "class": o(
                "SortingController",
                "ItemDBController",
                "ReorderableOverlayController",
                "TrackOverlaysShowing",
                "TrackItemsShowing",
                "TrackNoLists"
            ),
            context: {
                showSavedViewDebug: false,//[arg, "debugSavedView", false],
                hackOverlayDiscreteValueAsAreaSet: true,//[arg, "overlayDiscreteValueAsAreaSet", true],
                jit: defaultJITFlag, //[arg, "jit", defaultJITFlag],
                debugFasterSolutionSetMembership: true, //[arg, "debugFasterSolutionSetMembership", true],

                enableZoomBoxing: [arg, "enableZoomBoxing", false],

                defaultInAreaDelay: fsAppConstants.defaultDelay, // override default value provided by App. 

                // beginning of facet-related context labels                                 
                facetCoreStates: o(
                    {
                        uniqueID: facetState.summary,
                        tooltipText: "Summary"
                    },
                    {
                        uniqueID: facetState.standard,
                        tooltipText: "Filter"
                    },
                    {
                        uniqueID: facetState.histogram,
                        tooltipText: "Histogram"
                    }
                ),

                nonTrashedOverlayData: [
                    { trashed: false },
                    [
                        n(
                            {
                                uniqueID: [
                                    getOverlayUniqueID,
                                    fsAppConstants.globalBaseOverlayCounter
                                ]
                            }
                        ), // exclude the global base overlay
                        [{ overlayData: _ }, [me]]
                    ]
                ],
                oMFWorthyOverlayUniqueID: [cond, // if we have but a single overlay, there is no need to represent it as an OMF.
                    o(
                        [greaterThan,
                            [size, [{ nonTrashedOverlayData: _ }, [me]]],
                            1
                        ],
                        [not, [{ noLists: _ }, [me]]] // if the noLists flag is set to false, that means there is a Favorites overlay
                    ),
                    o(
                        {
                            on: true,
                            use: [{ nonTrashedOverlayData: { uniqueID: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: o()
                        }
                    )
                ],
                oMFData: [map,
                    [defun,
                        o("uID"),
                        {
                            uniqueID: "uID",
                            name: [
                                {
                                    uniqueID: "uID",
                                    name: _
                                },
                                [areaOfClass, "PermOverlay"]
                            ],
                            oMF: true
                        }
                    ],
                    [{ oMFWorthyOverlayUniqueID: _ }, [me]]
                ],

                coreFacetData: o(
                    compileOMF ? [{ oMFData: _ }, [me]] : o(), // cross-view data
                    compileUDF ? [{ uDFData: _ }, [areaOfClass, "UDFController"]] : o(), // cross-view data - see the sibling UDFController class
                    [{ dataSourceFacetData: _ }, [me]] // data-source-specific data
                ),
                coreFacetDataUniqueID: [{ coreFacetData: { uniqueID: _ } }, [me]],

                facetMetaData: [map, // take coreFacetData
                    [defun,
                        o("facetObj"),
                        [using,
                            // beginning of 'using' section
                            // facetQuery is a function which is used to construct a facet-specific projection query or selection query
                            // this appears here, as these queries will be used by an associated SelectableFacetXIntOverlay even if the associated facet
                            // is not in view, and therefore has no Facet area associated with it.
                            "facetQuery",
                            [
                                [
                                    defun, o("attr"),
                                    [
                                        defun, o("what"),
                                        { "#attr": "what" }
                                    ]
                                ],
                                [{ uniqueID: _ }, "facetObj"]
                            ],
                            "facetProjectionQuery",
                            // facetProjectionQuery uses the facetQuery function, and provides it with the "_" as input, to form a projection
                            // query, i.e. { <myFacetUniqueID>:_ }
                            [
                                "facetQuery",
                                _
                            ],
                            "uniqueValuesOverflow",
                            [and,
                                [{ type: o("string", "mixed") }, "facetObj"],
                                [not, [{ uniqueValues: _ }, "facetObj"]]
                            ],
                            /*, refine the definition of uniqueValuesOverflow to be an or of existing def and this?:
                                [and,
                                    [{ type: "number" } }, "facetObj"],
                                    [greaterThan,
                                    [div,
                                    < number of unique values> - awaiting this parameter to be added to dataObj!
                                    [totalNumOfValues - numOfUndefinedValues]
                                    ]
                                    threshold of 0.99 or so.
                                    ]
                                ] */
                            "aSingleValueFacet",
                            [and,
                                [equal, [{ typeCount: { nrUnique: _ } }, "facetObj"], 1],
                                [{ typeCount: { undefined: 0 } }, "facetObj"]
                            ],
                            // end of 'using' section
                            // the function itself:
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                facetQuery: "facetQuery",
                                facetProjectionQuery: "facetProjectionQuery",
                                facetSelectionQueryFunc: "facetQuery",

                                uniqueValuesOverflow: "uniqueValuesOverflow",
                                aSingleValueFacet: "aSingleValueFacet"
                            }
                        ]
                    ],
                    [{ coreFacetData: _ }, [me]]
                ],

                // the construction of a full facet data object:
                // we start out with the coreFacetData which is made up of the dataSourceFacetData (the configuration file for a PreLoadedApp), 
                // and the uDFData (which is cross-view PAD defined by the user), and the oMFData (functionally calculated based on the user-defined intensional
                // overlays)
                // from this we calculate the defaultDataType (note: data type, not facet type!): if it is defined in the configuration file, that takes precedence
                // otherwise, it is derived from an analysis of this facet's projected values in the database.
                // the actual dataType is the defaultDataType, unless the user specifies their preference, which is a PAD that obviously takes precedence.
                // with the actual dataType in hand, we can calculate the defaultFacetType (note: facet type!). once again, if the configuration file happens
                // to specify a defaultFacetType, we respect that, otherwise, we calculate a value.
                // finally, the user may override the defaultFacetType with their PAD for a facetType.
                // note the iterative process below by which we obtain this merged object, using mergeWrite twice, once to allow the user to specify the dataType
                // and a second time to allow the user to specify the facetType. they cannot be done in one iteration, as the defaultFacetType depends on the
                // *actual* dataType, and the facetType obviously depends on the defaultFacetType.
                facetDataForDefaultDataType: [map, // take coreFacetData, and calculate a bunch of attributes based on it, including defaultDataType and numericFacet
                    [defun,
                        o("facetObj"),
                        [using,
                            // beginning of 'using' section

                            // note the distinction between 
                            // 1) numericFacet: true - this facet has numeric values in the database
                            // 2) dataType: fsAppConstants.dataTypeNumberLabel - the dataType is NUMBER (which means it is necessarily a numericFacet)
                            // importantly, the user may choose to define a numericFacet as a STRING dataType (e.g. if the number is some sort of ID, for example)
                            "dataTypeByTypeCount", // an analysis of dataType based on typeCount.
                            [cond,
                                [greaterThanOrEqual,
                                    [{ typeCount: { nrUniqueValuesPerType: { string: _ } } }, "facetObj"],
                                    fsAppConstants.thresholdNrUniqueStringValuesForStringDataType
                                ],
                                o(
                                    {
                                        on: true,
                                        use: "stringFacet"
                                    },
                                    {
                                        on: false,
                                        use: [cond,
                                            [{ type: "date" }, "facetObj"],
                                            o(
                                                {
                                                    on: true,
                                                    use: "dateFacet"
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        [greaterThanOrEqual,
                                                            [{ typeCount: { nrUniqueValuesPerType: { number: _ } } }, "facetObj"],
                                                            [{ typeCount: { nrUniqueValuesPerType: { string: _ } } }, "facetObj"]
                                                        ],
                                                        o(
                                                            { on: true, use: "numericFacet" },
                                                            { on: true, use: "stringFacet" }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ],
                            "defaultDataType",
                            [cond,
                                [{ defaultDataType: _ }, "facetObj"],
                                o(
                                    { // if facetObj specifies a value (from dataConfig in the configuration file), use it
                                        on: true,
                                        use: [{ defaultDataType: _ }, "facetObj"],
                                    },
                                    { // otherwise, calculate based on the data
                                        on: false,
                                        use: [cond,
                                            [equal, "dataTypeByTypeCount", "dateFacet"],
                                            o(
                                                {
                                                    on: true,
                                                    use: fsAppConstants.dataTypeDateLabel
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        o(
                                                            [equal, "dataTypeByTypeCount", "numericFacet"],
                                                            [{ uDF: _ }, "facetObj"]
                                                        ),
                                                        o(
                                                            {
                                                                on: true,
                                                                use: fsAppConstants.dataTypeNumberLabel
                                                            },
                                                            {
                                                                on: false,
                                                                use: [cond,
                                                                    [{ oMF: _ }, "facetObj"],
                                                                    o(
                                                                        { on: false, use: fsAppConstants.dataTypeStringLabel }, // i.e. a "stringFacet"
                                                                        { on: true, use: fsAppConstants.dataTypeBooleanLabel }
                                                                    )
                                                                ]
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ],
                            // end of 'using' section
                            // the function itself:
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                dataTypeByTypeCount: "dataTypeByTypeCount",
                                numericFacet: [equal, "dataTypeByTypeCount", "numericFacet"],
                                defaultDataType: "defaultDataType",
                                dataType: "defaultDataType" // may be overridden by the mergeWrite that defines facetDataForDataType!
                            }
                        ]
                    ],
                    [{ coreFacetData: _ }, [me]]
                ],

                facetDataForExpansionState: [map,
                    [defun,
                        o("facetObj"),
                        [merge,
                            [cond,
                                [
                                    [{ uniqueID: _ }, "facetObj"],
                                    [{ myApp: { expandedFrozenFacetUniqueIDs: _ } }, [me]]
                                ],
                                o(
                                    {
                                        on: true,
                                        use: {
                                            myPane: [areaOfClass, "FrozenFacetViewPane"],
                                            expanded: true,
                                            ofFrozenPane: true
                                        }
                                    },
                                    {
                                        on: false,
                                        use: [cond,
                                            [
                                                [{ uniqueID: _ }, "facetObj"],
                                                [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                                            ],
                                            o(
                                                {
                                                    on: true,
                                                    use: {
                                                        myPane: [areaOfClass, "MovingFacetViewPane"],
                                                        expanded: true,
                                                        ofMovingPane: true
                                                    }
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        [{ trashed: _ }, "facetObj"],
                                                        o(
                                                            {
                                                                on: false,
                                                                use: {
                                                                    myPane: [areaOfClass, "MinimizedFacetsView"],
                                                                    minimized: true
                                                                }
                                                            },
                                                            {
                                                                on: true,
                                                                use: {
                                                                    myPane: [areaOfClass, "TrashTabView"]
                                                                    // trashed: already defined!
                                                                }
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ],
                            { uniqueID: [{ uniqueID: _ }, "facetObj"] }
                        ]
                    ],
                    [{ facetDataForDataType: _ }, [me]] // this os is defined as a [mergeWrite] on crossViewCoreFacetData, thus the trashed PAD is accessible]
                ],

                facetDataForDefaultFacetType: [map,
                    [defun,
                        o("facetObj"),
                        [using,
                            // beginning of using
                            "facetObjUniqueID",
                            [{ uniqueID: _ }, "facetObj"],
                            "dataType",
                            [{ dataType: _ }, "facetObj"],
                            "uDF",
                            [ // is this a uDF?
                                "facetObjUniqueID",
                                [{ myApp: { uDFData: { uniqueID: _ } } }, [me]]
                            ],
                            "nrUnique",
                            [{ typeCount: { nrUnique: _ } }, "facetObj"],
                            "coreFacetObj",
                            [
                                { uniqueID: "facetObjUniqueID" },
                                [{ coreFacetData: _ }, [me]]
                            ],
                            "coreFacetType", // the facetType specified in the coreFacetData (includes the configuration file), if any.
                            [{ facetType: _ }, "coreFacetObj"],
                            "guessedOrderingOfNumericalFacetTypes",
                            o(
                                // place the "coreFacetType" (it may not exist)
                                "coreFacetType",
                                [ // then all others from defaultOrderingOfNumericalFacetTypes
                                    n("coreFacetType"),
                                    o("SliderFacet", "MSFacet", "ItemValues", "RatingFacet") // defaultOrderingOfNumericalFacetTypes
                                ]
                            ),
                            "possibleFacetTypes",
                            [cond,
                                "dataType",
                                o(
                                    {
                                        on: fsAppConstants.dataTypeNumberLabel,
                                        use: [cond,
                                            [{ aSingleValueFacet: _ }, "facetObj"],
                                            o(
                                                {
                                                    on: true,
                                                    use: "ItemValues"
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        [greaterThan, "nrUnique", fsAppConstants.maxNrUniqueValuesForDiscreteFacet],
                                                        o(
                                                            {
                                                                on: false,
                                                                use: "guessedOrderingOfNumericalFacetTypes"
                                                            },
                                                            {
                                                                on: true,
                                                                use: [ // if there are more than maxNrUniqueValuesForDiscreteFacet uniqueValues, this 
                                                                    // can't be an MSFacet or a RatingFacet
                                                                    n("MSFacet", "RatingFacet"),
                                                                    "guessedOrderingOfNumericalFacetTypes"
                                                                ]
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    },
                                    {
                                        on: fsAppConstants.dataTypeStringLabel,
                                        use: [cond,
                                            [{ aSingleValueFacet: _ }, "facetObj"],
                                            o(
                                                {
                                                    on: true,
                                                    use: "ItemValues"
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        // if there are more than thresholdNrUniqueValuesForItemValuesFacet uniqueValues
                                                        // then the first option should be ItemValues. MSFacet should be allowed
                                                        // if it is < maxNrUniqueValuesForDiscreteFacet
                                                        // if there are less than thresholdNrUniqueValuesForItemValuesFacet, then MSFacet is in fact
                                                        // the first option
                                                        [greaterThan, "nrUnique", fsAppConstants.thresholdNrUniqueValuesForItemValuesFacet],
                                                        o(
                                                            {
                                                                on: true,
                                                                use: [cond,
                                                                    [greaterThan, "nrUnique", fsAppConstants.maxNrUniqueValuesForDiscreteFacet],
                                                                    o(
                                                                        {
                                                                            on: false,
                                                                            use: o("ItemValues", "MSFacet")
                                                                        },
                                                                        {
                                                                            on: true,
                                                                            use: "ItemValues"
                                                                        }
                                                                    )
                                                                ]
                                                            },
                                                            {
                                                                on: false,
                                                                use: o("MSFacet", "ItemValues")
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    },
                                    {
                                        on: fsAppConstants.dataTypeDateLabel,
                                        use: "DateFacet"
                                    }
                                )
                            ],
                            "defaultFacetType",
                            [cond,
                                [{ uniqueValuesOverflow: _ }, "facetObj"],
                                o(
                                    { on: true, use: "ItemValues" },
                                    // note: if aSingleValueFacet is true, possibleFacetTypes will have a single value, "ItemValues" 
                                    { on: false, use: [first, "possibleFacetTypes"] }
                                )
                            ],

                            // end of using
                            // the object returned by the map:
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                possibleFacetTypes: "possibleFacetTypes",
                                defaultFacetType: "defaultFacetType",
                                facetType: [cond, // may be overridden by the mergeWrite that defines facetData!
                                    [{ uDF: _ }, "facetObj"],
                                    // we do not define the facetType for UDFs - thus allowing UDFFacetType to shine through.
                                    // the reason is that their calculation of the facetType can't rely on the nrUnique calculation above, 
                                    // as [datatable] doesn't work on UDFs, only on organic facets, and so they don't have a typeCount object
                                    o({ on: false, use: "defaultFacetType" })
                                ]
                            }
                        ]
                    ],
                    [{ facetDataForDataType: _ }, [me]]
                ],

                "*facetNPADData": o(),
                "^crossViewFacetData": o(), // this should be added as an attribute in ^crossView, which has a facetData and an overlayData attribute
                crossViewCoreFacetData: [
                    { uniqueID: [{ coreFacetDataUniqueID: _ }, [me]] },
                    [{ crossViewFacetData: _ }, [me]]
                ],

                currentViewCoreFacetData: [ // select out of currentView's facetData only those that appear in coreFacetData
                    { uniqueID: [{ coreFacetDataUniqueID: _ }, [me]] },
                    [{ currentView: { facetData: _ } }, [me]]
                ],

                facetDataForDataType: [mergeWrite,
                    // a given PAD attribute will be *either* stored in the currentView or in the crossView, but not in both!
                    [identify, { uniqueID: _ }, [{ crossViewCoreFacetData: _ }, [me]]],
                    // the remaining parameters that follow are all to be merged to constitute the default os of objects of the mergeWrite
                    [identify, { uniqueID: _ }, [{ currentViewCoreFacetData: _ }, [me]]],
                    // the facetDataForDefaultDataType is the lowest priority. this ensures that if coreFacetData defines some attribute (e.g defaultFacetType),
                    // it will take precedence over the facetDataForDefaultDataType backup value
                    [identify, { uniqueID: _ }, [{ coreFacetData: _ }, [me]]],
                    [identify, { uniqueID: _ }, [{ facetDataForDefaultDataType: _ }, [me]]]
                ],

                facetDataForFacetType: [mergeWrite,
                    [identify, { uniqueID: _ }, [{ crossViewCoreFacetData: _ }, [me]]],
                    // the remaining parameters that follow are all to be merged to constitute the default os of objects of the mergeWrite
                    [identify, { uniqueID: _ }, [{ facetDataForExpansionState: _ }, [me]]],
                    [identify, { uniqueID: _ }, [{ facetDataForDefaultFacetType: _ }, [me]]],
                    [identify, { uniqueID: _ }, [{ facetDataForDataType: _ }, [me]]]
                ],

                facetData: [{ facetDataForFacetType: _ }, [me]],

                nonTrashedFacetData: [
                    { trashed: false },
                    [{ facetData: _ }, [me]]
                ],

                nonTrashedNumberDataTypeFacetData: [
                    { dataType: fsAppConstants.dataTypeNumberLabel },
                    [{ nonTrashedFacetData: _ }, [me]]
                ],
                nonTrashedStringDataTypeFacetData: [
                    { dataType: fsAppConstants.dataTypeStringLabel },
                    [{ nonTrashedFacetData: _ }, [me]]
                ],
                nonTrashedDateDataTypeFacetData: [
                    { dataType: fsAppConstants.dataTypeDateLabel },
                    [{ nonTrashedFacetData: _ }, [me]]
                ],

                nonTrashedNumberOrDateDataTypeFacetData: o(
                    [{ nonTrashedNumberDataTypeFacetData: _ }, [me]],
                    [{ nonTrashedDateDataTypeFacetData: _ }, [me]]
                ),

                facetTagsData: [map,
                    [defun,
                        o("facetObj"),
                        [using,
                            // start of using
                            "facetTypeSpecificTags",
                            [cond,
                                [{ oMF: _ }, "facetObj"],
                                o(
                                    {
                                        on: true,
                                        // once tags are converted to be portable across languages, they should be made up of an object with a uniqueID (language-independent), and
                                        // a displayValue (language-specific). at that point, we should change the definitions of facetTypeSpecificTags below
                                        use: [concatStr,
                                            o(
                                                [{ myApp: { overlayEntityStr: _ } }, [me]],
                                                " ",
                                                [{ myApp: { facetEntityStr: _ } }, [me]]
                                            )
                                        ]
                                    },
                                    {
                                        on: false,
                                        use: o(
                                            [cond,
                                                [{ facetType: _ }, "facetObj"],
                                                o(
                                                    {
                                                        on: "SliderFacet",
                                                        use: [{ myApp: { sliderEntityStr: _ } }, [me]]
                                                    },
                                                    {
                                                        on: "MSFacet",
                                                        use: [{ myApp: { msEntityStr: _ } }, [me]]
                                                    },
                                                    {
                                                        on: "RatingFacet",
                                                        use: [{ myApp: { ratingEntityStr: _ } }, [me]]
                                                    }
                                                )
                                            ],
                                            [cond,
                                                [{ uDF: _ }, "facetObj"],
                                                o(
                                                    {
                                                        on: true,
                                                        use: [{ myApp: { formulaEntityStr: _ } }, [me]]
                                                    }
                                                )
                                            ]
                                        )
                                    }
                                )
                            ],
                            "facetsDefiningIntOverlayTags",
                            [
                                { name: _ },
                                [
                                    [ // get all (intentional) overlays who have meaningful selections for this facet
                                        {
                                            myOverlay: _,
                                            uniqueID: [{ uniqueID: _ }, "facetObj"],
                                            selectionsMade: true
                                        },
                                        [areaOfClass, "SelectableFacetXIntOverlay"]
                                    ],
                                    // select them out of permOverlays, and that way we ensure they appear in the ordering kept by permOverlays.
                                    [{ myApp: { permOverlays: _ } }, [me]]
                                ]
                            ],
                            "preloadedTags",
                            [{ tags: _ }, "facetObj"],
                            "userAssignedTags",
                            [{ userAssignedTags: _ }, "facetObj"],
                            "tags",
                            [_,
                                o(
                                    "preloadedTags",
                                    "userAssignedTags",
                                    "facetTypeSpecificTags", // see OMF, for example
                                    "facetsDefiningIntOverlayTags"
                                )
                            ],
                            // end of using
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                name: [{ name: _ }, "facetObj"], // passed on to facetMatchTagsAndSearchData, which uses it
                                // appTags: beginning
                                facetTypeSpecificTags: "facetTypeSpecificTags",
                                facetsDefiningIntOverlayTags: "facetsDefiningIntOverlayTags",
                                // appTags: end
                                preloadedTags: "preloadedTags",
                                tags: "tags"
                            }
                        ]
                    ],
                    [{ facetData: _ }, [me]]
                ],

                facetMatchTagsAndSearchData: [map,
                    [defun,
                        o("facetObj"),
                        [using,
                            // start of using
                            "tags",
                            [{ tags: _ }, "facetObj"],
                            "includedTagsInApp",
                            [{ includedTags: _ }, [areaOfClass, "FacetTagsController"]],
                            "excludedTagsInApp",
                            [{ excludedTags: _ }, [areaOfClass, "FacetTagsController"]],
                            "matchTags",
                            [and,
                                [not,
                                    [
                                        "tags",
                                        "excludedTagsInApp"
                                    ]
                                ],
                                o(
                                    [not, "includedTagsInApp"], // if there are no included tags, then they're - in a void kind of way - matched.
                                    [cond,
                                        [{ interpretationOfMultipleTagsSelected: _ }, [me]],
                                        o(
                                            {
                                                on: "and",
                                                use: [not, // if there are no selected tags which do not appear in the facet's tags, that means there's a full match.
                                                    [ // select those selected tags which are not in the facet's tags. 
                                                        n("tags"),
                                                        "includedTagsInApp"
                                                    ]
                                                ]
                                            },
                                            {
                                                on: "or",
                                                use: [
                                                    "tags",
                                                    "includedTagsInApp"
                                                ]
                                            }
                                        )
                                    ]
                                )
                            ],
                            "matchSearchStr",
                            [
                                s([{ currentSearchStr: _ }, [areaOfClass, "MinimizedFacetViewPaneSearchBox"]]),
                                [{ name: _ }, "facetObj"]
                            ],
                            // end of using
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                matchSearchStr: "matchSearchStr",
                                matchTags: compileTags ? "matchTags" : true,
                                matchTagsAndSearchStr: [and,
                                    "matchSearchStr",
                                    "matchTags"
                                ]
                            }
                        ]
                    ],
                    [{ facetTagsData: _ }, [me]]
                ],

                inputForFacetDAtaCandidateMinimizedCreation: o( // the data for the selection-projection
                    [ // the non-UDFs
                        { uDF: false },
                        [{ facetData: _ }, [me]]
                    ],
                    [filter, // UDFs that are onDataSource - to obtain those, we need to filter by the onDataSource attribute calculated in the UDFClipper
                        [defun,
                            o("uDFDataObj"),
                            [
                                {
                                    onDataSource: _,
                                    uniqueID: [{ uniqueID: _ }, "uDFDataObj"]
                                },
                                [areaOfClass, "UDFacetClipper"]
                            ]
                        ],
                        [ // the data for the map - the subset of facetData that related to UDFs
                            { uDF: true },
                            [{ facetData: _ }, [me]]
                        ]
                    ]
                ),

                facetDataCandidateMinimizedCreation: [sort,
                    [
                        { // the selection-projection
                            minimized: true,
                            uniqueID: [
                                {
                                    uniqueID: _,
                                    matchTagsAndSearchStr: true
                                },
                                [{ facetMatchTagsAndSearchData: _ }, [me]]
                            ]
                        },
                        [{ inputForFacetDAtaCandidateMinimizedCreation: _ }, [me]]
                    ],
                    { uniqueID: [{ reorderedFacetDataUniqueID: _ }, [me]] }
                ],

                facetDataForFacetCreation: [map,
                    [defun,
                        o("facetObj"),
                        [using,
                            // using - beginning
                            "iAmDraggedToReorder",
                            [
                                {
                                    uniqueID: [{ uniqueID: _ }, "facetObj"],
                                    iAmDraggedToReorder: _
                                },
                                [{ facetNPADData: _ }, [me]]
                            ],
                            // using - End
                            {
                                uniqueID: [{ uniqueID: _ }, "facetObj"],
                                create: o(
                                    // three options for creating a FacetClipper: 
                                    // 1. an ExpandedFacet, 
                                    // 2. a MinimizedFacet that's in view, 
                                    // 3. a FacetClipper that's in the process of being dragged
                                    [{ expanded: _ }, "facetObj"],
                                    [and,
                                        [not, [{ horizontallyMinimized: _ }, [areaOfClass, "MinimizedFacetViewPane"]]],
                                        [{ minimized: _ }, "facetObj"],
                                        [ // a hack till the Matrix can tell me which cells are to be in view:
                                            [index, [{ facetDataCandidateMinimizedCreation: _ }, [me]], "facetObj"],
                                            r(
                                                [{ indexOfFirstCellToBeCreated: _ }, [areaOfClass, "MinimizedFacetsView"]],
                                                [{ indexOfLastCellToBeCreated: _ }, [areaOfClass, "MinimizedFacetsView"]]
                                            )
                                        ]
                                    ],
                                    "iAmDraggedToReorder"
                                )
                            }
                        ]
                    ],
                    [{ facetData: _ }, [me]]
                ],

                // create an os of objects that calculate the facet-specific 'create' attribute, used to determine whether to create a FacetClipper/Facet

                //facetDataUniqueID: [{ facetData: { uniqueID: _ } }, [me]],
                facetDataUniqueID: [sort,
                    [{ facetData: { uniqueID: _ } }, [me]],
                    [{ coreFacetDataUniqueID: _ }, [me]]
                ],

                reorderedFacetUniqueID: [mergeWrite,
                    [{ currentView: { reorderedFacetUniqueID: _ } }, [me]],
                    [{ facetDataUniqueID: _ }, [me]]
                ],
                reorderedFacetDataUniqueID: [sort, // see note above "Facet & Overlay Management: An important note on functional vs. appData." 
                    [{ facetDataUniqueID: _ }, [me]],
                    [{ reorderedFacetUniqueID: _ }, [me]]
                ],

                facetToBeCreatedUniqueIDs: [
                    {
                        create: true,
                        uniqueID: _
                    },
                    [{ facetDataForFacetCreation: _ }, [me]]
                ],
                facetClipperData: [identify,
                    _,
                    o(
                        // UDFClippers are always created - see note there (the recursive definition of definingFacets in UDFClipper precludes the use of [map]
                        // in the same way we do for other FacetClippers, to obtain an os of data objects. instead, we need to work with areas
                        [{ uDFData: { uniqueID: _ } }, [me]],
                        [{ facetToBeCreatedUniqueIDs: _ }, [me]]
                    )
                ],

                facets: o( // note: these are only those facets for which areas are created!
                    [{ children: { facetClippers: { children: { expandedFacet: _ } } } }, [me]],
                    [{ children: { facetClippers: { children: { minimizedFacet: _ } } } }, [me]]
                ),

                uDFClippers: [
                    { uniqueID: [{ uDFData: { uniqueID: _ } }, [me]] },
                    [{ children: { facetClippers: _ } }, [me]]
                ],

                properDefinitionFacetData: [map,
                    [defun,
                        o("facetObj"),
                        [using,
                            "facetObjUniqueID",
                            [{ uniqueID: _ }, "facetObj"],
                            // note: we read values from the uDFClippers into this map!
                            // the uDFClippers areas exist throughout. this allows the value of properDefinition to be accessed from the dataObj
                            // and not from the FacetClipper (which, a courtesy reminder, exists for non-UDF, only when the facet is showing)                            
                            // start using
                            "properDefinition",
                            [cond,
                                [
                                    "facetObjUniqueID",
                                    [{ uDFData: { uniqueID: _ } }, [me]]
                                ],
                                o(
                                    {
                                        on: true,
                                        use: [
                                            {
                                                uniqueID: "facetObjUniqueID",
                                                properDefinition: _
                                            },
                                            [{ uDFClippers: _ }, [me]]
                                        ]
                                    },
                                    { // a non-UDF facet is properly defined merely by being non-trashed
                                        on: false,
                                        use: [not, [{ trashed: _ }, "facetObj"]]
                                    }
                                )
                            ],
                            // end using
                            {
                                uniqueID: "facetObjUniqueID",
                                properDefinition: "properDefinition"
                            }
                        ]
                    ],
                    [{ facetData: _ }, [me]]
                ],

                numericOrDateDataTypeFacetData: [map,
                    [defun,
                        o("facetObjUniqueID"),
                        [using,
                            // beginning of using
                            "facetObj",
                            [
                                { uniqueID: "facetObjUniqueID" },
                                [{ facetData: _ }, [me]]
                            ],
                            "name",
                            [{ name: _ }, "facetObj"],
                            // end of using
                            {
                                uniqueID: "facetObjUniqueID",
                                name: "name",
                                calculatorRefVal: "facetObjUniqueID",
                                calculatorRefName: "name",
                                trashed: [{ trashed: _ }, "facetObj"] // not sure it's needed here..
                            }
                        ]
                    ],
                    [ // data for the map: select out of reorderedFacetDataUniqueID:
                        // 1. the uniqueIDs of the non-UDf, non-trashed, that have a numeric dataType
                        // 2. the uniqueIDs of the UDFs, non-trashed, that are properly defined
                        o(
                            [
                                {
                                    uDF: false,
                                    uniqueID: _
                                },
                                [{ nonTrashedNumberOrDateDataTypeFacetData: _ }, [me]]
                            ],
                            [{ uDFClippers: { uniqueID: _ } }, [me]]
                        ),
                        [{ reorderedFacetDataUniqueID: _ }, [me]]
                    ]
                ],

                referenceableNumericOrDateDataTypeFacetData: [
                    {
                        uniqueID: [ // select all those objects whose uniqueID has a properDefinition: True in properDefinitionFacetData
                            {
                                uniqueID: _,
                                properDefinition: true
                            },
                            [{ properDefinitionFacetData: _ }, [me]]
                        ]
                    },
                    [{ numericOrDateDataTypeFacetData: _ }, [me]]
                ],

                "^trashedOrderFacetUniqueID": o(),
                // trashed facetss are ordered in the order of trashing: last trashed is first.
                trashedFacets: [sort,
                    [{ children: { facetClippers: { children: { trashedFacet: _ } } } }, [me]],
                    { uniqueID: [{ trashedOrderFacetUniqueID: _ }, [me]] } // sortKey
                ],

                aUDFBeingEdited: [{ displayUDFFormulaPanel: _ }, [areaOfClass, "UDFacet"]],
                ///////////////////////////////////////////////////////////////////////////////////////////////
                // Beginning of section: the initialization of appData used by Facets to determine their myPane, and cosequently their 'minimized' value
                ///////////////////////////////////////////////////////////////////////////////////////////////

                // create os of uniqueIDs of different types of facets. because we do so from the Facets, which are ordered per
                // reorderedFacetUniqueID, these os are also ordered.

                OMFFacetUniqueID: [
                    {
                        facetType: "OMF",
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],
                sliderFacetUniqueID: [
                    {
                        facetType: "SliderFacet",
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],
                msFacetUniqueID: [
                    {
                        facetType: "MSFacet",
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],
                msOrSliderFacetUniqueID: [
                    {
                        facetType: o("SliderFacet", "MSFacet"),
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],
                ratingFacetUniqueID: [
                    {
                        facetType: "RatingFacet",
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],
                writableFacetUniqueID: [
                    {
                        writable: true,
                        uniqueID: _
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],

                defaultNumFrozenFacets: defaultNumFrozenFacets,  // this is a js variable defined above!
                numFrozenFacets: [mergeWrite,
                    [{ currentView: { numFrozenFacets: _ } }, [me]],
                    [{ defaultNumFrozenFacets: _ }, [me]]
                ],
                defaultFrozenFacetUniqueIDs: [
                    pos,
                    r(0, [minus, [{ numFrozenFacets: _ }, [me]], 1]),
                    [
                        { uniqueID: _ },
                        [{ dataSourceFacetData: _ }, [me]]
                    ]
                ],

                possibleDefaultMovingFacetsData: [
                    { // exclude from the list of possible moving facets on load those which are ItemValues, and those which are intended for the frozen pane 
                        facetType: n("ItemValues"),
                        uniqueID: n([{ defaultFrozenFacetUniqueIDs: _ }, [me]])
                    },
                    [{ dataSourceFacetData: _ }, [me]]
                ],

                maxNumDefaultMovingFacets: [max, 1, [arg, "maxInitialNumFacetsExpanded", defaultInitialNumFacetsExpanded]],

                // we want to have at least one Slider and at least one MS facets expanded, by default (unless otherwise specified by a PreLoadedApp, 
                // for example; also assuming that both types are actually represented in the data!).
                // Assuming we want n expanded facets on load, we take the (n-1) first ones of each type, and then select those sets out of the 
                // possibleDefaultMovingFacetUniqueIDs (which represent the csv's original ordering)
                // if both types are represented in the data, then this ensures that when we pick n elements out of them, we get at least one of each type
                // (what we call: the reverse pigeon-hole principle) - these are guaranteed to be represented on load in the moving facet pane.
                // if both types aren't represented then we should be one facet short (to meet the maxNumDefaultMovingFacets requirement). we simply
                // append to the guaranteed facets those not guaranteed, and now select the first maxNumDefaultMovingFacets elements. if the guaranteed ones
                // aren't enough (i.e. we're completely missing one of the two types of facets), we will simply pick the next facet of the type that does exist.
                maxNumDefaultMovingFacetsMinusOne: [max, 1, [minus, [{ maxNumDefaultMovingFacets: _ }, [me]], 1]],
                guaranteedSliderInDefaultMovingFacetUniqueIDs: [pos,
                    r(0, [minus, [{ maxNumDefaultMovingFacetsMinusOne: _ }, [me]], 1]),
                    [{ sliderFacetUniqueID: _ }, [me]]
                ],
                guaranteedMSInDefaultMovingFacetUniqueIDs: [pos,
                    r(0, [minus, [{ maxNumDefaultMovingFacetsMinusOne: _ }, [me]], 1]),
                    [{ msFacetUniqueID: _ }, [me]]
                ],
                possibleDefaultMovingFacetUniqueIDs: [{ possibleDefaultMovingFacetsData: { uniqueID: _ } }, [me]],
                guaranteedSliderOrMSInDefaultMovingFacetUniqueIDs: [pos,
                    r(0, [minus, [{ maxNumDefaultMovingFacets: _ }, [me]], 1]),
                    [
                        o(
                            [{ guaranteedSliderInDefaultMovingFacetUniqueIDs: _ }, [me]],
                            [{ guaranteedMSInDefaultMovingFacetUniqueIDs: _ }, [me]]
                        ),
                        [{ possibleDefaultMovingFacetUniqueIDs: _ }, [me]]
                    ]
                ],
                notGuaranteedInDefaultMovingFacetUniqueIDs: [
                    n([{ guaranteedSliderOrMSInDefaultMovingFacetUniqueIDs: _ }, [me]]),
                    [{ possibleDefaultMovingFacetUniqueIDs: _ }, [me]]
                ],

                selectedDefaultMovingFacetUniqueIDs: [pos,
                    r(0, [minus, [{ maxNumDefaultMovingFacets: _ }, [me]], 1]),
                    o(
                        [{ guaranteedSliderOrMSInDefaultMovingFacetUniqueIDs: _ }, [me]],
                        [{ notGuaranteedInDefaultMovingFacetUniqueIDs: _ }, [me]]
                    )
                ],

                limitExpandedFacetsType: [arg, "limitExpandedFacetsType", defaultExpandedFacetsType],
                defaultMovingFacetUniqueIDs: [cond,
                    [greaterThan,
                        [{ maxNumDefaultMovingFacets: _ }, [me]],
                        0
                    ],
                    o(
                        {
                            on: true,
                            use: [pos,
                                r(
                                    0,
                                    [minus, [{ maxNumDefaultMovingFacets: _ }, [me]], 1]
                                ),
                                [cond,
                                    [{ limitExpandedFacetsType: _ }, [me]],
                                    o(
                                        {
                                            on: "OMF",
                                            use: [{ OMFFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: "Slider",
                                            use: [{ sliderFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: "MS",
                                            use: [{ msFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: "SliderOrMS",
                                            use: [{ msOrSliderFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: "Rating",
                                            use: [{ ratingFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: "Writable",
                                            use: [{ writableFacetUniqueID: _ }, [me]]
                                        },
                                        {
                                            on: null,
                                            use: [{ selectedDefaultMovingFacetUniqueIDs: _ }, [me]]
                                        }
                                    )
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: o()
                        }
                    )
                ],

                expandedMovingFacetUniqueIDs: [{ reorderedFacetInPaneUniqueIDs: _ }, [areaOfClass, "MovingFacetViewPane"]],
                expandedFrozenFacetUniqueIDs: [{ reorderedFacetInPaneUniqueIDs: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                ///////////////////////////////////////////////////////////////////////////////////////////////
                // End of section: the initialization of appData used by Facets to determine their myPane, and cosequently their 'minimized' value
                ///////////////////////////////////////////////////////////////////////////////////////////////

                facetIdentifierAttr: "uniqueID", // the names of the identifying attribute in the facet data objects                             
                firstFrozenFacet: [{ firstFacetInPane: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                lastFrozenFacet: [{ lastFacetInPane: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                firstMovingFacet: [{ firstFacetInPane: _ }, [areaOfClass, "MovingFacetViewPane"]],
                lastMovingFacet: [{ lastFacetInPane: _ }, [areaOfClass, "MovingFacetViewPane"]],

                rightOfFrozenFacetViewPane: atomic({ element: [areaOfClass, "FrozenFacetViewPane"], type: "right", content: true }),

                // SortingController param: 
                defaultSortableUniqueID: [{ uniqueID: _ }, [first, [{ dataSourceFacetData: _ }, [me]]]],
                specifiedSortingKey: [mergeWrite,  // override appData definition in SortingController, so it gets stored in view!
                    [{ currentView: { specifiedSortingKey: _ } }, [me]],
                    [{ defaultSortingKey: _ }, [me]]
                ],

                facetSummaryView: [mergeWrite,
                    [{ currentView: { facetSummaryView: _ } }, [me]],
                    false
                ],

                facetTypes: o(
                    { id: "SliderFacet", name: [{ sliderEntityStr: _ }, [me]] },
                    { id: "MSFacet", name: [{ msEntityStr: _ }, [me]] },
                    { id: "RatingFacet", name: [{ ratingEntityStr: _ }, [me]] },
                    { id: "ItemValues", name: [{ itemValuesEntityStr: _ }, [me]] }
                ),

                // end of facet-related context labels

                // beginning of overlay-related context labels

                permOverlayInitAppData: {
                    showZoomBoxed: true,
                    showZoomBoxing: false,
                    showSolutionSet: false
                },
                permIntOverlayInitAppData: [merge,
                    [{ permOverlayInitAppData: _ }, [me]],
                    { type: "Intensional" }
                ],
                permExtOverlayInitAppData: [merge,
                    [{ permOverlayInitAppData: _ }, [me]],
                    {
                        type: "Extensional",
                        uniqueID: [{ itemUniqueID: _ }, [me]]
                    }
                ],
                initOverlayDataCore: o(
                    {
                        name: "Base",
                        //uniqueID: fsAppConstants.globalBaseOverlayUniqueID,
                        uniqueID: [
                            getOverlayUniqueID,
                            fsAppConstants.globalBaseOverlayCounter
                        ],
                        overlayCounter: fsAppConstants.globalBaseOverlayCounter,
                        type: "GlobalBase",
                        showZoomBoxing: false, // cannot be zoomBoxed, by definition
                        showSolutionSet: false,
                        nameWasEdited: true
                    },
                    [merge,
                        {
                            name: fsAppConstants.defaultIntOverlayName,
                            //uniqueID: fsAppConstants.primaryOverlayUniqueID,
                            uniqueID: [
                                getOverlayUniqueID,
                                fsAppConstants.primaryOverlayCounter
                            ],
                            overlayCounter: fsAppConstants.primaryOverlayCounter,
                            showSolutionSet: false,
                            nameWasEdited: true
                        },
                        [{ permIntOverlayInitAppData: _ }, [me]]
                    ],
                    [cond,
                        [{ noLists: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: o(),
                            },
                            {
                                on: false,
                                use: [merge,
                                    {
                                        name: fsAppConstants.defaultFavoritesOverlayName,
                                        //uniqueID: fsAppConstants.defaultFavoritesUniqueID,
                                        uniqueID: [
                                            getOverlayUniqueID,
                                            fsAppConstants.defaultFavoritesCounter
                                        ],
                                        overlayCounter: fsAppConstants.defaultFavoritesCounter,
                                        nameWasEdited: true
                                    },
                                    [{ permExtOverlayInitAppData: _ }, [me]]
                                ]
                            }
                        )
                    ],
                    [{ blacklistOverlayData: _ }, [me]]
                ),

                initOverlayData: [sort, // don't let this merge screw up the ordering defined by initOverlayDataCore
                    [merge,
                        [identify, { uniqueID: _ }, [{ dataConfig: { overlayObjects: _ } }, [me]]], // comes first, so it can override default values
                        [identify, { uniqueID: _ }, [{ initOverlayDataCore: _ }, [me]]]
                    ],
                    { uniqueID: [{ initOverlayDataCore: { uniqueID: _ } }, [me]] }
                ],

                "^crossViewOverlayData": [{ initOverlayData: _ }, [me]],
                /*"^crossViewOverlayDataAD": o(), replace with line above once #1866 is fixed
                crossViewOverlayData: [mergeWrite,
                    [{ crossViewOverlayDataAD:_ }, [me]],
                    [{ initOverlayData: _ }, [me]]
                ],*/

                // note the merge here: currentView comes first, but it should - in theory - not matter, as any given attribute is written either to 
                // the currentView (e.g. "showSolutionSet") or to the crossView (e.g. "trashed", selections in facets that define an intensional overlay)
                // we first merge the currentView.overlayData and the crossViewOverlayData os, and then we sort them by the uniqueID of crossViewOverlayData
                overlayData: [sort, // see note above "Facet & Overlay Management: An important note on functional vs. appData."
                    [merge,
                        [identify, { uniqueID: _ }, [{ currentView: { overlayData: _ } }, [me]]],
                        [identify, { uniqueID: _ }, [{ crossViewOverlayData: _ }, [me]]]
                    ],
                    { uniqueID: [{ crossViewOverlayData: { uniqueID: _ } }, [me]] }
                ],
                overlayDataUniqueID: [{ overlayData: { uniqueID: _ } }, [me]],

                reorderedOverlayUniqueID: [mergeWrite,
                    [{ currentView: { reorderedOverlayUniqueID: _ } }, [me]],
                    [{ overlayDataUniqueID: _ }, [me]]
                ],
                reorderedOverlayDataUniqueID: [sort, // see note above "Facet & Overlay Management: An important note on functional vs. appData." 
                    [{ overlayDataUniqueID: _ }, [me]],
                    [{ reorderedOverlayUniqueID: _ }, [me]]
                ],
                "^trashedOrderOverlayUniqueID": o(),

                permOverlays: [
                    [areaOfClass, "PermOverlay"],
                    [{ children: { overlays: _ } }, [me]] // as the overlays areaSet is sorted!
                ],

                zoomBoxedOverlays: [{ zoomBoxed: true }, [{ permOverlays: _ }, [me]]], // ephemeral not included
                minimizedOverlays: [
                    { minimized: true },
                    [{ zoomBoxedOverlays: _ }, [me]]
                ],
                // trashed overlays are ordered in the order of trashing: last trashed is first.
                trashedOverlays: [sort,
                    [{ trashed: true }, [{ permOverlays: _ }, [me]]], // data
                    { uniqueID: [{ trashedOrderOverlayUniqueID: _ }, [me]] } // sortKey
                ],

                // areaRef to several widely referenced overlays (accessed via the myApp context label available to all areas).
                globalBaseOverlay: [areaOfClass, "GlobalBaseOverlay"],
                effectiveBaseOverlay: [areaOfClass, "EffectiveBaseOverlay"],
                blacklistOverlay: [
                    {
                        uniqueID:
                        [
                            getOverlayUniqueID,
                            fsAppConstants.defaultBlacklistCounter
                        ]
                    },
                    [areaOfClass, "Overlay"]
                ],

                // initialized with zoomBoxingOverlaysByApp (provided by inheriting classes). 
                // an overlay that is switched to zoomboxing mode has its os pushed into this appData.
                "^zoomBoxingOverlaysByUser": o(),
                firstZoomBoxingOverlay: [first, [{ zoomBoxingOverlays: _ }, [me]]],
                lastZoomBoxingOverlay: [last, [{ zoomBoxingOverlays: _ }, [me]]],
                visibleZoomBoxingOverlays: [pos,
                    r(1, -1), // exclude the GlobalBaseOverlay
                    [{ zoomBoxingOverlays: _ }, [me]]
                ],

                newOverlayNameWasEdited: false,
                "^newOverlayCounterAD": o(),
                newOverlayCounter: [mergeWrite,
                    [{ newOverlayCounterAD: _ }, [me]],
                    2
                ],

                /*
                // replaced by getOverlayUniqueID in globalFuncs
                newOverlayUniqueID: [concatStr,
                    o(
                        fsAppConstants.newOverlayIDPrefix,
                        [{ newOverlayCounter: _ }, [me]]
                    )
                ],
                */

                maximizedOverlayUniqueID: [mergeWrite,
                    [{ currentView: { maximizedOverlayUniqueID: _ } }, [me]],
                    o() // given o() as default, could have done w/o mergeWrite
                ],
                maximizedOverlay: [
                    { uniqueID: [{ maximizedOverlayUniqueID: _ }, [me]] },
                    [areaOfClass, "PermOverlay"]
                ],

                defaultExpandedOverlayUniqueIDs: o(),/*[
                    getOverlayUniqueID,
                    fsAppConstants.primaryOverlayCounter
                ],*/

                expandedOverlayUniqueIDs: [
                    { expandedOverlayUniqueIDs: _ },
                    [mergeWrite,
                        [{ currentView: _ }, [me]],
                        { expandedOverlayUniqueIDs: [{ defaultExpandedOverlayUniqueIDs: _ }, [me]] }
                    ]
                ],
                offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom: bFSAppPosConst.offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom,

                selectorBeingModified: [
                    { valSelectorBeingModified: true },
                    [areaOfClass, "SliderIntOverlayXWidget"]
                ],

                // params for SaveViewController:
                freshView: {
                    expandedMovingFacetUniqueIDs: o(),
                    maximizedOverlayUniqueID: o(),
                    expandedOverlayUniqueIDs: o()
                },

                expandedFacetHeadersRef: [
                    {
                        ofExpandedFacet: true,
                        dragged: false,
                        facetPanelIsOpen: false
                    },
                    [areaOfClass, "FacetHeader"]
                ],

                "^allSearchBoxesFields": o()
            },
            position: {
                frame: 0,
                offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom: {
                    point1: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "ExpandedFacetViewPane"],
                        type: "bottom"
                    },
                    equals: [{ offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom: _ }, [me]]
                },
                definePositionOfLabelBottomOfFacetHeaderWrtFacetHeaderPart1: {
                    point1: {
                        element: [{ expandedFacetHeadersRef: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        label: "bottomOfFacetHeader"
                    },
                    equals: 0,
                    orGroups: { label: "bottomOfFacetHeaderAnchor" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                definePositionOfLabelBottomOfFacetHeaderWrtFacetHeaderPart2: {
                    // the line should stay below all headers because some headers would move up,
                    // e.g., when dragging the facet
                    point1: {
                        //we have to exclude the FacetHeaders of facets with open FSP 
                        //as they are a bit toller than others
                        element: [{ expandedFacetHeadersRef: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        label: "bottomOfFacetHeader"
                    },
                    //default priority
                    min: 0
                },
                definePositionOfLabelBottomOfFacetHeaderWrtZoomBoxOrnamentTopPart1: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "top"
                    },
                    point2: {
                        label: "bottomOfFacetHeader"
                    },
                    equals: [densityChoice, [{ fsAppPosConst: { offsetBottomOfFacetHeaderAnchorAndZoomBoxOrnamentTop: _ } }, [globalDefaults]]],
                    orGroups: { label: "bottomOfFacetHeaderAnchor" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                definePositionOfLabelBottomOfFacetHeaderWrtZoomBoxOrnamentTopPart2: {
                    point1: {
                        element: [areaOfClass, "ZoomBoxOrnament"],
                        type: "top"
                    },
                    point2: {
                        label: "bottomOfFacetHeader"
                    },
                    min: [densityChoice, [{ fsAppPosConst: { offsetBottomOfFacetHeaderAnchorAndZoomBoxOrnamentTop: _ } }, [globalDefaults]]],
                }
            },
            children: {

                //This area (line) can be used for debugging purposes
                /*bottomOfFacetHeaderGridLine: {
                    description: {
                        "class": "BottomOfFacetHeaderGridLine"
                    }
                },*/
                facetClippers: {
                    data: [{ facetClipperData: _ }, [me]],
                    description: {
                        "class": "FacetClipper"
                    }
                },
                frozenFacetViewPane: {
                    description: {
                        "class": "FrozenFacetViewPane"
                    }
                },
                movingFacetViewPane: {
                    description: {
                        "class": "MovingFacetViewPane"
                    }
                },
                overlays: {
                    data: [identify,
                        _,
                        [{ reorderedOverlayDataUniqueID: _ }, [me]]
                    ]
                    // description: provided by inheriting classes
                },
                effectiveBaseOverlay: {
                    description: {
                        "class": "EffectiveBaseOverlay"
                    }
                },
                auxTopBar: {
                    description: {
                        "class": "AuxTopBar"
                    }
                },
                minimizedFacetViewPane: {
                    description: {
                        "class": compileMinimizedFacets ? "MinimizedFacetViewPane" : o(),
                    }
                },
                // saveView-related areas:
                SavedViewPane: {
                    description: {
                        "class": "SavedViewPane"
                    }
                }
            },
            stacking: {
                // the layer is defined by a *ZBottom and a *ZTop. it is used to zPosition VisibleOverlays which are dragged, which still need to stay below the facetViewPanes.
                labelLayerAboveOverlaysZTopToZBottom: {
                    lower: {
                        element: [me],
                        label: "layerAboveOverlaysZBottom"
                    },
                    higher: {
                        element: [me],
                        label: "layerAboveOverlaysZTop"
                    }
                },
                facetsAboveLayerAboveOverlaysZTop: {
                    lower: {
                        element: [me],
                        label: "layerAboveOverlaysZTop"
                    },
                    higher: [areaOfClass, "FacetViewPane"]
                },

                labelAboveNonDraggedFacetsI: {
                    // defined by ReorderableController
                    lower: [{ reorderingZPlane: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                    higher: {
                        label: "aboveAllNonDraggedFacets"
                    }
                },
                labelAboveNonDraggedFacetsII: {
                    // defined by ReorderableController
                    lower: [{ reorderingZPlane: _ }, [areaOfClass, "MovingFacetViewPane"]],
                    higher: {
                        label: "aboveAllNonDraggedFacets"
                    }
                },
                labelAboveNonDraggedFacetsIII: {
                    lower: {
                        element: [areaOfClass, "MinimizedFacetsView"],
                        label: "aboveAllNonDraggedMatrixElements" // defined by MatrixView
                    },
                    higher: {
                        label: "aboveAllNonDraggedFacets"
                    }
                }
            }
        }
        /*, // no LoadedViewSummary for now - it doesn't mesh well with the metaphor of a saved view as a bookmark..
                {
                    qualifier: {
                        dataSourceSelected: true,
                        saveAsMode: false
                    },
                    children: {
                        loadedViewSummary: {
                            description: {
                                "class": "LoadedViewSummary"
                            }
                        }
                    }
                }
                */
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    // This area (line) could be used in the future for debug purposes and visible 
    // on a url param such as "showGridLines=true" 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /*
    BottomOfFacetHeaderGridLine: {
        "class": ("IconAboveAppZTop","BackgroundColor"),
        context: {
            backgroundColor: "pink"
        },
        position: {
            left: 0,
            right: 0,
            height: 3,
            attachBottomToBottomOfFacetHeader: {
                point1: { type: "top" },
                point2: { element: [embedding], label: "bottomOfFacetHeader" },
                equals: 0
            }
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    LeanFSApp: o(
        { // default
            "class": "FSApp",
            children: {
                appFrame: {
                    description: {
                        "class": "LeanAppFrame"
                    }
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            context: {
                blacklistOverlayData: o()
            },
            children: {
                overlays: {
                    description: {
                        // data provided by FSApp
                        "class": "LeanOverlay"
                    }
                },
                topControls: {
                    description: {
                        "class": "LeanFSAppSettingsControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FatFSApp: o(
        { // default
            "class": "FSApp",
            children: {
                appFrame: {
                    description: {
                        "class": "FatAppFrame"
                    }
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            context: {
                blacklistOverlayData: [merge,
                    {
                        name: fsAppConstants.defaultBlacklistOverlayName,
                        //uniqueID: fsAppConstants.defaultBlacklistUniqueID,
                        uniqueID: [
                            getOverlayUniqueID,
                            fsAppConstants.defaultBlacklistCounter
                        ],
                        overlayCounter: fsAppConstants.defaultBlacklistCounter,
                        nameWasEdited: true
                    },
                    [{ permExtOverlayInitAppData: _ }, [me]]
                ]
            },
            children: {
                appFrame: {
                    description: {
                        "class": "FatAppFrame"
                    }
                },
                overlays: {
                    description: {
                        // data provided by FSApp
                        "class": "FatOverlay"
                    }
                },
                zoomBoxingOverlaysView: {
                    description: {
                        "class": "ZoomBoxingOverlaysView"
                    }
                },
                zoomBoxingOverlaysClipper: {
                    description: {
                        "class": "ZoomBoxingOverlaysClipper"
                    }
                },
                topControls: {
                    description: {
                        "class": "FatFSAppSettingsControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // used as the Clipper for the ZoomBoxing overlays, including when they're showing their solutionSetView.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ZoomBoxingOverlaysClipper: {
        position: {
            attachLeft: {
                point1: { type: "left" },
                point2: { element: [areaOfClass, "ExpandedOverlaysView"], type: "left" },
                equals: 0
            },
            attachRight: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "ZoomBoxingOverlaysView"], type: "right" },
                equals: 0
            },
            attachTop: {
                point1: { type: "top" },
                point2: { element: [areaOfClass, "ZoomBoxingOverlaysView"], type: "top" },
                equals: 0
            },
            attachBottom: {
                point1: { type: "bottom" },
                point2: { // if a zoomboxing overlay is showing its solutionSetView, then this class should extend to bottom of ZoomBoxTop
                    element: [cond,
                        [{ showSolutionSet: true }, [areaOfClass, "ZoomBoxingOverlay"]],
                        o(
                            { on: true, use: [areaOfClass, "ZoomBoxTop"] },
                            { on: false, use: [areaOfClass, "ZoomBoxingOverlaysView"] }
                        )
                    ],
                    type: "bottom"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AboveAllNonDraggedFacets: {
        "class": "GeneralArea",
        stacking: {
            aboveAllNonDraggedFacets: {
                lower: {
                    element: [{ myApp: _ }, [me]],
                    label: "aboveAllNonDraggedFacets"
                },
                higher: [me]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    OverlayColorController: {
        "class": "GeneralArea",
        context: {
            sizeOfOverlayFormulaColorsOS: [size, [{ myApp: { overlayFormulaColors: _ } }, [me]]],
            interSetColorOffset: o(16, 239, 17), // the 'set' here refers to the overlayFormulaColors os                                    
            getOverlayColor: [defun,
                o("num"),
                [cond,
                    [
                        "num",
                        [{ myApp: { overlayCoreColors: { overlayCounter: _ } } }, [me]]
                    ],
                    o(
                        {
                            on: true,
                            use: [convertRGBToString,
                                [
                                    {
                                        overlayCounter: "num",
                                        color: _
                                    },
                                    [{ myApp: { overlayCoreColors: _ } }, [me]]
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: [convertRGBToString,
                                [mod, // mod 256 the rgb that you get from this calculation
                                    [plus,
                                        [ // get the rgb of the the "num"-th element in overlayFormulaColors
                                            { color: _ },
                                            [pos,
                                                [mod,
                                                    "num",
                                                    [{ sizeOfOverlayFormulaColorsOS: _ }, [me]]
                                                ],
                                                [{ myApp: { overlayFormulaColors: _ } }, [me]]
                                            ]
                                        ],
                                        [mul, // and add to it 'row' times the sizeOfOverlayFormulaColorsOS.
                                            [{ interSetColorOffset: _ }, [me]],
                                            [floor,
                                                [div,
                                                    "num",
                                                    [{ sizeOfOverlayFormulaColorsOS: _ }, [me]]
                                                ],
                                                0
                                            ]
                                        ]
                                    ],
                                    256
                                ]
                            ]
                        }
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows reordering of the overlays. It inherits ReorderableController, and is inherited by FSApp.
    // Reordering of overlays is done directly on the os of data objects which are used to construct their areaSet. We do not settle for simply storing an os of the order of the
    // overlay uniqueIDs, as most of the overlay data object is appData: it is user-generated and can be modified by the user. It's not only the relative order of overlays that's
    // appData.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ReorderableOverlayController: o(
        { // default
            "class": o("GeneralArea", "ReorderableController"),
            context: {
                // ReorderableController params:
                reordered: [{ myApp: { reorderedOverlayUniqueID: _ } }, [me]]
                // reorderingSpacing: see variants for which VisibleOverlay is being reordered (Standard state or not).                         
            },
            stacking: {
                // We want to ensure that the visible overlays remain below the facetViewPanes, even the one being dragged. 
                // So the reorderingZPlane should be further limit the reordering plane (defined in ReorderableController) to remain below these panes.
                reorderingZPlaneBelowFacetViewPanes: {
                    lower: [{ reorderingZPlane: _ }, [me]],
                    higher: [areaOfClass, "FacetViewPane"]
                }
            }
        },
        {
            qualifier: { reordering: true },
            context: {
                reorderingExpandedVisibleOverlays: [
                    [{ draggedToReorder: _ }, [me]],
                    [areaOfClass, "VerticalVisReorderable"]
                ]
            }
        },
        // note to self: rather ugly having here the two variants to control reorderingSpacing depending on which set of VisibleOverlays are reordered.
        {
            qualifier: {
                reordering: true,
                reorderingExpandedVisibleOverlays: true
            },
            context: {
                reorderingSpacing: bFSAppPosConst.verticalVisibleOverlaysSpacing
            }
        },
        {
            qualifier: {
                reordering: true,
                reorderingExpandedVisibleOverlays: false
            }, // i.e. reordering either Minimized or Trashed VisibleOverlays
            context: {
                reorderingSpacing: bFSAppPosConst.horizontalVisibleOverlaysSpacing
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FSAppControls: {
        "class": o("MinWrapHorizontal", "AboveSiblings"),
        context: {
            // to ensure that this priority - on the vertical axis, wins the minWrap of the AppFrame and its embeddedStar, in FatFSApp          
            minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure
        },
        position: {
            height: bFSAppPosConst.appControlsHeight
        },
        children: {
            densityController: {
                description: {
                    "class": "DensityController"
                }
            },
            connectionIndicator: {
                description: {
                    "class": "AppStateConnectionIndicator"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    LeanFSAppControls: {
        "class": "FSAppControls",
        position: {
            horizontalPositionOfControls: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "AppFrame"], type: "right" },
                equals: 10
            },
            verticalPositionOfControls: {
                point1: { type: "vertical-center" },
                point2: { element: [areaOfClass, "EffectiveBaseSummary"], type: "vertical-center" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FatFSAppControls: {
        "class": "FSAppControls",
        position: {
            horizontalPositionOfControls: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "AppFrame"], type: "right" },
                equals: 0
            },
            verticalPositionOfControls: {
                point1: { type: "top" },
                point2: { element: [embedding], type: "top" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PaneTopPanel: {
        "class": o("GeneralArea", "HandleHeight"),
        context: {
            handleHeight: [plus,
                [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                [mul,
                    [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
                    2
                ]
            ]
        },
        position: {
            top: 0,
            left: 0,
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myView: the view which this view minimizes horizontally. default provided.
    // 2. myView is expected to have a writable reference 'horizontallyMinimized'
    // 3. leftSideBaseTriangle: boolean, true by default
    // 4. widthWhenMinimized: default provided,
    // 5. minimizedTriangleWidth: bFSAppPosConst.horizontalMinimizedPaneTriangleWidth,
    // 6. minimizedTriangleHeight: bFSAppPosConst.horizontalMinimizedPaneTriangleHeight,
    // 7. minimizedTriangleColor: default provided.
    // 8. inheriting class should specify its position when horizontallyMinimized: false
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalMinimizationControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                horizontallyMinimized: [{ myView: { horizontallyMinimized: _ } }, [me]]
            }
        },
        { // default
            "class": o("HorizontalMinimizationControlDesign", "TooltipableControl"),
            context: {
                myView: [embedding],
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { expandPane: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { paneEntityStr: _ } }, [me]],
                    [not, [{ horizontallyMinimized: _ }, [me]]] // the boolean for booleanStringFunc should be phrased in positive terms
                ],

                leftSideBaseTriangle: true, // used by Design class
                widthWhenMinimized: bFSAppPosConst.minimizedPaneWidth
            },
            write: {
                onHorizontalMinimizationControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleHorizontallyMinimize: {
                            to: [{ myView: { horizontallyMinimized: _ } }, [me]],
                            merge: [not, [{ myView: { horizontallyMinimized: _ } }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "AppControl",
        },
        {
            qualifier: { horizontallyMinimized: true },
            position: {
                top: 0,
                bottom: 0,
                width: [{ widthWhenMinimized: _ }, [me]],
                "horizontal-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Should be inherited before MatrixResizeHandle, as it is intended to override its values.  
    // API:
    // 1. myMatrix  
    // 2. attachToViewSide: side of the MatrixView the handle will attach to.
    // 3. myAnchorToViewSide: the side of the handle to be attached to the MatrixView 
    // 4. girth: girth of the handle. default value provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppMatrixElementResizeHandle: {
        context: {
            draggingPriority: positioningPrioritiesConstants.weakerThanDefault, // override the default positioningPrioritiesConstants.mouseAttachment 
            // so that we overcome the (horizontal) MinWrap priority of 
            // positioningPrioritiesConstants.defaultPressure
            viewSideIsHandle: true, // override MatrixResizeHandle default value
            girth: 10
        },
        position: {
            attachToMatrixView: {
                point1: { element: [{ myMatrixView: _ }, [me]], type: [{ attachToViewSide: _ }, [me]] },
                point2: { type: [{ myAnchorToViewSide: _ }, [me]] },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    AppMatrixElementHorizontalResizeHandle: {
        "class": o("AppMatrixElementResizeHandle", "MatrixHorizontalResizeHandle"),
        context: {
            myAnchorToViewSide: "horizontal-center"
        },
        position: {
            width: [{ girth: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppMatrixElementLeftResizeHandle: {
        "class": "AppMatrixElementHorizontalResizeHandle",
        context: {
            attachToViewSide: "left"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppMatrixElementRightResizeHandle: {
        "class": "AppMatrixElementHorizontalResizeHandle",
        context: {
            attachToViewSide: "right"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    AppMatrixElementVerticalResizeHandle: {
        "class": o("AppMatrixElementResizeHandle", "MatrixVerticalResizeHandle"),
        context: {
            myAnchorToViewSide: "vertical-center"
        },
        position: {
            height: [{ girth: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppMatrixElementTopResizeHandle: {
        "class": "AppMatrixElementVerticalResizeHandle",
        context: {
            attachToViewSide: "top"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AppMatrixElementBottomResizeHandle: {
        "class": "AppMatrixElementVerticalResizeHandle",
        context: {
            attachToViewSide: "bottom"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedViewSummary: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayLoadedViewSummary: [and,
                    [{ loadedSavedViewName: _ }, [me]],
                    [not, [{ selectedSavedViewIsTheFreshView: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "AboveSiblings", "TrackSaveViewController"),
            context: {
                minWrapAround: 0
            },
            position: {
                attachLeftToEffectiveBaseSummaryRight: {
                    point1: {
                        element: [areaOfClass, "EffectiveBaseSummary"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                verticallyAlignWRTEffectiveBaseName: {
                    point1: {
                        element: [areaOfClass, "EffectiveBaseName"],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                },
                doNotExceedFSAppSettingsControlsRight: {
                    point1: { type: "right" },
                    point2: { element: [areaOfClass, "FSAppSettingsControls"], type: "left" },
                    min: bFSAppPosConst.horizontalMarginOfAppFrameTitles
                }
            }
        },
        {
            qualifier: { displayLoadedViewSummary: true },
            children: {
                colon: {
                    description: {
                        "class": "LoadedViewColon"
                    }
                },
                name: {
                    description: {
                        "class": "LoadedViewName"
                    }
                }
            }
        },
        {
            qualifier: {
                displayLoadedViewSummary: true,
                loadedViewModified: true
            },
            children: {
                modificationIndicator: {
                    description: {
                        "class": "LoadedViewModificationIndicator"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedViewElement: {
        "class": o("LoadedViewElementDesign", "GeneralArea", "DisplayDimension"),
        position: {
            "vertical-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedViewColon: {
        "class": "LoadedViewElement",
        context: {
            displayText: ":"
        },
        position: {
            left: 0,
            minOffsetFromLeftOfName: { // allows the modification indicator to squeeze in
                point1: { type: "right" },
                point2: { element: [{ children: { name: _ } }, [embedding]], type: "left" },
                min: bFSAppPosConst.horizontalMarginOfAppFrameTitles
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedViewName: {
        "class": o("LoadedViewElement", "TextInput"),
        context: {
            mouseEventToEdit: "DoubleClick",
            inputAppData: [{ loadedSavedViewName: _ }, [embedding]],
        }
        // position: left side defined by LoadedViewColon
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadedViewModificationIndicator: {
        "class": "LoadedViewElement",
        context: {
            displayText: "*"
        },
        position: {
            attachLeftToColonRight: {
                point1: { element: [{ children: { colon: _ } }, [embedding]], type: "right" },
                point2: { type: "left" },
                equals: bFSAppPosConst.horizontalMarginOfAppFrameTitles
            },
            attachRightToNameLeft: {
                point1: { type: "right" },
                point2: { element: [{ children: { name: _ } }, [embedding]], type: "left" },
                equals: 0
            }
        }
    },
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionAtTopOfAppFrame: {
        position: {
            attachTopToAppFrame: {
                point1: {
                    element: [areaOfClass, "AppFrame"],
                    type: "top"
                },
                point2: { type: "top" },
                equals: 0
            },
            attachBottomToBottomOfAppFrameTitleRow: {
                point1: { type: "bottom" },
                point2: {
                    element: [areaOfClass, "AppFrame"],
                    label: "bottomOfAppFrameTitleRow"
                },
                equals: 0
            }
        },
        stacking: {
            aboveAppFrame: {
                higher: [me],
                lower: [areaOfClass, "AppFrame"]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // Beginning of Tracking Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackNoLists: o(
        { // variant-controller
            qualifier: "!",
            context: {
                noLists: [arg, "noLists", false]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackOverlayMaximization: o(
        { // variant-controller
            qualifier: "!",
            context: {
                maximizedOverlayExists: [{ myApp: { maximizedOverlayUniqueID: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea"
        },
        {
            qualifier: { maximizedOverlayExists: true },
            context: {
                maximizedOverlay: [{ myApp: { maximizedOverlay: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackAppFrameMinimization: o(
        { // variant-controller
            qualifier: "!",
            context: {
                appFrameMinimized: [{ minimized: _ }, [areaOfClass, "AppFrame"]]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackDataSourceSelected: o(
        {
            qualifier: "!",
            context: {
                dataSourceSelected: [{ myApp: { dataSourceSelected: _ } }, [me]]
            }
        },
        {
            "class": "GeneralArea"
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackZoomBoxingOverlayShowSolutionSet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // two conditions need to be met: showSolutionSet for the effectiveBaseOverlay needs to be true, and the appFrame needs to be maximized!
                zoomBoxingOverlayShowSolutionSet: [and,
                    [{ showSolutionSet: _ }, [areaOfClass, "ZoomBoxingOverlay"]],
                    [not, [{ appFrameMinimized: _ }, [me]]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackOverlaysShowing: o(
        { // default
            "class": o("GeneralArea", "TrackOverlayMaximization"),
            context: {
                overlaysShowing: [
                    { show: true },
                    [{ myApp: { permOverlays: _ } }, [me]]
                ],
                intOverlaysAndNonEmptyExtOverlays: o(
                    [
                        { emptyStableSolutionSet: false },
                        [areaOfClass, "ExtOverlay"]
                    ],
                    [areaOfClass, "IntOverlay"]
                ),
                zoomBoxingOverlaysShowing: [ // note: they're ordered in the order in which they were moved to the zoomBoxing frame.
                    { show: true },
                    [{ myApp: { zoomBoxingOverlays: _ } }, [me]]
                ],
                zoomBoxingZoomBoxedOverlaysShowing: o(
                    [{ zoomBoxingOverlaysShowing: _ }, [me]],
                    [{ zoomBoxedOverlaysShowing: _ }, [me]]
                ),

                intZoomBoxingOverlays: [
                    [areaOfClass, "IntOverlay"], // note this excludes the GlobalBaseOverlay!
                    [areaOfClass, "ZoomBoxingOverlay"]
                ],
                nonEmptyInclusiveZoomBoxingExtOverlays: [
                    {
                        inclusiveZoomBoxing: true,
                        emptyStableSolutionSet: false
                    },
                    [
                        [areaOfClass, "ExtOverlay"],
                        [areaOfClass, "ZoomBoxingOverlay"]
                    ]
                ],
                overlaysInAmoebaGlobal: o( // zoomboxing overlays before (i.e. left-of/above) zoomboxed 
                    [
                        o( // this selection out of zoomBoxingOverlaysShowing ensures that we get a subset per the latter's ordering.
                            [{ intZoomBoxingOverlays: _ }, [me]],
                            [{ nonEmptyInclusiveZoomBoxingExtOverlays: _ }, [me]]
                        ),
                        [{ zoomBoxingOverlaysShowing: _ }, [me]]
                    ],
                    [ // of the zoomboxed overalays showing, we take the intensional ones, and the non-empty extensional ones
                        [{ intOverlaysAndNonEmptyExtOverlays: _ }, [me]],
                        [{ zoomBoxedOverlaysShowing: _ }, [me]]
                    ]
                )
            }
        },
        {
            qualifier: { maximizedOverlayExists: false },
            context: {
                // take all overlays that are on show: true and are zoomBoxed
                zoomBoxedOverlaysShowing: [
                    { zoomBoxed: true },
                    [{ overlaysShowing: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { maximizedOverlayExists: true },
            context: {
                zoomBoxedOverlaysShowing: [
                    { maximized: true },  // one overlay at most can be maximized
                    [{ myApp: { permOverlays: _ } }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackItemsShowing: o(
        { // variant-controller
            qualifier: "!",
            context: {
                itemsShowing: [areaOfClass, "SolutionSetItem"]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackJIT: o(
        { // variant-controller
            qualifier: "!",
            context: {
                jit: [{ myApp: { jit: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // End of Tracking Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Assumes the inheriting area also inherits AppStrings
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppStrings: {
        context: {
            facetEntityStr: "Facet",
            facetEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ facetEntityStr: _ }, [me]]
            ],
            overlayEntityStr: "Slice",
            overlayEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ overlayEntityStr: _ }, [me]]
            ],
            intOverlayEntityStr: "Filter",
            intOverlayEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ intOverlayEntityStr: _ }, [me]]
            ],
            OverlaySearchBoxEntityStr: "Search",
            intOverlayEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ intOverlayEntityStr: _ }, [me]]
            ],
            filteringStr: "Filtering",
            extOverlayEntityStr: "List",
            extOverlayEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ extOverlayEntityStr: _ }, [me]]
            ],

            uniquelyIdentifyingStr: "Identifying",

            sliderEntityStr: "Slider",
            sliderEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ sliderEntityStr: _ }, [me]]
            ],

            msEntityStr: "Multi-Value",
            msEntityStrPlural: [{ msEntityStr: _ }, [me]], // same as singular!

            ratingEntityStr: "Rating",
            ratingEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ ratingEntityStr: _ }, [me]]
            ],

            itemValuesEntityStr: "Values-Only",
            itemValuesEntityStrPlural: [{ itemValuesEntityStr: _ }, [me]],

            histogramEntityStr: "Histogram",
            histogramEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ histogramEntityStr: _ }, [me]]
            ],
            barEntityStr: "Bar",
            barEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ barEntityStr: _ }, [me]]
            ],

            tailEntityStr: "Tail",
            tailEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ tailEntityStr: _ }, [me]]
            ],

            dataTypeStr: "Data Type",

            remoteStr: "Remote",
            localStr: "Local",
            uploadStr: "Upload",
            uploadedStr: "Uploaded",
            localFileSelectorTooltipText: "Click to Import a Local Data File (only for the Duration of this Session)",
            selectDownToHereText: "Select Down to Here",
            uploadDataFileToServerTooltipText: "Click to Upload Data File to Server",
            errorInLoading: "Error in Loading",
            errorInLoadingConfigurationFile: [concatStr,
                o(
                    [{ errorInLoading: _ }, [me]],
                    " ",
                    "Configuration File"
                )
            ],

            incorrectFormulaStr: [concatStr, o("Incorrect", " ", [{ formulaEntityStr: _ }, [me]])],
            definedByAStr: "Defined by a",
            obsoleteReferenceInFormulaStr: [concatStr, o("Obsolete Reference in", " ", [{ formulaEntityStr: _ }, [me]])],
            notANumericalFacetStr: [concatStr, o("Not a Numerical", " ", [{ facetEntityStr: _ }, [me]])],
            savedViewNameStrPrefix: [concatStr,
                o(
                    [{ viewEntityStr: _ }, [me]],
                    " ",
                    "#"
                )
            ],

            maximizeOverlayMenuStr: [concatStr,
                o(
                    [{ hideStr: _ }, [me]],
                    [{ otherStr: _ }, [me]],
                    [{ overlayEntityStrPlural: _ }, [me]]
                ),
                " "
            ],
            intersectionModeMenuStr: "Intersect",
            unionModeMenuStr: "Union",
            inclusiveZoomBoxingMenuStr: [concatStr, o([{ exploreStr: _ }, [me]], " ", "within")],
            exclusiveZoomBoxingMenuStr: [concatStr, o([{ exploreStr: _ }, [me]], " ", "without")],
            zoomBoxMenuStr: "Move to Workspace"
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedOverlaySearchBox: {
        "class": o("MinimizedOverlaySearchBoxDesign", "GeneralArea", "SearchBox", "MinWrap"),
        position: {
            left: 0,
            top: [{ verticalMargin: _ }, [me]],
            bottom: [{ verticalMargin: _ }, [me]],
        },
        context: {
            minWrapAround: 0,
            verticalMargin: bFSAppPosConst.minimizedVisibleOverlayVerticalSpacing,
            
            // SearchBox params:
            searchStr: [mergeWrite,
                // minimized facet searchbox is view-specific
                [{ myApp: { currentView: { minimizedOverlaySearchBox: _ } } }, [me]],
                o()
            ],
            searchBoxWidth: [densityChoice, [{ fsAppPosConst: { widthOfTotalMinimizedOverlaySearchBox: _ } }, [globalDefaults]]],
            initExpandedSearchBox: false,
            enableMinimization: true,
            realtimeSearch: true,
            placeholderInputText: [concatStr,
                o(
                    [{ myApp: { searchStr: _ } }, [me]],
                    " ",
                    [{ myApp: { overlayEntityStrPlural: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is an auxiliary area to define the top gray area where 
    // the EffectiveBaseSummary and AppSettingsControls are situated
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AuxTopBar: o(
        {
            "class": "TrackDataSourceApp",
            position: {
                attachLeftToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: 0
                },
                attachRightToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "right"
                    },
                    point2: { type: "right" },
                    equals: 0
                },
                attachBottomToZoomBox: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ZoomBox"], type: "top" },
                    equals: 0
                }

            }
        },
        {
            qualifier: {
                showDataSourcePane: true
            },
            position: {
                attachTopToDataSourceSelectorsContainer: {
                    point1: {
                        element: [areaOfClass, "DataSourceSelectorsContainer"],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                showDataSourcePane: false
            },
            position: {
                attachTopToAppFrame: {
                    point1: {
                        element: [areaOfClass, "AppFrame"],
                        type: "top"
                    },
                    point2: { type: "top" },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FacetTagsController: {
        "class": o("GeneralArea", "TagsController"),
        context: {
            // TagsController params:
            tagsData: [{ myApp: { facetTagsData: _ } }, [me]],
            appTags: o(
                [sort,
                    [_, [{ myApp: { facetTagsData: { facetTypeSpecificTags: _ } } }, [me]]],
                    "ascending"
                ],
                [sort,
                    [_, [{ myApp: { facetTagsData: { facetsDefiningIntOverlayTags: _ } } }, [me]]],
                    "ascending"
                ]
            ),
            preloadedTags: [sort,
                [_, [{ myApp: { facetTagsData: { preloadedTags: _ } } }, [me]]],
                "ascending"
            ],
            showTagsViewPaneAD: [{ myApp: { currentView: { showTagsViewPaneAD: _ } } }, [me]], // override default definition, so it is view-specific
            userSelectedTagsAD: [{ myApp: { currentView: { userSelectedTagsAD: _ } } }, [me]], // override default definition, so it is view-specific

            myTagsDoc: [ // doesn't always exist, but when it doesn't, tagsViewPaneInitialExpandableHeight isn't used anyway. 
                { myTagsController: [me] },
                [areaOfClass, "TagsDoc"]
            ],
            tagsViewPaneInitialExpandableHeight: [plus,
                [offset,
                    { element: [{ myTagsDoc: _ }, [me]], type: "top" },
                    { element: [{ myTagsDoc: _ }, [me]], type: "bottom" }
                ],
                [{ myTagsDoc: { wrapAroundSecondaryAxisSpacing: _ } }, [me]]
            ],

            "^tagsViewPaneStableExpandableHeightAD": o(),
            tagsViewPaneStableExpandableHeight: [mergeWrite,
                [{ tagsViewPaneStableExpandableHeightAD: _ }, [me]],
                [{ tagsViewPaneInitialExpandableHeight: _ }, [me]]
            ],
            "^tagsViewPaneUserExpandedVertically": false,
            "^tagsViewPaneUserDoubleClickedVertically": false

        },
        write: {
            onFacetTagsControllerShowTagsViewPaneControl: {
                upon: [{ showTagsViewPane: _ }, [me]],
                true: {
                    closeExpandedFacetsSettingsPanels: {
                        to: [{ settingsPanelIsOpen: _ }, [{ settingsPanelIsOpen: true }, [areaOfClass, "ExpandedFacet"]]],
                        merge: false
                    },
                    closeExpandedFacetsFormulaPanels: {
                        to: [{ formulaPanelIsOpen: _ }, [{ formulaPanelIsOpen: true }, [areaOfClass, "ExpandedFacet"]]],
                        merge: false
                    }
                }
            }
        }
    }
};
