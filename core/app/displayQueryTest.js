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
    WidthDisplay: {
        context: {
            width: [{children: { textInput: { width: _ } } }, [embedding]]
        },
        display: {
            text: {
                value: [concatStr, o("Width: ", [{width:_}, [me]])]
            }
        },
        position: {
            height: 50
        }
    },
    HeightDisplay: {
        context: {
            height: [{children: { textInput: { height: _ } } }, [embedding]]
        },
        display: {
            text: {
                value: [concatStr, o("Height: ", [{height:_}, [me]])]
            }
        },
        position: {
            height: 50
        }
    },

    TextInput: o(
        {
            "class": superclass,
            context: {
                isFixedWidth: [
                    {children: { widthControl: { isFixedWidth:_}}},
                    [embedding]
                ],
                fixedWidth: [
                    {children: { widthControl: { fixedWidth:_}}},
                    [embedding]
                ]
            },
            display: {
                borderWidth: 2,
                borderStyle: "solid"
            }
        },
        {
            qualifier: { isFixedWidth: true },
            context: {
                width: [
                    displayWidth,
                    { width: [{fixedWidth:_}, [me]] }
                ],
                height: [
                    displayHeight,
                    { width: [{fixedWidth:_}, [me]] }
                ]
            }
        },
        {
            qualifier: { isFixedWidth: false },
            context: {
                width: [displayWidth],
                height: [displayHeight]
            }
        }
    ),

    WidthControl: o(
        {
            context: {
                "^isFixedWidth": false,
                "^fixedWidth": 40
            },
            children: {
                isFixedWithText: {
                    description: {
                        position: {
                            left: 0,
                            width: [displayWidth],
                            top: 0,
                            bottom: 0
                        },
                        display: {
                            text: {
                                value: "Use Fixed Width:"
                            }
                        }
                    }
                },
                isFixedWidthValue: {
                    description: {
                        position: {
                            leftC: {
                                point1: {
                                    element: [
                                        { children: {isFixedWithText:_ }},
                                        [embedding]
                                    ],
                                    type: "right"
                                },
                                point2: {
                                    type: "left"
                                },
                                equals: 20
                            },
                            width: [displayWidth],
                            height: [displayHeight],
                            "vertical-center": 0
                        },
                        display: {
                            image: {
                                src: [
                                    cond,
                                    [{isFixedWidth:_}, [embedding]],
                                    o(
                                        {
                                            on: true,
                                            use: "%%image:(msInclusion.png)%%"
                                        },
                                        {
                                            on: false,
                                            use: "%%image:(msExclusion.png)%%"
                                        }
                                    )
                                ]
                            }
                        },
                        write: {
                            toggle: {
                                "class": "OnMouseClick",
                                true: {
                                    "tv": {
                                        to: [{isFixedWidth:_}, [embedding]],
                                        merge: [
                                            not,
                                            [{isFixedWidth:_}, [embedding]]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { isFixedWidth: true },
            children: {
                fixedWidth: {
                    description: {
                        context: {
                            fixedWidth: [{fixedWidth:_}, [embedding]]
                        },
                        position: {
                            leftC: {
                                point1: {
                                    element: [
                                        { children: {isFixedWidthValue:_ }},
                                        [embedding]
                                    ],
                                    type: "right"
                                },
                                point2: {
                                    type: "left"
                                },
                                equals: 20
                            },
                            width: 45,
                            height: [displayHeight],
                            "vertical-center": 0
                        },
                        display: {
                            text: {
                                value: [{ fixedWidth:_}, [me]],
                                textAlign: "left",
                                input: {
                                    type: "number"
                                }
                            }
                        },
                        write: {
                            updateValue: {
                                upon: [{ type: "InputChange"}, [myMessage]],
                                true: {
                                    updateValue: {
                                        to: [{ fixedWidth:_}, [me]],
                                        merge: [
                                            { param: { input: { value: _ } } },
                                            [me]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    )
};

var screenArea = {
    display: {
        background: "lightGreen"
    },
    children: {
        widthDisplay: {
            description: {
                "class": "WidthDisplay",
                position: {
                    top: 20,
                    left: 20,
                    width: 100
                }
            }
        },
        heightDisplay: {
            description: {
                "class": "HeightDisplay",
                position: {
                    top: 20,
                    left: 140,
                    width: 100
                }
            }

        },
        textInput: {
            description: {
                context: {
                    "^displayText": "Hellllo"
                },
                "class": "TextInput",
                position: {
                    topC: {
                        point1: {
                            type: "bottom",
                            element: [
                                {children: { widthDisplay: _ } },
                                [embedding]
                            ]
                        },
                        point2: {
                            type: "top"
                        },
                        equals: 20
                    },
                    "content-width": [{width:_}, [me]],
                    "content-height": [{height:_}, [me]],
                    left: 20
                }
            }
        },
        widthControl: {
            description: {
                position: {
                    topC: {
                        point1: {
                            type: "bottom",
                            element: [
                                {children: { textInput: _ } },
                                [embedding]
                            ]
                        },
                        point2: {
                            type: "top"
                        },
                        equals: 20
                    },
                    left: 20,
                    right: 0,
                    height: 50
                },
                "class": "WidthControl"
            }
        }
    }
};
