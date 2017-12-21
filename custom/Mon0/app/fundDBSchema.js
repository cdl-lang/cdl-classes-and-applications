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
                    uniqueID: "fund name"
                },
                {
                    uniqueID: "rank in category (ytd)"
                },
                {
                    uniqueID: "ytd return"
                },
                {
                    uniqueID: "category"
                },
                {
                    uniqueID: "total assets"
                    //state: facetState.histogram
                },
                {
                    uniqueID: "annual report expense ratio (net)"
                },
                {
                    uniqueID: "yield"
                },
                {
                    uniqueID: "morningstar risk rating",
                    state: facetState.standard
                },              
                {
                    uniqueID: "morningstar overall rating"
                },      
                {
                    uniqueID: "5yr avg return"
                },
                {
                    uniqueID: "beta (3yr)"
                }               
                /*
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
