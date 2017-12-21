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

var classes = {
    SimpleItem: o(
        {
            "class": "UniformMatrixItem",

            position: {
                height: 30,
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: 50,
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
                    value: [{ param: { areaSetContent: _ }}, [me]]
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

    SimpleMatrix: o(
        {
            "class": o("DraggableEdgeRight","UniformMatrix"),

            context: {
                initialWidth: 400,
                matrixItems: [{ children: { matrixItems: _ }}, [me]],
                minMatrixSpacing: 3,
                maxMatrixSpacing: 3,
                orthogonalSpacing: 5
            },

            display: {
                borderStyle: "solid",
                borderColor: "black",
                borderWidth: 2
            },

            position: {
                top: 10,
                bottom: 10,
                left: 10,
                firstItemAtTop: {
                    point1: { type: "top" },
                    point2: { type: "top",
                              element: [first, [{ matrixItems: _ }, [me]]] },
                    equals: 0
                }
            },
            
            children: {
                matrixItems: {
                    data: [sequence, r(0,100)],
                    description: {
                        "class": "SimpleItem"
                    }
                }
            }
        }
    )
};

var screenArea = {

    "class": "ScreenArea",
    
    children: {
        matrix: { description: {
            "class": "SimpleMatrix"
        }}
    }
    
};
