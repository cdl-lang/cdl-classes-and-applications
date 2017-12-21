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

var sliderFacetDesignClasses = {
    ///////////////////////////////////////////////
    SliderSelectionsModifierDesign: {
        "class": "FacetSelectionDesign"
    },
    
    //////////////////////////////////////////////////////
    SliderOverlayXWidgetDesign: {
    },
    
    ///////////////////////////////////////////////
    SliderContinuousRangeDesign: { 
        display: {
            background: [{ color:_ }, [me]],
            opacity: sliderDesignConstants.noSelectionRangeOpacity
        }
    },

    ///////////////////////////////////////////////
    InfinityLineDesign: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { selectionsMade: true },
            display: {
                opacity: sliderDesignConstants.selectionRangeOpacity
            }
        },
        {
            qualifier: { selectionsMade: false },
            display: {
                opacity: sliderDesignConstants.noSelectionRangeOpacity
            }
        },
        {
            qualifier: { selectionsMade: false,
                         ofEphIntOverlay: true },
            display: {
                // if no selections made in this facet for the EphIntOverlay, the infinity lines should be the color of the base
                background: [{ baseOverlayColor:_ }, [me]] 
            }
        }
    )
};
