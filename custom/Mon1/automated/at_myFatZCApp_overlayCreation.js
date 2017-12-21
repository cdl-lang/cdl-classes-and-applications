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
// conducting multiple repetitions is at the tester's risk: at the moment there's no overlay deletion functionality in the app (at most, trashing could be performed), so at a minimum
// performance will degrade with repetitions.

var overlayCreationParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 10            // and with nItemsRequired items
};

var indexOfPrimaryItemCoselected = 2;

// the test
var overlayCreation_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            assertOverlaySolutionSetSize(primaryOverlay, overlayCreationParam.nItemsRequired),                            // verify the primary has the initial number of items
            assertOverlaySolutionSetSize(favoritesOverlay, 0),                                       // verify the favorites overlay is empty


            // switch facet name tooltip to edit mode, and then exit that edit mode (verifying bug #1634 is gone)
            mouseMoveControl([{ myFacet: firstSliderFacet }, [areaOfClass, "FacetName"]]),           // should produce the tooltip.
            { sleep: 1000 },
            clickControl([areaOfClass, "Tooltip"]),                                                  // switch tooltip to edit mode
            clickControl([areaOfClass, "MovingFacetViewPane"]),                                    // click outside the tooltip to exit edit mode                           

            showOverlaySolutionSetView(primaryOverlay),
            mouseMoveControl(primaryOverlay, "OverlaySolutionSetCounter"),
            dragFacetToExpansion(favoritesOMF), // expand favorite OMF 
            log("after expanding OMF favorites"),
            clickControl(getCell(favoritesOMF, primaryOverlay, 0)),                                  // add first primary overlay item to favorites   
            log("after adding first item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 1),                                       // verify the favorites overlay has one item                           
            clickControl(getCell(favoritesOMF, primaryOverlay, 1)),                                  // add second primary overlay item to favorites   
            log("after adding second item to favorites"),
            assertOverlaySolutionSetSize(favoritesOverlay, 2),                                       // verify the favorites overlay has two items

            // testing maximization of overlay:
            storeInto([size, [areaOfClass, "MinimizedVisibleOverlay"]], "numberOfMinimizedVisibleOverlaysBeforeMaximizationTesting"),
            clickOverlayControl(primaryOverlay, "OverlayMinimizationControl"),                                   // minimize the primaryOverlay
            log("after minimizing the primary overlay via the minimization control"),
            assertTestVal(
                [plus, 1, [{ numberOfMinimizedVisibleOverlaysBeforeMaximizationTesting: _ }, [testStore]]],  // what was there, plus the primary 
                [size, [areaOfClass, "MinimizedVisibleOverlay"]], "Overlays Minimized"
            ),
            // maximize primary from its minimized state. the term 'maximize' is very misleading at this point. this operation means "hide other overlays"
            clickOverlayControl(primaryOverlay, "OverlayMaximizationControl"),                                 
            assertTestVal(primaryOverlayUniqueID, [{ maximizedOverlayUniqueID: _ }, [areaOfClass, "FSApp"]], "Maximized Overlay UniqueID"),
            log("after maximizing the minimized primary overlay"),
            clickControl([areaOfClass, "UnmaximizeOverlayControl"]),                                           // unmaximize overlay
            clickOverlayControl(primaryOverlay, "OverlayMinimizationControl"),                                  // now expand the primaryOverlay
            log("after expanding the minimized primary overlay"),
            clickOverlayControl(primaryOverlay, "OverlayMaximizationControl"),                                  // maximize overlay
            assertTestVal(1, [size, [areaOfClass, "ExpandedVisibleOverlay"]], "Overlay Maximized"),
            log("after maximizing the expanded primary overlay"),
            clickControl([areaOfClass, "UnmaximizeOverlayControl"]),                                           // unmaximize overlay
            log("after unmaximizing primary overlay back to its expanded state"),
            assertTestVal(1, [size, [areaOfClass, "ExpandedVisibleOverlay"]], "Overlay Maximized"),

            // drag overlay to minimize/expand:
            assertOverlayExpansion(primaryOverlay, true),
            assertOverlayExpansion(favoritesOverlay, false),

            dragOverlayToMinimization(primaryOverlay),
            log("after dragging primary to minimization"),
            assertOverlayExpansion(primaryOverlay, false),
            assertOverlayExpansion(favoritesOverlay, false),

            dragOverlayToExpansion(favoritesOverlay),
            log("after dragging favorites to expansion"),
            assertOverlayExpansion(primaryOverlay, false),
            assertOverlayExpansion(favoritesOverlay, true),

            dragOverlayToExpansion(primaryOverlay),
            log("after dragging primary back to expansion"),
            assertOverlayExpansion(primaryOverlay, true),
            assertOverlayExpansion(favoritesOverlay, true),

            dragOverlayToMinimization(favoritesOverlay),
            log("after dragging favorites back to minimization"),
            assertOverlayExpansion(primaryOverlay, true),
            assertOverlayExpansion(favoritesOverlay, false),


            mouseDownControlY(firstSliderContinuousRange, 0.25),                                                   // make an elastic selection in the primary overlay in the first slider facet
            mouseUpControlY(firstSliderContinuousRange, 0.75),
            log("after elastic selection of range between 25%-75% for first facet in primary overlay"),

            clickOverlayControl(primaryOverlay, "OverlayCopyControl"),                               // create a copy of primary overlay
            log("after creating a copy of primary overlay"),

            //clickOverlayControl(primaryOverlay, "OverlayShowControl"),                               // switch the primary overlay to Hide
            //log("after switching primary overlay to hide"),

            //clickOverlayControl(primaryOverlay, "OverlayShowControl"),                               // switch the primary overlay to Show
            //log("after switching primary overlay back to show"),

            storeInto([{ uniqueID: _ }, lastOverlayAdded],                                                 // record uniqueID of new overlay
                "uniqueIDOfCopyOfPrimaryOverlay"),

            assertCompareOverlaysSolutionSets(primaryOverlay,
                getOverlayByStoredUniqueID({ uniqueIDOfCopyOfPrimaryOverlay: _ })
            ),
            clickOverlayControl(favoritesOverlay, "OverlayCopyControl"),                             // create a copy of favorites
            log("after creating a copy of favorites"),

            storeInto([{ uniqueID: _ }, lastOverlayAdded],                                                 // record uniqueID of new overlay
                "uniqueIDOfCopyOfFavoritesOverlay"),

            assertCompareOverlaysSolutionSets(favoritesOverlay,
                getOverlayByStoredUniqueID({ uniqueIDOfCopyOfFavoritesOverlay: _ })
            ),
            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfPrimaryOverlay: _ })),
            log("after clearing copy of primary overlay"),
            assertOverlaySolutionSetSize(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfPrimaryOverlay: _ }),
                overlayCreationParam.nItemsRequired),

            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfFavoritesOverlay: _ })),
            log("after clearing copy of favorites overlay"),
            assertOverlaySolutionSetSize(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfFavoritesOverlay: _ }),
                0),

            addNewIntensionalOverlay(),
            pressEnterKey,                                                                           // exit overlay name edit mode
            log("after creating a new intensional overlay"),
            storeInto([{ uniqueID: _ }, lastOverlayAdded],                                                 // record uniqueID of new overlay
                "uniqueIDOfNewIntOverlay"),
            assertOverlaySolutionSetSize(getOverlayByStoredUniqueID({ uniqueIDOfNewIntOverlay: _ }),
                overlayCreationParam.nItemsRequired),

            addNewExtensionalOverlay(),
            pressEnterKey,                                                                           // exit overlay name edit mode
            log("after creating a new extensional overlay"),
            storeInto([{ uniqueID: _ }, lastOverlayAdded],                                                 // record uniqueID of new overlay
                "uniqueIDOfNewExtOverlay"),
            assertOverlaySolutionSetSize(getOverlayByStoredUniqueID({ uniqueIDOfNewExtOverlay: _ }),
                0),


            clickOverlayControl(primaryOverlay, "OverlayMinimizationControl"),                             // minimize the primaryOverlay
            log("after minimizing primary overlay"),

            assertOverlayExpansion(primaryOverlay, false),

            clickOverlayControl(primaryOverlay, "OverlayMinimizationControl"),                             // expand the primaryOverlay
            mouseMoveControl(primaryOverlay, "OverlaySolutionSetCounter"),
            log("after expanding primary overlay"),

            assertOverlayExpansion(primaryOverlay, true),

            clearOverlay(primaryOverlay),
            clearOverlay(favoritesOverlay),
            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfPrimaryOverlay: _ })),
            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfCopyOfFavoritesOverlay: _ })),
            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfNewIntOverlay: _ })),
            clearOverlay(getOverlayByStoredUniqueID({ uniqueIDOfNewExtOverlay: _ })),

            // Trash the primary overlay
            clickOverlayControl(primaryOverlay, "OverlayTrashControl"),
            pressEnterKey,                                               // confirm trashing operation
            assertOverlayTrashed(primaryOverlay, true),
            log("after trashing primary overlay"),

            clickControl([areaOfClass, "AppTrash"]),                     // open the trash

            // Untrash the primary overlay
            untrashOverlay(primaryOverlay),
            assertOverlayTrashed(primaryOverlay, false),
            log("after untrashing primary overlay"),

            resetApp()
        ],
        overlayCreationParam.nTestRepetitions
    ),
    testFinish
);

