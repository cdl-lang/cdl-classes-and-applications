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



    LabeledValue: {
        context: {
            // to define: topReferencePoint, textContent, valueContent, valueIsMonetary
            valueIsMonetary: true,
            // constants:
            fontSize: 15,
            labelWidth: 200,
            valueWidth: 200,
            height: 18,            
        },
        position: {
            topConstraint: {
                point1: [{ topReferencePoint: _ }, [me]],
                point2: {type: "top"},
                equals: 5
            },
            "horizontal-center": 0,
            width: [sum, o([{ labelWidth: _ }, [me]], [{ valueWidth: _ }, [me]])],
            height: [{ height: _ }, [me]]
        },
        children: {
            label: {
                description: {
                    position: {
                        top: 0,
                        left: 0,
                        width: [{ labelWidth: _ }, [embedding]],
                        height: [{ height: _ }, [embedding]],
                    },
                    display: {
                        text: {
                            textAlign: "left",
                            fontSize: [{ fontSize: _ }, [embedding]],
                            value: [{ textContent: _ }, [embedding]]
                        }
                    }
                }
            },
            value: {
                description: {
                    context: {
                        valueIsMonetary: [{ valueIsMonetary: _ }, [embedding]]
                    },
                    position: {
                        top: 0,
                        right: 0,
                        width: [{ valueWidth: _ }, [embedding]],
                        height: [{ height: _ }, [embedding]],
                        leftOfLabel: {
                            point1: { element: [{ children: { label: _ } }, [embedding]], type: "right" },
                            point2: { type: "left" },
                            equals: 0,
                        },
                    },
                    display: {
                        text: {
                            fontSize: [{ fontSize: _ }, [embedding]],
                            textAlign: "right",

                            numericFormat: o({
                                qualifier: { valueIsMonetary: false },
                                variant: {
                                    type: "fixed",
                                    //numberOfDigits: 2,
                                },
                            }, {
                                    qualifier: { valueIsMonetary: true },
                                    variant: {
                                        type: "intl",
                                        numberOfDigits: 2,
                                        style: "currency",
                                        currency: "EUR",
                                        currencyDisplay: "symbol",
                                        useGrouping: true
                                    },
                                }),

                            value: [{ valueContent: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    }
    
}