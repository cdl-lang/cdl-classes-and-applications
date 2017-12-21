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

// %%classfile%%: <facetClasses.js>
// %%classfile%%: <discreteFacetClasses.js>
// %%classfile%%: <discreteFacetDesignClasses.js>

var discreteFacetClasses = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteOverlayXWidget: {
        "class": o("DiscreteOverlayXWidgetDesign", superclass)
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscretePermOverlayXWidget: {
        "class": o("DiscretePermOverlayXWidgetDesign", superclass)
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DiscreteValue: o(
        { // default
            "class": superclass,
            context: {
                spacingFromPrev: discretePosConst.valueLengthAxisSpacing // override default value          
            },       
            position: {
                endGirthConstraint: {
                    point1: {
                        type: [{ endGirth:_ }, [me]]
                    },
                    point2: {
                        element: [embedding],
                        type: [{ endGirth:_ }, [me]]
                    },
                    equals: 0
                }                
            }
        },
        {
            qualifier: { ofPrimaryWidget: true },
            context: {
                length: discretePosConst.valueInPrimaryWidgetMinHeight
            }
        }
    ),
   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PermOverlayDiscreteValueSelection: {
        "class": o("PermOverlayDiscreteValueSelectionDesign", superclass),
        position: {
            frame: 0
        }
    }
};
