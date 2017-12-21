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

/* These classes define the basic logic for handling the main data
*/

var classes = {

    /// Contains the main data, i.e. the data set the user is interested in.
    ApplicationDataContext: {
        context: {

            /// Data and metadata from the main data source. This must be
            /// replaced by static data, [datatable] or [database], or a foreign
            /// interface that retrieves the data in the expected format.
            mainDataSource: mustBeDefined,

            /// The actual data from the main data source
            mainData: [{data: _}, [{mainDataSource: _}, [me]]],

            /// Attribute description of the main data source
            mainDataAttributes: [{attributes: _}, [{mainDataSource: _}, [me]]]
        }
    },

    /// Contains the definitions of the slices, and the handler for adding and
    /// removing them.
    /// Adding a slice is done by sending the area inheriting this class the
    /// message with type: "AddSlice".
    /// Removing a slice is done by sending a message with type: "RemoveSlice"
    /// and an attribute sliceId: containing the id(s) of the slice(s) that
    /// should be removed.
    /// Usage: inherit this class somewhere
    SliceDefinitionContext: {
        context: {
            /// OS of slice definitions. A slice definition is an AV containing
            /// - id: a unique, numerical id
            /// - name: slice name, freely usable
            /// - selections: an os of selections
            /// Initialized with one (full) slice
            "^sliceDefinitions": [{initSliceData: _}, [me]],

            /// The numerical id of the next slice
            "^nextSliceId": [size, [{initSliceData: _}, [me]]],

            /// Override this to change the initial slice definitions
            /// Make sure the ids are in Rco(0, [size, [{initSliceData: _}, [me]]]).
            initSliceData: {id: 0}
        }
    },
    
    SliceDefinition: {
        "class": "SliceDefinitionContext",
        write: {
            /// Handler for the AddSlice message
            addSlice: {
                upon: [{type: "AddSlice"}, [myMessage]],
                true: {
                    addSlice: {
                        to: [{sliceDefinitions: _}, [me]],
                        merge: push({
                            id: [{nextSliceId: _}, [me]]
                        })
                    },
                    incrementNextSliceId: {
                        to: [{nextSliceId: _}, [me]],
                        merge: [plus, [{nextSliceId: _}, [me]], 1]
                    }
                }
            },
            /// Handler for the RemoveSlice message
            removeSlice: {
                upon: [{type: "RemoveSlice"}, [myMessage]],
                true: {
                    removeSlice: {
                        to: [{sliceDefinitions: _}, [me]],
                        merge: atomic([
                            n({id: [{sliceId: _}, [myMessage]]}),
                            [{sliceDefinitions: _}, [me]]
                        ])
                    }
                }
            }
        }
    },

    /// The slice itself, must be used in an area set.
    /// Usage: inherit this class somewhere under ApplicationData. The data
    /// of the area set must come from {sliceDefinitions: _} from an area of
    /// class SliceDefinitions. Identify the area set by {id: _}.
    SliceContext: {
        context: {
            /// The id of the slice
            sliceId: [{param: {areaSetContent: {id: _}}}, [me]],
            /// The filtered data
            filteredData: [multiQuery,
                [{param: {areaSetContent: {selections: _}}}, [me]],
                [{mainData: _}, [myContext, "ApplicationData"]]
            ],
            /// The slice name
            name: [{param: {areaSetContent: {name: _}}}, [me]]
        }
    }

};
