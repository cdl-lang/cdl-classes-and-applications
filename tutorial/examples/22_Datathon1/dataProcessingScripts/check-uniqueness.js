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
let data = JSON.parse(fs.readFileSync(args[0]).toString());

function checkUniqueness(key) {
    let s = new Set();

    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        let keyString = key.map(attr => element[attr]).join("|");
        if (s.has(keyString)) {
            console.log("NOPE", key.join(","), "line:" + (i + 1), keyString);
            return;
        }
        s.add(keyString);
    }
    console.log("YES", key.join(","));
}

checkUniqueness(args.slice(1));
