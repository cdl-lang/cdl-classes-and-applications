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

// a valid set of URL params:
// at_myLeanZCApp.html?testName=udfPerformance&nItems=100&limitExpandedFacetsType=Slider&maxInitialNumFacetsExpanded=2&initialExpansionStateAllFacets=2&test=true

// variable definitions
var udfOperationsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100, // and with nItemsRequired items
};

// number of new UDFs to be added per test repetition
// note this number is used in compile time, not run time!
var nNewUDFs = gArgParser.getArg('numNewUDFs', 50);

function addUdfN(n) {
    var result = [];

    for (var i = 0; i < n; i++) {
        result.push(clickControl(udfPlusButton));
        //result.push(clickControl(getFacetUDFRefByFacetName("Management Fee")));
        //result.push(clickControl(getKeyboardButton("+")));
        //result.push(clickControl(getKeyboardButton(i.toString())));
    }
    result.push(mouseMoveControl([areaOfClass, "EffectiveBaseName"])); //move away to remove tooltip

    return new MoonOrderedSet(result);
}

// the test
var udfPerformance_test = o(
    dragAndDropSampleDataFile(),
    assertNFacets(udfOperationsParam.nExpandedMovingFacets),
    assertNItems(udfOperationsParam.nItemsRequired),

    testInit,
    createTestRepetitions(
        [

            minimizeLeftmostExpandedFacet(), // minimize the leftmost on load
            minimizeLeftmostExpandedFacet(), // minimize the second from left on load, which became leftmost after its neighbor on left was minimized

            addUdfN(nNewUDFs),
            assertNumUDFFacets(nNewUDFs),
            log("after adding X UDFs"),
            resetApp()
        ],
        udfOperationsParam.nTestRepetitions
    ),
    testFinish
);

