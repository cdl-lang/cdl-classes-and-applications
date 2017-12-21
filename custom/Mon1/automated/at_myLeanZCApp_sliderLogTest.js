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


var sliderLogTest_test = o(
    testInit,
    dragAndDropSampleDataFile(),

    o(
        showOverlaySolutionSetView(primaryOverlay),
        assertSolutionSetItems(primaryOverlay),
        clickControl(controlOfEmbeddingStar("ShowHistogramControl", firstSliderFacet)),
        mouseDownControl(firstSliderHighValSelector),
        mouseMoveControlY(firstSliderContinuousRange, 0.1),
        {
            logInternalActions: {
                expressions: true,
                areas: true,
                writes: true,
                printAreaHierarchy: true,
                printAllDataSourceApplicationTrees: true
            }
        },
        { log: "Mouse from 0.1 to 0.2" },
        mouseMoveControlY(firstSliderContinuousRange, 0.2),
        { log: "Mouse from 0.2 to 0.3" },
        mouseMoveControlY(firstSliderContinuousRange, 0.3),
        { log: "Mouse from 0.3 to 0.4" },
        mouseMoveControlY(firstSliderContinuousRange, 0.4),
        { log: "Mouse from 0.4 to 0.5" },
        mouseMoveControlY(firstSliderContinuousRange, 0.5),
        { log: "Mouse from 0.5 to 0.6" },
        mouseMoveControlY(firstSliderContinuousRange, 0.6),
        { log: "Mouse from 0.6 to 0.7" },
        mouseMoveControlY(firstSliderContinuousRange, 0.7),
        { log: "Mouse from 0.7 to 0.8" },
        mouseMoveControlY(firstSliderContinuousRange, 0.8),
        { log: "Mouse from 0.8 to 0.9" },
        mouseMoveControlY(firstSliderContinuousRange, 0.9),
        {
            logInternalActions: {
                expressions: false,
                areas: false,
                writes: false,
                printAreaHierarchy: true,
                printAllDataSourceApplicationTrees: true
            }
        },
        mouseUpControlY(firstSliderContinuousRange, 1)
    ),

    testFinish
);
