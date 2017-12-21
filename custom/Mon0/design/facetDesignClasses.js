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

// %%classfile%%: <generalDesignClasses.js>

var facetDesignClasses = {
    
    //////////////////////////////////////////////////////
    MovingFacetDesign: {
        "class": o("DelicateRoundedCorners", "DropShadow", superclass),
        display: {
            background: "#C0C0C0",
            opacity: 0.3
        }
    },
    
    //////////////////////////////////////////////////////
    ReorderableFacetHandleDesign: {
        "class": o("MovingFacetTransition", "FacetHandleDesign")
    },
    
    //////////////////////////////////////////////////////
    FacetHandleDesign: o(
        { // default
            display: {
                image: {
                    src: "%%image:(facetHandle.png)%%"
                }
            }
        },
        {
            qualifier: { tmd: true },
            display: {
                image: {
                    src: "%%image:(facetHandleSelected.png)%%"
                }
            }            
        }
    ),
    
    //////////////////////////////////////////////////////
    FacetHeaderDesign: {
        "class": superclass
    },
    
    //////////////////////////////////////////////////////
    FacetStateControlDisplayDesign: o(
        {
            qualifier: { amIFacetState: true },
            display: {
                background: {
                    linearGradient: {
                        start: "top",
                        stops: o( 
                                    { color: "#b5b3b3", length: "0%" },
                                    { color: "#444343", length: "100%" }
                                )
                    }
                }
            }
        },
        {
            qualifier: { amIFacetState: false },
            display: {
                background: {
                    linearGradient: {
                        start: "top",
                        stops: o( 
                                    { color: "#a8a6a6", length: "0%" },
                                    { color: "#dedbdb", length: "100%" }
                                )
                    }
                }
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    FacetSorterUXDisplayDesign: o(
        { // default
            "class": "SorterUXDisplayDesign"
        },
        {
            qualifier: { sortingByMe: true },
            context: {
                opacityOfLowestSortingLevel: 0.3,
                opacityLevelDelta: [div,
                                    [minus, 1, [{ opacityOfLowestSortingLevel:_ }, [me]]],
                                    [minus, [{ numOfSortingLevels:_ }, [me]], 1]
                                   ]
            },
            display: {
                background: "pink",
                // sortingLevel 0 (the latest sortingKey) gets an opacity of 1. the next has sortingLevel 1, and gets an opacity of 1-0.2*(sortingLevel) = 0.8, and so on.
                opacity: [minus,
                          1,
                          [mul,
                           [{ opacityLevelDelta:_ }, [me]],
                           [minus, [{ sortingLevel:_ }, [me]], 1]
                          ]
                         ]
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    FacetSelectionsDesign: o(
        { // default
            "class": superclass
        },
        { 
            qualifier: { selectionsMade: true },
            display: {
                background: designConstants.globalBGColor,
                opacity: 0.25
            }
        }
    ),

    //////////////////////////////////////////////////////
    NonOMFacetXIntOSRDesign: {
        "class": "BackgroundColor"
    },
        
    //////////////////////////////////////////////////////
    HistogramBaseBarDesign: {
        display: {
            background: {
                linearGradient: {
                    start: "left",
                    stops: o( 
                                { color: designConstants.globalBGColor, length: "0%" },
                                { color: [{ color:_ }, [me]], length: "200%" }
                            )
                }
            }
        }
    },
        
    //////////////////////////////////////////////////////
    HistogramImplicit1DSetBarDesign: {
        "class": "BackgroundColor",
        display: {
            opacity: 0.3
        }
    },
        
    ///////////////////////////////////////////////
    ValueMarkerDesign: o(
        { // default
            "class": o("BackgroundColor", "Circle"),
        },
        {
            qualifier: { ofSolutionSet: true },
            display: {
                opacity: 1
            }
        },
        {
            qualifier: { ofSolutionSet: false }, // i.e. only in the implicit set
            display: {
                opacity: 0.4
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    FacetMinimizationControlDesign: o(
        { // default
            "class": "Border"
        },
        {
            qualifier: { ofMinimizedFacet: false },
            context: {
                borderColor: "#ccc"
            },           
            display: {
                image: {
                    src: "%%image:(hideFacet.png)%%"
                },
                background: designConstants.globalBGColor
            }
        },
        {
            qualifier: { ofMinimizedFacet: true },
            context: {
                borderColor: "#ddd"
            },
            display: {
                image: {
                    src: "%%image:(showFacet.png)%%"
                }
                //background: {linearGradient: {start: "bottom", stops:[[designConstants.globalBGColor, "0%"],["#ddd", "50%"], [designConstants.globalBGColor, "100%"]]}},
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    SolutionSetItemBlacklistButtonDesign: {
        display: {
            image: {
                src: "%%image:(addToBlacklist.png)%%"
            }
        }
    },

    //////////////////////////////////////////////////////
    SolutionSetItemHandleDesign: o(
        { // default
            display: {
                image: {
                    src: "%%image:(itemHandleSelected.png)%%"
                }
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    PermOverlayXWidgetDesign: {
        "class": superclass
    },
    
    //////////////////////////////////////////////////////
    DeleteSelectionsControlDesign: {
        "class": o("Border", "DeleteControlDesign")
    },

    //////////////////////////////////////////////////////
    DisableSelectionsControlDesign: o(
        {
            "class": "Border"
        },
        {
            qualifier: { selectionsDisabled: false },
            display: {
                image: {
                    src: "%%image:(disableSelections.png)%%",
                }
            }
        },
        {
            qualifier: { selectionsDisabled: true },
            display: {
                image: {
                    src: "%%image:(enableSelections.png)%%",
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    SecondaryAxisSelectorDesign: {
        "class": "DropDownMenuableDesign"
    }
};
