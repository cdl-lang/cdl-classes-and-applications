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
    TestCoselectablesController: {
        "class": o("TextAlignRight", "DefaultDisplayText", "Border", "GeneralArea", "CoselectablesController"),
        context: {           
            displayText: [concatStr, [{ coselectedUniqueIDs:_ }, [me]], ","]
        },
        position: {
            left: 150,
            right: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestCoselectablesControllerWORepetitions: {
        "class": o("TestCoselectablesController", "TestContiguousCoselectablesController"),
        context: {            
            testCoselectablesData: [sequence, r(1,8)],
            backgroundColor: "yellow",
            coselectionMouseEvent: "MouseClick"
        },
        position: {
            top: 180,
            height: 100         
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestCoselectablesControllerWithRepetitions: {
        "class": "TestCoselectablesController",
        context: {
            // TestCoselectablesController params
            coselectables: [{ children: { coselectableTestElements:_ } }, [embedded]],
            immunityFromCoselectionReset: o(
                                            [
                                             { myCoselectablesController: [me] },
                                             [areaOfClass, "CoselectableSwitch"]
                                            ],
                                            [areaOfClass, "TestDisplayContiguousCoselectables"]
                                           )
        },
        position: {
            top: 500,
            height: 220
        },
        children: {
            displayContigButton1: {
                description: {
                    "class": "TestDisplayContiguousCoselectables",
                    position: {
                        anchorToContiguousOSContainer: {
                            point1: {
                                type: "vertical-center"
                            },
                            point2: {
                                element: [{ children: { testContigCoselectablesController1:_ } }, [embedding]],
                                type: "vertical-center"
                            },
                            equals: 0
                        }
                    }
                }
            },      
            testContigCoselectablesController1: {
                description: {
                    "class": "TestContiguousCoselectablesController",
                    context: {
                        backgroundColor: "orange",
                        coselectionMouseEvent: "MouseDown",
                        myCoselectablesController: [embedding],
                        testCoselectablesData: [sequence, r(1,10)],
                        show: [not, [{ checked:_ }, [{ children: { displayContigButton1:_ } }, [embedding]]]]
                    },
                    position: {
                        top: 5
                    }
                }
            },
            displayContigButton2: {
                description: {
                    "class": "TestDisplayContiguousCoselectables",
                    position: {
                        anchorToContiguousOSContainer: {
                            point1: {
                                type: "vertical-center"
                            },
                            point2: {
                                element: [{ children: { testContigCoselectablesController2:_ } }, [embedding]],
                                type: "vertical-center"
                            },
                            equals: 0
                        }
                    }
                }
            },      
            testContigCoselectablesController2: {
                description: {
                    "class": "TestContiguousCoselectablesController",
                    context: {
                        backgroundColor: "orange",
                        coselectionMouseEvent: "MouseDown",
                        myCoselectablesController: [embedding],
                        testCoselectablesData: o(1,2,5,6,7,11,12),                        
                        show: [not, [{ checked:_ }, [{ children: { displayContigButton2:_ } }, [embedding]]]]
                    },                  
                    position: {
                        top: 110
                    }
                }
            }          
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestContiguousCoselectablesController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                show: true
            }
        },
        { // default
            "class": o("DefaultDisplayText", "Border", "GeneralArea", "ContiguousCoselectablesController"),
            context: {
                displayText: [{ beginningOfContigCoselectionAux:_ }, [me]],
                
                // ContiguousCoselectablesController param:                
                coselectables: [
                                [areaOfClass, "Coselectable"],
                                [{ children: { coselectableTestElements:_ } }, [me]]
                               ],
                immunityFromCoselectionReset: [ // override the definition provided by ContiguousCoselectablesController
                                               { myContigCoselectablesController: [me] },
                                               [areaOfClass, "CoselectableSwitch"]
                                              ]
            },          
            position: {
                left: 50,
                height: 100,
                positionFirstElement: {
                    point1: {
                        type: "left"
                    },
                    point2: { 
                        element: [first, [{ children: { coselectableTestElements:_ } }, [me]]],
                        type: "left"
                    },
                    equals: 10
                }
            },
            children: {
                coselectableTestElements: {
                    data: [{ testCoselectablesData:_ }, [me]],
                    description: {
                        "class": "CoselectableTestElement"
                    }            
                }
            }       
        },
        { 
            qualifier: { show: true },
            position: {
                right: 300
            }
        },
        { 
            qualifier: { show: false },
            position: {
                width: 10
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoselectableTestElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                amICoselectable: [{ children: { coselectableSwitch: { checked:_ } } }, [me]],
                testWORepetition: [
                                   [embedding],
                                   [areaOfClass, "TestCoselectablesController"]
                                  ],
                amIBeginningOfContigSelection: [equal,
                                                [me], 
                                                [{ myContigCoselectablesController: { beginningOfContigCoselection:_ } }, [me]]
                                               ]
            }
        },
        {
            qualifier: { amICoselectable: true },
            "class": "Coselectable",
            context: {
                // Coselectable param
                coselectableUniqueID: [{ param: { areaSetContent:_ } }, [me]],
                myContigCoselectablesController: [embedding],
                coselectionMouseEvent: [{ coselectionMouseEvent:_ }, [embedding]]
                // myCoselectablesController provided in variants below
            }
        },
        { // default
            "class": o("BackgroundColor", "TextAlignCenter", "DefaultDisplayText", "GeneralArea", "MemberOfLeftToRightAreaOS"),
            context: {                
                displayText: [{ param: { areaSetContent:_ } }, [me]],
                spacingFromPrev: 10, // MemberOfLeftToRightAreaOS param
                backgroundColor: [{ backgroundColor:_ }, [embedding]]
            },          
            position: {
                top: 10,
                bottom: 10,
                width: 80
            },
            children: { 
                coselectableSwitch: {
                    description: {
                        "class": "CoselectableSwitch"
                    }
                }
            }
        },
        {
            qualifier: { testWORepetition: true },
            context: { 
                myCoselectablesController: [embedding]
            }
        },
        {
            qualifier: { testWORepetition: false },
            context: { 
                myCoselectablesController: [embedding, [embedding]]
            }
        },
        {
            qualifier: { coselected: true },
            "class": "Border",
            display: {
                borderWidth: 2
            }
        },
        {
            qualifier: { amIBeginningOfContigSelection: true },
            children: {
                beginningOfContigSelectionMarker: {
                    description: {
                        "class": o("TextAlignCenter", "DefaultDisplayText", "GeneralArea"),
                        context: { 
                            displayText: "shift range" 
                        },
                        position: {
                            left: 0,
                            right: 0,
                            bottom: 2,
                            height: 40
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoselectableSwitch: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^checked": true
            }
        },
        { // default
            "class": o("BiStateButton", "BlockMouseEvent"),
            context: {
                // these two context labels are used for the definition of immunityFromCoselectionReset of the respective controllers
                myContigCoselectablesController: [
                                                  [embeddingStar, [me]],
                                                  [areaOfClass, "ContiguousCoselectablesController"]
                                                 ],
                myCoselectablesController: [
                                            [embeddingStar, [me]],
                                            [areaOfClass, "CoselectablesController"]
                                           ]
            },          
            position: {
                left: 10,
                right: 10,
                top: 5,
                height: 20
            }
        },
        { 
            qualifier: { checked: true },
            context: { 
                displayText: "+"
            }
        },
        { 
            qualifier: { checked: false },
            context: { 
                displayText: "-"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestDisplayContiguousCoselectables: o(
        { // default
            "class": o("BiStateButton"),
            position: {
                width: 20,
                height: 20,
                left: 20
            }
        },
        {
            qualifier: { checked: false },
            display: {
                background: "black"
            }
        },
        {
            qualifier: { checked: true },
            display: {
                background: "red"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the Coselectable Class:\n1. The yellow realm includes a single contiguous set (imitating coselectable facets, for example), and the coselection event is a mouseClick.\n2. The orange realm includes multiple contiguous (sub)sets (imitating coselectable items-products in the application), where repetitions across contiguous sets are expected. Note how co-selecting in one contiguous set results in co-selection in the other. And here, the coselection event is the default mouseDown.\n\nAlso note how the open/close display buttons to their left do not reset the co-selections in them (but do reset the selections in the (unrelated) yellow areas.\nMouseDown, Ctrl, and Shift are combined per the co-selection scheme defined in the Windows file directory. Click anywhere outside the coselectable areas to clear coselections.\nThe "+" rectangle can be clicked to toggle the area's coselectability - note its effect on the Shift-Range Beginning - if the area currently marked as Shift-Range Beginning loses its coselectability, the default area receives this label"
        },
        position: {
            height: 180
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        "class": superclass,
        position: {
            left: 20,
            bottom: 20
        }
        // write: onTestResetControlReset: no need to take any further action - the click itself, resets the coselections
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDropDown: {
        "class": o("DropDownMenuableDesign", "DropDownMenuable", "GeneralArea"),
        context: {
            // DropDownMenuable params:
            dropDownMenuLogicalSelectionsOS: o("A1234567890111213141516171819202122", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"),
            scrollbar: {
                showPrevNextButtons: false,
                showViewBackFwdButtons: false,
                showBeginningEndDocButtons: false,
                
            }
        },
        position: {
            top: 200,
            left: 20,
            width: 100,
            height: 20
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoselectableTestApp: {
        "class": "TestApp",
        context: {
            testResetable: true // override TestApp default
        },      
        children: {
            testCoselectablesControllerWORepetitions: {
                description: {
                    "class": "TestCoselectablesControllerWORepetitions"
                }
            },
            testCoselectablesControllerWithRepetitions: {
                description: {
                    "class": "TestCoselectablesControllerWithRepetitions"
                }
            },
            
            debugDropDown: {
                description: { 
                    "class": "DebugDropDown"
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
                "class": "CoselectableTestApp"
            }
        }
    }
};
