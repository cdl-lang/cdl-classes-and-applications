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


var definedOrDefault = [defun,
    o("var", "default"),
    [cond,
        "var",
        o(
            { on: true, use: "var" },
            { on: false, use: "default" }
        )
    ]
];

var densityChoice = [
    [defun, "densityChoice", { "#densityChoice": _ }],
    [{ displayDensity: _ }, [areaOfClass, "App"]]
];

// DO NOT REMOVE
// this version of densityChoice is more robus yet more expensive than the one above
// use only for debugging purpose
/*
var densityChoice = [
    defun, "densityValue",
    [definedOrDefault,
        [
            [
                [defun, "densityChoice", { "#densityChoice": _ }],
                [{ displayDensity: _ }, [areaOfClass, "App"]]
            ],
            "densityValue"
        ],
        "densityValue"
    ]
];
*/

var generateHSL = [defun,
    "HSL",
    [concatStr,
        o(
            "hsl(",
            [{ "H": _ }, "HSL"], ",",
            [{ "S": _ }, "HSL"], "%,",
            [{ "L": _ }, "HSL"], "%)"
        )
    ]
];

var convertRGBToString = [defun, // this function converts an os of rgb values to a string that display.background can use.
    o("rgbOS"),
    [concatStr,
        o(
            "rgb(",
            [concatStr,
                "rgbOS",
                ", "
            ],
            ")"
        )
    ]
];

var even = [defun,
    o("num"),
    [equal,
        [mod, "num", 2],
        0
    ]
];

// This function is not identical to [floor, [div, "dividend", "divisor"]] - if the ratio of "dividend"/"divisor" is negative, it behaves like [floor, [div, "dividend", "divisor"]]
var divMod = [defun,
    // terminology: 7/2 = 3 with a remainder of 1. 7 is the dividend, 2 is the divisor, 3 is the quotient, 1 is the remainder
    o("dividend", "divisor"),
    [div,
        [minus, "dividend", [remainder, "dividend", "divisor"]],
        "divisor"
    ]
];

var rawPercentage = [defun,
    o("numerator", "denominator"),
    [mul,
        100,
        [cond,
            [equal, 0, "denominator"],
            o(
                { on: true, use: 0 },
                { on: false, use: [div, "numerator", "denominator"] }
            )
        ]
    ]
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var percentage = [defun,
    o("numerator", "denominator"),
    [round,
        [rawPercentage, "numerator", "denominator"],
        0
    ]
];

var ppercentage = [defun,
    o("numerator", "denominator", "precision"),
    [round,
        [rawPercentage, "numerator", "denominator"],
        "precision"
    ]
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// two functions which take an os, "os", and an element in it, "element", and return its next/prev in "os", while interpreting "os" as a circular os: 
// [next, [last, "os"]] is [first, "os"], and similarly [prev, [first, "os"]] is [last, "os"]
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var nextInCircularOS = [defun,
    o("os", "el"),
    [cond,
        [equal,
            "el",
            [last, "os"]
        ],
        o(
            { on: true, use: [first, "os"] },
            { on: false, use: [next, "os", "el"] }
        )
    ]
];
var prevInCircularOS = [defun,
    o("os", "el"),
    [cond,
        [equal,
            "el",
            [first, "os"]
        ],
        o(
            { on: true, use: [last, "os"] },
            { on: false, use: [prev, "os", "el"] }
        )
    ]
];

var nextInOS = [defun, // till [next] becomes fast enough, we use this hack for large os (e.g. scrolling through SolutionSetItems)
    o("os", "element"),
    [pos,
        [min,
            [plus,
                [index,
                    "os",
                    "element"
                ],
                1
            ],
            [minus, [size, "os"], 1]
        ],
        "os"
    ]
];

var prevInOS = [defun, // till [prev] becomes fast enough, we use this hack for large os (e.g. scrolling through SolutionSetItems)
    o("os", "element"),
    [pos,
        [max,
            [minus,
                [index,
                    "os",
                    "element"
                ],
                1
            ],
            0
        ],
        "os"
    ]
];

var prevStarInOS = [defun, // till [prevStar] becomes fast enough, we use this hack for large os
    o("os", "element"),
    [pos,
        r(
            0,
            [index,
                "os",
                "element"
            ]
        ),
        "os"
    ]
];

var nextStarInOS = [defun, // till [nextStar] becomes fast enough, we use this hack for large os
    o("os", "element"),
    [pos,
        r(
            [index,
                "os",
                "element"
            ],
            -1
        ),
        "os"
    ]
];

var putInParentheses = [defun,
    "str",
    [concatStr, o("(", "str", ")")]
];

var stringMatchCaseInsensitive = [defun,
    o("strA", "strB"),
    [and,
        [
            s("strA"),
            "strB"
        ],
        [
            s("strB"),
            "strA"
        ]
    ]
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This function takes an os of objects or terminals, and the uniqueID attribute (in case of an os of terminals, it should be specified o()).
// It returns an os of objects, where the value of the input os appears in the 'val' attribute of the object, and the number of instances
// of this val in the os appears in the count attribute.
// The invoking area can then, for example, select only these values which have a count != 1 - these are the values which appear more than
// once in the os.
// Example of use: to check the integrity of os provided by the user in configuration files (to make sure there are no repetitions)
/////////////////////////////////////////////////////////////////////////////////////////////////////////   
var countProjectedVals = [defun,
    o("os", "attr"),
    [map,
        [defun,
            "val",
            {
                val: "val",
                count: [size,
                    [cond,
                        [equal, "attr", o()],
                        o(
                            { on: true, use: ["val", "os"] }, // if it's a flat os, then select the "val" instances directly from os
                            { on: false, use: [{ "#attr": "val" }, "os"] } // otherwise, create a selection
                        )
                    ]
                ]
            }
        ],
        [cond, // input to [map]: projection of the input os.
            [equal, "attr", o()],
            o(
                { on: true, use: "os" }, // if it's a flat os, then return the os itself
                { on: false, use: [{ "#attr": _ }, "os"] } // otherwise, project by attr
            )
        ]
    ]
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This function takes an os and the name of the uniqueID of the attribute in its object (or o() if its an os of terminals),
// and returns the values of those elements which repeat more than once in the os.
// It does so by invoking countProjectedVals, and performing a calculation on its output.
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var repeatingValsInOS = [defun,
    o("os", "attr"),
    [_,
        [
            { val: _ },
            [
                n({ count: 1 }),
                [countProjectedVals,
                    "os", "attr"
                ]
            ]
        ]
    ]
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This function constructs an attribute value pair from an attribute and a value.
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var constructAVP = [defun,
    o("attr", "val"),
    { "#attr": "val" }
];

var constructProjQuery = [defun,
    o("attr"),
    [constructAVP,
        "attr",
        _
    ]
];

var constructSelectionQueryFunc = [defun,
    o("attr"),
    [
        defun,
        o("what"),
        { "#attr": "what" }
    ]
];


// pseudoLog and its reverse pseudoExp are used in scales, creating a map- which
//  is somewhat akin to a logarithmic scale, but which is also defined for
//  negative numbers
//
// within the range -k .. +k, the behavior is linear.
// -k is mapped to -1, 0 to 0, and k to 1. so within this range, the mapping is
//  pLog(x) := x/k
//
// outside the range -k..+k, a logarithmic scale is ussed:
//
// pseudoLog(x, k) := sign(x) * ((log10(|x|)/k)+1)
//
var pseudoLog = [
    defun,
    o("num", "kernel"),
    [cond,
        [
            lessThan,
            [abs, "num"],
            "kernel"
        ],
        o(
            {
                on: false,
                use: [
                    mul,
                    [sign, "num"],
                    [plus, [log10, [div, [abs, "num"], "kernel"]], 1]
                ]
            },
            {
                on: true,
                use: [div, "num", "kernel"]
            }
        )
    ]
];

//
// pseudoExp is the reverse of pseudoLog
//
// within the range -1 .. 1, pExp(x) := x * k
//
// outside the range -1 .. 1, pExp(x) := sign(x) * 10^((|x|-1)*k)
var pseudoExp = [
    defun,
    o("num", "kernel"),
    [
        cond,
        [lessThan,
            [abs, "num"],
            1
        ],
        o(
            {
                on: true,
                use: [mul, "num", "kernel"]
            },
            {
                on: false,
                use: [
                    mul,
                    [sign, "num"],
                    [
                        mul,
                        [
                            pow,
                            10,
                            [
                                minus,
                                [abs, "num"],
                                1
                            ]
                        ],
                        "kernel"
                    ]
                ]
            }
        )
    ]
];

// Returns an object with the usual descriptive statistics: minimum, maximum,
// average, standard deviation, median, quartiles and the 2% and 10% upper and
// lower quantiles.
var descriptiveStatistics = [
    defun, "data",
    [using,
        "n", [size, "data"],
        "sumx", [sum, "data"],
        "sumx2", [sum, [map, [defun, "x", [mul, "x", "x"]], "data"]],
        "average", [div, "sumx", "n"],
        "stddev", [cond, [greaterThan, "n", 1], o(
            { on: true, use: [sqrt, [div, [minus, "sumx2", [div, [mul, "sumx", "sumx"], "n"]], [minus, "n", 1]]] }
        )],
        "sorted", [sort, "data", "ascending"],
        "min", [pos, 0, "sorted"],
        "max", [pos, -1, "sorted"],
        "interpolateSorted", [defun, "pos",
            [using,
                "i", [floor, "pos"],
                "p", [minus, "pos", "i"],
                [plus,
                    [mul, [pos, "i", "sorted"], [minus, 1, "p"]],
                    [mul, [pos, [plus, "i", 1], "sorted"], "p"]
                ]
            ]
        ],
        "median", [cond, [greaterThan, "n", 1], o(
            { on: true, use: ["interpolateSorted", [div, [minus, "n", 1], 2]] },
            { on: false, use: "data" }
        )],
        "quartiles", [cond, [greaterThan, "n", 3], o(
            {
                on: true, use: o(
                    "min",
                    ["interpolateSorted", [div, [minus, "n", 1], 4]],
                    "median",
                    ["interpolateSorted", [div, [mul, [minus, "n", 1], 3], 4]],
                    "max"
                )
            },
            {
                on: false, use: o(
                    "min",
                    "min",
                    "median",
                    "max",
                    "max"
                )
            }
        )],
        "twoperc", o(
            ["interpolateSorted", [mul, [minus, "n", 1], 0.02]],
            ["interpolateSorted", [mul, [minus, "n", 1], 0.98]]
        ),
        "tenperc", o(
            ["interpolateSorted", [mul, [minus, "n", 1], 0.1]],
            ["interpolateSorted", [mul, [minus, "n", 1], 0.9]]
        ),
        {
            n: "n",
            average: "average",
            stddev: "stddev",
            minimum: "min",
            maximum: "max",
            median: "median",
            quartiles: "quartiles",
            twoperc: "twoperc",
            tenperc: "tenperc"
        }
    ]
];

var average = [
    defun, "data",
    [using,
        "n", [size, "data"],
        "sumx", [sum, "data"],
        [div, "sumx", "n"]
    ]
];

var contentOfPosPoint = [defun,
    o("posPoint"),
    [merge,
        { content: true },
        "posPoint"
    ]
];

var frameOfPosPoint = [defun,
    o("posPoint"),
    [merge,
        { content: false },
        "posPoint"
    ]
];

var displayDefined = [defun,
    o("val", "title"),
    [cond,
        "val",
        o(
            { on: true, use: [concatStr, o("title", ":", "val", " ")] },
            { on: false, use: o() }
        )
    ]
];

var sampleYears = r(1900, 2050);

// these are case-insensitive when they're used by s()
var languagePrefixes = o(
    {
        language: "english",
        weekdaysPrefix: o("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"),
        monthsPrefix: o("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
        quartersPrefix: o("Q1", "Q2", "Q3", "Q4")
    }
);

var convertNumToQuarter = [defun,
    "num",
    [pos,
        [minus, "num", 1], // this is a number, which we convert to a string, based on the expression projected from languagePrefixes
        [
            { quartersPrefix: _ },
            [{ language: [{ language: _ }, [areaOfClass, "App"]] }, languagePrefixes]
        ]
    ]
];

var convertNumToMonth = [defun,
    "num",
    [pos,
        [minus, "num", 1], // this is a number, which we convert to a string, based on the expression projected from languagePrefixes
        [
            { monthsPrefix: _ },
            [{ language: [{ language: _ }, [areaOfClass, "App"]] }, languagePrefixes]
        ]
    ]
];

var convertNumToWeekDay = [defun,
    "num",
    [pos,
        [minus, "num", 1], // this is a number, which we convert to a string, based on the expression projected from languagePrefixes
        [
            { weekdaysPrefix: _ },
            [{ language: [{ language: _ }, [areaOfClass, "App"]] }, languagePrefixes]
        ]
    ]
];

var createPrefixSelectionQuery = [defun,
    "prefixVals",
    [map,
        [defun,
            "prefixVal",
            s("prefixVal")
        ],
        "prefixVals"
    ]
];

var detectWeekDaysType = [defun,
    o("yvalues"), // can change to "values" once bug #1529 is fixed
    [empty,
        [
            n(
                [createPrefixSelectionQuery,
                    [
                        {
                            language: "english",
                            weekdaysPrefix: _
                        },
                        languagePrefixes
                    ]
                ]
            ),
            "yvalues" // can change to "values" once bug #1529 is fixed
        ]
    ]
];


var detectMonthsType = [defun,
    o("xvalues"), // can change to "values" once bug #1529 is fixed
    [empty,
        [
            n(
                [createPrefixSelectionQuery,
                    [
                        {
                            language: "english",
                            monthsPrefix: _
                        },
                        languagePrefixes
                    ]
                ]
            ),
            "xvalues" // can change to "values" once bug #1529 is fixed
        ]
    ]
];

var sortByWeekDays = [defun,
    o("xvalues"), // can change to "values" once bug #1529 is fixed
    [map,
        [defun,
            o("weekdayPrefix"),
            [
                s("weekdayPrefix"),
                "xvalues"
            ]
        ],
        [ // the [map] data
            {
                language: "english",
                weekdaysPrefix: _
            },
            languagePrefixes
        ]
    ]
];

var sortByMonths = [defun,
    o("xvalues"), // can change to "values" once bug #1529 is fixed
    [map,
        [defun,
            o("monthPrefix"),
            [
                s("monthPrefix"),
                "xvalues"
            ]
        ],
        [ // the [map] data
            {
                language: "english",
                monthsPrefix: _
            },
            languagePrefixes
        ]
    ]
];

var detectDataType = [defun,
    o("values"),
    [cond,
        [detectWeekDaysType, "values"],
        o(
            {
                on: true,
                use: "weekDays"
            },
            {
                on: false,
                use: [cond,
                    [detectMonthsType, "values"],
                    o(
                        {
                            on: true,
                            use: "months"
                        },
                        {
                            on: false,
                            use: o()
                        }
                    )
                ]
            }
        )
    ]
];

var convertByteSizeToString = [defun,
    o("byteSize"),
    [using,
        "suffixes", o("Bytes", "KB", "MB", "GB", "TB"),
        "nrPowersOf1024", [min, [floor, [logb, "byteSize", 1024]], [size, "suffixes"]],
        "suffix", [pos, "nrPowersOf1024", "suffixes"],
        "mantissa", [round, [div, "byteSize", [pow, 1024, "nrPowersOf1024"]], 0],
        [concatStr, o("mantissa", " ", "suffix")]
    ]
];

var convertFileObjToString = [defun,
    o("fileObj"),
    [concatStr,
        o(
            "File Name: ", [{ name: _ }, "fileObj"],
            "\n",
            "Size: ", [convertByteSizeToString, [{ size: _ }, "fileObj"]],
            "\n",
            "Last Modified: ", [{ lastModifiedDate: _ }, "fileObj"]
        )
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
                        ],
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

var numberToStringPerNumericFormat = [defun,
    o("num", "numericFormat", "useStandardPrecision"),
    [cond,
        [
            [{ type: _ }, "numericFormat"],
            o("metrixPrefix", "financialSuffix")
        ],
        o(
            {
                on: true,
                use: [translateNumToSuffixBaseFormat,
                    "num",
                    [{ type: _ }, "numericFormat"],
                    [{ numberOfDigits: _ }, "numericFormat"],
                    "useStandardPrecision"
                ]
            },
            {
                on: false,
                use: [numberToString,
                    "num",
                    "numericFormat"
                ]
            }
        )
    ]
];

var getOverlayUniqueID = [
    defun,
    "counter",
    [concatStr,
        o(
            fsAppConstants.newOverlayIDPrefix,
            "counter"
        )
    ]
];

var reduceFontSizeToFitText = [ // or at least to fit more text...
    defun,
    o("minTextSize", "defaultTextSize", "maxWidth", "defaultWidth"),
    [using,
        "ratio",
        [div, "defaultWidth", "maxWidth"],
        // the value returned by the function:
        [cond,
            [lessThan, "ratio", 1],
            o(
                {
                    on: true,
                    use: "defaultTextSize"
                },
                {
                    on: false,
                    use: [cond,
                        [greaterThan, "maxWidth", 0],
                        o(
                            { on: true, use: [max, "minTextSize", [floor, [div, "defaultTextSize", "ratio"]]] },
                            { on: false, use: "defaultWidth" } // if maxLength is 0, return defaultLength (as "ratio" in this case would be infinity)
                        )
                    ]
                }
            )
        ]
    ]
];

var generateNameFromPrefix = [
    defun,
    o("prefixOfName", "allNames"),
    [using,
        // beginning of function defs
        "preexistingWithPrefixOfName",
        [ // preexisting names with said prefix
            s("prefixOfName"),
            "allNames"
        ],
        "numOfPreexistingWithPrefix",
        [size, "preexistingWithPrefixOfName"],
        "osOfPossibleSuffixCounter",
        [sequence, r(0, [plus, "numOfPreexistingWithPrefix", 1])],
        "possibleNames",
        [map,
            [defun,
                o("counter"),
                [concatStr,
                    o(
                        "prefixOfName", // instead of "Copy of X(0)", just have "Copy of X".
                        [cond,
                            [greaterThan,
                                "counter",
                                0
                            ],
                            { on: true, use: [concatStr, o("(", "counter", ")")] }
                        ]
                    )
                ]
            ],
            "osOfPossibleSuffixCounter"
        ],
        // end of function defs
        // the value returned by the function:
        [first, // guaranteed not to be empty because of the (inverse) pigeonhole principle.
            [
                n("preexistingWithPrefixOfName"),
                "possibleNames"
            ]
        ]
    ]
];

var hyperlinkPrefixFunc = [defun,
    o("prefixOfURL", "val"),
    [concatStr,
        o(
            "<a href='",
            "prefixOfURL",
            "val",
            "' target='Value'>",
            "val",
            "</a>"
        )
    ]
];

var booleanStringFunc = [defun,
    o("prefixString", "suffixString", "falseString", "trueString", "booleanFlag"),
    [concatStr,
        o(
            "prefixString",
            [cond, // add spacing only if followed by a meaningful string
                [notEqual, "prefixString", ""],
                o({ on: true, use: " " })
            ],
            [cond,
                "booleanFlag",
                o(
                    { on: true, use: "trueString" },
                    { on: false, use: "falseString" }
                )
            ],
            [cond, // add spacing only if followed by a meaningful string
                [notEqual, "suffixString", ""],
                o({ on: true, use: " " })
            ],
            "suffixString"
        )
    ]
];

// This function ensures that "val" is not rounded to 0, but rather to 10^(-numberOfDigits). 
// one place where this is of importance: when determining the range of the linear environment around 0 in a log scale that extends past 0
// (since log is not defined for 0, we define two linear intervals, on either side of 0 there) 
var roundNotToZero = [defun,
    o("val", "numberOfDigits"),
    [using,
        // beginning of using
        "roundedVal",
        [round, "val", "numberOfDigits"],
        "absNumericPrecisionLimit",
        [pow, 10, [mul, -1, "numberOfDigits"]],
        "numericPrecisionLimit",
        [cond,
            [greaterThanOrEqual, "val", 0],
            o(
                { on: true, use: "absNumericPrecisionLimit" },
                { on: false, use: [mul, -1, "absNumericPrecisionLimit"] }
            )
        ],
        // end of using
        [cond,
            [greaterThanOrEqual, "val", 0],
            o(
                { on: true, use: [max, "numericPrecisionLimit", "roundedVal"] },
                { on: false, use: [min, "numericPrecisionLimit", "roundedVal"] }
            )
        ]
    ]
];

// this function determines what is the "100%" of a histogram with a Percent Measure Function (i.e. showing a distribution).
// it takes as input a boolean indicating whether the bar displays a positive value, 
// and two separate sums: the abs val of the positive value bars, and of the negative value bars.
// several options in calculating this, including:
// 1. the max of these two sum figures will be the 100%. this ensures all bars will be <=100%, but they won't add up to 100%.
// 2. each set of values of equal sign (all negative values, and all positive values) will constitute its own 100%. so such a histogram
//    of mixed sign bars in Percent mode will actually add up to 200% - 100% for the positive bars, 100% for the negative bars.
var defineHistogramOneHundredPercent = [defun,
    o("positiveVal", "sumPositiveVals", "sumNegativeVals"),
    // for the current implementation, which simply takes the max of these two sums (option #1 above), we do not actually make use of the measureValSign.
    // it will be needed if we switch to option #2.
    [max, "sumPositiveVals", "sumNegativeVals"]
    /* option #2:
    [cond,
     "positiveVal", 
     o(
         { on: true, use: "sumPositiveVals" },
         { on: false, use: "sumNegativeVals" }
     )
    ] 
    */
];

var secondsInAMinute = 60;
var secondsInAnHour = secondsInAMinute * 60;
var secondsInADay = secondsInAnHour * 24;
var secondsInAWeek = secondsInADay * 7;

var generateBeginningOfYearDate = [defun,
    "year",
    [concatStr, o("01/01/", "year")]
];

var generateBeginningOfQuarterDate = [defun,
    o("quarter", "year"), // quarter: number betwen 1-4
    [concatStr,
        o(
            "01",
            "/",
            [plus, 1, [mul, [minus, "quarter", 1], 3]], // the month number is 1+(quarter-1)*3
            "/",
            "year"
        )
    ]
];

var generateBeginningOfMonthDate = [defun,
    o("month", "year"), // quarter: number betwen 1-12
    [concatStr,
        o(
            "01",
            "/",
            "month",
            "/",
            "year"
        )
    ]
];

/*
A step sequence function,
start_included: must be >= 0
stop_excluded: must be > 0  and > start_included
stepSize: must be >= 1
e.g., 
[stepSequence, 3, 9, 1] = [3, 4, 5, 6, 7, 8]
[stepSequence, 2, 7, 2] = [2, 4, 6]
*/
var stepSequence = [defun,
    o(
        "start_included",
        "stop_excluded",
        "step_size"
    ),
    [using,
        "length",
        [minus,
            "stop_excluded",
            "start_included"
        ],
        "nrsteps",
        [div,
            "length",
            "step_size"
        ],
        "nrsteps_minusone",
        [minus, "nrsteps", 1],
        // end of using
        [plus, "start_included", [mul, "step_size", [sequence, r(0, "nrsteps_minusone")]]]
    ]
]

/*
[plus,
"start_included",
    [mul,
        "step_size",
        [sequence,
            r(
                0,
                [minus,
                    [div,
                        [minus,
                            "stop_excluded",
                            "start_included"
                        ],
                        "step_size"
                    ],
                    1
                ]
            )
        ]
    ]
]
*/

var beginningOfYearComponentsAsDate = [defun,
    o(
        "yearComponentResolution", // "months"/"quarters"...
        "yearsRepresentedInCanvas",
        "firstYearComponent",
        "lastYearComponent"
    ),
    [using,
        // beginning of using
        "maxNumYearComponents",
        [cond,
            "yearComponentResolution",
            o(
                { on: "months", use: 12 },
                { on: "quarters", use: 4 }
            )
        ],
        "spansAcrossMultipleYears",
        [greaterThan, [size, "yearsRepresentedInCanvas"], 1],
        "spansAcrossMultipleYearComponents",
        o(
            "spansAcrossMultipleYears",
            [and,
                [not, "spansAcrossMultipleYears"],
                [greaterThan,
                    "lastYearComponent",
                    "firstYearComponent"
                ]
            ]
        ),
        "yearComponentFollowingFirstYearComponent",
        [cond,
            "spansAcrossMultipleYearComponents",
            o(
                // e.g. [plus, [mod, 12, 12], 1] so from Dec we go back to Jan
                { on: true, use: [plus, [mod, "firstYearComponent", "maxNumYearComponents"], 1] },
                { on: false, use: o() }
            )
        ],
        // end of using
        [map, // either months or quarters (could be for H1/H2 too)
            [defun,
                o("year"),
                [map,
                    [defun,
                        "yearComponent",
                        [cond,
                            "yearComponentResolution",
                            o(
                                {
                                    on: "months",
                                    use: [generateBeginningOfMonthDate, "yearComponent", "year"]
                                },
                                {
                                    on: "quarters",
                                    use: [generateBeginningOfQuarterDate, "yearComponent", "year"]
                                }
                            )
                        ]
                    ],
                    // the data for the map: the os of yearComponents for each year we iterate over
                    [cond,
                        "spansAcrossMultipleYears",
                        o(
                            {
                                on: false,
                                use: [sequence, r("yearComponentFollowingFirstYearComponent", "lastYearComponent")]
                            },
                            {
                                on: true,
                                use: [cond,
                                    "year",
                                    o(
                                        {
                                            on: [first, "yearsRepresentedInCanvas"],
                                            use: [cond,
                                                [notEqual, "firstYearComponent", "maxNumYearComponents"],
                                                o(
                                                    {
                                                        on: true,
                                                        use: [sequence, r("yearComponentFollowingFirstYearComponent", "maxNumYearComponents")]
                                                    }
                                                )
                                            ]
                                        },
                                        {
                                            on: [last, "yearsRepresentedInCanvas"],
                                            use: [sequence, r(1, "lastYearComponent")]
                                        },
                                        {
                                            on: null, // i.e. not the firstYear or the lastYear (and therefore must be a full year)
                                            use: [sequence, r(1, "maxNumYearComponents")]
                                        }
                                    )
                                ]
                            }
                        )
                    ]
                ]
            ],
            // the data for the external map: the os of years (including the partial years)
            "yearsRepresentedInCanvas"
        ]
    ]
];

var nextPrevLeadingDateAsNum = [defun,
    o(
        "next", // a boolean
        "numBinHop",
        "dateAsNum",
        "dateResolution" // "days"/"weeks"/"months"/"quarters"/"years"
    ),
    [using,
        // beginning of using
        "defaultDateFormat",
        "dd/MM/yyyy",
        "beyondIncrement",
        [cond,
            "next",
            // since all bins are [), and the last one is [], when we move to the next bin, we calculate the beginning of two bins beyond, and
            // then backtrack one day. ugly...
            // this means that for next we move two periods beyond, whereas for prev, we move only one period back
            o(
                { on: true, use: [plus, "numBinHop", 1] },
                { on: false, use: [mul, "numBinHop", -1] }
            )
        ],
        "maxNumYearComponents",
        [cond,
            "dateResolution",
            o(
                { on: "months", use: 12 },
                { on: "quarters", use: 4 }
            )
        ],
        "dateYear",
        [year, "dateAsNum"],
        "dateQuarter",
        [quarter, "dateAsNum"],
        "dateMonth",
        [month, "dateAsNum"],

        "roundDate", // round to the beginning of the bin or the original date.
        [cond,
            "dateResolution",
            o(
                {
                    on: "years",
                    use: [generateBeginningOfYearDate, "dateYear"]
                },
                {
                    on: "quarters",
                    use: [generateBeginningOfQuarterDate, "dateQuarter", "dateYear"]
                },
                {
                    on: "months",
                    use: [generateBeginningOfYearDate, "dateMonth", "dateYear"]
                }
            )
        ],
        "yearComponentBeyondNoMod",
        [plus,
            [cond,
                "dateResolution",
                o({ on: "quarters", use: "dateQuarter" }, { on: "months", use: "dateMonth" })
            ],
            "beyondIncrement"
        ],
        "yearComponentBeyondYearIncrement",
        [floor,
            [div,
                // subtract 1, so that if yearComponentBeyondNoMod equals maxNumYearComponents, the [floor[div]] would yield 0
                // note that this also works if yearComponentBeyondNoMod is negative!
                [minus, "yearComponentBeyondNoMod", 1],
                "maxNumYearComponents"
            ]
        ],
        "beginningDateOfYearBeyond", // beyond the next/prev one
        [generateBeginningOfYearDate,
            [plus,
                "dateYear",
                [cond,
                    "dateResolution",
                    o(
                        {
                            on: "years",
                            use: "beyondIncrement"
                        },
                        {
                            on: null, // "quarters" / "months"
                            use: "yearComponentBeyondYearIncrement"
                        }
                    )
                ]
            ]
        ],
        // two layers of mod, as the original (for example: quarters) dateQuarter could be =4, and after adding to it it could be >=4
        "yearComponentBeyondMod",
        [mod,
            "yearComponentBeyondNoMod",
            "maxNumYearComponents"
        ],
        "yearComponentBeyond",
        [cond,
            [equal, "yearComponentBeyondMod", 0],
            o(
                // so we go from yearComponentBeyondNoMod of 0 to yearComponentBeyond of 4 (i.e. Q4, or Dec)
                { on: true, use: "maxNumYearComponents" },
                { on: false, use: "yearComponentBeyondMod" }
            )
        ],
        "overflowDateYear",
        [plus, "dateYear", "yearComponentBeyondYearIncrement"],
        "beginningDateOfPeriodBeyond",
        [cond,
            "dateResolution",
            o(
                {
                    on: "years",
                    use: "beginningDateOfYearBeyond"
                },
                {
                    on: "quarters",
                    use: [cond,
                        "yearComponentBeyondYearIncrement",
                        o(
                            {
                                on: 0, // i.e. after the hop, we're still in this year
                                use: [generateBeginningOfQuarterDate, "yearComponentBeyond", "dateYear"]
                            },
                            {
                                on: null,
                                use: [generateBeginningOfQuarterDate, "yearComponentBeyond", "overflowDateYear"]
                            }
                        )
                    ]
                },
                {
                    on: "months",
                    use: [cond,
                        "yearComponentBeyondYearIncrement",
                        o(
                            {
                                on: 0,  // i.e. after the hop, we're still in this year
                                use: [generateBeginningOfMonthDate, "yearComponentBeyond", "dateYear"]
                            },
                            {
                                on: null,
                                use: [generateBeginningOfMonthDate, "yearComponentBeyond", "overflowDateYear"]
                            }
                        )
                    ]
                }
            )
        ],
        "beginningDateOfPeriodBeyondAsNum",
        [dateToNum, "beginningDateOfPeriodBeyond", "defaultDateFormat"],
        "value",
        [cond,
            [and,
                // when calculating the next, for years/quarters/months, given that the last bin is closed on both ends, 
                // we need to calculate one day back, so as to calculate [1/1/2017-31/12/2017], and not [1/1/2017-1/1/2018].
                "next",
                [
                    "dateResolution",
                    o("years", "quarters", "months")
                ]
            ],
            o(
                {
                    on: true,
                    use: [minus,
                        "beginningDateOfPeriodBeyondAsNum",
                        secondsInADay
                    ]
                },
                {
                    on: false,
                    use: "beginningDateOfPeriodBeyondAsNum"
                }
            )
        ],
        // end of using
        [cond,
            [arg, "debugDateFunction", false],
            o(
                {
                    on: true,
                    use: {
                        // debug context labels - remove once the code stabilizes
                        overflowDateYear: "overflowDateYear",
                        beginningDateOfPeriodBeyond: "beginningDateOfPeriodBeyond",
                        beyondIncrement: "beyondIncrement",
                        yearComponentBeyondNoMod: "yearComponentBeyondNoMod",
                        yearComponentBeyondYearIncrement: "yearComponentBeyondYearIncrement",
                        yearComponentBeyondMod: "yearComponentBeyondMod",
                        // end of debug context labels - remove once the code stabilizes
                        value: "value"
                    }
                },
                {
                    on: false,
                    use: "value"
                }
            )
        ]
    ]
];