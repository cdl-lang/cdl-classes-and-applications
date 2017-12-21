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

    /// Default font for all areas
    Font: {
        fontFamily: '%%font:("Open Sans",https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700)%%,Arial,Sans-Serif'
    },

    AnimateTopLeft: {
        transitions: {
            top: 0.5,
            left: 0.5
        }
    },

    AnimateArea: {
        transitions: {
            top: 0.5,
            left: 0.5,
            height: 0.5,
            width: 0.5
        }
    },

    MenuText: o({
        "class": "Font",
        textAlign: "left",
        color: [{primaryTextColor: _}, [globalDefaults]],
        fontWeight: [{sliceEditor: {menuItemFontWeight: _}}, [globalDefaults]],
        fontSize: [{sliceEditor: {menuItemFontSize: _}}, [globalDefaults]]
    }, {
        qualifier: {fixedHeight: true},
        fontWeight: [{sliceEditor: {menuItemFontWeightSmaller: _}}, [globalDefaults]],
        fontSize: [{sliceEditor: {menuItemFontSizeSmaller: _}}, [globalDefaults]]
    }),

    Badge: o({
        context: {
            value: mustBeDefined,
            align: "left"
        },
        children: {
            counter: {
                description: {
                    display: {
                        background: "lightgrey",
                        borderRadius: 8,
                        text: {
                            "class": "Font",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "white",
                            value: [{value: _}, [embedding]]
                        }
                    },
                    position: {
                        left: 0,
                        width: [plus, [displayWidth], 8],
                        height: 16,
                        "vertical-center": 0
                    }
                }
            }
        }
    }, {
        qualifier: {align: "left"},
        "children.counter.description": {
            position: {
                left: 0
            }
        }
    }, {
        qualifier: {align: "right"},
        "children.counter.description": {
            position: {
                right: 0
            }
        }
    })
};
