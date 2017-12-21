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
        position: {
            height:200,
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
            isRow: true
        },    
        position: {
            height:20,
            width:400,
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
}

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
	    /*
		column1: {
			description: {
    		    "class": "Column",    		    
				position: {
					left: {
						point1: {type:"left",element:[embedding]},
						point2: {type:"left",element:[me]},
						equals:100
					},
					top: {
						point1: {type:"top",element:[embedding]},
						point2: {type:"top",element:[me]},
						equals:0
					},
				},
				children: {
                    intSect1: {
                        partner: [{ isRow: true}, [allAreas]], //[{children: { row1: _ }}, [embedding]],
                        description: {
                            display: {
                                background: "white",
                                text: {
                                    value: [{price: _}, [referredOf]]
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
                                }
                            },
                            independentContentPosition: false
                        }
                    }
                },
			}
		},
		*/
		/*
		column2: {
			description: {
			    "class": "Column",
				position: {
					left: {
						point1: {type:"right",element: [{children: { column1: _ }}, [embedding]]},
						point2: {type:"left",element:[me]},
						equals:100
					},
					top: {
						point1: {type:"top",element:[embedding]},
						point2: {type:"top",element:[me]},
						equals:0
					},
				},
				children: {
                    intSect1: {
                        partner: [{ isRow: true}, [allAreas]], //[{children: { row1: _ }}, [embedding]],
                        description: {
                            display: {
                                background: "white",
                                text: {
                                    value: [{color: _}, [referredOf]]
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
                                }
                            },
                            independentContentPosition: false
                        }
                    }
                },		
			}
		},	
		*/
		table: {
		    description: {
                position: {
                    left: 0,
                    top: 0,
                    height: 500,
                    width: 500,
                    topOfFirstRow: {
                        point1: {type:"top",element:[embedding]},
                        point2: {type: "top", element: 
                          [first, [{children: { rows: _ }}, [me]]]},
                        equals: 50
                    },
                    leftOfFirstColumn: {
                        point1: {type:"left",element:[embedding]},
                        point2: {type: "left", element: 
                          [first, [{children: { columns: _ }}, [me]]]},
                        equals: 100
                    },
                },                
                children: {
                    rows: {		            
                        data: o( 
                            { name: "item1", price: 25, color:"red" }, 
                            { name: "item2", price:80, color:"yellow" }, 
                            { name: "item3", price:34, color:"green" }
                        ),
                        description: {
                            "class": "Row",
                            content: [{param: {areaSetContent: _}}, [me]],
                            position: {
                                topFromPrevious: {
                                    point1: {
                                        type: "bottom",
                                        element: [prev, [me]]
                                    },
                                    point2: {type: "top", element: [me]},
                                    equals: 20
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
                            "price","color"
                        ),
                        description: {
                            "class": "Column",    		
                            content: [[defun, "x", {"#x":_}], [{param: {areaSetContent: _}}, [me]]],
                            position: {
                                leftFromPrevious: {
                                    point1: {type:"right",element:[prev, [me]]},
                                    point2: {type:"left",element:[me]},
                                    equals:50
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
                                            }
                                        },
                                        independentContentPosition: false
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
