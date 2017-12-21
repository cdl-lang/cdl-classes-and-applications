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

    //////////////////////////////////////////////////////
    DiscreteValueDesign: o(
        { // default
            "class": "TopBorder",
            display: {
                borderColor: "#e2e2e2"
            }
        },
        {
            qualifier: { lastValue: true },
            display: {
                borderBottomWidth: [{ defaultBorderWidth: _ }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DiscreteSelectionDesign: o(
        { // 
            "class": "FacetSelectionDesign"
        },
        {
            qualifier: { included: false }, // i.e. value is excluded
            "class": "TextLineThrough"
        }
    ),

    ///////////////////////////////////////////////
    DiscreteValueNameTextDesign: {
        "class": o("TextOverflowEllipsisDesign", "DefaultDisplayText")
    },

    ///////////////////////////////////////////////
    DiscreteValueNameDesign: o(
        { // default
        },
        {
            qualifier: { valueAsText: true },
            "class": "DiscreteValueNameTextDesign"
        },
        {
            qualifier: {
                valueAsText: true,
                ofVerticalElement: true
            },
            display: {
                paddingRight: 5
            }
        },
        {
            qualifier: {
                valueAsText: true,
                ofVerticalElement: false
            },
            "class": "TextAlignCenter"
        },
        {
            qualifier: {
                valueAsText: true,
                noValue: true
            },
            "class": "TextItalic"
        },
        {
            qualifier: {
                valueAsText: true,
                ignoreEffectiveBaseValues: false,
                inEffectiveBaseValues: false
            },
            context: {
                textColor: [{ generalDesign: { disabledTextColor:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {
                valueAsText: false, // i.e a symbol is used
                ignoreEffectiveBaseValues: false,
                inEffectiveBaseValues: false
            },
            "class": "DisabledSymbolsDesign"
        }
    ),

    ///////////////////////////////////////////////
    DisabledSymbolsDesign: {
        display: { opacity: 0.2 }
    },

    ///////////////////////////////////////////////
    DiscretePermOverlayXWidgetDesign: {
    },

    ///////////////////////////////////////////////
    DiscreteValueReorderHandleDesign: {
        "class": "DraggableHandleDesign"
    },

    ///////////////////////////////////////////////
    DiscreteSelectionControlDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selectionDisabled: [{ myOverlayXWidget: { disabled: _ } }, [embedding]],  
                temporaryIncludedOrExcluded: o(
                    [{ myOverlayXWidget: { tmpDiscreteValueInclusion: _ } }, [me]],
                    [{ myOverlayXWidget: { tmpDiscreteValueExclusion: _ } }, [me]]
                )
            }
        },
        { // default
            "class": "SelectionControlDesign"
        },
        {
            qualifier: { temporaryIncludedOrExcluded: true },
            display: {
                opacity: designConstants.discreteIncludeExcludeValueMarkerOpacityWhenInTempPreviewMode
            }
        },
        {
            qualifier: { disabled: true },
            context: {
                borderColor: designConstants.disabledColor
            }
        },
        {
            qualifier: { ofSolutionSet: true },
            context: {
                borderColor: [{ overlayColor: _ }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////
    DiscreteSelectionFormDesign: o(
        { // default
        },
        {
            qualifier: {
                included: false,
                excluded: false
            },
            "class": "Border",
            context: {
                borderColor: "#c7c7c7"
            }
        },
        {
            qualifier: {
                included: false,
                excluded: false,
                indicateSelectability: true
            },
            context: {
                borderColor: designConstants.onHoverColor
            }
        },
        {
            qualifier: { included: true },
            display: {
                image: {
                    src: "%%image:(greenCheckmark.png)%%",
                    alt: "Included"
                }
            }
        },
        {
            qualifier: { excluded: true },
            display: {
                image: {
                    src: "%%image:(redExclusion.png)%%",
                    alt: "Excluded"
                }
            }
        }
    )
};
