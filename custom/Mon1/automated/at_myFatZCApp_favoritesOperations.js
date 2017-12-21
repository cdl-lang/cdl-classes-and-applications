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
var favoritesOperationsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

var favoritesOMFacetXPrimaryOSR = controlOfEmbeddingStar("OMFacetXIntOSR", favoritesOMF);

// the test
var favoritesOperations_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            assertOverlaySolutionSetSize(primaryOverlay, favoritesOperationsParam.nItemsRequired),                            // verify the primary has the initial number of items
            assertOverlaySolutionSetSize(favoritesOverlay, 0),                                       // verify the favorites overlay is empty
            doubleClickControl(getOverlayControl(primaryOverlay, "OverlaySolutionSetCounter")),      // expand the primary overlay
            dragFacetToExpansion(favoritesOMF), // open favorite OMF 
            log("after expanding OMF favorites"),

            clickControl(getCell(favoritesOMF, primaryOverlay, 0)),                                  // add first primary overlay item to favorites   
            log("after adding first item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item                           
            clickControl(getCell(favoritesOMF, primaryOverlay, 1)),                                  // add second primary overlay item to favorites   
            log("after adding second item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 2),                                       // verify the favorites overlay has two items
            clickControl(favoritesOMFacetXPrimaryOSR),                                               // include favorites' solutionSet in primary's solutionSet
            log("define primary to include favorites"),
            assertOverlaySolutionSetSize(primaryOverlay, favoritesSolutionSetSize), // verify the primary overlay has as many items as the favorites (include)
            clickControl(favoritesOMFacetXPrimaryOSR),                                               // exclude favorites' solutionSet from primary's solutionSet
            log("define primary to exclude favorites"),
            assertOverlaySolutionSetSize(primaryOverlay,                                             // verify the primary has its total number of items minus favorites (exclude)
                [minus, favoritesOperationsParam.nItemsRequired, favoritesSolutionSetSize]
            ),
            log("define primary to include favorites"),
            clickControl(favoritesOMFacetXPrimaryOSR),                                               // remove exclusion of favorites' solutionSet from primary's solutionSet
            log("remove primary's definition based on favorites"),
            assertOverlaySolutionSetSize(primaryOverlay, favoritesOperationsParam.nItemsRequired),                            // verify the primary has the initial number of items
            clickControl(getCell(favoritesOMF, primaryOverlay, 1)),                                  // remove second item from favorites overlay
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item left
            clickControl(getCell(favoritesOMF, primaryOverlay, 0)),                                  // remove first item from favorites overlay
            assertOverlaySolutionSetSize(favoritesOverlay, 0),                                       // verify the favorites overlay is once again empty
            resetApp()
        ],
        favoritesOperationsParam.nTestRepetitions
    ),
    testFinish
);

