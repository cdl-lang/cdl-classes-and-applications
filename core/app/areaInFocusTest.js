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
    TestContainer: o(
        { // default
            "class": o("Border", "GeneralArea", "AreaInFocusController"),
            position: {
                width: 800,
                height: 200,
                "horizontal-center": 0
            },
            children: {
                testControl1: {
                    description: {
                        "class": "TestControl",
                        position: {
                            top: 20,
                            left: 10
                        }
                    }
                },
                testControl2: {
                    description: {
                        "class": "TestControl",
                        position: {
                            top: 20,
                            "horizontal-center": 0
                        }
                    }
                },
                testControl3: {
                    description: {
                        "class": "TestControl",
                        position: {
                            top: 20,
                            right: 10
                        }
                    }
                },
                testControl4: {
                    description: {
                        "class": "TestControl",
                        position: {
                            bottom: 20,
                            left: 10
                        }
                    }
                },
                testControl5: {
                    description: {
                        "class": "TestControl",
                        position: {
                            bottom: 20,
                            "horizontal-center": 0
                        }
                    }
                },
                testControl6: {
                    description: {
                        "class": "TestControl",
                        position: {
                            bottom: 20,
                            right: 10
                        }
                    }
                }
            }
        },
        {
            qualifier: { topContainer: true },
            context: {
                // "^areaInFocusControllerActivated": true - provided by AreaInFocusController
                osOfAreasInFocus: [embedded],
                defaultAreaInFocus: [{ children: { testControl1:_ } }, [me]]                  
            }
        },
        {
            qualifier: { topContainer: false },
            context: {                  
                osOfAreasInFocus: o([{ children: { testControl1:_ } }, [me]],
                                    [{ children: { testControl4:_ } }, [me]],
                                    [{ children: { testControl2:_ } }, [me]],
                                    [{ children: { testControl5:_ } }, [me]],
                                    [{ children: { testControl3:_ } }, [me]],
                                    [{ children: { testControl6:_ } }, [me]]),
                defaultAreaInFocus: [{ children: { testControl6:_ } }, [me]]                  
            }
        },
        {
            qualifier: { areaInFocusControllerActivated: false },
            write: {
                onTestContainerMouseClick: {
                    "class": "OnMouseClick",
                    true: { 
                        activateThisController: {
                            to: [{ areaInFocusControllerActivated:_ }, [me]],
                            merge: true
                        },
                        setAreaInFocusToDefault: {
                            to: [{ areaInFocus:_ }, [me]],
                            merge: o()
                        }
                    }
                }
            }           
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inTopContainer: [{ topContainer:_ }, [embedding]]
            }
        },
        { // 
            "class": o("BackgroundColor", "TextAlignCenter", "DefaultDisplayText", "Border", "GeneralArea", "AreaInFocus"),
            context: {
                myAreaInFocusController: [embedding],                               
                "^counter": 0,              
                displayText: [{ counter:_ }, [me]]
            },
            position: {
                width: 100,
                height: 50
            },
            write: {
                onTestcontrolMouseDownOrEnter: {
                    upon: o(
                        mouseDownEvent,
                        enterEvent
                    ),
                    true: {
                        "class": "IncrementAreaInFocusCounter"
                    }
                }
            }            
        },
        {
            qualifier: { iAmTheAreaInFocus: true },
            "class": "TextBold",
            context: {
                textSize: 16
            }
        },
        {
            qualifier: { inTopContainer: true },
            context: {
                backgroundColor: "yellow"
            }
        },
        {
            qualifier: { inTopContainer: false },
            context: {
                backgroundColor: "orange"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IncrementAreaInFocusCounter: {
        increment: {
            to: [{ counter:_ }, [me]],
            merge: [plus, [{ counter:_ }, [me]], 1]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "We start out with the focus given to the default areaInFocus of the top container. Clicking anywhere within a container activates it and deactivates the other container.\nThe colored area is the one that has the keyboard focus. Use Tab/Shift+Tab to shift focus across the os of areas it pertains to (these all reside within their container) - note the different sequence in the two containers.\nMouseClick or Enter result in counter++ for the receiving area."
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        "class": superclass,
        position: {
            left: 20,
            bottom: 20
        },
        write: {
            onTestResetControlReset: {
                // upon: provided by superclass
                true: {
                    resetCounters: {
                        to: [{ counter:_ }, [areaOfClass, "TestControl"]],
                        merge: 0
                    },
                    activateThisController: {
                        to: [{ areaInFocusControllerActivated:_ }, [me]],
                        merge: true
                    },
                    setAreaInFocusToDefault: {
                        to: [{ areaInFocus:_ }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AreaInFocusTestApp: {
        "class": "TestApp",
        context: {
            testResetable: true // override TestApp default
        },      
        children: {
            testContainer1: {
                description: {
                    "class": "TestContainer",
                    context: {
                        topContainer: true
                    },
                    position: { 
                        top: 100
                    }
                }
            },
            testContainer2: {
                description: {
                    "class": "TestContainer",
                    context: { 
                        topContainer: false,
                        "^areaInFocusControllerActivated": false // overrride default value provided by AreaInFocusController                                      
                    },
                    position: { 
                        bottom: 50
                    }
                }
            }
        }
    }
};

var screenArea = { 
    "class": o("ScreenArea"),
    children: {
        app: {
            description: {
                "class": "AreaInFocusTestApp"
            }
        }
    }
};
