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
    MyData: o(
        {
            context: {
                isSelected: [{children: { toggleButton: { selected: _ }}},
                             [embedding]],
                querySource: [{children: { input: _ }}, [embedding]]
            }
        },
        {
            qualifier: { isSelected: true },
            variant: {
                context: {
                    selected_input: [{ text: _}, [{children: { input: _ }}, [embedding]]],
                }
            }
        },
        {
            qualifier: { isSelected: false },
            variant: {
                context: {
                    selected_input: [{ memorylessText: _}, [{children: { input: _ }}, [embedding]]],
                }
            }
        }
    ),
	SwitchInput:
	o(
		{
			qualifier: "!",
			variant: {
				context: {
					"^edit": false,
					"^text": "xxx",
				},
				display: {
					text: {
						value: [{text: _}, [me]]
					}
				}
			}
		},
		{
			qualifier: {edit: false},
			variant: {
				context: {
					current_text: [{text: _}, [me]],
					memorylessText: [{ text: _ }, [me]]
				},
				display: {
					background: "#bbbbbb",
				},
				write: {
					onClick: {
						upon: [{ subType: "Click" }, [myMessage]], true: {
								beginEdit: {
									to: [{ edit:_ }, [me]], merge: true
								}
						}
					}
				}
			}
		},
		{
			qualifier: {edit: true},
			variant: {
				context: {
					current_text: [{ param: { input: { value: _}}}, [me]],
					memorylessText: ""
				},
				display: {
					background: "#dddddd",
					text: {
						input: {
							type: "text",
							placeholder: "text here",
							init: {
								selectionStart: 0,
								selectionEnd: 3,
								focus: true
							}
						}
					}
				},
				write: {
					onEnter: {
						upon: [{type: "KeyDown", key: "Return"}, [myMessage]], true: {
							updateText: {
								to: [{ text:_ }, [me]],
								merge: [{param: {input: {value: _}}}, [me]]
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
	BaseCell: {
		context: {
			value: [{ param: { areaSetContent: _}}, [me]],
			selected: o([[{ innerQry:_},[embedding]], [{ value: _ }, [me]]])
		},
		position: {
			left: 3,
			right: 3,							
			height: 20,
			topFromPrevious: {
                point1: {
                    type: "bottom",
                    element: [prev, [me]]
                },
                point2: {
                    type: "top", element: [me]
                },
				equals: 10
			}
		},
		display: {
			background: "white",
			text: {
				value: [{ value: _ }, [me]]
			}
		}
	},
	Cell: o(
		{
			"class": "BaseCell",
		},
		{
			qualifier: { selected:true },
			variant: {
				display: {
					background: "yellow"
				}
			}
		}
	),
	ToggleButton: o(
        {
            context: {
                "^selected": false,
            },
            position: {
                width: 100,
                height: 20
            },
            display: {
                background: "white",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            }
        },
        {
            qualifier: {selected: false},
            variant: {
                display: {
                    text: { value: "memory off" }
                },
                write: {
                    onClick: {
                        upon: [{ subType: "Click" }, [myMessage]], true: {
                            select: {
                                to: [{ selected:_ }, [me]], 
                                merge: true
                            }
                        },            
                    },          
                }
            }
        },
        {
            qualifier: {selected: true},
            variant: {
                display: {
                    text: { value: "memory on" }
                },
                write: {
                    onClick: {
                        upon: [{ subType: "Click" }, [myMessage]], true: {
                            select: {
                                to: [{ selected:_ }, [me]], 
                                merge: false
                            }
                        },            
                    },          
                }
            }
        }
    ),
};

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
		input: {
			description: {
				"class": "SwitchInput",
				position: {
						top: 10,
						left: 50,
						height: 30,
						width: 100
				}
			}
		},			
		mydata: {
			description: {
				"class": "MyData",
				context: {
					current_text_input: [{ current_text: _}, [{children: { input: _ }}, [embedding]]],
					innerQry: s([{ current_text_input: _},[me]]),
				 	//memoryless_text_input: [{ memorylessText: _}, [{children: { input: _ }}, [embedding]]],				 	
				 	//selected_input: [{children: { toggleButton: { arg_outerQry: _ }}}, [embedding]],
					outerQry: s([{ selected_input: _}, [me]]),
					//outerQry: s([{ text_input: _}, [me]]),
					someInfo: o( 
							"house", "horse", "mouth", "castle", "mouse", "cat", "dog", "hat"
					),
				},
				position: {
					left: 50,
					top: 50,
					height: 250,
					width: 150,
					topOfFirstChild: {
						point1: {type: "top", element: [me]},
						point2: {type: "top", element:
							[first, [{children: { dataCells: _ }}, [me]]]},
						equals: 10
					}				
				},
				display: {
					background: "white",				
				},
				children: {
					dataCells: {						
						//data: [[{innerQry:_}, [me]],[{someInfo: _}, [me]]],
						//data: [[{outerQry:_},[me]],[{someInfo: _}, [me]]], //version 5.4
						data: [o([{outerQry:_},[me]],[{innerQry:_},[me]]),[{someInfo: _}, [me]]], //version 5.4
						//data: [{someInfo: _}, [me]], //version 5.4
						//data: [o([{outerQry:_}, [me]], [{innerQry:_}, [me]]),[{someInfo: _}, [me]]],
						description: {
							"class": "Cell"
						}
					},
				}
			}
		},
		toggleButton: {
			description: {
				"class": "ToggleButton",
				position: {
					underMyData: {
						point1: {
							type: "bottom",
							element: [{children: { mydata: _ }},[embedding]] 
						},
						point2: { type: "top" },
						equals: 5
					},
					rightAlignMyData: {
						point1: { 
							type: "right",
							element: [{children: { mydata: _ }},[embedding]] 
						},
						point2: { type: "right" },
						equals: 0
					}
				}
			}
		},
    }
};