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

// %%classfile%%: <facetDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovingFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                facetWithAmoeba: [
                    "FacetWithAmoeba",
                    [classOfArea, [me]]
                ]
            }
        },
        { // default
            "class": o("MovingFacetDesign", superclass, "MoreControlsController"),
            context: {
                hoveringOverMyScrollableDot: [
                    {
                        snappableRepresented: [me],
                        inFocus: true
                    },
                    [areaOfClass, "ScrollableDot"]
                ]
            }
            /*children: {
                moreControls: { trying without moreControls for the facet for now
                    description: {
                        "class": "FacetMoreControls"
                    }
                }
            }*/
        },
        {
            qualifier: {
                facetWithAmoeba: true,
                state: facetState.summary
            },
            children: {
                amoebaControl: {
                    description: {
                        "class": "FacetAmoebaControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSorterUXDisplay: {
        "class": o("FacetSorterUXDisplayDesign", superclass)
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSorterUX: {
        "class": superclass,
        position: {
            alignVerticallyWithFacetName: {
                point1: {
                    element: [{ myFacetName: _ }, [me]],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            },
            minLeftFromFacetHeader: {
                point1: {
                    element: [embedding],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                min: fsPosConst.horizontalMarginAroundFacetSorter
            },
            attachToFacetName: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ myFacetName: _ }, [me]],
                    type: "left"
                },
                equals: fsPosConst.horizontalMarginAroundFacetSorter
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSelections: {
        "class": o("FacetSelectionsDesign", superclass)
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXWidgetGirth: {
        context: {
            overlayXWidgetGirth: bFSPosConst.overlayVerticalElementGirth
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayXWidget: {
        "class": o("PermOverlayXWidgetDesign", superclass, "EmbedOverlayXWidgetLegend")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetItem: {
        "class": o("SolutionSetItemDesign", superclass),
        context: {
            // see Design class
            lastMovable: [
                [me],
                [{ movableController: { lastMovable: _ } }, [me]]
            ]
        }
    }
};
