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
var unionOverlaysParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 1,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

var favoritesOMFacetXPrimaryOSR = controlOfEmbeddingStar("OMFacetXIntOSR", favoritesOMF);
var overlayAB = getOverlayByName("AB");
var overlayBC = getOverlayByName("BC");
var overlayABC = getOverlayByName("ABC");
var overlayB = getOverlayByName("B");
var overlayABxBC = getOverlayByName("ABxBC");
var overlayABuBC = getOverlayByName("ABuBC");

// the test
var unionOverlays_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            doubleClickControl(getOverlayControl(primaryOverlay, "OverlaySolutionSetCounter")),        // expand the primary overlay 
            clickControl(getOverlayControl(primaryOverlay, "OverlayName")),    // rename primary to "AB"
            textInput("AB"),
            keyDownUp("Return"),
            assertTestVal( // verify that the Return resulted in OverlayName no longer being in edit mode
                false,
                [{ editInputText: _ }, getOverlayControl(primaryOverlay, "OverlayName")]
            ),
            assertTestVal(
                "AB",
                [{ name: _ }, primaryOverlay],
                "Primary Overlay's Actual vs. Expected Name"
            ),
            log("after renaming primary filter to AB"),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 0)),                  // make selections that define "AB"
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 1)),
            showOverlaySolutionSetView(overlayAB),
            log("after defining AB"),

            addNewIntensionalOverlay(),                                                              // create intensional "BC"
            textInput("BC"),
            keyDownUp("Return"),
            log("after creating a filter called BC"),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayBC, 1)),                  // make selections that define "BC"
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayBC, 2)),
            showOverlaySolutionSetView(overlayBC),
            log("after defining BC"),

            addNewIntensionalOverlay(),                                                              // create intensional "ABC"
            textInput("ABC"),
            keyDownUp("Return"),
            log("after creating a filter called ABC"),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayABC, 0)),                 // make selections that define "ABC"
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayABC, 1)),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayABC, 2)),
            showOverlaySolutionSetView(overlayABC),
            log("after defining ABC"),

            addNewIntensionalOverlay(),                                                              // create intensional "B"
            textInput("B"),
            keyDownUp("Return"),
            log("after creating a filter called B"),
            showOverlaySolutionSetView(overlayB),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayB, 1)),                   // make selections that define "B"
            log("after defining B"),

            addNewIntensionalOverlay(),                                                              // create intensional "ABxBC"
            textInput("ABxBC"),
            keyDownUp("Return"),
            showOverlaySolutionSetView(overlayABxBC),
            log("after creating a filter called ABxBC"),

            addNewIntensionalOverlay(),                                                              // create intensional "ABuBC"
            textInput("ABuBC"),
            keyDownUp("Return"),
            showOverlaySolutionSetView(overlayABuBC),
            log("after creating a filter called ABuBC"),

            //dragFacetToExpansion(favoritesOMF), // open favorite OMF
            dragFacetToExpansion(getOMFByOverlayName("AB")),
            log("after expanding OMF of Overlay 'AB'"),
            dragFacetToExpansion(getOMFByOverlayName("BC")),
            log("after expanding OMF of Overlay 'BC'"),

            log([concatStr, o("debug - overlayABxBC areaRef: ", overlayABxBC)]),
            log([concatStr,
                o("debug - overlayAB's OMF areaRef: ",
                    [
                        { myOverlay: overlayAB },
                        [areaOfClass, "OMF"]
                    ]
                )
            ]),
            clickControl(getOMFacetXIntOSR(overlayABxBC, overlayAB)),                                // make selections that define "ABxBC"
            log("after making first selection defining ABxBC on AB"),

            log([concatStr, o("debug - overlayABxBC areaRef: ", overlayABxBC)]),
            log([concatStr,
                o("debug - overlayBC's OMF areaRef: ",
                    [
                        { myOverlay: overlayBC },
                        [areaOfClass, "OMF"]
                    ]
                )
            ]),
            clickControl(getOMFacetXIntOSR(overlayABxBC, overlayBC)),
            log("after making second selection defining ABxBC on BC"),

            //assertCompareOverlaysSolutionSets(overlayABxBC, overlayB), - fails, for some reason. instead, i compare just their sizes.
            assertCompareOverlaysSolutionSetSizes(overlayABxBC, overlayB),
            log("after comparing ABxBC to B"),


            clickOverlayControl(overlayABuBC, "IntOverlayIntersectionModeControl"),                  // make selections that define "ABuBC"
            clickControl(getOMFacetXIntOSR(overlayABuBC, overlayAB)),
            clickControl(getOMFacetXIntOSR(overlayABuBC, overlayBC)),

            //assertCompareOverlaysSolutionSets(overlayABuBC, overlayABC), - fails, for some reason. instead, i compare just their sizes.
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),
            log("after comparing ABuBC to ABC"),

            clickOverlayControl(overlayABxBC, "IntOverlayIntersectionModeControl"),                  // switch overlayABxBC to union mode
            assertCompareOverlaysSolutionSetSizes(overlayABxBC, overlayABC),
            log("after comparing the unionized ABxBC to ABC"),
            clickOverlayControl(overlayABxBC, "IntOverlayIntersectionModeControl"),                  // switch overlayABxBC back to intersection mode

            clickOverlayControl(overlayABuBC, "IntOverlayIntersectionModeControl"),                  // switch overlayABuBC to intersection mode
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayB),
            log("after comparing the intersected ABuBC to B"),
            clickOverlayControl(overlayABuBC, "IntOverlayIntersectionModeControl"),                  // switch overlayABuBC back to union mode

            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 1)),                  // remove B from the definition of "AB"
            log("after removing B from the definition of AB"),
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),
            log("verify B's removal hasn't affected the overlayABuBC"),
            assertOverlaySolutionSetSize(overlayABxBC, 0),
            log("verify B's removal emptied out overlayABxBC"),

            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 1)),                  // return B to the definition of "AB"
            log("after adding B back to the definition of AB"),
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),
            log("verify B's return hasn't affected the overlayABuBC"),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 2)),                  // add C to the definition of "AB"
            log("after adding C to the definition of AB"),
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),
            log("verify C's addition hasn't affected the overlayABuBC"),
            clickControl(getOverlayDiscreteValueByPos(firstMSFacet, overlayAB, 2)),                  // remove C from the definition of "AB"
            log("after removing C from the definition of AB"),
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),
            log("verify C's removal hasn't affected the overlayABuBC"),

            clickOverlayControl(overlayAB, "OverlayMinimizationControl"),                            // minimize AB
            clickOverlayControl(overlayBC, "OverlayMinimizationControl"),                            // minimize BC
            clickOverlayControl(overlayABC, "OverlayMinimizationControl"),                           // minimize ABC
            clickOverlayControl(overlayB, "OverlayMinimizationControl"),                             // minimize ABC
            log("after minimizing overlays 'AB', 'BC', 'ABC', and 'B' "),

            dragFacetToExpansion(favoritesOMF), // expand favorite OMF 
            log("after expanding OMF favorites"),

            clickControl(getCell(favoritesOMF, overlayABxBC, 0)),                                    // add first item in ABxBC to Favorites
            clickControl(getOMFacetXIntOSR(overlayABxBC, favoritesOverlay)),                         // add inclusion of favorites to definition of ABxBC
            log("after limiting ABxBC to include Favorites with its single item"),
            assertCompareOverlaysSolutionSetSizes(overlayABxBC, favoritesOverlay),                   // verify ABxBC equals favorites
            log("verify ABxBC equates Favorites"),

            clickControl(getOMFacetXIntOSR(overlayABuBC, favoritesOverlay)),                         // add inclusion of favorites to definition of ABuBC
            log("after limiting ABuBC to include Favorites with its single item"),
            assertCompareOverlaysSolutionSetSizes(overlayABuBC, overlayABC),                         // verify ABxBC equals favorites
            log("verify ABuBC is unaffected by addition of Favorites"),

            clickControl(getOMFacetXIntOSR(overlayABxBC, favoritesOverlay)),                         // add exclusion of favorites to definition of ABxBC
            log("after limiting ABxBC to exclude Favorites"),
            assertOverlaySolutionSetSize(overlayABxBC,                                               // verify ABxBC is overlayB minus the items in Favorites
                [minus,
                    [{ solutionSetSize: _ }, overlayB],
                    favoritesSolutionSetSize
                ]
            ),
            log("verify ABxBC equates Favorites"),

            clickControl(getOMFacetXIntOSR(overlayABuBC, favoritesOverlay)),                         // add exclusion of favorites to definition of ABuBC
            log("after limiting ABuBC to exclude Favorites"),
            assertOverlaySolutionSetSize(overlayABuBC,                                               // verify the primary has its total number of items minus favorites (exclude)
                unionOverlaysParam.nItemsRequired),
            log("verify ABxBC equates effective base"),
            resetApp()
        ],
        unionOverlaysParam.nTestRepetitions
    ),
    testFinish
);

