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

// %%classfile%%: "../../tutorial/examples/25_Datathon2/misc.js"
// %%classfile%%: "../../tutorial/examples/26_Menu/menus.js"
// %%classfile%%: "../../tutorial/examples/18_BasicClasses/matrixLayout.js"

var classes = {
    App: {
        "class": o("NonAreaSetWithScrollBar"),
        context: {
            anchoredChild: [{children: {scrollableView: {children: {text1: _}}}}, [me]],
            documentSize: [{children: {scrollableView: {documentSize: _}}}, [me]],
            scrollView: [{children: {scrollableView: _}}, [me]],
            
        },
        display: {
            background: "white"
        },
        children: {
            top: {
                description: {
                    display: {
                        background: "black",
                        opacity: 0.6
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: 48,
                        right: 0
                    },
                    stacking: {
                        onTop: {
                            lower: [embedding],
                            higher: [me]
                        }
                    },
                    children: {
                        logo: {
                            description: {
                                display: {
                                    image: {
                                        src: "%%image:(cdllogo.png)%%",
                                        size: "100%"
                                    },
                                    filter: {
                                        invert: "100%"
                                    }
                                },
                                position: {
                                    top: 0,
                                    left: 16,
                                    bottom: 0,
                                    width: 100
                                }
                            }
                        },
                        github: {
                            description: {
                                "class": "OpenURLOnClick",
                                context: {
                                    url: "https://github.com"
                                },
                                display: {
                                    image: {
                                        src: "%%image:(github.svg)%%",
                                        size: "100%"
                                    },
                                    filter: {
                                        invert: "100%"
                                    }
                                },
                                position: {
                                    top: 8,
                                    right: 16,
                                    width: 32,
                                    height: 32
                                }
                            }
                        }
                    }
                }
            },
            picture: {
                description: {
                    display: {
                        background: {
                            image: "landscape-sky-night-stars.jpg",
                            repeat: "x"
                        },
                        filter: {
                            hueRotate: "45deg",
                            saturate: "80%"
                        }
                    },
                    children: {
                        text: {
                            description: {
                                display: {
                                    text: {
                                        "class": "Font",
                                        color: "white",
                                        fontSize: 48,
                                        fontWeight: 100,
                                        value: "CDL - a Functional Language\nfor Web Applications"
                                        // textShadow: {
                                        //     color: "white",
                                        //     horizontal: 0,
                                        //     vertical: 0,
                                        //     blurRadius: 3
                                        // }
                                    }
                                },
                                position: {
                                    frame: 0
                                }
                            }
                        }
                    },
                    position: {
                        top: 0,
                        left: 0,
                        height: 300,
                        right: 0
                    }
                }
            },
            scrollableView: {
                description: {
                    display: {
                        background: "white"
                    },
                    context: {
                        documentSize: [offset,
                            {type: "top", element: [{children: {text1: _}}, [me]]},
                            {type: "bottom", element: [{children: {tutDemContainer: _}}, [me]]}
                        ]
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "picture" },
                        left: 0,
                        bottom: 8,
                        right: 0
                    },
                    children: {
                        text1: {
                            description: {
                                "class": o("Draggable", "WheelScroll"),
                                display: {
                                    text: {
                                        "class": "Font",
                                        fontSize: 48,
                                        fontWeight: 100,
                                        textAlign: "left",
                                        verticalAlign: "bottom",
                                        value: "CDL is"
                                    }
                                },
                                position: {
                                    left: 0,
                                    height: 120,
                                    right: 0
                                }
                            }
                        },
                        descrContainer: {
                            description: {
                                "class": o("AutoSizeFixedMatrix", "Draggable", "WheelScroll"),
                                context: {
                                    matrixData: o({
                                        header: "Compositional",
                                        body: "Pieces of code can be composed with other pieces. This makes writing reuse easy and productive.",
                                        icon: "%%image:(if_stack_1054970.svg)%%"
                                    }, {
                                        header: "Declarative",
                                        body: "CDL is declarative. There are no sets of instructions, only relations. Relations are expressed functionally or through constraints.",
                                        icon: "%%image:(if_map_1055029.svg)%%"
                                    }, {
                                        header: "Data Driven",
                                        body: "Queries are first-class citizens in CDL. They have been defined with large datasets in mind, making data access easy and fast.",
                                        icon: "%%image:(if_bar-chart_1055117.svg)%%"
                                    }, {
                                        header: "Reactive",
                                        body: "As a result, apps written in CDL react incrementally and reliably to changes in data and events.",
                                        icon: "%%image:(if_speedometer_1054972.svg)%%"
                                    }),
                                    minCellWidth: 300,
                                    cellHeight: 120,
                                    horizontalSpacing: 40,
                                    verticalSpacing: 20,
                                    leftOffset: 20,
                                    rightOffset: 20,
                                    topOffset: 0
                                },
                                children: {
                                    cells: {
                                        description: {
                                            "class": o("TextWithHeader"),
                                            context: {
                                                header: [{content: {header: _}}, [me]],
                                                body: [{content: {body: _}}, [me]],
                                                icon: [{content: {icon: _}}, [me]]
                                            }
                                        }
                                    }
                                },
                                position: {
                                    "class": { name: "BelowSibling", sibling: "text1" },
                                    left: 0,
                                    right: 0,
                                    bottom: {
                                        point1: { type: "bottom", element: [last, [{children: {cells: _}}, [me]]] },
                                        point2: { type: "bottom"},
                                        equals: 4
                                    }
                                }
                            }
                        },
                        text2: {
                            description: {
                                "class": o("Draggable", "WheelScroll"),
                                display: {
                                    text: {
                                        "class": "Font",
                                        fontSize: 48,
                                        fontWeight: 100,
                                        textAlign: "left",
                                        verticalAlign: "bottom",
                                        value: "Tutorials and Demos"
                                    }
                                },
                                position: {
                                    "class": { name: "BelowSibling", sibling: "descrContainer" },
                                    keepUnderText1: {
                                        point1: { type: "bottom", element: [{children: {text1: _}}, [embedding]] },
                                        point2: { type: "top" },
                                        min: -70,
                                        priority: 1
                                    },
                                    left: 0,
                                    height: 120,
                                    right: 0
                                }
                            }
                        },
                        tutDemContainer: {
                            description: {
                                "class": o("AutoSizeFixedMatrix", "Draggable", "WheelScroll"),
                                context: {
                                    matrixData: o({
                                        header: "Hello World",
                                        body: "A classic. The simplest piece of code that shows some text on screen."
                                    }, {
                                        header: "Lists, Hover and more",
                                        body: "An example highlighting compositionality."
                                    }, {
                                        header: "Four on a Topological Row",
                                        body: "A variation on the well-known game, showing how interaction works and how powerful small variations can be."
                                    }, {
                                        header: "ESIF Viewer",
                                        body: "A full-fledged app built on a relatively complex dataset from the European Commission."
                                    }, {
                                        header: "Gold Star",
                                        body: "A demo app using the database of Olympic Medal winners."
                                    }),
                                    minCellWidth: 300,
                                    acceptableSpill: o(0, 2),
                                    cellHeight: 120,
                                    horizontalSpacing: 40,
                                    verticalSpacing: 20,
                                    leftOffset: 20,
                                    rightOffset: 20,
                                    topOffset: 0
                                },
                                children: {
                                    cells: {
                                        description: {
                                            "class": "TextWithHeader",
                                            context: {
                                                header: [{content: {header: _}}, [me]],
                                                body: [{content: {body: _}}, [me]]
                                            }
                                        }
                                    }
                                },
                                position: {
                                    "class": { name: "BelowSibling", sibling: "text2" },
                                    left: 0,
                                    right: 0,
                                    bottom: {
                                        point1: { type: "bottom", element: [last, [{children: {cells: _}}, [me]]] },
                                        point2: { type: "bottom"},
                                        equals: 4
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    Font: {
        fontFamily: '%%font:("Open Sans",https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700)%%,Arial,Sans-Serif'
    },

    TextWithHeader: {
        context: {
            header: mustBeDefined,
            body: mustBeDefined
        },
        children: {
            icon: {
                description: {
                    display: {
                        image: {
                            src: [{icon: _}, [embedding]],
                            size: "100%"
                        }
                    },
                    position: {
                        top: 10,
                        left: 0,
                        height: 48,
                        width: 48
                    }
                }
            },
            header: {
                description: {
                    display: {
                        text: {
                            "class": "Font",
                            color: "#333333",
                            fontWeight: 500,
                            fontSize: 24,
                            textAlign: "left",
                            verticalAlign: "top",
                            value: [{header: _}, [embedding]],
                            whiteSpace: "nowrap"
                        }
                    },
                    position: {
                        top: 0,
                        left: 60,
                        height: 40,
                        right: 0
                    }
                }
            },
            body: {
                description: {
                    display: {
                        text: {
                            "class": "Font",
                            color: "#333333",
                            fontWeight: 300,
                            fontSize: 14,
                            textAlign: "left",
                            verticalAlign: "top",
                            value: [{body: _}, [embedding]]
                        }
                    },
                    position: {
                        top: 40,
                        left: 60,
                        bottom: 24,
                        right: 0
                    }
                }
            },
            example: {
                description: {
                    "class": "OnClickOpenExample",
                    display: {
                        text: {
                            "class": "Font",
                            color: "#FF8F00",
                            fontWeight: 100,
                            fontSize: 18,
                            textAlign: "right",
                            verticalAlign: "bottom",
                            value: "Example"
                        }
                    },
                    position: {
                        bottom: 0,
                        left: 60,
                        height: 24,
                        width: [displayWidth]
                    }
                }
            },
            outIcon: {
                description: {
                    "class": "OnClickOpenExample",
                    display: {
                        image: {
                            src: "%%image:(ic_open_in_new_48px.svg)%%",
                            size: "100%"
                        }
                    },
                    position: {
                        "class": { name: "RightOfSibling", sibling: "example" },
                        bottom: 2,
                        width: 16,
                        height: 16
                    }
                }
            }
        }
    },

    OnClickOpenExample: {
        write: {
            onClick: {
                upon: myClick,
                true: {
                    writeURL: {
                        to: [{popupURL: _}, [my, "App"]],
                        merge: [{content: {exampleURL: _}}, [me]]
                    }
                }
            }
        }
    }
};

var screenArea = {
    "class": "App"
};
