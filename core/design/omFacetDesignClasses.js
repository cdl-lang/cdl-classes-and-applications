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
    OMFDesign: {

    },
    
    //////////////////////////////////////////////////////
    OMFNameDesign: o(
        {
            qualifier: { ofMinimizedFacet: false },
            context: {
                horizontalPadding: [densityChoice, bFSPosConst.horizontalMarginAroundExpandedOMFName] 
                
            },
            display: {
                paddingLeft: [{ horizontalPadding:_ }, [me]],
                paddingRight: [{ horizontalPadding:_ }, [me]]
            }
        }
    ),
        
    //////////////////////////////////////////////////////
    AutoOMFacetXIntOSRDesign: {
    },

    //////////////////////////////////////////////////////
    OMFSelectionControlDesign: {
        "class": o("SelectionControlDesign"),
        context: {
            myFacet: [{ myFacet: _ }, [embedding]],
            // OMFSelectionControlDesign (SelectionControlDesign) params
            innerCircleColor: [{ myFacet: { color: _ } }, [me]],
            radius: [densityChoice, [{ oMFConst: { selectionControlRadius: _ } }, [globalDefaults]]],
            borderWidth: [densityChoice, [{ oMFConst: { selectionControlBorderWidth: _ } }, [globalDefaults]]],
            indicationRadius: [densityChoice, [{ oMFConst: { oMMRadius: _ } }, [globalDefaults]]]
        }
    },

    //////////////////////////////////////////////////////
    OMFacetXIntOSRSelectionControlDesign: {
        "class": "OMFSelectionControlDesign",
        context: {
            defaultBorderColor: [{ myFacet: { myOverlay: { color:_ } } }, [embedding]] // override SelectionControl param
        }        
    },

    //////////////////////////////////////////////////////
    ExtensionalOMFCellSelectionControlDesign: {
        "class": "OMFSelectionControlDesign"
    },

    //////////////////////////////////////////////////////
    OMMDesign: {
        "class": o("Circle", "BackgroundColor")
    }    
};
