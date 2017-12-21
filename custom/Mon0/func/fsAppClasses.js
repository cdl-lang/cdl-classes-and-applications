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

// %%classfile%%: <fsAppDesignClasses.js>

var fsAppClasses = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An overlay that is pushed onto it becomes the effectiveBaseOverlay, till it's either popped back out (thus becoming a zoomBoxed overlay), or till another overlay is pushed into the os above it,
    // and that new overlay becomes the effectiveBaseOverlay.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FSApp: {
        "class": o("FSAppDesign", superclass),
        context: {
            zoomBoxingOverlaysByApp: [{ globalBaseOverlay:_ }, [me]],
            zoomBoxingOverlays: o(
                                  [{ zoomBoxingOverlaysByApp:_ }, [me]],
                                  [{ zoomBoxingOverlaysByUser:_ }, [me]]
                                 ),
            
            visibleZoomBoxingOverlays: [{ zoomBoxingOverlays:_ }, [me]],
            
            overlayFormulaColors: o( // these define the subset which will be used to calculate new overlay colors:
                                    { uniqueID: fsAppConstants.primaryOverlayUniqueID, color: o(136, 166, 186)/*"#88a6ba"*/ },
                                    { uniqueID: 2, color: o(175, 147, 117)/*"#af9375"*/ }, 
                                    { uniqueID: 3, color: o(124, 181, 165)/*"#7cb5a5"*/ },        
                                    { uniqueID: 4, color: o( 244, 197, 155)/*"#F4C59B"*/ } 
                                   ),
            overlayCoreColors: o(
                                 { uniqueID: fsAppConstants.globalBaseOverlayUniqueID, color: o(204, 204, 204)/*"#cccccc"*/ },
                                 { uniqueID: fsAppConstants.defaultFavoritesUniqueID, color: o(247, 209, 175)/*"#f7d1af"*/ },
                                 { uniqueID: fsAppConstants.defaultBlacklistUniqueID, color: o(0, 0, 0)/*"#000000"*/ },
                                 { uniqueID: fsAppConstants.ephExtOverlayUniqueID, color: o(249, 237, 1)/*"#f9ed01"*/ },
                                 { uniqueID: fsAppConstants.ephIntOverlayUniqueID, color: o(249, 237, 1)/*"#f9ed01"*/ },
                                 [{ overlayFormulaColors:_ }, [me]]
                                )
        },
        stacking: {
            overlaysAboveOverlaysViews: {
                higher: [
                         { ofDefiningZoomBoxingOverlay: false },
                         [areaOfClass, "VisibleOverlay"]
                        ],
                lower: [areaOfClass, "OverlaysView"]
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovingFacetViewPane: {
        "class": superclass,
        children: {
            embeddingOfFacetHandles: {
                description: {
                    "class": "EmbeddingOfFacetHandles"
                }
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the MovingFacetViewPane. It covers its height, and on the horizontal axis extends as far as myApp.
    // The facet's reordering handles are an intersection between their associated facet and this area. This allows the handles to extend beyond the facet, to be masked by the left/right
    // of the MovingFacetViewPane, and to remain in existence even when the facets are scrolled out of view.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbeddingOfFacetHandles: {
        "class": "GeneralArea",
        position: {
            top: 0,
            bottom: 0,
            attachToLeftOfApp: {
                point1: { 
                    element: [{ myApp:_ }, [me]],
                    type: "left"
                },
                point2: { 
                    type: "left"
                },
                equals: 0
            },
            attachToRightOfApp: {
                point1: { 
                    type: "right"
                },
                point2: { 
                    element: [{ myApp:_ }, [me]],
                    type: "right"
                },
                equals: 0
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    GlobalBaseItemSet: {
        "class": o("GlobalBaseItemSetDesign", superclass),
        position: {
            top: fsAppPosConst.globalBaseItemSetTopMargin,
            attachToAppButtonsControlPanel: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [areaOfClass, "AppButtonsControlPanel"],
                    type: "top"
                },
                equals: fsAppPosConst.globalBaseItemSetBottomMargin
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppFrame: {
        "class": o(superclass),
        position: {
            attachTopmostI: {
                point1: { 
                    element: [embedding], 
                    type: "top" 
                },
                point2: { 
                    type: "top" 
                },
                equals: fsAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "zoomBoxingsTopAnchor" }
                // see additional constraints of this orGroups in the { lastInVisibleOverlaySubset: true } variant of DefiningZoomBoxingVisibleOverlay
            },
            belowGlobalBaseItemSetTop: { 
                point1: { 
                    element: [embedding],
                    type: "top" 
                },
                point2: { 
                    type: "top" 
                },
                min: fsAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet
            },                
            left: fsAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet,
            right: fsAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet,
            bottom: fsAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingOverlaysView: {
        "class": superclass,
        position: {
            topConstraint: {
                point1: {
                    type: "top"
                },
                point2: {
                    element: [areaOfClass, "AppFrame"],
                    type: "top"
                },
                equals: 0
            }           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBox: {
        "class": superclass,
        context: {
            defaultMaximizedZoomBoxedFrameWidth: fsAppPosConst.maximizedAppFrameWidth
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetViewPane: {
        "class": superclass,
        context: {
            offsetFromZoomBoxTop: 0 // override default provided by Core::FacetViewPane
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BottomView: {
        "class": superclass,
        context: {
            offsetFromBottom: fsAppPosConst.bottomViewsMarginFromBottomOfEmbedding // override value provided by BBottomView
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinimizedOverlaysView: {
        "class": o("MinimizedOverlaysViewDesign", superclass),
        context: {
            areaRefToAttachToAbove: [areaOfClass, "ExpandedFacetViewPane"],
            offsetFromAreaAttachedToAbove: fsAppPosConst.bottomViewFromFacetViewPane            
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    AppTrash: {
        "class": o("AppTrashDesign", superclass),
        context: {
            horizontalSpacingFromMinimizedOverlaysView: fsAppPosConst.horizontalOffsetMinimizedOverlaysViewToClosedAppTrash,
            verticalSpacingAboveAppTrash: fsAppPosConst.marginAboveOpenAppTrash
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppButtonsControlPanel: {
        "class": o(superclass, "MinWrapHorizontal"),
        context: {
            minWrapLeft: fsAppPosConst.horizontalMarginFromSidesOfAppButtonsControlPanel,
            minWrapRight: fsAppPosConst.horizontalMarginFromSidesOfAppButtonsControlPanel,
            height: fsAppPosConst.heightOfAppControlPanel
        },
        position: {
            bottom: fsAppPosConst.appButtonsControlPanelBottomMargin
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppControlPanelButton: o(
        { // default
            "class": o("AppControlPanelButtonDesign", superclass),
            context: {
                spacingFromPrev: fsAppPosConst.interControlPanelButtonsSpacing
            },
            position: {
                width: fsAppPosConst.tempControlPanelButtonWidth // to be replaced by a display query!
            }
        },
        {
            qualifier: { id: 1 },
            //"class": "FacetSummaryViewControl",
            "class": "FacetSummaryStateControl"
        },
        {
            qualifier: { id: 2 },
            "class": "FacetStandardStateControl"
        },
        {
            qualifier: { id: 3 },
            "class": "NewIntOverlayControl"
        },
        {
            qualifier: { id: 4 },
            "class": "NewExtOverlayControl"
        },
        {
            qualifier: { id: 5 },
            "class": "MoreOptionsControl"
        }       
    ),
 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryStateControl: {
        "class": superclass
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStandardStateControl: {
        "class": superclass
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryViewControl: o(
        { // default
            "class": o("FacetSummaryViewControlDesign", superclass),
            context: {
                displayText: [concatStr, o("Facet Summary View: ", [{ viewState:_ }, [me]])]
            }
        },
        {
            qualifier: { facetSummaryView: false },
            context: {
                viewState: "Off"
            }
        },
        {
            qualifier: { facetSummaryView: true },
            context: {
                viewState: "On"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewIntOverlayControl: {
        "class": superclass,
        context: {
            displayText: "New Intensional Overlay"
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewExtOverlayControl: {
        "class": superclass,
        context: {
            displayText: "New Extensional Overlay"
        }
    },
    
    /* nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreOptionsControl: {
        "class": superclass,
        context: {
            displayText: "More Options"
        }
    },*/        
};
