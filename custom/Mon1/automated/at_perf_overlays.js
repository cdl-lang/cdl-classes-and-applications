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

// a valid set of URL params:
// at_myLeanZCApp.html?testName=overlayPerformance&nItems=1000&limitExpandedFacetsType=Slider&maxInitialNumFacetsExpanded=2&initialExpansionStateAllFacets=1&test=true

// variable definitions
var overlaysPerformanceParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 1000, // and with nItemsRequired items
    initialExpanionState: facetState.summary
};

// numer of overlays to be added in this performance test, per repetition of the test
// note this number is used in compile time, not run time!
var nNewOverlays = gArgParser.getArg('numNewOverlays', 20);

function addOverlayN(n) {
    var result = [];

    for (var i = 0; i < n; i++) {
        result.push(addNewIntensionalOverlay());
    }
    // switch last overlay edited out of edit mode by clicking elsewhere
    result.push(clickControl([areaOfClass, "EffectiveBaseCounter"]));

    return new MoonOrderedSet(result);
}

// the test
var overlayPerformance_test = o(
    dragAndDropSampleDataFile(),
    assertNFacets(overlaysPerformanceParam.nExpandedMovingFacets),
    assertNItems(overlaysPerformanceParam.nItemsRequired),
    assertInitialExpansionState(overlaysPerformanceParam.initialExpanionState),
    testInit,
    storeInto(
        [size, [areaOfClass, "PermIntExtOverlay"]],                                                 // record uniqueID of new overlay
        "initialNumOverlays"
    ),
    createTestRepetitions(
        [
            addOverlayN(nNewOverlays),
            // add initialNumOverlays for the number of overlays that the app loads with
            assertNOverlays([plus,
                nNewOverlays,
                [{ initialNumOverlays: _ }, [testStore]]
            ]),

            log("after adding X overlays"),
            resetApp()
        ],
        overlaysPerformanceParam.nTestRepetitions
    ),
    testFinish
);

