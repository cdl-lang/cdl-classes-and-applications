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

// %%classfile%%: <generalDesignClasses.js>

initGlobalDefaults.histogramDesign = {
    primaryLabelTextSize: { "V1": 8, "V2": 9, "V3": 11 },
    secondaryLabelTextSize: { "V1": 7, "V2": 8, "V3": 9 },
    binBorderColor: "#e2e2e2",
    binBorderColorEmphasized: "#a3a3a3",
    binInnerBorderStyle: "solid"
};

var classes = {

    //////////////////////////////////////////////////////
    AddNewHistogramControlDesign: {
        "class": o("FSAppControlCoreBackgroundDesign", "FSAppControlCoreTextDesign"),
        context: {
            displayText: "+"
        }
    },

    //////////////////////////////////////////////////////
    HistogramViewDesign: o(
        { // default
            "class": "Border",
            context: {
                borderColor: "#a0a0a0"
            },
        },
        {
            qualifier: { ofVerticalElement: false },
            display: {
                borderLeftWidth: [{ histogramPosConst: { histogramViewBeginningBorderWidth: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            display: {
                borderBottomWidth: [{ histogramPosConst: { histogramViewBeginningBorderWidth: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramBinEmphasisDesign: {
        "class": "BackgroundColor",
        context: {
            color: designConstants.onHoverColor
        }
    },

    //////////////////////////////////////////////////////
    HistogramBinDesign: o(
        { // default
            display: {
                borderColor: [{ histogramDesign: { binBorderColor:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            display: {
                borderTopStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]],
                borderBottomStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                firstBin: false
            },
            display: {
                borderTopStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                lastBin: false
            },
            display: {
                borderBottomStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            display: {
                borderLeftStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]],
                borderRightStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                firstBin: false
            },
            display: {
                borderLeftStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                lastBin: false
            },
            display: {
                borderRightStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramBarDesign: o(
        { // default
            "class": "BackgroundColor"
            // display: opacity is 1, by default 
        },
        {
            qualifier: {
                anOverlayIsReadyToHide: true,
                myOverlayIsReadyToHide: false
            },
            display: {
                opacity: [{ generalDesign: { darkElementInFocusOpacity: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramBaseBarDesign: {
        "class": "HistogramBarDesign",
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    HistogramSolutionSetBarDesign: {
        "class": "HistogramBarDesign",
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    HistogramImplicit1DSetBarDesign: {
        "class": o("HistogramBarDesign", "Border"),
        context: {
            borderColor: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    HistogramBarValDisplayDesign: {
        "class": o("BackgroundColor", "HistogramNumericFormat", "TextAlignCenter"),
        context: {
            padding: 2
        },
        display: {
            padding: [{ padding: _ }, [me]],
            text: {
                fontSize: 9,
                color: "#b1b1b1"
            }
        }
    },

    //////////////////////////////////////////////////////
    HistogramScalePrimaryLabelDesign: {
        "class": "HistogramScaleLabelDesign",
        context: {
            textSize: [densityChoice, [{ histogramDesign: { primaryLabelTextSize: _ } }, [globalDefaults]]],
            textColor: [{ generalDesign: { scalePrimaryLabelTextColor:_ } }, [globalDefaults]],
            tickmarkSize: [{ fsPosConst: { primaryTickmarkSize: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    HistogramScaleSecondaryLabelDesign: {
        "class": "HistogramScaleLabelDesign",
        context: {
            textSize: [densityChoice, [{ histogramDesign: { secondaryLabelTextSize: _ } }, [globalDefaults]]],
            textColor: [{ generalDesign: { scalePrimaryLabelTextColor:_ } }, [globalDefaults]],
            tickmarkSize: [{ fsPosConst: { secondaryTickmarkSize: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    HistogramNumericFormat: {
        "class": o("NumericFormat", "DefaultDisplayText"),
        context: {
            numericFormatType: [{ myHistogramCanvas: { numericFormatType: _ } }, [me]],
            numberOfDigits: [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]],
            commaDelimited: [{ myHistogramCanvas: { commaDelimited: _ } }, [me]],

            numericFormat: {
                type: [{ numericFormatType: _ }, [me]],
                numberOfDigits: [{ numberOfDigits: _ }, [me]],
                useGrouping: [{ commaDelimited: _ }, [me]]
            }            
        }
    },

    //////////////////////////////////////////////////////
    HistogramScaleUnitOrDistControlDesign: {
        //inheriting ScaleEditControlDesign first to remove the bottom padding defined in HistogramScaleControlDesign
        "class": o("ScaleEditControlDesign", "HistogramScaleControlDesign")
    },

    //////////////////////////////////////////////////////
    HistogramScaleLabelDesign: {
        "class": "HistogramNumericFormat",
        display: {
            paddingBottom: 1
        }
    },

    //////////////////////////////////////////////////////
    HistogramScaleLabelTickmarkDesign: {
        "class": o("HistogramScaleTickmarkDesign", "ScaleLabelTickmarkDesign")
    },

    //////////////////////////////////////////////////////
    HistogramScaleUnlabeledTickmarkDesign: {
        "class": o("HistogramScaleTickmarkDesign", "ScaleUnlabeledTickmarkDesign")
    },

    //////////////////////////////////////////////////////
    HistogramScaleTickmarkDesign: {
        // "ScaleTickmarkDesign" inherited via ScaleLabelTickmarkDesign/ScaleUnlabeledTickmarkDesign
    },

    //////////////////////////////////////////////////////
    HistogramScalePrimaryCrossbarDesign: o(
        {
            qualifier: { isDisplayed: true },
            "class": "HistogramScaleCrossbarDesign",
            context: {
                borderColor: "#d8d8d8"
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramScaleSecondaryCrossbarDesign: o(
        {
            qualifier: { isDisplayed: true },

            "class": "HistogramScaleCrossbarDesign",

            context: {
                borderColor: "#e4e4e4"
            },

            display: {
                borderStyle: "dotted"
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramScaleCrossbarDesign: {
        "class": "Border"
    },

    //////////////////////////////////////////////////////
    HistogramScaleControlDisplayDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            textSize: 9,
            textColor: "#464646"
        }
    },

    //////////////////////////////////////////////////////
    HistogramScaleLinearOrLogControlDesign: {
        "class": "HistogramScaleControlDesign"
    },

    //////////////////////////////////////////////////////
    HistogramScaleControlDesign: {
        "class": "ScaleEditControlDesign",
        display: {
            // to make its baseline is aligned with HistogramScaleLabeledTickmark 
            paddingBottom: 3
        }
    },

    //////////////////////////////////////////////////////
    HistogramMeasureTitleElementDesign: {
        "class": "DefaultDisplayText"
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFacetNameDesign: {
        "class": o("TextOverflowEllipsisDesign", "HistogramMeasureTitleElementDesign")
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFunctionNameDesign: {
        "class": "HistogramMeasureTitleElementDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMeasurePanelControlDesign: {
        "class": "OnHoverFrameDesign",
        context: {
            imgSrc: "%%image:(formula.svg)%%",
            imgAlt: "Formula"
        }
    },

    //////////////////////////////////////////////////////
    HistogramDropDownDesign: o(
        { // default
            "class": o("TextAlignCenter", "BackgroundColor", "DropDownMenuableMatchingMenuDesign", "TextOverflowEllipsisDesign"),
            context: {
                borderWidth: 0,
                dropDownMenuShowControlBackgroundColor: [{ backgroundColor: _ }, [me]],
                dropDownMenuShowControlTriangleColor: "#9a9a9a"
            }
        },
        {
            qualifier: { displayDropDownShowControl: true },
            context: {
                backgroundColor: "#ededed"
            }
        },
        {
            qualifier: {
                displayMenuSelection: true,
                dropDownMenuLogicalSelection: false
            },
            context: {
                textColor: [{ generalDesign: { appBlueTextColor: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramMeasureFacetDropDownDesign: {
        "class": "HistogramDropDownDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMenuDesign: {
        "class": "DropDownMenuBorderDesign",
        context: {
            borderWidth: 0,
            backgroundColor: [{ myDropDownMenuable: { backgroundColor: _ } }, [me]],
            horizontalMarginFromSearchBox: [densityChoice, [{ histogramPosConst: { dropDownMenuSearchBoxMargin: _ } }, [globalDefaults]]],
            verticalMarginFromSearchBox: [densityChoice, [{ histogramPosConst: { dropDownMenuSearchBoxMargin: _ } }, [globalDefaults]]]
        },
        children: {
            searchbox: {
                description: {
                    context: {
                        borderBottomWidth: 0 // override default value
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFacetMenuDesign: {
        "class": "HistogramMenuDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMenuLineDesign: {
        "class": "RefElementsMenuLineDesign",
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFacetMenuLineDesign: o(
        { // default
            "class": "HistogramMenuLineDesign"
        },
        {
            qualifier: { inFocus: false },
            context: {
                backgroundColor: "transparent"
            }
        },
        {
            qualifier: { inFocus: true },
            context: {
                backgroundColor: [{ iconDesign: { menuLineInFocusBackgroundColor: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    HistogramMeasureFunctionDropDownDesign: {
        "class": "HistogramDropDownDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFunctionMenuDesign: {
        "class": "HistogramMenuDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMeasureFunctionMenuLineDesign: {
        "class": "HistogramMenuLineDesign"
    },

    //////////////////////////////////////////////////////
    HistogramDistributionModeInfoDesign: {
        "class": "InfoIconableDesign"
    },

    //////////////////////////////////////////////////////
    HistogramDistributionModeInfoIconDesign: {
        "class": "InfoIconDesign"
    },

    //////////////////////////////////////////////////////
    HistogramMoreControlsDesign: {
        context: {
            backgroundColor: designConstants.globalBGColor
        }
    },

    //////////////////////////////////////////////////////
    HistogramUDFMeasureFacetAggregationControlDesign: {
        "class": o("BackgroundColor", "OnHoverFrameDesign"),
        display: {
            image: {
                size: "100%",
                src: [cond,
                    [{ uDFAppliedToAggregationFunction: _ }, [me]],
                    o(
                        { on: true, use: "%%image:(funcSum.svg)%%" },
                        { on: false, use: "%%image:(sumFunc.svg)%%" }
                    )
                ],
                alt: [cond,
                    [{ uDFAppliedToAggregationFunction: _ }, [me]],
                    o(
                        { on: true, use: "f(sum())" },
                        { on: false, use: "sum(f())" }
                    )
                ]
            }
        }
    },

    //////////////////////////////////////////////////////
    OverlayXHistogramSorterDesign: o(
        { // default
            "class": o("FSSorterUXDisplayDesign", "BackgroundColor"),
        },
        {
            qualifier: { sortingByMe: true },
            context: {
                triangleColor: [{ myOverlay: { color: _ } }, [me]]
            }
        },
        {
            qualifier: { refreshMySorting: true },
            context: {
                height: [{ fsPosConst: { defaultRefreshSorterHeight: _ } }, [globalDefaults]], // ratio to width maintained in FSSorterUXDisplayDesign
            },
            display: {
                image: {
                    size: "100%",
                    src: [cond,
                        [{ sortingDirection: _ }, [me]],
                        o(
                            { on: "ascending", use: "%%image:(refreshAscendingSort.svg)%%" },
                            { on: "descending", use: "%%image:(refreshDescendingSort.svg)%%" }
                        )
                    ],
                    alt: "Refresh Sort"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    SortableOverlaysInHistogramMenuDesign: {
        "class": "OverlaySelectorMenuDesign"
    }

};        
