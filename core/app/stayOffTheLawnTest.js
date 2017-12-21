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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Walker: {
        "class": o("DraggableWeakMouseAttachment", "ConfinedToArea", "ExcludedFromAreas"),
        context: {
            // DraggableWeakMouseAttachment params:
            draggableStable: true,
            draggableHorizontalAnchor:atomic({ type: "horizontal-center" }),
            draggableVerticalAnchor: atomic({ type: "vertical-center" }),

            // ConfinedToArea param:
            confinedToArea: [areaOfClass, "Park"],
            
            // ExcludedFromAreas param:
            excludedFromAreas: [areaOfClass, "Lawn"]
        },
        position: {
            width: 50,
            height: 50
        },
        display: {
            background: "yellow"
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Park: {
        "class": o("HorizontalWrapAroundController","Border"),
        context: {
            wrapArounds: [{ children: { patchesOfLawn:_ } }, [me]],
            wrapAroundSpacing: 100,
            wrapAroundSecondaryAxisSpacing: 100
        },
        children: {
            patchesOfLawn: {
                data: [sequence, r(1,40)],
                description: {
                    "class": "PatchOfLawn"
                }
            },
            bigLawn: {              
                description: {
                    "class": "BigLawn"
                }
            },
            anotherBigLawn: {              
                description: {
                    "class": "AnotherBigLawn"
                }
            }
        },
        position: {
            left: 10,
            right: 10,
            bottom: 10,
            attachToAnnotation: {
                point1: {
                    element: [{ children: { annotation:_ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        }
    },    

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Lawn: {
        "class": "GeneralArea",
        display: {
            background: "green"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PatchOfLawn: o(
        { // default
            "class": o("Lawn", "WrapAround"),
            position: {
                width: 50,
                height: 50
            }
        },
        {
            qualifier: { firstOfWrapArounds: true },
            position: {
                top: 80
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BigLawn: {
        "class": "Lawn",
        display: {
            background: "lightgreen"
        },
        position: {
            top: 100,
            bottom: 50,
            left: 200,
            width: 200
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AnotherBigLawn: {
        "class": "Lawn",
        display: {
            background: "lightgreen"
        },
        position: {
            bottom: 100,
            right: 70,
            height: 100,
            width: 500
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StayOffTheLawnTestApp: {
        "class": "TestApp",
        children: {
            park: {
                description: {
                    "class": "Park"
                }
            },
            walker: {
                description: {
                    "class": "Walker"
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Drag the yellow person around the park with its many lawns, which you cannot step on."
        }
    }    
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "StayOffTheLawnTestApp"
            }
        }
    }
};
