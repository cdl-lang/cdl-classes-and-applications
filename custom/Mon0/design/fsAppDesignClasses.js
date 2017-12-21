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
    AppControlPanelButtonDesign: {
        "class": o("BackgroundColor", "Border", "TextBold", "DefaultDisplayText") //"TextAlignCenter", 
    },
    
    ///////////////////////////////////////////////
    FacetSummaryViewControlDesign: o(
        {
            qualifier: { checked: false },
            display: {
                text: {
                    color: designConstants.fadedFGColor
                }
            }
        }
    ),
    
    ///////////////////////////////////////////////
    MinimizedOverlaysViewDesign: {
        display: {
            background: "lightgrey"
        }
    },
    
    ///////////////////////////////////////////////
    AppTrashDesign: o(
        { // default
            display: {
                background: "lightgrey"
            }
        },
        {
            qualifier: { maximizedOverlayExists: false,
                         open: false,
                         hoveringOverTrash: true },
            "class": "Border"
        }
    ),
    
    ///////////////////////////////////////////////
    TrashDisplayDesign: {
        display: { 
            image: {
                src: "%%image:(overlaysTrash.png)%%"
            }
        }
    }
};