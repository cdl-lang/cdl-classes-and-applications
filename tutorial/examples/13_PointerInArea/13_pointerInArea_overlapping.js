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
    "DisplayArea": {
        context: {
            label: ""
        },
        position: {                        
            width: 500,
        },
        display: {
            background:"#E6E6FA",
        },        
        children: {
            labelArea: {
                description: {
                    position: {
                        "horizontal-center": 0,
                        top: 10,                        
                        height: 40,
                        width: 450,
                    },
                    display: {
                        text: {
                            value: [{label:_},[embedding]]
                        }
                    }
                }
	        }
        }
    },        
    "MouseInArea": o(
        {
            context: {
                mouseOnTop: [{param: {pointerInArea: _}},[me]]
            },
            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"            }
        },
        {
            qualifier: { mouseOnTop: true },
            display: {
                borderColor: "red",
                borderWidth: 3,               
            }
        }
    )
}

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
	    firstExample: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Simple area with pointerInArea detection"
	            },
	            position: {	 
	                top: 10,
	                left: 10,       
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:50,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "area"
                                }
                            }
                        }
                    }	                
	            }
	        }
	    },
		secondExample: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas overlapping"
	            },
	            position: {	
	                left: 10,               
	                topConstraint: {
                        point1: {type: "bottom", element: [{children: {firstExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:50,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                }
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 70,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "second"
                                }
                            }                                                        
                        }
                    }	                
	            }
	        }
	    },	    
		secondExampleRight: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas overlapping with background (blocking)"
	            },
	            position: {	        
	                topConstraint: {
                        point1: {type: "top", element: [{children: {secondExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 0,
                    },
                    leftConstraint: {
                        point1: {type: "right", element: [{children: {secondExample: _}},[embedding]]},
                        point2: {type: "left", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:50,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                },
                                background: "green",
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 70,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "second"
                                },
                                background: "green",
                            }                                                        
                        }
                    }	                
	            }
	        }
	    },	    	    
	    thirdExample: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two embedded areas"
	            },
	            position: {	    
	                left: 10,           
	                topConstraint: {
                        point1: {type: "bottom", element: [{children: {secondExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 50,
                                    width: 120,
                                    height: 50,
                                    
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                }
                            },                            
                            children: {
                                secondArea: {
                                    description: {
                                        "class":"MouseInArea",
                                        position: {
                                                "horizontal-center": 0,
                                                top: 20,
                                                left:40,
                                                height: 20,
                                                width: 50
                                        },
                                        display: {
                                            text: {
                                                value: "second"
                                            }
                                        }                                                        
                                    }
                                }                        
                            }                            
                        }                                                
                    },                    	                
	            }
	        }
	    },
	    thirdExampleRight: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two embedded areas with background (blocking)"
	            },
	            position: {	    
	                topConstraint: {
                        point1: {type: "top", element: [{children: {thirdExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 0,
                    },
                    leftConstraint: {
                        point1: {type: "right", element: [{children: {thirdExample: _}},[embedding]]},
                        point2: {type: "left", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 50,
                                    width: 120,
                                    height: 50,
                                    
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                },
                                background: "green"                                
                            },                            
                            children: {
                                secondArea: {
                                    description: {
                                        "class":"MouseInArea",
                                        position: {
                                                "horizontal-center": 0,
                                                top: 20,
                                                left:40,
                                                height: 20,
                                                width: 50
                                        },
                                        display: {
                                            text: {
                                                value: "second"
                                            },
                                            background: "green"
                                        }                                                        
                                    }
                                }                        
                            }                            
                        }                                                
                    },                    	                
	            }
	        }
	    },
		forthExample: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas with intersection with propagatePointerInArea: expression (default)"
	            },
	            position: {	
	                left: 10,               
	                topConstraint: {
                        point1: {type: "bottom", element: [{children: {thirdExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:60,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                }
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 80,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "expressionOf"
                                }
                            },   
                            children: {
                                intersArea: {
                                    partner: [{children: {firstArea:_}}, [embedding]], //[embedding],//
                                    description: {
                                        "class":"MouseInArea",
                                        /*display: {
                                            background: "yellow"
                                        },*/
                                        propagatePointerInArea: "expression",// "referred" "expression"
                                        position: {
                                            leftConstraintInt: {
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
                                        stacking: {
                                            getMeUp: {
                                                higher: [me],
                                                lower: o([referredOf, [me]], [expressionOf, [me]])
                                            }
                                        },
                                        independentContentPosition: false
                                    },
                                }
                            }                                                     
                        }
                    }	                
	            }
	        }
	    },	    
	    forthExampleRight: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas with intersection with propagatePointerInArea: expression (default) with background (blocking)"
	            },
	            position: {	        
	                topConstraint: {
                        point1: {type: "top", element: [{children: {forthExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 0,
                    },
                    leftConstraint: {
                        point1: {type: "right", element: [{children: {forthExample: _}},[embedding]]},
                        point2: {type: "left", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:60,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                },
                                background:"green"
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 80,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "expressionOf"
                                },
                                background:"green"
                            },   
                            children: {
                                intersArea: {
                                    partner: [{children: {firstArea:_}}, [embedding]], //[embedding],//
                                    description: {
                                        "class":"MouseInArea",
                                        display: {
                                            background: "yellow",
                                            //opacity:.2,
                                        },
                                        propagatePointerInArea: "expression",// "referred" "expression"
                                        position: {                                        
                                            leftConstraintInt: {
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
                                        /*stacking: {
                                            getMeUp: {
                                                higher: [me],
                                                lower: o([referredOf, [me]], [expressionOf, [me]])
                                            }
                                        },*/
                                        independentContentPosition: false
                                    },
                                }
                            }                                                     
                        }
                    }	                
	            }
	        }
	    },	    
	    fifthExample: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas with intersection with propagatePointerInArea: referred"
	            },
	            position: {	    
	                left: 10,           
	                topConstraint: {
                        point1: {type: "bottom", element: [{children: {forthExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:60,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                }
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 80,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "expressionOf"
                                }
                            },   
                            children: {
                                intersArea: {
                                    partner: [{children: {firstArea:_}}, [embedding]], //[embedding],//
                                    description: {
                                        "class":"MouseInArea",
                                        /*display: {
                                            background: "yellow"
                                        },*/
                                        propagatePointerInArea: "referred",// "referred" "expression"
                                        position: {
                                            leftConstraintInt: {
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
                                        stacking: {
                                            getMeUp: {
                                                higher: [me],
                                                lower: o([referredOf, [me]], [expressionOf, [me]])
                                            }
                                        },
                                        independentContentPosition: false
                                    },
                                }
                            }                                                     
                        }
                    }	                
	            }
	        }
	    },	    
	    fifthExampleRight: {
	        description: {
	            "class": "DisplayArea",
	            context: {
	                label: "Two non-related areas with intersection with propagatePointerInArea: referred with background (blocking)"
	            },
	            position: {	    	                
	                topConstraint: {
                        point1: {type: "top", element: [{children: {fifthExample: _}},[embedding]]},
                        point2: {type: "top", element: [me]},
                        equals: 0,
                    },
                    leftConstraint: {
                        point1: {type: "right", element: [{children: {fifthExample: _}},[embedding]]},
                        point2: {type: "left", element: [me]},
                        equals: 10,
                    },
                    bottomConstraint: {
                        point1: {type: "bottom", element: [{children: {firstArea: _}},[me]]},
                        point2: {type: "bottom", element: [me]},
                        equals: 10,
                    }
	            },
	            children: {
	                //labelArea
                    firstArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top:60,
                                    height: 60,
                                    width: 40
                            },
                            display: {
                                text: {
                                    verticalAlign: "text-top",
                                    value: "first"
                                },
                                background: "green"
                            }                            
                        }
                    },
                    secondArea: {
                        description: {
                            "class":"MouseInArea",
                            position: {
                                    "horizontal-center": 0,
                                    top: 80,
                                    height: 30,
                                    width: 100
                            },
                            display: {
                                text: {
                                    value: "expressionOf"
                                },
                                background: "green"
                            },   
                            children: {
                                intersArea: {
                                    partner: [{children: {firstArea:_}}, [embedding]], //[embedding],//
                                    description: {
                                        "class":"MouseInArea",
                                        display: {
                                            background: "yellow"
                                        },
                                        propagatePointerInArea: "referred",// "referred" "expression"
                                        position: {
                                            leftConstraintInt: {
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
                                        stacking: {
                                            getMeUp: {
                                                higher: [me],
                                                lower: o([referredOf, [me]], [expressionOf, [me]])
                                            }
                                        },
                                        independentContentPosition: false
                                    },
                                }
                            }                                                     
                        }
                    }	                
	            }
	        }
	    },	    
	}			
}