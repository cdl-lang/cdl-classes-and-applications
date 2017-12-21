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


// %%classfile%%: "scrollable.js"

//
// Scroll to Anchor
//

// The classes in this file implement an interface for scrolling
// to a given point in the scrolled list (this can be a +/-1 item scroll,
// a page forward/backward scroll or a scroll to some externally specified
// item which is moved to a specified position in the view).
// These classes extend the relevant scrolled document class.
//
// The interface varies a little between the different scroll classes.
// When uniform item scrolling is used, items are of a uniform and known
// size, so the offset of the document relative to the view can be
// calculated directly and positioning can then take place directly based
// on this offset. When non-uniform items are scrolled, the calculation
// is somewhat less direct and the anchored item is first positioned, with
// other items being positioned based on the position of this item.
//
// For all scrolling classes, an anchor point is specified (a single such
// point, which has the label "scrollAnchor" and is defined on the
// scrolled document area). This anchor may be positioned freely along
// to the scroll axis, but in most cases it probably makes sense to keep it
// within the view of the scrolled document. This point description
// is available from the scrolled document (if extended with the
// ScrollToAnchorExt class, defined below) through the following
// context label on the ScrolledDocumentContext:
//
//    scrollAnchorPoint: { label: "scrollAnchor",
//                         element: <scrolled document area> }
//
// In addition, the index of the item to be positioned relative to the
// anchor must be set under the following label in the context of the
// dominating ScrolledDocumentContext area:
//
//    anchoredItem: <index>
//
// The exact relation between the scroll anchor point and the positioning
// of the anchored item is then specified in different ways, depending
// on the class being extended.
//
// The simplest option is to specify the offset (in direction of scrolling)
// from the anchor point to the start edge of the anchored item by setting
// this value on the following context label in "ScrolledDocumentContext":
//
//    anchoredItemOffset: <offset>
//
// This option is the only option available for uniform item scrolled documents.
// For non-uniform item scrolling, the offset may also be specified
// by explicitly setting the relevant constraint between the anchor point
// and the anchored item. These constraints should use the priority defined
// by the following context label on the scrolled document (accessible
// through ScrolledDocumentContext).
//
//    scrollAnchorPriority: <priority>
//
// This priority is decreased once the document is again moved.
//
// When using constraints other than the one defined by 'anchoredItemOffset',
// 'anchoredItemOffset' should be set to o() so as to avoid conflicts
// among the different specifications.
//
// To scroll to the anchor, all the appropriate parameters need to be set,
// the context label 'scrollToAnchor' on the scrolled document needs to
// be set to true and the context label 'wasMoved' on the scrolled document
// must be set to false. These two labels are also made available in
// ScrolledDocumentContext (so it is possible to write to them directly there).

var classes = {
    
    // parameter class for scrolling to anchor. This inherits
    // ScrolledDocumentContext so when used it can be accessed by
    // embedded areas though [myContext, "ScrolledDocument"].
    // It is assumed in some default definitions that
    // [{ scrolledDocument: _ }, [me]] on this area provided access to the
    // scrolled document.
    //
    // By default, this creates writable context labels for the labels required
    // by the scroll interface.
    
    ScrollToAnchorContext: o(
        {
            "class": "ScrolledDocumentContext",
            
            context: {

                // access to labels defined on the scrolled document
                // (if the ScrollToAnchorExt is used ot extend the scrolled
                // document)
                // It is assumed here that the scrolled document area is
                // available here under context label 'scrolledDocument'.

                // set the first of these to true and the second to false
                // to enable scrolling to the anchor
                
                scrollToAnchor: [{ scrollToAnchor: _ },
                                 [{ scrolledDocument: _ }, [me]]],
                wasMoved: [{ wasMoved: _ }, [{ scrolledDocument: _ }, [me]]],
                
                // for the basic definition of scrolling to anchor
                "^anchoredItem": 0,
                "^anchoredItemOffset": o(),

                // definition of scroll anchor point (can be used in
                // constraints positioning it).
                scrollAnchorPoint: [{ scrollAnchorPoint: _ },
                                    [{ scrolledDocument: _ }, [me]]],
                // use this for positioning constraints which attache the
                // anchor to the anchored item. Typically this is done
                // in the anchored item and not from outside.
                scrollAnchorPriority: [{ scrollAnchorPriority: _ },
                                       [{ scrolledDocument: _ }, [me]]],
            }
        }
    ),

    // This class extension should be added to the scrolled document
    // if it should support scrolling to an anchor.
    
    ScrollToAnchorExt: o(
        {
            context: {
                // Indicates that the document should be scrolled based on
                // the anchor. Positioning by anchoring only holds while this
                // is true AND 'wasMoved' is false.
                "^scrollToAnchor": false,

                // definition of scroll anchor point
                scrollAnchorPoint: {
                    label: "scrollAnchor",
                    element: [me]
                },
                
                // priority to assign to anchor constraint. By default,
                // this is low (increased only when 'scrollToAnchor'
                // is true and 'wasMoved' is false (which implies that
                // also 'beingMoved' is false).
                scrollAnchorPriority: dragPriorities.dragPriority,

                // get from dominating parameters
                anchoredItem: [{ anchoredItem: _ },
                               [myContext, "ScrolledDocument"]],
                anchoredItemOffset: [{ anchoredItemOffset: _ },
                                     [myContext, "ScrolledDocument"]],
            },
        },

        {
            qualifier: { scrollStartEdge: o("left", "top") },
            context: {
                // offset of the scroll anchor point from the start of
                // the view (in direction of scrolling)
                scrollAnchorOffset: [offset,
                                     { type: [{ scrollStartEdge: _ }, [me]] },
                                     [{ scrollAnchorPoint: _ }, [me]]]
            }
        },

        {
            qualifier: { scrollStartEdge: o("right", "bottom") },
            context: {
                // offset of the scroll anchor point from the start of
                // the view (reversed, to be in direction of scrolling)
                scrollAnchorOffset: [offset,
                                     [{ scrollAnchorPoint: _ }, [me]],
                                     { type: [{ scrollStartEdge: _ }, [me]] }]
            }
        }
    ),
    
    // Class to extend scrolled document class for scrolling to anchor
    // in case the scrolled document class is for uniform items.
    // Here we use directly the initial scroll offset constraint to
    // perform the scrolling (this is active as long as wasMoved' is false).

    UniformScrollToAnchorExt: o(

        {
            "class": "ScrollToAnchorExt",
            
            context: {
                // offset of start of view from scrolled document start
                anchoredStartViewOffset: [
                    minus,
                    [mul,
                     [{ itemOffset: _ }, [me]],
                     [{ anchoredItem: _ }, [me]]],
                    [plus,
                     [{ scrollAnchorOffset: _ }, [me]],
                     [{ anchoredItemOffset: _ }, [me]]]
                ],
            }
        },

        {
            // one the anchored start view offset is defined, this becomes
            // the initial scroll offset, which is used ot position the
            // document as long as 'wasMoved' is false.
            
            qualifier: { anchoredStartViewOffset: true },
            context: {
                initialScrollOffset: [{ anchoredStartViewOffset: _ }, [me]] 
            }
        }
    ),

    // Class to extend scrolled document class for scrolling to anchor
    // in case the scrolled document class is for non-uniform items.
    // In the non-uniform scrolling case (as opposed to the uniform case)
    // we disable the initial offset constraint and use the scroll
    // anchor priority instead. 
    
    NonUniformScrollToAnchorExt: o(
        {
            "class": "ScrollToAnchorExt",
        },
        
        {
            // anchor based scrolling disables the initial scroll offset
            qualifier: { scrollToAnchor: true },
            context: {
                disableInitialOffset: true
            }
        },

        {
            qualifier: { scrollToAnchor: true, wasMoved: false },
            context: {
                // when scrolling to anchor is set and nothing else is moving
                // or has moved the scroll position, the anchor priority is
                // increased, to position the items by the anchor.
                scrollAnchorPriority: dragPriorities.noDragPriority
            }
        },
        
        // the first and last item to position must be determined
        // based on the offset of the item positioned by the anchor
        // constraint. We assume here that the anchored item covers
        // the positioned of the anchor point (if anchoredItemOffset is
        // not defined) or the position of the anchor point +
        // anchoredItemOffset, if it is defined. In addition, at least
        // enough items to cover the full view are generated both before
        // and after the anchored item. This will only produce incorrect
        // results if the anchored item is positioned outside the scroll view.
        // If this is the case, the derived class should override
        // the definitions below.
        
        {
            qualifier: { scrollToAnchor: true, wasMoved: false,
                         anchoredItem: true },

            context: {

                // offset from beginning of view covered by the anchored item
                offsetCoveredByAnchoredItem: [
                    plus,
                    [{ scrollAnchorOffset: _ }, [me]],
                    [first, o([{ anchoredItemOffset: _ }, [me]], 0)]],

                // maximal number of items require to cover the view

                maxItemsToCoverView: [ceil, [div, [{ viewLength: _ }, [me]],
                                             [{ minItemOffset: _ }, [me]]]],
                
                itemsBeforeAnchoredItem: [
                    max,
                    [{ maxItemsToCoverView: _ }, [me]],
                    [ceil, [div,
                            [plus,
                             [{ offsetCoveredByAnchoredItem: _ }, [me]],
                             [{ viewLength: _ }, [me]]],
                            [{ minItemOffset: _ }, [me]]]]
                ],
                
                // At least enough items to cover a full view before and
                // after the anchored item and (given the assumptions above)
                // at least enough items to cover a full view before the
                // start of the view.
                
                firstToPos: [max,
                             0,
                             [minus, [{ anchoredItem: _ }, [me]],
                              [{ itemsBeforeAnchoredItem: _ }, [me]]]],
                lastToPos: [min,
                            [minus, [size, [{ scrolledData: _ }, [me]]], 1],
                            [plus, [{ anchoredItem: _ }, [me]],
                             [{ maxItemsToCoverView: _ }, [me]]]]
            }
        }
    ),

    // This class should be used to extend items in a scrolled list when
    // the scrolled list is non-uniform and has scroll-to-anchor functionality.
    // This class checks whether this item is now beign positioned by
    // the anchor and if yes, defines the constraint which sets its start
    // at an offset of 'anchoredItemOffset' from the anchor point.
    
    NonUniformAnchoredItemExt: o(

        {
            context: {
                // should this item position itself realtive to the anchor?
                positionByAnchor: [and,
                                   [{ scrollToAnchor:  true }, [embedding]],
                                   [notEmpty,
                                   [[{ itemIndexInDoc: _ }, [me]],
                                    [{ anchoredItem: _ }, [embedding]]]]],
            }
        },

        {
            qualifier: { positionByAnchor: true },

            position: {

                // this constraint is the default positioning by anchor,
                // based on the 'anchoredItemOffset' as defined in the embedding
                // document.
                
                attachToAnchor: {
                    point1: [{ scrollAnchorPoint: _ }, [embedding]],
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    equals: [{ anchoredItemOffset: _ }, [embedding]],
                    priority: [{ scrollAnchorPriority: _ }, [embedding]]
                }
            }
        },

        {
            qualifier: { positionByAnchor: true,
                         scrollStartEdge: o("right","bottom") },

            position: {

                // reverse the direction of the constraint
                attachToAnchor: {
                    equals: [uminus, [{ anchoredItemOffset: _ }, [embedding]]],
                }
            }
        }
    ),
    
    // Scroll to Anchor Controllers

    // These controllers assume that they are embedded under an area which
    // has a ScrollToAnchorContext class and under an area (possibly
    // the same) which has a "ScrolledDocumentContext" class and provides
    // access through its 'scrolledDocument' context label to the scrolled
    // document which has the relevant scroll-to-anchor class.
    // These classes provide write operations to the ScrollToAnchorContext
    // and to the scrolled document which implement the equired scrolling. 

    // xxxxxxxxxxxxxxxxx
};
