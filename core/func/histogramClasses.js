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

////////////////////////////////////////////////////////////////////////////
// The histogram library
////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <histogramDesignClasses.js>

var classes = {

    /////////////////////////////////////////////////////////////////////////
    // Base Histogram class which is inherited both by Histogram and ExpHistogram
    // to preserve the funcionality of TrackMyHistogram
    /////////////////////////////////////////////////////////////////////////
    HistogramCore: {

    },

    /////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting class should inherit either "Vertical" or "Horizontal"
    /////////////////////////////////////////////////////////////////////////
    HistogramsViewContainer: {
        "class": o("GeneralArea", "TrackMyFacet"),
        children: {
            addNewHistogramControl: {
                description: {
                    "class": "AddNewHistogramControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    HorizontalHistogramsViewContainer: {
        "class": o("Horizontal", "HistogramsViewContainer"),
        position: {
            "class": "PositionHorizontalHistogramsViewContainerOr2DPlot"
        }
    },

    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    VerticalHistogramsViewContainer: {
        "class": o("Vertical", "HistogramsViewContainer"),
        position: {
            attachBottomToPrimaryWidgetAnchorContinuousRange: {
                point1: {
                    element: [{ myPrimaryWidget: _ }, [me]],
                    label: "verticalAnchorForHistogram"
                },
                point2: {
                    type: "bottom"
                },
                equals: [densityChoice, [{ histogramPosConst: { marginOnVerticalHistogramViewBottom: _ } }, [globalDefaults]]]
            },
            attachLeftToAmoeba: {
                point1: {
                    element: [{ myAmoeba: _ }, [me]],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                equals: 0
            },
            attachRightToAmoeba: {
                point1: {
                    element: [{ myAmoeba: _ }, [me]],
                    type: "right",
                    content: true
                },
                point2: {
                    type: "right"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    HistogramsView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // this NPAD can take the uniqueID of an overlay, once the user clicks on one of the overlay's bars. 
                // it is reset when the mouse exits the HistogramView
                "*uniqueIDOfOverlaySelected": o(),
                "*uniqueIDOfHistogramSelected": o()
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyFacet"),
            position: {
                left: 0,
                top: 0,
                bottom: 0,
                right: [plus,
                    [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]],
                    [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]]
                ]
            }
        },
        {
            qualifier: { uniqueIDOfOverlaySelected: true },
            children: {
                additionalControls: {
                    description: {
                        "class": "HistogramAdditionalControls"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    AddNewHistogramControl: {
        "class": o("AddNewHistogramControlDesign", "AppControl", "TrackMyFacet"),
        context: {
            tooltipText: [concatStr,
                o(
                    [{ myApp: { addStr: _ } }, [me]],
                    [{ myApp: { newStr: _ } }, [me]],
                    [{ myApp: { histogramEntityStr: _ } }, [me]]
                ),
                " "
            ],
            myHistogramsView: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "HistogramsView"]
            ],
            myHistogramsDoc: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "HistogramsDoc"]
            ],

            newHistogramUniqueIDCounter: [plus, [{ myHistogramsDoc: { histogramUniqueIDCounter: _ } }, [me]], 1],
            horizontalMargin: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]]
        },
        position: {
            top: 0,
            minOffsetFromMyHistogramsViewRight: {
                point1: {
                    element: [{ myHistogramsView: _ }, [me]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                min: [{ horizontalMargin: _ }, [me]]
            },
            right: [{ horizontalMargin: _ }, [me]]
        },
        write: {
            onAddNewHistogramControlClick: {
                "class": "OnMouseClick",
                true: {
                    incrementHistogramUniqueIDCounter: {
                        to: [{ myHistogramsDoc: { histogramUniqueIDCounter: _ } }, [me]],
                        merge: [{ newHistogramUniqueIDCounter: _ }, [me]]
                    },
                    addNewHistogramUniqueIDToOrdering: {
                        to: [{ myHistogramsDoc: { reorderedHistogramUniqueIDs: _ } }, [me]],
                        merge: o(
                            [{ myHistogramsDoc: { reorderedHistogramUniqueIDs: _ } }, [me]],
                            [{ newHistogramUniqueIDCounter: _ }, [me]]
                        )
                    },
                    addNewHistogramObjToHistogramsData: {
                        to: [{ myHistogramsDoc: { histogramsData: _ } }, [me]],
                        merge: push({ uniqueID: [{ newHistogramUniqueIDCounter: _ }, [me]] })
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting class should provide the description for the histograms areaSet
    /////////////////////////////////////////////////////////////////////////
    HistogramsDoc: o(
        { // default 
            "class": o("GeneralArea", "OrientedElement", "AttachBelowAmoebaControlPanel", "ReorderableController", "TrackMyFacet"),
            context: {
                histogramUniqueIDCounter: [mergeWrite,
                    [{ currentViewFacetDataObj: { histogramUniqueIDCounter: _ } }, [me]],
                    fsAppConstants.firstHistogramUniqueIDCounter
                ],
                reorderedHistogramUniqueIDs: [mergeWrite,
                    [{ currentViewFacetDataObj: { reorderedHistogramUniqueIDs: _ } }, [me]],
                    fsAppConstants.firstHistogramUniqueIDCounter
                ],
                histogramsData: [{ myFacet: { histogramsData: _ } }, [me]],

                myHistogramsView: [embedding],
                myHistogramsViewContainer: [
                    [embeddingStar],
                    [areaOfClass, "HistogramsViewContainer"]
                ],
                myHistograms: [{ children: { histograms: _ } }, [me]],
                // ReorderableController params:
                // myReorderableController is left at its default value of [me])
                reordered: [{ reorderedHistogramUniqueIDs: _ }, [me]],
                visReordered: [{ myHistograms: _ }, [me]],

                refOrientedElement: [{ myHistogramsViewContainer: _ }, [me]], // OrientedElement param
            },
            children: {
                histograms: {
                    data: [identify, _, [{ reorderedHistogramUniqueIDs: _ }, [me]]],
                    description: {
                        // to be provided by inheriting class
                    }
                }
            },
            position: {
                frame: 0 // for now. once a scrollbar is added to the view, this will change.
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "MinWrapHorizontal",
            context: {
                // ReorderableController params:                
                reorderingSpacing: [densityChoice, [{ histogramPosConst: { horizontalSpacingBetweenHistograms: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MinWrapVertical",
            context: {
                // ReorderableController params:                
                reorderingSpacing: [densityChoice, [{ histogramPosConst: { verticalSpacingBetweenHistograms: _ } }, [globalDefaults]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////
    // Base Histogram class which is inherited both by Histogram and ExpHistogram to preserve the funcionality of TrackMyHistogram
    /////////////////////////////////////////////////////////////////////////
    CoreHistogram: {

    },

    /////////////////////////////////////////////////////////////////////////
    // This class represents a histogram. It is inherited by the
    //   SliderHistogram and the DiscreteHistogram.
    // A histogram is embedded in the primaryWidget when the facet is in the
    //  histogram state.
    // This histogram can display in several different modes:
    // 1. linear count mode
    // 2. log count mode
    // 3. linear distribution mode
    // 4. log distribution mode
    //
    //
    // This class embeds:
    // 1. HistogramCanvas: which provides the canvas for the histogram's
    //     quantity axis (currently, with facets as columns, this is the
    //    horizontal axis).
    // 2. Scale, to display scale lines.
    //
    // API:
    // 1. displayMode: linearCount/logCount/linearDistribution/logDistribution
    //////////////////////////////////////////////////////////////////////////
    Histogram: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayModeLinearLog: [mergeWrite,
                    [{ myMeasurePairInFacetDataObj: { displayModeLinearLog: _ } }, [me]],
                    [{ defaultModeLinearLog: _ }, [me]]
                ],

                displayModeUnitDistribution: [cond,
                    [{ percentMeasureFunctionSelected: _ }, [me]],
                    o(
                        { on: true, use: "distribution" },
                        { on: false, use: "unit" }
                    )
                ],

                displayHistogramBarsAndScale: [and,
                    [{ myFacet: { overlaysInAmoeba: _ } }, [me]],
                    o(
                        // if either the count measure function is selected
                        [{ countMeasureFunctionSelected: _ }, [me]],
                        // or there is a valid measureFacet,
                        [{ myMeasureFacetIsValid: _ }, [me]]
                    )
                ],

                // for now, show implicit bars only for the count measure function when it is counting item rows (i.e. when the measureFacet is its own facet)
                // in distribution mode the  implicitBar isn't guaranteed to be a superset of the solutionSetBar, and can thus be confusing.
                // similarly, for other measure functions, it would probably be a bit much for the user.
                showImplicit1DSetBars: [{ countMeasureCountsMyItems: _ }, [me]],

                showDistributionModeInfo: [and,
                    // we're in distribution mode, and the edges of the scale span both positive and negative values
                    [equal, [{ displayModeUnitDistribution: _ }, [me]], "distribution"],
                    [lessThan,
                        [{ myHistogramCanvas: { minValue: _ } }, [me]],
                        0
                    ],
                    [greaterThan,
                        [{ myHistogramCanvas: { maxValue: _ } }, [me]],
                        0
                    ],
                    // also make sure we're not showing the measureFunctionDropDown, as the HistogramDistributionModeInfo button is positioned next to it
                    [not,
                        [
                            {
                                displayDropDownShowControl: _,
                                myHistogram: [me]
                            },
                            [areaOfClass, "HistogramMeasureFunctionDropDown"]
                        ]
                    ]
                ],

                embedUDFMeasureFacetAggregationControl: [and,
                    // is the measureFacet is a UDF, and if the dropdownMenu for the MeasureFacet is not open!
                    [{ myMeasureFacetIsAUDF: _ }, [me]],
                    [
                        {
                            myHistogram: [me],
                            displayDropDownShowControl: false
                        },
                        [areaOfClass, "HistogramMeasureFacetDropDown"]
                    ]
                ],

                embedHistogramMoreControls: o(
                    [{ multipleHistogramsInFacet: _ }, [me]],
                    [arg, "debugExportHistogram", false]
                )
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "HorizontalVisReorderable",
            position: {
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "VerticalVisReorderable",
            position: {
                left: 0,
                right: 0,

                allVerticalHistogramsOfFacetShouldHaveEqualHeight: {
                    pair1: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    pair2: {
                        point1: {
                            element: [{ myFacet: _ }, [me]],
                            label: "virtualTopOfHistogram"
                        },
                        point2: {
                            element: [{ myFacet: _ }, [me]],
                            label: "virtualBottomOfHistogram"
                        }
                    },
                    ratio: 1
                }
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                attachLowHTMLLengthToEmbedding: {
                    point1: {
                        element: [embedding],
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
            qualifier: { lastInAreaOS: true },
            position: {
                attachHighHTMLLengthToEmbedding: {
                    point1: {
                        element: [embedding],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        { // default
            "class": o(
                "GeneralArea",
                "HistogramCore",
                "OrientedElement",
                "MinWrap",
                "MemberOfPositionedAreaOS",
                "ZTop",
                "TrackMeasurePairInFacet"
            ),
            context: {
                uniqueID: [{ param: { areaSetContent: _ } }, [me]],
                myMeasurePairInFacet: [
                    {
                        uniqueID: [{ uniqueID: _ }, [me]],
                        myFacet: [{ myFacet: _ }, [me]]
                    },
                    [areaOfClass, "MeasurePairInFacet"]
                ],
                myHistogramsDoc: [embedding],
                myHistogramDataObj: [
                    { uniqueID: [{ uniqueID: _ }, [me]] },
                    [{ myHistogramsDoc: { histogramsData: _ } }, [me]]
                ],
                myHistogramsView: [{ myHistogramsDoc: { myHistogramsView: _ } }, [me]],

                myHistogramsViewContainer: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "HistogramsViewContainer"]
                ],
                uniqueIDOfOverlaySelected: [{ myHistogramsView: { uniqueIDOfOverlaySelected: _ } }, [me]],
                uniqueIDOfHistogramSelected: [{ myHistogramsView: { uniqueIDOfHistogramSelected: _ } }, [me]],

                myAddNewHistogramControl: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "AddNewHistogramControl"]
                ],

                myMeasureFacetUniqueID: [{ myMeasurePairInFacet: { myMeasureFacetUniqueID: _ } }, [me]],
                myMeasureFunctionUniqueID: [{ myMeasurePairInFacet: { myMeasureFunctionUniqueID: _ } }, [me]],

                // the primaryWidget, "by definition"
                myWidget: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "PrimaryWidget"]
                ],
                myHistogramView: [
                    { myHistogram: [me] },
                    [areaOfClass, "HistogramView"]
                ],
                myHistogramBars: [
                    { myHistogram: [me] },
                    [areaOfClass, "HistogramBar"]
                ],

                measureFunctionsAllowedBothUnitAndDistributionMode: o(
                    functionID.sum,
                    functionID.count
                ),
                defaultModeLinearLog: [cond,
                    [{ myFacet: { dataObj: { defaultHistogramScaleType: _ } } }, [me]],
                    o(
                        { on: true, use: [{ myFacet: { dataObj: { defaultHistogramScaleType: _ } } }, [me]] },
                        { on: false, use: "linear" }
                    )
                ],
                histogramBaseBars: [
                    {
                        myOverlay: [
                            { myApp: { effectiveBaseOverlay: _ } },
                            [me]
                        ]
                    },
                    [{ myHistogramBars: _ }, [me]]
                ],

                histogramSolutionSetBars: [
                    [areaOfClass, "HistogramSolutionSetBar"],
                    [{ myHistogramBars: _ }, [me]]
                ],

                histogramImplicit1DSetBars: [
                    [areaOfClass, "HistogramImplicit1DSetBar"],
                    [{ myHistogramBars: _ }, [me]]
                ],

                // the histogram scale relies on *stable* set calculations - so that the histogram scale won't change while a slider is
                // being dragged in a neighboring slider facet.
                // note we cannot settle for the histogramImplicit1DSetBars, as they do not always exceed the histogramSolutionSetBars
                // in their barStableVal - in Distribution-mode, for example, there is no guarantee of that!
                stableBarValues: o(
                    [{ histogramBaseBars: { barVal: _ } }, [me]],
                    [{ histogramSolutionSetBars: { barStableVal: _ } }, [me]],
                    [{ histogramImplicit1DSetBars: { barStableVal: _ } }, [me]]
                ),

                "*measurePanelIsOpen": false,
                measurePanelTooltipText: [
                    [{ myApp: { booleanStringFunc: _ } }, [me]],
                    [{ actionMetaphors: { openFormulaPanel: _ } }, [globalDefaults]],
                    "",
                    [concatStr, o([{ myApp: { histogramEntityStr: _ } }, [me]], " ", [{ myApp: { formulaEntityStr: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                    [{ measurePanelIsOpen: _ }, [me]]
                ],

                myMeasureFacetNumericFormat: [{ myMeasureFacetDataObj: { numericFormat: _ } }, [me]],
                distributionModeNumOfDigits: defaultHistogramDistributionNumOfDigits,
                numberOfDigits: [
                    cond,
                    [{ displayModeUnitDistribution: _ }, [me]],
                    o(
                        {
                            on: "unit",
                            use: [cond,
                                [{ myMeasureFunctionUniqueID: _ }, [me]],
                                o(
                                    {
                                        on: functionID.count,
                                        use: 0
                                    },
                                    {
                                        on: null,
                                        use: [cond,
                                            [{ myMeasureFacetNumericFormat: _ }, [me]],
                                            o(
                                                {
                                                    on: false,
                                                    use: [{ myApp: { defaultNumberOfDigits: _ } }, [me]]
                                                },
                                                {
                                                    on: true,
                                                    use: [max,
                                                        0, //1,
                                                        [{ myMeasureFacetNumericFormat: { numberOfDigits: _ } }, [me]]
                                                    ],
                                                    // use 1 for numeric precision when numberOfDigits is 0
                                                    // as this would result in problems with log scales which need
                                                    // numbers in between 0 and 1
                                                }
                                            )
                                        ]
                                    }
                                )
                            ],
                        },
                        {
                            on: "distribution",
                            use: [{ distributionModeNumOfDigits: _ }, [me]]
                        }
                    )
                ],

                myZoomBoxedOverlaysMeasurePairInFacet: [ // note: there should be one for every overlay displaying in the histogram!
                    {
                        myFacet: [{ myFacet: _ }, [me]],
                        myMeasurePairInFacetUniqueID: [{ uniqueID: _ }, [me]],
                        ofZoomBoxedOverlay: true // excludes the zoomboxing overlays, and the effectiveBaseOverlay too.
                    },
                    [areaOfClass, "OverlayMeasurePairInFacet"]
                ],
                roundedValues: [cond,
                    [{ displayModeUnitDistribution: _ }, [me]],
                    o(
                        {
                            on: "unit",
                            use: [round,
                                o(
                                    [{ myZoomBoxedOverlaysMeasurePairInFacet: { valueMeasure: { valInStableSolutionSetMeasureVal: _ } } }, [me]],
                                    [cond, // if we're showing the implicit set bars as well, then those values should also be taken into consideration
                                        [{ showImplicit1DSetBars: _ }, [me]],
                                        o({ on: true, use: [{ myZoomBoxedOverlaysMeasurePairInFacet: { valueMeasure: { valInImplicit1DSetItemMeasureVal: _ } } }, [me]] })
                                    ]
                                ),
                                [{ numberOfDigits: _ }, [me]]
                            ]
                        },
                        {
                            on: "distribution",
                            // in distribution mode (Percent), there are no HistogramImplicit1DSetBars, so we can do with only measureDistributionInStableSolutionSet
                            use: [round,
                                [{ myZoomBoxedOverlaysMeasurePairInFacet: { valueMeasure: { measureDistributionInStableSolutionSet: _ } } }, [me]],
                                [{ distributionModeNumOfDigits: _ }, [me]] // the numeric precision for the distribution values - hard-coded
                            ]
                        }
                    )
                ],

                myHistogramCanvas: [
                    { myHistogram: [me] },
                    [areaOfClass, "HistogramCanvas"]
                ],

                // HorizontalVisReorderable params
                myReorderable: [{ uniqueID: _ }, [me]],
                reorderableController: [{ myHistogramsDoc: _ }, [me]],

                // MemberOfPositionedAreaOS params:
                // (note: not inheriting MemberOfLeftToRightAreaOS as that relies on left/right, and here i want to use the logicalBeginning/logicalEnd)
                areaOS: [{ reorderableController: { visReordered: _ } }, [me]],
                myAreaOSPosPoint: [{ logicalBeginning: _ }, [me]],
                myPrevInAreaOSPosPoint: [{ myPrevInAreaOS: { logicalEnd: _ } }, [me]],
                spacingFromPrev: [{ reorderableController: { reorderingSpacing: _ } }, [me]],

                multipleHistogramsInFacet: [greaterThan,
                    [size, [{ myHistogramsDoc: { histogramsData: _ } }, [me]]],
                    1
                ],

                minWrapAround: 0
            },
            children: {
                // bins: defined in inheriting classes
                canvas: {
                    description: {
                        "class": "HistogramCanvas"
                    }
                },
                measureFunctionDropDownContainer: {
                    description: {
                        "class": "HistogramMeasureFunctionDropDownContainer"
                    }
                },
                measureFacetDropDownContainer: {
                    description: {
                        "class": "HistogramMeasureFacetDropDownContainer"
                    }
                },
                zeroLine: {
                    description: {
                        "class": "HistogramScaleElement",
                        context: {
                            value: 0
                        },
                        position: {
                            height: 0,
                            width: 0
                        }
                    }
                }
            },
            write: {
                // when switching (back) to the percent measure function, the measure facet should be reset.
                onHistogramPercentMeasureFunctionSelected: {
                    upon: [{ percentMeasureFunctionSelected: _ }, [me]],
                    true: {
                        setMeasureFacetToBeMyFacet: {
                            to: [{ myMeasureFacetUniqueID: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { embedHistogramMoreControls: true },
            children: {
                moreControls: {
                    description: {
                        "class": "HistogramMoreControls"
                    }
                }
            }
        },
        {
            qualifier: { displayHistogramBarsAndScale: true },
            children: {
                scale: {
                    description: {
                        "class": "HistogramScale"
                    }
                },
                scaleLinearOrLogControl: {
                    description: {
                        "class": "HistogramScaleLinearOrLogControl"
                    }
                }
            }
        },
        {
            qualifier: { showDistributionModeInfo: true },
            children: {
                distributionModeInfo: {
                    description: {
                        "class": "HistogramDistributionModeInfo"
                    }
                }
            }
        },
        {
            qualifier: { countDistributionMeasureFacetSelected: true },
            write: {
                // the (count) menu option (countDistributionMeasureFacetSelected: true) in the measureFacet dropdown is available only when the measure 
                // function selected is Percent.
                // what happens if we selected (count) in the measureFacet and then switched from a Percent measure function to some other function?
                // to avoid an ill-defined state, we reset myMeasureFacetUniqueID in that case to o(), which would prompt the user to select a new 
                // measure facet, by displaying the default "Select Facet" in its dropDownMenu.
                onHistogramChangeToMeasureFunction: {
                    upon: [changed, [{ myMeasureFunctionUniqueID: _ }, [me]]],
                    true: {
                        resetMyMeasureFacet: {
                            to: [{ myMeasureFacetUniqueID: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { embedUDFMeasureFacetAggregationControl: true },
            children: {
                uDFMeasureFacetAggregationControl: {
                    description: {
                        "class": "HistogramUDFMeasureFacetAggregationControl"
                    }
                }
            }
        },
        {
            qualifier: { ofMSFacet: true },
            children: {
                overlayXHistogramSorter: {
                    description: {
                        "class": "OverlayXHistogramSorter"
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    // This class is inherited by Discrete/Slider classes, which are embedded in their respective Histograms. 
    // This class provides the clipping of the histogram contents to the view that matches the View embedded in the primary widget.
    // API:
    // 1. Inheriting class should position this class on the vertical axis
    ///////////////////////////////////////////////////////////////////////
    HistogramView: o(
        { // default
            "class": o(
                "HistogramViewDesign", "GeneralArea",
                "TrackMyHistogram"
            ),
            context: {
                // override default def, as these parameters are independent of the Histogram's orientation
                lowHTMLGirthHandleAnchor: atomic({ element: [me], type: "top" }),
                highHTMLGirthHandleAnchor: atomic({ element: [me], type: "bottom" }),

                // to facilitate referencing by inheriting classes
                myWidget: [{ myHistogram: { myWidget: _ } }, [me]],

                // ExpandableRight param:
                initialExpandableWidth: [densityChoice, [{ histogramPosConst: { histogramViewWidth: _ } }, [globalDefaults]]],
                userExpandedHorizontally: [mergeWrite,
                    [{ myMeasurePairInFacetDataObj: { userExpandedHorizontally: _ } }, [me]],
                    false
                ],
                stableExpandableWidth: [mergeWrite,
                    [{ myMeasurePairInFacetDataObj: { stableExpandableWidth: _ } }, [me]],
                    [{ initialExpandableWidth: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "ExpandableInFacet",
            position: {
                left: [densityChoice, [{ histogramPosConst: { marginOnHorizontalHistogramViewLeft: _ } }, [globalDefaults]]],
                right: [densityChoice, [{ histogramPosConst: { marginOnHorizontalHistogramViewRight: _ } }, [globalDefaults]]]
                // top/bottom to be defined by the inheriting class
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                bottom: [densityChoice, [{ histogramPosConst: { marginOnVerticalHistogramViewBottom: _ } }, [globalDefaults]]],
                // top: defined by the HistogramMeasureFunctionDropDownContainers' vertical constraints 
                // left/right to be defined by the inheriting class
            }
        }
    ),


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    AboveDiscreteValuesView: {
        stacking: {
            aboveDiscreteValuesView: {
                lower: [
                    { myFacet: [{ myFacet: _ }, [me]] },
                    [areaOfClass, "DiscreteValuesView"]
                ],
                higher: [me]
            },
            belowHistogramTop: {
                lower: [me],
                higher: {
                    element: [{ myFacet: _ }, [me]],
                    label: "histogram top"
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // API:
    // 1. myCanvas -> default myHistogramCanvas
    // 2. applyMinWrap -> default true
    ///////////////////////////////////////////////////////////////////////
    HistogramScale: o(
        { // default
            "class": o("Scale", "TrackMyHistogram"),
            context: {
                myCanvas: [{ myHistogramCanvas: _ }, [me]], // Scale param
                primaryLabelData: [identify,
                    _,
                    o(
                        0, // to ensure that the value 0 is a primary label on the HistogramScale.
                        [{ rawDefaultPrimaryLabelData: _ }, [me]]
                    )
                ],
                applyMinWrap: true,
            },
            position: {
                frame: 0
            },
            children: {

                // an area-set, data defined by derived class
                primaryLabel: {
                    description: {
                        "class": "HistogramScalePrimaryLabel"
                    }
                },

                // an area-set, data defined by derived class
                secondaryLabel: {
                    description: {
                        "class": "HistogramScaleSecondaryLabel"
                    }
                },

                // an area-set, data defined by derived class
                tickmark: {
                    description: {
                        "class": "HistogramScaleUnlabeledTickmark"
                    }
                }
            }
        },
        {
            qualifier: { applyMinWrap: true, ofVerticalElement: false },
            "class": "MinWrapHorizontal" // this ensures that the HistogramScale labels are in full view (e.g. the 0.0)
        },
        {
            qualifier: { applyMinWrap: true, ofVerticalElement: true },
            "class": "MinWrapVertical" // this ensures that the HistogramScale labels are in full view (e.g. the 0.0)
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScalePrimaryLabel: o(
        {
            "class": "HistogramScaleLabeledTickmark",
            children: {
                text: {
                    description: {
                        "class": o(
                            "HistogramScalePrimaryLabelDesign",
                            "GeneralArea",
                            "TrackMyHistogram"
                        )
                    }
                },

                crossbar: {
                    description: {
                        "class": "HistogramScalePrimaryCrossbarDesign"
                    }
                }
            }
        },
        {
            qualifier: { isMinValue: true },
            context: {
                // for some reason i did not look more deeply into, the canvasOffset for isMinValue when there are no overlays showing is o()
                // and not 0. so we hard-code it here, instead.
                canvasOffset: 0
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleSecondaryLabel: {
        "class": "HistogramScaleLabeledTickmark",

        children: {
            text: {
                description: {
                    "class": o(
                        "HistogramScaleSecondaryLabelDesign",
                        "GeneralArea",
                        "TrackMyHistogram"
                    )
                }
            },

            crossbar: {
                description: {
                    "class": "HistogramScaleSecondaryCrossbarDesign"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleUnlabeledTickmark: {
        "class": o(
            "HistogramScaleUnlabeledTickmarkDesign",
            "HistogramScaleElement",
            "HistogramScaleTickmark"
        )
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleLabeledTickmark: {
        "class": o(
            "HistogramScaleElement",
            "ScaleLabeledTickmark"
        ),

        context: {
            isMinValue: [
                equal,
                [{ value: _ }, [me]],
                [{ myHistogramCanvas: { minValue: _ } }, [me]]
            ],
            isMaxValue: [
                equal,
                [{ value: _ }, [me]],
                [{ myHistogramCanvas: { maxValue: _ } }, [me]]
            ]
        },

        children: {
            text: {
                description: {
                    "class": "HistogramScaleLabelText"
                }
            },
            tickmark: {
                description: {
                    "class": "HistogramScaleLabelTickmark"
                }
            },

            crossbar: {
                description: {
                    "class": o(
                        "HistogramScaleCrossbar",
                        "TrackMyHistogram"
                    ),
                    context: {
                        scaleAtLowHTML: [{ scaleAtLowHTML: _ }, [embedding]]
                    }
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleTickmark: o(
        { // default
            "class": o("ScaleTickmark", "TrackMyHistogram"),
        },
        {
            qualifier: { scaleAtLowHTML: true },
            context: {
                tickmarkAnchoragePosPoint: atomic(
                    {
                        element: [{ myHistogramView: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    }
                )
            }
        },
        {
            qualifier: { scaleAtLowHTML: false },
            context: {
                tickmarkAnchoragePosPoint: atomic(
                    {
                        element: [{ myHistogramView: _ }, [me]],
                        type: [{ highHTMLGirth: _ }, [me]]
                    }
                )
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleCrossbar: o(
        {
            "class": o("TrackMyHistogram"),

            context: {
                isMinValue: [{ isMinValue: _ }, [embedding]],
                isMaxValue: [{ isMaxValue: _ }, [embedding]]
            }
        },

        {
            qualifier: { isMinValue: false, isMaxValue: false },

            context: {
                isDisplayed: true
            }
        },

        {
            qualifier: { isDisplayed: true },

            stacking: {
                belowHistogramBins: {
                    lower: [me],
                    higher: {
                        label: "histogram bins",
                        element: [{ myFacet: _ }, [me]]
                    }
                }
            }
        },

        {
            qualifier: { isDisplayed: true, ofVerticalElement: false },

            position: {
                width: [{ histogramPosConst: { scaleCrossbarGirth: _ } }, [globalDefaults]],
                "horizontal-center": 0,

                histogramViewAttachStart: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "top",
                        content: true
                    },
                    point2: {
                        type: "top"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                },
                histogramViewAttachEnd: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "bottom",
                        content: true
                    },
                    point2: {
                        type: "bottom"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                }
            }
        },

        {
            qualifier: { isDisplayed: true, ofVerticalElement: true },

            position: {
                height: [{ histogramPosConst: { scaleCrossbarGirth: _ } }, [globalDefaults]],
                "vertical-center": 0,

                histogramViewAttachStart: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                },
                histogramViewAttachEnd: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.strongerThanDefaultPressure
                }
            }
        }

    ),

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleElement: {
        "class": o(
            "GeneralArea",
            "ScaleElement",
            "TrackMyHistogram"
        ),
        context: {
            myCanvas: [{ myHistogramCanvas: _ }, [me]], // ScaleElement param
            highValAtLowHTMLLength: [{ ofVerticalElement: _ }, [me]], // for PositionByCanvasOffset. in other words false when the histogram scale is horizontal
            scaleAtLowHTML: true
        }
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleLabelText: {
        "class": o("ScaleText", "TrackMyHistogram")
    },

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    HistogramScaleLabelTickmark: {
        "class": o(
            "HistogramScaleLabelTickmarkDesign",
            "HistogramScaleTickmark"
        )
    },

    ////////////////////////////////////////////////////////////////////////
    // This class represents a bin in the histogram. A bin is defined by a
    //   value (DiscreteHistogramBin) or a range of values
    //   (SliderHistogramBin), and it embeds several histogram bars:
    //  1. a bar representing the baseSet (one per bin)
    //  2. a bar representing the implicit1DSet (one per intensional overlay
    //      that's showing)
    //  3. a bar representing the solutionSet (one per overlay that's
    //      showing - both intensional and extensional).
    // This means there is one baseBar per histogramBin, any number of
    //   implicit1DSetBars/solutionSetBars (which equally divide among them
    //   the bin's "basis" axis)
    //
    // API:
    //  1. binValue: either a range (for a slider bin), or a value (for a discrete bin; note that for "No Value", the value is the string "No Value").
    //     the binValue is used to look up the calculations performed in the OverlayMeasurePairInFacet corresponding to the HistogramBars displayed in this bin.
    //  2. binSelectionQuery - the selection query used by this class to
    //     define a selection query func.
    //  3. firstBin/lastBin: boolean flags set for the first bins (topmost!)
    //      by the inheriting classes (in fact, by sibling classes,
    //      SliderBin/DiscreteBin).
    //  4. solutionSetBarsData: default definition provided.
    //  5. showBaseBar: boolean, true by default
    ////////////////////////////////////////////////////////////////////////
    HistogramBin: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showBaseBar: [
                    { myApp: { effectiveBaseOverlay: { show: _ } } },
                    [me]
                ],
                emphasizeBin: [
                    {
                        delayedInFocus: true,
                        myBinValue: [{ binValue: _ }, [me]]
                    },
                    [areaOfClass, "HistogramBar"]
                ],
                solutionSetBarsData: [{ myFacet: { overlaysInAmoeba: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyHistogram", "TrackOverlaysShowing"),
            context: {
                // the primaryWidget. that means that currently SliderHistogramBins and DiscreteHistogramBins will inherit Vertical, and DateHistogramBin
                // will inherit Horizontal, as those are the classes inherited by their corresponding primaryWidget areas.
                // note that this definition overrides the default one provided by TrackMyHistogram (where refOrientedElement: [{ myHistogram:_ }, [me]])
                refOrientedElement: [{ myWidget: _ }, [me]]
            },
            position: {
                attachToEmbeddingLowHTMLGirth: {
                    point1: {
                        element: [embedding],
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ lowHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                },
                attachToEmbeddingHighHTMLGirth: {
                    point1: {
                        element: [embedding],
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    point2: {
                        type: [{ highHTMLGirth: _ }, [me]]
                    },
                    equals: 0
                },
                labelbaseBarLowHTMLLength: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: true
                    },
                    point2: { label: "baseBarLowHTMLLength" },
                    equals: [{ histogramPosConst: { baseBarMarginFromBin: _ } }, [globalDefaults]]
                },
                labelbaseBarHighHTMLLength: {
                    point1: { label: "baseBarHighHTMLLength" },
                    point2: {
                        type: [{ highHTMLLength: _ }, [me]],
                        content: true
                    },
                    equals: [{ histogramPosConst: { baseBarMarginFromBin: _ } }, [globalDefaults]]
                }
            },
            children: {
                solutionSetBars: {
                    data: [{ solutionSetBarsData: _ }, [me]],
                    description: {
                        "class": "HistogramSolutionSetBar"
                    }
                }
            },
            stacking: {
                histogramBinLayer: {
                    lower: { label: "histogram bins", element: [{ myFacet: _ }, [me]] },
                    higher: [me]
                },
                belowHistogramBars: {
                    lower: [me],
                    higher: { label: "histogram base bars", element: [{ myFacet: _ }, [me]] }
                }
                // see Facet's stacking object for additiona definitions of z layers
            }
        },
        {
            qualifier: { showImplicit1DSetBars: true },
            children: {
                implicit1DSetBars: {

                    // create implicit1DSetBars only for the *intensional*
                    //  overlays that are displaying a solutionSetBar; no
                    //  implicitSet defined for extensional ones.
                    //  and no implicitSet bars for intensional overlays in
                    //  union mode at this time!
                    data: [
                        { intersectionMode: true },
                        [
                            [areaOfClass, "PermIntOverlay"],
                            [{ solutionSetBarsData: _ }, [me]]
                        ]
                    ],
                    description: {
                        "class": "HistogramImplicit1DSetBar"
                    }
                }
            }
        },

        {
            qualifier: { showBaseBar: true },
            children: {
                baseBar: {
                    description: {
                        "class": "HistogramBaseBar"
                    }
                }
            }
        },

        {
            qualifier: { emphasizeBin: true },
            children: {
                emphasisLine: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "HistogramBinEmphasis"
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    HistogramBinEmphasis: {
        "class": o("HistogramBinEmphasisDesign", "GeneralArea", "IconAboveAppZTop", "TrackMyHistogram"),
        context: {
            myBin: [expressionOf],
            myHistogram: [{ myBin: { myHistogram: _ } }, [me]],

            refOrientedElement: [{ myBin: _ }, [me]] // override OrientedElement value provided via TrackMyHistogram            
        },
        position: {
            attachToBinLowHTMLLength: {
                point1: { type: [{ lowHTMLLength: _ }, [me]] },
                point2: { element: [{ myBin: _ }, [me]], type: [{ lowHTMLLength: _ }, [me]] },
                equals: 0
            },
            attachToBinHighHTMLLength: {
                point1: { type: [{ highHTMLLength: _ }, [me]] },
                point2: { element: [{ myBin: _ }, [me]], type: [{ highHTMLLength: _ }, [me]] },
                equals: 0
            },
            attachBeginningGirthToHistogramViewBeginningGirthFrame: {
                point1: { type: [{ beginningGirth: _ }, [me]] },
                point2: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: [{ beginningGirth: _ }, [me]]
                },
                equals: 0
            },
            attachEndGirthToHistogramViewBeginningGirthContent: {
                point1: { type: [{ endGirth: _ }, [me]] },
                point2: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: [{ beginningGirth: _ }, [me]],
                    content: true
                },
                equals: 0
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////
    // This class is inherited by HistogramSolutionSetBar,
    //  HistogramImplicit1DSetBar (and other types of bars - for example: HistogramBaseBar in Mon0).
    //
    // If the bar is empty, it is given a zero dimension on the histogram's quantity axis. Otherwise, it uses the canvas to calculate its
    // dimension along that axis.
    //
    // API:
    //  1. barMeasureVal / barStableMeasureVal
    //  2. myOverlay: areaRef to associated overlay.
    ////////////////////////////////////////////////////////////////////////
    HistogramBar: o(
        { // variant-controller
            qualifier: "!",
            context: {
                emptyBar: [
                    equal,
                    0,
                    [{ barVal: _ }, [me]]
                ],

                anOverlayIsReadyToHide: [{ uniqueIDOfOverlaySelected: _ }, [me]],
                myOverlayIsReadyToHide: [
                    [{ uniqueIDOfOverlaySelected: _ }, [me]],
                    [{ myOverlay: { uniqueID: _ } }, [me]]
                ],

                myOverlayBarsInHistogram: [
                    {
                        myHistogram: [{ myHistogram: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]]
                    },
                    [areaOfClass, "HistogramBar"]
                ],
                myOverlayBarsInBin: [ // across multiple histograms
                    {
                        myBinValue: [{ myBinValue: _ }, [me]],
                        myOverlay: [{ myOverlay: _ }, [me]]
                    },
                    [areaOfClass, "HistogramBar"]
                ],

                myBars: [cond,
                    [{ ofDateFacet: _ }, [me]],
                    o(
                        {
                            on: true,
                            // in a date facet to avoid too many displayBarValues coming up at once, we show the displayBarValue only for the bar hovered over
                            // and the matching bars in the same bin, in adjacent histograms.
                            use: [{ myOverlayBarsInBin: _ }, [me]]
                        },
                        {
                            on: false,
                            use: o(
                                [{ myOverlayBarsInHistogram: _ }, [me]],
                                [{ myOverlayBarsInBin: _ }, [me]]
                            )
                        }
                    )
                ],
                overMyBars: [{ myBars: { delayedInFocus: true } }, [me]],

                // for a non-empty bar, if we either hover over it, or there is a slider that's currently being modified in the app, display the bar values!
                displayBarValues: [and,
                    [arg, "debugCreateBarValDisplay", true],
                    [not, [{ anOverlayIsReadyToHide: _ }, [me]]],
                    [not, [{ emptyBar: _ }, [me]]],
                    [not, [{ myOverlayBarsInHistogram: { readyForSelection: _ } }, [me]]],
                    o(
                        [{ overMyBars: _ }, [me]],
                        [
                            {
                                myOverlay: [{ myOverlay: _ }, [me]],
                                beingModified: true // either (or both) slider selectors are being moved
                            },
                            [areaOfClass, "SliderIntOverlayXWidget"]
                        ],
                        [
                            {
                                delayedInFocus: true,
                                myOverlay: [{ myOverlay: _ }, [me]]
                            },
                            [areaOfClass, "OverlayShowControl"]
                        ]
                    )
                ],

                barHasDimension: [and,
                    [{ displayHistogramBarsAndScale: _ }, [me]],
                    [not, [{ emptyBar: _ }, [me]]]
                ],

                "*readyForSelection": false
            }
        },
        { // default
            "class": o("GeneralArea", "OverlayDelayedInArea", "TrackMyHistogram", "TrackMyOverlay"),
            context: {
                myBin: [embedding],
                myBinValue: [{ myBin: { binValue: _ } }, [me]],
                myHistogram: [{ myBin: { myHistogram: _ } }, [me]], // don't rely on embedding tree, as for DiscreteHistogramBins it doesn't apply
                myOverlay: [{ param: { areaSetContent: _ } }, [me]],

                // Not: this class inherits OrientedElement via TrackMyHistogram. As such, it gets the default refOrientedElement: [{ myHistogram:_ }, [me]]].
                // We override so that the histogramBar matches its definition of ofVerticalElement, which is calculated based on the
                // refOrientedElement. Worth noting that HistogramBin itself overrides the definition of refOrientedElement, to point instead to 
                // its PrimaryWidget.
                // That means that, for example, a DiscreteHistogramBin is ofVerticalElement: true, as that is the value for the DiscretePrimaryWidget.
                // Same goes for the SliderHistogramBin (which are currently displayed only along a *Vertical* SliderScale).
                // The DateHistogramBin, on the other hand, refer to a Horizontal DatePrimaryWidget, and so their ofVerticalElement is false.
                refOrientedElement: [embedding],

                // not all bars are guaranteed to be in view (or to exist): whether we're in a discrete facet, or in a slider facet with discrete values
                // there may well be discrete values that are scrolled out of view. since they are produced on a JIT basis, we cannot query them for their values
                // and instead rely on the associated OverlayMeasurePairInFacet areaSet, in which the needed calculations are stored.
                myOverlayMeasurePairInFacet: [
                    {
                        myOverlay: [{ myOverlay: _ }, [me]],
                        myFacet: [{ myFacet: _ }, [me]],
                        myMeasurePairInFacetUniqueID: [{ myHistogramUniqueID: _ }, [me]]
                    },
                    [areaOfClass, "OverlayMeasurePairInFacet"]
                ],

                // now, select out of the valueMeasure os of objects in the corresponding OverlayMeasurePairInFacet area, the object that corresponds to my 
                // bin's binValue.
                myValueMeasureInOverlayMeasurePairInFacet: [
                    { value: [{ myBin: { binValue: _ } }, [me]] },
                    [{ myOverlayMeasurePairInFacet: { valueMeasure: _ } }, [me]]
                ],

                // myHistogramCanvas: provided by TrackMyHistogram
                val: [{ barVal: _ }, [me]],

                barPositiveVal: [greaterThanOrEqual, [{ barVal: _ }, [me]], 0],
                barPositiveStableVal: [greaterThanOrEqual, [{ barStableVal: _ }, [me]], 0]
            }
        },
        {
            qualifier: {
                facetState: facetState.histogram,
                barHasDimension: true
            },
            context: {
                myValLine: [{ children: { valLine: _ } }, [me]]
            },
            children: {
                valLine: {
                    description: {
                        "class": "HistogramScaleElement",
                        context: {
                            myHistogram: [{ myHistogram: _ }, [embedding]],
                            // the HistogramBars are laid out on one axis (vertical, currently). the valLiine should be positioned on the Histogram's canvas,
                            // which extends on the orthogonal axis.
                            value: [{ val: _ }, [embedding]]
                        },
                        position: {
                            width: 0,
                            height: 0
                        }
                    }
                }
            },
            position: {
                attachOneSideToZeroLine: {
                    point1: {
                        element: [{ myZeroLine: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]] // i.e. "left" when the HistogramBar's ofVerticalElement is false. 
                    },
                    point2: {
                        type: [cond,
                            [greaterThan,
                                [{ val: _ }, [me]],
                                0
                            ],
                            o(
                                {
                                    on: true,
                                    use: [cond,
                                        [{ ofVerticalElement: _ }, [me]],
                                        o({ on: true, use: "left" }, { on: false, use: "bottom" })
                                    ]
                                },
                                {
                                    on: false,
                                    use: [cond,
                                        [{ ofVerticalElement: _ }, [me]],
                                        o({ on: true, use: "right" }, { on: false, use: "top" })
                                    ]
                                }
                            )
                        ]
                    },
                    equals: 0
                },
                attachOtherSideToValLine: {
                    point1: {
                        element: [{ myValLine: _ }, [me]],
                        type: [{ lowHTMLGirth: _ }, [me]] // i.e. "left" when the HistogramBar's ofVerticalElement is false. 
                    },
                    point2: {
                        type: [cond,
                            [greaterThan,
                                [{ val: _ }, [me]],
                                0
                            ],
                            o(
                                {
                                    on: true,
                                    use: [cond,
                                        [{ ofVerticalElement: _ }, [me]],
                                        o({ on: true, use: "right" }, { on: false, use: "top" })
                                    ]
                                },
                                {
                                    on: false,
                                    use: [cond,
                                        [{ ofVerticalElement: _ }, [me]],
                                        o({ on: true, use: "left" }, { on: false, use: "bottom" })
                                    ]
                                }
                            )
                        ]
                    },
                    equals: 0
                }
            },
            write: {
                onHistogramBarMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        registerOverlaySelected: {
                            to: [{ uniqueIDOfOverlaySelected: _ }, [me]],
                            merge: [{ myOverlay: { uniqueID: _ } }, [me]]
                        },
                        registerHistogramSelected: {
                            to: [{ uniqueIDOfHistogramSelected: _ }, [me]],
                            merge: [{ myHistogramUniqueID: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                ofSliderFacet: true,
                ofIntOverlay: true,
                readyForSelection: false
            },
            write: {
                onHistogramBarMouseClick: {
                    // upon: see default clause
                    true: {
                        registerBar: {
                            to: [{ readyForSelection: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { readyForSelection: true },
            children: {
                SliderHistogramBarSelectionsContainer: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SliderHistogramBarSelectionsContainer"
                    }
                }
            },
            write: {
                onHistogramBarAnyMouseDown: {
                    upon: o(
                        escEvent,
                        [mouseDownNotHandledBy,
                            [areaOfClass, "SliderHistogramBarSelectionsControl"]
                        ]
                    ),
                    true: {
                        deregisterBar: {
                            to: [{ readyForSelection: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                facetState: facetState.histogram,
                barHasDimension: false
            },
            position: {
                zeroGirth: { // though for HistogramBar this actually means its "length" - so in a bar in an MSFacet, it's 0 width
                    // and in a bar in a date facet, it is 0 height.
                    point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                    point2: { type: [{ highHTMLGirth: _ }, [me]] },
                    equals: 0
                }
            }
        },
        {
            qualifier: { histogramDisplayModeUnitDistribution: "unit" },

            context: {
                barVal: [round,
                    [{ barMeasureVal: _ }, [me]],
                    [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                ],

                // the HistogramBar also provides the *stable* bar values,
                //  used in the calculation of the max value of the
                //  histogram scale.
                // here and in the variant below
                barStableVal: [round,
                    [{ barStableMeasureVal: _ }, [me]],
                    [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { histogramDisplayModeUnitDistribution: "distribution" },
            context: {
                barVal: [round,
                    [{ myValueMeasureInOverlayMeasurePairInFacet: { measureDistributionInSolutionSet: _ } }, [me]],
                    [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                ],
                barStableVal: [round,
                    [{ myValueMeasureInOverlayMeasurePairInFacet: { measureDistributionInStableSolutionSet: _ } }, [me]],
                    [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: { ofDateFacet: true },
            context: {
                valDisplayPrefix: [{ myBin: { barValDisplayPrefix: _ } }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////////////////////
    // This bar represents the baseSet in the embedding bin. It inherits
    //  HistogramBar.
    // This bar extends across the entire "base" axis of its bin, which is
    //  different from the other bars in the bin.
    //////////////////////////////////////////////////////////////////////
    HistogramBaseBar: {
        "class": o("HistogramBaseBarDesign", "DisplayBarValues", "HistogramBar"),
        context: {
            // HistogramBar params:
            myOverlay: [{ myApp: { effectiveBaseOverlay: _ } }, [me]],

            // HistogramBar params:
            // no difference between the solutionSet and the stableSolutionSet for the effectiveBaseOverlay
            barMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInStableSolutionSetMeasureVal: _ } }, [me]],
            barStableMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInStableSolutionSetMeasureVal: _ } }, [me]]
        },
        position: {
            lowHTMLLengthAttachment: {
                point1: {
                    element: [{ myBin: _ }, [me]],
                    label: "baseBarLowHTMLLength"
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: 0
            },
            highHTMLLengthAttachment: {
                point1: {
                    element: [{ myBin: _ }, [me]],
                    label: "baseBarHighHTMLLength"
                },
                point2: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                equals: 0
            }
        },
        stacking: {
            histogramBaseBars: {
                lower: { label: "histogram base bars", element: [{ myFacet: _ }, [me]] },
                higher: [me]
            },
            belowImplicit: {
                lower: [me],
                higher: { label: "histogram implicit bars", element: [{ myFacet: _ }, [me]] }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // This class represents a histogramBar for the implicit1DSet of a
    //   single intensional overlay that is showing. It is embedded in the
    //   HistogramBin.
    //
    // stacking: in general, the implicit1DSetBars appear z-below their
    //   respective solutionSetBars, unless they are the focus of the
    //   inquiry, in which case they appear z-above them.
    // currently this is done when we hover over an implicit1DSetBar *in
    //   the histogram distribution mode*, as there we have no guarantee
    //   that the implicit bars are indeed a set of their
    //   corresponding solutionSetBar.
    //
    // This class positions itself along the histogram bin's "basis" axis,
    //   by attaching itself to its corresponding solutionSet bar: for
    //   every implicit1D bar there's a corresponding solutionSet bar;
    //   the opposite, on the other hand, does not hold true. so it's the
    //   solutionSet bars that determine the division of the histogram
    //   bin's basis axis.
    ///////////////////////////////////////////////////////////////////////
    HistogramImplicit1DSetBar: o(
        { // variant-controller
            qualifier: "!",
            context: {
                setImplicit1DSetBarsZHigher: [
                    and,
                    [equal, [{ histogramDisplayModeUnitDistribution: _ }, [me]], "distribution"],
                    [
                        {
                            myHistogram: {
                                histogramImplicit1DSetBar: {
                                    pointerInMeNotInMySolutionSetBar: _
                                }
                            }
                        },
                        [me]
                    ]
                ]
            }
        },

        { // default
            "class": o(
                "HistogramImplicit1DSetBarDesign", "GeneralArea", "HistogramBar",
                "TrackMySelectableFacetXIntOverlay"
            ),
            context: {

                // HistogramBar params:
                barMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInImplicit1DSetItemMeasureVal: _ } }, [me]],
                barStableMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInImplicit1DSetItemMeasureVal: _ } }, [me]],

                mySolutionSetBar: [
                    { myOverlay: [{ myOverlay: _ }, [me]] },
                    [{ myBin: { children: { solutionSetBars: _ } } }, [me]]
                ],

                pointerInMeNotInMySolutionSetBar: [
                    and,
                    [{ inArea: _ }, [me]],
                    [not, [{ mySolutionSetBar: { inArea: _ } }, [me]]]
                ]
            }
        },
        {
            qualifier: { facetState: facetState.histogram },
            position: {
                attachToLowHTMLLengthOfMySolutionSetBar: {
                    point1: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ mySolutionSetBar: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: 0
                },
                attachToHighHTMLLengthOfMySolutionSetBar: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ mySolutionSetBar: _ }, [me]],
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    equals: 0
                }
            },
            stacking: {
                histogramImplicitBars: {
                    lower: { label: "histogram implicit bars", element: [{ myFacet: _ }, [me]] },
                    higher: [me]
                },
                belowSolutionSetBars: {
                    lower: [me],
                    higher: { label: "histogram solution set bars", element: [{ myFacet: _ }, [me]] }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    // This class represents a histogramBar for the solutionSet of a
    //   single overlay in the Showing state. It is embedded in the
    //   HistogramBin.
    //
    // All instances of this class in a given bin equally divide the
    //   "basis" axis of the embedding bin (with one bar for each overlay
    //   that's in the Showing state).  This is done using the
    //   virtualBeginningGirthOfSolutionSetBars/
    //   virtualEndGirthOfSolutionSetBars positioning labels defined in the
    //   associated bin area.
    //
    // API:
    //  1. anchorForFirstInBin / anchorForLastInBin: default values
    //      provided
    ///////////////////////////////////////////////////////////////////////
    HistogramSolutionSetBar: o(
        { // variant-controller
            qualifier: "!",
            context: {
                firstInBin: [{ firstInAreaOS: _ }, [me]],
                lastInBin: [{ lastInAreaOS: _ }, [me]]
            }
        },
        { // default
            "class": o(
                "HistogramSolutionSetBarDesign", "GeneralArea", "HistogramBar", "DisplayBarValues", "MemberOfTopToBottomAreaOS",
                "TrackMySelectableFacetXIntOverlay"
            ),
            context: {

                // HistogramBar params:
                barMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInSolutionSetMeasureVal: _ } }, [me]],
                barStableMeasureVal: [{ myValueMeasureInOverlayMeasurePairInFacet: { valInStableSolutionSetMeasureVal: _ } }, [me]],

                anchorForFirstInBin: {
                    element: [{ myBin: _ }, [me]],
                    label: "baseBarLowHTMLLength"
                },
                anchorForLastInBin: {
                    element: [{ myBin: _ }, [me]],
                    label: "baseBarHighHTMLLength"
                },
                // MemberOfTopToBottomAreaOS param:
                spacingFromPrev: [{ histogramPosConst: { solutionSetBarSpacing: _ } }, [globalDefaults]]
            },
            stacking: {
                histogramSolutionSetBars: {
                    lower: { label: "histogram solution set bars", element: [{ myFacet: _ }, [me]] },
                    higher: [me]
                },
                belowAdditionalControlsLayer: { // additional control themselves may not be present 
                    lower: [me],
                    higher: { label: "histogram additional controls", element: [{ myFacet: _ }, [me]] }
                }
            }
        },
        {
            qualifier: { facetState: facetState.histogram },
            position: {
                minGirthForSolutionSetBars: {
                    point1: { type: [{ lowHTMLLength: _ }, [me]] },
                    point2: { type: [{ highHTMLLength: _ }, [me]] },
                    min: [{ histogramPosConst: { minWidthForSolutionSetHistogramBar: _ } }, [globalDefaults]],
                    // if there are many histogram bars, and not enough room to accommodate them, then they should given in well before other constraints do.
                    // the user will essentially see a progressively narrower set of solutionSetBars, which is a strong hint that they should manage their
                    // workspace differently (e.g. hide one of the overlays, change the resolution of the histogram, etc.)
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                },

                // the bar is horizontal, so its "width" is from top to bottom
                // we place the virtual labels in the communal histogram
                equalGirthForAllSolutionSetBarsInBin: {
                    pair1: {
                        point1: { type: [{ lowHTMLLength: _ }, [me]] },
                        point2: { type: [{ highHTMLLength: _ }, [me]] }
                    },
                    pair2: {
                        point1: {
                            element: [{ myBin: _ }, [me]],
                            label: "virtualBeginningGirthOfSolutionSetBars"
                        },
                        point2: {
                            element: [{ myBin: _ }, [me]],
                            label: "virtualEndGirthOfSolutionSetBars"
                        }
                    },
                    ratio: 1
                }
            }
        },

        {
            qualifier: {
                facetState: facetState.histogram,
                firstInBin: true
            },

            position: {
                attachFirstSolutionSetBar: {
                    point1: [{ anchorForFirstInBin: _ }, [me]],
                    point2: {
                        type: [{ lowHTMLLength: _ }, [me]]
                    },
                    equals: [{ histogramPosConst: { solutionSetBarSpacing: _ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },

        {
            qualifier: {
                facetState: facetState.histogram,
                lastInBin: true
            },

            position: {
                attachLastSolutionSetBar: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: [{ anchorForLastInBin: _ }, [me]],
                    equals: [{ histogramPosConst: { solutionSetBarSpacing: _ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    // API:
    // 1. enabled: default provided
    ///////////////////////////////////////////////////////////////////////
    HistogramScaleControl: o(
        { // default
            "class": o("GeneralArea", "DisplayDimension", "TrackMyHistogram"),
            context: {
                myMaxHistogramScaleLabel: [
                    { children: { text: _ } },
                    [
                        { myHistogram: [{ myHistogram: _ }, [me]], isMaxValue: true },
                        [areaOfClass, "HistogramScaleLabeledTickmark"]
                    ]
                ]
            }
        },
        {
            qualifier: { enabled: true },
            "class": "TooltipableControl",
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    HistogramScaleLinearOrLogControl: o(
        { // default
            "class": o("HistogramScaleLinearOrLogControlDesign", "HistogramScaleControl"),
            context: {
                displayText: [cond,
                    [{ histogramDisplayModeLinearLog: _ }, [me]],
                    o(
                        { on: "linear", use: "LIN" },
                        { on: "log", use: "LOG" }
                    )
                ],
                tooltipText: [cond,
                    [{ histogramDisplayModeLinearLog: _ }, [me]],
                    o(
                        { on: "linear", use: [{ linearStr: _ }, [me]] },
                        { on: "log", use: [{ logStr: _ }, [me]] }
                    )
                ]
            },
            write: {
                onHistogramScaleLinearOrLogControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleLinearLog: {
                            to: [{ histogramDisplayModeLinearLog: _ }, [me]],
                            merge: [cond,
                                [{ histogramDisplayModeLinearLog: _ }, [me]],
                                o(
                                    { on: "linear", use: "log" },
                                    { on: "log", use: "linear" }
                                )
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                minLeftFromMyMaxHistogramScaleLabelRight: {
                    point1: {
                        element: [{ myMaxHistogramScaleLabel: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: [{ histogramPosConst: { linearLogControlHorizontalMargin: _ } }, [globalDefaults]]
                },
                minLeftFromMyHistogramViewRight: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    min: 0
                },
                eitherAttachLeftToMyMaxHistogramScaleLabelRight: {
                    point1: {
                        element: [{ myMaxHistogramScaleLabel: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ histogramPosConst: { linearLogControlHorizontalMargin: _ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "linearLogControlHorizontal" }
                },
                orAttachLeftToMyHistogramViewRight: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "linearLogControlHorizontal" }
                },
                attachVerticalCenterToMyMaxHistogramScaleLabel: {
                    point1: {
                        element: [{ myMaxHistogramScaleLabel: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                attachToMyMaxHistogramScaleLabelTop: {
                    point1: { type: "bottom" },
                    point2: {
                        element: [{ myMaxHistogramScaleLabel: _ }, [me]],
                        type: "top"
                    },
                    equals: 0
                },
                attachToMyMaxHistogramScaleLabelRight: {
                    point1: { type: "right" },
                    point2: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    TrackMyHistogram: o(
        { // variant-controller
            qualifier: "!",
            context: {
                histogramDisplayModeLinearLog: [{ myHistogram: { displayModeLinearLog: _ } }, [me]],
                histogramDisplayModeUnitDistribution: [{ myHistogram: { displayModeUnitDistribution: _ } }, [me]],

                displayHistogramBarsAndScale: [{ myHistogram: { displayHistogramBarsAndScale: _ } }, [me]],

                inHistogram: [{ myHistogram: { inArea: _ } }, [me]],

                scaleAtLowHTML: [{ scaleAtLowHTML: _ }, [embedding]],

                showImplicit1DSetBars: [{ myHistogram: { showImplicit1DSetBars: _ } }, [me]],

                ofFirstHistogram: [{ myHistogram: { firstInAreaOS: _ } }, [me]],
                ofLastHistogram: [{ myHistogram: { lastInAreaOS: _ } }, [me]],

                multipleHistogramsInFacet: [{ myHistogram: { multipleHistogramsInFacet: _ } }, [me]]
            }
        },

        { // default
            "class": o("GeneralArea", "OrientedElement", "TrackMyFacet", "TrackMeasurePairInFacet"),
            context: {
                myHistogram: [
                    [embeddingStar, [me]],
                    [areaOfClass, "HistogramCore"]
                ],
                myHistogramUniqueID: [{ myHistogram: { uniqueID: _ } }, [me]],
                myHistogramView: [{ myHistogram: { myHistogramView: _ } }, [me]],
                myHistogramDataObj: [{ myHistogram: { myHistogramDataObj: _ } }, [me]],
                myMeasurePairInFacet: [{ myHistogram: { myMeasurePairInFacet: _ } }, [me]],
                myHistogramsDoc: [{ myHistogram: { myHistogramsDoc: _ } }, [me]],
                myZeroLine: [{ myHistogram: { children: { zeroLine: _ } } }, [me]],
                myHistogramCanvas: [{ myHistogram: { children: { canvas: _ } } }, [me]],
                myFacet: [{ myHistogram: { myFacet: _ } }, [me]],
                myWidget: [{ myHistogram: { myWidget: _ } }, [me]],

                refOrientedElement: [{ myHistogram: _ }, [me]],

                myHistogramsView: [{ myHistogram: { myHistogramsView: _ } }, [me]],
                uniqueIDOfOverlaySelected: [{ myHistogram: { uniqueIDOfOverlaySelected: _ } }, [me]],
                uniqueIDOfHistogramSelected: [{ myHistogram: { uniqueIDOfHistogramSelected: _ } }, [me]],

                myAddNewHistogramControl: [{ myHistogram: { myAddNewHistogramControl: _ } }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    HistogramBarValDisplayClipper: {
        "class": o("GeneralArea", "OrientedElement", "TrackMyFacet"),
        context: {
            // note that this area is embedded in the Amoeba, and not in the Histogram, so we refer to the orientation (Horizontal/Vertical)
            // of the associated PrimaryWidget.
            refOrientedElement: [{ myPrimaryWidget: _ }, [me]],

            firstHistogramView: [
                {
                    myFacet: [{ myFacet: _ }, [me]],
                    ofFirstHistogram: true
                },
                [areaOfClass, "HistogramView"]
            ],
            lastHistogramView: [
                {
                    myFacet: [{ myFacet: _ }, [me]],
                    ofLastHistogram: true
                },
                [areaOfClass, "HistogramView"]
            ],
            firstHistogram: [
                {
                    myFacet: [{ myFacet: _ }, [me]],
                    firstInAreaOS: true
                },
                [areaOfClass, "Histogram"]
            ]
        },
        position: {
            attachToBeginningGirthOfHistogramView: {
                point1: {
                    element: [cond,
                        [{ ofVerticalElement: _ }, [me]],
                        o(
                            { on: true, use: [{ firstHistogramView: _ }, [me]] },
                            { on: false, use: [{ lastHistogramView: _ }, [me]] }
                        )
                    ],
                    type: [{ beginningGirth: _ }, [me]],
                    content: true
                },
                point2: { type: [{ beginningGirth: _ }, [me]] },
                equals: 0
            },
            attachEndGirthToEmbedding: {
                point1: { element: [embedding], type: [{ endGirth: _ }, [me]], content: true },
                point2: { type: [{ endGirth: _ }, [me]] },
                equals: 0
            },
            attachLowHTMLLengthToHistogramOrHistogramView: {
                point1: {
                    element: [cond,
                        [{ ofVerticalElement: _ }, [me]],
                        o(
                            { on: true, use: [{ firstHistogramView: _ }, [me]] },
                            { on: false, use: [{ firstHistogram: _ }, [me]] }
                        )
                    ],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                point2: { type: [{ lowHTMLLength: _ }, [me]] },
                equals: 0
            },
            attachHighHTMLLengthToEmbedding: {
                point1: { element: [embedding], type: [{ highHTMLLength: _ }, [me]], content: true },
                point2: { type: [{ highHTMLLength: _ }, [me]] },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    DisplayBarValues: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // a hack to work around very slow performance as of r5440 (and earlier) where hovering over a bar takes a while to produce its 
                // overlays's bar's HistogramBarValDisplay. to avoid that, we attempt to produce these only for those whose bin is in view.
                // for numeric bins (sliders/dates): all of them are in view. 
                // for discrete facets: we check whether their DiscreteValue is entirely within view.
                // once positioning can better handle sets of constraints, the need for this hack should be revisited.
                ofBinWithinView: o(
                    [
                        [{ myBin: _ }, [me]],
                        [areaOfClass, "NumericHistogramBin"]
                    ],
                    [and,
                        [
                            [{ myBin: _ }, [me]],
                            [areaOfClass, "DiscreteHistogramBin"]
                        ],
                        [{ myBin: { myDiscreteValue: { inFullView: _ } } }, [me]]
                    ]
                )
            }
        },
        { // default
        },
        {
            qualifier: {
                ofBinWithinView: true,
                displayBarValues: true
            },
            children: {
                valDisplay: {
                    partner: [
                        { myFacet: [{ myFacet: _ }, [me]] },
                        [areaOfClass, "HistogramBarValDisplayClipper"]
                    ],
                    description: {
                        "class": "HistogramBarValDisplay"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramBarValDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // as part of an attempt to figure out the price of display queries on 'transient' values displayed
                fixedHeight: [arg, "debugCreateBarValDisplayWithFixedHeight", true] // i.e. not calculated via a displayQuery
            }
        },
        { // default
            "class": o("HistogramBarValDisplayDesign", "IconAboveAppZTop", "TrackMyHistogram"),
            context: {
                myBar: [expressionOf],
                myHistogram: [{ myBar: { myHistogram: _ } }, [me]],

                refOrientedElement: [{ myHistogram: { myWidget: _ } }, [me]], // not simply myBar because of #2118.   

                displayTextPrefix: [concatStr,
                    o(
                        [cond,
                            [{ myBar: { valDisplayPrefix: _ } }, [me]],
                            o({ on: true, use: o([{ myBar: { valDisplayPrefix: _ } }, [me]], ":", " ") })
                        ],
                        // if there is no myBar.valDisplayPrefix, then this numberToString is redundant. if it is defined, then
                        // we must convert the string to the proper format *before* it goes into the concatStr.
                        [numberToStringPerNumericFormat,
                            [{ myBar: { barVal: _ } }, [me]],
                            [{ numericFormat: _ }, [me]],
                            true // useStandardPrecision
                        ]
                    )
                ]
            },
            position: {
                "content-width": [displayWidth]
            }
        },
        {
            qualifier: { histogramDisplayModeUnitDistribution: "unit" },
            context: {
                displayText: [{ displayTextPrefix: _ }, [me]]
            }
        },
        {
            qualifier: { histogramDisplayModeUnitDistribution: "distribution" },
            context: {
                displayText: [concatStr, o([{ displayTextPrefix: _ }, [me]], "%")]
            }
        },
        {
            qualifier: { fixedHeight: false },
            position: {
                "content-height": [displayHeight]
            }
        },
        {
            qualifier: { fixedHeight: true },
            position: {
                "content-height": [{ histogramPosConst: { histogramBarValDisplayFixedHeight: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                maxOffsetFromBarAndView: {
                    point1: {
                        element: o(
                            [{ myBar: _ }, [me]],
                            [{ myHistogramView: _ }, [me]]
                        ),
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    max: [{ histogramPosConst: { offsetOfHistogramBarFromItsValDisplay: _ } }, [globalDefaults]]
                },
                horizontallyFixedToBarOrView: {
                    point1: {
                        element: o(
                            [{ myBar: _ }, [me]],
                            [{ myHistogramView: _ }, [me]]
                        ),
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ histogramPosConst: { offsetOfHistogramBarFromItsValDisplay: _ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "myAnchorToBarOrView" }
                },
                attachToBarVertically: {
                    point1: {
                        element: [{ myBar: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                maxOffsetFromBarAndView: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: o(
                            [{ myBar: _ }, [me]],
                            [{ myHistogramView: _ }, [me]]
                        ),
                        type: "top"
                    },
                    max: [{ histogramPosConst: { offsetOfHistogramBarFromItsValDisplay: _ } }, [globalDefaults]]
                },
                verticallyFixedToBarOrView: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: o(
                            [{ myBar: _ }, [me]],
                            [{ myHistogramView: _ }, [me]]
                        ),
                        type: "top"
                    },
                    equals: [{ histogramPosConst: { offsetOfHistogramBarFromItsValDisplay: _ } }, [globalDefaults]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "myAnchorToBarOrView" }
                },
                centerWithBar: {
                    point1: {
                        element: [{ myBar: _ }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramAdditionalControls: {
        "class": o("GeneralArea", "OverlayLegend", "TrackMyFacet", "TrackMyOverlay"),
        context: {
            // OverlayLegend param
            myOverlay: [
                { uniqueID: [{ uniqueIDOfOverlaySelected: _ }, [embedding]] },
                [areaOfClass, "PermOverlay"]
            ],
            myHistogramView: [
                { myHistogramUniqueID: [{ uniqueIDOfHistogramSelected: _ }, [embedding]] },
                [areaOfClass, "HistogramView"]
            ],
            marginFromHistogramView: [densityChoice, [{ fsAppPosConst: { amoebaControlVerticalMargin: _ } }, [globalDefaults]]]
        },
        position: {
            attachToMyHistogramViewRight: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: "right",
                    content: true
                },
                equals: [{ marginFromHistogramView: _ }, [me]]
            },
            attachToMyHistogramViewTop: {
                point1: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: "top",
                    content: true
                },
                point2: {
                    type: "top"
                },
                equals: [{ marginFromHistogramView: _ }, [me]]
            }
        },
        stacking: {
            aboveHistogramAdditionalControlsZLayer: {
                lower: { label: "histogram additional controls", element: [{ myFacet: _ }, [me]] },
                higher: [me]
            },
            belowHistogramTop: {
                lower: [me],
                higher: { label: "histogram top", element: [{ myFacet: _ }, [me]] }
            }
        },
        children: {
            hideOverlayInFacetControl: {
                description: {
                    "class": "HistogramHideOverlayInFacetControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramHideOverlayInFacetControl: {
        "class": o("GeneralArea", "TrackMyFacet", "HideOverlayInFacetControl"),
        context: {
            myOverlayLegend: [embedding],

            myHistogramsView: [
                { myFacet: [{ myFacet: _ }, [me]] },
                [areaOfClass, "HistogramsView"]
            ]
        },
        write: {
            onHistogramHideOverlayInFacetControlClick: {
                upon: o(
                    mouseClickEvent,
                    [not,
                        [overlap,
                            [{ myHistogramView: _ }, [embedding]],
                            [pointer]
                        ]
                    ],
                    [mouseDownHandledBy,
                        [{ myHistogramView: _ }, [embedding]]
                    ]
                ),
                true: {
                    // since the mouseDown on this area is blocked from propagating to the HistogramView, we need to ensure that the uniqueIDOfOverlaySelected
                    // is reset at the completion of this operation.
                    resetUniqueIDOfOverlaySelected: {
                        to: [{ myHistogramsView: { uniqueIDOfOverlaySelected: _ } }, [me]],
                        merge: o()
                    },
                    resetUniqueIDOfHistogramSelected: {
                        to: [{ myHistogramsView: { uniqueIDOfHistogramSelected: _ } }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // this class can be used as a histogram's canvas
    // it draws the values from 'myHistogram.roundedValues, defines minUnit  to
    //  be '1' for count modes, 0.1 for distribution, minValue at 0;
    // this class shamelessly assumes that the histogram canvas is left
    //  to right
    // for logarithmic  scales, the linear part is forced to remain at or below
    //  a single primary spacing distance from 0 (computedZeroMarginPixelSize)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramCanvas: o(
        { // default
            "class": o(
                "HistogramDistributionEdgeRounder",   // Inherited before SegmentedCanvasAdapter, so that its definition of maxRoundEdge takes precedence
                "SegmentedCanvasAdapter",
                "CanvasFacetConf",
                "TrackMyHistogram"
            ),
            context: {
                scaleType: [{ histogramDisplayModeLinearLog: _ }, [me]],

                numberOfDigits: [{ myHistogram: { numberOfDigits: _ } }, [me]],
                numericFormatType: [cond,
                    [{ myMeasureFunctionUniqueID: o(functionID.percent, functionID.count) }, [me]],
                    o(
                        {
                            on: true,
                            use: "fixed"
                        },
                        {
                            on: false,
                            use: "financialSuffix"/*[{ myMeasureFacetDataObj: { numericFormatType:_ } }, [me]]*/
                        }
                    )
                ],
                commaDelimited: [cond,
                    [{ myMeasureFunctionUniqueID: o(functionID.percent, functionID.count) }, [me]],
                    o(
                        { on: true, use: false },
                        { on: false, use: [{ myMeasureFacetDataObj: { commaDelimited: _ } }, [me]] }
                    )
                ],

                scaleMarkSpacingTable: o(
                    {
                        density: "V1",
                        scaleType: "any",
                        primary: 40,
                        secondary: 23,
                        unlabeled: 9
                    },
                    {
                        density: "V2",
                        scaleType: "any",
                        primary: 50,
                        secondary: 32,
                        unlabeled: 11
                    },
                    {
                        density: "V3",
                        scaleType: "any",
                        primary: 60,
                        secondary: 38,
                        unlabeled: 14
                    }
                ),

                values: o(
                    0, // ensure that 0 appears in the HistogramScale.
                    [{ myHistogram: { roundedValues: _ } }, [me]]
                ),

                minDataValue: [cond,
                    [{ countMeasureFunctionSelected: _ }, [me]],
                    o(
                        { on: true, use: 0 },
                        { on: false, use: [min, [{ values: _ }, [me]]] }
                    )
                ],
                maxDataValue: [max, [{ values: _ }, [me]]],

                minValue: [cond,
                    [{ countMeasureFunctionSelected: _ }, [me]],
                    o(
                        { on: true, use: 0 },
                        { on: false, use: [{ minRoundEdge: _ }, [me]] }
                    )
                ],
                maxValue: [{ maxRoundEdge: _ }, [me]],

                // don't let the 0-margin section grow too big
                maxZeroNeighborhoodSize: [{ primaryLabelSpacing: _ }, [me]],
                computedZeroMarginPixelSize: [
                    mul,
                    [{ scaleComputedZeroMarginRatio: _ }, [me]],
                    [{ canvasPixelSize: _ }, [me]]
                ],
                scaleConfiguredZeroMarginRatio: [
                    cond,
                    [
                        and,
                        ["log", [{ scaleType: _ }, [me]]],
                        [
                            r(
                                [{ maxZeroNeighborhoodSize: _ }, [me]],
                                Infinity
                            ),
                            [{ computedZeroMarginPixelSize: _ }, [me]]
                        ]
                    ],
                    {
                        on: true,
                        use: [
                            div,
                            [{ maxZeroNeighborhoodSize: _ }, [me]],
                            [{ canvasPixelSize: _ }, [me]]
                        ]
                    }
                ]
            },
            position: {
                attachLowHTMLLengthToHistogramView: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: true
                    },
                    point2: { type: [{ lowHTMLLength: _ }, [me]] },
                    equals: 0
                },
                attachHighHTMLLengthToHistogramView: {
                    point1: {
                        type: [{ highHTMLLength: _ }, [me]]
                    },
                    point2: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: [{ highHTMLLength: _ }, [me]],
                        content: true
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            context: {
                minValPoint: {
                    element: [me],
                    type: "left",
                    content: true
                },
                maxValPoint: {
                    element: [me],
                    type: "right",
                    content: true
                }
            },
            position: {
                top: 0,
                height: 0
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            context: {
                // in a vertical histogram canvas (e.g. Date facet), the low value is always at the bottom
                minValPoint: {
                    element: [me],
                    type: "bottom",
                    content: true
                },
                maxValPoint: {
                    element: [me],
                    type: "top",
                    content: true
                }
            },
            position: {
                left: 0,
                width: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    // if the mode is a distribution mode, round max edge up to the smallest
    //  upper bound in {10%, 25%, 50%, 75%, 100%}
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    HistogramDistributionEdgeRounder: o(
        {
            qualifier: { histogramDisplayModeUnitDistribution: "distribution" },

            context: {
                hderRoundEdges: o(0, 10, 25, 50, 75, 100),
                //hderNegativeRoundEdges: [mul, -1, [{ hderRoundEdges:_ }, [me]]],
                hderNegativeRoundEdges: o(0, -10, -25, -50, -75, -100),

                hderUpperBounds: [
                    r([{ maxDataValue: _ }, [me]], 100),
                    [{ hderRoundEdges: _ }, [me]]
                ],
                hderLowerBounds: [
                    r(-100, [{ minDataValue: _ }, [me]]),
                    [{ hderNegativeRoundEdges: _ }, [me]]
                ],

                maxRoundEdge: [min, [{ hderUpperBounds: _ }, [me]]],
                minRoundEdge: [max, [{ hderLowerBounds: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class embeds a HistogramDropDown (via inheriting class). It is as big as its embedded HistogramDropDown, but extends all the way to the rc of
    // the associated HistogramView. This is used in the HistogramDropDown's displayDropDownShowControl: it allows displaying a fuller version of a long selection in one
    // of these dropDown menus (when the menu isn't open), and ensures that when you stand on the end of such a long selection, and the dropDownMenuable's
    // controls appear, you don't get a flicker effect (for the interested audience, what drives the flicker effect:
    // when the DropDownMenuable appears, it shortens the area, so the pointer is no longer inFocus: true, which results in the HistogramDropDown opting 
    // for its displayDropDownShowControl: false display (which is longer), which puts it once again under the pointer, etc. etc.   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramDropDownContainer: o(
        { // default
            "class": o("GeneralArea", "TrackMyHistogram"),
            context: {
                dropDownMenusVerticalOffset: [densityChoice, [{ histogramPosConst: { dropDownMenusVerticalOffset: _ } }, [globalDefaults]]]
            },
            propagatePointerInArea: o(),
            position: {
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [densityChoice, [{ histogramPosConst: { histogramViewWidth: _ } }, [globalDefaults]]]
                },
                centerHorizontallyWRTHistogramView: {
                    point1: {
                        type: "horizontal-center"
                    },
                    point2: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "horizontal-center",
                        content: true
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            context: {
                leftAnchorForDropDownContainer: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: "left",
                    content: true
                },
                rightAnchorForDropDownContainer: {
                    element: [{ myHistogramView: _ }, [me]],
                    type: "right",
                    content: true
                }
            },
            position: {
                // the margin from the horizontal sides of the histogramView so as to allow the moreControls of teh histogram to align with its right side.
                leftAlignWithMyHistogramView: {
                    point1: [{ leftAnchorForDropDownContainer: _ }, [me]],
                    point2: { type: "left" },
                    equals: [densityChoice, [{ histogramPosConst: { dropDownMenuHorizontalMarginFromHistogramView: _ } }, [globalDefaults]]]
                },
                rightAlignWithMyHistogramView: {
                    point1: { type: "right" },
                    point2: [{ rightAnchorForDropDownContainer: _ }, [me]],
                    equals: [densityChoice, [{ histogramPosConst: { dropDownMenuHorizontalMarginFromHistogramView: _ } }, [globalDefaults]]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "MinWrapHorizontal"
        }
    ),


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    // from Yoav's email re: the desired UX/logic
    // Measure (Aggregation function drop-down      Measure Facet drop-down
    //  number of items in each bin, there is no measure facet
    // count                                           <no menu>                         
    // this is the current 'percent': percentage of items in each bin.
    // percent                                         (count)                               
    // this is 'percent total(facet)' e.g. percent sales (that percentage of the total sales in the bin out of the total sales in all bins) 
    // percent                                         <facet name>
    // this is the general case, which always requires a measure facet to be specified '(count)' is not a valid option
    // <aggregation function> is any if total/average/min/max/median ...  etc.
    // <aggregation function>                   <facet name>
    // If the histogram is on a measure facet (that is, the histogram is in the amoeba of 'sales') then the facet itself should probably also appear in the 
    // list of measure facets. It is certainly well defined and sometimes may also make sense. For example, in the 'sales' facet, a histogram of 
    // median sales' will show you, for every bin of sales (e.g. 0-100K, 100K-200K, etc.) the median in that bin.
    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFunctionDropDownContainer: {
        "class": "HistogramDropDownContainer",
        children: {
            measureFunctionDropDown: {
                description: {
                    "class": "HistogramMeasureFunctionDropDown"
                }
            }
        },
        position: {
            top: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFacetDropDownContainer: o(
        { // default
            "class": "HistogramDropDownContainer",
            children: {
                measureFacetDropDown: {
                    description: {
                        "class": "HistogramMeasureFacetDropDown"
                    }
                }
            },
            position: {
                attachTopToMeasureFunctionDropDownBottom: {
                    point1: {
                        element: [
                            { myHistogram: [{ myHistogram: _ }, [me]] },
                            [areaOfClass, "HistogramMeasureFunctionDropDownContainer"]
                        ],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ dropDownMenusVerticalOffset: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            context: {
                dropDownContainerVerticalAnchor: [
                    { // the isMinValue primary label
                        myHistogram: [{ myHistogram: _ }, [me]],
                        isMinValue: true
                    },
                    [areaOfClass, "HistogramScalePrimaryLabel"]
                ]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                attachBottomToHistogramViewTop: {
                    point1: {
                        type: "bottom"
                    },
                    point2: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "top"
                    },
                    equals: [densityChoice,
                        [{ histogramPosConst: { measureFacetDropDownMenuVerticalOffsetFromHistogramView: _ } }, [globalDefaults]]
                    ]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramDropDown: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayDropDownShowControl: o(
                    [{ createDropDownMenu: _ }, [me]],
                    [{ inFocus: _ }, [embedding]]
                )
            }
        },
        { // default
            "class": o("HistogramDropDownDesign", "GeneralArea", "RefElementsDropDownMenuable", "TrackMyHistogram"),
            context: {
                height: [densityChoice, [{ histogramPosConst: { dropDownMenuHeight: _ } }, [globalDefaults]]],
            },
            position: {
                "horizontal-center": 0,
                top: 0,
                bottom: 0,
                minFromEmbedding: {
                    point1: { type: "right" },
                    point2: { element: [embedding], type: "right" },
                    min: 0
                }
            }
        },
        {
            qualifier: { displayDropDownShowControl: true },
            position: {
                width: [densityChoice, [{ histogramPosConst: { histogramViewWidth: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { displayDropDownShowControl: false },
            position: {
                // note we don't define the lc/rc. the TextOverflowEllipsisDesign inherited in the design class let's rc flow beyond rf
                pushContentToDisplayWidth: {
                    point1: { type: "left", content: true },
                    point2: { type: "right", content: true },
                    equals: [displayWidth],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFacetDropDown: o(
        {
            "class": o("HistogramMeasureFacetDropDownDesign", "HistogramDropDown"),
            context: {
                possibleFacetsData: [cond,
                    [{ countMeasureFunctionSelected: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ myApp: { referenceableNumericOrDateDataTypeFacetData: _ } }, [me]]
                        },
                        {
                            on: true,
                            use: [sort,
                                o(
                                    [{ myApp: { referenceableNumericOrDateDataTypeFacetData: _ } }, [me]],
                                    // if the measure function is count, the user may want to count by a string dataType facet (e.g. "Sector")
                                    [{ myApp: { nonTrashedStringDataTypeFacetData: _ } }, [me]]
                                ),
                                { uniqueID: [{ myApp: { reorderedFacetDataUniqueID: _ } }, [me]] }
                            ]
                        }
                    )
                ],

                // RefElementsDropDownMenuable API
                dropDownMenuLogicalSelection: [{ myMeasureFacetUniqueID: _ }, [me]], // override DropDownMenuable's AD to a rAD
                dropDownMenuTextForNoSelection: [concatStr,
                    o(
                        [{ myApp: { selectStr: _ } }, [me]],
                        " ",
                        [{ myApp: { facetEntityStr: _ } }, [me]]
                    )
                ],
                dropDownMenuLogicalSelectionsOS: o(
                    [cond, // if percent is the measure function, add measureFacetCountDistribution
                        [{ percentMeasureFunctionSelected: _ }, [me]],
                        o({ on: true, use: measureFacetCountDistribution })
                    ],
                    [{ possibleFacetsData: { uniqueID: _ } }, [me]]
                ),
                dropDownMenuDisplaySelectionsOS: o(
                    [cond, // if percent is the measure function, add measureFacetCountDistribution's display string
                        [{ percentMeasureFunctionSelected: _ }, [me]],
                        o({ on: true, use: [concatStr, o("(", [{ myApp: { measureFacetCountDistributionStr: _ } }, [me]], ")")] })
                    ],
                    [map,
                        // replace in the os of [{ possibleFacetsData: { name: _ } }, [me]], the host (myFacet) name with the string "Items"
                        // if the measure function is Count - so that we display "Count Items", and not, say, "Count Market Cap"
                        [defun,
                            "name",
                            [cond,
                                [and,
                                    [{ countMeasureFunctionSelected: _ }, [me]],
                                    [equal, "name", [{ myFacet: { name: _ } }, [me]]]
                                ],
                                o(
                                    { on: true, use: [{ myApp: { itemEntityStrPlural: _ } }, [me]] },
                                    { on: false, use: "name" }
                                )
                            ]
                        ],
                        [{ possibleFacetsData: { name: _ } }, [me]]
                    ]
                )
            },
            propagatePointerInArea: "embedding" // not in HistogramDropDown as the HistogramMeasureFacetDropDownDesign inherits Tooltipable/Tmdable
            // at a higher priority, and the latter sets propagatePointerInArea: o().            
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: { // part of the DropDownMenuable API: adding 
                    description: {
                        "class": "HistogramMeasureFacetMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMenu: {
        "class": "RightSideScrollbarDropDownMenu",
        context: {
            offsetFromDropDownMenuableBottom: [densityChoice, [{ histogramPosConst: { dropDownMenuMarginFromMenuableBottom: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFacetMenu: {
        "class": o("HistogramMeasureFacetMenuDesign", "HistogramMenu"),
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "HistogramMeasureFacetMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFacetMenuLine: {
        "class": o("HistogramMeasureFacetMenuLineDesign", "RefElementsMenuLine")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFunctionDropDown: o(
        {
            "class": o("HistogramMeasureFunctionDropDownDesign", "HistogramDropDown"),
            context: {
                measureFunctionUniqueIDs: o(
                    // note that the percent function actually translates to a functionID.sum with a percent display mode
                    // since the only function for which the percent mode applies is the sum function, we can force it into
                    // the list of measure functions, and thus spare the user a third dimension on top of measureFacet and measureFunction
                    functionID.percent,
                    functionID.count,
                    functionID.sum,
                    functionID.avg,
                    functionID.median,
                    functionID.topQuartile,
                    functionID.bottomQuartile,
                    functionID.topDecile,
                    functionID.bottomDecile,
                    functionID.stddev,
                    functionID.min,
                    functionID.max
                ),
                possibleFunctions: [map,
                    [defun,
                        o("funcID"),
                        {
                            uniqueID: "funcID",
                            name: [
                                [{ myApp: { functionNameStrFunc: _ } }, [me]],
                                "funcID",
                                "long"
                            ]
                        }

                    ],
                    [{ measureFunctionUniqueIDs: _ }, [me]]
                ],
                // RefElementsDropDownMenuable API
                dropDownMenuLogicalSelection: [{ myMeasureFunctionUniqueID: _ }, [me]], // override DropDownMenuable's AD to a rAD                
                dropDownMenuTextForNoSelection: [concatStr,
                    o(
                        [{ myApp: { selectStr: _ } }, [me]],
                        " ",
                        [{ myApp: { functionStr: _ } }, [me]]
                    )
                ],
                dropDownMenuLogicalSelectionsOS: [{ possibleFunctions: { uniqueID: _ } }, [me]],
                dropDownMenuDisplaySelectionsOS: [{ possibleFunctions: { name: _ } }, [me]]
            },
            propagatePointerInArea: "embedding" // not in HistogramDropDown as the HistogramMeasureFacetDropDownDesign inherits Tooltipable/Tmdable
            // at a higher priority, and the latter sets propagatePointerInArea: o().                        
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: { // part of the DropDownMenuable API: adding 
                    description: {
                        "class": "HistogramMeasureFunctionMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFunctionMenu: {
        "class": o("HistogramMeasureFunctionMenuDesign", "HistogramMenu"),
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "HistogramMeasureFunctionMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMeasureFunctionMenuLine: o(
        { // variant-controller
            qualifier: "!",
            context: {
                menuLineIsPercentOrCount: [
                    [{ name: _ }, [me]],
                    [
                        {
                            uniqueID: o(functionID.percent, functionID.count),
                            name: _
                        },
                        [{ myDropDownMenuable: { possibleFunctions: _ } }, [me]]
                    ]
                ]
            }
        },
        { // 
            "class": o("HistogramMeasureFacetMenuLineDesign", "RefElementsMenuLine")
        },
        {
            qualifier: { menuLineIsPercentOrCount: true },
            // nothing for now. should write to a different rAD then myMeasureFunctionUniqueID
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramUDFMeasureFacetAggregationControl: {
        "class": o("HistogramUDFMeasureFacetAggregationControlDesign", "AppControl", "TrackMyHistogram"),
        context: {
            defaultWidth: false, // override AppElement default
            defaultHeight: false, // override AppElement default

            myHistogramMeasureFacetDropDownContainer: [
                { myHistogram: [{ myHistogram: _ }, [me]] },
                [areaOfClass, "HistogramMeasureFacetDropDownContainer"]
            ],
            myHistogramMeasureFacetDropDown: [
                { myHistogram: [{ myHistogram: _ }, [me]] },
                [areaOfClass, "HistogramMeasureFacetDropDown"]
            ],
            myHistogramMeasureFunctionDropDown: [
                { myHistogram: [{ myHistogram: _ }, [me]] },
                [areaOfClass, "HistogramMeasureFunctionDropDown"]
            ],
            myUDFacetClipper: [
                { uniqueID: [{ myMeasureFacetUniqueID: _ }, [me]] },
                [areaOfClass, "UDFacetClipper"]
            ],

            tooltipText: [cond,
                [{ uDFAppliedToAggregationFunction: _ }, [me]],
                o(
                    { // of the form sum(installs)/sum(clicks)
                        on: true,
                        use: [generateFormulaForDisplay,
                            [{ myMeasureFacetDataObj: { cellExpression: _ } }, [me]],
                            [{ myUDFacetClipper: { uDFAllElements: _ } }, [me]],
                            [{ myHistogramMeasureFunctionDropDown: { displayText: _ } }, [me]] // the displayText of the aggregation function
                        ]
                    },
                    { // e.g. of the form "sum(installs/clicks)"
                        on: false,
                        use: [concatStr,
                            o(
                                [{ myHistogramMeasureFunctionDropDown: { displayText: _ } }, [me]], // e.g. "sum"
                                "(",
                                [{ myUDFacetClipper: { expressionAsStr: _ } }, [me]],
                                [generateFormulaForDisplay,
                                    [{ myMeasureFacetDataObj: { cellExpression: _ } }, [me]],
                                    [{ myUDFacetClipper: { uDFAllElements: _ } }, [me]],
                                    ""
                                ],
                                ")"
                            )
                        ]
                    }
                )
            ]
        },
        write: {
            onHistogramUDFMeasureFacetAggregationControlClick: {
                "class": "OnMouseClick",
                true: {
                    toggleUDFMeasureFacetAggregationControl: {
                        to: [{ uDFAppliedToAggregationFunction: _ }, [me]],
                        merge: [not, [{ uDFAppliedToAggregationFunction: _ }, [me]]]
                    }
                }
            }
        },
        position: {
            height: [densityChoice, [{ histogramPosConst: { uDFMeasureFacetAggregationControlHeight: _ } }, [globalDefaults]]],
            width: [densityChoice, [{ histogramPosConst: { uDFMeasureFacetAggregationControlWidth: _ } }, [globalDefaults]]],

            BoundLeftByLeftOfMeasureFacetDropdownContainer: {
                point1: {
                    element: [{ myHistogramMeasureFacetDropDownContainer: _ }, [me]],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                min: 0
            },
            rightPreferenceWRTMeasureFacetDropDown: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ myHistogramMeasureFacetDropDown: _ }, [me]],
                    type: "left"
                },
                equals: [densityChoice, [{ histogramPosConst: { uDFMeasureFacetAggregationControlOffsetFromMeasureFacetName: _ } }, [globalDefaults]]],
                // if there is not enough room, lose to the BoundLeftByLeftOfMeasureFacetDropdownContainer above
                priority: positioningPrioritiesConstants.weakerThanDefault
            },
            alignWithVerticalCenterOfMeasureFacetDropdown: {
                point1: {
                    element: [{ myHistogramMeasureFacetDropDownContainer: _ }, [me]],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            }
        },
        stacking: {
            higherThanMeasureFacetDropDown: {
                higher: [me],
                lower: [{ myHistogramMeasureFacetDropDown: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramDistributionModeInfo: o(
        { // default
            "class": o("HistogramDistributionModeInfoDesign", "GeneralArea", "InfoIconable", "TrackMyHistogram"),
            context: {
                dimension: [densityChoice, [{ histogramPosConst: { dropDownMenuHeight: _ } }, [globalDefaults]]], // override InfoIconable's default
                myMeasureFunctionDropDown: [
                    { myHistogram: [{ myHistogram: _ }, [me]] },
                    [areaOfClass, "HistogramMeasureFunctionDropDown"]
                ]
            },
            position: {
                alignHorizontallyWithMeasureFunctionDropDown: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ myMeasureFunctionDropDown: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                },
                alignVerticallyWithMeasureFunctionDropDownRight: {
                    point1: {
                        element: [{ myMeasureFunctionDropDown: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { createInfoIcon: true },
            children: {
                explanation: {
                    // partner: see InfoIconable
                    description: {
                        "class": "HistogramDistributionModeInfoIcon"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramDistributionModeInfoIcon: {
        "class": o("HistogramDistributionModeInfoIconDesign", "InfoIcon"),
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { definitionStr: _ } }, [me]], " ", [{ myApp: { ofStr: _ } }, [me]], " ", "100", " ", [{ myApp: { percentStr: { long: _ } } }, [me]], ":", "\n",
                    [{ myApp: { capitalizedTheStr: _ } }, [me]], " ", [{ myApp: { maxStr: { long: _ } } }, [me]], " ", [{ myApp: { ofStr: _ } }, [me]], "\n",
                    "1.", " ", [{ myApp: { capitalizedTheStr: _ } }, [me]], " ", [{ myApp: { sumStr: { long: _ } } }, [me]], " ", [{ myApp: { ofStr: _ } }, [me]], " ", [{ myApp: { theStr: _ } }, [me]], " ",
                    [{ myApp: { positiveStr: _ } }, [me]], " ", [{ myApp: { barEntityStrPlural: _ } }, [me]], "\n",
                    "2.", " ", [{ myApp: { capitalizedTheStr: _ } }, [me]], " ", [{ myApp: { sumStr: { long: _ } } }, [me]], " ", [{ myApp: { ofStr: _ } }, [me]], " ", [{ myApp: { theStr: _ } }, [me]], " ",
                    [{ myApp: { negativeStr: _ } }, [me]], " ", [{ myApp: { barEntityStrPlural: _ } }, [me]]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows to sort the msValues by a histogram and an overlay's bars in that histogram. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlayXHistogramSorter: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionsChangedWhileSortingByOverlayFrequency: [{ myFacet: { selectionsChangedWhileSortingByOverlayFrequency: _ } }, [me]],
                refreshMySorting: [{ myOverlayMeasurePairInFacet: { refreshMySorting: _ } }, [me]],

                createSortableOverlaysInHistogramMenu: [and,
                    [{ delayedInFocus: _ }, [me]],
                    o(
                        [greaterThan, [size, [{ myFacet: { overlaysInAmoeba: _ } }, [me]]], 1],
                        [and,
                            // there is only one overlaysInAmoeba and it is not the overlay sorted by!
                            // (i.e. the user sorted by the blue overlay, and then hid it. we want to allow switching to sorting by the green overlay now)
                            [equal, [size, [{ myFacet: { overlaysInAmoeba: _ } }, [me]]], 1],
                            [notEqual,
                                [{ myFacet: { latestSortingSortableUniqueID: _ } }, [me]],
                                "value"
                            ],
                            [not,
                                [
                                    [{ myFacet: { latestSortingSortableUniqueID: _ } }, [me]],
                                    [{ myFacet: { overlaysInAmoeba: { uniqueID: _ } } }, [me]]
                                ]
                            ]
                        ]
                    )
                ]
            }
        },
        { // default 
            "class": o("OverlayXHistogramSorterDesign", "DelayedInArea", "MSSorter", "TrackMyHistogram", "TrackMySelectableFacetXIntOverlay"),
            context: {
                // TrackMySelectableFacetXIntOverlay params:
                myOverlay: [first,
                    // if we're sorted by the msValues alphabetical sorting, then myFacet.myOverlay is not defined. 
                    // in that case, we look for overlaysInAmoeba. anyway, we take the first defined value in this combined os. 
                    o(
                        [{ myFacet: { myOverlay: _ } }, [me]],
                        [{ myFacet: { overlaysInAmoeba: _ } }, [me]]
                    )
                ],
                // myFacetUniqueID provided via inheritance of TrackMyHistogram/TrackMyFacetXIntOSR

                myOverlayMeasurePairInFacet: [
                    {
                        myOverlay: [{ myOverlay: _ }, [me]],
                        myFacet: [{ myFacet: _ }, [me]],
                        myMeasurePairInFacetUniqueID: [{ myHistogramUniqueID: _ }, [me]]
                    },
                    [areaOfClass, "OverlayMeasurePairInFacet"]
                ],

                // MSSorter param
                mySortable: [{ myOverlayMeasurePairInFacet: _ }, [me]],
                myHistogramMeasureFacetDropDownContainer: [
                    { myHistogram: [{ myHistogram: _ }, [me]] },
                    [areaOfClass, "HistogramMeasureFacetDropDownContainer"]
                ],
                mySortableOverlayMenuItems: [
                    { myHistogram: [{ myHistogram: _ }, [me]] },
                    [areaOfClass, "SortableOverlayMenuItem"]
                ]
            },
            position: {
                alignHorizontallyWithHistogramView: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "horizontal-center"
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                },
                belowFacetDropDownMeasureContainer: {
                    point1: {
                        element: [{ myHistogramMeasureFacetDropDownContainer: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [densityChoice, [{ histogramPosConst: { dropDownMenusVerticalOffset: _ } }, [globalDefaults]]]
                }
            },
            write: {
                onOverlayXHistogramSorterSortingEvent: {
                    upon: [clickHandledBy, // override default def.
                        o(
                            [me],
                            [{ mySortableOverlayMenuItems: _ }, [me]]
                        )
                    ],
                    true: {
                        recordIncludedOnLastSort: {
                            to: [{ myFacet: { includedOnLastSort: _ } }, [me]],
                            merge: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { included: _ } } }, [me]]
                        },
                        recordExcludedOnLastSort: {
                            to: [{ myFacet: { excludedOnLastSort: _ } }, [me]],
                            merge: [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { excluded: _ } } }, [me]]
                        },
                        resetMSValuesView: {
                            to: [{ myValuesView: { specifiedFiVUniqueID: _ } }, [me]],
                            merge: [{ myValuesView: { defaultSpecifiedFiVUniqueID: _ } }, [me]]
                        },
                        setAsTheHistogramSortedBy: {
                            to: [{ myFacet: { latestSortingMeasurePairInFacetUniqueID: _ } }, [me]],
                            merge: [{ myHistogramUniqueID: _ }, [me]] // the uniqueID of the histogram this all takes place in
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                createSortableOverlaysInHistogramMenu: false,
                sortingByMe: true
            },
            context: {
                tooltipText: [concatStr, // override the default value provided by SorterUX
                    o(
                        [cond,
                            [{ refreshMySorting: _ }, [me]],
                            o({ on: true, use: [{ myApp: { refreshStr: _ } }, [me]] })
                        ],
                        [{ myApp: { sortingStr: _ } }, [me]],
                        [{ myApp: { byStr: _ } }, [me]],
                        [cond,
                            [{ sortingDirection: _ }, [me]],
                            o(
                                { on: "ascending", use: [{ myApp: { ascendingStr: _ } }, [me]] },
                                { on: "descending", use: [{ myApp: { descendingStr: _ } }, [me]] }
                            )
                        ],
                        [{ myApp: { frequencyStr: _ } }, [me]],
                        [{ myApp: { inStr: _ } }, [me]],
                        [{ myOverlay: { name: _ } }, [me]]
                    ),
                    " "
                ]
            }
        },
        {
            qualifier: {
                sortingByMe: true,
                selectionsChangedWhileSortingByOverlayFrequency: false
            },
            write: {
                onOverlayXHistogramSorterChangedSelections: {
                    upon: [and,
                        [{ mySelectableFacetXIntOverlay: _ }, [me]],
                        o(
                            [changed, [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { included: _ } } }, [me]]],
                            [changed, [{ mySelectableFacetXIntOverlay: { stableSelectionsObj: { excluded: _ } } }, [me]]]
                        )
                    ],
                    true: {
                        raiseselectionsChangedWhileSortingByOverlayFrequency: {
                            to: [{ selectionsChangedWhileSortingByOverlayFrequency: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { createSortableOverlaysInHistogramMenu: true },
            children: {
                sortableOverlaysMenu: { // to allow the user to pick which overlay is to be used for the frequency-sorting
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SortableOverlaysInHistogramMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SortableOverlaysInHistogramMenu: {
        "class": o("SortableOverlaysInHistogramMenuDesign", "OverlaySelectorMenu"),
        context: {
            myFacet: [{ myIconable: { myFacet: _ } }, [me]],
            myHistogram: [{ myIconable: { myHistogram: _ } }, [me]],

            // OverlaySelectorMenu param:
            overlaySelectorMenuUniqueIDs: [{ myFacet: { overlaysInAmoeba: { uniqueID: _ } } }, [me]],
            menuItemText: "Sort"
        },
        children: {
            menuItem: {
                // data: see OverlaySelectorMenu
                description: {
                    "class": "SortableOverlayMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SortableOverlayMenuItem: o(
        { // variant-controller
            qualifier: "!",
            context: {
                sortedByMyOverlayAndHistogram: [and,
                    [equal,
                        [{ uniqueID: _ }, [me]],
                        [{ myFacet: { latestSortingSortableUniqueID: _ } }, [me]]
                    ],
                    [equal,
                        [{ myHistogramUniqueID: _ }, [me]],
                        [{ myFacet: { latestSortingMeasurePairInFacetUniqueID: _ } }, [me]]
                    ]
                ]
            }
        },
        { // default
            "class": o("OverlaySelectorMenuItem", "TrackMyHistogram"),
            context: {
                myFacet: [{ myFacet: _ }, [embedding]], // TrackMyFacet
                myHistogram: [{ myHistogram: _ }, [embedding]]
            },
            write: {
                onSortableOverlayMenuItemClick: {
                    "class": "OnMouseClick"
                    // true: see variants below
                }
            }
        },
        {
            qualifier: { sortedByMyOverlayAndHistogram: false },
            write: {
                onSortableOverlayMenuItemClick: {
                    // upon: see default clause above
                    true: {
                        setAsTheOverlaySortedBy: {
                            to: [{ myFacet: { latestSortingSortableUniqueID: _ } }, [me]],
                            merge: [{ uniqueID: _ }, [me]] // the uniqueID of the overlay represented by this menu item
                        },
                        startWithDescendingFrequencySorting: {
                            to: [{ myFacet: { latestSortingDirection: _ } }, [me]],
                            merge: "descending"
                        },
                        // see additional actions taken in OverlayXHistogramSorter's handler (including on mouseClicks on instances of SortableOverlayMenuItem) 
                        // and in particular setAsTheHistogramSortedBy
                    }
                }
            }
        },
        {
            qualifier: { sortedByMyOverlayAndHistogram: true },
            write: {
                onSortableOverlayMenuItemClick: {
                    // upon: see default clause above
                    true: {
                        toggleSortingDirection: {
                            to: [{ myFacet: { latestSortingDirection: _ } }, [me]],
                            merge: [cond,
                                [{ myFacet: { latestSortingDirection: _ } }, [me]],
                                o({ on: "ascending", use: "descending" }, { on: "descending", use: "ascending" })
                            ]
                        }
                    }
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMoreControls: o(
        { // default
            "class": o("HistogramMoreControlsDesign", "GeneralArea", "MoreControlsController", "MoreControlsOnClickUX", "TrackMyHistogram"),
            context: {
                myMoreControlsController: [me],
                tooltipText: [concatStr, o([{ myApp: { histogramEntityStr: _ } }, [me]], " ", [{ myApp: { optionEntityStrPlural: _ } }, [me]])]
            },
            position: {
                top: [densityChoice, [{ histogramPosConst: { moreControlsTopMargin: _ } }, [globalDefaults]]],
                alignHorizontallyWithHistogramView: {
                    point1: {
                        element: [{ myHistogramView: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "horizontal-center"
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { open: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "HistogramMoreControlsMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMoreControlsMenu: {
        "class": o("GeneralArea", "MoreControlsMenu", "TrackMyHistogram"),
        context: {
            myHistogram: [{ myMenuAnchor: { myHistogram: _ } }, [me]],
            menuData: o(
                [cond,
                    // allow deleting a histogram only if there is more than one histogram - the last one remaining cannot be deleted.
                    [{ multipleHistogramsInFacet: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: { uniqueID: "deleteHistogram" }
                        }
                    )
                ],
                [cond,
                    [arg, "debugExportHistogram", false],
                    o(
                        {
                            on: true,
                            use: //o(
                            { uniqueID: "exportHistogram" }
                            //{ uniqueID: "updateHistogram" }
                            //)
                        }
                    )
                ]
            )
        },
        children: {
            menuItems: {
                data: [{ menuData: _ }, [me]],
                description: {
                    "class": "HistogramMenuItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramMenuItem: o(
        { // default
            "class": o("MenuItemDirect", "TrackMyHistogram"),
            context: {
                myHistogram: [{ myHistogram: _ }, [embedding]]
            }
        },
        {
            qualifier: { uniqueID: "deleteHistogram" },
            "class": "DeleteHistogramControl"
        },
        {
            qualifier: { uniqueID: "exportHistogram" },
            "class": "ExportHistogramControl"
        }
        /*{
            qualifier: { uniqueID: "updateHistogram" },
            "class": "UpdateHistogramControl"
        }*/
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CopyHistogramDataToClipboard: {
        copyHistogramDataToClipboard: {
            to: [{ myApp: { clipboard: { histogram: _ } } }, [me]],
            merge: atomic(
                {
                    appName: [{ appName: _ }, [me]],
                    scaleType: [{ myHistogram: { displayModeLinearLog: _ } }, [me]],
                    facetUniqueID: [{ myFacetUniqueID: _ }, [me]],
                    facetName: [{ myFacet: { name: _ } }, [me]],
                    facetType: [{ facetType: _ }, [me]],
                    numberOfDigits: [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]],
                    measureFacetName: [
                        {
                            myHistogram: [{ myHistogram: _ }, [me]],
                            displayText: _
                        },
                        [areaOfClass, "HistogramMeasureFacetDropDown"]
                    ],
                    measureFunctionName: [
                        {
                            myHistogram: [{ myHistogram: _ }, [me]],
                            displayText: _
                        },
                        [areaOfClass, "HistogramMeasureFunctionDropDown"]
                    ],
                    myMeasureFunctionUniqueID: [{ myHistogram: { myMeasureFunctionUniqueID: _ } }, [me]],
                    sortingBy: [cond,
                        [{ myFacet: { sortingByValues: _ } }, [me]],
                        o(
                            {
                                on: true,
                                use: "msValues"
                            },
                            {
                                on: false,
                                use: [{ myFacet: { myOverlay: { name: _ } } }, [me]]
                            }
                        )
                    ],
                    sortedKeys: [{ myFacet: { values: _ } }, [me]],
                    sortingDirection: [{ myFacet: { latestSortingDirection: _ } }, [me]],
                    /*overlaysInfo: [map,
                        [defun,
                            "overlay",
                            [merge,
                                { overlayUniqueID: [{ uniqueID: _ }, "overlay"] },
                                { name: [{ name: _ }, "overlay"] },
                                { color: [{ color: _ }, "overlay"] },
                            ]
                        ],
                        [{ myOverlays: _ }, [me]],
                    ],*/
                    overlaysInfo: [map,
                        [defun,
                            "overlay",
                            {
                                overlayUniqueID: [{ uniqueID: _ }, "overlay"],
                                name: [{ name: _ }, "overlay"],
                                color: [{ color: _ }, "overlay"],
                                summary: [{ parsedFacetsSummaryStr: _ }, "overlay"],
                            }
                        ],
                        [{ myOverlays: _ }, [me]]
                    ],
                    histogramDisplayModeUnitDistribution: [{ histogramDisplayModeUnitDistribution: _ }, [me]],
                    binData: [map,
                        [defun,
                            "value",
                            [using,
                                "myValueMeasureOfValue",
                                [{ value: "value" }, [{ myValueMeasures: _ }, [me]]],
                                // end of variables
                                {
                                    value: "value",
                                    myValueMeasureOfValue: "myValueMeasureOfValue",
                                    displayValue: [{ displayValue: _ }, "myValueMeasureOfValue"],
                                    overlayObjs:
                                    [map,
                                        [defun,
                                            "valueMeasureObj",
                                            [using,
                                                // beginning of using
                                                "barVal",
                                                [cond,
                                                    [{ histogramDisplayModeUnitDistribution: _ }, [me]],
                                                    o(
                                                        {
                                                            on: "unit",
                                                            use: [round,
                                                                [{ valInStableSolutionSetMeasureVal: _ }, "valueMeasureObj"],
                                                                [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                                                            ]
                                                        },
                                                        {
                                                            on: "distribution",
                                                            use: [round,
                                                                [{ measureDistributionInStableSolutionSet: _ }, "valueMeasureObj"],
                                                                [{ myHistogramCanvas: { numberOfDigits: _ } }, [me]]
                                                            ]
                                                        }
                                                    )
                                                ],
                                                // end of using                                                 
                                                [merge,
                                                    { overlayUniqueID: [{ overlayUniqueID: _ }, "valueMeasureObj"] },
                                                    { barVal: "barVal" }
                                                ]
                                            ]
                                        ],
                                        "myValueMeasureOfValue"
                                    ]
                                }
                            ]
                        ],
                        [{ myFacet: { valuesForMeasure: _ } }, [me]]
                    ],
                    primaryCanvasData: [cond,
                        [{ myPrimaryCanvas: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: {
                                    segmentList: [{ myPrimaryCanvas: { segmentList: _ } }, [me]],
                                    minValue: [{ myPrimaryCanvas: { minValue: _ } }, [me]],                                                                        

                                    // the bin values: same as binRangeEdgeValues (see SliderHistogramView)
                                    canvasPartitionValue: [{ myPrimaryCanvas: { canvasPartitionValue: _ } }, [me]], 
                                    
                                    // numeric format:
                                    numberOfDigits: [{ myFacet: { numberOfDigits: _ } }, [me]],
                                    numericFormatType: [{ myFacet: { numericFormatType: _ } }, [me]],
                                    commaDelimited: [{ myFacet: { commaDelimited: _ } }, [me]],

                                    /*
                                    minDataValue: [{ myPrimaryCanvas: { minDataValue: _ } }, [me]],
                                    maxDataValue: [{ myPrimaryCanvas: { maxDataValue: _ } }, [me]],
                                    scaleType: [{ myPrimaryCanvas: { scaleType: _ } }, [me]],                                    
                                    maxValue: [{ myPrimaryCanvas: { maxValue: _ } }, [me]],                                    
                                    secondaryLabelValue: [{ myPrimaryCanvas: { secondaryLabelValue: _ } }, [me]],
                                    unlabeledValue: [{ myPrimaryCanvas: { unlabeledValue: _ } }, [me]],
                                    independentSecondaryLabelValue: [{ myPrimaryCanvas: { independentSecondaryLabelValue: _ } }, [me]],
                                    independentUnlabeledValue: [{ myPrimaryCanvas: { independentUnlabeledValue: _ } }, [me]],
                                    hasLinearSegment: [{ myPrimaryCanvas: { hasLinearSegment: _ } }, [me]],
                                    isNegativeLinearMinValue: [{ myPrimaryCanvas: { isNegativeLinearMinValue: _ } }, [me]],
                                    isPositiveLinearMaxValue: [{ myPrimaryCanvas: { isPositiveLinearMaxValue: _ } }, [me]],
                                    negativeLogSegmentRatio: [{ myPrimaryCanvas: { negativeLogSegmentRatio: _ } }, [me]],
                                    positiveLogSegmentRatio: [{ myPrimaryCanvas: { positiveLogSegmentRatio: _ } }, [me]],
                                    computedPositiveZeroMarginValue: [{ myPrimaryCanvas: { computedPositiveZeroMarginValue: _ } }, [me]],
                                    computedNegativeZeroMarginValue: [{ myPrimaryCanvas: { computedNegativeZeroMarginValue: _ } }, [me]],
                                    */

                                }
                            },
                            {
                                on: false,
                                use: o()
                            }
                        )
                    ]
                }
            )
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteHistogramControl: {
        context: {
            displayText: [{ myApp: { deleteStr: _ } }, [me]]
        },
        write: {
            onDeleteHistogramControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    removeHistogramFromHistogramsData: {
                        to: [{ myHistogram: { myHistogramDataObj: _ } }, [me]],
                        merge: o()
                    },
                    removeHistogramUniqueIDFromHistogramsReordering: {
                        to: [{ myHistogramUniqueID: _ }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExportHistogramControl: {
        //class: o("HistogramScaleControl"),
        context: {
            displayText: [{ myApp: { exportStr: _ } }, [me]],
            myOverlays: [{ myFacet: { overlaysInAmoeba: _ } }, [me]],
            myPrimaryCanvas: [cond,
                [{ facetType: _ }, [me]],
                o(
                    { on: "MSFacet", use: o() },
                    {
                        on: "SliderFacet", use: [
                            { myFacet: [{ myFacet: _ }, [me]] },
                            [areaOfClass, "SliderCanvas"]
                        ]
                    },
                    { on: "DateFacet", use: [{ myHistogramCanvas: _ }, [me]] }
                )
            ],
            myValueMeasures: [
                {
                    valueMeasure: _,
                    myFacet: [{ myFacet: _ }, [me]],
                    myMeasurePairInFacetUniqueID: [{ myHistogramUniqueID: _ }, [me]],
                    myOverlay: [{ myOverlays: _ }, [me]] // all my overlays in this histogram.
                },
                [areaOfClass, "OverlayMeasurePairInFacet"]
            ],
            appName: [{ appName: _ }, [tempAppStateConnectionInfo]]
        },
        write: {
            onExportHistogramControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    "class": "CopyHistogramDataToClipboard",
                    openExportAppWindow: {
                        to: [systemInfo],
                        merge: {
                            url: "exportHistogram.html",
                            newWindow: true,
                            useSameAppState: true,
                            target: [{ appName: _ }, [tempAppStateConnectionInfo]]
                            // if target is not defined or "_blank" it opens a new tab
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*UpdateHistogramControl: {
        context: {
            displayText: [concatStr,
                o(
                    [{ myApp: { updateStr: _ } }, [me]],
                    [{ myApp: { exportedStr: _ } }, [me]],
                    [{ myApp: { dataStr: _ } }, [me]]
                ),
                " "
            ]
        },
        write: {
            onExportHistogramControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    "class": "CopyHistogramDataToClipboard",
                }
            }
        }
    }*/

};

    ////////////////////////////////////////////////////////////////////////////
    // End of Histogram classes
    ////////////////////////////////////////////////////////////////////////////
