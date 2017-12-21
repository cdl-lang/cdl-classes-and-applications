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

initGlobalDefaults.numericDesign = {
    primaryLabelTextSize: { "V1": 11, "V2": 13, "V3": 15 },
    secondaryLabelTextSize: { "V1": 9, "V2": 10, "V3": 12 },
    primaryLabelTextColor: "#666666",
    secondaryLabelTextColor: "#888888",
    mainSegmentLineColor: "#777777"
};

var classes = {
    //////////////////////////////////////////////////////
    // API:
    // 1. rangeHasTinyOffset (false by default (if left undefined))
    // 2. lastBin
    // 3. ofVerticalElement
    //////////////////////////////////////////////////////
    NumericBinDesign: o(
        { // default
            "class": "HistogramBinDesign"
        },
        {
            qualifier: {
                ofVerticalElement: true,
                rangeHasTinyOffset: false,
                lastBin: false // note: lastBin is for the highest values, so at the top in a vertical widget
            },
            display: {
                borderTopWidth: bFSPosConst.binBorder, // this effectively creates separating lines between bins, except for the outer borders 
                // (which are instead displayed by the SliderHistogramView)
                borderTopStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                rangeHasTinyOffset: false,
                lastBin: false // note: lastBin is for the highest values, so is the rightmost bin in a horizontal widget
            },
            display: {
                borderRightWidth: bFSPosConst.binBorder, // this effectively creates separating lines between bins, except for the outer borders 
                // (which are instead displayed by the SliderHistogramView)
                borderRightStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    NumericHistogramBinButtonArrow: {
        "class": "ScaleControlArrow"
    },

    //////////////////////////////////////////////////////
    NumericHistogramMoreBinButtonDesign: {
        children: {
            arrow: {
                description: {
                    "class": o("NumericHistogramBinButtonArrow", "BottomSideTriangle")
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    NumericHistogramLessBinButtonDesign: {
        children: {
            arrow: {
                description: {
                    "class": o("NumericHistogramBinButtonArrow", "TopSideTriangle")
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    NumericHistogramBinCountDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText")
    },

    ///////////////////////////////////////////////
    NumericScaleEditableLabelTextDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [cond,
                [and,
                    [not, [{ editInputText: _ }, [me]]],
                    [{ inFocus: _ }, [me]]
                ],
                o(
                    { on: true, use: "#eeeeee" },
                    { on: false, use: designConstants.globalBGColor }
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    NumericHistogramViewDMZDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#d3d3d3"
        }
    }
};
