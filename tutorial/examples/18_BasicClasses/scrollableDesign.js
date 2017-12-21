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
// %%classfile%%: "scrollbar.js"

// This file provides basic design classes for scrollable lists. By choosing
// one of these design classes, some design choices (e.g. layout, colors)
// are either implemented in the design class itself or made through context
// labels which can be defined in the area inheriting this class.

//
// Vertical scrollable list
//
// Class: VerticalScrollableWithScrollbarBasicDesign
//
// This class implements a vertical scrollable list with a scrollbar.
// Various design choices can be made by setting context values
// in on the area of this class. The design choices
// which may be specified in this class are listed below. One can always
// decide not to specify certain choices and then define the relevant
// properties through a new class which overrides the appropriate elements
// in the scrolled list hierarchy.
//
// The basic layout is one where the scrollbar overlaps the edge of the
// scrolled list. This allows a semi-transparent scrollbar to be used
// without having to allocate extra space for the scrollbar. If one does not
// wish the scrollbar to overlap the items, there are two options:
// 1. The items can be positioned so as not to take the full width of the
//    view (so if, for example, the scrollbar is 10 pixels wide, the items
//    will end 10 pixels before the edge of the view).
// 2. The scrollbar can be set with a negative offset from the edge of the
//    view (see 'scrollbarEdgeOffset' below). The scrollbar will remain
//    inside the scrollable list area and the scrollbale view will be pushed
//    to allow the negative offset.
//
// The following layout options are available (the label indicated should
// be placed in the context of the area inheriting this design class):
//
// The scrollbar can be either on the right (default) or left of the scrolled
// list:
//
// scrollbarOnLeft: false(default)|true
//
// Either uniform or non-uniform items can be used in this scrolled list.
// To use uniform items defined the following:
//
// itemSize: <height of each item>,
// itemSpacing: <number of pixels between items>
//
// To use non-uniform items, define the following:
//
// minItemSize: minimal height of an item in the list (should not be much
//      smaller than the actual minimum, as this may affect performance.
// minItemSpacing: minimal spacing between items in the list (may be zero).
//
// To use non-uniform items with scrolling by item index (that is,
// the scrollbar position which brings an item into view depends only
// on the index of the item in the list and not on the sizes of the items)
// set the properties:
//
// minItemSize: as above
// minItemSpacing: as above
// indexedScrolling: true
//
// Can the list be scrolled by dragging?
//     isDraggable: true|false(default)
//
// Layout properties:
//
// Scrollbar:
//     scrollbarWidth: <number>,
//         width of scrollbar
//     scrollbarEdgeOffset: <number>,
//         offset from the edge of the scrolled list the scrollbar is attatched
//         to (if the scrollbar is on the right, offset from right edge,
//         if scrollbar is on the left, offset from left edge). When this
//         offset is positive, the scrollbar is inside the scroll view and
//         the edge of the scroll view is aligned with the edge if the
//         embedding area. If this is negative, thescrollbar extends beyond
//         the scroll view and its edge is aligned with the edge of the
//         container.
//     scrollbarTopMargin: <number>
//         offset of the top of the scrollbar from the top of the container.
//         Default is 0.
//     scrollbarBottomMargin: <number>
//         offset of the bottom of the scrollbar from the bottom of
//         the container. Default is 0.
//     scrollbarColor: <color>,
//         color of scrollbar,
//     scrollbarOpacity: <opacity: [0,1]>
//         opacity of the scrollbar (default: 1)
//     
// Scrollbar Cursor:
//
//     scrollbarCursorColor: <color>,
//         color of the scrollbar cursor; default transparent
//     scrollbarCursorOpacity: <opacity: [0,1]>,
//         opacity of the scrollbar cursor (default: 1)
//     scrollbarCursorBorderRadius: <number>,
//         the radius to be given to the rounded corners of the cursor
//         (default is 0: no rounding).
//     scrollbarCursorLeftMargin: <number>,
//         offset on the left between the cursor and the scrollbar
//         (default is 0).
//     scrollbarCursorRightMargin: <number>,
//         offset on the right between the cursor and the scrollbar
//         (default is 0).
//     
//
// Scrolled Items:
//
//     fonts and colors of the items should be defined in a class which
//     override the scrolled item class (as there are many options here,
//     there is no point in defining them here). This can be given
//     in the $ItemClass argument of this class. The left and right
//     offsets (of the items from the view) are provided here are parameters
//     (as these are often used).
//
//     scrolledItemLeftMargin: <number>
//        offset of the left edge of the item from the left edge of the view.
//     scrolledItemRightMargin: <number>
//        offset of the right edge of the item from the right edge of the view.
//

var classes = {

    VerticalScrollableWithScrollbarBasicDesign: o(

        {
            context: {
                scrollbarWidth: mustBeDefined,
                scrollbarEdgeOffset: mustBeDefined,
            },
            children: {
                scrollView: { description: {
                    "class": "VerticalScrolledViewBasicDesign",
                    children: { scrolledDocument: { description: {
                        children: { itemsInView: { description: {
                            "class": o(//"$ItemClass",
                                       "VerticalScrolledItemBasicDesign")
                                       
                        }}}
                    }}}
                }},
                scrollbar: { description: {
                    "class": "VerticalScrollbarBasicDesign"
                }}
            },
        },
        {
            qualifier: { itemSize: true },
            "class": o("UniformScrollableWithScrollbar"),
        },
        {
            qualifier: { minItemSize: true, indexedScrolling: false },
            "class": o("NonUniformScrollableWithScrollbar")
        },
        {
            qualifier: { minItemSize: true, indexedScrolling: true },
            "class": o("IndexedScrollableWithScrollbar")
        },

        {
            // scrollbar is on the right
            qualifier: { scrollbarOnLeft: false },

            position: {
                offsetBetweenViewAndScrollbar: {
                    point1: { type: "right",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    point2: { type: "right",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    equals: [{ scrollbarEdgeOffset: _ }, [me]] 
                }
            }
        },

        {
            // scrollbar is on the left
            qualifier: { scrollbarOnLeft: true },

            position: {
                offsetBetweenViewAndScrollbar: {
                    point1: { type: "left",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "left",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: [{ scrollbarEdgeOffset: _ }, [me]] 
                }
            }
        }
    ),

    VerticalScrolledViewBasicDesign: o(
        {
            context: {
                scrollbarOnLeft: [{ scrollbarOnLeft: _ }, [embedding]],
                scrollbarEdgeOffset: [{ scrollbarEdgeOffset: _ }, [embedding]],
            },
            position: {
                top: 0,
                bottom: 0
            }
        },

        {
            qualifier: { scrollbarOnLeft: false },

            position: {
                left: 0,
                rightMargin: {
                    point1: { type: "right" },
                    point2: { type: "right", element: [embedding] },
                    // if the scrollbar has a negative edge offset from the
                    // view, need to leave enough space for it
                    equals: [max, 0,
                             [uminus, [{ scrollbarEdgeOffset: _ }, [me]]]]
                }
            }
        },

        {
            qualifier: { scrollbarOnLeft: true },

            position: {
                right: 0,
                leftMargin: {
                    point1: { type: "left", element: [embedding] },
                    point2: { type: "left" },
                    // if the scrollbar has a negative edge offset from the
                    // view, need to leave enough space for it
                    equals: [max, 0,
                             [uminus, [{ scrollbarEdgeOffset: _ }, [me]]]]
                }
            }
        }
    ),

    VerticalScrolledItemBasicDesign: o(
        {
            position: {
                left: [first, o([{ scrolledItemLeftMargin: _ },
                                 [myContext, "ScrolledDocument"]], 0)],
                right: [first, o([{ scrolledItemRightMargin: _ },
                                  [myContext, "ScrolledDocument"]], 0)],

            }
        }
    ),

    //
    // Scrollbar
    //
    
    VerticalScrollbarBasicDesign: o(
        {
            context: {
                documentFitsInView: [
                    { documentFitsInView: _ }, [{ scrolledDocument: _ }, [me]]]
            },
            
            position: {
                width: [{ scrollbarWidth: _ }, [embedding]],
                top: [first, o([{ scrollbarTopMargin: _ }, [embedding]], 0)],
                bottom: [
                    first, o([{ scrollbarBottomMargin: _ }, [embedding]], 0)],
            },

            display: {
                background: [{ scrollbarColor: _ }, [embedding]],
                opacity: [first, o([{ scrollbarOpacity: _ }, [embedding]], 1)]
            },
            
            children: { cursor: { description: {
                "class": "VerticalScrollbarCursorBasicDesign"
            }}}
        },

        {
            // when the document fits into the view, the scrollbar gets
            // zero width, so that it disappears.
            qualifier: { documentFitsInView: true },

            position: {
                width: 0
            }
        }
    ),

    VerticalScrollbarCursorBasicDesign: o(
        {
            display: {
                background: [{ scrollbarCursorColor: _ },
                             [myContext, "ScrolledDocument"]],
                opacity: [first, o([{ scrollbarCursorOpacity: _ },
                                    [myContext, "ScrolledDocument"]], 1)],
                borderRadius: [{ scrollbarCursorBorderRadius: _ },
                               [myContext, "ScrolledDocument"]],
            },
            position: {
                left: [first, o([{ scrollbarCursorLeftMargin: _ },
                                 [myContext, "ScrolledDocument"]], 0)],
                right: [first, o([{ scrollbarCursorRightMargin: _ },
                                  [myContext, "ScrolledDocument"]], 0)],
            }
        }
    )
};
