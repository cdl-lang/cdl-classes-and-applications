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

// %%include%%: "at_testTools.js"
// %%classfile%%: "../app/coselectableTest.js"
var nTestRepetitions = nTestRepetitionsDefault; // defined in at_testTools

// function definitions
function getCoselectable(coselectablesController, contigCoselectablesController, uniqueID) {
    return [
        {
            coselectableUniqueID: uniqueID,
            myContigCoselectablesController: contigCoselectablesController,
            myCoselectablesController: coselectablesController
        },
        [areaOfClass, "CoselectableTestElement"]
    ];
}

function clickCoselectable(coselectablesController, contigCoselectablesController, uniqueID) {
    return clickControl(getCoselectable(coselectablesController, contigCoselectablesController, uniqueID));
}

function shiftClickCoselectable(coselectablesController, contigCoselectablesController, uniqueID) {
    return clickControl(getCoselectable(coselectablesController, contigCoselectablesController, uniqueID), "shift");
}

function ctrlClickCoselectable(coselectablesController, contigCoselectablesController, uniqueID) {
    return clickControl(getCoselectable(coselectablesController, contigCoselectablesController, uniqueID), "control");
}

function shiftCtrlClickCoselectable(coselectablesController, contigCoselectablesController, uniqueID) {
    return clickControl(getCoselectable(coselectablesController, contigCoselectablesController, uniqueID), "shift", "control");
}

function assertCoselections(controller, expectedCoselections) {
    return assertTestVal(expectedCoselections,
        [{ coselectedUniqueIDs: _ }, controller],
        "Coselected uniqueIDs"
    );
}

// variable definitions
var yellowCoselectablesController = [areaOfClass, "TestCoselectablesControllerWORepetitions"];
var orangeCoselectablesController = [areaOfClass, "TestCoselectablesControllerWithRepetitions"];
var yellowContigCoselectablesController = [areaOfClass, "TestCoselectablesControllerWORepetitions"];
var topOrangeContigCoselectablesController = [{ children: { testContigCoselectablesController1: _ } }, orangeCoselectablesController];
var bottomOrangeContigCoselectablesController = [{ children: { testContigCoselectablesController2: _ } }, orangeCoselectablesController];
var outsideCoselectionAreas = [areaOfClass, "TestAnnotation"];
var displayTopOrangeCoselectables = [{ children: { displayContigButton1: _ } }, orangeCoselectablesController];
// the test
var test = o(
    testInit,
    createTestRepetitions(
        [
            resetTest(),
            assertCoselections(yellowCoselectablesController, o()),
            assertCoselections(orangeCoselectablesController, o()),
            clickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 2),
            log("#2 yellow selected"),
            assertCoselections(yellowCoselectablesController, o(2)),
            resetTest(),
            log("#2 yellow selection reset"),
            assertCoselections(yellowCoselectablesController, o()),
            shiftClickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 4),
            log("#1-#4 yellow selected"),
            assertCoselections(yellowCoselectablesController, o(1, 2, 3, 4)),
            shiftClickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 3),
            log("#1-#3 selected"),
            assertCoselections(yellowCoselectablesController, o(1, 2, 3)),
            ctrlClickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 2),
            log("#2 deselected"),
            assertCoselections(yellowCoselectablesController, o(1, 3)),
            resetTest(),
            clickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 2),
            ctrlClickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 4),
            log("#2 selected and then #4 coselected"),
            assertCoselections(yellowCoselectablesController, o(2, 4)),
            shiftCtrlClickCoselectable(yellowCoselectablesController, yellowCoselectablesController, 6),
            log("#5-#6 added to coselection via shift+ctrl"),
            assertCoselections(yellowCoselectablesController, o(2, 4, 5, 6)),

            clickCoselectable(orangeCoselectablesController, topOrangeContigCoselectablesController, 2),
            log("#2 top-orange selected, thereby resetting yellow coselections"),
            assertCoselections(yellowCoselectablesController, o()),
            assertCoselections(orangeCoselectablesController, o(2)),
            shiftClickCoselectable(orangeCoselectablesController, topOrangeContigCoselectablesController, 4),
            log("#3-#4 top-orange added to it via shift+ctrl"),
            assertCoselections(orangeCoselectablesController, o(2, 3, 4)),
            ctrlClickCoselectable(orangeCoselectablesController, bottomOrangeContigCoselectablesController, 6),
            log("#6 top-orange added to coselection"),
            assertCoselections(orangeCoselectablesController, o(2, 3, 4, 6)),
            clickControl(displayTopOrangeCoselectables),
            log("closing top orange display does not affect coselections"),
            assertCoselections(orangeCoselectablesController, o(2, 3, 4, 6)),
            clickControl(displayTopOrangeCoselectables),
            log("opening top orange display does not affect coselections"),
            assertCoselections(orangeCoselectablesController, o(2, 3, 4, 6)),
            resetTest(),
            assertCoselections(orangeCoselectablesController, o()),
            clickCoselectable(orangeCoselectablesController, topOrangeContigCoselectablesController, 4),
            shiftCtrlClickCoselectable(orangeCoselectablesController, bottomOrangeContigCoselectablesController, 5),
            log("select top-orange #4, and then shift+ctrl on bottom-orange #5"),
            assertCoselections(orangeCoselectablesController, o(4, 1, 2, 5))
        ],
        nTestRepetitions
    ),
    testFinish

);

