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

var hoveringFontSizePremium = 1;

var classes = {
        
    //////////////////////////////////////////////////////
    OverlayShowControlCoreDesign: o(
        { // default
            "class": "DarkControlOpacityDesign",
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: { show: true },
            display: {
                image: {
                    src: [{ overlayShownImage:_ }, [me]],
                    alt: "Showing"
                }
            }           
        },
        {
            qualifier: { show: false },
            display: {
                image: { 
                    src: [{ overlayHiddenImage:_ }, [me]],
                    alt: "Hidden"
                }
            }           
        },
        {
            qualifier: { ofBlacklistOverlay: false },
            context: {
                overlayShownImage: "%%image:(overlayShown.svg)%%",
                overlayHiddenImage: "%%image:(overlayHidden.svg)%%"
            }
        },
        {
            qualifier: { ofBlacklistOverlay: true },
            context: { // replace with blacklist-specific icons
                overlayShownImage: "%%image:(overlayShownBlacklist.svg)%%",
                overlayHiddenImage: "%%image:(overlayHiddenBlacklist.svg)%%"
            }
        }
    ),

    //////////////////////////////////////////////////////
    OverlayUnionModeIndicatorDesign: {
        display: {
            image: { 
                src: "%%image:(unionMode.png)%%",
                alt: "Union"
            }
        }           
    },
    
    //////////////////////////////////////////////////////
    ZoomBoxingModeMarkerBackgroundDesign: {
        "class": "BackgroundColor"
    },
    
    //////////////////////////////////////////////////////
    ZoomBoxingModeMarkerRingDesign: {
        "class": o("Circle", "BackgroundColor")
    },  
    
    //////////////////////////////////////////////////////
    ZoomBoxingModeMarkerDesign: o(
        { // default
            "class": o("Circle", "BackgroundColor", "TextAlignCenter", "DefaultDisplayText"),
            context: {
                textSize: [densityChoice, { "V1": 16, "V2": 18, "V3": 18 }],
                textColor: designConstants.globalBGColor
            }
        },
        {
            qualifier: { ofInclusiveZoomBoxingOverlay: true },
            context: {
                backgroundColor: "#3fa213",
                displayText: "+"
            }
        },
        {
            qualifier: { ofExclusiveZoomBoxingOverlay: true },
            context: {
                backgroundColor: "#d70e0e",
                displayText: "-"
            }
        }
    )    
};
