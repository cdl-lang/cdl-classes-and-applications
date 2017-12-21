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

initGlobalDefaults.dataSourceDesign = {
    localLoadFileDropColor: "black",
    localLoadFileDropOpacity: 0.7,
    remoteUploadFileDropColor: "#aaaaaa",
    fileDropTextSize: 32,
    fileDropTextSizeColor: "white",
    separatorColor: "#c6c6c6",
    paneBackgroundColor: "white",
    paneTitleBackground: "#848484",
    containerDefaultBorderWidth: 2,
    containerBottomBorderWidth: 10,
    bottomSeparatorColor: "#848484",
    sourceSelectorTitleTextColor: "#ffffff",
    sourceSelectorTitleTextSize: { "V1": 22, "V2": 24, "V3": 26 },
    titleBackgroundColor: "#848484",
    selectedDataSourceNameTextColor: "white",
    selectedDataSourceNameBackgroundColor: designConstants.standardBlueColor,//"#222426",
    backgroundColorOfExternalDataSourceDeleteControl: "#d6101a",
    textColorOfExternalDataSourceDeleteControl: "white",
    invitationTextContainerBackground: "#eaeaea",
    textSizeOfDropSiteForOpenedLocalFile: { "V1": 18, "V2": 24, "V3": 30 },
    dragAndDropFileInvitationBorderWidth: 4,
    dragAndDropFileInvitationBorderColor: "#b2b2b2",
    dragAndDropFileInvitationTextSize: { "V1": 18, "V2": 24, "V3": 30 },
    dragAndDropFileInvitationTextColor: "#b2b2b2"
};

var classes = {

    ///////////////////////////////////////////////
    DataSourceSelectorsContainerDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showBorder: o(
                    [not, [{ dataSourceSelected: _ }, [me]]],
                    [and,
                        [{ dataSourceSelected: _ }, [me]],
                        [{ showDataSourcePane: _ }, [me]]
                    ]
                )
            }
        },
        {
            qualifier: { showBorder: true },
            "class": "Border",
            context: {
                borderColor: [{ dataSourceDesign: { paneTitleBackground: _ } }, [globalDefaults]],
                borderWidth: [{ dataSourceDesign: { containerDefaultBorderWidth: _ } }, [globalDefaults]]
            },
            display: {
                borderBottomWidth: [{ dataSourceDesign: { containerBottomBorderWidth: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DataSourceSearchBoxDesign: {
        "class": "SearchBoxDesign"
    },

    ///////////////////////////////////////////////
    DataSourceTrashDesign: {
        "class": "TrashDesign"
    },

    ///////////////////////////////////////////////
    DataSourceSelectorsDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ dataSourceDesign: { paneBackgroundColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    DataSourceShowPaneControlDesign: o(
        { // default
            display: {
                image: {
                    size: "100%",
                    src: "%%image:(dataSourcePaneShowControl.svg)%%",
                    alt: "[{ tooltipText: _ }, [me]]"
                }
            }

            /*"class": o("Circle", "BackgroundColor"),
            children: {
                innerCircle: {
                    description: {
                        "class": o("Circle", "BackgroundColor"),
                        context: {
                            radius: [{ bFSAppDataSourcePosConst: { showDataSourcePaneControlInternalRadius: _ } }, [globalDefaults]],
                            backgroundColor: [{ dataSourceDesign: { bottomSeparatorColor: _ } }, [globalDefaults]],
                            showDataSourcePane: [{ showDataSourcePane: _ }, [embedding]]
                        },
                        position: {
                            "class": "AlignCenterWithEmbedding"
                        },
                        children: {
                            triangle: {
                                description: {
                                    "class": "Triangle",
                                    context: {
                                        width: [{ bFSAppDataSourcePosConst: { showDataSourcePaneControlTriangleBase: _ } }, [globalDefaults]],
                                        height: [{ bFSAppDataSourcePosConst: { showDataSourcePaneControlTriangleHeight: _ } }, [globalDefaults]],
                                        triangleColor: "white",
                                        baseSide: [cond,
                                            [{ showDataSourcePane: _ }, [embedding]],
                                            o(
                                                { on: true, use: "bottom" },
                                                { on: false, use: "top" }
                                            )
                                        ]
                                    },
                                    position: {
                                        "vertical-center": [cond,
                                            [{ showDataSourcePane: _ }, [embedding]],
                                            o({ on: true, use: -1 }, { on: false, use: 1 })
                                        ],
                                        "horizontal-center": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }*/
        }
    ),

    ///////////////////////////////////////////////
    DataSourceSelectorDesign: {

    },

    ///////////////////////////////////////////////
    DataSourceSelectorsViewControlDesign: o(
        {
            qualifier: { loadedLocalFileObj: true },
            display: {
                image: {
                    src: "%%image:(dataSourceLocal.svg)%%", // appears in black, not in blue, as it does in the datasource pane
                    alt: "Local",
                    size: "100%"
                }
            }
        },
        {
            qualifier: { loadedLocalFileObj: false }, // i.e. an external db is loaded
            "class": "ExternalDataSourceIconDesign"
        }
    ),

    ///////////////////////////////////////////////
    DataSourceDraggedDesign: {
    },

    ///////////////////////////////////////////////
    DataSourceOpenedLocalFileDraggedDesign: {
        "class": "DataSourceDraggedDesign",
    },

    ///////////////////////////////////////////////
    DataSourceOpenedLocalFileDraggedNameDesign: {
        "class": "DraggedIconElementOpacity"
    },

    ///////////////////////////////////////////////
    DataSourceOpenedLocalFileDraggedIconDesign: {
        "class": "DraggedIconElementOpacity"
    },

    ///////////////////////////////////////////////
    ExternalDataSourceDraggedDesign: {
        "class": "DataSourceDraggedDesign"
    },

    ///////////////////////////////////////////////
    DataSourceOpenedLocalFileIconDesign: {
        display: {
            image: {
                src: "%%image:(dataSourceLocalBlue.svg)%%",
                alt: "Local",
                size: "100%"
            }
        }
    },

    ///////////////////////////////////////////////
    DropSiteForDraggedOpenedLocalFileDesign: {
        "class": o("Border", "BackgroundColor"),
        context: {
            borderWidth: 3,
            borderColor: "#848484",
            backgroundColor: "#f0f0f0"
        },
        children: {
            text: {
                description: {
                    "class": o("DefaultDisplayText", "GeneralArea", "DisplayDimension"),
                    context: {
                        displayText: "Drop Here to Upload Data to the Server",
                        textColor: "#b4b4b4",
                        textSize: [densityChoice, [{ dataSourceDesign: { textSizeOfDropSiteForOpenedLocalFile: _ } }, [globalDefaults]]]
                    },
                    position: {
                        "class": "AlignCenterWithEmbedding"
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    ExternalDataSourceIconDesign: {
        display: {
            image: {
                src: "%%image:(dataSourceRemote.svg)%%",
                alt: "Remote",
                size: "100%"
            }
        }
    },

    ///////////////////////////////////////////////
    DataSourceNameDesign: o(
        { // default
            "class": "DefaultDisplayText"
        },
        {
            qualifier: { iAmTheDataSourceLoaded: true },
            context: {
                textColor: [{ dataSourceDesign: { selectedDataSourceNameTextColor: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DataSourceNameBackgroundDesign: o(
        { // default
            "class": "BackgroundColor"
        },
        {
            qualifier: { iAmTheDataSourceLoaded: true },
            context: {
                backgroundColor: [{ dataSourceDesign: { selectedDataSourceNameBackgroundColor: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DataSourceLocalFileSelectorDesign: o(
        {
            qualifier: { dataSourceSelected: false },
            "class": o("TextAlignCenter", "TextBold")
        },
        {
            qualifier: { dataSourceSelected: true },
            // nothing for now - handled by the inheriting class, EffectiveBaseName (its Design class)
        }
    ),

    ///////////////////////////////////////////////
    DataSourceOpenedLocalFilesViewDesign: {
    },

    ///////////////////////////////////////////////
    DataSourceSelectorsTitleBackgroundDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ dataSourceDesign: { titleBackgroundColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    DataSourceTitleDesign: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [densityChoice, [{ dataSourceDesign: { sourceSelectorTitleTextSize: _ } }, [globalDefaults]]],
            textColor: [{ dataSourceDesign: { sourceSelectorTitleTextColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    DataSourceSelectorTitleDesign: {
        "class": "DataSourceTitleDesign"
    },

    ///////////////////////////////////////////////
    DataSourceLocalFileSelectorTitleDesign: {
        "class": "DataSourceSelectorTitleDesign"
    },

    ///////////////////////////////////////////////
    UploadDataSourceModalDialogOKControlDesign: o(
        {
            qualifier: { enabled: false },
            display: {
                opacity: 0.3
            }
        }
    ),

    ///////////////////////////////////////////////
    ExternalDataSourceSelectorTitleDesign: {
        "class": "DataSourceSelectorTitleDesign"
    },

    ///////////////////////////////////////////////
    DataSourceLoadErrorDialogDesign: {
        // ModalDialogDesign inherited via ModalDialog        
    },

    //////////////////////////////////////////////////////
    ExternalDataSourceDeleteControlDesign: {
        "class": o("Circle", "TextAlignCenter", "DefaultDisplayText", "BackgroundColor"),
        context: {
            backgroundColor: [{ dataSourceDesign: { backgroundColorOfExternalDataSourceDeleteControl: _ } }, [globalDefaults]],
            radius: [densityChoice, [{ bFSAppDataSourcePosConst: { externalDataSourceDeleteControlRadius: _ } }, [globalDefaults]]],
            textSize: [minus, [{ defaultFontSize: _ }, [me]], 1],
            textColor: [{ dataSourceDesign: { textColorOfExternalDataSourceDeleteControl: _ } }, [globalDefaults]],
            displayText: "X"
        },
        display: {
            pointerOpaque: false
        }
    },

    //////////////////////////////////////////////////////
    UploadDataSourceNameDesign: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [{ generalDesign: { modalDialogTextSize: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    DataSourceDragAndDropFileInvitationContainerDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ dataSourceDesign: { invitationTextContainerBackground: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    DataSourceDragAndDropFileInvitationFrameDesign: {
        "class": "DashedBorder",
        context: {
            borderWidth: [{ dataSourceDesign: { dragAndDropFileInvitationBorderWidth: _ } }, [globalDefaults]],
            borderColor: [{ dataSourceDesign: { dragAndDropFileInvitationBorderColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    DataSourceDragAndDropFileInvitationTextDesign: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [densityChoice, [{ dataSourceDesign: { dragAndDropFileInvitationTextSize: _ } }, [globalDefaults]]],
            textColor: [{ dataSourceDesign: { dragAndDropFileInvitationTextColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    DataSourceFileDropTextDesign: {
        "class": o("DefaultDisplayText", "GeneralArea", "DisplayDimension"),
        context: {
            textSize: [{ dataSourceDesign: { fileDropTextSize: _ } }, [globalDefaults]],
            textColor: [{ dataSourceDesign: { fileDropTextSizeColor: _ } }, [globalDefaults]],
            displayText: [{ displayText: _ }, [embedding]]
        },
        position: {
            "horizontal-center": 0
        }
    },

    //////////////////////////////////////////////////////
    DataSourceLocalLoadFileDropDesign: {
        "class": "BackgroundColor",
        context: {
            color: [{ dataSourceDesign: { localLoadFileDropColor: _ } }, [globalDefaults]]
        },
        display: {
            opacity: [{ dataSourceDesign: { localLoadFileDropOpacity: _ } }, [globalDefaults]]
        },
        children: {
            text: {
                description: {
                    "class": "DataSourceFileDropTextDesign",
                    position: {
                        attachVertically: { // equi-distance from top of dropLocalFile and dropExternalDataSource
                            pair1: {
                                point1: {
                                    element: [embedding],
                                    type: "top"
                                },
                                point2: {
                                    type: "vertical-center"
                                }
                            },
                            pair2: {
                                point1: {
                                    type: "vertical-center"
                                },
                                point2: [cond,
                                    // there will be no dropExternalDataSource if we're not connected to a server
                                    [{ myApp: { dropExternalDataSource: _ } }, [me]],
                                    o(
                                        {
                                            on: true,
                                            use: {
                                                element: [{ myApp: { dropExternalDataSource: _ } }, [me]],
                                                type: "top"
                                            }
                                        },
                                        {
                                            on: false,
                                            use: {
                                                element: [embedding],
                                                type: "bottom"
                                            }
                                        }
                                    )
                                ]

                            },
                            ratio: 1
                        }
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    DataSourceRemoteUploadFileDropDesign: {
        "class": "BackgroundColor",
        context: {
            color: [{ dataSourceDesign: { remoteUploadFileDropColor: _ } }, [globalDefaults]]
        },
        children: {
            text: {
                description: {
                    "class": "DataSourceFileDropTextDesign",
                    position: {
                        "vertical-center": 0
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    ZCAppSourceSelectorSeparatorDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ dataSourceDesign: { separatorColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    DataSourceSelectorsTopSeparatorDesign: {
        "class": "ZCAppSourceSelectorSeparatorDesign"
    },

    //////////////////////////////////////////////////////
    DataSourceSelectorsBottomSeparatorDesign: {
        "class": "ZCAppSourceSelectorSeparatorDesign",
        context: {
            backgroundColor: [cond,
                [{ dataSourceSelected: _ }, [me]],
                o({ on: true, use: [{ dataSourceDesign: { bottomSeparatorColor: _ } }, [globalDefaults]] },
                    { on: false, use: "transparent" }
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    DataSourceSelectorsHorizontalSeparatorDesign: {
        "class": "BackgroundColor",
        children: {
            line: {
                description: {
                    "class": "ZCAppSourceSelectorSeparatorDesign",
                    position: {
                        top: 0,
                        bottom: 0,
                        left: [{ bFSAppDataSourcePosConst: { horizontalMarginAroundHorizontalSeparator: _ } }, [globalDefaults]],
                        right: [{ bFSAppDataSourcePosConst: { horizontalMarginAroundHorizontalSeparator: _ } }, [globalDefaults]]
                    }
                }
            }
        }
    }
};

