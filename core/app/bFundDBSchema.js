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

var bFundDBSchema = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Defines a configFacetData os of objects, in which the uniqueID attribute is the identity attribute.
    // 
    // API:
    // 1. dataSourceFacetDataOrdering, where the inheriting class may define the desired initial order of facets and their initial expansion state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        // item attributes left out for now:
        // "delta (abs)": 0.08, 
        // "delta (perc)": "(0.83)", 
        // "% rank in category (ytd)": 4.76, 
        // "previous close": 9.54, 
        context: {
            name: "Fund Screener", // override the default value inherited by FSApp in App.
            itemUniqueID: "fund name", // change to "symbol" once fund ticker is separated to separate attribute in db!
            displayedUniqueID: "fund name",

            configFacetData: o(
                // attributes ready for copy-pasting:
                // state: facetState.histogram
                // minimized: false,
                // for a slider facet: scaleType: "log"/"linear"
                {
                    name: "Name",
                    uniqueID: "fund name",
                    facetType: "ItemValues",
                    unminimizable: true
                },
                {
                    name: "Rank YTD",
                    tooltipText: "Rank in Category Year to Date",
                    uniqueID: "rank in category (ytd)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    minVal: 0,
                    maxVal: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the minVal, instead of the value itself
                    maxValString: "Worst" // the text to appear next to the scale that represents the maxVal, instead of the value itself
                },
                {
                    name: "Category",
                    tooltipText: "Category",
                    uniqueID: "category",
                    facetType: "MSFacet"
                },
                {
                    name: "Total Assets",
                    tooltipText: "Total Assets in $B",
                    uniqueID: "total assets",
                    facetType: "SliderFacet",
                    scaleType: "log",
                    minVal: 1000000, // 10^6
                    maxVal: 1000000000000, // 10^12
                    numericFormatType: "precision",
                    numberOfDigits: 1,
                    state: facetState.standard
                },
                {
                    name: "Return YTD",
                    tooltipText: "Return Year to Date",
                    uniqueID: "ytd return",
                    facetType: "SliderFacet",
                    maxVal: 20,
                    minVal: -20,
                    state: facetState.standard
                },
                {
                    name: "Expense Ratio",
                    tooltipText: "Annual Expense Ratio",
                    uniqueID: "annual report expense ratio (net)",
                    facetType: "SliderFacet",
                    minVal: 0,
                    maxVal: 2
                },
                {
                    name: "Yield",
                    tooltipText: "Yield",
                    uniqueID: "yield",
                    facetType: "SliderFacet"
                },
                {
                    name: "Morningstar Risk",
                    tooltipText: "Morningstar Risk Rating",
                    uniqueID: "morningstar risk rating",
                    facetType: "RatingFacet",
                    ratingLevels: o(5, 4, 3, 2, 1),
                    ratingSymbol: "star"
                },
                {
                    name: "Morningstar Rating",
                    tooltipText: "Morningstar Overall Rating",
                    uniqueID: "morningstar overall rating",
                    facetType: "RatingFacet",
                    ratingLevels: o(5, 4, 3, 2, 1),
                    ratingSymbol: "star"
                },
                {
                    name: "5-Year Avg",
                    tooltipText: "Five Year Average",
                    uniqueID: "5yr avg return",
                    facetType: "SliderFacet"
                },
                {
                    name: "Beta",
                    tooltipText: "3-Year Beta",
                    uniqueID: "beta (3yr)",
                    facetType: "SliderFacet"
                },
                {
                    name: "My Rating",
                    tooltipText: "Double-click on cells to update rating value",
                    uniqueID: "myRating",
                    facetType: "RatingFacet",
                    ratingLevels: o(5, 4, 3, 2, 1),
                    ratingSymbol: "star",
                    write: true
                }/*,
                {
                    id: 7,
                    name: "My Quality",
                    tooltipText: "Double-click on cells to update rating value",
                    uniqueID: "myQuality",
                    facetType: "RatingFacet",
                    ratingLevels: o("Terrific", "OK", "So So", "Horrible"), // the os of ordered rating levels.
                    write: true
                }*/
            ),

            // this os is for an isFeg workaround - hard-coded selection and projection queries are offered here, instead of constructing them on the fly.
            facetQueryData: o(
                {
                    uniqueID: "fund name",
                    projectionQuery: { "fund name": _ },
                    selectionQueryFunc: [defun, o("what"), { "fund name": "what" }]
                },
                {
                    uniqueID: "ytd return",
                    projectionQuery: { "ytd return": _ },
                    selectionQueryFunc: [defun, o("what"), { "ytd return": "what" }]
                },
                {
                    uniqueID: "category",
                    projectionQuery: { "category": _ },
                    selectionQueryFunc: [defun, o("what"), { "category": "what" }]
                },
                {
                    uniqueID: "total assets",
                    projectionQuery: { "total assets": _ },
                    selectionQueryFunc: [defun, o("what"), { "total assets": "what" }]
                },
                {
                    uniqueID: "annual report expense ratio (net)",
                    projectionQuery: { "annual report expense ratio (net)": _ },
                    selectionQueryFunc: [defun, o("what"), { "annual report expense ratio (net)": "what" }]
                },
                {
                    uniqueID: "rank in category (ytd)",
                    projectionQuery: { "rank in category (ytd)": _ },
                    selectionQueryFunc: [defun, o("what"), { "rank in category (ytd)": "what" }]
                },
                {
                    uniqueID: "yield",
                    projectionQuery: { "yield": _ },
                    selectionQueryFunc: [defun, o("what"), { "yield": "what" }]
                },
                {
                    uniqueID: "morningstar risk rating",
                    projectionQuery: { "morningstar risk rating": _ },
                    selectionQueryFunc: [defun, o("what"), { "morningstar risk rating": "what" }]
                },
                {
                    uniqueID: "morningstar overall rating",
                    projectionQuery: { "morningstar overall rating": _ },
                    selectionQueryFunc: [defun, o("what"), { "morningstar overall rating": "what" }]
                },
                {
                    uniqueID: "5yr avg return",
                    projectionQuery: { "5yr avg return": _ },
                    selectionQueryFunc: [defun, o("what"), { "5yr avg return": "what" }]
                },
                {
                    uniqueID: "beta (3yr)",
                    projectionQuery: { "beta (3yr)": _ },
                    selectionQueryFunc: [defun, o("what"), { "beta (3yr)": "what" }]
                },
                {
                    uniqueID: "myRating",
                    projectionQuery: { "myRating": _ },
                    selectionQueryFunc: [defun, o("what"), { "myRating": "what" }]
                },
                {
                    uniqueID: "myQuality",
                    projectionQuery: { "myQuality": _ },
                    selectionQueryFunc: [defun, o("what"), { "myQuality": "what" }]
                }
            )
        }
    }
};
