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

var classes = {

    /////////////////////////////////////////////////////////

    ScreenArea: {

    },

    //////////////////////////////////////////////////////////////

    ScrollBar: {

    },

    /////////////////////////////////////////////////////////////////

    PlatformArea: {

    },

    /////////////////////////////////////////////////////////////////

    TrackMyWindowGroup: {
        context: {
            myPlatformArea: [[embeddingStar, [me]], [areaOfClass, "PlatformArea"]],
            myViewWindow: [{ myPlatformArea: [{ myPlatformArea: _ }, [me]] }, [areaOfClass, "ViewWindow"]],
            myDocument: [{ myPlatformArea: [{ myPlatformArea: _ }, [me]] }, [areaOfClass, "ContentToFrameDim"]],
            myInputButtonCheck: [{ myPlatformArea: [{ myPlatformArea: _ }, [me]] }, [areaOfClass, "numbersFromUser"]],
            myScrollerCheck: [{ myPlatformArea: [{ myPlatformArea: _ }, [me]] }, [areaOfClass, "ScrollerDraggingTool"]],
            myScrollBar: [{ myPlatformArea: [{ myPlatformArea: _ }, [me]] }, [areaOfClass, "ScrollBar"]],
        }
    },

    ///////////////////////////////////////////////////////////////

    ClickerValueSwitch: {
        write: {
            onClick: {
                upon: [{ subType: "Click" }, [myMessage]],
                true: {
                    select: {
                        to: [{ valueToBeFlipped: _ }, [me]],
                        merge: [not, [{ valueToBeFlipped: _ }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////
    numbersFromUser:
    o(
        {
            qualifier: "!",
            context: {
                "^numLineActive": false,
                "^numToBeMatched": 1,
                //    "^qryName": "NameMe"
            }
        },
        {
            context: {
                numberInDisplay: [{ param: { input: { value: _ } } }, [me]],
                onlyPositiveNumbers: [greaterThan, [{ numberInDisplay: _ }, [me]], 0],
            }
        },
        {
            "class": "ClickerValueSwitch",
            context: {
                valueToBeFlipped: [{ numLineActive: _ }, [me]],

            },
            display: {
                text: {
                    value:
                    [concatStr,
                        o(
                            [{ qryName: _ }, [me]],
                            [{ numToBeMatched: _ }, [me]]
                        )
                    ]
                }
            },
        },
        {
            qualifier: { numLineActive: false },
            display: {
                text: {
                    value: [{ numToBeMatched: _ }, [me]]
                }
            }
        },
        {
            qualifier: { numLineActive: true },
            display: {
                background: "#dddddd",
                text: {
                    input: {
                        type: "number",
                        placeholder: "number here",
                        init: {
                            selectionStart: 0,
                            selectionEnd: -1,
                            focus: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { numberInDisplay: true, onlyPositiveNumbers: true },
            write: {
                onEnteringNumber: {
                    upon: [{ type: "KeyDown", key: "Return" }, [message]],
                    true: {
                        updateRaceCarNum: {
                            to: [{ numToBeMatched: _ }, [me]],
                            merge: [{
                                param:
                                {
                                    input:
                                    { value: _ }
                                }
                            },
                            [me]]
                        },
                        finalCasrsNumber: {
                            to: [{ numLineActive: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////
    //
    // API  - can accept other areas as a trigger for movement, otherTriggerArea: _    
    //
    ////////////////////////////////////////////////////////////////

    WindowDraggingTool: o(
        {
            qualifier: "!",
            context: {
                "^posController": 0,
                "^beingDragged": false,
                "^allowToBeDragged": false
            }
        },
        {
            position: {
                topContentLabelDef: {
                    point1: {
                        type: "top",
                        content: true
                    },
                    point2: {
                        label: "topContentLabel"
                    },
                    equals: [{ halfViewWindowFrameSize: _ }, [me]]
                },
                contentToFramePosition: {
                    pair1: {
                        point1: {
                            label: "globalTopLabel"
                        },
                        point2: {
                            label: "globalBottomLabel"
                        }
                    },
                    pair2: {
                        point1: {
                            label: "topContentLabel"
                        },
                        point2: {
                            type: "vertical-center",
                            element: [{ myViewWindow: _ }, [me]]
                        }
                    },
                    ratio: [{ effectiveDocSize: _ }, [me]]
                }
            },
            context: {
                "^yAxisAreaToPointer": o(),
                otherTriggerArea:
                [
                    { handledBy: [{ myScrollerCheck: _ }, [me]] },
                    [{ type: "MouseDown" }, [message]]
                ],
                yAxisDistanceFromPointer: [offset,
                    {
                        type: "top",
                        content: true
                    },
                    {
                        element: [pointer],
                        type: "top"
                    }
                ],
                effectiveDocSize: [offset,
                    {
                        label: "topContentLabel"
                    },
                    {
                        label: "bottomContentLabel"
                    },
                ],
                restDistanceContentToFrame: [offset,
                    {
                        type: "top",
                        content: true
                    },
                    {
                        type: "top",
                        element: [{ myViewWindow: _ }, [me]]
                    },
                ],
            },
            write: {
                mouseDraggingStart: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        beingEdit: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: true
                        },
                        yPositionAccordingToPointer: {
                            to: [{ yAxisAreaToPointer: _ }, [me]],
                            merge: [{ yAxisDistanceFromPointer: _ }, [me]]
                        },
                    }
                },
                mouseDraggingStartByOther: {
                    upon: [{ otherTriggerArea: _ }, [me]],
                    true: {
                        followTheDraggedLeader: {
                            to: [{ allowToBeDragged: _ }, [me]],
                            merge: true
                        },
                    }
                }
            }
        },
        {
            qualifier: { allowToBeDragged: true },
            write: {
                endScrollerDrag: {
                    upon: [{ type: "MouseUp" }, [message]],
                    true: {
                        othersCantMoveMe: {
                            to: [{ allowToBeDragged: _ }, [me]],
                            merge: false
                        },
                        yAxisNewLocationToyVal: {
                            to: [{ posController: _ }, [me]],
                            merge: [{ restDistanceContentToFrame: _ }, [me]]
                        },
                    }
                }
            }
        },
        {
            qualifier: { beingDragged: true },
            write: {
                mouseDraggingOver: {
                    upon: [{ type: "MouseUp" }, [message]],
                    true: {
                        areaIsGoingToStayHere: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: false
                        },
                        yAxisNewLocationToyVal: {
                            to: [{ posController: _ }, [me]],
                            merge: [{ restDistanceContentToFrame: _ }, [me]]
                        },
                    }
                }
            },
            position: {
                topAreaToPointer: {
                    point1: {
                        type: "top",
                        content: true
                    },
                    point2: {
                        element: [pointer],
                        type: "top"
                    },
                    equals: [{ yAxisAreaToPointer: _ }, [me]],
                    priority: -200
                },
            }
        },
        {
            qualifier: { beingDragged: false, allowToBeDragged: false },
            position: {
                notInMotionPos: {
                    point1: {
                        type: "top",
                        content: true
                    },
                    point2: {
                        type: "top",
                        element: [{ myViewWindow: _ }, [me]]
                    },
                    equals: [{ posController: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////
    //
    // API:
    // 1. Uses labels defined by document area to react and drag the document
    //
    /////////////////////////////////////////////////////////////

    ScrollerDraggingTool: o(
        {
            qualifier: "!",
            context: {
                "^beingDragged": false,
            }
        },
        {
            context: {
                "^yAxisAreaToPointer": o(),
                distanceFromPointer: [offset,
                    {
                        type: "top"
                    },
                    {
                        type: "top",
                        element: [pointer],
                    }
                ],
            },
            position: {
                viewWindowRelativePosition: {
                    pair1: {
                        point1: {
                            label: "globalTopLabel",
                            element: [{ myDocument: _ }, [me]]
                        },
                        point2: {
                            label: "globalBottomLabel",
                            element: [{ myDocument: _ }, [me]]
                        }
                    },
                    pair2: {
                        point1: {
                            label: "topEffScrollerBorder"
                        },
                        point2: {
                            type: "vertical-center"
                        }
                    },

                    ratio: [{ effectiveScrollSize: _ }, [me]]
                },
            },
            write: {
                mouseDraggingStart: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        followThePointer: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: true
                        },
                        yPositionAccordingToPointer: {
                            to: [{ yAxisAreaToPointer: _ }, [me]],
                            merge: [{ distanceFromPointer: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { beingDragged: true },
            write: {
                mouseDraggingOver: {
                    upon: [{ type: "MouseUp" }, [message]],
                    true: {
                        leaveThePointer: {
                            to: [{ beingDragged: _ }, [me]],
                            merge: false
                        },
                    }
                }
            },
            position: {
                topAreaToPointer: {
                    point1: {
                        type: "top",
                    },
                    point2: {
                        element: [pointer],
                        type: "top"
                    },
                    equals: [{ yAxisAreaToPointer: _ }, [me]],
                    priority: -200
                },
            }
        }
    ),
    ///////////////////////////////////////////////////////////

    ViewWindow: {

    },

    /////////////////////////////////////////////////////////////
    // API: 
    //  Positioning relative to the embedding view window area using myPlatformArea: _  
    //
    //////////////////////////////////////////////////////////////
    ContentToFrameDim: {
        context: {
            contentHeight: [offset,
                {
                    type: "top",
                    content: true
                },
                {
                    type: "bottom",
                    content: true
                }
            ],
            frameHeight: [offset,
                {
                    type: "top",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                },
                {
                    type: "bottom",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                }
            ],
            viewWindowContentToFrameRatio: [div,
                [{ frameHeight: _ }, [me]],
                [{ contentHeight: _ }, [me]]
            ],
            halfViewWindowFrameSize: [offset,
                {
                    type: "top",
                    element: [{ myViewWindow: _ }, [me]],
                    content: true
                },
                {
                    type: "vertical-center",
                    element: [{ myViewWindow: _ }, [me]]
                }
            ],
        },
        position: {
            topContentBorder: {
                point1: {
                    type: "top",
                },
                point2: {
                    type: "top",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                },
                min: 0
            },
            bottomContentBorder: {
                point1: {
                    type: "bottom",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                },
                point2: {
                    type: "bottom",
                    content: true
                },
                min: 0
            },
            topContentLabelDef: {
                point1: {
                    type: "top",
                    content: true
                },
                point2: {
                    label: "topContentLabel"
                },
                equals: [{ halfViewWindowFrameSize: _ }, [me]]
            },
            bottomContentLabelDef: {
                point1: {
                    label: "bottomContentLabel"
                },
                point2: {
                    type: "bottom",
                    content: true,
                },
                equals: [{ halfViewWindowFrameSize: _ }, [me]]
            },
            contentBottomTopBorder: {
                point1: {
                    type: "top",
                    content: true
                },
                point2: {
                    type: "bottom",
                    content: true
                },
                equals: 0,
                priority: -100
            },
            minDistanceToTopChildren: {
                point1: {
                    type: "top",
                    content: true
                },
                point2: {
                    type: "top",
                    element: [first, [{ children: { legoBlocks: _ } }, [me]]]
                },
                equals: 5
            },
            minDistanceToBottomChildren: {
                point1: {
                    type: "bottom",
                    element: [last, [{ children: { legoBlocks: _ } }, [me]]]
                },
                point2: {
                    type: "bottom",
                    content: true
                },
                equals: 5
            },
            leftFrameToContent: {
                point1: {
                    type: "left",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                },
                point2: {
                    type: "left",
                },
                equals: 0
            },
            rightFrameToContent: {
                point1: {
                    type: "right",
                },
                point2: {
                    type: "right",
                    content: true,
                    element: [{ myViewWindow: _ }, [me]]
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////
    // 
    // API - 
    //1. Requires the size ratio between the document and view window in order to calculate scroller size.
    //   viewWindowContentToFrameRatio: _ 
    //
    ////////////////////////////////////////////////////////////////

    ScrollerDim: {
        context: {
            topLabelToScrollerVC: [offset,
                {
                    label: "topEffScrollerBorder"
                },
                {
                    type: "vertical-center"
                },
            ],
            effectiveScrollSize: [offset,
                {
                    label: "topEffScrollerBorder"
                },
                {
                    label: "bottomEffScrollerBorder"
                },
            ],
            scrollBarHeight: [offset,
                {
                    type: "top",
                    element: [{ myScrollBar: _ }, [me]]
                },
                {
                    type: "bottom",
                    element: [{ myScrollBar: _ }, [me]]
                }
            ],
            scrollerExpectedSize: [mul,
                [{ scrollBarHeight: _ }, [me]],
                [{ viewWindowContentToFrameRatio: _ }, [{ myDocument: _ }, [me]]]],
            halfScrollerSize: [div, [{ scrollerExpectedSize: _ }, [me]], 2],
            scrollerSizeThreshold: [cond, [greaterThanOrEqual, [{ scrollerExpectedSize: _ }, [me]], 20],
                o(
                    {
                        on: true, use:
                        [{ halfScrollerSize: _ }, [me]]
                    },
                    {
                        on: false, use:
                        10
                    }
                )
            ],
        },
        position: {
            scrollerEffTopBorder: {
                point1: {
                    type: "top",
                    element: [{ myScrollBar: _ }, [me]],
                    content: true
                },
                point2: {
                    label: "topEffScrollerBorder"
                },
                equals: [{ scrollerSizeThreshold: _ }, [me]]
            },
            scrollerEffBottomBorder: {

                point1: {
                    label: "bottomEffScrollerBorder"
                },
                point2: {
                    type: "bottom",
                    element: [{ myScrollBar: _ }, [me]],
                    content: true
                },
                equals: [{ scrollerSizeThreshold: _ }, [me]]
            },
            scrollerUpperBorder: {
                point1: {
                    label: "topEffScrollerBorder"
                },
                point2: {
                    type: "vertical-center"
                },
                min: 0
            },
            scrollerBottomBorder: {
                point1: {
                    type: "vertical-center"
                },
                point2: {
                    label: "bottomEffScrollerBorder"
                },
                min: 1
            },
            scrollerHeight: {
                point1: {
                    type: "top"
                },
                point2: {
                    type: "bottom"
                },
                equals: [mul, [{ scrollerSizeThreshold: _ }, [me]], 2]
            }
        }
    },

    ////////////////////////////////////////////////////////////////

};

var screenArea = {
    "class": "ScreenArea",
    display: {
        background: "bbbbbb"
    },
    context: {
        platformAreaProducer: [sequence, r(1, 3)],
    },
    position: {
        firstPlatformAreaPos: {
            point1: {
                type: "left"
            },
            point2: {
                type: "left",
                element: [first, [{ children: { platformArea: _ } }, [me]]]
            },
            equals: 20
        }
    },
    children: {
        platformArea: {
            data: [{ platformAreaProducer: _ }, [me]],
            description: {
                "class": o("PlatformArea", "TrackMyWindowGroup"),
                display: {
                    background: "pink",
                    borderColor: "black",
                    borderWidth: 2,
                    borderStyle: "solid"

                },
                position: {
                    height: 450,
                    width: 200,
                    firstScrollBarAlignToPlatformArea: {
                        point1: {
                            type: "right",
                            element: [first, [{ children: { scrollBar: _ } }, [me]]]
                        },
                        point2: {
                            type: "right",
                        },
                        equals: 3
                    },
                    secondScrollBarAlignToPlatformArea: {
                        point1: {
                            type: "left",
                        },
                        point2: {
                            type: "left",
                            element: [last, [{ children: { scrollBar: _ } }, [me]]]
                        },
                        equals: 3
                    },
                    /*  alignHorizontalToScreenArea: {
                          point1: {
                              type: "horizontal-center",
                              element: [areaOfClass, "ScreenArea"]
                          },
                          point2: {
                              type: "horizontal-center"
                          },
                          equals: 0
                      }, */
                    platformAreaOrder: {
                        point1: {
                            type: "right",
                            element: [prev]
                        },
                        point2: {
                            type: "left"
                        },
                        equals: 10
                    },
                    alignVerticalToScreenArea: {
                        point1: {
                            type: "vertical-center",
                            element: [areaOfClass, "ScreenArea"]
                        },
                        point2: {
                            type: "vertical-center"
                        },
                        equals: 0
                    }
                },
                children: {
                    viewWindow: {
                        description: {
                            "class": o("ViewWindow", "TrackMyWindowGroup"),
                            context: {
                                legoBlocksLineup: [sequence, r(1, [{ numToBeMatched: _ }, [{ myInputButtonCheck: _ }, [me]]])],
                                yValDefultPos: 0
                            },
                            display: {
                                background: "white",
                                borderColor: "black",
                                borderWidth: 2,
                                borderStyle: "solid"
                            },
                            position: {
                                top: 5,
                                firstScrollBarAlignToViewWindow: {
                                    point1: {
                                        type: "right",
                                    },
                                    point2: {
                                        type: "left",
                                        element: [first, [{ children: { scrollBar: _ } }, [{ myPlatformArea: _ }, [me]]]]
                                    },
                                    equals: 3
                                },

                                secondScrollBarAlignToViewWindow: {
                                    point1: {
                                        type: "right",
                                        element: [last, [{ children: { scrollBar: _ } }, [{ myPlatformArea: _ }, [me]]]]
                                    },
                                    point2: {
                                        type: "left",
                                    },
                                    equals: 3
                                },
                            },
                            children: {
                                documentArea: {
                                    description: {
                                        "class": o("WindowDraggingTool", "ContentToFrameDim", "TrackMyWindowGroup"),
                                        display: {
                                            background: "white"
                                        },
                                        position: {
                                            alignWithEmbeddingView: {
                                                point1: {
                                                    type: "horizontal-center"
                                                },
                                                point2: {
                                                    type: "horizontal-center",
                                                    element: [{ myViewWindow: _ }, [me]]
                                                },
                                                equals: 0
                                            }
                                        },
                                        children: {
                                            legoBlocks: {
                                                data: [{ legoBlocksLineup: _ }, [{ myViewWindow: _ }, [me]]],
                                                description: {
                                                    "class": "TrackMyWindowGroup",
                                                    display: {
                                                        background: "grey",
                                                        text: {
                                                            value: [{ param: { areaSetContent: _ } }, [me]]
                                                        }
                                                    },
                                                    position: {
                                                        right: 1,
                                                        left: 1,
                                                        height: 20,
                                                        remainCalmAndFormAColumn: {
                                                            point1: {
                                                                type: "bottom",
                                                                element: [prev]
                                                            },
                                                            point2: {
                                                                type: "top"
                                                            },
                                                            equals: 5
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    scrollBar: {
                        data: o(1, 2),
                        description: {
                            "class": o("ScrollBar", "TrackMyWindowGroup"),
                            display: {
                                borderColor: "black",
                                borderWidth: 2,
                                borderStyle: "solid"
                            },
                            position: {
                                width: 15,
                                top: 5,
                                relativeToBottomViewWindow: {
                                    point1: {
                                        type: "bottom",
                                        element: [{ myViewWindow: _ }, [me]]
                                    },
                                    point2: {
                                        type: "bottom",
                                    },
                                    equals: 0
                                },
                            },
                            children: {
                                scroller: {
                                    description: {
                                        "class": o("ScrollerDim", "ScrollerDraggingTool", "TrackMyWindowGroup"),
                                        display: {
                                            background: "yellow"
                                        },
                                        position: {
                                            width: 7,
                                            alignWithScrollBar: {
                                                point1: {
                                                    type: "horizontal-center"
                                                },
                                                point2: {
                                                    type: "horizontal-center",
                                                    element: [embedding]
                                                },
                                                equals: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    addedBlocksNumber: {
                        description: {
                            "class": o("numbersFromUser", "TrackMyWindowGroup"),
                            context: {
                                qryName: "Blocks:  "
                            },
                            display: {
                                background: "grey",
                            },
                            position: {
                                width: 100,
                                height: 40,
                                relativeToViewWindow: {
                                    point1: {
                                        type: "bottom",
                                        element: [{ myViewWindow: _ }, [me]]
                                    },
                                    point2: {
                                        type: "top"
                                    },
                                    equals: 10
                                },
                                alignButtonHorizontal: {
                                    point1: {
                                        type: "horizontal-center"
                                    },
                                    point2: {
                                        type: "horizontal-center",
                                        element: [{ myPlatformArea: _ }, [me]]
                                    },
                                    equals: 0
                                },
                                alignButtonUnderPlatformArea: {
                                    point1: {
                                        type: "bottom",
                                    },
                                    point2: {
                                        type: "bottom",
                                        element: [{ myPlatformArea: _ }, [me]]
                                    },
                                    equals: 10
                                }
                            },
                        }
                    }
                }
            }
        },
        instructionBlock: {
            description: {
                position: {
                    height: 100,
                    width: 550,
                    left: 50,
                    beneathTheAction: {
                        point1: {
                            type: "bottom",
                            element: [areaOfClass, "PlatformArea"]
                        },
                        point2: {
                            type: "top"
                        },
                        equals: 30
                    }
                },
                display: {
                    background: "pink",
                    text: {
                        value: "You can create a stack of lego blocks by clicking on anyone of the 3 lower cubes.\n Any value above 0 will creat list of blocks you can scroll through "
                    }
                }
            }
        }
    }
};