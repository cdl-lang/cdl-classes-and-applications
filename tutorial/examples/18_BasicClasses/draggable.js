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


// %%classfile%%: "clickable.js"

// A summary of the priorities used

var dragPriorities = {
    // priority of attachement of pointer to dragged element while dragging
    draggingPriority: -15,
    // priorities of offsets to be modified by dragging when no dragging
    // takes place this is the default priority assumed to be used by other
    // constraints which should not change during dragging)
    noDragPriority: -10,
    // priorities of offsets to be modified by dragging when dragging
    // takes place. This should be weak enough to allow the offset to change.
    dragPriority: -25,
    // the priority for wrapping constraints (constraints which wrap draggable
    // areas) when no dragging takes place. This needs to be stronger than
    // the dragPriority (so as not to change when there is no dragging)
    // but stronger than the noDrag priority (as it should only wrap, not
    // force any positioning).
    wrapPriority: -20,
    // priority of constraints which restrict the drag. These are stronger
    // than any of the other constraits here, but weaker than the
    // standard 0 priority (so as not to compete with standard constraints
    // which define the shape of objects)
    dragStopPriority: -5,
    // Same as dragStopPriority, but in case there are conflicting stop
    // constraints, this allows one to specify which one is more important.
    weakDragStopPriority: -7,
};

var classes = {

    Draggable: o(
        {    
            "class": o("Clickable"),
            context: {
                verticallyDraggable: true, // default value
                draggedVerticalEdge: { type: "top" }, // default 
                horizontallyDraggable: true, // default value
                draggedHorizontalEdge: { type: "left" }, // default 
                draggingPriority: dragPriorities.draggingPriority,

                // 'selected' is defined by "Clickable" when the mouse is
                // down, "beingDragged" is for dragging purposes (and
                // for now, they are the same).
                beingDragged: [{ selected: _ }, [me]],
                
                "^mouseDownX": 0,
                "^mouseDownY": 0
            }
        },
        {
            qualifier: { beingDragged: false,
                         verticallyDraggable: true },
            write: {
                onDraggableMouseDown: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        writeY: {
                            to: [{mouseDownY: _ }, [me]],
                            merge: [offset,
                                    [{ draggedVerticalEdge: _ }, [me]],
                                    { type: "top", element: [pointer] }]
                        }
                    }
                }
            }
        }, 
        {
            qualifier: { beingDragged: false,
                         horizontallyDraggable: true },
            write: {
                onDraggableMouseDown: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        writeX: {
                            to: [{mouseDownX: _ }, [me]],
                            merge: [offset,
                                    [{ draggedHorizontalEdge: _ }, [me]],
                                    { type: "left", element: [pointer] }]
                        }
                    }
                }
            }
        },
        {
            qualifier: { beingDragged: true,
                         verticallyDraggable: true },
            position: {
                topDrag: {
                    point1: [{ draggedVerticalEdge: _ }, [me]],
                    point2: { type: "top", element: [pointer] },
                    equals: [{ mouseDownY: _ }, [me]],
                    priority: [{ draggingPriority: _ }, [me]]
                }
            }
        }, 
        {
            qualifier: { beingDragged: true,
                         horizontallyDraggable: true },
            position: {
                leftDrag: {
                    point1: [{ draggedHorizontalEdge: _ }, [me]],
                    point2: { type: "left", element: [pointer] },
                    equals: [{ mouseDownX: _ }, [me]],
                    priority: [{ draggingPriority: _ }, [me]]
                }
            }
        }
    ),

    // An area inheriting this class can be dragged around relative to
    // a container. Typically, the container is an embedding* area of this
    // area, but this is not strictly required. By default, dragging
    // is relative to the directly embedding area, but this can be modified by
    // setting the container area on the 'dragContainer' context label of
    // this area.
    // Also, by default, the area is its own drag handle (that is, mouse dowm
    // anywhere in the area will result in dragging) but this too may be
    // modified by setting the 'dragInContainerHandle' label to some other
    // area which is a 'DragInContainerHandle'.
    // If the dragged area has additional dragging (such a draggable spacing
    // edge or a draggable resize edge with an initial spacing constraint)
    // this class also makes sure that those dragging constraints are set
    // to the right priority.
    // 
    // To determine the initial position of the area,
    // one can define two of the following context labels (one
    // horizontal and one vertical): 'initialLeft', 'initialRight',
    // 'initialTop' or 'initialBottom'. These define the offset between
    // this area and the drag container (which are not necessarily
    // directly embedded in each other). Alternatively, some other
    // constraints may be set to determine the initial position, but these
    // should use the priority 'dragInContainerInitialPriority' defined by
    // this class.
    
    DraggableInContainer: o(
        {
            context: {
                // as long as this is undefined this area is itself the
                // drag handle. Otherwise, the handle is whatever area
                // is set here.
                //
                // dragInContainerHandle: ?
                //
                
                // by default, the whole area is the drag area (this is
                // overridden below if 'gragInContainerHandle' is false
                // and this area is also the handle).
                pointerInDragInContainerHandle: [
                    { pointerInDragInContainerHandle: _ },
                    [{ dragInContainerHandle: _ }, [me]]],
                // set to true after first drag
                "^dragInContainerWasDragged": false,
                // default definition, replaced below if dragInContainerHandle
                // in not defined
                dragInContainerBeingDragged: [
                    { beingDragged: _ },
                    [{ dragInContainerHandle: _ }, [me]]],
                // the container relative which the dragging takes place
                dragContainer: [embedding], // default value
                
                // priority of the initial constraint(s). This is an
                // initial value, modified below after the first drag
                dragInContainerInitialPriority: dragPriorities.noDragPriority,
                // priority of the stability constraint (activated after
                // first drag). The value here is the default, while not
                // dragging, this is lowered by a variant below when draging.
                dragInContainerStabilityPriority: dragPriorities.noDragPriority,
            },

            // initial positioning (not all initial values here need to be
            // defined, see introduction).
            position: {
                initialLeft: {
                    point1: { type: "left",
                              element: [{ dragContainer: _ }, [me]] },
                    point2: { type: "left" },
                    equals: [{ initialLeft: _ }, [me]],
                    priority: [{ dragInContainerInitialPriority: _ }, [me]]
                },
                initialTop: {
                    point1: { type: "top",
                              element: [{ dragContainer: _ }, [me]] },
                    point2: { type: "top" },
                    equals: [{ initialTop: _ }, [me]],
                    priority: [{ dragInContainerInitialPriority: _ }, [me]]
                },
                initialRight: {
                    point1: { type: "right" },
                    point2: { type: "right",
                              element: [{ dragContainer: _ }, [me]] },
                    equals: [{ initialRight: _ }, [me]],
                    priority: [{ dragInContainerInitialPriority: _ }, [me]]
                },
                initialBottom: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom",
                              element: [{ dragContainer: _ }, [me]] },
                    equals: [{ initialBottom: _ }, [me]],
                    priority: [{ dragInContainerInitialPriority: _ }, [me]]
                },
            },
            
            // mark when this was dragged once
            write: {
                dragInContainerWasDragged: {
                    upon: [{ dragInContainerBeingDragged: true }, [me]],
                    true: {
                        wasDragged: {
                            to: [{ dragInContainerWasDragged: _ }, [me]],
                            merge: true
                        }
                    }
                }
            },
        },

        {
            qualifier: { dragInContainerWasDragged: true },

            context: {
                dragInContainerInitialPriority: dragPriorities.dragPriority,
            },

            // stability constraints 
            position: {
                leftStable: {
                    point1: { type: "left",
                              element: [{ dragContainer: _ }, [me]] },
                    point2: { type: "left" },
                    stability: true,
                    priority: [{ dragInContainerStabilityPriority: _ }, [me]]
                },
                topStable: {
                    point1: { type: "top",
                              element: [{ dragContainer: _ }, [me]] },
                    point2: { type: "top" },
                    stability: true,
                    priority: [{ dragInContainerStabilityPriority: _ }, [me]]
                }
            }
        },

        {
            qualifier: { dragInContainerBeingDragged:  true },

            context: {
                dragInContainerStabilityPriority: dragPriorities.dragPriority
            }
        },
        
        {
            // the whole area is teh drag handle
            qualifier: { dragInContainerHandle: false },
            "class": o("DraggableInContainerHandle"),

            context: {
                dragInContainerBeingDragged: [{ beingDragged: _ }, [me]]
            }
        }        
    ),

    DraggableInContainerHandle: o(
        {
            "class": "Draggable",
            context: {
                pointerInDragInContainerHandle: [
                    { param: { pointerInArea: _ }}, [me]],
            }
        },
    
        {
            qualifier: { pointerInDragInContainerHandle: true },
            context: {
                pointerImage: "move"
            }
        }
    ),
    
    //
    // Resize/Spacing edge drag handles
    //
    
    // The area whose edge is being dragged is assumed to be the
    // expressionOf parent of this area and the embedding area is
    // set to be the referredOf area.
    
    DraggableHandle: o(
        {
            "class": "Draggable",
            context: {
                horizontalDragSide: o(), // set to "left" or "right"
                verticalDragSide: o(), // set to "top" or "bottom"
                // number of pixels for response when dragging horizontal edge
                responseWidth: 16,
                // offset between horizontal center of the handle and the
                // edge (this is always a top to bottom offset)
                responseCenterHorizontalOffset: 0,
                // number of pixels for response when dragging vertical edge
                responseHeight: 16,
                // offset between vertical center of the handle and the
                // edge (this is always a top to bottom offset)
                responseCenterVerticalOffset: 0,

                // the attachement of the handle to the edge being dragged
                // in the direction perpendicular to the direction of
                // dragging must be weaker than all other priorities, so as
                // not to create resistence to dragging in the perpendicular
                // direction (the direction of the girth attachment)
                handleGirthAttachmentPriority: -30,
                pointerInArea: [{ param: { pointerInArea: _ }}, [me]],
                "^wasDragged": false // set to true after first drag
            },
            
            embedding: "referred",
            independentContentPosition: false,

            // mark when this was dragged once
            write: {
                wasDragged: {
                    upon: [{ beingDragged: true }, [me]],
                    true: {
                        wasDragged: {
                            to: [{ wasDragged: _ }, [me]],
                            merge: true
                        }
                    }
                }
            },
        },

        // disable default dragging in direction not specified for handle
        
        {
            qualifier: { horizontalDragSide: false },
            context: {
                horizontallyDraggable: false
            }
        },
        {
            qualifier: { verticalDragSide: false },
            context: {
                verticallyDraggable: false
            }
        },        
        
        // position the dragging handle
        
        {
            qualifier: { horizontalDragSide: true },
            position: {
                
                horizontalCenterOnEdge: {
                    point1: { type: [{ horizontalDragSide: _ }, [me]],
                              element: [expressionOf, [me]] },
                    point2: { type: "horizontal-center" },
                    equals: [{ responseCenterHorizontalOffset: _ }, [me]]
                },
                responseWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    equals: [{ responseWidth: _ }, [me]]
                },
                // the following two should be of lower priority than the
                // constraints above, in case there is also vertical dragging 
                verticalCoverToTop: {
                    point1: { type: "top" },
                    point2: { type: "top", element: [expressionOf, [me]] },
                    equals: 0,
                    priority: [{ handleGirthAttachmentPriority: _ }, [me]]
                },
                verticalCoverToBottom: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom", element: [expressionOf, [me]] },
                    equals: 0,
                    priority: [{ handleGirthAttachmentPriority: _ }, [me]]
                },
            }
        },
        
        {
            qualifier: { verticalDragSide: true },
            position: {

                verticalCenterOnEdge: {
                    point1: { type: [{ verticalDragSide: _ }, [me]],
                              element: [expressionOf, [me]] },
                    point2: { type: "vertical-center" },
                    equals: [{ responseCenterVerticalOffset: _ }, [me]]
                },
                responseHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    equals: [{ responseHeight: _ }, [me]]
                },
                // the following two should be of lower priority than the
                // constraints above, in case there is also vertical dragging 
                horizontalCoverToLeft: {
                    point1: { type: "left" },
                    point2: { type: "left", element: [expressionOf, [me]] },
                    equals: 0,
                    priority: [{ handleGirthAttachmentPriority: _ }, [me]]

                },
                horizontalCoverToRight: {
                    point1: { type: "right" },
                    point2: { type: "right", element: [expressionOf, [me]] },
                    equals: 0,
                    priority: [{ handleGirthAttachmentPriority: _ }, [me]]
                },
            }
        },

        // pointer icon on hover over handle

        {
            qualifier: { pointerInArea: true, verticalDragSide: "bottom",
                         horizontalDragSide: "right" },
            context: {
                pointerImage: "se-resize" // south-east (corner) resize
            }
        },

        {
            qualifier: { pointerInArea: true, verticalDragSide: "top",
                         horizontalDragSide: "left" },
            context: {
                pointerImage: "se-resize" // south-east (corner) resize
            }
        },
        
        {
            qualifier: { pointerInArea: true, verticalDragSide: "bottom",
                         horizontalDragSide: "left" },
            context: {
                pointerImage: "sw-resize" // south-west (corner) resize
            }
        },

        {
            qualifier: { pointerInArea: true, verticalDragSide: "top",
                         horizontalDragSide: "right" },
            context: {
                pointerImage: "sw-resize" // south-west (corner) resize
            }
        },
        
        {
            // horizontal dragging only
            qualifier: { pointerInArea: true, verticalDragSide: false  },
            context: {
                pointerImage: "ew-resize" // east-west (horizontal) resize
            }
        },

        {
            // vertical dragging only
            qualifier: { pointerInArea: true, horizontalDragSide: false  },
            context: {
                pointerImage: "ns-resize" // north-south (vertical) resize
            }
        }
    ),

    // Common base class for all classes included in an area to allow
    // its dragging/resizing
    
    DraggableEdge: o(
        {
            context: {
                // initial priority is first high, but after first drag
                // (in the relevant direction) is lowered, as the stability
                // constraints should take care of the positioning
                initialPriorityBeforeDrag: dragPriorities.noDragPriority,
                initialPriorityAfterDrag: dragPriorities.dragPriority,
                // When not dragging, stbility constraints should keep the
                // relevant offset unchanged, but when dragging, this
                // constraint should be relaxed, to allow movement / resize
                stabilityPriorityWhenNotDragging: dragPriorities.noDragPriority,
                stabilityPriorityWhenDragging: dragPriorities.dragPriority,

                // all possible drag handles (not all of these must be
                // defined). The explicit list here could have been avoided if
                // we had a way to access all children of an area which are
                // not embedded in it.
                dragHandles: o([{ children: { leftDragHandle: _}}, [me]],
                               [{ children: { rightDragHandle: _}}, [me]],
                               [{ children: { topDragHandle: _}}, [me]],
                               [{ children: { bottomDragHandle: _}}, [me]],
                               [{ children: { topLeftDragHandle: _}}, [me]],
                               [{ children: { topRightDragHandle: _}}, [me]],
                               [{ children: { bottomLeftDragHandle: _}}, [me]],
                               [{ children: { bottomRightDragHandle: _}},
                                [me]]),
            },
        }
    ),

    // Base class for edges which allow to resize an area horizontally
    // (the handle may be attached anywhere, but typically either at
    // the left or right side or at a corner).
    //
    // Areas using this class can define a initialWidth context attribute
    // to set their initial width. Otherwise, they can set the width in some
    // other way, but should do so using the priority
    // 'horizontalResizeInitialPriority' defined by this class.
    
    HorizontalResizingDraggableEdge: o(

        {
            "class": "DraggableEdge",
            context: {

                // handles which allow for horizontal resize
                horizontalResizeHandles: [{ horizontalResizeHandle: true },
                                        [{ dragHandles: _ }, [me]]],
                
                // the following properties are modified based on the dragging
                // activity of the relevant handle
                horizontalResizeWasDragged: [
                    { wasDragged: _ }, [{ horizontalResizeHandles: _ }, [me]]],
                horizontalResizeBeingDragged: [
                    { beingDragged: _ },
                    [{ horizontalResizeHandles: _ }, [me]]],

                // priority of the initial constraint(s). This is an
                // initial value, modified below after the first drag
                horizontalResizeInitialPriority: [
                    { initialPriorityBeforeDrag: _ }, [me]],
                // priority of the stability constraint (activated after
                // first drag). The value here is the default, while not
                // dragging, this is lowered by a variant below when draging.
                horizontalResizeStabilityPriority: [
                    { stabilityPriorityWhenNotDragging: _ }, [me]]
            },
            position: {
                initialWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    equals: [{ initialWidth: _ }, [me]],
                    priority: [{ horizontalResizeInitialPriority: _ }, [me]] 
                },
            }
        },
        {
            // once a drag took place, we lower the priority of the initial
            // constraint and put a stability constraint in its place
            qualifier: { horizontalResizeWasDragged: true },
            context: {
                horizontalResizeInitialPriority: [
                    { initialPriorityAfterDrag: _ }, [me]],
            },
            position: {
                widthStable: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    stability: true,
                    priority: [{ horizontalResizeStabilityPriority: _ }, [me]]
                }
            }  
        },
        {
            // when dragging, lower the priority of the stability constraint(s)
            qualifier: { horizontalResizeBeingDragged: true },
            context: {
                horizontalResizeStabilityPriority: [
                    { stabilityPriorityWhenDragging: _ }, [me]
                ]
            }
        }
    ),

    // Base class for edges which allow to resize an area vertically
    // (the handle may be attached anywhere, but typically either at
    // the bottom or top side or at a corner).
    //
    // Areas using this class can define an initialHeight context attribute
    // to set their initial height. Alternatively, the areas can define the
    // initialBottomSpacing context attribute to indicate the initial spacing
    // of the bottom of the resized element from the bottom of the embedding
    // area (if both labels are specified, both are applied).
    // It is also possible to leave these two context labels undefined and
    // set the height or offset from the bottom in some other way, but this
    // should always be done using the priority 'verticalResizeInitialPriority'
    // defined by this class.
    
    VerticalResizingDraggableEdge: o(

        {
            "class": "DraggableEdge",
            context: {

                // handles which allow for horizontal resize
                verticalDragHandles: [{ verticalResizeHandle: true },
                                      [{ dragHandles: _ }, [me]]],

                // the following properties are modified based on the dragging
                // activity of the relevant handle. We also need to consider
                // the dragInContainer dragging, so as to release the initial
                // offset from the bottom, if set.
                verticalResizeWasDragged: [
                    or,
                    [{ wasDragged: _ }, [{ verticalDragHandles: _ }, [me]]],
                      [{ dragInContainerWasDragged: _ }, [me]]],
                                           
                verticalResizeBeingDragged: [
                    { beingDragged: _ }, [{ verticalDragHandles: _ }, [me]]],

                // priority of the initial constraint(s). This is an
                // initial value, modified below after the first drag
                verticalResizeInitialPriority: [
                    { initialPriorityBeforeDrag: _ }, [me]],
                // priority of the stability constraint (activated after
                // first drag). The value here is the default, while not
                // dragging, this is lowered by a variant below when draging.
                verticalResizeStabilityPriority: [
                    { stabilityPriorityWhenNotDragging: _ }, [me]]
            },
            position: {
                // typically, only one of these two should be defined
                initialHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    equals: [{ initialHeight: _ }, [me]],
                    priority: [{ verticalResizeInitialPriority: _ }, [me]] 
                },
                initialBottomSpacing: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom", element: [embedding] },
                    equals: [{ initialBottomSpacing: _ }, [me]],
                    priority: [{ verticalResizeInitialPriority: _ }, [me]] 
                },
            }
        },
        {
            // once a drag took place, we lower the priority of the initial
            // constraint and put a stability constraint in its place
            qualifier: { verticalResizeWasDragged: true },
            context: {
                verticalResizeInitialPriority: [
                    { initialPriorityAfterDrag: _ }, [me]],
            },
            position: {
                heightStable: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    stability: true,
                    priority: [{ verticalResizeStabilityPriority: _ }, [me]]
                }
            }  
        },
        {
            // when dragging, lower the priority of the stability constraint(s)
            qualifier: { verticalResizeBeingDragged: true },
            context: {
                verticalResizeStabilityPriority: [
                    { stabilityPriorityWhenDragging: _ }, [me]
                ]
            }
        }
    ),

    // This class should be used in a draggable edge class which allows
    // modifying the horizontal offset of the area (including the draggable
    // handle) from the previous area in the order set of children this
    // area belongs to (if it is the first in the ordered set, the spacing
    // is from the embedding area).
    // If the areas are ordered right to left, the context label
    // 'rightToLeft' should be set to true.
    // The initial offset may be set by setting 'initialHorizontalSpacing'
    // (for left to right, this is the offet between the right of the previous
    // to the left of this area, while for right to left, this is between
    // the left of the previous and the right of this area). 
    
    HorizontalSpacingHandle: o(
        {
            "class": "DraggableEdge",
            context: {

                // handles which allow for horizontal resize
                horizontalSpacingHandles: [{ horizontalSpacingHandle: true },
                                           [{ dragHandles: _ }, [me]]],
                
                // the following properties are modified based on the dragging
                // activity of the relevant handle
                horizontalSpacingWasDragged: [
                    or,
                    [{ wasDragged: _ },
                     [{ horizontalSpacingHandles: _ }, [me]]],
                    [{ dragInContainerWasDragged: _ }, [me]]],
                horizontalSpacingBeingDragged: [
                    or,
                    [{ beingDragged: _ },
                     [{ horizontalSpacingHandles: _ }, [me]]],
                    [{ dragInContainerBeingDragged: _ }, [me]]],

                // priority of the initial constraint(s). This is an
                // initial value, modified below after the first drag
                horizontalSpacingInitialPriority: [
                    { initialPriorityBeforeDrag: _ }, [me]],
                // priority of the stability constraint (activated after
                // first drag). The value here is the default, while not
                // dragging, this is lowered by a variant below when draging.
                horizontalSpacingStabilityPriority: [
                    { stabilityPriorityWhenNotDragging: _ }, [me]],

                // auxiliary variable to determine whether this element
                // should be spaced relative to the previous element or
                // relative to the embedding area. By default, spacing is
                // with the embedding area only if there is no previous
                // element. A derived class can override this.
                
                horizontalSpacingFromEmbedding: [empty, [prev, [me]]]
            },
        },

        // initial spacing and stable spacing after drag. We allow both
        // left-to-right and right-to-left spacing
        
        {
            qualifier: { rightToLeft: false },
            position: {
                initialHorizontalSpacing: {
                    point1: { type: "right", element: [prev, [me]] },
                    point2: { type: "left" },
                    equals: [{ initialHorizontalSpacing: _ }, [me]],
                    priority: [{ horizontalSpacingInitialPriority: _ }, [me]] 
                }
            }
        },

        {
            // if horizontalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { rightToLeft: false,
                         horizontalSpacingFromEmbedding: true },
            position: {
                initialHorizontalSpacing: {
                    point1: { type: "left", element: [embedding] }
                }
            }
        },

        {
            qualifier: { rightToLeft: true },
            position: {
                initialHorizontalSpacing: {
                    point1: { type: "right" },
                    point2: { type: "left", element: [prev, [me]] },
                    equals: [{ initialHorizontalSpacing: _ }, [me]],
                    priority: [{ horizontalSpacingInitialPriority: _ }, [me]] 
                },
            }
        },

        {
            // if horizontalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { rightToLeft: true,
                         horizontalSpacingFromEmbedding: true },
            position: {
                initialHorizontalSpacing: {
                    point2: { type: "right", element: [embedding] }
                }
            }
        },
        
        // once a drag took place, we lower the priority of the initial
        // constraint and put a stability constraint in its place (we
        // need a slightly different constraint for left-to-right and
        // right-to-left)
        
        {
            qualifier: { horizontalSpacingWasDragged: true },
            context: {
                horizontalSpacingInitialPriority: [
                    { initialPriorityAfterDrag: _ }, [me]],
            },
        },

        {
            qualifier: { horizontalSpacingWasDragged: true,
                         rightToLeft: false
                       },
            position: {
                spacingStable: {
                    point1: { type: "right", element: [prev, [me]] },
                    point2: { type: "left" },
                    stability: true,
                    priority: [{ horizontalSpacingStabilityPriority: _ }, [me]]
                }
            }  
        },

        {
            // if horizontalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { horizontalSpacingWasDragged: true, rightToLeft: false,
                         horizontalSpacingFromEmbedding: true },
            position: {
                spacingStable: {
                    point1: { type: "left", element: [embedding] }
                }
            }
        },

        
        {
            qualifier: { horizontalSpacingWasDragged: true,
                         rightToLeft: true
                       },
            position: {
                spacingStable: {
                    point1: { type: "right" },
                    point2: { type: "left", element: [prev, [me]] },
                    stability: true,
                    priority: [{ horizontalSpacingStabilityPriority: _ }, [me]]
                }
            }  
        },

        {
            // if horizontalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { horizontalSpacingWasDragged: true, rightToLeft: true,
                         horizontalSpacingFromEmbedding: true },
            position: {
                spacingStable: {
                    point2: { type: "right", element: [embedding] }
                }
            }
        },
        
        {
            // when dragging, lower the priority of the stability constraint(s)
            qualifier: { horizontalSpacingBeingDragged: true },
            context: {
                horizontalSpacingStabilityPriority: [
                    { stabilityPriorityWhenDragging: _ }, [me]
                ]
            }
        }
    ),

    // This class should be used in a draggable edge class which allows
    // modifying the vertical offset of the area (including the draggable
    // handle) from the previous area in the order set of children this
    // area belongs to. It is assumed that the areas are ordered from top
    // to bottom (so the attachment of the top of each area to the bottom
    // of the previous one).
    // The initial offset may be set by setting 'initialVerticalSpacing'
    
    VerticalSpacingHandle: o(
        {
            "class": "DraggableEdge",
            context: {

                // handles which allow for horizontal resize
                verticalSpacingHandles: [{ verticalSpacingHandle: true },
                                         [{ dragHandles: _ }, [me]]],
                
                // the following properties are modified based on the dragging
                // activity of the relevant handle
                verticalSpacingWasDragged: [
                    or,
                    [{ wasDragged: _ }, [{ verticalSpacingHandles: _ }, [me]]],
                    [{ dragInContainerWasDragged: _ }, [me]]],
                verticalSpacingBeingDragged: [
                    or,
                    [{ beingDragged: _ },
                     [{ verticalSpacingHandles: _ }, [me]]],
                    [{ dragInContainerBeingDragged: _ }, [me]]],

                // priority of the initial constraint(s). This is an
                // initial value, modified below after the first drag
                verticalSpacingInitialPriority: [
                    { initialPriorityBeforeDrag: _ }, [me]],
                // priority of the stability constraint (activated after
                // first drag). The value here is the default, while not
                // dragging, this is lowered by a variant below when draging.
                verticalSpacingStabilityPriority: [
                    { stabilityPriorityWhenNotDragging: _ }, [me]],

                // auxiliary variable to determine whether this element
                // should be spaced relative to the previous element or
                // relative to the embedding area. By default, spacing is
                // with the embedding area only if there is no previous
                // element. A derived class can override this.

                verticalSpacingFromEmbedding: [empty, [prev, [me]]],
            },

            position: {
                initialVerticalSpacing: {
                    point1: { type: "bottom", element: [prev, [me]] },
                    point2: { type: "top" },
                    equals: [{ initialVerticalSpacing: _ }, [me]],
                    priority: [{ verticalSpacingInitialPriority: _ }, [me]] 
                }
            }
        },

        // initial spacing and stable spacing after drag.
        
        {
            // if verticalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { verticalSpacingFromEmbedding: true },
            position: {
                initialVerticalSpacing: {
                    point1: { type: "top", element: [embedding] }
                }
            }
        },
        
        // once a drag took place, we lower the priority of the initial
        // constraint and put a stability constraint in its place (we
        // need a slightly different constraint for left-to-right and
        // right-to-left)
        
        {
            qualifier: { verticalSpacingWasDragged: true },
            context: {
                verticalSpacingInitialPriority: [
                    { initialPriorityAfterDrag: _ }, [me]],
            },
            position: {
                verticalSpacingStable: {
                    point1: { type: "bottom", element: [prev, [me]] },
                    point2: { type: "top" },
                    stability: true,
                    priority: [{ verticalSpacingStabilityPriority: _ }, [me]]
                }
            }
        },

        {
            // if verticalSpacingFromEmbedding is set, the attachment is
            // to the embedding area, not the previous one
            qualifier: { verticalSpacingWasDragged: true,
                         verticalSpacingFromEmbedding: true },
            position: {
                verticalSpacingStable: {
                    point1: { type: "top", element: [embedding] }
                }
            }
        },
        
        {
            // when dragging, lower the priority of the stability constraint(s)
            qualifier: { verticalSpacingBeingDragged: true },
            context: {
                verticalSpacingStabilityPriority: [
                    { stabilityPriorityWhenDragging: _ }, [me]
                ]
            }
        }
    ),
    
    // inherit this, for a left edge dragging handle
    
    DraggableEdgeLeft: o(
        {
            context: {
                // this determines whether this is a resize handle or a
                // spacing handle. By default it is a resize handle if the
                // direction is right to left and a spacing handle if the
                // direction is left to right, but a class inheriting this
                // can override this.
                draggableEdgeLeftIsResize: [{ rightToLeft: _ }, [me]]
            },
            children: {
                leftDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {
                            horizontalDragSide: "left"
                        }
                    }
                }
            }
        },

        {
            qualifier: { draggableEdgeLeftIsResize: false },
            "class": "HorizontalSpacingHandle",
            children: {
                leftDragHandle: {
                    description: {
                        context: {
                            horizontalSpacingHandle: true,
                        }
                    }
                }
            }
        },

        {
            qualifier: { draggableEdgeLeftIsResize: true },
            "class": "HorizontalResizingDraggableEdge",
            children: {
                leftDragHandle: {
                    description: {
                        context: {
                            horizontalResizeHandle: true,
                        }
                    }
                }
            }
        }
    ),

    // inherit this, for a right edge dragging handle
    
    DraggableEdgeRight: o(
        {
            context: {
                // this determines whether this is a resize handle or a
                // spacing handle. By default it is a resize handle if the
                // direction is left to right and a spacing handle if the
                // direction is right to left, but a class inheriting this
                // can override this.
                draggableEdgeRightIsResize: [
                    not, [{ rightToLeft: _ }, [me]]],
            },
            children: {
                rightDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {                            
                            horizontalDragSide: "right",
                        }
                    }
                }
            }
        },
        {
            qualifier: { draggableEdgeRightIsResize: true },
            "class": "HorizontalResizingDraggableEdge",
            children: {
                rightDragHandle: {
                    description: {
                        context: {
                            horizontalResizeHandle: true,
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { draggableEdgeRightIsResize: false },
            "class": "HorizontalSpacingHandle",
            children: {
                rightDragHandle: {
                    description: {
                        context: {
                            horizontalSpacingHandle: true,
                        }
                    }
                }
            }
        }
    ),

    // inherit this, for a top edge dragging handle
    
    DraggableEdgeTop: o(
        {
            "class": "VerticalSpacingHandle",
            children: {
                topDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {
                            verticalDragSide: "top",
                            verticalSpacingHandle: true
                        }
                    }
                }
            }
        }
    ),

    // inherit this, for a bottom edge dragging handle
    
    DraggableEdgeBottom: o(
        {
            "class": "VerticalResizingDraggableEdge",
            children: {
                bottomDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {
                            verticalDragSide: "bottom",
                            verticalResizeHandle: true
                        }
                    }
                }
            }
        }
    ),

    // inherit this, for a bottom right corner dragging handle
    
    DraggableCornerBottomRight: o(
        {
            "class": o("VerticalResizingDraggableEdge"),
            children: {
                bottomRightDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {
                            horizontalDragSide: "right",
                            verticalDragSide: "bottom",
                            verticalResizeHandle: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { rightToLeft: false },
            "class": "HorizontalResizingDraggableEdge",
            children: {
                bottomRightDragHandle: {
                    description: {
                        context: {
                            horizontalResizeHandle: true,
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { rightToLeft: true },
            "class": "HorizontalSpacingHandle",
            children: {
                bottomRightDragHandle: {
                    description: {
                        context: {
                            horizontalSpacingHandle: true,
                        }
                    }
                }
            }
        }
        
    ),

    DraggableCornerBottomLeft: o(
        {
            "class": o("VerticalResizingDraggableEdge"),
            children: {
                bottomLeftDragHandle: {
                    partner: [embedding],
                    description: {
                        "class": "DraggableHandle",
                        context: {
                            horizontalDragSide: "left",
                            verticalDragSide: "bottom",
                            verticalResizeHandle: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { rightToLeft: true },
            "class": "HorizontalResizingDraggableEdge",
            children: {
                bottomLeftDragHandle: {
                    description: {
                        context: {
                            horizontalResizeHandle: true,
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { rightToLeft: false },
            "class": "HorizontalSpacingHandle",
            children: {
                bottomLeftDragHandle: {
                    description: {
                        context: {
                            horizontalSpacingHandle: true,
                        }
                    }
                }
            }
        }        
    ),

    // This class can be used for an area which wraps a set of draggable
    // areas. This means that this area may have to change together with
    // those areas, as they are being dragged. This class provides the
    // basic priorities for constraints defined in the DragWrapper area
    // such that these do not interfer with dragging when it is in progress.
    
    DragWrapper: o(
        {
            context: {
                // the draggable areas which this area wraps. By default, these
                // are the embedded areas, but this may be changed.
                wrappedDraggable: [embedded, [me]],

                // priority for wrapping constraints (these are decreased
                // automatically when dragging in the relevant direction
                // takes place)
                
                verticalWrappingPriority: dragPriorities.wrapPriority,
                horizontalWrappingPriority: dragPriorities.wrapPriority,

                // is any of the wrapped draggable areas being dragged
                // (in the relevant direction).

                wrappedBeingDraggedHorizontally: [
                    o({ horizontalResizeBeingDragged: true },
                      { horizontalSpacingBeingDragged: true }),
                    [{ wrappedDraggable: _ }, [me]]],
                
                wrappedBeingDraggedVertically: [
                    o({ verticalResizeBeingDragged: true },
                      { verticalSpacingBeingDragged: true }),
                    [{ wrappedDraggable: _ }, [me]]],
            },
        },

        {
            qualifier: { wrappedBeingDraggedHorizontally: true },
            context: {
                horizontalWrappingPriority: dragPriorities.dragPriority
            }
        },
        
        {
            qualifier: { wrappedBeingDraggedVertically: true },
            context: {
                verticalWrappingPriority: dragPriorities.dragPriority
            }
        }
    )
};
