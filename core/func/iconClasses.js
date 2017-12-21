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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// This library provides classes to support the formation of icons: icons are areas whose creation is initiated by one area, and they're embedded in a larger area, so as not to be clipped
// by the content frame of their creator.  The creator defines a child which inherits Icon (directly or indirectly). It is the expressionOf this child, and the referredOf is its 
// embedding area (typically, this would be the ScreenArea, to offer minimal clipping of the icon).
//
// This library offers a set of classes to support different types of icons: for example: tooltips, and drop-down menus. It also offers a set of classes inheriting to support
// different conditions under which their icon area is to be created (e.g. in response to hovering over it, a mouseEvent, etc.).
////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <iconDesignClasses.js>
// %%constantfile%%: <positioningPrioritiesConstants.js>

var classes = {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines the iconEmbedding defined in myApp as a partner. It is used below to specify the iconEmbedding as the referredOf, and embedding of, different icons. 
    // A class defining a child which inherits from Icon may inherit this class to define its partner in the formation of Icon, or it may specify another partner.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PartnerWithIconEmbedding: {
        partner: [{ myApp: { iconEmbedding: _ } }, [me]]
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class produces an icon for the duration of the operation on it. By default, while tmd is true.
    // It inherits Tmdable and its API (including the different modifiers (shift/ctrl/etc)).
    //
    // API: 
    // Inheriting class should define in a qualifier for { createIconWhileInOperation: true } a child who inherits Icon. This child, being an intersection area, 
    // should have a partner definition (e.g. the default PartnerWithIconEmbedding class).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    IconableWhileInOperation: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createIconWhileInOperation: [{ tmd: _ }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "Operationable", "Tmdable"),
            context: {
                // Operationable param
                myOperationInProgress: [{ tmd: _ }, [me]]
            }
        },
        {
            qualifier: { createIconWhileInOperation: true },
            children: {
                iconWhileInOperation: {
                    "class": "PartnerWithIconEmbedding"
                    // description: see inheriting classes
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the basic Icon class: It's embedded in its referred parent, and its content position is defined by its frame's position.
    // If its confineIconToArea context label is true (the default case), it inherits ConfinedToArea (with the default confinement, to iconEmbedding).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Icon: o(
        { // variant-controller
            qualifier: "!",
            context: {
                confineIconToArea: true,
                aboveMyExpressionOf: true
            }
        },
        {
            "class": o("GeneralArea", "BlockMouseEvent"),
            context: {
                myIconable: [expressionOf]
            },
            embedding: "referred",
            independentContentPosition: false,
            propagatePointerInArea: "expression",

            // intersection areas currently inherit the transition of their expressionOf. to avoid that, we set it to 0.
            // this solves such problems as the icon created on dragging a SolutionSetItem lagging behind the pointer, or a DropDownMenu in the UDF
            // flying in from the left.
            display: {
                transitions: {
                    left: 0,
                    top: 0
                }
            }
        },
        {
            qualifier: { confineIconToArea: true },
            "class": "ConfinedToArea"
        },
        {
            qualifier: { aboveMyExpressionOf: true },
            "class": "AboveMyExpressionOf"
        },
        {
            qualifier: { aboveMyExpressionOf: false },
            "class": "BelowMyExpressionOf"
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is for Icon which appears above the App's zTop label. 
    // Pop-ups of various sorts would inherit this class, so as to ensure they're z-higher than other areas in its vicinity
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    IconAboveAppZTop: {
        "class": o("Icon", "AboveAppZTop")
    },


    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // API:
    // 1. inheriting class should provide the description for iconWhileInOperation in a { createIconWhileInOperation: true } variant 
    //    (otherwise it will be a child that exists even when dragged is false). This description will typically include an inheritance of DraggableIcon.   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    IconableWhileDraggableOnMove: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createIconWhileInOperation: [{ draggedMoved: _ }, [me]]
            }
        },
        { // default
            "class": o("DraggableOnMove", "IconableWhileInOperation"),
            context: {
                // override DraggableOnMove params: we are not dragging this area
                // but rather creating an icon when the user attempts to drag it.
                horizontallyDraggable: false,
                verticallyDraggable: false
            }
        }
    ),


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is for an Icon that's above the App's zTop label, and which also maintains a minimum offset from the pointer. Used for icons denoting drag&drop operations.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableIcon: {
        "class": o("IconAboveAppZTop", "MinOffsetFromPointer", "ModifyPointerDragging"),
        context: {
            moShipAnchorHorizontalOffset: -5,
            moShipAnchorVerticalOffset: -5
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Tooltip Classes 
    // A tooltip appears when hovering over an area, typically to convey some additional information about its content or nature.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting area to produce a tooltip when being hovered over.
    // 
    // API: 
    // 1. tooltipText: the text to appear inside the tooltip. If none is provided, a default string will be displayed in the tooltip.
    // 2. defaultTooltipText: default value provided.
    // 3. tooltipHorizontalAnchor/tooltipVerticalAnchor: posPoints to be used by the tooltipRoot to anchor to (or get as close as possible). 
    //    default provided. To override, use atomic(<posPoint>). 
    //    Note the use element:[me], to ensure that the areaRef to the Tooltipable area is passed on to the TooltipRoot, in its projection 
    //    of the posPoints (without it, its [me] would be interpreted as the TooltipRoot itself!).
    // 4. verticalOffsetToTooltip/horizontalOffsetToTooltip
    // 5. createTooltip: equals inArea, by default. inheriting class may override this (e.g. inArea that's also a function of z-index, etc.)
    // 6. tooltipBelow: will the Tooltip appear below or above the Tooltipable. Prefers to appear below, unless there's not enough vertical space.
    // 7. tooltipTimerOn: time (seconds) till appearance of tooltip.
    // 8. tooltipDuration: duration (seconds) of tooltip's appearance. default: tooltip remains on indefinitely.
    // 9. tooltipPositionBasedOnPointer: should the tooltip be based on the pointer's position when it entered Tooltipable or on:
    //    tooltipableVerticalAnchor / tooltipableHorizontalAnchor (default values provided)
    // 10. createTooltipAnyway: false, by default. If true, inheriting class should define tooltipText as appData.
    // 11. allowMultipleConcurrentTooltips: false by default. If true, multiple Tooltips can be created under the pointer's position.
    // 12. tooltipEditable: not defined, so false by default. controls the editability of TooltipBody
    // 13. textualTooltip: true, by default. if false, inheriting class should provide the embedded areas that display some content.
    //     note that in that case, TooltipBody inherits MinWrap.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Tooltipable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createTooltip: [{ defaultTooltipableCreateTooltip: _ }, [me]],
                tooltipPositionBasedOnPointer: [{ defaulttooltipPositionBasedOnPointer: _ }, [me]],
                textualTooltip: true
            }
        },
        { // default
            "class": o("GeneralArea", "Tmdable"),
            context: {
                myTooltip: [
                    { myTooltipable: [me] },
                    [areaOfClass, "Tooltip"]
                ],
                myTooltipBody: [
                    { myTooltipable: [me] },
                    [areaOfClass, "TooltipBody"]
                ],

                "*createTooltipAnyway": [{ initCreateTooltipAnyway: _ }, [me]],
                initCreateTooltipAnyway: false,

                // tooltipEditable: false, //controls the editability of TooltipBody
                "*tooltipEditInputText": false, // tooltip's body, which inherits TextInput, will be a writable reference to this NPAD
                tooltipText: [{ defaultTooltipText: _ }, [me]],

                tooltipTimerOn: 1, // seconds till tooltip appears
                tooltipDuration: Number.POSITIVE_INFINITY,
                tooltipTimerOff: [plus, [{ tooltipTimerOn: _ }, [me]], [{ tooltipDuration: _ }, [me]]],
                allowMultipleConcurrentTooltips: false,

                tooltipMaxWidth: [{ fsPosConst: { tooltipMaxWidth: _ } }, [globalDefaults]],

                hoveringOverTooltipBody: [
                    { inArea: true },
                    [{ myTooltipBody: _ }, [me]]
                ],

                tmdableContinuePropagation: true, // override Tmdable default: to allow this class to act based on tmd, and yet not prevent others (z-lower)
                // from receiving the mouseDown
                // by default tooltip is at the bottom and left aligned with the 
                // center of the tooltipable
                defaulttooltipPositionBasedOnPointer: false,

                defaultTooltipableCreateTooltip: o(
                    [and, // either when inFocus and the tooltipTimerOn has elapsed 
                        // (turned off when tooltipTimerOff lapses, if specified)
                        o(
                            // if we allow multiple concurrent tooltips, that's one way to satisfy this OR.
                            [{ allowMultipleConcurrentTooltips: _ }, [me]],
                            // otherwise, we need to make sure that this area is the first (highest z) Tooltipable area under 
                            // the pointer. this is to ensure that there will be at most one Tooltip created at any give moment. 
                            [
                                [me],
                                [first,
                                    [
                                        [areaOfClass, "Tooltipable"],
                                        [areasUnderPointer]
                                    ]
                                ]
                            ]
                        ),
                        [{ inFocus: _ }, [me]],
                        [not, [{ editInputText: _ }, [me]]],
                        [{ tooltipText: _ }, [me]], // i.e. a string is defined

                        [not, [{ tmd: _ }, [me]]],
                        [not, [{ myApp: { tkd: _ } }, [me]]],

                        [cond,
                            [equal,
                                [{ tooltipDuration: _ }, [me]],
                                Number.POSITIVE_INFINITY
                            ],
                            o(
                                { // if indefinite duration, then turn on the tooltip when [time] fires
                                    on: true,
                                    use: [greaterThan,
                                        [time,
                                            [{ inArea: _ }, [me]],
                                            [{ tooltipTimerOn: _ }, [me]]
                                        ],
                                        0
                                    ]
                                },
                                {
                                    on: false,
                                    use: [ // if the duration is limited: turn off after tooltipTimerOff seconds 
                                        Rco([{ tooltipTimerOn: _ }, [me]], [{ tooltipTimerOff: _ }, [me]]),
                                        [time,
                                            [{ inArea: _ }, [me]],
                                            [{ tooltipTimerOn: _ }, [me]],  // interval
                                            [{ tooltipTimerOff: _ }, [me]]  // max
                                        ]
                                    ]
                                }
                            )
                        ]
                    ],
                    [{ hoveringOverTooltipBody: _ }, [me]], // or when hovering over the tooltip's body.
                    [{ createTooltipAnyway: _ }, [me]]
                    //[{ beingEdited: _ }, [{ myTooltipBody: _ }, [me]]]
                ),

                tooltipHorizontalAnchor: {
                    element: [me],
                    label: "tooltipHorizontalAnchor"
                },
                tooltipVerticalAnchor: {
                    element: [me],
                    label: "tooltipVerticalAnchor"
                },
                verticalOffsetToTooltip: 0,
                horizontalOffsetToTooltip: 0
            },
            propagatePointerInArea: o(),
        },
        {
            qualifier: { createTooltip: true },
            context: {
                tooltipBelow: [greaterThan,
                    [offset,
                        {
                            label: "bottomOfTooltipWhenBelow"
                        },
                        {
                            element: [{ myTooltip: { confinedToArea: _ } }, [me]],
                            type: "bottom"
                        }
                    ],
                    0
                ]
            },
            children: {
                tooltip: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "Tooltip"
                    }
                }
            },
            position: {
                labelBottomOfTooltipWhenBelow: {
                    pair1: {
                        point1: { type: "bottom" },
                        point2: { label: "bottomOfTooltipWhenBelow" }
                    },
                    pair2: {
                        point1: {
                            element: [{ children: { tooltip: _ } }, [me]],
                            type: "top"
                        },
                        point2: {
                            element: [{ children: { tooltip: _ } }, [me]],
                            type: "bottom"
                        }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { tooltipPositionBasedOnPointer: true },
            context: {
                // these two transient appData context labels are used to record the pointer's position when it enters the area. the tooltip will be positioned relative to this
                // point. once the pointer exits, the area, the tooltip vanishes. next time the pointer enters the area, its first position in it will once again be recorded.
                // note we use transient appData as we don't want this persisted. also note that the value maintained is an offset relative to the tooltipable area, which ensures
                // that even if two users work off of screens of different dimensions, the tooltip will be positioned in the same position relative to the tooltipable area.
                "*pointerLeftAtCreateTooltip": 0,
                "*pointerTopAtCreateTooltip": 0,
            },
            write: {
                onTooltipableCreateTooltip: {
                    upon: [{ createTooltip: _ }, [me]],
                    true: {
                        recordPointerLeft: {
                            to: [{ pointerLeftAtCreateTooltip: _ }, [me]],
                            merge: [offset,
                                {
                                    element: [me],
                                    type: "left"
                                },
                                {
                                    element: [pointer],
                                    type: "left"
                                }
                            ]
                        },
                        recordPointerTop: {
                            to: [{ pointerTopAtCreateTooltip: _ }, [me]],
                            merge: [offset,
                                {
                                    element: [me],
                                    type: "top"
                                },
                                {
                                    element: [pointer],
                                    type: "top"
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { createTooltip: true, tooltipPositionBasedOnPointer: true },
            context: {
                verticalOffsetToTooltip: [{ generalDesign: { tooltipBodyShadowDimension: _ } }, [globalDefaults]] // override Tooltipable default def
            },
            position: {
                tooltipHorizontalAnchorDefinition: {
                    point1: { type: "left" },
                    point2: [{ tooltipHorizontalAnchor: _ }, [me]],
                    equals: [{ pointerLeftAtCreateTooltip: _ }, [me]]
                },
                tooltipVerticalAnchorDefinition: {
                    point1: { type: "top" },
                    point2: [{ tooltipVerticalAnchor: _ }, [me]],
                    equals: [{ pointerTopAtCreateTooltip: _ }, [me]]
                }
            }
        },
        {
            qualifier: { createTooltip: true, tooltipPositionBasedOnPointer: false },
            context: {
                tooltipableHorizontalAnchor: { type: "right", content: true }
            },
            position: {
                tooltipHorizontalAnchorLeftOfHCF: {
                    point1: [{ tooltipHorizontalAnchor: _ }, [me]],
                    point2: [{ tooltipableHorizontalAnchor: _ }, [me]],
                    min: 0
                },
                equateEitherHCF: {
                    point1: [{ tooltipHorizontalAnchor: _ }, [me]],
                    point2: [{ tooltipableHorizontalAnchor: _ }, [me]],
                    equals: 0,
                    orGroups: { label: "tooltipableHorizontalAnchor" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                tooltipVerticalAnchorDefinition: {
                    point1: [{ tooltipableVerticalAnchor: _ }, [me]],
                    point2: [{ tooltipVerticalAnchor: _ }, [me]],
                    equals: 0
                }
            }
        },
        {
            qualifier: { createTooltip: true, tooltipPositionBasedOnPointer: false, tooltipHorizontalPositionBasedOnContent: true },
            context: {
                tooltipableHorizontalAnchor: { type: "horizontal-center", content: true }, // override definition in variant above
                horizontalContentAnchorForTooltip: [merge,
                    { content: true },
                    [{ tooltipableHorizontalAnchor: _ }, [me]]
                ]
            },
            position: {
                tooltipHorizontalAnchorLeftOfHCC: {
                    point1: [{ tooltipHorizontalAnchor: _ }, [me]],
                    point2: [{ horizontalContentAnchorForTooltip: _ }, [me]],
                    min: 0
                },
                equateOrHCC: {
                    point1: [{ tooltipHorizontalAnchor: _ }, [me]],
                    point2: [{ horizontalContentAnchorForTooltip: _ }, [me]],
                    equals: 0,
                    orGroups: { label: "tooltipableHorizontalAnchor" },
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: { createTooltip: true, tooltipPositionBasedOnPointer: false, tooltipBelow: true },
            context: {
                tooltipableVerticalAnchor: { type: "bottom", content: true }
            }
        },
        {
            qualifier: { createTooltip: true, tooltipPositionBasedOnPointer: false, tooltipBelow: false },
            context: {
                tooltipableVerticalAnchor: { type: "top", content: true }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines an Tooltipable area with an editable tooltip.
    // API:
    // 1. defaultTooltipText: override Tooltipable's use - here we use it as the second parameter for mergeWrite.
    // 2. tooltipTextCore: default provided. May be overridden, e.g. when the tooltip displays some user-specified content, plus some additional app-defined 
    //    content - for example, an overlay's full name, and its selections are app-defined, whereas the user can add to that free text.
    // 3. tooltipDisplaysMeaningfulInfo: default definition provided.
    // 4. createTooltipAnyway: default false
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    EditableTooltipable: o(
        { // default
            "class": "Tooltipable",
            context: {
                tooltipHorizontalPositionBasedOnContent: true, // set flag for Tooltipable
                // allowWritingInput: true, // override TextInput default definition through TooltipBody
                defaultTooltipText: "<User-Defined Tooltip>",
                "^tooltipTextAppData": o(),

                // the default def for tooltipText. Inheriting classes may override, e.g. when createTooltipAnyway is false
                // and some addditional, app-defined content, is to be merged into it (e.g. UDF's formula)
                tooltipTextCore: [mergeWrite,
                    [{ tooltipTextAppData: _ }, [me]],
                    [{ defaultTooltipText: _ }, [me]]
                ],
                tooltipText: [{ tooltipTextCore: _ }, [me]],
                tooltipEditable: [{ createTooltip: _ }, [me]], //tooltip is editable when visible                
                defaultTooltipDisplaysMeaningfulInfo: [{ tooltipText: _ }, [me]],
                tooltipDisplaysMeaningfulInfo: [{ defaultTooltipDisplaysMeaningfulInfo: _ }, [me]],
                defaultTextInputTooltipableCreateTooltip: o(
                    [{ createTooltipAnyway: _ }, [me]],
                    [and,
                        [not, [{ createTooltipAnyway: _ }, [me]]],
                        [{ defaultTooltipableCreateTooltip: _ }, [me]],
                        // no point in showing a tooltip which merely shows the same text as the Tooltipable
                        [{ tooltipDisplaysMeaningfulInfo: _ }, [me]]
                    ]
                )
            }
        },
        {
            qualifier: { createTooltipAnyway: true },
            write: {
                onEditableTooltipableMouseDownElsewhere: {
                    upon: o(
                        [mouseDownNotHandledBy,
                            o([me], [{ myTooltipBody: _ }, [me]])
                        ],
                        enterEvent,
                        escEvent
                    ),
                    true: {
                        lowerCreateTooltipAnyway: {
                            to: [{ createTooltipAnyway: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is to be inherited by the actual tooltip.
    // It inherits: 
    // 1. IconAboveAppZTop so as to make it z-higher than the neighboring areas. 
    // 2. MinWrap its embedded TooltipBody (which eventually will have its dimension be a function of the text it displays), and the TooltipRoot).  
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Tooltip: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tooltipBelow: [{ tooltipBelow: _ }, [expressionOf]]
            }
        },
        { // default
            "class": o("ConfinedToArea",
                "IconAboveAppZTop",
                "MinWrap"),
            context: {
                myTooltipable: [expressionOf],
                bodyShadowDimension: [{ generalDesign: { tooltipBodyShadowDimension: _ } }, [globalDefaults]],
                minWrapLeft: 0,
                minWrapRight: [{ bodyShadowDimension: _ }, [me]],
                minWrapTop: 0,
                minWrapBottom: [{ bodyShadowDimension: _ }, [me]],
                color: [{ iconDesign: { tooltipColor: _ } }, [globalDefaults]]
            },
            children: {
                body: {
                    description: {
                        "class": "TooltipBody"
                    }
                },
                root: {
                    description: {
                        "class": "TooltipRoot"
                    }
                }
            }
        },
        {
            qualifier: { tooltipBelow: false },
            position: {
                connectBodyToRoot: {
                    point1: {
                        element: [{ children: { body: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { root: _ } }, [me]],
                        type: "top"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { tooltipBelow: true },
            position: {
                connectBodyToRoot: {
                    point1: {
                        element: [{ children: { root: _ } }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        element: [{ children: { body: _ } }, [me]],
                        type: "top"
                    },
                    equals: 0
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    // This class is embedded in the Tooltip. It is the class that displays the tooltip's content.
    // Typically, this would be simple text. if textualTooltip is false, the inheriting class should provide the embedded areas that will display content
    ////////////////////////////////////////////////////////////////////////
    TooltipBody: o(
        { // variant-controller
            qualifier: "!",
            context: {
                textualTooltip: [{ myTooltipable: { textualTooltip: _ } }, [me]],
                editable: [{ myTooltipable: { tooltipEditable: _ } }, [me]]
            }
        },
        { // default
            "class": o("TooltipBodyDesign", "GeneralArea", "BlockMouseEvent"),
            context: {

                myTooltipable: [{ myTooltipable: _ }, [embedding]],
                horizontalMarginFromContent: [densityChoice, [{ fsPosConst: { tooltipHorizontalMargin: _ } }, [globalDefaults]]],
                verticalMarginFromContent: [densityChoice, [{ fsPosConst: { tooltipVerticalMargin: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { textualTooltip: true },
            "class": "DisplayDimension",
            context: {
                // hint to "DisplayDimension" - opt to have the width approximate
                //  'myTooltipable.tooltipMaxWidth'
                displayDimensionMaxWidth: [
                    { myTooltipable: { tooltipMaxWidth: _ } },
                    [me]
                ]
            }
        },
        {
            qualifier: {
                textualTooltip: true,
                editable: false
            },
            context: {
                displayText: [{ myTooltipable: { tooltipText: _ } }, [me]]
            }
        },
        {
            qualifier: {
                textualTooltip: true,
                editable: true
            },
            "class": "TextInput",
            context: {
                // TextInput params:
                // backgroundColor: override the value defined by TextInputDesign, which itself overrides TooltipBodyDesign in the default clause
                editInputText: [{ myTooltipable: { tooltipEditInputText: _ } }, [me]],
                inputAppData: [{ myTooltipable: { tooltipTextCore: _ } }, [me]],
                placeholderInputText: [{ myTooltipable: { defaultTooltipText: _ } }, [me]],

                backgroundColor: [{ color: _ }, [embedding]]
            },
            write: {
                onTooltipBodyMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        createTooltip: {
                            to: [{ myTooltipable: { createTooltipAnyway: _ } }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                textualTooltip: true,
                editable: true,
                editInputText: false
            },
            context: {
                displayText: [{ myTooltipable: { tooltipText: _ } }, [me]]
            }
        },
        {
            qualifier: { textualTooltip: false },
            "class": "MinWrap",
            context: {
                minWrapLeft: [{ horizontalMarginFromContent: _ }, [me]],
                minWrapRight: [{ horizontalMarginFromContent: _ }, [me]],
                minWrapTop: [{ verticalMarginFromContent: _ }, [me]],
                minWrapBottom: [{ verticalMarginFromContent: _ }, [me]]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the Tooltip. It is the element by which the tooltip is positioned relative to its anchor position.
    // Currently, it has 0 dimensions!
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TooltipRoot: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tooltipBelow: [{ tooltipBelow: _ }, [embedding]]
            }
        },
        { // default
            "class": o("TooltipRootDesign", "MinOffsetFromAnchor"),
            context: {
                myTooltipable: [{ myTooltipable: _ }, [embedding]],
                // params for MinOffsetFromAnchor: minimizing the offset between the horizontal-center/bottom of the TooltipRoot and the tooltipHorizontalAnchor/tooltipVerticalAnchor 
                // of the Tooltipable area (by default, it's horizontal-center/top).
                moAnchorHorizontalPoint: [{ myTooltipable: { tooltipHorizontalAnchor: _ } }, [me]],
                moAnchorVerticalPoint: [{ myTooltipable: { tooltipVerticalAnchor: _ } }, [me]],
                moShipAnchorVerticalOffset: [{ myTooltipable: { verticalOffsetToTooltip: _ } }, [me]],
                moShipAnchorHorizontalOffset: [{ myTooltipable: { horizontalOffsetToTooltip: _ } }, [me]],
                moShipHorizontalPoint: atomic({ type: "left" })
            },
            position: {
                width: 0,
                height: 0,
                // the entire Tooltip is typically confined to the IconEmbedding, so it if happens to push against one of the sides of the IconEmbedding, that constraint would overcome the 
                // Tooltip's preference to have its left align with the left of the TooltipBody
                attachToTooltipBody: {
                    point1: { type: "left" },
                    point2: {
                        element: [{ children: { body: _ } }, [embedding]],
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanMouseAttachment // should be weaker than the attachment of MinOffsetFromAnchor
                }
            }
        },
        {
            qualifier: { tooltipBelow: false },
            context: {
                moShipVerticalPoint: atomic({ type: "bottom" })
            }
        },
        {
            qualifier: { tooltipBelow: true },
            context: {
                moShipVerticalPoint: atomic({ type: "top" })
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Tooltip Classes 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DropDown Menu Classes 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting area to create a dropdown menu, and to store the last selection made using that menu.
    // Its children are:
    // 1. menu, which should inherit DropDownMenu (though, this being an Icon, it is embedded in IconEmbedding, and not in DropDownMenuable).
    // 2. DropDownMenuShowControl: the controller embedded in the DropDownMenuable which opens/closes the dropdown menu.
    //
    // API: 
    // 1. enableDropDownMenuable: boolean, true by value. When false, the dropDown does not respond to mouse events.
    // 2. showControl: true, by default. Does this DropDownMenuable area display a DropDownMenuShowControl
    // 3. showBorder: true, by default. Does the DropDownMenuShowControl displays a background color?
    // 4. defineShowControlBackgroundColor: true, by default. Does this DropDownMenuable area display a border?
    // 5. dropDownMenuLogicalSelectionsOS: os of strings representing the different logical values. We assume no repetitions.
    // 6. storeDropDownMenuSelection: should this class store the dropDownMenuSelection as appData (or as a writableRef)
    // 7. dropDownMenuLogicalSelection: a writable ref denoting the logical selection made. The associated appData is initialized to o(). 
    // 8. dropDownMenuDisplaySelectionsOS: os of strings representing the different values to be displayed. these are mapped, 1:1, to the 
    //    dropDownMenuLogicalSelectionsOS. by default, this equates dropDownMenuLogicalSelectionsOS.
    // 9. dropDownMenuTextForNoSelection: a default string to be displayed when dropDownMenuLogicalSelection equals o().
    // 10. displayMenuSelection: should this class display the menu selection, if it is available (or dropDownMenuTextForNoSelection otherwise).
    // 11. displayDropDownMenuSearchBox: boolean flag, true by default. does this menu display a search box that allows to narrow the list of values displayed in the
    // 12. openMenuAtTop: boolean. should the menu open at its top, or at its last scrolled location. true by default.
    // 13. note: the inheriting class is also responsible for specifying its dimensions.
    // 14. displayDropDownShowControl: should this class display the UX elements of the dropDown itself (the frame, the arrow). true, by default.
    // 15. dropDownMenuShowControlBackgroundColor / dropDownMenuShowControlTriangleColor: default values provided in DropDownMenuableDesign
    // 16. dropDownMenuSearchBoxPlaceholderInputText
    // 17. immunityFromClosingDropDownMenuOnMouseDown: inheriting class can provide areaRef of areas that can take a mouseDown without closing the dropDownMenu
    // 18. osForDropDownMenuDisplaySelection: dropDownMenuDisplaySelectionsOS, by default. inheriting class may override (e.g. PreloadedDBControlsDropDownMenuable)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                storeDropDownMenuSelection: true,
                "^dropDownMenuLogicalSelection": o(),
                "*createDropDownMenu": false,
                showBorder: true,
                defineShowControlBackgroundColor: true,
                showControl: true,
                displayMenuSelection: true,
                openMenuAtTop: true,
                displayDropDownShowControl: true,
                enableDropDownMenuable: true
            }
        },
        { // default
            "class": o("DefaultDisplayText", "GeneralArea", "DropDownMenuControl"),
            context: {
                dropDownMenuTextForNoSelection: [concatStr,
                    o(
                        [{ myApp: { selectStr: _ } }, [me]],
                        [{ myApp: { aStr: _ } }, [me]],
                        [{ myApp: { valueEntityStr: _ } }, [me]]
                    ),
                    " "
                ],
                dropDownMenuDisplaySelectionsOS: [{ dropDownMenuLogicalSelectionsOS: _ }, [me]],

                osForDropDownMenuDisplaySelection: [{ dropDownMenuDisplaySelectionsOS: _ }, [me]],

                dropDownMenuDisplaySelection: [pos, // look up the index of the logical selection, in the logicalSelections os, and use it to find the corresponding displaySelection
                    [index,
                        [{ dropDownMenuLogicalSelectionsOS: _ }, [me]],
                        [{ dropDownMenuLogicalSelection: _ }, [me]]
                    ],
                    [{ osForDropDownMenuDisplaySelection: _ }, [me]]
                ],

                dropDownMenuableUniqueID: "___DropDownMenuable___",
                "*uniqueIDLineInFocus": [{ dropDownMenuableUniqueID: _ }, [me]],
                // hoveredOverDropDownMenuLines allows us to keep track of whether we already hovered over one of the lines of an open menu. 
                // if so, when we move out of it, we should reset its uniqueIDLineInFocus. if not, then we should let it be (it could be set to the line representing the value selected).
                "*hoveredOverDropDownMenuLines": false,

                myDropDownMenuable: [me], // to simplify queries
                displayDropDownMenuSearchBox: true
            }
        },
        {
            qualifier: { displayDropDownShowControl: true },
            children: {
                dropDownMenuShowControl: {
                    description: {
                        "class": "DropDownMenuShowControl"
                    }
                }
            }
        },
        {
            qualifier: {
                displayMenuSelection: true,
                dropDownMenuLogicalSelection: false
            },
            context: {
                displayText: [{ dropDownMenuTextForNoSelection: _ }, [me]]
            }
        },
        {
            qualifier: {
                displayMenuSelection: true,
                dropDownMenuLogicalSelection: true
            },
            context: {
                displayText: [{ dropDownMenuDisplaySelection: _ }, [me]]
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        // provided by inheriting class: should inherit DropDownMenu
                    }
                }
            },
            write: {
                // two ways to close a dropDownMenu: a mouseDown outside its elements, or an ESC
                onCloseMenu: {
                    upon: o(
                        [mouseDownNotHandledBy,
                            o(
                                [
                                    { myDropDownMenuable: [me] },
                                    o(
                                        [areaOfClass, "DropDownMenuElement"],
                                        [areaOfClass, "DropDownMenuControl"]
                                    )
                                ],
                                [{ immunityFromClosingDropDownMenuOnMouseDown: _ }, [me]]
                            )
                        ],
                        escEvent
                    ),
                    true: {
                        closeMenu: {
                            to: [{ createDropDownMenu: _ }, [me]],
                            merge: false
                        },
                        resetLineInFocus: {
                            to: [{ uniqueIDLineInFocus: _ }, [me]],
                            merge: [{ dropDownMenuableUniqueID: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the dropdown menu, which can be created by a DropDownMenuable.
    //
    // It inherits:
    // 1. IconAboveAppZTop: an Icon (as such, embedded in IconEmbedding), and z-higher than its neighboring areas.
    // 
    // This class embeds:
    // 1. DropDownMenuList
    // 2. DropDownMenuSearchBox (optional)
    //
    // API (very crude):
    // A few params referred by the emebedded DropDownMenuList:
    // 1. menuLineHeight: default value provided
    // 2. maxNumLines: the maximum number of lines to be displayed in a dropDown menu. If warranted, a scrollbar is created.
    //    default: generalPosConst.dropDownMenuMaxNumLines. 
    // 3. spacingBetweenMenuLines: default provided.
    // 4. a scrollbar object of params (accessed by the embedded DropDownMenuList, which inherits VerticalJITSnappableController). default provided.
    // 5. horizontalMarginFromSearchBox: default provided    
    // 6. offsetFromDropDownMenuableBottom / offsetFromDropDownMenuableLeft / offsetFromDropDownMenuableRight: default provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenu: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enableSearchBox: [{ myDropDownMenuable: { displayDropDownMenuSearchBox: _ } }, [me]],
                defaultDropDownMenuPositioningLeft: true,
                defaultDropDownMenuPositioningRight: true,
                defaultDropDownMenuPositioningTop: true
            }
        },
        { // default
            "class": o("GeneralArea", "IconAboveAppZTop"),
            context: {
                myDropDownMenuable: [expressionOf],

                scrollbar: { // accessed by the embedded DropDownMenuList, as it inherits VerticalJITSnappableController
                    showPrevNextButtons: false,
                    showViewBackFwdButtons: false,
                    showBeginningEndDocButtons: false,
                    attachToView: "beginning",
                    attachToViewOverlap: true
                },
                menuLineHeight: generalPosConst.heightOfDropDownMenuLine, // default value
                maxNumLines: generalPosConst.dropDownMenuMaxNumLines, // default value
                spacingBetweenMenuLines: 0, // default value
                horizontalMarginFromSearchBox: 0,
                verticalMarginFromSearchBox: 0,

                offsetFromDropDownMenuableBottom: 0,
                offsetFromDropDownMenuableLeft: 0,
                offsetFromDropDownMenuableRight: 0
            },
            children: {
                dropDownMenuList: {
                    description: {
                        "class": "DropDownMenuList"
                    }
                },
                dropDownMenuElement: {
                    description: {
                        "class": "DropDownMenuElement"
                    }
                }
            },
            position: {
                // bottom: attached to its DropDownMenuList - constraint defined there.
            }
        },
        {
            qualifier: { defaultDropDownMenuPositioningTop: true },
            position: {
                topToDropDownMenuableBottom: {
                    point1: {
                        element: [{ myDropDownMenuable: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ offsetFromDropDownMenuableBottom: _ }, [me]]
                }
            }
        },
        {
            qualifier: { defaultDropDownMenuPositioningLeft: true },
            position: {
                leftToDropDownMenuable: {
                    point1: {
                        element: [{ myDropDownMenuable: _ }, [me]],
                        type: "left"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ offsetFromDropDownMenuableLeft: _ }, [me]]
                }
            }
        },
        {
            qualifier: { defaultDropDownMenuPositioningRight: true },
            position: {
                rightToDropDownMenuable: {
                    point1: {
                        element: [{ myDropDownMenuable: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "right"
                    },
                    // note: min, not equals!
                    min: [{ offsetFromDropDownMenuableRight: _ }, [me]]
                }
            }
        },
        {
            qualifier: { enableSearchBox: true },
            children: {
                searchbox: {
                    description: {
                        "class": "DropDownMenuSearchBox"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the dropdown menu's list - a *view* (not doc!) of the menu's list of items
    // The scrolling is continuous - no snapping to grid. Scrolling can be done using the scrollbar elements, or the up/down arrow keys.
    // hovering over a dropDownMenuLine gives it the focus, which means that it will be selected onEnter. the focus can be shifted across the lines by using the up/down arrows, and this is
    // a circular list - once we scroll the focus all the way to the first line, the next arrowUp will take us to the last line and give it the focus. similarly, when the focus is on 
    // the last line, the next arrowDown will take us to the first line, and give it the focus.
    //
    // It inherits:
    // 1. VerticalContMovableCASontroller: allows it to form a scrollbar if the 'document' it wishes to display is too long. 
    // 
    // This class embeds:
    // 1. an areaSet of dropDownMenu lines, each representing a possible selection.
    // 2. a scrollbar, in case of need.
    // 3. DropDownMenuElement: a transparent screen above the dropdown menu's embedded* areas - it processes the MouseDown and passes it through - enough to add it to the MouseDown's 
    //    handledBy os, which allows DropDownMenuable to know whether a MouseDown occurred *outside* the dropdown menu, in which case the menu is to be closed.
    //    Dev Note: alternatively, we could do away with this transparent screen, and instead inquire about any of the dropdown menu's embedded* in the handledBy os - could be considered 
    //    once queries are alive and well).
    // 4. scrollbar parameters, for the embedded scrollbar in a context object called scrollbar. Default provided.
    //    (showPrevNextButtons / showViewBackFwdButtons / showBeginningEndDocButtons / attachToView / attachToViewOverlap))
    // 
    // API:
    // 1. Inheriting class should have an areaSet called 'lines', and its description should inherit DropDownMenuLine
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuList: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // create a scrollbar if the docLength is greater than the maximum height allowed for the dropdown menu
                createScrollbar: [{ docLongerThanView: _ }, [me]],
                firstLineInFocus: [equal,
                    [{ uniqueIDLineInFocus: _ }, [me]],
                    [first, [{ allLineData: _ }, [me]]]
                ],
                lastLineInFocus: [equal,
                    [{ uniqueIDLineInFocus: _ }, [me]],
                    [last, [{ allLineData: _ }, [me]]]
                ],
                enableSearchBox: [{ enableSearchBox: _ }, [embedding]]
            }
        },
        { // default
            "class": o("GeneralArea", "VerticalJITSnappableController"),
            context: {
                myDropDownMenuable: [{ myDropDownMenuable: _ }, [embedding]],
                allLineData: [
                    s([{ mySearchBox: { currentSearchStr: _ } }, [me]]),
                    [{ myDropDownMenuable: { dropDownMenuDisplaySelectionsOS: _ } }, [me]]
                ],
                lineData: [pos,
                    [{ jitMovablesRange: _ }, [me]],
                    [{ allLineData: _ }, [me]]
                ],
                uniqueIDLineInFocus: [{ myDropDownMenuable: { uniqueIDLineInFocus: _ } }, [me]],
                roundRobinFocusableLineUniqueIDs: o(
                    //[{ myDropDownMenuable: { dropDownMenuableUniqueID: _ } }, [me]], // note the dropDownMenu itself isn't part of the round robin!
                    [{ allLineData: _ }, [me]]
                ),

                menuLineHeight: [{ menuLineHeight: _ }, [embedding]],
                maxNumLines: [{ maxNumLines: _ }, [embedding]],

                spacingBetweenMenuLines: [{ spacingBetweenMenuLines: _ }, [embedding]],
                // VerticalJITSnappableController params: 
                // view: [me] by default
                movables: [{ children: { lines: _ } }, [me]],
                movableSpacing: [{ spacingBetweenMenuLines: _ }, [me]],
                lengthOfJITElement: [plus,
                    [{ menuLineHeight: _ }, [me]],
                    [{ spacingBetweenMenuLines: _ }, [me]]
                ],
                movablesUniqueIDs: [{ allLineData: _ }, [me]],

                // the document here is a virtual entity - it extends form the top of the first line to the bottom of the last line.                
                scrollbar: [{ scrollbar: _ }, [embedding]],
            },
            children: {
                lines: {
                    data: [anonymize, [{ lineData: _ }, [me]]] // note: this is a JIT implementation, so has to be anonymized!
                    //description: Inheriting class should have its lines children inherit DropDownMenuLine
                },
                scrollbar: {
                    description: {
                        "class": "VerticalScrollbarContainerOfSnappable",
                        context: {
                            movableController: [embedding],
                            showPrevNextButtons: [{ scrollbar: { showPrevNextButtons: _ } }, [embedding]],
                            showViewBackFwdButtons: [{ scrollbar: { showViewBackFwdButtons: _ } }, [embedding]],
                            showBeginningEndDocButtons: [{ scrollbar: { showBeginningEndDocButtons: _ } }, [embedding]],
                            attachToView: [{ scrollbar: { attachToView: _ } }, [embedding]],
                            attachToViewOverlap: [{ scrollbar: { attachToViewOverlap: _ } }, [embedding]],
                            scrollbarMarginFromViewEndGirth: 0,
                            scrollbarMarginFromViewBeginningGirth: 0 // this one isn't currently used, but ready in case the scrollbar is moved to left of menu
                        }
                    }
                }
            },
            write: {
                onDropDownMenuInit: {
                    upon: [{ myDropDownMenuable: { openMenuAtTop: _ } }, [me]],
                    true: {
                        resetFiV: {
                            to: [{ specifiedFiVUniqueID: _ }, [me]],
                            merge: o()
                        }
                    }
                },
                onDropDownMenuUpArrowOrWheel: {
                    "class": "OnUpArrowOrWheel",
                    true: {
                        shiftFocusToPrev: {
                            to: [{ uniqueIDLineInFocus: _ }, [me]],
                            merge: [prevInCircularOS,
                                [{ roundRobinFocusableLineUniqueIDs: _ }, [me]],
                                [{ uniqueIDLineInFocus: _ }, [me]]
                            ]
                        }
                        // see variants below for additional actions
                    }
                },
                onDropDownMenuDownArrowOrWheel: {
                    "class": "OnDownArrowOrWheel",
                    true: {
                        shiftFocusToNext: {
                            to: [{ uniqueIDLineInFocus: _ }, [me]],
                            merge: [nextInCircularOS,
                                [{ roundRobinFocusableLineUniqueIDs: _ }, [me]],
                                [{ uniqueIDLineInFocus: _ }, [me]]
                            ]
                        }
                        // see variants below for additional actions
                    }
                }
            },
            position: {
                labelVirtualMenuMaxHeight: {
                    point1: { type: "top", content: true },
                    point2: { label: "virtualMaxHeight" },
                    equals: [minus,
                        [mul,
                            [plus,
                                [{ menuLineHeight: _ }, [me]],
                                [{ spacingBetweenMenuLines: _ }, [me]]
                            ],
                            [{ maxNumLines: _ }, [me]]
                        ],
                        // subtract the one excess spacing added to the calculation
                        [{ spacingBetweenMenuLines: _ }, [me]]
                    ]
                },
                labelVirtualBottomDoc: {
                    pair1: {
                        point1: { type: "top", content: true },
                        point2: { label: "virtualBottomDoc" }
                    },
                    pair2: {
                        point1: [{ beginningOfDocPoint: _ }, [me]],
                        point2: [{ endOfDocPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                // bottom is above the following three posPoint
                bottomAboveBottomOfApp: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myApp: _ }, [me]], type: "bottom" },
                    min: 0
                },
                bottomAboveVirtualMaxHeight: {
                    point1: { type: "bottom", content: true },
                    point2: { label: "virtualMaxHeight" },
                    min: 0
                },
                bottomAboveVirtualBottomDoc: {
                    point1: { type: "bottom", content: true },
                    point2: { label: "virtualBottomDoc" },
                    min: 0
                },
                // bottom should match one of the following three posPoint
                eitherAttachToBottomOfApp: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myApp: _ }, [me]], type: "bottom" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "dropDownMenuHeight" }
                },
                eitherAttachToVirtualMaxHeight: {
                    point1: { type: "bottom", content: true },
                    point2: { label: "virtualMaxHeight" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "dropDownMenuHeight" }
                },
                eitherAttachToVirtualBottomDoc: {
                    point1: { type: "bottom", content: true },
                    point2: { label: "virtualBottomDoc" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "dropDownMenuHeight" }
                },

                attachTop: {
                    point1: [cond,
                        [{ enableSearchBox: _ }, [me]],
                        o(
                            { on: true, use: { element: [{ mySearchBox: _ }, [me]], type: "bottom" } },
                            { on: false, use: { element: [embedding], type: "top" } }
                        )
                    ],
                    point2: { type: "top" },
                    equals: 0
                },
                left: 0,
                right: 0,
                bottom: 0
            }
        },
        {
            qualifier: { enableSearchBox: true },
            context: {
                mySearchBox: [{ children: { searchbox: _ } }, [embedding]]
            }
        },
        {
            qualifier: { firstLineInFocus: true },
            write: {
                onDropDownMenuUpArrowOrWheel: {
                    // "upon: see default clause above
                    true: {
                        scrollToEndOfDoc: {
                            to: [message],
                            merge: {
                                msgType: "EndOfDoc",
                                recipient: [me]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { firstLineInFocus: false },
            write: {
                onDropDownMenuUpArrowOrWheel: {
                    // "upon: see default clause above
                    true: {
                        scrollToPrev: {
                            to: [message],
                            merge: {
                                msgType: "Prev",
                                recipient: [me]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { lastLineInFocus: true },
            write: {
                onDropDownMenuDownArrowOrWheel: {
                    // "upon: see default clause above
                    true: {
                        scrollToBeginningOfDoc: {
                            to: [message],
                            merge: {
                                msgType: "BeginningOfDoc",
                                recipient: [me]
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { lastLineInFocus: false },
            write: {
                onDropDownMenuDownArrowOrWheel: {
                    // "upon: see default clause above
                    true: {
                        scrollToNext: {
                            to: [message],
                            merge: {
                                msgType: "Next",
                                recipient: [me]
                            }
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuSearchBox: {
        "class": o("DropDownMenuSearchBoxDesign", "GeneralArea", "SearchBox"),
        context: {
            myDropDownMenu: [embedding],
            myDropDownMenuable: [{ myDropDownMenu: { myDropDownMenuable: _ } }, [me]],
            // SearchBox param
            "^searchStr": o(), //keeping this local for now, need to move it up to [{ myApp: { allSearchBoxesFields: { X:_ } } }, [me]]
            realtimeSearch: true,
            searchControlHeight: [minus, [offset, { type: "top", content: true }, { type: "bottom", content: true }], 2],
            searchControlWidth: [plus,
                [{ searchControlHeight: _ }, [me]],
                [densityChoice, generalPosConst.searchBoxControlWidthIncrementWRTHeight]
            ],
            placeholderInputText: [{ myDropDownMenuable: { dropDownMenuSearchBoxPlaceholderInputText: _ } }, [me]],
            initEditInputText: true
        },
        write: {
            onDropwDownMenuSearchBoxInit: {
                upon: [{ myDropDownMenuable: { createDropDownMenu: _ } }, [me]],
                true: {
                    initSearchStr: {
                        to: [{ searchStr: _ }, [me]],
                        merge: o()
                    },
                    initEditInputText: {
                        to: [{ editInputText: _ }, [me]],
                        merge: [{ initEditInputText: _ }, [me]]
                    }
                }
            }
        },
        position: {
            top: [{ verticalMarginFromSearchBox: _ }, [embedding]],
            left: [{ horizontalMarginFromSearchBox: _ }, [embedding]],
            right: [{ horizontalMarginFromSearchBox: _ }, [embedding]],
            "content-height": [{ myDropDownMenu: { menuLineHeight: _ } }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows us to know whether the mouseDown was received by one of the areas within the dropDownMenu: the lines, scrollbars, buttons, etc, we cover it with 
    // DropDownMenuElement, a transparent screen.
    // in the DropDownMenuable, if the menu is open, we check on MouseDown events (any MouseDown events) whether they were processed by DropDownMenuElement or not. 
    // if so, then disregard the mouseDown; otherwise, close the dropdown menu.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuElement: {
        "class": "AboveSiblings",
        context: {
            myDropDownMenuable: [{ myDropDownMenuable: _ }, [embedding]] // to allow other classes to identify this DropDownMenuElement (e.g. see RatingCell)
        },
        position: {
            frame: 0
        },
        write: {
            forHandledBy: {
                "class": "OnMouseDown",
                true: {
                    continuePropagation: true
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a single possible selection in an open dropdown menu. By clicking on this area, the user stores the value it represents as the dropdown menu's selection 
    // (in practice stored by DropDownMenuable's writable reference). Making a selection also results in the dropdown menu closing.
    //
    // It inherits VerticalMovableInAS so that in case it is part of a scrollable document, it can be dragged vertically in order to scroll the document.
    //
    // API:
    // 1. dropDownMenuLogicalSelection: the AD that will store the selection made. default definition provide: myDropDownMenuable's dropDownMenuLogicalSelection.
    //    an example where we deviate from this default definition: the measureFunction dropDown in the histogram, where some selections translate to writing
    //    to one AD (histogram display mode), and other selections translate to another AD (the measure function, such as avg, sum, etc.)
    // 2. logicalSelection: default definition provided. the value that this menuLine will write to dropDownMenuLogicalSelection
    // 3. actOnEnterOrClick: boolean, true by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuLine: o(
        { // variant-controller
            qualifier: "!",
            context: {
                actOnEnterOrClick: true,
                storeDropDownMenuSelection: [{ myDropDownMenuable: { storeDropDownMenuSelection: _ } }, [me]],
                lineInFocus: [equal,
                    [{ myDropDownMenuList: { uniqueIDLineInFocus: _ } }, [me]],
                    [{ uniqueID: _ }, [me]]
                ],
                scrollbarAttachedToView: [{ myDropDownMenuList: { scrollbar: { attachToView: _ } } }, [me]],
                defaultDesign: false
            }
        },
        { // default
            "class": o("GeneralArea", "Operationable", "Tmdable", "MemberOfTopToBottomAreaOS", "VerticalJITSnappable"),
            context: {
                myDropDownMenuList: [embedding],
                myDropDownMenuable: [{ myDropDownMenuList: { myDropDownMenuable: _ } }, [me]],

                uniqueID: [{ param: { areaSetContent: _ } }, [me]], // also relied on by VerticalJITSnappable (see movableUniqueIDAttr)

                // MemberOfTopToBottomAreaOS: 
                spacingFromPrev: [{ myDropDownMenuList: { spacingBetweenMenuLines: _ } }, [me]],
                // VerticalJITSnappable param: 
                movableController: [{ myDropDownMenuList: _ }, [me]],
                // Operationable param:
                myOperationInProgress: [{ tmd: _ }, [me]], // so inFocus stays true during a mouseDown, to allow it to respond on the MouseClick

                displayText: [{ uniqueID: _ }, [me]],
                height: [{ menuLineHeight: _ }, [embedding]]
            },
            position: {
                height: [{ height: _ }, [me]]
            },
            write: {
                onDropDownMenuLineInArea: {
                    upon: [{ inArea: _ }, [me]],
                    true: {
                        setMeAsLineInFocus: {
                            to: [{ myDropDownMenuList: { uniqueIDLineInFocus: _ } }, [me]],
                            merge: [{ uniqueID: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                actOnEnterOrClick: true,
                lineInFocus: true
            },
            write: {
                onDropDownMenuLineEnterOrClick: {
                    upon: o(
                        enterEvent,
                        mouseClickEvent
                    ),
                    true: {
                        "class": "CloseMenu"
                    }
                }
            }
        },
        {
            qualifier: { storeDropDownMenuSelection: true },
            context: {
                dropDownMenuLogicalSelection: [{ myDropDownMenuable: { dropDownMenuLogicalSelection: _ } }, [me]],
                logicalSelection: [pos, // look up the index of uniqueID in the displaySelections os, and use it to find the corresponding logicalSelection, which we write.
                    [index,
                        [{ myDropDownMenuable: { dropDownMenuDisplaySelectionsOS: _ } }, [me]],
                        [{ uniqueID: _ }, [me]]
                    ],
                    [{ myDropDownMenuable: { dropDownMenuLogicalSelectionsOS: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: {
                actOnEnterOrClick: true,
                lineInFocus: true,
                storeDropDownMenuSelection: true
            },
            write: {
                onDropDownMenuLineEnterOrClick: {
                    // upon defined in { lineInFocus: true } variant above
                    true: {
                        selectMeInDropDownMenu: {
                            to: [{ dropDownMenuLogicalSelection: _ }, [me]],
                            merge: [{ logicalSelection: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { scrollbarAttachedToView: false },
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { scrollbarAttachedToView: "beginning" },
            position: {
                // attach to the scrollbar, which has a width of 0 if it isn't needed.
                leftConstraint: {
                    point1: {
                        element: [{ children: { scrollbar: _ } }, [embedding]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                },
                right: 0
            }
        },
        {
            qualifier: { scrollbarAttachedToView: "end" },
            position: {
                // attach to the scrollbar, which has a width of 0 if it isn't needed.
                left: 0,
                rightConstraint: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { scrollbar: _ } }, [embedding]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CloseMenu: {
        closeMenu: {
            to: [{ myDropDownMenuable: { createDropDownMenu: _ } }, [me]],
            merge: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myDropDownMenuable: default provided.
    // 2. enableDropDownMenuable: boolean, default provided
    // This class is the control for opening a dropdown menu. If the menu is open, clicking on this control will close it (as will a mouseDown elsewhere..).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuControl: o(
        { // default
            "class": "GeneralArea",
            context: {
                myDropDownMenuable: [me],
                enableDropDownMenuable: true
            }
        },
        {
            qualifier: { enableDropDownMenuable: true },
            write: {
                onDropDownMenuControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        createDropDownMenu: {
                            to: [{ myDropDownMenuable: { createDropDownMenu: _ } }, [me]],
                            merge: [not, [{ myDropDownMenuable: { createDropDownMenu: _ } }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is displayed on the right side of its DropDownMenuable.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropDownMenuShowControl: o(
        {
            //variant-controller
            qualifier: "!",
            context: {
                showBackground: [{ defineShowControlBackgroundColor: _ }, [embedding]]
            }
        },
        {
            "class": o("DropDownMenuShowControlDesign", "DropDownMenuControl"),
            context: {
                myDropDownMenuable: [embedding], // override DropDownMenuControl param
                enableDropDownMenuable: [{ myDropDownMenuable: { enableDropDownMenuable: _ } }, [me]],
                width: 20
            },
            propagatePointerInArea: "embedding", // as it has a background color, and we want the DropDownMenuable to be aware of the hover
            position: {
                "vertical-center": 0,
                right: 0,
                width: [{ width: _ }, [me]]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Modal Dialog Classes
    // A set of classes that allow the creation/destruction of a modal dialog - a dialog that offers one or more controls, one of which the user must select before they can go back 
    // to the application.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting area to create a modal dialog. The Inheriting class should define a write handler to act on the modal dialog's
    // controls. Typically, this would be defined based on upon: [{ enabledActModalDialogActControl:_ }, [me]] - see definitions below.
    // Important Note:
    // What to do if one wishes to deactivate the modal dialog, and allow the action controlled by it to continue uninterrupted?
    // The inheriting class should:
    // 1. comment out the { createModalDialog: true } variant
    // 2. replace the upon: [{ enabledActModalDialogActControl:_ }, [me]] with an 'upon' that looks directly at the source action - typically this
    //    would be the action that triggered the raising of *createModalDialog.
    //
    // API: 
    // 1. createModalDialog: the inheriting class should set the createModalDialog writable ref to true when the modal dialog is to be created.
    //    (the closing of the modal dialog is handled by its ModalDialogControls).
    // 2. The inheriting class should provide children:modalDialog, with a description object that inherits a class which inherits ModalDialog, 
    //    in the { createModalDialog: true } variant
    // 3. modalDialogActControl: default provided 
    // 4. enabledActModalDialogActControl: default provided. 
    // 5. The inheriting class should define in an upon: [{ enabledActModalDialogActControl:_ }, [me]] the actions to be taken upon confirmation.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*createModalDialog": false // note: not-persisted! a user should never reload to find a modal dialog from their previous session
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                modalDialogActControl: [areaOfClass, "OKCancelDialogOKControl"],
                enabledActModalDialogActControl: [
                    {
                        myModalDialogable: [me],
                        enabledActEvent: true
                    },
                    [{ modalDialogActControl: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    "class": "PartnerWithIconEmbedding"
                    // description: provided by inheriting class
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. createModalDialog: a writable reference. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CreateModalDialogOnClick: {
        write: {
            onCreateModalDialogOnClickMouseClick: {
                "class": "OnMouseClick",
                true: {
                    raiseCreateModalDialog: {
                        to: [{ createModalDialog: _ }, [me]],
                        merge: true
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the modal dialog itself.
    // 
    // API:
    // 1. Inheriting class should have at least one child which inherits ModalDialogControl in order to allow closing the dialog box.
    // 2. defaultPosition: positions the dialog box in the middle of the IconEmbedding (screenArea). If turned off, the inheriting area should position the modal dialog itself.
    //    true, by default.
    // 3. defaultAreaInFocus: inheriting class should provide the areaRef of the embedded class inheriting ModalDialogControl which is the default control 
    //    (i.e. the control that will process the keyboard Enter). default: [first, osOfAreasInFocus].
    // 4. showAttentionIcon: boolean, true by default. 
    // 5. minWidth/minHeight: default values provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialog: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultPosition: true,
                showAttentionIcon: true // see ModalDialog Design class
            }
        },
        { // default
            "class": o("ModalDialogDesign", "GeneralArea", "MinWrap", "IconAboveAppZTop", "AreaInFocusController"),
            context: {
                myModalDialogable: [expressionOf],
                minWrapAround: generalPosConst.modalDialogMinMarginAroundEmbeddedElements,

                myControls: [
                    { myDialog: [me] },
                    [areaOfClass, "ModalDialogControl"]
                ],
                // AreaInFocusController params:
                areaInFocusControllerActivated: true, // override default
                osOfAreasInFocus: [{ myControls: _ }, [me]],
                defaultAreaInFocus: [first, [{ osOfAreasInFocus: _ }, [me]]], // inheriting class may override this.
                minWidth: generalPosConst.modalDialogMinWidth,
                minHeight: generalPosConst.modalDialogMinHeight
            },
            position: {
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ minWidth: _ }, [me]]
                },
                minHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    min: [{ minHeight: _ }, [me]]
                }
            },
            stacking: {
                aboveModalDialogScreen: {
                    lower: [{ myApp: { children: { modalDialogScreen: _ } } }, [me]],
                    higher: [me]
                }
            }
        },
        {
            qualifier: { defaultPosition: true },
            position: {
                "class": "AlignCenterWithEmbedding"
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class offers a context label indicating whether a modal dialog exists.
    // The App class, for example, inherits it in order to determine whether to create the semi-transparent ModalDialogScreen which z-lies between the Modal Dialog and the application.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackModalDialog: o(
        { // variant-controller
            qualifier: "!",
            context: {
                modalDialogOn: [areaOfClass, "ModalDialog"]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is to be inherited by the controls of a modal dialog. Its associated ModalDialogable 'listens' to its enabledActEvent, and acts on it.
    // It inherits AreaInFocus so as to allow keyboard interactions.
    // 
    // API: 
    // 1. inheriting class should also define appearance for the modal dialog control in focus.
    // 2. displayText: the text to be displayed
    // 3. enabled: boolean. true, by default.
    // Note:
    // The associated ModalDialogable area should define a write handler to act on this class' enableActEvent
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogControl: {
        "class": o("ModalDialogControlDesign", "GeneralArea", "AreaInFocus", "ModalDialogElement"),
        context: {
            enabled: true,
            // AreaInFocus param
            myAreaInFocusController: [{ myDialog: _ }, [me]],

            actEvent: o(
                mouseClickEvent,
                [and,
                    [{ iAmTheAreaInFocus: _ }, [me]],
                    enterEvent
                ]
            ),
            // the ModalDialogable listens in on the enabledActEvent, for the actual work to be done!
            enabledActEvent: [and,
                [{ actEvent: _ }, [me]],
                [{ enabled: _ }, [me]]
            ]
        },
        position: {
            height: generalPosConst.modalDialogControlHeight,
            width: generalPosConst.modalDialogControlWidth
        },
        write: {
            onModalDialogControlActOrEsc: {
                upon: o(
                    [{ enabledActEvent: _ }, [me]],
                    escEvent
                ),
                true: {
                    resetAreaInFocusForMyController: {
                        to: [{ myAreaInFocusController: { areaInFocus: _ } }, [me]],
                        merge: [{ myAreaInFocusController: { defaultAreaInFocus: _ } }, [me]]
                    },
                    closeModalDialog: {
                        to: [{ createModalDialog: _ }, [expressionOf, [{ myAreaInFocusController: _ }, [me]]]],
                        merge: false
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides a semi-transparent screen z-between a modal dialog and the underlying application. 
    // It blocks mouse events, so as to force the user to make a selection in the 
    // modal dialog before continuing to interact with the application.
    // This class is emebdded in the App when a modal dialog exists.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogScreen: {
        "class": o(
            "AboveAppZTop", // to ensure that it's above App's zTop
            "BlockMouseEvent" // to prevent any mouse events from propagating to the underlying application
        ),
        position: {
            frame: 0
        },
        display: {
            background: designConstants.globalBGColor,
            opacity: designConstants.modalDialogBackgroundOpacity
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayCancelControl: boolean, true by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelModalDialog: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayCancelControl: true
            }
        },
        { // default
            "class": "ModalDialog",
            context: {
                myOKControl: [
                    { myDialog: [me] },
                    [areaOfClass, "OKCancelDialogOKControl"]
                ],
                // ModalDialog param
                defaultAreaInFocus: [{ myOKControl: _ }, [me]]
            },
            children: {
                // children inheriting both OKCancelDialogText and OKCancelDialogOKControl to be provided by inheriting area                
            }
        },
        {
            qualifier: { displayCancelControl: true },
            context: {
                myCancelControl: [
                    { myDialog: [me] },
                    [areaOfClass, "OKCancelDialogCancelControl"]
                ]
            },
            children: {
                cancelControl: {
                    description: {
                        "class": "OKCancelDialogCancelControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myDialog / myModalDialogable: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogElement: {
        "class": "GeneralArea",
        context: {
            myDialog: [
                [embeddingStar, [me]],
                [areaOfClass, "ModalDialog"]
            ],
            myModalDialogable: [{ myDialog: { myModalDialogable: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelDialogText: {
        "class": o("OKCancelDialogTextDesign", "DisplayDimension", "ModalDialogElement"),
        context: {
            displayDimensionMaxWidth: [minus,
                generalPosConst.modalDialogMaxWidth,
                [mul,
                    2,
                    [plus,
                        generalPosConst.modalDialogBorderWidth,
                        generalPosConst.modalDialogMinMarginAroundEmbeddedElements
                    ]
                ]
            ]
        },
        position: {
            "horizontal-center": 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelDialogControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultVerticalSpacing: true,
                displayCancelControl: [{ myDialog: { displayCancelControl: _ } }, [me]]
            }
        },
        { // default
            "class": "ModalDialogControl",
            context: {
                myText: [
                    { myDialog: [{ myDialog: _ }, [me]] },
                    [areaOfClass, "OKCancelDialogText"]
                ]
            },
            position: {
                bottom: generalPosConst.modalDialogMinMarginAroundEmbeddedElements,
                minVerticalOffsetFromText: {
                    point1: {
                        element: [{ myText: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    min: generalPosConst.modalDialogMinMarginAroundEmbeddedElements
                }
            }
        },
        {
            qualifier: { defaultVerticalSpacing: true },
            position: {
                centerTextVerticallyBetweenMeAndTopOfEmbedding: {
                    pair1: {
                        point1: {
                            element: [{ myDialog: _ }, [me]],
                            type: "top",
                            content: true
                        },
                        point2: {
                            element: [{ myText: _ }, [me]],
                            type: "vertical-center"
                        }
                    },
                    pair2: {
                        point1: {
                            element: [{ myText: _ }, [me]],
                            type: "vertical-center"
                        },
                        point2: {
                            type: "top"
                        }
                    },
                    ratio: 1
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelDialogOKControl: o(
        { // default 
            "class": "OKCancelDialogControl",
            context: {
                displayText: "OK"
            }
        },
        {
            qualifier: { displayCancelControl: true },
            position: {
                leftOfMyDialogHorizontalCenter: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myDialog: _ }, [me]],
                        type: "horizontal-center"
                    },
                    equals: generalPosConst.okCancelModalDialogControlOffsetFromCenter
                }
            }
        },
        {
            qualifier: { displayCancelControl: false },
            position: {
                centerHorizontallyInDialog: {
                    point1: {
                        type: "horizontal-center"
                    },
                    point2: {
                        element: [{ myDialog: _ }, [me]],
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelDialogCancelControl: {
        "class": "OKCancelDialogControl",
        context: {
            displayText: "Cancel"
        },
        position: {
            rightOfMyDialogHorizontalCenter: {
                point1: {
                    element: [{ myDialog: _ }, [me]],
                    type: "horizontal-center"
                },
                point2: {
                    type: "left"
                },
                equals: generalPosConst.okCancelModalDialogControlOffsetFromCenter
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of classes for a ModalDialog with a TextInput field.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A modal dialog that includes not only the OK and Cancel buttons, but also a text input field
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelModalDialogWithTextInput: {
        "class": o("GeneralArea", "OKCancelModalDialog"),
        context: {
            myTextInput: [
                { myDialog: [me] },
                [areaOfClass, "ModalDialogTextInputElement"]
            ],
            validTextInput: [{ myTextInput: { valid: _ } }, [me]],

            // AreaInFocusController params 
            osOfAreasInFocus: o(
                [{ myTextInput: _ }, [me]],
                [{ myControls: _ }, [me]]
            ),
            defaultAreaInFocus: [{ myTextInput: _ }, [me]],
            allowShiftingFocus: [{ validTextInput: _ }, [me]] // override the definition provided by AreaInFocusController
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The OK control in a modal dialog that includes not only the OK and Cancel buttons, but also a text input field...
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OKCancelDialogWithTextInputOKControl: {
        "class": "OKCancelDialogOKControl",
        context: {
            myTextInput: [{ myDialog: { myTextInput: _ } }, [me]],
            enabled: [{ myTextInput: { valid: _ } }, [me]] // override ModalDialogControl definition            
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The text input field in a modal dialog that includes not only the OK and Cancel buttons, but also a text input field...
    // API:
    // 1. see TextInput and ModalDialogElement
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogTextInputElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                valid: [or,
                    [and,
                        [{ editInputText: _ }, [me]],
                        [{ allowWritingInput: _ }, [me]]
                    ],
                    [not, [{ editInputText: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "ModalDialogElement", "AreaInFocus", "TextInput"),
            context: {
                // AreaInFocus param
                myAreaInFocusController: [{ myDialog: _ }, [me]],
                // TextInput params 
                initEditInputText: true, // come up with this area in edit mode.
                allowToExitEditInputTextMode: [{ valid: _ }, [me]],
                keyboardEventsToExitEditInputText: o(
                    noCtrlEnterEvent,
                    tabOrRightArrowEvent,
                    shiftTabOrLeftArrowEvent
                ),
                myControls: [
                    { myDialog: [{ myDialog: _ }, [me]] },
                    [areaOfClass, "OKCancelDialogOKControl"]
                ]
            }
        },
        {
            qualifier: { editInputText: false },
            write: {
                onModalDialogTextInputElementGetsFocus: {
                    upon: [{ iAmTheAreaInFocus: _ }, [me]],
                    true: {
                        editInputTextOn: {
                            to: [{ editInputText: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of classes for a ModalDialog with a TextInput field.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A ModalDialogable that also supports the freezing of a drag area that's just been dropped: while the ModalDialog is open, the dropped area is 
    // frozen in space (and an areaRef to it is retained so it can be queried)
    // API:
    // 1. ModalDialogable's API
    // 2. draggedElementForModalDialogable: [me], by default
    // 3. conditionsForModalDialogable
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModalDialogableOnDragAndDrop: o(
        { // variant-controller
            qualifier: "!",
            context: {
                readyForModalDialogOnDrop: [and,
                    [{ draggedElementForModalDialogable: _ }, [me]],
                    [{ conditionsForModalDialogable: _ }, [me]]
                ],
                modalDialogDragOrDrop: o(
                    [{ readyForModalDialogOnDrop: _ }, [me]],
                    [{ createModalDialog: _ }, [me]]
                )
            }
        },
        { // default
            "class": "ModalDialogable",
            context: {
                draggedElementForModalDialogable: [me],
                "*droppedElementForModalDialogable": o()
            }
        },
        {
            qualifier: { readyForModalDialogOnDrop: true },
            write: {
                onModalDialogableOnDragAndDropAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        recorDroppedElementForModalDialogable: { // so that we retain the areaRef even after the mouseUp of the drop operation
                            to: [{ droppedElementForModalDialogable: _ }, [me]],
                            merge: [{ draggedElementForModalDialogable: _ }, [me]]
                        },
                        createModalDialog: {
                            to: [{ createModalDialog: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            "class": "AbsoluteStabilityOfArea",
            context: {
                areaToStabilize: [{ droppedElementForModalDialogable: _ }, [me]] // AbsoluteStabilityOfAreas param
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrashModalDialog: {
        "class": "OKCancelModalDialog"
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Modal Dialog Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of MoreControls Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the logic to handle the moreControlsOpen appData defined herein (which obviously can also be used as a writable ref).
    // It works in conjunction with the MoreControlsOnClickUX class, which serves as the UX element.
    // API:
    // 1. moreControlsOpen: a boolean context label.
    // 2. closeMoreControlsOnMouseDownElsewhere: a boolean flag (true by default) which indicates whether a mouseDown 'elsewhere' should set moreControlsOpen to false. 
    // 3. immunityFromClosingMoreControlsAreaRefs: an os of areaRefs. If one of these handles the mouseDown, the moreControlsOpen won't be set to false.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                closeMoreControlsOnMouseDownElsewhere: true,
                "*moreControlsOpen": false
            }
        },
        { // default
            "class": o("GeneralArea", "TrackModalDialog"),
            context: {
                myMoreControlsUX: [
                    { myMoreControlsController: [me] },
                    [areaOfClass, "MoreControlsUXCore"]
                ],
                myMenu: [
                    { myMenuAnchor: [{ myMoreControlsUX:_ }, [me]] },
                    [areaOfClass, "Menu"]
                ],

                defaultImmunityFromClosingMoreControlsAreaRefs: o(
                    [{ myMoreControlsUX: _ }, [me]],
                    [{ myMenu: _ }, [me]],
                    [embeddedStar, [{ myMenu: _ }, [me]]]
                ),
                // Core::MoreControlsController params
                immunityFromClosingMoreControlsAreaRefs: [{ defaultImmunityFromClosingMoreControlsAreaRefs: _ }, [me]]
            }
        },
        {
            qualifier: {
                closeMoreControlsOnMouseDownElsewhere: true,
                moreControlsOpen: true,
                modalDialogOn: false
            },
            write: {
                // close more controls in case the mouseDown did not occur inside any one of the OSRControls or their embedded areas.
                onMoreControlsControllerMouseDownElsewhere: {
                    upon: o(
                        [mouseDownNotHandledBy,
                            [{ immunityFromClosingMoreControlsAreaRefs: _ }, [me]]
                        ],
                        escEvent
                    ),
                    true: {
                        closeMoreControls: {
                            to: [{ moreControlsOpen: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a UX element that provides more controls
    // It is inherited by MoreControlsOnClickUXCore and by MoreControlsOnHoverUX.
    //
    // API: 
    // 1. myMoreControlsController: an areaRef to an instance of MoreControlsController. by default, the embedding area.
    // 2. positioning
    // 3. horizontalOffsetToMenu: offset to the Menu (actually to its MenuOriginTriangle). default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsUXCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                open: [{ myMoreControlsController: { moreControlsOpen: _ } }, [me]],
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myMoreControlsController: [embedding],
                horizontalOffsetToMenu: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a UX element that provides more controls on a click.
    // This is a base version of MoreControlsOnClickUX without the uxElements (merged in facetClasses)
    //
    // API: 
    // 1. MoreControlsUXCore API
    // 2. closeOnClick: boolean, default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsOnClickUXCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                closeOnClick: true
            }
        },
        { // default
            "class": o("MoreControlsUXCore", "ControlModifiedPointer", "AboveSiblings", "BlockMouseEvent")
        },
        {
            qualifier: { closeOnClick: true },
            write: {
                onMoreControlsCoreMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleOpen: {
                            to: [{ open: _ }, [me]],
                            merge: [not, [{ open: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { open: false },
            "class": "Tooltipable",
            context: {
                tooltipText: "More Options"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a UX element that provides more controls.
    // It is inherited by OverlayMoreControls, FacetMoreControls, etc.
    //
    // API: 
    // 1. MoreControlsOnClickUXCore API
    // 2. showUxElements: boolean, true by default.
    //    Iff true it embeds three small squares vertically aligned 
    // 3. verticalMoreControls: true, by default
    // 4. circularElements: boolean. false, by default
    // 5. elementSpacingFromPrev / elementMargin / elementDimension: defaults provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsOnClickUX: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showUxElements: true,
                verticalMoreControls: true
            }
        },
        { // default
            "class": o("MoreControlsUXDesign", "MoreControlsOnClickUXCore"),
            context: {
                circularElements: false,
                elementSpacingFromPrev: [densityChoice, [{ fsPosConst: { additionalControlsElementSpacingFromPrev: _ } }, [globalDefaults]]], // MemberOfTopToBottomAreaOS param
                elementMargin: [densityChoice, [{ fsPosConst: { additionalControlsElementMargin: _ } }, [globalDefaults]]],
                elementDimension: [densityChoice, [{ fsPosConst: { additionalControlsUXElementDimension: _ } }, [globalDefaults]]]
            }
        },
        // open:true/false variants to be implemented by inheriting classes
        {
            qualifier: { showUxElements: true },
            children: {
                uxElements: {
                    data: [sequence, r(1, 3)],
                    description: {
                        "class": "MoreControlsUXElement"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsUXElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                indicateSelectability: [{ inFocus: _ }, [embedding]],
                verticalMoreControls: [{ verticalMoreControls: _ }, [embedding]],
                circularElement: [{ circularElements: _ }, [embedding]]
            }
        },
        { // default
            "class": o("MoreControlsUXElementDesign", "GeneralArea"),
            context: {
                spacingFromPrev: [{ elementSpacingFromPrev: _ }, [embedding]], // MemberOfTopToBottomAreaOS param
                elementMargin: [{ elementMargin: _ }, [embedding]],
                elementDimension: [{ elementDimension: _ }, [embedding]]
            }
        },
        {
            qualifier: { circularElement: false },
            position: {
                width: [{ elementDimension: _ }, [me]],
                height: [{ elementDimension: _ }, [me]]
            }
        },
        {
            qualifier: { circularElement: true },
            "class": "Circle",
            context: {
                radius: [div, [{ elementDimension: _ }, [me]], 2]
            }
        },
        {
            qualifier: { verticalMoreControls: true },
            "class": "MemberOfTopToBottomAreaOS",
            position: {
                left: [{ elementMargin: _ }, [me]],
                right: [{ elementMargin: _ }, [me]]
            }
        },
        {
            qualifier: { verticalMoreControls: false },
            "class": "MemberOfLeftToRightAreaOS",
            position: {
                top: [{ elementMargin: _ }, [me]],
                bottom: [{ elementMargin: _ }, [me]]
            }
        },
        {
            qualifier: {
                firstInAreaOS: true,
                verticalMoreControls: true
            },
            position: {
                top: 0
            }
        },
        {
            qualifier: {
                lastInAreaOS: true,
                verticalMoreControls: true
            },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: {
                firstInAreaOS: true,
                verticalMoreControls: false
            },
            position: {
                left: 0
            }
        },
        {
            qualifier: {
                lastInAreaOS: true,
                verticalMoreControls: false
            },
            position: {
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsOnHoverUX: o(
        { // default
            "class": o("GeneralArea", "DelayedInArea", "MoreControlsUXCore"),
            write: {
                onMoreControlsOnHoverUXInFocus: {
                    upon: [{ delayedInFocus: _ }, [me]],
                    true: {
                        open: {
                            to: [{ open: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { open: true },
            write: {
                onMoreControlsOnHoverUXClose: {
                    upon: [and,
                        [not, [{ inFocus: _ }, [me]]],
                        [not, [{ myMoreControlsController: { myMenu: { inFocus: _ } } }, [me]]]
                    ],
                    true: {
                        close: {
                            to: [{ open: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of MoreControls Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Menu
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting menu to determine whether it can fit on the left or the right of the expressionOf
    // API:
    // 1. menuDefaultToLeft: true, by default
    // 2. verticalAnchorOfMenu: default provided. Inheriting classes should inherit this using atomic, to override default object definition.
    // 3. offsetOfVerticaAnchorForMenu: default provided.
    // 4. defaultHorizontalPositioning: true
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MenuCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                menuOpensOnLeft: [cond,
                    [{ menuDefaultToLeft: _ }, [me]],
                    o(
                        {
                            on: true, use:
                            [greaterThan,
                                [offset,
                                    {
                                        element: [embedding], // the referredOf
                                        type: "left",
                                        content: true
                                    },
                                    {
                                        label: "menuLeftIfOpensOnLeft"
                                    }
                                ],
                                0
                            ]
                        },
                        {
                            on: false, use:
                            [not,
                                [greaterThan,
                                    [offset,
                                        {
                                            label: "menuRightIfOpensOnRight"
                                        },
                                        {
                                            element: [embedding], // the referredOf
                                            type: "right",
                                            content: true
                                        }
                                    ],
                                    0
                                ]
                            ]
                        }
                    )
                ],
                defaultHorizontalPositioning: true
            }
        },
        { // default
            "class": o("GeneralArea", "IconAboveAppZTop", "BlockMouseEvent", "MinWrap"),
            context: {
                menuDefaultToLeft: true,
                myMenuAnchor: [expressionOf],
                minWrapAround: 0,
                defaultFullWidthOfMenu: [offset, { type: "left" }, { type: "right" }],
                fullWidthOfMenu: [{ defaultFullWidthOfMenu: _ }, [me]],
                verticalAnchorOfMenu: {
                    type: "vertical-center",
                    content: true
                },
                offsetOfVerticaAnchorForMenu: 0
            },
            position: {
                defaultVerticalAlignmentOfMenu: {
                    point1: [{ verticalAnchorOfMenu: _ }, [me]],
                    point2: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "vertical-center"
                    },
                    equals: [{ offsetOfVerticaAnchorForMenu: _ }, [me]],
                    // 'best effort' priority: will lose out to most, including defaultPressure, and to the
                    // verticalAnchorEqualsOneAnchorPointToMyMoreControls constraint which has weakerThanDefaultPressure priority
                    priority: positioningPrioritiesConstants.strongerThanMouseAttachment
                },
                labelMenuRightIfOpensOnRight: {
                    point1: { element: [{ myMenuAnchor: _ }, [me]], type: "right" },
                    point2: { label: "menuRightIfOpensOnRight" },
                    equals: [{ fullWidthOfMenu: _ }, [me]]
                },
                labelMenuLeftIfOpensOnLeft: {
                    point1: { label: "menuLeftIfOpensOnLeft" },
                    point2: { element: [{ myMenuAnchor: _ }, [me]], type: "left" },
                    equals: [{ fullWidthOfMenu: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                defaultHorizontalPositioning: true,
                menuOpensOnLeft: true
            },
            position: {
                attachToLeftfMyMenuAnchor: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: {
                defaultHorizontalPositioning: true,
                menuOpensOnLeft: false
            },
            position: {
                attachToRightOfMyMenuAnchor: {
                    point1: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Simple class for a pop-out menu
    // API: 
    // 1. the embedded menuItems areaSet. They should inherit MenuItem (see API there)
    // 2. originTriangleAboveMenu: boolean, true by default.
    // 3. showTriangle: true, by default
    // 4. MenuCore's API
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Menu: {
        "class": o("MenuDesign", "GeneralArea", "MenuCore"),
        context: {
            myTriangle: [{ children: { originTriangle: _ } }, [me]],
            fullWidthOfMenu: [plus, // override definition from MenuCore
                [{ defaultFullWidthOfMenu: _ }, [me]],
                [offset, { element: [{ myTriangle: _ }, [me]], type: "left" }, { element: [{ myTriangle: _ }, [me]], type: "right" }]
            ],
            defaultHorizontalPositioning: false, //override definition from MenuCore
            enforceVerticalLatchingToTriangle: false, //whether the menu items should be vertically aligned with the triangle
            originTriangleAboveMenu: true,
            showTriangle: true,

        },
        // children:menuItems areaSet - to be provided by inheriting class
        children: {
            originTriangle: {
                "class": "PartnerWithIconEmbedding",
                description: {
                    "class": "MenuOriginTriangle",
                    context: {
                        aboveMyExpressionOf: [{ originTriangleAboveMenu: _ }, [expressionOf]]
                    }
                }
            }
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Menu Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of MoreControls Menu
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: the MoreControlsMenu is intended for Mon1. It is in the core directory so that Mon0 can use it in those cases where it does not 
    // specify its own behavior.
    // API: 
    // 1. the embedded menuItems areaSet. They should inherit MenuItem (see API there)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreControlsMenu: {
        "class": "Menu",
        context: {
            myMoreControlsController: [{ myMenuAnchor: { myMoreControlsController: _ } }, [me]],
            enforceVerticalLatchingToTriangle: true, // override default value of Menu

            possibleAnchorPointsToMyMoreControls: {
                element: [
                    [embedded],
                    [areaOfClass, "SelectableMenuItem"]
                ],
                label: "anchorToMyMoreControls"
            }
        },
        // children:menuItems areaSet - to be provided by inheriting class
        position: {
            // min offset constraints:
            // horizontal anchor: see MenuOriginTriangle below
            verticalAnchorEqualsOneAnchorPointToMyMoreControls: {
                point1: {
                    element: [{ myMenuAnchor: _ }, [me]],
                    type: "vertical-center"
                },
                point2: [{ possibleAnchorPointsToMyMoreControls: _ }, [me]],
                equals: 0,
                // lose out to defaultPressure.
                // note: stronger than defaultVerticalAlignmentOfMenu, which has an even weaker priority!!
                priority: positioningPrioritiesConstants.weakerThanDefaultPressure,
                orGroups: { label: "moreControlsVerticalAnchor" }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MenuOriginTriangle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                menuOpensOnLeft: [{ myMenu: { menuOpensOnLeft: _ } }, [me]],
                show: [{ myMenu: { showTriangle: _ } }, [me]]
            }
        },
        { //default
            "class": o("MenuOriginTriangleDesign", "GeneralArea", "Icon"),
            context: {
                myMenu: [expressionOf],
                myMenuAnchor: [{ myMenu: { myMenuAnchor: _ } }, [me]],
                useBackgroundColorOfMyAdjacentMenuItem: [equal,
                    [{ useBackgroundColorOfAdjacentMenuItemForMenuTriangle: _ },
                    [areaOfClass, "App"]],
                    "yes"
                ],
                myAdjacentMenuItem: [
                    {
                        myMenuTriangle: [me],
                        adjacentToTriangle: true
                    },
                    [areaOfClass, "MenuItem"]
                ],
                horizontalOffsetToMenu: 1
            },
            stacking: {
                aboveMyMoreControls: {
                    higher: [me],
                    lower: [{ myMenuAnchor: _ }, [me]]
                }
            },
            position: {
                attachVertically: {
                    point1: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { show: true },
            position: {
                height: generalPosConst.menuOriginTriangleHeight,
                width: generalPosConst.menuOriginTriangleWidth
            }
        },
        {
            qualifier: { show: false },
            position: {
                height: 0,
                width: 0
            }
        },
        {
            qualifier: { menuOpensOnLeft: true },
            position: {
                attachToMyMenu: {
                    point1: { type: "left" },
                    point2: {
                        element: [{ myMenu: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    equals: [{ horizontalOffsetToMenu: _ }, [me]]
                },
                attachToMyMoreControls: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "left"
                    },
                    min: generalPosConst.menuOriginTriangleHorizontalOffsetFromOrigin,
                    equals: [{ myMenuAnchor: { horizontalOffsetToMenu: _ } }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        },
        {
            qualifier: { menuOpensOnLeft: false },
            position: {
                attachToMyMenu: {
                    point1: {
                        element: [{ myMenu: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: { type: "right" },
                    equals: [{ horizontalOffsetToMenu: _ }, [me]]
                },
                attachToMyMoreControls: {
                    point1: {
                        element: [{ myMenuAnchor: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: generalPosConst.menuOriginTriangleHorizontalOffsetFromOrigin,
                    equals: [{ myMenuAnchor: { horizontalOffsetToMenu: _ } }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: as a member of an areaSet, it has param.areaSetContent defined.
    // 1. param.areaSetContent.uniqueID may store a unique identifier of the menu item. 
    //    Otherwise, inheriting class should provide one.
    // 2. horizontalMarginFromEmbedded: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MenuItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enforceVerticalLatchingToTriangle: [{ myMenu: { enforceVerticalLatchingToTriangle: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "BlockMouseEvent", "MinWrapHorizontal", "MemberOfTopToBottomAreaOS"),
            context: {
                myMenu: [embedding],

                myMenuAnchor: [{ myMenu: { myMenuAnchor: _ } }, [me]],

                myMenuTriangle: [
                    { myMenu: [{ myMenu: _ }, [me]] },
                    [areaOfClass, "MenuOriginTriangle"]
                ],
                adjacentToTriangle: [and,
                    [greaterThanOrEqual,
                        [offset,
                            { type: "top" },
                            { element: [{ myMenuTriangle: _ }, [me]], type: "top" }
                        ],
                        0
                    ],
                    [greaterThanOrEqual,
                        [offset,
                            { element: [{ myMenuTriangle: _ }, [me]], type: "bottom" },
                            { type: "bottom" }
                        ],
                        0
                    ]
                ],

                horizontalMarginFromEmbedded: 6
            },
            position: {
                left: 0,
                right: 0
            },
            stacking: {
                aboveOriginTriangle: {
                    higher: [me],
                    lower: [
                        { myMenu: [{ myMenu: _ }, [me]] },
                        [areaOfClass, "MenuOriginTriangle"]
                    ]
                }
            }
        },
        {
            qualifier: { enforceVerticalLatchingToTriangle: true },
            position: {
                labelAnchorToMyMoreControls: {
                    point1: { type: "vertical-center" },
                    point2: { label: "anchorToMyMoreControls" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                top: 0
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                bottom: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: as a member of an areaSet, it has param.areaSetContent defined.
    // 1. param.areaSetContent.uniqueID may store a unique identifier of the menu item. Otherwise, inheriting class should provide one.
    // 2. modifyPointerClickable: boolean, true by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableMenuItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                uniqueID: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                modifyPointerClickable: true
            }
        },
        { // default
            "class": o("SelectableMenuItemDesign", "MenuItem"),
            propagatePointerInArea: [cond,
                [
                    "MoreControlsOnHoverUX",
                    [classOfArea, [{ myMenuAnchor:_ }, [me]]]
                ],
                o({ on: true, use: "embedding" }, { on: false, use: o()})
            ]
        },
        {
            qualifier: { modifyPointerClickable: true },
            "class": "ModifyPointerClickable"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits  SelectableMenuItem. 
    // It displays text, and possible an icon. It allows for direct manipulation - selecting it results
    // in a selection made, and closes the menu.
    // 1. param.areaSetContent.id should store a unique identifier of the menu item.
    // 2. displayText: the text to be displayed in the embedded text area. Optional: provided in the param.areaSetContent.displayText, otherwise to be defined by inheriting class.
    // 3. closeMoreControlsOnClick: boolean, true by default.
    // 4. menuItemPossibleDisplayTexts: os of strings. if provided, the embedded text area will calculate its width to accommodate the longest of these. 
    // 5. height: default value provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MenuItemDirect: o(
        { // variant-controller
            qualifier: "!",
            context: {
                uniqueID: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                showBar: true,
                barOnTheLeft: true,
                closeMoreControlsOnClick: true
            }
        },
        { // default
            "class": o("SelectableMenuItem"),
            context: {
                displayText: [{ param: { areaSetContent: { displayText: _ } } }, [me]],

                iconWidth: generalPosConst.menuIconWidth,
                height: generalPosConst.menuItemHeight
            },
            position: {
                height: [{ height: _ }, [me]]
            },
            children: {
                text: {
                    description: {
                        "class": "MenuItemText"
                    }
                }
            }
        },
        {
            qualifier: { closeMoreControlsOnClick: true },
            write: {
                onMenuItemClick: {
                    "class": "OnMouseClick",
                    true: {
                        closeMoreControls: {
                            to: [{ myMenuAnchor: { open: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { showBar: true, inArea: true },
            children: {
                onHoverIndication: {
                    description: {
                        position: {
                            top: 0,
                            bottom: 0,
                            width: 5
                        },
                        display: {
                            background: "#969696"
                        }
                    }
                }
            }
        },
        {
            qualifier: { showBar: true, inArea: true, barOnTheLeft: true },
            children: {
                onHoverIndication: {
                    description: {
                        position: {
                            left: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: { showBar: true, inArea: true, barOnTheLeft: false },
            children: {
                onHoverIndication: {
                    description: {
                        position: {
                            right: 0
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MenuItemText: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                inMenuItem: [{ inArea: _ }, [embedding]],
                menuItemPossibleDisplayTexts: [{ menuItemPossibleDisplayTexts: _ }, [embedding]]
            }
        },
        { // default
            "class": o("MenuItemTextDesign", "TextInTextAndIcon", "CalculateMaxWidthOfStrings"),
            context: {
                horizontalMargin: [{ horizontalMarginFromEmbedded: _ }, [embedding]]
            }
        },
        {
            qualifier: { menuItemPossibleDisplayTexts: true },
            context: {
                displayWidth: [
                    [{ maxWidthOfStrings: _ }, [me]],
                    [{ menuItemPossibleDisplayTexts: _ }, [embedding]]
                ]
            }
        }
    ),

    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of MoreControls Menu
    // //////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. DropDownMenuable's API:
    // 1.1. provide the description for a child called 'menu'.
    // 1.2. dropDownMenuLogicalSelectionsOS / dropDownMenuDisplaySelectionsOS
    // 2. inheriting class should position this dropDown control
    // 3. height: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RefElementsDropDownMenuable: o(
        { // default
            "class": o(
                "GeneralArea",
                "ControlModifiedPointer",
                "DropDownMenuable"
            ),
            context: {
                height: generalPosConst.heightOfDropDownMenuLine,
                // DropDownMenuable params
                showControl: false // override DropDownMenuable default value
            },
            position: {
                height: [{ height: _ }, [me]]
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: {
                    // partner: see DropDownMenuable
                    description: {
                        "class": "RightSideScrollbarDropDownMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. see DropDownMenu
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RightSideScrollbarDropDownMenu: {
        "class": "DropDownMenu",
        context: {
            scrollbar: {
                attachToView: "end",
                attachToViewOverlap: true
            },
            menuLineHeight: 16
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by an area which also inherits DropDownMenuLine
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RefElementsMenuLine: {
        "class": o("GeneralArea", "DropDownMenuLine"),
        context: {
            name: [{ param: { areaSetContent: _ } }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inheriting class should provide the class definition in a child called 'explanation', under the createInfoIcon: true variant
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfoIconable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createInfoIcon: [{ inFocus: _ }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                dimension: [densityChoice, [{ fsPosConst: { infoIconDimension: _ } }, [globalDefaults]]],
            },
            position: {
                width: [{ dimension: _ }, [me]],
                height: [{ dimension: _ }, [me]]
            }
        },
        {
            qualifier: { createInfoIcon: true },
            children: {
                explanation: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        // inheriting class should provide class defintion, which inherits InfoIcon
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    // 2. displayDimensionMaxWidth (optional - see DisplayDimension)
    // 3. Inheriting class may inherit InfoIconDesign
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfoIcon: {
        "class": o("GeneralArea", "DisplayDimension", "IconAboveAppZTop", "MinOffsetFromAnchor"),
        context: {
            // params for MinOffsetFromAnchor: minimizing the offset between the horizontal-center/bottom of the TooltipRoot and the tooltipHorizontalAnchor/tooltipVerticalAnchor 
            // of the Tooltipable area (by default, it's horizontal-center/top).
            moAnchorHorizontalPoint: atomic({
                element: [{ myIconable: _ }, [me]],
                type: "right"
            }),
            moAnchorVerticalPoint: atomic({
                element: [{ myIconable: _ }, [me]],
                type: "bottom"
            })
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: The values selected by this class are NOT case-sensitive.
    //
    // API:
    // 1. typeAheadDropDownMenuLogicalSelectionsOS: the os of values from which the typeAhead will search.
    // 2. typeAheadDropDownMenuDisplaySelectionsOS: by default, equates typeAheadDropDownMenuLogicalSelectionsOS
    // 2. TextInput API
    ////////////////////////////////////////////////////////////////////////////////////////////////////////                
    TypeAheadTextInput: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                createDropDownMenu: [and,
                    [{ editInputText: _ }, [me]],
                    [{ textForAppData: _ }, [me]],
                    [{ dropDownMenuDisplaySelectionsOS: _ }, [me]] // create menu only if there is something to be displayed in it.
                ],

                singleMatchForTextInput: [and,
                    [equal, 1, [size, [{ dropDownMenuDisplaySelectionsOS: _ }, [me]]]],
                    // temporary function. with [lowercase]/[uppercase], string functions we don't have yet, one could simply use [equal]
                    [stringMatchCaseInsensitive,
                        [{ textForAppData: _ }, [me]],
                        [{ dropDownMenuDisplaySelectionsOS: _ }, [me]]
                    ]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "TextInput", "DropDownMenuable"),
            context: {
                typeAheadDropDownMenuDisplaySelectionsOS: [{ typeAheadDropDownMenuLogicalSelectionsOS: _ }, [me]],

                // TextInput params
                enableBoxShadow: false,
                initEditInputText: true,
                initEditInputTextSelectionStart: -1,

                // create an os of objects, each packing the corresponding logical and display values for the typeAhead.
                // we will then select only those with a display value that matches the typed string, and from this selection we will project 
                // both the os of logical values and of display values.
                typeAheadSelectionObjsOS: [map,
                    [defun,
                        "typeAheadDropDownMenuLogicalValue",
                        {
                            logical: "typeAheadDropDownMenuLogicalValue",
                            // look up the index of the logical selection, in the logicalSelections os, and use it to find the corresponding displaySelection
                            display: [pos,
                                [index,
                                    [{ typeAheadDropDownMenuLogicalSelectionsOS: _ }, [me]],
                                    "typeAheadDropDownMenuLogicalValue"
                                ],
                                [{ typeAheadDropDownMenuDisplaySelectionsOS: _ }, [me]]
                            ]
                        }
                    ],
                    [{ typeAheadDropDownMenuLogicalSelectionsOS: _ }, [me]]
                ],

                typeAheadSelectionObjsMatchingTextInput: [
                    { display: s([{ textForAppData: _ }, [me]]) },
                    [{ typeAheadSelectionObjsOS: _ }, [me]]
                ],

                // DropDownMenuable params
                displayDropDownShowControl: false,
                dropDownMenuLogicalSelectionsOS: [{ typeAheadSelectionObjsMatchingTextInput: { logical: _ } }, [me]],
                dropDownMenuDisplaySelectionsOS: [{ typeAheadSelectionObjsMatchingTextInput: { display: _ } }, [me]]
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: {
                    // partner: see DropDownMenuable
                    description: {
                        "class": o("RightSideScrollbarDropDownMenu"),
                        context: {
                            enableSearchBox: false,
                            defaultDropDownMenuPositioningRight: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Icon Classes 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
};
