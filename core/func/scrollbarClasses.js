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
// Beginning of Scrollbar Classes 
/////////////////////////////////////////////////////////////////////////////////////////////////////////    

// %%classfile%%: <scrollbarDesignClasses.js>

initGlobalDefaults.scrollingConstants = {
    beat: 0.01 // in seconds - the repetition rate ofo scrolling actions on a continuous mouseDown, or a continous keyDown on one of the scrolling keys
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API: 
    // 1. positionOfViewWithinDoc (when inherited by a class which inherits MovableController, a default definition is provided by the latter)
    // 2. scrollingCondition: a boolean defining when scrolling should take place. See ScrollableControl, for example.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    Scrollable: o(
        { // default
            "class": "GeneralArea",
            context: {
                "*firstScrollingBeatCompleted": false,
                continuousScrollingBeat: [{ scrollingConstants: { beat: _ } }, [globalDefaults]],
                scrollingBeat: o(
                    [not, [{ firstScrollingBeatCompleted: _ }, [me]]],
                    [and,
                        [greaterThan,
                            [time,
                                [{ positionOfViewWithinDoc: _ }, [me]], // beats at continuousScrollingBeat when positionOfViewWithinDoc changes
                                [{ continuousScrollingBeat: _ }, [me]]
                            ],
                            0
                        ],
                        [overlap, [{ myApp: _ }, [me]], [pointer]] // beat only when the mouse is inside the app window
                    ]
                ),
                keepScrolling: [and,
                    [{ scrollingCondition: _ }, [me]],
                    [{ scrollingBeat: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { firstScrollingBeatCompleted: false },
            write: {
                onScrollableScrollingCondition: {
                    upon: [{ scrollingCondition: _ }, [me]],
                    true: {
                        firstScrollingBeatCompletedOn: {
                            to: [{ firstScrollingBeatCompleted: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { firstScrollingBeatCompleted: true },
            write: {
                onScrollableNoLongerScrollingCondition: {
                    upon: [not, [{ scrollingCondition: _ }, [me]]],
                    true: {
                        firstScrollingBeatCompletedOff: {
                            to: [{ firstScrollingBeatCompleted: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. movableController (Scrollable's API)
    // 2. scrollingCondition: default definition provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollableControl: {
        "class": o("ScrollableControlDesign", "Control", "Scrollable", "Tmdable", "TrackMyScrollbarContainer"),
        context: {
            positionOfViewWithinDoc: [{ movableController: { positionOfViewWithinDoc: _ } }, [me]],
            defaultScrollingCondition: [and,
                [{ inArea: _ }, [me]],
                o(
                    [{ type: "MouseDown" }, [myMessage]],
                    [{ tmd: _ }, [me]]
                )
            ],
            scrollingCondition: [{ defaultScrollingCondition: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting class should inherit Scrollable, which defines keepScrolling and requires movableController as its API.
    // 2. scrollOperation: one of the set of msgs accepted by movableController (ViewBack/ViewFwd/Next/Prev/BeginningOfDoc/EndOfDoc)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollOperation: {
        write: {
            onScrollOperationKeepScrolling: {
                upon: [{ keepScrolling: _ }, [me]],
                true: {
                    scrollOperationMsg: {
                        to: [message],
                        merge: {
                            msgType: [{ scrollOperation: _ }, [me]],
                            recipient: [{ movableController: _ }, [me]]
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollViewFwd: {
        "class": "ScrollOperation",
        context: {
            scrollOperation: "ViewFwd"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollViewBack: {
        "class": "ScrollOperation",
        context: {
            scrollOperation: "ViewBack"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollNext: {
        "class": "ScrollOperation",
        context: {
            scrollOperation: "Next"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollPrev: {
        "class": "ScrollOperation",
        context: {
            scrollOperation: "Prev"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollViewFwdControl: {
        "class": o("ScrollableControl", "ScrollViewFwd")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollViewBackControl: {
        "class": o("ScrollableControl", "ScrollViewBack")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollNextControl: {
        "class": o("ScrollableControl", "ScrollNext")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ScrollPrevControl: {
        "class": o("ScrollableControl", "ScrollPrev")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the basic scrollbar functionality. Inheriting classes should not inherit this class directly, but rather its axis-specific versions.
    // This class inherits BlockMouseEvent so that it does not propagate events to the document which *may* run underneath it.
    // If a scrollbar is needed (docLongerThanView: true), it embeds a Scrollbar, and if scrollbar buttons are defined, then it creates a one container for each set of buttons, on either
    // side of the scrollbar, along its scrolling axis.
    //
    // API: 
    // 1. movableController: an areaRef to a class inheriting MovableController (not directly, but rather via inheritance of an axis-specific SnappableController/ContMovableController).
    //    Determines the scroller's length is determined automatically, or is a predefined length.  if the latter, then fixedLengthScroller defines that length (and has a default value).
    // 2. scroller: 
    // 2.1 scrollerGirth: default value provided.     
    // 2.2 scrollerDefaultColor: default provided; onHoverScrollerColor: default provided; onDraggedScrollerColor: default provided.
    // 3. scrollbar: 
    // 3.1 scrollbarBorder: default value provided.
    // 3.2 scrollbarBorderColor: default value provided.
    // 3.3 scrollbarMarginFromScroller: default value provided.
    // 3.4 marginAroundScrollbar: a white margin around the scrollbar. default provided.
    // 4. show buttons parameters (Boolean: true, by default).
    //    to avoid buttons, set createButtons to false (its default value is the os of the flags herein.
    // 4.1 showBeginningEndDocButtons: should the scrollbar container show the beginningDoc and endDoc buttons.
    // 4.2 showViewBackFwdButtons: should the scrollbar container show the viewBack and viewFwd buttons.
    // 4.3 showPrevNextButtons: should the scrollbar container show the Prev and Next buttons (relevant only for the ScrollbarContainerOfSnappable (to move there after os of objects can
    //     be merged...)
    // 5. attachToView: o(), by default. 
    //    o() requires the inheriting class to provide the scrollbarContainer with its length-axis constraints.
    // 5.1 options are: "beginning" (left/top) & "end" (right/bottom) of the view.
    // 5.2 If "beginning"/"end", the attachment is to the attachToViewBeginningAnchor / attachToViewEndAnchor posPoints (by default: the view's 
    //     beginningGirth / endGirth). Inheriting classes overriding these posPoints, atomic() is to be used to override the posPoint in its entirety.
    //    attachToViewOverlap: if true, then the scrollbar hovers within the view, on the specified side, above the view's other elements. false by default.
    // 6. scrollbarMarginFromViewLengthAxisEdge / scrollbarMarginFromViewBeginningGirth / scrollbarMarginFromViewEndGirth
    //    if attachToView is specified, this parameter determines the scrollbar's (not the scrollbarContainer's!) offset from the view on these different sides.
    //    default provided.
    // 7. showOnlyWhenInView: false, by default (i.e. will always show). If true, showWhenInThisView can be defined (view, by default).
    //    Note: the scrollbar need not be inside the view for which it provides scrolling. If it isn't, and showOnlyWhenInView is true, then the author is
    //    well advised to set showWhenInThisView to an area which encompasses both. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollbarContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showOnlyWhenInView: false,
                show: [and,
                    [{ docLongerThanView: _ }, [me]],
                    o(
                        [not, [{ showOnlyWhenInView: _ }, [me]]], // i.e. show regardless of whether inArea for showWhenInThisView
                        [and,
                            [{ showOnlyWhenInView: _ }, [me]],
                            [{ inViewTriggeringShow: _ }, [me]]
                        ],
                        [{ scrollbarInOperation: _ }, [me]]
                    )
                ],
                createButtons: o(
                    [{ showBeginningEndDocButtons: _ }, [me]],
                    [{ showViewBackFwdButtons: _ }, [me]],
                    [{ showPrevNextButtons: _ }, [me]]
                ),

                attachToView: o(),
                attachToViewOverlap: false,
                inAreaOfScrollbarContainer: [{ inArea: _ }, [me]], // cast into this context label, which is relied upon in the Design classes (shared with the embedded buttons!)
                ofVerticalElement: [
                    "Vertical",
                    [classOfArea, [{ movableController: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("ScrollbarContainerDesign", "GeneralArea", "BlockMouseEvent", "MinWrap"),
            context: {
                view: [{ movableController: { view: _ } }, [me]],
                docLongerThanView: [{ movableController: { docLongerThanView: _ } }, [me]],

                // used by embedded classes:
                scrollerGirth: scrollbarPosConst.scrollerGirth, // default              
                fixedLengthScroller: scrollbarPosConst.fixedLengthScroller, // default value
                scrollerDefaultColor: designConstants.scrollerDefaultColor,
                scrollerOnHoverColor: designConstants.scrollerOnHoverColor,
                scrollerOnDraggedColor: designConstants.scrollerOnDraggedColor,

                scrollbarBorderWidth: scrollbarPosConst.scrollbarBorderWidth,
                scrollbarBorderColor: designConstants.scrollbarBorderDefaultColor,
                scrollbarMarginFromScroller: scrollbarPosConst.scrollbarMarginFromScroller,
                marginAroundScrollbar: scrollbarPosConst.marginAroundScrollbar,

                minWrapAround: [{ marginAroundScrollbar: _ }, [me]],

                showBeginningEndDocButtons: false,
                showViewBackFwdButtons: false,
                showPrevNextButtons: false,
                /*[// prev/next buttons are needed only if this is a controller for a movable areaSet
                 [{ movableController:_ }, [me]],
                 [areaOfClass, "MovableASControllerCore"]
                ],*/

                // note the mirroring of matching buttons for the beginningSide and endSide data objects, to allow positioning along the length axis to be somewhat agnostic to which 
                // areaSet of the two we're in.
                // For example, Prev is last in the beginningSideButtonsData, whereas Next is first in the endSideButtonsData. 
                beginningSideButtonsData: o(
                    {
                        message: "BeginningOfDoc",
                        show: [{ showBeginningEndDocButtons: _ }, [me]]
                    },
                    {
                        message: "ViewBack",
                        show: [{ showViewBackFwdButtons: _ }, [me]]
                    },
                    {
                        message: "Prev",
                        show: [{ showPrevNextButtons: _ }, [me]]
                    }
                ),
                endSideButtonsData: o(
                    {
                        message: "Next",
                        show: [{ showPrevNextButtons: _ }, [me]]
                    },
                    {
                        message: "ViewFwd",
                        show: [{ showViewBackFwdButtons: _ }, [me]]
                    },
                    {
                        message: "EndOfDoc",
                        show: [{ showBeginningEndDocButtons: _ }, [me]]
                    }
                ),

                scrollingCondition: [
                    {
                        scrollingCondition: true,
                        myScrollbarContainer: [me]
                    },
                    [areaOfClass, "ScrollableControl"]
                ]
            }
        },
        {
            qualifier: { showOnlyWhenInView: true },
            context: {
                showWhenInThisView: [{ view: _ }, [me]],
                // this appData tracks the tmd in the scroller and other components in the scrollbarContainer, and whether the associated doc is moving. 
                // it ensures, for example that even if during scroll the pointer exits showWhenInThisView, the scrollbar will remain on display
                "*scrollbarInOperation": false,
                // a scrollable element can be moved either via its ScrollableControls, or by directly dragging the document itself (docMoving)
                myElementsTmd: o(
                    [
                        {
                            type: "MouseDown",
                            recipient: [{ myScrollbarContainer: [me] },
                            [areaOfClass, "ScrollableControl"]
                            ]
                        },
                        [message]
                    ],
                    [
                        {
                            tmd: _,
                            myScrollbarContainer: [me]
                        },
                        [areaOfClass, "ScrollableControl"]
                    ]
                ),
                myDocMoving: [
                    {
                        docMoving: _,
                        myScrollbars: [me] // poor name. it actually keeps ScrollbarContainers.
                    },
                    [areaOfClass, "MovableController"]
                ],
                scrollableElementsInOperation: o(
                    [{ myElementsTmd: _ }, [me]],
                    [{ myDocMoving: _ }, [me]]
                ),
                inViewTriggeringShow: [and,
                    [overlap, [{ showWhenInThisView: _ }, [me]], [pointer]],
                    [not, [{ myApp: { operationInProgress: _ } }, [me]]]
                ]
            },
            write: {
                onScrollbarContainerScrollbarInOperation: {
                    upon: [changed, [{ scrollableElementsInOperation: _ }, [me]]],
                    true: {
                        setScrollbarInOperation: {
                            to: [{ scrollbarInOperation: _ }, [me]],
                            merge: [{ scrollableElementsInOperation: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { attachToView: true },
            context: {
                myScrollbar: [{ children: { scrollbar: _ } }, [me]],
                scrollbarMarginFromViewLengthAxisEdge: scrollbarPosConst.scrollbarMarginFromView,
                scrollbarMarginFromViewBeginningGirth: scrollbarPosConst.scrollbarMarginFromView,
                scrollbarMarginFromViewEndGirth: scrollbarPosConst.scrollbarMarginFromView,
                beginningOfViewContent: [contentOfPosPoint, // as [{ movableController: { beginningOfViewPoint:_ } }, [me]] is the frame border!
                    [{ movableController: { beginningOfViewPoint: _ } }, [me]]
                ],
                endOfViewContent: [contentOfPosPoint, // as [{ movableController: { endOfViewPoint:_ } }, [me]] is the frame border!
                    [{ movableController: { endOfViewPoint: _ } }, [me]]
                ]
            },
            position: {
                attachScrollbarToBeginningOfViewContent: {
                    point1: [{ beginningOfViewContent: _ }, [me]],
                    point2: { element: [{ myScrollbar: _ }, [me]], type: [{ lowHTMLLength: _ }, [me]] },
                    equals: [{ scrollbarMarginFromViewLengthAxisEdge: _ }, [me]]
                },
                attachScrollbarToEndOfViewContent: {
                    point1: { element: [{ myScrollbar: _ }, [me]], type: [{ highHTMLLength: _ }, [me]] },
                    point2: [{ endOfViewContent: _ }, [me]],
                    equals: [{ scrollbarMarginFromViewLengthAxisEdge: _ }, [me]]
                }
            }
        },
        {
            qualifier: { attachToView: "beginning" },
            context: {
                attachToViewBeginningAnchor: {
                    element: [{ view: _ }, [me]],
                    type: [{ beginningGirth: _ }, [me]],
                    content: true
                }
            }
        },
        {
            qualifier: {
                attachToView: "beginning",
                attachToViewOverlap: false
            },
            position: {
                attachScrollbarToViewBeginningGirth: {
                    point1: { type: [{ endGirth: _ }, [me]] },
                    point2: [{ attachToViewBeginningAnchor: _ }, [me]],
                    equals: [mul,
                        [{ scrollbarMarginFromViewBeginningGirth: _ }, [me]],
                        [cond,
                            [{ ofVerticalElement: _ }, [me]],
                            o({ on: true, use: 1 }, { on: false, use: -1 })
                        ]
                    ]
                }
            }
        },
        {
            qualifier: { attachToView: "end" },
            context: {
                attachToViewEndAnchor: {
                    element: [{ view: _ }, [me]],
                    type: [{ endGirth: _ }, [me]],
                    content: true
                }
            }
        },
        {
            qualifier: {
                attachToView: "end",
                attachToViewOverlap: false
            },
            position: {
                attachScrollbarToViewEndGirth: {
                    point1: [{ attachToViewEndAnchor: _ }, [me]],
                    point2: { type: [{ beginningGirth: _ }, [me]] },
                    equals: [mul,
                        [{ scrollbarMarginFromViewEndGirth: _ }, [me]],
                        [cond,
                            [{ ofVerticalElement: _ }, [me]],
                            o({ on: true, use: 1 }, { on: false, use: -1 })
                        ]
                    ]
                }
            }
        },
        //    qualifier: { attachToViewOverlap: true }: see Movable for stacking constraint that places it below any Scrollbar if attachToViewOverlap is on.
        {
            qualifier: {
                attachToView: "beginning",
                attachToViewOverlap: true
            },
            position: {
                attachToView: {
                    point1: [{ attachToViewBeginningAnchor: _ }, [me]],
                    point2: { type: [{ beginningGirth: _ }, [me]] },
                    equals: [{ scrollbarMarginFromViewBeginningGirth: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                attachToView: "end",
                attachToViewOverlap: true
            },
            position: {
                attachToView: {
                    point1: { type: [{ endGirth: _ }, [me]] },
                    point2: [{ attachToViewEndAnchor: _ }, [me]],
                    equals: [{ scrollbarMarginFromViewEndGirth: _ }, [me]]
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
            children: {
                scrollbar: {
                    description: {
                        "class": "Scrollbar"
                    }
                }
            }
        },
        {
            qualifier: {
                show: true,
                createButtons: true
            },
            children: {
                beginningSideButtons: {
                    data: [{ show: true },
                    [{ beginningSideButtonsData: _ }, [me]]
                    ],
                    description: {
                        "class": "ButtonOnBeginningSideOfScrollbarContainer"
                    }
                },
                endSideButtons: {
                    data: [{ show: true },
                    [{ endSideButtonsData: _ }, [me]]
                    ],
                    description: {
                        "class": "ButtonOnEndSideOfScrollbarContainer"
                    }
                }
            }
        },
        {
            qualifier: {
                show: true,
                createButtons: false
            },
            position: {
                attachBeginningToScrollbarBeginning: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ children: { scrollbar: _ } }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [{ marginAroundScrollbar: _ }, [me]]
                },
                attachEndToScrollbarEnd: {
                    point1: {
                        element: [{ children: { scrollbar: _ } }, [me]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: [{ marginAroundScrollbar: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // the horizontal version of the ScrollbarContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalScrollbarContainer: {
        "class": o("ScrollbarContainer", "Horizontal")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // the vertical version of the ScrollbarContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalScrollbarContainer: {
        "class": o("ScrollbarContainer", "Vertical")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyScrollbarContainer: {
        "class": o("GeneralArea", "OrientedElement"),
        context: {
            myScrollbarContainer: [
                [embeddingStar, [me]],
                [areaOfClass, "ScrollbarContainer"]
            ],
            refOrientedElement: [{ myScrollbarContainer: _ }, [me]] // override OrientedElement default value
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class provides the scrollbar functionality within the scrollbarContainer.
    // The Scrollbar embeds the Scroller, with which the document can be dragged. 
    //
    // API: 
    // This class assumes it is embedded in a ScrollbarContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Scrollbar: o(
        { // variant-controller
            qualifier: "!",
            context: {
                viewStaysWithinDocument: [{ movableController: { viewStaysWithinDocument: _ } }, [me]],

                pointerBeforeScroller: [greaterThan,
                    [offset,
                        {
                            element: [pointer],
                            type: [{ lowHTMLLength: _ }, [me]]
                        },
                        {
                            element: [{ children: { scroller: _ } }, [me]],
                            type: [{ lowHTMLLength: _ }, [me]]
                        }
                    ],
                    0
                ],
                pointerAfterScroller: [greaterThan,
                    [offset,
                        {
                            element: [{ children: { scroller: _ } }, [me]],
                            type: [{ highHTMLLength: _ }, [me]]
                        },
                        {
                            element: [pointer],
                            type: [{ lowHTMLLength: _ }, [me]]
                        }
                    ],
                    0
                ]
            }
        },
        { // default    
            "class": o("ScrollbarDesign", "GeneralArea", "ScrollableControl"),
            context: {
                movableController: [{ myScrollbarContainer: { movableController: _ } }, [me]],

                // we define effectiveBeginning/effectiveEnd for the scroller, parallel to those posPoint labels for the document.
                // (worth reminding: the scrollbar represents the document, and the scroller represents the view)
                // using these we calculate the ratio of the scrollbar to the document, on the scrolling axis. this ratio is used to position the scroller within the scrollbar
                scrollbarToControlledDocRatio: [div,
                    [offset,
                        { label: "effectiveBeginning" },
                        { label: "effectiveEnd" }
                    ],
                    [{ movableController: { effectiveDocLength: _ } }, [me]]
                ],
                offsetToEffectiveEdgePoint: [plus,
                    [div, [{ children: { scroller: { length: _ } } }, [me]], 2],
                    scrollbarPosConst.scrollbarMarginFromScroller
                ]
            },
            children: {
                scroller: {
                    description: {
                        "class": "Scroller"
                    }
                }
            },
            position: {
                labelEffectiveBeginning: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: true
                    },
                    point2: { label: "effectiveBeginning" },
                    equals: [{ offsetToEffectiveEdgePoint: _ }, [me]]
                },
                labelEffectiveEnd: {
                    point1: { label: "effectiveEnd" },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]],
                        content: true
                    },
                    equals: [{ offsetToEffectiveEdgePoint: _ }, [me]]
                },

                // note that this constraint is in effect continuously, and in particular when dragging either the document or the scrollbar. the beauty of declarative positioning!
                scrollerPosWithinScrollbar: {
                    pair1: {
                        point1: {
                            element: [{ movableController: _ }, [me]],
                            label: "effectiveBeginningOfDocPoint"
                        },
                        point2: {
                            element: [{ movableController: _ }, [me]],
                            label: "centerViewPoint"
                        }
                    },
                    pair2: {
                        point1: { label: "effectiveBeginning" },
                        point2: {
                            element: [{ children: { scroller: _ } }, [me]],
                            type: [{ centerLength: _ }, [me]]
                        }
                    },
                    ratio: [{ scrollbarToControlledDocRatio: _ }, [me]]
                }
            }
        },
        {
            qualifier: { pointerAfterScroller: true },
            "class": "ScrollViewFwd"
        },
        {
            qualifier: { pointerBeforeScroller: true },
            "class": "ScrollViewBack"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the class for the scroller which resides inside the scrollbar. 
    // It inherits Movable, which allows it (given Movable's API) to control the movement of the associated document, along the scrolling axis.
    // This class assumes it is embedded in a Scrollbar.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    Scroller: o(
        { // variant-controller
            qualifier: "!",
            context: {
                viewStaysWithinDocument: [{ viewStaysWithinDocument: _ }, [embedding]]
            }
        },
        { // default 
            "class": o("ScrollerDesign", "ScrollableControl", "MatchEmbeddingOnGirthAxis", "DraggableMovable"),
            context: {
                // Movable param
                movableController: [{ myScrollbarContainer: { movableController: _ } }, [me]],
                viewToDocRatio: [div, // for calculation below
                    [{ movableController: { viewLength: _ } }, [me]],
                    [{ movableController: { docLength: _ } }, [me]]
                ],
                girthAxisOffsetFromEmbedding: scrollbarPosConst.scrollbarMarginFromScroller, // this in effect sets the width of the Scrollbar
                length: [offset,
                    { type: [{ lowHTMLLength: _ }, [me]] },
                    { type: [{ highHTMLLength: _ }, [me]] }
                ]
            },
            position: {
                scrollerGirthConstraint: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: [{ myScrollbarContainer: { scrollerGirth: _ } }, [me]]
                },
                // first calculate automaticHighLength and minHighLength
                automaticHighLengthCalculation: {
                    pair1: {
                        point1: {
                            element: [embedding],
                            type: [{ lowHTMLLength: _ }, [me]]
                        },
                        point2: {
                            element: [embedding],
                            type: [{ highHTMLLength: _ }, [me]]
                        }
                    },
                    pair2: {
                        point1: { type: [{ lowHTMLLength: _ }, [me]] },
                        point2: { label: "automaticHighLength" }
                    },
                    ratio: [{ viewToDocRatio: _ }, [me]]
                },
                minHighLengthCalculation: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { label: "minHighLength" },
                    equals: [{ myScrollbarContainer: { fixedLengthScroller: _ } }, [me]]
                },

                // then, set highHTMLLength posPoint to equate the higher-HTML of these two points.
                actualHighLengthNotBeforeAutomaticHighLength: {
                    point1: { label: "automaticHighLength" },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    min: 0
                },
                actualHighLengthNotBeforeMinHighLength: {
                    point1: { label: "minHighLength" },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    min: 0
                },
                actualHighLengthEqualsEitherAutomaticHighLength: {
                    point1: { label: "automaticHighLength" },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: 0,
                    orGroups: { label: "actualHighLength" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                orActualHighLengthEqualsMinHighLength: {
                    point1: { label: "minHighLength" },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: 0,
                    orGroups: { label: "actualHighLength" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is common code to all the buttons embeddedStar in the ScrollbarContainer. Their areaSetContent is the message they are to their movableController when receiving
    // their mouseEvent (mouseDown, currently).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ButtonInScrollbarContainer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inAreaOfScrollbarContainer: [{ myScrollbarContainer: { inAreaOfScrollbarContainer: _ } }, [me]],

                // ScrollOperation param:
                scrollOperation: [{ param: { areaSetContent: { message: _ } } }, [me]]
            }
        },
        { // default
            "class": o("ButtonInScrollbarContainerDesign",
                "GeneralArea",
                "MemberOfPositionedAreaOS",
                "MatchEmbeddingOnGirthAxis",
                "ScrollableControl",
                "ScrollOperation",
                "TrackMyScrollbarContainer"),
            context: {
                buttonInScrollbarContainerLength: scrollbarPosConst.buttonInScrollbarContainerLength,
                myScrollbarContainer: [embedding],

                // Scrollable params
                movableController: [{ myScrollbarContainer: { movableController: _ } }, [me]]
            },
            position: {
                lengthConstraint: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [{ buttonInScrollbarContainerLength: _ }, [me]]
                }
            }
        },
        {
            qualifier: { scrollOperation: "BeginningOfDoc" },
            "class": "ButtonInScrollbarContainerBeginningOfDocDesign"
        },
        {
            qualifier: { scrollOperation: "EndOfDoc" },
            "class": "ButtonInScrollbarContainerEndOfDocDesign"
        },
        {
            qualifier: { scrollOperation: "ViewBack" },
            "class": "ButtonInScrollbarContainerViewBackDesign"
        },
        {
            qualifier: { scrollOperation: "ViewFwd" },
            "class": "ButtonInScrollbarContainerViewFwdDesign"
        },
        {
            qualifier: { scrollOperation: "Prev" },
            "class": "ButtonInScrollbarContainerPrevDesign"
        },
        {
            qualifier: { scrollOperation: "Next" },
            "class": "ButtonInScrollbarContainerNextDesign"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the class inheirted by all buttons that are positioned on the beginning side of the scrollbar, within the scrollbar container.
    // It inherits ButtonInScrollbarContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ButtonOnBeginningSideOfScrollbarContainer: o(
        { // default
            "class": "ButtonInScrollbarContainer"
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                attachBeginningToEmbeddingBeginning: {
                    point1: {
                        element: [embedding],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    equals: [{ myScrollbarContainer: { marginAroundScrollbar: _ } }, [me]]
                }
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                attachEndToScrollbarBeginning: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ children: { scrollbar: _ } }, [embedding]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the class inheirted by all buttons that are positioned on the end side of the scrollbar, within the scrollbar container.
    // It inherits ButtonInScrollbarContainer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ButtonOnEndSideOfScrollbarContainer: o(
        { // default
            "class": "ButtonInScrollbarContainer"
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                attachBeginningToScrollbarEnd: {
                    point1: {
                        element: [{ children: { scrollbar: _ } }, [embedding]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                attachToEmbeddingEnd: {
                    point1: {
                        element: [embedding],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [{ myScrollbarContainer: { marginAroundScrollbar: _ } }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Doing nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollbarContainerOfSnappable: {
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalScrollbarContainerOfSnappable: {
        "class": o("ScrollbarContainerOfSnappable", "HorizontalScrollbarContainer")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalScrollbarContainerOfSnappable: {
        "class": o("ScrollbarContainerOfSnappable", "VerticalScrollbarContainer")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Scrollbar Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DottedScroller classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // A scroller like the one seen at the bottom of iOS screens, with dots representing the elements scrolled. In this case, we also have arrows as controls.
    // API:
    // 1. movableController
    // 2. snappablesRepresentedByDots
    // 3. Horizontal/Vertical
    // 4. absolute positionings
    // 5. minWrapAround: 0, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    DottedScroller: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                showDottedScroller: [and,
                    [{ movableController: { docLongerThanView: _ } }, [me]],
                    // no point in showing the scroller if there is only one snappable, which extends beyond the width of the view.
                    [greaterThan, [size, [{ snappablesRepresentedByDots: _ }, [me]]], 1]
                ]
            }
        },
        {
            qualifier: { showDottedScroller: false },
            position: {
                zeroGirth: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { showDottedScroller: true },
            "class": "MinWrap",
            context: {
                minWrapAround: 0
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                disablePrevScroller: [{ movableController: { scrolledToBeginning: _ } }, [me]],
                disableNextScroller: [{ movableController: { scrolledToEnd: _ } }, [me]],

                myControls: [
                    [areaOfClass, "DottedScrollerControl"],
                    [embedded]
                ]
            },
            position: {
                prevScrollerBeforeNextScroller: {
                    point1: {
                        element: [{ children: { prevScroller: _ } }, [me]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ children: { nextScroller: _ } }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    min: 0
                }
            },
            children: {
                prevScroller: {
                    description: {
                        "class": "DottedPrevScroller"
                    }
                },
                nextScroller: {
                    description: {
                        "class": "DottedNextScroller"
                    }
                },
                dots: {
                    data: [{ snappablesRepresentedByDots: _ }, [me]],
                    description: {
                        "class": "ScrollableDot"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    HorizontalDottedScroller: {
        "class": o("Horizontal", "DottedScroller")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    VerticalDottedScroller: {
        "class": o("Horizontal", "DottedScroller")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DottedScrollerElement: {
        "class": o("GeneralArea", "OrientedElement"),
        context: {
            movableController: [{ movableController: _ }, [embedding]]
        },
        position: {
            alignOnGirthAxis: {
                point1: {
                    element: [embedding],
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DottedScrollerControl: {
        "class": "DottedScrollerElement",
        position: {
            lengthAxisDimension: {
                point1: { type: [{ lowHTMLLength: _ }, [me]] },
                point2: { type: [{ highHTMLLength: _ }, [me]] },
                equals: 14 // to be replaced by a display query
            },
            girthAxisDimension: {
                point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                point2: { type: [{ highHTMLGirth: _ }, [me]] },
                equals: 13 // to be replaced by a display query             
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DottedPrevScroller: {
        "class": o("DottedPrevScrollerDesign", "DottedScrollerControl", "ScrollPrevControl"),
        context: {
            disabled: [{ disablePrevScroller: _ }, [embedding]]
        },
        position: {
            attachToEmbeddingOnLowHTMLLengthSide: {
                point1: {
                    element: [embedding],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DottedNextScroller: {
        "class": o("DottedNextScrollerDesign", "DottedScrollerControl", "ScrollNextControl"),
        context: {
            disabled: [{ disableNextScroller: _ }, [embedding]]
        },
        position: {
            attachToEmbeddingOnHighHTMLLengthSide: {
                point1: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    element: [embedding],
                    type: [{ highHTMLLength: _ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. snappableRepresentedThresholdInViewBeginning/snappableRepresentedThresholdInViewEnd: default: the lowHTMLLength posPoint of the snappableRepresented.
    //    note that inheriting classes should use atomic() to override this definition.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollableDot: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                snappablesBeingReordered: [{ snappablesRepresentedByDots: { iAmDraggedToReorder: true } }, [embedding]],
                // note: this means the snappableRepresented isn't necessarily entirely within view
                snappableRepresentedInView: [and,
                    [greaterThanOrEqual,
                        [offset,
                            [{ movableController: { beginningOfViewPoint: _ } }, [me]],
                            [{ snappableRepresentedThresholdInViewBeginning: _ }, [me]]
                        ],
                        0
                    ],
                    [greaterThanOrEqual,
                        [offset,
                            [{ snappableRepresentedThresholdInViewEnd: _ }, [me]],
                            [{ movableController: { endOfViewPoint: _ } }, [me]]
                        ],
                        0
                    ]
                ]
            }
        },
        { // default
            "class": o("ScrollableDotDesign", "Circle", "DottedScrollerElement", "ModifyPointerClickable"),
            context: {
                radius: generalPosConst.scrollableDotRadius,
                spacingFromPrev: generalPosConst.dottedScrollerDotSpacing,
                spacingFromScrollerControl: generalPosConst.dottedScrollerSpacingFromControl,

                snappableRepresented: [{ param: { areaSetContent: _ } }, [me]],
                snappableRepresentedThresholdInViewBeginning: {
                    element: [{ snappableRepresented: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                snappableRepresentedThresholdInViewEnd: {
                    element: [{ snappableRepresented: _ }, [me]],
                    // note: this means the snappableRepresented isn't necessarily entire within view
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                viewOfSnappableRepresented: [{ movableController: { view: _ } }, [me]]
            },
            write: {
                onScrollableDotMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setSnappableRepresentedAsFiv: {
                            to: [{ movableController: { specifiedFiVUniqueID: _ } }, [me]],
                            merge: [
                                { "uniqueID": _ }, // remove this and uncomment row below once bug #1205 is fixed
                                //[{ movableController: { snappableUniqueIDProjectionQuery:_ } }, [me]], 
                                [{ snappableRepresented: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "MemberOfLeftToRightAreaOS"
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MemberOfTopToBottomAreaOS"
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                attachToPrevScroller: {
                    point1: {
                        element: [{ children: { prevScroller: _ } }, [embedding]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [{ spacingFromScrollerControl: _ }, [me]]
                }
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                attachToNextScroller: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ children: { nextScroller: _ } }, [embedding]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [{ spacingFromScrollerControl: _ }, [me]]
                }
            }
        }
    )

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DottedScroller classes
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
};