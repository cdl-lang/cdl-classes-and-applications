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
    // API
    // 1. writableRef:
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestArea: {
        "class": o("BackgroundColor", "Border", "TextAlignCenter", "DebugDisplay", "GeneralArea", "ControlModifiedPointer"),
        context: { 
            displayDebugObj: [{ writableRef:_ }, [me]],
            backgroundColor: "lightgrey"
        },
        position: {
            bottom: 10,
            width: 100,
            height: 20
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAreaSet: o(
        { // default
            "class": o("TestArea", "MemberOfLeftToRightAreaOS"),
            context: { 
                displayDebugObj: [{ param: { areaSetContent:_ } }, [me]],
                spacingFromPrev: 10             
            },
            position: {
                bottom: 50,
                width: 150
            },
            write: {
                onTestAreaMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleWritableRef: {
                            to: [{ writableRef:_ }, [me]],
                            merge: [not, [{ writableRef:_ }, [me]]]
                        }
                    }
                }
            }       
        },
        {
            qualifier: { firstInAreaOS: true },
            context: {
                writableRef: [{ param: { areaSetContent: { a:_ } } }, [me]]
            },
            position: {
                attachToTestArea1: {
                    point1: { type: "left" },
                    point2: { element: [areaOfClass, "TestArea1"], type: "left" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { firstInAreaOS: false },
            context: {
                writableRef: [{ param: { areaSetContent: { b:_ } } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestArea1: {
        "class": "TestArea",
        context: {
            x: [mergeWrite,
                [{ myApp: { currentView: { x:_ } } }, [me]],
                o(1,2)
               ],
            writableRef: [{ x:_ }, [me]]
        },
        position: {
            rightConstraint: {
                point1: { type: "right" },
                point2: { element: [embedding], type: "horizontal-center" },
                equals: 10
            }
        },
        write: {
            onTestAreaMouseClick: {
                "class": "OnMouseClick",
                true: {
                    inc: {
                        to: [{ writableRef:_ }, [me]],
                        merge: [map,
                                [defun,
                                 "el",
                                 [plus, "el", 1]
                                ],
                                [{ writableRef:_ }, [me]]
                               ]
                    }
                }
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestArea2: {
        "class": "TestArea",
        context: {
            y: [mergeWrite,
                [{ myApp: { currentView: { y:_ } } }, [me]],
                { y1: 100, y2: 200 } // default value
               ],
            writableRef: [{ y:_ }, [me]]
        },
        position: {
            leftConstraint: {
                point1: { element: [embedding], type: "horizontal-center" },
                point2: { type: "left" },
                equals: 10
            }
        },
        write: {
            onTestAreaMouseClick: {
                "class": "OnMouseClick",
                true: {
                    inc: {
                        to: [{ writableRef:_ }, [me]],
                        merge: atomic({ y1: [plus, [{ writableRef: { y1:_ } }, [me]], 1], 
                                        y2: [plus, [{ writableRef: { y2:_ } }, [me]], 1] })
                    }
                }
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestControls: {
        "class": o("GeneralArea", "MinWrap"),
        context: {
            minWrapAround: 0
        },
        children: {
            controls: {
                data: o("SaveView", "RenameView", "DeleteView"),
                description: {
                    "class": "TestControl"
                }
            },
            viewNames: {
                data: [{ myApp: { saveViewController: { savedViewData: { name:_ } } } }, [me]],
                description: {
                    "class": "TestViewName"
                }
            }
        },
        position: {
            "class": "AlignCenterWithEmbedding"
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                msgType: [{ param: { areaSetContent:_ } }, [me]],
                disableControl: [and,
                                 [not, [{ loadedSavedViewUniqueID:_ }, [me]]],
                                 [
                                  [{ msgType:_ }, [me]],
                                  o("DeleteView", "RenameView")
                                 ]
                                ]
            }
        },
        { // default
            "class": o("Border", "TextAlignCenter", "DefaultDisplayText", 
                       "GeneralArea", "ControlModifiedPointer", "MemberOfLeftToRightAreaOS", "TrackSaveViewController"),
            context: {
                displayText: [{ param: { areaSetContent:_ } }, [me]],
                spacingFromPrev: 10
            },
            position: {
                width: 100,
                height: 20
            },
        },
        {
            qualifier: { msgType: "SaveView" },
            "class": "TestSaveViewControl"
        },
        {
            qualifier: { msgType: "DeleteView",
                         loadedSavedViewUniqueID: true },
            write: {
                onTestControlDeleteViewClick: {
                    "class": "OnMouseClick",
                    true: {
                        // the modal dialog that confirms the delete action
                        raiseSaveViewControllerCreateModalDialog: {
                            to: [{ saveViewController: { createModalDialog:_ } }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { msgType: "RenameView",
                         loadedSavedViewUniqueID: true },
            context: {
                name: "zzz"
            },
            write: {
                onTestControlRenameViewClick: {
                    "class": "OnMouseClick",
                    true: {
                        renameView: {
                            to: [
                                 { 
                                    name:_,
                                    uniqueID: [{ loadedSavedViewUniqueID:_ }, [me]] 
                                 },
                                 [{ savedViewData:_ }, [me]]
                                ],
                            merge: [{ name:_ }, [me]]
                        }
                    }
                }
            }
        }
    ),
      
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestSaveViewControl: o(
        { // default
            "class": o("GeneralArea", "ModalDialogable", "TrackSaveViewController"),
            write: {
                onTestSaveViewControlMouseClick: {
                    "class": "OnMouseClick"
                    // see variants below
                }
            }
        },
        {
            qualifier: { loadedSavedViewUniqueID: false },
            write: {
                onTestSaveViewControlMouseClick: {
                    // upon: see default clause above
                    true: {
                        saveView: {
                            to: [{ savedViewData:_ }, [me]],
                            merge: o(
                                     [{ newViewObj:_ }, [me]],
                                     [{ savedViewData:_ }, [me]]
                                    )
                        },
                        // if loadedSavedViewUniqueID is true, we don't increment the counter (as we save the view on an existing view name)
                        incNewViewCounter: {
                            to: [{ saveViewController: { newViewCounter:_ } }, [me]],
                            merge: [plus, [{ saveViewController: { newViewCounter:_ } }, [me]], 1]
                        }
                    }
                }
            }
        },
        {
            qualifier: { loadedSavedViewUniqueID: true },
            write: {
                onTestSaveViewControlMouseClick: {
                    // upon: see default clause above
                    true: {
                        raiseCreateModalDialog: {
                            to: [{ createModalDialog:_ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }/*,
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable              
                    description: {
                        "class": "SaveExistingViewModalDialog"
                    }
                }               
            }           
        }  */ 
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestViewName: o(
        { // default
            "class": o("Border", "TextAlignCenter", "DefaultDisplayText", "BackgroundColor", 
                       "GeneralArea", "DisplayDimension", "MemberOfLeftToRightAreaOS", "SavedViewCore", "TrackSaveViewController"),
            context: {
                name: [{ param: { areaSetContent:_ } }, [me]], 
                uniqueID: [{ param: { areaSetContent:_ } }, [me]], // SavedViewCore param
                displayText: [{ name:_ }, [me]],
                spacingFromPrev: 10,
                backgroundColor: "yellow"
            },
            position: {
                attachTop: {
                    point1: { element: [areaOfClass, "TestControl"], type: "bottom" },
                    point2: { type: "top" },
                    equals: 10
                }
            },
            write: {
                onTestViewNameMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setAsSelected: {
                            to: [{ loadedSavedViewUniqueID:_ }, [me]],
                            merge: [{ uniqueID:_ }, [me]]
                        }
                    }
                },
                onTestViewNameMouseDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        loadView: {
                            to: [{ currentView:_ }, [me]],
                            // this atomic() ensures that wew do not merge the savvedViewObjs with whatever was in currentViewObj, but rather override it
                            // this is important for the following scenario:
                            // 1. current view has a value set for x.
                            // 2. current view is saved.
                            // 3. the value of y is modified, and so now current view also has a value for y, which is not its default value.
                            // 4. if we now reload the saved view, which does not have a value stored for y, and it simply merges with the currentView,
                            //    then the value found there for y will be kept there. 
                            //    if, on the other hand, we write the atomic() savedView, the value of y will be erased from currentView, and the app
                            //    that looks at y using [mergeWrite] will simply revert to the default value it has for it, as intended.
                            merge: atomic([
                                    { 
                                        name: [{ name:_ }, [me]],
                                        view:_
                                    },
                                    [{ savedViewData:_ }, [me]]
                                   ])
                        }
                    }
                }
            }
        },
        {
            qualifier: { selected: true },
            "class": "TextBold"
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Testing the Save View functionality.\n1. Grey areas are the app, click on them to increment their value.\n2. Saved views are displayed as yellow areas. To perform an operation on them (e.g. DeleteView), click on the saved view of choice. DouleClick to load it to the currentView.\n3. As much as we're pro-choice, saved views can only be renamed 'zzz'." 
        },
        position: {
            top: 10
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SaveViewTestApp: {
        "class": o("TestApp"),
        context: {
            showSavedViewDebug: true,
            defaultAreaSetData: o(
                                  {
                                      id: 1,
                                      a: true,
                                      b: false
                                  },
                                  {
                                      id: 2,
                                      a: false,
                                      b: true
                                  }                           
                                 ),
            defaultCurrentView: {
                areaSetData: [{ defaultAreaSetData:_ }, [me]]
            },
            areaSetData: [{ currentView: { areaSetData:_ } }, [me]]
        },
        position: {
            frame: 0
        },
        children: {
            controls: {
                description: {
                    "class": "TestControls"
                }
            },
            area1: {
                description: {
                    "class": "TestArea1"
                }
            },
            area2: {
                description: {
                    "class": "TestArea2"
                }
            },
            testAreaSet: {
                data: [identify,
                       { id:_ },
                       [{ areaSetData:_ }, [me]]
                      ],
                description: {
                    "class": "TestAreaSet"
                }
            }
        }
    }
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "SaveViewTestApp"
            }
        }
    }
};
