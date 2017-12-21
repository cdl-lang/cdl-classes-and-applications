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


// %%classfile%%: "mainArea.js"

var screenArea = {
    children: {
        mainArea: {
            description: {
                "class": o("MainArea"),
                context: {
                    // ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.csv
                    fileName: "../../../../data/ESIF/ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.csv",
                    uploadedData: [datatable, [{ fileName: _ }, [me]]],
                    topLevelFacetsParams: o(
                        { facetName: "MS", title: "Countries" },
                        //{ facetName: "CCI", title: "CCIs" },
                        { facetName: "Fund", title: "Funds" },
                        { facetName: "Dimension_Type", title: "Dimension Types", width: 130 },
                        { facetName: "TO", title: "TO" },
                        { facetName: "category_of_region", title: "Cat Region", width: 150 }                        
                        //{ facetName: "Priority", title: "Priorities" },
                        //{ facetName: "EU_cofinancing_rate", title: "EU %" }                     
                    ),                    
                    sumFieldsParams: o(
                        { sumFieldName: "Planned_EU_amount", sumFieldTitle: "Planned EU Amount" }
                    )
                    
                }
            }
        }
    }
};

/*
uploadedData: [datatable, "../../../../data/ESIF/ESIF_2014-2020_categorisation_ERDF-ESF-CF_-_planned.csv"],
topLevelFacetsParams: o(
    { facetName: "Ctry Code", title: "Countries" },
    { facetName: "CCI", title: "CCI" },
    { facetName: "Fund", title: "Fund" },
    { facetName: "Category of Region", title: "Cateogory of Region" },
    { facetName: "Dim Type", title: "Dimension Types" },
    //{ facetName: "Dim Cd", title: "Dimension Code" },
    { facetName: "TO Cd", title: "TO Cd" }                                
),
sumFieldName: "EU Amount (€)",

////////////////

uploadedData: [datatable, "../../../../data/ESIF/Total_EU_Allocations_Per_MS_-_Transposed__2014-2020_.csv"],
topLevelFacetsParams: o(
    { facetName: "Member State", title: "Countries" },
    { facetName: "Fund", title: "Fund" }
),
sumFieldName: "Amount (€)",

////////////////

uploadedData: [datatable, "../../../../data/ESIF/ESIF_2014-2020_Finance_Implementation_Details.csv"],
topLevelFacetsParams: o(
    { facetName: "ms", title: "Countries" },
    { facetName: "CCI", title: "CCI" },
    { facetName: "Fund", title: "Fund" },
    { facetName: "TO", title: "TO" },
    { facetName: "year", title: "Year" }                        
),
sumFieldName: "EU_amount",

////////////////

uploadedData: [datatable, "../../../../data/ESIF/ESIF_2014-2020_FINANCES_PLANNED_DETAILS.csv"],
topLevelFacetsParams: o(
    { facetName: "MS", title: "Countries" },
    { facetName: "CCI", title: "CCI" },
    { facetName: "Fund", title: "Fund" },
    { facetName: "TO_code", title: "TO Code" },
    { facetName: "Category of region", title: "Cateogory of Region" }                        
),
sumFieldName: "EU Amount",

////////////////

// dataLoadTest_cat_panned_vs_impl_processed
context: {
    uploadedData: [datatable, "../../../../data/ESIF/ESIF_2014_2020_categorisation_ERDF.json"],
    data: [{ uploadedData: { data: _ } }, [me]],
    //qryToText: [defun, "x", { "#x": _ }],
},
children: {
    rows: {
        data: o(
            {
                text: "sum(FinanceForm[planned_eu_amount])",
                value: [sum,
                    [
                        { FinanceForm: { planned_eu_amount: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[eu_elig_expenditure_declared_fin_data_notional])",
                value: [sum,
                    [
                        { FinanceForm: { eu_elig_expenditure_declared_fin_data_notional: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[eu_eligible_costs_selected_fin_data_notional])",
                value: [sum,
                    [
                        { FinanceForm: { eu_eligible_costs_selected_fin_data_notional: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[planned_total_amount_notional])",
                value: [sum,
                    [
                        { FinanceForm: { planned_total_amount_notional: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[public_eligible_costs_fin_data])",
                value: [sum,
                    [
                        { FinanceForm: { public_eligible_costs_fin_data: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[total_elig_expenditure_declared_fin_data])",
                value: [sum,
                    [
                        { FinanceForm: { total_elig_expenditure_declared_fin_data: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            },
            {
                text: "sum(FinanceForm[total_eligible_costs_selected_fin_data])",
                value: [sum,
                    [
                        { FinanceForm: { total_eligible_costs_selected_fin_data: _ } },
                        [{ data: _ }, [me]]
                    ]
                ]
            }
*/
