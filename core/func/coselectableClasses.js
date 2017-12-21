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
// This library offers functionality to support co-selection of multiple areas.
////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows an area to be coselected as part of one-by-one coselection, or as part of a coselection of a range of elements.
    // 
    // It inherits Tmdable so that the processing of a mouseUp as it relates to a coselection will be done only by the area that received the mouseDown.
    //
    // API: 
    // 1. coselectableUniqueID: a uniqueID that will be used to add the area inheriting this class to the os of uniqueIDs stored in myCoselectablesController.
    //    (note: this is not synonymous with the areaRef - as multiple areas could represent a single coselectableUniqueID (as is the case with coselection of items in the solutionSetViews)
    // 2. myCoselectablesController: an areaRef to an area inheriting CoselectablesController
    // 3. myContigCoselectablesController: an areaRef to an area inheriting ContiguousCoselectablesController. 
    //    (in theory, myContigCoselectablesController could store an os of areaRefs, and not necessarily a single areaRef:
    //    when a Coselectable area pertains to more than one possible contiguous set of coselectable areas, say when coselecting cells on a chess board - either a column or a row. 
    //    This hasn't been tested yet).
    // 4. coselectionMouseEvent: will co-selection be defined by a MouseDown or a MouseClick. MouseDown by default
    // 
    // Functionality:
    // We aim to imitate the coselection behavior offered in Windows file directory (coselectables are all files in a given directory, the directory defines a 'contiguous-realm').
    // 1. coselectionMouseEvent (e.g. mouseDown) outside a coselectable area turns off the coselected flag in all areas which have it on.
    // 2. coselectionMouseEvent w/o Ctrl on a coselectable area raises its coselected flag, and turns off the coselected flag in all other areas.
    // 3. coselectionMouseEvent + Ctrl on a coselectable area turns off the coselected flag in all those outside of the coselectables os. on the MouseUp the coselected flag is raised 
    //    for this area.
    // 4. coselectionMouseEvent + Shift: an operation that defines a range of areas between the beginningOfContigCoselection and the endOfContigCoselection (the latter is the area that 
    //    took the coselectionMouseEvent + Shift.
    // 4.1 beginning of a contiguous coselection range: 
    //     the last mouseUp (without Shift, i.e. with or without Ctrl) in the coselectables os defines the area within the os that serves as the far end of the coselectionMouseEvent+Shift.
    //     Before one such area is explicitly specified by the user, the first area in coselectables serves in that capacity. 
    // 4.2 end of a contiguous coselection range: 
    // 4.2.1 coselectionMouseEvent + Shift  w/o Ctrl on coselectable: marks coselected all coselectable areas in the coselectables os between it and the beginning area, 
    //       and clears all other preexisting coselected areas (both inside and outside coselectables).
    // 4.2.2 coselectionMouseEvent + shift + Ctrl: same as is done w/o the Ctrl, except that those in coselectables which are already coselected, are left unscathed.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////    
    Coselectable: o(  
        { // variant-controller
            qualifier: "!",
            context: {                  
                coselected: [
                             [{ coselectableUniqueID:_ }, [me]], 
                             [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]]
                            ],
                coselectionMouseEvent: "MouseDown"
            }
        },
        {
            qualifier: { coselectionMouseEvent: "MouseDown" },
            context: { 
                myCoselectionMouseEventMessage: [{ type: "MouseDown" }, [myMessage]],
                myCoselectionMouseEventEndMessage: [{ type: "MouseUp" }, [myMessage]]
            }
        },
        {
            qualifier: { coselectionMouseEvent: "MouseClick" },
            context: {
                myCoselectionMouseEventMessage: [and,
                                                 [{ tmd:_ }, [me]], 
                                                 [{ subType: "Click" }, [myMessage]]
                                                ],
                myCoselectionMouseEventEndMessage: [{ subType: "Click" }, [myMessage]] // for MouseClick end-event is the event itself
            }
        },
        { // default 
            "class": "Tmdable",
            context: {
                contigCoselectablesRangeEndingInMe: [range, // note: [range] is indifferent to direction - no true beginning/end, but simply two edges of a range.
                                                     o(
                                                       [me], 
                                                       [{ myContigCoselectablesController: { beginningOfContigCoselection:_ } }, [me]]
                                                      ),
                                                      [{ myContigCoselectablesController: { coselectables:_ } }, [me]]
                                                    ]
            },
            write: {
                onCoselectableMouseEvent: { // on mouseEvent, reset all controllers other than my own (that means both their coselectedUniqueIDs os and their beginningOfContigCoselection)
                    upon: [{ myCoselectionMouseEventMessage:_ }, [me]],
                    true: {                            
                        notifyOtherControllersOfCoselection: { // currently, they will Reset following this message, eventually some may choose not to.
                            to: [message],
                            merge: { 
                                msgType: "Reset",
                                recipient: o( 
                                             [ // reset all coselectableControllers except my own, which have a meaningful coselection
                                              { coselectedUniqueIDs: true },
                                              [
                                               n([{ myCoselectablesController:_ }, [me]]),
                                               [areaOfClass, "CoselectablesController"]
                                              ]
                                             ],
                                             [ // and all contiguousCoselectablesControllers except my own, which have a selection other than the default beginningOfContigCoselection
                                              { beginningOfContigCoselectionDefined: true },
                                              [
                                               n([{ myContigCoselectablesController:_ }, [me]]),
                                               [areaOfClass, "ContiguousCoselectablesController"]
                                              ]
                                             ]
                                            )
                            }
                        }
                    }
                },
                onCoselectableMouseEventShiftCtrl: {
                    upon: [and,
                           [{ myCoselectionMouseEventMessage:_ }, [me]],
                           [{ modifier: "shift" }, [{ modifier: "control" }, [myMessage]]]
                          ],
                    true: {
                        addContigRangeToCoselected: {
                            to: [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]], 
                            merge: o(
                                     [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]],
                                     [{ 
                                        coselected: false,
                                        coselectableUniqueID:_
                                      },
                                      [{ contigCoselectablesRangeEndingInMe:_ }, [me]]
                                     ]
                                    )
                        }
                    }
                },
                onCoselectableMouseEventShiftNoCtrl: { // if there was no Ctrl included in the mouseEvent + Shift, then all that is coselected is the contiguous range.
                    upon: [and,
                           [{ myCoselectionMouseEventMessage:_ }, [me]],
                           [{ modifier: "shift"}, [myMessage]],
                           [not, [{ modifier: "control"}, [myMessage]]]
                          ],
                    true: {
                        coselectTheContigRangeEndingInMe: { // and by doing so, de-coselect anything else already coselected outside this range.
                            to: [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]], 
                            merge: [{ contigCoselectablesRangeEndingInMe: { coselectableUniqueID:_ } }, [me]]                     
                        }
                    }
                },

                onCoselectableMouseEventNoShiftNoCtrl: { // a "simple" mouseDown
                    upon: [and,
                           [{ myCoselectionMouseEventMessage:_ }, [me]],
                           [not, [{ modifier: "shift"}, [myMessage]]],
                           [not, [{ modifier: "control"}, [myMessage]]]
                          ],
                    true: {                                                    
                        // select me (and only me), and decoselect anything currently coselectd in myContigCoselectablesController 
                        // (the coselected *outside* my coselectables were already decoselected in onCoselectableMouseDown. 
                        coselectMeAndDeCoselectOtherCoselectedUniqueIDsInMyCoselectables: { 
                            to: [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]], 
                            merge: [{ coselectableUniqueID:_ }, [me]]
                        }
                    }
                }               
            }
        },
        {
            qualifier: { tmd: true },
            // in the message handlers below (and in the two more-specific variants of { tmd: true } that follow, we both toggle the value of the Coselectble are which is receiving
            // the Ctrl+ myCoselectionMouseEventEndMessage, and if the mouseEvent is without shift, we set the proper value to beginningOfContigCoselection. 
            // mouseEvent +/-Ctrl: the difference lies in whether the area will end up coselected after the myCoselectionMouseEventEndMessage or not.
            // Note: if mouseEvent is mouseDown, then the mouseEvent end message is a mouseUp. if it's mouseClick, then that is also the end message
            write: {
                onCoselectableMouseEventEndNoShift: {
                    upon: [and,
                           [{ myCoselectionMouseEventEndMessage:_ }, [me]],
                           [not, [{ modifier: "shift" }, [myMessage]]]                                                          
                          ],
                    true: {                            
                        setBeginningOfContigCoselectionInContigController: {
                            to: [{ myContigCoselectablesController: { beginningOfContigCoselectionAux:_ } }, [me]],
                            merge: [me]
                        }
                    }
                },
                onCoselectableMouseEventEndCtrlNoShift: {
                    upon: [and,
                           [{ myCoselectionMouseEventEndMessage:_ }, [me]],
                           [{ modifier: "control" }, [myMessage]],
                           [not, [{ modifier: "shift" }, [myMessage]]]                                                          
                          ],
                    true: {                            
                        toggleMyCoselected: {  
                            to: [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]], 
                            merge: [{ toggledCoselectedUniqueIDs:_ }, [me]]
                        }
                    }
                }
            }
        },
        { 
            qualifier: { tmd: true,
                         coselected: false },
            context: {
                toggledCoselectedUniqueIDs: o(
                                              [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]],
                                              [{ coselectableUniqueID:_ }, [me]]
                                             )
            }
        },
        { 
            qualifier: { tmd: true,
                         coselected: true },
            context: {
                toggledCoselectedUniqueIDs: [n([{ coselectableUniqueID:_ }, [me]]),
                                             [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]]                                             
                                            ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is to be inherited by an area that can be coselected, when there is a single continuum of coselectable areas (e.g. facets, not items).
    // This class inherits Coselectable, and sets myCoselectablesController as myContigCoselectablesController (which would typically inherit SingleContinuumCoselectablesController).
    // 
    // API: 
    // 1. coselectableUniqueID / myCoselectablesController / coselectionMouseEvent (see Coselectable's API).
    // 2. myContigCoselectablesController: myCoselectablesController, by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SingleContinuumCoselectable: {
        "class": o("Coselectable"),
        context: {
            myContigCoselectablesController: [{ myCoselectablesController:_ }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines the upon handler inherited by the CoselectablesController and the ContiguousCoselectablesController, which allows them to reset themselves in case 
    // a coselection mouseEvent was NOT handled by any of their Coselectable areas.
    // 
    // API: 
    // 1. coselectionControllerHandlesReset: does the controller handle resetting or is it handled elsewhere. true, by default
    // 2. controllerRequiresReset: is the inheriting class currently in need of resetting? true, by default
    // 3. immunityFromCoselectionReset: the os of areaRefs which can process the mouseDown (elsewhere! they listen to recipient: "end" below) without triggering a resetting of the
    //    coselections. For example, elements co-tmd in a Movable doc should have immunity from Reset when we scroll that document with its scrollbar).
    //    By default this is defined as [areaOfClass, "ImmunityFromCoselectionReset"] - inheriting classes may override this definition.
    // 4. This class assumes it is inherited by an area with a Reset message handler.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoselectionExternalEventForReset: o(
        { // variant-controller
            qualifier: "!",
            context: {
                coselectionControllerHandlesReset: true,
                controllerRequiresReset: true
            }
        },
        { // default
            context: {
                immunityFromCoselectionReset: [areaOfClass, "ImmunityFromCoselectionReset"]
            }
        },
        // if coselectionControllerHandlesReset is false, then neither one of the variants below is triggered, and we avoid the Reset offered by this class
        {
            qualifier: { coselectionControllerHandlesReset: true,
                         controllerRequiresReset: true },
            write: {
                onMouseDownElsewhere: { 
                    // if the MouseDown included processing by a coselectable area, it will call Reset for the relevant coselectablesController and contiguousCoselectablesController.
                    upon: [mouseDownNotHandledBy,
                           o([areaOfClass, "Coselectable"],
                             [{ immunityFromCoselectionReset:_ }, [me]])
                          ],
                    true: {                            
                        resetMe: {
                            to: [message],
                            merge: { 
                                msgType: "Reset",  
                                recipient: [me]
                            }
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class supports the ability to coselect a continuous range of coselectable areas.
    // It may or be inherited by a class which also inherits CoselectablesController. Examples:
    // may: SingleContinuumCoselectablesController) 
    // may not: OverlaySolutionSetView inherits ContiguousCoselectablesController, and the associated CoselectablesController is inherited by the EphExtOverlay, 
    // to allow coselection of items from across different OvrlaySolutionSetViews 
    //
    // API: 
    // 1. coselectables: an ordered set of areas inheriting Coselectable. A contiguous range of these could be co-selected by indicating the beginning and end of the range (See 
    //    Coselectable's ddocumentation. These Coselectable areas are assumed to have unique IDs, i.e. no repetitions within this os.
    // 2. classes that want to provide immunity from reset of the coselection should inherit ImmunityFromCoselectionReset.
    // 3. myCoselectablesController: an areaRef to the CoselectablesController. 
    // 
    // Implementation:
    // In addition to coselectables, which is an ordered set accessed by the Coselectable areas in it, this class also stores beginningOfContigCoselection:
    // the areaRef to one of these areas, which will serve as the beginning of a contiguous coselection range.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContiguousCoselectablesController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                beginningOfContigCoselectionDefined: [{ beginningOfContigCoselectionAux:_ }, [me]],
                amIAlsoTheCoselectableController: [
                                                   [me],
                                                   [areaOfClass, "CoselectablesController"]
                                                  ]
            }
        },  
        { // default
            "class": o("GeneralArea", "CoselectionExternalEventForReset"),
            context: {
                // CoselectionExternalEventForReset param
                controllerRequiresReset: [{ beginningOfContigCoselectionDefined:_ }, [me]],
                
                // the pairing of beginningOfContigCoselection and ^beginningOfContigCoselectionAux is *NOT* simply the implementation of the current solution to initializing application data 
                // with a computed value!
                // the algorithm here: beginningOfContigCoselectionAux stores the last Coselectable pertaining to this controller to have taken the MouseEvent w/o Shift (i.e. either 
                // MouseEvent with or w/o Ctrl). If that area is also coselected, than it is the beginningOfContigCoselection; if it isn't coselected, than the default area (the [first] of
                // coselectables) is defined as beginningOfContigCoselection            
                "^beginningOfContigCoselectionAux": o(),
                beginningOfContigCoselection: [cond,
                                               [{ beginningOfContigCoselectionAux:_ }, [me]],
                                               o({ on: false,
                                                   use: [first, [{ coselectables:_ }, [me]]] },
                                                 { on: true,
                                                   use: [cond,
                                                         // note this handles both the case in which beginningOfContigCoselectionAux is de-coselected and in which it is removed altogether somehow
                                                         [{ beginningOfContigCoselectionAux: { coselected:_ } }, [me]],
                                                         o({ on: false, 
                                                             use: [first, [{ coselectables:_ }, [me]]] 
                                                           },
                                                           { on: true, 
                                                             use: [{ beginningOfContigCoselectionAux:_ }, [me]]
                                                           }
                                                          )]
                                                 }
                                                )
                                               ]
            }
        },
        {
            qualifier: { beginningOfContigCoselectionDefined: true },
            write: {
                onContiguousCoselectablesControllerReset: {
                    upon: [{ msgType: "Reset" }, [myMessage]],
                    true: {
                        resetBeginningOfContigCoselection: {  
                            to: [{ beginningOfContigCoselectionAux:_ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {   // i.e. this is one ContiguousCoselectablesController out of several which are controlled by a single CoselectablesController
            qualifier: { amIAlsoTheCoselectableController: false },
            context: {
                // we select out of this class' coselectables, those which are coselected in its myCoselectablesController
                coselectedUniqueIDs: [
                                      [{ coselectables: { coselectableUniqueID:_ } }, [me]],
                                      [{ myCoselectablesController: { coselectedUniqueIDs:_ } }, [me]]
                                     ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. coselectables: an ordered set of areas inheriting Coselectable. Repetitions of uniqueIDs (e.g. multiple instances of the same item in different overlays) are allowed.
    // 2. immunityFromCoselectionReset (optional). By default no area other than a Coselectable area provides immunity from the resetting of coselections - see the inherited 
    //    CoselectionExternalEventForReset).
    // 3. coselectedUniqueIDs: writable ref where the coselected areas' uniqueIDs are stored. The associated appData is initialized to the empty os. 
    //    The inheriting class may obviously assign the writable ref to another appData (e.g. SelectedItemsOverlay).
    //
    // Note:
    // coselectedUniqueIDs may store uniqueIDs which are not longer represented by the coselectables (but did at the time the uniqueID was added to coselectedUniqueIDs). Once
    // coselectables grows once again to re-include that uniqueID, the corresponding Coselectable areas defined by that uniqueID will be marked as coselected 
    // (e.g. select Google, then close the overlay solution set view - now once we open that solution set view again, Google will remain coselected).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoselectablesController: {
        "class": o("GeneralArea", "CoselectionExternalEventForReset"),
        context: {
            "^coselectedUniqueIDs": o(),
            
            // CoselectionExternalEventForReset param
            controllerRequiresReset: [{ coselectedUniqueIDs:_ }, [me]]
        },
        write: {
            onCoselectablesControllerReset: {
                upon: [and,
                       [{ msgType: "Reset" }, [myMessage]],
                       // because if coselectionControllerHandlesReset:false, then resetting is handled elsewhere 
                       // (see CoselectionExternalEventForReset documentation, including EphExtOverlay example)
                       [{ coselectionControllerHandlesReset:_ }, [me]]
                      ],
                true: {
                    resetCoselectedUniqueIDs: {  
                        to: [{ coselectedUniqueIDs:_ }, [me]], 
                        merge: o()
                    }
                }
            }
        }             
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class that inherits both ContiguousCoselectablesController and CoselectablesController: when there is a single continuum of coselectable areas.
    //
    // API: 
    // 1. coselectables: an ordered set of contiguous areas inheriting Coselectable (and more likely, inheriting SingleContinuumCoselectable).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SingleContinuumCoselectablesController: {
        "class": o("ContiguousCoselectablesController", "CoselectablesController"),
        context: {
            myCoselectablesController: [me]
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class should be inherited by classes that wish to provide immunity from resetting of coselection
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ImmunityFromCoselectionReset: {
    }
    
    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Coselectable Classes
    // //////////////////////////////////////////////////////////////////////////////////////////////////////
};
