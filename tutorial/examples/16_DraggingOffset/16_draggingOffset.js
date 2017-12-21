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

// %%classfile%%: "draggingUtils.js"

var screenArea = {
    display: {
        background: "#bbbbbb",
    },
    children: {
        box: {
            description: {
                "class": o("Draggable"),
                context: {
                    horizontallyDraggable: true,
                    verticallyDraggable: false,
                    "^color": "red"
                },
                position: {
                    top: 100,
                    left: 100,
                    width: 100,
                    height: 100                    
                },
                display: {
                    background: [{color: _},[me]]
                },
                write: {
                    whenDraggedRightOfLine: {
                        upon: [greaterThan,
                            [offset,
                                {
                                    element: [{children: { line: _ }}, [embedding]],
                                    type: "horizontal-center"
                                },
                                {
                                    // element: [me] 
                                    type: "horizontal-center"
                                }
                            ],
                            0
                        ],
                        true: {
                            changeColor: {
                                to: [{ color: _ }, [me]],
                                merge: "yellow"
                            }
                        },
                        "false": {
                            changeColor: {
                                to: [{ color: _ }, [me]],
                                merge: "red"
                            }
                        }    
                    },
                }
            }
        },
        line: {
            description: {
                position: {
                    top: 0,
                    bottom: 0,
                    left: 500,
                    width: 2,                    
                },
                display: {
                    background: "black"
                },
            }
        }        
        
    }
}
