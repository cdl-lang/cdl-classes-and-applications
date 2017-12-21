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
// This library offers table-related functionality.
// Generally speaking, we distinguish between the view in which we can scroll, and the document being scrolled. 'Scrolled' and 'Dragged' are used interchangable - the distinction made
// is that one scrolls a document using a scrollbar, whereas if the document is moved directly by the user, then it is being dragged.
// The document can be made up of a single area, or multiple areas positioned along the scrolling axis. 
// 
// A few comments:
// 1. The document need not be an area, but the two posPoints marking its ends along the scrolling axis do need to be defined.
// 2. We distinguish between the ability to move a document and have it remain at the position at which it was released (the Continuous classes, which have a Cont prefix), and the ability to 
//    have that document snap to one of a set of predefined points along it (e.g. rows in a document) (the Snappable classes, which have a Snappable prefix).
// 2. JIT:
// 2.1 We distinguish betwen the JIT classes (Just In Time, which have the JIT prefix to their name), and the AOT (Ahead of Time, which do not have the JIT prefix to their name).
//     These are two different approaches for creation of areas which are part of the document being scrolled. 
//     The JIT assumes the areas in the areaSet are of equal length ('length' is the term used to describe the area's magnitude along the scrolling axis, even if in reality it's the 
//     area's width). Its controller calculates which areas would fit into a predefined JITView, and controls the creation of only those areas in the scrolled areaSet. 
//     It relies on their equal length and spacing to position them directly wrt the view, and not have to position them wrt their previous area in the areaSet.
//     The reduction in the number of scrolled areas in the areaSet, and their direction - not relative - positioning, offers better performance than AOT.
// 2.2 *Core classes are common to the JIT and AOT. For example XCore would be inherited by JITX (the JIT version) and X (the AOT version).
// 2.3 Eventually, JIT-type behavior should be provided by the system, and not by cdl.
//
// 3. The Controller is not necessarily the view. The view may in fact offer scrolling behavior along to axes (see contMovableTest), in which case it actually specified a separate
//    controller for each view.
// 4. The view would be a natural candidate to embed the areas that compose the document, as by doing so it would provide the clipping behavior the user would expect for those parts
//    of the document which are out of view.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <tableDesignClasses.js>

initGlobalDefaults.tableConstants = {
    defaultRatioJITViewToView: 1.1
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Movable Classes: The common classes to Continuous Movable classes and to Snappable classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by MovableASControllerCore and ContMovableController. this class should not be inherited directly.
    // This class, and its inheriting classes, allow movement along (at any given moment) a single axis. 
    //
    // API: 
    // 0. movable: does this class allow movability or not (this flag may be turned off when we have reordering without scrolling, for example)
    // 1. for the View: 
    // 1.1 view: An areaRef to the view. [me], by default.
    // 1.2 view points: 
    // 1.2.1 beginningOfViewPoint: by default, this is the lowHTMLLength *content* posPoint (left/top, for Horizontal/Vertical respectively) of this area.
    //       The inheriting class may override this by specifying: atomic({ <posPoint> }).
    // 1.2.2 endOfViewPoint: by default, this is the highHTMLLength *content* posPoint (right/bottom, for Horizontal/Vertical respectively) of this area.
    //       The inheriting class may override this by specifying: atomic({ <posPoint> }).
    //
    // 2. Document: 
    // 2.1 docMoving: a writable ref. Its associated appData is initialized to false.
    //                A class that wishes to allow dragging the document with respect to the view should set docMoving to true for the duration of this operation 
    //               (note this is does not apply to direct-access move operations, where we "instantaneously" reset the relative position of the document wrt the view (e.g. "view-back").
    // 2.2 Upon Handlers: This class defines the upon clause; Inheriting classes should specify their true clause.
    // 2.2.1 When docMoving is true, we provide here the interface to a MouseUp (the MouseUp indicates the transition from { docMoving: true } to { docMoving: false }), 
    //       at which point the document will once again be anchored to the view.
    //       This upon also requires docLongerThanView to be true - it is only in that case that the doc's position on mouseUp may be something other than the original alignment of 
    //       its beginning with the beginning of the view.
    // 2.2.2 In addition to upon handlers for { docMoving: true }, whose control allows dragging of the document, this class also defines an interface for *direct-access* operations.
    //       BeginningOfDoc/EndOfDoc/ViewBack/ViewFwd - these upon handlers are defined by this class, and inheriting classes should specify the actions to take when receiving these msgs.
    //       (see ContMovableController and SnappableController for examples).
    // 2.3 beginningOfDocPoint/endOfDocPoint (as indicated above, these need not pertain to any single area; they could define a 'virtual' area).
    // 2.3 defaultAnchorDocToView: true, by default.
    //
    // 3. viewStaysWithinDocument: boolean, false by default. 
    //    If true, the view cannot exceed the document boundaries on its length axis. If false, the view can reach all the way to the full document length.
    //    Here we further define viewStaysWithinDocumentEndOfDocStopper/viewStaysWithinDocumentEndOfDoc, which are given default values (endOfViewPoint/endOfDocPoint).
    //    These can be overridden by inheriting classes
    // Note: the MovableController need not know the identity, or the existence of its associated scrollbars. It merely offers them an interface to manipulate it.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovableController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                viewStaysWithinDocument: true,
                docLongerThanView: [greaterThan,
                    [{ effectiveDocLength: _ }, [me]],
                    0
                ],
                movable: true,
                defaultAnchorDocToView: true
            }
        },
        {
            qualifier: { movable: true },
            context: {
                "*docMoving": false
            }
        },
        {
            qualifier: { movable: false },
            context: {
                docMoving: false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                view: [me],
                beginningOfViewPoint: {
                    element: [{ view: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                endOfViewPoint: {
                    element: [{ view: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                },

                myScrollbars: [{ movableController: [me] }, [areaOfClass, "ScrollbarContainer"]],

                docLength: [offset,
                    [{ beginningOfDocPoint: _ }, [me]],
                    [{ endOfDocPoint: _ }, [me]]
                ],
                effectiveDocLength: [offset,
                    { label: "effectiveBeginningOfDocPoint" },
                    { label: "effectiveEndOfDocPoint" }
                ],
                viewLength: [offset,
                    [{ beginningOfViewPoint: _ }, [me]],
                    [{ endOfViewPoint: _ }, [me]]
                ],

                positionOfViewWithinDoc: [offset,
                    [{ beginningOfDocPoint: _ }, [me]],
                    [{ beginningOfViewPoint: _ }, [me]]
                ]
            },
            position: {
                labelCenterViewPoint: {
                    pair1: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: { label: "centerViewPoint" }
                    },
                    pair2: {
                        point1: { label: "centerViewPoint" },
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                // the effectiveEndOfDocPoint/effectiveEndOfDocPoint: the farthest points that the center of the view would reach when the document is moved.
                labelEffectiveBeginningOfDocPoint: {
                    pair1: {
                        point1: [{ beginningOfDocPoint: _ }, [me]],
                        point2: { label: "effectiveBeginningOfDocPoint" }
                    },
                    pair2: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: { label: "centerViewPoint" }
                    },
                    ratio: 1
                },
                labelEffectiveEndOfDocPoint: {
                    pair1: {
                        point1: { label: "effectiveEndOfDocPoint" },
                        point2: [{ endOfDocPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: { label: "centerViewPoint" }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { viewStaysWithinDocument: false },
            position: {
                // defining the viewLengthBeforeBeginningOfDoc/viewLengthAfterEndOfDoc to limit the motion of the document which exceeds the boundaries of the view.
                labelViewLengthBeforeDocBeginning: {
                    pair1: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: { label: "viewLengthBeforeBeginningOfDoc" },
                        point2: [{ beginningOfDocPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                labelViewLengthAfterDocEnd: {
                    pair1: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: { type: [{ highHTMLLength: _ }, [me]] },
                        point2: { label: "viewLengthAfterEndOfDoc" }
                    },
                    ratio: 1
                },
                beginningOfDocBeforeBeginningOfView: {
                    point1: { label: "viewLengthBeforeBeginningOfDoc" },
                    point2: [{ beginningOfViewPoint: _ }, [me]],
                    min: 0
                },
                endOfDocAfterEndOfView: {
                    point1: [{ endOfViewPoint: _ }, [me]],
                    point2: { label: "viewLengthAfterEndOfDoc" },
                    min: 0
                }
            }
        },
        {
            qualifier: { viewStaysWithinDocument: true },
            position: {
                beginningOfDocBeforeBeginningOfView: {
                    point1: [{ beginningOfDocPoint: _ }, [me]],
                    point2: [{ beginningOfViewPoint: _ }, [me]],
                    min: 0
                }
            }
        },
        {
            qualifier: {
                viewStaysWithinDocument: true,
                docLongerThanView: true
            },
            context: {
                viewStaysWithinDocumentEndOfDocStopper: [{ endOfViewPoint: _ }, [me]],
                viewStaysWithinDocumentEndOfDoc: [{ endOfDocPoint: _ }, [me]],
            },
            position: {
                endOfDocAfterEndOfView: {
                    point1: [{ viewStaysWithinDocumentEndOfDocStopper: _ }, [me]],
                    point2: [{ viewStaysWithinDocumentEndOfDoc: _ }, [me]],
                    min: 0
                }
            }
        },
        {
            qualifier: {
                viewStaysWithinDocument: true,
                docLongerThanView: false
            },
            position: {
                docShouldNotMove: {
                    point1: [{ beginningOfViewPoint: _ }, [me]],
                    point2: [{ beginningOfDocPoint: _ }, [me]],
                    equals: 0,
                    // this weakerThanDefault priority is important: it ensures that this constraint doesn't get in the way in the situation where a doc/view
                    // pair of areas, with a *preexisting* scrolled-to value (different from the initial value of 0), is recreated
                    // (see the thread "the solution to #1990")
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: { docMoving: true },
            position: {
                anchorDocToView: o() // if document is moving, the positioning constraint anchoring the document to the view should be removed
            },
            write: {
                onMovableControllerMouseUpWhenDocMoving: {
                    "class": "OnAnyMouseUp",
                    true: {
                        // this is the closure of the sequence that started with Movable taking a mouseDown, and setting its associated MovableController's docMoving to true.
                        turnDocMovingOff: {
                            to: [{ docMoving: _ }, [me]],
                            merge: false
                        }
                        // additional actions provided by inheriting classes
                    }
                }
            }
        },
        {
            qualifier: { docLongerThanView: true },
            "class": "ViewBackFwdOnPageUpDown",
            write: {
                onMovableControllerBeginningOfDoc: {
                    upon: [{ msgType: "BeginningOfDoc" }, [myMessage]]
                    // true: see inheriting classes
                },
                onMovableControllerEndOfDoc: {
                    upon: [{ msgType: "EndOfDoc" }, [myMessage]]
                    // true: see inheriting classes
                },
                onMovableControllerViewBack: {
                    upon: [{ msgType: "ViewBack" }, [myMessage]]
                    // true: see inheriting classes
                },
                onMovableControllerViewFwd: {
                    upon: [{ msgType: "ViewFwd" }, [myMessage]]
                    // true: see inheriting classes
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by DraggableMovable, and by JITMovableInAS. It inherits DefaultLogicalBeginningAndEnd.
    // This class writes to its MovableController's docMoving context label, in order to allow/disallow moving the doc.
    // 
    // API: 
    // 1. movableController: area reference of the associated MovableController. 
    // 2. logicalBeginning/logicalEnd: by default, defined to be [me]'s "beginning"/"end" (inheritance of DefaultLogicalBeginningAndEnd).
    //    Inheriting class may override (remember to use atomic()) - currently, no inheriting classes overrides these default definitions.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Movable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofMovableController: [{ movableController: { movable: _ } }, [me]],
                stackBelowScrollbars: [and,
                    // only if this is not an instance of a scroller, 
                    [not,
                        [
                            [me],
                            [areaOfClass, "Scroller"]
                        ]
                    ],
                    // and if one of the associated movableController's scrollbars set to overlap the view
                    [{ movableController: { myScrollbars: { attachToViewOverlap: _ } } }, [me]]
                ],
                docLongerThanView: [{ movableController: { docLongerThanView: _ } }, [me]]
            }
        },
        { // default 
            "class": o("GeneralArea", "DefaultLogicalBeginningAndEnd")
        },
        {
            qualifier: {
                ofMovableController: true,
                docLongerThanView: true
            },
            write: {
                onMovableMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        turnDocMovingOn: {
                            to: [{ movableController: { docMoving: _ } }, [me]],
                            merge: true
                        },
                        continuePropagation: true
                    }
                }
                // the flip side of this operation - setting docMoving to false, is done in the MovableController.
                // first, because this is to be done OnAnyMouseUp, an event that it can monitor as well as the Movable which took the mouseDown. 
                // second, and more importantly: there are situations (e.g. JIT movable areas) where it is not guaranteed that the Movable that took the mouseDown will exist when the
                // mouseUp event takes place.
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits Movable and DraggableWeakMouseAttachment.
    // It is inherited by Scroller and MovableInAS.
    // 
    // API:
    // See Movable's API.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableMovable: {
        "class": o("Movable", "DraggableWeakMouseAttachment")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Movable Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Movable AreaSet Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class implements the control of an areaSet of MovableInAS which is common to the JITMovableASController and to MovableASController.
    // It inherits MovableController. This class adds message handlers for Next/Prev.
    // 
    // API:
    // 1. see MovableController.
    // 2. movables: an ordered set of area references, which (all, at a given moment) indirectly inherit MovableInAS.
    //    This class currently makes no use of movables itself, but its inheriting classes do.
    // 3. movableSpacing: spacing between the MovableInAS areas that can snap to grid (implied: it is fixed between all areas!). 0, by default.
    // 4. movablesUniqueIDs: an os of uniqueIDs representing all the movable elements (not necessarily always in existence as areas - depending on whether JIT or not)
    // 5. movablesBaseSetUniqueIDs: the base set which serves as a *superset* of movablesUniqueIDs 
    //    (e.g. the effectiveBaseOverlay's solutionSet, compared to the primary overlay's solutionSet).
    //    This is used to identify the replacement firstInViewUniqueID, in case the specifiedFiVUniqueID is no longer part of the movablesUniqueIDs.
    // 6. fillUpMovablesViewToCapacity: a boolean flag (default: true) which indicates whether at the end of a scrolling operation at the end of the document, the view will be kept as full
    //    as possible, or not.
    // 7. movableCoveringBeginningOfViewPoint: inheriting classes should define this context label, as it is reference by the MovableInASCore class.
    // 8. movableUniqueIDAttr: the name of the attribute in the associated MovableInAs, which uniquely identifies it. "uniqueID", by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovableASControllerCore: {
        "class": o("MovableController", "NextPrevOnArrowOrWheel"),
        context: {
            movablesBaseSetUniqueIDs: [{ movablesUniqueIDs: _ }, [me]], // default value. inheriting class may override!
            movableSpacing: 0, // default value
            fillUpMovablesViewToCapacity: true, // default value                

            sizeOfMovablesUniqueIDs: [size, [{ movablesUniqueIDs: _ }, [me]]],

            firstMovable: [first, [{ movables: _ }, [me]]],
            lastMovable: [last, [{ movables: _ }, [me]]],
            movableUniqueIDAttr: "uniqueID"
        },
        write: {
            onMovableASControllerPrev: {
                upon: [{ msgType: "Prev" }, [myMessage]]
                // true: provided by inheriting classes
            },
            onMovableASControllerNext: {
                upon: [{ msgType: "Next" }, [myMessage]]
                // true: provided by inheriting classes
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class implements the AOT (Ahead of Time) control of an areaSet of MovableInAS.
    // It inherits MovableControllerCore. It is inherited by SnappableController and ContMovableController.
    // The JIT alternative to this class has better performance, so when should we use MovableASController? When the areas in the areaSet are of variable lengths.
    // One natural example is the facets, which can both start out at different lengths (widths in the case of the facets, but we use 'length' to refer to the magnitude of the MovableInAs
    // in the scrolling axis), and their length can of course be modified by switching between their expansion states.
    // 
    // firstFiV/lastFiV:
    // 2. firstFiV - the first MovableInAS in the solution set.
    // 3. lastFiV - a calculation on the os of movables - the MovableInAS which is < view length > before the end of the document. 
    //  
    // API:
    // 1. see MovableControllerCore
    // 2. movableCoveringBeginningOfViewPoint: default definition provided herein. Inheriting classes (e.g. SnappableReorderableController) may override it.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovableASController: o(
        { // default 
            "class": "MovableASControllerCore",
            context: {
                // defining beginningOfDocPoint and endOfDocPoint for MovableController
                beginningOfDocPoint: [{ firstMovable: { logicalBeginning: _ } }, [me]],
                endOfDocPoint: [{ lastMovable: { logicalEnd: _ } }, [me]],

                firstFiV: [{ firstMovable: _ }, [me]],
                // lastFiV - see two variants below

                movablesBeforeBeginningOfViewPoint: [{ myLogicalBeginningBeforeBeginningOfViewPoint: true }, [{ movables: _ }, [me]]],

                movableCoveringBeginningOfViewPoint: [cond,
                    [{ movablesBeforeBeginningOfViewPoint: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [last, [{ movablesBeforeBeginningOfViewPoint: _ }, [me]]]
                        },
                        {
                            on: false,
                            use: [{ firstMovable: _ }, [me]]
                        }
                    )
                ],
                movableCoveringViewLengthBeforeBeginningOfView: [first, [{ myLogicalBeginningAfterViewLengthBeforeBeginningOfView: true }, [{ movables: _ }, [me]]]],
                movableCoveringEndOfView: [last, [{ myLogicalBeginningBeforeEndOfView: true }, [{ movables: _ }, [me]]]]
            }
        },
        {
            qualifier: { docLongerThanView: true },
            context: {
                // calculating the areaRef of the last area that can snap. the identity of the lastFiV depends on fillUpMovablesViewToCapacity:
                // if fillUpMovablesViewToCapacity we take the area in the areaSEt that will ensure that on mouseUp the view will fill up to capacity.
                // otherwise, it should simply be the lastMovable.
                lastFiV: [cond,
                    [and,
                        [{ fillUpMovablesViewToCapacity: _ }, [me]],
                        // the cond below is to make sure that in addition to the 'common' scenario, where there are movables for which myLogicalBeginningAfterViewLengthBeforeEndOfDoc: 
                        // true, do exist, we also support the case where the lastMovable is wider than the view, in which case its logicalBeginning will actually be *before* the 
                        // viewLengthBeforeBeginningOfDoc, and given that it's the lastMovable, there is no other movables after it. note that we're in the { docLongerThanView: true } 
                        // scenario - that means the document is longer than the view.
                        [
                            { myLogicalBeginningAfterViewLengthBeforeEndOfDoc: true },
                            [{ movables: _ }, [me]]
                        ]
                    ],
                    o(
                        {
                            on: true,
                            // note that lastFiV, is  updated in "real-time", i.e. when the Mouse is still down - this is of relevance when performing combined actions like 
                            // reordering and scrolling/snapping-to-view: lastFiV is updated in "real-time", whereas movables, and therefore firstMovable and lastMovable 
                            // are updated only on MouseUp.
                            use: [first, [{ myLogicalBeginningAfterViewLengthBeforeEndOfDoc: true }, [{ movables: _ }, [me]]]]
                        },
                        {
                            on: false,
                            use: [{ lastMovable: _ }, [me]]
                        }
                    )
                ]
            },
            position: {
                // viewLengthBeforeBeginningOfView is a posPoint that's offset from beginningOfViewPoint is equal to the offset from beginningOfViewPoint to endOfViewPoint. 
                // needed to figure out which is the Snappable area that will be set to firstInView when viewBack is triggered.
                labelViewBackPoint: {
                    pair1: {
                        point1: { label: "viewLengthBeforeBeginningOfView" },
                        point2: [{ beginningOfViewPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                labelViewLengthBeforeEndOfDoc: { // used for calculation of lastFiV/lastFiVUniqueID (depending on the inheriting class).
                    pair1: {
                        point1: { label: "viewLengthBeforeEndOfDoc" },
                        point2: [{ endOfDocPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { docLongerThanView: false }, // i.e. doc is shorter than view
            context: {
                // if the doc is shorter than the view, then the firstFiV is also the lastFiV
                lastFiV: [{ firstFiV: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class implements the control of a JIT areaSet of MovableInAS, each with their uniqueID. It inherits MovableASControllerCore and DraggableWeakMouseAttachment.
    // It is inherited by JITSnappableController (no JITContMovableASController inherits this class for now - for lack of demand).
    // 
    // This class defines the JIT doc and the JIT view.
    // 1. The JIT doc is a virtual entity, defined by two posPoints. Typically, only some of the elements pertaining to the movablesUniqueIDs os will be represented by areas in an areaSet -
    //    this is the essence of the JIT operation. Still, this class defines the JIT Doc as the points that extend from where the area pertaining to [first, movablesUniqueIDs] would have 
    //    been to where the area pertaining to [last, movablesUniqueIDs] would have been.
    // 2. The JIT view is another virtual entity that is centered aorund the actual view, and typically extends beyond it (the ratio of their lengths is defined by ratioOfJITViewToView).
    //    The two posPoints defining the JIT view are used to determine the range of indices within movablesUniqueIDs for which areas in the corresponding areaSet should be created.
    // 3. This class defines the jitMovableInASTmd appData. It is turned on when one of the controller's JITMovableInAS areas takes a mouseDown, and sets itself back to false 
    //    on a mouseUp. Note we write directly to this appData as the area that took the mouseDown may not even exist on the mouseUp (as it will be moved out of view and destroyed).
    //    This flag is NOT synonymous with docMoving. docMoving is true when one of the JITMovableInAS takes a mouseDown, but docMoving is also true when the associated scroller takes
    //    a mouseDown. When that scroller takes a mouseDown we do NOT mark jitMovableInASTmd as true, and consequently, this class' 'dragged' is not set to true, and the JIT document
    //    does NOT move along with the mouse - the scroller does instead, and with the help of the linear constraints connecting its position to that of the document, the document is 
    //    moved.
    //
    // API:
    // 1. see MovableASControllerCore
    // 2. ratioOfJITViewToView: how long is the JITView relative to the actual view. the JITView dfines the window for which we create JITSnappables. 
    //    default is defaultRatioJITViewToView.
    // 3. lengthOfJITElement: the (fixed) length of each element in the set of JIT elements, used to calculate its positioning.
    // 4. indexOfMovableCoveringBeginningOfViewPoint: the index of the movableUniqueID (in movablesUniqueIDs) which is covering the beginning of the view point.
    //
    // Export:
    // 1. jitMovablesRange: a range of indices calculated based on the movablesUniqueIDs os. It should be use to calculate the data of the JITMovableInAS areaSet, by its embedding area.
    //    Note this is not necessarily the same area inheriting JITMovableASController (in snappableTest for example, this functionality is handled by separate areas).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITMovableASController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*jitMovableInASTmd": false,
                mouseIsDown: [
                    {
                        type: "MouseDown",
                        recipient: [{ movableController: [me] }, [areaOfClass, "JITMovableInAS"]]
                    },
                    [message]
                ]
            }
        },
        { // default
            "class": o("MovableASControllerCore", "DraggableWeakMouseAttachment"),
            context: {
                // MovableASControllerCore params - override their defaults
                beginningOfDocPoint: atomic({
                    element: [me],
                    label: "beginningOfJITDoc"
                }),
                endOfDocPoint: atomic({
                    element: [me],
                    label: "endOfJITDoc"
                }),

                beginningOfJITView: {
                    element: [me],
                    label: "beginningOfJITView"
                },
                endOfJITView: {
                    element: [me],
                    label: "endOfJITView"
                },
                ratioOfJITViewToView: [{ tableConstants: { defaultRatioJITViewToView: _ } }, [globalDefaults]],

                lastIndexInMovablesUniqueIDs: [minus, [{ sizeOfMovablesUniqueIDs: _ }, [me]], 1],
                lengthOfJITElementPlusSpacing: [plus,
                    [{ lengthOfJITElement: _ }, [me]],
                    [{ movableSpacing: _ }, [me]]
                ],

                lowIndexInMovablesUniqueIDs: [
                    max,
                    0,
                    [
                        [{ indexAtOffsetFromAnchorIndex: _ }, [me]],
                        [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                        [offset,
                            [{ beginningOfViewPoint: _ }, [me]],
                            [{ beginningOfJITView: _ }, [me]]
                        ]
                    ]
                ],
                highIndexInMovablesUniqueIDs: [
                    max,
                    0,
                    [
                        [{ indexAtOffsetFromAnchorIndex: _ }, [me]],
                        [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                        [offset,
                            [{ beginningOfViewPoint: _ }, [me]],
                            [{ endOfJITView: _ }, [me]]
                        ]
                    ]
                ],

                // lengthOfJITElementsDoc is the product of the num of JITElements and the joint length of a JIT element + the spacing between them, minus one spacing (as the last
                // element need not have spacing following it).
                lengthOfJITElementsDoc: [cond,
                    [{ movablesUniqueIDs: _ }, [me]],
                    o(
                        {
                            on: false, // if movablesUniqueIDs not defined, the doc is of length 0 (otherwise, it would get a negative value!)
                            use: 0
                        },
                        {
                            on: true,
                            use: [minus,
                                [mul,
                                    [{ lengthOfJITElementPlusSpacing: _ }, [me]],
                                    [{ sizeOfMovablesUniqueIDs: _ }, [me]]
                                ],
                                [{ movableSpacing: _ }, [me]]
                            ]
                        }
                    )
                ],

                indexAtOffsetFromAnchorIndex: [defun,
                    // the point in the view for which we want to calculate the index of the movable area covering it.
                    o("anchorIndex", "offset"),
                    [min, // the maximum index would be the index of the last element in movablesUniqueIDs
                        [{ lastIndexInMovablesUniqueIDs: _ }, [me]],
                        [max, // the minimal index would obviously be 0, that is the first element in movablesUniqueIDs
                            0,
                            [plus,
                                "anchorIndex",
                                [divMod, // note we use divMod, not [floor]. if the ratio of the dividend/divisor is negative, divMode equals [ceil]!
                                    // effectively a rounding down of the number of elements (plus their spacing) which fit into the offset between
                                    // the beginning of the JIT doc and the beginning of the view.
                                    [plus,
                                        // add the intra-element spacing to the offset between the beginning of the JIT doc and the beginning of the view
                                        [cond,
                                            [greaterThanOrEqual, "offset", 0],
                                            o(
                                                { on: true, use: [{ movableSpacing: _ }, [me]] },
                                                { on: false, use: [mul, -1, [{ movableSpacing: _ }, [me]]] }
                                            )
                                        ],
                                        "offset"
                                    ],
                                    [{ lengthOfJITElementPlusSpacing: _ }, [me]]
                                ]
                            ]
                        ]
                    ]
                ],

                // This function accepts an anchorIndex, and an offset from it (either positive or negative offset). It returns the uniqueID of the element at that offset.
                uniqueIDAtOffsetFromAnchorIndex: [defun,
                    o("anchorIndex", "offset"),
                    [pos,
                        [
                            [{ indexAtOffsetFromAnchorIndex: _ }, [me]],
                            "anchorIndex",
                            "offset"
                        ],
                        [{ movablesUniqueIDs: _ }, [me]]
                    ]
                ],

                movableCoveringBeginningOfViewPointUniqueID: [pos,
                    [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                    [{ movablesUniqueIDs: _ }, [me]]
                ],
                movableCoveringBeginningOfViewPoint: [
                    [constructAVP,
                        [{ movableUniqueIDAttr: _ }, [me]],
                        [{ movableCoveringBeginningOfViewPointUniqueID: _ }, [me]]
                    ],
                    [{ movables: _ }, [me]]
                ],
                lastFiVUniqueID: [cond,
                    [{ fillUpMovablesViewToCapacity: _ }, [me]],
                    o(
                        {
                            on: true,
                            // find the index of the movable covering the point that's not a view length before the end of the doc, 
                            // but rather at another element length closer to the doc's end.
                            use: [
                                [{ uniqueIDAtOffsetFromAnchorIndex: _ }, [me]],
                                [{ lastIndexInMovablesUniqueIDs: _ }, [me]],
                                // we look not at a view length before the end of the doc, but rather at a point that another element length closer to its end.
                                [mul,
                                    -1,
                                    [minus,
                                        [{ viewLength: _ }, [me]],
                                        [{ lengthOfJITElementPlusSpacing: _ }, [me]]
                                    ]
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: [last, [{ movablesUniqueIDs: _ }, [me]]]
                        }
                    )
                ],

                // DraggableWeakMouseAttachment - override default params:
                tmdAppData: false, // do not inherit Tmdable; instead dragged is a writable reference to jitMovableInASTmd.
                dragged: [{ jitMovableInASTmd: _ }, [me]], // if one of my JITMovableInAS took a mouseDown, then the JIT document is being dragged along with the mouse.

                // the context label exported by this class: the range of indices which should be used to construct the JITMovableInAS areaSet.
                jitMovablesRange: r(
                    [{ lowIndexInMovablesUniqueIDs: _ }, [me]],
                    [{ highIndexInMovablesUniqueIDs: _ }, [me]]
                )
            },
            position: {
                offsetBetweenJITBeginningAndEndOfDoc: {
                    point1: { label: "beginningOfJITDoc" },
                    point2: { label: "endOfJITDoc" },
                    equals: [{ lengthOfJITElementsDoc: _ }, [me]]
                },

                // positioning the beginningOfJITView/endOfJITView
                lengthOfJITView: {
                    pair1: {
                        point1: [{ beginningOfViewPoint: _ }, [me]],
                        point2: [{ endOfViewPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: { label: "beginningOfJITView" },
                        point2: { label: "endOfJITView" }
                    },
                    ratio: [{ ratioOfJITViewToView: _ }, [me]]
                },
                jitViewCenteredAroundView: {
                    pair1: {
                        point1: { label: "beginningOfJITView" },
                        point2: [{ beginningOfViewPoint: _ }, [me]]
                    },
                    pair2: {
                        point1: [{ endOfViewPoint: _ }, [me]],
                        point2: { label: "endOfJITView" }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { jitMovableInASTmd: true },
            write: {
                onJITMovableASControllerMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        jitMovableInASTmd: {
                            to: [{ jitMovableInASTmd: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited either by MovableInAS or by JITMovableInAS.
    // API:
    // 1. movableController (and its movableCoveringBeginningOfViewPoint context label).
    // 2. uniqueID (or another context label that matches the value of movableUniqueIDAttr in the corresponding MovableController 
    //    (which is "uniqueID", by default)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovableInASCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // to be used by inheriting classes, for display (or any other) purposes
                movableCoveringBeginningOfViewPoint: [equal,
                    [me],
                    [{ movableController: { movableCoveringBeginningOfViewPoint: _ } }, [me]]
                ]
            }
        },
        { // default
            context: {
                movables: [{ movableController: { movables: _ } }, [me]],
                myIndexInMovablesUniqueIDs: [index,
                    [{ movableController: { movablesUniqueIDs: _ } }, [me]],
                    [{ uniqueID: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PositionRelativeToBeginningOfDoc: {
        // JIT movable areas are positioned relative to the beginning of the document, and not to their prev (which may not exist!)     
        relativeToBeginningOfDocPoint: {
            point1: [{ movableController: { beginningOfDocPoint: _ } }, [me]],
            point2: [{ logicalBeginning: _ }, [me]],
            equals: [mul,
                [{ myIndexInMovablesUniqueIDs: _ }, [me]],
                [{ movableController: { lengthOfJITElementPlusSpacing: _ } }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited either by its axis-specific classes, or by Snappable (which also has its axis specific classes). It should not be inherited directly. 
    // It inherits MovableInASCore and DraggableMovable.
    //
    // API:
    // 1. see DraggableMovable's and MovableInASCore's API.
    // 2. positionRelativeToPrev: should the area be positioned relative to its prev or based on its index in the movablesUniqueIDs os.
    //    true, by default. This flag is a hack to test the performance cost of this relative positioning. In reality we won't want to inherit MovableInAS and set 
    //    positionRelativeToPrev to false - we're better off in that situation (which assumes the areas of the areSet are of equal length and spacing) using the JIT classes.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MovableInAS: o(
        {
            qualifier: "!",
            context: {
                positionRelativeToPrev: true // default
            }
        },
        { // default 
            "class": o("MovableInASCore", "DraggableMovable"),
            context: {
                // specifying a set of myLogical* context labels, which are used on mouseUp events, ViewFwd/ViewBack events, to determine the new specifiedFiVUniqueID
                // if this class is inherited by SnappableVisReorderable - see there for the cases in which we override the definition of this context label
                myLogicalBeginningBeforeBeginningOfViewPoint: [greaterThanOrEqual,
                    // true iff logicalBeginning is at least <snappableSpacing> before the beginningOfViewPoint
                    [{ movableController: { movableSpacing: _ } }, [me]],
                    [offset,
                        [{ movableController: { beginningOfViewPoint: _ } }, [me]],
                        [{ logicalBeginning: _ }, [me]]
                    ]
                ],
                myLogicalBeginningAfterViewLengthBeforeEndOfDoc: [greaterThanOrEqual,
                    [offset,
                        {
                            element: [{ movableController: _ }, [me]],
                            label: "viewLengthBeforeEndOfDoc"
                        },
                        [{ logicalBeginning: _ }, [me]]
                    ],
                    0
                ],
                myLogicalBeginningAfterViewLengthBeforeBeginningOfView: [greaterThanOrEqual,
                    [offset,
                        {
                            element: [{ movableController: _ }, [me]],
                            label: "viewLengthBeforeBeginningOfView"
                        },
                        [{ logicalBeginning: _ }, [me]]
                    ],
                    0
                ],
                myLogicalBeginningBeforeEndOfView: [greaterThanOrEqual,
                    [offset,
                        [{ logicalBeginning: _ }, [me]],
                        [{ movableController: { endOfViewPoint: _ } }, [me]]
                    ],
                    0
                ]
            }
        },
        {
            qualifier: { positionRelativeToPrev: true },
            "class": "MemberOfPositionedAreaOS",
            context: {
                // Override MemberOfPositionedAreaSet params:
                areaOS: [{ movables: _ }, [me]],
                myAreaOSPosPoint: [{ logicalBeginning: _ }, [me]],
                myPrevInAreaOSPosPoint: [{ myPrevInAreaOS: { logicalEnd: _ } }, [me]],
                spacingFromPrev: [{ movableController: { movableSpacing: _ } }, [me]]
            }
        },
        {
            qualifier: { positionRelativeToPrev: false },
            position: {
                "class": "PositionRelativeToBeginningOfDoc"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class which can be moved horizontally as part of an areaSet of MovableInAS. Works in conjunction with a controller class that inherits MovableASController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalMovableInAS: {
        "class": o("Horizontal", "MovableInAS")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class which can be moved vertically as part of an areaSet of MovableInAS. Works in conjunction with a controller class that inherits MovableASController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalMovableInAS: {
        "class": o("Vertical", "MovableInAS")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by JITSnappable (which also has its axis specific classes). We should have a JITContMovableInAS, but there has been no demand for 
    // one as of yet..
    // This class inherits MovableInASCore and Movable. 
    // Note it does NOT inherit DraggableMovable but merely Movable: it is not the JITMovableInAS that's being dragged, but rather the document in its entirety. 
    // We don't drag the JITMovableInAS itself, as it may very well be destroyed as a result of scrolling, in order to allow changing the areas in the areaSet, 
    // per the JIT concept.
    //
    // It provides the area with its positioning along the scrolling axis wrt the beginningOfDocPoint.
    //
    // Important Note: The class which embeds an areaSet of a class inheriting  JITMovableInAS should define the data of the areaSet using [anonymize]
    //
    // API:
    // 1. see MovableInASCore's and Movable's API
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITMovableInAS: o(
        { // default
            "class": o("MovableInASCore", "Movable"),
            position: {
                "class": "PositionRelativeToBeginningOfDoc"
            }
        },
        {
            qualifier: { movableController: true },
            write: {
                onJITMovableInASMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        turnJITMovableInASTmd: {
                            to: [{ movableController: { jitMovableInASTmd: _ } }, [me]],
                            merge: true
                        },
                        continuePropagation: true
                    }
                }
                // the flip side of this operation - setting jitMovableInASTmd to false, is done in the JITMovableASController.
                // first, because this is to be done OnAnyMouseUp, an event that it can monitor as well as the Movable which took the mouseDown. 
                // second, and more importantly: it is not guaranteed that the JITMovableInAS that took the mouseDown will exist when the mouseUp event takes place.
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Movable AreaSet Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Snappable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class implements the control of a snapping of an ordered set of Snappable areas to a view's beginningOfViewPoint. 
    // It inherits MovableASControllerCore. It is inherited by SnappableController and JITSnappableController.
    //
    // Calculating firstInView: The calculation is done on the uniqueIDs and not the areas which represent them, as we are not guaranteed to have those areas around when the calculation
    // is made (e.g. JIT classes). The values used in this algorithm:
    // 1. specifiedFiVUniqueID (user-specified first in view): appData
    //    this is what the user indicates as their preference when they drag the document relative to the view.
    //    this would be the Snappable area that the snapTo posPoint ran through (with special handling for the first/last movables) on mouseUp. 
    //    note that this could be for a Snappable area that's no longer in the document (i.e. no longer in the solution set). It is initialized to o().
    // 2. firstFiVUniqueID/lastFiVUniqueID: the lastFiVUniqueID represents the last element which can serve as the firstInView. it is currently not the last element in the os, 
    //    as we fill up the view with as many elements as possible.
    // 3. nominalFiVUniqueID: 
    //    equal to specifiedFiVUniqueID, unless its absent from movablesUniqueIDs, in which case we take the first in movablesUniqueIDs to follow specifiedFiVUniqueID. could be o().
    //    based on nominalFiVUniqueID we calculate nominalFiVUniqueIDInNextStarOfLastFiVUniqueID, which is true if nominalFiVUniqueID is o(), and otherwise is equal to the 
    //    booleanization of the selection of nominalFiVUniqueID on nextStarOfLastFiVUniqueID. 
    //    And now in plainer English: nominalFiVUniqueIDInNextStarOfLastFiVUniqueID is true if nominalFiVUniqueID is o(), or it appears after lastFiVUniqueID in movablesUniqueIDs.
    // 4. We calculate firstInViewUniqueID: 
    //    if specifiedFiVUniqueID == o(), then firstInViewUniqueID := firstFiVUniqueID
    //    else if nominalFiVUniqueIDInNextStarOfLastFiVUniqueID is true then firstInViewUniqueID := lastFiVUniqueID
    //    else firstInViewUniqueID := specifiedFiVUniqueID
    // 5. Using firstInViewUniqueID we determine the firstInView areaRef.
    // 
    // Notes: 
    // 1. SnappableControllerCore need not be an ancestor of the Snappable areas.
    // 2. A given area can inherit either a horizontal snappable controller or a vertical one. It cannot inherit both. If 2D snapping is required, two separate areas are needed,
    //    one for snapping in each of the desired axes. 
    //    This is a limitation of the current platform, that could be alleviated if class inheritance using templates, or some other equivalent scheme, is introduced.
    //
    // API:
    // 1. see MovableASControllerCore, which is a sibling class (i.e. indirectly inherited by the class which inherits SnappableControllerCore).
    // 2. lastFiVUniqueID: the uniqueID of the very last element which can serve as first in view (this is calculated based on the inherited fillUpMovablesViewToCapacity flag)
    // 3. defaultSpecifiedFivUniqueID: o(), by default
    // 4. Inheriting class should define the lastFiVBeginning posPoint label. 
    // 5. resetSpecifiedFiVUniqueIDWhenNoLongerInMovables: boolean, true, by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableControllerCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                scrolledToBeginning: [equal,
                    [{ firstFiVUniqueID: _ }, [me]],
                    [{ firstInViewUniqueID: _ }, [me]]
                ],
                scrolledToEnd: [equal,
                    [{ lastFiVUniqueID: _ }, [me]],
                    [{ firstInViewUniqueID: _ }, [me]]
                ],
                resetSpecifiedFiVUniqueIDWhenNoLongerInMovables: true
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                snappableUniqueIDProjectionQuery: [constructProjQuery,
                    [{ movableUniqueIDAttr: _ }, [me]]
                ],
                // beginning of firstInViewUniqueID calculation 

                // initial value for the *user-specified* first area in the view - this area by definition exists when the value is written into the appData, but it may not exist 
                // later on (e.g. an item filtered out of the overlay's solutionSet, which may or may not return to the solutionSet at some point prior to the user's specifications 
                // changing).
                "^specifiedFiVUniqueID": o(),
                specifiedFiVUniqueIDInMovables: [
                    [{ specifiedFiVUniqueID: _ }, [me]],
                    [{ movablesUniqueIDs: _ }, [me]]
                ],
                // the nominalFiVUniqueID is either specifiedFiVUniqueID, or in its absence, the first in movablesUniqueIDs to follow it.
                // it is only the nominal one as we now need to see whether it comes after lastFiVUniqueID, in which case lastFiVUniqueID will be the 
                // firstInViewUniqueID.

                // nominalFiVUniqueID is the specifiedFiVUniqueID, if it is present in movablesUniqueIDs. 
                // otherwise, we take the first element in the intersection of movablesUniqueIDs with the os of uniqueIDs that follow specifiedFiVUniqueID 
                // in movablesBaseSetUniqueIDs (the superset of movablesUniqueIDs): in other words, in the absence of specifiedFiVUniqueID from 
                // movablesUniqueIDs, find out the one to follow it there.
                nominalFiVUniqueID: [cond,
                    [empty, [{ movablesUniqueIDs: _ }, [me]]],
                    o(
                        {
                            on: true,
                            use: o()
                        },
                        {
                            on: false,
                            use: [cond,
                                [{ specifiedFiVUniqueIDInMovables: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [{ specifiedFiVUniqueID: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [first,
                                            [
                                                [{ movablesUniqueIDs: _ }, [me]],
                                                [nextStar,
                                                    [{ movablesBaseSetUniqueIDs: _ }, [me]],
                                                    [{ specifiedFiVUniqueID: _ }, [me]]
                                                ]
                                            ]
                                        ]
                                    }
                                )
                            ]
                        }
                    )
                ],

                firstFiVUniqueID: [first, [{ movablesUniqueIDs: _ }, [me]]],
                // lastFiVUniqueID: provided by inheriting classes.

                // Checks if nominalFiVUniqueID follows lastFiVUniqueID by
                // comparing indices.
                nominalFiVUniqueIDInNextStarOfLastFiVUniqueID: [cond,
                    [{ nominalFiVUniqueID: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [
                                greaterThanOrEqual,
                                [index,
                                    [{ movablesUniqueIDs: _ }, [me]],
                                    [{ nominalFiVUniqueID: _ }, [me]]
                                ],
                                [index,
                                    [{ movablesUniqueIDs: _ }, [me]],
                                    [{ lastFiVUniqueID: _ }, [me]]
                                ]
                            ]
                        },
                        {
                            on: false,
                            use: true
                        }
                    )
                ],

                // we calculate firstInViewUniqueID, the uniqueID of the first area in the view, from which we will determine firstInView.
                firstInViewUniqueID: [cond,
                    [{ specifiedFiVUniqueID: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ firstFiVUniqueID: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [cond,
                                [{ nominalFiVUniqueIDInNextStarOfLastFiVUniqueID: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [{ lastFiVUniqueID: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [{ nominalFiVUniqueID: _ }, [me]]
                                    }
                                )
                            ]
                        }
                    )
                ],
                firstInViewSelectionQuery: [constructAVP,
                    [{ movableUniqueIDAttr: _ }, [me]],
                    [{ firstInViewUniqueID: _ }, [me]]
                ],
                firstInView: [
                    [{ firstInViewSelectionQuery: _ }, [me]],
                    [{ movables: _ }, [me]]
                ]
                // end of firstInViewUniqueID calculation 
            },
            write: {
                onMovableControllerBeginningOfDoc: {
                    // upon: see MovableController 
                    true: {
                        firstFiVUniqueIDIsSpecified: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [{ firstFiVUniqueID: _ }, [me]]
                        }
                    }
                },
                onMovableControllerEndOfDoc: {
                    // upon: see MovableController 
                    true: {
                        lastFiVUniqueIDIsSpecified: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [{ lastFiVUniqueID: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                defaultAnchorDocToView: true,
                docMoving: false
            },
            position: {
                anchorDocToView: {
                    point1: [{ beginningOfViewPoint: _ }, [me]],
                    point2: [{ firstInView: { logicalBeginning: _ } }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { scrolledToBeginning: false },
            write: {
                onMovableASControllerPrev: {
                    // upon: provided by MovableASController
                    true: {
                        prevOfFirstInViewUniqueIDIsSpecified: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [prevInOS, // a temporary hack till [prev] is fast enough!
                                [{ movablesUniqueIDs: _ }, [me]],
                                [{ firstInViewUniqueID: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { scrolledToEnd: false },
            write: {
                onMovableASControllerNext: {
                    // upon: provided by MovableASController
                    true: {
                        nextOfFirstInViewUniqueIDIsSpecified: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [nextInOS, // a temporary hack till [next] is fast enough!
                                [{ movablesUniqueIDs: _ }, [me]],
                                [{ firstInViewUniqueID: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { viewStaysWithinDocument: true },
            context: {
                // override default definitions in MovableController
                viewStaysWithinDocumentEndOfDocStopper: atomic([{ beginningOfViewPoint: _ }, [me]]),
                viewStaysWithinDocumentEndOfDoc: atomic({ label: "lastFiVBeginning" })
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SnappableControllerCore and MovableASController.
    // It is inherited by HorizontalSnappableController and VerticalSnappableController. Inheriting class should inherit these, and not inherit SnappableController directly.
    // 
    // API:
    // 1. see SnappableControllerCore and MovableASController.
    //
    // Notes: 
    // 1. If movables also inherit Reorderable, see SnappableReorderableController/SnappableReorderable in reorderableClasses.js 
    // 2. (no reason why we shouldn't have a JIT version for SnappableReorderableController/SnappableReorderable, but we don't for now..)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableController: {
        "class": o(
            "SnappableControllerCore",
            "MovableASController"
        ),
        context: {
            // SnappableControllerCore params:
            movablesUniqueIDs: [
                [{ snappableUniqueIDProjectionQuery: _ }, [me]],
                [{ movables: _ }, [me]]
            ],
            lastFiVUniqueID: [
                [{ snappableUniqueIDProjectionQuery: _ }, [me]],
                [{ lastFiV: _ }, [me]]
            ]
        },
        write: {
            onMovableControllerMouseUpWhenDocMoving: {
                // upon: provided by MovableController
                true: {
                    "class": "MarkCoveringBeginningOfViewPointAsSpecifiedFiV"
                }
            },
            // below we provide direct-access functionality (also see upon handlers inherited from MovableController)
            onMovableControllerViewBack: {
                // upon: see MovableController 
                true: {
                    // the use of filter here should be replaced with a decent, more efficient, platform function!
                    markCoveringViewBackPointAsSpecifiedFiV: {
                        to: [{ specifiedFiVUniqueID: _ }, [me]],
                        merge: [
                            [{ snappableUniqueIDProjectionQuery: _ }, [me]],
                            [{ movableCoveringViewLengthBeforeBeginningOfView: _ }, [me]]
                        ]
                    }
                }
            },
            onMovableControllerViewFwd: {
                // upon: see MovableController 
                true: {
                    // the use of filter here should be replaced with a decent, more efficient, platform function!
                    markCoveringViewFwdPointAsSpecifiedFiV: {
                        to: [{ specifiedFiVUniqueID: _ }, [me]],
                        merge: [
                            [{ snappableUniqueIDProjectionQuery: _ }, [me]],
                            [{ movableCoveringEndOfView: _ }, [me]]
                        ]
                    }
                }
            }
        },
        position: {
            defineLastFivBeginning: { // define lastFiVBeginning per SnappableControllerCore' API
                point1: [{ lastFiV: { logicalBeginning: _ } }, [me]],
                point2: { label: "lastFiVBeginning" },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A write handler that is inherited by: 
    // 1. SnappableController at the end of a docMoving operation.
    // 2. SnappableReorderableController at the end of a reordering operation.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MarkCoveringBeginningOfViewPointAsSpecifiedFiV: {
        markCoveringAsSpecifiedFiV: {
            to: [{ specifiedFiVUniqueID: _ }, [me]],
            merge: [
                [{ snappableUniqueIDProjectionQuery: _ }, [me]],
                [{ movableCoveringBeginningOfViewPoint: _ }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SnappableController. It also inherits Horizontal, to provide 'beginning' with the proper value.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalSnappableController: {
        "class": o("SnappableController", "Horizontal")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SnappableController. It also inherits Vertical, to provide 'beginning' with the proper value.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalSnappableController: {
        "class": o("SnappableController", "Vertical")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides snap-to-grid functionality. It should not be inherited directly - instead, it's axis-specific versions VerticalSnappable/HorizontalSnappable should be inherited.
    // This class inherits MovableInAS, and does nothing else for the time being.
    // API:
    // 1. see MovableInAS.
    // 2. a uniqueID (see SnappableController)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Snappable: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                iAmFirstInView: [
                    [me],
                    [{ movableController: { firstInView: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": "MovableInAS"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class which can be snapped horizontally. Works in conjunction with a controller class that inherits SnappableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalSnappable: {
        "class": o("Horizontal", "Snappable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class which can be snapped vertically. Works in conjunction with a controller class that inherits SnappableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalSnappable: {
        "class": o("Vertical", "Snappable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of JIT Snappable classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The next section is for the JIT (Just in Time) implementation of the snappable functionality. Here the members of the areaSet of areas which can snap to grid are modified
    // during scrolling so that only those which are in in the JITView (this includes the actual view, plus a few on either side of the view - specified by the ratioOfJITViewToView param) 
    //  are actually created. This is intended to allow an increase in the size of the set of elements which the user scrolls through. Eventually, this functionality will be 
    // provided by the platform, and not in cdl.
    // In terms of terminology, we'll distinguish between the *elements* scrolled, i.e. the entire set, and the snappable areas, i.e. the subset of the elements scrolled for which an area
    // is actually formed by the controller's areaSet.
    //
    // The assumptions made:
    // 1. The elements associated with a given controller are of equal positive length (length here refers to their dimension along the axis of scrolling).
    // 2. During scrolling, the document - the (possibly virtual) entity that spans the length of the entire set of elements - has a fixed length. In between scrolls, this document may
    //    change its length (e.g. in the document of SolutionSetItems, the document would typically change its length when the solutionSet changes).
    // 3. The elements scrolled each have a uniqueID.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. See SnappableControllerCore's and JITMovableASController's API.
    // 2. offsetFromBeginningOfDocToPointer: provided by the axis-specific inheriting classes, based on the offset recorded by the inherited Draggable class.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITSnappableController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofVerticalJITSnappableController: ["Vertical", [classOfArea, [me]]]
            }
        },
        { // default
            "class": o("SnappableControllerCore", "JITMovableASController"),
            context: {
                // SnappableControllerCore expects lastFiVUniqueID, which is provided by JITMovableASController
            },
            write: {
                onMovableControllerMouseUpWhenDocMoving: {
                    // upon: defined by MovableController
                    true: {
                        recordSpecifiedFiVUniqueID: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [{ movableCoveringBeginningOfViewPointUniqueID: _ }, [me]]
                        }
                    }
                },
                onMovableControllerViewBack: {
                    // upon: see MovableController 
                    true: {
                        markCoveringViewBackPointAsSpecifiedFiVUniqueID: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [
                                [{ uniqueIDAtOffsetFromAnchorIndex: _ }, [me]],
                                [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                                [mul, -1, [{ viewLength: _ }, [me]]]
                            ]
                        }
                    }
                },
                onMovableControllerViewFwd: {
                    // upon: see MovableController 
                    true: {
                        markCoveringViewFwdPointAsSpecifiedFiVUniqueID: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: [
                                [{ uniqueIDAtOffsetFromAnchorIndex: _ }, [me]],
                                [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                                [{ viewLength: _ }, [me]]
                            ]
                        }
                    }
                }
            },
            position: {
                defineLastFivBeginning: { // define lastFiVBeginning per SnappableControllerCore' API
                    point1: { label: "lastFiVBeginning" },
                    point2: { label: "endOfJITDoc" },
                    equals: [minus,
                        [mul,
                            [{ lengthOfJITElementPlusSpacing: _ }, [me]],
                            [min, // calculating how many rows before the endOfJITDoc the label should be positioned at:
                                // position the label at the [floor] of the number of elements that can fit in the view (unless there are less elements in the
                                // doc than can actually fill up the view, in which case, that should govern the positioning of the label)
                                [{ sizeOfMovablesUniqueIDs: _ }, [me]],
                                [floor,
                                    [div,
                                        [{ viewLength: _ }, [me]],
                                        [{ lengthOfJITElementPlusSpacing: _ }, [me]]
                                    ]
                                ]
                            ]
                        ],
                        [{ movableSpacing: _ }, [me]]
                    ]
                }
            }
        },
        {
            qualifier: { ofVerticalJITSnappableController: true },
            context: {
                offsetFromBeginningOfDocToPointer: [{ offsetOfDraggableVerticalAnchorFromNormalizedPointer: _ }, [me]],
                draggableVerticalAnchor: [{ beginningOfDocPoint: _ }, [me]] // override the default definition provided by DraggableWeakMouseAttachment
            }
        },
        {
            qualifier: { ofVerticalJITSnappableController: false },
            context: {
                offsetFromBeginningOfDocToPointer: [{ offsetOfDraggableHorizontalAnchorFromNormalizedPointer: _ }, [me]],
                draggableHorizontalAnchor: [{ beginningOfDocPoint: _ }, [me]] // override the default definition provided by DraggableWeakMouseAttachment
            }
        },
        {
            qualifier: { docMoving: true },
            context: {
                indexOfMovableCoveringBeginningOfViewPoint: [
                    [{ indexAtOffsetFromAnchorIndex: _ }, [me]],
                    0,
                    [offset,
                        [{ beginningOfDocPoint: _ }, [me]],
                        [{ beginningOfViewPoint: _ }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: { docMoving: false },
            context: {
                indexOfMovableCoveringBeginningOfViewPoint: [index,
                    [{ movablesUniqueIDs: _ }, [me]],
                    [{ firstInViewUniqueID: _ }, [me]]
                ]
            },
            position: {
                offsetBetweenJITBeginningAndFirstInView: { // a reminder: firstInView is recalculated only on mouseUp, so this indeed holds only when docMoving: false
                    point1: { label: "beginningOfJITDoc" },
                    point2: [{ firstInView: { logicalBeginning: _ } }, [me]],
                    equals: [mul,
                        [{ indexOfMovableCoveringBeginningOfViewPoint: _ }, [me]],
                        [{ lengthOfJITElementPlusSpacing: _ }, [me]]
                    ]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SnappableController. It also inherits Horizontal, to provide 'beginning' with the proper value.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalJITSnappableController: {
        "class": o(
            "Horizontal", // appears before JITSnappableController to override its verticallyDraggable: true (inherited from DraggableWeakMouseAttachment)
            "JITSnappableController"
        )
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits SnappableController. It also inherits Vertical, to provide 'beginning' with the proper value.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalJITSnappableController: {
        "class": o(
            "Vertical", // appears before JITSnappableController to override its horizontallyDraggable: true (inherited from DraggableWeakMouseAttachment)
            "JITSnappableController"
        )
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides snap-to-grid functionality for the JIT (Just In Time) implementation, where the movable areaSet members are changed while scrolling.
    // It should not be inherited directly - instead, it's axis-specific versions VerticalJITSnappable/HorizontalJITSnappable should be inherited.
    // This class inherits JITMovableInAS.
    //
    // API:
    // 1. see JITMovableInAS.
    // 2. a uniqueID (also see JITSnappableController).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITSnappable: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                // not used by this class, but rather are exported to inheriting classes
                firstInAreaOS: [equal, [{ uniqueID: _ }, [me]], [first, [{ movableController: { movablesBaseSetUniqueIDs: _ } }, [me]]]],
                lastInAreaOS: [equal, [{ uniqueID: _ }, [me]], [last, [{ movableController: { movablesBaseSetUniqueIDs: _ } }, [me]]]]
            }
        },
        { // default
            "class": "JITMovableInAS"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A JIT class which can be snapped horizontally. Works in conjunction with a controller class that inherits JITSnappableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalJITSnappable: {
        "class": o("Horizontal", "JITSnappable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A JIT class which can be snapped vertically. Works in conjunction with a controller class that inherits JITSnappableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalJITSnappable: {
        "class": o("Vertical", "JITSnappable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of JIT snappable classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Snappable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of ContMovable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of the Continuous Movable Controller Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the common code to ContMovableASController and ContMovableController.
    //
    // This class defines the viewStaticPosOnDocCanvas writable reference, with the associated appData initialized to 0. viewStaticPosOnDocCanvas specifies the relative position of 
    // the document and the view, with 0 representing the document's beginningOfDocPoint, and 1 representing the document's endOfDocPoint.
    //  
    // Note: A given area can inherit either the Horizontal or the Vertical version of the derived classes. It cannot inherit both. If 2D scrolling is required, two separate areas are 
    // needed, one to inherit Horizontal version and the other to inherit Vertical version. This is a limitation of the current platform, that could be alleviated if class inheritance 
    // using templates, or some other equivalent scheme, is introduced. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContMovableControllerCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                scrolledToBeginning: [equal, [{ viewStaticPosOnDocCanvas: _ }, [me]], 0],
                scrolledToEnd: [equal, [{ viewStaticPosOnDocCanvas: _ }, [me]], 1]
            }
        },
        { // default
            "class": o("PlusWithUpperBound", "MinusWithLowerBound"),
            context: {
                // in the absence of canvas functionality.
                "^viewStaticPosOnDocCanvasAD": o(),
                viewStaticPosOnDocCanvas: [mergeWrite,
                    [{ viewStaticPosOnDocCanvasAD: _ }, [me]],
                    0
                ]

                // beginningOfDocPoint/endOfDocPoint provided by inheriting class                
            },
            write: {
                onMovableControllerMouseUpWhenDocMoving: {
                    // upon: see MovableController
                    true: {
                        "class": "SetDynamicPosOnDocCanvasAsStatic"
                    }
                },
                /*onMovableControllerDocLengthChanges: {
                    upon: [changed, [{ effectiveDocLength: _ }, [me]]],
                    true: {
                        "class": "SetDynamicPosOnDocCanvasAsStatic"
                    }
                },*/
                // the cond function in ViewBack/ViewFwd here is to ensure that we do not go < 0 or > 1 for viewStaticPosOnDocCanvas
                onMovableControllerViewBack: {
                    // upon: see MovableController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [
                                [{ minusWithLowerBound: _ }, [me]],
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [{ viewToEffectiveDocLengthRatio: _ }, [me]],
                                0
                            ]
                        }
                    }
                },
                onMovableControllerViewFwd: {
                    // upon: see MovableController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [
                                [{ plusWithUpperBound: _ }, [me]],
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [{ viewToEffectiveDocLengthRatio: _ }, [me]],
                                1
                            ]
                        }
                    }
                },
                onMovableControllerBeginningOfDoc: {
                    // upon: see MovableController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: 0
                        }
                    }
                },
                onMovableControllerEndOfDoc: {
                    // upon: see MovableController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: 1
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                defaultAnchorDocToView: true,
                docMoving: false
            },
            position: {
                anchorDocToView: {
                    pair1: {
                        point1: { label: "effectiveBeginningOfDocPoint" },
                        point2: { label: "effectiveEndOfDocPoint" }
                    },
                    pair2: {
                        point1: { label: "effectiveBeginningOfDocPoint" },
                        point2: { label: "centerViewPoint" }
                    },
                    ratio: [{ viewStaticPosOnDocCanvas: _ }, [me]]
                }
            }
        },
        {
            qualifier: { docLongerThanView: true },
            context: {
                viewToEffectiveDocLengthRatio: [div, // for ViewFwd and ViewBack calculations
                    [{ viewLength: _ }, [me]],
                    [{ effectiveDocLength: _ }, [me]]
                ],

                viewDynamicPosOnDocCanvas: [div,
                    [offset,
                        { label: "effectiveBeginningOfDocPoint" },
                        { label: "centerViewPoint" }
                    ],
                    [{ effectiveDocLength: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SetDynamicPosOnDocCanvasAsStatic: {
        // If we're in between the beginningOfDocPoint and endOfDocPoint, then the value stored should be the current value of viewDynamicPosOnDocCanvas
        // and we bound it from below by 0, and from above by 1.
        setDynamicPosOnDocCanvasAsStatic: {
            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
            merge: [min,
                1,
                [max,
                    0,
                    [{ viewDynamicPosOnDocCanvas: _ }, [me]]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to control the continuous movement of an associated document within a view. 
    // This class should not be inherited directly - instead, HorizontalContMovableController/VerticalContMovableController should be inherited.
    // If the document is made up of an areaSet of MovableInAS, then this class should not be used - ContMovableASController's axis-specific classes should be used instead.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContMovableController: {
        "class": o("ContMovableControllerCore", "MovableController", "UpDownOnArrowOrWheel"),
        write: {
            onContMovableControllerScrollbarRemoved: { // i.e. when the view expanded (or the document shrank) and there is no more need for a scrollbar
                upon: [not, [{ docLongerThanView: _ }, [me]]],
                true: {
                    backToTopOfDoc: {
                        to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                        merge: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The horizontal version of ContMovableController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalContMovableController: {
        "class": o("ContMovableController", "Horizontal")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The vertical version of ContMovableController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalContMovableController: {
        "class": o("ContMovableController", "Vertical")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to control the continuous movement of an associated document within a view. It inherits ContMovableControllerCore and MovableASController.
    // This class should not be inherited directly - instead, HorizontalContMovableASController/VerticalContMovableASController should be inherited.
    //
    // The document is made up of an areaSet of classes inheriting MovableInAS.
    // If the document is NOT made up of an areaSet of MovableInAS, then this class should not be used - ContMovableController's axis-specific classes should be used instead.
    //
    // API: 
    // 1. movableInASLength: the value (in pixels) by which we want to shift the document defined by movables, in response to a Next/Prev call. by default: the length of the firstMovable.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContMovableASController: o(
        { // default
            "class": o("ContMovableControllerCore", "MovableASController"),
            context: {
                movableInASLength: [offset,
                    {
                        element: [first, [{ movables: _ }, [me]]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    {
                        element: [first, [{ movables: _ }, [me]]],
                        type: [{ highHTMLLength: _ }, [me]]
                    }
                ],

                movableToEffectiveDocLengthRatio: [div, // for Next/Prev calculations
                    [{ movableInASLength: _ }, [me]],
                    [{ effectiveDocLength: _ }, [me]]
                ]
            },
            write: {
                onMovableASControllerPrev: {
                    // upon: provided by MovableASController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [
                                [{ minusWithLowerBound: _ }, [me]],
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [{ movableToEffectiveDocLengthRatio: _ }, [me]],
                                0
                            ]
                        }
                    }
                },
                onMovableASControllerNext: {
                    // upon: provided by MovableASController
                    true: {
                        updateViewStaticPosOnDocCanvas: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [
                                [{ plusWithUpperBound: _ }, [me]],
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [{ movableToEffectiveDocLengthRatio: _ }, [me]],
                                1
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The horizontal version of ContMovableASController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalContMovableASController: {
        "class": o("ContMovableASController", "Horizontal")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The vertical version of ContMovableASController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalContMovableASController: {
        "class": o("ContMovableASController", "Vertical")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. This class assumes it is inherited by an area which also inherits MovableController of a particular vertical/horizontal orientation
    // Note: the inheriting Scrollable expects positionOfViewWithinDoc to be defined, which MovableController does.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollOnKeyboardEvents: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                scrollOnKeyboardEvents: [and,
                    [not, [{ editInputText: true }, [areaOfClass, "TextInput"]]],
                    [{ respondToKeyboardEvents: _ }, [me]],
                    [{ keepScrolling: _ }, [me]] // defined by Scrollable
                ],
                vertical: ["Vertical", [classOfArea, [me]]]
            }
        },
        { // default
            "class": o("GeneralArea", "Scrollable"),
            context: {
                respondToKeyboardEvents: [overlap, [me], [pointer]],
                // Scrollable param:
                scrollingCondition: o(
                    [and,
                        keyboardScrollEvent,
                        [not, [{ myApp: { tkd: _ } }, [me]]]
                    ],
                    [{ myApp: { tkd: _ } }, [me]]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NextPrevOnArrowOrWheel: o(
        { // default    
            "class": "ScrollOnKeyboardEvents"
        },
        {
            qualifier: { vertical: true },
            write: {
                onKeyboardEventForPrev: {
                    "class": "OnUpArrowOrWheel"
                    // true: see variants below
                },
                onKeyboardEventForNext: {
                    "class": "OnDownArrowOrWheel"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: { vertical: false },
            write: {
                onKeyboardEventForPrev: {
                    "class": "OnLeftArrow"
                    // true: see variants below
                },
                onKeyboardEventForNext: {
                    "class": "OnRightArrow"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                scrolledToBeginning: false
            },
            write: {
                onKeyboardEventForPrev: {
                    // upon: see variants above
                    true: {
                        moveToPrevItem: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "Prev" }
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                scrolledToEnd: false
            },
            write: {
                onKeyboardEventForNext: {
                    // upon: see variants above
                    true: {
                        moveToNextItem: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "Next" }
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. wheelScrollInPixels: default provided.
    // 2. Assumes the inheriting class inherits MovableController and ContMovableControllerCore.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UpDownOnArrowOrWheel: o(
        { // default    
            "class": "ScrollOnKeyboardEvents",
            context: {
                wheelScrollInPixels: 10
            }
        },
        {
            qualifier: { vertical: true },
            write: {
                onKeyboardEventForUp: {
                    "class": "OnUpArrowOrWheel"
                    // true: see variants below
                },
                onKeyboardEventForDown: {
                    "class": "OnDownArrowOrWheel"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: { vertical: false },
            write: {
                onKeyboardEventForUp: {
                    "class": "OnLeftArrow"
                    // true: see variants below
                },
                onKeyboardEventForDown: {
                    "class": "OnRightArrow"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                docLongerThanView: true
            },
            context: {
                normalizedScroll: [div,
                    [{ wheelScrollInPixels: _ }, [me]],
                    [{ effectiveDocLength: _ }, [me]] // guaranteed to be > 0, as we're in docLongerThanView
                ]
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                docLongerThanView: true,
                scrolledToBeginning: false
            },
            write: {
                onKeyboardEventForUp: {
                    // upon: see variants above
                    true: {
                        scrollUp: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [minus,
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [min,
                                    [{ normalizedScroll: _ }, [me]],
                                    [{ viewStaticPosOnDocCanvas: _ }, [me]] // don't write a value < 0
                                ]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                docLongerThanView: true,
                scrolledToEnd: false
            },
            write: {
                onKeyboardEventForDown: {
                    // upon: see variants above
                    true: {
                        scrollDown: {
                            to: [{ viewStaticPosOnDocCanvas: _ }, [me]],
                            merge: [plus,
                                [{ viewStaticPosOnDocCanvas: _ }, [me]],
                                [min,
                                    [{ normalizedScroll: _ }, [me]],
                                    [minus,                                 // don't write a value > 1
                                        1,
                                        [{ viewStaticPosOnDocCanvas: _ }, [me]]
                                    ]
                                ]
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ViewBackFwdOnPageUpDown: o(
        { // default    
            "class": "ScrollOnKeyboardEvents"
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                scrolledToBeginning: false
            },
            write: {
                onViewPageUp: {
                    "class": "OnPageUp",
                    true: {
                        moveViewBack: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "ViewBack" }
                        }
                    }
                },
                onViewHome: {
                    "class": "OnHome",
                    true: {
                        moveToBeginningOfDoc: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "BeginningOfDoc" }
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                scrollOnKeyboardEvents: true,
                scrolledToEnd: false
            },
            write: {
                onViewPageDown: {
                    "class": "OnPageDown",
                    true: {
                        moveViewFwd: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "ViewFwd" }
                        }
                    }
                },
                onViewEnd: {
                    "class": "OnEnd",
                    true: {
                        moveToEndOfDoc: {
                            "class": "ScrollItemsMsg",
                            merge: { msgType: "EndOfDoc" }
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScrollItemsMsg: {
        to: [message],
        merge: {
            // msgType: merged in here by inheriting class
            recipient: [me]
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of the Continuous Movable Controller Classes 
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of library
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////    
};
