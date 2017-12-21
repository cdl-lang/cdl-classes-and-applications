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

/*  These classes implement a menu that is shown inside a given area.

    The items are shown in a list, one per area, and are drawn from a flat os
    where each item has the structure
    - value: the value through which the menu communicates with
      the rest of the application; must be unique
    - text: string shown on screen
    - parents: values of the items that hierachically dominate
      the item.
    In the list, items should immediately follow their direct parent, and
    may not be interrupted by higher items.

    An item is shown depending on whether it is open, picked, or matches the
    text filter.
*/

// %%classfile%%: "../18_BasicClasses/scrollable.js"
// %%classfile%%: "../18_BasicClasses/scrollToAnchor.js"
// %%classfile%%: "../18_BasicClasses/scrollbar.js"

var classes = {

    /// Single item, element of a (scrollable) list, representing one item.
    /// It can be a leaf or not.
    /// Displaying the item, selecting and deselecting, opening and closing must
    /// be done by a class added to HierarchicalMenu.children.scrollView.
    /// description.children.scrolledDocument.description.children.itemsInView.
    /// description.
    /// The context defined here is purely for the convenience of that class.
    HierarchicalMenuItem: {
        context: {
            /// The item's text as it should be shown to the user
            text: [{content: {text: _}}, [me]],
            /// The value that item represents
            value: [{content: {value: _}}, [me]],
            /// List of the parents of the item (expressed in their values)
            parents: [{content: {parents: _}}, [me]],
            /// When value appears somewhere in an item's parent list, it has
            /// children. This can be used to change the visual appearance of
            /// an item.
            hasChildren: [
                [{value: _}, [me]],
                [{items: {parents: _}}, [myParams, "HierarchicalMenu"]]
            ],
            /// The embedding level of an item is the size of its parent list
            level: [size, [{parents: _}, [me]]],
            /// An item is open if its value appears in the menu's openItems list
            open: [[{value: _}, [me]], [{openItems: _}, [myParams, "HierarchicalMenu"]]],
            /// An item is picked if its value appears in the menu's
            /// pickedItems list
            picked: [[{value: _}, [me]], [{pickedItems: _}, [myParams, "HierarchicalMenu"]]],
            /// True when the scrollbar is being moved or the list is being
            /// dragged. Use it to disable transitions.
            documentBeingMoved: [or,
                [{documentBeingMoved: _}, [myParams, "HierarchicalMenu"]],
                [{scrollControllerBeingMoved: _}, [me]]
            ],
        },
        position: {
            left: 0,
            right: 0
        }
    },

    MyHierarchicalMenuParams: {
        context: {
            /// OS of AVs containing { value: , text: , parents: o(...) }
            items: mustBeDefined,

            /// Items matching the text filter
            matchingItems: [
                [cond, [{textFilter: _}, [me]], o(
                    { on: true, use: {text: [{textFilter: _}, [me]]} },
                    { on: false, use: true }
                )],
                [{items: _}, [me]]
            ],
            /// The values of the items matching the text filter
            matchingItemValues: [
                {value: _},
                [{matchingItems: _}, [me]]
            ],
            /// Items that may or may not match, but should be visible anyway,
            /// namely those picked and those opened.
            additionallyVisibleItemValues: o(
                [{pickedItems: _}, [me]],
                [{openItems: _}, [me]]
            ),
            /// All items that should be visible
            allVisibleItemValues: o(
                [{matchingItemValues: _}, [me]],
                [{additionallyVisibleItemValues: _}, [me]]
            ),
            /// The parents of the items that should be visible (as a list of
            /// values)
            allVisibleItemParentValues: [
                _,
                [
                    {parents: _},
                    [
                        {value: [{allVisibleItemValues: _}, [me]]},
                        [{items: _}, [me]]
                    ]
                ]
            ],
            /// The combined list of visible items and all their parents
            visibleItemsIncludingParents: [
                {
                    value: o(
                        [{allVisibleItemValues: _}, [me]],
                        [{allVisibleItemParentValues: _}, [me]]
                    )
                },
                [{items: _}, [me]]
            ],
            /// Is this still correct? TODO
            visibleItems: [filter,
                [defun, "item",
                    [
                        equal,
                        [size, [{parents: _}, "item"]],
                        [size, [[{parents: _}, "item"], [{openItems: _}, [me]]]]
                    ]
                ],
                [{visibleItemsIncludingParents: _}, [me]]
            ],
            /// True when the document is moved (transitions should be off)
            documentBeingMoved: [{children: {scrollView: {children: {scrolledDocument: {beingDragged: _}}}}}, [me]],

            "*openItems": o(),

            "*pickedItems": o(),

            areaSize: [offset, {type: "top"}, {type: "bottom"}],

            documentSize: [minus,
                [mul,
                    [size, [{visibleItems: _}, [me]]],
                    [plus, [{itemSize: _}, [me]], [{itemSpacing: _}, [me]]]
                ],
                [{itemSpacing: _}, [me]]
            ],

            /// True when the menu doesn't fit inside the area
            documentLargerThanArea: [greaterThan, [{documentSize: _}, [me]], [{areaSize: _}, [me]]],

            /// Default size of an item
            itemSize: 16
        }
    },

    /// Class that renders a hierarchical or flat menu in a list in the area
    /// where it's inherited.
    /// Interface:
    /// context
    ///    items: an os of AVs of the structure { value: "...", text: "...",
    ///           parents: o(...) }; must be defined.
    ///    textFilter: an optional substring query, applied to the items' text
    ///    openItems: list of the values of the open items
    ///    pickedItems: list of the values of the picked items; being on this
    ///                 list only means that the item will stay visible during
    ///                 filtering, although you can use it to store selected
    ///                 items as well.
    /// To use it, inherit HierarchicalMenu in an area, define items and
    /// textFilter, and add a class to itemsInview. That class is responsible
    /// for renderint the item, adding/removing it to/from the openItems and
    /// pickedItems list, as well as its own selection mechanism.
    HierarchicalMenu: {
        "class": o("MyHierarchicalMenuParams",
                   "HMUniformScrollableWithScrollbar"),

        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "HierarchicalMenuItem"
                }
            }
        }
    },

    // Classes to interface with the scrollable classes

    HMUniformScrollableWithScrollbar: {
        "class": o("HMScrollableWithScrollbar", "UniformScrollableWithScrollbar"),

        context: {
            itemSpacing: 0
        },

        "children.scrollView.description": {
            children: {
                "scrolledDocument.description": {
                    "children.itemsInView.description": {
                        "class": "UniformScrollToAnchorExt"
                    }
                }
            }
        }
    },

    HMScrollableWithScrollbar: o({
        context: {
            /// The data as used by the scroll list
            scrolledData: [
                identify,
                {value: _},
                [{visibleItems: _}, [me]]
            ],
            "^itemContext":  o(),
            scrollStartEdge: "top",
            scrollbarStartEdge: "top"
        },

        children: {
            "scrollView.description": {
                "class": "HMScrollView"
            },
            "scrollbar.description": {
                "class": "HMScrollbar",
                position: {
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: 0
                }
            }
        }
    }, {
        // Scrollbar only has visible width when document larger than area
        qualifier: {documentLargerThanArea: true},
        "children.scrollbar.description": {
            position: {
                width: 8
            }
        }
    }),

    HMScrollView: {
        "children.scrolledDocument.description": {
            "class": "DraggableScrolledDocumentExt"
        },
        position: {
            frame: 0
        }
    },

    HMScrollbar: {
        "class": "HMScrollbarLayoutExt",
        
        context: {
            scrollStartEdge: [{ scrollbarStartEdge: _ }, [embedding]]
        },
        display: {
            background: "white"
        },
        "children.cursor.description": {
            "display.background": "#a0b0b0"
        }
    },

    HMScrollbarLayoutExt: o({

        context: {
            scrollbarGirth: 8
        },
        display: {
            borderRadius: 4,
            background: "white",
            borderStyle: "solid",
            borderColor: "grey",
            borderWidth: 1
        }

    }, {
        qualifier: { scrollStartEdge: o("top", "bottom") },
        
        position: {
            width: [{ scrollbarGirth: _ }, [me]]
        },
        children: {
            cursor: { description: {
                position: {
                    left: 0,
                    right: 0
                }}}
        }
    }, {
        qualifier: { scrollStartEdge: o("left", "right") },
        
        position: {
            height: [{ scrollbarGirth: _ }, [me]]
        },
        "children.cursor.description": {
            position: {
                top: 0,
                bottom: 0
            }
        }
    })
};
