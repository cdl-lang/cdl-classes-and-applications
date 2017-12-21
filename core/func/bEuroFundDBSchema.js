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
    // Defines a configFacetData os of objects, in which the uniqueID attribute is the identity attribute.
    // 
    // API:
    // 1. dataSourceFacetDataOrdering, where the inheriting class may define the desired initial order of facets and their initial expansion state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EuroFundAppSchema: {
        context: {
            name: "Equity Fund Screener", // override the default value inherited by FSApp in App.           
            itemUniqueID: "Name",
            displayedUniqueID: "Name",
/*
                "Name":"BSF European Opportunities Extn A2",
                "Base Currency":"Euro",
                "ISIN":"LU0313923228",
                "Global Broad Category Group":"Equity",
                "Morningstar Category":"EAA OE Europe Flex-Cap Equity",
                "Investment Area":"Europe",
                "Morningstar Rating Overall":5,
                "Domicile":"Luxembourg",
                "Region of Sale":"European Cross-Border",
                "Equity Style Box (Long)":"Medium Growth",
                "Firm Name":"BlackRock (Luxembourg) S.A.",
                "Branding Name":"BlackRock",
                "Inception Date":"08/31/2007",
                "Manager Name":"David Tovey;Simon Hunter;Zehrid Osmani;",
                "Manager History":"[2007-08-31--2013-03-20] Carl Lee;[2007-08-31--] David Tovey;[2013-03-20--] Zehrid Osmani;[2013-03-20--] Simon Hunter;",
                "Manager Tenure (Longest)":7.75,
                "Manager Tenure (Average)":4.03,
                "Primary Prospectus Benchmark":"S&P Europe BMI TR USD",
                "Primary Prospectus Benchmark Id":"FOUSA060F6",
                "Primary Prospectus Benchmark Inception Date":"07/31/1989",
                "Fund Size Date":"04/30/2015",
                "Fund Size USD":732030199,
                "Distribution Status":"Acc",
                "Return Date (Daily)":"04/30/2015",
                "Total Ret 1 Day (Daily) Base Currency":-1.11,
                "Total Ret % Rank Cat 1 Day (Daily)":39,
                "Total Ret 1 Mo (Mo-End) Base Currency":1.51,
                "Total Ret % Rank Cat 1 Mo (Mo-End)":26,
                "Total Ret YTD (Mo-End) Base Currency":22.30,
                "Total Ret % Rank Cat YTD (Mo-End)":4,
                "Total Ret 1 Yr (Mo-End) Base Currency":34.68,
                "Total Ret % Rank Cat 1 Yr (Mo-End)":2,
                "Total Ret Annlzd 2 Yr (Mo-End) Base Currency":37.57,
                "Total Ret % Rank Cat 2 Yr (Mo-End)":2,
                "Total Ret Annlzd 3 Yr (Mo-End) Base Currency":33.17,
                "Total Ret % Rank Cat 3 Yr (Mo-End)":1,
                "Total Ret Annlzd 5 Yr (Mo-End) Base Currency":22.18,
                "Total Ret % Rank Cat 5 Yr (Mo-End)":1,
                "Std Dev 1 Yr (Mo-End) Risk Currency":10.21,
                "Std Dev 3 Yr (Mo-End) Risk Currency":10.35,
                "Std Dev 5 Yr (Mo-End) Risk Currency":11.84,
                "Sharpe Ratio 1 Yr (Mo-End) Risk Currency":2.99,
                "Sharpe Ratio 3 Yr (Mo-End) Risk Currency":2.84,
                "Sharpe Ratio 5 Yr (Mo-End) Risk Currency":1.72,
                "Alpha 1 Yr (Mo-End) Risk Currency":13.66,
                "Alpha 3 Yr (Mo-End) Risk Currency":14.03,
                "Alpha 5 Yr (Mo-End) Risk Currency":10.01,
                "Management Fee":1.50,
                "Max Management Fee":1.50,
                "KIID Ongoing Charge":1.94,
                "Asset Alloc Cash % (Net)":0.81,
                "Asset Alloc Equity % (Net)":107.53,
                "Asset Alloc Bond % (Net)":0.00,
                "Asset Alloc Other % (Net)":-8.34,
                "# of Holdings (Long)":72,
                "# of Stock Holdings (Long)":69,
                "# of Bond Holdings (Long)":0,
                "# of Other Holdings (Long)":3,
                "Est Fund-Level Net Flow 1 Mo (Mo-End) Base Currency":-9755689,
                "Est Fund-Level Net Flow 3 Mo (Mo-End) Base Currency":-47564996,
                "Est Fund-Level Net Flow 6 Mo (Mo-End) Base Currency":-90746719,
                "Est Fund-Level Net Flow YTD (Mo-End) Base Currency":-64457351,
                "Open to New Inv":"Yes"
*/            
            configFacetData: o(
                // attributes ready for copy-pasting:
                // state: facetState.histogram
                // minimized: true,
                // for a slider facet: scaleType: "log"/"linear"
                {
                    name: "Fund Name",
                    uniqueID: "Name",
                    facetType: "ItemValues",
                    unminimizable: true
                },
                {
                    name: "Management Fee",
                    tooltipText: "Annual Management Fee (%)",
                    uniqueID: "Management Fee",
                    facetType: "SliderFacet",
                    state: facetState.standard
                },
                {
                    name: "Return YTD",
                    tooltipText: "Return Year to Date",
                    uniqueID: "Total Ret YTD (Mo-End) Base Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Rank YTD",
                    tooltipText: "Rank in Category Year to Date",
                    uniqueID: "Total Ret % Rank Cat YTD (Mo-End)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    scaleMinValue: 0,
                    scaleMaxValue: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the scaleMinValue, instead of the value itself
                    maxValString: "Worst", // the text to appear next to the scale that represents the scaleMaxValue, instead of the value itself
                    markerByValue: true // i.e. marker should be positioned by the single value it represents
                },
                {
                    name: "Return 1 Year",
                    tooltipText: "Return 1 Year",
                    uniqueID: "Total Ret 1 Yr (Mo-End) Base Currency",
                    facetType: "SliderFacet"
                    //scaleMaxValue: 60,
                    //scaleMinValue: -40
                },
                {
                    name: "Rank 1 Year",
                    tooltipText: "Rank in Category 1 Year",
                    uniqueID: "Total Ret % Rank Cat 1 Yr (Mo-End)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    scaleMinValue: 0,
                    scaleMaxValue: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the scaleMinValue, instead of the value itself
                    maxValString: "Worst", // the text to appear next to the scale that represents the scaleMaxValue, instead of the value itself
                    markerByValue: true // i.e. marker should be positioned by the single value it represents                
                },
                {
                    name: "Return 3 Year",
                    tooltipText: "Return 3 Year (Annualized)",
                    uniqueID: "Total Ret Annlzd 3 Yr (Mo-End) Base Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Rank 3 Year",
                    tooltipText: "Rank in Category 3 Year",
                    uniqueID: "Total Ret % Rank Cat 3 Yr (Mo-End)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    scaleMinValue: 0,
                    scaleMaxValue: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the scaleMinValue, instead of the value itself
                    maxValString: "Worst", // the text to appear next to the scale that represents the scaleMaxValue, instead of the value itself
                    markerByValue: true // i.e. marker should be positioned by the single value it represents                    
                },
                {
                    name: "Return 5 Year",
                    tooltipText: "Return 5 Year (Annualized)",
                    uniqueID: "Total Ret Annlzd 5 Yr (Mo-End) Base Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Rank 5 Year",
                    tooltipText: "Rank in Category 5 Year",
                    uniqueID: "Total Ret % Rank Cat 5 Yr (Mo-End)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    scaleMinValue: 0,
                    scaleMaxValue: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the scaleMinValue, instead of the value itself
                    maxValString: "Worst", // the text to appear next to the scale that represents the scaleMaxValue, instead of the value itself
                    markerByValue: true // i.e. marker should be positioned by the single value it represents                    
                },
                {
                    name: "Return 1 Month",
                    tooltipText: "Return 1 Month",
                    uniqueID: "Total Ret 1 Mo (Mo-End) Base Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Rank 1 Month",
                    tooltipText: "Rank in Category 1 Month",
                    uniqueID: "Total Ret % Rank Cat 1 Mo (Mo-End)",
                    facetType: "SliderFacet",
                    numberOfDigits: 0,
                    scaleMinValue: 0,
                    scaleMaxValue: 100,
                    minValString: "Best", // the text to appear next to the scale that represents the scaleMinValue, instead of the value itself
                    maxValString: "Worst", // the text to appear next to the scale that represents the scaleMaxValue, instead of the value itself
                    markerByValue: true // i.e. marker should be positioned by the single value it represents                    
                },
                {
                    name: "Investment Style",
                    tooltipText: "Morningstar Style Box",                      
                    uniqueID: "Equity Style Box (Long)",
                    facetType: "MSFacet",
                    values: o("Large Value","Large Blend","Large Growth","Medium Value","Medium Blend","Medium Growth","Small Value", "Small Blend", "Small Growth")
                },
                {
                    name: "Open To Invest",
                    tooltipText: "Open to New Investments",                      
                    uniqueID: "Open to New Inv",
                    facetType: "MSFacet",
                    values: o("Yes", "No")
                },
                {
                    name: "Geography",
                    tooltipText: "Geography",                      
                    uniqueID: "Investment Area",
                    facetType: "MSFacet",
                    values: o("Global", "Europe", "Europe Emerging Mkts", "United Kingdom", "North America", "USA")
                },              
                {
                    name: "Mgr. Tenure (Max.)",
                    tooltipText: "Maximum Tenure of Fund Manager",
                    uniqueID: "Manager Tenure (Longest)",
                    facetType: "SliderFacet",
                    numberOfDigits: 2
                },
                {
                    name: "Mgr. Tenure (Avg.)",
                    tooltipText: "Average Tenure of Fund Manager",
                    uniqueID: "Manager Tenure (Average)",
                    facetType: "SliderFacet",
                    numberOfDigits: 2
                },
                {
                    name: "Fund Size ($)",
                    tooltipText: "Fund Size in USD",
                    uniqueID: "Fund Size USD",
                    facetType: "SliderFacet",
                    scaleType: "log",
                    minVal: 1000000, // 10^6
                    maxVal: 100000000000, // 10^11
                    //subLogScale: o(5), // an os of numbers between 1 and 10 denoting sub-log scales. e.g. o(2,5) would mean a scale that shows 1,2,5,10,20,50,100..
                    numericFormatType: "precision",
                    numberOfDigits: 1
                },
                {
                    name: "Morningstar Rating",
                    tooltipText: "Morningstar Overall Rating",
                    uniqueID: "Morningstar Rating Overall",
                    facetType: "RatingFacet",
                    ratingLevels: o(5,4,3,2,1),
                    ratingSymbol: "star"
                }, 
                {
                    name: "Alpha 1 Year",
                    tooltipText: "Alpha 1 Year",
                    uniqueID: "Alpha 1 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Alpha 3 Year",
                    tooltipText: "Alpha 3 Year",
                    uniqueID: "Alpha 3 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Alpha 5 Year",
                    tooltipText: "Alpha 5 Year",
                    uniqueID: "Alpha 5 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Sharpe 1 Year",
                    tooltipText: "Sharpe 1 Year",
                    uniqueID: "Sharpe Ratio 1 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Sharpe 3 Year",
                    tooltipText: "Sharpe 3 Year",
                    uniqueID: "Sharpe Ratio 3 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                },
                {
                    name: "Sharpe 5 Year",
                    tooltipText: "Sharpe 5 Year",
                    uniqueID: "Sharpe Ratio 5 Yr (Mo-End) Risk Currency",
                    facetType: "SliderFacet"
                }
            )
        }
    }
};
