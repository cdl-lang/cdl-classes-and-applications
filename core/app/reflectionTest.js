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
// This test demonstrates a (yellow) area - PointOnRay, which is dragged in accordance with the laws of specular reflection: 
// the angle of incidence equals the angle of reflection.
// The ReflectionController is the 'chamber of mirrors' which contains the reflections. 
// It maintains the current reflection point as its state, as well as the tan() of the current reflection angle.
// Based on these, and the dimensions of the ReflectionController, we calculate the two adjacent reflection points: one clockwise, the other counter-clockwise. these could be thought of
// as the 'previous' and 'next' reflections.
// When the reflected PointOnRay crosses the half-way point between the current reflection point and an adjacent reflection point, that adjacent reflection point is set as the current
// reflection point, and the adjacent reflection points are recalculated.
//
// The definition of distance used herein is based on ManhattanDistanceBetweenTwoPoints, which defines distance (A,b) as abs(Ax,Bx) + abs (Ay,By).
//
// Known limitation:
// The rules defining the attachment of the dragged area (PointOnRay) to the mouse are rather ill-defined.
// Specifically, there is a weak attachment to the mouse on both axes. There is a stronger orGroup - stayCloseToMouse - which requires that the PointOnRay match the mouse's projection
// on the ReflectionMirror on at least one axis. The point where this is ill-defined is when reaching a reflection point: coming into that point, stayCloseToMouse was satisfied on one
// axis. The user may very well intend for stayCloseToMouse to switch the satisfied constraint, but the current constraints don't dictate that.
// Take for example the reflection point being on the top side of the ReflectionController, and the PointOnRay being dragged from the clockwise reflection point (on the right side of the
// frame) towards the current reflection, by moving the mouse upwards along the right side of the frame, around the corner, towards the current reflection point. throughout this gesture,
// stayCloseToMouse could be satisfied by matching the y-axis of the mouse's projection on the ReflectionMirror. if the mouse now starts travelling down, the attachment to the mouse's
// y-axis may remain in effect in stayCloseToMouse, and then the PointOnRay would remain on the ray it was on (from current reflection to clockwise reflection), instead of switching to the
// other ray, as the user may well have intended.
//
// URL-line parameters: 
// 1. initialReflectionAngleTan, which will override the defaultInitialReflectionAngleTan.
// 2. initialXOffset, which will override the defaultInitialXOffset.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var defaultInitialReflectionAngleTan = 1;
var defaultInitialXOffset = 250;

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReflectionFrame: {
        "class": "Border",
        position: {
            "class": "AlignCenterWithEmbedding",
            width: 502,
            height: 502
        },
        children: {
            reflectionController: {
                description: {
                    "class": "TestReflectionController"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReflectionController: {
        "class": o("ReflectionController"),
        context: {
            initialReflectionPoint: {
                x: [arg, "initialXOffset", defaultInitialXOffset],
                y: 0
            },
            initialReflectionAngleTan: [arg, "initialReflectionAngleTan", defaultInitialReflectionAngleTan]
        },
        position: {
            frame: 0
        },
        write: {
            onTestReflectionControllerNextReflection: {
                upon: [
                       { 
                             modifier: "shift",
                             type: "KeyDown", 
                             key: "N" 
                       }, 
                       [message]
                      ],
                true: {
                    setNewCurrentReflectionPoint: {
                        to: [{ currentReflectionPoint:_ }, [me]],
                        merge: [{ children: { cwReflection: { reflectionPoint:_ } } }, [me]]
                    },
                    setNewCurrentReflectionAngleTan: {
                        to: [{ currentReflectionAngleTan:_ }, [me]],
                        merge: [mul, -1, [{ currentReflectionAngleTan:_ }, [me]]]
                    }
                }           
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReflectionPointIndicator: o(
        { // variant-controller
            qualifier: "!",
            context: {
                draggedPointIsOnReflectionPoint: [{ reflection: { draggedPointIsOnMe:_ } }, [me]],
                draggedPointIsOnMyRay: [{ reflection: { draggedPointIsOnMyRay:_ } }, [me]]
            }
        },
        { // default
            "class": o("AboveSiblings"),
            context: {
                myReflectionController: [areaOfClass, "TestReflectionController"]
            },
            position: {
                width: 5,
                height: 5,
                
                anchorHorizontal: {
                    point1: { type: "horizontal-center" },
                    point2: { 
                        element: [{ reflection:_ }, [me]],
                        type: "horizontal-center"
                    },
                    equals: 0
                },
                anchorVertical: {
                    point1: { type: "vertical-center" },
                    point2: { 
                        element: [{ reflection:_ }, [me]],
                        type: "vertical-center"
                    },
                    equals: 0
                }
            },
            display: {
                background: "red"
            }
        },
        { 
            qualifier: { draggedPointIsOnMyRay: true },
            display: {
                background: "yellow"
            }
        },
        {
            qualifier: { draggedPointIsOnMyRay: true,
                         draggedPointIsOnReflectionPoint: true },
            display: {
                background: "blue"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestPointOnRay: {
        "class": "PointOnRay",
        context: {
            myReflectionController: [areaOfClass, "TestReflectionController"],          
            // DraggableWeakMouseAttachment params (others provided in PointOnRay)
            initializeStableDraggable: [{ myReflectionController:_ }, [me]], // initialize only once the reflection controller exists!
            draggableInitialX: [{ myReflectionController: { initialReflectionPoint: { x:_ } } }, [me]],
            draggableInitialY: [{ myReflectionController: { initialReflectionPoint: { y:_ } } }, [me]]
        },
        position: {
            width: 30,
            height: 30
        },
        display: {
            background: "yellow"
        },
        stacking: {
            aboveFrame: {
                higher: [me],
                lower: [{ children: { reflectionFrame:_ } }, [embedding]]
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the frame around which the reflection points bounce. It expects 0 < reflection angle < 90.
    //
    // API:
    // 1. inheriting class should provide the initial values for the state (currentReflectionPoint/currentReflectionAngleTan) by specifying an initial reflection point and tan(angle).
    // 2. inheriting class should position itself wrt the ReflectionFrame. It could be at a fixed offset (if all "rays" are of equal size, or it could be a function of the ray it 
    //    controls (including a mapping of one controller for each ray - would be needed it each ray has its own dimensions).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReflectionController: {
        "class": "GeneralArea",
        context: {
            xOrigin: {
                element: [me],
                type: "left"
            },
            yOrigin: {
                element: [me],
                type: "top"
            },
            positionOnRayTolerance: 1,
            
            // relative to top/left of area.
            "^currentReflectionPoint": [{ initialReflectionPoint:_ }, [me]],
            "^currentReflectionAngleTan": [{ initialReflectionAngleTan:_ }, [me]]
        },
        children: {
            currentReflection: {
                description: {
                    "class": "CurrentReflection"
                }
            },
            cwReflection: {
                description: {
                    "class": "ClockwiseReflection"
                }
            },
            counterCwReflection: {
                description: {
                    "class": "CounterClockwiseReflection"
                }
            }
        },
        position: {
            aPointOnRayBetweenCurrentAndClockwiseReflections: {
                pair1: {
                    point1: {
                        label: "yRayBetweenCurrentAndClockwiseReflections"
                    },
                    point2: {
                        element: [{ children: { currentReflection:_ } }, [me]],
                        type: "top"
                    }
                },
                pair2: {
                    point1: {
                        label: "xRayBetweenCurrentAndClockwiseReflections"
                    },
                    point2: {
                        element: [{ children: { currentReflection:_ } }, [me]],
                        type: "left"                    
                    }
                },
                ratio: [{ currentReflectionAngleTan:_ }, [me]]
            },            
            aPointOnRayBetweenCurrentAndCounterClockwiseReflections: {
                pair1: {
                    point1: {
                        label: "yRayBetweenCurrentAndCounterClockwiseReflections"
                    },
                    point2: {
                        element: [{ children: { currentReflection:_ } }, [me]],
                        type: "top"
                    }
                },
                pair2: {
                    point1: {
                        label: "xRayBetweenCurrentAndCounterClockwiseReflections"
                    },
                    point2: {
                        element: [{ children: { currentReflection:_ } }, [me]],
                        type: "left"
                    }
                },
                ratio: [mul, -1, [{ currentReflectionAngleTan:_ }, [me]]]
            },

            // define the vertical/horizontal 'projection' of the mouse on the reflection controller: these are posPoints equal to the mouse in the respective axis, but limited to the
            // reflection controller's frame.
            mouseVerticalProjectionOnReflectionControllerBelowItsTop: {
                point1: { type: "top" },
                point2: { label: "mouseVerticalProjectionOnReflectionController" },
                min: 0
            },
            mouseVerticalProjectionOnReflectionControllerBelowItsBottom: {
                point1: { label: "mouseVerticalProjectionOnReflectionController" },
                point2: { type: "bottom" },
                min: 0
            },
            mouseVerticalProjectionOnReflectionControllerClosetoMouse: {
                point1: { label: "mouseVerticalProjectionOnReflectionController" },
                point2: { 
                    element: [pointer],
                    type: "top" 
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault
            },
            mouseHorizontalProjectionOnReflectionControllerRightOfItsLeft: {
                point1: { type: "left" },
                point2: { label: "mouseHorizontalProjectionOnReflectionController" },
                min: 0
            },
            mouseHorizontalProjectionOnReflectionControllerLeftOfItsRight: {
                point1: { label: "mouseHorizontalProjectionOnReflectionController" },
                point2: { type: "right" },
                min: 0
            },
            mouseHorizontalProjectionOnReflectionControllerClosetoMouse: {
                point1: { label: "mouseHorizontalProjectionOnReflectionController" },
                point2: { 
                    element: [pointer],
                    type: "left" 
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault
            },
            
            
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myReflectionController
    // 2. reflectionPoint
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CurrentReflection: {
        "class": "Reflection",
        position: {
            xCurrentReflectionPoint: {
                point1: [{ myReflectionController: { xOrigin:_ } }, [me]],
                point2: { type: "horizontal-center" },
                equals: [{ myReflectionController: { currentReflectionPoint: { x:_ } } }, [me]]
            },
            yCurrentReflectionPoint: {
                point1: [{ myReflectionController: { yOrigin:_ } }, [me]],
                point2: { type: "vertical-center" },
                equals: [{ myReflectionController: { currentReflectionPoint: { y:_ } } }, [me]]
            }           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ClockwiseReflection: {
        "class": "AdjacentReflection",
        context: {
            draggedPointIsOnMyRay: [lessThanOrEqual,
                                    [{ draggedPointOnRay: { children:  { pointOffsetFromCurrentToClockwiseRay: { absOffsetBetweenTwoPoints:_ } } } }, [me]],
                                    [{ myReflectionController: { positionOnRayTolerance:_ } }, [me]]
                                   ],
            draggedPointOffsetFromMe: [{ draggedPointOnRay: { children:  { pointOffsetFromClockwiseReflectionPoint: { absOffsetBetweenTwoPoints:_ } } } }, [me]]                                
        },
        position: {
            tanRelation: {
                pair1: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [{ currentReflection:_ }, [me]], 
                        type: "top"
                    }
                },
                pair2: {
                    point1: {
                        type: "left"
                    },
                    point2: {
                        element: [{ currentReflection:_ }, [me]], 
                        type: "left"                    
                    }
                },
                ratio: [{ myReflectionController: { currentReflectionAngleTan:_ } }, [me]]
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CounterClockwiseReflection: {
        "class": "AdjacentReflection",
        context: {
            draggedPointIsOnMyRay: [lessThanOrEqual,
                                    [{ draggedPointOnRay: { children:  { pointOffsetFromCurrentToCounterClockwiseRay: { absOffsetBetweenTwoPoints:_ } } } }, [me]],
                                    [{ myReflectionController: { positionOnRayTolerance:_ } }, [me]]
                                   ],
            draggedPointOffsetFromMe: [{ draggedPointOnRay: { children:  { pointOffsetFromCounterClockwiseReflectionPoint: { absOffsetBetweenTwoPoints:_ } } } }, [me]]                             
        },
        position: {
            tanRelation: {
                pair1: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [{ currentReflection:_ }, [me]], 
                        type: "top"
                    }
                },
                pair2: {
                    point1: {
                        type: "left"                    
                    },
                    point2: {
                        element: [{ currentReflection:_ }, [me]], 
                        type: "left"
                    }
                },
                ratio: [mul, -1, [{ myReflectionController: { currentReflectionAngleTan:_ } }, [me]]]
            }           
        }       
    },      
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AdjacentReflection: {
        "class": "Reflection",
        context: {
            currentReflection: [{ children: { currentReflection:_ } }, [embedding]],
            reflectionPoint: {
                x: [offset,
                    {
                          element: [{ myReflectionController:_ }, [me]],
                          type: "left"
                    },
                    {
                          type: "left"
                    }
                   ],
                y: [offset,
                    {
                          element: [{ myReflectionController:_ }, [me]],
                          type: "top"
                    },
                    {
                          type: "top"
                    }
                   ]                       
            },
            halfOffsetFromCurrentReflection: [div,
                                              [{ children: { offsetFromCurrentReflection: { absOffsetBetweenTwoPoints:_ } } }, [me]],
                                              2
                                             ],
            draggedPointOnRay: [
                                { 
                                    tmd: true,
                                    myReflectionController: [{ myReflectionController:_ }, [me]]
                                },
                                [areaOfClass, "PointOnRay"]
                               ],
            draggedPointIsOnMe: [lessThanOrEqual,
                                 [{ draggedPointOffsetFromMe:_ }, [me]],
                                 [{ myReflectionController: { positionOnRayTolerance:_ } }, [me]]
                                ]
        },
        children: {
            offsetFromCurrentReflection: {
                description: {
                    "class": "ManhattanDistanceFromCenterOfEmbedding",
                    context: {
                        xB: {
                            element: [{ currentReflection:_ }, [embedding]],
                            type: "horizontal-center"
                        },
                        yB: {
                            element: [{ currentReflection:_ }, [embedding]],
                            type: "vertical-center"
                        }
                    }
                }
            }       
        },      
        position: {
            // the likely scenario: different from the current reflection on both axes (would match on only *one* axis if the reflection bounces in parallel to one of the frame's sides).
            // for each axis we define a positive-offset option and a negative-offset option.
            // and this we do for the class inheriting AdjacentReflection wrt currentReflection (see CounterClockwiseReflection to see the requirement that it is positioned elsewhere from
            // the ClockwiseReflection).
            eitherDifferentFromCurrentReflectionHorizontalI: {
                point1: {
                    element: [{ currentReflection:_ }, [me]],
                    type: "left"
                },
                point2: { 
                    type: "left"
                },
                min: 1,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "differentFromCurrentReflectionHorizontal" }
            },
            eitherDifferentFromCurrentReflectionHorizontalII: {
                point1: {
                    element: [{ currentReflection:_ }, [me]],
                    type: "left"
                },
                point2: { 
                    type: "left"
                },
                max: -1,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "differentFromCurrentReflectionHorizontal" }
            },
            eitherDifferentFromCurrentReflectionVerticalI: {
                point1: {
                    element: [{ currentReflection:_ }, [me]],
                    type: "top"
                },
                point2: { 
                    type: "top"
                },
                min: 1,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "differentFromCurrentReflectionVertical" }
            },
            eitherDifferentFromCurrentReflectionVerticalII: {
                point1: {
                    element: [{ currentReflection:_ }, [me]],
                    type: "top"
                },
                point2: { 
                    type: "top"
                },
                max: -1,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "differentFromCurrentReflectionVertical" }
            }
        },
        write: {
            // if the draggedPoint's offset from this adjacent reflection point is less than half the offset between the reflection point and the current reflection,
            // then this adjacent reflection is to become the new current reflection.
            adjacentReflectionSetAsCurrentReflectionPoint: {
                upon: [and,
                       [{ draggedPointIsOnMyRay:_ }, [me]],
                       [lessThan,
                        [{ draggedPointOffsetFromMe:_ }, [me]],
                        [{ halfOffsetFromCurrentReflection:_ }, [me]]
                       ]
                      ],
                true: {
                    setAsCurrentReflection: {
                        to: [{ myReflectionController: { currentReflectionPoint:_ } }, [me]],
                        merge: atomic({
                                            x: [{ reflectionPoint: { x:_ } }, [me]],
                                            y: [{ reflectionPoint: { y:_ } }, [me]]
                                      })
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Reflection: {
        "class": o("GeneralArea", "ConfinedToArea"),
        context: {
            myReflectionController: [embedding],
            confinedToArea: [{ myReflectionController:_ }, [me]]            
        },
        position: { 
            width: 0,
            height: 0,

            // Reflection area must be attached to one of the sides of the ReflectionController
            // important note: these constraints have a priority that is lower than positioningPrioritiesConstants.weakerThanDefault (and stronger than the mouse attachment).
            // if this set of constraints comes with a priority that is as strong as the orGroup which requires the adjacent reflection points not to overlap with the current reflection
            // point, then once one of the adjacent points is attached to one of the mirror sides, it has no incentive to detach itself from there, in order to attempt being 
            // attached to another possible mirror side.
            orAttachToReflectionControllerLeft: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "left"
                },
                point2: { 
                    type: "left"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "reflectionPointsOnMirror" }
            },
            orAttachToReflectionControllerRight: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "right"
                },
                point2: { 
                    type: "right"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "reflectionPointsOnMirror" }
            },
            orAttachToReflectionControllerTop: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "top"
                },
                point2: { 
                    type: "top"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "reflectionPointsOnMirror" }
            },
            orAttachToReflectionControllerBottom: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "bottom"
                },
                point2: { 
                    type: "bottom"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "reflectionPointsOnMirror" }
            }           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myReflectionController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PointOnRay: {
        "class": "DraggableWeakMouseAttachment",
        context: {
            // DraggableWeakMouseAttachment params:
            draggableStable: true,
            absoluteVerticalAnchorPosPointForStability: atomic([{ myReflectionController: { yOrigin:_ } }, [me]]),
            absoluteHorizontalAnchorPosPointForStability: atomic([{ myReflectionController: { xOrigin:_ } }, [me]]),
            draggableVerticalAnchor: atomic({ type: "vertical-center" }),
            draggableHorizontalAnchor: atomic({ type: "horizontal-center" })
        },
        children: {
            pointOffsetFromCurrentToClockwiseRay: {
                description: {
                    "class": "ManhattanDistanceFromCenterOfEmbedding",
                    context: {
                        xB: {
                            element: [{ myReflectionController:_ }, [embedding]],
                            label: "xRayBetweenCurrentAndClockwiseReflections"
                        },
                        yB: {
                            element: [{ myReflectionController:_ }, [embedding]],
                            label: "yRayBetweenCurrentAndClockwiseReflections"
                        }
                    }
                }
            },
            pointOffsetFromCurrentToCounterClockwiseRay: {
                description: {
                    "class": "ManhattanDistanceFromCenterOfEmbedding",
                    context: {
                        xB: {
                            element: [{ myReflectionController:_ }, [embedding]],
                            label: "xRayBetweenCurrentAndCounterClockwiseReflections"
                        },
                        yB: {
                            element: [{ myReflectionController:_ }, [embedding]],
                            label: "yRayBetweenCurrentAndCounterClockwiseReflections"
                        }
                    }
                }
            },
            
            // calculate the abs offset of the PointOnRay from the two reflection points: clockwise reflection point, and counter-clockwise reflection point.
            pointOffsetFromClockwiseReflectionPoint: {
                description: {
                    "class": "ManhattanDistanceFromCenterOfEmbedding",
                    context: {  
                        xB: {
                            element: [{ myReflectionController: { children: { cwReflection:_ } } }, [embedding]],
                            type: "horizontal-center"
                        },
                        yB: {
                            element: [{ myReflectionController: { children: { cwReflection:_ } } }, [embedding]],
                            type: "vertical-center"
                        }
                    }
                }
            },
            pointOffsetFromCounterClockwiseReflectionPoint: {
                description: {
                    "class": "ManhattanDistanceFromCenterOfEmbedding",
                    context: {  
                        xB: {
                            element: [{ myReflectionController: { children: { counterCwReflection:_ } } }, [embedding]],
                            type: "horizontal-center"
                        },
                        yB: {
                            element: [{ myReflectionController: { children: { counterCwReflection:_ } } }, [embedding]],
                            type: "vertical-center"
                        }
                    }
                }
            }           
        },
        position: {
            limitOnReflectionControllerLeft: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "left"
                },
                point2: { type: "horizontal-center" },
                min: 0
            },
            limitOnReflectionControllerRight: {
                point1: { type: "horizontal-center" },
                point2: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "right"
                },
                min: 0
            },
            limitOnReflectionControllerTop: {
                point1: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "top"
                },
                point2: { type: "vertical-center" },
                min: 0
            },
            limitOnReflectionControllerBottom: {
                point1: { type: "vertical-center" },
                point2: {
                    element: [{ myReflectionController:_ }, [me]],
                    type: "bottom"
                },
                min: 0
            },
            
            // orGroup that requires the PointOnRay to stay on one of the rays.
            // this orGroup is a lower priority than the orGroup that equates the PointOnRay to the mouse on at least one axis (see below)
            // (which in turn is weaker than the limitation of its position to be inside the ReflectionController)
            eitherOnCurrentToClockwiseRay: {
                point1: { 
                    element: [{ children: { pointOffsetFromCurrentToClockwiseRay:_ } }, [me]],
                    label: "beginning" 
                },
                point2: { 
                    element: [{ children: { pointOffsetFromCurrentToClockwiseRay:_ } }, [me]],
                    label: "end" 
                },
                min: 0,
                max: [{ myReflectionController: { positionOnRayTolerance:_ } }, [me]],
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "pointOnOneOfRays" }
            },
            orOnCurrentToCounterClockwiseRay: {
                point1: { 
                    element: [{ children: { pointOffsetFromCurrentToCounterClockwiseRay:_ } }, [me]],
                    label: "beginning" 
                },
                point2: { 
                    element: [{ children: { pointOffsetFromCurrentToCounterClockwiseRay:_ } }, [me]],
                    label: "end" 
                },
                min: 0,
                max: [{ myReflectionController: { positionOnRayTolerance:_ } }, [me]],
                priority: positioningPrioritiesConstants.strongerThanDefaultPressure,
                orGroups: { label: "pointOnOneOfRays" }
            },

            // remember: the "beginning" to "end" of pointOffsetFromCurrentToClockwiseRay/pointOffsetFromCurrentToCounterClockwiseRay is the abs offset from a generic point on either
            // ray to the PointOnRay being dragged.
            // keep the two pairs of labels describing these generic points on the two rays, as close as possible to the dragged point on ray.
            // this is important for the pair of labels on the ray the PointOnRay is NOT on at the moment, to make sure they stay close to the PointOnRay can switch to it at a 
            // reflection point! this constraint should be weaker than the mouseAttachment, so it doesn't get in its way.
            andKeepThemAsCloseAsPossibleToPointOnRayI: {
                point1: { 
                    element: [{ children: { pointOffsetFromCurrentToClockwiseRay:_ } }, [me]],
                    label: "beginning" 
                },
                point2: { 
                    element: [{ children: { pointOffsetFromCurrentToClockwiseRay:_ } }, [me]],
                    label: "end" 
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanMouseAttachment
            },
            andKeepThemAsCloseAsPossibleToPointOnRayII: {
                point1: { 
                    element: [{ children: { pointOffsetFromCurrentToCounterClockwiseRay:_ } }, [me]],
                    label: "beginning" 
                },
                point2: { 
                    element: [{ children: { pointOffsetFromCurrentToCounterClockwiseRay:_ } }, [me]],
                    label: "end" 
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanMouseAttachment
            },
            
            // the orGroup that equates the PointOnRay to the mouse on at least one axis.
            // note the constraint is not on the distance from the mouse top/left but on the 'projection' of the mouse position to the ReflectionController.
            // these aux posPoints are needed, otherwise when dragging the PointOnRay and the mouse goes beyond the ReflectionController on both axes, the PointOnRay hops off the
            // ray that it's on and to corner of the ReflectionController that's closest to the mouse.          
            eitherMatchMouseOnYAxis: {
                point1: { 
                    type: "vertical-center"
                },
                point2: {
                    element: [{ myReflectionController:_ }, [me]],
                    label: "mouseVerticalProjectionOnReflectionController"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "stayCloseToMouse" }
            },
            eitherMatchMouseOnXAxis: {
                point1: { 
                    type: "horizontal-center"
                },
                point2: {
                    element: [{ myReflectionController:_ }, [me]],
                    label: "mouseHorizontalProjectionOnReflectionController"
                },
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "stayCloseToMouse" }
            }
        }
    }
};

var screenArea = { 
    "class": o("ScreenArea", "App"),
    children: {
        annotation: {
            description: {
                "class": "TestAnnotation",
                context: {
                   displayText: "Specular Reflection Test: the yellow area can be dragged, abiding by the laws of specular reflection: the angle of incidence equals the angle of reflection.\nURL parameters:\n1. initialReflectionAngleTan: to set the initial reflection angle.\n2. initialXOffset: to set the initial offset on the top side of the frame."
                },
                position: {
                    height: 100
                }
            }
        },
        reflectionFrame: {
            description: {
                "class": o("TestReflectionFrame", "TextAlignCenter", "DefaultDisplayText"),
                context: {
                    displayText: [concatStr, 
                                  o(
                                    "Offset from Clockwise Ray: ", 
                                    [{ children:  { pointOffsetFromCurrentToClockwiseRay: { absOffsetBetweenTwoPoints:_ } } }, [areaOfClass, "PointOnRay"]],
                                    "\nOffset from CounterClockwise Ray: ",
                                    [{ children:  { pointOffsetFromCurrentToCounterClockwiseRay: { absOffsetBetweenTwoPoints:_ } } }, [areaOfClass, "PointOnRay"]],
                                    "\nDragged point offset from adjacent reflection points: ",
                                    [{ draggedPointOffsetFromMe:_ }, [areaOfClass, "AdjacentReflection"]]
                                   )
                                 ]
                }
            }
        },
        pointOnRay: {
            description: {
                "class": "TestPointOnRay"
            }
        },
        currentReflectionPointIndicator: {
            description: {
                "class": "TestReflectionPointIndicator",
                context: {
                    reflection: [{ children: { reflectionFrame: { children: { reflectionController: { children: { currentReflection:_ } } } } } }, [embedding]]
                }
            }
        },
        cwReflectionPointIndicator: {
            description: {
                "class": "TestReflectionPointIndicator",
                context: {
                    reflection: [{ children: { reflectionFrame: { children: { reflectionController: { children: { cwReflection:_ } } } } } }, [embedding]]
                }
            }
        },
        counterCwReflectionPointIndicator: {
            description: {
                "class": "TestReflectionPointIndicator",
                context: {
                    reflection: [{ children: { reflectionFrame: { children: { reflectionController: { children: { counterCwReflection:_ } } } } } }, [embedding]]
                }
            }
        }
    }
};
