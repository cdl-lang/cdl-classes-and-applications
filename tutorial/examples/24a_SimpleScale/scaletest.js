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

// %%classfile%%: "../../../../scripts/feg/test/generalClasses.js"

var classes = {
    ScaleCalc: {
        context: {
            exponent: [ceil, [log10, [{value: _}, [me]]]],
            fraction: [div, [{value: _}, [me]], [pow, 10, [{exponent: _}, [me]]]],
            normalizedFraction: [floor, [mul, [{fraction: _}, [me]], 100]],

            divisors: o(1, 5, 10, 20, 25, 50),
            steps: [ceil, [div, [{normalizedFraction: _}, [me]], [{divisors: _}, [me]]]],

            pixelsPerStep: [div, [{size: _}, [me]], [{steps: _}, [me]]],

            minNrPixelsPerStep: 20, // Require at least 20 pixels for major tickmark

            nrStepsWithTooFewPixels: [size, [Rco(0, [{minNrPixelsPerStep: _}, [me]]), [{pixelsPerStep: _}, [me]]]],

            firstAcceptableStep: [
                pos,
                [plus, [{nrStepsWithTooFewPixels: _}, [me]], 1],
                [{divisors: _}, [me]]
            ],

            /// The size of tickmarks
            tickMark: [
                mul,
                [
                    cond, [empty, [{firstAcceptableStep: _}, [me]]], o(
                        {on: true, use: 100},
                        {on: false, use: [{firstAcceptableStep: _}, [me]]}
                    )
                ],
                [
                    div,
                    [pow, 10, [{exponent: _}, [me]]],
                    100
                ]
            ],
            /// Maximum value for the scale
            maxScale: [
                mul,
                [ceil, [div, [{value: _}, [me]], [{tickMark: _}, [me]]]],
                [{tickMark: _}, [me]]
            ]
                
        }
    }
};

var screenArea = {
    "class": "ScaleCalc",
    context: {
        "^value": 23,
        "^size": 200
    },
    children: {
        value: {
            description: {
                "class": "LabeledTextValueInput",
                context: {
                    label: "value",
                    value: [{value: _}, [embedding]],
                    type: "number",
                    validFun: r(1e-20, Infinity),
                    editable: true
                },
                position: {
                    top: 10,
                    left: 10,
                    height: 20,
                    width: 150
                }
            }
        },
        size: {
            description: {
                "class": "LabeledTextValueInput",
                context: {
                    label: "size",
                    value: [{size: _}, [embedding]],
                    type: "number",
                    validFun: r(10, 1600),
                    editable: true
                },
                position: {
                    top: 40,
                    left: 10,
                    height: 20,
                    width: 150
                }
            }
        },
        maxScale: {
            description: {
                "class": "LabeledTextValue",
                context: {
                    label: "scale max",
                    value: [{maxScale: _}, [embedding]],
                    type: "number"
                },
                position: {
                    top: 10,
                    left: 200,
                    height: 20,
                    width: 250
                }
            }
        },
        debug1: {
            description: {
                "class": "LabeledTextValue",
                context: {
                    label: "tickmark",
                    value: [debugNodeToStr, [{tickMark: _}, [embedding]]],
                    type: "number"
                },
                position: {
                    top: 40,
                    left: 200,
                    height: 20,
                    width: 250
                }
            }
        }
    }
};