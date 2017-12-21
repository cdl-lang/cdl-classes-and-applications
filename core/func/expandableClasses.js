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
// expandable areas can be expanded in one or two dimensions.
// expandableZeroSum areas are part of an areaSet that's juxtapositioned. they can be expanded (zero sum between two adjacent areas) or coExpanded (zero sum between the prefix/suffix
// of expandableZeroSum areas that appear before/after the handle that marks the zeroSum point.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting area to be expanded in two dimensions, by dragging one of its corners. 
    // It starts out as wide/high as its initialBottomRightWidth/initialBottomRightHeight, and its width/height can be modified by dragging the handle area in the appropriate corner.
    // This class is inherited by 1D and 2D expansion classes.
    //
    // In Expandable, there is only the notion of expansion, and not of coExpansion (introduced in the inheriting ExpandableZeroSum class). 
    // expandableBeingModified is the flag that indicates whether an area is either expanding:true or coExpanding:true.
    //
    // API:
    // 1. verticalExpansion / horizontalExpansion: booleans indicating whether vertical/horizontal expansion is allowed. true, by default.
    // 2. initialExpandableHeight/initialExpandableWidth: the initial height/width.
    // 3. doubleClickExpandableHeight/doubleClickExpandableWidth: the values set to the appData on doubleClick.
    //    default values provided (initialExpandableHeight/initialExpandableWidth).
    // 4. defaultHandle: a boolean, which determines whether the inheriting classes provide a default handle or not. true, by default. if false, the inheriting area should provide:
    //    myExpansionHandle: an areaRef to its handle. the handle area should inherit ExpansionHandle. 
    // 5. handleVisibilityEnabled: boolean, true by default. this is a flag that determines whether the expansion handle will have positive dimensions, so that it can receive 
    //    a mouseDown.
    // 6. calculateExpansionOnDoubleClick: boolean, true by default. 
    //    in ExpandableZeroSum, for example, it is set to false (as resetting there is not well-defined, once we resize more than two areas).
    // 7. independentExpandable: boolean, true by default. Does this class depend on its writable references (^stableExpandableHeight/^stableExpandableWidth) 
    //    to define the expansion length-axis dimension when { expandableBeingModified: false }. 
    //    If independentExpandable:true
    //    stableExpandableHeight/stableExpandableWidth (and stableExpandableLength, which points to the active one of the two, in a 1D Expandable area) 
    //    are defined as writable references (as well as the standard associated appData).
    //    If independentExpandable:false
    //    Inheriting class should map these context labels to some other appData (one example: the DependentPieBar, which inherits ExpandableZeroSum, and 
    //    is dependent upon values stored in the PortfolioController).
    // 8. lengthAxisHandleAnchor: a posPoint relative to which the handle will attach itself on the expansion axis
    //    lowHTMLGirthHandleAnchor/highHTMLGirthHandleAnchor.
    //    default value provided. remember to use atomic() when overriding the default values, as they are objects!
    // 9. applyStableExpandableDimension: boolean, true by default. If true, applies the stableExpandableHeight/stableExpandableWidth to the corresponding
    //    dimension of Expandable (width/height). If false, inheriting class is left to make use of stableExpandableHeight/stableExpandableHWidth
    // 10. stableExpandableIsMin: is the stableExpandableHeight/stableExpandableWidth set as the actual offset between the relevant expansion posPoints, or the 
    //     minimum offset between them. default: false.
    //     Example: in the NonOMFacet we inherit Expandable. The facet has other elements embedded in it that need to fit in, and so this offset should
    //     be 'min', not 'equals'
    // 11. allowHorizontalManualResize: true by default
    // 12. allowVericalManualResize: true by default
    // 13. handleDraggingPriority: default provided. Inheriting classes may want to override (see TrashTabView, for example)
    // 14. expansionIndicatorShowable: boolean, true by default.
    // 15. expandableHeightConstraintPriority: weakerThanDefault by default.
    // 16. expandableWidthConstraintPriority: weakerThanDefault by default.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Expandable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultHandle: true,
                applyStableExpandableDimension: true,
                expanding: [{ myExpansionHandle: { tmd: _ } }, [me]],
                expandableBeingModified: [{ expanding: _ }, [me]],

                expansionAxesDefined: o(
                    [{ verticalExpansion: _ }, [me]],
                    [{ horizontalExpansion: _ }, [me]]
                ),
                hoveringOverExpansionHandle: [
                    {
                        inArea: _,
                        myExpandable: [me]
                    },
                    [areaOfClass, "ExpansionHandle"]
                ],

                verticalExpansion: true,
                horizontalExpansion: true,

                independentExpandable: true,
                calculateExpansionOnDoubleClick: true,
                stableExpandableIsMin: false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                handleVisibilityEnabled: true,
                allowHorizontalManualResize: true,
                allowVerticalManualResize: true,

                // lengthAxisHandleAnchor: defined in inheriting classes
                lowHTMLGirthHandleAnchor: {
                    element: [me],
                    type: [{ lowHTMLGirth: _ }, [me]]
                },
                highHTMLGirthHandleAnchor: {
                    element: [me],
                    type: [{ highHTMLGirth: _ }, [me]]
                },

                handleDraggingPriority: positioningPrioritiesConstants.strongerThanDefaultPressure, // to overcome MinWrap that it may encounter
                expansionIndicatorShowable: true
            }
        },
        {
            qualifier: { verticalExpansion: true },
            "class": "CurrentExpansionHeight",
            context: {
                "^userExpandedVerticallyAD": o(),
                "^userDoubleClickedVerticallyAD": o(),
                userExpandedVertically: [mergeWrite,
                    [{ userExpandedVerticallyAD: _ }, [me]],
                    false
                ],
                userDoubleClickedVertically: [mergeWrite,
                    [{ userDoubleClickedVerticallyAD: _ }, [me]],
                    false
                ]
            },
            position: {
                positiveExpandableHeightDimension: {
                    point1: [{ topExpansionPosPoint: _ }, [me]],
                    point2: [{ bottomExpansionPosPoint: _ }, [me]],
                    min: 0
                }
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                independentExpandable: true
            },
            context: {
                "^stableExpandableHeightAD": o(),
                stableExpandableHeight: [mergeWrite,
                    [{ stableExpandableHeightAD: _ }, [me]],
                    [{ initialExpandableHeight: _ }, [me]]
                ],

                doubleClickExpandableHeight: [{ initialExpandableHeight: _ }, [me]]
            }
        },
        {
            qualifier: { horizontalExpansion: true },
            "class": "CurrentExpansionWidth",
            context: {
                "^userExpandedHorizontallyAD": o(),
                "^userDoubleClickedHorizontallyAD": o(),

                userExpandedHorizontally: [mergeWrite,
                    [{ userExpandedHorizontallyAD: _ }, [me]],
                    false
                ],
                userDoubleClickedHorizontally: [mergeWrite,
                    [{ userDoubleClickedHorizontallyAD: _ }, [me]],
                    false
                ]

            },
            position: {
                positiveExpandableWidthDimension: {
                    point1: [{ leftExpansionPosPoint: _ }, [me]],
                    point2: [{ rightExpansionPosPoint: _ }, [me]],
                    min: 0
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                independentExpandable: true
            },
            context: {
                "^stableExpandableWidthAD": o(),
                stableExpandableWidth: [mergeWrite,
                    [{ stableExpandableWidthAD: _ }, [me]],
                    [{ initialExpandableWidth: _ }, [me]]
                ],

                doubleClickExpandableWidth: [{ initialExpandableWidth: _ }, [me]]
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                expandableBeingModified: false
            },
            context: {
                defaultExpandableHeight: [{ initialExpandableHeight: _ }, [me]],
                expandableHeightConstraintPriority: positioningPrioritiesConstants.weakerThanDefault,
                verticalExpansionOffset: [cond,
                    [{ userExpandedVertically: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [cond,
                                [{ userDoubleClickedVertically: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [{ doubleClickExpandableHeight: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [{ defaultExpandableHeight: _ }, [me]]
                                    }
                                )
                            ]
                        },
                        {
                            on: true,
                            use: [{ stableExpandableHeight: _ }, [me]]
                        }
                    )
                ]
            },
            position: {
                expandableHeightConstraint: {
                    point1: [{ topExpansionPosPoint: _ }, [me]],
                    point2: [{ bottomExpansionPosPoint: _ }, [me]],
                    // see variants below 
                    priority: [{ expandableHeightConstraintPriority: _ }, [me]]                    
                }
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                expandableBeingModified: false,
                stableExpandableIsMin: true
            },
            position: {
                expandableHeightConstraint: {
                    // see variant above for the rest of the constraint's definition
                    min: [{ verticalExpansionOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                expandableBeingModified: false,
                stableExpandableIsMin: false
            },
            position: {
                expandableHeightConstraint: {
                    // see variant above for the rest of the constraint's definition
                    equals: [{ verticalExpansionOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                expandableBeingModified: false
            },
            context: {
                defaultExpandableWidth: [{ initialExpandableWidth: _ }, [me]],
                expandableWidthConstraintPriority: positioningPrioritiesConstants.weakerThanDefault,
                horizontalExpansionOffset: [cond,
                    [{ userExpandedHorizontally: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [cond,
                                [{ userDoubleClickedHorizontally: _ }, [me]],
                                o(
                                    {
                                        on: true,
                                        use: [{ doubleClickExpandableWidth: _ }, [me]]
                                    },
                                    {
                                        on: false,
                                        use: [{ defaultExpandableWidth: _ }, [me]]
                                    }
                                )
                            ]
                        },
                        {
                            on: true,
                            use: [{ stableExpandableWidth: _ }, [me]]
                        }
                    )
                ]
            },
            position: {
                expandableWidthConstraint: {
                    point1: [{ leftExpansionPosPoint: _ }, [me]],
                    point2: [{ rightExpansionPosPoint: _ }, [me]],
                    // see variants below 
                    priority: [{ expandableWidthConstraintPriority: _ }, [me]]                    
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                expandableBeingModified: false,
                stableExpandableIsMin: true
            },
            position: {
                expandableWidthConstraint: {
                    // see variant above for the rest of the constraint's definition
                    min: [{ horizontalExpansionOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                expandableBeingModified: false,
                stableExpandableIsMin: false
            },
            position: {
                expandableWidthConstraint: {
                    // see variant above for the rest of the constraint's definition
                    equals: [{ horizontalExpansionOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                expansionAxesDefined: true,
                independentExpandable: true,
                calculateExpansionOnDoubleClick: true,
                expandableBeingModified: true
            },
            write: {
                onExpandableMouseUp: {
                    // since we're in the { calculateExpansionOnDoubleClick: true } variant, we need to check this is NOT a double-click (which is handled by the ExpansionHandle).
                    "class": "OnMouseUpNotMouseClick"
                    //true: see other variants
                }
            }
        },
        {
            qualifier: {
                expansionAxesDefined: true,
                independentExpandable: true,
                calculateExpansionOnDoubleClick: false,
                expandableBeingModified: true
            },
            write: {
                onExpandableMouseUp: {
                    "class": "OnAnyMouseUp"
                    // true: see other variants
                }
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                independentExpandable: true,
                expandableBeingModified: true
            },
            context: {
                currentExpansionHeightForAppData: [{ currentExpansionHeight: _ }, [me]]
            },
            write: {
                onExpandableMouseUp: {
                    // upon defined in { expansionAxesDefined: true } variant above
                    true: {
                        raiseUserExpandedVerticallyFlag: {
                            to: [{ userExpandedVertically: _ }, [me]],
                            merge: true
                        },
                        lowerDoubleClickExpandableHeightFlag: { // may not have been raised..
                            to: [{ userDoubleClickedVertically: _ }, [me]],
                            merge: false
                        },
                        recordHeight: {
                            to: [{ stableExpandableHeight: _ }, [me]],
                            merge: [{ currentExpansionHeightForAppData: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                independentExpandable: true,
                expandableBeingModified: true
            },
            context: {
                currentExpansionWidthForAppData: [{ currentExpansionWidth: _ }, [me]]
            },
            write: {
                onExpandableMouseUp: {
                    // upon defined in { expansionAxesDefined: true } variant above
                    true: {
                        raiseUserExpandedHorizontallyFlag: {
                            to: [{ userExpandedHorizontally: _ }, [me]],
                            merge: true
                        },
                        lowerDoubleClickExpandableWidthFlag: { // may not have been raised..
                            to: [{ userDoubleClickedHorizontally: _ }, [me]],
                            merge: false
                        },
                        recordWidth: {
                            to: [{ stableExpandableWidth: _ }, [me]],
                            merge: [{ currentExpansionWidthForAppData: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. topExpansionPosPoint / bottomExpansionPosPoint: default value provided. Reminder: if overriding these, use atomic()
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CurrentExpansionHeight: {
        context: {
            topExpansionPosPoint: { type: "top", content: true },
            bottomExpansionPosPoint: { type: "bottom", content: true },
            currentExpansionHeight: [offset, [{ topExpansionPosPoint: _ }, [me]], [{ bottomExpansionPosPoint: _ }, [me]]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. leftExpansionPosPoint / rightExpansionPosPoint: default value provided. Reminder: if overriding these, use atomic()
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CurrentExpansionWidth: {
        context: {
            leftExpansionPosPoint: { type: "left", content: true },
            rightExpansionPosPoint: { type: "right", content: true },
            currentExpansionWidth: [offset, [{ leftExpansionPosPoint: _ }, [me]], [{ rightExpansionPosPoint: _ }, [me]]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class serves as the handle for an Expandable area, and allows to expand it.
    // It is inherited by ExpansionHandle1D and ExpansionHandle2D.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionHandle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                verticalExpansion: [{ myExpandable: { verticalExpansion: _ } }, [me]],
                horizontalExpansion: [{ myExpandable: { horizontalExpansion: _ } }, [me]],
                expansionAxesDefined: [{ myExpandable: { expansionAxesDefined: _ } }, [me]], // is either one of the axes defined?
                calculateExpansionOnDoubleClick: [{ myExpandable: { calculateExpansionOnDoubleClick: _ } }, [me]],

                handleVisibilityEnabled: [{ myExpandable: { handleVisibilityEnabled: _ } }, [me]],
                makeVisible: [and,
                    [{ handleVisibilityEnabled: _ }, [me]],
                    [{ delayedInFocus: _ }, [me]]
                ],

                allowHorizontalManualResize: [{ myExpandable: { allowHorizontalManualResize: _ } }, [me]],
                allowVerticalManualResize: [{ myExpandable: { allowHorizontalManualResize: _ } }, [me]],
                allowManualResize: o(
                    [and,
                        [{ verticalExpansion: _ }, [me]],
                        [{ allowVerticalManualResize: _ }, [me]]
                    ],
                    [and,
                        [{ horizontalExpansion: _ }, [me]],
                        [{ allowHorizontalManualResize: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("BlockMouseEvent", "DelayedInArea"),
            context: {
                myExpandable: [
                    { myExpansionHandle: [me] },
                    [areaOfClass, "Expandable"]
                ]
            },
            display: {
                pointerOpaque: true
            }
        },
        {
            qualifier: { allowManualResize: true },
            "class": o("DraggableWeakMouseAttachment"),
            context: {
                // DraggableWeakMouseAttachment param
                draggingPriority: [{ myExpandable: { handleDraggingPriority: _ } }, [me]]
            }
        },
        {
            qualifier: {
                expansionAxesDefined: true,
                calculateExpansionOnDoubleClick: true
            },
            write: {
                onExpansionHandleDoubleClick: { // the doubleClick is handled here - the single click is handled in Expandable!
                    "class": "OnMouseDoubleClick"
                    // true: see additional actions in variants below
                }
            }
        },
        {
            qualifier: {
                verticalExpansion: true,
                calculateExpansionOnDoubleClick: true
            },
            write: {
                onExpansionHandleDoubleClick: {
                    // upon: see { expansionAxesDefined: true } variant above
                    true: {
                        raiseDoubleClickExpandableHeightFlag: {
                            to: [{ myExpandable: { userDoubleClickedVertically: _ } }, [me]],
                            merge: true
                        },
                        lowerUserExpandedVerticallyFlag: { // it may not have been raised
                            to: [{ myExpandable: { userExpandedVertically: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                horizontalExpansion: true,
                calculateExpansionOnDoubleClick: true
            },
            write: {
                onExpansionHandleDoubleClick: {
                    // upon: see { expansionAxesDefined: true } variant above
                    true: {
                        raiseDoubleClickExpandableWidthFlag: {
                            to: [{ myExpandable: { userDoubleClickedHorizontally: _ } }, [me]],
                            merge: true
                        },
                        lowerUserExpandedHorizontallyFlag: { // it may not have been raised
                            to: [{ myExpandable: { userExpandedHorizontally: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Expandable 1D-specific Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows expansion of the inheriting area's width by dragging its left side.    
    // API: See ExpandableHorizontal
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableLeft: {
        "class": o("ExpandableHorizontal"),
        context: {
            // ExpansionHandle1D param 
            expandableSide: [{ leftExpansionPosPoint: _ }, [me]],
            lengthAxisHandleAnchor: {
                element: [me],
                type: [{ lowHTMLLength: _ }, [me]],
                content: true
            },
            oppositeExpandableSide: [{ rightExpansionPosPoint: _ }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows expansion of the inheriting area's width by dragging its right side.    
    // API: See ExpandableHorizontal
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableRight: {
        "class": o("ExpandableHorizontal"),
        context: {
            // ExpansionHandle1D param
            expandableSide: [{ rightExpansionPosPoint: _ }, [me]],
            lengthAxisHandleAnchor: {
                element: [me],
                type: [{ highHTMLLength: _ }, [me]],
                content: true
            },
            oppositeExpandableSide: [{ leftExpansionPosPoint: _ }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits Expandable1D, and limits it to the horizontal axis. It is inherited by ExpandableRight/ExpandableLeft.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableHorizontal: {
        "class": o("Expandable1D", "Horizontal"),
        context: {
            // Expandable1D params:
            verticalExpansion: false // override default value provided by Expandable
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows expansion of the inheriting area's width by dragging its top side.    
    // API: See ExpandableVertical
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableTop: {
        "class": o("ExpandableVertical"),
        context: {
            // ExpansionHandle1D param
            expandableSide: [{ topExpansionPosPoint: _ }, [me]],
            lengthAxisHandleAnchor: {
                element: [me],
                type: [{ lowHTMLLength: _ }, [me]],
                content: true
            },
            oppositeExpandableSide: [{ bottomExpansionPosPoint: _ }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows expansion of the inheriting area's width by dragging its bottom side.
    // API: See ExpandableVertical
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableBottom: {
        "class": o("ExpandableVertical"),
        context: {
            // ExpansionHandle1D param
            expandableSide: [{ bottomExpansionPosPoint: _ }, [me]],
            lengthAxisHandleAnchor: {
                element: [me],
                type: [{ highHTMLLength: _ }, [me]],
                content: true
            },
            oppositeExpandableSide: [{ topExpansionPosPoint: _ }, [me]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits Expandable1D, and limits it to the vertical axis. It is inherited by ExpandableTop/ExpandableBottom.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableVertical: {
        "class": o("Expandable1D", "Vertical"),
        context: {
            // Expandable1D params:
            horizontalExpansion: false // override default value provided by Expandable
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits Expandable. 
    // Terminology: 'length' is the name we assign to the expansion axis, which could be either the area's height or width.
    // This class limits the inheriting area to a min of 0 on its length axis. 
    // During an expansion operation, it also stabilizes the offset between the side opposite the side being expanded, and the App. For example, if we expand an area to the right, 
    // this class stabilizes the offset between this area's left and the app's left. This ensures that the expansion does not result in MinWrap constraints in the interval between 
    // those two points being violated instead of the MinWrap we want to cave in to the expansion operation. 
    // For example, if we expand a facet's histogram, we want this facet to expand, and not to have any of the facets to its left expand instead of it.
    //
    // API:
    // 1. defaultHandle: true, by default.
    // 2. expandableSide: posPoint of the side being expanded (topExpansionPosPoint/bottomExpansionPosPoint/leftExpansionPosPoint/rightExpansionPosPoint).
    //    oppositeExpandableSide: posPoint of the side opposite the expandableSide.
    // 3. handleLengthDimension: default provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Expandable1D: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultHandle: true
            }
        },
        { // default
            "class": "Expandable",
            context: {
                myExpansionHandle: [{ children: { expansionHandle1D: _ } }, [me]],
                handleLengthDimension: generalPosConst.expansionHandle1DLength
            }
        },
        {
            qualifier: { expandableBeingModified: true },
            position: {
                stabilizeOffsetBetweenMyOppositeSideAndTheAppOppositeSide: {
                    point1: [merge,
                        { element: [{ myApp: _ }, [me]] }, // override the element definition of oppositeExpandableSide
                        [{ oppositeExpandableSide: _ }, [me]]
                    ],
                    point2: [{ oppositeExpandableSide: _ }, [me]],
                    // default priority
                    stability: true
                }
            }
        },
        {
            qualifier: { defaultHandle: true },
            "class": "EmbedExpansionHandle1D"
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherited by Expandable1D, but can also be inherited by other classes, when Expandable1D's instane has defaultHandle:false 
    // (e.g. the Amoeba inherits this class as it)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbedExpansionHandle1D: {
        children: {
            expansionHandle1D: {
                partner: [embedding], // to ensure that the ExpansionHandle1D, which is embedded in the referredOf, is truncated when the Expandable
                // area is scrolled out of view.
                description: {
                    "class": "ExpansionHandle1D"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The expansion handle for an Expandable1D. 
    // This class is inherited by the Expandable1D when { defaultHandle: true } and by the ExpansionZeroSumHandle. 
    // Other classes may inherit it, and create their own version of a handle.
    // API:
    // 1. anchorForLowHTMLGirth / anchorForHighHTMLGirth
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionHandle1D: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showIndicator: [and,
                    [{ myAnchor: { expansionIndicatorShowable: _ } }, [me]],
                    [{ makeVisible: true }, [me]],
                    o(
                        [and,
                            [{ verticalExpansion: _ }, [me]],
                            [{ allowVerticalManualResize: _ }, [me]]
                        ],
                        [and,
                            [{ horizontalExpansion: _ }, [me]],
                            [{ allowHorizontalManualResize: _ }, [me]]
                        ]
                    )
                ]
            }
        },
        { // default            
            "class": o("ExpansionHandle", "Icon"),
            context: {
                myAnchor: [{ myExpandable: _ }, [me]],
                confineIconToArea: false, // override default Icon value
                anchorForLowHTMLGirth: [{ myAnchor: { lowHTMLGirthHandleAnchor: _ } }, [me]],
                anchorForHighHTMLGirth: [{ myAnchor: { highHTMLGirthHandleAnchor: _ } }, [me]]
            },
            stacking: {
                aboveMyExpandable: {
                    higher: [me],
                    lower: [{ myAnchor: _ }, [me]]
                }
            },
            position: {
                attachToMyAnchorExpandableSide: {
                    point1: { type: [{ centerLength: _ }, [me]] },
                    point2: [{ myAnchor: { lengthAxisHandleAnchor: _ } }, [me]],
                    equals: 0
                },
                attachToMyAnchorLowHTMLGirth: {
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: [{ anchorForLowHTMLGirth: _ }, [me]],
                    equals: 0
                },
                attachToMyAnchorHighHTMLGirth: {
                    point1: [{ anchorForHighHTMLGirth: _ }, [me]],
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                },
                beginningToEndConstraint: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    equals: [cond,
                        [{ handleVisibilityEnabled: _ }, [me]],
                        o({ on: true, use: [{ myAnchor: { handleLengthDimension: _ } }, [me]] },
                            { on: false, use: 0 })
                    ]
                }
            }
        },
        {
            qualifier: { verticalExpansion: true },
            "class": "Vertical"
        },
        {
            qualifier: { horizontalExpansion: true },
            "class": "Horizontal"
        },
        {
            qualifier: { verticalExpansion: true, allowVerticalManualResize: true },
            "class": "ModifyPointerVerticalResize",
            context: {
                delayPointerModification: true
            }
        },
        {
            qualifier: { horizontalExpansion: true, allowHorizontalManualResize: true },
            "class": "ModifyPointerHorizontalResize",
            context: {
                delayPointerModification: true
            }
        },
        {
            qualifier: { showIndicator: true },
            children: {
                indicator: {
                    description: {
                        "class": "ExpansionHandle1DIndicator"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionHandle1DIndicator: {
        "class": o("BackgroundColor", "GeneralArea"),
        context: {
            myHandle: [embedding],
            backgroundColor: "#BCBCBC"
        },
        position: {
            attachToMyHandleLowHTMLGirth: {
                point1: {
                    element: [{ myHandle: _ }, [me]],
                    type: [{ lowHTMLGirth: _ }, [embedding]]
                },
                point2: { type: [{ lowHTMLGirth: _ }, [embedding]] },
                equals: 0
            },
            attachToMyHandleHighHTMLGirth: {
                point1: { element: [{ myHandle: _ }, [me]], type: [{ highHTMLGirth: _ }, [embedding]] },
                point2: { type: [{ highHTMLGirth: _ }, [embedding]] },
                equals: 0
            },
            indicatorBody: {
                point1: { type: [{ lowHTMLLength: _ }, [embedding]] },
                point2: { type: [{ highHTMLLength: _ }, [embedding]] },
                equals: 1
            },
            centerAlongExpandableLengthAxis: {
                point1: { element: [{ myHandle: _ }, [me]], type: [{ centerLength: _ }, [embedding]] },
                point2: { type: [{ centerLength: _ }, [embedding]] },
                equals: 0
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows an areaSet of ExpandableZeroSum, which are juxtapositioned along a single axis, to be either expanded (the expanded area at the expense of its neighbor on the 
    // other side of the expansionHandle), or coExpanded (all Expandables on one side of the expansion handle, at the expense of all those on its other side).
    // In order to allow coExpanding, the controller needs to be in its coExpandable state. coExpandable is set to true when double-clicking on an expandableHandle of an ExpandableZeroSum
    // area.
    // This class is inherited by two axis-specific classes (VerticalExpandableZeroSumController/HorizontalExpandableZeroSumController), and can be inherited directly 
    // (see PieController, which in turn is inherited by axis-specific classes).
    //
    // API: 
    // 1. expandables: an os of areaRefs inheriting ExpandableZeroSum. Used for positioning along the expansion axis.
    // 2. independentExpandable: will its expandables be independentExpandable or not. true, by default.
    //
    // for general use:
    // 1. zsControllerBeingModified: true when this controller's expandables are being resized or coResized (used, for example, by PortfolioController).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableZeroSumController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                coExpandable: [{ coExpandableHandle: _ }, [me]],
                coExpanding: [{ coExpandableHandle: { tmd: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                independentExpandable: true, // queried by expandables, the associated os of Expandables.

                lengthOfExpandableZeroSumController: [offset,
                    { type: [{ lowHTMLLength: _ }, [me]] },
                    { type: [{ highHTMLLength: _ }, [me]] }
                ],
                coExpandableHandle: [
                    { coExpandable: true },
                    [{ expandables: { myExpansionHandle: _ } }, [me]]
                ],
                zsControllerBeingModified: [{ expandables: { expandableBeingModified: _ } }, [me]]
            }
        },
        {
            qualifier: { coExpandable: true },
            context: {
                "^coExpansionPrefixInitialLength": 0,
                coExpansionSuffixInitialLength: [minus,
                    [{ lengthOfExpandableZeroSumController: _ }, [me]],
                    [{ coExpansionPrefixInitialLength: _ }, [me]]
                ],

                coExpandableHandleExpandable: [
                    { myExpansionHandle: { coExpandable: true } },
                    [{ expandables: _ }, [me]]
                ],

                coExpansionPoint: {
                    element: [{ coExpandableHandleExpandable: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]]
                },

                expandablesInCoExpansionPrefix: [prevPlus,
                    [{ expandables: _ }, [me]],
                    [{ coExpandableHandleExpandable: _ }, [me]]
                ],
                expandablesInCoExpansionSuffix: [nextStar,
                    [{ expandables: _ }, [me]],
                    [{ coExpandableHandleExpandable: _ }, [me]]
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    VerticalExpandableZeroSumController: {
        "class": o("Vertical", "ExpandableZeroSumController")
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    HorizontalExpandableZeroSumController: {
        "class": o("Horizontal", "ExpandableZeroSumController")
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An expandable 1D area in an os of such areas, where the expansion of one area comes at the expense of another.
    // An ExpandableZeroSum can either be expanded (at the expense of its immediate neighbour on the other side of the expandableHandle being dragged), 
    // or coExpanded (all ExpandableZeroSums on one side of the expandableHandle being dragged, at the expense of the rest of the ExpandableZeroSum areas of the areaSet, which are on the
    // other side of the expandableHandle being dragged).
    // 
    // API:
    // 1. myExpandableZeroSumController: areaRef to a class that inherits ExpandableZeroSumController. [embedding], by default.
    //    The inheriting class should give the entire areaSet an absolute position, and dimensions along the non-expansion axis.
    // 2. Inheriting classes may make use of firstExpandableZeroSum/lastExpandableZeroSum for design/positioning purposes.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableZeroSum: o(
        { // variant-qualifier
            qualifier: "!",
            context: {
                independentExpandable: [{ myExpandableZeroSumController: { independentExpandable: _ } }, [me]],

                // we assign values to verticalExpansion, based on our controller's axis of choice.
                verticalExpansion: [
                    "Vertical",
                    [classOfArea, [{ myExpandableZeroSumController: _ }, [me]]]
                ],
                horizontalExpansion: [not, [{ verticalExpansion: _ }, [me]]],

                firstExpandableZeroSum: [{ firstInAreaOS: _ }, [me]],
                lastExpandableZeroSum: [{ lastInAreaOS: _ }, [me]],

                expanding: [and,
                    [not, [{ myExpandableZeroSumController: { coExpanding: _ } }, [me]]],
                    o(
                        [{ myExpansionHandle: { tmd: _ } }, [me]],
                        [{ myExpansionHandle: { tmd: _ } }, [next, [me]]]
                    )
                ],

                coExpandable: [{ myExpandableZeroSumController: { coExpandable: _ } }, [me]],
                inCoExpansionPrefix: [
                    [me],
                    [{ myExpandableZeroSumController: { expandablesInCoExpansionPrefix: _ } }, [me]]
                ],
                inCoExpansionSuffix: [
                    [me],
                    [{ myExpandableZeroSumController: { expandablesInCoExpansionSuffix: _ } }, [me]]
                ],
                coExpanding: [{ myExpandableZeroSumController: { coExpanding: _ } }, [me]],

                expandableBeingModified: o( // overriding the default definition provided by Expandable
                    [{ expanding: _ }, [me]],
                    [{ coExpanding: _ }, [me]]
                ),

                // assignments to override default values inherited in the variants below from Expandable: 
                // note we do this in the variant-qualifier and not in the default clause: had we done it in the default clause, the values provided in the variants below would have
                // prevailed.               
                defaultHandle: false, // instead of the defaultHandle, provided by Expandable1D, we provide below the designated handle for an ExpandableZeroSum.
                calculateExpansionOnDoubleClick: false // override the default value provided by Expandable
            }
        },
        { // default
            "class": "MemberOfPositionedAreaOS",
            context: {
                expandables: [{ myExpandableZeroSumController: { expandables: _ } }, [me]],
                myExpansionHandle: [{ children: { expansionZeroSumHandle: _ } }, [me]],

                myExpandableZeroSumController: [embedding] // default
            },
            children: {
                expansionZeroSumHandle: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ExpansionZeroSumHandle"
                    }
                }
            },
            position: {
                attachExpandableZSLowHTMLGirthSide: {
                    point1: {
                        element: [{ myExpandableZeroSumController: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                },
                attachExpandableZSHighHTMLGirthSide: {
                    point1: {
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        element: [{ myExpandableZeroSumController: _ }, [me]],
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { verticalExpansion: true },
            "class": "ExpandableTop",
            context: {
                stableExpandableLength: [{ stableExpandableHeight: _ }, [me]],
                currentExpansionLength: [{ currentExpansionHeight: _ }, [me]]
            }
        },
        {
            qualifier: { verticalExpansion: false },
            "class": "ExpandableLeft",
            context: {
                stableExpandableLength: [{ stableExpandableWidth: _ }, [me]],
                currentExpansionLength: [{ currentExpansionWidth: _ }, [me]]
            }
        },
        {
            qualifier: { firstExpandableZeroSum: true },
            context: {
                handleVisibilityEnabled: false
            },
            position: {
                attachExpandableZSToEmbeddingOnLengthAxis: {
                    point1: {
                        element: [{ myExpandableZeroSumController: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { lastExpandableZeroSum: true },
            position: {
                attachExpandableZSToEmbeddingOnLengthAxis: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ myExpandableZeroSumController: _ }, [me]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        // variants to handle expandables being coExpanded      
        {
            qualifier: { coExpandable: true },
            context: {
                "^ratioOfCoExpansionInitialLengths": 0
            },
            write: {
                // on the beginning of a coExpanding operation, record the ratio of the length of the coExpanded expandable to the length of the segment it pertains to (prefix or suffix). 
                // this ratio is to be maintained throughout the coExpanding operation (see constraint in the { coExpanding: true } qualifier below).
                onStartCoExpanding: {
                    upon: [{ coExpanding: _ }, [me]]
                    // true - see Prefix/Suffix variants below
                }
            }
        },
        {
            qualifier: {
                coExpandable: true,
                inCoExpansionPrefix: true
            },
            write: {
                onStartCoExpanding: {
                    //upon: in variant above
                    true: {
                        recordRatioOfCoExpandingLengths: {
                            to: [{ ratioOfCoExpansionInitialLengths: _ }, [me]],
                            merge: [div,
                                [{ currentExpansionLength: _ }, [me]],
                                [{ coExpansionPrefixInitialLength: _ }, [embedding]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                coExpandable: true,
                inCoExpansionSuffix: true
            },
            write: {
                onStartCoExpanding: {
                    //upon: in variant above
                    true: {
                        recordRatioOfCoExpandingLengths: {
                            to: [{ ratioOfCoExpansionInitialLengths: _ }, [me]],
                            merge: [div,
                                [{ currentExpansionLength: _ }, [me]],
                                [{ coExpansionSuffixInitialLength: _ }, [embedding]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { coExpanding: true },
            position: {
                // maintain the ratio of my length to that of my coExpanding segment's length during the coExpanding operation - based on the initial ratio recorded at mouseDown.
                expansionAxisLengthConstraint: {
                    pair1: {
                        // these two points are defined in the two following variants, depending on the PieSlice's membership in the prefix/suffix segments.
                        point1: [{ beginningOfMyCoExpansionSegment: _ }, [me]],
                        point2: [{ endOfMyCoExpansionSegment: _ }, [me]]
                    },
                    pair2: {
                        point1: {
                            type: [{ lowHTMLLength: _ }, [me]]
                        },
                        point2: {
                            type: [{ highHTMLLength: _ }, [me]]
                        }
                    },
                    ratio: [{ ratioOfCoExpansionInitialLengths: _ }, [me]] // ratio of my length to length of my coExpansion segment, as recorded on mouseDown. 
                }
            }
        },
        {
            qualifier: {
                coExpanding: true,
                inCoExpansionPrefix: true
            },
            context: {
                beginningOfMyCoExpansionSegment: {
                    element: [{ myExpandableZeroSumController: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                endOfMyCoExpansionSegment: [{ myExpandableZeroSumController: { coExpansionPoint: _ } }, [me]]
            }
        },
        {
            qualifier: {
                coExpanding: true,
                inCoExpansionSuffix: true
            },
            context: {
                beginningOfMyCoExpansionSegment: [{ myExpandableZeroSumController: { coExpansionPoint: _ } }, [me]],
                endOfMyCoExpansionSegment: {
                    element: [{ myExpandableZeroSumController: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]]
                }
            }
        },
        {
            qualifier: { expandableBeingModified: true },
            context: {
                // this is the ratio of the current length of the expandable, to its stable length (i.e. before the mouseDown). also referenced by PortfolioItem.
                currentExpansionFactor: [div,
                    [{ currentExpansionLength: _ }, [me]],
                    [{ stableExpandableLength: _ }, [me]]
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is an intersection between an ExpandableZeroSum and the IconEmbedding area (ScreenArea). it allows expanding/coExpanding of ExpandableZeroSum areas.
    // It inherits ExpansionHandle1D to allow the expanding to take place.
    // This class maintains a state, coExpandable, which indicates whether dragging of this area will amount to expanding of the two Expandables on either side of it (i.e. expanding), 
    // or of the entire prefix/suffix Expandables sets (i.e. coExpanding), on either side of it.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionZeroSumHandle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^coExpandable": false
            }
        },
        { // default
            "class": "ExpansionHandle1D",
            context: {
                myController: [{ myExpandable: { myExpandableZeroSumController: _ } }, [me]]
            },
            children: {
                handleDisplay: {
                    description: {
                        "class": "ExpandableZeroSumHandleDisplay"
                    }
                }
            }
        },
        {
            qualifier: { coExpandable: false },
            write: {
                onExpansionZeroSumHandleDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        raiseCoExpandingFlag: {
                            to: [{ coExpandable: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { coExpandable: true },
            write: {
                onMouseUpOutsideCoExpandingSeparator: {
                    upon: [mouseUpNotHandledBy,
                        o([me],
                            [areaOfClass, "ImmunityFromCoExpandableReset"])
                    ],
                    true: {
                        resetCoExpandingSeparatorState: {
                            to: [{ coExpandable: _ }, [me]],
                            merge: false
                        }
                    }
                },
                onMouseDownRecordOffset: {
                    "class": "OnMouseDown",
                    true: {
                        recordOffset: {
                            to: [{ myController: { coExpansionPrefixInitialLength: _ } }, [me]],
                            merge: [offset,
                                {
                                    element: [{ myController: _ }, [me]],
                                    type: [{ lowHTMLLength: _ }, [me]]
                                },
                                {
                                    type: [{ centerLength: _ }, [me]]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The visual manifestation of the active handle (active when it is either hovered over, or dragged). 
    // We distinguish between an active handle of expanding and coExpanding, where the latter is thicker/longer
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableZeroSumHandleDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                makeVisible: [{ makeVisible: _ }, [embedding]],
                coExpandable: [{ coExpandable: _ }, [embedding]]
            }
        },
        { // default
            position: {
                attachToMyExpandable: {
                    point1: { type: "vertical-center" },
                    point2: {
                        element: [{ myExpandable: _ }, [embedding]],
                        type: "top"
                    },
                    equals: 0
                },
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { makeVisible: true },
            display: {
                background: "black"
            }
        },
        {
            qualifier: { coExpandable: false },
            position: {
                height: 1
            }
        },
        {
            qualifier: { coExpandable: true },
            position: {
                height: 4
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An area that inherits this class can process MouseDown events without triggering a resetting of the coExpandable handle selected
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ImmunityFromCoExpandableReset: {
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Expandable 1D-specific Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Expandable 2D-specific Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The class allows expanding the inheriting area by dragging its bottom-right corner (2D expansion).
    // API:
    // 1. See Expandable
    // 2. the inheriting class should define the top/left posPoints.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpandableBottomRight: o(
        { // default
            "class": "Expandable"
        },
        {
            qualifier: { defaultHandle: true },
            context: {
                myExpansionHandle: [{ children: { expansionHandle2D: _ } }, [me]]
            },
            children: {
                expansionHandle2D: {
                    description: {
                        "class": "ExpansionHandleBottomRight"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionHandle2D: o(
        { // default
            "class": o("ExpansionHandle", "AboveSiblings", "ConfinedToArea"),
            context: {
                confinedToArea: [{ myExpandable: _ }, [me]]
            }
        },
        {
            qualifier: { handleVisibilityEnabled: true },
            position: {
                width: generalPosConst.expansionHandle2DDimension,
                height: generalPosConst.expansionHandle2DDimension
            }
        },
        {
            qualifier: { handleVisibilityEnabled: false },
            position: {
                width: 0,
                height: 0
            }
        },
        {
            qualifier: { makeVisible: true },
            "class": "Border" // inheriting class will give some of the sides 0 width. 
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpansionHandleBottomRight: o(
        { // default
            "class": o("ExpansionHandle2D", "ModifyPointerHorizontalSEResize"),
            position: {
                right: 0,
                bottom: 0
            }
        },
        {
            qualifier: { makeVisible: true },
            display: {
                borderLeftWidth: 0,
                borderTopWidth: 0
            }
        }
    )

    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Expandable 2D-specific Classes
    // //////////////////////////////////////////////////////////////////////////////////////////////////////

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of library
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////    
};