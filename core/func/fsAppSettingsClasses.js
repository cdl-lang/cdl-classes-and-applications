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

// %%classfile%%: <fsAppSettingsDesignClasses.js>

initGlobalDefaults.appSettingsControls = {
    aboutDialogWidth: 600,
    aboutModalDialogTitleHeight: 30,
    aboutModalDialogTitleVerticalMargin: 20,
    aboutModalDialogViewSeparatorHeight: 1,
    aboutModalDialogViewHorizontalMargin: 10,
    aboutModalDialogViewVerticalMargin: 10,
    aboutModalDialogOKControlVerticalMargin: 10,
    aboutModalDialogDocHorizontalMarginFromView: 20,
    aboutModalDialogDocTitleRowHeight: 20,
    aboutModalDialogDocInterParagraphSpacing: 10,
    aboutModalDialogDocIntraParagraphSpacing: 0,
    aboutModalDialogViewMaxHeight: 250
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FSAppSettingsControls: o(
        {
            "class": o("MinWrapHorizontal", "AboveSiblings", "TrackDataSourceApp"),
            context: {
                // to ensure that this priority - on the vertical axis, wins the minWrap of the AppFrame and its embeddedStar, in FatFSApp          
                minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure
            },
            position: {
                height: bFSAppPosConst.appControlsHeight
            },
            children: {
                densityController: {
                    description: {
                        "class": "DensityController"
                    }
                },
                connectionIndicator: {
                    description: {
                        "class": "AppStateConnectionIndicator"
                    }
                },
                userMenuController: {
                    description: {
                        "class": "FSAppUserMenuController"
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    LeanFSAppSettingsControls: {
        "class": "FSAppSettingsControls",
        position: {
            horizontalPositionOfControls: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "AppFrame"], type: "right" },
                equals: 10
            },
            verticalPositionOfControls: {
                point1: { type: "vertical-center" },
                point2: { element: [areaOfClass, "EffectiveBaseSummary"], type: "vertical-center" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FatFSAppSettingsControls: {
        "class": "FSAppSettingsControls",
        position: {
            horizontalPositionOfControls: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "AppFrame"], type: "right" },
                equals: 0
            },
            verticalPositionOfControls: {
                point1: { type: "top" },
                point2: { element: [embedding], type: "top" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of FSAppUserMenu Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Server Connection Status Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppUserMenuController: o(
        { // default
            "class": o(
                "FSAppUserMenuControllerDesign",
                "GeneralArea",
                "MoreControlsController",
                "MoreControlsOnClickUXCore"
            ),
            context: {
                myMoreControlsController: [me],
                tooltipText: "User Menu"
            },
            position: {
                height: bFSAppPosConst.appSettingsControlHeight,
                width: bFSAppPosConst.appSettingsControlWidth,
                "vertical-center": 0,
                right: 0
            },
            children: {
                resetModalDialogable: {
                    description: {
                        "class": "FSAppResetModalDialogable"
                    }
                },
                aboutModalDialogable: {
                    description: {
                        "class": "FSAppAboutModalDialogable"
                    }
                }
            }
        },
        {
            qualifier: { moreControlsOpen: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "FSAppUserMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppUserMenu: {
        "class": o("GeneralArea", "MoreControlsMenu"),
        context: {
            menuData: o(
                {
                    uniqueID: "resetApp",
                    displayText: [concatStr,
                        o(
                            [{ myApp: { resetStr: _ } }, [me]],
                            [{ myApp: { appEntityStr: _ } }, [me]]
                        ),
                        " "
                    ]
                },
                {
                    uniqueID: "print",
                    displayText: [{ myApp: { printStr: _ } }, [me]]
                },
                {
                    uniqueID: "download",
                    displayText: [{ myApp: { downloadStr: _ } }, [me]]
                },
                {
                    uniqueID: "about",
                    displayText: [{ myApp: { aboutStr: _ } }, [me]]
                }
            )
        },
        children: {
            menuItems: {
                data: [{ menuData: _ }, [me]],
                description: {
                    "class": "FSAppUserMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppUserMenuItem: o(
        { // default
            "class": o("GeneralArea", "MenuItemDirect")
        },
        {
            qualifier: { uniqueID: "resetApp" },
            "class": "FSAppResetAppMenuItem"
        },
        {
            qualifier: { uniqueID: "about" },
            "class": "FSAppAboutMenuItem"
        },
        {
            qualifier: { uniqueID: "print" },
            write: {
                onClick: {
                    upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                    true: {
                        printApp: {
                            to: [printArea],
                            merge: [{myApp: _}, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { uniqueID: "download" },
            write: {
                onClick: {
                    upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                    true: {
                        printApp: {
                            to: [download, "application", "png"],
                            merge: [{myApp: _}, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. menuItemModalDialogable: an areaRef to a class inheriting FSAppMenuItemModalDialogable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppMenuItemCreateModalDialog: {
        "class": "CreateModalDialogOnClick",
        context: {
            createModalDialog: [{ menuItemModalDialogable: { createModalDialog: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppResetAppMenuItem: {
        "class": "FSAppMenuItemCreateModalDialog",
        context: {
            menuItemModalDialogable: [areaOfClass, "FSAppResetModalDialogable"]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppAboutMenuItem: {
        "class": "FSAppMenuItemCreateModalDialog",
        context: {
            menuItemModalDialogable: [areaOfClass, "FSAppAboutModalDialogable"],
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This area exists throughout, whereas FSAppMenuItemCreateModalDialog exists only when the menu is open. once the latter is clicked on, the menu is closed.
    // to allow the modal dialog to exist even after the closing of the menu, it is created and responded to by FSAppMenuItemModalDialogable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppMenuItemModalDialogable: {
        "class": o("GeneralArea", "ModalDialogable"),
        position: {
            frame: 0
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppResetModalDialogable: o(
        { // default
            "class": o("FSAppMenuItemModalDialogable", "TrackDataSourceApp"),
            write: {
                onFSAppResetModalDialogableOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        resetAllSearchFields: {
                            to: [{ myApp: { allSearchBoxesFields: _ } }, [me]],
                            merge: o()
                        },
                        resetSortingController: {
                            to: [{ myApp: { specifiedSortingKey: _ } }, [me]],
                            merge: o()
                        },
                        resetUDFData: {
                            to: [{ uDFData: _ }, [areaOfClass, "UDFController"]],
                            merge: o()
                        },
                        resetNewUDFCounter: {
                            to: [{ newUDFCounter: _ }, [areaOfClass, "UDFController"]],
                            merge: o()
                        },
                        resetUDFExpressionClipboard: { // this is NPAD!
                            to: [{ expressionClipboard: _ }, [areaOfClass, "UDFController"]],
                            merge: o()
                        },
                        resetFacetNPADData: {
                            to: [{ myApp: { facetNPADData: _ } }, [me]],
                            merge: o()
                        },
                        resetCrossViewFacetData: {
                            to: [{ myApp: { crossViewFacetData: _ } }, [me]],
                            merge: o()
                        },

                        resetCrossViewOverlayData: {
                            to: [{ myApp: { crossViewOverlayData: _ } }, [me]],
                            merge: [{ myApp: { initOverlayData: _ } }, [me]] // replace with o() once #1866 is fixed
                        },
                        resetTrashedOrderFacetUniqueID: {
                            to: [{ myApp: { trashedOrderFacetUniqueID: _ } }, [me]],
                            merge: o()
                        },
                        resetTrashedOrderOverlayUniqueID: {
                            to: [{ myApp: { trashedOrderOverlayUniqueID: _ } }, [me]],
                            merge: o()
                        },
                        resetZoomBoxingOverlaysByUser: {
                            to: [{ myApp: { zoomBoxingOverlaysByUser: _ } }, [me]],
                            merge: o()
                        },
                        resetNewOverlayCounter: {
                            to: [{ myApp: { newOverlayCounter: _ } }, [me]],
                            merge: o()
                        },

                        resetSavedViewData: {
                            to: [{ myApp: { saveViewController: { savedViewData: _ } } }, [me]],
                            merge: o()
                        },
                        resetCurrentView: {
                            to: [{ myApp: { currentView: _ } }, [me]],
                            merge: o()
                        },
                        resetLoadedSavedViewUniqueID: {
                            to: [{ myApp: { saveViewController: { loadedSavedViewUniqueID: _ } } }, [me]],
                            merge: o()
                        },
                        resetNewViewCounter: {
                            to: [{ myApp: { saveViewController: { newViewCounter: _ } } }, [me]],
                            merge: o()
                        },
                        resetSavedViewPaneHorizontallyMinimized: {
                            to: [{ horizontallyMinimized: _ }, [areaOfClass, "SavedViewPane"]],
                            merge: o()
                        },
                        resetMinimizedFacetViewPaneHorizontallyMinimized: {
                            to: [{ horizontallyMinimized: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: o()
                        },
                        resetMinimizedFacetViewPaneTagsPaneControlsAD: {
                            to: [{ showTagsViewPaneAD: _ }, [areaOfClass, "FacetTagsController"]],
                            merge: o()
                        },
                        resetMinimizedFacetViewPaneUserDefinedTagsObj: {
                            to: [{ userDefinedTagsObj: _ }, [areaOfClass, "FacetTagsController"]],
                            merge: o()
                        },
                        resetMinimizedFacetViewPaneUserSelectedTag: {
                            to: [{ userSelectedTagsAD: _ }, [areaOfClass, "FacetTagsController"]],
                            merge: o()
                        },
                        resetMinimizedFacetViewPaneTagsViewPaneHeight: {
                            to: [{ tagsViewPaneStableExpandableHeight: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: o()
                        },
                        resetMinimizedFacetPaneTagsViewUserExpandedVertically: {
                            to: [{ tagsViewPaneUserExpandedVertically: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: false
                        },
                        resetMinimizedFacetPaneTagsViewUserDoubleClickedVertically: {
                            to: [{ tagsViewPaneUserDoubleClickedVertically: _ }, [areaOfClass, "MinimizedFacetViewPane"]],
                            merge: false
                        },

                        resetSnappableControllerCoreFiV: {
                            to: [{ specifiedFiVUniqueID: _ }, [areaOfClass, "SnappableControllerCore"]],
                            merge: o()
                        },
                        resetContMovableControllerCoreScrollerPos: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [areaOfClass, "ContMovableControllerCore"]],
                            merge: o()
                        },

                        resetAppTrashOpen: {
                            to: [{ open: _ }, [areaOfClass, "AppTrash"]],
                            merge: false
                        },
                        resetAppTrashSelectedTab: {
                            to: [{ selectedTab: _ }, [areaOfClass, "AppTrash"]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofPreloadedApp: false },
            write: {
                onFSAppResetModalDialogableOnAct: {
                    // upon: see in default clause above
                    true: {
                        resetItemUniqueID: {
                            to: [{ myApp: { itemUniqueID: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofPreloadedApp: true },
            write: {
                onFSAppResetModalDialogableOnAct: {
                    // upon: see in default clause above
                    true: {
                        resetLoadedDataSourceName: {
                            to: [{ myApp: { loadedDataSourceTimestamp: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { allowDataSourceUploading: true },
            write: {
                onFSAppResetModalDialogableOnAct: {
                    // upon: see in default clause above
                    true: {
                        resetShowDataSourcePane: {
                            to: [{ myApp: { showDataSourcePane: _ } }, [me]],
                            merge: o()
                        },
                        resetHorizontalSeparatorBetweenLocalAndExternalDataSources: {
                            to: [{ horizontalSeparatorAD: _ }, [areaOfClass, "DataSourceSelectors"]],
                            merge: o()
                        },
                        resetBottomSeparatorOfDataSourceSelectors: {
                            to: [{ bottomSeparatorAD:_ }, [areaOfClass, "DataSourceSelectors"]],
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
                        "class": "AppResetModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppResetModalDialog: {
        "class": o("OKCancelModalDialog"),
        context: {
            defaultAreaInFocus: [
                [areaOfClass, "OKCancelDialogCancelControl"],
                [{ osOfAreasInFocus: _ }, [me]]
            ]
        },
        children: {
            textDisplay: {
                description: {
                    "class": "AppResetModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "AppResetModalDialogOKControl"
                }
            }
            // cancelControl defined by OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppResetModalDialogText: {
        "class": "OKCancelDialogText",
        context: {
            displayText: "Warning:\nThis will erase all user data"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppResetModalDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This area exists throughout, whereas FSAppAboutMenuItem exists only when the menu is open. once the latter is clicked on, the menu is closed.
    // to allow the modal dialog to exist even after the closing of the menu, it is created and responded to by FSAppAboutModalDialogable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSAppAboutModalDialogable: o(
        { // default
            "class": "FSAppMenuItemModalDialogable",
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable              
                    description: {
                        "class": "AppAboutModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialog: {
        "class": o("AppAboutModalDialogDesign", "OKCancelModalDialog"),
        context: {
            // OKCancelModalDialog param
            displayCancelControl: false, // override default
            showAttentionIcon: false // override default
        },
        position: {
            width: [{ appSettingsControls: { aboutDialogWidth: _ } }, [globalDefaults]]
        },
        children: {
            title: {
                description: {
                    "class": "AppAboutModalDialogTitle"
                }
            },
            aboveViewSeparator: {
                description: {
                    "class": "AppAboutModalDialogAboveViewSeparator"
                }
            },
            view: {
                description: {
                    "class": "AppAboutModalDialogView"
                }
            },
            scrollbar: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [areaOfClass, "AppAboutModalDialogView"],
                        attachToView: "end",
                        attachToViewOverlap: true
                    }
                }
            },
            belowViewSeparator: {
                description: {
                    "class": "AppAboutModalDialogBelowViewSeparator"
                }
            },
            okControl: {
                description: {
                    "class": "AppAboutModalDialogOKControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogTitle: {
        "class": o("AppAboutModalDialogTitleDesign", "GeneralArea", "TrackDataSourceApp"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { aboutStr: _ } }, [me]],
                    [{ myApp: { productName: _ } }, [me]]
                ),
                " "
            ]
        },
        position: {
            top: [{ appSettingsControls: { aboutModalDialogTitleVerticalMargin: _ } }, [globalDefaults]],
            height: [{ appSettingsControls: { aboutModalDialogTitleHeight: _ } }, [globalDefaults]],
            left: 0,
            right: 0,
            attachToTopSeparator: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ children: { aboveViewSeparator: _ } }, [embedding]],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogTitleVerticalMargin: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogViewSeparator: {
        "class": o("AppAboutModalDialogViewSeparatorDesign", "GeneralArea", "ModalDialogElement"),
        position: {
            height: [{ appSettingsControls: { aboutModalDialogViewSeparatorHeight: _ } }, [globalDefaults]],
            left: [{ appSettingsControls: { aboutModalDialogViewHorizontalMargin: _ } }, [globalDefaults]],
            right: [{ appSettingsControls: { aboutModalDialogViewHorizontalMargin: _ } }, [globalDefaults]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogAboveViewSeparator: {
        "class": "AppAboutModalDialogViewSeparator"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogBelowViewSeparator: {
        "class": "AppAboutModalDialogViewSeparator"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogView: {
        "class": o("GeneralArea", "ModalDialogElement", "VerticalContMovableController"),
        context: {
            beginningOfDocPoint: atomic({ element: [{ children: { doc: _ } }, [me]], type: "top" }),
            endOfDocPoint: atomic({ element: [{ children: { doc: _ } }, [me]], type: "bottom" })
        },
        position: {
            left: [{ appSettingsControls: { aboutModalDialogViewHorizontalMargin: _ } }, [globalDefaults]],
            right: [{ appSettingsControls: { aboutModalDialogViewHorizontalMargin: _ } }, [globalDefaults]],
            height: [{ appSettingsControls: { aboutModalDialogViewMaxHeight: _ } }, [globalDefaults]], // to do: shouldn't be higher than the doc itself!
            attachToSeparatorAbove: {
                point1: {
                    element: [{ children: { aboveViewSeparator: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogViewVerticalMargin: _ } }, [globalDefaults]]
            },
            attachToSeparatorBelow: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ children: { belowViewSeparator: _ } }, [embedding]],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogViewVerticalMargin: _ } }, [globalDefaults]]
            }
        },
        children: {
            doc: {
                description: {
                    "class": "AppAboutModalDialogDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDoc: o(
        { // variant-controller
            qualifier: "!",
            context: {
                includeDataProvider: [and,
                    [{ ofPreloadedApp: _ }, [me]],
                    [{ myApp: { dataSourceProvider: _ } }, [me]]
                ],
                includeOpenSource: [{ myApp: { listOfOpenSources: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrapVertical", "TrackDataSourceApp"),
            position: {
                left: [{ appSettingsControls: { aboutModalDialogDocHorizontalMarginFromView: _ } }, [globalDefaults]],
                right: [{ appSettingsControls: { aboutModalDialogDocHorizontalMarginFromView: _ } }, [globalDefaults]]
            },
            children: {
                version: {
                    description: {
                        "class": "AppAboutModalDialogDocVersion"
                    }
                },
                license: {
                    description: {
                        "class": "AppAboutModalDialogDocLicense"
                    }
                }
            }
        },
        {
            qualifier: { includeDataProvider: true },
            children: {
                dataProvider: {
                    description: {
                        "class": "AppAboutModalDialogDocDataProvider"
                    }
                }
            }
        },
        {
            qualifier: { includeOpenSource: true },
            children: {
                openSource: {
                    description: {
                        "class": "AppAboutModalDialogDocOpenSource"
                    }
                }
            }
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocElement: {
        "class": "GeneralArea",
        context: {
            myDoc: [areaOfClass, "AppAboutModalDialogDoc"]
        },
        position: {
            left: 0,
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocParagraph: {
        "class": o("AppAboutModalDialogDocElement", "MinWrapVertical", "TrackDataSourceApp")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogParagraphTitle: {
        "class": o("AppAboutModalDialogParagraphTitleDesign", "AppAboutModalDialogDocElement"),
        context: {
            myParagraphText: [
                [embedded, [embedding]],
                [areaOfClass, "AppAboutModalDialogParagraphText"]
            ]
        },
        position: {
            height: [{ appSettingsControls: { aboutModalDialogDocTitleRowHeight: _ } }, [globalDefaults]],
            attachToParagraphTextTop: {
                point1: { type: "bottom" },
                point2: {
                    element: [{ myParagraphText: _ }, [me]],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogDocIntraParagraphSpacing: _ } }, [globalDefaults]]
            }
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogParagraphCoreText: {
        "class": o("DisplayDimension", "AppAboutModalDialogDocElement"),
        context: {
            displayDimensionMaxWidth: [offset,
                { element: [{ myDoc: _ }, [me]], type: "left", content: true },
                { element: [{ myDoc: _ }, [me]], type: "right", content: true }
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogParagraphText: {
        "class": o("AppAboutModalDialogParagraphTextDesign", "AppAboutModalDialogParagraphCoreText")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. bulletPointsText: os of strings.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogParagraphBulletPoints: {
        "class": o("AppAboutModalDialogParagraphBulletPointsDesign", "AppAboutModalDialogParagraphCoreText"),
        context: {
            displayText: [concatStr,
                [map,
                    [defun,
                        o("bulletPointText"),
                        [concatStr,
                            o(
                                "●	",
                                "bulletPointText"
                            )
                        ]
                    ],
                    [{ bulletPointsText: _ }, [me]]
                ],
                "\n"
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocVersion: {
        "class": o("AppAboutModalDialogDocParagraph", "AppAboutModalDialogParagraphTitle"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { versionStr: _ } }, [me]],
                    ":",
                    " ",
                    buildInfo.rootRevision
                )
            ]
        },
        position: {
            attachBottomToLicenseParagraphTop: {
                point1: { type: "bottom" },
                point2: {
                    element: [{ children: { license: _ } }, [embedding]],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogDocInterParagraphSpacing: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocLicense: {
        "class": "AppAboutModalDialogDocParagraph",
        children: {
            title: {
                description: {
                    "class": "AppAboutModalDialogDocLicenseTitle"
                }
            },
            text: {
                description: {
                    "class": "AppAboutModalDialogDocLicenseText"
                }
            }
        },
        position: {
            attachBottomToDataProviderParagraphTop: {
                point1: { type: "bottom" },
                point2: {
                    element: [cond,
                        [{ myDoc: { includeDataProvider: _ } }, [me]],
                        o(
                            {
                                on: true,
                                use: [{ children: { dataProvider: _ } }, [embedding]]
                            },
                            {
                                on: false,
                                use: [{ children: { openSource: _ } }, [embedding]]
                            }
                        )
                    ],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogDocInterParagraphSpacing: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocLicenseTitle: {
        "class": "AppAboutModalDialogParagraphTitle",
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { licenseInformationForStr: _ } }, [me]],
                    [{ myApp: { productName: _ } }, [me]]
                ),
                " "
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocLicenseText: {
        "class": "AppAboutModalDialogParagraphText",
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { fullCopyrightStr: _ } }, [me]],
                    [{ myApp: { termsOfUseStr: _ } }, [me]]
                ),
                "\n"
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocDataProvider: {
        "class": "AppAboutModalDialogDocParagraph",
        children: {
            title: {
                description: {
                    "class": "AppAboutModalDialogDocDataProviderTitle"
                }
            },
            text: {
                description: {
                    "class": "AppAboutModalDialogDocDataProviderText"
                }
            }
        },
        position: {
            attachBottomToDataProviderParagraphTop: {
                point1: { type: "bottom" },
                point2: {
                    element: [{ children: { openSource: _ } }, [embedding]],
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogDocInterParagraphSpacing: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocDataProviderTitle: {
        "class": "AppAboutModalDialogParagraphTitle",
        context: {
            displayText: [{ myApp: { dataSourceAttributionTitleStr: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocDataProviderText: {
        "class": "AppAboutModalDialogParagraphText",
        context: {
            displayText: [{ myApp: { dataSourceProvider: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocOpenSource: {
        "class": "AppAboutModalDialogDocParagraph",
        children: {
            title: {
                description: {
                    "class": "AppAboutModalDialogDocOpenSourceTitle"
                }
            },
            text: {
                description: {
                    "class": "AppAboutModalDialogDocOpenSourceText"
                }
            },
            list: {
                description: {
                    "class": "AppAboutModalDialogDocOpenSourceList"
                }
            }
        },
        position: {
            bottom: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocOpenSourceTitle: {
        "class": "AppAboutModalDialogParagraphTitle",
        context: {
            displayText: [{ myApp: { openSourceTitleStr: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocOpenSourceText: {
        "class": "AppAboutModalDialogParagraphText",
        context: {
            displayText: [concatStr,
                [{ myApp: { openSourceTextStr: _ } }, [me]],
                "\n"
            ]
        },
        position: {
            attachBottomToTopOfList: {
                point1: { type: "bottom" },
                point2: {
                    element: [{ children: { list: _ } }, [embedding]],
                    type: "top"
                },
                equals: 0
            } 
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogDocOpenSourceList: {
        "class": o("AppAboutModalDialogDocOpenSourceListDesign", "AppAboutModalDialogParagraphBulletPoints"),
        context: {
            bulletPointsText: [{ myApp: { listOfOpenSources: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppAboutModalDialogOKControl: {
        "class": "OKCancelDialogOKControl",
        position: {
            bottom: [{ appSettingsControls: { aboutModalDialogOKControlVerticalMargin: _ } }, [globalDefaults]],
            attachToSeparatorBelow: {
                point1: {
                    element: [{ children: { belowViewSeparator: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: [{ appSettingsControls: { aboutModalDialogOKControlVerticalMargin: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of FSAppUserMenu Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Server Connection Status Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppStateConnectionIndicator: o(
        { // default
            "class": o("AppStateConnectionIndicatorDesign", "GeneralArea", "Tooltipable", "TrackAppStateRemoting", "TrackDataSourceSelected"),
            context: {
                compileInfoForTooltip: [concatStr,
                    o(
                        "Build Revision:", buildInfo.rootRevision,
                        "\n",
                        [cond,
                            correctCompilationFlags,
                            o(
                                {
                                    on: false,
                                    use: o(
                                        "Compilation Flags:", "\n",
                                        "compileVD: ", compileVD, "\n",
                                        "compileUDF: ", compileUDF, "\n",
                                        "compileSlider: ", compileSlider, "\n",
                                        "compileMS: ", compileMS, "\n",
                                        "compileRating: ", compileRating, "\n",
                                        "compileItems: ", compileItems, "\n",
                                        "compileOMF: ", compileOMF, "\n",
                                        "compileMinimizedFacets: ", compileMinimizedFacets, "\n",
                                        "compileMinimizedOverlays: ", compileMinimizedOverlays, "\n",
                                        "compileHistogram: ", compileHistogram, "\n",
                                        "compileTags: ", compileTags, "\n",
                                        "\n"
                                    )
                                }
                            )
                        ],
                        "date=", buildInfo.date, "\n",
                        "host=", buildInfo.host
                    )
                ]
            },
            position: {
                height: bFSAppPosConst.appSettingsControlHeight,
                width: bFSAppPosConst.appSettingsControlWidth
            }
        },
        {
            qualifier: { dataSourceSelected: false },
            position: {
                alignVerticallyWithExternalDataSourceSelectorTitle: {
                    point1: {
                        element: [areaOfClass, "ExternalDataSourceSelectorTitle"],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                },
                attachLeftToRightOfExternalDataSourceSelectorTitle: {
                    point1: {
                        element: [areaOfClass, "ExternalDataSourceSelectorTitle"],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bFSAppPosConst.connectionIndicatorFromExternalDataSourceSelectorTitle
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            position: {
                "vertical-center": 0,
                attachToFSAppUserMenuControllerLeft: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [areaOfClass, "FSAppUserMenuController"],
                        type: "left"
                    },
                    equals: bFSAppPosConst.appSettingsControlsHorizontalSpacing
                }
            }
        },
        {
            qualifier: { appStateRemotingServerAddress: true },
            context: {
                tooltipText: [concatStr,
                    o(
                        [{ compileInfoForTooltip: _ }, [me]],
                        "\n",
                        [{ appStateRemotingState: { owner: _ } }, [me]],
                        "@",
                        [{ appStateRemotingServerAddress: _ }, [me]],
                        ":",
                        [{ appStateRemotingState: { serverPort: _ } }, [me]],
                        [cond,
                            [notEqual, 0, [{ appStateRemotingErrorId: _ }, [me]]],
                            { on: true, use: [concatStr, o("\nError Message: ", [{ errorMessage: _ }, [tempAppStateConnectionInfo]])] }
                        ]
                    )
                ]
            }
        },
        {
            qualifier: { appStateRemotingServerAddress: false },
            context: {
                tooltipText: [{ compileInfoForTooltip: _ }, [me]]
            }
        }
    ),

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Server Connection Status Classes
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DensityController class
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DensityController: o(
        { // default
            "class": o(
                "GeneralArea",
                "MinWrap"
            ),
            context: {
                minWrapAround: 0,
                uniqueID: "DisplayDensity",
                name: "Display Density",
                localMode: [areaOfClass, "AppStateConnectionIndicator"],
                options: o(
                    { uniqueID: "V1", desc: "Dense Display", size: 11 },
                    { uniqueID: "V2", desc: "Standard Display", size: 15 },
                    { uniqueID: "V3", desc: "Spacious Display", size: 20 }
                ),
                option: [{ myApp: { displayDensity: _ } }, [me]],
                defaultOption: "V2"
            },
            position: {
                "vertical-center": 0,
                rightLocalMode: {
                    point1: { type: "right" },
                    point2: { element: [{ localMode: _ }, [me]], type: "left" },
                    equals: bFSAppPosConst.appSettingsControlsHorizontalSpacing
                }
            }
        },
        {
            qualifier: { densityControllerTextOrSvgABTest: "text" },
            children: {
                options: {
                    data: [{ options: _ }, [me]],
                    description: {
                        "class": "DensityOptionTextBased"
                    }
                }
            }
        },
        {
            qualifier: { densityControllerTextOrSvgABTest: "svg" },
            children: {
                options: {
                    data: [{ options: _ }, [me]],
                    description: {
                        "class": "DensityOptionSvgBased"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DensityOption: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                selectedOption: [equal,
                    [{ label: _ }, [me]],
                    [{ option: _ }, [embedding]]
                ]
            }
        },
        { // default
            "class": o("HTMLDisplay", "GeneralArea", "MemberOfLeftToRightAreaOS", "TooltipableControl"),
            context: {
                label: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                size: [{ param: { areaSetContent: { size: _ } } }, [me]],
                description: [{ param: { areaSetContent: { desc: _ } } }, [me]],
                tooltipText: [{ description: _ }, [me]]
            },
            position: {
                bottom: 0
            },
            write: {
                onDensityOptionMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setAsTestOption: {
                            to: [{ option: _ }, [embedding]],
                            merge: [{ label: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DensityOptionTextBased: o(
        { // default
            "class": "DensityOption",
            context: {
                //displayText: "A",
                //displayDimensionMaxWidth: 15,
                displayText:
                [cond, [{ label: _ }, [me]],
                    o(
                        {
                            on: "V1", use:
                            "<span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span><span style=\"font-size: 11px;\">A</span><span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span>"
                        },
                        {
                            on: "V2", use:
                            "<span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span><span style=\"font-size: 15px;\">A</span><span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span>"
                        },
                        {
                            on: "V3", use:
                            "<span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span><span style=\"font-size: 20px;\">A</span><span style=\"font-size: 20px; visibility: hidden; width:0px\">.</span>"
                        }
                    )
                ],
                textColor: "grey",
                spacingFromPrev: 0
            },
            position: {
                "content-height": [displayHeight],
                "content-width": [displayWidth]
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: 0
            }
        },
        {
            qualifier: { selectedOption: true },
            context: {
                textColor: "black"
            },
            display: {
                html: {
                    fontWeight: "bold"
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    DensityOptionSvgBased: o(
        { // default
            "class": "DensityOption",
            context: {
                spacingFromPrev: bFSAppPosConst.densityControlOptionsHorizontalSpacing
            },
            position: {
                "content-height": [cond, [{ label: _ }, [me]],
                    o(
                        { on: "V1", use: 12 },
                        { on: "V2", use: 18 },
                        { on: "V3", use: 24 }
                    )
                ],
                "content-width": [cond, [{ label: _ }, [me]],
                    o(
                        { on: "V1", use: 11 },
                        { on: "V2", use: 16 },
                        { on: "V3", use: 22 }
                    )
                ]
            },
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: { selectedOption: false },
            display: {
                image: {
                    src: "%%image:(densityControlUnselected.svg)%%"
                }
            }
        },
        {
            qualifier: { selectedOption: true },
            display: {
                image: {
                    src: "%%image:(densityControlSelected.svg)%%"
                }
            }
        }
    ),

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DensityController class
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////   
};
