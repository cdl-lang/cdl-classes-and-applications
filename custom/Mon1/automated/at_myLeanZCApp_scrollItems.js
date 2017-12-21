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
var scrollItemsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 500 // and with nItemsRequired items
};

var primaryOverlayScroller = controlOfEmbeddingStar("Scroller", primaryOverlay);
var primaryOverlaySolutionSetView = controlOfEmbeddingStar("OverlaySolutionSetView", primaryOverlay);
var minimizedFacetsView = [areaOfClass, "MinimizedFacetsView"];
var minimizedFacetsViewScroller = controlOfEmbeddingStar("Scroller", minimizedFacetsView);

// the test
var scrollItems_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [testInit,
            showOverlaySolutionSetView(primaryOverlay),
            mouseMoveControl(firstFrozenFacet),
            clickControlY(primaryOverlayScroller, 1.1),                         // click below the scroller for scroll fwd
            log("after scrolling primary view's items one page fwd"),
            clickControlY(primaryOverlayScroller, -0.1),                        // click above the scroller for scroll backwards
            log("after scrolling primary view's items one page back"),

            mouseDownControl(primaryOverlayScroller),
            mouseUpControlY(primaryOverlaySolutionSetView, 1),
            assertTestVal(true, [{ scrolledToEnd: _ }, primaryOverlaySolutionSetView], "Primary OverlaySolutionSetView scrolledToEnd"),
            log("after scrolling primary view's items all the way to the bottom"),

            mouseMoveControl(firstFrozenFacet),                                     // to ensure that the solutionSetView scrollbar is visible
            mouseDownControl(primaryOverlayScroller),
            mouseUpControlY(primaryOverlaySolutionSetView, 0),
            assertTestVal(false, [{ scrolledToEnd: _ }, primaryOverlaySolutionSetView], "Primary OverlaySolutionSetView scrolledToEnd"),
            log("after scrolling primary view's items all the way to the top"),

            // scrolling the minimized facets
            mouseMoveControl(minimizedFacetsView),              // to ensure that the minimizedFacetsView scrollbar is visible
            assertTestVal(0, [{ viewStaticPosOnDocCanvas: _ }, minimizedFacetsView], "MinimizedFacetViewPane scroller position"),
            mouseDownControl(minimizedFacetsViewScroller),
            mouseUpControlY(minimizedFacetsView, 1),
            assertTestVal(true,
                [and,
                    [greaterThanOrEqual, [{ viewStaticPosOnDocCanvas: _ }, minimizedFacetsView], 0.99],
                    [lessThanOrEqual, [{ viewStaticPosOnDocCanvas: _ }, minimizedFacetsView], 1]
                ],
                "MinimizedFacetViewPane scroller position"
            ),
            log("after scrolling minimized facets all the way to the bottom"),

            mouseMoveControl(minimizedFacetsView),              // to ensure that the minimizedFacetsView scrollbar is visible
            mouseDownControl(minimizedFacetsViewScroller),
            mouseUpControlY(minimizedFacetsView, 0),
            assertTestVal(0, [{ viewStaticPosOnDocCanvas: _ }, minimizedFacetsView], "MinimizedFacetViewPane scroller position"),
            log("after scrolling minimized facets all the way back to the top"),
            resetApp()
        ],
        scrollItemsParam.nTestRepetitions
    ),
    testFinish
);
