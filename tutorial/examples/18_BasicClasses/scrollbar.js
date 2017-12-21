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

// %%classfile%%: "reference.js"
// %%classfile%%: "draggable.js"
// %%classfile%%: "scrollable.js"

var classes = {

    Scrollbar: o(

        {
            // defines scrollStartEdge and scrollEndEdge (can be modified,
            // is taken from the scrolling context by default)
            "class": "ScrollStartAndEndEdges",
            
            context: {
                // must be defined
                scrolledDocument: [{ scrolledDocument: _ },
                                   [myContext, "ScrolledDocument"]],

                // start edge of the scrolled document
                scrolledDocumentStartEdge: [{ scrollStartEdge: _ },
                                            [{ scrolledDocument: _ }, [me]]],
                
                // true when the cursor is being moved
                beingMoved: [{ beingDragged: _ },
                             [{ children: { cursor: _ }}, [me]]],
                
                // the length of the scrollbar (we use abs for the case
                // this is defined right to left)
                scrollbarLength: [abs, [offset,
                                        { type: [{ scrollStartEdge: _}, [me]] },
                                        { type: [{ scrollEndEdge: _}, [me]] }]],
                documentLength: [{ documentLength: _ },
                                 [{ scrolledDocument: _}, [me]]],
                viewLength: [{ viewLength: _ },
                             [{ scrolledDocument: _}, [me]]],
                
                // point definitions (defaults, may be replaced)

                startFirstItemInDoc: [{ startFirstItemInDoc: _ },
                                      [{ scrolledDocument: _ }, [me]]],

                viewStart: {
                    type: [{ scrollStartEdge: _ },
                           [{ scrolledDocument: _ }, [me]]],
                    element: [{ scrolledDocument: _ }, [me]]
                },

                // Cursor length calculation
                
                // The size of the cursor relative to the scrollbar
                // should be the same as the size of the view relative to
                // the document. However, if this is too small, the
                // actual cursor will be made larger.
                
                cursorLogicalLength: [
                    mul,
                    [{ scrollbarLength: _ }, [me]],
                    [div,
                     [{ viewLength: _ }, [me]], [{ documentLength: _ }, [me]]]],

                // define a minimal length of the cursor (if the cursor's
                // logical length is smaller, it will get this length).
                // This minimal length should not be larger than a given
                // portion of the scrollbar (to allow scrolling)

                // make the cursor no smaller than thi number of pixels
                // (unless this more than a certain fraction of the
                // scroll-bar length, see below).
                cursorAbsMinLength: 20, // modify this as needed
                // don't make the minimal cursor larger than this fraction
                // of the scrollbar (this does not hold for a cursor larger
                // than the minimal length, so this only applies to
                // very short scrollbars).
                minCursorMaxFraction: 0.5, // modify this as needed
                cursorMinLength: [min,
                                  [{ cursorAbsMinLength: _ }, [me]],
                                  [mul,
                                   [{ minCursorMaxFraction: _ }, [me]],
                                   [{ scrollbarLength: _ }, [me]]]],

                // this is the actual length of the cursor to be displayed
                cursorLength: [floor, [max,
                                       [{ cursorMinLength: _ }, [me]],
                                       [{ cursorLogicalLength: _ }, [me]]]],
                
                // the difference between the actual and logical length
                // of the cursor (this has to be compensated for in
                // calculating the position of the cursor relative to
                // the position of the document)

                cursorExtraLength: [max, 0,
                                    [minus, [{ cursorLength: _ }, [me]],
                                     [{ cursorLogicalLength: _ }, [me]]]],
                
                // The extra length of the cursor reduces the logical
                // length of the scrollbar.

                scrollbarLogicalLength: [minus,
                                         [{ scrollbarLength: _ }, [me]],
                                         [{ cursorExtraLength: _ }, [me]]],

                // This is the number actually used to position the
                // cursor inside the scrollbar and the view over the document
                // at the same relative position.
                
                scrollbarToDocRatio: [div,
                                      [{ scrollbarLogicalLength: _ }, [me]],
                                      [{ documentLength: _ }, [me]]],
            },
            
            position: {
                bindCursorAndView: {
                    pair1: {
                        point1: [{ startFirstItemInDoc: _ }, [me]],
                        point2: [{ viewStart: _ }, [me]]
                    },
                    pair2: {
                        // scroll bar start
                        point1: { type: [{ scrollStartEdge: _ },[me]] },
                        // cursor start
                        point2: { type: [{ scrollStartEdge: _ },[me]],
                                  element: [{ children: { cursor: _ }}, [me]] }
                    },
                    ratio: [{ scrollbarToDocRatio: _ }, [me]]
                }
            },
            
            children: {
                cursor: {
                    description: {
                        "class": "Cursor"
                    }
                }
            }
        },

        {
            // document is right to left but scrollbar isn't, so need to
            // reverse the binding direction
            qualifier: { scrolledDocumentStartEdge: o("right", "bottom"),
                         scrollStartEdge: o("left", "top") },
            position: {
                bindCursorAndView: {
                    ratio: [uminus, [{ scrollbarToDocRatio: _ }, [me]]]
                }
            },
        },

        {
            // scrollbar is right to left but document isn't, so need to
            // reverse the binding direction
            qualifier: { scrolledDocumentStartEdge: o("left", "top"),
                         scrollStartEdge: o("right", "bottom") },
            position: {
                bindCursorAndView: {
                    ratio: [uminus, [{ scrollbarToDocRatio: _ }, [me]]]
                }
            },
        }
    ),

    // This scrollbar is positioned not by the position (in pixels) of
    // items inside the document, but by their index in the document. If all
    // items in the list are of the same size, this is the same as the
    // standard position (pixel) based scrolling. However, if items have
    // different sizes, this scrolls the list to the item whose index
    // in the list is proportional to the position of the scroll-bar cursor.
    // This should only be used with the IndexedItemScrolledDocument
    // scrolled document class.
    
    IndexedScrollbar: o(
        {
            // defines scrollStartEdge (can be modified, is "top" by default)
            // and the corresponding scrollEndEdge.
            "class": "ScrollStartAndEndEdges",
            
            context: {

                // must be defined
                scrolledDocument: [{ scrolledDocument: _ },
                                   [myContext, "ScrolledDocument"]],

                
                // true when the cursor is being moved
                beingMoved: [{ beingDragged: _ },
                             [{ children: { cursor: _ }}, [me]]],
                
                // the length of the scrollbar (we use abs for the case
                // this is defined right to left)
                scrollbarLength: [abs, [offset,
                                        { type: [{ scrollStartEdge: _}, [me]] },
                                        { type: [{ scrollEndEdge: _}, [me]] }]],
                // the length of the document is the number of items, as
                // we scroll by item index
                documentLength: [size, [{ scrolledData: _ }, 
                                        [{ scrolledDocument: _}, [me]]]],
                // allocating equal length per item on the scroll-bar,
                // this is the length allocated to each item
                itemLength: [div, [{ scrollbarLength: _ }, [me]],
                             [{ documentLength: _ }, [me]]],
                
                // item index of items covering the start and end of view
                coveringStartViewIndex: [{ coveringStartViewIndex: _ },
                                         [{ scrolledDocument: _}, [me]]],
                coveringEndViewIndex: [{ coveringEndViewIndex: _ },
                                       [{ scrolledDocument: _}, [me]]],
                firstInViewPartInvisible: [{ firstInViewPartInvisible: _ },
                                         [{ scrolledDocument: _}, [me]]],
                lastInViewPartVisible: [{ lastInViewPartVisible: _ },
                                        [{ scrolledDocument: _}, [me]]],

                // offset of beginning of cursor from beginning of scroll-bar
                cursorStartOffset: [
                    mul, [{ itemLength: _ }, [me]],
                    [plus, [{ coveringStartViewIndex: _ }, [me]],
                     [{ firstInViewPartInvisible: _ }, [me]]]],

                cursorEndOffset: [
                    mul, [{ itemLength: _ }, [me]],
                    [plus, [{ coveringEndViewIndex: _ }, [me]],
                     [{ lastInViewPartVisible: _ }, [me]]]],

                cursorLength: [minus,
                               [{ cursorEndOffset: _ }, [me]],
                               [{ cursorStartOffset: _ }, [me]]],
            },
            
            children: {
                cursor: {
                    description: {
                        "class": "Cursor"
                    }
                }
            }
        },

        {
            qualifier: { scrollStartEdge: "right" },

            // the logic of the index scrollbar assumes that the start edge of the
            // cursor in being dragged. In case of a right to left scrollbar, the dragging
            // attachement (defined in the Draggable class used by the cursor)
            // has to be set to the right edge.
            
            children: { cursor: { description: {
                context: {
                    draggedHorizontalEdge: { type: "right" },
                }
            }}}
        },
        
        {
            // when the cursor is not dragged, position it based on the
            // position of the items
            
            qualifier: { beingMoved: false },

            position: {
                cursorStart: {
                    point1: { type: [{ scrollStartEdge: _ }, [me]] },
                    point2: { type: [{ scrollStartEdge: _ }, [me]],
                              element: [{ children: { cursor: _ }}, [me]] },
                    equals: [{ cursorStartOffset: _ }, [me]]
                }
            },
        },

        {
            // right-to-left scrollbar requires reversal of positioning
            
            qualifier: { beingMoved: false, scrollStartEdge: "right" },

            position: {
                cursorStart: {
                    equals: [uminus, [{ cursorStartOffset: _ }, [me]]]
                }
            },
        },
        
        {
            qualifier: { beingMoved: true },

            context: {
                // while being dragged, this is the offset of the cursor
                // from the beginning of the scroll-bar based on its
                // actual positioning rather than on the position of the
                // scrolled document.
                cursorStartOffset: [
                    offset,
                    { type: [{ scrollStartEdge: _ }, [me]] },
                    { type: [{ scrollStartEdge: _ }, [me]],
                      element: [{ children: { cursor: _ }}, [me]] }
                ],

                // relative position of cursor start in scroll-bar
                cursorRelOffset: [div,
                                  [{ cursorStartOffset: _ }, [me]],
                                  [{ scrollbarLength: _ }, [me]]],
                // position of cursor start in terms of (fractional)
                // index in scrolled data.
                cursorIndexOffset: [mul,
                                    [{ documentLength: _ }, [me]], 
                                    [{ cursorRelOffset: _ }, [me]]],
                
                // calculated first in view based on cursor position
                firstInViewIndex: [
                    max, 0, [floor, [{ cursorIndexOffset: _ }, [me]]]],
                // the fractional part of index position of the cursor.
                desiredFirstInViewPartInvisible: [
                    first, o([minus,
                              [{ cursorIndexOffset: _ }, [me]],
                              [{ firstInViewIndex: _ }, [me]]],
                             0)]
            },

            write: {
                cursorStartOffsetChanged: {
                    upon: [changed, [{ cursorStartOffset: _ }, [me]]],
                    true: {
                        setFirstInView: {
                            to: [{ firstInView: _ },
                                 [{scrolledDocument: _ }, [me]]],
                            merge: [{ firstInViewIndex: _ }, [me]]  
                        },
                        setInvisiblePartOfFirstItem: {
                            to: [{ desiredFirstInViewPartInvisible: _ },
                                 [{scrolledDocument: _ }, [me]]],
                            merge: [
                                { desiredFirstInViewPartInvisible: _ }, [me]]
                        }
                    }
                }
            }
        },

        {
            // right-to-left scrollbar requires the reversal of the offset
            // (to keep it positive, as all other calculations assume this)
            
            qualifier: { beingMoved: true, scrollStartEdge: "right" },

            context: {
                cursorStartOffset: [
                    offset,
                    { type: [{ scrollStartEdge: _ }, [me]],
                      element: [{ children: { cursor: _ }}, [me]] },
                    { type: [{ scrollStartEdge: _ }, [me]] }
                ],
            }
        }

    ),
    
    // Base class for the scrollbar cursor, which is embedded in the
    // scrollbar.
    
    Cursor: o(
        {
            "class": "Draggable",
            context: {
                scrollStartEdge: [{ scrollStartEdge: _ }, [embedding]],
                scrollEndEdge: [{ scrollEndEdge: _ }, [embedding]]
            },
            position: {
                cursorLength: {
                    point1: { type: [{ scrollStartEdge: _ }, [me]] },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    equals: [{ cursorLength: _ }, [embedding]]
                }
            }
        },

        {
            // right to left, must reverse positioning constraint
            qualifier: { scrollStartEdge: "right" },
            position: {
                cursorLength: {
                    equals: [uminus, [{ cursorLength: _ }, [embedding]]]
                }
            }
        },

        {
            qualifier: { scrollStartEdge: o("top", "bottom") },
            context: {
                horizontallyDraggable: false
            }
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            context: {
                verticallyDraggable: false
            }
        }
    ),
        
    // The following classes package a scrollable document with a scroll-bar
    
    ScrollableWithScrollbarExt: o(
        {
            "class": "ScrollableWithControllerExt",

            context: {
                scrollControllers: [{ children: { scrollbar: _ }}, [me]],
                // this property determines whether it is possible to drag
                // the list with the mouse (if set to false, only the scollbar
                // allows scrolling with the mouse).
                isDraggable: true, // default, may be changed
            },
            
            children: {
                scrollbar: {
                    description: {
                        // empty description (filled in by derived classes)
                    }
                }
            }
        },

        {
            qualifier: { isDraggable: true },

            children: { scrollView: { description: {
                children: { scrolledDocument: { description: {
                    "class": "DraggableScrolledDocumentExt"
                }}}
            }}}
        }
    ),

    // Specific types of scrolled documents with scrollbars

    UniformScrollableWithScrollbar: o(
        {
            "class": o("ScrollableWithScrollbarExt",
                       "UniformScrollableWithController"),

            children: {
                scrollbar: { description: {
                    "class": "Scrollbar"
                }}
            }
        }
    ),

    NonUniformScrollableWithScrollbar: o(
        {
            "class": o("ScrollableWithScrollbarExt",
                       "NonUniformScrollableWithController"),
            children: {
                scrollbar: { description: {
                    "class": "Scrollbar"
                }}
            }
        }
    ),

    IndexedScrollableWithScrollbar: o(
        {
            "class": o("ScrollableWithScrollbarExt",
                       "IndexedScrollableWithController"),
            
            children: {
                scrollbar: { description: {
                    "class": "IndexedScrollbar"
                }}
            }
        }
    ),
};

