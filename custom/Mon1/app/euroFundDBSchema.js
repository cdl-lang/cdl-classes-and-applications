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

var euroFundDBSchema = {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the initial ordering and expansion state of the facets in the app.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppSchema: {
        "class": "EuroFundAppSchema",
        context: {
            // this defines the initial ordering of facets and their expansion state.       
            dataSourceFacetDataOrdering: o(
                // minimized: true,
                { uniqueID: "Name" },
                { uniqueID: "Management Fee" },
                { uniqueID: "Total Ret 1 Yr (Mo-End) Base Currency" },
                { uniqueID: "Equity Style Box (Long)" },
                { uniqueID: "Total Ret % Rank Cat 1 Yr (Mo-End)" },
                { uniqueID: "Investment Area" },
                { uniqueID: "Morningstar Rating Overall" },
                //{ uniqueID: "Fund Size USD" },
                { uniqueID: "Total Ret Annlzd 3 Yr (Mo-End) Base Currency" },
                { uniqueID: "Total Ret % Rank Cat 3 Yr (Mo-End)" },
                { uniqueID: "Total Ret Annlzd 5 Yr (Mo-End) Base Currency" },
                { uniqueID: "Total Ret % Rank Cat 5 Yr (Mo-End)" },
                { uniqueID: "Total Ret YTD (Mo-End) Base Currency" },
                { uniqueID: "Total Ret % Rank Cat YTD (Mo-End)" },
                { uniqueID: "Total Ret 1 Mo (Mo-End) Base Currency" },
                { uniqueID: "Total Ret % Rank Cat 1 Mo (Mo-End)" },
                { uniqueID: "Alpha 1 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Alpha 3 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Alpha 5 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Sharpe Ratio 1 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Sharpe Ratio 3 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Sharpe Ratio 5 Yr (Mo-End) Risk Currency" },
                { uniqueID: "Manager Tenure (Average)" },
                { uniqueID: "Manager Tenure (Longest)" },
                { uniqueID: "Open to New Inv" }
            )
        }
    }
};
