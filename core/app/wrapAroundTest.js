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
    WrapAroundTest: o(
        {
            qualifier: "!",
            context: {
                debug: false
            }
        },
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "GeneralArea", "WrapAround"),
            display: {
                background: "pink"
            },
            position: {            
                width: [{ param: { areaSetContent: { width:_ } } }, [me]],
                height: 20                
            }
        },
        {
            qualifier: { firstOfWrapArounds: true },
            position: {
                top: 0
            }
        },
        {
            qualifier: { firstInRow: true },
            display: {
                background: "orange"
            }
        },
        {
            qualifier: { lastInRow: true },
            "class": "Border"
        },
        {
            qualifier: { debug: true },
            context: {
                displayText: [offset, { element: [embedding], type: "left" }, { label: "myEndOnSameRowAsPrev" }]
            }
        },
        {
            qualifier: { debug: false },
            context: {
                displayText: [{ param: { areaSetContent: { id:_ } } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WrapAroundView: o(
        { // default
            "class": o("Border", "HorizontalWrapAroundController", "ExpandableRight", "BiStateButton"),
            context: {
                
                // HorizontalWrapAroundController params: 
                wrapArounds: [{ children: { wrapArounds:_ } }, [me]],
                wrapAroundSpacing: 10,
                wrapAroundSecondaryAxisSpacing: 10,
                
                // Expandable params:
                initialExpandableWidth: 200
            },
            position: {
                height: 200            
            },

            display: {          
                borderRightWidth: [{ expandableSideWidth:_ }, [me]]
            },
            children: {
                wrapArounds: {
                    data: [{ myApp: { areasData:_ } }, [me]],
                    description: {
                        "class": "WrapAroundTest"
                    }
                }
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
    WrapAroundTestApp: {
        "class": "TestApp",
        context: { 
            areasData: o(
                            {
                                id: 1,
                                width: 30
                            },
                            {
                                id: 2,
                                width: 150
                            },
                            {
                                id: 3,
                                width: 100
                            },
                            {
                                id: 4,
                                width: 60
                            },
                            {
                                id: 5,
                                width: 90
                            },
                            {
                                id: 6,
                                width: 130
                            },
                            {
                                id: 7,
                                width: 20
                            },
                            {
                                id: 8,
                                width: 100
                            },
                            {
                                id: 9,
                                width: 80
                            },
                            {
                                id: 10,
                                width: 50
                            }
                        )
        },
        children: {
            wrapAroundViewLeftAligned: {
                description: {
                    "class": "WrapAroundView",
                    context: {
                        wrapAroundAlignment: "beginning"
                    },
                    position: {
                        left: 100,
                        top: 50
                    }
                }
            },
            wrapAroundViewCenterAligned: {
                description: {
                    "class": "WrapAroundView",
                    context: {
                        wrapAroundAlignment: "center"
                    },
                    position: {
                        left: 100,
                        top: 300
                    }
                }
            },
            wrapAroundViewRightAligned: {
                description: {
                    "class": "WrapAroundView",
                    context: {
                        wrapAroundAlignment: "end"
                    },
                    position: {
                        left: 100,
                        top: 550
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the WrapAroundClasses library: Grab the Views by their right border to modify their width. Examples of left-/center-/right-alignment"
        },
        position: {
            height: 50
        }
    }   
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "WrapAroundTestApp"
            }
        }
    }
};
