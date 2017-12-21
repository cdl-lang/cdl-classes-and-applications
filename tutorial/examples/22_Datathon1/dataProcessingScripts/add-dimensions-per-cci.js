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
  "dimension_title":"Social work activities,
   community,
   social and personal servi",
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
let args = process.argv.slice(2);
let data = JSON.parse(fs.readFileSync("ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.api.json").toString());

let dimensions = ["Economic Activity", "EsfSecondaryTheme", "FinanceForm",
                  "InterventionField", "Location",
                  "Territorial Delivery Mechanism", "Territory"];
let sum_attrs = ["planned_eu_amount", "planned_total_amount_notional",
    "eu_elig_expenditure_declared_fin_data_notional", "eu_eligible_costs_selected_fin_data_notional",
    "total_elig_expenditure_declared_fin_data", "total_eligible_costs_selected_fin_data"];

function sumCCIPerDimension() {
    let m = new Map();

    for (let i = 0; i < data.length; i++) {
        let d = data[i];
        let m2 = m.get(d.cci);
        if (m2 === undefined) {
            m2 = new Map();
            for (let k = 0; k < dimensions.length; k++) {
                m2.set(dimensions[k], new Map());
            }
            m.set(d.cci, m2);
        }
        for (let j = 0; j < sum_attrs.length; j++) {
            let attr = sum_attrs[j];
            let m3 = m2.get(d.dimension_type);
            if (attr in d) {
                m3.set(attr, (m3.has(attr)? m3.get(attr): 0) + Number(d[attr]));
            }
        }
    }
    console.log("cci" + "\t" +
        sum_attrs.map(
            sum_attr => dimensions.map(
                dim => dim
            ).join("\t")
        ).join("\t")
    );
    console.log("cci" + "\t" +
        sum_attrs.map(
            sum_attr => dimensions.map(
                dim => sum_attr
            ).join("\t")
        ).join("\t"));
    for (let [cci, m2] of m) {
        console.log(cci + "\t" +
            sum_attrs.map(
                sum_attr => dimensions.map(
                    dim => m2.get(dim).get(sum_attr)
                ).join("\t")
            ).join("\t")
        );
    }
}

sumCCIPerDimension();
