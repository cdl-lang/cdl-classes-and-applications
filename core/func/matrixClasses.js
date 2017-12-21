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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. expansionAxis
    // 2. initial_nr_rows (expansionAxis "vertical") / initial_nr_columns (expansionAxis "horizontal"). default provided: 1.
    //    these are used by nr_rows/nr_columns, to initialize their mergeWrite definition.
    // 3. fixed_width (expansionAxis "vertical") / fixed_height (expansionAxis "horizontal"): boolean flags, false by default. 
    // 4. min_nr_elements_expansion_axis: if expanding horizontally (vertically), minimum number of columns (rows). default provided: 1.
    // 5. scrollAxis: default provided. the axis on which the Matrix (document) will be scrolled inside the MatrixView, if need be.
    // 6. scrollerDefaultColor / scrollerColorOnHover / scrollbarBorderColor: default values provided.
    // 7. scrollbarSide: "beginning", by default (i.e. left/top).
    // 8. showScrollbarOnlyWhenInView: true, by default. Accessed by the associated Scrollbar's showOnlyWhenInView.
    // Inheriting classes may use the resizeHandleNeeded calculated boolean flag to determine whether to give the MatrixView a resize handle.
    // 9. additionalMatrixViewWidth/additionalMatrixViewHeight: additional px to be allocated to the width/height of the MatrixView, which are *NOT* driven
    //    by the cells and their margin from the MatrixDoc. 
    //    An example: if we wish to allocate room for a scrollbar, that will reside between the MatrixView and the MatrixDoc
    // 10. automaticMatrixViewResize: should the Matrix' nr_elements_in_view be rewritten to a new value, 
    //     in case sufficient_nr_elements_this_axis < nr_elements_in_view. false, by default. 
    // 11. matrixResizeHandleCanModifyViewDimension: true, by default. Does dragging the Matrix modify its dimension (e.g. drag the horizontal side of
    //     a MatrixView, does that increase the number of columns it displays?). A counter example: the MinimizedFacetsView
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                matrixResizeHandleCanModifyViewDimension: true,
                matrixResizedHorizontally: [{ myHorizontalResizeHandle: { tmd: _ } }, [me]],
                matrixResizedVertically: [{ myVerticalResizeHandle: { tmd: _ } }, [me]],
                expansionAxis: "vertical",
                scrollAxis: "vertical",
                fixed_width: false,
                fixed_height: false,
                matrixExceedsView: [greaterThan,
                    [{ myMatrix: { sufficient_nr_elements_this_axis: _ } }, [me]],
                    [{ min_nr_elements_expansion_axis: _ }, [me]]
                ],

                resizedViewExceedsMaxViewNeeded: [greaterThan,
                    [{ myMatrix: { nr_elements_in_view: _ } }, [me]],
                    [{ min_nr_elements_expansion_axis: _ }, [me]]
                ],

                resizeHandleNeeded: o(
                    [{ matrixExceedsView: _ }, [me]],
                    [{ resizedViewExceedsMaxViewNeeded: _ }, [me]],
                    [{ matrixResizeHandleTmd: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "ContentDimensions", "TrackMyMatrix"),
            context: {
                myHorizontalResizeHandle: [
                    { myMatrixView: [me] },
                    [areaOfClass, "MatrixHorizontalResizeHandle"]
                ],
                myVerticalResizeHandle: [
                    { myMatrixView: [me] },
                    [areaOfClass, "MatrixVerticalResizeHandle"]
                ],
                myMatrix: [
                    { myMatrixView: [me] },
                    [areaOfClass, "Matrix"]
                ],
                automaticMatrixViewResize: true,
                cell_height: [{ myMatrix: { cell_height: _ } }, [me]],
                cell_width: [{ myMatrix: { cell_width: _ } }, [me]],
                vertical_spacing: [{ myMatrix: { vertical_spacing: _ } }, [me]],
                horizontal_spacing: [{ myMatrix: { horizontal_spacing: _ } }, [me]],
                min_nr_elements_expansion_axis: 1,
                on_resize_nr_elements_expansion_axis: [round,
                    [div,
                        [minus,
                            [{ contentDimension: _ }, [me]],
                            [cond,
                                [{ maintainSpacingBetweenMatrixAndCells: _ }, [me]],
                                o({ on: true, use: [{ spacing: _ }, [me]] }, { on: false, use: 0 })
                            ]
                        ],
                        [plus,
                            [{ cellDimension: _ }, [me]],
                            [{ spacing: _ }, [me]]
                        ]
                    ]
                ],
                "*matrixResizeHandleTmd": false, // appData used by resizeHandleNeeded - to ensure we don't take away the handle while it is being dragged!
                scrollbarSide: "beginning",
                showScrollbarOnlyWhenInView: true
            },
            write: {
                onMatrixViewResizeHandleNoLongerNeeded: {
                    // if after the user set the MatrixView to accommodate a certain number of view, and then the view dimension changed (e.g. window resize),
                    // then record the sufficient_nr_elements_this_axis
                    upon: [and,
                        [{ automaticMatrixViewResize: _ }, [me]],
                        [lessThan,
                            [{ myMatrix: { sufficient_nr_elements_this_axis: _ } }, [me]],
                            [{ myMatrix: { nr_elements_in_view: _ } }, [me]]
                        ]
                    ],
                    true: {
                        setToSufficientNumElements: {
                            to: [{ myMatrix: { nr_elements_in_view: _ } }, [me]],
                            merge: [max,
                                [{ myMatrix: { sufficient_nr_elements_this_axis: _ } }, [me]],
                                [{ min_nr_elements_expansion_axis: _ }, [me]]
                            ]
                        }
                    }
                }
            },
            stacking: {
                defineAboveAllNonDraggedMatrixElementsI: {
                    higher: { label: "aboveAllNonDraggedMatrixElements" },
                    lower: { label: "aboveNonDraggedMatrixCells" }
                },
                defineAboveAllNonDraggedMatrixElementsII: {
                    lower: { label: "aboveAllNonDraggedMatrixElements" },
                    higher: { element: [{ myApp: _ }, [me]], label: "zTop" }
                }
            }
        },
        {
            qualifier: { expansionAxis: "horizontal" },
            context: {
                initial_nr_columns: 1, // default value
                "^nr_columnsAD": o(),
                nr_columns: [mergeWrite,
                    [{ nr_columnsAD: _ }, [me]],
                    [{ initial_nr_columns: _ }, [me]]
                ],
                contentDimension: [{ contentWidth: _ }, [me]],
                maintainSpacingBetweenMatrixAndCells: [{ maintainHorizontalSpacingBetweenMatrixAndCells: _ }, [me]],
                spacing: [{ horizontal_spacing: _ }, [me]],
                cellDimension: [{ cell_width: _ }, [me]]
            }
        },
        {
            qualifier: { scrollAxis: "vertical" },
            "class": o("MinWrapHorizontal", "VerticalContMovableController"),
            context: {
                beginningOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "top" }),
                endOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "bottom" })
            },
            children: {
                verticalScrollbar: {
                    description: {
                        "class": "MatrixVerticalScrollbar"
                    }
                }
            }
        },
        {
            qualifier: { scrollAxis: "horizontal" },
            "class": o("MinWrapVertical", "HorizontalContMovableController"),
            context: {
                beginningOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "left" }),
                endOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "right" })
            },
            children: {
                horizontalScrollbar: {
                    description: {
                        "class": "MatrixHorizontalScrollbar"
                    }
                }
            }
        },
        {
            qualifier: {
                "expansionAxis": "horizontal",
                matrixResizedHorizontally: false
            },
            context: {
                additionalMatrixViewWidth: 0
            },
            position: {
                "content-width": [plus,
                    [plus,
                        [mul,
                            [{ nr_columns: _ }, [me]],
                            [plus,
                                [{ cell_width: _ }, [me]],
                                [{ horizontal_spacing: _ }, [me]]
                            ]
                        ],
                        [mul,
                            [{ horizontal_spacing: _ }, [me]],
                            [cond,
                                [{ maintainHorizontalSpacingBetweenMatrixAndCells: _ }, [me]],
                                o({ on: true, use: 1 }, { on: false, use: -1 })
                            ]
                        ]
                    ],
                    [{ additionalMatrixViewWidth: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { expansionAxis: "vertical" },
            context: {
                initial_nr_rows: 1, // default value
                "^nr_rowsAD": o(),
                nr_rows: [mergeWrite,
                    [{ nr_rowsAD: _ }, [me]],
                    [{ initial_nr_rows: _ }, [me]]
                ],
                beginningOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "top" }),
                endOfDocPoint: atomic({ element: [{ myMatrix: _ }, [me]], type: "bottom" }),
                contentDimension: [{ contentHeight: _ }, [me]],
                maintainSpacingBetweenMatrixAndCells: [{ maintainVerticalSpacingBetweenMatrixAndCells: _ }, [me]],
                spacing: [{ vertical_spacing: _ }, [me]],
                cellDimension: [{ cell_height: _ }, [me]]
            }
        },
        {
            qualifier: {
                "expansionAxis": "vertical",
                matrixResizedVertically: false
            },
            context: {
                additionalMatrixViewHeight: 0
            },
            position: {
                "content-height": [plus,
                    [plus,
                        [mul,
                            [{ nr_rows: _ }, [me]],
                            [plus,
                                [{ cell_height: _ }, [me]],
                                [{ vertical_spacing: _ }, [me]]
                            ]
                        ],
                        [mul,
                            [{ vertical_spacing: _ }, [me]],
                            [cond,
                                [{ maintainVerticalSpacingBetweenMatrixAndCells: _ }, [me]],
                                o({ on: true, use: 1 }, { on: false, use: -1 })
                            ]
                        ]
                    ],
                    [{ additionalMatrixViewHeight: _ }, [me]]
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myMatrixView (default provided)
    // 2. myMatrixCellUniqueIDs
    // 3. all_data: a writable os with cell contents
    // 4. cell_width / cell_height
    // 5. fixedContentWidth / fixedContentHeight: the actual real-estate allocated on the fixed dimension (if fixed_width / fixed_width set in MatrixView).
    //    default provided: contentWidth / contentHeight of the Matrix.
    // 6. horizontal_spacing / vertical_spacing: default provided
    // 7. orderByRow: default value set by myMatrixView's expansionAxis: orderByRow: true if expansionAxis is "vertical", and orderByRow: false if it's "horizontal"
    // 8. firstMatrixCellInAllData: the position a MatrixCell dragged to the first position in the Matrix should assume in all_data. default provided (0).
    //    See MinimizedFacetsDoc for an example where this is overridden.
    // 4. maintainVerticalSpacingBetweenMatrixAndCells/maintainHorizontalSpacingBetweenMatrixAndCells: false, by default. 
    //    should the horizontal/vertical spacing between cells also apply to those cells that are at the circumference of the Matrix?
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Matrix: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dragged_cell: [{ inDraggingOperation: true }, [{ myMatrixCells: _ }, [me]]],

                orderByRow: [{ defaultOrderByRow: _ }, [me]],
                fixed_height: [{ myMatrixView: { fixed_height: _ } }, [me]],
                fixed_width: [{ myMatrixView: { fixed_width: _ } }, [me]],
                expansionAxis: [{ myMatrixView: { expansionAxis: _ } }, [me]],
                maintainVerticalSpacingBetweenMatrixAndCells: false,
                maintainHorizontalSpacingBetweenMatrixAndCells: false
            }
        },
        { // default
            "class": o("GeneralArea", "ContentDimensions"),
            context: {
                myMatrixCells: [sort,
                    [
                        { myMatrix: [me] },
                        [areaOfClass, "MatrixCell"]
                    ],
                    { uniqueID: [{ myMatrixCellUniqueIDs: _ }, [me]] }
                ],
                myMatrixView: [
                    [embeddingStar],
                    [areaOfClass, "MatrixView"]
                ],
                firstMatrixCellInAllData: 0,
                defaultOrderByRow: [cond,
                    [{ expansionAxis: _ }, [me]],
                    o(
                        { on: "vertical", use: true },
                        { on: "horizontal", use: false }
                    )
                ],
                nr_cells: [size, [{ myMatrixCellUniqueIDs: _ }, [me]]],
                fixedContentHeight: [{ contentHeight: _ }, [me]],
                fixedContentWidth: [{ contentWidth: _ }, [me]],
                sufficient_nr_columns: [ceil, // if fixed_nr_rows is defined, this is the sufficient number of columns needed to display all cells
                    [div,
                        [{ nr_cells: _ }, [me]],
                        [{ fixed_nr_rows: _ }, [me]]
                    ]
                ],
                sufficient_nr_rows: [ceil, // if fixed_nr_columns is defined, this is the sufficient number of rows needed to display all cells
                    [div,
                        [{ nr_cells: _ }, [me]],
                        [{ fixed_nr_columns: _ }, [me]]
                    ]
                ],
                fixed_nr_columns: [max,
                    [floor,
                        [div,
                            [{ fixedContentWidth: _ }, [me]],
                            [plus,
                                [{ cell_width: _ }, [me]],
                                [{ horizontal_spacing: _ }, [me]]
                            ]
                        ]
                    ],
                    1 // in theory, this is not needed, but because we divided by fixed_nr_columns, this protects from division by 0
                ],
                fixed_nr_rows: [max,
                    [floor,
                        [div,
                            [{ fixedContentHeight: _ }, [me]],
                            [plus,
                                [{ cell_height: _ }, [me]],
                                [{ vertical_spacing: _ }, [me]]
                            ]
                        ]
                    ],
                    1 // in theory, this is not needed, but because we divided by fixed_nr_rows, this protects from division by 0
                ],
                actual_nr_columns: [cond,
                    [and,
                        [not, [{ fixed_width: _ }, [me]]],
                        [{ fixed_height: _ }, [me]]
                    ],
                    o(
                        { on: false, use: [{ nr_columns_in_view: _ }, [me]] },
                        { on: true, use: [{ sufficient_nr_columns: _ }, [me]] }
                    )
                ],
                actual_nr_rows: [cond,
                    [and,
                        [not, [{ fixed_height: _ }, [me]]],
                        [{ fixed_width: _ }, [me]]
                    ],
                    o(
                        { on: false, use: [{ nr_rows_in_view: _ }, [me]] },
                        { on: true, use: [{ sufficient_nr_rows: _ }, [me]] }
                    )
                ],
                horizontal_spacing: 0,
                vertical_spacing: 0,

                "*originalIndicesOfMatrixCellsInView": o(), // recorded at the beginning of every dragging operation, and reset to o() when it ends.                
            },
            write: {
                onMatrixDraggedCell: {
                    upon: [{ dragged_cell: _ }, [me]],
                    true: {
                        recordIndices: {
                            to: [{ originalIndicesOfMatrixCellsInView: _ }, [me]],
                            merge: [
                                {
                                    original_index: _,
                                    inView: true
                                },
                                [{ myMatrixCells: _ }, [me]]
                            ]
                        }
                    },
                    false: {
                        resetIndices: {
                            to: [{ originalIndicesOfMatrixCellsInView: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            },
            stacking: {
                placeBelowMatrixCells: {
                    lower: [me],
                    higher: { label: "belowMatrixCells", element: [{ myMatrixView: _ }, [me]] }
                }
            }
        },
        {
            qualifier: { fixed_width: false },
            position: {
                width: [plus,
                    [mul,
                        [{ actual_nr_columns: _ }, [me]],
                        [plus,
                            [{ cell_width: _ }, [me]],
                            [{ horizontal_spacing: _ }, [me]]
                        ]
                    ],
                    [mul,
                        [{ horizontal_spacing: _ }, [me]],
                        [cond,
                            [{ maintainHorizontalSpacingBetweenMatrixAndCells: _ }, [me]],
                            o({ on: true, use: 1 }, { on: false, use: -1 })
                        ]
                    ]
                ]
            }
        },
        {
            qualifier: { fixed_height: false },
            position: {
                height: [plus,
                    [mul,
                        [{ actual_nr_rows: _ }, [me]],
                        [plus,
                            [{ cell_height: _ }, [me]],
                            [{ vertical_spacing: _ }, [me]]
                        ]
                    ],
                    [mul,
                        [{ vertical_spacing: _ }, [me]],
                        [cond,
                            [{ maintainVerticalSpacingBetweenMatrixAndCells: _ }, [me]],
                            o({ on: true, use: 1 }, { on: false, use: -1 })
                        ]
                    ]
                ]
            }
        },
        {
            qualifier: { expansionAxis: "horizontal" },
            context: {
                sufficient_nr_elements_this_axis: [{ sufficient_nr_columns: _ }, [me]],

                nr_columns_in_view: [{ myMatrixView: { nr_columns: _ } }, [me]],
                nr_elements_in_view: [{ nr_columns_in_view: _ }, [me]],
                nr_rows_in_view: [cond,
                    [{ fixed_height: _ }, [me]],
                    o(
                        { on: false, use: [ceil, [div, [{ nr_cells: _ }, [me]], [{ nr_columns_in_view: _ }, [me]]]] },
                        { on: true, use: [{ fixed_nr_rows: _ }, [me]] }
                    )
                ]
            }
        },
        {
            qualifier: { expansionAxis: "vertical" },
            context: {
                sufficient_nr_elements_this_axis: [{ sufficient_nr_rows: _ }, [me]],

                nr_rows_in_view: [{ myMatrixView: { nr_rows: _ } }, [me]],
                nr_elements_in_view: [{ nr_rows_in_view: _ }, [me]],
                nr_columns_in_view: [cond,
                    [{ fixed_width: _ }, [me]],
                    o(
                        { on: false, use: [ceil, [div, [{ nr_cells: _ }, [me]], [{ nr_rows_in_view: _ }, [me]]]] },
                        { on: true, use: [{ fixed_nr_columns: _ }, [me]] }
                    )
                ]
            }
        },
        {
            qualifier: { dragged_cell: true },
            context: {
                dragged_cell_original_index: [{ original_index: _ }, [{ dragged_cell: _ }, [me]]],
                dragged_cell_new_index: [{ dragged_index: _ }, [{ dragged_cell: _ }, [me]]],
                dragged_cell_original_index_in_all: [index,
                    [{ all_data: _ }, [me]],
                    [{ dragged_cell: { matrixUniqueID: _ } }, [me]]],
                uniqueID_at_dragged_cell_new_index: [pos,
                    [{ dragged_cell_new_index: _ }, [me]],
                    [{ myMatrixCellUniqueIDs: _ }, [me]]
                ],

                // the algorithm for insertion: 
                // insert the element represented by the dragged cell, in all_data, to the position immediately following the element represented by
                // the cell preceding its insertion point in myCells (the reduced list on which the reordering took place). 
                // If it is dragged to the beginning of the myCells, its new position should be the beginning of all_data.
                dragged_cell_new_index_in_all: [cond,
                    [lessThan,
                        [{ dragged_cell_new_index: _ }, [me]],
                        [{ dragged_cell_original_index: _ }, [me]]
                    ],
                    o(
                        {
                            on: true,
                            use: [cond,
                                [equal, [{ dragged_cell_new_index: _ }, [me]], 0],
                                o(
                                    { // If it is dragged to the beginning of the myCells, its new position should be 
                                        // firstMatrixCellInAllData (the 0th position in all_data, by default).
                                        on: true,
                                        use: [{ firstMatrixCellInAllData: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [plus,
                                            [index,
                                                [{ all_data: _ }, [me]],
                                                [prev,
                                                    [{ myMatrixCellUniqueIDs: _ }, [me]],
                                                    [{ uniqueID_at_dragged_cell_new_index: _ }, [me]]
                                                ]
                                            ],
                                            1
                                        ]
                                    }
                                )
                            ]
                        },
                        {
                            on: false,
                            use: [index,
                                [{ all_data: _ }, [me]],
                                [{ uniqueID_at_dragged_cell_new_index: _ }, [me]]
                            ]
                        }
                    )
                ],
                // This triggers a bug while dragging. Something wrong with range matching?
                // affected_cell_range: Roc([{dragged_cell_original_index: _}, [me]],
                //                          [{dragged_cell_new_index: _}, [me]])
                affected_cell_range: [cond,
                    [lessThan,
                        [{ dragged_cell_new_index: _ }, [me]],
                        [{ dragged_cell_original_index: _ }, [me]]
                    ],
                    o(
                        {
                            on: true,
                            use: Rco(
                                [{ dragged_cell_new_index: _ }, [me]],
                                [{ dragged_cell_original_index: _ }, [me]]
                            )
                        },
                        {
                            on: false,
                            use: Roc(
                                [{ dragged_cell_original_index: _ }, [me]],
                                [{ dragged_cell_new_index: _ }, [me]]
                            )
                        }
                    )
                ]
            },
            write: {
                onDrop: {
                    upon: [and,
                        mouseUpNotMouseClickEvent,
                        [notEqual, // write only if there's an actual change in indices
                            [{ dragged_cell_original_index: _ }, [me]],
                            [{ dragged_cell_new_index: _ }, [me]]
                        ]
                    ],
                    true: {
                        write_rearranged: {
                            to: [{ all_data: _ }, [me]],
                            merge: [cond,
                                [lessThan,
                                    [{ dragged_cell_new_index_in_all: _ }, [me]],
                                    [{ dragged_cell_original_index_in_all: _ }, [me]]
                                ],
                                o(
                                    {
                                        on: true,
                                        use: o(
                                            [pos, Rco(0, [{ dragged_cell_new_index_in_all: _ }, [me]]), [{ all_data: _ }, [me]]],
                                            [pos, [{ dragged_cell_original_index_in_all: _ }, [me]], [{ all_data: _ }, [me]]],

                                            [pos, Rco([{ dragged_cell_new_index_in_all: _ }, [me]], [{ dragged_cell_original_index_in_all: _ }, [me]]), [{ all_data: _ }, [me]]],
                                            [pos, Roc([{ dragged_cell_original_index_in_all: _ }, [me]], [size, [{ all_data: _ }, [me]]]), [{ all_data: _ }, [me]]]
                                        )
                                    },
                                    {
                                        on: false,
                                        use: o(
                                            [pos, Rco(0, [{ dragged_cell_original_index_in_all: _ }, [me]]), [{ all_data: _ }, [me]]],
                                            [pos, Roc([{ dragged_cell_original_index_in_all: _ }, [me]], [{ dragged_cell_new_index_in_all: _ }, [me]]), [{ all_data: _ }, [me]]],
                                            [pos, [{ dragged_cell_original_index_in_all: _ }, [me]], [{ all_data: _ }, [me]]],
                                            [pos, Roc([{ dragged_cell_new_index_in_all: _ }, [me]], [size, [{ all_data: _ }, [me]]]), [{ all_data: _ }, [me]]]
                                        )
                                    }
                                )
                            ]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myMatrix
    // 2. matrixUniqueID: default provided [{ param: { areaSetContent:_ } }, [me]]
    // 3. inDraggingOperation: ->AD (reference to AppData) to DraggableWeakMouseAttachment's tmd, by default. Inheriting class may refine this (e.g.
    //    to include both tmd: true and a createModalDialog that comes up after a drop operation) 
    //    Inheriting classes may use as a writable reference elsewhere (e.g. a dedicated handle area) but then should set entireCellDraggable: false 
    //    (true, by default). (Note: otherwise, the writable-reference gets written to via the Tmdable inherited by DraggableWeakMouseAttachment)
    // 4. inView: true, by default. Inheriting class may override (one current such case: for performance optimization, the MinimizedVisibleOverlay doesn't
    //    embed an OSRControls if it is not inView)
    // 5. defineMatrixCellOnHorizontalAxis / defineMatrixCellOnVerticalAxis: boolean, true by default.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixCell: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                entireCellDraggable: true,
                inDraggingOperation: [{ tmd: _ }, [me]],
                inView: true,

                ofFirstRowInView: [equal, [{ row: _ }, [me]], 0],
                ofLastRowInView: [equal, [{ row: _ }, [me]], [minus, [{ nr_rows_in_view: _ }, [me]], 1]],
                ofFirstColumnInView: [equal, [{ column: _ }, [me]], 0],
                ofLastColumnInView: [equal, [{ column: _ }, [me]], [minus, [{ nr_columns_in_view: _ }, [me]], 1]],

                defineMatrixCellOnHorizontalAxis: true,
                defineMatrixCellOnVerticalAxis: true
            }
        },
        { // default
            "class": o("DraggableWeakMouseAttachment", "TrackMyMatrix"),
            context: {
                tmdAppData: [{ entireCellDraggable: _ }, [me]], // DraggableWeakMouseAttachment param
                matrixUniqueID: [{ param: { areaSetContent: _ } }, [me]],
                original_index: [index,
                    [{ myMatrix: { myMatrixCellUniqueIDs: _ } }, [me]],
                    [{ matrixUniqueID: _ }, [me]]
                ],

                in_affected_cell_range: [
                    [{ myMatrix: { affected_cell_range: _ } }, [me]],
                    [{ original_index: _ }, [me]]
                ],
                index: [cond,
                    [{ in_affected_cell_range: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ original_index: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [cond,
                                [lessThan,
                                    [{ original_index: _ }, [me]],
                                    [{ myMatrix: { dragged_cell_original_index: _ } }, [me]]
                                ],
                                o(
                                    {
                                        on: true,
                                        use: [plus, [{ original_index: _ }, [me]], 1]
                                    },
                                    {
                                        on: false,
                                        use: [minus, [{ original_index: _ }, [me]], 1]
                                    }
                                )
                            ]
                        }
                    )
                ]
            },
            stacking: {
                placeAboveBelowMatrixCells: {
                    higher: [me],
                    lower: { label: "belowMatrixCells", element: [{ myMatrixView: _ }, [me]] }
                }
            }
        },
        {
            qualifier: { defineMatrixCellOnVerticalAxis: true },
            position: {
                // higher-than-default priority to ensure that inheriting classes don't violate these constraints - they are important to ensure that 
                // the matrix operations work as speced.
                matrixCellHeight: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    equals: [{ cell_height: _ }, [me]],
                    priority: positioningPrioritiesConstants.strongerThanDefault
                }
            }
        },
        {
            qualifier: { defineMatrixCellOnHorizontalAxis: true },
            position: {
                // higher-than-default priority to ensure that inheriting classes don't violate these constraints - they are important to ensure that 
                // the matrix operations work as speced.
                matrixCellWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    equals: [{ cell_width: _ }, [me]],
                    priority: positioningPrioritiesConstants.strongerThanDefault
                }
            }
        },
        {
            qualifier: {
                defineMatrixCellOnVerticalAxis: true,
                inDraggingOperation: false
            },
            position: {
                attachToMatrixTop: { // not a simple 'top' constraint because MatrixCell is not necessarily embedded in Matrix (e.g. Facet, a MatrixCell)
                    point1: { element: [{ myMatrix: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: [plus,
                        [mul,
                            [{ row: _ }, [me]],
                            [plus,
                                [{ cell_height: _ }, [me]],
                                [{ vertical_spacing: _ }, [me]]
                            ]
                        ],
                        [cond,
                            [{ maintainVerticalSpacingBetweenMatrixAndCells: _ }, [me]],
                            o({ on: true, use: [{ vertical_spacing: _ }, [me]] }, { on: false, use: 0 })
                        ]
                    ]
                }
            }
        },
        {
            qualifier: {
                defineMatrixCellOnHorizontalAxis: true,
                inDraggingOperation: false
            },
            position: {
                attachToMatrixLeft: { // not a simple 'left' constraint because MatrixCell is not necessarily embedded in Matrix (e.g. Facet, a MatrixCell)
                    point1: { element: [{ myMatrix: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: [plus,
                        [mul,
                            [{ column: _ }, [me]],
                            [plus,
                                [{ cell_width: _ }, [me]],
                                [{ horizontal_spacing: _ }, [me]]
                            ]
                        ],
                        [cond,
                            [{ maintainHorizontalSpacingBetweenMatrixAndCells: _ }, [me]],
                            o({ on: true, use: [{ horizontal_spacing: _ }, [me]] }, { on: false, use: 0 })
                        ]
                    ]
                }
            }
        },
        {
            qualifier: { orderByRow: true },
            context: {
                // 'row' and 'column' here are better thought of as index1 and index2, as they could be flipped by controlling the orderByRow flag
                row: [floor, [div, [{ index: _ }, [me]], [{ nr_columns_in_view: _ }, [me]]]],
                column: [mod, [{ index: _ }, [me]], [{ nr_columns_in_view: _ }, [me]]]
            }
        },
        {
            qualifier: { orderByRow: false }, //i.e. order by column
            context: {
                // 'row' and 'column' here are better thought of as index1 and index2, as they could be flipped by controlling the orderByRow flag
                column: [floor, [div, [{ index: _ }, [me]], [{ nr_rows_in_view: _ }, [me]]]],
                row: [mod, [{ index: _ }, [me]], [{ nr_rows_in_view: _ }, [me]]]
            }
        },
        {
            qualifier: { inDraggingOperation: false },
            stacking: {
                defineAboveNonDraggedMatrixCells: {
                    higher: { label: "aboveNonDraggedMatrixCells", element: [{ myMatrixView: _ }, [me]] },
                    lower: [me]
                }
            }
        },
        {
            qualifier: { inDraggingOperation: true },
            context: {
                top_offset: [offset,
                    {
                        element: [{ myMatrix: _ }, [me]],
                        type: "top",
                        content: true
                    },
                    {
                        type: "top"
                    }
                ],
                left_offset: [offset,
                    {
                        element: [{ myMatrix: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    {
                        type: "left"
                    }
                ],
                dragged_row: [min,
                    [max,
                        [round,
                            [div,
                                [minus,
                                    [{ top_offset: _ }, [me]],
                                    [cond,
                                        [{ maintainVerticalSpacingBetweenMatrixAndCells: _ }, [me]],
                                        o({ on: true, use: [{ vertical_spacing: _ }, [me]] }, { on: false, use: 0 })
                                    ]
                                ],
                                [plus,
                                    [{ cell_height: _ }, [me]],
                                    [{ vertical_spacing: _ }, [me]]
                                ]
                            ]
                        ],
                        0
                    ],
                    [minus, [{ actual_nr_rows: _ }, [me]], 1]
                ],
                dragged_col: [min,
                    [max,
                        [round,
                            [div,
                                [minus,
                                    [{ left_offset: _ }, [me]],
                                    [cond,
                                        [{ maintainHorizontalSpacingBetweenMatrixAndCells: _ }, [me]],
                                        o({ on: true, use: [{ horizontal_spacing: _ }, [me]] }, { on: false, use: 0 })
                                    ]
                                ],
                                [plus,
                                    [{ cell_width: _ }, [me]],
                                    [{ horizontal_spacing: _ }, [me]]
                                ]
                            ]
                        ],
                        0
                    ],
                    [minus, [{ actual_nr_columns: _ }, [me]], 1]
                ],

                matrixViewMaxIndex: [max,
                    [{ myMatrix: { originalIndicesOfMatrixCellsInView: _ } }, [me]]
                ],
                matrixViewMinIndex: [min,
                    [{ myMatrix: { originalIndicesOfMatrixCellsInView: _ } }, [me]]
                ],

                dragged_index: [min,
                    [max,
                        [{ unrestricted_dragged_index: _ }, [me]],
                        [{ matrixViewMinIndex: _ }, [me]]
                    ],
                    [{ matrixViewMaxIndex: _ }, [me]]
                ]
            },
            stacking: {
                higherThanOtherMatrixCells: {
                    higher: [me],
                    lower: { label: "aboveAllNonDraggedMatrixElements", element: [{ myMatrixView: _ }, [me]] }
                }
            }
        },
        {
            qualifier: { inDraggingOperation: true, orderByRow: false },
            // Which matrix cells that are affected by the movement of the dragged cell (inDraggingOperation: true) across the minimized facets pane, is determined by two factors:  
            // The original index of the dragged cell (dragged_cell_original_index:_) 
            // The current location of the dragged cell (dragged_cell_new_index:_). 
            // To make sure that the dragged cell doesn’t swap places with a concealed cell out of view, a min/max restriction was added. 
            // This created an infinite loop because whenever the dragged cell was placed as the first/last cell in the matrix, its index will cross the inView min/max restriction, 
            // causing the dragged cell to get the an index number with-in the restriction, 
            // which was over-turn again by the dragged cell location (hence known as the loop).  
            // A plus/minus one to the dragged cell index range avoids the infinite loop and allowes the dragged cell to be place plus/minus one from the stationary cells as first/last inView. 
            context: {
                unrestricted_dragged_index: [min,
                    [plus,
                        [mul,
                            [{ dragged_col: _ }, [me]],
                            [{ nr_rows_in_view: _ }, [me]]
                        ],
                        [{ dragged_row: _ }, [me]]
                    ],
                    [minus, [{ myMatrix: { nr_cells: _ } }, [me]], 1]
                ]
            }
        },
        {
            qualifier: { inDraggingOperation: true, orderByRow: true },
            context: {
                unrestricted_dragged_index: [min,
                    [plus,
                        [mul,
                            [{ dragged_row: _ }, [me]],
                            [{ nr_columns_in_view: _ }, [me]]
                        ],
                        [{ dragged_col: _ }, [me]]
                    ],
                    [minus, [{ myMatrix: { nr_cells: _ } }, [me]], 1]
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myMatrix
    // 2. viewSideIsHandle: boolean. false, by default. If true, handle is attached to the matrixView's axis orthogonal to the expansion axis.
    //    Inheriting class should provide its dimension/position along the expansion axis.
    // 3. Inheriting class should inherit Horizontal/Vertical
    // 4. lowHTMLGirthAnchor/highTMLGirthAnchor: default values provided (the lowHTMLGirth/highHTMLGirth of the MatrixView's content).
    //    reminder: inheriting class should make use of atomic(), it replacing these objects!
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixResizeHandle: o(
        {
            qualifier: "!",
            context: {
                viewSideIsHandle: false,

                handleCanModifyMatrixViewDimension: [{ myMatrixView: { matrixResizeHandleCanModifyViewDimension: _ } }, [me]],
                tmd: [{ myMatrixView: { matrixResizeHandleTmd: _ } }, [me]]
            }
        },
        { // default
            "class": o("DragHandle", "ZRelationToMatrixCells", "TrackMyMatrix"),
            context: {
                // override the default positioningPrioritiesConstants.mouseAttachment so that we overcome the (horizontal) MinWrap priority of 
                // positioningPrioritiesConstants.defaultPressure
                draggingPriority: positioningPrioritiesConstants.weakerThanDefault,
                matrixViewDimension: [min,
                    [max,
                        [{ myMatrixView: { on_resize_nr_elements_expansion_axis: _ } }, [me]],
                        [{ myMatrixView: { min_nr_elements_expansion_axis: _ } }, [me]]
                    ],
                    [cond,
                        [{ non_resized_axis_fixed: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: [{ myMatrix: { sufficient_nr_elements_this_axis: _ } }, [me]]
                            },
                            {
                                on: false,
                                use: o()
                            }
                        )
                    ]
                ]
            },
            write: {
                onMatrixResizeHandleDoubleClick: {
                    "class": "OnMouseDoubleClick"
                }
            }
        },
        {
            qualifier: { handleCanModifyMatrixViewDimension: true },
            write: {
                onMatrixResizeHandleDoubleClick: {
                    // upon: se default above
                    true: {
                        reset_nr_elements: {
                            to: [{ nr_elements_in_view: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                handleCanModifyMatrixViewDimension: true,
                tmd: true
            },
            write: {
                onMatrixResizeHandleDoubleClickChangeViewDimension: {
                    upon: [changed, [{ matrixViewDimension: _ }, [me]]],
                    true: {
                        change_view_dimension: {
                            to: [{ nr_elements_in_view: _ }, [me]],
                            merge: [{ matrixViewDimension: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { viewSideIsHandle: true },
            context: {
                iAmIcon: true, // override DragHandle param
                lowHTMLGirthAnchor: {
                    element: [{ myMatrixView: _ }, [me]],
                    type: [{ lowHTMLGirth: _ }, [me]],
                    content: true
                },
                highHTMLGirthAnchor: {
                    element: [{ myMatrixView: _ }, [me]],
                    type: [{ highHTMLGirth: _ }, [me]],
                    content: true
                }
            },
            position: {
                attachToMatrixViewLowHTMLGirth: {
                    point1: [{ lowHTMLGirthAnchor: _ }, [me]],
                    point2: { type: [{ lowHTMLGirth: _ }, [me]] },
                    equals: 0
                },
                attachToMatrixViewContentHighHTMLGirth: {
                    point1: { type: [{ highHTMLGirth: _ }, [me]] },
                    point2: [{ highHTMLGirthAnchor: _ }, [me]],
                    equals: 0
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZRelationToMatrixCells: {
        stacking: {
            higherThanCells: {
                higher: [me],
                lower: { label: "aboveNonDraggedMatrixCells", element: [{ myMatrixView: _ }, [me]] }
            },
            lowerThanAboveAllNonDraggedElementsLabel: {
                lower: [me],
                higher: { label: "aboveAllNonDraggedMatrixElements", element: [{ myMatrixView: _ }, [me]] }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixHorizontalResizeHandle: {
        "class": o("ModifyPointerHorizontalResize", "MatrixResizeHandle", "Horizontal"),
        context: {
            verticallyDraggable: false,
            non_resized_axis_fixed: [{ myMatrix: { fixed_height: _ } }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixVerticalResizeHandle: {
        "class": o("ModifyPointerVerticalResize", "MatrixResizeHandle", "Vertical"),
        context: {
            horizontallyDraggable: false,
            non_resized_axis_fixed: [{ myMatrix: { fixed_width: _ } }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixScrollbar: {
        "class": o("GeneralArea", "ZRelationToMatrixCells"),
        context: {
            myMatrixView: [embedding],
            movableController: [{ myMatrixView: _ }, [me]],
            showOnlyWhenInView: [{ myMatrixView: { showScrollbarOnlyWhenInView: _ } }, [me]],
            attachToView: [{ myMatrixView: { scrollbarSide: _ } }, [me]],
            attachToViewOverlap: true,
            createButtons: false, // override default definition
            scrollerDefaultColor: [cond,
                [{ myMatrixView: { scrollerDefaultColor: _ } }, [me]],
                o(
                    { on: true, use: [{ myMatrixView: { scrollerDefaultColor: _ } }, [me]] },
                    { on: false, use: designConstants.scrollerDefaultColor }
                )
            ],
            scrollerOnHoverColor: [cond,
                [{ myMatrixView: { scrollerOnHoverColor: _ } }, [me]],
                o(
                    { on: true, use: [{ myMatrixView: { scrollerOnHoverColor: _ } }, [me]] },
                    { on: false, use: designConstants.scrollerOnHoverColor }
                )
            ],
            scrollerOnDraggedColor: [cond,
                [{ myMatrixView: { scrollerOnDraggedColor: _ } }, [me]],
                o(
                    { on: true, use: [{ myMatrixView: { scrollerOnDraggedColor: _ } }, [me]] },
                    { on: false, use: designConstants.scrollerOnDraggedColor }
                )
            ],
            borderColor: [cond,
                [{ myMatrixView: { scrollbarBorderColor: _ } }, [me]],
                o(
                    { on: true, use: [{ myMatrixView: { scrollbarBorderColor: _ } }, [me]] },
                    { on: false, use: designConstants.defaultBorderColor }
                )
            ],
            girth: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixHorizontalScrollbar: {
        "class": o("MatrixScrollbar", "HorizontalScrollbarContainerOfSnappable")
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixVerticalScrollbar: {
        "class": o("MatrixScrollbar", "VerticalScrollbarContainerOfSnappable")
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myMatrix: default provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyMatrix: o(
        { // variant-controller
            qualifier: "!",
            context: {
                orderByRow: [{ myMatrix: { orderByRow: _ } }, [me]],
                expansionAxis: [{ myMatrix: { expansionAxis: _ } }, [me]],

                maintainVerticalSpacingBetweenMatrixAndCells: [{ myMatrix: { maintainVerticalSpacingBetweenMatrixAndCells: _ } }, [me]],
                maintainHorizontalSpacingBetweenMatrixAndCells: [{ myMatrix: { maintainHorizontalSpacingBetweenMatrixAndCells: _ } }, [me]]
            }
        },
        {
            context: {
                myMatrix: [
                    [embeddingStar, [me]],
                    [areaOfClass, "Matrix"]
                ],
                myMatrixView: [{ myMatrix: { myMatrixView: _ } }, [me]],

                nr_columns_in_view: [{ myMatrix: { nr_columns_in_view: _ } }, [me]],
                nr_rows_in_view: [{ myMatrix: { nr_rows_in_view: _ } }, [me]],
                nr_elements_in_view: [{ myMatrix: { nr_elements_in_view: _ } }, [me]],
                sufficient_nr_columns: [{ myMatrix: { sufficient_nr_columns: _ } }, [me]],
                sufficient_nr_rows: [{ myMatrix: { sufficient_nr_rows: _ } }, [me]],
                actual_nr_columns: [{ myMatrix: { actual_nr_columns: _ } }, [me]],
                actual_nr_rows: [{ myMatrix: { actual_nr_rows: _ } }, [me]],
                cell_width: [{ myMatrix: { cell_width: _ } }, [me]],
                cell_height: [{ myMatrix: { cell_height: _ } }, [me]],
                horizontal_spacing: [{ myMatrix: { horizontal_spacing: _ } }, [me]],
                vertical_spacing: [{ myMatrix: { vertical_spacing: _ } }, [me]]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. topTransition
    // 2. leftTransition
    // 3. postDraggingTimeout: the duration following a dragging event during which no visual transitions will apply.
    //    this is a hack, intended to avoid the unpleasant visual transition of a dragged MatrixCell whose embedding (Clipper area) also changes its
    //    position on the mouseUp, resulting in an odd visual transition of the MatrixCell being dragged into place. to avoid all that, we simply block
    //    visual transitions for the dragged element, at this point.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatrixCellTransition: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                allowTransition: [and,
                    [{ allowDraggableToReorderTransition: _ }, [me]],
                    // avoid transition when scrolling in the MatrixView, either by mouse dragging (docMoving)
                    // or via the keyboard/mouse-wheel
                    [not, [{ myMatrixView: { docMoving: _ } }, [me]]],
                    [not, [{ draggedOrJustDragged: _ }, [me]]], // no transition for the cell which just took the mouseDown 
                    [not, [{ myApp: { tkd: _ } }, [me]]],
                    o( 
                        [{ myMatrixView: { matrixResizeHandleCanModifyViewDimension:_ } }, [me]],
                        [and,
                            [not, [{ myMatrixView: { matrixResizeHandleCanModifyViewDimension:_ } }, [me]]],
                            [not, [{ myMatrixView: { matrixResizeHandleTmd:_ } }, [me]]]
                        ]
                    )
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "DraggableToReorderTransition"),
            context: {
                topTransition: bTransitions.defaultVal,
                leftTransition: bTransitions.defaultVal,

                postDraggingTimeout: [{ generalDesign: { justHappenedTimeoutDuration: _ } }, [globalDefaults]],
                draggedOrJustDragged: o(
                    [{ tmd: _ }, [me]],
                    [lessThan,
                        [time, [{ tmd: _ }, [me]], [{ postDraggingTimeout: _ }, [me]]],
                        [{ postDraggingTimeout: _ }, [me]]
                    ]
                )
            }
        },
        {
            qualifier: { allowTransition: true },
            display: {
                transitions: {
                    top: [{ topTransition: _ }, [me]],
                    left: [{ leftTransition: _ }, [me]]
                }
            }
        }
    ),


    //END OF MATRIX CLASSES

};
