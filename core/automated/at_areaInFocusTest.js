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
// %%classfile%%: "../app/areaInFocusTest.js"

var nTestRepetitions = nTestRepetitionsDefault; // defined in at_testTools

// function definitions
function testControl(container, id) {
    var childName = "testControl" + id;
    var query = { children: {} };
    query.children[childName] = _;

    return [query, container];
}
function controlCounter(control) {
    return [{counter:_}, control];
}

function assertControlCounter(control, expectedVal)
{
    return assertTestVal(expectedVal, 
                         controlCounter(control),
                         [concatStr, o("Control ", control)]
                        );
}

// variable definitions
var topContainer = [{ topContainer: true}, [areaOfClass, "TestContainer"]];
var testControl1 = testControl(topContainer, 1);
var testControl3 = testControl(topContainer, 3);
var testControl4 = testControl(topContainer, 4);

// the test
var test = o(
    createTestRepetitions(
                          [
                           testInit,

                           resetTest(),
                           assertControlCounter(testControl1, 0),

                           clickControl(testControl1),
                           log("click on top left"),
                           assertControlCounter(testControl1, 1),

                           assertControlCounter(testControl3, 0),
                           clickControl(testControl3),
                           clickControl(testControl3),
                           clickControl(testControl3),
                           log("click on top right thrice"), 
                           assertControlCounter(testControl3, 3),

                           pressEnterKey,
                           pressEnterKey,
                           pressEnterKey,
                           log("and then hit Enter thrice"),
                           assertControlCounter(testControl3, 6),

                           testFinish
                          ],
                          nTestRepetitions
                         )
);

