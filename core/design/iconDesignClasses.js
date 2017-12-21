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

initGlobalDefaults.iconDesign = {
    menuLineInFocusBackgroundColor: "#d3d3d3",
    tooltipColor: "#f4f4f4",
    tooltipBorderColor: "#bcbcbc",
    tooltipTextColor: "#4f4f51",

    menuBackgroundColor: "#f7f5f5",
    menuBorderColor: "#787878",
    menuShadowColor: "rgba(120,120,120, 0.3)",
    menuShadowHorizontalOffset: 0,
    menuShadowVerticalOffset: 0,
    menuShadowBlurRadius: 3,
    menuShadowSpread: 2
};

var classes = {

    ///////////////////////////////////////////////
    TooltipBodyDesign: o(
        { // default
            "class": o("DefaultBoxShadow", "BackgroundColor", "Border"),
            context: {
                backgroundColor: [{ color: _ }, [embedding]],
                borderColor: [{ iconDesign: { tooltipBorderColor: _ } }, [globalDefaults]],

                bodyShadowDimension: [{ bodyShadowDimension: _ }, [embedding]]
            }
        },
        {
            qualifier: { textualTooltip: true },
            "class": "DefaultDisplayText",
            context: {
                textColor: [{ iconDesign: { tooltipTextColor: _ } }, [globalDefaults]],
                tooltipTextSize: [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]]
            },
            display: {
                paddingLeft: [{ horizontalMarginFromContent: _ }, [me]],
                paddingRight: [{ horizontalMarginFromContent: _ }, [me]],
                paddingTop: [{ verticalMarginFromContent: _ }, [me]],
                paddingBottom: [{ verticalMarginFromContent: _ }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////
    TooltipRootDesign: o(
        // for now, the root has no visual manifestation
    ),

    ///////////////////////////////////////////////
    DropDownMenuableDesign: o(
        { // default
            "class": o("HorizontalPaddingDesign", "DefaultDisplayText", "TextOverflowEllipsisDesign")
        },
        {
            qualifier: { showBorder: true },
            "class": "Border"
        },
        {
            qualifier: { showControl: true },
            context: {
                dropDownMenuShowControlTriangleColor: designConstants.defaultTriangleColor
            }
        },
        {
            qualifier: { showControl: true, defineShowControlBackgroundColor: true },
            context: {
                dropDownMenuShowControlBackgroundColor: designConstants.globalBGColor,
            }
        }
    ),

    ///////////////////////////////////////////////
    DropDownMenuDesign: o(
        { // default
            "class": o("DefaultDisplayText", "BackgroundColor")
        },
        {
            qualifier: { dropDownMenuLogicalSelection: false },
            context: {
                textColor: "#B8B8B8",
            }
        },
        {
            qualifier: { displayDropDownShowControl: true },
            "class": "Border",
            context: {
                borderColor: "#585858"
            }
        }
    ),

    ///////////////////////////////////////////////
    DropDownMenuSearchBoxDesign: {
        "class": o(
            "BackgroundColor", // white, by default
            "BottomBorder"),
        context: {
            borderColor: "#a0a0a0"
        },
        children: {
            searchBoxInput: {
                description: {
                    "class": "DefaultDisplayText",
                    context: {
                        textSize: 12
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    DropDownMenuLineDesign: o(
        { // default
            "class": o("BackgroundColor", "TextOverflowEllipsisDesign", "DefaultDisplayText", "HorizontalPaddingDesign"),
            context: {
                padding: 5,
                textColor: "#585858"
            }
        },
        {
            qualifier: { defaultDesign: true },
            "class": "TopBorder"
        },
        {
            qualifier: { defaultDesign: true, lineInFocus: true },
            context: {
                backgroundColor: designConstants.baseFGColor,
                textColor: designConstants.globalBGColor
            }
        },
        {
            qualifier: {
                defaultDesign: false,
                disabled: true
            },
            "class": "TextItalic",
            context: {
                textColor: "#c7c7c7"
            }
        },
        {
            qualifier: {
                defaultDesign: false,
                lineInFocus: true
            },
            "class": "BackgroundColor",
            context: {
                backgroundColor: [{ iconDesign: { menuLineInFocusBackgroundColor: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DropDownMenuShowControlDesign: o(
        {   //default
            "class": o("TriangleExpansionController"),
            context: {
                embedInCircle: false,
                activeController: false,
                isOpen: [{ createDropDownMenu: _ }, [embedding]],
                triangleColor: [{ dropDownMenuShowControlTriangleColor: _ }, [embedding]]
            }
        },
        {
            qualifier: { showBackground: true },
            "class": o("BackgroundColor"),
            context: {
                backgroundColor: [{ dropDownMenuShowControlBackgroundColor: _ }, [embedding]],
            }
        }
    ),

    ///////////////////////////////////////////////
    DraggableIconDesign: {
        "class": o("DelicateRoundedCorners", "DraggedIconElementOpacity", "DropShadow", "DefaultDisplayText"),
        context: {
            opacity: [{ generalDesign: { lightElementInFocusOpacity: _ } }, [globalDefaults]]
        },
        display: {
            padding: 5
        }
    },

    //////////////////////////////////////////////////////
    ModalDialogDesign: o(
        { // default
            "class": o("Border", "StandardRoundedCorners", "BackgroundColor"),
            context: {
                backgroundColor: "#f6f6f6",
                borderWidth: generalPosConst.modalDialogBorderWidth,
                borderColor: "#b1b1b1"
            }
        },
        {
            qualifier: { showAttentionIcon: true },
            children: {
                icon: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ModalDialogIcon"
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    ModalDialogIcon: {
        "class": "Icon",
        display: {
            image: {
                src: "%%image:(modalDialogIcon.svg)%%",
                size: "100%",
                alt: "!"
            }
        },
        position: {
            width: generalPosConst.modalDialogIconDimension,
            height: generalPosConst.modalDialogIconDimension,
            centerHorizontallyWithModalDialog: {
                point1: {
                    type: "horizontal-center"
                },
                point2: {
                    element: [expressionOf],
                    type: "horizontal-center"
                },
                equals: 0
            },
            centerVerticallyWithModalDialog: {
                point1: {
                    type: "vertical-center"
                },
                point2: {
                    element: [expressionOf],
                    type: "top"
                },
                equals: 0
            }
        }
    },

    //////////////////////////////////////////////////////
    ModalDialogControlDesign: o(
        { // default
            "class": o("TextAlignCenter", "DefaultDisplayText", "BackgroundColor"),
            context: {
                backgroundColor: "#b5b5b5",
                textSize: 14,
                textColor: "#ffffff"
            }
        },
        {
            qualifier: { iAmTheAreaInFocus: true },
            context: {
                backgroundColor: "#4485f3"
            }
        }
    ),

    ///////////////////////////////////////////////
    OKCancelDialogTextDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            textSize: [{ generalDesign: { modalDialogTextSize: _ } }, [globalDefaults]],
            textColor: [{ generalDesign: { modalDialogTextColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    MenuDesign: {
        "class": o("Border", "BackgroundColor"),
        context: {
            backgroundColor: [{ iconDesign: { menuBackgroundColor: _ } }, [globalDefaults]],
            borderColor: [{ iconDesign: { menuBorderColor: _ } }, [globalDefaults]],
            shadowColor: [{ iconDesign: { menuShadowColor: _ } }, [globalDefaults]],
            shadowHorizontalOffset: [{ iconDesign: { menuShadowHorizontalOffset: _ } }, [globalDefaults]],
            shadowVerticalOffset: [{ iconDesign: { menuShadowVerticalOffset: _ } }, [globalDefaults]],
            shadowBlurRadius: [{ iconDesign: { menuShadowBlurRadius: _ } }, [globalDefaults]],
            shadowSpread: [{ iconDesign: { menuShadowSpread: _ } }, [globalDefaults]]
        },
        display: {
            boxShadow: {
                color: [{ shadowColor: _ }, [me]],
                horizontal: [{ shadowHorizontalOffset: _ }, [me]],
                vertical: [{ shadowVerticalOffset: _ }, [me]],
                blurRadius: [{ shadowBlurRadius: _ }, [me]],
                spread: [{ shadowSpread: _ }, [me]]
            },
            pointerOpaque: true
        }
    },

    //////////////////////////////////////////////////////
    MoreControlsMenuDesign: {
        "class": "MenuDesign"
    },

    //////////////////////////////////////////////////////
    MenuOriginTriangleDesign: o(
        { //default
            display: {
                triangle: {
                    color: [cond,
                        [and,
                            [{ useBackgroundColorOfMyAdjacentMenuItem: _ }, [me]],
                            [{ myAdjacentMenuItem: _ }, [me]]
                        ],
                        o(
                            {
                                on: true,
                                use: [{ myAdjacentMenuItem: { backgroundColor: _ } }, [me]]
                            },
                            {
                                on: false,
                                use: [cond,
                                    [{ myMenu: { backgroundColor: _ } }, [me]],
                                    o(
                                        { on: true, use: [{ myMenu: { backgroundColor: _ } }, [me]] },
                                        { on: false, use: designConstants.globalBGColor }
                                    )
                                ]
                            }
                        )
                    ],
                    stroke: [{ myMenu: { borderColor: _ } }, [me]],
                    shadow: {
                        color: [{ myMenu: { shadowColor: _ } }, [me]],
                        horizontal: [{ myMenu: { shadowHorizontalOffset: _ } }, [me]],
                        vertical: [{ myMenu: { shadowVerticalOffset: _ } }, [me]],
                        blurRadius: [{ myMenu: { shadowBlurRadius: _ } }, [me]],
                    }
                }
            }
        },
        {
            qualifier: { menuOpensOnLeft: true },
            display: {
                triangle: {
                    baseSide: "left"
                }
            }
        },
        {
            qualifier: { menuOpensOnLeft: false },
            display: {
                triangle: {
                    baseSide: "right"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    MenuItemDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                backgroundColor: [{ myMenu: { backgroundColor: _ } }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    SelectableMenuItemDesign: o(
        { // default
            "class": "MenuItemDesign"
        },
        {
            qualifier: { inArea: true },
            context: {
                backgroundColor: "white"
            }
        }
    ),

    //////////////////////////////////////////////////////
    MenuItemTextDesign: o(
        { // default
            context: {
                textSize: 12,
                textColor: "#535353"
            }
        },
        {
            qualifier: { inMenuItem: true },
            context: {
                textColor: "black"
            }
        }
    ),

    //////////////////////////////////////////////////////
    DropDownMenuableMatchingMenuDesign: {
        // by inheriting both, we get the background/border of the DropDownMenu!
        "class": o("DropDownMenuDesign", "DropDownMenuableDesign"),
    },

    //////////////////////////////////////////////////////
    DropDownMenuBorderDesign: { 
        "class": o("Border", "DropDownMenuDesign"),
        context: {
            borderColor: "#585858",
            backgroundColor: "#f8f8f8"
        }
    },

    //////////////////////////////////////////////////////
    RefElementsMenuLineDesign: {
        "class": "DropDownMenuLineDesign",
    },

    //////////////////////////////////////////////////////
    MoreControlsUXDesign: {
        "class": "BackgroundColor",
        context: {
            surroundingColor: [{ backgroundColor: _ }, [me]], //used by the embedded areas inheriting MoreControlsUXElementDesign
        }
    },

    //////////////////////////////////////////////////////
    MoreControlsUXElementDesign: {
        "class": o("BackgroundColor", "ColorBySurroundingAndState"),
        context: {
            backgroundColor: [
                [{ colorBySurroundingAndState: _ }, [me]],
                [{ surroundingColor: _ }, [embedding]],
                [cond,
                    [{ indicateSelectability: _ }, [me]],
                    o(
                        { on: false, use: "selected" },
                        { on: true, use: "onHover" }
                    )
                ]
            ]
        }
    },

    //////////////////////////////////////////////////////
    InfoIconableDesign: {
        "class": o("GeneralArea", "Circle", "BackgroundColor"),
        context: {
            radius: [div, [{ dimension: _ }, [me]], 2],
            backgroundColor: designConstants.standardBlueColor
        },
        display: {
            image: {
                size: "100%",
                src: "%%image:(info.svg)%%",
                alt: "Info"
            }
        }
    },

    //////////////////////////////////////////////////////
    InfoIconDesign: {
        "class": o("DefaultDisplayText", "BackgroundColor", "PaddingDesign", "Border"),
    },

    ///////////////////////////////////////////////
    SandwichMenuControllerDesign: {
        display: {
            image: {
                src: "%%image:(sandwich_menu.svg)%%",
                size: "100%"
            }
        }
    },

    ///////////////////////////////////////////////
    SandwichMenuButtonDesign: {
        display: {
            background: "#939393"
        }
    }
};
