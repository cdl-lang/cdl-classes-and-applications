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

    /*--------------------
    --------------------*/
    SelectedSlice: {
        context: {
            // requires: selectedSlice
            selectionChain: [{ children: { selectionChain: _ } }, [me]],
        }
    },

    /*--------------------
    The class representing a Slice of the data.
    The selection chain mechanism is performd by the selectionChain child.
    In addition it visualizes a summary (number of rows, and total over the sumFieldName provided)
    Requires:
    - sumFieldsParams
    --------------------*/
    Slice: o(
        {
            "class": "SelectionChainContext",
            context: {

                // access to data
                dataLoader: [areaOfClass, "DataLoader"],
                inputData: [{ data: _ }, [{ dataLoader: _ }, [me]]],
                
                "^selectedPrimaryKey": [first,
                    [{ firstLevelFacetsParams: { primaryKey: _ } }, [areaOfClass, "DataLoader"]],
                ],

                amISelected: [[me], [{ selectedSlice: _ }, [embedding]]],

                // requires sumFieldsParams
                sumFields: [cond,
                    [{ selectedPrimaryKey: _ }, [me]],
                    o(
                        {
                            on: true, use: [
                                { sumFieldPrimaryKey: [{ selectedPrimaryKey: _ }, [me]] },
                                [{ sumFieldsParams: _ }, [me]]
                            ]
                        },
                        { on: false, use: [{ sumFieldsParams: _ }, [me]] }
                    )
                ],

                solutionSet: [{ solutionSet: _ }, [{ children: { selectionChain: _ } }, [me]]],
                totalRows: [size, [{ solutionSet: _ }, [me]]],

                bottomElement: [last,
                    o(
                        [{ children: { totalRowsLabeledValue: _ } }, [me]],
                        [{ children: { totalSumFieldLabeledValue: _ } }, [me]]
                    )
                ]
            },
            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            },
            children: {
                selectionChain: {
                    description: {
                        "class": "TopLevelSelectionChain",
                        context: {
                            selectedPrimaryKey: [{ selectedPrimaryKey: _ }, [embedding]],
                            // only the selected compound facet may be active
                            activeCompoundFacetNames: [
                                { selectedPrimaryKey: _ }, [me]],
                            solutionSet: [
                                [{ getProjectedSolutionSet: _ }, [me]],
                                 [{ selectedPrimaryKey: _ }, [me]]]
                        }
                    },
                },
                totalRowsLabeledValue: {
                    description: {
                        "class": "LabeledValue",
                        context: {
                            valueIsMonetary: false,
                            topReferencePoint: { type: "top", element: [embedding] },
                            textContent: "Total Rows:",
                            valueContent: [{ totalRows: _ }, [embedding]],
                        },

                    }
                },
                totalSumFieldLabeledValue: {
                    data: [{ sumFields: _ }, [me]],
                    description: {
                        "class": "SumFieldLabeledValue",
                    }
                }
            },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        changeSelection: {
                            to: [{ selectedSlice: _ }, [embedding]],
                            merge: [me],
                        }
                    }
                }
            },
            position: {
                // top, width, left defined                
                bottomConstraint: {
                    point1: { type: "bottom", element: [{ bottomElement: _ }, [me]] },
                    point2: { type: "bottom" },
                    equals: 5
                }
            }
        },
        {
            qualifier: { amISelected: true },
            "class": "SelectedSlice",
            display: {
                background: "#EE7D7D"
            },
        }
    ),

    SumFieldLabeledValue: o(
        {
            "class": "LabeledValue",
            context: {
                myParams: [{ param: { areaSetContent: _ } }, [me]],
                /*{ 
                    sumFieldPrimaryKey: "Economic Activity", [optional]
                    sumFieldName: "total_eligible_costs_selected_fin_data", 
                    sumFieldTitle: "Total Eligible Cost" 
                }*/

                sumFieldPrimaryKey: [{ sumFieldPrimaryKey: _ }, [{ myParams: _ }, [me]]],
                sumFieldName: [{ sumFieldName: _ }, [{ myParams: _ }, [me]]],

                totalSum: [sum,
                    [
                        [{ sumFieldQry: _ }, [me]],
                        [{ solutionSet: _ }, [embedding]]
                    ],
                ],

                // for LabeledValue
                textContent: [{ sumFieldTitle: _ }, [{ myParams: _ }, [me]]],
                valueContent: [{ totalSum: _ }, [me]],
                valueIsMonetary: true,
                prevElement: [first,
                    o(
                        [prev, [me]],
                        [{ children: { totalRowsLabeledValue: _ } }, [embedding]]
                    )
                ],
                topReferencePoint: { type: "bottom", element: [{ prevElement: _ }, [me]] },
 //           }
//        },
//        {
//            qualifier: { sumFieldPrimaryKey: false },
//            context: {
                sumFieldQry: [
                    [defun, "x", { "#x": _ }],
                    [{ sumFieldName: _ }, [me]]
                ]
            }
        }/*,
        {
            qualifier: { sumFieldPrimaryKey: true },
            context: {
                sumFieldQry: [
                    [defun, o("y", "x"), { "#y": { "#x": _ } }],
                    [{ sumFieldPrimaryKey: _ }, [me]],
                    [{ sumFieldName: _ }, [me]]
                ],
            }
        } */
    )

}
