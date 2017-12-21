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
    ///////////////////////////////////////////////
    MinimizedFacetViewPaneDesign: o(
        { // default
        },
        {
            qualifier: { horizontallyMinimized: false },
            "class": "HoveringFacetDesign",
            context: {
                backgroundColor: designConstants.globalBGColor
            }
        }
    ),

    ///////////////////////////////////////////////
    MinimizedFacetViewPaneTopPanelDesign: {
        "class": "PaneTopPanelDesign"
    },

    ///////////////////////////////////////////////
    MinimizedFacetViewPaneSearchBoxDesign: {
        "class": "ViewPaneSearchBoxDesign"
    },

    ///////////////////////////////////////////////
    MinimizedFacetViewPaneTagsPaneControlsDesign: {
    },

    //////////////////////////////////////////////////////
    FSAppAddUDFacetControlDesign: o(
        { // default    
            "class": "FSAppControlCoreBackgroundDesign"
        },
        {
            qualifier: { horizontallyMinimized: true },
            "class": "MinimizedPaneIconDesign",
            display: {
                image: {
                    src: "%%image:(plusNoCircle.svg)%%",
                    size: "100%",
                    alt: "plus"
                }
            }
        },
        {
            qualifier: { horizontallyMinimized: false },
            // no additional specs here
        }
    ),

    //////////////////////////////////////////////////////
    MinimizedPaneIconDesign: {
        "class": o("Circle", "BackgroundColor"),
        context: {
            radius: 8,
            backgroundColor: "#1d1d1b"
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsNumColumnsControlDesign: {
        "class": "OnHoverFrameDesign"
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsNumColumnsControlCoreDesign: {
        "class": "ScaleControlArrow",
        context: {
            // override ScaleControlArrow params
            arrowBase: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlHeight: _ } }, [globalDefaults]]],
            arrowHeight: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlBase: _ } }, [globalDefaults]]],
            arrowHotspot: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlHotspotMargin: _ } }, [globalDefaults]]],
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsIncNumColumnsControlDesign: {
        children: {
            arrow: {
                description: {
                    "class": o("MinimizedFacetsNumColumnsControlCoreDesign", "BottomSideTriangle")
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsDecNumColumnsControlDesign: {
        children: {
            arrow: {
                description: {
                    "class": o("MinimizedFacetsNumColumnsControlCoreDesign", "TopSideTriangle")
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsNumColumnsControlIconDesign: {
        "class": "HorizontalWrapAroundController",
        context: {
            // WrapAroundController params
            wrapArounds: [{ children: { iconBars: _ } }, [me]],
            wrapAroundSpacing: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlMarginFromIcon: _ } }, [globalDefaults]]],
            wrapAroundSecondaryAxisSpacing: [densityChoice, [{ fsAppPosConst: { minimizedFacetsColumnNumControlMarginFromIcon: _ } }, [globalDefaults]]]
        },
        children: {
            iconBars: {
                data: [sequence, r(1, 7)],
                description: {
                    "class": "MinimizedFacetsNumColumnsControlIconBarDesign"
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    MinimizedFacetsNumColumnsControlIconBarDesign: o(
        { // default
            "class": o("BackgroundColor", "RoundedCorners", "GeneralArea", "WrapAround"),
            context: {
                borderRadius: [densityChoice, [{ fsAppPosConst: { numColumnsControlIconBarRadius:_ } }, [globalDefaults]]],
                backgroundColor: "#1d1d1b"
            },
            position: {
                width: [densityChoice, [{ fsAppPosConst: { minimizedFacetsNumColumnsControlIconBarWidth: _ } }, [globalDefaults]]],
                height: [densityChoice, [{ fsAppPosConst: { minimizedFacetsNumColumnsControlIconBarHeight: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { firstOfWrapArounds: true },
            position: {
                top: 0,
                left: 0
            }
        }
    )
};