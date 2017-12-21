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
var sortFacetsParam = { //check first that the test works with nTestRepetitions 2 here.
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 200 // and with nItemsRequired items
};

var nameFacetSorter = controlOfEmbeddingStar("FacetSorterUX", nameFacet);
var favoritesOMFSorter = controlOfEmbeddingStar("FacetSorterUX", favoritesOMF);
var firstSliderFacetSorter = controlOfEmbeddingStar("FacetSorterUX", firstSliderFacet);
var firstSliderFacetUniqueID = [{ uniqueID: _ }, firstSliderFacet];
var defaultSortableUniqueID = [{ defaultSortableUniqueID: _ }, [areaOfClass, "FSApp"]];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A reminder in the sorting objects os, the latest sorting is the last in the os, going back till the first object, which is the earliest sorting object retained by the controller
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function assertAppSorting(expectedAppSorting) {
    var actualAppSorting = [{ specifiedSortingKey: _ }, [areaOfClass, "FSApp"]];
    return {
        // [equal] doesn't operate on os of objects, so we project the two attributes in a sorting object, to get two separate flat os, and we compare those:
        // an os of uniqueIDs, and an os of sort values (ascending/descending).
        assert: [and,
            [equal,
                [{ uniqueID: _ }, actualAppSorting],
                [{ uniqueID: _ }, expectedAppSorting]
            ],
            [equal,
                [{ sort: _ }, actualAppSorting],
                [{ sort: _ }, expectedAppSorting]
            ]
        ],
        comment: [concatStr, o(
            "Sorting (uniqueIDs os followed by sort values os)\nExpected: ",
            [concatStr, [{ uniqueID: _ }, expectedAppSorting], ","],
            " ",
            [concatStr, [{ sort: _ }, expectedAppSorting], ","],
            " ; Actual: ",
            [concatStr, [{ uniqueID: _ }, actualAppSorting], ","],
            " ",
            [concatStr, [{ sort: _ }, actualAppSorting], ","]
        )]
    };
};

function assertNumericalSorting(facet, sortingDirection) {
    var firstCell = getCell(facet, primaryOverlay, 0);
    var extremumVal = [{ minVal: _ }, facet]; // assume ascending

    if (sortingDirection === "descending") { // change, if descending
        extremumVal = [{ maxVal: _ }, facet]
    };

    return assertTestVal(extremumVal, [{ displayText: _ }, firstCell], "Extremum value in topmost cell of sorted slider facet");
};

function singleIterationOfSortFacetsTests() {
    return o(

    )
};

// the test
var sortFacets_test = o(
    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            storeInto(primarySolutionSetSize, "primaryOverlayInitialSolutionSetSize"),
            // first, a sequence of sorts to fill up the sorting pipeline (3 layers). 
            assertAppSorting({ uniqueID: defaultSortableUniqueID, sort: "ascending" }),

            showOverlaySolutionSetView(primaryOverlay),
            log("after opening the primary overlay's solutionSetView"),
            clickControl(nameFacetSorter),
            log("after sorting by name facet descending"),
            assertAppSorting({ uniqueID: defaultSortableUniqueID, sort: "descending" }),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            dragFacetToExpansion(favoritesOMF), // open favorite OMF 
            log("after expanding OMF favorites"),

            clickControl(favoritesOMFSorter),
            log("after sorting by favorites OMF ascending, name facet descending"),
            assertAppSorting(o({ uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "ascending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            clickControl(firstSliderFacetSorter),
            log("after sorting by first slider facet ascending, favorites OMF ascending, name facet descending"),
            assertAppSorting(o({ uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "ascending" },
                { uniqueID: firstSliderFacetUniqueID, sort: "ascending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            assertNumericalSorting(firstSliderFacet, "ascending"),

            //testTimeStamp("start", "start loop", 1), // 1: separate timer from the default one used by testInit/testFinish, which reside outside the test repetitions loop
            clickControl(firstSliderFacetSorter),
            log("after sorting by first slider facet descending, favorites OMF ascending, name facet descending"),
            assertAppSorting(o({ uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "ascending" },
                { uniqueID: firstSliderFacetUniqueID, sort: "descending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),
            assertNumericalSorting(firstSliderFacet, "descending"),

            clickControl(favoritesOMFSorter),
            log("after sorting by favorites OMF descending, slider facet descending, name facet descending"),
            assertAppSorting(o({ uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: firstSliderFacetUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "descending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            clickControl(nameFacetSorter),
            log("after sorting by name facet ascending, favorites OMF descending, first slider facet descending"),
            assertAppSorting(o({ uniqueID: firstSliderFacetUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "descending" },
                { uniqueID: defaultSortableUniqueID, sort: "ascending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            clickControl(nameFacetSorter),
            log("after sorting by name facet descending, favorites OMF descending, first slider facet descending"),
            assertAppSorting(o({ uniqueID: firstSliderFacetUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "descending" },
                { uniqueID: defaultSortableUniqueID, sort: "descending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            clickControl(favoritesOMFSorter),
            log("after sorting by favorites ascending, fund name descending, first slider facet descending"),
            assertAppSorting(o({ uniqueID: firstSliderFacetUniqueID, sort: "descending" },
                { uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "ascending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),

            clickControl(firstSliderFacetSorter),
            log("after sorting by first slider facet ascending, favorites OMF ascending, name facet descending"),
            assertAppSorting(o({ uniqueID: defaultSortableUniqueID, sort: "descending" },
                { uniqueID: favoritesOverlayUniqueID, sort: "ascending" },
                { uniqueID: firstSliderFacetUniqueID, sort: "ascending" }
            )),
            assertStoredVal({ primaryOverlayInitialSolutionSetSize: _ }, primarySolutionSetSize),
            assertNumericalSorting(firstSliderFacet, "ascending"),
            resetApp()
            //testTimeStamp("stop", "end loop", 1) // 1: separate timer from the default one used by testInit/testFinish, which reside outside the test repetitions loop
        ],
        sortFacetsParam.nTestRepetitions
    ),
    testFinish
);
