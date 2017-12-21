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
// A library that implements drag-to-reorder functionality. There are two sets of classes: with and without a parallel capability for snap-to-grid, of those very same elements that can
// be dragged to reorder.
// 
// We distinguish between three types of players in this process:
// 1. ReorderableController: which handles the reordering logic - it keeps a 'reordered' os of the reorderable elements.
// 2. Reorderable: The element being reordered (not a class! typically an areaRef)
// 3. VisReorderable: a visual representation of a Reorderable element. There could be multiple visual representation of a given reorderable element
// An example: 
// The reorderable element would be an overlay. overlays are represented by multiple visual elements - a VisibleOverlay class, an OverlayXWidget, etc.
// One could reorder overlays by reordering a minimized VisibleOverlay relative to other minimized VisibleOverlay. In theory (though not currently), the same could be done by reordering
// OverlayXWidgets relative to one another.
//
// This library currently supports the dragging of a single reorderable area at a time. It assumes the 'reordered' os does not change until the MouseUp at the end of the reordering.
// There are two reordering trigger modes supported.  
// 1. Leading-Edge-Crosses-Center: The dragged area's leading edge (e.g. left) triggers the shifting of the drop-site when it crosses its adjacent (in this example, on the left) 
//    non-dragged reorderable area's center. 
//    This is used when the inheriting class maintains a drop site that's as wide as the anchor element being dragged - i.e. actualGirthForDraggedToReorderDropSite: true 
//    (i.e. reordering iPhone-style).
// 2. Center-Crosses-Center: The trigger for shifting of the drop-site relies on the relative position of the dragged-area's drag-axis center (e.g. horizontal-center), relative to 
//    the center of its adjacent non-dragged reoderable areas.
//    This is used when the inheriting class gives the drop site a predefined girth, which is independent (and typically/usefully is narrower than the width of the dragged area. 
//    i.e. actualGirthForDraggedToReorderDropSite: false
//
// Algorithm:
// We write to the ReorderableController's 'reordered' os only on MouseUp. During the MouseDown, the associated VisReorderable elements change their *position* relative to the VisReorderable
// being dragged, but that does not yet affect the 'reordered' os. 
// There is the distinct possibility that this same effect could be had with sufficiently advanced use of OR constraints, though for now that will be left as an exercise to the reader.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var reorderablePosConst = {
    scrollOffsetWhenReordering: 50
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a visual representation of an element which can be reordered in an os kept by the associated ReorderableController.
    // This class should not be inherited directly - rather, its axis-specific versions VerticalVisReorderable/HorizontalVisReorderable should be inherited
    //
    // The Positioning algorithm for VisReorderables pertaining to a single visReordered os (e.g. the minimized visibleOverlays).
    // 1. The VisReorderable being dragged follows the mouse. 
    //    The dropSite (the cavity), that represents the position the dragged VisReorderable would assume on MouseUp), is managed by the ReorderableController. The posPoint labels
    //    defining this cavity are positioned depending on whether there is/isn't a non-dragged VisReorderable on the beginning/end side (there wouldn't be one if the dragged VisReorderable
    //    was dragged all the way to beginning/end of its visReordered os of VisReorderables.
    // 2. The other VisReorderable areas, those not being dragged, position themselves relative to two sets of anchors. One represents their position if they're on the beginning (e.g. left)
    //    side of the dragged VisReorderable, and the other represents their position if they're on the end (e.g. right) side of the dragged VisReorderable.
    //    When we start the drag operation, we define the non-dragged VisReorderable's beginningOfVisReorderable posPoint (which defines where VisReorderables are to position their beginning
    //    side when no reordering is taking place) to match either beginningOfVisReorderableOnBeginningSideOfDragged for those before the dragged VisReorderable in the 'reordered' ordering
    //    (prevPlusOfDraggedArea: true). Similarly, for those after it in that same ordering (prevPlusOfDraggedArea: false), we define their current position to match 
    //    beginningOfVisReorderableOnEndSideOfDragged.
    //    Each non-dragged VisReorderable has an appData (onBeginningSideOfDraggedToReorder) which indicates whether during reordering it is on the beginning side or end side of the dragged 
    //    VisReorderable. This appData is initialized to the value of prevPlusOfDraggedArea (as before any non-dragged VisReorderables change their position, they are on the side of the 
    //    dragged VisReorderable as defined by the ordering of the ReorderableController's 'reordered' os). 
    //    Once the dragged VisReorderable crosses the appropriate threshold, we toggle this appData for the non-dragged VisReorderable that needs to change its position 
    //    (reminder: the 'reordered' os is rewritten only on MouseUp, not while reordering is taking place!). The non-dragged areas position their actual beginning (e.g. left) posPoint to 
    //    match either beginningOfVisReorderableOnBeginningSideOfDragged/beginningOfVisReorderableOnEndSideOfDragged, depending on the value of onBeginningSideOfDraggedToReorder.
    //
    // API:
    // 1. reorderableController: an areaRef to the ReorderableController which includes this area's myReorderable in its reorderables os.
    // 2. myReorderable: an element included in the ReorderableController's reorderables os. 
    //    A reorderable element could have multiple VisReorderables, inherited by different classes, representing it.
    // 3. iAmDraggedToReorder: boolean, indicating whether this VisReorderable is being dragged (DraggableToReorder APIs)
    //    by default, this is provided by DraggableToReorder.
    // 4. reorderOnlyWhenInView: a boolean flag determining which VisReorderable areas have an upon handler to monitor when the iAmDraggedToReorder area crosses their threshold - whether 
    //    it is all those in visReordered, or only those which are inView. 
    //    default: false, i.e. those outside the view will also be reordered when the iAmDraggedToReorder triggers their threshold.
    // 5. actualGirthForDraggedToReorderDropSite: if true, we reserve for the drop site the full girth needed for the element being dragged (i.e. iphone-style one-element-at-a-time reordering).
    //    if false, then we reserve a fixed girth which is independent of the girth of the VisReorderable being dragged. 
    //    true, by default.
    // 6. myZTop: [me], by default. See Expanded facet for refined definition using label: "zTop"
    //
    // The following can be used by inheriting classes (e.g. to modify an area's design):
    // 1. anotherIsDraggedToReorder: a context label marking all areas except draggedToReorder (i.e. when reordering is true).
    // 2. adjacentToDraggedToReorderOnBeginningSide/adjacentToDraggedToReorderOnEndSide: the area immediately adjacent to draggedToReorder on the beginning/end side.
    // 3. firstVisReordered/lastVisReordered
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VisReorderable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                reordering: [{ reorderableController: { reordering: _ } }, [me]],

                anotherIsDraggedToReorder: [and,
                    [{ reordering: _ }, [me]],
                    [not, [{ iAmDraggedToReorder: _ }, [me]]]
                ],

                // the following two may be used by inheriting class, to distinguish the immediate neighbors of the draggedToReorder
                // adjacentToDraggedToReorderOnBeginningSide is true if [me] is the last area in the subset of those with onBeginningSideOfDraggedToReorder: true within visReordered.
                adjacentToDraggedToReorderOnBeginningSide: [and,
                    [ // verify that the draggedToReorder pertains to this area's visReordered
                        [{ draggedToReorder: _ }, [me]],
                        [{ visReordered: _ }, [me]]
                    ],
                    [equal,
                        [me],
                        [last,
                            [
                                { onBeginningSideOfDraggedToReorder: true },
                                [{ visReordered: _ }, [me]]
                            ]
                        ]
                    ]
                ],
                // adjacentToDraggedToReorderOnEndSide is true if [me] is the first area in the subset of those with onBeginningSideOfDraggedToReorder: false within visReordered.
                adjacentToDraggedToReorderOnEndSide: [and,
                    [ // verify that the draggedToReorder pertains to this area's visReordered
                        [{ draggedToReorder: _ }, [me]],
                        [{ visReordered: _ }, [me]]
                    ],
                    [equal,
                        [me],
                        [first,
                            [
                                { onBeginningSideOfDraggedToReorder: false },
                                [{ visReordered: _ }, [me]]
                            ]
                        ]
                    ]
                ],

                actualGirthForDraggedToReorderDropSite: true,

                allowReorder: o(
                    [not, [{ reorderOnlyWhenInView: _ }, [me]]],
                    [and,
                        [{ reorderOnlyWhenInView: _ }, [me]],
                        [{ inView: _ }, [me]]
                    ]
                ),

                firstVisReordered: [equal,
                    [me],
                    [first, [{ visReordered: _ }, [me]]]
                ],
                lastVisReordered: [equal,
                    [me],
                    [last, [{ visReordered: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "DraggableToReorder"),
            context: {
                visReordered: [{ reorderableController: { visReordered: _ } }, [me]],
                // DraggableToReorder param:
                myReorderHandle: [
                    { visReorderable: [me] },
                    [areaOfClass, "ReorderHandle"]
                ],
                // we don't want the "beginning"/"end" posPoints but rather the beginningOfVisReorderable/endOfVisReorderable posPoints. 
                // note these are used by the MovableASController in its definition of beginningOfDocPoint/endOfDocPoint:
                // we have to relate to these points, where the VisReorderable *was* at the beginning of the reordering operation, and not where it is now, in the midst of 
                // a reordering operation (with the mouse still down!) as the writing of the new ordering of elements being reordered takes place only on mouseUp. so if we 
                // were to look at the area's left/right, and not its beginningOfVisReorderable/endOfVisReorderable, and were to reorder the first element in the document,
                // then the document would wrongly be considered to have shifted its beginning to the current left of the area that's still the first in the appData, but no 
                // longer the first in the elements as they are displayed
                logicalBeginning: atomic({
                    element: [me],
                    label: "beginningOfVisReorderable"
                }),
                logicalEnd: atomic({
                    element: [me],
                    label: "endOfVisReorderable"
                }),
                myZTop: [me],

                // the areaRef to the VisReorderable within visReordered which is being dragged
                draggedToReorder: [first,
                    [
                        { iAmDraggedToReorder: true },
                        [{ visReordered: _ }, [me]]
                    ]
                ],

                // context labels related to in-view calculations: should reordering trigger apply only to those Reorderables in view, and is Reorderable actually in view.
                reorderOnlyWhenInView: false,
                inView: true // a more specific definition is given in the SnappableReorderable inheriting class - perhaps that's needed here too? 
                // if so, the beginningOfViewPoint/endOfViewPoint needs tweaking, as they're stored in the Controller now, but they may be specific to subsets of the
                // reordered areas (e.g. FSApp is the ReorderableController for VisibleOverlays, and there is the minimized VisibleOverlays subset, the expanded VisibleOverlays
                // subset, etc. - they each operate within their own 'view'
            },
            position: {
                defineCenterOfVisReorderable: {
                    pair1: {
                        point1: { label: "beginningOfVisReorderable" },
                        point2: { label: "centerOfVisReorderable" }
                    },
                    pair2: {
                        point1: { label: "centerOfVisReorderable" },
                        point2: { label: "endOfVisReorderable" }
                    },
                    ratio: 1
                }
            }
        },
        // in the following two variants we define the sides (e.g. left/right/horizontal-center) of draggedToReorder. these are used to identify when they 
        // cross the reference point (horizontal-center, per the axis implied by this example) of the areas adjacent (on both beginning/end sides) to 
        // draggedToReorder
        {
            qualifier: { actualGirthForDraggedToReorderDropSite: true },
            context: {
                draggedToReorderBeginningSideThreshold: [{ lowHTMLLength: _ }, [me]],
                draggedToReorderEndSideThreshold: [{ highHTMLLength: _ }, [me]]
            },
            position: {
                relativePositionOfBeginningAndEndVisReorderableLabels: {
                    pair1: {
                        point1: {
                            label: "beginningOfVisReorderable"
                        },
                        point2: {
                            label: "endOfVisReorderable"
                        }
                    },
                    pair2: {
                        point1: {
                            type: [{ lowHTMLLength: _ }, [me]]
                        },
                        point2: {
                            type: [{ highHTMLLength: _ }, [me]]
                        }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { actualGirthForDraggedToReorderDropSite: false },
            context: {
                draggedToReorderBeginningSideThreshold: [{ centerLength: _ }, [me]],
                draggedToReorderEndSideThreshold: [{ centerLength: _ }, [me]]
            }
            // position: inheriting class should define the offset between beginningOfVisReorderable and endOfVisReorderable
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            stacking: {
                aboveTheZReorderingPlane: {
                    lower: [{ reorderableController: { reorderingZPlane: _ } }, [me]],
                    higher: [{ myZTop: _ }, [me]]
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            stacking: {
                belowTheZReorderingPlane: {
                    lower: [{ myZTop: _ }, [me]],
                    higher: [{ reorderableController: { reorderingZPlane: _ } }, [me]]
                }
            }
        },
        { // when no reordering going on, the beginning/end match the beginningOfVisReorderable/endOfVisReorderable posPoint labels - they're the 'static' positioning labels
            qualifier: { reordering: false },
            position: {
                attachBeginningToBeginningOfVisReorderable: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        label: "beginningOfVisReorderable"
                    },
                    equals: 0
                },
                attachEndToEndOfVisReorderable: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        label: "endOfVisReorderable"
                    },
                    equals: 0
                }
            }
        },
        // when reordering is going on, the draggedToReorder follows the mouse. the others ({ anotherIsDraggedToReorder: true }) determine their position depending on whether they're 
        // on the beginning side or the end side of the area being dragged.
        {
            qualifier: { anotherIsDraggedToReorder: true },
            context: {
                // prevPlusOfDraggedArea is true if i'm the one prev to draggedToReorder in my visReordered os, or if my next is a prevPlusOfDraggedArea: true.

                prevPlusOfDraggedArea: [
                    [me],
                    [prevPlus,
                        [{ visReordered: _ }, [me]],
                        [{ draggedToReorder: _ }, [me]]
                    ]
                ],

                "*onBeginningSideOfDraggedToReorder": [{ prevPlusOfDraggedArea: _ }, [me]] // Initialize true/false depending on position relative to the area being dragged
            },
            position: {
                defineOffsetBetweenOnBeginningSideAndOnEndSideOfDraggedArea: { // the offset between the two possible beginning-side positions for a stationary
                    // area, depending on which side of draggedToReorder it's on
                    point1: { label: "beginningOfVisReorderableOnBeginningSideOfDragged" },
                    point2: { label: "beginningOfVisReorderableOnEndSideOfDragged" },
                    equals: [plus,
                        [{ reorderableController: { dropSiteGirthForDraggedToReorder: _ } }, [me]],
                        [{ reorderableController: { reorderingSpacing: _ } }, [me]]
                    ]
                }
            },
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                prevPlusOfDraggedArea: true
            },
            position: {
                attachBeginningOfVisReorderableOnBeginningSideToBegOfReorder: {
                    point1: { label: "beginningOfVisReorderableOnBeginningSideOfDragged" },
                    point2: { label: "beginningOfVisReorderable" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                prevPlusOfDraggedArea: false
            },
            position: {
                attachBeginningOfVisReorderableOnEndSideToBegOfReorder: {
                    point1: { label: "beginningOfVisReorderableOnEndSideOfDragged" },
                    point2: { label: "beginningOfVisReorderable" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                allowReorder: true,
                prevPlusOfDraggedArea: true,
                onBeginningSideOfDraggedToReorder: true
            },
            write: {
                // note that we do not use labels per beginningOfVisReorderableOnBeginningSideOfDragged/beginningOfVisReorderableOnEndSideOfDragged: these two are defined in absolute
                // terms only after the MouseDown on the dragged area, and so they're not properly defined by the positioning system by the time this upon is calculated. 
                // instead, we rely solely on posPoints defined prior to the mouseDown, or by calculations of the offset function                   
                onReorderableDraggedToReorderThresholdCrossing: {
                    upon: [greaterThan,
                        [offset,
                            {
                                element: [{ draggedToReorder: _ }, [me]],
                                type: [{ draggedToReorderBeginningSideThreshold: _ }, [me]]
                            },
                            {
                                // element: [me] 
                                label: "centerOfVisReorderable"
                            }
                        ],
                        -1
                    ],
                    true: {
                        "class": "ToggleOnBeginningSideOfDraggedToReorder"
                    }
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                allowReorder: true,
                prevPlusOfDraggedArea: true,
                onBeginningSideOfDraggedToReorder: false
            },
            write: {
                // see comment for variant containing first instance of onReorderableDraggedToReorderThresholdCrossing
                onReorderableDraggedToReorderThresholdCrossing: {
                    upon: [greaterThanOrEqual,
                        [offset,
                            {
                                // element: [me] 
                                label: "centerOfVisReorderable"
                            },
                            {
                                element: [{ draggedToReorder: _ }, [me]],
                                type: [{ draggedToReorderEndSideThreshold: _ }, [me]]
                            }
                        ],
                        [{ reorderableController: { dropSiteGirthForDraggedToReorder: _ } }, [me]]
                    ],
                    true: {
                        "class": "ToggleOnBeginningSideOfDraggedToReorder"
                    }
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                allowReorder: true,
                prevPlusOfDraggedArea: false,
                onBeginningSideOfDraggedToReorder: false
            },
            write: {
                // see comment for variant containing first instance of onReorderableDraggedToReorderThresholdCrossing
                onReorderableDraggedToReorderThresholdCrossing: {
                    upon: [greaterThan,
                        [offset,
                            {
                                // element: [me] 
                                label: "centerOfVisReorderable"
                            },
                            {
                                element: [{ draggedToReorder: _ }, [me]],
                                type: [{ draggedToReorderEndSideThreshold: _ }, [me]]
                            }
                        ],
                        -1
                    ],
                    true: {
                        "class": "ToggleOnBeginningSideOfDraggedToReorder"
                    }
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                allowReorder: true,
                prevPlusOfDraggedArea: false,
                onBeginningSideOfDraggedToReorder: true
            },
            write: {
                // see comment for variant containing first instance of onReorderableDraggedToReorderThresholdCrossing
                onReorderableDraggedToReorderThresholdCrossing: {
                    upon: [greaterThanOrEqual,
                        [offset,
                            {
                                element: [{ draggedToReorder: _ }, [me]],
                                type: [{ draggedToReorderBeginningSideThreshold: _ }, [me]]
                            },
                            {
                                // element: [me] 
                                label: "centerOfVisReorderable"
                            }
                        ],
                        [{ reorderableController: { dropSiteGirthForDraggedToReorder: _ } }, [me]]
                    ],
                    true: {
                        "class": "ToggleOnBeginningSideOfDraggedToReorder"
                    }
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                onBeginningSideOfDraggedToReorder: true
            },
            position: {
                attachBeginningToBeginningOfVisReorderableOnBeginningSideOfDragged: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        label: "beginningOfVisReorderableOnBeginningSideOfDragged"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                anotherIsDraggedToReorder: true,
                onBeginningSideOfDraggedToReorder: false
            },
            position: {
                attachBeginningToBeginningOfVisReorderableOnEndSideOfDragged: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        label: "beginningOfVisReorderableOnEndSideOfDragged"
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An auxiliary class used by VisReorderable: this is an object that handles the toggling of the onBeginningSideOfDraggedToReorder writable reference.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleOnBeginningSideOfDraggedToReorder: {
        toggleOnBeginningSideOfDraggedToReorder: {
            to: [{ onBeginningSideOfDraggedToReorder: _ }, [me]],
            merge: [not, [{ onBeginningSideOfDraggedToReorder: _ }, [me]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The vertical version of VisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalVisReorderable: {
        "class": o("Vertical", "VisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The horizontal version of VisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalVisReorderable: {
        "class": o("Horizontal", "VisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the reordering of an os of elements (e.g. areaRefs) which the user can reorder.
    // The ReorderableController, unlike the associated axis-specific ordered set(s) of VisReorderables, is axis agnostic.
    // For example: We have a ReorderableController for reordering overlays. This controller works with one os of *vertical* VisReorderables - 
    // the VisibleOverlays in the expanded state, and with another os of *horizontal* VisReorderables, the minimized VisibleOverlays.
    // 
    // The reordered elements are stored in the 'reordered' context label, and are thus available to other classes to use. 'reordered' is 
    // modified only on MouseUp. 
    // At that point, we either place the reorderable element associated with the dragged VisReorderable (shall be referred to as the 
    // 'dragged reorderable') before/after the reorderable element associated with one of its adjacent non-dragged VisReorderables: 
    // before/after determined by whether the 'dragged reorderable' is about to become the very first element in 'reordered' or not.
    //
    // API:
    // 1. reordered: a writable ref, of the os of elements which this class will be able to reorder.
    //    note: if we're reordering areas, one should think long and hard why not reorder the data os used to produce them.
    //    One problem with attempting to have reordered store the areaRefs, and not their corresponding data objects, is that the areaRefs 
    //    may not exist when reordered is initialized, (which is a current limitation of appData initialization)
    // 2. visReordered: an os of VisReorderable. The ordering of this os would be derived from the 'reordered' ordered set.
    // 3. reorderingSpacing: fixed spacing between adjacent VisReorderables. Note this can be assigned different values when reordering 
    //    different sets of VisReorderables 
    //    (e.g. when reordering VisibleOverlays in expanded (and vertical) vs. minimized (and horizontal) state. This value is used only when /
    //    { reordering: true }
    // 4. reorderingZPlane: by default this is [me]'s reorderingZPlane z label, which is defined here to be above the app's zTop.
    //    Inheriting classes may provide further stacking constraints on this point. For example, FSApp is the reordering controller for overlays, 
    //    where we want to ensure that 
    //    they always remain below the facetViewPanes, even those which are being dragged. And so the reorderingZPlane should be further limited 
    //    there to remain below these panes.
    // 
    // Note: VisReorderables communicating with this ReoderableController relate to the elements in reorderables via their myReorderable 
    // context label.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReorderableController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                reordering: [{ myVisReorderables: { iAmDraggedToReorder: _ } }, [me]],
                adjacentToDraggedToReorderOnBeginningSideExists: [{ myVisReorderables: { adjacentToDraggedToReorderOnBeginningSide: true } }, [me]],
                adjacentToDraggedToReorderOnEndSideExists: [{ myVisReorderables: { adjacentToDraggedToReorderOnEndSide: true } }, [me]],

                reorderingWorthRecording: o(
                    [{ adjacentToDraggedToReorderOnBeginningSideExists: _ }, [me]],
                    [{ adjacentToDraggedToReorderOnEndSideExists: _ }, [me]]
                )
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                reorderingSpacing: 0, // default value                            
                // all VisReorderables whose myReorderable is a member of my reorderables - i.e. they can modify my 'reordered'!
                myVisReorderables: [
                    { reorderableController: [me] },
                    [areaOfClass, "VisReorderable"]
                ],
                reorderingZPlane: {
                    element: [me],
                    label: "reorderingZPlane"
                }
            },
            stacking: {
                reorderingZPlaneBelowAppZTop: {
                    lower: [{ reorderingZPlane: _ }, [me]],
                    higher: {
                        element: [{ myApp: _ }, [me]],
                        label: "zTop"
                    }
                }
            }
        },
        {
            qualifier: { reordering: true },
            context: {
                draggedToReorder: [{ iAmDraggedToReorder: true },
                [{ myVisReorderables: _ }, [me]]
                ],
                // get the draggedToReorder (a VisReorderable area), and retrieve from it myReorderable, which is a member of the controller's reorderables
                reorderableOfDraggedToReorder: [{ draggedToReorder: { myReorderable: _ } }, [me]],

                reorderedMinusReorderableDraggedToReorder: [n([{ reorderableOfDraggedToReorder: _ }, [me]]),
                [{ reordered: _ }, [me]]
                ],

                reorderedBeforeDraggedToReorder: o(), // default - could be overridden by { adjacentToDraggedToReorderOnBeginningSideExists: true } variant
                reorderedAfterDraggedToReorder: o(), // default - could be overridden by { adjacentToDraggedToReorderOnEndSideExists: true } variant

                dropSiteGirthForDraggedToReorder: [offset,
                    {
                        element: [{ draggedToReorder: _ }, [me]],
                        type: [{ draggedToReorder: { lowHTMLLength: _ } }, [me]]
                    },
                    {
                        element: [{ draggedToReorder: _ }, [me]],
                        type: [{ draggedToReorder: { highHTMLLength: _ } }, [me]]
                    }
                ]
            },
            position: {
                // see variants below for positioning of either beginningOfDropSiteForDraggedToReorder or endOfDropSiteForDraggedToReorder
                defineOffsetBeginningToEndOfDropSiteForDraggedToReorder: {
                    point1: { label: "beginningOfDropSiteForDraggedToReorder" },
                    point2: { label: "endOfDropSiteForDraggedToReorder" },
                    equals: [{ dropSiteGirthForDraggedToReorder: _ }, [me]]
                }
            }
        },
        // if reorderingWorthRecording is false, that means that both adjacentToDraggedToReorderOnBeginningSideExists and adjacentToDraggedToReorderOnEndSideExists are false.
        // that means there's only a single VisReorderable element being reordered, in which case there is no need to write anything.
        // an example of that situation - the VisibleOverlay for the Primary Overlay, which starts out as the only VisReorderable element in the set of Overlays in the expanded view.
        {
            qualifier: { reorderingWorthRecording: true },
            write: {
                onReorderableControllerOnAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        writeNewOrder: {
                            to: [{ reordered: _ }, [me]],
                            merge: o(
                                [{ reorderedBeforeDraggedToReorder: _ }, [me]],
                                [{ reorderableOfDraggedToReorder: _ }, [me]],
                                [{ reorderedAfterDraggedToReorder: _ }, [me]]
                            )
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                reordering: true,
                adjacentToDraggedToReorderOnBeginningSideExists: true
            },
            context: {
                adjacentToDraggedToReorderOnBeginningSide: [{ adjacentToDraggedToReorderOnBeginningSide: true },
                [{ myVisReorderables: _ }, [me]]
                ],
                reorderedBeforeDraggedToReorder: [prevStar,
                    [{ reorderedMinusReorderableDraggedToReorder: _ }, [me]],
                    [{ adjacentToDraggedToReorderOnBeginningSide: { myReorderable: _ } }, [me]]
                ],
                reorderedAfterDraggedToReorder: [nextPlus,
                    [{ reorderedMinusReorderableDraggedToReorder: _ }, [me]],
                    [{ adjacentToDraggedToReorderOnBeginningSide: { myReorderable: _ } }, [me]]
                ]
            },
            position: {
                positionBeginningOfDropSiteForDraggedToReorder: {
                    point1: {
                        element: [{ adjacentToDraggedToReorderOnBeginningSide: _ }, [me]],
                        type: [{ adjacentToDraggedToReorderOnBeginningSide: { highHTMLLength: _ } }, [me]]
                    },
                    point2: { label: "beginningOfDropSiteForDraggedToReorder" },
                    equals: [{ reorderingSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                reordering: true,
                adjacentToDraggedToReorderOnBeginningSideExists: false,
                adjacentToDraggedToReorderOnEndSideExists: true
            },
            context: {
                adjacentToDraggedToReorderOnEndSide: [{ adjacentToDraggedToReorderOnEndSide: true },
                [{ myVisReorderables: _ }, [me]]
                ],
                reorderedBeforeDraggedToReorder: [prevPlus,
                    [{ reorderedMinusReorderableDraggedToReorder: _ }, [me]],
                    [{ adjacentToDraggedToReorderOnEndSide: { myReorderable: _ } }, [me]]
                ],
                reorderedAfterDraggedToReorder: [nextStar,
                    [{ reorderedMinusReorderableDraggedToReorder: _ }, [me]],
                    [{ adjacentToDraggedToReorderOnEndSide: { myReorderable: _ } }, [me]]
                ]
            },
            position: {
                positionEndOfDropSiteForDraggedToReorder: {
                    point1: { label: "endOfDropSiteForDraggedToReorder" },
                    point2: {
                        element: [{ adjacentToDraggedToReorderOnEndSide: _ }, [me]],
                        type: [{ adjacentToDraggedToReorderOnEndSide: { lowHTMLLength: _ } }, [me]]
                    },
                    equals: [{ reorderingSpacing: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Reorderable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of SnappableReorderable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a VisReorderable which can also be dragged (differently from the dragging operation used for reordering, obviously) and snapped to grid.
    // This class should not be inherited directly. Instead, its axis specific versions VerticalSnappableVisReorderable/HorizontalSnappableVisReorderable should be inherited.
    //
    // API: 
    // 1. snappableReorderableController: an areaRef to the SnappableReorderableController which includes this area in its visReordered os
    // for the following, see VisReorderable:
    // 2. myReorderable: this should be an element reordered by snappableReorderableController' myReorderableController.
    // 3. visReordered: default definition provided (the associated controller's visReordered)
    // 4. iAmDraggedToReorder
    // 5. beginningOfVisReorderable/endOfVisReorderable posPoint labels.
    //    Note: the firstInView's position relative to the view is handled by SnappableController, and so should not be specified by this class. To control the static offset between the 
    //    view and the firstInView, see beginningOfViewPoint (a MovableController param inherited by SnappableReorderableController)   
    // 6. reorderOnlyWhenInView
    // 7. actualGirthForDraggedToReorderDropSite
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableVisReorderableCore: o(
        { // default
            "class": "VisReorderable",
            context: {
                inView: [and, // see reorderOnlyWhenInView in Reorderable - both are used to calculate allowReorder
                    [greaterThan,
                        [offset,
                            [{ reorderableController: { beginningOfViewPoint: _ } }, [me]],
                            {
                                type: [{ draggedToReorderEndSideThreshold: _ }, [me]]
                            }
                        ],
                        -1
                    ],
                    [greaterThan,
                        [offset,
                            { label: "beginningOfVisReorderable" },
                            [{ reorderableController: { endOfViewPoint: _ } }, [me]]
                        ],
                        0
                    ]
                ],
                iAmCoveringTheBeginningOfViewPoint: [and,
                    [greaterThanOrEqual,
                        [offset,
                            [{ beginningOfReorderingCavity: _ }, [me]],
                            [{ reorderableController: { beginningOfViewPoint: _ } }, [me]]
                        ],
                        0
                    ],
                    [greaterThanOrEqual,
                        [offset,
                            [{ reorderableController: { beginningOfViewPoint: _ } }, [me]],
                            [{ endOfReorderingCavity: _ }, [me]]
                        ],
                        0
                    ]
                ],

                // VisReorderable params: 
                reorderableController: [{ snappableReorderableController: _ }, [me]],

                // Snappable params: 
                movableController: [{ snappableReorderableController: _ }, [me]]
            }
        },
        {
            qualifier: { iAmDraggedToReorder: false },
            context: {
                beginningOfReorderingCavity: {
                    element: [me],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                endOfReorderingCavity: {
                    element: [me],
                    type: [{ highHTMLLength: _ }, [me]]
                }
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            context: {
                beginningOfReorderingCavity: {
                    element: [{ reorderableController: _ }, [me]],
                    label: "beginningOfDropSiteForDraggedToReorder"
                },
                endOfReorderingCavity: {
                    element: [{ reorderableController: _ }, [me]],
                    label: "endOfDropSiteForDraggedToReorder"
                }
            }
        },
        {
            qualifier: {
                ofMovableController: true,
                iAmDraggedToReorder: true
            },
            "class": o("Scrollable", "ScrollOperation"),
            context: {
                draggedToReorderTriggersScrollingPrev: [greaterThan,
                    [offset,
                        {
                            element: [me],
                            type: [{ draggedToReorderBeginningSideThreshold: _ }, [me]]
                        },
                        {
                            element: [{ snappableReorderableController: _ }, [me]],
                            label: "scrollPrevWhenReordering"
                        }
                    ],
                    0
                ],
                draggedToReorderTriggersScrollingNext: [and,
                    [notEqual, // stop scrolling next when the last in reorderedMinusReorderableDraggedToReorder
                        // is the first in view
                        [{ snappableReorderableController: { firstInViewUniqueID: _ } }, [me]],
                        [
                            { uniqueID: _ },
                            [last, [{ snappableReorderableController: { reorderedMinusReorderableDraggedToReorder: _ } }, [me]]]
                        ]
                    ],
                    [greaterThan,
                        [offset,
                            {
                                element: [{ snappableReorderableController: _ }, [me]],
                                label: "scrollNextWhenReordering"
                            },
                            {
                                element: [me],
                                type: [{ draggedToReorderEndSideThreshold: _ }, [me]]
                            }
                        ],
                        0
                    ]
                ],
                // Scrollable params: (movableController, a necessary parameter, is provided above)
                continuousScrollingBeat: 1,
                scrollingCondition: o(
                    [{ draggedToReorderTriggersScrollingPrev: _ }, [me]],
                    [{ draggedToReorderTriggersScrollingNext: _ }, [me]]
                ),
                // ScrollOperation param: this is instead of inheriting either ScrollPrev or ScrollNext
                scrollOperation: [cond,
                    [{ draggedToReorderTriggersScrollingPrev: _ }, [me]],
                    o({ on: true, use: "Prev" }, { on: false, use: "Next" })
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableVisReorderable: {
        "class": o(
            "SnappableVisReorderableCore", // appears before Snappable, so as to override its definitions of logicalBeginning / logicalEnd
            "Snappable"
        )
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITSnappableVisReorderable: {
        "class": o(
            "SnappableVisReorderableCore", // appears before JITSnappable, so as to override its definitions of logicalBeginning / logicalEnd
            "JITSnappable"
        )
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The vertical version of SnappableVisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalSnappableVisReorderable: {
        "class": o("Vertical", "SnappableVisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The horizontal version of SnappableVisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalSnappableVisReorderable: {
        "class": o("Horizontal", "SnappableVisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The vertical version of JITSnappableVisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalJITSnappableVisReorderable: {
        "class": o("Vertical", "JITSnappableVisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The horizontal version of JITSnappableVisReorderable
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalJITSnappableVisReorderable: {
        "class": o("Horizontal", "JITSnappableVisReorderable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to control both snap-to-grid and the reordering of an os of areas which inherit SnappableReorderable. 
    // Note that both this *Controller class and the SnappableReorderable inheriting areas should inherit an axis-specific class (either Vertical* or Horizontal*).
    //
    // This class sets the docMoving writalble ref (inherited from MovableController via SnappableController) to true for the duration of the reordering. 
    // on MouseUp, the new firstInView will be determined as follows: 
    // 1. for all those not dragged, by their current position (not necessarily identical to their beginningOfVisReorderable/endOfVisReorderable: if they were actually reordered),
    // 2. for the area being dragged, by its beginningOfVisReorderable/endOfVisReorderable (that represents the dropSite it will fall back into.
    // 
    // API:
    // 1. visReordered: an os of areaRefs which all inherit VerticalSnappableVisReorderable/HorizontalSnappableVisReorderable   
    // 2. view: see MovableController
    // 3. beginningOfViewPoint & endOfViewPoint: see MovableController
    // 4. scrollOffsetWhenReordering: (reorderablePosConst.scrollOffsetWhenReordering by default):
    //    scrollPrevWhenReordering/scrollNextWhenReordering labels are placed at this offset *outside* of beginningOfViewPoint/endOfViewPoint (respectively) of inherited MovableController. 
    //    Crossing this threshold with the iAmDraggedToReorder triggers a scroll.
    // If this Controller is also the ReorderableController (the default case), then it should be provided with the parameters required by ReorderableController.
    // In order to override this default, the inheriting class should provide an alternative areaRef in myReorderableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableReorderableControllerCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                amIAlsoTheReorderableController: [equal,
                    [me],
                    [{ myReorderableController: _ }, [me]]
                ],
                snappableReordering: [{ myReorderableController: { reordering: _ } }, [me]]
            }
        },
        { // default
            context: {
                myReorderableController: [me], // default

                // SnappableController params: 
                movables: [{ visReordered: _ }, [me]],
                movableSpacing: [{ myReorderableController: { reorderingSpacing: _ } }, [me]],

                scrollOffsetWhenReordering: reorderablePosConst.scrollOffsetWhenReordering
            },
            position: {
                labelScrollPrevWhenReordering: {
                    point1: { label: "scrollPrevWhenReordering" },
                    point2: [{ beginningOfViewPoint: _ }, [me]],
                    equals: [{ scrollOffsetWhenReordering: _ }, [me]]
                },
                labelScrollNextWhenReordering: {
                    point1: [{ endOfViewPoint: _ }, [me]],
                    point2: { label: "scrollNextWhenReordering" },
                    equals: [{ scrollOffsetWhenReordering: _ }, [me]]
                }
            }
        },
        {
            qualifier: { amIAlsoTheReorderableController: true },
            "class": "ReorderableController"
            // context: inheriting class should provide ReorderableController params in this case
        },
        {
            qualifier: { snappableReordering: true },
            context: {
                movableCoveringBeginningOfViewPoint: [ // override definition inherited from MovableASController: 
                    { iAmCoveringTheBeginningOfViewPoint: true },
                    [{ visReordered: _ }, [me]]
                ]
            },
            write: {
                onSnappableReorderableControllerMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        "class": "MarkCoveringBeginningOfViewPointAsSpecifiedFiV"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SnappableReorderableController: {
        "class": o("SnappableReorderableControllerCore", "SnappableController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the horizontal version of SnappableReorderableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalSnappableReorderableController: {
        "class": o("Horizontal", "SnappableReorderableController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the vertical version of SnappableReorderableController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalSnappableReorderableController: {
        "class": o("Vertical", "SnappableReorderableController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. allDataJITSnappableVisReorderable: this class calculates jitSnappableVisReorderableData based on this param.
    //    inheriting classes should create an areaSet of JITSnappableVisReorderable with jitSnappableVisReorderableData as its data!!
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    JITSnappableReorderableController: {
        "class": o("SnappableReorderableControllerCore", "JITSnappableController"),
        context: {
            jitSnappableVisReorderableData: [_, // compress
                [identify,
                    _,
                    o(
                        [pos,
                            [{ jitMovablesRange: _ }, [me]],
                            [{ allDataJITSnappableVisReorderable: _ }, [me]]
                        ],
                        [{ reorderableOfDraggedToReorder: _ }, [me]]
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the horizontal version of JITSnappableReorderableController.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalJITSnappableReorderableController: {
        "class": o("Horizontal", "JITSnappableReorderableController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the vertical version of JITSnappableReorderableController.    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalJITSnappableReorderableController: {
        "class": o("Vertical", "JITSnappableReorderableController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of SnappableReorderable Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides a handle by which a VisReorderable can be dragged to reorder.
    // This class deals with the handle's z-index relative to its VisReorderable and to the reordering z-plane.
    // API: 
    // 1. visReorderable: Expects the areaRef to the visReorderable for which it is a handle.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    ReorderHandle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmDraggedToReorder: [{ visReorderable: { iAmDraggedToReorder: _ } }, [me]], // can be used by inheriting classes (e.g. FacetHandleDesign)
                positionAboveMyVisReorderable: [{ defaultPositionAboveMyVisReorderable: _ }, [me]]
            }
        },
        { // default
            "class": "DragHandle",
            context: {
                draggingFlag: [{ visReorderable: { iAmDraggedToReorder: _ } }, [me]],
                reorderableController: [{ visReorderable: { reorderableController: _ } }, [me]],
                defaultPositionAboveMyVisReorderable: true
            }
        },
        {
            qualifier: { positionAboveMyVisReorderable: true },
            stacking: {
                // the { draggingFlag: true } handle, the one for the VisReorderable being dragged, gets by default a z value that's above its VisReorderable
                aboveMyVisReorderable: {
                    lower: [{ visReorderable: _ }, [me]],
                    higher: [me]
                }
            }
        },
        {
            qualifier: { draggingFlag: false },
            stacking: {
                // the { draggingFlag: false } handle, the one for the Reorderables NOT being dragged, should be below the reorderingZPlane
                handleBelowReorderingZPlane: {
                    lower: [me],
                    higher: [{ reorderableController: { reorderingZPlane: _ } }, [me]]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableToReorder: {
        context: {
            "*iAmDraggedToReorder": false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // API:
    // 1. embedded in it is a DraggableToReorder class
    // 2. clipperWhileDraggedToReorder: myApp, by default
    // 
    // Inheriting classes may override the definition of clipper when clippedDraggedToReorder
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    DraggableToReorderClipper: o(
        { // variant-controller
            qualifier: "!",
            context: {
                clippedDraggedToReorder: o(
                    // is myDraggableToReorder being dragged right now
                    [{ myDraggableToReorder: { iAmDraggedToReorder: true } }, [me]],
                    [ // or was it dragged and then dropped, and we're currently awaiting the user's response to a ModalDialog?
                        {
                            droppedElementForModalDialogable: [{ myDraggableToReorder: _ }, [me]],
                            createModalDialog: true
                        },
                        [areaOfClass, "ModalDialogableOnDragAndDrop"]
                    ]
                )
            }
        },
        { // default
            "class": "Clipper",
            context: {
                myDraggableToReorder: [
                    [areaOfClass, "DraggableToReorder"],
                    [embedded]
                ],
                clipperWhileDraggedToReorder: [{ myApp: _ }, [me]]
            }
        },
        {
            qualifier: { clippedDraggedToReorder: true },
            context: {
                clipper: [{ clipperWhileDraggedToReorder: _ }, [me]]
            }
        }
    )

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of library
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////    
};