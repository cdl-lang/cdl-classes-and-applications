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
    TestRow: o(
        { // default
            "class": o("Border", "BiStateButton", "MemberOfTopToBottomAreaOS"),
            context: {
                blockMouseEvent: false,
                
                displayText: [{ param: { areaSetContent:_ } }, [me]],
                spacingFromPrev: 10 // MemberOfTopToBottomAreaOS param
            },
            position: {
                left: 0,
                right: 0
            },
            display: {
                background: [{ myApp: { elementColor:_ } }, [me]],
                opacity: 0.2
            }
        },
        {
            qualifier: { checked: false },
            position: {
                height: 60
            }
        },
        {
            qualifier: { checked: true },
            position: {
                height: 20
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestColumn: o(
        { // default
            "class": o("Border", "TextAlignCenter", "BiStateButton", "MemberOfLeftToRightAreaOS"),
            context: {
                blockMouseEvent: false,
                displayText: [{ param: { areaSetContent:_ } }, [me]],
                spacingFromPrev: 2 // MemberOfLeftToRightAreaOS param
            },
            position: {
                top: 0,
                bottom: 0
            },
            display: {
                background: [{ myApp: { elementColor:_ } }, [me]],
                opacity: 0.2,
                text: { 
                    verticalAlign: "top"
                }
            }
        },
        {
            qualifier: { checked: false },
            position: {
                width: 40
            }
        },
        {
            qualifier: { checked: true },
            position: {
                width: 60
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestDoc: {
        "class": o("DraggableMovable"),
        context: {
            // Movable param: 
            movableController: [areaOfClass, "TestContMovableController"]
        },
        position: {
            attachTopToFirstRow: {
                point1: {
                    type: "top"
                },
                point2: {
                    element: [first, [{ children: { rows:_ } }, [me]]],
                    type: "top"
                },
                equals: 50
            },
            attachBottomToLastRow: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [last, [{ children: { rows:_ } }, [me]]],
                    type: "bottom"
                },
                equals: 0
            },
            attachLeftToFirstColumn: {
                point1: {
                    type: "left"
                },
                point2: {
                    element: [first, [{ children: { columns:_ } }, [me]]],
                    type: "left"
                },
                equals: 50
            },
            attachRightToLastColumn: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [last, [{ children: { columns:_ } }, [me]]],
                    type: "right"
                },
                equals: 0
            }
        },
        children: {
            rows: {
                data: [sequence, r(1,3)], 
                description: {
                    "class": "TestRow"
                }
            },
            columns: {
                data: o("a", "b", "c", "d", "e", "f", "g"), 
                description: {
                    "class": "TestColumn"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestContMovableController: o(
        { // default
            "class": "MatchArea",
            context: {                
                // MatchArea param:
                match: [{ children: { testDoc:_ } }, [embedding]],
                
                // ContMovableController params: (ContMovableController inheritance provided by inheriting class).
                view: [embedding],                
                beginningOfDocPoint: atomic({ 
                    element: [{ children: { testDoc:_ } }, [embedding]],
                    type: [{ context: { lowHTMLLength:_} }, [me]] 
                }),
                endOfDocPoint: atomic({
                    element: [{ children: { testDoc:_ } }, [embedding]],
                    type: [{ context: { highHTMLLength:_ } }, [me]] 
                })
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TwoDTestView: o(
        { // default
            "class": o("Border", "GeneralArea"), 
            position: {
                left: 100,
                top: 200,
                width: 200,
                height: 100            
            },
            children: {
                testDoc: {
                    description: {
                        "class": "TestDoc"
                    }
                },
                testVerticalContMovableController: {
                    description: {
                        "class": o("TestContMovableController", "VerticalContMovableController") // order of inheritance is important to override ContMovableController default vals!
                    }
                },
                testHorizontalContMovableController: {
                    description: {
                        "class": o("TestContMovableController", "HorizontalContMovableController") // order of inheritance is important to override ContMovableController default vals!
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestModalDialogable: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "Border", "ModalDialogable"),
            position: {
                right: 200,
                top: 250,
                width: 200,
                height: 20
            },
            context: { 
                displayText: "Color Changer",
                modalDialogActControl: [areaOfClass, "ModalDialogControl"],
            },
            write: {
                onTestModalDialogableMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        createModalDialog: { 
                            to: [{ createModalDialog:_ }, [me]],
                            merge: true
                        }
                    }
                },
                onTestModalDialogControlOnAct: {
                    upon: [{ enabledActModalDialogActControl:_ }, [me]],
                    true: { 
                        changeColor: {
                            to: [{ myApp: { elementColor:_ } }, [me]],
                            merge: [{ enabledActModalDialogActControl: { backgroundColor:_ } }, [me]]
                        }
                    }
                }                
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: { 
                modalDialog: {
                    description: {
                        "class": "TestModalDialog"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestModalDialog: {
        "class": o("Border", "ModalDialog"),
        display: { 
            borderColor: "red"
        },
        children: {
            green: {
                description: {
                    "class": "TestModalDialogControl",
                    context: { 
                        backgroundColor: "green"
                    },
                    position: {
                        left: 20,
                        spacingFromPink: {
                            point1: {
                                type: "right"
                            },
                            point2: {
                                element: [{ children: { pink:_ } }, [embedding]],
                                type: "left"
                            },
                            equals: 20
                        }
                    }
                }
            },
            pink: {
                description: {
                    "class": "TestModalDialogControl",
                    context: { 
                        backgroundColor: "pink"
                    },
                    position: {
                        right: 20
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestModalDialogControl: o(
        { // default
            "class": o("BackgroundColor", 
                       "Border", 
                       "ModalDialogControl" // so that the modal dialog closes on MouseDown 
                      ),
            position: {
                "vertical-center": 0,
                width: 50,
                height: 20
            }
        },
        {
            qualifier: { iAmTheAreaInFocus: true },
            display: {
                borderWidth: 2
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the ContMovableClasses library: click on pink rows/columns to toggle their height/width, resulting in scrollbars forming, if need be.\nDocument can be dragged directly, or using the scroller. Also, buttons on scrollbar allow viewFwd, viewBack, go-to-beginning, go-to-end\n\nAlso testing the modal dialog functionality: click on the Color Changer button." 
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContMovableTestApp: {
        "class": "TestApp",
        context: {
            "^elementColor": "pink" // can be modified by the ModalDialog 
        },
        children: {
            twoDView: {
                description: {
                    "class": "TwoDTestView"
                }
            },
            verticalScrollbarContainer: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [{ children: { testVerticalContMovableController:_ } }, [areaOfClass, "TwoDTestView"]],
                        attachToView: "beginning",
                        showBeginningEndDocButtons: false,
                        showViewBackFwdButtons: false,
                        showPrevNextButtons: false
                    }
                }
            },
            anotherVerticalScrollbarContainer: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [{ children: { testVerticalContMovableController:_ } }, [areaOfClass, "TwoDTestView"]],
                        attachToView: "end"
                    }
                }
            },
            horizontalScrollbarContainer: {
                description: {
                    "class": "HorizontalScrollbarContainer",
                    context: {
                        movableController: [{ children: { testHorizontalContMovableController:_ } }, [areaOfClass, "TwoDTestView"]],
                        attachToView: "end"
                    }
                }
            },
            testModalDialogable: {
                description: {
                    "class": "TestModalDialogable"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        
    }   
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "ContMovableTestApp"
            }
        }
    }
};
