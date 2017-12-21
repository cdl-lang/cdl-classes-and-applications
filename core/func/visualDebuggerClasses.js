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

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

var vdConstants = {
    rowHeight: 16,
    
    selectorXAbsOffsetFromLeft: 10,
    selectorYAbsOffsetFromTop: 10,
    
    strongIndicationOpacity: 0.5, 
    weakIndicationOpacity: 0.3,
    
    textLineHeight: "120%"
};

var classes = {
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisualDebugger: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^visible": false,
                "^active": false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                "^inDockingStation": true,
                "^maximizedView": false,
                "^classNameSelected": "All",
                "^limitToSelector": true,
                "^memorizedAreaIds": o(),
                
                "^stableX": 0, // appData referenced by the VDDebuggableSelector
                "^stableY": 0, // appData referenced by the VDDebuggableSelector
                altShiftKey: "D" // OnAltShiftKey param
            },
            stacking: {
                vdAboveApp: {
                    higher: [me],
                    lower: o([areaOfClass, "App"], [areaOfClass, "ABTestsController"]),
                    priority: 2
                }
            },
            write: {
                onVisualDebuggerAltShiftD: {
                    "class": "OnAltShiftKey",
                    true: {
                        toggleVisible: {
                            to: [{ visible:_ }, [me]],
                            merge: [not, [{ visible:_ }, [me]]]
                        }
                    }
                },
                onVisualDebuggerVisible: {
                    upon: [{ visible:_ }, [me]],
                    true: {
                        activate: {
                            to: [{ active:_ }, [me]],
                            merge: true
                        },
                        outOfDockingStation: {
                            to: [{ inDockingStation:_ }, [me]],
                            merge: false
                        },
                        setSelectorStableX: {
                            to: [{ stableX:_ }, [me]],
                            merge: [offset,
                                    {
                                          element: [areaOfClass, "ScreenArea"], 
                                          type: "left" 
                                    },
                                    { 
                                          element: [pointer],
                                          type: "left"
                                    }
                                   ]
                        },
                        setSelectorStableY: {
                            to: [{ stableY:_ }, [me]],
                            merge: [offset,
                                    {
                                          element: [areaOfClass, "ScreenArea"], 
                                          type: "top" 
                                    },
                                    { 
                                          element: [pointer],
                                          type: "top"
                                    }
                                   ]
                        }                       
                    }
                }
            }
        },
        {
            qualifier: { visible: true },
            position: { // cdl workaround for #1155
                frame: 0
            },
            children: {
                selector: {
                    description: {
                        "class": "VDDebuggableSelector"
                    }
                }
            },
            write: {
                onVisualDebuggerEsc: {
                    "class": "OnEsc",
                    true: {
                        toggleVisible: {
                            to: [{ visible:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { visible: true,
                         active: true },
            context: {                
                "^debuggedAreaId": o(),
                debuggedAreaInfo: [debuggerAreaInfo, [{ debuggedAreaId:_ }, [me]]],
                // select of the app and its embeddedStar areas only those which inherit classNameSelected.
                // the VD and its embeddedStar are excluded, as they are not embedded in the App to begin with (VD and App are both embedded in ScreenArea)
                selectableAreaIds: [
                                    { 
                                          areaId:_,
                                          classes: [cond,
                                                    [equal,
                                                     [{ classNameSelected:_ }, [me]],
                                                     "All"
                                                    ],
                                                    o(
                                                      { on: false, use: [{ classNameSelected:_ }, [me]] },
                                                      { on: true, use: n() }
                                                     )
                                                   ]
                                    },                           
                                    [debuggerAreaInfo, 
                                     [
                                      n(
                                        o([areaOfClass, "VisualDebugger"], [embeddedStar, [areaOfClass, "VisualDebugger"]])
                                       ),
                                      o([{ myApp:_ }, [me]], [embeddedStar, [{ myApp:_ }, [me]]])
                                     ]
                                    ]
                                   ],
                debugAreaInfos: [{ children: { debugAreaInfos:_ } }, [me]],
                selectableAreaIdsOverlappingSelector: [
                                                       { 
                                                            areaId:_,
                                                            overlappingSelector: true
                                                       },
                                                       [{ debugAreaInfos:_ }, [me]]
                                                      ],
                selectedAreaIds: [cond,
                                  [{ limitToSelector:_ }, [me]],
                                  o(
                                    { on: true, use: [{ selectableAreaIdsOverlappingSelector:_ }, [me]] },
                                    { on: false, use: [{ selectableAreaIds:_ }, [me]] }
                                   )
                                 ],
                selectedDebugAreaInfos: [
                                         { areaId: [{ selectedAreaIds:_ }, [me]] }, 
                                         [{ debugAreaInfos:_ }, [me]]
                                        ],
                                                                   
                areaIdHoveredOver: [
                                    { 
                                         inArea: true,
                                         myAreaId:_
                                    },
                                    [areaOfClass, "VDAreaId"]
                                   ],
                                   
                embeddingOfDebugged: [{ debuggedAreaInfo: { embedding:_ } }, [me]],
                // when looking at the embedded, we have instead of a simple areaId, an object with an areaId attribute and a name attribute. 
                // so we need to project the areaId:
                embeddedOfDebugged: [{ debuggedAreaInfo: { embedded: { areaId:_ } } }, [me]], 
                expressionParentOfDebugged: [{ debuggedAreaInfo: { expressionParent:_ } }, [me]],
                referredParentOfDebugged: [{ debuggedAreaInfo: { referredParent:_ } }, [me]],
                expressionChildrenOfDebugged: [
                                               { 
                                                    expressionParent: [{ debuggedAreaId:_ }, [me]],
                                                    areaId:_
                                               },
                                               [{ debugAreaInfos:_ }, [me]]
                                              ],
                referredChildrenOfDebugged: [
                                             { 
                                                   referredParent: [{ debuggedAreaId:_ }, [me]],
                                                   areaId:_
                                             },
                                             [{ debugAreaInfos:_ }, [me]]
                                            ],
                                            
                siblingsOfDebugged: [{ embedded:_ }, [debuggerAreaInfo, [{ embeddingOfDebugged:_ }, [me]]]],
                nameOfDebuggedInEmbedding: [
                                            {
                                                  name:_,
                                                  areaId: [{ debuggedAreaId:_ }, [me]]
                                            },
                                            [{ siblingsOfDebugged:_ }, [me]]
                                           ],
                areaSetMembersOfDebugged: [
                                           {
                                                   name: [{ nameOfDebuggedInEmbedding:_ }, [me]],
                                                   areaId:_                                                
                                           },
                                           [{ siblingsOfDebugged:_ }, [me]]
                                          ],
                prevOfDebugged: [{ debuggedAreaInfo: { prev:_ } }, [me]],
                nextOfDebugged: [{ debuggedAreaInfo: { next:_ } }, [me]],                                         
                
                classesOfDebugged: [{ debuggedAreaInfo: { classes:_ } }, [me]],
                                              
                selectorAbsLeft: [offset,
                                  {
                                        element: [areaOfClass, "ScreenArea"],
                                        type: "left"
                                  },
                                  {
                                        element: [{ children: { selector:_ } }, [me]],
                                        type: "left",
                                        content: true
                                  }
                                 ],
                selectorAbsRight: [offset,
                                  {
                                        element: [areaOfClass, "ScreenArea"],
                                        type: "left"
                                  },
                                  {
                                        element: [{ children: { selector:_ } }, [me]],
                                        type: "right",
                                        content: true
                                  }
                                 ],
                selectorAbsTop: [offset,
                                  {
                                        element: [areaOfClass, "ScreenArea"],
                                        type: "top"
                                  },
                                  {
                                        element: [{ children: { selector:_ } }, [me]],
                                        type: "top",
                                        content: true
                                  }
                                 ],
                selectorAbsBottom: [offset,
                                  {
                                        element: [areaOfClass, "ScreenArea"],
                                        type: "top"
                                  },
                                  {
                                        element: [{ children: { selector:_ } }, [me]],
                                        type: "bottom",
                                        content: true
                                  }
                                 ]                                            
            },
            children: {
                debugAreaInfos: {
                    data: [{ selectableAreaIds:_ }, [me]],
                    description: {
                        "class": "DebugAreaInfo"
                    }
                },
                display: {
                    description: {
                        "class": "VDDisplay"
                    }
                }
            },          
            write: {
                onVisualDebuggerMemorizeAreaId: { 
                    upon: [and,
                           [{ msgType: "MemorizeAreaId" }, [myMessage]],
                           [not, 
                            [
                             [{ areaId:_ }, [myMessage]],
                             [{ memorizedAreaIds:_ }, [me]]
                            ]
                           ]
                          ],
                    true: { 
                        memorizeAreaId: {  
                            to: [{ memorizedAreaIds:_ }, [me]],
                            merge: push([{ areaId:_ }, [myMessage]])
                        }, 
                        openMemoryView: {
                            to: [{ collapsableViewOpen:_ }, [areaOfClass, "VDMemoryView"]],
                            merge: true
                        }
                    }               
                }               
            }           
        }
    ),
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is to be inherited by all areas embedded in the VD, to allow them easy access to its state, for their qualifiers and other needs.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackVisualDebugger: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inDockingStation: [{ visualDebugger: { inDockingStation:_ } }, [me]],
                limitToSelector: [{ visualDebugger: { limitToSelector:_ } }, [me]],

                visible: [{ visualDebugger: { visible:_ } }, [me]],
                active: [{ visualDebugger: { active:_ } }, [me]],
                maximizedView: [{ visualDebugger: { maximizedView:_ } }, [me]],

                debuggedAreaId: [{ visualDebugger: { debuggedAreaId:_ } }, [me]],
                
                debuggedEmbeddingExists: [{ visualDebugger: { embeddingOfDebugged:_ } }, [me]],
                debuggedEmbeddedExists: [{ visualDebugger: { embeddedOfDebugged:_ } }, [me]],
                
                debuggedIsIntersection: [{ visualDebugger: { expressionParentOfDebugged:_ } }, [me]],
                embeddingIsAlsoExpressionParent: [equal,
                                                  [{ visualDebugger: { expressionParentOfDebugged:_ } }, [me]],
                                                  [{ visualDebugger: { embeddingOfDebugged:_ } }, [me]]
                                                 ],             
                debuggedIsExpressionParent: [{ visualDebugger: { expressionChildrenOfDebugged:_ } }, [me]],
                debuggedIsReferredParent: [{ visualDebugger: { referredChildrenOfDebugged:_ } }, [me]],
                
                debuggedIsInAreaSet: [equal,
                                      "areaSet",
                                      [{ visualDebugger: { debuggedAreaInfo: { childType:_ } } }, [me]]
                                     ],
                debuggedFirstInAreaSet: [and,
                                         [{ debuggedIsInAreaSet:_ }, [me]],
                                         [not, [{ visualDebugger: { prevOfDebugged:_ } }, [me]]]
                                        ],
                debuggedLastInAreaSet: [and,
                                        [{ debuggedIsInAreaSet:_ }, [me]],
                                        [not, [{ visualDebugger: { nextOfDebugged:_ } }, [me]]]
                                       ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                visualDebugger: [areaOfClass, "VisualDebugger"]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The area that represents the output of [debuggerAreaInfo] on a single areaId of an area in the app
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugAreaInfo: {
        "class": o("GeneralArea", "TrackVisualDebugger"),
        context: {
            debugObj: [debuggerAreaInfo, [{ param: { areaSetContent:_ } }, [me]]],
            areaId: [{ debugObj: { areaId:_ } }, [me]],
            classes: [{ debugObj: { classes:_ } }, [me]],
            expressionParent: [{ debugObj: { expressionParent:_ } }, [me]],
            referredParent: [{ debugObj: { referredParent:_ } }, [me]],
            
            debuggableAbsLeft: [{ debugObj: { position: { absLeft:_ } } }, [me]],
            debuggableAbsRight: [plus,
                            [{ debugObj: { position: { absLeft:_ } } }, [me]],
                            [{ debugObj: { position: { width:_ } } }, [me]]
                           ],
            debuggableAbsTop: [{ debugObj: { position: { absTop:_ } } }, [me]],
            debuggableAbsBottom: [plus,
                             [{ debugObj: { position: { absTop:_ } } }, [me]],
                             [{ debugObj: { position: { height:_ } } }, [me]]
                            ],
            overlappingSelector: [and,
                                  [lessThanOrEqual,
                                   [{ debuggableAbsLeft:_ }, [me]],
                                   [{ visualDebugger: { selectorAbsRight:_ } }, [me]]
                                  ],
                                  [greaterThanOrEqual,
                                   [{ debuggableAbsRight:_ }, [me]],
                                   [{ visualDebugger: { selectorAbsLeft:_ } }, [me]]
                                  ],
                                  [lessThanOrEqual,
                                   [{ debuggableAbsTop:_ }, [me]],
                                   [{ visualDebugger: { selectorAbsBottom:_ } }, [me]]
                                  ],
                                  [greaterThanOrEqual,
                                   [{ debuggableAbsBottom:_ }, [me]],
                                   [{ visualDebugger: { selectorAbsTop:_ } }, [me]]
                                  ]
                                 ], 
                                             
            debuggableWidth: [{ debugObj: { position: { width:_ } } }, [me]],
            debuggableHeight: [{ debugObj: { position: { height:_ } } }, [me]],
            debuggableDimensions: [mul,
                                   [{ debuggableWidth:_ }, [me]],
                                   [{ debuggableHeight:_ }, [me]]
                                  ],
            debuggableZeroDimensions: [equal,
                                       0,
                                       [{ debuggableDimensions:_ }, [me]]
                                      ],
            debuggableLogDimensions: [cond,
                                      [{ debuggableZeroDimensions:_ }, [me]],
                                      o(
                                        { on: true, use: -1 },
                                        { on: false, use: [log10, [{ debuggableDimensions:_ }, [me]]] }
                                       )
                                     ]       
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDVisualIndicationOfNonZeroSizeDebuggable: o(
        { // variant-controller
            qualifier: "!",
            context: {              
                coversEntireApp: [and,
                                  [equal,
                                   [{ myDebugAreaInfo: { debuggableWidth:_ } }, [me]],
                                   [{ myAppDebugAreaInfo: { debuggableWidth:_ } }, [me]]
                                  ],
                                  [equal,
                                   [{ myDebugAreaInfo: { debuggableHeight:_ } }, [me]],
                                   [{ myAppDebugAreaInfo: { debuggableHeight:_ } }, [me]]
                                  ]
                                 ],
                hoveringOverMyVDAreaId: [{ myVDAreaId: { inArea:_ } }, [me]],
                weakIndication: [and,
                                 [{ myVDAreaId: { beingDebugged:_ } }, [me]],
                                 [not, [{ hoveringOverMyVDAreaId:_ }, [me]]]
                                ],
                strongIndication: [{ hoveringOverMyVDAreaId:_ }, [me]]                          
            }
        },
        { // default
            "class": o("GeneralArea", "TrackVisualDebugger"),
            context: {
                myVDAreaId: [expressionOf],
                myAreaId: [{ myVDAreaId: { myAreaId:_ } }, [me]],
                myDebugAreaInfo: [{ myVDAreaId: { myDebugAreaInfo:_ } }, [me]],
                myAppDebugAreaInfo: [
                                     { areaId: [{ areaId:_ }, [debuggerAreaInfo, [{ myApp:_ }, [me]]]] },
                                     [{ visualDebugger: { debugAreaInfos:_ } }, [me]]
                                    ]
            },
            embedding: "referred",
            independentContentPosition: false,
            stacking: {
                indicationAboveMyVDAreaId: {
                    higher: [me],
                    lower: [{ myVDAreaId:_ }, [me]]
                }
            },
            display: {
                background: "grey",
                pointerOpaque: false
            },
            position: {
                left: [{ myDebugAreaInfo: { debuggableAbsLeft:_ } }, [me]],
                top: [{ myDebugAreaInfo: { debuggableAbsTop:_ } }, [me]],
                width: [{ myDebugAreaInfo: { debuggableWidth:_ } }, [me]],
                height: [{ myDebugAreaInfo: { debuggableHeight:_ } }, [me]]
            }
        },
        {
            qualifier: { hoveringOverMyVDAreaId: true,
                         coversEntireApp: false },
            stacking: {
                // above the VD so that it shows the debugged indication even when the area is below the VD itself! but do this only if the Debuggable is not the size of entire screen.
                indicationAboveVD: {
                    higher: [me],
                    lower: [{ myVDAreaId: { visualDebugger:_ } }, [me]],
                    priority: 2 // to beat out the priority: 1 in AboveAppZTop
                }
            }
        },
        {
            qualifier: { weakIndication: true },
            display: {
                opacity: vdConstants.weakIndicationOpacity
            }
        },
        {
            qualifier: { strongIndication: true },
            display: {
                opacity: vdConstants.strongIndicationOpacity
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggableSelector: o(
        { // default
            "class": o("Border", "GeneralArea", "ConfinedToArea", "Draggable", "BlockMouseEvent", "TrackVisualDebugger"),
            context: {
                // Border Params:
                borderColor: "red",
                borderWidth: 2,
                
                // Draggable Params: 
                draggableStable: true,
                initializeStableDraggable: [{ inDockingStation:_ }, [me]],
                draggableInitialX: vdConstants.selectorXAbsOffsetFromLeft,
                draggableInitialY: vdConstants.selectorYAbsOffsetFromTop,
                draggableHorizontalAnchor: atomic({ type: "horizontal-center" }),
                draggableVerticalAnchor: atomic({ type: "vertical-center" }),
                // stableX/stableY are used as writableRef here. the appData is in the VisualDebugger, as we record these values when the 
                // VDDebuggableSelector is created
                stableX: [{ visualDebugger: { stableX:_ } }, [me]], 
                stableY: [{ visualDebugger: { stableY:_ } }, [me]]
            },
            position: {
                width: 10,
                height: 10          
            },
            write: {
                onVDDebuggableSelectorCtrlMouseClick: {
                    "class": "OnCtrlMouseClick",
                    true: {
                        returnVisualDebuggerToDockingStation: {
                            to: [{ inDockingStation:_ }, [me]],
                            merge: true
                        },
                        deActivateVisualDebugger: {
                            to: [{ active:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { inDockingStation: true },
            write: {
                onVDDebuggableSelectorMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        noLongerInDockingStation: {
                            to: [{ inDockingStation:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { inDockingStation: false },
            write: {
                onVDDebuggableSelectorNoCtrlClick: {
                    "class": "OnNoCtrlMouseClick",
                    true: {
                        toggleVisualDebugger: {
                            to: [{ active:_ }, [me]],
                            merge: [not, [{ active:_ }, [me]]]
                        }
                    }
                }           
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of VDDisplay and its embedded classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDisplay: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                zeroSizeDebuggableOfAreaIdHoveredOver: [
                                                         { 
                                                            areaId: [{ visualDebugger: { areaIdHoveredOver:_ } }, [me]],
                                                            debuggableZeroDimensions: true
                                                         },
                                                         [areaOfClass, "DebugAreaInfo"]
                                                        ]
            }
        },
        { // default 
            "class": o("GeneralArea", "Draggable", "BlockMouseEvent", "TrackVisualDebugger"),
            context: {
                draggableStable: true
            },
            position: {
                defineBottomOfControlsRegion: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        label: "bottomOfControlsRegion"
                    },
                    equals: 20
                }
            },
            display: {
                background: "#ECC3BF"
            },
            children: {
                closeControl: {
                    description: {
                        "class": "VDDisplayCloseControl"
                    }                   
                },
                helpControl: {
                    description: {
                        "class": "VDDisplayHelpControl"
                    }
                },
                maximizeViewControl: {
                    description: {
                        "class": "VDDisplayMaximizationControl"
                    }
                },
                selectionView: {
                    description: {
                        "class": "VDSelectionView"
                    }
                },
                memoryView: {
                    description: {
                        "class": "VDMemoryView"
                    }
                },
                debuggedView: {
                    description: {
                        "class": "VDDebuggedView"
                    }
                }
            }
        },
        {
            qualifier: { maximizedView: false },
            "class": "ExpandableBottomRight",
            stacking: {
                belowSelector: {
                    higher: [{ children: { selector:_ } }, [embedding]],
                    lower: [me]
                }
            },
            context: {
                initialExpandableWidth: 400,
                initialExpandableHeight: 400
            }
        },
        {
            qualifier: { maximizedView: true },
            "class": "MatchArea",
            context: {
                match: [areaOfClass, "ScreenArea"]
            },
            stacking: {
                aboveSelector: {
                    higher: [me],
                    lower: [{ children: { selector:_ } }, [embedding]]
                }
            }
        },
        {
            qualifier: { zeroSizeDebuggableOfAreaIdHoveredOver: true },
            children: {
                zeroSizeDebuggableVisualIndication: {
                    description: {
                        "class": "VDVisualIndicationOfZeroSizeDebuggable"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this is an indication representing a debuggable with zero size. it is embeddedStar in the VDDisplay, and not in the Debuggable, as the latter has 0 size...
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDVisualIndicationOfZeroSizeDebuggable: { 
        "class": o("DefaultDisplayText", "DisplayDimension", "GeneralArea", "TrackVisualDebugger"),
        context: {          
            displayText: "This area has 0 size"
        },
        position: {
            left: 0,
            bottom: 0
        }
    },
      
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDisplayHelpControl: {
        "class": o("GeneralArea"),
        position: {
            attachToExpandControl: {
                point1: { type: "right" },
                point2: { element: [areaOfClass, "VDDisplayMaximizationControl"], type: "left" },
                equals: 5
            },
            top: 0,
            width: 30,
            height: 20
        },
        display: {   
            html: { 
                // target VDHelp so that this opens in a new tab
                value: "<a href='https://docs.google.com/document/d/1XIPoX3u20-RJBDsNvLpUrxj3Pja41eGPuua9LyuFFwI/edit?usp=sharing' target='VDHelp'>Help</a>",
                fontFamily: "Roboto",
                fontSize: 11,
                color: "black"
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDisplayCloseControl: {
        "class": o("OnHoverFrameDesign", "GeneralArea", "TrackVisualDebugger"),         
        position: {
            width: 15,
            height: 15,
            left: 2,
            top: 2
        },
        display: {
            image: {
                src: "%%image:(closeControl.svg)%%",
                size: "100%"                
            }
        },          
        write: { 
            onVDDisplayCloseControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    turnVisibleOff: {
                        to: [{ visible:_ }, [me]],
                        merge: false
                    }
                }
            }  
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDisplayMaximizationControl: o(        
        {
            "class": o("OnHoverFrameDesign", "GeneralArea", "TrackVisualDebugger"),         
            position: {
                width: 15,
                height: 15,
                right: 2,
                top: 2
            },
            display: {
                image: {
                    src: "%%image:(expandIcon.png)%%"
                }
            },          
            write: {
                onVDDisplayMaximizationControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleMaximizationControl: {
                            to: [{ maximizedView:_ }, [me]],
                            merge: [not, [{ maximizedView:_ }, [me]]]
                        }
                    }
                }  
            }
        },
        {
            qualifier: { maximizedView: true },
            display: {  
                background: designConstants.defaultBorderColor
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Selection View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDSelectionView: {
        "class": o("VDTitle", "TrackVisualDebugger"),
        context: {
            title: "Area Selection"
        },
        position: {
            topConstraint: {
                point1: {
                    element: [embedding],
                    label: "bottomOfControlsRegion"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            left: 0,
            right: 0
        },
        children: {
            classSelector: {
                description: {
                    "class": "VDClassSelector"
                }
            },
            selectedAreasView: {
                description: {
                    "class": "VDSelectedDebuggablesView"
                }
            }
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDClassSelector: {
        "class": o("BottomBorder", "GeneralArea", "VDRowPosition", "TrackVisualDebugger"),
        position: {
            topConstraint: {
                point1: { 
                    element: [{ children: { title:_ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        },
        children: {
            text: {
                description: {
                    "class": "VDText",
                    context: {
                        displayText: "Selected Class Name:"
                    }
                }
            },
            className: {
                description: {
                    "class": "VDNameOfClassSelected"
                }
            },
            limitToSelector: {
                description: {
                    "class": "VDLimitToSelector"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDNameOfClassSelected: {
        "class": o("TextUnderline", "DefaultDisplayText", "TextInput", "DisplayDimension", "GeneralArea", "TrackVisualDebugger", "VDPositionRightOfMyText"),
        context: {
            displayText: [{ visualDebugger: { classNameSelected:_ } }, [me]]
        },
        position: {
            top: 0,
            bottom: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDLimitToSelector: o(
        { // default
            "class": o("Border", "GeneralArea", "BiStateButton", "TrackVisualDebugger"),
            context: {
                checked: [{ limitToSelector:_ }, [me]],
                
                // Border params:
                borderColor: "red",
                borderWidth: 2
            },
            position: {
                "vertical-center": 0,
                height: 10,
                width: 10,
                rightOfNameOfClass: {
                    point1: {
                        element: [{ children: { className:_ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 2
                }
            }           
        },
        {
            qualifier: { limitToSelector: true },
            children: {
                dot: {
                    description: {
                        "class": o("Circle", "BackgroundColor"),
                        context: {
                            radius: 2,
                            backgroundColor: designConstants.defaultBorderColor
                        },
                        position: {
                            "class": "AlignCenterWithEmbedding"
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. vdAreaIds: an os of areaIds of debuggable areas. This controller will create a VDAreaIdInAS for each one of those.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdASWrapAroundController: o(
        { // default
            "class": o("GeneralArea", "TrackVisualDebugger"),     
            position: {
                right: 0,
                top: 0,
                bottom: 0
            },      
            children: {
                vdAreaIds: {
                    data: [{ vdAreaIds:_ }, [me]],
                    description: {
                        "class": "VDAreaIdInAS"
                    }
                }
            }       
        },
        {
            qualifier: { vdAreaIds: true },
            "class": "HorizontalWrapAroundController",          
            context: {
                // HorizontalWrapAroundController params: 
                wrapArounds: [{ children: { vdAreaIds:_ } }, [me]],
                wrapAroundSpacing: 5,
                wrapAroundSecondaryAxisSpacing: 2       
            }
        },
        {
            qualifier: { vdAreaIds: false },
            "class": "DefaultDisplayText",          
            context: {
                displayText: "N/A"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDSelectedDebuggablesView: o(
        { // default
            "class": o("GeneralArea", "VDCollapsableView"),
            context: {
                // VDCollapsableView params
                collapsableViewInitiallyOpen: true,
                collapsableViewClosedText: "Selected Areas",
                areaAboveMe: [{ children: { classSelector:_ } }, [embedding]]
            },
            position: {
                bottom: 0
            },
            display: {
                borderWidth: 3
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            children: {
                selectedDebuggablesDisplay: {
                    description: {
                        "class": "VDSelectedDebuggables"
                    }
                }
            },
            position: {
                heightConstraint: {
                    pair1: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    pair2: { 
                        point1: { element: [areaOfClass, "VDDisplay"], type: "top" },
                        point2: { element: [areaOfClass, "VDDisplay"], type: "bottom" }
                    },
                    ratio: 6
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: false },
            position: {
                height: vdConstants.rowHeight
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDSelectedDebuggables: {
        "class": o("EmbeddedInCollapsableView", "VDAreaIdASWrapAroundController"),
        context: {          
            selectedDebugAreaInfosByDimensions: o(
                                                  [{ debuggableLogDimensions:  Rco(0, 1) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rco(1, 2) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rco(2, 3) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rco(3, 4) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rco(4, 5) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rco(5, 6) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]],
                                                  [{ debuggableLogDimensions:  Rcc(6, 7) }, [{ visualDebugger: { selectedDebugAreaInfos:_ } }, [me]]]
                                                 ),
            vdAreaIds: [{ selectedDebugAreaInfosByDimensions: { areaId:_ } }, [me]]
        },
        position: {
            // left provided by EmbeddedInCollapsableView
            // other sides by VDAreaIdASWrapAroundController
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Selection View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Memory View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDMemoryView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                memoryNotEmpty: [{ visualDebugger: { memorizedAreaIds:_ } }, [me]]
            }
        },
        { // default
            "class": "VDCollapsableView",
            context: {
                // VDCollapsableView params:
                collapsableViewInitiallyOpen: false,
                collapsableViewClosedText: "AreaRef Memory",
                areaAboveMe: [{ children: { selectionView:_ } }, [embedding]]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            children: {
                memorizedDebuggablesDisplay: {
                    description: {
                        "class": "VDMemorizedDebuggables"
                    }
                }
            },
            position: {
                height: 50
            }
        },
        {
            qualifier: { collapsableViewOpen: false },
            "class": "Tooltipable",
            context: {
                tooltipText: "To store an areaRef here: Ctrl+M when hovering over it"
            },
            position: {
                height: vdConstants.rowHeight
            }
        },
        {
            qualifier: { memoryNotEmpty: true },
            context: {
                // VDCollapsableView params: override the value provided in the default clause above
                collapsableViewClosedText: [concatStr, o("AreaRef Memory: (", [size, [{ visualDebugger: { memorizedAreaIds:_ } }, [me]]], ")")]
            },
            children: {
                clearMemoryControl: {
                    description: {
                        "class": "VDClearMemoryControl"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDMemorizedDebuggables: {
        "class": o("EmbeddedInCollapsableView", "VDAreaIdASWrapAroundController"),
        context: {
            vdAreaIds: [{ visualDebugger: { memorizedAreaIds:_ } }, [me]]
        },
        position: {
            // left provided by EmbeddedInCollapsableView
            // other sides by VDAreaIdASWrapAroundController
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDClearMemoryControl: {
        "class": o("ButtonDesign", "DelicateRoundedCorners", "Border", "DisplayDimension", "GeneralArea", "AboveSiblings", "BlockMouseEvent", "TrackVisualDebugger"),
        context: {
            displayText: "Clear"
        },
        position: {
            right: 2,
            top: 2
        },
        write: {
            onVDClearMemoryControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    clearMemory: {
                        to: [{ visualDebugger: { memorizedAreaIds:_ } }, [me]],
                        merge: o()
                    },
                    closeView: {
                        to: [{ collapsableViewOpen:_ }, [embedding]],
                        merge: false
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An icon created by a memorized VDAreaId, when hovered over.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdUnmemorizeControl: {
        "class": o("ButtonDesign", "Border", "TrackVisualDebugger", "Icon"),
        context: {
            myMemorizedVDAreaId: [expressionOf],
            displayText: "X"
        },
        display: {
            background: designConstants.globalBGColor,
            text: {
                color: "red"
            }
        },
        position: {
            width: 12, height: 12, // till we regain display queries available.
            attachToMyMemorizedVDAreaIdVertically: {
                point1: {
                    type: "vertical-center"
                },
                point2: {
                    element: [{ myMemorizedVDAreaId:_ }, [me]],
                    type: "vertical-center"
                },
                equals: 0
            },
            attachToMyMemorizedVDAreaIdHorizontally: {
                point1: {
                    type: "horizontal-center"
                },
                point2: {
                    element: [{ myMemorizedVDAreaId:_ }, [me]],
                    type: "left"
                },
                equals: 0
            }           
        },
        stacking: {
            aboveMyMemorizedVDAreaId: {
                higher: [me],
                lower: [{ myMemorizedVDAreaId:_ }, [me]],
                priority: 1
            }
        },
        write: {
            onVDAreaIdUnmemorizeControlMouseDown: {
                "class": "OnMouseDown",
                true: {
                    unmemorizeAreaId: {
                        to: [
                            [{ myMemorizedVDAreaId: { myAreaId:_ } }, [me]],
                            [{ myMemorizedVDAreaId: { visualDebugger: { memorizedAreaIds:_ } } }, [me]]
                        ],
                        merge: o()
                    }       
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Memory View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Debugged View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedView: o(
        { // default
            "class": "TrackVisualDebugger",
            position: {
                topConstraint: {
                    point1: {
                        element: [{ children: { memoryView:_ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0
                },
                bottom: vdConstants.rowHeight,
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { debuggedAreaId: true },
            "class": "VDTitle",
            context: {
                title: "Debugged Area"
            },
            children: {
                debuggedAncestryTree: {
                    description: {
                        "class": "VDDebuggedAncestryTreeView"
                    }
                },
                debuggedClassOfAreaView: {
                    description: {
                        "class": "VDDebuggedClassOfAreaView"
                    }
                },
                debuggedPositionView: {
                    description: {
                        "class": "VDDebuggedPositionView"
                    }
                },
                debuggedDisplayView: {
                    description: {
                        "class": "VDDebuggedDisplayView"
                    }
                }/*,
                debuggedContextView: {
                    description: {
                        "class": "VDDebuggedContextView"
                    }
                }*/
            }           
        },
        {
            qualifier: { debuggedIsInAreaSet: true },
            children: {
                debuggedParamView: {
                    description: {
                        "class": "VDDebuggedParamView"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of VD Ancestry Tree Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedAncestryTreeView: o(
        { // default
            "class": o("BottomBorder", "VDCollapsableView"),
            context: {
                // VDCollapsableView params: 
                collapsableViewInitiallyOpen: true,
                areaAboveMe: [{ children: { title:_ } }, [embedding]]
            },
            children: {
                ancestryTreeDisplay: {
                    description: {
                        "class": "VDDebuggedAncestryTree"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedAncestryTree: o(
        { // default
            "class": o("TrackVisualDebugger", "EmbeddedInCollapsableView", "MinWrapVertical"),
            children: {
                debuggedAreaRefDisplay: {
                    description: {
                        "class": "VDDebuggedAreaRefDisplay"
                    }
                }
            },
            position: {
                top: 0,
                right: 0,
                bottom: 0
            }
        },      
        { 
            qualifier: { collapsableViewOpen: true,
                         debuggedEmbeddingExists: true },
            children: {
                debuggedEmbeddingAreaRefDisplay: {
                    description: {
                        "class": "VDDebuggedEmbeddingAreaRefDisplay"
                    }
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: true,
                         debuggedEmbeddedExists: true },
            children: {
                debuggedEmbeddedAreaRefDisplay: {
                    description: {
                        "class": "VDDebuggedEmbeddedAreaRefDisplay"
                    }
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: true,
                         debuggedIsExpressionParent: true },
            children: {
                expressionChildrenOfDebuggedDisplay: {
                    description: {
                        "class": "VDAreaIdsDebuggedIsExpressionOfDisplay"
                    }
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: true,
                         debuggedIsReferredParent: true },
            children: {
                referredParentOfDebuggedDisplay: {
                    description: {
                        "class": "VDAreaIdsDebuggedIsReferredOfDisplay"
                    }
                }
            }
        } 
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedAreaRefDisplay: o(
        { // default
            "class": o("TrackVisualDebugger", "EmbeddedInCollapsableView", "VDRowPosition"),
            children: {
                text: {
                    description: {
                        "class": "VDText",
                        context: {
                            displayText: "Debugged:"
                        },
                        position: {
                            width: 80
                        }
                    }
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: false },
            position: {
                top: 0 // for collapsableViewOpen: true the constraint of the top posPoint for this area is defined by VDDebuggedEmbeddingAreaRefDisplay.
            }
        },
        {
            qualifier: { debuggedAreaId: true },
            children: {
                vdAreaRef: {
                    description: {
                        "class": "VDDebugged"
                    }
                }
            }
        },
        {
            qualifier: { debuggedEmbeddingExists: true },
            children: {
                embeddedIndicator: {
                    description: {
                        "class": "VDLeftSideTreeVisualIndicator",
                        position: {
                            "vertical-center": 0
                        }
                    }
                }
            },
            position: {
                attachVisualEmbeddedIndicatorToEmbeddingAreaRef: {
                    point1: {
                        element: [
                                  { children: { embeddingAreaRef:_ } }, 
                                  [{ children: { debuggedEmbeddingAreaRefDisplay:_ } }, [embedding]]
                                 ],
                        type: "horizontal-center"
                    }, 
                    point2: {
                        element: [{ children: { embeddedIndicator:_ } }, [me]],
                        type: "horizontal-center"
                    },
                    equals: 0
                },
                attachVisualEmbeddedIndicatorToAreaRef: {
                    point1: {
                        element: [{ children: { embeddedIndicator:_ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { vdAreaRef:_ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        }, 
        {
            qualifier: { debuggedIsIntersection: true },
            children: {
                xsectionParentIndicator: {
                    description: {
                        "class": "VDRightSideTreeVisualIndicator",
                        position: {
                            "vertical-center": 0
                        }
                    }
                }
            },
            position: {
                attachDebuggedAreaRefToVisualIndicator: {
                    point1: {
                        element: [{ children: { vdAreaRef:_ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { xsectionParentIndicator:_ } }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                attachVisualIndicatorToxsectionParentOfDebugged: {
                    point1: {
                        element: [{ children: { xsectionParentIndicator:_ } }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        element: [{ children: { debuggedEmbeddingAreaRefDisplay: { children: { xsectionParentOfDebugged:_ } } } }, [embedding]],
                        type: "left"
                    }, 
                    equals: 0
                }
            }
        },
        {
            qualifier: { debuggedIsInAreaSet: true,
                         debuggedFirstInAreaSet: false },
            children: {
                vdPrevOfDebuggedAreaRefDisplay: {
                    description: {
                        "class": "VDPrevOfDebuggedAreaRefDisplay"
                    }
                }
            }
        },
        {
            qualifier: { debuggedIsInAreaSet: true,
                         debuggedLastInAreaSet: false },
            children: {
                vdNextOfDebuggedAreaRefDisplay: {
                    description: {
                        "class": "VDNextOfDebuggedAreaRefDisplay"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebugged: o(
        { // default
            "class": o("VDAreaId", "TrackVisualDebugger"),
            context: {
                myAreaId: [{ debuggedAreaId:_ }, [me]]
            },
            position: {
                top: 0
            }
        },
        {
            qualifier: { debuggedEmbeddingExists: false },
            "class": "VDPositionRightOfMyText"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDNeighborOfDebuggedInAreaSet: {
        "class": o("VDAreaId", "VDPositionRightOfMyText"),
        position: {
            top: 0,
            right: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. text: the text displayed by the embedded text area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDNeighborOfDebuggedAreaRefDisplay: {
        "class": "TrackVisualDebugger",
        children: {
            text: {
                description: {
                    "class": "VDText",
                    context: {
                        displayText: [concatStr, o([{ text:_ }, [embedding]], ":")]
                    },
                    position: {
                        width: 30
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDPrevOfDebuggedAreaRefDisplay: {
        "class": "VDNeighborOfDebuggedAreaRefDisplay",
        context: {
            text: "Prev"
        },
        children: {
            prevAreaRef: {
                description: {
                    "class": "VDPrevOfDebugged"
                }
            }
        },
        position: {
            top: 0,
            bottom: 0,
            leftConstraint: {
                point1: {
                    element: [{ children: { vdAreaRef:_ } }, [embedding]],
                    type: "right"
                },
                point2: { 
                    type: "left"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDPrevOfDebugged: {
        "class": "VDNeighborOfDebuggedInAreaSet",
        context: {
            myAreaId: [{ visualDebugger: { prevOfDebugged:_ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDNextOfDebuggedAreaRefDisplay: {
        "class": "VDNeighborOfDebuggedAreaRefDisplay",
        context: {
            text: "Next"
        },
        children: {
            nextAreaRef: {
                description: {
                    "class": "VDNextOfDebugged"
                }
            }
        },
        position: {
            top: 0,
            bottom: 0,
            leftConstraint: {
                point1: { 
                    element: [cond,
                              [{ debuggedFirstInAreaSet:_ }, [me]],
                              o(
                                { on: false, use: [{ children: { vdPrevOfDebuggedAreaRefDisplay:_ } }, [embedding]] },
                                { on: true, use: [{ children: { vdAreaRef:_ } }, [embedding]] }
                               )
                             ],
                    type: "right"
                },
                point2: { 
                    type: "left"
                },
                equals: 0
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDNextOfDebugged: {
        "class": "VDNeighborOfDebuggedInAreaSet",
        context: {
            myAreaId: [{ visualDebugger: { nextOfDebugged:_ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedEmbeddingAreaRefDisplay: o(
        { // default
            "class": o("TrackVisualDebugger", "VDRowPosition"),
            position: {
                top: 0, 
                attachToDebuggedDisplay: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { debuggedAreaRefDisplay:_ } }, [embedding]],
                        type: "top"
                    },
                    equals: 0
                }
            },
            children: {
                text: {
                    description: {
                        "class": "VDText",
                        context: {
                            displayText: "Embedding:"
                        },
                        position: {
                            width: 80
                        }
                    }
                },
                embeddingAreaRef: {
                    description: {
                        "class": "VDEmbedding"
                    }
                }
            }
        },
        {
            qualifier: { debuggedIsIntersection: true },
            children: {
                xsectionParentOfDebugged: {
                    description: {
                        "class": "VDIntersectionParentOf"
                    }
                },
                expressionOfMarker: {
                    description: {
                        "class": "VDExpressionOfMarker"
                    }
                },
                referredOfMarker: {
                    description: {
                        "class": "VDReferredOfMarker"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDEmbedding: {
        "class": o("VDAreaId", "VDPositionRightOfMyText"),
        context: { 
            myAreaId: [{ visualDebugger: { embeddingOfDebugged:_ } }, [me]]
        },
        position: {
            top: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDIntersectionParentOf: o(
        {
            "class": "VDAreaId",
            position: {
                top: 0
                // horizontal constraint provided by the xsectionParentIndicator in the VDDebuggedAreaRefDisplay.
            }
        },
        {
            qualifier: { embeddingIsAlsoExpressionParent: true },
            context: {
                myAreaId: [{ visualDebugger: { referredParentOfDebugged:_ } }, [me]]
            }
        },
        {
            qualifier: { embeddingIsAlsoExpressionParent: false }, // i.e. the embedding area is also the referredOf
            context: {
                myAreaId: [{ visualDebugger: { expressionParentOfDebugged:_ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDIntersectionParentOfMarker: o(
        { // default
            "class": o("DefaultDisplayText", "GeneralArea", "TrackVisualDebugger"),
            position: {         
                top: 0,
                bottom: 0,
                width: 20
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionNextToEmbeddingAreaRef: {
        position: {
            positionNextToEmbeddingAreaRef: {
                point1: {
                    element: [{ children: { embeddingAreaRef:_ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                }
            } 
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionNextToNonEmbeddingXSectionParentAreaRef: {
        position: {
            positionNextToNonEmbeddingXSectionParentAreaRef: {
                point1: {
                    element: [{ children: { xsectionParentOfDebugged:_ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                }
            } 
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDExpressionOfMarker: o(
        { // default
            "class": "VDIntersectionParentOfMarker",
            context: { 
                displayText: "Exp"
            }
        },
        { 
            qualifier: { embeddingIsAlsoExpressionParent: true },
            "class": "PositionNextToEmbeddingAreaRef"
        },
        { 
            qualifier: { embeddingIsAlsoExpressionParent: false },
            "class": "PositionNextToNonEmbeddingXSectionParentAreaRef"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDReferredOfMarker: o(
        { // default
            "class": "VDIntersectionParentOfMarker",
            context: { 
                displayText: "Ref"
            }
        },
        { 
            qualifier: { embeddingIsAlsoExpressionParent: true },
            "class": "PositionNextToNonEmbeddingXSectionParentAreaRef"
        },
        { 
            qualifier: { embeddingIsAlsoExpressionParent: false },
            "class": "PositionNextToEmbeddingAreaRef"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedEmbeddedAreaRefDisplay: {
        "class": o("GeneralArea", "TrackVisualDebugger", "VDRowPosition", "AttachToAreaAboveMe"),
        context: {
            areaAboveMe: [{ children: { debuggedAreaRefDisplay:_ } }, [embedding]]
        },
        position: {
            height: 40, // override VDRowPosition
            attachVisualEmbeddedIndicatorToDebuggedAreaRef: {
                point1: { 
                    element: [{ children: { debuggedAreaRefDisplay: { children: { vdAreaRef:_ } } } }, [embedding]],
                    type: "horizontal-center"
                }, 
                point2: {
                    element: [{ children: { embeddedIndicator:_ } }, [me]],
                    type: "horizontal-center"
                },
                equals: 0
            },
            attachVisualEmbeddedIndicatorToDebuggedEmbeddedAreaRefContainer: {
                point1: { 
                    element: [{ children: { embeddedIndicator:_ } }, [me]],
                    type: "right"
                }, 
                point2: {
                    element: [{ children: { container:_ } }, [me]],             
                    type: "left"
                },
                equals: 0
            }
        },
        children: {
            text: {
                description: {
                    "class": "VDText",
                    context: {
                        displayText: "Embedded:"
                    },
                    position: {
                        width: 80
                    }
                }
            },
            embeddedIndicator: {
                description: {
                    "class": "VDLeftSideTreeVisualIndicator",
                    position: {
                        midVerticalOfText: {
                            point1: { 
                                element: [{ children: { text:_ } }, [embedding]],
                                type: "vertical-center"
                            },
                            point2: {
                                type: "vertical-center"
                            },
                            equals: 0
                        }
                    }
                }
            },
            container: {
                description: {
                    "class": "VDDebuggedEmbeddedAreaRefContainer"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedEmbeddedAreaRefContainer: {
        "class": o("TrackVisualDebugger", "VDAreaIdASWrapAroundController"),
        context: {
            // VDAreaIdASWrapAroundController param
            vdAreaIds: [{ visualDebugger: { embeddedOfDebugged:_ } }, [me]]
        },
        position: {
            // left posPoint constraint defined in embedding area.
            // other points defined by VDAreaIdASWrapAroundController
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdsDebuggedIsExpressionOfDisplay: o(
        { // default
            "class": o("GeneralArea", "TrackVisualDebugger", "VDRowPosition", "AttachToAreaAboveMe"),
            children: {
                text: {
                    description: {
                        "class": "VDText",
                        context: {
                            displayText: "expParent of:"
                        },
                        position: {
                            width: 80
                        }
                    }
                },
                container: {
                    description: {
                        "class": "VDAreaIdsDebuggedIsExpressionOfContainer"
                    }
                }
            }
        },
        {
            qualifier: { debuggedEmbeddedExists: true },
            context: {
                areaAboveMe: [{ children: { debuggedEmbeddedAreaRefDisplay:_ } }, [embedding]]
            }
        },
        {
            qualifier: { debuggedEmbeddedExists: false },
            context: {
                areaAboveMe: [{ children: { debuggedAreaRefDisplay:_ } }, [embedding]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdsDebuggedIsExpressionOfContainer: {
        "class": o("TrackVisualDebugger", "VDAreaIdASWrapAroundController"),
        context: {
            // VDAreaIdASWrapAroundController param
            vdAreaIds: [{ visualDebugger: { expressionChildrenOfDebugged:_ } }, [me]]
        },
        position: {
            attachLeftToRightOfText: {
                point1: { 
                    element: [{ children: { text:_ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            }
            // other points defined by VDAreaIdASWrapAroundController
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdsDebuggedIsReferredOfDisplay: {
        "class": o("GeneralArea", "TrackVisualDebugger", "VDRowPosition"),
        children: {
            text: {
                description: {
                    "class": "VDText",
                    context: {
                        displayText: "refParent of:"
                    },
                    position: {
                        width: 80
                    }
                }
            },
            container: {
                description: {
                    "class": "VDAreaIdsDebuggedIsReferredOfContainer"
                }
            }
        },
        position: {
            attachToDisplayAboveIt: { // provide a min constraint to the three possible *Display areas above it, instead of checking what it actually is..
                point1: {
                    element: o(
                               [areaOfClass, "VDAreaIdsDebuggedIsExpressionOfDisplay"],
                               [areaOfClass, "VDDebuggedEmbeddedAreaRefDisplay"],
                               [areaOfClass, "VDDebuggedAreaRefDisplay"]
                              ),
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                min: 0
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdsDebuggedIsReferredOfContainer: {
        "class": o("TrackVisualDebugger", "VDAreaIdASWrapAroundController"),
        context: {
            // VDAreaIdASWrapAroundController param 
            vdAreaIds: [{ visualDebugger: { referredChildrenOfDebugged:_ } }, [me]]
        },
        position: {
            attachLeftToRightOfText: {
                point1: { 
                    element: [{ children: { text:_ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            }
            // other points defined by VDAreaIdASWrapAroundController
        }
    },
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDTreeVisualIndicator: {
        "class": o("Border", "TrackVisualDebugger"),
        position: {
            width: 10,
            height: 6
        },
        display: {
            borderTopWidth: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDLeftSideTreeVisualIndicator: {
        "class": "VDTreeVisualIndicator",
        display: {
            borderRightWidth: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDRightSideTreeVisualIndicator: {
        "class": "VDTreeVisualIndicator",
        display: {
            borderLeftWidth: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of VD Ancestry Tree Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedClassOfAreaView: o(
        { 
            "class": o("VDCollapsableScrollableView"),
            context: {
                // VDCollapsableScrollableView params
                collapsableViewClosedText: "Classes",           
                areaAboveMe: [{ children: { debuggedAncestryTree:_ } }, [embedding]],
                collapsableViewInitiallyOpen: true
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            position: {
                heightConstraint: {
                    pair1: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    pair2: { 
                        point1: { element: [areaOfClass, "VDDisplay"], type: "top" },
                        point2: { element: [areaOfClass, "VDDisplay"], type: "bottom" }
                    },
                    ratio: 6
                }
            },
            children: {
                docInCollapsableView: { // called docInCollapsableView, in compliance with VDCollapsableScrollableView API
                    description: {
                        "class": "VDDebuggedClassOfAreaDoc"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedClassOfAreaDoc: {
        "class": o("VDDocInCollapsableView", "HorizontalWrapAroundController"),
        context: {
            sortedClassesOfDebugged: [{ visualDebugger: { classesOfDebugged:_ } }, [me]],
            // WrapAroundController param:
            wrapArounds: [{ children: { classNames:_ } }, [me]],
            wrapAroundSpacing: 5,
            wrapAroundSecondaryAxisSpacing: 2
        },
        position: {
            minHeight: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                min: 0
            },
            attachTopToFirstClassName: {
                point1: { type: "top" },
                point2: { 
                    element: [first, [{ children: { classNames:_ } }, [me]]],
                    type: "top"
                },
                equals: 0
            },
            attachBottomToLastClassName: {
                point1: { type: "bottom" },
                point2: { 
                    element: [last, [{ children: { classNames:_ } }, [me]]],
                    type: "bottom"
                },
                equals: 0
            }
        },
        children: {
            classNames: {
                data: [{ sortedClassesOfDebugged:_ }, [me]],
                description: {
                    "class": "VDDebuggedClassName"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedClassName: o(
        { // default
            "class": o("DefaultDisplayText", "GeneralArea", "DisplayDimension", "BlockMouseEvent", "WrapAround", "TrackVisualDebugger"),
            context: {
                displayText: [{ param: { areaSetContent:_ } }, [me]]
            }
        },
        {
            qualifier: { inArea: true },
            "class": "Border",
            write: {
                onVDDebuggedClassNameMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        updateClassNameSelected: {
                            to: [{ visualDebugger: { classNameSelected:_ } }, [me]],
                            merge: [{ param: { areaSetContent:_ } }, [me]]
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedParamView: o(
        { 
            "class": o("VDCollapsableScrollableViewOfObj"),
            context: {
                // VDCollapsableScrollableView param
                collapsableViewClosedText: "Param",            
                areaAboveMe: [{ children: { debuggedDisplayView:_ } }, [embedding]]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            position: {
                height: vdConstants.rowHeight
            },
            children: {
                docInCollapsableView: { // called docInCollapsableView, in compliance with VDCollapsableScrollableView API
                    description: {
                        "class": "VDDebuggedParamDoc"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedParamDoc: {
        "class": "VDDocObjInCollapsableView",
        context: { 
            docObj: [{ visualDebugger: { debuggedAreaInfo: { areaSetContent:_ } } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedPositionView: o(
        { // default 
            "class": "VDCollapsableScrollableViewOfObj",
            context: {
                // VDCollapsableScrollableView param
                collapsableViewClosedText: "Position",
                areaAboveMe: [{ children: { debuggedClassOfAreaView:_ } }, [embedding]]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            position: {
                height: 80
            },
            children: {
                docInCollapsableView: { // called docInCollapsableView, in compliance with VDCollapsableScrollableView API
                    description: {
                        "class": "VDDebuggedPositionDoc"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedPositionDoc: o(
        {
            "class": o("DefaultDisplayText", "VDDocInCollapsableView"),
            context: {
                positionObj: [
                    { visualDebugger: { debuggedAreaInfo: { position:_ } } },
                    [me]
                ],
                lineHeight: vdConstants.textLineHeight,
                contentLeft: [{positionObj: { relContentLeft: _}}, [me]],
                contentPosText: "",
                displayText: [concatStr, 
                              o(
                                  "absLeft: ",
                                  [{ positionObj: { absLeft:_ } }, [me]],
                                  " absTop: ",
                                  [{ positionObj: { absTop:_ } }, [me]],
                                  "\n",
                                  "relLeft: ",
                                  [{ positionObj: { relLeft:_ } }, [me]],
                                  " relTop: ",
                                  [{ positionObj: { relTop:_ } }, [me]],
                                  "\n",
                                  "height: ",
                                  [{ positionObj: { height:_ } }, [me]],
                                  " width: ",
                                  [{ positionObj: { width:_ } }, [me]],
                                  [{ contentPosStr:_ }, [me]]
                              )
                             ]
            },
            position: {
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { contentLeft: true },
            context: {
                contentPosStr: [concatStr,
                                o(
                                    "\n",
                                    "relContentLeft: ",
                                    [
                                        {positionObj: { relContentLeft: _ } },
                                        [me]
                                    ],
                                    " relContentTop: ",
                                    [
                                        {positionObj: { relContentTop: _ } },
                                        [me]
                                    ],
                                    "\n",
                                    "contentWidth: ",
                                    [
                                        {positionObj: { contentWidth: _ } },
                                        [me]
                                    ],
                                    " contentHeight: ",
                                    [
                                        {positionObj: { contentHeight: _ } },
                                        [me]
                                    ]
                                )
                               ]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedDisplayView: o(
        { // default 
            "class": "VDCollapsableScrollableViewOfObj",
            context: {
                // VDCollapsableScrollableView param
                collapsableViewClosedText: "Display",
                areaAboveMe: [{ children: { debuggedPositionView:_ } }, [embedding]]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            position: {
                height: 60
            },
            children: {
                docInCollapsableView: { // called docInCollapsableView, in compliance with VDCollapsableScrollableView API
                    description: {
                        "class": "VDDebuggedDisplayDoc"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedDisplayDoc: {
        "class": o("DefaultDisplayText", "VDDocInCollapsableView"),
        context: {
            displayObj: [{ visualDebugger: { debuggedAreaInfo: { display:_ } } }, [me]],
            lineHeight: vdConstants.textLineHeight,
            displayText: [concatStr, 
                          o(
                            [displayDefined, [{ displayObj: { background:_ } }, [me]], "Background"],
                            [displayDefined, [{ displayObj: { opacity:_ } }, [me]], "Opacity"],
                            [displayDefined, [{ displayObj: { background: { image:_ } } }, [me]], "\nImage"],
                            [displayDefined, [{ displayObj: { background: { repeat:_ } } }, [me]], "\nRepeat"],

                            [displayDefined, 
                             o(
                               [{ displayObj: { borderWidth:_ } }, [me]],
                               [{ displayObj: { borderTopWidth:_ } }, [me]],
                               [{ displayObj: { borderBottomWidth:_ } }, [me]],
                               [{ displayObj: { borderLeftWidth:_ } }, [me]],
                               [{ displayObj: { borderRightWidth:_ } }, [me]]
                              ),
                             "\nBorder"
                            ],
                            [displayDefined, [{ displayObj: { borderWidth:_ } }, [me]], "BorderWidth"],
                            [displayDefined, [{ displayObj: { borderTopWidth:_ } }, [me]], "BorderTopWidth"],
                            [displayDefined, [{ displayObj: { borderBottomWidth:_ } }, [me]], "BorderBottomWidth"],
                            [displayDefined, [{ displayObj: { borderLeftWidth:_ } }, [me]], "BorderLeftWidth"],
                            [displayDefined, [{ displayObj: { borderRightWidth:_ } }, [me]], "BorderRightWidth"],
                            [displayDefined, [{ displayObj: { borderColor:_ } }, [me]], "BorderColor"],
                            [displayDefined, [{ displayObj: { borderStyle:_ } }, [me]], "BorderStyle"],
                            [displayDefined, [{ displayObj: { borderRadius:_ } }, [me]], "BorderRadius"],
                            
                            [displayDefined, [{ displayObj: { boxShadow:_ } }, [me]], "\nBoxShadow"],
                            [displayDefined, [{ displayObj: { boxShadow: { inset:_ } } }, [me]], "Inset"],
                            [displayDefined, [{ displayObj: { boxShadow: { color:_ } } }, [me]], "Color"],
                            [displayDefined, [{ displayObj: { boxShadow: { horizontal:_ } } }, [me]], "Horizontal"],
                            [displayDefined, [{ displayObj: { boxShadow: { vertical:_ } } }, [me]], "Vertical"],
                            [displayDefined, [{ displayObj: { boxShadow: { blurRadius:_ } } }, [me]], "BlurRadius"],
                            [displayDefined, [{ displayObj: { boxShadow: { spread:_ } } }, [me]], "Spread"],

                            [displayDefined, [{ displayObj: { text:_ } }, [me]], "\nText"],
                            [displayDefined, [{ displayObj: { text: { value:_ } } }, [me]], "Value"],
                            [displayDefined, [{ displayObj: { text: { fontSize:_ } } }, [me]], "Font Size"],
                            [displayDefined, [{ displayObj: { text: { fontStyle:_ } } }, [me]], "Font Style"],
                            [displayDefined, [{ displayObj: { text: { fontWeight:_ } } }, [me]], "Font Weight"],
                            [displayDefined, [{ displayObj: { text: { fontFamily:_ } } }, [me]], "Font Family"],
                            [displayDefined, [{ displayObj: { text: { textDecoration:_ } } }, [me]], "Text Decoration"],
                            [displayDefined, [{ displayObj: { text: { color:_ } } }, [me]], "Color"],
                            [displayDefined, [{ displayObj: { text: { textAlign:_ } } }, [me]], "Align"],
                            [displayDefined, [{ displayObj: { text: { lineHeight:_ } } }, [me]], "Line Height"],
                            [displayDefined, [{ displayObj: { text: { numericFormat: { type:_ } } } }, [me]], "Numeric Format Type"],
                            [displayDefined, [{ displayObj: { text: { numericFormat: { numberOfDigits:_ } } } }, [me]], "Number of Digits"],                            

                            [displayDefined, [{ displayObj: { html:_ } }, [me]], "\nHTML"],
                            [displayDefined, [{ displayObj: { html: { value:_ } } }, [me]], "Value"],
                            [displayDefined, [{ displayObj: { html: { fontSize:_ } } }, [me]], "Font Size"],
                            [displayDefined, [{ displayObj: { html: { fontStyle:_ } } }, [me]], "Font Style"],
                            [displayDefined, [{ displayObj: { html: { fontWeight:_ } } }, [me]], "Font Weight"],
                            [displayDefined, [{ displayObj: { html: { fontFamily:_ } } }, [me]], "Font Family"],
                            [displayDefined, [{ displayObj: { html: { textDecoration:_ } } }, [me]], "Text Decoration"],
                            [displayDefined, [{ displayObj: { html: { color:_ } } }, [me]], "Color"],
                            [displayDefined, [{ displayObj: { html: { textAlign:_ } } }, [me]], "Align"],
                            [displayDefined, [{ displayObj: { html: { lineHeight:_ } } }, [me]], "Line Height"],
                            [displayDefined, [{ displayObj: { html: { numericFormat: { type:_ } } } }, [me]], "Numeric Format Type"],
                            [displayDefined, [{ displayObj: { html: { numericFormat: { numberOfDigits:_ } } } }, [me]], "Number of Digits"],                            
                            
                            [displayDefined, [{ displayObj: { image:_ } }, [me]], "\nImage"],
                            [displayDefined, [{ displayObj: { image: { src:_ } } }, [me]], "Source"],
                            
                            [displayDefined, [{ displayObj: { triangle:_ } }, [me]], "\nTriangle"],
                            [displayDefined, [{ displayObj: { triangle: { baseSide:_ } } }, [me]], "BaseSide"],
                            [displayDefined, [{ displayObj: { triangle: { color:_ } } }, [me]], "Color"]
                           )
                         ]
        },
        position: {
            top: 0,
            bottom: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedContextView: o(
        { // default 
            "class": "VDCollapsableScrollableViewOfObj",
            context: {
                // VDCollapsableScrollableView param
                collapsableViewClosedText: "Context",
                areaAboveMe: [{ children: { debuggedDisplayView:_ } }, [embedding]]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            position: {
                bottom: 0
            },
            children: {
                docInCollapsableView: { // called docInCollapsableView, in compliance with VDCollapsableScrollableView API
                    description: {
                        "class": "VDDebuggedContextDoc"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDebuggedContextDoc: { 
        "class": o("VDDocObjInCollapsableView"),
        context: {
            docObj: [{ visualDebugger: { debuggedAreaInfo:_ } }, [me]]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Debugged View Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. The inheriting class should embed an area that inherits VDDocInCollapsableView. 
    // 2. collapsableViewClosedText - see CollapsableView
    // 3. AttachToAreaAboveMe API
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDCollapsableScrollableView: o(
        { // default
            "class": o("BottomBorder", "GeneralArea", "CollapsableViewWithScrollableDocument", "AttachToAreaAboveMe", "TrackVisualDebugger"),
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { collapsableViewOpen: false },
            position: {
                height: vdConstants.rowHeight 
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. temporary: initialDocLength (till we once again have display queries). default value: 1000.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDCollapsableScrollableViewOfObj: {
        "class": "VDCollapsableScrollableView",
        context: {
            // in the absence of display queries, i have this hack, that allows the user to extend the length of the doc..
            initialDocLength: 1000, 
            "^docLength": [{ initialDocLength:_ }, [me]]
        },
        write: {
            // more support for the height hack (which fills in for the missing display queries): every time we click on a VDAreaId, reset the height
            onMouseDownOnVDAreaId: {
                upon: [mouseDownNotHandledBy,
                       [areaOfClass, "VDAreaId"]
                      ],
                true: {
                    resetDocLength: {
                        to: [{ docLength:_ }, [me]],
                        merge: [{ initialDocLength:_ }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDCollapsableView: {
        "class": o("BottomBorder", "TrackVisualDebugger", "CollapsableView", "AttachToAreaAboveMe"),
        position: {
            left: 0,
            right: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. DocInCollapsableView API
    // 2. Inheriting area should set its height
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDocInCollapsableView: {
        "class": o("TrackVisualDebugger", "DocInCollapsableView")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // To be inherited when the doc represents an object (e.g. context, param, etc.)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDDocObjInCollapsableView: {
        "class": o("VDDocInCollapsableView"),
        context: {            
            docObj: "< provide a doc>"  
        },
        position: {
            height: [{ docLength:_ }, [embedding]]
        },
        display: { 
            html: { 
                value: [debugNodeToStr, [{ docObj:_ }, [me]]],
                fontFamily: "'Segoe UI',Verdana, Arial, Helvetica, sans-serif",
                fontSize: [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]],
                color: designConstants.baseFGColor
            }
        },      
        children: {
            extensionControl: {
                description: {
                    "class": "DocExtensionControl"
                }
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A hack to allow the user to extend the length of a document (till we have display queries available).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DocExtensionControl: {
        "class": o("DefaultDisplayText", "Border", "GeneralArea", "TrackMyCollapsableView"),
        context: {
            displayText: "More..."
        },
        position: {
            width: 50,
            height: 20,
            bottom: 2,
            right: 20
        },
        write: {
            onDocExtensionControl: {
                "class": "OnMouseClick",
                true: {
                    extendDoc: {
                        to: [{ myCollapsableView: { docLength:_ } }, [me]],
                        merge: [plus, 
                                [{ myCollapsableView: { docLength:_ } }, [me]], 
                                [div, 
                                 [{ myCollapsableView: { initialDocLength:_ } }, [me]], 
                                 2
                                ]
                               ]
                    }
                }
            }
        },
        display: {
            background: "white"
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaIdInAS: o(
        { // default
            "class": o("VDAreaId", "WrapAround"),
            context: {
                myAreaId: [{ param: { areaSetContent:_ } }, [me]]
            }
        },
        {
            qualifier: { firstOfWrapArounds: true },
            position: {
                top: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myAreaId: the areaId of the debugged area represented by the instance of VDAreaId
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDAreaId: o(
        { // variant-controller
            qualifier: "!",
            context: { 
                markDebuggable: [and,
                                 [{ active:_ }, [me]],
                                 [not, [{ maximizedView:_ }, [me]]],
                                 [not, [{ myDebugAreaInfo: { debuggableZeroDimensions:_ } }, [me]]],
                                 o(
                                   [{ beingDebugged:_ }, [me]],
                                   [{ inArea:_ }, [me]]
                                  )
                                ],
                inMemoryView: [
                               "VDMemoryView",
                               [classOfArea, [embeddingStar, [me]]]
                              ]
            }
        },
        { // default
            "class": o("DefaultDisplayText", "DisplayDimension", "Tooltipable", "TrackVisualDebugger"),
            context: { 
                myDebugAreaInfo: [
                                  { areaId: [{ myAreaId:_ }, [me]] },
                                  [areaOfClass, "DebugAreaInfo"]
                                 ],
                displayText: [concatStr, [{ myAreaId:_ }, [me]]],
                tooltipText: [first, [{ classes:_ }, [debuggerAreaInfo, [{ myAreaId:_ }, [me]]]]],
                
                beingDebugged: [
                                [{ myAreaId:_ }, [me]],
                                [{ debuggedAreaId:_ }, [me]]
                               ]
            },
            children: {
                tooltip: {
                    // add to the definition provided in Tooltipable
                    description: {
                        stacking: {
                            aboveMyTooltipable: {
                                higher: [me],
                                lower: [expressionOf],
                                priority: 2
                            },
                            andAboveTheDebuggableVisualIndication: {
                                higher: [me],
                                lower: [{ children: { visualIndication:_ } }, [expressionOf]]
                            }
                        }
                    }
                }
            },
            write: {
                onVDAreaIdMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setMyDebuggableAsDebugged: {
                            to: [{ debuggedAreaId:_ }, [me]],
                            merge: [{ myAreaId:_ }, [me]]
                        },
                        resetDebuggedDocInView: {
                            to: [message],
                            merge: {
                                msgType: "BeginningOfDoc",
                                recipient: [areaOfClass, "VDDebuggedContextView"]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { inArea: true },
            "class": "Border",
            write: {
                onVDAreaId  : {
                    upon: [keyCtrlEvent,
                           "KeyDown",
                           o("m", "M")
                          ],
                    true: {
                        addToMemorizedAreaIds: {
                            to: [message],
                            merge: {
                                recipient: [{ visualDebugger:_ }, [me]],
                                msgType: "MemorizeAreaId",
                                areaId: [{ myAreaId:_ }, [me]]
                            }
                        }                       
                    }
                }
            }
        },
        {
            qualifier: { inArea: true,
                         inMemoryView: true },
            children: {
                deletionControl: {
                    "class": "PartnerWithIconEmbedding", // SelectionDeleteControl inherits Icon, and so we need to provide a partner definition here.
                    description: {
                        "class": "VDAreaIdUnmemorizeControl"
                    }
                }
            }                               
        },
        {
            qualifier: { markDebuggable: true },
            children: {
                visualIndication: {
                    partner: [areaOfClass, "ScreenArea"],
                    description: {
                        "class": "VDVisualIndicationOfNonZeroSizeDebuggable"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDTitle: {
        children: {
            title: {
                description: {
                    "class": o("TextBold", "TextAlignCenter", "DefaultDisplayText", "GeneralArea", "TrackVisualDebugger", "VDRowPosition"),
                    context: {
                        displayText: [{ title:_ }, [embedding]]
                    },
                    position: {
                        top: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDText: {
        "class": o("DefaultDisplayText", "DisplayDimension", "GeneralArea", "TrackVisualDebugger"),
        context: {
            displayText: "<text>"           
        },
        position: {
            top: 0, 
            left: 0
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDRowPosition: {
        position: {
            left: 0,
            right: 0,
            height: vdConstants.rowHeight
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AttachToAreaAboveMe: {
        position: {
            attachToAreaAboveMe: {
                point1: { 
                    element: [{ areaAboveMe:_ }, [me]],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: 0
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VDPositionRightOfMyText: {
        position: {
            rightOfMyText: {
                point1: {
                    element: [{ children: { text:_ } }, [embedding]],
                    type: "right"
                },
                point2: { 
                    type: "left"
                },
                equals: 0
            }
        }
    }  

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Visual Debugger Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
};
