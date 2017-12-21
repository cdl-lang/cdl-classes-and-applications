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



var initGlobalDefaults = { defaultPrimaryColor: "#004494" };

// %%classfile%%: "../28_ESIF/crossCuttingThemes/ESIFCrossCuttingThemes.js"
// %%classfile%%: "../18_BasicClasses/scrollable.js"
// %%classfile%%: "../18_BasicClasses/scrollbar.js"

// This file is a test application for an ESIF intervention-field list
// controlled by selection through cross-cutting themes.

var classes = {

    ThemeMatrixDemoDesign: {
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
            
        }
    },
    
    ESIFInterventionFieldMenu: o(

        {
            context: {
                selectedThemes: [
                    { themeName: _ , isSelected: true },
                    [{ selectedThemes: _ },
                     [{ children: { themeMatrix: _ }}, [me]]]],
                // the intervention field entries from the theme manager
                // which have one of the selected themes. There may be
                // multiple entries for the same intervention field
                // (matches by different themes). All fields in the input
                // theme data are still in the objects, so one needs to
                // project on the appropriate field.
                selectedIFs: [
                    [{ getItemEntriesByThemes: _ },
                     [areaOfClass, "ESIFCrossCuttingThemeManager"]],
                    [{ selectedThemes: _ }, [me]]
                ],
                selectedIFCodes: [
                    _,
                    [{ Intervention_field_Code: _ },
                     [{ selectedIFs: _ }, [me]]]],

                selectedIFNames: [
                    _,
                    [{ Code_title_short: _ }, [{ selectedIFs: _ }, [me]]]],
            },
            
            children: {
                interventionFields: {
                    description: {
                        "class": "ESIFInterventionFieldList",
                        position: {
                            bottom: 30,
                            belowThemeMatrix: {
                                point1: {
                                    type: "bottom",
                                    element: [{ children: { themeMatrix: _ }},
                                              [embedding]]
                                },
                                point2: { type: "top" },
                                equals: 2
                            },
                            leftAlignedWithThemeMatrix: {
                                point1: {
                                    type: "left",
                                    element: [{ children: { themeMatrix: _ }},
                                              [embedding]]
                                },
                                point2: { type: "left" },
                                equals: 0
                            },
                            rightAlignedWithThemeMatrix: {
                                point1: {
                                    type: "right",
                                    element: [{ children: { themeMatrix: _ }},
                                              [embedding]]
                                },
                                point2: { type: "right" },
                                equals: 0
                            }
                        },
                        display: {
                            background: "#d0e0f0" // "#a0e0ff"
                        }
                    }
                },
                
                themeMatrix: {
                    description: {
                        "class": o("ThemeMatrixDemoDesign","ESIFThemeMatrix"),
                        position: {
                            left: 20,
                            top: 20 
                        },
                    }
                }
            }
        }
    ),

    ESIFInterventionFieldList: o(
        {
            "class": o("UniformScrollableWithScrollbar"),

            context: {
                scrolledData: [{ selectedIFNames: _ }, [embedding]],
                scrollStartEdge: "top",
                scrollbarStartEdge: "top",

                itemSize: 35,
                itemSpacing: 0
            },

            children: {
                scrollView: { description: {
                    position: {
                        frame: 0
                    },
                    children: { scrolledDocument: { description: {
                        "class": "DraggableScrolledDocumentExt",
                        children: { itemsInView: { description: {
                            "class": "IFScrolledItemExt"
                        }}}
                    }}}
                }},
                scrollbar: {
                    description: {
                        "class": "IFScrollbar"
                    }
                }
            }
        }
    ),

    IFScrolledItemExt: o(
        {
            position: {
                left: 11,
                right: 11
            },
            display: {
                borderStyle: "solid",
                borderColor: "#909090",
                borderBottomWidth: 1,
                //paddingLeft: 10,
                //paddingRight: 10,
                text: {
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    textAlign: "left",
                    value: [{ content: _ }, [me]]
                }
            }
        }
    ),

    IFScrollbar: o(
        {
            position: {
                right: 2,
                width: 8,
                top: 0,
                bottom: 0
            },

            display: {
                // background: "#404040"
            },
            children: {
                cursor: { description: {
                    display: {
                        opacity: 0.5,
                        borderRadius: 5,
                        background: "#a0a0a0",
                    },
                    position: {
                        left: 0,
                        right: 0
                    }}}
            }
        }
    )
};

var screenArea = {

    children: {
        // the cross-cuting theme manager. 
        themeManager: {
            description: {
                "class": "ESIFCrossCuttingThemeManager"
            }
        },
        InterventionFields: {
            description: {
                "class": "ESIFInterventionFieldMenu",
                position: {
                    frame: 0
                }
            }
        }
    }
};
