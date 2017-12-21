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

"use strict";

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Dragging of areas implemented with or constraints (and no state is maintainedy)"
        }
    },
    
    Container: o(
        {
            "class": "GeneralArea",
            context: {
                "^beingReordered": false
            },
            display: {
                borderColor: "black",
                borderWidth: 1,
                borderStyle: "solid"
            },
            position: {
                left: 50,
                width: 500,
                top: 200,
                height: 200
            },
            children: {
                cols: {
                    data: o("red", "green", "blue", "violet", "khaki"),
                    description: {
                        "class": "Col"
                    }
                }
            }
        },
        {
            qualifier: { beingReordered: true },
            position: {
                spacerLeftIsRightOfLeftEdge: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [{ myApp: { colBeingDragged:_ } }, [me]],
                        label: "spacerLeft"
                    },
                    min: 0
                },

                spacerRightIsLeftOfRightEdge: {
                    point1: {
                        element: [{ myApp: { colBeingDragged:_ } }, [me]],
                        label: "spacerRight"
                    },
                    point2: {
                        type: "right"
                    },
                    min: 0
                }
            }
        },
        {
            qualifier: { beingReordered: false },
            position: {
                firstCol: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [first,
                                  [
                                      { children: { cols: _ } },
                                      [me]
                                  ]
                                 ],
                        type: "left"
                    },
                    equals: 0
                },
                lastCol: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [last,
                                  [
                                      { children: { cols: _ } },
                                      [me]
                                  ]
                                 ],
                        type: "right"
                    },
                    equals: 0
                }
            }
        }
    ),
    
    Col: o(     
        {
            qualifier: { beingReordered: false },
            "class": "MemberOfLeftToRightAreaOS"
        },
        {
            qualifier: { beingReordered: true, iAmDraggedToReorder: true },
            position: {
                spacerWidth: {
                    point1: { label: "spacerLeft" },
                    point2: { label: "spacerRight" },
                    equals: 100
                },
                                    
                // here we define the iAmDraggedToReorder area's rightPoint to match that of its prev's and its leftPoint to match that of its next, 
                // this allows prevRight/nextLeft to behave as if we're positioning an os that excludes the area iAmDraggedToReorder.
                myRightPoint: { 
                    point1: [{ prevRight:_ }, [me]],
                    point2: { label: "rightPoint" },
                    equals: 0
                },
                myLeftPoint: {
                    point1: [{ nextLeft:_ }, [me]],
                    point2: { label: "leftPoint" },
                    equals: 0
                },
                
                leftAttachToMouse: {
                    point1: { type: "left" },
                    point2: { element: [pointer], type: "left" },
                    equals: [
                        { hOffset: _ },
                        [me]
                    ]
                },
                
                nearSpacer: {
                    point1: { type: "left" },
                    point2: { label: "spacerLeft" },
                    min: -50,
                    max: 50,
                    priority: -4
                }
            }
        },
        {
            qualifier: { beingReordered: true, iAmDraggedToReorder: false },
            position: {
                myRightPoint: {
                    point1: { type: "right" },
                    point2: { label: "rightPoint" },
                    equals: 0
                },
                myLeftPoint: {
                    point1: { type: "left" },
                    point2: { label: "leftPoint" },
                    equals: 0
                },

                leftOfPrevRight: {
                    point1: [{ prevRight: _ }, [me]],
                    point2: { type: "left" },
                    min: 0
                },
                rightOfNextLeft: {
                    point1: { type: "right" },
                    point2: [{ nextLeft: _ }, [me]],
                    min: 0
                },

                eitherAttachLeftToPrevRight: {
                    point1: [{ prevRight: _ }, [me]],
                    point2: { type: "left" },
                    equals: 0,
                    orGroups: { label: "leftOr" },
                    priority: -10
                },
                orAttachLeftToSpacerRight: {
                    point1: {
                        element: [{ myApp: { colBeingDragged:_ } }, [me]],
                        label: "spacerRight"
                    },
                    point2: { type: "left" },
                    equals: 0,
                    orGroups: { label: "leftOr" },
                    priority: -10
                },
                                    
                repelSpacerLeft: {
                    point1: {
                        element: [{ myApp: { colBeingDragged:_ } }, [me]],
                        label: "spacerRight"
                    },
                    point2: {type: "left"},
                    min: 0,
                    orGroups: { label: "repelSpacer" },
                    priority: -5
                },
                repelSpacerRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myApp: { colBeingDragged:_ } }, [me]],
                        label: "spacerLeft"
                    },
                    min: 0,
                    orGroups: { label: "repelSpacer" },
                    priority: -5
                }                   
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            write: {
                onMouseDown: {
                    upon: [{type: "MouseDown"}, [myMessage]],
                    true: {
                        setBeingReordered: {
                            to: [
                                { beingReordered:_ },
                                [me]
                            ],
                            merge: true
                        },
                        setBeingDragged: {
                            to: [
                                { iAmDraggedToReorder: _ },
                                [me]
                            ],
                            merge: true
                        },
                        setMouseOffset: {
                            to: [{ hOffset:_ },
                                 [me]
                                ],
                            merge: [
                                offset,
                                { type: "left" },
                                { element: [pointer], type: "left" }
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            write: {
                onMouseUp: {
                    upon: [{type: "MouseUp"}, [message]],
                    true: {
                        unsetBeingReordered: {
                            to: [{ beingReordered:_ }, [me]],
                            merge: false
                        },
                        unsetBeingDragged: {
                            to: [{ iAmDraggedToReorder:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            "class": "GeneralArea",
            context: {
                "^iAmDraggedToReorder": false,
                "^hOffset": 0,
                beingReordered: [
                    { beingReordered:_ },
                    [embedding]
                ],
                prevRight: [
                    cond,
                    [me],
                    o(
                        {
                            on: [
                                first,
                                [
                                    { children: { cols: _ } },
                                    [embedding]
                                ]
                            ],
                            use: {
                                element: [embedding],
                                type: "left"
                            }
                        },
                        {
                            on: null,
                            use: {
                                element: [prev, [me]],
                                label: "rightPoint"
                            }
                        }
                    )
                ],
                nextLeft: [
                    cond,
                    [me],
                    o(
                        {
                            on: [
                                last,
                                [
                                    { children: { cols: _ } },
                                    [embedding]
                                ]
                            ],
                            use: {
                                element: [embedding],
                                type: "right"
                            }
                        },
                        {
                            on: null,
                            use: {
                                element: [next, [me]],
                                label: "leftPoint"
                            }
                        }
                    )
                ]
            },
            display: {
                background: [
                    { param: { areaSetContent: _ } },
                    [me]
                ]
            },
            position: {
                top: 0,
                bottom: 0,
                width: 100
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DragTestApp: {
        "class": "TestApp",
        context: {
            colBeingDragged: [{ iAmDraggedToReorder: true }, [areaOfClass, "Col"]]
        },
        children: {
            container: {
                description: {
                    "class": "Container"
                }
            },
            showSpacer: {
                description: {
                    "class": "GeneralArea",
                    display: { background: "black" },
                    position: {
                        top: 150,
                        width: 100,
                        height: 20,
                        leftWithSpacerLeft: {
                            point1: { type: "left" },
                            point2: {
                                element: [{ myApp: { colBeingDragged:_ } }, [me]],
                                label: "spacerLeft"
                            },
                            equals: 0
                        }
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        
    }   
    
};

var screenArea = {
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "DragTestApp"
            }
        }
    }
};
