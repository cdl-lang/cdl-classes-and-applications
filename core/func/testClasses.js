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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
 // A bunch of general purpose utility classes 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. testResetable: boolean, false by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestApp: o(
        { // default
            "class": "App",
            context: {
                testResetable: false
            },
            position: {
                frame: 0
            },
            children: {
                annotation: {
                    description: {
                        "class": "TestAnnotation"
                    }
                }
            }
        },
        {
            qualifier: { testResetable: true },
            children: {
                resetControl: {
                    description: {
                        "class": "TestResetControl"
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": o("DefaultDisplayText", "GeneralArea"),
        position: {
            left: 10, right: 0, top: 15, height: 100
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. position
    // 2. the true clause for onTestResetControlReset
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestResetControl: {
        "class": o("ButtonDesign", "Border", "GeneralArea"),
        context: {
            displayText: "Reset"
        },
        position: {
            // position: provided by inheriting class
            width: 150,
            height: 20
        },
        write: {
            onTestResetControlMouseClick: { 
                "class": "OnMouseClick",
                true: {
                    sendMessage: {
                        to: [message],
                        merge: {
                            msgType: "Reset",
                            recipient: [me]
                        }
                    }
                }
            },          
            onTestResetControlReset: {
                upon: [{ msgType: "Reset" }, [myMessage]]
                // true: provided by inheriting class
            }
        }
    }   
};
