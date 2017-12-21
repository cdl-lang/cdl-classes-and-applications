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

// %%classfile%%: <bFundDBSchema.js>

var fundDBSchema = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the initial ordering and expansion state of the facets in the app.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        "class": superclass,
        context: {
            // this defines the initial ordering of facets and their expansion state.       
            dataSourceFacetDataOrdering: o(
                // attributes ready for copy-pasting for testing
                // state: facetState.histogram
                // minimized: true,
                {
                    uniqueID: "fund name",
                    minimized: false
                },
                {
                    uniqueID: "ytd return",
                    minimized: false
                },
                {
                    uniqueID: "rank in category (ytd)",
                    minimized: false
                },
                {
                    uniqueID: "category",
                    minimized: false
                },
                {
                    uniqueID: "total assets",
                    minimized: true
                },
                {
                    uniqueID: "annual report expense ratio (net)",
                    minimized: true
                },
                {
                    uniqueID: "yield",
                    minimized: true
                },
                {
                    uniqueID: "morningstar risk rating",
                    minimized: true
                },              
                {
                    uniqueID: "morningstar overall rating",
                    minimized: true
                },      
                {
                    uniqueID: "5yr avg return",
                    minimized: true
                },
                {
                    uniqueID: "beta (3yr)",
                    minimized: true
                }/*,                
                {
                    uniqueID: "myRating"
                },
                {
                    uniqueID: "myQuality"
                }
                */              
            )
        }
    }
};
