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

// %%classfile%%: <dataSourceDesignClasses.js>

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsContainer: o(
        { // default
            "class": o("DataSourceSelectorsContainerDesign", "GeneralArea", "TrackDataSourceApp", "TrackAppFrameMinimization"),
            children: {
                dataSourceSelectors: {
                    description: {
                        "class": "DataSourceSelectors"
                    }
                }
            },
            position: {
                left: [{ bFSAppDataSourcePosConst: { appDataSourceSelectorsContainerHorizontalMargin: _ } }, [globalDefaults]],
                right: [{ bFSAppDataSourcePosConst: { appDataSourceSelectorsContainerHorizontalMargin: _ } }, [globalDefaults]],
                top: 0
            }
        },
        {
            qualifier: {
                allowDataSourceUploading: true,
                dataSourceSelected: false
            },
            children: {
                dragAndDropFileInvitation: {
                    description: {
                        "class": "DataSourceDragAndDropFileInvitationContainer"
                    }
                }
            },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: {
                showDataSourcePane: true,
                dataSourceSelected: true,
                appFrameMinimized: false
            },
            position: {
                attachBottomToEffectiveBaseSummary: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "EffectiveBaseSummary"],
                        type: "top"
                    },
                    equals: [densityChoice, [{ fsAppPosConst: { effectiveBaseSummaryVerticalMargin: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: {
                showDataSourcePane: true,
                dataSourceSelected: true,
                appFrameMinimized: true
            },
            position: {
                attachBottomToZoomBox: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [areaOfClass, "ZoomBox"],
                        type: "top"
                    },
                    equals: bFSAppPosConst.minimizedAppFrameWidth
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectors: o(
        { // default
            "class": o("DataSourceSelectorsDesign", "GeneralArea", "CalculateMaxWidthOfStrings", "TrackDataSourceApp"),
            context: {
                maxWidthOfNewDataSourceLabels: [
                    [{ maxWidthOfStrings: _ }, [me]],
                    [{ labelText: _ }, [areaOfClass, "DataSourceFileSelectorDialogControl"]]
                ]

            },
            position: {
                top: 0,
                left: 0,
                right: 0
            },
            children: {
                localFileSelector: {
                    description: {
                        "class": "DataSourceLocalFileSelector"
                    }
                },
                externalDataSourceSelector: {
                    description: {
                        "class": "ExternalDataSourceSelector"
                    }
                }
            }
        },
        {
            qualifier: { allowDataSourceUploading: true },
            context: {
                "^bottomSeparatorAD": o(),
                "^horizontalSeparatorAD": o(),
            },
            children: {
                bottomSeparator: {
                    description: {
                        "class": "DataSourceSelectorsBottomSeparator"
                    }
                }
            }
        },
        {
            qualifier: { showDataSourcePane: true },
            "class": "ExpandableBottom",
            context: {
                // ExpandableBottom params:
                // rewire these AD to a single object, to facilitate resetting it.
                userExpandedVerticallyAD: [{ bottomSeparatorAD: { userExpandedVertically: _ } }, [me]],
                userDoubleClickedVerticallyAD: [{ bottomSeparatorAD: { userDoubleClickedVertically: _ } }, [me]],
                stableExpandableHeightAD: [{ bottomSeparatorAD: { stableExpandableHeight: _ } }, [me]],
                initialExpandableHeight: [densityChoice, [{ bFSAppDataSourcePosConst: { initHeightOfDataSourceSelectors: _ } }, [globalDefaults]]]
            },
            children: {
                topBanner: {
                    description: {
                        "class": "DataSourceSelectorsTitleBackground"
                    }
                },
                searchBox: {
                    description: {
                        "class": "DataSourceSearchBox"
                    }
                },
                topSeparator: {
                    description: {
                        "class": "DataSourceSelectorsTopSeparator"
                    }
                },
                horizontalSeparator: {
                    description: {
                        "class": "DataSourceSelectorsHorizontalSeparator"
                    }
                }
            }
        },
        {
            qualifier: {
                dataSourceSelected: true,
                showDataSourcePane: true
            },
            position: {
                bottom: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    VerticallyAlignWithinPaneTitleBackground: {
        verticallyAlignWithinPaneTitleBackground: {
            point1: { type: "vertical-center" },
            point2: {
                element: [areaOfClass, "DataSourceSelectorsTitleBackground"],
                type: "vertical-center"
            },
            equals: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceShowPaneControl: o(
        { // default 
            "class": o("DataSourceShowPaneControlDesign", "GeneralArea", "Icon", "TooltipableControl", "ShowDataSourcePaneControlHandler", "TrackDataSourceApp"),
            context: {
                tooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { expandDataSourcesPane: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { dataSourceEntityStr: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                    [{ showDataSourcePane: _ }, [me]]
                ],
                myAnchor: [expressionOf]
                //radius: [{ bFSAppDataSourcePosConst: { showDataSourcePaneControlExternalRadius: _ } }, [globalDefaults]]
            },
            position: {
                width: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                height: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                horizontallyCenterWithAnchor: {
                    point1: { element: [{ myAnchor: _ }, [me]], type: "horizontal-center" },
                    point2: { type: "horizontal-center" },
                    equals: 0
                }
            },
            stacking: {
                lowerThanTheExpansionHandle: {
                    higher: [me],
                    lower: [
                        { myExpandable: [areaOfClass, "DataSourceSelectors"] },
                        [areaOfClass, "ExpansionHandle1D"]
                    ]
                }
            }
        },
        {
            qualifier: { showDataSourcePane: false },
            position: {
                verticallyCenterWithAnchor: {
                    point1: { element: [{ myAnchor: _ }, [me]], type: "vertical-center" },
                    point2: { type: "vertical-center" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { showDataSourcePane: true },
            position: {
                positionOnDataSelectorsContainerBottomBorder: {
                    // place in the vertical-center of the bottom border, which is a thick one.
                    pair1: {
                        point1: {
                            element: [areaOfClass, "DataSourceSelectors"],
                            type: "bottom"
                        },
                        point2: {
                            type: "vertical-center"
                        }
                    },
                    pair2: {
                        point1: {
                            type: "vertical-center"
                        },
                        point2: {
                            element: [areaOfClass, "DataSourceSelectorsContainer"],
                            type: "bottom"
                        },
                    },
                    ratio: 1
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ShowDataSourcePaneControlHandler: {
        "class": o("ControlModifiedPointer", "TrackDataSourceApp"),
        write: {
            onShowDataSourcePaneControlHandlerMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleShowDataSourcePane: {
                        to: [{ showDataSourcePane: _ }, [me]],
                        merge: [not, [{ showDataSourcePane: _ }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsTitleBackground: {
        "class": o("DataSourceSelectorsTitleBackgroundDesign", "GeneralArea", "BelowSiblings"),
        position: {
            top: 0,
            left: 0,
            right: 0,
            height: [densityChoice, [{ bFSAppDataSourcePosConst: { paneTitleHeight: _ } }, [globalDefaults]]],
            bottomFromTopSeparator: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [areaOfClass, "DataSourceSelectorsTopSeparator"],
                    type: "top"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSearchBox: {
        "class": o("DataSourceSearchBoxDesign", "GeneralArea", "SearchBox", "AboveSiblings", "TrackDataSourceApp"),
        context: {
            myTitles: [areaOfClass, "DataSourceSelectorTitle"],
            // SearchBox params
            searchStr: [mergeWrite,
                [{ myApp: { allSearchBoxesFields: { dataSourceSearchBox: _ } } }, [me]],
                o()
            ], // all searchStr are now centralized in FSApp.allSearchBoxesFields
            placeholderInputText: [concatStr,
                o(
                    [{ myApp: { searchStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStrPlural: _ } }, [me]]
                )
            ],
            realtimeSearch: true,
            searchBoxWidth: [densityChoice, [{ bFSAppDataSourcePosConst: { datasourceSearchBoxWidth: _ } }, [globalDefaults]]],
            searchBoxHeight: [densityChoice, [{ bFSAppDataSourcePosConst: { datasourceSearchBoxHeight: _ } }, [globalDefaults]]]            
        },
        position: {
            "class": "VerticallyAlignWithinPaneTitleBackground",
            horizontallyAlignWithDataSourceSelectorsHorizontalSeparator: {
                point1: {
                    element: [areaOfClass, "DataSourceSelectorsHorizontalSeparator"],
                    type: "horizontal-center"
                },
                point2: {
                    type: "horizontal-center"
                },
                equals: 0
            },
            alignVerticalCenterWithTitle: {
                point1: { element: [{ myTitles: _ }, [me]], type: "vertical-center" },
                point2: { type: "vertical-center" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceEmbedFileHotspot: {
        children: {
            hotspot: {
                description: {
                    "class": "DataSourceFileInputHotspot"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceFileInputHotspot: {
        "class": "FileInputHotspot",
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting classes should define a child fileSelectorDialogControl, which inherits DataSourceFileSelectorDialogControl.
    // 2. Inheriting classes should define a child called 'title' and one called 'dataSourcesView'
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceSelector: o(
        { // default
            "class": o("DataSourceSelectorDesign", "GeneralArea", "FileInputController", "TrackDataSourceApp"),
            context: {
                fileInputDefaultDisplayText: false, // turn off default
                myTitle: [{ children: { title: _ } }, [me]],
                myView: [{ children: { dataSourcesView: _ } }, [me]]
            },
            position: {
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { fileDraggedOverApp: false },
            context: {
                myFileInputHotspot: [{ children: { fileSelectorDialogControl: { children: { hotspot: _ } } } }, [me]]
                // myFileInputHotspot for fileDraggedOverApp: true - see inheriting classes                
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackDataSourceSelector: {
        context: {
            myDataSourceSelector: [
                [embeddingStar, [me]],
                [areaOfClass, "DataSourceSelector"]
            ],
            myTitle: [{ myDataSourceSelector: { myTitle: _ } }, [me]],
            myView: [{ myDataSourceSelector: { myView: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeftmostDataSourceSelector: {
        "class": o("DataSourceSelector", "ExpandableRight"),
        context: {
            horizontalSeparator: [areaOfClass, "DataSourceSelectorsHorizontalSeparator"],
            // ExpandableRight param 
            // write AD to the DataSourceSelectors, to allow these values to be easily reset.
            userExpandedHorizontallyAD: [{ horizontalSeparatorAD: { userExpandedHorizontally: _ } }, [areaOfClass, "DataSourceSelectors"]],
            userDoubleClickedHorizontallyAD: [{ horizontalSeparatorAD: { userDoubleClickedHorizontally: _ } }, [areaOfClass, "DataSourceSelectors"]],
            stableExpandableWidthAD: [{ horizontalSeparatorAD: { stableExpandableWidthAD: _ } }, [areaOfClass, "DataSourceSelectors"]],

            initialExpandableWidth: [div,
                [minus,
                    [offset,
                        { element: [embedding], type: "left", content: true },
                        { element: [embedding], type: "right", content: true }
                    ],
                    [{ horizontalSeparator: { width: _ } }, [me]]
                ],
                2
            ],
            expansionIndicatorShowable: false,
            lengthAxisHandleAnchor: atomic({
                element: [{ horizontalSeparator: _ }, [me]],
                type: "horizontal-center"
            }),
            lowHTMLGirthHandleAnchor: atomic({
                element: [{ horizontalSeparator: _ }, [me]],
                type: "top"
            }),
            highHTMLGirthHandleAnchor: atomic({
                element: [{ horizontalSeparator: _ }, [me]],
                type: "bottom"
            })
        },
        position: {
            left: 0
            // width: handled via ExpandableRight
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RightmostDataSourceSelector: {
        "class": o("DataSourceSelector"),
        position: {
            right: 0
            // width: handled via ExpandableRight
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: the 'File' in the class name refers to a *local* file which the user can drop into the app.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceLocalFileSelector: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enableFileInputHotspot: [not, [{ draggedOpenedLocalFileAD: _ }, [me]]]
            }
        },
        { // default
            "class": o("DataSourceLocalFileSelectorDesign", "RightmostDataSourceSelector"),
            context: {
                // fileObjSelected as a writableRef to loadedLocalFileObj, which is non-persisted appData in ZCApp!
                fileObjSelected: [{ loadedLocalFileObj: _ }, [me]],
            }
        },
        {
            qualifier: { showDataSourcePane: true },
            children: {
                fileSelectorDialogControl: {
                    description: {
                        "class": "DataSourceLocalFileSelectorDialogControl"
                    }
                },
                title: {
                    description: {
                        "class": "DataSourceLocalFileSelectorTitle"
                    }
                },
                dataSourcesView: {
                    description: {
                        "class": "DataSourceOpenedLocalFilesView"
                    }
                }
            }
        },
        {
            qualifier: { fileDraggedOverApp: true },
            context: {
                myFileInputHotspot: [{ myApp: { dropLocalFileHotspot: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceFileSelectorDialogControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                searchStrDefined: [{ searchStr: _ }, [areaOfClass, "DataSourceSearchBox"]],
                enableFileInputHotspot: [{ enableFileInputHotspot: _ }, [embedding]]
            }
        },
        { // default
            "class": o("GeneralArea", "AppNewElementContainer", "ControlModifiedPointer", "TrackDataSourceApp", "TrackDataSourceSelector"),
            context: {
                verticalMargin: [densityChoice, [{ bFSAppDataSourcePosConst: { fileSelectorDialogControlMargin: _ } }, [globalDefaults]]],

                disabled: [not, [{ enableFileInputHotspot: _ }, [me]]], // FSAppControlDesign param                
                opacityWhenNotInFocus: [{ generalDesign: { controlOpacityNotOnHoverNearShinyAreas: _ } }, [globalDefaults]],
                // AppNewElementContainer param            
                buttonDimension: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
                labelWidth: [{ maxWidthOfNewDataSourceLabels: _ }, [areaOfClass, "DataSourceSelectors"]],
            },
            position: {
                height: [densityChoice, [{ bFSAppDataSourcePosConst: { heightOfDataSourceFileSelectorDialogControl: _ } }, [globalDefaults]]],
                left: [densityChoice, [{ bFSAppDataSourcePosConst: { leftMarginOfDataSourceSelectorFromEmbedded: _ } }, [globalDefaults]]],
                attachTopToMyViewBottom: {
                    point1: { element: [{ myView: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: [{ verticalMargin: _ }, [me]]
                },
                bottom: [{ verticalMargin: _ }, [me]]
            }
        },
        {
            qualifier: {
                enableFileInputHotspot: true,
                fileDraggedOverApp: false
            },
            "class": "DataSourceEmbedFileHotspot"
        },
        {
            qualifier: { searchStrDefined: true },
            write: {
                onDataSourceFileSelectorDialogControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        resetSearchStr: {
                            to: [{ searchStrDefined: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceSelectorTitle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofLeftmostDataSourceSelector: [
                    "LeftmostDataSourceSelector",
                    [classOfArea, [{ myDataSourceSelector: _ }, [me]]]
                ],
                ofRightmostDataSourceSelector: [
                    "RightmostDataSourceSelector",
                    [classOfArea, [{ myDataSourceSelector: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "DisplayDimension", "TooltipableControl"),
            context: {
                myDataSourceSelector: [embedding],
                horizontalMargin: [densityChoice, [{ bFSAppDataSourcePosConst: { horizontalMarginOfSourceSelectorTitle: _ } }, [globalDefaults]]],
                mySearchbox: [areaOfClass, "DataSourceSearchBox"],
                verticalMargin: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceSelectorTitleVerticalMargin: _ } }, [globalDefaults]]]
            },
            position: {
                "class": "VerticallyAlignWithinPaneTitleBackground",
                "horizontal-center": 0,
                minRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myDataSourceSelector: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    min: [{ horizontalMargin: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofLeftmostDataSourceSelector: true },
            position: {
                minOffsetFromSearchBox: {
                    point1: { type: "right" },
                    point2: { element: [{ mySearchbox: _ }, [me]], type: "left" },
                    min: [{ horizontalMargin: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofRightmostDataSourceSelector: true },
            position: {

                minOffsetFromSearchBox: {
                    point1: { element: [{ mySearchbox: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    min: [{ horizontalMargin: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceLocalFileSelectorDialogControl: {
        "class": "DataSourceFileSelectorDialogControl",
        context: {
            // AppNewElementContainer param            
            labelText: [concatStr,
                o(
                    [{ myApp: { openStr: _ } }, [me]],
                    " ",
                    [{ myApp: { localStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStr: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceLocalFileSelectorTitle: {
        "class": o("DataSourceLocalFileSelectorTitleDesign", "DataSourceSelectorTitle"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { localStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStrPlural: _ } }, [me]]
                )
            ],
            tooltipText: [{ myApp: { localFileSelectorTooltipText: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTitle: areaRef to class inheriting DataSourceSelectorTitle
    // 2. dataSources: an os of data source names (either strings or file objects)   
    // 3. inheriting class should embed a dataSourcesDoc which inherits DataSourcesDoc 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourcesView: {
        "class": o("GeneralArea", "VerticalScrollableWrapAroundView", "TrackDataSourceApp"),
        context: {
            attachScrollbarOn: "end" // override VerticalScrollableWrapAroundView default
        },
        position: {
            left: [densityChoice, [{ bFSAppDataSourcePosConst: { leftMarginOfDataSourceSelectorFromEmbedded: _ } }, [globalDefaults]]],
            right: [densityChoice, [{ bFSAppDataSourcePosConst: { rightMarginOfDataSourceSelectorFromEmbedded: _ } }, [globalDefaults]]],
            attachTopToTopViewSeparatorBottom: {
                point1: {
                    element: [areaOfClass, "DataSourceSelectorsTopSeparator"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ bFSAppDataSourcePosConst: { dataSourceSelectorViewOffsetToTopSeparator: _ } }, [globalDefaults]]
            },
            // bottom - see DataSourceFileSelectorDialogControl
            minHeight: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourcesDoc: {
        "class": o("GeneralArea", "VerticalScrollableWrapAroundDoc", "TrackDataSourceApp"),
        context: {
            // VerticalScrollableWrapAroundDoc params
            // wrapArounds: see VerticalScrollableWrapAroundDoc
            // override VerticalScrollableWrapAroundDoc defaults:
            wrapAroundSpacing: [{ bFSAppDataSourcePosConst: { openedDataSourceHorizontalSpacing: _ } }, [globalDefaults]],
            wrapAroundSecondaryAxisSpacing: [{ bFSAppDataSourcePosConst: { openedDataSourceVerticalSpacing: _ } }, [globalDefaults]],

            myDataSourceSearchBox: [areaOfClass, "DataSourceSearchBox"],

            searchStrSelection: { name: s([{ myDataSourceSearchBox: { currentSearchStr: _ } }, [me]]) }
        },
        children: {
            dataSources: {
                // note for local files, the dataSource is a file object. for external dbs it's simply a string    
                data: [identify,
                    _,
                    [
                        [{ searchStrSelection: _ }, [me]],
                        [{ dataSources: _ }, [embedding]]
                    ]
                ]
                // description: see inheriting classes
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFilesView: {
        "class": o("DataSourceOpenedLocalFilesViewDesign", "DataSourcesView"),
        context: {
            // DataSourcesView params
            myTitle: [areaOfClass, "DataSourceLocalFileSelectorTitle"],
            dataSources: [{ localFileObjsOpenedInSession: _ }, [me]]
        },
        children: {
            dataSourcesDoc: {
                description: {
                    "class": "DataSourceOpenedLocalFilesDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFilesDoc: {
        "class": "DataSourcesDoc",
        children: {
            dataSources: {
                // data: see DataSourcesDoc
                description: {
                    "class": "DataSourceOpenedLocalFile"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceCore: {
        context: {
            myIcon: [
                [areaOfClass, "DataSourceIcon"],
                [embedded]
            ],
            myName: [
                [areaOfClass, "DataSourceName"],
                [embedded]
            ],

            horizontalMarginOfEmbedded: [densityChoice, designConstants.padding]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. iAmTheDataSourceLoaded    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSource: o(
        { // default
            "class": o("GeneralArea", "WrapAround", "DataSourceCore",
                "BlockMouseEvent", "ControlModifiedPointer", "TrackDataSourceApp", "TrackDataSourceSelector"),
            propagatePointerInArea: o(),
            position: {
                // width & height: determined by embedded areas
            },
            children: {
                dataSourceName: {
                    description: {
                        "class": "DataSourceName"
                    }
                },
                dataSourceNameBackground: {
                    description: {
                        "class": "DataSourceNameBackground"
                    }
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: [{ spacingFromPrev: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceNameBackground: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmTheDataSourceLoaded: [{ iAmTheDataSourceLoaded: _ }, [embedding]]
            }
        },
        { // default
            "class": o("DataSourceNameBackgroundDesign", "GeneralArea", "BelowSiblings"),
            propagatePointerInArea: "embedding", // so that this area's colored background doesn't block the mouse events from propagating to the embedding DataSource
            position: {
                attachLeftToNameLeft: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [{ myName: _ }, [embedding]],
                        type: "left"
                    },
                    equals: [{ horizontalMarginOfEmbedded: _ }, [embedding]]
                },
                top: 0,
                bottom: 0,
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmTheDataSourceLoaded: [{ iAmTheDataSourceLoaded: _ }, [embedding]]
            }
        },
        { // default
            "class": o("DataSourceNameDesign", "GeneralArea", "ContentSpillsOver"),
            context: {
                horizontalMargin: [{ horizontalMarginOfEmbedded: _ }, [embedding]],
                tooltipableHorizontalAnchor: { type: "horizontal-center", content: true }
            },
            position: {
                attachLeftToIcon: {
                    point1: {
                        element: [{ myIcon: _ }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [mul, [{ horizontalMargin: _ }, [me]], 2]
                },
                width: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceNameWidth: _ } }, [globalDefaults]]],
                right: [{ horizontalMargin: _ }, [me]],
                top: 0,
                bottom: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFile: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmTheDataSourceLoaded: [equal,
                    [{ loadedLocalFileObj: _ }, [me]],
                    [{ fileObj: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("DataSource", "IconableWhileDraggableOnMove"),
            context: {
                fileObj: [{ param: { areaSetContent: _ } }, [me]],
                name: [{ fileObj: { name: _ } }, [me]]
            },
            write: {
                onDataSourceOpenedLocalFileClick: {
                    "class": "OnMouseClick",
                    true: {
                        loadMeToApp: {
                            to: [{ loadedLocalFileObj: _ }, [me]],
                            merge: atomic([{ fileObj: _ }, [me]])
                        }
                    }
                }
            },
            children: {
                dataSourceName: {
                    description: {
                        "class": "Tooltipable",
                        context: {
                            // Tooltipable param:
                            tmd: [{ tmd: _ }, [embedding]], // rewire the tmd to the DataSource's tmd (inherited via IconableWhileDraggableOnMove)
                            tooltipText: [
                                convertFileObjToString,
                                [{ fileObj: _ }, [embedding]]
                            ],
                            tooltipableHorizontalAnchor: { type: "left", content: true }, // override default
                            // API for DataSourceName
                            displayText: [{ name: _ }, [embedding]]
                        }
                    }
                },
                dataSourceIcon: {
                    description: {
                        "class": "DataSourceOpenedLocalFileIcon"
                    }
                }
            }
        },
        {
            qualifier: { createIconWhileInOperation: true },
            children: {
                iconWhileInOperation: {
                    // see IconableWhileDraggableOnMove for partner definition
                    description: {
                        "class": "DataSourceOpenedLocalFileDragged"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceDragged: {
        "class": o("DraggableIcon", "DataSourceCore"),
        context: {
            myDataSource: [expressionOf]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFileDragged: {
        "class": o("DataSourceOpenedLocalFileDraggedDesign", "DataSourceDragged"),
        context: {
            fileObj: [{ myDataSource: { fileObj: _ } }, [me]]
        },
        children: {
            dataSourceName: {
                description: {
                    "class": "DataSourceOpenedLocalFileDraggedName"
                }
            },
            dataSourceIcon: {
                description: {
                    "class": "DataSourceOpenedLocalFileDraggedIcon"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFileDraggedName: {
        "class": o("DataSourceOpenedLocalFileDraggedNameDesign", "DataSourceName"),
        context: {
            displayText: [{ myDataSource: { name: _ } }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFileDraggedIcon: {
        "class": o("DataSourceOpenedLocalFileDraggedIconDesign", "DataSourceOpenedLocalFileIcon"),
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourceDragged: {
        "class": o("ExternalDataSourceDraggedDesign", "DataSourceDragged"),
        context: {
            fileObj: [{ myDataSource: { fileObj: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceIcon: {
        "class": "AppElement",
        position: {
            top: 0,
            bottom: 0,
            left: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceOpenedLocalFileIcon: {
        "class": o("DataSourceOpenedLocalFileIconDesign", "DataSourceIcon")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourceSelector: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enableFileInputHotspot: [and, // for accessing a remote dataSource, the server needs to be up and about
                    [{ myApp: { appStateRemotingConnectionAlive: _ } }, [me]],
                    [not, [{ draggedOpenedLocalFileAD: _ }, [me]]]
                ],
                createDropSiteForDraggedOpenedLocalFile: [and,
                    [{ myApp: { appStateRemotingConnectionAlive: _ } }, [me]],
                    [{ draggedOpenedLocalFile: _ }, [me]]
                ],

                // when dataSourceSelected is false, the connection indicator is embedded herein.
                // when dataSourceSelected is true, it is embedded in FSAppControls
                embedExternalDataSourcesView: [{ myApp: { appStateRemotingConnectionAlive: _ } }, [me]]
            }
        },
        { // default
            "class": o("LeftmostDataSourceSelector", "ModalDialogable"),
            context: {
                uploadedDataName: [{ displayText: _ }, [areaOfClass, "UploadDataSourceName"]],
                uploadedDataTimestamp: [{ timestamp: _ }, [areaOfClass, "UploadDataSourceTimestamp"]],
                uploadedFileHandle: [{ uploadedFileObj: { fileHandle: _ } }, [me]],
                uploadedData: [datatable, [{ uploadedFileHandle: _ }, [me]]],
                draggedOpenedLocalFile: [{ draggedMoved: true }, [areaOfClass, "DataSourceOpenedLocalFile"]]
            },
            write: {
                onExternalDataSourceSelectorFileChoice: { // either picked or dragged (either from Local Files Opened or from the file system)
                    upon: o(
                        [fileChoiceHandledBy,                // either handled by my hotspot from the file system (via either subTypes: "click" or "drop")
                            [{ myFileInputHotspot: _ }, [me]]
                        ],
                        [and,                                // or dropping a local file already opened (i.e. one dragged from the Local Databases area)
                            mouseUpEvent,
                            [{ draggedOpenedLocalFileAD: _ }, [me]]
                        ]
                    ),
                    true: {
                        raiseCreateModalDialog: {
                            to: [{ createModalDialog: _ }, [me]],
                            merge: true
                        }
                    }
                },
                onExternalDataSourceSelectorOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        uploadToServer: {
                            to: [databases],
                            merge: {
                                name: [{ uploadedDataName: _ }, [me]],
                                attributes: [{ uploadedData: { attributes: _ } }, [me]],
                                metaData: {
                                    timestamp: [{ uploadedDataTimestamp: _ }, [me]]
                                },
                                data: [getRawData, [{ uploadedData: _ }, [me]]]
                            }
                        },
                        tempStorageOfName: { // store till after the existence of the modal dialog, and use to load into the *app* this newly uploaded db
                            to: [{ myApp: { nameOfLastDBUploaded: _ } }, [me]],
                            merge: [{ uploadedDataName: _ }, [me]]
                        }
                    }
                },
                onExternalDataSourceSelectorDraggedOpenedLocalFile: {
                    upon: [{ draggedOpenedLocalFile: _ }, [me]],
                    true: {
                        recordDraggedOpenedLocalFile: {
                            to: [{ draggedOpenedLocalFileAD: _ }, [me]],
                            merge: [{ draggedOpenedLocalFile: _ }, [me]]
                        }
                    }
                },
                onExternalDataSourceSelectorDroppedOpenedLocalFile: {
                    upon: [and,
                        [not, [{ draggedOpenedLocalFile: _ }, [me]]],
                        o(
                            [not, [{ createModalDialog: _ }, [me]]],
                            [and,
                                [{ createModalDialog: _ }, [me]],
                                [changed, [{ createModalDialog: _ }, [me]]]
                            ]
                        )
                    ],
                    true: {
                        resetDraggedOpenedLocalFile: {
                            to: [{ draggedOpenedLocalFileAD: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                showDataSourcePane: true,
                embedExternalDataSourcesView: true
            },
            children: {
                fileSelectorDialogControl: {
                    description: {
                        "class": "ExternalFileSelectorDialogControl"
                    }
                },
                title: {
                    description: {
                        "class": "ExternalDataSourceSelectorTitle"
                    }
                },
                dataSourcesView: {
                    description: {
                        "class": "ExternalDataSourcesView"
                    }
                }
            }
        },
        {
            qualifier: { fileDraggedOverApp: true },
            context: {
                myFileInputHotspot: [{ myApp: { dropExternalDataSourceHotspot: _ } }, [me]]
            }
        },
        { // when there is a local file dragged, we create a drop-site indicator 
            qualifier: { createDropSiteForDraggedOpenedLocalFile: true },
            children: {
                dropSiteIndicator: {
                    description: {
                        "class": "DropSiteForDraggedOpenedLocalFile"
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable              
                    description: {
                        "class": "UploadDataSourceModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExternalFileSelectorDialogControl: {
        "class": "DataSourceFileSelectorDialogControl",
        context: {
            // AppNewElementContainer param
            labelText: [concatStr,
                o(
                    [{ myApp: { uploadStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStr: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourceSelectorTitle: {
        "class": o("ExternalDataSourceSelectorTitleDesign", "DataSourceSelectorTitle"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { remoteStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStrPlural: _ } }, [me]]
                )
            ],
            tooltipText: [{ myApp: { uploadDataFileToServerTooltipText: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourcesView: {
        "class": "DataSourcesView",
        context: {
            // DataSourcesDoc param
            myTitle: [areaOfClass, "ExternalDataSourceSelectorTitle"],
            dataSources: [identify, { id: _ }, [databases]]
        },
        children: {
            dataSourcesDoc: {
                description: {
                    "class": "ExternalDataSourcesDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourcesDoc: {
        "class": "DataSourcesDoc",
        children: {
            dataSources: {
                // data: see DataSourcesView
                description: {
                    "class": "ExternalDataSource"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSource: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmTheDataSourceLoaded: [
                    and,
                    [true, [{ loadedDataSourceID: _ }, [me]]],
                    [equal,
                        [{ loadedDataSourceID: _ }, [me]],
                        [{ externalDataSourceObj: { id: _ } }, [me]]]
                ]
            }
        },
        { // default
            "class": o("DataSource", "ModalDialogable"),
            context: {
                externalDataSourceObj: [{ param: { areaSetContent: _ } }, [me]],
                name: [{ externalDataSourceObj: { name: _ } }, [me]],
                // if we're dragging a local opened file, then we should let the mouseUp propagate to be processed.
                blockMouseUp: [not, [{ draggedOpenedLocalFileAD: _ }, [me]]],
                uploadProgress: [
                    { externalDataSourceObj: { uploadProgress: _ } }, [me]],
                myDeleteControl: [{ children: { deleteControl: _ } }, [me]]
            },
            children: {
                dataSourceName: {
                    description: {
                        context: {
                            // API for DataSourceName
                            displayText: [{ name: _ }, [embedding]]
                        }
                    }
                },
                dataSourceIcon: {
                    description: {
                        "class": "ExternalDataSourceIcon"
                    }
                },
                deleteControl: {
                    description: {
                        "class": "ExternalDataSourceDeleteControl"
                    }
                }
            },
            write: {
                onExternalDataSourceClick: {
                    "class": "OnMouseClick",
                    true: {
                        loadMeToApp: {
                            to: [{ loadedDataSourceID: _ }, [me]],
                            merge: [{ id: _ }, [{ externalDataSourceObj: _ }, [me]]]
                        }
                    }
                },
                onExternalDataSourceDeleteControlOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        deleteDatasource: {
                            to: [{ id: [{ externalDataSourceObj: { id: _ } }, [me]] }, [databases]],
                            merge: { remove: true }
                        }
                    }
                }
            }
        },
        // this variant is turned on while the upload is in progress
        {
            qualifier: { uploadProgress: true },
            children: {
                dataUploadProgress: {
                    description: {
                        "class": "ExternalDataUploadProgress"
                    }
                }
            }
        },
        {
            qualifier: { iAmTheDataSourceLoaded: true },
            write: {
                onExternalDataSourceDeleteControlOnAct: {
                    // upon: see default clause above
                    true: {
                        clearLoadedExternalDataSourceObj: {
                            to: [{ loadedDataSourceID: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable              
                    description: {
                        "class": "DeleteExternalDataSourceDialog"
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteExternalDataSourceDialog: {
        "class": o("OKCancelModalDialog"),
        context: {
            myExternalDataSource: [{ myModalDialogable: _ }, [me]]
        },
        children: {
            textDisplay: {
                description: {
                    "class": "DeleteExternalDataSourceDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "DeleteExternalDataSourceDialogOKControl"
                }
            }
            // cancelControl defined by OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DeleteExternalDataSourceDialogText: {
        "class": "OKCancelDialogText",
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { deleteStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStr: _ } }, [me]],
                    " ",
                    [{ myExternalDataSource: { myName: { displayText: _ } } }, [embedding]],
                    " ",
                    [{ myApp: { permanentlyStr: _ } }, [me]],
                    "?"
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DeleteExternalDataSourceDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourceIcon: {
        "class": o("ExternalDataSourceIconDesign", "DataSourceIcon")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ExternalDataSourceDeleteControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                show: [and,
                    [{ inFocus: _ }, [embedding]],
                    [not, [{ draggedOpenedLocalFileAD: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("ExternalDataSourceDeleteControlDesign", "AppControl", "CreateModalDialogOnClick", "TrackDataSourceApp"),
            context: {
                // AppControl params
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { deleteStr: _ } }, [me]],
                        " ",
                        [{ myApp: { remoteStr: _ } }, [me]],
                        " ",
                        [{ myApp: { dataSourceEntityStr: _ } }, [me]]
                    )
                ],
                defaultWidth: false,
                defaultHeight: false,

                createModalDialog: [{ createModalDialog: _ }, [embedding]] // CreateModalDialogOnClick param
            },
            position: {
                "vertical-center": 0,

                rightNotToExceedEmbedding: {
                    point1: { type: "right" },
                    point2: { element: [embedding], type: "right" },
                    min: 0
                },
                attachLeftToRightContentOfName: {
                    point1: { element: [{ myName: _ }, [embedding]], type: "right", content: true },
                    point2: { type: "left" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault // so it loses out to rightNotToExceedEmbedding above                    
                }
            }
            // click handler: see the associated externalDataSource
        },
        {
            qualifier: { show: false },
            position: {
                height: 0
            }
        }
    ),

    ExternalDataUploadProgress: o(
        { // default
            context: {
                dataTransferred: [{ uploadProgress: { dataTransferred: _ } },
                [embedding]],
                showUploadProgressBar: [arg, "showUploadProgressBar", false]
            },
            display: {
                // gray-out the database element while upload is in progress
                background: "white",
                opacity: 0.6
            },
            position: {
                frame: 0
            }
        },
        {
            // The size of the progress bar is proportional to the amount
            // of data already uploaded to the server. This is currently
            // turned off by default because the browser does not seem to
            // be able to refresh this element frequently enough while uploading
            // the data.
            qualifier: { showUploadProgressBar: true },
            children: {
                progressBar: {
                    description: {
                        "class": "ExternalDataUploadProgressBar"
                    }
                }
            }
        }
    ),
    ExternalDataUploadProgressBar: o(
        { // default
            display: {
                background: "green",
                opacity: 0.3
            },
            position: {
                left: 0,
                top: 0,
                bottom: 0,
                // the width of this area is proportional to the
                // progress of the data transfer.
                widthByProgress: {
                    pair1: {
                        point1: { type: "left", element: [embedding] },
                        point2: { type: "right", element: [embedding] }
                    },
                    pair2: {
                        point1: { type: "left" },
                        point2: { type: "right" }
                    },
                    ratio: [{ dataTransferred: _ }, [embedding]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DropSiteForDraggedOpenedLocalFile: {
        "class": o("DropSiteForDraggedOpenedLocalFileDesign", "GeneralArea", "AboveSiblings"),
        context: {
            margin: [{ bFSAppDataSourcePosConst: { marginAroundDropSiteForDraggedOpenedLocalFile: _ } }, [globalDefaults]]
        },
        position: {
            attachLeftToHorizontalSeparatorRight: {
                point1: {
                    element: [areaOfClass, "DataSourceSelectorsHorizontalSeparator"],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: [{ margin: _ }, [me]]
            },
            attachRightToExternalDataSourceSelectorRight: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [areaOfClass, "ExternalDataSourceSelector"],
                    type: "right",
                    content: true
                },
                equals: 0
            },
            attachTopToTopSeparatorBottom: {
                point1: {
                    element: [areaOfClass, "DataSourceSelectorsTopSeparator"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ margin: _ }, [me]]
            },
            attachBottomToBottomSeparatorTop: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [areaOfClass, "DataSourceSelectorsBottomSeparator"],
                    type: "top"
                },
                equals: [{ margin: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceLoadErrorDialog: {
        "class": o("DataSourceLoadErrorDialogDesign", "OKCancelModalDialog"),
        context: {
            displayCancelControl: false
        },
        children: {
            textDisplay: {
                description: {
                    "class": "DataSourceLoadErrorDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "DataSourceLoadErrorDialogOKControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceLoadErrorDialogText: {
        "class": o("OKCancelDialogText"),
        context: {
            dbErrorMsgPrefix: [concatStr,
                o(
                    [{ myApp: { errorInLoading: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { fileEntityStr: _ } }, [me]]
                )
            ],
            displayText: [cond,
                [{ loadedLocalFileObj: _ }, [me]],
                o(
                    {
                        on: false,
                        use: [{ dbErrorMsgPrefix: _ }, [me]]
                    },
                    {
                        on: true,
                        use: [cond,
                            [{ myApp: { dataSourceConfigError: _ } }, [me]],
                            o(
                                {
                                    on: true,
                                    use: [concatStr,
                                        o(
                                            [{ myApp: { errorInLoadingConfigurationFile: _ } }, [me]],
                                            ":",
                                            "\n",
                                            [{ myApp: { dataSourceConfigObj: { info: _ } } }, [me]]
                                        )]
                                },
                                {
                                    on: false,
                                    use: [cond,
                                        [{ myApp: { dataSourceError: _ } }, [me]],
                                        o(
                                            {
                                                on: true,
                                                use: [concatStr, // dataSourceError
                                                    o(
                                                        [{ dbErrorMsgPrefix: _ }, [me]],
                                                        "\n",
                                                        [{ myApp: { dataSourceObj: { info: _ } } }, [me]]
                                                    )]
                                            },
                                            { // either facetOrderingDuplicateValError and/or facetObjectsDuplicateValError are true
                                                on: false,
                                                use: [concatStr,
                                                    o("Configuration File Contains Duplicate Entries:\n",
                                                        [cond,
                                                            [{ myApp: { facetOrderingDuplicateValError: _ } }, [me]],
                                                            o(
                                                                {
                                                                    on: true,
                                                                    use: [concatStr,
                                                                        o(
                                                                            "facetOrdering: ",
                                                                            [concatStr,
                                                                                [{ myApp: { facetOrderingDuplicateValError: _ } }, [me]],
                                                                                ", "
                                                                            ],
                                                                            "\n"
                                                                        )
                                                                    ]
                                                                }
                                                            )
                                                        ],
                                                        [cond,
                                                            [{ myApp: { facetObjectsDuplicateValError: _ } }, [me]],
                                                            o(
                                                                {
                                                                    on: true,
                                                                    use: [concatStr,
                                                                        o(
                                                                            "facetObjects: ",
                                                                            [concatStr,
                                                                                [{ myApp: { facetObjectsDuplicateValError: _ } }, [me]],
                                                                                ", "
                                                                            ]
                                                                        )
                                                                    ]
                                                                }
                                                            )
                                                        ]
                                                    )
                                                ]
                                            }
                                        )
                                    ]

                                }
                            )
                        ]
                    }
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceLoadErrorDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceModalDialog: o(
        {   // default
            "class": o("OKCancelModalDialogWithTextInput", "TrackDataSourceApp"),
            context: {
                verticalSpacingBetweenElements: generalPosConst.modalDialogMinMarginAroundEmbeddedElements
            },
            children: {
                textDisplay: {
                    description: {
                        "class": "UploadDataSourceModalDialogText"
                    }
                },
                dataSourceName: {
                    description: {
                        "class": "UploadDataSourceName"
                    }
                },
                okControl: {
                    description: {
                        "class": "UploadDataSourceModalDialogOKControl"
                    }
                },
                cancelControl: {
                    description: {
                        "class": "UploadDataSourceModalDialogOKCancelControl"
                    }
                }
            }
        },
        {
            qualifier: { ofPreloadedApp: true }, //, allowDataSourceUploading: true
            children: {
                textDisplayTimestamp: {
                    description: {
                        "class": "UploadDataSourceModalDialogTimestamp"
                    }
                },
                dataSourceTimestamp: {
                    description: {
                        "class": "UploadDataSourceTimestamp"
                    }
                },
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceModalDialogText: {
        "class": "OKCancelDialogText",
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { uploadedStr: _ } }, [me]],
                    " ",
                    [{ myApp: { dataSourceEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { nameEntityStr: _ } }, [me]],
                    ":"
                )
            ],
            padding: 0 // override default from OKCancelDialogText
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceName: o(
        { // default      
            "class": o("UploadDataSourceNameDesign", "GeneralArea", "DisplayDimension", "ModalDialogTextInputElement", "TrackDataSourceApp"),
            context: {
                // TextInput params 
                initInputAppData: [{ uploadedFileObj: { name: _ } }, [me]],
                elementBelow: [{ myControls: _ }, [me]],
                placeholderInputText: [concatStr,
                    o(
                        "<",
                        [{ myApp: { uploadedStr: _ } }, [me]],
                        " ",
                        [{ myApp: { dataSourceEntityStr: _ } }, [me]],
                        " ",
                        [{ myApp: { nameEntityStr: _ } }, [me]],
                        ">"
                    )
                ],
                inputTextValuesAlreadyUsed: [{ name: _ }, [databases]],

                myText: [
                    [areaOfClass, "UploadDataSourceModalDialogText"],
                    [embedded, [embedding]]
                ]
            },
            position: {
                "horizontal-center": 0,
                width: [{ bFSAppDataSourcePosConst: { widthOfUploadedDataSourceName: _ } }, [globalDefaults]],
                attachTopToBottomOfText: {
                    point1: { element: [{ myText: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: generalPosConst.modalDialogControlVerticalMarginFromText
                },
                attachBottomToTopOfControls: {
                    point1: { type: "bottom" },
                    point2: { element: [{ elementBelow: _ }, [me]], type: "top" },
                    equals: [mul,
                        generalPosConst.modalDialogControlVerticalMarginFromText,
                        2
                    ]
                }
            }
        },
        {
            qualifier: { ofPreloadedApp: true },
            context: {
                elementBelow: [
                    [areaOfClass, "UploadDataSourceModalDialogTimestamp"],
                    [embedded, [embedding]]
                ]
            }
        },
        {
            qualifier: { inputTextAlreadyBeingUsed: true },
            context: {
                inputErrorMsg: "Error: Data Source Name Already Used" // override default value
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceModalDialogTimestamp: {
        "class": o("GeneralArea", "OKCancelDialogText"),
        context: {
            displayText: [concatStr,
                o(
                    "Insert Database Timestamp (",
                    [{ myApp: { defaultDateFormat:_ } }, [me]],
                    "):"
                )
            ],
            elementAbove: [
                [areaOfClass, "UploadDataSourceName"],
                [embedded, [embedding]]
            ],
            padding: 0 // override default from OKCancelDialogText
        },
        position: {
            attachBelowUploadDataSourceName: {
                point1: { element: [{ elementAbove: _ }, [me]], type: "bottom" },
                point2: { type: "top" },
                equals: generalPosConst.modalDialogControlVerticalMarginFromText
            },
        }

    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // uploadedFileObj among other things contains:
    // - lastModified: time stamp of last modified date of file (in millliseconds)
    // - lastModifiedDate: string representing last modified date of file
    UploadDataSourceTimestamp: o(
        { // default      
            "class": o("UploadDataSourceNameDesign", "GeneralArea", "DisplayDimension", "ModalDialogTextInputElement", "TrackDataSourceApp"), //"TextInput", 
            context: {
                // TextInput params 
                lastModified: [div, [{ uploadedFileObj: { lastModified: _ } }, [me]], 1000],
                dateFormat: [{ myApp: { defaultDateFormat:_ } }, [me]],
                initInputAppData: [numToDate, [{ lastModified: _ }, [me]], [{ dateFormat: _ }, [me]]], //"31/01/2017",
                placeholderInputText: [{ dateFormat: _ }, [me]],
                inputTextValuesAlreadyUsed: [{ metaData: { timestamp: _ } }, [databases]],
                timestamp: [dateToNum, [{ displayText: _ }, [me]], [{ dateFormat: _ }, [me]]],

                myText: [
                    [areaOfClass, "UploadDataSourceModalDialogTimestamp"],
                    [embedded, [embedding]]
                ],

                inputTextAlreadyBeingUsed: [ //overwrite default 
                    [dateToNum, [{ param: { input: { value: _ } } }, [me]], [{ dateFormat: _ }, [me]]],
                    [{ inputTextValuesAlreadyUsed: _ }, [me]]
                ],
            },
            position: {
                "horizontal-center": 0,
                width: [{ bFSAppDataSourcePosConst: { widthOfUploadedDataSourceName: _ } }, [globalDefaults]],
                attachTopToBottomOfText: {
                    point1: { element: [{ myText: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: generalPosConst.modalDialogControlVerticalMarginFromText
                },
                attachBottomToTopOfControls: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myControls: _ }, [me]], type: "top" },
                    equals: [mul,
                        generalPosConst.modalDialogControlVerticalMarginFromText,
                        2
                    ]
                }
            }
        },
        {
            qualifier: { inputTextAlreadyBeingUsed: true },
            context: {
                inputErrorMsg: "Error: Timestamp Already Used" // override default value
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceModalDialogOKCancelControl: {
        "class": o("GeneralArea", "TrackDataSourceApp"),
        context: {
            defaultVerticalSpacing: false, // turn off default attachment to sibling OKCancelDialogText
            // see UploadDataSourceName for vertical spacing constraints
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    UploadDataSourceModalDialogOKControl: {
        "class": o(
            "UploadDataSourceModalDialogOKControlDesign",
            "UploadDataSourceModalDialogOKCancelControl",
            "OKCancelDialogWithTextInputOKControl"
        ),
        context: {
            displayText: "Upload",

            // override default definition: 
            // it's anabled only if all inputTexts are valid
            enabled: [empty, [false, [{ myTextInput: { valid: _ } }, [me]]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsVerticalSeparator: {
        "class": o("GeneralArea", "TrackDataSourceApp"),
        position: {
            attachToAppFrameLeft: {
                point1: { type: "left" },
                point2: { element: [areaOfClass, "AppFrame"], type: "left" },
                equals: 0
            },
            attachToAppFrameRight: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "AppFrame"], type: "right" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsTopSeparator: {
        "class": o("DataSourceSelectorsTopSeparatorDesign", "DataSourceSelectorsVerticalSeparator"),
        position: {
            height: [{ bFSAppDataSourcePosConst: { dataSourceSelectorTopSeparatorHeight: _ } }, [globalDefaults]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    DataSourceSelectorsBottomSeparator: o(
        { // default
            "class": o("DataSourceSelectorsBottomSeparatorDesign", "DataSourceSelectorsVerticalSeparator"),
            position: {
                height: [{ bFSAppDataSourcePosConst: { dataSourceSelectorsBottomSeparatorHeight: _ } }, [globalDefaults]],
                bottom: 0
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            children: {
                showPaneControl: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "DataSourceShowPaneControl"
                    }
                }
            }
        },
        {
            qualifier: { showDataSourcePane: false },
            position: {
                top: 1
                // for showDataSourcePane: true, top is defined elsewhere.
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsHorizontalSeparator: {
        "class": o("DataSourceSelectorsHorizontalSeparatorDesign", "GeneralArea", "AboveSiblings"),
        context: {
            width: [plus,
                [{ bFSAppDataSourcePosConst: { dataSourceSelectorHorizontalSeparatorWidth: _ } }, [globalDefaults]],
                [mul,
                    [{ bFSAppDataSourcePosConst: { horizontalMarginAroundHorizontalSeparator: _ } }, [globalDefaults]],
                    2
                ]
            ]
        },
        position: {
            attachToLeftmostDataSourceSelectorRight: {
                point1: { element: [areaOfClass, "LeftmostDataSourceSelector"], type: "right" },
                point2: { type: "left" },
                equals: 0
            },
            attachToRightmostDataSourceSelectorLeft: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "RightmostDataSourceSelector"], type: "left" },
                equals: 0
            },
            width: [{ width: _ }, [me]],
            attachTopToTopSeparator: {
                point1: { element: [areaOfClass, "DataSourceSelectorsTopSeparator"], type: "bottom" },
                point2: { type: "top" },
                equals: [{ bFSAppDataSourcePosConst: { horizontalSeparatorVerticalMargin: _ } }, [globalDefaults]]
            },
            attachBottomToBottomSeparator: {
                point1: { type: "bottom" },
                point2: { element: [areaOfClass, "DataSourceSelectorsBottomSeparator"], type: "top" },
                equals: [{ bFSAppDataSourcePosConst: { horizontalSeparatorVerticalMargin: _ } }, [globalDefaults]]
            },
        },
        stacking: {
            lowerThanTheExpansionHandle: {
                lower: [me],
                higher: [
                    { myExpandable: [areaOfClass, "DataSourceLocalFileSelector"] },
                    [areaOfClass, "ExpansionHandle1D"]
                ]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceFileDrop: {
        "class": o("GeneralArea", "AboveAppZTop", "DataSourceEmbedFileHotspot")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceLocalLoadFileDrop: {
        "class": o("DataSourceLocalLoadFileDropDesign", "DataSourceFileDrop"),
        context: {
            displayText: "Drop Data File Here to Work Locally"
        },
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceRemoteUploadFileDrop: {
        "class": o("DataSourceRemoteUploadFileDropDesign", "DataSourceFileDrop"),
        context: {
            displayText: "or Here to also Upload Data to the Server"
        },
        stacking: {
            aboveLocalLoadFileDrop: {
                higher: [me],
                lower: [{ myApp: { dropLocalFile: _ } }, [me]]
            }
        },
        position: {
            left: [{ bFSAppDataSourcePosConst: { marginAroundRemoteUploadFileDrop: _ } }, [globalDefaults]],
            right: [{ bFSAppDataSourcePosConst: { marginAroundRemoteUploadFileDrop: _ } }, [globalDefaults]],
            bottom: [{ bFSAppDataSourcePosConst: { marginAroundRemoteUploadFileDrop: _ } }, [globalDefaults]],
            attachToVerticalCenterOfDropLocalFile: {
                point1: {
                    element: [{ myApp: { dropLocalFile: _ } }, [me]],
                    type: "vertical-center"
                },
                point2: { type: "top" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceDragAndDropFileInvitationContainer: o(
        { // default
            "class": o("DataSourceDragAndDropFileInvitationContainerDesign", "GeneralArea"),
            position: {
                attachTop: {
                    point1: {
                        element: [areaOfClass, "DataSourceSelectors"],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ bFSAppDataSourcePosConst: { marginBelowDataSourceSelectorsOnLandingPage: _ } }, [globalDefaults]]
                },
                left: [{ bFSAppDataSourcePosConst: { invitationTextContainerMargin: _ } }, [globalDefaults]],
                right: [{ bFSAppDataSourcePosConst: { invitationTextContainerMargin: _ } }, [globalDefaults]],
                bottom: [{ bFSAppDataSourcePosConst: { invitationTextContainerMargin: _ } }, [globalDefaults]]
            },
            children: {
                frame: {
                    description: {
                        "class": "DataSourceDragAndDropFileInvitationFrame"
                    }
                },
                text: {
                    description: {
                        "class": "DataSourceDragAndDropFileInvitationText"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DataSourceDragAndDropFileInvitationFrame: {
        "class": o("DataSourceDragAndDropFileInvitationFrameDesign", "GeneralArea"),
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is not the text that appears while a file is actually being dragged. Rather, it is the generic invitation to the user to drag&drop a file    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceDragAndDropFileInvitationText: {
        "class": o("DataSourceDragAndDropFileInvitationTextDesign", "GeneralArea", "DisplayDimension"),
        context: {
            displayText: "drag&drop data file (csv/json)"
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DataSourceSelectorsViewControl: o(
        { // default
            "class": o(
                "DataSourceSelectorsViewControlDesign",
                "GeneralArea",
                "AppControl",
                "TrackDataSourceApp"
            ),
            context: {
                tooltipable: false, // turn off AppControl default
                blockMouseUp: false, // allow propagation to the embedding EffectiveBaseSummary, to open the dataSource pane by clicking.
                blockMouseClick: false,

                enabled: [{ allowDataSourceUploading: _ }, [me]]
            },
            position: {
                left: 0,
                //"vertical-center": 0,
                attachToEffectiveBaseVertically: {
                    point1: { type: "vertical-center" },
                    point2: {
                        element: [areaOfClass, "EffectiveBaseName"],
                        type: "vertical-center"
                    },
                    equals: 0
                },
                attachToEffectiveBaseHorizontally: {
                    point1: { type: "right" },
                    point2: {
                        element: [areaOfClass, "EffectiveBaseName"],
                        type: "left"
                    },
                    equals: bFSAppPosConst.effectiveBaseSummaryHorizontalMargin
                }
            }
        },
        {
            qualifier: { allowDataSourceUploading: true },
            "class": "ShowDataSourcePaneControlHandler"
        }
    )
};
