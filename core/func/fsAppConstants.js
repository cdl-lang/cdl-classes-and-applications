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

var correctCompilationFlags = [and,
    compileUDF,
    compileSlider,
    compileMS,
    compileRating,
    compileDate,
    compileItems,
    compileOMF,
    compileMinimizedFacets,
    compileMinimizedOverlays,
    compileHistogram,
    compileTags,
    compileTrash,
    [not, compileVD]
];

var fsAppConstants = {
    newOverlayIDPrefix: "___OVERLAY_ID___",
    newFacetIDPrefix: "___Facet_ID___",
    globalBaseOverlayCounter: 0,
    defaultFavoritesCounter: -1,
    defaultBlacklistCounter: -2,
    effectiveBaseOverlayCounter: -3,
    primaryOverlayCounter: 1,    
    
    firstHistogramUniqueIDCounter: 1,
    
    defaultIntOverlayName: "MyFilter",
    defaultFavoritesOverlayName: "Favorites",
    defaultBlacklistOverlayName: "Blacklist",
    newIntOverlayNamePrefix: "Filter #",    
    newExtOverlayNamePrefix: "List #",
    copyOfNamePrefixOfSuffix: "-Copy",
    
    dataTypeNumberLabel: "NUMBER",
    dataTypeStringLabel: "STRING",
    dataTypeBooleanLabel: "BOOLEAN",
    dataTypeDateLabel: "DATE",

    emphasisOpacity: 0.7,
    
    defaultDelay: 0.5, // seconds

    thresholdNrUniqueValuesForItemValuesFacet: 200, // the number of uniqueValues in a facet, beyond which it will be set by default to be ItemValues
    maxNrUniqueValuesForDiscreteFacet: 5000,
    maxNrUniqueNumberValuesForMS: 12,
    thresholdNrUniqueStringValuesForStringDataType: 4,
    thresholdNrUniqueMSValuesForSearchbox: 20
};

var facetState = {
    minimized: 0,
    summary: 1,
    standard: 2,
    histogram: 3,
    twoDPlot: 4
};

