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
// %%classfile%%: "../app/snappableTest.js"
var nTestRepetitions = nTestRepetitionsDefault; // defined in at_testTools
var expectedNumColumns = 15;
var expectedNumRows = 15;
var numberOfElementsInViewMinusOne = 2; // the value of 2 is a function of the dimension of the element (row/column) on the dragging axis, and their spacing.

function assertNumColumns() {
    var actualNumColumns = [arg, "nColumns", defaultNumColumns]
    return assertTestVal(expectedNumColumns,
        actualNumColumns,
        "nColumns"
    );
};

function assertNumRows() {
    var actualNumRows = [arg, "nRows", defaultNumRows]
    return assertTestVal(expectedNumRows,
        actualNumRows,
        "nRows"
    );
};

function assertFirstInView(expectedFirstRowInViewUniqueID, expectedFirstColumnInViewUniqueID) {
    return {
        assert: assertOSEquality(
            o(expectedFirstRowInViewUniqueID, expectedFirstColumnInViewUniqueID),
            o(firstRowInViewUniqueID, firstColumnInViewUniqueID)
        ),
        comment: [concatStr, o(
            "\FirstInView (row, column) - Expected: ",
            "(",
            expectedFirstRowInViewUniqueID,
            ", ",
            expectedFirstColumnInViewUniqueID,
            ") ; Actual: (",
            firstRowInViewUniqueID,
            ", ",
            firstColumnInViewUniqueID,
            ")"
        )]
    };
}

function clickSnappableControl(controller, id) {
    var snappableAction = [];

    snappableAction.push(clickControl(
        [
            { message: id },
            controlOfEmbeddingStar("TestButton", controller)
        ]
    ));
    var controllerName;
    if (controller === rowsController) {
        controllerName = "RowsController"
    } else {
        controllerName = "ColumnsController"
    };
    snappableAction.push(log([concatStr, o("after ", id, " in ", controllerName)]));
    return (new MoonOrderedSet(snappableAction));
};

function getRow(id) {
    return [
        { uniqueID: id },
        [areaOfClass, "Row"]
    ];
};

function getColumn(id) {
    return [
        { uniqueID: id },
        [areaOfClass, "Column"]
    ];
};

function clickColumnCreator(id) {
    var columnCreator = [
        { uniqueID: id },
        [areaOfClass, "TestColumnCreator"]
    ];
    var columnCreatorAction = [];

    columnCreatorAction.push(clickControl(columnCreator));
    columnCreatorAction.push(log([concatStr,
        o("after click on columnCreator ",
            id,
            " to be created: ",
            [bool, [{ toBeCreated: _ }, columnCreator]]
        )
    ]));
    return (new MoonOrderedSet(columnCreatorAction));
};

// variable definitions
var rowsController = [areaOfClass, "RowsController"];
var columnsController = [areaOfClass, "ColumnsController"];
var firstRowInViewUniqueID = [{ firstInViewUniqueID: _ }, rowsController];
var firstColumnInViewUniqueID = [{ firstInViewUniqueID: _ }, columnsController];
var rowsScroller = controlOfEmbeddingStar("Scroller", [{ movableController: rowsController }, [areaOfClass, "ScrollbarContainer"]]);
var columnsScroller = controlOfEmbeddingStar("Scroller", [{ movableController: columnsController }, [areaOfClass, "ScrollbarContainer"]]);
var snappableView = [areaOfClass, "TestSnappableView"];
var fillUpViewToCapacityControl = [areaOfClass, "TestSnappableFillUpViewToCapacityControl"];

// the test
var test = o(
    assertNumRows(),
    assertNumColumns(),
    testInit,
    createTestRepetitions(
        [
            resetTest(),
            assertFirstInView(1, 1),

            // move rows with random-access controls
            clickSnappableControl(rowsController, "Next"),
            assertFirstInView(2, 1),
            clickSnappableControl(rowsController, "ViewBack"),
            assertFirstInView(1, 1),
            clickSnappableControl(rowsController, "Next"),
            clickSnappableControl(rowsController, "Next"),
            assertFirstInView(3, 1),
            clickSnappableControl(rowsController, "BeginningOfDoc"),
            assertFirstInView(1, 1),
            clickSnappableControl(rowsController, "ViewFwd"),
            assertFirstInView(4, 1),
            clickSnappableControl(rowsController, "EndOfDoc"),
            assertFirstInView(expectedNumRows - numberOfElementsInViewMinusOne, 1), // assert fails!
            clickSnappableControl(rowsController, "Prev"),
            assertFirstInView(expectedNumRows - numberOfElementsInViewMinusOne - 1, 1),
            clickSnappableControl(rowsController, "ViewFwd"),
            assertFirstInView(expectedNumRows - numberOfElementsInViewMinusOne, 1),

            resetTest(),
            assertFirstInView(1, 1),

            // move columns with random-access controls
            clickSnappableControl(columnsController, "ViewBack"),
            assertFirstInView(1, 1),
            clickSnappableControl(columnsController, "Prev"),
            assertFirstInView(1, 1),
            clickSnappableControl(columnsController, "ViewFwd"),
            clickSnappableControl(columnsController, "Next"),
            assertFirstInView(1, 5),
            clickSnappableControl(columnsController, "BeginningOfDoc"),
            assertFirstInView(1, 1),
            clickSnappableControl(columnsController, "EndOfDoc"),
            assertFirstInView(1, expectedNumColumns - numberOfElementsInViewMinusOne),
            clickSnappableControl(columnsController, "ViewFwd"),
            assertFirstInView(1, expectedNumColumns - numberOfElementsInViewMinusOne),
            clickSnappableControl(columnsController, "Prev"),
            assertFirstInView(1, expectedNumColumns - numberOfElementsInViewMinusOne - 1),

            resetTest(),
            assertFirstInView(1, 1),

            // drag elements with mouse
            mouseDownControlXY(snappableView, 0.1, 0.1), // and not 0, as that wouldn't actually reach a row/column
            mouseUpControlXY(snappableView, 1, 1), // pull both first and row column all the way to bottom-right of view, and let go. 
            log("after pulling first row/column to bottom-right cornerof snappable view"),
            assertFirstInView(1, 1), // they should remain first in view.
            mouseDownControlXY(snappableView, 1, 1),
            mouseUpControlXY(snappableView, 0, 0),
            log("after pulling row/column at bottom-right corner of snappable view to its top-left corner"),
            assertFirstInView(4, 4),
            mouseDownControlXY(snappableView, 1, 1),
            mouseUpControlXY(testScreenArea, 0, 0), // mouseUp at the top-left corner of the screen area!
            log("after pulling row/column at bottom-right corner of snappable view to top-left corner of screen area"),
            assertFirstInView(12, 13),
            mouseDownControl(getColumn(15)),
            mouseUpControlX(snappableView, 0),
            log("after dragging last column and mouseUp at the left side of the snappableView"),
            assertFirstInView(12, 13),

            //test filling up of view, and changes to firstInView
            clickColumnCreator(15), // destroyed last column
            assertFirstInView(12, 12),
            clickColumnCreator(12), // destroyed current firstInView
            assertFirstInView(12, 11),
            clickColumnCreator(12), // recreate column #12
            assertFirstInView(12, 12), // it should once again become the firstInView

            // test scrollers
            mouseDownControlY(rowsScroller, 0), // the default mid-point is not enough necessarily - scroller may be partially hidden from view with a snappable doc 
            mouseUpControlY(testScreenArea, 0), // scroll rows all the way to the top
            log("after dragging rows scroller all the way to the top of the scrollbar"),
            assertFirstInView(1, 12),

            mouseDownControlX(columnsScroller, 0),
            mouseUpControlX(testScreenArea, 0), // scroll columns all the way to the left
            log("after dragging columns scroller all the way to the left of the scrollbar"),
            assertFirstInView(1, 1),

            resetTest(),
            assertFirstInView(1, 1),

            // test fillUpView controller: allow view not to be full
            clickControl(fillUpViewToCapacityControl),
            clickSnappableControl(rowsController, "EndOfDoc"),
            clickSnappableControl(columnsController, "EndOfDoc"),
            assertFirstInView(expectedNumRows, expectedNumColumns)
        ],
        nTestRepetitions
    ),
    testFinish
);

