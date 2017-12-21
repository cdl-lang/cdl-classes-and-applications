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


// function definitions: nothing for now

// variable definitions
var msSelectionsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 1,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

var firstMSFacetDiscreteValueNamesExpandableArea = [{ myFacet: firstMSFacet }, [areaOfClass, "DiscreteValueNamesExpandableArea"]];
var firstMSFacetDiscreteValueNamesExpandableAreaWidth = [offset,
    { element: firstMSFacetDiscreteValueNamesExpandableArea, type: "left" },
    { element: firstMSFacetDiscreteValueNamesExpandableArea, type: "right" }
];
var firstMSFacetValuesExpansionHandle = [{ myExpandable: firstMSFacetDiscreteValueNamesExpandableArea }, [areaOfClass, "ExpansionHandle1D"]];

// the test
var msSelections_test = o(
    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            //start of msSelections
            storeInto(primarySolutionSetSize, "primaryOverlayInitialSolutionSetSize"),

            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, false),                     // verify that the selection of primary and first msFacet is "any"
            assertOverlaySolutionSetSize(primaryOverlay, msSelectionsParam.nItemsRequired),                    // verify the primary has the initial number of items

            showOverlaySolutionSetView(primaryOverlay),                                                        // so that the amoebas are not maximized!

            // testing dragging of minimized facet to expansion and vice versa
            storeInto([size, [areaOfClass, "MovingFacet"]], "initialNumOfMovingFacets"),

            storeInto(firstMSFacetDiscreteValueNamesExpandableAreaWidth,
                "initialMSValuesNamesExpandableAreaWidth"),                                              // record initial offset
            log([concatStr, o("initial width of DiscreteValueNamesExpandableArea is ", [{ initialMSValuesNamesExpandableAreaWidth: _ }, [testStore]])]),
            mouseDownControl(firstMSFacetValuesExpansionHandle),
            mouseUpControlX([areaOfClass, "MovingFacetViewPane"], 0.5),
            storeInto(firstMSFacetDiscreteValueNamesExpandableAreaWidth,
                "expandedMSValuesNamesExpandableAreaWidth"),                                                // record larger offset
            log([concatStr, o("expanded width of DiscreteValueNamesExpandableArea is ", [{ expandedMSValuesNamesExpandableAreaWidth: _ }, [testStore]])]),
            assertTestVal(
                [greaterThan,
                    [minus, [{ expandedMSValuesNamesExpandableAreaWidth: _ }, [testStore]], [{ initialMSValuesNamesExpandableAreaWidth: _ }, [testStore]]],
                    0
                ],
                true,
                "Post Expansion of MSValuesView"),
            doubleClickControl(firstMSFacetValuesExpansionHandle),
            storeInto(firstMSFacetDiscreteValueNamesExpandableAreaWidth,
                "finalMSValuesNamesExpandableAreaWidth"),                                                // record larger offset
            log([concatStr, o("final width of DiscreteValueNamesExpandableArea is ", [{ finalMSValuesNamesExpandableAreaWidth: _ }, [testStore]])]),
            assertTestVal([{ initialMSValuesNamesExpandableAreaWidth: _ }, [testStore]],
                [{ finalMSValuesNamesExpandableAreaWidth: _ }, [testStore]],
                "MSValuesView reverted to its original width"),


            // we drag the *second* minimized MSFacet (this is an ugly hack - it turns out that the euroFundDB we use, with 100 items, the first
            // minimized facet has only one msValue in it, and we need at least two...ugly hack, i acknowledged already.
            dragFacetToExpansion(getMinimizedFacet(1, "MSFacet")),
            log("after dragging first minimized facet to leftmost position in moving facets view pane"),
            assertTestVal([plus, [{ initialNumOfMovingFacets: _ }, [testStore]], 1], // verify: number of moving facets grew by 1 
                [size, [areaOfClass, "MovingFacet"]],
                "Post Facet Expansion"),
            closeFacetAmoeba(getMovingFacet(0)),
            log("after closing amoeba of first moving facet"),
            dragFacetToMinimization(getMovingFacet(0)),
            log("after dragging first moving facet to topmost position in minimized facets view pane"),
            assertTestVal([{ initialNumOfMovingFacets: _ }, [testStore]], // verify: number of moving facets returned to baseline value
                [size, [areaOfClass, "MovingFacet"]],
                "Post Facet Minimization"),

            showOverlaySolutionSetView(primaryOverlay),
            assertSolutionSetItems(primaryOverlay),

            clickControl(secondValueInPrimaryAndFirstMSFacet),                                   // include the second value as the selection for the primary overlay
            log("after first including the second ms value of the first msFacet in the primary overlay"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, true),        // verify that the selection of primary and first msFacet  is not "any"
            storeInto(primarySolutionSetSize,
                "primaryOverlaySolutionSetSizeSelectionOfSecondValue"),                    // record solutionSetSize after first selection

            // minimize the msFacet and verify that the primary's solutionSet size is unaffected by that. then expand it. (in memoriam of #1702)
            selectionUnderFacetMinimizationReexpansion(firstMSFacet),
            assertSolutionSetItems(primaryOverlay),

            clickControl(firstValueInPrimaryAndFirstMSFacet),                                    // include the first value as the selection for the primary overlay
            log("after then including the first ms value of the first msFacet in the primary overlay"),
            storeInto(primarySolutionSetSize,                                                    // record solutionSetSize after first selection
                "primaryOverlaySolutionSetSizeSelectionOfSecondThenFirstValue"),
            assertSolutionSetItems(primaryOverlay),

            mouseMoveControlX(selectionAInPrimaryAndFirstMSFacet, 0.1), // move over the first msFacetSelection listed (second one added, first one alphabetically)
            clickControl(selectionAInPrimaryAndFirstMSFacetDeleteControl), // delete it by clicking on the delete button that appears when you hover over it
            log("after deleting the first ms value of the first msFacet in the primary overlay"),
            assertStoredVal({ primaryOverlaySolutionSetSizeSelectionOfSecondValue: _ }, primarySolutionSetSize),
            assertSolutionSetItems(primaryOverlay),

            mouseMoveControlX(selectionAInPrimaryAndFirstMSFacet, 0.1), // move over the remaining msFacetSelection listed (which is selectionA, after deletion of other selection)
            clickControl(selectionAInPrimaryAndFirstMSFacetDeleteControl),
            log("after deleting the second ms value of the first msFacet in the primary overlay - returned to Any"),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),
            assertSolutionSetItems(primaryOverlay),

            // add the first two values, this time the first value in the widget is added first, and the second one in the widget is added second
            clickControl(firstValueInPrimaryAndFirstMSFacet),                                    // include the first value as the selection for the primary overlay
            log("after first including the first ms value of the first msFacet in the primary overlay"),
            clickControl(secondValueInPrimaryAndFirstMSFacet),                                   // include the second value as the selection for the primary overlay
            log("after then including the second ms value of the first msFacet in the primary overlay"),
            assertStoredVal({ primaryOverlaySolutionSetSizeSelectionOfSecondThenFirstValue: _ },  // compare to the one obtained when selections were made in reverse
                primarySolutionSetSize),
            assertSolutionSetItems(primaryOverlay),

            clickOverlayXWidgetControl(primaryOverlay, firstMSFacet, "DisableSelectionsControl"),
            log("after disabling the selections"),
            assertSelectableFacetXIntOverlayDisabled(firstMSXPrimaryOverlay, true),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ },                          // compare to the initial solutionSetSize
                primarySolutionSetSize
            ),
            assertSolutionSetItems(primaryOverlay),

            clickControl([areaOfClass, "DisableSelectionsControl"]),                             // click on it again, to re-enable the selections
            log("after re-enabling the selections"),
            assertStoredVal({ primaryOverlaySolutionSetSizeSelectionOfSecondThenFirstValue: _ },  // compare to the solutionSetSize prior to the disabling operation
                primarySolutionSetSize),
            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, true),        // verify that the selection of primary and first msFacet is NOT "any"
            assertSolutionSetItems(primaryOverlay),

            clickControl([areaOfClass, "DeleteSelectionsControl"]),                             // delete all selections in the facet-overlay
            log("after deleting all selections"),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ },                          // compare to the initial solutionSetSize
                primarySolutionSetSize),
            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, false),       // verify that the selection of primary and first msFacet is "any"
            assertSolutionSetItems(primaryOverlay),

            // switch to exclusion mode                                         
            toggleOverlayXWidgetInclusionExclusionMode(primaryOverlay, firstMSFacet),
            log("after switching primary overlay in msFacet to exclusion mode"),

            clickControl(secondValueInPrimaryAndFirstMSFacet),                                   // *exclude* the second value as the selection for the primary overlay
            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, true),        // verify that the selection of primary and first msFacet is NOT "any"
            log("after excluding second msValue of the first msFacet"),
            // calculate the initial solutionSetSize minus the size of the solutionSet defined by selecting the second msValue
            // this should equal the current solutionSetsize, as it is the result of excluding that msValue
            assertTestVal([minus,
                [{ primaryOverlayInitialSolutionSetSize: _ }, [testStore]],
                [{ primaryOverlaySolutionSetSizeSelectionOfSecondValue: _ }, [testStore]]
            ],
                primarySolutionSetSize,
                "BaseSet Excluding Single MSValue"),
            assertSolutionSetItems(primaryOverlay),

            clickControl(secondValueInPrimaryAndFirstMSFacet),                                   // remove the exclusion of the second ms value
            log("after removing the exclusion of the second msValue of the first msFacet"),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ },                          // compare to the initial solutionSetSize
                primarySolutionSetSize),
            assertSelectableFacetXIntOverlaySelectionsMade(firstMSXPrimaryOverlay, false),       // verify that the selection of primary and first msFacet is "any"
            assertSolutionSetItems(primaryOverlay),

            // switch back to inclusion mode (to allow repetitions of this loop)
            toggleOverlayXWidgetInclusionExclusionMode(primaryOverlay, firstMSFacet),
            log("after switching msFacet back to inclusion mode"),
            //end of msSelections
            resetApp()
        ],
        msSelectionsParam.nTestRepetitions
    ),
    testFinish
);
