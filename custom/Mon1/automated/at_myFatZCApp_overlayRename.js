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

var overlayRenameParam = {
    // performance will degrade with repetitions.
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 10 // and with nItemsRequired items
};

// the test
var overlayRename_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [

            storeInto([{ name: _ }, primaryOverlay],                                                  // record original name of the primary overlay
                "originalNameOfPrimaryOverlay"),
            clickOverlayControl(primaryOverlay, "OverlayCopyControl"),                               // create a copy of primary overlay
            log("after creating a copy of primary overlay"),
            storeInto([{ name: _ }, lastOverlayAdded],                                                     // record original name of the copy of the primary overlay
                "originalNameOfCopyOfPrimaryOverlay"),

            clickControl(controlOfEmbeddingStar("OverlayName", lastOverlayAdded)),
            textInput("Secondary"),
            keyDownUp("Esc"),
            assertStoredVal({ originalNameOfCopyOfPrimaryOverlay: _ }, [{ name: _ }, lastOverlayAdded]),
            log("after editing name of copy of primary overlay to 'Secondary', but then hitting Esc"),

            clickControl(controlOfEmbeddingStar("OverlayName", lastOverlayAdded)),
            { debugger: true },
            textInput("Secondary"),

            keyDownUp("Return"),
            assertTestVal("Secondary", [{ name: _ }, lastOverlayAdded]),
            log("after renaming copy of primary overlay to 'Secondary'"),

            clickControl(controlOfEmbeddingStar("OverlayName", primaryOverlay)),                     // renaming the primary overlay                        
            textInput("Secondary"),
            keyDownUp("Return"),
            assertTestVal("Secondary",
                [{ param: { input: { value: _ } } },                                      // the param.input.value of primary's name area should store "Secondary"
                controlOfEmbeddingStar("OverlayName", primaryOverlay)
                ]
            ),
            assertStoredVal({ originalNameOfPrimaryOverlay: _ }, [{ name: _ }, primaryOverlay]),       // the overlay name hasn't changed, as it's already in use!
            log("after attempting to rename primary overlay too to 'Secondary'"),
            textInput("RenamedP"),                                                                   // trying again, this time with a new name
            clickControlXY(testScreenArea, 0, 0),                                                     // but then clicking outside the edited text area
            assertTestVal("RenamedP", [{ name: _ }, primaryOverlay]),       // the overlay name hasn't changed, because of mouseClick outside edited area
            log("after attempting to rename primary overlay too to 'RenamedP', but ending with mouseClick outside"),

            clickControl(controlOfEmbeddingStar("OverlayName", primaryOverlay)),                     // trying yet again to rename the primary overlay: click its name
            textInput("RenamedP"),                                                                   // enter new name
            keyDownUp("Return"),                                                                     // and this time, completing the renaming with a Return
            assertTestVal("RenamedP", [{ name: _ }, primaryOverlay]),
            log("after renaming copy of primary overlay to 'RenamedP'"),
            resetApp()
        ],
        overlayRenameParam.nTestRepetitions
    ),
    testFinish
);

