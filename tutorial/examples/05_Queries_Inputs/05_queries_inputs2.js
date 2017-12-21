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
    ///////////////////////////////////////

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

    ///////////////////////////////////////

    SwitchInput:
    o(
        {
            qualifier: "!",
            context: {
                "^qryLineActive": false,
                "^qryToBeMatched": "xxx",
            },
            display: {
                background: "#bbbbbb",
                text: {
                    value: [{ qryToBeMatched: _ },
                    [me]]
                }
            }
        },
        {
            "class": "ClickerValueSwitch",
            context: {
                valueToBeFlipped: [{ qryLineActive: _ }, [me]]
            }
        },
        {
            qualifier: { qryLineActive: true },
            context: {
                current_text: [{ param: { input: { value: _ } } },
                [me]],
            },
            display: {
                background: "#dddddd",
                text: {
                    input: {
                        type: "text",
                        placeholder: "text here",
                        init: {
                            selectionStart: 0,
                            selectionEnd: 3,
                            focus: true
                        }
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////

    Cell: {
        "class": "CellColor",
        context: {
            value: [{ param: { areaSetContent: _ } }, [me]],
            cellInSelectedQry:
            [
                [{ onlyMatchedToQry: _ }, [embedding]],
                [{ value: _ }, [me]]
            ]
        },
        position: {
            left: 3,
            right: 3,
            height: 20,
            topFromPrevious: {
                point1: {
                    type: "bottom",
                    element: [prev, [me]]
                },
                point2: {
                    type: "top", element: [me]
                },
                equals: 10
            }
        }
    },

    //////////////////////////////////////////////////////

    CellColor: o(
        {
            context: {
                paintUnMatchedInQry: [{ reverseSelectionON: _ }, [areaOfClass, "ReverseSelection"]]
            },

            display: {
                background: "white",
                text: {
                    value: [{ value: _ }, [me]]
                }
            }
        },
        {
            qualifier: { cellInSelectedQry: true },
            display: {
                background: "yellow"
            }
        },
        {
            qualifier: { paintUnMatchedInQry: true },
            display: {
                background: "grey"
            }
        }

    ),

    /////////////////////////////////////////////////////////

    ToggleButton: o(
        {
            "class": "ClickerValueSwitch",
            context: {
                "^showOnlySelection": false,
                valueToBeFlipped: [{ showOnlySelection: _ }, [me]]
            },
            position: {
                width: 100,
                height: 20
            },
            display: {
                background: "white",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            }
        },
        {
            qualifier: { showOnlySelection: false },
            display: {
                text: { value: "memory off" }
            }
        },
        {
            qualifier: { showOnlySelection: true },
            display: {
                text: { value: "memory on" }
            }
        }
    ),

    //////////////////////////////////////////////////////////

    ReverseSelection: o(
        {
            "class": "ClickerValueSwitch",
            context: {
                "^reverseSelectionON": false,
                hideUnmatched: [{ showOnlySelection: _ }, [areaOfClass, "ToggleButton"]]
            }
        },
        {
            qualifier: { hideUnmatched: false },
            context: {
                valueToBeFlipped: [{ reverseSelectionON: _ }, [me]]
            },
            display: {
                text: {
                    value: [cond, [{ reverseSelectionON: _ }, [me]],
                        o(
                            {
                                on: true, use:
                                " Un ON"
                            },
                            {
                                on: false, use:
                                "Un OFF"
                            }
                        )
                    ]
                }

            }
        },
        {
            qualifier: { hideUnmatched: true },
            display: {
                text: {
                    value: "Inactive"
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////

    SortingDisplayedData: {
        context: {
            referenceToAreaHoldQry: [areaOfClass, "SwitchInput"],
            onlyMatchedToQry: s
                (
                [{ current_text: _ }, [{ referenceToAreaHoldQry: _ }, [me]]]
                ),
            outOfQry: n
                (
                [{ onlyMatchedToQry: _ }, [me]]
                ),
        }
    },
    ListOfObjects: {
        context: {
            someInfo: o(
                "house", "horse", "mouth", "castle", "mouse", "cat", "dog", "hat"
            )
        }
    }
};

var screenArea = {
    display: {
        background: "#bbbbbb",
    },
    children: {
        checkCheck: {
            description: {
                position: {
                    right: 50,
                    top: 50,
                    width: 200,
                    height: 100
                },
            }
        },
        input: {
            description: {
                "class": "SwitchInput",
                position: {
                    top: 10,
                    left: 50,
                    height: 30,
                    width: 100
                }
            }
        },
        myData: {
            description: {
                "class": o("SortingDisplayedData", "ListOfObjects"),
                position: {
                    left: 50,
                    top: 50,
                    height: 250,
                    width: 150,
                    topOfFirstChild: {
                        point1: { type: "top", element: [me] },
                        point2: {
                            type: "top", element:
                            [first, [{ children: { dataCells: _ } }, [me]]]
                        },
                        equals: 10
                    }
                },
                display: {
                    background: "white",
                },
                children: {
                    dataCells: {
                        data: [cond, [{ showOnlySelection: _ }, [areaOfClass, "ToggleButton"]],
                            o(
                                {
                                    on: false, use:
                                    [cond, [{ reverseSelectionON: _ }, [areaOfClass, "ReverseSelection"]],
                                        o(
                                            {
                                                on: false, use:
                                                [
                                                    { someInfo: _ }, [me]
                                                ]
                                            },
                                            {
                                                on: true, use:
                                                [
                                                    [{ outOfQry: _ }, [me]],
                                                    [{ someInfo: _ }, [me]]
                                                ]
                                            }
                                        )
                                    ]
                                },
                                {
                                    on: true, use:
                                    [
                                        [{ onlyMatchedToQry: _ }, [me]],
                                        [{ someInfo: _ }, [me]]

                                    ]
                                }
                            )
                        ],
                        description: {
                            "class": "Cell"
                        }
                    }
                }
            }
        },
        toggleButton: {
            description: {
                "class": "ToggleButton",
                position: {
                    underDataArea: {
                        point1: {
                            type: "bottom",
                            element: [{ children: { myData: _ } }, [embedding]]
                        },
                        point2: { type: "top" },
                        equals: 5
                    },
                    rightAlignDataArea: {
                        point1: {
                            type: "right",
                            element: [{ children: { myData: _ } }, [embedding]]
                        },
                        point2: { type: "right" },
                        equals: 0
                    }
                }
            }
        },
        reverseSelectionButton: {
            description: {
                "class": "ReverseSelection",
                position: {
                    rightAlignDataArea: {
                        point1: {
                            type: "right",
                            element: [{ children: { myData: _ } }, [embedding]]
                        },
                        point2: { type: "right" },
                        equals: 0
                    },
                    underToggleButton: {
                        point1: {
                            type: "bottom",
                            element: [areaOfClass, "ToggleButton"]
                        },
                        point2: {
                            type: "top"
                        },
                        equals: 10
                    },
                    height: 20,
                    width: 100
                },
                display: {
                    background: "grey"
                }
            }

        },
    }
};