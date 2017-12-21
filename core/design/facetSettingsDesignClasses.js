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

// add to initGlobalDefaults used by [globalDefaults]
initGlobalDefaults.fspDesignConstants = {
    labelTextSize: { "V1": 11, "V2": 14, "V3": 16 }
};

var classes = {

    //////////////////////////////////////////////////////
    FSPControllerDesign: {
        "class": "AppControlDesign",
        context: {
            // AppControlDesign params
            imgSrc: "%%image:(settingsControl.svg)%%",
            imgAlt: "Facet Settings"
        }
    },

    //////////////////////////////////////////////////////
    /*FSPNameLabelDesign: {        
        "class": o("BackgroundColor", "FacetNameDesign"),
        context: {
            backgroundColor: "#C9C9C9",
            textColor: "black",
        }, 
        display: {
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            paddingBottom: 5,
        }           
    },*/

    //////////////////////////////////////////////////////
    FSPLabelsDesign: {
        "class": o("DefaultDisplayText"),
        context: {
            textSize: [densityChoice, [{ fspDesignConstants: { labelTextSize: _ } }, [globalDefaults]]],
            textColor: [{ generalDesign: { appBlueTextColor:_ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    FilterTypeControlElementDesign: o(
        { // default
            "class": o("TextAlignCenter", "SelectableBlueButtonDesign")
        },
        {
            qualifier: { enabled: false },
            "class": "BackgroundColor",
            context: {
                backgroundColor: "#eeeeee",
                textColor: "#dbdbdb"
            }
        }
    ),

    //////////////////////////////////////////////////////
    FSPNumericFormattingGridCellDesign: {
        "class": "SelectableBlueButtonDesign"
    },

    //////////////////////////////////////////////////////
    FacetDescriptionTextDesign: o(
        {
            "class": o("BackgroundColor", "DefaultDisplayText"),
            context: {
                textSize: 13,
                textColor: "black",
                backgroundColor: "#C9C9C9",
            },
            display: {
                text: {
                    verticalAlign: "middle"
                },
            }
        },
        {
            qualifier: { editInputText: false },
            display: {
                paddingLeft: [{ horizontalPadding: _ }, [me]],
                paddingRight: [{ horizontalPadding: _ }, [me]],
                paddingTop: 4,
                paddingBottom: 4,
            }
        },
        {
            qualifier: { editInputText: true },
            display: {
                paddingLeft: [{ horizontalPadding: _ }, [me]],
                paddingRight: [{ horizontalPadding: _ }, [me]],
                paddingTop: [{ inputTextVerticalPadding: _ }, [me]],
                paddingBottom: [{ inputTextVerticalPadding: _ }, [me]],
            }
        }
    ),


    //////////////////////////////////////////////////////
    /*FacetTypeSelectorDesign: o(
        { // default
            "class": o("Border", "Circle"),
            context: {
                borderColor: [cond,
                              [{ enabled:_ }, [me]],
                              o({ on: true, use: "#a09e9f" },
                                { on: false, use: "grey" }
                               )
                             ],
                radius: 5
            }
        },
        {
            qualifier: { selected: true },
            children: {
                selectionDot: {
                    description: {
                        "class": o("BackgroundColor", "Circle"),
                        context: {
                            backgroundColor: [cond,
                                              [{ enabled:_ }, [me]],
                                              o({ on: true, use: "#5b5b5b" },
                                                { on: false, use: "grey" }
                                               )
                                            ],
                            radius: 3
                        },
                        position: {
                            "class": "AlignCenterWithEmbedding"
                        }
                    }
                }
            }
        }       
    ),*/

    //////////////////////////////////////////////////////
    /*FacetTypeNameDesign: o(
        { // default
            "class": "DefaultDisplayText"
        },
        {
            qualifier: { enabled: false },
            context: {
                textColor: "grey"
            }
        }
    )  */

    //////////////////////////////////////////////////////
    FSPStringHyperlinkControlSelectionControlDesign: {
        "class": "SelectionControlDesign"
    },

    //////////////////////////////////////////////////////
    FSPStringHyperlinkTitleDesign: {
        "class": "FSPLabelsDesign"
    },

    //////////////////////////////////////////////////////
    FSPStringHyperlinkControlEnabledDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: designConstants.selectedColor
        }
    },

    //////////////////////////////////////////////////////
    FSPStringHyperlinkTextInputDesign: {
        "class": o("DefaultDisplayText", "BackgroundColor", "Border"),
        context: {
            borderColor: designConstants.blueButtonBorderColor
        }
    },

    //////////////////////////////////////////////////////
    FSPStringHyperlinkQuestionMarkDesign: {
        "class": "InfoIconableDesign"
    },

    //////////////////////////////////////////////////////
    FSPStringHyperlinkInfoIconDesign: {
        "class": "InfoIconDesign"
    }
};

