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
// This library includes the basic facet building blocks.
// Three libraries of more-specific building blocks that work with it are sliderFacetClasses, discreteFacetClasses, and omFacetClasses:
// classes in those libraries inherit classes in this library, but also variants of classes in this library inherit classes from those libraries.
// This library is also used by two higher-level libraries: overlayClasses, and fsAppClasses.
// 
// Documentation note: Lean/Fat always inherit a common class. I consider the Lean/Fat separation a temporary one, till the system performance is adequate. For that reason, even
// for functionality that resides only in the Fat version of a class, its documentation will reside with the common class, in expectation that this functionality will migrate back there
// soon enough.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <facetDesignClasses.js>

var facetConstants = {
    defaultFacetState: facetState.standard,
    defaultFacetStats: false,
    defaultFacetUnminimizable: false,
    defaultSettingsPanelIsOpen: false
};

initGlobalDefaults.debugMeasure = {
    facetID: o(),
    "function": o()
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetClipper: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedTrashedFacet: [and,
                    [{ trashed: _ }, [me]],
                    [{ appTrashOpen: _ }, [me]],
                    [{ trashFacetTabSelected: _ }, [me]]
                ],
                iAmDraggedToReorder: [mergeWrite,
                    [{ myFacetNPADDataObj: { iAmDraggedToReorder: _ } }, [me]],
                    false
                ],
                settingsPanelIsOpen: [mergeWrite,
                    [{ myFacetNPADDataObj: { settingsPanelIsOpen: _ } }, [me]],
                    [{ facetConstants: { defaultSettingsPanelIsOpen: _ } }, [globalDefaults]]
                ],
                loading: [{ myApp: { loading: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "DraggableToReorderClipper", "TrackAppTrash", "TrackMyFacetDataObj"),
            context: {
                uniqueID: [{ param: { areaSetContent: _ } }, [me]],
                myFacetUniqueID: [{ uniqueID: _ }, [me]], // TrackMyFacetDataObj param

                dataObj: [{ myFacetDataObj: _ }, [me]],

                defaultName: [cond,
                    [{ dataObj: { name: _ } }, [me]],
                    o(
                        { on: true, use: [{ dataObj: { name: _ } }, [me]] },
                        { on: false, use: [{ dataObj: { uniqueID: _ } }, [me]] }
                    )
                ],
                name: [mergeWrite,
                    [{ crossViewFacetDataObj: { name: _ } }, [me]],
                    [{ defaultName: _ }, [me]]
                ],

                // Clipper param
                clipper: [cond,
                    [{ clippedDraggedToReorder: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [areaOfClass, "ZoomBoxOrnament"]
                        },
                        {
                            on: false,
                            use: [{ myPane: _ }, [me]]
                        }
                    )
                ],

                // the NPAD that is referenced by ReorderableFacetHandle, to store the pointer's offset from the dragged facet.
                // this allows the offset to remain fixed during such a drag, even as the area itself is swapped between FacetClippers children 
                // (minimizedFacet <-> expandedFacet)
                "*verticalOffsetOfPointerOnDragged": 0,
                "*horizontalOffsetOfPointerOnDragged": 0,

                facetTagsDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { facetTagsData: _ } }, [me]]
                ],
                allFacetTags: o(
                    [{ facetTagsDataObj: { tags: _ } }, [me]],
                    [{ crossViewFacetDataObj: { userAssignedTags: _ } }, [me]]
                ),
                allFacetTagsSorted: [ // sorted (and limited to) the tags in FacetTagsController
                    // (a preloadedTag from the configuration file, which the user globally-deleted, would then be removed by this query)
                    [{ allFacetTags: _ }, [me]],
                    [{ tags: _ }, [areaOfClass, "FacetTagsController"]]
                ],
                // the AD is the explicit list of deleted tags, and not the remaining tags.
                // this would allow, for example, for the configuration file tags to be refined for an existing user, with a preexisting state,
                // and the new tags added would be displayed (minus those tags explicitly deleted previously, obviously)
                deletedTags: [{ crossViewFacetDataObj: { deletedTags: _ } }, [me]],
                tags: [
                    n([{ deletedTags: _ }, [me]]),
                    [{ allFacetTagsSorted: _ }, [me]]
                ],

                unsortedCompressedEffectiveBaseValues: [
                    [{ facetProjectionQuery: _ }, [me]],
                    [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                ],
                effectiveBaseOverlayProjectedValues: [
                    [{ facetProjectionQuery: _ }, [me]],
                    [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                ],
                compressedEffectiveBaseValues: [{ effectiveBaseOverlayProjectedValues: _ }, [me]],

                // compressedEffectiveBaseNumericalValues defined here and not in SliderFacet because it also
                // participates in the decision of whether to allow the user to switch to SliderFacet-type at all.
                compressedEffectiveBaseNumericalValues: [
                    r(-Number.MAX_VALUE, Number.MAX_VALUE),
                    // the purpose of this calculation!
                    [{ compressedEffectiveBaseValues: _ }, [me]]
                ],
                globalBaseOverlayProjectedValues: [
                    [{ facetProjectionQuery: _ }, [me]],
                    [{ myApp: { itemDB: _ } }, [me]]
                ],
                compressedGlobalBaseValues: [_,
                    [{ globalBaseOverlayProjectedValues: _ }, [me]]
                ]
            },
            stacking: {
                aboveMyPane: {
                    higher: [me],
                    lower: [{ myPane: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofUDF: true },
            "class": "UDFacetClipper"
        },
        {
            qualifier: { trashed: false },
            "class": "NonTrashedFacetClipper"
        },
        {
            qualifier: { embedTrashedFacet: true },
            children: {
                trashedFacet: compileTrash ?
                    {
                        description: {
                            "class": "TrashedFacet"
                        }
                    } :
                    {}
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonTrashedFacetClipper: o(
        {
            qualifier: "!",
            context: {
                createFacet: [and,
                    // needed, for example, for UDFs: their Clipper always exist. 
                    // but their embedded facet should be created only if it is onDataSource, and is showing.
                    [
                        [{ uniqueID: _ }, [me]],
                        [{ myApp: { facetToBeCreatedUniqueIDs: _ } }, [me]]
                    ],
                    o(
                        [not, [{ ofUDF: _ }, [me]]],
                        [and,
                            [{ ofUDF: _ }, [me]],
                            [{ onDataSource: _ }, [me]]
                        ]
                    )
                ]
            }
        },
        { // default
            "class": "GeneralArea"
        },
        {
            qualifier: {
                createFacet: true,
                minimized: true
            },
            context: {
                myPaneContainer: [areaOfClass, "MinimizedFacetViewPane"] // myPane is not MinimizedFacetViewPane, but rather its embedded MinimizedFacetsView!
            },
            children: {
                minimizedFacet: {
                    description: {
                        "class": compileMinimizedFacets ? "MinimizedFacet" : o()
                    }
                }
            }
        },
        {
            qualifier: {
                createFacet: true,
                expanded: true,
                loading: false
            },
            children: {
                expandedFacet: {
                    description: {
                        "class": "ExpandedFacet"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a facet. An areaSet of facets is embedded in a FacetViewPane (currently there are two FacetViewPanes embedded in FSApp). Facets are vertical rectangles,
    // displayed one next to the other.
    // Facets can be divided according to several criteria. 
    // 1. facetType: Slider/MS/Rating/ItemValues.
    // 2. OMF vs. other facets
    // 3. in moving pane vs. in frozen pane.
    //
    // This class inherits: 
    // 1. via several facetType-specific variants (L/F).
    // 2. MovingFacet/FrozenFacet, depeneding on the type of FacetViewPane it's embedded in.
    //
    // facet appData:
    // the facet has an (expansion) state which is initialized to the value provided by the areaSetContent.
    // 
    // API:
    // 1. myPane
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Facet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstFacetInPane: [
                    [me],
                    [{ myPane: { firstFacetInPane: _ } }, [me]]
                ],
                lastFacetInPane: [
                    [me],
                    [{ myPane: { lastFacetInPane: _ } }, [me]]
                ],

                writableFacet: [{ dataObj: { write: _ } }, [me]], // can the user write onto the values in this facet's cells.

                displayedUniqueIDFacet: [equal, // is this the (singular) facet displaying the id by which solutionSetItems are uniquely identified.
                    [{ uniqueID: _ }, [me]],
                    [{ myApp: { displayedUniqueID: _ } }, [me]]
                ],

                summaryView: [{ myApp: { facetSummaryView: _ } }, [me]], // when FSApp is in facetSummaryView, all facets are to be displayed in their summary state.                
                unminimizable: [definedOrDefault, // if true, the facet cannot be minimized.
                    [{ dataObj: { unminimizable: _ } }, [me]],
                    facetConstants.defaultFacetUnminimizable
                ],

                selectorBeingModified: [{ myApp: { selectorBeingModified: _ } }, [me]],

                aUDFBeingEdited: [{ myApp: { aUDFBeingEdited: _ } }, [me]], // any UDF!

                noValue: [cond, // add noValueStr only if there are items in the effective base which are missing a value in this facet
                    [{ itemsOfMissingValues: _ }, [me]],
                    o({ on: true, use: [{ noValueStr: _ }, [me]] })
                ],
                embedHeader: [and,
                    [not, [{ myPane: { horizontallyMinimized: _ } }, [me]]],
                    o(
                        [{ inView: _ }, [me]],
                        [{ iAmDraggedToReorder: _ }, [me]]
                    )
                ],

                tmdAppData: false, // do not inherit Tmdable; dragging is done via the ReorderableFacetHandle. overrides value defined in all classes inherited in variants
                iAmDraggedToReorder: [{ iAmDraggedToReorder: _ }, [embedding]],
                tmd: [{ iAmDraggedToReorder: _ }, [me]]
            }
        },
        { // default
            "class": o("FacetDesign", "GeneralArea", "SelectableFacet", "DraggableToReorder", "TaggableEntity", "TrackMyFacetDataObj"),
            context: {
                uniqueID: [{ uniqueID: _ }, [embedding]],
                myFacetUniqueID: [{ uniqueID: _ }, [me]], // TrackMyFacetDataObj param

                dataObj: [{ dataObj: _ }, [embedding]],

                // TaggableEntity params: 
                myTagsController: [areaOfClass, "FacetTagsController"], // override default
                taggableEntityStr: [{ myApp: { facetEntityStr: _ } }, [me]],
                tags: [{ tags: _ }, [embedding]],
                userAssignedTags: [{ crossViewFacetDataObj: { userAssignedTags: _ } }, [me]],
                deletedTags: [{ deletedTags: _ }, [embedding]],

                myFacet: [me], // for convenience, allows not distinguishing between Facet and its embeddedStar areas which inherit TrackMyFacet
                myAmoeba: [
                    { myFacet: [me] },
                    [areaOfClass, "Amoeba"]
                ],
                myFacetHeader: [
                    { myFacet: [me] },
                    [areaOfClass, "FacetHeader"]
                ],
                myReorderHandle: [
                    { myFacet: [me] },
                    [areaOfClass, "ReorderableFacetHandle"]
                ],
                myFacetName: [
                    { myFacet: [me] },
                    [areaOfClass, "FacetName"]
                ],
                myFacetMinimizationControl: [
                    { myFacet: [me] },
                    [areaOfClass, "FacetMinimizationControl"]
                ],
                myAmoebaCloseControl: [
                    { myFacet: [me] },
                    [areaOfClass, "AmoebaCloseControl"]
                ],

                myFSP: [
                    { myFacet: [me] },
                    [areaOfClass, "FSP"]
                ],

                myPrimaryWidget: [
                    { myFacet: [me] },
                    [areaOfClass, "PrimaryWidget"]
                ],

                myAmoebaControlPanel: [
                    { myFacet: [me] },
                    [areaOfClass, "AmoebaControlPanel"]
                ],
                myFSPController: [
                    { myFacet: [me] },
                    [areaOfClass, "FSPController"]
                ],
                formulaPanelController: [
                    { myFacet: [me] },
                    [areaOfClass, "UDFFormulaPanelController"]
                ],

                // TrashableElement params:
                // uniqueID: see above 
                trashedOrder: [{ myApp: { trashedOrderFacetUniqueID: _ } }, [me]],
                expandedOrder: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],

                // replace with block that follows once #1554 is fixed!
                //name: [mergeWrite,
                //       [{ dataObj: { name:_ } }, [me]],
                //       [{ dataObj: { uniqueID:_ } }, [me]]
                //      ],
                //defaultDescriptionText: "<User-Defined Description>",              
                //description: [mergeWrite,
                //              [{ dataObj: { tooltipText:_ } }, [me]],
                //              [{ defaultDescriptionText:_ }, [me]]
                //             ],            

                name: [{ name: _ }, [embedding]],
                coreDefaultDescriptionText: "<User-Defined Description>", // OMF overrides this definition
                defaultDescriptionTextFromDataObj: [{ dataObj: { tooltipText: _ } }, [me]],
                defaultDescriptionText: [cond,
                    [{ defaultDescriptionTextFromDataObj: _ }, [me]],
                    o(
                        { on: true, use: [{ defaultDescriptionTextFromDataObj: _ }, [me]] },
                        { on: false, use: [{ coreDefaultDescriptionText: _ }, [me]] }
                    )
                ],
                description: [mergeWrite,
                    [{ crossViewFacetDataObj: { description: _ } }, [me]],
                    [{ defaultDescriptionText: _ }, [me]]
                ],

                settingsPanelIsOpen: [{ settingsPanelIsOpen: _ }, [embedding]],
                facetPanelIsOpen: o(
                    [{ settingsPanelIsOpen: _ }, [me]],
                    [{ formulaPanelIsOpen: _ }, [me]] // see UDF
                ),

                states: [{ myApp: { facetCoreStates: _ } }, [me]], // default definition

                unsortedCompressedEffectiveBaseValues: [{ unsortedCompressedEffectiveBaseValues: _ }, [embedding]],
                effectiveBaseOverlayProjectedValues: [{ effectiveBaseOverlayProjectedValues: _ }, [embedding]],
                compressedEffectiveBaseValues: [{ compressedEffectiveBaseValues: _ }, [embedding]],

                compressedEffectiveBaseNumericalValues: [{ compressedEffectiveBaseNumericalValues: _ }, [embedding]],
                globalBaseOverlayProjectedValues: [{ globalBaseOverlayProjectedValues: _ }, [embedding]],
                compressedGlobalBaseValues: [{ compressedGlobalBaseValues: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofUDF: true },
            "class": compileUDF ? "UDFacet" : o(),
        },
        {
            qualifier: { trashed: false },
            "class": "NonTrashedFacet"
        },
        {
            qualifier: { embedHeader: true },
            children: {
                header: {
                    description: {
                        "class": "FacetHeader",
                    }
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            "class": "AboveAllNonDraggedFacets"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanFacet: {
        "class": "Facet"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatFacet: {
        "class": "Facet",
        context: {
            states: o(
                [{ myApp: { facetCoreStates: _ } }, [me]]/*, no 2D Plot for now
                {
                    uniqueID: facetState.twoDPlot,
                    tooltipText: "2D Plot"
                }*/
            )
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines a set of useful context labels from the associated facet, which the inheriting class can use as qualifiers.
    // 
    // API: 
    // 1. myFacet: an areaRef to the associated facet. the embeddingStar facet is the default value. 
    //    inheriting classes may choose to override this default value: for example, elements which reside in the secondaryWidget (including the secondaryWidget itself) would do so as 
    //    they do not represent their embeddingStar facet!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyFacet: o(
        { // variant-controller    
            qualifier: "!",
            context: {
                dataType: [{ myFacet: { dataType: _ } }, [me]],

                facetType: [{ myFacet: { facetType: _ } }, [me]],
                ofSliderFacet: [
                    "SliderFacet",
                    [{ facetType: _ }, [me]]
                ],
                ofMSFacet: [
                    "MSFacet",
                    [{ facetType: _ }, [me]]
                ],
                ofRatingFacet: [
                    "RatingFacet",
                    [{ facetType: _ }, [me]]
                ],

                ofFacetWithAmoeba: [
                    "FacetWithAmoeba",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],
                ofDiscreteFacet: [
                    "DiscreteFacet",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],
                ofUDF: [{ myFacet: { ofUDF: _ } }, [me]],

                ofOMF: [
                    "OMF",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],

                ofNumericFacet: [{ myFacet: { ofNumericFacet: _ } }, [me]],
                ofDateFacet: [{ myFacet: { ofDateFacet: _ } }, [me]],

                ofProperlyDefinedFacet: [{ myFacet: { ofProperlyDefinedFacet: _ } }, [me]],

                ofSortableFacet: [
                    "SortableFacet",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],
                ofSelectableFacet: [
                    "SelectableFacet",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],

                ofExpandedFacet: [{ myFacet: { expanded: _ } }, [me]],
                ofMinimizedFacet: [{ myFacet: { minimized: _ } }, [me]],
                ofTrashedFacet: [{ myFacet: { trashed: _ } }, [me]],
                ofFrozenFacet: [{ myFacet: { ofFrozenPane: _ } }, [me]],
                ofMovingFacet: [{ myFacet: { ofMovingPane: _ } }, [me]],
                ofTrashedOrMinimizedFacet: o(
                    [{ ofMinimizedFacet: _ }, [me]],
                    [{ ofTrashedFacet: _ }, [me]]
                ),

                ofWritableFacet: [
                    "WritableFacet",
                    [classOfArea, [{ myFacet: _ }, [me]]]
                ],
                ofFirstFrozenFacet: [equal,
                    [{ myFacet: _ }, [me]],
                    [{ myApp: { firstFrozenFacet: _ } }, [me]]
                ],

                ofDisplayedUniqueIDFacet: [{ myFacet: { displayedUniqueIDFacet: _ } }, [me]],

                ofFacetShowingAmoeba: [{ myFacet: { embedAmoeba: _ } }, [me]],
                facetState: [{ myFacet: { state: _ } }, [me]],

                showingFacetCells: [{ myFacet: { showingFacetCells: _ } }, [me]],
                showSelectors: [{ myFacet: { showSelectors: _ } }, [me]],
                selectionsMadeOverlays: [{ myFacet: { selectionsMadeOverlays: _ } }, [me]],
                overlaysHiddenInFacet: [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [me]],
                ofFacetDraggedToReorder: [{ myFacet: { iAmDraggedToReorder: _ } }, [me]],

                aUDFBeingEdited: [{ myApp: { aUDFBeingEdited: _ } }, [me]],
                ofUDFBeingEdited: [{ myFacet: { iAmUDFBeingEdited: _ } }, [me]],

                // note that for these ofUDF variant controllers, we look to the FacetClipper (UDFClipper), not the Facet (UDF), 
                // as the FacetClipper is guaranteed to always exist, unlike the UDF
                ofUDFCalculatesYear: [{ myFacetClipper: { uDFCalculatesYear: _ } }, [me]],
                ofUDFCalculatesQuarter: [{ myFacetClipper: { uDFCalculatesQuarter: _ } }, [me]],
                ofUDFCalculatesMonth: [{ myFacetClipper: { uDFCalculatesMonth: _ } }, [me]],
                ofUDFCalculatesMonthDay: [{ myFacetClipper: { uDFCalculatesMonthDay: _ } }, [me]],
                ofDFCalculatesWeekDay: [{ myFacetClipper: { uDFCalculatesWeekDay: _ } }, [me]],
                ofUDFCalculatesTextualValue: [{ myFacetClipper: { uDFCalculatesTextualValue: _ } }, [me]],
                ofUDFCalculatesDate: [{ myFacetClipper: { uDFCalculatesDate: _ } }, [me]],

                settingsPanelIsOpen: [{ myFacet: { settingsPanelIsOpen: _ } }, [me]],
                formulaPanelIsOpen: [{ myFacet: { formulaPanelIsOpen: _ } }, [me]],
                facetPanelIsOpen: [{ myFacet: { facetPanelIsOpen: _ } }, [me]],
                showTagsViewPane: [{ myFacet: { showTagsViewPane: _ } }, [me]],

                ofCurrencyFacet: [{ myFacet: { currency: _ } }, [me]],
                ofPercentFacet: [{ myFacet: { percent: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myEmbeddingFacet: [
                    [embeddingStar, [me]],
                    [areaOfClass, "Facet"]
                ],
                myFacet: [{ myEmbeddingFacet: _ }, [me]],
                myFacetUniqueID: [{ myFacet: { uniqueID: _ } }, [me]],

                myFacetClipper: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [areaOfClass, "FacetClipper"]
                ],

                mySortableFacet: [
                    [embeddingStar, [me]],
                    [areaOfClass, "SortableFacet"]
                ],

                myAmoeba: [{ myFacet: { myAmoeba: _ } }, [me]],
                myFacetHeader: [{ myFacet: { myFacetHeader: _ } }, [me]],
                myReorderHandle: [{ myFacet: { myReorderHandle: _ } }, [me]],

                myFacetName: [{ myFacet: { myFacetName: _ } }, [me]],

                myFacetMinimizationControl: [{ myFacet: { myFacetMinimizationControl: _ } }, [me]],
                myAmoebaCloseControl: [{ myFacet: { myAmoebaCloseControl: _ } }, [me]],

                myFSPController: [{ myFacet: { myFSPController: _ } }, [me]],
                myFSP: [{ myFacet: { myFSP: _ } }, [me]],

                myPrimaryWidget: [{ myFacet: { myPrimaryWidget: _ } }, [me]],
                myAmoebaControlPanel: [{ myFacet: { myAmoebaControlPanel: _ } }, [me]],

                currentViewFacetDataObj: [{ myFacet: { currentViewFacetDataObj: _ } }, [me]],
                crossViewFacetDataObj: [{ myFacet: { crossViewFacetDataObj: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myFacetUniqueID
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyFacetDataObj: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofNumericFacet: [{ myFacetDataObj: { numericFacet: _ } }, [me]],
                ofDateFacet: [equal, [{ myFacetDataObj: { dataType: _ } }, [me]], fsAppConstants.dataTypeDateLabel],

                ofOMF: [{ myFacetDataObj: { oMF: _ } }, [me]],
                ofUDF: [
                    [{ myFacetUniqueID: _ }, [me]],
                    [{ myApp: { uDFData: { uniqueID: _ } } }, [me]]
                ],

                dataType: [{ myFacetDataObj: { dataType: _ } }, [me]],

                facetType: [{ myFacetDataObj: { facetType: _ } }, [me]],
                ofSliderFacet: [
                    "SliderFacet",
                    [{ facetType: _ }, [me]]
                ],
                ofMSFacet: [
                    "MSFacet",
                    [{ facetType: _ }, [me]]
                ],
                ofRatingFacet: [
                    "RatingFacet",
                    [{ facetType: _ }, [me]]
                ],
                ofDiscreteFacet: [
                    o("MSFacet", "RatingFacet"),
                    [{ facetType: _ }, [me]]
                ],
                ofProperlyDefinedFacet: [{ myFacetProperDefinitionDataObj: { properDefinition: _ } }, [me]],

                expanded: [{ myFacetDataObj: { expanded: _ } }, [me]],
                minimized: [{ myFacetDataObj: { minimized: _ } }, [me]],
                trashed: [{ myFacetDataObj: { trashed: _ } }, [me]],
                ofFrozenPane: [{ myFacetDataObj: { ofFrozenPane: _ } }, [me]],
                ofMovingPane: [{ myFacetDataObj: { ofMovingPane: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myFacetDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { facetData: _ } }, [me]]
                ],
                // by querying myFacetMetaDataObj, we avoid various cycles that can occur if we rely on facetData, which is a merge of a whole set of
                // ordered sets of facet-related objects
                myFacetMetaDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { facetMetaData: _ } }, [me]]
                ],
                myFacetProperDefinitionDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { properDefinitionFacetData: _ } }, [me]]
                ],

                currentViewFacetDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { currentView: { facetData: _ } } }, [me]]
                ],
                crossViewFacetDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { crossViewFacetData: _ } }, [me]]
                ],
                myFacetNPADDataObj: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ myApp: { facetNPADData: _ } }, [me]]
                ],
                facetQuery: [{ myFacetMetaDataObj: { facetQuery: _ } }, [me]],
                facetProjectionQuery: [{ myFacetMetaDataObj: { facetProjectionQuery: _ } }, [me]],
                facetSelectionQueryFunc: [{ myFacetMetaDataObj: { facetSelectionQueryFunc: _ } }, [me]],
                uniqueValuesOverflow: [{ myFacetMetaDataObj: { uniqueValuesOverflow: _ } }, [me]],
                aSingleValueFacet: [{ myFacetMetaDataObj: { aSingleValueFacet: _ } }, [me]],

                noValueSelection: n(
                    [
                        [{ facetSelectionQueryFunc: _ }, [me]],
                        true
                    ]
                ),
                noValueStr: [{ myApp: { noValueStr: _ } }, [me]], // overridden in the ofRatingFacet variant below

                defaultDataType: [{ myFacetDataObj: { defaultDataType: _ } }, [me]],

                possibleFacetTypes: [{ myFacetDataObj: { possibleFacetTypes: _ } }, [me]],
                defaultFacetType: [{ myFacetDataObj: { defaultFacetType: _ } }, [me]],

                myPane: [{ myFacetDataObj: { myPane: _ } }, [me]]
            }
        },
        {
            qualifier: { ofRatingFacet: true },
            context: {
                noValueStr: [{ myApp: { unratedStr: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonTrashedFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // note: this is the tags view pane inside the facet, and it observes the showTagsViewPane of the MinimizedFacetViewPane.
                // they are not one and the same!
                showTagsViewPane: [and,
                    [{ showTagsViewPane: _ }, [areaOfClass, "FacetTagsController"]],
                    [{ inView: _ }, [me]],
                    [not, [{ ofFrozenPane: _ }, [me]]],
                    o(
                        [{ minimized: _ }, [me]],
                        [and,
                            [{ expanded: _ }, [me]],
                            [not, [{ facetPanelIsOpen: _ }, [me]]]
                        ]
                    )
                ]
            }
        },
        { // default
            "class": o("TrackOverlaysShowing", "TrackSaveViewController"),
            context: {
                defaultUniqueIDOfOverlaysHiddenInFacet: o(),

                // Note: this is a non-standard mergeWrite because uniqueIDOfOverlaysHiddenInFacet can store o() as a perfectly valid value.
                // if it stores that value, mergeWrite cannot differentiate between a non-existent path for its first parameter (in which case it should
                // take its second parameter), and the "valid" o() value. 
                // to work around that, we merge it with (the second parameter in the mergeWrite) an *object*, and not a terminal
                uniqueIDOfOverlaysHiddenInFacet: [
                    { uniqueIDOfOverlaysHiddenInFacet: _ },
                    [mergeWrite,
                        [{ currentViewFacetDataObj: _ }, [me]],
                        { uniqueIDOfOverlaysHiddenInFacet: [{ defaultUniqueIDOfOverlaysHiddenInFacet: _ }, [me]] }
                    ]
                ],
                overlaysInAmoeba: [
                    n({ uniqueID: [{ uniqueIDOfOverlaysHiddenInFacet: _ }, [me]] }),
                    [{ overlaysInAmoebaGlobal: _ }, [me]]
                ],

                itemsOfMissingValues: [
                    [{ noValueSelection: _ }, [me]],
                    [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                ]
            }
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeNumberLabel },
            "class": "NumericDataTypeFacet",
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeStringLabel },
            "class": "StringDataTypeFacet"
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeDateLabel },
            "class": "DateDataTypeFacet"
        },
        {
            qualifier: { ofOMF: true }, // should this move to ExpandedFacet?
            "class": "OMF"
        },
        {
            qualifier: { showTagsViewPane: true },
            children: {
                tagsViewPane: compileTags ?
                    {
                        description: {
                            "class": "FacetTagsView"
                        }
                    } :
                    o()
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFReferenceable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                uDFReferenceable: [{ ofProperlyDefinedFacet: _ }, [me]] // implies that trashed: false!
            }
        },
        {
            qualifier: { uDFReferenceable: true },
            "class": "UDFRefElement", // to allow it to be selected when defining a UDF. see UDFRefElementUX in a FacetName variant
            context: {
                // UDFRefElement params: 
                calculatorRefName: [{ name: _ }, [me]],
                calculatorRefVal: [{ uniqueID: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericDataTypeFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                currency: [{ dataObj: { currency: _ } }, [me]],
                percent: [{ dataObj: { percent: _ } }, [me]]
            }
        },
        { // default
            "class": "NumericFacet",
            context: {
                // NumericFacet params
                bigNumber: [greaterThanOrEqual,  // override default
                    [max,
                        o(
                            [abs, [{ maxVal: _ }, [me]]],
                            [abs, [{ minVal: _ }, [me]]]
                        )
                    ],
                    [{ numericConstants: { bigNumberThreshold: _ } }, [globalDefaults]]
                ]
            }
        },
        {
            qualifier: { uDFCalculatesYear: true },
            "class": "NumericFormatAsPlainNumber"
        },
        {
            qualifier: { uDFCalculatesMonthDay: true },
            "class": "NumericFormatAsPlainNumber"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateDataTypeFacet: {
        "class": "NumericFacet"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StringDataTypeFacet: {
        context: {
            hyperlinkEnabled: [mergeWrite,
                [{ crossViewFacetDataObj: { hyperlinkEnabled: _ } }, [me]],
                // if there's a default prefix URL, then the hyperlink should be enabled by default
                [bool, [{ dataObj: { defaultPrefixURL: _ } }, [me]]]
            ],
            hyperlinkForValues: [mergeWrite,
                [{ crossViewFacetDataObj: { hyperlinkForValues: _ } }, [me]],
                [{ dataObj: { defaultPrefixURL: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericFormatAsPlainNumber: {
        context: {
            numericFormatType: "intl",
            numberOfDigits: 0,
            commaDelimited: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedFacetAddendum: o(
        {
            qualifier: { facetType: "ItemValues" },
            "class": "ItemValuesFacet"
        },
        {
            qualifier: { facetType: "DateFacet" },
            context: {
                debugDateFacet: [arg, "debugDateFacet", true]
            }
        },
        {
            qualifier: {
                facetType: "DateFacet",
                debugDateFacet: true
            },
            "class": "DateFacet"
        },
        {
            qualifier: {
                facetType: "DateFacet",
                debugDateFacet: false
            },
            "class": "ItemValuesFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanExpandedFacetAddendum: o(
        { // default
            "class": "ExpandedFacetAddendum"
        },
        {
            qualifier: { facetType: "SliderFacet" },
            "class": "LeanSliderFacet"
        },
        {
            qualifier: { facetType: "MSFacet" },
            "class": "LeanMSFacet"
        },
        {
            qualifier: { facetType: "RatingFacet" },
            "class": "LeanRatingFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatExpandedFacetAddendum: o(
        { // default
            "class": "ExpandedFacetAddendum"
        },
        {
            qualifier: { facetType: "SliderFacet" },
            "class": "FatSliderFacet"
        },
        {
            qualifier: { facetType: "MSFacet" },
            "class": "FatMSFacet"
        },
        {
            qualifier: { facetType: "RatingFacet" },
            "class": "FatRatingFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. positiveOffsetTriggersExpandedPaneSwitching
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandedFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minimized: false, // override default definitions in Facet, to help the compiler optimize
                expanded: true,   // override default definitions in Facet, to help the compiler optimize
                inView: true,     // used, for example, to determine whether to embed a FacetTagsView

                showingFacetCells: [and,
                    [{ itemsShowing: _ }, [me]],
                    [{ showMyFacetCells: _ }, [me]]
                ],
                makeSortable: [and,
                    [{ showingFacetCells: _ }, [me]],
                    [{ myApp: { itemsShowing: _ } }, [me]],
                    [not, [{ aSingleValueFacet: _ }, [me]]]
                ],
                iAmUDFBeingEdited: [{ formulaPanelIsOpen: _ }, [me]],

                showHistogram: [mergeWrite,
                    [{ currentViewFacetDataObj: { showHistogram: _ } }, [me]],
                    [{ defaultShowHistogram: _ }, [me]]
                ],
                showAmoeba: [mergeWrite,
                    [{ currentViewFacetDataObj: { showAmoeba: _ } }, [me]],
                    [{ defaultShowAmoeba: _ }, [me]]
                ],
                showStats: [mergeWrite,
                    [{ currentViewFacetDataObj: { showStats: _ } }, [me]],
                    facetConstants.defaultFacetStats
                ],
                showSelectors: [mergeWrite,
                    [{ currentViewFacetDataObj: { showSelectors: _ } }, [me]],
                    true
                ],
                state: [cond,
                    [{ showAmoeba: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: facetState.summary
                        },
                        {
                            on: true,
                            use: [cond,
                                [{ showHistogram: _ }, [me]],
                                o(
                                    { on: false, use: facetState.standard },
                                    { on: true, use: facetState.histogram }
                                )
                            ]
                        }
                    )
                ]
            }
        },
        {
            qualifier: { isLean: true },
            "class": o("LeanExpandedFacetAddendum", "LeanFacet")
        },
        {
            qualifier: { isLean: false },
            "class": o("FatExpandedFacetAddendum", "FatFacet")
        },
        { // default
            "class": o("HorizontalVisReorderable", "MemberOfPositionedAreaOS", "ZTop", "TrackItemsShowing"),
            context: {
                initialExpansionStateOfFacet: [pos,
                    [index, // my index in the data of the areaSet of facets that i pertain to
                        [{ myPane: { facets: { uniqueID: _ } } }, [me]],
                        [{ uniqueID: _ }, [me]]
                    ],
                    [{ myPane: { initialExpansionStatesOS: _ } }, [me]]
                ],
                inView: true, // this class doesn't inherit InView
                defaultFacetState: facetConstants.defaultFacetState,
                // The facet's appState (^minimized is defined in the Facet class)
                initialState: [definedOrDefault,
                    [{ initialExpansionStateOfFacet: _ }, [me]],
                    [definedOrDefault,
                        [arg, "initialExpansionStateAllFacets", o()],
                        [definedOrDefault,
                            [{ dataObj: { state: _ } }, [me]],
                            [{ defaultFacetState: _ }, [me]]
                        ]
                    ]
                ],
                defaultShowAmoeba: [cond,
                    [{ initialState: _ }, [me]],
                    o(
                        { on: facetState.standard, use: true },
                        { on: facetState.histogram, use: true },
                        { on: null, use: false }
                    )
                ],
                defaultShowHistogram: [cond,
                    [{ initialState: _ }, [me]],
                    o(
                        { on: facetState.histogram, use: true },
                        { on: null, use: false }
                    )
                ],
                fspTooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { openFacetSettingsPanel: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { facetEntityStr: _ } }, [me]], " ", [{ myApp: { settingEntityStrPlural: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                    [{ settingsPanelIsOpen: _ }, [me]]
                ],

                // HorizontalVisReorderable params
                myReorderable: [{ param: { areaSetContent: _ } }, [embedding]],
                reorderableController: [{ myPane: _ }, [me]],
                myZTop: atomic(
                    {
                        element: [me],
                        label: "zTop"
                    }
                ),

                // MemberOfPositionedAreaOS params:
                // (note: not inheriting MemberOfLeftToRightAreaOS as that relies on left/right, and here i want to use the logicalBeginning/logicalEnd)
                areaOS: [{ reorderableController: { visReordered: _ } }, [me]],
                myAreaOSPosPoint: [{ logicalBeginning: _ }, [me]],
                myPrevInAreaOSPosPoint: [{ myPrevInAreaOS: { logicalEnd: _ } }, [me]],
                spacingFromPrev: [{ reorderableController: { reorderingSpacing: _ } }, [me]],

                minimizationThreshold: {
                    element: [{ myPane: _ }, [me]],
                    type: "right",
                    content: true
                },

                iAmBeingExpandedDirectly: [ // used by HorizontalFacetTransition
                    {
                        myExpandable: [me],
                        tmd: true
                    },
                    [areaOfClass, "ExpansionHandle1D"]
                ],

                iAmBeingExpanded: [{ iAmBeingExpandedDirectly: _ }, [me]], // overridden by MovingFacet, inherited in variant below

                // this function returns an object that includes:
                // 1. the calculated measured val (being a mathematical function, it will apply only to the numerical values)
                // 2. the count of numerical values in the corresponding itemSet in the measureFacet (as we need to filter out non-numerical values 
                // (both missing values and strings), in order to get a proper calculation in distribution mode.
                // note that if there is no measured facet defined the measuredVal is equal to the measuredCount, and equal to the size of the itemSet.
                // 
                // the itemSetNumericSubset could in theory be calculated inside this function, only that is currently very computationally inefficient.
                // so, instead, we do this outside the function, and pass it as a parameter.
                applyMeasure: [defun,
                    o("itemSet", "itemSetNumericSubset", "measureFacetUniqueID", "measureFunctionUniqueID", "myFacetUniqueID"),
                    [using,
                        // beginning of definitions
                        "measureFacetProjectionQuery",
                        [ // take "price" (string), return { price:_ } (projection query)
                            [defun,
                                "attr",
                                { "#attr": _ }
                            ],
                            "measureFacetUniqueID"
                        ],
                        "itemSetProjectionOnMeasureFacet",
                        [
                            "measureFacetProjectionQuery",
                            "itemSet"
                        ],
                        "itemSetNumericProjectionOnMeasureFacet",
                        [
                            "measureFacetProjectionQuery",
                            "itemSetNumericSubset"
                        ],
                        "calculations",
                        [descriptiveStatistics,
                            "itemSetNumericProjectionOnMeasureFacet"
                        ],
                        "n",
                        [{ n: _ }, "calculations"],
                        "sumOfitemSetNumericProjectionOnMeasureFacet",
                        [sum, "itemSetNumericProjectionOnMeasureFacet"],
                        // end of definitions
                        [cond,
                            // if either we have no measureFacet defined, or we've selected the count measure function, then we should return
                            // an object with both val/count set to the size of "itemSet".
                            o(
                                [not, "measureFacetUniqueID"],
                                [equal,
                                    "measureFacetUniqueID",
                                    measureFacetCountDistribution
                                ],
                                [and, // countMeasure counts my items 
                                    [equal,
                                        "myFacetUniqueID",
                                        "measureFacetUniqueID"
                                    ],
                                    [equal,
                                        "measureFunctionUniqueID",
                                        functionID.count
                                    ]
                                ]
                            ),
                            o(
                                {
                                    on: true,
                                    use: {
                                        val: [size, "itemSet"],
                                        count: [size, "itemSet"]
                                    }
                                },
                                {
                                    on: false,
                                    use: {
                                        val: [cond,
                                            "measureFunctionUniqueID",
                                            o(
                                                {
                                                    // since we're in the false clause of the high-level cond, we know it's not countMeasureCountsMyItems
                                                    // i.e. we're counting something other than the item rows: the measureFacet is not myFacet.
                                                    on: functionID.count,
                                                    // count the number of distinct values in the projection on the measure facet for this itemSet
                                                    // for example: a db of purchase orders, and myFacet is productType.
                                                    // measure function is Count, and measure facet is customerID.
                                                    // the histogram will show the number of different customers who made purchase for each productType.
                                                    use: [size, [_, "itemSetProjectionOnMeasureFacet"]]
                                                },
                                                {
                                                    on: functionID.sum,
                                                    use: "sumOfitemSetNumericProjectionOnMeasureFacet"
                                                },
                                                {
                                                    // the 'percent' function is the sum function
                                                    // with a different display mode 
                                                    on: functionID.percent,
                                                    use: "sumOfitemSetNumericProjectionOnMeasureFacet"
                                                },
                                                {
                                                    on: functionID.avg,
                                                    use: [cond,
                                                        [equal, "n", 0],
                                                        o(
                                                            { on: true, use: 0 },
                                                            { on: false, use: [div, "sumOfitemSetNumericProjectionOnMeasureFacet", "n"] }
                                                        )
                                                    ]
                                                },
                                                {
                                                    on: functionID.min,
                                                    use: [min, "itemSetNumericProjectionOnMeasureFacet"]
                                                    // not using the minimum attr provided in "calculations" as that relies on descriptiveStatistics' 
                                                    // implementation for this calculation, which requires a *sorted* set.
                                                    //use: [{ minimum: _ }, "calculations"]
                                                },
                                                {
                                                    on: functionID.max,
                                                    use: [max, "itemSetNumericProjectionOnMeasureFacet"]
                                                    // not using the maximum attr provided in "calculations" as that relies on descriptiveStatistics' 
                                                    // implementation for this calculation, which requires a *sorted* set.
                                                    //use: [{ maximum: _ }, "calculations"]
                                                },
                                                {
                                                    on: functionID.median,
                                                    use: [{ median: _ }, "calculations"]
                                                },
                                                {
                                                    on: functionID.stddev,
                                                    use: [{ stddev: _ }, "calculations"]
                                                },
                                                {
                                                    on: functionID.topQuartile,
                                                    use: [pos, 3, [{ quartiles: _ }, "calculations"]]
                                                },
                                                {
                                                    on: functionID.bottomQuartile,
                                                    // quartiles is an os of 5 values: 0/25/50/75/100. so the bottomQuartile is [pos, 1]
                                                    use: [pos, 1, [{ quartiles: _ }, "calculations"]]
                                                },
                                                {
                                                    on: functionID.topDecile,
                                                    // tenperc includes the top decile and bottom decile values
                                                    use: [max, [{ tenperc: _ }, "calculations"]]
                                                },
                                                {
                                                    on: functionID.bottomDecile,
                                                    // tenperc includes the top decile and bottom decile values
                                                    use: [min, [{ tenperc: _ }, "calculations"]]
                                                }
                                            )
                                        ],
                                        calculations: "calculations",
                                        count: "n"
                                    }
                                }
                            )
                        ]
                    ]
                ]

            },
            children: {
                // not visible in certain case (see hidden variant control in class)
                minimizeControl: {
                    description: {
                        "class": "FacetMinimizationControl"
                    }
                }
            }
        },
        {
            qualifier: { ofFrozenPane: true },
            "class": "FrozenFacet"
        },
        {
            qualifier: { ofMovingPane: true },
            "class": "MovingFacet"
        },
        {
            qualifier: { firstVisReordered: true },
            position: {
                anchorFirstToPane: {
                    point1: {
                        element: [{ myPane: _ }, [me]],
                        type: "left"
                    },
                    point2: {
                        label: "beginningOfVisReorderable"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            position: {
                // width: see expansion variants                
                attachTopToPaneLabel: {
                    point1: { element: [{ myPane: _ }, [me]], label: "anchorForFacetTop" },
                    point2: { type: "top" },
                    equals: 0
                },
                attachBottomToPaneLabel: {
                    point1: { element: [{ myPane: _ }, [me]], label: "anchorForFacetBottom" },
                    point2: { type: "bottom" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            position: {
                heightDuringDragging: { // determined by the offset between anchorForFacetTop and anchorForFacetBottom
                    pair1: {
                        point1: { element: [{ myPane: _ }, [me]], label: "anchorForFacetTop" },
                        point2: { element: [{ myPane: _ }, [me]], label: "anchorForFacetBottom" }
                    },
                    pair2: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    ratio: 1
                }
            },
            context: {
                intersectingRows: [{ intersectWithDraggedExpandedFacet: true }, [areaOfClass, "SolutionSetItem"]],
                otherExpandedPane: [
                    n([{ myPane: _ }, [me]]),
                    [areaOfClass, "ExpandedFacetViewPane"]
                ]
            },

            write: {
                onFacetCrossingIntoOtherExpandedPane: {
                    upon: [and, // doc
                        [greaterThan,
                            [{ positiveOffsetTriggersExpandedPaneSwitching: _ }, [me]], 0],
                        [lessThan,
                            [{ negativeOffsetTriggersExpandedPaneSwitching: _ }, [me]], 0]
                    ],
                    true: {
                        "class": "RemoveFromReorderedFacetsInPaneUniqueIDs",
                        addToReorderedFacetsOfOtherExpandedPane: {
                            to: [{ otherExpandedPane: { reorderedFacetInPaneUniqueIDs: _ } }, [me]],
                            merge: o(
                                [{ uniqueID: _ }, [me]],
                                [{ otherExpandedPane: { reorderedFacetInPaneUniqueIDs: _ } }, [me]]
                            )
                        }
                    }
                }
            }
        },
        {
            qualifier: { selectorBeingModified: true },
            position: {
                fixWidthWhileSelectionBeingMade: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    // beat the Draggable of the (horizontal) selector being dragged, and the MinWrap priority!
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                    stability: true
                }
            }
        },
        {
            qualifier: { makeSortable: true },
            "class": "SortableFacet",
        },
        {
            qualifier: {
                makeSortable: true,
                ofOMF: false
            },
            context: {
                // SortableFacet param: the sort function
                sort: [defun,
                    o("data"),
                    [sort,
                        "data",
                        [
                            [{ facetSelectionQueryFunc: _ }, [me]],
                            [{ sortingDirection: _ }, [me]]
                        ]
                    ]
                ]
            }
        },
        {
            qualifier: { showHistogram: true },
            stacking: {
                inCaseOfMissingHistogramBaseBars1: {
                    lower: { label: "histogram bins" },
                    higher: { label: "histogram base bars" }
                },
                inCaseOfMissingHistogramBaseBars2: {
                    lower: { label: "histogram base bars" },
                    higher: { label: "histogram implicit bars" }
                },
                inCaseOfMissingHistogramImplicitBars: {
                    lower: { label: "histogram implicit bars" },
                    higher: { label: "histogram solution set bars" }
                },
                solutionSetBarsBelowHistogramAdditionalControls: {
                    lower: { label: "histogram solution set bars" },
                    higher: { label: "histogram additional controls" }
                },
                additionalControlsBelowHistogramTop: {
                    lower: { label: "histogram additional controls" },
                    higher: { label: "histogram top" }
                },
                histogramSolutionSetBarsBelowAmoebaZTop: {
                    lower: { label: "histogram top" },
                    higher: {
                        element: [{ myAmoeba: _ }, [me]], // note Amoeba inherits ZTop for this purpose!
                        label: "zTop"
                    },
                    priority: 1
                }
            }
        },
        {
            qualifier: { iAmBeingExpanded: true },
            position: {
                minRightFromPaneRight: { // if so, make sure its right does not exceed the right side of the pane
                    point1: { type: "right" },
                    point2: { element: [{ myPane: _ }, [me]], type: "right" },
                    min: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FrozenFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                reorderingFrozenFacets: [{ myPane: { reordering: _ } }, [me]],
                reorderOrPrepareToReorder: o(
                    [{ iAmDraggedToReorder: _ }, [me]],
                    [{ facetNameWasInFocus: _ }, [me]]
                ),
                lastFrozenFacet: [{ lastFacetInPane: _ }, [me]],

                showTopControls: [{ reorderOrPrepareToReorder: _ }, [me]]
            }
        },
        { // default
            "class": "FrozenFacetDesign",
            context: {
                // ExpandedFacet param:
                positiveOffsetTriggersExpandedPaneSwitching: [offset,
                    { element: [areaOfClass, "MovingFacetViewPane"], type: "left" },
                    { element: [pointer], type: "left" }
                ],
                negativeOffsetTriggersExpandedPaneSwitching: [offset,
                    { element: [areaOfClass, "MovingFacetViewPane"], type: "right" },
                    { element: [pointer], type: "left" }
                ],

                "*facetNameWasInFocus": false
            },
            write: {
                // raise facetNameWasInFocus when entering the FacetName. Lower it when exiting the FacetHeader.
                onFrozenFacetDelayedInFocusName: {
                    upon: [and,
                        [not, [{ facetNameWasInFocus: _ }, [me]]],
                        [{ myFacetName: { delayedInFocus: _ } }, [me]]
                    ],
                    true: {
                        raiseFacetNameWasInFocus: {
                            to: [{ facetNameWasInFocus: _ }, [me]],
                            merge: true
                        }
                    }
                },
                onFrozenFacetOutOfHeader: {
                    upon: [and,
                        [{ facetNameWasInFocus: _ }, [me]],
                        [not, [{ myFacetHeader: { inArea: _ } }, [me]]]
                    ],
                    true: {
                        lowerFacetNameWasInFocus: {
                            to: [{ facetNameWasInFocus: _ }, [me]],
                            merge: false
                        }
                    }
                }
            },
            children: {
                expansionHandle1D: {
                    description: {
                        context: {
                            // override the default value (which is the top of the frozen facet)
                            // as the first frozen facet has no visible header, and it looks odd if the pointer responds to a "white space"
                            anchorForEndGirth: atomic({ element: [areaOfClass, "ExpandedOverlaysView"], type: "top" })
                        }
                    }
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            write: {
                onFrozenFacetCrossingMinimizationThreshold: {
                    upon: [greaterThan,
                        [offset,
                            [{ minimizationThreshold: _ }, [me]],
                            { type: "left" }
                        ],
                        0
                    ],
                    true: {
                        "class": "RemoveFromReorderedFacetsInPaneUniqueIDs"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by a variant of the Facet class when in the moving pane, i.e. the pane of facets which can be scrolled and reordered.
    // This class inherits HorizontalVisReorderable in order to allow both these interactions. The associated controller is its embedding area, which 
    // inherits the MovingFacetViewPane.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovingFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedFSP: [and,
                    [arg, "devFacetSettings", true],
                    [not, [{ formulaPanelIsOpen: _ }, [me]]],
                    [not, [{ ofOMF: _ }, [me]]],
                    [not, [{ aSingleValueFacet: _ }, [me]]]
                ],
                embedFSPController: [and,
                    [{ embedFSP: _ }, [me]],
                    [not, [{ settingsPanelIsOpen: _ }, [me]]],
                    [not, [{ ofDateFacet: _ }, [me]]]
                ],
                showDataTypeInUdf: [arg, "devShowDataTypeInUdf", false],
                embedDataTypeControl: [and,
                    [not, [{ settingsPanelIsOpen: _ }, [me]]],
                    [cond,
                        [{ ofUDF: _ }, [me]],
                        o(
                            { on: true, use: [{ showDataTypeInUdf: _ }, [me]] },
                            {
                                on: false, use: //[and,
                                // commenting this out:
                                // perhaps only minimization control should be hidden when a dropDownPanel is open
                                //[not, [{ facetPanelIsOpen : _ }, [me]]], 
                                [not, [{ ofOMF: _ }, [me]]],
                                //] 
                            }
                        )
                    ],
                    [not, [{ aSingleValueFacet: _ }, [me]]]
                ],
                iAmBeingExpanded: o(
                    [{ iAmBeingExpandedDirectly: _ }, [me]],
                    [{ myHistogramIsBeingExpanded: _ }, [me]],
                    [{ myDiscreteValueNamesAreBeingExpanded: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("GeneralArea"),
            context: {
                // note that for these *Expanded variant controllers, we ask about any ExpandedFacet, not merely
                // this facet being expanded itself. 
                // The reason is that a facet that is to the *right* of a facet being expanded, it too should
                // avoid a horizontal visual transition.
                // Note that ExpandedFacet is both MovingFacet and FrozenFacet: we may decide one day to allow
                // expansion of FrozenFacets too, and then we'd want the same logic to apply to all facets
                // to its right.
                myHistogramIsBeingExpanded: [
                    {
                        myFacet: [me],
                        expanding: true
                    },
                    [areaOfClass, "HistogramView"]
                ],
                myDiscreteValueNamesAreBeingExpanded: [
                    {
                        myFacet: [me],
                        expanding: true
                    },
                    [areaOfClass, "DiscreteValueNamesExpandableArea"]
                ],

                // ExpandedFacet param:
                positiveOffsetTriggersExpandedPaneSwitching: [offset,
                    { element: [pointer], type: "left" },
                    { element: [areaOfClass, "FrozenFacetViewPane"], type: "right" }
                ],
                negativeOffsetTriggersExpandedPaneSwitching: [offset,
                    { element: [pointer], type: "left" },
                    { element: [areaOfClass, "FrozenFacetViewPane"], type: "left" }
                ],

                // note: determined by the position of its lf (and not the pointer)
                pushedAcrossMinimizationThreshold: [and,
                    [{ iAmDraggedToReorder: false }, [me]],
                    [greaterThan,
                        [offset,
                            [{ minimizationThreshold: _ }, [me]],
                            { type: "left" }
                        ],
                        0
                    ]
                ]
            },
            write: {
                onMovingFacetDraggedAcrossMinimizationThreshold: {
                    upon: o(
                        // either the *pointer* crosses the minimizationThreshold while the facet is being dragged
                        [and,
                            [{ iAmDraggedToReorder: true }, [me]],
                            [greaterThan,
                                [offset,
                                    [{ minimizationThreshold: _ }, [me]],
                                    { element: [pointer], type: "left" }
                                ],
                                0
                            ]
                        ],
                        // or hovering over the trash
                        [and,
                            ["DraggableToTrashElement", [classOfArea, [me]]],
                            [{ iAmHoveringOverTrash: _ }, [me]]
                        ]
                    ),
                    true: {
                        "class": "RemoveFromReorderedFacetsInPaneUniqueIDs"
                    }
                }
            },
            position: {
                // if the facet is very wide (e.g. its cells are very long text),
                // keep it at a reasonable width, so the user can manually resize it, reorder it, drag-to-minimize
                keepFacetNotTooWide: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: [offset, // not wider than the offset between these two panes
                        {
                            element: [areaOfClass, "FrozenFacetViewPane"],
                            type: "left"
                        },
                        {
                            element: [areaOfClass, "MinimizedFacetViewPane"],
                            type: "right"
                        }
                    ],
                    priority: positioningPrioritiesConstants.strongerThanDefault
                }
            }
        },
        {
            qualifier: { embedFSPController: true },
            children: {
                facetSettingsPanelController: {
                    description: {
                        "class": "FSPController"
                    }
                }
            }
        },
        {
            qualifier: { embedFSP: true },
            children: {
                facetSettingsPanel: {
                    partner: [embedding, [{ myFacet: _ }, [me]]], // so that we could cover the Facet's border!
                    description: {
                        "class": "FSP"
                    }
                }
            }
        },
        {
            qualifier: { embedDataTypeControl: true },
            children: {
                dataTypeControl: {
                    description: {
                        "class": "DataTypeControl"
                    }
                }
            }
        },
        {
            qualifier: { lastFacetInPane: true },
            context: {
                allMovingFacetsPushedAcrossMinimizationThresholdUniqueID: [
                    {
                        pushedAcrossMinimizationThreshold: true,
                        uniqueID: _
                    },
                    [{ myPane: { myFacets: _ } }, [me]] // note, we maintain the facets' ordering in the moving pane, which they're coming from
                ]
            },
            write: {
                // when a facet is pushed (not dragged!) to minimization, we define the trigger only for the lastFacetInPane.
                // the write handling below, will actually apply to all MovingFacets that have pushedAcrossMinimizationThreshold.
                // we do this to avoid each such MovingFacet attempting to write to the same appData at the same time, resulting in multiple writes.
                // instead, the lastFacetInPane does so on behalf of all moving facets that have crossed the minimization threshold line.
                onMovingFacetPushedAcrossMinimizationThreshold: {
                    upon: [{ pushedAcrossMinimizationThreshold: _ }, [me]],
                    true: {
                        removeAllPushedAcrossFromReorderedFacetsInPaneUniqueIDs: {
                            to: [{ myFacet: { myPane: { reorderedFacetInPaneUniqueIDs: _ } } }, [me]],
                            merge: [
                                n([{ allMovingFacetsPushedAcrossMinimizationThresholdUniqueID: _ }, [me]]),
                                [{ myFacet: { myPane: { reorderedFacetInPaneUniqueIDs: _ } } }, [me]]
                            ]
                        },
                        moveToBeginningOfReorderedFacetUniqueID: { // and implied is to the beginning of the MinimizedFacetViewPane
                            to: [{ myApp: { reorderedFacetUniqueID: _ } }, [me]],
                            merge: o(
                                [{ allMovingFacetsPushedAcrossMinimizationThresholdUniqueID: _ }, [me]],
                                [
                                    n([{ allMovingFacetsPushedAcrossMinimizationThresholdUniqueID: _ }, [me]]),
                                    [{ myApp: { reorderedFacetUniqueID: _ } }, [me]]
                                ]
                            )
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by ItemValuesFacet and by FacetWithAmoeba, or in other words, by all facets which are *not* related to the OMF
    // This class inherits MinWrapHorizontal: tightly wrap its embedded FacetHeader and cells (formed - when this facet is not in its minimized view - by the intersection with the SolutionSetItem rows), 
    // and potentially other areas too which are provided by inheriting classes (e.g. an amoeba).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacet: o(
        { // default            
        },
        {
            qualifier: { expanded: true },
            "class": o("MinWrapHorizontal", "ExpandableInFacet"),
            context: {
                // maxWidthOfCells is overridden by variant of RatingFacet (when displaying a sequence of symbols instead of a string, the cell width is calculated
                // based on these symbols, and not on a display query on strings)
                maxWidthOfCells: [{ children: { auxMaxWidthOfCells: { maxWidthOfCells: _ } } }, [me]],
                offsetToUserSpecifiedCellDoubleClickExpandableWidth: [min,
                    [max,
                        o(
                            [plus,
                                [{ maxWidthOfCells: _ }, [me]],
                                [mul, 2, bFSPosConst.cellContentHorizontalMargin]
                            ],
                            [plus,
                                [offset, { label: "borderOfLeftmostFacetSelections" }, { label: "borderOfRightmostFacetSelections" }],
                                [plus,
                                    [mul, 2, bFSPosConst.facetSelectionsHorizontalMargin],
                                    10 // another 10 pixels for good measure.
                                ]
                            ]
                        )
                    ],
                    bFSPosConst.maxInitWidthOfCells // no reason to go beyond this value, by default. to protect from extra long db values..
                ],
                positionExpansionHandleOnAmoeba: [and,
                    [not, [{ ofDateFacet: _ }, [me]]], // a date facet shows no cell values, and so the expansion handle should remain on the facet's right
                    [{ myAmoeba: _ }, [me]],
                    [
                        {
                            showSolutionSet: true,
                            expanded: true
                        },
                        [areaOfClass, "PermOverlay"]
                    ]
                ],
                // ExpandableRight param:
                handleVisibilityEnabled: o(
                    [and,
                        [not, [{ ofDateFacet: _ }, [me]]],
                        [{ showingCells: _ }, [me]]
                    ],
                    [{ ofDateFacet: _ }, [me]]
                ),
                stableExpandableIsMin: true, // override default value
                rightExpansionPosPoint: atomic({ label: "userSpecifiedCellWidth" }), // override default definition
                setInitialExpandableWidth: [definedOrDefault,
                    [{ dataObj: { setInitialExpandableWidth: _ } }, [me]], // we can set in the config file the setInitialExpandableWidth.
                    [{ ofMovingPane: _ }, [me]] // otherwise, it assumes the values of ofMovingPane
                ],

                initialExpandableWidth: [cond,
                    [{ setInitialExpandableWidth: _ }, [me]],
                    o(
                        { on: false, use: o() },
                        // we initialize movingFacets' userSpecifiedCellWidth to userSpecifiedCellDoubleClickExpandableWidth
                        { on: true, use: [{ offsetToUserSpecifiedCellDoubleClickExpandableWidth: _ }, [me]] }
                    )
                ],
                doubleClickExpandableWidth: [offset, [{ leftExpansionPosPoint: _ }, [me]], { label: "userSpecifiedCellDoubleClickExpandableWidth" }],

                userExpandedHorizontally: [mergeWrite,
                    [{ currentViewFacetDataObj: { userExpandedHorizontally: _ } }, [me]],
                    false
                ],
                stableExpandableWidth: [mergeWrite,
                    [{ currentViewFacetDataObj: { stableExpandableWidth: _ } }, [me]],
                    [{ initialExpandableWidth: _ }, [me]]
                ],

                showingCells: [
                    { myFacet: [me] },
                    [areaOfClass, "Cell"]
                ]
            },
            // to do: 
            // define write handler that sends itself a ResetWidth msg (see Expandable) when the display density changes, so that stableExpandableWidth 
            // is re-initialized to initialExpandableWidth
            position: {
                // offset from lc to userSpecifiedCellWidth is defined by ExpandableRight, as its rightExpansionPosPoint is defined to be 
                // userSpecifiedCellWidth (see above)
                userSpecifiedCellWidthLeftOfAnchorForCellRight: {
                    point1: { label: "userSpecifiedCellWidth" },
                    point2: { label: "anchorForCellRight" },
                    // read as equals: 0 at a weakerThanDefault priority
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                // defining anchorForCellRight
                anchorForCellRightI: {
                    point1: { label: "anchorForCellRight" },
                    point2: { type: "right" },
                    min: 0
                },
                anchorForCellRightII: {
                    point1: { label: "anchorForCellRight" },
                    point2: { type: "right" },
                    max: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "cellRightOrGroup" }
                },

                defineUserSpecifiedOnDoubleClick: {
                    point1: [{ leftExpansionPosPoint: _ }, [me]],
                    point2: { label: "userSpecifiedCellDoubleClickExpandableWidth" },
                    equals: [{ offsetToUserSpecifiedCellDoubleClickExpandableWidth: _ }, [me]]
                },

                // in case there are no more Cells on display, we need to make sure this pair of posPoint labels are at a minimal offset
                // and so we require that at a very low priority
                minimizeOffsetBetweenLeftmostAndRightmostFacetSelectionLabels: {
                    point1: { label: "borderOfLeftmostFacetSelections" },
                    point2: { label: "borderOfRightmostFacetSelections" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            },
        },
        {
            qualifier: {
                expanded: true,
                lastFrozenFacet: true
            },
            context: {
                handleLengthDimension: generalPosConst.expansionHandle1DShortLength // override default def; so it doesn't mask the expanded overlay's moreControls!!
            }
        },
        {
            qualifier: {
                expanded: true,
                embedAmoeba: true
            },
            context: {
                handleLengthDimension: generalPosConst.expansionHandle1DShortLength // override default def; so it doesn't mask the scrollbar in an MSFacet.
                // not needed for sliderFacets but is done anyway, for uniformity.
            }
        },
        {
            qualifier: {
                expanded: true,
                showingCells: true
            },
            children: {
                auxMaxWidthOfCells: {
                    description: {
                        "class": "MaxWidthOfCellsApproximation"
                    }
                }
            }
        },
        {
            qualifier: {
                expanded: true,
                positionExpansionHandleOnAmoeba: true
            },
            context: {
                // ExpandableRight: override default params
                lengthAxisHandleAnchor: atomic({
                    element: [{ myAmoeba: _ }, [me]],
                    type: "left"
                }),
                lowHTMLGirthHandleAnchor: atomic({
                    element: [{ myAmoeba: _ }, [me]],
                    type: "top"
                }),
                highHTMLGirthHandleAnchor: atomic({
                    element: [{ myAmoeba: _ }, [me]],
                    type: "bottom"
                })
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myFacet
    // 2. This class assumes ExpandableTop/ExpandableBottom/ExpandableLeft/ExpandableRight is inherited as well.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableInFacet: {
        "class": "ExpandableRight",
        context: {
            defaultHandle: false
        },
        children: {
            expansionHandle1D: {
                partner: [embedding], // to ensure that the ExpansionHandle1D, which is embedded in the referredOf, is truncated when the Expandable
                // area is scrolled out of view.
                description: {
                    "class": o("HorizontalFacetTransition", "ExpansionHandle1D", "TrackMyFacet"),
                    context: {
                        // HorizontalFacetTransition param
                        myFacet: [{ myFacet: _ }, [expressionOf]]
                    },
                    stacking: {
                        belowAmoebaZTop: {
                            lower: [me],
                            higher: {
                                element: [{ myAmoeba: _ }, [me]],
                                label: "zTop"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // We opt for an Icon area so that it is not embedded in an active participant area, and as such responds to its MinWrap, or any such constraints.
    // API:
    // 1. color
    // 2. posPointLabel
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*DebugLine: {
        "class": o("Icon", "AboveMyExpressionOf"),
        position: {
            topOfExpressionOf: {
                point1: { type: "top" },
                point2: { element: [expressionOf], type: "top" },
                equals: 0
            },
            bottomOfExpressionOf: {
                point1: { type: "bottom" },
                point2: { element: [expressionOf], type: "bottom" },
                equals: 0
            },
            width: 1,
            attachRightToLabelDebugged: {
                point1: { type: "right" },
                point2: { element: [expressionOf], label: [{ posPointLabel:_ }, [me]] },
                equals: 0
            }
        },
        display: {
            background: [{ color:_ }, [me]]
        }       
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by facets which do nothing other than display a value for each intersecting Item. These are, therefore, facets which do not have an amoeba. 
    // Examples of these would be the Name and Ticker facets (and more broadly, any facet which provides a uniqueID per Item), or a comment facet.
    // By definition it is on the facet 'summary' state.
    //
    // This class inherits NonOMFacet. If it is a writable facet, it inherits WritableTextFacet; otherwise, it inherits SortableFacet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ItemValuesFacet: o(
        {
            "class": o("NonOMFacet", "FillableFacet"),
            context: {
                showMyFacetCells: true, // a constant, unlike FacetWithAmoeba's definition
                //state: facetState.summary
                sortKey: [
                    [{ facetSelectionQueryFunc: _ }, [me]],
                    c(
                        true, // this ensures that the missing values appear last, when sorting by both ascending/descending
                        [{ sortingDirection: _ }, [me]]
                    )
                ]
            }
        },
        {
            qualifier: { writableFacet: true },
            "class": "WritableTextFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FillableFacet: o(
        { // default
            "class": o("GeneralArea", "TrackItemsShowing")
        },
        {
            qualifier: {
                itemsShowing: false,
                expanded: true
            },
            children: {
                fillableFacetInfo: {
                    description: {
                        "class": "FillableFacetInfo"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FillableFacetInfo: o(
        { // default
            "class": o("FillableFacetInfoDesign", "GeneralArea", "InfoIconable"),
            position: {
                "class": "AlignCenterWithEmbedding"
            }
        },
        {
            qualifier: { createInfoIcon: true },
            children: {
                explanation: {
                    // partner: see InfoIconable
                    description: {
                        "class": "FillableFacetInfoIcon"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FillableFacetInfoIcon: {
        "class": o("FillableFacetInfoIconDesign", "InfoIcon"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { expandStr: _ } }, [me]],
                    " ",
                    [{ myApp: { aStr: _ } }, [me]],
                    " ",
                    [{ myApp: { overlayEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { toStr: _ } }, [me]],
                    " ",
                    [{ myApp: { populateStr: _ } }, [me]],
                    " ",
                    [{ myApp: { facetEntityStr: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the SliderFacet and the MSFacet, which are both facets with an amoeba.
    // It inherits:
    // 1. NonOMFacet
    // 2. SortableFacet
    // 3. SelectableFacet: the class inherited by facets in which a selection can be made (OMF/Slider/MS)
    // 
    // appData: 
    // This class defines a writable ref, secondaryAxisFacet, with an associated appData initialized to o(): here we store the areaRef of the facet that could be defined
    // for the x-Axis in the 2D plot.
    // 
    // This class embeds selectableFacetXIntOSRs, intersection areas it forms with all intensional OSR areas in the appropriate state (Standard/Maximized).
    // The inherited classes, SliderFacet/MSFacet, provide the description for these intersection areas.
    //
    // API: 
    // 1. offsetHeaderBottomToAmoebaTop: default value provided
    // 2. offsetAmoebaTopToFacetBottom: default value provided
    // 3. valuesForMeasure (see the embeddedStar OverlayMeasurePairInFacet)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    FacetWithAmoeba: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // inheriting classes may override this definition (typically, to add other conditions under which an amoeba will be embedded)
                embedAmoeba: [and,
                    [{ showAmoeba: _ }, [me]],
                    [not, ["FrozenFacet", [classOfArea, [me]]]]
                ],
                embedFacetXOSR: [and,
                    [arg, "displayFacetXOSR", false], // decided to eliminate FacetXOSR display in the app, but we'll keep it in the automated tests for now 
                    ["MovingFacet", [classOfArea, [me]]], // i.e. a frozen facet, or a minimized facet, won't have a FacetXOSR
                    [not, [{ minimized: _ }, [me]]],
                    o(
                        [not, [{ embedAmoeba: _ }, [me]]],
                        [and,
                            [{ embedAmoeba: _ }, [me]],
                            [{ showingFacetCells: _ }, [me]]
                        ]
                    )
                ]
            }
        },
        { // default
            "class": "NonOMFacet",
            context: {
                showMyFacetCells: [mergeWrite,
                    [{ currentViewFacetDataObj: { showMyFacetCells: _ } }, [me]],
                    true
                ]
            }
        },
        {
            qualifier: { embedFacetXOSR: true },
            children: {
                selectableFacetXIntOSRs: {
                    partner: [
                        {
                            ofIntOverlay: true,
                            ofExpandedOverlay: true
                        },
                        [areaOfClass, "OSR"]
                    ]
                    // description: provided by inheriting classes SliderFacet/MSFacet/RatingFacet
                },
                selectableFacetXExtOSRs: {
                    partner: [
                        { ofExtOverlay: true },
                        [areaOfClass, "OSR"]
                    ],
                    description: {
                        "class": "NonOMFacetXExtOSR"
                    }
                }
            }
        },
        // actual embedding of amoeba done by SliderFacet/MSFacet/RatingFacet in a child called amoeba.
        {
            qualifier: { embedAmoeba: true },
            context: {
                value: [{ noValueStr: _ }, [me]],
                selectionQuery: [{ myFacet: { noValueSelection: _ } }, [me]],

                // returns the subset of "itemSet" which has the value "val" in its selection query
                valueSubsetInItemSet: [defun,
                    o("val", "itemSet"),
                    [
                        [cond, // create the selection query
                            [equal, "val", [{ noValueStr: _ }, [me]]],
                            o(
                                {
                                    on: true,
                                    use: [{ myFacet: { noValueSelection: _ } }, [me]]
                                },
                                {
                                    on: false,
                                    use: [
                                        [{ facetSelectionQueryFunc: _ }, [me]], // construct a query of the form { "quality": "good" }
                                        "val"
                                    ]
                                }
                            )
                        ],
                        "itemSet" // the data
                    ]
                ],

                defaultHistogramObj: {
                    uniqueID: fsAppConstants.firstHistogramUniqueIDCounter
                    // myMeasureFacetUniqueID / myMeasureFunctionUniqueID: default values provided in MeasurePairInFacet
                },
                histogramsData: [mergeWrite,
                    [identify, { uniqueID: _ }, [{ currentViewFacetDataObj: { histograms: _ } }, [me]]],
                    [identify, { uniqueID: _ }, [{ defaultHistogramObj: _ }, [me]]] // default: the first histogram
                ],

                myHistogramViews: [
                    { myFacet: [me] },
                    [areaOfClass, "HistogramView"]
                ]
            },
            children: {
                measures: compileHistogram ?
                    {
                        data: [identify,
                            { uniqueID: _ },
                            [{ histogramsData: _ }, [me]]
                        ],
                        description: {
                            "class": "MeasurePairInFacet"
                        }
                    } :
                    o()
            }
        },
        {
            qualifier: {
                embedAmoeba: true,
                showingFacetCells: true
            },
            position: {
                // top/bottom of amoeba: see Amoeba

                anchorForCellRightIII: {
                    point1: { label: "anchorForCellRight" },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left"
                    },
                    min: 0
                },
                anchorForCellRightIV: {
                    point1: { label: "anchorForCellRight" },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left"
                    },
                    max: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "cellRightOrGroup" }
                }
            }
        },
        {
            qualifier: { embedAmoeba: false },
            "class": "FillableFacet"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class inherited by FacetWithAmoeba and by OMF. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableFacet: {
        "class": "TrackOverlayMaximization",
        // children: { inheriting classes define selectableFacetXIntOSRs: partner provided by FacetWithAmoeba/OMF and the 
        // class inheritance by MSFacet/SliderFacet/OMF
        context: {
            selectionsMadeOverlays: [
                [ // since [areaOfClass] does not ensure ordering, we select the os provided here from myApp's permOverlays.
                    {
                        selectionsMade: true,
                        myFacet: [me],
                        myOverlay: _
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
                [cond,
                    // if we're maximizing an overlay, it should be the only one considered!
                    [{ maximizedOverlayExists: _ }, [me]],
                    o(
                        { on: false, use: [{ myApp: { permOverlays: _ } }, [me]] },
                        { on: true, use: [{ maximizedOverlay: _ }, [me]] }
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class inherited by all classes by which we can sort: NonOMFacet (i.e. by the SliderFacet and MSFacet which inherit it), and by OMF
    // This class inherits Sortable.
    // The sorting controller is set to be FSapp. and the id by which we identify this Sortable is the facet's uniqueID.    
    // API: 
    // 1. uniqueID
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SortableFacet: {
        "class": "Sortable",
        context: {
            // Sortable Params:
            mySortingController: [{ myApp: _ }, [me]],
            sortableUniqueID: [{ uniqueID: _ }, [me]]
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // override default definitions in Facet, to help the compiler optimize
                minimized: true,
                expanded: false,
                ofMovingPane: false,
                ofFrozenPane: false,
                showingFacet: [{ inView: _ }, [me]],
                showingFacetTags: [{ showTagsViewPane: _ }, [areaOfClass, "FacetTagsController"]],
                minimizedFacetsViewHandleTmd: [{ minimizedFacetsViewHandleTmd: _ }, [areaOfClass, "MinimizedFacetViewPane"]]
            }
        },
        {  // default
            "class": "MatrixCellFacet",
            context: {
                // see { minimizedFacetsViewHandleTmd: true } variant below, for alternate width definition while resizing the MatrixView
                defineMatrixCellOnHorizontalAxis: [not, [{ minimizedFacetsViewHandleTmd: _ }, [me]]]
            }
        },
        {
            qualifier: { isLean: true },
            "class": "LeanFacet"
        },
        {
            qualifier: { isLean: false },
            "class": "FatFacet"
        },
        {
            qualifier: { showingFacet: true },
            "class": "MinimizedFacetDesign"
        },
        {
            qualifier: {
                showingFacet: true,
                aUDFBeingEdited: false
            },
            "class": "FacetExpansionUX" //controlling the expansion onClick
        },
        {
            qualifier: {
                showingFacet: true,
                selectionsMadeOverlays: true,
                showingFacetTags: false
            },
            children: {
                overlayLegendsContainer: {
                    description: {
                        "class": "MinimizedFacetOverlayLegendsContainer"
                    }
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            write: {
                onMinimizedFacetCrossingExpansionHorizontalThreshold: {
                    upon: [greaterThan,
                        [offset,
                            { element: [pointer], type: "left" },
                            { element: [areaOfClass, "MovingFacetViewPane"], type: "right", content: true }
                        ],
                        0
                    ],
                    true: {
                        "class": "FacetExpansionCoreWrite"
                    }
                }
            }
        },
        {
            qualifier: { minimizedFacetsViewHandleTmd: true },
            context: {
                minimizedFacetToMyRight: [
                    {
                        row: [{ row: _ }, [me]],
                        column: [plus, 1, [{ column: _ }, [me]]]
                    },
                    [areaOfClass, "MinimizedFacet"]
                ]
            },
            position: {
                equalWidthForAllMinimizedFacetsWhileExpanded: {
                    pair1: {
                        point1: {
                            element: [areaOfClass, "MinimizedFacetViewPane"],
                            label: "leftOfMinimizedFacetWhenExpandingWidth"
                        },
                        point2: {
                            element: [areaOfClass, "MinimizedFacetViewPane"],
                            label: "rightOfMinimizedFacetWhenExpandingWidth"
                        }
                    },
                    pair2: {
                        point1: { type: "left" },
                        point2: { type: "right" }
                    },
                    ratio: 1
                },
                maintainOffsetFromMinimizedFacetInColumnToTheRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ minimizedFacetToMyRight: _ }, [me]],
                        type: "left"
                    },
                    equals: [{ horizontalSpacingOfMinimizedFacetViewPaneElements: _ }, [areaOfClass, "MinimizedFacetViewPane"]]
                }
            }
        },
        {
            qualifier: {
                minimizedFacetsViewHandleTmd: true,
                ofFirstColumnInView: true
            },
            position: {
                stabilizeLeftWRTMinimizedFacetsDoc: {
                    point1: {
                        element: [areaOfClass, "MinimizedFacetsDoc"],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    stability: true
                }
            }
        },
        {
            qualifier: {
                minimizedFacetsViewHandleTmd: true,
                ofLastColumnInView: true
            },
            position: {
                stabilizeRightWRTMinimizedFacetsDoc: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "MinimizedFacetsDoc"],
                        type: "right"
                    },
                    stability: true
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixCellFacet: o(
        { // default
            "class": "MatrixCell",
            context: {
                // MatrixCell params:
                matrixUniqueID: [{ uniqueID: _ }, [me]],
                myMatrix: [areaOfClass, "MinimizedFacetsDoc"],
                // tmd: see Facet's variant-controller
                entireCellDraggable: false,
                attachVerticalToPointerOnDrag: false,
                attachHorizontalToPointerOnDrag: false
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashedFacet: {
        "class": o("TrashedFacetDesign", "Facet", "InView", "TrashedElement", "TrackAppTrash"),
        context: {
            // Override WrapAround params (via TrashableElement)
            waController: [areaOfClass, "TrashedFacetsDoc"]
        },
        position: {
            // trashed facets have the same width as minimized facets
            width: [densityChoice, [{ fsAppPosConst: { minimizedFacetWidth: _ } }, [globalDefaults]]],
            // height: see TrashedElement
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Facet Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Facet Tag Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetTagsView: o(
        { // default
            "class": o("FacetTagsViewDesign", "EntityTagsView", "TrackMyFacet"),
            context: {
                myTagsController: [areaOfClass, "FacetTagsController"]
            },
            position: {
                left: 0,
                right: 0,
                attachToFacetHeader: {
                    point1: {
                        element: [{ myFacetHeader: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                // bottom: see anchorAmoebaTop definition in the Amoeba class
            },
            children: {
                tagsDoc: {
                    description: {
                        "class": "FacetTagsDoc"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetTagsDoc: o(
        { // default
            "class": o("GeneralArea", "EntityTagsDoc", "TrackMyFacet"),
            context: {
                // WrapAroundController params (via EntityTagsDoc)
                wrapArounds: o(
                    [{ myEntityAddTagControl: _ }, [me]],
                    [{ children: { tags: _ } }, [me]]
                ),
                wrapAroundSpacing: [densityChoice, [{ fsAppPosConst: { facetTagsHorizontalSpacing: _ } }, [globalDefaults]]],
                wrapAroundSecondaryAxisSpacing: [densityChoice, [{ fsAppPosConst: { facetTagsVerticalSpacing: _ } }, [globalDefaults]]],

                // EntityTagsDoc params:
                myTaggableEntity: [{ myFacet: _ }, [me]]
            },
            position: {
                left: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]],
                right: [cond,
                    [{ ofOMF: _ }, [me]],
                    o(
                        { on: true, use: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]] },
                        { on: false, use: [plus, scrollbarPosConst.docOffsetAllowingForScrollbar, scrollbarPosConst.scrollbarMarginFromView] }
                    )
                ]
            },
            children: {
                tags: {
                    // FacetTags are sorted so that the includedTags are displayed first.
                    data: [sort,
                        [{ myFacet: { tags: _ } }, [me]],
                        c([{ includedTags: _ }, [areaOfClass, "FacetTagsController"]])
                    ],
                    description: {
                        "class": "FacetTag"
                    }
                }
            }
        },
        {
            qualifier: { userAssignedTags: true },
            children: {
                addTagControl: {
                    description: {
                        "class": "FacetAddTagControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetTag: {
        "class": o("FacetTagDesign", "EntityTag", "TrackMyFacet"),
        context: {
            // EntityTag params:
            myTagsController: [areaOfClass, "FacetTagsController"],
            deletedTags: [{ myFacet: { deletedTags: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetAddTagControl: {
        "class": o("GeneralArea", "WrapAround", "EntityAddTagControl", "TrackMyFacet"),
        context: {
            // EntityAddTagControl
            myTaggableEntity: [{ myFacet: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Facet Tag Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeftmostInFacet: {
        position: {
            leftMarginFromMyFacet: {
                point1: {
                    element: [{ myFacet: _ }, [me]],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in MovingFacet, and it allows the  to control the dataType of the facet 
    //
    // API:
    // 1. myFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataTypeControl: o(
        {
            qualifier: "!",
            context: {
                // it is not easy for us to know at this point whether we have an entire facet of numbers, all represented as strings. 
                // if that is the case, then its ofNumericFacet will be false, and we'll want to give the user the chance to set the dataType themselves.
                enabled: [and,
                    [not, [{ ofUDF: _ }, [me]]],
                    [not, [{ ofDateFacet: _ }, [me]]]
                ]
            }
        },
        { //default
            "class": o("DataTypeControlDesign", "FacetTopControl"),
            context: {
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { dataTypeStr: _ } }, [me]],
                        ":",
                        " ",
                        [{ dataType: _ }, [me]]
                    )
                ],
                //FacetTopControl params:   
                controlToTheLeft: [{ myFSPController: _ }, [me]]
                //end of FacetTopControl params
            }
        },
        {
            qualifier: { ofDateFacet: true },
            "class": "LeftmostInFacet"
        },
        {
            qualifier: { enabled: true },
            write: {
                onDataTypeControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        changeDataType: {
                            to: [{ dataType: _ }, [me]],
                            merge: [{ newDataTypeUponClick: _ }, [me]]
                        },
                        resetFacetType: {
                            to: [{ facetType: _ }, [me]],
                            // this will remove the facetType attribute from the crossViewFacetDataObj
                            // and so the calculated value will based on the other os used to construct the facetData object!
                            // note: we cannot use a simple merge: o() as that would result in the mergeWrite merging a higher priority o() with a lower
                            // priority value (for the facetType attribute), and so the calculated value would be o().
                            // the erase() operator allows to simply remove the attribute. the other alternative, which was not implemented so far 
                            // (see r6967) was to distinguish between writing o() and writing atomic(o()).
                            merge: erase()
                        }
                    }
                }
            }
        },
        { // numerical data type
            qualifier: { dataType: fsAppConstants.dataTypeNumberLabel },
            context: {
                newDataTypeUponClick: fsAppConstants.dataTypeStringLabel
            }
        },
        { // string data type
            qualifier: { dataType: fsAppConstants.dataTypeStringLabel },
            context: {
                newDataTypeUponClick: fsAppConstants.dataTypeNumberLabel
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the class inherited by the control buttons at the top of the facet (above FacetName)
    // It ensures that:
    // - general positioning constraints 
    // - the leftmost control button is the FSPController 
    // - the rightmost control button is the FacetMinimizationControl
    // - spacing constraint between in between control buttons (e.g., DataTypeControl)
    // Note: we may want to create an os of control buttons to simplify the managemnt of e.g., their ordering
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetTopControl: o(
        { //variant-controller            
            qualifier: "!",
            context: {
                iAmFacetMinimizationControl: [equal,
                    [{ myFacetMinimizationControl: _ }, [me]],
                    [me]
                ],
                iAmFSPController: [equal,
                    [{ myFSPController: _ }, [me]],
                    [me]
                ]
            }
        },
        { //default
            "class": o("FacetControl", "AboveFacetName"),
            position: {
                facetTopControlIconTopConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "top",
                        content: true
                    },
                    point2: { type: "top" },
                    equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
                },
                facetTopControlLeftConstraint: {
                    point1: {
                        element: [{ controlToTheLeft: _ }, [me]], //may not be defined
                        type: "right",
                        content: true
                    },
                    point2: { type: "left" },
                    equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: { iAmFacetMinimizationControl: false },
            position: {
                minOffsetFromMinimizationControl: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myFacetMinimizationControl: _ }, [me]],
                        type: "left"
                    },
                    min: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]],
                },
            }
        },
        {
            qualifier: { iAmFSPController: false },
            position: {
                minOffsetFromFSPController: {
                    point1: {
                        element: [{ myFSPController: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. defaultHandleHeight (default value is a function of display density)
    // 2. handleHeight: by default equals defaultHandleHeight.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HandleHeight: {
        "class": "GeneralArea",
        context: {
            defaultHandleHeight: [densityChoice, bFSPosConst.handleHeightDimension],
            handleHeight: [{ defaultHandleHeight: _ }, [me]],

            /*myFacetHeader: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FacetHeader"]
            ]*/
        },
        position: {
            handleHeight: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                equals: [{ handleHeight: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a handle at the top of the facet, which can be used to reorder it. 
    // 
    // API:
    // 1. verticalOffsetFromMyFacetTop: default provided
    // 2. myFacet
    // 3. dimensions
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ReorderableFacetHandle: o(
        {
            qualifier: "!",
            context: {
                dragOnMove: true, //DragHandle param - in variant-controller, to supercede the definition in ReorderHandle and DragHandle inherited below

                // use draggingFlag as a writable reference to iAmDraggedToReorder so that the decisio whether to create a handle for a FrozenFacet 
                // could depend on whether that facet's handle tmd as part of being dragged into the FrozenFacetViewPane
                // note the tmd is defined in the variant-controller to as to take precedence over the Tmdable definitions inherited in the variants below 
                // (e.g. ReorderHandle)
                // we do the same for tmd.
                // the purpose is to ensure we have a single (non-persisted) appData for these two, which resides in FacetClipper.
                // otherwise, we would get the default appData definition from Draggable.
                // By doing this we ensure that even as a facet changes from minimized to expanded and back (and even if it becomes another area in the process!)
                // the draggingFlag/tmd are maintained throughout this operation.
                draggingFlag: [{ myFacet: { iAmDraggedToReorder: _ } }, [me]],

                dragged: [{ draggingFlag: _ }, [me]], // override default Draggable definition

                // redefine offsetOfDraggableVerticalAnchorFromNormalizedPointer/offsetOfDraggableHorizontalAnchorFromNormalizedPointer as RAD
                // so that they are stored in the FacetClipper, and not here in this area. This ensures that even when the facet is changed from being
                // the minimizedFacet child in the FacetClipper to being the expandedFacet (or vice-versa), during a drag operaton, the offset from the pointer
                // remains fixed throughout the drag operation. 
                // note we define these in the variant-controller, so that they overcome the default definitions provided in ReorderHandle and DragHandle below
                offsetOfDraggableVerticalAnchorFromNormalizedPointer: [{ myFacetClipper: { verticalOffsetOfPointerOnDragged: _ } }, [me]],
                offsetOfDraggableHorizontalAnchorFromNormalizedPointer: [{ myFacetClipper: { horizontalOffsetOfPointerOnDragged: _ } }, [me]],
            }
        },
        { // default 
            "class": o("ReorderableFacetHandleDesign", "GeneralArea", "TrackMyFacet"), //"FacetHandleHeight", 
            context: {
                verticalOffsetFromMyFacetTop: 0,
                // control FacetHandleHeight's defaultVerticalAnchorOfControls for a minimized facet
                //defaultVerticalAnchorOfControls: [not, [{ ofMinimizedFacet:_ }, [me]]],                 
                // FacetHandleHeight param:             
                controlsOnHandle: [{ myFacetMinimizationControl: _ }, [me]],

            },
            position: {
                left: 0,
                right: 0,
                // height: see FacetHandleHeight
                verticalAnchorToFacet: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        type: "top",
                        content: true
                    },
                    equals: [{ verticalOffsetFromMyFacetTop: _ }, [me]]
                },
                horizontalAnchorToFacet: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            },
            propagatePointerInArea: o() // i.e. don't propagate up the interbedding tree
        },
        {
            qualifier: { ofMinimizedFacet: false },
            "class": "ReorderHandle",
            context: {
                // ReorderHandle param:
                visReorderable: [{ myFacet: _ }, [me]],
                //positionAboveMyVisReorderable: false
            }
        },
        {
            qualifier: {
                ofMinimizedFacet: true,
                aUDFBeingEdited: false
            },
            "class": "DragHandle",
            context: {
                blockMouseDown: false,
                blockMouseUp: false,
                blockMouseClick: false,

            }
        },
        {
            qualifier: {
                ofMinimizedFacet: true,
                aUDFBeingEdited: false,
                tmd: false,
            },
            "class": "ModifyPointerClickable" // thus overriding the ModifyPointerDraggable in DragHandle's default clause
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowFacetZTop: {
        stacking: {
            belowFacetZTop: {
                lower: [me],
                higher: {
                    element: [{ myFacet: _ }, [me]],
                    label: "zTop"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowAmoebaZTop: {
        stacking: {
            belowAmoebaZTop: {
                lower: [me],
                higher: {
                    element: [{ myAmoeba: _ }, [me]],
                    label: "zTop"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by FacetStateControl, FacetSorterUX, FacetMinimizationControl: controls embedded in the facet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetControl: {
        "class": o("AppControl", "BelowFacetZTop", "TrackMyFacet"),
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The header at the top of a NonOMFacet.
    // It inherits:
    // 1. FacetSorterUX, to allow controlling the application sorting by clicking on this area.
    //
    // This class embeds:
    // 1. FacetName: which displays the name of the facet.
    // 2. NonOMFacetSorterUXDisplay: a visual indication of this facet's role in the application sorting
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetHeader: o(
        { // variant-controller
            qualifier: "!",
            context: {
                blockMouseDoubleClickExpired: false,
                ofReorderableFacet: o(
                    [{ myFacet: { reorderOrPrepareToReorder: _ } }, [me]], //for frozen facets                    
                    [{ ofMinimizedFacet: _ }, [me]],
                    [{ ofMovingFacet: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("FacetHeaderDesign", "GeneralArea", "MinWrapHorizontal", "TrackMyFacet"),
            position: {
                left: 0,
                right: 0,
                top: 0
            },
            children: {
                facetName: {
                    description: {
                        "class": "FacetName"
                    }
                },
                auxFacetNameDisplayWidth: {
                    description: {
                        "class": o(
                            "BelowSiblings", // must be below facetName, so that it does not interfere with its editInputText: true mode!
                            "FacetNameDefaultTextDesign" // so it matches the default display.text object of the embedding FacetName
                        ),
                        context: {
                            myFacetName: [{ children: { facetName: _ } }, [embedding]],
                            displayText: [{ myFacetName: { displayText: _ } }, [me]],
                            textSize: [{ myFacetWidth: { defaultTextSize: _ } }, [me]],
                            defaultWidth: [displayWidth]
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofReorderableFacet: true },
            "class": "ReorderableFacetHandle",
            context: {
                maxOffsetDraggableHorizontalAnchorFromNormalizedPointer: [offset, { type: "left" }, { type: "right" }]
            }
        },
        {
            qualifier: { ofTrashedOrMinimizedFacet: true },
            position: {
                height: [densityChoice, [{ fsAppPosConst: { appUserElementHeight: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { ofSortableFacet: true },
            children: {
                facetSorterUX: {
                    description: {
                        "class": "FacetSorterUX"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays the name of the facet inside the facet header. It also responds to different mouse events:
    // 1. Dragging it drags the facet.
    // 2. If this is the name of a drag-and-droppable facet: Ctrl+MouseDown creates an icon to drop on another facet in order to form a 2D plot.
    //
    // API:
    // 1. vertical position
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                blockMouseDoubleClickExpired: false,
                displayingMyOverlayLegendsMenu: [
                    {
                        moreControlsOpen: _,
                        myFacet: [{ myFacet: _ }, [me]]
                    },
                    [areaOfClass, "MinimizedFacetOverlayLegendsContainer"]
                ],
                ofDragAndDroppableFacet: [and,
                    [{ ofMovingFacet: _ }, [me]],
                    [{ ofSelectableFacet: _ }, [me]]
                ],
                indicateUDFRefElementUX: [and,
                    [{ aUDFBeingEdited: _ }, [me]],
                    [not, [{ ofTrashedFacet: _ }, [me]]]
                ],
                uDFReferenceableUX: [{ myFacet: { uDFReferenceable: _ } }, [me]],

                disabledToAvoidCircularRef: [{ ofUDFDefinedByEditedUDF: _ }, [me]],

                tagIndication: [
                    [{ uniqueID: _ }, [{ inArea: true }, [areaOfClass, "SelectableTag"]]],
                    [{ myFacet: { tags: _ } }, [me]]
                ]
            }
        },
        { // default  
            "class": o(
                "FacetNameDesign",
                "GeneralArea",
                "TrackMyFacet"
            ),
            context: {
                verticalMarginInFacetHeader: [densityChoice, bFSPosConst.facetNameBottomMargin]
            }
        },
        { // NOTE: should appear right after the default clause, to ensure that its propagatePointerInArea: "embedding" doesn't get overridden
            // e.g. by { ofOMF: false } inheritance of EditableTooltipable, which inherits Tooltipable, which inherits propagatePointerInArea: o() 
            qualifier: { ofFrozenFacet: true },
            "class": "DelayedInArea", // to allow the creation of a facet handle when hovering over the FacetName of a frozen facet            
            propagatePointerInArea: "embedding" // override the o() provided by Tooltipable, to ensure the FacetHeader sets its inArea to true when 
            // we're over the FacetHeader or its Tooltip.
        },
        {
            qualifier: { ofOMF: false },
            "class": o("ContentSpillsOver", "TextInput", "EditableTooltipable"),
            context: {
                // TextInput params
                defaultTextInputDesign: false, // so that the FacetNameDesign definitions prevail
                mouseEventToEdit: "DoubleClickExpired",
                blockMouseDown: false, // to allow the minimized facet to be dragged 
                inputAppData: [{ myFacet: { name: _ } }, [me]],
                placeholderInputText: [
                    [{ myApp: { placeholderInputTextGenerator: _ } }, [me]],
                    [{ myApp: { facetEntityStr: _ } }, [me]]
                ],

                inputTextValuesAlreadyUsed: [ // names of other facets
                    n([{ myFacet: { name: _ } }, [me]]),
                    [
                        { name: _ },
                        [{ myApp: { nonTrashedFacetData: _ } }, [me]]
                    ]
                ],
                notAllowedInputValues: s(/^\s+$/),
                inputTextAlreadyBeingUsedMsg: [
                    [{ myApp: { inputTextAlreadyBeingUsedMsgGenerator: _ } }, [me]],
                    [{ myApp: { facetEntityStr: _ } }, [me]]
                ],
                // EditableTooltipable params                
                defaultTooltipText: [{ myFacet: { defaultDescriptionText: _ } }, [me]],
                tooltipTextAppData: [{ myFacet: { description: _ } }, [me]],
            }
        },
        {
            qualifier: { ofOMF: true },
            "class": "OMFName"
        },
        {
            qualifier: {
                ofOMF: false,
                tooltipEditInputText: false
            },
            context: {
                tooltipTextCore: [concatStr,
                    o(
                        [{ tooltipTextAppData: _ }, [me]],
                        [cond,
                            [and,
                                [{ ofUDF: _ }, [me]],
                                [{ myFacet: { expression: _ } }, [me]]
                            ],
                            // if an expression is defined, append its string representation on a new line
                            o(
                                {
                                    on: true,
                                    use: [concatStr,
                                        o(
                                            "\n=",
                                            [{ myFacet: { expressionAsStr: _ } }, [me]],
                                            [cond,
                                                [and,
                                                    [not, [{ ofTrashedFacet: _ }, [me]]],
                                                    [not, [{ indicateUDFRefElementUX: _ }, [me]]],
                                                    [not, [{ ofProperlyDefinedFacet: _ }, [me]]]
                                                ],
                                                o(
                                                    {
                                                        on: true,
                                                        use: [concatStr,
                                                            o(
                                                                "\n",
                                                                [{ myApp: { disabledStr: _ } }, [me]],
                                                                ":",
                                                                " ",
                                                                [cond,
                                                                    [{ myFacet: { properFormula: _ } }, [me]],
                                                                    o(
                                                                        {
                                                                            on: false,
                                                                            use: [{ myApp: { incorrectFormulaStr: _ } }, [me]]
                                                                        },
                                                                        {
                                                                            on: true,
                                                                            use: [cond,
                                                                                [{ myFacet: { properReferences: _ } }, [me]],
                                                                                o(
                                                                                    {
                                                                                        on: false,
                                                                                        use: [{ myApp: { obsoleteReferenceInFormulaStr: _ } }, [me]]
                                                                                    },
                                                                                    {
                                                                                        on: true,
                                                                                        use: [concatStr,
                                                                                            o(
                                                                                                [{ myApp: { definedByAStr: _ } }, [me]],
                                                                                                " ",
                                                                                                [{ myApp: { disabledStr: _ } }, [me]],
                                                                                                " ",
                                                                                                [{ myApp: { facetEntityStr: _ } }, [me]]
                                                                                            )
                                                                                        ]
                                                                                    }
                                                                                )
                                                                            ]
                                                                        }
                                                                    )
                                                                ]
                                                            )
                                                        ]
                                                    }
                                                )
                                            ]
                                        )
                                    ]
                                }
                            )
                        ]
                    )
                ],
                tooltipTextCoreDefined: [and,
                    [{ tooltipTextCore: _ }, [me]],
                    [notEqual, [{ tooltipTextCore: _ }, [me]], ""]
                ],
                tooltipText: [concatStr,
                    o(
                        [cond,
                            [{ contentSpillsOver: _ }, [me]],
                            o({ on: true, use: [{ myFacet: { name: _ } }, [me]] })
                        ],
                        [cond,
                            [and,
                                [{ contentSpillsOver: _ }, [me]],
                                [{ tooltipTextCoreDefined: _ }, [me]]
                            ],
                            o({ on: true, use: ":\n" })
                        ],
                        [cond,
                            [{ tooltipTextCoreDefined: _ }, [me]],
                            o({ on: true, use: [{ tooltipTextCore: _ }, [me]] })
                        ]
                    )
                ]
            }
        },
        {
            qualifier: {
                ofOMF: false,
                tooltipEditInputText: false,
                indicateUDFRefElementUX: true,
                disabledToAvoidCircularRef: true
            },
            context: {
                tooltipTextCore: "Disabled: Preventing a Circular Reference"
            }
        },
        {
            qualifier: {
                ofOMF: false,
                formulaPanelIsOpen: false,
                tooltipEditInputText: false,
                indicateUDFRefElementUX: true,
                uDFReferenceableUX: false
            },
            context: {
                tooltipTextCore: [concatStr,
                    o(
                        [{ myApp: { disabledStr: _ } }, [me]],
                        ":",
                        " ",
                        [{ myApp: { notANumericalFacetStr: _ } }, [me]]
                    )
                ]
            }
        },
        {
            qualifier: {
                ofOMF: false,
                indicateUDFRefElementUX: true,
                uDFReferenceableUX: true
            },
            "class": "UDFRefElementUX",
            context: {
                myUDFRefElement: [
                    { uniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ uDFRefElements: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { ofExpandedFacet: false },
            position: {
                offfsetFromFacetLeft: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bFSPosConst.defaultHorizontalMarginAroundMinimizedFacetName
                }
            }
        },
        {
            qualifier: { ofExpandedFacet: true },
            "class": "BlockMouseEvent",
            context: {
                blockMouseDown: false,
                blockMouseUp: false,


                minMaxWidthOfFrame: [densityChoice, [{ facetNameTextSize: { maxWidth: _ } }, [globalDefaults]]],
                defaultFontSizeFrameWidth: [{ children: { auxFacetNameDisplayWidth: { defaultWidth: _ } } }, [embedding]],
                maxWidthOfFrame: [max, // used by Design class
                    [{ minMaxWidthOfFrame: _ }, [me]],
                    [offset, { type: "left" }, { type: "right" }]
                ]
            },
            position: {
                "content-height": [displayHeight],
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [min, [{ minMaxWidthOfFrame: _ }, [me]], [displayWidth]]
                },
                weakExpansionForce: { // note: weaker than the MinWrap constraint and the mouse attachment 
                    // (e.g. when expanding/contracting the facet width manually!!)
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: [{ defaultFontSizeFrameWidth: _ }, [me]],
                    preference: "max",
                    priority: positioningPrioritiesConstants.weakerThanMouseAttachment
                },
                offfsetFromFacetLeft: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left"
                    },
                    min: bFSPosConst.horizontalMarginAroundExpandedFacetName
                },
                centerInExpandedFacet: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                aUDFBeingEdited: true,
                formulaPanelIsOpen: false, // i.e. exempt the FacetName of the UDF being edited from the blocking of a mouse event to edit its name!
                ofOMF: false
            },
            context: {
                mouseToEdit: false
            }
        },
        {
            qualifier: { ofExpandedFacet: true, ofOMF: false },
            "class": "ModifyPointerClickable",
            context: {
                mouseEventToEdit: "Click",
            }
        },
        {
            qualifier: { ofTrashedOrMinimizedFacet: false },
            position: {
                facetNameVerticallyAlignedWithMinimizationControl: {
                    point1: {
                        element: [{ myFacetMinimizationControl: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "vertical-center", // so that text is aligned both with (in FacetSettingPanel) and without padding
                    },
                    equals: [densityChoice, bFSPosConst.facetNameTopMargin]
                },
                facetNameBottomAlignedWithFacetHeaderBottom: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ myFacetHeader: _ }, [me]],
                        type: "bottom"
                    },
                    equals: [{ verticalMarginInFacetHeader: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofTrashedOrMinimizedFacet: true },
            position: {
                "vertical-center": 0,
                "content-height": [displayHeight],
                facetNameRightMin1: {
                    point1: { type: "right" },
                    point2: { element: [{ myFacetHeader: _ }, [me]], type: "right", content: true },
                    min: bFSPosConst.minimizedFacetFacetNameRightMargin
                },
                eitherAttachToFacetHeader: {
                    point1: { type: "right" },
                    point2: { element: [{ myFacetHeader: _ }, [me]], type: "right", content: true },
                    equals: bFSPosConst.minimizedFacetFacetNameRightMargin,
                    orGroups: { label: "facetNameRight" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },

                minOffsetFromElementOnRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ elementOnRightOfFacetName: _ }, [me]], // defined in variants below
                        type: "left"
                    },
                    min: bFSPosConst.minimizedFacetFacetNameRightMargin
                },
                orAttachToElementOnRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ elementOnRightOfFacetName: _ }, [me]], // defined in variants below
                        type: "left"
                    },
                    equals: bFSPosConst.minimizedFacetFacetNameRightMargin,
                    orGroups: { label: "facetNameRight" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: { ofMinimizedFacet: true },
            context: {
                elementOnRightOfFacetName: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "MinimizedFacetOverlayLegendsContainer"]
                ]
            }
        },
        {
            qualifier: { ofTrashedFacet: true },
            "class": "TrashedReorderableElementName",
            context: {
                myTrashable: [{ myFacet: _ }, [me]],
                elementOnRightOfFacetName: [
                    { myTrashable: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "UntrashControl"]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is for the icon created when dragging a facet name as part of the process of forming a 2D plot in the drop-site facet.
    // This class inherits DraggableIcon, and it displays the name of the facet of origin.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggedFacetNameIcon: {
        "class": o("DraggedFacetNameIconDesign", "GeneralArea", "DraggableIcon"),
        context: {
            myFacet: [{ myFacet: _ }, [expressionOf]], // used in a couple of places (e..g FacetWithAmoeba, which need to query the facet whose name is being dragged.
            displayText: [{ myFacet: { name: _ } }, [me]]
        },
        position: {
            width: 80, // to be replaced by a display query
            height: 20 // to be replaced by a display query
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays the up/down arrow in a sortable facet.
    // It inherits:
    // 1. SorterUXDisplay
    // 2. If in an OMF, it inherits FacetSorterUX (if not in an OMF, it's the embedding facetHeader that inherits FacetSorterUX; OMFs don't have a facetHeader).
    //
    // API:
    // 1. position it.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSorterUXDisplay: {
        "class": o("SorterUXDisplay", "TrackMyFacet"),
        context: {
            // SorterUXDisplay param: 
            mySorterUX: [embedding] // override default definition.
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    // This class provides the facet sorting UX. 
    // It is inherited by the FacetHeader (for the SliderFacet and MSFacet).  // to add OMF here
    // For OMF, in the absence of a FacetHeader, the FacetSorterUXDisplay inherits FacetSorterUX in its variant for an OMFacet.
    // 
    // When we sort by facet, all overlay solutionSetViews are reset to their default first in view (the first solutionSetItem).
    // 
    // API:
    // inheriting classes should provide an embedded area that inherits FacetSorterUXDisplay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSorterUX: o(
        { // default
            "class": o(
                "SorterUX", // to be inherited before FacetControl so that its definitions for Tooltipable take precedence
                "FacetControl"),
            context: {
                // SorterUX params
                mySortable: [{ mySortableFacet: _ }, [me]],

                // override default value provided to SorterUX by its inheritance of Tmdable:
                // this allows the user to both sort the facet by clicking on its FacetHeader (which inherits FacetSorterUX) and to drag the entire facet by its FacetHeader.
                tmdableContinuePropagation: true
            },
            children: {
                sorterUXDisplay: {
                    description: {
                        "class": "FacetSorterUXDisplay"
                    }
                }
            },
            write: {
                onFacetSorterUXMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        resetToFirstInAllOverlaySolutionSetViews: {
                            to: [{ specifiedFiVUniqueID: _ }, [areaOfClass, "OverlaySolutionSetView"]],
                            merge: o()
                        }
                    }
                }
            }
        },
        { // defaultWidth / defaultHeight - flags inherited from AppControl
            qualifier: { defaultWidth: true },
            position: {
                width: bFSPosConst.sorterUXWidth
            }
        },
        {
            qualifier: { defaultHeight: true },
            position: {
                height: bFSPosConst.sorterUXHeight
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the blocking of mouse events, except for MouseUp which are allowed to pass through when we're in the midst of 2D-plot-formation drag&drop operation
    // This class, as the name suggests, is inherited by some areas embeddedStar in Facet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BlockMouseEventInFacetEmbeddedStar: o(
        { // default
            "class": o("BlockMouseEvent", "TrackFacetNameDragging")
        },
        {
            qualifier: { facetNameIsDragged: true },
            context: {
                // BlockMouseEvent param - default value override: 
                // allow MouseUp to propagate to the embedding facet so that dropping another facet onto the amoeba as part of the formation of a 2D plot
                blockMouseUp: false
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Provide an inheriting class a variant controller indicating whether we're in the midst of 2D-plot-formation drag&drop operation
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackFacetNameDragging: o(
        { // variant-controller
            qualifier: "!",
            context: {
                facetNameIsDragged: [areaOfClass, "DraggedFacetNameIcon"]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited in an areaSet, and represents a single direct-access control for modifying the associated facet's state.
    // When clicking on this area, it writes directly into the facet's state.
    //
    // API: the areaSet areaSetContent should have two attributes at least:
    // 1. uniqueID: which maps to one of the values of facetState
    // 2. tooltipText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStateControl: {
        "class": o("GeneralArea", "FacetControl"),
        context: {
            uniqueID: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
            tooltipText: [{ param: { areaSetContent: { tooltipText: _ } } }, [me]]
        },
        write: {
            onFacetStateControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    setFacetState: {
                        to: [{ myFacet: { state: _ } }, [me]],
                        merge: [{ uniqueID: _ }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by FacetWithAmoebaMinimizationControl (which allows to minimize the associated facet) 
    // A minimized facet has a small/pre-defined width, and displays no cell values. 
    // SliderFacet/DiscreteFacet all have minimization controls (a single OMF doesn't have such a control, nor does the displayedUniqueID have this control.
    //
    // This class inherits: BiStateButton: with its 'checked' appData used as a writable reference pointing to ofMinimizedFacet (provided by TrackMyFacet).
    //
    // API:
    // 1. myFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetMinimizationControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hidden: o(
                    [{ myFacet: { facetPanelIsOpen: _ } }, [me]],
                    [and,
                        [{ myFacet: { ofFrozenPane: _ } }, [me]],
                        [not, [{ myFacet: { reorderOrPrepareToReorder: _ } }, [me]]]
                    ]
                    /*
                    [ // triggers bug #1670
                        {
                            ofFrozenPane: true,
                            showTopControls: false
                        },
                        [{ myFacet:_ }, [me]]
                    ]
                    */
                )
            }
        },
        { // default
            "class": o("FacetMinimizationControlDesign", "FacetTopControl"),
            context: {
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { minimizeFacet: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { facetEntityStr: _ } }, [me]],
                    [{ ofExpandedFacet: _ }, [me]]
                ],
                active: compileMinimizedFacets,
                // disabled when compileMinimizedFacets is false  
            },
            position: {
                rightMarginFromMyFacet: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: { ofMinimizedFacet: false }, // i.e. an expanded facet                        
            display: {
                pointerOpaque: false
            },
        },
        {
            qualifier: { active: true, ofMinimizedFacet: false },
            // i.e. an expanded facet when compileMinimizedFacets is true       
            write: {
                onFacetMinimizationControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        "class": "RemoveFromReorderedFacetsInPaneUniqueIDs"
                    }
                }
            }
        },
        {
            qualifier: { hidden: true },
            "class": "ZeroWidth",
            context: {
                defaultWidth: false
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetExpansionUX: {
        write: {
            onFacetExpansionUX: {
                "class": "OnMouseDoubleClick",
                true: {
                    "class": "FacetExpansionCoreWrite"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RemoveFromReorderedFacetsInPaneUniqueIDs: {
        removeFromReorderedFacetsInPaneUniqueIDs: {
            to: [{ myFacet: { myPane: { reorderedFacetInPaneUniqueIDs: _ } } }, [me]],
            merge: [
                n([{ myFacet: { uniqueID: _ } }, [me]]),
                [{ myFacet: { myPane: { reorderedFacetInPaneUniqueIDs: _ } } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetExpansionCoreWrite: {
        insertInExpandedMovingFacetUniqueIDs: {
            to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
            merge: o(
                [{ myFacet: { uniqueID: _ } }, [me]],
                [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
            )
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Amoeba, and Amoeba-embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the SliderAmoeba and DiscreteAmoeba (via Lean/Fat).
    // It represents a facet-wide selection control and display area, where non-item-specific values are displayed. 
    // It is embedded in a facet when the latter is in a state other than the summary state or the minimized state.
    //
    // This class inherits BlockMouseEventInFacetEmbeddedStar and MinWrapHorizontal.
    //
    // Embedding (in Fat, currently).
    // 1. The Slider/MS/Rating amoebas embed a class which inherits PrimaryWidget.
    // 2. In the facet's histogram state, they'll also embed the matching Histogram class.
    // 3. In the facet's 2D plot state, this class will embed a TwoDPlot, and a SecondaryAxisSelector (the x-axis). If an actual selection for the x-axis, the appropriate type of
    //    secondary-axis widget will also be embedded (SliderSecondaryWidget/MSSecondaryWidget, as the case may be).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////                                 
    Amoeba: o(
        { // variant-controller
            qualifier: "!",
            context: {
                attachFacetAmoebaToTheBottomOfDropDownPanelABTesting: [equal,
                    [{ attachFacetAmoebaToTheBottomOfFSP: _ },
                    [areaOfClass, "FSApp"]],
                    "yes"
                ]
            }
        },
        { // default
            "class": o(
                "AmoebaDesign",
                "GeneralArea",
                "BlockMouseEventInFacetEmbeddedStar",
                "MinWrapHorizontal",
                "ZTop",
                "TrackZoomBoxingOverlayShowSolutionSet",
                "TrackMyFacet"),
            context: {
                offsetAmoebaTop: bFSPosConst.marginAboveAmoeba,
                offsetAmoebaBottom: bFSPosConst.marginBelowAmoeba,

                // note that unlike the definition of myDiscreteValueNamesAreBeingExpanded in the MovingFacet, here we're asking if the valueNames in *myFacet*
                // are being expanded. the embedding facet marks itself as expanding in that case, so that it remembers to record the new width on mouseUp.
                amoebaElementBeingExpanded: o(
                    [
                        {
                            expanding: true,
                            myFacet: [{ myFacet: _ }, [me]]
                        },
                        [areaOfClass, "DiscreteValueNamesExpandableArea"]
                    ],
                    [
                        {
                            expanding: true,
                            myFacet: [{ myFacet: _ }, [me]]
                        },
                        [areaOfClass, "HistogramView"]
                    ]
                )
            },
            // children: see MS/Slider/Rating inheriting classes.
            position: {
                attachAmoebaTop: {
                    point1: [{ anchorAmoebaTop: _ }, [me]],  // see variants below
                    point2: {
                        type: "top"
                    },
                    equals: [{ offsetAmoebaTop: _ }, [me]]   // see variants below
                },
                bottom: [{ offsetAmoebaBottom: _ }, [me]],
                minFromFacetLeft: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left"
                    },
                    min: bFSPosConst.amoebaHorizontalMargin
                },
                right: bFSPosConst.amoebaHorizontalMargin
            },
            children: {
                controlPanel: {
                    description: {
                        "class": "AmoebaControlPanel"
                    }
                }
            }
        },
        {
            qualifier: {
                zoomBoxingOverlayShowSolutionSet: false,
                ofFacetDraggedToReorder: false
            },
            context: {
                anchorAmoebaTop: atomic({
                    element: [{ myApp: _ }, [me]],
                    label: "bottomOfFacetHeader"
                })
            }
        },
        {
            qualifier: {
                zoomBoxingOverlayShowSolutionSet: false,
                ofFacetDraggedToReorder: true
            },
            context: {
                anchorAmoebaTop: atomic({
                    element: [{ myFacetHeader: _ }, [me]],
                    type: "bottom"
                })
            }
        },
        {
            qualifier: {
                zoomBoxingOverlayShowSolutionSet: false,
                attachFacetAmoebaToTheBottomOfDropDownPanelABTesting: true,
                facetPanelIsOpen: true
            },
            context: {
                anchorAmoebaTop: atomic({
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "FSP"]
                    ],
                    type: "bottom"
                })
            }
        },
        {
            qualifier: {
                zoomBoxingOverlayShowSolutionSet: false,
                ofFacetDraggedToReorder: false,
                showTagsViewPane: true
            },
            context: {
                anchorAmoebaTop: atomic({
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "FacetTagsView"]
                    ],
                    type: "bottom"
                })
            }
        },
        {
            qualifier: { zoomBoxingOverlayShowSolutionSet: true },
            context: {
                anchorAmoebaTop: atomic({
                    element: [areaOfClass, "ZoomBoxBottom"],
                    type: "top"
                })
            }
        },
        {
            qualifier: { facetState: facetState.histogram },
            children: {
                valDisplayClipper: {
                    description: {
                        "class": "HistogramBarValDisplayClipper"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AmoebaControlPanel: o(
        { // default
            "class": o("AmoebaControlPanelDesign", "GeneralArea", "MinWrapVertical", "TrackMyFacet", "TrackItemsShowing"),
            context: {
                minWrapTop: [densityChoice, [{ fsAppPosConst: { amoebaControlVerticalMargin: _ } }, [globalDefaults]]],
                minWrapBottom: [densityChoice, [{ fsAppPosConst: { amoebaControlVerticalMargin: _ } }, [globalDefaults]]]
            },
            position: {
                top: bFSPosConst.amoebaControlPanelVerticalOffset,
                left: bFSPosConst.amoebaControlPanelHorizontalOffset,
                right: bFSPosConst.amoebaControlPanelHorizontalOffset
            },
            children: {
                closeAmoebaControl: {
                    description: {
                        "class": "AmoebaCloseControl"
                    }
                }
            }
        },
        {
            qualifier: { ofDateFacet: false },
            children: {
                showSelectorsControl: {
                    description: {
                        "class": "ShowSelectorsControl"
                    }
                },
                showHistogramControl: {
                    description: {
                        "class": "ShowHistogramControl"
                    }
                }
            }
        },
        {
            qualifier: {
                ofSliderFacet: true,
                showSelectors: true
            },
            children: {
                showStatsControl: {
                    description: {
                        "class": "ShowStatsControl"
                    }
                }
            }
        },
        {
            qualifier: { itemsShowing: true },
            children: {
                showFacetCellsControl: {
                    description: {
                        "class": "ShowFacetCellsControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetAmoebaControlCore: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                showAmoeba: [{ myFacet: { showAmoeba: _ } }, [me]]
            }
        },
        { // default
            "class": "FacetControl",
            context: {
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { showAmoeba: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { facetEntityStr: _ } }, [me]], " ", [{ myApp: { controllerEntityStr: _ } }, [me]])],
                    [{ showAmoeba: _ }, [me]]
                ]
            },
            write: {
                onFacetAmoebaControlCoreMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleShowAmoeba: {
                            to: [{ showAmoeba: _ }, [me]],
                            merge: [not, [{ showAmoeba: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class assumes the inheriting area also inherits FacetControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetHeaderControl: {
        "class": o("GeneralArea", "TrackMyFacet"),
        stacking: {
            aboveMyFacetHeader: {
                higher: [me],
                lower: [{ myFacetHeader: _ }, [me]]
            }
            // being below the facet's zTop is handled by the sibling class inherited: FacetControl
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetAmoebaControl: o(
        { // default
            "class": o("FacetAmoebaControlDesign", "GeneralArea", "FacetAmoebaControlCore", "FacetHeaderControl"),
            position: {
                right: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
                minHorizontalOffsetFromFacetName: {
                    point1: {
                        element: [{ myFacetName: _ }, [me]],
                        type: "right"
                    },
                    point2: { type: "left" },
                    min: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]]
                },
                alignVerticallyWithFacetName: {
                    point1: {
                        element: [{ myFacetName: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: { type: "vertical-center" },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveFacetHeader: {
        "class": "TrackMyFacet",
        stacking: {
            aboveFacetHeader: {
                higher: [me],
                lower: [{ myFacetHeader: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveFacetName: {
        "class": "TrackMyFacet",
        stacking: {
            aboveFacetName: {
                higher: [me],
                lower: [{ myFacetName: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AmoebaControl: {
        "class": o("FacetControl", "BelowAmoebaZTop"),
        position: {
            top: [densityChoice, [{ fsAppPosConst: { amoebaControlVerticalMargin: _ } }, [globalDefaults]]],
            bottom: [densityChoice, [{ fsAppPosConst: { amoebaControlVerticalMargin: _ } }, [globalDefaults]]],
            minOffsetFromEmbeddingLeft: {
                point1: {
                    element: [embedding],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AmoebaCloseControl: {
        "class": o("AmoebaCloseControlDesign", "FacetAmoebaControlCore", "AmoebaControl"),
        position: {
            right: bFSPosConst.amoebaCloseControlRightMargin
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowStatsControl: {
        "class": o("ShowStatsControlDesign", "AmoebaControl"),
        context: {
            showStats: [{ myFacet: { showStats: _ } }, [me]],
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { showStats: _ } }, [globalDefaults]],
                "",
                [{ myApp: { statisticEntityStrPlural: _ } }, [me]],
                [{ showStats: _ }, [me]]
            ]
        },
        write: {
            onShowStatsControlCoreMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleShowStats: {
                        to: [{ showStats: _ }, [me]],
                        merge: [not, [{ showStats: _ }, [me]]]
                    }
                }
            }
        },
        position: {
            attachToShowSelectorsControl: {
                point1: { type: "right" },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "ShowSelectorsControl"]
                    ],
                    type: "left"
                },
                equals: [densityChoice, [{ fsAppPosConst: { amoebaControlHorizontalMargin: _ } }, [globalDefaults]]]
            }
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowSelectorsControl: {
        "class": o("ShowSelectorsControlDesign", "AmoebaControl"),
        context: {
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { showSelectors: _ } }, [globalDefaults]],
                "",
                [{ myApp: { selectorEntityStrPlural: _ } }, [me]],
                [{ showSelectors: _ }, [me]]
            ]
        },
        write: {
            onShowSelectorsControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggle: {
                        to: [{ showSelectors: _ }, [me]],
                        merge: [not, [{ showSelectors: _ }, [me]]]
                    }
                }
            }
        },
        position: {
            attachToShowHistogramControl: {
                point1: { type: "right" },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "ShowHistogramControl"]
                    ],
                    type: "left"
                },
                equals: [densityChoice, [{ fsAppPosConst: { amoebaControlHorizontalMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowHistogramControl: {
        "class": o("ShowHistogramControlDesign", "GeneralArea", "AmoebaControl"),
        context: {
            showHistogram: [{ myFacet: { showHistogram: _ } }, [me]],
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { showHistogram: _ } }, [globalDefaults]],
                "",
                [{ myApp: { histogramEntityStr: _ } }, [me]],
                [{ showHistogram: _ }, [me]]
            ]
        },
        write: {
            onShowHistogramControlCoreMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleShowHistogram: {
                        to: [{ showHistogram: _ }, [me]],
                        merge: [not, [{ showHistogram: _ }, [me]]]
                    }
                }
            }
        },
        position: {
            attachToCloseControl: {
                point1: { type: "right" },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "AmoebaCloseControl"]
                    ],
                    type: "left"
                },
                equals: [densityChoice, [{ fsAppPosConst: { amoebaControlHorizontalMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowFacetCellsControl: {
        "class": o("ShowFacetCellsControlDesign", "AmoebaControl"),
        context: {
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { showFacetCells: _ } }, [globalDefaults]],
                "",
                [concatStr, o([{ myApp: { itemEntityStr: _ } }, [me]], " ", [{ myApp: { valueEntityStrPlural: _ } }, [me]])],
                [{ showingFacetCells: _ }, [me]]
            ]
        },
        position: {
            left: bFSPosConst.showFacetCellsControlLeftMargin,
            minOffsetFromShowSelectorsControl: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "ShowSelectorsControl"]
                    ],
                    type: "left"
                },
                min: [densityChoice, [{ fsAppPosConst: { amoebaControlHorizontalMargin: _ } }, [globalDefaults]]]
            },
            minOffsetFromStatsControl: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "ShowStatsControl"]
                    ],
                    type: "left"
                },
                min: [densityChoice, [{ fsAppPosConst: { amoebaControlHorizontalMargin: _ } }, [globalDefaults]]]
            }
        },
        write: {
            onShowFacetCellsControlClick: {
                "class": "OnMouseClick",
                true: {
                    toggleShowMyFacetCells: {
                        to: [{ myFacet: { showMyFacetCells: _ } }, [me]],
                        merge: [not, [{ myFacet: { showMyFacetCells: _ } }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowOverlaysInFacetControl: o(
        {
            "class": o("ShowOverlaysInFacetControlDesign", "TooltipableControl", "FacetControl", "TrackMyWidget"),
            context: {
                dimensionDefinesContent: false, // override default value of AppElement, inherited via FacetControl.
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { showStr: _ } }, [me]],
                        " ",
                        [{ myApp: { overlayEntityStrPlural: _ } }, [me]],
                        " ",
                        [{ myApp: { inStr: _ } }, [me]],
                        " ",
                        [{ myApp: { facetEntityStr: _ } }, [me]]
                    )
                ],
                lastOverlayXWidgetInWidget: [
                    {
                        myWidget: [{ myWidget: _ }, [me]],
                        lastInAreaOS: true
                    },
                    [areaOfClass, "PermOverlayXWidget"]
                ]
            },
            write: {
                showOverlaysInFacetMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        showAllOverlaysInFacet: {
                            to: [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { inFocus: true },
            children: {
                hiddenOverlaysMenu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "HiddenOverlaysInFacetMenu"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                top: [{ myWidget: { offsetToLowHTMLSideOfOverlayXWidgetLegends: _ } }, [me]],
                attachRightToBeginningOfFirstOverlayXWidget: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: bFSPosConst.overlayXWidgetsSpacing
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                top: 0,
                left: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]]
                /*attachBottomToBeginningOfFirstOverlayXWidget: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: bFSPosConst.overlayXWidgetsSpacing
                }*/
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. overlaySelectorMenuUniqueIDs
    // 2. menuItemText: the string to appear in each OverlaySelectorMenuItemText in the embedded menu items.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySelectorMenu: {
        "class": o("GeneralArea", "MenuCore"),
        position: {
            // horizontal positioning handled by MenuCore
            attachToBottomOfMyMenuAnchor: { // MenuCore provides a vertical constraint at a lower priority. so this one will win out.
                point1: {
                    element: [{ myMenuAnchor: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "bottom"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault
            }
        },
        children: {
            menuItem: {
                data: [identify, _, [{ overlaySelectorMenuUniqueIDs: _ }, [me]]]
                // description: provided by inheriting class
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. inheriting class should provide the write handler to the action to be taken when clicking on this area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySelectorMenuItem: {
        "class": o("GeneralArea", "MemberOfTopToBottomAreaOS"),
        context: {
            uniqueID: [{ param: { areaSetContent: _ } }, [me]], // the uniqueID of the overlay represented by this menu item
            myOverlay: [
                { uniqueID: [{ uniqueID: _ }, [me]] },
                [areaOfClass, "Overlay"]
            ],
            spacingFromPrev: 1
        },
        children: {
            legend: {
                description: {
                    "class": "OverlaySelectorMenuItemLegend"
                }
            },
            text: {
                description: {
                    "class": "OverlaySelectorMenuItemText"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySelectorMenuItemLegend: {
        "class": o("OverlaySelectorMenuItemLegendDesign", "GeneralArea", "IconInTextAndIcon"),
        context: {
            // override the default provided by OverlayLegend
            dimension: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]]
        },
        position: {
            width: [{ dimension: _ }, [me]],
            height: [{ dimension: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySelectorMenuItemText: {
        "class": o("OverlaySelectorMenuItemTextDesign", "GeneralArea", "TextInTextAndIcon"),
        context: {
            myOverlaySelectorMenu: [
                [embeddingStar],
                [areaOfClass, "OverlaySelectorMenu"]
            ],
            displayText: [{ myOverlaySelectorMenu: { menuItemText: _ } }, [me]],
            horizontalMargin: bFSPosConst.amoebaControlMargin
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HiddenOverlaysInFacetMenu: {
        "class": o("HiddenOverlaysInFacetMenuDesign", "OverlaySelectorMenu"),
        context: {
            myFacet: [{ myIconable: { myFacet: _ } }, [me]],

            // OverlaySelectorMenu param:
            overlaySelectorMenuUniqueIDs: [ // select the uniqueID of the hidden overlays in this facet from the complete ordering of overlays 
                [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [me]],
                [sort, // sort the non-trashed overlays by the overlays' complete sorting AD
                    [{ myApp: { nonTrashedOverlayData: { uniqueID: _ } } }, [me]],
                    [{ reorderedOverlayDataUniqueID: _ }, [me]]
                ]
            ],
            menuItemText: "Show"
        },
        children: {
            menuItem: {
                // data: see OverlaySelectorMenu
                description: {
                    "class": "HiddenOverlayMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HiddenOverlayMenuItem: {
        "class": "OverlaySelectorMenuItem",
        write: {
            onHiddenOverlayMenuItemClick: {
                "class": "OnMouseClick",
                true: {
                    removeFromFacetOS: {
                        to: [
                            [{ uniqueID: _ }, [me]],
                            [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [embedding]]
                        ],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the widget on the primary axis of an amoeba (currently: the vertical axis). It is inherited by the SliderPrimaryWidget/DiscretePrimaryWidget.
    // This class inherits:
    // 1. Vertical: as it is laid out on the vertical axis
    // 2. Widget: the common code to the PrimaryWidget and SecondaryWidget classes.
    //
    // This class defines the "horizontalAnchorForHistogramOr2DPlot" posPoint label, depending on whether it actually embeds any OverlayXWidgets or not:
    // It has an areaSet of these embedded in it. Its data is defined in the inherited Widget class, and its class description is provided by the MSWidget/RatingWidget/SliderWidget
    // sibling classes.
    //
    // API:
    // 1. offsetFromAmoebaBottom: the offsets from the amoeba on the length axis. default provided.
    // 2. offsetFromAmoebaLeft/offsetFromAmoebaRight: the offsets from the amoeba on the girth axis. default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PrimaryWidget: o(
        { // default
            "class": o("Widget", "AttachBelowAmoebaControlPanel"),
            context: {
                // myFacet - provided by Widget's inheritance of TrackMyFacet (unlike SecondaryWidget, where we override the myFacet definition - see there).
                offsetFromAmoebaBottom: 0,
                offsetFromAmoebaLeft: 0,
                offsetFromAmoebaRight: [densityChoice, bFSPosConst.amoebaMarginFromEmbeddedOnRight]
            },
            position: {
                attachToBottomOfAmoeba: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "bottom",
                        content: true
                    },
                    equals: [{ offsetFromAmoebaBottom: _ }, [me]]
                },
                labelTopAnchorForHistogramOr2DPlot: {
                    point1: {
                        label: "topAnchorForHistogramOr2DPlot"
                    },
                    point2: {
                        element: [{ myAmoebaControlPanel: _ }, [me]],
                        type: "bottom"
                    },
                    equals: 0
                },
                labelBottomAnchorForHistogramOr2DPlot: {
                    point1: {
                        label: "bottomAnchorForHistogramOr2DPlot"
                    },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "bottom",
                        content: true
                    },
                    equals: 0
                },
                attachToLeftOfAmoeba: {
                    point1: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ offsetFromAmoebaLeft: _ }, [me]]
                },

                attachToRightOfAmoeba: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    equals: [cond,
                        [{ facetState: _ }, [me]],
                        o(
                            {
                                on: facetState.histogram,
                                use: 0
                            },
                            {
                                on: null,
                                use: [{ offsetFromAmoebaRight: _ }, [me]]
                            }
                        )
                    ]
                },
                beginningOfFirstOverlayXWidgetLeftOfRightContent: {
                    point1: { label: "beginningOfFirstOverlayXWidget" },
                    point2: { type: "right", content: true },
                    min: 0
                }
            }
        },
        {
            qualifier: { overlayXWidgetsExist: true },
            position: {
                labelHorizontalAnchorForHistogramOr2DPlot: {
                    point1: {
                        element: [last, [{ children: { permOverlayXWidgets: _ } }, [me]]],
                        type: "right"
                    },
                    point2: {
                        label: "horizontalAnchorForHistogramOr2DPlot"
                    },
                    equals: [{ histogramPosConst: { spacingBeforeHistogramOr2DPlot: _ } }, [globalDefaults]]
                }
            }
        },
        {
            qualifier: { overlayXWidgetsExist: false },
            position: {
                labelAnchorForHistogramOr2DPlot: {
                    point1: {
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    point2: {
                        label: "horizontalAnchorForHistogramOr2DPlot"
                    },
                    equals: [{ histogramPosConst: { spacingBeforeHistogramOr2DPlot: _ } }, [globalDefaults]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a widget on the secondary axis (x-axis, currently) of an amoeba. Such a widget is defined if the embedding facet is in its 2DPlot state, and the user 
    // specified the facet that's to be displayed on the secondary axis.
    // This class is inherited by the SliderSecondaryWidget/DiscreteSecondaryWidget.
    // 
    // Positioning: This class positions the secondary axis widget relative to the 2DPlot
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SecondaryWidget: o(
        { // default
            "class": o("Widget", "Horizontal"),
            context: {
                // TrackMyFacet param (inherited via the Widget inheritance): write over the default definition of myFacet 
                // (which is the embeddingStar facet; the other context labels from TrackMyFacet are based on the value of myFacet).
                myFacet: [{ myEmbeddingFacet: { secondaryAxisFacet: _ } }, [me]]
            },
            position: {
                attachTopToPlotTop: {
                    point1: {
                        element: [{ children: { twoDPlot: _ } }, [embedding]],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                attachToPlotLeft: {
                    point1: {
                        element: [{ children: { twoDPlot: _ } }, [embedding]],
                        type: "left"
                    },
                    point2: {
                        label: "twoDPlotLeftAnchor"
                    },
                    equals: 0
                },
                attachToPlotRight: {
                    point1: {
                        element: [{ children: { twoDPlot: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        label: "twoDPlotRightAnchor"
                    },
                    equals: 0
                },
                attachVerticalAnchorFor2DPlotToItsBottom: {
                    point1: {
                        element: [{ children: { twoDPlot: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        label: "verticalAnchorFor2DPlot"
                    },
                    equals: 0
                }
            }
        },
        // if this widget has overlayXWidgets defined in it, then the top of the last one in the areaSet (the topmost one) should be attached to the Widget's "verticalAnchorFor2DPlot"
        // posPoint label. Otherwise, it should connect directly to the "beginningOfFirstOverlayXWidget" posPoint label (defined separately for Slider/Discrete).
        {
            qualifier: { overlayXWidgetsExist: true },
            position: {
                labelVerticaAnchorFor2DPlot: {
                    point1: {
                        label: "verticalAnchorFor2DPlot"
                    },
                    point2: {
                        element: [last, [{ children: { permOverlayXWidgets: _ } }, [me]]],
                        type: "top"
                    },
                    equals: [{ histogramPosConst: { spacingBeforeHistogramOr2DPlot: _ } }, [globalDefaults]]
                }
            }
        },
        {
            qualifier: { overlayXWidgetsExist: false },
            position: {
                labelVerticaAnchorFor2DPlot: {
                    point1: {
                        label: "verticalAnchorFor2DPlot"
                    },
                    point2: {
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: [{ histogramPosConst: { spacingBeforeHistogramOr2DPlot: _ } }, [globalDefaults]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by PrimaryWidget and SecondaryWidget.
    // It defines an areaSet of permOverlayXWidgets (each represents a PermOverlay that's in Show state), and specifies its data.
    // The class description is provided by MSWidget/RatingWidget/SliderWidget, the siblings classes of PrimaryWidget/SecondaryWidget.
    // 
    // API:
    // 1. the "contentBeginning" pos label is given a default position (to match the widget's lowHTMLLength posPoint). Inheriting classes can add constraints of their own 
    //    to the widget's contentBeginning orGroup in order to position this posPoint label elsewhere.
    // 2. widgetContentBeginningOffset: Specifically, its default offset from the lowHTMLLength of the widget can be overridden
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Widget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                overlayXWidgetsExist: [{ children: { permOverlayXWidgets: _ } }, [me]],
                verticalWidget: [
                    "Vertical",
                    [classOfArea, [me]]
                ],
                nonTrashedOverlaysHiddenInFacet: [
                    [{ overlaysHiddenInFacet: _ }, [me]],
                    [{ myApp: { nonTrashedOverlayData: { uniqueID: _ } } }, [me]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "TrackMyFacet"),
            context: {
                uniqueID: [{ myFacet: { uniqueID: _ } }, [me]], // Primary/SecondaryWidget, each provides its own myFacet

                minWrapAround: 0,

                offsetToLowHTMLSideOfOverlayXWidgetLegends: 0,
                overlayXWidgetLegendDimension: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                overlayXWidgetLegendMarginFromMoreControls: [densityChoice, [{ fsPosConst: { overlayXWidgetLegendMarginFromMoreControls: _ } }, [globalDefaults]]],

                // this is the dimension (including height!) of the OverlayXWidgetLegend.
                // the contentBeginning posPoint label should be at that offset from the Widget's beginning.
                widgetContentBeginningOffset: [sum,
                    o(
                        [{ offsetToLowHTMLSideOfOverlayXWidgetLegends: _ }, [me]],
                        [{ overlayXWidgetLegendDimension: _ }, [me]],
                        [{ overlayXWidgetLegendMarginFromMoreControls: _ }, [me]],
                        [densityChoice, [{ fsPosConst: { overlayXWidgetMoreControlsHeight: _ } }, [globalDefaults]]],
                        [densityChoice, [{ fsAppPosConst: { marginBelowOverlayXWidgetMoreControls: _ } }, [globalDefaults]]]
                    )
                ],

                // for mergeWrite of Widget-specific appData (see SliderWidget, for example)
                currentViewWidgetDataObj: [
                    { hostingFacetUniqueID: [{ uniqueID: _ }, [me]] },
                    // in the facet data obj we have an attribute called widgets. 
                    // it stores an os of objects, each describing an instance of the SliderWidget, with the host facet's uniqueID
                    // e.g. we may have multiple instances of a "Price" widget: a vertical one in the Price facet, but a few
                    // horizontal ones participating in 2D plots in other facets (e.g. Weight, Color, etc.)
                    [{ currentViewFacetDataObj: { widgets: _ } }, [me]]
                ]
            },
            position: {
                widgetContentBeginningRelativeToWidget: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { label: "contentBeginning" },
                    equals: [{ widgetContentBeginningOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: { showSelectors: true },
            children: {
                permOverlayXWidgets: {
                    data: [identify,
                        { uniqueID: _ },
                        [{ myFacet: { overlaysInAmoeba: _ } }, [me]]
                    ]
                    // description: class inheritance provided by MSWidget/RatingWidget/SliderWidget
                }
            }
        },
        {
            qualifier: {
                showSelectors: true,
                nonTrashedOverlaysHiddenInFacet: true
            },
            children: {
                showOverlaysInFacetControl: {
                    description: {
                        "class": "ShowOverlaysInFacetControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by areas embedded in a widget. It allows them access to the widget and the associated facet (not necessarily the embeddingStar facet, as this could all take
    // place in the SecondaryWidget, which is associated with another facet).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofPrimaryWidget: [
                    [{ myWidget: _ }, [me]],
                    [areaOfClass, "PrimaryWidget"]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "OrientedElement", "TrackMyFacet"),
            context: {
                myWidget: [
                    [embeddingStar, [me]],
                    [areaOfClass, "Widget"]
                ],
                myFacet: [{ myWidget: { myFacet: _ } }, [me]], // this is to ensure that when we're in a secondaryWidget, the facet pointed to is the correct one!
                myPermOverlayXWidgets: [{ myWidget: { children: { permOverlayXWidgets: _ } } }, [me]],
                refOrientedElement: [{ myWidget: _ }, [me]], // override default value provided by OrientedElement

                currentViewWidgetDataObj: [{ myWidget: { currentViewWidgetDataObj: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AttachBelowAmoebaControlPanel: {
        "class": o("GeneralArea", "TrackMyFacet"),
        position: {
            attachToAmoebaControlPanel: {
                point1: {
                    element: [{ myAmoebaControlPanel: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: bFSPosConst.amoebaControlPanelMarginBelow
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the visual representation of an overlay inside of a widget (a column in a vertical widget, a row in a horizontal widget).
    // It is inherited by PermOverlayXWidget.
    // 
    // If it represents an intensional overlay, it also inherits the tracking class for the associated SelectableFacetXIntOverlay. In that case, it also keeps a context label as a 
    // reference to the transientSelectionsObj from that associated SelectableFacetXIntOverlay.
    //
    // This class stores in its selectionsObj context label the transientSelectionsObj
    // API: 
    // 1. myOverlay: an areaRef.
    // 2. lowHTMLAnchorOffset: default values provided (differ by Vertical/Horizontal)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // note the use of intOverlay, and not merely PermIntOverlay, so as to include the EphIntOverlay too! We thus override the definition provided by TrackMyOverlay below.
                ofIntOverlay: [
                    [{ myOverlay: _ }, [me]],
                    [areaOfClass, "IntOverlay"]
                ]
            }
        },
        { // default
            "class": o("GeneralArea",
                "OverlayDelayedInArea",
                "TrackMyWidget", // should be inherited before TrackMyFacet, to ensure that its definition of myFacet overrides the one in TrackMyFacet 
                "TrackMyFacet",
                "TrackMyOverlay"),
            context: {
                color: [{ myOverlay: { color: _ } }, [me]],
                lowHTMLAnchorOffset: [cond,
                    [{ ofVerticalElement: _ }, [me]],
                    o({ on: true, use: bFSPosConst.overlayXWidgetFromVerticalWidgetTop },
                        { on: false, use: bFSPosConst.overlayXWidgetFromHorizontalWidgetLeft }
                    )
                ],
                myInclusionExclusionModeControl: [{ myOverlayXWidget: [me] }, [areaOfClass, "InclusionExclusionModeControl"]],
                tmpDiscreteValueInclusion: [{ myInclusionExclusionModeControl: { tmpDiscreteValueInclusion: _ } }, [me]],
                tmpDiscreteValueExclusion: [{ myInclusionExclusionModeControl: { tmpDiscreteValueExclusion: _ } }, [me]]
            },
            position: {
                lowHTMLAnchor: {
                    point1: {
                        element: [embedding],
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [{ lowHTMLAnchorOffset: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntOverlayXWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createMoreControls: o(
                    [{ stableSelectionsMade: _ }, [me]], // stable, not transient, so that we don't create a moreControls in a slider when we are in the 
                    // midst of a dragging of its selector
                    [{ createInclusionExclusionControl: _ }, [me]]
                ),

                inclusionMode: [mergeWrite,
                    [{ stableSelectionsObj: { inclusionMode: _ } }, [me]],
                    true
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMySelectableFacetXIntOverlay"),
            context: {
                createInclusionExclusionControl: o(
                    [{ ofMSFacet: _ }, [me]], // RatingFacet doesn't get exclusion mode for now!
                    [and,
                        [{ ofSliderFacet: _ }, [me]],
                        [{ myFacet: { allDiscreteValues: _ } }, [me]]
                    ]
                ),

                stableSelectionsObj: [
                    { uniqueID: [{ myFacet: { uniqueID: _ } }, [me]] },
                    [{ myOverlay: { selectionsData: _ } }, [me]]
                ],

                overlayImplicit1DSet: [cond,
                    [{ ofZoomBoxingOverlay: _ }, [me]],
                    o(
                        {
                            on: false, // i.e. a zoomboxed overlay 
                            use: [{ implicit1DSetItems: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [
                                [{ implicit1DSetItems: _ }, [me]],
                                [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                            ]
                        }
                    )
                ],
                // see explanation for overlaySolutionSetExplicitProjection above. same logic applies here.
                overlayImplicit1DSetExplicitProjection: [
                    [{ myFacet: { facetProjectionQuery: _ } }, [me]],
                    [{ overlayImplicit1DSet: _ }, [me]]
                ],
                overlayImplicit1DSetProjection: [{ overlayImplicit1DSetExplicitProjection: _ }, [me]]
            },
            content: [{ mySelectableFacetXIntOverlay: { transientSelectionsObj: _ } }, [me]]
        },
        {
            qualifier: { createMoreControls: true },
            children: {
                overlayXWidgetMoreControls: {
                    description: {
                        "class": "OverlayXWidgetMoreControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermExtOverlayXWidget: {
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the SliderPermOverlayXWidget/DiscretePermOverlayXWidget. It represents a permanent (i.e. not ephemeral) overlay in a sliderFacet/discreteFacet
    // It inherits OverlayXWidget.
    //
    // This class defines the beginningSideAnchor/endSideAnchor posPoint labels, which are used to position the PermOverlayXWidget. 
    // 
    // ItemSet Projections: this class stores a projection (per its associated facet) of its overlay's itemSets *over the effective base*.
    // It stores the solutionSet, and for an intensional overlay, it also stores a projection of its implicit1DSets.
    // Note: the selection of itemSets over the effectiveBase is redundant for zoomboxed overlays, but not for zoomboxing overlays:
    // In Mon1 (Feb 2015), the zoomboxing overlay's base is the globalBaseOverlay; but when we represent them as PermOverlayXWidget, their itemSets are trimmed down to the 
    // effectiveBaseOverlay.
    //
    // API:
    // 1. overlayXWidgetGirth: default provided
    // 2. spacingFromPrev: default provided
    // 3. setGirthConstraint: true, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayXWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstOverlayXWidget: [{ firstInAreaOS: _ }, [me]],
                setGirthConstraint: true // default
            }
        },
        { // default
            "class": o(
                "MemberOfPositionedAreaOS",
                "OverlayXWidget"),
            context: {
                myOverlay: [{ param: { areaSetContent: _ } }, [me]],

                // generally speaking, the overlaySolutionSetProjection is the overlaySolutionSetExplicitProjection
                // there is one current case where we override that definition: in RatingPermOverlayXWidget, in case the solutionSet may include
                // some unrated values, in which case we add the unrated value (i.e. 0) to the overlaySolutionSetExplicitProjection (we need to add
                // it as it is not represented in effectiveBaseOverlay's solutionSetItems, yet it is in the intensional overlay's solutionSet!)

                overlaySolutionSet: [cond, // note: it differs from myOverlya's solutionSetItems for zoomboxing overlays!
                    [{ ofZoomBoxingOverlay: _ }, [me]],
                    o(
                        {
                            on: false, // i.e. a zoomboxed overlay 
                            // the solutionSetItems of a zoomBoxed overlay are already limited to the effectiveBaseOverlay
                            // so there is no need to select out of it again - thus avoiding a big query.
                            use: [{ myOverlay: { solutionSetItems: _ } }, [me]]
                        },
                        {
                            on: true,
                            // the solutionSetItems of a zoomBoxing overlay are *NOT* limited to the effectiveBaseOverlay
                            // so we do need to select out of it.
                            // this may be of use when, for example, displaying the value markers of a zoomboxing overlay,
                            // and those would be limited to the effective base.
                            use: [
                                [{ myOverlay: { solutionSetItems: _ } }, [me]],
                                [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                            ]
                        }
                    )
                ],
                overlaySolutionSetExplicitProjection: [
                    [{ myFacet: { facetProjectionQuery: _ } }, [me]],
                    [{ overlaySolutionSet: _ }, [me]]
                ],
                overlaySolutionSetProjection: [{ overlaySolutionSetExplicitProjection: _ }, [me]],

                overlayXWidgetGirth: bFSPosConst.overlayXWidgetGirth,
                // MemberOfPositionedAreaSet params:
                spacingFromPrev: bFSPosConst.overlayXWidgetsSpacing,
                areaOSPositionedFromLowToHighHTML: [{ ofVerticalElement: _ }, [me]],
                myAreaOSPosPoint: { label: "beginningSideAnchor" },
                myPrevInAreaOSPosPoint: {
                    element: [prev, [me]],
                    label: "endSideAnchor"
                }
            }
        },
        {
            qualifier: { ofIntOverlay: true },
            "class": "PermIntOverlayXWidget"
        },
        {
            qualifier: { ofExtOverlay: true },
            "class": "PermExtOverlayXWidget",
        },
        {
            qualifier: { firstOverlayXWidget: true },
            position: {
                attachBeginningSideAnchor: {
                    point1: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    point2: {
                        label: "beginningSideAnchor"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                setGirthConstraint: true,
                ofVerticalElement: true
            }, // i wrongly equate vertical widget with left-sided widget. a shortcut, for now.
            position: {
                minEffectiveGirth: {
                    point1: { label: "beginningSideAnchor" },
                    point2: { label: "endSideAnchor" },
                    min: [{ overlayXWidgetGirth: _ }, [me]]
                },
                minimizeBeginningToEndSideAnchorOffset: {
                    point1: { label: "beginningSideAnchor" },
                    point2: { label: "endSideAnchor" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.defaultPressure
                }
            }
        },
        {
            qualifier: {
                setGirthConstraint: true,
                ofVerticalElement: false
            }, // i wrongly equate horizontal widget with bottom-sided widget. a shortcut, for now.
            position: {
                minEffectiveGirth: {
                    point1: { label: "endSideAnchor" },
                    point2: { label: "beginningSideAnchor" },
                    min: [{ overlayXWidgetGirth: _ }, [me]]
                },
                minimizeEndToBeginningSideAnchorOffset: {
                    point1: { label: "endSideAnchor" },
                    point2: { label: "beginningSideAnchor" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.defaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BaseOverlayXWidget: {
        "class": "OverlayXWidget",
        context: {
            // help the compiler along
            ofIntOverlay: false,
            ofExtOverlay: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by classes embedded in the OverlayXWidget. 
    // Among other things, it allows them to make use of its selectionsMade and disabled context labels, as their own qualifiers 
    // (as OverlayXWidget inherits TrackMySelectableFacetXIntOverlay)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyOverlayXWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofPermIntOverlayXWidget: [
                    [{ myOverlayXWidget: _ }, [me]],
                    [areaOfClass, "PermIntOverlayXWidget"]
                ],
                ofPermExtOverlayXWidget: [
                    [{ myOverlayXWidget: _ }, [me]],
                    [areaOfClass, "PermExtOverlayXWidget"]
                ],
                ofBaseOverlayXWidget: [
                    [{ myOverlayXWidget: _ }, [me]],
                    [areaOfClass, "BaseOverlayXWidget"]
                ],
                selectionsMade: [{ myOverlayXWidget: { selectionsMade: _ } }, [me]],
                disabled: [{ myOverlayXWidget: { disabled: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyWidget"),
            context: {
                myOverlayXWidget: [
                    { myClasses: "OverlayXWidget" },
                    [embeddingStar, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsContainer: o(
        { //default
            "class": o(
                "GeneralArea", "MinWrapVertical", "TrackMyFacet",
                "MoreControlsController", "MoreControlsOnClickUXCore"
            ),
            context: {
                numberOfDisplayedOverlays: [densityChoice, { "V1": 1, "V2": 2, "V3": 3 }],
                lastIndexDisplayedOverlays: [minus,
                    [{ numberOfDisplayedOverlays: _ }, [me]], 1
                ],
                displayedOverlays: [
                    pos,
                    r(0, [{ lastIndexDisplayedOverlays: _ }, [me]]),
                    [
                        { show: true },
                        [{ selectionsMadeOverlays: _ }, [me]]
                    ]
                ],
                hasMoreOverlays: [greaterThan,
                    [size, [{ show: true }, [{ selectionsMadeOverlays: _ }, [me]]]],
                    [{ numberOfDisplayedOverlays: _ }, [me]]
                ],
                myMoreControlsController: [me],
                immunityFromClosingMoreControlsAreaRefs: o(
                    [me], [areaOfClass, "MinimizedFacetOverlayLegendsMenu"]
                ),
                tooltipText: "More Information"
            },
            display: {
                pointerOpaque: true
            },
            position: {
                right: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
                width: bFSAppPosConst.minimizedFacetOverlayLegendsContainerWidth,
                top: bFSAppPosConst.minimizedFacetOverlayLegendsContainerTopBottomMargin,
                minBottom: {
                    point1: { type: "bottom" },
                    point2: { element: [embedding], type: "bottom" },
                    min: bFSAppPosConst.minimizedFacetOverlayLegendsContainerTopBottomMargin
                }
            },
            children: {
                overlayLegends: {
                    data: [{ displayedOverlays: _ }, [me]],
                    description: {
                        "class": "MinimizedFacetOverlayLegendsItem"
                    }
                }
            }
        },
        {
            qualifier: { hasMoreOverlays: true },
            children: {
                threedots: {
                    description: {
                        "class": "MinimizedFacetOverlayLegendsDots",
                    }
                }
            }
        },
        {
            qualifier: { moreControlsOpen: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "MinimizedFacetOverlayLegendsMenu",
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsItem: {
        "class": o(
            "MinimizedFacetOverlayLegendsItemDesign",
            "GeneralArea",
            "MemberOfTopToBottomAreaOS"
        ),
        context: {
            selectionsMadeOverlays: [{ selectionsMadeOverlays: _ }, [embedding]],
            myOverlay: [{ param: { areaSetContent: _ } }, [me]],
            spacingFromPrev: bFSAppPosConst.MinimizedFacetOverlayLegendsItemSpacingFromPrev,
            color: [{ myOverlay: { color: _ } }, [me]],
        },
        position: {
            height: bFSAppPosConst.minimizedFacetOverlayLegendsItemHeight,
            left: 0,
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    MinimizedFacetOverlayLegendsDots: {
        "class": o("DefaultDisplayText", "MinWrap"),
        context: {
            minWrapAround: 0,
        },
        position: {
            "horizontal-center": 0,
            bottomOfOverlayLegends: {
                point1: {
                    element: [
                        last,
                        [
                            { children: { overlayLegends: _ } },
                            [embedding]
                        ]
                    ],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: 2
            }
        },
        children: {
            dotElements: {
                data: [sequence, r(1, 3)],
                description: {
                    "class": "MinimizedFacetOverlayLegendsDotElement"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsDotElement: {
        "class": o("MinimizedFacetOverlayLegendsDotElementDesign", "GeneralArea", "MemberOfLeftToRightAreaOS"),
        context: {
            elementMargin: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
            elementSize: 3,
            spacingFromPrev: [{ elementMargin: _ }, [me]]
        },
        position: {
            width: [{ elementSize: _ }, [me]],
            height: [{ elementSize: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsMenu: {
        "class": "Menu",
        context: {
            selectionsMadeOverlays: [
                { myMenuAnchor: { selectionsMadeOverlays: _ } }, [me]
            ],
            menuData: [
                { show: true },
                [{ selectionsMadeOverlays: _ }, [me]]
            ],
            possibleAnchorPointsToMyMoreControls: {
                element: [first, [{ children: { menuItems: _ } }, [me]]],
                label: "anchorToMyMoreControls"
            }
        },
        children: {
            menuItems: {
                data: [{ menuData: _ }, [me]],
                description: {
                    "class": "MinimizedFacetOverlayLegendsMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsMenuItem: {
        "class": o("MinimizedFacetOverlayLegendsMenuItemDesign", "GeneralArea", "MenuItem", "MinWrap",
            "Tooltipable", "TrackMyFacet", "TrackMySelectableFacetXIntOverlay"),
        context: {
            myOverlay: [{ param: { areaSetContent: _ } }, [me]],
            color: [{ myOverlay: { color: _ } }, [me]],
            name: [{ myOverlay: { name: _ } }, [me]],
            tooltipText: [{ mySelectableFacetXIntOverlay: { selectionsStr: _ } }, [me]]
        },
        position: {
            height: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
            labelRightToLine: {
                point1: { element: [{ children: { line: _ } }, [me]], type: "right" },
                point2: { element: [{ children: { label: _ } }, [me]], type: "left" },
                equals: 5
            }
        },
        children: {
            line: {
                description: {
                    "class": "BackgroundColor",
                    context: {
                        backgroundColor: [{ color: _ }, [embedding]],
                    },
                    position: {
                        left: bFSAppPosConst.minimizedFacetOverlayLegendsMenuItemLineHorizontalMargin,
                        width: bFSAppPosConst.minimizedFacetOverlayLegendsMenuItemLineWidth,
                        height: bFSAppPosConst.minimizedFacetOverlayLegendsMenuItemLineHeight,
                        "vertical-center": 0
                    }
                }
            },
            label: {
                description: {
                    "class": o("MenuItemText", "DisplayDimension"),
                    context: {
                        displayText: [{ name: _ }, [embedding]],
                        defaultVerticalPositioning: false,
                        defaultHorizontalPositioning: false
                    },
                    position: {
                        "vertical-center": 0,
                        right: bFSAppPosConst.minimizedFacetOverlayLegendsMenuItemLineHorizontalMargin
                    }
                }
            }
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Amoeba, and Amoeba-embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of FacetXOSR classes and their embeddedStar classes
    // The FacetXIntOSR is the intersection between a facet and the Overlay Summary Row (OSR) of an intensional overlay. 
    // This is where selections for that facet and overlay are displayed, and to some extent can also be modified (deleted and disabled, for now): in this sense, it can be thought of 
    // as a summary of some information which is displayed/modified in the amoeba. Unlike the amoeba, the FacetXIntOSR is on display even when the facet is in its summary state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class keeps areaRefs to its facet/OSR/Overlay.
    // Positioning: this class handles the positioning of this intersection area.
    //
    // API:
    // 1. defaultAttachmentOfBottomFrame: default provided (true)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetXOSR: o(
        { // default
            "class": o("GeneralArea", "TrackMyFacet"),
            context: {
                myFacet: [expressionOf],
                myOSR: [referredOf],
                myOverlay: [{ myOSR: { myOverlay: _ } }, [me]],
                myVisibleOverlay: [{ myOverlay: { children: { visibleOverlay: _ } } }, [me]],
                color: [{ myOverlay: { color: _ } }, [me]],

                defaultAttachmentOfBottomFrame: true
            },
            // implicitly, embedding is the expressionOf, i.e. the facet
            independentContentPosition: false, // see inheriting classes for definitions of the content borders.
            stacking: {
                aboveMyOSR: {
                    higher: [me],
                    lower: [{ myOSR: _ }, [me]]
                }
            },
            position: {
                leftConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: 0
                },
                // right constraints - see inheriting classes
                topConstraint: {
                    point1: { type: "top" },
                    point2: {
                        element: [{ myOSR: _ }, [me]],
                        type: "top"
                    },
                    equals: 0
                },
                // bottomConstraint - see defaultAttachmentOfBottomFrame variant below

                leftContentConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        content: true,
                        type: "left"
                    },
                    point2: {
                        content: true,
                        type: "left"
                    },
                    equals: 0
                },
                topContentConstraint: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        type: "top",
                        content: true
                    },
                    equals: 0
                },
                bottomContentConstraint: {
                    point1: {
                        type: "bottom",
                        content: true
                    },
                    point2: {
                        type: "bottom"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { defaultAttachmentOfBottomFrame: true },
            // there are cases where we may wish to turn off this default constraint. for example, when we display the entire list of ms selections
            position: {
                bottomConstraint: {
                    point1: {
                        element: [{ myOSR: _ }, [me]],
                        type: "bottom"
                    },
                    point2: { type: "bottom" },
                    equals: [cond,
                        [{ showSolutionSet: _ }, [me]],
                        // these two variants ensure that the FacetXIntOSR covers the border of the VisibleOverlay (by extending visibleOverlayFrameWidth 
                        // beyond the bottom of its referredOf, OSR. 
                        // this is needed to ensure that when we drag this overlay, the FacetXIntOSR matches the overlay's VisibleOverlay on the 
                        // vertical axis. 
                        o(
                            { on: true, use: 0 },
                            { on: false, use: bFSAppPosConst.visibleOverlayFrameWidth }
                        )
                    ]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // positioning: if this class is in a facet showing an amoeba, it should extend wrt the amoeba's left side. otherwise, extend to its expressionOf's right.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetXOSR: o(
        /*{ // variant-controller
            qualifier: "!", // as we're going with a show-hidden-overlay-control *inside* the amoeba.
            context: {
                myOverlayHiddenInFacet: [
                                         [{ myOverlay: { uniqueID:_ } }, [me]],
                                         [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet:_ } }, [me]]
                                        ]               
            }
        },*/
        { // default
            "class": o("GeneralArea", "FacetXOSR")
        },
        // right side of this class defined depending on whether the embedding facet is in an amoeba-showing state (i.e. facet state <> Summary state)
        {
            qualifier: { ofFacetShowingAmoeba: true },
            position: {
                /*minWidth: { 
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [densityChoice, bFSPosConst.minWidthOfNonOMFacetXIntOSR]
                },*/
                rightConstraint: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                rightContentConstraint: {
                    point1: {
                        content: true,
                        type: "right"
                    },
                    point2: {
                        element: [{ myAmoeba: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofFacetShowingAmoeba: false },
            position: {
                rightConstraint: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        type: "right"
                    },
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
        }/*, // as we're going with a show-hidden-overlay-control *inside* the amoeba.
        {
            qualifier: { myOverlayHiddenInFacet: true },
            children: {
                showOverlayInFacetControl: {
                    description: {
                        "class": "ShowOverlayInFacetControl"
                    }
                }
            }
        }*/
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetXExtOSR: {
        "class": "NonOMFacetXOSR"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The FacetXIntOSR is the intersection between a facet (its expressionOf) and the Overlay Summary Row (OSR) of an intensional overlay (its referredOf).
    // It is inherited by SelectableFacetXIntOSR.
    // It is also inherited by the AutoOMFacetXIntOSR - a class inherited by the intersection of an OMF with its own overlays OSR.
    // 
    // Note the handling for anotherIsDraggedToReorder: 
    // if this area pertains to an overlay being reordered (its overlay's VisibleOverlay's iAmDraggedToReorder indicates that), 
    // then it is placed at a higher altitude than the zAboveFacetXIntOSRsNotDragged (a label stored by myApp, so that we ensure its singularity)
    // 
    // API:
    // 1. selectionsOverflow: a boolean indicating whether the selections overflow from the FacetXIntOSR
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionsFitInOSR: o(
                    [not, [{ selectionsOverflow: _ }, [me]]],
                    [not, [{ displayAllSelections: _ }, [me]]]
                ),
                "*displayAllSelections": false,

                // if false, that means it is this area's overlay that is being dragged to reorder.
                anotherIsDraggedToReorder: [{ myOverlay: { children: { visibleOverlay: { anotherIsDraggedToReorder: _ } } } }, [me]]
            }
        },
        { // default
            "class": "FacetXOSR",
            context: {
                allDiscreteSelections: [
                    o(
                        [{ mySelectableFacetXIntOverlay: { includedForDisplay: _ } }, [me]],
                        [{ mySelectableFacetXIntOverlay: { excludedForDisplay: _ } }, [me]]
                    ),
                    [{ myFacet: { values: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { selectionsMade: true },
            context: {
                defaultAttachmentOfBottomFrame: [{ selectionsFitInOSR: _ }, [me]] // don't attach bottom when selections don't all fit in the OSR
            }
        },
        {
            qualifier: {
                displayAllSelections: false,
                selectionsOverflow: true
            },
            children: {
                overflowIndicator: {
                    description: {
                        "class": "FacetSelectionsOverflowIndicator"
                    }
                }
            }
        },
        {
            qualifier: {
                selectionsMade: true,
                selectionsFitInOSR: false
            },
            position: {
                attachToLastSelection: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [
                            {
                                lastInAreaOS: true,
                                myFacetXIntOSR: [me]
                            },
                            [areaOfClass, "FacetSelection"]
                        ],
                        type: "bottom"
                    },
                    equals: 0
                }
            },
            children: {
                overflowExtension: {
                    partner: [{ myOverlay: _ }, [me]],
                    description: {
                        "class": "FacetXIntOSRExtension"
                    }
                }
            }
        },
        {
            qualifier: {
                selectionsMade: true,
                displayAllSelections: true
            },
            write: {
                onMouseDownOutsideFacetXIntOSR: {
                    upon: [mouseDownNotHandledBy,
                        // the areas who will receive mouseDown and yet NOT reset displayAllSelections to false:
                        o(
                            [me],
                            [embeddedStar, [me]],
                            [ // the SelectionDeleteControl is currently not embedded in MSFacetXIntOSR, but is rather an icon, embedded in FSApp.
                                { myFacetXIntOSR: [me] },
                                [areaOfClass, "SelectionDeleteControl"]
                            ],
                            [
                                { myExpandable: [{ myFacet: _ }, [me]] },
                                [areaOfClass, "ExpansionHandle"]
                            ]
                        )
                    ],
                    true: {
                        resetDisplayAllSelections: {
                            to: [{ displayAllSelections: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetXIntOSRExtension: {
        "class": o("FacetXIntOSRExtensionDesign", "GeneralArea", "MatchArea", "OverlayDelayedInArea", "TrackMyOverlay"),
        context: {
            match: [expressionOf]
        },
        embedding: "referred",
        independentContentPosition: false,
        stacking: {
            aboveVisibleOverlay: {
                higher: [me],
                lower: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [areaOfClass, "VisibleOverlay"]
                ]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by NonOMFacetXIntOSR and OMFacetXIntOSR. It inherits FacetXIntOSR, and keeps track of its associated SelectableFacetXIntOverlay.
    // myFacet is provided by the inherited FacetXIntOSR
    //
    // Content: stores the selectionsObj (transient values) obtained from the corresponding selectableFacetXIntOverlay.
    // 
    // Upon Handlers: this class implements a handler for the "Reset" msg, sent by the embeddedStar DeleteSelectionsControl. The inheriting class, NonOMFacetXIntOSR, adds additional
    // actions to this msg (which is why it is implemented as a msg handler, and not as a direct write to the appData, by the DeleteSelectionsControl).
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableFacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showSolutionSet: [{ myOverlay: { showSolutionSet: _ } }, [me]],

                selectionsMade: [{ mySelectableFacetXIntOverlay: { selectionsMade: _ } }, [me]],
                noValueSelectionMade: [{ mySelectableFacetXIntOverlay: { noValueSelectionMade: _ } }, [me]],
                valuableSelections: [{ mySelectableFacetXIntOverlay: { valuableSelections: _ } }, [me]]
            }
        },
        { // default
            "class": o("FacetXIntOSR", "TrackMySelectableFacetXIntOverlay"),
            context: {
                myFacetUniqueID: [{ myFacet: { uniqueID: _ } }, [me]],
                stableSelectionsObj: [
                    { uniqueID: [{ myFacet: { uniqueID: _ } }, [me]] },
                    [{ myOverlay: { selectionsData: _ } }, [me]]
                ]
            },
            //embedding: "referred", uncomment once #1104 is solved, but then verify that i pass sanity!
            content: [{ mySelectableFacetXIntOverlay: { transientSelectionsObj: _ } }, [me]],
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the FacetXIntOSR of the NonOMF classes: it is inherited by SliderFacetXIntOSR/MSFacetXIntOSR and MSFacetXIntOSR.
    // It inherits SelectableFacetXIntOSR, as well as two tracking classes, to track its facet, and the overlay maximization state.
    // 
    // copy-paste intensional overlay selections (Fat)
    // the user can coselect multiple FacetSelectionsHandles of a given intensional OSR, and drag&drop them onto another intensional OSR, thereby copying the selections of the source
    // overlay to the target overlay. This class handles this operation. It provides a CopySelections msg handler called by its OSR, when facet selections are drag&dropped on it.
    // The msg handler copies the selections from the source selectionsObj to this class' selectionsObj.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                myOSRMoreControlsOpen: [{ myOSR: { myOverlay: { moreControlsOpen: _ } } }, [me]],
                //myOverlayOnShow: [{ myOverlay: { show:_ } }, [me]]
            }
        },
        { // default 
            "class": o(
                "GeneralArea",
                "MoreControlsController",
                "SelectableFacetXIntOSR", // inherits FacetXIntOSR, which provides the definition of myFacet that overrides the one provided in TrackMyFacet 
                "NonOMFacetXOSR"
            ),
            context: {
                // adding to the default set of areas which provide immunity from closing the more controls here, the areas that inherit NonOMFacetXIntOverlayMoreControl
                // (DeleteSelectionsControl and DisableSelectionsControl), so that their mouseClick would do its intended action (otherwise they'd already be removed on mouseDown!)
                immunityFromClosingMoreControlsAreaRefs: o(
                    [{ defaultImmunityFromClosingMoreControlsAreaRefs: _ }, [me]],
                    [{ myAmoeba: _ }, [me]],
                    [embeddedStar, [{ myAmoeba: _ }, [me]]]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanNonOMFacetXIntOSR: {
        "class": "NonOMFacetXIntOSR"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatNonOMFacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // this area is the destination of a dragged facetSelections operation if one of the singleFacetSelections dragged matches
                // this area's myFacetUniqueID (e.g. if we're dragging only the price facet's selections, then the quality facet can't be its destination).
                destinationOfDraggedFacetSelections: [
                    [{ myFacetUniqueID: _ }, [me]],
                    [{ coselectedFacetXIntOSRs: { myFacetUniqueID: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o(
                "NonOMFacetXIntOSR",
                "TrackOverlayMaximization"
            ),
            context: {
                // supporting copy-paste of NonOMFacetXIntOSR selections from one intensional overlay's OSR to another's.
                coselectedFacetXIntOSRs: [
                    { coselected: true },
                    [areaOfClass, "SelectableFacetXIntOSR"]
                ]
            }
        },
        {
            qualifier: { destinationOfDraggedFacetSelections: true },
            context: {
                mySourceFacetXIntOSR: [ // pick out of all coselected facetXIntOSRs the one that matches my myFacetUniqueID - that's the one I should copy onto myself.
                    { myFacetUniqueID: [{ myFacetUniqueID: _ }, [me]] },
                    [{ coselectedFacetXIntOSRs: _ }, [me]]
                ]
            },
            write: {
                onNonOMFacetXIntOSRMouseUp: {
                    "class": "OnMouseUp",
                    true: {
                        copyContent: {
                            to: [{ stableSelectionsObj: _ }, [me]],
                            merge: [{ mySourceFacetXIntOSR: { stableSelectionsObj: _ } }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyFacetXIntOSR: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayAllSelections: [{ myFacetXIntOSR: { displayAllSelections: _ } }, [me]],
                selectionsMade: [{ myFacetXIntOSR: { selectionsMade: _ } }, [me]],
                noValueSelectionMade: [{ myFacetXIntOSR: { noValueSelectionMade: _ } }, [me]],
                valuableSelections: [{ myFacetXIntOSR: { valuableSelections: _ } }, [me]],
                allDiscreteSelections: [{ myFacetXIntOSR: { allDiscreteSelections: _ } }, [me]],

                additionalFacetXIntOSRControlsOpen: [{ myFacetXIntOSR: { moreControlsOpen: _ } }, [me]],
                selectionsDisabled: [{ myFacetXIntOSR: { content: { disabled: _ } } }, [me]],

                selectionsFitInOSR: [{ myFacetXIntOSR: { selectionsFitInOSR: _ } }, [me]],
                selectionsOverflow: [{ myFacetXIntOSR: { selectionsOverflow: _ } }, [me]]
            }
        },
        { // default
            context: {
                myFacetXIntOSR: [
                    [embeddingStar, [me]],
                    [areaOfClass, "FacetXIntOSR"]
                ],
                myOSR: [{ myFacetXIntOSR: { myOSR: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the one containing the selections within the NonOMFacetXIntOSR.
    // it is inherited by Slider/MS/Rating classes, and embedded in their corresponding class inheriting NonOMFacetXIntOSR.
    // 
    // API:
    // 2. selections: inheriting classes should provide an os of the selections made
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSelections: o(
        { // variant-controller
            qualifier: "!",
            context: {
                singleSelection: [and,
                    [{ selectionsMade: _ }, [me]],
                    [equal, 1, [size, [{ selections: _ }, [me]]]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrapHorizontal", "TrackMyFacet", "TrackMyFacetXIntOSR"),
            context: {
                myOverlay: [{ myFacetXIntOSR: { myOverlay: _ } }, [me]],

                // override the default provided by OverlayLegend
                verticalMarginFromEdgeFacetSelections: [densityChoice, [{ fsAppPosConst: { facetSelectionVerticalMarginToEmbedding: _ } }, [globalDefaults]]]
            },
            position: {
                top: 0,
                bottom: 0,
                left: bFSPosConst.facetSelectionsHorizontalMargin,
                // right: 0     
                // participate in the definition of borderOfLeftmostFacetSelections / borderOfRightmostFacetSelections
                contentLeftLeftOfborderOfLeftmostFacetSelections: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        label: "borderOfLeftmostFacetSelections"
                    },
                    point2: { type: "left", content: true },
                    min: 0
                },
                oneContentLeftMatchesborderOfLeftmostFacetSelections: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        label: "borderOfLeftmostFacetSelections"
                    },
                    point2: { type: "left", content: true },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: {
                        element: [{ myFacet: _ }, [me]],
                        label: "matchborderOfLeftmostFacetSelections"
                    }
                },
                contentRightLeftOfborderOfRightmostFacetSelections: {
                    point1: { type: "right", content: true },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        label: "borderOfRightmostFacetSelections"
                    },
                    min: 0
                },
                oneContentRightMatchesborderOfRightmostFacetSelections: {
                    point1: { type: "right", content: true },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        label: "borderOfRightmostFacetSelections"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: {
                        element: [{ myFacet: _ }, [me]],
                        label: "matchborderOfRightmostFacetSelections"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single selection displayed in the FacetSelections class. it is inherited by SliderSelection (which could have at most two instances of this class
    // for a given facetXoverlay, as it is defined by a range), and by DiscreteSelection (which could have any number of instances per facetXoverlay).
    //
    // Deleting a facet selection:
    // This class embeds a SelectionDeleteControl icon, which appears when hovering over FacetSelection. Clicking on it removes the selection represented by FacetSelection.
    // The inheriting classes provide the handler for the Delete msg sent by the SelectionDeleteControl, which does the actual deletion of this selection.
    // 
    // API: 
    // 1. deleteable: true, by default. this flag determines whether we create a DeleteControl on inArea: true 
    //    (in RatingFacets, for example, we don't want this to be the case when we have an explicit range of ratings selected.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSelection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                deletable: true,
                singleSelection: [{ singleSelection: _ }, [embedding]]
            }
        },
        {
            "class": o("GeneralArea", "TrackMyFacet", "TrackMyFacetXIntOSR"),
            context: {
                mySelectionDeleteControl: [
                    { mySelection: [me] },
                    [areaOfClass, "SelectionDeleteControl"]
                ],
                selectionsDisabled: [{ myFacetXIntOSR: { content: { disabled: _ } } }, [me]] // for the Design class
            }
            // upon handler for Delete msg from SelectionDeleteControl - see inheriting classes.
        },
        {
            qualifier: { deletable: true },
            "class": "CreateSelectionDeletionControl"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. deleteMessage: the message to be sent to this class by its SelectionDeleteControl. "Delete" by default (RatingSelection overrides it in one of its variants).
    // 2. deleteMessageRecipient: the recipient of the deleteMessage. [me], by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CreateSelectionDeletionControl: {
        context: {
            deleteMessage: "Delete",
            deleteMessageRecipient: [me]
        },
        children: {
            deletionControl: {
                partner: [embedding], // SelectionDeleteControl inherits Icon, and so we need to provide a partner definition here.
                // [embedding] (i.e. FacetSelections) so that we get the desired horizontal clipping.
                description: {
                    "class": "SelectionDeleteControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the deletion control that appears when hovering over a FacetSelection area. 
    // A MouseDown on this control sends the FacetSelection, which is this class' expressionOf parent, a Delete msg.
    // API: 
    // Inheriting class should position this area on the horizontal axis
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectionDeleteControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                emphasizeMe: o( // override definition inherited via SelectionDeleteControlDesign
                    [{ inFocus: _ }, [me]],
                    [{ mySelection: { inFocus: _ } }, [me]]
                )
            }
        },
        { // default
            "class": o("SelectionDeleteControlDesign", "GeneralArea", "Icon", "ModifyPointerClickable"),
            context: {
                mySelection: [expressionOf],
                myFacetXIntOSR: [{ mySelection: { myFacetXIntOSR: _ } }, [me]],
                myFacet: [{ myFacetXIntOSR: { myFacet: _ } }, [me]],
                myOverlay: [{ myFacetXIntOSR: { myOverlay: _ } }, [me]],

                dimension: [densityChoice, bFSPosConst.deleteControlDimension]
            },
            position: {
                width: [{ dimension: _ }, [me]],
                height: [{ dimension: _ }, [me]],
                attachToSelectionVertically: {
                    point1: {
                        type: "vertical-center"
                    },
                    point2: {
                        element: [{ mySelection: _ }, [me]],
                        type: "vertical-center"
                    },
                    equals: 0
                }
            },
            write: {
                onSelectionDeleteControlMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        deleteMsg: {
                            to: [message],
                            merge: {
                                msgType: [{ mySelection: { deleteMessage: _ } }, [me]],
                                recipient: [{ mySelection: { deleteMessageRecipient: _ } }, [me]]
                            }
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSelectionsOverflowIndicator: o(
        { // default
            "class": o("FacetSelectionsOverflowIndicatorDesign",
                "GeneralArea",
                "TooltipableControl",
                "DisplayDimension",
                "AboveSiblings",
                "TrackMyFacetXIntOSR"),
            context: {
                displayText: "...",
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { showStr: _ } }, [me]],
                        [{ myApp: { allStr: _ } }, [me]],
                        [{ myApp: { selectionEntityStrPlural: _ } }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                attachToBottomOSR: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myOSR: _ }, [me]], type: "bottom" },
                    equals: 0
                },
                minLeft: {
                    point1: {
                        element: [embedding],
                        type: "left",
                        content: true
                    },
                    point2: { type: "left" },
                    min: 0
                },
                right: 0
            },
            write: {
                onFacetSelectionsOverflowIndicatorMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setDisplayAllSelections: {
                            to: [{ myFacetXIntOSR: { displayAllSelections: _ } }, [me]],
                            merge: [not, [{ myFacetXIntOSR: { displayAllSelections: _ } }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////ttt
    // This class provides a visual indication to the user that the area it is contained is allows making a selection.
    // The inheriting area should inherit (via its *Design branch) the SelectionControlDesign class, which inherits Circle (and Border)
    //
    // API:
    // 1. inheriting class should provide radius of circle.
    // 2. selected: was this value selected
    // 3. included/excluded
    // 4. disabled
    // 5. indicateSelectability
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectionControl: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                indicateSelectability: [{ inFocus: _ }, [embedding]],
                alignVerticallyWithEmbedding: true,
                alignHorizontallyWithEmbedding: true
            }
        },
        { // default
            "class": "GeneralArea"
        },
        {
            qualifier: { alignVerticallyWithEmbedding: true },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: { alignHorizontallyWithEmbedding: true },
            position: {
                "horizontal-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. hoveringSelectionText
    // 2. myOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HoveringSelectionControl: {
        "class": o("GeneralArea", "MinWrapHorizontal", "Icon", "AboveAppZTop", "TrackMyOverlay"),
        context: {
            minWrapAround: 0
        },
        position: {
            height: [densityChoice, [{ discretePosConst: { defaultHeightOfDiscreteValue: _ } }, [globalDefaults]]]
        },
        children: {
            selector: {
                description: {
                    "class": "HoveringSelectionControlSelector"
                }
            },
            text: {
                description: {
                    "class": "HoveringSelectionControlText"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HoveringSelectionControlSelector: {
        "class": o("HoveringSelectionControlSelectorDesign", "GeneralArea", "SelectionControl"),
        context: {
            radius: [densityChoice, [{ discretePosConst: { selectionControlRadius: _ } }, [globalDefaults]]],
            alignHorizontallyWithEmbedding: false // override default value.            
        },
        position: {
            left: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
            "vertical-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HoveringSelectionControlText: {
        "class": o("HoveringSelectionControlTextDesign", "GeneralArea", "DisplayDimension"),
        context: {
            displayText: [{ hoveringSelectionText: _ }, [embedding]]
        },
        position: {
            "vertical-center": 0,
            attachLeftToSelectorRight: {
                point1: {
                    element: [{ children: { selector: _ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A positioning constraint inherited by NonOMFacetXIntOSRMoreControls & LeanDeleteSelectionsControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinHorizontalOffsetFromFacetSelections: {
        position: {
            minHorizontalOffsetFromFacetSelections: {
                point1: {
                    element: [{ children: { selections: _ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the icon created when copy-pasting the selections associated with all coselected facetSelectionsHandles. It is transparent, and in it is an areaSet of the single visible
    // per-facetSelectionsHandle icon.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggedFacetSelectionsIcon: {
        "class": o("DraggedFacetSelectionsIconDesign", "DraggableIcon"),
        context: {
            myOSR: [{ myOSR: _ }, [embedding, [expressionOf]]],
            myCoselectedFacetXIntOSRs: [{ coselected: true },
            [{ myOSR: { mySelectableFacetXIntOSRs: _ } }, [me]]
            ]
        },
        children: {
            singleFacetIcons: {
                data: [{ myCoselectedFacetXIntOSRs: { stableSelectionsObj: _ } }, [me]],
                description: {
                    "class": "DraggedSingleFacetSelectionsIcon"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the areaSet in DraggedFacetSelectionsIcon - for every coselected FacetSelectionsHandle in the copy-paste operation, we create an instance of this class.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggedSingleFacetSelectionsIcon: o(
        { // default
            "class": o("DraggedSingleFacetSelectionsIconDesign", "GeneralArea", "MemberOfAreaOS"),
            context: {
                uniqueID: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                displayText: [{ uniqueID: _ }, [me]],
                // this is the facet-specific FacetXIntOSR (matching uniqueIDs), as opposed to myCoselectedFacetXIntOSRs in the embedding, which is all those coselected
                myCoselectedFacetXIntOSR: [{ myFacetUniqueID: [{ uniqueID: _ }, [me]] },
                [{ myCoselectedFacetXIntOSRs: _ }, [embedding]]
                ]
            },
            position: {
                top: designConstants.defaultBoxShadowRadius,
                bottom: designConstants.defaultBoxShadowRadius,
                heightConstraint: {
                    pair1: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    pair2: {
                        point1: {
                            element: [{ myCoselectedFacetXIntOSR: { children: { selections: _ } } }, [me]],
                            type: "top"
                        },
                        point2: {
                            element: [{ myCoselectedFacetXIntOSR: { children: { selections: _ } } }, [me]],
                            type: "bottom"
                        }
                    },
                    ratio: 1
                },
                widthConstraint: {
                    pair1: {
                        point1: { type: "left" },
                        point2: { type: "right" }
                    },
                    pair2: {
                        point1: {
                            element: [{ myCoselectedFacetXIntOSR: { children: { selections: _ } } }, [me]],
                            type: "left"
                        },
                        point2: {
                            element: [{ myCoselectedFacetXIntOSR: { children: { selections: _ } } }, [me]],
                            type: "right"
                        }
                    },
                    ratio: 1
                },
                anchorToOriginFacetSelectionsHorizontalCenter: {
                    point1: {
                        type: "horizontal-center"
                    },
                    point2: {
                        element: [{ myCoselectedFacetXIntOSR: { children: { selections: _ } } }, [me]],
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: designConstants.defaultBoxShadowRadius
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                right: designConstants.defaultBoxShadowRadius
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of FacetXIntOSR Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SolutionSetItem and embedded/intersected classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an item included in the solutionSet of a permanent overlay (in the current application design: a row). An areaSet of SolutionSetItems is embedded in the
    // OverlaySolutionSetView.
    // In its content, this class stores the object describing it, as it appears in the unified (i.e. the merged external and internal databases) item database.
    // 
    // Zebra pattern: 
    // The items are given a background in a zebra pattern, based on this area's myIndexInMovablesUniqueIDs: it's index in the os of movablesUniqueIDs
    //
    // Ephemeral overlays: membership in their solutionSet:
    // 1. a SolutionSetItem pertains to a particular permanent overlay's solutionSet. we also want to mark on it whether its in the solution set of one of the two ephemeral 
    //    overlays the application defines - the ephExtOverlay (the extensional ephemeral overlay) ,and the ephIntOverlay (the intensional one). 
    // 2. ephExtOverlay: 
    // 2.1 in order to allow the addition of an item to the ephemeral extensional overlay, this class inherits Coselectable (in all situations other than when it is part of the 
    //     ephemeral intensional overlay's solutionSet's projection, i.e. when it is highlighted - then the addition to the ephemeral extensional overlay's solutionSet is done via
    //     a different mechanism).
    //     When inheriting Coselectable, this class points to its contiguous coselectables controller (the embedding OverlaySolutionSetView) ,and to the coselectables controller
    //     (the ephemeral extensional overlay).
    // 2.2 if the item is in the solutionSet of the ephExtOverlay, it is also coselected, and is given a solutionSetItemHandle. this handle can be used to copy-paste a set of items
    //     into an extensional overlay.
    // 2.3 additional items can be coselected (i.e. added to the ephExtOverlay) by using the ctrl+mouseClick.
    //
    // Scrolling an item: 
    // This class inherits VerticalSnappable, which allows the solutionSetItems "document" (a virtual entity) to be moved vertically, and snapped to the top of the overlaySolutionSetView.
    //
    // A note on the use of multiple of mouseEvents: 
    // 1. MouseDown+Move will scroll the solutionSetItems "document".
    // 2. MouseClick/Ctrl+MouseClick will coselecte items.
    // 
    // To-Be-Removed on MouseUp (relevant only to items of an intensional overlay)
    // The items created are per the overlay's stable solutionSet. When moving slider selectors, we want to give real-time feedback on an item that would be removed from the solutionSet
    // on a mouseUp. the toBeRemovedOnMouseUp is the qualifier used for that purpose: it checks if the item is not in the solutionSetItems.
    //
    // Blacklist button: 
    // see SolutionSetItemBlacklistButton documentation
    //
    // API: 
    // 1. color: context label by this name, denoting the color of the item.
    //
    // Exporting:
    // 1. myOverlay: areaRef to the associated overlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hoveringOverMe: [and,
                    [{ inFocus: _ }, [me]],
                    [
                        {
                            inArea: false,
                            myOverlay: [{ myOverlay: _ }, [me]]
                        },
                        [areaOfClass, "OverlaySolutionSetScrollbar"]
                    ]
                ],
                toBeRemovedOnMouseUp: [and,
                    [{ ofIntOverlay: _ }, [me]],
                    [not,
                        [
                            [{ itemUniqueIDSelectionQuery: _ }, [me]],
                            [{ myOverlay: { solutionSetItems: _ } }, [me]]
                        ]
                    ]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyOverlay", "TrackJIT"),
            context: {
                uniqueID: [
                    [{ myOverlay: { itemUniqueIDProjectionQuery: _ } }, [me]],
                    [{ content: _ }, [me]]
                ],
                name: [
                    [{ myOverlay: { itemDisplayedUniqueIDProjectionQuery: _ } }, [me]],
                    [{ content: _ }, [me]]
                ],
                itemUniqueIDSelectionQuery: [
                    [{ myOverlay: { itemUniqueIDFunc: _ } }, [me]], // an object of the form { symbol: "MMM" }. also reference from WritableClasses.js
                    [{ uniqueID: _ }, [me]]
                ],
                contentHeight: [densityChoice, bFSPosConst.itemHeight],
                // VerticalSnappable param
                movableController: [embedding],

                draggedExpandedFacet: [
                    { iAmDraggedToReorder: true },
                    [areaOfClass, "ExpandedFacet"]
                ],
                intersectWithDraggedExpandedFacet: [and,
                    [greaterThan,
                        [offset,
                            { element: [{ draggedExpandedFacet: { myFacetHeader: _ } }, [me]], type: "bottom" },
                            { type: "top" }
                        ],
                        0
                    ],
                    [greaterThan,
                        [offset,
                            { type: "bottom" },
                            { element: [{ draggedExpandedFacet: _ }, [me]], type: "bottom" }
                        ],
                        0
                    ]
                ],
                expandedFacetsForCellCreation: o(
                    [
                        { iAmDraggedToReorder: false },
                        [areaOfClass, "ExpandedFacet"]
                    ],
                    // ensure that for the expanded facet being dragged, we create cells only for those rows which actually intersect it!
                    [
                        {
                            iAmDraggedToReorder: true,
                            intersectingRows: [me]
                        },
                        [areaOfClass, "ExpandedFacet"]
                    ]
                )
            },
            content: [{ param: { areaSetContent: _ } }, [me]],
            position: {
                left: 0,
                right: 0,
                "content-height": [{ contentHeight: _ }, [me]]
            },
            children: {
                nonOMFacetCells: compileItems ?
                    {
                        // using areaSets, not intersection, in appreciation of current positioning performance limitations
                        data: [identify,
                            _,
                            [
                                { showingFacetCells: true },
                                [
                                    n([areaOfClass, "OMF"]),
                                    [{ expandedFacetsForCellCreation: _ }, [me]]
                                ]
                            ]
                        ],
                        description: {
                            "class": "NonOMFacetCell"
                        }
                    } :
                    o(),

                oMFCells: compileItems ?
                    {
                        // using areaSets, not intersection, in appreciation of current positioning performance limitations
                        data: [identify,
                            _,
                            [
                                [areaOfClass, "OMF"],
                                [{ expandedFacetsForCellCreation: _ }, [me]]
                            ]
                        ],
                        description: {
                            "class": "OMFCell"
                        }
                    } :
                    o()
            }
        },
        {
            qualifier: { jit: true },
            "class": "VerticalJITSnappable"
        },
        {
            qualifier: { jit: false },
            "class": "VerticalSnappable"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SolutionSetItemDragged: {
        "class": o("SolutionSetItemDraggedDesign", "DraggableIcon", "DisplayDimension"),
        context: {
            myCell: [expressionOf],
            mySolutionSetItem: [{ myCell: { mySolutionSetItem: _ } }, [me]],
            displayText: [
                [{ myApp: { itemDisplayedUniqueIDProjectionQuery: _ } }, [me]],
                [{ mySolutionSetItem: { content: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning Cell classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. numOfValuesToSample: default provided
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    MaxWidthOfCellsApproximation: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // important that they're defined in teh variant-controller, so that they override default values of IntlNumericFormat/PrecisionNumericFormat/etc
                // inherited below
                numericFormatType: [{ myFacet: { numericFormatType: _ } }, [me]],
                numberOfDigits: [{ myFacet: { numberOfDigits: _ } }, [me]],
                // commaDelimited: [{ myFacet: { numericFormatType:_ } }, [me]] not needed for now.
            }
        },
        {
            // to provide the textSize that's also used by the cells actually on display. 
            // this is merged by the displayQuery in CalculateMaxWidthOfStrings
            "class": o("CellTextSizeDisplayDensity", "CalculateMaxWidthOfStrings", "TrackMyFacet"),
            context: {
                numOfValuesToSample: 20,
                // CalculateMaxWidthOfStrings param
                // maximimal width of the first numOfValuesToSample values in the facet's projected values.
                // we get a sample of strings from the facet: the first numOfValuesToSample values from the compressedEffectiveBaseValues
                sampleStrings: [
                    pos,
                    r(0, [minus, [{ numOfValuesToSample: _ }, [me]], 1]),
                    [{ myFacet: { unsortedCompressedEffectiveBaseValues: _ } }, [me]]
                ],
                strings: [{ sampleStrings: _ }, [me]], // default definition                

                maxWidthOfCells: [plus,
                    [
                        [{ maxWidthOfStrings: _ }, [me]],
                        [{ strings: _ }, [me]]
                    ],
                    // beef up this width by some.
                    [densityChoice, [{ fsPosConst: { extraSomethingForMaxWidthOfCells: _ } }, [globalDefaults]]]
                ]
            }
        },
        {
            // if the facet is a numericFacet of metricPrefix or financialSuffix, we convert these numbers-as-strings to their
            // representation (e.g. convert "1000000" to "1M"), otherwise, pass the string along as is.
            // once again, here too things could be made more precise..
            qualifier: { numericFormatType: o("metricPrefix", "financialSuffix") },
            context: {
                strings: [map,
                    [defun,
                        o("numToTranslate"),
                        [translateNumToSuffixBaseFormat,
                            "numToTranslate",
                            [{ numericFormatType: _ }, [me]],
                            [{ numberOfDigits: _ }, [me]],
                            true // useStandardPrecision param                            
                        ]
                    ],
                    [{ sampleStrings: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { numericFormatType: o("intl", "precision", "fixed") },
            "class": "NumericFormatOfReference"
        }
    ),

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of a NonOMFacet (ItemValuesFacet/SliderFacet/MSFacet/RatingFacet) and a SolutionSetItem.
    // It inherits Cell. This class has two variants, depending on whether it is a rating cell or not. If not, it inherits TextualCell; otherwise it inherits RatingCell.
    // Its content is the projection of the item's db object on the intersecting facet.
    // This class provides the right frame of the class - anchored to the anchorForCellRight posPoint label (which in turn is defined elsewhere based on the facet's expansion state).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                numericCell: [and,
                    [
                        Roo(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
                        [{ content: _ }, [me]]
                    ],
                    [not, [{ ratingSymbol: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("Cell", "TrackMyRatingFacet"),
            context: {
                rightContentToRightFrameOffset: bFSPosConst.cellContentHorizontalMargin
            },
            independentContentPosition: true, // an important flag, which overrides the 'false' value for non-intersection areas. 
            // allows to position the content independently of the frame. 
            // Note that since we don't want this to apply to OMFacetCells, we raise this flag here, and not in Cell.
            content: [
                [{ myFacet: { facetProjectionQuery: _ } }, [me]],
                [{ mySolutionSetItem: { content: _ } }, [me]]
            ],
            position: {
                // left content constraint - see variants below
                rightConstraint: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myFacet: _ }, [me]],
                        label: "anchorForCellRight"
                    },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                attachRightContentToRightFrame: {
                    point1: { type: "right", content: true },
                    point2: { type: "right" },
                    equals: [{ rightContentToRightFrameOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofFirstFrozenFacet: true },
            position: {
                leftContentConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    /*point1: {
                        element: [
                            { myOverlay: [{ myOverlay: _ }, [me]] },
                            [areaOfClass, "SolutionSetViewControl"]
                        ],
                        type: "left"
                    },*/
                    point2: {
                        type: "left",
                        content: true
                    },
                    equals: scrollbarPosConst.docOffsetAllowingForScrollbar
                }
            }
        },
        {
            qualifier: { ofFirstFrozenFacet: false },
            position: {
                leftContentConstraint: {
                    point1: {
                        element: [{ myFacet: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left",
                        content: true
                    },
                    equals: bFSPosConst.cellContentHorizontalMargin
                }
            }
        },
        {
            qualifier: { numericCell: true },
            "class": "NumCell",
            context: {
                // if we display a number, the offset from the rightContent to the right frame should be 
                // half the delta between the available "content-width of the facet" (from its lc to its anchorForCellRight) and the maxWidthOfCells,
                // which is the approximation of the length of strings in the facet
                // this essentially means that numbers are centered in the available space 
                rightContentToRightFrameOffset: [max,
                    o(
                        bFSPosConst.cellContentHorizontalMargin,
                        [div,
                            [minus,
                                [offset,
                                    { element: [{ myFacet: _ }, [me]], type: "left", content: true },
                                    { element: [{ myFacet: _ }, [me]], label: "anchorForCellRight" }
                                ],
                                [{ myFacet: { maxWidthOfCells: _ } }, [me]]
                            ],
                            2
                        ]
                    )
                ]
            }
        },
        {
            qualifier: { ofFrozenFacet: true },
            "class": "IconableWhileDraggableOnMove"
        },
        {
            qualifier: { createIconWhileInOperation: true },
            children: {
                iconWhileInOperation: {
                    // see IconableWhileDraggableOnMove for partner definition
                    description: {
                        "class": "SolutionSetItemDragged"
                    }
                }
            }
        },
        {
            qualifier: {
                numericCell: false,
                ofRatingFacet: false
            },
            "class": "TextualCell"
        },
        {
            qualifier: { ofRatingFacet: true },
            "class": "RatingCell"
        },
        {
            qualifier: { ratingSymbol: true },
            "class": "SymbolicRatingCell"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by cells that display alphanumeric characters.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AlphanumericCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                toBeRemovedOnMouseUp: [{ mySolutionSetItem: { toBeRemovedOnMouseUp: _ } }, [me]]
            }
        },
        { // default
            "class": "AlphanumericCellDesign"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by cells that display text, such as: the Name facet, MS facets, or a Comment facet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TextualCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hyperlinkedCellEnabled: [and,
                    [{ myFacet: { hyperlinkEnabled: _ } }, [me]],
                    [{ myFacet: { hyperlinkForValues: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": "AlphanumericCell",
            context: {
                displayText: [{ content: _ }, [me]]
            }
        },
        {
            qualifier: { displayTooltipForOverflowingText: true },
            propagatePointerInArea: "embedding"
        },
        {
            qualifier: { hyperlinkedCellEnabled: true },
            "class": "HyperlinkedTextualCellDesign"
        },
        {
            qualifier: { ofWritableFacet: true },
            "class": "WritableTextCell"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumCell: o(
        { // default
            "class": o("NumCellDesign", "AlphanumericCell"),
            context: {
                displayText: [{ content: _ }, [me]]
            }
        },
        {
            qualifier: { ofDateFacet: true },
            context: {
                displayText: [numToDate, [{ content: _ }, [me]], [{ myApp: { defaultDateFormat: _ } }, [me]]]
            }
        },
        {
            qualifier: { ofUDFCalculatesQuarter: true },
            context: {
                displayText: [convertNumToQuarter, [{ content: _ }, [me]]]
            }
        },
        {
            qualifier: { ofUDFCalculatesMonth: true },
            context: {
                displayText: [convertNumToMonth, [{ content: _ }, [me]]]
            }
        },
        {
            qualifier: { ofDFCalculatesWeekDay: true },
            context: {
                displayText: [convertNumToWeekDay, [{ content: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an intersection between a facet and a solutionSetItem: it displays the value of the solutionSetItem for that facet (e.g. it's price).
    // It is inherited by the NonOMFacetCell and OMFacetCell classes.
    // It defines the position of this intersection area - the frame (except for the right side, which is defined by the inheriting classes), is positioned wrt the intersection borders.
    // The content, on the other hand, is positioned for each axis wrt the content of the corresponding intersection parent (the facet's content for the horizontal content constraints,
    // the solutinSetItem's content for the vertical content constraints). This difference allows the cells to have their content slide gradually out of view as their frame shrinks, when
    // a facet is moved.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Cell: o(
        { // default
            "class": o("CellDesign", "GeneralArea", "DelayedInArea", "TrackMyFacet", "TrackMyOverlay"),
            context: {
                // commented out for now, while Cells are formed via areaSets, and not through intersections due to positioning performance limitations.
                // myFacet: [expressionOf], 
                // mySolutionSetItem: [referredOf],
                myFacet: [{ param: { areaSetContent: _ } }, [me]],
                mySolutionSetItem: [embedding],

                myOverlay: [{ mySolutionSetItem: { myOverlay: _ } }, [me]]
            },
            position: {
                // frame:
                leftConstraint: {
                    point1: { element: [{ myFacet: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                topConstraint: {
                    point1: { element: [{ mySolutionSetItem: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                bottomConstraint: {
                    point1: { type: "bottom" },
                    point2: { element: [{ mySolutionSetItem: _ }, [me]], type: "bottom" },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                // rightConstraint - see inheriting classes

                // content:             
                // leftContent/rightContent - see inheriting classes
                topContentConstraint: {
                    point1: {
                        element: [{ mySolutionSetItem: _ }, [me]],
                        content: true,
                        type: "top"
                    },
                    point2: {
                        type: "top",
                        content: true
                    },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                },
                bottomContentConstraint: {
                    point1: {
                        type: "bottom",
                        content: true
                    },
                    point2: {
                        element: [{ mySolutionSetItem: _ }, [me]],
                        content: true,
                        type: "bottom"
                    },
                    equals: bFSPosConst.cellMarginFromIntersectionParents
                }
            }
        },
        {
            qualifier: { ofFacetDraggedToReorder: true },
            "class": "AboveAllNonDraggedFacets"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Cell classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of SolutionSetItem and embedded/intersected classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of value marker classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class handles the display of 1D valueMarkers representing permanent overlays (whether extensional or intensional).
    // It is inherited by Slider1DValueMarkerOfPermOverlay and by Discrete1DValueMarkerOfPermOverlay
    //
    // API: 
    // 1. color - the color representing a valueMarker that appears in the solutionSet's projection on this facet.
    // 2. radius: this valueMarker is displayed as a circle.
    // 3. ofSolutionSet: 
    //    true for extensional overlays. 
    //    for intensional overlays: if in implicit1DSet and not in solutionSet, then this value is false. otherwise it's true.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OneDValueMarkerOfPermOverlay: {
        "class": o("OneDValueMarkerOfPermOverlayDesign", "TrackMyOverlayXWidget"),
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of value marker classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by HorizontalHistogramsViewContainer and TwoDPlot. It positions their left/bottom.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionHorizontalHistogramsViewContainerOr2DPlot: {
        attachLeftToPrimaryWidgetAnchor: {
            point1: {
                element: [{ myPrimaryWidget: _ }, [me]],
                label: "horizontalAnchorForHistogramOr2DPlot"
            },
            point2: {
                type: "left"
            },
            equals: 0
        },
        attachBottomToPrimaryWidgetAnchor: {
            point1: {
                element: [{ myPrimaryWidget: _ }, [me]],
                label: "bottomAnchorForHistogramOr2DPlot"
            },
            point2: {
                type: "bottom"
            },
            equals: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of OverlayLegend Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A visual indicator embedded in an element, to associate that element with an overlay. Examples of such elements: OverlayXWidgets, OMFs
    //
    // API:
    // 1. myOverlay: areaRef to the associated overlay.
    // 2. position:
    // 2.1 dimension (this area is a square). default provided.
    // 2.2 absolute positioning of this area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayLegend: {
        "class": o("OverlayLegendDesign", "GeneralArea", "BlockMouseEvent", "TrackMyOverlay"),
        context: {
            dimension: bFSPosConst.overlayVerticalElementGirth,
            color: [{ myOverlay: { color: _ } }, [me]],

            myOverlayLegend: [me] // referenced by embedding areas (HideOverlayInFacetControl)
        },
        position: {
            width: [{ dimension: _ }, [me]],
            height: [{ dimension: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbedOverlayXWidgetLegend: {
        children: {
            overlayLegend: {
                description: {
                    "class": "OverlayXWidgetLegend"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetLegend: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                selectionsMade: [{ myOverlayXWidget: { selectionsMade: _ } }, [me]]
            }
        },
        { // default `
            "class": o("GeneralArea", "OverlayLegend", "OverlayDelayedInArea", "TrackMyWidget", "TrackMyFacet", "TrackMyOverlayXWidget"),
            context: {
                // OverlayLegend param:
                myOverlay: [{ myOverlayXWidget: { myOverlay: _ } }, [me]],

                // override the default provided by OverlayLegend
                dimension: [{ myWidget: { overlayXWidgetLegendDimension: _ } }, [me]],

                // the spacing marginFromOverlayXWidget assumes there is a moreControls. overlayXWidgets representing lists won't have one, but we want 
                // all legends to be aligned vertically.
                marginFromOverlayXWidget: [{ myWidget: { offsetToLowHTMLSideOfOverlayXWidgetLegends: _ } }, [me]]
            },
            children: {
                hideOverlayInFacetControl: {
                    description: {
                        "class": "HideOverlayInFacetControl"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                top: [{ marginFromOverlayXWidget: _ }, [me]],
                "horizontal-center": 0,

                minOffsetLeftFromBeginningSideAnchor: {
                    point1: {
                        element: [{ myOverlayXWidget: _ }, [me]],
                        label: "beginningSideAnchor"
                    },
                    point2: {
                        type: "left"
                    },
                    min: 0
                },
                // height/width: determined by OverlayLegend
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                left: [{ marginFromOverlayXWidget: _ }, [me]],
                "vertical-center": 0
                // height/width: determined by OverlayLegend
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetMoreControls: o(
        { // default
            "class": o(
                "OverlayXWidgetMoreControlsDesign",
                "GeneralArea",
                "OrientedElement",
                "MoreControlsController",
                "TrackMyOverlayXWidget"
            ),
            context: {
                narrowDimension: [densityChoice, [{ fsPosConst: { overlayXWidgetMoreControlsHeight: _ } }, [globalDefaults]]], // height, in a vertical OverlayXWidget
                wideDimension: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                myOverlayLegend: [
                    { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                    [areaOfClass, "OverlayXWidgetLegend"]
                ]
            },
            children: {
                moreControlsUX: {
                    description: {
                        "class": "OverlayXWidgetMoreControlsUX"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                attachToOverlayLegend: {
                    point1: {
                        element: [{ myOverlayLegend: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ myWidget: { overlayXWidgetLegendMarginFromMoreControls: _ } }, [me]]
                },
                height: [{ narrowDimension: _ }, [me]],
                "horizontal-center": 0,
                width: [{ wideDimension: _ }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                attachToOverlayLegend: {
                    point1: {
                        element: [{ myOverlayLegend: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ myWidget: { overlayXWidgetLegendMarginFromMoreControls: _ } }, [me]]
                },
                width: [{ narrowDimension: _ }, [me]],
                "vertical-center": 0,
                height: [{ wideDimension: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetMoreControlsUX: o(
        { // default
            "class": o("GeneralArea", "MoreControlsOnClickUX"),
            context: {
                myOverlayXWidget: [{ myOverlayXWidget: _ }, [embedding]], // for the automated test
                verticalMoreControls: [not, [{ ofVerticalElement: _ }, [embedding]]], // don't ask..

                // MoreControlsOnClickUX params: override default param
                circularElements: true,
                elementSpacingFromPrev: [densityChoice, [{ fsPosConst: { overlayXWidgetMoreControlsSpacingFromPrev: _ } }, [globalDefaults]]],
                elementMargin: [densityChoice, [{ fsPosConst: { overlayXWidgetMoreControlsElementMargin: _ } }, [globalDefaults]]],
                elementDimension: [densityChoice, [{ fsPosConst: { overlayXWidgetMoreControlsElementDimension: _ } }, [globalDefaults]]],
                backgroundColor: [{ backgroundColor: _ }, [embedding]]
            },
            position: {
                "class": "AlignCenterWithEmbedding"
            }
        },
        {
            qualifier: { open: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "OverlayXWidgetMoreControlsMenu"
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetMoreControlsMenu: {
        "class": o("GeneralArea", "MoreControlsMenu", "TrackMyOverlay"),
        context: {
            myOverlayXWidget: [{ myOverlayXWidget: _ }, [expressionOf]],
            menuData: o(
                [cond,
                    [{ myOverlayXWidget: { selectionsMade: _ } }, [me]],
                    o(
                        {
                            on: true, use: o({ uniqueID: "deleteSelectionsControl" }, { uniqueID: "disableSelectionsControl" })
                        }
                    )
                ],
                [cond,
                    [{ myOverlayXWidget: { createInclusionExclusionControl: _ } }, [me]],
                    o({
                        on: true, use: o({ uniqueID: "inclusionExclusionModeControl" })
                    })
                ]
            )
        },
        children: {
            menuItems: {
                data: [{ menuData: _ }, [me]],
                description: {
                    "class": "OverlayXWidgetMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetMenuItem: o(
        { // default
            "class": o("MenuItemDirect", "TrackMyOverlay", "TrackMyFacet", "TrackMySelectableFacetXIntOverlay"),
            context: {
                myOverlayXWidget: [{ myOverlayXWidget: _ }, [embedding]],
                myOverlay: [{ myOverlayXWidget: { myOverlay: _ } }, [me]],
                myFacet: [{ myOverlayXWidget: { myFacet: _ } }, [me]]
            }
        },
        {
            qualifier: { uniqueID: "deleteSelectionsControl" },
            "class": "DeleteSelectionsControl"
        },
        {
            qualifier: { uniqueID: "disableSelectionsControl" },
            "class": "DisableSelectionsControl",
        },
        {
            qualifier: { uniqueID: "inclusionExclusionModeControl" },
            "class": "InclusionExclusionModeControl"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of OverlayLegend Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myOverlayLegend
    // 2. myFacet
    // 3. myOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HideOverlayInFacetControl: {
        "class": o("OverlayXWidgetControl", "TrackMyWidget"),
        context: {
            tooltipText: [concatStr,
                o(
                    [{ myApp: { hideStr: _ } }, [me]],
                    [{ myApp: { overlayEntityStr: _ } }, [me]],
                    [{ myApp: { inStr: _ } }, [me]],
                    [{ myApp: { facetEntityStr: _ } }, [me]]
                ),
                " "
            ]
        },
        position: {
            frame: 0
        },
        write: {
            onHideOverlayInFacetControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    addToFacetOS: {
                        to: [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [me]],
                        merge: push([{ myOverlay: { uniqueID: _ } }, [me]])
                    }
                }
            }
        },
        children: {
            icon: {
                description: {
                    "class": "HideOverlayInFacetControlIcon"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    HideOverlayInFacetControlIcon: {
        "class": o("HideOverlayInFacetControlIconDesign", "IconInOverlayXWidgetControl")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowOverlayInFacetControl: {
        "class": o("GeneralArea", "OverlayShowControlCore", "MinHorizontalOffsetFromFacetSelections"),
        context: {
            myFacet: [{ myFacet: _ }, [embedding]],
            myOverlay: [{ myOverlay: _ }, [embedding]], // also referred to by OverlayShowControlCore
            show: false // override the definition of OverlayShowControlCore
        },
        position: {
            // dimensions provided by OverlayShowControlCore
            right: bFSPosConst.showOverlayInFacetControlRightMargin
        },
        write: {
            onShowOverlayInFacetControlClick: {
                "class": "OnMouseClick",
                true: {
                    removeFromFacetOS: {
                        to: [
                            [{ myOverlay: { uniqueID: _ } }, [me]],
                            [{ myFacet: { uniqueIDOfOverlaysHiddenInFacet: _ } }, [me]]
                        ],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // In the current z-module, this is needed for areas embeddedStar in the Amoeba, which are given some stacking constraint - we need to ensure that
    // they remain below the Amoeba's zTop (currently, once they're given a stacking constraint, they are no longer subject to the default stacking behavior
    // which ensures that all embeddedStar areas are under the embedding area's top (z-wise) label.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowMyAmoebaZTop: {
        stacking: {
            belowMyAmoebaZTop: {
                lower: [me],
                higher: {
                    element: [{ myAmoeba: _ }, [me]],
                    label: "zTop"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetControl: o(
        {
            "class": o("GeneralArea", "TooltipableControl", "MinWrap", "TrackMySelectableFacetXIntOverlay"),
            context: {
                minWrapAround: 0,
                myOverlayLegend: [{ myOverlayLegend: _ }, [embedding]],
                myOverlayXWidget: [{ myOverlayLegend: { myOverlayXWidget: _ } }, [me]],
                myOverlay: [{ myOverlayLegend: { myOverlay: _ } }, [me]],
                myFacet: [{ myOverlayLegend: { myFacet: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IconInOverlayXWidgetControl: {
        "class": "IconInTextAndIcon",
        context: {
            myOverlayLegend: [{ myOverlayLegend: _ }, [embedding]],
        },
        propagatePointerInArea: "embedding",
        position: {
            width: [{ myOverlayLegend: { dimension: _ } }, [embedding]],
            height: [{ myOverlayLegend: { dimension: _ } }, [embedding]],
            alignHorizontallyWithOverlayLegend: {
                point1: { type: "horizontal-center" },
                point2: { element: [{ myOverlayLegend: _ }, [embedding]], type: "horizontal-center" },
                equals: 0
            },
            alignVerticallyWithOverlayLegend: {
                point1: { type: "vertical-center" },
                point2: { element: [{ myOverlayLegend: _ }, [embedding]], type: "vertical-center" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the deletion of selections for the associated facet, in the associated intensional overlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteSelectionsControl: {
        context: {
            displayText: "Clear Selections"
        },
        write: {
            onDeleteSelectionsControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetMyFacetXIntOverlayStableSelectionsObj: {
                        to: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: _ } }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the disabling of selections functionality for the embedding FacetXIntOSR. 
    // When disabled, the pre-existing selections are displayed, thought are not in effect in terms of calculation of the itemSets. 
    // This allows the user a quick way to see the effect these selections have on the itemSets of interest (solutionSet, implicitSets).
    // It writes to the 'disabled' attribute of the corresponding SelectableFacetXIntOverlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DisableSelectionsControl: {
        context: {
            closeMoreControlsOnClick: false, // override MenuItemDirect context label
            selectionsDisabled: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { disabled: _ } } }, [me]],

            menuItemPossibleDisplayTexts: o(
                [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { disableSelections: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { selectionEntityStrPlural: _ } }, [me]],
                    true
                ],
                [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { disableSelections: _ } }, [globalDefaults]],
                    "",
                    [{ myApp: { selectionEntityStrPlural: _ } }, [me]],
                    false
                ]
            ),
            displayText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { disableSelections: _ } }, [globalDefaults]],
                "",
                [{ myApp: { selectionEntityStrPlural: _ } }, [me]],
                [not, [{ selectionsDisabled: _ }, [me]]] // the boolean for booleanStringFunc should be phrased in positive terms
            ]
        },
        write: {
            onDisableSelectionsControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleDisableValue: {
                        to: [{ selectionsDisabled: _ }, [me]],
                        merge: [not, [{ selectionsDisabled: _ }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InclusionExclusionModeControl: {
        context: {
            height: [mul,  // override MenuItemDirect default
                [{ fsPosConst: { multiplierForToggleMenuItemHeight: _ } }, [globalDefaults]],
                generalPosConst.menuItemHeight
            ],
            closeMoreControlsOnClick: false, // override MenuItemDirect default
            modifyPointerClickable: false, // override MenuItem default

            inclusionMode: [{ myOverlayXWidget: { inclusionMode: _ } }, [me]],
            displayText: [concatStr,
                o(
                    [{ myApp: { selectStr: _ } }, [me]],
                    " ",
                    [{ myApp: { valueEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { toStr: _ } }, [me]],
                    ":"
                )
            ],

            myToggle: [{ children: { toggle: _ } }, [me]],
            tmpDiscreteValueInclusion: [and,
                [{ myToggle: { hoverOverUX: _ } }, [me]],
                [{ myToggle: { hoverOverLeftHalf: _ } }, [me]]
            ],
            tmpDiscreteValueExclusion: [and,
                [{ myToggle: { hoverOverUX: _ } }, [me]],
                [not, [{ myToggle: { hoverOverLeftHalf: _ } }, [me]]]
            ]
        },
        children: {
            text: {
                description: {
                    context: {
                        defaultVerticalPositioning: false
                    },
                    position: {
                        top: 0,
                        height: [mul,  // override MenuItemDirect default
                            [{ fsPosConst: { multiplierForToggleMenuItemTextHeight: _ } }, [globalDefaults]],
                            generalPosConst.menuItemHeight
                        ],
                        // bottom: provided in the InclusionExclusionModeControlToggleContainer class
                    }
                }
            },
            toggle: {
                description: {
                    "class": "InclusionExclusionModeControlToggle"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InclusionExclusionModeControlToggle: {
        "class": "ToggleControl",
        context: {
            myTitle: [{ children: { text: _ } }, [embedding]],

            // ToggleControl params:
            leftSelected: [{ inclusionMode: _ }, [embedding]],
            selectedToggleLabelTextColor: [{ generalDesign: { appBlueTextColor: _ } }, [globalDefaults]],
            toggleLabelTextSize: [{ myTitle: { textSize: _ } }, [me]],
            toggleLeftLabelDisplayText: [{ myApp: { includeStr: _ } }, [me]],
            toggleRightLabelDisplayText: [{ myApp: { excludeStr: _ } }, [me]]
        },
        position: {
            attachLeftTomyTitleLeft: {
                point1: {
                    element: [{ myTitle: _ }, [me]],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            right: [{ horizontalMarginFromEmbedded: _ }, [embedding]],
            attachTopTomyTitleBottom: {
                point1: {
                    element: [{ myTitle: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of 2D Plot classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the 2D plot that's embedded in an amoeba when its facet is in the appropriate expansion state.
    // It inherits PositionHistogramsViewContainerOr2DPlot to aid its positioning (common code to it and the histogram). The 2DPlot is displayed even if its secondary axis is not yet defined.
    // When its secondary axis is defined, this class inherits an areaSet of ContainerOfTwoDValueMarkersOfOverlay, one for each overlay in zoomBoxedOverlaysShowing (permanent zoomBoxed overlays
    // that are in the show: true state). 
    // It defines several context labels that are used by the TwoDValueMarkerOfPermOverlay embedded in the ContainerOfTwoDValueMarkersOfOverlay areas.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    TwoDPlot: o(
        { // variant-controller
            qualifier: "!",
            context: {
                secondaryAxisFacetDefined: [{ myFacet: { secondaryAxisFacet: _ } }, [me]]
            }
        },
        { // default 
            "class": o("TwoDPlotDesign", "GeneralArea", "AttachBelowAmoebaControlPanel", "TrackMyFacet"),
            position: {
                "class": "PositionHorizontalHistogramsViewContainerOr2DPlot"
            }
        },
        {
            qualifier: { secondaryAxisFacetDefined: false },
            position: {
                width: bFSPosConst.defaultTwoDPlotWidth
            }
        },
        {
            qualifier: { secondaryAxisFacetDefined: true },
            "class": o("TrackOverlaysShowing", "TrackMyFacet"),
            context: {
                primaryAxisFacet: [{ myFacet: _ }, [me]],
                // note: for now there is no secondaryAxisFacet defined!
                secondaryAxisFacet: [{ myFacet: { secondaryAxisFacet: _ } }, [me]],

                primaryAxisWidget: [{ children: { primaryWidget: _ } }, [embedding]],
                secondaryAxisWidget: [{ children: { secondaryWidget: _ } }, [embedding]],

                dualProjectionQuery: [defun,
                    o("os"),
                    [
                        [merge,
                            [[{ primaryAxisFacet: { facetQuery: _ } }, [me]], _],
                            [[{ secondaryAxisFacet: { facetQuery: _ } }, [me]], _]
                        ],
                        "os"
                    ]
                ]
            },
            children: {
                containerOfTwoDValueMarkersOfOverlay: {
                    data: [{ zoomBoxedOverlaysShowing: _ }, [me]],
                    description: {
                        "class": "ContainerOfTwoDValueMarkersOfOverlay"
                    }
                }
            }
            // position: see SecondaryWidget for width constraint
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the TwoDPlot when its secondary axis is defined - there's an instance of this class for every overlay in zoomBoxedOverlaysShowing (see TrackOverlaysShowing).
    // This class embeds an areaSet of 2D valueMarkers. 
    // 
    // Mapping of 2D valueMarkers to items:
    // If the associated overlay is an intensional overlay, there's a valueMarker for each item in its implicit2DSetItems (and for each of these we check whether it is also in 
    // the overlay's solutionSet). 
    // If the associated overlay is an extensional overlay, there's a valueMarker for each item in its solutionSet (as there's no implicitSet defined for an extensional overlay).
    // Note that the itemSet projections (both solutionSetDualProjection and implicit2DSetDualProjection) are calculated over the effectiveBaseOverlay:
    // this is of no effect for zoomBoxed overlays. for zoomBoxing overlays, this trims their itemSet down to the size of the effectiveBaseOverlay (Mon1, Feb 2015).
    // (a similar trimming is done in the itemSets calculated by the PermOverlayXWidget).
    //
    // z-index:
    // the 2D value markers are z-layered according to the order of their overlay in the os of reordered overlays, with the first overlay on top.
    // consequently: by reordering an overlay to be the first in zoomBoxedOverlaysShowing (the data for this areaSet), we place it as the topmost zIndex layer in the 2DPlot.
    // the only exception to this rule: when we hover over an overlay's OSR, its 2D valueMarkers are moved to the topmost layer of the 2D plot.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContainerOfTwoDValueMarkersOfOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hoveringOverMyOverlayOSRControl: [
                    {
                        myOverlay: [{ myOverlay: _ }, [me]],
                        inArea: true
                    },
                    [areaOfClass, "OSRControls"]
                ]
            }
        },
        { // default
            "class": "TrackMyOverlay",
            context: {
                myOverlay: [{ param: { areaSetContent: _ } }, [me]],
                solutionSetItems: [{ myOverlay: { solutionSetItems: _ } }, [me]],

                solutionSetDualProjection: [
                    [{ dualProjectionQuery: _ }, [embedding]],
                    [
                        [{ solutionSetItems: _ }, [me]],
                        [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                    ]
                ]
            },
            position: {
                frame: 0
            },
            children: {
                twoDValueMarkers: {
                    // data: see variants below
                    description: {
                        "class": "TwoDValueMarkerOfPermOverlay"
                    }
                }
            },
            stacking: {
                // the 2D value markers are z-layered according to the order of their overlay in the os of reordered overlays, with the first overlay on top.
                // consequently: by reordering an overlay to be the first in zoomBoxedOverlaysShowing (the data for this areaSet), we place it as the topmost zIndex layer in the 2DPlot
                higherThanNextContainer: {
                    higher: [me],
                    lower: [next, [me]]
                }
            }
        },
        {
            qualifier: { hoveringOverMyOverlayOSRControl: true },
            stacking: {
                theHighestContainer: {
                    higher: [me],
                    lower: [first, [{ children: { containerOfTwoDValueMarkersOfOverlay: _ } }, [embedding]]],
                    priority: 1
                }
            }
        },
        {
            qualifier: { ofIntOverlay: true },
            "class": o("TrackMyFacet", "TrackMySelectableFacetXIntOverlay"),
            context: {
                // myFacet defined by TrackMyFacet. both myOverlay and myFacet used by TrackMySelectableFacetXIntOverlay to obtain mySelectableFacetXIntOverlay
                implicit2DSetItems: [{ mySelectableFacetXIntOverlay: { implicit2DSetItems: _ } }, [me]],
                implicit2DSetDualProjection: [
                    [{ dualProjectionQuery: _ }, [embedding]],
                    [
                        [{ implicit2DSetItems: _ }, [me]],
                        [{ myApp: { effectiveBaseOverlay: { stableSolutionSetItems: _ } } }, [me]]
                    ]
                ]
            },
            children: {
                twoDValueMarkers: {
                    data: [{ implicit2DSetDualProjection: _ }, [me]]
                    // description: see default clause
                }
            }
        },
        {
            qualifier: { ofIntOverlay: false }, // extensional overlay
            children: {
                twoDValueMarkers: {
                    data: [{ solutionSetDualProjection: _ }, [me]]
                    // description: see default clause
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a 2D valueMarker of a permanent overlay. 
    // It positions itself on both axes by referring to the widgets associated with each axis, whether SliderWidget or DiscreteWidget. 
    // When positioning wrt a SliderWidget, this class inherits SliderCanvas, and provides it with the necessary params.
    // When positioning wrt a DiscreteWidget, this class does the leg-work of finding in the associated Widget the value that matches the valueMarker's value, and positioning
    // itself relative to it.
    // 
    // this class presents itself differently depending on whether it represents a implicit2DSetItem and/or a solutionSetItem:
    // in an extensional overlay, all valueMarkers represent solutionSet items, as there are no implicit itemSets defined.
    // in an intensional overlay, a valueMarker may represent both an implicit2DSetItem and a solutionSetItem, or only an implicit2DSetItem 
    // (the solutionSet is a subset of the implicit2DSet)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TwoDValueMarkerOfPermOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                primaryAxisIsSliderFacet: [equal, // if false, that means it is a DiscreteFacet
                    "SliderFacet",
                    [{ myTwoDPlot: { primaryAxisFacet: { facetType: _ } } }, [me]]
                ],
                secondaryAxisIsSliderFacet: [equal, // if false, that means it is a DiscreteFacet
                    "SliderFacet",
                    [{ myTwoDPlot: { secondaryAxisFacet: { facetType: _ } } }, [me]]
                ]
            }
        },
        { // default
            "class": o("TwoDValueMarkerDesign", "Tooltipable"),
            context: {
                tooltipText: [concatStr,
                    o(
                        "X: ",
                        [{ secondaryAxisVal: _ }, [me]],
                        " ",
                        // secondaryAxisFacetDataObj/primaryAxisFacetDataObj are not defined!!!!!!! fix this when reviving 2D plots
                        [{ myTwoDPlot: { secondaryAxisFacetDataObj: { facetUnitAsText: _ } } }, [me]],
                        "\nY: ",
                        [{ primaryAxisVal: _ }, [me]],
                        " ",
                        [{ myTwoDPlot: { primaryAxisFacetDataObj: { facetUnitAsText: _ } } }, [me]]
                    )
                ],

                myTwoDPlot: [
                    [embeddingStar, [me]],
                    [areaOfClass, "TwoDPlot"]
                ],
                // TwoDValueMarkerDesign params:
                color: [{ myOverlay: { color: _ } }, [embedding]],
                radius: bFSPosConst.valueMarker2DRadius,
                ofSolutionSet: o(
                    [not, [{ ofIntOverlay: _ }, [embedding]]], // valueMarker of an extOverlay by definition belongs to its solutionSet
                    [and,
                        [{ ofIntOverlay: _ }, [embedding]],
                        [
                            [{ param: { areaSetContent: _ } }, [me]],
                            [{ solutionSetDualProjection: _ }, [embedding]]
                        ]
                    ]
                ),

                primaryAxisVal: [
                    [{ myTwoDPlot: { primaryAxisFacet: { facetProjectionQuery: _ } } }, [me]],
                    [{ param: { areaSetContent: _ } }, [me]]
                ],
                secondaryAxisVal: [
                    [{ myTwoDPlot: { secondaryAxisFacet: { facetProjectionQuery: _ } } }, [me]],
                    [{ param: { areaSetContent: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { primaryAxisIsSliderFacet: true },
            "class": o("Vertical", "PositionOnSliderCanvas"), // for now we identify primaryAxis with vertical!
            context: {
                // PositionOnSliderCanvas params:
                myWidget: [{ myTwoDPlot: { primaryAxisWidget: _ } }, [me]],
                val: [{ primaryAxisVal: _ }, [me]]
            }
        },
        {
            qualifier: { primaryAxisIsSliderFacet: false },
            position: {
                positionWRTPrimaryAxisMSWidget: {
                    point1: {
                        type: [{ myTwoDPlot: { primaryAxisWidget: { centerLength: _ } } }, [me]]
                    },
                    point2: {
                        element: [
                            { value: [{ primaryAxisVal: _ }, [me]] },
                            [{ myTwoDPlot: { primaryAxisWidget: { discreteValues: _ } } }, [me]]
                        ],
                        type: [{ myTwoDPlot: { primaryAxisWidget: { centerLength: _ } } }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { secondaryAxisIsSliderFacet: true },
            "class": o("Horizontal", "PositionOnSliderCanvas"), // for now we identify secondary axis with horizontal!
            context: {
                // PositionOnSliderCanvas params
                myWidget: [{ myTwoDPlot: { secondaryAxisWidget: _ } }, [me]],
                val: [{ secondaryAxisVal: _ }, [me]]
            }
        },
        {
            qualifier: { secondaryAxisIsSliderFacet: false },
            position: {
                positionWRTSecondaryAxisMSWidget: {
                    point1: {
                        type: [{ myTwoDPlot: { secondaryAxisWidget: { centerLength: _ } } }, [me]]
                    },
                    point2: {
                        element: [
                            { value: [{ secondaryAxisVal: _ }, [me]] },
                            [{ myTwoDPlot: { secondaryAxisWidget: { discreteValues: _ } } }, [me]]
                        ],
                        type: [{ myTwoDPlot: { secondaryAxisWidget: { centerLength: _ } } }, [me]]
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows selecting from a dropdown menu the facet to be represented on a 2D plot's secondary axis. This class is embedded alongside the TwoDPlot class in the amoeba,
    // when the facet is in its appropriate state.
    // This class inherits DropDownMenuable, to allow it to form a menu.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SecondaryAxisSelector: {
        "class": o("SecondaryAxisSelectorDesign", "GeneralArea", "DropDownMenuable", "TrackMyFacet"),
        context: {
            allMovingFacetsExceptMine: [
                n([{ myFacet: _ }, [me]]),
                [{ movingFacet: true }, [areaOfClass, "FacetWithAmoeba"]]
            ],
            // DropDownMenuable params:
            dropDownMenuLogicalSelectionsOS: [{ allMovingFacetsExceptMine: _ }, [me]],
            dropDownMenuDisplaySelectionsOS: [{ allMovingFacetsExceptMine: { name: _ } }, [me]],
            dropDownMenuLogicalSelection: [{ myFacet: { secondaryAxisFacet: _ } }, [me]]
        },
        position: {
            anchorToHorizontalCenterOf2DPlot: {
                point1: {
                    element: [{ children: { twoDPlot: _ } }, [embedding]],
                    type: "horizontal-center"
                },
                point2: {
                    type: "horizontal-center"
                },
                equals: 0
            },
            // attached to lower of twoDPlot bottom and secondaryWidget bottom (if a secondaryWidget is defined, it's bottom is by definition below that of the twoDPlot).
            belowTwoDPlotBottom: {
                point1: {
                    element: [{ children: { twoDPlot: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                min: bFSPosConst.secondaryAxisSelectorMarginOnTop
            },
            belowSecondaryWidgetBottom: {
                point1: {
                    element: [{ children: { secondaryWidget: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                min: bFSPosConst.secondaryAxisSelectorMarginOnTop
            },
            attachToHigherOfPlot: {
                point1: {
                    element: [{ children: { twoDPlot: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                max: bFSPosConst.secondaryAxisSelectorMarginOnTop,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "secondaryWidgetSelectorOrGroup" }
            },
            attachToHigherOfSecondaryWidget: {
                point1: {
                    element: [{ children: { secondaryWidget: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                max: bFSPosConst.secondaryAxisSelectorMarginOnTop,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "secondaryWidgetSelectorOrGroup" }
            },
            height: 15,
            width: 100
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. open: ->AD that controls the opening/closing of the associated facet panel.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetPanelController: o(
        { // default
            "class": "FacetTopControl"
        },
        {
            qualifier: { enabled: true },
            write: {
                onFacetPanelControllerMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleOpen: {
                            to: [{ open: _ }, [me]],
                            merge: [not, [{ open: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the general class used in FSP, UDFFormulaPanel
    // API:
    // 1. open: a ->AD to determine whether the panel is open/close.
    // 2. tooltipText: to be used by the embedded FacetPanelMinimizationControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetDropDownPanel: o(
        {   //default
            "class": o(
                "FacetDropDownPanelDesign", "Icon", "MinWrap",
                "AboveFacetHeader", "AboveZTopOfArea", "BelowSpecifiedAreas",
                "TrackMyFacet"
            ),
            context: {
                myFacet: [expressionOf],
                minWrapAround: 0,
                confineIconToArea: false,
                confinedToArea: [embedding],
                zTopAreaBelowMe: [{ myAmoeba: _ }, [me]],
                areasAboveMe: [{ myFacetName: _ }, [me]]
            },
            propagatePointerInArea: o(), // no need to have the FSPController respond visually
            // when we're inside the FSP
            position: {
                attachTopToMyFacetTop: {
                    point1: { element: [{ myFacet: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: 0
                },
                attachLeftToMyFacetLeft: {
                    point1: { element: [{ myFacet: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
                attachRightToMyFacetRight: {
                    point1: { element: [{ myFacet: _ }, [me]], type: "right" },
                    point2: { type: "right" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { open: true },
            children: {
                panelMinimizationControl: {
                    description: {
                        "class": "FacetPanelMinimizationControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetPanelMinimizationControl: {
        "class": o("FacetPanelMinimizationControlDesign", "GeneralArea", "FacetControl"),
        context: {
            myFacet: [{ myFacet: _ }, [embedding]],
            tooltipText: [{ tooltipText: _ }, [embedding]]
        },
        position: {
            top: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]],
            right: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
        },
        write: {
            onFacetPanelMinimizationControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    closePanel: {
                        to: [{ open: _ }, [embedding]],
                        merge: false
                    }
                }
            }
        }
    }
};  
