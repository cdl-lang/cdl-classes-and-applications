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

var otherSide = [defun,
    o("side"),
    [cond,
        "side",
        o(
            { on: "left", use: "right" },
            { on: "right", use: "left" },
            { on: "top", use: "bottom" },
            { on: "bottom", use: "top" }
        )
    ]
];

var classes = {

    ScreenArea: o(
        {
            qualifier: "!",
            context: {
                "^raceIsOn": false
            }
        },
        {
            qualifier: { raceIsOn: false },
            display: {
                background: "#bbbbbb"
            },
            context: {
                isAnyCarBeingDragged: [{ beingDragged: _ }, [areaOfClass, "MouseDraggingTool"]],

            },
            write: {
                myStartingCarsPositionCheck: {
                    upon: [{ isAnyCarBeingDragged: _ }, [me]],
                    true: {
                        startRacing: {
                            to: [{ raceIsOn: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),
    /////////////////////////////////////////////
    MouseDraggingTool: o(
        {
            qualifier: "!",
            context: {
                "^beingDragged": false
            }
        },
        {
            context: {
                "^xAxisSquareToPointer": o(),
                "^xValDragAndDrop": o(),
                "^yAxisSquareToPointer": o(),
                "^yValDragAndDrop": o(),
                amIAllowedToMove: [{ startYourEngine: _ }, [areaOfClass, "StartYourEngineButton"]],
                xVal: [mergeWrite,
                    [{ xValDragAndDrop: _ }, [me]],
                    [{ xValDefultPos: _ }, [me]]
                ],
                yVal: [mergeWrite,
                    [{ yValDragAndDrop: _ }, [me]],
                    [{ yValDefultPos: _ }, [me]]
                ],
                yAxisNewLocation: [offset,
                    {
                        type: "top",
                        element: [areaOfClass, "ScreenArea"]
                    },
                    {
                        type: "top"
                    }
                ],

                yAxisDistanceFromPointer: [offset,
                    {
                        type: "top"
                    },
                    {
                        element: [pointer],
                        type: "top"
                    }
                ],
                xAxisNewLocation: [offset,
                    {
                        type: "left",
                        element: [areaOfClass, "ScreenArea"]
                    },
                    {
                        type: "left"
                    }
                ],

                xAxisDistanceFromPointer: [offset,
                    {
                        type: "left"
                    },
                    {
                        element: [pointer],
                        type: "left"
                    }
                ],
            }
        },
        {
            qualifier: { amIAllowedToMove: true },
            write: {
                mouseDraggingStart: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        beingEdit: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: true
                        },
                        yPositionAccordingToPointer: {
                            to: [{ yAxisSquareToPointer: _ }, [me]],
                            merge: [{ yAxisDistanceFromPointer: _ }, [me]]
                        },
                        xPositionAccordingToPointer: {
                            to: [{ xAxisSquareToPointer: _ }, [me]],
                            merge: [{ xAxisDistanceFromPointer: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { beingDragged: true },
            write: {
                mouseDraggingOver: {
                    upon: [{ type: "MouseUp" }, [message]],
                    true: {
                        areaIsGoingToStayHere: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: false
                        },
                        yAxisNewLocationToyVal: {
                            to: [{ yVal: _ }, [me]],
                            merge: [{ yAxisNewLocation: _ }, [me]]
                        },
                        xAxisNewLocationToxVal: {
                            to: [{ xVal: _ }, [me]],
                            merge: [{ xAxisNewLocation: _ }, [me]]
                        }
                    }
                }
            },
            position: {
                topFrameSquareToPointer: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [pointer],
                        type: "top"
                    },
                    equals: [{ yAxisSquareToPointer: _ }, [me]],
                    priority: -200
                },
                leftFrameSquareToPointer: {
                    point1: {
                        type: "left",
                    },
                    point2: {
                        element: [pointer],
                        type: "left"
                    },
                    equals: [{ xAxisSquareToPointer: _ }, [me]],
                    priority: -200
                }
            }
        },
        {
            qualifier: { beingDragged: false },
            position: {
                top: [{ yVal: _ }, [me]],
                left: [{ xVal: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////

    ClickerValueSwitch: {
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    select: {
                        to: [{ valueToBeFlipped: _ }, [me]],
                        merge: [not, [{ valueToBeFlipped: _ }, [me]]]
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////

    numOfCarsInTheRace:
    o(
        {
            qualifier: "!",
            context: {
                "^numLineActive": false,
                "^numToBeMatched": 0,
            }
        },
        {
            context: {
                noChangesAfterRaceStart: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
                numberInDisplay: [{ param: { input: { value: _ } } }, [me]],
                onlyPositiveNumbers: [greaterThanOrEqual, [{ numberInDisplay: _ }, [me]], 0]
            }
        },
        {
            qualifier: { noChangesAfterRaceStart: false },
            "class": "ClickerValueSwitch",
            context: {
                valueToBeFlipped: [{ numLineActive: _ }, [me]],

            },
            display: {
                text: {
                    value: [{ numToBeMatched: _ },
                    [me]]
                }
            }
        },
        {
            qualifier: { numLineActive: false },
            display: {
                text: {
                    value: [{ numToBeMatched: _ }, [me]]
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
        },
        {
            qualifier: { numberInDisplay: true, onlyPositiveNumbers: true },
            write: {
                onEnteringNumber: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
                        updateRaceCarNum: {
                            to: [{ numToBeMatched: _ }, [me]],
                            merge: [{
                                param:
                                {
                                    input:
                                    { value: _ }
                                }
                            },
                            [me]]
                        },
                        finalCasrsNumber: {
                            to: [{ numLineActive: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////

    StartYourEngineButton: o(
        {
            "class": "ClickerValueSwitch",
            context: {
                "^startYourEngine": false,
                valueToBeFlipped: [{ startYourEngine: _ }, [me]]
            }
        },
        {
            qualifier: { startYourEngine: false },
            display: {
                text: { value: "Race Off" }
            }
        },
        {
            qualifier: { startYourEngine: true },
            display: {
                text: { value: "Race On" }
            }
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////

    GoBackHomePositionButton: {
        display: {
            text: {
                value: "Go Home"
            }
        },
        write: {
            myTakeEveryoneBackHomeOnClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    allCarsGoHome: {
                        to: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
                        merge: false
                    },
                    allXAxisValueGoHome: {
                        to: [{ xVal: _ }, [areaOfClass, "MouseDraggingTool"]],
                        merge: o()
                    },
                    allYAxisValueGoHome: {
                        to: [{ yVal: _ }, [areaOfClass, "MouseDraggingTool"]],
                        merge: o()
                    },
                    turnOffEngine: {
                        to: [{ startYourEngine: _ }, [areaOfClass, "StartYourEngineButton"]],
                        merge: false
                    },
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////

    CarsBasicCore: {
        position: {
            width: [{ carsWidth: _ }, [areaOfClass, "ScreenArea"]],
            height: [{ carsHeight: _ }, [areaOfClass, "ScreenArea"]],
        },
        display: {
            text: {
                value: [{ param: { areaSetContent: _ } }, [me]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////

    RaceStarted: o(
        {
            context: {
                amIFirst: [not, [prev, [me]]],
                didTheRaceStart: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
                onlyDraggedCarMove: [{ startYourEngine: _ }, [areaOfClass, "StartYourEngineButton"]]
            },
            write: {
                initialPosition: {
                    upon: [{ onlyDraggedCarMove: _ }, [me]],
                    true: {
                        feedInitialPositionToxVal: {
                            to: [{ xVal: _ }, [me]],
                            merge: [{ xAxisCarDefaultLocation: _ }, [me]]
                        },
                        feedInitialPositionToyVal: {
                            to: [{ yVal: _ }, [me]],
                            merge: [{ yAxisCarDefaultLocation: _ }, [me]]
                        }
                    }
                }
            },
        },
        {
            qualifier: { didTheRaceStart: false, myColor: "green" },
            "class": "GreenRacersUniqeStartingPosition"
        },
        {
            qualifier: { didTheRaceStart: false, myColor: "blue" },
            "class": "BlueRacersUniqeStartingPosition"
        }
    ),
    ///////////////////////////////////////////////////////////////////////////////////////////////

    BlueRacersUniqeStartingPosition: o(
        {
            "class": "StartingCarsPosition"
        },
        {
            qualifier: { amIFirst: true },
            context: {
                xValDefultPos: 100,
                yValDefultPos: 100
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////

    GreenRacersUniqeStartingPosition: o(
        {
            "class": "StartingCarsPosition",
        },
        {
            qualifier: { amIFirst: true },
            context: {
                xValDefultPos: 500,
                yValDefultPos: 100
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////

    StartingCarsPosition: {

        context: {
            xAxisCarDefaultLocation: [offset,
                {
                    type: "left",
                    element: [areaOfClass, "ScreenArea"]
                },
                {
                    type: "left"
                }
            ],

            yAxisCarDefaultLocation: [offset,
                {
                    type: "top",
                    element: [areaOfClass, "ScreenArea"]
                },
                {
                    type: "top"
                }
            ]

        },
        position: {
            polePosition: {
                point1: {
                    type: "left",
                    element: [prev]
                },
                point2: {
                    type: "left"
                },
                equals: [{ distanceBetweenCarsXAxis: _ }, [areaOfClass, "ScreenArea"]]
            },
            yAxisSpacing: {
                point1: {
                    type: "bottom",
                    element: [prev]
                },
                point2: {
                    type: "top"
                },
                equals: [{ distanceBetweenCarsYAxis: _ }, [areaOfClass, "ScreenArea"]]
            }
        }
    },



    //////////////////////////////////////////////////////////////////////////////////////////

    GeneralBorderLine: o(
        {
            position: {
                top: 5,
                bottom: 5,
                width: 10,
            },
            display: {
                background: [{ myBorderColor: _ }, [me]]
            },
            context: {
                whichSideIsTheCars: [{ carSide: _ }, [me]]
            }
        },
        {
            qualifier: { whichSideIsTheCars: "left" },
            position: {
                minFinishLine: {
                    point1: {
                        type: [otherSide, [{ carSide: _ }, [me]]],
                        element: [{ borderInterestGroup: _ }, [me]]
                    },
                    point2: {
                        type: [{ carSide: _ }, [me]],
                    },
                    min: 0,
                },
                equalFinishLine: {
                    point1: {
                        type: [otherSide, [{ carSide: _ }, [me]]],
                        element: [{ borderInterestGroup: _ }, [me]]
                    },
                    point2: {
                        type: [{ carSide: _ }, [me]],
                    },
                    equals: 0,
                    orGroups: { label: "tagOnlyToTheRightwinner" },
                    priority: -1
                }
            }
        },
        {
            qualifier: { whichSideIsTheCars: "right" },
            position: {
                minFinishLine: {
                    point1: {
                        type: [{ carSide: _ }, [me]],
                    },
                    point2: {
                        type: [otherSide, [{ carSide: _ }, [me]]],
                        element: [{ borderInterestGroup: _ }, [me]]
                    },
                    min: 0,
                },
                equalFinishLine: {
                    point1: {
                        type: [{ carSide: _ }, [me]]
                    },
                    point2: {
                        type: [otherSide, [{ carSide: _ }, [me]]],
                        element: [{ borderInterestGroup: _ }, [me]]
                    },
                    equals: 0,
                    orGroups: { label: "tagOnlyToTheLeftwinner" },
                    priority: -1
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////


    GreenRacerID: {

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    BlueRacerID: {

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    CarsBumpButDontCollide: {
        position: {
            myBottomDontBump: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    type: "top",
                    element: [
                        { beingDragged: true },
                        [areaOfClass, "RaceStarted"]
                    ]
                },
                min: 0,
                orGroups: { label: "dontDraggIntoMe" }
            },
            myRightDontBump: {
                point1: {
                    type: "right"
                },
                point2: {
                    type: "left",
                    element: [
                        { beingDragged: true },
                        [areaOfClass, "RaceStarted"]
                    ]
                },
                min: 0,
                orGroups: { label: "dontDraggIntoMe" }
            },
            myLeftDontBump: {
                point1: {
                    type: "right",
                    element: [
                        { beingDragged: true },
                        [areaOfClass, "RaceStarted"]
                    ]
                },
                point2: {
                    type: "left"
                },

                min: 0,
                orGroups: { label: "dontDraggIntoMe" }
            },
            myTopDontBump: {
                point1: {
                    type: "bottom",
                    element: [
                        { beingDragged: true },
                        [areaOfClass, "RaceStarted"]
                    ]
                },
                point2: {
                    type: "top"
                },
                min: 0,
                orGroups: { label: "dontDraggIntoMe" }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////
};

var screenArea = {
    "class": "ScreenArea",
    context: {
        distanceBetweenCarsYAxis: 10,
        distanceBetweenCarsXAxis: 5,
        carsWidth: 100,
        carsHeight: 50,
    },
    children: {
        blueCarsCounterSlot: {
            description: {
                "class": "numOfCarsInTheRace",
                context: {
                    myColor: "blue",
                    blueSquadLineup: [sequence, r(1, [{ numToBeMatched: _ }, [me]])],
                },
                position: {
                    right: 50,
                    height: 50,
                    width: 50
                },
                display: {
                    background: [{ myColor: _ }, [me]]
                }
            }
        },
        greenCarsCounterSlot: {
            description: {
                "class": "numOfCarsInTheRace",
                position: {
                    height: 50,
                    width: 50,
                    right: 50,
                    blueGreenButtonGap: {
                        point1: {
                            type: "bottom"
                        },
                        point2: {
                            type: "top",
                            element: [{ children: { blueCarsCounterSlot: _ } }, [embedding]]
                        },
                        equals: 10
                    }
                },
                context: {
                    myColor: "green",
                    greenSquadLineup: [sequence, r(1, [{ numToBeMatched: _ }, [me]])]
                },
                display: {
                    background: [{ myColor: _ }, [me]]
                }
            }
        },
        goBackHomePositionController: {
            description: {
                "class": "GoBackHomePositionButton",
                display: {
                    background: "pink"
                },
                position: {
                    height: 50,
                    width: 50,
                    topDistanceToStartButton: {
                        point1: {
                            type: "bottom"
                        },
                        point2: {
                            type: "bottom",
                            element: [areaOfClass, "StartYourEngineButton"]
                        },
                        equals: 0
                    },
                    leftDistanceToStartButton: {
                        point1: {
                            type: "right"
                        },
                        point2: {
                            type: "left",
                            element: [areaOfClass, "StartYourEngineButton"]
                        },
                        equals: 20

                    }
                }
            }
        },
        raceOnButton: {
            description: {
                "class": "StartYourEngineButton",
                position: {
                    height: 50,
                    width: 50,
                    right: 50,
                    top: 50,
                    startButtonGap: {
                        point1: {
                            type: "bottom"
                        },
                        point2: {
                            type: "top",
                            element: [{ children: { greenCarsCounterSlot: _ } }, [embedding]]
                        },
                        equals: 10
                    }
                },
                display: {
                    background: "pink"
                }
            }
        },
        blueRacers: {
            data: [cond,
                [equal, [{ numToBeMatched: _ }, [{ myColor: "blue" }, [areaOfClass, "numOfCarsInTheRace"]]], 0],
                o(
                    {
                        on: true, use:
                        o()
                    },
                    {
                        on: false, use:
                        [{ blueSquadLineup: _ }, [{ myColor: "blue" }, [areaOfClass, "numOfCarsInTheRace"]]]
                    }
                )
            ],
            description: {
                "class": o("MouseDraggingTool", "RaceStarted", "CarsBasicCore", "BlueRacerID", "CarsBumpButDontCollide"),
                context: {
                    myColor: "blue"
                },
                display: {
                    background: [{ myColor: _ }, [me]]
                }
            }
        },
        greenRacers: {
            data: [cond,
                [equal, [{ numToBeMatched: _ }, [{ myColor: "green" }, [areaOfClass, "numOfCarsInTheRace"]]], 0],
                o(
                    {
                        on: true, use:
                        o()
                    },
                    {
                        on: false, use:
                        [{ greenSquadLineup: _ }, [{ myColor: "green" }, [areaOfClass, "numOfCarsInTheRace"]]]
                    }
                )
            ],
            description: {
                "class": o("MouseDraggingTool", "RaceStarted", "CarsBasicCore", "GreenRacerID", "CarsBumpButDontCollide"),
                context: {
                    myColor: "green"
                },
                display: {
                    background: [{ myColor: _ }, [me]]
                }
            }
        },
        greenFinishLine: {
            description: {
                "class": "GeneralBorderLine",
                context: {
                    myBorderColor: "green",
                    carSide: "right",
                    borderInterestGroup: [areaOfClass, "GreenRacerID"]
                }
            }
        },
        blueFinishLine: {
            description: {
                "class": "GeneralBorderLine",
                context: {
                    carSide: "left",
                    borderInterestGroup: [areaOfClass, "BlueRacerID"],
                    myBorderColor: "blue"
                }
            }
        },
        blackLeftBorderLine: {
            description: {
                "class": "GeneralBorderLine",
                context: {
                    myBorderColor: "black",
                    carSide: "right",
                    borderInterestGroup: [areaOfClass, "RaceStarted"]
                }
            }
        },
        blackRightBorderLine: {
            description: {
                "class": "GeneralBorderLine",
                context: {
                    myBorderColor: "black",
                    carSide: "left",
                    borderInterestGroup: [areaOfClass, "RaceStarted"]
                }
            }
        },
        lessonLearned: {
            description: {
                position: {
                    left: 50,
                    bottom: 50,
                    width: [displayWidth],
                    height: [displayHeight]
                },
                display: {
                    background: "pink",
                    text: {
                        value: 
                             "Lessons Learned: \n 1) Preventing cars areas colliding by using orGroups to establish constraints that are violated only when dragged car is inside another car (class – CarsBumpButDontCollide). \n 2) Using mergeWrite in a drag and drop situation and for resetting back to initial state. \n 3) Creating a new general function ( var otherSide = [defun…)"
                    }
                }
            }
        }
    }
};

