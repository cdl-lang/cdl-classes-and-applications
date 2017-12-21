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

// %%classfile%%: "../25_Datathon2/misc.js"
// %%classfile%%: "upload.js"

var classes = {

    Databases: {
        context: {
            metadata: [databases]
        }
    },

    AppContext: {
        "class": "Databases",
        context: {
            fileDrag: [{param: {dragInArea: _}}, [embedding]]
        }
    },

    App: o({
        "class": o("AppContext", "Uploader"),
        children: {
            header: {
                description: {
                    display: {
                        background: "#4490ff",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 18,
                            fontWeight: 100,
                            color: "white",
                            value: "Databases"
                        }
                    },
                    position: {
                        top: 16,
                        left: 16,
                        height: 24,
                        width: 400
                    }
                }
            },
            dblist: {
                description: {
                    "class": "BasicListInAreaWithScrollbar",
                    display: {
                        borderStyle: "solid",
                        borderColor: "#4490ff",
                        borderWidth: 1
                    },
                    context: {
                        listData: [identify, {id: _}, [{metadata: _}, [myContext, "App"]]],
                        addPixelsToDocumentSize: -1 /// final bottom border
                    },
                    "children.items.description":{
                        "class": o(
                            "DataBaseItem",
                            "GuaranteeImmediateVisibility"
                        ),
                        context: {
                            immediateVisibilityWrtElement: [embedding]
                        }
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "header" },
                        left: 16,
                        width: 400
                    }
                }
            },
            uploadButton: {
                description: {
                    "class": "UploadFileButton",
                    display: {
                        background: "#4490ff",
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        paddingLeft: 16,
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 18,
                            fontWeight: 700,
                            color: "white",
                            textAlign: "left",
                            textDecoration: "underline",
                            value: "UPLOAD"
                        }
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "dblist" },
                        bottom: 16,
                        left: 16,
                        height: 48,
                        width: 400
                    }
                }
            }
        }
    },{
        qualifier: {fileDrag: true},
        children: {
            dropArea: {
                description: {
                    "class": "UploadFileReceiver",
                    display: {
                        background: "black",
                        opacity: [cond, [{param: {dragInArea: _}}, [me]], o(
                            {on: false, use: 0.4},
                            {on: true, use: 0.6}
                        )],
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 36,
                            fontWeight: 700,
                            color: "white",
                            value: "DROP HERE TO UPLOAD"
                        }
                    },
                    position: {
                        top: 16,
                        left: 16,
                        bottom: 16,
                        width: 400
                    },
                    stacking: {
                        higherThanSiblings: {
                            lower: [embedding],
                            higher: [me]
                        }
                    }
                }
            }
        }
    }),

    DataBaseItemContext: {
        context: {
            data: [{param: {areaSetContent: _}}, [me]],
            id: [{param: {areaSetAttr: _}}, [me]],
            name: [{data: {name: _}}, [me]],
            timestamp: [{data: {metaData: {timestamp: _}}}, [me]],
            fileSize: [{data: {fileSize: _}}, [me]],
            nrRecords: [{data: {nrRecords: _}}, [me]],
            uploadState: [{data: {uploadProgress: {state: _}}}, [me]],
            uploadProgress: [{data: {uploadProgress: {dataTransferred: _}}}, [me]]
        }
    },

    DataBaseItem: o({
        "class": "DataBaseItemContext",
        display: {
            borderStyle: "solid",
            borderColor: "lightgrey",
            borderBottomWidth: 1,
            background: {
                linearGradient: {
                    start: "to bottom",
                    stops: o(
                        { color: "#f4f4f4" },
                        { color: "white", length: 40 }
                    )
                }
            }
        },
        children: {
            decorativeThingy: {
                description: {
                    display: {
                        borderRadius: 4,
                        background: "#404040"
                    },
                    position: {
                        left: 16,
                        top: 16,
                        width: 8,
                        height: 8
                    }
                }
            },
            name: {
                description: {
                    "class": "TextValueInput",
                    context: {
                        value: [{name: _}, [myContext, "DataBaseItem"]],
                        type: "text"
                    },
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 16,
                            fontWeight: 300,
                            textAlign: "left",
                            value: [{value: _}, [me]]
                        }
                    },
                    position: {
                        left: 40,
                        top: 8,
                        height: 24,
                        right: 16
                    }
                }
            }
        },
        position: {
            height: 64
        }
    }, {
        qualifier: {uploadState: false},
        children: {
            date: {
                description: {
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 16,
                            fontWeight: 300,
                            textAlign: "left",
                            color: "lightgrey",
                            value: [{timestamp: _}, [myContext, "DataBaseItem"]],
                            dateFormat: {
                                type: "intl"
                            }
                        }
                    },
                    position: {
                        left: 40,
                        top: 32,
                        height: 24,
                        width: [displayWidth]
                    }
                }
            },
            fileSize: {
                description: {
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 16,
                            fontWeight: 300,
                            textAlign: "left",
                            color: "lightgrey",
                            value: [suffixize, [{fileSize: _}, [myContext, "DataBaseItem"]], "B"]
                        }
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "date", distance: 16},
                        top: 32,
                        height: 24,
                        width: [displayWidth]
                    }
                }
            },
            nrRecords: {
                description: {
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 16,
                            fontWeight: 300,
                            textAlign: "left",
                            color: "lightgrey",
                            value: [suffixize, [{nrRecords: _}, [myContext, "DataBaseItem"]], " entries"]
                        }
                    },
                    position: {
                        "class": {name: "RightOfSibling", sibling: "fileSize", distance: 16},
                        top: 32,
                        height: 24,
                        width: [displayWidth]
                    }
                }
            },
            delete: {
                description: {
                    "class": "DepressWhileMouseDown",
                    display: {
                        text: {
                            fontFamily: "Roboto",
                            fontSize: 11,
                            value: "╳"
                        }
                    },
                    position: {
                        top: 0,
                        right: 0,
                        width: 16,
                        height: 16
                    },
                    write: {
                        onClick: {
                            upon: myClick,
                            true: {
                                deleteDatabase: {
                                    to: [{id: [{id: _}, [embedding]]}, [databases]],
                                    merge: {remove: true}
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
        qualifier: {uploadState: true},
        children: {
            uploadProgress: {
                description: {
                    children: {
                        progressBar: {
                            description: {
                                display: {
                                    background: "lightgrey"
                                },
                                position: {
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: {
                                        pair1: {
                                            point1: {type: "left", element: [embedding]},
                                            point2: {type: "right", element: [embedding]}
                                        },
                                        pair2: {
                                            point1: {type: "left"},
                                            point2: {type: "right"}
                                        },
                                        ratio: [{uploadProgress: _}, [myContext, "DataBaseItem"]]
                                    }
                                }
                            }
                        },
                        label: {
                            description: {
                                display: {
                                    text: {
                                        fontFamily: "Roboto",
                                        fontSize: 16,
                                        fontWeight: 300,
                                        color: "grey",
                                        value: [cond, [{uploadProgress: _}, [myContext, "DataBaseItem"]], o(
                                            {on: 1, use: "FINALIZING"},
                                            {on: null, use: "UPLOADING"}
                                        )]
                                    }
                                },
                                position: {
                                    frame: 0
                                }
                            }
                        }
                    },
                    position: {
                        left: 40,
                        top: 32,
                        height: 24,
                        right: 24
                    }
                }
            }
        }
    })
};

var screenArea = {
    children: {
        app: {
            description: {
                "class": "App",
                position: {
                    frame: 0
                }
            }
        }
    }
};
