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

// %%include%%: "../18_BasicClasses/reference.js"
// %%include%%: "../18_BasicClasses/events.js"
// %%classfile%%: "misc.js"
// %%classfile%%: "style.js"
// %%classfile%%: "../28_ESIF/crossCuttingThemes/ESIFCrossCuttingThemes.js"

initGlobalDefaults.sliceEditor = {
    headerHeight: 40,
    menuHeaderHeight: 40,
    menuItemHeight: 26,
    menuItemFontSize: 14,
    menuItemFontWeight: 600,
    menuItemFontSizeSmaller: 11,
    menuItemFontWeightSmaller: 400
}

var classes = {
    SliceEditorContext: {
        context: {
            /// List of selections of type {facetName: string, value: any,
            /// selected: bool, displayName?: string}.
            selections: mustBeDefined,
            /// The selection chain
            selectionChain: mustBeDefined,
            /// Hard-coded menu count
            nrMenus: 5,
            /// The space that can be taken up by a menu without pushing the
            /// other menu headers below the bottom of the SliceEditor; 150px
            /// is guaranteed
            availableHeightForMenu: [
                max,
                [
                    minus,
                    [offset,
                        {type: "bottom", element: [{children: {header: _}}, [me]]},
                        {type: "bottom"}
                    ],
                    [mul,
                        [{nrMenus: _}, [me]],
                        [{sliceEditor: {menuHeaderHeight: _}}, [globalDefaults]]
                    ]
                ],
                150
            ],
            "*nameOfOpenMenu": o()
        }
    },

    BaseSliceEditor: {
        "class": o("SliceEditorContext"),

        display: {
            borderColor: [{lightPrimaryColor: _}, [globalDefaults]],
            borderWidth: 2,
            borderStyle: "solid"
        },

        children: {
            closeButton: {
                description: {
                    "class": o(
                        {
                            name: "CloseButton",
                            destination: [{editedSliceId: _}, [myContext, "App"]],
                            value: o()
                        },
                        "ZAboveSiblings"
                    ),
                    position: {
                        top: 2,
                        right: 0,
                        height: 16,
                        width: 16
                    }
                }
            },
            header: {
                description: {
                    display: {
                        background: [{lightPrimaryColor: _}, [globalDefaults]]
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: [{sliceEditor: {headerHeight: _}}, [globalDefaults]],
                        right: 0
                    },
                    children: {
                        label: {
                            description: {
                                display: {
                                    text: {
                                        "class": "Font",
                                        textAlign: "left",
                                        verticalAlign: "top",
                                        fontSize: 16,
                                        fontWeight: 100,
                                        value: "Edit:"
                                    }
                                },
                                position: {
                                    top: 8,
                                    left: 0,
                                    height: 22,
                                    width: 30
                                }
                            }
                        },
                        sliceName: {
                            description: {
                                "class": "TextValueInput",
                                context: {
                                    value: [{editedSliceName: _}, [myContext, "App"]],
                                    type: "text"
                                },
                                display: {
                                    text: {
                                        color: [{primaryTextColor: _}, [globalDefaults]],
                                        fontSize: 16,
                                        fontWeight: 400,
                                        textAlign: "left",
                                        verticalAlign: "top"
                                    }
                                },
                                position: {
                                    top: 8,
                                    left: 34,
                                    height: 22,
                                    right: 0
                                }
                            }
                        }
                    }
                }
            },
            country: {
                description: {
                    "class": "CountrySelector"
                }
            },
            crossCuttingTheme: {
                description: {
                    "class": "CrossCuttingThemeSelector"
                }
            },
            categoryOfRegion: {
                description: {
                    "class": "CategoryOfRegionSelector"
                }
            },
            fund: {
                description: {
                    "class": "FundSelector"
                }
            },
            to: {
                description: {
                    "class": "TOSelector"
                }
            }
        }
    },

    VerticalSliceEditor: {
        "class": "BaseSliceEditor",
        children: {
            country: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "header"},
                        left: 0,
                        right: 0
                    }
                }
            },
            crossCuttingTheme: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "country"},
                        left: 0,
                        right: 0
                    }
                }
            },
            categoryOfRegion: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "crossCuttingTheme"},
                        left: 0,
                        right: 0
                    }
                }
            },
            fund: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "categoryOfRegion"},
                        left: 0,
                        right: 0
                    }
                }
            },
            to: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "fund"},
                        left: 0,
                        right: 0
                    }
                }
            }
        }
    },

    HorizontalSliceEditor: {
        "class": "BaseSliceEditor",
        children: {
            country: {
                description: {
                    context: {
                        fixedHeight: true
                    },
                    position: {
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 200
                    }
                }
            },
            crossCuttingTheme: {
                description: {
                    context: {
                        fixedHeight: true
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "country"},
                        top: 0,
                        bottom: 0,
                        width: 200
                    }
                }
            },
            categoryOfRegion: {
                description: {
                    context: {
                        fixedHeight: true
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "crossCuttingTheme"},
                        top: 0,
                        bottom: 0,
                        width: 200
                    }
                }
            },
            fund: {
                description: {
                    context: {
                        fixedHeight: true
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "categoryOfRegion"},
                        top: 0,
                        bottom: 0,
                        width: 200
                    }
                }
            },
            to: {
                description: {
                    context: {
                        fixedHeight: true
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "fund"},
                        top: 0,
                        bottom: 0,
                        width: 200
                    }
                }
            }
        }
    },

    CountrySelector: o({
        "class": {name: "Menu", itemsClass: "CountryMenu"},
        context: {
            name: "Country",
            facetName: "ms",
            choiceData: o(
                {value: "AT", name: "Austria"},
                {value: "BE", name: "Belgium"},
                {value: "BG", name: "Bulgaria"},
                {value: "CY", name: "Cyprus"},
                {value: "CZ", name: "Czech Republic"},
                {value: "DE", name: "Germany"},
                {value: "DK", name: "Denmark"},
                {value: "EE", name: "Estonia"},
                {value: "GR", name: "Greece"},
                {value: "ES", name: "Spain"},
                {value: "FI", name: "Finland"},
                {value: "FR", name: "France"},
                {value: "HR", name: "Croatia"},
                {value: "HU", name: "Hungary"},
                {value: "IE", name: "Ireland"},
                {value: "IT", name: "Italy"},
                {value: "LT", name: "Lithuania"},
                {value: "LU", name: "Luxembourg"},
                {value: "LV", name: "Latvia"},
                {value: "MT", name: "Malta"},
                {value: "NL", name: "Netherlands"},
                {value: "PL", name: "Poland"},
                {value: "PT", name: "Portugal"},
                {value: "RO", name: "Romania"},
                {value: "SE", name: "Sweden"},
                {value: "SI", name: "Slovenia"},
                {value: "SK", name: "Slovakia"},
                {value: "UK", name: "United Kingdom"}
            )
        }
    }),

    CrossCuttingThemeSelector: o({
        "class": {name: "Menu", itemsClass: "ESIFCrossCuttingThemeMenu"},
        context: {
            name: "Intervention Fields",
            facetName: "InterventionField"
        }
    }, {
        qualifier: {isOpen: true},
        position: {
            pushPanelSeparator: {
                // point1: {type: "right", element: [{children: {menuItems: {children: {themeMatrix: _}}}}, [me]]},
                point1: {type: "left", element: [myContext, "App"]},
                point2: {label: "panelSeparator", element: [myContext, "App"]},
                min: 480,
                priority: 3
            }
        }
    }),

    CategoryOfRegionSelector: o({
        "class": {name: "Menu", itemsClass: "CategoryOfRegionMenu"},
        context: {
            name: "Region Type",
            facetName: "category_of_region",
            choiceData: o(
                {value: "Less developed", name: "Less developed"},
                {value: "More developed", name: "More developed"},
                {value: "Outermost or Northern Sparsely Populated", name: "Outermost or Northern Sparsely Populated"},
                {value: "Transition", name: "Transition"},
                {value: "VOID", name: "VOID"}
            )
        }
    }),

    FundSelector: o({
        "class": {name: "Menu", itemsClass: "FundMenu"},
        context: {
            name: "Fund",
            facetName: "fund",
            choiceData: o(
                {value: "CF", name: "CF"},
                {value: "ERDF", name: "ERDF"},
                {value: "ESF", name: "ESF"},
                {value: "IPAE", name: "IPAE"},
                {value: "YEI", name: "YEI"}
            )
        }
    }),

    InterventionFieldSelector: o({
        "class": {name: "Menu", itemsClass: "InterventionFieldMenu"},
        context: {
            name: "Intervention Field",
            facetName: "ms"
        }
    }),

    TOSelector: o({
        "class": {name: "Menu", itemsClass: "TOMenu"},
        context: {
            name: "Thematic Objective",
            facetName: "to",
            flatData: [{flatData: _}, [myContext, "Data"]],
            choiceData: o(
                {value: 1, name: "Research & Innovation"},
                {value: 2, name: "Information & Communication Technologies"},
                {value: 3, name: "Competitiveness of SMEs"},
                {value: 4, name: "Low-Carbon Economy"},
                {value: 5, name: "Climate Change Adaptation & Risk Prevention"},
                {value: 6, name: "Environment Protection & Resource Efficiency"},
                {value: 7, name: "Network Infrastructures in Transport and Energy"},
                {value: 8, name: "Sustainable & Quality Employment"},
                {value: 9, name: "Social Inclusion"},
                {value: 10, name: "Educational & Vocational Training"},
                {value: 11, name: "Efficient Public Administration"},
                {value: 12, name: "Outermost & Sparsely Populated"},
                {value: "DM", name: "Discontinued Measures"},
                {value: "TA", name: "Technical Assistance"}
            )
        }
    }, {
        qualifier: {flatData: false},
        context: {
            subFacetOf: "InterventionField"
        }
    }, {
        qualifier: {flatData: true},
        context: {
        }
    }),

    MenuContext: o({
        context: {
            name: mustBeDefined,
            facetName: mustBeDefined,

            hover: [{param: {pointerInArea: _}}, [me]],

            selectionChain: [{selectionChain: _}, [myContext, "SliceEditor"]],

            solutionSet: [
                [{getImplicitSolutionSet: _}, [{selectionChain: _}, [me]]],
                [{facetName: _}, [me]]],
            
            availableCellValuesInSolutionSet: [
                [{projectOnFacet: _}, [{selectionChain: _}, [me]]],
                [{facetName: _}, [me]], [{solutionSet: _}, [me]]
            ]
        }
    }, {
        qualifier: {subFacetOf: true},
        context: {
            solutionSet: [
                [{getSubFacetImplicitSolutionSet: _},
                 [{selectionChain: _}, [me]]],
                [{subFacetOf: _}, [me]], [{facetName: _}, [me]]]
        }
    }),

    Menu: o({
        "class": "MenuContext",
        context: {
            fixedHeight: false,
            isOpen: [
                or,
                [{fixedHeight: _}, [me]],
                [
                    equal,
                    [{nameOfOpenMenu: _}, [myContext, "SliceEditor"]],
                    [{name: _}, [me]]
                ]
            ]
        },
        children: {
            header: {
                description: {
                    display: {
                        borderBottomColor: "white",
                        borderBottomStyle: "solid",
                        borderBottomWidth: 1,
                        background: [{lightPrimaryColor: _}, [globalDefaults]]
                    },
                    children: {
                        name: {
                            description: {
                                display: {
                                    text: {
                                        "class": "Font",
                                        textAlign: "left",
                                        fontSize: 13,
                                        fontWeight: 300,
                                        value: [{name: _}, [myContext, "Menu"]]
                                    }
                                },
                                position: {
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: [displayWidth]
                                }
                            }
                        }
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: [{sliceEditor: {menuHeaderHeight: _}}, [globalDefaults]],
                        right: 0
                    }
                }
            }
        }
    }, {
        qualifier: {fixedHeight: false},
        children: {
            header: {
                description: {
                    children: {
                        stateIndicator: {
                            description: {
                                display: {
                                    image: {
                                        src: "design/img/ic_keyboard_arrow_right_48px.svg",
                                        size: "100%"
                                    }
                                },
                                write: {
                                    onClick: {
                                        upon: myClick,
                                        true: {
                                            switchValue: {
                                                to: [{nameOfOpenMenu: _}, [myContext, "SliceEditor"]],
                                                merge: [cond, [{isOpen: _}, [myContext, "Menu"]], o(
                                                    {on: false, use: [{name: _}, [myContext, "Menu"]]}
                                                )]
                                            }
                                        }
                                    }
                                },
                                position: {
                                    "class": {name: "RightOfSibling", sibling: "name", distance: 4},
                                    height: 16,
                                    width: 16,
                                    "vertical-center": 0
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {fixedHeight: false, hover: true},
        "children.header.description": {
            "children.stateIndicator.description": {
                display: {
                    borderBottomColor: "black",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid"
                },
                position: {
                    height: 18
                }
            }
        }
    }, {
        qualifier: {fixedHeight: true},
        display: {
            borderRightWidth: 3,
            borderRightColor: [{dividerColor: _}, [globalDefaults]],
            borderRightStyle: "solid"
        }
    }, {
        qualifier: {isOpen: false},
        position: {
            height: [{sliceEditor: {menuHeaderHeight: _}}, [globalDefaults]]
        }
    }, {
        qualifier: {isOpen: true},
        children: {
            menuItems: {
                description: {
                    "class": "$itemsClass",
                    propagatePointerInArea: o(),
                    context: {
                        choiceData: [{choiceData: _}, [embedding]]
                    }
                }
            }
        }
    }, {
        qualifier: {isOpen: true, fixedHeight: false},
        context: {
            spaceForMenu: [min,
                [
                    mul,
                    [{sliceEditor: {menuItemHeight: _}}, [globalDefaults]],
                    [size, [{choiceData: _}, [me]]]
                ],
                [{availableHeightForMenu: _}, [myContext, "SliceEditor"]]
            ]
        },
        children: {
            header: {
                description: {
                    children: {
                        stateIndicator: {
                            description: {
                                display: {
                                    transform: {
                                        rotate:  90
                                    }
                                }
                            }
                        }
                    }
                }
            },
            menuItems: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "header"},
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        },
        position: {
            height: [
                plus,
                [{sliceEditor: {menuHeaderHeight: _}}, [globalDefaults]],
                [{spaceForMenu: _}, [me]]
            ]
        }
    }, {
        qualifier: {isOpen: true, fixedHeight: true},
        children: {
            menuItems: {
                description: {
                    position: {
                        "class": {name: "BelowSibling", sibling: "header"},
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        },
        position: {
            bottom: 0
        }
    }),

    ESIFCrossCuttingThemeMenu: {
        children: {
            themeManager: {
                description: {
                    "class": "ESIFCrossCuttingThemeManager"
                }
            },
            themeMatrix: {
                description: {
                    "class": "ESIFThemeMatrix",
                    context: {
                        colorPalette: {
                            defaultPrimaryColor: "#004494",
                            selectedDefaultPrimaryColor: "#0058A0",
                            lightPrimaryColor: "#0065A2",
                            selectedLightPrimaryColor: "#007ca5",
                            intermediatePrimaryColor: "#00559B",
                            selectedIntermediatePrimaryColor: "#007ca5",
                            textForDefaultPrimaryColor: "#f0f0d0",
                            selectedTextForDefaultPrimaryColor: "#ffc000",
                            textForLightPrimaryColor: "#e0e0b0",
                            selectedTextForLightPrimaryColor: "#ffb800",
                            topLevelDividerColor: "#d0d0d0",
                            topLevelBackgroundColor: "#90b0b0",
                            pileBorderColor: "#202020",
                            cornerArrowColor: "#c0c0c0",
                            highlightedCornerArrowColor: "#ffffff"
                        },
                        
                        fonts: {
                            topThemeFontSize: 13,
                            subThemeFontSize: 13
                        }
                    },
                    position: {
                        left: 0,
                        top: 0
                    },
                    display: {
                        background: [{topLevelDividerColor: _}, [me]]
                    }
                }
            }
        }
    },

    CountryMenu: {
        "class": "BasicListInAreaWithScrollbar",
        context: {
            listData: [{choiceData: _}, [me]],
            selections: [{selections: _}, [myContext, "SliceEditor"]],
            addPixelsToDocumentSize: -1
        },
        children: {
            items: {
                description: {
                    "class": "MultiSelectionMenuItem", // "SingleSelectionMenuItem",
                    context: {
                        displayText: [{content: {name: _}}, [me]],
                        value: [{content: {value: _}}, [me]],
                        facetName: "ms",
                    }
                }
            }
        }
    },

    CategoryOfRegionMenu: {
        "class": "BasicListInAreaWithScrollbar",
        context: {
            listData: [{choiceData: _}, [me]],
            selections: [{selections: _}, [myContext, "SliceEditor"]],
            addPixelsToDocumentSize: -1
        },
        children: {
            items: {
                description: {
                    "class": "MultiSelectionMenuItem",
                    context: {
                        displayText: [{content: {name: _}}, [me]],
                        value: [{content: {value: _}}, [me]],
                        facetName: "category_of_region"
                    }
                }
            }
        }
    },

    FundMenu: {
        "class": "BasicListInAreaWithScrollbar",
        context: {
            listData: [{choiceData: _}, [me]],
            selections: [{selections: _}, [myContext, "SliceEditor"]],
            addPixelsToDocumentSize: -1
        },
        children: {
            items: {
                description: {
                    "class": "MultiSelectionMenuItem",
                    context: {
                        displayText: [{content: {name: _}}, [me]],
                        value: [{content: {value: _}}, [me]],
                        facetName: "fund"
                    }
                }
            }
        }
    },

    TOMenu: o({
        "class": "BasicListInAreaWithScrollbar",
        context: {
            flatData: [{flatData: _}, [myContext, "Data"]],
            listData: [{choiceData: _}, [me]],
            addPixelsToDocumentSize: -1
        },
        children: {
            items: {
                description: {
                    "class": "MultiSelectionMenuItem",
                    context: {
                        displayText: [{content: {name: _}}, [me]],
                        value: [{content: {value: _}}, [me]],
                        facetName: "to"
                    }
                }
            }
        }
    }, {
        qualifier: {flatData: false},
        context: {
            selections: [
                {facetName: "InterventionField", subFacets: _},
                [{selections: _}, [myContext, "SliceEditor"]]
            ]
        }
    },{
        qualifier: {flatData: true},
        context: {
            selections: [{selections: _}, [myContext, "SliceEditor"]]
        }
    }),

    BaseMenuItemContext: {
        context: {
            displayText: mustBeDefined,
            value: mustBeDefined,
            facetName: mustBeDefined,
            // When false, menu appears greyed out
            isAvailable: [bool, [
                [{value: _}, [me]],
                [{availableCellValuesInSolutionSet: _}, [myContext, "Menu"]]
            ]],
            // query to select the items in the solution set with the value
            // of this item.
            cellValueQry: [
                [{selectOnFacetQry: _},
                 [{selectionChain: _}, [myContext, "Menu"]]],
                [{facetName: _}, [me]], [{value: _}, [me]]],
            // Number that will be shown on the right edge of the menu
            // Set to o() to disable
            countForCellValue: [
                size,
                [[{cellValueQry: _}, [me]],
                 [{solutionSet: _}, [myContext, "Menu"]]]],
            fixedHeight: [{fixedHeight: _}, [myContext, "Menu"]]
        }
    },

    BaseMenuItem: o({
        "class": "BaseMenuItemContext",
        display: {
            borderBottomColor: [{dividerColor: _}, [globalDefaults]],
            borderBottomStyle: "solid",
            borderBottomWidth: 1,
            text: {
                "class": "MenuText",
                whiteSpace: "nowrap",
                value: [{displayText: _}, [me]]
            }
        },
        position: {
            height: [{sliceEditor: {menuItemHeight: _}}, [globalDefaults]]
        }
    }, {
        qualifier: {countForCellValue: true},
        children: {
            badge: {
                description: {
                    "class": "Badge",
                    context: {
                        value: [{countForCellValue: _}, [embedding]],
                        align: "right"
                    },
                    position: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: 34
                    }
                }
            }
        }
    }, {
        qualifier: {isSelected: false},
        display: {
            background: "white"
        }
    }, {
        qualifier: {isAvailable: false},
        display: {
            text: {
                color: "lightgrey",
                fontWeight: 300
            }
        }
    }, {
        qualifier: {isSelected: true},
        display: {
            background: "lightgrey",
            text: {
                color: "white"
            }
        }
    }),

    MultiSelectionMenuItem: o({
        "class": o(
            "BaseMenuItem"
        ),
        context: {
            itemSelection: [
                {
                    facetName: [{facetName: _}, [me]],
                    value: [{value: _}, [me]]
                },
                [{selections: _}, [embedding]]
            ],
            isSelected: [
                {selected: _},
                [{itemSelection: _}, [me]]
            ]
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchValue: {
                        to: [{itemSelection: _}, [me]],
                        merge: {
                            selected: [not, [{isSelected: _}, [me]]],
                            displayName: [{displayText: _}, [me]]
                        }
                    }
                }
            }
        }
    }),

    /// A SingleSelectionMenuItem writes a single AV to the selections, where
    /// selected is true, or removes it from the selections
    SingleSelectionMenuItem: o({
        "class": "BaseMenuItem",
        context: {
            selectionElement: [
                {
                    facetName: [{facetName: _}, [me]],
                    selected: true
                },
                [{selections: _}, [embedding]]
            ],
            selectedValue: [{selectionElement: {value: _}}, [me]],
            isSelected: [equal, [{value: _}, [me]], [{selectedValue: _}, [me]]]
        }
    }, {
        qualifier: {isSelected: false},
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchValue: {
                        to: [{selectionElement: _}, [me]],
                        merge: {
                            value: [{value: _}, [me]],
                            displayName: [{displayText: _}, [me]]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {isSelected: true},
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchValue: {
                        to: [{selections: _}, [embedding]],
                        merge: [
                            n({facetName: [{facetName: _}, [me]]}),
                            [{selections: _}, [embedding]]
                        ]
                    }
                }
            }
        }
    })
};
