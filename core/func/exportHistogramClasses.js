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

// %%classfile%%: <exportHistogramDesignClasses.js>


/*
###########################################
Hierarchy:
- ExpHistogramApp
    - ExpHistogram
        - ExpHistogramTitle
        - ExpHistogramSubTitle
        - ExpPrimaryWidget            
            * only for expFacetType: "SliderFacet", "DateFacet"
            * Y-axis by default - to the left of HistogramArea
            - inherits scale and canvas                
        - ExpSecondaryWidget        
            * only for faccetType: "MSFacet", "SliderFacet"                       
            * X-axis by default - above of HistogramArea            
            - ExpHistogramScale 
            - ExpHistogramCanvas                            
        - ExpHistogramArea
            - ExpHistogramView
            - ExpHistogramBin
                * os of bins
                - ExpHistogramBinName (only for MSFacet)
                - ExpHistogramBinBarSet
                    - ExpHistogramBar
            - ExpBinNamesExpandableArea
                * only for "MSFacet"
                * to control the width of ExpHistogramBinNames
        - ExpHistogramSidePanel
            - ExpHistogramSidePanelElement
                - ExpHistogramSidePanelElementTitle
                - ExpHistogramSidePanelElementBody
                    - ExpHistogramSidePanelBodyItem
                        - SidePanelBodyItemIcon
                        - SidePanelBodyItemTitle
                            * qualifier: { sideElementType: "legend" }
                            * qualifier: { sideElementType: "definition" }
                        - SidePanelBodyItemDefinition
                            * only for sideElementType: "definition"
    - ExpHistogramConfiguration
        ... to be completed

###########################################

Notes on positioningPrioritiesConstants:
- ExpHistogram (ExpandableBottomRight):
    1: expandable constraints:
        -> expandableHeightConstraintPriority: positioningPrioritiesConstants.weakerThanDefaultPressure,
        -> expandableWidthConstraintPriority: positioningPrioritiesConstants.weakerThanDefaultPressure,
    
    2: bottom or constraints
        -> or1_adjustBottomWithHistogramAreaWhenNotExpanding: positioningPrioritiesConstants.defaultPressure
        -> or2_adjustBottomWithSlicesDefinitionSidePanel: positioningPrioritiesConstants.defaultPressure

- ExpHistogramSidePanel (MinWrap)
    3: minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure

This is to ensure that 1 < 2 < 3
*/

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramApp: {
        "class": o(
            "BackgroundColor",
            "DefaultDisplayText",
            "App",
            "SettingsController",
            "HistogramData"
        ),
        context: {
            myFacetUniqueID: [arg, "facetUniqueID", o()],

            histogramAD: [
                {
                    uniqueID: [{ myFacetUniqueID: _ }, [me]],
                    histogram: _
                },
                [{ currentView: { facetData: _ } }, [me]]
            ],
            displayText: [concatStr, o([{ myFacetUniqueID: _ }, [me]], " ", [{ histogramAD: { displayModeLinearLog: _ } }, [me]])]
        },
        position: {
            frame: 0
        },
        children: {
            exportedHistogram: {
                description: {
                    "class": "ExpHistogram"
                }
            },
            histogramConfiguration: {
                description: {
                    "class": "ExpHistogramConfiguration"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramData: {
        context: {
            clipboardHistogramAD: [{ myApp: { clipboard: { histogram: _ } } }, [me]],
            "^overlaysInfoAD": o(),
            overlaysInfo: [mergeWrite,
                [identify, { overlayUniqueID: _ }, [{ overlaysInfoAD: _ }, [me]]],
                [identify, { overlayUniqueID: _ }, [{ clipboardHistogramAD: { overlaysInfo: _ } }, [me]]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackHistogramData: {
        context: {
            clipboardHistogramAD: [{ clipboardHistogramAD: _ }, [areaOfClass, "HistogramData"]],
            overlaysInfo: [{ overlaysInfo: _ }, [areaOfClass, "HistogramData"]],
            // for easy access:
            expFacetType: [{ clipboardHistogramAD: { facetType: _ } }, [me]],
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SettingsController: {
        context: {
            "^settingsAD": o(),
            settings: [mergeWrite,
                [{ settingsAD: _ }, [me]],
                {
                    histogramBorderWidth: 1,
                    histogramBorderColor: "black",
                    //binSpacing: 5,
                    barSpacing: 3,
                    showLegend: true,
                    showSlicesDefinition: true,
                    showBarValues: false,
                    // MSFacet specific:
                    barThickness: 15,
                    histogramCategoryFontSize: 15,
                    numberOfItems: [{ calcMaxNumberOfItemsInPage: _ }, [areaOfClass, "ExpHistogramArea"]],
                    showOthersUserChoice: false,
                }
            ],

        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogram: o(
        { // default
            "class": o(
                "Border",
                "GeneralArea",
                "HistogramCore",
                "ExpandableBottomRight",
                "TrackHistogramData"
            ),
            context: {
                // ExpandableBottomRight params
                initialExpandableWidth: 500,
                initialExpandableHeight: 600,
                stableExpandableIsMin: true, // this allows expansion when expanding ExpBinNamesExpandableArea
                // end of ExpandableBottomRight params

                borderWidth: [{ myApp: { settings: { histogramBorderWidth: _ } } }, [me]],
                borderColor: [{ myApp: { settings: { histogramBorderColor: _ } } }, [me]],
                myCanvas: [areaOfClass, "ExpHistogramCanvas"],
                myHistogramView: [areaOfClass, "ExpHistogramView"],
                roundedValues: [ // needed for canvas
                    { filteredBarValues: _ },
                    [areaOfClass, "ExpHistogramArea"]
                ],
                innerMargin: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],

                //variant controller:
                /*isNotExpandingOrFacetIsSlider: [or,
                    [not, [{ expanding: _ }, [me]]],
                    [equal, [{ expFacetType: _ }, [me]], "SliderFacet"]
                ],*/
            },
            position: {
                top: 30,
                rightOfExpHistogramConfiguration: {
                    point1: { element: [areaOfClass, "ExpHistogramConfiguration"], type: "right" },
                    point2: { type: "left" },
                    equals: 50,
                },
                minWidthConstraintOfExpHistogram: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ initialExpandableWidth: _ }, [me]]
                },
                bottomBelowSidePanel: {
                    point1: { type: "bottom", element: [areaOfClass, "ExpHistogramSidePanel"] },
                    point2: { type: "bottom" },
                    min: [{ innerMargin: _ }, [me]]
                },
                bottomBelowFirstBin: {
                    point1: {
                        type: "bottom",
                        element: [{ firstBinArea: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    point2: { type: "bottom" },
                    min: [{ innerMargin: _ }, [me]]
                }
            },
            children: {
                title: {
                    description: {
                        "class": "ExpHistogramTitle"
                    }
                },
                subTitle: {
                    description: {
                        "class": "ExpHistogramSubTitle"
                    }
                },
                histogramArea: {
                    description: {
                        "class": "ExpHistogramArea"
                    }
                },
                histogramSidePanel: {
                    description: {
                        "class": "ExpHistogramSidePanel"
                    }
                },
            },
        },
        {
            qualifier: { expFacetType: o("MSFacet", "SliderFacet") },
            children: {
                secondaryWidget: {
                    description: {
                        "class": "ExpSecondaryWidget"
                    }
                },
            },
        },
        {
            qualifier: { expFacetType: o("SliderFacet", "DateFacet") },
            children: {
                primaryWidget: {
                    description: {
                        "class": "ExpPrimaryWidget",
                    },
                }
            },
            position: {
                minHeightConstraints: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    min: 200
                }
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            context: {
                // ExpandableBottomRight params
                // here below we are assigning a priority weaker than weakerThanDefault (as assigned by default)
                // to the expandableHeightConstraintPriority/expandableWidthConstraintPriority
                // to give priority to the or_1 and or_2 constraints (in qualifier expanding: false )
                // see notes on positioningPrioritiesConstants on the top of the file
                expandableHeightConstraintPriority: positioningPrioritiesConstants.weakerThanDefaultPressure,
                expandableWidthConstraintPriority: positioningPrioritiesConstants.weakerThanDefaultPressure,
                // end of ExpandableBottomRight params
            },
            write: {
                onExpandableMouseUp: {
                    // upon defined in Expandable (inherited by ExpandableBottomRight)
                    "true": {
                        resetNumberOfItems: {
                            to: [{ myApp: { settings: { numberOfItems: _ } } }, [me]],
                            merge: [{ numberOfShownItems: _ }, [areaOfClass, "ExpHistogramArea"]]
                        }
                    }
                }
            },
            position: {
                // no minHeightConstraints for MSFacet 
                // (height determined by size/number of bins)
            }

        },
        {
            qualifier: { expFacetType: "MSFacet", expanding: false },
            context: {
            },
            position: {
                or1_adjustBottomWithHistogramArea: {
                    point1: {
                        element: [areaOfClass, "ExpHistogramArea"],
                        type: "bottom"
                    },
                    point2: { type: "bottom" },
                    equals: [{ innerMargin: _ }, [me]],
                    orGroups: { label: "bottmoOrConstraint" },
                    priority: positioningPrioritiesConstants.defaultPressure
                },
                or2_adjustBottomWithSidePanel: {
                    point1: {
                        element: [areaOfClass, "ExpHistogramSidePanel"],
                        type: "bottom"
                    },
                    point2: { type: "bottom" },
                    equals: [{ innerMargin: _ }, [me]],
                    orGroups: { label: "bottmoOrConstraint" },
                    priority: positioningPrioritiesConstants.defaultPressure
                },
                bottomBelowHistogramArea: {
                    point1: { type: "bottom", element: [areaOfClass, "ExpHistogramArea"] },
                    point2: { type: "bottom" },
                    min: [{ innerMargin: _ }, [me]]
                },
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. textSize: default provided.
    // 2. TextInput's API
    // 3. vertical position
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramTitleCore: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "TextInput", "TrackHistogramData"),
        context: {
            textSize: [mergeWrite,
                [{ myApp: { settings: { defaultExpHistogramTitleTextSize: _ } } }, [me]],
                [densityChoice, [{ generalDesign: { titleTextSize: _ } }, [globalDefaults]]]
            ]
        },
        position: {
            height: [displayHeight],
            left: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            right: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramTitle: {
        "class": o("ExpHistogramTitleCore"),
        context: {
            initInputAppData: [concatStr,
                o(
                    [{ clipboardHistogramAD: { measureFunctionName: _ } }, [me]],
                    [{ clipboardHistogramAD: { measureFacetName: _ } }, [me]],
                    [{ myApp: { byStr: _ } }, [me]],
                    [{ clipboardHistogramAD: { facetName: _ } }, [me]]
                ),
                " "
            ]
        },
        position: {
            top: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSubTitle: {
        "class": o("ExpHistogramTitleCore"),
        context: {
            sortingDirection: [concatStr,
                o(
                    "(",
                    [{ clipboardHistogramAD: { sortingDirection: _ } }, [me]],
                    ")"
                )
            ],
            initInputAppData: [concatStr,
                o(
                    [{ myApp: { sortedStr: _ } }, [me]],
                    [cond,
                        [{ clipboardHistogramAD: { sortingBy: _ } }, [me]],
                        o(
                            {
                                on: "msValues",
                                use: o(
                                    [{ myApp: { alphabeticallyStr: _ } }, [me]],
                                    [{ sortingDirection: _ }, [me]]
                                )
                            },
                            {
                                on: null,
                                use: o(
                                    [{ myApp: { perStr: _ } }, [me]],
                                    [{ clipboardHistogramAD: { sortingBy: _ } }, [me]],
                                    [{ sortingDirection: _ }, [me]]
                                )
                            }
                        )
                    ]
                ),
                " "
            ]
        },
        position: {
            attachTopToBottomOfTitle: {
                point1: {
                    element: [areaOfClass, "ExpHistogramTitle"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // ExpPrimaryWidget is myReference of all classes inheriting NumericFormatOfReference
    // Y-axis by default (differently form the main application where myReference is myFacet)
    // Used by SliderFacet and DateFacet
    // by default sliderEnabled: true (for DateFacet) so canvas and scale are constructed as in SliderWidget
    // for SliderFacet we set sliderEnabled:false and construct a simplified version of cavas and scale with
    // a more specific control over the bins.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpPrimaryWidget: o(
        {
            qualifier: "!",
            // context and children are overwritten by imported classes
            // (i.e., if from SliderWidget in DateFacet qualifier)
            context: {
                myAnchorContinuousRange: [areaOfClass, "ExpHistogramView"],
                scaleType: [{ clipboardHistogramAD: { scaleType: _ } }, [me]],
                highValAtTop: true // used by all embedded elements accessing NumericElement                
            },
            children: {
                canvas: {
                    description: {
                        context: {
                            primaryCanvasData: [{ primaryCanvasData: _ }, [embedding]],
                            //needed by Scale
                            numberOfDigits: [{ primaryCanvasData: { numberOfDigits: _ } }, [me]],
                            // SegmentedCanvas params:
                            segmentList: [{ primaryCanvasData: { segmentList: _ } }, [me]],
                            minValue: [{ primaryCanvasData: { minValue: _ } }, [me]],
                            // end of SegmentedCanvas params
                        }
                    }
                }
            }
        },
        {
            // default 
            "class": o(
                "TrackHistogramData",
                "VerticalNumericElement",
                "PrimaryWidget"
            ),
            context: {
                //myAnchorContinuousRange: [areaOfClass, "ExpHistogramView"],                
                numberOfDigits: [{ primaryCanvasData: { numberOfDigits: _ } }, [me]],
                numericFormatType: [{ primaryCanvasData: { numericFormatType: _ } }, [me]],
                commaDelimited: [{ primaryCanvasData: { commaDelimited: _ } }, [me]],
                primaryCanvasData: [{ clipboardHistogramAD: { primaryCanvasData: _ } }, [me]],
            },

            position: {
                left: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],
                top: 0,
                bottom: 0,
                right: 0
                //width: 75
            },

        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            "class": "BaseScaleWidget", // instead of "SliderWidget"                               
            children: {
                canvas: {
                    // in addition to what already defined by BaseSegmentedCanvas (see BaseScaleWidget)
                    description: {
                        "class": "ExpBaseSegmentedCanvas"
                    }
                }
            },
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            "class": "SliderWidget",
            context: {
                sliderEnabled: true,
            },
            // children: using SliderCanvas and SliderScale defined in SliderWidget
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Only for Slider
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpBaseSegmentedCanvas: {
        "class": "BaseSegmentedScaledCanvas",
        context: {
            // aux variables
            minValPoint: {
                element: [areaOfClass, "ExpPrimaryWidget"],
                label: "minValPoint"
            },
            maxValPoint: {
                element: [areaOfClass, "ExpPrimaryWidget"],
                label: "maxValPoint"
            },
            highValAtLowHTMLLength: [ // needed by valLine
                { highValAtLowHTMLLength: _ },
                [embedding]
            ],
            // end of aux variables         

            // BaseSegmentedCanvas params:
            // canvasPartitionValue, minValue
            // defined from embedding (ExpPrimaryWidget) in ! variant
            canvasPixelSize: [
                abs,
                [
                    offset,
                    [{ minValPoint: _ }, [me]],
                    [{ maxValPoint: _ }, [me]]
                ]
            ],
            // end of BaseSegmentedCanvas params                        

            // primaryCanvasData, canvasPartitionValue, numberOfDigits 
            // defined from embedding (ExpPrimaryWidget) in ! variant

            // bin boundaries
            canvasPartitionValue: [{ primaryCanvasData: { canvasPartitionValue: _ } }, [me]],
            // primaryLabelValue, secondaryLabelValue, unlabeledValue
            // defined by ExpBaseScaledCanvasSegment
        },
        children: {
            segment: {
                // in addition to what already defined by BaseScaledCanvasSegment (see BaseSegmentedScaledCanvas)
                description: {
                    "class": "ExpBaseScaledCanvasSegment"
                }
            }
        }
    },

    ExpBaseScaledCanvasSegment: o(
        {
            context: {
                canvasPartitionValue: [{ canvasPartitionValue: _ }, [embedding]],
                numberOfDigits: [{ numberOfDigits: _ }, [embedding]],

                // if numberOfDigits is x (2 if number rounds to 2 fractional digits) 
                // it returns:
                // - 0 if "number" is an integer
                // - 1 if "number" is well rounded after 1 fractional digit
                // - ...
                // - x if "number" is well rounded after x fractional digit
                // - x+1 otherwise
                /*roudnessLevel: [defun,
                    o("number", "numberOfDigits"),
                    [
                        using,
                        //"roundingDivisors", //[1, 0.1, 0.01, 0.001]
                        //[pow, 10, [reverse, [sequence, r([minus, "numberOfDigits"],0)]]] 
                        // end of using                        
                        [div, "number", "roundingDivisors"]
                        [func, "number"],                                                                                                
                    ]
                ],*/

                //findRoundSupremum(numList, niceDivisorList, minUnit, intMult) //intMult optional
                //roundnessTest: findRoundSupremum(o(2,5,9), o(1,2,4), 1), 

                // take all canvasPartitionValue of the full canvas and retain only those within range
                segmentCanvasPartition: [
                    Roo(
                        [{ segmentStartValue: _ }, [me]],
                        [{ segmentEndValue: _ }, [me]]
                    ),
                    [{ canvasPartitionValue: _ }, [me]]
                ],
                segmentCanvasPartitionDistance: [
                    [{ valueToOffset: _ }, [me]],
                    [first, [{ segmentCanvasPartition: _ }, [me]]]
                ],

                maxDistanceBetweenPrimaryLabels: 70,
                maxDistanceBetweenSecondaryLabels: 30,

                ///////////////////////
                // primaryLabelValue
                //////////////////////

                // calculates the floor of the ration between 
                // maxDistanceBetweenPrimaryLabels and segmentCanvasPartitionDistance
                // It is 0 if segmentCanvasPartitionDistance>maxDistanceBetweenPrimaryLabels
                // and no primary label needs to be skipped
                // It is >0 otherwise (e.g 1 if 1 primary label needs to be skipped)
                skipPrimaryLabelsEvery: [floor,
                    [div,
                        [{ maxDistanceBetweenPrimaryLabels: _ }, [me]],
                        [{ segmentCanvasPartitionDistance: _ }, [me]]
                    ],
                ],

                primaryLabelValueStepSize: [plus, 1, [{ skipPrimaryLabelsEvery: _ }, [me]]],
                primaryLabelValueSelectedIndex: [stepSequence,
                    [{ skipPrimaryLabelsEvery: _ }, [me]], // start_included
                    [size, [{ segmentCanvasPartition: _ }, [me]]], // stop_excluded
                    [{ primaryLabelValueStepSize: _ }, [me]] // step_size
                ],

                excludeFromPrimaryLabel: [cond,
                    [equal, [{ skipPrimaryLabelsEvery: _ }, [me]], 0],
                    o(
                        { on: true, use: o() },
                        { on: false, use: [last, [{ segmentCanvasPartition: _ }, [me]]] }
                        // exclude last partition (followed by edgeMarker)
                    )
                ],

                primaryLabelValue: [
                    n(
                        [{ excludeFromPrimaryLabel: _ }, [me]]
                    ),
                    [pos,
                        [{ primaryLabelValueSelectedIndex: _ }, [me]],
                        [{ segmentCanvasPartition: _ }, [me]],
                    ]
                ],

                ///////////////////////
                // secondaryLabelValue
                //////////////////////

                // similar to skipPrimaryLabelsEvery
                skipSecondaryLabelsEvery: [floor,
                    [div,
                        [{ maxDistanceBetweenSecondaryLabels: _ }, [me]],
                        [{ segmentCanvasPartitionDistance: _ }, [me]]
                    ],
                ],

                secondaryLabelValueStepSize: [plus, 1, [{ skipSecondaryLabelsEvery: _ }, [me]]],
                secondaryLabelValueSelectedIndex: [stepSequence,
                    [{ skipSecondaryLabelsEvery: _ }, [me]], // start_included
                    [size, [{ segmentCanvasPartition: _ }, [me]]], // stop_excluded
                    [{ secondaryLabelValueStepSize: _ }, [me]] // step_size
                ],

                secondaryLabelValue: [
                    n(
                        [{ primaryLabelValue: _ }, [me]]
                    ),
                    [pos,
                        [{ secondaryLabelValueSelectedIndex: _ }, [me]],
                        [{ segmentCanvasPartition: _ }, [me]],
                    ],
                ],


                ///////////////////
                // unlabeledValue
                //////////////////

                unlabeledValue: [
                    n(
                        [{ primaryLabelValue: _ }, [me]],
                        [{ secondaryLabelValue: _ }, [me]]
                    ),
                    [{ segmentCanvasPartition: _ }, [me]]
                ],
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // X-axis by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpSecondaryWidget: {
        //"class": o("HorizontalNumericElement", "SecondaryWidget", "TrackHistogramData"),
        context: {
            myCanvas: [{ children: { canvas: _ } }, [me]],
            myScale: [{ children: { scale: _ } }, [me]],
        },
        children: {
            canvas: {
                description: {
                    "class": "ExpHistogramCanvas",
                }
            },
            scale: {
                description: {
                    "class": "ExpHistogramScale",
                }
            }
        },
        position: {
            left: 0,
            right: 0,
            bottom: 0, // needed to have the vertical grid extending till the end of histogram view
            topBelowTitles: {
                point1: { element: [areaOfClass, "ExpHistogramSubTitle"], type: "bottom" },
                point2: { type: "top" },
                equals: 0
            },
        },
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramCanvas: {
        "class": o(
            "HistogramCanvas",
            "TrackHistogramData"
        ),
        context: {
            // values obtained from roundedValues of ExpHistogram via TrackMyHistogram
            histogramDisplayModeLinearLog: [{ clipboardHistogramAD: { scaleType: _ } }, [me]],
            numberOfDigits: [{ clipboardHistogramAD: { numberOfDigits: _ } }, [me]],
            myMeasureFunctionUniqueID: [{ clipboardHistogramAD: { myMeasureFunctionUniqueID: _ } }, [me]],
            myHistogramView: [areaOfClass, "ExpHistogramView"]
        },
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramScale: {
        "class": "HistogramScale",
        context: {
            // begin of HistogramScale API:
            myCanvas: [areaOfClass, "ExpHistogramCanvas"],
            applyMinWrap: false
            // end of HistogramScale API
        },
        position: {
            frame: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////            
    ExpHistogramArea: o(
        {   // default
            "class": o(
                "GeneralArea",
                "TrackHistogramData"
            ),
            context: {
                outerMargin: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],
                distanceFromSubtitle: 30,
                binSpacing: 0,
                /*[ // 10
                    { myApp: { settings: { binSpacing: _ } } },
                    [me]
                ],*/

                firstBinArea: [first,
                    [{ children: { histogramBins: _ } }, [me]]
                ],

                binData: [{ clipboardHistogramAD: { binData: _ } }, [me]],
                numberOfItemsInData: [size, [{ binData: _ }, [me]]],

                sortingDirection: [{ clipboardHistogramAD: { sortingDirection: _ } }, [me]],
                sortedKeys: [{ clipboardHistogramAD: { sortedKeys: _ } }, [me]],
                sortedBinData: [sort,
                    [{ binData: _ }, [me]],
                    o(
                        { value: o([{ sortedKeys: _ }, [me]]) }, // should be a c instead of o (bug #2108)
                        { overlayObjs: { overlayUniqueID: o("ascending") } } // this doesn't seem to work
                    )
                ],

                filteredBinData: [{ sortedBinData: _ }, [me]],

                filteredBarValues: [{ filteredBinData: { overlayObjs: { barVal: _ } } }, [me]],

                // qualifier controller:
                expHistogramIsExpanding: [{ expanding: _ }, [areaOfClass, "ExpHistogram"]],

                showOthers: [and,
                    [{ myApp: { settings: { showOthersUserChoice: _ } } }, [me]],
                    [{ moreItemsAvailable: _ }, [me]]
                ],

                dataForBins: [{ filteredBinData: _ }, [me]],

                //binReferenceCanvas defined in qualifiers
                //the canvas -- primary (x) or secondary (y) which determines the length of tha bars
            },
            children: {
                histogramBins: {
                    data: [{ dataForBins: _ }, [me]],
                    description: {
                        "class": "ExpHistogramBin",
                    },
                },
                histogramView: {
                    description: {
                        "class": "ExpHistogramView"
                    }
                },
            },
            position: {
                attachTopToBottomOfSubTitle: {
                    point1: {
                        element: [areaOfClass, "ExpHistogramSubTitle"],
                        type: "bottom"
                    },
                    point2: {
                        type: "top"
                    },
                    equals: [{ distanceFromSubtitle: _ }, [me]]
                },
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            "class": "MinWrapVertical",
            context: {
                "class": "ExpHistogramAreaMSFacetContextVars",
                binReferenceCanvas: [{ myCanvas: _ }, [areaOfClass, "ExpSecondaryWidget"]],
                verticalBars: false,
            },
            children: {
                binNamesExpandableArea: {
                    description: {
                        "class": "ExpBinNamesExpandableArea"
                    }
                },
            },
            position: {
                // no primaryWidget
                left: [{ outerMargin: _ }, [me]],
            }
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            context: {
                binReferenceCanvas: [{ myCanvas: _ }, [areaOfClass, "ExpPrimaryWidget"]],
                verticalBars: true,
            },
            children: {
                binNamesExpandableArea: {
                    description: {
                        "class": "ExpBinNamesExpandableArea"
                    }
                },
            },
            position: {
                bottom: [{ outerMargin: _ }, [me]],
                //left: [{ exportApp: { hugeMargin: _ } }, [globalDefaults]],
                leftAlighnedWithRightOfPrimaryWidget: {
                    point1: { type: "left" },
                    point2: { type: "right", element: [areaOfClass, "SliderScaleLine"] },
                    equals: 5
                }
            }
        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            context: {
                binReferenceCanvas: [{ myCanvas: _ }, [areaOfClass, "ExpSecondaryWidget"]],
                verticalBars: false
            },
            position: {
                bottom: [{ outerMargin: _ }, [me]],
                //left: [{ exportApp: { hugeMargin: _ } }, [globalDefaults]],
                leftAlighnedWithRightOfPrimaryWidget: {
                    point1: { type: "left" },
                    point2: { type: "right", element: [areaOfClass, "SliderScaleLine"] },
                    equals: 5
                }
            }
        },
        {
            qualifier: { verticalBars: true },
            context: {
                barStartPointType: "bottom",
                barEndPointType: "top",
            }
        },
        {
            qualifier: { verticalBars: false },
            context: {
                barStartPointType: "left",
                barEndPointType: "right",
            }
        },
        {
            qualifier: { expFacetType: "MSFacet", expHistogramIsExpanding: true },
            context: {
                numberOfShownItems: [min,
                    [{ numberOfItemsInData: _ }, [me]],
                    [{ calcMaxNumberOfItemsInArea: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { expFacetType: "MSFacet", showOthers: true },
            context: {

                /* the following creates a cycle:
                    calcMaxNumberOfItemsInArea -> showOthers
                    showOthers -> moreItemsAvailable
                    moreItemsAvailable -> numberOfShownItems
                    numberOfShownItems -> calcMaxNumberOfItemsInArea
                */
                /*calcMaxNumberOfItemsInArea: [minus,
                    [floor,
                        [
                            div,
                            [{ availableHightForBinsInArea: _ }, [me]],
                            [{ binHeightPlusSpacingAndBorder: _ }, [me]],
                        ]
                    ], 1
                ],*/

                othersBinData: [pos,
                    r(
                        [{ numberOfShownItems: _ }, [me]],
                        [size, [{ sortedBinData: _ }, [me]]]
                    ),
                    [{ sortedBinData: _ }, [me]]
                ],

                othersBinDataAggregated: [map,
                    [defun,
                        "overlayUniqueID",
                        [using,
                            "othersBinDataOverlayObjs",
                            [{ othersBinData: { overlayObjs: _ } }, [me]],
                            // end of using
                            {
                                overlayUniqueID: "overlayUniqueID",
                                barVal: [sum,
                                    [
                                        {
                                            barVal: _,
                                            overlayUniqueID: "overlayUniqueID"
                                        },
                                        "othersBinDataOverlayObjs"
                                    ]
                                ]
                            }
                        ]
                    ],
                    [{ overlaysInfo: { overlayUniqueID: _ } }, [me]]
                ],

                filteredBinData: o(
                    [pos,
                        r(0, [minus, [{ numberOfShownItems: _ }, [me]], 1]),
                        [{ sortedBinData: _ }, [me]]
                    ],
                    {
                        displayValue: [concatStr, o("Others", " (", [{ numberOfNotShownItems: _ }, [me]], ")")],
                        overlayObjs: [{ othersBinDataAggregated: _ }, [me]]
                    }

                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // aux class for ExpHistogramArea context when expFacetType: MSFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramAreaMSFacetContextVars: {
        binPrototype: [
            first,
            [areaOfClass, "ExpHistogramBin"]
        ],
        binHeightWithBorder: [offset,
            { element: [{ binPrototype: _ }, [me]], type: "top" },
            { element: [{ binPrototype: _ }, [me]], type: "bottom" }
        ],
        binHeightPlusSpacingAndBorder: [ // 28
            plus,
            [{ binSpacing: _ }, [me]],
            [{ binHeightWithBorder: _ }, [me]]
        ],
        availableHightForBinsInArea: [
            minus,
            [
                offset,
                { type: "top" },
                { element: [embedding], type: "bottom" }
            ],
            [
                plus,
                [{ outerMargin: _ }, [me]],
                [{ binSpacing: _ }, [me]]
            ]
        ],
        // need to change this if we introduce scrolling
        availableHightForBinsInPage: [
            minus,
            [
                offset,
                { type: "top" },
                { element: [{ myApp: _ }, [me]], type: "bottom" }
            ],
            [
                plus,
                [{ outerMargin: _ }, [me]],
                [{ binSpacing: _ }, [me]]
            ]
        ],

        calcMaxNumberOfItemsInArea: [floor,
            [
                div,
                [{ availableHightForBinsInArea: _ }, [me]],
                [{ binHeightPlusSpacingAndBorder: _ }, [me]]
            ]
        ],

        calcMaxNumberOfItemsInPage: [floor,
            [
                div,
                [{ availableHightForBinsInPage: _ }, [me]],
                [{ binHeightPlusSpacingAndBorder: _ }, [me]]
            ]
        ],

        numberOfShownItems: [{ myApp: { settings: { numberOfItems: _ } } }, [me]],

        numberOfNotShownItems: [minus,
            [{ numberOfItemsInData: _ }, [me]],
            [{ numberOfShownItems: _ }, [me]]
        ],

        moreItemsAvailable: [greaterThan,
            [{ numberOfNotShownItems: _ }, [me]],
            0
        ],

        filteredBinData: [pos,
            r(
                0,
                [minus, [{ numberOfShownItems: _ }, [me]], 1]
            ),
            [{ sortedBinData: _ }, [me]]
        ],
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramView: o(
        {
            "class": o(
                "Border",
                "TrackHistogramData"
            ),
            context: {
                borderWidth: 1,
                borderColor: "black",
                myCanvas: [areaOfClass, "ExpHistogramCanvas"],
                minWidth: 200,
                /*widthOffset: [offset,
                    { type: "left" },
                    { type: "right" }
                ]*/
            },
            position: {
                top: 0,
                right: 0,
                minWidthConstraintOfExpHistogramView: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ minWidth: _ }, [me]]
                },
                leftAlignedWithRightOfAnchorArea: {
                    point1: { element: [{ leftAnchor: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    equals: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
                }
            },
            stacking: {
                aboveBins: {
                    higher: [me],
                    lower: [areaOfClass, "ExpHistogramBin"]
                }
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            context: {
                leftAnchor: [areaOfClass, "ExpBinNamesExpandableArea"]
            },
            position: {
                bottom: 0,
            }
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            context: {
                leftAnchor: [areaOfClass, "SliderScaleLine"]
            },
            position: {
                bottomAlignedWithTopOfExpBinNamesExpandableArea: {
                    point1: { type: "bottom" },
                    point2: { element: [areaOfClass, "ExpBinNamesExpandableArea"], type: "top" },
                    equals: 0
                },
            }
        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            context: {
                leftAnchor: [areaOfClass, "SliderScaleLine"]
            },
            position: {
                bottom: 0,
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // only for MSFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpBinNamesExpandableArea: o(
        {
            // default
            "class": o("GeneralArea", "ExpandableRight", "TrackMyWidget"),
            context: {
                marginWithBinNames: 10,
                verticalBars: [{ verticalBars: _ }, [areaOfClass, "ExpHistogramArea"]],
            }
        },
        {
            qualifier: { verticalBars: false },
            "class": "ExpandableRight",
            context: {
                minWidthDefault: 100,
                initialExpandableWidth: [min,
                    [{ minWidthDefault: _ }, [me]],
                    [plus,
                        [max,
                            [{ fullTextWidth: _ },
                            [areaOfClass, "ExpHistogramBinName"]]
                        ],
                        [{ marginWithBinNames: _ }, [me]]
                    ]
                ],
            },
            position: {
                top: 0,
                bottom: 0,
                left: 0,
                // right: defined in ExpHistogramBinName (alignRightWithBinNamesExpandableArea)
                minWidthConstraintOfExpBinNamesExpandableArea: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ initialExpandableWidth: _ }, [me]]
                }
            }
        },
        {
            qualifier: { verticalBars: true },
            "class": "ExpandableTop",
            context: {
                minHeightDefault: 250,
                //initialExpandableHeight: [{ minHeightDefault: _ }, [me]],
                initialExpandableHeight: [min,
                    [{ minHeightDefault: _ }, [me]],
                    [plus,
                        [max,
                            [{ fullTextHeight: _ },
                            [areaOfClass, "ExpHistogramBinName"]]
                        ],
                        [{ marginWithBinNames: _ }, [me]]
                    ]
                ],
            },
            position: {
                left: 0,
                right: 0,
                bottom: 0,
                // top: defined in ExpHistogramBinName (alignTopWithBinNamesExpandableArea)
                minHeightConstraintOfExpBinNamesExpandableArea: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    min: [{ initialExpandableHeight: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramBin: o(
        {
            "class": o(
                "ExpHistogramBinDesign",
                "TrackHistogramData"
                //"Expandable" // to introduce later
            ),
            context: {
                myData: [{ param: { areaSetContent: _ } }, [me]],
                overlayObjs: [{ myData: { overlayObjs: _ } }, [me]],
                myBinBarSet: [{ children: { binBarSet: _ } }, [me]],
                verticalBars: [{ verticalBars: _ }, [areaOfClass, "ExpHistogramArea"]]
            },
            children: {
                binBarSet: {
                    description: {
                        "class": "ExpHistogramBinBarSet"
                    }
                }
            },
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            "class": o(
                "MemberOfTopToBottomAreaOS",
                "MinWrapVertical"
            ),
            context: {
                categoryText: [{ myData: { displayValue: _ } }, [me]],
                // MemberOfPositionedAreaOS API:
                spacingFromPrev: 0, //[{ myApp: { settings: { binSpacing: _ } } }, [me]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                // end of MemberOfPositionedAreaOS API            
            },
            children: {
                binName: {
                    description: {
                        "class": "ExpHistogramBinName"
                    }
                }
            },
            position: {
                right: 0,
                left: 0
            }
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            "class": o(
                "MemberOfLeftToRightAreaOS"
            ),
            context: {
                categoryText: [numToDate,
                    [
                        { min: _ }, //should be (min+max)/2
                        [first, // double check why there are multiple ones
                            [{ myData: { displayValue: _ } }, [me]]
                        ]
                    ],
                    "dd/MM/yyyy"
                ],
                // MemberOfPositionedAreaOS API:
                spacingFromPrev: 0, //[{ myApp: { settings: { binSpacing: _ } } }, [me]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                memberOfPositionedAreaOSReferenceArea: [areaOfClass, "ExpHistogramView"]
                // end of MemberOfPositionedAreaOS API            
            },
            children: {
                binName: {
                    description: {
                        "class": "ExpHistogramBinName"
                    }
                }
            },
            position: {
                top: 0,
                bottom: 0,
                sameWidthConstraint: {
                    pair1: {
                        point1: { type: "left" },
                        point2: { type: "right" },
                    },
                    pair2: {
                        point1: { label: "leftOfVirtualBar", element: [embedding] },
                        point2: { label: "rightOfVirtualBar", element: [embedding] },
                    },
                    ratio: 1,
                },
                // position within the ExpHistogramView
                leftFrameRightOfExpHistogramViewLeft: {
                    point1: { element: [areaOfClass, "ExpHistogramView"], type: "left" },
                    point2: { type: "left" },
                    min: 0,
                },
                rightFrarmeLeftOfExpHistogramViewRight: {
                    point1: { type: "right" },
                    point2: { element: [areaOfClass, "ExpHistogramView"], type: "right" },
                    min: 0,
                },
            }
        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            // no binName children
            context: {
                // params for NumericHistogramBin
                myCanvas: [{ myCanvas: _ }, [areaOfClass, "ExpPrimaryWidget"]],
                binRange: [{ myData: { value: _ } }, [me]],
                binRangeStart: [min, [{ binRange: _ }, [me]]],
                binRangeEnd: [max, [{ binRange: _ }, [me]]],
                // end of params for NumericHistogramBin

                // need to set bottom border to first bin (via ExpHistogramBinDesign) 
                bottomMostElement: [equal,
                    [me],
                    [first, [areaOfClass, "ExpHistogramBin"]]
                ]
            },
            position: {
                right: 0,
                left: 0,
                // positioning top/bottom wrt to minValPoint of sliderCanvas
                // using same mechanism in "NumericHistogramBin"
                positionTopWrtMinValPoint: {
                    point1: { type: "top" },
                    point2: [{ myCanvas: { minValPoint: _ } }, [me]],
                    equals: [
                        [{ myCanvas: { valueToOffset: _ } }, [me]],
                        [{ binRangeEnd: _ }, [me]]
                    ]
                },
                positionBottomWrtMinValPoint: {
                    point1: { type: "bottom" },
                    point2: [{ myCanvas: { minValPoint: _ } }, [me]],
                    equals: [
                        [{ myCanvas: { valueToOffset: _ } }, [me]],
                        [{ binRangeStart: _ }, [me]]
                    ]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // only MSFacet and DateFacet
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramBinName: o(
        {
            "class": o(
                "DefaultDisplayText",
                "TextInput"
            ),
            context: {
                initInputAppData: [{ categoryText: _ }, [embedding]],
                defaultFontSize: [{ myApp: { settings: { histogramCategoryFontSize: _ } } }, [me]],
                rightMarginWithMyExpandableArea: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
                fullTextWidth: [displayWidth],
                fullTextHeight: [displayHeight],
                isOtherCategory: [and,
                    [{ lastInAreaOS: _ }, [embedding]],
                    [{ showOthers: _ }, [areaOfClass, "ExpHistogramArea"]]
                ],
                verticalBars: [{ verticalBars: _ }, [areaOfClass, "ExpHistogramArea"]],
                width: [displayWidth],
                height: [displayHeight],
            },
        },
        {
            qualifier: { isOtherCategory: true },
            "class": "TextItalic"
        },
        {
            qualifier: { verticalBars: false },
            "class": "TextOverflowEllipsisDesign",
            position: {
                top: 0,
                bottom: 0,
                left: 0,
                alignRightWithBinNamesExpandableArea: {
                    point1: { type: "right" },
                    point2: {
                        type: "right",
                        element: [areaOfClass, "ExpBinNamesExpandableArea"],
                    },
                    min: [{ rightMarginWithMyExpandableArea: _ }, [me]],
                },
            }
        },
        {
            // DateFacet
            qualifier: { verticalBars: true },
            display: {
                transform: {
                    rotate: 270
                },
                text: {
                    //verticalAlign: "middle",
                    textAlign: "center"
                }
            },
            position: {
                bottom: 0,
                left: 0,
                right: 0,
                alignTopWithBinNamesExpandableArea: {
                    point1: {
                        type: "top",
                        element: [areaOfClass, "ExpBinNamesExpandableArea"],
                    },
                    point2: { type: "top" },
                    min: [{ rightMarginWithMyExpandableArea: _ }, [me]],
                },
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramBinBarSet: o(
        {
            "class": o(
                "TrackHistogramData"
            ),
            context: {
                overlayObjs: [{ overlayObjs: _ }, [embedding]],
                //verticalBars must set by qualifiers
            },
            children: {
                bars: {
                    data: [{ overlayObjs: _ }, [me]],
                    description: {
                        "class": "ExpHistogramBar",
                    }
                }
            },
            position: {
                binBarSetLeftAlignedWithHistogramView: {
                    point1: {
                        element: [areaOfClass, "ExpHistogramView"],
                        type: [{ barStartPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    point2: { type: [{ barStartPointType: _ }, [areaOfClass, "ExpHistogramArea"]] },
                    equals: 0,
                },
                binBarSetRightAlignedWithHistogramView: {
                    point1: {
                        element: [areaOfClass, "ExpHistogramView"],
                        type: [{ barEndPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    point2: {
                        type: [{ barEndPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    equals: 0
                },
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            "class": "MinWrapVertical",
            position: {
                "vertical-center": 0,
            }
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            //"class": "MinWrapHorizontal",
            position: {
                left: 0,
                right: 0,
            }
        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            "class": "MinWrapVertical",
            position: {
                top: 0,
                bottom: 0,
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramBar: o(
        {
            "class": o(
                "GeneralArea",
                "ExpHistogramBarDesign",
                "TrackHistogramData"
                // either MemberOfTopToBottomAreaOS or MemberOfLeftToRightAreaOS
            ),
            context: {
                myData: [{ param: { areaSetContent: _ } }, [me]],
                barValue: [{ myData: { barVal: _ } }, [me]],
                myValLine: [{ children: { valLine: _ } }, [me]],
                myOverlayUniqueId: [{ myData: { overlayUniqueID: _ } }, [me]],
                showBarValues: [{ myApp: { settings: { showBarValues: _ } } }, [me]],
                // overlaysInfo provided by TrackHistogramData
                // ExpHistogramBarDesign API:                        
                barColor: [
                    {
                        color: _,
                        overlayUniqueID: [{ myOverlayUniqueId: _ }, [me]],
                    },
                    [{ overlaysInfo: _ }, [me]]
                ],
                // end of ExpHistogramBarDesign API            
            },
            children: {
                valLine: {
                    description: {
                        "class": "ExpBarValLine"
                    }
                }
            },
            position: {
                // equivalent to bottom:0 for verticalBars and left:0 for horizontalBars
                alignBaseWithEmbedding: {
                    point1: {
                        type: [{ barStartPointType: _ }, [areaOfClass, "ExpHistogramArea"]],
                        element: [embedding]
                    },
                    point2: {
                        type: [{ barStartPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    equals: 0
                },
                alignedWithMyValLine: {
                    point1: {
                        type: [{ barEndPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    point2: {
                        element: [{ myValLine: _ }, [me]],
                        type: [{ barEndPointType: _ }, [areaOfClass, "ExpHistogramArea"]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { showBarValues: true },
            children: {
                valDisplay: {
                    partner: [
                        [embeddingStar, [me]],
                        [areaOfClass, "ExpHistogramBin"]
                    ],
                    description: {
                        "class": "ExpHistogramBarValDisplay"
                    }
                }
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            "class": "MemberOfTopToBottomAreaOS",
            context: {
                // MemberOfPositionedAreaOS API:
                spacingFromPrev: [{ myApp: { settings: { barSpacing: _ } } }, [me]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                // end of MemberOfTopToBottomAreaOS API            
            },
            position: {
                height: [{ myApp: { settings: { barThickness: _ } } }, [me]]
            }
        },
        {
            qualifier: { expFacetType: "DateFacet" },
            "class": "MemberOfLeftToRightAreaOS",
            context: {
                // MemberOfPositionedAreaOS API:
                spacingFromPrev: [{ myApp: { settings: { barSpacing: _ } } }, [me]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                // end of MemberOfTopToBottomAreaOS API            
            },
            position: {
                //width: [{ myApp: { settings: { barThickness: _ } } }, [me]]
                // give all bars within the same barSet the same width
                sameWidthConstraint: {
                    pair1: {
                        point1: { type: "left" },
                        point2: { type: "right" },
                    },
                    pair2: {
                        point1: { label: "leftOfVirtualBar", element: [embedding] },
                        point2: { label: "rightOfVirtualBar", element: [embedding] },
                    },
                    ratio: 1,
                },
            }
        },
        {
            qualifier: { expFacetType: "SliderFacet" },
            "class": "MemberOfTopToBottomAreaOS",
            context: {
                // MemberOfPositionedAreaOS API:
                spacingFromPrev: [{ myApp: { settings: { barSpacing: _ } } }, [me]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                // end of MemberOfTopToBottomAreaOS API            
            },
            position: {
                // give all bars within the same barSet the same height
                sameHeightConstraint: {
                    pair1: {
                        point1: { type: "top" },
                        point2: { type: "bottom" },
                    },
                    pair2: {
                        point1: { label: "topOfVirtualBar", element: [embedding] },
                        point2: { label: "bottomOfVirtualBar", element: [embedding] },
                    },
                    ratio: 1,
                },
            }
        }
    ),

    ExpBarValLine: {
        "class": o("ScaleElement"),
        context: {
            backgroundColor: "pink",
            // beginning of ScaleElement API
            //myCanvas: [areaOfClass, "ExpHistogramCanvas"],
            myCanvas: [{ binReferenceCanvas: _ }, [areaOfClass, "ExpHistogramArea"]],
            highValAtLowHTMLLength: [{ myCanvas: { highValAtLowHTMLLength: _ } }, [me]],
            //highValAtLowHTMLLength: false, // for PositionByCanvasOffset
            //scaleAtLowHTML: true, // for PositionByCanvasOffset
            ofVerticalElement: [{ verticalBars: _ }, [areaOfClass, "ExpHistogramArea"]],
            value: [{ barValue: _ }, [embedding]]
            // end of ScaleElement API                        
        },
        position: {
            width: 0,
            height: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramBarValDisplay: o(
        {
            "class": o(
                //"HistogramBarValDisplay"
                "GeneralArea",
                "DefaultDisplayText",
                "TrackHistogramData"
            ),
            context: {
                myBin: [referredOf],
                myBar: [expressionOf],
                //myBar: [embedding],                
                displayTextPrefix: [{ myBar: { barValue: _ } }, [me]],
                labelMargin: 5,
                // variant controller
                verticalBars: [{ verticalBars: _ }, [areaOfClass, "ExpHistogramArea"]],
                histogramDisplayModeUnitDistribution: [
                    {
                        clipboardHistogramAD:
                        { histogramDisplayModeUnitDistribution: _ }
                    }, [me]]

            },
            embedding: "referred",
            independentContentPosition: false,
            display: {
                //background: "white",
                //opacity: 0.5
            },
            position: {
                width: [displayWidth],
                height: [displayHeight]
            },
        },
        {
            qualifier: { verticalBars: false },
            position: {
                verticallyCenteredWithMyBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "vertical-center" },
                    point2: { type: "vertical-center" },
                    equals: 0,
                },
                rightAlignedWithMyBar: {
                    point1: { type: "right" },
                    point2: { element: [{ myBar: _ }, [me]], type: "right" },
                    equals: [{ labelMargin: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                rightOfBaseline: {
                    point1: { element: [{ myBar: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    min: [{ labelMargin: _ }, [me]],
                }
            }
        },
        {
            qualifier: { verticalBars: true },
            position: {
                horizontallyCenteredWithMyBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "horizontal-center" },
                    point2: { type: "horizontal-center" },
                    equals: 0,
                },
                topAlignedWithMyBar: {
                    point1: { element: [{ myBar: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: [{ labelMargin: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                aboveBaseline: {
                    point1: { type: "bottom" },
                    point2: { element: [{ myBar: _ }, [me]], type: "bottom" },
                    min: [{ labelMargin: _ }, [me]],
                }
            },
            display: {
                transform: {
                    rotate: 270
                }
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
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSidePanel: o(
        {
            "class": o(
                "GeneralArea",
                "MinWrap"
                //"BackgroundColor",
            ),
            context: {
                minWrapAround: 0,
                minWrapCompressionPriority: positioningPrioritiesConstants.strongerThanDefaultPressure, //default was: positioningPrioritiesConstants.defaultPressure
                //backgroundColor: "pink",
                outerMargin: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],
                showLegend: [{ myApp: { settings: { showLegend: _ } } }, [me]],
                showSlicesDefinition: [{ myApp: { settings: { showSlicesDefinition: _ } } }, [me]],
                sidePanelElementAreaOS: o(
                    [{ children: { histogramLegend: _ } }, [me]],
                    [{ children: { histogramSlicesDefinition: _ } }, [me]]
                ),
            },
            position: {
                topAlignedWithHistogramArea: {
                    point1: { element: [areaOfClass, "ExpHistogramArea"], type: "top" },
                    point2: { type: "top" },
                    equals: 0,
                },
                right: [{ outerMargin: _ }, [me]],
                rightOfHistogramArea: {
                    point1: { element: [areaOfClass, "ExpHistogramArea"], type: "right" },
                    point2: { type: "left" },
                    equals: [{ outerMargin: _ }, [me]],
                }
            }
        },
        {
            qualifier: { showLegend: true },
            children: {
                histogramLegend: {
                    description: {
                        "class": "ExpHistogramSidePanelElement",
                        context: {
                            sideElementType: "legend"
                        }
                    }
                }
            }
        },
        {
            qualifier: { showSlicesDefinition: true },
            children: {
                histogramSlicesDefinition: {
                    description: {
                        "class": "ExpHistogramSidePanelElement",
                        context: {
                            sideElementType: "definition"
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. titleText
    // 2. sideElementType: "legend"/"definition"
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSidePanelElement: o(
        {
            "class": o(
                "Border",
                "MemberOfTopToBottomAreaOS"
            ),
            context: {
                titleText: "Title",
                titleArea: [{ children: { sidePanelElementTitle: _ } }, [me]],
                bodyArea: [{ children: { sidePanelElementBody: _ } }, [me]],
                outerMargin: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],
                // MemberOfTopToBottomAreaOS API:
                spacingFromPrev: [{ outerMargin: _ }, [me]],
                areaOS: [{ sidePanelElementAreaOS: _ }, [embedding]]
                // end of MemberOfTopToBottomAreaOS API            
            },
            children: {
                sidePanelElementTitle: {
                    description: {
                        "class": "ExpHistogramSidePanelElementTitle"
                    }
                },
                sidePanelElementBody: {
                    description: {
                        "class": "ExpHistogramSidePanelElementBody"
                    }
                }
            },
            position: {
                left: 0,
                width: 200
            }
        },
        {
            qualifier: { sideElementType: "legend" },
            context: {
                titleText: "Legend",
                positionIndex: 0,
            },
        },
        {
            qualifier: { sideElementType: "definition" },
            context: {
                titleText: "Slices Definition",
                positionIndex: 1,
            },
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSidePanelElementTitle: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            displayText: [{ titleText: _ }, [embedding]]
        },
        position: {
            top: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            left: 0,
            right: 0,
            height: [displayHeight]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSidePanelElementBody: {
        "class": o(
            "TrackHistogramData",
            "MinWrapVertical"
        ),
        context: {
            myTitle: [{ titleArea: _ }, [embedding]],
            // overlaysInfo provided by TrackHistogramData
            distanceFromTitle: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
        },
        position: {
            left: 0,
            right: 0,
            bottom: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            belowTitle: {
                point1: { element: [{ myTitle: _ }, [me]], type: "bottom" },
                point2: { type: "top" },
                equals: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]]
            },
        },
        children: {
            bodyElement: {
                data: [{ overlaysInfo: _ }, [me]],
                description: {
                    "class": "ExpHistogramSidePanelBodyItem"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSidePanelBodyItem: o(
        {
            "class": o(
                "MemberOfTopToBottomAreaOS",
                "MinWrapVertical"
            ),
            context: {
                sideElementType: [
                    { sideElementType: _ },
                    [
                        [embeddingStar, [me]],
                        [areaOfClass, "ExpHistogramSidePanelElement"]
                    ]
                ],
                //overlayUniqueID: [{ overlayInfo: { overlayUniqueID: _ } }, [me]],
                overlayInfo: [{ param: { areaSetContent: _ } }, [me]],
                overlayColor: [{ overlayInfo: { color: _ } }, [me]],
                overlayName: [{ overlayInfo: { name: _ } }, [me]],
                overlaySummary: [{ overlayInfo: { summary: _ } }, [me]],
                // MemberOfTopToBottomAreaOS API:
                spacingFromPrev: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
                spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
                // end of MemberOfTopToBottomAreaOS API            
                myIcon: [{ children: { itemIcon: _ } }, [me]],
                myTitle: [{ children: { itemTitle: _ } }, [me]],
            },
            children: {
                itemIcon: {
                    description: {
                        "class": "SidePanelBodyItemIcon",
                    }
                },
                itemTitle: {
                    description: {
                        "class": "SidePanelBodyItemTitle"
                    }
                }
            },
            position: {
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { sideElementType: "definition" },
            context: {
                myDefinition: [{ children: { itemDefinition: _ } }, [me]],
            },
            children: {
                itemDefinition: {
                    description: {
                        "class": "SidePanelBodyItemDefinition"
                    }
                }
            },
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SidePanelBodyItemIcon: o(
        {
            "class": o(
                "GeneralArea",
                "ExpHistogramConfigurationControlText",
                "BackgroundColor"
            ),
            context: {
                sideElementType: [{ sideElementType: _ }, [embedding]],
                color: [{ overlayColor: _ }, [embedding]],
                // size: defined in qualifiers
            },
            position: {
                top: 0,
                left: [{ leftMargin: _ }, [me]],
                width: [{ size: _ }, [me]],
                height: [{ size: _ }, [me]]
            }
        },
        {
            qualifier: { sideElementType: "legend" },
            "class": "ColorChangable",
            context: {
                leftMargin: [{ exportApp: { mediumMargin: _ } }, [globalDefaults]],
                size: 30
            },
        },
        {
            qualifier: { sideElementType: "definition" },
            context: {
                leftMargin: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
                size: 15
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ColorChangable: o(
        {   // default
            "class": o(
                "ColorChangableDesign",
                "MoreControlsController",
                "MoreControlsOnClickUXCore"
            ),
            context: {
                myMoreControlsController: [me],
                tooltipText: "Change color"
            }
        },
        {
            qualifier: { open: true },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "ColorChangableMenu"

                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ColorChangableMenu: {
        "class": o("GeneralArea", "MoreControlsMenu", "Grid"),
        context: {
            // Grid API
            // grid is 10 x 4 = 40 elements in total
            numberOfCellsInEachRow: 10,
            //myGridCellData: [sequence, r(1, 40)],
            myGridCellData: o(
                "#ffffff", "#000000", "#fef9cb", "#444d28", "#a5b493", "#f1a350", "#e6bb3b", "#cf93a7", "#9c86be", "#819fc1",
                "#f2f2f2", "#7f7f7f", "#fdf4a1", "#dee4cb", "#edf0e9", "#fcecdb", "#faf1d5", "#f5e9ed", "#ebe6f2", "#e5ebf2",
                "#d8d8d8", "#595959", "#faed65", "#bec997", "#dbe1d4", "#f9dab7", "#f4e3ac", "#ebd3db", "#d7cee4", "#ccd8e5",
                "#bfbfbf", "#3f3f3f", "#decc2d", "#9eaf64", "#c9d2be", "#f6c794", "#efd584", "#e1bdca", "#c3b6d8", "#b3c4d9",
                "#a5a5a5", "#262626", "#6f6612", "#33391e", "#7d9165", "#db7e24", "#b69127", "#b35575", "#71559e", "#5075a1",
                "#7f7f7f", "#0c0c0c", "#2c2903", "#212614", "#536143", "#925417", "#796018", "#7a364d", "#4b386a", "#354e6b"
            ),
            minWrapAround: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            originTriangleAboveMenu: false,
            // end of Grid API
        },
        propagatePointerInArea: o(),
        children: {
            gridCells: {
                //data: defined in Grid via myGridCellData
                description: {
                    "class": "ColorChangableMenuColorGridItem"
                }
            }
        },
        stacking: {
            aboveOriginTriangle: {
                higher: [me],
                lower: [
                    { myMenu: [me] },
                    [areaOfClass, "MenuOriginTriangle"]
                ]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. storeNewColor: writable ref (default provided: [{ color: _ }, [embedding]])
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ColorChangableMenuColorGridItem: o(
        {
            // default
            "class": o("BackgroundColor", "Border", "GridCell", "ButtonCore", "ModifyPointerClickable"),
            context: {
                color: [{ param: { areaSetContent: _ } }, [me]],
                borderWidth: 1,
                /*pos: [{ param: { areaSetContent: _ } }, [me]],
                hue: [mul, [{ pos: _ }, [me]], 9],
                sat: 50,
                lum: 50,
                color: [concatStr,
                    o(
                        "hsla(",
                        [{ hue: _ }, [me]], ",",
                        [{ sat: _ }, [me]], "%,",
                        [{ lum: _ }, [me]], "%",
                        ",1",
                        ")"
                    )
                ],*/
                storeNewColor: [{ myMenuAnchor: { color: _ } }, [embedding]]
            },
            position: {
                width: 20,
                height: 20
            },
            write: {
                onColorChangeClick: {
                    "class": "OnMouseClick",
                    true: {
                        writeSelectedColor: {
                            to: [{ storeNewColor: _ }, [me]],
                            merge: [{ color: _ }, [me]]
                        },
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SidePanelBodyItemTitle: o(
        {
            "class": o("DefaultDisplayText"),
            context: {
                sideElementType: [{ sideElementType: _ }, [embedding]],
            },
            position: {
                right: 0,
                height: [displayHeight],
                rightOfMyIcon: {
                    point1: { element: [{ myIcon: _ }, [embedding]], type: "right" },
                    point2: { type: "left" },
                    equals: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
                },
                verticallyCenteredWithMyIcon: {
                    point1: { element: [{ myIcon: _ }, [embedding]], type: "vertical-center" },
                    point2: { type: "vertical-center" },
                    equals: 0,
                }
            }
        },
        {
            qualifier: { sideElementType: "legend" },
            "class": o("TextInput", "TrackHistogramData"),
            context: {
                // TextInput API
                defaultTextInputDesign: true,
                enableBoxShadow: false,
                inputAppData: [{ overlayName: _ }, [embedding]],
                // end of TextInput API                
            },
        },
        {
            qualifier: { sideElementType: "definition" },
            context: {
                displayText: [concatStr,
                    o(
                        [{ overlayName: _ }, [embedding]],
                        ": "
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SidePanelBodyItemDefinition: {
        "class": o("DefaultDisplayText", "TextInput"),
        context: {
            //sideElementType: "definition" // no definition element in legend
            initInputAppData: [cond,
                [{ overlaySummary: _ }, [embedding]],
                o(
                    { on: true, use: [{ overlaySummary: _ }, [embedding]] },
                    { on: false, use: "All items" }
                )
            ],
        },
        position: {
            //height: [displayHeight],
            height: 40,
            belowIcon: {
                point1: { element: [{ myIcon: _ }, [embedding]], type: "bottom" },
                point2: { type: "top" },
                equals: 0,
            },
            leftALignedWithIcon: {
                point1: { element: [{ myIcon: _ }, [embedding]], type: "left" },
                point2: { type: "left" },
                equals: 0,
            },
            rightALignedWithTitle: {
                point1: { element: [{ myTitle: _ }, [embedding]], type: "right" },
                point2: { type: "right" },
                equals: 0,
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Histogram Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Exported Histogram Configuration Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramConfiguration: {
        "class": o("Border", "GeneralArea"),
        position: {
            top: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            bottom: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]],
            width: 200,
            left: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]]
        },
        children: {
            histogramOptionControlArea: {
                description: {
                    "class": "HistogramOptionControlArea"
                }
            },
            buttonsSet: {
                description: {
                    "class": "ExpHistogramSettingsButtonsSet"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramConfigurationControl: {
        "class": "GeneralArea",
        context: {
            horizontalMargin: [{ exportApp: { smallMargin: _ } }, [globalDefaults]],
        },
        position: {
            height: 20,
            left: [{ horizontalMargin: _ }, [me]],
            right: [{ horizontalMargin: _ }, [me]],
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramOptionControlArea: o(
        {
            "class": o(
                "GeneralArea",
                "MinWrapVertical",
                "TrackHistogramData"
            ),
            context: {
                controlData: o(
                    {
                        title: "Border Width:",
                        valueType: "int",
                        value: [{ myApp: { settings: { histogramBorderWidth: _ } } }, [me]],
                        allowedMin: 1,
                        allowedMax: 5
                    },
                    {
                        title: "Border Color:",
                        valueType: "color",
                        value: [{ myApp: { settings: { histogramBorderColor: _ } } }, [me]]
                    },
                    /*{
                        title: "Bin Spacing:",
                        valueType: "int",
                        value: [{ myApp: { settings: { binSpacing: _ } } }, [me]],
                    },*/
                    {
                        title: "Bar Spacing:",
                        valueType: "int",
                        value: [{ myApp: { settings: { barSpacing: _ } } }, [me]],
                        allowedMin: 0,
                        allowedMax: 20
                    },
                    {
                        title: "Legend:",
                        valueType: "boolean",
                        value: [{ myApp: { settings: { showLegend: _ } } }, [me]],
                        enabled: true
                    },
                    {
                        title: "Slices Definition:",
                        valueType: "boolean",
                        value: [{ myApp: { settings: { showSlicesDefinition: _ } } }, [me]],
                        enabled: true
                    },
                    {
                        title: "Show Bar Values:",
                        valueType: "boolean",
                        value: [{ myApp: { settings: { showBarValues: _ } } }, [me]],
                        enabled: true
                    }
                ),
            },
            children: {
                histogramOptionControls: {
                    data: [{ controlData: _ }, [me]],
                    description: {
                        "class": "HistogramOptionControl",
                    },
                },
            },
            position: {
                top: 0,
                left: 0,
                right: 0
            }
        },
        {
            qualifier: { expFacetType: "MSFacet" },
            context: {
                controlDataMSSpecific: o(
                    {
                        title: "Category Font Size:",
                        valueType: "int",
                        value: [{ myApp: { settings: { histogramCategoryFontSize: _ } } }, [me]],
                        allowedMin: 10,
                        allowedMax: 20
                    },
                    {
                        title: "Bar Height:",
                        valueType: "int",
                        value: [{ myApp: { settings: { barThickness: _ } } }, [me]],
                        allowedMin: 5,
                        allowedMax: 20
                    },
                    {
                        title: [concatStr,
                            o(
                                "Number of items",
                                " (out of ",
                                [{ numberOfItemsInData: _ }, [areaOfClass, "ExpHistogramArea"]],
                                "):"
                            )
                        ],
                        valueType: "int_items_controller",
                    },
                    {
                        title: "Show Others:",
                        valueType: "boolean",
                        value: [{ myApp: { settings: { showOthersUserChoice: _ } } }, [me]],
                        valueWhenDisabled: [{ showOthers: _ }, [areaOfClass, "ExpHistogramArea"]],
                        enabled: [{ moreItemsAvailable: _ }, [areaOfClass, "ExpHistogramArea"]]
                    }
                )
            },
            children: {
                histogramOptionControls: {
                    data: o(
                        [{ controlData: _ }, [me]],
                        [{ controlDataMSSpecific: _ }, [me]]
                    )
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // HistogramOptionControl
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HistogramOptionControl: {
        "class": o(
            "GeneralArea",
            "MemberOfTopToBottomAreaOS",
            "ExpHistogramConfigurationControl"
        ),
        context: {
            controlData: [{ param: { areaSetContent: _ } }, [me]],
            // MemberOfTopToBottomAreaOS API:
            spacingFromPrev: [{ exportApp: { smallMargin: _ } }, [globalDefaults]],
            spacingOfFirstAndLastWithRefArea: [{ spacingFromPrev: _ }, [me]],
            // end of MemberOfTopToBottomAreaOS API            
        },
        children: {
            text: {
                description: {
                    "class": "ExpHistogramConfigurationControlText",
                    context: {
                        displayText: [{ controlData: { title: _ } }, [embedding]]
                    }
                }
            },
            input: {
                description: {
                    "class": "ExpHistogramConfigurationControlInput",
                    context: {
                        controlData: [{ controlData: _ }, [embedding]],
                        valueType: [{ controlData: { valueType: _ } }, [me]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramConfigurationControlText: {
        "class": o("DefaultDisplayText"),
        position: {
            top: 0,
            bottom: 0,
            left: 0,
            width: [displayWidth]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:    
    // 1. inputAppData should be a writable reference
    // 2. valueType: int or string. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramConfigurationControlInput: o(
        {   // default                        
            position: {
                attachToTextArea: {
                    point1: {
                        element: [
                            [embedded, [embedding]],
                            [areaOfClass, "ExpHistogramConfigurationControlText"]
                        ],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ exportApp: { defaultMargin: _ } }, [globalDefaults]]
                },
            }
        },
        {
            qualifier: { valueType: "string" },
            "class": o("TextInput"),
            context: {
                // from API:
                // 1. inputAppData: should be writable
                // 2. valueType: "int" or "string"
                defaultTextInputDesign: true,
                enableBoxShadow: false,
                inputAppData: [{ controlData: { value: _ } }, [me]],
            },
            position: {
                top: 0,
                bottom: 0,
                width: 30,
            }
        },
        {
            qualifier: { valueType: "boolean" },
            "class": "BooleanButton",
            context: {
                selected: [{ controlData: { value: _ } }, [me]],
                selectedWhenDisabled: [{ controlData: { valueWhenDisabled: _ } }, [me]],
                performWriteOnClick: [{ controlData: { enabled: _ } }, [me]],
            },
            position: {
                top: 0,
                bottom: 0,
                width: 30
            }
        },
        {
            qualifier: { valueType: "int" },
            "class": "NumberInputMinMaxController",
            context: {
                defaultTextInputDesign: true,
                enableBoxShadow: false,
                inputAppData: [{ controlData: { value: _ } }, [me]],
                allowedMin: [{ controlData: { allowedMin: _ } }, [me]],
                allowedMax: [{ controlData: { allowedMax: _ } }, [me]],
            }
        },
        {
            qualifier: { valueType: "int_items_controller" },
            "class": "NumberOfItemsControl",
        },
        {
            qualifier: { valueType: "color" },
            "class": "ColorChangable",
            context: {
                color: [{ myApp: { settings: { histogramBorderColor: _ } } }, [me]]
            },
            position: {
                "vertical-center": 0,
                width: 20,
                height: 20
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumberOfItemsControl: o(
        {   //default            
            "class": "GeneralArea",
            context: {
                expHistogramIsExpanding: [{ expanding: _ }, [areaOfClass, "ExpHistogram"]]
            },
            position: {
                top: 0,
                bottom: 0,
                width: 30
            }
        },
        {
            qualifier: { expHistogramIsExpanding: true },
            "class": "DefaultDisplayText",
            context: {
                defaultTextInputDesign: true,
                enableBoxShadow: false,
                displayText: [{ numberOfShownItems: _ }, [areaOfClass, "ExpHistogramArea"]]
            }
        },
        {
            qualifier: { expHistogramIsExpanding: false },
            "class": "NumberInputMinMaxController",
            context: {
                inputAppData: [{ myApp: { settings: { numberOfItems: _ } } }, [me]],
                allowedMin: [cond,
                    [{ showOthers: _ }, [me]],
                    o(
                        { on: true, use: 2 },
                        { on: false, use: 1 }
                    )
                ],
                allowedMax: [min,
                    [{ numberOfItemsInData: _ }, [areaOfClass, "ExpHistogramArea"]],
                    [{ calcMaxNumberOfItemsInPage: _ }, [areaOfClass, "ExpHistogramArea"]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. inputAppData (writable reference) - see NumberInput API
    // 2. allowedMin: default 0
    // 3. allowedMax: default 100
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumberInputMinMaxController: o(
        {   // default
            "class": "NumberInput",
            context: {
                defaultTextInputDesign: true,
                enableBoxShadow: false,
                allowedMin: 1,
                allowedMax: 100,
                invalidInput: [or,
                    [lessThan,
                        [{ param: { input: { value: _ } } }, [me]],
                        [{ allowedMin: _ }, [me]]
                    ],
                    [greaterThan,
                        [{ param: { input: { value: _ } } }, [me]],
                        [{ allowedMax: _ }, [me]]
                    ]
                ],
                allowWritingInput: [and,
                    [not, [{ invalidInput: _ }, [me]]],
                    [{ inputIsValidNumber: _ }, [me]]
                ],
            },
            position: {
                top: 0,
                bottom: 0,
                width: 30
            }
        },
        {
            qualifier: {
                editInputText: true,
                invalidInput: true
            },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: [concatStr,
                    o(
                        "Error: Number should be between ",
                        [{ allowedMin: _ }, [me]],
                        " and ",
                        [{ allowedMax: _ }, [me]]
                    )
                ]
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSettingsButtonsSet: {
        "class": o("MinWrapVertical"),
        children: {
            histogramOptionControls: {
                data: o(
                    {
                        text: "Export to png",
                        command: "export_png"
                    },
                    {
                        text: "Print",
                        command: "print"
                    },
                    {
                        text: "Restore Default Settings",
                        command: "reset"
                    }
                ),
                description: {
                    "class": "ExpHistogramSettingsButton",
                },
            }
        },
        position: {
            bottom: 5,
            left: 0,
            right: 0,
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExpHistogramSettingsButton: o(
        { // default
            "class": o(
                "MemberOfTopToBottomAreaOS",
                "Border",
                "TextAlignCenter",
                "DefaultDisplayText",
                "ExpHistogramConfigurationControl",
                "GeneralArea"
            ),
            context: {
                myData: [{ param: { areaSetContent: _ } }, [me]],
                displayText: [{ text: _ }, [{ myData: _ }, [me]]],
                command: [{ command: _ }, [{ myData: _ }, [me]]],
                // MemberOfTopToBottomAreaOS API:
                spacingFromPrev: 5,
                // end of MemberOfTopToBottomAreaOS API
            },
        },
        {
            qualifier: { command: "reset" },
            write: {
                onResetSettingsControl: {
                    "class": "OnMouseClick",
                    true: {
                        resetSettings: {
                            to: [{ settings: _ }, [areaOfClass, "SettingsController"]],
                            merge: o()
                        },
                        resetOverlaysInfo: {
                            to: [{ overlaysInfo: _ }, [areaOfClass, "HistogramData"]],
                            merge: o()
                        },
                        resetWidthOfExpBinNamesExpandableArea: {
                            // to may not exist                            
                            to: [{ stableExpandableWidth: _ }, [areaOfClass, "ExpBinNamesExpandableArea"]],
                            merge: o()
                        },
                        resetHeightOfExpBinNamesExpandableArea: {
                            // to may not exist                            
                            to: [{ stableExpandableHeight: _ }, [areaOfClass, "ExpBinNamesExpandableArea"]],
                            merge: o()
                        },
                        resetWidthOfExpHistogram: {
                            to: [{ stableExpandableWidth: _ }, [areaOfClass, "ExpHistogram"]],
                            merge: o()
                        },
                        resetHeightOfExpHistogram: {
                            to: [{ stableExpandableHeight: _ }, [areaOfClass, "ExpHistogram"]],
                            merge: o()
                        }

                    }
                }
            }
        },
        {
            qualifier: { command: "export_png" },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        printApp: {
                            to: [download, "application", "png"],
                            merge: [{ myApp: _ }, [me]]
                            //merge: [areaOfClass, "ExpHistogram"] // bug #2116
                        }
                    }
                }
            }
        },
        {
            qualifier: { command: "print" },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        printApp: {
                            to: [printArea],
                            merge: [areaOfClass, "ExpHistogram"]
                        }
                    }
                }
            }
        }
    )

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Exported Histogram Configuration Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


};
