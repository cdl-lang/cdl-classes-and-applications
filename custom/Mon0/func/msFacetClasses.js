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

// %%classfile%%: <msFacetDesignClasses.js>

var msFacetClasses = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSAmoeba: {
        "class": superclass,
        children: {
            selectionModeControlsSeparator: {
                description: {
                    "class": "MSSelectionModeControlsSeparator"
                }
            },
            selectionModeControls: {
                description: {
                    "class": "MSSelectionModeControls"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSPrimaryWidget: {
        "class": superclass,
        position: {
            widgetContentBeginningRelativeToAmoebaSeparator: {
                point1: {
                    element: [{ children: { selectionModeControlsSeparator:_ } }, [embedding]],
                    type: [{ highHTMLLength:_ }, [me]] 
                },
                point2: { label: "contentBeginning" },
                min: 0
            },
            widgetContentBeginningRelativeToAmoebaSeparatorOrGroup: {
                point1: {
                    element: [{ children: { selectionModeControlsSeparator:_ } }, [embedding]],
                    type: [{ highHTMLLength:_ }, [me]] 
                },
                point2: { label: "contentBeginning" },
                equals: 0,
                orGroups: { label: "contentBeginning" },
                priority: positioningPrioritiesConstants.weakerThanDefault              
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatMSPrimaryWidget: {
        "class": superclass,
        context: {
            myValueNameSorter: [ // the MSValueNameSorter represents all ms sorters in the widget
                                { myWidget: [me] },
                                [areaOfClass, "MSValueNameSorter"]
                               ]
        },
        position: {
            widgetContentBeginningRelativeToMSWidgetSorter: {
                point1: {
                    element: [{ myValueNameSorter:_ }, [me]],
                    type: [{ highHTMLLength:_ }, [me]] 
                },
                point2: { label: "contentBeginning" },
                min: 0
            },
            widgetContentBeginningRelativeToMSWidgetSorterOrGroup: {
                point1: {
                    element: [{ myValueNameSorter:_ }, [me]],
                    type: [{ highHTMLLength:_ }, [me]] 
                },
                point2: { label: "contentBeginning" },
                equals: 0,
                orGroups: { label: "contentBeginning" },
                priority: positioningPrioritiesConstants.weakerThanDefault              
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the container in which the two selection mode controls are embedded: these determine whether the selections to follow - in the *embedding* facet - will be 
    // interpreted as inclusions or as exclusions. The embedding facet has an appData, to which these controls write.
    // Note that this mode applies to the entire *embedding* ms facet: if a 2D plot is defined, and its x-axis is an msWidget, then it too will conform to this selection mode 
    // (and not to the selection mode of its associated msFacet).
    // API:
    // 1. Inheriting class should provide positioning.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSelectionModeControls: {
        "class": "GeneralArea",
        position: {
            "class": "MatchDiscretePrimaryWidgetHorizontally",
            top: msPosConst.msSelectionModeControlsFromTopAmoeba
        },
        children: {
            exclusionControl: {
                description: {
                    "class": "MSExclusionControl"
                }
            },
            inclusionControl: {
                description: {
                    "class": "MSInclusionControl"
                }
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSelectionModeControl: {
        "class": superclass,
        position: {
            "vertical-center": 0,
            width: 16, // replace with display queries
            height: 16, // replace with display queries
            top: msPosConst.verticalMarginOfModeControl
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSExclusionControl: {
        "class": o("MSExclusionControlDesign", superclass),
        context: {
            checked: [not, [{ myFacet: { inclusionMode:_ } }, [me]]] // for Design class
        },
        position: { 
            left: msPosConst.selectionModeControlOuterHorizontalMargin,
            connectToMSInclusionControl: {
                point1: { 
                    type: "right"
                },
                point2: { 
                    element: [{ children: { inclusionControl:_ } }, [embedding]],
                    type: "left"
                },
                equals: msPosConst.exclusionModeControlRightMargin
            }
        }               
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSInclusionControl: {
        "class": o("MSInclusionControlDesign", superclass),
        context: {
            checked: [{ myFacet: { inclusionMode:_ } }, [me]]
        },
        position: {
            minRightMarginFromContainer: {
                point1: { type: "right" },
                point2: { element: [embedding], type: "right" },
                min: bMSPosConst.selectionModeControlOuterHorizontalMargin
            }
        }               
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A visual separator between the selectionModeControls and the primary widget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSelectionModeControlsSeparator: {
        "class": "GeneralArea",
        position: {
            "class": "MatchDiscretePrimaryWidgetHorizontally",
            attachToMSSelectionModeControls: {
                point1: { 
                    element: [{ children: { selectionModeControls:_ } }, [embedding]],
                    type: "bottom"
                },
                point2: { 
                    type: "top"
                },
                equals: msPosConst.verticalSpacingAroundSelectionModeControlsSeparator
            },
            height: msPosConst.heightOfSelectionModeControlsSeparator
        },
        display: {
            background: "black"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits:
    // 1. SorterUX, for the sorting control UX functionality
    // 2. BMSSorter: for the sorting state display.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSSorter: o(
        { // default
            "class": o("MSSorterDesign", "SorterUX", superclass),
            context: {
                // BMSorter (SorterUXDisplay) param:
                mySorterUX: [me]
            }
        },
        {
            qualifier: { ofPrimaryWidget: true },
            position: {
                lowHTMLLengthConstraint: {
                    point1: {
                        element: [{ children: { selectionModeControlsSeparator:_ } }, [embedding, [{ myWidget:_ }, [me]]]],
                        type: [{ highHTMLLength:_ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLLength:_ }, [me]]
                    },
                    equals: msPosConst.msSorterFromMarginFromAbove
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MSValueNameSorter: o(
        { // default
            "class": superclass,
            context: {
                girthAxisAnchor: [{ children: { valueName:_ } }, 
                                  [
                                   { firstValue: true },
                                   [{ discreteValues:_ }, [embedding]]
                                  ]
                                 ]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                lowHTMLGirthConstraint: {
                    point1: { 
                        element: [{ girthAxisAnchor:_ }, [me]],
                        type: [{ lowHTMLGirth:_ }, [me]]
                    },
                    point2: { 
                        type: [{ lowHTMLGirth:_ }, [me]]
                    },
                    equals: 0 
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                centerGirthConstraint: {
                    point1: { 
                        element: [{ girthAxisAnchor:_ }, [me]],
                        type: [{ centerGirth:_ }, [me]]
                    },
                    point2: { 
                        type: [{ centerGirth:_ }, [me]]
                    },
                    equals: 0 
                }
            }
        }
    )        
};