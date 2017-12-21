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
// this library provides the PieController functionality, which displays the distribution of MECE (Mutually Exclusive Collectively Exhaustive) values, and the modification of that 
// distribution.
// for the time being, the pie is in fact a rectangular pie.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <portfolioClasses.js>
// %%classfile%%: <pieControlDesignClasses.js>

var classes = {
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the vertical version of the IndependentPieController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalIndependentPieController: {
        "class": o("Vertical", "IndependentPieController")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the horizontal version of the PieController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalIndependentPieController: {
        "class": o("Horizontal", "IndependentPieController")
    },

    // for now, not defining a Vertical/Horizontal DependentPieController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the vertical version of the PortfolioDependentPieController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalPortfolioDependentPieController: {
        "class": o("Vertical", "PortfolioDependentPieController")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the horizontal version of the PortfolioDependentPieController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalPortfolioDependentPieController: {
        "class": o("Horizontal", "PortfolioDependentPieController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The PieController allows controlling a pie(bar). the PieSlices of a PieController can be explicitly modified by the user by dragging the handle between them.
    // 1. in the default state, the dragging of the handle expands one of the two adjacent areas at the expense of the other.
    // 2. if the Controller is in a coExpansion state (by double-clicking on one of the handles), then the user can coExpand the PieSlices on one side of the handle at the expense
    //    of the PieSlices on its other side.
    // 
    // API: 
    // This class should not be inherited directly. Rather, its Dependent/Independent & Vertical/Horizontal inheriting classes should be inherited.
    // 1. provide the description for children:slices, which should include a class that inherits PieSlice
    // 2. percentagePie: an appData which determines whether the pie displays its values as a % or as a number.
    // 3. pieControllerName: the controller's name (e.g. "Exchange").
    // 4. pieControllerQuery: the controller's query function (e.g. [defun, o("what"), { "52 week high": "what" }]), which would allow the formation of projection/selection queries.
    //    if this is a DependentPieController, the pieControllerQuery should match one of the attributes of the portfolioItemSet from which myPortfolioController is constructed.
    // 5. pieColors: an os of color. a default is provided.
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PieController: o(
        { // default
            "class": o("ExpandableZeroSumController", "GeneralArea"),
            context: {
                // Param for ExpandableZeroSumController
                expandables: [{ children: { slices:_ } }, [me]],                
                
                "^percentagePie": false,
                
                pieColors: o("cyan", "pink", "grey", "orange", "green", "red", "blue")
            }
        },
        {   
            qualifier: { coExpandable: true },
            context: {
                // a set of values to be displayed in the CoExpandingValuesIcon (depending on whether it displays actual values or %).
                currentPrefixVal: [mul,
                                   [div,
                                    [offset, 
                                     { type: [{ lowHTMLLength:_ }, [me]] },
                                     [{ coExpansionPoint:_ }, [me]]
                                    ],
                                    [{ lengthOfExpandableZeroSumController:_ }, [me]]
                                   ],
                                   [{ valOfPie:_ }, [me]]
                                  ],
                currentSuffixVal: [mul,
                                   [div,
                                    [offset, 
                                     [{ coExpansionPoint:_ }, [me]],
                                     { type: [{ highHTMLLength:_ }, [me]] }
                                    ],
                                    [{ lengthOfExpandableZeroSumController:_ }, [me]]
                                   ],
                                   [{ valOfPie:_ }, [me]]
                                  ],
                currentPrefixPercentage: [percentage,
                                          [{ currentPrefixVal:_ }, [me]],
                                          [{ valOfPie:_ }, [me]]
                                         ],                                      
                currentSuffixPercentage: [percentage,
                                          [{ currentSuffixVal:_ }, [me]],
                                          [{ valOfPie:_ }, [me]]
                                         ]
            }
        }       
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits the PieController class. It represents a pie control which maintains its values (i.e. slice sizes) itself, as *appData*
    // API: 
    // 1. See PieController
    // 2. pieSlicesData: a writeable ref of an os of objects each with the following attributes:
    // 2.1 name
    // 2.2 val 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IndependentPieController: {
        "class": "PieController",
        context: {
            valOfPie: [sum,
                       [{ pieSlicesData: { value:_ } }, [me]] 
                      ]
        },
        children: {
            slices: {
                data: [{ pieSlicesData:_ }, [me]],
                description: {
                    "class": "IndependentPieSlice"
                }
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits the PieController class. It represents a pie control whose values are derived from appData stored else where (e.g. see PortfolioDependentPieController).
    // API: 
    // 1. See PieController
    // 2. pieSlicesNames: an os of values which represent the names of the slices.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DependentPieController: {
        "class": "PieController",
        context: {            
            // ExpandableZeroSumController params:
            independentExpandable: false // override default value provided there.
        },
        children: {
            slices: {
                data: [{ pieSlicesNames:_ }, [me]],
                description: {
                    "class": "DependentPieSlice"
                }
            }
        }       
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is a DependentPieController which depends on an associated PortfolioController.
    // When expansion/coExpansion take place, those slices being modified take their value not from the PortfolioController, but rather from the positioning system.
    // API: 
    // 1. See PieController
    // 2. myPortfolioController, an areaRef to an associated PortfolioController    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioDependentPieController: {
        "class": "DependentPieController",
        context: {
            valOfPie: [{ myPortfolioController: { portfolioValue:_ } }, [me]],
            
            // pieControllerProjectionQuery uses the pieControllerQuery function, and provides it with the "_" as input, to form a projection query
            pieControllerProjectionQuery: // [[{ pieControllerProjectionQuery:_ }, [me]], _ ] - once i understand why [identify] is needed here, perhaps this line could replace the [defun] that follows
                                         [defun,
                                          o("what"), 
                                          [identify, // not clear why this is needed explicitly here, in a projection, and not done implicitly by the system.
                                           _,
                                           [[[{ pieControllerQuery:_ }, [me]], _ ], 
                                            "what"
                                           ]
                                          ]
                                         ],
            pieSlicesNames: [
                              [{ pieControllerProjectionQuery:_ }, [me]],
                              [{ myPortfolioController: { portfolioItemSet:_ } }, [me]]
                            ]
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class represents a discrete value in the set of MECE values displayed by the controller. 
    // it is inherited by IndependentPieSlice/DependentPieSlice, which in turn are inherited by areaSets in IndependentPieController/DependentPieController.
    // 
    // it inherits ExpandableZeroSum
    // 
    // API:
    // 1. See ExpandableZeroSum.    
    // 2. (provided by one of the two inheriting classes: IndependentPieSlice/DependentPieSlice):
    // 2.1 name: the name of the slice. e.g. "NYSE", or "Good"
    // 2.2 stableValOfSlice/currentValOfSlice: one is the stable value of the slice, the other its current (during mouseDown) value.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PieSlice: o(
        { // default
            "class": o("PieSliceDesign", "ExpandableZeroSum", "GeneralArea"),
            context: {
                percentagePie: [{ myExpandableZeroSumController: { percentagePie:_ } }, [me]]
            },
            children: {
                name: {
                    description: {
                        "class": o("PieSliceNameDesign", "GeneralArea"),
                        context: {
                            displayText: [{ name:_ }, [embedding]]
                        },
                        position: {
                            top: 0,
                            left: 5,
                            right: 0,
                            bottomConstraint: {
                                point1: {
                                    element: [embedding],
                                    type: "vertical-center"
                                },
                                point2: {
                                    type: "bottom"
                                },
                                equals: 0                           
                            }
                        }                   
                    }
                },
                expansionZeroSumHandle: { // same child as provided by ExpandableZeroSum.
                    // partner: defined by ExpandableZeroSum
                    description: {
                        "class": "PieSliceHandleAddendum" // an addition to the class inherited by expansionZeroSumHandle in ExpandableZeroSum.
                    }
                }
            },
            display: {
                background: [pos,
                             [index, [me]],
                             [{ pieColors:_ }, [embedding]]
                            ]
            }           
        },
        {
            qualifier: { percentagePie: false },
            context: {
                displayText: [{ currentValOfSlice:_ }, [me]]
            }
        },
        {
            qualifier: { percentagePie: true },
            context: {
                displayText: [percentage,
                              [{ currentValOfSlice:_ }, [me]],
                              [{ valOfPie:_ }, [embedding]]
                             ]
            }
        },
        {
            qualifier: { expandableBeingModified: true },
            context: {
                currentValOfSlice: [mul,
                                    [{ stableValOfSlice:_ }, [me]],
                                    [{ currentExpansionFactor:_ }, [me]]
                                   ]
            }
        }       
    ),
            
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class inherited by the areaSet of pie slices in an independent pie controller. it inherits PieSlice
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IndependentPieSlice: o(
        { // default
            "class": "PieSlice",
            context: {
                name: [{ param: { areaSetContent: { name:_ } } }, [me]],
                stableValOfSlice: [{ param: { areaSetContent: { value:_ } } }, [me]]
            }
        },
        {
            qualifier: { expandableBeingModified: true },
            write: {
                onIndependentPieSliceMouseUpWhileExpandableBeingModified: {
                    "class": "OnAnyMouseUp",
                    true: {
                        storeStableValOfSlice: {
                            to: [{ stableValOfSlice:_ }, [me]],
                            merge: [{ currentValOfSlice:_ }, [me]]
                        }
                    }
                }               
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class inherited by the areaSet of pie slices in an dependent pie controller. it inherits PieSlice
    // Note the shortcut: for the time being, we equate the DependentPieController with the PortfolioDependentPieController - this class assumes myPortfolioController is defined by
    // its embedding PieController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DependentPieSlice: o(
        { // default
            "class": "PieSlice",
            context: {
                name: [{ param: { areaSetContent:_ } }, [me]],
                
                // we project on the uniqueID attribute, the subset of portfolio items which match this PieSlice (e.g. { "exchange": "NYSE" }
                myPortfolioItems: [[[{ pieControllerQuery:_ }, [embedding]],
                                    [{ name:_ }, [me]]
                                   ],
                                   [{ myPortfolioController: { portfolioItemSet:_ } }, [embedding]]
                                  ],

                myPortfolioItemsUniqueIDs: [[{ myPortfolioController: { portfolioUniqueIDProjectionQuery:_ } }, [embedding]],
                                            [{ myPortfolioItems:_ }, [me]]
                                           ],
                stableValOfSlice: [sum,
                                   [{
                                        uniqueID: [{ myPortfolioItemsUniqueIDs:_ }, [me]],
                                        value:_
                                    },
                                    [{ myPortfolioController: { portfolio:_ } }, [embedding]]
                                   ]
                                  ],
                                  
                stableExpandableLength: [mul,
                                         [div,
                                          [{ stableValOfSlice:_ }, [me]],
                                          [{ valOfPie:_ }, [embedding]]
                                         ],
                                         [{ lengthOfExpandableZeroSumController:_ }, [embedding]]
                                        ]         
            }
        },
        {
            qualifier: { expandableBeingModified: false },
            context: {
                currentValOfSlice: [sum,
                                    [{
                                         uniqueID: [{ myPortfolioItemsUniqueIDs:_ }, [me]],
                                         value:_
                                     },  
                                     [{ myPortfolioController: { children: { portfolioItems:_ } } }, [embedding]]
                                    ]
                                   ]
            }
        },
        { 
            qualifier: { verticalExpansion: true,
                         expandableBeingModified: false },
            context: {
                stableExpandableHeight: [{ stableExpandableLength:_ }, [me]]
            }
        },
        { 
            qualifier: { horizontalExpansion: true,
                         expandableBeingModified: false },
            position: {
                stableExpandableWidth: [{ stableExpandableLength:_ }, [me]]
            }
        }       
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PieSliceHandleAddendum: o(  
         {
            qualifier: { coExpandable: true,
                         makeVisible: true },
            children: {
                coExpansionValuesIcon: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "CoExpansionValuesIcon"
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an icon that is created by the expandableZeroSum's handle when it is in the coExpandable state, and active. 
    // It displays the values of the prefix and suffix regions (it embeds two areas, one for the prefix value, one for the suffix value).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CoExpansionValuesIcon: o(
        { // variant-controller
            qualifier: "!",
            context: {
                verticalExpansion: [{ verticalExpansion:_ }, [expressionOf]]
            }
        },
        { // default
            "class": o("BackgroundColor", "Border", "DelicateRoundedCorners", "Icon"),
            context: {
                valueIconWidth: 40, // replace with display query, when available
                valueIconHeight: 25 // TextAlignCenter
            },
            stacking: {
                belowTheHandle: {
                    lower: [me],
                    higher: [expressionOf]
                }
            },
            position: {
                horizontalAttachmentToHandle: {
                    point1: { 
                        type: "horizontal-center" 
                    },
                    point2: { 
                        element: [expressionOf],
                        type: "horizontal-center"
                    },
                    equals: 0
                },
                verticalAttachmentToHandle: {
                    point1: { 
                        type: "vertical-center" 
                    },
                    point2: { 
                        element: [expressionOf],
                        type: "vertical-center"
                    },
                    equals: 0
                }
            },
            children: {
                prefixSlicesValue: {
                    description: {
                        "class": "PrefixSlicesValue"
                    }
                },
                suffixSlicesValue: {
                    description: {
                        "class": "SuffixSlicesValue"
                    }
                }
            }
        },
        {
            qualifier: { verticalExpansion: true },
            position: {
                width: [{ valueIconWidth:_ }, [me]],
                height: [mul, 2, [{ valueIconHeight:_ }, [me]]]
            }
        },
        {
            qualifier: { verticalExpansion: false },
            position: {
                width: [mul, 2, [{ valueIconWidth:_ }, [me]]],
                height: [{ valueIconHeight:_ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is the common code to the two areas embedded in the CoExpansionValuesIcon.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SlicesValue: o(
        { // variant-controller
            qualifier: "!",
            context: {
                verticalExpansion: [{ verticalExpansion:_ }, [embedding]],
                percentagePie: [{ myController: { percentagePie:_ } }, [me]]
            }
        },
        { // default
            "class": o("SlicesValueDesign", "GeneralArea"),
            context: {
                myController: [{ myController:_ }, [expressionOf, [embedding]]]
            }
        },
        {
            qualifier: { verticalExpansion: true },
            position: {
                left: 0,
                right: 0,
                height: [{ valueIconHeight:_ }, [embedding]]
            }
        },
        {
            qualifier: { verticalExpansion: false },
            position: {
                top: 0,
                bottom: 0,
                width: [{ valueIconWidth:_ }, [embedding]]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the CoExpansionValuesIcon, and presents the total value/percentage of the prefix slices
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PrefixSlicesValue: o(
        { // default
            "class": "SlicesValue"
        },
        {
            qualifier: { verticalExpansion: true },
            position: {
                top: 0
            }
        },
        {
            qualifier: { verticalExpansion: false },
            position: {
                left: 0
            }
        },
        {
            qualifier: { percentagePie: false },
            context: {
                displayText: [{ myController: { currentPrefixVal:_ } }, [me]]
            }
        },
        {
            qualifier: { percentagePie: true },
            context: {
                displayText: [{ myController: { currentPrefixPercentage:_ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is embedded in the CoExpansionValuesIcon, and presents the total value/percentage of the suffix slices
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SuffixSlicesValue: o(
        { // default
            "class": "SlicesValue"
        },
        {
            qualifier: { verticalExpansion: true },
            position: {
                bottom: 0
            }
        },
        {
            qualifier: { verticalExpansion: false },
            position: {
                right: 0
            }
        },
        {
            qualifier: { percentagePie: false },
            context: {
                displayText: [{ myController: { currentSuffixVal:_ } }, [me]]
            }
        },
        {
            qualifier: { percentagePie: true },
            context: {
                displayText: [{ myController: { currentSuffixPercentage:_ } }, [me]]
            }
        }
    )
    
        
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// End of library
/////////////////////////////////////////////////////////////////////////////////////////////////////////    
};
