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

var classes = {
    /////////////////////////////////////////////////////

    ScreenArea: {

    },

    /////////////////////////////////////////////////////

    FunctionPanel: {

    },


  ////////////////////////////////////////////////////    

    ClickerValueSwitch: {
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    select: {
                        to: [{ valueToBeFlipped: _ }, [me]],
                        merge: [not, [{ valueToBeFlipped: _ }, [me]]]
                    },
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////
    // API:
    // 1. Give a title to button with [{buttonTitle: _}, [me]] 
    // 2. requires to add a cleaning qualifier that switches numLineActive to false 
    NumbersFromUser:
    o(
        {
            qualifier: "!",
            context: {
                "^numLineActive": false,
            }
        },
        {
            context: {
                "^valueBeforeFuncAdd": o(),
                qryName: [mergeWrite,
                    [{ valueBeforeFuncAdd: _ }, [me]],
                    [{ buttonTitle: _ }, [me]]
                ],
                numberInDisplay: [{ param: { input: { value: _ } } }, [me]],
            }
        },
        {
            "class": "ClickerValueSwitch",
            context: {
                valueToBeFlipped: [{ numLineActive: _ }, [me]],

            },
            display: {
                text: {
                    value: [{ qryName: _ }, [me]]
                }
            },
        },
        {
            qualifier: { numLineActive: false },
            display: {
                text: {
                    value: [{ qryName: _ }, [me]]
                }
            }
        },
        {
            qualifier: { numLineActive: true },
            display: {
                background: "#dddddd",
                text: {
                    input: {
                        type: "number",
                        placeholder: "number here",
                        init: {
                            selectionStart: 0,
                            selectionEnd: -1,
                            focus: true
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////

    PanelHeader: {
        display: {
            background: "pink",
            text: {
                value: [{ headerDisplay: _ }, [me]]
            }
        },
        position: {
            width: [{ panelWidth: _ }, [areaOfClass, "ScreenArea"]],
            height: 30,
            alignToPanelTop: {
                point1: {
                    type: "top",
                    element: [embedding]
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        }
    },

    //////////////////////////////////////////////////////////

    TrackMyPanel: {
        context: {
            myPanelfamilyTree: [[embeddingStar, [me]], [areaOfClass, "FunctionPanel"]],
            myColumnfamilyTree: [[embeddingStar, [me]], [areaOfClass, "GeneralColumnPanel"]],
            myPanelButtons: [
                { myPanelfamilyTree: [{ myPanelfamilyTree: _ }, [me]] },
                [areaOfClass, "NumbersFromUser"]
            ],
            myRecivedData: [{ myColumnfamilyTree: [{ myColumnfamilyTree: _ }, [me]] }, [areaOfClass, "RecivedDataPosition"]],
            myPanelHeader: [
                { myColumnfamilyTree: [{ myColumnfamilyTree: _ }, [me]] },
                [areaOfClass, "PanelHeader"]],
        }
    },

  
    /////////////////////////////////////////////////////////////////////

    AddFunctionButton: o(
        {
            qualifier: "!",
            context: {
                noEmptyButtonsValue: [equal,
                    [size, [{ myCoefficient: _ }, [areaOfClass, "ABButtonsAction"]]],
                    [size, [areaOfClass, "ABButtonsAction"]]
                ]
            }
        },
        {
            context: {
                "^aAttributeFromUser": o(),
                "^bAttributeFromUser": o(),
                "^temporaryAttributeHolder": o({ a: o(), b: o() }),
                "^freshFromUser": o(),
                defualtAAndBValues: o(),
                functionATOB: [mergeWrite,
                    [{ freshFromUser: _ }, [me]],
                    [{ defualtAAndBValues: _ }, [me]]
                ],
            }
        },
        {
            qualifier: { noEmptyButtonsValue: true },
            write: {
                addNewFunction: {
                    upon: [{ subType: "Click" }, [myMessage]],
                    true: {
                        tempoOrderSetToFuncOrderSet: {
                            to: [{ functionATOB: _ }, [me]],
                            merge: o(
                                [{ temporaryAttributeHolder: _ }, [me]],
                                [{ freshFromUser: _ }, [me]]
                            )
                        },
                        resetInputButtonsValue: {
                            to: [{ temporaryAttributeHolder: _ }, [me]],
                            merge: o()
                        },
                        resetInputButtonsTitle: {
                            to: [{ qryName: _ }, [{ myPanelButtons: _ }, [me]]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////

    RecivedDataPosition: {
        display: {
            text: {
                value: [{ param: { areaSetContent: _ } }, [me]]
            }
        },
        position: {
            maintainBoxOrder: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    type: "top",
                    element: [prev]
                },

                equals: 20
            },
        }
    },

    /////////////////////////////////////////////////////////////////////////////////

    NumInputBox: o(
        {
            context: {
                "^inputXOrderSet": o(),
            },
            position: {
                firstdataInput: {
                    point1: {
                        type: "bottom",
                        element: [{ myPanelHeader: _ }, [me]]
                    },
                    point2: {
                        type: "top"
                    },
                    min: 20
                },
                underStoredUserData: {
                    point1: {
                        type: "bottom",
                        element: [first, [{ myRecivedData: _ }, [me]]]
                    },
                    point2: {
                        type: "top"
                    },
                    min: 20
                }
            }
        },
        {
            qualifier: { numberInDisplay: true, numLineActive: true },
            write: {
                buildUnputSeries: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
                        userNumList: {
                            to: [{ inputXOrderSet: _ }, [me]],
                            merge: o(
                                [{ param: { input: { value: _ } } }, [me]],
                                [{ inputXOrderSet: _ }, [me]]
                            )
                        },
                        nameToXBox: {
                            to: [{ qryName: _ }, [me]],
                            merge: [{ buttonTitle: _ }, [me]]
                        },
                        endEditMode: {
                            to: [{ numLineActive: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////

    BasicBox: {
        display: {
            background: "pink"
        },
        position: {
            left: 10,
            right: 10,
            height: 30,
        }
    },

    ///////////////////////////////////////////////////////////////////////////////

    RecivedDataPosition: {
        display: {
            text: {
                value: [{ param: { areaSetContent: _ } }, [me]]
            }
        },
        position: {
            maintainBoxOrder: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    type: "top",
                    element: [prev]
                },

                equals: 20
            },
            underPanelTop: {
                point1: {
                    type: "bottom",
                    element: [{ myPanelHeader: _ }, [me]]
                },
                point2: {
                    type: "top"
                },
                min: 20
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////

    ABButtonsAction: o(
        {
            position: {
                height: 40,
                bottom: 5,
                topAlignWithAddFuncButton: {
                    point1: {
                        type: "bottom",
                        element: [areaOfClass, "AddFunctionButton"]
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 5
                },
            },
            display: {
                background: "pink"
            },
            context: {
                readyToReciveNewInput: [
                    {
                        handledBy:
                        [areaOfClass, "AddFunctionButton"]
                    },
                    [{ subType: "Click" }, [message]],
                ],
            }
        },
        {
            qualifier: { numberInDisplay: true, numLineActive: true },
            write: {
                relocateNumToFuncCenter: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
                        aInTempoPlace: {
                            to: [{ myCoefficient: _ }, [me]],
                            merge: [{ param: { input: { value: _ } } }, [me]],
                        },
                        updateDisplyedNum: {
                            to: [{ qryName: _ }, [me]],
                            merge:
                            [{ param: { input: { value: _ } } }, [me]],
                        },
                        endEditMode: {
                            to: [{ numLineActive: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////////////

    UserInputPanel: {

    },

    ///////////////////////////////////////////////////////////////////////////////

    AButtonPosAndAction: {
        "class": "ABButtonsAction",
        position: {
            leftAlignWithAddFuncButton: {
                point1: {
                    type: "left"
                },
                point2: {
                    type: "left",
                    element: [areaOfClass, "AddFunctionButton"]
                },
                equals: 0
            },
            strechToMiddlePanel: {
                point1: {
                    type: "right"
                },
                point2: {
                    type: "horizontal-center",
                    element: [embedding]
                },
                equals: 5
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////


    BButtonPosAndAction: {
        "class": "ABButtonsAction",
        position: {
            rightAlignWithAddFuncButton: {
                point1: {
                    type: "right"
                },
                point2: {
                    type: "right",
                    element: [areaOfClass, "AddFunctionButton"]
                },
                equals: 0
            },
            strechToMiddlePanel: {
                point1: {
                    type: "horizontal-center",
                    element: [embedding]
                },
                point2: {
                    type: "left"
                },
                equals: 5
            }
        }
    },


    //////////////////////////////////////////////////////////////////////////////


    GeneralColumnPanel: {
        display: {
            background: "grey"
        },
        position: {
            top: 50,
            bottom: 50,
            width: [{ panelWidth: _ }, [areaOfClass, "ScreenArea"]],
        }
    },


    //////////////////////////////////////////////////////////////////////////////

    AnswerPanelsPos: {
        "class": "GeneralColumnPanel",
        position: {
            answerPanelTOTheLeft: {
                point1: {
                    type: "right",
                    element: [areaOfClass, "UserInputPanel"]
                },
                point2: {
                    type: "left",
                    element: [first, [{ children: { answerPanels: _ } }, [embedding]]]
                },
                equals: 20
            },
            panelOrder: {
                point1: {
                    type: "right",
                    element: [prev]
                },
                point2: {
                    type: "left",

                },
                equals: 20
            }
        },
    },

    ////////////////////////////////////////////////////////////////////////////////


    AnswersToUsersX: {
        context: {
            aAttribute: [{ param: { areaSetContent: { a: _ } } }, [embedding]],
            bAttribute: [{ param: { areaSetContent: { b: _ } } }, [embedding]],
            userXValue: [{ param: { areaSetContent: _ } }, [me]],
            aXMulScore: [mul, [{ aAttribute: _ }, [me]], [{ userXValue: _ }, [me]]],
            sumAXB: [plus, [{ aXMulScore: _ }, [me]], [{ bAttribute: _ }, [me]]]
        },
        display: {
            text: {
                value: [{ sumAXB: _ }, [me]]
            }
        },
        position: {
            underPanelheader: {
                point1: {
                    type: "bottom",
                    element: [areaOfClass, "PanelHeader"]
                },
                point2: {
                    type: "top",
                    element: [last, [{ children: { answersToUsersX: _ } }, [embedding]]]
                },
                equals: 20
            },
            maintainBoxOrder: {
                point1: {
                    type: "bottom",

                },
                point2: {
                    type: "top",
                    element: [prev]
                },
                equals: 20
            },
        }
    },

    ///////////////////////////////////////////////////////////////////////////////

};

var screenArea = {
    "class": "ScreenArea",
    context: {
        panelWidth: 100,
    },
    display: {
        background: "bbbbbb"
    },
    children: {
        funcPanel: {
            description: {
                "class": o("TrackMyPanel", "FunctionPanel"),
                position: {
                    right: 50,
                    top: 50,
                    width: 200,
                },
                display: {
                    background: "grey"
                },
                children: {
                    AddFunctionButton: {
                        description: {
                            "class": o("AddFunctionButton", "TrackMyPanel"),
                            display: {
                                background: "pink",
                                text: {
                                    value: "+ Add Function"
                                }
                            },
                            position: {
                                top: 5,
                                height: 50,
                                left: 10,
                                right: 10,
                                middleOfFunc: {
                                    point1: {
                                        type: "vertical-center"
                                    },
                                    point2: {
                                        type: "vertical-center"
                                    },
                                    equals: 0
                                }
                            }
                        }
                    },
                    buttonA: {
                        description: {
                            "class": o("NumbersFromUser", "TrackMyPanel", "AButtonPosAndAction"),
                            context: {
                                myCoefficient: [{ temporaryAttributeHolder: { a: _ } }, [areaOfClass, "AddFunctionButton"]],
                                buttonTitle: "A?",
                            }
                        }
                    },
                    buttonB: {
                        description: {
                            "class": o("NumbersFromUser", "TrackMyPanel", "BButtonPosAndAction"),
                            context: {
                                myCoefficient: [{ temporaryAttributeHolder: { b: _ } }, [areaOfClass, "AddFunctionButton"]],
                                buttonTitle: "B?"
                            },

                        }
                    }
                }
            }
        },
        numInputPanel: {
            description: {
                "class": o("TrackMyPanel", "UserInputPanel", "GeneralColumnPanel"),
                position: {
                    inputPanelTOTheLeft: {
                        point1: {
                            type: "left",
                            element: [areaOfClass, "ScreenArea"]
                        },
                        point2: {
                            type: "left"
                        },
                        equals: 20
                    }
                },
                children: {
                    panelHeader: {
                        description: {
                            "class": o("PanelHeader", "TrackMyPanel"),
                            context: {
                                headerDisplay: "Input Panel"
                            }
                        }
                    },
                    userNumInputBox: {
                        description: {
                            "class": o("NumbersFromUser", "TrackMyPanel", "BasicBox", "NumInputBox"),
                            context: {
                                buttonTitle: "X?",
                            },
                        }
                    },
                    recivedData: {
                        data: [{ inputXOrderSet: _ }, [areaOfClass, "NumInputBox"]],
                        description: {
                            "class": o("TrackMyPanel", "BasicBox", "RecivedDataPosition")
                        }
                    }
                }
            }
        },
        answerPanels: {
            data: [{ functionATOB: _ }, [areaOfClass, "AddFunctionButton"]],
            description: {
                "class": o("AnswerPanelsPos", "TrackMyPanel"),
                children: {
                    panelFuncHeader: {
                        description: {
                            "class": o("PanelHeader"),
                            context: {
                                headerDisplay: [concatStr,
                                    o(
                                        [{ param: { areaSetContent: { a: _ } } }, [embedding]],
                                        " * X + ",
                                        [{ param: { areaSetContent: { b: _ } } }, [embedding]]
                                    )
                                ]
                            },
                        }
                    },
                    answersToUsersX: {
                        data: [{ inputXOrderSet: _ }, [areaOfClass, "NumInputBox"]],
                        description: {
                            class: o("BasicBox", "TrackMyPanel", "AnswersToUsersX"),
                        }
                    }
                }
            }
        },
        explanationPanel: {
            description: {
                position: {
                    bottom: 10,
                    right: 10,
                    width: [displayWidth],
                    height: [displayHeight]
                },
                display: {
                    background: "pink",
                    text: {
                        value: "1. Mouse click on A? and enter a number, press return \n 2. Do the same for B? \n 3. Click on +Add Function (you can create a few) \n 4. Click on X? and enter a number and press return \n"
                    }
                }
            }
        }
    }
};