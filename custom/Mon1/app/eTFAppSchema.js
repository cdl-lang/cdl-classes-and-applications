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


var eTFAppSchema = {
    ETFAppSchema: {
        "class": "PreLoadedApp",
        context: {
            name: "ETF Screener",
            productName: [concatStr, // override default in FSApp
                o(
                    [{ companyName: _ }, [me]],
                    [{ name: _ }, [me]]
                ),
                " "
            ],
            dataSourceProvider: "Morningstar",
            itemUniqueID: "Isin",
            displayedUniqueID: "Name",
            defaultFrozenFacetUniqueIDs: o("Isin", "Name"),
            defaultMovingFacetUniqueIDs: o("Portfolios EquityStatistics StyleBox", "Domicile", "NetAssetValues MonthEndValue"),

            excludedDataSourceFacetUniqueIDs: o(
                "Benchmark GlobalAssetClassId",
                "Benchmark Id",
                "Benchmark Name",
                "Benchmark Type",
                "Id",
                "LastPrice Currency Id",
                "NetAssetValues CurrencyId",
                "Portfolios GlobalStockSectorBreakdown BreakdownValues Value",
                "Portfolios GlobalStockSectorBreakdown BreakdownValues Type",
                "Portfolios GlobalStockSectorBreakdown SalePosition",
                "Portfolios RegionalExposure SalePosition",
                "Portfolios Holdings",
                "Portfolios TotalMarketValues SalePosition",
                "RiskAndRating TimePeriod",
                "TrailingPerformance Return Annualized",
                "TrailingPerformance Return Date",
                "TrailingPerformance Return TimePeriod",
                "TrailingPerformance Return Value",
                "TrailingPerformance ReturnType",
                "TrailingPerformance Type",
                "Type",
                "dbgtime"
            ),
            dataSourceFacetDataOrdering: o(

            ),
            dataConfig: {
                facetObjects: o(
                    {
                        uniqueID: "Benchmark Category",
                        name: "Category",
                        defaultFacetType: "MSFacet",
                        tags: o()
                    },
                    {
                        uniqueID: "Benchmark GlobalAssetClassId",
                        name: "Asset Class",
                        tags: o()
                    },
                    {
                        uniqueID: "Benchmark Id",
                        name: "Benchmark ID",
                        tooltipText: "",
                        tags: o()
                    },
                    {
                        uniqueID: "Benchmark Name",
                        tags: o()
                    },
                    {
                        uniqueID: "Benchmark PrimaryBenchmark",
                        name: "Primary Benchmark",
                        tags: o()
                    },
                    {
                        uniqueID: "Benchmark Type",
                        tags: o()
                    },
                    {
                        uniqueID: "BrandingCompanyName",
                        name: "Branding Company",
                        tags: o()
                    },
                    {
                        uniqueID: "Currency Id",
                        name: "Currency",
                        tags: o()
                    },
                    {
                        uniqueID: "Domicile",
                        tags: o()
                    },
                    {
                        uniqueID: "Id",
                        tags: o()
                    },
                    {
                        uniqueID: "InceptionDate",
                        name: "Inception Date",
                        tags: o()
                    },
                    {
                        uniqueID: "Isin",
                        name: "ISIN",
                        tags: o()
                    },
                    {
                        uniqueID: "LastPrice Currency Id",
                        tags: o()
                    },
                    {
                        uniqueID: "LastPrice Date",
                        name: "Last Price Date",
                        tags: o()
                    },
                    {
                        uniqueID: "LastPrice Value",
                        name: "Last Price",
                        tags: o()
                    },
                    {
                        uniqueID: "Name",
                        tags: o()
                    },
                    {
                        uniqueID: "NetAssetValues CurrencyId",
                        name: "NAV (Currency)",
                        tags: o()
                    },
                    {
                        uniqueID: "NetAssetValues DayEndDate",
                        name: "NAV Date (Day)",
                        tags: o()
                    },
                    {
                        uniqueID: "NetAssetValues DayEndValue",
                        name: "NAV (Day)",
                        scaleType: "log",
                        tags: o()
                    },
                    {
                        uniqueID: "NetAssetValues MonthEndDate",
                        name: "NAV Date (Month)",
                        tags: o()
                    },
                    {
                        uniqueID: "NetAssetValues MonthEndValue",
                        name: "NAV (Month)",
                        scaleType: "log",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios Date",
                        name: "Portfolio Date",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios EquityStatistics StyleBox",
                        name: "StyleBox",
                        values: o(
                            "Large Value",
                            "Large Blend",
                            "Large Growth",
                            "Mid Value",
                            "Mid Blend",
                            "Mid Growth",
                            "Small Value",
                            "Small Blend",
                            "Small Growth"
                        ),
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Basic Materials",
                        name: "Basic Materials (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown BreakdownValues Type",
                        name: "Breakdown Values Type (Sector)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown BreakdownValues Value",
                        name: "Breakdown Values Value (Sector)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Communication Services",
                        name: "Communications (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Consumer Cyclical",
                        name: "Consumer Cyclical (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Consumer Defensive",
                        name: "Consumer Defensive (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Energy",
                        name: "Energy (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Financial Services",
                        name: "Financial Services (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Healthcare",
                        name: "Healthcare (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Industrials",
                        name: "Industrial (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown NotClassified",
                        name: "Unclassified (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Real Estate",
                        name: "Real Estate (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown SalePosition",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Technology",
                        name: "Technology (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios GlobalStockSectorBreakdown Utilities",
                        name: "Utilities (Sector)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios HoldingAggregates Bond",
                        name: "Bond (Aggregate Holding)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios HoldingAggregates SalePosition",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios HoldingAggregates Stock",
                        name: "Stock (Aggregate Holding)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios HoldingAggregates Total Portfolio",
                        name: "Total (Aggregate Holding)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios Holdings",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios Id",
                        defaultDataType: fsAppConstants.dataTypeStringLabel,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Africa",
                        name: "Africa (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Asia - Developed",
                        name: "Asia - Developed (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Asia - Emerging",
                        name: "Asia - Emerging (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Australasia",
                        name: "Australasia (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Canada",
                        name: "Canada (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Developed Country",
                        name: "Developed Countries (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Emerging Market",
                        name: "Emerging Markets (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Europe - Emerging",
                        name: "Europe - Emerging (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Europe - ex Euro",
                        name: "Europe ExEuro (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Eurozone",
                        name: "Eurozone (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Japan",
                        name: "Japan (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Latin America",
                        name: "Latin America (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure Middle East",
                        name: "Middle East (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure NotClassified",
                        name: "Unclassified (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure SalePosition",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure United Kingdom",
                        name: "UK (Region)",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios RegionalExposure United States",
                        name: "US (Region)",
                        scaleType: "linearPlusMinus",
                        scaleLinearMaxValue: 100,
                        scaleLinearMinValue: 0,
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios SuppressionExpiration",
                        name: "Suppression Expiration Date",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios TotalMarketValues CurrencyId",
                        name: "Portfolio Market Value Currency",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios TotalMarketValues SalePosition",
                        tags: o()
                    },
                    {
                        uniqueID: "Portfolios TotalMarketValues Value",
                        name: "Portfolio Market Value",
                        tags: o()
                    },
                    {
                        uniqueID: "ProviderCompany Name",
                        name: "Provider",
                        tags: o()
                    },
                    {
                        uniqueID: "RiskAndRating Date",
                        name: "Risk & Rating Date",
                        tags: o()
                    },
                    {
                        uniqueID: "RiskAndRating RatingValue",
                        name: "Rating Value",
                        values: o(
                            "1 Star",
                            "2 Stars",
                            "3 Stars",
                            "4 Stars",
                            "5 Stars"
                        ),
                        tags: o()
                    },
                    {
                        uniqueID: "RiskAndRating TimePeriod",
                        name: "Rating TimePeriod",
                        tags: o()
                    },
                    {
                        uniqueID: "Symbol",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance CurrencyId",
                        name: "Performance Currency",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Date",
                        name: "Performance Date",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return Annualized",
                        name: "Annualized Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return D1",
                        name: "1-Day Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return Date",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return M0",
                        name: "1-Month Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return M12",
                        name: "12-Months Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return M24",
                        name: "24-Months Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return M36",
                        name: "36-Months Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return M60",
                        name: "60-Months Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return TimePeriod",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return Value",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Return W1",
                        name: "1-Week Return",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance ReturnType",
                        tags: o()
                    },
                    {
                        uniqueID: "TrailingPerformance Type",
                        tags: o()
                    },
                    {
                        uniqueID: "Type",
                        tags: o()
                    },
                    {
                        uniqueID: "dbgtime",
                        tags: o()
                    }
                ),
                overlayObjects: o(
                    //{
                    //    uniqueID: [
                    //        getOverlayUniqueID,
                    //        fsAppConstants.defaultFavoritesCounter
                    //    ],
                    // this definition of 'included' will be merged at a higher priority than the default overlay data obj in FSApp.
                    //    included: o("AA", "AAL") // the initial/default values
                    //}
                )
            }
        }
    }
};

