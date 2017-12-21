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

var msFacetDesignClasses = {
    //////////////////////////////////////////////////////
    MSSorterDesign: {
        "class": "SorterUXDisplayDesign"
    },
    
    ///////////////////////////////////////////////
    MSSelectionModeControlDesign: o(
        { 
            qualifier: { checked: true },
            display: {
                image: {
                    src: [{ imgWhenChecked:_ }, [me]]
                }
            }
        },
        { 
            qualifier: { checked: false },
            display: {
                image: {
                    src: [{ imgWhenNotChecked:_ }, [me]]
                }
            }
        },
        { 
            qualifier: { checked: false,
                         tmd: true },
            display: {
                image: {
                    src: [{ imgWhenChecked:_ }, [me]]
                }
            }
        }
    ),
    
    ///////////////////////////////////////////////
    MSInclusionControlDesign: {
        "class": "MSSelectionModeControlDesign",
        context: {
            imgWhenNotChecked: "%%image:(msInclusion.png)%%",
            imgWhenChecked: "%%image:(msInclusionSelected.png)%%"
        }
    },

    ///////////////////////////////////////////////
    MSExclusionControlDesign: {
        "class": "MSSelectionModeControlDesign",
        context: {
            imgWhenNotChecked: "%%image:(msExclusion.png)%%",
            imgWhenChecked: "%%image:(msExclusionSelected.png)%%"
        }
    }
};