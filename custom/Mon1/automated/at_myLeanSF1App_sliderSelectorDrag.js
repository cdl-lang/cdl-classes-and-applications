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
var sliderSelectorDragParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 5000 // and with nItemsRequired items
};

function getFacetByName(name)
{
    return [{dataObj: { name: name } }, [areaOfClass, "Facet"]];
}

function getFacetMinimizationControl(facet)
{
    return controlOfEmbeddingStar("FacetMinimizationControl", facet);
}

function getSliderFacetPrimaryContinuousRange(sliderFacet)
{
    return [
        {
            myOverlayXWidget: {
                myOverlay: primaryOverlay
            }
        },
        controlOfEmbeddingStar("SliderContinuousRange", sliderFacet)
    ];
}

function toggleFacetAmoebaMoreControls(facet)
{
    return {
        MouseClick: "left",
        area: controlOfEmbeddingStar("FacetAmoebaControl", facet)
    };
}

function openFacetAmoeba(facet)
{
    return {
        "if": [
            {
                state: n(
                    facetState.standard,
                    facetState.histogram,
                    facetState.twoDPlot
                )
            },
            facet
        ],
        then: toggleFacetAmoebaMoreControls(facet)
    };
}

function toggleFacetMinimization(facet)
{
    return {
        MouseClick: "left",
        area: getFacetMinimizationControl(facet)
    };
}

function setSliderFacetSelectionRange(facet, from, to)
{
    var continuousRange = getSliderFacetPrimaryContinuousRange(facet);
    return o(
        {
            MouseDown: "left",
            area: continuousRange,
            y: from
        },
        {
            MouseUp: "left",
            area: continuousRange,
            y: to
        }
    );
}

function unminimizeFacetByName(facetName)
{
    return unminimizeFacet(getFacetByName(facetName), facetName);
}

function unminimizeFacet(facet, facetName)
{
    return {
        if: [{minimized:_}, facet],
        then: o(
            { log: "unminimizing '" + facetName + "'" },
            toggleFacetMinimization(facet),
            { store: true, into: "unminimizeFacet" },
            { log: "expanded '" + facetName + "'" }
        ),
        else: o(
            { log: "already expanded: '" + facetName + "'" },
            { store: false, into: "unminimizeFacet" }
        )
    };
}

function restoreFacet(facet)
{
    return {
        if: [{unminimizeFacet:_}, [testStore]],
        then: toggleFacetMinimization(facet)
    };
}

//
// if the facet is minimized, unminimize it (and remember to unminimize it
//   at the end), open the facet's amoeba (if it were closed), and set
//   the slider to the preset precentage (of its continuous range)
//
function arrangeSliderFacetSelection(facetName)
{
    var fromPercent = 7;
    var toPercent = 93;
    var facet = getFacetByName(facetName);

    return o(
        {
            log: "setting a " + fromPercent + "% -- " + toPercent + "%" +
                " on Facet '" + facetName + "'"
        },
        unminimizeFacet(facet, facetName),
        openFacetAmoeba(facet),
        setSliderFacetSelectionRange(facet, fromPercent / 100, toPercent / 100),
        restoreFacet(facet),
        { log: "slider facet selection for '" + facetName + "' done" }
    );
}

function clickNextPrevArrowOfMinimizedFacetPane(nextPrev)
{
    var nextPrevControl = (nextPrev === "next" ? "Next" : "Prev") +
            "ControlOfFacetView";

    return o(
        {
            MouseMove: "left",
            area: [areaOfClass, "MinimizedFacetsDoc"]
        },
        {
            MouseClick: "left",
            area: [areaOfClass, nextPrevControl]
        }
    );
}

function assertOverlaySolutionSetSizeLessThan(overlay, boundVal)
{
    var actualNSolutionSet = [{solutionSetSize:_}, overlay];
    return {
        assert: [
            lessThan,
            actualNSolutionSet,
            boundVal
        ],
        comment: [
            concatStr,
            o(
                "Verify that solutionSetSize (",
                [debugNodeToStr, actualNSolutionSet],
                ") is less than '",
                [debugNodeToStr, boundVal],
                "'"
            )
        ]
    };
}

// the test
var sliderSelectorDrag_test = o(
    assertNFacets(sliderSelectorDragParam.nExpandedMovingFacets),
    assertNItems(sliderSelectorDragParam.nItemsRequired),
    
    createTestRepetitions(
        [testInit,

         // verify that the selection of primary and first slider is "any"
         assertSelectableFacetXIntOverlaySelectionsMade(
             firstSliderXPrimaryOverlay, false),

         // verify the primary has the initial number of items
         assertOverlaySolutionSetSize(
             primaryOverlay, sliderSelectorDragParam.nItemsRequired),

         { timer: 10, action: "start" },

         // set some slider facet selections
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),

         arrangeSliderFacetSelection("Inventory (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("next"),
         arrangeSliderFacetSelection("RETEARN (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("next"),
         arrangeSliderFacetSelection("NCFCOMMON (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         arrangeSliderFacetSelection("NCFDEBT (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),

         arrangeSliderFacetSelection("Capital Expenditure (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),
         clickNextPrevArrowOfMinimizedFacetPane("next"),

         unminimizeFacetByName("Total Debt (Q)"),

         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         clickNextPrevArrowOfMinimizedFacetPane("prev"),
         { timer: 10, action: "stop" },

         log("after setting selections on some facets"),

         // store the solution set size for further verification
         {
             store: [{solutionSetSize:_}, primaryOverlay],
             into: "baseFilteredSolutionSetSize"
         },

         
         // click to open the amoeba
         openFacetAmoeba(firstSliderFacet),

         // gradually drag the highValSelector to the bottom
         mouseDownControl(firstSliderHighValSelector),

         { timer: 11, action: "start" },
         {
             init: { store: 0, into: "selectorPosition" },
             while: [lessThan, [{selectorPosition:_}, [testStore]], 1],
             afterThought: {
                 store: [plus, [{selectorPosition:_}, [testStore]], 0.01],
                 into: "selectorPosition"
             },
             do: o(
                 mouseMoveControlY(
                     firstSliderContinuousRange,
                     [{selectorPosition:_}, [testStore]]
                 )
             )
         },
         { timer: 11, action: "stop" },

         mouseUpControlY(firstSliderContinuousRange, 1),
         log("after dragging the highVal selector to the bottom of the range"),

         // verify the number of items decreased
         assertOverlaySolutionSetSizeLessThan(
             primaryOverlay,
             [div, [{baseFilteredSolutionSetSize:_}, [testStore]], 2]
         ),

         // drag the highValSelector back to +inf
         mouseDownControl(firstSliderHighValSelector),

         mouseUpControlY(firstSliderFacet, 0),
         log("after dragging the highVal selector to its original position"),


         // verify the primary has the initial number of items
         assertOverlaySolutionSetSize(
             primaryOverlay,
             [{baseFilteredSolutionSetSize:_}, [testStore]]
         ),

         // gradually drag the lowValSelector to the top
         mouseDownControl(firstSliderLowValSelector),

         { timer: 12, action: "start" },
         {
             init: { store: 1, into: "selectorPosition" },
             while: [greaterThan, [{selectorPosition:_}, [testStore]], 0],
             afterThought: {
                 store: [minus, [{selectorPosition:_}, [testStore]], 0.01],
                 into: "selectorPosition"
             },
             do: o(
                 mouseMoveControlY(
                     firstSliderContinuousRange,
                     [{selectorPosition:_}, [testStore]]
                 )
             )
         },
         { timer: 12, action: "stop" },

         mouseUpControlY(firstSliderContinuousRange, 0),
         log("after dragging the lowVal selector to the top of the range"),

         // verify the number of items decreased
         assertOverlaySolutionSetSizeLessThan(
             primaryOverlay,
             [div, [{baseFilteredSolutionSetSize:_}, [testStore]], 2]
         ),

         // drag the lowValSelector back to -inf
         mouseDownControl(firstSliderLowValSelector),

         mouseUpControlY(firstSliderFacet, 1),
         log("after dragging the lowVal selector to its original position"),

         // verify the primary has the initial number of items
         assertOverlaySolutionSetSize(
             primaryOverlay,
             [{baseFilteredSolutionSetSize:_}, [testStore]]
         ),

         resetApp()
        ],
        sliderSelectorDragParam.nTestRepetitions
    ),
    testFinish
);

