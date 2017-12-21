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
// intensional overlays that are moved to the AppFrame, take with them those overlays that take part in their definition, which do not already define a preexisting zoomBoxing
// overlay. these are defined as definingZoomBoxings.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <overlayDesignClasses.js>

var overlayClasses = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EmbeddingOfSolutionSetItemHandle: see documentation for class (briefly: it allows the coselected items' handles to extend beyond the items, while still scrolling out of view
    // when the associated item does).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlay: o(
        { // default
            "class": superclass,
            context: {
                visibleOverlayFrameWidth: fsAppPosConst.visibleOverlayFrameWidth
            }
        },
        {
            qualifier: { showSolutionSet: true },
            children: {
                embeddingOfSolutionSetItemHandle: { // see class documentation
                    description: {
                        "class": "EmbeddingOfSolutionSetItemHandle"
                    }
                }
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // state: 
    // This class includes a variant-controller to override the overlay's writable reference 'state' with a calculated value for "DefiningZoomBoxing".
    // If the state is "DefiningZoomBoxing", this class also calculates the ZoomBoxing that's associated with it - i.e. the ZoomBoxing overlay upon which we define.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermIntExtOverlay: {
        "class": superclass,
        context: {                
            // MoreControlsController params:
            immunityFromClosingMoreControlsAreaRefs: o([areaOfClass, "OSRControls"], [embeddedStar, [areaOfClass, "OSRControls"]], [areaOfClass, "FacetSelectionsHandle"]),
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermIntExtOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // the BFatPermIntExtOverlay class handles all other qualifiers for embedding of the VisibleOverlay
                otherCasesForEmbeddingVisibleOverlay: [and,
                                                       [equal,
                                                        "DefiningZoomBoxing", 
                                                        [{ state:_ }, [me]]
                                                       ],
                                                       [not, [{ appFrameMinimized:_ }, [me]]]
                                                      ],
                                                          
                // if so, state: "DefiningZoomBoxing"
                zoomBoxingIntOverlaysDefinedByMe: [
                                                  [{ overlaysDefiningMe: [me] }, [areaOfClass, "PermIntOverlay"]],
                                                  [{ myApp: { zoomBoxingOverlays:_ } }, [me]]
                                                 ]
            }
        },
        { // default
            "class": superclass
        },
        {
            qualifier: { otherCasesForEmbeddingVisibleOverlay: true },
            "class": "FatEmbedVisibleOverlay"           
        },
        {
            qualifier: { zoomBoxingIntOverlaysDefinedByMe: true },
            context: { 
                state: "DefiningZoomBoxing",
                
                // this overlay's myDefinedZoomBoxing is defined to be the zoomBoxing overlay layer that's closest to the GlobalBaseOverlay 
                // (i.e. farthest away from the current effectiveBaseOverlay) which is defined by this overlay.
                myDefinedZoomBoxing: [first, // first - i.e. the one that's closest to the GlobalBaseOverlay
                                      [{ zoomBoxingIntOverlaysDefinedByMe:_ }, [me]]
                                       ],
                // the baseSet of a DefiningZoomBoxing overlay is the solutionSet of its myDefinedZoomBoxing's prev in zoomBoxingOverlays.
                baseSetItems: [{ solutionSetItems:_ }, 
                               [prev,
                                [{ myApp: { zoomBoxingOverlays:_ } }, [me]],
                                [{ myDefinedZoomBoxing:_ }, [me]]
                               ]
                              ]
            }
        }       
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // myDefiningZoomBoxings: an os calculated when the overlay is in the ZoomBoxing state. the os is of the areaRef of its definingZoomBoxing overlays - i.e. those overlays for which 
    // its own areaRef is their myDefinedZoomBoxing. this os is used by the definingZoomBoxings to position themselves.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatPermIntOverlay: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { zoomBoxing: true },
            context: {
                myDefiningZoomBoxings: [{ 
                                            state: "DefiningZoomBoxing",
                                            myDefinedZoomBoxing: [me] 
                                        },
                                        [areaOfClass, "Overlay"]
                                       ]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EffectiveBaseOverlay: {
        "class": superclass,
        context: {
            solutionSetItems: [{ myApp: { lastZoomBoxingOverlay: { solutionSetItems:_ } } }, [me]],
            color: [{ myApp: { lastZoomBoxingOverlay: { color:_ } } }, [me]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingOverlay: {
        "class": superclass,
        context: {                              
            // the baseSet is the solutionSet of its prev in zoomBoxingOverlays.
            baseSetItems: [
                           { solutionSetItems:_ }, 
                           [prev,
                            [{ myApp: { zoomBoxingOverlays:_ } }, [me]],
                            [me]
                           ]
                          ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyOverlay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofDefiningZoomBoxingOverlay: [equal,
                                              "DefiningZoomBoxing", 
                                              [{ overlayState:_ }, [me]]
                                             ]
            }
        },
        { // default
            "class": superclass
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisibleOverlay: o(
        {
            "class": o("VisibleOverlayDesign", superclass),
        },
        {
            qualifier: { verticalVisibleOverlay: true },
            context: {
                spacingFromPrev: fsAppPosConst.verticalVisibleOverlaysSpacing // override value provided by VisibleOverlayLayout
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatVisibleOverlay: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { overlayState: "DefiningZoomBoxing" },
            "class": "DefiningZoomBoxingVisibleOverlay"
        }       
    ),
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingVisibleOverlay: o(
        { // default
            "class": superclass,
            context: {
                horizontalSpacingOfOSRs: 0 // override default provided by BZoomBoxingVisibleOverlay
            }
        },
        {
            qualifier: { firstInVisibleOverlaysPeerOS: true },
            position: { 
                attachOSROfFirstInVisibleOverlaysPeerOS: {
                    point1: [{ myView: { beginningOfOverlaysView:_ } }, [me]],
                    point2: {
                        element: [{ children: { oSR:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsAppPosConst.firstZooomBoxingOSRFromLeftOfView
                }
            }
        },
        {
            qualifier: { firstInVisibleOverlaysPeerOS: false },
            position: { 
                attachOSRToItsPrev: {
                    point1: {
                        // Note that ordering here is of the OSR, not the visible overlay - this is because the VisibleOverlay of a zoomboxing overlay showing its solutionSet
                        // extends all the way to the left.
                        element: [{ prevInPeerVisibleOverlaysOS: { children: { oSR:_ } } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { oSR:_ } }, [me]],
                        type: "left"
                    },
                    equals: [{ horizontalSpacingOfOSRs:_ }, [me]]
                }
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an addendum inherited by the VisibleOverlay class when the embedding overlay is in the DefiningZoomBoxing state
    // 
    // osOfPeerVisibleOverlays: unlike the zoomBoxed overlays, which calculate their osOfPeerVisibleOverlays off of the permOverlays, here we retrieve the group of peers, which will
    // be used to position this area, from the myDefinedZoomBoxing's myDefiningZoomBoxings os of areaRefs.
    //
    // each DefiningZoomBoxingVisibleOverlay is positioned at a fixed horizontal/vertical offset from its reference area: for the first DefiningZoomBoxingVisibleOverlay in an 
    // osOfPeerVisibleOverlays, the reference is its myDefinedZoomBoxing, and for the others it is their prev in osOfPeerVisibleOverlays.
    // note that we have an orGroups constraint for the positioning of the lastInVisibleOverlaysPeerOS - the lastInVisibleOverlaysPeerOS of the longest chain(s) of definingZoomBoxings
    // will attach itself to the GlobalBaseItemSet area - the orGroups is defined for all the lastInVisibleOverlaysPeerOS areas, i.e. of each and every zoomBoxing visible area which has
    // DefiningZoomboxers hanging off of it. one additional constraint in this orGroups is the one satisfied on application loading: the one attaching the AppFrame to FSApp's top - 
    // see AppFrame for the constraint definition.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DefiningZoomBoxingVisibleOverlay: o(
        { // default
            context: {
                myDefinedZoomBoxing: [{ myOverlay: { myDefinedZoomBoxing:_ } }, [me]],
                // for the VisibleOverlay variant controller context labels:                
                osOfPeerVisibleOverlays: [{ myDefinedZoomBoxing: { myDefiningZoomBoxings: { children: { visibleOverlay:_ } } } }, [me]]
            }
        },
        {
            qualifier: { firstInVisibleOverlaysPeerOS: true },
            position: {
                verticalAnchorToZoomBoxingOverlaysView: {
                    point1: {
                        type: "top"
                    },
                    point2: { 
                        element: [areaOfClass, "ZoomBoxingOverlaysView"],
                        type: "top"
                    },
                    equals: fsAppPosConst.verticalOffsetOfDefinedZoomBoxingFromReference
                },
                horizontalAnchorToMyDefinedZoomBoxing: {
                    point1: {
                        type: "left"
                    },
                    point2: { 
                        element: [{ myDefinedZoomBoxing: { children: { visibleOverlay: { children: { oSR:_ } } } } }, [me]],
                        type: "left"
                    },
                    equals: fsAppPosConst.horizontalOffsetOfDefinedZoomBoxingFromReference
                }
            },
            stacking: {
                belowAppFrame: {
                    lower: [me],
                    higher: [areaOfClass, "AppFrame"]
                }
            }
        },
        {
            qualifier: { firstInVisibleOverlaysPeerOS: false },
            position: {
                verticalAnchorToPrev: {
                    point1: {
                        type: "top"
                    },
                    point2: { 
                        element: [{ prevInPeerVisibleOverlaysOS:_ }, [me]],
                        type: "top"
                    },
                    equals: fsAppPosConst.verticalOffsetOfDefinedZoomBoxingFromReference
                },
                horizontalAnchorToPrev: {
                    point1: {
                        type: "left"
                    },
                    point2: { 
                        element: [{ prevInPeerVisibleOverlaysOS:_ }, [me]],
                        type: "left"
                    },
                    equals: fsAppPosConst.horizontalOffsetOfDefinedZoomBoxingFromReference
                }
            },
            stacking: {
                belowMyPrev: {
                    lower: [me],
                    higher: [{ prevInPeerVisibleOverlaysOS:_ }, [me]]
                }
            }
        },
        {
            qualifier: { lastInVisibleOverlaysPeerOS: true },
            position: {
                // using orGroups to attach either overlayAppFrame (when no definingZoomBoxings), or the lastOverlayDefiningZoomBoxing in the longest
                attachTopmostI: {
                    point1: { 
                        element: [areaOfClass, "GlobalBaseItemSet"], 
                        type: "top" 
                    },
                    point2: { 
                        type: "top" 
                    },  
                    equals: bFSAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "zoomBoxingsTopAnchor" }
                },
                belowGlobalBaseItemSetTop: { 
                    point1: { 
                        element: [areaOfClass, "GlobalBaseItemSet"], 
                        type: "top" 
                    },
                    point2: { 
                        type: "top" 
                    },
                    min: bFSAppPosConst.zooomBoxMinOffsetFromGlobalBaseItemSet
                }
            }
        }
    ),
       
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSR: {
        "class": o("OSRDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // If we're in a ZoomBoxing overlay other than the GlobalBaseOverlay, or in a DefiningZoomBoxing overlay, we embed various areas that provide the OSR with its "arrowy" look.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOSR: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { ofZoomBoxedOrTrashed: true, 
                         ofMaximizedOverlay: false },
            // createOverlayHandle is an appData defined in BFatOSR
            write: {  
                updateCreateOverlayHandle: {
                    upon: [and,
                           [areaOfClass, "TrashOverlayModalDialog"],
                           [not, [{ myOverlay: { moreControlsOpen:_ } }, [me]]],
                           o( 
                             [{ children: { oSRControls: { inArea:_ } } }, [me]],
                             [{ children: { overlayHandle: { inArea:_ } } }, [me]],
                             [{ children: { overlayHandle: { tmd:_ } } }, [me]]
                            )
                          ],
                    true: {
                        setCreateOverlayHandle: {
                            to: [{ createOverlayHandle:_ }, [me]],
                            merge: true
                        }
                    },
                    "false": {
                        setCreateOverlayHandle: {
                            to: [{ createOverlayHandle:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        { 
            qualifier: { ofExpandedOverlay: false, 
                         ofZoomBoxingOverlay: true },
            position: {
                // for ZoomBoxing overlay A, we give it a width that's oSRTriangleWidth shorter than the zoomBoxingOSRWidth, as either the next zoomBoxing overlay (B) - which provides A
                // with its tail of A's color, or the zooBoxer frame (in case A is also the effectiveBaseOverlay) will extend its width some more.
                width: [minus, bFSAppPosConst.defaultOSRWidth, fsAppPosConst.oSRTriangleWidth]
            }
        },
        {
            qualifier: { ofDefiningZoomBoxingOverlay: false },
            children: {
                oSRControls: {
                    description: {
                        "class": "FatOSRControls"
                    }
                }
            }
        },
        {
            qualifier: { ofZoomBoxingOverlay: true, 
                         ofGlobalBaseOverlay: false },
            children: {
                tail: {
                    description: {
                        "class": "TailOfZoomBoxingOSR"
                    }
                }
            }
        },
        {
            qualifier: { ofDefiningZoomBoxingOverlay: true },
            children: {
                topFin: {
                    description: {
                        "class": "TopFinOfDefiningZoomBoxingOSR"
                    }
                },
                bottomFin: {
                    description: {
                        "class": "BottomFinOfDefiningZoomBoxingOSR"
                    }
                },
                body: {
                    description: {
                        "class": "BodyOfDefiningZoomBoxingOSR"
                    }
                },
                head: { 
                    description: {
                        "class": "HeadOfDefiningZoomBoxingOSR"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The expressionOf parent is an OSR area. The referredOf, and embedding area is the IconEmbedding area.
    // 
    // It inherits: 
    // 1. AboveAppZTop, to place the handles above the App and its embeddedStar areas.
    // 2. Icon 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    OverlayHandle: {
        "class": o("OverlayHandleDesign", superclass),
        context: {
            // BOverlayHandle param:
            iAmIcon: true,    
            myOSR: [expressionOf],
            horizontalOffsetFromMyOSRLeft: fsAppPosConst.overlayHandleLeftToOSRLeft
        },
        children: {
            overlayHandle: { 
                "class": "PartnerWithIconEmbedding" // turns the overlayHandle child defined by BOverlayHandle into an intersection area
                // description: provided by BOverlayHandle
            }
        },
        position: {
            height: 30, // to be replaced by a display query
            width: 20 // to be replaced by a display query                                
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRControls: {
        "class": superclass,
        context: {
            embedSolutionSetViewControl: o(
                                           [{ ofLastZoomBoxingOverlay:_ }, [me]],
                                           [{ ofExpandedOverlay:_ }, [me]]                                              
                                          )
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Embed OverlayMinimizationControl / OverlayShowControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    LeanOSRControls: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { ofZoomBoxedOverlay: true,
                         inArea: true,
                         maximizedOverlayExists: false },
            children: {
                overlayMinimizationControl: {
                    description: {
                        "class": "OverlayMinimizationControl"
                    }
                },
                overlayShowControl: {
                    description: {
                        "class": "OverlayShowControl"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Embed OverlayMinimizationControl / OverlayShowControl / OverlayMoreControls (when the mouse hovers over the OSRControls)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FatOSRControls: o(
        { // variant-controller
            qualifier: "!",
            context: {
                embedMoreControls: [and,
                                    [{ ofZoomBoxedOverlay:_ }, [me]],
                                    o(
                                      [{ additionalOverlayControlsOpen:_ }, [me]],
                                      [{ inArea:_ }, [me]]
                                     )
                                   ]
            }
        },
        { // default
            "class": o(superclass, "TrackAppTrash"),
            position: {
                minLeftFromTailRight: { // there may not be a tail...
                    point1: { 
                        element: [{ children: { tail:_ } }, [embedding]],
                        type: "right"
                    },
                    point2: { 
                        type: "left"
                    },
                    min: 0
                },
                
                attachToEmbeddingLeftOrTailRightII: {
                    point1: { 
                        element: [{ children: { tail:_ } }, [embedding]],
                        type: "right"
                    },
                    point2: { 
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "oSRControlsLeft" }
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: false,
                         ofZoomBoxedOverlay: true,
                         inArea: true,
                         maximizedOverlayExists: false },
            children: {
                overlayMinimizationControl: {
                    description: {
                        "class": "OverlayMinimizationControl"
                    }
                },
                overlayShowControl: {
                    description: {
                        "class": "OverlayShowControl"
                    }
                }
            }
        },
        {
            qualifier: { embedMoreControls: true },
            children: {
                overlayMoreControls: {
                    description: {
                        "class": "OverlayMoreControls"
                    }
                }
            }
        }       
    ),
    
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                zoomBoxingButNotLast: [and,
                                       [{ ofZoomBoxingOverlay:_ }, [me]],
                                       [not, [{ ofLastZoomBoxingOverlay:_ }, [me]]]
                                      ]
            }
        },
        { // default
            "class": o("OverlayNameDesign", superclass),
            position: {
                height: 20, // to be replaced by a display query
                width: 90 // to be replaced by a display query
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true },
            position: {
                width: 110 // to be replaced by a display query
            }
        },      
        {
            qualifier: { zoomBoxingButNotLast: true },
            position: {
                left: bFSAppPosConst.bigMarginOnLeftOfOverlayName
            },
            write: {
                onOverlayNameMouseClick: {
                    "class": "OnMouseClick",
                    true: {    
                        popSuffixBeyondNewBaseFromZoomBoxingOverlaysOS: { // cut the tail of the zoomBoxingOverlaysByUser os beyond its new designated effectiveBaseOverlay
                            to: [{ myApp: { zoomBoxingOverlaysByUser:_ } }, [me]],
                            merge: [prevStar, 
                                    [{ myApp: { zoomBoxingOverlaysByUser:_ } }, [me]],
                                    [{ myOverlay:_ }, [me]]
                                   ]
                        }
                    }             
                }
            }
        }       
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlaySolutionSetCounter: {
        "class": o("OverlaySolutionSetCounterDesign", superclass),
        position: {
            height: 20, // replace with a display query
            width: 40 // replace with a display query
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SolutionSetViewControl: {
        "class": o("SolutionSetViewControlDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay state between expanded and minimized. It's embedded in the OSRControls, and as such it inherits OSRControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMinimizationControl: {
        "class": o("OverlayMinimizationControlDesign", superclass),
        position: {
            right: 0,
            bottom: 0,
            width: fsAppPosConst.overlayMinimizationControlWidth,
            height: fsAppPosConst.overlayMinimizationControlHeight
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the toggling of the overlay's Show state. It's embedded in the OSRControls, and as such it inherits OSRControl.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayShowControl: {
        "class": o("OverlayShowControlDesign", superclass),
        position: {
            "vertical-center": 0,
            rightConstraint: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ children: { overlayMinimizationControl:_ } }, [embedding]],
                    type: "left"
                },
                equals: fsAppPosConst.offsetFromShowControlToMoreControls
            },
            width: fsAppPosConst.overlayShowControlWidth,
            height: fsAppPosConst.overlayShowControlHeight
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the white triangle at the top-right corner of the OSRControls, which can open to display more controls.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMoreControls: o(
        { // default
            "class": superclass,
            context: {                
                otherOverlaysWithMoreControlsOpen: [
                                                    n([{ myOverlay:_ }, [me]]),
                                                    [{ moreControlsOpen: true }, [areaOfClass, "PermIntExtOverlay"]]                                                          
                                                   ]              
            },
            write: { 
                onOverlayMoreControlsMouseClick: {
                    upon: [and,
                             [{ subType: "Click" }, [myMessage]],
                             [not, [{ additionalOverlayControlsOpen:_ }, [me]]],
                             [{ otherOverlaysWithMoreControlsOpen:_ }, [me]]
                            ],
                    true: {
                        turnOffMoreControlsOpenOfOtherOverlays: {   
                            to: [{ otherOverlaysWithMoreControlsOpen: { moreControlsOpen:_ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: true },
            children: {
                leftSideDisplay: {
                    description: {
                        "class": "OverlayMoreControlsOpenDisplayDesign",
                        position: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 3
                        }
                    }
                },
                overlayMaximizationControl: {
                    description: {
                        "class": "OverlayMaximizationControl"
                    }
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: true,
                         maximizedOverlayExists: false },
            children: {
                overlayCopyControl: {
                    description: {
                        "class": "OverlayCopyControl"
                    }
                },
                overlayZoomBoxingControl: {
                    description: {
                        "class": "OverlayZoomBoxingControl"
                    }
                }
            },                
            position: {
                anchorZoomBoxingControlHorizontally: {
                    point1: {
                        element: [{ children: { overlayCopyControl:_ } }, [me]],
                        type: "right"                        
                    },
                    point2: {
                        element: [{ children: { overlayZoomBoxingControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                },
                anchorMaximizationControlHorizontally: {
                    point1: {
                        element: [{ children: { overlayZoomBoxingControl:_ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { overlayMaximizationControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: true,
                         maximizedOverlayExists: false,
                         ofBlacklistOverlay: false },
            children: {
                overlayTrashControl: {
                    description: {
                        "class": "OverlayTrashControl"
                    }
                }                   
            },                
            position: {
                anchorOverlayTrashControlHorizontally: {
                    point1: {
                        element: [{ children: { leftSideDisplay:_ } }, [me]],
                        type: "right"                        
                    },
                    point2: {
                        element: [{ children: { overlayTrashControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                },
                anchorOverlayCopyControlHorizontally: {
                    point1: {
                        element: [{ children: { overlayTrashControl:_ } }, [me]],
                        type: "right"                        
                    },
                    point2: {
                        element: [{ children: { overlayCopyControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: true,
                         maximizedOverlayExists: false,
                         ofBlacklistOverlay: true },
            position: {
                anchorOverlayCopyControlHorizontally: {
                    point1: {
                        element: [{ children: { leftSideDisplay:_ } }, [me]],
                        type: "right"                        
                    },
                    point2: {
                        element: [{ children: { overlayCopyControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                }
            }
        },
        {
            qualifier: { additionalOverlayControlsOpen: true,
                         maximizedOverlayExists: true },
            position: {
                anchorMaximizationControlHorizontally: {
                    point1: {
                        element: [{ children: { leftSideDisplay:_ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { overlayMaximizationControl:_ } }, [me]],
                        type: "left"
                    },
                    equals: fsPosConst.marginAroundMoreControl
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Common code to all classes embedded in the OverlayMoreControls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMoreControl: {
        "class": "OSRControl",
        position: {
            "vertical-center": 0,
            width: 20,
            height: 20
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayMaximizationControl: {
        "class": o("OverlayMaximizationControlDesign", superclass, "OverlayMoreControl")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayZoomBoxingControl: {
        "class": o("OverlayZoomBoxingControlDesign", superclass, "OverlayMoreControl"),
        context: {
            newZoomBoxingOverlayObj: [{ myOverlay:_ }, [me]] // in this case, all that's needed for the zoomBoxing overlay is its areaRef.
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayCopyControl: {
        "class": o("OverlayCopyControlDesign", superclass, "OverlayMoreControl")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayTrashControl: {
        "class": o("OverlayTrashControlDesign", superclass, "OverlayMoreControl")
    },  
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the PermOverlay when the showSolutionSet is true.
    // It creates an area that matches the SolutionSetView vertically, and the Overlay horizontally.
    // Coselected SolutionSetItems get a handle which is an intersection of the SolutionSetItem and this class, and is embedded in the latter - thus allowing the handle to extend
    // beyond the VisibleOverlay area, and to scroll out of view when the SolutionSetItem is scrolled out of view.  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbeddingOfSolutionSetItemHandle: {
        "class": o("GeneralArea", "TrackMyOverlay"),
        context: {
            mySolutionSetView: [
                                { myOverlay: [{ myOverlay:_ }, [me]] },
                                [areaOfClass, "OverlaySolutionSetView"]
                               ]
        },
        position: {
            left: 0,
            right: 0,
            topConstraint: {
                point1: { 
                    element: [{ mySolutionSetView:_ }, [me]],
                    type: "top",
                    content: true
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            bottomConstraint: {
                point1: { 
                    element: [{ mySolutionSetView:_ }, [me]],
                    type: "bottom",
                    content: true
                },
                point2: {
                    type: "bottom"
                },
                equals: 0
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Head/Tail areas (giving the DefiningZoomBoxing and the non-GlobalBaseOverlay zoomBoxing overlays their arrow-y look
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HeadOrTailOfOSR: {
        "class": o("GeneralArea", "TrackMyOverlay"),
        position: {
            top: 0,
            bottom: 0,
            width: fsAppPosConst.oSRTriangleWidth
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRTriangle: {
        "class": o("OSRTriangleDesign", "HeadOrTailOfOSR", "LeftSideTriangle"),
        position: {
            left: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TailOfZoomBoxingOSR: {
        "class": o("OSRTriangle"),
        context: {            
            myVisibleOverlay: [
                               [embeddingStar, [me]],
                               [areaOfClass, "VisibleOverlay"]
                              ],
            color: [{ myVisibleOverlay: { prevInPeerVisibleOverlaysOS: { myOverlay: { color:_ } } } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbeddedInDefiningZoomBoxingOSR: {
        "class": o("TrackMyOverlay", "GeneralArea"),
        context: {
            color: [{ myOverlay: { color:_ } }, [me]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FinOfDefiningZoomBoxingOSR: {
        "class": o("OSRTriangleDesign", "EmbeddedInDefiningZoomBoxingOSR"),
        position: {
            left: 0,
            width: [mul, 2, fsAppPosConst.oSRTriangleWidth],
            heightConstraint: {
                pair1: {
                    point1: { element: [embedding], type: "top" },
                    point2: { element: [embedding], type: "bottom" }
                },
                pair2: {
                    point1: { type: "top" },
                    point2: { type: "bottom" }
                },
                ratio: 0.5
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TopFinOfDefiningZoomBoxingOSR: {
        "class": o("FinOfDefiningZoomBoxingOSR", "TopSideTriangle"),
        position: {
            top: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BottomFinOfDefiningZoomBoxingOSR: {
        "class": o("FinOfDefiningZoomBoxingOSR", "BottomSideTriangle"),
        position: {
            bottom: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BodyOfDefiningZoomBoxingOSR: {
        "class": o("BackgroundOfDefiningZoomBoxingOSRDesign", "EmbeddedInDefiningZoomBoxingOSR"),
        position: {
            top: 0,
            bottom: 0,
            left: fsAppPosConst.oSRTriangleWidth,
            right: fsAppPosConst.oSRTriangleWidth
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HeadOfDefiningZoomBoxingOSR: {
        "class": o("BackgroundOfDefiningZoomBoxingOSRDesign", "HeadOrTailOfOSR"),
        context: {
            color: designConstants.globalBGColor
        },
        position: {
            right: 0
        },
        children: {
            arrow: {
                description: {
                    "class": "OSRTriangleInHeadOfDefiningZoomBoxing"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OSRTriangleInHeadOfDefiningZoomBoxing: {
        "class": o("OSRTriangle", "EmbeddedInDefiningZoomBoxingOSR"),
        position: {
            left: 0
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Head/Tail areas (giving the DefiningZoomBoxing and the non-GlobalBaseOverlay zoomBoxing overlays their arrow-y look
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
};
