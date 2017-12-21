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
    // API:
    // 1. debugDoc: an os or object
    // 2. title: a string
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplayViewAndTitle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^minimized": false
            }
        },
        { // default
            "class": o("Border", "GeneralArea", "BlockMouseEvent", "Draggable", "AboveAppZTop", "MinWrap"),
            context: {
                minWrapAround: 2,               
                // Draggable Params: 
                draggableStable: true,
                draggableInitialY: 100
            },
            display: { background: "pink" },
            children: {
                title: {
                    description: {
                        "class": o("TextAlignCenter", "DefaultDisplayText", "DisplayDimension"),
                        position: {
                            top: 2,
                            "horizontal-center": 0,
                            minRight: {
                                point1: { type: "right" },
                                point2: { element: [embedding], type: "right" },
                                min: 20
                            }
                        },
                        context: {
                            displayText: [{ title:_ }, [embedding]]
                        }
                    }
                },
                minimizationControl: {
                    description: {
                        "class": "DebugDisplayViewMinimizationControl"
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            "class": "ExpandableBottomRight",
            context: {
                // ExpandableBottomRight params
                initialExpandableWidth: 350,
                initialExpandableHeight: 400            
            },
            children: {
                view: {
                    description: {
                        "class": "DebugDisplayView"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplayView: {
        "class": o("GeneralArea", "VerticalContMovableController"),
        context: {
            // VerticalContMovableController params
            beginningOfDocPoint: atomic({
                element: [{ children: { doc:_ } }, [me]],
                type: "top"
            }),
            endOfDocPoint: atomic({
                element: [{ children: { doc:_ } }, [me]],
                type: "bottom"
            })          
        },
        position: {
            left: 0,
            right: 0,
            topConstraint: {
                point1: { element: [{ children: { title:_ } }, [embedding]], type: "bottom" },
                point2: { type: "top" },
                equals: 10
            },
            bottom: 0
        },
        children: {
            doc: {
                description: {
                    "class": "DebugDisplayDoc" 
                }
            },
            scrollbar: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [embedding],
                        attachToView: "beginning",
                        attachToViewOverlap: true,
                        showOnlyWhenInView: true
                    }
                }
            }           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplayDoc: {
        "class": o("GeneralArea", "MinWrapVertical"),
        context: {
            myDebugDoc: [
                         { debugDoc:_ }, 
                         [
                          [embeddingStar, [me]],
                          [areaOfClass, "DebugDisplayViewAndTitle"]
                         ]
                        ]
        },
        position: {
            left: 0,
            right: 0
        },
        children: {
            debugObjs: {
                data: [{ myDebugDoc:_ }, [me]],
                description: {
                    "class": "DebugDisplayObj"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplayObj: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^minimized": false
            }
        },
        { // default
            "class": o("BottomBorder", "DebugDisplay", "MemberOfTopToBottomAreaOS"),
            position: {
                left: 0,
                right: 0
            },
            write: {
                onDebugDisplayObjClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleMinimized: {
                            to: [{ minimized:_ }, [me]],
                            merge: [not, [{ minimized:_ }, [me]]]
                        },
                        scrollToTopOfDoc: {
                            to: [
                                 { viewStaticPosOnDocCanvas:_ }, 
                                 [
                                  [embeddingStar], 
                                  [areaOfClass, "DebugDisplayView"]
                                 ]
                                ],
                            merge: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            context: {
                displayDebugObj: [{ param: { areaSetContent:_ } }, [me]]
            },
            position: {
                height: 300
            }
        },
        {
            qualifier: { minimized: true }, // don't show the view
            context: {
                displayDebugObj: { 
                                    uniqueID: [{ param: { areaSetContent: { uniqueID:_ } } }, [me]],
                                    name: [{ param: { areaSetContent: { name:_ } } }, [me]]
                                 }
            },
            position: {
                height: [displayHeight]
            }
        }
    )
};