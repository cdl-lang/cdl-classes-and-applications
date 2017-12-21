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


var initGlobalDefaults = { defaultPrimaryColor: "#004494" };

// %%classfile%%: "../28_ESIF/crossCuttingThemes/ESIFCrossCuttingThemes.js"

// This file is a test application for the cross-cutting theme manager
// and menu. It uses the ESIF corss cutting theme classes defined in the
// included files.

var classes = {
    ThemeMatrixDemoDesign: {
        context: {
            colorPalette: {
                defaultPrimaryColor: "#004494",
                selectedDefaultPrimaryColor: "#0058A0",
                lightPrimaryColor: "#0065A2",
                selectedLightPrimaryColor: "#007ca5",
                intermediatePrimaryColor: "#00559B",
                selectedIntermediatePrimaryColor: "#007ca5",
                textForDefaultPrimaryColor: "#f0f0d0",
                selectedTextForDefaultPrimaryColor: "#ffc000",
                textForLightPrimaryColor: "#e0e0b0",
                selectedTextForLightPrimaryColor: "#ffb800",
                topLevelDividerColor: "#d0d0d0",
                topLevelBackgroundColor: "#90b0b0",
                pileBorderColor: "#202020",
                cornerArrowColor: "#c0c0c0",
                highlightedCornerArrowColor: "#ffffff"
            },

            fonts: {
                topThemeFontSize: 13,
                subThemeFontSize: 13
            }
            
        }
    }
};

var screenArea = {

    children: {
        themeManager: {
            description: {
                "class": "ESIFCrossCuttingThemeManager"
            }
        },
        themeMatrix: {
            description: {
                "class": o("ThemeMatrixDemoDesign", "ESIFThemeMatrix"),
                position: {
                    left: 20,
                    top: 20
                },
            }
        }
    }
};
