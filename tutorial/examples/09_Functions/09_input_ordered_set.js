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
        qualifier: "!",
        variant: {
            "class": "TypedText"
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
    TypedInputOrderedSet: {
        context: {
            "^dataCells": o(1,1),
            boxes: [{children: { dataCells: _ }}, [me]],
            orderedSetValues: [{actualValue: _}, [{boxes: _}, [me]]],
            first_cell: [first, [{boxes: _ }, [me]]],
            last_cell: [last, [{boxes: _ }, [me]]],
            plus_button: [{children: { PlusInputButton: _ }}, [me]],            
            minus_button: [{children: { MinusInputButton: _ }}, [me]],            
            //lastIndex: [minus, [size, [{children: { dataCells: _ }}, [me]]], 2], //[minus, [size, [{children: { dataCells: _ }}, [me]], 1]],
            //"^selectedCell": [{first_cell: _}, [me]], //o()
        },
        position: {
            top: 10,
            left: 10,
            leftOfFirstChild: {
                point1: {type: "left", element: [me]},
                point2: {type: "left", element: [{first_cell: _}, [me]]},
                equals: 10
            },
            rightConstraint: {
                point1: {type: "right", element: [{minus_button: _}, [me]]},
                point2: {type: "right", element: [me]},            
                equals: 10
            },
            bottomConstraint: {
                point1: {type: "bottom", element: [{first_cell: _}, [me]]},
                point2: {type: "bottom", element: [me]},            
                equals: 10
            },
        },
        display: {
            background: "yellow",
            text: {
                //value: [{orderedSetValues:_},[me]]
            }
        },
        children: {
			dataCells: {
			    data: [{dataCells: _}, [me]],
			    description: {
			        class: "TypedInputText",
			        context: {
			            //"^mytext": [{ param: { areaSetContent: _}}, [me]],
			        },
                    position: {
                        rightFromPrevious: {
                            point1: {type: "right", element: [prev, [me]]},
                            point2: {type: "left", element: [me]},     
                            equals: 5
                        }                                       
                    }			        
			    }
			},
            PlusInputButton: {
                description: {
                    position: {
                        top: 10,
                        height: 20,
                        width: 20,
                        left: {
                            point1: {type: "right", element: [{last_cell: _}, [embedding]]},
                            point2: {type: "left", element: [me]},                            
                            equals: 10                        
                        }                
                    },
                    display: {
                        text: { value: "+" },
                        background: "orange",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "black"
                    },
                    write: {
                        onClick: {
                            upon: [{ subType: "Click" }, [myMessage]], true: {
                                select: {
                                    to: [{ dataCells:_ }, [embedding]], 
                                    merge: o([{ dataCells:_ }, [embedding]],1)
                                }
                            },            
                        },          
                    }                
                }
            },
            MinusInputButton: {
                description: {
                    position: {
                        top: 10,
                        height: 20,
                        width: 20,
                        left: {
                            point1: {type: "right", element: [{plus_button: _}, [embedding]]},
                            point2: {type: "left", element: [me]},                            
                            equals: 5                        
                        }                
                    },
                    display: {
                        text: { value: "-" },
                        background: "orange",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "black"
                    },
                    write: {
                        onClick: {
                            upon: [{ subType: "Click" }, [myMessage]], true: {
                                select: {
                                    to: [{ dataCells:_ }, [embedding]], 
                                    merge: 
                                        [pos, Rcc(0, -2), 
                                            [{ dataCells:_ }, [embedding]]],
                                }
                            },            
                        },          
                    }                
                }
            },

		}
	},	
};

var screenArea = {
    display: {
        background: "#bbbbbb"
    },
    children: {
        MyOrderedSet: {
            description: {
                class: "TypedInputOrderedSet",
                context: {
                    "^orderedSet": o("3","4","5","6")
                },
            }
        }
    }
};