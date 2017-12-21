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
// This library offers the rating facet functionality. A rating facet consists of a set of discrete values on some quality spectrum. 
// The user can select (include) any rating value (click), or select a rating-or-better (shift+click).
// This library makes extensive use of classes provided by the facetClasses.js and discreteFacetClasses.js libraries, as well as of the writableFacetClasses.js
//
// Two dimensions worth mentioning: 
// 1. Visualization: a rating value can be either textual or symbolic.
// 2. Writability: can the rating values of the items displayed be written over.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <ratingFacetDesignClasses.js>

var ratingConstants = {
    notSpecified: "Not Specified",
    defaultNumRatingSymbols: 5
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a rating facet. It is inherited by a variant of the Facet class.
    // It inherits:
    // 1. DiscreteFacet (Lean/Fat), which provides common functionality to the MS and Rating Facets.
    // 2. WritableFacet, if its { writableFacet: true } (determined by Facet, per the facet data description object).
    //
    // It embeds:
    // 1. selectableFacetXIntOSRs (see FacetWithAmoeba documentation, via DiscreteFacet): this class provides the description object for these intersection areas (Lean/Fat).
    // 2. a RatingAmoeba (when the facet is in the appropriate state) (Lean/Fat).
    // 
    // It obtains from the Facet data description object:
    // 1. ratingSymbol: "star" supported for now.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ratingSymbol: [{ dataObj: { ratingSymbol: _ } }, [me]],

                predefinedRatingLevels: [{ dataObj: { ratingLevels: _ } }, [me]]
            }
        },
        { // default
            context: {
                values: o(
                    [{ sortedMeaningfulDiscreteValues: _ }, [me]],
                    [{ noValueStr: _ }, [me]] // adding the 'unrated'
                ),
                bestRating: [first, [{ sortedMeaningfulDiscreteValues: _ }, [me]]]
            }
        },
        {
            qualifier: { predefinedRatingLevels: true },
            context: {
                numRatingLevels: [size, [{ dataObj: { ratingLevels: _ } }, [me]]],
                numRatingSymbols: [definedOrDefault,
                    [{ dataObj: { numRatingSymbols: _ } }, [me]],
                    ratingConstants.defaultNumRatingSymbols
                ],
                levelsToSymbolsRatio: [div,
                    [{ numRatingLevels: _ }, [me]],
                    [{ numRatingSymbols: _ }, [me]]
                ],
                sortedMeaningfulDiscreteValues: [div, // from the highest to the lowest
                    [minus,
                        [{ numRatingLevels: _ }, [me]],
                        [sequence, r(0, [minus, [{ numRatingLevels: _ }, [me]], 1])]
                    ],
                    [{ levelsToSymbolsRatio: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { predefinedRatingLevels: false }
            //"class": "FacetWithSortableDiscreteValues"            
        },
        {
            qualifier: { ratingSymbol: true },
            context: {
                ratingSymbolsFullWidth: [mul,
                    bRatingPosConst.symbolWidth, // to be replaced by displayQuery on image
                    [{ numRatingSymbols: _ }, [me]]
                ],

                maxWidthOfCells: [{ ratingSymbolsFullWidth: _ }, [me]] // override definition in NonOMFacet
            }
        },
        {
            qualifier: { writableFacet: true },
            "class": "WritableFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingFacet: o(
        { // default
            "class": o("RatingFacet", "DiscreteFacet"),
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "LeanRatingFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileRating ? "LeanRatingAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingFacet: o(
        { // default
            "class": o("RatingFacet", "DiscreteFacet"),
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "FatRatingFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileRating ? "FatRatingAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows access to several context labels of the RatingFacet. 
    // API: 
    // 1. myFacet: an areaRef to the associated facet.
    // We don't inherit TrackMyFacet directly, to obtain a definition of myFacet, as this class is inherited not only in Cells and their embeddedStar areas, but also in classes which 
    // are part of the Widgets, and those inherit TrackMyWidget to obtain their definition of myFacet (it isn't their embeddingStar facet when they're part of a horizontal widget).
    // Had we inherited TrackMyFacet, depending on the position of TrackMyRatingFacet in the os of classes inherited by some other class, its definition of myFacet could have overridden
    // the definition provided elsewhere, which we'd like to prevail (e.g. DiscreteValueName).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyRatingFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ratingSymbol: [{ myFacet: { ratingSymbol: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of RatingFaetXIntOSR and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of a RatingFacet and an intensional OSR of an overlay that's in the Standard (or Maximized) state.
    // This class is inherited by the selectableFacetXIntOSRs intersections which are embedded in the RatingFacet. 
    // It inherits DiscreteFacetXIntOSR (Lean/Fat - see below). 
    // This class embeds a RatingSelections class, which does the actual work of displaying/deleting/disabling the ms selections.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingFacetXIntOSR: o(
        { // default
        },
        {
            qualifier: {
                showTagsViewPane: false,
                selectionsMade: true
            },
            children: {
                selections: {
                    description: {
                        "class": "RatingSelections"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingFacetXIntOSR: {
        "class": o("RatingFacetXIntOSR", "LeanDiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingFacetXIntOSR: {
        "class": o("RatingFacetXIntOSR", "FatDiscreteFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the RatingFacetXIntOSR. It displays the rating selections for its facet/intensional overlay ancestors, and also allows their deletion/disabling.
    // It inherits FacetSelections.
    //
    // Selections are characterized by two auxiliary context labels, which indicate whether the selections are contiguous (e.g. 2*-4* rating, arguably not a very intuitive selection the
    // user could make), and if so, whether they're an or-better selection (e.g. "3* or better", a much more natural specification of a rating selection).
    //
    // Embedding: 
    // 1. If there are selections made: an areaSet of RatingSelections, each displaying a single selection made. 
    // 2. If these are or-better: a visual indicator (e.g. ">")
    //
    // Deletion of selections:
    // Note that there is one case in which this area, and not its embedded RateFacetSelection areas, handles a deletion of selections: if the selections are a contiguous range of values,
    // yet are *not* or-better (i.e. the range does not go all the way to the highest rating), then the delete control is created by RatingSelections. This is done in order to ensure
    // that there's only a single deletion control for the entire range.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelections: o(
        {
            qualifier: "!",
            context: {
                ratingOrBetter: [and,
                    [{ selectionsAreContiguous: _ }, [me]],
                    [equal,
                        [{ myFacet: { bestRating: _ } }, [me]],
                        [{ bestRatingSelected: _ }, [me]]
                    ]
                ]
            }
        },
        { // default
            "class": "FacetSelections",
            context: {
                orderedRatingSelections: [ // select the selections made out of the ordered set of rating levels, so as to obtain an ordering of these selections.
                    [{ content: { included: _ } }, [embedding]],
                    [{ myFacet: { sortedMeaningfulDiscreteValues: _ } }, [me]]
                ],
                worstRatingSelected: [last, [{ orderedRatingSelections: _ }, [me]]],
                bestRatingSelected: [first, [{ orderedRatingSelections: _ }, [me]]],
                contigRangeOfLowestAndHighestSelected: [range,
                    o(
                        [{ worstRatingSelected: _ }, [me]],
                        [{ bestRatingSelected: _ }, [me]]
                    ),
                    [{ myFacet: { sortedMeaningfulDiscreteValues: _ } }, [me]]
                ],
                selectionsAreContiguous: [and,
                    [greaterThan,
                        [size, [{ contigRangeOfLowestAndHighestSelected: _ }, [me]]],
                        1
                    ],
                    [equal,
                        [size,
                            [
                                [{ orderedRatingSelections: _ }, [me]],
                                [{ myFacet: { sortedMeaningfulDiscreteValues: _ } }, [me]]
                            ]
                        ],
                        [size, [{ contigRangeOfLowestAndHighestSelected: _ }, [me]]]
                    ]
                ]
            }
        },
        {
            qualifier: { selectionsMade: true },
            context: {
                rightMostElement: [{ lastRatingSelection: true }, [{ children: { selections: _ } }, [me]]] // overridden in case ratingOrBetter: true                
            },
            children: {
                selections: {
                    data: o(
                        [{ prefixOfSelectionsData: _ }, [me]], // defined by variants below
                        [cond,
                            [ // did we select the "noValue"?
                                [{ myApp: { noValueExpression: _ } }, [me]],
                                [{ content: { included: _ } }, [embedding]]
                            ],
                            o({ on: true, use: [{ myFacet: { noValueStr: _ } }, [me]] })
                        ]
                    ),
                    description: {
                        "class": "RatingSelection"
                    }
                }
            },
            write: {
                onRatingSelectionsResetValuableSelections: {
                    upon: [{ msgType: "ResetValuableSelections" }, [myMessage]],
                    true: {
                        resetValuableSelections: {
                            to: [ // remove from the content.included of the embedding all the "valuable" (i.e. non-noValue) selections
                                [{ valuableSelections: _ }, [me]],
                                [{ content: { included: _ } }, [embedding]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                selectionsMade: true,
                ratingOrBetter: true
            },
            context: {
                rightMostElement: [{ children: { orBetterModifier: _ } }, [me]],
                prefixOfSelectionsData: [{ worstRatingSelected: _ }, [me]] // for the data of the selections areaSet above
            },
            children: {
                orBetterModifier: {
                    description: {
                        "class": "RatingSelectionOrBetter"
                    }
                }
            }
        },
        {
            qualifier: {
                ratingOrBetter: false,
                selectionsAreContiguous: true
            },
            context: {
                prefixOfSelectionsData: o(  // for the data of the selections areaSet above
                    [{ worstRatingSelected: _ }, [me]],
                    [{ bestRatingSelected: _ }, [me]]
                )
            },
            children: {
                rangeModifier: {
                    description: {
                        "class": "RatingSelectionRangeModifier"
                    }
                }
            }
        },
        {
            qualifier: {
                ratingOrBetter: false,
                selectionsAreContiguous: false
            },
            context: {
                prefixOfSelectionsData: [reverse, [{ orderedRatingSelections: _ }, [me]]] // for the data of the selections areaSet above
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single rating selection and is embedded as an areaSet in RatingSelections class.
    // This class inherits DiscreteSelection.
    // 
    // It embeds, in case the rating symbol is defined:
    // 1. the rating selection value (e.g. "3").
    // 2. the rating selection symbol (e.g. "*").
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstRatingSelectionInRow: o(
                    [{ firstInAreaOS: _ }, [me]],
                    [{ noValue: _ }, [me]]
                ),
                lastRatingSelection: [{ lastInAreaOS: _ }, [me]],

                selectionsAreContiguous: [{ selectionsAreContiguous: _ }, [embedding]],
                ratingOrBetter: [{ ratingOrBetter: _ }, [embedding]],

                noValue: [equal, [{ myFacet: { noValueStr: _ } }, [me]], [{ val: _ }, [me]]],

                selectionsDisplayedOnASingleRow: o(
                    [and,
                        [{ orderedRatingSelections: _ }, [embedding]], // i.e. a real value (not noValue) was selected
                        [not, [{ noValueSelectionMade: _ }, [me]]]
                    ],
                    [and,
                        [not, [{ orderedRatingSelections: _ }, [embedding]]],
                        [{ noValueSelectionMade: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("RatingSelectionDesign",
                "MemberOfAreaOS",
                "TrackMyFacet",
                "TrackMyRatingFacet", // appears before DiscreteSelection so that TrackMyRatingFacet's definition of valueAsText prevails.
                "DiscreteSelection"),
            context: {
                deletable: [{ firstRatingSelectionInRow: _ }, [me]] // only the first element in each row will have a delete control
            }
        },
        {
            qualifier: { selectionsDisplayedOnASingleRow: true },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: {
                selectionsDisplayedOnASingleRow: false,
                noValue: false
            },
            position: {
                top: [{ verticalMarginFromEdgeFacetSelections: _ }, [embedding]]
            }
        },
        {
            qualifier: {
                selectionsDisplayedOnASingleRow: false,
                noValue: true
            },
            position: {
                bottom: [{ verticalMarginFromEdgeFacetSelections: _ }, [embedding]]
            }
        },
        {
            qualifier: {
                ratingSymbol: true,
                noValue: false
            },
            context: {
                valueAsText: false // note: this means that for a ratingSymbol: true that is noValue: true, we show it as text for now 
                // (as it retains the DiscreteSelection's definition).
            },
            children: {
                ratingFacetSelectionValue: {
                    description: {
                        "class": "RatingSelectionValue"
                    }
                }
            },
            position: {
                attachTextToSymbol: {
                    point1: {
                        element: [{ children: { ratingFacetSelectionValue: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { ratingFacetSelectionSymbol: _ } }, [me]],
                        type: "left"
                    },
                    equals: 2
                }
            }
        },
        {
            qualifier: {
                ratingSymbol: "star",
                noValue: false
            },
            children: {
                ratingFacetSelectionSymbol: {
                    description: {
                        "class": "RatingSelectionStar"
                    }
                }
            }
        },
        {
            qualifier: {
                firstRatingSelectionInRow: false,
                selectionsAreContiguous: false
            },
            "class": "MemberOfLeftToRightAreaOS",
            context: {
                // MemberOfLeftToRightAreaOS param:
                spacingFromPrev: bRatingPosConst.selectionHorizontalSpacing
            }
        },
        {
            qualifier: {
                deletable: true,
                noValue: false
            },
            context: {
                // CreateSelectionDeletionControl: override default params
                deleteMessage: "ResetValuableSelections",
                deleteMessageRecipient: [embedding]
            }
        },
        {
            qualifier: { firstRatingSelectionInRow: true },
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
                deletionControlRightToMyLeft: {
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
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Common code to all areas that are embedded in the RatingSelection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelectionElement: {
        "class": o("GeneralArea", "TrackMyFacetXIntOSR"),
        position: {
            "vertical-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The rating facet selection value (e.g. "3"). This class is embedded in the RatingSelection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelectionValue: {
        "class": o("RatingSelectionValueDesign", "RatingSelectionElement", "DisplayDimension"),
        context: {
            displayText: [{ val: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The rating facet selection symbol unit. This class is embedded in the RatingSelection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelectionStar: {
        "class": o("RatingSelectionStarDesign", "RatingSelectionElement"),
        position: {
            height: bRatingPosConst.symbolHeight,
            width: bRatingPosConst.symbolWidth
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The visual indication that the selection is for a selected rating value or-better.
    // This class is inherited by RatingSelections, in its appropriate variant.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelectionOrBetter: {
        "class": o("RatingSelectionOrBetterDesign", "GeneralArea", "DisplayDimension", "TrackMyFacetXIntOSR"),
        context: {
            displayText: " or better",
            valuableDisplayedSelections: [ // the sibling selection areas, excluding the one representing the "noValue"
                n({ val: [{ myFacetXIntOSR: { myFacet: { noValueStr: _ } } }, [me]] }),
                [{ children: { selections: _ } }, [embedding]]
            ]
        },
        position: {
            attachToRatingSelectionRight: {
                point1: {
                    element: [{ valuableDisplayedSelections: _ }, [me]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: bRatingPosConst.leftMarginOfOrBetterIndicator
            },
            attachToRatingSelectionVerticalCenter: {
                point1: {
                    element: [{ valuableDisplayedSelections: _ }, [me]],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The visual indication that the selection is for a range of selections, thought NOT an or-better selection. For example (and not very intuitive): "3*-4*", and implicitly, "but not 5*".
    // This class is inherited by RatingSelections, in its appropriate variant.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSelectionRangeModifier: {
        "class": o("RatingSelectionRangeModifierDesign", "RatingSelectionElement", "DisplayDimension"),
        context: {
            displayText: " - "
        },
        position: {
            attachToLowerRatingSelection: {
                point1: {
                    element: [first, [{ children: { selections: _ } }, [embedding]]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            attachToHigherRatingSelection: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [last, [{ children: { selections: _ } }, [embedding]]],
                    type: "left"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of RatingFaetXIntOSR and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Amoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a rating amoeba. It inherits DiscreteAmoeba.
    // This class embeds the primary rating amoeba (Lean/Fat).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingAmoeba: {
        "class": "DiscreteAmoeba"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingAmoeba: {
        "class": "RatingAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "LeanRatingPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingAmoeba: {
        "class": "RatingAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "FatRatingPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a ratingWidget on the primary axis (currently: the vertical axis). It is embedded in the ratingAmoeba.
    // This class inherits the RatingWidget (Lean/Fat) and the DiscretePrimaryWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingPrimaryWidget: {
        "class": "DiscretePrimaryWidget"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingPrimaryWidget: {
        "class": o("RatingPrimaryWidget", "LeanRatingWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingPrimaryWidget: {
        "class": o("RatingPrimaryWidget", "FatRatingWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a RatingWidget on the secondary axis (the horizontal axis, currently). 
    // It inherits RatingWidget and DiscreteSecondaryWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSecondaryWidget: {
        "class": o("DiscreteSecondaryWidget", "FatRatingWidget") // the secondary widget is defined only for the Fat family of classes!
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a rating widget. 
    // A rating widget is the container that lists all possible values for a rating facet, allows to select (include/exclude) for the different intensional overlays, and displays 
    // the projection of the extensional overlays on its associated facet. 
    //
    // It is inherited by the RatingPrimaryWidget/RatingSecondaryWidget, which inherit DiscretePrimaryWidget/DiscreteSecondaryWidget (which in turn inherit DiscreteWidget).
    //
    // Embeds: 
    // 1. values: an areaSet of single rating values. 
    // 2. permOverlayXWidgets: an areaSet of RatingPermOverlayXWidgets (Lean/Fat), each representing a single overlay on Showing. The data for this areaSet is provided by the Widget class, 
    //    inherited by the sibling primaryWidget.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingWidget: {
        "class": o("GeneralArea"),
        children: {
            permOverlayXWidgets: {
                // data: provided by Widget, inherited by PrimaryWidget/SecondaryWidget, the two possible sibling classes
                description: {
                    "class": "RatingPermOverlayXWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingWidget: {
        "class": "RatingWidget",
        children: {
            valuesView: {
                description: {
                    "class": "LeanRatingValuesView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingWidget: {
        "class": "RatingWidget",
        children: {
            valuesView: {
                description: {
                    "class": "FatRatingValuesView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingValuesView: {
        "class": "DiscreteValuesView"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingValuesView: {
        "class": "RatingValuesView",
        children: {
            values: {
                // data: provided by DiscreteValuesView
                description: {
                    "class": "LeanRatingValue"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingValuesView: {
        "class": "RatingValuesView",
        children: {
            values: {
                // data: provided by RatingValuesView
                description: {
                    "class": "FatRatingValue"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single rating value, inherited by the values areaSet in the RatingWidget class. The possible rating values are determined by the values attribute
    // of the associated facet's data object.   
    // The rating values are defined and ordered in the RatingFacet description object.
    // It inherits DiscreteValue.
    // 
    // It embeds: 
    // 1. RatingValueName: which displays the actual name of this single value (e.g. "Good").
    // 2. PermOverlayRatingValue: these are areas formed by the intersection of this class with the DiscretePermOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingValue: {
        "class": o("RatingValueDesign", "DiscreteValue"),
        context: {
            myValueAndBetter: [range,
                o(
                    [{ value: _ }, [me]],
                    [{ myFacet: { bestRating: _ } }, [me]]
                ),
                [{ myFacet: { values: _ } }, [me]]
            ]
        },
        children: {
            valueName: {
                description: {
                    "class": "RatingValueName"
                }
            },
            permOverlayXDiscreteValues: {
                // partner: provided by DiscreteValue
                description: {
                    "class": "PermOverlayRatingValue"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanRatingValue: {
        "class": "RatingValue"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatRatingValue: {
        "class": "RatingValue"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the actual name of a single rating value. It is embedded in the RatingValue. It inherits DiscreteValueName and TrackMyRatingFacet.
    //
    // If ratingSymol is defined, then this class inherits RatingSymbolsValue, which creates an array of symbols representing a rating value.
    // If rating symbol is not defined, then the name is displayed as text (see DiscreteValueName).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingValueName: o(
        { // default
            "class": o(
                "RatingValueNameDesign",
                "DiscreteValueName",   // provides a definition of myFacet (assumed by TrackMyRatingFacet) via its inheritance of TrackMyWidget.
                "TrackMyRatingFacet"
            )
        },
        {
            qualifier: {
                ratingSymbol: true,
                noValue: false
            },
            "class": "RatingSymbolsValue",
            context: {
                ratingVal: [{ value: _ }, [embedding]],
                horizontalRatingSymbol: [{ ofVerticalElement: _ }, [me]],
                valueAsText: false // note: this means that for a ratingSymbol: true that is noValue: true, we show it as text for now 
                // (as it retains the DiscreteValueName's definition).
            }
        },
        {
            qualifier: {
                ratingSymbol: true,
                ofVerticalElement: true
            },
            context: {
                displayWidth: [{ myFacet: { ratingSymbolsFullWidth: _ } }, [me]]
            },
            position: {
                left: bRatingPosConst.marginAroundSymbolsValueName,
                toBeginningOfFirstOverlayXWidget: { // as the content is allowed to spill over to the right of that posPoint
                    point1: { type: "right" },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: bRatingPosConst.marginAroundSymbolsValueName
                }
            }
        },
        {
            qualifier: {
                ratingSymbol: true,
                ofVerticalElement: false
            },
            position: {
                top: bRatingPosConst.marginAroundSymbolsValueName,
                bottom: bRatingPosConst.marginAroundSymbolsValueName
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a permanent overlay in a RatingWidget.
    // It inherits DiscretePermOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingPermOverlayXWidget: { // default
        "class": "DiscretePermOverlayXWidget"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an intersection formed by RatingValue and RatingPermOverlayXWidget (of the latter, there's one per zoomboxed permanent overlay in the Showing state).
    // It inherits PermOverlayDiscreteValue.
    // When representing an extensional overlay, the inherited PermOverlayDiscreteValue provides the needed functionality.
    // When representing an intensional overlay, this class inherits RatingAddToSelections and PermIntOverlayDiscreteValue.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayRatingValue: o(
        { // default
            "class": "PermOverlayDiscreteValue"
        },
        // the variant for the extensional overlay is included in the inherited PermOverlayDiscreteValue
        {
            qualifier: { ofIntOverlay: true },
            "class": "PermIntOverlayRatingValue"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntOverlayRatingValue: o(
        { // default          
            "class": "PermIntOverlayDiscreteValue"
        },
        {
            qualifier: { amISelected: false },
            write: {
                onPermIntOverlayRatingValueMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        addValues: {
                            to: [{ addToSelectionsData: _ }, [me]],
                            merge: push(
                                [cond,
                                    // if the noValue, add only it. if a rated value, add it and better!
                                    [{ noValue: _ }, [me]],
                                    o(
                                        {
                                            on: true,
                                            use: [{ value: _ }, [me]]
                                        },
                                        {
                                            on: false,
                                            use: [ // push only those not already in selectionsPerInclusionMode
                                                n([{ addToSelectionsData: _ }, [me]]),
                                                [{ myValueAndBetter: _ }, [embedding]]
                                            ]
                                        }
                                    )
                                ]
                            )
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
    // Beginning Symbols Value (e.g. the five stars) and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a rating value expressed as an array of symbols. It is inherited by RatingSymbolsValueCellDisplay and RatingValueName.
    // It embeds an area that displays the symbols (only stars for now)
    // 
    // API:
    // 1. myFacet   
    // 2. ratingVal: a number, between worstRating and bestRating, which will determine how many of the stars are marked as full (for now, only integers are supported).
    // 3. noValue: does this instance represent a "No Value"
    // three parameters provided by the Design class: 
    // 3. emptySymbol: an image of the empty symbol
    // 4. fullSymbol: an image of the full symbol
    // 5. emphasizedSymbol: an image of the symbol's appearance when it is emphasized - when hovering over it or a cell in its SolutionSetItem, or when 
    //    editing its value (in an editable rating cell, that is)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSymbolsValue: o(
        { // default
            "class": "TrackMyRatingFacet"
        },
        {
            qualifier: { noValue: false },
            children: {
                fullSymbols: {
                    description: {
                        "class": "RatingFullSymbols"
                    }
                }
            }
        },
        {
            qualifier: { horizontalRatingSymbol: true },
            position: {
                "vertical-center": 0,
                "content-height": bRatingPosConst.symbolHeight, // to be replaced by displayQuery on image
                "content-width": [{ myFacet: { ratingSymbolsFullWidth: _ } }, [me]]
            }
        },
        {
            qualifier: { horizontalRatingSymbol: false },
            position: {
                "horizontal-center": 0,
                "content-height": [mul,
                    bRatingPosConst.symbolHeight, // to be replaced by displayQuery on image
                    [{ myFacet: { numRatingSymbols: _ } }, [me]]
                ],
                "content-width": bRatingPosConst.symbolWidth
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Common code to RatingFullSymbols and RatingEmphasizedSymbols
    // 
    // API:
    // 1. ratioOfSymbolsArray: the fraction it should cover of the width (in a horizontal array) of an array of symbols.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSymbolsCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofRatingValueName: [
                    "RatingValueName",
                    [classOfArea, [{ myRatingSymbolsValue: _ }, [me]]]
                ],
                horizontalRatingSymbol: [{ horizontalRatingSymbol: _ }, [embedding]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyRatingFacet"),
            context: {
                myRatingSymbolsValue: [embedding]
            },
            position: {
                // this is the heart of this class: for the horizontal case, the width of the full symbols (yellow stars, for examples) extends as wide as the ratio 
                // of the ratingVal to the numRatingSymbols.
                // lowHTMLLength/highHTMLLength: defined in variants below
                highHTMLLengthConstraint: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [mul,
                        [{ myRatingSymbolsValue: { myFacet: { ratingSymbolsFullWidth: _ } } }, [me]],
                        [{ ratioOfSymbolsArray: _ }, [me]]
                    ]
                }
            }
        },
        {
            qualifier: { horizontalRatingSymbol: true },
            "class": "Horizontal",
            position: {
                left: 0,
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { horizontalRatingSymbol: false },
            "class": "Vertical",
            position: {
                top: 0,
                left: 0,
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingFullSymbols: {
        "class": o("RatingFullSymbolsDesign", "RatingSymbolsCore"),
        context: {
            ratioOfSymbolsArray: [div,
                [{ myRatingSymbolsValue: { ratingVal: _ } }, [me]],
                [{ myRatingSymbolsValue: { myFacet: { numRatingSymbols: _ } } }, [me]]
            ],

            disabledAppearance: [and,
                [{ ofRatingValueName: _ }, [me]],
                [not, [{ myRatingSymbolsValue: { inEffectiveBaseValues: _ } }, [me]]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    RatingEmphasizedSymbols: {
        "class": o("RatingEmphasizedSymbolsDesign", "RatingSymbolsCore"),
        context: {
            // ratioOfSymbolsArray: defined in the description object in the embedding class' children section.
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // End Symbols Value (e.g. the five stars) and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // Beginning of RatingCell and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum to Cell, inherited when it pertains to a RatingFacet. 
    // Its logic is determined by two dimensions: writability, and symbol-vs-text.
    // 
    // It inherits: 
    // 1. If of a writable facet: WritableCell.
    // 2. Either SymbolicRatingCell or TextualRatingCell, depending on the type of rating facet.
    // 
    // It embeds: 
    // 1. If of a symbol rating: RatingSymbolsValueCellDisplay
    // 2. If of a textual and writable rating: RatingWritableTextualCellDisplay, which provides the dropDownMenu functionality on doubleClick.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingCell: o(
        { // default 
        },
        { // this is for both rating symbol and rating text facets!
            qualifier: { ofWritableFacet: true },
            "class": "WritableCell"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SymbolicRatingCell: o(
        { // default
            children: {
                cellDisplay: {
                    description: {
                        "class": "RatingSymbolsValueCellDisplay"
                    }
                }
            }
        },
        {
            qualifier: { ofFacetShowingAmoeba: false },
            position: {
                centerCellContentWithMyFacetSelections: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        type: "horizontal-center",
                        content: true
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TextualRatingCell: o(
        { // default
        },
        {
            qualifier: { ofWritableFacet: true },
            context: {
                // override the default definition of immunityFromTurningWriteModeOff (see WritableCell) with one that includes the elements of the dropDownMenu
                immunityFromTurningWriteModeOff: o(
                    [me],
                    [embeddedStar, [me]],
                    [
                        { myDropDownMenuable: [{ children: { cellDisplay: _ } }, [me]] },
                        [areaOfClass, "DropDownMenuElement"]
                    ]
                )
            },
            children: {
                cellDisplay: {
                    description: {
                        "class": "RatingWritableTextualCellDisplay"
                    }
                }
            }
        },
        {
            qualifier: { ofWritableFacet: false },
            "class": "TextualCell"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by RatingSymbolsValueCellDisplay and RatingWritableTextualCellDisplay, both which are embedded in the RatingCell.
    // It is slightly smaller than its embedding class, and so can provide visual indication that the RatingCell is in writeMode: true.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingCellDisplay: {
        "class": o("TrackMyFacet", "TrackMyRatingFacet", "TrackMyWritableCell"),
        context: {
            myFacet: [{ myCell: { myFacet: _ } }, [me]]
        },
        position: {
            "vertical-center": 0
            // height determined by sibling classes
            // left/right determined by embedding class using MinWrapHorizontal
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays a symbols value in a rating cell. 
    // It inherits RatingCellDisplay, RatingSymbolsValue, and MinWrapHorizontal.
    // It embeds:
    // 1. It adds to the ratingSymbols areaSet, inherited from RatingSymbolsValue, the additional inheritance of RatingWritableSymbolUX, which allow the individual symbols to take 
    //    part in writing a new rating value (and for which we also define hoveringOverMeOrBetter, to give a visual indication before an actual value is selected by the user).
    // 2. When in writeMode and if a meaningful value is already defined: RatingSymbolCellDeleteControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSymbolsValueCellDisplay: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                noValue: [not, [{ ratingVal: _ }, [me]]],
                centerInCell: [not, [{ myFacet: { showAmoeba: _ } }, [me]]]
            }
        },
        { // default
            "class": o("RatingSymbolsValueCellDisplayDesign", "RatingCellDisplay", "RatingSymbolsValue", "MinWrapHorizontal"),
            context: {
                myCell: [embedding],
                // RatingSymbolsValue params: 
                ratingVal: [{ myCell: { content: _ } }, [me]],
                horizontalRatingSymbol: true
            }
        },
        {
            qualifier: { centerInCell: false },
            position: {
                left: 0
            }
        },
        {
            qualifier: { centerInCell: true },
            position: {
                "horizontal-center": 0
            }
        },
        {
            qualifier: {
                writableCellValueDefined: true,
                writeMode: true
            },
            children: {
                ratingSymbols: {
                    description: {
                        "class": "RatingWritableSymbolUX", // the val, expected by RatingWritableSymbolUX, is provided by the sibling RatingSymbol class.
                        context: {
                            hoveringOverMeOrBetter: [and, // for the RatingStarDesign
                                [{ writeMode: _ }, [me]],
                                [
                                    { inArea: _ },
                                    [nextStar, [{ myCell: { children: { ratingSymbols: _ } } }, [me]], [me]]
                                ]
                            ]
                        }
                    }
                },
                deleteControl: {
                    description: {
                        "class": "RatingSymbolCellDeleteControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides a delete control button that appears in a symbol rating cell which has a meaningful value, when it's in writeMode: true. 
    // It is embedded in RatingSymbolsValueCellDisplay.
    // It inherits RatingWritableSymbolUX to allow it to write a new value to the cell.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingSymbolCellDeleteControl: {
        "class": o("RatingSymbolCellDeleteControlDesign", "RatingWritableSymbolUX"),
        context: {
            val: "notDefined" // replace "notDefined" with atomic(), once appData supports the join operation
        },
        position: {
            "vertical-center": 0,
            height: 14, // replace with display query
            width: 14, // replace with display query
            attachToLastSymbol: {
                point1: {
                    element: [last, [{ children: { ratingSymbols: _ } }, [embedding]]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: bRatingPosConst.deleteControlOffsetFromRatingValue
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to update the associated rating value.
    // It is inherited by the ratingSymbols areaSet in a rating cell, and by RatingSymbolCellDeleteControl
    // API: 
    // 1. val: either o() (provided by RatingSymbolCellDeleteControl) or > 0 (provided by RatingSymbols of the associated RatingCell).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingWritableSymbolUX: o(
        { // default
            "class": o("GeneralArea", "TrackMyRatingFacet", "TrackMyWritableCell")
        },
        {
            qualifier: { writeMode: true },
            write: {
                onRatingWritableSymbolUXMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        writeModeOff: {
                            to: [{ writeMode: _ }, [me]],
                            merge: false
                        },
                        updateWritableAVP: {
                            to: [{ myWritableCell: { content: _ } }, [me]],
                            merge: [{ val: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays the content of a textual ratingCell, and allows to write different values to it (selected by the user from a dropDownMenu).
    // It inherits DropDownMenuable. The latter's showControl is mapped to writeMode, and so is activated when we switch to writeMode: true.
    // Note that in providing the logical/display values to DropDownMenuable, we append "notDefined"/ratingConstants.notSpecified to these two os, respectively.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingWritableTextualCellDisplay: {
        "class": o("RatingWritableTextualCellDisplayDesign", "RatingCellDisplay", "DropDownMenuable"),
        context: {
            // DropDownMenuable params: 
            showControl: [{ writeMode: _ }, [me]],
            dropDownMenuLogicalSelectionsOS: o(
                [{ myFacet: { values: _ } }, [me]],
                "notDefined"
            ),
            dropDownMenuDisplaySelectionsOS: o(
                [{ myFacet: { values: _ } }, [me]],
                ratingConstants.notSpecified
            ),
            dropDownMenuLogicalSelection: [{ myWritableCell: { content: _ } }, [me]],
            dropDownMenuTextForNoSelection: ratingConstants.notSpecified
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // End of RatingCell and embedded classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // See documentation for DiscreteFacetXIntOverlay
    // Note: DiscreteFacetXIntOverlay supports exclusion mode, of which we currently don't make use in the RatingFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RatingFacetXIntOverlay: {
        "class": "DiscreteFacetXIntOverlay"
    }
};  
