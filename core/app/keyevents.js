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
    Disp: {
        context: {
            "^lastEvent": o()
        },
        display: {
            text: {
                fontFamily: "sans-serif",
                fontSize: 11,
                value: [debugNodeToStr, [{lastEvent: _}, [me]]]
            }
        },
        write: {
            onClick: {
                upon: [{type: [{eventType: _}, [me]], recipient: "start"}, [message]],
                true: {
                    continuePropagation: false,
                    doWrite: {
                        to: [{lastEvent: _}, [me]],
                        merge: [message]
                    }
                }
            }
        }

    }
};

var screenArea = {
    children: {
        keydown: {
            description: {
                "class": "Disp",
                context: {
                    eventType: "KeyDown"
                },
                position: {
                    top: 10,
                    left: 10,
                    height: 30,
                    width: 500
                }
            }
        },
        keypress: {
            description: {
                "class": "Disp",
                context: {
                    eventType: "KeyPress"
                },
                position: {
                    top: 50,
                    left: 10,
                    height: 30,
                    width: 500
                }
            }
        },
        keyup: {
            description: {
                "class": "Disp",
                context: {
                    eventType: "KeyUp"
                },
                position: {
                    top: 90,
                    left: 10,
                    height: 30,
                    width: 500
                }
            }
        }
    }
};
