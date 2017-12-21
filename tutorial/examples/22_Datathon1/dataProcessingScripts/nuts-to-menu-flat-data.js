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
let nuts = fs.readFileSync("nuts.txt").toString().split(/[\n\r]+/);
let m = new Map();
let obj = [];

for (let i = 0; i < nuts.length; i++) {
    var line = nuts[i];
    if (line === "") {
        continue;
    }
    var [code, region] = line.split(/\t/);
    if (region === undefined) {
        console.log("error 1");
        process.exit(1);
    }
    if (region === "EXTRA-REGIO NUTS 1" || region === "Extra-Regio NUTS 2" ||
          region === "Extra-Regio NUTS 3") {
        continue;
    }
    if (!m.has(code)) {
        let sobj = { text: region, value: code, parents: [] };
        m.set(code, sobj);
        if (code.length !== 2) {
            let parentCode = code.slice(0, -1);
            let levelUp = m.get(parentCode);
            if (levelUp === undefined) {
                console.log("error 2");
                process.exit(1);
            }
            sobj.parents = [parentCode].concat(levelUp.parents);
        }
        obj.push(sobj);
    }
}
console.log(JSON.stringify(obj, undefined, 2));
