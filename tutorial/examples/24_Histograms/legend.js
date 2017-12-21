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

// %%include%%: "../18_BasicClasses/reference.js"

/*
Hierarchy:
    - Legend
        - LegendBoxLabel (set)
            - Box
            - Label
*/

var classes = {
    /*
    Legend Class
    */
    LegendContext: {
        context: {
            labeledColors: mustBeDefined,
            colorPopUpOrientation: mustBeDefined,
            getColorForLabel: [defun,
                "label",
                [
                    { color: _ },
                    [
                        { label: "label" },
                        [{ labeledColors: _ }, [me]]
                    ]
                ]
            ],
            fontFamily: '"Open Sans",Roboto,sans-serif',
            fontWeight: 300,
            size: 10,
            labelDistanceFromBox: 5,
            boxLabelGapDistance: 20,
            margin: 4
        }
    },

    Legend: {
        // wrap the children (default margin is 0)
        "class": o("LegendContext", "WrapChildren"),
        children: {
            legendBoxLabel: {
                data: [{ labeledColors: _ }, [me]],
                description: {
                    "class": "LegendBoxLabel",
                    context: {
                        labeledColor: [{ param: { areaSetContent: _ } }, [me]],
                        label: [{ label: _ }, [{ labeledColor: _ }, [me]]],
                        color: [{ color: _ }, [{ labeledColor: _ }, [me]]],
                        size: [{ size: _ }, [myContext, "Legend"]],
                        labelDistanceFromBox: [{ labelDistanceFromBox: _ }, [myContext, "Legend"]],
                        boxLabelGapDistance: [{ boxLabelGapDistance: _ }, [myContext, "Legend"]],
                        margin: [{ margin: _ }, [myContext, "Legend"]],
                    }
                }
            }
        }
    },

    LegendBoxLabel: {
        context: {
            label: mustBeDefined,
            color: mustBeDefined,
            size: mustBeDefined,
            labelDistanceFromBox: mustBeDefined,
            boxLabelGapDistance: mustBeDefined,
            margin: mustBeDefined
            /*leftPoint: [cond,
                [prev, [me]],
                o(
                    { on: true, use: { element: [prev, [me]], type: "right" } },
                    { on: false, use: { element: [embedding], type: "left" } }
                )
            ]*/
        },
        position: {
            leftPosition: {
                point1: { element: [prev, [me]], type: "right" },
                point2: { type: "left" },
                equals: [{ boxLabelGapDistance: _ }, [me]],
            },
            "vertical-center": 0,
        },
        children: {
            box: {
                description: {
                    "class": o("ColorChangeablePopup", "ColorChangeableContext"),
                    context: {
                        popUpOrientation: [{ colorPopUpOrientation: _ }, [myContext, "Legend"]],
                        selectedColor: [{ color: _ }, [embedding]],
                        margin: 5,
                        numberOfColorsPerRow: 8,
                        colorBoxSize: 10,
                        matrixSpacing: 4,
                        matrixWidth: [plus,
                            [mul, [{ numberOfColorsPerRow: _ }, [me]], [{ colorBoxSize: _ }, [me]]],
                            [mul, [minus, [{ numberOfColorsPerRow: _ }, [me]], 1], [{ matrixSpacing: _ }, [me]]]
                        ]
                    },
                    position: {
                        left: [{ margin: _ }, [embedding]],
                        "vertical-center": 0,
                        width: [{ size: _ }, [embedding]],
                        height: [{ size: _ }, [embedding]],
                        top: [{ margin: _ }, [embedding]], // imposing size on parent                        
                    },
                    display: {
                        borderWidth: 1,
                        borderStyle: "solid",
                        background: [{ selectedColor: _ }, [me]]
                    }
                }
            },
            label: {
                description: {
                    position: {
                        rightOfBox: {
                            point1: { element: [{ children: { box: _ } }, [embedding]], type: "right" },
                            point2: { type: "left" },
                            equals: [{ labelDistanceFromBox: _ }, [embedding]],
                        },
                        width: [displayWidth],
                        height: [displayHeight],
                        right: [{ margin: _ }, [embedding]],
                        "vertical-center": 0,
                    },
                    display: {
                        text: {
                            fontFamily: [{ fontFamily: _ }, [myContext, "Legend"]],
                            fontWeight: [{ fontWeight: _ }, [myContext, "Legend"]],
                            value: [{ label: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    }

}