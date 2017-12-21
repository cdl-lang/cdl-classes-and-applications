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

// %%classfile%%: <generalDesignClasses.js>

initGlobalDefaults.scaleDesign = {
    primaryLabelTextSize: { "V1": 7, "V2": 9, "V3": 11 },
    secondaryLabelTextSize: { "V1": 5, "V2": 7, "V3": 9 }
};

var classes = {

    //////////////////////////////////////////////////////
    ScaleTickmarkDesign: o(
        {
            context: {
                borderWidth: 1
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "TopBorder"
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "RightBorder"
        }
    ),

    //////////////////////////////////////////////////////
    ScaleLabelTickmarkDesign: {
        "class": "ScaleTickmarkDesign",
        context: {
            borderColor: "#555555"
        }
    },

    //////////////////////////////////////////////////////
    ScaleUnlabeledTickmarkDesign: {
        "class": "ScaleTickmarkDesign",
        context: {
            tickmarkSize: 2
        }
    }
};        
