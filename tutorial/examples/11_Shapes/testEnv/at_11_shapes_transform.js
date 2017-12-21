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
// %%classfile%%: "../11_shapes_transform.js"

var nTestRepetitions = nTestRepetitionsDefault; // defined in at_testTools (1)

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
//var topContainer = [{ topContainer: true}, [areaOfClass, "TestContainer"]];
//var testControl1 = testControl(topContainer, 1);
//var testControl3 = testControl(topContainer, 3);
//var testControl4 = testControl(topContainer, 4);
var triangleContainer = [areaOfClass, "Triangle"]
var arcContainer = [areaOfClass, "Arc"]
var triangleRotation = [{rotation: _}, triangleContainer]
var arcRotation = [{rotation: _}, arcContainer]

// the test
var test = o(
    createTestRepetitions(
        [
            //testInit,
            testTimeStamp("start", "test start"),
            resetTest(),
            log("click on triangle three times"),
            clickControl(triangleContainer),
            clickControl(triangleContainer),
            clickControl(triangleContainer),
            assertTestVal(triangleRotation, 30),
            
            testTimeStamp("pause", "test paused"),
            testTimeStamp("resume", "test resumed"),
            
            log("click on arc two times"),
            clickControl(arcContainer),
            clickControl(arcContainer),
            assertTestVal(arcRotation, 20),
            
            //testFinish
            testTimeStamp("stop", "test stop")
       ],
       nTestRepetitions
    )
);

