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


var mbaAppSchema = {
    MBAAppSchema: {
        "class": "PreLoadedApp",
        context: {
            name: "FT MBA Ranking",
            productName: [concatStr, // override default in FSApp
                o(
                    [{ companyName: _ }, [me]],
                    [{ name: _ }, [me]]
                ),
                " "
            ],
            dataSourceProvider: "Financial Times",
            itemUniqueID: "School name",
            defaultFrozenFacetUniqueIDs: o(
                "School name",
                [
                    getOverlayUniqueID,
                    fsAppConstants.defaultFavoritesCounter
                ]
            ),
            defaultMovingFacetUniqueIDs: o("Rank in 2017", "Salary today (US$)", "Country"),
            //defaultLoadedDataSourceName is now defined in PreLoadedApp
            defaultSortableUniqueID: "Rank in 2017", // override default definition
            displaySliderScaleEditControls: "hide",
            excludedDataSourceFacetUniqueIDs: o(
                "PhD graduates No. (%)",
                "PhD graduates No. - Related TBD (%)",
                "Languages",
                "Aims achieved (%)"
            ),

            // dataSourceFacetDataOrdering can be an ordering of a subset - what is left out will be sorted by default by the order in which it appears in the database.
            dataSourceFacetDataOrdering: o(
                "School name",
                "Rank in 2017",
                "Rank in 2016",
                "Rank in 2015",
                "3 year average rank",
                "Country",
                "Salary today (US$)",
                "Weighted salary (US$)",
                "Salary percentage increase",
                "Value for money rank",
                "Career progress rank",
                "Careers service rank",
                "Alumni recommend rank",
                "International mobility rank",
                "International course experience rank",
                "Employed at three months (%)",
                "Employed at three months survey coverage (%)",
                "Female students (%)",
                "Female board (%)",
                "International students (%)",
                "International board (%)",
                //"Languages",
                "Female faculty (%)",
                "Faculty with doctorates (%)",
                "International faculty (%)",
                "FT research rank",
                //"PhD graduates No. (%)",
                //"PhD graduates No. - Related TBD (%)",
                //"Aims achieved (%)",
                "Audit year"
            ),
            dataConfig: {
                // sort these objects alphabetically by the uniqueID, to ensure there are no duplicate objects referring to the same facet!
                facetObjects: o(
                    {
                        uniqueID: "3 year average rank",
                        name: "3-Year Average Ranking",
                        tooltipText: "Financial Times 3-Year Average MBA Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Alumni recommend rank",
                        name: "Alumni Ranking",
                        tooltipText: "Alumni Recommendation Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Audit year",
                        name: "Audit Year",
                        defaultNumericFormattingObjPos: 0,
                        defaultFacetType: "MSFacet",
                        defaultDataType: fsAppConstants.dataTypeStringLabel
                    },
                    {
                        uniqueID: "Career progress rank",
                        name: "Career Progress Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking", "Career")
                    },
                    {
                        uniqueID: "Careers service rank",
                        name: "Careers Service Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking", "Studies")
                    },
                    {
                        uniqueID: "Employed at three months (%)",
                        name: "Employed @ 3-Months (%)",
                        tooltipText: "Percent of Graduating Class Employed 3 Months Post Graduation",
                        defaultNumericFormattingObjPos: 0,
                        tags: o("Ranking", "Career")
                    },
                    {
                        uniqueID: "Employed at three months survey coverage (%)",
                        name: "Employed @ 3-Months Survey (%)",
                        tooltipText: "Percent of Graduating Class Responding to Employment Survey",
                        defaultNumericFormattingObjPos: 0,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Faculty with doctorates (%)",
                        name: "Faculty w/PhD (%)",
                        tooltipText: "Faculty Members with Doctoral Degrees",
                        defaultNumericFormattingObjPos: 0,
                        tags: ("Studies")
                    },
                    {
                        uniqueID: "Female board (%)",
                        name: "Female Board (%)",
                        defaultNumericFormattingObjPos: 0
                    },
                    {
                        uniqueID: "Female students (%)",
                        name: "Female Students (%)",
                        defaultNumericFormattingObjPos: 0,
                        tags: ("Studies")
                    },
                    {
                        uniqueID: "Female faculty (%)",
                        name: "Female Faculty (%)",
                        defaultNumericFormattingObjPos: 0,
                        tags: ("Studies")
                    },
                    {
                        uniqueID: "FT research rank",
                        name: "FT Research Ranking",
                        tooltipText: "Financial Times Ranking of Research Published by Faculty Members",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "International board (%)",
                        name: "Intl. Board",
                        defaultNumericFormattingObjPos: 0
                    },
                    {
                        uniqueID: "International faculty (%)",
                        name: "Intl. Faculty (%)",
                        defaultNumericFormattingObjPos: 0,
                        tags: ("Studies")
                    },
                    {
                        uniqueID: "International students (%)",
                        name: "Intl. Students (%)",
                        defaultNumericFormattingObjPos: 0,
                        tags: ("Studies")
                    },
                    {
                        uniqueID: "International mobility rank",
                        name: "Intl. Mobility Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking", "Career")
                    },
                    {
                        uniqueID: "International course experience rank",
                        name: "Intl. Courses Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking", "Studies")
                    },
                    {
                        uniqueID: "Rank in 2015",
                        name: "2015 Ranking",
                        tooltipText: "Financial Times 2015 MBA Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Rank in 2016",
                        name: "2016 Ranking",
                        tooltipText: "Financial Times 2016 MBA Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Rank in 2017",
                        name: "2017 Ranking",
                        tooltipText: "Financial Times 2017 MBA Ranking",
                        defaultNumericFormattingObjPos: 0,
                        //positionOfHighValOnScale: "bottom", // triggers bug #2030
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking", "Favorites")
                    },
                    {
                        uniqueID: "Salary percentage increase",
                        name: "Salary % Increase",
                        tags: o("Salary", "Career")
                    },
                    {
                        uniqueID: "Salary today (US$)",
                        name: "Current Salary (USD)",
                        tags: o("Salary", "Career")
                    },
                    {
                        uniqueID: "School name",
                        name: "Name",
                        setInitialExpandableWidth: true // a frozen facet, by default. we want it to come up wider.
                    },
                    {
                        uniqueID: "Value for money rank",
                        name: "Value Ranking",
                        tooltipText: "Value for Money Ranking",
                        defaultNumericFormattingObjPos: 0,
                        initUserScaleMinValue: 1,
                        initUserScaleMaxValue: 100,
                        tags: o("Ranking")
                    },
                    {
                        uniqueID: "Weighted salary (US$)",
                        name: "Weighted Salary (USD)",
                        tags: o("Salary", "Career")
                    }
                ),

                overlayObjects: o(
                    {
                        uniqueID: [
                            getOverlayUniqueID,
                            fsAppConstants.primaryOverlayCounter
                        ],
                        showSolutionSet: true
                    }
                )
            },

            defaultExpandedOverlayUniqueIDs: o(
                [
                    getOverlayUniqueID,
                    fsAppConstants.primaryOverlayCounter
                ]
            )
        }
    }
};
