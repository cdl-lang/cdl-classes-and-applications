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
// This library offers wrap-around functionality: an os of areas to be laid out within a view, one after the other, and when space runs out (currently: in a given row), the next area
// is positioned on the next row.
// Functionality can be enhanced in various ways at a later date: 
// 1. wrap-around axis: support wrap-around behavior not only for rows, but also for columns
// 2. style: currently, the wrap-around style is "typewriter":
//    | A B C |
//    | D E F |
//    | G     |
//    support for "snake" style, and other styles could be added at a later time.
//    | A B C |
//    | F E D |
//    | G     |
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls an os of WrapAround areas. Typically, it would be inherited by the view in which the areas are wrapped around.
    // This class should not be inherited directly: its Horizontal/Vertical versions should be inherited.
    // 
    // API: 
    // 1. view: An areaRef to the view. By default, this is [me].
    // 2. beginningOfViewPoint: the posPoint from which WrapAround areas layout in a given row is calculated.
    //    by default, this is the 'beginning' posPoint (left/top, for Horizontal/Vertical respectively) of this area.
    //    The inheriting class may override this by specifying: atomic({ <posPoint> }).
    // 3. endOfViewPoint: the posPoint up to which WrapAround areas layout in a given row is calculated. if a wrapAround area exceeds this point, it will be positioned on the next row.
    //    by default, this is the 'end' posPoint (right/bottom, for Horizontal/Vertical respectively) of this area.
    //    The inheriting class may override this by specifying: atomic({ <posPoint> }). This point is relevant when scrolling an entire view forward or back.
    // Note: beginningOfViewPoint/endOfViewPoint need not be in SnappableController.
    // 4. wrapArounds: an ordered set of areas which inherit WrapAround.
    // 5. wrapAroundStyle: "typewriter" or "snake". only "typewriter" implemented for now.
    // 6. wrapAroundAlignment: "beginning"/"center"/"end". with which point in the view's row should the WrapAround areas align? "beginning" by default.
    // 7. wrapAroundSpacing / wrapAroundSecondaryAxisSpacing: spacing between wrapAround areas on the same row, and spacing between rows. both are 0, by default.
    // 8. reorderableWrapAround: boolean. false, by default. If true, see API for ReorderableController
    // 
    // Inheriting classes may query wrapAroundNumRows: the context label of the actual number of rows required to wrap-around the wrapArounds os.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    WrapAroundController: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                reorderableWrapAround: false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                // default values:
                view: [me],
                beginningOfViewPoint: {
                    element: [{ view: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                centerOfViewPoint: {
                    element: [{ view: _ }, [me]],
                    type: [{ centerLength: _ }, [me]],
                    content: true
                },
                endOfViewPoint: {
                    element: [{ view: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                },
                wrapAroundSpacing: 0,
                wrapAroundSecondaryAxisSpacing: 0,
                wrapAroundStyle: "typewriter",
                wrapAroundAlignment: "beginning",

                wrapAroundNumRows: [size, [{ firstInRow: true }, [{ wrapArounds: _ }, [me]]]]
            }
        },
        {
            qualifier: { reorderableWrapAround: true },
            "class": "ReorderableController"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A horizontal version of the WrapAroundController
    // API: see WrapAroundController
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    HorizontalWrapAroundController: {
        "class": o("Horizontal", "WrapAroundController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // A vertical version of the WrapAroundController.
    // API: see WrapAroundController
    // 
    // Dev note: not yet tested.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    VerticalWrapAroundController: {
        "class": o("Vertical", "WrapAroundController")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides an area with the ability to be wrapped-around, as part of an os of WrapAround areas controlled by a WrapAroundController.
    // Implementation:
    // Each wrapAround area defines a pair of labels "virtualBeginning"/"virtualEnd". The first-in-row positions its virtualBeginning at the beginning of the view, and from there
    // each area positions its "myEndOnSameRowAsPrev" - a posPoint label indicating where its end would have been, had it been on the same row as the prev WrapAround in the os controlled 
    // by the WrapAroundController. if "myEndOnSameRowAsPrev" exceeds the end of the view, then that area is to be positioned on the next row; otherwise it will be positioned on the same
    // row as its prev. By definition, the first WrapAround in the os is a first in its row, and the last WrapAround in the os is the last in its row.
    // This algorithm determines which WrapAround areas belong on which row. Within a given row, the areas could be aligned with the view's beginning side, end side, or with its center 
    // (i.e. for a given row, the beginning of the first in row and the end of the last in row are of equal distance from the center of the view).
    //
    // Note: This class assumes the width of the associated view is not determined by the WrapAround areas (see bug #1684 for what happens when that assumption 
    // is violated)
    // 
    // API: 
    // 1. waController: areaReference to the wrapAroundController. [embedding], by default.
    // 2. the absolute position of the entire os on the secondary axis (the orthogonal axis to the wrapping around axis) should be provided by the inheriting class.
    // 3. If reorderableWrapAround is true, see API for the inherited VisReorderable.
    // 4. firstInRowOffsetFromView: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    WrapAround: o(
        { // variant-controller
            qualifier: "!",
            context: {
                horizontalWrap: [
                    "Horizontal",
                    [classOfArea, [{ waController: _ }, [me]]]
                ],
                wrapAroundStyle: [{ waController: { wrapAroundStyle: _ } }, [me]],
                wrapAroundAlignment: [{ waController: { wrapAroundAlignment: _ } }, [me]],

                firstOfWrapArounds: [{ firstInAreaOS: _ }, [me]],
                lastOfWrapArounds: [{ lastInAreaOS: _ }, [me]],
                reorderableWrapAround: [{ waController: { reorderableWrapAround: _ } }, [me]],
                firstInRowOffsetFromView: 0
            }
        },
        { // default
            "class": o("GeneralArea", "MemberOfAreaOS"),
            context: {
                waController: [embedding], // default value
                wrapAroundNumRows: [{ waController: { wrapAroundNumRows: _ } }, [me]],

                // MemberOfAreaOS param:
                areaOS: [{ waController: { wrapArounds: _ } }, [me]]
            },
            position: {
                labelVirtualBeginningAndEnd: {
                    pair1: {
                        point1: { label: "virtualBeginning" },
                        point2: { label: "virtualEnd" }
                    },
                    pair2: {
                        point1: [{ waLowHTMLLengthPosPoint: _ }, [me]],
                        point2: [{ waHighHTMLLengthPosPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                labelMyBeginningOnSameRowAsPrev: {
                    point1: {
                        element: [{ myPrevInAreaOS: _ }, [me]],
                        label: "virtualEnd"
                    },
                    point2: { label: "myBeginningOnSameRowAsPrev" },
                    equals: [{ waController: { wrapAroundSpacing: _ } }, [me]]
                },
                labelMyEndOnSameRowAsPrev: {
                    pair1: {
                        point1: { label: "myBeginningOnSameRowAsPrev" },
                        point2: { label: "myEndOnSameRowAsPrev" }
                    },
                    pair2: {
                        point1: [{ waLowHTMLLengthPosPoint: _ }, [me]],
                        point2: [{ waHighHTMLLengthPosPoint: _ }, [me]]
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { horizontalWrap: true },
            "class": "Horizontal"
        },
        {
            qualifier: { horizontalWrap: false },
            "class": "Vertical"
        },
        {
            qualifier: { reorderableWrapAround: false },
            context: {
                waLowHTMLLengthPosPoint: { element: [me], type: [{ lowHTMLLength: _ }, [me]] },
                waHighHTMLLengthPosPoint: { element: [me], type: [{ highHTMLLength: _ }, [me]] }
            }
        },
        {
            qualifier: { reorderableWrapAround: true },
            "class": "VisReorderable", // Horizontal/Vertical inherited via the horizontalWrap variants above.
            context: {
                waLowHTMLLengthPosPoint: [{ logicalBeginning: _ }, [me]], // see VisReorderable definitions for logicalBeginning/logicalEnd
                waHighHTMLLengthPosPoint: [{ logicalEnd: _ }, [me]]
            }
        },
        {
            qualifier: { firstOfWrapArounds: true },
            context: {
                firstInRow: true
            }
        },
        {
            qualifier: { firstOfWrapArounds: false },
            context: {
                firstInRow: [greaterThan,
                    [offset,
                        [{ waController: { endOfViewPoint: _ } }, [me]],
                        { label: "myEndOnSameRowAsPrev" }
                    ],
                    0
                ]
            }
        },
        {
            qualifier: { lastOfWrapArounds: true },
            context: {
                lastInRow: true
            }
        },
        {
            qualifier: { lastOfWrapArounds: false },
            context: {
                lastInRow: [{ myNextInAreaOS: { firstInRow: _ } }, [me]]
            }
        },
        {
            qualifier: { firstInRow: true },
            context: {
                firstInMyRow: [me]
            },
            position: {
                positionVirtualBeginningFIR: { // FIR - First In Row
                    point1: [{ waController: { beginningOfViewPoint: _ } }, [me]],
                    point2: { label: "virtualBeginning" },
                    equals: 0
                },
                secondaryAxisConstraint: {
                    point1: {
                        element: [{ myPrevInAreaOS: _ }, [me]],
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    point2: { type: [{ lowHTMLGirth: _ }, [me]] },
                    equals: [{ waController: { wrapAroundSecondaryAxisSpacing: _ } }, [me]]
                }
            }
        },
        {
            qualifier: { firstInRow: false },
            context: {
                firstInMyRow: [{ myPrevInAreaOS: { firstInMyRow: _ } }, [me]]
            },
            position: {
                positionVirtualBeginningNFIR: { // NFIR - Not First In Row
                    point1: {
                        element: [{ myPrevInAreaOS: _ }, [me]],
                        label: "virtualEnd"
                    },
                    point2: { label: "virtualBeginning" },
                    equals: [{ waController: { wrapAroundSpacing: _ } }, [me]]
                },
                primaryAxisConstraintNFIR: {
                    point1: [{ myPrevInAreaOS: { waHighHTMLLengthPosPoint: _ } }, [me]],
                    point2: [{ waLowHTMLLengthPosPoint: _ }, [me]],
                    equals: [{ waController: { wrapAroundSpacing: _ } }, [me]]
                },
                secondaryAxisConstraintNFIR: {
                    point1: {
                        element: [{ myPrevInAreaOS: _ }, [me]],
                        type: [{ myPrevInAreaOS: { lowHTMLGirth: _ } }, [me]]
                    },
                    point2: { type: [{ lowHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                firstInRow: true,
                wrapAroundAlignment: "beginning"
            },
            position: {
                primaryAxisConstraintFIRB: { // First In Row Beginning
                    point1: [{ waController: { beginningOfViewPoint: _ } }, [me]],
                    point2: [{ waLowHTMLLengthPosPoint: _ }, [me]],
                    equals: [{ firstInRowOffsetFromView: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                lastInRow: true,
                wrapAroundAlignment: "center"
            },
            position: {
                defineCenterOfElementsInRow: {
                    pair1: {
                        point1: [{ firstInMyRow: { waLowHTMLLengthPosPoint: _ } }, [me]],
                        point2: { label: "centerOfElementsInRow" }
                    },
                    pair2: {
                        point1: { label: "centerOfElementsInRow" },
                        point2: [{ waHighHTMLLengthPosPoint: _ }, [me]]
                    },
                    ratio: 1
                },
                primaryAxisConstraintLIRC: { // Last In Row Center
                    point1: [{ waController: { centerOfViewPoint: _ } }, [me]],
                    point2: { label: "centerOfElementsInRow" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                lastInRow: true,
                wrapAroundAlignment: "end"
            },
            position: {
                primaryAxisConstraintLIRE: {
                    point1: [{ waHighHTMLLengthPosPoint: _ }, [me]],
                    point2: [{ waController: { endOfViewPoint: _ } }, [me]],
                    equals: [{ firstInRowOffsetFromView: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scrollable WrapAround View - Beginning of Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. beginningOfDocPoint/endOfDocPoint: default provided
    // 2. attachScrollbarOn: default provided.
    // 3. centerWrapAroundDocInView: false, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalScrollableWrapAroundView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                centerWrapAroundDocInView: false
            }
        },
        { // default
            "class": "VerticalContMovableController",
            context: {
                myDoc: [
                    [embedded, [me]],
                    [areaOfClass, "VerticalScrollableWrapAroundDoc"]
                ],
                myScrollbar: [{ children: { scrollbar: _ } }, [me]],
                // VerticalContMovableController params
                beginningOfDocPoint: {
                    element: [{ myDoc: _ }, [me]],
                    type: "top"
                },
                endOfDocPoint: {
                    element: [{ myDoc: _ }, [me]],
                    type: "bottom"
                },
                attachScrollbarOn: "beginning"
            },
            children: {
                scrollbar: {
                    description: {
                        "class": "VerticalScrollableWrapAroundScrollbar"
                    }
                }
            }
        },
        {
            qualifier: { 
                centerWrapAroundDocInView: true,
                docLongerThanView: false 
            },
            context: {
                defaultAnchorDocToView: false // override MovableController default value
            },
            position: {
                verticallyCenterDocInMe: {
                    point1: { type: "vertical-center" },
                    point2: { element: [{ myDoc: _ }, [me]], type: "vertical-center" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalScrollableWrapAroundScrollbar: {
        "class": "VerticalScrollbarContainer",
        context: {
            movableController: [embedding],
            attachToView: [{ movableController: { attachScrollbarOn: _ } }, [me]],
            attachToViewOverlap: true,
            showOnlyWhenInView: true
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. wrapArounds: default provided. Inheriting class should typically embed an areaSet which inherits WrapAround!
    // 2. wrapAroundSpacing: default provided
    // 3. wrapAroundSecondaryAxisSpacing: default provided
    // 4. horizontalMarginFromView : default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalScrollableWrapAroundDoc: o(
        { // variant
            qualifier: "!",
            context: {
                scrollbarAttachToView: [{ myScrollbar: { attachToView: _ } }, [me]],
                docLongerThanView: [{ myView: { docLongerThanView: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "HorizontalWrapAroundController"),
            context: {
                myView: [
                    { myDoc: [me] },
                    [areaOfClass, "VerticalScrollableWrapAroundView"]
                ],
                myScrollbar: [{ myView: { myScrollbar: _ } }, [me]],
                horizontalMarginFromView: scrollbarPosConst.offsetBetweenDocAndScrollbar,
                horizontalMarginFromViewWithScrollbar: scrollbarPosConst.docOffsetAllowingForScrollbar,

                // HorizontalWrapAroundController params
                wrapArounds: [
                    [areaOfClass, "WrapAround"],
                    [embedded] // see RFC #61: i'm not sure the order of teh areaSet is guaranteed by this [embedded]
                ],
                wrapAroundSpacing: 0,
                wrapAroundSecondaryAxisSpacing: 0,

                // override MinWrapVertical param
                minWrapRefAreas: [{ wrapArounds: _ }, [me]]
            },
            position: {
                attachTopToTopOfFirst: {
                    point1: { type: "top" },
                    point2: {
                        element: [{ firstInAreaOS: true }, [{ wrapArounds: _ }, [me]]],
                        type: "top"
                    },
                    equals: [{ wrapAroundSecondaryAxisSpacing: _ }, [me]]
                },
                attachBottomToBottomOfLast: {
                    point1: {
                        element: [{ lastInAreaOS: true }, [{ wrapArounds: _ }, [me]]],
                        type: "bottom"
                    },
                    point2: { type: "bottom" },
                    equals: [{ wrapAroundSecondaryAxisSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { scrollbarAttachToView: "beginning" },
            position: {
                left: [{ horizontalMarginFromViewWithScrollbar: _ }, [me]],
                right: [{ horizontalMarginFromView: _ }, [me]]
            }
        },
        {
            qualifier: { scrollbarAttachToView: "end" },
            position: {
                left: [{ horizontalMarginFromView: _ }, [me]],
                right: [{ horizontalMarginFromViewWithScrollbar: _ }, [me]]
            }
        },
        {
            qualifier: { scrollbarAttachToView: false },
            position: {
                left: [{ horizontalMarginFromView: _ }, [me]],
                right: [{ horizontalMarginFromView: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scrollable WrapAround View - End of Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of library
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////       
};
