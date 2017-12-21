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
    ScreenArea: {
    },
    WaterDistribtionManger: {
        context: {
            bucketHeight: [offset,
                {
                    label: "topBucketFrame"
                },
                {
                    label: "bottomBucketFrame"
                }
            ],
            howManyDropsinBucket: [div,
                [{ bucketHeight: _ }, [me]],
                [{ dropletDim: _ }, [areaOfClass, "ScreenArea"]]
            ],
            roundDropinBucket: [floor,
                [{ howManyDropsinBucket: _ }, [me]]
            ],
            droptoBucketDiv: [div,
                [{ globalWaterCounter: _ }, [me]],
                [{ roundDropinBucket: _ }, [me]]
            ],
            fullBucketCounter: [floor,
                [{ droptoBucketDiv: _ }, [me]]
            ],
            dropsInFullBuckets: [mul,
                [{ fullBucketCounter: _ }, [me]],
                [{ roundDropinBucket: _ }, [me]]
            ],
            waterSpare: [minus,
                [{ globalWaterCounter: _ }, [me]],
                [{ dropsInFullBuckets: _ }, [me]]
            ],
            dropletSpare: [ceil,
                [{ waterSpare: _ }, [me]]
            ]
        }
    },
    FullBucket: {
        "class": "DropletFormat",
        position: {
            rightFromPrev: {
                point1: {
                    type: "right",
                    element: [prev],
                },
                point2: {
                    type: "left"
                },
                equals: [{ DistanceBetweenBuckets: _ }, [areaOfClass, "ScreenArea"]]
            }
        }
    },
    PartillyFullBucket: o(
        {
            context: {
                noFullBuckets: [equal, [{ fullBucketCounter: _ }, [embedding]], 0],
                anyDropletsYet: [greaterThanOrEqual, [{ waterSpare: _ }, [embedding]], 1]
            }
        },
        {
            qualifier: { noFullBuckets: false },
            position: {
                rightFromFullBuckts: {
                    point1: {
                        type: "right",
                        element: [last,
                            [
                                { children: { fullBuckets: _ } },  
                                [embedding]                        
                            ]
                        ]
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ DistanceBetweenBuckets: _ }, [areaOfClass, "ScreenArea"]]
                }
            }
        },
        {
            qualifier: { noFullBuckets: true },
            position: {
                rightFromPlayground: {
                    point1: {
                        type: "left", element: [embedding]
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ DistanceBetweenBuckets: _ }, [areaOfClass, "ScreenArea"]]
                }
            }
        },
        {
            qualifier: { anyDropletsYet: true },
                "class": "DropletFormat"
        }
    ),
    BucketFormat: {
        position: {
            width: [{ bucketWidth: _ }, [areaOfClass, "ScreenArea"]],
            bottomOfBucket: {
                point1: {
                    type: "bottom",
                    element: [me]
                },
                point2: {
                    label: "bottomBucketFrame",
                    element: [embedding]
                },
                equals: -10
            },
            topOfBucket: {
                point1: {
                    type: "top",
                    element: [me]
                },
                point2: {
                    label: "topBucketFrame",
                    element: [embedding]
                },
                equals: 10
            },
            bottomOfFirstChild: {
                point1: {
                    label: "bottomBucketFrame",
                    element: [areaOfClass, "WaterDistribtionManger"]
                },
                point2: {
                    type: "bottom",
                    element: [first, [{ children: { dropletToWaterLevel: _ } }, [me]]]
                },
                equals: 0
            }
        },
        context: {
            waterLevelMark: [sequence, r(1, [{ dropletNum: _ }, [me]])]
        },
        display: {
            background: "white"
        }
    },
    DropletFormat: {
        children: {
            dropletToWaterLevel: {
                data: [{ waterLevelMark: _ }, [me]],
                description: {
                    position: {
                        width: [{ dropletDim: _ }, [areaOfClass, "ScreenArea"]],
                        height: [{ dropletDim: _ }, [areaOfClass, "ScreenArea"]],
                        upFromPrev: {
                            point2: {
                                type: "bottom"
                            },
                            point1: {
                                type: "top",
                                element: [prev],
                            },
                            equals: 0
                        }
                    },
                    display: {
                        background: "blue"
                    }
                }
            }
        }
    },
    ClicktoWaterBank: o(
        {
            context: {
                "^rainfallCounter": 0
            }
        },
        {
            write: {
                Clicker: {
                    upon: [{ subType: "Click" }, [myMessage]],
                    true: {
                        beginEdit: {
                            to: [{ rainfallCounter: _ }, [me]],
                            merge: [plus, [{ rainfallCounter: _ }, [me]], 1]
                        }
                    }
                }
            }
        }
    )
};
var screenArea = {
    "class": "ScreenArea",
    display: {
        background: "#bbbbbb"
    },
    context: {
        dropletDim: 30,
        bucketWidth: 40,
        DistanceBetweenBuckets: 10

    },
    children: {
        playGround: {
            description: {
                "class": o("WaterDistribtionManger"),
                context: {
                    fullBucketsNum: [sequence,
                        r(1, [{ fullBucketCounter: _ }, [me]])],
                    globalWaterCounter: [{ children: { rainfallClicker: { rainfallCounter: _ } } }, [me]]
                },
                position: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                    bottomOfBucketLabel: {
                        point1: { label: "bottomBucketFrame" },
                        point2: {
                            type: "bottom",
                        },
                        equals: 0
                    },
                    topOfChildren: {
                        point1: {
                            type: "top",
                        },
                        point2: { label: "topBucketFrame" },
                        equals: 0
                    },
                    firstFullBucket: {
                        point1: {
                            type: "left"
                        },
                        point2: {
                            type: "left",
                            element: [first,
                                [{ children: { fullBuckets: _ } },
                                [me]]
                            ]
                        },
                        equals: [{ DistanceBetweenBuckets: _ }, [areaOfClass, "ScreenArea"]]
                    }
                },
                display: {
                    background: "gray"
                },
                children: {
                    rainfallClicker: {
                        description: {
                            "class": o("ClicktoWaterBank"),
                            display: {
                                background: "pink",
                                text: {
                                    value: [{ rainfallCounter: _ }, [me]]
                                }
                            },
                            position: {
                                right: 50,
                                bottom: 50,
                                width: 50,
                                height: 50
                            }
                        }
                    },
                   fullBuckets: {
                        data: [cond,
                            [equal, [{ fullBucketCounter: _ }, [me]], 0],
                            o(
                                {
                                    on: true, use:
                                    o()
                                },
                                {
                                    on: false, use:
                                    [{ fullBucketsNum: _ }, [me]],
                                }
                            )
                        ],
                        description: {
                            "class": o("BucketFormat", "FullBucket"),
                            context: {
                                dropletNum: [{ roundDropinBucket: _ }, [embedding]],
                            }
                        }
                    }, 
                    fillingBucket: {
                        description: {
                            "class": o("BucketFormat", "PartillyFullBucket"),
                            context: {
                                dropletNum: [{ dropletSpare: _ }, [embedding]]
                            },
                        }
                    }
                }
            }
        }
    }
};