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

// %%classfile%%: <udFacetDesignClasses.js>
initGlobalDefaults.uDF = {
    defaultDisplayUDFFormulaPanelKeypad: true,
    defaultFormulaPanelIsOpen: true
};

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For the time being, given current system limitations, we will use UDFController to create a database which includes the 
    // original database, and onto it we will recursively merge the attribute-values of the different UDFs, using an areaset of UDFAux embedded herein.
    // API:
    // 1. dbPreUDFs: an item database. This class will define dbPostUDFs, which will be the dbPreUDFs with the UDFs av pairs merged into it.
    // 2. uDFRefElements: an os of refElements that a UDF can reference in its formula.
    // 3. uDFAllElements: an os of all elements, including  those which are no longer referenceable (as they are trashed)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFController: {
        "class": "GeneralArea",
        context: {
            "^uDFData": o(), // this is essentially cross-view!

            // myUDFs is the data for the UDFAux areaSet. the order of UDFs there matters, as we want to ensure that UDFx defined by UDFs will appears
            // after it in this ordering: the computation of the item db *with* the UDFs is recursive: each UDFAux adds its attr-val on top of its prev's
            // output db. so when UDFy's UDFAux calculates its output db, it expects to have UDFx's attr-val already present in its input db.
            // all this is ensured by sorting (ascending) the UDFs by the number of defining facets they have.
            myUDFs: [sort,
                [ // data
                    {
                        myUDFController: [me],
                        uniqueID: [
                            {
                                uDF: true,
                                trashed: false,
                                uniqueID: _
                            },
                            // we look at facetData and not uDFData as we need to select only those that have trashed: false,
                            // and that infromation is available only in facetData's objects
                            [{ myApp: { facetData: _ } }, [me]]
                        ]
                    },
                    [areaOfClass, "UDFClipper"]
                ],
                o({ countDefiningFacets: "ascending" }, { uniqueID: "ascending" })
            ],

            dbPostUDFs: [cond,
                [{ children: { udfAuxs: _ } }, [me]],
                o(
                    { on: true, use: [{ outputDB: _ }, [last, [{ children: { udfAuxs: _ } }, [me]]]] },
                    { on: false, use: [{ dbPreUDFs: _ }, [me]] } // if there are no UDFs, the dbPostUDFs is identical to the dbPreUDFs
                )
            ],
            "*expressionClipboard": o(), // for ctrl+X/V/C operations.

            udfNamePrefix: "Formula #",
            defaultNewUDFCounter: 1,
            "^newUDFCounterAD": o(),
            newUDFCounter: [mergeWrite,
                [{ newUDFCounterAD: _ }, [me]],
                [{ defaultNewUDFCounter: _ }, [me]]
            ]
        },
        children: {
            udfAuxs: {
                data: [identify, { uniqueID: _ }, [{ myUDFs: _ }, [me]]],
                description: {
                    "class": "UDFAux"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyUDFController: o(
        { // variant-controller
            qualifier: "!",
            context: {

            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                // we assume a single UDFController!
                myUDFController: [areaOfClass, "UDFController"],
                uDFData: [{ myUDFController: { uDFData: _ } }, [me]],
                uDFRefElements: [{ myUDFController: { uDFRefElements: _ } }, [me]],
                uDFAllElements: [{ myUDFController: { uDFAllElements: _ } }, [me]] // all elements, including those no longer referenceable (as they're trashed)
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myUDFUniqueID
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyUDFDataObj: o(
        { // variant-controller
            qualifier: "!",
            context: {

            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyUDFController"),
            context: {
                myUDFDataObj: [
                    { uniqueID: [{ myUDFUniqueID: _ }, [me]] },
                    [{ uDFData: _ }, [me]]
                ]
            }
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFAux: o(
        { // default
            "class": o("MemberOfAreaOS", "TrackMyUDFController"),
            context: {
                // this is in fact the UDFClipper (as the UDF is not guaranteed to exist throughout, while the Clipper is)
                myUDF: [{ param: { areaSetContent: _ } }, [me]],
                myExpressionFormula: [generateFormulaForCalculation,
                    [{ myUDF: { cellExpression: _ } }, [me]],
                    [{ uDFAllElements: _ }, [me]]
                ],
                outputDB: [
                    addComputedAttribute,
                    [{ myUDF: { uniqueID: _ } }, [me]],
                    [{ myExpressionFormula: _ }, [me]],
                    [{ inputDB: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            context: {
                inputDB: [{ dbPreUDFs: _ }, [embedding]]
            }
        },
        {
            qualifier: { firstInAreaOS: false },
            context: {
                inputDB: [{ outputDB: _ }, [prev]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IMPORTANT:
    // A general note regarding Clipper classes and their embedded Facet classes:
    // in the UDF, we abide by the same strategy as elsewhere: even if the Clipper class exists, the embedded Facet class may not be needed.
    // for UDFs, the UDFClipper always exists. unlike non-UDF Clipper areas, which can be produced only if their Facet is actually displayed,
    // UDFClipper areas need to exist throughout, as the recursive calculations in them (of the defining facets), cannot be reproduced in one of the [map]-
    // based os of data objects that can be found in FSApp.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFacetClipper: {
        "class": "UDFClipper"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFClipper: o(
        { // variant-controller
            qualifier: "!",
            context: {
                properFormula: [testFormula, [{ cellExpressionFormula: _ }, [me]]],
                properReferences: [not, [{ obsoleteRefElementsExist: _ }, [me]]],
                properDefinition: [and,
                    [not, [{ trashed: _ }, [me]]],
                    [{ properFormula: _ }, [me]],
                    [{ properReferences: _ }, [me]],
                    [cond,
                        // contribute a true to the [and] if there are no UDFs defining this UDF.
                        // otherwise, check that they are properly defined!
                        [{ definingUDFs: _ }, [me]],
                        o(
                            { on: false, use: true },
                            { on: true, use: [{ definingUDFs: { properDefinition: _ } }, [me]] }
                        )
                    ]
                ],


                onDataSource: [and,
                    o( // if there are no defining "organic" facets (i.e. non-UDFs) in the cellExpression, that's fine. 
                        // if there are, they should all be in the dataSource
                        [not, [{ nonUDFUniqueIDsInCellExpression: _ }, [me]]],
                        [and,
                            [{ nonUDFUniqueIDsInCellExpression: _ }, [me]],
                            [not, // verify that the nonUDFUniqueIDsInCellExpression are all in the dataSource
                                [ // are there nonUDFUniqueIDsInCellExpression which are not in the dataSourceDescription? 
                                    n([{ myApp: { dataSourceDescription: { uniqueID: _ } } }, [me]]), // the os of uniqueIDs of the facets from the dataSource
                                    [{ nonUDFUniqueIDsInCellExpression: _ }, [me]]
                                ]
                            ]
                        ]
                    ),
                    o(
                        // if there are no defining UDFs in the cellExpression, that's fine. if there are, they too should be onDataSource
                        [not, [{ uDFUniqueIDsInCellExpression: _ }, [me]]],
                        [and,
                            [
                                {
                                    uniqueID: [{ uDFUniqueIDsInCellExpression: _ }, [me]],
                                    onDataSource: _
                                },
                                [{ myApp: { uDFClippers: _ } }, [me]]
                            ],
                            true // to help [and] which at this point won't accept an os of generated by a selection/projection
                        ]
                    )
                ],

                // note the singular in the time-frame element in the context labels below: "Year", not "Years".
                // this is to distinguish these UDFs from UDFs in which we calculate the time delta (in years, quarters, weeks, days, etc.)
                uDFCalculatesYear: ["year", [{ cellExpression: _ }, [me]]],
                uDFCalculatesQuarter: ["quarter", [{ cellExpression: _ }, [me]]],
                uDFCalculatesMonth: ["month", [{ cellExpression: _ }, [me]]],
                uDFCalculatesWeekDay: ["dayOfWeek", [{ cellExpression: _ }, [me]]],
                uDFCalculatesMonthDay: ["dayOfMonth", [{ cellExpression: _ }, [me]]],
                uDFCalculatesHour: ["hour", [{ cellExpression: _ }, [me]]],
                uDFCalculatesMinute: ["minute", [{ cellExpression: _ }, [me]]],
                uDFCalculatesSecond: ["second", [{ cellExpression: _ }, [me]]],

                uDFCalculatesTextualValue: o(
                    [{ uDFCalculatesQuarter: _ }, [me]],
                    [{ uDFCalculatesMonth: _ }, [me]],
                    [{ uDFCalculatesWeekDay: _ }, [me]]
                ),

                uDFCalculatesDate: o(
                    [{ uDFCalculatesYear: _ }, [me]],
                    [{ uDFCalculatesQuarter: _ }, [me]],
                    [{ uDFCalculatesMonth: _ }, [me]],
                    [{ uDFCalculatesMonthDay: _ }, [me]],
                    [{ uDFCalculatesWeekDay: _ }, [me]],
                    [{ uDFCalculatesHour: _ }, [me]],
                    [{ uDFCalculatesMinute: _ }, [me]],
                    [{ uDFCalculatesSecond: _ }, [me]]
                )
            }
        },
        { // default 
            "class": o("GeneralArea", "UDFFacetType", "TrackMyUDFDataObj"),
            context: {
                myUDFUniqueID: [{ uniqueID: _ }, [me]], // TrackMyUDFDataObj params

                // the initial expression on load should be what was stored in the myUDFDataObj (what was previously written to that PAD)
                // note the difference between 'expression' which is NPAD, and what's written to cellExpression (PAD) on Apply/Enter.                
                "*expression": [{ myUDFDataObj: { cellExpression: _ } }, [me]],
                cellExpression: [{ myUDFDataObj: { cellExpression: _ } }, [me]],
                cellExpressionFormula: [generateFormulaForCalculation,
                    [{ cellExpression: _ }, [me]],
                    [{ uDFAllElements: _ }, [me]]
                ],

                // note the difference between the defining facets, and the defining facets which are part of the currently loaded dataSource.
                // first, the defining facets (UDFs, and nonUDFs) - these are used to calculated onDataSource
                uDFUniqueIDsInCellExpression: [
                    [{ uDFData: { uniqueID: _ } }, [me]],
                    [{ cellExpression: { calculatorRefVal: _ } }, [me]]
                ],
                nonUDFUniqueIDsInCellExpression: [
                    n([{ uDFUniqueIDsInCellExpression: _ }, [me]]),
                    [{ cellExpression: { calculatorRefVal: _ } }, [me]]
                ],
                // now the defining facets (UDFs, and nonUDFs) which are defined over the currently loaded dataSource
                potentiallyDefiningFacetUniqueIDs: [
                    // select all the dataType non-trashed facet from the facetData os out of the reorderedFacetDataUniqueID
                    [{ uniqueID: _ }, [{ myApp: { nonTrashedNumberOrDateDataTypeFacetData: _ } }, [me]]],
                    [{ myApp: { reorderedFacetDataUniqueID: _ } }, [me]]
                ],
                directlyDefiningFacetUniqueIDs: [
                    // select the Facets whose uniqueID appears in the projection of the 'val' attr in 'expression' (where it exists) 
                    [{ cellExpression: { calculatorRefVal: _ } }, [me]],
                    [{ potentiallyDefiningFacetUniqueIDs: _ }, [me]]
                ],
                directlyDefiningUDFUniqueIDs: [
                    [{ uDFData: { uniqueID: _ } }, [me]],
                    [{ directlyDefiningFacetUniqueIDs: _ }, [me]]
                ],
                directlyDefiningUDFs: [
                    { uniqueID: [{ directlyDefiningUDFUniqueIDs: _ }, [me]] },
                    [{ myApp: { uDFClippers: _ } }, [me]]
                ],
                directlyDefiningNonUDFUniqueIDs: [
                    n([{ directlyDefiningUDFUniqueIDs: _ }, [me]]),
                    [{ directlyDefiningFacetUniqueIDs: _ }, [me]]
                ],
                // the following recursive definition is what prevents us from working with data objects for UDFs, and creating an instance of a UDF area
                // only for those UDFs which are visible. the recursive definition cannot be implemented in a [map], as it would require the attribute of
                // one object to query the value of an attribute in another object within the same [map]. that, at this point, cannot be done (3/2017)
                definingFacetUniqueIDs: o( // the recursive definition: those defining me directly, and those defining them: all these define me
                    [{ directlyDefiningFacetUniqueIDs: _ }, [me]],
                    [{ directlyDefiningUDFs: { definingFacetUniqueIDs: _ } }, [me]]
                ),
                definingUDFs: [
                    { uniqueID: [{ definingFacetUniqueIDs: _ }, [me]] },
                    [{ myApp: { uDFClippers: _ } }, [me]]
                ],
                obsoleteRefElementsExist: [
                    n([{ directlyDefiningFacetUniqueIDs: _ }, [me]]),
                    [{ cellExpression: { calculatorRefVal: _ } }, [me]]
                ],
                countDefiningFacets: [size, [{ definingFacetUniqueIDs: _ }, [me]]], // used to determing order of UDFAux's areaSet!!                
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myUDFController (default value provided)
    // 2. Assumes the inheriting area also inherits Facet (and so provides uniqueID, facetProjectionQuery, facetSelectionQueryFunc, etc.)
    // 3. enabled: true, by default. UDFacet provides an alternate definition (for cdl performance optimization)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDF: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: true,
                embedUDFFormulaPanel: [and,
                    [{ ofMovingPane: _ }, [me]],
                    [not, [{ settingsPanelIsOpen: _ }, [me]]]
                ],
                embedUDFFormulaPanelController: [and,
                    [{ embedUDFFormulaPanel: _ }, [me]],
                    [not, [{ formulaPanelIsOpen: _ }, [me]]]
                ],

                "*formulaPanelIsOpen": [{ uDF: { defaultFormulaPanelIsOpen: _ } }, [globalDefaults]],
                displayUDFFormulaPanel: [and,
                    [{ ofMovingPane: _ }, [me]],
                    [{ formulaPanelIsOpen: _ }, [me]]
                ],

                cellExpressionFormula: [{ cellExpressionFormula: _ }, [embedding]],

                properFormula: [{ properFormula: _ }, [embedding]],
                properReferences: [{ properReferences: _ }, [embedding]],

                uDFCalculatesYear: [{ uDFCalculatesYear: _ }, [embedding]],
                uDFCalculatesQuarter: [{ uDFCalculatesQuarter: _ }, [embedding]],
                uDFCalculatesMonth: [{ uDFCalculatesMonth: _ }, [embedding]],
                uDFCalculatesMonthDay: [{ uDFCalculatesMonthDay: _ }, [embedding]],
                uDFCalculatesWeekDay: [{ uDFCalculatesWeekDay: _ }, [embedding]],
                uDFCalculatesHour: [{ uDFCalculatesHour: _ }, [embedding]],
                uDFCalculatesMinute: [{ uDFCalculatesMinute: _ }, [embedding]],
                uDFCalculatesSecond: [{ uDFCalculatesSecond: _ }, [embedding]],

                uDFCalculatesTextualValue: [{ uDFCalculatesTextualValue: _ }, [embedding]],
                uDFCalculatesDate: [{ uDFCalculatesDate: _ }, [embedding]],
            }
        },
        { // default
            "class": o("GeneralArea", "CalculatorController", "DraggableToTrashElement", "ModalDialogable", "UDFFacetType", "TrackMyUDFController"),
            context: {
                expression: [{ expression: _ }, [embedding]],
                cellExpression: [{ cellExpression: _ }, [embedding]],

                expressionClipboard: [{ myUDFController: { expressionClipboard: _ } }, [me]], // override default definition, as we want a single clipboard 
                // for all UDFs, to reside in UDFController
                "*displayUDFFormulaPanelKeypad": [{ uDF: { defaultDisplayUDFFormulaPanelKeypad: _ } }, [globalDefaults]],

                // CalculatorController params
                calculatorRefElements: [{ uDFRefElements: _ }, [me]],
                calculatorAllElements: [{ uDFAllElements: _ }, [me]],

                uDFsDefinedByMe: [
                    { definingFacetUniqueIDs: [{ uniqueID: _ }, [me]] },
                    [areaOfClass, "UDFClipper"]
                ],
                definingFacetUniqueIDs: [{ definingFacetUniqueIDs: _ }, [embedding]],

                // DraggableToTrashElement param
                draggingToTrash: [{ iAmDraggedToReorder: _ }, [me]],

                otherUDFsWithOpenFormulaPanel: [
                    { formulaPanelIsOpen: true },
                    [
                        n([me]),
                        [areaOfClass, "UDF"]
                    ]
                ]
            },
            write: {
                onUDFEditUDF: {
                    upon: [{ formulaPanelIsOpen: _ }, [me]],
                    true: {
                        closeOtherUDFPanels: {
                            to: [{ otherUDFsWithOpenFormulaPanel: { formulaPanelIsOpen: _ } }, [me]],
                            merge: false
                        }
                    }
                },
                onUDFCalculateValue: {
                    upon: o( // when either the default evaluation event, or when coming out of editUDF mode, or when minimizing the facet
                        [{ defaultEvaluateEvent: _ }, [me]],
                        [clickHandledBy, // either a click on this button,
                            [
                                { myCalculatorController: [me] },
                                [areaOfClass, "UDFEditorApplyButton"]
                            ]
                        ],
                        [not, [{ formulaPanelIsOpen: _ }, [me]]],
                        [{ minimized: _ }, [me]]
                    ),
                    true: {
                        copyCurrentExpression: {
                            to: [{ cellExpression: _ }, [me]],
                            merge: [{ expression: _ }, [me]]
                        }
                    }
                },
                onUDFOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        markAsTrashed: {
                            to: [{ trashed: _ }, [me]],
                            merge: true
                        },
                        removeFromExpandedMovingFacetUniqueIDs: {
                            to: [
                                [{ uniqueID: _ }, [me]],
                                [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                            ],
                            merge: o()
                        },
                        markAsFirstInTrashedOrderFacetUniqueID: {
                            to: [{ myApp: { trashedOrderFacetUniqueID: _ } }, [me]],
                            merge: push([{ uniqueID: _ }, [me]])
                        },
                        closeFormulaPanel: {
                            to: [{ formulaPanelIsOpen: _ }, [me]],
                            merge: false
                        },
                        selectTrashFacetTab: { // if the trash will be opened now, it will be on the facet tab
                            to: [{ appTrash: { selectedTab: _ } }, [me]],
                            merge: [{ appTrash: { facetTabData: _ } }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                enabled: true,
                embedUDFFormulaPanelController: true
            },
            children: {
                formulaController: {
                    description: {
                        "class": "UDFFormulaPanelController"
                    }
                }
            }
        },
        {
            qualifier: {
                enabled: true,
                embedUDFFormulaPanel: true
            },
            children: {
                formulaPanel: {
                    partner: [embedding, [{ myFacet: _ }, [me]]], // so that we could cover the Facet's border!
                    description: {
                        "class": "UDFFormulaPanel"
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
                        "class": "DeleteUDFModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // UDF's facetType is not handled properly in FSApp (facetDataForDefaultFacetType, facetDataForFacetType) as the determination there is based
    // on the typeCount object (and nrUnique, in particular), which is provided by [datatable] only for the "organic" facets, not for the UDFs, whose
    // value is calculated per item on the fly. This class overrides (by merit of being inherited at a higher priority) the myFacetDataObj defined in 
    // TrackMyFacetDataObj, and inherited by FacetClipper and Facet.
    //
    // API:
    // 1. effectiveBaseOverlayProjectedValues
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFFacetType: o(
        { // default
            context: {
                possibleFacetTypes: o("SliderFacet", "MSFacet", "ItemValues", "RatingFacet"),
                defaultFacetType: [cond,
                    [
                        r(1, fsAppConstants.maxNrUniqueNumberValuesForMS),
                        [size,
                            [_,
                                [{ effectiveBaseOverlayProjectedValues: _ }, [me]]
                            ]
                        ]
                    ],
                    o({ on: true, use: "MSFacet" }, { on: false, use: "SliderFacet" })
                ],
                facetType: [mergeWrite,
                    // note myFacetDataObj's facetType for a UDF starts out undefined (as FSApp's facetDataForDefaultFacetType is not calculated for UDFs)
                    [{ myFacetDataObj: { facetType: _ } }, [me]],
                    [{ defaultFacetType: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { uDFCalculatesTextualValue: true },
            context: {
                possibleFacetTypes: o("MSFacet", "ItemValues"),
                defaultFacetType: "MSFacet"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For now, nothing other than inheriting CalculatorRefElement
    // API:
    // 1. See CalculatorRefElement
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFRefElement: {
        "class": "CalculatorRefElement"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class assumes that at most a single UDF can be edited at any given moment.
    // 
    // API:
    // 1. myUDFRefElement
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFRefElementUX: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // myCalculatorController is of the edited UDF
                ofUDFDefiningEditedUDF: [{ myCalculatorController: { definingFacetUniqueIDs: [{ myFacetUniqueID: _ }, [me]] } }, [me]],
                ofUDFDefinedByEditedUDF: [
                    {
                        definingFacetUniqueIDs: [{ myCalculatorController: { uniqueID: _ } }, [me]],
                        uniqueID: [{ myUDFRefElement: { calculatorRefVal: _ } }, [me]]
                    },
                    [areaOfClass, "UDF"]
                ],
                myFacetIsEditedUDF: [
                    [{ myUDFRefElement: { calculatorRefVal: _ } }, [me]],
                    [{ myCalculatorController: { uniqueID: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o("CalculatorRefElementUX", "TrackMyUDFController"),
            context: {
                // CalculatorRefElementUX params:
                myCalculatorController: [{ formulaPanelIsOpen: true }, [areaOfClass, "UDF"]], // we reference the UDF being edited.
                myCalculatorRefElement: [{ myUDFRefElement: _ }, [me]],

                disabled: o(
                    //[{ defaultDisabled:_ }, [me]], not for now
                    // must disable to avoid a circular reference
                    [{ myFacetIsEditedUDF: _ }, [me]], // the trivial circular reference: <udf1> defined as <udf1>
                    [{ ofUDFDefinedByEditedUDF: _ }, [me]] // the non-trivial circular reference
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // f(x) control button
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFFormulaPanelController: o(
        { // variant controller
            qualifier: "!",
            context: {
            }
        },
        {   // default
            "class": o("UDFFormulaPanelControllerDesign", "FacetPanelController"),
            context: {
                tooltipText: [{ myFacet: { formulaPanelTooltipText: _ } }, [me]],

                formulaStr: [{ myFacet: { expressionAsStr: _ } }, [me]], //or cellExpressionFormula ?
                // FacetPanelController params: 
                open: [{ myFacet: { formulaPanelIsOpen: _ } }, [me]],
                //FacetTopControl params:
                controlToTheLeft: [cond,
                    [{ myFacet: { showDataTypeInUdf: _ } }, [me]],
                    o(
                        {
                            on: true, use: [
                                { myFacet: [{ myFacet: _ }, [me]] },
                                [areaOfClass, "DataTypeControl"]
                            ]
                        },
                        {
                            on: false, use: [{ myFSPController: _ }, [me]]
                        }
                    )
                ]
                //end of FacetTopControl params
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFFormulaPanel: o(
        {  //default
            "class": "FacetDropDownPanel",
            context: {
                tooltipText: [{ myFacet: { formulaPanelTooltipText: _ } }, [me]],
                open: [{ formulaPanelIsOpen: _ }, [me]] // FacetDropDownPanel param
            }
        },
        {
            qualifier: { formulaPanelIsOpen: true },
            context: {
                descriptionTopMargin: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                facetSettingsPanelDescriptionTopAnchor: {
                    element: [{ children: { uDFEditor: _ } }, [me]],
                    type: "bottom"
                }
            },
            children: {
                uDFEditor: {
                    description: {
                        "class": "UDFEditor",
                        position: {
                            uDFEditorTopConstraint: {
                                point1: {
                                    element: [{ myFacetHeader: _ }, [embedding]],
                                    type: "bottom"
                                },
                                point2: {
                                    type: "top",
                                },
                                equals: 0
                            }
                        }
                    },
                },
                duplicateUDF: {
                    description: {
                        "class": "DuplicateUDFacetControl"
                    }
                },
                deleteUDF: {
                    description: {
                        "class": "DeleteUDFacetControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFacetControl: {
        "class": "FacetControl",
        context: {
            myFacet: [{ myFacet: _ }, [embedding]],
            myUDF: [{ myFacet: _ }, [me]]
        },
        position: {
            alignVerticallyWithFacetName: {
                point1: { type: "vertical-center" },
                point2: { element: [{ myFacetName: _ }, [me]], type: "vertical-center" },
                equals: 0
            }
        },
        stacking: {
            aboveFSP: {
                higher: [me],
                lower: [{ myFSP: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DuplicateUDFacetControl: {
        "class": o("DuplicateUDFacetControlDesign", "UDFacetControl", "AddUDFacetControl"),
        context: {
            tooltipText: [concatStr, o([{ myApp: { duplicateStr: _ } }, [me]], " ", [{ myApp: { facetEntityStr: _ } }, [me]])],

            prefixOfNewFacetName: [concatStr,
                o(
                    [{ myUDF: { name: _ } }, [me]],
                    fsAppConstants.copyOfNamePrefixOfSuffix
                )
            ],
            newUDFObj: [merge, // override AddUDFControl default definition
                {
                    name: [generateNameFromPrefix,
                        [{ prefixOfNewFacetName: _ }, [me]],
                        [{ name: _ }, [areaOfClass, "Facet"]]
                    ],
                    cellExpression: [{ myUDF: { cellExpression: _ } }, [me]]
                },
                [{ defaultUDFObj: _ }, [me]]
            ]
        },
        position: {
            minOffsetFromFacetNameRight: {
                point1: {
                    element: [{ myFacetName: _ }, [me]],
                    type: "right"
                },
                point2: { type: "left" },
                min: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
            },
            attachRightToDeleteUDFLeft: {
                point1: { type: "right" },
                point2: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "DeleteUDFacetControl"]
                    ],
                    type: "left"
                },
                equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteUDFacetControl: {
        "class": o("DeleteUDFacetControlDesign", "UDFacetControl", "UDFDeleteUX"),
        context: {
            tooltipText: [concatStr, o([{ myApp: { trashStr: _ } }, [me]], " ", [{ myApp: { facetEntityStr: _ } }, [me]])]
        },
        position: {
            attachRightToFacetRight: {
                point1: { type: "right" },
                point2: { element: [{ myFacet: _ }, [me]], type: "right", content: true },
                equals: [densityChoice, [{ fsPosConst: { facetControlMargin: _ } }, [globalDefaults]]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myUDF
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFDeleteUX: {
        "class": o("GeneralArea", "BlockMouseEvent", "CreateModalDialogOnClick"),
        context: {
            // CreateModalDialogOnClick param
            createModalDialog: [{ myUDF: { createModalDialog: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteUDFModalDialog: {
        "class": o("OKCancelModalDialog"),
        context: {
            myUDF: [expressionOf],
            uDFsDefinedByMe: [{ myUDF: { uDFsDefinedByMe: _ } }, [me]]
        },
        children: {
            textDisplay: {
                description: {
                    "class": "DeleteUDFModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "DeleteUDFModalDialogOKControl"
                }
            }
            // cancelControl defined by OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteUDFModalDialogText: {
        "class": "OKCancelDialogText",
        context: {
            myFacet: [{ myUDF: _ }, [embedding]],
            prefixOfDisplayText: [
                [{ myApp: { trashDialogBoxConfirmationTextGenerator: _ } }, [me]],
                [{ myFacet: { name: _ } }, [me]],
                [{ myApp: { facetEntityStr: _ } }, [me]]
            ],
            displayText: [concatStr,
                o(
                    [{ prefixOfDisplayText: _ }, [me]],
                    [cond,
                        [{ myDialog: { uDFsDefinedByMe: _ } }, [me]],
                        o({
                            on: true,
                            use: [concatStr,
                                o(
                                    "\nIt is used in the definition of ",
                                    [concatStr, [{ myDialog: { uDFsDefinedByMe: { name: _ } } }, [me]], ", "]
                                )]
                        })
                    ]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteUDFModalDialogOKControl: {
        "class": o("OKCancelDialogOKControl", "TrackAppTrash")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of UDF classes pertaining to FSApp
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFacet: {
        "class": "UDF",
        context: {
            formulaPanelTooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { openFormulaPanel: _ } }, [globalDefaults]],
                "",
                [concatStr, o([{ myApp: { facetEntityStr: _ } }, [me]], " ", [{ myApp: { formulaEntityStr: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                [{ formulaPanelIsOpen: _ }, [me]]
            ],

            formulaPanelIsOpen: [mergeWrite, // override UDF NPAD definition
                [{ crossViewFacetDataObj: { formulaPanelIsOpen: _ } }, [me]],
                [{ uDF: { defaultFormulaPanelIsOpen: _ } }, [globalDefaults]]
            ],
            //"*displayUDFFormulaPanelKeypad": false,
            // UDF params
            enabled: [{ expanded: _ }, [me]] // override default value
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditor: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayKeypad: [{ myFacet: { displayUDFFormulaPanelKeypad: _ } }, [me]]
            }
        },
        { // default
            "class": o("UDFEditorDesign", "BlockMouseEvent", "GeneralArea", "MinWrap", "TrackMyFacet", "AboveSiblings"),
            context: {
                minWrapAround: [{ uDFPosConst: { editorMarginFromEmbedded:_ } }, [globalDefaults]]
            },
            position: {
                left: [{ uDFPosConst: { horizontalMarginAroundUDFEditor:_ } }, [globalDefaults]],
                right: [{ uDFPosConst: { horizontalMarginAroundUDFEditor:_ } }, [globalDefaults]],
                doNotExceedRightSideOfPane: {
                    point1: { type: "right" },
                    point2: { element: [{ myFacet: { myPane: _ } }, [me]], type: "right", content: true },
                    min: [{ uDFPosConst: { horizontalMarginAroundUDFEditor:_ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.strongerThanDefault
                },
                /*
                attachToFacetHeaderBottom: {
                    point1: { 
                        element: [
                                  { myFacet: [{ myFacet:_ }, [me]] },
                                  [areaOfClass, "FacetHeader"]
                                 ],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: [{ uDFPosConst: { editorOffsetFromFacetHeaderBottom:_ } }, [globalDefaults]]
                },                
                labelBottomWhenMinimized: {
                    point1: { 
                        element: [{ children: { inputFieldContainer:_ } }, [me]],
                        type: "bottom"
                    },
                    point2: { 
                        label: "bottomWhenMinimized"
                    },
                    equals: [{ uDFPosConst: { verticalMarginBelowInputField:_ } }, [globalDefaults]]
                }
                */
            },
            children: {
                inputFieldContainer: {
                    description: {
                        "class": "UDFEditorInputFieldContainer"
                    }
                },
                keypadExpansionControl: {
                    description: {
                        "class": "UDFEditorKeypadExpansionControl"
                    }
                },
                /*keypad: {
                    description: {
                        "class": "UDFEditorKeypad"
                    }
                }*/
            },
        },
        {
            qualifier: { displayKeypad: true },
            children: {
                keypad: {
                    description: {
                        "class": "UDFEditorKeypad"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyUDFEditor: o(
        { // variant-controller    
            qualifier: "!",
            context: {
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myUDFEditor: [
                    [embeddingStar, [me]],
                    [areaOfClass, "UDFEditor"]
                ],
                myUDF: [{ myUDFEditor: { myFacet: _ } }, [me]],
                myUDFController: [{ myUDF: { myUDFController: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorInputFieldContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedApplyButton: [and,
                    [{ inFocus: _ }, [me]],
                    [not, [areaOfClass, "InputFieldTypeAheadDropDownMenu"]]
                ]
            }
        },
        {
            "class": o("UDFEditorInputFieldContainerDesign", "GeneralArea", "TrackMyCalculatorController", "TrackMyFacet"),
            context: {
                height: [offset, { type: "top" }, { type: "bottom" }]
            },
            children: {
                equationSymbol: {
                    description: {
                        "class": "UDFEditorEquationSymbol"
                    }
                },
                inputField: {
                    description: {
                        "class": "UDFEditorInputField"
                    }
                }
            },
            position: {
                //right: [{ uDFPosConst: { editorMarginFromEmbedded:_ } }, [globalDefaults]],                        
                //left: [{ uDFPosConst: { editorMarginFromEmbedded:_ } }, [globalDefaults]],
                left: 0,
                right: 0,
                top: [{ uDFPosConst: { editorMarginFromEmbedded:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                typeAheadTextInput: false,
                inFocus: true
            },
            children: {
                applyButton: {
                    description: {
                        "class": "UDFEditorApplyButton"
                    }
                }
            }
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorEquationSymbol: {
        "class": o("UDFEditorEquationSymbolDesign", "CalculatorEquationSymbol", "TrackMyFacet")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorInputField: o(
        {
            "class": o("CalculatorInputField", "TrackMyFacet", "TrackMyUDFEditor"),
            context: {
                myCalculatorController: [{ myFacet: _ }, [me]]
            }
        },
        {
            qualifier: { typeAheadTextInput: true },
            children: {
                typeAheadTextInput: {
                    description: {
                        "class": "InputFieldTypeAheadTextInput"
                    }
                }
            }
        },
        {
            qualifier: { textInputEditedElsewhere: false },
            write: {
                onUDFEditorInputFieldCloseEvents: {
                    upon: o(
                        enterEvent,
                        // if we're busy reordering facets, then the UDF formula should be closed..
                        [{ iAmDraggedToReorder: true }, [areaOfClass, "Facet"]]
                    ),
                    true: {
                        closeFormulaPanel: {
                            to: [{ formulaPanelIsOpen: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorApplyButton: {
        "class": o("UDFEditorApplyButtonDesign", "ModifyPointerClickable", "AboveSiblings",
            "DisplayDimension", "TrackMyCalculatorController", "TrackMyFacet"), //"Tooltipable",   
        context: {
            displayText: [{ myApp: { saveStr: _ } }, [me]],
            //myScrollbar: [{ children: { inputField: { children: { inputFieldScrollbar: _ } } } }, [embedding]]
            myScollbar: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "InputFieldScrollbar"]
            ]
        },
        position: {
            //right: 5,
            bottom: 5,
            placeApplyButtonleftOfSideBar: {
                point1: { type: "right" },
                point2: { element: [{ myScollbar: _ }, [me]], type: "left" },
                equals: 5
            }
        }
        // write: {
        // onMouseClick: see the UDF's onUDFCalculateValue write handler, and specifically its clickHandledBy.
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorKeypadExpansionControl: {
        "class": o("UDFEditorKeypadExpansionControlDesign", "GeneralArea", "MinWrap", "TrackMyFacet"),
        context: {
            inputFieldContainer: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "UDFEditorInputFieldContainer"]
            ],
            minWrapAround: 0
        },
        position: {
            attachBelowInputFieldContainer: {
                point1: { element: [{ inputFieldContainer: _ }, [me]], type: "bottom" },
                point2: { type: "top" },
                equals: bFSAppFacetFormulaPanelPosConst.keyboardExpansionControlVerticalSpacing
            },
            left: 0,
            right: 0
        },
        children: {
            expansionController: {
                description: {
                    "class": o("TriangleExpansionController", "TrackMyFacet", "AboveSpecifiedAreas"),
                    context: {
                        isOpen: [{ myFacet: { displayUDFFormulaPanelKeypad: _ } }, [me]],
                        tooltipTextWhenOpened: "Close Keypad",
                        tooltipTextWhenClosed: "Open Keypad",
                        //leftArea: [{ children: { inputFieldContainer: _ } }, [embedding]],
                        areasBelowMe: [{ children: { curtainLine: _ } }, [embedding]]
                    },
                    position: {
                        "horizontal-center": 0,
                    }
                }
            },
            curtainLine: {
                description: {
                    "class": "Border",
                    context: {
                        borderWidth: [{ curtainLineWidth: _ }, [embedding]], //UDFEditorKeypadExpansionControlDesign
                        borderColor: [{ curtainLineColor: _ }, [embedding]], //UDFEditorKeypadExpansionControlDesign
                    },
                    position: {
                        "vertical-center": 0,
                        left: 0,
                        right: 0,
                        height: 1
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorKeypad: o(
        {
            // variant-controller
            qualifier: "!",
            context: {
                //displayKeypad: [{ displayKeypad: _ }, [embedding]]
            }
        },
        {   // default
            "class": o("CalculatorButtons", "TrackMyFacet"),
            context: {
                // CalculatorButtons params: 
                myCalculatorController: [{ myFacet: _ }, [me]],
                myExpansionController: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "UDFEditorKeypadExpansionControl"]
                ]
            },
            position: {
                "horizontal-center": 0,
                attachTopToBottomOfExpansionController: {
                    point1: {
                        element: [{ myExpansionController: _ }, [me]],
                        type: "bottom",
                    },
                    point2: { type: "top" },
                    equals: bFSAppFacetFormulaPanelPosConst.keyboardExpansionControlVerticalSpacing
                },
                //bottom: [{ uDFPosConst: { editorMarginFromEmbedded:_ } }, [globalDefaults]]
            },
            children: {
                /*
                numberAndOperandButtons: {
                    description: {
                        "class": "UDFEditorDigitAndOperandButtons"
                    }
                },*/
                functionButtons: {
                    description: {
                        "class": "UDFEditorFunctionButtons"
                    }
                },
                facetRefDropDown: {
                    description: {
                        "class": "UDFRefElementsDropDown"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFEditorFunctionButtons: {
        "class": o("TrackMyFacet", "Grid", "TrackMyCalculatorController"),
        context: {
            //Grid params:
            numberOfCellsInEachRow: 5,
            myGridCellData: o(
                "ln", "log10", "logb", "avg", "sum",
                "sqrt", "exp", "abs", "min", "max",
                [{ myCalculatorController: { timeFunctions: _ } }, [me]]
            ),
            //end of params
            horizontalSpacing: [{ uDFPosConst: { keypadButtonHorizontalSpacing:_ } }, [globalDefaults]],
            verticalSpacing: [{ uDFPosConst: { keypadButtonVerticalSpacing:_ } }, [globalDefaults]],
            minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure
        },
        children: {
            gridCells: {
                //data: defined in Grid via myGridCellData               
                description: {
                    "class": "UDFFunctionButton",
                }
            }
        },
        position: {
            top: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFFunctionButton: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstTimeButton: [equal, "year", [{ calcValue:_ }, [me]]]
            }
        },
        {
            "class": o("GridCell", "CalculatorButton"),
            context: {
                defaultFontSize: 12 // override CalculatorButton default value
            },
            position: {
                "content-height": [densityChoice, [{ uDFPosConst: { keypadButtonHeight:_ } }, [globalDefaults]]],
                "content-width": [densityChoice, [{ uDFPosConst: { keypadButtonWidth:_ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { timeButton: true },
            context: {
                displayText: [cond,
                    [{ calcValue: _ }, [me]],
                    o(
                        {
                            on: "year",
                            use: "year"
                        },
                        {
                            on: "quarter",
                            use: "qrtr"
                        },
                        {
                            on: "month",
                            use: "mon"
                        },
                        {
                            on: "dayOfMonth",
                            use: "mDay"
                        },
                        {
                            on: "dayOfWeek",
                            use: "wDay"
                        },
                        {
                            on: "hour",
                            use: "hour"
                        },
                        {
                            on: "minute",
                            use: "minute"
                        },
                        {
                            on: "second",
                            use: "sec"
                        }
                    )
                ]
            }
        },
        {
            qualifier: { firstTimeButton: true },
            context: {
                verticalSpacing: [mul, 
                    [{ uDFPosConst: { keypadButtonVerticalSpacing:_ } }, [globalDefaults]],
                    [{ uDFPosConst: { timeButtonsSectionVerticalMarginFactor:_ } }, [globalDefaults]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UDFRefElementsDropDown: {
        "class": o("UDFRefElementsDropDownDesign", "GeneralArea", "CalculatorRefElementsDropDown", "TrackMyFacet", "TrackMyUDFEditor"),
        context: {
            myCalculatorController: [{ myFacet: _ }, [embedding]],
            // CalculatorRefElementsDropDown params:
            calculatorRefElements: [{ myCalculatorController: { calculatorRefElements: _ } }, [me]],
            refElelementAboveMe: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "UDFEditorFunctionButtons"]
            ],

            dropDownMenuSearchBoxPlaceholderInputText: [concatStr, // DropDownMenu param
                o(
                    [{ myApp: { searchStr: _ } }, [me]],
                    [{ myApp: { facetEntityStrPlural: _ } }, [me]]
                ),
                " "
            ]
        },
        children: {
            // note: we rely here on the *names* of the children in the DropDownMenuable: 'menu' and its embedded areaSet, 'lines'.
            // not very robust cdl...
            menu: {
                description: {
                    children: {
                        dropDownMenuList: {
                            description: {
                                children: {
                                    lines: {
                                        description: {
                                            // override the definition of CalculatorRefElementUX in CalculatorRefElementsMenuLine with UDFRefElementUX
                                            "class": "UDFRefElementUX",
                                            context: {
                                                myUDFRefElement: [
                                                    { calculatorRefName: [{ name: _ }, [me]] },
                                                    [{ uDFRefElements: _ }, [me]]
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. uDFData: a writable ref to an os of objects describing the UDF facets
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddUDFControl: {
        "class": o("GeneralArea", "AppControl", "TrackMyUDFController"),
        context: {
            newUDFCounter: [{ myUDFController: { newUDFCounter: _ } }, [me]],
            defaultUDFObj: {
                uDF: true,
                udfCounter: [{ newUDFCounter: _ }, [me]],
                uniqueID: [concatStr, o(fsAppConstants.newFacetIDPrefix, [{ newUDFCounter: _ }, [me]])],
                name: [concatStr, o([{ myUDFController: { udfNamePrefix: _ } }, [me]], [{ newUDFCounter: _ }, [me]])]
            },
            newUDFObj: [{ defaultUDFObj: _ }, [me]]
        },
        write: {
            onAddUDFControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    incNewUDFCounter: {
                        to: [{ newUDFCounter: _ }, [me]],
                        merge: [plus, 1, [{ newUDFCounter: _ }, [me]]]
                    },
                    addNewUDFObj: {
                        to: [{ uDFData: _ }, [me]],
                        merge: o(
                            [{ uDFData: _ }, [me]],
                            [{ newUDFObj: _ }, [me]]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    AddUDFacetControl: {
        "class": o("GeneralArea", "AddUDFControl"),
        write: {
            onAddUDFacetControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    pushInReorderedFacetUniqueID: {
                        to: [{ myApp: { reorderedFacetUniqueID: _ } }, [me]],
                        merge: o(
                            [{ newUDFObj: { uniqueID: _ } }, [me]],
                            [{ myApp: { reorderedFacetUniqueID: _ } }, [me]]
                        )
                    },
                    pushInExpandedMovingFacetUniqueIDs: {
                        to: [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]],
                        merge: o(
                            [{ newUDFObj: { uniqueID: _ } }, [me]],
                            [{ myApp: { expandedMovingFacetUniqueIDs: _ } }, [me]]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. inheriting class should provide a DropDownMenu in the { createDropDownMenu: true } variant, per DropDownMenuable's API.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InputFieldTypeAheadTextInput: o(
        { // default
            "class": o("InputFieldTypeAheadTextInputDesign", "GeneralArea", "CalculatorInputElementCore", "TypeAheadTextInput", "TrackMyCalculatorController"),
            context: {
                inputFieldCursor: [
                    { myCalculatorInputField: [{ myCalculatorInputField: _ }, [me]] },
                    [areaOfClass, "CalculatorInputCursor"]
                ],

                // TypeAheadTextInput params:
                typeAheadDropDownMenuLogicalSelectionsOS: o(
                    [{ myCalculatorController: { functions: _ } }, [me]], // for now, function logical and display names are one and the same
                    [{ calculatorRefElements: { calculatorRefVal: _ } }, [me]]
                ),
                typeAheadDropDownMenuDisplaySelectionsOS: o(
                    [{ myCalculatorController: { functions: _ } }, [me]], // for now, function logical and display names are one and the same
                    [{ calculatorRefElements: { calculatorRefName: _ } }, [me]]
                ),
                immuneFromTurningOffEditInputOnMouseDown: [{ myCalculatorInputField: { inputFieldTypeAheadMenuAndEmbeddeStar: _ } }, [me]]
            },
            display: {
                text: {
                    value: [{ typeAheadTextInput: _ }, [me]] // this is how we initialize the TextInput's param.input.value 
                }
            },
            position: {
                matchCursorTop: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [{ inputFieldCursor: _ }, [me]],
                        type: "top"
                    },
                    equals: 0
                },
                matchCursorBottom: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ inputFieldCursor: _ }, [me]],
                        type: "bottom"
                    },
                    equals: 0
                },
                attachLeftToCursorRight: {
                    point1: {
                        element: [{ inputFieldCursor: _ }, [me]],
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
                onInputFieldTypeAheadTextInputEmpty: {
                    upon: [not, [{ textForAppData: _ }, [me]]],
                    true: {
                        resetTypeAheadTextInput: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: o()
                        }
                    }
                },
                onInputFieldTypeAheadTextInputChangedInput: {
                    upon: [and,
                        // we want to handle a change, only if it did not result in textForAppData emptying out - 
                        // that scenrio is handled by onInputFieldTypeAheadTextInputEmpty, above.
                        [{ textForAppData: _ }, [me]],
                        [changed, [{ textForAppData: _ }, [me]]]
                    ],
                    true: {
                        // we do this so that we maintain the state of the text of this area outside of it. that way, if the user deletes its content, 
                        // for example we can destroy the area.
                        copyTextForAppDataToTypeAheadTextInput: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: [{ textForAppData: _ }, [me]]
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
                menu: { // part of the DropDownMenuable API: adding 
                    description: {
                        "class": "InputFieldTypeAheadDropDownMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InputFieldTypeAheadDropDownMenu: {
        "class": "CalculatorRefElementsMenu",
        context: {
            showTopBorder: true,
            enableSearchBox: false,
            defaultDropDownMenuPositioningRight: false
        },
        position: {
            width: [{ calculator: { calculatorEditorTypeAheadMenuWidth: _ } }, [globalDefaults]]
        },
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "InputFieldTypeAheadDropDownMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InputFieldTypeAheadDropDownMenuLine: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofFunctionName: [
                    [{ uniqueID: _ }, [me]],
                    [{ myCalculatorController: { functions: _ } }, [me]]
                ],
                lastFunctionName: [and,
                    [{ ofFunctionName: _ }, [me]],
                    [not,
                        [{ ofFunctionName: _ }, [next, [me]]]
                    ]
                ],
                uniquelyMatchesTypedString: [{ myDropDownMenuable: { singleMatchForTextInput: _ } }, [me]],
            }
        },
        { // default 
            // override the definition of CalculatorRefElementUX in CalculatorRefElementsMenuLine with UDFRefElementUX
            "class": o("InputFieldTypeAheadDropDownMenuLineDesign", "UDFRefElementUX"),
            context: {
                myUDFRefElement: [
                    { calculatorRefName: [{ name: _ }, [me]] },
                    [{ uDFRefElements: _ }, [me]]
                ]
            },
            write: {
                onCalculatorInputButtonMouseClick: {
                    // upon: defined in CalculatorInputButton
                    true: {
                        clearTypeAheadTextInput: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { uniquelyMatchesTypedString: true },
            write: {
                onInputFieldTypeAheadKeyDownThatFollowsMatch: {
                    upon: [ // any key after singleMatchForTextInput is true
                        {
                            key: n("Backspace"), // if it's a backspace, we should delete a character from the string, and not enter it into the formula
                            type: "KeyDown",
                            recipient: "start"
                        },
                        [message]
                    ],
                    true: {
                        "class": "AddToExpressionActions",
                        clearTypeAheadTextInput: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofFunctionName: true },
            context: {
                // instead of providing myUDFRefElement, we provide newExpressionElement, per CalculatorInputButton's API
                newExpressionElement: [{ uniqueID: _ }, [me]]
            }
        }
    )
};
