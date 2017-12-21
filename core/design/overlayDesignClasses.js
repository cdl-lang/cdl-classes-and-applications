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
    VisibleOverlayDesign: o(
        { // default
            //"class": "VisualTransition"
        },
        {
            qualifier: { visualTransition: true },
            display: {
                transitions: {
                    top: bTransitions.visibleOverlayPosition,
                    left: bTransitions.visibleOverlayPosition,
                    width: bTransitions.visibleOverlayPosition,
                    height: bTransitions.visibleOverlayPosition
                }
            }
        },
        {
            qualifier: { ofExpandedOverlay: true },
            "class": "PermOverlayVisibleFrame"
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            "class": "MatrixCellTransition"
        }
    ),

    //////////////////////////////////////////////////////
    OSRDesign: {
        "class": "BackgroundColor",
        context: {
            color: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    OverlayLevel0MinimizationControlDesign: {
        "class": o("Circle", "Border", "BackgroundColor"),
        context: {
            radius: [div, [{ dimension: _ }, [me]], 2],
            borderWidth: [densityChoice, bFSPosConst.defaultBorderWidth],
            borderColor: designConstants.globalBGColor,
            backgroundColor: "darkgrey"
        },
        // awaiting white "x" svg from yuval
        children: { // remove once svg is available.
            x: {
                description: {
                    "class": o("DefaultDisplayText", "DisplayDimension"),
                    context: {
                        displayText: "X",
                        textColor: designConstants.globalBGColor
                    },
                    position: {
                        "class": "AlignCenterWithEmbedding"
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    OverlaySolutionSetViewDesign: o(
        { // default
        },
        {
            qualifier: { ofZoomBoxingOverlay: true },
            "class": "PermOverlayVisibleFrame"
        }
    ),


    //////////////////////////////////////////////////////
    PermOverlayVisibleFrame: {
        "class": "Border",
        context: {
            borderWidth: [{ myOverlay: { visibleOverlayFrameWidth: _ } }, [me]],
            borderColor: [{ myOverlay: { color: _ } }, [me]]
        },
        display: {
            borderLeftWidth: 0,
            borderRightWidth: 0
        }
    },

    //////////////////////////////////////////////////////
    OSRControlElementTextDesign: o(
        { // default 
            "class": o("DefaultDisplayText", "TrackMyOverlay"),
            context: {
                textSize: [densityChoice, [{ designConstants: { appUserElementTextSize: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true },
            context: {
                textColor: designConstants.globalBGColor
            }
        }
    ),

    //////////////////////////////////////////////////////
    EffectiveBaseNameDesign: {
        "class": "TitleOnAppFrameTextDesign"
    },

    //////////////////////////////////////////////////////
    EffectiveBaseCounterElementDesign: {
        "class": "TitleOnAppFrameTextDesign"
    },

    //////////////////////////////////////////////////////
    OverlayNameDesign: o(
        { // default
            "class": "OSRControlElementTextDesign"
        },
        {
            qualifier: {
                editInputText: true,
                inputIsEmpty: true
            },
            display: {
                text: { // note that the update of the font size is done directly to display.text.fontSize, and not via DefaultDisplayText's textSize
                    // this is to avoid having the changed font size feed into the display query calculations performed by OverlayName!
                    fontSize: [{ defaultFontSize: _ }, [me]]
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    OverlaySolutionSetCounterCoreDesign: {
        "class": "OSRControlElementTextDesign",
        context: {
            defaultFontSize: 14
        }
    },

    //////////////////////////////////////////////////////
    OverlaySolutionSetCounterDesign: {
        "class": "OverlaySolutionSetCounterCoreDesign"
    },

    //////////////////////////////////////////////////////
    EffectiveBaseCounterDesign: {
        "class": o("EffectiveBaseCounterElementDesign", "OverlaySolutionSetCounterCoreDesign")
    },

    //////////////////////////////////////////////////////
    OverlayMaximizationControlDesign: {

    },

    //////////////////////////////////////////////////////
    OverlayCopyControlDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            displayText: "C"
        },
        display: {
            background: "red"
        }
    },

    //////////////////////////////////////////////////////
    SolutionSetViewControlDesign: {
    },

    //////////////////////////////////////////////////////
    SolutionSetViewControlDisplayDesign: o(
        {
            qualifier: { showItemsControlABTest: "V1" },
            "class": "ColorBySurroundingAndState",
            context: {
                surroundingColor: [cond,
                    [{ ofBlacklistOverlay: _ }, [me]],
                    o({ on: true, use: "black" }, { on: false, use: "colored" })
                ],
                stateColor: [cond,
                    [{ indicateSelectability: _ }, [me]],
                    o({ on: true, use: "onHover" }, { on: false, use: "selected" })
                ],
                triangleColor: [[{ colorBySurroundingAndState: _ }, [me]],
                [{ surroundingColor: _ }, [me]],
                [{ stateColor: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V1",
                showSolutionSet: true
            },
            "class": "TopSideTriangle"
        },
        {
            qualifier: {
                showItemsControlABTest: "V1",
                showSolutionSet: false
            },
            "class": "LeftSideTriangle"
        },
        {
            qualifier: { showItemsControlABTest: "V2" },
            display: {
                opacity: 0.65,
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V2",
                inFocus: true
            },
            display: {
                opacity: 0.9
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V2",
                showSolutionSet: true
            },
            display: {
                image: {
                    src: "%%image:(minusIcon.svg)%%",
                    alt: "Close"
                }
            }
        },
        {
            qualifier: {
                showItemsControlABTest: "V2",
                showSolutionSet: false
            },
            display: {
                image: {
                    src: "%%image:(plusIcon.svg)%%",
                    alt: "Open"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    ExtOverlayUniqueIDFacetSelectionMenuLineDesign: {
        "class": "DropDownMenuLineDesign"
    }
};
