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

/* This file defines the application by combining logic and presentation
   classes. Logic and presentation properties specific to the application should
   be defined here.
*/

// %%classfile%%: "logic.js"
// %%classfile%%: "presentation.js"
// %%classfile%%: "misc.js"

var classes = {

    /// Main application class
    /// Connects menus, queries and result display
    App: o({
        "class": o("ApplicationDataContext", "SliceDefinition"),

        context: {
            /// Defines the data source as a local file when the URL argument
            /// localData is true, and as some, not yet implemented, foreign
            /// data source when it isn't.
            mainDataSource: [
                cond, [arg, "localData", false], o({
                    on: true,
                    use: [datatable, "./data/planned_vs_implemented.grouped.json", {noIndexer: false}]
                }, {
                    on: false,
                    use: [
                        [{euCohesionData: {plannedVsImplemented: _}}, [foreignFunctions]],
                        true
                    ]
                })
            ],

            cciInformation: [{data: _}, [datatable, "./data/cci_payments.grouped.json", {noIndexer: true}]],

            countryAbbreviations: [
                map,
                [defun, "abbrName",
                    {
                        text: [{name: _}, "abbrName"],
                        value: [{abbreviation: _}, "abbrName"]
                    }
                ],
                [sort,
                    [{data: _}, [datatable, "./data/country-abbreviations.json", {noIndexer: true}]],
                    {name: ascending}
                ]
            ],

            managingAuthorities: [{data: _}, [datatable, "./data/managing-authorities.json"]],

            "^sliceDefinitions": o(),

            selectionChoicesData: o({
                label: "Country",
                choices: [{countryAbbreviations: _}, [me]],
                singleChoice: true
            }, {
                label: "Region Type",
                choices: [{availableRegionTypes: _}, [me]]
            }, {
                label: "Intervention Field",
                choices: [{availableInterventionFields: _}, [me]]
            }, {
                label: "Fund",
                choices: [{availableFunds: _}, [me]]
            }),

            "^menuSelections": o(),

            selectedCountries: [{menuSelections: {label: "Country", selected: _}}, [me]],
            programmesForSelectedCountries: [
                {ms: [{selectedCountries: _}, [me]], cci: _},
                [{cciInformation: _}, [me]]
            ],
            dataForSelectedCountries: [
                {cci: [{programmesForSelectedCountries: _}, [me]]},
                [{data: _}, [{mainDataSource: _}, [me]]]
            ],

            availableRegionTypes: [
                map,
                [defun, "regionType",
                    {
                        text: "regionType",
                        value: "regionType"
                    }
                ],
                [sort,
                    [_, [{dataForSelectedCountries: {category_of_region: _}}, [me]]],
                    ascending
                ]
            ],

            selectedRegionTypes: [
                replaceEmpty,
                [{menuSelections: {label: "Region Type", selected: _}}, [me]],
                [_, [{dataForSelectedCountries: {category_of_region: _}}, [me]]]
            ],
            availableCCIFundRegionPriority: [
                {category_of_region: [{selectedRegionTypes: _}, [me]]},
                [{dataForSelectedCountries: _}, [me]]
            ],
            availableInterventionFields: [
                map,
                [defun, "interventionField",
                    {
                        text: "interventionField",
                        value: "interventionField"
                    }
                ],
                [
                    _,
                    [sort,
                        [{availableCCIFundRegionPriority: {InterventionField: {dimension_title: _}}}, [me]],
                        ascending
                    ]
                ]
            ],

            selectedInterventionFields: [
                replaceEmpty,
                [{menuSelections: {label: "Intervention Field", selected: _}}, [me]],
                true
            ],
            availableCCIFundRegionPriorityFilteredForInterventionField: [
                {InterventionField: {dimension_title: [{selectedInterventionFields: _}, [me]]}},
                [{availableCCIFundRegionPriority: _}, [me]]
            ],
            availableFunds: [
                map,
                [defun, "fund",
                    {
                        text: "fund",
                        value: "fund"
                    }
                ],
                [
                    _,
                    [sort,
                        [{availableCCIFundRegionPriorityFilteredForInterventionField: {fund: _}}, [me]],
                        ascending
                    ]
                ]
            ],
            selectedFunds: [
                replaceEmpty,
                [{menuSelections: {label: "Fund", selected: _}}, [me]],
                true
            ],

            filteredMainData: [
                {
                    InterventionField: {dimension_title: [{selectedInterventionFields: _}, [me]]},                    
                    fund: [{selectedFunds: _}, [me]]
                },
                [{availableCCIFundRegionPriority: _}, [me]]
            ],
            filteredCCIInfo: [
                {
                    cci: [{filteredMainData: {cci: _}}, [me]],
                    ms: [{selectedCountries: _}, [me]]
                },
                [{cciInformation: _}, [me]]
            ]
        },

        children: {

            controls: {
                description: {
                    "class": "SettingsToolBar"
                }
            },

            selectionController: {
                description: {
                    "class": "SelectionController",
                    context: {
                        choicesData: [{selectionChoicesData: _}, [embedding]],
                        selections: [{menuSelections: _}, [embedding]]
                    }
                }
            },

            sort: {
                description: {
                    "class": "SortController",
                    context: {
                        facetNames: o(
                            {text: "Name", value: "official_titles"},
                            {text: "CCI", value: "cci"},
                            {text: "Amount", value: "amount_left"} // DOESN'T EXIST!!!
                        )
                    }
                }
            },

            result: {
                description: {
                    "class": "ResultList",
                    context: {
                        scrolledData:  [
                            sort,
                            [{filteredCCIInfo: _}, [embedding]],
                            [
                                mkSel,
                                [{children: {sort: {selected: _}}}, [embedding]],
                                [cond,
                                    [{children: {sort: {direction: _}}}, [embedding]], o(
                                    { on: true, use: ascending },
                                    { on: false, use: descending }
                                )]
                            ]
                        ],
                        selectedItem: [
                            pos,
                            [{selectedItemsIndex: _}, [me]],
                            [{scrolledData: _}, [me]]
                        ]
                    }
                }
            },

            selectionInfo: {
                description: {
                    "class": "SelectionInformation",
                    context: {
                        item: [{children: {result: {selectedItem: _}}}, [embedding]]
                    }
                }
            }
        }
    }),

    // Defines an os of selections that will be shown in a ResultList
    SelectionController: {
        context: {
            /// Menu definition
            choicesData: mustBeDefined,
            /// List of selections per menu
            selections: mustBeDefined
        }
    },

    ResultListContext: {
        context: {
            "^selectedItemsIndex": o()
        }
    },

    /// Scrolling list of items
    ResultList: {
        "class": o("RLUniformScrollableWithScrollbar", "ResultListContext"),

        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "RLScrolledItem"
                }
            }
        }
    },

    /// Element for setting sorting on one facet: shows the sort facet names and
    /// an up/down button.
    SortController: {

        context: {
            /// Sort facet names, an os with of type { text: "displayed text",
            /// value: "the attribute name"}.
            facetNames: mustBeDefined,
            /// The currently selected sort facet
            "^selected": [{value: _}, [first, [{listData: _}, [me]]]],
            /// The sorting direction: true is ascending, false descending
            "^direction": true
        },

        children: {
            /// List of sort header facet names
            "items.description.class": "SortHeaderItem",
            /// Sort direction control
            "direction.description.class": "SortDirection"
        }
    },

    /// Button that shows the sorting direction and inverts it on a click
    SortDirection: {
        "class": { name: "FlipButton", value: [{direction: _}, [embedding]] }
    },

    /// Facet name in a sorting controller; clicking assigns it to SortController.selected
    SortHeaderItem: o({
        context: {
            isSelected: [equal, [{content: {value: _}}, [me]], [{selected: _}, [embedding]]],
            text: [{content: {text: _}}, [me]]
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    open: {
                        to: [{selected: _}, [embedding]],
                        merge: [{content: {value: _}}, [me]]
                    }
                }
            }
        }
    }),

    /// Bit useless: only switches visual style on click
    SettingsToolBar: {
        children: {
            settingsControl: {
                description: {
                    display: {
                        image: {
                            src: "%%image:(ic_settings_48px.svg)%%",
                            size: "100%"
                        }
                    },
                    write: {
                        onClick: {
                            upon: myClick,
                            true: {
                                changeStyle: {
                                    to: [{visualStyleIndex: _}, [myContext, "VisualStyle"]],
                                    merge: [mod, [plus, [{visualStyleIndex: _}, [myContext, "VisualStyle"]], 1], 2]
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    SelectionInformation: {
        "class": "SelectedItemInformation",

        context: {
            cci: [{item: {cci: _}}, [me]],
            cciItem: [
                {cci: [{cci: _}, [me]]},
                [{cciInformation: _}, [embedding]]
            ]
        },

        children: {
            dimensions: {
                description: {
                    "class": "Tabs",
                    context: {
                        tabs: o(
                            {name: "InterventionField"},
                            {name: "Area"},
                            {name: "FinanceForm"}
                        )
                    }
                }
            }
        }
    },

    // Information on a single item; filters intervention fields
    SelectedItemInformation: {
        context: {
            cci: [{cciItem: {cci: _}}, [me]],
            matchingItems: [
                {
                    cci: [replaceEmpty, [{cci: _}, [me]], false],
                    fund: [{selectedFunds: _}, [myContext, "ApplicationData"]]
                },
                [{filteredMainData: _}, [myContext, "ApplicationData"]]
            ],
            interventionFields: [
                {dimension_title: [{selectedInterventionFields: _}, [myContext, "ApplicationData"]]},
                [{matchingItems: {InterventionField: _}}, [me]]
            ],
            financeForms: [{matchingItems: {FinanceForm: _}}, [me]],
            territories: [{matchingItems: {Territory: _}}, [me]],
            officialTitle: [{cciItem: {official_titles: _}}, [me]],
            url: [{cciItem: {weblink: _}}, [me]],
            maURLs: [
                {name: [{officialTitle: _}, [me]]},
                [{managingAuthorities: _}, [myContext, "ApplicationData"]]
            ],
            maURL: [
                cond, [size, [{maURLs: {country: [{selectedCountries: _}, [myContext, "ApplicationData"]], url: _}}, [me]]], o(
                { on:    1, use: [{maURLs: {country: [{selectedCountries: _}, [myContext, "ApplicationData"]], url: _}}, [me]] },
                { on: null, use: [first, [{maURLs: {url: _}}, [me]]] }
            )]
        }
    },

    Tabs: {
        context: {
            tabs: mustBeDefined,
            "^selectedTabIndex": 0,
            nrTabs: [size, [{tabs: _}, [me]]]
        },
        children: {
            header: {
                data: [{tabs: _}, [me]],
                description: {
                    "class": "TabHeader"
                }
            },
            item: {
                description: {
                    "class": "TabItem"
                }
            }
        }
    },

    TabHeader: o({
        context: {
            label: [{param: {areaSetContent: {name: _}}}, [me]],
            index: [{param: {areaSetAttr: _}}, [me]],
            selected: [equal, [{selectedTabIndex: _}, [embedding]], [{index: _}, [me]]]
        },
        write: {
            onClick: {
                upon: myClick,
                true: {
                    switchTab: {
                        to: [{selectedTabIndex: _}, [embedding]],
                        merge: [{index: _}, [me]]
                    }
                }
            }
        }
    }),

    TabItem: o({
        "class": o("RLUniformScrollableWithScrollbar", "ResultListContext"),

        context: {
            selectedTabIndex: [{selectedTabIndex: _}, [embedding]],
            itemSize: 60,
            itemSpacing: 0
        },

        "children.scrollView.description": {
            "children.scrolledDocument.description": {
                "children.itemsInView.description": {
                    "class": "TabItemListItem"
                }
            }
        }    

    }, {
        qualifier: {selectedTabIndex: 0},
        context: {
            scrolledData: [{interventionFields: _}, [embedding, [embedding]]]
        }
    }, {
        qualifier: {selectedTabIndex: 1},
        context: {
            scrolledData: [{territories: _}, [embedding, [embedding]]]
        }
    }, {
        qualifier: {selectedTabIndex: 2},
        context: {
            scrolledData: [{financeForms: _}, [embedding, [embedding]]]
        }
    }),

    TabItemListItem: {
    }
};

var screenArea = {
    "class": o("App", "AppPresentation")
};
