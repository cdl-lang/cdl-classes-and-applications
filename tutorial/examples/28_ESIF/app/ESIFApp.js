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


// %%classfile%%: "../../18_BasicClasses/screenArea.js"
// %%classfile%%: "../../18_BasicClasses/generator.js"
// %%classfile%%: "../data/ESIFData.js"
// %%classfile%%: "../crossCuttingThemes/ESIFCrossCuttingThemes.js"
// %%classfile%%: "../selectionChain/ESIFSelectorSearch.js"
// %%classfile%%: "../selectionChain/ESIFSelectors.js"
// %%classfile%%: "../selectionChain/ESIFValueTranslation.js"
// %%classfile%%: "ESIFLayouts.js"
// %%classfile%%: "ESIFViews.js"
// %%classfile%%: "ESIFSlices.js"

var classes = {

    // top level area for this application. Stores all the global
    // areas created for this application.
    
    AppContext: {
        context: {          
            inTheMiddleOfAnimation: [{ inTheMiddleOfAnimation: _ }, [areaOfClass, "ESIFSingleViewSliceEditorLayout"]],
            // scale options:
            simplifiedScale: [{ inTheMiddleOfAnimation: _ }, [me]], // when true tickmarks are disabled (except for min and max)
            // multibars options:
            showMultibarValues: true, //[not, [{ inTheMiddleOfAnimation: _ }, [me]]],
            // Fonts (currently used by multibar and legend)
            fontFamily: '"Open Sans",Roboto,sans-serif',
            fontWeight: 300,
            defaultTextColor: "#111111",               
        }
    },

    ESIFApp: o(
        {
            // various global classes required at the root of the application
            "class": o("AppContext", "ESIFDataContext", "NextIdContext",
                       "ESIFValueTranslation"),

            context: {
                pathToData: "../../../../../data/",
            },
            
            children: {
                categorisationData: { description: {
                    "class": "ESIFCategorisationData"
                }},

                layouts: { description: {
                    "class": "ESIFSingleViewLayout",
                    context: {
                        // initially, the default view is the active view
                        "^activeView": o({ id: 0 })
                    },
                    position: {
                        // xxxxxxxxxxxxxxxx
                        frame: 0 
                    }
                }},

                // area to manage all slices in the application
                sliceManager: { description: {
                    "class": "ESIFSliceManager"
                }},

                // area to manage all views in teh application
                viewManager: { description: {
                    "class": "ESIFViewManager",
                    context: {
                        // initialize with a single view (ID before the first
                        // ID assigned by the global 'nextId').
                        "^views": o({ id: 0 })
                    }
                }},

                // intervention field manager and menu (constructed once,
                // globally)
        
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
        }
    )
};

var screenArea = {
    "class": o("ScreenArea", "ESIFApp"),
};
