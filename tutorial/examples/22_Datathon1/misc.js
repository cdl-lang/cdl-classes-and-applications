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

initGlobalDefaults.darkPrimaryColor = "#155CCF";
initGlobalDefaults.primaryColor = "#1D7EF8";
initGlobalDefaults.lightPrimaryColor = "#AED5FD";
initGlobalDefaults.iconText = "#FFFFFF";
initGlobalDefaults.accentColor = "#C5D908";
initGlobalDefaults.primaryText = "#212121";
initGlobalDefaults.secondaryText = "#757575";
initGlobalDefaults.divider = "#BDBDBD";
initGlobalDefaults.errorText = "red";

var myContext = [
    defun, "className",
    [first, [[embeddingStar], [areaOfClass, [concatStr, o("className", "Context")]]]]
];

var myClick = [{type: "MouseUp", subType: o("Click", "DoubleClick")}, [myMessage]];

var upArrowEvent = [{type: "KeyDown", key: "Up"}, [myMessage]];
var downArrowEvent = [{type: "KeyDown", key: "Down"}, [myMessage]];
var leftArrowEvent = [{type: "KeyDown", key: "Left"}, [myMessage]];
var rightArrowEvent = [{type: "KeyDown", key: "Right"}, [myMessage]];

var clickableURL = [
    defun, o("text", "title", "url"),
    [concatStr, o(
        "<a href=", "url", " title=\"", "title", "\">", "text", "</a>"
    )]
];

var replaceEmpty = [
    defun, o("expr", "repl"),
    [cond, [empty, "expr"], o({on: true, use: "repl"}, {on: false, use: "expr"})]
];

var mkSel = [
    defun, o("attr", "val"),
    { "#attr": "val" }
];

var classes = {
    /// Very basic ordering of items in a top-to-bottom list
    BasicListInArea: o({
        context: {
            listData: mustBeDefined,
            itemSpacing: 0,
            listOrder: "top-down",
            firstChildOffset: 0
        },
        children: {
            items: {
                data: [{listData: _}, [me]],
                description: {
                    content: [{param: {areaSetContent: _}}, [me]],
                    position: {
                        itemOrder: {
                            "point1.element": [prev],
                            equals: [{itemSpacing: _}, [embedding]]
                        }
                    }
                }
            }
        },
        position: {
            firstChild: {
                "point2.element": [first, [{children: {items: _}}, [me]]],
                equals: [{firstChildOffset: _}, [me]]
            }
        }
    }, {
        qualifier: {listOrder: "top-down"},
        children: {
            items: {
                description: {
                    position: {
                        left: 0,
                        right: 0,
                        itemOrder: {
                            "point1.type": "bottom",
                            "point2.type": "top"
                        }
                    }
                }
            }
        },
        position: {
            firstChild: {
                "point1.type": "top",
                "point2.type": "top"
            }
        }
    }, {
        qualifier: {listOrder: "left-right"},
        children: {
            items: {
                description: {
                    position: {
                        top: 0,
                        bottom: 0,
                        itemOrder: {
                            "point1.type": "right",
                            "point2.type": "left"
                        }
                    }
                }
            }
        },
        position: {
            firstChild: {
                "point1.type": "left",
                "point2.type": "left"
            }
        }
    }),

    Text: {
        display: {
            text: {
                fontFamily: "sans-serif",
                fontSize: 13,
                textAlign: "left"
            }
        }
    },

    Label: {
        "class": "Text",
        display: {
            text: {
                fontWeight: 700,
                color: [{secondaryText: _}, [globalDefaults]],
                value: [{label: _}, [embedding]]
            }
        },
        position: {
            left: 0,
            top: 0,
            bottom: 0,
            width: [displayWidth]
        }
    },

    Value: {
        "class": "Text",
        context: {
            value: [{value: _}, [embedding]]
        },
        display: {
            text: {
                fontWeight: 300,
                overflow: "ellipsis",
                whiteSpace: "nowrap",
                color: [{primaryText: _}, [globalDefaults]],
                value: [{value: _}, [me]]
            }
        },
        position: {
            top: 0,
            bottom: 0,
            right: 4
        }
    },

    LabeledValue: {
        context: {
            label: mustBeDefined,
            value: mustBeDefined
        },
        children: {
            label: {
                description: {
                    "class": "Label"
                }
            },
            value: {
                description: {
                    "class": o("Value"),
                    position: {
                        "class": {name: "LeftOf", element: [{children: {label: _}}, [embedding]], distance: 4}
                    }
                }
            }
        }
    },

    URL: {
        context: {
            label: mustBeDefined,
            value: mustBeDefined,
            text: [{value: _}, [me]]
        },
        children: {
            label: {
                description: {
                    "class": "Label"
                }
            },
            value: {
                description: {
                    context: {
                        value: [clickableURL,
                            [{text: _}, [embedding]],
                            [{value: _}, [embedding]],
                            [{value: _}, [embedding]]
                        ]
                    },
                    display: {
                        html: {
                            fontFamily: "sans-serif",
                            fontSize: 13,
                            fontWeight: 300,
                            value: [{value: _}, [me]]
                        }
                    },
                    position: {
                        "class": {name: "LeftOf", element: [{children: {label: _}}, [embedding]], distance: 4},
                        top: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        }
    },

    MonetaryTextDisplay: {
        textAlign: "right",
        numericFormat: {
            type: "intl",
            numberOfDigits: 2,
            style: "currency",
            currency: "EUR",
            currencyDisplay: "symbol",
            useGrouping: true
        }
    },

    LabeledMonetaryValue: {
        "class": "LabeledValue",
        "children.value.description.display.text.class": "MonetaryTextDisplay"
    },

    // Filps $value (an expression) from true to false or vice versa on click
    FlipButton: {
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchValue: {
                        to: "$value",
                        merge: [not, "$value"]
                    }
                }
            }
        }
    },

    // Filps $label from true to false or vice versa
    SwitchContextLabelOnWrite: {
        to: [{"$label": _}, [me]],
        merge: [not, [{"$label": _}, [me]]]
    },

    LeftOf: {
        leftOf: {
            point1: { type: "right", element: "$element" },
            point2: { type: "left" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    Below: {
        leftOf: {
            point1: { type: "bottom", element: "$element" },
            point2: { type: "top" },
            equals: [replaceEmpty, "$distance", 0]
        }
    }
};
