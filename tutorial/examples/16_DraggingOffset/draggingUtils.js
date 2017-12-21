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
    Draggable: o(
        {
            "class": o("Clickable"),
            context: {
                draggable: true,
                draggingPriority: 1,
                "^mouseDownX": 0,
                "^mouseDownY": 0
            }
        },
        { // variant-controller
            qualifier: "!",
            variant: {
                context: {
                    verticallyDraggable: true,
                    horizontallyDraggable: true,
                    stability: false
                }
            }
        },
        {
            qualifier: {
                selected: false,
                verticallyDraggable: true
            },
            variant: {
                write: {
                    onDraggableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            writeY: {
                                to: [{ mouseDownY: _ }, [me]],
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
            qualifier: {
                selected: false,
                horizontallyDraggable: true
            },
            variant: {
                write: {
                    onDraggableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            writeX: {
                                to: [{ mouseDownX: _ }, [me]],
                                merge: [offset,
                                    { type: "left" },
                                    { type: "left", element: [pointer] }]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                selected: true,
                verticallyDraggable: true
            },
            variant: {
                position: {
                    topDrag: {
                        point1: { type: "top" },
                        point2: { type: "top", element: [pointer] },
                        equals: [{ mouseDownY: _ }, [me]],
                        priority: [{ draggingPriority: _ }, [me]]
                    }
                }
            }
        },
        {
            qualifier: {
                selected: true,
                horizontallyDraggable: true
            },
            variant: {
                position: {
                    leftDrag: {
                        point1: { type: "left" },
                        point2: { type: "left", element: [pointer] },
                        equals: [{ mouseDownX: _ }, [me]],
                        priority: [{ draggingPriority: _ }, [me]]
                    }
                }
            }
        },
        {
            qualifier: { stability: true },
            position: {
                stableTop: {
                    point1: { type: "top", element: [embedding] },
                    point2: { type: "top", element: [me] },
                    stability: true,
                    priority: -1,
                },
                stableLeft: {
                    point1: { type: "left", element: [embedding] },
                    point2: { type: "left", element: [me] },
                    stability: true,
                    priority: -1,
                }
            }
        }
    ),
    Clickable: o(
        {
            context: {
                "^selected": false
            }
        },
        {
            qualifier: { selected: false },
            variant: {
                write: {
                    onClickableMouseDown: {
                        upon: [{ type: "MouseDown" }, [myMessage]],
                        true: {
                            selected: {
                                to: [{ selected: _ }, [me]],
                                merge: true
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { selected: true },
            variant: {
                write: {
                    onClickableMouseUp: {
                        upon: [{ type: "MouseUp" }, [message]],
                        true: {
                            selected: {
                                to: [{ selected: _ }, [me]],
                                merge: false
                            }
                        }
                    }
                }
            }
        }
    )
}