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
// %%classfile%%: "matrixLayout.js"
// %%classfile%%: "draggable.js"
// %%classfile%%: "selectable.js"
// %%classfile%%: "wrap.js"

var classes = {
    SimpleSelectableItem: o(
        {
            "class": o("UniformMatrixItem", "Selectable"),

            context: {
                id: [{ param: { areaSetContent: _ } }, [me]],
                selectedIds: mustBeDefined, // must be writable
                minWidth: 50
            },

            "children.selectableBox.description": {
                position: {
                    "vertical-center": 0,
                    left: 4,
                    width: 15,
                    height: 15
                }
            },

            position: {
                height: 30,
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ minWidth: _ }, [me]],
                },

                maxWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: 80,
                },
            },

            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "blue",
                text: {
                    value: [{ id: _ }, [me]]
                }
            }
        },
        {
            qualifier: { isNotFirstInSubSequence: false },

            position: {
                left: 0
            }
        }
    ),

    SimpleMatrix: {
        "class": o("UniformMatrix", "WrapChildren"),

        context: {
            // UniformMatrix params
            matrixItems: [{ children: { matrixItems: _ } }, [me]],
            minMatrixSpacing: 3,
            maxMatrixSpacing: 3,
            orthogonalSpacing: 5,

            //firstElementId: [{ id: _ }, [first, [{ children: { matrixItems: _ } }, [me]]]],

            //Selectable params:
            "^selectedIds": o(), //o([{ firstElementId: _ }, [me]]),
            multipleChoice: [
                { multipleChoiceSelected: _ }, 
                [areaOfClass, "SingleMultipleChoiceSelector"]
            ],

            //WrapChildren params:
            wrapMargin: 5
        },

        display: {
            borderStyle: "solid",
            borderColor: "black",
            borderWidth: 1
        },

        position: {
            top: 50,
            left: 50,
            width: 400,
            /*bottomAlignWithLast: {
               point1: { element: [last, [{ children: { matrixItems: _ } }, [me]]], type: "bottom" },
               point2: { type: "bottom" },
               equals: 0,
            },*/
            firstItemAtTop: {
                point1: { type: "top" },
                point2: {
                    type: "top",
                    element: [first, [{ matrixItems: _ }, [me]]]
                },
                equals: 0
            }
        },

        children: {
            matrixItems: {
                data: [sequence, r(1, 10)],
                description: {
                    "class": "SimpleSelectableItem",
                    context: {
                        selectedIds: [{ selectedIds: _ }, [embedding]],
                        multipleChoice: [{ multipleChoice: _ }, [embedding]]
                    }
                }
            }
        }
    },

    SingleMultipleChoiceSelector: {
        "class": o("UniformMatrix", "WrapChildren"),
        context: {

            multipleChoiceSelected: ["MultiChoice", [{ selectedIds: _ }, [me]]],

            // UniformMatrix params
            matrixItems: [{ children: { matrixItems: _ } }, [me]],
            minMatrixSpacing: 3,
            maxMatrixSpacing: 3,
            orthogonalSpacing: 5,

            firstOptionId: [{ id: _ }, [first, [{ children: { matrixItems: _ } }, [me]]]],

            //Selectable params:
            "^selectedIds": o([{ firstOptionId: _ }, [me]]),
            multipleChoice: false,

            //WrapChildren params:
            wrapMargin: 5
                        
        },

        position: {
            top: 200,
            left: 50,
            width: 400,
            firstItemAtTop: {
                point1: { type: "top" },
                point2: {
                    type: "top",
                    element: [first, [{ matrixItems: _ }, [me]]]
                },
                equals: 0
            }
        },

        children: {
            matrixItems: {
                data: o("Radio","MultiChoice"),
                description: {
                    "class": "SimpleSelectableItem",
                    context: {
                        selectedIds: [{ selectedIds: _ }, [embedding]],
                        multipleChoice: [{ multipleChoice: _ }, [embedding]],
                        minWidth: 100
                    },
                }
            }
        }
    }
};

var screenArea = {

    "class": "ScreenArea",

    children: {
        matrix: {
            description: {
                "class": "SimpleMatrix"
            }
        },
        SingleMultipleChoiceSelector: {
            description: {
                "class": "SingleMultipleChoiceSelector"
            }
        }
    }

};
