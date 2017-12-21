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

initGlobalDefaults.sliderDesign = {
    logSegmentLineColor: "#d3d3d3",
    valSelectorDisplayBorderWidth: { "V1": 1, "V2": 2, "V3": 2 },
    valSelectorBackgroundColor: designConstants.enabledBlueBorderColor,
    selectorColor: "#9a9a9a",
    continuousRangeBorderColor: "lightgrey",
    selectedRangeBackground: "#ebebeb",
    selectedRangeBackgroundOnInnerFrame: "#bfbfbf"
};

var classes = {

    ///////////////////////////////////////////////
    ValSelectorDesign: o(
        { // default
            context: {
                selectorColor: [{ sliderDesign: { selectorColor: _ } }, [globalDefaults]]
            },
            children: {
                triangle: {
                    description: {
                        "class": "ValSelectorTriangle",
                    }
                },
                rectangle: {
                    description: {
                        "class": "ValSelectorRectangle"
                    }
                }
            }
        },
        {
            qualifier: { disabled: true },
            children: {
                disabledValSelectorDesign: {
                    description: {
                        "class": "DisabledValSelectorDesign"
                    }
                }
            }
        },
        {
            qualifier: {
                disabled: false,
                inFocus: true
            },
            display: {
                opacity: 1
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            display: {
                transform: {
                    rotate: 90
                }
            }
        }
    ),


    ///////////////////////////////////////////////
    ValSelectorTriangle: o(
        { // default
            "class": o("GeneralArea", "TrackMyValSelector"),
            context: {
                triangleColor: [{ selectorColor: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                left: 0,
                width: [mul, 2, [densityChoice, [{ sliderPosConst: { selectorGirthAxis: _ } }, [globalDefaults]]]],
                height: [{ selectorTriangleLengthAxis: _ }, [embedding]]
                // it's twice as wide as its embedding, so the triangle gets truncated in the middle, as intended.
            }
        },
        {
            qualifier: {
                ofHighValSelector: true,
                ofVerticalElement: true
            },
            "class": "BottomSideTriangle",
            position: {
                top: 0,
                attachToRectangleleOnLengthAxis: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { rectangle: _ } }, [embedding]],
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofHighValSelector: false,
                ofVerticalElement: true
            },
            "class": "TopSideTriangle",
            position: {
                bottom: 0,
                attachToRectangleleOnLengthAxis: {
                    point1: {
                        element: [{ children: { rectangle: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                top: 0,
                height: [mul, 2, [densityChoice, [{ sliderPosConst: { selectorGirthAxis: _ } }, [globalDefaults]]]],
                width: [{ selectorTriangleLengthAxis: _ }, [embedding]]
                // it's twice as high as its embedding, so the triangle gets truncated in the middle, as intended.
            }
        },
        {
            qualifier: {
                ofHighValSelector: true,
                ofVerticalElement: false
            },
            "class": "LeftSideTriangle",
            position: {
                right: 0,
                attachToRectangleleOnLengthAxis: {
                    point1: {
                        element: [{ children: { rectangle: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofHighValSelector: false,
                ofVerticalElement: false
            },
            "class": "RightSideTriangle",
            position: {
                left: 0,
                attachToRectangleleOnLengthAxis: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { rectangle: _ } }, [embedding]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    ValSelectorRectangle: o(
        { // default
            "class": o("GeneralArea", "BackgroundColor", "TrackMyValSelector"),
            context: {
                backgroundColor: [{ selectorColor: _ }, [embedding]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                height: [{ selectorTriangleLengthAxis: _ }, [embedding]],
                left: 0,
                width: [densityChoice, [{ sliderPosConst: { selectorGirthAxis: _ } }, [globalDefaults]]],
                right: 0
            }
        },
        {
            qualifier: {
                ofHighValSelector: true,
                ofVerticalElement: true
            },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: {
                ofHighValSelector: false,
                ofVerticalElement: true
            },
            position: {
                top: 0
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                width: [{ selectorTriangleLengthAxis: _ }, [embedding]],
                top: 0,
                height: [densityChoice, [{ sliderPosConst: { selectorGirthAxis: _ } }, [globalDefaults]]],
                bottom: 0
            }
        },
        {
            qualifier: {
                ofHighValSelector: true,
                ofVerticalElement: false
            },
            position: {
                left: 0
            }
        },
        {
            qualifier: {
                ofHighValSelector: false,
                ofVerticalElement: false
            },
            position: {
                right: 0
            }
        }
    ),

    ///////////////////////////////////////////////
    DisabledValSelectorDesign: {
        "class": "BackgroundColor",
        position: {
            frame: 0
        },
        display: {
            opacity: [{ generalDesign: { disabledFacetControllersOpacity: _ } }, [globalDefaults]] // name: selector, fsGD
        }
    },

    ///////////////////////////////////////////////
    SliderSelectionDesign: {
        "class": o("NumericFormatOfReference", "FacetSelectionDesign")
    },

    ///////////////////////////////////////////////
    SliderNonNumericalSelectionDesign: {
        "class": "DiscreteSelectionDesign"
    },

    ///////////////////////////////////////////////
    SliderScaleElementDesign: {
    },

    ///////////////////////////////////////////////
    SliderScaleLabeledTickmarkDesign: {
        "class": o("SliderScaleElementDesign")
    },

    ///////////////////////////////////////////////
    SliderScalePrimaryLabelTextDesign: {
        "class": "SliderScaleLabelDesign",
        context: {
            textColor: [cond,
                [{ edgeOfLinearPlusMinusScale: _ }, [embedding]],
                o(
                    {
                        on: true,
                        use: [{ sliderDesign: { logSegmentLineColor: _ } }, [globalDefaults]]
                    },
                    {
                        on: false,
                        use: [{ numericDesign: { primaryLabelTextColor: _ } }, [globalDefaults]]
                    }
                )
            ],
            coreTextSize: [densityChoice, [{ numericDesign: { primaryLabelTextSize: _ } }, [globalDefaults]]],
            tickmarkSize: 3,
            fontSizeFactor: 0.006
        }
    },

    ///////////////////////////////////////////////
    SliderScaleSecondaryLabelTextDesign: {
        "class": o("SliderScaleLabelDesign"),
        context: {
            textColor: [{ numericDesign: { secondaryLabelTextColor: _ } }, [globalDefaults]],
            coreTextSize: [densityChoice, [{ numericDesign: { secondaryLabelTextSize: _ } }, [globalDefaults]]],
            tickmarkSize: 2,
            fontSizeFactor: 0.002
        }
    },

    ///////////////////////////////////////////////
    // API:
    // 1. coreTextSize
    ///////////////////////////////////////////////
    SliderScaleLabelDesign: {
        "class": o("NumericFormatOfReference", "DefaultDisplayText"),
        context: {
            textSize: [
                plus,
                [{ coreTextSize: _ }, [me]],
                [
                    minus,
                    [
                        mul,
                        [{ myCanvas: { canvasPixelSize: _ } }, [me]],
                        [{ fontSizeFactor: _ }, [me]]
                    ],
                    [
                        mul,
                        200,
                        [{ fontSizeFactor: _ }, [me]]
                    ]
                ]
            ],

            // override NumericFormat's precision
            numberOfDigits: [{ numberOfDigits: _ }, [embedding]]
        },

        display: {
            paddingRight: 1
        }
    },

    ///////////////////////////////////////////////
    SliderScaleEditableLabelTextDesign: o(
        { // default
            "class": "NumericScaleEditableLabelTextDesign",
            display: {
                padding: 2
            }
        }
    ),

    ///////////////////////////////////////////////
    SliderScaleLineDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ numericDesign: { mainSegmentLineColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    SliderScaleSegmentLineDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [cond,
                [{ type: _ }, [me]],
                o(
                    { on: "main", use: [{ numericDesign: { mainSegmentLineColor: _ } }, [globalDefaults]] },
                    { on: "tail", use: [{ sliderDesign: { logSegmentLineColor: _ } }, [globalDefaults]] }
                )
            ]
        }
    },

    ///////////////////////////////////////////////
    SliderScaleTickmarkDesign: o(
        {
            context: {
                borderWidth: 1
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": o("TopBorder")
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": o("RightBorder")
        }
    ),

    ///////////////////////////////////////////////
    SliderScaleUnlabeledTickmarkDesign: {
        "class": o("SliderScaleTickmarkDesign", "SliderScaleElementDesign"),
        context: {
            borderColor: '#777777',
            tickmarkSize: 2
        }
    },

    ///////////////////////////////////////////////
    SliderScaleLabelTickmarkDesign: {
        "class": "SliderScaleTickmarkDesign",
        context: {
            borderColor: '#555555'
        }
    },

    ///////////////////////////////////////////////
    SliderContinuousRangeDesign: o(
        { // default
            "class": "BackgroundColor", // to mask the SliderHistogramBinFrame that run z-lower
            context: {
                borderColor: [{ sliderDesign: { continuousRangeBorderColor: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofPermExtOverlayXWidget: true },
            //"class": "Border"
        },
        {
            qualifier: { ofBaseOverlayXWidget: true },
            context: {
                beginningGirthBorderThickness: [densityChoice, bSliderPosConst.scaleGirth]
            }
        }
    ),

    ///////////////////////////////////////////////
    SliderContinuousRangeInnerFrameDesign: {
        "class": "Border",
        context: {
            borderWidth: 1,
            borderColor: [{ sliderDesign: { continuousRangeBorderColor: _ } }, [globalDefaults]]
        },
        display: {
            borderTopWidth: 0,
            borderBottomWidth: 0
        }
    },

    ///////////////////////////////////////////////
    SliderContinuousSelectedRangeDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ sliderDesign: { selectedRangeBackground: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    SliderContinuousInnerFrameSelectedRangeDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ sliderDesign: { selectedRangeBackgroundOnInnerFrame: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    InfinityLineDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ sliderDesign: { selectedRangeBackgroundOnInnerFrame: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    ValSelectorHandleDesign: {
        display: {
            background: "black"
        }
    },

    ///////////////////////////////////////////////
    ValSelectorsConnectorDesign: {
    },

    ///////////////////////////////////////////////
    Slider1DValueMarkerOfPermOverlayDesign: {
        // The inheriting Slider1DValueMarkerOfPermOverlay inherits OneDValueMarkerOfPermOverlay, which in turn inherits OneDValueMarkerOfPermOverlayDesign
        display: {
            opacity: [cond, [{ showStats: _ }, [embedding]],
                o(
                    { on: true, use: designConstants.valueMarkerOpacityWhenStatsOn },
                    { on: false, use: designConstants.valueMarkerOpacityWhenStatsOff }
                )]
        }
    },

    ///////////////////////////////////////////////
    Slider1DBaseSetValueMarkerDesign: {
    },

    ///////////////////////////////////////////////
    SliderScaleMenuRadioButtonNameDesign: {
        "class": "MenuItemTextDesign"
    },

    ///////////////////////////////////////////////
    ValSelectorDisplayDesign: {
        "class": o("DelicateRoundedCorners", "Border", "BackgroundColor"),
        context: {
            borderColor: [{ sliderDesign: { valSelectorBackgroundColor: _ } }, [globalDefaults]],
            borderWidth: [densityChoice, [{ sliderDesign: { valSelectorDisplayBorderWidth: _ } }, [globalDefaults]]],
            backgroundColor: [cond,
                [{ myValSelector: { editInputDisplayText: _ } }, [me]],
                o(
                    { on: false, use: [{ sliderDesign: { valSelectorBackgroundColor: _ } }, [globalDefaults]] },
                    { on: true, use: designConstants.globalBGColor }
                )
            ]
        }
    },

    ///////////////////////////////////////////////
    ValSelectorDisplayRootDesign: {
        display: {
            triangle: {
                color: [{ sliderDesign: { valSelectorBackgroundColor: _ } }, [globalDefaults]],
                baseSide: [cond,
                    [{ rightSidedDisplay: _ }, [embedding]],
                    o({ on: true, use: "right" }, { on: false, use: "left" })
                ]
            }
        }
    },

    ///////////////////////////////////////////////
    ValSelectorDisplayTextDesign: o(
        {
            "class": o("TextBold", "TextAlignRight", "DefaultDisplayText", "BackgroundColor"),
            context: {
                backgroundColor: [{ sliderDesign: { valSelectorBackgroundColor: _ } }, [globalDefaults]],
                textColor: [cond,
                    [{ editInputDisplayText: _ }, [me]],
                    o(
                        { on: false, use: designConstants.globalBGColor },
                        { on: true, use: [{ numericDesign: { primaryLabelTextColor: _ } }, [globalDefaults]] }
                    )
                ],
                textSize: [
                    { textSize: _ },
                    [first,
                        [
                            { myWidget: [{ myValSelector: { myWidget: _ } }, [embedding]] },
                            [areaOfClass, "SliderScalePrimaryLabelTextDesign"]
                        ]
                    ]
                ]
            }
        },
        {
            qualifier: { editInputDisplayText: false },
            "class": "NumericFormatOfReference"
        }
    ),

    ///////////////////////////////////////////////
    ValSelectorDisplayBodyDesign: {
        "class": "ValSelectorDisplayTextDesign"
    },


    ///////////////////////////////////////////////
    ValSelectorDisplayModifierDesign: {
        "class": "ValSelectorDisplayTextDesign"
    },

    ///////////////////////////////////////////////
    ValSelectorDisplayDeleteControlDesign: {
        "class": o("Circle", "BackgroundColor", "Border"),
        context: {
            radius: 6
        },
        children: {
            img: {
                description: {
                    position: {
                        "class": "AlignCenterWithEmbedding",
                        width: 8,
                        height: 8
                    },
                    display: {
                        image: {
                            src: "%%image:(exclusion.svg)%%"
                        }
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    SliderScaleEditControlDesign: {
        "class": "ScaleEditControlDesign"
    },

    //////////////////////////////////////////////////////
    ScaleEditControlDesign: {
        "class": o("OnHoverFrameDesign", "TextAlignCenter", "DefaultDisplayText"),
        context: {
            borderWidth: 0,
            onHoverBackgroundColor: "#E5E5E5",
            textSize: [minus, [{ defaultFontSize: _ }, [me]], 1]
        },
        display: {
            paddingLeft: 2,
            paddingRight: 2,
            paddingBottom: 0,
            text: {
                verticalAlign: "middle"
            }
        },
    },

    //////////////////////////////////////////////////////
    SliderScaleEditControlMenuDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#ABABAB"
        }
    },

    //////////////////////////////////////////////////////
    SliderScaleEditControlMenuItemLabelDesign: {
        "class": "DefaultDisplayText",
        context: {
            textColor: "white"
        }
    },

    //////////////////////////////////////////////////////
    SliderScaleEditControlMenuItemDesign: {
        qualifier: { useRadioButtons: false, selected: true },
        context: {
            backgroundColor: "#d2e7fd" // bar is #969696"
        }
    },

    //////////////////////////////////////////////////////
    SliderScaleModeIconDesign: {
        display: {
            image: {
                size: "100%",
                src: [cond,
                    [{ scaleType: _ }, [me]],
                    o(
                        { on: "linear", use: "%%image:(scaleIconLinear.svg)%%" },
                        { on: "linearPlus", use: "%%image:(scaleIconLinearPlus.svg)%%" },
                        { on: "linearPlusMinus", use: "%%image:(scaleIconLinearPlusMinus.svg)%%" },
                        { on: "log", use: "%%image:(scaleIconLog.svg)%%" }
                    )
                ],
                alt: "Scale Mode"
            }
        }
    },

    //////////////////////////////////////////////////////
    AverageMarkerStatsDesign: {
        "class": "DefaultDisplayText"
    },

    //////////////////////////////////////////////////////
    BoxStatsDesign: {
        "class": "Border"
    },

    //////////////////////////////////////////////////////
    MedianBandStatsDesign: {
        "class": o("BackgroundColor"),
        context: {
            backgroundColor: designConstants.defaultBorderColor
        }
    },

    //////////////////////////////////////////////////////
    WiskerStatsDesign: {
        "class": o("Border")
    },

    //////////////////////////////////////////////////////
    SliderHistogramBinDesign: o(
        { // default
            "class": "NumericBinDesign"
        },
        {
            qualifier: {
                ofVerticalElement: true,
                firstBin: true,
                nonNumericalValuesExist: true
            },
            display: {
                borderBottomWidth: bFSPosConst.binBorder // the firstBin when horizontal is the bottom one!
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                firstBin: true,
                nonNumericalValuesExist: true
            },
            display: {
                borderLeftWidth: bFSPosConst.binBorder // the firstBin when horizontal is the leftmost!
            }
        }
    ),

    //////////////////////////////////////////////////////
    SliderDiscreteHistogramBinDesign: {
        "class": "HistogramBinDesign",
        display: {
            borderTopWidth: bFSPosConst.binBorder,
            borderTopStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    SliderDiscreteValueDesign: {
        "class": "DiscreteValueDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramMoreBinButtonDesign: {
        "class": "NumericHistogramMoreBinButtonDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramLessBinButtonDesign: {
        "class": "NumericHistogramLessBinButtonDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramBinCountDesign: {
        "class": "NumericHistogramBinCountDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramBarSelectionsContainerDesign: {
        "class": "HoveringSelectionControlDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramBarSelectionsControlDesign: {
        "class": "OnHoverFrameDesign",
        context: {
            borderWidth: 0
        }
    },

    //////////////////////////////////////////////////////
    SliderHistogramBarSetAsSelectionsControlDesign: {
        "class": "SliderHistogramBarSelectionsControlDesign"
    },

    //////////////////////////////////////////////////////
    SliderHistogramBarIncludeInSelectionsControlDesign: {
        "class": "SliderHistogramBarSelectionsControlDesign"
    }
};
