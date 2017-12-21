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

initGlobalDefaults.fsAppSavedViewDesign = {
    defaultTextSize: { "V1": 12, "V2": 14, "V3": 16 },
    loadedViewBackground: "#ffffff",
    unloadedViewBackground: "#dcdcdc"
};

var classes = {
    //////////////////////////////////////////////////////
    SavedViewPaneDesign: o(
        { // default
            "class": "Border",
            context: {
                borderWidth: 2
            }
        },
        {
            qualifier: { horizontallyMinimized: true },
            context: {
                borderColor: "#dfdfdf"
            },
            display: {
                borderLeftWidth: 0,
                borderRightWidth: 0
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "BackgroundColor",
            context: {
                borderColor: designConstants.enabledBlueBorderColor,
                backgroundColor: "#f1f1f1"
            }
        }
    ),

    //////////////////////////////////////////////////////
    SavedViewPaneTopPanelDesign: {
        //"class": "PaneTopPanelDesign"       
    },

    //////////////////////////////////////////////////////
    SavedViewPaneControlDesign: {
        "class": "FSAppControlCoreBackgroundDesign",
        children: {
            text: {
                description: {
                    // embedded in this area so that it won't be affected by the opacity manipulations on the embedding's background!
                    "class": "SavedPaneControlTextDesign",
                    position: {
                        frame: 0
                    },
                    context: {
                        displayText: [{ displayText: _ }, [embedding]]
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    SavedPaneControlTextDesign: {
        "class": o("TextNormalWeight", "FSAppControlCoreTextDesign"),
        context: {
            textSize: [densityChoice, [{ fsAppSavedViewDesign: { defaultTextSize: _ } }, [globalDefaults]]],
        }
    },

    //////////////////////////////////////////////////////
    SavedViewPaneClearViewControlDesign: {
        "class": "SavedViewPaneControlDesign"
    },

    //////////////////////////////////////////////////////
    SavedViewPaneNewViewControlDesign: {
        "class": "AppNewElementContainerDesign",
        context: {
            labelTextSize: [densityChoice, [{ fsAppSavedViewDesign: { defaultTextSize: _ } }, [globalDefaults]]]
        }
    },

    //////////////////////////////////////////////////////
    SavedViewPaneSaveAsControlDesign: o(
        { // default
            "class": "SavedViewPaneControlDesign"
        },
        {
            qualifier: { saveAsMode: true },
            context: {
                backgroundColor: "#4e4e4e",
            },
            children: {
                text: {
                    description: {
                        context: {
                            textSize: [densityChoice,
                                [merge,
                                    { "V1": 10 },
                                    [{ fsAppSavedViewDesign: { defaultTextSize: _ } }, [globalDefaults]]
                                ]
                            ]
                        }
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    SavedViewPaneSearchBoxDesign: {
        "class": "SearchBoxDesign",
        context: {
            // override default values for SearchBox:
            searchBoxTextSize: [densityChoice, [{ fsAppSavedViewDesign: { defaultTextSize: _ } }, [globalDefaults]]],
            searchBoxDefaultTextColor: "#bbbbbb"
        }
    },

    //////////////////////////////////////////////////////
    SavedViewsViewDesign: o(
    ),

    //////////////////////////////////////////////////////
    SavedViewDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                backgroundColor: "#e5e5e5"
            },
            display: {
                borderTopLeftRadius: [{ semiCircleRadius: _ }, [me]],
                borderBottomLeftRadius: [{ semiCircleRadius: _ }, [me]]
            }
        },
        {
            qualifier: { trashed: false },
            "class": "TrashableSavedViewDesign"
        },
        {
            qualifier: { trashed: true },
            "class": "TrashedSavedViewDesign"
        }
    ),

    //////////////////////////////////////////////////////
    LoadedViewDesign: {
        "class": o("ZoomBoxOrnamentDesign", "BackgroundColor"),
        context: {
            backgroundColor: [{ fsAppSavedViewDesign: { loadedViewBackground: _ } }, [globalDefaults]]
        },
        display: {
            borderRightWidth: 0
        }
    },

    //////////////////////////////////////////////////////
    TrashableSavedViewDesign: o(
        {
            qualifier: { loaded: true },
            "class": "LoadedViewDesign",
        },
        {
            qualifier: { loaded: false },
            context: {
                backgroundColor: [{ fsAppSavedViewDesign: { unloadedViewBackground: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { saveAsMode: true },
            "class": "DropShadow",
            display: {
                boxShadow: {
                    blurRadius: [{ blurRadius: _ }, [me]]
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    LoadedSavedViewPatchToZoomBoxOrnamentDesign: {
        "class": "LoadedViewDesign",
        display: {
            borderLeftWidth: 0
        }
    },

    //////////////////////////////////////////////////////
    TrashedSavedViewDesign: {
        "class": o("BackgroundColor", "Border"),
        context: {
            borderColor: "#c6c6c6"
        }
    },

    //////////////////////////////////////////////////////
    SavedViewNameDesign: o(
        { // default
            "class": o("DefaultDisplayText"),
            context: {
                textSize: [densityChoice, [{ designConstants: { appUserElementTextSize: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { loaded: false },
            context: {
                textColor: "#878787"
            }
        },
        {
            qualifier: { loaded: true },
            context: {
                textColor: "#1a1a1a"
            }
        },
        {
            qualifier: {
                loaded: true,
                loadedModified: true
            },
            "class": "TextItalic"
        }
    ),

    //////////////////////////////////////////////////////
    LoadedSavedViewModificationIndicatorDesign: {
        "class": "DefaultDisplayText"
    },

    //////////////////////////////////////////////////////
    SavedViewPaneTrashDesign: {
        "class": "TrashDesign"
    },

    //////////////////////////////////////////////////////
    SavedViewDraggedDesign: {
        "class": "DraggableIconDesign"
    },

    //////////////////////////////////////////////////////
    SavedViewPaneMinimizationControlDesign: o(
        {
            qualifier: { horizontallyMinimized: true },
            children: {
                imageIcon: {
                    description: {
                        position: {
                            "vertical-center": 0,
                            "horizontal-center": 0,
                            width: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                            height: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]]
                        },
                        display: {
                            image: {
                                size: "100%",
                                src: "%%image:(savedViewPaneShowControl.svg)%%",
                                alt: "[{ tooltipText: _ }, [me]]"
                            }
                        }
                    }
                }
            }
        }
    )
};
