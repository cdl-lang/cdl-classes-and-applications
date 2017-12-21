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


// %%classfile%%: "selector.js"

var classes = {
    /*--------------------
    The area where the filtering of the current slice takes place
    requires 
    - topLevelFacetsParams      
    - firstLevelFacetsParams (optional)
    --------------------*/
    Inspector: o(
        {
            "class": "FacetSelectorContext",
            
            context: {
                // requires topLevelFacetsParams

                // the selection chain of the selected slice (required by
                // FacetSelectorContext).
                selectionChain: [
                    { selectionChain: _ }, [areaOfClass, "SelectedSlice"]]
            },
            position: {
                frame: 0,
            },
            children: {
                titledFacetsContainer: {
                    description: {
                        "class": "TitledFacetsContainer",
                        context: {
                            subFacetsParams: [{ topLevelFacetsParams: _ }, [embedding]]
                        }
                    }
                }
            },
            display: {
                background: "#ffebcc",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            },
        },
        {
            qualifier: { firstLevelFacetsParams: true },
            children: {
                titledMultiTitledFacet: {
                    description: {
                        "class": "MultiLayeredFacetSelector",
                        context: {
                            firstLevelFacetsParams: [{ firstLevelFacetsParams: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    ),

    TitledFacetsContainer: {
        context: {
            // subFacetsParams: required     
            // an os with each element of type: { facetName: "x", title: "X" },       
            // primaryKey (optional)
            topMargin: 5,
        },
        children: {
            titledFacets: {
                data: [{ subFacetsParams: _ }, [me]],
                description: {
                    class: "TitledFacet",
                    context: {
                        facetParams: [{ param: { areaSetContent: _ } }, [me]],
                        primaryKey: [{ primaryKey: _ }, [embedding]],
                        width: [{ width: _ }, [{ facetParams: _ }, [me]]],
                        leftPointConstraint: [cond,
                            [prev, [me]],
                            o(
                                { on: true, use: { element: [prev, [me]], type: "right" } },
                                { on: false, use: { element: [embedding], type: "left" } }
                            )
                        ],
                    },
                    position: {
                        leftConstraint: {
                            point1: [{ leftPointConstraint: _ }, [me]],
                            point2: { type: "left" },
                            equals: 10,
                        },
                        top: 10,
                        width: [first, o([{ width: _ }, [me]], 75)]
                    }
                }
            }
        },
        position: {
            top: [{ topMargin: _ }, [me]],
            bottomConstraint: {
                point1: { type: "bottom", element: [{ children: { titledFacets: _ } }, [me]] },
                point2: { type: "bottom" },
                min: 5,
            },      
            bottomConstraintOrGroup: {
                point1: { type: "bottom", element: [{ children: { titledFacets: _ } }, [me]] },
                point2: { type: "bottom" },
                orGroups: { label: "bottomOrConstraint" },
                equals: 5
            },      
            left: 5,
            rightConstraint: {
                point1: { type: "right", element: [last, [{ children: { titledFacets: _ } }, [me]]] },
                point2: { type: "right" },
                equals: 10,
            },
        }
    },

    MultiLayeredFacetSelector: {
        context: {
            // Requires: firstLevelFacetsParams
            /* an os of elements conforming to:                         
                { 
                    primaryKey: "Economic Activity", title: "Economic Activity",
                    subFacetsParams: o(
                        { facetName: "ms", title: "Country" },
                        { facetName: "to", title: "TO" }
                    )
                },
            */
            sibblingTitledFacetsContainer: [{ children: { titledFacetsContainer: _ } }, [embedding]],
            selectedPrimaryKey: [{ selectedPrimaryKey: _ }, [areaOfClass, "SelectedSlice"]],
        },
        children: {
            compoundFacetSelector: {
                data: [{ firstLevelFacetsParams: _ }, [me]],
                description: {
                    "class": "CompoundFacetSelector"
                }
            }
        },
        position: {
            leftConstraint: {
                point1: { type: "right", element: [{ sibblingTitledFacetsContainer: _ }, [me]] },
                point2: { type: "left" },
                equals: 10,
            },
            top: 10,
            rightConstraint: {
                point1: { type: "right", element: [{ children: { compoundFacetSelector: _ } }, [me]] },
                point2: { type: "right" },
                min: 10,
            },
            bottom: 10
        },
    },


    /*--------------------
    The accordion: a multiTitledFacet (area including titledFacets) with a title        
    --------------------*/
    CompoundFacetSelector: o(
        {
            context: {
                myParams: [{ param: { areaSetContent: _ } }, [me]],
                primaryKey: [{ primaryKey: _ }, [{ myParams: _ }, [me]]],
                titleText: [{ title: _ }, [{ myParams: _ }, [me]]],
                subFacetsParams: [{ subFacetsParams: _ }, [{ myParams: _ }, [me]]],
                topConstraintPoint: [cond,
                    [prev, [me]],
                    o(
                        { on: true, use: { type: "bottom", element: [prev, [me]] } },
                        { on: false, use: { type: "top", element: [{ children: { title: _ } }, [embedding]] } }
                    )
                ],
                bottomConstraintElement: [{ children: { title: _ } }, [me]],
                selectedPrimaryKey: [{ selectedPrimaryKey: _ }, [embedding]],
                amISelected: [[{ primaryKey: _ }, [me]], [{ selectedPrimaryKey: _ }, [me]]]
            },
            children: {
                title: {
                    description: {
                        display: {
                            text: {
                                fontSize: 13,
                                value: [{ titleText: _ }, [embedding]]
                            }
                        },
                        position: {
                            top: 5,
                            height: 15,
                            left: 0,
                            right: 0,
                        },
                        write: {
                            onClick: {
                                upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                                true: {
                                    changePrimaryKey: {
                                        to: [{ selectedPrimaryKey: _ }, [embedding]],
                                        merge: [{ primaryKey: _ }, [embedding]],
                                    }
                                }
                            }
                        }
                    }
                },
            },
            position: {
                left: 0,
                top: {
                    point1: [{ topConstraintPoint: _ }, [me]],
                    point2: { type: "top" },
                    equals: 10,
                },
                rightConstraint: {
                    point1: { type: "right", element: [{ children: { titledFacetsContainer: _ } }, [me]] },
                    point2: { type: "right" },
                    equals: 10,
                },
                bottomConstraint: {
                    point1: {type: "bottom", element: [{ bottomConstraintElement: _ }, [me]]},
                    point2: { type: "bottom" },
                    equals: 10,
                }
                //height: 300               
            },
            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            }
        },
        {
            qualifier: {amISelected: true},
            context: {
                bottomConstraintElement: [{ children: { titledFacetsContainer: _ } }, [me]]
            },
            display: {
                background: "#ffcc00"
            },
            children: {
                titledFacetsContainer: {
                    description: {
                        "class": "TitledFacetsContainer",
                        context: {
                            subFacetsParams: [{ subFacetsParams: _ }, [embedding]],
                            primaryKey: [{ primaryKey: _ }, [embedding]],
                            topMargin: 20
                        }
                    }
                }
            },
        }
    ),


    /*--------------------
    Area displaying a facet with its title
    --------------------*/
    TitledFacet: {
        context: {
            // required: facetParams
            // optional: primaryKey
            facetName: [{ facetName: _ }, [{ facetParams: _ }, [me]]],
            titleText: [{ title: _ }, [{ facetParams: _ }, [me]]],
        },
        children: {
            title: {
                description: {
                    display: {
                        text: {
                            fontSize: 13,
                            value: [{ titleText: _ }, [embedding]]
                        }
                    },
                    position: {
                        top: 0,
                        height: 15,
                        left: 0,
                        right: 0,
                    }
                }
            },
            facet: {
                description: {
                    class: "Facet",
                    context: {
                        facetName: [{ facetName: _ }, [embedding]],
                        primaryKey: [{ primaryKey: _ }, [embedding]],
                    },
                    position: {
                        posConstraint: {
                            point1: { element: [{ children: { title: _ } }, [embedding]], type: "bottom" },
                            point2: { type: "top" },
                            equals: 5,
                        },
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }
            },
        }
    },

    /*--------------------
    Area displaying a facet
    --------------------*/
    Facet: o(
        {
            "class": "FacetSelector",
            
            context: {
                //required: facetName, primaryKey (optional)

                // "FacetSelector" requires a "primaryFacet" field, not
                // a "primaryKey" one.
                primaryFacet: [{ primaryKey: _ }, [me]],
                
                // the identifier applies the default sorting automatically
                facetCells: [sort,
                    [_,
                        o(
                            [{ availableValues: _ }, [me]],
                            [{ selectedValues: _ }, [me]]
                        )
                    ],
                    "ascending"
                ],

            },
            children: {
                dataCells: {
                    data: [{ facetCells: _ }, [me]],
                    description: {
                        class: "FacetCell",
                        context: {
                            primaryKey: [{ primaryKey: _ }, [embedding]]
                        }
                    }
                }
            },
            position: {
                //required: left, right, top
                topAboveFirstDataCell: {
                    point1: { type: "top" },
                    point2: {
                        type: "top",
                        element: [first, [{ children: { dataCells: _ } }, [me]]]
                    },
                    equals: 5
                },
                bottomBelowLastDataCell: {
                    point1: {
                        type: "bottom",
                        element: [last, [{ children: { dataCells: _ } }, [me]]]
                    },
                    point2: { type: "bottom" },
                    equals: 5
                },
            },
            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            }
        }
    ),


    /*--------------------
    Area displaying a cell inside a facet
    User can select/deselect the cell by clicking on it. 
    --------------------*/
    FacetCell: o(
        {
            context: {
                cellValue: [{ param: { areaSetContent: _ } }, [me]],

                cellEntry: [
                    {
                        facetName: [{ facetName: _ }, [embedding]],
                        value: [{ cellValue: _ }, [me]],
                    },
                    [{ selectionValues: _ }, [embedding]]
                ],

                selected: [{ selected: _ }, [{ cellEntry: _ }, [me]]],
                inSolutionSet: [
                    [{ cellValue: _ }, [me]],
                    [{ availableValues: _ }, [embedding]]
                ]
            },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        changeSelection: {
                            to: [{ cellEntry: _ }, [me]],
                            merge: { selected: [not, [{ selected: _ }, [me]]] },
                        }
                    }
                }
            },
            display: {
                text: {
                    fontSize: 11,
                    value: [{ cellValue: _ }, [me]]
                },
                borderWidth: 0.5,
                borderStyle: "solid",
                borderColor: "gray"
            },
            position: {
                left: 2,
                right: 2,
                height: 13,
                topFromPrevious: {
                    point1: {
                        type: "bottom",
                        element: [prev, [me]]
                    },
                    point2: { type: "top" },
                    equals: 3
                },
            },
        },
        {
            qualifier: { selected: true, inSolutionSet: true },
            display: {
                background: "#A6EE7D"
            }
        },
        {
            qualifier: { selected: true, inSolutionSet: false },
            display: {
                background: "#C9C9C9"
            }
        }
    )
}
