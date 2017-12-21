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

var testList = o({
    name: "compilationFlags",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "compilationFlags"
    }
},
{
    name: "loadFiles",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "loadFiles",
	    nItems: 100,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "msSelections",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "msSelections",
	    nItems: 100,
	    limitExpandedFacetsType: "MS",
	    maxInitialNumFacetsExpanded: 1,
	    initialExpansionStateAllFacets: 3,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "sliderSelections",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "sliderSelections",
	    nItems: 100,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    initialExpansionStateAllFacets: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "scrollItems",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "scrollItems",
	    nItems: 500,
	    maxInitialNumFacetsExpanded: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "sortFacets",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "sortFacets",
	    nItems: 200,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "udfOperations",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "udfOperations",
	    nItems: 100,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    initialExpansionStateAllFacets: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "savedViews",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "savedViews",
	    nItems: 100,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    initialExpansionStateAllFacets: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "solutionVerification",
    url: "at_myLeanZCApp.html",
    args: {
	    testName: "solutionVerification",
	    nItems: 100,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    initialExpansionStateAllFacets: 2,
	    maxTestDuration: 1000,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "unionOverlays",
    url: "at_myFatZCApp.html",
    args: {
	    testName: "unionOverlays",
	    nItems: 100,
	    limitExpandedFacetsType: "MS",
	    maxInitialNumFacetsExpanded: 1,
	    initialExpansionStateAllFacets: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "zoomBoxing",
    url: "at_myFatZCApp.html",
    args: {
	    testName: "zoomBoxing",
	    enableZoomBoxing: true,
	    nItems: 10,
	    limitExpandedFacetsType: "MS",
	    maxInitialNumFacetsExpanded: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "favoritesOperations",
    url: "at_myFatZCApp.html",
    args: {
	    testName: "favoritesOperations",
	    nItems: 100,
	    maxInitialNumFacetsExpanded: 2,
	    allowRecordIDAsItemUniqueID: true
    }
},
{
    name: "overlayCreation",
    url: "at_myFatZCApp.html",
    args: {
	    testName: "overlayCreation",
	    nItems: 10,
	    limitExpandedFacetsType: "Slider",
	    maxInitialNumFacetsExpanded: 2,
	    initialExpansionStateAllFacets: 2,
	    allowRecordIDAsItemUniqueID: true
    }
});

var screenArea = {
    children: {
        tests: {
            data: testList,
            description: {
                context: {
                    name: [{param: {areaSetContent: {name: _}}}, [me]],
                    url: [{param: {areaSetContent: {url: _}}}, [me]],
                    arguments: [{param: {areaSetContent: {args: _}}}, [me]]
                },
                display: {
                    borderColor: "black",
                    borderWidth: 1,
                    borderStyle: "solid",
                    text: {
                        value: [{name: _}, [me]]
                    }
                },
                position: {
                    top: [plus, 3, [mul, [{param: {areaSetAttr: _}}, [me]], 23]],
                    left: 5,
                    height: 20,
                    width: 250
                },
                write: {
                    onSomething: {
                        upon: [{type: "MouseUp", subType: "Click"}, [myMessage]],
                        true: {
                            doSomething: {
                                to: [systemInfo],
                                merge: {
                                    url: [{url: _}, [me]],
                                    newWindow: true,
                                    arguments: [merge,
                                        {test: true},
                                        [{arguments: _}, [me]]
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
