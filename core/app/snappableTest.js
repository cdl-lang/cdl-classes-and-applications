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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var testConstants = {
    controllerWidth: 300,
    controllerHeight: 150,
    elementLength: 40,
    elementSpacing: 20
};

var defaultNumColumns = 15;
var defaultNumRows = 15;
var defaultJITFlag = true;
var defaultColumnsCreator = true;
var defaultRatioOfJITViewToView = 2;
var defaultPositionRelativeToPrev = true;

var classes = {
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestButton: {
        "class": o("TextAlignCenter", "BroadcastButton"),
        context: {
            // Button param:
            recipient: [embedding]
        },
        display: {
            borderWidth: 1,
            borderColor: "black",
            borderStyle: "solid"
        },
        position: {
            height: 30,
            width: 80
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableElement: o(
        {
            qualifier: "!",
            context: {
                iAmTheLastFiv: [equal,
                                [me],
                                [{ movableController: { lastFiV:_ } }, [me]]
                               ],
                iAmTheViewFwd: [equal,
                                [me],
                                [{ movableController: { movableCoveringEndOfView:_ } }, [me]]
                               ],
                iAmTheViewBack: [equal,
                                 [me],
                                 [{ movableController: { movableCoveringViewLengthBeforeBeginningOfView:_ } }, [me]]
                                ]
            }
        },
        { // default
            "class": o("DefaultDisplayText", "Border", "TrackSnappableTestApp", "GeneralArea"),
            context: {
                uniqueID: [{ param: { areaSetContent:_ }}, [me]],
                displayText: [{ uniqueID:_ }, [me]],
                
                lengthAlongMovableAxis: testConstants.elementLength
            },
            display: {
                background: "lightgrey",
                opacity: 0.2,
                text: {
                    verticalAlign: "top"                    
                }
            }
            // position: positioning relative to prev in areaSet is handled by the sibling class MovableInAS
        },
        {
            qualifier: { tmd: true },
            display: {
                borderColor: "red"
            }
        },
        {
            qualifier: { movableCoveringBeginningOfViewPoint: true },
            display: {
                background: "red"
            }
        },
        {
            qualifier: { iAmTheViewBack: true },
            display: {
                background: "orange"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Column: o(
        { // default
            "class": "SnappableElement",
            context: {                
                // Snappable param:  
                movableController: [{ children: { columnsController:_ } }, [areaOfClass, "TestContainer"]]
            },
            position: {
                top: 0,
                height: 800,
                width: [{ lengthAlongMovableAxis:_ }, [me]]
            }
        },
        {
            qualifier: { jitFlag: true },
            "class": "HorizontalJITSnappable",
            context: {            
                tmdableContinuePropagation: true // to override the default provided by Snappable
            }
        },
        {
            qualifier: { jitFlag: false },
            "class": "HorizontalSnappable",
            context: {                              
                tmdableContinuePropagation: true, // to override the default provided by Snappable
                positionRelativeToPrev: [arg, "positionRelativeToPrev", defaultPositionRelativeToPrev]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Row: o(
        { // default
            "class": "SnappableElement",
            context: {
                // Snappable param:  
                movableController: [{ children: { rowsController:_ } }, [areaOfClass, "TestContainer"]]
            },
            position: {
                left: 0,
                height: [{ lengthAlongMovableAxis:_ }, [me]],
                width: 600
            }
        },
        {
            qualifier: { jitFlag: true },
            "class": "VerticalJITSnappable",
            context: {                              
                tmdableContinuePropagation: true // to override the default provided by Snappable
            }           
        },
        {
            qualifier: { jitFlag: false },
            "class": "VerticalSnappable",
            context: {                              
                tmdableContinuePropagation: true // to override the default provided by Snappable
            }           
        }
    ),
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableController: o(
        { // default 
            "class": o("GeneralArea", "TrackSnappableTestApp"),
            position: {
                width: testConstants.controllerWidth, 
                right: 10, 
                height: testConstants.controllerHeight
            },
            children: {
                title: {
                    description: {
                        "class": o("DefaultDisplayText", "GeneralArea"),
                        context: {
                            displayText: [{ titleText:_ }, [embedding]] 
                        },
                        position: {
                            left: 0,
                            top: 0,
                            width: 100,
                            height: 50
                        }
                    }
                },
                firstInViewID: {
                    description: {
                        "class": o("DefaultDisplayText", "GeneralArea"),
                        context: {
                            displayText: [{ firstInView: { uniqueID:_ } }, [embedding]] 
                        },
                        position: {
                            left: 100,
                            top: 0,
                            width: 100,
                            height: 50
                        }
                    }
                },
                
                first: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "BeginningOfDoc",
                            displayText: "First"
                        },
                        position: {
                            left: 10,
                            bottom: 60
                        }
                    }
                },
                last: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "EndOfDoc",
                            displayText: "Last"
                        },
                        position: {
                            left: 110,
                            bottom: 60                        
                        }
                    }
                },
                viewFwd: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "ViewFwd",
                            displayText: "View Fwd"
                        },
                        position: {
                            left: 210,
                            bottom: 60                        
                        }
                    }
                },
                next: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "Next",
                            displayText: "Next"
                        },
                        position: {
                            left: 10,
                            bottom: 10
                        }
                    }
                },
                prev: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "Prev",
                            displayText: "Prev"
                        },
                        position: {
                            left: 110,
                            bottom: 10
                        }
                    }
                },            
                viewBack: {
                    description: {
                        "class": "TestButton",
                        context: {
                            message: "ViewBack",
                            displayText: "View Back"
                        },
                        position: {
                            left: 210,
                            bottom: 10                      
                        }
                    }
                }
            },
            display: {
                background: "pink"
            }     
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableControl: o(
        { // default
            "class": o("BiStateButton", "Border"),
            context: {
                displayText: [concatStr, 
                              o(
                                [{ prefixDisplayText:_ }, [me]], 
                                ": ", 
                                [{ suffixDisplayText:_ }, [me]]
                               )
                             ]
            },
            position: {
                left: 10,
                width: 200,
                height: 20
            }
        },
        // default values for suffixDisplayText
        {
            qualifier: { checked: true },
            context: {
                suffixDisplayText: true
            }
        },
        {
            qualifier: { checked: false },
            context: {
                suffixDisplayText: "False"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableJITFlagControl: o(
        { // default
            "class": o("TestSnappableControl", "TrackSnappableTestApp"),
            context: { 
                checked: [{ myApp: { jitFlag:_ } }, [me]],
                prefixDisplayText: "Snappables Created"
            },
            position: {
                top: 200
            }
        },
        {
            qualifier: { checked: true },
            context: {
                suffixDisplayText: "JIT"
            }
        },
        {
            qualifier: { checked: false },
            context: {
                suffixDisplayText: "On Load"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableFillUpViewToCapacityControl: {
        "class": o("TestSnappableControl", "TrackSnappableTestApp"),
        context: { 
            checked: [{ myApp: { fillUpViewToCapacity:_ } }, [me]],
            prefixDisplayText: "Fill up view to capacity",
        },
        position: {
            top: 250
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverrideSnappableControllerParams: {
        "class": o("TrackSnappableTestApp"),
        context: {
            fillUpMovablesViewToCapacity: [{ fillUpViewToCapacity:_ }, [me]], // override MovableAsController default value.
            
            // MovableASController params:
            movableSpacing: testConstants.elementSpacing,
            
            // JITSnappableController params: required by sibling classes inherited by ColumnsController/RowsController
            lengthOfJITElement: testConstants.elementLength,
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverrideSnappableColumnsParams: {
        "class": "OverrideSnappableControllerParams",
        context: {
            ratioOfJITViewToView: [arg, "ratioOfJITViewToView", defaultRatioOfJITViewToView],
            beginningOfViewPoint: atomic({ 
                                            element: [areaOfClass, "TestSnappableView"], 
                                            type: "left",
                                            content: true                                           
                                         }),
            endOfViewPoint: atomic({ 
                                        element: [areaOfClass, "TestSnappableView"], 
                                        type: "right",
                                        content: true                                       
                                   }),
                                   
            movablesUniqueIDs: [{ myApp: { uniqueIDsOfColumns:_ } }, [me]],
            movablesBaseSetUniqueIDs: [{ myApp: { uniqueIDsOfAllColumns:_ } }, [me]],
            
            // only for testing AOT with the absolute positioning of columns!
            lengthOfJITElementPlusSpacing: [plus,
                                            [{ lengthOfJITElement:_ }, [me]],
                                            [{ movableSpacing:_ }, [me]]
                                           ]            
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ColumnsController: o(
        { // default
            "class": "TestSnappableController",
            context: {
                // SnappableController params
                movables: [{ children: { columns:_ } }, [embedding]],
                titleText: "First column:"
            },
            position: {
                bottom: 10
            }
        },
        {
            qualifier: { jitFlag: true },
            "class": o("OverrideSnappableColumnsParams", // appear before the SnappableController so as to override its default values. can't move it to the default clause, as then it wouldn't!
                       "HorizontalJITSnappableController")
        },
        {
            qualifier: { jitFlag: false },
            "class": o("OverrideSnappableColumnsParams", // appear before the SnappableController so as to override its default values. can't move it to the default clause, as then it wouldn't!
                       "HorizontalSnappableController")
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverrideSnappableRowsParams: {
        "class": "OverrideSnappableControllerParams",
        context: {
            beginningOfViewPoint: atomic({ 
                                            element: [areaOfClass, "TestSnappableView"], 
                                            type: "top",
                                            content: true
                                         }),
            endOfViewPoint: atomic({ 
                                        element: [areaOfClass, "TestSnappableView"], 
                                        type: "bottom",
                                        content: true
                                   }),
                                   
            movablesUniqueIDs: [{ myApp: { uniqueIDsOfAllRows:_ } }, [me]],
            // movablesBaseSetUniqueIDs: obtains default value from SnappableController
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RowsController: o(
        { // default
            "class": "TestSnappableController",
            context: {
                movables: [{ children: { rows:_ } }, [embedding]],
                movableSpacing: testConstants.elementSpacing,
                titleText: "First row:"
            },
            position: {
                top: 10
            }
        },
        {
            qualifier: { jitFlag: true },
            "class": o("OverrideSnappableRowsParams", // appear before the SnappableController so as to override its default values. can't move it to the default clause, as then it wouldn't!
                       "VerticalJITSnappableController")
        },
        {
            qualifier: { jitFlag: false },
            "class": o("OverrideSnappableRowsParams", // appear before the SnappableController so as to override its default values. can't move it to the default clause, as then it wouldn't!
                       "VerticalSnappableController")
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestContainer: o(
        { // default 
            "class": o("Border", "GeneralArea", "TrackSnappableTestApp"),
            position: {
                left: 250, right: 50, top: 200, bottom: 100
            },
            children: {
                snappableView: {
                    description: {
                        "class": "TestSnappableView"
                    }
                },
                columns: {
                    data: [{ columnsData:_ }, [me]],
                    description: {
                        "class": "Column"
                    }
                },
                columnsController: {
                    description: {
                        "class": "ColumnsController"
                    }
                },                
                columnsScrollbar: {
                    description: {
                        "class": "HorizontalScrollbarContainerOfSnappable",
                        context: {
                            movableController: [{ children: { columnsController:_ } }, [embedding]]
                        },
                        position: {
                            anchorControllerLeft: {
                                point1: {
                                    type: "left"
                                },
                                point2: { 
                                    element: [{ children: { columnsController:_ } }, [embedding]],
                                    type: "left"
                                },
                                equals: 0
                            },
                            anchorControllerRight: {
                                point1: {
                                    type: "right"
                                },
                                point2: { 
                                    element: [{ children: { columnsController:_ } }, [embedding]],
                                    type: "right"
                                },
                                equals: 0
                            },
                            anchorVertically: {
                                point1: {
                                    type: "bottom"
                                },
                                point2: { 
                                    element: [{ children: { columnsController:_ } }, [embedding]],
                                    type: "top"
                                },
                                equals: 0
                            }
                        }
                    }
                },
                rows: {
                    data: [{ myApp: { uniqueIDsOfAllRows:_ } }, [me]],
                    description: {
                        "class": "Row"
                    }
                },
                rowsController: {
                    description: {
                        "class": "RowsController"
                    }
                },
                rowsScrollbar: {
                    description: {
                        "class": "VerticalScrollbarContainerOfSnappable",
                        context: {
                            movableController: [{ children: { rowsController:_ } }, [embedding]]
                        },
                        position: {
                            anchorHorizontally: {
                                point1: {
                                    type: "right"
                                },
                                point2: { 
                                    element: [{ children: { rowsController:_ } }, [embedding]],
                                    type: "left"
                                },
                                equals: 0
                            },
                            anchorToControllerTop: {
                                point1: {
                                    type: "top"
                                },
                                point2: { 
                                    element: [{ children: { rowsController:_ } }, [embedding]],
                                    type: "top"
                                },
                                equals: 0
                            },
                            anchorToControllerBottom: {
                                point1: {
                                    type: "bottom"
                                },
                                point2: { 
                                    element: [{ children: { rowsController:_ } }, [embedding]],
                                    type: "bottom"
                                },
                                equals: 0
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { jitFlag: true },
            context: {
                columnsData: [pos,
                              [{ children: { columnsController: { jitMovablesRange:_ } } }, [me]],
                              [{ myApp: { uniqueIDsOfColumns:_ } }, [me]]
                             ]
            }
        },
        {
            qualifier: { jitFlag: false },
            context: {
                columnsData: [{ myApp: { uniqueIDsOfColumns:_ } }, [me]]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSnappableView: {
        "class": "Border",
        display: {
            borderWidth: 2
        },
        position: {
            top: 100,
            left: 150,
            height: 200,
            width: 200
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestColumnsCreator: {
        "class": o("Border", "GeneralArea"),
        children: {
            creators: {
                data: [{ myApp: { uniqueIDsOfAllColumns:_ } }, [me]],
                description: {
                    "class": "TestColumnCreator"
                }
            }
        },
        position: {
            height: 50,
            bottom: 10,
            left: 10,
            right: 10
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestColumnCreator: o(
        { // variant-controller
            qualifier: "!",
            context: {
                toBeCreated: [not,
                              [
                               [{ uniqueID:_ }, [me]],
                               [{ myApp: { uniqueIDsOfColumnsNotToBeCreated:_ } }, [me]]
                              ]
                             ]
            }
        },
        { // default
            "class": o("Border", "ButtonDesign", "GeneralArea", "MemberOfLeftToRightAreaOS"),
            context: {
                uniqueID: [{ param: { areaSetContent:_ } }, [me]],
                displayText: [{ uniqueID:_ }, [me]],
                spacingFromPrev: 20 // MemberOfLeftToRightAreaOS param
            },
            position: {
                width: 40,
                top: 2,
                bottom: 2
            },
            write: {
                onTestColumnCreatorMouseClick: {
                    "class": "OnMouseClick",
                    // true: see variants for toBeCreated below
                }
            }
        },
        {
            qualifier: { toBeCreated: true },
            write: {
                onTestColumnCreatorMouseClick: {
                    // upon: defined in default clause above
                    true: {
                        addToUniqueIDsOfColumnsNotToBeCreated: {
                            to: [{ myApp: { uniqueIDsOfColumnsNotToBeCreated:_ } }, [me]],
                            merge: push([{ uniqueID:_ }, [me]])
                        }
                    }
                }
            }
        },
        {
            qualifier: { toBeCreated: false },
            write: {
                onTestColumnCreatorMouseClick: {
                    // upon: defined in default clause above
                    true: {
                        removeFromUniqueIDsOfColumnsNotToBeCreated: {
                            to: [
                                [{ uniqueID:_ }, [me]],
                                [{ myApp: { uniqueIDsOfColumnsNotToBeCreated:_ } }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            },
            display: {
                background: "red"
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: 5
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackSnappableTestApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                jitFlag: [{ myApp: { jitFlag:_ } }, [me]],
                fillUpViewToCapacity: [{ myApp: { fillUpViewToCapacity:_ } }, [me]]
            }       
        },
        { // default
            "class": "GeneralArea"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITMarker: {
        "class": o("GeneralArea", "AboveSiblings"),
        position: {
            width: 2,
            height: 30,
            attachToJITLabel: {
                point1: {
                    type: "left"
                },
                point2: [{ labelToTrack:_ }, [me]],
                equals: 0
            }           
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITDocMarker: {
        "class": "JITMarker",
        display: { background: "blue" },
        position: {
            attachToTopOfContainer: {
                point1: { type: "top" },
                point2: { 
                    element: [areaOfClass, "TestContainer"],
                    type: "top"
                },
                equals: 0
            }           
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BeginningOfJITDocMarker: {
        "class": "JITDocMarker",
        context: {
            labelToTrack: [{ beginningOfDocPoint:_ }, [areaOfClass, "ColumnsController"]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EndOfJITDocMarker: {
        "class": "JITDocMarker",
        context: {
            labelToTrack: [{ endOfDocPoint:_ }, [areaOfClass, "ColumnsController"]]        
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITViewMarker: {
        "class": "JITMarker",
        display: { background: "green" },
        position: {
            attachToBottomOfContainer: {
                point1: { type: "bottom" },
                point2: { 
                    element: [areaOfClass, "TestContainer"],
                    type: "bottom"
                },
                equals: 0
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BeginningOfJITViewMarker: {
        "class": "JITViewMarker",
        context: {
            labelToTrack: [{ beginningOfJITView:_ }, [areaOfClass, "ColumnsController"]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EndOfJITViewMarker: {
        "class": "JITViewMarker",
        context: {
            labelToTrack: [{ endOfJITView:_ }, [areaOfClass, "ColumnsController"]]        
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableTestApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                columnsCreator: true//[arg, "columnsCreator", defaultColumnsCreator]
            }           
        },
        { // default 
            "class": o("TestApp"),
            context: {
                testResetable: true, // override TestApp default
                uniqueIDsOfAllColumns: [sequence, r(1,[arg, "nColumns", defaultNumColumns])],
                uniqueIDsOfAllRows: [sequence, r(1,[arg, "nRows", defaultNumRows])],
                
                "^uniqueIDsOfColumnsNotToBeCreated": o(),
                uniqueIDsOfColumns: [
                                     n([{ uniqueIDsOfColumnsNotToBeCreated:_ }, [me]]),
                                     [{ uniqueIDsOfAllColumns:_ }, [me]]
                                    ],
                                    
                initialJITFlag: [arg, "JIT", defaultJITFlag],
                "^jitFlag": [{ initialJITFlag:_ }, [me]],
                initialFillUpViewToCapacity: true,
                "^fillUpViewToCapacity": [{ initialFillUpViewToCapacity:_ }, [me]]
            },
            children: {
                container: {
                    description: {
                        "class": "TestContainer"
                    }
                },
                jitControl: {
                    description: {
                        "class": "TestSnappableJITFlagControl"
                    }
                },
                fillUpViewToCapacityControl: {
                    description: {
                        "class": "TestSnappableFillUpViewToCapacityControl"
                    }
                }
            }
        },
        {
            qualifier: { columnsCreator: true },
            children: {
                columnsCreator: {
                    description: {
                        "class": "TestColumnsCreator"
                    }
                }
            }
        },
        {
            qualifier: { jitFlag: true },
            children: {
                beginningOfJITDocMarker: {
                    description: {
                        "class": "BeginningOfJITDocMarker"
                    }
                },
                endOfJITDocMarker: {
                    description: {
                        "class": "EndOfJITDocMarker"
                    }
                },
                beginningOfJITViewMarker: {
                    description: {
                        "class": "BeginningOfJITViewMarker"
                    }
                },
                endOfJITViewMarker: {
                    description: {
                        "class": "EndOfJITViewMarker"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Snap To Grid Demo:\nDrag columns, drag rows, drag both (by mouseDown at their intersection), or control using:\n1. The scrollbars - (red buttons for beginningOfDoc/endOfDoc, pink buttons for viewBack/viewFwd, yellow buttons for prev/next snappable element)\n2. The pink direct-access control buttons.\nNote:\n1. URL params: to modify # of columns: nColumns=<number of columns>; to control JIT: JIT=<boolean> (true by default); to control columns creator bottom panel: columnsCreator<boolean> (true by default) ;\n    to control length of JIT view: ratioOfJITViewToView=<value> ; to control relative vs. absolute positioning (only in JIT=false mode): positionRelativeToPrev=<boolean>\n2. Column Creation: the panel at the bottom allows to remove columns of the matching numbering - click on one or several of these rectangles to turn them red and thus remove their corresponding column from the main view.\n3. Snappables Created Control: will they be created Just in Time, or all will be created on load.\n4. Fill View to Capacity: will scrolling always end in the view being as full as possible?"
        },
        position: {
            height: 180
        },
        display: {
            text: { fontSize: 10 }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        "class": superclass,
        context: {
            myController: [areaOfClass, "TestReorderableElementsContainer"]
        },
        position: {
            left: 10,
            bottom: 150
        },
        write: {
            onTestResetControlReset: {
                // upon: provided by superclass
                true: {
                    resetSnappableControllers: {
                        to: [{ specifiedFiVUniqueID:_ }, [areaOfClass, "TestSnappableController"]],
                        merge: o()
                    },
                    resetColumnCreators: {
                        to: [{ myApp: { uniqueIDsOfColumnsNotToBeCreated:_ } }, [me]],
                        merge: o()
                    },
                    resetJITFlag: {
                        to: [{ myApp: { jitFlag:_ } }, [me]],
                        merge: [{ myApp: { initialJITFlag:_ } }, [me]]
                    },
                    resetFillUpViewToCapacity: {
                        to: [{ myApp: { fillUpViewToCapacity:_ } }, [me]],
                        merge: [{ myApp: { initialFillUpViewToCapacity:_ } }, [me]]
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
                "class": "SnappableTestApp"
            }
        }
    }    
};
