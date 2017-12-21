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
// This library provides portfolio functionality, which allows displaying a portfolio (essentially an extensional overlay with a value associated with each item).
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <pieControlClasses.js>

var portfolioConstants = {
     epsilonValue: 0.1
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the composition of a portfolio.
    // API:
    // 1. portfolio: a writable reference to an os which fully describes the portfolio. the os objects are of the form:
    // 1.1 uniqueID
    // 1.2 value
    // 2. itemSet: an os of objects from which the portfolio is constructed.
    // 3. portfolioUniqueIDQuery: a function containing the name of the attribute uniquely identifying items in the itemSet. for example: [defun, o("what"), { "symbol": "what" }]
    //    which is used to form projection and selection queries
    //
    // interface:
    // 1. portfolioValue: stores the total value of the portfolio
    // 2. portfolioItemSet: the subset of the itemSet which is included in the portfolio.
    // 3. myPieControllerBeingModified: a boolean indicating whether the values of the portfolio are being modified by one of its PieControllers
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                myPieControllerBeingModified: [ 
                                               { zsControllerBeingModified: true },
                                               [{ myPieController:_ }, [me]]
                                              ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {                
                myPieController: [{ myPortfolioController: [me] }, // may be multiple pie controllers associated with a single PortfolioController
                                  [areaOfClass, "PieController"]
                                 ],
                portfolioValue: [sum,
                                 [{ portfolio: { value:_ } }, [me]]
                                ],
                // the subset of the itemSet which is included in the portfolio:
                portfolioItemSet: [[[{ portfolioUniqueIDQuery:_ }, [me]],
                                    [{ portfolio: { uniqueID:_ } }, [me]]         
                                   ],
                                   [{ itemSet:_ }, [me]]
                                  ],

                portfolioUniqueIDProjectionQuery: [defun, 
                                                   o("what"), 
                                                   [[[{ portfolioUniqueIDQuery:_ }, [me]], _ ], 
                                                    "what"
                                                   ]
                                                  ]
            },
            children: {
                portfolioItems: {
                    data: [{ portfolio:_ }, [me]],
                    description: {
                        "class": "PortfolioItem"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by an areaSet embedded in the PortfolioController. An instance of this class manages the value of a single object in the PortfolioController's portfolio
    // writable reference.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                myPieSliceIsBeingModified: [{ myPieSliceInControllerBeingModified: { expandableBeingModified:_ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea"),
            context: {                
                uniqueID: [{ param: { areaSetContent: { uniqueID:_ } } }, [me]],
                // extract the portfolio item object from the itemSet of the PortfolioController
                item: [[[{ portfolioUniqueIDQuery:_ }, [embedding]], // construct a selection query of the form, e.g. { "symbol": "MMM" }
                        [{ uniqueID:_ }, [me]]
                       ],
                       [{ itemSet:_ }, [embedding]]
                      ],
                       
                
                myPieControllerBeingModified: [{ myPieControllerBeingModified:_ }, [embedding]],
                
                myPieSliceInControllerBeingModified: [{ // retrieve my pieSlice from the pieController that is being modified
                                                        name: [[{ myPieControllerBeingModified: { pieControllerProjectionQuery:_ } }, [me]],
                                                               [{ item:_ }, [me]]
                                                              ]
                                                      },
                                                      [{ myPieControllerBeingModified: { children: { slices:_ } } }, [me]]
                                                     ],
                stableValue: [{ param: { areaSetContent: { value:_ } } }, [me]]                
            }
        },
        {
            qualifier: { myPieSliceIsBeingModified: false },
            context: {  
                value: [{ stableValue:_ }, [me]]
            }
        },
        {
            qualifier: { myPieSliceIsBeingModified: true },
            context: {  
                value: [mul,
                        [{ stableValue:_ }, [me]],
                        [{ myPieSliceInControllerBeingModified: { currentExpansionFactor:_ } }, [me]]
                       ]
            },
            write: {
                onMyPieSliceNoLongerBeingModified: {
                    "class": "OnAnyMouseUp",
                    true: {
                        recordValueInStableValue: {
                            to: [{ stableValue:_ }, [me]],
                            merge: [cond, [{ value:_ }, [me]], 
                                          o({ on: 0, use: [plus, [{ value:_ }, [me]], portfolioConstants.epsilonValue] },
                                            { on: null, use: [{ value:_ }, [me]] }
                                           )]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myPortfolioController: an areaRef to a PortfolioController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioFacet: {
        "class": "GeneralArea"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // a facet which embeds a PortfolioPieAmoeba. 
    // for now this is only intended for use with ms-type facets 
    // (though conceivably, eventually we may also want to translate a slider facet to MECE bins which can be controlled via a PieController).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioPieFacet: o(
        { // variant-controller
            qualifier: "!",
            context: {
                expandedState: [{ param: { areaSetContent: { expandedState:_ } } }, [me]]
            }
        },
        { // default
            "class": o("PortfolioFacet","MinWrapHorizontal"),
            children: {
                portfolioPieFacetExpansionControl: {
                    description: {
                        "class": "PortfolioPieFacetExpansionControl"
                    }
                }
            }
        },
        {
            qualifier: { expandedState: true },
            children: {
                pieBarAmoeba: {
                    description: {
                        "class": "PortfolioPieAmoeba"
                    }
                }
            }           
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // an amoeba in a PortfolioPieFacet. it embeds a PortfolioPieControllerInAmoeba, surprisingly...
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioPieAmoeba: {
        "class": o("Border", "MinWrapHorizontal", "GeneralArea"),
        position: {
            // hard-coding positioning for now
            left: 60,
            top: 50,
            bottom: 10,
            right: 5
        },
        children: {
            pieController: {
                description: {
                    "class": "PortfolioPieControllerInAmoeba"
                }   
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myFacet: areaRef (its grandparent embedding, by default)
    // 2. pieControllerName: default definition provided by myFacet.
    // 3. pieControllerQuery: in a function form (e.g. [defun, o("what"), { "52 week high": "what" }]). default definition provided by myFacet.
    // 4. myPortfolioController: areaRef. default definition provided by myFacet.
    // 5. percentagePie: should the values be displayed as such or as percentage. default defintion provided by myFacet.
    // 6. pieColors: the colors of the pieSlices.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioPieControllerInAmoeba: {
        "class": o("VerticalPortfolioDependentPieController"),
        context: {
            myFacet: [embedding, [embedding]],
            
            // PieController params: 
            pieControllerName: [{ myFacet: { name:_ } }, [me]],
            pieControllerQuery: [{ myFacet: { facetQuery:_ } }, [me]],
            myPortfolioController: [{ myFacet: { myPortfolioController:_ } }, [me]],
            percentagePie: [{ myFacet: { percentagePie:_ } }, [me]],
            pieColors: o("cyan", "pink", "grey", "orange", "green", "red", "blue")
        },
        position: {
            "horizontal-center": 0,
            left: 5,
            width: 100,
            top: 20,
            bottom: 20
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A crude expansion controller, for the sake of the portfolioTest.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PortfolioPieFacetExpansionControl: o(
        { // variant-controller
            qualifier: "!",
            context: { 
                checked: [{ expandedState:_ }, [embedding]]
            }
        },
        { // default
            "class": o("Border", "BiStateButton"),
            display: {
                borderColor: "orange"
            },
            position: {
                left: 2,
                top: 2,
                width: 15,
                height: 15
            }
        },
        {
            qualifier: { checked: true },
            display: {
                background: "orange"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // the facet displaying a portfolio's item values. the intersection it forms with SolutionSetItems inherit ValueCell.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValueFacet: {
        "class": "PortfolioFacet"
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherited by the cell which is an intersection of the ValueFacet and a SolutionSetItem
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ValueCell: {
        "class": o("FixedNumericFormat","GeneralArea"),
        context: {
            myPortfolioItem: [{ 
                                   uniqueID: [[{ myPortfolioController: { portfolioUniqueIDProjectionQuery:_ } }, [expressionOf]],
                                              [{ param: { areaSetContent:_ } }, [referredOf]]
                                             ]
                              },
                              [{ myPortfolioController: { children: { portfolioItems:_ } } }, [expressionOf]]
                             ],
                              
            value: [{ myPortfolioItem: { value:_ } }, [me]]
        }
    }
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// End of library
/////////////////////////////////////////////////////////////////////////////////////////////////////////    
};