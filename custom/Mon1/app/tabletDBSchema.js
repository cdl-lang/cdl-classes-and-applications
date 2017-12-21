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

var tabletDBSchema = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the initial ordering and expansion state of the facets in the app.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        "class": "TabletAppSchema",
        context: {
            // this defines the initial ordering of facets and their expansion state.       
            dataSourceFacetDataOrdering: o(
                // minimized: true,
                {uniqueID: "model"},
                {uniqueID: "price"},
                {uniqueID: "screenSize"},
                {uniqueID: "os"},
                {uniqueID: "score"},
                {uniqueID: "connectivity"},
                {uniqueID: "width"},
                {uniqueID: "height"},
                {uniqueID: "storage"},
                {uniqueID: "memory"},
                {uniqueID: "nrReviews"}
            )
        }
    }
};
