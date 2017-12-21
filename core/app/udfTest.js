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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDFApp: {
        "class": o("Border", "GeneralArea", "TestApp", "UDFController"),
        context: {
            "^facetData": o(
                             { uniqueID: "f1", name: "F1", minimized: true },
                             { uniqueID: "f2", name: "F2", minimized: true },
                             { uniqueID: "f3", name: "F3", minimized: true },
                             { uniqueID: "f4", name: "F4", minimized: true }
                            ),
            "^testDBPreUDFs": o(
                                { "f1": 1, "f2": 2, "f3": 3, "f4": 4 },
                                { "f1": 11, "f2": 12, "f3": 13, "f4": 14 }
                               ),
            // UDFController params
            dbPreUDFs: [{ testDBPreUDFs:_ }, [me]],
            uDFRefElements: [areaOfClass, "TestFacet"]
        },
        children: {
            addUDF: {
                description: {
                    "class": "AddTestUDF"
                }
            },
            refreshButton: {
                description: {
                    "class": "ReferenceableCellRefresh"
                }
            },
            rows: {
                data: [{ myApp: { dbPostUDFs:_ } }, [me]], // provided by UDFController
                description: {
                    "class": "TestRow"
                }
            },
            facets: {
                // this is to ensure that the default identity that relies on position within the os is not the one used:
                // e.g. when deleting facets and creating new ones.
                data: [identify,
                       _,
                       [{ facetData: { uniqueID:_ } }, [me]]
                      ],
                description: {
                    "class": "TestFacet"
                }
            }           
        }
    },
    
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddTestUDF: {
        "class": o("GeneralArea", "AddUDFControl", "Border", "TextBold", "TextAlignCenter", "DefaultDisplayText"),
        context: {
            displayText: "New Facet",
            
            // AddUDFControl params
            newUDFObj: [merge, // override AddUDFControl default definition
                        { minimized: false },
                        [{ defaultUDFObj:_ }, [me]]
                       ],
            facetData: [{ myApp: { facetData:_ } }, [me]] 
        },
        position: {
            top: 150,
            left: 10,
            width: 80,
            height: 20
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ReferenceableCellRefresh: {
        "class": o("Border", "TextBold", "TextAlignCenter", "DefaultDisplayText", "Tooltipable"),
        context: {
            displayText: "'Refresh'",
            tooltipText: "Clicking this button will increment the value of the referenceable cells.\nThe UDF cells will update accordingly."
        },
        position: {
            bottom: 50,
            left: 10,
            width: 50,
            height: 20
        },
        write: {
            addTestUDFMouseClick: {
                "class": "OnMouseClick",
                true: {
                    addTestUDFObj: {
                        to: [{ myApp: { facetData:_ } }, [me]],
                        merge: push([{ newUDFObj:_ }, [me]])
                    }
                }
            }
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestRow: {
        context: {
            
        },
        content: [{ param: { areaSetContent:_ } }, [me]]
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. name
    // 2. uniqueID
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacet: o(
        { // variants-controller    
            qualifier: "!",
            context: {
                isUDF: [{ dataObj: { uDF:_ } }, [me]],
                minimized: [{ dataObj: { minimized:_ } }, [me]]
            }
        },
        { // default
            "class": o("Border", "GeneralArea", "MinWrap", "UDFRefElement"),
            context: {
                minWrapAround: 0,
                uniqueID: [{ param: { areaSetContent:_ } }, [me]],                          
                dataObj: [
                          { uniqueID: [{ uniqueID:_ }, [me]] },
                          [{ myApp: { facetData:_ } }, [me]]
                         ],
                facetType: [{ dataObj: { facetType:_ } }, [me]],
                name: [{ dataObj: { name:_ } }, [me]],

                // UDFRefElement params:
                calculatorRefName: [{ name:_ }, [me]],
                calculatorRefVal: [{ uniqueID:_ }, [me]],
                
                // facetQuery, facetProjectionQuery, facetSelectionQueryFunc - to imitate inheritance of the real Facet class (facetClasses.js) - 
                // UDF assumes these are defined
                // facetQuery is a function which is used to construct a facet-specific projection query or selection query
                facetQuery: [
                    [
                        defun, o("attr"),
                        [
                            defun, o("what"),
                            {"#attr": "what"}
                        ]
                    ],
                    [{ uniqueID:_}, [me]]
                ],


                // facetProjectionQuery uses the facetQuery function, and
                //  provides it with the "_" as input, to form a projection
                //  query, i.e. { <myFacetUniqueID>:_ }
                facetProjectionQuery: [
                    [{facetQuery:_}, [me]],
                    _
                ],
                facetSelectionQueryFunc: [{facetQuery: _}, [me]],
            },
            children: {
                name: {
                    description: {
                        "class": "TestFacetName"
                    }
                },
                minimizationControl: {
                    description: {
                        "class": "TestMinimizationControl"
                    }
                },
                cells: {
                    data: [areaOfClass, "TestRow"],
                    description: {
                        "class": "TestFacetCell"
                        // further inheritance provided in TestReferenceableFacet
                    }
                }
            }
        },
        {
            qualifier: { isUDF: true },
            "class": "TestUDF"
        },
        {
            qualifier: { isUDF: false },
            "class": "TestReferenceableFacet"
        },
        {
            qualifier: { minimized: false },
            "class": o("MemberOfLeftToRightAreaOS", "MinWrapHorizontal"),
            context: {
                spacingFromPrev: 10,
                areaOS: [{ minimized: false }, [areaOfClass, "TestFacet"]]
            },
            position: {
                top: 180
            }
        },
        {
            qualifier: { minimized: false, firstInAreaOS: true },
            position: {
                left: [{ spacingFromPrev:_ }, [me]]
            }
        },      
        {
            qualifier: { minimized: true },
            "class": o("MemberOfTopToBottomAreaOS"),
            context: {
                spacingFromPrev: 10,
                areaOS: [{ minimized: true }, [areaOfClass, "TestFacet"]]
            },
            position: {
                width: 100,
                right: 20
            }
        },
        {
            qualifier: { minimized: true, firstInAreaOS: true },
            position: {
                belowNewUDFButton: {
                    point1: { element: [areaOfClass, "AddTestUDF"], type: "bottom" },
                    point2: { type: "top" },
                    equals: 30
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestMinimizationControl: {
        "class": o("GeneralArea", "AboveSiblings"),
        position: {
            right: 0,
            top: 0,
            width: 10,
            height: 10
        },
        display: { background: "pink" },
        write: {
            onTestMinimizationMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleMinimized: {
                        to: [{ minimized:_ }, [embedding]],
                        merge: [not, [{ minimized:_ }, [embedding]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areaSetContent with { uniqueID: <>, name: <> }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReferenceableFacet: o(
        { // default
            children: {
                cells: {
                    // data and default description provided in TestFacet
                    description: {
                        "class": "TestReferenceableFacetCell"
                    }
                }      
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDF: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                displayUDFFormulaPanel: [and,
                                   [not, [{ minimized:_ }, [me]]],
                                   [{ editUDF:_ }, [me]]
                                  ]
            }
        },
        { // default
            "class": o("UDF"),
            context: {
                myUDFController: [areaOfClass, "TestUDFApp"],
                facetData: [{ myApp: { facetData:_ } }, [me]]
            },
            children: {
                editControl: {
                    description: {
                        "class": "TestUDFEdit"
                    }
                },
                deleteControl: {
                    description: {
                        "class": "TestUDFDelete"
                    }
                }
            }
        },
        {
            qualifier: { displayUDFFormulaPanel: true },
            "class": "TestUDFCalculatorPanel",
            position: {
                height: 350,
                attachInputFieldTopToNameBottom: {
                    point1: { element: [{ children: { name:_ } }, [me]], type: "bottom" },
                    point2: {element: [{ children: { inputField:_ } }, [me]], type: "top" },
                    equals: 20
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDFCalculatorPanel: {
        "class": "TestCalculatorPanelCore",
        children: {
            facetRefDropDown: {
                description: {
                    "class": "TestUDFFacetRefDropDown"
                }
            }           
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDFFacetRefDropDown: {
        "class": "UDFRefElementsDropDown",
        context: {
            uDFRefElements: [
                          n([embedding]), // exclude myUDF from the list of facets in my dropDown, to avoid the trivial circular definition
                          [{ myApp: { children: { facets:_ } } }, [me]]
                         ],
            myCalculatorController: [embedding] // the TestUDF
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetName: {
        "class": o("TextAlignCenter", "TextBold", "DefaultDisplayText", "UDFRefElementUX"),
        context: {
            displayText: [{ name:_ }, [embedding]],
            myFacet: [embedding] // UDFRefElementUX param
        },
        display: { 
            background: [cond, // is myUDF included in the definingFacets of the myCalculatorController (currently being edited)
                         [{ ofUDFDefiningEditedUDF:_ }, [me]],
                         o(
                           { on: true, use: "orange" },
                           { 
                                on: false, 
                                use: [cond,
                                      [{ ofUDFDefinedByEditedUDF:_ }, [me]],
                                      o({ on: true, use: "red"})
                                     ]
                           }
                          )
                        ]
        },      
        position: {
            "horizontal-center": 0,
            top: 0,
            height: 20,
            width: 100
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDFEdit: {
        "class": o("GeneralArea", "TextAlignCenter", "DefaultDisplayText", "AboveSiblings"),
        context: {
            displayText: "E"
        },
        position: {
            width: 10,
            height: 10,
            top: 0,
            right: 12
        },
        write: {
            onTestUDFEditClick: {
                "class": "OnMouseClick",
                true: {
                    toggleEditUDF: {
                        to: [{ editUDF:_ }, [embedding]],
                        merge: [not, [{ editUDF:_ }, [embedding]]]
                    }
                }
            }
        }                   
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestUDFDelete: {
        "class": o("GeneralArea", "TextAlignCenter", "DefaultDisplayText", "AboveSiblings", "UDFDeleteUX"),
        context: {
            displayText: "X",
            // UDFDeleteUX params:
            myUDF: [embedding]
        },
        position: {
            width: 10,
            height: 10,
            top: 0,
            right: 24
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. content object is to contain the value to be displayed
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetCell: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                firstRowCell: [
                               [{ myRow:_ }, [me]],
                               [first, [areaOfClass, "TestRow"]]
                              ],
                ofUDF: [
                        [{ myFacet:_ }, [me]],
                        [areaOfClass, "UDF"]
                       ]
            }
        },
        {
            "class": o("GeneralArea", "TextAlignCenter", "DefaultDisplayText", "TopBorder"),
            context: {
                myRow: [{ param: { areaSetContent:_ } }, [me]],
                myRowContent: [{ myRow: { content:_ } }, [me]],             
                displayText: [{ content:_ }, [me]],
                myFacet: [embedding]
            },
            position: {
                left: 0,
                right: 0,
                height: 20
            },
            content: [
                      [{ myFacet: { facetProjectionQuery:_ } }, [me]],
                      [{ myRowContent:_ }, [me]]
                     ]
        },
        {
            qualifier: { firstRowCell: true },
            position: {
                left: 0,
                right: 0,
                height: 20,
                minOffsetFromBottomOfName: {
                    point1: { element: [{ children: { name:_ } }, [embedding]], type: "bottom" },
                    point2: { type: "top" },
                    min: 0                  
                },
                minOffsetFromBottom: {
                    point1: { type: "bottom" },
                    point2: { element: [embedding], type: "bottom" },
                    equals: 0,
                    priority: -1                    
                }       
            }           
        },
        {
            qualifier: { firstRowCell: false },
            position: {
                left: 0,
                right: 0,
                height: 20,
                bottom: 0,
                attachToMyFacetFirstRowCell: {
                    point1: { 
                        element: [
                                  { 
                                    myFacet: [{ myFacet:_ }, [me]],
                                    firstRowCell: true
                                  },
                                  [areaOfClass, "TestFacetCell"]
                                 ],
                        type: "bottom" 
                    },
                    point2: { 
                        type: "top" 
                    },
                    equals: 0               
                }       
            }           
        },
        {
            qualifier: { ofUDF: true },
            context: {
                textColor: [cond, // if the cell displays the calculation of an outdated expression, display in grey.
                            [equal, [{ myFacet: { expression:_ } }, [me]], [{ myFacet: { cellExpression:_ } }, [me]]],
                            o({ on: true, use: "black"}, { on: false, use: "grey"})
                           ]                
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestReferenceableFacetCell: {
        "class": "GeneralArea",
        context: {
            // the write needs to be done not through [map] (not supported yet).
            // given that the db including the UDFs is calculated using [map], we need to retrieve the ReferenceableCell's value directly, from
            // the original db (dbPreUDFs)
            myOriginalRowContent: [pos,
                                   [index, // find the index in the dbPostUDFs. it's the same index in the dbPreUDFs
                                    [{ myApp: { dbPostUDFs:_ } }, [me]],
                                    [{ myRowContent:_ }, [me]]
                                   ],
                                   [{ myApp: { dbPreUDFs:_ } }, [me]]
                                  ],
            myOriginalContent: [
                                [{ myFacet: { facetProjectionQuery:_ } }, [me]],
                                [{ myOriginalRowContent:_ }, [me]]
                               ]
        },
        write: {
            onRefreshButtonClick: {
                upon: [clickHandledBy,
                         [areaOfClass, "ReferenceableCellRefresh"]
                        ],
                true: {
                    increment: {
                        to: [{ myOriginalContent:_ }, [me]],
                        merge: [plus, [{ myOriginalContent:_ }, [me]], 1]
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,        
        context: {
            displayText: "Demonstration of User-Calculated Facets (UDF).\n1. Create new UDF. Click on the UDF's E control to open the calculator panel. Click '=' there, or close it to have the UDF's cell (bottom of the facet) display its updated value.\n2. Click on the 'Refresh' button to simulate a change to the database.\n3. Click on the pink control to toggle facet minimization.\n4. When editing a UDF, all referenced elements (recursively) are painted orange.\n5. All elements which use the edited UDF as a reference, as painted red (and cannot be used in its definition, to avoid a circular reference).\n6. UDF cells are calculated on evaluation or when the facet is minimized or exits edit mode. When the cell calculation is outdated wrt the UDF's defining expression, the cells' text is grey."
        },
        position: { top: 5, height: 120 }
    }   

};

var screenArea = {
    "class": o("ScreenArea"),
    children: {
        app: {
            description: {
                "class": "TestUDFApp"
            }
        }
    }
};
