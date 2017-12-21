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


// %%classfile%%: "../18_BasicClasses/scrollable.js"
// %%classfile%%: "../18_BasicClasses/scrollStep.js"
// %%classfile%%: "../18_BasicClasses/scrollToAnchor.js"
// %%classfile%%: "../18_BasicClasses/scrollbar.js"
// %%include%%: "../../../core/func/eventDefs.js"
// %%classfile%%: "../../../../scripts/feg/test/generalClasses.js"

var clickableURL = [
    defun, o("text", "title", "url"),
    [concatStr, o(
        "<a href=", "url", " title=\"", "title", "\">", "text", "</a>"
    )]
];

var textToChoices = [
    defun, "choices",
    [map,
        [defun, "entry", { text: "entry", value: "entry" }],
        [sort, [_, "choices"], ascending]
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

var classes = {

    //
    // Test layout class
    //
    
    // layout of the scrolled view and the scrollbar
    
    LSScrollableWithScrollbarLayoutExt: o({
        position: {
            top: 5,
            left: 5,
            bottom: 5,
            width: 450
        },

        // two children are positioned: the scrollView and the scrollbar
        
        children: {
            scrollView: {
                description: {
                }
            },
            scrollbar: {
                description: {
                }
            }
        }
    },

    // position scrolled document and scrollbar (depending on whether
    // the scrollbar is vertical or horizontal)

    {
        qualifier: { scrollbarStartEdge: o("top", "bottom") },

        position: {
            alignScrollbarAndDocTop: {
                point1: { type: "top",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "top",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 0
            },
            alignScrollbarAndDocBottom: {
                point1: { type: "bottom",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "bottom",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 0
            },
            
            viewTop: {
                point1: { type: "top" },
                point2: { type: "top",
                            element: [{ children: { scrollView: _ }}, [me]] },
                equals: 1
            },

            viewBottom: {
                point1: { type: "bottom",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "bottom" },
                equals: 1
            },

            scrollbarLeft: {
                point1: { type: "left" },
                point2: { type: "left",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 1
            },

            viewRight: {
                point1: { type: "right",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "right" },
                equals: 10
            },

            gapScrollbarView: {
                point1: { type: "right",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                point2: { type: "left",
                            element: [{ children: { scrollView: _ }}, [me]] },
                equals: 4
            }
        }
    },

    {
        qualifier: { scrollbarStartEdge: o("left", "right") },

        position: {
            alignScrollbarAndDocLeft: {
                point1: { type: "left",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "left",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 0
            },
            alignScrollbarAndDocRight: {
                point1: { type: "right",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "right",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 0
            },
            
            viewLeft: {
                point1: { type: "left" },
                point2: { type: "left",
                            element: [{ children: { scrollView: _ }}, [me]] },
                equals: 10
            },

            viewRight: {
                point1: { type: "right",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "right" },
                equals: 10
            },

            scrollbarBottom: {
                point1: { type: "bottom",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                point2: { type: "bottom" },
                equals: 10
            },

            viewTop: {
                point1: { type: "top" },
                point2: { type: "top",
                            element: [{ children: { scrollView: _ }}, [me]] },
                equals: 10
            },

            gapScrollbarView: {
                point1: { type: "bottom",
                            element: [{ children: { scrollView: _ }}, [me]] },
                point2: { type: "top",
                            element: [{ children: { scrollbar: _ }}, [me]] },
                equals: 7
            }
        }
    }), 

    // determines the layout (but not colors etc. of the scrollbar) 
    
    LSScrollbarLayoutExt: o(
    {
        context: {
            scrollbarGirth: 8
        },
        display: {
            borderRadius: 4,
            background: "white",
            borderStyle: "solid",
            borderColor: "grey",
            borderWidth: 1
        }
    },

    {
        qualifier: { scrollStartEdge: o("top", "bottom") },
        
        position: {
            width: [{ scrollbarGirth: _ }, [me]]
        },
        children: {
            cursor: { description: {
                position: {
                    left: 0,
                    right: 0
                }}}
        }
    },

    {
        qualifier: { scrollStartEdge: o("left", "right") },
        
        position: {
            height: [{ scrollbarGirth: _ }, [me]]
        },
        children: {
            cursor: { description: {
                position: {
                    top: 0,
                    bottom: 0
                }}}
        }
    }),

    //
    // Components of the test
    //

    // the scrolled view
    
    LSScrollView: o(
        {
            children: { scrolledDocument: { description: {
                "class": "DraggableScrolledDocumentExt"
            }}}
        }
    ),

    // The base test scrollbar 
    
    LSScrollbar: o(
        {
            "class": "LSScrollbarLayoutExt",
            
            context: {
                scrollStartEdge: [{ scrollbarStartEdge: _ }, [embedding]]
            },
            display: {
                background: "#d0d0d0"
            },
            children: {
                cursor: { description: {
                    display: {
                        background: "#a0b0b0"
                    }}}
            }
        }
    ),

    //
    // Base test scrollable + scrollbar
    //

    LSScrollableWithScrollbar: o(
        {
            "class": o("LSScrollableWithScrollbarLayoutExt"),

            context: {
                "^itemContext":  o(),

                scrollStartEdge: "top",
                scrollbarStartEdge: "top"
            },

            children: {
                scrollView: { description: {
                    "class": "LSScrollView"
                }},
                scrollbar: {
                    description: {
                        "class": "LSScrollbar"
                    }
                }
            }
        }
    ),
    
    //
    // Various test cases (uniform / non-uniform / indexed scrolling
    //

    LSUniformScrollableWithScrollbar: o(
        {
            "class": o("LSScrollableWithScrollbar",
                       "UniformScrollableWithScrollbar"),
            context: {
                itemSize: 40,
                itemSpacing: 0
            },
            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        children: { itemsInView: { description: {
                            "class": "UniformScrollToAnchorExt"
                        }}}
                    }}}
                }},
                scrollbar: { description: {
                    display: {
                        background: "white"
                    }
                }}
            }
        }
    ),

    // sn extension class, has to be combined with the relevant
    // XScrollableWithScrollbar class (see below).
    
    LSNonUniformScrollableWithScrollbarExt: o(        
        {
            "class": o("LSScrollableWithScrollbarLayoutExt"),

            context: {
                minItemSize: 30,
                minItemSpacing: 5 
            },
            
            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        children: { itemsInView: { description: {
                            "class": "LSNonUniformScrolledItemExt"
                        }}}
                    }}}
                }}
            }
        }
    ),

    // non-uniform (layout based) scrolling
    
    LSNonUniformScrollableWithScrollbar: o(        
        {
            "class": o("LSNonUniformScrollableWithScrollbarExt",
                       "LSScrollableWithScrollbar",
                       "NonUniformScrollableWithScrollbar",
                       "LSScrollableWithScrollbarLayoutExt")
        }
    ),
    
    // indexed scrolling
    
    LSIndexedScrollableWithScrollbar: o(        
        {
            "class": o("LSNonUniformScrollableWithScrollbarExt",
                       "LSScrollableWithScrollbar",
                       "IndexedScrollableWithScrollbar",
                       "LSScrollableWithScrollbarLayoutExt")
        }
    ),
    
    // Scrolled item classes

    // base item class
    
    RowField: {
        context: {
            cci: [{cci: _}, [{ content: _ }, [embedding]]],
            fund: [{fund: _}, [{ content: _ }, [embedding]]],
            category_of_region: [{category_of_region: _}, [{ content: _ }, [embedding]]],
            cciPayments: [
                {cci: [{cci: _}, [me]]},
                [{cciPayments: _}, [areaOfClass, "App"]]
            ],
            payments: [
                {
                    fund: [{fund: _}, [me]],
                    category_of_region: [{category_of_region: _}, [me]]
                },
                [
                    {payments: _},
                    [{cciPayments: _}, [me]]
                ]
            ]
        },
        display: {
            text: {
                fontFamily: "Roboto",
                fontSize: 13,
                textAlign: "left",
                whiteSpace: "nowrap"
            }
        }
    },

    ProgramScrolledItemExt: o(
        {
            children: {
                fund: {
                    description: {
                        "class": "RowField",
                        display: {
                            background: "lightgrey",
                            text: {
                                textAlign: "center",
                                fontWeight: 700,
                                value: [{fund: _}, [{ content: _ }, [embedding]]]
                            }
                        },
                        position: {
                            top: 2, left: 0,
                            width: 36, height: 36
                        }
                    }
                },
                fund_paid: {
                    description: {
                        "class": "RowField",
                        context: {
                            total: [sum, [
                                    {planned_eu_amount: _},
                                    [{payments: _}, [me]]
                                ]],
                            paid: [sum, [
                                    {total_net_payments: _},
                                    [{payments: _}, [me]]
                                ]],
                            rel_paid: [sqrt, [div, [{paid: _}, [me]], [{total: _}, [me]]]]
                        },
                        display: {
                            background: "blue",
                            opacity: 0.4
                        },
                        position: {
                            top: 2, left: 0,
                            width: [floor, [mul, 36, [{rel_paid: _}, [me]]]],
                            height: [floor, [mul, 36, [{rel_paid: _}, [me]]]]
                        }
                    }
                },
                country: {
                    description: {
                        "class": "RowField",
                        display: {
                            text: {
                                fontWeight: 700,
                                value: [concatStr,
                                    [{ms: _}, [{cciPayments: _}, [me]]],
                                    ", "
                                ],
                                verticalAlign: "top",
                                whiteSpace: "normal"
                            }
                        },
                        position: {
                            top: 5, left: 40,
                            width: 100, height: 15
                        }
                    }
                },
                region_prio: {
                    description: {
                        "class": "RowField",
                        display: {
                            text: {
                                value: [concatStr, o(
                                    [{category_of_region: _}, [{content: _}, [embedding]]],
                                    [{priority: _}, [{content: _}, [embedding]]]
                                ), "/"]
                            }
                        },
                        position: {
                            top: 5, left: 140,
                            width: 156, height: 15
                        }
                    }
                },
                title: {
                    description: {
                        "class": "RowField",
                        display: {
                            html: {
                                fontFamily: "Roboto",
                                fontSize: 13,
                                textAlign: "left",
                                whiteSpace: "nowrap",
                                value: [clickableURL,
                                    [{op_short_title: _}, [{cciPayments: _}, [me]]],
                                    [{official_titles: _}, [{cciPayments: _}, [me]]],
                                    [{weblink: _}, [{cciPayments: _}, [me]]]
                                ]
                            }
                        },
                        position: {
                            top: 20, left: 40,
                            width: 220, height: 15
                        }
                    }
                },
                planned_eu_amount: {
                    description: {
                        "class": "RowField",
                        display: {
                            text: {
                                value: [sum, [
                                    {planned_eu_amount: _},
                                    [{payments: _}, [me]]
                                ]],
                                textAlign: "right",
                                numericFormat: {
                                    type: "intl",
                                    numberOfDigits: 2,
                                    style: "currency",
                                    currency: "EUR",
                                    currencyDisplay: "symbol",
                                    useGrouping: true
                                }
                            }
                        },
                        position: {
                            top: 5, left: 300,
                            right: 5, height: 15
                        }
                    }
                },
                paid_eu_amount: {
                    description: {
                        "class": "RowField",
                        display: {
                            text: {
                                value: [sum, [
                                    {total_net_payments: _},
                                    [{payments: _}, [me]]
                                ]],
                                textAlign: "right",
                                numericFormat: {
                                    type: "intl",
                                    numberOfDigits: 2,
                                    style: "currency",
                                    currency: "EUR",
                                    currencyDisplay: "symbol",
                                    useGrouping: true
                                }
                            }
                        },
                        position: {
                            top: 20, left: 300,
                            right: 5, height: 15
                        }
                    }
                }
            }
        },
        
        // set position in non-scroll direction

        {
            qualifier: { scrollStartEdge: o("top", "bottom") },
            position: {
                left: 0,
                right: 0
            }
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            position: {
                top: 0,
                bottom: 0
            }
        }
    ),

    VisScrolledItemExt: o({
        context: {
            label: [{dimensionValue: _}, [{content: _}, [me]]],
            barValues: [{values: _}, [{content: _}, [me]]],
            maxValue: [{maxValue: _}, [embedding]]
        },
        display: {
            borderTopColor: "lightgrey",
            borderTopWidth: 1,
            borderTopStyle: "solid"
        },
        children: {
            label: {
                description: {
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 12,
                            textAlign: "left",
                            whiteSpace: "nowrap",
                            value: [{label: _}, [embedding]]
                        }
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: 14,
                        right: 0
                    }
                }
            },
            barContainer: {
                description: {
                    children: {
                        bar: {
                            data: [div, [{barValues: _}, [embedding]],
                                        [{maxValue: _}, [embedding]]
                                  ],
                            description: {
                                context: {
                                    value: [{param: {areaSetContent: _}}, [me]]
                                },
                                display: {
                                    background: "steelblue"
                                },
                                position: {
                                    top: [plus, [mul, [{param: {areaSetAttr: _}}, [me]], 20], 4],
                                    left: 0,
                                    height: 16,
                                    width: {
                                        pair1: {
                                            point1: {type: "left", element: [embedding]},
                                            point2: {type: "right", element: [embedding]}
                                        },
                                        pair2: {
                                            point1: {type: "left"},
                                            point2: {type: "right"}
                                        },
                                        ratio: [{value: _}, [me]]
                                    }
                                }
                            }
                        }
                    },
                    position: {
                        top: 14,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }
            }
        }
    },
    
    // set position in non-scroll direction
    {
        qualifier: { scrollStartEdge: o("top", "bottom") },
        position: {
            left: 0,
            right: 0
        }
    }, {
        qualifier: { scrollStartEdge: o("left", "right") },
        position: {
            top: 0,
            bottom: 0
        }
    }),

    // Test Item clas for non-uniform item sizes
    
    LSNonUniformScrolledItemExt: o(
        {
            context: {
                // defined if a non-default value was set
                definedItemSize: [{ size: _ },
                                  [{ index: [{ itemIndexInDoc: _ }, [me]] },
                                   [{ itemContext: _ }, [embedding]]]],
                itemSize: [first,
                           o([{ definedItemSize: _ }, [me]],
                             [{ minItemSize: _ }, [embedding]])]
            },
            position: {

                // modified below in case of right-to-left positioning
                
                itemLength: {
                    point1: { type: [{ scrollStartEdge: _ }, [me]] },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    equals: [{ itemSize: _ }, [me]]
                },

                marginFromPrev: {
                    point1: { type: [{ scrollEndEdge: _ }, [me]],
                              element: [prev, [me]] },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    equals: [{ minItemSpacing: _ }, [embedding]]
                }

            },
            write: {
                clickToChangeSize: {
                    upon: [{ type: "MouseUp",
                             subType: o("Click", "DoubleClick") }, [myMessage]],
                    true: {
                        toggleSize: {
                            to: [{ itemSize: _ }, [me]],
                            merge: 100
                        }
                    }
                }
            }
        },

        // position in direction of scrolling for right-to-left scrolling
        
        {
            qualifier: { scrollStartEdge: "right" },

            position: {
                itemLength: {
                    equals: [uminus, [{ itemSize: _ }, [me]]]
                },

                marginFromPrev: {
                    equals: [uminus, [{ minItemSpacing: _ }, [embedding]]]
                }
            }
        },
        
        // set position in non-scroll direction
        
        {
            qualifier: { scrollStartEdge: o("top", "bottom") },
            position: {
                left: 0,
                right: 0
            }
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            position: {
                top: 0,
                bottom: 0
            }
        },
        
        // toggle size back to default
        
        {
            qualifier: { itemSize: 100 },
            write: {
                clickToChangeSize: {
                    true: {
                        toggleSize: {
                            merge: 30
                        }
                    }
                }
            }
        }
    ),

    LSCursor: {
        display: {
            background: "lightgrey",
            borderRadius: 4
        },
        position: {
            left: 1,
            right: 1
        }
    },

    LabeledMonetaryValue: {
        "class": "LabeledTextValue",
        children: {
            value: {
                description: {
                    display: {
                        text: {
                            textAlign: "right",
                            numericFormat: {
                                type: "intl",
                                numberOfDigits: 2,
                                style: "currency",
                                currency: "EUR",
                                currencyDisplay: "symbol",
                                useGrouping: true
                            }
                        }
                    }
                }
            }
        }
    }
};

var stackedBarColors = o(
    "#2AADE5", "#9DD82C", "#FFB63F", "#67CAFF", "#DC7CC3", "#F4CB10", "#78ACBC",
    "#C2BA94", "#14B0C4", "#D1D900", "#8394FF"
);

var screenArea = {
    "class": "App",
    context: {
        allData: [{data: _}, [datatable, "../../../../data/ESIF/planned_vs_implemented.grouped.json"]],
        cciPayments: [{data: _}, [datatable, "../../../../data/ESIF/cci_payments.grouped.json"]],

        "^selectedCountry": true,
        // ccisForSelectedCountry: [
        //     {ms: [{selectedCountry: _}, [me]], cci: _},
        //     [{cciPayments: _}, [me]]
        // ],
        ccisForSelectedCountry: [_,
        [
            {cci: _},
            [
                {ms: [{selectedCountry: _}, [me]]},
                [{cciPayments: _}, [me]]
            ]
        ]],
        data2: [
            { cci: [{ccisForSelectedCountry: _}, [me]] },
            [{allData: _}, [me]]
        ],

        "^selectedEconomicActivity": true,
        data3: [cond, [equal, [{selectedEconomicActivity: _}, [me]], true], o(
            {
                on: true,
                use: [{data2: _}, [me]]
            }, {
                on: false,
                use: [
                    { "Economic Activity": {dimension_title: [{selectedEconomicActivity: _}, [me]]} },
                    [{data2: _}, [me]]
                ]
            }
        )],

        "^selectedInterventionField": true,
        data4: [
            { InterventionField: {dimension_title: [{selectedInterventionField: _}, [me]]} },
            [{data3: _}, [me]]
        ],

        data: [{data4: _}, [me]]
    },
    children: {
        selectedCountry: {
            description: {
                "class": "LabeledChoiceInput",
                context: {
                    label: "Country",
                    value: [{selectedCountry: _}, [embedding]],
                    choices: o(
                        { text: "All", value: true },
                        { text: "Austria", value: "AT" },
                        { text: "Belgium", value: "BE" },
                        { text: "Bulgaria", value: "BG" },
                        { text: "Croatia", value: "HR" },
                        { text: "Cyprus", value: "CY" },
                        { text: "Czech Republic", value: "CZ" },
                        { text: "Germany", value: "DE" },
                        { text: "Denmark", value: "DK" },
                        { text: "Estonia", value: "EE" },
                        { text: "Spain", value: "ES" },
                        { text: "Finland", value: "FI" },
                        { text: "France", value: "FR" },
                        { text: "Greece", value: "GR" },
                        { text: "Hungary", value: "HU" },
                        { text: "Interregional", value: "TC" },
                        { text: "Ireland", value: "IE" },
                        { text: "Italy", value: "IT" },
                        { text: "Lithuania", value: "LT" },
                        { text: "Luxemburg", value: "LU" },
                        { text: "Latvia", value: "LV" },
                        { text: "Malta", value: "MT" },
                        { text: "Netherlands", value: "NL" },
                        { text: "Poland", value: "PL" },
                        { text: "Portugal", value: "PT" },
                        { text: "Romania", value: "RO" },
                        { text: "Sweden", value: "SE" },
                        { text: "Slovenia", value: "SI" },
                        { text: "Slovak Republic", value: "SK" },
                        { text: "United Kingdom", value: "UK" }
                    ),
                    validFun: true,
                    editable: true
                },
                position: {
                    top: 0,
                    left: 5,
                    height: 20,
                    width: 200
                }
            }
        },
        selectedEconomicActivity: {
            description: {
                "class": "LabeledChoiceInput",
                context: {
                    label: "Economic Activity",
                    value: [{selectedEconomicActivity: _}, [embedding]],
                    choices: o(
                        { text: "All", value: true },
                        [textToChoices, 
                            [
                                { "Economic Activity": {dimension_title: _}},
                                [{data2: _}, [embedding]]
                            ]
                        ]
                    ),
                    validFun: true,
                    editable: true
                },
                position: {
                    top: 20,
                    left: 5,
                    height: 20,
                    width: 200
                }
            }
        },
        selectedInterventionField: {
            description: {
                "class": "LabeledChoiceInput",
                context: {
                    label: "Intervention Field",
                    value: [{selectedInterventionField: _}, [embedding]],
                    choices: o(
                        { text: "All", value: true },
                        [textToChoices, 
                            [
                                { InterventionField: {dimension_title: _}},
                                [{data2: _}, [embedding]]
                            ]
                        ]
                    ),
                    validFun: true,
                    editable: true
                },
                position: {
                    top: 40,
                    left: 5,
                    height: 20,
                    width: 200
                }
            }
        },
        entries: {
            description: {
                "class": o("LSUniformScrollableWithScrollbar"),
                context: {
                    scrolledData: [{data: _}, [embedding]]
                },
                display: {
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "grey"
                },
                children: {
                    prevNextController: {
                        description: {
                            "class": o("UniformScrollToPrevItemController",
                                       "UniformScrollToNextItemController"),
                            write: {
                                scrollToPrev: {
                                    upon: o(upArrowEvent, leftArrowEvent)
                                },
                                scrollToNext: {
                                    upon: o(downArrowEvent, rightArrowEvent)
                                }
                            },
                            position: {
                                frame: 0
                            }
                        }
                    },
                    scrollbar: {
                        description: {
                            children: {
                                cursor: {
                                    description: {
                                        "class": "LSCursor"
                                    }
                                }
                            }
                        }
                    },
                    scrollView: { description: { children: {
                        scrolledDocument: { description: { children: {
                            itemsInView: { description: {
                                "class": "ProgramScrolledItemExt"
                            }}
                        }}}
                    }}}
                },
                position: {
                    top: 60
                }
            }
        },
        planned_eu_amount: {
            description: {
                "class": "LabeledMonetaryValue",
                context: {
                    label: "planned_eu_amount",
                    value: [sum,
                        [
                            {
                                InterventionField: {
                                    planned_eu_amount: _,
                                    dimension_title: [{selectedInterventionField: _}, [embedding]]
                                }
                            },
                            [{data: _}, [embedding]]
                        ]
                    ]
                },
                position: {
                    left: 500,
                    top: 20,
                    width: 500,
                    height: 20
                }
            }
        },
        planned_total_amount_notional: {
            description: {
                "class": "LabeledMonetaryValue",
                context: {
                    label: "planned_total_amount_notional",
                    value: [sum,
                        [
                            {
                                InterventionField: {
                                    planned_total_amount_notional: _,
                                    dimension_title: [{selectedInterventionField: _}, [embedding]]
                                }
                            },
                            [{data: _}, [embedding]]
                        ]
                    ]
                },
                position: {
                    left: 500,
                    top: 40,
                    width: 500,
                    height: 20
                }
            }
        },

        stackedBarSplitByCountry: { description: {
            context: {
                data: [{data: _}, [embedding]],
                domain:  [sort,
                    [_,
                        [
                            {ms: _},
                            [{cciPayments: _}, [embedding]]
                        ]
                    ],
                    ascending
                ]
            },
            children: {
                bars: {
                    data: [{domain: _}, [me]],
                    description: {
                        context: {
                            label: [{param: {areaSetContent: _}}, [me]],
                            index: [index,
                                [{domain: _}, [embedding]],
                                [{param: {areaSetContent: _}}, [me]]
                            ],
                            value: [sum,
                                [
                                    {
                                        InterventionField: {
                                            planned_eu_amount: _,
                                            ms: [{label: _}, [me]]
                                        }
                                    },
                                    [{data: _}, [embedding]]
                                ]
                            ],
                            totalSum: [sum,
                                [
                                    {
                                        InterventionField: {
                                            planned_eu_amount: _
                                        }
                                    },
                                    [{data: _}, [embedding]]
                                ]
                            ],
                            relWidth: [div, [{value: _}, [me]], [{totalSum: _}, [me]]]
                        },
                        display: {
                            borderLeftWidth: 1,
                            borderLeftStyle: [
                                cond, [{index: _}, [me]], o(
                                    { on: r(1, Infinity), use: "solid" }
                                )],
                            borderLeftColor: "white",
                            background: [pos,
                                [mod, [{index: _}, [me]], [size, stackedBarColors]],
                                stackedBarColors
                            ],
                            text: {
                                fontFamily: "Roboto",
                                fontSize: 10,
                                color: "white",
                                value: [{label: _}, [me]]
                            },
                            hoverText: [concatStr, o(
                                [{label: _}, [me]],
                                ": €",
                                [translateNumToSuffixBaseFormat,
                                    [{value: _}, [me]], "financialSuffix", 0, true
                                ]
                            )]
                        },
                        position: {
                            top: 0,
                            bottom: 0,
                            relWidth: {
                                pair1: {
                                    point1: { type: "left", element: [embedding] },
                                    point2: { type: "right", element: [embedding] }
                                },
                                pair2: {
                                    point1: { type: "left" },
                                    point2: { type: "right" }
                                },
                                ratio: [{relWidth: _}, [me]]
                            },
                            ltr: {
                                point1: { type: "right", element: [prev] },
                                point2: { type: "left" },
                                equals: 0
                            }
                        }
                    }
                }
            },
            position: {
                top: 60,
                left: 500,
                height: 60,
                right: 5
            }
        }}

        /*vis1: { description: {
            "class": o("LSUniformScrollableWithScrollbar"),
            context: {
                itemSize: 54,
                itemSpacing: 2,

                dimensionValues:  [sort,
                    [_,
                        [
                            {Location: {dimension_title: _}},
                            [{data: _}, [embedding]]
                        ]
                    ],
                    ascending
                ],

                data: [map,
                    [defun, "dimensionValue",
                        [using,
                            "data", [
                                { dimension_title: "dimensionValue" },
                                [
                                    { Location: _ },
                                    [{data: _}, [embedding]]
                                ]
                            ],
                            {
                                dimensionValue: "dimensionValue",
                                values: o(
                                    [sum, [
                                        {eu_eligible_costs_selected_fin_data_notional: _},
                                        "data"
                                        ]
                                    ],
                                    [sum, [
                                        {eu_elig_expenditure_declared_fin_data_notional: _},
                                        "data"
                                        ]
                                    ]
                                )
                            }
                        ]
                    ],
                    [{dimensionValues: _}, [me]]
                ],

                allValues: [{data: {values: _}}, [me]],
                minValue: [min, [{allValues: _}, [me]]],
                maxValue: [max, [{allValues: _}, [me]]],

                scrolledData: [{data: _}, [me]]
            },
            display: {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "grey"
            },
            children: {
                prevNextController: {
                    description: {
                        "class": o("UniformScrollToPrevItemController",
                                    "UniformScrollToNextItemController"),
                        write: {
                            scrollToPrev: {
                                upon: o(upArrowEvent, leftArrowEvent)
                            },
                            scrollToNext: {
                                upon: o(downArrowEvent, rightArrowEvent)
                            }
                        },
                        position: {
                            frame: 0
                        }
                    }
                },
                scrollbar: {
                    description: {
                        children: {
                            cursor: {
                                description: {
                                    "class": "LSCursor"
                                }
                            }
                        }
                    }
                },
                scrollView: { description: { children: {
                    scrolledDocument: { description: {
                        context: {
                            maxValue: [{maxValue: _}, [embedding, [embedding]]]
                        },
                        children: {
                            itemsInView: { description: {
                                "class": "VisScrolledItemExt"
                            }}
                        }
                    }}
                }}}
            },
            position: {
                top: 60,
                left: 550
            }
        }}*/
    }
};

/*
  {
    "cci": "2014AT05SFOP001",
    "fund": "ESF",
    "category_of_region": "More developed",
    "priority": "1",
    "Economic Activity": [
      {
        "dimension_code": 21,
        "dimension_title": "Social work activities, community, social and personal servi",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1150000,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2300000,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2300000
      },
      {
        "dimension_code": 24,
        "dimension_title": "Other unspecified services",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 88056,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 176112,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 176112
      }
    ],
    "EsfSecondaryTheme": [
      {
        "planned_eu_amount": 884000,
        "planned_total_amount_notional": 1768000,
        "dimension_code": 1,
        "dimension_title": "Supporting the shift to a low-carbon, resource efficient ",
        "eu_cofinancing_rate": 50,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF"
      },
      {
        "planned_eu_amount": 25558000,
        "planned_total_amount_notional": 51116000,
        "dimension_code": 2,
        "dimension_title": "Social innovation",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 34272,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 68544,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 68544
      },
      {
        "planned_eu_amount": 10808000,
        "planned_total_amount_notional": 21616000,
        "dimension_code": 6,
        "dimension_title": "Non-discrimination",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1150000,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2300000,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2300000
      },
      {
        "planned_eu_amount": 14750000,
        "planned_total_amount_notional": 29500000,
        "dimension_code": 7,
        "dimension_title": "Gender equality",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 53784,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 107568,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 107568
      }
    ],
    "FinanceForm": [
      {
        "planned_eu_amount": 52000000,
        "planned_total_amount_notional": 104000000,
        "dimension_code": 1,
        "dimension_title": "Non-repayable grant",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1238056,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2476112,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2476112
      }
    ],
    "InterventionField": [
      {
        "planned_eu_amount": 29500000,
        "planned_total_amount_notional": 59000000,
        "dimension_code": 105,
        "dimension_title": "Equality between men and women in all areas, including in access to employment, career progression,  reconciliation of work and private life and  promotion of equal pay for equal work",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 53784,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 107568,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 107568
      },
      {
        "planned_eu_amount": 22500000,
        "planned_total_amount_notional": 45000000,
        "dimension_code": 107,
        "dimension_title": "Active and healthy ageing",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1184272,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2368544,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2368544
      }
    ],
    "Location": [
      {
        "dimension_code": "AT",
        "dimension_title": "ÖSTERREICH",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1150000,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2300000,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2300000
      },
      {
        "dimension_code": "AT130",
        "dimension_title": "Wien",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 88056,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 176112,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 176112
      }
    ],
    "Territorial Delivery Mechanism": [
      {
        "planned_eu_amount": 52000000,
        "planned_total_amount_notional": 104000000,
        "dimension_code": 7,
        "dimension_title": "Not applicable",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1238056,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2476112,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2476112
      }
    ],
    "Territory": [
      {
        "planned_eu_amount": 3078584,
        "planned_total_amount_notional": 6157168,
        "dimension_code": 2,
        "dimension_title": "Small Urban areas (intermediate density >5 000 population)",
        "eu_cofinancing_rate": 50,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF"
      },
      {
        "planned_eu_amount": 4877956,
        "planned_total_amount_notional": 9755912,
        "dimension_code": 3,
        "dimension_title": "Rural areas (thinly populated)",
        "eu_cofinancing_rate": 50,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF"
      },
      {
        "planned_eu_amount": 40000000,
        "planned_total_amount_notional": 80000000,
        "dimension_code": 7,
        "dimension_title": "Not applicable",
        "eu_cofinancing_rate": 50,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF"
      },
      {
        "planned_eu_amount": 4043460,
        "planned_total_amount_notional": 8086920,
        "dimension_code": 1,
        "dimension_title": "Large Urban areas (densely populated >50 000 population)",
        "eu_cofinancing_rate": 50,
        "eu_elig_expenditure_declared_fin_data_notional": 0,
        "eu_eligible_costs_selected_fin_data_notional": 1238056,
        "financial_data_version": "201701.0",
        "ms": "AT",
        "programme_version": "1.3",
        "public_eligible_costs_fin_data": 2476112,
        "queried_fin_data_version": "201701",
        "title": "Employment Austria - ESF",
        "to": 8,
        "total_elig_expenditure_declared_fin_data": 0,
        "total_eligible_costs_selected_fin_data": 2476112
      }
    ]
  }

  {
    "cci": "2014AT06RDNP001",
    "country": [
      "Austria"
    ],
    "dg": "6",
    "fundcombo": "EAFRD",
    "mono_multi": "Mono-fund",
    "ms": [
      "AT"
    ],
    "natord": "2",
    "nature": "NP",
    "official_titles": "Austria - Rural Development Programme (National)",
    "op_short_title": "Austria - National Rural Development",
    "scope": "National",
    "type": "RD",
    "weblink": "http://ec.europa.eu/agriculture/rural-development-2014-2020/country-files/at_en.htm",
    "payments": [
      {
        "annual_pre_financing_covered_by_expenditure": 0,
        "cumulative_additional_initial_pre_financing": 0,
        "cumulative_annual_pre_financing": 0,
        "cumulative_initial_pre_financing": 118126559.91,
        "cumulative_interim_payments": 1212647981.5,
        "eu_payment_rate": 0.338,
        "fund": "EAFRD",
        "net_additional_initial_pre_financing": 0,
        "net_annual_pre_financing": 0,
        "net_initial_pre_financing": 118126559.91,
        "net_interim_payments": 1212647981.5,
        "planned_eu_amount": 3937551997,
        "recovery_of_additional_initial_pre_financing": 0,
        "recovery_of_annual_pre_financing": 0,
        "recovery_of_expenses": 0,
        "total_net_payments": 1330774541.41
      }
    ]
  }
*/
