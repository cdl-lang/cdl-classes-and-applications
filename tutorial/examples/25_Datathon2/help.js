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


// %%include%%: "../18_BasicClasses/events.js"

var classes = {

    /// Inherit this class if an area should show a tooltip text.
    ShowHelpToolTip: {
        context: {
            /// The contents of the tooltip
            helpToolTipText: mustBeDefined,
            /// Title of the tooltip
            helpToolTipTitle: o(),
            /// When this is true, the tooltip contains a button that will open
            /// the help viewer, which displays this URL.
            extHelpToolTipSrc: false,
            /// The edge where the tooltip should be shown
            toolTipEdge: "bottom",
            /// The width of the tooltip
            toolTipWidth: 400,
            /// Delay time in seconds
            toolTipDelay: 1.5,
            /// When true, the tooltip will stay even when the pointer leaves
            /// the area. Only works in combination with providing an explicit
            /// area to align to.
            toolTipIsSticky: false,
            /// Area to align the tooltip with; only needed when you want it to
            /// appear next to another area or when toolTipIsStick is true.
            toolTipPositioningArea: o()
        }
    },

    /// The help tooltip is a popup, which gets its content from, and is aligned
    /// to the topmost area inheriting ShowHelpToolTip (after a short delay).
    /// The that area also defines extHelpToolTipSrc, an extra area is added
    /// which will open the HelpViewer area on click.
    HelpToolTip: o({
        "class": "AreaWithPopUpAlignedToSide",
        context: {
            tipSize: 16,

            /// When true, the tooltip is closed, and won't show up again until
            /// the user has moved the mouse and hovered above an area.
            /// When this points to extHelpSrc of the HelpViewer area, the
            /// tooltip is closed on showing that area.
            close: mustBeDefined,

            /// Topmost area under pointer that inherits class ShowHelpToolTip.
            areaWithTooltipUnderPointer: [
                first,
                [
                    [areasUnderPointer],
                    [areaOfClass, "ShowHelpToolTip"]
                ]
            ],

            /// The delay for the pop-up in seconds.
            delay: [{areaWithTooltipUnderPointer: {toolTipDelay: _}}, [me]],

            /// When true, the tooltip will stay even when the pointer leaves
            /// the area. Only works in combination with providing an explicit
            /// area to align to.
            makeSticky: [{areaWithTooltipUnderPointer: {toolTipIsSticky: _}}, [me]],

            /// Stores the areaWithTooltipUnderPointer when makeSticky is true
            "*stickyArea": o(),

            /// Position in the list of tooltip texts
            "*toolTipStep": 0,

            contentArea: [replaceEmpty,
                [first, [{stickyArea: _}, [me]]],
                [{areaWithTooltipUnderPointer: _}, [me]]
            ],

            /// The pop-up is shown when close is false, there is an area that
            /// inherits ShowHelpToolTip under the pointer, and it has been the
            /// same for the last ``delay'' seconds.
            showPopUp: [or,
                [{stickyArea: _}, [me]],
                [and,
                    [not, [{close: _}, [myContext, "App"]]],
                    [{areaWithTooltipUnderPointer: _}, [me]],
                    [greaterThanOrEqual,
                        [time, [{areaWithTooltipUnderPointer: _}, [me]], [{delay: _}, [me]]],
                        [{delay: _}, [me]]
                    ]
                ]
            ],

            singleOrIndexed: [
                defun, "list",
                [cond,
                    [size, "list"], o({
                        on: [size, [{mainText: _}, [me]]],
                        use: [pos, [{toolTipStep: _}, [me]], "list"]
                    }, {
                        on: null,
                        use: "list"
                    }
                )]
            ],

            // Get the content from the tool-tip requesting area
            title: [{contentArea: {helpToolTipTitle: _}}, [me]],
            mainText: [{contentArea: {helpToolTipText: _}}, [me]],
            extHelpSrc: [{contentArea: {extHelpToolTipSrc: _}}, [me]],
            popUpOrientation: [
                [{singleOrIndexed: _}, [me]],
                [{contentArea: {toolTipEdge: _}}, [me]]
            ],
            width: [{contentArea: {toolTipWidth: _}}, [me]],
            // Intersection is with "App" by default
            partnerArea: [myContext, "App"],

            // Place the tooltip next to the requesting area instead of this area
            // (which is a single area somewhere near the top of App). If the
            // tooltip area defines toolTipPositioningArea, place it there
            // instead; when there are multiple, take the one of the current step.
            alternativePositioningArea: [
                [{singleOrIndexed: _}, [me]],
                [{contentArea: {toolTipPositioningArea: _}}, [me]]
            ],
            positionWrtElement: [
                replaceEmpty,
                [{alternativePositioningArea: _}, [me]],
                [{contentArea: _}, [me]]
            ]
        }
    }, {
        qualifier: {showPopUp: true},
        "children.popup.description": {
            propagatePointerInArea: [{positionWrtElement: _}, [me]],
            "children.body.description": {
                "class": "HelpToolTipBody"
            }
        }
    }, {
        qualifier: {showPopUp: true, makeSticky: true},
        "children.popup.description": {
            write: {
                onCreation: {
                    upon: true,
                    true: {
                        reinitializeSticky: {
                            to: [{stickyArea: _}, [expressionOf]],
                            merge: [{areaWithTooltipUnderPointer: _}, [expressionOf]]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {showPopUp: true, stickyArea: true},
        "children.popup.description": {
            "children.body.description": {
                "children.closeButton.description": {
                    "class": {
                        name: "CloseButton",
                        destination: [{stickyArea: _}, [expressionOf, [embedding, [embedding]]]],
                        value: o()
                    },
                    position: {
                        top: 0,
                        right: 0,
                        width: 16,
                        height: 16
                    }
                }
            }
        }        
    }),

    HelpToolTipBody: o({
        context: {
            extHelpSrc: [{extHelpSrc: _}, [expressionOf, [embedding]]],
            step: [{toolTipStep: _}, [expressionOf, [embedding]]],
            mainText: [{mainText: _}, [expressionOf, [embedding]]],
            width: [{width: _}, [expressionOf, [embedding]]],
            title: [{title: _}, [expressionOf, [embedding]]],
            lowerStepAvailable: [greaterThan, [{step: _}, [me]], 0],
            higherStepAvailable: [lessThan,
                [{step: _}, [me]],
                [minus, [size, [{mainText: _}, [me]]], 1]
            ]
        },
        display: {
            background: "white",
            borderColor: [{lightPrimaryColor: _}, [globalDefaults]],
            borderStyle: "solid",
            borderWidth: 1
        },
        "children.mainText.description": {
            display: {
                text: {
                    "class": "Font",
                    fontSize: 13,
                    textAlign: "left",
                    verticalAlign: "top",
                    fontWeight: 100,
                    value: [pos,
                        [{step: _}, [embedding]],
                        [{mainText: _}, [embedding]]
                    ]
                }
            },
            position: {
                left: 24,
                right: 24,
                height: [displayHeight, {width: [minus, [{width: _}, [embedding]], 48]}]
            }
        },
        position: {
            width: [{width: _}, [expressionOf, [embedding]]]
        },
        write: {
            onOpening: {
                upon: true,
                true: {
                    doSomething: {
                        to: [{step: _}, [me]],
                        merge: 0
                    }
                }
            }
        }
    }, {
        qualifier: {title: false},
        "children.mainText.description": {
            position: {
                top: 24
            }
        }
    }, {
        qualifier: {title: true},
        "children.mainText.description": {
            position: {
                "class": { name: "BelowSibling", sibling: "title", distance: 24}
            }
        },
        "children.title.description": {
            display: {
                text: {
                    "class": "Font",
                    fontSize: 18,
                    textAlign: "left",
                    value: [{title: _}, [embedding]]
                }
            },
            position: {
                top: 8,
                left: 24,
                height: 24,
                right: 24
            }
        }
    }, {
        qualifier: {extHelpSrc: false},
        "children.mainText.description": {
            position: {
                // Bind the embedding's bottom to that of mainText and thus
                // define the height
                bottom: 24
            }
        }
    }, {
        qualifier: {extHelpSrc: true},
        "children.help2Button.description": {
            display: {
                background: [{lightPrimaryColor: _}, [globalDefaults]],
                text: {
                    "class": "Font",
                    fontSize: 13,
                    textDecoration: "underline",
                    color: "white",
                    value: "click for more information"
                }
            },
            position: {
                "class": { name: "BelowSibling", sibling: "mainText", distance: 24 },
                left: 0,
                height: 24,
                right: 0,
                bottom: 0
            },
            write: {
                onClick: {
                    upon: myClick,
                    true: {
                        copyHelpHTML: {
                            to: [{extHelpSrc: _}, [myContext, "ExtHelpSrc"]],
                            merge: [{extHelpSrc: _}, [expressionOf, [embedding, [embedding]]]]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {lowerStepAvailable: true},
        "children.backArrow.description": {
            display: {
                image: {
                    src: "design/img/ic_keyboard_arrow_right_48px.svg",
                    size: "100%"
                },
                transform: {
                    rotate: 180
                }
            },
            position: {
                left: 0,
                width: 16,
                height: 16,
                center: {
                    point1: { type: "vertical-center", element: [{children: {mainText: _}}, [embedding]] },
                    point2: { type: "vertical-center" },
                    equals: 0
                }
            },
            write: {
                onClick: {
                    upon: myClick,
                    true: {
                        back: {
                            to: [{step: _}, [embedding]],
                            merge: [minus, [{step: _}, [embedding]], 1]
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {higherStepAvailable: true},
        "children.forwardArrow.description": {
            display: {
                image: {
                    src: "design/img/ic_keyboard_arrow_right_48px.svg",
                    size: "100%"
                }
            },
            position: {
                right: 0,
                width: 16,
                height: 16,
                center: {
                    point1: { type: "vertical-center", element: [{children: {mainText: _}}, [embedding]] },
                    point2: { type: "vertical-center" },
                    equals: 0
                }
            },
            write: {
                onClick: {
                    upon: myClick,
                    true: {
                        forward: {
                            to: [{step: _}, [embedding]],
                            merge: [plus, [{step: _}, [embedding]], 1]
                        }
                    }
                }
            }
        }
    }),

    /// Include this class where both the tooltip and the HelpViewer can find it
    ExtHelpSrcContext: {
        context: {
            /// Holds url for the help text.
            "*extHelpSrc": o()
        }
    },

    HelpViewerContext: {
        context: {
            extHelpSrc: [{extHelpSrc: _}, [myContext, "ExtHelpSrcContext"]]
        }
    },

    /// Shows 
    HelpViewer: o({
        "class": "HelpViewerContext",
        context: {
            side: "left",
            helpPaneWidth: 400
        },
        children: {
            transparentPane: {
                description: {
                    "class": { name: "FlipButton", value: [{extHelpSrc: _}, [myContext, "App"]]},
                    propagatePointerInArea: o(),
                    display: {
                        pointerOpaque: true,
                        background: "black",
                        opacity: 0.1
                    },
                    position: {
                        top: 0,
                        bottom: 0
                    }
                }
            },
            helpPane: {
                description: {
                    propagatePointerInArea: o(),
                    display: {
                        background: "white",
                        iframe: {
                            src: [{extHelpSrc: _}, [embedding]]
                        }
                    },
                    position: {
                        top: 0,
                        bottom: 0,
                        width: [{helpPaneWidth: _}, [embedding]]
                    }
                }
            }
        },
        position: {
            frame: 0
        },
        write: {
            onEscape: {
                upon: [{type: "KeyDown", key: "Esc", recipient: "global"}, [message]],
                true: {
                    close: {
                        to: [{extHelpSrc: _}, [myContext, "App"]],
                        merge: false
                    }
                }
            }
        }
    }, {
        qualifier: {side: "left"},
        children: {
            transparentPane: {
                description: {
                    position: {
                        left: [{helpPaneWidth: _}, [embedding]],
                        right: 0
                    }
                }
            },
            helpPane: {
                description: {
                    position: {
                        left: 0
                    }
                }
            }
        }
    }, {
        qualifier: {side: "right"},
        children: {
            transparentPane: {
                description: {
                    position: {
                        left: 0,
                        right: [{helpPaneWidth: _}, [embedding]]
                    }
                }
            },
            helpPane: {
                description: {
                    position: {
                        right: 0
                    }
                }
            }
        }
    })
};
