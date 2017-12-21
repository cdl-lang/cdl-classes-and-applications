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

var positioningPrioritiesConstants = {
    weakerThanMouseAttachment: -201,
    mouseAttachment: -200,    
    strongerThanMouseAttachment: -199,
    
    weakerThanDefaultPressure: -101,
    defaultPressure: -100,    
    strongerThanDefaultPressure: -99,
    
    weakerThanDefault: -1, // weakerThanDefault is used to define extremum points using orGroups. 
    // the default priority is 0!
    strongerThanDefault: 1 
}; 
