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
// %%include%%: "../18_BasicClasses/transition.js"

var classes = {

    //
    // Theme Table
    //

    // class to allow access to matrix parameters
    
    ThemeMatrixContext: {
    },
    
    ThemeMatrix: o(
        {
            "class": "ThemeMatrixContext",
            context: {

                //
                // Interface
                //

                // The derived class should place here an ordered set of
                // top level theme names (typically strings or numbers).
                //
                topLevelThemes: mustBeDefined,
                
                // The derived class should provide an ordered set of
                // objects describing the sub-themes of each theme.
                // This ordered set should contain objects (data or areas)
                // with the form (in case of areas, this is the context of
                // the areas):
                // {
                //     myTheme: <theme name>,
                //     containedThemes: o(<names of themes contained in
                //                         this them>)
                // }
                //
                subThemes: mustBeDefined,
                
                //
                // Layout options
                //
                // Override matrixWidth to set the matrix width to a value
                // other than the width of the preferred rectangle defined
                // for the number of top level themes
                //
                matrixWidth: [{ topLevelRectangle: { columns: _ }}, [me]], 
                
                //
                // Extra number of matrix columns allowed beyond the number
                // in 'matrixWidth' in case extra width is needed.
                // Override matrixOverflow to set the extra number of matrix
                // columns allowed beyond the number in 'matrixWidth'
                // in case extra width is needed.
                //
                matrixOverflow: 0,
                
                //
                // The height and width of each cell in the matrix must
                // be specified
                //
                cellWidth: mustBeDefined,
                cellHeight: mustBeDefined,
                //
                // when an item can be expanded, should it be expanded
                // at the first place available or should it be placed
                // at a position which allows expansion (at the moment,
                // allows expansion to at least 2 columns). By default, this
                // is set to 'true' (place at positions which allow expansion).
                useExpansionPositions: true,

                //
                // End of Interface
                //
                
                // list of objects { theme: <name>, isOpen: true|false }
                "^openThemes": o(),
                
                // function to calculate preferred rectangle for displaying
                // a given number of items.
                preferredRectangle: [
                    defun, "numItems",
                    { columns: [max,
                                [min, 2, "numItems"],
                                [floor, [sqrt, "numItems"]]],
                      rows: [ceil, [div, "numItems",
                                    [max, [min, 2, "numItems"],
                                     [floor, [sqrt, "numItems"]]]]] }
                ],

                // default dimensions of top matrix
                topLevelRectangle: [
                    [{ preferredRectangle: _ }, [me]],
                    [size, [{ topLevelThemes: _ }, [me]]]],
                                
                // maximal matrix width within which sub-theme items
                // may be placed
                widthWithMaxOverflow: [plus, [{ matrixOverflow: _ },[me]],
                                       [{ matrixWidth: _ }, [me]]],

                // maximal number of items to display (top level and
                // sub-themes).
                totalMaxNumItems: [
                    sum,
                    [{ maxNumItems: _ },
                     [{ children: { topLevelThemeItems: _ }}, [me]]]],
                // the maximal number of cells to display has to take into
                // account empty cells as a result of incomplete rectangles
                // (this an upper bound).
                maxNumCells: [
                    plus,
                    [{ totalMaxNumItems: _ }, [me]],
                    [mul,
                     [{ widthWithMaxOverflow: _ }, [me]],
                     [size, [{ hasSubThemes: true },
                             [{ children: { topLevelThemeItems: _ }}, [me]]]]]],

                // given the width and height of a rectangle, give the
                // positions in the matrix of the cells of a rectangle
                // of the given height and width positioned at the beginning
                // of the matrix

                rectanglePositions: [
                    defun, o("width", "height", "firstPos"),
                    [map,
                     [defun, "h",
                      [map,
                       [defun, "w",
                        [sum, o("firstPos", "w",
                                [mul, [{ matrixWidth: _ }, [me]], "h"])]],
                       // sequence of column numbers
                       [sequence, r(0, [minus, "width", 1])]]],
                     // sequence of row numbers
                     [sequence, r(0, [minus, "height", 1])]]]
            },

            // matrix cell positioning: wraps the displayed items
            // (note that this only defines the
            // cellTop/cellBottom/cellLeft/cellRight label on the matrix
            // (where the cell here is the full matrix). One still needs
            // to position the matrix area relative to these labels.
            
            position: {
                belowAllItems: {
                    point1: {
                        label: "cellBottom",
                        element: [{ children: { topLevelThemeItems: _ }}, [me]],
                    },
                    point2: { label: "cellBottom" },
                    min: 0
                },
                leftOfAllItems: {
                    point1: {
                        label: "cellRight",
                        element: [{ children: { topLevelThemeItems: _ }}, [me]],
                    },
                    point2: { label: "cellRight" },
                    min: 0
                },
                noHigherThanNeeded: {
                    point1: { label: "cellTop" },
                    point2: { label: "cellBottom" },
                    max: 0,
                    priority: -1
                },
                noWiderThanNeeded: {
                    point1: { label: "cellLeft" },
                    point2: { label: "cellRight" },
                    max: 0,
                    priority: -1
                }
            },
            
            children: {
                topLevelThemeItems: {
                    data: [{ topLevelThemes: _ }, [me]],
                    description: {
                        "class": "TopLevelThemeMatrixItem"
                    }
                }
            }
        }
    ),

    // Common class for all matrix items, whether top level themes or
    // sub-themes.

    // This function requires the embedding element to define the following:
    //
    // 'matrixWidth': the number of cells in a row.
    // 'maxNumCells': the maximal number of cells to position in the
    //    embedding matrix (this number is allowed to be larger
    //    than the actual number).
    // In addition, the embedding* ThemeMatrixContext should define
    // 'cellHeight' and 'cellWidth' (height and width of a single cell
    // in pixels).
    
    ThemeMatrixItem: o(
        {
            context: {
                // the top level theme
                themeName: [{ param: { areaSetContent: _ }}, [me]],
            
                // is this the first theme in the list
                isFirst: [empty, [prev, [me]]],
                
                // first position available for this item (this is where
                // the item itself will be placed).
                firstPos: [min, [{ availablePositions: _ }, [me]]],
                // column at which the first position of this item is
                firstCol: [mod, [{ firstPos: _ }, [me]],
                           [{ matrixWidth: _ }, [embedding]]],
                // By default, the last position is the same as the first
                // position (for a single cell item)
                lastPos: [{ firstPos: _ }, [me]],
                
                // positions in the matrix available for this item.
                availablePositions: [{ freePositions: _ }, [prev, [me]]],

                // The remaining positions which still allow expansion.
                // For efficiency, these may contain positions which are
                // not in 'availablePositions' - only the intersection
                // of these two lists provides the available positions
                // for expansion.
                expansionPositions: [{ freeExpansionPositions: _ },
                                     [prev, [me]]],
                
                // free positions remaining after positioning this item.
                // In the default case, this only removes the first position
                // from the available positions.
                
                freePositions: [n([{ firstPos: _ }, [me]]),
                                [{ availablePositions: _ }, [me]]],

                // by default we use the first position, so the expansion
                // positions remain unchanged (they are always intersected
                // with the available positions).

                freeExpansionPositions: [{ expansionPositions: _ }, [me]],
                
                //
                // functions to calculate cell positions (a derived class
                // can then decide to position itself differently relative
                // to these positions).
                //
                
                // given the cell sequential position in the matrix,
                // these function returns the offset of the top/left of
                // the given cell from the top of the matrix. This applies
                // to cells inside the original matrix, without overflow
                // (no positions are assigned to the matrix overflow).
                
                cellTopOffsetByPos: [
                    defun, "pos",
                    [mul, [{ cellHeight: _ }, [myContext, "ThemeMatrix"]], 
                     [floor,
                      [div, "pos",
                       [{ matrixWidth: _ }, [embedding]]]]],
                ],
            
                cellLeftOffsetByPos: [
                    defun, "pos",
                    [mul, [{ cellWidth: _ }, [myContext, "ThemeMatrix"]],
                     [mod, "pos",
                      [{ matrixWidth: _ }, [embedding]]]]
                ],

                // default padding

                leftCellPadding: [{ cellPadding: _ }, [me]],
                topCellPadding: [{ cellPadding: _ }, [me]],
                rightCellPadding: [{ cellPadding: _ }, [me]],
                bottomCellPadding: [{ cellPadding: _ }, [me]]
            },

            // we here define 4 points to define the position of the top
            // level item cells in the grid ("cellTop", "cellLeft",
            // "cellBottom", "cellRight"). The area itself can then be
            // positioned and sized relative to these points.

            // padding constraints are defined in additional variants
            // below (only if padding is specified).
            
            position: {
                cellTop: {
                    point1: { label: "cellTop", element: [embedding] },
                    point2: { label: "cellTop" },
                    equals: [[{ cellTopOffsetByPos: _ }, [me]],
                             [{ firstPos: _ }, [me]]]
                },
                cellLeft: {
                    point1: { label: "cellLeft", element: [embedding] },
                    point2: { label: "cellLeft" },
                    equals: [[{ cellLeftOffsetByPos: _ }, [me]],
                             [{ firstPos: _ }, [me]]]
                },
                // default, overridden below
                cellBottom: {
                    point1: { label: "cellTop" },
                    point2: { label: "cellBottom" },
                    equals: [{ cellHeight: _ }, [myContext, "ThemeMatrix"]]
                },
                cellRight: {
                    point1: { label: "cellLeft" },
                    point2: { label: "cellRight" },
                    equals: [{ cellWidth: _ }, [myContext, "ThemeMatrix"]]
                }
            },
        },

        {
            qualifier: { isFirst: true },
            context: {
                // positions in the matrix available for this item.
                availablePositions: [sequence,
                                     r(0,
                                       [{ maxNumCells: _ },
                                        [myContext, "ThemeMatrix"]])],

                matrixHasOverflow: [
                    not, [equal, [{ matrixOverflow: _ }, [embedding]], 0]],
            }
        },

        {
            qualifier: { isFirst: true, matrixHasOverflow: true },
            context: {
                // positions in which the following position is also
                // available (at first, all positions except those at the
                // last column - if there is overflow allowed, all positions
                // are expansion positions).
                expansionPositions: [{ availablePositions: _ }, [me]],
            }
        },

        {
            qualifier: { isFirst: true, matrixHasOverflow: false },
            context: {
                // positions in which the following position is also
                // available (at first, all positions except those at the
                // last column - if there is overflow allowed, all positions
                // are expansion positions).
                lastColumnPositions: [
                    [{ rectanglePositions: _ }, [myContext, "ThemeMatrix"]],
                    1, [ceil,
                        [div, [{ maxNumCells: _ },[myContext, "ThemeMatrix"]],
                         [{ matrixWidth: _ },[embedding]]]],
                    [minus, [{ matrixWidth: _ }, [embedding]], 1]],
                expansionPositions: [n([{ lastColumnPositions: _ }, [me]]),
                                     [{ availablePositions: _ }, [me]]],
            }
        },
        
        // cell padding is the padding between the cell edge, as defined
        // by the cellX points above and the actual edge of the area of
        // the cell. A positive padding value makes the appropriate side of the
        // area so many pixels inside the cell side.
        // The padding is defined separately for each side by
        // 'leftCellPadding', 'topCellPadding', 'rightCellPadding'
        // and 'botomCellPadding'. However, these all inherit by default
        // 'cellPadding'.

        {
            qualifier: { leftCellPadding:  true },

            position: {
                // leave margin from cell edges
                leftPadding: {
                    point1: { label: "cellLeft" },
                    point2: { type: "left" },
                    equals: [{ leftCellPadding: _ }, [me]],
                }
            }
        },

        {
            qualifier: { topCellPadding:  true },

            position: {
                topPadding: {
                    point1: { label: "cellTop" },
                    point2: { type: "top" },
                    equals: [{ topCellPadding: _ }, [me]],
                }
            }
        },

        {
            qualifier: { rightCellPadding:  true },

            position: {
                rightPadding: {
                    point1: { type: "right" },
                    point2: { label: "cellRight" },
                    equals: [{ rightCellPadding: _ }, [me]],
                },
            }
        },

        {
            qualifier: { bottomCellPadding:  true },

            position: {
                bottomPadding: {
                    point1: { type: "bottom" },
                    point2: { label: "cellBottom" },
                    equals: [{ bottomCellPadding: _ }, [me]],
                }
            }
        }        
    ),
    
    TopLevelThemeMatrixItem: o(
        {
            "class": "ThemeMatrixItem",
            
            context: {

                // when an item can be expanded, should it be expanded
                // at the first place available or should it be placed
                // at a position which allows expansion (at the moment,
                // allows expansion to at least 2 columns).
                useExpansionPositions: [{ useExpansionPositions: _ },
                                        [myContext, "ThemeMatrix"]],
                
                // is this top theme item open or closed
                isOpen: [
                    { isOpen: _,
                      theme: [{ themeName: _ }, [me]]
                    },
                    [{ openThemes: _ }, [myContext, "ThemeMatrix"]]],
                // total number of items displayed for this top evel theme.
                // This is 1 for the top level theme itself and if the top
                // level theme is open, the max num items below.
                numItems: 1,

                // sub-themes of this theme (may be empty)
                subThemes: [{ containedThemes: _ },
                            [{ myTheme: [{ themeName: _ }, [me]] },
                             [{ subThemes: _ }, [myContext, "ThemeMatrix"]]]],
                // does this top level theme have sub-themes.
                hasSubThemes: [true, [{ subThemes: _ }, [me]]],

                // 1 for the top level theme itself + number of sub-themes.
                maxNumItems: [plus, 1, [size, [{ subThemes: _ }, [me]]]],
            },
        },

        {
            qualifier: { hasSubThemes: true },

            context: {
                // dimensions of preferred rectangle to display the items
                preferredRectangle: [
                    [{ preferredRectangle: _ }, [myContext, "ThemeMatrix"]],
                    [{ numItems: _ }, [me]]],
                // a special case is when the preferred rectangle has width 1.
                preferredWidthIsOne: [
                    equal, 1, [{ preferredRectangle: { columns:_ }}, [me]]],
            },

            children: {
                subItems: {
                    // the first sub-item is the name of the top item
                    data: o([{ themeName: _ }, [me]], [{ subThemes: _ }, [me]]),
                    description: {
                        "class": "SubThemeItem"
                    }
                },
                toggleSwitch: {
                    description: {
                        "class": "TopThemeToggleOpenButton"
                    }
                }
            }
        },

        {
            qualifier: { hasSubThemes: true, useExpansionPositions: true },

            context: {

                // use the first available position which allows expansion

                firstPos: [min,
                           [[{ expansionPositions: _ }, [me]],
                            [{ availablePositions: _ }, [me]]]],
            },
        },
        
        {
            qualifier: { isOpen: true },
            context: {
                // all items are now displayed
                numItems: [{ maxNumItems: _ }, [me]],

                // is the first position at the first column?
                isAtFirstCol: [equal, 0, [{ firstCol: _ }, [me]]],
                
                // maximal set of consecutive positions needed for the items
                // of this top level theme.
                consecutivePositions: [
                    sequence, r([{ firstPos: _ }, [me]],
                                [minus, [plus, [{ firstPos: _ }, [me]],
                                         [{ numItems: _ }, [me]]],
                                 1])],
                // first position in the above set which is not available
                // (empty if all consecutive positions are available)
                firstUnavailablePos: [
                    min,
                    [n([{ availablePositions: _ }, [me]]),
                     [{ consecutivePositions: _ }, [me]]]],
                // maximal consecutive positions available
                numConsecutiveAvailable: [
                    first,
                    o([minus, [{ firstUnavailablePos: _ }, [me]],
                       [{ firstPos: _ }, [me]]],
                      [{ numItems: _ }, [me]])],

                // are there positions available all the way to the
                // end of the row?
                availableToRowEnd: [
                    greaterThanOrEqual, 
                    [{ numConsecutiveAvailable: _ }, [me]],
                    [minus, 
                     [{ matrixWidth: _ }, [embedding]],
                     [{ firstCol: _ }, [me]]]],

                // based on the rectangle width calculated below
                rectangleHeight: [ceil,
                                  [div, [{ numItems: _ }, [me]],
                                   [{ rectangleWidth: _ }, [me]]]],

                // matrix positions occupied by this rectangle
                occupiedPositions: [
                    [{ rectanglePositions: _ }, [myContext, "ThemeMatrix"]],
                    [{ widthWithoutOverflow: _ }, [me]],
                    [{ rectangleHeight: _ }, [me]],
                    [{ firstPos: _ }, [me]]
                ],

                freePositions: [n([{ occupiedPositions: _ }, [me]]),
                                [{ availablePositions: _ }, [me]]],
                
                // matrix layout inside this item (for sub-items)

                matrixWidth: [{ rectangleWidth: _ }, [me]],
                maxNumCells: [mul,
                              [{ rectangleHeight: _ }, [me]],
                              [{ rectangleHeight: _ }, [me]]],

                // the last position inside the matrix (without overflow)
                // occupied by this expanded item
                lastPos: [sum, o([{ firstPos: _ }, [me]],
                                 [mul, [{ matrixWidth: _ }, [embedding]],
                                  [minus, [{ rectangleHeight: _ }, [me]], 1]],
                                 [{ widthWithoutOverflow: _ }, [me]], -1)],
            },
            position: {
                cellRight: {
                    equals: [
                        mul, [{ cellWidth: _ }, [myContext, "ThemeMatrix"]],
                        [{ rectangleWidth: _ }, [me]]],
                },
                cellBottom: {
                    equals: [
                        mul, [{ cellHeight: _ }, [myContext, "ThemeMatrix"]],
                        [{ rectangleHeight: _ }, [me]]]
                }
            },
        },
        
        {
            // can continue to expand to row end + allowed overflow
            qualifier: { isOpen: true, availableToRowEnd: true },

            context: {
                rectangleWidth: [
                    min,
                    [{ preferredRectangle: { columns: _ }}, [me]],
                    [minus,
                     [{ widthWithMaxOverflow: _ }, [myContext, "ThemeMatrix"]],
                     [{ firstCol: _ }, [me]]]],
                
                // overflow beyond standard end of matrix
                overflow: [
                    max, 0,
                    [minus,
                     [plus, [{ rectangleWidth: _ }, [me]],
                      [{ firstCol: _ }, [me]]],
                     [{ matrixWidth: _ }, [myContext, "ThemeMatrix"]]]],

                widthWithoutOverflow: [
                    minus,
                    [{ rectangleWidth: _ }, [me]], [{ overflow: _ }, [me]]]
            }
        },

        {
            // number of columns restricted by non-available positions
            
            qualifier: { isOpen: true, availableToRowEnd: false },

            context: {

                rectangleWidth: [
                    min,
                    [{ preferredRectangle: { columns: _ }}, [me]],
                    [{ numConsecutiveAvailable: _ }, [me]]],

                widthWithoutOverflow: [{ rectangleWidth: _ }, [me]]
            }
        },

        {
            qualifier: { isOpen: true, isAtFirstCol: false },

            context: {
                // remove the positions just before the occupied rectangle
                // from the list of positions which allow expansion
                prefixPositions: [
                    [{ rectanglePositions: _ }, [myContext, "ThemeMatrix"]],
                    1, [{ rectangleHeight: _ }, [me]],
                    [minus, [{ firstPos: _ }, [me]], 1]],
                
                freeExpansionPositions: [n([{ prefixPositions: _ }, [me]]),
                                         [{ expansionPositions: _ }, [me]]],
            }
        }
    ),

    SubThemeItem: o(
        {
            context: {
                isSubTheme: true, // identify this item as a sub-theme item
                isTopThemeOpen: [{ isOpen: _ }, [embedding]],
                // is this the first theme in the list
                isFirst: [empty, [prev, [me]]],
            }
        },

        {
            qualifier: { isTopThemeOpen: true },
            "class": "ThemeMatrixItem",
        },

        {
            qualifier: { isTopThemeOpen: false },
            // extension classes can define the behavior here
            // here we provide them with the theme name
            context: {
                themeName: [{ param: { areaSetContent: _ }}, [me]]
            }
        },
        
        {
            qualifier: { isFirst: true },

            context: {
                isTopTheme: true
            }
        }
    ),
    
    // This area provides a toggle switch to open and close the top theme.
    // Its position and design is left to the inheriting class. Here,
    // it only defines the toggle write itself. It also makes sure it is
    // the highest area among those embedded in the top level item.
    // Finally, it defines a number of context labels which may be useful
    // for the class which actually designs the button.
    
    TopThemeToggleOpenButton: o(
        {
            context: {
                pointerInTopTheme: [notEmpty,
                                    [[embedding], [areasUnderPointer]]],
                pointerInArea: [{ param: { pointerInArea: _ }}, [me]],
                isTopThemeOpen: [{ isOpen: _ }, [embedding]]  
            },
            
            stacking: {
                // above all other children
                aboveOtherChildren: {
                    lower: [{ children: { subItems: _ }}, [embedding]],
                    higher: [me]
                }
            },
            write: {
                toggleOpen: {
                    upon: [{ type: "MouseUp",
                             subType: o("Click", "DoubleClick") }, [myMessage]],
                    true: {
                        toggleOpen: {
                            to: [{ isOpen: _ }, [embedding]],
                            merge: [not, [{ isOpen: _ }, [embedding]]]
                        }
                    }
                }
            }
        }
    ),

    // This extension class extends the basic classes to allow the selection
    // of themes (both top level and sub-themes). Selection takes place
    // by clicking on the relevant theme (but not on its toggle open button).
    // The theme's 'isSelected' property is true when the theme is selected.
    // If the same theme is a sub-theme of two top themes (and therefore
    // appears in two different places in the menu) selecting/de-selecting
    // it at one place results in selecting/de-selecting it also in the other
    // place.
    // This class requires there to be a place to write the 'isSelected'
    // property to. A 'selectedThemes' writable ordered is expected to
    // be defined by the ThemeMatrixContext area of this menu. There is
    // no default definition of this wrtiable ordered set as one does not
    // typically want to store it in the theme menu itself.

    SelectableThemeMatrixExt: o(
        {
            context: {
                // list of selected themes. Each entry in this list is of
                // the form { themeName: <name>, isSelected: true|false } 
                selectedThemes: mustBeDefined,
            },

            children: { topLevelThemeItems: { description: {
                "class": "SelectableTopLevelThemeMatrixItem", 
            }}}
        }
    ),

    SelectableTopLevelThemeMatrixItem: o(
        {
            "class":  "SelectableThemeMatrixItem",
        },

        // when a top theme is open, it cannot be used to perform selection:
        // the sub-theme item for the top theme must then be used to make the
        // selection.

        {
            qualifier: { isOpen: false },
            context: {
                allowSelection: true
            }
        },
        
        {
            qualifier: { hasSubThemes: true },

            context: {
                hasSelectedSubThemes: [
                    notEmpty,
                    [{
                        themeName: [{ subThemes: _ }, [me]],
                        isSelected: true,
                    },
                     [{ selectedThemes: _ }, [myContext, "ThemeMatrix"]]]],
            },
            
            children: { subItems: { description: {
                "class": "SelectableThemeMatrixItem"
            }}}
        }
    ),
    
    // class for selecting theme, both for top level themes and for
    // sub-themes.
    
    SelectableThemeMatrixItem: o(
        {
            context: {
                isSelected: [
                    {
                        themeName: [{ themeName: _ }, [me]],
                        isSelected: _,
                    },
                    [{ selectedThemes: _ }, [myContext, "ThemeMatrix"]]],
            },  
        },

        {
            // When the top theme is closed, the sub-themes cannot be
            // used to make selections (even if they are visible due
            // to 'piling', for example).  isTopThemeOpen identifies
            // this item as a sub-theme under an open top theme
            qualifier: { isTopThemeOpen: true },
            context: {
                allowSelection: true
            }
        },

        {
            qualifier: { isSubTheme: true },

            write: {
                topThemeToggledSelection: {
                    upon: [{ toggleSelectionTrigger: _ }, [embedding]],
                    true: {
                        setSelection: {
                            to: [{ isSelected: _ }, [me]],
                            // the negation of the top theme selection, as
                            // this is the value from before the toggle
                            merge: [not, [{ isSelected: _ }, [embedding]]]
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { allowSelection: true },

            // write operation to select/de-select theme

            context: {
                // place the query on the event in the context so that
                // different areas could access it.
                toggleSelectionTrigger: [
                    { type: "MouseUp",
                      subType: o("Click", "DoubleClick") }, [myMessage]],
            },
            
            write: {
                toggleSelected: {
                    upon: [{ toggleSelectionTrigger: _ }, [me]],
                    true: {
                        toggleSelected: {
                            to: [{ isSelected: _ }, [me]],
                            merge: [not, [{ isSelected: _ }, [me]]]
                        }
                    }
                }
            },
        },

        {
            // this is a top-level theme which is open
            qualifier: { isOpen: true },

            context: {
                // the selection takes place on the first sub-item
                toggleSelectionTrigger: [
                    { toggleSelectionTrigger: _ },
                    [first, [{ children: { subItems: _ }}, [me]]]]
            }
        },
        
        {
            qualifier: { isSubTheme: true, isTopTheme: false },

            // when a sub-theme is de-selected, the top theme must also
            // be deselected, 
            
            write: {
                deselectTopThemeBySubTheme: {
                    upon: [{ isSelected: _ }, [me]],
                    false: {
                        deselectTopTheme: {
                            to: [{ isSelected: _ }, [embedding]],
                            merge: false
                        }
                    }
                }
            }
        },
        
        {
            // this property identifies this as them sub-item for the top
            // theme under which it is embedded.
            qualifier: { isTopTheme: true },

            context: {
                hasSelectedSubThemes: [{ hasSelectedSubThemes: _ }, [embedding]]
            }
        }
    ),
};

