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


// %%include%%: "reference.js"
// %%classfile%%: "draggable.js"

// The classes defined in this file support the layout of a set of areas
// in a matrix form (multiple rows and columns).

var classes = {

    // The uniform matrix object positions a set of equal sized items
    // in a matrix layout. The items may (but do not need to) be embedded
    // in the matrix area.
    //
    // The matrix has a start edge. If it is left/right, consecutive areas
    // are placed horizontally and the matrix determines the horizontal
    // offsets (see below). If it is top/bottom, consecutive areas
    // are placed vertically and the matrix determines the vertical
    // offsets (see below).
    //
    // The positioning contraints set by the matrix layout class
    // force all items in the matrix to be of the same size (width or
    // height, in the direction of consecutive items) and force the
    // spacing (in the direction of consecutive items) between the items
    // to be the same. The most important task of the matrix mechanism is
    // to determine the number of rows/columns in the matrix. 
    //
    // The matrix does not specify the width/height of the items or
    // the matrix directly. These are determined by the positioning
    // constraints defined on the item areas, by the constraints on
    // the width/height defined in the derived class which uses this matrix
    // class. The spacing constraints should be given as constraints
    // on the pair of virtual points of the UniformMatrix area:
    // { label: "matrixSpacingStart" }
    // { label: "matrixSpacingEnd" }
    // Combining these together, the width, height and spacing of the items
    // is determined and the number of columns/rows is determined.
    //
    // The base UniformMatrix class does not actually completely position
    // the matrix items. It determines teh offsets which are internal
    // to the matrix items in the direction of consecutive items: width/height
    // of the item and the spacing between items which are in the same
    // row/column. It does not, however, set the constraints to the embedding
    // areas, since the matrix items may be embedded in one or more areas
    // (in a scrollable list, for example, the items may be embedded in the
    // rows of the scrollabel list).
    //
    // Each item area displayed by the matrix must inherit the
    // UniformMatrixItem class defined below. The UniformMatrix area
    // must be embedding* for all item areas in the matrix.
    //
    // Some basic positioning may optionally be defined by setting the
    // appropriate values to labels of this class, as follows:
    //
    // minMatrixSpacing: the minimal space between consecutive items
    //    (in the same row/column).
    // maxMatrixSpacing: the maximal space between consecutive items
    //    (in the same row/column).
    // orthogonalSpacing: the space between rows/columns (orthogonal to the
    //    direction of the sequence).
    //
    // If any of these is not defined, the corresponding consraints are not
    // defined and alternative constraints need to be defined.
    //
    // In addition, it is possible to require that the matrix have a
    // preference for the smallest item size and spacing by defining
    // the following two labels in the context of the matrix:
    //
    // preferredMinSize: <item preferred minimal size>
    // preferredMinSpacing: <preferred minimal spacing>
    //
    // By adding these two parameters, the system is pushed towards increasing
    // the number of items in the initial seqeunce (the sequence of items which
    // will be placed in the first row/column) once it is possible
    // to do so using the given item size and item spacing.
    
    UniformMatrix: o(
        {
            "class": "MatrixStartAndEndEdges",
            
            context: {
                // ordered set of areas which need to be positioned in the
                // matrix. These areas do not need to be direct children
                // of the matrix, but must be embedded* in the matrix.
                // Moreover, they do not all need to be siblings, but the
                // ordering in 'matrixItems' is assumed to be their order
                // in the matrix.
                matrixItems: mustBeDefined,
                // may be changed to "left"/"right"/"top"/"bottom"
                matrixStartEdge: "left",
                // priority with which the edge of the matrix is attached
                // to the virtual edge of the last item in the row/column.
                // This should be weaker than the constraints determining
                // the minimal/maximal item size, spacing and matrix
                // size but stronger than any constraints which may be violated
                // to accomodate the items in the matrix. By default we
                // use the dragging wrap priority
                endAlignPriority: dragPriorities.wrapPriority,

                // number of items which can be place in a single row/column
                itemSequenceLength: [
                    plus, 1, [max, [{ matrixIndex: _ },
                                    [{ inFirstSequence: true },
                                     [{ matrixItems: _ }, [me]]]]]],
            }
        },

        // The ordered start/end are the start and end edges of the matrix,
        // but always in the increasing order of the coordinates.
        
        {
            qualifier: { matrixStartEdge: o("left", "right") },
            
            context: {
                orderedStart: "left",
                orderedEnd: "right"
            }
        },

        {
            qualifier: { matrixStartEdge: o("top", "bottom") },
            
            context: {
                orderedStart: "top",
                orderedEnd: "bottom"
            }
        },

        {
            qualifier: { minMatrixSpacing: true },

            position: {
                minSpacing: {
                    point1: { label: "matrixSpacingStart" },
                    point2: { label: "matrixSpacingEnd" },
                    min: [{ minMatrixSpacing: _ }, [me]]
                }
            }
        },

        {
            qualifier: { maxMatrixSpacing: true },
            
            position: {
                maxSpacing: {
                    point1: { label: "matrixSpacingStart" },
                    point2: { label: "matrixSpacingEnd" },
                    max: [{ maxMatrixSpacing: _ }, [me]]
                },
            }
        }
    ),

    // Auxiliary class to match every start edge with the matching
    // end edge

    MatrixStartAndEndEdges: o(
        {
            qualifier: { matrixStartEdge: "top" },
            context: {
                matrixEndEdge: "bottom",
                // the default orthogonal direction
                matrixOrthogonalStart: "left",
            }
        },
        
        {
            qualifier: { matrixStartEdge: "left" },
            context: {
                matrixEndEdge: "right",
                // the default orthogonal direction
                matrixOrthogonalStart: "top"
            }
        },

        {
            qualifier: { matrixStartEdge: "right" },
            context: {
                matrixEndEdge: "left",
                // the default orthogonal direction
                matrixOrthogonalStart: "top",
            }
        },

        {
            // this is probably not very useful
            qualifier: { matrixStartEdge: "bottom" },
            context: {
                matrixEndEdge: "top",
                // the default orthogonal direction
                matrixOrthogonalStart: "left",
            }
        },

        {
            qualifier: { matrixOrthogonalStart: "left" },

            context: {
                matrixOrthogonalEnd: "right"
            }
        },
        
        {
            qualifier: { matrixOrthogonalStart: "top" },

            context: {
                matrixOrthogonalEnd: "bottom"
            }
        },

        {
            qualifier: { matrixOrthogonalStart: "right" },

            context: {
                matrixOrthogonalEnd: "left"
            }
        },
        
        {
            qualifier: { matrixOrthogonalStart: "bottom" },

            context: {
                matrixOrthogonalEnd: "top"
            }
        }
    ),
    
    // this class should be inherited by every area which is an item in the
    // matrix. It sets the appropriate constraints on it.
    
    UniformMatrixItem: o(
        {
            context: {
                preferredMinSize: [{ preferredMinSize: _ },
                                   [my, "UniformMatrix"]],
                preferredMinSpacing: [{ preferredMinSpacing: _ },
                                      [my, "UniformMatrix"]],
                
                // index of this item in the matrix 
                matrixIndex: [index,
                              [{ matrixItems: _ }, [my, "UniformMatrix"]],
                              [me]],
                matrixStartEdge: [{ matrixStartEdge: _ },[my, "UniformMatrix"]],
                matrixEndEdge: [{ matrixEndEdge: _ },[my, "UniformMatrix"]],
                orderedStart: [{ orderedStart: _ }, [my, "UniformMatrix"]],
                orderedEnd: [{ orderedEnd: _ }, [my, "UniformMatrix"]],

                // spacing between items in the orthogonal direction
                // (optional)
                orthogonalSpacing: [{ orthogonalSpacing: _ },
                                    [my, "UniformMatrix"]],
                
                // previous item in the list
                prevItem: [prev, [{ matrixItems: _ }, [my, "UniformMatrix"]],
                           [me]],
                
                // does this item still fit into the first sequence
                // (row/column)
                inFirstSequence: [
                    lessThanOrEqual,
                    [offset, { type: [{ orderedEnd: _ }, [me]],
                               element: [my, "UniformMatrix"] },
                     { label: "virtualEnd" }], 0],

                // is this item not first in its row/column
                isNotFirstInSubSequence: [
                    notEqual, 0,
                    [mod, [{ matrixIndex: _ }, [me]],
                     [{ itemSequenceLength: _ }, [my, "UniformMatrix"]]]],
            },
                        
            position: {
                allItemsSameSize: {
                    pair1: {
                        point1: { label: "virtualItemStart",
                                  element: [my, "UniformMatrix"] },
                        point2: { label: "virtualItemEnd",
                                  element: [my, "UniformMatrix"] },
                    },
                    pair2: {
                        point1: { type: [{ orderedStart: _ }, [me]] },
                        point2: { type: [{ orderedEnd: _ }, [me]] }
                    },
                    ratio: 1
                },

                // virtual end of row/column if all areas up to this one
                // are in the same row/column. The virtual end is relative to
                // the vitual start of the matrix (see below) so that all
                // offsets are positive.

                virtualEndWithoutSpacing: {
                    pair1: {
                        point1: { type: [{ orderedStart: _ }, [me]] },
                        point2: { type: [{ orderedEnd: _ }, [me]] },
                    },
                    pair2: {
                        point1: { type: [{ orderedStart: _ }, [me]],
                                  element: [my, "UniformMatrix"] },
                        point2: { label: "virtualEndWithoutSpacing" },
                    },
                    ratio: [plus, 1, [{ matrixIndex: _ }, [me]]]
                },

                virtualEnd: {
                    pair1: {
                        point1: { label: "matrixSpacingStart",
                                  element: [my, "UniformMatrix"] },
                        point2: { label: "matrixSpacingEnd",
                                  element: [my, "UniformMatrix"]
                                },
                    },
                    pair2: {
                        point1: { label: "virtualEndWithoutSpacing" },
                        point2: { label: "virtualEnd" }
                    },
                    ratio: [{ matrixIndex: _ }, [me]]
                },

                // the other end of the matrix must be aligned with 
                // one of the virtual ends (of one of the items).
                oneVirtualEndMustAlign: {
                    point1: { type: [{ orderedEnd: _ }, [me]],
                              element: [my, "UniformMatrix"] },
                    point2: { label: "virtualEnd" },
                    equals: 0,
                    orGroups: { label: "oneVirtualEndMustAlign",
                                element: [my, "UniformMatrix"] },
                    priority: [{ endAlignPriority: _ }, [my, "UniformMatrix"]]
                }
            }
        },

        {
            qualifier: { preferredMinSize: true },

            // either the virtual end without spacing is smaller than
            // the offset of the next item at minimal size or the end of
            // the matrix must be smaller than this virtual end

            position: {
                // position of preferred end of sequence
                preferredEnd: {
                    point1: { type: [{ orderedStart: _ }, [me]],
                              element: [my, "UniformMatrix"] },
                    point2: { label: "preferredEnd" },
                    equals: [plus,
                             [mul, [plus, 1, [{ matrixIndex: _ }, [me]]],
                              [{ preferredMinSize: _ }, [me]]],
                             [mul, [{ matrixIndex: _ }, [me]],
                              [{ preferredMinSpacing: _ }, [me]]]],
                },
                // if end is beyond preferred end, cannot attach to the
                // virtual end of any of the previous items
                eitherBeforePreferredEnd: {
                    point1: { type: [{ orderedEnd: _ }, [me]],
                              element: [my, "UniformMatrix"] },
                    point2: { label: "preferredEnd" },
                    min: 1,
                    orGroups: { label: "preferredEnd" },
                    // priority should be just higher than that of the
                    // virtual end alignment or-group, to allow this to
                    // push that group from one constraint to the other.
                    priority: [plus, 1,
                               [{ endAlignPriority: _ }, [my, "UniformMatrix"]]]
                },
                orBeyondPrevVirtualEnd: {
                    point1: { label: "virtualEnd",
                              element: [
                                  prev,
                                  [{ matrixItems: _ }, [my, "UniformMatrix"]],
                                  [me]]
                            },
                    point2: { type: [{ orderedEnd: _ }, [me]],
                              element: [my, "UniformMatrix"] },
                    min: 1,
                    orGroups: { label: "preferredEnd" },
                    // priority should be just higher than that of the
                    // virtual end alignment or-group, to allow this to
                    // push that group from one constraint to the other.
                    priority: [plus, 1,
                               [{ endAlignPriority: _ }, [my, "UniformMatrix"]]]
                },
            }
        },
        
        {
            qualifier: { isNotFirstInSubSequence:  true },
            
            position: {
                // since it is not the first in its row/column, set the
                // spacing between this area and the previous one
                spacing: {
                    pair1: {
                        point1: { label: "matrixSpacingStart",
                                  element: [my, "UniformMatrix"] },
                        point2: { label: "matrixSpacingEnd",
                                  element: [my, "UniformMatrix"] },
                    },
                    pair2: {
                        point1: {
                            type: [{ matrixEndEdge: _ }, [me]],
                            element: [{ prevItem: _ }, [me]],
                        },
                        point2: { type: [{ matrixStartEdge: _ }, [me]] }
                    },
                    ratio: 1
                }
            }
        },

        {
            // reverse the direction of the constraint
            qualifier: { isNotFirstInSubSequence:  true,
                         matrixStartEdge: o("right", "bottom") },

            position: {
                spacing: {
                    ratio: -1
                }
            }
        },

        // if spacing in the orthogonal direction is specified, apply this
        // between the items

        {
            qualifier: { orthogonalSpacing: true },
            context: {
                matrixOrthogonalStart: [{ matrixOrthogonalStart: _ },
                                        [my, "UniformMatrix"]],
                matrixOrthogonalEnd: [{ matrixOrthogonalEnd: _ },
                                      [my, "UniformMatrix"]],
            }
        },
        
        {
            qualifier: { orthogonalSpacing: true,
                         isNotFirstInSubSequence: true },

            position: {
                // orthogonally align with previous
                orthogonallyAlignWithPrev: {
                    point1: { type: [{ matrixOrthogonalStart: _}, [me]],
                              element: [{ prevItem: _ }, [me]] },
                    point2: { type: [{ matrixOrthogonalStart: _}, [me]] },
                    equals: 0
                }
            }
        },

        {
            qualifier: { orthogonalSpacing: true,
                         isNotFirstInSubSequence: false },

            position: {
                // orthogonally after previous item
                orthogonallyAfterPrev: {
                    point1: { type: [{ matrixOrthogonalEnd: _}, [me]],
                              element: [{ prevItem: _ }, [me]] },
                    point2: { type: [{ matrixOrthogonalStart: _}, [me]] },
                    equals: [{ orthogonalSpacing: _ }, [me]] 
                }
            }
        },

        {
            // reverse the direction of the constraint
            
            qualifier: { orthogonalSpacing: true,
                         isNotFirstInSubSequence: false,
                         matrixOrthogonalStart: o("right","bottom") },

            position: {
                orthogonallyAfterPrev: {
                    equals: [uminus, [{ orthogonalSpacing: _ }, [me]]]
                }
            }
        }
        
    ),

    UniformMatrixPositionedItem: o({
        "class": "UniformMatrixItem",
        position: {
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
    }, {
        qualifier: {isNotFirstInSubSequence: false},
        position: {
            left: 0
        }
    })
};
