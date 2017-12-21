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
// %%classfile%%: "../app/reorderableTest.js"
var nTestRepetitions = nTestRepetitionsDefault; // defined in at_testTools
var expectedNumColumns = 15;

function assertNumColumns() {
    var actualNumColumns = [arg, "nColumns", defaultNumColumns]
    return assertTestVal(expectedNumColumns,
        actualNumColumns,
        "nColumns"
    );
};

// function definitions
function getReorderable(uniqueID) {
    return [
        { uniqueID: uniqueID },
        [areaOfClass, "TestReorderableElement"]
    ];
}

function getReorderableHandle(uniqueID) {
    return [
        { children: { handle: _ } },
        getReorderable(uniqueID)
    ];
}

function assertReordering(expectedReordering, expectedFirstInViewUniqueID) {
    return {
        assert: [and,
            assertOSEquality([{ reordered: _ }, controllerView], expectedReordering),
            [equal,
                [{ firstInViewUniqueID: _ }, controllerView],
                expectedFirstInViewUniqueID
            ]
        ],
        comment: [concatStr, o(
            "\nOrdering - Expected: ",
            expectedReordering,
            "; Actual: ",
            [{ reordered: _ }, controllerView],
            ".\nfirstInView - Expected: ",
            expectedFirstInViewUniqueID,
            ", Actual: ",
            [{ firstInViewUniqueID: _ }, controllerView],
            "."
        )]
    };
}

// variable definitions
var controllerView = [areaOfClass, "TestReorderableElementsContainer"]; // this is also the view that embeds the TestReorderableElement
var virginOrder = [{ defaultColumnOrdering: _ }, controllerView];
var firstInView = [{ firstInView: _ }, controllerView];
var firstInViewUniqueID = [{ uniqueID: _ }, firstInView];
var jitMode = [{ checked: _ }, [areaOfClass, "TestJITModeButton"]];

// the test
var test = o(
    assertNumColumns(),
    testInit,
    createTestRepetitions(
        [
            assertReordering(virginOrder, 1),
            resetTest(),
            log("following reset"),
            log([concatStr, o("JIT Mode: ", jitMode)]),
            assertReordering(virginOrder, 1),
            clickControl(getReorderableHandle(firstInViewUniqueID)), // initiate reorder of firstInView (column 1), and drop it at its original position
            log("after trivial reordering of column 1 to its position of origin, and as the firstInView"),
            assertReordering(virginOrder, 1),

            mouseDownControl(getReorderableHandle(1)), // reorder column 1
            mouseUpControlX(getReorderable(2), 1),   // and drop it to the right of column 2
            log("after dragging of 1 to the right of 2"),
            assertReordering(o(2, 1, [sequence, r(3, expectedNumColumns)]), 2),
            mouseDownControl(getReorderableHandle(1)), // reorder column 1
            mouseUpControlX(getReorderable(2), 0),   // and drop it to the left of column 2
            log("after dragging of 1 back to the left of 2"),
            assertReordering(virginOrder, 1),

            mouseDownControl(getReorderable(10)), // drag column 10
            mouseUpControlX(controllerView, 0),   // and drop it at the left end fo the view area
            log("after dragging all columns by 10, making 5 the firstInView"),
            assertReordering(virginOrder, 5),     // 5 should be the new firstInView
            clickControl(getReorderableHandle(firstInViewUniqueID)), // initiate reorder of firstInView (column 5), and drop it at its original position
            log("after trivial reordering of column 5 to its position of origin, and as the firstInView"),
            assertReordering(virginOrder, 5),

            mouseDownControl(getReorderableHandle(5)), // reorder column 5
            mouseUpControlX(getReorderable(7), 1),   // and drop it to the right of column 7
            log("after dragging 5 to the right of 7"),
            assertReordering(o(1, 2, 3, 4, 6, 7, 5, [sequence, r(8, expectedNumColumns)]), 6),
            mouseDownControl(getReorderableHandle(5)), // reorder column 5
            mouseUpControlX(getReorderable(6), 0),   // and drop it to the left of column 6
            log("after dragging 5 back to the left of 6"),
            assertReordering(virginOrder, 5),

            mouseDownControl(getReorderableHandle(14)), // reorder column 14
            mouseUpControlX(controllerView, 1),   // and drop it at the right end of the view area - effectively reordering it to the right of 15
            log("after dragging 14 to the right of 15"),
            assertReordering(o([sequence, r(1, 13)], 15, 14), 5),

            mouseDownControl(getReorderableHandle(15)), // reorder column 15
            mouseUpControlX(controllerView, 0),   // and drop it at the left end of the view area - effectively reordering it to the left of 5, and to be the firstInView
            log("after dragging 15 to the left of 5, making the former the firstInView"),
            assertReordering(o(1, 2, 3, 4, 15, [sequence, r(5, 14)]), 15),
            mouseDownControl(getReorderableHandle(15)), // reorder column 15
            mouseUpControlX(controllerView, 1),   // and drop it at the right end of the view area - effectively reordering it last
            log("after dragging 15 back to the end"),
            assertReordering(virginOrder, 5),

            mouseDownControl(getReorderable(5)), // drag column 5
            mouseUpControlX(controllerView, 1),   // and drop it at the right end of the view area - effectively scroll back to have 1 as the firstInView
            log("after dragging all columns by 5, making 1 the firstInView"),
            assertReordering(virginOrder, 1),

            mouseDownControl(getReorderable(2)), // drag column 2
            mouseUpControlX(controllerView, 0),   // and drop it at the left end of the view, making it the first in view
            mouseDownControl(getReorderableHandle(3)), // reorder column 3
            mouseUpControlX(testScreenArea, 0),        // all the way to the left of the screenArea, which should place it firstInView on mouseUp, and first in reordering
            log("after dragging 3 all the way to the left of the screeArea, making it first in ordering and first in view"),
            assertReordering(o(3, 1, 2, [sequence, r(4, 15)]), 3),

            resetTest(),
            assertReordering(virginOrder, 1),
            clickControl([areaOfClass, "TestJITModeButton"])
        ],
        nTestRepetitions
    ),
    testFinish
);

