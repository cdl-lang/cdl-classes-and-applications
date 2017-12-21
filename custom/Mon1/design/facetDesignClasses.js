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

// %%constantfile%%: <fsPositioningConstants.js>

var classes = {

    //////////////////////////////////////////////////////
    FacetSorterUXDisplayDesign: o(
        { // default
            "class": "FSSorterUXDisplayDesign"
        },
        {
            qualifier: { sortingLevel: 1 },
            context: {
                height: fsPosConst.sortingLevel1SorterHeight
            }
        },
        {
            qualifier: { sortingLevel: 2 },
            context: {
                height: fsPosConst.sortingLevel2SorterHeight
            }
        },
        {
            qualifier: { sortingLevel: 3 },
            context: {
                height: fsPosConst.sortingLevel3SorterHeight
            }
        }
    ),
                    
    //////////////////////////////////////////////////////
    ContentFrameDesign: {
        "class": "Border",
        context: {
            borderColor: "lightGrey"
        }
    },
    
    ///////////////////////////////////////////////
    // API:
    // 1. overlayColor
    // 2. ofImplicit1DSetItem
    // 3. ofSolutionSet
    ///////////////////////////////////////////////
    ValueMarkerDesign: o(
        { // default
            "class": o("Circle", "BackgroundColor"),
            context: {
                color: [{ overlayColor:_ }, [me]], // by default, assume it is in the solutionSet
            }                        
        },
        {
            qualifier: { discreteWidgetABTestOption: "Circles1", 
                         ofImplicit1DSetItem: true,
                         ofSolutionSet: false },
            "class": "Border",
            context: {
                color: designConstants.globalBGColor, // override the definition of color provided in the default clause
                borderWidth: 1,
                borderColor: [{ overlayColor:_ }, [me]]
            }
        },
        {
            qualifier: { discreteWidgetABTestOption: "Circles2", 
                         selectionsMade: false,
                         ofImplicit1DSetItem: true
                       },
            context: {
                color: designConstants.enabledColor
            }
        },              
        {
            qualifier: { discreteWidgetABTestOption: "Circles2",
                         selectionsMade: true,
                         ofImplicit1DSetItem: true,
                         ofSolutionSet: false },
            context: {
                color: designConstants.enabledColor
            }
        },              
        { // i.e only of the base overlay. asking about ofSolutionSet is supposedly redundant if ofImplicit1DSetItem is false
          // but in union mode, ofImplicit1DSetItem is false (as we don't currrently define the implicitSet there), and ofSolutionSet may be true
          // so we want to make sure that this variant doesn't override the default clause above, in that case.
            qualifier: { discreteWidgetABTest: "Circles", 
                         ofImplicit1DSetItem: false,
                         ofSolutionSet: false }, // i.e only of the base overlay
            context: {
                color: designConstants.disabledColor
            }
        }     
    ),
    
    //////////////////////////////////////////////////////
    FSSorterUXDisplayDesign: o(
        { // default
            context: {
                height: [{ fsPosConst: { defaultSorterHeight:_ } }, [globalDefaults]],
                width: [mul, [{ height:_ }, [me]], [{ fsPosConst: { sorterWidthToHeightRatio:_ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { indicateSelectability: true },
            context: {
                triangleColor: designConstants.onHoverColor
            }
        },
        {
            qualifier: { indicateSelectability: false,
                         sortingByMe: false },
            "class": "BottomSideTriangle",
            context: {
                triangleColor: designConstants.enabledColor
            }
        },
        {
            qualifier: { indicateSelectability: false,
                         sortingByMe: true },
            context: {
                triangleColor: designConstants.selectedColor
            }
        },
        {
            qualifier: { sortingByMe: false },
            "class": "BottomSideTriangle"
        },
        {
            qualifier: { sortingByMe: true,
                         sortingDirection: "descending" },
            "class": "TopSideTriangle"
        },
        {
            qualifier: { sortingByMe: true,
                         sortingDirection: "ascending" },
            "class": "BottomSideTriangle"
        }
    )    
};
