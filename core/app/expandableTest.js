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

////////////////////////////////
// This test makes use of the Expandable (see GeneralAreas).
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestDesign: {
        "class": o("Border", "TextAlignCenter", "DefaultDisplayText")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandable: o(
        { // default
            "class": o("TestDesign", "GeneralArea"),
            context: {
                displayText: [{ currentExpansionOffset:_ }, [me]],
                expandableSideWidth: 2
            }
        },
        {
            qualifier: { hoveringOverExpansionHandle: true },
            context: {
                expandableSideWidth: 3
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableHorizontal: {
        "class": "TestExpandable",
        context: {
            displayText: [{ currentExpansionWidth:_ }, [me]],
            
            // Expandable params:
            initialExpandableWidth: 200
        },
        display: {
            borderColor: "red"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableLeft: {
        "class": o("TestExpandableHorizontal", "ExpandableLeft"),
        display: {
            borderLeftWidth: [{ expandableSideWidth:_ }, [me]]
        },
        position: {
            right: 200,
            top: 150,
            height: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableRight: {
        "class": o("TestExpandableHorizontal", "ExpandableRight"),
        display: {
            borderRightWidth: [{ expandableSideWidth:_ }, [me]]
        },
        position: {
            left: 500,
            top: 300,
            height: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableVertical: {
        "class": "TestExpandable",
        context: {
            displayText: [{ currentExpansionHeight:_ }, [me]],
            
            // Expandable params:
            initialExpandableHeight: 200
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableTop: {
        "class": o("TestExpandableVertical", "ExpandableTop"),
        display: {
            borderTopWidth: [{ expandableSideWidth:_ }, [me]]
        },
        position: {
            left: 100,
            bottom: 100,
            width: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableBottom: {
        "class": o("TestExpandableVertical", "ExpandableBottom"),
        display: {
            borderBottomWidth: [{ expandableSideWidth:_ }, [me]]
        },
        position: {
            left: 250,
            top: 300,
            width: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpandableBottomRight: o(
        { // default            
            "class": o("TestDesign", "GeneralArea", "ExpandableBottomRight"),
            context: {
                // ExpandableBottomRight params
                initialExpandableWidth: 100,
                initialExpandableHeight: 100,
                
                displayText: [concatStr, o("Width: ", [{ currentExpansionWidth:_ }, [me]], "\n", "Height: ", [{ currentExpansionHeight:_ }, [me]])]
            },
            position: {
                left: 450,
                top: 420
                // width/height defined by ExpandableBottomRight
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpansionZeroSumStack: {
        "class": o("Border", "VerticalExpandableZeroSumController"),
        context: {
            // VerticalExpandableZeroSumController param
            expandables: [{ children: { rows:_ } }, [me]],
        },
        children: {
            rows: {
                data: [sequence, r(1,4)],
                description: {
                    "class": "TestExpansionZeroSum"
                }
            }
        },
        position: {
            width: 100,
            right: 50,
            height: 120,
            bottom: 50
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestExpansionZeroSum: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "ExpandableZeroSum"),
            context: {
                // ExpandableZeroSum params: 
                initialExpandableHeight: 30,
                
                displayText: [{ currentExpansionHeight:_ }, [me]]
            },
            display: { background: "orange" }
        },
        {
            qualifier: { lastExpandableZeroSum: false },
            "class": "BottomBorder"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the Expandable Classes:\nThe rectangles can be expanded by dragging their thicker side.  The square can be expanded by grabbing its bottom right corner.\nThe rectangles in the orange stack can be expanded, one at the expense of the other.\nDouble-click returns the area to its initial dimension along the expansion axis." 
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableTestApp: {
        "class": "App",
        position: {
            frame: 0
        },
        children: {
            testExpandableLeft: {
                description: {
                    "class": "TestExpandableLeft"
                }
            },
            testExpandableRight: {
                description: {
                    "class": "TestExpandableRight"
                }
            },
            testExpandableTop: {
                description: {
                    "class": "TestExpandableTop"
                }
            },
            testExpandableBottom: {
                description: {
                    "class": "TestExpandableBottom"
                }
            },
            testExpandableBottomRight: {
                description: {
                    "class": "TestExpandableBottomRight"
                }
            },
            testExpansionZeroSum: {
                description: {
                    "class": "TestExpansionZeroSumStack"
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
                "class": "ExpandableTestApp"
            }
        }
    }
};
