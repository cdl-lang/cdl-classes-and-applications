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
    RandomNumber: {
        context: {
            "^rnd": 10000000,
            numberOfOptions: 5,
            rndFloat: [div, [{rnd:_},[me]], 2147483563],
            rndBoolean: [greaterThan, [{rndFloat:_},[me]], 0.5],
            rndOption: [floor, [mul, [{rndFloat:_},[me]], [{numberOfOptions:_},[me]]]],
            sequence: [sequence, 5],
            nextRnd: [mod, [mul, [{ rnd:_ }, [me]], 40014], 2147483563]
        },
        write: {
            onNext: {
                upon: [{ msg: "getNextRnd"  }, [myMessage]],
                true: {
                    resetRandom: {
                        to: [{rnd: _ }, [me]],
                        merge: [{nextRnd: _ }, [me]],
                    },
                }
            }
        }                                                                            
    },
    SingleClickableArea: o(
        {
            context: {
                "^clicked": false,
                treasure: false,
                found: [and, [{treasure:_},[me]], [{clicked:_},[me]]],
                active: true,
            },        
        },
        {
            qualifier: { clicked: false },
            variant: {
                display: {
                    //background: "#54F986",
                    image: {
                        src: "img/box_closed.png",
                        size: 1//[{width:_},[me]]
                    },                
                }                 
            }
        },
        {
            qualifier: { clicked: false, active:true },
            variant: {
                write: {
                    onClick: {
                        upon: [{ subType: "Click" }, [myMessage]],
                        true: {
                            clicked: {
                                to: [{clicked: _ }, [me]],
                                merge: true
                            }
                        }
                    }
                },                               
            }
        },
        {
            qualifier: { clicked: true, treasure: false },
            variant: {
                display: {
                    //background: "#F5AAAA"
                    image: {
                        src: "img/box_empty.png",
                        size: 1
                    },                                    
                },                
            }
        },
        {
            qualifier: { clicked: true, treasure:true },
            variant: {
                display: {
                    //background: "#E6FF0B"
                    image: {
                        src: "img/box_gold.png",
                        size: 1//[{width:_},[me]]
                    },                                    
                },                
            }
        }
    ),
    RestartButton: o(
        {
            context: {
                gameOn: false,
                started: false,
                won: false,
                timeIsUp: false
            },
        },
        //GAEME ON        
        {
            qualifier: { gameOn:true },
            variant: {
                display: {
                    text: {
                        value: "Game is on",
                    },
                    background: "lightGreen"
                },

            }
        },        
        //FIRST START        
        {
            qualifier: { started:false },
            variant: {
                display: {
                    text: {
                        value: "Start",
                    },
                    background: "yellow"
                },
            }
        },        
        //WON
        {
            qualifier: { won: true },
            variant: {
                display: {
                    text: {
                        value: "You won! Restart!",
                    },
                    background: "yellow"
                },  
            }
        },
        //TIME IS UP
        {
            qualifier: {timeIsUp:true },
            variant: {
                display: {
                    text: {
                        value: "TimeIsUp! Restart!",
                    },
                    background: "red"
                },                                
            }
        }
    ),
    Game: o(
        {
            "class": "RandomNumber",
            context: {                
                secondsToTimeUp: 0,
                "^started": false,
                "^timeIsUp": false,
                won: false,
                gameOn: false,
            },
            write: {
                onGameOff: {
                    upon: [{gameOn:_},[me]],
                        "false": {
                            resetTimeElapsed: {
                                to: [{lastElapsed:_},[me]],
                                merge: [{timer:_},[me]]
                            },  
                            resetTimer: {    
                                to: [{timerIsOn:_},[me]],
                                merge: false
                            },
                        }
                }
            }              
        },
        {
            //GAME ON
            qualifier: { gameOn:true },
            variant: {
                write: {
                    timeUp: {                        
                        upon: [greaterThan, [[{timer: _}, [me]], [{secondsToTimeUp:_},[me]]], 0],
                        true: {
                            timeisup: {
                                to: [{timeIsUp:_},[me]],
                                merge: true
                            },
                        }                    
                    },                  
                },
            }
        },         
        {
            //GAME NOT ON
            qualifier: { gameOn:false },
            variant: {
                write: {
                    onRestart: {
                        upon: [{ msg: "restartGame" }, [myMessage]],
                        true: {
                            resetClickedAreas: {
                                to: [{clicked: _},[{children: { clickableAreas: _ }}, [me]]],
                                merge: false
                            },
                            resetRandom: {
                                to: [message],
                                merge: {msg: "getNextRnd", recipient: [me]},
                            },
                            resetTimer: {    
                                to: [{timerIsOn:_},[me]],
                                merge: true
                            }
                        }
                    },
                }    
            }
        }, 
        {
            //FIRST START
            qualifier: {started:false },
            variant: {
                write: {
                    onRestart: {
                        upon: [{ msg: "restartGame" }, [myMessage]],
                        true: {
                            resetStarted: {
                                to: [{started:_},[me]],
                                merge: true,
                            },
                        }
                    }
                }                                                                                                                  
            }
        },
        {
            //TIME IS UP
            qualifier: {timeIsUp:true },
            variant: {
                write: {
                    onRestart: {
                        upon: [{ msg: "restartGame" }, [myMessage]],
                        true: {
                            resetTimeIsUp: {
                                to: [{timeIsUp:_},[me]],
                                merge: false,
                            },                                                       
                        }
                    }
                }                                                                                                                  
            }
        }
    ),
    InfoAreaButton: o(
        {
            context: {
                "^displayAttempts": false,
                gameOn: false,
                secondsToTimeUp: 0,
                timer: o(),
                lastElapsed: 0,   
                displayedNumber: 0,
                timeBarSeconds:0,
                textLabel: "",
                digits: 0,
            },
            position: {
                width: 100,
                height: 20,
                labelCenteredConstraint: {
                    pair1: {
                        point1: {type: "left", element: [me]},
                        point2: {type: "left", element: [{children: {labelArea:_}},[me]]}
                    },
                    pair2: {
                        point1: {type: "right", element: [{children: {numberArea:_}},[me]]},
                        point2: {type: "right", element: [me]},
                    },                                    
                    ratio: 1
                }                       
            },
            display: {
                background: "white",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            },
            children: {
                labelArea: {
                    description: {
                        position: {
                            width: 60,
                            height: 20,
                        },
                        display: {
                            text: {
                                value: [{textLabel:_},[embedding]]
                            }
                        }
                    }
                },
                numberArea: {
                    description: {
                        position: {
                            width: 30,
                            height: 20,
                            leftConstraint: {
                                point1: {type: "right", element: [{children: {labelArea: _}},[embedding]]},
                                point2: {type: "left", element: [me]},
                                equals:0
                            }
                        },
                        display: {
                            text: {
                                numericFormat: {
                                    type: "fixed",
                                    numberOfDigits: [{digits:_},[embedding]],
                                },                                
                                value: [{displayedNumber:_},[embedding]]
                            }
                        }
                    }                
                },
                timeScroller: {
                    description: {
                        position: {  
                            height: 20,
                            offsetConstraint: {
                                pair1: {
                                    point1: {type: "left", element: [embedding]},
                                    point2: {type: "right", element: [embedding]},
                                },
                                pair2: {
                                    point1: {type: "left", element: [me]},
                                    point2: {type: "right", element: [me]},                                          
                                },                                    
                                ratio: [div, [{timeBarSeconds:_}, [embedding]], [{secondsToTimeUp:_}, [embedding]]]
                            }
                        },
                        display: {
                            background: "red",
                            opacity:.5,
                        }                            
                    }
                },            
            }
        },
        {
            qualifier: {displayAttempts: false},
            variant: {
                context: { 
                    textLabel: "elapsed: ",
                    displayedNumber: [{timeBarSeconds:_},[me]],
                    digits: 1,
                },
                write: {                    
                    onClick: {
                        upon: [{ subType: "Click" }, [myMessage]], true: {
                            select: {
                                to: [{ displayAttempts:_ }, [me]], 
                                merge: true
                            }
                        },            
                    },          
                }
            }
        },
        {
            qualifier: {gameOn: false},
            variant: {
                context: {                    
                    timeBarSeconds: [{lastElapsed:_},[me]]
                },
            }
        },        
        {
            qualifier: {gameOn: true},
            variant: {
                context: {
                    timeBarSeconds: [{timer:_},[me]]
                },
            }
        },          
        /*{
            qualifier: {displayAttempts: false, gameOn: false},
            variant: {
                context: {                    
                    displayedNumber: [{lastElapsed:_},[me]]
                },
            }
        },        
        {
            qualifier: {displayAttempts: false, gameOn: true},
            variant: {
                context: {
                    displayedNumber: [{timer:_},[me]]
                },
            }
        }, */      
        {
            qualifier: {displayAttempts: true},
            variant: {
                context: {
                    textLabel: "attempts: ",
                    displayedNumber: [{attempts:_},[embedding]],
                    digits:0,
                },
                write: {
                    onClick: {
                        upon: [{ subType: "Click" }, [myMessage]], true: {
                            select: {
                                to: [{ displayAttempts:_ }, [me]], 
                                merge: false
                            }
                        },            
                    },          
                }
            }
        }
    ),
}

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
		gameArea: {		    
		    description: {
		        //"class":o("Game","RandomNumber"),
		        "class": "Game",
		        context: {
		            numberOfOptions: 8,
		            secondsToTimeUp: 4,                    
                    treasureAreaIndex:  [{ rndOption: _}, [me]],
                    treasureArea: [pos, 
		                [{treasureAreaIndex:_},[me]],
		                [{children: { clickableAreas: _ }}, [me]]
		            ],
		            won: [equal, 1, [size, [{found: true},[{children: { clickableAreas: _ }}, [me]]]]],
                    "^started": false,
                    "^timeIsUp": false,
                    gameOn: [and, [{started:_},[me]], [not,[{won:_},[me]]], [not,[{timeIsUp:_},[me]]]],
                    attempts: [size, [{clicked: true},[{children: { clickableAreas: _ }}, [me]]]],                                                            
                    "^timerIsOn": false,
                    timer: [round, [time, [{timerIsOn: _}, [me]], .1, [{secondsToTimeUp:_},[me]]], 1],
                    "^lastElapsed": 0,
		        },
                position: {
                    top: 10,
                    left: 10,
                    leftConstraint: {
                        point1: {type: "left", element: [me]},
                        point2: {type: "left", element: 
                          [first, [{children: { clickableAreas: _ }}, [me]]]},
                        equals: 10
                    },
                    rightConstraint: {
                        point1: {type: "right", element: 
                          [last, [{children: { clickableAreas: _ }}, [me]]]},
                        point2: {type: "right", element: [me]},                        
                        equals: 10
                    },                                                          
                    bottomConstraint: {
                        point1: {type: "bottom", element: 
                          [first, [{children: { restartButton: _ }}, [me]]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10
                    },                            
                },
                display: {
                    background: "#ABC9F2"
                },
                children: {
                    clickableAreas: {
                        data: [sequence, r(1, [{numberOfOptions:_}, [me]])],
                        description: {
                            "class": "SingleClickableArea",
                            context: {
                                treasure: [equal, [{treasureArea:_},[embedding]],[me]],
                                active: [{gameOn:_},[embedding]],
                            },                            
                            position: {
                                top: 10,
                                width:50,
                                height:50,
                                rightFromPrevious: {
                                    point1: {type: "right", element: [prev, [me]]},
                                    point2: {type: "left", element: [me]},     
                                    equals: 10
                                }                                                                       
                            }
                        }
                    },
                    infoArea: {
                        description: {
                            "class": "InfoAreaButton",
                            context: {
                                gameOn: [{gameOn: _},[embedding]],
                                secondsToTimeUp: [{secondsToTimeUp: _},[embedding]],
                                timer: [{timer: _},[embedding]],
                                lastElapsed: [{lastElapsed: _},[embedding]],
                            },
                            position: {
                                "horizontal-center": 0,                                
                                width: 200,
                                //height: 20,
                                topConstraint: {
                                    point1: {type: "bottom", element: 
                                      [{children: { clickableAreas: _ }}, [embedding]]},
                                    point2: {type: "top", element: [me]},                        
                                    equals: 10 
                                },
                            },                                                        
                        }
                    },                                        
                    restartButton: {
                        description: {
                            "class": "RestartButton",
                            context: {
                                gameOn: [{gameOn:_},[embedding]],
                                started: [{started:_},[embedding]],
                                won: [{won:_},[embedding]],
                                timeIsUp: [{timeIsUp:_},[embedding]],
                            },
                            position: {    
                                "horizontal-center": 0,                                                                                  
                                height: 20,
                                width: 150,
                                topConstraint: {
                                    point1: {type: "bottom", element: 
                                      [{children: { infoArea: _ }}, [embedding]]},
                                    point2: {type: "top", element: [me]},                        
                                    equals: 10 
                                },
                            },                            
                            write: {
                                onRestart: {
                                    upon: [{ subType: "Click" }, [myMessage]],
                                    true: {
                                        sendRestart: {
                                            to: [message],
                                            merge: { msg: "restartGame", recipient: [embedding]}
                                        },
                                    }
                                }
                            }                                                                    
                        },                        
                    },
                }                          
            }
		}
    }
};