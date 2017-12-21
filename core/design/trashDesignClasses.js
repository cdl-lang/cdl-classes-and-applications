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

initGlobalDefaults.trashDesign = {
    selectedTabColor: "#8d8d8d",
    unselectedTabColor: "#e2e2e2",

    selectedTabNameTextColor: "#ffffff",
    unselectedTabNameTextColor: "#a9a9a9",
    
    tabNameTextSize: { "V1": 14, "V2": 16, "V3": 20 },

    borderWidth: 2,

    trashBackgroundOnHover: "rgba(0, 0, 0, 0.3)"    
};

var classes = {
    ///////////////////////////////////////////////
    TrashDisplayDesign: o(
        { // default
            "class": "BackgroundColor",
            display: {
                image: {
                    size: "100%",
                    alt: [cond,
                          [{ trashEmpty:_ }, [me]],
                          o(
                            { on: true, use: "Trash Empty" },
                            { on: false, use: "Trash Full" }
                           )
                         ],
                    src: [cond,
                          [{ trashEmpty:_ }, [me]],
                          o(
                            { on: true, use: "%%image:(trashEmpty.svg)%%" },
                            { on: false, use: "%%image:(trashFull.svg)%%" }
                           )
                         ]
                }
            }
        },
        {
            qualifier: { hoveringOverTrash: true },
            context: {
                backgroundColor: [{ trashDesign: { trashBackgroundOnHover:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { open: true },
         //   "class": "HideControlDesign" // commented out as the image part of the trash display svg doesn't take up the entire area
                                           // so as to leave room for the image of a "full" trash. the diagonal on an empty trash, therefore, looks odd.
        }
    ),

    ///////////////////////////////////////////////
    AppTrashDesign: o(
        { // default
        },
        {
            qualifier: { open: true },
            "class": "Border",            
            context: {
                borderWidth: [{ trashDesign: { borderWidth:_ } }, [globalDefaults]],
                borderColor: [{ trashDesign: { selectedTabColor:_ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    TrashTabDesign: o(
        { // default
            "class": o("BackgroundColor"),
            children: {
                leftClip: {
                    description: {
                        "class": "TrashTabLeftClip"
                    }
                },
                rightClip: {
                    description: {
                        "class": "TrashTabRightClip"
                    }
                }
            }
        },
        {
            qualifier: { selectedTab: true },
            context: {
                backgroundColor: [{ trashDesign: { selectedTabColor:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { selectedTab: false },
            context: {
                backgroundColor: [{ trashDesign: { unselectedTabColor:_ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    TrashTabNameDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            textColor: [cond,
                        [{ selectedTab:_ }, [me]],
                        o( 
                          { on: true, use: [{ trashDesign: { selectedTabNameTextColor:_ } }, [globalDefaults]] },
                          { on: false, use: [{ trashDesign: { unselectedTabNameTextColor:_ } }, [globalDefaults]] }
                         )
                       ],
            textSize: [densityChoice, [{ trashDesign: { tabNameTextSize: _ } }, [globalDefaults]]]            
        },
        position: {
            attachLeftToLeftClip: {
                point1: {
                    element: [{ children: { leftClip:_ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            attachRightToRightClip: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ children: { rightClip:_ } }, [embedding]],
                    type: "left"
                },
                equals: 0
            }
        }                                            
    },

    ///////////////////////////////////////////////
    TrashTabClip: {
        "class": o("GeneralArea", "TopSideTriangle"),
        context: {
            defaultWidth: [mul, // we take double the constant, as this triangle will have half of its masked from view by the embedding TrashTab!
                           2,
                           [densityChoice, [{ bFSAppTrashPosConst: { tabClipWidth: _ } }, [globalDefaults]]]
                          ],

            incWidthOfSelectedTab: [densityChoice, [{ bFSAppTrashPosConst: { selectedTabClipIncWidth: _ } }, [globalDefaults]]],
            triangleColor: designConstants.globalBGColor  
        },
        position: {
            top: 0,
            bottom: 0,
            width: [cond,
                    [{ selectedTab:_ }, [embedding]],
                    o(
                        { on: true, use: [plus, [{ defaultWidth:_ }, [me]], [{ incWidthOfSelectedTab:_ }, [me]]] },
                        { on: false, use: [{ defaultWidth:_ }, [me]] }
                    )
                   ]
        }
    },

    ///////////////////////////////////////////////
    TrashTabRightClip: {
        "class": "TrashTabClip",
        position: {
            attachToEmbeddingRight: {
                point1: { type: "horizontal-center" },
                point2: { element: [embedding], type: "right" },
                equals: 0
            }
        }
    },

    ///////////////////////////////////////////////
    TrashTabLeftClip: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstInAreaOS: [{ firstInAreaOS:_ }, [embedding]]
            } 
        },
        { // default
            "class": "TrashTabClip",
            position: {
                attachToEmbeddingLeft: {
                    point1: { type: "horizontal-center" },
                    point2: { element: [embedding], type: "left" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                width: 0
            }
        }
    ),
    
    ///////////////////////////////////////////////
    TrashTabViewHandleDesign: {
        "class": "ViewTopBorder",
        context: {
            topBorderColor: [{ trashDesign: { selectedTabColor:_ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    UntrashControlDesign: {
        "class": "DarkControlOpacityDesign",
        display: {
            image: {
                size: "100%",
                src: "%%image:(untrash.svg)%%",
                alt: "Untrash"
            }
        }           
    }
};
