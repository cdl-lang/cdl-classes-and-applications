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
    Column: { 
        context: { 
            verticallyDraggable: false,
        },   		
        position: {
            height:300,
            width:80,
            top: {
                point1: {type:"top",element:[embedding]},
                point2: {type:"top",element:[me]},
                equals:0
            },
        },  
        stacking: {
            getMeUp: {
                higher: [me],
                lower: [{ isRow: true}, [allAreas]]
            }
        },      
        display: {
            background:"#157DEC",
        },
    },
    Row: {
        context: {
            isRow: true,
            horizontallyDraggable: false,
        },    
        position: {
            height:20,
            width:500,
            left: {
                point1: {type:"left",element:[embedding]},
                point2: {type:"left",element:[me]},
                equals:0
            },
        },
        display: {
            background:"#ED8515",
        }
    },
    Draggable: o(
        {    
            "class": o("Clickable"),
            context: {
                draggable: true,
                draggingPriority: 1,                
                "^mouseDownX": 0,
                "^mouseDownY": 0
            }
        },
        { // variant-controller
            qualifier: "!", 
            variant: {
                context: { 
                    verticallyDraggable: true,
                    horizontallyDraggable: true,
                }
            }
        },
        {
            qualifier: { selected: false,
                         verticallyDraggable: true },
            variant: {
                write: {
                    onDraggableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            writeY: {
                                to: [{mouseDownY: _ }, [me]],
                                merge: [offset,
                                        { type: "top" },
                                        { type: "top", element: [pointer] }]
                            }
                        }
                    }
                }
            }
        }, 
        {
            qualifier: { selected: false,
                         horizontallyDraggable: true },
            variant: {
                write: {
                    onDraggableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            writeX: {
                                to: [{mouseDownX: _ }, [me]],
                                merge: [offset,
                                        { type: "left" },
                                        { type: "left", element: [pointer] }]
                            }
                        }
                    }
                }
            }
        }, 
        {
            qualifier: { selected: true,
                         verticallyDraggable: true },
            variant: {
                position: {
                    topDrag: {
                        point1: { type: "top" },
                        point2: { type: "top", element: [pointer] },
                        equals: [{ mouseDownY: _ }, [me]],
                        priority: [{ draggingPriority: _ }, [me]]
                    }
                }
            }
        }, 
        {
            qualifier: { selected: true,
                         horizontallyDraggable: true },
            variant: {
                position: {
                    leftDrag: {
                        point1: { type: "left" },
                        point2: { type: "left", element: [pointer] },
                        equals: [{ mouseDownX: _ }, [me]],
                        priority: [{ draggingPriority: _ }, [me]]
                    }
                }
            }
        }
    ),    
    Clickable: o(
        {
            context: {
                "^selected": false
            }
        },
        {
            qualifier: { selected: false },
            variant: {
                write: {
                    onClickableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            selected: {
                                to: [{selected: _ }, [me]],
                                merge: true
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { selected: true },
            variant: {
                write: {
                    onClickableMouseUp: {
                        upon: [{ type: "MouseUp" }, [message]],
                        true: {
                            selected: {
                                to: [{selected: _ }, [me]],
                                merge: false
                            }
                        }
                    }
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
		table: {
		    description: {
                position: {
                    left: 0,
                    top: 0,
                    height: 400,
                    width: 600,
                    topOfFirstRow: {
                        point1: {type:"top",element:[embedding]},
                        point2: {type: "top", element: 
                          [first, [{children: { rows: _ }}, [me]]]},
                        equals: 50,
                        priority: -100
                    },
                    leftOfFirstColumn: {
                        point1: {type:"left",element:[embedding]},
                        point2: {type: "left", element: 
                          [first, [{children: { columns: _ }}, [me]]]},
                        equals: 100,
                        priority: -100
                    },
                    columnLeftBorder: {
                        point1: { label: "borderHorizontalLine" },
                        point2: { type: "left", element: [{children: { columns: _ }}, [me]]},
                        min: 0
                    },
                    rowHeaderRightBorder: {
                        point1: { label: "borderHorizontalLine" },
                        point2: { type: "right", element: [{children: {header:_}}, [{children: { rows: _ }}, [me]]]},
                        max: 0
                    },                   
                    rowTopBorder: {
                        point1: { label: "borderVerticalLine" },
                        point2: { type: "top", element: [{children: { rows: _ }}, [me]]},
                        min: 20
                    },
                    columnHeaderBottomBorder: {
                        point1: { label: "borderVerticalLine" },
                        point2: { type: "bottom", element: [{children: {header:_}}, [{children: { columns: _ }}, [me]]]},
                        max: 0
                    }                                                                                                                                                                                                                                 
                },                
                children: {
                    rows: {		            
                        data: o( 
                            { name: "item1", price: 25, size: 45, color:"red" }, 
                            { name: "item2", price:80, size: 8, color:"yellow" }, 
                            { name: "item3", price:34, size:98, color:"green" },
                            { name: "item4", price:12, size:23, color:"blue" }
                        ),
                        description: {
                            "class": o("Row", "Draggable"),
                            content: [{param: {areaSetContent: _}}, [me]],
                            position: {
                                topFromPrevious: {
                                    point1: {
                                        type: "bottom",
                                        element: [prev, [me]]
                                    },
                                    point2: {type: "top", element: [me]},
                                    equals: 20,
                                    priority: -100
                                },
                                stableTop: {
                                    //point1: {type:"right",element:[prev, [me]]},
                                    point1: {type: "top", element: [embedding] },
                                    point2: {type:"top",element:[me]},
                                    stability: true,
                                    priority: -60
                                }                                                                
                            }, 
                            display: {
                                //text: { value: [{param: {areaSetContent: _}}, [me]]}
                            },
                            children: {
                                header: {
                                    description: {
                                        position: {
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                            width: 80
                                        },
                                        display: {
                                            text: {
                                               value: [{name:_}, [{param: {areaSetContent: _}}, [embedding]]]
                                            }
                                        }, 
                                    }
                                }
                            }
                        },   		            
                    },
                    columns: {
                        data: o( 
                            //{ price: _ }, { color: _ }
                            "price","size","color"
                        ),
                        description: {
                            "class": o("Column", "Draggable"),
                            context: {
                                //verticallyDraggable: false
                                continuePropagation: false
                            },
                            content: [[defun, "x", {"#x":_}], [{param: {areaSetContent: _}}, [me]]],
                            position: {
                                leftFromPrevious: {
                                    point1: {type:"right",element:[prev, [me]]},
                                    point2: {type:"left",element:[me]},
                                    equals:50,
                                    priority: -100
                                },
                                stableLeft: {
                                    //point1: {type:"right",element:[prev, [me]]},
                                    point1: {type: "left", element: [embedding] },
                                    point2: {type:"left",element:[me]},
                                    stability: true,
                                    priority: -60
                                },            
                            },
                            children: {    
                                header: {
                                    description: {
                                        position: {
                                            height:20,
                                            top: 10,                                            
                                            left:0,
                                            right:0,
                                        },
                                        display: {
                                            //background:"blue",
                                            text: {
                                               value: [{param: {areaSetContent: _}}, [embedding]]
                                            }
                                        },    
                                    },                                    
                                },                            
                                intSect: {
                                    partner: [{ isRow: true}, [allAreas]],
                                    description: {
                                        display: {
                                            background: "white",
                                            text: {  
                                                //value: [{content: { price: _}}, [referredOf]]                                                
                                                //value: [{content: [{content: _}, [expressionOf]]}, [referredOf]]                                                                                          
                                                value: [[{content: _}, [expressionOf]], [ {content: _}, [referredOf] ]]                                                
                                            }
                                        },
                                        position: {
                                            leftConstraint: {
                                                point1: {
                                                    intersection: true,
                                                    type: "left"
                                                },
                                                point2: { type: "left" },
                                                equals: 0
                                            },
                                            rightConstraint: {
                                                point1: { type: "right" },
                                                point2: {
                                                    intersection: true,
                                                    type: "right"
                                                },
                                                equals: 0
                                            },
                                            topConstraint: {
                                                point1: {
                                                    intersection: true,
                                                    type: "top"
                                                },
                                                point2: { type: "top" },
                                                equals: 0
                                            },
                                            bottomConstraint: {
                                                point1: {
                                                    intersection: true,
                                                    type: "bottom"
                                                },
                                                point2: { type: "bottom" },
                                                equals: 0
                                            },
                                            leftContentConstraint: {
                                                point1: {
                                                    type: "left",
                                                    element: [expressionOf]
                                                },
                                                point2: { type: "left", content: true },
                                                equals: 0
                                            },
                                            rightContentConstraint: {
                                                point1: { 
                                                    type: "right",
                                                    element: [expressionOf]
                                                },
                                                point2: {
                                                    content: true,
                                                    type: "right"
                                                },
                                                equals: 0
                                            },
                                            topContentConstraint: {
                                                point1: {
                                                    content: true,
                                                    type: "top"
                                                },
                                                point2: { type: "top", element: [referredOf] },
                                                equals: 0
                                            },
                                            bottomContentConstraint: {
                                                point1: {
                                                    content: true,
                                                    type: "bottom"
                                                },
                                                point2: { type: "bottom", element: [referredOf] },
                                                equals: 0
                                            }
                                            
                                        },
                                        independentContentPosition: true 
                                        //default is false (for intersection areas might make sense to use it)
                                    }
                                }
                            },
                        }
                    },
		        }
            },
		}
	}
};
