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


// %%classfile%%: "../../18_BasicClasses/generator.js"
// %%classfile%%: "../../18_BasicClasses/events.js"
// %%classfile%%: "../../18_BasicClasses/scrollableDesign.js"
// %%classfile%%: "../../18_BasicClasses/draggable.js"
// %%classfile%%: "../../24_Histograms/multibar.js"
// %%classfile%%: "../../24_Histograms/scale.js"
// %%classfile%%: "../../24_Histograms/legend.js"

// This file contains class definitions for the view classes. A view
// allows several slices to be displayed.

var facetNameTable = o(
    {facetName: "MS", facetNameSingular: "Country", facetNamePlural: "Countries"},
    {facetName: "TO", facetNameSingular: "Thematic Objective", facetNamePlural: "Thematic Objectives"},
    {facetName: "Fund", facetNameSingular: "Fund", facetNamePlural: "Funds"},
    {facetName: "InterventionField", facetNameSingular: "Intervention Field", facetNamePlural: "Intervention Fields"},
    {facetName: "category_of_region", facetNameSingular: "Region Type", facetNamePlural: "Region Types"}
);

var translateFacetNameToGroup = [
    defun, o("facetName","plural"), 
    [
        replaceEmpty,
        [cond,
            "plural",
           o(
              { on: true, use: [{ facetNamePlural: _, facetName: "facetName" }, facetNameTable] },
              { on: false, use: [{ facetNameSingular: _, facetName: "facetName" }, facetNameTable] }
           )
        ],        
        "facetName"
    ]
];

var classes = {

    // This class is responsible for managing the list of views available.
    // It is a derived class of the "ObjectManager" class. This means
    // that it supports the following interface for adding and deleting
    // a view:
    // Send a message to this area in order to add or delete a view.
    // To add a view send the message:
    // {
    //     message: "Add",
    //     recipient: <the ESIFViewManager area>
    // }
    // To delete a slice, send the message:
    // {
    //     message: "Delete",
    //     id: <ID of this slice>,
    //     recipient: <the ESIFViewManager area>
    // }
    
    ESIFViewManager: o({

        "class": o("ObjectManager"),
        
        context: {
            // list of all views in the application. This stores the ID of
            // the view together with some descriptive information about the
            // view, such as the slices which are currently on view.
            "^views": o(),
            uniqueObjects: [{ views: _ }, [me]],
        },
    }),

    ESIFViewContext: {
        context: {
            scale: [{ children: { scaledGrid: { children: { scale: _ } } } }, [me]],
            legend: [{ children: { legend: _ } }, [me]]
        }
    },

    ESIFView: o({

        "class": o("ESIFViewDesign", "ESIFViewContext"),
        
        context: {
            // the ID of this view. It must be provided to allow the
            // view area access to its information stored in the view manager.
            id: mustBeDefined,
            // IDs of slices which are displayed in this view.
            slicesInView: [
                {
                    id: [{ id: _ }, [me]],
                    slicesInView: _
                }, [{ views: _ }, [areaOfClass, "ESIFViewManager"]]],
            
            // should there be a 'new slice' button in the view
            showNewSliceButton: true,            
        },

        children: {
            sliceViews: { description: {
                "class": o("ESIFScrollableSliceViews",
                           "ESIFScrollableSliceViewsDesign"),
            }},            
        }
    },{

        qualifier: { showNewSliceButton: true },
        
        children: {
            newSliceButton: { description: {
                "class": o("ESIFEmbeddedNewSliceInViewButton"),
            }}
        }
    },{
        qualifier: { slicesInView: true },        
        children: {
            scaledGrid: {
                description: {
                    "class": o("ESIFScaledGrid")                    
                },                
            },
            legend: {
                description: {
                    "class": "ESIFLegend",
                }                
            }
        }
    },
    ),

    // The various design properties (positioning, colors, etc.) of the
    // scrollable view.
    
    ESIFViewDesign: o({
        
        context: {
            // padding (on all sides)
            padding: 5,
            // spacing between the end of the scrolled list and the top of
            // the 'new slice' button.
            newButtonTopSpacing: 5
        },
        
        children: { sliceViews: { description: {
            position: {
                left: [{ padding: _ }, [embedding]],
                right: [{ padding: _ }, [embedding]]
            }
        }}},
    },{
        qualifier: { slicesInView: true },  
        children: { sliceViews: { description: {
            position: {
                //"class": { name: "BelowSibling", sibling: "scaledGrid", distance: 4 },            
                "class": { name: "BelowSibling", sibling: "legend", distance: 4 },            
            }
        }}}
    },{
        qualifier: { slicesInView: false },  
        children: { sliceViews: { description: {
            position: {
                top: [{ padding: _ }, [embedding]],                
            }
        }}}
    },        
    {
        qualifier: { showNewSliceButton: false },
            
        children: { sliceViews: { description: {
            position: {
                bottom: 5
            }
        }}}
    }, {
        qualifier: { showNewSliceButton: true },
            
            children: { newSliceButton: { description: {
                position: {
                    left: [{ padding: _ }, [embedding]],
                    right: [{ padding: _ }, [embedding]],
                }
            }}},
            
            // Position the slice views relative to the new slice button.
            // The button should be below the list of slice views and if the
            // list of slice views does not fill the whole view, the button
            // should be just below the lowest slice view.
        
            position: {
                // leave enough space for the 'new slice button' at the bottom
                spaceReservedForNewSliceButton: {
                    pair1: {
                        point1: { label: "startReservedForNewSliceButton" },
                        point2: { label: "endReservedForNewSliceButton" },
                    },
                    pair2: {
                        point1: {
                            type: "top",
                            element: [{ topRefElement: _ }, [me]]                            
                        },
                        point2: {
                            type: "bottom",
                            element: [{ children: { newSliceButton: _ }},[me]]
                        },
                    },
                    ratio: 1
                },
                bottomMarginReservedForNewSliceButton: {
                    point1: { label: "endReservedForNewSliceButton" },
                    point2: { type: "bottom", content: true },
                    equals: [{ padding: _ }, [me]]
                },

                reserveSpaceForNewSliceButtonUnderSliceViews: {
                    point1: { type: "bottom",
                            element: [{ children: { sliceViews: _ }},[me]] },
                    point2: { label: "startReservedForNewSliceButton" },
                    equals: [{ newButtonTopSpacing: _ }, [me]]
                },

                buttonAboveBottomOfView: {
                    point1: { type: "bottom",
                            element: [{ children: { newSliceButton: _ }},[me]] },
                    point2: { type: "bottom", content: true },
                    min: [{ padding: _ }, [me]]
                },
                
                buttonNotLowerThanScrolledDocumentEnd: {
                    point1: {
                        label: "scrolledDocumentEnd",
                        element: [{ scrolledDocument: _ },
                                [{ children: { sliceViews: _ }},[me]]]
                    },
                    point2: { type: "top",
                              element: [{ topRefElement: _ }, [me]] },
                    max: [{ newButtonTopSpacing: _ }, [me]]
                },

                butButtonAsLowAsPossible: {
                    point1: { type: "bottom",
                            element: [{ children: { newSliceButton: _ }},[me]] },
                    point2: { type: "bottom" },
                    max: [{ padding: _ }, [me]],
                    priority: dragPriorities.wrapPriority
                }
            },
    }, {
        qualifier: { showNewSliceButton: true, slicesInView: true },
        context: {
            topRefElement: [{ children: { scaledGrid: _ }},[me]]
        }
    },
    {
        qualifier: { showNewSliceButton: true, slicesInView: false },
        context: {
            topRefElement: [{ children: { newSliceButton: _ }},[me]]
        }
    }),

    ESIFScaledGrid: {
        "class": o("ScaledGrid"),
        context: {
            tickPosition: "bottom",
            maxValue: [max, [{ values: _ }, [areaOfClass, "ESIFSliceMultibar"]]],
            margin: 5            
        },
        "children.grid.description.context": {
            showPrimaryGridLines: true,
            showSecondaryGridLines: true,
            showTertiaryGridLines: true
        },
        "children.scale.description.context": {
            roundScaleMax: false,
            simplifiedScale: [{ simplifiedScale: _ }, [myContext, "App"]]
        },
        position: {
            //"class": { name: "BelowSibling", sibling: "sliceViews" },
            //"class": { name: "AboveSibling", sibling: "legend", distance: 4 },
            //"class": { name: "BelowSibling", sibling: "sliceViews", distance: 4 },            
            "class": { name: "AboveSibling", sibling: "newSliceButton", distance: 0 },                        
            //top: 15,
            left: {
                point1: { element: [areaOfClass, "ESIFExpandableDescriptionArea" ], type: "right",  },
                point2: { type: "left" },
                equals: [{ margin: _ }, [me]]
            },
            right: [{ margin: _ }, [me]],
            height: 25 // use 0 to hide global scale
            //bottom: 0
        },
    },

    ESIFLegend: {
        "class": "Legend",
        context: {
            firstSingleSliceVisualizer: [first, [areaOfClass, "SingleSliceVisualizer"]],
            labeledColors: [reverse, [{ labeledFieldsColors: _ }, [myContext, "ESIFData"]]],
            colorPopUpOrientation: "bottom"
        },
        position: {
            //bottom: 10,
            "class": { name: "BelowSibling", sibling: "sliceViews", distance: 4 },            
            top: 15,
            centerHorizontallyWithMultibars: {
               point1: { element: [areaOfClass, "ESIFScaledGrid"], type: "horizontal-center" },
               point2: { type: "horizontal-center" },
               equals: 0,
            },
            //"class": { name: "BelowSibling", sibling: "scaledGrid", distance: 4 },
        },
        /*display: {
            borderStyle: "dashed",
            borderColor: "black",
            borderWidth: 1,
        }*/
    },

    // This class is a scrollable list of slice views. This does not
    // specify the design parameters for this list. This must be done
    // by some class merged with this one.
    
    ESIFScrollableSliceViews:  o({

        "class": o("VerticalScrollableWithScrollbarBasicDesign"),

        context: {
            // IDs of the slices to be displayed in the scrollable list
            slicesToShow: [{ slicesInView: _ }, [my, "ESIFView"]], 
            // this is the [myContext, "ScrolledDocument"] area for
            // the scrolled list.
            scrolledData: [{ slicesToShow: _ }, [me]],
            // setting the two following properties to true, false scrolls
            // the document to the end
            scrollToEnd: [{ scrollToEnd: _ }, [{ scrolledDocument: _ }, [me]]],
            wasMoved: [{ wasMoved: _ }, [{ scrolledDocument: _ }, [me]]],
            calculatedWidth: [offset, {type: "left" }, {type: "right" }],
        },

        children: { 
            scrollView: { 
                description: { children: { scrolledDocument: { description: {
                    children: { itemsInView: { description: {
                        "class": o("ESIFSliceView")
                    }}}
                }}}}
            },
            // child area to separate the descriptions from the multibars
            expandableDescriptionArea: {        
                description: {        
                    "class": "ESIFExpandableDescriptionArea"
                }
            }
        },
    }),

    // auxiliary area to control the size of the slice description
    ESIFExpandableDescriptionArea: {
        "class": "DraggableEdgeRight",
        context: {
            // DraggableEdgeRight params:
            draggableEdgeRightIsResize: true,            
            maxWidth: [div, [{ calculatedWidth: _ }, [embedding]], 2],
            minWidth: [div, [{ calculatedWidth: _ }, [embedding]], 5],
            initialWidth: [{ minWidth: _ }, [me]],
        },      
        position: {
            top:0,
            bottom: 0,
            left: 0,            
            maxWidth: {
               point1: { type: "left" },
               point2: { type: "right" },
               max: [{ maxWidth: _ }, [me]],
            },
            minWidth: {
                point1: { type: "left" },
                point2: { type: "right" },
                min: [{ minWidth: _ }, [me]],
             },
        }
    },

    // Design properties (positioning, colors, etc.) for the list of
    // slice views. 
    
    ESIFScrollableSliceViewsDesign: o({

        context: {
            // scroll design parameters
            itemSize: 40,
            itemSpacing: 5,
            isDraggable: true,

            scrollbarWidth: 8,
            scrollbarEdgeOffset: 2,
            scrollbarTopMargin: 1,
            scrollbarBottomMargin: 1,
            scrollbarCursorColor: "#a0a0a0",
            scrollbarCursorOpacity: 0.5,
            scrollbarCursorBorderRadius: 5,
        }
    }),

    ESIFSliceViewContext: {
        context: {
            slice: mustBeDefined,
            selectionChain: [{ selectionChain: _ },[{ slice: _ }, [me]]],
            sliceDescription: [{ children: { sliceDescription: _ } }, [me]],
            sliceMultibar: [{ children: { sliceMultibar: _ } }, [me]],
        }
    },
    
    ESIFSliceView: o({

        "class": o("ESIFSliceViewDesign", "ESIFSliceViewContext"),
        
        context: {
            // the ID of the slice which is being viewed here is the content
            // of this area.
            sliceId: [{ content: _ }, [me]],
            slice: [{ id: [{ sliceId: _ }, [me]] },
                    [{ slices: _ }, [areaOfClass, "ESIFSliceManager"]]],
            // the ID of the slice currently being edited (this points
            // at a writeable label)
            editedSliceId: [
                { editedSliceId: _ }, [areaOfClass, "ESIFSliceEditor"]],
            sliceIsBeingEdited: [
                notEmpty,
                [[{ sliceId: _ }, [me]], [{ editedSliceId: _ }, [me]]]]            
        },

        children: {
            sliceDescription: {
                description: {
                    "class": "ESIFSliceDescription"
                }
            },
            sliceMultibar: {
                description: {
                    "class": "ESIFSliceMultibar"
                }
            }
        },
        
    },{
        qualifier: { sliceIsBeingEdited: false },
        
        write: {
            editSlice: {
                upon: myClick,
                true: {
                    toggleEdit: {
                        to: [{ editedSliceId: _ }, [me]],
                        merge: [{ sliceId: _ }, [me]]
                    }
                }
            }
        }
    },{
        qualifier: { sliceIsBeingEdited: true },
        
        write: {
            stopEditSlice: {
                upon: myClick,
                true: {
                    toggleEdit: {
                        to: [{ editedSliceId: _ }, [me]],
                        merge: false
                    }
                }
            }
        }
    }), 
    
    ESIFSliceDescription: {
        "class": o("TextValueInput", "SliceSelectionSummary"),
        context: {
            selections: [{ selectedValues: _ }, [{ selectionChain: _ }, [myContext, "ESIFSliceView"]]],
            defaultSummaryTextOnEmptySelection: "All",
            // facetName, value
            "^writableValue": o(),
            value: [mergeWrite, [{ writableValue: _ }, [me]], [{ summaryText: _ }, [me]]], //"Description", //
            type: "text"
        },
        position: {
            top: 0,
            bottom: 0,
            left: 0,
            rightConstraint: {
                point1: { element: [areaOfClass, "ESIFExpandableDescriptionArea"], type: "right" },
                point2: { type: "right" },
                equals: 0,
             },
        },
        display: {
            text: {
                value: [{ value: _ }, [me]],
                fontSize: 11,
                overflow: "ellipsis",
                whiteSpace: "nowrap",
            },
            borderRightStyle: "dashed",
            borderRightColor: "black",
            borderRightWidth: 1,
        }
    },

    // class used to build the textual summary of a slice
    SliceSelectionSummary: o(
        {
            context: {
                defaultSummaryTextOnEmptySelection: mustBeDefined,
                selections: mustBeDefined, //[{ selections: _ }, [myContext, "SliceListItem"]],
                limitListCategory: o(
                    {facetName: "MS", limit: 3},
                    {facetName: "category_of_region", limit: 1},
                    {facetName: "Fund", limit: 1},
                    {facetName: "TO", limit: 0},
                    {facetName: "InterventionField", limit: 0}
                ),
                selectedFacetNames: [
                    sort,
                    [
                        _,
                        [
                            { facetName: _ },
                            [{ selections: { selected: true } }, [me]]
                        ]
                    ],
                    c("MS", "Fund", "category_of_region", "TO", "InterventionField")
                ],                
            }
        },
        {
            qualifier: {selectedFacetNames: true},
            context: {
                summaryText: [concatStr,
                    [
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
                            "limit",
                            [{ facetName: "facetName", limit: _ }, [{ limitListCategory: _ }, [me]]],
                            "plural",
                            [greaterThan, [size, "values"], 1],
                            //end of using
                            [cond, 
                                [greaterThan, [size, "values"], "limit"],
                                o(
                                    {
                                        on: true, use: [concatStr, o(
                                            [size, "values"],
                                            " ",
                                            [translateFacetNameToGroup, "facetName", "plural"]
                                        )]
                                    },
                                    {
                                        on: false, use: [concatStr, "values", ", "]
                                    }
                                )
                            ],
                        ]],
                        [{ selectedFacetNames: _ }, [me]]
                    ],
                    " | "
                ]
            }
        },
        {
            qualifier: {selectedFacetNames: false},
            context: {
                summaryText: [{ defaultSummaryTextOnEmptySelection: _ }, [me]]
            }
        },
    ),

    ESIFSliceMultibarDesign: {
        context: {
            // Multibar parms:            
            type: "Embedded",
            showValues: [{ showMultibarValues: _ }, [myContext, "App"]],
            valueFontSize: 11,
            valueVerticalMarginTop: 1,
            valueFontSize: 10,
            barAreaOffsetFromBottom: 4,
            barAreaHeightRatio: 0.5,
            valueDisplayType: "absolute", // temp ---> [{ valueDisplayType: _ }, [myContext, "App"]]
            topGrid: false,
            topGridValues: false,
            bottomGrid: false,
            bottomGridValues: false,
        }
    },

    ESIFSliceMultibar: o(
        {
            "class": o("ESIFSliceMultibarDesign", "Multibar", "SliceAggregates"),
            context: {
                selectionChain: [{ selectionChain: _ }, [myContext, "ESIFSliceView"]],
                labeledValues: [{ labeledAbsValues: _ }, [me]], // temp -- can be percetage
                values: [{ value: _ }, [{ labeledAbsValues: _ }, [me]]],
                // Multibar parms:            
                totalLabel: [{ totalLabel: _ }, [myContext, "ESIFData"]],
                labeledFieldsColors: [{ labeledFieldsColors: _ }, [myContext, "ESIFData"]],
                scale: [{ scale: _ }, [myContext, "ESIFView"]],
                legend: [{ legend: _ }, [myContext, "ESIFView"]],
            },
            /*display: {
                // temporary xxxxxxxxxxxxxxxxxxxx
                text: {
                    value: [sum, [{ value: _ }, [{ labeledAbsValues: _ }, [me]]]]
                    //value: [size, [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]]
                },
                borderColor: "black",
                borderStyle: "dashed",
                borderWidth: 1,
            },*/
            position: {
                top: 0,
                bottom: 0,
                right: 0,
                leftConstraint: {
                    point1: { element: [{ sliceDescription: _ }, [myContext, "ESIFSliceView"]], type: "right" },
                    point2: { type: "left" },
                    equals: 0,
                }
            },
        },
    ),

    SliceAggregates: {
        context: {
            selectionChain: mustBeDefined,
            facetDataSumFunc: [
                defun, "facetName",
                [sum,
                    [
                        [{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                        "facetName",
                        [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]] //inputData or solutionSet
                    ]
                ]
            ],
            labeledAbsValues: [map,
                [defun,
                    "labelFieldItem",
                    {
                        label: [{ label: _ }, "labelFieldItem"],
                        value: [[{ facetDataSumFunc: _ }, [me]], [{ field: _ }, "labelFieldItem"]]
                    }
                ],
                [{ labeledFieldsColors: _ }, [myContext, "ESIFData"]]
            ],
        }
    },

    // This class should be included higher in the hierarchy to provide
    // various desing properties for the slice view
    ESIFSliceViewDesignContext: {
    },
    
    // Design class for the slice view
    
    ESIFSliceViewDesign: o({
        display: {
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "#f0f0f0",
        }
    },{
        // this slice is being edited
        qualifier: { sliceIsBeingEdited: true },

        display: {
            background: "#f0f0f0",
            borderColor: "#909090"
        }
    },{
        // no slice is being edited
        qualifier: { editedSliceId: false },
        
        display: {
            background: "#f0f0f0"
        }
    },{
        // some slice is being edited, but not this one
        qualifier: { sliceIsBeingEdited: false, editedSliceId: true },

        children: {
            grayoutCover: { description: {
                position: {
                    frame: 0
                },
                stacking: {
                    aboveSiblings: {
                        lower: [embedding],
                        higher: [me]
                    }
                },
                display: {
                    opacity: 0.8,
                    background: "#d8d8d8"
                }
            }}
        }
    }),
    
    // This class can be used to create a button which (upon click) creates
    // a new slice and adds that slice to the view given by the 'view'
    // context label of this class (which must be defined in the derived
    // class). If the 'editNewSlice' label is set to true, this new slice
    // will immediately become the slice being edited.
    
    ESIFNewSliceInViewButton: o(
        {
            context: {
                // the view area to which this button belongs
                view: mustBeDefined,
                // should the new slice created be immediately made into
                // the edited slice
                editNewSlice: true
            },
            
            write: {
                onClick: {
                    upon: myClick,
                    true: {
                        sendAddSliceMesage: {
                            to: [message],
                            merge: {
                                message: "Add",
                                recipient: [areaOfClass, "ESIFSliceManager"]
                            }
                        },
                        addNewSliceToView: {
                            to: [{ slicesInView: _ }, [{ view: _ }, [me]]],
                            // the ID of the currently last slice (which is
                            // was not used so far)
                            merge: push([{ nextSliceId: _ },
                                         [areaOfClass, "ESIFSliceManager"]]),
                        }
                    }
                }
            }
        },

        {
            qualifier: { editNewSlice: true },

            write: {
                onClick: {
                    true: {
                        editNewSlice: {
                            to: [{ editedSliceId: _},
                                 [areaOfClass, "ESIFSliceEditor"]],
                            // the ID of the new slice
                            merge: [{ nextSliceId: _ },
                                    [areaOfClass, "ESIFSliceManager"]]
                        }
                        // xxxxxxxxxxxxxxxxx
                    }
                }
            }
        }
    ),

    // This class defines a 'new slice in view' button which is embedded
    // in the view.
    
    ESIFEmbeddedNewSliceInViewButton: o({

        "class": o("ESIFNewSliceInViewButton"),

        context: {
            view: [embedding],
            sliceViewList: [{ children: { sliceViews: _ }}, [embedding]]
        },

        position: {
            height: 40
        },
        
        display: {
            background: "lightblue",
            text: {
                value: "click here to create new slice"
            },
        },

        // scroll the list of slices down to the new slice just added
        
        write: { onClick: { true: {
            setScrollToEnd: {
                to: [{ scrollToEnd: _ }, [{ sliceViewList: _ }, [me]]],
                merge: true
            },
            resetScrollToNotMoved: {
                to: [{ wasMoved: _ }, [{ sliceViewList: _ }, [me]]],
                merge: false
            }
        }}}
    })
};
