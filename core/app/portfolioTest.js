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
// this test demonstrates the display of a portfolio, and of pieControllers used to both display its distribution in different (ms) facets, as well as to control that distribution.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%datafile%%: <myFSAppDB.js>
// %%classfile%%: <fsAppClasses.js>
// %%classfile%%: <pieControlClasses.js>
// %%classfile%%: <portfolioClasses.js>

var testConstants = {
    controllerGirth: 140,
    controllerLength: 200
};

var defaultNumItemsInPortfolio = 6;

var classes = {
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestPercentageDisplayControl: o(
        { // default
            "class": o("BiStateButton", "ImmunityFromCoExpandableReset"),
            position: {
                "horizontal-center": 0, 
                bottom: 10,
                height: 40,
                width: 200
            }
        },
        {
            qualifier: { checked: false },
            context: {
                displayText: "Display pie-bar by value"
            }
        },
        {
            qualifier: { checked: true },
            context: {
                displayText: "Display pie-bar by %"
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFSView: {
        "class": o("Border", "GeneralArea"),
        position: {
            left: 10,
            width: 1000,
            topConstraint: {
                point1: {
                    element: [{ children: { annotation:_ } }, [embedding]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 10              
            },
            bottom: 100
        },
        children: {
            solutionSetView: {
                description: {
                    "class": "TestPortfolioView"
                }
            },
            facetViewPane: {
                description: {
                    "class": "TestFacetViewPane"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestPortfolioView: {
        "class": o("Border", "GeneralArea", "PortfolioController"),
        context: {
            "^entirePortfolio": o(
                {
                    uniqueID: "MMM",
                    value: 100
                },
                {
                    uniqueID: "AES",
                    value: 100
                },
                {
                    uniqueID: "AFL",
                    value: 160
                },
                {
                    uniqueID: "T",
                    value: 200
                },
                {
                    uniqueID: "AKS",
                    value: 150
                },
                {
                    uniqueID: "ABT",
                    value: 120
                }             
            ),
            portfolio: [pos,
                        r(
                          0,
                          [minus, [arg, "nPortfolioItems", defaultNumItemsInPortfolio], 1]
                         ),                       
                         [{ entirePortfolio:_ }, [me]]
                       ],
                                    
            itemSet: itemList, // from the included data file
            portfolioUniqueIDQuery: [defun, o("what"), { "symbol": "what" }]
        },
        position: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 30,
            
            positionFirstItem: { // cutting corners here - the SolutionSetItems are positioned directly in the view, without Snap-To-Grid Functionality, etc.
                point1: { type: "top" },
                point2: { element: [first, [{ children: { items:_ } }, [me]]], type: "top" },
                equals: 0
            }
        },
        children: {
            items: {
                data: [{ portfolioItemSet:_ }, [me]],
                description: {
                    "class": "SolutionSetItem",
                    context: {
                        snappableSolutionSetItem: false
                    }
                }
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetViewPane: {
        "class": "GeneralArea",
        context: {
            "^facetData": o(
                {
                    id: "0",
                    name: "Name",
                    uniqueID: "name",
                    query: [defun, o("what"), { "name": "what" }],
                    facetType: "ItemValues"
                },
                {
                    id: "2",
                    name: "Value",
                    uniqueID: "value",
                    facetType: "ItemValues"
                },
                {
                    id: "2",
                    name: "Quality",
                    uniqueID: "quality",
                    query: [defun, o("what"), { "quality": "what" }],
                    facetType: "ItemValues",
                    expandedState: true
                }/*,
                {
                    id: "3",
                    name: "Exchange",
                    uniqueID: "exchange",
                    query: [defun, o("what"), { "exchange": "what" }],
                    facetType: "ItemValues",
                    expandedState: true
                }*/
            )
        },
        position: {
            top: 0,
            bottom: 0,
            right: 0,
            left: 0         
        },
        children: {
            facets: {
                data: [{ facetData:_ }, [me]],
                description: {
                    "class": "TestFacet"
                }
            }
        }
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacet: o(
        {
            qualifier: "!",
            context: {
                firstFacet: [{ firstInAreaOS:_ }, [me]],
                valueFacet: [equal,
                             [me],
                             [{ param: { areaSetContent: { name: "Value" } } },
                              [areaOfClass, "TestFacet"]
                             ]
                            ]               
            }
        },
        { // default
            "class": o("Border", "GeneralArea", "MemberOfLeftToRightAreaOS"),
            context: {
                facetQuery: [defun,
                             o("what"), 
                             [constructAVP,
                              [{ param: { areaSetContent: { uniqueID:_ } } }, [me]],
                              "what"
                             ]
                            ],
                facetProjectionQuery: [defun, 
                                       o("what"), 
                                       [[[{ facetQuery:_ }, [me]], _ ], 
                                        "what"
                                       ]
                                      ],
                myPortfolioController: [areaOfClass, "TestPortfolioView"],
                percentagePie: [{ myApp: { children: { percentageDisplayControl: { checked:_ } } } }, [me]],
                spacingFromPrev: 2 // MemberOfLeftToRightAreaOS param
            },
            position: {
                top: 0,
                bottom: 0
            },
            children: {
                header: {
                    description: {
                        "class": "TestFacetHeader"
                    }
                },
                cell: {
                    partner: [areaOfClass, "SolutionSetItem"],
                    description: {
                        "class": "TestCell"
                    }
                }
            }
        },
        {
            qualifier: { firstFacet: true },
            position: {
                left: 0,
                width: 150
            }
        },
        {
            qualifier: { valueFacet: true },
            "class": "ValueFacet",
            children: {
                portfolioValue: {
                    description: {
                        "class": "TestPortfolioValueDisplay"
                    }
                }
            },
            position: {
                width: 100
            }           
        },
        {
            qualifier: { firstFacet: false,
                         valueFacet: false },
            "class": "PortfolioPieFacet",
            position: {
                minTestFacetWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: 100
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetHeader: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "GeneralArea"),
        context: {
            name: [{ param: { areaSetContent: { name:_ } } }, [embedding]],
            displayText: [{ name:_ }, [me]] 
        },
        content: o(1,2,3),
        position: {
            top: 0,
            left: 0,
            right: 0,
            height: 20
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofValueFacet: [{ valueFacet:_ }, [expressionOf]]
            }
        }, 
        {
            "class": o("DefaultDisplayText", "GeneralArea", "FrameWRTIntersection"),
            context: {
                displayText: [{ value:_ }, [me]] 
            }
        },
        {
            qualifier: { ofValueFacet: false },
            context: {
                value: [[{ facetProjectionQuery:_ }, [expressionOf]],
                        [{ param: { areaSetContent:_ } }, [referredOf]]
                       ],
                facetShowingPieController: [{ expandedState:_ }, [expressionOf]]
            }
        },
        {
            qualifier: { ofValueFacet: false,
                         facetShowingPieController: false },
            "class": "TextAlignCenter"
        },
        {
            // qualifier: { ofValueFacet: false, facetShowingPieController: true } is implicitly TextAlignLeft (via GeneralArea)
        },
        {
            qualifier: { ofValueFacet: true },
            "class": o(
                       "TextAlignCenter",
                       "ValueCell" // value is defined by ValueCell
                      )
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyPortfolioView: {
        context: {
            myPortfolioView: [areaOfClass, "TestPortfolioView"]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestPortfolioValueDisplay: {
        "class": o("TextAlignCenter", "FixedNumericFormat", "TextBold", "DefaultDisplayText", "GeneralArea", "TrackMyPortfolioView"),
        context: {
            displayText: [{ myPortfolioView: { portfolioValue:_ } }, [me]] 
        },
        display: {
            background: "yellow"
        },
        position: {
            left: 0,
            right: 0,
            height: 20,
            topConstraint: {
                point1: {
                    element: [last, [{ myPortfolioView: { children: { items:_ } } }, [me]]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 5
            }
        }
    }
};

var screenArea = { 
    "class": o("ScreenArea", "App"),
    children: {
        annotation: {
            description: {
                "class": "TestAnnotation",
                context: {
                    displayText: "Demo of a portfolio with pie(-bar) controllers .\n1. The facets can be expanded to show their respective pie controller.\n2. In the pie controller, hover over a border between colored pie slices, grab the separator between them to change their relative sizes.\n3. Hover over a border and doubleClick to allow coExpansion of the two segments, or sets of pie slices, on either side of the separator.\n4. Click on the white button at the bottom to toggle the controller display between value and percentage."
                }
            }
        },
        percentageDisplayControl: {
            description: {
                "class": "TestPercentageDisplayControl"
            }
        },
        
        fsView: {
            description: {
                "class": "TestFSView"
            }
        }
    }
};

