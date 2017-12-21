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

// %%classfile%%: <sliderFacetDesignClasses.js>

var classes = {
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    SliderSelections: o(
        { // default 
            "class": superclass
        },
        {
            qualifier: { numericalSelectionsMade: true },
            children: {
                sliderSelectionsArrow: {
                    description: {
                        "class": "SliderSelectionArrow"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    SliderSelection: o(
        {
            "class": superclass
        },
        {
            qualifier: { facetState: facetState.summary },
            position: {
                "horizontal-center": 0
            }
        }
    ),

    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    SliderSelectionArrow: o(
        { // variant-controller
            qualifier: "!",
            context: {
                singleSelection: [{ singleSelection: _ }, [embedding]],
                facetNotInSummary: [notEqual,
                    facetState.summary,
                    [{ myFacet: { state: _ } }, [me]]
                ]
            }
        },
        { //default
            "class": o("SliderSelectionArrowDesign", "GeneralArea", "VerticalNumericElement", "TrackMyFacetXIntOSR"),
            context: {
                // SliderElement API:
                myFacet: [{ myFacet: _ }, [embedding]],

                extraVerticalMarginForArrowHead: 2, // the arrow should be a little more inwards from the OSR top/bottom than the SliderFacetSelections
                verticalMarginOfArrowHead: [plus, [{ verticalMarginFromEdgeFacetSelections: _ }, [embedding]], [{ extraVerticalMarginForArrowHead: _ }, [me]]]
            },
            position: {
                top: [{ verticalMarginOfArrowHead: _ }, [me]],
                attachToBottomOfOSR: { // as the FacetXIntOSR's bottom may be lower than the bottom of the OSR
                    // (when displayAllSelections is true!)
                    point1: { type: "bottom" },
                    point2: {
                        element: [{ myOSR: _ }, [me]],
                        type: "bottom"
                    },
                    equals: [{ verticalMarginOfArrowHead: _ }, [me]]
                },
                left: 0,
                minOffsetToSelections: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ selections: _ }, [embedding]],
                        type: "left"
                    },
                    min: bSliderPosConst.arrowToSelectionsHorizontalOffset
                },
                keepSelectionsClose: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ selections: _ }, [embedding]],
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.defaultPressure
                }
            }
        },
        {
            qualifier: { singleSelection: true },
            context: {
                highValEqualsPlusInfinity: [{ highValEqualsPlusInfinity: _ }, [embedding]],
                lowValEqualsMinusInfinity: [{ lowValEqualsMinusInfinity: _ }, [embedding]],

                singleSelectionAtTop: o( // see *Design class
                    [and,
                        [{ highValAtTop: _ }, [me]],
                        [not, [{ highValEqualsPlusInfinity: _ }, [me]]]
                    ],
                    [and,
                        [not, [{ highValAtTop: _ }, [me]]],
                        [not, [{ lowValEqualsMinusInfinity: _ }, [me]]]
                    ]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBin: o(
        { // default
            "class": superclass,
            context: { // used by SliderHistogramBinDesign and the associated SliderHistogramBinFrameDesign to determine whether to set a vertical border 
                rangeHasTinyOffset: [lessThanOrEqual,
                    [minus,
                        [
                            [{ myCanvas: { valueToOffset: _ } }, [me]],
                            [max, [{ binRange: _ }, [me]]]
                        ],
                        [
                            [{ myCanvas: { valueToOffset: _ } }, [me]],
                            [min, [{ binRange: _ }, [me]]]
                        ]
                    ],
                    1
                ]
            }
        },
        {
            qualifier: { ofFirstHistogram: true },
            children: {
                binFrame: {
                    partner: [{ myWidget: _ }, [me]],
                    description: {
                        "class": "SliderHistogramBinFrame"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBinFrame: o(
        { // variant-controlller
            qualifier: "!",
            context: {
                nonNumericalValuesExist: [{ myBin: { nonNumericalValuesExist: _ } }, [me]]
            }
        },
        { // default
            "class": o("SliderHistogramBinFrameDesign", "GeneralArea", "TrackMyFacet", "TrackMyHistogram"),
            context: {
                myBin: [expressionOf],
                myFacet: [{ myBin: { myFacet: _ } }, [me]],
                myHistogram: [{ myBin: { myHistogram: _ } }, [me]],
                firstBin: [{ myBin: { firstBin: _ } }, [me]], // used by Design class
                lastBin: [{ myBin: { lastBin: _ } }, [me]], // used by Design class
                rangeHasTinyOffset: [{ myBin: { rangeHasTinyOffset: _ } }, [me]]
            },
            embedding: "referred", // the primary widget
            independentContentPosition: false,
            position: {
                attachToTopOfBin: {
                    point1: {
                        element: [{ myBin: _ }, [me]],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                attachToBottomOfBin: {
                    point1: {
                        element: [{ myBin: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom"
                    },
                    equals: 0
                },
                attachRightToLeftHistogramView: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                attachLeftToRightOfSliderScale: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [
                            { myFacet: [{ myFacet: _ }, [me]] },
                            [areaOfClass, "SliderScale"]
                        ],
                        type: "right"
                    },
                    equals: 0
                }
            },
            stacking: {
                belowOverlayXWidgets: {
                    lower: [me],
                    higher: {
                        element: [{ myFacet: _ }, [me]],
                        label: "layerBetweenHistogramBinFrameAndOverlayXWidgets"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderOverlayXWidget: {
        "class": o(
            "OverlayXWidgetGirth", 
            superclass),
        stacking: {
            aboveHistogramBinFrames: {
                higher: [me],
                lower: {
                    element: [{ myFacet: _ }, [me]],
                    label: "layerBetweenHistogramBinFrameAndOverlayXWidgets"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderPermExtOverlayXWidget: {
        "class": o(superclass, "SliderOverlayXWidgetWithRanges")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousRange: o(
        { //default
            "class": o("SliderContinuousRangeDesign", superclass),
            context: {
                contentGirth: [densityChoice, [{ sliderPosConst: { continuousRangeContentGirth:_ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofBaseOverlayXWidget: false
            },
            position: {
                "content-width": [{ contentGirth: _ }, [me]],
                "horizontal-center": 0
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofBaseOverlayXWidget: true
            },
            position: {
                left: 0
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofBaseOverlayXWidget: false
            },
            position: {
                "content-height": [{ contentGirth: _ }, [me]],
                "vertical-center": 0
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofBaseOverlayXWidget: true
            },
            position: {
                bottom: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DBaseSetValueMarker: {
        "class": o("Slider1DBaseSetValueMarkerDesign",
            superclass,
            "TrackMyOverlayXWidget",
            "SliderCircular1DValueMarker"
        ),
        context: {
            overlayColor: [{ myOverlayXWidget: { color: _ } }, [me]]
        },
        position: {
            horizontalAnchorToContinuousRange: {
                point1: {
                    element: [
                        { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                        [areaOfClass, "SliderContinuousRange"]
                    ],
                    type: [{ beginningGirth: _ }, [me]],
                    content: true
                },
                point2: {
                    type: [{ centerGirth: _ }, [me]]
                },
                equals: 0
            }
        }
        // position along the length axis provided by Slider1DValueMarker
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfinityLine: o(
        { // default
            "class": o("InfinityLineDesign", "MatchEmbeddingOnGirthAxis", superclass)
        }
    ),

};
