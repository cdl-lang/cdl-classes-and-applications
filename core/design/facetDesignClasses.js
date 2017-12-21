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

// add to initGlobalDefaults used by [globalDefaults]
initGlobalDefaults.facetNameTextSize = {
    minSize: { "V1": 11, "V2": 14, "V3": 17 },
    maxWidth: { "V1": 80, "V2": 100, "V3": 120 },
    decrementForMinimizedFacet: { "V1": 1, "V2": 2, "V3": 2 }
};

initGlobalDefaults.cellTextSize = { "V1": 11, "V2": 14, "V3": 16 };

initGlobalDefaults.facetSelectionTextSize = { "V1": 9, "V2": 11, "V3": 13 };

initGlobalDefaults.facetDefaultBackground = "rgba(0, 0, 0, 0.07)";

initGlobalDefaults.facetTagTextSizeMarkdown = { "V1": 0, "V2": 1, "V3": 2 };

var classes = {

    //////////////////////////////////////////////////////
    FacetDesign: o(
        {
            qualifier: { iAmDraggedToReorder: true },
            display: {
                pointerOpaque: false // so the trash, for example, could see we're hovering over it
            }
        }
    ),

    //////////////////////////////////////////////////////
    ExpandedFacetBorderDesign: {
        "class": "FacetBorderWidthDesign",
        context: {
            borderColor: [cond,
                [{ tagHovering: _ }, [me]],
                o(
                    { on: false, use: "#acabab" }, // ExpandedFacetDesign param
                    { on: true, use: "orange" } // awaiting specs from yuval
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    ExpandedFacetDesign: {
        "class": o("BackgroundColor", "ExpandedFacetBorderDesign"),
        display: {
            pointerOpaque: false
        }
    },

    //////////////////////////////////////////////////////
    HoveringFacetDesign: {
        "class": "ExpandedFacetDesign",
        context: {
            backgroundColor: [{ facetDefaultBackground: _ }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    FacetBorderWidthDesign: {
        "class": "Border",
        context: {
            defaultBorderWidth: [densityChoice, bFSPosConst.facetBorderWidth]
        }
    },

    //////////////////////////////////////////////////////
    FrozenFacetDesign: o(
        { /// default
            "class": o("ExpandedFacetBorderDesign", "HorizontalFacetTransition")
        },
        {
            qualifier: { reorderOrPrepareToReorder: false },
            context: {
                borderColor: "transparent" // show no border when not reordering frozen facets!
            }
        }
    ),

    //////////////////////////////////////////////////////
    MinimizedFacetCoreDesign: {
        "class": o("BackgroundColor", "Border"),
        context: {
            borderColor: [cond,
                [{ tagHovering: _ }, [me]],
                o(
                    { on: false, use: "#cbcbcb" },
                    { on: true, use: "orange" } // awaiting specs from yuval
                )
            ],
            backgroundColor: [{ facetDefaultBackground: _ }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetDesign: o(
        { // default
            "class": o("MinimizedFacetCoreDesign", "TransitionableFacet"),
            context: {
                // transitionable: inherit default definition from MovableTransition
            },
            display: {
                pointerOpaque: false
            }
        },
        {
            qualifier: { ofOMF: true },
            context: {
                backgroundColor: [{ myOverlay: { color: _ } }, [me]]
            }
        },
        {
            qualifier: { transitionableFacet: true },
            "class": "MatrixCellTransition",
            context: {
                leftTransition: bTransitions.movingFacet,
                topTransition: bTransitions.movingFacet
            }
        }
    ),

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    TransitionableFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                transitionableFacet: [equal,
                    [{ facetTransitionABTest: _ }, [me]],
                    "V2"
                ]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    //////////////////////////////////////////////////////
    // Inherited by both MovingFacetDesign and CellDesign
    // (For MovingFacetDesign, myFacet is defined as [me] by Facet).
    //
    // API:
    // 1. MovableTransition
    // 2. myFacet
    //////////////////////////////////////////////////////
    HorizontalFacetTransition: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // note that the expansion relates to the expansion of any expanded facet.
                // the reason is that if we're in a facet to the *right* of a facet being expanded, we also need to avoid the transition behavior.
                allowTransition: [and,
                    [{ allowSnappableVisReorderableTransition: _ }, [me]],
                    [not, [{ iAmBeingExpanded: _ }, [areaOfClass, "ExpandedFacet"]]]
                ]
            }
        },
        { // default
            "class": o("TransitionableFacet", "SnappableVisReorderableTransition"),
            context: {
                // SnappableVisReorderableTransition param:
                transitionable: [cond,
                    [{ myFacet: _ }, [me]],
                    o(
                        { on: true, use: [{ myFacet: _ }, [me]] },
                        { on: false, use: [me] }
                    )
                ]

            }
        },
        {
            qualifier: {
                transitionableFacet: true,
                allowTransition: true
            },
            display: {
                transitions: {
                    left: bTransitions.movingFacet,
                    width: bTransitions.movingFacet
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    MovingFacetDesign: {
        "class": o("HoveringFacetDesign", "HorizontalFacetTransition")
    },

    //////////////////////////////////////////////////////
    TrashedFacetDesign: {
        "class": "MinimizedFacetCoreDesign"
    },

    //////////////////////////////////////////////////////
    ReorderableFacetHandleDesign: o(
        {
            qualifier: { ofMinimizedFacet: false },
            //"class": "DraggableHandleDesign"
        }
    ),

    //////////////////////////////////////////////////////
    FacetHeaderDesign: {
    },

    //////////////////////////////////////////////////////
    // Inherited by FacetNameDesign and by its embedded aux area.
    //////////////////////////////////////////////////////    
    FacetNameDefaultTextDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        /*display: { triggers bug #1614
            text: {
                input: {
                    multiLine: true // so that /n translates to a new line
                }
            }
        } */
    },

    //////////////////////////////////////////////////////
    FacetNameDesign: o(
        { // default
            "class": "FacetNameDefaultTextDesign",
            context: {
                tooltipMaxWidth: bFSPosConst.facetNameTooltipWidth,
                defaultTextSize: [densityChoice, [{ designConstants: { appUserElementTextSize: _ } }, [globalDefaults]]],
                displayAsDisabled: [and,
                    [not, [{ settingsPanelIsOpen: _ }, [me]]],
                    o(
                        [and,
                            [{ aUDFBeingEdited: _ }, [me]],
                            [not, [{ ofUDFBeingEdited: _ }, [me]]],
                            o(
                                [not, [{ uDFReferenceableUX: _ }, [me]]],
                                [{ disabledToAvoidCircularRef: _ }, [me]]
                            )
                        ],
                        [and,
                            [not, [{ aUDFBeingEdited: _ }, [me]]],
                            [not, [{ ofProperlyDefinedFacet: _ }, [me]]],
                            [not, [{ ofTrashedFacet: _ }, [me]]] // trashed facets should not be displayed as disabled!
                        ]
                    )
                ]
            }
        },
        {
            qualifier: {
                indicateUDFRefElementUX: true,
                ofUDFDefiningEditedUDF: true
            },
            "class": "TextUnderline"
        },
        {
            qualifier: { displayAsDisabled: true },
            context: {
                textColor: "#8a8a8a"
            }
        },
        {
            qualifier: { ofTrashedOrMinimizedFacet: true },
            "class": "TextAlignLeft",
            context: {
                textSize: [minus,
                    [{ defaultTextSize: _ }, [me]],
                    [densityChoice, [{ facetNameTextSize: { decrementForMinimizedFacet: _ } }, [globalDefaults]]]
                ]
            }
        },
        {
            qualifier: { ofTrashedOrMinimizedFacet: false },
            context: {
                minTextSize: [densityChoice, [{ facetNameTextSize: { minSize: _ } }, [globalDefaults]]],
                textSize: [reduceFontSizeToFitText,
                    [{ minTextSize: _ }, [me]],
                    [{ defaultTextSize: _ }, [me]],
                    [{ maxWidthOfFrame: _ }, [me]],
                    [{ defaultFontSizeFrameWidth: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { ofFrozenFacet: true },
            "class": "TextAlignLeft"
        },
        { // before ofOMF: true below so that it takes precedence!
            qualifier: { tagIndication: true },
            "class": "BackgroundColor",
            context: {
                backgroundColor: [{ tagDesignConstants: { tagBackgroundColor: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofOMF: true },
            "class": "BackgroundColor",
            context: {
                backgroundColor: [{ myFacet: { myOverlay: { color: _ } } }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    AmoebaDesign: {
        "class": "Border",
        context: {
            borderColor: "#acabab",
            borderWidth: [densityChoice, { "V1": 1, "V2": 2, "V3": 3 }]
        },
        display: {
            background: "white",
            /*transitions: { too wiggly for now. i want it to run only in very particular cases (e.g. when expanding/contracting the amoeba itself
                             and not, for example, when having the amoeba change its own width, say when editing a slider scale label)
                left: bTransitions.movingAmoeba
            }*/
        }
    },

    //////////////////////////////////////////////////////
    AmoebaControlPanelDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#f5f5f5"
        }
    },

    //////////////////////////////////////////////////////
    PermOverlayXWidgetDesign: {
    },

    ///////////////////////////////////////////////
    OneDValueMarkerOfPermOverlayDesign: {
        "class": "ValueMarkerDesign" // defined in custom/...
    },

    //////////////////////////////////////////////////////
    TwoDValueMarkerDesign: {
        "class": "ValueMarkerDesign" // defined in custom/...
    },


    //////////////////////////////////////////////////////
    SolutionSetItemDesign: {
        "class": o("BackgroundColor", "SolutionSetItemBorderDesign"),
        context: {
            color: [cond, // BackgroundColor param
                [{ hoveringOverMe: _ }, [me]],
                o(
                    { on: false, use: designConstants.globalBGColor },
                    { on: true, use: "#ededed" }
                )
            ]
        }
    },

    //////////////////////////////////////////////////////
    FillableFacetInfoDesign: {
        "class": "InfoIconableDesign"
    },

    //////////////////////////////////////////////////////
    FillableFacetInfoIconDesign: {
        "class": "InfoIconDesign"
    },

    //////////////////////////////////////////////////////
    SolutionSetItemBorderDesign: {
        "class": "BottomBorder", // top/bottom border values provided in the SolutionSetItem's description in OverlaySolutionSetView
        context: {
            borderColor: designConstants.enabledColor
        }
    },

    //////////////////////////////////////////////////////
    FacetSelectionsDesign: o(
        { // default
            "class": "DefaultDisplayText"
        },
        {
            qualifier: { selectionsMade: false },
            "class": o("TextAlignCenter", "DefaultDisplayText"),
        }
    ),

    ///////////////////////////////////////////////
    FacetXIntOSRExtensionDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    CellTextSizeDisplayDensity: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [densityChoice, [{ cellTextSize: _ }, [globalDefaults]]]
        }
    },

    //////////////////////////////////////////////////////
    FacetSelectionDesign: {
        "class": o("DefaultDisplayText", "ColorBySurroundingAndState"),
        context: {
            textInFocus: [{ inFocus: _ }, [me]], // may be overrridden by inheriting classes. see RatingSelectionDesign

            textSize: [densityChoice, [{ facetSelectionTextSize: _ }, [globalDefaults]]],

            textColor: [[{ colorBySurroundingAndState: _ }, [me]],
                "colored",
            [cond,
                [{ textInFocus: _ }, [me]],
                o(
                    {
                        on: true,
                        use: "onHover"
                    },
                    {
                        on: false,
                        use: [cond,
                            [{ selectionsDisabled: _ }, [me]],
                            o(
                                { on: false, use: "selected" },
                                { on: true, use: "disabled" }
                            )
                        ]
                    }
                )
            ]
            ]
        }
    },

    ///////////////////////////////////////////////
    FacetSelectionsHandleDesign: o(
        { // default
            display: {
                image: {
                    src: "%%image:(selectionsDisplayHandle.png)%%",
                }
            }
        },
        {
            qualifier: { coselected: true },
            display: {
                image: {
                    src: "%%image:(selectionsDisplayHandleSelected.png)%%",
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    FacetSelectionsOverflowIndicatorDesign: {
        "class": o("FacetSelectionDesign", "BackgroundColor"),
        context: {
            backgroundColor: [{ myFacetXIntOSR: { myOverlay: { color: _ } } }, [me]]
        },
        children: {
            facetOpacity: {
                description: {
                    "class": "BackgroundColor",
                    context: {
                        backgroundColor: [{ facetDefaultBackground: _ }, [globalDefaults]]
                    },
                    position: {
                        frame: 0
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    SelectionDeleteControlDesign: {
        "class": "DeleteControlDesign"
    },

    //////////////////////////////////////////////////////
    DraggedSingleFacetSelectionsIconDesign: {
        "class": "DraggableIconDesign"
    },


    DraggedFacetNameIconDesign: {
        "class": "DraggableIconDesign"
    },

    //////////////////////////////////////////////////////
    TwoDPlotDesign: {
        "class": "Border",
        context: {

        },
        display: {
            borderLeftWidth: bFSPosConst.twoDPlotAxisThickness,
            borderBottomWidth: bFSPosConst.twoDPlotAxisThickness
        }
    },

    //////////////////////////////////////////////////////
    CellDesign: {
        "class": "HorizontalFacetTransition"
    },

    //////////////////////////////////////////////////////
    AlphanumericCellDesign: {
        "class": o("CellTextSizeDisplayDensity", "TextOverflowEllipsisDesign"),
        display: {
            text: {
                color: [cond,
                    [{ toBeRemovedOnMouseUp: _ }, [me]],
                    o(
                        { on: true, use: designConstants.disabledColor },
                        { on: false, use: "#323232" }
                    )
                ]
            },
            transitions: {
                color: fsAppConstants.defaultDelay
            }
        }
    },

    //////////////////////////////////////////////////////
    NumCellDesign: o(
        { // 
            "class": "NumericFormatOfReference"
        },
        {
            qualifier: { ofUDFCalculatesTextualValue: true },
            "class": "TextAlignLeft"
        }
    ),

    //////////////////////////////////////////////////////
    DraggedFacetSelectionsIconDesign: {
        "class": "DelicateRoundedCorners"
    },

    //////////////////////////////////////////////////////
    // API: 
    // 1. cellTextHyperlinkFunc
    // 2. Assumes inheriting area also inherits DefaultDisplayText, which defines the context labels referred to in the display object below.
    //////////////////////////////////////////////////////
    HyperlinkedTextualCellDesign: {
        "class": "ModifyPointerClickable",
        display: {
            text: atomic({}),
            html: {
                value: [hyperlinkPrefixFunc,
                    [{ myFacet: { hyperlinkForValues: _ } }, [me]],
                    [{ displayText: _ }, [me]]
                ],
                handleClick: true,
                fontFamily: [{ fontFamily: _ }, [me]],
                fontSize: [{ textSize: _ }, [me]],
                lineHeight: [concatStr,
                    o(
                        [{ mySolutionSetItem: { contentHeight: _ } }, [me]],
                        "px" // the px is required to help the system to distinguish between a lineHeight that's a ratio, and one that's a pixel offset
                    )
                ],
                color: [{ textColor: _ }, [me]],
                textAlign: "left",
                verticalAlign: "center"
            }
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsItemDesign: {
        "class": "BackgroundColor"
    },

    //////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsDotElementDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#6b6b6b"
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetOverlayLegendsMenuItemDesign: {
        "class": "MenuItemDesign"
    },

    //////////////////////////////////////////////////////
    OverlayXWidgetControlIconDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ myOverlayLegend: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    OverlayXWidgetMoreControlsDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "#acabab"
        }
    },

    //////////////////////////////////////////////////////
    OverlayLegendDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    ShowFacetCellsControlDesign: o(
        {
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    size: "100%",
                    src: "%%image:(showCells2.svg)%%",
                    alt: [{ tooltipText: _ }, [me]]
                }
            }
        },
        {
            qualifier: { showingFacetCells: true },
            "class": "HideControlDesign"
        }
    ),

    //////////////////////////////////////////////////////
    ShowOverlaysInFacetControlDesign: {
        "class": "OnHoverFrameDesign",
        display: {
            image: {
                src: "%%image:(showOverlaysControl.svg)%%",
                size: "100%",
                alt: "Show Slices"
            }
        }
    },

    //////////////////////////////////////////////////////
    // API: 
    // 1. backgroundColor
    //////////////////////////////////////////////////////
    ControlAnnotationDesign: {
        "class": o("DefaultDisplayText", "BackgroundColor", "HorizontalPaddingDesign", "ColorBySurroundingAndState"),
        context: {
            textColor: [[{ colorBySurroundingAndState: _ }, [me]],
                "colored",
            [cond,
                [{ inFocus: _ }, [embedding]],
                o(
                    {
                        on: true,
                        use: "onHover"
                    },
                    {
                        on: false,
                        use: "selected"
                    }
                )
            ]
            ]
        }
    },

    //////////////////////////////////////////////////////
    HideOverlayInFacetControlIconDesign: {
        "class": "OverlayXWidgetControlIconDesign",
        display: {
            image: {
                src: "%%image:(hideOverlayControl.svg)%%",
                size: "40%",
                alt: "Hide"
            }
        }
    },

    //////////////////////////////////////////////////////
    OverlaySelectorMenuDesign: {
        "class": "BackgroundColor" // default white background
    },

    //////////////////////////////////////////////////////
    HiddenOverlaysInFacetMenuDesign: {
        "class": "OverlaySelectorMenuDesign"
    },

    //////////////////////////////////////////////////////
    OverlaySelectorMenuItemLegendDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ myOverlay: { color: _ } }, [embedding]]
        }
    },

    //////////////////////////////////////////////////////
    OverlaySelectorMenuItemTextDesign: {
        "class": o("FSAppControlCoreBackgroundDesign", "HorizontalPaddingDesign", "DefaultDisplayText"),
        context: {
            textColor: designConstants.globalBGColor
        }
    },

    //////////////////////////////////////////////////////
    AmoebaCloseControlDesign: {
        "class": "OnHoverFrameDesign",
        display: {
            image: {
                src: "%%image:(closeControl.svg)%%",
                size: "100%",
                alt: [{ tooltipText: _ }, [me]]
            }
        }
    },

    //////////////////////////////////////////////////////
    FacetAmoebaControlDesign: o(
        {
            "class": o("OnHoverFrameDesign"),
            display: {
                image: {
                    size: "100%",
                    alt: [{ tooltipText: _ }, [me]],
                    src: [cond,
                        [{ ofDateFacet: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: "%%image:(histogramControl.svg)%%"
                            },
                            {
                                on: false,
                                use: [cond, [{ amoebaExpandButtonImage: _ }, [me]],
                                    o(
                                        {
                                            on: "drawer", use:
                                            "%%image:(drawerIcon.svg)%%"
                                        },
                                        {
                                            on: "wand", use:
                                            "%%image:(wandIcon.svg)%%"
                                        },
                                        {
                                            on: "ruler", use:
                                            "%%image:(rulerIcon.svg)%%"
                                        }
                                    )
                                ]
                            }
                        )
                    ]
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    ShowStatsControlDesign: o(
        { // default
            "class": "OnHoverFrameDesign",
            display: {
                /*text: {
                    value: "🎚",
                    fontSize: 20,
                    textAlign: "center",
                    verticalAlign: "middle",
                }*/
                image: {
                    size: "100%",
                    src: "%%image:(statistics_show.svg)%%",
                    alt: [cond,
                        [{ showStats: _ }, [me]],
                        o(
                            { on: true, use: "Hide Statistics" },
                            { on: false, use: "Show Statistics" }
                        )
                    ]
                }
            }
        },
        {
            qualifier: { showStats: true },
            "class": "HideControlDesign"
        }
    ),

    //////////////////////////////////////////////////////
    ShowSelectorsControlDesign: o(
        { // default
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    size: "100%",
                    src: "%%image:(showSelectorsControl.svg)%%",
                    alt: [cond,
                        [{ showSelectors: _ }, [me]],
                        o({ on: true, use: "Hide Selectors" }, { on: false, use: "Show Selectors" })
                    ]
                }
            }
        },
        {
            qualifier: { showSelectors: true },
            "class": "HideControlDesign"
        }
    ),

    //////////////////////////////////////////////////////
    ShowHistogramControlDesign: o(
        { // default
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    size: "100%",
                    src: "%%image:(histogramControl.svg)%%",
                    alt: [{ tooltipText: _ }, [me]]
                }
            }
        },
        {
            qualifier: { showHistogram: true },
            "class": "HideControlDesign"
        }
    ),

    //////////////////////////////////////////////////////
    // stadard look wrt FacetTopControl
    /*FacetMinimizationControlDesign: o( 
        { // default
            "class": "AppControlDesign",
        },
        {
            qualifier: { ofMinimizedFacet: false },
            context: {                
                imgSrc: "%%image:(closeControl.svg)%%",
                imgAlt: "Minimize Facet"
            }
        },
        {
            qualifier: { ofMinimizedFacet: true },
            context: {                
                imgSrc: "%%image:(expandIcon.svg)%%",
                imgAlt: "Expand Facet"
            }
        }
    ),*/

    //////////////////////////////////////////////////////
    FacetMinimizationControlDesign: o(
        { // default
            "class": "OnHoverFrameDesign",
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: { ofMinimizedFacet: false },
            display: {
                image: {
                    //src: "%%image:(minimizeControl.svg)%%",
                    src: "%%image:(closeControl.svg)%%",
                    alt: "Minimize Facet"
                }
            }
        },
        {
            qualifier: { ofMinimizedFacet: true },
            display: {
                image: {
                    src: "%%image:(expandIcon.svg)%%",
                    alt: "Expand Facet"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    DataTypeControlDesign: o(
        { // default
            "class": "AppControlDesign",
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeNumberLabel },
            context: {
                imgSrc: "%%image:(dataTypeNumber.svg)%%",
                imgAlt: "Number"
            }
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeStringLabel },
            context: {
                imgSrc: "%%image:(dataTypeString.svg)%%",
                imgAlt: "String"
            }
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeBooleanLabel },
            context: {
                imgSrc: "%%image:(dataTypeBoolean.svg)%%",
                imgAlt: "Boolean"
            }
        },
        {
            qualifier: { dataType: fsAppConstants.dataTypeDateLabel },
            context: {
                imgSrc: "%%image:(dataTypeDate.svg)%%",
                imgAlt: "Date"
            }
        }
    ),

    //////////////////////////////////////////////////////
    // API:
    // 1. CircleArc
    // 2. defaultBorderColor
    // 3. indicationRadius
    // 4. selections disabled ()
    // 4. please Refer to SelectionControl for further api
    //////////////////////////////////////////////////////
    SelectionControlDesign: o(
        {
            qualifier: "!",
            context: {
                selectionDisabled: false
                // this disabled refers to the additional control menu button which disables the selections
                // made in this facet regarding the overlay solution set
            }
        },
        { // default
            "class": "CircleArc",
            context: {
                borderWidth: 2, // default for a selection control
                defaultBorderColor: designConstants.enabledColor,
                borderColor: [{ defaultBorderColor: _ }, [me]]
            }
        },
        {
            qualifier: {
                disabled: false, // this disabled refers to the design of the selector when it is out of the Implicit set and therefore selecting it wouldn’t change the overlay's solution set
                indicateSelectability: true
            },
            context: {
                borderColor: designConstants.onHoverColor
            }
        },
        {
            qualifier: { included: true },
            context: {
                innerCircleRadius: [{ indicationRadius: _ }, [me]]
            }
        },
        {
            qualifier: { excluded: true },
            children: {
                exclusionMarker: {
                    description: {
                        "class": "ExclusionMarkerDesign",
                        context: {
                            dimension: [mul, [{ indicationRadius: _ }, [embedding]], 2]
                        },
                        position: {
                            "class": "AlignCenterWithEmbedding",
                            width: [{ dimension: _ }, [me]],
                            height: [{ dimension: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { selectionDisabled: true },
            children: {
                disabledDiscreteSelectionUX: {
                    description: {
                        "class": "DisabledDiscreteSelectionDesign",
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    DisabledDiscreteSelectionDesign: {
        "class": o("BackgroundColor", "Circle", "AboveSiblings"),
        position: {
            "class": "AlignCenterWithEmbedding"
        },
        context: {
            radius: [plus, [{ indicationRadius: _ }, [embedding]], 2]
        },
        display: {
            opacity: [{ generalDesign: { disabledFacetControllersOpacity: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    InclusionMarkerDesign: {
        context: {
            mySelectionControl: [
                [embedded, [embedding]],
                [areaOfClass, "SelectionControl"]
            ],
        },
        children: {
            ring: {
                description: {
                    "class": o("Circle", "Border"),
                    context: {
                        borderColor: [cond, // display the selectedColor, unless the associated selectionControl is to indicate its selectability 
                            // in which case this area, which is z-higher than the selectionControl, should give the onHover indication
                            [{ mySelectionControl: { indicateSelectability: _ } }, [embedding]],
                            o(
                                { on: true, use: designConstants.onHoverColor },
                                { on: false, use: designConstants.selectedColor }
                            )
                        ],
                        radius: [{ mySelectionControl: { radius: _ } }, [embedding]],
                        borderWidth: [{ mySelectionControl: { borderWidth: _ } }, [embedding]],
                    },
                    position: {
                        "class": "AlignCenterWithEmbedding"
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    ExclusionMarkerDesign: {
        display: {
            image: {
                src: "%%image:(exclusion.svg)%%",
                alt: "Exclude"
            }
        }
    },

    //////////////////////////////////////////////////////
    FacetPanelDesign: {
        "class": "FacetBorderWidthDesign",
        context: {
            borderColor: designConstants.enabledBlueBorderColor
        }
    },

    //////////////////////////////////////////////////////
    FacetDropDownPanelDesign: o(
        { //default     
            display: {
                /*transitions: { federico, i turned this off while i'm putting in place the facetType controls (uri)
                    height: 2,
                }*/
            }
        },
        {
            qualifier: { open: true },
            "class": o(
                "BackgroundColor",
                //"DropShadow",
                "HorizontalFacetTransition",
                "FacetBorderWidthDesign"
            ),
            context: {
                backgroundColor: "#EEEEEE",
                borderColor: designConstants.enabledBlueBorderColor
            }
        }
    ),

    //////////////////////////////////////////////////////
    FacetPanelMinimizationControlDesign: {
        "class": "OnHoverFrameDesign",
        context: {
            enabledBorderColor: designConstants.enabledBlueBorderColor,
            onHoverBorderColor: designConstants.onHoverBlueBorderColor
        },
        display: {
            image: {
                size: "100%",
                src: "%%image:(facetPanelMinimizationControl.svg)%%",
                alt: "Minimize"
            }
        }
    },

    //////////////////////////////////////////////////////
    // API: 
    // 1. myReference: (default: myFacet) Inheriting class should provide the areaRef defining: 
    //    - numericFormatType
    //    - numberOfDigits
    //    - commaDelimited
    // 
    // Note we don't inherit TrackMyFacet here as this is a "Service-class", and as such *should not* inherit TrackMyFacet as that could result in an infinite loop
    // see detailed analysis in the email "thoughts following #1825"
    //////////////////////////////////////////////////////
    NumericFormatOfReference: {
        "class": "NumericFormat",
        context: {
            myReference: [{ myFacet: _ }, [me]],
            numericFormatType: [{ myReference: { numericFormatType: _ } }, [me]],
            numberOfDigits: [{ myReference: { numberOfDigits: _ } }, [me]],
            commaDelimited: [{ myReference: { commaDelimited: _ } }, [me]],            
        }
    },

    //////////////////////////////////////////////////////
    FacetTagDesign: {
        "class": "TagDesign",
        context: {
            textSize: [minus,
                [{ defaultFontSize: _ }, [me]],
                [densityChoice, [{ facetTagTextSizeMarkdown: _ }, [globalDefaults]]]
            ]
        }
    },

    //////////////////////////////////////////////////////
    FacetTagsViewDesign: o(
        { // default
            "class": "BackgroundColor"
        },
        {
            qualifier: { ofMinimizedFacet: true },
            // effectively, we give an expanded facet's FacetTagsView a white background
            children: {
                // we need this area that's below its siblings, and as big as FacetTagsView, because the default facet background color has an opacity < 1
                // and so when placing this area over an existing facet's background, you get two shades of grey. 
                // to avoid that, the FacetTagsViewDesign has a white background (inherits BackgroundColor above, which is by default white),
                // and then creates the proper background color on top of that.
                facetBackground: {
                    description: {
                        "class": o("BelowSiblings", "BackgroundColor"),
                        context: {
                            backgroundColor: [{ facetDefaultBackground: _ }, [globalDefaults]]
                        },
                        position: {
                            frame: 0
                        }
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    SolutionSetItemDraggedDesign: {
        "class": "DraggableIconDesign"
    },

    //////////////////////////////////////////////////////
    HoveringSelectionControlDesign: {
        "class": o("BackgroundColor", "DefaultBoxShadow", "OnHoverFrameDesign"),
        context: {
            //            onHoverBackgroundColor: "#E5E5E5"
        }
    },

    //////////////////////////////////////////////////////
    HoveringSelectionControlTextDesign: {
        "class": o("DefaultDisplayText", "HorizontalPaddingDesign")
    },

    //////////////////////////////////////////////////////
    HoveringSelectionControlSelectorDesign: {
        "class": "SelectionControlDesign",
        context: {
            borderWidth: [densityChoice, [{ discretePosConst: { selectionControlBorderWidth: _ } }, [globalDefaults]]]
        }
    }
};
