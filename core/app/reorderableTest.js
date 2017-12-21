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

////////////////////////////////
// This test makes use of the Reorderable/ReorderbleController and the SnappableReorderable/SnappableReorderableController (see reorderableClasses.js).
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var testReorderablePosConst = {
    widthOfReorderableElement: 30,
    fixedGirthOfReorderedDropSite: 5,
    reorderableElementSpacing: 5
}

var defaultNumColumns = 15;

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestColumnWidthButton: o(
        { // default
            "class": o("BiStateButton", "Border"),
            context: {
                checked: [arg, "variableWidth", false]
            },
            position: {
                left: 100,
                bottom: 20,
                width: 150,
                height: 20
            }
        },
        { 
            qualifier: { checked: true },
            context: { 
                displayText: "Column Width: Variable"
            }
        },
        { 
            qualifier: { checked: false },
            context: { 
                displayText: "Column Width: Fixed"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestJITModeButton: o(
        { // default
            "class": o("BiStateButton", "Border"),
            context: { 
                "^checked": true
            },
            position: {
                left: 100,
                bottom: 60,
                width: 150,
                height: 20
            }
        },
        { 
            qualifier: { checked: true },
            context: { 
                displayText: "JIT Mode: On"
            }
        },
        { 
            qualifier: { checked: false },
            context: { 
                displayText: "JIT Mode: Off"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableModeButton: o(
        { // default
            "class": o("BiStateButton", "Border"),
            context: { 
                "^checked": true
            },
            position: {
                left: 100,
                bottom: 100,
                width: 150,
                height: 20
            }
        },
        { 
            qualifier: { checked: true },
            context: { 
                displayText: "Snappable Mode: On"
            }
        },
        { 
            qualifier: { checked: false },
            context: { 
                displayText: "Snappable Mode: Off"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                snappableMode: [{ myApp: { snappableMode:_ } }, [me]],
            }
        },
        { // default
            "class": superclass,
            context: {
                myController: [areaOfClass, "TestReorderableElementsContainer"]
            },
            position: {
                left: 100,
                bottom: 150
            },
            write: {
                onTestResetControlReset: {
                    // upon: provided by superclass
                    true: {
                        resetReorderableElements: {
                            to: [{ myController: { reordered:_ } }, [me]],
                            merge: [{ myController: { defaultColumnOrdering:_ } }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { snappableMode: true },
            write: {
                onTestResetControlReset: {
                    // upon: provided by superclass
                    true: {
                        resetSpecifiedFiVUniqueID: {
                            to: [{ myController: { specifiedFiVUniqueID:_ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }           
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReorderableElementsContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                snappableMode: [{ myApp: { snappableMode:_ } }, [me]],
                jitMode: [{ myApp: { jitMode:_ } }, [me]]
            }
        },
        { // default
            "class": o("Border", "GeneralArea"),
            context: {
                borderColor: "red",             
                defaultColumnOrdering: [sequence, r(1,[arg, "nColumns", defaultNumColumns])],
                // SnappableReorderableController params:
                visReordered: [{ children: { testReorderableElements:_ } }, [me]],
                "^reordered": [{ defaultColumnOrdering:_ }, [me]]
            },
            position: {
                top: 250,
                height: 200,
                left: 300,
                width: 400
            },
            children: {
                testReorderableElements: {
                    // see JIT variants below
                    description: {
                        "class": "TestReorderableElement"
                    }
                }
            }
        },
        {
            qualifier: { jitMode: false },
            "class": "HorizontalSnappableReorderableController",
            context: {
                // SnappableReorderableController params (appears here to override default)
                reorderingSpacing: testReorderablePosConst.reorderableElementSpacing, // (override default value of 0)                              
            },
            children: {
                testReorderableElements: {
                    data: [{ reordered:_ }, [me]]
                }
            }
        },
        {
            qualifier: { jitMode: true },
            "class": "HorizontalJITSnappableReorderableController",
            context: {
                // SnappableReorderableController params
                lengthOfJITElement: testReorderablePosConst.widthOfReorderableElement,
                movablesUniqueIDs: [{ reordered:_ }, [me]],
                reorderingSpacing: testReorderablePosConst.reorderableElementSpacing, // (override default value of 0)
                // JITSnappableReorderableController
                allDataJITSnappableVisReorderable: [{ reordered:_ }, [me]]
            },
            children: {
                testReorderableElements: {
                    data: [{ jitSnappableVisReorderableData:_ }, [me]] // part of the JITSnappableReorderableController API!
                }
            }
        },
        {
            qualifier: { snappableMode: false },
            context: {
                movable: false // this is the flag that prevents reorderable classes from scrolling/dragging of teh entire document (see MovableController)
            }
        },
        {
            qualifier: { snappableMode: true },
            children: {
                scrollbar: {
                    description: {
                        "class": "HorizontalScrollbarContainer",
                        context: {
                            movableController: [areaOfClass, "TestReorderableElementsContainer"],
                            createButtons: false,
                            attachToView: "beginning",
                            attachToViewOverlap: true
                        }
                    }
                }               
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReorderableElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                snappableMode: [{ myApp: { snappableMode:_ } }, [me]],
                jitMode: [{ myApp: { jitMode:_ } }, [me]]
            }
        },
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "GeneralArea", "Border"),
            context: {
                uniqueID: [{ param: { areaSetContent:_ } }, [me]], // MovableInAScore param (inherited by both the JIT and non-JIT classes in variants below)
                displayText: [{ uniqueID:_ }, [me]]
            },
            position: {
                width: [cond,
                        [{ checked:_ }, [areaOfClass, "TestColumnWidthButton"]],
                        o(
                          { on: true, use: [div, [mul, testReorderablePosConst.widthOfReorderableElement, [{ uniqueID:_ }, [me]]], 2] },
                          { on: false, use: testReorderablePosConst.widthOfReorderableElement }
                         )
                      ]
                // position relative to prev in reordered os is done by MovableInAS
            },
            display: {
                background: "yellow"
            },
            children: {
                handle: {
                    description: {
                        "class": "ReorderHandle",
                        context: {
                            visReorderable: [embedding]
                        },
                        position: {
                            left: 1,
                            right: 1,
                            top: 1,
                            height: 10
                        },
                        display: {
                            background: "grey"
                        }
                    }
                }
            }
        },
        {
            qualifier: { jitMode: false },
            "class": "HorizontalSnappableVisReorderable",
            context: {
                // params for classes inherited in the snappableMode variants below
                myReorderable: [{ param: { areaSetContent:_ } }, [me]],
                snappableReorderableController: [embedding]
            }
        },
        {
            qualifier: { jitMode: true },
            "class": "HorizontalJITSnappableVisReorderable",
            context: {
                // params for classes inherited in the snappableMode variants below
                myReorderable: [{ param: { areaSetContent:_ } }, [me]],
                snappableReorderableController: [embedding]
            }
        },
        {
            qualifier: { movableCoveringBeginningOfViewPoint: true },
            display: {
                background: "orange"
            }
        },
        {
            qualifier: { lastVisReordered: true },
            display: {
                background: "pink"
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            position: {
                top: 10,
                bottom: 10
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            position: {
                top: 0,
                bottom: 30
            }
        },
        {
            qualifier: { reordering: true,
                         adjacentToDraggedToReorderOnBeginningSide: true },
            display: {
            /*    borderColor: "black",
                borderStyle: "solid",
                borderRightWidth: 2*/
            }
        },
        {
            qualifier: { reordering: true,
                         adjacentToDraggedToReorderOnEndSide: true },
            display: {
                /*borderColor: "black",
                borderStyle: "solid",
                borderLeftWidth: 2*/
            }
        },      
        {
            qualifier: { reordering: true,
                         iAmDraggedToReorder: true },
            /*"class": "Border",
            display: {
                borderWidth: 3
            }*/
        },
        { 
            qualifier: { firstVisReordered: true,
                         snappableMode: false },
            position: {
                anchorFirstOnReorderingAxis: {
                    point1: { 
                        element: [embedding],
                        type: "left"
                    },
                    point2: { 
                        label: "beginningOfVisReorderable" 
                    },
                    equals: 0 // spacing between TestReorderableElement
                    
                }
            }
        },
        {
            qualifier: { anotherIsDraggedToReorder: true },
            variant:{
                children: {
                    whichSideOfDragged: {
                        description: {
                            "class": "GeneralArea",
                            position: {
                                left: 2, right: 2,
                                bottom: 2, height: 20
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { anotherIsDraggedToReorder: true,
                         onBeginningSideOfDraggedToReorder: true },
            children: {
                whichSideOfDragged: {
                    description: {
                        display: { text: { value: "<" } }
                    }
                }
            }
        },
        {
            qualifier: { anotherIsDraggedToReorder: true,
                         onBeginningSideOfDraggedToReorder: false },
            children: {
                whichSideOfDragged: {
                    description: {
                        display: { text: { value: ">" } }
                    }
                }
            }               
        }   
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSerialScrollMarker: {
        position: {
            attachToTopOfContainer: {
                point1: { type: "bottom" },
                point2: { element: [{ children: { testReorderableElementsContainer1:_ } }, [embedding]], type: "top" },
                equals: 0
            },
            height: 50,
            leftConstraint: {
                point1: { 
                    element: [{ children: { testReorderableElementsContainer1:_ } }, [embedding]],
                    label: [{ serialScrollLabel:_ }, [me]]
                },
                point2: { 
                    type: "left" 
                },
                equals: 0
            },
            width: 1
        },
        display: {
            background: "red"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the Reorderable Classes:\n1. Drag the grey area at the top of the yellow columns to reorder them.\n2. Drag the yellow areas to scroll/snap them (and first ensure that Snappable Mode is on (the button above the yellow columns view)\nNotes:\n-First/last columns in the os are orange/pink respectively.\n-First/last in view have a black border.\n-area being iAmDraggedToReorder gets a thicker border and its two neighbours get a thicker border on the adjoining side.\nNote: JIT: true works only with fixed width columns! (as JIT needs to be able to calculate the width of the virtual document).\n\nURL Params: to modify the number of columns, add ?nColumns=<number of columns> to the end of the URL."
        },
        position: {
            height: 250
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReorderableTestApp: {
        "class": "TestApp",
        context: {
            testResetable: true, // override TestApp default
            snappableMode: [{ children: { snappableModeButton: { checked:_ } } }, [me]],
            jitMode: [{ children: { jitModeButton: { checked:_ } } }, [me]],
            displayText: [{ movableCoveringBeginningOfViewPoint:_ }, [areaOfClass, "MovableASController"]]
        },
        children: {
            columnWidthButton: {
                description: {
                    "class": "TestColumnWidthButton"
                }
            },
            snappableModeButton: {
                description: {
                    "class": "TestSnappableModeButton"
                }
            },
            jitModeButton: {
                description: {
                    "class": "TestJITModeButton"
                }
            },
            testReorderableElementsContainer1: {
                description: { 
                    "class": "TestReorderableElementsContainer"
                }
            },      
            draggedToReorderDropSiteTracker: {
                description: {
                    position: {
                        bottom: 100,
                        height: 100,
                        leftConstraint: {
                            point1: { 
                                element: [{ children: { testReorderableElementsContainer1:_ } }, [embedding]],
                                label: "beginningOfDropSiteForDraggedToReorder"
                            },
                            point2: { 
                                type: "left" 
                            },
                            equals: 0
                        },
                        width: [{ children: { testReorderableElementsContainer1: { dropSiteGirthForDraggedToReorder:_ } } }, [embedding]]
                    },
                    display: {
                        background: "pink"
                    }
                }
            },
            serialScrollPrevWhenReordering: {
                description: {
                    "class": "TestSerialScrollMarker",
                    context: {
                        serialScrollLabel: "scrollPrevWhenReordering"
                    }
                }               
            },
            serialScrollNextWhenReordering: {
                description: {
                    "class": "TestSerialScrollMarker",
                    context: {
                        serialScrollLabel: "scrollNextWhenReordering"
                    }
                }               
            }
        }
    }
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "ReorderableTestApp"
            }
        }
    }
};

