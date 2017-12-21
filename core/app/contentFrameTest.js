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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Try out content-frame relations. Frame marked in black, area (i.e. content) border marked in red.\nHover in area to emphasize text. MouseDown to see how the frame changes its position.\nParams:\n1. nColumns: number of red columns.\n2. testMode=Clipper/ContentFrame(/or neither one).\n3. positioningMode=Relative/Direct (relates to horizontal positioning of the red columsn; Direct by default)."
        },
        position: {
            height: 100
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContentFrameTestArea: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "Border", "GeneralArea"),
            context: {
                borderWidth: 2,
                borderColor: "red"
            },
            position: {
                "content-width": 100,
                "content-height": 100
            }
        },
        {
            qualifier: { inArea: true },
            "class": "TextBold"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IndependentContentFrameTestArea: {
        "class": o("ContentFrameTestArea", "Tmdable"),
        independentContentPosition: true,
        position: {
            leftContent: {
                point1: { type: "left" },
                point2: { type: "left", content: true },
                equals: [{ horizontalContentFrameMargin:_ }, [me]]
            },
            rightContent: {
                point1: { type: "right", content: true },
                point2: { type: "right" },
                equals: [{ horizontalContentFrameMargin:_ }, [me]]
            },
            topContent: {
                point1: { type: "top" },
                point2: { type: "top", content: true },
                equals: [{ verticalContentFrameMargin:_ }, [me]]
            },
            bottomContent: {
                point1: { type: "bottom", content: true },
                point2: { type: "bottom" },
                equals: [{ verticalContentFrameMargin:_ }, [me]]
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowFrameTestArea: {
        "class": "Border",
        context: {
            refArea: [{ param: { areaSetContent:_ } }, [me]]
        },
        position: {
            topContent: {
                point1: { type: "top", content: true },
                point2: { element: [{ refArea:_ }, [me]], type: "top" },
                equals: 0
            },
            bottomContent: {
                point1: { type: "bottom", content: true },
                point2: { element: [{ refArea:_ }, [me]], type: "bottom" },
                equals: 0
            },
            leftContent: {
                point1: { type: "left", content: true },
                point2: { element: [{ refArea:_ }, [me]], type: "left" },
                equals: 0
            },
            rightContent: {
                point1: { type: "right", content: true },
                point2: { element: [{ refArea:_ }, [me]], type: "right" },
                equals: 0
            }            
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContentFrameTestApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                testMode: [arg, "testMode", o()],
                positioningMode: [arg, "positioningMode", "Direct"]
            }  
        },
        { // default
            "class": "TestApp"
        },
        {
            qualifier: { testMode: true },
            context: {
                areaSetData: [sequence, r(1, [arg, "nColumns", 100])]
            }
        },
        {
            qualifier: { testMode: "Clipper" },
            children: {
                clipperFrameOfReference: {
                    description: {
                        "class": "TestClipperFrameOfReference"
                    }
                },
                clipperAreaSet: {
                    data: [{ areaSetData:_ }, [me]],
                    description: {
                        "class": "TestClipperInAreaSet"
                    }
                }
            }
        },
        {
            qualifier: { testMode: "ContentFrame" },
            children: {
                contentFrameFrameOfReference: {
                    description: {
                        "class": "TestContentFrameFrameOfReference"
                    }
                },
                contentFrameAreaSet: {
                    data: [{ areaSetData:_ }, [me]],
                    description: {
                        "class": "TestContentFrameInAreaSet"
                    }  
                }
            }
        },
        {
            qualifier: { testMode: false },
            children: {
                simpleArea: {
                    description: {
                        "class": "ContentFrameTestArea",
                        position: {
                        left: 10,
                        top: 100 
                        },
                        context: {
                            displayText: "Simple Area w/Border"
                        }
                    }
                },
                muchBiggerFrame: {
                    description: {
                        "class": "IndependentContentFrameTestArea",
                        context: {
                            displayText: "much bigger frame",
                            horizontalContentFrameMargin: [cond,
                                                        [{ tmd:_ }, [me]],
                                                        o({ on: false, use: 20 }, { on: true, use: 40 })
                                                        ], 
                            verticalContentFrameMargin: [cond,
                                                        [{ tmd:_ }, [me]],
                                                        o({ on: false, use: 20 }, { on: true, use: 40 })
                                                        ]
                        },
                        position: {
                        left: 200, // frame!
                        top: 100 // frame!
                        }                       
                    }                
                },
                frameClips: {
                    description: {
                        "class": "IndependentContentFrameTestArea",
                        context: {
                            displayText: "frame clips",
                            horizontalContentFrameMargin: [cond,
                                                        [{ tmd:_ }, [me]],
                                                        o({ on: false, use: 20 }, { on: true, use: -20 })
                                                        ], 
                            verticalContentFrameMargin: [cond,
                                                        [{ tmd:_ }, [me]],
                                                        o({ on: false, use: -20 }, { on: true, use: 20 })
                                                        ]
                        },
                        position: {
                        left: 400, // frame!
                        top: 100 // frame!
                        }                       
                    }                
                },
                frames: {
                    data: [areaOfClass, "ContentFrameTestArea"],
                    description: {
                        "class": "ShowFrameTestArea"
                    }
                }                
            }            
        }
    ),
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. vertical positioning
    // 2. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFrameOfReference: {
        position: {
            left: 10,
            right: 10,
            height: 100
        },
        children: {
            theFrame: {
                description: {
                    "class": "Border",
                    context: {
                        borderWidth: 3
                    },
                    position: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 20
                    }
                }
            },
            title: {
                description: {
                    "class": o("TextBold", "DefaultDisplayText"),
                    context: {
                        displayText: [{ displayText:_ }, [embedding]]
                    },
                    position: {
                        height: 20,
                        top: 0,
                        width: [displayWidth],
                        "vertical-center": 0
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestClipperFrameOfReference: {
        "class": "TestFrameOfReference",
        context: {
            displayText: "Areaset in Clipper Model"
        },
        position: {
            top: 250
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestContentFrameFrameOfReference: {
        "class": "TestFrameOfReference",
        context: {
            displayText: "Areaset in Content-Frame Model"
        },
        position: {
            top: 400
        }        
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAreaInAreaSet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                positioningMode: [{ myApp: { positioningMode:_ } }, [me]]
            }
        },
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "Border", "GeneralArea"),
            context: {
                borderColor: "red",
                columnWidth: 30,
                spacingBetweenColumns: 5,
                index: [index,
                        [{ areaOS:_ }, [me]],
                        [me]
                       ],
                displayText: [{ index:_ }, [me]]                
            },
            position: {
                "content-width": [{ columnWidth:_ }, [me]],
                "content-height": 50            
            }            
        },
        {
            qualifier: { positioningMode: "Direct" },
            context: {
                offsetFromLeftOfReferenceFrame: [plus, 
                       [{ spacingFromPrev:_ }, [me]],
                       [mul,
                        [{ index:_ }, [me]],
                        [plus, 
                         [{ spacingFromPrev:_ }, [me]],
                         [{ columnWidth:_ }, [me]]
                        ]
                       ]
                      ]
            }
        },
        {
            qualifier: { positioningMode: "Relative" },
            "class": "MemberOfLeftToRightAreaOS"
            // params for MemberOfLeftToRightAreaOS: see inheriting classes 
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestClipperInAreaSet: { 
        "class": o("GeneralArea", "MatchArea"),
        context: {
            match: [{ children: { theFrame:_ } }, [areaOfClass, "TestClipperFrameOfReference"]]            
        },
        children: {
            clipped: {
                description: {
                    "class": "TestClippedInAreaSet"
                }
            }
        }
    },
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestClippedInAreaSet: o(
        { // default
            "class": "TestAreaInAreaSet",
            context: {
                areaOS: [{ myApp: { children: { clipperAreaSet: { children: { clipped:_ } } } } }, [me]],
                spacingFromPrev: [{ spacingBetweenColumns:_ }, [me]]
            },
            position: {
                "vertical-center": 0                
            }
        },
        {
            qualifier: { positioningMode: "Direct" },
            position: {
                left: [{ offsetFromLeftOfReferenceFrame:_ }, [me]]
            }
        },
        {
            qualifier: { positioningMode: "Relative" },
            // spacingFromPrev: see default clause 
        },
        {
            qualifier: { positioningMode: "Relative",
                         firstInAreaOS: true },
            position: {
                left: [{ spacingFromPrev:_ }, [me]]
            }
        }        
    ),        
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestContentFrameInAreaSet: o(
        { // default
            "class": o("TestAreaInAreaSet", "MatchArea"),
            context: {
                areaOS: [{ myApp: { children: { contentFrameAreaSet:_ } } }, [me]],
                spacingFromPrev: [plus, [mul, [{ borderWidth:_ }, [me]], 2], [{ spacingBetweenColumns:_ }, [me]]],
                match: [{ children: { theFrame:_ } }, [areaOfClass, "TestContentFrameFrameOfReference"]],            
                useContentForAreaSetPositioning: true
            },
            independentContentPosition: true,
            position: {
                alignWithFrameVerticalCenter: {
                    point1: { type: "vertical-center" },
                    point2: { type: "vertical-center", content: true },
                    equals: 0
                }                
            }
        },
        {
            qualifier: { positioningMode: "Direct" },
            position: {
                attachLeftContentToFrame: {
                    point1: { type: "left" },
                    point2: { type: "left", content: true },
                    equals: [{ offsetFromLeftOfReferenceFrame:_ }, [me]]
                }   
            }
        },        
        {
            qualifier: { positioningMode: "Relative" },
            // spacingFromPrev: see default clause 
        },
        {
            qualifier: { positioningMode: "Relative",
                         firstInAreaOS: true },
            position: {
                attachLeftContentToFrame: {
                    point1: { type: "left" },
                    point2: { type: "left", content: true },
                    equals: [{ spacingFromPrev:_ }, [me]]
                }   
            }
        }
    )
};

var screenArea = {
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "ContentFrameTestApp"
            }
        }
    }
};
