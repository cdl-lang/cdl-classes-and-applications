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

let fs = require('fs');
let ccis = JSON.parse(fs.readFileSync("cci_lookup_table.json").toString());
let payments = JSON.parse(fs.readFileSync("payments_daily_update.json").toString());

function tryNum(v) {
    if (v === undefined || v === null) {
        return v;
    }
    let n = Number(v);
    return isNaN(n)? v: n;
}

function combineCCIPayments() {
    let arr = [];
    let m = new Map();

    for (let i = 0; i < ccis.length; i++) {
        let cci = ccis[i];
        let rec = m.get(cci.cci);
        if (!m.has(cci.cci)) {
            rec = cci;
            m.set(cci.cci, rec);
            rec.ms = [rec.ms];
            rec.country = [rec.country];
            rec.payments = [];
            arr.push(rec);
        } else {
            rec.ms.push(cci.ms);
            rec.country.push(cci.country);
        }
    }
    for (let i = 0; i < payments.length; i++) {
        let payment = payments[i];
        if (payment.year == 2017) {
            let rec = m.get(payment.cci);
            if (rec === undefined) {
                console.log("ERROR", payment.cci);
            } else {
                rec.payments.push({
                    annual_pre_financing_covered_by_expenditure: payment.annual_pre_financing_covered_by_expenditure,
                    category_of_region: payment.category_of_region? payment.category_of_region: "VOID",
                    cumulative_additional_initial_pre_financing: payment.cumulative_additional_initial_pre_financing,
                    cumulative_annual_pre_financing: payment.cumulative_annual_pre_financing,
                    cumulative_initial_pre_financing: payment.cumulative_initial_pre_financing,
                    cumulative_interim_payments: payment.cumulative_interim_payments,
                    eu_payment_rate: payment.eu_payment_rate,
                    fund: payment.fund,
                    net_additional_initial_pre_financing: payment.net_additional_initial_pre_financing,
                    net_annual_pre_financing: payment.net_annual_pre_financing,
                    net_initial_pre_financing: payment.net_initial_pre_financing,
                    net_interim_payments: payment.net_interim_payments,
                    planned_eu_amount: payment.planned_eu_amount,
                    recovery_of_additional_initial_pre_financing: payment.recovery_of_additional_initial_pre_financing,
                    recovery_of_annual_pre_financing: payment.recovery_of_annual_pre_financing,
                    recovery_of_expenses: payment.recovery_of_expenses,
                    total_net_payments: payment.total_net_payments
                });
            }
        }
    }
    console.log(JSON.stringify(arr, undefined, 2));
}

combineCCIPayments();