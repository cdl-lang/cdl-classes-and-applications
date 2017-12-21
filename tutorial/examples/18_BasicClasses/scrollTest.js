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
// %%classfile%%: "scrollToAnchor.js"
// %%classfile%%: "scrollStep.js"
// %%classfile%%: "scrollbar.js"
// %%include%%: "../../../core/func/eventDefs.js"

var classes = {

    //
    // Test layout class
    //
    
    // layout of the scrolled view and the scrollbar
    
    TestScrollableWithScrollbarLayoutExt: o(
        {
            position: {
                frame: 0
            },

            // two children are positioned: the scrollView and the scrollbar
            
            children: {
                scrollView: { description: {
                }},
                scrollbar: {
                    description: {
                    }
                }
            }
        },

        // position scrolled document and scrollbar (depending on whether
        // the scrollbar is vertical or horizontal)

        {
            qualifier: { scrollbarStartEdge: o("top", "bottom") },

            position: {
                alignScrollbarAndDocTop: {
                    point1: { type: "top",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "top",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 0
                },
                alignScrollbarAndDocBottom: {
                    point1: { type: "bottom",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "bottom",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 0
                },
                
                viewTop: {
                    point1: { type: "top" },
                    point2: { type: "top",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    equals: 20
                },

                viewBottom: {
                    point1: { type: "bottom",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "bottom" },
                    equals: 20
                },

                scrollbarLeft: {
                    point1: { type: "left" },
                    point2: { type: "left",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 20
                },

                viewRight: {
                    point1: { type: "right",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "right" },
                    equals: 20
                },

                gapScrollbarView: {
                    point1: { type: "right",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    point2: { type: "left",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    equals: 7
                }
            }
        },

        {
            qualifier: { scrollbarStartEdge: o("left", "right") },

            position: {
                alignScrollbarAndDocLeft: {
                    point1: { type: "left",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "left",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 0
                },
                alignScrollbarAndDocRight: {
                    point1: { type: "right",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "right",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 0
                },
                
                viewLeft: {
                    point1: { type: "left" },
                    point2: { type: "left",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    equals: 20
                },

                viewRight: {
                    point1: { type: "right",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "right" },
                    equals: 20
                },

                scrollbarBottom: {
                    point1: { type: "bottom",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    point2: { type: "bottom" },
                    equals: 20
                },

                viewTop: {
                    point1: { type: "top" },
                    point2: { type: "top",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    equals: 20
                },

                gapScrollbarView: {
                    point1: { type: "bottom",
                              element: [{ children: { scrollView: _ }}, [me]] },
                    point2: { type: "top",
                              element: [{ children: { scrollbar: _ }}, [me]] },
                    equals: 7
                }
            }
        }
    ), 

    // determines the layout (but not colors etc. of the scrollbar) 
    
    TestScrollbarLayoutExt: o(
        {
            context: {
                scrollbarGirth: 20
            }
        },
        {
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
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            
            position: {
                height: [{ scrollbarGirth: _ }, [me]]
            },
            children: {
                cursor: { description: {
                    position: {
                        top: 0,
                        bottom: 0
                    }}}
            }
        }
    ),

    //
    // Components of the test
    //

    // the scrolled view
    
    TestScrollView: o(
        {
            display: {
                borderStyle: "solid",
                borderWidth: 2,
                borderColor: "black"
            },
            children: { scrolledDocument: { description: {
                children: { itemsInView: { description: {
                    "class": "TestScrolledItemExt"
                }}}
            }}}
        }
    ),

    // The base test scrollbar 
    
    TestScrollbar: o(
        {
            "class": "TestScrollbarLayoutExt",
            
            context: {
                scrollStartEdge: [{ scrollbarStartEdge: _ }, [embedding]],
            },
            display: {
                background: "#d0d0d0"
            },
            children: {
                cursor: { description: {
                    display: {
                        background: "#a0b0b0"
                    }}}
            }
        }
    ),

    //
    // Base test scrollable + scrollbar
    //

    TestScrollableWithScrollbar: o(
        {
            "class": o("TestScrollableWithScrollbarLayoutExt",
                       "ScrollToAnchorContext"),

            context: {
                scrolledData: [sequence, r(100,[arg, "max", 1000])],
                "^itemContext":  o(),

                scrollStartEdge: "right",
                scrollbarStartEdge: "right",

                isDraggable: true
            },

            children: {
                scrollView: { description: {
                    "class": "TestScrollView"
                }},
                scrollbar: {
                    description: {
                        "class": "TestScrollbar"
                    }
                }
            }
        }
    ),
    
    //
    // Various test cases (uniform / non-uniform / indexed scrolling
    //

    TestUniformScrollableWithScrollbar: o(
        {
            "class": o("TestScrollableWithScrollbar",
                       "UniformScrollableWithScrollbar"),

            context: {

                itemSize: 30,
                itemSpacing: 5,
            },

            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        "class": "UniformScrollToAnchorExt",
                        children: { itemsInView: { description: {
                        }}}
                    }}}
                }}
            }
        }
    ),

    // sn extension class, has to be combined with the relevant
    // XScrollableWithScrollbar class (see below).
    
    TestNonUniformScrollableWithScrollbarExt: o(        
        {
            "class": o("TestScrollableWithScrollbarLayoutExt"),

            context: {
                minItemSize: 30,
                minItemSpacing: 5, 
            },
            
            children: {
                scrollView: { description: {
                    children: { scrolledDocument: { description: {
                        "class": "NonUniformScrollToAnchorExt",
                        children: { itemsInView: { description: {
                            "class": o("TestNonUniformScrolledItemExt",
                                       "NonUniformAnchoredItemExt")
                                
                        }}}
                    }}}
                }}
            }
        }
    ),

    // non-uniform (layout based) scrolling
    
    TestNonUniformScrollableWithScrollbar: o(        
        {
            "class": o("TestNonUniformScrollableWithScrollbarExt",
                       "TestScrollableWithScrollbar",
                       "NonUniformScrollableWithScrollbar",
                       "TestScrollableWithScrollbarLayoutExt"),
        }
    ),
    
    // indexed scrolling
    
    TestIndexedScrollableWithScrollbar: o(        
        {
            "class": o("TestNonUniformScrollableWithScrollbarExt",
                       "TestScrollableWithScrollbar",
                       "IndexedScrollableWithScrollbar",
                       "TestScrollableWithScrollbarLayoutExt"),
        }
    ),
    
    // Scrolled item classes

    // base item class
    
    TestScrolledItemExt: o(
        {
            display: {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "blue",
                background: "#fafad2",
                text: {
                    value: [{ content: _ }, [me]]
                }
            }
        },
        
        // set position in non-scroll direction

        {
            qualifier: { scrollStartEdge: o("top", "bottom") },
            position: {
                left: 0,
                right: 0
            }
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            position: {
                top: 0,
                bottom: 0
            }
        }
    ),

    // Test Item clas for non-uniform item sizes
    
    TestNonUniformScrolledItemExt: o(
        {
            "class": "TestScrolledItemExt",
            
            context: {
                // defined if a non-default value was set
                definedItemSize: [{ size: _ },
                                  [{ index: [{ itemIndexInDoc: _ }, [me]] },
                                   [{ itemContext: _ }, [embedding]]]],
                itemSize: [first,
                           o([{ definedItemSize: _ }, [me]],
                             [{ minItemSize: _ }, [embedding]])],
            },
            position: {

                // modified below in case of right-to-left positioning
                
                itemLength: {
                    point1: { type: [{ scrollStartEdge: _ }, [me]] },
                    point2: { type: [{ scrollEndEdge: _ }, [me]] },
                    equals: [{ itemSize: _ }, [me]]
                },

                marginFromPrev: {
                    point1: { type: [{ scrollEndEdge: _ }, [me]],
                              element: [prev, [me]] },
                    point2: { type: [{ scrollStartEdge: _ }, [me]] },
                    equals: [{ minItemSpacing: _ }, [embedding]]
                }

            },
            write: {
                clickToChangeSize: {
                    upon: [{ type: "MouseUp",
                             subType: o("Click", "DoubleClick") }, [myMessage]],
                    true: {
                        toggleSize: {
                            to: [{ itemSize: _ }, [me]],
                            merge: 100
                        }
                    }
                }
            }
        },

        // position in direction of scrolling for right-to-left scrolling
        
        {
            qualifier: { scrollStartEdge: "right" },

            position: {
                itemLength: {
                    equals: [uminus, [{ itemSize: _ }, [me]]]
                },

                marginFromPrev: {
                    equals: [uminus, [{ minItemSpacing: _ }, [embedding]]]
                }
            }
        },
        
        // set position in non-scroll direction
        
        {
            qualifier: { scrollStartEdge: o("top", "bottom") },
            position: {
                left: 0,
                right: 0
            }
        },

        {
            qualifier: { scrollStartEdge: o("left", "right") },
            position: {
                top: 0,
                bottom: 0
            }
        },
        
        // toggle size back to default
        
        {
            qualifier: { itemSize: 100 },
            write: {
                clickToChangeSize: {
                    true: {
                        toggleSize: {
                            merge: 30
                        }
                    }
                }
            }
        }
    ),

    TestScrollToAnchorController: o(
        {
            "class": "Clickable",
            position: {
                // set anchor point
                anchorPoint: {
                    point1: { type: [{ scrollStartEdge: _ },
                                     [myContext, "ScrolledDocument"]],
                              element: [{ scrolledDocument: _ },
                                        [myContext, "ScrolledDocument"]] },
                    point2: [{ scrollAnchorPoint: _ },
                             [myContext, "ScrolledDocument"]],
                    equals: 0
                }
            },
            write: {
                scrollToAnchor: {
                    upon: [{ selected: true }, [me]],
                
                    true: {
                        scrollToAnchor: {
                            to: [{ scrollToAnchor: _ },
                                 [myContext, "ScrolledDocument"]],
                            merge: true
                        },
                        deactivateWasMoved: {
                            to: [{ wasMoved: _ },
                                 [myContext, "ScrolledDocument"]],
                            merge: false
                        },
                        setAnchoredItem: {
                            to: [{ anchoredItem: _ },
                                 [myContext, "ScrolledDocument"]],
                            merge: 100
                        },
                        setAnchoredItemOffset: {
                            to: [{ anchoredItemOffset: _ },
                                 [myContext, "ScrolledDocument"]],
                            merge: 0
                        }
                    }
                }
            }
        }
    )
};

var screenArea = {
    children: {
        scrolledWithScrollbar: {
            description: {
                "class": o(/*"TestIndexedScrollableWithScrollbar"*/
                    "TestNonUniformScrollableWithScrollbar"
                    /*"TestUniformScrollableWithScrollbar"*/
                ),
                children: {
                    prevNextController: {
                        description: {
                            "class": o("UniformScrollToPrevItemController",
                                       "UniformScrollToNextItemController"),
                            position: {
                                frame: 0
                            },
                            write: {
                                scrollToPrev: {
                                    upon: [or, leftArrowEvent, upWheelEvent]
                                },
                                scrollToNext: {
                                    upon: [or, leftArrowEvent, downWheelEvent]
                                }
                            }
                        }
                    },
                    scrollToItem100: {
                        description: {
                            "class": "TestScrollToAnchorController",
                            position: {
                                left: 0,
                                top: 0,
                                width: 10,
                                height: 10
                            },
                            display: {
                                background: "green"
                            }
                        }
                    }
                }
            }
        },
    }
};
