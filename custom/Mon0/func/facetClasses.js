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

// %%constantfile%%: <fsPositioningConstants.js>
// %%classfile%%: <facetDesignClasses.js>

var facetClasses = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the expressionOf its facetHandle, which is used to reorder the facet within the pane (EmbeddingOfFacetHandles is its referredOf, and its embedding - see below).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovingFacet: {
        "class": o("MovingFacetDesign", superclass),
        children: {
            facetHandle: { 
                // intersect with an auxiliary area, which is embedded in MovingFacetViewPane, extends all over its height, but on the horizontal axis extends beyond it, to match
                // myApp's left/right. this allows the handle to be masked by MovingFacetViewPane when the facet is dragged out of view, but also permits the handle to remain in 
                // existence (as an intersection, it exists only if its parents have an intersection area).
                partner: [areaOfClass, "EmbeddingOfFacetHandles"],
                // description: provided by Core::BMovingFacet
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is formed by the intersection of a facet and the EmbeddingOfFacetHandles - to allow the handle to extend beyond the frame of the facet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ReorderableFacetHandle: {
        "class": o("ReorderableFacetHandleDesign", superclass),
        context: {
            myFacet: [expressionOf],
            // ReorderHandle param:
            iAmIcon: true,
            
            verticalOffsetFromMyFacetTop: fsPosConst.facetHandleVerticalOffsetFromFacet
        },
        position: {
            width: 50, // temp till display queries available
            height: 20 // temp till display queries available
        }
    },          
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetWithAmoeba: {
        "class": superclass
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatFacet: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { unminimizable: false },
            children: {
                minimizationControl: {
                    description: {
                        "class": "FacetWithAmoebaMinimizationControl"
                    }
                } 
            }
        }       
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Add the embedding of the FacetStateControls: the controls which allow direct-access to any one of the facet's states (for facets with amoebas).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetHeader: o(
        { // default
             "class": o("FacetHeaderDesign", superclass)
        },
        {
            qualifier: { ofFacetWithAmoeba: true },
            children: {
                stateControls: {
                    description: {
                        "class": "FacetStateControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetName: {
        "class": superclass,
        position: {
            bottom: fsPosConst.bottomFacetNameFromFacetHeader
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSorterUXDisplay: {
        "class": o("FacetSorterUXDisplayDesign", superclass)
    },
  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetSorterUX: {
        "class": superclass,
        position: {
            alignVerticallyWithFacetName: {
                point1: { 
                    element: [{ myFacetName:_ }, [me]],
                    type: "vertical-center"
                },
                point2: { 
                    type: "vertical-center"
                },
                equals: 0
            },
            attachToFacetNameOnRight: {
                point1: { 
                    element: [{ myFacetName:_ }, [me]],
                    type: "right"
                },
                point2: { 
                    type: "left"
                },
                equals: 0
            },
            minMarginOnRightFromFacetHeader: {
                point1: { 
                    type: "right"
                },
                point2: { 
                    element: [embedding],
                    type: "right"
                },
                min: fsPosConst.facetSorterUXMinRightMargin 
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetSorterUXDisplay: {
        "class": superclass
    },
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to minimize the embedding* FacetWithAmoeba.
    // It inherits:
    // 1. FacetMinimizationControl
    // 2. BlockMouseEventInFacetEmbeddedStar
    // 3. FacetControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetWithAmoebaMinimizationControl: {
        "class": o("FacetMinimizationControl", "FacetControl", "BlockMouseEventInFacetEmbeddedStar"), 
        context: {
            // FacetMinimizationControl params:
            minimizationControlOffsetFromTop: fsPosConst.facetWithAmoebaMinimizationControlFromTop,
            minimizationControlOffsetFromRight: fsPosConst.facetWithAmoebaMinimizationControlFromRight
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by FacetWithAmoebaMinimizationControl (which allows to minimize the associated facet)
    //
    // API:
    // 1. minimizationControlOffsetFromTop/minimizationControlOffsetFromRight
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetMinimizationControl: {
        "class": o("FacetMinimizationControlDesign", superclass, "AboveSiblings"),
        position: {
            width: fsPosConst.minimizeFacetControlWidth,
            height: fsPosConst.minimizeFacetControlHeight,
            top: [{ minimizationControlOffsetFromTop:_ }, [me]],
            right: [{ minimizationControlOffsetFromRight:_ }, [me]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the FacetHeader of a FacetWithAmoeba (SliderFacet, MSFacet, or RatingFacet).
    // It inherits MinWrapHorizontal, to tightly wrap its embedded areas horizontally, and BlockMouseEventInFacetEmbeddedStar, so that mouseEvents on it are not interpreted by the 
    // underlying areas (FacetHeader, which would interpret this as changing of sorting, and Facet, which could interpret this as dragging of the facet itself).
    // This class embeds an areaSet of FacetState areas, one for each possible facet state.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStateControls: {
        "class": o("GeneralArea", "MinWrapHorizontal", "BlockMouseEventInFacetEmbeddedStar", "TrackMyFacet"),
        position: {
            top: fsPosConst.facetStateControlFromFacetHeaderTop,
            bottom: fsPosConst.facetStateControlFromFacetHeaderBottom,
            left: fsPosConst.firstFacetStateControlFromFacetLeft,
            leftOfFacetHandle: {
                point1: { 
                    type: "right"
                },
                point2: {
                    element: [{ myFacet: { children: { facetHandle:_ } } }, [me]],
                    type: "left"
                },
                min: 0
            }
        },
        children: {
            stateControls: {
                data: [{ myFacet: { states:_ } }, [me]],
                description: {
                    "class": "FacetStateControl"
                }            
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single direct-access control for modifying the embedding facet's state.
    // When clicking on this area, it writes directly into its embedding facet's state.
    // This class embeds another area which provides the display of the control - the horizontal margin around this embedded FacetStateControlDisplay is what gives the "hotspot"
    // functionality (a click region that's larger than the *displayed* control).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStateControl: {
        "class": o(superclass, "MemberOfLeftToRightAreaOS", "MinWrap"), 
        context: {                            
            minWrapLeft: fsPosConst.hotspotAroundButton,
            minWrapRight: fsPosConst.hotspotAroundButton,
            minWrapTop: 0,
            minWrapBottom: 0                
        },
        position: {
            top: 0,
            bottom: 0
        },
        children: {
            facetStateControlDisplay: {
                description: {
                    "class": "FacetStateControlDisplay"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the visual indication of a facet state control. It is embedded in the FacetStateControl.
    // This class modifies its height in two situations: when it represents the facet's current state, and when the mouse is hovering over its embedding FacetStateControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStateControlDisplay: o(    
        { // variant-controller
            qualifier: "!",
            context: {
                amIFacetState: [equal,
                                [{ uniqueID:_ }, [embedding]], 
                                [{ facetState:_ }, [me]]
                               ],
                inAreaOfEmbedding: [{ inArea:_ }, [embedding]]
            }
        },
        { // default
            "class": o("FacetStateControlDisplayDesign", "TrackMyFacet"),
            position: {
                width: fsPosConst.facetStateControlWidth,
                bottom: 0
            }
        },
        {
            qualifier: { amIFacetState: true },
            position: {
                height: fsPosConst.facetStateControlSelected
            }
        },
        {
            qualifier: { amIFacetState: false },
            position: {
                height: fsPosConst.facetStateControlUnselected
            }
        },
        {
            qualifier: { amIFacetState: false,
                         inAreaOfEmbedding: true },
            position: {
                height: fsPosConst.facetStateControlSelected
            }
        }        
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSelections: {
        "class": o("FacetSelectionsDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Amoeba: {
        "class": o("AmoebaDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramBin: {
        "class": superclass,
        context: {
            solutionSetBarsData: [{ zoomBoxedOverlaysShowing:_ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This bar represents the baseSet in the embedding bin. It inherits BHistogramBaseBar.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramBaseBar: o(
        { // default
            "class": o("HistogramBaseBarDesign", superclass),
            context: {                       
                // override default definition of createTooltip. instead: createTooltip iff inArea:true, and all other bars in my bin (which have a higher z-index) have inArea:false.
                createTooltip: [and,
                                [{ inArea:_ }, [me]],
                                [not, 
                                 [
                                  { inArea: true },
                                  o(
                                    [{ children: { implicit1DSetBars:_ } }, [embedding]],
                                    [{ children: { solutionSetBars:_ } } , [embedding]]
                                   )
                                 ]
                                ]
                               ]
            },
            position: {
                top: 0,
                bottom: 1,
                barLengthConstraint: {
                    point1: {
                        label: "posOnCanvas"
                    },
                    point2: {
                        type: "right"
                    },
                    equals: [{ offsetFromPosOnCanvas:_ }, [me]]
                }
            }
        },
        {
            qualifier: { emptyBar: true },
            context:  {
                offsetFromPosOnCanvas: 0
            }
        },
        {
            qualifier: { emptyBar: false },
            context:  {
                // this is the extra bit that the baseBar has beyond the proper position it should assume, so that it sticks out beyond the solutionSetBar and the implicitSetBar.
                offsetFromPosOnCanvas: fsPosConst.sliverForBaseBarBeyondOtherBars
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the histogram bars which do not represent the baseSet, i.e. the implicit1DSet and the solutionSet.
    // It inherits Tooltipable to present textual information about its quantity. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramNoneBaseBar: o(
        { // default
            "class": o("HistogramBar", "Tooltipable"),
            context: {
                // HistogramBar param:
                myOverlay: [{ param: { areaSetContent:_ } }, [me]],
                
                // Tooltipable params: override default values
                tooltipHorizontalAnchor: atomic({
                                                    element: [me],
                                                    type: "right"
                                                }),
                tooltipVerticalAnchor: atomic({
                                                   element: [me],
                                                   type: "vertical-center"
                                              })
            },
            position: {
                barLengthConstraint: {
                    point1: {
                        label: "posOnCanvas"
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { histogramStandardDisplay: true },
            context: {
                coreTooltipText: [concatStr, o([{ barVal:_ }, [me]], " item")],
                // Tooltipable params:
                tooltipText: [cond,
                              [equal,
                               [{ barVal:_ }, [me]],
                               1
                              ],
                              o(
                                { on: true, use: [{ coreTooltipText:_ }, [me]] },
                                { on: null, use: [concatStr, o([{ coreTooltipText:_ }, [me]], "s")] }
                               )
                             ]
            }
        },
        {
            qualifier: { histogramDisplayMode: histogramMode.distribution },
            context: {
                // Tooltipable params:
                tooltipText: [concatStr, o([mul, [{ barVal:_ }, [me]], 100], "%")]
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherits HistogramNoneBaseBar.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramImplicit1DSetBar: {
        "class": o("HistogramImplicit1DSetBarDesign", "HistogramNoneBaseBar", superclass),
        context: {
            // override default definition of createTooltip. instead: createTooltip equals inMeNotInMySolutionSetBar
            createTooltip: [{ pointerInMeNotInMySolutionSetBar:_ }, [me]]                                                 
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherits HistogramNoneBaseBar.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramSolutionSetBar: o(
        { // default
            "class": o("HistogramSolutionSetBarDesign", "HistogramNoneBaseBar", superclass)
            // context: createTooltip: retains the default value provided by Tooltipable (unlike HistogramImplicit1DSetBar and HistogramBaseBar - see there
        },
        {
            qualifier: { firstInBin: true },
            position: {
                attachFirstSolutionSetBar: {
                    point1: {
                        element: [{ children: { baseBar:_ } }, [embedding]],
                        type: "top"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { lastInBin: true },
            position: {
                attachLastSolutionSetBar: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { baseBar:_ } }, [embedding]],
                        type: "bottom"
                    },
                    equals: 0
                }
            }
        }
    ),
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PrimaryWidget: {
        "class": superclass
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Widget: {
        "class": superclass
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayXWidget: {
        "class": o("PermOverlayXWidgetDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetItem: o(
        { // default
            "class": o("SolutionSetItemDesign", superclass),
            context: {
                color: [{ myOverlay: { color:_} }, [me]]
            }
        },
        {
            qualifier: { inEphExtOverlaySolutionSet: true },
            children: {
                solutionSetItemHandle: {
                    // We embed the SolutionSetItemHandle in the EmbeddingOfSolutionSetItemHandle and not in IconEmbedding because we want it to be clipped by the OverlaySolutionSetView
                    // when items are scrolled out of view - had it been embedded in the IconEmbedding (ScreenArea, by default), we wouldn't get that desired clipping effect.
                    partner: [areaOfClass, "EmbeddingOfSolutionSetItemHandle"], 
                    description: {
                        "class": "SolutionSetItemHandle"
                    }                           
                }
            }
        },
        {
            qualifier: { ofBlacklistOverlay: false,
                         inEphExtOverlaySolutionSet: true,
                         inArea: true },
            children: {
                addToBlacklistOverlayButton: {
                    description: {
                        "class": "SolutionSetItemBlacklistButton"
                    }                           
                }
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetXIntOSR: {
        "class": o("NonOMFacetXIntOSRDesign", superclass)
    },
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Common code to DeleteSelectionsControl and DisableSelectionsControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NonOMFacetXIntOverlayMoreControl: {
        "class": o(superclass, "TrackMyFacetXIntOSR"),
        context: {
            // Core::NonOMFacetXIntOverlayMoreControl param:
            mySelectableFacetXIntOverlay: [{ myFacetXIntOSR: { mySelectableFacetXIntOverlay:_ } }, [me]]
        },
        position: {
            "vertical-center": 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteSelectionsControl: {
        "class": o("DeleteSelectionsControlDesign", superclass),
        context: {
            // Core::DeleteSelectionsControl param: myFacetXIntOSR is provided by the inheritance of NonOMFacetXIntOverlayMoreControl
        },
        position: {
            right: [mul, 2, fsPosConst.marginAroundMoreControl]
        },
        write: { 
            onDeleteSelectionsControlMouseClick: {
                // upon: provided by Core::DeleteSelectionsControl
                true: {
                    closeFacetXIntOSRMoreControls: {  
                        to: [{ myFacetXIntOSR: { moreControlsOpen:_ } }, [me]],
                        merge: false
                    }
                }
            }
        }
    },  
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DisableSelectionsControl: {
        "class": o("DisableSelectionsControlDesign", superclass),
        position: {
            left: [mul, 2, fsPosConst.marginAroundMoreControl],
            attachHorizontallyToDeleteSelectionsControl: {
                point1: {
                    type: "right"
                },
                point2: { 
                    element: [{ children: { deleteSelectionsControl:_ } }, [embedding]],
                    type: "left"
                },
                equals: fsPosConst.marginAroundMoreControl
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the little black "x" that appears when hovering over a coselected solutionSetItem: a shortcut to add the item to the app-defined Blacklist overlay.
    // It is embedded in the SolutionSetItem.
    // 
    // the blacklist button adds an item to the blacklist - it does not necessarily remove the item from the embedding overlay. two scenarios to demonstrate this slightly subtle point:
    // 1. in an extensional overlay: 
    //    membership in an extensional overlay cannot be defined by membership (or unmembership) in other overlay's solutionSets, particularly not in the blacklist overlay.
    //    still, the Blacklist button on items of an extOverlay allow adding it to the Blacklist overlay (and after adding the item to the blacklist, it would remain in the embedding 
    //    extensional overlay).
    // 2. in an intensional overlay: 
    //    the item on whose blacklist button we clicked is added to the Blacklist overlay regardless of whether the user has by now removed the default exclusion of the Blacklist overlay's
    //    items from the solutionSet of an intensional overlay. that in effect to the item's Blacklist button being clicked on, and the item remaining in the solutionSet - a somewhat 
    //    unintuitive outcome!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetItemBlacklistButton: {
        "class": o("SolutionSetItemBlacklistButtonDesign", "BlockMouseEvent", "GeneralArea"),
        position: {
            "vertical-center": 0,
            rightConstraint: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ displayedUniqueIDFacet: true }, [areaOfClass, "Facet"]], 
                    type: "right"
                },
                equals: 10
            },
            width: 12, // replace with a display query
            height: 12 // replace with a display query
        },
        write: {
            onSolutionSetItemBlacklistButtonMouseEvent: {
                // the event has to be a MouseDown, and not a MouseUp/MouseClick: this provides the needed separation into two sequential timeslots: 
                // in the first, the item is blacklisted, and so removed from the solutionSet of the embeddingStar (intensional) overlay. 
                // If this is the firstInView's blacklist button, it will notify the embeddingStar OverlaySolutionSetView (which inherits VerticalSnappableController) to transition to a 
                // { docMoving: state } - that is the second timeslot. When it gets that MouseUp, the firstInView is recalculated.
                // by then, the areaSet, and the various relevant context labels (e.g. beginningOfDocPoint) in the SnappableController will be up to date. 
                // otherwise, if the firstInView is calculated in the same timeslot as the blacklisting of the item, the beginningOfDocPoint still indicates that the
                // item being blacklisted is the firstInView.
                "class": "OnMouseDown",
                true: {
                    addToBlacklistOverlay: { // the blacklist overlay will check if it's already included in it
                        to: [{ myApp: { blacklistOverlay: { content:_ } } }, [me]],                        
                        merge: push(
                            [ // adding only those uniqueIDs which aren't already in it.
                                n([{ myApp: { blacklistOverlay: { content:_ } } }, [me]]),
                                [{ uniqueID:_ }, [embedding]]
                            ]
                        )
                    }
                }
            }
        }
    }
};
