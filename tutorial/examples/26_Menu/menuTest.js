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

// %%classfile%%: "menus.js"

var classes = {
    SquareFourSidedClickButton: o({
        context: {
            size: 100,
            xOffset: [{relX: _}, [myMessage]],
            yOffset: [{relY: _}, [myMessage]],
            aboveTopLeft2BottomRight: [greaterThan,
                [{xOffset: _}, [me]],
                [{yOffset: _}, [me]]
            ],
            aboveBottomLeft2TopRight: [greaterThan,
                [minus,
                    [{size: _}, [me]],
                    [{xOffset: _}, [me]]],
                [{yOffset: _}, [me]]
            ],
            "*popUpOrientation": ""
        },
        display: {
            borderColor: "grey",
            borderWidth: 1,
            borderStyle: "solid",
            text: {
                value: "Click on a side"
            }
        },
        write: {
            onClick: {
                upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                true: {
                    setOrientation: {
                        to: [{popUpOrientation: _}, [me]],
                        merge: [{clickSide: _}, [me]]
                    },
                    showPopUp: {
                        to: [{showPopUp: _}, [me]],
                        merge: true
                    }
                }
            }
        },
        position: {
            height: [{size: _}, [me]],
            width: [{size: _}, [me]]
        }
    }, {
        qualifier: {aboveTopLeft2BottomRight: true, aboveBottomLeft2TopRight: true},
        context: {
            clickSide: "top"
        }
    }, {
        qualifier: {aboveTopLeft2BottomRight: true, aboveBottomLeft2TopRight: false},
        context: {
            clickSide: "right"
        }
    }, {
        qualifier: {aboveTopLeft2BottomRight: false, aboveBottomLeft2TopRight: true},
        context: {
            clickSide: "left"
        }
    }, {
        qualifier: {aboveTopLeft2BottomRight: false, aboveBottomLeft2TopRight: false},
        context: {
            clickSide: "bottom"
        }
    }),

    SmallEmptyBody: {
        display: {
            borderStyle: "solid",
            borderColor: "lightgrey",
            borderWidth: 1,
            background: "white"
        },
        position: {
            width: 80,
            height: 80
        }
    },

    LargeEmptyBody: {
        display: {
            borderStyle: "solid",
            borderColor: "lightgrey",
            borderWidth: 1,
            background: "white"
        },
        position: {
            width: 80,
            height: 300
        }
    }
};

var screenArea = {
    children: {
        centerArea: {
            description: {
                "class": o("SquareFourSidedClickButton", "AreaWithPopUpAlignedToSide"),
                context: {
                    partnerArea: [embedding]
                },
                "children.popup.description": {
                    "children.body.description": {
                        "class": "SmallEmptyBody"
                    }
                },
                position: {
                    "horizontal-center": 0,
                    "vertical-center": 0
                }
            }
        },
        edgeArea: {
            description: {
                "class": o("SquareFourSidedClickButton", "AreaWithPopUpAlignedToSide"),
                context: {
                    partnerArea: [embedding]
                },
                "children.popup.description": {
                    "children.body.description": {
                        "class": "LargeEmptyBody"
                    }
                },
                position: {
                    top: 50,
                    left: 50
                }
            }
        }
    }
};
