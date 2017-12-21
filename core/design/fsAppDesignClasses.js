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

initGlobalDefaults.bFSAppNewSliceDesignConst = {
    textSize: { "V1": 11, "V2": 12, "V3": 14 },
    textColor: "#222426"
};

initGlobalDefaults.bFSAppControl = {
    textSize: { "V1": 14, "V2": 16, "V3": 20 },
    appTitleTextColor: "#222426"
};

var classes = {

    //////////////////////////////////////////////////////
    FSAppDesign: {
        display: {
            background: [cond,
                correctCompilationFlags,
                o(
                    { on: true, use: designConstants.globalBGColor },
                    { on: false, use: "pink" }
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    GlobalBaseItemSetDesign: {
        display: {
            background: designConstants.globalBGColor
            //boxShadow: ["#666", +"0","0","10px"]            
        }
    },

    //////////////////////////////////////////////////////
    AppFrameDesign: o(
        { // default
            "class": "BackgroundColor"
        },
        {
            qualifier: { dataSourceSelected: true },
            context: {
                backgroundColor: [{ myApp: { effectiveBaseOverlay: { color: _ } } }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    ZoomBoxDesign: o(
        {
            qualifier: { dataSourceSelected: false },
            "class": "BackgroundColor"
        }
    ),

    //////////////////////////////////////////////////////
    ZoomBoxTopDesign: {
        "class": "BackgroundColor"
    },

    //////////////////////////////////////////////////////
    ZoomBoxMiddleDesign: {
        display: {
            background: [{ color: _ }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    ZoomBoxBottomDesign: {
        "class": "BackgroundColor"
    },

    ///////////////////////////////////////////////
    AppFrameMinimizationControlDesign: o(
        {
            qualifier: { minimized: false },
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    src: "%%image:(closeControl.svg)%%",
                    size: "100%",
                    alt: [{ tooltipText: _ }, [me]]
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    ZoomBoxOrnamentDesign: {
        "class": "Border",
        context: {
            borderWidth: bFSAppPosConst.zoomBoxOrnamentWidth,
            borderColor: [cond,
                [{ horizontallyMinimized: _ }, [areaOfClass, "SavedViewPane"]],
                o({ on: true, use: [{ myApp: { effectiveBaseOverlay: { color: _ } } }, [me]] },
                    { on: false, use: designConstants.loadedViewBorderColor })
            ]
        }
    },

    ///////////////////////////////////////////////
    FrozenFacetViewPaneDesign: {
        children: {
            rightBorder: { // but slightly shorter than its embedding area, so we can't simply set the right border of the FrozenFacetViewPane 
                description: {
                    "class": "BackgroundColor",
                    context: {
                        backgroundColor: "#acabab"
                    },
                    position: {
                        right: 0,
                        width: 1,
                        top: [{ expandedFacetToPaneOffsetTop: _ }, [embedding]],
                        bottom: [{ expandedFacetToPaneOffsetBottom: _ }, [embedding]],
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    PaneTopPanelDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#eeeeee"
        }
    },

    ///////////////////////////////////////////////
    MinimizedOverlaySearchBoxDesign: {
        "class": "ViewPaneSearchBoxDesign"
    },

    ///////////////////////////////////////////////
    ViewPaneSearchBoxDesign: {
        "class": "SearchBoxDesign"
    },

    ///////////////////////////////////////////////
    AppStateConnectionIndicatorDesign: o(
        { // default
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: {
                appStateRemotingServerAddress: true,
                appStateRemotingErrorId: 0
            },
            display: {
                image: {
                    src: "%%image:(appStateRemoteConnected.svg)%%",
                    alt: "Connected"
                }
            }
        },
        {
            qualifier: {
                appStateRemotingServerAddress: true,
                appStateRemotingErrorId: 1
            },
            display: {
                image: {
                    src: "%%image:(appStateRemoteDisconnected.svg)%%",
                    alt: "Disconnected"
                }
            }
        },
        {
            qualifier: { appStateRemotingServerAddress: false },
            display: {
                image: {
                    src: "%%image:(appStateLocal.svg)%%",
                    alt: "Local Mode"
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    FacetSnappableControlCircleDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                backgroundColor: designConstants.enabledColor
            }
        },
        {
            qualifier: { indicateSelectability: true },
            context: {
                backgroundColor: designConstants.onHoverColor
            }
        }
    ),

    ///////////////////////////////////////////////
    FacetSnappableControlTriangleDesign: o(
        { // default
            context: {
                triangleColor: designConstants.globalBGColor
            }
        },
        {
            qualifier: {
                ofHorizontalView: true,
                ofFacetPrevControl: true
            },
            "class": "RightSideTriangle"
        },
        {
            qualifier: {
                ofHorizontalView: true,
                ofFacetPrevControl: false
            },
            "class": "LeftSideTriangle"
        },
        {
            qualifier: {
                ofHorizontalView: false,
                ofFacetPrevControl: true
            },
            "class": "BottomSideTriangle"
        },
        {
            qualifier: {
                ofHorizontalView: false,
                ofFacetPrevControl: false
            },
            "class": "TopSideTriangle"
        }
    ),

    //////////////////////////////////////////////////////
    HorizontalMinimizationControlDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultHorizontallyMinimizedDesign: true
            }
        },
        { // default
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    src: "%%image:(closeControl.svg)%%",
                    alt: "Minimize Pane",
                    size: "100%"
                }
            }
        },
        {
            qualifier: {
                defaultHorizontallyMinimizedDesign: true,
                horizontallyMinimized: true
            },
            "class": "BackgroundColor",
            context: {
                backgroundColor: "#d9d9d9",
                minimizedTriangleWidth: bFSAppPosConst.horizontalMinimizedPaneTriangleWidth,
                minimizedTriangleHeight: bFSAppPosConst.horizontalMinimizedPaneTriangleHeight,
                minimizedTriangleColor: "#1d1d1b"
            },
            children: {
                triangle: {
                    description: {
                        position: {
                            "class": "AlignCenterWithEmbedding",
                            width: [{ minimizedTriangleWidth: _ }, [embedding]],
                            height: [{ minimizedTriangleHeight: _ }, [embedding]]
                        },
                        display: {
                            triangle: {
                                baseSide: [cond,
                                    [{ leftSideBaseTriangle: _ }, [embedding]],
                                    o({ on: true, use: "left" },
                                        { on: false, use: "right" })
                                ],
                                color: [{ minimizedTriangleColor: _ }, [embedding]]
                            }
                        }
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    // API:
    // 1. labelTextSize: default provided. used by teh embedded AppNewElementLabelDesign 
    //////////////////////////////////////////////////////
    AppNewElementContainerDesign: {
        "class": "FSAppControlCoreBackgroundDesign",
        context: {
            labelTextSize: [densityChoice, [{ bFSAppNewSliceDesignConst: { textSize: _ } }, [globalDefaults]]],
            fontWeight: "yyy"
        }
    },

    //////////////////////////////////////////////////////
    AppNewElementButtonDesign: {
        "class": "FSAppAddElementControlDesign"
    },

    //////////////////////////////////////////////////////
    AppNewElementLabelDesign: {
        "class": o("TextAlignLeft", "FSAppControlCoreTextDesign"),
        context: {
            textSize: [{ labelTextSize: _ }, [embedding]]
        }
    },

    //////////////////////////////////////////////////////
    TitleOnAppFrameTextDesign: {
        "class": "TitleTextDesign",
        context: {
            textColor: [{ bFSAppControl: { appTitleTextColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    LoadedViewElementDesign: {
        "class": "TitleOnAppFrameTextDesign"
    },

    ///////////////////////////////////////////////
    // API: 
    // 1. disabled: a boolean
    //////////////////////////////////////////////////////
    FSAppControlCoreBackgroundDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                backgroundColor: "#1d1d1d"
            }
        },
        {
            qualifier: { disabled: false },
            "class": "AppControlOpacityDesign"
        },
        {
            qualifier: { disabled: true },
            context: {
                backgroundColor: "#b2b2b2"
            }
        }
    ),

    ///////////////////////////////////////////////
    // API: 
    // 1. disabled: a boolean
    //////////////////////////////////////////////////////
    FSAppControlCoreTextDesign: o(
        { // default        
            "class": o("TextAlignCenter", "DefaultDisplayText"),
            context: {
                textColor: "#ffffff",
                defaultTextSize: [densityChoice, [{ bFSAppControl: { textSize: _ } }, [globalDefaults]]],
                textSize: [{ defaultTextSize: _ }, [me]]
            }
        },
        {
            qualifier: { disabled: true },
            context: {
                textColor: "#878787"
            }
        }
    ),

    ///////////////////////////////////////////////
    // API: 
    // 1. disabled: a boolean
    //////////////////////////////////////////////////////
    FSAppControlCoreDesign: { // default        
        "class": o("FSAppControlCoreTextDesign", "FSAppControlCoreBackgroundDesign"),
    },

    ///////////////////////////////////////////////
    // API: 
    // 1. disabled: a boolean
    ///////////////////////////////////////////////
    FSAppControlDesign: {
        "class": o("TextLight", "FSAppControlCoreDesign")
    },

    ///////////////////////////////////////////////
    FSAppAddElementControlDesign: {
        children: {
            text: {
                description: {
                    "class": "FSAppControlCoreTextDesign",
                    context: {
                        displayText: "+"
                    },
                    position: {
                        frame: 0
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    // API: 
    // 1. topBorderColor: default provided
    // 2. topBorderWidth: default provided
    ///////////////////////////////////////////////
    ViewTopBorder: {
        "class": "TopBorder",
        context: {
            topBorderColor: "#eeeeee",
            borderColor: [{ topBorderColor: _ }, [me]],
            topBorderWidth: 2
        },
        display: {
            borderTopWidth: [{ topBorderWidth: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    BottomViewDesign: {
        "class": "ViewTopBorder"
    },

    ///////////////////////////////////////////////
    MinimizedOverlaysViewDesign: {
        //"class": "BottomViewDesign"
    },

    ///////////////////////////////////////////////
    UnmaximizeOverlayControlDesign: {
        "class": o("TextAlignLeft", "FSAppControlCoreDesign"),
        context: {
            horizontalPadding: [densityChoice, designConstants.padding]
        },
        display: {
            paddingLeft: [{ horizontalPadding: _ }, [me]],
            paddingRight: [{ horizontalPadding: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    MinimizedOverlaysTitleDesign: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [densityChoice, [{ designConstants: { appUserElementTextSize: _ } }, [globalDefaults]]]
        }
    }
};
