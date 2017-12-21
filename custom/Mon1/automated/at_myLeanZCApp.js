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

// to run in the browser, append the following to the file name: ?test=true&initialNumFacetsExpanded=<nExpandedMovingFacets>&nItems=<nItemsRequired>&limitExpandedFacetsType=MS

// %%include%%: "at_fsTestTools.js"
// %%include%%: "../app/myLeanZCApp.js"

// %%include%%: "at_myLeanZCApp_loadFiles.js"
// %%include%%: "at_myLeanZCApp_msSelections.js"
// %%include%%: "at_myLeanZCApp_sliderSelections.js"
// %%include%%: "at_myLeanZCApp_sliderLogTest.js"
// %%include%%: "at_myLeanZCApp_scrollItems.js"
// %%include%%: "at_myLeanZCApp_sortFacets.js"
// %%include%%: "at_myLeanZCApp_udfOperations.js"
// %%include%%: "at_myLeanZCApp_savedViews.js"
// %%include%%: "at_perf_overlays.js"
// %%include%%: "at_perf_udfOperations.js"
// %%include%%: "at_myLeanZCApp_solutionVerification.js" 

var test = { 
    switch: [arg, "testName", ""],

    compilationFlags: {
        assert: correctCompilationFlags, comment: "Compilation flag error"
    },

    solutionVerification: solutionVerification_test, 

    loadFiles: loadFiles_test,

    msSelections: msSelections_test,

    sliderSelections: sliderSelections_test,

    sliderLogTest: sliderLogTest_test,

    scrollItems: scrollItems_test,

    sortFacets: sortFacets_test,

    udfOperations: udfOperations_test,

    savedViews: savedViews_test,

    udfPerformance: udfPerformance_test,

    overlayPerformance: overlayPerformance_test,

    default: o(
        { log: "The given testName is not a recognized test" },
        { assert: false, comment: "testName must be a known test" }
    )
};
