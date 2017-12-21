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

////////////////////////////////////////////////////////////////////////////
// Classes supporting the measure functionality used in histograms and elsewhere.
////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // the measure pair AD resides here, and not in the histogram.
    // the reason is that DiscreteFacets rely on measure-related calculations
    // to support sorting of the discrete values by their frequency in a given overlay, even when there is no histogram on display
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MeasurePairInFacet: {
        "class": o("GeneralArea", "TrackMyFacet"),
        context: {
            dataObj: [{ param: { areaSetContent: _ } }, [me]],
            uniqueID: [{ dataObj: { uniqueID: _ } }, [me]],
            myMeasureFunctionUniqueID: [mergeWrite,
                [{ dataObj: { myMeasureFunctionUniqueID: _ } }, [me]],
                [cond,
                    [{ ofDateFacet: _ }, [me]],
                    o({ on: false, use: functionID.percent }, { on: true, use: functionID.count })
                ]
            ],
            myMeasureFacetUniqueID: [mergeWrite,
                [{ dataObj: { myMeasureFacetUniqueID: _ } }, [me]],
                // if the measureFunction is the Percent function, the default value for the measureFacet should be measureFacetCountDistribution.
                // if it is the Count function, it should be myFacetUniqueID - i.e. the id of the hosting facet itself.
                // otherwise, it should be o() (which would result int the measureFacet dropDown displaying the "Select Facet" prompt)
                [cond,
                    [{ myMeasureFunctionUniqueID: _ }, [me]],

                    o(
                        { on: functionID.percent, use: measureFacetCountDistribution },
                        { on: functionID.count, use: [{ myFacetUniqueID: _ }, [me]] },
                        { on: null, use: o() }
                    )
                ]
            ],

            countMeasureFunctionSelected: [equal,
                [{ myMeasureFunctionUniqueID: _ }, [me]],
                functionID.count
            ],
            percentMeasureFunctionSelected: [equal,
                [{ myMeasureFunctionUniqueID: _ }, [me]],
                functionID.percent
            ],
            countDistributionMeasureFacetSelected: [equal,
                [{ myMeasureFacetUniqueID: _ }, [me]],
                measureFacetCountDistribution
            ],

            countMeasureCountsMyItems: [and,
                [{ countMeasureFunctionSelected: _ }, [me]],
                [equal,
                    [{ uniqueID: _ }, [me]],
                    [{ myMeasureFacetUniqueID: _ }, [me]]
                ]
            ],

            myMeasureFacetDataObj: [
                {
                    uniqueID: [{ myMeasureFacetUniqueID: _ }, [me]],
                    trashed: false
                },
                [{ myApp: { facetData: _ } }, [me]]
            ],

            myMeasureFacetIsValid: o(
                // true when either the countDistributionMeasureFacetSelected is true,
                // or when there is a valid myMeasureFacetDataObj (note the Facet itself doesn't necessarily have to be visible, therefore may not exist!)
                // note that for this latter part, we couldn't simply settle for checking that myMeasureFacetUniqueID is true, as it may store 
                // the value of a by-now-trashed facet.
                [{ countDistributionMeasureFacetSelected: _ }, [me]],
                [{ myMeasureFacetDataObj: _ }, [me]]
            ),

            myMeasureFacetIsAUDF: [
                [{ myMeasureFacetUniqueID: _ }, [me]],
                [{ myApp: { uDFData: { uniqueID: _ } } }, [me]]
            ],

            // if the measure facet is a UDF, the question is whether we want to apply measureFunction(UDF values) or the other way around, i.e.
            // uDFFormula(measureFunction applied to its elements).
            // an example: define CTR = installs/clicks.
            // when we look at sum CTR, we will get the sum of the CTR values per bin.
            // when we look at CTR of sum, we want to look at sum(installs)/sum(clicks).
            // so when aggregating CTR, we'd want the latter definition 
            // there are of course examples where you want the former: 
            // if a winery has a facet price-per-bottle, and another called quantity, then we define a transaction = price-per-bottle * quantity.
            // when we aggregate this we want to get the sum of the transaction values, and not the (sum (price-per-bottle)) * (sum (quantity))
            uDFMeasureFacetAppliedToMeasureFunction: [and,
                [{ myMeasureFacetDataObj: { uDFAppliedToAggregationFunction: _ } }, [me]],
                [{ myMeasureFacetIsAUDF: _ }, [me]]
            ],

            firstMeasurePairInFacet: o(
                [equal, // either it represents the MeasurePairInFacet of the first histogram in the reordering of histograms.
                    [{ uniqueID: _ }, [me]],
                    [first, [{ myFacet: { currentViewFacetDataObj: { reorderedHistogramUniqueIDs: _ } } }, [me]]]
                ],
                [and, // or, if there are no reordered histograms yet, it would be the counter of the default histogram
                    [not, [{ myFacet: { currentViewFacetDataObj: { reorderedHistogramUniqueIDs: _ } } }, [me]]],
                    [equal,
                        [{ uniqueID: _ }, [me]],
                        fsAppConstants.firstHistogramUniqueIDCounter
                    ]
                ]
            )
        },
        children: {
            measureOverlays: {
                data: [identify,
                    { uniqueID: _ },
                    o(
                        [{ myApp: { effectiveBaseOverlay: _ } }, [me]],
                        [{ myApp: { zoomBoxedOverlays: _ } }, [me]]
                    )
                ],
                description: {
                    "class": "OverlayMeasurePairInFacet"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myMeasurePairInFacet: an areaRef
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMeasurePairInFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                myMeasureFacetUniqueID: [{ myMeasurePairInFacet: { myMeasureFacetUniqueID: _ } }, [me]],
                myMeasureFunctionUniqueID: [{ myMeasurePairInFacet: { myMeasureFunctionUniqueID: _ } }, [me]],

                myMeasureFacetDataObj: [{ myMeasurePairInFacet: { myMeasureFacetDataObj: _ } }, [me]],
                myMeasureFacetIsValid: [{ myMeasurePairInFacet: { myMeasureFacetIsValid: _ } }, [me]],
                countMeasureFunctionSelected: [{ myMeasurePairInFacet: { countMeasureFunctionSelected: _ } }, [me]],
                percentMeasureFunctionSelected: [{ myMeasurePairInFacet: { percentMeasureFunctionSelected: _ } }, [me]],
                countDistributionMeasureFacetSelected: [{ myMeasurePairInFacet: { countDistributionMeasureFacetSelected: _ } }, [me]],
                countMeasureCountsMyItems: [{ myMeasurePairInFacet: { countMeasureCountsMyItems: _ } }, [me]],

                myMeasureFacetIsAUDF: [{ myMeasurePairInFacet: { myMeasureFacetIsAUDF: _ } }, [me]],

                uDFAppliedToAggregationFunction: [{ myMeasureFacetDataObj: { uDFAppliedToAggregationFunction: _ } }, [me]],
                uDFMeasureFacetAppliedToMeasureFunction: [and,
                    [{ myMeasureFacetIsAUDF: _ }, [me]],
                    [{ uDFAppliedToAggregationFunction: _ }, [me]]
                ]
            }
        },
        { // default
            "class": "TrackMyFacet",
            context: {
                myMeasurePairInFacetDataObj: [{ myMeasurePairInFacet: { dataObj: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: once we have multiple histograms per facet, this area will have to represent not merely an overlay in a facet, but an overlayXmeasure in a facet!
    //
    // This class creates an os of objects which include various counts per value (discrete or range) of several itemSets pertaining to an overlay.
    // This is embedded in the Facet, and not in the OverlayXWidget as the latter may not exist (if the selectors are hidden from view)
    // API:
    // 1. the Associated facet should define valuesForMeasure: 
    //    the discrete values and/or range values for which we want the measureFacet/function to be calculated.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMeasurePairInFacet: o(
        { // default
            "class": o("GeneralArea", "TrackMyFacet", "TrackMySelectableFacetXIntOverlay", "TrackMeasurePairInFacet", "TrackMyOverlay"),
            context: {
                myOverlay: [{ param: { areaSetContent: _ } }, [me]],

                myMeasurePairInFacet: [embedding],
                myMeasurePairInFacetUniqueID: [{ myMeasurePairInFacet: { uniqueID: _ } }, [me]],
                // ValueMeasureCoreOS param
                functionUniqueIDForValueMeasureCore: [{ myMeasureFunctionUniqueID: _ }, [me]],

                // for calculating the scale of a histogram in distribution (Percent) mode:
                // we sum all the positive valInStableSolutionSetMeasureVal, and we sum all the negative valInStableSolutionSetMeasureVal
                // these two values will be used in calculating the "100%". not sure just yet which approach will prevail. a few options:
                // 1. the max of these two figures will be the 100%. this ensures all bars will be <=100%, but they won't add up to 100%.
                // 2. each set of values of equal sign (all negative values, and all positive values) will constitute its own 100%. so such a histogram
                //    of mixed sign bars in Percent mode will actually add up to 200%: 100% for the positive bars, 100% for the negative bars.
                sumValueMeasurePositiveStableVals: [sum, // referenced by HistogramBar in distribution mode
                    [
                        {
                            positiveStableMeasureVal: true,
                            valInStableSolutionSetMeasureVal: _
                        },
                        [{ valueMeasureCore: _ }, [me]]
                    ]
                ],
                sumValueMeasureNegativeStableVals: [abs, // we want the absolute value here!
                    [sum, // referenced by HistogramBar in distribution mode
                        [
                            {
                                positiveStableMeasureVal: false,
                                valInStableSolutionSetMeasureVal: _
                            },
                            [{ valueMeasureCore: _ }, [me]]
                        ]
                    ]
                ],

                sumValueMeasurePositiveVals: [sum,
                    [
                        {
                            positiveMeasureVal: true,
                            valInSolutionSetMeasureVal: _
                        },
                        [{ valueMeasureCore: _ }, [me]]
                    ]
                ],
                sumValueMeasureNegativeVals: [abs, // we want the absolute value here!
                    [sum,
                        [
                            {
                                positiveMeasureVal: false,
                                valInSolutionSetMeasureVal: _
                            },
                            [{ valueMeasureCore: _ }, [me]]
                        ]
                    ]
                ],

                valueMeasure: [map,
                    [defun,
                        "obj",
                        [merge,
                            "obj",
                            {
                                measureDistributionInSolutionSet: [
                                    rawPercentage,
                                    [{ valInSolutionSetMeasureVal: _ }, "obj"],
                                    [defineHistogramOneHundredPercent,
                                        [{ positiveMeasureVal: _ }, "obj"],
                                        [{ sumValueMeasurePositiveVals: _ }, [me]],
                                        [{ sumValueMeasureNegativeVals: _ }, [me]]
                                    ]
                                ],
                                measureDistributionInStableSolutionSet: [
                                    rawPercentage,
                                    [{ valInStableSolutionSetMeasureVal: _ }, "obj"],
                                    [defineHistogramOneHundredPercent,
                                        [{ positiveStableMeasureVal: _ }, "obj"],
                                        [{ sumValueMeasurePositiveStableVals: _ }, [me]],
                                        [{ sumValueMeasureNegativeStableVals: _ }, [me]]
                                    ]
                                ]
                            }
                        ]
                    ],
                    [{ valueMeasureCore: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { uDFMeasureFacetAppliedToMeasureFunction: false },
            "class": "ValueMeasureCoreOS",
            context: {
                // ValueMeasureCoreOS param
                facetUniqueIDForValueMeasureCore: [{ myMeasureFacetUniqueID: _ }, [me]]
            }
        },
        {
            qualifier: { uDFMeasureFacetAppliedToMeasureFunction: true },
            context: {
                myUDFacetClipper: [
                    { uniqueID: [{ myMeasureFacetUniqueID: _ }, [me]] },
                    [areaOfClass, "UDFacetClipper"]
                ],
                myOverlayMeasurePairInFacetOfUDFMeasureFacetElements: [{ children: { auxOfUDFMeasureFacet: _ } }, [me]],

                uDFElementsForValMeasureCore: [map,
                    [defun,
                        o("val"),
                        [using,
                            // beginning of using definitions
                            "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements",
                            [
                                { value: "val" },
                                [{ myOverlayMeasurePairInFacetOfUDFMeasureFacetElements: { valueMeasureCoreOfUDFMeasureElement: _ } }, [me]]
                            ],
                            // end of using definitions
                            {
                                value: "val",
                                valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements: "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements", // debug only!
                                solutionSetMeasureValObj: [merge,
                                    [identify,
                                        true, // providing all elements the same identity (true), so that a merge can take effect
                                        [{ solutionSetMeasureValAVP: _ }, "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements"]
                                    ]
                                ],
                                stableSolutionSetMeasureValObj: [merge,
                                    [identify,
                                        true, // providing all elements the same identity (true), so that a merge can take effect
                                        [{ stableSolutionSetMeasureValAVP: _ }, "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements"]
                                    ]
                                ],
                                implicit1DSetMeasureValObj: [merge,
                                    [identify,
                                        true, // providing all elements the same identity (true), so that a merge can take effect
                                        [{ implicit1DSetMeasureValAVP: _ }, "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements"]
                                    ]
                                ],
                                stableImplicit1DSetMeasureValObj: [merge,
                                    [identify,
                                        true, // providing all elements the same identity (true), so that a merge can take effect
                                        [{ stableImplicit1DSetMeasureValAVP: _ }, "valueMeasureCoreOfUDFMeasureElementOfValInAllUDFElements"]
                                    ]
                                ]
                            }
                        ]
                    ],
                    [{ myFacet: { valuesForMeasure: _ } }, [me]]
                ],

                valueMeasureCore: [map,
                    [defun,
                        o("val"),
                        [using,
                            "valInUDFElementsForValMeasureCore",
                            [{ value: "val" }, [{ uDFElementsForValMeasureCore: _ }, [me]]],
                            "valInSolutionSetMeasureVal",
                            [evaluateFormula,
                                [{ myUDFacetClipper: { cellExpressionFormula: _ } }, [me]],
                                [{ solutionSetMeasureValObj: _ }, "valInUDFElementsForValMeasureCore"]
                            ],
                            "valInStableSolutionSetMeasureVal",
                            [evaluateFormula,
                                [{ myUDFacetClipper: { cellExpressionFormula: _ } }, [me]],
                                [{ stableSolutionSetMeasureValObj: _ }, "valInUDFElementsForValMeasureCore"]
                            ],
                            "valInImplicit1DSetItemMeasureVal",
                            [evaluateFormula,
                                [{ myUDFacetClipper: { cellExpressionFormula: _ } }, [me]],
                                [{ implicit1DSetMeasureValObj: _ }, "valInUDFElementsForValMeasureCore"]
                            ],
                            "valInStableImplicit1DSetItemMeasureVal",
                            [evaluateFormula,
                                [{ myUDFacetClipper: { cellExpressionFormula: _ } }, [me]],
                                [{ stableImplicit1DSetMeasureValObj: _ }, "valInUDFElementsForValMeasureCore"]
                            ],
                            "positiveMeasureVal",
                            [greaterThanOrEqual, "valInSolutionSetMeasureVal", 0],
                            "positiveStableMeasureVal",
                            [greaterThanOrEqual, "valInStableSolutionSetMeasureVal", 0],
                            {
                                value: "val",
                                positiveMeasureVal: "positiveMeasureVal",
                                positiveStableMeasureVal: "positiveStableMeasureVal",
                                valInSolutionSetMeasureVal: "valInSolutionSetMeasureVal",
                                valInStableSolutionSetMeasureVal: "valInStableSolutionSetMeasureVal",
                                valInImplicit1DSetItemMeasureVal: "valInImplicit1DSetItemMeasureVal",
                                valInStableImplicit1DSetItemMeasureVal: "valInStableImplicit1DSetItemMeasureVal"
                            }
                        ]
                    ],
                    [{ myFacet: { valuesForMeasure: _ } }, [me]]
                ]
            },
            children: {
                auxOfUDFMeasureFacet: {
                    data: [{ myUDFacetClipper: { directlyDefiningFacetUniqueIDs: _ } }, [me]],
                    description: {
                        "class": "OverlayMeasurePairInFacetOfUDFMeasureFacetElement"
                    }
                }
            }
        },
        {
            qualifier: {
                ofMSFacet: true,
                ofZoomBoxedOverlay: true
            },
            "class": "MSSortable",
            context: {
                // MSSortable param
                sortableUniqueID: [{ myOverlay: { uniqueID: _ } }, [me]],
                defaultSortingDirection: "descending", // the first click on this sorter should sort "descending" - that's the more interesting frequency sort
                // note we add to nextSortingKey another identifier: that of the MeasurePairInFacet, which is what essentially identifies the histogram in
                // the facet.
                // the currentSortingKey is also refined to select by the value of myMeasurePairInFacetUniqueID, out of the defaultCurrentSortingKey.
                // this ensures that sortingByMe, defined in Sortable works as intended.
                currentSortingKey: [
                    { myMeasurePairInFacetUniqueID: [{ myMeasurePairInFacetUniqueID: _ }, [me]] },
                    [{ defaultCurrentSortingKey: _ }, [me]]
                ],
                nextSortingKey: [merge,
                    { myMeasurePairInFacetUniqueID: [{ myMeasurePairInFacetUniqueID: _ }, [me]] },
                    [{ defaultNextSortingKey: _ }, [me]]
                ],

                refreshMySorting: [and,
                    [{ sortingByMe: _ }, [me]],
                    [{ myFacet: { selectionsChangedWhileSortingByOverlayFrequency: _ } }, [me]],
                    o( // if we change the selection while sorting by overlay frequency, but then change the selections back, 
                        // then neither one of these notEqual expressions will be true, and so there would be no need to refresh the sorting
                        [notEqual,
                            [{ myFacet: { includedOnLastSort: _ } }, [me]],
                            [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { included: _ } } }, [me]]
                        ],
                        [notEqual,
                            [{ myFacet: { excludedOnLastSort: _ } }, [me]],
                            [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { excluded: _ } } }, [me]]
                        ]
                    )
                ]
            }
        },
        {
            qualifier: {
                ofMSFacet: true,
                ofZoomBoxedOverlay: true,
                refreshMySorting: true
            },
            context: {
                // if the sorting needs to be refreshed, the next click on the sorting UX shouldn't flip the direction of sorting!
                nextSortingDirection: [{ sortingDirection: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. facetUniqueIDForValueMeasureCore
    // 2. functionUniqueIDForValueMeasureCore
    // 3. myOverlay
    // 4. myFacet: default provided by TrackMyFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValueMeasureCoreOS: {
        "class": o("TrackMyFacet", "TrackMySelectableFacetXIntOverlay"),
        context: {
            selectionQueryFuncOfFacetUniqueIDForValueMeasureCore: [constructSelectionQueryFunc,
                [{ facetUniqueIDForValueMeasureCore: _ }, [me]]
            ],
            numericSelectionQueryForValueMeasureCore: [
                [{ selectionQueryFuncOfFacetUniqueIDForValueMeasureCore: _ }, [me]],
                r(-Number.MAX_VALUE, Number.MAX_VALUE)
            ],
            numericSolutionSetItems: [
                [{ numericSelectionQueryForValueMeasureCore: _ }, [me]],
                [{ myOverlay: { solutionSetItems: _ } }, [me]]
            ],
            numericStableSolutionSetItems: [
                [{ numericSelectionQueryForValueMeasureCore: _ }, [me]],
                [{ myOverlay: { stableSolutionSetItems: _ } }, [me]]
            ],
            numericImplicit1DSetItems: [
                [{ numericSelectionQueryForValueMeasureCore: _ }, [me]],
                [{ implicit1DSetItems: _ }, [me]]
            ],
            numericStableImplicit1DSetItems: [
                [{ numericSelectionQueryForValueMeasureCore: _ }, [me]],
                [{ stableImplicit1DSetItems: _ }, [me]]
            ],

            // valueMeasure are used both in histograms (to determine its scale), and in sorting discreteValues by their frequency in an overlay's solutionSet
            // (the sorting arrow next to the overlayLegend in the OverlayXWidget), which is essentially the same thing.
            valueMeasureCore: [map,
                [defun,
                    o("val"),
                    [using,
                        // beginning of using
                        "valSubsetOfSolutionSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ myOverlay: { solutionSetItems: _ } }, [me]]
                        ],
                        "valNumericSubsetOfSolutionSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ numericSolutionSetItems: _ }, [me]]
                        ],
                        // measures related to the discrete value in the subset of the solutionSetItems/stableSolutionSetItems that contains it (in this facet!)
                        "valInSolutionSetMeasure",
                        [
                            // takes three parameters: 
                            // an itemSet and its numeric subset (see comment in applyMeasure regarding the computational motivation for this) 
                            // and the uniqueID of the facet for which we calculate the measure
                            [{ myFacet: { applyMeasure: _ } }, [me]],
                            "valSubsetOfSolutionSetItems",
                            "valNumericSubsetOfSolutionSetItems",
                            [{ facetUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ functionUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ myFacetUniqueID: _ }, [me]]
                        ],
                        "valInSolutionSetMeasureVal",
                        [{ val: _ }, "valInSolutionSetMeasure"],
                        "valSubsetOfStableSolutionSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ myOverlay: { stableSolutionSetItems: _ } }, [me]]
                        ],
                        "valNumericSubsetOfStableSolutionSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ numericStableSolutionSetItems: _ }, [me]]
                        ],
                        "valInStableSolutionSetMeasure",
                        [
                            // takes three parameters: 
                            // an itemSet and its numeric subset (see comment in applyMeasure regarding the computational motivation for this) 
                            // and the uniqueID of the facet for which we calculate the measure
                            [{ myFacet: { applyMeasure: _ } }, [me]],
                            "valSubsetOfStableSolutionSetItems",
                            "valNumericSubsetOfStableSolutionSetItems",
                            [{ facetUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ functionUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ myFacetUniqueID: _ }, [me]]
                        ],

                        "valInStableSolutionSetMeasureVal",
                        [{ val: _ }, "valInStableSolutionSetMeasure"],

                        "positiveMeasureVal",
                        [greaterThanOrEqual, "valInSolutionSetMeasureVal", 0],
                        "positiveStableMeasureVal",
                        [greaterThanOrEqual, "valInStableSolutionSetMeasureVal", 0],

                        "valSubsetOfImplicit1DSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ implicit1DSetItems: _ }, [me]] // defined by TrackMySelectableFacetXIntOverlay
                        ],
                        "valNumericSubsetOfImplicit1DSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ numericImplicit1DSetItems: _ }, [me]]
                        ],
                        // measures related to the discrete value in the subset of the associated stableImplicit1DSetItems that contains it (in this facet!)
                        "valInImplicit1DSetItemMeasure",
                        [
                            // takes three parameters: 
                            // an itemSet and its numeric subset (see comment in applyMeasure regarding the computational motivation for this) 
                            // and the uniqueID of the facet for which we calculate the measure
                            [{ myFacet: { applyMeasure: _ } }, [me]],
                            "valSubsetOfImplicit1DSetItems",
                            "valNumericSubsetOfImplicit1DSetItems",
                            [{ facetUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ functionUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ myFacetUniqueID: _ }, [me]]
                        ],
                        "valInImplicit1DSetItemMeasureVal",
                        [{ val: _ }, "valInImplicit1DSetItemMeasure"],
                        "valInImplicit1DSetItemMeasureCount",
                        [{ count: _ }, "valInImplicit1DSetItemMeasure"],

                        "valSubsetOfStableImplicit1DSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ stableImplicit1DSetItems: _ }, [me]] // defined by TrackMySelectableFacetXIntOverlay
                        ],
                        "valNumericSubsetOfStableImplicit1DSetItems",
                        [
                            [{ myFacet: { valueSubsetInItemSet: _ } }, [me]],
                            "val",
                            [{ numericStableImplicit1DSetItems: _ }, [me]]
                        ],
                        // measures related to the discrete value in the subset of the associated stableImplicit1DSetItems that contains it (in this facet!)
                        "valInStableImplicit1DSetItemMeasure",
                        [
                            // takes three parameters: 
                            // an itemSet and its numeric subset (see comment in applyMeasure regarding the computational motivation for this) 
                            // and the uniqueID of the facet for which we calculate the measure
                            [{ myFacet: { applyMeasure: _ } }, [me]],
                            "valSubsetOfStableImplicit1DSetItems",
                            "valNumericSubsetOfStableImplicit1DSetItems",
                            [{ facetUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ functionUniqueIDForValueMeasureCore: _ }, [me]],
                            [{ myFacetUniqueID: _ }, [me]]
                        ],
                        "valInStableImplicit1DSetItemMeasureVal",
                        [{ val: _ }, "valInStableImplicit1DSetItemMeasure"],
                        "valInStableImplicit1DSetItemMeasureCount",
                        [{ count: _ }, "valInStableImplicit1DSetItemMeasure"],

                        // end of 'using' definitions

                        // the object returned by the function:
                        {
                            overlayUniqueID: [{ myOverlay: { uniqueID: _ } }, [me]],
                            value: "val",
                            // in addition to the "value" attribute, we calculate the displayValue, which could differ, for example, for 
                            // facets such as a calculated Month/Quarter/WeekDay. when exporting to the histogram, for example, we rely on these values.                            
                            displayValue: [cond,
                                [{ ofUDFCalculatesQuarter: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [convertNumToQuarter, "val"]
                                    },
                                    {
                                        on: false,
                                        use: [cond,
                                            [{ ofUDFCalculatesMonth: _ }, [me]],
                                            o(
                                                {
                                                    on: true,
                                                    use: [convertNumToMonth, "val"]
                                                },
                                                {
                                                    on: false,
                                                    use: [cond,
                                                        [{ ofDFCalculatesWeekDay: _ }, [me]],
                                                        o(
                                                            {
                                                                on: true,
                                                                use: [convertNumToWeekDay, "val"]
                                                            },
                                                            {
                                                                on: false,
                                                                use: "val"
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ],
                            positiveMeasureVal: "positiveMeasureVal",
                            positiveStableMeasureVal: "positiveStableMeasureVal",
                            valInSolutionSetMeasureVal: "valInSolutionSetMeasureVal",
                            valInStableSolutionSetMeasureVal: "valInStableSolutionSetMeasureVal",
                            valInImplicit1DSetItemMeasureVal: "valInImplicit1DSetItemMeasureVal",
                            valInStableImplicit1DSetItemMeasureVal: "valInStableImplicit1DSetItemMeasureVal"
                        }
                    ]
                ],
                [{ myFacet: { valuesForMeasure: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMeasurePairInFacetOfUDFMeasureFacetElement: {
        "class": o("GeneralArea", "ValueMeasureCoreOS"),
        context: {
            myOverlay: [{ myOverlay: _ }, [embedding]],
            myMeasureFacetElementUniqueID: [{ param: { areaSetContent: _ } }, [me]],
            // ValueMeasureCoreOS param
            facetUniqueIDForValueMeasureCore: [{ myMeasureFacetElementUniqueID: _ }, [me]],
            functionUniqueIDForValueMeasureCore: [{ functionUniqueIDForValueMeasureCore: _ }, [embedding]],

            valueMeasureCoreOfUDFMeasureElement: [map,
                [defun,
                    "obj",
                    [merge,
                        "obj",
                        {
                            solutionSetMeasureValAVP: [constructAVP,
                                [{ myMeasureFacetElementUniqueID: _ }, [me]],
                                [{ valInSolutionSetMeasureVal: _ }, "obj"]
                            ],
                            stableSolutionSetMeasureValAVP: [constructAVP,
                                [{ myMeasureFacetElementUniqueID: _ }, [me]],
                                [{ valInStableSolutionSetMeasureVal: _ }, "obj"]
                            ],
                            implicit1DSetMeasureValAVP: [constructAVP,
                                [{ myMeasureFacetElementUniqueID: _ }, [me]],
                                [{ valInImplicit1DSetItemMeasureVal: _ }, "obj"]
                            ],
                            stableImplicit1DSetMeasureValAVP: [constructAVP,
                                [{ myMeasureFacetElementUniqueID: _ }, [me]],
                                [{ valInStablwImplicit1DSetItemMeasureVal: _ }, "obj"]
                            ]
                        }
                    ]
                ],
                [{ valueMeasureCore: _ }, [me]]
            ]
        }
    }
};