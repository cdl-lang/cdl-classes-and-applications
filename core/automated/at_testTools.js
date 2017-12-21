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

var nTestRepetitionsDefault = 2;

function log(logMsg) {
    return {
        log: logMsg
    };
};

// Makes all false-ish values (o(), o(false), o(false, false), ...) identical
var falseIdentity = [
    defun, "x",
    [cond, "x", o(
        {on: false, use: o()},
        {on: true, use: "x"}
    )]
]

function assertTestVal(expectedVal, actualVal, msg) {
    var assertMsg = "Assert";
    if (msg !== undefined) {
        assertMsg = msg
    };
    return {
        assert: [
                 equal,
                 [falseIdentity, expectedVal], 
                 [falseIdentity, actualVal]
                ],
                
        comment: [concatStr, o(
                               assertMsg,
                               " - Expected: ",
                               [debugNodeToStr, expectedVal], // if not an os, debugNodeToStr should have no detrimental effect
                               " ; Actual: ",
                               [debugNodeToStr, actualVal]
                              )]
    };
};

function testTimeStamp (act, logMsg, timer) {
    var timerID = 0;
    if (timer !== undefined) {
        timerID = timer
    };
    return o({ timer: timerID, action: act }, { log: logMsg });
};

function controlOfEmbeddingStar (controlClass, embeddingStarAreaRef) {
    return [
            [embeddedStar, embeddingStarAreaRef],
            [areaOfClass, controlClass]
           ];
};

function assertOSEquality(os1, os2)
{
    return [equal, os1, os2];
}

function getModifier (param) {
    if ((param === "shift") || (param === "control") || (param === "meta") || (param === "alt"))
        return param;
    else
        return "dummy";     
};

///////////////////////////////////////////////////////////////////////////////////////
// Beginning of MouseEvent & Keyboard Event Classes
///////////////////////////////////////////////////////////////////////////////////////

// control, and an optional modifier or two
function clickControl (areaRef, mod1, mod2) {
    return {
        MouseClick: "left",
        area: areaRef,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, and an optional modifier or two
function clickControlX (areaRef, xVal, mod1, mod2) {
    return {
        MouseClick: "left",
        area: areaRef,
        x: xVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, yVal, and an optional modifier or two
function clickControlY (areaRef, yVal, mod1, mod2) {
    return {
        MouseClick: "left",
        area: areaRef,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, yVal, and an optional modifier or two
function clickControlXY (areaRef, xVal, yVal, mod1, mod2) {
    return {
        MouseClick: "left",
        area: areaRef,
        x: xVal,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

function doubleClickControl (areaRef, mod1, mod2) {
    return {
        MouseDoubleClick: "left",
        area: areaRef,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, and an optional modifier or two
function mouseDownControl (areaRef, mod1, mod2) {
    return {
        MouseDown: "left",
        area: areaRef,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, and an optional modifier or two
function mouseDownControlX (areaRef, xVal, mod1, mod2) {
    return {
        MouseDown: "left",
        area: areaRef,
        x: xVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, yVal, and an optional modifier or two
function mouseDownControlY (areaRef, yVal, mod1, mod2) {
    return {
        MouseDown: "left",
        area: areaRef,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, yVal, and an optional modifier or two
function mouseDownControlXY (areaRef, xVal, yVal, mod1, mod2) {
    return {
        MouseDown: "left",
        area: areaRef,
        x: xVal,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, and an optional modifier or two
function mouseUpControl (areaRef, mod1, mod2) {
    return {
        MouseUp: "left",
        area: areaRef,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, and an optional modifier or two
function mouseUpControlX (areaRef, xVal, mod1, mod2) {
    return {
        MouseUp: "left",
        area: areaRef,
        x: xVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, yVal, and an optional modifier or two
function mouseUpControlY (areaRef, yVal, mod1, mod2) {
    return {
        MouseUp: "left",
        area: areaRef,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

// control, xVal, yVal, and an optional modifier or two
function mouseUpControlXY (areaRef, xVal, yVal, mod1, mod2) {
    return {
        MouseUp: "left",
        area: areaRef,
        x: xVal,
        y: yVal,
        modifier: o(getModifier(mod1), getModifier(mod2))
    };
};

function mouseMoveControl (control) {
    return {
        MouseMove: "left",
        area: control
    };
};

// control, xVal
function mouseMoveControlX (areaRef, xVal) {
    return {
        MouseMove: "left",
        area: areaRef,
        x: xVal
    };
};

// control, yVal
function mouseMoveControlY (areaRef, yVal) {
    return {
        MouseMove: "left",
        area: areaRef,
        y: yVal
    };
};

// control, xVal, yVal
function mouseMoveControlXY (areaRef, xVal, yVal) {
    return {
        MouseMove: "left",
        area: areaRef,
        x: xVal,
        y: yVal
    };
};

var pressEnterKey = {
    KeyDown: "Return"
};

var pressEscKey = {
    KeyDown: "Esc"
};

var pressShiftKey = {
    KeyDown: "Shift"
};

var pressBackspaceKey = {
    KeyDown: "Backspace"
};

var pressDelKey = {
    KeyDown: "Del"
};

var pressShiftCtrlKey = {
    KeyDown: o("Shift", "Ctrl")
};

var pressTabKey = {
    KeyDown: "Tab"
};

var pressShiftTabKey = {
    KeyDown: "Tab",
    modifier: "Shift"
};

var pressLeftKey = {
    KeyDown: "Left"
};

var pressRightKey = {
    KeyDown: "Right"
};

function focusArea (area) {
    return { focus: area };
};

function textInput(textStr) {
    return { textInput: { value: textStr } };
};
 
function keyDownUp(key) {
    return o(
             { KeyDown: key },
             { KeyUp: key }
            );
};

function keyDownPressUp(key) {
    return o(
             { KeyDown: key },
             { KeyPress: key },
             { KeyUp: key }
            );
}; 

///////////////////////////////////////////////////////////////////////////////////////
// End of MouseEvent & Keyboard Event Classes
///////////////////////////////////////////////////////////////////////////////////////
function resetTest() {
    return o(
        clickControl([areaOfClass, "TestResetControl"]),
        log("after test reset")
    );
};

function createTestRepetitions(test, numRepetitions) {
    var testRepetitions = [];
    for (var i = 0; i < numRepetitions; i++) {
        testRepetitions.push(log("Test repetition #"+(i+1)));
        for (var j = 0; j < test.length; j++) {
            testRepetitions.push(test[j])
        }
    };
    return (new MoonOrderedSet(testRepetitions));
};

function repeatTestCommand(testCommand, numRepetitions) {
    var testRepetitions = [];
    for (var i = 0; i < numRepetitions; i++) {
        testRepetitions.push(testCommand)
    };
    return (new MoonOrderedSet(testRepetitions));
};


function storeInto (val, label) {
    return { 
        store: val,
        into: label
    };
};

function assertStoredVal (storedValQuery, val, assertMsg) {
    var msg;
    if (assertMsg !== undefined) {
        msg = assertMsg
    } else {
        msg = "Stored Val vs. Current Val"
    };      
    return assertTestVal([storedValQuery, [testStore]], val, msg);
}

// variable definitions
var testInit = testTimeStamp("start", "test start");
var testFinish = testTimeStamp("stop", "test stop");
var testScreenArea = [areaOfClass, "ScreenArea"]; // screenArea is a reserved variable name - used in cdl.

