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

// %%include%%: "../18_BasicClasses/reference.js"
// %%include%%: "../18_BasicClasses/events.js"
// %%classfile%%: "../18_BasicClasses/draggable.js"
// %%classfile%%: "style.js"

initGlobalDefaults = {
    darkPrimaryColor: "#0097A7",
    lightPrimaryColor: "#B2EBF2",
    primaryColor: "#00BCD4",
    accentColor: "#CDDC39",
    textPrimaryColor: "#FFFFFF",
    primaryTextColor: "#212121",
    secondaryTextColor: "#757575",
    dividerColor: "#BDBDBD"
};

var clickableURL = [
    defun, o("text", "title", "url"),
    [concatStr, o(
        "<a href=", "url", " title=\"", "title", "\">", "text", "</a>"
    )]
];

var replaceEmpty = [
    defun, o("expr", "repl"),
    [cond, [empty, "expr"], o({ on: true, use: "repl" }, { on: false, use: "expr" })]
];

var mkProj = [
    defun, "attr",
    { "#attr": _ }
];

var mkSel = [
    defun, o("attr", "val"),
    { "#attr": "val" }
];

var suffixTable = o("", "K", "M", "G", "T", "P")

var suffixize = [
    defun, o("value", "unit"),
    [cond, "value", o(
        { on: 0, use: [concatStr, o("0", "unit")] },
        {
            on: r(-Infinity, Infinity), use: [
                using,
                "exp", [floor, [log10, [abs, "value"]]],
                "engexp", [min,
                    [floor, [div, [log10, [abs, "value"]], 3]],
                    [minus, [size, suffixTable], 1]
                ],
                "frac", [div, "value", [pow, 1000, "engexp"]],
                [concatStr, o(
                    [round, "frac",
                        [minus, 2, [minus, "exp", [mul, "engexp", 3]]]
                    ],
                    [pos, "engexp", suffixTable],
                    "unit"
                )]
            ]
        }
    )]
];

var errorMessageTable = o(
    { errorMessage: "not authorized", translation: "not logged in" },
    { errorMessage: "login error", translation: "user name/password combination incorrect" },
    { errorMessage: "not logged in", translation: "" }
);

var translateError = [
    defun, "err", [
        replaceEmpty,
        [{ translation: _, errorMessage: "err" }, errorMessageTable],
        "err"
    ]
];

var classes = {
    MarkArea: {
        propagatePointerInArea: o(),
        display: {
            background: [{ textPrimaryColor: _ }, [globalDefaults]],
            opacity: 0.85,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: [{ lightPrimaryColor: _ }, [globalDefaults]],
            pointerOpaque: true,
            text: {
                "class": "Font",
                color: [{ primaryTextColor: _ }, [globalDefaults]],
                textAlign: "left",
                verticalAlign: "top",
                value: "$text"
            }
        }
    },

    /// Very basic ordering of items in a top-to-bottom list
    BasicListInArea: o({
        context: {
            listData: mustBeDefined,
            itemSpacing: 0,
            listOrder: "top-down",
            firstChildOffset: 0,
            minHeightZeroWithEmptyListData: true,
            minWidthZeroWithEmptyListData: true
        },
        children: {
            items: {
                data: [{ listData: _ }, [me]],
                description: {
                    content: [{ param: { areaSetContent: _ } }, [me]],
                    position: {
                        itemOrder: {
                            point1: {
                                type: [{ endLabel: _ }, [embedding]],
                                element: [prev]
                            },
                            point2: {
                                type: [{ startLabel: _ }, [embedding]]
                            },
                            equals: [{ itemSpacing: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: { firstChildOffset: true },
        position: {
            firstChild: {
                point1: {
                    type: [{ startLabel: _ }, [me]]
                },
                point2: {
                    type: [{ startLabel: _ }, [me]],
                    element: [first, [{ children: { items: _ } }, [me]]]
                },
                equals: [{ firstChildOffset: _ }, [me]]
            }
        }
    }, {
        qualifier: { listOrder: "top-down" },
        context: {
            startLabel: "top",
            endLabel: "bottom"
        },
        children: {
            items: {
                description: {
                    position: {
                        left: 0,
                        right: 0
                    }
                }
            }
        }
    }, {
        qualifier: { listOrder: "top-down", minHeightZeroWithEmptyListData: true, listData: false },
        position: {
            minHeightZero: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                equals: 0
            }
        }
    }, {
        qualifier: { listOrder: "left-right" },
        context: {
            startLabel: "left",
            endLabel: "right"
        },
        children: {
            items: {
                description: {
                    position: {
                        top: 0,
                        bottom: 0
                    }
                }
            }
        }
    }, {
        qualifier: { listOrder: "left-right", minWidthZeroWithEmptyListData: true, listData: false },
        position: {
            minWidthZero: {
                point1: { type: "left" },
                point2: { type: "right" },
                min: 0
            }
        }
    }),

    BasicListInAreaWithScrollbar: o({
        "class": "BasicListInArea",
        context: {
            hasScrollBar: true,
            firstChildOffset: 0,
            wheelEvent: [{ type: "Wheel" }, [myMessage]],
            itemsCanBeDragged: true
        },
        write: {
            blockWheelEvt: {
                upon: [{ wheelEvent: _ }, [me]],
                true: {
                    continuePropagation: false
                }
            }
        }
    }, {
        qualifier: { hasScrollBar: true },
        context: {
            hasScrollBar: true,
            addPixelsToDocumentSize: 0,
            documentSize: [
                plus,
                [
                    offset,
                    { type: "top", element: [first, [{ children: { items: _ } }, [me]]] },
                    { type: "bottom", element: [last, [{ children: { items: _ } }, [me]]] }
                ],
                [{ addPixelsToDocumentSize: _ }, [me]]
            ],
            addPixelsToAreaSize: 0,
            areaSize: [plus,
                [offset, { type: "top" }, { type: "bottom" }],
                [{ addPixelsToAreaSize: _ }, [me]]
            ],
            itemsFitInArea: [
                greaterThanOrEqual,
                [{ areaSize: _ }, [me]],
                [{ documentSize: _ }, [me]]
            ]
        }
    }, {
        qualifier: { hasScrollBar: true, itemsFitInArea: false },
        children: {
            scrollbar: {
                description: {
                    "class": "BasicScrollBar"
                }
            },
            items: {
                description: {
                    position: {
                        right: 8
                    }
                }
            }
        },
        position: {
            firstChild: o(),
            firstChildTopOppositeThumb: {
                pair1: {
                    point1: { type: "top", element: [{ children: { scrollbar: _ } }, [me]] },
                    point2: { type: "top", element: [{ children: { scrollbar: { children: { thumb: _ } } } }, [me]] }
                },
                pair2: {
                    point1: { type: "top" },
                    point2: { type: "top", element: [first, [{ children: { items: _ } }, [me]]] }
                },
                ratio: [uminus,
                    [div,
                        [{ documentSize: _ }, [me]],
                        [{ areaSize: _ }, [me]]
                    ]
                ]
            }
        }
    }, {
        qualifier: { itemsCanBeDragged: true },
        "children.items.description": {
            "class": "Draggable",
            context: {
                horizontallyDraggable: false
            }
        }
    }),

    // Add class Draggable to all children to allow moving the document via
    // dragging.
    NonAreaSetWithScrollBar: o({
        context: {
            documentSize: mustBeDefined,
            itemsFitInArea: [
                greaterThanOrEqual,
                [{ areaSize: _ }, [me]],
                [{ documentSize: _ }, [me]]
            ],
            anchoredChild: mustBeDefined,
            scrollView: mustBeDefined,
            areaSize: [offset,
                {type: "top", element: [{scrollView: _}, [me]]},
                {type: "bottom", element: [{scrollView: _}, [me]]}
            ]
        }
    }, {
        qualifier: { itemsFitInArea: false },
        children: {
            scrollbar: {
                description: {
                    "class": "BasicScrollBar"
                }
            }
        },
        position: {
            childTopOppositeThumb: {
                pair1: {
                    point1: { type: "top", element: [{ children: { scrollbar: _ } }, [me]] },
                    point2: { type: "top", element: [{ children: { scrollbar: { children: { thumb: _ } } } }, [me]] }
                },
                pair2: {
                    point1: { type: "top", element: [{scrollView: _}, [me]] },
                    point2: { type: "top", element: [{ anchoredChild: _ }, [me]] }
                },
                ratio: [uminus,
                    [div,
                        [{ documentSize: _ }, [me]],
                        [{ areaSize: _ }, [me]]
                    ]
                ]
            }
        }
    }),

    BasicScrollBar: o({
        "class": "Clickable",
        position: {
            top: 0,
            right: 0,
            bottom: 1,
            width: 8
        },
        children: {
            thumb: {
                description: {
                    "class": "BasicScrollBarThumb"
                }
            }
        }
    }, {
        qualifier: { selected: true },
        position: {
            moveScrollBar: {
                point1: { type: "vertical-center", element: [{ children: { thumb: _ } }, [me]] },
                point2: { type: "top", element: [pointer] },
                equals: 0,
                priority: dragPriorities.draggingPriority
            }
        }
    }),

    BasicScrollBarThumb: o({
        "class": "Draggable",
        context: {
            horizontallyDraggable: false,
            hoverOrDragging: [or,
                [{ param: { pointerInArea: _ } }, [me]],
                [{ beingDragged: _ }, [me]]
            ],
            areaToDocumentRatio: [
                div,
                [{ areaSize: _ }, [embedding, [embedding]]],
                [{ documentSize: _ }, [embedding, [embedding]]]
            ],
            thumbSize: [
                max,
                [
                    mul,
                    [{ areaToDocumentRatio: _ }, [me]],
                    [{ areaSize: _ }, [embedding, [embedding]]]
                ],
                20
            ]
        },
        display: {
            background: "lightgrey",
            borderRadius: 3,
            opacity: 0.3
        },
        position: {
            // top: 0,
            top: {
                point1: { type: "top", element: [embedding] },
                point2: { type: "top" },
                min: 0
            },
            bottom: {
                point1: { type: "bottom" },
                point2: { type: "bottom", element: [embedding] },
                min: 0
            },
            left: 0,
            height: [{ thumbSize: _ }, [me]],
            right: 0
        }
    }, {
        qualifier: { hoverOrDragging: true },
        display: {
            opacity: 0.6
        }
    }),

    EditButton: o({
        context: {
            isBeingEdited: mustBeDefined
        },
        display: {
            image: {
                src: "design/img/ic_edit_48px.svg",
                size: "100%"
            }
        }
    }, {
            qualifier: { isBeingEdited: true },
            display: {
                borderWidth: 2,
                borderColor: "lightGrey",
                borderStyle: "solid",
                borderRadius: 3
            }
        }),

    CloseButton: o({
        display: {
            image: {
                src: "design/img/ic_close_48px.svg",
                size: "100%"
            }
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    close: {
                        to: "$destination",
                        merge: "$value"
                    }
                }
            }
        }
    }),

    DeleteButton: o({
        display: {
            image: {
                src: "design/img/ic_delete_forever_48px.svg",
                size: "100%"
            }
        }
    }),

    ActionButton: {
        display: {
            image: {
                src: "$image",
                size: "100%"
            }
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    sendMessage: {
                        to: [message],
                        merge: "$message"
                    }
                }
            }
        }
    },

    LeftOfLabel: {
        "$label": {
            point1: { type: "right" },
            point2: { label: "$label", element: [replaceEmpty, "$element", [embedding]] },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    RightOfLabel: {
        "$label": {
            point1: { label: "$label", element: [replaceEmpty, "$element", [embedding]] },
            point2: { type: "left" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Puts area z-wise above siblings. Can only be used for 1 sibling
    ZAboveSiblings: {
        stacking: {
            aboveSiblings: {
                lower: [embedding],
                higher: [me]
            }
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    AboveSibling: {
        top: {
            point1: { type: "bottom" },
            point2: { type: "top", element: [{ children: { "$sibling": _ } }, [embedding]] },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    HorizontalAlignWithSibling: {
        horizontalCenter: {
            point1: { type: "horizontal-center" },
            point2: { type: "horizontal-center", element: [{children: {"$sibling": _}}, [embedding]] },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    VerticalAlignWithSibling: {
        verticalCenter: {
            point1: { type: "vertical-center" },
            point2: { type: "vertical-center", element: [{children: {"$sibling": _}}, [embedding]] },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    BelowSibling: {
        top: {
            point1: { type: "bottom", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "top" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Won't work when the list in $sibling can be reordered; will probably need
    // a min: "$distance", and an orGroup equals: "$distance"
    BelowSiblings: {
        top: {
            point1: { type: "bottom", element: [last, [{ children: { "$sibling": _ } }, [embedding]]] },
            point2: { type: "top" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    LeftOfSibling: {
        left: {
            point1: { type: "right" },
            point2: { type: "left", element: [{children: {"$sibling": _}}, [embedding]] },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Inherit under position; define $sibling; $distance is optional
    RightOfSibling: {
        left: {
            point1: { type: "right", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "left" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    AlignTopWithSibling: {
        top: {
            point1: { type: "top", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "top" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    AlignLeftWithSibling: {
        left: {
            point1: { type: "left", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "left" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    AlignBottomWithSibling: {
        bottom: {
            point1: { type: "bottom", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "bottom" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    AlignRightWithSibling: {
        right: {
            point1: { type: "right", element: [{ children: { "$sibling": _ } }, [embedding]] },
            point2: { type: "right" },
            equals: [replaceEmpty, "$distance", 0]
        }
    },

    // Flips $value (an expression) from true to false or vice versa on click
    FlipButton: {
        "class": "DepressWhileMouseDown",
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchValue: {
                        to: "$value",
                        merge: [not, "$value"]
                    }
                }
            }
        }
    },

    DepressWhileMouseDown: o({
        "class": "Clickable"
    }, {
            qualifier: { selected: true },
            display: {
                padding: 1
            }
        }),

    /// Unpositioned text input; writes to value; type can be "text" or "number".
    TextValueInput: o({
        context: {
            value: mustBeDefined,
            type: mustBeDefined,
            "*editMode": false,
            indicateEditability: false
        },
        display: {
            text: {
                "class": "Font",
                value: [{ value: _ }, [me]]
            }
        }
    }, {
        qualifier: { indicateEditability: true },
        display: {
            borderBottomColor: [{ primaryTextColor: _ }, [globalDefaults]],
            borderBottomWidth: 1,
            borderBottomStyle: "solid"
        }
    }, {
        qualifier: { editMode: true },
        display: {
            borderBottomColor: [{ primaryTextColor: _ }, [globalDefaults]],
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            text: {
                input: {
                    type: [{ type: _ }, [me]],
                    init: {
                        selectionStart: 0,
                        selectionEnd: 32767
                    }
                }
            }
        },
        write: {
            onAcceptEdit: {
                upon: o(
                    [{ type: "MouseDown", recipient: n("start", [me], "end") }, [message]],
                    [{ type: "KeyDown", key: o("Return", "Tab") }, [myMessage]]
                ),
                true: {
                    continuePropagation: true,
                    writeValue: {
                        to: [{ value: _ }, [me]],
                        merge: [{ param: { input: { value: _ } } }, [me]]
                    },
                    endEdit: {
                        to: [{ editMode: _ }, [me]],
                        merge: false
                    }
                }
            },
            onRevert: {
                upon: [{ type: "KeyDown", key: "Esc" }, [myMessage]],
                true: {
                    endEdit: {
                        to: [{ editMode: _ }, [me]],
                        merge: false
                    }
                }
            }
        }
    }, {
        qualifier: { editMode: false },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchToEditMode: {
                        to: [{ editMode: _ }, [me]],
                        merge: true
                    }
                }
            }
        }
    }),

    BlockEvents: {
        write: {
            block: {
                upon: [{ type: true }, [myMessage]],
                true: {
                    continuePropagation: false
                }
            }
        }
    },

    /// Covers the entire application with a half-transparent black layer and
    /// presents the child "dialog" in the center on a white, rounded area,
    /// complete with close control
    ModalLayer: o({
        "class": "BlockEvents",
        independentContentPosition: false,
        embedding: "referred",
        context: {
            openControl: mustBeDefined,
            showCloseControl: true
        },
        display: {
            background: "black",
            opacity: 0.4,
            pointerOpaque: true
        },
        position: {
            frame: 0
        },
        stacking: {
            aboveSiblings: {
                lower: [embedding],
                higher: [me]
            }
        },
        children: {
            dialog: {
                description: {
                    display: {
                        background: "white",
                        borderRadius: 20
                    },
                    position: {
                        "horizontal-center": 0,
                        "vertical-center": 0
                    }
                }
            }
        }
    }, {
        qualifier: { showCloseControl: true },
        "children.dialog.description": {
            "children.closeControl.description": {
                "class": {
                    name: "CloseButton",
                    destination: [{ openControl: _ }, [embedding, [embedding]]],
                    value: false
                },
                position: {
                    top: 8,
                    right: 8,
                    width: 16,
                    height: 16
                }
            }
        },
        write: {
            onEscape: {
                upon: [{ key: "Esc" }, [message]],
                true: {
                    doSomething: {
                        to: [{ openControl: _ }, [me]],
                        merge: false
                    }
                }
            }
        }
    }),

    ChoiceButton: {
        "class": "BasicListInArea",
        context: {
            choices: mustBeDefined,
            value: mustBeDefined,
            listData: [{ choices: _ }, [me]]
        },
        children: {
            items: {
                description: {
                    display: {
                        text: {
                            value: [{ content: { text: _ } }, [me]]
                        }
                    }
                }
            }
        }
    },

    RemoteConnectionStateIndicator: o({
        context: {
            connectionError: [notEqual, [{ errorId: _ }, [tempAppStateConnectionInfo]], 0]
        }
    }, {
        qualifier: { connectionError: true },
        display: {
            borderBottomColor: "red",
            borderBottomStyle: "solid",
            borderBottomWidth: 2,
            hoverText: [
                translateError,
                [{ errorMessage: _ }, [tempAppStateConnectionInfo]]
            ]
        }
    }),

    TextLabel14Px: {
        display: {
            text: {
                "class": "Font",
                fontSize: 14,
                fontWeight: 100,
                textAlign: "left",
                value: "$text"
            }
        }
    },

    TextLabel20PxOnBackground: {
        display: {
            background: "$background",
            text: {
                "class": "Font",
                fontSize: 20,
                fontWeight: 400,
                color: "white",
                value: "$text"
            }
        }
    },

    UnderlinedTextLabel14Px: {
        display: {
            text: {
                "class": "Font",
                fontSize: 14,
                fontWeight: 400,
                color: [{ primaryTextColor: _ }, [globalDefaults]],
                textAlign: "left",
                textDecoration: "underline",
                value: "$text"
            }
        }
    },

    UnderlinedTextLabel20Px: {
        display: {
            text: {
                "class": "Font",
                fontSize: 20,
                fontWeight: 400,
                color: [{ primaryTextColor: _ }, [globalDefaults]],
                textAlign: "left",
                textDecoration: "underline",
                value: "$text"
            }
        }
    },

    FocusRingContext: {
        context: {
            focusAreas: mustBeDefined
        }
    },

    FocusRing: {
        write: {
            onTab: {
                upon: [{ type: "KeyDown", key: "Tab" }, [myMessage]],
                true: {
                    setFocusToNextElement: {
                        to: [
                            { param: { input: { focus: _ } } },
                            [replaceEmpty,
                                [next,
                                    [{ focusAreas: _ }, [myContext, "FocusRing"]],
                                    [me]
                                ],
                                [first, [{ focusAreas: _ }, [myContext, "FocusRing"]]]
                            ]
                        ],
                        merge: true
                    }
                }
            }
        }
    },

    HighlightOnHover: o({
        context: {
            hover: [{ param: { pointerInArea: _ } }, [me]],
            hoverHighlightColor: "lightgrey"
        }
    }, {
            qualifier: { hover: true },
            display: {
                background: [{ hoverHighlightColor: _ }, [me]]
            }
        }, {
            qualifier: { hover: true, hoverTextHighlighColor: true },
            display: {
                text: {
                    color: [{ hoverTextHighlighColor: _ }, [me]]
                }
            }
        }),

    // Override immediateVisibilityWrtElement to determine positioning wrt
    // another element
    GuaranteeImmediateVisibility: o({
        context: {
            "*immediateVisibility": true,
            immediateVisibilityWrtElement: mustBeDefined
        },
        write: {
            onImmediateVisibility: {
                upon: [{ immediateVisibility: _ }, [me]],
                true: {
                    resetImmediateVisibility: {
                        to: [{ immediateVisibility: _ }, [me]],
                        merge: false
                    }
                }
            }
        }
    }, {
            qualifier: { immediateVisibility: true },
            position: {
                belowTop: {
                    point1: { type: "top", element: [{ immediateVisibilityWrtElement: _ }, [me]] },
                    point2: { type: "top" },
                    min: 0
                },
                aboveBottom: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom", element: [{ immediateVisibilityWrtElement: _ }, [me]] },
                    min: 0
                },
                rightOfLeft: {
                    point1: { type: "left", element: [{ immediateVisibilityWrtElement: _ }, [me]] },
                    point2: { type: "left" },
                    min: 0
                },
                leftOfRight: {
                    point1: { type: "right" },
                    point2: { type: "right", element: [{ immediateVisibilityWrtElement: _ }, [me]] },
                    min: 0
                }
            }
        }),

    OpenURLOnClick: {
        context: {
            url: mustBeDefined
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    openURL: {
                        to: [systemInfo],
                        merge: {
                            url: [{url: _}, [me]],
                            newWindow: true,
                            target: [{url: _}, [me]]
                        }
                    }
                }
            }
        }
    },

    StretchedList: o({
        context: {
            listData: mustBeDefined,
            listOrder: "top-down",
            itemSpacing: 0,
            outsideOffset: 0
        },
        children: {
            items: {
                data: [{ listData: _ }, [me]],
                description: {
                    content: [{ param: { areaSetContent: _ } }, [me]],
                    position: {
                        itemSize: {
                            pair1: {
                                point1: { type: [{ startLabel: _ }, [embedding]], element: [embedding] },
                                point2: { label: "sizepoint", element: [embedding] }
                            },
                            pair2: {
                                point1: { type: [{ startLabel: _ }, [embedding]] },
                                point2: { type: [{ endLabel: _ }, [embedding]] }
                            },
                            ratio: 1
                        },
                        itemOrder: {
                            point1: {
                                type: [{ endLabel: _ }, [embedding]],
                                element: [prev]
                            },
                            point2: {
                                type: [{ startLabel: _ }, [embedding]]
                            },
                            equals: [{ itemSpacing: _ }, [embedding]]
                        }
                    }
                }
            }
        },
        position: {
            singleItemLabel: {
                point1: { type: [{startLabel: _}, [me]] },
                point2: { label: "sizepoint", element: [me] },
                min: 0
            },
            firstItem: {
                point1: { type: [{startLabel: _}, [me]] },
                point2: { type: [{startLabel: _}, [me]], element: [first, [{children: {items: _}}, [me]]] },
                equals: [{ outsideOffset: _ }, [me]]
            },
            lastItem: {
                point1: { type: [{endLabel: _}, [me]], element: [last, [{children: {items: _}}, [me]]] },
                point2: { type: [{endLabel: _}, [me]] },
                equals: [{ outsideOffset: _ }, [me]]
            }
        }
    }, {
        qualifier: { listOrder: "top-down" },
        context: {
            startLabel: "top",
            endLabel: "bottom"
        },
        children: {
            items: {
                description: {
                    position: {
                        left: 0,
                        right: 0
                    }
                }
            }
        }
    }, {
        qualifier: { listOrder: "left-right" },
        context: {
            startLabel: "left",
            endLabel: "right"
        },
        children: {
            items: {
                description: {
                    position: {
                        top: 0,
                        bottom: 0
                    }
                }
            }
        }
    }),

    WheelScroll: o({
        context: {
            "*wheelOffset": o(),
            "*wheelScrollStage": 0
        },
        write: {
            onWheel: {
                upon: [{type: "Wheel"}, [myMessage]],
                true: {
                    setWheelOffset: {
                        to: [{wheelOffset: _}, [me]],
                        merge: [minus,
                            [offset, {type: "top", element: [embedding]}, {type: "top"}],
                            [{deltaY: _}, [myMessage]]
                        ]
                    },
                    initWheelScroll: {
                        to: [{wheelScrollStage: _}, [me]],
                        merge: 1
                    }
                },
                false: {
                    setWheelOffset: {
                        to: [{wheelScrollStage: _}, [me]],
                        merge: 2
                    }
                }
            },
            onEndOfSequence: {
                upon: [equal, [{wheelScrollStage: _}, [me]], 2],
                true: {
                    setWheelOffset: {
                        to: [{wheelScrollStage: _}, [me]],
                        merge: 0
                    }
                }
            }
        }
    }, {
        qualifier: {wheelScrollStage: o(1, 2)},
        position: {
            jumpToLabel: {
                point1: { type: "top", element: [embedding] },
                point2: { type: "top" },
                equals: [{wheelOffset: _}, [me]]
            }
        }
    }),

    FixedMatrix: {
        context: {
            matrixData: mustBeDefined,
            nrColumns: mustBeDefined,
            horizontalSpacing: 0,
            verticalSpacing: 0,
            topOffset: [{verticalSpacing: _}, [me]],
            leftOffset: [div, [{horizontalSpacing: _}, [me]], 2],
            rightOffset: [div, [{horizontalSpacing: _}, [me]], 2],
            cellHeight: mustBeDefined,
            matrixWidth: [offset, {type: "left"}, {type: "right"}],
            cellWidth: [
                div,
                [minus,
                    [{matrixWidth: _}, [me]],
                    [plus,
                        [mul, [minus, [{nrColumns: _}, [me]], 1], [{horizontalSpacing: _}, [me]]],
                        [plus, [{leftOffset: _}, [me]], [{rightOffset: _}, [me]]]
                    ]
                ],
                [{nrColumns: _}, [me]]
            ]
        },
        children: {
            cells: {
                data: [{matrixData: _}, [me]],
                description: {
                    "class": "FixedMatrixCell"
                }
            }
        }
    },

    AutoSizeFixedMatrix: {
        "class": "FixedMatrix",
        context: {
            minCellWidth: mustBeDefined,
            acceptableSpill: 0,
            divisors: [
                map,
                [defun, "nrColumns",
                    {
                        nrColumns: "nrColumns",
                        mod: [mod, [size, [{matrixData: _}, [me]]], "nrColumns"],
                        width: [
                            div,
                            [minus,
                                [{matrixWidth: _}, [me]],
                                [plus,
                                    [mul, [minus, "nrColumns", 1], [{horizontalSpacing: _}, [me]]],
                                    [plus, [{leftOffset: _}, [me]], [{rightOffset: _}, [me]]]
                                ]
                            ],
                            "nrColumns"
                        ]
                    }
                ],
                [sequence, r(1, [size, [{matrixData: _}, [me]]])]
            ],
            nrColumns: [
                replaceEmpty,
                [
                    last,
                    [
                        {
                            mod: [{acceptableSpill: _}, [me]],
                            width: r([{minCellWidth: _}, [me]], Infinity),
                            nrColumns: _
                        },
                        [{divisors: _}, [me]]
                    ]
                ],
                1
            ]
        }
    },

    FixedMatrixCell: {
        content: [{param: {areaSetContent: _}}, [me]],
        context: {
            cellIndex: [{param: {areaSetAttr: _}}, [me]],
            rowIndex: [floor, [div, [{cellIndex: _}, [me]], [{nrColumns: _}, [embedding]]]],
            columnIndex: [mod, [{cellIndex: _}, [me]], [{nrColumns: _}, [embedding]]]
        },
        position: {
            top: [plus,
                    [mul,
                        [{rowIndex: _}, [me]],
                        [plus,
                            [{cellHeight: _}, [embedding]],
                            [{verticalSpacing: _}, [embedding]]
                        ]
                    ],
                    [{topOffset: _}, [embedding]]
                ],
            left: [plus,
                    [mul,
                      [{columnIndex: _}, [me]],
                        [plus,
                            [{cellWidth: _}, [embedding]],
                            [{horizontalSpacing: _}, [embedding]]
                        ]
                    ],
                    [{leftOffset: _}, [embedding]]
                ],
            height: [{cellHeight: _}, [embedding]],
            width: [{cellWidth: _}, [embedding]]
        }
    }

};
