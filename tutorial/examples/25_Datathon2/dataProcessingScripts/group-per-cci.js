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

/* 
{"category_of_region":"More developed",
 "cci":"2014AT05SFOP001",
 "dimension_code":"02",
 "dimension_title":"Small Urban areas (intermediate density >5 000 population)",
 "dimension_type":"Territory",
 "eu_cofinancing_rate":"50.00",
 "financial_data_version":"201701.0",
 "fund":"ESF",
 "ms":"AT",
 "planned_eu_amount":"3078584.00",
 "planned_total_amount_notional":"6157168.00",
 "priority":"1",
 "programme_version":"1.3",
 "queried_fin_data_version":"201701",
 "title":"Employment Austria - ESF"
 }
 {"category_of_region":"More developed",
  "cci":"2014AT05SFOP001",
  "dimension_code":"21",
  "dimension_title":"Social work activities, community, social and personal servi",
  "dimension_type":"Economic Activity",
  "eu_cofinancing_rate":"50.00",
  "eu_elig_expenditure_declared_fin_data_notional":"0.00",
  "eu_eligible_costs_selected_fin_data_notional":"1150000.00",
  "financial_data_version":"201701.0",
  "fund":"ESF",
  "ms":"AT",
  "priority":"1",
  "programme_version":"1.3",
  "public_eligible_costs_fin_data":"2300000.00",
  "queried_fin_data_version":"201701",
  "title":"Employment Austria - ESF",
  "to":"08",
  "total_elig_expenditure_declared_fin_data":"0.00",
  "total_eligible_costs_selected_fin_data":"2300000.00"
  }
*/

let fs = require('fs');
let planned_vs_implemented = JSON.parse(fs.readFileSync("ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.api.json").toString());
let details = JSON.parse(fs.readFileSync("ESIF_2014-2020_FINANCES_PLANNED_DETAILS.json").toString());
// let cci = JSON.parse(fs.readFileSync("cci_lookup_table.json").toString());
// let payments = JSON.parse(fs.readFileSync("payments_daily_update.json").toString());

function tryNum(v) {
    if (v === undefined || v === null) {
        return v;
    }
    let n = Number(v);
    return isNaN(n)? v: n;
}

function lookUpTO(pvi) {
    if (pvi.to !== "MULTI") {
        return tryNum(pvi.to);
    }
    var toDetails = details.filter(
        detail => detail.cci == pvi.cci && detail.fund == pvi.fund &&
                  detail.category_of_region == pvi.category_of_region &&
                  detail.priority == pvi.priority);
    if (toDetails.length === 0) {
        throw "EMPTY TO: " + JSON.stringify(pvi);
    }
    return toDetails.map(detail => detail.to_code);
}

function groupDataPerCCIPriorityCategoryofregionFund() {
    let m = new Map();
    let arr = [];

    for (let i = 0; i < planned_vs_implemented.length; i++) {
        let pvi_i = planned_vs_implemented[i];
        let key = pvi_i.cci + "|" + pvi_i.fund + pvi_i.category_of_region + "|" + pvi_i.priority + "|";
        let rec = m.get(key);
        if (rec === undefined) {
            rec = {
                cci: pvi_i.cci,
                fund: pvi_i.fund,
                category_of_region: pvi_i.category_of_region,
                priority: pvi_i.priority,
                "Economic Activity": [],
                "EsfSecondaryTheme": [],
                "FinanceForm": [],
                "InterventionField": [],
                "Location": [],
                "Territorial Delivery Mechanism": [],
                "Territory": []
            };
            m.set(key, rec);
            arr.push(rec);
        }
        rec[pvi_i.dimension_type].push({
            planned_eu_amount: tryNum(pvi_i.planned_eu_amount),
            planned_total_amount_notional: tryNum(pvi_i.planned_total_amount_notional),
            dimension_code: tryNum(pvi_i.dimension_code),
            dimension_title: pvi_i.dimension_title? pvi_i.dimension_title: "VOID",
            eu_cofinancing_rate: tryNum(pvi_i.eu_cofinancing_rate),
            eu_elig_expenditure_declared_fin_data_notional: tryNum(pvi_i.eu_elig_expenditure_declared_fin_data_notional),
            eu_eligible_costs_selected_fin_data_notional: tryNum(pvi_i.eu_eligible_costs_selected_fin_data_notional),
            financial_data_version: pvi_i.financial_data_version,
            ms: pvi_i.ms,
            programme_version: pvi_i.programme_version,
            public_eligible_costs_fin_data: tryNum(pvi_i.public_eligible_costs_fin_data),
            queried_fin_data_version: pvi_i.queried_fin_data_version,
            title: pvi_i.title,
            to: lookUpTO(pvi_i),
            total_elig_expenditure_declared_fin_data: tryNum(pvi_i.total_elig_expenditure_declared_fin_data),
            total_eligible_costs_selected_fin_data: tryNum(pvi_i.total_eligible_costs_selected_fin_data)
        });
    }
    console.log(JSON.stringify(arr, undefined, 2));
}

groupDataPerCCIPriorityCategoryofregionFund();
