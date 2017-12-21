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
    RadioButtonTestApp: {
        "class": "TestApp",
        children: {
            radioController: {
                description: {
                    "class": "TestRadioController"
                }
            }
        }
    },
    
    TestRadioController: {
        "class": "RadioButtonController",
        context: {
            // RadioButtonController params
            radioButtonOptions: o({ uniqueID: "a", displayText: "A"},
                                  { uniqueID: "b", displayText: "BB"},
                                  { uniqueID: "c", displayText: "CCC"})
        },
        position: {
            width: 400,
            height: 400,
            left: 100,
            top: 100
        },
        children: {
            buttons: {
                // defined by RadioButtonController
                description: {
                    "class": "TestRadioButton"
                }
            }
        }
    }
    
    TestRadioButton: {
        // "RadioButton" inherited in the buttons areaSet definition in RadioButtonController.
        /* additional functionality can be provided herein, including overriding the RadioButton definitions, e.g.:
        "class": "Border", 
        context: {
            minWrapAround: 5
        }*/
    }
};

var screenArea = {
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "RadioButtonTestApp"
            }
        }
    }
};
