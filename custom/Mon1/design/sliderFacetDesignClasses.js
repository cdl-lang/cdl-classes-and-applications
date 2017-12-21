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

var sliderDesignConstants = {
    selectionRangeOpacity: 0.2
};

var classes = {
    
    //////////////////////////////////////////////////////
    Slider1DValueMarkerOfPermIntOverlayDesign: o(
        { // override definitions inherited in ValueMarkerDesign by sibling classes (as this class is the first to be inherited by Slider1DValueMarkerOfPermIntOverlay)
            qualifier: { discreteWidgetABTestOption: "Circles3", 
                         ofImplicit1DSetItem: true,
                         ofSolutionSet: false },
            "class": "Border",
            context: {
                color: designConstants.globalBGColor, // override the definition of color provided in the default clause
                borderWidth: 1,
                borderColor: [{ overlayColor:_ }, [me]]
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    SliderSelectionArrowDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                createTopArrowHead: o(
                                      [not, [{ singleSelection:_ }, [me]]], // i.e. both selections exist
                                      [and,
                                       [{ singleSelection:_ }, [me]],
                                       [{ singleSelectionAtTop:_ }, [me]]
                                      ]
                                     ),
                createBottomArrowHead: o(
                                         [not, [{ singleSelection:_ }, [me]]], // i.e. both selections exist
                                         [and,
                                          [{ singleSelection:_ }, [me]],
                                          [not, [{ singleSelectionAtTop:_ }, [me]]] // i.e. single selection at bottom
                                         ]
                                        )
            }           
        },
        { // default
            "class": "GeneralArea",
            context: {
                arrowColor: [
                             { textColor:_ }, 
                             [first,
                              [
                               [embedded, [embedding]],
                               [areaOfClass, "FacetSelection"]
                              ]
                             ]
                            ]               
            },
            children: {
                arrowShaft: {
                    description: {
                        "class": "SliderSelectionArrowShaftDesign"
                    }
                }
            }
        },
        {
            qualifier: { createTopArrowHead: true },
            children: {
                topArrowHead: {
                    description: {
                        "class": "SliderSelectionTopArrowHeadDesign"
                    }
                }
            }
        },
        {
            qualifier: { createBottomArrowHead: true },
            children: {
                bottomArrowHead: {
                    description: {
                        "class": "SliderSelectionBottomArrowHeadDesign"
                    }
                }
            }
        }
    ),
    
    SliderSelectionArrowShaftDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ arrowColor:_ }, [embedding]]
        },
        position: {
            top: 0,
            bottom: 0,
            right: 0,
            minOffsetFromEmbeddingLeft: {
                point1: { element: [embedding], type: "left" },
                point2: { type: "left" },
                min: 0,
                priority: positioningPrioritiesConstants.weakerThanDefaultPressure
            },
            width: [densityChoice, { "V1": 1, "V2": 1, "V3": 2 }]
        }
    },  
    
    //////////////////////////////////////////////////////
    SliderSelectionArrowHeadDesign: {
        position: {
            width: 8,
            height: 4,
            left: 0,
            attachHorizontallyToShaft: {
                point1: { type: "horizontal-center" },
                point2: { element: [{ children: { arrowShaft:_ } }, [embedding]], type: "left" },
                equals: 0
            }
        },
        display: {
            triangle: { 
                color: [{ arrowColor:_ }, [embedding]]
            }
        }
    },
    
    //////////////////////////////////////////////////////
    SliderSelectionTopArrowHeadDesign: {
        "class": o("SliderSelectionArrowHeadDesign", "BottomSideTriangle"),
        position: {
            top: 0
        }
    },
    
    //////////////////////////////////////////////////////
    SliderSelectionBottomArrowHeadDesign: {
        "class": o("SliderSelectionArrowHeadDesign", "TopSideTriangle"),
        position: {
            bottom: 0
        }       
    },
    
    ///////////////////////////////////////////////
    SliderHistogramBinFrameDesign: o(
        { 
            qualifier: { firstBin: false },
            "class": "BottomBorder",
            context: { 
                borderColor: [{ histogramDesign: { binBorderColor:_ } }, [globalDefaults]],
                borderStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { firstBin: true, 
                         nonNumericalValuesExist: true },
            "class": "BottomBorder",
            context: { 
                borderColor: [{ histogramDesign: { binBorderColor:_ } }, [globalDefaults]],
                borderStyle: [{ histogramDesign: { binInnerBorderStyle: _ } }, [globalDefaults]]
            }
        }
    ),
                    
    ///////////////////////////////////////////////
    ValSelectorKnobDesign: o(
        {
            qualifier: { ofVerticalElement: true,
                         ofHighValSelector: true },
            display: {
                image: { 
                    src: "%%image:(knobOfTopSliderSelector.png)%%"
                }
            }       
        },
        {
            qualifier: { ofVerticalElement: true,
                         ofHighValSelector: false },
            display: {
                image: { 
                    src: "%%image:(knobOfBottomSliderSelector.png)%%"
                }
            }       
        },
        {
            qualifier: { ofVerticalElement: false,
                         ofHighValSelector: true },
            display: {
                image: { 
                    src: "%%image:(knobOfRightSliderSelector.png)%%"
                }
            }       
        },
        {
            qualifier: { ofVerticalElement: false,
                         ofHighValSelector: false },
            display: {
                image: { 
                    src: "%%image:(knobOfLeftSliderSelector.png)%%"
                }
            }       
        }
    )    
};
