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

var myFSAppDBSchema = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the initial ordering and expansion state of the facets in the app.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        context: {
            // ItemDBController params
            itemUniqueIDAttr: "symbol",
            itemUniqueIDAttrFunc: [defun,
                                   o("what"),
                                   { "symbol": "what" }
                                  ],                                 

            configFacetData: o(
                // attributes ready for copy-pasting for testing
                // state: facetState.histogram
                // minimized: true,
                {
                    id: -1,
                    name: "Name",
                    uniqueID: "name",
                    facetType: "ItemValues",
                    unminimizable: true
                },
                {
                    id: 0,
                    name: "52WL",
                    tooltipText: "Lowest price of past 52 weeks",
                    uniqueID: "52 week low",
                    facetType: "SliderFacet",
                    //state: facetState.histogram
                },
                {
                    id: 1,
                    name: "Exchange",
                    tooltipText: "Exchange traded on",                      
                    uniqueID: "exchange",
                    facetType: "MSFacet"
                },
                {
                    id: 3,
                    name: "52WH",
                    tooltipText: "Highest price of past 52 weeks",
                    uniqueID: "52 week high",
                    facetType: "SliderFacet"
                },
                {
                    id: 6,
                    name: "P/E Ratio",
                    tooltipText: "Price/Earnings Ratio",
                    uniqueID: "p/e ratio",
                    facetType: "SliderFacet"
                },                  
                {                   
                    id: 5,
                    name: "Quality",
                    tooltipText: "Quality",                      
                    uniqueID: "quality",
                    facetType: "MSFacet"
                }/*,
                {
                    id: 2,
                    name: "Morningstar",
                    tooltipText: "Morningstar Rating",
                    uniqueID: "morningstarRating",
                    facetType: "RatingFacet",
                    ratingLevels: o(5,4,3,2,1),
                    ratingSymbol: "star"
                },
                {
                    id: 4,
                    name: "My Rating",
                    tooltipText: "Double-click on cells to update rating value",
                    uniqueID: "myRating",
                    facetType: "RatingFacet",
                    ratingLevels: o(5,4,3,2,1),
                    ratingSymbol: "star",
                    write: true
                },
                {
                    id: 7,
                    name: "My Quality",
                    tooltipText: "Double-click on cells to update rating value",
                    uniqueID: "myQuality",
                    facetType: "RatingFacet",
                    ratingLevels: o("Terrific", "OK", "So So", "Horrible"), // the os of ordered rating levels.
                    write: true
                }*/
                
                // this os is for an isFeg workaround - hard-coded selection and projection queries are offered here, instead of constructing them on the fly.
            facetQueryData: o(
                {
                    uniqueID: "name",
                    projectionQuery: { "name":_ },
                    selectionQueryFunc: [defun, o("what"), { "name": "what" }]
                },
                {
                    uniqueID: "52 week low",
                    projectionQuery: { "52 week low":_ },
                    selectionQueryFunc: [defun, o("what"), { "52 week low": "what" }]
                },
                {
                    uniqueID: "exchange",
                    projectionQuery: { "exchange":_ },
                    selectionQueryFunc: [defun, o("what"), { "exchange": "what" }]
                },
                {
                    uniqueID: "52 week high",
                    projectionQuery: { "52 week high":_ },
                    selectionQueryFunc: [defun, o("what"), { "52 week high": "what" }]
                },
                {
                    uniqueID: "p/e ratio",
                    projectionQuery: { "p/e ratio":_ },
                    selectionQueryFunc: [defun, o("what"), { "p/e ratio": "what" }]
                },                  
                {                   
                    uniqueID: "quality",
                    projectionQuery: { "quality":_ },
                    selectionQueryFunc: [defun, o("what"), { "quality": "what" }]
                },
                {
                    uniqueID: "morningstarRating",
                    projectionQuery: { "morningStarRating":_ },
                    selectionQueryFunc: [defun, o("what"), { "morningStarRating": "what" }]
                },
                {
                    uniqueID: "myRating",
                    projectionQuery: { "myRating":_ },
                    selectionQueryFunc: [defun, o("what"), { "myRating": "what" }]
                },
                {
                    uniqueID: "myQuality",
                    projectionQuery: { "myQuality":_ },
                    selectionQueryFunc: [defun, o("what"), { "myQuality": "what" }]
                }
            )
        }
    }
};
