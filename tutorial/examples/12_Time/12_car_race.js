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

var initGlobalDefaults = {
    dirtHeight: 30,
    dirtWidth: 70
};


var classes = {
    ScreenArea: o(
        {
            qualifier: "!",
            context: {
                "^raceIsOn": false,
            }
        },
        {
            context: {
                carHeight: 100,
                carWidth: 100,
                carSpacing: 50,
                raceMaxTime: 20,
                raceInterval: 0.1,
                accelerationInterval: 0.1,
                slowdownMaxTime: 300,
                accelerationValue: 0.1,
                initialSpeed: 10,
                initialXPos: 50,
                raceCarsImg: o(
                    { image: "img/fiat.png", place: 1, carName: "fiat" },
                    { image: "img/ship.png", place: 2, carName: "ship" }
                )
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////

    MouseDraggingTool: o(
        {
            qualifier: "!",
            context: {
                "^beingDragged": o()
            }
        },
        {
            context: {
                xVal: [mergeWrite,
                    [{ xValDragAndDrop: _ }, [me]],
                    [{ xValDefultPos: _ }, [me]]
                ],
                yVal: [mergeWrite,
                    [{ yValDragAndDrop: _ }, [me]],
                    [{ yValDefultPos: _ }, [me]]
                ],
                "^xAxisSquareToPointer": o(),
                "^xValDragAndDrop": o(),
                "^yAxisSquareToPointer": o(),
                "^yValDragAndDrop": o(),
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
            write: {
                mouseDraggingStart: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        beingEdit: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: true
                        },
                        xPositionAccordingToPointer: {
                            to: [{ xAxisSquareToPointer: _ }, [me]],
                            merge: [{ xAxisDistanceFromPointer: _ }, [me]]
                        },
                        yPositionAccordingToPointer: {
                            to: [{ yAxisSquareToPointer: _ }, [me]],
                            merge: [{ yAxisDistanceFromPointer: _ }, [me]]
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
                        xAxisNewLocationToxVal: {
                            to: [{ xVal: _ }, [me]],
                            merge: [{ xAxisNewLocation: _ }, [me]]
                        },
                        yAxisNewLocationToyVal: {
                            to: [{ yVal: _ }, [me]],
                            merge: [{ yAxisNewLocation: _ }, [me]]
                        }
                    }
                }
            },
            position: {
                leftFrameSquareToPointer: {
                    point1: {
                        type: "left",
                    },
                    point2: {
                        element: [pointer],
                        type: "left"
                    },
                    equals: [{ xAxisSquareToPointer: _ }, [me]]
                },
                topFrameSquareToPointer: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [pointer],
                        type: "top"
                    },
                    equals: [{ yAxisSquareToPointer: _ }, [me]]
                }
            }
        },
        {
            qualifier: { beingDragged: false },
            position: {
                left: [{ xVal: _ }, [me]],
                top: [{ yVal: _ }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////

    TimeDisplayBox: o(
        {
            context: {
                raceIsOn: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
            },
            position: {
                top: 100,
                right: 100,
                height: 100,
                width: 100
            },
            display: {
                background: "pink",
                text: {
                    value: [concatStr,
                        o(
                            [{ timeDisplay: _ }, [me]],
                            "\n",
                            [{ dirtPatchSlowTime: _ }, [areaOfClass, "RaceCar"]]
                        )
                    ]
                }
            }
        },
        {
            qualifier: { raceIsOn: true },
            context: {
                timeDisplay: [round,
                    [
                        time,
                        true, // [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]], // waiting for Theo
                        [{ raceInterval: _ }, [areaOfClass, "ScreenArea"]],
                        [{ raceMaxTime: _ }, [areaOfClass, "ScreenArea"]]
                    ],
                    1
                ]
            }
        }
    ),

    ///////////////////////////////////////////////////////////
    //
    //

    StartRaceButton: {
        display: {
            background: "pink",
            text: {
                value: "Start Race"
            }
        },
        position: {
            height: 100,
            width: 100,
            alignWithTimer: {
                point1: {
                    type: "horizontal-center"
                },
                point2: {
                    type: "horizontal-center",
                    element: [areaOfClass, "TimeDisplayBox"]
                },
                equals: 0
            },
            underTimer: {
                point1: {
                    type: "bottom",
                    element: [areaOfClass, "TimeDisplayBox"]
                },
                point2: {
                    type: "top"
                },
                equals: 50
            }
        },
        write: {
            onStartRaceButtonClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    greenLight: {
                        to: [{ raceLightsOn: _ }, [areaOfClass, "Lights"]],
                        merge: true
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////
    //This class govern: 
    //a) The progress of each car per time cycle. 
    //b) each car check its distance to the finish line and flag the winner.
    //c) upon entering to a dirt patch, this class decrease the speed of the car 

    RaceCar: o(
        {
            "class": o("RaceCarShape", "CarsVerticalPos"),
            context: {
                "^xAxisPosition": [{ initialXPos: _ }, [areaOfClass, "ScreenArea"]],
                "^velocity": [{ initialSpeed: _ }, [areaOfClass, "ScreenArea"]],
                carName: [{ param: { areaSetContent: { carName: _ } } }, [me]],
                velocityForDisplay: [round, [{ velocity: _ }, [me]], 2],
                myRank: [{ param: { areaSetContent: { place: _ } } }, [me]], 
                IamTheWinner: [greaterThanOrEqual, 0, [{ distanceFromFinishLine: _ }, [me]]],
                myHeight: [offset,
                    {
                        type: "top"
                    },
                    {
                        type: "bottom"
                    }
                ],
                myWidth: [offset,
                    {
                        type: "left"
                    },
                    {
                        type: "right"
                    }
                ],
                distanceFromDirtPatchYAxis: [abs, [offset,
                    {
                        type: "vertical-center",
                        element: [areaOfClass, "DirtPatch"]
                    },
                    {
                        type: "vertical-center",
                    }
                ]],
                distanceFromDirtPatchXAxis: [abs, [offset,
                    {
                        type: "horizontal-center",
                        element: [areaOfClass, "DirtPatch"]
                    },
                    {
                        type: "horizontal-center",
                    }
                ]],
                distanceFromFinishLine: [offset,
                    {
                        type: "right",
                    },
                    {
                        type: "left",
                        element: [areaOfClass, "FinishLine"]
                    }
                ],
                carInDirtPatchYAxis: [greaterThan,
                    [plus,
                        [div, [{ myHeight: _ }, [me]], 2],
                        [div, [{ dirtHeight: _ }, [globalDefaults]], 2],
                    ],
                    [{ distanceFromDirtPatchYAxis: _ }, [me]]
                ],
                carInDirtPatchXAxis: [greaterThan,
                    [plus,
                        [div, [{ myWidth: _ }, [me]], 2],
                        [div, [{ dirtWidth: _ }, [globalDefaults]], 2],
                    ],
                    [{ distanceFromDirtPatchXAxis: _ }, [me]]
                ],
                IamInDirtPatch: [and, [{ carInDirtPatchXAxis: _ }, [me]], [{ carInDirtPatchYAxis: _ }, [me]]] // make sure that the car is inside the dirt patch in both x and y axis 
            },
            position: {
                left: [{ xAxisPosition: _ }, [me]]
            },
            write: {
                onRaceCarAtfinishLine: {
                    upon: [{ IamTheWinner: _ }, [me]],
                    true: {
                        raceEnded: {
                            to: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
                            merge: false
                        }
                    }
                },
                onRaceCarAdvancePerTimeCycle: {
                    upon: [changed, [{ timeDisplay: _ }, [areaOfClass, "TimeDisplayBox"]]],
                    true: {
                        addVToX: {
                            to: [{ xAxisPosition: _ }, [me]],
                            merge: [cond, [equal, 1, [{ myRank: _ }, [me]]], // you can set the result of the race,by giving the
                                o(
                                    {
                                        on: true, use:
                                        [plus,
                                            [{ velocity: _ }, [me]],
                                            [{ xAxisPosition: _ }, [me]]
                                            //      [plus, 0.5, [{ xAxisPosition: _ }, [me]]]
                                        ]
                                    },
                                    {
                                        on: false, use:
                                        [plus,
                                            [{ velocity: _ }, [me]],
                                            [{ xAxisPosition: _ }, [me]]
                                        ]
                                    }
                                )
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { IamInDirtPatch: true },
            context: {
                dirtPatchSlowTime: [round,
                    [
                        time,
                        [{ carInDirtPatchXAxis: _ }, [me]],
                        [{ accelerationInterval: _ }, [areaOfClass, "ScreenArea"]],
                        [{ slowdownMaxTime: _ }, [areaOfClass, "ScreenArea"]]
                    ],
                    1
                ],
            },
            write: {
                onRaceCarSlowdown: {
                    upon: [changed, [{ dirtPatchSlowTime: _ }, [me]]], // This timer is used to calculate the time span inside the dirt patch, I used a new timer to make the calc of ∆t easier  
                    true: {
                        slowdownA: {
                            to: [{ velocity: _ }, [me]],
                            merge: [ // This formula describe the Vn = V(n-1)-(a*t^2)/2
                                minus,
                                [{ velocity: _ }, [me]],
                                [min, [div,
                                    [mul,
                                        [pow,
                                            [{ dirtPatchSlowTime: _ }, [me]], 2],
                                        [{ accelerationValue: _ }, [areaOfClass, "ScreenArea"]]
                                    ],
                                    2
                                ],
                                    [{ velocity: _ }, [me]]
                                ]
                            ]
                        }
                    }
                }
            },
            children: {
                slowBanner: {
                    description: {
                        position: {
                            "horizontal-center": 0,
                            "vertical-center": 0,
                            width: 70,
                            height: 30
                        },
                        display: {
                            background: "green",
                            text: {
                                value: "SLOW!!!"
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { IamTheWinner: true },
            children: {
                winnerBanner: {
                    description: {
                        position: {
                            "horizontal-center": 0,
                            "vertical-center": 0,
                            width: 70,
                            height: 30
                        },
                        display: {
                            background: "yellow",
                            text: {
                                value: "WINNER!!!"
                            }
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////

    RaceCarShape: {
        display: {
            image: {
                src: [{ param: { areaSetContent: { image: _ } } }, [me]],
                size: 1
            },
        },
        position: {
            height: [{ carHeight: _ }, [areaOfClass, "ScreenArea"]],
            width: [{ carWidth: _ }, [areaOfClass, "ScreenArea"]]
        }
    },

    ///////////////////////////////////////////////////////////

    CarsVerticalPos: o(
        {
            qualifier: "!",
            context: {
                onlyApplyToFirst: [not, [prev]],
            }
        },
        {
            qualifier: { onlyApplyToFirst: false },
            position: {
                polePostion: {
                    point1: {
                        type: "bottom",
                        element: [prev]
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ carSpacing: _ }, [areaOfClass, "ScreenArea"]]
                }
            }
        },
        {
            qualifier: { onlyApplyToFirst: true },
            position: {
                top: 100
            }
        }
    ),


    ////////////////////////////////////////////////////////

    FinishLine: {
        display: {
            background: "black"
        },
        position: {
            top: 10,
            bottom: 10,
            width: 10,
            leftOfControlPanel: {
                point1: {
                    type: "right"
                },
                point2: {
                    type: "left",
                    element: [areaOfClass, "TimeDisplayBox"]
                },
                equals: 100
            }
        }
    },

    /////////////////////////////////////////////////////////////////////
    //This class displays the name and speed of each car and allows you to increase its speed 
    //
    AccelerationButton: o(
        {
            position: {
                height: 30,
                width: 150,
                alignWithStartRaceButton: {
                    point1: {
                        type: "horizontal-center",
                        element: [areaOfClass, "StartRaceButton"]
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            },
            context: {
                myCarName: [{ carName: [{ param: { areaSetContent: { carName: _ } } }, [me]] }, [areaOfClass, "RaceCar"]],
                onlyApplyToFirst: [not, [prev]],
            },
            display: {
                background: "pink",
                text: {
                    value: [concatStr,
                        o(
                            [{ param: {areaSetContent: { carName: _ } } }, [me]],
                            ": ",
                            [
                                { velocityForDisplay: _ },
                                [{ myCarName: _ }, [me]]
                            ]
                        )
                    ]
                }
            },
            write: {
                onAccelerationButtonClick: {
                    upon: [{ subType: "Click" }, [myMessage]],
                    true: {
                        addBoost: {
                            to: [
                                { velocity: _ },
                                [{ myCarName: _ }, [me]]
                            ],
                            merge: [plus,
                                [{ velocity: _ },
                                [{ myCarName: _ }, [me]]],
                                0.5
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { onlyApplyToFirst: false },
            position: {
                polePostion: {
                    point1: {
                        type: "bottom",
                        element: [prev]
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 30
                }
            }
        },
        {
            qualifier: { onlyApplyToFirst: true },
            position: {
                underStartRaceButton: {
                    point1: {
                        type: "bottom",
                        element: [areaOfClass, "StartRaceButton"]
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 50
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////////////

    DirtPatch: {
        context: {
            yValDefultPos: 400,
            xValDefultPos: 400
        },
        position: {
            height: [{ dirtHeight: _ }, [globalDefaults]],
            width: [{ dirtWidth: _ }, [globalDefaults]]
        },
        display: {
            background: "green"
        }
    },

    ///////////////////////////////////////////////////////////

    Lights: o(
        {
            qualifier: "!",
            context: {
                "^raceLightsOn": false
            },
        },
        {
            qualifier: { raceLightsOn: true },
            write: {
                onLightsStartRace: {
                    upon: [notEqual, [{ timeToStartRace: _ }, [me]], 0],
                    true: {
                        noMoreLights: {
                            to: [{ raceLightsOn: _ }, [me]],
                            merge: false
                        },
                        carsMoving: {
                            to: [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]],
                            merge: true
                        }
                    }
                }
            },
            position: {
                top: 50,
                bottom: 50,
                "horizontal-center": 0,
                width: 1000,
            },
            context: {
                timeToStartRace:
                [
                    time,
                    true, // [{ raceIsOn: _ }, [areaOfClass, "ScreenArea"]], // waiting for Theo
                    1
                ], 
            },
            display: {
                image: {
                    src: "img/traffic_light.gif",
                    size: 1
                },
            }
        }
    )
    ////////////////////////////////////////////////////////////

};


//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

var screenArea = {
    "class": "ScreenArea",
    display: {
        background: "white"
    },
    children: {
        raceCar: {
            data: [{ raceCarsImg: _ }, [areaOfClass, "ScreenArea"]],
            description: {
                "class": o("RaceCar")
            }
        },
        startRaceButton: {
            description: {
                "class": "StartRaceButton"
            }
        },
        timeDisplayBox: {
            description: {
                "class": "TimeDisplayBox"
            }
        },
        finishLine: {
            description: {
                "class": "FinishLine"
            }
        },
        accelerationButtons: {
            data: [{ raceCarsImg: _ }, [areaOfClass, "ScreenArea"]],
            description: {
                "class": "AccelerationButton"
            }
        },
        dirtPatch: {
            description: {
                "class": o("DirtPatch", "MouseDraggingTool")
            }
        },
        lights: {
            description: {
                "class": "Lights",
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
                        value: "1. Mouse click on the ''Start Race'' button  \n 2. You can accelerate a car by clicking on its button on the right (where the speed is also displayed) \n 3. You can move th green square and slow down a car by putting it in the way "
                    }
                }
            }
        }
    }
};











