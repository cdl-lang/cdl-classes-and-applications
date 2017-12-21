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
    ElementDisplay: {
        "class": "GeneralArea",
        context: {
            girth: 80,
            // MemberOfLeftToRightAreaOS param - used by inheriting classes
            spacingFromPrev: 2
        },
        display: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "black"
        }
    },
    
    Column: {
        "class": o("ElementDisplay", "MemberOfLeftToRightAreaOS"),
        context: {
            myCells: [
                      { myColumn: [me] },
                      [areaOfClass, "Cell"]
                     ]
        },
        position: {
            top: 100,
            width: [{ girth:_ }, [me]],
            bottomConstraint: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [last, [{ children: { rows:_ } }, [embedding]]],
                    type: "bottom"
                }
            }
        }
    },
    
    Row: {
        "class": o("ElementDisplay", "MemberOfTopToBottomAreaOS"),
        context: {
            myCells: [
                      { myRow: [me] },
                      [areaOfClass, "Cell"]
                     ]
        },
        position: {
            left: 100,
            height: [{ girth:_ }, [me]],
            rightConstraint: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [last, [{ children: { columns:_ } }, [embedding]]],
                    type: "right"
                }
            }
        },
        children: {
            intersection: {
                partner: [areaOfClass, "Column"],
                description: {
                    "class": "Cell"
                }
            }
        }
    },

    Cell: o(
        { // default
            "class": o("Tmdable","GeneralArea"),
            context: {
                myRow: [expressionOf],
                myColumn: [referredOf],
                myPeerCells: o(
                               [{ myRow: { myCells:_ } }, [me]],
                               [{ myColumn: { myCells:_ } }, [me]]
                              ),
                "^borderWidth": 1
            },
            position: {
                leftConstraint: {
                    point1: { intersection: true, type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
                rightConstraint: {
                    point1: { type: "right" },
                    point2: { intersection: true, type: "right" },
                    equals: 0
                },
                topConstraint: {
                    point1: { intersection: true, type: "top" },
                    point2: { type: "top" },
                    equals: 0
                },
                bottomConstraint: {
                    point1: { intersection: true, type: "bottom" },
                    point2: { type: "bottom" },
                    equals: 0
                }                
            },
            independentContentPosition: false, // content defined by frame
            content: [intersection],
            display: {
                borderWidth: [{ borderWidth:_ }, [me]],
                borderStyle: "solid",
                borderColor: "red"
            },
            write: {
                onNoCtrlMouseDown: {
                    upon: [and,
                           [{ type: "MouseDown" }, [myMessage]],
                           [not, [{ modifier: "control"}, [myMessage]]]
                          ],
                    true: {
                        incrementBorderWidth: {
                            to: [{ myPeerCells: { borderWidth:_ } }, [me]],
                            merge: [plus, [{ borderWidth:_ }, [me]], 1] 
                        }
                    }
                },
                onCtrlMouseDown: {
                    upon: [{ 
                            type: "MouseDown",
                            modifier: "control"
                           }, 
                           [myMessage]],
                    true: {
                        decrementBorderWidth: {
                            to: [{ myPeerCells: { borderWidth:_ } }, [me]],
                            merge: [minus, [{ borderWidth:_ }, [me]], 1] 
                        }
                    }
                }
            }
        },
        {
            qualifier: { tmd: true },
            "class": "DefaultDisplayText",
            context: {
                displayText: [{ borderWidth:_ }, [me]]
            }
        },
        {
            qualifier: { inArea: true },
            display: { background: "green" }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Click or Ctrl+Click on a cell to modify the border width of all cells in its column/row."
        },
        position: {
            height: 50
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CheckersTestApp: {
        "class": "TestApp",
        content: [sequence, r(0, 7)],
        children: {
            annotation: {
                description: {
                    "class": "TestAnnotation"
                }
            },
            columns: {
                data: [{ content: _ }, [me]],
                description: {
                    "class": "Column"
                }
            },
            rows: {
                data: [{ content: _ }, [me]],
                description: {
                    "class": "Row"
                }
            }
        },
        position: {
            positionFirstColumn: {
                point1: {
                    type: "left"
                },
                point2: {
                    element: [first, [{children: {columns:_}}, [me]]],
                    type: "left"
                },
                equals: 100
            },
            positionFirstRow: {
                point1: {
                    type: "top"
                },
                point2: {
                    element: [first, [{children: {rows:_}}, [me]]],
                    type: "top"
                },
                equals: 100
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        
    }
};

var screenArea = {
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "CheckersTestApp"
            }
        }
    }
};
