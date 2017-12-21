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

var numToABC = [defun,
    "digit",
    [cond,
        "digit",
        o(
            { on: 1, use: "a" },
            { on: 2, use: "b" },
            { on: 3, use: "c" },
            { on: 4, use: "d" },
            { on: 5, use: "e" },
            { on: 6, use: "f" },
            { on: 7, use: "g" },
            { on: 8, use: "h" }
        )
    ]
];


var polyGnomes = [defun,
    "multiCoefficents",
    [defun,
        "x",
        [sum,
            [map,
                [defun,
                    "singleCoefficent",
                    [mul,
                        [{ myValue: _ }, "singleCoefficent"],
                        [pow, "x", [{ myExponent: _ }, "singleCoefficent"]]]
                ],
                "multiCoefficents"
            ]
        ]
    ]
];

var coefficientHeadline = [defun,
    "coefficientsValues",
    [concatStr, o(
        [map,
            [defun,
                "singleCoefficent",
                [concatStr, o([numToABC,
                    [plus,
                        [index,
                            "coefficientsValues",
                            "singleCoefficent"], 1]], ": ",
                    "singleCoefficent", ", ")]
            ],
            "coefficientsValues"
        ]
    )
    ]
];


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
    /////////////////////////////////////////////////////////////////////

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
            },
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
            myAddFunctionButton: [{ myPanelfamilyTree: [{ myPanelfamilyTree: _ }, [me]] }, [areaOfClass, "AddFunctionButton"]]
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////

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
            qualifier: { numberInDisplay: true, numLineActive: true }, // Qualifier completes the "NumbersFromUser" class action
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


    UserInputPanel: {

    },

    ///////////////////////////////////////////////////////////////////////////////


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
            mySetOfGnomes: [{ param: { areaSetContent: { preFuncGnomeSet: _ } } }, [embedding]],
            polynomBeforeXCalc: [polyGnomes, [{ mySetOfGnomes: _ }, [me]]],
            myBoxXValue: [{ param: { areaSetContent: _ } }, [me]],
            finalAnswer: [
                [{ polynomBeforeXCalc: _ }, [me]],
                [{ myBoxXValue: _ }, [me]]
            ]
        },
        display: {
            text: {
                //  value: [{param: {areaSetContent: _ }}, [embedding]]
                value: [{ finalAnswer: _ }, [me]]
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

    /////////////////////////////////////////////////////////////////////
    //  API:
    // Receives an order set of coefficients ID  in a {myValue, myExponent} format into	                             
    // { coefficientGnomesOrderSet: { preFuncGnomeSet: _ } } 
    ////////////////////////////////////////////////////////////////////////

    AddFunctionButton: o(
        {
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
            },
            context: {
                "^coefficientGnomesOrderSet": {
                    IDCounter: 1,
                    preFuncGnomeSet: o()
                },
                "^gnomeSet": o(),
                "^funcSetBeforeFunc": o(),
                "^functionCounterID": 1,
                noMissingCoefficients: [equal,
                    [size, [{ coefficientGnomesOrderSet: { preFuncGnomeSet: _ } }, [me]]],  // number of filled Coefficients ID's
                    [{ qryName: _ }, [areaOfClass, "CoefficientButtonCher"]]]               // The expected number of coefficients 
            }
        },
        {
            qualifier: { noMissingCoefficients: true },
            write: {
                addNewFunction: {
                    upon: [{ subType: "Click" }, [myMessage]],
                    true: {
                        tempoOrderSetToFuncOrderSet: {
                            to: [{ funcSetBeforeFunc: _ }, [me]],
                            merge: push(
                                [{ coefficientGnomesOrderSet: _ }, [me]]
                            )
                        },
                        resetInputButtonsTitle: {
                            to: [{ qryName: _ }, [{ myPanelButtons: _ }, [me]]],
                            merge: o()
                        },
                        clearOldGnomeSet: {
                            to: [{ coefficientGnomesOrderSet: { preFuncGnomeSet: _ } }, [me]],
                            merge: o()
                        },
                        addToFunctionCounter: {
                            to: [{ coefficientGnomesOrderSet: { IDCounter: _ } }, [me]],
                            merge: [plus, [{ coefficientGnomesOrderSet: { IDCounter: _ } }, [me]], 1]
                        },
                        clearGnomeID: {
                            to: [{ gnomeIDReady: _ }, [areaOfClass, "CoefficientGnomes"]],
                            merge: false
                        },
                    }
                }
            }
        }
    ),


    ////////////////////////////////////////////////////////////////////////////////

    CoefficientButtonCher: o(
        {
            position: {
                height: 50,
                left: 10,
                right: 10,
                aboveFunctionPanel: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom",
                        element: [embedding]
                    },
                    min: 5
                },
                noGnomesPos: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom",
                        element: [embedding]
                    },
                    equals: 5,
                    priority: -1
                },

                underAddFunctionButton: {
                    point1: {
                        type: "bottom",
                        element: [{ myAddFunctionButton: _ }, [me]]
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 5
                },
                alighToAddFunctionButton: {
                    point1: {
                        type: "horizontal-center",
                        element: [{ myAddFunctionButton: _ }, [me]]
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { numberInDisplay: true, numLineActive: true }, // Qualifier completes the "NumbersFromUser" class action
            write: {
                relocateNumToFuncCenter: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
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

    CoefficientGnomesPos: {
        position: {
            width: 50,
            height: 50,
            left: 10,
            fristGnomesUnderButton: {
                point1: {
                    type: "bottom",
                    element: [areaOfClass, "CoefficientButtonCher"]
                },
                point2: {
                    type: "top",
                    element: [first, [{ children: { coefficientGnomes: _ } }, [embedding]]]
                },
                equals: 5
            },
            gnomesInLine: {
                point1: {
                    type: "bottom",
                    element: [prev]
                },
                point2: {
                    type: "top"
                },
                equals: 5
            },
            panelSizeAccordingToGnomes: {
                point1: {
                    type: "bottom",
                    element: [last, [{ children: { coefficientGnomes: _ } }, [embedding]]]
                },
                point2: {
                    type: "bottom",
                    element: [embedding]
                },
                equals: 5
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////

    CoefficientGnomes: o(
        {
            qualifier: "!",
            context: {
                "^gnomeIDReady": false
            }
        },
        {
            "class": "CoefficientGnomesPos",
            context: {
                "^gnomeIDCard": 0,
                readyToReciveNewInput: [
                    {
                        handledBy:
                        [areaOfClass, "AddFunctionButton"]
                    },
                    [{ subType: "Click" }, [message]],
                ],
                orderSetValue: [{ param: { areaSetContent: _ } }, [me]],
                exponentCalc: [minus, [{ qryName: _ }, [areaOfClass, "CoefficientButtonCher"]],
                    [{ orderSetValue: _ }, [me]]]
            },
            write: {
                freshIDAtEditMode: {
                    upon: [{ numLineActive: _ }, [me]],
                    true: {
                        clearOldIDCard: {
                            to: [{ gnomeIDReady: _ }, [me]],
                            merge: false
                        }
                    }
                },
                formGnoemsInfoOrderSet: {
                    upon: [{ gnomeIDReady: _ }, [me]],
                    true: {
                        writeToIndex: {
                            to:
                            [{ coefficientGnomesOrderSet: { preFuncGnomeSet: _ } }, [areaOfClass, "AddFunctionButton"]],
                            merge: push(
                                [{ gnomeIDCard: _ }, [me]]
                            )
                        }
                    }
                }
            }
        },
        {
            qualifier: { numberInDisplay: true, numLineActive: true }, // Qualifier completes the "NumbersFromUser" class action
            write: {
                relocateNumToFuncCenter: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
                        updateDisplyedNum: {
                            to: [{ qryName: _ }, [me]],
                            merge:
                            [{ param: { input: { value: _ } } }, [me]],
                        },
                        endEditMode: {
                            to: [{ numLineActive: _ }, [me]],
                            merge: false
                        },
                        writeValueToIDCard: {
                            to: [{ gnomeIDCard: { myValue: _ } }, [me]],
                            merge: [{ param: { input: { value: _ } } }, [me]],
                        },
                        writeExponentToIDCard: {
                            to: [{ gnomeIDCard: { myExponent: _ } }, [me]],
                            merge: [{ exponentCalc: _ }, [me]],
                        },
                        formGnomeIDCard: {
                            to: [{ gnomeIDReady: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////////////////////

    WhereAreYou: {

    }

    /////////////////////////////////////////////////////////////////////////////////

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
                context: {
                    gnomeNum: [sequence, r(1, [{ qryName: _ }, [areaOfClass, "CoefficientButtonCher"]])]
                },
                children: {
                    addFunctionButton: {
                        description: {
                            "class": o("AddFunctionButton", "TrackMyPanel"),
                            display: {
                                background: "pink",
                                text: {
                                    value: "+ Add Function"
                                }
                            },
                        }
                    },
                    coefficientButton: {
                        description: {
                            "class": o("TrackMyPanel", "NumbersFromUser", "CoefficientButtonCher"),
                            display: {
                                background: "pink"
                            },
                            context: {
                                buttonTitle: "Coefficient Number?"
                            },
                        }
                    },
                    coefficientGnomes: {
                        data: [cond,
                            [equal,
                                [{ qryName: _ }, [areaOfClass, "CoefficientButtonCher"]],
                                [{ buttonTitle: _ }, [areaOfClass, "CoefficientButtonCher"]]],
                            o(
                                {
                                    on: true, use:
                                    o()
                                },
                                {
                                    on: false, use:
                                    [{ gnomeNum: _ }, [me]]
                                }
                            )
                        ],
                        description: {
                            "class": o("NumbersFromUser", "CoefficientGnomes", "TrackMyPanel"),
                            context: {
                                buttonTitle: [numToABC, [{ param: { areaSetContent: _ } }, [me]]]
                            },
                            display: {
                                background: "pink",
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
            data: [{ funcSetBeforeFunc: _ }, [areaOfClass, "AddFunctionButton"]],
            description: {
                "class": o("AnswerPanelsPos", "TrackMyPanel"),
                children: {
                    panelFuncHeader: {
                        description: {
                            "class": o("PanelHeader"),
                            context: {
                                headerDisplay: [coefficientHeadline, [{ param: { areaSetContent: { preFuncGnomeSet: { myValue: _ } } } }, [embedding]]]


                                /* [concatStr,
                                   o(
                                       [{ param: { areaSetContent: { preFuncGnomeSet: { myValue: _ } } } }, [embedding]]
                                   )
                               ] */
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
                        value: "1. Mouse click on the Coefficient Number button? and enter a number, press return \n 2. Enter a number to all Coefficients? \n 3. Click on +Add Function (you can create a few) \n 4. Click on X? and enter a number and press return \n"
                    }
                }
            }
        }
    }
};
