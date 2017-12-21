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

// %%classfile%%: "hierarchical_menu.js"
// %%classfile%%: "hierarchical_menu_item.js"

var classes = {
    /// An item is "picked" by clicking on it, which in turn defines it as
    /// highlighted
    SamplePickMenuItem: {
        children: {
            display: {
                description: {
                    context: {
                        picked: [{picked: _}, [embedding]],
                        highlight: [{picked: _}, [me]]
                    },
                    write: {
                        onClick: {
                            upon: [{type: "MouseUp", subType: o("Click", "DoubleClick")}, [myMessage]],
                            true: {
                                select: {
                                    to: [{pickedItems: _}, [myParams, "HierarchicalMenu"]],
                                    merge: [
                                        cond, [{picked: _}, [embedding]], o({
                                            on: true,
                                            use: [
                                                n([{value: _}, [embedding]]),
                                                [{pickedItems: _}, [myParams, "HierarchicalMenu"]]
                                            ]
                                        }, {
                                            on: false,
                                            use: push([{value: _}, [embedding]])
                                        })
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

var screenArea = {
    children: {
        menu1: {
            description: {
                "class": "HierarchicalMenu",
                context: {
                    items: [
                        {data: _},
                        [datatable, "./nuts-flat.json", {noIndexer: true}]
                    ],
                    textFilter: s([{"children.searchBox.value": _}, [embedding]])
                },
                display: {
                    background: "#F6F6F6"
                },
                "children.scrollView.description": {
                    "children.scrolledDocument.description": {
                        "children.itemsInView.description": {
                            "class": o("HMHierarchicalMenuItem1", "SamplePickMenuItem")
                        }
                    }
                },
                position: {
                    top: 30,
                    left: 10,
                    bottom: 10,
                    width: 220
                }
            }
        },
        menu2: {
            description: {
                "class": "HierarchicalMenu",
                context: {
                    items: [
                        {data: _},
                        [datatable, "./nuts-flat.json", {noIndexer: true}]
                    ],
                    textFilter: s([{"children.searchBox.value": _}, [embedding]]),
                    itemSize: 32,
                },
                display: {
                    background: "white"
                },
                "children.scrollView.description": {
                    "children.scrolledDocument.description": {
                        "children.itemsInView.description": {
                            "class": o("HMHierarchicalMenuItem2", "SamplePickMenuItem")
                        }
                    }
                },
                position: {
                    top: 30,
                    left: 250,
                    bottom: 10,
                    width: 220
                }
            }
        },
        menu3: {
            description: {
                "class": "HierarchicalMenu",
                context: {
                    items: [
                        {data: _},
                        [datatable, "./nuts-flat.json", {noIndexer: true}]
                    ],
                    textFilter: s([{"children.searchBox.value": _}, [embedding]]),
                    itemSize: 28,
                    pickedItems: [{"children.scrollView.children.scrolledDocument.children.itemsInView.position": o(-1, 1)}, [me]]
                },
                display: {
                    background: "white"
                },
                "children.scrollView.description": {
                    "children.scrolledDocument.description": {
                        "children.itemsInView.description": {
                            "class": "HMHierarchicalMenuItem3"
                        }
                    }
                },
                position: {
                    top: 30,
                    left: 490,
                    bottom: 10,
                    width: 270
                }
            }
        },
        searchBox: {
            description: {
                context: {
                    value: [{"children.input.param.input.value": _}, [me]]
                },
                children: {
                    input: {
                        description: {
                            display: {
                                borderBottomStyle: "solid",
                                borderBottomWidth: 1,
                                borderBottomColor: "darkgrey",
                                text: {
                                    value: "",
                                    textAlign: "left",
                                    input: {
                                        type: "text"
                                    }
                                }
                            },
                            position: {
                                top: 0,
                                left: 20,
                                bottom: 0,
                                right: 0
                            }
                        }
                    },
                    icon: {
                        description: {
                            display: {
                                text: {
                                    value: "🔍"
                                }
                            },
                            position: {
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 20
                            }
                        }
                    }
                },
                position: {
                    top: 5,
                    left: 10,
                    height: 20,
                    width: 220
                }
            }
        }
    }
};
