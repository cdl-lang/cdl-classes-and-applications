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
    Triangle: {
        context: {
            directions: o("left", "leftTop", "top", "rightTop", "right", "rightBottom", "bottom", "leftBottom"),
            "^current_index": 0,
            current_direction: [pos, [{ current_index:_ }, [me]], [{directions:_},[me]]]
        },
        display: {                  
            triangle: {
                baseSide: [{current_direction:_},[me]], //in: ["left", "right", "top", "bottom", "leftTop", "leftBottom", "rightTop", "rightBottom"]
                color: "blue",
                stroke: "black",
            },
        },
        position: {
            width:50,
            height:50
        },    
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    beginEdit: {
                        to: [{ current_index:_ }, [me]],
                        merge: [mod, [plus, [{ current_index:_ }, [me]], 1], [size, [{ directions:_ }, [me]]]]
                    }
                }
            }
        }
    },
    Arc: {
        context: {
            directions: o("left", "leftTop", "top", "rightTop", "right", "rightBottom", "bottom", "leftBottom"),
            "^current_index": 0,
            current_direction: [pos, [{ current_index:_ }, [me]], [{directions:_},[me]]]
        },
        display: {                  
            arc: {
                color: "red",
                x: 25, // defaults to center
                y: 25, // defaults to center
                start: 1/4, // default: 0
                //end: 3/4, // no default; excludes range
                range: 1/4, // no default; excludes end
                inset: 20, // default: 0
                radius: 25 // no default                
            },
        },
        position: {
            width:50,
            height:50
        },    
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    beginEdit: {
                        to: [{ current_index:_ }, [me]],
                        merge: [mod, [plus, [{ current_index:_ }, [me]], 1], [size, [{ directions:_ }, [me]]]]
                    }
                }
            }
        }        
    },
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
    }
};