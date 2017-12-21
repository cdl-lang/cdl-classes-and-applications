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
    AppButtonsControlPanelDesign: {
        display: {
            background: "#f4f0d5",
            borderTopWidth: 3,
            borderBottomWidth: 3,
            borderStyle: "solid",
            borderColor: "#e1ddc0"
        }
    },
    
    ///////////////////////////////////////////////
    AppControlPanelButtonDesign: o(
        { // default
            context: {
                borderWidth: 2
            },
            display: {
                borderLeftWidth: [{ borderWidth:_ }, [me]],
                borderStyle: "solid",
                borderColor: "#fcf9e4"
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            display: {
                borderRightWidth: [{ borderWidth:_ }, [me]]
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    AppControlPanelButtonTextDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            textSize: 14
        }
    },
    
    //////////////////////////////////////////////////////
    AppControlPanelButtonIconDesign: {
        display: { 
            image: {
                src: [{ icon:_ }, [embedding]]
            }
        }
    }    
};
