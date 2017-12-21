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
    /*DateContinuousRangeDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ numericDesign: { mainSegmentLineColor: _ } }, [globalDefaults]]
        }
    },*/

    //////////////////////////////////////////////////////
    DateScaleLabelTickmarkDesign: {
        "class": "ScaleTickmarkDesign",
        context: {
            // textSize: we may still choose to define this here - see HistogramScalePrimaryLabelDesign
            tickmarkSize: [{ fsPosConst: { primaryTickmarkSize: _ } }, [globalDefaults]],
            textColor: [{ generalDesign: { scalePrimaryLabelTextColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    DateHistogramBinDesign: o(
        { // default
            "class": "NumericBinDesign"
        },
        {
            qualifier: { lastBinOfYear: true },
            display: {
                borderColor: [{ histogramDesign: { binBorderColorEmphasized: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    DateHistogramMoreBinButtonDesign: {
        "class": "NumericHistogramMoreBinButtonDesign"
    },

    //////////////////////////////////////////////////////
    DateHistogramLessBinButtonDesign: {
        "class": "NumericHistogramLessBinButtonDesign"
    },

    //////////////////////////////////////////////////////
    DateHistogramBinCountDesign: {
        "class": "NumericHistogramBinCountDesign"
    },

    //////////////////////////////////////////////////////
    DateScaleLabelTextDesign: {
        "class": o("DateInputDesign", "NumericScaleEditableLabelTextDesign")
    },

    //////////////////////////////////////////////////////
    LeftSideArrow: {
        "class": o("ScaleControlArrow", "LeftSideTriangle")
    },

    //////////////////////////////////////////////////////
    RightSideArrow: {
        "class": o("ScaleControlArrow", "RightSideTriangle")
    },

    //////////////////////////////////////////////////////
    NextTimePeriodControlDesign: {
        children: {
            firstArrow: {
                description: {
                    "class": "LeftSideArrow"
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    PrevTimePeriodControlDesign: {
        children: {
            firstArrow: {
                description: {
                    "class": "RightSideArrow"
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    FwdTimePeriodControlDesign: {
        children: {
            firstArrow: {
                description: {
                    "class": "LeftSideArrow",
                    context: {
                        defaultDimension: false
                    },
                }
            },
            secondArrow: {
                description: {
                    "class": "LeftSideArrow",
                    context: {
                        defaultDimension: false
                    }
                }
            }
        },
        position: {
            connectBothArrowsHorizontally: {
                point1: {
                    element: [{ children: { firstArrow: _ } }, [me]],
                    type: "right"
                },
                point2: {
                    element: [{ children: { secondArrow: _ } }, [me]],
                    type: "left"
                },
                equals: 0
            }
        }
    },

    //////////////////////////////////////////////////////
    BackTimePeriodControlDesign: {
        context: {
            defaultDimension: false
        },
        children: {
            firstArrow: {
                description: {
                    "class": "RightSideArrow",
                    context: {
                        defaultDimension: false
                    }
                }
            },
            secondArrow: {
                description: {
                    "class": "RightSideArrow",
                    context: {
                        defaultDimension: false
                    }                    
                }
            }
        },
        position: {
            connectBothArrowsHorizontally: {
                point1: {
                    element: [{ children: { firstArrow: _ } }, [me]],
                    type: "right"
                },
                point2: {
                    element: [{ children: { secondArrow: _ } }, [me]],
                    type: "left"
                },
                equals: 0
            }
        }
    }
};
