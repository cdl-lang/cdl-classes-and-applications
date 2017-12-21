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

// %%classfile%%: <minimizedFacetViewPaneDesignClasses.js>

var classes = {


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetViewPane: o(
        { // variant-controller
            qualifier: "!",
            context: {
                horizontallyMinimized: [mergeWrite,
                    [{ myApp: { currentView: { minimizedFacetViewPaneHorizontalMinimization: _ } } }, [me]],
                    false
                ],
                minimizedFacetsViewHandleTmd: [{ matrixResizeHandleTmd: _ }, [areaOfClass, "MinimizedFacetsView"]]
            }
        },
        { // default 
            "class": compileTags ? o("MinimizedFacetViewPaneDesign", "GeneralArea", "FacetTagsController", "AboveSiblings") :
                o("MinimizedFacetViewPaneDesign", "GeneralArea", "AboveSiblings"),
            context: {
                minimizedFacetViewPaneElementWidth: [mergeWrite,
                    [{ myApp: { currentView: { minimizedFacetWidth: _ } } }, [me]],
                    [densityChoice, [{ fsAppPosConst: { minimizedFacetWidth: _ } }, [globalDefaults]]]
                ],

                virtualMinimizedFacetViewPaneElementWidth: [cond,
                    [{ minimizedFacetsViewHandleTmd: _ }, [me]],
                    o(
                        {
                            on: true, use: [offset,
                                // referenced by the control areas whose width relates to the MinimizedFacet. by tracking the offset between their labels, their width
                                // responds also when the minimized facets' width is modified.
                                { label: "leftOfMinimizedFacetWhenExpandingWidth" },
                                { label: "rightOfMinimizedFacetWhenExpandingWidth" }
                            ]
                        },
                        {
                            on: false, use: [{ minimizedFacetViewPaneElementWidth: _ }, [me]]
                        }
                    )
                ],

                minimizedFacetViewPaneElementStandardHeight: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]],
                minimizedFacetViewPaneElementExpandedHeight: [plus, // awaiting specs from yuval.                    
                    [{ minimizedFacetViewPaneElementStandardHeight: _ }, [me]],
                    [{ entityTagsViewHeight: _ }, [areaOfClass, "FacetTagsController"]]
                ],

                minimizedFacetViewPaneElementHeight: [cond,
                    [{ showTagsViewPane: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ minimizedFacetViewPaneElementStandardHeight: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [{ minimizedFacetViewPaneElementExpandedHeight: _ }, [me]]
                        }
                    )
                ],
                horizontalSpacingOfMinimizedFacetViewPaneElements: [densityChoice, bFSPosConst.minimizedFacetsHorizontalSpacing],
                verticalSpacingOfMinimizedFacetViewPaneElements: [densityChoice, bFSPosConst.minimizedFacetsVerticalSpacing]
            },
            position: {
                attachToZoomBoxOrnamentRight: {
                    point1: { type: "right" },
                    point2: { element: [areaOfClass, "ZoomBoxOrnament"], type: "right", content: true },
                    equals: bFSAppPosConst.minimizedFacetsViewOffsetFromZoomBoxRight
                },
                attachLeftToExpandedOverlaysViewRight: {
                    point1: {
                        element: [areaOfClass, "ExpandedOverlaysView"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bFSAppPosConst.expandedOverlaysViewToMinimizedFacetsView
                },
                attachTopToFrozenFacetViewPaneTop: {
                    point1: { element: [areaOfClass, "FrozenFacetViewPane"], type: "top" },
                    point2: { type: "top" },
                    equals: [{ expandedFacetToPaneOffsetTop: _ }, [areaOfClass, "FrozenFacetViewPane"]]
                },
                minBottomToFromBottomOfExpandedFacets: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "FrozenFacetViewPane"], type: "bottom" },
                    min: [{ expandedFacetToPaneOffsetBottom: _ }, [areaOfClass, "FrozenFacetViewPane"]]
                },
                minBottomToFromTopOfTrashDisplay: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "TrashDisplay"], type: "top" },
                    min: [{ expandedFacetToPaneOffsetBottom: _ }, [areaOfClass, "FrozenFacetViewPane"]]
                },
                eitherAnchorToBottomOfExpandedFacets: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "FrozenFacetViewPane"], type: "bottom" },
                    equals: [{ expandedFacetToPaneOffsetBottom: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                    orGroups: { label: "bottomOfMinimizedFacetViewPane" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                orAnchorToTopOfTrashDisplay: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "TrashDisplay"], type: "top" },
                    equals: [{ expandedFacetToPaneOffsetBottom: _ }, [areaOfClass, "FrozenFacetViewPane"]],
                    orGroups: { label: "bottomOfMinimizedFacetViewPane" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                stayRigthOfFrozenFacetViewPaneLeft: {
                    point1: { element: [areaOfClass, "FrozenFacetViewPane"], type: "left" },
                    point2: { type: "left" },
                    min: 0
                },
                minimizedFacetWidthMustBePositive: {
                    point1: { label: "leftOfMinimizedFacetWhenExpandingWidth" },
                    point2: { label: "rightOfMinimizedFacetWhenExpandingWidth" },
                    min: 1
                }
            },
            children: {
                minimizationControl: {
                    description: {
                        "class": "MinimizedFacetViewPaneMinimizationControl"
                    }
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            "class": "MinWrapHorizontal",
            /*children: { no longer offer FSAppAddUDFacetControl when the minimizedFacetViewPane is minimized itself.
                minimizedAddUDF: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "FSAppAddUDFacetControl"
                    }
                }
            }*/
        },
        {
            qualifier: { horizontallyMinimized: false },
            children: {
                topPanel: {
                    description: {
                        "class": "MinimizedFacetViewPaneTopPanel"
                    }
                },
                minimizedFacetsNumColumnsControl: {
                    description: {
                        "class": "MinimizedFacetsNumColumnsControl"
                    }
                },
                searchBox: {
                    description: {
                        "class": "MinimizedFacetViewPaneSearchBox"
                    }
                },
                addUDF: {
                    description: {
                        "class": "FSAppAddUDFacetControl"
                    }
                },
                minimizedFacetsView: {
                    description: {
                        "class": "MinimizedFacetsView"
                    }
                },
                showTagsViewPane: {
                    description: {
                        "class": "ShowFacetTagsViewControl"
                    }
                }
            }
        },
        {
            qualifier: {
                horizontallyMinimized: false,
                showTagsViewPane: true
            },
            children: {
                tagsViewPane: compileTags ?
                    {
                        description: {
                            "class": "MinimizedFacetViewPaneTagsViewPane"
                        }
                    } :
                    o()
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetViewPaneTopPanel: {
        "class": o("MinimizedFacetViewPaneTopPanelDesign", "PaneTopPanel")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetViewPaneSearchBox: {
        "class": o("MinimizedFacetViewPaneSearchBoxDesign", "GeneralArea", "SearchBox"),
        context: {
            // SearchBox params
            searchStr: [mergeWrite,
                // minimized facet searchbox is view-specific
                [{ myApp: { currentView: { minimizedFacetSearchBox: _ } } }, [me]],
                o()
            ],
            placeholderInputText: [concatStr,
                o(
                    [{ myApp: { searchStr: _ } }, [me]],
                    [{ myApp: { facetEntityStrPlural: _ } }, [me]]
                ),
                " "
            ],
            realtimeSearch: [cond,
                [{ realtimeFacetSearchABTest: _ }, [me]],
                o(
                    { on: "V1", use: true },
                    { on: "V2", use: false }
                )
            ],
            searchBoxHeight: [{ minimizedFacetViewPaneElementStandardHeight: _ }, [embedding]],
            searchBoxWidth: [minus,
                [{ virtualMinimizedFacetViewPaneElementWidth: _ }, [embedding]],
                [plus,
                    [{ leftMargin: _ }, [areaOfClass, "ShowFacetTagsViewControl"]],
                    [{ dimension: _ }, [areaOfClass, "ShowFacetTagsViewControl"]]
                ]
            ]
        },
        write: {
            onMinimizedFacetViewPaneSearchBoxDataSourceClicked: {
                upon: [clickHandledBy, [areaOfClass, "DataSource"]],
                true: {
                    resetMinimizedFacetViewPaneSearchBox: {
                        to: [{ searchStr: _ }, [me]],
                        merge: o()
                    }
                }
            }
        },
        position: {
            attachTopToTopPanelBottom: {
                point1: {
                    element: [areaOfClass, "MinimizedFacetViewPaneTopPanel"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ verticalSpacingOfMinimizedFacetViewPaneElements: _ }, [embedding]],
            },
            attachToShowFacetTagsViewControlRight: {
                point1: {
                    element: [areaOfClass, "ShowFacetTagsViewControl"],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: [{ horizontalSpacingOfMinimizedFacetViewPaneElements: _ }, [embedding]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsView: o(
        { // default
            "class": compileTags ? o("GeneralArea", "FacetViewPane", "MatrixView", "TrackMyTagsController") :
                o("GeneralArea", "FacetViewPane", "MatrixView"),
            context: {
                myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"],
                myScrollbar: [
                    { myMatrixView: [me] },
                    [areaOfClass, "MatrixVerticalScrollbar"]
                ],
                horizontalMarginAroundScrollbar: [{ fsAppPosConst: { minimizedFacetViewPaneHorizontalMarginAroundScrollbar: _ } }, [globalDefaults]],
                // MatrixView params:
                matrixResizeHandleCanModifyViewDimension: false,
                automaticMatrixViewResize: false,
                nr_columns: [mergeWrite, // override the default appData definition in MatrixView
                    [{ myApp: { currentView: { numColumnsMinimizedFacetViewPane: _ } } }, [me]],
                    [{ initial_nr_columns: _ }, [me]]
                ],
                expansionAxis: "horizontal",
                fixed_width: true,
                scrollbarBorderColor: "transparent",
                scrollbarSide: "end",
                showScrollbarOnlyWhenInView: false,
                // initial_nr_columns: use default value,
                wheelScrollInPixels: [plus, // override default UpDownOnArrowOrWheel param (via ContMovableController and MatrixView)
                    // this ensures that a turn of the mouse wheel will feel like a "next"/"prev" of matrix cells.
                    [{ myPaneContainer: { minimizedFacetViewPaneElementHeight: _ } }, [me]],
                    [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
                ],

                // Note we allocate the width of the scrollbar and its horizontal margins on both sides, and then we subtract the excess spacing already
                // offered between the MatrixDoc and its cells (as that can also be taken up by the scrollbar)
                additionalMatrixViewWidth: [minus,
                    [plus,
                        scrollbarPosConst.widthOfScrollbar,
                        [mul, [{ horizontalMarginAroundScrollbar: _ }, [me]], 2]
                    ],
                    [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
                ],

                //////////////////////////////////////////////////////////
                // beginning of hack to calculate the indices of the minimized facets to be created!
                // awaiting JIT implementation of the Matrix library.
                // see additional hack in this context in MinimizedFacet!!!
                //////////////////////////////////////////////////////////

                minimizedFacetHeightPlusSpacing: [plus,
                    [{ myPaneContainer: { minimizedFacetViewPaneElementHeight: _ } }, [me]],
                    [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
                ],
                rowInDocOfTopOfView: [floor,
                    [div,
                        [{ positionOfViewWithinDoc: _ }, [me]],
                        [{ minimizedFacetHeightPlusSpacing: _ }, [me]]
                    ]
                ],

                indexOfFirstCellToBeCreated: [mul,
                    [{ nr_columns: _ }, [me]],
                    [max, 0, [minus, [{ rowInDocOfTopOfView: _ }, [me]], 1]]
                ],
                rowInDocOfBottomOfView: [ceil,
                    [div,
                        [plus,
                            [{ positionOfViewWithinDoc: _ }, [me]],
                            [{ viewLength: _ }, [me]]
                        ],
                        [{ minimizedFacetHeightPlusSpacing: _ }, [me]]
                    ]
                ],
                indexOfLastCellToBeCreated: [mul,
                    [{ nr_columns: _ }, [me]],
                    [{ rowInDocOfBottomOfView: _ }, [me]]
                ],

                //////////////////////////////////////////////////////////
                // end of hack 
                //////////////////////////////////////////////////////////                
            },
            children: {
                minimizedFacetsDoc: {
                    description: {
                        "class": "MinimizedFacetsDoc"
                    }
                },
                verticalScrollbar: {
                    description: {
                        context: {
                            // override default value of the Matrix's scrollbar
                            scrollbarMarginFromViewEndGirth: [{ horizontalMarginAroundScrollbar: _ }, [embedding]]
                        }
                    }
                }
            },
            position: {
                attachTopToTagsViewPane: {
                    point1: {
                        element: [cond,
                            [{ showTagsViewPane: _ }, [me]],
                            o(
                                { on: true, use: [areaOfClass, "MinimizedFacetViewPaneTagsViewPane"] },
                                { on: false, use: [areaOfClass, "FSAppAddUDFacetControl"] }
                            )
                        ],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
                },
                bottom: 0,
                left: 0,
                right: 0,
                minHeightAtLeastOneMinimizedFacet: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    min: [{ minimizedFacetHeightPlusSpacing: _ }, [me]]
                }
            },
            write: {
                onMinimizedFacetsViewShowTagsViewPaneControlAction: {
                    upon: [{ showTagsViewPaneAction: _ }, [me]],
                    true: {
                        expandToShowMoreColumns: {
                            to: [{ nr_columns: _ }, [me]],
                            merge: o() // go to default width: see assignment of value to initial_nr_columns
                        }
                    }
                }
            }
        },
        {
            qualifier: { showTagsViewPane: true },
            context: {
                // so a double click on the MinimizedFacetViewPane left side, when the tagsViewPane is open, will switch to initNumFacetColumnsWhenTagsViewShowing
                // columns!
                initial_nr_columns: [{ tagConstants: { initNumFacetColumnsWhenTagsViewShowing: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { resizeHandleNeeded: true },
            children: {
                horizontalResizeHandle: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "MinimizedFacetViewPaneResizeHandle"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsDoc: o(
        { // default
            "class": o("GeneralArea", "Matrix"),
            context: {
                myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"],
                myScrollbar: [{ myScrollbar: _ }, [embedding]],
                // Matrix params:
                myMatrixCellUniqueIDs: [{ myApp: { facetDataCandidateMinimizedCreation: { uniqueID: _ } } }, [me]],
                all_data: [{ myApp: { reorderedFacetUniqueID: _ } }, [me]],
                cell_width: [{ myPaneContainer: { minimizedFacetViewPaneElementWidth: _ } }, [me]],
                cell_height: [{ myPaneContainer: { minimizedFacetViewPaneElementHeight: _ } }, [me]],
                horizontal_spacing: [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
                vertical_spacing: [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
                orderByRow: true, // override default Matrix value
                maintainHorizontalSpacingBetweenMatrixAndCells: true // override default value
            },
            position: {
                left: 0,
                right: scrollbarPosConst.widthOfScrollbar
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetViewPaneMinimizationControl: o(
        { // default
            "class": "HorizontalMinimizationControl",
            context: {
                leftSideBaseTriangle: false, // override default of HorizontalMinimizationControl
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { expandPane: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { facetEntityStrPlural: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                    [not, [{ horizontallyMinimized: _ }, [me]]] // the boolean for booleanStringFunc should be phrased in positive terms
                ]
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            position: {
                right: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
                verticallyCenterWithPaneTopPanel: {
                    point1: { type: "vertical-center" },
                    point2: {
                        element: [{ children: { topPanel: _ } }, [embedding]],
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            context: {
                tooltipPositionBasedOnPointer: true
            },
            position: {
                left: 0,
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsNumColumnsControl: {
        "class": o("MinimizedFacetsNumColumnsControlDesign", "AppControl", "MinWrapHorizontal"),
        context: {
            defaultWidth: false
        },
        position: {
            left: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
            verticallyCenterWithPaneTopPanel: {
                point1: { type: "vertical-center" },
                point2: {
                    element: [{ children: { topPanel: _ } }, [embedding]],
                    type: "vertical-center"
                },
                equals: 0
            }
        },
        children: {
            multipleColumnsIcon: {
                description: {
                    "class": "MinimizedFacetsNumColumnsControlIcon"
                }
            },
            incNumColumns: {
                description: {
                    "class": "MinimizedFacetsIncNumColumnsControl"
                }
            },
            decNumColumns: {
                description: {
                    "class": "MinimizedFacetsDecNumColumnsControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    MinimizedFacetsNumColumnsControlIcon: {
        "class": o("MinimizedFacetsNumColumnsControlIconDesign", "GeneralArea"),
        context: {
            numMinimizedFacetColumns: [{ nr_columns: _ }, [areaOfClass, "MinimizedFacetsView"]]
        },
        position: {
            left: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlMarginFromIcon: _ } }, [globalDefaults]]],
            top: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlMarginFromIcon: _ } }, [globalDefaults]]],
            bottom: 0,
            width: [plus,
                [plus,
                    [densityChoice, [{ fsAppPosConst: { minimizedFacetsNumColumnsControlIconBarHeight: _ } }, [globalDefaults]]], // also vertical spacing
                    1 // for good measure
                ],
                [mul,
                    2,
                    [densityChoice, [{ fsAppPosConst: { minimizedFacetsNumColumnsControlIconBarWidth: _ } }, [globalDefaults]]]
                ]
            ]
        },
        write: {
            onMinimizedFacetsNumColumnsControlIconClick: {
                "class": "OnMouseClick",
                true: {
                    setNumColumns: {
                        to: [{ numMinimizedFacetColumns: _ }, [me]],
                        merge: [{ initial_nr_columns: _ }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    // API:
    // 1. activeControl  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsNumColumnsControlCore: {
        "class": o("GeneralArea", "TooltipableControl"),
        context: {
            numMinimizedFacetColumns: [{ nr_columns: _ }, [areaOfClass, "MinimizedFacetsView"]],
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { increaseNumMinimizedFacetsColumns: _ } }, [globalDefaults]],
                "",
                [concatStr,
                    o(
                        /*[{ myApp: { minimizedStr: _ } }, [me]],
                        [{ myApp: { facetEntityStrPlural: _ } }, [me]],*/
                        [{ myApp: { columnEntityStrPlural: _ } }, [me]]
                    ),
                    " "
                ],
                // the other option is that this class is inherited by MinimizedFacetsIncNumColumnsControl
                ["MinimizedFacetsDecNumColumnsControl", [classOfArea, [me]]]
            ]
        },
        position: {
            attachToIconRight: {
                point1: {
                    element: [{ children: { multipleColumnsIcon: _ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            right: 0
        },
        write: {
            onMinimizedFacetsNumColumnsControlCoreClick: {
                upon: [and,
                    [{ activeControl: _ }, [me]],
                    mouseDoubleClickExpiredEvent // as we also have a different handler for doubleClick
                ]
            },
            onMinimizedFacetsNumColumnsControlCoreDoubleClick: {
                upon: [and,
                    [{ activeControl: _ }, [me]],
                    mouseDoubleClickEvent
                ]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsIncNumColumnsControl: {
        "class": o("MinimizedFacetsIncNumColumnsControlDesign", "MinimizedFacetsNumColumnsControlCore"),
        context: {
            maxNumColumns: [min,
                [floor,
                    [div,
                        [offset,
                            { element: [areaOfClass, "FrozenFacetViewPane"], type: "right" },
                            { element: [areaOfClass, "MinimizedFacetViewPane"], type: "left" }
                        ],
                        [plus,
                            [{ minimizedFacetViewPaneElementWidth: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            [{ horizontalSpacingOfMinimizedFacetViewPaneElements: _ }, [areaOfClass, "MinimizedFacetViewPane"]]
                        ]
                    ]
                ],
                [ceil,
                    [div,
                        [size, [{ myMatrixCellUniqueIDs: _ }, [areaOfClass, "MinimizedFacetsDoc"]]],
                        // the last row could be only partially in view, so we subtract one, to be on the safe side
                        [minus, [{ rowInDocOfBottomOfView: _ }, [areaOfClass, "MinimizedFacetsView"]], 1]
                    ]
                ]
            ],
            activeControl: [greaterThan,
                [{ maxNumColumns: _ }, [me]],
                [{ numMinimizedFacetColumns: _ }, [me]]
            ]
        },
        position: {
            top: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlCoreVerticalMargin: _ } }, [globalDefaults]]]
        },
        write: {
            onMinimizedFacetsNumColumnsControlCoreClick: {
                // upon: see MinimizedFacetsNumColumnsControlCore
                true: {
                    incrementNumColumns: {
                        to: [{ numMinimizedFacetColumns: _ }, [me]],
                        merge: [plus, [{ numMinimizedFacetColumns: _ }, [me]], 1]
                    }
                }
            },
            onMinimizedFacetsNumColumnsControlCoreDoubleClick: {
                // upon: see MinimizedFacetsNumColumnsControlCore,
                true: {
                    maximalNumberOfColumns: {
                        to: [{ numMinimizedFacetColumns: _ }, [me]],
                        merge: [{ maxNumColumns: _ }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetsDecNumColumnsControl: {
        "class": o("MinimizedFacetsDecNumColumnsControlDesign", "MinimizedFacetsNumColumnsControlCore"),
        context: {
            activeControl: [greaterThan,
                [{ numMinimizedFacetColumns: _ }, [me]],
                1
            ]
        },
        position: {
            bottom: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlCoreVerticalMargin: _ } }, [globalDefaults]]]
        },
        write: {
            onMinimizedFacetsNumColumnsControlCoreClick: {
                // upon: see MinimizedFacetsNumColumnsControlCore,
                true: {
                    decrementNumColumns: {
                        to: [{ numMinimizedFacetColumns: _ }, [me]],
                        merge: [minus, [{ numMinimizedFacetColumns: _ }, [me]], 1]
                    }
                }
            },
            onMinimizedFacetsNumColumnsControlCoreDoubleClick: {
                // upon: see MinimizedFacetsNumColumnsControlCore,
                true: {
                    minimalNumberOfColumns: {
                        to: [{ numMinimizedFacetColumns: _ }, [me]],
                        merge: 1
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetViewPaneResizeHandle: o(
        { // default
            "class": "AppMatrixElementLeftResizeHandle",
            context: {
                myMatrix: [areaOfClass, "MinimizedFacetsDoc"]
            },
            write: {
                // to distinguish between a drag-to-change-width operation, and a double-click to reset width:
                onMinimizedFacetViewPaneResizeHandleDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        resetMinimizedFacetViewPaneElementWidth: {
                            to: [{ minimizedFacetViewPaneElementWidth: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: o() // and the mergeWrite there will provide the default definition.
                        }
                    }
                }
            }
        },
        {
            qualifier: { tmd: true },
            write: {
                onMinimizedFacetViewPaneResizeHandleMouseUp: {
                    "class": "OnMouseUpNotMouseClick",
                    true: {
                        recordNewWidth: {
                            to: [{ minimizedFacetViewPaneElementWidth: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: [offset,
                                { element: [areaOfClass, "MinimizedFacetViewPane"], label: "leftOfMinimizedFacetWhenExpandingWidth" },
                                { element: [areaOfClass, "MinimizedFacetViewPane"], label: "rightOfMinimizedFacetWhenExpandingWidth" }
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedPaneIconDimension: {
        "class": "GeneralArea",
        context: {
            dimension: [densityChoice, bFSAppPosConst.minimizedPaneIconDimension]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FSAppAddUDFacetControl: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                horizontallyMinimized: [{ horizontallyMinimized: _ }, [areaOfClass, "MinimizedFacetViewPane"]]
            }
        },
        { // default
            "class": compileUDF ? o("FSAppAddUDFacetControlDesign", "AddUDFacetControl") :
                o("FSAppAddUDFacetControlDesign"),
            context: {
                myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"],
                tooltipText: [concatStr, o([{ myApp: { addStr: _ } }, [me]], " ", [{ myApp: { formulaEntityStr: _ } }, [me]], " ", [{ myApp: { facetEntityStr: _ } }, [me]])]
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "AppNewElementContainer",
            context: {
                labelText: [{ myApp: { formulaEntityStr: _ } }, [me]],
                buttonDimension: [{ myPaneContainer: { minimizedFacetViewPaneElementStandardHeight: _ } }, [me]],

                belowSearchBox: [lessThanOrEqual, [{ nr_columns: _ }, [areaOfClass, "MinimizedFacetsView"]], 1],
            },
            position: {
                width: [{ myPaneContainer: { virtualMinimizedFacetViewPaneElementWidth: _ } }, [me]]
            }
        },
        {
            qualifier: {
                horizontallyMinimized: false,
                belowSearchBox: true
            },
            position: {
                attachToSearchBoxBottom: {
                    point1: {
                        element: [areaOfClass, "MinimizedFacetViewPaneSearchBox"],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
                },
                left: [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
            }
        },
        {
            qualifier: {
                horizontallyMinimized: false,
                belowSearchBox: false
            },
            position: {
                attachToSearchBoxBottom: {
                    point1: {
                        element: [areaOfClass, "MinimizedFacetViewPaneSearchBox"],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                },
                attachLeftToSearchBoxRight: {
                    point1: {
                        element: [areaOfClass, "MinimizedFacetViewPaneSearchBox"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            "class": o("GeneralArea", "AppControl", "Icon", "MinimizedPaneIconDimension"),
            propagatePointerInArea: o(),
            position: {
                verticallyAligned: {
                    point1: {
                        element: [expressionOf, [me]],
                        type: "top"
                    },
                    point2: {
                        type: compileMinimizedFacets ? "vertical-center" : "top"
                    },
                    equals: compileMinimizedFacets ? 0 : 5
                },
                horizontallyAligned: {
                    point1: {
                        type: compileMinimizedFacets ? "horizontal-center" : "right"
                    },
                    point2: {
                        element: [expressionOf, [me]],
                        type: compileMinimizedFacets ? "horizontal-center" : "right"
                    },
                    equals: compileMinimizedFacets ? 0 : 5
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowFacetTagsViewControl: {
        "class": o("GeneralArea", "ShowTagsViewPaneControl"),
        context: {
            myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"],
            leftMargin: [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]]
        },
        position: {
            verticalCenterWithSearchBox: {
                point1: {
                    element: [areaOfClass, "MinimizedFacetViewPaneSearchBox"],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            },
            left: [{ leftMargin: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetViewPaneTagsViewPane: {
        "class": o("GeneralArea", "TagsViewPane", "TrackMyTagsController"),
        context: {
            myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"]
        },
        position: {
            left: [{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
            right: 0,//[{ myPaneContainer: { horizontalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
            attachTopToAddUDFControlBottom: {
                point1: {
                    element: [areaOfClass, "FSAppAddUDFacetControl"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ myPaneContainer: { verticalSpacingOfMinimizedFacetViewPaneElements: _ } }, [me]],
            },
            // bottom attached to MinimizedFacetsView - see there.
        },
        children: {
            tagsView: {
                description: {
                    "class": "ExpandableBottom",
                    context: {
                        initialExpandableHeight: [{ myPaneContainer: { tagsViewPaneInitialExpandableHeight: _ } }, [embedding]],
                        stableExpandableHeight: [{ myPaneContainer: { tagsViewPaneStableExpandableHeight: _ } }, [embedding]],
                        userExpandedVertically: [{ myPaneContainer: { tagsViewPaneUserExpandedVertically: _ } }, [embedding]],
                        userDoubleClickedVertically: [{ myPaneContainer: { tagsViewPaneUserDoubleClickedVertically: _ } }, [embedding]]
                    }
                }
            }
        }
    }
};
