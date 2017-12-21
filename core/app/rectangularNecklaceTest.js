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
// A test to demonstrate the dragging of beads around a necklace. the beads maintain a constant manhattan-distance between them.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var defaultNumTestBeads = 4;

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestNecklaceController: {
        "class": o("NecklaceController", "Border"),
        context: {
            necklaceBeads: [{ children: { beads:_ } }, [me]]
        },
        position: {
            left: 300,
            right: 300,
            bottom: 200,
            attachToAnnotation: {
                point1: {
                    element: [{ children: { annotation:_ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        },
        children: {
            beads: {
                data: [sequence, r(1, [arg, "nBeads", defaultNumTestBeads])],
                description: {
                    "class": "TestNecklaceBead"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestNecklaceBead: {
        "class": o("NecklaceBead", "TextAlignCenter", "DefaultDisplayText"),
        context: {
            displayText: [{ param: { areaSetContent:_ } } , [me]]
        },
        position: {
            width: [{ myApp: { beadDimension:_ } }, [me]],
            height: [{ myApp: { beadDimension:_ } }, [me]]
        },
        display: {
            background: "yellow"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NecklaceBead: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstNecklaceBead: [equal,
                                    [me],
                                    [first, [{ myNecklaceController: { necklaceBeads:_ } }, [me]]]
                                   ]
            }
        },
        { // default
            "class": o("GeneralArea", "DraggableWeakMouseAttachment", "ConfinedToArea", "ExcludedFromAreas"),
            context: {
                myNecklaceController: [
                                       { necklaceBeads: [me] },
                                       [areaOfClass, "NecklaceController"]
                                      ],                
                // ConfinedToArea param:
                confinedToArea: [{ myNecklaceController:_ }, [me]],            
                // ExcludedFromAreas param:
                excludedFromAreas: [{ myNecklaceController: { children: { innerNecklace:_ } } }, [me]]
            },
            position: {
                stableBeadX: {
                    point1: { 
                        element: [{ myNecklaceController:_ }, [me]],
                        type: "left"
                    },
                    point2: { 
                        type: "left"
                    },
                    priority: positioningPrioritiesConstants.weakerThanMouseAttachment,
                    stability: true
                },
                stableBeadY: {
                    point1: { 
                        element: [{ myNecklaceController:_ }, [me]],
                        type: "top"
                    },
                    point2: { 
                        type: "top"
                    },
                    priority: positioningPrioritiesConstants.weakerThanMouseAttachment,
                    stability: true
                }
            }
        },
        {
            qualifier: { firstNecklaceBead: true },
            context: {
                // DraggableWeakMouseAttachment params:
                // we override the definition of dragged in Draggable: the positioning state of the entire necklace is determined by the position of the first bead.
                // so if any of the beads take a mouseDown, the first bead goes into dragged mode (in which it releases its positioning constraint, and records its position on mouseUp).
                // (there is the matter of this currently being under-specified with respect to the other beads being arranged on one side of the first bead or on its other side, and
                // this does introduce bugs, as a bead which finds itself on the wrong side, cannot cross over to the other side - bug already reported).
                dragged: [{ myNecklaceController: { necklaceBeads: { tmd:_ } } }, [me]],                   
                draggableStable: true,
                absoluteVerticalAnchorPosPointForStability: atomic({
                                                                    element: [{ myNecklaceController:_ }, [me]],
                                                                    type: "top"
                                                                   }),
                absoluteHorizontalAnchorPosPointForStability: atomic({
                                                                      element: [{ myNecklaceController:_ }, [me]],
                                                                      type: "left"
                                                                     }),
                draggableInitialY: 0,
                draggableInitialX: 250,
                draggableHorizontalAnchor:atomic({ type: "horizontal-center" }),
                draggableVerticalAnchor: atomic({ type: "vertical-center" }),
            }
        },
        {
            qualifier: { firstNecklaceBead: false },
            context: {
                prevNecklaceBead: [prev,
                                   [{ myNecklaceController: { necklaceBeads:_ } }, [me]],
                                   [me]
                                  ],
                prevPrevNecklaceBead: [prev,
                                       [{ myNecklaceController: { necklaceBeads:_ } }, [me]],
                                       [{ prevNecklaceBead:_ }, [me]]
                                      ],
                distanceFromPrev: [plus,
                                   [{ myApp: { beadDimension:_ } }, [me]],
                                   [{ myApp: { beadSpacing:_ } }, [me]]
                                  ]
            },
            children: {
                manhattanDistanceFromPrevNecklaceBead: {
                    description: {
                        "class": "ManhattanDistanceFromCenterOfEmbedding",
                        context: {
                            xB: {
                                element: [{ prevNecklaceBead:_ }, [embedding]],
                                type: "horizontal-center"
                            },
                            yB: {
                                element: [{ prevNecklaceBead:_ }, [embedding]],
                                type: "vertical-center"
                            }
                        },
                        position: {
                            setDistanceFromPrev: {
                                point1: { label: "beginning" },
                                point2: { label: "end" },
                                equals: [{ distanceFromPrev:_ }, [embedding]]
                            }
                        }
                    }
                },
                // ensure that the beads cannot fold back onto other beads: the offset between a bead and its [prev,[prev]] must be > 0
                manhattanDistanceFromPrevPrevNecklaceBead: {
                    description: {
                        "class": "ManhattanDistanceFromCenterOfEmbedding",
                        context: {
                            xB: {
                                element: [{ prevPrevNecklaceBead:_ }, [embedding]],
                                type: "horizontal-center"
                            },
                            yB: {
                                element: [{ prevPrevNecklaceBead:_ }, [embedding]],
                                type: "vertical-center"
                            }
                        },
                        position: {
                            setMinDistanceFromPrevPrev: {
                                point1: { label: "beginning" },
                                point2: { label: "end" },
                                min: [{ myApp: { beadDimension:_ } }, [embedding]]
                            }
                        }
                    }
                }       
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. necklaceBeads: an os of areaRefs inheriting NecklaceBead
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NecklaceController: {
        "class": "GeneralArea",
        children: {
            innerNecklace: {
                description: {
                    "class": "InnerNecklace"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InnerNecklace: {
        "class": "GeneralArea",
        position: {
            frame: [{ myApp: { beadDimension:_ } }, [me]]
        }
    }
};

var screenArea = { 
    "class": o("ScreenArea", "App"),
    context: {
        beadDimension: 50,
        beadSpacing: 10
    },
    children: {
        annotation: {
            description: {
                "class": "TestAnnotation",
                context: {
                   displayText: "Drag the yellow beads around the necklace.\nURL parameter: nBeads, to set the number of beads in the necklace."
                },
                position: {
                    height: 100
                }
            }
        },
        necklace: {
            description: {
                "class": "TestNecklaceController"
            }
        }
    }
};
