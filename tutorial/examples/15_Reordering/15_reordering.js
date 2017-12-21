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

//"use strict";

//reorderable ReorderableContainer
//reorderable col

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ReorderableContainer: o(
        {
            context: {
                "^order": o(),
            },
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ReorderableColumn: o(     
        {
            context: {     
                order: [{order:_},[embedding]],   
                width: [offset,
                    {type: "left", element: [me]},
                    {type: "right", element: [me]},
                ],    
                halfWidth: [div, [{width:_},[me]], 2],
                minusHalfWidth: [uminus, [{halfWidth:_},[me]]],
                "^imBeingDragged": false, //whether the current col is being dregged
                "^hOffset": 0,
                colBeingDragged: [{ imBeingDragged: true }, [{order: _}, [me]]],
                //whether one of the cols is being dregged
                position: [index, [{order:_},[embedding]], [me]],
                offset_from_ReorderableContainer: [offset, 
                    {type: "left", content: true, element: [embedding]},
                    {type: "left", element: [me]},
                ],
                previousCol: [
                    {position: [minus, [{position:_},[me]], 1]}, 
                    [ {children: {cols: _}}, [embedding]]
                ],
                nextCol: [
                    {position: [plus, [{position:_},[me]], 1]}, 
                    [ {children: {cols: _}}, [embedding]]
                ],
                imFirst: [
                    equal, [{position:_},[me]], 0
                ],
                imLast: [
                    equal, [{position:_},[me]], [minus, [size, [{order:_},[me]]], 1]
                ],
                //prevRight is the left border of embedding for the first cell
                //otherwise it is the right border of the previous element
                prevRight: [
                    cond,
                    [{imFirst:_},[me]],
                    o(
                        {
                            on: true,
                            use: {
                                element: [embedding],
                                type: "left"
                            }
                        },
                        {
                            on: null,
                            use: {
                                element: [{previousCol:_}, [me]],
                                label: "rightPoint"
                            }
                        }
                    )
                ],
                //nextLeft is the right border of embedding for the last cell
                //otherwise it is the left border of the next element
                nextLeft: [
                    cond,
                    [{imLast:_},[me]],
                    o(
                        {
                            on: true,
                            use: {
                                element: [embedding],
                                type: "right"
                            }
                        },
                        {
                            on: null,
                            use: {
                                element: [{nextCol:_}, [me]],
                                label: "leftPoint"
                            }
                        }
                    )
                ]
            },
        },
        {
            qualifier: { colBeingDragged: false },
            position: {
                rightFromPrevious: {
                    point1: {type: "right", element: [{previousCol:_}, [me]]},
                    point2: {type: "left", element: [me]},
                    equals:0
                },                 
            }
        },
        {
            qualifier: { colBeingDragged: false, imFirst: true },
            position: {
                firstCol: {
                    point1: {
                        type: "left",
                        element: [embedding]
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
            }
        },
        /*{
            qualifier: { colBeingDragged: false, imLast: true },
            position: {
                lastCol: {
                    point1: {
                        type: "right",
                        element: [embedding]
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0
                }
            }
        },  */      
        {
            qualifier: { colBeingDragged: true, imBeingDragged: true },
            position: {

                spacerLeftIsRightOfLeftEdge: {
                    point1: {
                        type: "left",
                        element: [embedding],
                    },
                    point2: {
                        element: [me],
                        label: "spacerLeft"
                    },
                    min: 0
                },

                spacerRightIsLeftOfRightEdge: {
                    point1: {
                        element: [me],
                        label: "spacerRight"
                    },
                    point2: {
                        type: "right",
                        element: [embedding],
                    },
                    min: 0
                },
                        
                spacerWidth: {
                    point1: { label: "spacerLeft" },
                    point2: { label: "spacerRight" },
                    equals: [{width:_},[me]]
                },                
                // here we define the imBeingDragged area's rightPoint to match that of its prev's 
                // and its leftPoint to match that of its next's, 
                // this allows prevRight/nextLeft to behave as if we're positioning an os 
                // that excludes the area imBeingDragged.
                myRightPoint: { 
                    point1: { label: "rightPoint" },
                    point2: [{ prevRight:_ }, [me]],                    
                    equals: 0
                },
                myLeftPoint: {
                    point1: { label: "leftPoint" },
                    point2: [{ nextLeft:_ }, [me]],                    
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
            }
        },
        {
            qualifier: { colBeingDragged: true, imBeingDragged: false },
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
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerRight"
                    },
                    point2: { type: "left" },
                    equals: 0,
                    orGroups: { label: "leftOr" },
                    priority: -10
                },                                    
                repelSpacerLeft: {
                    point1: {
                        element: [{ colBeingDragged:_ }, [me]],
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
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerLeft"
                    },
                    min: 0,
                    orGroups: { label: "repelSpacer" },
                    priority: -5
                },
                //first set of conditions (when spacer is to the right of current area)
                checkFlipLeft1: {
                    point1: { type: "left" },
                    point2: {
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerRight"
                    },
                    max:0,
                    orGroups: { label: "flipLeft" },
                    priority: -4
                },
                checkFlipLeft2: {
                    point1: { type: "right" },
                    point2: { 
                        //type: "horizontal-center", 
                        type: "left", 
                        element: [{ colBeingDragged:_ }, [me]],
                    },
                    min:0,
                    orGroups: { label: "flipLeft" },
                    priority: -4
                },
                checkFlipLeft3: {
                    point1: { 
                        type: "horizontal-center", 
                        element: [{ colBeingDragged:_ }, [me]],
                    },
                    point2: {
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerRight"
                    },
                    //max: [{width:_},[me]],
                    max: [mul, 0.5,
                          [plus, [{width:_},[me]],
                           [max, [{width:_},[me]],
                            [{width: _}, [{ colBeingDragged:_ },
                                          [me]]]]]],
                    orGroups: { label: "flipLeft" },
                    priority: -4
                },
                
                //second set of conditions (when spacer is to the left of current area)
                checkFlipRight1: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerLeft"
                    },
                    min:0,
                    orGroups: { label: "flipRight" },
                    priority: -4
                },
                checkFlipRight2: {
                    point1: { type: "left" },
                    point2: { 
                        //type: "horizontal-center", 
                        type: "right", 
                        element: [{ colBeingDragged:_ }, [me]],
                    },
                    max:0,
                    orGroups: { label: "flipRight" },
                    priority: -4
                },
                checkFlipRight3: {
                    point1: {
                        element: [{ colBeingDragged:_ }, [me]],
                        label: "spacerLeft"
                    },
                    point2: { 
                        type: "horizontal-center", 
                        element: [{ colBeingDragged:_ }, [me]],
                    },                    
                    //max: [{width:_},[me]],
                    max: [mul, 0.5,
                          [plus,
                           [{width:_},[me]],
                           [max, [{width:_},[me]],
                            [{width: _}, [{ colBeingDragged:_ },
                                          [me]]]]]],
                    orGroups: { label: "flipRight" },
                    priority: -4
                }
            }
        },
        {
            qualifier: { imBeingDragged: false },
            write: {
                onMouseDown: {
                    upon: [{type: "MouseDown"}, [myMessage]],
                    true: {
                        setBeingReordered: {
                            to: [
                                { colBeingDragged:_ },
                                [me]
                            ],
                            merge: true
                        },
                        setBeingDragged: {
                            to: [
                                { imBeingDragged: _ },
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
            qualifier: { imBeingDragged: true },
            write: {
                onMouseUp: {
                    upon: [{type: "MouseUp"}, [message]],
                    true: {
                        unsetBeingReordered: {
                            to: [{ colBeingDragged:_ }, [me]],
                            merge: false
                        },
                        unsetBeingDragged: {
                            to: [{ imBeingDragged:_ }, [me]],
                            merge: false
                        },
                        reorderAreas: {
                            to: [{ order: _}, [me]],
                            merge: [sort, [{order: _ }, [me]], {offset_from_ReorderableContainer:"ascending"}]
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DragTestApp: {
        context: {
            colsData: o(
                {color:"red", initPos:3, width: 27}, 
                {color:"green", initPos:5, width: 33}, 
                {color:"blue", initPos:4, width: 59}, 
                {color:"violet", initPos:9, width: 40}, 
                {color:"khaki", initPos:2, width: 52},
                {color:"orange", initPos:1, width: 77}
            )
        },
        children: {
            ReorderableContainer: {
                description: {
                    //"class": "ReorderableContainer",
                    context: {
                        "^order": [sort, [{children: { cols: _ }}, [me]], {initPos:"ascending"}],                        
                    },
                    children: {
                        cols: {   
                            data: [{colsData:_},[embedding]],
                            description: {
                                "class": "ReorderableColumn",
                                context: {
                                    color: [{ param: { areaSetContent: {color: _} } }, [me]],
                                    //initPos: [{ param: { areaSetContent: {initPos: _} } }, [me]],                                    
                                },
                                display: {
                                    background: [{ color: _ }, [me]],
                                    opacity: 0.8,
                                },
                                position: {
                                    top: 0,
                                    bottom: 0,
                                    width: [{ param: { areaSetContent: {width: _} } }, [me]],
                                }                                
                            },                            
                        }
                    },
                    display: {
                        borderColor: "black",
                        borderWidth: 1,
                        borderStyle: "solid"
                    },
                    position: {
                        left: 50,
                        top: 200,
                        width: [sum, [{width:_},[{colsData:_},[embedding]]]],                
                        height: 200,
                    },                    
                }
            },
            /*
            showSpacer: {
                description: {
                    //"class": "GeneralArea",
                    display: { background: "black" },
                    position: {
                        top: 150,
                        width: [{width:_},[{ colBeingDragged: _ }, [embedding]]],
                        height: 20,
                        leftWithSpacerLeft: {
                            point1: { type: "left" },
                            point2: {
                                element: [{ colBeingDragged: _ }, [embedding]],
                                label: "spacerLeft"
                            },
                            equals: 0
                        }
                    }
                }
            },
            showBoundariesLeft: {
                description: {
                    position: {
                        top: 100,
                        height: 20,
                        width: 10,
                        leftConstraint: {
                            point1: { type: "horizontal-center" },
                            point2: {
                                element: [{ colBeingDragged: _ }, [embedding]],
                                label: "leftPoint"
                            },
                            equals: 0
                        },
                    },
                    display: {
                        background: [{color: _}, [{ colBeingDragged: _ }, [embedding]]],
                        text: {value: "L"}
                    }                    
                }
            },
            showBoundariesRight: {
                description: {
                    position: {
                        top: 80,
                        height: 20,
                        width: 10,
                        rightConstraint: {
                            point1: { type: "horizontal-center" },
                            point2: {
                                element: [{ colBeingDragged: _ }, [embedding]],
                                label: "rightPoint"
                            },
                            equals: 0
                        },
                    },
                    display: {
                        background: [{color: _}, [{ colBeingDragged: _ }, [embedding]]],
                        text: {value: "R"}
                        
                    }                    
                }
            }
            */
        }
    },
};

var screenArea = {
    children: {
        app: {
            description: {
                "class": "DragTestApp",
                position: {
                    width:1000,
                    height:800,
                    left:50,
                },
            },            
        }
    }
};
