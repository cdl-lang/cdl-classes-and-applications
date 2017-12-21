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

    //////////////////////////////////////////////////////
    CalculatorInputFieldContainerDesign: {
        "class": o("InsetDropShadow", "Border"),
        context: {
            borderColor: "#8a8a8a"
        },
        display: {
            boxShadow: {
                color: "rgba(0,0,0,0.1)",
                blurRadius: 3,
                spread: 1,
                horizontal: 0,
                vertical: 0
            }
        }
    },

    //////////////////////////////////////////////////////
    CalculatorInputFieldDesign: {
        "class": o("CalculatorInputFieldTextDesign", "BackgroundColor")
    },

    //////////////////////////////////////////////////////
    CalculatorInputFieldTextDesign: {
        "class": o("TextItalic", "DefaultDisplayText"),
        context: {
            displayTextDefined: true, // override the DefaultDisplayText definition, so that the display object will be defined
            // which is needed for the CalculatorInputField, where we run a [displayWidth]
            textSize: 10,
            textColor: "#9d9d9d"
        },
    },

    //////////////////////////////////////////////////////
    CalculatorInputElementDesign: o(
        { // default
            "class": "DefaultDisplayText",
            context: {
                padding: 0 // default value
            },
            display: {
                padding: [{ padding: _ }, [me]]
            }
        },
        {
            qualifier: { selected: true },
            "class": "BackgroundColor",
            context: {
                textColor: designConstants.globalBGColor,
                backgroundColor: "#b1d7fe"
            }
        },
        {
            qualifier: {
                isRefElement: true,
                liveRefElementName: false
            },
            context: {
                textColor: "lightgrey" // awaiting spec from yuval.
            }
        }
    ),

    //////////////////////////////////////////////////////
    CalculatorInputCursorDesign: {
        "class": "BackgroundColor",
        context: {
            beatDuration: 0.5,
            cycleDuration: [mul, [{ beatDuration: _ }, [me]], 2],
            backgroundColor: [cond,
                [and,
                    [greaterThan,
                        [mod, // every second beat will have a [mod, cycleDuration] that's greater than beatDuration, and that is the beating we'll get.
                            [time, true, [{ beatDuration: _ }, [me]], Number.POSITIVE_INFINITY], // this function will return the time in seconds, every 0.5 seconds forever
                            [{ cycleDuration: _ }, [me]]
                        ],
                        [{ beatDuration: _ }, [me]]
                    ],
                    [not, [{ typeAheadTextInput: _ }, [me]]]
                ],
                o(
                    { on: true, use: "black" },
                    { on: false, use: "transparent" }
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    CalculatorEquationSymbolDesign: {
        "class": "DefaultDisplayText"
    },

    //////////////////////////////////////////////////////
    CalculatorButtonCoreDesign: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "BackgroundColor"),
            context: {
                //backgroundColor: "pink",
                textColor: "#a0a0a0",
                textSize: 14
            },
        }
        /*{
            qualifier: { show: true },
            "class": "Border",
            context: {
                borderColor: "#585858"
            }
        }       */
    ),

    //////////////////////////////////////////////////////
    CalculatorRefElementsDropDownDesign: {
        "class": "DropDownMenuableMatchingMenuDesign"
    },

    //////////////////////////////////////////////////////
    CalculatorRefElementsMenuDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showTopBorder: false
            }
        },
        { // default
            "class": "DropDownMenuBorderDesign"
        },
        {
            qualifier: { showTopBorder: false },
            display: {
                borderTopWidth: 0
            }
        }
    ),

    //////////////////////////////////////////////////////
    CalculatorRefElementsMenuLineDesign: {
        "class": "RefElementsMenuLineDesign"
    },

    // For dropDownmenu search box: background colour white, border 1px a0a0a0, "search facets" text inside Roboto Medium Italic size 12px colour b5b5b5.

    //////////////////////////////////////////////////////
    CalculatorButtonDesign: o(
        { // default
            "class": "CalculatorButtonCoreDesign"
        },
        {
            qualifier: { functionButton: true },
            "class": o("Border"), //"TextBold",
            context: {
                //textColor: "#DCDCDC",
                textColor: designConstants.blueButtonTextColor,
                borderColor: designConstants.blueButtonBorderColor,
                backgroundColor: designConstants.standardBlueColor
                //[generateHSL, designConstants.standardBlueColorHSL]
            }
        }
        /*{
            qualifier: { disabled: true },
            context: {
                borderColor: "#c7c7c7",
                textColor: "#c7c7c7"
            }
        },
        {
            qualifier: { allClearButton: true },
            context: {
                backgroundColor: "#9aa47a",
                textColor: "white"
            }
        }*/
    ),

    //////////////////////////////////////////////////////
    CalculatorInputFieldDocDesign: o(
        /*{
            //default
            "class": "BackgroundColor"
        },*/
        {
            qualifier: { separateInputIntoElements: false },
            "class": "DefaultDisplayText"
        }
    ),

    //////////////////////////////////////////////////////
    TestCalculatorInputElementDesign: o(
        { // default
            "class": "DefaultDisplayText",
            context: {
                textSize: 14,
                textColor: "#6f6f6f"
            }
        },
        {
            qualifier: {
                isRefElement: true,
                liveRefElementName: false
            },
            context: {
                textColor: designConstants.fadedFGColor
            }
        }
    )
};
