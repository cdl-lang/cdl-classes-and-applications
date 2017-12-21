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
    RotateOnClick: {
        context: {
            "^rotation": 0,
            step: 10,
        },
        display: {
            transform: {
                rotate: [{rotation: _},[me]]
            }
        },
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    beginEdit: {
                        to: [{ rotation:_ }, [me]],
                        merge: [plus, [{ rotation:_ }, [me]], [{ step:_ }, [me]]]
                    }
                }
            }
        }
    },
    Triangle: {
        "class":"RotateOnClick",
        display: {                  
            triangle: {
                //o("left", "leftTop", "top", "rightTop", "right", "rightBottom", "bottom", "leftBottom"),
                baseSide: "left",
                color: "blue",
                stroke: "black",
            },
        },
        position: {
            width:50,
            height:50
        },    
        
    },
    Arc: {
        "class":"RotateOnClick",
        display: {                  
            arc: {
                color: "red",
                x: 25, // defaults to center
                y: 25, // defaults to center
                start: 1/4, // default: 0
                //end: 3/4, // no default; excludes range
                range: 1/4, // no default; excludes end
                inset: 15, // default: 0
                radius: 25 // no default                
            },
        },
        position: {
            width:50,
            height:50
        },    
    },
    ResetButton: {
        display: {
            text: {
                value: "Reset"
            },
            background: "#dddddd"
        },
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    resetTriangle: {
                        to: [{ rotation:_ }, [areaOfClass, "Triangle"]],
                        merge: 0
                    },
                    resetArc: {
                        to: [{ rotation:_ }, [areaOfClass, "Arc"]],
                        merge: 0
                    }
                }
            }
        },
        position: {
            width:50,
            height:20
        },    
    }
}

var screenArea = {
	display: {
		background:"#bbbbbb",
	},
	children: {
		triangle: {
			description: {
				"class": "Triangle",
				position: {
                    top: 10,
                    left: 10,
				}
			}
		},
		arc: {
			description: {
				"class": "Arc",
				position: {
                    top: 60,
                    left: 10,
				}
			}
		},
		reset: {
			description: {
				"class": "ResetButton",
				position: {
                    top: 140,
                    left: 10,
				}
			}
		},			
    }
};