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

// %%classfile%%: <zeroConfigDesignClasses.js>
initGlobalDefaults.zeroConfig = {
    itemUniqueIDThresholdFactor: 0.95
};

var classes = {
    ZCAppSchema: {
        context: {
            // note: dataSourceSize looks at the original data, excluding the UDFs, and independent of the effective base!
            dataSourceSize: [size, [{ myApp: { processedExternalItemDB: _ } }, [me]]],
            // maps output from datatable's attributes to facet data
            attributeToFacet: [
                defun,
                o("attr"),
                [using,
                    // using - start
                    "nrUnique",
                    [{ typeCount: { nrUnique: _ } }, "attr"],
                    "emptyFacet",
                    [equal,
                        [{ typeCount: { undefined: _ } }, "attr"],
                        [{ dataSourceSize: _ }, [me]]
                    ],
                    // using - end
                    {
                        name: [{ name: _ }, "attr"],
                        uniqueID: [{ name: _ }, "attr"],
                        emptyFacet: "emptyFacet",
                        type: [{ type: _ }, "attr"],
                        typeCount: [{ typeCount:_ }, "attr"],
                        facetType: [cond,
                            [
                                [{ name: _ }, "attr"],
                                o(
                                    [{ itemUniqueID: _ }, [me]],
                                    [{ displayedUniqueID: _ }, [me]]
                                )
                            ],
                            o(
                                {
                                    on: true,
                                    use: "ItemValues"
                                },
                                {
                                    on: false,
                                    use: [cond,
                                        [{ type: _ }, "attr"],
                                        o(
                                            {
                                                on: "number",
                                                use: "SliderFacet"
                                            },
                                            {
                                                on: "integer",
                                                use: [cond,
                                                    [and,
                                                        [r(1, fsAppConstants.maxNrUniqueNumberValuesForMS), "nrUnique"],
                                                        true
                                                        // for now, remove this condition, that requires that the < 5 values are equi-distanced.
                                                        // consequently, if we have fewer than five integers the facet is initialized to be an MSFacet (e.g. Term facet in ibi dataset)
                                                        /*[equal,
                                                            [plus, [minus, [{ max: _ }, "attr"], [{ min: _ }, "attr"]], 1],
                                                            "nrUnique"
                                                        ]*/
                                                    ],
                                                    o(
                                                        {
                                                            on: true,
                                                            use: "MSFacet"
                                                        },
                                                        {
                                                            on: null,
                                                            use: "SliderFacet"
                                                        }
                                                    )
                                                ]
                                            },
                                            {
                                                on: "currency",
                                                use: "SliderFacet"
                                            },
                                            {
                                                on: "date",
                                                use: "DateFacet"
                                            },
                                            {
                                                on: null,
                                                use: [cond,
                                                    [r(2, fsAppConstants.thresholdNrUniqueValuesForItemValuesFacet), "nrUnique"],
                                                    o(
                                                        { // if there are more than thresholdNrUniqueValuesForItemValuesFacet uniqueValues, then go for ItemValues.
                                                            on: false,
                                                            use: "ItemValues"
                                                        },
                                                        {
                                                            on: true,
                                                            use: "MSFacet"
                                                        }
                                                    )
                                                ]
                                            }
                                        )
                                    ],
                                    state: facetState.standard,
                                    numericFormat: {
                                        numberOfDigits: [cond, // default values! 
                                            [{ type: _ }, "attr"],
                                            o(
                                                { on: o("integer", "date"), use: 0 },
                                                { on: "number", use: 2 }
                                            )
                                        ]
                                    }
                                }
                            )
                        ]
                    }
                ]
            ],
            // The first facet is the first column, and will be frozen,
            // the rest is mapped to Slider, Item or MSFacet depending on
            // the contents, but facets with only undefined values or a
            // single value are removed.
            dataSourceCoreFacetData: [
                { emptyFacet: false }, // this context label is calculated by attributeToFacet.
                [map,
                    [{ attributeToFacet: _ }, [me]],
                    [
                        { type: n("undefined") },
                        [{ dataSourceDescription: _ }, [me]]
                    ]
                ]
            ]
        },
        display: {
            windowTitle: [{ name: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API:
    // 1. Assumes it is inherited before ZCApp!
    // 2. itemUniqueID
    // 3. displayedUniqueID
    // 4. loadedDataSourceTimestamp
    // 5. dataSourceFacetDataOrdering
    // 6. defaultFrozenFacetUniqueIDs (default provided: displayedUniqueID)
    // 7. defaultMovingFacetUniqueIDs
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreLoadedApp: o(
        { // default
            context: {
                allowDataSourceUploading: [arg, "openSesame", false],
                recordIdExcluded: true, // the system-generated recordID facet should *NOT* be the uniquely identifying facet. Inheriting class should provide that (see API)
                defaultFrozenFacetUniqueIDs: [{ displayedUniqueID: _ }, [me]],

                refreshData: [clickHandledBy,
                    [areaOfClass, "PreloadedDBRefreshDataControl"]
                ]
            },
            write: {
                whenNewDataSourceIsLoaded: {
                    upon: [changed, [{ loadedDataSourceTimestamp: _ }, [me]]],
                    true: {                        
                        // actions specified in variants below
                    }
                }                
            }
        },
        {
            qualifier: { allowDataSourceUploading: false },
            context: {
                showDataSourcePane: false // override default value in ZCApp.                
            }
        },
        {
            qualifier: {
                allowDataSourceUploading: false,
                externalDataSourcesAvailable: true
            },
            context: {
                "^loadedDataSourceTimestamp": [{ latestAvailableDataSourceTimestamp: _ }, [me]],
                "^lastTwoLoadedDataSourceTimestamps": o(),

                loadedDataSourceIsLatest: [equal,
                    [{ loadedDataSourceTimestamp: _ }, [me]],
                    [{ latestAvailableDataSourceTimestamp: _ }, [me]]
                ],

                previouslyLoadedDataSource: [pos, 1,
                    [{ lastTwoLoadedDataSourceTimestamps: _ }, [me]]
                ],

                currentlyLoadedDataSource: [pos, 0,
                    [{ lastTwoLoadedDataSourceTimestamps: _ }, [me]]
                ],

                loadedDataSourceID: [
                    // override default value in ZCApp
                    {
                        id: _,
                        metaData: { timestamp: [{ loadedDataSourceTimestamp: _ }, [me]] },
                    },
                    [databases]
                ],
                loadedDataSourceName: [
                    {
                        name: _,
                        id: [{ loadedDataSourceID: _ }, [me]]
                    },
                    [databases]
                ],
                dataSourceTimestamps: [sort,
                    [
                        { metaData: { timestamp: _ } },
                        [databases]
                    ],
                    "descending"
                ],

                latestAvailableDataSourceTimestamp: [first,
                    [{ dataSourceTimestamps: _ }, [me]]
                ]
            },
            write: {
                refreshData: {
                    upon: [{ refreshData: _ }, [me]],
                    true: {
                        // note that this means that next time the user opens the db (assuming there will be fresher data by then),
                        // she will NOT automatically be taken to the latest db, but rather see a Refresh Data control, which will allow her to 
                        // explicitly move to the latest db.
                        loadLatestAvailableDB: {
                            to: [{ loadedDataSourceTimestamp: _ }, [me]],
                            merge: [{ latestAvailableDataSourceTimestamp: _ }, [me]]
                        }
                    }
                },
                whenNewDataSourceIsLoaded: {
                    // upon: see default clause
                    true: {
                        // append new datasource in previouslyLoadedDataSources
                        appendDatasouceInPreviouslyLoadedDataSources: {
                            to: [{ lastTwoLoadedDataSourceTimestamps: _ }, [me]],
                            merge: o(
                                [{ loadedDataSourceTimestamp: _ }, [me]],
                                [pos,
                                    0,
                                    [
                                        n([{ loadedDataSourceTimestamp: _ }, [me]]),
                                        [{ lastTwoLoadedDataSourceTimestamps: _ }, [me]]
                                    ]
                                ]
                            )
                        }
                    }
                },
                whenLoadedDataSourceTimestampNotInDataSources: {
                    upon: [not,
                        [
                            [{ loadedDataSourceTimestamp: _ }, [me]],
                            [{ dataSourceTimestamps: _ }, [me]]
                        ]
                    ],
                    true: {
                        resetLoadedDataSourceTimestamp: {
                            to: [{ loadedDataSourceTimestamp: _ }, [me]],
                            merge: [{ latestAvailableDataSourceTimestamp: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                allowDataSourceUploading: false,
                externalDataSourcesAvailable: true,
                loadedDataSourceIsLatest: false
            },
            children: {
                refreshControl: {
                    description: {
                        "class": "PreloadedDBRefreshDataControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // The ZCApp (zero config app) merges its facet data with customFacetDescription
    // 
    // API:
    // 1. recordIdExcluded: boolean. Not defined and therefore: false, by default.
    // 2. allowDataSourceUploading: true, by default
    // 3. name: default provided (name of uploaded db)
    // 4. a dataConfig object with the following attributes:
    //    - facetObjects
    //    - facetOrdering
    //    - defaultNumFrozenFacets
    //    - excludedDataSourceFacetUniqueIDs (to do away with duplicate facets at the source, for example)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ZCApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inputData: [cond,
                    [{ loadedLocalFileHandle: _ }, [me]],
                    o(
                        { on: true, use: [{ data: _ }, [{ dataSourceConfigObj: _ }, [me]]] },
                        { on: false, use: [
                            database,
                            [{ loadedDataSourceID: _ }, [me]]
                        ] }
                    )
                ],
                dataError: o(
                    [{ dataSourceConfigError: _ }, [me]],
                    [{ dataSourceError: _ }, [me]]
                ),

                allowDataSourceUploading: true,
                dataSourceSelected: [and,
                    [{ loadedDataSourceObj: _ }, [me]],
                    [not, [{ dataError: _ }, [me]]]
                ],
                createLocalLoadFileDropSite: [{ coreCreateFileDropSite: _ }, [me]],
                createRemoteUploadFileDropSite: [and,
                    [{ coreCreateFileDropSite: _ }, [me]],
                    [{ appStateRemotingConnectionAlive: _ }, [me]]
                ],

                loadingApp: [{ appStateConnectionState: "connecting" }, [me]],
                // assuming we want to give the same UX indication for these different waiting windows the user will experience
                loading: [{ loadingApp: _ }, [me]],
                externalDataSourcesAvailable: [databases],

                userSpecifiedItemUniqueID: [{ itemUniqueID_AD: _ }, [me]]
            }
        },
        { // default
            "class": o("ZCAppSchema", "ModalDialogable"),
            context: {
                // see ExtOverlay for documentation of the itemUniqueID algorithm.
                facetDataSortedByNrUnique: [sort, // sort the first 10 - i.e. leftmost - facets by the number of unique values in them.
                    [pos,
                        r(0, 9),
                        [{ dataSourceDescription: _ }, [me]]
                    ],
                    { typeCount: { nrUnique: "descending" } }
                ],
                itemUniqueIDCoreCandidateFacets: [pos, // take the top five.
                    r(0, 4),
                    [{ facetDataSortedByNrUnique: _ }, [me]]
                ],
                itemUniqueIDCandidateThreshold: [floor,
                    [mul,
                        [{ dataSourceSize: _ }, [me]],
                        [{ zeroConfig: { itemUniqueIDThresholdFactor: _ } }, [globalDefaults]]
                    ]
                ],
                itemUniqueIDQualifiedCandidateFacets: [filter,
                    [defun,
                        "facetDataObj",
                        [greaterThanOrEqual,
                            [{ typeCount: { nrUnique: _ } }, "facetDataObj"],
                            [{ itemUniqueIDCandidateThreshold: _ }, [me]]
                        ]
                    ],
                    [{ itemUniqueIDCoreCandidateFacets: _ }, [me]]
                ],

                itemUniqueIDCandidateFacets: [cond,
                    [{ itemUniqueIDQualifiedCandidateFacets: _ }, [me]],
                    o(
                        { on: true, use: [{ itemUniqueIDQualifiedCandidateFacets: _ }, [me]] },
                        // if there are no qualified candidates, use the system-generated recordId facet.
                        { on: false, use: { uniqueID: "recordId", name: "recordId" } }
                    )
                ],

                // the defaultItemUniqueID, i.e. the id of the facet that is used to uniquely identify elements in an extensional overlay,
                // is the facet in the data that has the most uniqueIDs.
                defaultItemUniqueID: [first, [{ itemUniqueIDCandidateFacets: { uniqueID: _ } }, [me]]],
                "^itemUniqueID_AD": o(),
                itemUniqueID: [mergeWrite,
                    [{ itemUniqueID_AD: _ }, [me]],
                    [{ defaultItemUniqueID: _ }, [me]]
                ],

                loadedLocalFileHandle: o(
                    [{ loadedLocalFileObj: { fileHandle: _ } }, [me]],
                    [{ loadedDataSourceURL: _ }, [me]]
                ),
                name: [{ dataSourceObj: { name: _ } }, [me]],

                // note: this assumes the first (leftmost) frozen facet is the one displaying the unique attribute of the facet
                displayedUniqueID: [first, [{ expandedFrozenFacetUniqueIDs: _ }, [me]]],

                "*loadedLocalFileObj": [arg, "src", o()],
                "*localFileObjsOpenedInSession": o(), // store the file objects of all files selected in this *session* 
                "^loadedDataSourceID": [arg, "db", o()],
                "*nameOfLastDBUploaded": o(),
                lastDBUploaded: [{ name: [{ nameOfLastDBUploaded: _ }, [me]] }, [databases]],

                loadedDataSourceURL: [
                    cond, [arg, "dburl", o()], o({
                        on: true, use: [arg, "dburl", o()]
                    })
                ],

                loadedDataSourceObj: o(
                    [{ loadedLocalFileObj: _ }, [me]],
                    [{ loadedDataSourceID: _ }, [me]],
                    [{ loadedDataSourceURL: _ }, [me]]
                ),

                externalDataSource: [{ inputData: _ }, [me]],
                externalItemDB: [{ externalDataSource: _ }, [me]],
                dataSourceConfigObj: [datatable, [{ loadedLocalFileHandle: _ }, [me]]],
                dataSourceConfigError: ["error",
                    [{ dataSourceConfigObj: { state: _ } }, [me]]
                ],
                dataSourceObj: [
                    cond,
                    [{ loadedLocalFileHandle: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ dataSourceConfigObj: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [
                                { id: [{ loadedDataSourceID: _ }, [me]] },
                                [databases]
                            ]
                        }
                    )
                ],

                dataSourceError: [
                    "error",
                    [{ dataSourceObj: { state: _ } }, [me]]
                ],
                dataSourceDescription: [map,
                    [defun,
                        "obj",
                        [merge,
                            // create another attribute named 'uniqueID', which stores the value in the 'name' attribute
                            // this is a cdl hack, so that we can merge the objects created here with the objects
                            // that may be provided in a configuration file, in which the unique identifier is called 'uniqueID' 
                            {
                                uniqueID: [{ name: _ }, "obj"]
                            },
                            "obj"
                        ]
                    ],
                    [
                        n({ name: "recordId" }),
                        [{ dataSourceObj: { attributes: _ } }, [me]]
                    ]
                ],

                // for debug purposes, keeping this readily available and commented out here.
                //externalConfigName: "file:///C:/Users/User/Documents/Mondria/SVN/trunk/data/lendingClub.js",
                // [datasource] is decommissioned. such an object can now be defined in a class inheriting PreLoadedApp
                //dataConfig: [datasource, [{ externalConfigName: _ }, [me]]],                                                                                  

                defaultNumFrozenFacets: [definedOrDefault,
                    // if dataConfig, or this attribute in it are not defined, that's just fine.
                    [{ dataConfig: { defaultNumFrozenFacets: _ } }, [me]],
                    defaultNumFrozenFacets
                ],

                // the areaRef to the LocalFile being dragged needs to be accessible not only during the
                // drag operation itself, but also after the mouseUp, when the user sees the upload datasource modal dialog box!
                // so it is defined as non-persisted appData. note we do the same for draggedExternalDataSource, in case we add a dialog box to confirm
                // something like the deletion of a dataSource, etc.
                "*draggedOpenedLocalFileAD": o(),
                //"*draggedExternalDataSource": o(),

                draggedDataSource: o(
                    [{ draggedOpenedLocalFileAD: _ }, [me]],
                    [{ draggedExternalDataSource: _ }, [me]]
                ),

                coreCreateFileDropSite: [and,
                    [{ allowDataSourceUploading: _ }, [me]],
                    [not, [areaOfClass, "ModalDialog"]], // if there's a modal dialog open, the user should first close it
                    [{ fileDraggedOverMe: _ }, [me]]
                ],

                uploadedFileObj: [cond,
                    [{ draggedOpenedLocalFileAD: _ }, [me]],
                    o(
                        { on: true, use: [{ draggedOpenedLocalFileAD: { fileObj: _ } }, [me]] },
                        { on: false, use: [{ fileObjSelected: _ }, [areaOfClass, "ExternalDataSourceSelector"]] }
                    )
                ],

                customFacetDescription: [merge,
                    [identify, { uniqueID: _ }, [{ dataConfig: { facetObjects: _ } }, [me]]],
                    [identify, { uniqueID: _ }, [{ dataSourceCoreFacetData: _ }, [me]]] 
                ],
                facetOrdering: [ // retrieve from dataSource's facetOrdering only facets included in dataSourceCoreFacetData or customFacetDescription 
                    // (so as to clear out config typos, for example)
                    o(
                        [{ dataSourceCoreFacetData: { uniqueID: _ } }, [me]],
                        [{ customFacetDescription: { uniqueID: _ } }, [me]]
                    ),
                    [cond,
                        [{ dataConfig: { facetOrdering: _ } }, [me]],
                        o(
                            { on: true, use: [{ dataConfig: { facetOrdering: _ } }, [me]] },
                            { on: false, use: [{ customFacetDescription: { uniqueID: _ } }, [me]] }
                        )
                    ]
                ],
                mergedFacetData: [merge,
                    [identify,
                        { uniqueID: _ },
                        [map,
                            [defun,
                                "facetName",
                                { uniqueID: "facetName" }
                            ],
                            [{ facetOrdering: _ }, [me]]
                        ]
                    ],
                    [identify, { uniqueID: _ }, [{ customFacetDescription: _ }, [me]]],
                    [identify, { uniqueID: _ }, [{ dataSourceCoreFacetData: _ }, [me]]]
                ],

                dataSourceFacetData: [sort,
                    [
                        n({ uniqueID: [{ excludedDataSourceFacetUniqueIDs: _ }, [me]] }),
                        [{ mergedFacetData: _ }, [me]]
                    ],
                    { uniqueID: [{ dataSourceFacetDataOrdering: _ }, [me]] }
                ]
            },
            position: {
                frame: 0
            },
            children: {
                appFrame: {
                    description: {
                        "class": "ZCAppFrame" // an additional class added to appFrame, defined in FSApp
                    }
                }
            },
            write: {
                onZCAppCreateDataErrorDialog: {
                    upon: o(
                        [{ dataError: _ }, [me]],
                        [{ facetOrderingDuplicateValError: _ }, [me]],
                        [{ facetObjectsDuplicateValError: _ }, [me]]
                    ),
                    true: {
                        createModalDialog: {
                            to: [{ createModalDialog: _ }, [me]],
                            merge: true
                        },
                        clearLoadedLocalFileObj: {
                            to: [{ loadedLocalFileObj: _ }, [me]],
                            merge: o()
                        },
                        clearExternalDataSourceObj: {
                            to: [{ loadedDataSourceID: _ }, [me]],
                            merge: o()
                        },
                        clearFileObjsOpenedInSession: {
                            to: [
                                [{ loadedLocalFileObj: _ }, [me]],
                                [{ localFileObjsOpenedInSession: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                },
                onZCAppLoadedDataSourceChanged: {
                    upon: [changed, [{ loadedDataSourceObj: _ }, [me]]],
                    true: {
                        resetMatrixViews: { // scroll minimized facets and minimized overlays views back to top
                            to: [{ viewStaticPosOnDocCanvas: _ }, [areaOfClass, "MatrixView"]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { allowDataSourceUploading: true },
            write: {
                onZCAppLoadedDataSource: {
                    upon: [{ loadedDataSourceObj: _ }, [me]],
                    true: {
                        closeDataSourcePane: {
                            to: [{ showDataSourcePane: _ }, [me]],
                            merge: false
                        }
                    }
                },
                onZCAppChangedloadedLocalFileObj: {
                    upon: [and, // i.e. only if changed to some meaningful value, not if reset to o()
                        [changed, [{ loadedLocalFileObj: _ }, [me]]],
                        [{ loadedLocalFileObj: _ }, [me]]
                    ],
                    true: {
                        addToLocalFileObjsOpenedInSession: {
                            to: [{ localFileObjsOpenedInSession: _ }, [me]],
                            merge: o(
                                [{ localFileObjsOpenedInSession: _ }, [me]],
                                [{ loadedLocalFileObj: _ }, [me]]
                            )
                        },
                        clearExternalDataSourceObj: {
                            to: [{ loadedDataSourceID: _ }, [me]],
                            merge: o()
                        }
                    }
                },
                onZCAppChangedexternalDataSourceID: {
                    upon: [and, // i.e. only if changed to some meaningful value, not if reset to o()
                        [changed, [{ loadedDataSourceID: _ }, [me]]],
                        [{ loadedDataSourceID: _ }, [me]]
                    ],
                    true: {
                        clearLoadedLocalFileObj: {
                            to: [{ loadedLocalFileObj: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    partner: [areaOfClass, "ScreenArea"], // to override the default embedding in the App - this is itself the App,
                    // and the inheriting ModalDialog classes, assume this is an intersection area..
                    description: {
                        "class": "DataSourceLoadErrorDialog"
                    }
                }
            }
        },
        {
            qualifier: { dataSourceSelected: true },
            context: {
                "^showDataSourcePaneAD": o(), // see complementary qualifier for { dataSourceSelected: false } - there showDataSourcePane is defined functionally!
                showDataSourcePane: [mergeWrite,
                    [{ showDataSourcePaneAD: _ }, [me]],
                    false
                ],
                facetOrderingDuplicateValError: /* once #1311 is fixed, this can be rewritten as
                                                [repeatingValsInOS,
                                                 [{ dataConfig: { facetOrdering:_ } }, [me]], 
                                                 o()
                                                ]*/
                [_,
                    [
                        { val: _ },
                        [
                            n({ count: 1 }),
                            [countProjectedVals,
                                [{ dataConfig: { facetOrdering: _ } }, [me]],
                                o()
                            ]
                        ]
                    ]
                ],
                facetObjectsDuplicateValError: /* once #1311 is fixed, this can be rewritten as
                                               [repeatingValsInOS,
                                                [{ customFacetDescription:_ }, [me]],
                                                "uniqueID"
                                               ]*/
                [_,
                    [
                        { val: _ },
                        [
                            n({ count: 1 }),
                            [countProjectedVals,
                                [{ customFacetDescription: _ }, [me]],
                                "uniqueID"
                            ]
                        ]
                    ]
                ]
            }
        },
        {
            qualifier: { dataSourceSelected: false },
            context: {
                showDataSourcePane: true
            }
        },
        {
            qualifier: { createLocalLoadFileDropSite: true },
            context: {
                dropLocalFile: [{ children: { dropLocalFile: _ } }, [me]],
                dropLocalFileHotspot: [{ dropLocalFile: { children: { hotspot: _ } } }, [me]]
            },
            children: {
                dropLocalFile: {
                    description: {
                        "class": "DataSourceLocalLoadFileDrop"
                    }
                }
            }
        },
        {
            qualifier: { createRemoteUploadFileDropSite: true },
            context: {
                dropExternalDataSource: [{ children: { dropExternalDataSource: _ } }, [me]],
                dropExternalDataSourceHotspot: [{ dropExternalDataSource: { children: { hotspot: _ } } }, [me]]
            },
            children: {
                dropExternalDataSource: {
                    description: {
                        "class": "DataSourceRemoteUploadFileDrop"
                    }
                }
            }
        },
        {
            qualifier: { loading: true },
            children: {
                loadingScreen: {
                    description: {
                        "class": "LoadingScreen"
                    }
                }
            }
        },
        {
            qualifier: { userSpecifiedItemUniqueID: true },
            context: {
                defaultFrozenFacetUniqueIDs: [{ itemUniqueID: _ }, [me]], // override the definition FSApp.                
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    LeanZCApp: {
        "class": o("ZCApp", "LeanFSApp")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    FatZCApp: {
        "class": o("ZCApp", "FatFSApp")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackDataSourceApp: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofZCApp: [
                    "ZCApp",
                    [classOfArea, [{ myApp: _ }, [me]]]
                ],
                ofPreloadedApp: ["PreLoadedApp", [classOfArea, [{ myApp: _ }, [me]]]],
                allowDataSourceUploading: [{ myApp: { allowDataSourceUploading: _ } }, [me]],
                showDataSourcePane: [{ myApp: { showDataSourcePane: _ } }, [me]],
                localFileObjsOpenedInSession: [{ myApp: { localFileObjsOpenedInSession: _ } }, [me]],
                loadedLocalFileObj: [{ myApp: { loadedLocalFileObj: _ } }, [me]],
                loadedLocalFileHandle: [{ myApp: { loadedLocalFileHandle: _ } }, [me]],
                loadedDataSourceID: [{ myApp: { loadedDataSourceID: _ } }, [me]],

                dataError: [{ myApp: { dataError: _ } }, [me]],

                fileDraggedOverApp: [{ myApp: { fileDraggedOverMe: _ } }, [me]],
                draggedOpenedLocalFileAD: [{ myApp: { draggedOpenedLocalFileAD: _ } }, [me]],
                //draggedExternalDataSource: [{ myApp: { draggedExternalDataSource:_ } }, [me]],
                draggedDataSource: [{ myApp: { draggedDataSource: _ } }, [me]],

                uploadedFileObj: [{ myApp: { uploadedFileObj: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackDataSourceSelected")
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API:
    // 1. assumes it is inherited by area that inherits AppFrame
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ZCAppFrame: o(
        { // default    
            "class": o("GeneralArea", "TrackDataSourceApp"),
            children: {
                dataSourceSelectorsContainer: {
                    description: {
                        "class": "DataSourceSelectorsContainer"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of PreloadedDBControls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBControls: {
        "class": o("GeneralArea", "MinWrap"),
        context: {
            minWrapAround: 0,
            myEffectiveBaseName: [
                [areaOfClass, "EffectiveBaseName"],
                [embedded, [embedding]]
            ],
        },
        children: {
            /*preloadedDBIcon: {
                description: {
                    "class": "PreloadedDBIcon"
                }
            },*/
            preloadedDBControlsDropDownMenuable: {
                description: {
                    "class": "PreloadedDBControlsDropDownMenuable"
                }
            }
        },
        position: {
            horizontalPositionOfDBControls: {
                point1: { type: "left" },
                point2: { element: [areaOfClass, "EffectiveBaseName"], type: "left" },
                equals: 0
            },
            verticalPositionOfDBControls: {
                point1: { element: [{ myEffectiveBaseName: _ }, [me]], type: "bottom" },
                point2: { type: "top" },
                equals: 2
            },
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBIcon: {
        "class": o("PreloadedDBIconDesign"), //,"GeneralArea", "AboveSiblings"
        position: {
            width: 15,
            height: 15,
            left: 0,
            "vertical-center": 0,
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBControlsDropDownMenuable: o(
        {
            "class": o("PreloadedDBControlsDropDownMenuableDesign", "GeneralArea", "DropDownMenuable"), //"DisplayDimension", 
            context: {
                //DropDownMenuable API:
                showBorder: false,
                defineShowControlBackgroundColor: false,
                dropDownMenuTextForNoSelection: [concatStr,
                    o(
                        [{ myApp: { selectStr: _ } }, [me]],
                        [{ myApp: { aStr: _ } }, [me]],
                        [{ myApp: { dataSourceEntityStr: _ } }, [me]]
                    ),
                    " "
                ],
                dropDownMenuLogicalSelectionsOS: [{ myApp: { dataSourceTimestamps: _ } }, [me]],
                dropDownMenuLogicalSelection: [{ myApp: { loadedDataSourceTimestamp: _ } }, [me]],

                dropDownMenuCoreDisplaySelectionsOS: [map,
                    [defun,
                        "timestamp",
                        [numToDate, "timestamp", [{ myApp: { defaultDateFormat:_ } }, [me]]]
                    ],
                    [{ dropDownMenuLogicalSelectionsOS: _ }, [me]]
                ],

                osForDropDownMenuDisplaySelection: [{ dropDownMenuCoreDisplaySelectionsOS: _ }, [me]], // override DropDownMenuable default value, to omit '(Current)'
                displayDropDownShowControl: [greaterThan, [size, [{ dropDownMenuLogicalSelectionsOS: _ }, [me]]], 1],

                dropDownMenuDisplaySelectionsOS: [map,
                    [defun,
                        "timestamp",
                        [concatStr,
                            o(
                                [numToDate, "timestamp", [{ myApp: { defaultDateFormat:_ } }, [me]]],
                                [cond, // add '(previous)' or '(current)' to the name of the relevant databases.
                                    "timestamp",
                                    o(
                                        {
                                            on: [{ myApp: { previouslyLoadedDataSource: _ } }, [me]],
                                            use: [putInParentheses, [{ myApp: { previousStr: _ } }, [me]]]
                                        },
                                        {
                                            on: [{ myApp: { currentlyLoadedDataSource: _ } }, [me]],
                                            use: [putInParentheses, [{ myApp: { currentStr: _ } }, [me]]]
                                        }
                                    )
                                ]
                            ),
                            " "
                        ]
                    ],
                    [{ dropDownMenuLogicalSelectionsOS: _ }, [me]]
                ],
                //end of DropDownMenuable API                
                myShowControl: [{ children: { dropDownMenuShowControl: _ } }, [me]],
            },
            position: {
                height: [displayHeight],
                // we need to make space for both the text and the triangle
                width: [plus,
                    [displayWidth],
                    [cond,
                        [{ myShowControl: { width: _ } }, [me]],
                        o( // as [plus] of [x, o()] returns o()...
                            { on: true, use: [{ myShowControl: { width: _ } }, [me]] },
                            { on: false, use: 0 } // in case we decide not to display myShowControl (see displayDropDownShowControl above)
                        )
                    ]
                ],
                left: 0,
                bottom: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceDropDownBottomMargin: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: {
                displayMenuSelection: true,
                dropDownMenuLogicalSelection: true
            },
            context: {
                displayText: [{ dropDownMenuDisplaySelection: _ }, [me]]
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            context: {
                displayDropDownMenuSearchBox: false
            },
            children: {
                menu: {
                    // defined in DropDownMenuable without description
                    description: {
                        "class": "PreloadedDBControlsDropDownMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBControlsDropDownMenu: {
        "class": o("PreloadedDBControlsDropDownMenuDesign", "RightSideScrollbarDropDownMenu", "MinWrapHorizontal"),
        context: {
            defaultDropDownMenuPositioningRight: false // override default
        },
        children: {
            dropDownMenuList: {
                description: {
                    "class": "MinWrapHorizontal",
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "PreloadedDBControlsMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBControlsMenuLine: {
        "class": o("PreloadedDBControlsMenuLineDesign", "GeneralArea", "DropDownMenuLine"),
        context: {
            name: [{ param: { areaSetContent: _ } }, [me]],
            displayText: [{ name: _ }, [me]]
        },
        position: {
            minContentWidth: {
                point1: { type: "left", content: true },
                point2: { type: "right", content: true },
                min: [displayWidth]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    PreloadedDBRefreshDataControl: {
        "class": o("PreloadedDBRefreshDataControlDesign", "GeneralArea", "AppControl"),
        context: {
            displayText: [{ myApp: { refreshDataStr: _ } }, [me]],

            tooltipable: false, // override AppControl value
            defaultWidth: false,
            defaultHeight: false
        },
        position: {
            height: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlHeight: _ } }, [globalDefaults]]],
            width: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlWidth: _ } }, [globalDefaults]]],
            attachToDBDropDownVertically: {
                point1: {
                    element: [areaOfClass, "PreloadedDBControlsDropDownMenuable"],
                    type: "vertical-center"
                },
                point2: {
                    type: "vertical-center"
                },
                equals: 0
            },
            attachToDBDropDownHorizontally: {
                point1: {
                    element: [areaOfClass, "PreloadedDBControlsDropDownMenuable"],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceDropDownMarginFromRefreshButton: _ } }, [globalDefaults]]]
            }
        },
        children: {
            icon: {
                description: {
                    "class": o("PreloadedDBRefreshDataControlIconDesign", "GeneralArea"),
                    position: {
                        "vertical-center": 0,
                        left: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlIconMargin: _ } }, [globalDefaults]]],
                        width: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlIconDimension: _ } }, [globalDefaults]]],
                        height: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlIconDimension: _ } }, [globalDefaults]]],
                        attachRightToText: {
                            point1: { type: "right" },
                            point2: { element: [{ children: { text: _ } }, [embedding]], type: "left" },
                            equals: [densityChoice, [{ bFSAppDataSourcePosConst: { dataSourceRefreshControlIconMargin: _ } }, [globalDefaults]]]
                        }
                    }
                }
            },
            text: {
                description: {
                    "class": o("PreloadedDBRefreshDataControlTextDesign", "GeneralArea", "DisplayDimension"),
                    context: {
                        displayText: [{ myApp: { refreshDataStr: _ } }, [me]]
                    },
                    position: {
                        // dimensions: DisplayDimension
                        // left side: see sibling class, icon, above.
                        "vertical-center": 0
                    }
                }
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of PreloadedDBControls
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

};
