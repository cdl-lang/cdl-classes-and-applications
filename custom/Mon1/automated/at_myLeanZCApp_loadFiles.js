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
var loadFilesParam = {
    nTestRepetitions: 2,//nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

// the test
var loadFiles_test = o(
    testInit,

    dragAndDropSampleDataFile(),

    storeInto(primarySolutionSetSize, "primaryOverlayInitialSolutionSetSize"),

    mouseDownControl(firstSliderHighValSelector),
    mouseUpControlY(firstSliderContinuousRange, 0.5),
    log("after dragging the highVal selector to the bottom of the range"),

    assertSelectableFacetXIntOverlaySelectionsMade(firstSliderXPrimaryOverlay, true),
    log("after checking that a selection was made"),

    clickOverlayXWidgetControl(primaryOverlay, firstSliderFacet, "DeleteSelectionsControl"),
    log("after deleting both selections"),

    assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

    //clickControl(dataSourceControl),
    //log("after opening DataSourceSelectorsViewControl"),

    testFinish
);
