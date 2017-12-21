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


var stockAppSchema = {
    StockAppSchema: {
        "class": "PreLoadedApp",
        context: {
            name: "Stock Screener",
            productName: [concatStr, // override default in FSApp
                o(
                    [{ companyName:_ }, [me]],
                    [{ name:_ }, [me]]
                ),
                " "
            ],
            dataSourceProvider: "Sharadar",
            itemUniqueID: "ticker",
            displayedUniqueID: "Name",
            defaultFrozenFacetUniqueIDs: o("ticker", "Name"),
            defaultMovingFacetUniqueIDs: o("Industry", "Market Capitalization (MRT)", "Revenues (MRT)"),
            //defaultLoadedDataSourceName is now defined in PreLoadedApp

            excludedDataSourceFacetUniqueIDs: o(
                "Calendar Date (MRT)", 
                "Calendar Date (MRY)",
                "Calendar Date (MRQ)", 
                "Cash and Equivalents (USD) (MRT)",
                "Cash and Equivalents (USD) (MRY)",
                "Cash and Equivalents (USD) (MRQ)",
                "Date Key (MRT)", 
                "Date Key (MRY)", 
                "Date Key (MRQ)",
                "Delisted From", // has multiple values in some cells
                "Earning Before Interest & Taxes (USD) (MRQ)",
                "Earning Before Interest & Taxes (USD) (MRT)",
                "Earning Before Interest & Taxes (USD) (MRY)",
                "Earnings per Basic Share (USD) (MRQ)",
                "Earnings per Basic Share (USD) (MRT)",
                "Earnings per Basic Share (USD) (MRY)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (USD) (MRQ)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (USD) (MRT)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (USD) (MRY)",
                "Foreign Currency to USD Exchange Rate (MRQ)",
                "Foreign Currency to USD Exchange Rate (MRT)",
                "Foreign Currency to USD Exchange Rate (MRY)",
                "Net Income Common Stock (USD) (MRQ)",
                "Net Income Common Stock (USD) (MRT)",
                "Net Income Common Stock (USD) (MRY)",
                "Shareholders Equity (USD) (MRQ)",
                "Shareholders Equity (USD) (MRT)",
                "Shareholders Equity (USD) (MRY)",
                "Share Factor (MRQ)",
                "Share Factor (MRT)",
                "Share Factor (MRY)",
                "Revenues (USD) (MRQ)",
                "Revenues (USD) (MRT)",
                "Revenues (USD) (MRY)",
                "Total Debt (USD) (MRQ)",
                "Total Debt (USD) (MRT)",
                "Total Debt (USD) (MRY)"
            ),

            // dataSourceFacetDataOrdering can be an ordering of a subset - what is left out will be sorted by default by the order in which it appears in the database.
            dataSourceFacetDataOrdering: o(
                // metrics & ratios:
                "Sector",
                "Industry",
                "Market Capitalization (MRT)",
                "Market Capitalization (MRY)",
                "Market Capitalization (MRQ)",
                "Share Price (Adjusted Close) (MRT)",
                "Share Price (Adjusted Close) (MRY)",
                "Share Price (Adjusted Close) (MRQ)",
                "Gross Margin (MRT)",
                "Gross Margin (MRY)",
                "Gross Margin (MRQ)",
                "Profit Margin (MRT)",
                "Profit Margin (MRY)",
                "Profit Margin (MRQ)",
                "EBITDA Margin (MRT)",
                "EBITDA Margin (MRY)",
                "EBITDA Margin (MRQ)",
                "Current Ratio (MRT)", 
                "Current Ratio (MRY)", 
                "Current Ratio (MRQ)",
                "Price to Earnings Ratio (MRT)", 
                "Price to Earnings Ratio (MRY)", 
                "Price to Earnings Ratio (MRQ)", 
                "Price Earnings (Damodaran Method) (MRT)",
                "Price Earnings (Damodaran Method) (MRY)",
                "Price Earnings (Damodaran Method) (MRQ)", 
                "Price to Sales Ratio (MRT)", 
                "Price to Sales Ratio (MRY)", 
                "Price to Sales Ratio (MRQ)", 
                "Price Sales (Damodaran Method) (MRT)", 
                "Price Sales (Damodaran Method) (MRY)", 
                "Price Sales (Damodaran Method) (MRQ)", 
                "Debt to Equity Ratio (MRT)", 
                "Debt to Equity Ratio (MRY)", 
                "Debt to Equity Ratio (MRQ)", 
                "Enterprise Value (MRT)", 
                "Enterprise Value (MRY)", 
                "Enterprise Value (MRQ)", 
                "Enterprise Value over EBIT (MRT)", 
                "Enterprise Value over EBIT (MRY)", 
                "Enterprise Value over EBIT (MRQ)", 
                "Enterprise Value over EBITDA (MRT)", 
                "Enterprise Value over EBITDA (MRY)", 
                "Enterprise Value over EBITDA (MRQ)", 
                "Price to Book Value (MRT)", 
                "Price to Book Value (MRY)", 
                "Price to Book Value (MRQ)",
                "Return on Sales (MRT)", 
                "Return on Sales (MRQ)", 
                "Return on Average Assets (MRT)", 
                "Return on Average Assets (MRY)", 
                "Return on Average Equity (MRT)", 
                "Return on Average Equity (MRY)", 
                "Return on Invested Capital (MRT)", 
                "Return on Invested Capital (MRY)", 
                "Earnings per Basic Share (MRT)", 
                "Earnings per Basic Share (MRY)", 
                "Earnings per Basic Share (MRQ)",
                "Earnings per Diluted Share (MRT)",
                "Earnings per Diluted Share (MRY)",
                "Earnings per Diluted Share (MRQ)",
                "Book Value per Share (MRT)", 
                "Book Value per Share (MRY)", 
                "Book Value per Share (MRQ)",
                "Sales per Share (MRT)",
                "Sales per Share (MRY)",
                "Sales per Share (MRQ)",
                "Dividend Yield (MRT)", 
                "Dividend Yield (MRY)", 
                "Dividend Yield (MRQ)", 
                "Weighted Average Shares (MRT)", 
                "Weighted Average Shares (MRY)",
                "Weighted Average Shares (MRQ)",
                "Weighted Average Shares Diluted (MRT)", 
                "Weighted Average Shares Diluted (MRY)",
                "Weighted Average Shares Diluted (MRQ)",
                "Tangible Assets Book Value per Share (MRT)", 
                "Tangible Assets Book Value per Share (MRY)", 
                "Tangible Assets Book Value per Share (MRQ)",
                "Asset Turnover (MRT)", 
                "Asset Turnover (MRY)", 
                "Average Assets (MRT)", 
                "Average Assets (MRY)", 
                "Average Equity (MRT)", 
                "Average Equity (MRY)", 
                "Payout Ratio (MRT)",
                "Payout Ratio (MRY)",
                "Payout Ratio (MRQ)",

                // balance sheet facets
                "Total Assets (MRT)",
                "Total Assets (MRY)",
                "Total Assets (MRQ)",
                "Current Assets (MRT)",
                "Current Assets (MRY)",
                "Current Assets (MRQ)",
                "Trade and Non-Trade Receivables (MRT)",
                "Trade and Non-Trade Receivables (MRY)",
                "Trade and Non-Trade Receivables (MRQ)",
                "Cash and Equivalents (MRT)",
                "Cash and Equivalents (MRY)",
                "Cash and Equivalents (MRQ)",
                "Tangible Asset Value (MRT)",
                "Tangible Asset Value (MRY)",
                "Tangible Asset Value (MRQ)",
                "Inventory (MRT)",
                "Inventory (MRY)",
                "Inventory (MRQ)",
                "Deferred Revenue (MRT)",
                "Deferred Revenue (MRY)",
                "Deferred Revenue (MRQ)",
                "Accumulated Retained Earnings (Deficit) (MRT)",
                "Accumulated Retained Earnings (Deficit) (MRY)",
                "Accumulated Retained Earnings (Deficit) (MRQ)",
                "Assets Non-Current (MRT)",
                "Assets Non-Current (MRY)",
                "Assets Non-Current (MRQ)",
                "Investments (MRT)",
                "Investments (MRY)",
                "Investments (MRQ)",
                "Property, Plant & Equipment Net (MRT)",
                "Property, Plant & Equipment Net (MRY)",
                "Property, Plant & Equipment Net (MRQ)",
                "Goodwill and Intangible Assets (MRT)",
                "Goodwill and Intangible Assets (MRY)",
                "Goodwill and Intangible Assets (MRQ)",
                "Accumulated Other Comprehensive Income (MRT)",
                "Accumulated Other Comprehensive Income (MRY)",
                "Accumulated Other Comprehensive Income (MRQ)",
                "Investments Current (MRT)",
                "Investments Current (MRY)",
                "Investments Current (MRQ)",
                "Investments Non-Current (MRT)",
                "Investments Non-Current (MRY)",
                "Investments Non-Current (MRQ)",
                "Invested Capital Average (MRT)",
                "Invested Capital Average (MRY)",
                "Invested Capital (MRY)",
                "Invested Capital (MRQ)",
                "Tax Assets (MRT)",
                "Tax Assets (MRY)",
                "Tax Assets (MRQ)",
                "Total Liabilities (MRT)",
                "Total Liabilities (MRY)",
                "Total Liabilities (MRQ)",
                "Current Liabilities (MRT)",
                "Current Liabilities (MRY)",
                "Current Liabilities (MRQ)",
                "Trade and Non-Trade Payables (MRT)",
                "Trade and Non-Trade Payables (MRY)",
                "Trade and Non-Trade Payables (MRQ)",
                "Deposit Liabilities (MRT)",
                "Deposit Liabilities (MRY)",
                "Deposit Liabilities (MRQ)",
                "Liabilities Non-Current (MRT)",
                "Liabilities Non-Current (MRY)",
                "Liabilities Non-Current (MRQ)",
                "Total Debt (MRT)",
                "Total Debt (MRY)",
                "Total Debt (MRQ)",
                "Debt Current (MRT)",
                "Debt Current (MRY)",
                "Debt Current (MRQ)",
                "Debt Non-Current (MRT)",
                "Debt Non-Current (MRY)",
                "Debt Non-Current (MRQ)",
                "Tax Liabilities (MRT)",
                "Tax Liabilities (MRY)",
                "Tax Liabilities (MRQ)",
                "Working Capital (MRT)",
                "Working Capital (MRY)",
                "Working Capital (MRQ)",
                "Shareholders Equity (MRT)",
                "Shareholders Equity (MRY)",
                "Shareholders Equity (MRQ)",

                // income statement facets
                "Revenues (MRT)",
                "Revenues (MRY)",
                "Revenues (MRQ)",
                "Cost of Revenue (MRT)",
                "Cost of Revenue (MRY)",
                "Cost of Revenue (MRQ)",
                "Operating Income (MRT)",
                "Operating Income (MRY)",
                "Operating Income (MRQ)",
                "Operating Expenses (MRT)",
                "Operating Expenses (MRY)",
                "Operating Expenses (MRQ)",
                "Selling, General and Administrative Expense (MRT)",
                "Selling, General and Administrative Expense (MRY)",
                "Selling, General and Administrative Expense (MRQ)",
                "Research and Development Expense (MRT)",
                "Research and Development Expense (MRY)",
                "Research and Development Expense (MRQ)",
                "Depreciation, Amortization & Accretion (MRT)",
                "Depreciation, Amortization & Accretion (MRY)",
                "Depreciation, Amortization & Accretion (MRQ)",
                "Interest Expense (MRT)",
                "Interest Expense (MRY)",
                "Interest Expense (MRQ)",
                "Income Tax Expense (MRT)",
                "Income Tax Expense (MRY)",
                "Income Tax Expense (MRQ)",
                "Gross Profit (MRT)",
                "Gross Profit (MRY)",
                "Gross Profit (MRQ)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRT)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRY)",
                "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRQ)",
                "Earning Before Interest & Taxes (EBIT) (MRT)",
                "Earning Before Interest & Taxes (EBIT) (MRY)",
                "Earning Before Interest & Taxes (EBIT) (MRQ)",
                "Earnings before Tax (MRT)",
                "Earnings before Tax (MRY)",
                "Earnings before Tax (MRQ)",
                "Consolidated Income (MRT)",
                "Consolidated Income (MRY)",
                "Consolidated Income (MRQ)",
                "Net Income (MRT)",
                "Net Income (MRY)",
                "Net Income (MRQ)",
                "Net Income to Non-Controlling Interests (MRT)",
                "Net Income to Non-Controlling Interests (MRY)",
                "Net Income to Non-Controlling Interests (MRQ)",
                "Net Income from Discontinued Operations (MRT)",
                "Net Income from Discontinued Operations (MRY)",
                "Net Income from Discontinued Operations (MRQ)",
                "Net Income Common Stock (MRT)",
                "Net Income Common Stock (MRY)",
                "Net Income Common Stock (MRQ)",
                "Preferred Dividends Income Statement Impact (MRT)",
                "Preferred Dividends Income Statement Impact (MRY)",
                "Preferred Dividends Income Statement Impact (MRQ)",

                // cashflow facets
                "Free Cash Flow (MRT)",
                "Free Cash Flow (MRY)",
                "Free Cash Flow (MRQ)",
                "Capital Expenditure (MRT)", 
                "Capital Expenditure (MRY)",
                "Capital Expenditure (MRQ)",
                "Share Based Compensation (MRT)", 
                "Share Based Compensation (MRY)",
                "Share Based Compensation (MRQ)",
                "Free Cash Flow per Share (MRT)", 
                "Free Cash Flow per Share (MRY)",
                "Free Cash Flow per Share (MRQ)",
                "Dividends per Basic Common Share (MRT)", 
                "Dividends per Basic Common Share (MRY)",
                "Dividends per Basic Common Share (MRQ)",
                "Payment of Dividends & Other Cash Distributions    (MRT)", 
                "Payment of Dividends & Other Cash Distributions    (MRY)",
                "Payment of Dividends & Other Cash Distributions    (MRQ)",
                "Net Cash Flow from Financing (MRT)", 
                "Net Cash Flow from Financing (MRY)",
                "Net Cash Flow from Financing (MRQ)",
                "Net Cash Flow from Investing (MRT)",
                "Net Cash Flow from Investing (MRY)",
                "Net Cash Flow from Investing (MRQ)",
                "Net Cash Flow from Operations (MRT)", 
                "Net Cash Flow from Operations (MRY)",
                "Net Cash Flow from Operations (MRQ)",
                "Net Cash Flow - Business Acquisitions and Disposals (MRT)", 
                "Net Cash Flow - Business Acquisitions and Disposals (MRY)", 
                "Net Cash Flow - Business Acquisitions and Disposals (MRQ)",
                "Net Cash Flow - Investment Acquisitions and Disposals (MRT)", 
                "Net Cash Flow - Investment Acquisitions and Disposals (MRY)", 
                "Net Cash Flow - Investment Acquisitions and Disposals (MRQ)",
                "Net Cash Flow / Change in Cash & Cash Equivalents (MRT)",
                "Net Cash Flow / Change in Cash & Cash Equivalents (MRY)",
                "Net Cash Flow / Change in Cash & Cash Equivalents (MRQ)", 
                "Effect of Exchange Rate Changes on Cash  (MRT)", 
                "Effect of Exchange Rate Changes on Cash  (MRY)",
                "Effect of Exchange Rate Changes on Cash  (MRQ)",

                "Shares (Basic) (MRT)",
                "Shares (Basic) (MRY)",
                "Shares (Basic) (MRQ)",
                "Issuance (Purchase) of Equity Shares (MRT)",
                "Issuance (Purchase) of Equity Shares (MRY)",
                "Issuance (Purchase) of Equity Shares (MRQ)",
                "Issuance (Repayment) of Debt Securities  (MRT)",
                "Issuance (Repayment) of Debt Securities  (MRY)",
                "Issuance (Repayment) of Debt Securities  (MRQ)",
                "Exchange",
                "SIC",
                "Currency",
                "Location",
                "CUSIP",
                "Prior Tickers",
                "Ticker Change Date",
                "Related Tickers",
                "Is Foreign",
                "Last Updated Date (MRT)", 
                "Last Updated Date (MRY)", 
                "Last Updated Date (MRQ)", 
                "Report Period (MRT)", 
                "Report Period (MRY)",
                "Report Period (MRQ)"                
            ),
            dataConfig: {
                // sort these objects alphabetically by the uniqueID, to ensure there are no duplicate objects referring to the same facet!
                facetObjects: o(
                    {
                        uniqueID: "Accumulated Other Comprehensive Income (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Accumulated Other Comprehensive Income (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Accumulated Other Comprehensive Income (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Accumulated Retained Earnings (Deficit) (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Accumulated Retained Earnings (Deficit) (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Accumulated Retained Earnings (Deficit) (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Assets Non-Current (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Assets Non-Current (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Assets Non-Current (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Asset Turnover (MRT)",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Asset Turnover (MRY)",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Average Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Average Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Average Equity (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Average Equity (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Book Value per Share (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Book Value per Share (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Book Value per Share (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Capital Expenditure (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Capital Expenditure (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Capital Expenditure (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Cash and Equivalents (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Cash and Equivalents (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Cash and Equivalents (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Consolidated Income (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Consolidated Income (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Consolidated Income (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Cost of Revenue (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Cost of Revenue (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Cost of Revenue (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Current Assets (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Liabilities (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Liabilities (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Liabilities (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Current Ratio (MRQ)",
                        scaleType: "linearPlus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Current Ratio (MRT)",
                        scaleType: "linearPlus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Current Ratio (MRY)",
                        scaleType: "linearPlus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "CUSIP",
                        defaultDataType: fsAppConstants.dataTypeStringLabel
                    },
                    {
                        uniqueID: "Debt Current (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt Current (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt Current (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt Non-Current (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt Non-Current (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt Non-Current (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Debt to Equity Ratio (MRQ)",
                        name: "Debt/Equity Ratio (MRQ)",
                        scaleType: "linearPlusMinus",
                        initUserScaleLinearMinValue: 0,
                        initUserScaleLinearMaxValue: 5,
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Debt to Equity Ratio (MRT)",
                        name: "Debt/Equity Ratio (MRT)",
                        scaleType: "linearPlusMinus",
                        initUserScaleLinearMinValue: 0,
                        initUserScaleLinearMaxValue: 5,
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Debt to Equity Ratio (MRY)",
                        name: "Debt/Equity Ratio (MRY)",
                        scaleType: "linearPlusMinus",
                        initUserScaleLinearMinValue: 0,
                        initUserScaleLinearMaxValue: 5,
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Deferred Revenue (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Deferred Revenue (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Deferred Revenue (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Deposit Liabilities (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Deposit Liabilities (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Deposit Liabilities (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Depreciation, Amortization & Accretion (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Depreciation, Amortization & Accretion (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Depreciation, Amortization & Accretion (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Dividends per Basic Common Share (MRQ)",
                        scaleType: "linearPlus",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Dividends per Basic Common Share (MRT)",
                        scaleType: "linearPlus",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Dividends per Basic Common Share (MRY)",
                        scaleType: "linearPlus",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Dividend Yield (MRQ)",
                        scaleType: "linearPlus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Dividend Yield (MRT)",
                        scaleType: "linearPlus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Dividend Yield (MRY)",
                        scaleType: "linearPlus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRQ)",
                        name: "EBITDA (MRQ)",
                        tooltipText: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRT)",
                        name: "EBITDA (MRT)",
                        tooltipText: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRY)",
                        name: "EBITDA (MRY)",
                        tooltipText: "Earnings Before Interest, Taxes & Depreciation Amortization (EBITDA) (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Earning Before Interest & Taxes (EBIT) (MRQ)",
                        name: "EBIT (MRQ)",
                        tooltipText: "Earning Before Interest & Taxes (EBIT) (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Earning Before Interest & Taxes (EBIT) (MRT)",
                        name: "EBIT (MRT)",
                        tooltipText: "Earning Before Interest & Taxes (EBIT) (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Earning Before Interest & Taxes (EBIT) (MRY)",
                        name: "EBIT (MRY)",
                        tooltipText: "Earning Before Interest & Taxes (EBIT) (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings before Tax (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings before Tax (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings before Tax (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Earnings per Basic Share (MRQ)",
                        name: "EPS (MRQ)",
                        tooltipText: "Earnings per Basic Share (MRQ)",
                        scaleType: "linearPlus",
                        initUserScaleMinValue: 0,
                        initUserScaleLinearMaxValue: 10,
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Earnings per Basic Share (MRT)",
                        name: "EPS (MRT)",
                        tooltipText: "Earnings per Basic Share (MRT)",
                        scaleType: "linearPlus",
                        initUserScaleMinValue: 0,
                        initUserScaleLinearMaxValue: 10,
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Earnings per Basic Share (MRY)",
                        name: "EPS (MRY)",
                        tooltipText: "Earnings per Basic Share (MRY)",
                        scaleType: "linearPlus",
                        initUserScaleMinValue: 0,
                        initUserScaleLinearMaxValue: 10,
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Earnings per Diluted Share (MRQ)",
                        name: "Diluted EPS (MRQ)",
                        tooltipText: "Earnings per Diluted Share (MRQ)",
                        scaleType: "linearPlus",
                        initUserScaleLinearMinValue: -10,
                        initUserScaleLinearMaxValue: 10,
                        initUserScaleMinValue: -1000,
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Earnings per Diluted Share (MRT)",
                        name: "Diluted EPS (MRT)",
                        tooltipText: "Earnings per Diluted Share (MRT)",
                        scaleType: "linearPlus",
                        initUserScaleLinearMinValue: -10,
                        initUserScaleLinearMaxValue: 10,
                        initUserScaleMinValue: -1000,
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Earnings per Diluted Share (MRY)",
                        name: "Diluted EPS (MRY)",
                        tooltipText: "Earnings per Diluted Share (MRY)",
                        scaleType: "linearPlus",
                        initUserScaleLinearMinValue: -10,
                        initUserScaleLinearMaxValue: 10,
                        initUserScaleMinValue: -1000,
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "EBITDA Margin (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "EBITDA Margin (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "EBITDA Margin (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Effect of Exchange Rate Changes on Cash  (MRQ)",
                        name: "Effect of Exchange Rate Changes on Cash (MRQ)", // redundant spacing in db
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Effect of Exchange Rate Changes on Cash  (MRT)",
                        name: "Effect of Exchange Rate Changes on Cash (MRT)", // redundant spacing in db
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Effect of Exchange Rate Changes on Cash  (MRY)",
                        name: "Effect of Exchange Rate Changes on Cash (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Enterprise Value (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBIT (MRQ)",
                        name: "Enterprise Value/EBIT (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBIT (MRT)",
                        name: "Enterprise Value/EBIT (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBIT (MRY)",
                        name: "Enterprise Value/EBIT (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBITDA (MRQ)",
                        name: "Enterprise Value/EBITDA (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBITDA (MRT)",
                        name: "Enterprise Value/EBITDA (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Enterprise Value over EBITDA (MRY)",
                        name: "Enterprise Value/EBITDA (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "FAMA Industry"
                    },
                    {
                        uniqueID: "Free Cash Flow (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Free Cash Flow (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Free Cash Flow (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Free Cash Flow per Share (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Free Cash Flow per Share (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Free Cash Flow per Share (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Goodwill and Intangible Assets (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Goodwill and Intangible Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Goodwill and Intangible Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Gross Margin (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Gross Margin (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Gross Margin (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Gross Profit (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Gross Profit (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Gross Profit (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Income Tax Expense (MRQ)",
                        scaleType: "log",
                        defaultHistogramScaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Income Tax Expense (MRT)",
                        scaleType: "log",
                        defaultHistogramScaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Income Tax Expense (MRY)",
                        scaleType: "log",
                        defaultHistogramScaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Industry",
                        defaultFacetType: "MSFacet",
                        tags: o("Favorites", "Metrics")
                    },
                    {
                        uniqueID: "Interest Expense (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Interest Expense (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Interest Expense (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Inventory (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Inventory (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Inventory (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Invested Capital Average (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Invested Capital Average (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Invested Capital (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Invested Capital (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Current (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Current (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Current (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Non-Current (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Non-Current (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Investments Non-Current (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Is Foreign",
                        name: "Foreign"
                    },
                    {
                        uniqueID: "Issuance (Purchase) of Equity Shares (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ")
                    },
                    {
                        uniqueID: "Issuance (Purchase) of Equity Shares (MRT)",
                        scaleType: "log",
                        tags: o("MRT")
                    },
                    {
                        uniqueID: "Issuance (Purchase) of Equity Shares (MRY)",
                        scaleType: "log",
                        tags: o("MRY")                        
                    },
                    {
                        uniqueID: "Issuance (Repayment) of Debt Securities  (MRQ)",
                        name: "Issuance (Repayment) of Debt Securities (MRQ)", // database has redundant spacing...
                        scaleType: "log",
                        tags: o("MRQ")                        
                    },
                    {
                        uniqueID: "Issuance (Repayment) of Debt Securities  (MRT)",
                        name: "Issuance (Repayment) of Debt Securities (MRT)", // database has redundant spacing...
                        scaleType: "log",
                        tags: o("MRT")                        
                    },
                    {
                        uniqueID: "Issuance (Repayment) of Debt Securities  (MRY)",
                        name: "Issuance (Repayment) of Debt Securities (MRY)", // database has redundant spacing...
                        scaleType: "log",
                        tags: o("MRY")                        
                    },
                    {
                        uniqueID: "Liabilities Non-Current (MRQ)",
                        name: "Liabilities (Non-Current) (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Liabilities Non-Current (MRT)",
                        name: "Liabilities (Non-Current) (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Liabilities Non-Current (MRY)",
                        name: "Liabilities (Non-Current) (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Market Capitalization (MRQ)",
                        name: "Market Cap (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Market Capitalization (MRT)",
                        name: "Market Cap (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Favorites", "Metrics")
                    },
                    {
                        uniqueID: "Market Capitalization (MRY)",
                        name: "Market Cap (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "mrydate",
                        name: "MRY Date"
                    },
                    {
                        uniqueID: "Net Cash Flow from Financing (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Financing (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Financing (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Investing (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Investing (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Investing (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Operations (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Operations (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow from Operations (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow / Change in Cash & Cash Equivalents (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow / Change in Cash & Cash Equivalents (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow / Change in Cash & Cash Equivalents (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Business Acquisitions and Disposals (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Business Acquisitions and Disposals (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Business Acquisitions and Disposals (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Investment Acquisitions and Disposals (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Investment Acquisitions and Disposals (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Cash Flow - Investment Acquisitions and Disposals (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Net Income Common Stock (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income Common Stock (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income Common Stock (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income from Discontinued Operations (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income from Discontinued Operations (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income from Discontinued Operations (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income to Non-Controlling Interests (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income to Non-Controlling Interests (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income to Non-Controlling Interests (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Net Income (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Expenses (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Expenses (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Expenses (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Income (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Income (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Operating Income (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Payment of Dividends & Other Cash Distributions    (MRQ)",
                        name: "Payment of Dividends & Other Cash Distributions (MRQ)",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Payment of Dividends & Other Cash Distributions    (MRT)",
                        name: "Payment of Dividends & Other Cash Distributions (MRT)",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Payment of Dividends & Other Cash Distributions    (MRY)",
                        name: "Payment of Dividends & Other Cash Distributions (MRY)",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Payout Ratio (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Payout Ratio (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Payout Ratio (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Perma Ticker",
                        name: "Permanent Ticker",
                        defaultFacetType: "ItemValues",
                        defaultDataType: fsAppConstants.dataTypeStringLabel
                    },
                    {
                        uniqueID: "Preferred Dividends Income Statement Impact (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Preferred Dividends Income Statement Impact (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Preferred Dividends Income Statement Impact (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Price Earnings (Damodaran Method) (MRQ)",
                        name: "Price/Earnings Ratio (Damodaran Method) (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Price Earnings (Damodaran Method) (MRT)",
                        name: "Price/Earnings Ratio (Damodaran Method) (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Price Earnings (Damodaran Method) (MRY)",
                        name: "Price/Earnings Ratio (Damodaran Method) (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Price Sales (Damodaran Method) (MRQ)",
                        name: "Price/Sales Ratio (Damodaran Method) (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Price Sales (Damodaran Method) (MRT)",
                        name: "Price/Sales Ratio (Damodaran Method) (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Price Sales (Damodaran Method) (MRY)",
                        name: "Price/Sales Ratio (Damodaran Method) (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Price to Book Value (MRQ)",
                        name: "Price/Book Ratio (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Price to Book Value (MRT)",
                        name: "Price/Book Ratio (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Price to Book Value (MRY)",
                        name: "Price/Book Ratio (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Price to Earnings Ratio (MRQ)",
                        name: "Price/Earnings Ratio (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Price to Earnings Ratio (MRT)",
                        name: "Price/Earnings Ratio (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Price to Earnings Ratio (MRY)",
                        name: "Price/Earnings Ratio (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Price to Sales Ratio (MRQ)",
                        name: "Price/Sales Ratio (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Price to Sales Ratio (MRT)",
                        name: "Price/Sales Ratio (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Price to Sales Ratio (MRY)",
                        name: "Price/Sales Ratio (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },                    
                    {
                        uniqueID: "Prior Tickers",
                        defaultFacetType: "MSFacet"
                    },
                    {
                        uniqueID: "Profit Margin (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Profit Margin (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Profit Margin (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Property, Plant & Equipment Net (MRQ)",
                        name: "PP&E Net (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Property, Plant & Equipment Net (MRT)",
                        name: "PP&E Net (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Property, Plant & Equipment Net (MRY)",
                        name: "PP&E Net (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Related Tickers",
                        defaultFacetType: "MSFacet"
                    },
                    {
                        uniqueID: "Research and Development Expense (MRQ)",
                        name: "R&D Expense (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Research and Development Expense (MRT)",
                        name: "R&D Expense (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Research and Development Expense (MRY)",
                        name: "R&D Expense (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Return on Average Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Return on Average Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Return on Average Equity (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Return on Average Equity (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Return on Invested Capital (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Return on Invested Capital (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Return on Sales (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Return on Sales (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Revenues (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Revenues (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Revenues (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Sales per Share (MRQ)",
                        name: "Sales/Share (MRQ)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Sales per Share (MRT)",
                        name: "Sales/Share (MRT)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Sales per Share (MRY)",
                        name: "Sales/Share (MRY)",
                        scaleType: "linearPlusMinus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Sector",
                        tags: o()
                    },
                    {
                        uniqueID: "Selling, General and Administrative Expense (MRQ)",
                        name: "SG&A Expense (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Income Statement")
                    },
                    {
                        uniqueID: "Selling, General and Administrative Expense (MRT)",
                        name: "SG&A Expense (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Income Statement")
                    },
                    {
                        uniqueID: "Selling, General and Administrative Expense (MRY)",
                        name: "SG&A Expense (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Income Statement")
                    },
                    {
                        uniqueID: "Share Based Compensation (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Cash Flow")
                    },
                    {
                        uniqueID: "Share Based Compensation (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Cash Flow")
                    },
                    {
                        uniqueID: "Share Based Compensation (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Cash Flow")
                    },
                    {
                        uniqueID: "Share Price (Adjusted Close) (MRQ)",
                        name: "Price (MRQ)",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Share Price (Adjusted Close) (MRT)",
                        name: "Price (MRT)",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Share Price (Adjusted Close) (MRY)",
                        name: "Price (MRY)",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Shareholders Equity (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Shareholders Equity (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Shareholders Equity (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Shares (Basic) (MRQ)",
                        tags: "MRQ"
                    },
                    {
                        uniqueID: "Shares (Basic) (MRT)",
                        tags: "MRT"
                    },
                    {
                        uniqueID: "Shares (Basic) (MRY)",
                        tags: "MRY"
                    },
                    {
                        uniqueID: "SIC",
                        defaultDataType: fsAppConstants.dataTypeStringLabel
                    },
                    {
                        uniqueID: "Tangible Asset Value (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tangible Asset Value (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tangible Asset Value (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tangible Assets Book Value per Share (MRQ)",
                        scaleType: "linearPlus",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Tangible Assets Book Value per Share (MRT)",
                        scaleType: "linearPlus",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Tangible Assets Book Value per Share (MRY)",
                        scaleType: "linearPlus",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Tax Assets (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tax Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tax Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tax Liabilities (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tax Liabilities (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Tax Liabilities (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "ticker",
                        name: "Ticker",
                        defaultPrefixURL: "http://finance.yahoo.com/quote/"
                        //tooltipText: "ABC"
                    },
                    {
                        uniqueID: "Ticker Change Date",
                        defaultFacetType: "MSFacet"
                    },
                    {
                        uniqueID: "Total Assets (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Assets (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Assets (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Debt (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Debt (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Debt (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Liabilities (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Liabilities (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Total Liabilities (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Payables (MRQ)",
                        name: "A/P (MRQ)",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Payables (MRT)",
                        name: "A/P (MRT)",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Payables (MRY)",
                        name: "A/P (MRY)",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Receivables (MRQ)",
                        name: "A/R (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Receivables (MRT)",
                        name: "A/R (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Trade and Non-Trade Receivables (MRY)",
                        name: "A/R (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    },
                    {
                        uniqueID: "Weighted Average Shares (MRQ)",
                        name: "Weighted Avg. Shares (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Weighted Average Shares (MRT)",
                        name: "Weighted Avg. Shares (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Weighted Average Shares (MRY)",
                        name: "Weighted Avg. Shares (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Weighted Average Shares Diluted (MRQ)",
                        name: "Diluted Weighted Avg. Shares (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Metrics")
                    },
                    {
                        uniqueID: "Weighted Average Shares Diluted (MRT)",
                        name: "Diluted Weighted Avg. Shares (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Metrics")
                    },
                    {
                        uniqueID: "Weighted Average Shares Diluted (MRY)",
                        name: "Diluted Weighted Avg. Shares (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Metrics")
                    },
                    {
                        uniqueID: "Working Capital (MRQ)",
                        scaleType: "log",
                        tags: o("MRQ", "Balance Sheet")
                    },
                    {
                        uniqueID: "Working Capital (MRT)",
                        scaleType: "log",
                        tags: o("MRT", "Balance Sheet")
                    },
                    {
                        uniqueID: "Working Capital (MRY)",
                        scaleType: "log",
                        tags: o("MRY", "Balance Sheet")
                    }
                ),

                overlayObjects: o(
                    {
                        uniqueID: [
                            getOverlayUniqueID,
                            fsAppConstants.defaultFavoritesCounter
                        ],
                        // this definition of 'included' will be merged at a higher priority than the default overlay data obj in FSApp.
                        included: o("AA", "AAL") // the initial/default values
                    }
                )
            }
        }
    }
};
