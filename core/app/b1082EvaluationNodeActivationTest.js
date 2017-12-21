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
    SliderFacet: {
    },
    MayBeSliderFacet: o(
        {
            context: {
                "^state": [{iv:_}, [me]],
                myHeight: [offset, { type: "top" }, {type: "bottom" }],
                "^x": true,
                "^y1":  [offset, { type: "top" }, {type: "bottom" }],
                y: [or, [{x: false}, [me]], [greaterThan, [{y1:_}, [me]], 10]],
                z: [
                    lessThan,
                    [offset, { label: "xtop" }, {type: "bottom" }],
                    50
                ]
            },
            write: {
                w1: {                
                    upon: [{type: "MouseDown"}, [myMessage]],
                    true: {
                        a1: {
                            to: [{x:_}, [me]],
                            merge: [not, [{x: _}, [me]]]
                        },
                        a2: {
                            to: [{y1:_}, [me]],
                            merge: [plus, [{y1:_}, [me]], 1]
                        }
                    }
                }
            }
        },
        {
            qualifier: { myState: 9 },
            position: {
                xxx: {
                    point1: { type: "top" },
                    point2: { type: "bottom" },
                    max: 3000000
                }
            }
        },
        {
            qualifier: { y: true },
            "class": "SliderFacet"
        },
        {
            qualifier: { x: true },
            context: {

                // raise the scheduling step for context.state's init. exp.
                iv: [plus, [{iv1:_}, [me]], 2],
                iv1: [plus,
                      [offset, { type: "left" }, {type: "right" }],
                      [{iv2:_}, [me]]],
                iv2: [plus,
                      [offset, { label: "l1" }, { label: "l2"}],
                      [{iv3: _}, [me]]],
                iv3: [plus,
                      [offset, { label: "l2" }, { label: "l3"}],
                      [{iv4: _}, [me]]],
                iv4: [plus,
                      [offset, { label: "l3" }, { label: "l4"}],
                      [{iv5: _}, [me]]],
                iv5: [plus,
                      [offset, { label: "l4" }, { label: "l5"}],
                      [{iv6: _}, [me]]],
                iv6: [offset, { label: "l5" }, { label: "l6"}]
            }
        },

        // defer the reference to context.state to the third qualifier in the
        //  variant, so that it doesn't say 'constat: true' when it hits
        //  'activate', as it has already added a qualifier
        {
            qualifier: { z: 4 },
            context: {
                myState: 6
            }
        },
        {
            qualifier: { z: true },
            context: {
                myState: 8
            }
        },
        {
            qualifier: { z: false },
            context: {
                myState: [{state:_}, [me]]
            }
        }
    )
};

var screenArea = {
    "class": "ScreenArea",
    context: {
        "^facetData": o()
    },
    write: {
        w1: {
            upon: [{type: "MouseDown"}, [myMessage]],
            true: {
                x: {
                    to : [{facetData:_}, [me]],
                    merge: "hey"
                }
            }
        }
    },
    position: {
        x1: {
            point1: {
                type: "left"
            },
            point2: {
                type: "right"
            },
            min: [div, [{ myState:_}, [areaOfClass, "SliderFacet"]], 500]
     
        }
    },
    children: {
        facets: {
            data: [{facetData:_}, [me]],
            description: {
                "class": "MayBeSliderFacet",
                position: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                display: {
                    text: {
                        value: "a facet"
                    }
                }
            }
        }
    }
};
