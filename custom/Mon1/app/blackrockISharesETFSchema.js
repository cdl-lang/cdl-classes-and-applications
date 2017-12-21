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

var classes = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the initial ordering and expansion state of the facets in the app.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        "class": "BlackRockISharesETFAppSchema",
        context: {
            // this defines the initial ordering of facets and their
            //   expansion state.       
            dataSourceFacetDataOrdering: o(
                { uniqueID: "Ticker" },
                { uniqueID: "Fund" },
                { uniqueID: "Net Assets" },
                { uniqueID: "Asset Class" },
                /* { uniqueID: "Domicile" },*/ // always 'United States'
                { uniqueID: "Inception Date" },
                { uniqueID: "Market Price YTD (%)" },
                { uniqueID: "Market Price 1y (%)" },
                { uniqueID: "Market Price 5y (%)" },
                { uniqueID: "Market Price 10y (%)" },
                { uniqueID: "Market Price Incept (%)" },
                { uniqueID: "NAV YTD (%)" },
                { uniqueID: "30 Day SEC Yield (%)" },
                { uniqueID: "NAV 1y (%)" },
                { uniqueID: "Effective Duration" },
                { uniqueID: "NAV 5y (%)" },
                /* { uniqueID: "S&P Rating" },*/ // always '--'
                { uniqueID: "NAV 10y (%)" },
                /* { uniqueID: "Real Duration" },*/
                { uniqueID: "NAV Incept (%)" },
                { uniqueID: "P/E Ratio" },
                { uniqueID: "Benchmark YTD (%)" },
                { uniqueID: "P/B Ratio" },
                { uniqueID: "Benchmark 1y (%)" },
                { uniqueID: "Gross Expense Ratio" },
                { uniqueID: "Benchmark 5y (%)" },
                { uniqueID: "Net Expense Ratio" },
                { uniqueID: "Benchmark 10y (%)" },
                { uniqueID: "Benchmark Incept (%)" }
            )
        }
    }
};
