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

// %%include%%: "../18_BasicClasses/reference.js"
// %%classfile%%: "../18_BasicClasses/generator.js"
// %%include%%: "../18_BasicClasses/events.js"
// %%classfile%%: "misc.js"
// %%classfile%%: "style.js"
// %%classfile%%: "../24_Histograms/multibar.js"
// %%classfile%%: "../24_Histograms/scale.js"
// %%classfile%%: "../24_Histograms/legend.js"
// %%classfile%%: "../19_SelectionChain/selectionChain.js"
// %%classfile%%: "../26_Menu/menus.js"
// %%classfile%%: "clipboard.js"
// %%classfile%%: "../18_BasicClasses/matrixLayout.js"
// %%classfile%%: "../18_BasicClasses/selectable.js"

initGlobalDefaults.sliceHeight = 36;
initGlobalDefaults.barAeaOffsetFromBottom = 4;
initGlobalDefaults.barAreaHeightRatio = 0.5;

var sliceHeight = [{sliceHeight: _}, [globalDefaults]]; // TODO: replace

var facetNameTable = o(
    {facetName: "ms", facetNameMultiple: "Countries"},
    {facetName: "to", facetNameMultiple: "Thematic Objectives"},
    {facetName: "fund", facetNameMultiple: "Funds"},
    {facetName: "intervention_field", facetNameMultiple: "Intervention Fields"},
    {facetName: "category_of_region", facetNameMultiple: "Region Types"}
);

var translateFacetNameToMultiple = [
    defun, "facetName", [
        replaceEmpty,
        [{ facetNameMultiple: _, facetName: "facetName" }, facetNameTable],
        "facetName"
    ]
]

var classes = {

    /// Defines the headerSeparator as attached to the widest header for top-
    /// level slices
    DefineHeaderSeparatorRightward: {
        headerSeparatorOr: {
            point1: { type: "right" },
            point2: { label: "headerSeparator", element: [myContext, "SliceViewer"] },
            equals: 0,
            orGroups: { label: "HSO", element: [myContext, "SliceViewer"] }
        },
        headerSeparatorMin: {
            point1: { type: "right" },
            point2: { label: "headerSeparator", element: [myContext, "SliceViewer"] },
            min: 0
        }
    },

    /// Attaches the sub-slice header's right to the headerSeparator, and
    /// assures a space of at least 40px to its left, and also adds itself to
    /// the or-group, so it should keep the sub-slice header's right aligned to
    /// headerSeparator while providing enough space for all headers.
    /// However, it doesn't let go, and creates havoc when a Slice name becomes
    /// very long.
    DefineHeaderSeparatorLeftward: {
        headerSeparatorEq: {
            point1: { type: "right" },
            point2: { label: "headerSeparator", element: [myContext, "SliceViewer"] },
            equals: 0
        }
        // headerSeparatorOr: {
        //     point1: { type: "right" },
        //     point2: { label: "headerSeparator", element: [myContext, "SliceViewer"] },
        //     equals: 0,
        //     orGroups: { label: "HSO", element: [myContext, "SliceViewer"] }
        // },
        // leftMin: {
        //     point1: { type: "left", element: [myContext, "SliceViewer"] },
        //     point2: { type: "left" },
        //     min: 40
        // }
    },

    SliceViewerContext: {
        context: {
            slices: mustBeDefined,
            selectedSliceIds: mustBeDefined,
            selectedSlices: [{ elementId: [{ selectedSliceIds: _ }, [me]] }, [{ slices: _ }, [me]]],
            allSliceAreas: o(
                [{ children: { allSliceList: { children: { items: { children: { baseSliceViz: _ } } } } } }, [me]],
                [{ children: { allSliceList: { children: { items: { children: { sliceList: { children: { items: _ } } } } } } } }, [me]]
            ),
            selectedSliceAreas: o(
                [{ children: { selectedList: { children: { items: { children: { baseSliceViz: _ } } } } } }, [me]], // newly added
                [{ children: { selectedList: { children: { items: { children: { sliceList: { children: { items: _ } } } } } } } }, [me]] // newly added                
            ),
            sliceVisualizers: o(
                [{ children: { selectedSliceVisualizer: _ } }, [me]],
                [{ children: { sliceVisualizer: _ } }, [me]]
            ),
            scaledGrid: [{ children: { scaledGrid: _ } }, [me]],
            scale: [{ children: { scale: _ } }, [{ scaledGrid: _ }, [me]]],
            maxValue: [
                max,
                [{ values: _ }, [{ sliceVisualizers: _ }, [me]]]
            ],
            legend: [{ children: { legend: _ } }, [me]],
            editView: [{ editView: _ }, [myContext, "App"]],
            showLoginScreen: [{ showLoginScreen: _ }, [myContext, "App"]],

            // this is where labels, fields and colors are specified
            "^colorSelected": "#fc0",
            "^colorPlanned": "#1f78b4",
            "^colorTotal": "#a6cde2",
            totalLabel: "total",
            labeledFieldsColors: o(
                { label: "total", field: "planned_total_amount_notional", color: [{ colorTotal: _ }, [me]] },
                { label: "planned", field: "planned_eu_amount", color: [{ colorPlanned: _ }, [me]] },
                { label: "selected", field: "total_eligible_costs_selected_fin_data", color: [{ colorSelected: _ }, [me]] }
            ),

            // multibar context:
            multibarType: "Embedded",
            valueVerticalMarginTop: 3,
            valueFontSize: 10,
            barAreaOffsetFromBottom: [{barAeaOffsetFromBottom: _}, [globalDefaults]],
            barAreaHeightRatio: [{barAreaHeightRatio: _}, [globalDefaults]],
            topGrid: false,
            topGridValues: false,
            bottomGrid: false,
            bottomGridValues: false,
        }
    },

    SliceViewer: o({
        "class": o("SliceViewerContext", "ScaleContext"),

        display: {
            background: "white"
        },

        children: {
            legend: {
                description: {
                    "class": "Legend",
                    context: {
                        firstSingleSliceVisualizer: [first, [areaOfClass, "SingleSliceVisualizer"]],
                        labeledColors: [{ labeledFieldsColors: _ }, [myContext, "SliceViewer"]],
                        colorPopUpOrientation: "top"
                    },
                    position: {
                        bottom: 2,
                        //height is autodetermined
                        horizontalCenteredWithFirstSingleSliceVisualizer: {
                            point1: { element: [{ firstSingleSliceVisualizer: _ }, [me]], type: "horizontal-center" },
                            point2: { type: "horizontal-center" },
                            equals: 0
                        }
                    }
                }
            },
            addSliceButton: {
                description: {
                    "class": o({
                        name: "ActionButton",
                        image: "design/img/ic_add_box_48px.svg",
                        message: { message: "Add", recipient: [myContext, "SliceViewer"] }
                    },
                        "DepressWhileMouseDown",
                        "ShowHelpToolTip"
                    ),
                    context: {
                        helpToolTipText: "Add a new slice; it will be shown in the list, so you can see different slices side by side.",
                        toolTipEdge: "top"
                    },
                    position: {
                        "class": { name: "BelowSiblings", sibling: "allSliceList", distance: 5 },
                        left: 5,
                        height: 32,
                        width: 32
                    }
                }
            },
            allSliceList: {
                description: {
                    "class": "BasicListInAreaWithScrollbar",
                    context: {
                        listData: [identify, { id: _ }, [{ slices: _ }, [embedding]]],
                        itemSpacing: 0,
                        minHeightZeroWithEmptyListData: false
                    },
                    children: {
                        items: {
                            description: {
                                "class": o("SliceListItem", "EditableSliceListItem", "Selectable"),
                                display: {
                                    borderColor: [{ dividerColor: _ }, [globalDefaults]],
                                    borderWidth: 3,
                                    borderTopStyle: "solid"
                                },
                                context: {
                                    baseSliceVizChild: [{ children: { baseSliceViz: _ } }, [me]],
                                    // Selectable params:
                                    elementId: [{ selectionId: _ }, [me]],
                                    selectedIds: [{ selectedSliceIds: _ }, [myContext, "SliceViewer"]]                                    
                                },
                                "children.selectableBox.description": {
                                    position: {
                                        top: 4,
                                        left: 4,
                                        width: 20,
                                        height: 20
                                    }
                                },
                                "children.header.description": {
                                    position: {
                                        left: 28
                                    }
                                }
                            }
                        }
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "allSliceList" },
                        top: 8,
                        left: 0,
                        right: 0
                    },
                    display: {
                        borderColor: "green",
                        borderWidth: 2,
                        borderStyle: "dashed"
                    }
                }
            },
            selectedList: {
                description: {
                    "class": "BasicListInAreaWithScrollbar",
                    context: {
                        selectedEditableSliceAreas: [
                            { selectionId: [{selectedSliceIds: _}, [myContext, "SliceViewer"]] },
                            [areaOfClass, "Slice"]
                        ],
                        listData: [{selectedEditableSliceAreas: _}, [me]],
                        itemSpacing: 0,
                        minHeightZeroWithEmptyListData: false
                    },
                    children: {
                        items: {
                            description: {
                                "class": "NonEditableSliceListItem",
                                context: {
                                    sliceSource: [{content: _}, [me]]
                                },
                                "children.sliceList.description": {
                                    "children.items.description": {
                                        context: {
                                            selections: [{selections: _}, [embedding, [embedding]]],
                                            selectionChain: [{selectionChain: _}, [embedding, [embedding]]]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    position: {
                        left: 0,
                        right: 0,
                        topAlignedWithAddSliceButton: {
                            point1: { element: [{ children: { addSliceButton: _ } }, [embedding]], type: "bottom" },
                            point2: { type: "top" },
                            equals: 5
                        },
                        bottomAlignedWithTopOfScale: {
                            point1: { type: "bottom" },
                            point2: { element: [{ scaledGrid: _ }, [myContext, "SliceViewer"]], type: "top" },
                            equals: 5
                        }
                    },
                    display: {
                        borderColor: "blue",
                        borderWidth: 2,
                        borderStyle: "dashed"
                    }
                }
            },
            scaledGrid: {
                description: {
                    "class": o("ScaledGrid"),
                    context: {
                        tickPosition: "bottom",
                        maxValue: [{ maxValue: _ }, [myContext, "SliceViewer"]]
                    },
                    "children.grid.description.context": {
                        showPrimaryGridLines: true,
                        showSecondaryGridLines: true,
                        showTertiaryGridLines: true
                    },
                    "children.scale.description.context": {
                        roundScaleMax: false
                    },
                    position: {
                        //"class": { name: "BelowSibling", sibling: "selectedList" },
                        "class": { name: "AboveSibling", sibling: "legend" },
                        left: {
                            point1: { label: "headerSeparator", element: [embedding] },
                            point2: { type: "left" },
                            equals: 0
                        },
                        right: 30,
                        height: 25 // use 0 to hide global scale
                        //bottom: 0
                    }
                }
            },
            selectedSliceVisualizer: {
                description: {
                    "class": "SliceVisualizer",
                    context: {
                        slices: [{ selectedSliceAreas: _ }, [myContext, "SliceViewer"]]
                    },
                    position: {
                        // Overlay with the slice list, so that areas in SliceVisualizer
                        // are clipped; leave a bit of room for the icons
                        "class": o(
                            { name: "AlignTopWithSibling", sibling: "selectedList" },
                            { name: "AlignLeftWithSibling", sibling: "selectedList" },
                            { name: "AlignBottomWithSibling", sibling: "selectedList" },
                            { name: "AlignRightWithSibling", sibling: "selectedList", distance: -25 }
                        )
                    },
                    stacking: {
                        aboveSlices: {
                            lower: [me],
                            higher: o(
                                [{ children: { allSliceList: _ } }, [embedding]],
                                [{ children: { selectedList: _ } }, [embedding]]
                            )
                        }
                    }
                }
            }
        },

        position: {
            // // Defines vertical separator between header and visualization areas
            // headerSeparator: {
            //     point1: { type: "left" },
            //     point2: { label: "headerSeparator" },
            //     equals: 150
            // },
            bottom: 2
        },

        write: {
            onAddSlice: {
                upon: [{ message: "Add" }, [myMessage]],
                true: {
                    "class": "IncrementNextId",
                    addSlice: {
                        to: [{ slices: _ }, [me]],
                        merge: push({
                            id: [{ nextId: _ }, [myContext, "App"]],
                            name: "Unnamed Slice",
                            selections: o(),
                            visible: true
                        })
                    },
                    editSlice: {
                        to: [{ editedSliceId: _ }, [myContext, "App"]],
                        merge: [{ nextId: _ }, [myContext, "App"]]
                    }
                }
            },
            onRemoveSlice: {
                upon: [{ message: "Remove" }, [myMessage]],
                true: {
                    removeSlice: {
                        to: [{ slices: _ }, [me]],
                        merge: [
                            n({ id: [{ id: _ }, [myMessage]] }),
                            [{ slices: _ }, [me]]
                        ]
                    }
                }
            }
        }
    }, {
        qualifier: {editView: false},
        children: {
            allSliceList: {
                description: {
                    context: {
                        hasScrollBar: false
                    },
                    position: {
                        height: 0
                    }
                }
            }
        }
    }, {
        qualifier: {editView: true},
        children: {
            allSliceList: {
                description: {
                    position: {
                        bottomAlignedWithVerticalCenterOfEmbedding: {
                            point1: { type: "bottom" },
                            point2: { element: [embedding], type: "vertical-center" },
                            equals: 10
                        }
                    }
                }
            },
            sliceVisualizer: {
                description: {
                    "class": "SliceVisualizer",
                    context: {
                        slices: [{ allSliceAreas: _ }, [myContext, "SliceViewer"]]
                    },
                    position: {
                        // Overlay with the slice list, so that areas in SliceVisualizer
                        // are clipped; leave a bit of room for the icons
                        "class": o(
                            { name: "AlignTopWithSibling", sibling: "allSliceList" },
                            { name: "AlignLeftWithSibling", sibling: "allSliceList" },
                            { name: "AlignBottomWithSibling", sibling: "allSliceList" },
                            { name: "AlignRightWithSibling", sibling: "allSliceList", distance: -25 }
                        )
                    },
                    stacking: {
                        aboveSlices: {
                            lower: [me],
                            higher: o(
                                [{ children: { allSliceList: _ } }, [embedding]],
                                [{ children: { selectedList: _ } }, [embedding]]
                            )
                        }
                    }
                }
            }
        }
    }),

    SliceVisualizerContext: {
        context: {
            slices: mustBeDefined,
            values: [
                { labeledValues: { value: _ } },
                [{ children: { sliceVisualizationArea: _ } }, [me]]
            ]
        }
    },

    SliceVisualizer: {
        "class": "SliceVisualizerContext",
        children: {
            sliceVisualizationArea: {
                data: [identify, _, [{ slices: _ }, [me]]],
                description: {
                    "class": "SingleSliceVisualizer"
                }
            }
        }
    },

    SingleSliceVisualizer: o(
        {
            "class": o("Multibar", "SliceAggregates"),
            content: [{ param: { areaSetContent: _ } }, [me]],
            context: {
                //contentSelectionQry: [defun, "x", [{ content: { "#x": _ } }, [me]]], 
                type: [{ multibarType: _ }, [myContext, "SliceViewer"]],
                totalLabel: [{ totalLabel: _ }, [myContext, "SliceViewer"]],
                labeledFieldsColors: [{ labeledFieldsColors: _ }, [myContext, "SliceViewer"]],
                selectionChain: [{ selectionChain: _ }, [{ content: _ }, [me]]],
                scale: [{ scale: _ }, [myContext, "SliceViewer"]],
                legend: [{ legend: _ }, [myContext, "SliceViewer"]],
                topGrid: [{ topGrid: _ }, [myContext, "SliceViewer"]],
                topGridValues: [{ topGridValues: _ }, [myContext, "SliceViewer"]],
                bottomGrid: [{ bottomGrid: _ }, [myContext, "SliceViewer"]],
                bottomGridValues: [{ bottomGridValues: _ }, [myContext, "SliceViewer"]],
                valueVerticalMarginTop: [{ valueVerticalMarginTop: _ }, [myContext, "SliceViewer"]],
                valueFontSize: [{ valueFontSize: _ }, [myContext, "SliceViewer"]],
                barAreaOffsetFromBottom: [{ barAreaOffsetFromBottom: _ }, [myContext, "SliceViewer"]],
                barAreaHeightRatio: [{ barAreaHeightRatio: _ }, [myContext, "SliceViewer"]],
                valueDisplayType: [{ valueDisplayType: _ }, [myContext, "App"]]
            },
            position: {
                top: {
                    point1: { label: "vizTop", element: [{ content: _ }, [me]] },
                    point2: { type: "top" },
                    equals: 0
                },
                left: {
                    point1: { label: "vizLeft", element: [{ content: _ }, [me]] },
                    point2: { type: "left" },
                    equals: 0
                },
                bottom: {
                    point1: { label: "vizBottom", element: [{ content: _ }, [me]] },
                    point2: { type: "bottom" },
                    equals: 0
                },
                right: {
                    point1: { label: "vizRight", element: [{ content: _ }, [me]] },
                    point2: { type: "right" },
                    equals: 0
                }
            }
        }
    ),

    SliceAggregates: o(
        {
            context: {
                contextSelectionQry: [defun, "x", [{ "#x": _ }, [me]]],
                flatData: [{ flatData: _ }, [myContext, "Data"]],
                selectionChain: mustBeDefined,
                valueDisplayType: mustBeDefined,

                climateChangeWeighting: [{climateChangeWeighting: _}, [myContext, "App"]],
                climateChangeWeights: [_,
                    [
                        {"Climate_weighting_(%)": _},
                        [{crossCuttingThemes: _}, [myContext, "Data"]]
                    ]
                ],

                facetDataSumFunc: [
                    cond, [{climateChangeWeighting: _}, [me]],o({
                        on: false,
                        use: [
                            defun, "facetName",
                            [sum,
                                [
                                    [{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                                    "facetName",
                                    [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]]
                                ]
                            ]
                        ]
                    }, {
                        on: true,
                        use: [
                            defun, "facetName",
                            [
                                sum,
                                [
                                    map,
                                    [
                                        defun, "weight",
                                        [
                                            mul,
                                            "weight",
                                            [
                                                sum,
                                                [
                                                    [{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                                                    "facetName",
                                                    [
                                                        {
                                                            dimension_type: "InterventionField",
                                                            dimension_code: [
                                                                {
                                                                    "Climate_weighting_(%)": "weight",
                                                                    Intervention_field_Code: _
                                                                },
                                                                [{crossCuttingThemes: _}, [myContext, "Data"]]
                                                            ]
                                                        },
                                                        [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]]
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ],
                                    [{climateChangeWeights: _}, [me]]
                                ]
                            ]
                        ]
                    })
                ]
            }
        },
        {
            qualifier: { flatData: false },
            context: {
                //projectOnSubFacet ?
                totalAbsValue: [sum,
                    [
                        [mkSel, [{ selectedPrimaryKey: _ }, [me]], { planned_total_amount_notional: _ }],
                        [{ selectedData: _ }, [me]]
                    ]
                ],
                plannedAbsValue: [sum,
                    [
                        [mkSel, [{ selectedPrimaryKey: _ }, [me]], { planned_eu_amount: _ }],
                        [{ selectedData: _ }, [me]]
                    ]
                ],
                selectedAbsValue: [sum,
                    [
                        [mkSel, [{ selectedPrimaryKey: _ }, [me]], { total_eligible_costs_selected_fin_data: _ }],
                        [{ selectedData: _ }, [me]]
                    ]
                ]
            }
        },
        {
            qualifier: { flatData: true },
            context: {
                labeledAbsValues: [map,
                    [defun,
                        "labelFieldItem",
                        {
                            label: [{ label: _ }, "labelFieldItem"],
                            value: [[{ facetDataSumFunc: _ }, [me]], [{ field: _ }, "labelFieldItem"]]
                        }
                    ],
                    [{ labeledFieldsColors: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { valueDisplayType: "absolute" },
            context: {
                labeledValues: [{ labeledAbsValues: _ }, [me]]
            }
        },
        {
            qualifier: { valueDisplayType: "percentage" },
            context: {
                makePercentage: [defun,
                    "label",
                    [mul,
                        100,
                        [div,
                            [{ labeledAbsValues: { label: "label", value: _ } }, [me]],
                            [{ labeledAbsValues: { label: [{ totalLabel: _ }, [me]], value: _ } }, [me]]
                        ]
                    ]
                ],

                labeledValues: [map,
                    [defun,
                        "label",
                        {
                            label: "label",
                            value: [[{ makePercentage: _ }, [me]], "label"]
                        }
                    ],
                    [{ label: _ }, [{ labeledFieldsColors: _ }, [me]]]
                ]
            }
        }
    ),

    SliceContext: {
        context: {
            selections: mustBeDefined,
            selectedPrimaryKey: "InterventionField", // [{selectedPrimaryKey: _}, [embedding]]
            solutionSet: [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]],
            selectedData: [{ solutionSet: _ }, [me]],
            valueDisplayType: [{ valueDisplayType: _ }, [myContext, "App"]],
            name: [{ sliceContent: { name: _ } }, [me]],
            id: [{ sliceContent: { id: _ } }, [me]],
            visible: [{ content: { visible: _ } }, [me]],
            isBeingEdited: [equal,
                [{ id: _ }, [me]],
                [{ editedSliceId: _ }, [myContext, "App"]]
            ]
        }
    },

    Slice: {
        "class": o("SliceContext"),
        context: {
            selectionChain: mustBeDefined
        }
    },

    /// Contains the selection chain
    SliceSource: {
        "class": "Slice",
        context: {
            selectionChain: [{ children: { selectionChain: _ } }, [me]],
            selectionId: {
                id: [{id: _}, [me]],
                group: false,
                label: false
            }
        },
        children: {
            selectionChain: {
                description: {
                    "class": "TopLevelSelectionChain",
                    context: {
                        selectedValues: [{ selections: _ }, [embedding]]
                    }
                }
            }
        }
    },

    /// A slice that contains another slice's selection chain
    SliceClone: {
        "class": "Slice"
    },

    /// Set positions for visualization area
    SliceVizContainerPosition: {
        position: {
            vizTop: {
                point1: { type: "top", content: true },
                point2: { label: "vizTop" },
                equals: 0
            },
            vizLeft: {
                point1: { label: "headerSeparator", element: [myContext, "SliceViewer"] },
                point2: { label: "vizLeft" },
                equals: 1
            },
            vizBottom: {
                point1: { label: "vizBottom" },
                point2: { type: "bottom", content: true },
                equals: 0
            },
            vizRight: {
                point1: { label: "vizRight" },
                point2: { type: "right", content: true },
                equals: 0
            }
        }
    },

    SliceListItemContext: o({
        context: {
            hover: [{ param: { pointerInArea: _ } }, [me]],
            hoverOrIsBeingEdited: [or, [{ hover: _ }, [me]], [{ isBeingEdited: _ }, [me]]],
            selections: [{ content: { selections: _ } }, [me]],
            sliceSplit: [{ content: { splitBy: _ } }, [me]]
        }
    }),

    SliceListItem: o({
        "class": o("SliceListItemContext", "SliceSource", "GuaranteeImmediateVisibility"),

        context: {
            immediateVisibilityWrtElement: [embedding, [embedding]]
        },

        children: {
            header: {
                description: {
                    "class": o("SliceHeader", "ShowHelpToolTip"),
                    context: {
                        name: [{ name: _ }, [embedding]],
                        helpToolTipTitle: "Slices",
                        helpToolTipText: o("A slice is the part of the data that matches the selection criteria. You can change the criteria or the name by clicking on the little pencil."),
                        extHelpToolTipSrc: "helpTexts/general.html",
                        toolTipEdge: "right"
                    },
                    position: {
                        "class": "DefineHeaderSeparatorRightward",
                        top: 0,
                        left: 0,
                        height: 28,
                        width: [displayWidth] // Allow wide names; bar area is z-higher
                    }
                }
            },
            // countBadge: {
            //     description: {
            //         "class": o("Badge", "ItemCountToolTip"),
            //         context: {
            //             value: [size, [{ solutionSet: _ }, [myContext, "Slice"]]]
            //         },
            //         position: {
            //             "class": o(
            //                 { name: "RightOfSibling", sibling: "header", distance: 5 },
            //                 "DefineHeaderSeparatorRightward"
            //             ),
            //             top: 0,
            //             height: 28,
            //             width: 40
            //         }
            //     }
            // },
            sliceList: {
                description: {
                    "class": "BasicListInArea",
                    context: {
                        listData: [{ sliceSplit: _ }, [embedding]]
                    },
                    children: {
                        items: {
                            description: {
                                position: {
                                    left: o()
                                }
                            }
                        }
                    },
                    position: {
                        left: 40,
                        right: 16,
                        bottomAlignWithList: {
                            qualifier: { listData: true },
                            point1: { type: "bottom", element: [last, [{ children: { items: _ } }, [me]]] },
                            point2: { type: "bottom" },
                            equals: 0
                        },
                        bottomAlignWithTop: {
                            qualifier: { listData: false },
                            point1: { type: "top" },
                            point2: { type: "bottom" },
                            equals: 0
                        }
                    }
                }
            }
        },

        position: {
            minSpaceForList: {
                point1: { type: "bottom", element: [{ children: { sliceList: _ } }, [me]] },
                point2: { type: "bottom" },
                min: 2
            },
            minHeight: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                min: 50
            },
            orAttachBottomToList: {
                point1: { type: "bottom", element: [{ children: { sliceList: _ } }, [me]] },
                point2: { type: "bottom" },
                equals: 2,
                orGroups: { label: "sliceHeight", element: [me] },
                priority: -1
            },
            orHeightWhenEmpty: {
                point1: { type: "top" },
                point2: { type: "bottom" },
                equals: 50,
                orGroups: { label: "sliceHeight", element: [me] },
                priority: -1
            }
        },

        write: {
            onRemoveSlice: {
                upon: [{ message: "Remove" }, [myMessage]],
                true: {
                    removeSlice: {
                        to: [{ sliceSplit: _ }, [me]],
                        merge: [
                            n([{ splitId: _, id: _ }, [myMessage]]),
                            [{ sliceSplit: _ }, [me]]
                        ]
                    }
                }
            }
        }
    }, {
        qualifier: { visible: true },
        children: {
            baseSliceViz: {
                description: {
                    "class": o("SliceVizContainerPosition"),
                    context: {
                        selectionChain: [{ selectionChain: _ }, [embedding]]
                    },
                    position: {
                        "class": { name: "RightOfLabel", label: "headerSeparator", element: [myContext, "SliceViewer"] },
                        top: 0,
                        right: 16,
                        height: sliceHeight
                    }
                }
            },
            sliceList: {
                description: {
                    position: {
                        "class": { name: "BelowSibling", sibling: "baseSliceViz" }
                    }
                }
            }
        },
        position: {
            "heightWhenEmpty.equals": 50,
            "minHeight.min": 50
        }
    }, {
        qualifier: { visible: false },
        "children.sliceList.description": {
            position: {
                top: 32
            }
        },
        position: {
            "heightWhenEmpty.equals": 32,
            "minHeight.min": 32
        }
    }),

    NonEditableSliceListItem: o({
        "class": o("SliceListItem"),

        context: {
            visible: true,
            isBeingEdited: false,
            name: [{sliceSource: {name: _}}, [me]],
            selections: [{sliceSource: {selections: _}}, [me]],
            selectionChain: [{sliceSource: {selectionChain: _}}, [me]]
        },
        "children.sliceList.description": {
            "children.items.description": {
                "class": "NonEditableSubSlice"
            }
        },
        "children.header.description": {
            context: {
                editMode: false,
                indicateEditability: false
            }
        }
    }),

    EditableSliceListItem: o({
        "class": o("SliceListItem"),

        context: {
            sliceContent: [{content: _}, [me]]
        },
        "children.sliceList.description": {
            "children.items.description": {
                "class": "EditableSubSlice"
            }
        },
        write: {
            onRemoveSlice: {
                upon: [{ message: "Remove" }, [myMessage]],
                true: {
                    removeSlice: {
                        to: [{ sliceSplit: _ }, [me]],
                        merge: [
                            n([{ splitId: _, id: _ }, [myMessage]]),
                            [{ sliceSplit: _ }, [me]]
                        ]
                    }
                }
            }
        }
    }, {
        qualifier: { hoverOrIsBeingEdited: true },
        "children.sliceButtons.description": {
            children: {
                editButton: {
                    description: {
                        "class": o("EditButton", "SelectSliceForEditing", "DepressWhileMouseDown"),
                        context: {
                            isBeingEdited: [{ isBeingEdited: _ }, [myContext, "Slice"]]
                        },
                        "display.hoverText": "Change selection of this slice",
                        position: {
                            top: 0,
                            left: 2,
                            height: 16,
                            width: 16
                        }
                    }
                }
            },
            stacking: {
                aboveHeader: {
                    lower: o([embedding], [{ children: { sliceVisualizer: _ } }, [myContext, "SliceViewer"]]),
                    higher: [me]
                }
            },
            position: {
                height: 16,
                width: 160
            }
        }
    }, {
        qualifier: { hoverOrIsBeingEdited: true, visible: true },
        "children.sliceButtons.description": {
            position: {
                "class": { name: "BelowSibling", sibling: "header" },
                left: 0
            }
        }
    }, {
        qualifier: { hoverOrIsBeingEdited: true, visible: false },
        "children.sliceButtons.description": {
            position: {
                "class": { name: "RightOfSibling", sibling: "header" },
                top: 6
            }
        }
    }, {
        qualifier: { hover: true },
        "children.sliceButtons.description": {
            children: {
                deleteButton: {
                    description: {
                        "class": o({
                            name: "ActionButton",
                            image: "design/img/ic_delete_forever_48px.svg",
                            message: {
                                message: "Remove",
                                id: [{ id: _ }, [myContext, "SliceListItem"]],
                                recipient: [myContext, "SliceViewer"]
                            }
                        },
                            "DepressWhileMouseDown"
                        ),
                        "display.hoverText": "Remove this slice",
                        position: {
                            top: 0,
                            left: 22,
                            height: 16,
                            width: 16
                        }
                    }
                },
                addButton: {
                    description: {
                        "class": o(
                            "AreaWithPopUpAlignedToSide",
                            "DepressWhileMouseDown",
                            { name: "FlipButton", value: [{ showPopUp: _ }, [me]] }
                        ),
                        context: {
                            popUpOrientation: "right",
                            partnerArea: [myContext, "App"]
                        },
                        "children.popup.description": {
                            "children.body.description": {
                                "class": "AddSplitSliceMenu"
                            }
                        },
                        display: {
                            image: {
                                src: "design/img/ic_playlist_add_48px.svg",
                                size: "100%"
                            },
                            hoverText: "Add one or more refinement slices"
                        },
                        position: {
                            top: 0,
                            left: 42,
                            height: 16,
                            width: 16
                        }
                    }
                },
                removeButton: {
                    description: {
                        "class": o(
                            "AreaWithPopUpAlignedToSide",
                            "DepressWhileMouseDown",
                            { name: "FlipButton", value: [{ showPopUp: _ }, [me]] }
                        ),
                        context: {
                            popUpOrientation: "right",
                            partnerArea: [myContext, "App"]
                        },
                        "children.popup.description": {
                            "children.body.description": {
                                "class": "RemoveSplitSliceMenu"
                            }
                        },
                        display: {
                            image: {
                                src: "design/img/ic_playlist_remove.svg",
                                size: "100%"
                            },
                            hoverText: "Remove one or more refinement slices"
                        },
                        position: {
                            top: 0,
                            left: 62,
                            height: 16,
                            width: 16
                        }
                    }
                },
                showSlicesButton: {
                    description: {
                        "class": o(
                            "DepressWhileMouseDown",
                            { name: "FlipButton", value: [{ showSlice: _ }, [me]] }
                        ),
                        context: {
                            showSlice: [{ visible: _ }, [myContext, "Slice"]]
                        },
                        display: {
                            image: {
                                src: [cond, [{ showSlice: _ }, [me]], o(
                                    { on: false, use: "design/img/ic_disabled_eye.svg" },
                                    { on: true, use: "design/img/ic_remove_red_eye_48px.svg" }
                                )],
                                size: "100%"
                            },
                            hoverText: "Show/hide slices"
                        },
                        position: {
                            top: 0,
                            left: 82,
                            height: 16,
                            width: 16
                        }
                    }
                },
                infoButton: {
                    description: {
                        "class": o(
                            "AreaWithPopUpAlignedToSide",
                            "DepressWhileMouseDown",
                            { name: "FlipButton", value: [{ showPopUp: _ }, [me]] }
                        ),
                        context: {
                            popUpOrientation: "right",
                            partnerArea: [myContext, "App"],
                            selections: [{ selections: _ }, [myContext, "Slice"]]
                        },
                        "children.popup.description": {
                            "children.body.description": {
                                "class": "SliceSearchSummary",
                                context: {
                                    selections: [{ selections: _ }, [expressionOf, [embedding]]]
                                }
                            }
                        },
                        display: {
                            image: {
                                src: "design/img/ic_info_48px.svg",
                                size: "100%"
                            }
                        },
                        position: {
                            top: 0,
                            left: 102,
                            height: 16,
                            width: 16
                        }
                    }
                },
                copyButton: {
                    description: {
                        "class": "CopySelectionsButton",
                        position: {
                            top: 0,
                            left: 122,
                            height: 16,
                            width: 16
                        }
                    }
                },
                pasteButton: {
                    description: {
                        "class": "PasteSelectionsButton",
                        position: {
                            top: 0,
                            left: 142,
                            height: 16,
                            width: 16
                        }
                    }
                }
            }
        }
    }),

    CopySelectionsButton: {
        "class": "ClipboardAccess",
        display: {
            image: {
                src: "design/img/ic_content_copy_48px.svg",
                size: "100%"
            },
            hoverText: "copy slice definition to clipboard"
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    copySelectionsToClipboard: {
                        to: [{ clipboard: _ }, [me]],
                        merge: {
                            type: "selections",
                            value: [
                                { selected: true },
                                [{ selections: _ }, [myContext, "Slice"]]
                            ]
                        }
                    }
                }
            }
        }
    },

    PasteSelectionsButton: o({
        "class": "ClipboardAccess",
        context: {
            hasSelections: [{ clipboard: { type: "selections" } }, [me]]
        },
        display: {
            image: {
                src: "design/img/ic_content_paste_48px.svg",
                size: "100%"
            },
            hoverText: "paste slice definition from clipboard"
        }
    }, {
            qualifier: { hasSelections: false },
            display: {
                opacity: 0.5,
                hoverText: "can't paste; no slice definition on clipboard"
            }
        }, {
            qualifier: { hasSelections: true },
            write: {
                onClick: {
                    upon: myClick,
                    true: {
                        copySelectionsToClipboard: {
                            to: [{ selections: _ }, [myContext, "Slice"]],
                            merge: [{ clipboard: { type: "selections", value: _ } }, [me]]
                        }
                    }
                }
            }
        }),

    ItemCountToolTip: {
        "class": "ShowHelpToolTip",
        context: {
            helpToolTipTitle: "About the numbers",
            helpToolTipText: "This shows the number of rows in the table that make up this selection for the selected dimension; it's an indication of the selection size; the statistics shown are the sum over all these items",
            toolTipEdge: "right"
        }
    },

    SubSliceContext: {
        context: {
            splitId: [{ content: { splitId: _ } }, [me]],
            id: {
                id: [{id: _}, [myContext, "SliceListItem"]],
                group: [{ content: { splitId: _ } }, [me]],
                label: [{ content: { id: _ } }, [me]]
            },
            isUserDefined: [equal, "User defined", [{ splitId: _ }, [me]]]
        }
    },

    SubSlice: o({
        "class": o(
            "SubSliceContext", "SliceVizContainerPosition",
            "GuaranteeImmediateVisibility", "Selectable"
        ),
        context: {
            selections: [{ content: { selections: _ } }, [me]],
            hover: [{ param: { pointerInArea: _ } }, [me]],
            hoverOrIsBeingEdited: [or, [{ hover: _ }, [me]], [{ isBeingEdited: _ }, [me]]],
            "*immediateVisibility": [{ isUserDefined: _ }, [me]],
            immediateVisibilityWrtElement: [embedding, [embedding, [embedding]]],
            // Selectable params:
            elementId: [{ selectionId: _ }, [me]],
            selectedIds: [{ selectedSliceIds: _ }, [myContext, "SliceViewer"]]
        },
        position: {
            vizTop: {
                equals: 0
            },
            height: sliceHeight
        },
        display: {
            pointerOpaque: true
        },
        propagatePointerInArea: o(),
        children: {
            "selectableBox.description": {
                position: {
                    top: 4,
                    left: 4,
                    width: 15,
                    height: 15
                }
            },
            header: {
                description: {
                    display: {
                        text: {
                            "class": "Font",
                            fontSize: 13,
                            fontWeight: 100,
                            textAlign: "left",
                            verticalAlign: "top",
                            value: [{ content: { name: _ } }, [embedding]]
                        }
                    },
                    position: {
                        "class": "DefineHeaderSeparatorLeftward",
                        bottom: 17,
                        height: 18,
                        width: [displayWidth]
                    }
                }
            },
            // countBadge: {
            //     description: {
            //         "class": o("Badge", "ItemCountToolTip"),
            //         context: {
            //             value: [size, [{ solutionSet: _ }, [myContext, "Slice"]]],
            //             align: o("left", "right")
            //         },
            //         position: {
            //             "class": "DefineHeaderSeparatorLeftward",
            //             bottom: 1,
            //             height: 16
            //         }
            //     }
            // },
            selectionChain: {
                description: {
                    context: {
                        inputData: [{ solutionSet: _ }, [embedding, [embedding, [embedding]]]]
                    }
                }
            }
        }
    }, {
        qualifier: { isUserDefined: true },
        "children.header.description": {
            "display.text.value": [{ content: { name: _ } }, [embedding]]
        }
    }, {
        qualifier: { hoverOrIsBeingEdited: true },
        "children.sliceButtons.description": {
            position: {
                "class": o(
                    { name: "RightOfSibling", sibling: "header" },
                    { name: "AlignTopWithSibling", sibling: "header" }
                ),
                width: 16,
                height: 34
            }
        }
    }, {
        qualifier: { isUserDefined: true, hoverOrIsBeingEdited: true },
        "children.sliceButtons.description": {
            "children.editButton.description": {
                "class": o("EditButton", "SelectSliceForEditing", "DepressWhileMouseDown"),
                context: {
                    isBeingEdited: [{ isBeingEdited: _ }, [myContext, "Slice"]]
                },
                "display.hoverText": "Edit this sub-slice",
                position: {
                    top: 18,
                    left: 0,
                    height: 16,
                    width: 16
                }
            }
        }
    }, {
        qualifier: { hover: true },
        "children.sliceButtons.description": {
            children: {
                deleteButton: {
                    description: {
                        "class": o(
                            {
                                name: "ActionButton",
                                image: "design/img/ic_delete_forever_48px.svg",
                                message: {
                                    message: "Remove",
                                    splitId: [{ splitId: _ }, [myContext, "SubSlice"]],
                                    id: [{ id: _ }, [myContext, "Slice"]],
                                    recipient: [myContext, "SliceListItem"]
                                }
                            },
                            "DepressWhileMouseDown"
                        ),
                        "display.hoverText": "Remove this sub-slice",
                        position: {
                            top: 0,
                            left: 0,
                            height: 16,
                            width: 16
                        }
                    }
                }
            }
        }
    }),

    NonEditableSubSlice: {
        "class": o("SubSlice", "SliceClone")
    },

    EditableSubSlice: {
        "class": o("SubSlice", "SliceSource"),
        context: {
            sliceContent: [{content: _}, [me]]
        }
    },

    AddSplitSliceMenu: {
        "class": "TextChoiceMenu",
        context: {
            listData: o(
                {
                    name: "User defined",
                    slices: o({
                        name: "User defined",
                        splitId: "User defined",
                        id: [{ nextId: _ }, [myContext, "NextId"]],
                        selections: o(),
                        visible: true
                    })
                },
                {
                    name: "All countries",
                    slices: o(
                        { name: "Austria", splitId: "Country", id: "AT", selections: { facetName: "ms", "value": "AT", "selected": true }, visible: true },
                        { name: "Belgium", splitId: "Country", id: "BE", selections: { facetName: "ms", "value": "BE", "selected": true }, visible: true },
                        { name: "Bulgaria", splitId: "Country", id: "BG", selections: { facetName: "ms", "value": "BG", "selected": true }, visible: true },
                        { name: "Cyprus", splitId: "Country", id: "CY", selections: { facetName: "ms", "value": "CY", "selected": true }, visible: true },
                        { name: "Czech Republic", splitId: "Country", id: "CZ", selections: { facetName: "ms", "value": "CZ", "selected": true }, visible: true },
                        { name: "Germany", splitId: "Country", id: "DE", selections: { facetName: "ms", "value": "DE", "selected": true }, visible: true },
                        { name: "Denmark", splitId: "Country", id: "DK", selections: { facetName: "ms", "value": "DK", "selected": true }, visible: true },
                        { name: "Estonia", splitId: "Country", id: "EE", selections: { facetName: "ms", "value": "EE", "selected": true }, visible: true },
                        { name: "Greece", splitId: "Country", id: "GR", selections: { facetName: "ms", "value": "GR", "selected": true }, visible: true },
                        { name: "Spain", splitId: "Country", id: "ES", selections: { facetName: "ms", "value": "ES", "selected": true }, visible: true },
                        { name: "Finland", splitId: "Country", id: "FI", selections: { facetName: "ms", "value": "FI", "selected": true }, visible: true },
                        { name: "France", splitId: "Country", id: "FR", selections: { facetName: "ms", "value": "FR", "selected": true }, visible: true },
                        { name: "Croatia", splitId: "Country", id: "HR", selections: { facetName: "ms", "value": "HR", "selected": true }, visible: true },
                        { name: "Hungary", splitId: "Country", id: "HU", selections: { facetName: "ms", "value": "HU", "selected": true }, visible: true },
                        { name: "Ireland", splitId: "Country", id: "IE", selections: { facetName: "ms", "value": "IE", "selected": true }, visible: true },
                        { name: "Italy", splitId: "Country", id: "IT", selections: { facetName: "ms", "value": "IT", "selected": true }, visible: true },
                        { name: "Lithuania", splitId: "Country", id: "LT", selections: { facetName: "ms", "value": "LT", "selected": true }, visible: true },
                        { name: "Luxembourg", splitId: "Country", id: "LU", selections: { facetName: "ms", "value": "LU", "selected": true }, visible: true },
                        { name: "Latvia", splitId: "Country", id: "LV", selections: { facetName: "ms", "value": "LV", "selected": true }, visible: true },
                        { name: "Malta", splitId: "Country", id: "MT", selections: { facetName: "ms", "value": "MT", "selected": true }, visible: true },
                        { name: "Netherlands", splitId: "Country", id: "NL", selections: { facetName: "ms", "value": "NL", "selected": true }, visible: true },
                        { name: "Poland", splitId: "Country", id: "PL", selections: { facetName: "ms", "value": "PL", "selected": true }, visible: true },
                        { name: "Portugal", splitId: "Country", id: "PT", selections: { facetName: "ms", "value": "PT", "selected": true }, visible: true },
                        { name: "Romania", splitId: "Country", id: "RO", selections: { facetName: "ms", "value": "RO", "selected": true }, visible: true },
                        { name: "Sweden", splitId: "Country", id: "SE", selections: { facetName: "ms", "value": "SE", "selected": true }, visible: true },
                        { name: "Slovenia", splitId: "Country", id: "SI", selections: { facetName: "ms", "value": "SI", "selected": true }, visible: true },
                        { name: "Slovakia", splitId: "Country", id: "SK", selections: { facetName: "ms", "value": "SK", "selected": true }, visible: true },
                        { name: "United Kingdom", splitId: "Country", id: "UK", selections: { facetName: "ms", "value": "UK", "selected": true }, visible: true },
                        { name: "TC", splitId: "Country", id: "TC", selections: { facetName: "ms", "value": "TC", "selected": true }, visible: true }
                    )
                },
                {
                    name: "All funds",
                    slices: o(
                        { name: "CF", splitId: "Fund", id: "CF", selections: { facetName: "fund", value: "CF", selected: true }, visible: true },
                        { name: "ERDF", splitId: "Fund", id: "ERDF", selections: { facetName: "fund", value: "ERDF", selected: true }, visible: true },
                        { name: "ESF", splitId: "Fund", id: "ESF", selections: { facetName: "fund", value: "ESF", selected: true }, visible: true },
                        { name: "IPAE", splitId: "Fund", id: "IPAE", selections: { facetName: "fund", value: "IPAE", selected: true }, visible: true },
                        { name: "YEI", splitId: "Fund", id: "YEI", selections: { facetName: "fund", value: "YEI", selected: true }, visible: true }
                    )
                },
                {
                    name: "All region types",
                    slices: o(
                        { name: "Less developed", splitId: "Region type", id: "rt0", selections: { facetName: "category_of_region", value: "Less developed", selected: true }, visible: true },
                        { name: "More developed", splitId: "Region type", id: "rt1", selections: { facetName: "category_of_region", value: "More developed", selected: true }, visible: true },
                        { name: "Outermost …", splitId: "Region type", id: "rt2", selections: { facetName: "category_of_region", value: "Outermost or Northern Sparsely Populated", selected: true }, visible: true },
                        { name: "Transition", splitId: "Region type", id: "rt3", selections: { facetName: "category_of_region", value: "Transition", selected: true }, visible: true },
                        { name: "VOID", splitId: "Region type", id: "rt4", selections: { facetName: "category_of_region", value: "VOID", selected: true }, visible: true }
                    )
                },
                {
                    name: "All thematic objectives",
                    slices: o(
                        { name: "Research & Innovation", splitId: "Thematic objective", id: "to0", selections: { facetName: "to", value: 1, selected: true }, visible: true },
                        { name: "Information & Communication Technologies", splitId: "Thematic objective", id: "to1", selections: { facetName: "to", value: 2, selected: true }, visible: true },
                        { name: "Competitiveness of SMEs", splitId: "Thematic objective", id: "to2", selections: { facetName: "to", value: 3, selected: true }, visible: true },
                        { name: "Low-Carbon Economy", splitId: "Thematic objective", id: "to3", selections: { facetName: "to", value: 4, selected: true }, visible: true },
                        { name: "Climate Change Adaptation & Risk Prevention", splitId: "Thematic objective", id: "to4", selections: { facetName: "to", value: 5, selected: true }, visible: true },
                        { name: "Environment Protection & Resource Efficiency", splitId: "Thematic objective", id: "to5", selections: { facetName: "to", value: 6, selected: true }, visible: true },
                        { name: "Network Infrastructures in Transport and Energy", splitId: "Thematic objective", id: "to6", selections: { facetName: "to", value: 7, selected: true }, visible: true },
                        { name: "Sustainable & Quality Employment", splitId: "Thematic objective", id: "to7", selections: { facetName: "to", value: 8, selected: true }, visible: true },
                        { name: "Social Inclusion", splitId: "Thematic objective", id: "to8", selections: { facetName: "to", value: 9, selected: true }, visible: true },
                        { name: "Educational & Vocational Training", splitId: "Thematic objective", id: "to9", selections: { facetName: "to", value: 10, selected: true }, visible: true },
                        { name: "Efficient Public Administration", splitId: "Thematic objective", id: "to10", selections: { facetName: "to", value: 11, selected: true }, visible: true },
                        { name: "Outermost & Sparsely Populated", splitId: "Thematic objective", id: "to11", selections: { facetName: "to", value: 12, selected: true }, visible: true },
                        { name: "Discontinued Measures", splitId: "Thematic objective", id: "to12", selections: { facetName: "to", value: "DM", selected: true }, visible: true },
                        { name: "Technical Assistance", splitId: "Thematic objective", id: "to13", selections: { facetName: "to", value: "TA", selected: true }, visible: true }
                    )
                }
            )
        },
        display: {
            background: "white",
            borderColor: [{ dividerColor: _ }, [me]],
            borderWidth: 1,
            borderStyle: "solid"
        },
        "children.items.description": {
            context: {
                isUserDefinedSlice: [equal, [{ content: { name: _ } }, [me]], "User defined"]
            },
            "write.onClick.true": o({
                // Add slices whose name and splitId doesn't yet occur in the list
                setSplit: {
                    to: [{ sliceSplit: _ }, [myContext, "SliceListItem"]],
                    merge: push([
                        n([{ splitId: _, id: _ }, [{ sliceSplit: _ }, [myContext, "SliceListItem"]]]),
                        [{ content: { slices: _ } }, [me]]
                    ])
                },
                "class": "IncrementNextId"
            }, {
                    qualifier: { isUserDefinedSlice: true },
                    editSlice: {
                        to: [{ editedSliceId: _ }, [myContext, "App"]],
                        merge: [{ nextId: _ }, [myContext, "NextId"]]
                    }
                })
        },
        position: {
            width: [plus, [max, [{ children: { items: { width: _ } } }, [me]]], 4],
            height: 80
        }
    },

    RemoveSplitSliceMenu: {
        "class": "TextChoiceMenu",
        context: {
            listData: o(
                { name: "All user defined", splitId: "User defined" },
                { name: "All countries", splitId: "Country" },
                { name: "All funds", splitId: "Fund" },
                { name: "All region types", splitId: "Region type" },
                { name: "All thematic objectives", splitId: "Thematic objective" }
            )
        },
        "children.items.description": {
            "write.onClick.true": {
                removeSplits: {
                    to: [{ sliceSplit: _ }, [myContext, "SliceListItem"]],
                    merge: [
                        n({ splitId: [{ content: { splitId: _ } }, [me]] }),
                        [{ sliceSplit: _ }, [myContext, "SliceListItem"]]
                    ]
                }
            }
        }
    },

    TextChoiceMenu: {
        "class": "BasicListInArea",
        display: {
            background: "white",
            borderColor: [{ dividerColor: _ }, [me]],
            borderWidth: 1,
            borderStyle: "solid"
        },
        children: {
            items: {
                description: {
                    "class": "HighlightOnHover",
                    context: {
                        width: [displayWidth]
                    },
                    display: {
                        text: {
                            "class": "Font",
                            fontSize: 10,
                            textAlign: "left",
                            value: [{ content: { name: _ } }, [me]]
                        }
                    },
                    write: {
                        onClick: {
                            upon: myClick,
                            true: {
                                // Add action for click here
                                closePopUp: {
                                    to: [{ showPopUp: _ }, [myContext, "PopUp"]],
                                    merge: false
                                }
                            }
                        }
                    },
                    position: {
                        left: 2,
                        height: 16
                    }
                }
            }
        },
        position: {
            width: [plus, [max, [{ children: { items: { width: _ } } }, [me]]], 4],
            height: [mul, 16, [size, [{ listData: _ }, [me]]]]
        }
    },

    /// Inherit this class in an area embedded in SliceListItem and a click on that
    /// area will make the slice the target of the editor
    SelectSliceForEditing: {
        context: {
            isBeingEdited: mustBeDefined
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    edit: {
                        to: [{ editedSliceId: _ }, [myContext, "App"]],
                        merge: [
                            cond, [{ isBeingEdited: _ }, [me]], o(
                                { on: false, use: [{ id: _ }, [myContext, "Slice"]] }
                            )]
                    }
                }
            }
        }
    },

    DeselectSliceForEditing: {
        write: {
            onClick: {
                upon: myClick,
                true: {
                    edit: {
                        to: [{ editedSliceId: _ }, [myContext, "App"]],
                        merge: o()
                    }
                }
            }
        }
    },

    SliceHeader: {
        "class": "TextValueInput",
        context: {
            name: mustBeDefined,
            value: [{name: _}, [me]],
            type: "text",
            indicateEditability: [{hover: _}, [embedding]]
        },
        display: {
            text: {
                fontSize: 20,
                fontWeight: 100,
                textAlign: "left",
                verticalAlign: "top"
            }
        }
    },

    SliceSearchSummary: {
        "class": "UniformMatrix",
        context: {
            selections: mustBeDefined,
            selectedFacetNames: [
                sort,
                [
                    _,
                    [
                        { facetName: _ },
                        [{ selections: { selected: true } }, [me]]
                    ]
                ],
                c("ms", "category_of_region", "fund", "to")
            ],
            selectionDescriptions: [
                cond, [empty, [{selectedFacetNames: _}, [me]]], o({
                    on: true, use: { facetName: "None", values: "None" }
                }, {
                    on: false, use: [
                        map,
                        [defun, "facetName", [
                            using,
                            "values", [
                                sort,
                                [
                                    map,
                                    [defun, "selection",
                                        [replaceEmpty, [{ displayName: _ }, "selection"], [{ value: _ }, "selection"]]
                                    ], [
                                        { facetName: "facetName" },
                                        [{ selections: { selected: true } }, [me]]
                                    ]
                                ],
                                ascending
                            ],
                            {
                                facetName: "facetName",
                                values: "values"
                            }
                        ]],
                        [{ selectedFacetNames: _ }, [me]]
                    ]
                })
            ],
            matrixItems: [{children: {items: _}}, [me]],
            orthogonalSpacing: 8,
            minMatrixSpacing: 4,
            maxMatrixSpacing: 16,
            minWidth: [max, [{matrixItems: {width: _}}, [me]]],
            maxWidth: [mul, 2, [{minWidth: _}, [me]]]
        },
        display: {
            borderStyle: "solid",
            borderColor: "darkgrey",
            borderWidth: 2,
            background: "white",
            text: {
                "class": "Font",
                fontSize: 13,
                fontWeight: 300,
                verticalAlign: "top",
                value: "Selections"
            }
        },
        children: {
            items: {
                data: [{selectionDescriptions: _}, [me]],
                description: {
                    "class": "UniformMatrixItem",
                    context: {
                        item: [{param: {areaSetContent: _}}, [me]],
                        facetName: [{item: {facetName: _}}, [me]],
                        values: [{item: {values: _}}, [me]],
                        width: [plus, [displayWidth], 16]
                    },
                    display: {
                        borderRadius: 8,
                        background: "darkgrey",
                        text: {
                            "class": "Font",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 700,
                            value: [
                                cond, [size, [{values: _}, [me]]], o({
                                    on: 1, use: [{values: _}, [me]]
                                }, {
                                    on: null, use: [concatStr, o(
                                        [size, [{values: _}, [me]]],
                                        " ",
                                        [translateFacetNameToMultiple, [{facetName: _}, [me]]]
                                    )]
                                })
                            ]
                        },
                        hoverText: [
                                cond, [size, [{values: _}, [me]]], o({
                                    on: r(2, Infinity), use: [concatStr,
                                        [{values: _}, [me]],
                                        ", "
                                    ]
                                })
                            ]
                    },
                    position: {
                        height: 16,
                        // width: [{width: _}, [me]]
                        minWidth: {
                            point1: { type: "left" },
                            point2: { type: "right" },
                            min: [{minWidth: _}, [embedding]]
                        },
                        maxWidth: {
                            point1: { type: "left" },
                            point2: { type: "right" },
                            max: [{maxWidth: _}, [embedding]]
                        }
                    }
                }
            }
        },
        position: {
            width: [max, 432, [plus, [{minWidth: _}, [me]], 16]],
            firstItemAtTop: {
                point1: { type: "top" },
                point2: { type: "top", element: [first, [{matrixItems: _}, [me]]]},
                equals: 20
            },
            firstItemLeft: {
                point1: { type: "left" },
                point2: { type: "left", element: [first, [{matrixItems: _}, [me]]]},
                equals: 4
            },
            bottom: {
                point1: { type: "bottom", element: [last, [{matrixItems: _}, [me]]] },
                point2: { type: "bottom"},
                equals: 4
            }
        }
    }
};
