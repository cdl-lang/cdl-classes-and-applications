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


// %%classfile%%: "screenArea.js"
// %%classfile%%: "draggable.js"

var classes = {

    WrapSelected: o(
        {
            "class": o("DragWrapper"),
            context: {
                // wrap the draggables which are cells matching the required
                // criterion.
                wrappedDraggable: [[{ selectionQuery: _ }, [me]],
                                   [areaOfClass, "Cell"]]
            },
            position: {
                // minimal possible height (not too strong)
                minPossibleHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    max: 0,
                    priority: [{ verticalWrappingPriority: _ }, [me]]
                },
                // minimal possible width (not too strong)
                minPossibleWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: 0,
                    priority: [{ horizontalWrappingPriority: _ }, [me]]
                },

                // margins from the wrapped draggable

                leftMargin: {
                    point1: { type: "left", content: true },
                    point2: { type: "left",
                              element: [{ wrappedDraggable: _ }, [me]] },
                    min: 5
                },

                rightMargin: {
                    point1: { type: "right",
                              element: [{ wrappedDraggable: _ }, [me]] },
                    point2: { type: "right", content: true },
                    min: 5
                },

                topMargin: {
                    point1: { type: "top", content: true },
                    point2: { type: "top",
                              element: [{ wrappedDraggable: _ }, [me]] },
                    min: 5
                },

                bottomMargin: {
                    point1: { type: "bottom",
                              element: [{ wrappedDraggable: _ }, [me]] },
                    point2: { type: "bottom", content: true },
                    min: 5
                }
            }
        }
    ),
    
    Row: o(
        {
            "class": o("DragWrapper", "DraggableEdgeTop"),
            context: {
                initialVerticalSpacing: 15,
            },
            position: {
                left: 5,
                right: 5,
                // minimal possible height (not too strong)
                minPossibleHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    max: 0,
                    priority: [{ verticalWrappingPriority: _ }, [me]]
                }
            },
            children: {
                cells: {
                    data: o(1,2,3,4),
                    description: {
                        "class": "Cell",
                        position: {
                            belowTopOfRow: {
                                point1: { type: "top", element: [embedding] },
                                point2: { type: "top" },
                                min: 5
                            },
                            aboveBottomOfRow: {
                                point1: { type: "bottom" },
                                point2: { type: "bottom", element: [embedding] },
                                min: 5
                            },
                        }
                    }
                }
            }
        }
    ),

    Cell: o(
        {
            "class": o("DraggableEdgeLeft", "DraggableEdgeRight",
                       "DraggableEdgeTop",
                       "DraggableEdgeBottom", "DraggableCornerBottomRight"),
            context: {
                // rightToLeft: true,
                initialWidth: 100,
                initialHeight: 50,
                verticalSpacingFromEmbedding: true,
                initialVerticalSpacing: 10,
                initialHorizontalSpacing: 20
            },
            display: {
                background: "#d0d0d0",
                text: {
                    value: [{ param: { areaSetContent: _ }}, [me]]
                }
            },
            content: [{ param: { areaSetContent: _ }}, [me]]
        }
    )
};

var screenArea = {
    "class": "ScreenArea",
    children: {
        extendable: {
            data: o(1,2,3),
            description: {
                "class": "Row",
                display: {
                    borderStyle: "solid",
                    borderWidth: 2,
                    borderColor: "black"
                }
            }
        },
        selectTwo: {
            description: {
                class: "WrapSelected",
                context: {
                    selectionQuery: { content: 2 }
                },
                display: {
                    borderStyle: "solid",
                    borderWidth: 4,
                    borderColor: "red"
                }
            }
        },
        selectThree: {
            description: {
                class: "WrapSelected",
                context: {
                    selectionQuery: { content: 3 }
                },
                display: {
                    borderStyle: "solid",
                    borderWidth: 4,
                    borderColor: "green"
                }
            }
        }
    }
};
