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
    InputText: o(
    {
        qualifier: "!",
        variant: {
            context: {
                "^edit": false,
                "^mytext": "1",
                runningText: [{param: {input: {value: _}}}, [me]],                                
            },
            display: {
                text: {
                    value: [{mytext: _}, [me]]
                },
                //background: "#F4F9AD",
            },
            position: {
                top: 10,
                left: 10,
                height: 30,
                width: 100
            }
       }
    }, 
    {
        qualifier: {edit: false},
        variant: {
            display: {                
                //background: "red"
            },
            write: {
                onClick: {
                    upon: [{ subType: "Click" }, [myMessage]],
                    true: {
                        beginEdit: {
                            to: [{ edit:_ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    }, 
    {
        qualifier: {edit: true},
        variant: {
            display: {  
                background: "#DDDDDD",              
                text: {
                    input: {
                        type: "text",
                        placeholder: "text here",
                        init: {
                            selectionStart: 0,
                            selectionEnd: 10,
                            focus: true
                        }
                    }
                }
            },
            write: {
                onEnter: {
                    upon: [{type: "KeyDown", key: "Return"}, [myMessage]],
                    true: {
                        updateText: {
                            to: [{ mytext:_ }, [me]],
                            merge: [{runningText: _}, [me]]                            
                        },
                        endEdit: {
                            to: [{ edit:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    }
    ), 
    TypedText: o(
        {
            qualifier: "!",
            context: {
                "^edit": false,
                "*mytext": "1",
                runningText: [{param: {input: {value: _}}}, [me]],
                actualType: [cond, [equal, [{mytext: _}, [me]], true], 
                    o(
                        {on: true, use:"boolean"},
                        {on: false, use:
                            [cond, [equal, [{mytext: _}, [me]], false], 
                                o(
                                    {on: true, use:"boolean"},
                                    {on: false, use:
                                        [cond, [{mytext: _}, [me]], 
                                            o(
                                                {on:r(-Infinity,Infinity), use:"number"},                            
                                                {on:o("false",true), use:"boolean"},                            
                                                {on:s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/), use:"number"},
                                                {on:null, use:"string"}
                                            )
                                        ]
                                    }
                                )
                            ]
                        } 
                    )
                ],
                actualValue: [cond, [{mytext: _}, [me]], 
                    o(
                        {on:"false", use:false},
                        {on:true, use:true},
                        {   on:s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/), 
                            use:[stringToNumber, [{mytext: _}, [me]]]
                        },
                        {on:null, use:[{mytext: _}, [me]]}
                    )
                ],
            },
            display: {
                text: {
                    value: [{mytext: _}, [me]]
                },
            },
            position: {
                top: 10,
                //left: 10,
                height: 20,
                width: 50 
            },
        },
        {
            qualifier: {actualType: "boolean"},
            display: {
                background: "#999999"
            }
        },
        {
            qualifier: {actualType: "number"},
            display: {
                background: "#59E97B"
            }
        },
        {
            qualifier: {actualType: "string"},
            display: {
                background: "#59E0E9"
            }
        }                 
    ),
    TypedInputText: o(
        {
            "class": "InputText",
            qualifier: "!",
            context: {
                actualType: [cond, [{mytext: _}, [me]], 
                    o(
                        {on:o("false",true), use:"boolean"},
                        {on:s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/), use:"number"},
                        {on:null, use:"string"}
                    )
                ], 
                actualValue: [cond, [{mytext: _}, [me]], 
                    o(
                        {on:"false", use:false},
                        {on:true, use:true},
                        {   on:s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/), 
                            use:[stringToNumber, [{mytext: _}, [me]]]
                        },
                        {on:null, use:[{mytext: _}, [me]]}
                    )
                ],
            }        
        },
        {
            qualifier: {actualType: "boolean"},
            display: {
                background: "#999999"
            }
        },
        {
            qualifier: {actualType: "number"},
            display: {
                background: "#59E97B"
            }
        },
        {
            qualifier: {actualType: "string"},
            display: {
                background: "#59E0E9"
            }
        }        
    ),
    VerticalContainer: {
        "class": "VerticalDraggable",
        context: {
            setOfData: o(),
            dataCells: [{children: {dataCells: _}}, [me]],
            numberCells: [size, [{dataCells: _ }, [me]]],
            first_cell: [first, [{dataCells: _ }, [me]]],
            last_cell: [last, [{dataCells: _ }, [me]]],
            "^selectedCell": [{first_cell: _}, [me]], //o()
            selectedOperation: [{myText: _}, [{selectedCell: _}, [me]]],                                
        },
        position: {
            width:150,
            topOfFirstChild: {
                point1: {type: "top", element: [me]},
                point2: {type: "top", element: [{first_cell: _}, [me]]},
                equals: 10,
            },
            bottomOfLastChild: {                
                point1: {type: "bottom", element: [{last_cell: _}, [me]]},
                point2: {type: "bottom", element: [me]},
                equals: 10,
            },            
        },
        display: {
            background: "white",
        },
        children: {
            dataCells: {
			    data: [{setOfData: _}, [me]],
			    description: {
			        class: "Cell"
			    }
			},
		}        
    },
    OpList: {     
        "class": "Scrollable",   
        context: {            
            myOperations: o(),
            scrollingDoc: [{children: {operationContainer: _}}, [me]],
            selectedOperation: [{selectedOperation: _}, [{children: {operationContainer: _}}, [me]]],                                
        },
        position: {
            width:150,
            height:120,
            maxTopOfList: {
                point1: {type: "top", element: [me]},
                point2: {type: "top", element: [{scrollingDoc: _}, [me]]},
                max: 0,
                priority: 1
            },
            maxBottomOfList: {                
                point1: {type: "bottom", element: [{scrollingDoc: _}, [me]]},
                point2: {type: "bottom", element: [me]},                                
                max: 0,
                priority: 1
            },
        },
        display: {
            background: "white",
        },
        children: {
            operationContainer: {
			    description: {
			        class: "VerticalContainer",
			        context: {
			            setOfData: [{myOperations:_}, [embedding]],
			            draggingPriority: -1,
			        }
			    }
			},
		}
    },
    Scrollable: {
        context: {
            //need to define scrollingDoc in implemented class
            scrollingDoc: o(),
            barWidth: 10
        },
        children: {
            ScrollBar: {
                description: {
                    context: {
                        scrollingDoc: [{scrollingDoc: _}, [embedding]],
                        documentTotalHeight: [offset, 
                            {type: "top", element: [{scrollingDoc: _}, [embedding]]},
                            {type: "bottom", element: [{scrollingDoc: _}, [embedding]]}
                        ],
                        viewWindowHeight: [offset, 
                            {type: "top", element: [me]},
                            {type: "bottom", element: [me]},
                        ],
                        yRatio: [div,
                            [{viewWindowHeight:_}, [me]],
                            [{documentTotalHeight:_}, [me]],
                        ],
                        deltaYCursor: [offset,
                            {type:"top", element:[me]},
                            {type:"top",element:[{children: {cursor: _} },[me]]},                            
                        ]
        
                    },
                    position: {                        
                        topConstraint: {
                            point1: {type:"top", element:[me]},
                            point2: {type:"top", element:[embedding]},
                            equals: 0,
                            //priority: 5
                        },
                        offsetConstraint: {
                            pair1: {
                                point1: {type:"top", element:[{scrollingDoc: _}, [embedding]]},
                                point2: {type:"top", element:[me]},
                            },
                            pair2: {
                                point1: {type:"top", element:[me]},
                                point2: {type:"top", element:[{children:{cursor:_}},[me]]},
                            },
                            ratio: [{yRatio:_}, [me]]
                        },
                        //top: 0,
                        bottom: 0,   
                        right: 0,
                        width: [{barWidth: _}, [embedding]]         
                    },
                    display: {
                        background: "#EFBFBF",
                    },
                    children: {
                        cursor: {                
                            description: {
                                "class": "VerticalDraggable",
                                context: {
                                    myHeight: [mul,
                                        [{yRatio:_}, [embedding]],
                                        [{viewWindowHeight:_}, [embedding]],
                                    ],
                                    draggingPriority: -1,
                                },
                                position: {                                    
                                    //topCursor = (topBar-topDocument)*yRatio
                                    topConstraint: {
                                        point1: {type:"top", element:[embedding]},
                                        point2: {type:"top",element:[me]},
                                        equals: 0,
                                        priority: -10
                                    },                                             
                                    left:0,
                                    right:0,
                                    height: [{myHeight:_}, [me]],                        
                                },
                                display: {
                                    background: "#FF4D4D",
                                },
                            }
                        }
                    }
                }
            },
        }
    },
    Cell: o(
        {       
            "class": o("RadioToggable"), //,"VerticalDraggable"),         
            context: {
    			"^myText": [{ param: { areaSetContent: _}}, [me]],
    			draggingPriority: -1,
            },
            position: {
                height: 20,
                left: 0,
                right: 0,
                topFromPrevious: {
                    point1: {type: "bottom", element: [prev, [me]]},
                    point2: {type: "top", element: [me]},     
                    equals: 10,
                },                                          
            },
            display: {
                text: {
                    value: [{ myText: _ }, [me]]
                }
            }            
        },
        { 
            qualifier: { selected: true },
            variant: {
                display: {
                    background: "yellow"
                }
            }
        },
        { 
            qualifier: { selected: false },
            variant: {
                display: {
                    background: "#CCCCCC"
                }
            }
        }
    ),    
    RadioToggable: {
        context: {
            selected: [equal, [me], [{selectedCell: _ }, [embedding]]]
        },        
        write: {
            onClickableMouseDown: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    selection: {
                        to: [{selectedCell: _ }, [embedding]],
                        merge: [me],
                    }
                }
            }
        }        
    },    
    VerticalDraggable: o(
        {    
            "class": o("Clickable"),
            context: {
                "^offsetY": 0,
                draggingPriority: 1,                
            },
            position: {                                
                stableTop: {
                    //point1: {type:"right",element:[prev, [me]]},
                    point1: {type: "top", element: [embedding] },
                    point2: {type:"top",element:[me]},
                    stability: true,
                    priority: [minus, [{draggingPriority:_},[me]],1]
                    //stability constraint should always be lower than dragging priority
                },     
            }            
        },
        {
            qualifier: { clickedDown: false },
            variant: {
                write: {
                    onDraggableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            writeY: {
                                to: [{offsetY: _ }, [me]],
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
            qualifier: { clickedDown: true },
            variant: {
                position: {
                    topDrag: {
                        point1: { type: "top" },
                        point2: { type: "top", element: [pointer] },
                        equals: [{ offsetY: _ }, [me]],
                        priority: [{ draggingPriority: _ }, [me]]
                    }
                }
            }
        }
    ),
    Clickable: o(
        {
            context: {
                "^clickedDown": false
            }
        },
        {
            qualifier: { clickedDown: false },
            variant: {
                write: {
                    onClickableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            clicked: {
                                to: [{clickedDown: _ }, [me]],
                                merge: true
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { clickedDown: true },
            variant: {
                write: {
                    onClickableMouseUp: {
                        upon: [{ type: "MouseUp" }, [message]],
                        true: {
                            unclicked: {
                                to: [{clickedDown: _ }, [me]],
                                merge: false
                            },
                            continuePropagation: true
                        }
                    }
                }
            }
        }
    ),    
    
};

var screenArea = {
    display: {
        background: "#bbbbbb"
    },
    context: {
        operations: o(
            {
                opName: "ln",
                funcDef: [defun, o("x"), [ln, "x"]],
                minArgs: 1,
                maxArgs: 1,
            },
            {
                opName: "log10",
                funcDef: [defun, o("x"), [log10, "x"]],
                minArgs: 1,
                maxArgs: 1,
            },
            {
                opName: "not",
                funcDef: [defun, o("x"), [not, "x"]],
                minArgs: 1,
                maxArgs: 1,
            },
            {
                opName: "exp",
                funcDef: [defun, o("x"), [exp, "x"]],
                minArgs: 1,
                maxArgs: 1,
            },
            {
                opName: "plus",
                funcDef: [defun, o("x", "y"), [plus, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "minus",
                funcDef: [defun, o("x", "y"), [minus, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "mul",
                funcDef: [defun, o("x", "y"), [mul, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "div",
                funcDef: [defun, o("x", "y"), [div, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "pow",
                funcDef: [defun, o("x", "y"), [pow, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "mod",
                funcDef: [defun, o("x", "y"), [mod, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },  
            {
                opName: "remainder",
                funcDef: [defun, o("x", "y"), [remainder, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },            
            {
                opName: "logb",
                funcDef: [defun, o("x", "y"), [logb, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "lessThan",
                funcDef: [defun, o("x", "y"), [lessThan, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "lessThanOrEqual",
                funcDef: [defun, o("x", "y"), [lessThanOrEqual, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "equal",
                funcDef: [defun, o("x", "y"), [equal, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "notEqual",
                funcDef: [defun, o("x", "y"), [notEqual, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "greaterThanOrEqual",
                funcDef: [defun, o("x", "y"), [greaterThanOrEqual, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "greaterThan",
                funcDef: [defun, o("x", "y"), [greaterThan, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "offset",
                funcDef: [defun, o("x", "y"), [offset, "x", "y"]],
                minArgs: 2,
                maxArgs: 2,
            },
            {
                opName: "intersection",
                funcDef: [defun, o("x"), [intersection, "x"]],
                minArgs: 1,
                maxArgs: 1,
            },                                          
            {
                opName: "sum",
                funcDef: [defun, o("x","y","z"), [sum, "x","y","z"]],
                minArgs: 1,
                maxArgs: Infinity,
            },                                          
            {
                opName: "min",
                funcDef: [defun, o("x","y","z"), [min, "x","y","z"]],
                minArgs: 1,
                maxArgs: Infinity,
            },                                          
            {
                opName: "max",
                funcDef: [defun, o("x","y","z"), [max, "x","y","z"]],
                minArgs: 1,
                maxArgs: Infinity,
            },
            {
                opName: "and",
                funcDef: [defun, o("x", "y","Z"), [and, "x", "y","Z"]],
                minArgs: 2,
                maxArgs: Infinity,
            },         
            {
                opName: "or",
                funcDef: [defun, o("x", "y","Z"), [or, "x", "y","Z"]],
                minArgs: 2,
                maxArgs: Infinity,
            }
            
        )
        /*
            
            //
            lce
            map
            //
            filter
            first
            prev
            next
            last
            sort
            prevStar
            prevPlus
            nextStar
            nextPlus
            index
            concatStr
            subStr
            bool
            notEmpty
            empty
            //
            //me
            //embedded
            //embeddedStar
            //embedding
            //embeddingStar
            //expressionOf
            //referredOf
            //
            //"offset": [defun, o("x", "y"), [offset, "x", "y"]],
            //"coordinates": [defun, o("x", "y"), [coordinates, "x", "y"]],
        */
    },
    children: {
        OneArgOpArea: {
            description: {
                context: {
                    myOperations: [{maxArgs:1}, [{minArgs:1},[{operations: _}, [embedding]]]]
                },            
                position: {
                    top: 10,
                    left: 10,
                    rightConstraint: {
                        point1: {type: "right", element: [{children: {result: _}}, [me]]},
                        point2: {type: "right", element: [me]},                        
                        equals: 10
                    },     
                    bottomOfList: {
                        point1: {type: "bottom", element: [{children: {myOpList: _}}, [me]]}, //[{children: {result: _}}, [me]]}, //
                        point2: {type: "bottom", element: [me]},            
                        equals: 10
                    },         
                },
                display: {
                    background: "green"
                },
                children: {
                    first_input: {
                        description: {
                            "class": "TypedInputText",              
                        },
                    },
                    myOpList: {  
                        description: {
                            class: "OpList",
                            position: {
                                top: {
                                    point1: {type:"top",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:0
                                },
                                left: {
                                    point1: {type:"right",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                            context: {
                                //myOperations: o("plus","minus", "mul")
                                myOperations: [{myOperations: {opName: _}}, [embedding]]
                            },                                                  
                        },            
                    },
                    equals: {
                        description: {                
                            position: {
                                top: 10,
                                height: 30,
                                width: 30,
                                left: {
                                    point1: {type:"right",element:[{children: { myOpList: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                            display: {
                                text: {
                                    value: "="
                                },
                                background: "white",
                            },
                        }
                    },
                    result: {
                        description: {
                            "class": "TypedText",
                            context: {
                                //operation: [{children: { operator: {text: _}}}, [embedding]]
                                operation: [{children: {myOpList: {selectedOperation : _}}},[embedding]],
                                selectedFuncDef: [ 
                                    {funcDef: _}, 
                                        [{opName: [{operation:_}, [me]]}, 
                                            [{myOperations: _}, [embedding]]]
                                ],
                                "mytext": [[{selectedFuncDef:_},[me]],
                                        [{children: { first_input: {actualValue: _ }}}, [embedding]]]
                            },
                            position: {
                                top: 10,
                                height: 30,
                                width: 100,
                                left: {
                                    point1: {
                                        type:"right",
                                        element:[{children: { equals: _ }}, [embedding]]
                                    },
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                        }
                    },
                }
            }
        },       
        TwoArgsOpArea: {
            description: {
                context: {
                    myOperations: [{maxArgs:2}, [{minArgs:2},[{operations: _}, [embedding]]]]
                },            
                position: {
                    left: 10,
                    topConstraint: {
                        point1: {type: "bottom", element: [{children: {OneArgOpArea: _}}, [embedding]]},
                        point2: {type: "top", element: [me]},                        
                        equals: 10
                    },                    
                    rightConstraint: {
                        point1: {type: "right", element: [{children: {result: _}}, [me]]},
                        point2: {type: "right", element: [me]},                        
                        equals: 10
                    },     
                    bottomOfList: {
                        point1: {type: "bottom", element: [{children: {myOpList: _}}, [me]]}, //[{children: {result: _}}, [me]]}, //
                        point2: {type: "bottom", element: [me]},            
                        equals: 10
                    },           
                },
                display: {
                    background: "red"
                },
                children: {
                    first_input: {
                        description: {
                            "class": "TypedInputText",
                        },
                    },
                    second_input: {
                        description: {
                            "class": "TypedInputText",
                            position: {
                                top: {
                                    point1: {type:"bottom",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:10
                                },
                            },
                        }
                    },
                    myOpList: {  
                        description: {
                            class: "OpList",
                            position: {
                                top: {
                                    point1: {type:"top",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:0
                                },                            
                                left: {
                                    point1: {type:"right",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                            context: {
                                //myOperations: o("plus","minus", "mul")
                                myOperations: [{myOperations: {opName: _}}, [embedding]]
                            },                                                  
                        },            
                    },
                    equals: {
                        description: {                
                            position: {
                                top: 10,
                                height: 30,
                                width: 30,
                                left: {
                                    point1: {type:"right",element:[{children: { myOpList: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                            display: {
                                text: {
                                    value: "="
                                },
                                background: "white",
                            },
                        }
                    },
                    result: {
                        description: {
                            "class": "TypedText",
                            context: {
                                //operation: [{children: { operator: {text: _}}}, [embedding]]
                                operation: [{children: {myOpList: {selectedOperation : _}}},[embedding]],
                                selectedFuncDef: [ 
                                    {funcDef: _}, 
                                        [{opName: [{operation:_}, [me]]}, 
                                            [{myOperations: _}, [embedding]]]
                                ],
                                "mytext": [
                                        [{selectedFuncDef:_},[me]],
                                        [{children: { first_input: {actualValue: _ }}}, [embedding]], 
                                        [{children: { second_input: {actualValue: _ }}}, [embedding]] 
                                    ]
                            },
                            position: {
                                top: 10,
                                height: 30,
                                width: 100,
                                left: {
                                    point1: {
                                        type:"right",
                                        element:[{children: { equals: _ }}, [embedding]]
                                    },
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                        }
                    },
                }
            }
        },
        ThreeArgsOpArea: {
            description: {
                context: {
                    myOperations: [{maxArgs:r(3,Infinity)}, [{minArgs:r(1,Infinity)},[{operations: _}, [embedding]]]]
                    //myOperations: [{operations: _}, [embedding]]
                },            
                position: {
                    left: 10,
                    topConstraint: {
                        point1: {type: "bottom", element: [{children: {TwoArgsOpArea: _}}, [embedding]]},
                        point2: {type: "top", element: [me]},                        
                        equals: 10
                    },                                        
                    bottomOfList: {
                        point1: {type: "bottom", element: [{children: {myOpList: _}}, [me]]}, //[{children: {result: _}}, [me]]}, //
                        point2: {type: "bottom", element: [me]},            
                        equals: 10
                    }, 
                    rightConstraint: {
                        point1: {type: "right", element: [{children: {result: _}}, [me]]},
                        point2: {type: "right", element: [me]},                        
                        equals: 10
                    },     
                              
                },
                display: {
                    background: "blue"
                },
                children: {
                    first_input: {
                        description: {
                            "class": "TypedInputText",
                        },
                    },
                    second_input: {
                        description: {
                            "class": "TypedInputText",
                            position: {
                                top: {
                                    point1: {type:"bottom",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:10
                                },
                            },
                        }
                    },
                    third_input: {
                        description: {
                            "class": "TypedInputText",
                            position: {
                                top: {
                                    point1: {type:"bottom",element:[{children: { second_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:10
                                },
                            },
                        }
                    },
                    myOpList: {  
                        description: {
                            class: "OpList",
                            position: {
                                top: {
                                    point1: {type:"top",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"top",element:[me]},
                                    equals:0
                                },                                                        
                                left: {
                                    point1: {type:"right",element:[{children: { first_input: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                                
                            },
                            context: {
                                //myOperations: o("plus","minus", "mul")
                                myOperations: [{myOperations: {opName: _}}, [embedding]]
                            },                                                  
                        },            
                    },
                    equals: {
                        description: {                
                            position: {
                                top: 10,
                                height: 30,
                                width: 30,
                                left: {
                                    point1: {type:"right",element:[{children: { myOpList: _ }}, [embedding]]},
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                            display: {
                                text: {
                                    value: "="
                                },
                                background: "white",
                            },
                        }
                    },
                    result: {
                        description: {
                            "class": "TypedText",
                            context: {
                                //operation: [{children: { operator: {text: _}}}, [embedding]]
                                operation: [{children: {myOpList: {selectedOperation : _}}},[embedding]],
                                selectedFuncDef: [ 
                                    {funcDef: _}, 
                                        [{opName: [{operation:_}, [me]]}, 
                                            [{myOperations: _}, [embedding]]]
                                ],
                                "mytext": [
                                        [{selectedFuncDef:_},[me]],
                                        [{children: { first_input: {actualValue: _ }}}, [embedding]], 
                                        [{children: { second_input: {actualValue: _ }}}, [embedding]],
                                        [{children: { third_input: {actualValue: _ }}}, [embedding]]  
                                    ]
                            },
                            position: {
                                top: 10,
                                height: 30,
                                width: 100,
                                left: {
                                    point1: {
                                        type:"right",
                                        element:[{children: { equals: _ }}, [embedding]]
                                    },
                                    point2: {type:"left",element:[me]},
                                    equals:40
                                },
                            },
                        }
                    },
                }
            }
        },
    }
};