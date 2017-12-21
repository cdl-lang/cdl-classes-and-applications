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

//
// this file defines a 'Scale' class
//
// a Scale assumes it has an associated Canvas in context.myCanvas, from
//  which it draws:
//
//  edgemarkValues (canvas segment boundaries)
//  primarylabelValue
//  secondaryLabelValue
//  unlabeledValue
//
//
// it also expects:
//
//  - ofVerticalElement - the direction along which scale values change
//
//  - scaleAtLowHTML - at which side of the graph should the scale marks be
//
//  - {high/low}HTMLGirth (derive Horizontal/Vertical/OrientedElement)
//
//
// The Scale generates area-sets for each of the three mark classes (edge
//   mark values are considered primary for that matter)
//

// %%classfile%%: <scaleDesignClasses.js>

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // API:
    // 1. myCanvas
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    Scale: {
        "class": "GeneralArea",
        context: {
            rawDefaultPrimaryLabelData: o(
                [{ myCanvas: { edgeMarkValue: _ } }, [me]],
                [{ myCanvas: { primaryLabelValue: _ } }, [me]]
            ),

            primaryLabelData: [identify,
                _,
                [{ rawDefaultPrimaryLabelData: _ }, [me]]
            ],

            primaryLabelSeparatePrecision: [
                max,
                o(
                    [
                        { myCanvas: { primaryLabelPrecision: _ } },
                        [me]
                    ],
                    [
                        { myCanvas: { edgeMarkPrecision: _ } },
                        [me]
                    ]
                )
            ],

            secondaryLabelData: [
                n([{ primaryLabelData: _ }, [me]]),
                [{ secondaryLabelValue: _ }, [{ myCanvas: _ }, [me]]]
            ],

            secondaryLabelSeparatePrecision: [
                { myCanvas: { secondaryLabelPrecision: _ } },
                [me]
            ],

            commonLabelPrecision: [
                max,
                o(
                    [{ primaryLabelSeparatePrecision: _ }, [me]],
                    [{ secondaryLabelSeparatePrecision: _ }, [me]]
                )
            ],

            // there are three a/b test precision types:
            //  - 'data' - use the numeric precision set for the facet
            //  - 'separate' - use the minimal precision that is sufficient
            //     in order to display all labels of a certain type; in this
            //     mode, there may be different precision values for primary
            //     and secondary labels
            //  - 'common' - use the minimal precision that is sufficient
            //     in order to display all labels (of all types together)
            //
            // this all only applies to 'fixed' numeric type; in all the other
            //  numeric types, numberOfDigits is used
            //
            fixedPrimaryLabelPrecision: [
                cond,
                [{ scaleLabelPrecisionABTest: _ }, [me]],
                o(
                    {
                        on: "data",
                        use: [{ myCanvas: { numberOfDigits: _ } }, [me]]
                    },
                    {
                        on: "separate",
                        use: [{ primaryLabelSeparatePrecision: _ }, [me]]
                    },
                    {
                        on: "common",
                        use: [{ commonLabelPrecision: _ }, [me]]
                    }
                )
            ],

            primaryLabelPrecision: [
                cond,
                [equal, [{ myFacet: { numericFormatType: _ } }, [me]], "fixed"],
                o(
                    { on: true, use: [{ fixedPrimaryLabelPrecision: _ }, [me]] },
                    { on: false, use: [{ myCanvas: { numberOfDigits: _ } }, [me]] }
                )
            ],

            fixedSecondaryLabelPrecision: [
                cond,
                [{ scaleLabelPrecisionABTest: _ }, [me]],
                o(
                    {
                        on: "data",
                        use: [{ myCanvas: { numberOfDigits: _ } }, [me]]
                    },
                    {
                        on: "separate",
                        use: [{ secondaryLabelSeparatePrecision: _ }, [me]]
                    },
                    {
                        on: "common",
                        use: [{ commonLabelPrecision: _ }, [me]]
                    }
                )
            ],

            secondaryLabelPrecision: [
                cond,
                [equal, [{ myFacet: { numericFormatType: _ } }, [me]], "fixed"],
                o(
                    { on: true, use: [{ fixedSecondaryLabelPrecision: _ }, [me]] },
                    { on: false, use: [{ myCanvas: { numberOfDigits: _ } }, [me]] }
                )
            ],

            tickmarkData: [
                n(
                    [{ primaryLabelData: _ }, [me]],
                    [{ secondaryLabelData: _ }, [me]]
                ),
                [{ unlabeledValue: _ }, [{ myCanvas: _ }, [me]]]
            ]
        },
        children: {
            primaryLabel: {
                data: [{ primaryLabelData: _ }, [me]]
            },
            secondaryLabel: {
                data: [{ secondaryLabelData: _ }, [me]]
            },
            tickmark: {
                data: [{ tickmarkData: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // class to be derived by any scale elements (labels/ticks) that must be
    //  positioned along the canvas
    // API:
    // 1. myCanvas
    // 2. allowEditableSliderScaleElements: whether scale elements are allowed to be editable (default: true)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ScaleElement: {
        "class": "PositionOnCanvas",
        context: {
            value: [{ param: { areaSetContent: _ } }, [me]],
            allowEditableSliderScaleElements: true,
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ScaleText: {
        "class": o(
            "DefaultDisplayText",
            "GeneralArea",
            "DisplayDimension"
        ),
        context: {
            displayText: [{ value: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ScaleTickmark: o(
        { // variant-controller
            qualifier: "!",
            context: {
                scaleAtLowHTML: [{ scaleAtLowHTML: _ }, [embedding]]
            }
        },
        { // default
            "class": o("GeneralArea", "OrientedElement"),
            context: {
                tickmarkSize: [{ tickmarkSize: _ }, [embedding]],
            },
            position: {
                tickmarkSize: {
                    point1: {
                        type: [{ lowHTMLGirth: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    equals: [{ tickmarkSize: _ }, [me]]
                },
                zeroContentLength: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]],
                        content: true
                    },
                    equals: 0
                },
                anchorTickmark: {
                    point1: [{ tickmarkPosPointToAnchor: _ }, [me]],
                    point2: [{ tickmarkAnchoragePosPoint: _ }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { scaleAtLowHTML: true },
            context: {
                // default tickmark anchor
                tickmarkPosPointToAnchor: {
                    type: [{ highHTMLGirth: _ }, [me]],
                    element: [me]
                },
                tickmarkAnchoragePosPoint: {
                    type: [{ highHTMLGirth: _ }, [me]],
                    element: [embedding]
                }
            }
        },
        {
            qualifier: { scaleAtLowHTML: false },
            context: {
                // default tickmark anchor
                tickmarkPosPointToAnchor: {
                    type: [{ lowHTMLGirth: _ }, [me]],
                    element: [me]
                },
                tickmarkAnchoragePosPoint: {
                    type: [{ lowHTMLGirth: _ }, [me]],
                    element: [embedding]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // API:
    // 1. textToTickmarkOffset: 0, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ScaleLabeledTickmark: o(
        {
            "class": o("GeneralArea", "MinWrap"),
            context: {
                minWrapAround: 0,
                textToTickmarkOffset: 0,
                
                // tickmarkSize is defined by the text design class                
                tickmarkSize: [{ children: { text: { tickmarkSize: _ } } }, [me]]
            },
            children: {
                text: {
                    description: {
                        // provided by inheriting class
                    }
                },
                tickmark: {
                    description: {
                        // provided by inheriting class
                    }
                }
            },
            position: {
                // some positioning constraints for a labeled tickmark, to be used by the scale element embedding the 'text' and 'tickmark' children

                //  align the label ('text') child's center with my center (in the canvas axis)
                alignTextCenterLength: {
                    point1: {
                        type: [{ centerLength: _ }, [me]],
                        element: [{ children: { text: _ } }, [me]]
                    },
                    point2: {
                        type: [{ centerLength: _ }, [me]],
                        element: [me]
                    },
                    equals: 0
                },

                // align the tickmark's center with my center
                alignTickmarkCenterLength: {
                    point1: {
                        type: [{ centerLength: _ }, [me]],
                        element: [{ children: { tickmark: _ } }, [me]]
                    },
                    point2: {
                        type: [{ centerLength: _ }, [me]],
                        element: [me]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { scaleAtLowHTML: true },
            position: {
                // attach highHTML edge of the text to the lowHTML edge of
                //  the tick
                textTickAttachment: {
                    point1: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        element: [{ children: { text: _ } }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLGirth: _ }, [me]],
                        element: [{ children: { tickmark: _ } }, [me]]
                    },
                    equals: [{ textToTickmarkOffset:_ }, [me]]
                }
            }
        },
        {
            qualifier: { scaleAtLowHTML: false },
            position: {
                // attach highHTML edge of the tick to the lowHTML edge of
                //  the text
                textTickAttachment: {
                    point1: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        element: [{ children: { tickmark: _ } }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLGirth: _ }, [me]],
                        element: [{ children: { text: _ } }, [me]]
                    },
                    equals: [{ textToTickmarkOffset:_ }, [me]]
                }
            }
        }
    )
};
