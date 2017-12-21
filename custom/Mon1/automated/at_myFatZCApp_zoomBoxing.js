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
var zoomBoxingParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 10 // and with nItemsRequired items
};

// the test
var zoomBoxing_test = o(
    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            assertOverlaySolutionSetSize(primaryOverlay, zoomBoxingParam.nItemsRequired),                            // verify the primary has the initial number of items
            assertOverlaySolutionSetSize(favoritesOverlay, 0),                                       // verify the favorites overlay is empty
            assertOverlaySolutionSetSize(blacklistOverlay, 0),                                       // verify the blacklist overlay is empty

            //clickOverlayControl(blacklistOverlay, "OverlayShowControl"),                             // switch blacklist's OMF to show
            //log("after switching blacklist to show"),
            showOverlaySolutionSetView(primaryOverlay),
            dragFacetToExpansion(favoritesOMF), // expand favorite OMF 
            log("after expanding OMF favorites"),
            clickControl(getCell(favoritesOMF, primaryOverlay, 0)),                                  // add first primary overlay item to favorites   
            log("after adding first item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item                           
            clickControl(getCell(favoritesOMF, primaryOverlay, 1)),                                  // add second primary overlay item to favorites   
            log("after adding second item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 2),                                       // verify the favorites overlay has two items
            dragFacetToExpansion(blacklistOMF), // expand blacklistOMF
            clickControl(getCell(blacklistOMF, primaryOverlay, 0)),                                  // add first primary overlay item to blacklist   
            log("after adding first item to blacklist"),
            clickControl(getCell(blacklistOMF, primaryOverlay, 1)),                                  // add (now-)second primary overlay item to blacklist 
            log("after adding second item to blacklist"),
            assertOverlaySolutionSetSize(blacklistOverlay, 2),                                       // verify the blacklist overlay has two items
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item less (size of its intersection with the blacklist solutionSet)
            assertOverlaySolutionSetSize(primaryOverlay,                                             // verify the primary overlay has one item less (minus blacklisted)
                [minus, zoomBoxingParam.nItemsRequired, blacklistSolutionSetSize]),

            clickOverlayControl(favoritesOverlay, "OverlayInclusiveZoomBoxingControl"),          // move favorites to inclusive zoomboxing
            log("after making favorites inclusive zoomboxing"),
            assertOverlaySolutionSetSize(blacklistOverlay, 2),                                       // verify the blacklist overlay still has two items
            assertOverlaySolutionSetSize(favoritesOverlay, 2),                                       // verify the favorites overlay still has two items (its base is now the globalBaseSet!)
            assertOverlaySolutionSetSize(primaryOverlay, 1),                                         // verify the primary overlay has only one item

            clickOverlayControl(favoritesOverlay, "OverlayExclusiveZoomBoxingControl"),          // switch favorites to exclusive zoomboxing
            log("after making favorites exclusive zoomboxing"),
            assertOverlaySolutionSetSize(blacklistOverlay, 2),                                       // verify the blacklist overlay still has two items
            assertOverlaySolutionSetSize(favoritesOverlay, 2),                                       // verify the favorites overlay has two items (its base is now the globalBaseSet!)
            // verify the primary overlay has nItemsRequired minus the number of items in the union of favorites and blacklist (as we exclude both)
            assertOverlaySolutionSetSize(primaryOverlay,
                [minus, zoomBoxingParam.nItemsRequired, 3]),

            clickOverlayControl(favoritesOverlay, "OverlayZoomBoxControl"),                       // return favorites to the zoombox
            log("after returning favorites to the zoombox"),
            assertOverlaySolutionSetSize(blacklistOverlay, 2),                                       // verify the blacklist overlay still has two items
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item
            assertOverlaySolutionSetSize(primaryOverlay,                                             // verify the primary overlay has nItemsRequired minus blacklistSolutionSetSize
                [minus, zoomBoxingParam.nItemsRequired, blacklistSolutionSetSize]),

            clearOverlay(primaryOverlay),
            clearOverlay(favoritesOverlay),
            clearOverlay(blacklistOverlay),
            log("after clearing all overlays"),
            assertOverlaySolutionSetSize(blacklistOverlay, 0),                                       // verify the blacklist is empty
            assertOverlaySolutionSetSize(favoritesOverlay, 0),                                       // verify the favorites is empty
            assertOverlaySolutionSetSize(primaryOverlay, zoomBoxingParam.nItemsRequired),                            // verify the primary overlay has nItemsRequired

            //clickOverlayControl(blacklistOverlay, "OverlayShowControl"),                             // return blacklist overlay's OMF to hide, to allow for repeats of this loop
            //log("after switching blacklist to hide"),

            resetApp()
        ],
        zoomBoxingParam.nTestRepetitions
    ),
    testFinish
);

