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


var myClick = [{ type: "MouseUp", subType: o("Click", "DoubleClick") }, [myMessage]];

var scaleTickmarkValues = [defun,
    o("step", "maxScale"),
    [using,
        // beginning of list of definitions in using
        "numberOfTickmarks",
        [div, "maxScale", "step"],
        // end of list of definitions in using
        [plus,
            "step",
            [mul,
                "step",
                [sequence, r(0, [minus, "numberOfTickmarks", 1])]
            ]
        ]
        //----------------
        // general step-function: [plus, offset, [mul, stepSize, [sequence, r(0, nrsteps - 1)]]]
        //----------------
    ]
];

var metricSuffixTable = o(
    {
        range: o(Rco(1e-15, 1e-12), Roc(-1e-12, -1e-15)),
        suffix: "f",
        value: 1e-15
    },
    {
        range: o(Rco(1e-12, 1e-9), Roc(-1e-9, -1e-12)),
        suffix: "p",
        value: 1e-12
    },
    {
        range: o(Rco(1e-6, 1e-3), Roc(-1e-3, -1e-6)),
        suffix: "n",
        value: 1e-9
    },
    {
        range: o(Rco(1e-6, 1e-3), Roc(-1e-3, -1e-6)),
        suffix: "\u03BC", // mu
        value: 1e-6
    },
    {
        range: o(Rco(1e-3, 1), Roc(-1, -1e-3)),
        suffix: "m",
        value: 1e-3
    },
    {
        range: o(0, Rco(1, 1e3), Roc(-1e3, -1)),
        suffix: "",
        value: 1
    },
    {
        range: o(Rco(1e3, 1e6), Roc(-1e6, -1e3)),
        suffix: "k",
        value: 1e3
    },
    {
        range: o(Rco(1e6, 1e9), Roc(-1e9, -1e6)),
        suffix: "M",
        value: 1e6
    },
    {
        range: o(Rco(1e9, 1e12), Roc(-1e12, -1e9)),
        suffix: "G",
        value: 1e9
    },
    {
        range: o(Rco(1e12, 1e15), Roc(-1e15, -1e12)),
        suffix: "T",
        value: 1e12
    },
    {
        range: o(Rco(1e15, 1e18), Roc(-1e18, -1e15)),
        suffix: "P",
        value: 1e15
    },
    {
        range: o(Rco(1e18, 1e21), Roc(-1e21, -1e18)),
        suffix: "E",
        value: 1e18
    },
    {
        range: o(Rco(1e21, 1e24), Roc(-1e24, -1e21)),
        suffix: "Z",
        value: 1e21
    },
    {
        range: o(
            Rco(1e24, Number.POSITIVE_INFINITY),
            Roc(Number.NEGATIVE_INFINITY, -1e24)),
        suffix: "Y",
        value: 1e24
    }
);

var financialSuffixTable = o(
    {
        range: Roo(-1e3, 1e3),
        suffix: "",
        value: 1
    },
    {
        range: o(Rco(1e3, 1e6), Roc(-1e6, -1e3)),
        suffix: o("K", "k"),
        value: 1e3
    },
    {
        range: o(Rco(1e6, 1e9), Roc(-1e9, -1e6)),
        suffix: o("M", "m"),
        value: 1e6
    },
    {
        range: o(Rco(1e9, 1e12), Roc(-1e12, -1e9)),
        suffix: o("B", "b"),
        value: 1e9
    },
    {
        range: o(
            Rco(1e12, Number.POSITIVE_INFINITY),
            Roc(Number.NEGATIVE_INFINITY, -1e12)
        ),
        suffix: o("T", "t"),
        value: 1e12
    }
);

////////////////////////////////////////////////////////////
// API:
// 1. num: its pristine representation
// 2. numericFormatType: either metrixPrefix or financialSuffix.
// 3. numberOfDigits
// 4. useStandardPrecision: if false, the function will use the nsbPrecision it calculates
////////////////////////////////////////////////////////////
var translateNumToSuffixBaseFormat = [defun,
    o("num", "numericFormatType", "numberOfDigits", "useStandardPrecision"),
    [using,
        // beginning of list of definitions in using
        "suffixTable",
        [cond,
            "numericFormatType",
            o(
                { on: "metricPrefix", use: metricSuffixTable },
                { on: "financialSuffix", use: financialSuffixTable }
            )
        ],
        "tableEntry",
        [
            { range: "num" },
            "suffixTable"
        ],

        "nsbSuffixValue",
        [{ value: _ }, "tableEntry"],

        "nsbSuffixStr",
        [first, [{ suffix: _ }, "tableEntry"]],
        // Each value range contains an ordered set of the corresponding suffix in both upper and lower case format. The first function insures that the upper-case version will be displayed. 

        "nsbRawNumericStem",
        [div,
            "num",
            "nsbSuffixValue"
        ],

        "nsbPrecision",
        [minus,
            "numberOfDigits",
            [cond,
                [abs, "nsbRawNumericStem"],
                o(
                    {
                        on: Roo(0, Number.POSITIVE_INFINITY),
                        use: [floor,
                            [
                                log10,
                                [abs, "nsbRawNumericStem"]
                            ]
                        ]
                    },
                    { on: o(true, false), use: 0 }
                )
            ]
        ],

        "actualPrecision",
        [cond,
            "useStandardPrecision",
            o(
                { on: true, use: "numberOfDigits" },
                { on: false, use: "nsbPrecision" }
            )
        ],

        "nsbNumericStem",
        [round,
            "nsbRawNumericStem",
            "actualPrecision"
        ],

        "nsbNumericStemFormatted",
        [numberToString,
            "nsbNumericStem",
            { type: "fixed", numberOfDigits: "actualPrecision" }
        ],

        // end of list of definitions in using
        [cond, // the value returned by the defun!
            [
                Roo(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
                "num"
            ],
            o(
                {
                    on: true,
                    use: [concatStr,
                        o(
                            //"nsbNumericStem",
                            "nsbNumericStemFormatted",
                            "nsbSuffixStr"
                        )
                    ]
                },
                { // for a "num" which turns out not to be a number after all, simply return it as is.
                    on: null,
                    use: "num"
                }
            )
        ]
    ]
];

var classes = {

    MinWrapVerticallyEmbedded: {
        topAboveEmbedded: {
            point1: { type: "top" },
            point2: { element: [embedded], type: "top" },
            min: 0
        },
        bottomBelowEmbedded: {
            point1: { element: [embedded], type: "bottom" },
            point2: { type: "bottom" },
            min: 0
        }
    },

    MinWrapHorizontallyEmbedded: {
        topAboveEmbedded: {
            point1: { type: "left" },
            point2: { element: [embedded], type: "left" },
            min: 0
        },
        bottomBelowEmbedded: {
            point1: { element: [embedded], type: "right" },
            point2: { type: "right" },
            min: 0
        }
    },


    FrameWithElement: {
        leftAlignedWithElement: {
            point1: { element: "$element", type: "left" },
            point2: { type: "left" },
            equals: "$distance"
        },
        rightAlignedWithElement: {
            point1: { type: "right" },
            point2: { element: "$element", type: "right" },
            equals: "$distance"
        },
        toptAlignedWithElement: {
            point1: { element: "$element", type: "top" },
            point2: { type: "top" },
            equals: "$distance"
        },
        bottomAlignedWithElement: {
            point1: { type: "bottom" },
            point2: { element: "$element", type: "bottom" },
            equals: "$distance"
        }
    },

    LeftAlignedWithElement: {
        leftAlignedWithElement: {
            point1: { element: "$element", type: "left" },
            point2: { type: "left" },
            equals: "$distance"
        }
    },

    RightAlignedWithElement: {
        rightAlignedWithElement: {
            point1: { type: "right" },
            point2: { element: "$element", type: "right" },
            equals: "$distance"
        }
    },

    TopAlignedWithElement: {
        toptAlignedWithElement: {
            point1: { element: "$element", type: "top" },
            point2: { type: "top" },
            equals: "$distance"
        }
    },

    BottomAlignedWithElement: {
        bottomAlignedWithElement: {
            point1: { type: "bottom" },
            point2: { element: "$element", type: "bottom" },
            equals: "$distance"
        }
    }



};
