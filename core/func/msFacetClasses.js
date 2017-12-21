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
// This library offers the multi-selection facet functionality. An ms facet consists of a set of discrete values. The user can include/exclude any of them. 
// Note that if inclusions and exclusions are combined, the effective meaning is determined by the inclusions only. 
// It makes extensive use of classes provided by the facetClasses.js and discreteFacetClasses.js libraries.
//
// Selections can be made by setting the selection mode to either inclusion (the default setting) or exclusion, and then selecting the ms values of interest.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <msFacetDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a multi-selection facet. 
    // This class is inherited by a variant of the Facet class. 
    //
    // It inherits:
    // 1. DiscreteFacet (Lean/Fat), which provides common functionality to the MS and Rating Facets.
    // 2. FacetWithSortableDiscreteValues
    //
    // It embeds (Lean/Fat):
    // 1. selectableFacetXIntOSRs (see FacetWithAmoeba documentation, via DiscreteFacet): this class provides the description object for these intersection areas.
    // 2. an MSAmoeba (when the facet is NOT in its summary state) (Lean/Fat).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSFacet: {
        "class": "FacetWithSortableDiscreteValues"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSFacet: o(
        { // default
            "class": o("MSFacet", "DiscreteFacet"),
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "LeanMSFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileMS ? "LeanMSAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSFacet: o(
        { // default
            "class": o("MSFacet", "DiscreteFacet"),
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "FatMSFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileMS ? "FatMSAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of MSFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of a MSFacet and an intensional OSR of an overlay that's in the expanded (or Maximized) state.
    // This class is inherited by the selectableFacetXIntOSRs intersections which are embedded in the MSFacet. 
    // It inherits the DiscreteFacetXIntOSR (Lean/Fat).
    // This class embeds a MSSelections class, which does the actual work of displaying/deleting/disabling the ms selections.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSFacetXIntOSR: o(
        { // default
            context: {
                selectionsOverflow: [greaterThan,
                    [size, [{ allDiscreteSelections: _ }, [me]]],
                    2
                ]
            }
        },
        { // default
            qualifier: {
                showTagsViewPane: false,
                selectionsMade: true
            },
            children: {
                selections: {
                    description: {
                        "class": "MSSelections"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyMSFacetXIntOSR: o(
        { // variant-controller 
            qualifier: "!",
            context: {
            }
        },
        { // default    
            "class": o("GeneralArea", "TrackMyFacetXIntOSR")
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSFacetXIntOSR: {
        "class": o("MSFacetXIntOSR", "LeanDiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSFacetXIntOSR: {
        "class": o("MSFacetXIntOSR", "FatDiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the MSFacetXIntOSR. It displays the ms selections for its facet/intensional overlay ancestors, and also allows their deletion/disabling.
    // It inherits FacetSelections.
    //
    // Embedding: 
    // If there are selections made, this area embeds an areaSet of MSSelections, each displaying a single selection made.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSelections: o(
        { // default
            "class": "FacetSelections",
            context: {
                // FacetSelections param:
                selections: [{ children: { selections: _ } }, [me]]
            }
        },
        {
            qualifier: { selectionsMade: true },
            context: {
                displayedSelections: [cond,
                    [{ displayAllSelections: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [pos,
                                r(0, 1),
                                [{ allDiscreteSelections: _ }, [me]]
                            ]
                        },
                        {
                            on: true,
                            use: [{ allDiscreteSelections: _ }, [me]]
                        }
                    )
                ]
            },
            children: {
                selections: {
                    // retrieve the list of included and excluded values. obtain from the *ordered* set of singleValue names the subset which corresponds to them.
                    data: [{ displayedSelections: _ }, [me]],
                    description: {
                        "class": "MSSelection"
                    }
                }
            }
        },
        {
            qualifier: { singleSelection: false }, // more than one selection was made
            position: {
                attachFirstSelectionToTop: {
                    point1: { type: "top" },
                    point2: {
                        element: [first, [{ selections: _ }, [me]]],
                        type: "top"
                    },
                    equals: [{ verticalMarginFromEdgeFacetSelections: _ }, [me]]
                }
            }
        },
        {
            qualifier: { selectionsFitInOSR: true },
            position: {
                attachSecondSelectionToBottom: {
                    point1: {
                        element: [next, // the second selection
                            [{ selections: _ }, [me]],
                            [first, [{ selections: _ }, [me]]]
                        ],
                        type: "bottom"
                    },
                    point2: { type: "bottom" },
                    equals: [{ verticalMarginFromEdgeFacetSelections: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single MS selection and is embedded as an areaSet in MSSelections class.
    // This class inherits TextualDiscreteSelection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSelection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                singleSelection: [{ singleSelection: _ }, [embedding]]
            }
        },
        { // default
            "class": o("MSSelectionDesign", "TextualDiscreteSelection"),
            context: {
                // TextualDiscreteSelection param:
                areaOS: [{ children: { selections: _ } }, [embedding]]
            }
        },
        {
            qualifier: { singleSelection: true },
            position: {
                "vertical-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of MSFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Amoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an ms amoeba. It inherits DiscreteAmoeba (Lean/Fat).
    // This class embeds: the primary ms widget (Lean/Fat).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSAmoeba: {
        "class": "DiscreteAmoeba"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSAmoeba: {
        "class": "MSAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "LeanMSPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSAmoeba: {
        "class": "MSAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "FatMSPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an msWidget on the primary axis (currently: the vertical axis). It is embedded in the MSAmoeba.
    // This class inherits the MSWidget (Lean/Fat) and the DiscretePrimaryWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSPrimaryWidget: {
        "class": "DiscretePrimaryWidget"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSPrimaryWidget: {
        "class": o("MSPrimaryWidget", "LeanMSWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSPrimaryWidget: {
        "class": o("MSPrimaryWidget", "FatMSWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an MSidget on the secondary axis (the horizontal axis, currently). 
    // It inherits MSWidget and DiscreteSecondaryWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSecondaryWidget: {
        "class": o("DiscreteSecondaryWidget", "FatMSWidget") // the secondary widget is defined only for the Fat family of classes!
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an ms widget.
    // An ms widget is the container that displays all possible values for an ms facet, allows to select (include/exclude) for the different intensional overlays, and displays the 
    // projection of the extensional overlays on its associated facet. 
    //
    // It is inherited by the MSPrimaryWidget/MSSecondaryWidget, which inherit DiscretePrimaryWidget/DiscreteSecondaryWidget (which in turn inherit DiscreteWidget).
    // It inherits MSSortable (Fat): 
    // the default sorting is by the ms single value names, which are represented by the MSWidget (the other sorting options are the MSPermOverlayXWidget which represent the intensional 
    // overlays).
    //
    // Embeds: 
    // 1. values: an areaSet of single ms values, whose data is obtained from the associated facet.
    // 2. permOverlayXWidgets: an areaSet of MSPermOverlayXWidget (Lean/Fat), each representing a single overlay that's showing. The data for this areaSet is provided by the Widget class, 
    //    inherited by the sibling primaryWidget/secondaryWidget.    
    // 3. the sorter (Fat) which can be used to sort by the single value names (the sorters for sorting by the selections in each one of the intensional overlays on showing (represented
    //    by an MSPermOverlayXWidget) is embedded in the latter.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedSearchBox: [greaterThan,
                    [size, [{ myFacet: { values: _ } }, [me]]],
                    fsAppConstants.thresholdNrUniqueMSValuesForSearchbox
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MSSortable"),
            context: {
                // MSSortable params:
                sortableUniqueID: "value"
            },
            children: {
                permOverlayXWidgets: {
                    // data: provided by Widget, inherited by PrimaryWidget/SecondaryWidget, the two possible sibling classes
                    description: {
                        "class": "MSPermOverlayXWidget"
                    }
                },
                valueNameSorter: {
                    description: {
                        "class": "MSValueNameSorter"
                    }
                }
            }
        },
        {
            qualifier: { embedSearchBox: true },
            children: {
                msValuesViewSearchBox: {
                    description: {
                        "class": "MSValuesViewSearchBox"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSWidget: {
        "class": "MSWidget",
        children: {
            valuesView: {
                description: {
                    "class": "LeanMSValuesView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSWidget: {
        "class": "MSWidget",
        children: {
            valuesView: {
                description: {
                    "class": "FatMSValuesView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValuesView: {
        "class": "DiscreteValuesView",
        context: {
            mySearchBox: [
                { myWidget: [{ myWidget: _ }, [me]] },
                [areaOfClass, "MSValuesViewSearchBox"]
            ],
            movablesUniqueIDs: [ // override DiscreteValuesView default definition
                s([{ mySearchBox: { currentSearchStr: _ } }, [me]]),
                [{ myFacet: { values: _ } }, [me]]
            ],

            allDataJITSnappableVisReorderable: [ // override DiscreteValuesView default definition
                s([{ mySearchBox: { currentSearchStr: _ } }, [me]]),
                [{ myFacet: { values: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSValuesView: {
        "class": "MSValuesView",
        children: {
            values: {
                // data: provided by DiscreteValuesView
                description: {
                    "class": "LeanMSValue"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSValuesView: {
        "class": "MSValuesView",
        children: {
            values: {
                // data: provided by DiscreteValuesView
                description: {
                    "class": "FatMSValue"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValuesViewSearchBox: o(
        { // default
            "class": o("MSValuesViewSearchBoxDesign", "GeneralArea", "SearchBox", "TrackMyWidget"),
            context: {
                myValueNameSorter: [
                    { myWidget: [{ myWidget: _ }, [me]] },
                    [areaOfClass, "MSValueNameSorter"]
                ],
                myDiscreteValueNamesExpandableArea: [
                    { myWidget: [{ myWidget: _ }, [me]] },
                    [areaOfClass, "DiscreteValueNamesExpandableArea"]
                ],

                // SearchBox params                
                searchStr: [mergeWrite,
                    // minimized facet searchbox is view-specific
                    [{ myWidget: { currentViewWidgetDataObj: { msValuesViewSearchBox: _ } } }, [me]],
                    o()
                ],

                placeholderInputText: [concatStr,
                    o(
                        [{ myApp: { searchStr: _ } }, [me]],
                        [{ myApp: { valueEntityStrPlural: _ } }, [me]]
                    ),
                    " "
                ],
                showSearchControl: false,
                realtimeSearch: true,
                initExpandedSearchBox: false,
                enableMinimization: true,
                searchBoxHeight: [densityChoice, [{ discretePosConst: { defaultHeightOfDiscreteValue: _ } }, [globalDefaults]]],
                searchBoxTextSize: [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]]
                // searchBoxWidth: not specified. see positioning object below, instead.
            },
            position: {
                attachLeftToMyValueNameSorterRight: {
                    point1: {
                        element: [{ myValueNameSorter: _ }, [me]],
                        type: "right"
                    },
                    point2: { type: "left" },
                    equals: [{ msPosConst: { horizontalMarginAroundWidgetControls: _ } }, [globalDefaults]]
                },
                verticallyCenterWithMSValueNameSorter: {
                    point1: {
                        element: [{ myValueNameSorter: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: { type: "vertical-center" },
                    equals: 0
                },
                rightConstraintOfMSValuesViewSearchBox: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myDiscreteValueNamesExpandableArea: _ }, [me]],
                        type: "right"
                    }
                }
            }
        },
        {
            qualifier: { expandedSearchBox: false },
            position: {
                rightConstraintOfMSValuesViewSearchBox: {
                    // point1/point2: see default clause
                    min: 0
                }
            }
        },
        {
            qualifier: { expandedSearchBox: true },
            position: {
                rightConstraintOfMSValuesViewSearchBox: {
                    // point1/point2: see default clause
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to sort by different elements in an ms widget: either by the ms values, or by the selections in the intensional overlays showing.
    // It is inherited by the MSWidget (to allow sorting by the ms values) and by the MSPermOverlayXWidgets of intensional overlays (to allow sorting by their selections).
    // This class inherits Sortable, for which we define its mySortingController: the associated ms facet.
    //
    // API:
    // 1. myFacet: areaRef of associated facet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSortable: {
        "class": "Sortable",
        context: {
            mySortingController: [{ myFacet: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the sorting control/display for the sortable ms elements.
    // It is inherited by MSValueNameSorter and by OverlayXHistogramSorter.
    // 
    // This class inherits:
    // 1. SorterUXDisplay: for the display used to indicate the sorting selected, and to allow its modification.
    // 2. TrackMyWidget
    //
    // API:
    // 1. Inheriting classes provide it with its positioning. 
    // 2. mySorterUX (SorterUXDisplay's API)
    // 3. mySortable
    // 4. myWidget
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSorter: {
        "class": o(
            "SorterUX",
            "SorterUXDisplay"),
        context: {
            myValuesView: [
                { myWidget: [{ myWidget: _ }, [me]] },
                [areaOfClass, "MSValuesView"]
            ]
        },
        write: {
            onSorterUXSortingEvent: {
                // see Sorter UX
                true: {
                    resetMSValuesView: {
                        to: [{ myValuesView: { specifiedFiVUniqueID: _ } }, [me]],
                        merge: [{ myValuesView: { defaultSpecifiedFiVUniqueID: _ } }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the sorter that allows sorting alphabetically by the msWidget's single values.
    // It inherits MSSorter, and is embedded in the MSWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValueNameSorter: o(
        { // variant-controller
            qualifier: "!",
            context: {
                explicitlySortedByOverlay: [{ mySortingController: { explicitlySortedByOverlay: _ } }, [me]]
            }
        },
        { // default
            "class": o("MSValueNameSorterDesign", "MSSorter", "TrackMyWidget"),
            context: {
                // MSSorter param
                mySortable: [{ myWidget: _ }, [me]]
            },
            position: {
                attachToValuesViewOnLengthAxis: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ myValuesView: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [densityChoice, [{ msPosConst: { sorterMarginAboveValuesView: _ } }, [globalDefaults]]]
                },
                attachToMSValuesViewBeginningGirth: {
                    point1: {
                        element: [{ myValuesView: _ }, [me]],
                        type: [{ beginningGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ beginningGirth: _ }, [me]]
                    },
                    equals: [mul,
                        [{ msPosConst: { horizontalMarginAroundWidgetControls: _ } }, [globalDefaults]],
                        [cond,
                            [{ ofVerticalElement: _ }, [me]],
                            o(
                                { on: true, use: 1 },
                                { on: false, use: -1 }
                            )
                        ]
                    ]
                }
            }
        },
        {
            qualifier: { explicitlySortedByOverlay: true },
            context: {
                sortingEvent: o(
                    [{ defaultSortingEvent: _ }, [me]],
                    // if we sort by overlay frequency in one of the histograms, and then either that overlay or histogram are deleted, 
                    // the msValue names should become the explicit sorting.
                    [not, [{ mySortingController: { explicitlySortedOverlayMeasurePairInFacetProperlyDefined: _ } }, [me]]]
                )
            },
            write: {
                onSorterUXSortingEvent: {
                    // upon: see SorterUX
                    true: {
                        // when we sort by values, there is no meaning to myMeasurePairInFacetUniqueID, which is the histogram ID in the sort key
                        // previously stored when we were sorted by overlay (remember: we're in the variant that's true because we came from overlay freq. sorting)
                        clearHistogramID: {
                            to: [{ mySortingController: { latestSortingKey: { myMeasurePairInFacetUniqueID: _ } } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single ms value, inherited by the values areaSet in the MSWidget class. There's a single ms value for each value that appears in the compressed 
    // projection of the items db on the associated facet.
    // It inherits MSValue (Lean/Fat), and DiscreteValue.
    // 
    // It embeds:
    // 1. MSValueName: which displays the actual name of this single value (e.g. "NYSE")
    // 2. PermOverlayMSValue: these are areas formed by the intersection of this class with the DiscretePermOverlayXWidget
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValue: o(
        { // default
            "class": o("MSValueDesign", "DiscreteValue"),
            children: {
                valueName: {
                    description: {
                        "class": "MSValueName"
                    }
                },
                permOverlayXDiscreteValues: {
                    // partner: provided by DiscreteValue
                    description: {
                        "class": "PermOverlayMSValue"
                    }
                }
            }
        },
        {
            qualifier: { ofPrimaryWidget: false },
            position: {
                "content-width": [displayWidth]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanMSValue: {
        "class": "MSValue"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSValue: {
        "class": "MSValue"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the actual name of a single ms value. it is embedded in the MSValue. It inherits DiscreteValueName.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValueName: {
        "class": "DiscreteValueName"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent overlay in an MSWidget.
    // It inherits DiscretePermOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSPermOverlayXWidget: {
        "class": "DiscretePermOverlayXWidget",
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an intersection formed by MSValue and MSPermOverlayXWidget (of the latter, there's one per zoomboxed permanent overlay in the Showing state).
    // It inherits PermOverlayDiscreteValue.
    // When representing an extensional overlay, the inherited PermOverlayDiscreteValue provides the needed functionality.
    // When representing an intensional overlay, this class inherits MSAddToSelections and PermIntOverlayDiscreteValue.
    //
    // This class provides the write handler for the addition of an unselected value to the relevant ms selection (whether included/excluded). This is one meaningful way in which 
    // we differ from the RatingFacet - we add to the selections only the value that pertains to the area clicked on, and not that value-or-better.
    // API:
    // 1. addToSelectionsData: the writable reference in the content of its myOverlayXWidget
    // 2. amISelected: true if either included or excluded, false otherwise.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayMSValue: o(
        { // default
            "class": "PermOverlayDiscreteValue"
        },
        // the variant for the extensional overlay is included in the inherited PermOverlayDiscreteValue
        {
            qualifier: { ofIntOverlay: true },
            "class": "PermIntOverlayMSValue"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntOverlayMSValue: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enableMSSelectionsDownToHere: [arg, "enableMSSelectionsDownToHere", true]
            }
        },
        { // default        
            "class": o("MoreControlsController", "PermIntOverlayDiscreteValue"),
        },
        {
            qualifier: { amISelected: false },
            "class": "MoreControlsOnHoverUX",
            context: {
                myMoreControlsController: [me]
            },
            write: {
                onMSAddToSelectionsOnMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        addValueToSelectionsData: {
                            to: [{ addToSelectionsData: _ }, [me]],
                            merge: push([{ value: _ }, [me]])
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                enableMSSelectionsDownToHere: true,
                moreControlsOpen: true
            },
            context: {
                valuesDownToHere: [pos,
                    r( // take all sorted values from my facet, from the very first one, down to the one representing my value
                        0,
                        [index, // the index of "value" in my facet's sorted list of values
                            [{ myFacet: { values: _ } }, [me]],
                            [{ value: _ }, [me]]
                        ]
                    ),
                    [{ myFacet: { values: _ } }, [me]]
                ]
            },
            children: {
                selectDownToHereMenu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SelectDownToMSValueMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectDownToMSValueMenu: {
        "class": o("GeneralArea", "Menu"),
        context: {
            menuDefaultToLeft: false
        },
        children: {
            menuItems: {
                data: o( // a single control for the time being
                    {
                        uniqueID: "selectDownToHereControl",
                        displayText: [{ myApp: { selectDownToHereText: _ } }, [me]]
                    }
                ),
                description: {
                    "class": "SelectDownToMSValueMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectDownToMSValueMenuItem: o(
        { // default
            "class": o("GeneralArea", "MenuItemDirect")
        },
        {
            qualifier: { uniqueID: "selectDownToHereControl" },
            write: {
                onSelectDownToMSValueMenuItemMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        selectValuesDownToMyDiscreteValue: {
                            to: [{ myMenuAnchor: { addToSelectionsData: _ } }, [me]],
                            merge: [{ myMenuAnchor: { valuesDownToHere: _ } }, [me]]
                        },
                        // when values A, B, C, D have, for example, C excluded, and now we include A-D, we need to remove C from the list of excluded values
                        removeValuesDownToMYDiscreteValueIfSelectedInOtherMode: {
                            to: [{ myMenuAnchor: { removeFromSelectionsData: _ } }, [me]],
                            merge: [
                                n([{ myMenuAnchor: { valuesDownToHere: _ } }, [me]]),
                                [{ myMenuAnchor: { removeFromSelectionsData: _ } }, [me]]
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Amoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // See documentation for DiscreteFacetXIntOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSFacetXIntOverlay: {
        "class": "DiscreteFacetXIntOverlay"
    }
};
