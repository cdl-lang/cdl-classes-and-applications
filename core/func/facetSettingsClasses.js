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

// %%classfile%%: <facetSettingsDesignClasses.js>

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in MovingFacet, and it allows the user to control the facet specific settings 
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPController: {
        "class": o("FSPControllerDesign", "FacetPanelController", "LeftmostInFacet"),
        context: {
            tooltipText: [{ myFacet: { fspTooltipText: _ } }, [me]],

            // FacetPanelController params
            open: [{ myFacet: { settingsPanelIsOpen: _ } }, [me]],
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSP: o(
        { //variant controller
            qualifier: "!",
            context: {
                open: [{ myFacet: { settingsPanelIsOpen: _ } }, [me]], // FacetDropDownPanel param
                showDescription: [arg, "devShowDescriptionInSettings", false],
                embedNumericFormattingContainer: [and,
                    [{ open: true }, [me]],
                    [{ dataType: fsAppConstants.dataTypeNumberLabel }, [me]],
                    [{ ofUDFCalculatesDate: false }, [me]]
                ]
            }
        },
        {   //default
            "class": "FacetDropDownPanel",
            context: {
                tooltipText: [{ myFacet: { fspTooltipText: _ } }, [me]]
            }
        },
        {
            qualifier: { open: true },
            context: {
                descriptionTopMargin: 0,
                facetSettingsFirstAreaTopAnchor: {
                    element: [{ myFacetHeader: _ }, [me]],
                    type: "bottom"
                }
            },
            children: {
                filterTypeControlContainer: {
                    description: {
                        "class": "FilterTypeControlContainer"
                    }
                }
            }
        },
        {
            qualifier: {
                open: true,
                showDescription: true
            },
            children: {
                facetDescription: {
                    description: {
                        "class": "FacetDescription"
                    }
                },
            }
        },
        {
            qualifier: { embedNumericFormattingContainer: true },
            children: {
                facetSettingsPanelNumericFormattingContainer: {
                    description: {
                        "class": "FSPNumericFormattingContainer"
                    }
                }
            }
        },
        {
            qualifier: {
                open: true,
                dataType: fsAppConstants.dataTypeStringLabel
            },
            children: {
                facetSettingsPanelStringHyperlinkContainer: {
                    description: {
                        "class": "FSPStringHyperlinkContainer"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetDescription: {
        "class": o("TrackMyFacet"),
        context: {
            myLabel: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FacetName"]
                //[areaOfClass, "FSPNameLabel"]
            ]
        },
        position: {
            left: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
            right: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
            /*facetSettingsPanelDescriptionLeftConstraint: {
                point1: {element: [{ myLabel : _ }, [me]], type: "left"},
                point2: { type: "left" },                                
                equals: 0
            },
            facetSettingsPanelDescriptionRightConstraint: {
                point1: {element: [{ myLabel : _ }, [me]], type: "right"},
                point2: { type: "right" },                                
                equals: 0
            },*/
            facetSettingsPanelDescriptionTopConstraint: {
                point1: [{ facetSettingsFirstAreaTopAnchor: _ }, [embedding]],
                point2: { type: "top" },
                equals: [{ descriptionTopMargin: _ }, [embedding]]
                //equals: 0                                
                //equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
        },
        children: {
            descriptionLabel: {
                description: {
                    "class": o("FSPLabelsDesign", "DisplayDimension"),
                    context: {
                        displayText: "Description:"
                    },
                    position: {
                        left: 0,
                        minRight: {
                            point1: { type: "right" },
                            point2: { element: [embedding], type: "right", content: true },
                            min: 0
                        },
                        top: 0
                    }
                }
            },
            descriptionText: {
                description: {
                    "class": "FacetDescriptionText"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetDescriptionText: o(
        {
            "class": o("FacetDescriptionTextDesign", "GeneralArea",
                "TextInput", "TrackMyFacet"),
            context: {
                //displayDimensionOfStableText: true
                //placeholderInputText: "<Description of the facet>",
                horizontalPadding: 5,
            },
            position: {
                left: 0,
                right: 0,
                attachTopToBottomOfDescriptionLabel: {
                    point1: {
                        element: [{ children: { descriptionLabel: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: [{ facetSettingsPanelPosConst: { verticalOffsetBetweenLabelAndAreaContent: _ } }, [globalDefaults]],
                },
                height: 40,
                bottom: 0
            }
        },
        {
            qualifier: { editInputText: false },
            "class": o("VerticalContMovableController"),
            context: {
                displayText: "",
                // VerticalContMovableController params
                beginningOfDocPoint: {
                    element: [{ children: { inputFieldDoc: _ } }, [me]],
                    type: "top"
                },
                endOfDocPoint: {
                    element: [{ children: { inputFieldDoc: _ } }, [me]],
                    type: "bottom"
                },
            },
            children: {
                inputFieldScrollbar: {
                    description: {
                        "class": "VerticalScrollbarContainer",
                        context: {
                            movableController: [embedding],
                            attachToView: "end",
                            attachToViewOverlap: true,
                            fixedLengthScroller: 5
                            //fixedLengthScroller: 12 // override the default value of SCrollbarContainer: scrollbarPosConst.fixedLengthScroller
                        },
                        position: {
                            right: 0,
                            //width: 8,
                        }
                    }
                },
                inputFieldDoc: {
                    description: {
                        "class": "FacetDescriptionDoc"
                    }
                }
            }
        },
        {
            qualifier: { editInputText: true },
            independentContentPosition: true,
            context: {
                inputAppData: [{ myFacet: { description: _ } }, [me]],
                inputTextVerticalPadding: [offset,
                    { type: "top" },
                    { type: "top", content: true }
                ],
            },
            position: {
                "content-height": [displayHeight],
                //"content-vertical-center": 0,
                descriptionInputTextVerticallyCenteredWhenEditable: {
                    point1: {
                        type: "vertical-center",
                        content: true,
                    },
                    point2: {
                        type: "vertical-center",
                    },
                    equals: 0
                },
                descriptionInputTextLeftContentConstraint: {
                    point1: {
                        type: "left",
                    },
                    point2: {
                        type: "left",
                        content: true,
                    },
                    equals: [{ horizontalPadding: _ }, [me]]
                },
                descriptionInputTextRightContentConstraint: {
                    point1: {
                        type: "right",
                        content: true,
                    },
                    point2: {
                        type: "right",
                    },
                    equals: [{ horizontalPadding: _ }, [me]]
                },
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetDescriptionDoc: {
        "class": o("FacetDescriptionTextDesign", "DisplayDimension", "TrackMyFacet"), //
        context: {
            displayText: [{ myFacet: { description: _ } }, [me]],
            myScrollbar: [{ children: { inputFieldScrollbar: _ } }, [embedding]],
            // DisplayDimension params 
            displayDimensionMaxWidth: [offset,
                { element: [embedding], type: "left", content: true },
                { element: [{ myScrollbar: _ }, [me]], type: "left" }
            ]
        },
        position: {
            left: 0,
            width: [{ displayDimensionMaxWidth: _ }, [me]]
        }
    },

    // -- beginning of FacetType classes 

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FilterTypeControlContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                //displayTypeControls: [{ myFacet: { displayTypeControls: _ } }, [me]]
                displayTypeControls: true
            },
        },
        { //default
            "class": o("MinWrap", "TrackMyFacet"),
            context: {
                minWrapAround: 0,
                topAnchorElement: [cond,
                    [{ showDescription: _ }, [embedding]],
                    o(
                        {
                            on: true,
                            use: {
                                element: [
                                    { myFacet: [{ myFacet: _ }, [me]] },
                                    [areaOfClass, "FacetDescription"]
                                ],
                                type: "bottom"
                            }
                        },
                        {
                            on: false,
                            use: [{ facetSettingsFirstAreaTopAnchor: _ }, [embedding]]
                        }
                    )
                ]
            },
            position: {
                left: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                right: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                topAlignedWithDescriptionIfPresent: {
                    point1: [{ topAnchorElement: _ }, [me]],
                    point2: { type: "top" },
                    equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
                }
                //bottom: defined in FSPNumericFormattingContainer if present

            },
            children: {
                typeControlLabel: {
                    description: {
                        "class": "FilterTypeControlLabel"
                    }
                },
                /*typeControlsExpansionController: {
                    description: {
                        "class": "FilterTypeControlExpansionController"
                    }
                }*/
            }
        },
        {
            qualifier: { displayTypeControls: true },
            children: {
                typeControls: {
                    description: {
                        "class": "FilterTypeControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FilterTypeControlLabel: {
        "class": o("FSPLabelsDesign", "GeneralArea", "DisplayDimension", "TrackMyFacet"),
        context: {
            displayText: "Filter Type"
        },
        position: {
            top: 0,
            left: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*FilterTypeControlExpansionController: {
        "class": o("ExpansionControllerRightOfArea", "TrackMyFacet"),
        context: {
            isOpen: [{ displayTypeControls: _ }, [embedding]],
            tooltipTextWhenOpened: "Close Type Options",
            tooltipTextWhenClosed: "Open Type Options",
            leftArea: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FilterTypeControlLabel"]
            ]
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. leftArea: the area to left of the controller (center aligned vertically)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionControllerRightOfArea: {
        "class": "TriangleExpansionController",
        position: {
            attachLeftToLeftArea: {
                point1: { element: [{ leftArea: _ }, [me]], type: "right" },
                point2: { type: "left" },
                equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
            centerAlignedWithLeftArea: {
                point1: { element: [{ leftArea: _ }, [me]], type: "vertical-center" },
                point2: { type: "vertical-center" },
                equals: 0
            },
        },
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FilterTypeControls: o(
        { // default
            "class": o("Grid", "TrackMyFacet"),
            context: {
                //Grid params                
                minWrapBottom: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]], //MinWrap params
                numberOfCellsInEachRow: 2,
                myGridCellData: [{ myApp: { facetTypes: _ } }, [me]]
            },
            position: {
                //left: 0,
                //right: 0,
                "horizontal-center": 0,
                attachToFilterTypeControlLabelBottom: {
                    point1: {
                        element: [
                            { myFacet: [{ myFacet: _ }, [me]] },
                            [areaOfClass, "FilterTypeControlLabel"]
                        ],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ facetSettingsPanelPosConst: { verticalOffsetBetweenLabelAndAreaContent: _ } }, [globalDefaults]]
                },
            },
            children: {
                gridCells: {
                    //data: defined in Grid via myGridCellData
                    description: {
                        "class": "FilterTypeControlElement"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FilterTypeControlElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selected: [
                    [{ type: _ }, [me]],
                    [{ myFacet: { facetType: _ } }, [me]]
                ],
                enabled: [cond,
                    [{ ofProperlyDefinedFacet: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: false
                        },
                        {
                            on: true,
                            use: [bool,
                                [
                                    [{ type: _ }, [me]],
                                    [{ myFacet: { possibleFacetTypes: _ } }, [me]]
                                ]
                            ]
                        }
                    )
                ],
                warnBeforeTypeChange: [and,
                    [{ selectionsMadeInFacet: _ }, [me]],
                    [not, [{ selected: _ }, [me]]],
                    o(
                        // no need to give user warning when switching MSFacet <-> RatingFacet, as the user's selections then can continue to apply!
                        [not, [[{ type: _ }, [me]], o("MSFacet", "RatingFacet")]],
                        [not, [[{ myFacet: { facetType: _ } }, [me]], o("MSFacet", "RatingFacet")]]
                    )
                ]
            }
        },
        { // default
            "class": o("FilterTypeControlElementDesign", "GridCell", "ModalDialogable",
                "ButtonCore", "TrackMyFacet"),
            context: {
                type: [{ param: { areaSetContent: { id: _ } } }, [me]],
                displayText: [{ param: { areaSetContent: { name: _ } } }, [me]],
                // GridCell params
                horizontalSpacing: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                verticalSpacing: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                //ModalDialogable params
                selectionsMadeInFacet: [
                    {
                        selectionsMade: _,
                        myFacet: [{ myFacet: _ }, [me]]
                    },
                    [areaOfClass, "SelectableFacetXIntOverlay"]
                ],
            },
            position: {
                "content-height": [densityChoice, [{ facetSettingsPanelPosConst: { buttonHeight: _ } }, [globalDefaults]]],
                "content-width": [densityChoice, [{ facetSettingsPanelPosConst: { facetTypeButtonWidth: _ } }, [globalDefaults]]],
            },
            write: {
                onFilterTypeControlOnAct: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        setAsFacetType: {
                            to: [{ myFacet: { facetType: _ } }, [me]],
                            merge: [{ type: _ }, [me]]
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
                        "class": "ChangeTypeOfSelectionsMadeFacetModalDialog"
                    }
                }
            }
        },
        {
            qualifier: { enabled: true },
            "class": "ControlModifiedPointer"
        },
        {
            qualifier: {
                enabled: true,
                selected: false,
                warnBeforeTypeChange: false
            },
            write: {
                onFilterTypeControlElementMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setAsFacetType: {
                            to: [{ myFacet: { facetType: _ } }, [me]],
                            merge: [{ type: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                enabled: true,
                selected: false,
                warnBeforeTypeChange: true
            },
            write: {
                onFilterTypeControlElementMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        raiseCreateModalDialog: {
                            to: [{ createModalDialog: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ChangeTypeOfSelectionsMadeFacetModalDialog: {
        "class": "OKCancelModalDialog",
        children: {
            textDisplay: {
                description: {
                    "class": "ChangeTypeOfSelectionsMadeFacetModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "ChangeTypeOfSelectionsMadeFacetModalDialogOKControl"
                }
            }
            // cancelControl defined in OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ChangeTypeOfSelectionsMadeFacetModalDialogText: {
        "class": "OKCancelDialogText",
        context: {
            displayText: "Selections are specific to facet type: Preexisting selections will be saved, but excluded from calculation of slices",
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ChangeTypeOfSelectionsMadeFacetModalDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },
    // -- end of FacetType classes

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPNumericFormattingContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                //displayNumberFormattingGrid: [{ myFacet: { displayNumberFormattingGrid: _ } }, [me]]
                displayNumberFormattingGrid: true
            },
        },
        { //default
            "class": o("MinWrap", "TrackMyFacet"),
            context: {
                minWrapAround: 0,
                myFilterTypeControlContainer: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "FilterTypeControlContainer"]
                ]
            },
            position: {
                left: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                right: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                topAlignedWithBottomOfFilterTypeControlContainer: {
                    point1: {
                        element: [{ myFilterTypeControlContainer: _ }, [me]],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
                },
            },
            children: {
                numberFormattingLabel: {
                    description: {
                        "class": "NumberFormattingLabel"
                    }
                },
                /*numberFormattingExpansionController: {
                    description: {
                        "class": "NumberFormattingExpansionController"
                    }
                }*/
            }
        },
        {
            qualifier: { displayNumberFormattingGrid: true },
            children: {
                numericFormattingGrid: {
                    description: {
                        "class": "FSPNumericFormattingGrid"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumberFormattingLabel: {
        "class": o("FSPLabelsDesign", "DisplayDimension", "TrackMyFacet"),
        context: {
            displayText: "Numeric Formatting"
        },
        position: {
            left: 0,
            minRight: {
                point1: { type: "right" },
                point2: { element: [embedding], type: "right", content: true },
                min: 0
            },
            top: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*NumberFormattingExpansionController: {
        "class": o("ExpansionControllerRightOfArea", "TrackMyFacet"),
        context: {
            isOpen: [{ displayNumberFormattingGrid: _ }, [embedding]],
            tooltipTextWhenOpened: "Close Number Formatting",
            tooltipTextWhenClosed: "Open Number Formatting",
            leftArea: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "NumberFormattingLabel"]
            ]
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPNumericFormattingGrid: {
        "class": o("Grid", "TrackMyFacet"),
        context: {
            myButtons: [{ children: { gridCells: _ } }, [me]],
            filterTypeControls: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FilterTypeControls"]
            ],
            //Grid params
            minWrapBottom: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]], //MinWrap params
            numberOfCellsInEachRow: 3,
            myGridCellData: [{ myApp: { numericFormats: _ } }, [me]],
            imposeSameWidthToGridCells: true
        },
        position: {
            attachTopToBottomOfLabel: {
                point1: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "NumberFormattingLabel"]
                    ],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: [{ facetSettingsPanelPosConst: { verticalOffsetBetweenLabelAndAreaContent: _ } }, [globalDefaults]]
            },
            leftAlignedWithFilterTypeControls: {
                point1: { type: "left" },
                point2: { type: "left", element: [{ filterTypeControls: _ }, [me]] },
                equals: 0,
            },
            rightAlignedWithFilterTypeControls: {
                point1: { type: "right" },
                point2: { type: "right", element: [{ filterTypeControls: _ }, [me]] },
                equals: 0,
            },
        },
        children: {
            gridCells: {
                //data: defined in Grid via myGridCellData
                description: {
                    "class": "FSPNumericFormattingGridCell"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPNumericFormattingGridCell: o(
        { //variant-controller
            qualifier: "!",
            context: {
                selected: [equal,
                    [{ myFacet: { numericFormat: _ } }, [me]],
                    [{ formatAttributes: _ }, [me]]
                ]
            }
        },
        { //default
            "class": o(
                "NumericFormat", "FSPNumericFormattingGridCellDesign",
                "ButtonCore", "GridCell", "TrackMyFacet"
            ),
            context: {
                displayText: 123456.789,
                formatAttributes: [{ param: { areaSetContent: _ } }, [me]],
                numericFormatType: [{ formatAttributes: { type: _ } }, [me]],
                numberOfDigits: [{ formatAttributes: { numberOfDigits: _ } }, [me]],
                commaDelimited: [{ formatAttributes: { commaDelimited: _ } }, [me]],
                horizontalSpacing: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                verticalSpacing: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
            },
            position: {
                "content-height": [densityChoice, [{ facetSettingsPanelPosConst: { buttonHeight: _ } }, [globalDefaults]]],
                //"content-width": defined in GridCell sameWidthConstraint via embedding (imposeSameWidthToGridCells)
            },
        },
        {
            qualifier: { selected: false },
            write: {
                onMouseEvent: { // handler name is part of Button's API (MouseEventSwitch, actually, inherited by Button)
                    // 'upon' provided by MouseEventSwitch
                    true: {
                        updatedNumberFormatting: {
                            to: [{ myFacet: { numericFormat: _ } }, [me]],
                            merge: [{ formatAttributes: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hyperlinkEnabled: [{ myFacet: { hyperlinkEnabled: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "TrackMyFacet"),
            context: {
                minWrapAround: 0,
                myFilterTypeControlContainer: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "FilterTypeControlContainer"]
                ]
            },
            position: {
                left: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                right: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]],
                topConstraint: {
                    point1: {
                        element: [{ myFilterTypeControlContainer: _ }, [me]],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
                },
                bottom: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
            children: {
                stringHyperLinkControl: {
                    description: {
                        "class": "FSPStringHyperlinkControl"
                    }
                },
                stringHyperlinkTitle: {
                    description: {
                        "class": "FSPStringHyperlinkTitle"
                    }
                },
                stringHyperlinkQuestionMark: {
                    description: {
                        "class": "FSPStringHyperlinkQuestionMark"
                    }
                }
            }
        },
        {
            qualifier: { hyperlinkEnabled: true },
            children: {
                hyperlinkText: {
                    description: {
                        "class": "FSPStringHyperlinkTextInput"
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkControl: o(
        { // default
            "class": o("FSPToggleStringHyperlinkControl"),
            position: {
                left: 0
                // vertical position: see FSPStringHyperlinkTitle
            },
            children: {
                selectionControl: {
                    description: {
                        "class": "FSPStringHyperlinkControlSelectionControl"
                    }
                }
            }
        },
        {
            qualifier: { hyperlinkEnabled: true },
            children: {
                hyperlinkEnabled: {
                    description: {
                        "class": "FSPStringHyperlinkControlEnabled"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPToggleStringHyperlinkControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hyperlinkEnabled: [{ myFacet: { hyperlinkEnabled: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyFacet"),
            write: {
                onFSPStringHyperlinkControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggle: {
                            to: [{ hyperlinkEnabled: _ }, [me]],
                            merge: [not, [{ hyperlinkEnabled: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkControlSelectionControl: {
        "class": o("FSPStringHyperlinkControlSelectionControlDesign", "SelectionControl", "TrackMyFacet"),
        context: {
            // SelectionControl param:
            indicateSelectability: [{ inFocus: _ }, [me]],
            borderWidth: [densityChoice, [{ discretePosConst: { selectionControlBorderWidth: _ } }, [globalDefaults]]], // override default value
            radius: [densityChoice, [{ discretePosConst: { selectionControlRadius: _ } }, [globalDefaults]]]
        },
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkControlEnabled: {
        "class": o("FSPStringHyperlinkControlEnabledDesign", "GeneralArea", "Circle", "TrackMyFacet"),
        context: {
            radius: [densityChoice, [{ discretePosConst: { valueMarker1DRadius: _ } }, [globalDefaults]]]
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkTitle: {
        "class": o("FSPStringHyperlinkTitleDesign", "GeneralArea", "DisplayDimension", "FSPToggleStringHyperlinkControl", "TrackMyFacet"),
        context: {
            displayText: "Add Hyperlink Prefix",
            mySelectionControl: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FSPStringHyperlinkControlSelectionControl"]
            ],
            myQuestionMark: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "FSPStringHyperlinkQuestionMark"]
            ]
        },
        position: {
            attachLeftToSelectionControl: {
                point1: {
                    element: [{ mySelectionControl: _ }, [me]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
            attachRightToQuestionMark: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ myQuestionMark: _ }, [me]],
                    type: "left"
                },
                min: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
            alignSelectionControlVertically: {
                point1: {
                    element: [{ mySelectionControl: _ }, [me]],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            },
            alignQuestionMarkVertically: {
                point1: {
                    element: [{ myQuestionMark: _ }, [me]],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkQuestionMark: o(
        { // default
            "class": o("FSPStringHyperlinkQuestionMarkDesign", "GeneralArea", "InfoIconable", "TrackMyFacet"),
            context: {
                // override InfoIconable's default value: dimension is the diameter of the selection control sibling!
                dimension: [mul, [densityChoice, [{ discretePosConst: { selectionControlRadius: _ } }, [globalDefaults]]], 2]
            },
            position: {
                right: 0
            }
        },
        {
            qualifier: { createInfoIcon: true },
            children: {
                explanation: {
                    // partner: see InfoIconable
                    description: {
                        "class": "FSPStringHyperlinkInfoIcon"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkInfoIcon: {
        "class": o("FSPStringHyperlinkInfoIconDesign", "InfoIcon"),
        context: {
            displayDimensionMaxWidth: [{ facetSettingsPanelPosConst: { hyperlinkInfoIconWidth: _ } }, [globalDefaults]],
            displayText: [concatStr,
                o(
                    [{ myApp: { facetEntityStr: _ } }, [me]],
                    " ",
                    "cell values can be hyperlinks to additional information.",
                    "\n",
                    "The value of this field will be the prefix of the hyperlink, and the cell value will be its suffix.",
                    "\n\n",
                    "For example:",
                    "\n",
                    "If the Hyperlink Prefix field has the value",
                    "\n",
                    "https://www.google.com/finance?q=",
                    "\n",
                    "then the 'AAPL' cell (Apple Inc.'s stock ticker) will be hyperlinked to Google Finance's page on AAPL:",
                    "\n",
                    "https://www.google.com/finance?q=AAPL"
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSPStringHyperlinkTextInput: {
        "class": o("FSPStringHyperlinkTextInputDesign", "TextInput", "TrackMyFacet"),
        context: {
            // TextInput params:
            inputAppData: [{ myFacet: { hyperlinkForValues: _ } }, [me]],
            allowWritingInput: [not, [{ inputIsPlaceholderInputText: _ }, [me]]],
            defaultEditInputDisplay: false,
            initEditInputText: true,
            placeholderInputText: "<URL prefix for hyperlinked values>"
        },
        position: {
            left: 0,
            right: 0,
            attachToTitle: {
                point1: {
                    element: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "FSPStringHyperlinkTitle"]
                    ],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: [{ facetSettingsPanelPosConst: { defaultSpacing: _ } }, [globalDefaults]]
            },
            "content-height": [densityChoice, [{ facetSettingsPanelPosConst: { buttonHeight: _ } }, [globalDefaults]]],
            bottom: 0
        }
    }
};

