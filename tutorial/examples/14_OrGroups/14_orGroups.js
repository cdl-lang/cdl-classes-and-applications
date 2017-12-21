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
		blockArea: {
		    description: {
		        display: {
	            	background:"#FFCC99",
            	},
                position: {
                    left: 10,
                    top: 10,
                    height: 300,
                    width: 400,
                    topOfFirstBlock: {
                        point1: {type:"top",element:[embedding]},
                        point2: {type: "top", element: 
                          [first, [{children: { blocks: _ }}, [me]]]},
                        equals: 40,
                    },
                },                
                children: {
                    blocks: {		            
                        data: o(1,2,3,4),
                        description: {
                            "class": o("Draggable"),
                            context: {
                                verticallyDraggable: false,
                            },
                            position: {
                                height: 20,
                                width: 50,
                                centered: {
                                    point1: {
                                        type: "horizontal-center",
                                        element: [me]
                                    },
                                    point2: {
                                        type: "horizontal-center", 
                                        element: [embedding]
                                    },
                                    equals: 0,
                                    priority:-100,
                                },
                                stableHorizontal: {
                                    point1: {
                                        type: "left",
                                        element: [me]
                                    },
                                    point2: {
                                        type: "left", 
                                        element: [embedding]
                                    },
                                    stability: true,
                                },
                                topFromPrevious: {
                                    point1: {
                                        type: "bottom",
                                        element: [prev, [me]]
                                    },
                                    point2: {type: "top", element: [me]},
                                    equals: 20,
                                },
                            }, 
                            display: {
                                background:"#FBFF6E",
                            },
                        },   		            
                    },
                    singleBlock: {
                        description: {
                            display: {
                                background:"#FF5A5A",
                            },
                            position: {
                                height: 30,
                                width: 80,                                                              
                                bottomOfBlocks: {                                
                                    point1: {
                                        type:"bottom",
                                        element:[last, [{children: {blocks: _}},[embedding]]]
                                    },
                                    point2: {type: "top", element:[me]},
                                    equals: 40,
                                },
                                leftOfBlocks: {                                
                                    point1: {type: "left", element:[me]},
                                    point2: {
                                        type:"left",
                                        element:[{children: {blocks: _}},[embedding]]
                                    },                                    
                                    min: 0,
                                },
                                rightOfAtLeastOneBlock: {                                
                                    point1: {type: "left", element:[me]},
                                    point2: {
                                        type:"left",
                                        element:[{children: {blocks: _}},[embedding]]
                                    },                                    
                                    max: 0,
                                    orGroups: {
                                        label: "max",
                                        element: [me]
                                    }
                                },                                
                                /*stableHorizontal: {
                                    point1: {
                                        type: "right",
                                        element: [me]
                                    },
                                    point2: {
                                        type: "right", 
                                        element: [embedding]
                                    },
                                    stability: true,
                                    priority: -100
                                },*/                                
                            },                    	
                        }
                    }
		        }
            },
		}
	}
};
