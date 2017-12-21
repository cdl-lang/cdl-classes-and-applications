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

// %%foreign%%: "googlemaps.foreign.js"
// %%foreign%%: "getGeoJSON.foreign.js"

var classes = {
    GeoFeature: {
        "class": o("HighlightUnderPointer", "WriteIdOnClick"),
        context: {
            featureData: [{param: {areaSetContent: _}}, [me]],
            geometry: [{featureData: {geometry: _}}, [me]],
            properties: [{featureData: {properties: _}}, [me]],
            name: [{properties: {NUTS_ID: _}}, [me]]
        },
        display: {
            borderWidth: 1,
            borderColor: "black",
            foreign: {
                value: [{featureData: _}, [me]]
            }
        }
    },

    HighlightUnderPointer: o({
        context: {
            underPointer: [{param: {pointerInArea: _}}, [me]]
        }
    }, {
        qualifier: {underPointer: true},
        display: {
            background: "blue",
            opacity: 0.4
        }
    }),

    WriteIdOnClick: {
        write: {
            onClick: {
                upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                true: {
                    doSomething: {
                        merge: [{name: _}, [me]]
                    }
                }
            }
        }
    }
};

var screenArea = {
    context: {
        viewLevel: [
            cond, [{zoom: _}, [{children: {googleMaps: {googleMaps: _}}}, [me]]], o(
                { on: r(-Infinity, 4), use: 0 },
                { on: r(5, 6), use: 1 },
                { on: r(7, 7), use: 2 },
                { on: null, use: 3 }
            )
        ],
        viewRect: [{bounds: _}, [{children: {googleMaps: {googleMaps: _}}}, [me]]],
        geoForLevel: [
            {properties: {STAT_LEVL_: [{viewLevel: _}, [me]]}},
            [
                {type: "FeatureCollection", features: _},
                [
                    [{getGeoJSON: _}, [foreignFunctions]],
                    "./NUTS_RG_10M_2013.json"
                ]
            ]
        ],
        visibleGeoForLevel: [
            {
                bbox: {
                    north: r([{viewRect: {south: _}}, [me]], 90),
                    south: r(-90, [{viewRect: {north: _}}, [me]]),
                    west: r(-180, [{viewRect: {east: _}}, [me]]),
                    east: r([{viewRect: {west: _}}, [me]], 180)
                }
            },
            [{geoForLevel: _}, [me]]
        ],
        "*selectedFeature": o()
    },
    children: {
        googleMaps: {
            description: {
                context: {
                    googleMaps: [
                            [{google: {maps: _}}, [foreignFunctions]],
                            {
                                zoom: 3,
                                center: { lat: 53, lng: 10 },
                                mapTypeId: 'roadmap'
                            }
                        ]
                },
                display: {
                    foreign: {
                        value: [{googleMaps: _}, [me]]
                    }
                },
                children: {
                    features: {
                        data: [identify, {properties: {NUTS_ID: _}},
                                [{visibleGeoForLevel: _}, [embedding]]],
                        description: {
                            "class": "GeoFeature",
                            "write.onClick.true.doSomething.to":
                                [{selectedFeature: _}, [embedding, [embedding]]]
                        }
                    }
                },
                position: {
                    top: 10,
                    left: 10,
                    width: 300,
                    height: 300
                }
            }
        },
        selectedFeature: {
            description: {
                display: {
                    text: {
                        fontFamily: "sans-serif",
                        textAlign: "left",
                        value: [{selectedFeature: _}, [embedding]]
                    }
                },
                position: {
                    top: 320,
                    left: 10,
                    height: 15,
                    width: 60
                }
            }
        }
    }
};
