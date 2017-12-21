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
var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CenterAreaSetHorizontally: {
        position: {
            centerChildrenHorizontally: {
                pair1: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [first, [{ horizontallyCenteredAreaSet:_ }, [me]]],
                        type: "left"
                    }
                },
                pair2: {
                    point1: {
                        element: [last, [{ horizontallyCenteredAreaSet:_ }, [me]]],
                        type: "right"
                    },
                    point2: {
                        type: "right"
                    }
                },
                ratio: 1
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestControls: {
        "class": o("CenterAreaSetHorizontally", "GeneralArea"),
        context: {
            // CenterAreaSetHorizontally param
            horizontallyCenteredAreaSet: [{ children: { testControls:_ } }, [me]],
        },
        children: {
            testControls: {
                data: o(
                        {
                          name: "Third",
                          stateNames: o("Trivial", "Projection", "Selection"),
                        },
                        {
                          name: "Second",
                          stateNames: o("First", "Second", "Last")
                        },
                        {
                          name: "First",
                          stateNames: o("Trivial", "Projection", "Selection")
                        }
                       ),                
                description: {
                    "class": "WritableRefTestControl"
                }
            }
        },
        position: {
            top: 100,
            height: 100,
            left: 10,
            right: 10
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                name: [{ param: { areaSetContent: { name:_ } } }, [me]],
                "^state": [first, [{ param: { areaSetContent: { stateNames:_ } } }, [me]]]
            }
        },
        { // default
            "class": o("Border", "ButtonDesign", "GeneralArea", "CenterAreaSetHorizontally", "MemberOfLeftToRightAreaOS"),
            context: {
                displayText: [{ name:_ }, [me]],
                                
                horizontallyCenteredAreaSet: [{ children: { controlStates:_ } }, [me]], // CenterAreaSetHorizontally param
                spacingFromPrev: 10 // MemberOfLeftToRightAreaOS
            },
            position: {
                top: 0,
                bottom: 0,
                height: 100,
                width: 400
            },
            children: {
                controlStates: {
                    data: [{ param: { areaSetContent: { stateNames:_ } } }, [me]],
                    description: {
                        "class": "WritableRefTestControlState"
                    }
                }
            }
        },
        { 
            qualifier: { state: "Trivial" },
            context: {
                operation: n()
            }
        },
        { 
            qualifier: { name: "First",
                         state: "Projection" },
            context: {
                operation: { "attr":_ }
            }
        },
        { 
            qualifier: { name: "First",
                         state: "Selection" },
            context: {
                operation: { "color": "black" }
            }
        },
        /*{ 
            qualifier: { name: "Second",
                         "state": "First" },
            context: {
                operation: [defun, o("os"), [first, "os"]]
            }
        },
        { 
            qualifier: { name: "Second",
                         "state": "Second" },
            context: {
                operation: [defun, o("os"), [pos, 1, "os"]]
            }
        },
        { 
            qualifier: { name: "Second",
                         "state": "Last" },
            context: {
                operation: [defun, o("os"), [last, "os"]]
            }
        },*/
        { 
            qualifier: { name: "Third",
                         "state": "Projection" },
            context: {
                operation: { "val":_ }
            }
        },
        { 
            qualifier: { name: "Third",
                         "state": "Selection" },
            context: {
                operation: { "color": "green" }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestControlState: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectedState: [equal,
                                [{ state:_ }, [me]],
                                [{ state:_ }, [embedding]]
                               ]
            }
        },
        { // default
            "class": o("Border", "ButtonDesign", "GeneralArea", "MemberOfLeftToRightAreaOS"),
            context: {
                state: [{ param: { areaSetContent:_ } }, [me]],
                displayText: [{ state:_ }, [me]],
                spacingFromPrev: 10 // MemberOfLeftToRightAreaOS param
            },
            position: {
                bottom: 10,
                height: 20,
                width: 60
            },
            write: {
                onWritableRefTestControlStateMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        changeState: {
                            to: [{ state:_ }, [embedding]],
                            merge: [{ state:_ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { selectedState: true },
            "class": "TextBold"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestWriteThroughControl: {
        "class": o("Border", "ButtonDesign", "GeneralArea"),
        context: {
            overrideText: "'Pink'",
            displayText: [concatStr, o("Write through: ", [{ overrideText:_ }, [me]])]
        },
        position: {
            "horizontal-center": 0,
            width: 200,
            height: 20,
            bottomConstraint: {
                point1: { type: "bottom" },
                point2: { element: [areaOfClass, "WritableRefTestOperationsOnAppDataDisplay"], type: "top" },
                equals: 50
            }
        },
        write: {
            onTestWrite: {
                "class": "OnMouseClick",
                true: {
                    writeAppData: {
                        to: [{ displayDebugObj:_ }, [areaOfClass, "WritableRefTestOperationsOnAppDataDisplay"]],
                        merge: [{ overrideText:_ }, [me]]
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestOperationsOnAppDataDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // because of feg limitations, we cannot query the secondStep control's operation here, as it is a function. instead, we have variants here
                // for its different states, and the appropriate function is hard-coded in them
                secondStepState: [{ secondStepControl: { state:_ } }, [me]]
            }
        },
        {
            "class": o("Border", "GeneralArea"),
            context: {
                firstStepControl: [{ name: "First" }, [areaOfClass, "WritableRefTestControl"]],
                secondStepControl: [{ name: "Second" }, [areaOfClass, "WritableRefTestControl"]],
                thirdStepControl: [{ name: "Third" }, [areaOfClass, "WritableRefTestControl"]]              
            },
            display: {
                text: {
                    value: [debugNodeToStr, [{displayDebugObj:_},[me]], false]
                }
            },
            position: {
                bottomConstraint: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "WritableRefTestResetAppDataControl"], type: "top" },
                    equals: 50
                },
                left: 10,
                right: 10,
                height: 40
            }       
        },
        {
            qualifier: { secondStepState: "First" },
            context: {
                displayDebugObj:[
                                 [{ thirdStepControl: { operation:_ } }, [me]],
                                 [
                                  first,
                                  [
                                   [{ firstStepControl: { operation:_ } }, [me]],
                                   [{ myApp: { appData:_ } }, [me]]
                                  ]
                                 ]
                                ]           
            }
        },
        {
            qualifier: { secondStepState: "Second" },
            context: {
                displayDebugObj:[
                                 [{ thirdStepControl: { operation:_ } }, [me]],
                                 [
                                  pos,
                                  1, // the second element
                                  [
                                   [{ firstStepControl: { operation:_ } }, [me]],
                                   [{ myApp: { appData:_ } }, [me]]
                                  ]
                                 ]
                                ]           
            }
        },
        {
            qualifier: { secondStepState: "Last" },
            context: {
                displayDebugObj:[
                                 [{ thirdStepControl: { operation:_ } }, [me]],
                                 [
                                  last,
                                  [
                                   [{ firstStepControl: { operation:_ } }, [me]],
                                   [{ myApp: { appData:_ } }, [me]]
                                  ]
                                 ]
                                ]           
            }
        }       
    ),
    ResultSizeDisplay: {
        "class": o("Border", "GeneralArea"),
        display: {
            text: {
                value: [concatStr,
                        o([size, [[{ firstStepControl: { operation:_ } }, [me]],
                                  [{ myApp: { appData:_ } }, [me]]]],
                          [size, [{displayDebugObj:_}, [areaOfClass, "WritableRefTestOperationsOnAppDataDisplay"]]]),
                       ", "]
            }
        },
        position: {
            topConstraint: {
                point1: { type: "bottom", element: [areaOfClass, "WritableRefTestOperationsOnAppDataDisplay"] },
                point2: { type: "top" },
                equals: 10
            },
            bottomConstraint: {
                point1: { type: "bottom" },
                point2: { element: [areaOfClass, "WritableRefTestResetAppDataControl"], type: "top" },
                equals: 10
            },
            width: 80,
            horizontalCenter: {
                point1: { type: "horizontal-center" },
                point2: { element: [areaOfClass, "WritableRefTestResetAppDataControl"], type: "horizontal-center" },
                equals: 0
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestAppDataElement: o(
        { // default
            "class": o("Border", "GeneralArea", "MemberOfTopToBottomAreaOS"),
            context: { 
                displayDebugObj: [{ param: { areaSetContent:_ } }, [me]]
            },
            display: {
                text: {
                    value: [debugNodeToStr, [{displayDebugObj:_},[me]], false]
                }
            },
            position: {
                left: 0,
                right: 0,
                height: 40
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                top: 50
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestAppDataDisplay: {
        "class": o("Border", "GeneralArea"),
        position: {
            bottom: 10,
            height: 160,
            left: 10,
            right: 10
        },
        children: {
            appDataElements: {
                data: [{ myApp: { appData:_ } }, [me]],
                description: {
                    "class": "WritableRefTestAppDataElement"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestResetAppDataControl: {
        "class": o("Border", "ButtonDesign", "GeneralArea"),
        context: {
            displayText: "Reset appData"
        },
        position: {
            "horizontal-center": 0,
            width: 100,
            height: 20,
            bottomConstraint: {
                point1: { type: "bottom" },
                point2: { element: [areaOfClass, "WritableRefTestAppDataDisplay"], type: "top" },
                equals: 50
            }
        },
        write: {
            onResetAppDataControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetAppData: {
                        to: [{ myApp: { appData:_ } }, [me]],
                        merge: [{ myApp: { pristineData:_ } }, [me]]
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableRefTestApp: {
        "class": "App",
        context: {
            pristineData: o(
                          { 
                            val: 1,
                            color: "black",
                            attr: o(
                                    {
                                      val: 11,
                                      color: "blue",
                                      attr: o(111,112,113,114)
                                    },
                                    {
                                      val: 12,
                                      color: "green",
                                      attr: o(121,122,123,124)
                                    },
                                    {
                                      val: 13,
                                      color: "blue",
                                      attr: o(131,132,133,134)
                                    },
                                    {
                                      val: 14,
                                      color: "green",
                                      attr: o(141,142,143,144)
                                    }
                                   )
                          },
                          { 
                            val: 2,
                            color: "red",
                            attr: o(
                                    {
                                      val: 21,
                                      color: "blue",
                                      attr: o(211,212,213,214)
                                    },
                                    {
                                      val: 22,
                                      color: "green",
                                      attr: o(221,222,223,224)
                                    },
                                    {
                                      val: 23,
                                      color: "blue",
                                      attr: o(231,232,233,234)
                                    },
                                    {
                                      val: 24,
                                      color: "green",
                                      attr: o(241,242,243,244)
                                    }
                                   )
                          },
                          { 
                            val: 3,
                            color: "black",
                            attr: o(
                                    {
                                      val: 31,
                                      color: "blue",
                                      attr: o(311,312,313,314)
                                    },
                                    {
                                      val: 32,
                                      color: "green",
                                      attr: o(321,322,323,324)
                                    },
                                    {
                                      val: 33,
                                      color: "blue",
                                      attr: o(331,332,333,334)
                                    },
                                    {
                                      val: 34,
                                      color: "green",
                                      attr: o(341,342,343,344)
                                    }
                                   )
                          },
                          { 
                            val: 4,
                            color: "red",
                            attr: o(
                                    {
                                      val: 41,
                                      color: "blue",
                                      attr: o(411,412,413,414)
                                    },
                                    {
                                      val: 42,
                                      color: "green",
                                      attr: o(421,422,423,424)
                                    },
                                    {
                                      val: 43,
                                      color: "blue",
                                      attr: o(431,432,433,434)
                                    },
                                    {
                                      val: 44,
                                      color: "green",
                                      attr: o(441,442,443,444)
                                    }
                                   )
                          }
                         ),
            "^appData": [{ pristineData:_ }, [me]]
        },
        children: {
            annotation: {
                description: {
                    "class": "TestAnnotation",
                    context: {
                        displayText: "This test attempts various different sequences of writable references to appData, testing projections and selections"
                    }
                }
            },
            operationControls: {
                description: {
                    "class": "WritableRefTestControls"
                }
            },
            writeThroughControl: {
                description: {
                    "class": "WritableRefTestWriteThroughControl"
                }
            },          
            operationsOnAppData: {
                description: {
                    "class": "WritableRefTestOperationsOnAppDataDisplay"
                }
            },
            resultSizeDisplay: {
                description: {
                    "class": "ResultSizeDisplay"
                }
            },
            resetAppDataControl: {
                description: {
                    "class": "WritableRefTestResetAppDataControl"
                }
            },
            appDataDisplay: {
                description: {
                    "class": "WritableRefTestAppDataDisplay"
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
                "class": "WritableRefTestApp"
            }
        }
    }
};
