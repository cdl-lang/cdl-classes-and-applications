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


// %%include%%: "reference.js"
// %%classfile%%: "draggable.js"

// The classes below provide different scrolling implementations.
//
// Scrolling can be vertical or horizontal and we also distinguish between
// left-to-right and right-to-left scrolling. All offsets below are taken
// to be in the direction from the start of the scrolled document to
// the end of the scrolled document (so in left-to-right scrolling the
// offsets are from left to right and in right-to-left scrolling they are
// from right to left). This includes both defining and calculated offsets
// as well as offsets measured from the positoning system.

var classes = {

    // Auxiliary class to match every start edge with the matching
    // end edge

    ScrollStartAndEndEdges: o(
        {
            context: {
                // should take the value "left", "right" or
                // "bottom" (not very useful)
                scrollStartEdge: [
                    first,
                    o([{ scrollStartEdge: _ }, [myContext, "ScrolledDocument"]],
                      "top")], // default is "top"
                // defined based on scrollStartEdge
                // scrollEndEdge: ?
            }
        },

        {
            qualifier: { scrollStartEdge: "top" },
            context: {
                scrollEndEdge: "bottom"
            }
        },
        
        {
            qualifier: { scrollStartEdge: "left" },
            context: {
                scrollEndEdge: "right"
            }
        },

        {
            qualifier: { scrollStartEdge: "right" },
            context: {
                scrollEndEdge: "left"
            }
        },

        {
            // this is probably not very useful
            qualifier: { scrollStartEdge: "bottom" },
            context: {
                scrollEndEdge: "top"
            }
        }
    ),

    // This class defines a set of positioning constraints which allow
    // setting the initial scroll position of the document and then
    // scrolling the document by some positioning constraint attached
    // to the document (which moves it relative to the view).
    // A class using this must defined a context label 'beingMoved'
    // such that when 'beingMoved' is set the position of the document is
    // determined by some external positioning constraint attached to the
    // document while when 'beingMoved' is false the stability constraints
    // defined here keep the document in place.
    // One can override the stability constraints defined here by either
    // setting 'wasMoved' to false (this will disable the stability until
    // the next move) or by overriding 'stabilityPriority' (the disabling
    // class must then make sure to have some other constraints in place
    // to keep the document in the right place).
    // When setting 'wasMoved' back to false, one may choose which
    // constraints will become active. By default, this is the
    // 'scrollInitialOffset' constraint (which sets the initial offset
    // between the start of the document and the start of the view).
    // However, one can disable this initial constraint while 'wasMoved'
    // is false by setting the 'disableInitialOffset' context label
    // to true. One can then set other constraints using the
    // 'initialOffsetPriority' to set the scrolling position such that
    // once the scrolled document is moved, these initial constraints
    // will be disabled (weakened) and the stability constraints will
    // hold instead.
    
    MoveableScrolledDocument: o(
        {
            context: {

                // will be changed once dragging took place
                initialOffsetPriority: dragPriorities.noDragPriority,
                // will be increased only after first movement
                stabilityPriority: dragPriorities.dragPriority,
                // initial offset of scroll (typically, but not necessarily, 0)
                // This is writable, to allow change by external controllers 
                "^initialScrollOffset": [{ initialScrollOffset: _ },
                                         [myContext, "ScrolledDocument"]],
                
                // set to true by movement and may be reset to false if needed.
                "^wasMoved": false,

                // setting this to true and setting 'wasMoved' to false will
                // result in the scrolled document being scrolled to the
                // end, until the document is moved again.
                "^scrollToEnd": false,

                // This property should be set to true on the scrolled document
                // context when the view is being resized in the direction
                // of scrolling. This allows the document to move to adjust
                // to the resizing of the view.
                scrollViewBeingResized: [{ scrollViewBeingResized: _ },
                                         [myContext, "ScrolledDocument"]],
            },

            // stability constraint (along axis of scrolling)
            
            position: {
                scrollStabiity: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    stability: true,
                    priority: [{ stabilityPriority: _ }, [me]] 
                }
            },
            
            // once moved, mark it as such (or again, if 'wasMoved'
            // is reset to false).
            write: {
                wasMoved: {
                    upon: [{ beingMoved: true }, [me]],
                    true: {
                        wasMoved: {
                            to: [{ wasMoved: _ }, [me]],
                            merge: true
                        }
                    }
                }
            },
        },

        // this variant should be of higher priority than the next one
        
        {
            qualifier: { beingMoved: true },
            context: {
                // lower stability constraint priority whiel dragging
                stabilityPriority: dragPriorities.dragPriority
            }
        },
        
        {
            qualifier: { wasMoved: true },
            context: {
                // lower initial constraint priority once dragging took place
                initialOffsetPriority: dragPriorities.dragPriority,
                // increase tability once dragging took place (will be
                // reduced when dragging takes place)
                stabilityPriority: dragPriorities.noDragPriority,
            }
        },
        
        {
            qualifier: { disableInitialOffset: false },

            // initial offset constraint
            
            position: {
                scrollInitialOffset: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    equals: [{ initialScrollOffset: _ }, [me]],
                    priority: [{ initialOffsetPriority: _ }, [me]] 
                }
            }
        },
        
        {
            qualifier: { scrollStartEdge: o("right","bottom"),
                         disableInitialOffset: false },

            // reverse the initial offset for right-to-left scrolling
            
            position: {
                scrollInitialOffset: {
                    equals: [uminus, [{ initialScrollOffset: _ }, [me]]],
                }
            }
        },

        {
            // when the 'scrollToEnd' property is set, the document is
            // scrolled to the end of the document using the initial offset
            // priority. This mean that this will take effect only as long as
            // 'wasMoved' is false.
            
            qualifier: { scrollToEnd: true },

            context: {
                // disable the standard initial offset
                disableInitialOffset: true,
            },

            position: {
                scrollToEnd: {
                    point1: { label: "scrolledDocumentEnd" },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    equals: 0,
                    priority: [{ initialOffsetPriority: _ }, [me]] 
                }
            }
        },
        
        // When the view of the scrolled document is beign resized,
        // the document may have to move (for example, if it was already
        // scrolled all the way to the end).
        
        {
            qualifier: { scrollViewBeingResized: true },

            context: {
                beingMoved: true
            }
        }
    ),

    // include this class in an embedding* area which defines the parameters
    // which are accessed through [myContext, "ScrolledDocument"] below
    // The area that inherits ScrolledDocumentContext must define scrolledData
    
    ScrolledDocumentContext: o(
        {
            context: {
                scrolledData: mustBeDefined
            }
        }
    ),
    
    // The scrolled document is used to display a long sequence of
    // areas displayed one after the other, such that only those falling
    // within the view actually need to be generated.
    // The areas generated are generated as children of the document.
    // The document area does not need to be any larger than the
    // area needed to display the children generated.
    //
    // The document has two virtual points which define the real beginning
    // and end of the document.
    // The document class must have a way to determine the position of
    // each area in the list of areas in the document and a way to
    // determine which of these covers the beginning of the view and
    // which the end of the view (if at all). The simplest method is
    // if each area in the set takes equal space (including the
    // distance between the areas). However, other methods may also be
    // available (see below).
    
    ScrolledDocument: o(
        {
            "class": o("MoveableScrolledDocument", "ScrollStartAndEndEdges"),
            
            context: {

                // the data from which the scrolled document is created
                scrolledData: [{ scrolledData: _ },
                               [myContext, "ScrolledDocument"]],
                // indicates whether there are any items in the document
                isNonEmptyDocument: [notEqual, 0,
                                     [size, [{ scrolledData: _ }, [me]]]],
                
                // since item areas are created and destroyed dynamically
                // (and the same area may be used to display different
                // items) we here provide a place for items to store their
                // non-default context properties (these should be stored
                // in objects which contain an attribute storing a unique
                // identifier of the relevant item). This should be a writeable
                // context label.
                itemContext: [{ itemContext: _ },
                              [myContext, "ScrolledDocument"]],

                // the offset from the beginning of the document to
                // the beginning of the view (may be negative)
                startViewOffset: [offset,
                                  { label: "scrolledDocumentStart" },
                                  { type: [{ scrollStartEdge: _ }, [me]] }],
                // the offset from the beginning of the document to
                // the end of the view (may be negative, but not likely)
                endViewOffset: [offset,
                                { label: "scrolledDocumentStart" },
                                { type: [{ scrollEndEdge: _ }, [me]] }],
                
                // required fields (must be provided by derived class)

                // index of first item in view (at least zero)
                
                // firstInView: ? // should be defined in extending class
                               
                // index of the first item to position (may be before
                // the beginning of the view). By default, this is the
                // first in view.
                firstToPos: [{ firstInView: _ }, [me]],
                // index of last item to position (at least 0, but no greater
                // than the real last item)

                // lastToPos: ? // should be defined in extending class

                // length of document

                // documentLength: ? // should be defined in extending class

                // absolute value in case the direction is right to left
                viewLength: [abs,
                             [offset, { type: [{ scrollStartEdge: _ }, [me]] },
                              { type: [{ scrollEndEdge: _ }, [me]] }]],

                // does the full document fit into the view?
                documentFitsInView: [
                    lessThanOrEqual,
                    [{ documentLength: _ }, [me]], [{ viewLength: _ }, [me]]],
                
                // a point definition for the start point of the first
                // item in the document. By default, this is simply
                // the start point of the document, but derived classes
                // may modify this (e.g. the non-uniform item scroll below).

                startFirstItemInDoc: {
                    label: "scrolledDocumentStart",
                    // explicit, as this may be used by other areas
                    element: [me]
                },
            },

            position: {
                // position the beginning and end of the document relative
                // to each other based on the document length

                scrolledDocumentLength: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: { label: "scrolledDocumentEnd" },
                    equals: [{ documentLength: _ }, [me]]
                },

                // don't scroll beyond beginning
                notBeforeStart: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    min: 0,
                    priority: dragPriorities.dragStopPriority
                },

                // don't scroll beyond end (this is an 'or' constraint
                // to avoid the view being made smaller when the document
                // is shorter than the view and the view is resizeable)
                notBeyondEnd: {
                    point1: { label: "scrolledDocumentEnd" },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    max: 0,
                    priority: dragPriorities.weakDragStopPriority,
                    orGroups: { label: "notBeyondEndOrStayAtStart" }
                },

                // the document is allowed not to reach the end of the
                // view if its beginning is inside the scroll view
                stayAtStartWhenShort: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    max: 0,
                    priority: dragPriorities.weakDragStopPriority,
                    orGroups: { label: "notBeyondEndOrStayAtStart" }
                }
            }
        },

        {
            qualifier: { isNonEmptyDocument: true },

            children: {
                itemsInView: {
                    // the positions which are in the view
                    data: [sequence, r([{ firstToPos: _ }, [me]],
                                       [{ lastToPos: _ }, [me]])],
                    description: {
                        "class": "ScrolledItem"
                    }
                }
            }
        },
        
        // right to left: offsets in direction of scrolling and constraints
        // in the opposite direction
        
        {
            qualifier: { scrollStartEdge: o("right","bottom") },

            context: {
                // reverse point order relative to the original definition
                startViewOffset: [offset,
                                  { type: [{ scrollStartEdge: _ }, [me]] },
                                  { label: "scrolledDocumentStart" }],
                endViewOffset: [offset,
                                { type: [{ scrollEndEdge: _ }, [me]] },
                                { label: "scrolledDocumentStart" }]
            },
            
            position: {
                // reverse direction of constraints
                scrolledDocumentLength: {
                    equals: [uminus, [{ documentLength: _ }, [me]]]
                },

                notBeforeStart: {
                    min: -Infinity, // override the default value
                    max: 0
                },

                notBeyondEnd: {
                    max: Infinity, // override the default value
                    min: 0
                },

                stayAtStartWhenShort: {
                    max: Infinity, // override the default value
                    min: 0
                }
            },
        }
    ),

    // This is a class extension which extends the ScrolledDocument class
    // to handle the special case of equal sized, equally spaced items.
    // This is a class extension, so one also needs to inherit
    // "ScrolledDocument" when using this extension.

    UniformItemScrolledDocumentExt: o(
        {
            context: {
                // define this as the size of the item (including border,
                // excluding spacing between items).
                itemSize: [{ itemSize: _ }, [myContext, "ScrolledDocument"]],
                // define this as the spacing between items
                itemSpacing: [{ itemSpacing: _ },
                              [myContext, "ScrolledDocument"]],
                // this is the sum of the two values above (defining the
                // total distance between the beginning of one item and
                // the beginning of the next)
                itemOffset: [plus, [{ itemSize: _ }, [me]],
                             [{ itemSpacing: _ }, [me]]], 

                // The number of items required to cover the view. If this is
                // a fractional number, it is rounded up (to make sure the
                // view is fully covered).
                itemsToCoverView: [ceil, [div, [{ viewLength: _ }, [me]],
                                          [{ itemOffset: _ }, [me]]]],
                
                // calculate first and last in view
                firstInView: [max, 0,
                              [min,
                               [minus, [size, [{ scrolledData: _ }, [me]]],
                                [{ itemsToCoverView: _ }, [me]]],
                               [floor, [div, [{ startViewOffset: _ }, [me]],
                                        [{ itemOffset: _ }, [me]]]]]],
                lastToPos: [max, 0,
                            [min,
                             [minus, [size, [{ scrolledData: _ }, [me]]], 1],
                             [floor, [div, [{ endViewOffset: _ }, [me]],
                                      [{ itemOffset: _ }, [me]]]]]],

                // total length of document
                documentLength: [minus,
                                 [mul, [size, [{ scrolledData: _ }, [me]]],
                                  [{ itemOffset: _ }, [me]]],
                                 [{ itemSpacing: _ }, [me]]],

                // offset from start functions

                itemNumToStartPosFunc: [
                    defun, "itemPos",
                    [mul, "itemPos", [{ itemOffset: _ }, [me]]]
                ],

                itemNumToEndPosFunc: [
                    defun, "itemPos",
                    [plus, 
                     [mul, "itemPos", [{ itemOffset: _ }, [me]]],
                     [{ itemSize: _ }, [me]]]
                ],
            }, 
        }
    ),

    // This is a class extension which extends the ScrolledDocument
    // class to handle a scrolled document where the items are not
    // necessarily of the same size (item size or spacing between
    // them). This is a class extension, so one also needs to inherit
    // "ScrolledDocument" when using this extension.
    
    NonUniformItemScrolledDocumentExt: o(
        {
            context: {
                // define this as the minimal size of the item (including
                // border, excluding spacing between items)
                minItemSize: [{ minItemSize: _ },
                              [myContext, "ScrolledDocument"]],
                // define this as the minimal spacing between items
                minItemSpacing: [{ minItemSpacing: _ },
                                 [myContext, "ScrolledDocument"]],
                // this is the sum of the two values above (defining the
                // minimal total distance between the beginning of one item and
                // the beginning of the next)
                minItemOffset: [plus, [{ minItemSize: _ }, [me]],
                                [{ minItemSpacing: _ }, [me]]],
                
                // first in view is a written value, recalculated each time
                // the offset between the beginning of the view and
                // the beginning of the document changes (see 'write' below)
                // The initial value is 0
                "^firstInView": 0,
                
                // The offset of the first item in view (from the start
                // of the document) is a written value, recalculated each time
                // the offset between the beginning of the view and
                // the beginning of the document changes (see 'write' below)
                // The initial value is 0
                "^firstInViewStartOffset": 0, 

                // items which are generated and therefore are positioned
                // (do not necessarily actually need to be visible)
                positionedItems: [{ children: { itemsInView: _ }}, [me]],
                
                // The position entry (index + position offset) of
                // the item which covers the current startViewOffset
                // (if such an area exists).
                coveringStartView: [
                    { itemPosInDoc: _ },
                    [{
                        itemPosInDoc: {
                            offsetRange: [{ startViewOffset: _ }, [me]]
                        }
                    },
                    [{ positionedItems: _ }, [me]]]
                ],

                // track properties of positioned items

                // index and start offset of first positioned item
                indexOfFirstPositionedItem: [min,
                                             [{ itemPosInDoc: { index: _ }},
                                              [{ positionedItems: _ }, [me]]]],
                startOffsetOfFirstPositionedItem: [
                    min, // the start of the range
                    [{ itemPosInDoc: { offsetRange: _ }},
                     [{
                         itemPosInDoc: {
                             index: [{ indexOfFirstPositionedItem: _ }, [me]]}},
                      [{ positionedItems: _ }, [me]]]]],

                // the offset of the first item in the document given the
                // offsets of the first positioned item and the assumption
                // that all items before the first positioned have a minimal
                // size.
                startDocByFirstPositionedItem: [
                    first, // if no item is positioned, start with 0
                    o(
                        [minus,
                         [{ startOffsetOfFirstPositionedItem: _ }, [me]],
                         [mul,
                          [{ minItemOffset: _ }, [me]],
                          [{ indexOfFirstPositionedItem: _ }, [me]]]
                        ],
                        0)
                ],
                
                indexOfLastPositionedItem: [max,
                                            [{ itemPosInDoc: { index: _ }},
                                             [{ positionedItems: _ }, [me]]]],
                endOffsetOfLastPositionedItem: [
                    max, // the end of the range
                    [{ itemPosInDoc: { offsetRange: _ }},
                     [{
                         itemPosInDoc: {
                             index: [{ indexOfLastPositionedItem: _ }, [me]]}},
                      [{ positionedItems: _ }, [me]]]]],

                // the end offset of the last item in the document given the
                // offsets of the last positioned item and the assumption
                // that all items after the last positioned have a minimal
                // size. If there are no positioned items, this defaults
                // to the default length of the document (based on uniform
                // item size).
                endDocByLastPositionedItem: [
                    plus,
                    [first, // if not positioned items, start at 0
                     o([{ endOffsetOfLastPositionedItem: _ }, [me]], 0)],
                    [mul,
                     [{ minItemOffset: _ }, [me]],
                     [minus,
                      [minus, [size, [{ scrolledData: _ }, [me]]], 1],
                      [first, // if not positioned items, start at 0 
                       o([{ indexOfLastPositionedItem: _ }, [me]], 0)]]]
                ],

                // range of offsets which fall before the positioned items
                // (if there are no positioned items, these are all offsets
                // in the document based on the minimal item size).
                offsetsBeforeFirstPositioned: Rco(
                    [{ startDocByFirstPositionedItem: _ }, [me]],
                    [first, 
                     o([{ startOffsetOfFirstPositionedItem: _ }, [me]],
                       [{ endDocByLastPositionedItem: _ }, [me]])]
                ),
                
                // range of offsets which fall after the positioned items
                // (if there are no positioned items, this is an empty range)
                offsetsAfterLastPositioned: Roc(
                    [first,
                     o([{ endOffsetOfLastPositionedItem: _ }, [me]],
                       [{ endDocByLastPositionedItem: _ }, [me]])],
                    [{ endDocByLastPositionedItem: _ }, [me]]
                ),

                startViewIsBeforeFirstPositioned: [
                    notEmpty, [[{ startViewOffset: _ }, [me]],
                               [{ offsetsBeforeFirstPositioned: _ }, [me]]]
                ],

                startViewBeforeDocStart: [
                    notEmpty,
                    [[{ startViewOffset: _ }, [me]],
                     Rco(-Infinity,
                         [min, [{ offsetsBeforeFirstPositioned: _ }, [me]]])]],
                
                endViewIsAfterLastPositioned: [
                    notEmpty, [[{ startViewOffset: _ }, [me]],
                               [{ offsetsAfterLastPositioned: _ }, [me]]]
                ],

                startViewAfterDocEnd: [
                    notEmpty,
                    [[{ startViewOffset: _ }, [me]],
                     Rco([max, [{ offsetsAfterLastPositioned: _ }, [me]]],
                         Infinity)]],

                documentLength: [minus, 
                                 [{ endDocByLastPositionedItem: _ }, [me]],
                                 [{ startDocByFirstPositionedItem: _ }, [me]]],

                // a point definition for the start point of the first
                // item in the document. In the non-uniform case, this
                // is a specially positioned point which may move relative
                // to the start of document point as the approximation
                // of where the items should be positioned changes.
                // This point is positioned below.
                
                startFirstItemInDoc: {
                    label: "startFirstItemInDoc",
                    // explicit, as this may be used by other areas
                    element: [me]
                },

            },

            position: {

                // this sets the offset between 'scrolledDocumentStart'
                // and 'scrolledDocumentEnd'. Because the exact offsets are
                // only estimated, the calculated beginning is not necessarily
                // at 'scrolledDocumentStart'. We here set 'scrolledDocumentEnd'
                // to its estimated position relative to 'scrolledDocumentStart'
                scrolledDocumentLength: {
                    equals: [{ endDocByLastPositionedItem: _ }, [me]]
                },
                
                // position the virtual point marking the beginning of
                // the first item in the document based on the current
                // approximation of the position of this item.
                startFirstItemInDoc: {
                    point1: { label: "scrolledDocumentStart" },
                    point2: [{ startFirstItemInDoc: _ }, [me]],
                    equals: [{ startDocByFirstPositionedItem: _ }, [me]]
                },

                // the first item is not always at the document start, so
                // we need to adjust for the difference
                notBeforeStart: {
                    min: [{ startDocByFirstPositionedItem: _ }, [me]],
                },
            },
            
            // when the offset between the beginning of the view and the
            // beginning of the document changes, calclate the new first
            // in view and its offset from the document start.
            // The default implementation handles the case where the
            // startViewOffset falls inside an already positioned item.
            // The other cases are covered by the variants below.
            // When 'wasMoved' is set back to false this also needs to be
            // triggered as this means that some other controller has just
            // reset the position.
            
            write: {
                viewStartOffsetChanged: {
                    upon: [or,
                           [changed, [{ startViewOffset: _ }, [me]]],
                           [not, [{ wasMoved: _ }, [me]]]],
                    true: {
                        setFirstInView: {
                            to: [{ firstInView: _ }, [me]],
                            // default case, where view start is covered
                            // by a positioned item
                            merge: [{ index: _ },
                                    [{ coveringStartView: _ }, [me]]]
                        },
                        setFirstInViewStartOffset: {
                            to: [{ firstInViewStartOffset: _ }, [me]],
                            // default case, where view start is covered
                            // by a positioned item
                            merge: [min,
                                    [{ offsetRange: _ },
                                     [{ coveringStartView: _ }, [me]]]]
                        }
                    }
                }
            },
            
            // Use a special class for the items
            
            children: {
                itemsInView: {
                    description: {
                        "class": "NonUniformScrolledItem"
                    }
                }
            }

        },
        
        {
            qualifier: { firstInView: true },
            context: {

                // first to position is calculated so as to ensure that
                // sufficiently many areas are generated before the first in
                // view so that if the first in view is scrolled all the way
                // to the bottom of the view (but still within the view)
                // the first area in view (after the scroll) was already
                // generated in the previous step).
                firstToPos: [max,
                             0,
                             [minus, [{ firstInView: _ }, [me]],
                              [floor, [div, [{ viewLength: _ }, [me]],
                                       [{ minItemOffset: _ }, [me]]]]]],

                
                // last to position is calculated so as to ensure that
                // as long as there are enough items, the view will be
                // completely filled.
                lastToPos: [min,
                            [minus, [size, [{ scrolledData: _ }, [me]]], 1],
                            [plus, [{ firstInView: _ }, [me]],
                             [ceil, [div, [{ viewLength: _ }, [me]],
                                      [{ minItemOffset: _ }, [me]]]]]],
            }
        },
        
        // This variant handles the case where startViewOffset falls before
        // the first positioned item (and this also covers the initial
        // case where no items have been positioned yet).
        
        {
            qualifier: { startViewIsBeforeFirstPositioned: true },

            context: {
                // the relative position of the start view inside the
                // range of offsets before the first positioned item
                relativeViewStart: [
                    div,
                    [minus,
                     [{ startViewOffset: _ }, [me]],
                     [min, [{ offsetsBeforeFirstPositioned: _ }, [me]]]],
                    [minus,
                     [max, [{ offsetsBeforeFirstPositioned: _ }, [me]]],
                     [min, [{ offsetsBeforeFirstPositioned: _ }, [me]]]]
                ]
            },
            
            write: {
                viewStartOffsetChanged: {
                    true: {
                        setFirstInView: {
                            merge: [
                                floor,
                                [mul,
                                 [{ relativeViewStart: _ }, [me]],
                                 [first,
                                  o([{ indexOfFirstPositionedItem: _ }, [me]],
                                    [size, [{ scrolledData: _ }, [me]]])]]]
                        },
                        // this is not exact, but probably good enough
                        setFirstInViewStartOffset: {
                            merge: [{ startViewOffset: _ }, [me]]
                        }
                    }
                }
            }
        },

        // in case scrolling has moved to a position before the
        // beginning of the document, the first item in view is the
        // first item (index 0) and it is positioned at the start of
        // the view (this behvior can be modified by a derived class).
        
        {
            qualifier: { startViewBeforeDocStart: true },

            write: {
                viewStartOffsetChanged: {
                    true: {
                        setFirstInView: {
                            merge: 0
                        },
                        // this is not exact, but probably good enough
                        setFirstInViewStartOffset: {
                            merge: [{ startViewOffset: _ }, [me]]
                        }
                    }
                }
            }
        },
        
        // This variant handles the case where startViewOffset falls after
        // the last positioned item (this holds only if there are any
        // positioned items) but still inside the (approximate) scrolled
        // document.
        
        {
            qualifier: { endViewIsAfterLastPositioned: true },

            context: {
                // the relative position of the start view inside the
                // range of offsets after the last positioned item
                relativeViewStart: [
                    div,
                    [minus,
                     [{ startViewOffset: _ }, [me]],
                     [min, [{ offsetsAfterLastPositioned: _ }, [me]]]],
                    [minus,
                     [max, [{ offsetsAfterLastPositioned: _ }, [me]]],
                     [min, [{ offsetsAfterLastPositioned: _ }, [me]]]]
                ]
            },

            write: {
                viewStartOffsetChanged: {
                    true: {
                        setFirstInView: {
                            merge: [
                                plus,
                                [{ indexOfLastPositionedItem: _ }, [me]],
                                [ceil,
                                 [mul,
                                  [{ relativeViewStart: _ }, [me]],
                                  [minus,
                                   [minus,
                                    [size, [{ scrolledData: _ }, [me]]], 1],
                                   [{ indexOfLastPositionedItem: _ }, [me]]
                                  ]]]]
                        },
                        // this is not exact, but probably good enough
                        setFirstInViewStartOffset: {
                            merge: [{ startViewOffset: _ }, [me]]
                        }
                    }
                }
            }
        },

        // in case scrolling has moved to a position beyond the end
        // of the document, we position the last item at the beginning
        // of the view.
        
        {
            qualifier: { startViewAfterDocEnd: true },

            write: {
                viewStartOffsetChanged: {
                    true: {
                        setFirstInView: {
                            merge: [minus,
                                    [size, [{ scrolledData: _ }, [me]]], 1]
                        },
                        // this is not exact, but probably good enough
                        setFirstInViewStartOffset: {
                            merge: [{ startViewOffset: _ }, [me]]
                        }
                    }
                }
            }
        },

        // right to left case: reverse the positioning constraint.

        {
            qualifier: { scrollStartEdge: o("right","bottom") },

            position: {

                scrolledDocumentLength: {
                    equals: [uminus, [{ endDocByLastPositionedItem: _ }, [me]]]
                },
                
                startFirstItemInDoc: {
                    equals: [uminus,
                             [{ startDocByFirstPositionedItem: _ }, [me]]]
                },

                notBeforeStart: {
                    min: -Infinity,
                    max: [uminus, [{ startDocByFirstPositionedItem: _ }, [me]]]
                },
            },
        }
    ),

    // This is a class extension which extends the ScrolledDocument class.
    // This is a class extension, so one also needs to inherit
    // "ScrolledDocument" when using this extension.
    // This class extension allows scrolling the items by their index in
    // the list, regardless of the size of each item. This is for scrolling of
    // non-uniform items where the attached scoll-bar is index-based.
    // This extends the non-uniform scrolled document class.
    // When one wishes to position by setting the first item in view
    // (e.g. when positioning based on scroll-bar position) one
    // can simply write the index of the desired item to 'firstInView'.
    // If one wishes to also set the offset of the first in view
    // based on the part (in the range [0,1)) of it which is invisible
    // (scrolled out already) one needs to set the
    // 'setFirstInViewPartInvisible' label to true (only while scrolling
    // by some external element, such as a scroll-bar is in progress)
    // and then write the desired value to 'desiredFirstInViewPartInvisible'.
    // 'setFirstInViewPartInvisible' can best be defined by a class
    // inheriting this class to have it turned on when needed.
    
    IndexedItemScrolledDocumentExt: o(
        {
            "class": "NonUniformItemScrolledDocumentExt",
            context: {

                // when this is turned on, it is possible to position the
                // first visible item based on that part [0,1) of it which
                // is invisible (scrolled out).
                // setFirstInViewPartInvisible: false,
                
                // The position entry (index + position offset) of
                // the item which covers the current endViewOffset
                // (if such an area exists). This is defined similarly
                // to coveringStartView which is defined in the base class.
                coveringEndView: [
                    { itemPosInDoc: _ },
                    [{
                        itemPosInDoc: {
                            offsetRange: [{ endViewOffset: _ }, [me]]
                        }
                    },
                    [{ positionedItems: _ }, [me]]]
                ],
                // the index of the item covering the start of the view
                // (if none is covering, it is 0).
                coveringStartViewIndex: [
                    first, o([{ index: _ }, [{ coveringStartView: _ }, [me]]],
                             0)],
                // the index of the item covering the end of the view
                // (if none is covering, it is the index of the last item).
                coveringEndViewIndex: [
                    first, o([{ index: _ }, [{ coveringEndView: _ }, [me]]],
                             [minus, [size, [{ scrolledData: _ }, [me]]], 1])
                ],

                // proportion of first item which is not in view
                firstInViewPartInvisible: [
                    first,
                    o([div,
                       [minus,
                        [{ startViewOffset: _ }, [me]],
                        [min, [{ offsetRange: _ },
                               [{ coveringStartView: _ },[me]]]]
                       ],
                       [minus,
                        [max, [{ offsetRange: _ },
                               [{ coveringStartView: _ },[me]]]],
                        [min, [{ offsetRange: _ },
                               [{ coveringStartView: _ },[me]]]]]],
                      0)
                ],

                // proporition of last item which is in view
                lastInViewPartVisible: [
                    first,
                    o([div,
                       [minus,
                        [{ endViewOffset: _ }, [me]],
                        [min, [{ offsetRange: _ },
                               [{ coveringEndView: _ },[me]]]]],
                       [minus,
                        [max, [{ offsetRange: _ },
                               [{ coveringEndView: _ },[me]]]],
                        [min, [{ offsetRange: _ },
                               [{ coveringEndView: _ },[me]]]]]],
                      1)
                ],
            },

            children: {
                itemsInView: {
                    description: {
                        "class": "IndexedScrolledItem"
                    }
                }
            }
        },

        {
            qualifier: { setFirstInViewPartInvisible: true },
            context: {
                // should be written by element performing the positioning.
                "^desiredFirstInViewPartInvisible": 0,
            }
        }
    ),

    // This class extension should be inherited together with an appropriate
    // ScrolledDocument class to provide draggability of the scrolled document.
    // This inherits the Draggable class and sets it to attached to
    // the beginning of the document.
    
    DraggableScrolledDocumentExt: o(
        {
            "class": o("Draggable"),

            context: {
                wasDragged: [{ wasMoved: _ }, [me]],
            },
        },

        {
            qualifier: { beingDragged:  true },
            context: {
                beingMoved: true
            }
        },
        
        {
            qualifier: { scrollStartEdge: o("top","bottom") },
            context: {
                draggedVerticalEdge: { label: "scrolledDocumentStart" },
                horizontallyDraggable: false
            }
        },

        {
            qualifier: { scrollStartEdge: o("left","right") },
            context: {
                draggedHorizontalEdge: { label: "scrolledDocumentStart" },
                verticallyDraggable: false
            }
        }
    ),
    
    // a single item in the scrolled list. These can be positioned absolutely
    // (relative to the beginning of the document) or just the first item is
    // positioned absolutely and the rest are positioned relatively.
    //
    // set 'absolutePositioning: true' (in the item class) for absolute
    // positioning.
    // Define positioning constraints directly in the class to position
    // relative to each other. Only the beginning of the first item is
    // positioned absolutely.
    
    ScrolledItem: o(
        {
            context: {

                // "top", "bottom" or "left", "right" or "right", "left"
                scrollStartEdge: [{ scrollStartEdge: _ }, [embedding]], 
                scrollEndEdge: [{ scrollEndEdge: _ }, [embedding]],

                // default positioning is absolute positioning of
                // beginning and end of each item
                absolutePositioning: true,

                // should the start point be positioned absolutely,
                // by default this is true only if absolutePositioning is
                // set or if thi is the first item. 
                absolutePositionStart: [or, [{ absolutePositioning: _ }, [me]],
                                        [empty, [prev, [me]]]],
                // should the end point be positioned absolutely?
                // By default only if all positioning is absolute
                absolutePositionEnd: [{ absolutePositioning: _ }, [me]],
                
                // the sequential index of this item in the scrolled
                // data set (an integer)
                itemIndexInDoc: [{ param: { areaSetContent: _ }}, [me]]
            },
            
            // the content is the scrolled data at this position
            content: [pos, [{ itemIndexInDoc: _ }, [me]],
                      [{ scrolledData: _ }, [embedding]]],
        },

        {
            // absolute positioning of start (relative to virtual beginning
            // of the document
            
            qualifier: { absolutePositionStart: true },

            context: {
                beginningOfItemOffset: [
                    // get function to calculate the offset
                    [{ itemNumToStartPosFunc: _ }, [embedding]],
                    // apply it to the sequential position of the item
                    [{ itemIndexInDoc: _ }, [me]]] 
            },
            
            position: {
                beginningOfItem: {
                    point1: { label: "scrolledDocumentStart",
                              element: [embedding] },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    equals: [{ beginningOfItemOffset: _ }, [me]]
                }
            }
        },

        {
            // reverse the positioning constraint (as offsets are always in
            // the direction of scrolling).
            
            qualifier: { absolutePositionStart: true,
                         scrollStartEdge: o("right","bottom") },
            
            position: {
                beginningOfItem: {
                    equals: [uminus, [{ beginningOfItemOffset: _ }, [me]]]
                }
            }
        },
        
        {
            qualifier: { absolutePositionEnd: true },

            context: {
                endEdgeOffset: [
                    // get function to calculate the offset
                    [{ itemNumToEndPosFunc: _ }, [embedding]],
                    // apply it to the sequential position of the item
                    [{ itemIndexInDoc: _ }, [me]]]
            },
            
            position: {
                endOfItem: {
                    point1: { label: "scrolledDocumentStart",
                              element: [embedding]
                            },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    equals: [{ endEdgeOffset: _ }, [me]]
                }
            }
        },

        {
            // reverse the positioning constraint (as offsets are always in
            // the direction of scrolling).

            qualifier: { absolutePositionEnd: true,
                         scrollStartEdge: o("right", "bottom") },

            position: {
                endOfItem: {
                    equals: [uminus, [{ endEdgeOffset: _ }, [me]]]
                }
            }
        }
    ),

    NonUniformScrolledItem: o(
        {
            context: {

                // only the start of the first item in view will be absolutely
                // positioned (and this is determined explicitly below).
                absolutePositioning: false,

                // absolute position the start only if the index of this
                // item is the one set as the 'first in view' in the
                // document area (the embedding area).
                absolutePositionStart: [notEmpty,
                                        [[{ itemIndexInDoc: _ }, [me]],
                                         [{ firstInView: _ }, [embedding]]]],
                
                // This object stores the offset covered by this item together
                // with its sequential position in the scrolled data set.

                itemPosInDoc: {
                    index: [{ itemIndexInDoc: _ }, [me]],
                    offsetRange: Rco(
                        [offset,
                         { label: "scrolledDocumentStart",
                           element: [embedding] },
                         { type: [{ scrollStartEdge: _},[me]] } ],
                        [max,
                         [offset,
                          { label: "scrolledDocumentStart",
                            element: [embedding] },
                          { type: [{ scrollEndEdge: _},[me]] }],
                         [offset,
                          { label: "scrolledDocumentStart",
                            element: [embedding] },
                          { type: [{ scrollStartEdge: _},[me]],
                            element: [next, [me]]} ]
                         ]
                    )
                }
            },
        },

        {
            // absolute positioning of start, so this only applies to
            // the first item.
            qualifier: { absolutePositionStart: true },
            
            position: {
                beginningOfItem: {
                    // get the offset from the document area
                    equals: [{ firstInViewStartOffset: _ }, [embedding]]
                }
            }
        },

        // right to left: the offsets need to be calculated in the opposite
        // direction.

        {
            qualifier: { scrollStartEdge: "right" },

            context: {
                itemPosInDoc: {
                    offsetRange: Rco(
                        [offset,
                         { type: [{ scrollStartEdge: _},[me]] },
                         { label: "scrolledDocumentStart",
                           element: [embedding] }],
                        [max,
                         [offset,
                          { type: [{ scrollEndEdge: _},[me]] },
                          { label: "scrolledDocumentStart",
                            element: [embedding] }],
                         [offset,
                          { type: [{ scrollStartEdge: _},[me]],
                            element: [next, [me]]},
                          { label: "scrolledDocumentStart",
                            element: [embedding] }]
                         ]
                    )
                }
            }
        },

        {
            // absolute positioning of start, so this only applies to
            // the first item. The offset needs to be reversed, as the
            // constraint applies from the start of the document to the
            // start of the item
            qualifier: { absolutePositionStart: true,
                         scrollStartEdge: "right" },
            
            position: {
                beginningOfItem: {
                    // get the offset from the document area
                    equals: [uminus,
                             [{ firstInViewStartOffset: _ }, [embedding]]]
                }
            }
        }
    ),

    IndexedScrolledItem: o(
        {
            "class": "NonUniformScrolledItem",
            context: {
                posByFirstInViewPartInvisible: [
                    { setFirstInViewPartInvisible: _ }, [embedding]],
            }
        },

        {
            qualifier: { posByFirstInViewPartInvisible: true,
                         absolutePositionStart: true },
            position: {
                posByInvisiblePart: {
                    pair1: {
                        point1: { type: [{ scrollStartEdge: _ }, [me]] },
                        point2: { type: [{ scrollEndEdge: _ }, [me]] }
                    },
                    pair2: {
                        point1: { type: [{ scrollStartEdge: _ }, [me]] },
                        point2: { type: [{ scrollStartEdge: _ }, [embedding]],
                                  element: [embedding] }
                    },
                    ratio: [{ desiredFirstInViewPartInvisible: _ }, [embedding]]
                }
            }
        }
    ),

    //
    // Ready to use scrolled document classes combining the various extensions
    // defined above with a scrolled document base class (and possibly with 
    // additional elements)
    //

    // A special instance of the scrolled document class for equal sized,
    // equally spaced items.

    UniformItemScrolledDocument: o(
        {
            "class": o("UniformItemScrolledDocumentExt", "ScrolledDocument")
        }
    ),

    // This class implements a scrolled document where the items are not
    // necessarily of the same size (item size or spacing between them).
    
    NonUniformItemScrolledDocument: o(
        {
            "class": o("NonUniformItemScrolledDocumentExt", "ScrolledDocument")
        }
    ),

    // This class implements a scrolled document where the items are not
    // necessarily of the same size and scrolling is based on the index
    // of the items (ignoring their sizes).
    
    IndexedItemScrolledDocument: o(
        {
            "class": o("IndexedItemScrolledDocumentExt", "ScrolledDocument")
        }
    ),
    
    //
    // classes for packaging a scrolled document with controllers
    //
    
    // this is a class extension which extends the scrollable document
    // so that its scrolling can be controlled from outside. This
    // should be inherited together with the appropriate document
    // scrolling class (this is not inherited here).  This class
    // should be inherited with higher priority than the document
    // scrolling class.
    
    ScrollableDocumentWithControllerExt: o(
        {
            context: {
                // the embedding area is assumed (by default) to know whether
                // the controller is being moved (to change the scroll)
                scrollControllerBeingMoved: [{ scrollControllerBeingMoved: _ },
                                             [myContext, "ScrolledDocument"]],
            }
        },
        
        {
            qualifier: { scrollControllerBeingMoved: true },
            context: {
                // allow the scrolled document to move
                beingMoved: true,
                // used only in some scrolled document classes (indexed
                // scrolling).
                setFirstInViewPartInvisible: true
            }
        }
    ),

        
    // The following class provides an area to embed the scrolled document in.
    // This is not required, but often convenient. This class lifts the
    // properties of the scrolled document to the view so they more easily
    // accessible.
    // The actual scrolled document class is not defined here. This should
    // be merged with this class in a derived class.

    ScrollView: o(
        {
            context: {
                scrolledDocument: [{ children: { scrolledDocument: _ }},[me]],
            },
            children: {
                scrolledDocument: {
                    description: {
                        position: {
                            // default positioning, fill the whole view
                            frame: 0
                        }
                    }
                }
            }
        }
    ),
    
    // The following classes allow packaging a scrollable document together
    // with one or more controllers which scroll it (in addition the optional
    // scrollability of the document by dragging or wheel/mousepad).

    ScrollableWithControllerExt: o(
        {
            "class": o("ScrolledDocumentContext"),
            
            context: {
                // the following parameters are provided as part of the
                // ScrolledDocumentContext parameters

                // by default, vertical scrolling
                scrollStartEdge: "top",
                // this is the initial position of scrolling. Default is 0,
                // but this can be changed in the derived class.
                initialScrollOffset: 0,
                
                // access to the scrolled document
                scrolledDocument: [{ scrolledDocument: _ },
                                   [{ children: { scrollView: _ }},[me]]],
                // define the list of controllers (areas) in the derived class
                // scrollControllers: ?,
                
                // By default the content of this area is defined as
                // the data to be scrolled, but this can be modified by
                // a derived class.
                // scrolledData: ?,
                
                // place for items in the scrollable document to store their
                // persisted context information.
                "^itemContext": o(),
                
                scrollControllerBeingMoved: [{ beingMoved: _ },
                                             [{ scrollControllers: _ }, [me]]]
            },
            children: {
                scrollView: {
                    description: {
                        // add to this any specific class to define the
                        // scroll frame (and with it possibly the specific
                        // scrolled document class).
                        "class": "ScrollView",
                        children: { scrolledDocument: { description: {
                            "class": o("ScrollableDocumentWithControllerExt"/*,
                                       "ScrolledDocument"*/)
                        }}}
                    }
                }
            }
        }
    ),

    // specific types of scrollables with controllers

    // uniform sized items (size and spacing must be defined)
    UniformScrollableWithController: o(
        {
            "class": "ScrollableWithControllerExt",

            context: {
                // define these in the derived class
                // itemSize:
                // itemSpacing:
            },

            // modify the scrolled document to be of the appropriate class
            // and initialize it with the proper values

            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        "class": o("UniformItemScrolledDocumentExt",
                                   "ScrolledDocument")
                    }}}
                }}
            }
        }
    ),

    // non-uniform sized items (minimal size and spacing must be defined)
    NonUniformScrollableWithController: o(
        {
            "class": "ScrollableWithControllerExt",

            context: {
                // define these in the derived class
                // minItemSize:
                // minItemSpacing:
            },

            // modify the scrolled document to be of the appropriate class
            // and initialize it with the proper values
            
            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        "class": o("NonUniformItemScrolledDocumentExt",
                                   "ScrolledDocument")
                    }}}
                }}
            }
        }
    ),

    // non-uniform sized items (minimal size and spacing must be defined)
    IndexedScrollableWithController: o(
        {
            "class": "NonUniformScrollableWithController",

            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        "class": o("IndexedItemScrolledDocumentExt")
                    }}}
                }}
            }
        }
    ),

};
