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


var initGlobalDefaults = {
    // theme menu colors
    scrollableSelectorItemSize: 30,
    matrixSelectorItemHeight: 30,
    matrixSelectorItemMinWidth: 70,
    matrixSelectorItemMaxWidth: 105
};


// %%classfile%%: "../28_ESIF/selectionChain/ESIFSelectors.js"

var classes = {
};

var screenArea = {

    "class": o("ScreenArea", "ESIFDataContext"),

    context: {
        pathToData: "../../../../data/"
    },
    
    children: {
        data: {
            description: {
                "class": "ESIFCategorisationData",
            }
        },
        slices: {
            description: {
                "class": "ESIFSliceManager",
                context: {
                    // a single slice
                    sliceIds: o({ id: 0 }),
                }
            }
        },
        selectors: {
            description: {
                "class": o("ESIFSliceEditor", "ESIFSelectorDesignContext",
                           "ESIFValueTranslation"),
                context: {
                    // the demo contains a single slice with ID 0
                    slice: [{ id: 0 },
                            [{ slices: _ }, [areaOfClass, "ESIFSliceManager"]]],
                    dimensionSelectorPanelSide: "right",
                    facetSelectorPanelSide: "left",
                },
                position: { frame: 0 }
            }
        },

        // intervention field manager and menu (constructed once, globally)
        
        themeManager: {
            description: {
                "class": "ESIFCrossCuttingThemeManager"
            }
        },
        internventionFieldThemeMenu:  {
            description: {
                "class": "ESIFSearchThemeMatrix"
            }
        }
    }
    
};
