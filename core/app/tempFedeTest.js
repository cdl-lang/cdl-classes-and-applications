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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAreaPane: {
        "class": o("BackgroundColor", "GeneralArea", "MinWrap"),
        context: {
            backgroundColor: "yellow",
            //displayKeypad: true,
            minWrapAround: 7,           
        },
        position: {
            top: 100,
            left: 100,
            //width: 250,
            //height: 200
        },
        children: {
            testArea: {                
                description: {
                    "class": "UDFEditorKeypad"
                }
            }
        }

    },
    
};

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "TestAreaPane"
            }
        }
    }
};
