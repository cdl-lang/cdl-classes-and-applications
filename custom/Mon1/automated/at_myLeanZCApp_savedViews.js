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
var savedViewsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

// the test
var savedViews_test = o(

    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [
            storeInto([{ name: _ }, firstSliderFacet], "nameOfFirstSliderFacet"),
            storeInto([{ name: _ }, secondSliderFacet], "nameOfSecondSliderFacet"),

            clickControl(savedViewMinimizationControl), //open savedViews side panel
            log("after opening savedViews side panel"),

            clickControl(plusSavedViewButton), // plus button in savedViews side panel
            textInput("Initial"),
            pressEnterKey,
            log("after adding a new savedViews and renaming it with 'Initial'"),

            assertTestVal(false, isSavedViewModified("Initial"), "Initial Saved View is Modified"),
            clickControl(savedViewMinimizationControl), // close the savedViews side panel, so it doesn't mask the expanded facets.

            minimizeLeftmostExpandedFacet(), // minimize the leftmost on load
            minimizeLeftmostExpandedFacet(), // and then the one that was to its right (and now is leftmost)
            assertNumMovingFacets(0),
            log("after minimizing the two slider facets"),

            assertTestVal(true, isSavedViewModified("Initial"), "Initial Saved View is Modified"),

            //re-expand them
            doubleClickControl(getFacetByName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            doubleClickControl(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]])),
            //expandMinimizedFacetViaSearchByName([{ nameOfSecondSliderFacet: _ }, [testStore]]),
            //expandMinimizedFacetViaSearchByName([{ nameOfFirstSliderFacet: _ }, [testStore]]),
            log("after re-expanding the original slider facets"),

            //assertTestVal(false, isSavedViewModified("Initial"), "Initial Saved View is Modified"),
            // uncomment line above after bug #1672 is solved

            //minimizing the MinimizedFacetViewPanel should trigger a modification in the current saved view
            clickControlAreaByClassName("MinimizedFacetViewPaneMinimizationControl"),
            log("after closing the MinimizedFacetViewPane"),
            assertTestVal(true, isSavedViewModified("Initial"), "Initial View is Modified"),

            clickControl(savedViewMinimizationControl), // re-open the saved view pane
            clickControl(savedViewAsButton),
            clickControl(getSavedViewByName("Initial")),
            log("after saving current view as Initial"),
            assertTestVal(false, isSavedViewModified("Initial"), "Initial View is not Modified"),

            clickControl(plusSavedViewButton), // plus button in savedViews side panel
            textInput("Saved1"),
            pressEnterKey,
            log("after adding a new savedViews and renaming it with 'Saved1'"),
            clickControl(savedViewMinimizationControl), // close the saved view pane once again

            // drag the highValSelector of first slider to the bottom
            mouseDownControl(firstSliderHighValSelector),
            mouseUpControlY(firstSliderContinuousRange, 1),
            log("after dragging the highVal selector of the fist slider facet to the bottom of the range"),

            assertTestVal(false, isSavedViewModified("Saved1"), "Saved1 View is Modified"),

            clickControl(savedViewMinimizationControl), // and re-open it
            clickControl(plusSavedViewButton), // plus button in savedViews side panel
            textInput("Saved2"),
            pressEnterKey,
            log("after adding a new savedViews and renaming it with 'Saved2'"),
            assertTestVal(false, isSavedViewModified("Saved2"), "Saved2 View is not Modified"),

            clickControl(savedViewMinimizationControl), // and close it
            // closing second slider amoeba
            closeFacetAmoeba(secondSliderFacet),
            assertTestVal(true, isSavedViewModified("Saved2"), "Saved2 View is Modified"),
            log("after closing the amoeba of the second slider facet"),

            clickControl(savedViewMinimizationControl), // and re-open it
            clickControl(plusSavedViewButton), // plus button in savedViews side panel
            textInput("Saved3"),
            pressEnterKey,
            log("after adding a new savedViews and renaming it with 'Saved3'"),
            assertTestVal(false, isSavedViewModified("Saved3"), "Saved3 View is not Modified"),

            clickControl(savedViewMinimizationControl), // and close it
            minimizeLeftmostExpandedFacet(), // minimize the leftmost on load 
            log("after minimizing the leftmost slider facets"),
            assertTestVal(true, isSavedViewModified("Saved3"), "Saved3 View is Modified"),

            clickControl(savedViewMinimizationControl), // and re-open it
            clickControl(savedViewAsButton),
            clickControl(getSavedViewByName("Saved3")),
            log("after saving current veiw as Saved3"),
            assertTestVal(false, isSavedViewModified("Saved3"), "Saved3 View is Modified"),
            resetApp()
        ],
        savedViewsParam.nTestRepetitions
    ),
    testFinish
);
