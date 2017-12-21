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
               "^mytext": "input",
               "^edit": false
            },
            display: {                  
                text: {
                    value: [{mytext: _}, [me]]
                },
            },
            position: {
                width:100,
                height:20
            },
        }
    }, 
    {
        qualifier: {edit: false},
        variant: {
            context: {
                runningText: [{mytext: _}, [me]]
            },
            display: {                
                background: "#ABDBEF",
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
            context: {
               runningText: [{param: {input: {value: _}}}, [me]],
            },        
            display: {  
                background: "#DDDDDD",              
                padding: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                text: {
                    fontSize: 16,
                    fontFamily: "Times",
                    input: {
                        type: "text",
                        placeholder: "text here",                        
                        init: {
                            selectionStart: 0,
                            selectionEnd: 10,
                            focus: true
                        }
                    },
                },
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
    AdjustableInput: {
        "class": "InputText",
        position: {
           //width: [displayWidth, { display: {text: { value: "alternate text", input: o()  }}}],
           //width: [displayWidth, [{mytext: _}, [me]]],           
           //width: [displayWidth, { width: 50 } ],           
           width: [displayWidth, { display: {text: { value: [{runningText: _}, [me]], input: o() } } }],
           //width: 200,
           //height: [displayHeight, [{runningText: _}, [me]]],
           //height: 20
        }
    }
};

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
		input: {
			description: {
				"class": "AdjustableInput",
				position: {
                    top: 10,
                    left: 10,
				}
			}
		},			
    }
};