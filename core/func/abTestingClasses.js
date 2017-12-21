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
// Beginning of A/B testing classes 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var projectABTestOption = [defun,
    o("uniqueID"),
    [using,
        "testObj",
        [
            { uniqueID: "uniqueID" },
            [{ abTestsObj: _ }, [areaOfClass, "ABTestsController"]]
        ],
        [cond,
            [{ option: _ }, "testObj"],
            o(
                { on: true, use: [{ option: _ }, "testObj"] },
                { on: false, use: [{ defaultOption: _ }, "testObj"] }
            )
        ]
    ]
];

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                show: [arg, "showABTests", false]
            }
        },
        { // default
            context: {
                "^open": false,
                "^minimized": false,
                tests: o(
                    {
                        uniqueID: "InterpretationOfMultipleTagsSelected", 
                        name: "Interpretation of Multiple Tags Selected",
                        options: o(
                            {
                                uniqueID: "and",
                                // desc: ""
                            },
                            {
                                uniqueID: "or",
                                // desc: ""
                            }
                        ),
                        defaultOption: "or"
                    },
                    {
                        uniqueID: "AmoebaExpandButtonImage", 
                        name: "Amoeba Expand Button Image in Facet Header",
                        options: o(
                            {
                                uniqueID: "drawer",
                                // desc: ""
                            },
                            {
                                uniqueID: "wand",
                                // desc: ""
                            },
                            {
                                uniqueID: "ruler",
                                // desc: ""
                            }
                        ),
                        defaultOption: "ruler"
                    },
                    {
                        uniqueID: "AttachFacetAmoebaToTheBottomOfFSP",
                        name: "Attach Facet Amoeba to the Bottom of Facet Settings Panel",
                        options: o(
                            {
                                uniqueID: "yes",
                                desc: "Attach Amoeba to Bottom of Facet Settings Panel"
                            },
                            {
                                uniqueID: "no",
                                desc: "Do Not Attach Amoeba to Bottom of Facet Settings Panel"
                            }
                        ),
                        defaultOption: "no"
                    },
                    {
                        uniqueID: "UseBackgroundColorOfAdjacentMenuItemForMenuTriangle",
                        name: "Use Background Color of Adjacent Menu Item for Menu Triangle",
                        options: o(
                            {
                                uniqueID: "yes",
                                desc: "Use Same Background Color"
                            },
                            {
                                uniqueID: "no",
                                desc: "Use White Color"
                            }
                        ),
                        defaultOption: "yes"
                    },
                    {
                        uniqueID: "UseRadioButtonsInSliderScaleEditControlMenuItem",
                        name: "Use Radio Buttons when editing Slider Scale",
                        options: o(
                            {
                                uniqueID: "yes",
                                desc: "Use Radio Buttons"
                            },
                            {
                                uniqueID: "no",
                                desc: "Do not use Radio Buttons"
                            }
                        ),
                        defaultOption: "yes"
                    },
                    {
                        uniqueID: "DisplayValueMarkersWithStats",
                        name: "Display Value Markers with Stats",
                        options: o(
                            {
                                uniqueID: "yes",
                                desc: "Display value markers when stats are active"
                            },
                            {
                                uniqueID: "no",
                                desc: "Do not display value markers when stats are active"
                            }
                        ),
                        defaultOption: "yes"
                    },
                    {
                        uniqueID: "DensityControllerTextOrSvg",
                        name: "Density Controller Text or Svg",
                        options: o(
                            {
                                uniqueID: "text",
                                desc: "Text based AAA buttons"
                            },
                            {
                                uniqueID: "svg",
                                desc: "Image based AAA buttons"
                            }
                        ),
                        defaultOption: "text"
                    },
                    {
                        uniqueID: "ScaleLabelPrecision",
                        name: "Scale Label Precision",
                        options: o(
                            {
                                uniqueID: "data",
                                desc: "Data Precision"
                            },
                            {
                                uniqueID: "separate",
                                desc:
                                "Separate Precision for Primary/Secondary"
                            },
                            {
                                uniqueID: "common",
                                desc: "Common Precision for All Labels"
                            }
                        ),
                        defaultOption: "separate"
                    },
                    {
                        uniqueID: "LinearScaleEdgeRounding",
                        name: "Linear Scale Edge Rounding",
                        options: o(
                            { uniqueID: 4, desc: "Very Round" },
                            { uniqueID: 5, desc: "Round" },
                            { uniqueID: 6, desc: "Balanced" },
                            { uniqueID: 7, desc: "Efficientish" },
                            { uniqueID: 8, desc: "Efficient" },
                            { uniqueID: 10, desc: "Very Efficient" }
                        ),
                        defaultOption: 6
                    },
                    {
                        uniqueID: "LogScaleEdgeRounding",
                        name: "Log Scale Edge Rounding",
                        options: o(
                            { uniqueID: "Round", desc: "Power of 10" },
                            { uniqueID: "Efficient", desc: "to 1/1.5/2/3/5" }
                        ),
                        defaultOption: "Round"
                    },
                    {
                        uniqueID: "LogScaleZeroNeighborhood",
                        name: "Log Scale Zero Neighborhood",
                        options: o(
                            {
                                uniqueID: "Symmetric",
                                desc: "Equal negative and positive linear/log boundary values"
                            },
                            {
                                uniqueID: "Independent",
                                desc: "Independently computed values for negative and positive linear/log boundary values"
                            }
                        ),
                        defaultOption: "Symmetric"
                    },
                    {
                        uniqueID: "ScaleMarkSpacing",
                        name: "Scale Mark Spacing",
                        options: o(
                            { uniqueID: 0.7, desc: "tiny" },
                            { uniqueID: 0.9, desc: "small" },
                            { uniqueID: 0.95, desc: "medium" },
                            { uniqueID: 1, desc: "large" },
                            { uniqueID: 1.05, desc: "larger" },
                            { uniqueID: 1.1, desc: "huge" },
                            { uniqueID: 1.3, desc: "gigantic" }
                        ),
                        defaultOption: 1
                    },
                    {
                        uniqueID: "1DValueMarkerSpacing",
                        name: "1D Value Marker Spacing",
                        options: o(
                            { uniqueID: 0.95, desc: "tiny" },
                            { uniqueID: 1, desc: "small" },
                            { uniqueID: 1.1, desc: "medium" },
                            { uniqueID: 1.2, desc: "large" },
                            { uniqueID: 1.25, desc: "huge" },
                            { uniqueID: 1.3, desc: "huger" },
                            { uniqueID: 1.4, desc: "hugest" }
                        ),
                        defaultOption: 1.25
                    },
                    {
                        uniqueID: "LinearPlusMinusBoundaryRounding",
                        name: "Linear +/- Boundary Rounding",
                        options: o(
                            { uniqueID: "Round", desc: "Powers of 10" },
                            { uniqueID: "Precise", desc: "1-9 * Power of 10" }
                        ),
                        defaultOption: "Precise"
                    },
                    {
                        uniqueID: "LinearPlusMinusTailRatio",
                        name: "Linear +/- Boundary Ratio",
                        options: o(
                            { uniqueID: 0.01, desc: 0.01 },
                            { uniqueID: 0.02, desc: 0.02 },
                            { uniqueID: 0.05, desc: 0.05 },
                            { uniqueID: 0.10, desc: 0.10 },
                            { uniqueID: 0.15, desc: 0.15 },
                            { uniqueID: 0.20, desc: 0.20 },
                            { uniqueID: 0.25, desc: 0.25 },
                            { uniqueID: 0.30, desc: 0.30 }
                        ),
                        defaultOption: 0.20
                    },

                    {
                        uniqueID: "MergePartialBinThreshold",
                        name: "Merge Partial Bin Threshold Ratio",
                        options: o(
                            { uniqueID: 0.1, desc: 0.1 },
                            { uniqueID: 0.2, desc: 0.2 },
                            { uniqueID: 0.3, desc: 0.3 },
                            { uniqueID: 0.4, desc: 0.4 },
                            { uniqueID: 0.5, desc: 0.5 },
                            { uniqueID: 0.6, desc: 0.6 }
                        ),
                        defaultOption: 0.3
                    },

                    {
                        uniqueID: "SingleBinLogTail",
                        name: "Force Single Log Tail in LinearPlusMinus",
                        options: o(
                            { uniqueID: "Yes", desc: "Yes" },
                            { uniqueID: "No", desc: "No" }
                        ),
                        defaultOption: "Yes"
                    },

                    // to what extent does the primary label spacing depend
                    //  on log(canvas-size)
                    {
                        uniqueID: "LogScalePrimarySpacingCoeff",
                        name: "Log Scale Primary Spacing Coeff.",
                        options: o(
                            { uniqueID: 0, desc: "None" },
                            { uniqueID: 0.02, desc: "tiny" },
                            { uniqueID: 0.04, desc: "small" },
                            { uniqueID: 0.06, desc: "medium" },
                            { uniqueID: 0.08, desc: "large" },
                            { uniqueID: 0.15, desc: "huge" }
                        ),
                        defaultOption: 0.04
                    },

                    // to what extent does the primary label spacing depend
                    //  on log(canvas-size)
                    {
                        uniqueID: "LinearScalePrimarySpacingCoeff",
                        name: "Linear Scale Primary Spacing Coeff.",
                        options: o(
                            { uniqueID: 0, desc: "None" },
                            { uniqueID: 0.04, desc: "tiny" },
                            { uniqueID: 0.08, desc: "small" },
                            { uniqueID: 0.1, desc: "medium" },
                            { uniqueID: 0.12, desc: "large" },
                            { uniqueID: 0.16, desc: "huge" },
                            { uniqueID: 0.2, desc: "gigantic" }
                        ),
                        defaultOption: 0.1
                    },
                    {
                        uniqueID: "OverlayColors",
                        name: "Colors of Sets",
                        options: o(
                            { uniqueID: "V1", desc: "lighter" },
                            { uniqueID: "V2", desc: "stronger" }
                        ),
                        defaultOption: "V2"
                    },
                    {
                        uniqueID: "FacetTransition",
                        name: "Facet Transitions",
                        options: o(
                            { uniqueID: "V1", desc: "no transition" },
                            { uniqueID: "V2", desc: "transition" }
                        ),
                        defaultOption: "V2"
                    },
                    /*{
                        uniqueID: "FacetScrolling",
                        name: "Facet Scrolling",
                        options: o(
                                   { uniqueID: "V1", desc: "arrows appear on top of facets on hover" }, 
                                   { uniqueID: "V2", desc: "iOS screen scrolling"}
                                  ),
                        defaultOption: "V2"
                    },*/
                    {
                        uniqueID: "DiscreteWidget",
                        name: "Discrete Widget",
                        options: o(
                            { uniqueID: "Circles1", desc: "circular valueMarker in selectability ring\nimplicitSet valueMarker as ring" },
                            { uniqueID: "Circles2", desc: "implicitSet valueMarker is enabled-grey. when no selections made, also enabled-grey" },
                            { uniqueID: "Circles3", desc: "ring conveys itemSet membership, inner circle conveys selection.\nring is overlay-colored when in solutionSet, disabled-colored when not in implicitSet. when selections are made, ring is enabled-colored for implicitSet that's not in solutionSet." },
                            { uniqueID: "Form", desc: "checkbox separate from valueMarkers" }
                        ),
                        defaultOption: "Circles3"
                    },
                    {
                        uniqueID: "SliderContinuousRangeColorOnAny",
                        name: "Slider Range Color on 'Any'",
                        options: o("Colored", "Transparent"),
                        defaultOption: "Colored"
                    },
                    {
                        uniqueID: "SliderContinuousRangeGirth",
                        name: "Slider Continuous Range Girth",
                        options: o("Wide", "Lean"),
                        defaultOption: "Lean"
                    },
                    {
                        uniqueID: "OverlaySolutionSetViewScrollbar",
                        name: "Horizontal Position of Item Scrollbar",
                        options: o(
                            { uniqueID: "V1", desc: "scrollbar on left" },
                            { uniqueID: "V2", desc: "scrollbar on right of right facet" },
                            { uniqueID: "V3", desc: "scrollbar on right" }
                        ),
                        defaultOption: "V1"
                    },
                    {
                        uniqueID: "ShowItemsControl",
                        name: "Control for showing products",
                        options: o(
                            { uniqueID: "V1", desc: "Top/left triangle" },
                            { uniqueID: "V2", desc: "plus/minus icon" }
                        ),
                        defaultOption: "V2"
                    },
                    {
                        uniqueID: "RealTimeFacetSearch",
                        name: "Facet Search in Realtime",
                        options: o(
                            { uniqueID: "V1", desc: "Search in real time" },
                            { uniqueID: "V2", desc: "Search on Enter/SearchControl click" }
                        ),
                        defaultOption: "V1"
                    }
                ),
                "^abTestsObj": [{ tests: _ }, [me]]
            },
            position: {
                top: 0,
                right: 0
            }
        },
        {
            qualifier: { show: false },
            position: {
                width: 0,
                height: 0
            }
        },
        {
            qualifier: { show: true },
            "class": o("Border", "BackgroundColor", "AboveAppZTop", "MinWrap"),
            context: {
                minWrapAround: 5
            },
            children: {
                title: {
                    description: {
                        "class": "ABTestsControllerTitle"
                    }
                }
            }
        },
        {
            qualifier: {
                show: true,
                open: false
            },
            write: {
                onABTestsControllerClick: {
                    "class": "OnMouseClick",
                    true: {
                        open: {
                            to: [{ open: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                show: true,
                open: true
            },
            children: {
                abTestsView: {
                    description: {
                        "class": "ABTestsView"
                    }
                },
                scrollbar: {
                    description: {
                        "class": "VerticalScrollbarContainer",
                        context: {
                            movableController: [areaOfClass, "ABTestsView"],
                            createButtons: false,
                            attachToView: "beginning"
                        }
                    }
                },
                closeControl: {
                    description: {
                        "class": "ABTestsControllerClose"
                    }
                },
                minimizeControl: {
                    description: {
                        "class": "ABTestsControllerMinimize"
                    }
                }
            }
        },
        {
            qualifier: {
                show: true,
                open: true,
                minimized: false
            },
            position: {
                bottom: 10
            }
        },
        {
            qualifier: {
                show: true,
                open: true,
                minimized: true
            }
            // minWrap takes effect on bottom
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsControllerControl: {
        "class": o("OnHoverFrameDesign", "TooltipableControl"),
        display: {
            image: {
                size: "100%",
                alt: [{ tooltipText: _ }, [me]]
            }
        },
        position: {
            top: 2,
            width: 20,
            height: 20
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsControllerClose: {
        "class": "ABTestsControllerControl",
        context: {
            tooltipText: "Close"
        },
        display: {
            image: {
                src: "%%image:(closeControl.svg)%%"
            }
        },
        position: {
            right: 2
        },
        write: {
            onABTestControllerCloseClick: {
                "class": "OnMouseClick",
                true: {
                    closeController: {
                        to: [{ open: _ }, [embedding]],
                        merge: false
                    },
                    setMinimized: {
                        to: [{ minimized: _ }, [embedding]],
                        merge: false
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsControllerMinimize: {
        "class": "ABTestsControllerControl",
        context: {
            tooltipText: "Show Only Open Tests"
        },
        display: {
            image: {
                src: "%%image:(minimizeControl.svg)%%"
            }
        },
        position: {
            attachToCloseControl: {
                point1: { type: "right" },
                point2: { element: [{ children: { closeControl: _ } }, [embedding]], type: "left" },
                equals: 5
            }
        },
        write: {
            onABTestControllerMinimizeClick: {
                "class": "OnMouseClick",
                true: {
                    toggleMinimizeController: {
                        to: [{ minimized: _ }, [embedding]],
                        merge: [not, [{ minimized: _ }, [embedding]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsControllerTitle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                open: [{ open: _ }, [embedding]]
            }
        },
        { // default
            "class": o("TextBold", "TextAlignCenter", "DefaultDisplayText", "DisplayDimension")
        },
        {
            qualifier: { open: false },
            "class": "AboveSiblings",
            context: {
                displayText: "A/B"
            }
        },
        {
            qualifier: { open: true },
            context: {
                displayText: "A/B Tests Controller"
            },
            position: {
                top: 5,
                left: 5,
                minOffsetFromControls: {
                    point1: { type: "right" },
                    point2: { element: [areaOfClass, "ABTestsControllerControl"], type: "left" },
                    min: 10
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestsView: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                minimized: [{ minimized: _ }, [embedding]]
            }
        },
        {
            "class": o("VerticalContMovableASController", "Border"),
            context: {
                beginningOfDocPoint: atomic({
                    element: [first, [{ children: { abTests: _ } }, [me]]],
                    type: "top"
                }),
                endOfDocPoint: atomic({
                    element: [last, [{ children: { abTests: _ } }, [me]]],
                    type: "bottom"
                })
            },
            position: {
                attachToABTestsControllerTitle: {
                    point1: {
                        element: [areaOfClass, "ABTestsControllerTitle"],
                        type: "bottom"
                    },
                    point2: { type: "top" },
                    equals: 20
                },
                // left - provided by VerticalContMovableASController
                right: 0
            },
            display: { borderLeftWidth: 0, borderRightWidth: 0 },
            children: {
                abTests: {
                    data: [{ abTestsData: _ }, [me]],
                    description: {
                        "class": "ABTest"
                    }
                }
            }
        },
        {
            qualifier: { minimized: false },
            context: {
                abTestsData: [{ abTestsObj: _ }, [embedding]]
            },
            position: {
                bottom: 20
            }
        },
        {
            qualifier: { minimized: true },
            "class": "MinWrapVertical",
            context: {
                abTestsData: [{ abTestsObj: { open: true } }, [embedding]]
            }
        }
    ),



    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. optionIDs
    // 2. name
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTest: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                open: [{ obj: { open: _ } }, [me]],
                controllerOpen: [{ open: _ }, [areaOfClass, "ABTestsController"]]
            }
        },
        { // default
            context: {
                obj: [{ param: { areaSetContent: _ } }, [me]],
                uniqueID: [{ obj: { uniqueID: _ } }, [me]],
                name: [{ obj: { name: _ } }, [me]],
                optionIDs: [{ obj: { options: _ } }, [me]],
                option: [mergeWrite,
                    [{ obj: { option: _ } }, [me]],
                    [{ obj: { defaultOption: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { controllerOpen: true },
            "class": o("Border", "BackgroundColor", "MinWrap", "MemberOfTopToBottomAreaOS"),
            context: {
                minWrapAround: 0,
                spacingFromPrev: 10
            },
            display: {
                borderLeftWidth: 0,
                borderRightWidth: 0
            },
            position: {
                left: 0,
                right: 0,
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: 500
                }
            },
            children: {
                viewControl: {
                    description: {
                        "class": "ABTestViewControl"
                    }
                },
                title: {
                    description: {
                        "class": "ABTestTitle"
                    }
                }
            }
        },
        {
            qualifier: { controllerOpen: false },
            "class": "ZeroDimensions"
        },
        {
            qualifier: { open: true },
            children: {
                options: {
                    data: [{ optionIDs: _ }, [me]],
                    description: {
                        "class": "ABTestOption"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestViewControl: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "GeneralArea"),
        context: {
            displayText: [cond,
                [{ open: _ }, [embedding]],
                o({ on: false, use: "+" }, { on: true, use: "-" })
            ]
        },
        position: {
            top: 0,
            left: 5,
            width: 20,
            height: 20
        },
        write: {
            onABTestViewControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleTestViewControl: {
                        to: [{ open: _ }, [embedding]],
                        merge: [not, [{ open: _ }, [embedding]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestTitle: {
        "class": o("DefaultDisplayText", "GeneralArea", "Tooltipable"),
        context: {
            displayText: [concatStr, o([{ name: _ }, [embedding]], ": ", [{ option: _ }, [embedding]])],
            tooltipText: [
                {
                    uniqueID: [{ option: _ }, [embedding]],
                    desc: _
                },
                [{ optionIDs: _ }, [embedding]]
            ]
        },
        display: {
            paddingLeft: 5
        },
        position: {
            top: 0,
            attachToViewControl: {
                point1: {
                    element: [{ children: { viewControl: _ } }, [embedding]],
                    type: "right"
                },
                point2: { type: "left" },
                equals: 5
            },
            right: 0,
            height: 20
        },
        write: {
            onABTestTitleMouseClick: {
                "class": "OnMouseClick",
                true: {
                    toggleTestViewControl: {
                        to: [{ open: _ }, [embedding]],
                        merge: [not, [{ open: _ }, [embedding]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ABTestOption: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                ofABTestID: [{ uniqueID: _ }, [embedding]],
                abTestOptionIsObj: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                abTestOptionID: [cond,
                    [{ abTestOptionIsObj: _ }, [me]],
                    o(
                        { on: true, use: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]] },
                        { on: false, use: [{ param: { areaSetContent: _ } }, [me]] }
                    )
                ],
                selectedOption: [equal,
                    [{ abTestOptionID: _ }, [me]],
                    [{ option: _ }, [embedding]]
                ]
            }
        },
        { // default
            "class": o("Border", "DefaultDisplayText", "GeneralArea", "MemberOfLeftToRightAreaOS", "Tooltipable"),
            context: {
                displayText: [{ abTestOptionID: _ }, [me]],
                tooltipText: [{ abTestOptionID: _ }, [me]], // for now...
                spacingFromPrev: 5
            },
            display: {
                paddingLeft: 5
            },
            position: {
                attachToTestTitle: {
                    point1: {
                        element: [{ children: { title: _ } }, [embedding]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 5
                },
                bottom: 5,
                height: 20,
                "content-width": [displayWidth]
            },
            write: {
                onABTestOptionMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        setAsTestOption: {
                            to: [{ obj: { option: _ } }, [embedding]],
                            merge: [{ abTestOptionID: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: 10
            }
        },
        {
            qualifier: { selectedOption: true },
            "class": "TextBold"
        },
        {
            qualifier: { abTestOptionIsObj: true },
            context: {
                tooltipText: [{ param: { areaSetContent: { desc: _ } } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. abTestsController: an areaRef that inherits ABTestsController.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackABTesting: o(
        { // variant-controller             
            qualifier: "!",
            context: { 
                interpretationOfMultipleTagsSelected: [projectABTestOption, "InterpretationOfMultipleTagsSelected"],
                
                amoebaExpandButtonImage: [projectABTestOption, "AmoebaExpandButtonImage"],
                
                attachFacetAmoebaToTheBottomOfFSP: [projectABTestOption, "AttachFacetAmoebaToTheBottomOfFSP"],

                useBackgroundColorOfAdjacentMenuItemForMenuTriangle: [projectABTestOption, "UseBackgroundColorOfAdjacentMenuItemForMenuTriangle"],

                useRadioButtonsInSliderScaleEditControlMenuItemABTest: [projectABTestOption, "UseRadioButtonsInSliderScaleEditControlMenuItem"],

                displayValueMarkersWithStatsABTest: [projectABTestOption, "DisplayValueMarkersWithStats"],

                densityControllerTextOrSvgABTest: [projectABTestOption, "DensityControllerTextOrSvg"],

                linearScaleEdgeRoundingABTest: [projectABTestOption, "LinearScaleEdgeRounding"],

                logScaleEdgeRoundingABTest: [projectABTestOption, "LogScaleEdgeRounding"],

                logScaleZeroNeighborhoodABTest: [projectABTestOption, "LogScaleZeroNeighborhood"],

                scaleMarkSpacingABTest: [projectABTestOption, "ScaleMarkSpacing"],

                scale1DMarkSpacingABTest: [projectABTestOption, "1DValueMarkerSpacing"],

                linearPlusMinusBoundaryRoundingABTest: [projectABTestOption, "LinearPlusMinusBoundaryRounding"],

                linearPlusMinusTailRatioABTest: [projectABTestOption, "LinearPlusMinusTailRatio"],

                mergePartialBinThresholdABTest: [projectABTestOption, "MergePartialBinThreshold"],

                singleBinLogTailABTest: [projectABTestOption, "SingleBinLogTail"],

                logScalePrimarySpacingCoeffABTest: [projectABTestOption, "LogScalePrimarySpacingCoeff"],

                linearScalePrimarySpacingCoeffABTest: [projectABTestOption, "LinearScalePrimarySpacingCoeff"],

                scaleLabelPrecisionABTest: [projectABTestOption, "ScaleLabelPrecision"],

                overlayColorsABTest: [projectABTestOption, "OverlayColors"],
                facetTransitionABTest: [projectABTestOption, "FacetTransition"],
                discreteWidgetABTestOption: [projectABTestOption, "DiscreteWidget"],
                discreteWidgetABTest: [cond,
                    [{ discreteWidgetABTestOption: _ }, [me]],
                    o(
                        { on: "Form", use: "Form" },
                        { on: null, use: "Circles" } // currently, either Circles1 or Circles2
                    )
                ],

                sliderContinuousRangeColorOnAnyABTest: [projectABTestOption, "SliderContinuousRangeColorOnAny"],

                sliderContinuousRangeGirthABTest: [projectABTestOption, "SliderContinuousRangeGirth"],

                //facetScrollingABTest: [projectABTestOption, "FacetScrolling"]
                overlaySolutionSetViewScrollbarABTest: [projectABTestOption, "OverlaySolutionSetViewScrollbar"],
                showItemsControlABTest: [projectABTestOption, "ShowItemsControl"],
                realtimeFacetSearchABTest: [projectABTestOption, "RealTimeFacetSearch"]
            }
        },
        { // default
            // we do not inherit GeneralArea, as it inherits TrackABTesting!
        }
    )

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of A/B testing classes 
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////   
};
