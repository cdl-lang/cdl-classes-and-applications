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
                    //ESIF_2014_2020_categorisation_ERDF.json
                    fileName: "../../../../data/ESIF/ESIF_2014_2020_categorisation_ERDF.json",
                    uploadedData: [datatable, [{ fileName: _ }, [me]]],
                    topLevelFacetsParams: o(
                        { facetName: "fund", title: "Funds" },
                        { facetName: "category_of_region", title: "Cat Region", width: 140 }
                    ),
                    firstLevelFacetsParams: o(
                        { 
                            primaryKey: "Economic Activity", title: "Economic Activity",
                            subFacetsParams: o(
                                { facetName: "ms", title: "Country" },
                                { facetName: "to", title: "TO" }
                            )
                        },                        
                        {
                            primaryKey: "Territory", title: "Territory",
                            subFacetsParams: o(
                                { facetName: "dimension_title", title: "Type" },
                                { facetName: "programme_version", title: "V" }
                            )
                        }
                        /*{
                            primaryKey: "FinanceForm", title: "Finance Form",
                            subFacetsParams: o(
                                { facetName: "ms", title: "Country" },
                                { facetName: "to", title: "TO" }
                            )
                        }*/
                    ),
                    sumFieldsParams: o(
                        { sumFieldPrimaryKey: "Economic Activity", sumFieldName: "total_eligible_costs_selected_fin_data", sumFieldTitle: "Total Eligible Cost" },
                        { sumFieldPrimaryKey: "Territory", sumFieldName: "planned_eu_amount", sumFieldTitle: "Planned EU Amount" },
                        { sumFieldPrimaryKey: "Territory", sumFieldName: "planned_total_amount_notional", sumFieldTitle: "Planned TOTAL Amount Notional" }
                    )
                }
            }
        }
    }
};

