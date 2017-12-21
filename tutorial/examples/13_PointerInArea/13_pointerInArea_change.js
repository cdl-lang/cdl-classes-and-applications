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
        changingArea: {
            description: {
                "class":"MouseInArea",
                context: {
                    "^changeCounter": 0
                },
                position: {
                    top: 10,
                    left: 10,
                    width: 100,
                    height: 40
                },
                display: {
                    background: "#E6E6FA",
                    text: {
                        value: [{changeCounter:_},[me]]
                    }
                },
                write: {
                    onMouseOver: {
                        upon: [changed, [{mouseOnTop: _}, [me]]],
                        true: {
                            debug: {
                                to: [{changeCounter: _}, [me]],
                                merge:[plus, [{changeCounter: _}, [me]], 1]
                            }
                        }
                    }
                },
            }
        }
    }			
}