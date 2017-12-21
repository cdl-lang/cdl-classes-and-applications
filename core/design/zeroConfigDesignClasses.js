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

initGlobalDefaults.zeroConfigDesign = {
    preloadedDBControlsTextSize: { "V1": 10, "V2": 11, "V3": 14 },
    preloadedDBControlsTextColor: "#5b5b5b",
    secondaryLabelTextSize: { "V1": 5, "V2": 7, "V3": 9 },
    preloadedDBDropDownMenuBorderColor: "#8a8a8a"
};

var classes = {

    ///////////////////////////////////////////////
    PreloadedDBIconDesign: {
        display: {
            image: {
                src: "%%image:(database.svg)%%",
                alt: "Database",
                size: "100%"
            }
        }
    },

    //////////////////////////////////////////////////////
    PreloadedDBControlsDesign: {
        context: {
            textSize: [densityChoice, [{ zeroConfigDesign: { preloadedDBControlsTextSize: _ } }, [globalDefaults]]],
            textColor: [{ zeroConfigDesign: { preloadedDBControlsTextColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    PreloadedDBControlsDropDownMenuableDesign: {
        "class": o("PreloadedDBControlsDesign", "DropDownMenuableDesign"),
        context: {
            dropDownMenuShowControlTriangleColor: designConstants.globalBGColor
        }
    },

    //////////////////////////////////////////////////////
    PreloadedDBControlsDropDownMenuDesign: {
        "class": o("DropDownMenuBorderDesign"),
        context: {
            borderColor: [{ zeroConfigDesign: { preloadedDBDropDownMenuBorderColor:_ } }, [globalDefaults]]
        }        
    },

    //////////////////////////////////////////////////////
    PreloadedDBControlsMenuLineDesign: {
        "class": "DropDownMenuLineDesign"
    },

    //////////////////////////////////////////////////////
    PreloadedDBRefreshDataControlDesign: {
        "class": "OnHoverFrameDesign",
        context: {
            enabledBorderColor: "#e2e2e2",
            borderWidth: 1
        }
    },

    //////////////////////////////////////////////////////
    PreloadedDBRefreshDataControlTextDesign: {
        "class": o("PreloadedDBControlsDesign", "DefaultDisplayText"),
        context: {
            textColor: "#4485f4",
            enabledBorderColor: "#e2e2e2"
        }
    },

    //////////////////////////////////////////////////////
    PreloadedDBRefreshDataControlIconDesign: {
        display: {
            image: {
                size: "100%",
                src: "%%image:(refreshData.svg)%%"
            }
        }
    }        
};

