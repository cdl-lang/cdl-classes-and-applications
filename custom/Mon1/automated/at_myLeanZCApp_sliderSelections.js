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
var sliderSelectionsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

// the test
var sliderSelections_test = o(
    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            showOverlaySolutionSetView(primaryOverlay),
            assertSolutionSetItems(primaryOverlay),

            log("checking inputting abbreviated format numbers"),
            // checking that abbreviated format numbers can be entered:
            setSliderScaleEdgeValue(firstSliderFacet, "Max", "1K", 1000),
            setSliderScaleEdgeValue(firstSliderFacet, "Max", "2.5M", 2500000),
            setSliderScaleEdgeValue(firstSliderFacet, "Max", "0.5B", 500000000),
            resetSliderScaleEdgeValue(firstSliderFacet, "Max"),

            mouseDownControl(firstSliderHighValSelector),                                            // drag the highValSelector to the bottom
            assertOverlaySolutionSetSize(primaryOverlay, sliderSelectionsParam.nItemsRequired),      // verify the primary's transient solutionSet still equals the initial number of items
            mouseUpControlY(firstSliderContinuousRange, 1),
            log("after dragging the highVal selector to the bottom of the range"),
            assertSolutionSetItems(primaryOverlay),

            storeInto([{ solutionSetSize: _ }, primaryOverlay],
                "initStableSolutionSetSize"),                                                      // record solutionSetSize
            mouseDownControl(firstSliderHighValSelector),                                            // drag the highValSelector back to +inf
            assertOverlaySolutionSetSize(primaryOverlay,
                [{ initStableSolutionSetSize: _ }, [testStore]]), // verify the primary's transient solutionSet is same as prior to mouseDown 
            mouseUpControlY(firstSliderFacet, 0),
            log("after dragging the highVal selector to its original position"),
            assertOverlaySolutionSetSize(primaryOverlay, sliderSelectionsParam.nItemsRequired),      // verify the primary has the initial number of items
            assertSolutionSetItems(primaryOverlay),

            mouseDownControl(firstSliderLowValSelector),                                             // drag the lowValSelector to the top
            mouseUpControlY(firstSliderContinuousRange, 0),
            log("after dragging the lowVal selector to the top of the range"),
            assertSolutionSetItems(primaryOverlay),

            mouseDownControl(firstSliderLowValSelector),                                             // drag the lowValSelector back to -inf
            mouseUpControlY(firstSliderFacet, 1),
            log("after dragging the lowVal selector to its original position"),
            assertOverlaySolutionSetSize(primaryOverlay, sliderSelectionsParam.nItemsRequired),      // verify the primary has the initial number of items
            assertSolutionSetItems(primaryOverlay),

            // make an elastic selection in the primary overlay in the first slider facet
            mouseDownControlY(firstSliderContinuousRange, 0.25),
            mouseUpControlY(firstSliderContinuousRange, 0.75),
            log("after elastic selection of range between 25%-75%"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, true),        // verify that the selection of primary and first slider is not "any"
            assertSolutionSetItems(primaryOverlay),
            // codrag the two selectors on the continuous range to slider bottom
            mouseDownControl(firstSliderContinuousSelectedRange, "control"),
            mouseUpControlY(firstSliderContinuousRange, 1),
            log("after codragging selections to top half of range"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, true),        // verify that the selection of primary and first slider is not "any"
            assertSolutionSetItems(primaryOverlay),
            // codrag the two selectors on the continuous range to slider top
            mouseDownControl(firstSliderContinuousSelectedRange, "control"),
            mouseUpControlY(firstSliderContinuousRange, 0),
            log("after codragging selections to bottom half of range"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, true),        // verify that the selection of primary and first slider is not "any"
            assertSolutionSetItems(primaryOverlay),

            clickOverlayXWidgetControl(primaryOverlay, firstSliderFacet, "DeleteSelectionsControl"),
            log("after deleting both selections"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, false),       // verify that the selection of primary and first slider is "any"
            assertOverlaySolutionSetSize(primaryOverlay, sliderSelectionsParam.nItemsRequired),      // verify the primary has the initial number of items
            assertSolutionSetItems(primaryOverlay),
            // move selectors to both ends of the continuous range
            mouseDownControlY(firstSliderContinuousRange, 0.1),
            mouseUpControlY(firstSliderContinuousRange, 0.9),
            log("after elastic selection of 10th-90th %"),

            mouseMoveControl(firstSliderHighValSelection),                                           // move over the high val selection

            mouseDownControl([                                                                       // and mouseDown on its selection delete control
                { mySelection: firstSliderHighValSelection },
                [areaOfClass, "SelectionDeleteControl"]
            ]),
            mouseMoveControl(firstSliderLowValSelection),                                            // move over the low val selection
            mouseDownControl([                                                                       // and mouseDown on its selection delete control
                { mySelection: firstSliderLowValSelection },
                [areaOfClass, "SelectionDeleteControl"]
            ]),
            log("after deletion of selections one by one"),
            assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, false),       // verify that the selection of primary and first slider is "any"                           
            assertSolutionSetItems(primaryOverlay),
            resetApp()
        ],
        sliderSelectionsParam.nTestRepetitions
    ),
    testFinish
);
