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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// This library offers the slider facet functionality. 
// A slider consists of a continuous range (specified by the maxVal/minVal values of the SliderFacet) and beyond those the +infinity/-infinity values, respectively.
// The user may specify a single closed selection range. the selection range can be within the continuous range (e..g 80 <= x <= 20), or not (e.g. >= 80, or (separately) <= 20).
// It makes extensive use of classes provided by the facetClasses.js library.
//
// Selections can be made in one of three ways:
// 1. Standard selection: drag one of the selectors, either the highValSelector or the lowValSelector, to a new position on the slider. 
//    The selector being dragged cannot go beyond the far-end of the continuous range (e.g. if we're dragging the highValSelector, it can't go into the -infinity range). In addition,
//    the selector being dragged cannot go beyond the position of the other selector: if, for example, the lowValSelector is positioned at a value of 20, the highValSelector cannot be
//    dragged below that value.
// 2. Elastic selection: mouseDown anywhere on the continuous range, to position one of the selectors, and then move away from that point in the desired direction on the slider axis. 
//    the mouseUp will position the other selector. 
// 3. Codragging: if both selectors are within the continuous range, a ctrl+mouseDown on the segment connecting them (a darker shade of the associated overlay's color) will allow dragging
//    both of them together, while maintaining the offset between them. Codragging is bounded by the edges of the continuous range (the fixed offset would not be well defined if we allowed
//    one of the selectors to move out of the continuous range, to infinity, and beyond!).
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <sliderFacetDesignClasses.js>

var sliderConstants = {
    defaultScale: "linear",
    defaultMarkerByValue: false
};

initGlobalDefaults.slider = {
    valSelectorDisplayCreationDelay: 0.3 // seconds
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a slider facet. 
    // This class is inherited by a variant of the Facet class. 
    // It inherits:
    // 1. FacetWithAmoeba, which provides common functionality to the DiscreteFacet and the SliderFacet (lean/fat)
    // 2. FacetWithDiscreteValues: as it may include discrete, non-numerical values; 
    // 3. FacetWithSortableDiscreteValues: so that these non-numerical values can be sorted/rearranged by the user
    //
    // It embeds (Lean/Fat):
    // 1. selectableFacetXIntOSRs (see FacetWithAmoeba documentation): this class provides the description object for these intersection areas (when the facet isn't minimized).
    // 2. a SliderAmoeba (when the facet is NOT in its minimized/summary states).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderFacet: o(
        { // default
            "class": o("FacetWithDiscreteValues", "FacetWithSortableDiscreteValues"),
            context: {
                defaultScaleType: [definedOrDefault,
                    [{ dataObj: { scaleType: _ } }, [me]],
                    sliderConstants.defaultScale
                ],
                markerByValue: [definedOrDefault, // should valueMarkers represent a range of values (represented by a bin), or a single value?
                    [{ dataObj: { markerByValue: _ } }, [me]],
                    sliderConstants.defaultMarkerByValue
                ],
                showScaleEditControl: [cond,
                    [definedOrDefault,
                        [{ myApp: { displaySliderScaleEditControls: _ } }, [me]], // to allow turning off scale controls for all slider facets in one go (e.g. MBAScreener)
                        [definedOrDefault,
                            [{ dataObj: { displayScaleEditControl: _ } }, [me]],
                            "show"
                        ]
                    ],
                    o({ on: "show", use: true }, { on: "hide", use: false })
                ],
                // this flag indicates whether a higher value is to be displayed at the top of a slider scale. 
                highValAtTop: [cond,
                    [definedOrDefault,
                        [{ myApp: { positionOfHighValOnScale: _ } }, [me]], // to allow turning off scale controls for all slider facets in one go (e.g. MBAScreener)
                        [definedOrDefault,
                            [{ dataObj: { positionOfHighValOnScale: _ } }, [me]],
                            "top"
                        ]
                    ],
                    o({ on: "top", use: true }, { on: "bottom", use: false })
                ],

                // should be rounded properly!
                sliderEnabled: [{ meaningfulValueRange: _ }, [me]],

                sortedMeaningfulDiscreteValues: [_,  // FacetWithSortableDiscreteValues param
                    [
                        n(r(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)),
                        [{ effectiveBaseOverlayProjectedValues: _ }, [me]]
                    ]
                ],

                // FacetWithDiscreteValues param:
                allDiscreteValues: o(
                    [sort, [{ sortedMeaningfulDiscreteValues: _ }, [me]], "ascending"],
                    [{ noValue: _ }, [me]]
                ),

                sortKey: [
                    [{ facetSelectionQueryFunc: _ }, [me]],
                    c(
                        r(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
                        [{ sortingDirection: _ }, [me]]
                    )
                    // implied: missing values come at the end
                ],

                // FacetWithAmoeba's API (per the API of its embedded OverlayMeasurePairInFacet)
                valuesForMeasure: o(
                    [{ myHistogramBins: { binRange: _ } }, [me]], // may be empty if this facet is not displaying its histograms
                    [{ allDiscreteValues: _ }, [me]] // may be empty, if there are no discrete values in this slider facet
                )
            },
            position: {
                labelAnchorForSliderVal: {
                    pair1: {
                        point1: {
                            type: "left"
                        },
                        point2: {
                            label: "anchorForSliderVal"
                        }
                    },
                    pair2: {
                        point1: {
                            type: "left"
                        },
                        point2: {
                            label: "anchorForCellRight"
                        }
                    },
                    ratio: 2
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderFacet: o(
        { // default
            "class": o("SliderFacet", "FacetWithAmoeba"), // SliderFacet inherited first: its definition of sort prevails!
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "LeanSliderFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileSlider ? "LeanSliderAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderFacet: o(
        { // default
            "class": o("SliderFacet", "FacetWithAmoeba"), // SliderFacet inherited first: its definition of sort prevails!
            children: {
                selectableFacetXIntOSRs: {
                    // partner defined in SelectableFacet
                    description: {
                        "class": "FatSliderFacetXIntOSR"
                    }
                }
            }
        },
        {
            qualifier: { embedAmoeba: true },
            children: {
                amoeba: {
                    description: {
                        "class": compileSlider ? "FatSliderAmoeba" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SliderFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the intersection of a non-minimized SliderFacet and an intensional OSR of an overlay that's in the Standard (or Maximized) state.
    // This class is inherited by the selectableFacetXIntOSRs intersections which are embedded in the SliderFacet. 
    // It inherits the NonOMFacetXIntOSR (Lean/Fat).
    // This class embeds a SliderSelections class, which does the actual work of displaying/deleting/disabling the slider selections.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderFacetXIntOSR: o(
        { // default
            "class": "TrackMySliderFacetXIntOverlay",
            context: {
                mySliderIntOverlayXWidgetBeingModified: [ // this is in preparation for the SelectableFacetXIntOverlay optimization!
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]],
                        beingModified: true
                    },
                    [areaOfClass, "SliderIntOverlayXWidget"]
                ],

                numericalSelectionsMade: o(
                    [{ mySelectableFacetXIntOverlay: { stableValuableNumericalSelectionsMade: _ } }, [me]],
                    [{ mySliderIntOverlayXWidgetBeingModified: _ }, [me]]
                ),
                selectionsOverflow: o(
                    [and,
                        [{ numericalSelectionsMade: _ }, [me]],
                        [{ allDiscreteSelections: _ }, [me]]
                    ],
                    [and,
                        [not, [{ numericalSelectionsMade: _ }, [me]]],
                        [greaterThan, [size, [{ allDiscreteSelections: _ }, [me]]], 2]
                    ]
                )
            }
        },
        {
            qualifier: {
                showTagsViewPane: false,
                selectionsMade: true
            },
            children: {
                selections: {
                    description: {
                        "class": "SliderSelections"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderFacetXIntOSR: {
        "class": o("LeanNonOMFacetXIntOSR", "SliderFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderFacetXIntOSR: {
        "class": o("FatNonOMFacetXIntOSR", "SliderFacetXIntOSR")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the SliderFacetXIntOSR. It displays the slider selections for its facet/intensional overlay ancestors, and also allows their deletion/disabling.
    // It inherits FacetSelections.
    //
    // Embedding: 
    // If there are selections made, this area embeds a SliderSelection for each non-infinity value.
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    SliderSelections: o(
        { // variant-controller
            qualifier: "!",
            context: {
                numericalSelectionsMade: [{ myFacetXIntOSR: { numericalSelectionsMade: _ } }, [me]],
                lowValEqualsMinusInfinity: [{ myFacetXIntOSR: { lowValEqualsMinusInfinity: _ } }, [me]],
                highValEqualsPlusInfinity: [{ myFacetXIntOSR: { highValEqualsPlusInfinity: _ } }, [me]],
                rangeSelectionMade: [and,
                    [not, [{ lowValEqualsMinusInfinity: _ }, [me]]],
                    [not, [{ highValEqualsPlusInfinity: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": "FacetSelections",
            context: {
                selections: o(
                    [{ children: { highValSelection: _ } }, [me]],
                    [{ children: { lowValSelection: _ } }, [me]]
                )
            }
        },
        {
            qualifier: { highValEqualsPlusInfinity: false },
            children: {
                highValSelection: {
                    description: {
                        "class": "SliderHighValSelection"
                    }
                }
            }
        },
        {
            qualifier: { lowValEqualsMinusInfinity: false },
            children: {
                lowValSelection: {
                    description: {
                        "class": "SliderLowValSelection"
                    }
                }
            }
        },
        {
            qualifier: { rangeSelectionMade: true },
            position: {
                alignRightSideOfSelectionDeleteControls: {
                    point1: {
                        element: [
                            { mySelection: [{ children: { highValSelection: _ } }, [me]] },
                            [areaOfClass, "SelectionDeleteControl"]
                        ],
                        type: "right"
                    },
                    point2: {
                        element: [
                            { mySelection: [{ children: { lowValSelection: _ } }, [me]] },
                            [areaOfClass, "SelectionDeleteControl"]
                        ],
                        type: "right"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { allDiscreteSelections: true },
            context: {
                displayedSelections: [cond,
                    [{ displayAllSelections: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [cond,
                                [{ numericalSelectionsMade: _ }, [me]],
                                o(
                                    {
                                        on: false,
                                        use: [pos,
                                            r(0, 1),
                                            [{ allDiscreteSelections: _ }, [me]]
                                        ]
                                    },
                                    { // if numerical selections exist, but displayAllSelections is true
                                        // then display none of the non-numerical values!
                                        on: true,
                                        use: o()
                                    }
                                )
                            ]
                        },
                        {
                            on: true,
                            use: [{ allDiscreteSelections: _ }, [me]]
                        }
                    )
                ]
            },
            children: {
                nonNumericalSelections: {
                    data: [{ displayedSelections: _ }, [me]],
                    description: {
                        "class": "SliderNonNumericalSelection"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHighValSelection: {
        "class": "SliderSelection",
        context: {
            infinityVal: Number.POSITIVE_INFINITY,

            value: [{ myFacetXIntOSR: { stableSelectionsObj: { highVal: _ } } }, [me]]
        },
        position: {
            attachHighValSelectionToEmbeddingHighValLength: {
                point1: {
                    element: [embedding],
                    type: [{ highValLength: _ }, [me]]
                },
                point2: {
                    type: [{ highValLength: _ }, [me]]
                },
                equals: [{ verticalMarginFromEdgeFacetSelections: _ }, [embedding]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderLowValSelection: {
        "class": "SliderSelection",
        context: {
            infinityVal: Number.NEGATIVE_INFINITY,

            value: [{ myFacetXIntOSR: { stableSelectionsObj: { lowVal: _ } } }, [me]]
        },
        position: {
            attachLowValSelectionToOSRLowValLength: {
                point1: {
                    type: [{ lowValLength: _ }, [me]]
                },
                point2: { // OSR and not merely [embedding], as the [embedding] expands in height below the OSR
                    // when displayAllSelections is true
                    element: [{ myOSR: _ }, [me]],
                    type: [{ lowValLength: _ }, [me]]
                },
                equals: [{ verticalMarginFromEdgeFacetSelections: _ }, [embedding]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays a single slider selection as it appears in the SliderSelections, at the intersection of the ancestor facet and ancestor OSR.
    // When hovered over, it allows for its deletion (using a SelectionDeleteControl).
    // This class inherits FacetSelection, and VerticalSliderElement (as its visual reference is the primary widget of the same facet, even if the latter ends up not being on display)
    //
    // This class provides the upon handler for the Delete msg, which is called when the associated SelectionDeleteControl is clicked.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderSelection: o(
        { // default
            "class": o("SliderSelectionDesign", "VerticalNumericElement", "FacetSelection", "DisplayDimension"),
            context: {
                displayText: [{ value: _ }, [me]]
            },
            position: {
                horizontalOffsetToDeletionControl: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [
                            { mySelection: [me] },
                            [areaOfClass, "SelectionDeleteControl"]
                        ],
                        type: "left"
                    },
                    equals: bSliderPosConst.horizontalOffsetSelectionToDeletionControl
                }
                // See SliderSelections for constraint that right-aligns the SelectionDeleteControls
            },
            write: {
                onSliderSelectionDelete: {
                    upon: [{ msgType: "Delete" }, [myMessage]],
                    true: {
                        resetToInfinity: {
                            to: [{ value: _ }, [me]],
                            merge: [{ infinityVal: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderNonNumericalSelection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                numericalSelectionsMade: [{ myFacetXIntOSR: { numericalSelectionsMade: _ } }, [me]],
                singleNonNumericalSelection: [equal, [{ allDiscreteSelections: _ }, [me]], 1]
            }
        },
        { // default
            "class": o("SliderNonNumericalSelectionDesign", "TextualDiscreteSelection"),
            context: {
                // TextualDiscreteSelection param:
                areaOS: [{ children: { nonNumericalSelections: _ } }, [embedding]],
                positionAsAreaSetMember: true
            }
        },
        {
            qualifier: {
                numericalSelectionsMade: true,
                displayAllSelections: true,
                firstInAreaOS: true
            },
            position: {
                attachFirstNonNumericalSelectionToBottomOfOSR: {
                    point1: {
                        element: [{ myOSR: _ }, [me]],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                numericalSelectionsMade: false,
                singleNonNumericalSelection: true
            },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: {
                numericalSelectionsMade: false,
                singleNonNumericalSelection: false,
                firstInAreaOS: true
            },
            position: {
                top: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of SliderFacetXIntOSR and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SliderAmoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a slider amoeba. It inherits Amoeba.
    // This class embeds:
    // 1. the primary slider widget (Lean/Fat).
    // 2. in the appropriate facet state, it also embeds a slider histogram.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderAmoeba: o(
        { // default
            "class": "Amoeba"
        },
        {
            qualifier: { facetState: facetState.histogram },
            children: {
                histogramsViewContainer: {
                    description: {
                        "class": compileHistogram ? "SliderHistogramsViewContainer" : o()
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderAmoeba: {
        "class": "SliderAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "LeanSliderPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderAmoeba: {
        "class": "SliderAmoeba",
        children: {
            primaryWidget: {
                description: {
                    "class": "FatSliderPrimaryWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////
    // Base version of a SliderWidget
    // API: 
    // 1. myAnchorContinuousRange
    // 2. ofVerticalElement: true by default
    /////////////////////////////////////////////
    BaseScaleWidget: o(
        {
            "class": o("GeneralArea", "OrientedElement", "NumericElement"),
            context: {
                ofVerticalElement: true,
                myCanvas: [{ children: { canvas: _ } }, [me]],
                myScale: [{ children: { scale: _ } }, [me]],
                // used for positioning
                minValPoint: {
                    element: [me],
                    label: "minValPoint"
                },
                maxValPoint: {
                    element: [me],
                    label: "maxValPoint"
                }
            },
            children: {
                canvas: {
                    description: {
                        "class": "BaseSegmentedCanvas"
                    }
                },
                scale: {
                    description: {
                        "class": "SliderScale"
                    }
                }
            },
            position: {
                labelMaxValPoint: {
                    point1: {
                        element: [{ myAnchorContinuousRange: _ }, [me]],
                        type: [{ highValLength: _ }, [me]],
                        content: true
                    },
                    point2: { label: "maxValPoint" },
                    equals: 0 // [{ marginAroundExtremumPoint: _ }, [me]]
                },
                labelMinValPoint: {
                    point1: { label: "minValPoint" },
                    point2: {
                        element: [{ myAnchorContinuousRange: _ }, [me]],
                        type: [{ lowValLength: _ }, [me]],
                        content: true
                    },
                    equals: 0 // [{ marginAroundExtremumPoint: _ }, [me]]
                }
            }
        }
    ),
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a slider widget. 
    // a slider widget is the container that displays the slider's continuous spectrum and infinity points, allows to select ranges defining the different intensional overlays, 
    // and displays the projection of the extensional overlays on its associated facet. 
    // It is inherited by the SliderPrimaryWidget/SliderSecondaryWidget.
    // This class attaches itself (either its plusInfinityPoint or minusInfinityPoint, depending on whether its vertical or horizontal) to the "contentBeginning" posPoint label
    // for which the Widget class provides a default set of constraints.
    //
    // Embeds: 
    // 1. SliderBaseOverlayXWidget: a class that represents the base overlay in this widget (Fat/Lean).
    // 2. permOverlayXWidgets: an areaSet of columns, each representing a single overlay showing. The data for this areaSet is provided by the Widget class, inherited by the two 
    //    potential sibling classes, PrimaryWidget/SecondaryWidget.
    // 
    // This class defines the plusInfinity/minusInfinity posPoint labels, as well as the maxValPoint/minValPoint posPoint labels (the latter represent the ends of the slider's
    // *continuous* range. These pos points are used for positioning areas embedded in the widget.
    //
    // API: 
    // 1. infinityPointMarginOnBeginningSide/infinityPointMarginOnEndSide: default value provided.
    // 2. valueMarker1DRadius: the radius of the 1D valueMarkers to be displayed. default value provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                sliderEnabled: [{ myFacet: { sliderEnabled: _ } }, [me]],
                showScaleEditControl: [{ myFacet: { showScaleEditControl: _ } }, [me]],
                scaleType: [mergeWrite,
                    [{ currentViewWidgetDataObj: { scaleType: _ } }, [me]],
                    [{ myFacet: { defaultScaleType: _ } }, [me]]
                ],
                nonNumericalValuesExist: true, // [{ myFacet: { values:_ } }, [me]] // triggers bug #1448
                hasHistogram: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "Histogram"]
                ],
                defineDefaultScaleAndCanvas: true,
            }
        },
        { // default
            "class": o(
                "NumericWidget",
                "DiscreteWidget" // for the non-numerical values
            ),
            context: {
                // NumericWidget params
                myAnchorContinuousRange: [{ children: { sliderBaseOverlayXWidget: { children: { continuousRange: _ } } } }, [me]],

                myCanvas: [{ children: { canvas: _ } }, [me]],
                myScale: [{ children: { scale: _ } }, [me]],

                infinityPointMarginOnBeginningSide: bSliderPosConst.infinityPointOffsetFromWidgetBeginning, // default values. overridden in variants below
                infinityPointMarginOnEndSide: bSliderPosConst.infinityPointOffsetFromWidgetBeginning, // default values. overridden in variants below
                intraWidgetMarginOnLengthAxis: [densityChoice, bSliderPosConst.intraWidgetMarginOnLengthAxis],

                valueMarker1DRadius: [densityChoice, bSliderPosConst.valueMarker1DRadius],
                marginAroundValueMarker: 0, //  a (symmetric) safety margin so that the bin doesn't clip its embedded valueMarker
                // The number of 1DValueMarker bins:
                // calculated based on the total length of the continuous range displayed in the widget and the diameter of the 1D valueMarkers
                numOfSlider1DValueMarkerBins: [floor,
                    [div,
                        [{ baseOverlayContinuousRangeLength: _ }, [me]],
                        [plus,
                            [mul, [{ valueMarker1DRadius: _ }, [me]], 2], // the diameter of a 1D valueMarker
                            [{ marginAroundValueMarker: _ }, [me]]
                        ]
                    ],
                    0
                ],

                selectorTriangleLengthAxis: [div, [densityChoice, [{ sliderPosConst: { selectorGirthAxis: _ } }, [globalDefaults]]], 2],
                infinityPointMarginOnLengthAxis: [plus,
                    [{ intraWidgetMarginOnLengthAxis: _ }, [me]],
                    [plus,
                        [{ selectorTriangleLengthAxis: _ }, [me]],
                        [densityChoice, [{ sliderPosConst: { selectorRectangleLengthAxis: _ } }, [globalDefaults]]]
                    ]
                ],
                infinityPointMarginOnBeginningSide: [{ infinityPointMarginOnLengthAxis: _ }, [me]],
                infinityPointMarginOnEndSide: [{ infinityPointMarginOnLengthAxis: _ }, [me]],

                // for offset between maxValPoint & myAnchorContinuousRange's highValLength as well as between minValPoint and myAnchorContinuousRange's lowValLength
                halfAValueMarker: [ceil, [div, [{ valueMarker1DRadius: _ }, [me]], 2]],
                /*[cond,
                  [{ highValAtLowHTMLLength:_ }, [me]],
                  o(
                    { on: true, use: [{ halfAValueMarker:_ }, [me]] },
                    { on: false, use: [mul, -1, [{ halfAValueMarker:_ }, [me]]] }
                   )
                 ]*/
            },
            position: {
                positionInfinityPointWRTToBeginningSide: {
                    point1: { label: "contentBeginning" }, // note we use this label and not the lowHTMLLength point of the widget!
                    point2: [{ contentBeginningInfinityPoint: _ }, [me]], // see variants below
                    equals: [{ infinityPointMarginOnBeginningSide: _ }, [me]]
                },
                // the other InfinityPoint is determined by the length of the SliderContinuousRange
                labelPlusInfinityPoint: {
                    point1: {
                        element: [{ children: { sliderBaseOverlayXWidget: { children: { plusInfinityRange: _ } } } }, [me]],
                        label: "infinityPoint"
                    },
                    point2: { label: "plusInfinityPoint" },
                    equals: 0
                },
                labelMinusInfinityPoint: {
                    point1: { label: "minusInfinityPoint" },
                    point2: {
                        element: [{ children: { sliderBaseOverlayXWidget: { children: { minusInfinityRange: _ } } } }, [me]],
                        label: "infinityPoint"
                    },
                    equals: 0
                }
            },
            children: {
                permOverlayXWidgets: {
                    // data: provided by Widget, inherited by PrimaryWidget/SecondaryWidget, the two possible sibling classes
                    description: {
                        "class": "SliderPermOverlayXWidget"
                    }
                }
            }
        },
        {
            qualifier: { sliderEnabled: true },
            children: {
                canvas: {
                    description: {
                        "class": "SliderCanvas",

                        context: {
                            attemptedBinCountList: o(
                                5, 6, 7, 8, 10, 12, 15, 18
                            )
                        }

                    }
                },
                scale: {
                    description: {
                        "class": "SliderScale"
                    }
                }
            }
        },
        {
            qualifier: {
                sliderEnabled: true,
                showScaleEditControl: true
            },
            children: {
                scaleEditControl: {
                    description: {
                        "class": "SliderScaleEditControl"
                    }
                }
            }
        },
        {
            qualifier: { nonNumericalValuesExist: true },
            children: {
                valuesView: { // nonNumerical values. note: area name is part of Widget API (see discreteValues there)
                    description: {
                        "class": "SliderNonNumericalValuesView"
                    }
                }
            }
        },
        {
            qualifier: { hasHistogram: true },
            children: {
                canvas: {
                    description: {
                        "class": "SliderCanvasPartition"
                    }
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            context: {
                contentBeginningInfinityPoint: { element: [me], label: "plusInfinityPoint" },
                contentEndInfinityPoint: { element: [me], label: "minusInfinityPoint" }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            context: {
                contentBeginningInfinityPoint: { element: [me], label: "minusInfinityPoint" },
                contentEndInfinityPoint: { element: [me], label: "plusInfinityPoint" }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionOnSliderCanvas: {
        "class": "PositionOnCanvas"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderWidget: {
        "class": "SliderWidget",
        children: {
            sliderBaseOverlayXWidget: {
                description: {
                    "class": "LeanSliderBaseOverlayXWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderWidget: {
        "class": "SliderWidget",
        children: {
            sliderBaseOverlayXWidget: {
                description: {
                    "class": "FatSliderBaseOverlayXWidget"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a sliderWidget on the primary axis (currently: the vertical axis). It is embedded in the sliderAmoeba.
    // This class inherits the SliderWidget (Lean/Fat), PrimaryWidget, and VerticalSliderElement.
    // It defines the topAnchorForHistogramOr2DPlot/bottomAnchorForHistogramOr2DPlot posPoint labels, which are used to position the histogram/2D-plot.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderPrimaryWidget: {
        "class": o("VerticalNumericElement", "PrimaryWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderPrimaryWidget: {
        "class": o("SliderPrimaryWidget", "LeanSliderWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderPrimaryWidget: {
        "class": o("SliderPrimaryWidget", "FatSliderWidget")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a sliderWidget on the secondary axis (the horizontal axis, currently). 
    // It inherits SliderWidget (Fat only - the Lean offers no 2D plot), SecondaryWidget, and HorizontalSliderElement.
    // It defines the twoDPlotLeftAnchor/twoDPlotRightAnchor posPoint labels, used to position the 2D-plot on the horizontal axis.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderSecondaryWidget: {
        "class": o(
            "HorizontalNumericElement",
            "FatSliderWidget", // the secondary widget appears only in the Fat version currently.
            "SecondaryWidget"
        ),
        position: {
            labelTwoDPlotLeftAnchor: {
                point1: { label: "twoDPlotLeftAnchor" },
                point2: { label: "minusInfinityPoint" },
                equals: 0
            },
            labelTwoDPlotRightAnchor: {
                point1: { label: "twoDPlotRightAnchor" },
                point2: { label: "plusInfinityPoint" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting class to track the set of context labels defined in TrackMyWidget, including myCanvas.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMySliderWidget: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                scaleType: [{ myWidget: { scaleType: _ } }, [me]],
                sliderEnabled: [{ myWidget: { sliderEnabled: _ } }, [me]]
            }
        },
        { // default
            "class": "TrackMyNumericWidget"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SliderOverlayXWidget Classes - the representation of an Overlay in a SliderWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is used by both intensional and extensional *permanent* overlays.
    // It inherits PermOverlayXWidget.
    // It inherits addendum classes in two separate qualifiers, depending on whether the permanent overlay is an intensional or extensional overlay.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderPermOverlayXWidget: o(
        { // default 
            "class": o("PermOverlayXWidget")
        },
        {
            qualifier: { ofIntOverlay: true },
            "class": "SliderIntOverlayXWidget"
        },
        {
            qualifier: { ofIntOverlay: false },
            "class": "SliderPermExtOverlayXWidget" // the ephExtOverlay rides on the same ephemeral OverlayXWidget
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by SliderIntBaseOverlayXWidget (which in turn is common to SliderIntOverlayXWidget and SliderBaseOverlayXWidget), 
    // and to SliderPermExtOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderOverlayXWidget: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                setGirthConstraint: false // turning off PermOverlayXWidget's default value. Instead, use MinWrap for the length axis (variants below)             
            }
        },
        {
            "class": o("GeneralArea",
                "TrackMySliderWidget", // should appear before TrackMyFacet so that it overrides its myFacet definition!
                "TrackMyFacet"),
            position: {
                takeUpMaximumLength: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    preference: "max",
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                }
            }
        },
        {
            qualifier: {
                setGirthConstraint: false,
                ofVerticalElement: true
            },
            "class": "MinWrapHorizontal"
        },
        {
            qualifier: {
                setGirthConstraint: false,
                ofVerticalElement: false
            },
            "class": "MinWrapVertical"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // It inherits SliderOverlayXWidget.
    // It embeds:
    // 1. SliderContinuousRange
    // 2. The two infinity ranges, on either side of the continuous range.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderOverlayXWidgetWithRanges: {
        "class": o("SliderOverlayXWidget"),
        children: {
            continuousRange: {
                description: {
                    "class": "SliderContinuousRange"
                }
            },
            plusInfinityRange: {
                description: {
                    "class": "SliderPlusInfinityRange"
                }
            },
            minusInfinityRange: {
                description: {
                    "class": "SliderMinusInfinityRange"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the addendum inherited by SliderPermOverlayXWidget's qualifier for an extensional overlay. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderPermExtOverlayXWidget: {
        "class": "SliderOverlayXWidget",
        position: {
            labelEndSideAnchor: {
                point1: { label: "endSideAnchor" },
                point2: { type: [{ endGirth: _ }, [me]] },
                equals: 0
            },
            attachLeftToBeginningSideAnchor: {
                point1: { type: [{ beginningGirth: _ }, [me]] },
                point2: { label: "beginningSideAnchor" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by SliderBaseOverlayXWidget and the SliderIntOverlayXWidget.
    // It inherits SliderOverlayXWidgetWithRanges.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderIntBaseOverlayXWidget: {
        "class": o("SliderOverlayXWidgetWithRanges")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the base overlay in a slider widget. It is embedded in SliderWidget.
    // It inherits SliderIntBaseOverlayXWidget.
    // This class defines the beginningOfFirstOverlayXWidget posPoint label, used by the PermOverlayXWidget to position the first instance of its areaSet.
    //
    // API: 
    // 1. offsetToFirstOverlayXWidget: default provided
    // 2. show: boolean, true by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderBaseOverlayXWidget: o(
        { // variant-controller
            qualifier: "!",
            context: {
                show: [{ myApp: { effectiveBaseOverlay: { show: _ } } }, [me]],
                setGirthConstraint: true
            }
        },
        { // default
            "class": o("BaseOverlayXWidget", "SliderIntBaseOverlayXWidget"),
            context: {
                myOverlay: [{ myApp: { effectiveBaseOverlay: _ } }, [me]],
                offsetToFirstOverlayXWidget: bSliderPosConst.offsetToFirstOverlayXWidget,
                overlayXWidgetGirth: bSliderPosConst.girthOfBaseOverlayXWidget
            },
            position: {
                labelEndSideAnchor: { // to allow anchoring of the embedded sliderContinuousRange
                    point1: { label: "endSideAnchor" },
                    point2: { type: [{ endGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { show: false },
            position: {
                girthConstraint: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { show: true },
            position: {
                girthConstraint: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: [{ overlayXWidgetGirth: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                attachToScale: {
                    point1: {
                        element: [{ children: { scale: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: bSliderPosConst.fromScaleToBaseOverlayXWidgetBeginningGirth
                },
                labelBeginningOfFirstOverlayXWidget: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    equals: [{ offsetToFirstOverlayXWidget: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                attachToScale: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { scale: _ } }, [embedding]],
                        type: "top"
                    },
                    equals: bSliderPosConst.fromScaleToBaseOverlayXWidgetBeginningGirth
                },
                labelBeginningOfFirstOverlayXWidget: {
                    point1: {
                        element: [{ myWidget: _ }, [me]],
                        label: "beginningOfFirstOverlayXWidget"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ offsetToFirstOverlayXWidget: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanSliderBaseOverlayXWidget: {
        "class": "SliderBaseOverlayXWidget"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatSliderBaseOverlayXWidget: {
        "class": "SliderBaseOverlayXWidget"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents an intensional overlay in a slider widget. 
    // It is inherited by SliderPermOverlayXWidget (as its intensional overlay variant).
    // This class inherits SliderIntBaseOverlayXWidget (also inherited by SliderBaseOverlayXWidget).
    //
    // It embeds:
    // 1. the two selectors: highValSelector and lowValSelector
    // 2. the connector that runs between them, which also allows co-dragging them.
    // 3. bins for 1D value markers, representing the projection of this facet's implicit1DSet for the associated overlay, as well as the associated overlay's solutionSet 
    //    (the former being, by definition, a superset of the latter). 
    //
    // API:
    // 1. offsetEndSideAnchorFromHighHTMLGirth: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderIntOverlayXWidget: o(
        { //
            qualifier: "!",
            context: {
                valSelectorBeingModified: o(
                    [{ lowValSelectorBeingModified: _ }, [me]],
                    [{ highValSelectorBeingModified: _ }, [me]]
                ),
                valSelectorsCodragging: [{ children: { valSelectorsConnector: { tmd: _ } } }, [me]],
                valSelectorsElasticSelection: [and,
                    [not, [{ valSelectorsCodragging: _ }, [me]]],
                    [{ children: { continuousRange: { elasticSelection: _ } } }, [me]]
                ],
                calculateDiscreteValOfCurrentPointer: o(
                    [{ valSelectorBeingModified: _ }, [me]],
                    [{ valSelectorsElasticSelection: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("SliderIntBaseOverlayXWidget", "Operationable", "TrackMySliderFacetXIntOverlay"),
            context: {
                valSelectorsOfEqualValue: [equal,
                    [{ content: { lowVal: _ } }, [me]],
                    [{ content: { highVal: _ } }, [me]]
                ],

                // a set of context labels to indicate whether one of the embedded selectors is being dragged, or both of them (either co-dragged via their selector, or using the 
                // elastic selection mechanism). 
                lowValSelectorBeingModified: [{ children: { lowValSelector: { tmd: _ } } }, [me]],
                highValSelectorBeingModified: [{ children: { highValSelector: { tmd: _ } } }, [me]],
                bothValSelectorsBeingModified: o(
                    [{ valSelectorsCodragging: _ }, [me]],
                    [{ valSelectorsElasticSelection: _ }, [me]]
                ),
                beingModified: o(
                    [{ valSelectorBeingModified: _ }, [me]],
                    [{ bothValSelectorsBeingModified: _ }, [me]]
                ),

                // Operationable param 
                myOperationInProgress: o(
                    [{ valSelectorBeingModified: _ }, [me]],
                    [{ valSelectorsCodragging: _ }, [me]],
                    [{ valSelectorsElasticSelection: _ }, [me]]
                ),

                "^tmdAbsOffset": 0, // to record the anchor at the mouseDown when performing an elastic selection.

                offsetEndSideAnchorFromHighHTMLGirth: 0 // default value                
            },
            position: {
                attachBeginningGirthToBeginningSideAnchor: {
                    point1: { type: [{ beginningGirth: _ }, [me]] },
                    point2: { label: "beginningSideAnchor" },
                    equals: 0
                }
            },
            stacking: {
                valConnectorAboveContinuousRange: {
                    higher: [{ children: { valSelectorsConnector: _ } }, [me]],
                    lower: [{ children: { continuousRange: _ } }, [me]]
                }
            }
        },
        {
            qualifier: { sliderEnabled: true },
            context: {
                myHighValSelector: [{ children: { highValSelector: _ } }, [me]],
                myLowValSelector: [{ children: { lowValSelector: _ } }, [me]]
            },
            children: {
                highValSelector: {
                    description: {
                        "class": "HighValSelector"
                    }
                },
                valSelectorsConnector: {
                    description: {
                        "class": "ValSelectorsConnector"
                    }
                },
                lowValSelector: {
                    description: {
                        "class": "LowValSelector"
                    }
                }
            }
        },
        // we separate the definition of "endSideAnchor" into the two axis-specific variants because the offset from the frame corner isn't 0!
        {
            qualifier: { ofVerticalElement: true },
            position: {
                labelEndSideAnchor: {
                    point1: { label: "endSideAnchor" },
                    point2: { type: "right" },
                    equals: [{ offsetEndSideAnchorFromHighHTMLGirth: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                labelEndSideAnchor: {
                    point1: { type: "top" },
                    point2: { label: "endSideAnchor" },
                    equals: [{ offsetEndSideAnchorFromHighHTMLGirth: _ }, [me]]
                }
            }
        },
        {
            qualifier: { disabled: true },
            write: {
                // if the selections are modified in some way, then turn off the disabled flag (if it was on...)
                onSliderIntOverlayXWidgetTurnOffDisabled: {
                    upon: [{ myOperationInProgress: _ }, [me]],
                    true: {
                        turnOffDisabled: {
                            to: [{ disabled: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { calculateDiscreteValOfCurrentPointer: true },
            children: {
                normalizedPointer: {
                    description: {
                        "class": "PositionOnSliderCanvas",
                        context: {
                            // PositionOnCanvas params
                            value: [round,
                                [[{ myCanvas: { positionToValue: _ } }, [me]],
                                {
                                    element: [pointer],
                                    type: [{ lowHTMLLength: _ }, [me]]
                                }
                                ],
                                [{ myFacet: { numberOfDigits: _ } }, [embedding]]
                            ]
                        }
                    }
                }
            },
            position: {
                labelNormalizedPointer: {
                    point1: {
                        element: [{ children: { normalizedPointer: _ } }, [me]],
                        type: [{ centerLength: _ }, [me]]
                    },
                    point2: {
                        label: "normalizedPointer"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { valSelectorsElasticSelection: true },
            position: {
                labelSelectorTmd: {
                    point1: {
                        element: [{ myApp: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        label: "selectorTmd"
                    },
                    equals: [{ tmdAbsOffset: _ }, [me]]
                },
                labelElasticSelectionBeginningAnchor: {
                    point1: { label: "selectorTmd" },
                    point2: { label: "elasticSelectionBeginningAnchor" },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderIntOverlayXWidgetDelay: {
        "class": "DelayedInArea",
        context: {
            inAreaDelay: [{ slider: { valSelectorDisplayCreationDelay: _ } }, [globalDefaults]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of classes representing the Overlay X Widget - the representation of an Overlay in a SliderWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of classes representing elements within the SliderOverlayXWidget
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the continuous range on a slider (other than the continuous range, a slider also has the plusInfinity and minusInfinity regions). 
    // it is embedded in SliderIntBaseOverlayXWidget.
    //
    // other than when embedded in the sliderBaseOverlayXWidget, this class has a role in supporting the selectors elastic selection functionality: 
    // it inherits AppInAction, to allow tracking that an elastic selection is in process. it also records the absolute offset at the beginning (mouseDown) of this operation.
    // this starting point is where one of the valSelectors is positioned, and it is the boundedDrag point for both selectors - see SliderIntOverlayXWidget for related positioning 
    // constraints (elasticSelectionBeginningAnchor).
    //  
    // It embeds an areaSet of oneDValueMarkerBins (if markerByValue: false) or an areaSet of oneDValueMarkers (if markerByValue: true)
    // this class also embeds SliderContinuousSelectedRange, which provides the visual indication of the range selection on the continuous range, if any. 
    // 
    // API:
    // 1. if markerByValue is true, then inheriting classes should specify oneDValueMarkersData
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousRange: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showStats: [{ myFacet: { showStats: _ } }, [me]],
                displayValueMarkers: [or, [not, [{ showStats: _ }, [me]]], [{ displayValueMarkersWithStats: _ }, [me]]],
            }
        },
        { // default 
            "class": o(
                "GeneralArea",
                "TrackMyOverlayXWidget",
                "TrackMySliderWidget", // appears before TrackMyFacet so as to override its definition of myFacet
                "TrackMyFacet"),
            context: {
                displayValueMarkersWithStats: [equal,
                    [{ displayValueMarkersWithStatsABTest: _ }, [areaOfClass, "FSApp"]],
                    "yes"
                ]
            },
            stacking: {
                keepAboveValueMarkersLabelBelowAmoebaZTop: {
                    lower: { label: "aboveValueMarkers" },
                    higher: {
                        element: [{ myAmoeba: _ }, [me]],
                        label: "zTop"
                    }
                }
            }
        },
        {
            qualifier: { sliderEnabled: true },
            "class": "SliderIntOverlayXWidgetDelay",
            children: {
                oneDValueMarkers: {
                    // The following uses data elements as the query, which
                    // is not efficient, and doesn't work, since multiQuery,
                    // doesn't convert.
                    // data: [
                    //     [{oneDValueMarkerDataFilter:_}, [me]],
                    //     [{myCanvas:{oneDMarkerValue:_}}, [me]]
                    // ]
                    // So instead filter the ranges from oneDMarkerValue by
                    // using them as queries on oneDValueMarkerDataFilter.
                    // [bool] is required as filter is not data-source-aware.
                    data: [
                        filter,
                        [defun, "range",
                            [bool,
                                [[{ range: _ }, "range"], [{ oneDValueMarkerDataFilter: _ }, [me]]]
                            ]
                        ],
                        [{ myCanvas: { oneDMarkerValue: _ } }, [me]]
                    ]
                }
            }
        },
        // ofBaseOverlayXWidget variants:
        {
            qualifier: { ofBaseOverlayXWidget: false },
            "class": "MatchBaseOverlayContinousRangeOnLengthAxis"
        },
        {
            qualifier: { ofBaseOverlayXWidget: true },
            context: {
                show: [{ myOverlayXWidget: { show: _ } }, [me]]
            }
        },
        {
            qualifier: {
                ofBaseOverlayXWidget: true,
                show: true
            },

            context: {
                oneDValueMarkerDataFilter: [
                    { myFacetClipper: { effectiveBaseOverlayProjectedValues: _ } },
                    [me]
                ]
            }
        },
        // ofPermExtOverlayXWidget variants:
        {
            qualifier: { ofPermExtOverlayXWidget: true, displayValueMarkers: true },

            context: {
                oneDValueMarkerDataFilter: [
                    { myOverlayXWidget: { overlaySolutionSetProjection: _ } },
                    [me]
                ]
            },

            children: {
                oneDValueMarkers: {
                    // data: provided by variants above
                    description: {
                        "class": "Slider1DValueMarkerOfPermExtOverlay"
                    }
                }
            }

        },
        {
            qualifier: { ofPermIntOverlayXWidget: true }, // common for showStats on and off
            context: {
                "*elasticSelection": false,

                // don't interfere with codragging's 'ctrl-click'
                tmdableWithCtrl: false,
                currentOffsetOfPointerFromApp: [offset, // offset on axis of slider
                    {
                        element: [{ myApp: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    {
                        element: [pointer],
                        type: [{ lowHTMLLength: _ }, [me]]
                    }
                ]
            },
            children: {
                continuousRangeInnerFrame: {
                    description: {
                        "class": "SliderContinuousRangeInnerFrame"
                    }
                },
                continuousSelectedRange: {
                    description: {
                        "class": "SliderContinuousSelectedRange"
                    }
                },
                continuousRangeInnerFrameSelectedRange: {
                    description: {
                        "class": "SliderContinuousInnerFrameSelectedRange"
                    }
                }
            },
            write: {
                onSliderContinuousRangeRecordMouseDownCoordinates: {
                    "class": "OnMouseDown",
                    true: {
                        recordTmdAbsOffset: {
                            to: [{ myOverlayXWidget: { tmdAbsOffset: _ } }, [me]],
                            merge: [{ currentOffsetOfPointerFromApp: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                ofPermIntOverlayXWidget: true,
                sliderEnabled: true
            },
            // Tmdable: to support elastic selection. 
            // We record the mouseDown length-axis offset, so that both selectors could be brought to that point on mouseDown (and depending on direction of mouse movement, 
            // one will be dragged away from that point, and fixed at the mouseUp position). 
            // Operationable is inherited so that the App would know it's in the midst of an operation.(to avoid tooltips appearing, etc.).
            "class": o("Operationable", "Tmdable")
        },
        {
            qualifier: { ofPermIntOverlayXWidget: true, displayValueMarkers: true },
            context: {
                oneDValueMarkerDataFilter: [
                    { myOverlayXWidget: { overlayImplicit1DSetProjection: _ } },
                    [me]
                ]
            },
            children: {
                oneDValueMarkers: {
                    // data: provided by variants above
                    description: {
                        "class": "Slider1DValueMarkerOfIntOverlay"
                    }
                }
            }
        },
        {
            qualifier: { showStats: true },
            children: {
                boxPlot: {
                    description: {
                        "class": "StatsContainer"
                    }
                }
            }
        },
        {
            qualifier: {
                ofPermIntOverlayXWidget: true,
                elasticSelection: true
            },
            write: {
                onSliderContinuousRangeAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        terminateElasticSelection: {
                            to: [{ elasticSelection: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                ofPermIntOverlayXWidget: true,
                tmd: true
            },
            context: {
                absOffsetCurrentPointerAndPointerAtTmd: [abs,
                    [minus,
                        [{ currentOffsetOfPointerFromApp: _ }, [me]],
                        [{ myOverlayXWidget: { tmdAbsOffset: _ } }, [me]]
                    ]
                ]
            },
            write: {
                onSliderContinuousRangeTriggerElasticSelection: {
                    "class": "OnMouseClickExpired",
                    true: {
                        setElasticSelection: {
                            to: [{ elasticSelection: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by areas which wish to match the continuous range of the effectiveBaseOverlay, along the length axis of the widget.
    //
    // API:
    // 1. myWidget
    // 2. lowHTMLLength/highHTMLLength
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchBaseOverlayContinousRangeOnLengthAxis: {
        position: {
            attachLowHMTLLengthToBaseOverlayContinuousRange: {
                point1: {
                    element: [{ myWidget: { myAnchorContinuousRange: _ } }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                equals: 0
            },
            attachHighHMTLLengthToBaseOverlayContinuousRange: {
                point1: {
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                },
                point2: {
                    element: [{ myWidget: { myAnchorContinuousRange: _ } }, [me]],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousRangeInnerFrame: o(
        { // default
            "class": o(
                "SliderContinuousRangeInnerFrameDesign",
                "GeneralArea",
                "TrackMyOverlayXWidget",
                "TrackMySliderWidget"
            ),
            position: {
                attachToLowHTMLLengthOfEmbedding: {
                    point1: {
                        element: [embedding],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    equals: 0
                },
                attachToHighHTMLLengthOfEmbedding: {
                    point1: { type: [{ highHTMLLength: _ }, [me]] },
                    point2: {
                        element: [embedding],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0
                },
                attachToHighHTMLGirthOfEmbedding: {
                    point1: {
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        element: [embedding],
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                },
                girthConstraint: {
                    point1: {
                        type: [{ lowHTMLGirth: _ }, [me]],
                        content: true
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]],
                        content: true
                    },
                    equals: [densityChoice, [{ sliderPosConst: { continuousRangeInnerFrameContentGirth: _ } }, [globalDefaults]]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousInnerFrameSelectedRange: {
        "class": o(
            "SliderContinuousInnerFrameSelectedRangeDesign",
            "GeneralArea",
            "AboveSiblings",
            "TrackMyOverlayXWidget",
            "TrackMySliderWidget"
        ),
        context: {
            myContinuousRangeInnerFrame: [
                { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                [areaOfClass, "SliderContinuousRangeInnerFrame"]
            ]
        },
        position: {
            "class": "ConnectToValSelectorsOnLengthAxis",
            // note we connect to the frame, not the content, of myContinuousRangeInnerFrame, and we're AboveSiblings, to cover its border
            attachToInnerFrameLowHTMLGirth: {
                point1: { type: [{ lowHTMLGirth:_ }, [me]] },
                point2: { 
                    element: [{ myContinuousRangeInnerFrame:_ }, [me]],
                    type: [{ lowHTMLGirth:_ }, [me]]
                },
                equals: 0
            },
            attachToInnerFrameHighHTMLGirth: {
                point1: { type: [{ highHTMLGirth:_ }, [me]] },
                point2: { 
                    element: [{ myContinuousRangeInnerFrame:_ }, [me]],
                    type: [{ highHTMLGirth:_ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the range of the actual selection made, within the continuous range of a slider. it is embedded in SliderContinuousRange.
    // when the selection is "Any" (i.e. { selectionsMade: false }), or when the facet's selections are disabled, this class has a girth of zero, and so has no visual representation.
    // 
    // API:
    // 1. color
    // 2. opacity
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousSelectedRange: o(
        { // default
            "class": o(
                "SliderContinuousSelectedRangeDesign",
                "GeneralArea",
                "MatchGirthOfContinuousRange",
                "Tmdable",
                "TrackMyOverlayXWidget",
                "TrackMySliderWidget"),
            context: {
                tmdableContinuePropagation: true // override Tmdable's default: we want to keep track of the mouseDown for SliderContinuousRange's 
                // mouseClick handler, and we want to make sure the mouseDown here propagates down to SliderContinuousRange
            },
            position: {
                "class": "ConnectToValSelectorsOnLengthAxis"
            }
        },
        {
            qualifier: {
                sliderContinuousRangeColorOnAnyABTest: "Transparent",
                selectionsMade: false
            },
            position: {
                zeroGirth: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { disabled: true },
            position: {
                zeroGirth: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ConnectToValSelectorsOnLengthAxis: {
        attachToHighValSelector: {
            point1: { type: [{ highValLength: _ }, [me]] },
            point2: [{ myOverlayXWidget: { myHighValSelector: { valPosPoint: _ } } }, [me]],
            equals: 0
        },
        attachToLowValSelector: {
            point1: { type: [{ lowValLength: _ }, [me]] },
            point2: [{ myOverlayXWidget: { myLowValSelector: { valPosPoint: _ } } }, [me]],
            equals: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An aux class - inheriting classes match the girth of the continuous range of their overlay widget.
    // We use a weakerThanDefault priority so that the SliderContinuousSelectedRange class, which inherits this class, can use the default priority in order to set itself to have 
    // no girth.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchGirthOfContinuousRange: {
        "class": o("GeneralArea", "TrackMyOverlayXWidget"),
        position: {
            attachToContinuousRangeLowHTMLGirth: {
                point1: {
                    type: [{ lowHTMLGirth: _ }, [me]]
                },
                point2: {
                    element: [{ myOverlayXWidget: { children: { continuousRange: _ } } }, [me]],
                    type: [{ lowHTMLGirth: _ }, [me]]
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault
            },
            attachToContinuousRangeHighHTMLGirth: {
                point1: {
                    type: [{ highHTMLGirth: _ }, [me]]
                },
                point2: {
                    element: [{ myOverlayXWidget: { children: { continuousRange: _ } } }, [me]],
                    type: [{ highHTMLGirth: _ }, [me]]
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by SliderPlusInfinityRange and SliderMinusInfinityRange - the two infinity ranges positioned on either end of the SliderContinuousRange.
    // it embeds the infinityLines areaSet: which give the visual feel of "going to infinity" - the data for that areaSet is provided here. 
    // 
    // API: 
    // 1. Inheriting classes should provide the description for the infinityLines areaSet.
    // 2. numInfinityLines. default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderInfinityRange: {
        "class": o("GeneralArea", "MatchGirthOfContinuousRange", "TrackMyOverlayXWidget", "TrackMySliderWidget"),
        context: {
            // this is used in positioning the infinityPoint posPoint relative to the last embedded line (i.e. the most external line). since the offset between these
            // two points is not 0, its sign depends on the value of highValAtLowHTMLLength.
            // if highValAtLowHTMLLength: true, then the SliderPlusInfinityRange, for example, is at the top of the vertical widget, and its infinityPoint has a positive offset from 
            // its last embedded line (which defines the edge of its 'contents').
            // if, on the other hand, highValAtLowHTMLLength: false, then the SliderPlusInfinityRange is at the bottom of the vertical widget, and its infinityPoint has a negative
            // offset from its last embedded line.
            offsetFromInfinityToEndOfInfinityRangeContent: [cond,
                [{ highValAtLowHTMLLength: _ }, [me]],
                o(
                    { on: true, use: bSliderPosConst.infinityPointLengthAxisOffsetFromLastLine },
                    { on: false, use: [mul, -1, bSliderPosConst.infinityPointLengthAxisOffsetFromLastLine] }
                )
            ],
            numInfinityLines: bSliderPosConst.numInfinityLines
        },
        position: {
            // see inheriting classes for additional constraints
            height: 50,
            attachInfinitySideI: {
                point1: { type: [{ lowHTMLLength: _ }, [me]] },
                point2: { type: [{ highHTMLLength: _ }, [me]] },
                min: 0
            }
        },
        children: {
            infinityLines: {
                data: [sequence, r(1, [{ numInfinityLines: _ }, [me]])]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the plusInfinity region of a slider. It inherits SliderInfinityRange.
    // it is embedded in SliderIntBaseOverlayXWidget (the common code to the SliderBaseOverlayXWidget and the SliderIntOverlayXWidget).
    // it provides the PlusInfinityLine to the description of the infinityLines areaSet, provided by the inherited SliderInfinityRange.
    // 
    // this class defines the crossOverToInfinityPoint - currently the midPoint between the adjacent end of the continuous range, and the infinityPoint.
    // if the selector is on the infinityPoint-side of the crossOverToInfinityPoint, its value is plusInfinity, and on mouseUp it will reposition to the infinityPoint.
    // if the selector is on the other side of the crossOverToInfinityPoint, its value is the maxVal of the continuous range, and on mouseUp, it will reposition to the maxVal point.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderPlusInfinityRange: o(
        { // default
            "class": "SliderInfinityRange",
            context: {
                mySliderSelector: [{ myOverlayXWidget: { myHighValSelector: _ } }, [me]]
            },
            position: {
                attachToContinuousRange: {
                    point1: {
                        type: [{ lowValLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ myOverlayXWidget: { children: { continuousRange: _ } } }, [me]],
                        type: [{ highValLength: _ }, [me]]
                    },
                    equals: 0
                },
                labelCrossOverToInfinityPoint: {
                    pair1: {
                        point1: { label: "infinityPoint" },
                        point2: { label: "crossOverToInfinityPoint" }
                    },
                    pair2: {
                        point1: { label: "crossOverToInfinityPoint" },
                        point2: { type: [{ lowValLength: _ }, [me]] }
                    },
                    ratio: 1
                },

                // the highValSelector's center should not go beyond the top of this area, for highValAtLowHTMLLength 
                // (and vice-versa when highValAtLowHTMLLength is false )
                attachInfinitySideII: {
                    point1: { type: [{ highValLength: _ }, [me]] },
                    point2: [{ mySliderSelector: { valPosPoint: _ } }, [me]],
                    // min/max: 0 defined by highValAtLowHTMLLength variant below
                    priority: positioningPrioritiesConstants.weakerThanMouseAttachment
                }
            },
            children: {
                infinityLines: {
                    // data: see SliderInfinityRange
                    description: {
                        "class": "PlusInfinityLine"
                    }
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            position: {
                positionInfinityPoint: {
                    point1: {
                        label: "infinityPoint"
                    },
                    point2: {
                        element: [last, [{ children: { infinityLines: _ } }, [me]]],
                        type: [{ highValLength: _ }, [me]]
                    },
                    equals: [{ offsetFromInfinityToEndOfInfinityRangeContent: _ }, [me]]
                },
                attachInfinitySideII: {
                    min: 0
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            position: {
                positionInfinityPoint: {
                    point1: {
                        element: [last, [{ children: { infinityLines: _ } }, [me]]],
                        type: [{ highValLength: _ }, [me]]
                    },
                    point2: {
                        label: "infinityPoint"
                    },
                    equals: [{ offsetFromInfinityToEndOfInfinityRangeContent: _ }, [me]]
                },
                attachInfinitySideII: {
                    max: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the plusInfinity region of a slider. It inherits SliderInfinityRange.
    // it is embedded in SliderIntBaseOverlayXWidget (the common code to the SliderBaseOverlayXWidget and the SliderIntOverlayXWidget).
    // it provides the MinusInfinityLine to the description of the infinityLines areaSet, provided by the inherited SliderInfinityRange.
    // 
    // this class defines the crossOverToInfinityPoint - currently the midPoint between the adjacent end of the continuous range, and the infinityPoint.
    // if the selector is on the infinityPoint-side of the crossOverToInfinityPoint, its value is minusInfinity, and on mouseUp it will reposition to the infinityPoint.
    // if the selector is on the other side of the crossOverToInfinityPoint, its value is the minVal of the continuous range, and on mouseUp, it will reposition to the minVal point.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderMinusInfinityRange: o(
        { // default
            "class": "SliderInfinityRange",
            context: {
                mySliderSelector: [{ myOverlayXWidget: { myLowValSelector: _ } }, [me]]
            },
            position: {
                attachToContinuousRange: {
                    point1: {
                        element: [{ myOverlayXWidget: { children: { continuousRange: _ } } }, [me]],
                        type: [{ lowValLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highValLength: _ }, [me]]
                    },
                    equals: 0
                },
                labelCrossOverToInfinityPoint: {
                    pair1: {
                        point1: { type: [{ highValLength: _ }, [me]] },
                        point2: { label: "crossOverToInfinityPoint" }
                    },
                    pair2: {
                        point1: { label: "crossOverToInfinityPoint" },
                        point2: { label: "infinityPoint" }
                    },
                    ratio: 1
                },
                // see SliderInfinityRange for attachInfinitySideI:
                // the lowValSelector's center should not go beyond the bottom of this area, for highValAtLowHTMLLength 
                // (and vice-versa when highValAtLowHTMLLength is false )
                // (for highValAtLowHTMLLength: true, and vice-versa otherwise).
                attachInfinitySideII: {
                    point1: [{ mySliderSelector: { valPosPoint: _ } }, [me]],
                    point2: { type: [{ lowValLength: _ }, [me]] },
                    // min/max: 0 defined by highValAtLowHTMLLength variant below
                    priority: positioningPrioritiesConstants.weakerThanMouseAttachment
                }
            },
            children: {
                infinityLines: {
                    // data: see SliderInfinityRange
                    description: {
                        "class": "MinusInfinityLine"
                    }
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            position: {
                positionInfinityPoint: {
                    point1: {
                        element: [last, [{ children: { infinityLines: _ } }, [me]]],
                        type: [{ lowValLength: _ }, [me]]
                    },
                    point2: {
                        label: "infinityPoint"
                    },
                    equals: [{ offsetFromInfinityToEndOfInfinityRangeContent: _ }, [me]]
                },
                attachInfinitySideII: {
                    min: 0
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            position: {
                positionInfinityPoint: {
                    point1: {
                        label: "infinityPoint"
                    },
                    point2: {
                        element: [last, [{ children: { infinityLines: _ } }, [me]]],
                        type: [{ lowValLength: _ }, [me]]
                    },
                    equals: [{ offsetFromInfinityToEndOfInfinityRangeContent: _ }, [me]]
                },
                attachInfinitySideII: {
                    max: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class is inherited by PlusInfinityLine and MinusInfinityLine, and is for a single line in the infinity range of a slider.
    //
    // API: 
    // 1. spacingFromPrev: default provided
    // 2. legnthOfInfinityLine: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfinityLine: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstLine: [{ firstInAreaOS: _ }, [me]],
                lastLine: [{ lastInAreaOS: _ }, [me]]
            }
        },
        { // default
            "class": o("MemberOfPositionedAreaOS", "TrackMyOverlayXWidget", "TrackMySliderWidget"),
            context: {
                lengthOfInfinityLine: bSliderPosConst.lengthOfInfinityLine,
                // MemberOfPositionedAreaSet param:
                spacingFromPrev: bSliderPosConst.lengthAxisSpacingOfInfinityLines
            },
            position: {
                lengthOfInfinityLine: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [{ lengthOfInfinityLine: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class represents a single line in the plusInfinity range of a slider. it is inherited by the infinityLines areaSet embedded in plusInfinityRange.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PlusInfinityLine: o(
        { // default
            "class": "InfinityLine",
            context: {
                // MemberOfPositionedAreaSet param:
                areaOSPositionedFromLowToHighHTML: [not, [{ highValAtLowHTMLLength: _ }, [me]]]
            }
        },
        {
            qualifier: {
                firstLine: true,
                highValAtLowHTMLLength: true
            },
            position: {
                attachToEmbeddingLengthAxis: {
                    point1: {
                        type: [{ lowValLength: _ }, [me]]
                    },
                    point2: {
                        element: [embedding],
                        type: [{ lowValLength: _ }, [me]]
                    },
                    equals: [{ spacingFromPrev: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                firstLine: true,
                highValAtLowHTMLLength: false
            },
            position: {
                attachToEmbeddingLengthAxis: {
                    point1: {
                        element: [embedding],
                        type: [{ lowValLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowValLength: _ }, [me]]
                    },
                    equals: [{ spacingFromPrev: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class represents a single line in the minusInfinity range of a slider. it is inherited by the infinityLines areaSet embedded in minusInfinityRange.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinusInfinityLine: o(
        { // default
            "class": "InfinityLine",
            context: {
                // MemberOfPositionedAreaSet param:
                areaOSPositionedFromLowToHighHTML: [{ highValAtLowHTMLLength: _ }, [me]]
            }
        },
        {
            qualifier: {
                firstLine: true,
                highValAtLowHTMLLength: true
            },
            position: {
                attachToEmbeddingLengthAxis: {
                    point1: {
                        element: [embedding],
                        type: [{ highValLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highValLength: _ }, [me]]
                    },
                    equals: [{ spacingFromPrev: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                firstLine: true,
                highValAtLowHTMLLength: false
            },
            position: {
                attachToEmbeddingLengthAxis: {
                    point1: {
                        type: [{ highValLength: _ }, [me]]
                    },
                    point2: {
                        element: [embedding],
                        type: [{ highValLength: _ }, [me]]
                    },
                    equals: [{ spacingFromPrev: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of ValSelector classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a value selector for a slider. It is inherited by HighValSelector & LowValSelector, and as such it is embedded in SliderIntOverlayXWidget.
    // this class inherits (other than the tracking* classes):
    // 1. BoundedDraggable. The dragging of the selector is bounded as follows:
    // 1.1 When dragging a single valSelector, the bounds are its own infinityPoint on one side (the near side), and the closer of the other valSelector and the far end of the 
    //     continuousRange, on the other side (the far side).
    // 1.2 When dragging by the valSelectors connector (can be done only when both valSelectors are on the continuous range), the bounds are the ends of the continuous range.
    // 1.3 When conducting an elastic selection, the bounds are the respective infinityPoint, and the elasticSelectionBeginningAnchor posPoint (where the mouseDown took place).
    // 
    // position <-> value: When not being moved, the valSelector needs to be positioned based on its value. when being moved, its position needs to be translated to a value.
    // 1. value -> position: this class has two variants to position the selector: either at the infinity point (if its value is infinity), or on the continuous range (using 
    //                       the sliderCanvas..
    // 2. position -> value: When on the continuous range, the position is translated to a minVal <= value <= maxVal, using its canvas' positionToValue function.
    //                       if the valSelector is outside the continuous range, then it is in the infinity range. the infinity range is divided into two sections: 
    //                       the one closer to the continuous range, and the one closer to the infinity point.
    //                       If the valSelector is in the latter, then its value is set to be infinity (+ or -, as the case may be). If, on the other hand, the valSelector is still 
    //                       close enough to the continuous range (selectorCrossedOverToInfinityPoint: false), then its value is set to be the extremumVal. 
    //                       From the user's perspective this means that a valSelector being dragged outside the continuous range, maintains its extremumVal, even as its being dragged 
    //                       away until it changes to the infinity val, and maintains that for an interval, which ends at the infinity point. 
    // 
    // when the valSelector is being moved (either directly, or as part of a co-dragging of the selectors, or of an elastic selection), on mouseUp we write the value into stableVal, which
    // is a write-through to appropriate appData in the associated SliderFacetXIntOverlay.
    //
    // API: (inheriting classes assign either the highVal or lowVal values to these): 
    // 1. selectorValIsInfinity
    // 2. stableVal
    // 3. transientVal
    // 4. extremumVal
    // 5. infinityVal
    // 6. myInfinityRange
    // 7. embedHandle: the conditions under which a handle - a visual representation of the selector, will be displayed. Default definition provided.
    //    The inheriting class should provide in the { embedHandle: true } variant the relevant area definitions.   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelector: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedHandle: true,
                selectorIsBeingMoved: o(
                    [{ tmd: _ }, [me]],
                    [{ valSelectorsElasticSelection: _ }, [me]],
                    [{ valSelectorsCodragging: _ }, [me]]
                ),

                valSelectorsElasticSelection: [{ myOverlayXWidget: { valSelectorsElasticSelection: _ } }, [me]],
                valSelectorsCodragging: [{ myOverlayXWidget: { valSelectorsCodragging: _ } }, [me]],

                // for translateValSelectorPositionToValue (inherited via ValSelector): see inheriting classes for assignment of values to the posPoints in the offsets)
                // important note: while the names here refer to *selector*, the offset is calculated wrt the pointer. the selector obviously tracks it, but stops at
                // various discrete points along the way. in that sense, using *selector* in the context label name is a bit misleading.
                selectorBeyondExtremumPoint: [greaterThan,
                    [offset,
                        [{ beyondExtremumPointLowHTMLElement: _ }, [me]],
                        [{ beyondExtremumPointHighHTMLElement: _ }, [me]]
                    ],
                    0
                ],
                selectorCrossedOverToInfinityPoint: [greaterThan,
                    [offset,
                        [{ beyondInfCrossOverPointLowHTMLElement: _ }, [me]],
                        [{ beyondInfCrossOverPointHighHTMLElement: _ }, [me]]
                    ],
                    0
                ],

                "*becameInFocus": false, // once inFocus becomes true; used to decide whether to display the value next to the valSelector.
                createValSelectorDisplay: [and,
                    [arg, "debugCreateValSelectorDisplay", true],
                    o( // either when selector is being moved, and not in edit mode                    
                        [{ selectorIsBeingMoved: _ }, [me]],
                        [{ becameInFocus: _ }, [me]], // or when the tookMouseClick is true (i.e. after mouseClick, when still over the ValSelector)
                        [{ editInputDisplayText: _ }, [me]] // or when the SelectorDisplay is being edited
                    )
                ]
            }
        },
        { // default
            "class": o("ValSelectorDesign",
                "GeneralArea",
                "AboveSiblings",
                "BelowZTopOfArea",
                //we inherit this because Slider1DValueMarker get an independt z-value and 
                //we need to make sure it is placed under the zTop of the amoeba
                "ModifyPointerDraggable",
                "TrackMyFacet",
                "TrackMySliderWidget",
                "TrackMyOverlayXWidget"),
            context: {
                // note that the default 'value' is transientVal, and not stableVal - the reason is that the valSelector can move without being dragged: 
                // if another instance of its SliderWidget exists in a neighboring 2D plot, where the corresponding valSelector is being moved, 
                // then transientVal changes, and this valSelector should update its value/position in real-time.
                // see variant below to handle the dragging of this particular valSelector: its value is then determined by the valSelector's position.
                value: [{ transientVal: _ }, [me]],

                //BelowZTopOfArea param
                zTopAreaAboveMe: [{ myAmoeba: _ }, [me]],

                "*editInputDisplayText": false,

                rawValPosPoint: {
                    label: "rawValPosPoint",
                    element: [me]
                },
                "*pointerToValPosPointOffset": o(),

                myValSelectorDisplay: [
                    { myValSelector: [me] },
                    [areaOfClass, "ValSelectorDisplay"]
                ],
                myContinuousRangeInnerFrame: [
                    { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                    [areaOfClass, "SliderContinuousRangeInnerFrame"]
                ],
                selectorTriangleLengthAxis: [{ myWidget: { selectorTriangleLengthAxis: _ } }, [me]]
            },
            position: {
                selectorAttachToLowHTMLGirthOfInnerFrame: {
                    point1: {
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        element: [{ myContinuousRangeInnerFrame: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                }
            },
            write: {
                onValSelectorMouseDown: {
                    upon: [mouseDownReceivedBy, // note: not mouseDownHandledBy - i want to know in real-time, not at the end of the propagation
                        o([me], [{ myValSelectorDisplay: _ }, [me]])
                    ],
                    true: {
                        recordOffset: {
                            to: [{ pointerToValPosPointOffset: _ }, [me]],
                            merge: [
                                round,
                                [
                                    offset,
                                    {
                                        element: [pointer],
                                        type: [{ lowHTMLLength: _ }, [me]]
                                    },
                                    [{ valPosPoint: _ }, [me]]
                                ]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { sliderEnabled: false },
            position: {
                maintainVerticalPosition: {
                    point1: { element: [embedding], type: "top" },
                    point2: { type: "top" },
                    stability: true,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: { sliderEnabled: true },
            "class": "Tmdable"
        },
        {
            qualifier: { selectorIsBeingMoved: true },
            "class": "ModifyPointerDragging",
            context: {
                value: [{ translateValSelectorPositionToValue: _ }, [me]],
                myOperationInProgress: true
            },
            write: {
                onValSelectorTmdAnyMouseUpNotMouseClick: {
                    "class": "OnMouseUpNotMouseClick",
                    true: {
                        storeValueInStableVal: {
                            to: [{ stableVal: _ }, [me]],
                            merge: [{ value: _ }, [me]]
                        }
                    }
                }
            }
        },

        // variants that position the valSelector:
        {
            qualifier: {
                selectorValIsInfinity: true
            },
            position: {
                anchorToInfinityPoint: {
                    point1: [{ valPosPoint: _ }, [me]],
                    point2: {
                        element: [{ myInfinityRange: _ }, [me]],
                        label: "infinityPoint"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                selectorValIsInfinity: false
            },
            "class": "PositionOnSliderCanvas"
        },

        // the following variants store the value of the selector in
        // translateValSelectorPositionToValue, depending on its position:
        // if its on the continuous range, or in one of the two sub-regions of
        // the infinity range (selectorCrossedOverToInfinityPoint: true/false).
        // translateValSelectorPositionToValue is the value used by val only
        //  when the ValSelector is being moved.
        {
            qualifier: { selectorBeyondExtremumPoint: false },

            context: {

                // which function should be used to translate a position to
                //  a value? if 'shift' is pressed, use 'positionToRoundValue',
                //  which snaps the value to the nearest tickmark position
                // otherwise, use 'positionToValue', which uses the value of
                //  the pixel identified by the given posPoint
                positionToValueFunc: [
                    cond,
                    [{ modifier: { shift: true } }, [pointer]],
                    o(
                        {
                            on: true,
                            use: [
                                defun, o("posPoint"),
                                [
                                    [
                                        {
                                            myCanvas: {
                                                positionToRoundValue: _
                                            }
                                        },
                                        [me]
                                    ],
                                    "posPoint"
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: [{ myCanvas: { positionToValue: _ } }, [me]]
                        }
                    )
                ],


                translateValSelectorPositionToValue: [
                    round,
                    [
                        [{ positionToValueFunc: _ }, [me]],
                        [{ rawValPosPoint: _ }, [me]]
                    ],
                    [{ myFacet: { numberOfDigits: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: {
                selectorBeyondExtremumPoint: true,
                selectorCrossedOverToInfinityPoint: false
            },
            context: {
                translateValSelectorPositionToValue: [{ extremumVal: _ }, [me]]
            }
        },
        {
            // when a selector is being moved and *not* as part of co-dragging,
            //  it's allowed to take on the infinity value
            qualifier: {
                valSelectorsCodragging: false,
                selectorBeyondExtremumPoint: true,
                selectorCrossedOverToInfinityPoint: true
            },
            context: {
                translateValSelectorPositionToValue: [{ infinityVal: _ }, [me]]
            }
        },

        {
            // but when codragging, the selectors start the operation, and must
            //  end it, within the continuous range of values!
            qualifier: {
                valSelectorsCodragging: true,
                selectorBeyondExtremumPoint: true,
                selectorCrossedOverToInfinityPoint: true
            },
            context: {
                translateValSelectorPositionToValue: [{ extremumVal: _ }, [me]]
            }
        },

        // while tmd==true, define a positioning-label which is at a constant
        //  offset from the pointer (the offset recorded at tmd->true)
        {
            qualifier: { tmd: true },
            position: {
                positionRawValPosPoint: {
                    point1: {
                        element: [pointer],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: [{ rawValPosPoint: _ }, [me]],
                    equals: [{ pointerToValPosPointOffset: _ }, [me]],
                    priority: positioningPrioritiesConstants.mouseAttachment
                }
            }
        },

        // while in an elastic selection, attach selector's raw pos-point to
        //  the pointer
        {
            qualifier: { valSelectorsElasticSelection: true },
            position: {
                elasticSelectionDrag: {
                    point1: [{ rawValPosPoint: _ }, [me]],
                    point2: {
                        element: [pointer],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.mouseAttachment
                }
            }
        },
        {
            qualifier: {
                sliderEnabled: true,
                becameInFocus: false
            },
            "class": "SliderIntOverlayXWidgetDelay",
            write: {
                onValSelectorInfocus: {
                    upon: o(
                        // we set becameInFocus to true either when the ValSelector itself is inFocus, or if we delay over the SliderContinuousRange for a bit
                        [{ inFocus: _ }, [me]],
                        [{ myContinuousRange: { delayedInFocus: _ } }, [me]]
                    ),
                    true: {
                        turnBecameInFocusOn: {
                            to: [{ becameInFocus: _ }, [me]],
                            merge: true
                        }
                    }
                },
            }
        },
        {
            qualifier: {
                becameInFocus: true,
                selectorIsBeingMoved: false
            },
            write: {
                onValSelectorOutoffocus: {
                    upon: [not, [{ myOverlayXWidget: { inArea: _ } }, [me]]],
                    true: {
                        turnBecameInFocusOff: {
                            to: [{ becameInFocus: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { becameInFocus: true },
            write: {
                onValSelectorMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        turnEditInputDisplayTextOn: {
                            to: [{ editInputDisplayText: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { createValSelectorDisplay: true },
            children: {
                valSelectorDisplayContainer: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ValSelectorDisplayContainer",
                        context: {
                            myValSelector: [expressionOf]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorHandleContainer: o(
        { // default
            "class": o("GeneralArea", "TrackMySliderWidget"),
            children: {
                handle: {
                    description: {
                        "class": "ValSelectorHandle"
                    }
                },
                knob: {
                    description: {
                        "class": "ValSelectorKnob"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MinWrapVertical",
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "MinWrapHorizontal",
            position: {
                top: 0,
                bottom: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorHandle: {
        "class": o("ValSelectorHandleDesign", superclass),
        context: {
            handleHeight: bSliderPosConst.handleHeight
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorKnob: o(
        { // default
            "class": o("ValSelectorKnobDesign", "GeneralArea", "TrackMyValSelector", "TrackMySliderWidget"),
            context: {
                myHandle: [
                    [areaOfClass, "ValSelectorHandle"],
                    [embedded, [embedding]]
                ]
            },
            position: {
                alignCenterGirthWithHandle: {
                    point1: {
                        element: [{ myHandle: _ }, [me]],
                        type: [{ centerGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ centerGirth: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                width: bSliderPosConst.valSelectorKnobGirth, // to be replaced by a display query
                height: bSliderPosConst.valSelectorKnobLength // to be replaced by a display query
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                height: bSliderPosConst.valSelectorKnobGirth, // to be replaced by a display query
                width: bSliderPosConst.valSelectorKnobLength // to be replaced by a display query
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofHighValSelector: true
            },
            position: {
                attachHandleOnLengthAxis: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myHandle: _ }, [me]], type: "top" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofHighValSelector: false
            },
            position: {
                attachHandleOnLengthAxis: {
                    point1: { element: [{ myHandle: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofHighValSelector: true
            },
            position: {
                attachHandleOnLengthAxis: {
                    point1: { element: [{ myHandle: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofHighValSelector: false
            },
            position: {
                attachHandleOnLengthAxis: {
                    point1: { type: "right" },
                    point2: { element: [{ myHandle: _ }, [me]], type: "left" },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the highVal selector in a slider. it is embedded in SliderIntOverlayXWidget. it inherits ValSelector.
    // Note the nonInfinityBoundedDragPoint orGroup defined for the direct dragging of this valSelector: it is the closer of the two posPoints: the other valSelector and the far end
    // of the continuous range.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelector: o(
        { // default  
            "class": "ValSelector",
            context: {
                // ValSelector params (valPosPoint also overrides a PositionOnCanvas param)
                valPosPoint: {
                    element: [me],
                    type: [{ lowValLength: _ }, [me]] // defined in SliderElement in highValAtLowHTMLLength variants
                },
                stableVal: [mergeWrite,
                    [{ myOverlayXWidget: { stableSelectionsObj: { highVal: _ } } }, [me]],
                    Number.POSITIVE_INFINITY
                ],
                transientVal: [{ myOverlayXWidget: { content: { highVal: _ } } }, [me]],
                extremumVal: [{ myCanvas: { maxValue: _ } }, [me]],
                infinityVal: Number.POSITIVE_INFINITY,
                myInfinityRange: [{ myOverlayXWidget: { children: { plusInfinityRange: _ } } }, [me]],

                selectorValIsInfinity: [{ myOverlayXWidget: { highValEqualsPlusInfinity: _ } }, [me]],
                selectorStableValIsInfinity: [{ myOverlayXWidget: { highStableValEqualsPlusInfinity: _ } }, [me]],

                mySiblingValSelector: [{ myOverlayXWidget: { children: { lowValSelector: _ } } }, [me]],

                myExtremumValPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                },
                mySiblingExtremumValPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            "class": "HighValSelectorAtLowHTMLLength"
        },

        {
            qualifier: { highValAtLowHTMLLength: false },
            "class": "HighValSelectorAtHighHTMLLength"
        },
        {
            qualifier: {
                tmd: true,
                highValAtLowHTMLLength: true
            },
            "class": "HighValSelectorAtLowHTMLLengthTmd"
        },
        {
            qualifier: {
                tmd: true,
                highValAtLowHTMLLength: false
            },
            "class": "HighValSelectorAtHighHTMLLengthTmd"
        },
        {
            qualifier: {
                valSelectorsElasticSelection: true,
                highValAtLowHTMLLength: true
            },
            "class": "HighValSelectorAtLowHTMLLengthElasticSelection"
        },
        {
            qualifier: {
                valSelectorsElasticSelection: true,
                highValAtLowHTMLLength: false
            },
            "class": "HighValSelectorAtHighHTMLLengthElasticSelection"
        },
        { // this variant handles the case where there was a preexisting selection, and then the scale was modified so that its extremumVal is 
            // smaller than the selection. we want to position the selector no further than the position dictated by the extremum value.
            qualifier: {
                selectorIsBeingMoved: false,
                selectorStableValIsInfinity: false
            },
            context: {
                value: [min,
                    [{ stableVal: _ }, [me]],
                    [{ extremumVal: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the highVal selector in a slider. it is embedded in SliderIntOverlayXWidget. it inherits ValSelector.
    // Note the nonInfinityBoundedDragPoint orGroup defined for the direct dragging of this valSelector: it is the closer of the two posPoints: the other valSelector and the far end
    // of the continuous range.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LowValSelector: o(
        { // default
            "class": "ValSelector",
            context: {
                // ValSelector params (valPosPoint also overrides a PositionOnCanvas param)
                valPosPoint: {
                    element: [me],
                    //type: [{ centerLength:_ }, [me]]
                    type: [{ highValLength: _ }, [me]] // defined in SliderElement in highValAtLowHTMLLength variants
                },
                stableVal: [mergeWrite,
                    [{ myOverlayXWidget: { stableSelectionsObj: { lowVal: _ } } }, [me]],
                    Number.NEGATIVE_INFINITY
                ],
                transientVal: [{ myOverlayXWidget: { content: { lowVal: _ } } }, [me]],
                extremumVal: [{ myCanvas: { minValue: _ } }, [me]],
                infinityVal: Number.NEGATIVE_INFINITY,
                myInfinityRange: [{ myOverlayXWidget: { children: { minusInfinityRange: _ } } }, [me]],

                selectorValIsInfinity: [{ myOverlayXWidget: { lowValEqualsMinusInfinity: _ } }, [me]],
                selectorStableValIsInfinity: [{ myOverlayXWidget: { lowStableValEqualsMinusInfinity: _ } }, [me]],

                mySiblingValSelector: [{ myOverlayXWidget: { children: { highValSelector: _ } } }, [me]],

                myExtremumValPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                },
                mySiblingExtremumValPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            "class": "HighValSelectorAtHighHTMLLength"
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            "class": "HighValSelectorAtLowHTMLLength"
        },
        {
            qualifier: {
                tmd: true,
                highValAtLowHTMLLength: true
            },
            "class": "HighValSelectorAtHighHTMLLengthTmd"
        },
        {
            qualifier: {
                tmd: true,
                highValAtLowHTMLLength: false
            },
            "class": "HighValSelectorAtLowHTMLLengthTmd"
        },
        {
            qualifier: {
                valSelectorsElasticSelection: true,
                highValAtLowHTMLLength: true
            },
            "class": "HighValSelectorAtHighHTMLLengthElasticSelection"
        },
        {
            qualifier: {
                valSelectorsElasticSelection: true,
                highValAtLowHTMLLength: false
            },
            "class": "HighValSelectorAtLowHTMLLengthElasticSelection"
        },
        {
            qualifier: {
                valSelectorsCodragging: true,
                highValAtLowHTMLLength: true
            },
            "class": "HighValSelectorAtHighHTMLLengthCodraggingSelection"
        },
        {
            qualifier: {
                valSelectorsCodragging: true,
                highValAtLowHTMLLength: false
            },
            "class": "HighValSelectorAtLowHTMLLengthCodraggingSelection"
        },
        { // this variant handles the case where there was a preexisting selection, and then the scale was modified so that its extremumVal is 
            // bigger than the selection. we want to position the selector no further than the position dictated by the extremum value.
            qualifier: {
                selectorIsBeingMoved: false,
                selectorStableValIsInfinity: false
            },
            context: {
                value: [max,
                    [{ stableVal: _ }, [me]],
                    [{ extremumVal: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyValSelector: o(
        {
            qualifier: "!",
            context: {
                ofHighValSelector: [
                    [{ myValSelector: _ }, [me]],
                    [areaOfClass, "HighValSelector"]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "OrientedElement"),
            context: {
                myValSelector: [
                    [embeddingStar, [me]],
                    [areaOfClass, "ValSelector"]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of building blocks of ValSelector classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelectorAtLowHTMLLength: {
        context: {
            beyondExtremumPointLowHTMLElement: [{ rawValPosPoint: _ }, [me]],
            beyondExtremumPointHighHTMLElement: [{ myExtremumValPoint: _ }, [me]],
            beyondInfCrossOverPointLowHTMLElement: [{ rawValPosPoint: _ }, [me]],
            beyondInfCrossOverPointHighHTMLElement: {
                element: [{ myInfinityRange: _ }, [me]],
                label: "crossOverToInfinityPoint"
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelectorAtHighHTMLLength: {
        context: {
            beyondExtremumPointLowHTMLElement: [{ myExtremumValPoint: _ }, [me]],
            beyondExtremumPointHighHTMLElement: [{ rawValPosPoint: _ }, [me]],

            beyondInfCrossOverPointLowHTMLElement: {
                element: [{ myInfinityRange: _ }, [me]],
                label: "crossOverToInfinityPoint"
            },
            beyondInfCrossOverPointHighHTMLElement: [{ rawValPosPoint: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelectorAtLowHTMLLengthTmd: {
        position: {
            beforeSiblingSelector: {
                point1: [{ rawValPosPoint: _ }, [me]],
                point2: [{ mySiblingValSelector: { valPosPoint: _ } }, [me]],
                min: 0
            },
            beforeSiblingExtremum: {
                point1: [{ rawValPosPoint: _ }, [me]],
                point2: [{ mySiblingExtremumValPoint: _ }, [me]],
                min: 0
            }
        }
    },

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    HighValSelectorAtHighHTMLLengthTmd: {
        position: {
            afterSiblingSelector: {
                point1: [{ mySiblingValSelector: { valPosPoint: _ } }, [me]],
                point2: [{ rawValPosPoint: _ }, [me]],
                min: 0
            },
            beforeSiblingExtremum: {
                point1: [{ mySiblingExtremumValPoint: _ }, [me]],
                point2: [{ rawValPosPoint: _ }, [me]],
                min: 0
            }
        }
    },


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    HighValSelectorAtLowHTMLLengthElasticSelection: {
        position: {
            afterInfinity: {
                point1: {
                    element: [{ myInfinityRange: _ }, [me]],
                    label: "infinityPoint"
                },
                point2: [{ rawValPosPoint: _ }, [me]],
                min: 0
            },
            beforeAnchor: {
                point1: [{ rawValPosPoint: _ }, [me]],
                point2: {
                    element: [{ myOverlayXWidget: _ }, [me]],
                    label: "elasticSelectionBeginningAnchor"
                },
                min: 0
            }
        }
    },

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    HighValSelectorAtHighHTMLLengthElasticSelection: {
        position: {
            beforeInfinity: {
                point1: [{ rawValPosPoint: _ }, [me]],
                point2: {
                    element: [{ myInfinityRange: _ }, [me]],
                    label: "infinityPoint"
                },
                min: 0
            },
            afterAnchor: {
                point1: {
                    element: [{ myOverlayXWidget: _ }, [me]],
                    label: "elasticSelectionBeginningAnchor"
                },
                point2: [{ rawValPosPoint: _ }, [me]],
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelectorAtLowHTMLLengthCodraggingSelection: {
        position: {
            boundedByExtremumPoint: { // when codragging, the selector cannot exceed the extremum point!
                point1: [{ myExtremumValPoint: _ }, [me]],
                point2: [{ rawValPosPoint: _ }, [me]],
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HighValSelectorAtHighHTMLLengthCodraggingSelection: {
        position: {
            boundedByExtremumPoint: { // when codragging, the selector cannot exceed the extremum point!
                point1: [{ rawValPosPoint: _ }, [me]],
                point2: [{ myExtremumValPoint: _ }, [me]],
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of building blocks of ValSelector classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the handle embedded in the ValSelector
    // API:
    // 1. handleHeight: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorHandle: o(
        { // default
            "class": o("TrackMyValSelector", "TrackMySliderWidget", "TrackMyFacet"),
            context: {
                handleHeight: bSliderPosConst.handleHeight
            },
            position: {
                attachToValSelectorValPoint: {
                    point1: [{ myValSelector: { valPosPoint: _ } }, [me]],
                    point2: [{ anchorToSelectorValPoint: _ }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                left: 0,
                right: 0,
                height: [{ handleHeight: _ }, [me]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofHighValSelector: true
            },
            context: {
                anchorToSelectorValPoint: { type: [{ lowValLength: _ }, [me]] }
            }
        },
        {
            qualifier: {
                ofVerticalElement: true,
                ofHighValSelector: false
            },
            context: {
                anchorToSelectorValPoint: { type: [{ highValLength: _ }, [me]] }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                top: 0,
                bottom: 0,
                width: [{ handleHeight: _ }, [me]]
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofHighValSelector: true
            },
            context: {
                anchorToSelectorValPoint: { type: [{ highValLength: _ }, [me]] }
            }
        },
        {
            qualifier: {
                ofVerticalElement: false,
                ofHighValSelector: false
            },
            context: {
                anchorToSelectorValPoint: { type: [{ lowValLength: _ }, [me]] }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the visual connection between the two valSelectors, the highVal and the lowVal.
    // Ctrl+MouseDown on this area, when both selectors are in the continuous range, results in their co-dragging - both moving in tandem, within the continuous range of the slider.
    // 
    // If both selectors are on the continuous range, this class inherits DraggableWeakMouseAttachment to allow it to be dragged (thus to co-drag both slider selectors).
    // The constant offset co-dragging is achieved with a stability constraint. This constraint must be put in place before co-dragging begins. Its priority is higher than the mouse
    // attachment so that the mouse cannot change the valSelectors relative offset when co-dragging. It is lower than the default value, so that the co-dragging is indeed bounded
    // by the constraint defined for the two ValSelectors, which have the default priority.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorsConnector: o(
        { // variant-controller
            qualifier: "!",
            context: {
                codraggingPermitted: [and, // codragging permitted only if we start from *both* selectors on the continuous range!
                    [{ myOverlayXWidget: { stableSelectionsObj: _ } }, [me]], // before any selection made, no stableSelectionsObj, i.e. selectors at infinity. therefore codragging not permitted
                    [notEqual,
                        Number.NEGATIVE_INFINITY,
                        [{ myOverlayXWidget: { stableSelectionsObj: { lowVal: _ } } }, [me]]
                    ],
                    [notEqual,
                        Number.POSITIVE_INFINITY,
                        [{ myOverlayXWidget: { stableSelectionsObj: { highVal: _ } } }, [me]]
                    ]
                ],
                valSelectorsBeingCodragged: [and,
                    [{ codraggingPermitted: _ }, [me]],
                    [{ tmd: _ }, [me]],
                    [not, [{ myOverlayXWidget: { valSelectorBeingModified: _ } }, [me]]],
                    [not, [{ myOverlayXWidget: { valSelectorsElasticSelection: _ } }, [me]]]
                ]
            }
        },
        { // default
            "class": o("ValSelectorsConnectorDesign",
                "GeneralArea",
                "MatchGirthOfContinuousRange",
                "TrackMyOverlayXWidget",
                "TrackMySliderWidget"),
            context: {
                myHighValSelector: [{ myOverlayXWidget: { myHighValSelector: _ } }, [me]],
                myLowValSelector: [{ myOverlayXWidget: { myLowValSelector: _ } }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            context: {
                horizontallyDraggable: false
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            context: {
                verticallyDraggable: false
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            context: {
                lowHTMLExtPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                },
                highHTMLExtPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            context: {
                lowHTMLExtPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                },
                highHTMLExtPoint: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                }
            }
        },
        {
            qualifier: {
                sliderEnabled: true,
                codraggingPermitted: true
            },
            "class": "Tmdable",
            context: {
                // There are two cases that require attention:
                // 1. a mouseDown without CTRL: should be allowed to continue to the underlying SliderContinuousRange to initiate an elastic selection.
                // 2. a mouseDown with CTRL: should initiate a co-dragging of the two selectors, and NOT initiate an elastic selection              
                // By specifying tmdableWithCtrl: true, Tmdable listens only to this event, and so allows a mouseDown without CTRL to pass through unperturbed. 
                // Since Tmdable's default is not to continue the propagation of mouseEvents (tmdableContinuePropagation: false), in this case the 
                // mouseDown won't propagate further.
                // Tmdable params
                tmdableWithCtrl: true, // respond only to ctrl+mouseDown.                
                "*pointerOffsetFromCenter": 0,
                "*highToLowHTMLLength": 0,

                myContinuousRange: [
                    { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                    [areaOfClass, "SliderContinuousRange"]
                ]
            },
            write: {
                codraggingInitiation: {
                    upon: mouseDownEvent, // [{tmd:_}, [me]],
                    true: {
                        continuePropagation: true,
                        recordOffsetFromCenter: {
                            to: [{ pointerOffsetFromCenter: _ }, [me]],
                            merge: [offset,
                                { type: [{ lowValLength: _ }, [me]] },
                                { element: [pointer], type: [{ lowHTMLLength: _ }, [me]] }
                            ]
                        },
                        recordHighToLowHTMLLength: {
                            to: [{ highToLowHTMLLength: _ }, [me]],
                            merge: [offset,
                                { type: [{ highHTMLLength: _ }, [me]] },
                                { type: [{ lowHTMLLength: _ }, [me]] }
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { valSelectorsBeingCodragged: true },
            position: {
                attachToHighValSelector: {
                    point1: [{ myHighValSelector: { rawValPosPoint: _ } }, [me]],
                    point2: { type: [{ highValLength: _ }, [me]] },
                    equals: 0
                },
                attachToLowValSelector: {
                    point1: { type: [{ lowValLength: _ }, [me]] },
                    point2: [{ myLowValSelector: { rawValPosPoint: _ } }, [me]],
                    equals: 0
                },
                fixLowPtrOff: {
                    point1: { type: [{ lowValLength: _ }, [me]] },
                    point2: { element: [pointer], type: [{ lowHTMLLength: _ }, [me]] },
                    equals: [{ pointerOffsetFromCenter: _ }, [me]],
                    priority: positioningPrioritiesConstants.mouseAttachment
                },
                fixLowHighOff: {
                    point1: { type: [{ highHTMLLength: _ }, [me]] },
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    equals: [{ highToLowHTMLLength: _ }, [me]],
                    priority: positioningPrioritiesConstants.strongerThanDefault
                },
                highLengthExtremumBound: {
                    point1: { type: [{ highHTMLLength: _ }, [me]] },
                    point2: [{ highHTMLExtPoint: _ }, [me]],
                    min: 0
                },
                lowLengthExtremumBound: {
                    point1: [{ lowHTMLExtPoint: _ }, [me]],
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    min: 0
                }
            }
        },
        {
            qualifier: { valSelectorsBeingCodragged: false },
            position: {
                attachToHighValSelector: {
                    point1: [{ myHighValSelector: { valPosPoint: _ } }, [me]],
                    point2: { type: [{ highValLength: _ }, [me]] },
                    equals: 0
                },
                attachToLowValSelector: {
                    point1: { type: [{ lowValLength: _ }, [me]] },
                    point2: [{ myLowValSelector: { valPosPoint: _ } }, [me]],
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of ValSelector classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Slider 1DValueMarker Bin classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines a bin for 1D valueMarkers on the slider's continuous range (and embedded in the latter), and displays a valueMarker.
    // It is inherited by Slider1DValueMarkerBinPermExtOverlay, Slider1DValueMarkerBinIntOverlay, and Slider1DValueMarkerBinBaseOverlay.
    //
    // API: 
    // 1. valuesForBinning: the values to be binned...
    // 2. Inheriting classes may use binValues (to decide whether to embed a valueMarker, for example).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                binValues: [
                    [{ binRange: _ }, [me]],
                    [{ valuesForBinning: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o(
                "SliderMarkerBin", "MatchEmbeddingOnGirthAxis",
                "TrackMyOverlay", "TrackMyOverlayXWidget"
            ),
            context: {
                myOverlay: [{ myOverlayXWidget: { myOverlay: _ } }, [me]] // TrackMyOverlay param
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a bin for a 1D valueMarker of an extensional overlay.
    // It inherits Slider1DValueMarkerBin and is inherited by the description of the oneDValueMarkerBins areaSet in SliderPermExtOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerBinPermExtOverlay: o(
        { // default
            "class": "Slider1DValueMarkerBin",
            context: {
                // Slider1DValueMarkerBin Param:
                valuesForBinning: [{ myOverlayXWidget: { overlaySolutionSetProjection: _ } }, [me]]
            }
        },
        {
            qualifier: { binValues: true },
            children: {
                valueMarker: {
                    description: {
                        "class": "Slider1DValueMarkerOfPermExtOverlay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a bin for 1D valueMarkers of the base overlay.
    // It inherits Slider1DValueMarkerBin and is inherited by the description of the oneDValueMarkerBins areaSet in either LeanSliderBaseOverlayXWidget (Lean), or 
    // It provides the embedded valueMarker with a description: either Slider1DBaseSetValueMarker or Slider1DValueMarkerOfEphOverlay (Lean or Fat).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerBinBaseOverlay: o(
        { // default
            "class": "Slider1DValueMarkerBin",
            context: {
                // Slider1DValueMarkerBin Param:
                valuesForBinning: [{ myOverlayXWidget: { myFacetClipper: { effectiveBaseOverlayProjectedValues: _ } } }, [me]]
            }
        },
        {
            qualifier: { binValues: true },
            children: {
                valueMarker: {
                    description: {
                        "class": "Slider1DBaseSetValueMarker"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a bin for a 1D valueMarker of an intensional overlay.
    // It inherits Slider1DValueMarkerBin and is inherited by the description of the oneDValueMarkerBins areaSet in SliderIntOverlayXWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerBinIntOverlay: o(
        { // default
            "class": "Slider1DValueMarkerBin",
            context: {
                // Slider1DValueMarkerBin param
                // (when the intensional overlay is in intersection mode, the implicitSet is guaranteed to be a superset of the solutionSet, so the former suffices.
                valuesForBinning: [{ myOverlayXWidget: { overlayImplicit1DSetProjection: _ } }, [me]]
            }
        },
        {
            qualifier: { binValues: true },
            children: {
                valueMarker: {
                    description: {
                        "class": "Slider1DValueMarkerOfIntOverlay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Slider 1DValueMarker Bin classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Slider 1DValueMarker classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An auxiliary class, 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CenterAroundContinuousRange: {
        position: {
            centerAroundContinuousRange: {
                point1: {
                    element: [{ myOverlayXWidget: { children: { continuousRange: _ } } }, [me]],
                    type: [{ centerGirth: _ }, [me]]
                },
                point2: {
                    type: [{ centerGirth: _ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a valueMarker on a slider. It is inherited by the Slider1DValueMarkerOfExtOverlay and Slider1DValueMarkerOfIntOverlay classes.
    // It is embedded either in a Slider1DValueMarkerBin (markerByValue: false) or directly as an areaSet in the SliderContinuousRange (markerByValue: true)
    // This class' value is calculated based on values passed on to it in its areaSetContent. 
    // The value is used to position it, with the aid of the inherited SliderCanvas.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarker: o(
        { // default
            "class": o(
                "PositionByCanvasOffset",
                "TrackMyOverlayXWidget",
                "TrackMySliderWidget", // appears before TrackMyFacet to override its definition of myFacet
                "TrackMyFacet"
            ),
            context: {
                value: [{ param: { areaSetContent: { value: _ } } }, [me]],
                values: [{ param: { areaSetContent: { range: _ } } }, [me]],
                valPosPoint: { type: [{ centerLength: _ }, [me]] },

                minValue: [min, [{ value: _ }, [me]]],
                maxValue: [max, [{ value: _ }, [me]]],
                minValueOffset: [
                    [{ myCanvas: { valueToOffset: _ } }, [me]],
                    [{ minValue: _ }, [me]]
                ],
                maxValueOffset: [
                    [{ myCanvas: { valueToOffset: _ } }, [me]],
                    [{ maxValue: _ }, [me]]
                ],

                // mid-point between minValueOffset and maxValueOffset
                canvasOffset: [
                    div,
                    [
                        plus,
                        [{ minValueOffset: _ }, [me]],
                        [{ maxValueOffset: _ }, [me]]
                    ],
                    2
                ]
            },
            stacking: {
                belowStats: {
                    higher: { label: "aboveValueMarkers", element: [embedding] }, //embedding is the SliderContinuousRange
                    lower: [me]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Slider1DValueMarkerOfIntOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfIntOverlay: {
        "class": o("Slider1DValueMarkerOfPermIntOverlay", "Slider1DValueMarker"),
        context: {
            mySelectableFacetXIntOverlay: [{ myOverlayXWidget: { mySelectableFacetXIntOverlay: _ } }, [me]],
            myValuesInTransientSelectionsRange: o(
                // if 'disabled', then the all valueMarkers should be marked in as ofSolutionSet
                [{ mySelectableFacetXIntOverlay: { disabled: _ } }, [me]],
                [ // i.e. the case of we're not 'disabled': check if 'values' fall within the transientSelectionsRange
                    [{ values: _ }, [me]], // defined by Slider1DValueMarker
                    [{ mySelectableFacetXIntOverlay: { transientSelectionsRange: _ } }, [me]]
                ]
            ),
            // ValueMarkerDesign params
            ofSolutionSet: [cond,
                [{ myApp: { debugFasterSolutionSetMembership: _ } }, [me]],
                o(
                    {
                        on: false,
                        use: [
                            [{ values: _ }, [me]], // defined by Slider1DValueMarker
                            [{ myOverlayXWidget: { overlaySolutionSetProjection: _ } }, [me]]
                        ]
                    },
                    {
                        on: true,
                        use: [cond,
                            [{ mySelectableFacetXIntOverlay: _ }, [me]],
                            o(
                                {
                                    on: false,
                                    use: [{ ofImplicit1DSetItem: _ }, [me]]
                                },
                                {
                                    on: true,
                                    use: [cond,
                                        [{ mySelectableFacetXIntOverlay: { inclusionExclusionSelectionsMade: _ } }, [me]],
                                        o(
                                            {
                                                on: false,
                                                use: [{ myValuesInTransientSelectionsRange: _ }, [me]]
                                            },
                                            {
                                                on: true,
                                                use: [cond,
                                                    [{ mySelectableFacetXIntOverlay: { effectiveExclusionMode: _ } }, [me]],
                                                    o(
                                                        {
                                                            on: true,
                                                            use: [{ myValuesInTransientSelectionsRange: _ }, [me]]
                                                        },
                                                        {
                                                            on: false,
                                                            use: [cond,
                                                                [{ mySelectableFacetXIntOverlay: { valuableNumericalSelectionsMade: _ } }, [me]],
                                                                o(
                                                                    {
                                                                        on: true,
                                                                        use: [{ myValuesInTransientSelectionsRange: _ }, [me]]
                                                                    },
                                                                    {
                                                                        on: false,
                                                                        use: false
                                                                    }
                                                                )
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        )
                                    ]
                                }
                            )
                        ]
                    }
                )
            ],
            ofImplicit1DSetItem: [
                [{ values: _ }, [me]], // defined by Slider1DValueMarker
                [{ myOverlayXWidget: { overlayImplicit1DSetProjection: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // StatsContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StatsContainer: {
        "class": o(
            "TrackMyOverlayXWidget",
            "MinWrapVertical",
            "BelowZTopOfArea",
            //we inherit this because Slider1DValueMarker get an independt z-value and 
            //we need to make sure it is placed under the zTop of the amoeba
            "TrackMyFacet"
        ),
        context: {
            stats: [
                descriptiveStatistics,
                [r(-Number.MAX_VALUE, Number.MAX_VALUE),
                [{ myOverlayXWidget: { overlaySolutionSetProjection: _ } }, [me]]]
            ],
            avg: [{ stats: { average: _ } }, [me]],
            stddev: [{ stats: { stddev: _ } }, [me]],
            minimum: [{ stats: { minimum: _ } }, [me]],
            maximum: [{ stats: { maximum: _ } }, [me]],
            median: [{ stats: { median: _ } }, [me]],
            quartiles: [{ stats: { quartiles: _ } }, [me]],
            twoPerc: [{ stats: { twoperc: _ } }, [me]], // includes the top 2% and bottom 98%
            tenPerc: [{ stats: { tenperc: _ } }, [me]], // includes the top decile and the bottom decile.

            bottomQuartile: [pos, 1, [{ quartiles: _ }, [me]]], // quartiles is an os of 5 values: 0/25/50/75/100. so the bottomQuartile is [pos, 1]
            topQuartile: [pos, 3, [{ quartiles: _ }, [me]]],

            bottomDecile: [min, [{ tenPerc: _ }, [me]]],
            topDecile: [max, [{ tenPerc: _ }, [me]]],

            //BelowZTopOfArea param
            zTopAreaAboveMe: [{ myAmoeba: _ }, [me]],
        },
        position: {
            left: 0,
            right: 0
            // vertical constraint specified by MinWrapVertical
        },
        stacking: {
            aboveValueMarkers: {
                higher: [me],
                lower: { label: "aboveValueMarkers", element: [embedding] } //embedding is the SliderContinuousRange 
            }
        },
        children: {
            statsMarkers: {
                data: o(
                    { statId: "avg", value: [{ avg: _ }, [me]] },
                    //{value: [{ stddev:_ }, [me]]},
                    { statId: "min", value: [{ minimum: _ }, [me]] },
                    { statId: "max", value: [{ maximum: _ }, [me]] },
                    { statId: "median", value: [{ median: _ }, [me]] },
                    { statId: "bottomQuartile", value: [{ bottomQuartile: _ }, [me]] },
                    { statId: "topQuartile", value: [{ topQuartile: _ }, [me]] }
                ),
                description: {
                    "class": "SingleMarkerStats"
                }
            },
            box: {
                description: {
                    "class": "BoxStats"
                }
            },
            averageMarker: {
                description: {
                    "class": "AverageMarkerStats"
                }
            },
            topWisker: {
                description: {
                    "class": "WiskerStats",
                    context: {
                        topMarkerStats: [{ children: { statsMarkers: { statId: "max" } } }, [embedding]],
                        bottomMarkerStats: [{ children: { statsMarkers: { statId: "topQuartile" } } }, [embedding]]
                    }
                }
            },
            bottomWisker: {
                description: {
                    "class": "WiskerStats",
                    context: {
                        topMarkerStats: [{ children: { statsMarkers: { statId: "bottomQuartile" } } }, [embedding]],
                        bottomMarkerStats: [{ children: { statsMarkers: { statId: "min" } } }, [embedding]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SingleMarkerStats: {
        "class": o("PositionByCanvasOffset", "TrackMySliderWidget", "TrackMyFacet"),
        context: {
            value: [{ value: _ }, [{ param: { areaSetContent: _ } }, [me]]],
            statId: [{ statId: _ }, [{ param: { areaSetContent: _ } }, [me]]],
            // PositionByCanvasOffset params:
            valPosPoint: { type: [{ centerLength: _ }, [me]] },
            /*canvasOffset: [
                [{ myCanvas: { valueToOffset: _ } }, [me]],
                [{ value: _ }, [me]],
            ],*/
            canvasOffset: [
                [{ myCanvas: { valueToOffset: _ } }, [me]],
                [max,
                    [min,
                        [{ value: _ }, [me]],
                        [{ myCanvas: { maxValue: _ } }, [me]]
                    ],
                    [{ myCanvas: { minValue: _ } }, [me]]
                ]
            ]
        },
        position: {
            "horizontal-center": 0,
            width: 5,
            height: 5
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    BoxStats: {
        "class": o("BoxStatsDesign", "GeneralArea", "Tooltipable", "TrackMyFacet"),
        context: {
            myStatMarkers: [{ children: { statsMarkers: _ } }, [embedding]],
            topMarkerStats: [{ myStatMarkers: { statId: "topQuartile" } }, [me]],
            bottomMarkerStats: [{ myStatMarkers: { statId: "bottomQuartile" } }, [me]],
            medianMarker: [{ myStatMarkers: { statId: "median" } }, [me]],
            // Tooltipable params
            tooltipableHorizontalAnchor: { type: "right", content: true },
            tooltipableVerticalAnchor: { type: "vertical-center" },
            tooltipText: [concatStr,
                [map,
                    [defun,
                        "obj",
                        [using,
                            // using - beginning
                            "val",
                            [numberToStringPerNumericFormat,
                                [{ val: _ }, "obj"],
                                [{ myFacet: { numericFormat: _ } }, [me]],
                                true // useStandardPrecision
                            ],
                            // using - end
                            [cond,
                                "val",
                                o(
                                    { // add row to tooltip, only if there is a "val" (e.g. no median calculated for < 3 values)
                                        on: true,
                                        use: [concatStr,
                                            o(
                                                [{ label: _ }, "obj"],
                                                ":",
                                                " ",
                                                "val"
                                            )
                                        ]
                                    }
                                )
                            ]
                        ]
                    ],
                    o( // the data for the map
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.max,
                                "short"
                            ],
                            val: [{ maximum: _ }, [embedding]]
                        },
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.min,
                                "short"
                            ],
                            val: [{ minimum: _ }, [embedding]]
                        },
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.topQuartile,
                                "short"
                            ],
                            val: [{ topQuartile: _ }, [embedding]]
                        },
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.bottomQuartile,
                                "short"
                            ],
                            val: [{ bottomQuartile: _ }, [embedding]]
                        },
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.median,
                                "short"
                            ],
                            val: [{ median: _ }, [embedding]]
                        },
                        {
                            label: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                functionID.avg,
                                "short"
                            ],
                            val: [{ avg: _ }, [embedding]]
                        }
                    )
                ],
                "\n"
            ]
        },
        position: {
            left: bFSAppBoxStatsPosConst.boxMarginFromStatsContainer,
            right: bFSAppBoxStatsPosConst.boxMarginFromStatsContainer,
            topConstraint: {
                point1: { type: "top", content: true },
                point2: { type: "vertical-center", element: [{ topMarkerStats: _ }, [me]] },
                equals: 0
            },
            bottomConstraint: {
                point1: { type: "bottom", content: true },
                point2: { type: "vertical-center", element: [{ bottomMarkerStats: _ }, [me]] },
                equals: 0
            }
        },
        children: {
            medianBand: {
                description: {
                    "class": o("MedianBandStatsDesign"),
                    position: {
                        left: 0,
                        right: 0,
                        height: bFSAppBoxStatsPosConst.boxStatsMedianWidth,
                        topConstraint: {
                            point1: { type: "vertical-center" },
                            point2: { type: "vertical-center", element: [{ medianMarker: _ }, [embedding]] },
                            equals: 0
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API: topMarkerStats, bottomMarkerStats
    WiskerStats: {
        "class": o("WiskerStatsDesign"),
        position: {
            "horizontal-center": 0,
            width: 1,
            topConstraint: {
                point1: { type: "top" },
                point2: { type: "vertical-center", element: [{ topMarkerStats: _ }, [me]] },
                equals: 0
            },
            bottomConstraint: {
                point1: { type: "bottom" },
                point2: { type: "vertical-center", element: [{ bottomMarkerStats: _ }, [me]] },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        
    AverageMarkerStats: o(
        {
            //default
            "class": o("TrackMySliderWidget", "TrackMyFacet"),
            context: {
                value: [{ avg: _ }, [embedding]],
                valueInRange: [
                    Roo(
                        [{ myCanvas: { scaleMinValue: _ } }, [me]],
                        [{ myCanvas: { scaleMaxValue: _ } }, [me]]
                    ),
                    [{ value: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { valueInRange: true },
            "class": o("AverageMarkerStatsDesign", "DisplayDimension", "PositionByCanvasOffset"),
            context: {
                displayText: "x",
                valPosPoint: { type: [{ centerLength: _ }, [me]] },
                /*canvasOffset: [
                    [{ myCanvas: { valueToOffset: _ } }, [me]],
                    [{ value: _ }, [me]],
                ],*/
                canvasOffset: [
                    [{ myCanvas: { valueToOffset: _ } }, [me]],
                    [max,
                        [min,
                            [{ value: _ }, [me]],
                            [{ myCanvas: { maxValue: _ } }, [me]]
                        ],
                        [{ myCanvas: { minValue: _ } }, [me]]
                    ]
                ]
            },
            position: {
                "horizontal-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Slider1DValueMarkerOfExtOverlay: Inherited by Slider1DBaseSetValueMarker and Slider1DValueMarkerOfPermExtOverlay. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfExtOverlay: {
        "class": "Slider1DValueMarker"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. radius
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderCircular1DValueMarker: {
        "class": o("OneDValueMarkerOfPermOverlay", "TrackMySliderWidget"),
        context: {
            // OneDValueMarkerOfPermOverlay param, overlayColor, provided by inheriting class
            radius: [{ myWidget: { valueMarker1DRadius: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines a slider 1D valueMarker pertaining to a permanent overlay. It is inherited by an extensional and an intensional version.
    // This class inherits OneDValueMarkerOfPermOverlay (also inherited by Discrete1DValueMarkerOfPermOverlay), which allows to display the valueMarker as a circle with a colorful 
    // background. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfPermOverlay: {
        "class": o("Slider1DValueMarkerOfPermOverlayDesign",
            "SliderCircular1DValueMarker", "CenterAroundContinuousRange"),
        context: {
            // OneDValueMarkerOfPermOverlay params:
            overlayColor: [{ myOverlayXWidget: { color: _ } }, [me]]
            // ofSolutionSet: provided by inheriting classes
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfPermExtOverlay: {
        "class": o("Slider1DValueMarkerOfExtOverlay", "Slider1DValueMarkerOfPermOverlay"),
        context: {
            ofSolutionSet: true
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfPermIntOverlay: {
        "class": o("Slider1DValueMarkerOfPermIntOverlayDesign", "Slider1DValueMarkerOfPermOverlay")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A temporary auxiliary class (driven by the Lean/Fat separation) to provide a couple of positioning constraints to the baseSet valueMarkers. 
    // Once Lean/Fat are gone, it can be merged back into its inheriting class, Slider1DValueMarkerOfEphOverlay, and its variant removed from Slider1DValueMarker.
    //
    // API: 
    // 1. baseValueMarkerLength: default provided. Inheriting class should provide the positioning constraint on the length axis.
    // 2. color
    // 3. position on girth axis
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DBaseSetValueMarker: {
        "class": o("Slider1DValueMarkerOfExtOverlay"),
        context: {
            baseValueMarkerLength: bSliderPosConst.baseSetValueMarkerLength
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Slider 1DValueMarker classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of SliderOverlayXWidget Classes - the representation of an Overlay in a SliderWidget.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SliderNonNumericalValues Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // Note: tested only in a vertical slider. most likely doesn't work in a horizontal one!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SliderNonNumericalValuesView: o(
        { // default
            "class": o("NumericNonNumericalValuesView", "TrackMySliderWidget"),
            context: {
                anchorForLowHTMLLength: atomic([{ myWidget: { contentEndInfinityPoint: _ } }, [me]]),
                marginOnLowHTMLLength: [{ myWidget: { infinityPointMarginOnEndSide: _ } }, [me]],
                marginOnHighHTMLLength: [{ myWidget: { intraWidgetMarginOnLengthAxis: _ } }, [me]],
                // the defaultSpecifiedFivUniqueID is commented out - this definition causes an infinite loop in a sanityTest!
                // defaultSpecifiedFivUniqueID: [{ lastFiVUniqueID:_ }, [me]], // override default value of SnappableControllerCore (via DiscreteValuesView)
                heightOfSliderDiscreteValue: [densityChoice, [{ discretePosConst: { defaultHeightOfDiscreteValue: _ } }, [globalDefaults]]], // this should probably dependend on displayDensity

                //keep track of the number of currently expanded values
                numberOfcurrentlyExpandedValues: [
                    round,
                    [div,
                        [{ currentExpansionHeight: _ }, [me]],
                        [{ heightOfSliderDiscreteValue: _ }, [me]]
                    ],
                    0
                ],

                // API param of Expandable 
                initialExpandableHeight: [cond, // if only one value, that should be the height of this area, otherwise give it the height of two values.
                    [equal, 1, [size, [{ myFacet: { values: _ } }, [me]]]],
                    o(
                        { on: true, use: [{ heightOfSliderDiscreteValue: _ }, [me]] },
                        { on: false, use: [mul, 2, [{ heightOfSliderDiscreteValue: _ }, [me]]] }
                    )
                ],
                // API param of Expandable                                
                currentExpansionHeightForAppData: [
                    mul,
                    [{ numberOfcurrentlyExpandedValues: _ }, [me]],
                    [{ heightOfSliderDiscreteValue: _ }, [me]]
                ],

                //used in DiscreteWidget
                disableScrollbar: [or,
                    [equal,
                        [{ currentExpansionHeightForAppData: _ }, [me]],
                        0
                    ],
                    [{ expandableBeingModified: _ }, [me]]
                ]
            },
            children: {
                values: {
                    // data: defined in DiscreteValuesView
                    description: {
                        "class": "SliderDiscreteValue"
                    }
                },
                discreteValueNamesExpandableArea: {
                    description: {
                        context: {
                            initialExpandableWidth:
                            bSliderPosConst.discreteValueNamesExpandableAreaInitialWidth
                        }
                    }
                }
            }
        },
        {
            qualifier: { facetState: facetState.histogram },
            children: {
                bins: { // adding to the definition of DiscreteValuesView
                    description: {
                        "class": "SliderDiscreteHistogramBin"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                bottom: [{ myWidget: { intraWidgetMarginOnLengthAxis: _ } }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                right: [{ myWidget: { intraWidgetMarginOnLengthAxis: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SliderDiscreteValue: o(
        { // default
            "class": o("SliderDiscreteValueDesign", "DiscreteValue", "MinWrapVertical"),
            children: {
                valueName: {
                    description: {
                        "class": "SliderDiscreteValueName"
                    }
                },
                permOverlayXDiscreteValues: {
                    partner: [areaOfClass, "SliderIntOverlayXWidget"], // override DiscreteValue definition
                    description: {
                        "class": "PermOverlaySliderDiscreteValue"
                    }
                }
            }
        },
        {
            qualifier: { noValue: true },
            "class": "SliderNoValue"
        },
        {
            qualifier: { facetState: facetState.histogram },
            context: {
                myFirstHistgoramBin: [
                    {
                        firstBin: true,
                        myFacet: [{ myFacet: _ }, [me]]
                    },
                    [areaOfClass, "SliderHistogramBin"]
                ]
            },
            position: {
                height: [{ heightOfSliderDiscreteValue: _ }, [embedding]]
                /*equalHeightAsSlideHistogramBins: { triggers an infinite loop in runtime, apparently
                    point1: { type: "top", content: true },
                    point2: { type: "bottom", content: true },
                    equals: [offset,
                             { element: [{ myFirstHistgoramBin:_ }, [me]], type: "top", content: true },
                             { element: [{ myFirstHistgoramBin:_ }, [me]], type: "bottom", content: true }
                            ]
                }*/
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SliderNoValue: {
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SliderDiscreteValueName: {
        "class": "DiscreteValueName",
        context: {
            displayText: [{ value: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    PermOverlaySliderDiscreteValue: {
        "class": "PermOverlayMSValue" // note: we inherit the "MS" version, not the "Discrete" version, as we need the functionality provided by the former
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    SliderDiscreteHistogramBin: {
        "class": "SliderDiscreteHistogramBinDesign"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // End of SliderNonNumericalValues Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Slider Bin Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a bin on the slider's continuous range. it is inherited by Slider1DValueMarkerBin.
    // It uses its canvas' positionToValue function to translate the bin's edges to values on the canvas.  
    // These in turn are used to conduct a selection query on the different itemSets.
    // The range created herein is used as the selection query on the associated values. One thing we need to ensure is that we don't double-count, and so we use range intervals
    // that are closed on one side and open on the other, except for one edge bin (we arbitrarily picked the highValBin for this purpose). Note we can't define either firstBin
    // or lastBin to serve as the Rcc bin of choice, as the firstBin is associated with the high values when vertical, but with the low values when horizontal. That would mean
    // That a bin representing the same element (Slider1DValueMarkerBin, for example), appearing in both a vertical incarnation and a horizontal one, would have a slightly
    // different range definition in each one, resulting in an inconsistency. Instead, we figure out which bin is the highValBin, and let it serve as the Rcc bin.
    // 
    // API:
    // 1. myWidget: default definition provided by TrackMySliderWidget (SliderHistogramBin rides that, as it is not actually embedded in a widget, but is juxtaposed to one).
    // 2. This class assumes it is inherited by an area of an areaSet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderMarkerBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstBin: [{ firstInAreaOS: _ }, [me]],
                lastBin: [{ lastInAreaOS: _ }, [me]],

                highValBin: [cond,
                    [{ highValAtLowHTMLLength: _ }, [me]],
                    o(
                        { on: true, use: [{ firstBin: _ }, [me]] },
                        { on: false, use: [{ lastBin: _ }, [me]] }
                    )
                ]
            }
        },
        { // default
            "class": o("MemberOfTopToBottomAreaOS", "TrackMySliderWidget"),
            context: {
                // HistogramBin param:
                // construct a query of the form { "price": r(0,100) }
                binSelectionQuery: [
                    [{ myFacet: { facetSelectionQueryFunc: _ } }, [me]],
                    [{ binRange: _ }, [me]]
                ],
                /*
                lowValOfBin: [[{ myCanvas: { translatePositionToVal:_ } }, [me]], 
                              {
                                    element: [me],
                                    type: [{ lowValLength:_ }, [me]] 
                              }
                             ],
                highValOfBin: [[{ myCanvas: { translatePositionToVal:_ } }, [me]], 
                               {
                                    element: [me],
                                    type: [{ highValLength:_ }, [me]] 
                               }
                              ]
                 */
                lowValOfBin: [
                    [{ myCanvas: { positionToValue: _ } }, [me]],
                    { element: [me], type: [{ lowValLength: _ }, [me]] }
                ],
                highValOfBin: [
                    [{ myCanvas: { positionToValue: _ } }, [me]],
                    { element: [me], type: [{ highValLength: _ }, [me]] }
                ]
            },
            position: {
                binsOfEqualBase: { // "base" is on the axis along the canvas.
                    pair1: {
                        point1: {
                            type: [{ highValLength: _ }, [me]]
                        },
                        point2: {
                            type: [{ lowValLength: _ }, [me]]
                        }
                    },
                    pair2: {
                        point1: {
                            element: [embedding],
                            label: "virtualBinHighValEndOfBase"
                        },
                        point2: {
                            element: [embedding],
                            label: "virtualBinLowValEndOfBase"
                        }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: true },
            context: {
                anchorForFirstBin: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                },
                anchorForLastBin: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                }
            }
        },
        {
            qualifier: { highValAtLowHTMLLength: false },
            context: {
                anchorForFirstBin: {
                    element: [{ myWidget: _ }, [me]],
                    label: "minValPoint"
                },
                anchorForLastBin: {
                    element: [{ myWidget: _ }, [me]],
                    label: "maxValPoint"
                }
            }
        },
        {
            qualifier: { firstBin: true },
            position: {
                anchorOnLengthAxisForFirstBin: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: [{ anchorForFirstBin: _ }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { lastBin: true },
            position: {
                anchorOnLengthAxisForLastBin: {
                    point1: { type: [{ highHTMLLength: _ }, [me]] },
                    point2: [{ anchorForLastBin: _ }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { highValBin: false },
            context: {
                binRange: Rco(
                    [{ lowValOfBin: _ }, [me]],
                    [{ highValOfBin: _ }, [me]]
                )
            }
        },
        {
            qualifier: { highValBin: true },
            context: {
                binRange: Rcc(
                    [{ lowValOfBin: _ }, [me]],
                    [{ highValOfBin: _ }, [me]]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Slider Bin Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Slider Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramsViewContainer: {
        "class": o("HorizontalHistogramsViewContainer"),
        children: {
            histogramsView: {
                description: {
                    "class": "SliderHistogramsView"
                }
            },
            binCountControl: {
                description: {
                    "class": "SliderHistogramBinCountControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramsView: {
        "class": "HistogramsView",
        children: {
            histogramsDoc: {
                description: {
                    "class": "SliderHistogramsDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramsDoc: {
        "class": "HistogramsDoc",
        children: {
            histograms: {
                // data: see HistogramsDoc
                description: {
                    "class": "SliderHistogram"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a slider histogram. It is embedded in the slider amoeba in the appropriate facet state. it inherits Histogram.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogram: {
        "class": "Histogram",
        children: {
            histogramView: {
                description: {
                    "class": "SliderHistogramView"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class embeds an areaSet of SliderHistogramBins
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramView: {
        "class": o("NumericHistogramView", "AboveDiscreteValuesView"),
        context: {
            binRangeEdgeValues: [{ myCanvas: { canvasPartitionValue: _ } }, [me]] // NumericHistogramView param
        },
        children: {
            numericBins: {
                // data: defined by NumericHistogramView
                description: {
                    "class": "SliderHistogramBin"
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // This class represents a bin in a slider histogram. It is inherited by the bins areaSet in the SliderHisotgramView.
    // It inherits NumericHistogramBin.
    ///////////////////////////////////////////////////////////////////////
    SliderHistogramBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                nonNumericalValuesExist: [{ myHistogramView: { nonNumericalValuesExist: _ } }, [me]]
            }
        },
        {
            "class": o("SliderHistogramBinDesign", "NumericHistogramBin")
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    // A control for increasing/decreasing histogram bin count
    ////////////////////////////////////////////////////////////////////////
    SliderHistogramBinCountControl: {
        "class": o("GeneralArea", "NumericHistogramBinCountControl"),
        context: {
            mySliderCanvas: [
                { myWidget: [{ myPrimaryWidget: _ }, [me]] },
                [areaOfClass, "SliderCanvas"]
            ],
            binSizeValueList: [
                { mySliderCanvas: { uniqBinPixelSizeList: _ } },
                [me]
            ],
            binCount: [mergeWrite,
                [{ currentViewFacetDataObj: { binCount: _ } }, [me]],
                [floor, [div, [size, [{ binSizeValueList: _ }, [me]]], 2]] // default value for mergeWrite: a value from the middle of binSizeValueList
            ]
        },
        children: {
            moreBinButton: {
                description: {
                    "class": "SliderHistogramMoreBinButton"
                }
            },
            countDisplay: {
                description: {
                    "class": "SliderHistogramBinCount"
                }
            },
            lessBinButton: {
                description: {
                    "class": "SliderHistogramLessBinButton"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    SliderHistogramBinButtonAddendum: {
        context: {
            histogramBinButtonTooltipTextSuffix: [concatStr,
                o(
                    [{ myApp: { numberStr: _ } }, [me]],
                    " ",
                    [{ myApp: { ofStr: _ } }, [me]],
                    " ",
                    [{ myApp: { histogramEntityStr: _ } }, [me]],
                    " ",
                    [{ myApp: { binEntityStrPlural: _ } }, [me]]
                )
            ]
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    SliderHistogramMoreBinButton: {
        "class": o("SliderHistogramMoreBinButtonDesign", "NumericHistogramMoreBinButton", "SliderHistogramBinButtonAddendum"),
        context: {
            nextBinCount: [
                cond,
                [
                    lessThan,
                    [{ binCount: _ }, [me]],
                    [minus, [size, [{ binSizeValueList: _ }, [embedding]]], 1]
                ],
                {
                    on: true,
                    use: [plus, [{ binCount: _ }, [me]], 1]
                }
            ],
            lastBinCount: [minus, [size, [{ binSizeValueList: _ }, [embedding]]], 1]
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    SliderHistogramLessBinButton: {
        "class": o("SliderHistogramLessBinButtonDesign", "NumericHistogramLessBinButton", "SliderHistogramBinButtonAddendum"),
        context: {
            nextBinCount: [
                cond,
                [
                    greaterThan,
                    [{ binCount: _ }, [me]],
                    0
                ],
                {
                    on: true,
                    use: [
                        minus,
                        [
                            min,
                            [
                                minus,
                                [size, [{ binSizeValueList: _ }, [embedding]]],
                                1
                            ],
                            [{ binCount: _ }, [me]]
                        ],
                        1
                    ]
                }
            ],
            lastBinCount: 0
        }
    },

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    SliderHistogramBinCount: {
        "class": o("SliderHistogramBinCountDesign", "NumericHistogramBinCount"),
        context: {
            displayText: [size,
                [
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        ofFirstHistogram: true
                    },
                    [areaOfClass, "SliderHistogramBin"]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For now, this is applicable only to bars in a slider histogram. that may change..
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBarSelectionsContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                addIncludeInSelectionOption: [and,
                    [{ mySelectableFacetXIntOverlay: { valuableNumericalSelectionsMade: _ } }, [me]],
                    o(  // one of two conditions which specify the bin being beyond the range of the stable selection 
                        // need to be met in order to add the IncludeIn control: 
                        [lessThan,
                            [{ myBinMinVal: _ }, [me]],
                            [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { lowVal: _ } } }, [me]]
                        ],
                        [greaterThan,
                            [{ myBinMaxVal: _ }, [me]],
                            [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { highVal: _ } } }, [me]]
                        ]
                    )
                ]
            }
        },
        { // default
            "class": o("SliderHistogramBarSelectionsContainerDesign", "GeneralArea", "Icon", "MinWrap", "TrackMyFacet", "TrackMySelectableFacetXIntOverlay"),
            context: {
                myFacet: [{ myIconable: { myFacet: _ } }, [me]],
                myOverlay: [{ myIconable: { myOverlay: _ } }, [me]],
                myOverlayXWidget: [
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]]
                    },
                    [areaOfClass, "OverlayXWidget"]
                ],
                myValSelectors: [
                    { myOverlayXWidget: [{ myOverlayXWidget: _ }, [me]] },
                    [areaOfClass, "ValSelector"]
                ],
                myBar: [{ myIconable: _ }, [me]],
                myBin: [{ myBar: { myBin: _ } }, [me]],
                myBinMinVal: [min, [{ myBin: { binRange: _ } }, [me]]],
                myBinMaxVal: [max, [{ myBin: { binRange: _ } }, [me]]],

                minWrapAround: 0
            },
            children: {
                setBarAsSelection: {
                    description: {
                        "class": "SliderHistogramBarSetAsSelectionsControl"
                    }
                }
            },
            position: {
                attachLeftToBarRight: {
                    point1: {
                        element: [{ myIconable: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                verticallyCenterWithBar: {
                    point1: {
                        element: [{ myIconable: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { addIncludeInSelectionOption: true },
            children: {
                includeBarInSelection: {
                    description: {
                        "class": "SliderHistogramBarIncludeInSelectionsControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBarSelectionsControl: {
        "class": o("GeneralArea", "HoveringSelectionControl"),
        context: {
            // HoveringSelectionControl params
            displayDimensionWidthMin: true, // override DisplayDimension param via HoveringSelectionControl
            myOverlay: [{ myOverlay: _ }, [embedding]],

            mySelectableFacetXIntOverlay: [{ mySelectableFacetXIntOverlay: _ }, [embedding]],
            myBin: [{ myBin: _ }, [embedding]],
            myBinMinVal: [{ myBinMinVal: _ }, [embedding]],
            myBinMaxVal: [{ myBinMaxVal: _ }, [embedding]]
        },
        position: {
            left: 0
        },
        write: {
            onSliderHistogramBarSelectionsControlClick: {
                "class": "OnMouseClick",
                true: {
                    setOverlayLowValSelectionInFacet: {
                        to: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { lowVal: _ } } }, [me]],
                        merge: [{ calculatedLowVal: _ }, [me]]
                    },
                    setOverlayHighValSelectionInFacet: {
                        to: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { highVal: _ } } }, [me]],
                        merge: [{ calculatedHighVal: _ }, [me]]
                    },
                    setValSelectorsAsBecameInFocus: {
                        to: [{ myValSelectors: { becameInFocus: _ } }, [embedding]],
                        merge: true
                    },
                    turnOffReadyForSelection: {
                        to: [{ myBar: { readyForSelection: _ } }, [embedding]],
                        merge: false
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBarSetAsSelectionsControl: {
        "class": o("SliderHistogramBarSetAsSelectionsControlDesign", "SliderHistogramBarSelectionsControl"),
        context: {
            hoveringSelectionText: [concatStr, // HoveringSelectionControl param
                o(
                    [{ myApp: { setStr: _ } }, [me]],
                    [{ myApp: { barEntityStr: _ } }, [me]],
                    [{ myApp: { asStr: _ } }, [me]],
                    [{ myApp: { selectionEntityStr: _ } }, [me]]
                ),
                " "
            ],

            calculatedLowVal: [{ myBinMinVal: _ }, [me]],
            calculatedHighVal: [{ myBinMaxVal: _ }, [me]]
        },
        position: {
            top: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderHistogramBarIncludeInSelectionsControl: {
        "class": o("SliderHistogramBarIncludeInSelectionsControlDesign", "SliderHistogramBarSelectionsControl"),
        context: {
            hoveringSelectionText: [concatStr, // HoveringSelectionControl param
                o(
                    [{ myApp: { includeStr: _ } }, [me]],
                    [{ myApp: { barEntityStr: _ } }, [me]],
                    [{ myApp: { inStr: _ } }, [me]],
                    [{ myApp: { selectionEntityStr: _ } }, [me]]
                ),
                " "
            ],

            calculatedLowVal: [min,
                [{ myBinMinVal: _ }, [me]],
                [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { lowVal: _ } } }, [me]]
            ],

            calculatedHighVal: [max,
                [{ myBinMaxVal: _ }, [me]],
                [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { highVal: _ } } }, [me]]
            ]
        },
        position: {
            attachTopToSetAsControlBottom: {
                point1: {
                    element: [{ children: { setBarAsSelection: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            bottom: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Slider Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the appropriate variant of the SelectableFacetXIntOverlay, the class of the areaSet embedded in an intensional overlay, where each area
    // represents the selections/solutionSets pertaining to a single selectableFacet & the overlay.
    //
    // the state of a slider:
    // we distinguish between the stable and transient values of a slider. each of the two valSelectors has a stable and a transient value. these values are identical when the valSelectors
    // are not being dragged (directly, or - via their connector or elastic - indirectly). when they are being dragged, the transient value reflects their current value, and the stable value
    // reflects their value prior to the mouseDown that initiated their dragging.
    // this class stores a stable and a transient selections object. the transient selection object points to the stable selections obj(by default, see SelectableFacetXIntOverlay), 
    // when no dragging takes place in any of the associated SliderIntOverlayXWidgets. 
    // the elements in SliderFacetXIntOSR, and those not being dragged in the SliderIntOverlayXWidget read their values off of the transient selections object.
    // when dragging does take place, those elements dragged are attached to the mouse, and read their value based on their position. the SliderFacetXIntOverlay, in turn, now makes a 
    // distinction between the transient and stable values. the transient value of the selectors being dragged are now obtained from the element in the SliderIntOverlayXWidget being
    // modified.
    // In summary, there's a bit of role-playing here: when no dragging takes place, all relevant elements outside SliderFacetXIntOverlay, read their values from its transient selections
    // obj. when one of these elements *is* dragged, the SliderFacetXIntOverlay starts tracking the value provided by that dragged element, i.e. the direction of tracking is reversed.
    // note that tracking is done at the individual value level: if only the lowVal selector is modified, then for that value, the SliderFacetXIntOverlay will track the dragged valSelector's
    // value; but for the highVal, the neighboring highValSelector will continue to obtain its value from the transient selections obj in the SliderFacetXIntOverlay
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                valuableNumericalSelectionsMade: o(
                    [not, [{ lowValEqualsMinusInfinity: _ }, [me]]],
                    [not, [{ highValEqualsPlusInfinity: _ }, [me]]]
                ),

                valuableNonNumericalSelectionsMade: [ // note: also without the noValueExpression!
                    n(
                        [{ myApp: { noValueExpression: _ } }, [me]],
                        r(-Number.MAX_VALUE, Number.MAX_VALUE)
                    ),
                    [{ inclusionExclusionSelections: _ }, [me]]
                ],
                valuableSelectionsMade: o(
                    [{ valuableNumericalSelectionsMade: _ }, [me]],
                    [{ valuableNonNumericalSelectionsMade: _ }, [me]]
                ),
                selectionsMade: o( // this reflects the 'transient' value, i.e. the current selection, including during MouseDown.
                    [{ valuableSelectionsMade: _ }, [me]],
                    [{ noValueSelectionMade: _ }, [me]]
                ),

                stableValuableNumericalSelectionsMade: o(
                    [notEqual,
                        Number.NEGATIVE_INFINITY,
                        [{ stableSelectionsObj: { lowVal: _ } }, [me]]
                    ],
                    [notEqual,
                        Number.POSITIVE_INFINITY,
                        [{ stableSelectionsObj: { highVal: _ } }, [me]]
                    ]
                ),
                stableValuableSelectionsMade: o(
                    [{ stableValuableNumericalSelectionsMade: _ }, [me]],
                    [{ valuableNonNumericalSelectionsMade: _ }, [me]]
                ),
                stableSelectionsMade: o( // 'stable' value, i.e. excluding during mouseDown. this overrides default definition in SelectableFacetXIntOverlay
                    [{ stableValuableSelectionsMade: _ }, [me]],
                    [{ noValueSelectionMade: _ }, [me]]
                ),
                myOverlayXWidgetLowValSelectorBeingModified: [
                    { lowValSelectorBeingModified: true },
                    [{ myIntOverlayXWidgets: _ }, [me]]
                ],
                myOverlayXWidgetHighValSelectorBeingModified: [
                    { highValSelectorBeingModified: true },
                    [{ myIntOverlayXWidgets: _ }, [me]]
                ],
                myOverlayXWidgetBothValSelectorsBeingModified: [
                    { bothValSelectorsBeingModified: true },
                    [{ myIntOverlayXWidgets: _ }, [me]]
                ]
            }
        },
        { // default
            context: {
                myIntOverlayXWidgets: [ // there could be multiple areaRefs: if the corresponding slider is the x-axis in one or more 2D plots.
                    {
                        myOverlay: [{ myOverlay: _ }, [me]],
                        myFacet: [{ myFacet: _ }, [me]]
                    },
                    [areaOfClass, "SliderIntOverlayXWidget"]
                ],

                // note that the following two reflect the 'transient', i.e. the current selection, including during MouseDown.
                lowValEqualsMinusInfinity: [equal,
                    Number.NEGATIVE_INFINITY,
                    [{ transientSelectionsObj: { lowVal: _ } }, [me]]
                ],
                highValEqualsPlusInfinity: [equal,
                    Number.POSITIVE_INFINITY,
                    [{ transientSelectionsObj: { highVal: _ } }, [me]]
                ],

                lowStableValEqualsMinusInfinity: [equal,
                    Number.NEGATIVE_INFINITY,
                    [{ stableSelectionsObj: { lowVal: _ } }, [me]]
                ],
                highStableValEqualsPlusInfinity: [equal,
                    Number.POSITIVE_INFINITY,
                    [{ stableSelectionsObj: { highVal: _ } }, [me]]
                ],
                stableSelectionsRange: r(
                    [{ stableSelectionsObj: { lowVal: _ } }, [me]],
                    [{ stableSelectionsObj: { highVal: _ } }, [me]]
                ),

                transientSelectionsRange: r(
                    [{ transientSelectionsObj: { lowVal: _ } }, [me]],
                    [{ transientSelectionsObj: { highVal: _ } }, [me]]
                ),
                includedForDisplayInput: [ // override default definition in SelectableFacetXIntOverlay: since this is a SliderFacet, we do not 
                    // display any preexisting *numerical* selections that may have been made if the associated facet was previously an MSFacet
                    n(r(-Number.MAX_VALUE, Number.MAX_VALUE)),
                    [{ stableSelectionsObj: { included: _ } }, [me]]
                ],
                excludedForDisplayInput: [ // override default definition in SelectableFacetXIntOverlay: since this is a SliderFacet, we do not 
                    // display any preexisting *numerical* selections that may have been made if the associated facet was previously an MSFacet
                    n(r(-Number.MAX_VALUE, Number.MAX_VALUE)),
                    [{ stableSelectionsObj: { excluded: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { myOverlayXWidgetHighValSelectorBeingModified: true },
            context: {
                transientSelectionsObj: {
                    // uniqueID: preexists from the original definition in the default clause above
                    // here we override the default definition for highVal
                    highVal: [{ myOverlayXWidgetHighValSelectorBeingModified: { children: { highValSelector: { value: _ } } } }, [me]]
                }
            }
        },
        {
            qualifier: { myOverlayXWidgetLowValSelectorBeingModified: true },
            context: {
                transientSelectionsObj: {
                    // uniqueID: preexists from the original definition in the default clause above
                    // here we override the default definition for lowVal
                    lowVal: [{ myOverlayXWidgetLowValSelectorBeingModified: { children: { lowValSelector: { value: _ } } } }, [me]]
                }
            }
        },
        {
            qualifier: { myOverlayXWidgetBothValSelectorsBeingModified: true },
            context: {
                transientSelectionsObj: {
                    // uniqueID: preexists from the original definition in the default clause above
                    // here we override the default definitions for both lowVal and highVal
                    lowVal: [{ myOverlayXWidgetBothValSelectorsBeingModified: { children: { lowValSelector: { value: _ } } } }, [me]],
                    highVal: [{ myOverlayXWidgetBothValSelectorsBeingModified: { children: { highValSelector: { value: _ } } } }, [me]]
                }
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                selectionsMade: true
            },
            "class": "DiscreteSelectionsStr",
            context: {
                lowValString: [numberToStringPerNumericFormat,
                    [{ transientSelectionsObj: { lowVal: _ } }, [me]],
                    [{ myFacet: { numericFormat: _ } }, [me]],
                    true // useStandardPrecision
                ],
                highValString: [numberToStringPerNumericFormat,
                    [{ transientSelectionsObj: { highVal: _ } }, [me]],
                    [{ myFacet: { numericFormat: _ } }, [me]],
                    true // useStandardPrecision
                ],
                selectionsStr: [concatStr,
                    o(
                        [{ nameForSelectionsStr: _ }, [me]],
                        [cond,
                            [{ valuableNumericalSelectionsMade: _ }, [me]],
                            o(
                                {
                                    on: true,
                                    use: [cond,
                                        [{ lowValEqualsMinusInfinity: _ }, [me]],
                                        o(
                                            {
                                                on: true,
                                                use: [concatStr, o("<= ", [{ highValString: _ }, [me]])]
                                            },
                                            {
                                                on: false,
                                                use: [cond,
                                                    [{ highValEqualsPlusInfinity: _ }, [me]],
                                                    o(
                                                        {
                                                            on: true,
                                                            use: [concatStr, o(">= ", [{ lowValString: _ }, [me]])]
                                                        },
                                                        {
                                                            on: false,
                                                            use: [concatStr,
                                                                o(
                                                                    [{ lowValString: _ }, [me]],
                                                                    " - ",
                                                                    [{ highValString: _ }, [me]]
                                                                )
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        )
                                    ]
                                }
                            )
                        ],
                        [cond,
                            [{ inclusionExclusionSelections: _ }, [me]],
                            o({
                                on: true,
                                use: [concatStr,
                                    o(
                                        [cond, // add a separator only if there was a numerical selection made
                                            [{ valuableNumericalSelectionsMade: _ }, [me]],
                                            o({ on: true, use: [{ selectionSeparatorStr: _ }, [me]] })
                                        ],
                                        [{ discreteSelectionsStr: _ }, [me]]
                                    )
                                ]
                            })
                        ]
                    )
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNumericalSelectionsMade: true
            },
            context: {
                coreTransientNumericalSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    [{ transientSelectionsRange: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                stableValuableNumericalSelectionsMade: true
            },
            context: {
                coreStableNumericalSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    [{ stableSelectionsRange: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNonNumericalSelectionsMade: false
            },
            context: {
                coreStableSelectionQuery: [{ coreStableNumericalSelectionQuery: _ }, [me]],
                coreTransientSelectionQuery: [{ coreTransientNumericalSelectionQuery: _ }, [me]]
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNonNumericalSelectionsMade: true
            },
            context: {
                coreStableSelectionQuery: o(
                    [{ coreStableNumericalSelectionQuery: _ }, [me]],
                    [{ discreteValuableSelectionQuery: _ }, [me]]
                ),
                coreTransientSelectionQuery: o(
                    [{ coreTransientNumericalSelectionQuery: _ }, [me]],
                    [{ discreteValuableSelectionQuery: _ }, [me]] // these are discrete selections, so same for *stable* and *transient*
                )
            }
        },
        // in the two following variants, we define discreteValuableSelectionQuery (depending on the value of effectiveExclusionMode):
        // this is the valuable (i.e. not noValue) *discrete* value selected in a sliderFacet - typically, some non-numeric value that comes in a 
        // less-than-clean db
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNonNumericalSelectionsMade: true,
                effectiveExclusionMode: false
            },
            context: {
                discreteValuableSelectionQuery: [
                    [{ facetQuery: _ }, [me]],
                    [
                        n(
                            // remove the "No Value" expression from the os of excluded that feeds into n() as it isn't found in actual item db
                            [{ myApp: { noValueExpression: _ } }, [me]],
                            // take only the non-numerical values
                            // (there may be numerica values if the facet was an MSFacet at some point previously)
                            r(-Number.MAX_VALUE, Number.MAX_VALUE)
                        ),
                        [{ stableSelectionsObj: { included: _ } }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNonNumericalSelectionsMade: true,
                effectiveExclusionMode: true
            },
            context: {
                // note we use here the query of the format n({ "Geography": "Global"}), and not { "Geography": n("Global")}.
                // the reason is that if the "Geography" attribute is altogether missing, it would be selected by the first expression, and not
                // by the second (i.e. it would be excluded by the second, which is not what we want here)
                discreteValuableSelectionQuery: n(
                    [
                        [{ facetQuery: _ }, [me]],
                        [
                            n(
                                // remove the "No Value" expression from the os of excluded that feeds into n() as it isn't found in actual item db
                                [{ myApp: { noValueExpression: _ } }, [me]],
                                // take only the non-numerical values
                                // (there may be numerica values if the facet was an MSFacet at some point previously)
                                r(-Number.MAX_VALUE, Number.MAX_VALUE)
                            ),
                            [{ stableSelectionsObj: { excluded: _ } }, [me]]
                        ]
                    ]
                )
            }
        },
        {
            qualifier: {
                disabled: false,
                ofProperlyDefinedFacet: true,
                valuableNonNumericalSelectionsMade: true,
                noValueSelectionMade: false, // the case where noValueSelectionMade:true is handled by a SelectableFacetXIntOverlay variant!
                // and there is no need to create an equivalent version of this variant here for effectiveExclusionMode: true, as in that case there is 
                // no need for a c() wrapper: in that we anyway want the AND interpretation of an os of selection queries.
                effectiveExclusionMode: false
            },
            context: {
                stableSelectionQuery: c(
                    o(
                        [{ coreStableSelectionQuery: _ }, [me]],
                        [{ discreteValuableSelectionQuery: _ }, [me]]
                    )
                ),
                transientSelectionQuery: c(
                    o(
                        [{ coreTransientSelectionQuery: _ }, [me]],
                        [{ discreteValuableSelectionQuery: _ }, [me]]
                    )
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMySliderFacetXIntOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                lowValEqualsMinusInfinity: [
                    cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { lowValEqualsMinusInfinity: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ],
                highValEqualsPlusInfinity: [
                    cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { highValEqualsPlusInfinity: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ],
                lowStableValEqualsMinusInfinity: [
                    cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { lowStableValEqualsMinusInfinity: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ],
                highStableValEqualsPlusInfinity: [
                    cond,
                    [{ mySelectableFacetXIntOverlay: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ mySelectableFacetXIntOverlay: { highStableValEqualsPlusInfinity: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ]
            }
        },
        { // default
            "class": "TrackMySelectableFacetXIntOverlay"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Amoeba and its embeddedStar classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////        

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Selector Value Display Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myValSelector
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayContainer: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                embedDeleteControl: [and,
                    [{ embedDeleteControl: _ }, [embedding]],
                    [not, [{ selectorValIsInfinity: _ }, [me]]]
                ],
                // if this is in a sliderSelector in a vertical widget, and we're showing the histogram, then the valSelectorDisplay should be displayed 
                // on the left side of the sliderSelector!
                // the motivation: to ensure that the selector display does not compete with the histogram bar value displays, which are displayed when
                // dragging a slider selector, including when dragging the slider selectors right next to it. 
                rightSidedDisplay: o(
                    [{ embedDeleteControl: _ }, [embedding]], // display on right because in this mode the histogram, among other elements, is masked
                    [not,
                        [and,
                            [{ myValSelector: { ofVerticalElement: _ } }, [me]],
                            [equal,
                                [{ myValSelector: { myFacet: { state: _ } } }, [me]],
                                facetState.histogram
                            ]
                        ]
                    ]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "IconAboveAppZTop", "TrackMyValSelector", "MinWrap"),
            context: {
                minWrapAround: 0
            },
            position: {
                attachToMySliderSelectorVertically: {
                    point1: [{ myValSelector: { valPosPoint: _ } }, [me]],
                    point2: { type: "vertical-center" },
                    equals: 0
                }
            },
            children: {
                root: {
                    description: {
                        "class": "ValSelectorDisplayRoot"
                    }
                },
                valSelectorDisplay: {
                    description: {
                        "class": "ValSelectorDisplay"
                    }
                }
            }
        },
        {
            qualifier: { rightSidedDisplay: true },
            position: {
                attachToMySliderSelectorHorizontally: {
                    point1: {
                        element: [{ myValSelector: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                attachRootToModifierHorizontally: {
                    point1: {
                        element: [{ children: { root: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { valSelectorDisplay: _ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { rightSidedDisplay: false },
            position: {
                attachToMySliderSelectorHorizontally: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myValSelector: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                attachRootToBodyHorizontally: {
                    point1: {
                        element: [{ children: { valSelectorDisplay: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { root: _ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { embedDeleteControl: true },
            children: {
                deleteControl: {
                    description: {
                        "class": "ValSelectorDisplayDeleteControl"
                    }
                }
            },
            position: {
                attachBodyToDeleteControl: {
                    point1: {
                        element: [{ children: { body: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { deleteControl: _ } }, [me]],
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayRoot: {
        "class": o("ValSelectorDisplayRootDesign", "GeneralArea"),
        position: {
            "vertical-center": 0,
            width: [{ sliderPosConst: { valSelectorDisplayRootWidth: _ } }, [globalDefaults]],
            height: [{ sliderPosConst: { valSelectorDisplayRootHeight: _ } }, [globalDefaults]],
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                rightSidedDisplay: [{ rightSidedDisplay: _ }, [embedding]],
                editInputDisplayText: [{ myValSelector: { editInputDisplayText: _ } }, [me]]
            }
        },
        { // default
            "class": o("ValSelectorDisplayDesign", "GeneralArea", "MinWrap", "TrackMyValSelector"),
            context: {
                myValSelector: [{ myValSelector: _ }, [embedding]],

                val: [{ myValSelector: { transientVal: _ } }, [me]],
                selectorValIsInfinity: [{ myValSelector: { selectorValIsInfinity: _ } }, [me]],

                minWrapLeft: [{ sliderPosConst: { valSelectorDisplayHorizontalMarginFromEmbedding: _ } }, [globalDefaults]],
                minWrapRight: [{ sliderPosConst: { valSelectorDisplayHorizontalMarginFromEmbedding: _ } }, [globalDefaults]],
                minWrapTop: [{ sliderPosConst: { valSelectorDisplayVerticalMarginFromEmbedding: _ } }, [globalDefaults]],
                minWrapBottom: [{ sliderPosConst: { valSelectorDisplayVerticalMarginFromEmbedding: _ } }, [globalDefaults]]
            },
            children: {
                modifier: {
                    description: {
                        "class": "ValSelectorDisplayModifier",
                        context: {
                            isLeftEdge: true
                        }
                    }
                },
                body: {
                    description: {
                        "class": "ValSelectorDisplayBody",
                        context: {
                            isRightEdge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { rightSidedDisplay: true },
            position: {
                attachToMySliderSelectorHorizontally: {
                    point1: {
                        element: [{ myValSelector: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                attachModifierToBodyHorizontally: {
                    point1: {
                        element: [{ children: { modifier: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { body: _ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { rightSidedDisplay: false },
            position: {
                attachToMySliderSelectorHorizontally: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myValSelector: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                attachModifierToBodyHorizontally: {
                    point1: {
                        element: [{ children: { modifier: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { body: _ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { editInputDisplayText: false },
            write: {
                onValSelectorDisplayMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        turnOnSelectorTmd: {
                            to: [{ myValSelector: { tmd: _ } }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                editInputDisplayText: [{ myValSelector: { editInputDisplayText: _ } }, [me]],
                selectorValIsInfinity: [{ selectorValIsInfinity: _ }, [embedding]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyValSelector"),
            context: {
                myValSelector: [{ myValSelector: _ }, [embedding]]
            },
            position: {
                "vertical-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayBody: o(
        { // default
            "class": o(
                "ValSelectorDisplayBodyDesign",
                "ValSelectorDisplayElement",
                "NumberInput",
                // TrackMyFacet for NumericFormat, which is inherited by ValSelectorDisplayBodyDesign 
                "TrackMyFacet"
            ),
            context: {

                // NumberInput params
                editInputText: [{ myValSelector: { editInputDisplayText: _ } }, [me]], // use editInputText, the TextInput param, as a writable ref.
                // this allows to control creation of ValSelectorDisplay depending on the value of the appData, stored in the ValSelector

                displayText: [{ val: _ }, [embedding]]
            }
        },
        {
            qualifier: {
                editInputText: false,
                selectorValIsInfinity: true
            },
            context: {
                displayText: [{ myValSelector: { extremumVal: _ } }, [me]]
            }
        },
        {
            qualifier: { editInputText: false },
            "class": "DisplayDimension",
            context: {
                blockMouseDown: false
            }
        },
        {
            qualifier: { editInputText: true },
            context: {
                otherValSelector: [
                    n([{ myValSelector: _ }, [me]]), //remove myVaSelector
                    [                               // from the selection of both ValSelectors in myValSelector's OverlayXWidget
                        { myOverlayXWidget: [{ myValSelector: { myOverlayXWidget: _ } }, [me]] },
                        [areaOfClass, "ValSelector"]
                    ]
                ],
                // Additional NumberInput params
                displayText: [cond,
                    [{ selectorValIsInfinity: _ }, [me]],
                    o(
                        { on: false, use: [{ myValSelector: { stableVal: _ } }, [me]] },
                        { on: true, use: "" } // if the value is infinity, display nothing (the placeholderInputText will be displayed instead)
                    )
                ],
                inputAppData: [{ myValSelector: { stableVal: _ } }, [me]],
                placeholderInputText: "<Num>",
                allowWritingInput: [and,
                    [not, [{ invalidInput: _ }, [me]]],
                    o(
                        [{ inputIsValidNumber: _ }, [me]],
                        [{ inputIsEmpty: _ }, [me]] // empty string to be interpreted as reverting to associated infinity value                                    
                    )
                ],
                textForAppData: [cond,
                    [not, [{ inputIsEmpty: _ }, [me]]],
                    o(
                        {
                            on: true, // i.e. it's a valid number, and should be used as such
                            use: [{ inputAsNumber: _ }, [me]]
                        },
                        {
                            on: false, // i.e. it should be interpreted as the associated infinity value. 
                            use: [{ myValSelector: { infinityVal: _ } }, [me]]
                        }
                    )
                ]
            },
            position: {
                // review this once bug #1338 and #1340 are fixed. may prefer to use displayDimensionOfStableText: true here (See TextInputs)
                height: [densityChoice, [{ sliderPosConst: { valSelectorDisplayBodyHeightWhenEdited: _ } }, [globalDefaults]]],
                width: [densityChoice, [{ sliderPosConst: { valSelectorDisplayBodyWidthWhenEdited: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: {
                editInputText: true,
                ofHighValSelector: true
            },
            context: {
                invalidInput: o(
                    [greaterThan,
                        [{ inputAsNumber: _ }, [me]],
                        [{ myValSelector: { extremumVal: _ } }, [me]]
                    ],
                    [greaterThan,
                        [{ otherValSelector: { stableVal: _ } }, [me]],
                        [{ inputAsNumber: _ }, [me]]
                    ],
                    [greaterThan,
                        [{ otherValSelector: { extremumVal: _ } }, [me]],
                        [{ inputAsNumber: _ }, [me]]
                    ]
                ),
                invalidInputErrorMsg: "Error: value must be greater than other selector's and within scale range"
            }
        },
        {
            qualifier: {
                editInputText: true,
                ofHighValSelector: false
            }, // i.e. LowValSelector
            context: {
                invalidInput: o(
                    [greaterThan,
                        [{ myValSelector: { extremumVal: _ } }, [me]],
                        [{ inputAsNumber: _ }, [me]]
                    ],
                    [greaterThan,
                        [{ inputAsNumber: _ }, [me]],
                        [{ otherValSelector: { stableVal: _ } }, [me]]
                    ],
                    [greaterThan,
                        [{ inputAsNumber: _ }, [me]],
                        [{ otherValSelector: { extremumVal: _ } }, [me]]
                    ]
                ),
                invalidInputErrorMsg: "Error: value must be smaller than other selector's and within scale range"
            }
        },
        {
            qualifier: {
                editInputText: true,
                invalidInput: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: [{ invalidInputErrorMsg: _ }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayModifier: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showModifier: [and,
                    [{ selectorValIsInfinity: _ }, [me]],
                    [not, [{ editInputDisplayText: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o(
                "ValSelectorDisplayModifierDesign",
                "ValSelectorDisplayElement"
            ),
            context: {
                displayText: ""
            }
        },
        {
            qualifier: { showModifier: false },
            position: {
                width: 0
            }
        },
        {
            qualifier: { showModifier: true },
            "class": "DisplayDimension",
            context: {
                displayText: [
                    cond,
                    [
                        [{ myValSelector: _ }, [me]],
                        [areaOfClass, "LowValSelector"]
                    ],
                    o(
                        { on: true, use: "<" },
                        { on: false, use: ">" }
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorDisplayDeleteControl: {
        "class": o("ValSelectorDisplayDeleteControlDesign", "GeneralArea"),
        position: {
            "vertical-center": 0
        },
        stacking: {
            aboveMyBody: {
                higher: [me],
                lower: [{ children: { body: _ } }, [embedding]]
            }
        },
        write: {
            onValSelectorDisplayDeleteControlMouseDown: {
                "class": "OnMouseDown",
                true: {
                    resetToInfinity: {
                        to: [{ myValSelector: { stableVal: _ } }, [embedding]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Selector Value Display Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       

    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    // Beginning of Slider Scale Edit Control Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       

    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SliderScaleEditControl: o(
        { // default
            "class": o("SliderScaleEditControlDesign",
                "MoreControlsController", "MoreControlsOnClickUX", "TrackMySliderWidget",
                "DisplayDimension"),
            context: {
                myMoreControlsController: [me],
                immunityFromClosingMoreControlsAreaRefs: o(
                    [me],
                    [areaOfClass, "SliderScaleEditControlMenuItem"],
                    [areaOfClass, "RadioButtonElement"]
                ),
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { editStr: _ } }, [me]],
                        " ",
                        [{ myApp: { sliderEntityStr: _ } }, [me]],
                        " ",
                        [{ myApp: { scaleStr: _ } }, [me]]

                    )
                ],
                showUxElements: false, //in MoreControlsOnClickUX API                

                linearScaleStr: [concatStr, o([{ myApp: { linearStr: _ } }, [me]], " ", [{ myApp: { scaleStr: _ } }, [me]])],
                // the scale options:
                scaleOptions: o(
                    {
                        uniqueId: "linear",
                        buttonText: "LIN",
                        displayText: [{ linearScaleStr: _ }, [me]]
                    },
                    {
                        uniqueId: "linearPlus",
                        buttonText: "LI+",
                        displayText: [concatStr,
                            o(
                                [{ linearScaleStr: _ }, [me]],
                                " ",
                                [{ myApp: { withStr: _ } }, [me]],
                                " ",
                                [{ myApp: { logStr: _ } }, [me]],
                                " ",
                                [{ myApp: { tailEntityStr: _ } }, [me]]
                            )
                        ]
                    },
                    {
                        uniqueId: "linearPlusMinus",
                        buttonText: "+LI+",
                        displayText: [concatStr,
                            o(
                                [{ linearScaleStr: _ }, [me]],
                                " ",
                                [{ myApp: { withStr: _ } }, [me]],
                                " ",
                                [{ myApp: { logStr: _ } }, [me]],
                                " ",
                                [{ myApp: { tailEntityStrPlural: _ } }, [me]],
                                " ",
                                [{ myApp: { onBothEndsStr: _ } }, [me]]
                            )
                        ]
                    },
                    {
                        uniqueId: "log",
                        buttonText: "LOG",
                        displayText: [concatStr, o([{ myApp: { logStr: _ } }, [me]], " ", [{ myApp: { scaleStr: _ } }, [me]])]
                    }
                ),

                displayText: [
                    { buttonText: _, uniqueId: [{ scaleType: _ }, [me]] },
                    [{ scaleOptions: _ }, [me]]
                ],

                myMaxSliderScalePrimaryLabel: [
                    { myWidget: [{ myWidget: _ }, [me]], isScaleMaxValue: true },
                    [areaOfClass, "SliderScalePrimaryLabel"]
                ]
            },
            position: {
                alignRightWithMyMaxSliderScalePrimaryLabel: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myMaxSliderScalePrimaryLabel: _ }, [me]],
                        type: "right"
                    },
                    equals: 0
                },
                alignTopWithMyMaxSliderScalePrimaryLabel: {
                    point1: { type: "bottom" },
                    point2: {
                        element: [{ myMaxSliderScalePrimaryLabel: _ }, [me]],
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { moreControlsOpen: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SliderScaleEditControlMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SliderScaleEditControlMenu: {
        "class": o("MoreControlsMenu", "RadioButtonController",
            "TrackMySliderWidget"), //"SliderScaleEditControlMenuDesign", 
        context: {

            mySliderScaleEditControl: [expressionOf, [me]],
            myWidget: [{ myWidget: _ }, [{ mySliderScaleEditControl: _ }, [me]]],

            menuOptions: [{ scaleOptions: _ }, [{ mySliderScaleEditControl: _ }, [me]]],
            menuItemSelected: [{ scaleType: _ }, [me]]
        },
        children: {
            menuItems: {
                data: [{ menuOptions: _ }, [me]],
                description: {
                    "class": "SliderScaleEditControlMenuItem"
                }
            }
            /*
            originTriangle: { 
                description: {                   
                    context: {
                        useBackgroundColorOfMyAdjacentMenuItem: false,
                    }
                }
            },*/
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    SliderScaleEditControlMenuItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                useRadioButtons: [equal,
                    [{ useRadioButtonsInSliderScaleEditControlMenuItemABTest: _ },
                    [areaOfClass, "FSApp"]],
                    "yes"
                ],
                //serving RadioButtonElement
                selected: [equal,
                    [{ uniqueId: _ }, [me]],
                    [{ menuItemSelected: _ }, [embedding]] // this is scaleType
                ],

                scaleTypeHasLogScales: [
                    [{ menuItemSelected: _ }, [embedding]],
                    o("linearPlus", "linearPlusMinus")
                ]
            }
        },
        { // default
            "class": o("SliderScaleEditControlMenuItemDesign", "GeneralArea", "MenuItemDirect", "TrackMySliderWidget"),
            context: {
                uniqueId: [{ param: { areaSetContent: { uniqueId: _ } } }, [me]],
                displayText: [{ param: { areaSetContent: { displayText: _ } } }, [me]],

                myWidget: [{ myWidget: _ }, [embedding]] // override default value for TrackMySliderWidget
            },
            write: {
                onSliderScaleEditControlMenuItemMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        changeScaleType: {
                            to: [{ menuItemSelected: _ }, [embedding]],
                            merge: [{ uniqueId: _ }, [me]]
                        },
                        resetMinValue: {
                            to: [{ myCanvas: { minValue: _ } }, [me]],
                            merge: o()
                        },
                        resetMaxValue: {
                            to: [{ myCanvas: { maxValue: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { scaleTypeHasLogScales: true },
            write: {
                onSliderScaleEditControlMenuItemMouseClick: {
                    // upon: see default clause
                    true: {
                        resetUserScaleLinearMinValue: {
                            to: [{ myCanvas: { userScaleLinearMinValue: _ } }, [me]],
                            merge: o()
                        },
                        resetUserScaleLinearMaxValue: {
                            to: [{ myCanvas: { userScaleLinearMaxValue: _ } }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { useRadioButtons: true },
            context: {
                showBar: false
            },
            children: {
                radioButton: {
                    description: {
                        //"class": "SliderScaleEditControlMenuItemRadioButton",
                        "class": "RadioButtonControl",
                        context: {
                            performWriteOnClick: false
                            // defined in RadioButtonElement API
                            //the write is already handled by the menuItem
                        },
                        position: {
                            left: bSliderPosConst.sliderScaleEditControlMenuItemRadioButtonsLeft
                        }
                    }
                },
                text: {
                    description: {
                        context: {
                            // overriding default value in MenuItemText 
                            horizontalMargin: bSliderPosConst.sliderScaleEditControlMenuItemRadioButtonsHorizontalMargin
                        }
                    }
                }
            }
        }
    )

    /////////////////////////////////////////////////////////////////////////////////////////////////////////       
    // End of Slider Scale Edit Control Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////           
};
