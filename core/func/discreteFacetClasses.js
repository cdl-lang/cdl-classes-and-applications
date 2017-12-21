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
// This library contains common code to the MSFacetClasses and the RatingFacetClasses. It makes extensive use of classes provided by the facetClasses.js library.
// A discrete facet is one which offers the user the ability to include or exclude out of a set of discrete values. 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <discreteFacetDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. allDiscreteValues: used to initialized valueUserSorting, an appData. Note *all* means it is all discrete values, and also the no-value
    // 2. sortedMeaningfulDiscreteValues: non-numerical strings found in this facet in the item db. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetWithDiscreteValues: o(
        { // default
            context: {
                valueUserSorting: [mergeWrite,
                    [{ currentViewFacetDataObj: { valueUserSorting: _ } }, [me]],
                    [{ allDiscreteValues: _ }, [me]] // note: this is sorted "ascending"!
                ],
                meaningfulValueObjs: [map,
                    [defun,
                        o("val"),
                        [using,
                            "selectionQuery",
                            [[{ facetSelectionQueryFunc: _ }, [me]], // construct a query of the form { "quality": "good" }
                                "val"
                            ],
                            {
                                value: "val",
                                selectionQuery: "selectionQuery",
                                effectiveBaseItemCount: [size,
                                    [
                                        "selectionQuery",
                                        [{ myApp: { effectiveBaseOverlay: { unsortedSolutionSetItems: _ } } }, [me]]
                                    ]
                                ]
                            }
                        ]
                    ],
                    [{ sortedMeaningfulDiscreteValues: _ }, [me]]
                ],
                valueObjs: o(
                    [{ meaningfulValueObjs: _ }, [me]],
                    // if noValue is true, then add an obj for the noValue selection
                    [cond,
                        [{ noValue: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: {
                                    value: [{ noValueStr: _ }, [me]],
                                    selectionQuery: [{ myFacet: { noValueSelection: _ } }, [me]],
                                    effectiveBaseItemCount: [size,
                                        [
                                            [{ myFacet: { noValueSelection: _ } }, [me]],
                                            [{ myApp: { effectiveBaseOverlay: { unsortedSolutionSetItems: _ } } }, [me]]
                                        ]
                                    ]
                                }

                            }
                        )
                    ]
                )
            }
        },
        {
            qualifier: { minimized: false },
            context: {
                mySelectableFacetXIntOverlays: [
                    { myFacet: [me] },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                myDiscreteValues: [
                    { myFacet: [me] },
                    [areaOfClass, "DiscreteValue"]
                ],
                valueNameObjs: [{ children: { valueNameObjs: { obj: _ } } }, [me]]
            },
            children: {
                // an areaSet that will help produce an os of objects which contain the discrete value and its string representation
                valueNameObjs: {
                    data: [_,
                        o(
                            [{ mySelectableFacetXIntOverlays: { includedForDisplay: _ } }, [me]],
                            [{ mySelectableFacetXIntOverlays: { excludedForDisplay: _ } }, [me]],
                            [{ value: _ }, [{ myDiscreteValues: { inView: true } }, [me]]]
                        )
                    ],
                    description: {
                        "class": "DiscreteValueNameObj"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SortingController, which allows sorting of all associated ms values (in the associated widgets as well as in the FacetSelections).
    // sorting can be done alphabetically (by the value names) or by the selections made to any of the intensional overlays on Show.
    // The sorting applies to all the widgets pertaining to this facet (both its primaryAxis msWidget, and any other instances of its widgets which may be 
    // functioning as secondary widgets in other facets), as well as to its DiscreteSelections. 
    //
    // API:
    // 1. Assumes the inheriting area also inherits FacetWithDiscreteValues
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetWithSortableDiscreteValues: o(
        { // variant-controller
            qualifier: "!",
            context: {
                sortingByValues: [equal, // either when explicitly sorting by values
                    "value",
                    [{ latestSortingSortableUniqueID: _ }, [me]]
                ]
            }
        },
        { // default
            "class": "SortingController", // to control the sorting within a DiscreteFacet's amoeba!
            context: {
                // SortingController param:
                singleLayerSorting: true, // override default value - a single layer of sorting in the ms facet!
                defaultSortableUniqueID: "value",
                sortBySpecifiedKeyEvenWhenNotShowing: true,
                
                // storing in the currentView the sorting of the discrete values (note for now that the primaryWidget's sortingKey is synonymous with the
                // sorting key stored in the Facet (used, for example, even if there is no amoeba/widget showing, to sort the selected DiscreteValues).
                // if/when we have DiscreteWidgets as SecondaryWidgets, then we may want to have them store their own sortingKey, which would be separate
                // from the primaryWidget's sortingKey. we should then probably store it in the currentViewWidgetDataObj.
                specifiedSortingKey: [mergeWrite,
                    [{ currentViewFacetDataObj: { primaryWidgetSortingKey: _ } }, [me]],
                    [{ defaultSortingKey: _ }, [me]]
                ],
                "*selectionsChangedWhileSortingByOverlayFrequency": false,

                // And now, this facet's participation in the sorting of SolutionSetItems, sorting that's managed by FSApp
                // (which in turn inherits SortingController). This is not to be confused with the sorting of the DiscreteFacet's amoeba!
                // The App-level sorting of SolutionSetItems reqires a sort function: we override the default sort function provided in the Facet class.
                // Instead of passing it something like { "exchange": "descending" }, we pass a specific key, like { "exchange": o("NYSE", "NASDAQ") }
                // and that is what we sort by.
                sortKey: [
                    [{ facetSelectionQueryFunc: _ }, [me]],
                    c(
                        [map,
                            [defun, "value", c("value")],
                            [{ values: _ }, [me]]
                        ],
                        [{ sortingDirection: _ }, [me]]
                    )
                ],
                // see sortingByValues: false below. doesn't appear in that variant but here, as a click on OverlayXHistogramSorter writes to this AD
                // and it is that same click that switches this faet to sortingByValues: false.
                includedOnLastSort: [{ crossViewFacetDataObj: { includedOnLastSort: _ } }, [me]],
                excludedOnLastSort: [{ crossViewFacetDataObj: { excludedOnLastSort: _ } }, [me]],

                myMeasurePairsInFacet: [{ children: { measures: _ } }, [me]],
                latestSortingMeasurePairInFacetUniqueID: [mergeWrite,
                    [{ specifiedSortingKey: { myMeasurePairInFacetUniqueID: _ } }, [me]],
                    fsAppConstants.firstHistogramUniqueIDCounter
                ],                
                explicitlySortedByOverlay: [and,
                    [{ latestSortingSortableUniqueID: _ }, [me]],
                    [notEqual,
                        "value",
                        [{ latestSortingSortableUniqueID: _ }, [me]]
                    ]
                ],
                myOverlay: [ // defined only if latestSortingSortableUniqueID is defined, obviously
                    { uniqueID: [{ latestSortingSortableUniqueID: _ }, [me]] },
                    [areaOfClass, "PermOverlay"]
                ],

                // an OverlayMeasurePairInFacet exists only if both its overlay and its histogram (remember: the measurePairInFacetUniqueID matches the
                // histogram uniqueID) both exist (in the case of the overlay: is not trashed)
                explicitlySortedOverlayMeasurePairInFacetProperlyDefined: [
                    {
                        myFacet: [me],
                        myOverlay: [{ myOverlay: _ }, [me]],
                        myMeasurePairInFacetUniqueID: [{ latestSortingMeasurePairInFacetUniqueID: _ }, [me]]
                    },
                    [areaOfClass, "OverlayMeasurePairInFacet"]
                ]
            },
            write: {
                onFacetWithSortableDiscreteValuesChangeSpecifiedSortingKey: {
                    upon: [changed, [{ specifiedSortingKey: _ }, [me]]],
                    true: {
                        resetSelectionsChangedWhileSortingByOverlayFrequency: {
                            to: [{ selectionsChangedWhileSortingByOverlayFrequency: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { sortingByValues: true },
            context: {
                // set of ordered keys (names of bins)
                values: [sort, [{ allDiscreteValues: _ }, [me]], [{ sortingByValuesKey: _ }, [me]]]
            }
        },
        {
            qualifier: {
                sortingByValues: true,
                latestSortingDirection: "ascending"
            },
            context: {
                sortingByValuesKey: [{ valueUserSorting: _ }, [me]]
            }
        },
        {
            qualifier: {
                sortingByValues: true,
                latestSortingDirection: "descending"
            },
            context: {
                sortingByValuesKey: [reverse, [{ valueUserSorting: _ }, [me]]]
            }
        },
        { // variant handling the sorting of values by one of the overlays and one of the histograms
            qualifier: { sortingByValues: false },
            context: {
                valueMeasure: [{ explicitlySortedOverlayMeasurePairInFacetProperlyDefined: { valueMeasure: _ } }, [me]],
                valuesSortedByImplicit1DSelection: [
                    { value: _ },
                    [sort,
                        [{ valueMeasure: _ }, [me]],
                        c({ valInImplicit1DSetItemMeasureVal: _ }, [{ latestSortingDirection: _ }, [me]])
                    ]
                ],

                // each time the user clicks on a OverlayXHistogramSorter, we write the current selections to includedOnLastSort/excludedOnLastSort
                values: [sort,
                    [{ valuesSortedByImplicit1DSelection: _ }, [me]],
                    c(
                        [{ includedOnLastSort: _ }, [me]],
                        unmatched,
                        [{ excludedOnLastSort: _ }, [me]]
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherited by DiscreteFacet, but also by a DiscreteFacetXIntOverlay, as it needs to be support the associated overlays' display of 
    // selections (as a tooltip, when hovering over the overlay name).
    // For DiscreteFacetXIntOverlay, we take the sorted AD as meaningfulDiscreteValues, as we're too stingy 
    // 
    // API:
    // 1. meaningfulDiscreteValues
    // 2. noValue: a string representing the noValue.
    //    note that DiscreteFacet may set this value to o(), to avoid generating a No Value msValue if there are indeed no missing values in the data.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AllDiscreteValuesInFacet: o(
        { // default
            context: {
                // we define these context labels here, and not in the DiscreteFacet class (which is inherited only by an ExpandedFacet)
                // the author can provide predefined values for this facet in its facet data object
                // in the absence of [{ dataObj: { values:_ } }, [me]], it is the alphabetical sorting of the *globalBase* 
                // (this is a sensitive point: we refer to the compressedGlobalBaseValues, and not to the effectiveBaseOverlay's solutionSet,
                // both because we in fact want the globalBase, and not merely the (likely to change) effectiveBase, but also because this value is
                // guaranteed to be available when valueUserSorting herein is initialized)              
                // note: the user can later write to valueUserSorting in run time.
                sortedMeaningfulDiscreteValues: [cond, // also a FacetWithSortableDiscreteValues param
                    [{ myFacetDataObj: { values: _ } }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ myFacetDataObj: { values: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: [cond,
                                [detectDataType,
                                    [{ meaningfulDiscreteValues: _ }, [me]]
                                ],
                                o(
                                    {
                                        on: "weekDays",
                                        use: [sortByWeekDays,
                                            [{ meaningfulDiscreteValues: _ }, [me]]
                                        ]
                                    },
                                    {
                                        on: "months",
                                        use: [sortByMonths,
                                            [{ meaningfulDiscreteValues: _ }, [me]]
                                        ]

                                    },
                                    {
                                        on: null,
                                        use: [sort, [{ meaningfulDiscreteValues: _ }, [me]], "ascending"]
                                    }
                                )
                            ]
                        }
                    )
                ],
                allDiscreteValues: o( // also a FacetWithDiscreteValues param
                    [{ sortedMeaningfulDiscreteValues: _ }, [me]],
                    [{ noValue: _ }, [me]]
                ),

                //ignoreEffectiveBaseValues: [{ uDFCalculatesTextualValue:_ }, [me]] // observed by DiscreteValueNameDesign
            }
        },
        {
            qualifier: { uDFCalculatesQuarter: true },
            context: {
                sortedMeaningfulDiscreteValues: [sequence, r(1, 4)]
            }
        },
        {
            qualifier: { uDFCalculatesMonth: true },
            context: {
                sortedMeaningfulDiscreteValues: [sequence, r(1, 12)],
            }
        },
        {
            qualifier: { uDFCalculatesWeekDay: true },
            context: {
                sortedMeaningfulDiscreteValues: [sequence, r(1, 7)],
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteFacet: {
        "class": o("AllDiscreteValuesInFacet", "FacetWithDiscreteValues", "FacetWithAmoeba"),
        context: {
            meaningfulDiscreteValues: [{ compressedGlobalBaseValues: _ }, [me]],
            // FacetWithAmoeba's API (per the API of its embedded OverlayMeasurePairInFacet)
            valuesForMeasure: [{ allDiscreteValues: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class produces from a value (either a terminal or a r()) an object containing that value and its string representation.
    // The string representation is either automatically generated from the r(), or provided by the user in the configuration file.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValueNameObj: o(
        { // variant-controller
            qualifier: "!",
            context: {
                isValObj: [{ param: { areaSetContent: { val: _ } } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyFacet"),
            context: {
                obj: {
                    value: [{ value: _ }, [me]],
                    name: [{ name: _ }, [me]]
                }
            }
        },
        // the hack to handle "discrete sliders" where the facet definition may include a range of values.
        // in that case, the value should be obtained from an object of the form { val: <val>, name: <name> }.
        // otherwise, it's a terminal, and should be used directly
        {
            qualifier: { isValObj: true },
            context: {
                value: [{ param: { areaSetContent: { val: _ } } }, [me]],
                name: [{ param: { areaSetContent: { name: _ } } }, [me]]
            }
        },
        {
            qualifier: { isValObj: false },
            context: {
                value: [{ param: { areaSetContent: _ } }, [me]],
                isValRange: [and, // in the absence of a [typeOf] to check whether it's a range (r())
                    [equal, [size, [{ value: _ }, [me]]], 1],
                    [notEqual, [min, [{ value: _ }, [me]]], [max, [{ value: _ }, [me]]]]
                ]
            }
        },
        {
            qualifier: {
                isValObj: false,
                isValRange: false
            },
            context: {
                name: [min, [{ value: _ }, [me]]] // the [min] takes care of the unlikely case of r(x,x), in which case isValRange: false
            }
        },
        {
            qualifier: {
                isValObj: false,
                isValRange: true
            },
            context: {
                minValue: [min, [{ value: _ }, [me]]],
                maxValue: [max, [{ value: _ }, [me]]],
                name: [cond,
                    [equal, [{ maxValue: _ }, [me]], Number.POSITIVE_INFINITY],
                    o(
                        {
                            on: true,
                            use: [concatStr, o(">= ", [{ minValue: _ }, [me]])]
                        },
                        {
                            on: false,
                            use: [cond,
                                [equal, [{ minValue: _ }, [me]], Number.NEGATIVE_INFINITY],
                                o(
                                    { on: true, use: [concatStr, o("<= ", [{ maxValue: _ }, [me]])] },
                                    { on: false, use: [concatStr, o([{ minValue: _ }, [me]], " - ", [{ maxValue: _ }, [me]])] }
                                )
                            ]
                        }
                    )
                ]
            }
        },
        {
            qualifier: {
                isValObj: false,
                isValRange: false, // to make sure this is more specific than the variant above, that way we're not dependent on order of variants in cdl.
                ofUDFCalculatesQuarter: true
            },
            context: {
                name: [convertNumToQuarter, [{ value: _ }, [me]]]
            }
        },
        {
            qualifier: {
                isValObj: false,
                isValRange: false, // to make sure this is more specific than the variant above, that way we're not dependent on order of variants in cdl.
                ofUDFCalculatesMonth: true
            },
            context: {
                name: [convertNumToMonth, [{ value: _ }, [me]]]
            }
        },
        {
            qualifier: {
                isValObj: false,
                isValRange: false, // to make sure this is more specific than the variant above, that way we're not dependent on order of variants in cdl.
                ofDFCalculatesWeekDay: true
            },
            context: {
                name: [convertNumToWeekDay, [{ value: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DiscreteFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of a non-minimized DiscreteFacet and an intensional OSR of an overlay that's in the Standard (or Maximized) state.
    // This class is inherited by the selectableFacetXIntOSRs intersections which are embedded in the DiscreteFacet. 
    // It inherits the NonOMFacetXIntOSR (Lean/Fat), and is inherited by MSFacetXIntOSR and RatingFacetXIntOSR.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteFacetXIntOSR: {
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanDiscreteFacetXIntOSR: {
        "class": o("LeanNonOMFacetXIntOSR", "DiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatDiscreteFacetXIntOSR: {
        "class": o("FatNonOMFacetXIntOSR", "DiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays a single discrete selection as it appears in the embedding MSSelections/RatingSelections, at the intersection of the ancestor facet and ancestor OSR.
    // When hovered over, it allows for its deletion (using a SelectionDeleteControl).
    // It is inherited by MSSelection/RatingSelection, which are embedded in MSSelections/RatingSelections, respectively. It inherits FacetSelection.
    // 
    // This class provides the handler for the Delete msg, which is called when the associated SelectionDeleteControl is clicked.
    // 
    // The valueAsText variant controller: If true, it displays the val context label (true, by default). Inheriting classes (see RatingSelection) may override, in order to display
    // a visual element instead.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteSelection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // true if in the list of those included, false if in the list of excluded
                included: [
                    [{ logicalVal: _ }, [me]],
                    [{ myFacetXIntOSR: { content: { included: _ } } }, [me]]
                ],
                valueAsText: true
            }
        },
        { // default
            "class": o("FacetSelection", "MemberOfAreaOS"),
            context: {
                val: [{ param: { areaSetContent: _ } }, [me]],

                logicalVal: [cond,
                    [equal, [{ myFacet: { noValueStr: _ } }, [me]], [{ val: _ }, [me]]],
                    o(
                        { on: false, use: [{ val: _ }, [me]] },
                        { on: true, use: [{ myApp: { noValueExpression: _ } }, [me]] }
                    )
                ]
            },
            write: {
                onDiscreteSelectionDelete: {
                    upon: [{ msgType: "Delete" }, [myMessage]],
                    true: {
                        removeFromSelections: {
                            to: [
                                [{ logicalVal: _ }, [me]],
                                [{ selectionsData: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { included: true },
            context: {
                selectionsData: [{ myFacetXIntOSR: { stableSelectionsObj: { included: _ } } }, [me]]
            }
        },
        {
            qualifier: { included: false },
            context: {
                selectionsData: [{ myFacetXIntOSR: { stableSelectionsObj: { excluded: _ } } }, [me]]
            }
        },
        {
            qualifier: { valueAsText: true },
            "class": "DisplayDimension",
            context: {
                displayText: [
                    {
                        value: [{ val: _ }, [me]],
                        name: _
                    },
                    [{ myFacet: { valueNameObjs: _ } }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single textual discrete selection.
    // This class inherits DiscreteSelection. It is inherited by MSSelection and by the SliderNonNumericalSelection.
    //
    // API:
    // 1. areaOS: the name of the areaSet that this class pertains to (MemberOfTopToBottomAreaOS's API)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TextualDiscreteSelection: o(
        { // default
            "class": "DiscreteSelection",
            position: {
                attachMySelectionControlOnLeft: {
                    point1: {
                        element: [embedding],
                        type: "left"
                    },
                    point2: {
                        element: [{ mySelectionDeleteControl: _ }, [me]],
                        type: "left"
                    },
                    equals: bDiscretePosConst.deleteControlhorizontalMargin
                },
                attachMySelectionDeleteControlToMe: {
                    point1: {
                        element: [{ mySelectionDeleteControl: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bDiscretePosConst.deleteControlhorizontalMargin
                }
            }
        },
        {
            qualifier: { selectionsFitInOSR: false },
            "class": "MemberOfTopToBottomAreaOS"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DiscreteFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DiscreteAmoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete amoeba. It inherits Amoeba (Lean/Fat), and is inherited by MSAmoeba/RatingAmoeba.
    // This class embeds, in the appropriate facet state, a discrete histogram.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteAmoeba: o(
        { // default
            "class": "Amoeba"
        },
        {
            qualifier: { facetState: facetState.histogram },
            children: {
                histogramsViewContainer: {
                    description: {
                        "class": compileHistogram ? "DiscreteHistogramsViewContainer" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete widget. it is inherited by DiscretePrimaryWidget and DiscreteSecondaryWidget.
    //
    // API: 
    // 1. An embedded area called valuesView, which in turn embeds an areaSet called values, which inherit DiscreteValue.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                disableScrollbar: [
                    { myDiscreteValuesView: { disableScrollbar: _ } }, [me]
                ]
            }
        },
        { //default qualifier
            context: {
                // DiscreteWidget Param
                discreteValues: [{ children: { valuesView: { children: { values: _ } } } }, [me]],
                myDiscreteValuesView: [
                    [areaOfClass, "DiscreteValuesView"],
                    [embedded]
                ],

                // aux for inFullView and inPartialView
                discreteValuesInFullView: [sort,
                    [{ discreteValues: { inFullView: true } }, [me]],
                    { value: [{ myFacet: { values: _ } }, [me]] }
                ],

                firstDiscreteValueInFullView: [first, [{ discreteValuesInFullView: _ }, [me]]],
                lastDiscreteValueInFullView: [last, [{ discreteValuesInFullView: _ }, [me]]],
            }
        },
        {
            qualifier: { disableScrollbar: false },
            children: {
                discreteValuesScrollbar: {
                    description: {
                        "class": "DiscreteValuesScrollbar"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays the set of discrete values of the associated facet. 
    // It is inherited by MS/Rating versions, which are embedded in their respective Widget class.
    //
    // API:
    // 1. Inheriting class should provide an areaSet called values, of areas inheriting DiscreteValue.
    // 2. anchorForLowHTMLLength. default provided. If overridden, remember to use atomic().
    // 3. marginOnLowHTMLLength / marginOnHighHTMLLength: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValuesView: {
        // for now these are not JIT - in the horizontal axis, the discrete values won't necessarily be of equal width (because of variations in the lengthe of the 
        // valueName string) and so JIT is not possible for now (as it expects a constant dimension along the scrolling axis)
        // Note that even on the vertical axis the discrete value areas change their height (with the increase in the number of overlays, when displaying a 
        // histogram, for example): even though that doesn't preclude using JIT, it means that this parameter should be kept updated.
        "class": o("JITSnappableReorderableController", // we can settle for hte axis-agnostic class, because Horizontal/Vertical are inherited elsewhere
            "TrackMyWidget",
            "TrackMyFacet"),
        context: {
            anchorForLowHTMLLength: {
                element: [{ myWidget: _ }, [me]],
                label: "contentBeginning"
            },
            marginOnLowHTMLLength: [densityChoice, [{ fsAppPosConst: { marginBelowOverlayXWidgetMoreControls: _ } }, [globalDefaults]]],
            marginOnHighHTMLLength: bDiscretePosConst.bottomMarginOfDiscreteValuesView,

            myRightmostHistogramView: [ // there could be multiple HistogramViews in the widget!
                {
                    ofLastHistogram: true,
                    myFacet: [{ myFacet: _ }, [me]]
                },
                [areaOfClass, "HistogramView"]
            ],
            // SnappableReorderableController params
            // override default def of specifiedFiVUniqueID so that it is stored in the currentView
            specifiedFiVUniqueID: [{ myWidget: { currentViewWidgetDataObj: { discreteValuesViewFiVUniqueID: _ } } }, [me]],

            reordered: [{ myFacet: { valueUserSorting: _ } }, [me]],
            visReordered: [{ children: { values: _ } }, [me]],
            reorderingSpacing: bDiscretePosConst.valueLengthAxisSpacing, // (override default value of 0)
            movableUniqueIDAttr: "value",
            movablesUniqueIDs: [{ myFacet: { values: _ } }, [me]],
            lengthOfJITElement: [densityChoice, [{ discretePosConst: { defaultHeightOfDiscreteValue: _ } }, [globalDefaults]]],
            /* this attempt a dynamic lengthOfJITElement calculation resulted in loops and many headaches!
            myFirstDiscreteValue: [first, [{ children: { values:_ } }, [me]]], // a sample DiscreteValue, from which its height is derived for lengthOfJITElement                
            lengthOfJITElement: [offset, // this way, if the DiscreteValue height changes (e.g. when increasing the number of HistogramBars on display)
                                // this value will get updated
                                { element: [{ myFirstDiscreteValue:_ }, [me]], type: [{ lowHTMLLength:_ }, [me]] },
                                { element: [{ myFirstDiscreteValue:_ }, [me]], type: [{ highHTMLLength:_ }, [me]] }
                                ],
            */
            // JITSnappableReorderableController
            allDataJITSnappableVisReorderable: [{ myFacet: { values: _ } }, [me]],

            //used in DiscreteWidget
            disableScrollbar: false
        },
        position: {
            attachBeginningGirthToScrollbar: {
                point1: {
                    element: [
                        { myWidget: [{ myWidget: _ }, [me]] },
                        [areaOfClass, "DiscreteValuesScrollbar"]
                    ],
                    type: [{ endGirth: _ }, [me]]
                },
                point2: { type: [{ beginningGirth: _ }, [me]] },
                equals: 0
            },
            labelBeginningGirthForDiscreteValues: {
                point1: { type: [{ beginningGirth: _ }, [me]] },
                point2: { label: "beginningGirthForDiscreteValues" },
                equals: 0
            },
            minDiscreteValuesViewLowHTMLLengthFromItsAnchor: {
                point1: [{ anchorForLowHTMLLength: _ }, [me]],
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                min: [{ marginOnLowHTMLLength: _ }, [me]]
            },
            discreteValuesViewLowHTMLLengthFromItsAnchorOrConstraint: {
                point1: [{ anchorForLowHTMLLength: _ }, [me]],
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: [{ marginOnLowHTMLLength: _ }, [me]],
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: {
                    element: [{ myWidget: _ }, [me]],
                    // joins other constraints that participate in the widget's contentBeginning orGroup
                    label: "contentBeginning"
                }
            },
            auxLabelHighHTMLOfDiscreteValues: { // in case the JITDoc is simply shorter than the real-estate offered by the widget.
                pair1: {
                    point1: { label: "beginningOfJITDoc" },
                    point2: { label: "endOfJITDoc" }
                },
                pair2: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { label: "highHTMLOfDiscreteValues" }
                },
                ratio: 1
            },
            highHTMLLengthNotHigherThanWidget: { // e.g. this class' bottom should not be below the bottom of the embedding widget.
                point1: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    element: [{ myWidget: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]]
                },
                min: [{ marginOnHighHTMLLength: _ }, [me]]
            },
            highHTMLLengthNotHigherThanDiscreteValues: { // e.g. this class' bottom should not be below the label that marks the bottom of the embedded values areaSet.
                point1: { type: [{ highHTMLLength: _ }, [me]] },
                point2: { label: "highHTMLOfDiscreteValues" },
                min: 0
            },
            highHTMLLengthToMatchThatOfWidget: {
                point1: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    element: [{ myWidget: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]]
                },
                equals: [{ marginOnHighHTMLLength: _ }, [me]],
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "myProperHighHTML" }
            },
            orHighHTMLLengthToMatchThatOfDiscreteValues: {
                point1: { type: [{ highHTMLLength: _ }, [me]] },
                point2: { label: "highHTMLOfDiscreteValues" },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "myProperHighHTML" }
            },

            attachEndGirthMinToWidgetAndHistogramView: {
                point1: {
                    type: [{ endGirth: _ }, [me]]
                },
                point2: {
                    element: o([{ myWidget: _ }, [me]], [{ myRightmostHistogramView: _ }, [me]]),
                    type: [{ endGirth: _ }, [me]],
                    content: true
                },
                min: 0
            },
            eitherAttachEndGirthMinToWidget: {
                point1: {
                    type: [{ endGirth: _ }, [me]]
                },
                point2: {
                    element: [{ myWidget: _ }, [me]],
                    type: [{ endGirth: _ }, [me]],
                    content: true
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "endGirthOfDiscreteValuesView" }
            },
            orAttachEndGirthMinToHistogramView: {
                point1: {
                    type: [{ endGirth: _ }, [me]]
                },
                point2: {
                    element: [{ myRightmostHistogramView: _ }, [me]],
                    type: [{ endGirth: _ }, [me]],
                    content: true
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "endGirthOfDiscreteValuesView" }
            }
        },
        children: {
            values: {
                data: [{ jitSnappableVisReorderableData: _ }, [me]] // part of the JITSnappableReorderableController API!
                // description: see inheriting classes
            },
            discreteValueNamesExpandableArea: {
                description: {
                    "class": "DiscreteValueNamesExpandableArea"
                }
            }
        },
        write: {
            onDiscreteValuesViewChangingOfMeasureParam: {
                upon: [and,
                    [not, [{ myFacet: { sortingByValues: _ } }, [me]]],
                    o(
                        [changed, [{ myMeasureFacetUniqueID: _ }, [me]]],
                        [changed, [{ myMeasureFunctionUniqueID: _ }, [me]]]
                    )
                ],
                true: {
                    resetSpecifiedFiVUniqueID: {
                        to: [{ specifiedFiVUniqueID: _ }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the DiscreteWidget, and provides a scrollbar for the DiscreteValuesView, if need be.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValuesScrollbar: {
        "class": o("VerticalScrollbarContainerOfSnappable", "TrackMyWidget"),
        context: {
            // VerticalScrollbarContainerOfSnappable params
            movableController: [{ children: { valuesView: _ } }, [embedding]],
            attachToView: "beginning",
            createButtons: false // override default definition
        },
        position: {
            left: 1 // should hold, i think, also for a DiscreteValuesScrollbar in a horizontal widget (?)
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete widget on the primary axis. It inherits DiscreteWidget and PrimaryWidget. It's inherited by MSPrimaryWidget/RatingPrimaryWidget.
    //
    // It defines the topAnchorForHistogramOr2DPlot/bottomAnchorForHistogramOr2DPlot posPoint labels, which are used to position the histogram/2D-plot.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscretePrimaryWidget: {
        "class": o("Vertical", "DiscreteWidget", "PrimaryWidget"),
        context: {
            // PrimaryWidget params:
            offsetFromAmoebaBottom: bDiscretePosConst.discretePrimaryWidgetFromAmoebaBottom // override default value of PrimaryWidget
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete widget on the primary axis. It inherits DiscreteWidget and PrimaryWidget. It's inherited by MSPrimaryWidget/RatingPrimaryWidget.
    // It defines the twoDPlotLeftAnchor/twoDPlotRightAnchor posPoint labels, used to position the 2D-plot on the horizontal axis.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteSecondaryWidget: {
        "class": o("Horizontal", "DiscreteWidget", "SecondaryWidget"),
        position: {
            labelTwoDPlotLeftAnchor: {
                point1: { type: "left" },
                point2: { label: "twoDPlotLeftAnchor" },
                equals: 0
            },
            labelTwoDPlotRightAnchor: {
                point1: { type: "right" },
                point2: { label: "twoDPlotRightAnchor" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is an auxiliary class, providing constraints to match the left posPoint of the inheriting area to the left of the values of the primary widget, and the right posPoint
    // to the posPoint label defining where the first PermOverlayXWidget is to be positioned - in essence, the inheriting class will span over the entire width of the discrete values 
    // in the primary widget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchDiscretePrimaryWidgetHorizontally: {
        matchPrimaryWidgetLeft: {
            point1: {
                element: [{ children: { primaryWidget: _ } }, [embedding]],
                type: "left"
            },
            point2: {
                type: "left"
            },
            equals: bDiscretePosConst.valueFromViewBeginningGirth
        },
        matchPrimaryWidgetOnRightSide: {
            point1: {
                type: "right"
            },
            point2: {
                element: [{ children: { primaryWidget: _ } }, [embedding]],
                label: "beginningOfFirstOverlayXWidget"
            },
            equals: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single discrete value, which is part of an areaSet embedded in a class inheriting DiscreteValuesView. It is inherited by MSValue and RatingValue.
    //
    // It is the intersection parent of permOverlayXDiscreteValues (the referredOf there is DiscretePermOverlayXWidget).
    // This class provides the partner definition; inheriting classes to provide the description.
    //
    // API:
    // 1. children. valueName: The inheriting class should embed an area called valueName, that displays the name of the DiscreteValue. 
    //    this area inherits DiscreteValueName (via MSValueName/RatingValueName)
    // 2. permOverlayXDiscreteValues: provide the description (e.g. inherit a class)
    // 3. length (i.e. height when in vertical widget, and width when in horizontal widget).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValue: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hackOverlayDiscreteValueAsAreaSet: [{ myApp: { hackOverlayDiscreteValueAsAreaSet: _ } }, [me]],

                // this block (inFullView and inPartialView) are used for hacks to work around inefficiencies of positioning constraint sets.
                inFullView: [and,
                    [greaterThanOrEqual, // logicalBeginning after (i.e. lower) beginningOfViewPoint
                        [offset,
                            [{ movableController: { beginningOfViewPoint: _ } }, [me]],
                            [{ logicalBeginning: _ }, [me]]
                        ],
                        0
                    ],
                    [greaterThanOrEqual, // logicalEnd before (i.e. above) endOfViewPoint 
                        [offset,
                            [{ logicalEnd: _ }, [me]],
                            [{ movableController: { endOfViewPoint: _ } }, [me]]
                        ],
                        0
                    ]
                ],
                inView: o( // i'm in partial view if i'm inFullView, i'm the one after lastInFullView, or the one before firstInFullView
                    // (the latter is needed while scrolling, at which point we can have a partial DiscreteValue showing at the top of the view)
                    [{ inFullView: _ }, [me]],
                    [
                        [me],
                        o(
                            [prev, [{ myWidget: { firstDiscreteValueInFullView: _ } }, [me]]],
                            [next, [{ myWidget: { lastDiscreteValueInFullView: _ } }, [me]]]
                        )
                    ]
                ),

                showingHistogram: [equal,
                    facetState.histogram,
                    [{ facetState: _ }, [me]]
                ],
                firstValue: [{ firstInAreaOS: _ }, [me]],
                lastValue: [{ lastInAreaOS: _ }, [me]],

                inEffectiveBaseValues: [
                    [{ valueInItemSet: _ }, [me]],
                    [{ myFacet: { compressedEffectiveBaseValues: _ } }, [me]],
                    [{ myApp: { effectiveBaseOverlay: { unsortedSolutionSetItems: _ } } }, [me]]
                ],

                noValue: [equal, [{ myFacet: { noValueStr: _ } }, [me]], [{ value: _ }, [me]]],
                multipleDiscreteValues: [greaterThan, [size, [{ myFacet: { values: _ } }, [me]]], 1]
            }
        },
        { // default
            "class": o(
                "GeneralArea",
                "JITSnappableVisReorderable", // Horizontal/Vertical inherited already elsewhere
                "TrackMyWidget", // inherited before TrackMyFacet, to override its default myFacet definition
                "TrackMyFacet"
            ),
            context: {
                value: [{ param: { areaSetContent: _ } }, [me]],
                name: [
                    {
                        value: [{ value: _ }, [me]],
                        name: _
                    },
                    [{ myFacet: { valueNameObjs: _ } }, [me]]
                ],

                // SnappableVisReorderable params (axis-specific inheritance in variants below)
                uniqueID: [{ value: _ }, [me]],
                snappableReorderableController: [{ myWidget: { myDiscreteValuesView: _ } }, [me]],
                // params for classes inherited in the snappableMode variants below

                myReorderable: [{ value: _ }, [me]],

                valueInItemSet: [defun,
                    o("valueItemSet", "noValueItemSet"),
                    [cond,
                        [{ noValue: _ }, [me]],
                        o(
                            {
                                on: false, // i.e. there is a value
                                use: [
                                    [{ value: _ }, [me]],
                                    "valueItemSet"
                                ]
                            },
                            {
                                on: true, // i.e. there is no value (and for that reason it is not present in compressedEffectiveBaseValues)
                                use: [ // for noValue (i.e. a missing value in the item db!), we check whether the effective base has items with a missing value
                                    // if so, inEffectiveBaseValues is set to true. 
                                    // and so we select all items which do not have a value specified for the associated attribute.
                                    [{ myFacet: { noValueSelection: _ } }, [me]],
                                    "noValueItemSet"
                                ]
                            }
                        )
                    ]
                ],

                selectionQuery: [
                    {
                        value: [{ value: _ }, [me]],
                        selectionQuery: _
                    },
                    [{ myFacet: { valueObjs: _ } }, [me]]
                ],

                anchorForEndGirth: [embedding] // overridden in one of the variants below
            },
            position: {
                // length-axis spacing provided by MemberOfPositionedAreaSet
                endGirthConstraint: {
                    point1: {
                        type: [{ endGirth: _ }, [me]]
                    },
                    point2: {
                        element: [{ anchorForEndGirth: _ }, [me]],
                        type: [{ endGirth: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: { // i wrongly equate vertical widget with left-sided widget. a shortcut, for now.
                beginningGirthConstraint: {
                    point1: {
                        element: [embedding],
                        label: "beginningGirthForDiscreteValues"
                    },
                    point2: {
                        type: [{ beginningGirth: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                hackOverlayDiscreteValueAsAreaSet: true,
                inView: true
            }, // inView intended to better approximate the hacking of an intersection as an areaSet:
            // we create permOverlayXDiscreteValues only for the DiscreteValues which are inView (i.e. full or partial view)
            children: {
                permOverlayXDiscreteValues: {
                    data: [{ myPermOverlayXWidgets: _ }, [me]]
                    // description: provided by inheriting classes
                }
            }
        },
        {
            qualifier: { hackOverlayDiscreteValueAsAreaSet: false },
            children: {
                permOverlayXDiscreteValues: {
                    partner: [{ myPermOverlayXWidgets: _ }, [me]]
                    // description: provided by inheriting classes
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: { // i wrongly equate horizontal widget with bottom-sided widget. a shortcut, for now.
                beginningGirthConstraint: {
                    point1: {
                        type: [{ beginningGirth: _ }, [me]]
                    },
                    point2: {
                        element: [embedding],
                        label: "beginningGirthForDiscreteValues"
                    },
                    equals: 0
                },
                // unlike within a vertical widget, there's no need for a orGroup calculation here, as all valueNames share their endGirth point.
                labelBeginningOfFirstOverlayXWidget: {
                    point1: {
                        element: [{ children: { valueName: _ } }, [me]],
                        type: [{ endGirth: _ }, [me]]
                    },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofPrimaryWidget: true },
            context: {
                length: [cond,
                    [{ discreteWidgetABTest: _ }, [me]],
                    o(
                        { on: "Circles", use: [densityChoice, [{ discretePosConst: { defaultHeightOfDiscreteValue: _ } }, [globalDefaults]]] },
                        { on: "Form", use: bDiscretePosConst.discreteCellSideInFormTest }
                    )
                ]
            }
        },
        {
            qualifier: {
                showingHistogram: false,
                ofPrimaryWidget: true
            },
            position: {
                lengthAxisConstraint: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [{ length: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                showingHistogram: true,
                ofPrimaryWidget: true
            },
            context: {
                anchorForEndGirth: [ // the last histogram, i.e. the rightmost
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        ofLastHistogram: true
                    },
                    [areaOfClass, "HistogramView"]
                ]
            },
            position: {
                lengthAxisConstraint: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    min: [{ length: _ }, [me]]
                },
                minLengthPreferenceConstraint: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.defaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the right-expandable area delimiting the size of the DiscreteValueName elements 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValueNamesExpandableArea: {
        "class": o("GeneralArea", "ExpandableInFacet", "TrackMyWidget"),
        context: {
            //stableExpandableIsMin: true, // override default value for ExpandableRight
            firstDiscretePermOverlayXWidget: [
                {
                    myWidget: [{ myWidget: _ }, [me]],
                    firstInAreaOS: true
                },
                [areaOfClass, "DiscretePermOverlayXWidget"]
            ],
            initialExpandableWidth: bDiscretePosConst.discreteValueNamesExpandableAreaInitialWidth
        },
        position: {
            top: 0,
            bottom: 0,
            left: bDiscretePosConst.valueNameMarginAtBeginningGirth,
            rightConstraintWithBeginningOfFirstOverlayXWidget: {
                point1: { type: "right" },
                point2: {
                    element: [{ myWidget: _ }, [me]],
                    label: "beginningOfFirstOverlayXWidget"
                },
                equals: bDiscretePosConst.distanceBetweenDiscreteValueNamesExpandableAreaAndFirstOverlayXWidget
            },
            /*
            stableWidth: {
                point1: {type: "left"},
                point2: {type: "right"},
                stability: true
            },*/
            minWidthConstraint: {
                point1: { type: "left" },
                point2: { type: "right" },
                // minWidth depends on whether this is a ratingSymbol facet, or not (i.e. plain strings are on display)
                // the latter may become a more precise calculation that takes into consideration the facet's actual os of projected values.
                min: [cond,
                    [{ myFacet: { ratingSymbol: _ } }, [me]],
                    o(
                        {
                            on: false,
                            use: [mul,
                                [{ initialExpandableWidth: _ }, [me]],
                                bDiscretePosConst.minWidthConstraintFactor
                            ]
                        },
                        {
                            on: true,
                            use: [{ myFacet: { ratingSymbolsFullWidth: _ } }, [me]]
                        }
                    )
                ]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the actual name of a discrete value. it is embedded in a DiscreteValue, and inherited by MSValueName/RatingValueName.
    // API:
    // 1. valueAsText: a boolean indicating whether the name is provided as text or not. true, by default. 
    //    RatingValueName may be represented by a symbol, in which case it would set valueAsText to false, and handle the display itself.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValueName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                noValue: [{ myDiscreteValue: { noValue: _ } }, [me]],
                reordable: [{ multipleDiscreteValues: _ }, [{ myDiscreteValue: _ }, [me]]],
                valueAsText: true,
                inEffectiveBaseValues: [{ myDiscreteValue: { inEffectiveBaseValues: _ } }, [me]],
                expandableAreaBeingExpanded: [
                    {
                        myDiscreteValueNamesExpandableArea: {
                            expanding: _
                        }
                    },
                    [me]
                ],

                ignoreEffectiveBaseValues: [{ myFacet: { ignoreEffectiveBaseValues: _ } }, [me]]
            }
        },
        { // default
            "class": o("DiscreteValueNameDesign", "GeneralArea", "TrackMyWidget"),
            context: {
                myDiscreteValue: [embedding],
                myDiscreteValueNamesExpandableArea: [
                    { myWidget: [{ myWidget: _ }, [me]] },
                    [areaOfClass, "DiscreteValueNamesExpandableArea"]
                ]
                //offsetFromDiscreteValueOnBeginningGirth: bDiscretePosConst.valueNameMarginAtBeginningGirth
            }
        },
        {
            qualifier: { reordable: true },
            "class": "ReorderHandle",
            context: {
                visReorderable: [{ myDiscreteValue: _ }, [me]],
                tmd: [{ visReorderable: { iAmDraggedToReorder: _ } }, [me]]
            }
        },
        {
            qualifier: { valueAsText: true },
            context: {
                displayText: [{ myDiscreteValue: { name: _ } }, [me]],
                numericalValue: [
                    r(-Number.MAX_VALUE, Number.MAX_VALUE),
                    [{ displayText: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                valueAsText: true,
                numericalValue: true
            },
            "class": "NumericFormatOfReference"
        },
        {
            qualifier: {
                valueAsText: true,
                ofVerticalElement: true
            },
            position: {
                "content-height": [displayHeight],
                "vertical-center": 0,
                alignLeftWithExpandableArea: {
                    point1: { type: "left" },
                    point2: {
                        type: "left",
                        element: [{ myDiscreteValueNamesExpandableArea: _ }, [me]]
                    },
                    equals: 0
                },
                rightFrameLeftOfExpandableArea: {
                    point1: { type: "right" },
                    point2: {
                        type: "right",
                        element: [{ myDiscreteValueNamesExpandableArea: _ }, [me]]
                    },
                    min: 0
                },
                pushRightFrameToTheRight: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    preference: "max",
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        },
        {
            qualifier: {
                valueAsText: true,
                ofVerticalElement: false
            },
            "class": "DisplayDimension",
            position: {
                // we may need to double check this!!
                bottom: [{ offsetFromDiscreteValueOnBeginningGirth: _ }, [me]],
                "content-width": [displayWidth],
                "content-height": [displayHeight],
                "horizontal-center": 0
                //left: 0,
                //right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DiscreteOverlayXWidget Classes - the representation of an Overlay in a DiscreteWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by DiscretePermOverlayXWidget.
    // 
    // API: 
    // 1. An areaSet called values in the embedding area (provided by the embedding DiscreteWidget).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteOverlayXWidget: {
        context: {
            overlayXWidgetGirth: bDiscretePosConst.overlayXWidgetGirth
        },
        position: {
            lowHTMLLengthConstraint: {
                point1: {
                    element: [{ myWidget: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: 0
            },
            highHTMLLengthConstraint: {
                point1: {
                    element: [{ myWidget: { myDiscreteValuesView: _ } }, [me]],
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent overlay in a discrete widget, and is inherited by an areaSet in DiscreteWidget. 
    // It is inherited by MSPermOverlayXWidget and RatingPermOverlayXWidget. It inherits DiscreteOverlayXWidget and PermOverlayXWidget.
    // In a given widget, there's an instance of this class per zoomboxed permanent overlay that's showing.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscretePermOverlayXWidget: {
        "class": o("DiscreteOverlayXWidget", "PermOverlayXWidget"),
        position: {
            attachBeginningGirthToBeginningSideAnchor: {
                point1: { type: [{ beginningGirth: _ }, [me]] },
                point2: { label: "beginningSideAnchor" },
                equals: 0
            },
            attachEndGirthToEndSideAnchor: {
                point1: { type: [{ endGirth: _ }, [me]] },
                point2: { label: "endSideAnchor" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an intersection formed by DiscreteValue (expression) and DiscretePermOverlayXWidget (referred). It is inherited by PermOverlayMSValue and PermOverlayRatingValue.
    // This class handles the variant for an extensional overlay. 
    // for the intensional overlay, the inheriting classes are tasked with providing the proper variant (PermOverlayMSValue & PermOverlayRatingValue differ in how they handle mouseEvents).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayDiscreteValue: o(
        { // default
            "class": "GeneralArea",
            propagatePointerInArea: "referred" // so that its DiscretePermOverlayXWidget referred parent receive the pointerInArea
        },
        {
            qualifier: { ofIntOverlay: false }, // i.e. of an extensional overlay.
            "class": "PermExtOverlayDiscreteValue"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by IntOverlayDiscreteValue and PermExtOverlayDiscreteValue. 
    // It inherits FrameWRTIntersection that specifies the position of the frame/content of this intersection area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayDiscreteValue: o(
        { // variant-controllerOverlayDiscreteValue
            qualifier: "!",
            context: {
                hackOverlayDiscreteValueAsAreaSet: [{ myApp: { hackOverlayDiscreteValueAsAreaSet: _ } }, [me]],
                // ofImplicit1DSetItem defined in PermIntOverlayDiscreteValue (as it has no meaning for an extensional overlay's discrete value)
                // note that PermIntOverlayDiscreteValue also overrides the definition of ofSolutionSet, and offers one that
                // is logically equivalent, but computationally more efficient.
                ofSolutionSet: [
                    [{ valueInItemSet: _ }, [embedding]],
                    [{ myOverlayXWidget: { overlaySolutionSetProjection: _ } }, [me]],
                    [{ myOverlayXWidget: { overlaySolutionSet: _ } }, [me]]
                ],
                noValue: [{ myDiscreteValue: { noValue: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "FrameWRTIntersection", "TrackMyOverlay"),
            context: {
                value: [cond,
                    [{ noValue: _ }, [me]],
                    o(
                        { on: false, use: [{ myDiscreteValue: { value: _ } }, [me]] },
                        { on: true, use: [{ myApp: { noValueExpression: _ } }, [me]] } // we don't store "No Value" as the selection
                    )                                                                // as a real db just might have that value in it..
                ],
                myOverlay: [{ myOverlayXWidget: { myOverlay: _ } }, [me]],

                // FrameWRTIntersection params:
                contentBorderTracksIntersectingParentsContent: true,
                horizontalIntersectingParent: [{ myDiscreteValue: _ }, [me]],
                verticalIntersectingParent: [{ myOverlayXWidget: _ }, [me]]
            }
        },
        {
            qualifier: { hackOverlayDiscreteValueAsAreaSet: true },
            context: {
                myOverlayXWidget: [{ param: { areaSetContent: _ } }, [me]],
                myDiscreteValue: [embedding]
            }
        },
        {
            qualifier: { hackOverlayDiscreteValueAsAreaSet: false },
            context: {
                myOverlayXWidget: [referredOf],
                myDiscreteValue: [expressionOf]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PermIntOverlayDiscreteValue. It inherits OverlayDiscreteValue.
    // If { included: true }, then by clicking on this area, we remove the associated value (that of the expression parent) from the content:included of the referred parent (i.e.
    // of DiscreteOverlayXWidget).
    // we assign values to selectionsPerInclusionMode which is used by the inheriting classes.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IntOverlayDiscreteValue: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                included: [and,
                    [not, [{ myOverlayXWidget: { tmpDiscreteValueExclusion: _ } }, [me]]],
                    [or,
                        [{ myOverlayXWidget: { tmpDiscreteValueInclusion: _ } }, [me]],
                        [
                            [{ value: _ }, [me]],
                            [{ myOverlayXWidgetIncludedValues: _ }, [me]]
                        ]
                    ]
                ],
                excluded: [and,
                    [not, [{ myOverlayXWidget: { tmpDiscreteValueInclusion: _ } }, [me]]],
                    [or,
                        [{ myOverlayXWidget: { tmpDiscreteValueExclusion: _ } }, [me]],
                        [
                            [{ value: _ }, [me]],
                            [{ myOverlayXWidgetExcludedValues: _ }, [me]]
                        ]
                    ]
                ],
                amISelected: o(
                    [{ included: _ }, [me]],
                    [{ excluded: _ }, [me]]
                ),
                inclusionMode: [{ myOverlayXWidget: { inclusionMode: _ } }, [me]],
                effectiveExclusionMode: [{ myOverlayXWidget: { mySelectableFacetXIntOverlay: { effectiveExclusionMode: _ } } }, [me]]
            }
        },
        { // default
            "class": o("OverlayDiscreteValue", "ModifyPointerClickable"),
            context: {
                myOverlayXWidgetIncludedValues: [{ myOverlayXWidget: { stableSelectionsObj: { included: _ } } }, [me]],
                myOverlayXWidgetExcludedValues: [{ myOverlayXWidget: { stableSelectionsObj: { excluded: _ } } }, [me]]
            }
        },
        { // this functionality is here, and not in PermIntOverlayDiscreteValue as it is also used by the EphOverlayDiscreteValue
            qualifier: { included: true },
            write: {
                onIntOverlayDiscreteValueMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        removeFromIncluded: {
                            to: [
                                [{ value: _ }, [me]],
                                [{ myOverlayXWidgetIncludedValues: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                inclusionMode: true,
                amISelected: false
            },
            context: {
                addToSelectionsData: [{ myOverlayXWidgetIncludedValues: _ }, [me]],
                removeFromSelectionsData: [{ myOverlayXWidgetExcludedValues: _ }, [me]]
            }
        },
        {
            qualifier: {
                inclusionMode: false,
                amISelected: false
            },
            context: {
                addToSelectionsData: [{ myOverlayXWidgetExcludedValues: _ }, [me]],
                removeFromSelectionsData: [{ myOverlayXWidgetIncludedValues: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the variant for PermOverlayDiscreteValue which handles an intersection area that represents an extensional overlay.
    // It inherits OverlayDiscreteValue.  If this intersection's embedding area (its expressionOf, DiscreteValue) is a value included in the extensional overlay's projection of its
    // solutionSet onto the associated facet, then this class will embed a valueMarker.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermExtOverlayDiscreteValue: o(
        { // default
            "class": "OverlayDiscreteValue"
        },
        {
            qualifier: { ofSolutionSet: true },
            // The Discrete1DValueMarkerOfPermOverlay provides a visual indication regarding the associated value's membership in the projection on this facet of two itemSets:
            // the facetXoverlay's implicit1DSet and the overlay's solutionSet.
            children: {
                valueMarker: {
                    description: {
                        "class": "Discrete1DValueMarkerOfPermOverlay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the addendum inherited by PermOverlayMSValue/PermOverlayRatingValue in their variant for an intensional overlay.
    // this class provides the mouseEvent handlers which are common to PermOverlayMSValue/PermOverlayRatingValue (the handlers that differ are inherited there via 
    // RatingAddToSelections/MSAddToSelections
    //
    // inclusionMode: appData of the associated OverlayXWidget
    //
    // Embedding of a valueMarker:
    // if this value is in the projection of the implicit1DSet of the associated overlay and facet, then this class will embed a valueMarker. 
    // reminder: the implicit1DSet is, by definition, a superset (or equal to) the solutionSet. so the valueMarker will then determine its appearance depending whether or not it is 
    // also in the projection of the *solutionSet* on this facet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntOverlayDiscreteValue: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofDisabledOverlayXWidget: [{ myOverlayXWidget: { content: { disabled: _ } } }, [me]],
                selectionsMade: [{ myOverlayXWidget: { selectionsMade: _ } }, [me]],

                ofImplicit1DSetItem: [
                    [{ valueInItemSet: _ }, [embedding]],
                    [{ myOverlayXWidget: { overlayImplicit1DSetProjection: _ } }, [me]],
                    [{ myOverlayXWidget: { overlayImplicit1DSet: _ } }, [me]]
                ],
                // override definition of ofSolutionSet from OverlayDiscreteValue with one that's logically equivalent,
                // but computationally more efficient
                ofSolutionSet: [cond,
                    [and,
                        [{ myApp: { debugFasterSolutionSetMembership: _ } }, [me]],
                        [{ selectionsMade: _ }, [me]]
                    ],
                    o(
                        {
                            on: false,
                            use: [{ ofImplicit1DSetItem: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [cond,
                                [{ ofDisabledOverlayXWidget: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [{ ofImplicit1DSetItem: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [cond,
                                            [{ effectiveExclusionMode: _ }, [me]],
                                            o(
                                                {
                                                    on: true,
                                                    use: [not, [{ excluded: _ }, [me]]]
                                                },
                                                {
                                                    on: false,
                                                    use: [{ included: _ }, [me]]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ]
                        }
                    )
                ],

                embedCircleValueMarker: o(
                    [{ discreteWidgetABTestCircles1Or2: _ }, [me]],
                    [and,
                        [
                            [{ discreteWidgetABTestOption: _ }, [me]],
                            "Circles3" // circles3 is hijacking this circleMarker to indication a selection (included: true)!!
                        ],
                        [{ included: _ }, [me]]
                    ]
                ),
                embedDiscreteValueSelection: o(
                    [and,
                        [{ discreteWidgetABTestCircles1Or2: _ }, [me]],
                        [{ amISelected: _ }, [me]]
                    ],
                    [and,
                        [
                            [{ discreteWidgetABTestOption: _ }, [me]],
                            "Circles3"
                        ],
                        [{ excluded: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "IntOverlayDiscreteValue", "TrackMyWidget"),
            context: {
                discreteWidgetABTestCircles1Or2: [
                    [{ discreteWidgetABTestOption: _ }, [me]],
                    o("Circles1", "Circles2")
                ]
            },
            write: {
                onPermIntOverlayDiscreteValueMouseClick: {
                    "class": "OnMouseClick"
                    //true: {
                    // see additional actions in variants below 
                    //}
                }
            }
        },
        {
            // exclusion can be only in a permanent overlay's discrete selections, not in an ephemeral one.
            // the { included: true } case is handled in the inherited IntOverlayDiscreteValue, as it is also used by the other class to inherit it, EphOverlayDiscreteValue
            qualifier: { excluded: true },
            write: {
                onPermIntOverlayDiscreteValueMouseClick: {
                    // upon: see default variant above
                    true: {
                        removeFromExcluded: {
                            to: [
                                [{ value: _ }, [me]],
                                [{ myOverlayXWidgetExcludedValues: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { amISelected: false },
            write: {
                onPermIntOverlayDiscreteValueMouseClick: {
                    // upon: see default variant above
                    // true: {
                    // additional actions specified by inheriting classes
                    // MS: on MouseClick, Rating: either on Shift+MouseClick or on w/o-Shift+MouseClick
                    // }
                }
            }
        },
        { // any change to the selections of a intensional overlay whose selections are disabled for the embedding facet, will result in the disabling being turned off.
            qualifier: { ofDisabledOverlayXWidget: true },
            write: {
                onPermIntOverlayDiscreteValueMouseClick: {
                    // upon: see default variant above
                    true: {
                        turnOffDisabled: {
                            to: [{ ofDisabledOverlayXWidget: _ }, [me]],
                            merge: false
                        }
                        // additional actions taken in IntOverlayDiscreteValue variants
                    }
                }
            }
        },
        {
            qualifier: { discreteWidgetABTest: "Circles" },
            children: {
                selectionControl: {
                    description: {
                        "class": "DiscreteSelectionControl"
                    }
                }
            }
        },
        {
            qualifier: { discreteWidgetABTest: "Form" },
            children: {
                selectionForm: {
                    description: {
                        "class": "DiscreteSelectionForm"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteSelectionControl: {
        "class": o("DiscreteSelectionControlDesign", "SelectionControl", "TrackMyOverlay"),
        context: {
            myOverlay: [{ myOverlay: _ }, [embedding]],
            // DiscreteSelectionControlDesign param
            disabled: [not, [{ ofImplicit1DSetItem: _ }, [embedding]]], // which also implies that it is not in the projection of the baseSet!
            borderWidth: [densityChoice, [{ discretePosConst: { selectionControlBorderWidth: _ } }, [globalDefaults]]], // override default value
            radius: [densityChoice, [{ discretePosConst: { selectionControlRadius: _ } }, [globalDefaults]]],
            indicationRadius: [densityChoice, [{ discretePosConst: { valueMarker1DRadius: _ } }, [globalDefaults]]],
            innerCircleColor: designConstants.selectedColor,
            ofSolutionSet: [{ ofSolutionSet: _ }, [embedding]],
            included: [{ included: _ }, [embedding]],
            excluded: [{ excluded: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteSelectionForm: o(
        { // variant-controllers
            qualifier: "!",
            context: {
                indicateSelectability: [{ inFocus: _ }, [embedding]],
                included: [{ included: _ }, [embedding]],
                excluded: [{ excluded: _ }, [embedding]]
            }
        },
        { // default
            "class": o("DiscreteSelectionFormDesign", "GeneralArea"),
            position: {
                width: 15, // till display queries are available
                height: 15, // till display queries are available
                bottom: 2,
                right: 2
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the valueMarker which is embedded in PermExtOverlayDiscreteValue. It inherits OneDValueMarkerOfPermOverlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Discrete1DValueMarkerOfPermOverlay: {
        "class": o("GeneralArea", "OneDValueMarkerOfPermOverlay", "TrackMyOverlay"),
        context: {
            // override default definition provided in OneDValueMarkerOfPermOverlay (TrackMyOverlayXWidget - there its only embeddedStar)
            myOverlay: [{ myOverlay: _ }, [embedding]],
            // overlayColor: provided via TrackMyOverlay
            // OneDValueMarkerOfPermOverlay params:
            radius: [densityChoice, [{ discretePosConst: { valueMarker1DRadius: _ } }, [globalDefaults]]],
            ofSolutionSet: true
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DiscreteOverlayXWidget Classes - the representation of an Overlay in a DiscreteWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Discrete Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogramsViewContainer: {
        "class": o("HorizontalHistogramsViewContainer"),
        children: {
            histogramsView: {
                description: {
                    "class": "DiscreteHistogramsView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogramsView: {
        "class": "HistogramsView",
        children: {
            histogramsDoc: {
                description: {
                    "class": "DiscreteHistogramsDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogramsDoc: {
        "class": "HistogramsDoc",
        children: {
            histograms: {
                // data: see HistogramsDoc
                description: {
                    "class": "DiscreteHistogram"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete histogram. It is embedded in the discrete amoeba in the appropriate facet state. it inherits Histogram.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogram: {
        "class": "Histogram",
        children: {
            histogramView: {
                description: {
                    "class": "DiscreteHistogramView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines the bin intersection areas, created via the intersection with the primary widget's DiscreteValue areas.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogramView: {
        "class": o("HistogramView", "AboveDiscreteValuesView"),
        context: {
            myPrimaryWidgetView: [{ myWidget: { myDiscreteValuesView: _ } }, [me]]
        },
        position: {
            attachTopToPrimaryWidgetView: {
                point1: {
                    element: [{ myPrimaryWidgetView: _ }, [me]],
                    type: "top"
                },
                point2: {
                    type: "top",
                    content: true
                },
                equals: 0
            },
            attachBottomToPrimaryWidgetView: {
                point1: {
                    element: [{ myPrimaryWidgetView: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "bottom",
                    content: true
                },
                equals: 0
            }
        },
        children: {
            bins: {
                // note: these are not all discrete values in the facet, only those in view!
                // also note that the data for the areaSet is data, not areaRefs - this is because the corresponding data in a SliderHistogramView is also
                // data, and we cannot mix data and areaRefs. the DiscreteHistogramBin uses its param.areaSetContent to obtain its myDiscreteValue.
                data: [{ myWidget: { discreteValues: { value: _ } } }, [me]],
                description: {
                    "class": "DiscreteHistogramBin"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a discrete histogram bin, and it is embedded in the DiscreteHistogramView.
    // It is created as an areaSet, with each area representing a discrete value in view.
    // It inherits HistogramBin. It also inherits FrameWRTIntersection, to give it the dimensions of the intersection as its frame.
    //
    // API:
    // 1. contentOffsetFromIntersectingLeft/Right/Top/Bottom (FrameWRTIntersection API)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteHistogramBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstBin: [{ myDiscreteValue: { firstValue: _ } }, [me]],
                lastBin: [{ myDiscreteValue: { lastValue: _ } }, [me]]
            }
        },
        { // default
            "class": o("HistogramBin", "FrameWRTIntersection"),
            context: {
                myDiscreteValue: [
                    { value: [{ param: { areaSetContent: _ } }, [me]] },
                    [{ myWidget: { discreteValues: _ } }, [embedding]]
                ],

                // HistogramBin params
                binValue: [{ param: { areaSetContent: _ } }, [me]],
                binSelectionQuery: [{ myDiscreteValue: { selectionQuery: _ } }, [me]],

                myHistogramView: [embedding],

                // FrameWRTIntersection params:
                horizontalIntersectingParent: [{ myDiscreteValue: _ }, [me]],
                verticalIntersectingParent: [{ myHistogramView: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Discrete Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DiscreteAmoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by RatingFacetXIntOverlay/MSFacetXIntOverlay. 
    // the latter are addendums inherited by the appropriate variant of the SelectableFacetXIntOverlay, the class of the areaSet embedded in an intensional overlay, where each area
    // represents the selections/solutionSets pertaining to a single selectableFacet & the overlay.
    // For the DiscreteFacet, unlike the SliderFacet, there's no difference between the transient and the stable selections.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionsMade: [{ inclusionExclusionSelectionsMade: _ }, [me]],
                valuableSelectionsMade: [ // i.e. without the noValueExpression
                    n([{ myApp: { noValueExpression: _ } }, [me]]),
                    [{ inclusionExclusionSelections: _ }, [me]]
                ]
            }
        },
        { // default
        },
        {
            qualifier: { ofUDFCalculatesQuarter: true },
            context: {
                includedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToQuarter, "val"]
                    ],
                    [{ stableSelectionsObj: { included: _ } }, [me]]
                ],
                excludedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToQuarter, "val"]
                    ],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { ofUDFCalculatesMonth: true },
            context: {
                includedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToMonth, "val"]
                    ],
                    [{ stableSelectionsObj: { included: _ } }, [me]]
                ],
                excludedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToMonth, "val"]
                    ],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { ofDFCalculatesWeekDay: true },
            context: {
                includedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToWeekDay, "val"]
                    ],
                    [{ stableSelectionsObj: { included: _ } }, [me]]
                ],
                excludedForDisplayInput: [map,
                    [defun,
                        o("val"),
                        [convertNumToWeekDay, "val"]
                    ],
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                selectionsMade: true
            },
            "class": "DiscreteSelectionsStr",
            context: {
                // by definition, for the discrete facet, the coreTransientSelectionQuery is equal to the coreStableSelectionQuery
                coreTransientSelectionQuery: [{ coreStableSelectionQuery: _ }, [me]],
                selectionsStr: [concatStr,
                    o(
                        [{ nameForSelectionsStr: _ }, [me]],
                        [{ discreteSelectionsStr: _ }, [me]]
                    )]
            }
        },
        // if selectionsMade: false, then there's no point in defining the stableSelectionQueries.
        {
            qualifier: {
                disabled: false,
                selectionsMade: true,
                effectiveExclusionMode: false
            },
            context: {
                coreStableSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    [
                        n([{ myApp: { noValueExpression: _ } }, [me]]),
                        [{ stableSelectionsObj: { included: _ } }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                selectionsMade: true,
                effectiveExclusionMode: true
            },
            context: {
                // note we use here the query of the format n({ "Geography": "Global"}), and not { "Geography": n("Global")}.
                // the reason is that if the "Geography" attribute is altogether missing, it would be selected by the first expression, and not
                // by the second (i.e. it would be excluded by the second, which is not what we want here)
                coreStableSelectionQuery: n(
                    [
                        [{ facetQuery: _ }, [me]],
                        [
                            // remove the "No Value" expression from the os of excluded that feeds into n() as it isn't found in actual item db
                            n([{ myApp: { noValueExpression: _ } }, [me]]),
                            [{ stableSelectionsObj: { excluded: _ } }, [me]]
                        ]
                    ]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class generates a string (e.g. "Included: Large Cap, Small Cap") from a set of discrete selections.
    // It is inherited by both DiscreteFacetXIntOverlay and SliderFacetXIntOverlay (which may also have discrete selections).
    //
    // API:
    // Inherited by a class that inherits SelectableFacetXIntOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteSelectionsStr: {
        "class": o("GeneralArea", "AllDiscreteValuesInFacet"),
        context: {
            // AllDiscreteValuesInFacet params
            noValue: [{ myApp: { noValueStr: _ } }, [me]],
            meaningfulDiscreteValues: [sort, // alphabetically
                o(
                    [{ includedForDisplay: _ }, [me]],
                    [{ excludedForDisplay: _ }, [me]]
                ),
                "ascending"
            ],

            sortedForDisplay: [
                [cond, // pick the selection query, depending on the value of effectiveExclusionMode
                    [{ effectiveExclusionMode: _ }, [me]],
                    o(
                        { on: false, use: [{ includedForDisplay: _ }, [me]] },
                        { on: true, use: [{ excludedForDisplay: _ }, [me]] }
                    )
                ],
                // this ensures we sort by allDiscreteValues - note AllDiscreteValuesInFacet, which handles the case this is the months of the year, etc.
                // i.e. an ordering which differs from the alphabetical ordering. that's why we select out of allDiscreteValues, instead of simply taking
                // includedForDisplay/excludedForDisplay
                [{ allDiscreteValues: _ }, [me]]
            ],
            valuableForDisplay: [ // the "no value", if it is present, should not be displayed as "no value-star", but simply as "no value"
                n([{ noValueStr: _ }, [me]]),
                [{ sortedForDisplay: _ }, [me]]
            ],

            noValueSelectionStr: [concatStr,
                o(
                    [cond, // if there are both valuable selections and a noValue selection to be displayed, add a separator
                        [and,
                            [{ valuableSelectionsMade: _ }, [me]],
                            [{ noValueSelectionMade: _ }, [me]]
                        ],
                        o({ on: true, use: [{ selectionSeparatorStr: _ }, [me]] })
                    ],
                    [cond, // if "no value" was selected, add it at the end of the string
                        [{ noValueSelectionMade: _ }, [me]],
                        o({ on: true, use: [{ noValueStr: _ }, [me]] })
                    ]
                )
            ],

            discreteSelectionsStr: [concatStr,
                o(
                    [cond,
                        [{ effectiveExclusionMode: _ }, [me]],
                        o(
                            { on: false, use: "Include" },
                            { on: true, use: "Exclude" }
                        )
                    ],
                    ": ",
                    [cond,
                        [{ myFacetDataObj: { facetUnitAsText: _ } }, [me]],
                        o(
                            {
                                on: true,
                                // so that o(1,2,3) results in "1-star, 2-star, 3-star"
                                use: [concatStr,
                                    o(
                                        [cond,
                                            [{ valuableSelections: _ }, [me]],
                                            o(
                                                {
                                                    on: true,
                                                    use: [concatStr,
                                                        [{ valuableForDisplay: _ }, [me]],
                                                        {
                                                            infix: [concatStr, o("-", [{ myFacetDataObj: { facetUnitAsText: _ } }, [me]], [{ selectionSeparatorStr: _ }, [me]])],
                                                            postfix: [concatStr, o("-", [{ myFacetDataObj: { facetUnitAsText: _ } }, [me]])]
                                                        }
                                                    ]
                                                }
                                            )
                                        ],
                                        [{ noValueSelectionStr: _ }, [me]]
                                    )
                                ]
                            },
                            {
                                on: false,
                                use: [concatStr,
                                    [{ sortedForDisplay: _ }, [me]],
                                    [{ selectionSeparatorStr: _ }, [me]]
                                ]
                            }
                        )
                    ]
                )
            ]
        }
    }
};
