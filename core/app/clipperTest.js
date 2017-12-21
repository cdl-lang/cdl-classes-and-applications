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
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestView: {
        "class": o("Border", 
                   "GeneralArea"
                  ),
        context: {
            // SnappableReorderableController params:
            movablesBaseSetUniqueIDs: [{ myApp: { reorderedFacetUniqueIDs:_ } }, [me]], // override default definition provided in MovableASControllerCore
            reordered: [{ myApp: { reorderedFacetUniqueIDs:_ } }, [me]]         
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestHorizontalView: {
        "class": o("TestView", // should appear before the SnappableReorderableController so that its definition of movablesBaseSetUniqueIDs takes precedence!
                   "HorizontalSnappableReorderableController"),
        context: {
            // SnappableReorderableController params:
            // reordered: see TestView
            visReordered: [
                           { minimized: false },
                           [areaOfClass, "TestFacet"]
                          ],               
            reorderingSpacing: 20
        },      
        position: {
            topConstraint: {
                point1: { 
                    element: [areaOfClass, "TestAnnotation"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 10
            },
            height: 100,
            left: 10
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestVerticalView: {
        "class": o("TestView", // should appear before the SnappableReorderableController so that its definition of movablesBaseSetUniqueIDs takes precedence!
                   "VerticalSnappableReorderableController"),
        context: {
            // SnappableReorderableController params:
            // reordered: see TestView 
            visReordered: [
                           { minimized: true },
                           [areaOfClass, "TestFacet"]
                          ],               
            reorderingSpacing: 10
        },      
        position: {
            leftConstraint: {
                point1: { 
                    element: [areaOfClass, "TestHorizontalView"],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 10
            },
            bottom: 100,
            top: 100,
            width: 100,
            right: 10
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestClipper: o(
        {
            "class": "DraggableToReorderClipper",
            context: {
                clipper: [cond,
                          [{ children: { facet: { minimized:_ } } }, [me]],
                          o(
                            { on: true, use: [areaOfClass, "TestVerticalView"] },
                            { on: false, use: [areaOfClass, "TestHorizontalView"] }
                           )
                         ]
            },
            children: {
                facet: {
                    description: {
                        "class": "TestFacet"
                    }
                }
            }
        }
    ),  
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^minimized": false,
                // SnappableReorderable params (see default clause for additional params, as well as variants below)
                iAmDraggedToReorder: [{ children: { handle: { tmd:_ } } }, [me]]
            }
        },
        { // default
            "class": o("Border", "BackgroundColor", "TextAlignCenter", "DefaultDisplayText", "GeneralArea"),
            context: {
                uniqueID: [{ param: { areaSetContent:_ } }, [embedding]],
                displayText: [{ uniqueID:_ }, [me]],
                
                // SnappableReorderable params 
                // see variants below for definition of snappableReorderableController
                // see variant-controller above for definition of iAmDraggedToReorder
                myReorderable: [{ uniqueID:_ }, [me]]
            },
            children: {
                handle: {
                    description: {
                        "class": "ReorderHandle",
                        context: {
                            visReorderable: [embedding]
                        },
                        position: {
                            left: 1,
                            right: 1,
                            top: 1,
                            height: 10
                        },
                        display: {
                            background: "grey"
                        }
                    }
                }
            },          
            write: {
                onTestFacetMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleMinimized: {
                            to: [{ minimized:_ }, [me]],
                            merge: [not, [{ minimized:_ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            "class": o("HorizontalSnappableVisReorderable"),
            display: { background: "yellow" },
            context: {              
                // HorizontalSnappableReorderable params (see default clause above for the remaining params)
                snappableReorderableController: [areaOfClass, "TestHorizontalView"]
            },          
            position: { 
                height: 80,
                width: 200
            }
        },
        {
            qualifier: { minimized: false,
                         iAmDraggedToReorder: false },
            position: {
                top: 10
            }
        },
        {
            qualifier: { minimized: true },
            "class": o("VerticalSnappableVisReorderable"),
            display: { background: "red" },
            context: {              
                // HorizontalSnappableReorderable params (see default clause above for the remaining params)
                snappableReorderableController: [areaOfClass, "TestVerticalView"]
            },          
            position: {
                width: 80,
                height: 50
            }
        },
        {
            qualifier: { minimized: true,
                         iAmDraggedToReorder: false },
            position: {
                left: 10
            }
        },
        {
            qualifier: { iAmDraggedToReorder: true },
            context: {
                myHighHTMLGirthLowerThanViewLowHTML: [greaterThan,
                                                      [offset,
                                                       { 
                                                             type: [{ highHTMLGirth:_ }, [me]] 
                                                       },
                                                       { 
                                                             element: [{ snappableReorderableController: { view:_ } }, [me]], 
                                                             type: [{ lowHTMLGirth:_ }, [me]] 
                                                       }
                                                      ],
                                                      0
                                                     ],
                myLowHTMLGirthHigherThanViewHighHTML: [greaterThan,
                                                       [offset,
                                                        { 
                                                             element: [{ snappableReorderableController: { view:_ } }, [me]], 
                                                             type: [{ highHTMLGirth:_ }, [me]] 
                                                        },
                                                        { 
                                                             type: [{ lowHTMLGirth:_ }, [me]] 
                                                        }
                                                       ],
                                                       0
                                                     ],
                draggedToReorderOutsideOfView: o(
                                                 [{ myHighHTMLGirthLowerThanViewLowHTML:_ }, [me]],
                                                 [{ myLowHTMLGirthHigherThanViewHighHTML:_ }, [me]]
                                                )
            },
            write: {
                onTestFacetDraggedToReorderOutsideOfView: {
                    upon: [{ draggedToReorderOutsideOfView:_ }, [me]],
                    true: {
                        toggleMinimized: {
                            to: [{ minimized:_ }, [me]],
                            merge: [not, [{ minimized:_ }, [me]]]
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the ability to clip areas of an areaSet by different views, depending on their state.\nclick on the numbered areas ('facets') to switch them back and forth between the horizontal and vertical views."
        }
    },    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ClipperTestApp: {
        "class": "TestApp", 
        context: {
            defaultFacetsOrdering: [sequence, r(1,10)],
            "^reorderedFacetUniqueIDs": [{ defaultFacetsOrdering:_ }, [me]]
        },
        children: {
            verticalView: {
                description: {
                    "class": "TestVerticalView"
                }
            },
            horizontalView: {
                description: {
                    "class": "TestHorizontalView"
                }
            },
            facetClippers: {
                data: [{ reorderedFacetUniqueIDs:_ }, [me]],
                description: {
                    "class": "TestClipper"
                }
            },
            debugFullCircle: {
                description: {
                    "class": o("Circle", "Border"),
                    context: {
                        radius: 10,
                        borderWidth: 4
                    },
                    position: {
                        left: 100,
                        bottom: 100
                    },
                    display: {
                        background: "red",
                        borderColor: "blue"
                    }
                }
            }           
        }
    }
};

var screenArea = { 
    "class": o("ScreenArea"),
    children: {
        app: {
            description: {
                "class": "ClipperTestApp"
            }
        }
    }
};
