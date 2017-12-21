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

// to run in the browser, append the following to the file name: ?test=true&initialNumFacetsExpanded=<nExpandedMovingFacets>&nItems=<nItemsRequired>

// %%include%%: "at_fsTestTools.js"
// %%include%%: "../app/myFatZCApp.js"

// %%include%%: "at_myFatZCApp_overlayCreation.js"
// %%include%%: "at_myFatZCApp_favoritesOperations.js"
// %%include%%: "at_myFatZCApp_overlayRename.js"
// %%include%%: "at_myFatZCApp_zoomBoxing.js"
// %%include%%: "at_myFatZCApp_unionOverlays.js"

var test = {
    switch: [arg, "testName", ""],

    overlayCreation: overlayCreation_test,

    overlayRename: overlayRename_test,

    zoomBoxing: zoomBoxing_test,

    favoritesOperations: favoritesOperations_test,

    unionOverlays: unionOverlays_test,

    default: o(
        { log: "The given testName is not a recognized test" },
        { assert: false, comment: "testName must be a known test" }
    )    
};
