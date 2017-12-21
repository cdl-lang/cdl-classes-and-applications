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
// %%constantfile%%: <fsPositioningConstants.js>

var sliderFacetClasses = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Embedding: 
    // If there are selections made, this area embeds: a SliderSelectionsModifier, which represents the hyphen between two non-infinity values, or the >/< operator in case one 
    // of the values is at +infinity/-infinity (e.g. "> 20").
    ////////////////////////////////////////////////////////9/////////////////////////////////////////////////
    SliderSelections: o(
        { // default
            "class": superclass
        },
        {   
            qualifier: { singleSelection: true },
            children: {
                modifier: {
                    description: {
                        "class": "SliderSelectionsModifier",
                        context: {
                            modifier: [cond,
                                       [{ highValEqualsPlusInfinity:_ }, [me]],
                                       o(
                                         { on: true, use: "<" },
                                         { on: false, use: ">" }
                                        )
                                      ]
                        }
                    }
                }
            },
            position: {
                anchorModifierToSingleSelection: {
                    point1: {
                        element: [{ children: { modifier:_ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [
                                  [areaOfClass, "SliderSelection"],
                                  [embedded]
                                 ],
                        type: "left"
                    },
                    equals: 0
                }
            }
        }       
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the modifier that may be required to display the facet selections in the SliderSelections.
    // This area displays a hyphen, or a ">"/"<" operator, depending on the actual selections.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderSelectionsModifier: {
        "class": o("SliderSelectionsModifierDesign", "GeneralArea"),
        context: {
            selectionsDisabled: [{ selectionsDisabled:_ }, [embedding]], // for SliderSelectionDesign
            displayText: [{ modifier:_ }, [me]]
        },
        position: {
            "vertical-center": 0,            
            width: 10, // to be replaced by a display query
            height: bFSPosConst.tempFacetSelectionHeight // to be replaced by a display query
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderOverlayXWidget: {
        "class": o("SliderOverlayXWidgetDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderIntOverlayXWidget: {
        "class": superclass,
        context: {
            offsetEndSideAnchorFromHighHTMLGirth: sliderPosConst.littleHandleMarginBeyondSlider
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousRange: o(
        { // default
            "class": o("SliderContinuousRangeDesign", superclass),
            context: {
                color: [{ myOverlayXWidget: { color:_ } }, [me]] // the color of the associated overlay
            },
            position: {
                anchorEndGirthToOverlayXWidgetEndSideAnchor: {
                    point1: {
                        type: [{ endGirth:_ }, [me]]
                    },
                    point2: {
                        element: [{ myOverlayXWidget:_ }, [me]],
                        label: "endSideAnchor"
                    },
                    equals: 0
                },
                girthConstraint: {
                    point1: { type: [{ lowHTMLGirth:_ }, [me]] },
                    point2: { type: [{ highHTMLGirth:_ }, [me]] },
                    equals: bSliderPosConst.continuousRangeGirth
                }
            }
        },
        {
            qualifier: { ofBaseOverlayXWidget: true },
            context: {
                color: [{ myApp: { effectiveBaseOverlay: { color:_ } } }, [me]]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderContinuousSelectedRange: {
        "class": o("SliderContinuousSelectedRangeDesign", superclass),
        context: {
            color: [{ myOverlayXWidget: { color:_ } }, [me]], // the color of the associated overlay
            opacity: 0.6
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DBaseSetValueMarker: {
        "class": o("Slider1DBaseSetValueMarkerDesign", superclass, "CenterAroundContinuousRange"),
        context: {
            color: designConstants.globalBGColor
        },      
        position: {
            baseValueMarkerLengthConstraint: {
                point1: { type: [{ lowHTMLLength:_ }, [me]] },
                point2: { type: [{ highHTMLLength:_ }, [me]] },
                equals: [{ baseValueMarkerLength:_ }, [me]]
            },
            girthConstraint: {
                point1: { type: [{ lowHTMLGirth:_ }, [me]] },
                point2: { type: [{ highHTMLGirth:_ }, [me]] },
                equals: [mul, 2, bSliderPosConst.valueMarker1DRadius]
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfPermIntOverlay: {
        "class": superclass,
        context: {
            // When the associated overlay/facet have no meaningful selection (i.e. are on "Any", there's no explicit selection coloring of the continuous range), and so the 
            // valueMarker should present itself as pertaining to the solutionSet. 
            // Otherwise, it should present itself as pertaining to the implicit1DSet (i.e. ofSolutionSet: false), and if the explicit selection area covers it, that will provide it
            // with the darker shade of a solutionSet valueMarker.
            // This 'design hack' results in a valueMarker that's only partially covered by the explicit selection having two regions in it, one with the solutionSet coloring, the other
            // with the implicit1DSet coloring. The transition from Any to a selection is visually awkward right now.   
            // I tried having ofSolutionSet: false always here. the problem arises in a scenario such as the following: 
            // select in a given facet x overlay a range that excludes a bunch of valueMarkers. They're by definition in the implicit1DSet and not in the solutionSet. 
            // Now, if we remove that explicit selection, they should reenter the solutionSet, which they do; but there's no visual indication to that effect - they maintained their
            // implicit1DSet brighter shade, and the "Any" selection offers no coloring along the continuous range.
            ofSolutionSet: [not, [{ selectionsMade:_ }, [me]]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Slider1DValueMarkerOfEphOverlay: o(
        { // default
            "class": superclass
        },
        { 
            qualifier: { ofEphExtOverlaySolutionSet: false },
            position: {
                lengthConstraint: {
                    point1: { type: [{ lowHTMLLength:_ }, [me]] },
                    point2: { type: [{ highHTMLLength:_ }, [me]] },
                    equals: sliderPosConst.baseSetValueMarkerLength
                }
            }
        },
        { 
            qualifier: { ofEphExtOverlaySolutionSet: true },
            // if the marker is highlighted (represents a value projected from the solutionSet of the ephExtOverlay), it should have twice as long (length-axis!)
            position: {
                lengthConstraint: {
                    point1: { type: [{ lowHTMLLength:_ }, [me]] },
                    point2: { type: [{ highHTMLLength:_ }, [me]] },
                    equals: [mul, 
                             2,
                             sliderPosConst.baseSetValueMarkerLength]
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SliderInfinityRange: {
        "class": superclass,
        context: {
            numInfinityLines: sliderPosConst.numInfinityLines           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfinityLine: o(
        { // default
            "class": o("InfinityLineDesign", superclass),
            context: {
                color: [{ myOverlayXWidget: { color:_ } }, [me]], // the color of the associated overlay
                spacingFromPrev: sliderPosConst.lengthAxisSpacingOfInfinityLines
            },
            position: {
                relativeGirthOfAdjacentLines: {
                    pair1: {
                        point1: { 
                            element: [prev, [me]],
                            type: [{ lowHTMLGirth:_ }, [me]]
                        },
                        point2: { 
                            element: [prev, [me]],
                            type: [{ highHTMLGirth:_ }, [me]]
                        }
                    },
                    pair2: {
                        point1: { 
                            type: [{ lowHTMLGirth:_ }, [me]]
                        },
                        point2: { 
                            type: [{ highHTMLGirth:_ }, [me]]
                        }
                    },
                    ratio: sliderPosConst.lengthAxisScalingOfInfinityLinesGirth
                },
                centerOnGirthAxis: {
                    point1: {
                        element: [embedding],
                        type: [{ centerGirth:_ }, [me]] 
                    },
                    point2: {
                        type: [{ centerGirth:_ }, [me]] 
                    },
                    equals: 0
                }
            }
        },
        { 
            qualifier: { firstLine: true },
            "class": "MatchEmbeddingOnGirthAxis"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelector: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedHandle: o(
                               [{ myOverlayXWidget: { inArea:_ } }, [me]], // hovering over the OverlayXWidget
                               [{ myOverlayXWidget: { valSelectorsOfEqualValue:_ } }, [me]], // if selectors are one on top of the other, the user needs the ability to backtrack
                               [{ selectorIsBeingMoved:_ }, [me]]
                              )
            }
        },
        { // default
            "class": superclass,
            position: {
                exceedBeginningOfContinuousRange: {
                    point1: { 
                        type: [{ lowHTMLGirth:_ }, [me]]
                    },
                    point2: { 
                        element: [{ myOverlayXWidget: { children: { continuousRange:_ } } }, [me]],
                        type: [{ lowHTMLGirth:_ }, [me]]
                    },
                    equals: sliderPosConst.handleMarginBeyondSlider
                },
                exceedEndOfContinuousRange: {
                    point1: { 
                        element: [{ myOverlayXWidget: { children: { continuousRange:_ } } }, [me]],
                        type: [{ highHTMLGirth:_ }, [me]]
                    },
                    point2: { 
                        type: [{ highHTMLGirth:_ }, [me]]
                    },
                    equals: sliderPosConst.handleMarginBeyondSlider
                }
            }
        },
        {
            qualifier: { embedHandle: true },
            children: {
                handle: {
                    description: {
                        "class": "ValSelectorHandle"
                    }
                }
            }
        }       
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValSelectorHandle: o(
        { // default
            "class": o("ValSelectorHandleDesign", superclass)
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                "horizontal-center": 0
            }
        }
    )   
};
