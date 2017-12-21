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


// This file implements the various mechanisms for searching among the
// items of a single selector.

var classes = {

    //
    // Selection in the Intervention Field facet
    //
    
    // Because the theme matrix takes time to construct, one should construct
    // the theme matrix in advance (possibly using a shared theme matrix
    // for some/all the selectors which use it if they do not need it
    // simultaneously). This theme matrix is then made visible and
    // attached to a specific selector when search by theme is requested
    // for that selector.

    // This is a theme matrix used for searching through intervention
    // field lists. Because this object takes time to create, the object
    // should be created in advance (possibly globally) and then connected
    // to the appropriate selector when it needs to be used.
    
    ESIFSearchThemeMatrix: o(
        {
            "class": o("ESIFSearchThemeMatrixDesign", "ESIFThemeMatrix"),
            context: {
                // the selector search area using this matrix (at most one
                // at a time)
                searchAt: [first,
                           [{ isOpen: true },
                            [areaOfClass, "ESIFInterventionFieldSearch"]]],
                // The place to write the selected themes to
                selectedThemes: [
                    { selectedThemes: _ }, [{ searchAt: _ }, [me]]],
                
                // this is a placeholder area which determines the positioning
                // of this matrix
                searchMatrixPlaceholder: [
                    { children: { searchMatrixPlaceholder: _ }},
                    [{ searchAt: _ }, [me]]],
            }
        },
        {
            qualifier: { searchAt: false },
            // don't show this element
            context: {
                matrixMargin: false,
            },
            position: {
                width: 0,
                height: 0
            }
        },
        {
            qualifier: { searchAt: true },
            // show this element and attach it to the search element
            // using it.
            position: {
                attachLeft: {
                    point1: { type: "left",
                              element: [{ searchMatrixPlaceholder: _ }, [me]] },
                    point2: { type: "left" },
                    equals: [{ searchHorizontalMargin: _ }, [me]]
                },
                attachRight: {
                    point1: { type: "right" },
                    point2: { type: "right",
                              element: [{ searchMatrixPlaceholder: _ }, [me]] },
                    equals: [{ searchHorizontalMargin: _ }, [me]]
                },
                attachTop: {
                    point1: { type: "top",
                              element: [{ searchMatrixPlaceholder: _ }, [me]] },
                    point2: { type: "top" },
                    equals: [{ searchVerticalMargin: _ }, [me]]
                },
                attachBottom: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom",
                              element: [{ searchMatrixPlaceholder: _ }, [me]] },
                    equals: [{ searchVerticalMargin: _ }, [me]]
                }
            }
        }
    ),

    //
    // Search area for the intervention field facet
    //

    // This is the area which implements the 'search' child of an intervention
    // field facet. It may be open or closed. When closed, it provides
    // a button to open the search matrix and, if selections were already
    // made, provides an indication of the selections made.
    // This area must also provide a place to store the themes which were
    // selected (as the theme matrix may be detached from this facet). 

    ESIFInterventionFieldSearch: o(
        {
            "class": o("ESIFInterventionFieldSearchDesign"),

            context: {
                // place to store the list of themes selected by the user
                // (eventually this may have to go to the slice).
                "^selectedThemes": o(),
                // themes marked as selected
                selectedThemeNames: [
                    { themeName: _ , isSelected: true },
                    [{ selectedThemes: _ }, [me]]],
                // default, as long as there are no themes selected
                matchedItems: [{ inputData: _ }, [me]],

                "^isOpen": false,
            },
        },

        {
            qualifier: { selectedThemeNames: true },

            context: {
                // the intervention field entries from the theme manager
                // which have one of the selected themes. There may be
                // multiple entries for the same intervention field
                // (matches by different themes). All fields in the input
                // theme data are still in the objects, so one needs to
                // project on the appropriate field.
                selectedIFs: [
                    [{ getItemEntriesByThemes: _ },
                     [areaOfClass, "ESIFCrossCuttingThemeManager"]],
                    [{ selectedThemeNames: _ }, [me]]
                ],
                selectedIFCodes: [
                    _,
                    [{ Intervention_field_Code: _ }, [{ selectedIFs: _ }, [me]]]],
                matchedItems: [
                    [{ selectedIFCodes: _ }, [me]], [{ inputData: _ }, [me]]]
            }
        }
    ),
    
    ESIFInterventionFieldSearchDesign: o(
        {
            "class": o("WrapChildren"),
            
            context: {
                wrapBottomMargin: 10,
                colorPalette: {
                    closedSearchTriangleColor: "#000000",
                    openSearchTriangleColor: "#000000"
                },
            },
            position: {
                left: 0,
                right: 0
            },
            display: {
                // currently, no border (border width remains 0)
                borderColor: [{ searchBorderColor: _ },
                              [myContext, "ESIFSelectorDesign"]],
                borderStyle: "solid",
                background: [{ searchBackground: _ },
                             [myContext, "ESIFSelectorDesign"]]
            },
            children: {
                openAndCloseButton: { description: {
                    "class": "ESIFInterventionFieldSearchOpenCloseButton",
                    position: {
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 30
                    },
                }}
            }
        },
        
        {
            qualifier: { isOpen: true },
            
            children: {
                searchMatrixPlaceholder: { description: {
                    // this is not the search matrix itself, but only
                    // a placeholder, which allows it to be positioned and
                    // connected here (as it needs to be constructed
                    // externally to ensure it opens quickly.
                    position: {
                        topUnderOpenCloseButton: {
                            point1: {
                                type: "bottom",
                                element: [
                                    { children: { openAndCloseButton: _ }},
                                    [embedding]]
                            },
                            point2: { type: "top" },
                            equals: 0
                        },
                    },
                }}
            }
        },
    ),

    // Button for opening and closing the search element (if any)
    // The 'isOpen' writeable property which is toggled is assumed by default
    // to be defined in the embedding area (can be overwritten to point
    // elsewhere).
    
    ESIFInterventionFieldSearchOpenCloseButton: o(
        {
            context: {
                isOpen: [{ isOpen: _ }, [embedding]],
                pointerInArea: [{ param: { pointerInArea: _ }}, [me]]
            },
            write: { toggleOpenClosed: {
                upon: [{ type: "MouseUp",
                         subType: o("Click","DoubleClick") },
                       [myMessage]],
                true: { toggleOpenClosed: {
                    to: [{ isOpen: _ }, [me]],
                    merge: [not, [{ isOpen: _ }, [me]]]
                }}
            }},

            children: {
                searchIcon: { description: {
                    position: {
                        width: 20,
                        height: 20,
                        left: 5,
                        "vertical-center": 0,
                    },
                    display: {
                        image: {
                            src: "design/img/ic_search_48px.svg",
                            size: "100%"
                        }
                    }
                }},
                text: { description: {
                    position: {
                        leftOfIcon: {
                            point1: {
                                type: "right",
                                element: [
                                    { children: { searchIcon: _ }},[embedding]]
                            },
                            point2: { type: "left" },
                            equals: 5
                        },
                        "vertical-center": 0,
                        height: 20,
                        width: [displayWidth]
                    },
                    display: {
                        text: {
                            fontFamily: "sans-serif",
                            fontSize: 13,
                            value: "Search by Theme"
                        }
                    }
                }},
                openCloseTriangle: { description: {
                    position: {
                        leftOfText: {
                            point1: {
                                type: "right",
                                element: [
                                    { children: { text: _ }},[embedding]]
                            },
                            point2: { type: "left" },
                            equals: 8
                        },
                        "vertical-center": 0,
                        height: 10,
                        width: 10
                    },
                    display: {
                        triangle: {
                            baseSide: "left",
                            color: [
                                { colorPalette: {
                                    closedSearchTriangleColor: _ }},
                                [my, "ESIFInterventionFieldSearchDesign"]]
                        }
                    }
                }}
            }
        },

        {
            qualifier: { isOpen: true },

            children: { openCloseTriangle: {  description: {
                display: {
                    triangle: {
                        baseSide: "top",
                        color: [
                            { colorPalette: {
                                openSearchTriangleColor: _ }},
                            [my, "ESIFInterventionFieldSearchDesign"]]
                    }
                }
            }}}
        }
    ),
    
    //
    // Design Properties (colors, margins, fonts, etc.)
    //
    
    // Design properties for the theme matrix
    
    ESIFSearchThemeMatrixDesign: {
        context: {
            // colors (taken from palette) override this default value to
            // change the colors.
            /*colorPalette: {
                defaultPrimaryColor: "#99c1e0",
                selectedDefaultPrimaryColor: "#006aba",
                lightPrimaryColor: "#a7d0f0",
                selectedLightPrimaryColor: "#0073c2",
                intermediatePrimaryColor: "#a0c9e8",
                selectedIntermediatePrimaryColor: "#006fbf",
                textForDefaultPrimaryColor: "#404040",
                selectedTextForDefaultPrimaryColor: "#f8f8f8",
                textForLightPrimaryColor: "#404040",
                selectedTextForLightPrimaryColor: "#e8e8e8",
                topLevelDividerColor: "#c8d8e8", // "#d0e0f0",
                topLevelBackgroundColor: "#c8d8e8", // "#90b0b0",
                pileBorderColor: "#909090",
                cornerArrowColor: "#f0f0f0",
                highlightedCornerArrowColor: "#ffffff"
            },*/
            colorPalette: {
                defaultPrimaryColor: "#a0b0c8",
                selectedDefaultPrimaryColor: "#608ab0",
                lightPrimaryColor: "#b0c0d8",
                selectedLightPrimaryColor: "#709ac0",
                intermediatePrimaryColor: "#a8b8d0",
                selectedIntermediatePrimaryColor: "#6892b8", 
                textForDefaultPrimaryColor: "#404040",
                selectedTextForDefaultPrimaryColor: "#000000",
                textForLightPrimaryColor: "#404040",
                selectedTextForLightPrimaryColor: "#000000",
                topLevelDividerColor: "#d0e0f0",
                topLevelBackgroundColor: "#c8d8e8", // "#b0b0b0",
                pileBorderColor: "#909090",
                cornerArrowColor: "#e0e0e0",
                highlightedCornerArrowColor: "#ffffff"
            },
            fonts: {
                topThemeFontSize: 13,
                subThemeFontSize: 13
            },

            // margin between the matrix and the cells inside it
            matrixMargin: 0,
            // margin between this matrx and the placeholder area in which
            // it is positioned.
            searchHorizontalMargin: 10, // left and right
            searchVerticalMargin: 0, // top and bottom
        },
        children: { topLevelThemeItems: { description: {
            context: {
                cellPadding: 2
            }
        }}}
    }
};
