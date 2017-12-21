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

// %%classfile%%: "../25_Datathon2/misc.js"


var classes = {

    /// Context for the inheriting area.
    AreaWithPopUpContext: {
        context: {
            /// When true, the popup is shown; the class itself sets it to false
            /// on a click outside the area.
            "*showPopUp": false,
            /// The intersection partner; choose the largest appropriate area
            /// for this; the popup tries not to exceed that area's bounds.
            partnerArea: mustBeDefined
        }
    },

    PopUpContext: {
        context: {
        }
    },

    /// Base class for associating a pop-up with an area. It only defines the
    /// intersection area to appear when showPopUp is true, and closes the
    /// pop-up on a click outside the area, or an esc.
    AreaWithPopUp: o({
        "class": "AreaWithPopUpContext"
    }, {
        qualifier: {showPopUp: true},
        children: {
            popup: {
                partner: [{partnerArea: _}, [me]],
                description: {
                    "class": o("PopUpContext", "BlockEvents"),
                    propagatePointerInArea: "expression",
                    independentContentPosition: false,
                    embedding: "referred",
                    children: {
                        body: {
                            description: {
                                write: {
                                    // This handler blocks propagation of a
                                    // mouse-down to areas below the body to
                                    // avoid that a propagating click inside the
                                    // body closes
                                    // the pop-up.
                                    blockMouseDown: {
                                        upon: [{type: "MouseDown"}, [myMessage]],
                                        true: {
                                            continuePropagation: false
                                        }
                                    }
                                }
                            }
                        }
                    },
                    stacking: {
                        aboveApp: {
                            lower: o([referredOf], [expressionOf]),
                            higher: [me]
                        }
                    },
                    write: {
                        onClose: {
                            upon: [
                                o(
                                    {type: "MouseDown", recipient: n("start", "end", [me], [embeddedStar])},
                                    {type: "KeyDown", key: "Esc", recipient: "global"}
                                ),
                                [message]
                            ],
                            true: {
                                continuePropagation: false,
                                closePopUp: {
                                    to: [{showPopUp: _}, [expressionOf]],
                                    merge: false
                                }
                            }
                        }
                    }
                }
            }
        }
    }),

    /// Context for the inheriting area.
    AreaWithPopUpAlignedToSideContext: {
        context: {
            /// Defines at what edge the popup appears; should be one of "left",
            /// "right", "top" or "bottom".
            popUpOrientation: mustBeDefined,
            /// Distance in pixels between the area's and the popup's edges;
            /// override it if you want it closer or further away.
            offsetToAreaEdge: 0
        }
    },

    /// By inheriting this class, you can show a pop-up menu to the left, right,
    /// top or bottom edge of the area by setting showPopUp to true. The pop-up
    /// is embedded in `partnerArea'.
    ///
    /// The pop-up positions itself on the chosen edge of the area, and tries to
    /// center itself, and make sure the alternate edges (orthogonal to the
    /// chosen edge) extend outside those of the area, but never outside those
    /// of the partner area. That results in a pop-up that is centered when
    /// there is space, and has a reasonable alignment with it if space on one
    /// side is limited.
    ///
    /// The functionality must be implemented in children.popup.description.
    /// children.body.description. The pop-up wraps itself around the body (with
    /// some distance on the "opposite" side for the tip), so the body must
    /// specify relations between top-bottom and left-right, e.g. by setting
    /// width and height.
    ///
    /// Some details:
    /// - oppositeSide is the side opposite the chosen orientation side
    /// - side1 and side2 are the alternate sides
    AreaWithPopUpAlignedToSide: o({
        "class": o(
            "AreaWithPopUpAlignedToSideContext",
            "AreaWithPopUp"
        ),
        context: {
            positionWrtElement: [me],
            tipSize: 5
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: "left"},
        context: {
            oppositeSide: "right"
        },
        "children.popup.description": {
            position: {
                "rightAlignWithBody.equals": [{tipSize: _}, [expressionOf]],
                "keepOppositeEdgeInsideEmbedding.min": 0
            },
            "children.tip.description": {
                position: {
                    right: 0
                }
            }
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: "right"},
        context: {
            oppositeSide: "left"
        },
        "children.popup.description": {
            position: {
                "leftAlignWithBody.equals": [{tipSize: _}, [expressionOf]],
                "keepOppositeEdgeInsideEmbedding.max": 0
            },
            "children.tip.description": {
                position: {
                    left: 0
                }
            }
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: o("left", "right")},
        context: {
            centerLabel: "vertical-center",
            side1: "top",
            side2: "bottom"
        },
        "children.popup.description.children.tip.description": {
            position: {
                top: {
                    point1: { type: [{centerLabel: _}, [embedding]], element: [{positionWrtElement: _}, [embedding]] },
                    point2: { type: [{centerLabel: _}, [embedding]] },
                    equals: 0
                },
                height: [{tipSize: _}, [expressionOf, [embedding]]],
                width: [plus, [{tipSize: _}, [expressionOf, [embedding]]], 1]
            }
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: "bottom"},
        context: {
            oppositeSide: "top"
        },
        "children.popup.description": {
            position: {
                "topAlignWithBody.equals": [{tipSize: _}, [expressionOf]],
                "keepOppositeEdgeInsideEmbedding.max": 0
            },
            "children.tip.description": {
                position: {
                    top: 0
                }
            }
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: "top"},
        context: {
            oppositeSide: "bottom"
        },
        "children.popup.description": {
            position: {
                "bottomAlignWithBody.equals": [{tipSize: _}, [expressionOf]],
                "keepOppositeEdgeInsideEmbedding.min": 0
            },
            "children.tip.description": {
                position: {
                    bottom: 0
                }
            }
        }
    }, {
        qualifier: {showPopUp: true, popUpOrientation: o("bottom", "top")},
        context: {
            centerLabel: "horizontal-center",
            side1: "left",
            side2: "right"
        },
        "children.popup.description.children.tip.description": {
            position: {
                height: [plus, [{tipSize: _}, [expressionOf, [embedding]]], 1],
                width: [{tipSize: _}, [expressionOf, [embedding]]],
                center: {
                    point1: { type: [{centerLabel: _}, [embedding]], element: [{positionWrtElement: _}, [embedding]] },
                    point2: { type: [{centerLabel: _}, [embedding]] },
                    equals: 0
                }
            }
        }
    }, {
        qualifier: {showPopUp: true},
        children: {
            popup: {
                description: {
                    context: {
                        popUpOrientation: [{popUpOrientation: _}, [expressionOf]],
                        centerLabel: [{centerLabel: _}, [expressionOf]],
                        oppositeSide: [{oppositeSide: _}, [expressionOf]],
                        side1: [{side1: _}, [expressionOf]],
                        side2: [{side2: _}, [expressionOf]],
                        offsetToAreaEdge: [{offsetToAreaEdge: _}, [expressionOf]],
                        positionWrtElement: [{positionWrtElement: _}, [expressionOf]]
                    },
                    children: {
                        tip: {
                            description: {
                                display: {
                                    triangle: {
                                        baseSide: [{popUpOrientation: _}, [embedding]],
                                        color: [{lightPrimaryColor: _}, [globalDefaults]]
                                    }
                                }
                            }
                        },
                        body: {
                            // must specify height and width
                        }
                    },
                    position: {
                        placeAtChosenEdge1: {
                            point1: { type: [{popUpOrientation: _}, [me]], element: [{positionWrtElement: _}, [me]] },
                            point2: { type: [{oppositeSide: _}, [me]] },
                            equals: [{offsetToAreaEdge: _}, [me]],
                            priority: -1
                        },
                        placeAtChosenEdge2: {
                            point1: { type: [{oppositeSide: _}, [me]], element: [{positionWrtElement: _}, [me]] },
                            point2: { type: [{popUpOrientation: _}, [me]] },
                            equals: [{offsetToAreaEdge: _}, [me]],
                            priority: -2
                        },
                        extendSide1BeyondExpression: {
                            point1: { type: [{side1: _}, [me]] },
                            point2: { type: [{side1: _}, [me]], element: [{positionWrtElement: _}, [me]] },
                            min: 0,
                            priority: -3
                        },
                        keepSide1InEmbedding: {
                            point1: { type: [{side1: _}, [me]], element: [embedding] },
                            point2: { type: [{side1: _}, [me]] },
                            min: 1
                        },
                        extendSide2BeyondExpression: {
                            point1: { type: [{side2: _}, [me]], element: [{positionWrtElement: _}, [me]] },
                            point2: { type: [{side2: _}, [me]] },
                            min: 0,
                            priority: -3
                        },
                        sideInsideEmbedding: {
                            point1: { type: [{side2: _}, [me]] },
                            point2: { type: [{side2: _}, [me]], element: [embedding] },
                            min: 1
                        },
                        centerIfPossible: {
                            point1: { type: [{centerLabel: _}, [me]] },
                            point2: { type: [{centerLabel: _}, [me]], element: [{positionWrtElement: _}, [me]] },
                            equals: 0,
                            priority: -2
                        },
                        keepOppositeEdgeInsideEmbedding: {
                            point1: { type: [{popUpOrientation: _}, [me]], element: [embedding] },
                            point2: { type: [{popUpOrientation: _}, [me]] }
                        },
                        // The following constraints align the popup with the body,
                        // which results in it adopting width and height of the
                        // body, plus that of the tip.
                        topAlignWithBody: {
                            point1: { type: "top" },
                            point2: { type: "top", element: [{children: {body: _}}, [me]] },
                            equals: 0
                        },
                        leftAlignWithBody: {
                            point1: { type: "left" },
                            point2: { type: "left", element: [{children: {body: _}}, [me]] },
                            equals: 0
                        },
                        rightAlignWithBody: {
                            point1: { type: "right", element: [{children: {body: _}}, [me]] },
                            point2: { type: "right" },
                            equals: 0
                        },
                        bottomAlignWithBody: {
                            point1: { type: "bottom", element: [{children: {body: _}}, [me]] },
                            point2: { type: "bottom" },
                            equals: 0
                        }
                    }
                }
            }
        }
    }),

    /// This class offers functionality similar to AreaWithPopUpAlignedToSide,
    /// but instead it will position itself at the two positioning points
    /// provided in the context, while the body specifies width and height, and
    /// is attached to its pop-up parent on all four edges.
    /// Specify $popUpBodyClass, and optionally $left, $top, $right, $bottom
    AreaWithPopUpInPositioningPoints: o({
        "class": "AreaWithPopUp",
        context: {
            horizontalEdge: mustBeDefined,
            horizontalEdgePoint: mustBeDefined,
            horizontalDistance: 0,
            verticalEdge: mustBeDefined,
            verticalEdgePoint: mustBeDefined,
            verticalDistance: 0
        }
    }, {
        qualifier: {showPopUp: true},
        children: {
            popup: {
                description: {
                    children: {
                        body: {
                            // must specify height and width, but it is bound to
                            // edges specified by the inheriting class through
                            // top/left/bottom/right: 0
                            description: {
                                "class": "$popUpBodyClass",
                                position: {
                                    top: [replaceEmpty, "$top", 0],
                                    left: [replaceEmpty, "$left", 0],
                                    bottom: [replaceEmpty, "$bottom", 0],
                                    right: [replaceEmpty, "$right", 0]
                                }
                            }
                        }
                    },
                    position: {
                        horizontal: {
                            point1: [{horizontalEdgePoint: _}, [expressionOf]],
                            point2: { type: [{horizontalEdge: _}, [expressionOf]]},
                            equals: [{horizontalDistance: _}, [expressionOf]]
                        },
                        vertical: {
                            point1: [{verticalEdgePoint: _}, [expressionOf]],
                            point2: { type: [{verticalEdge: _}, [expressionOf]]},
                            equals: [{verticalDistance: _}, [expressionOf]]
                        }
                    }
                }
            }
        }
    })

};
