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


var classes = {
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*TestCalculatorApp: {
        "class": o("Border", "TestCalculatorPanel", "PocketCalculatorController"),
        context: {
            calculatorDB: [{ myApp: { testDB:_ } }, [me]]
        },
        position: {
            top: 100,
            left: 100,
            right: 100,
            bottom: 200
        }
    },*/
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areaSetContent with { uniqueID: <>, name: <> }
    // 2. value: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacet: o(
        { // default
            "class": o("GeneralArea", "Border", "MemberOfLeftToRightAreaOS", "MinWrap", "CalculatorRefElement"),
            context: {
                minWrapAround: 0,
                
                name: [{ param: { areaSetContent: { name:_ } } }, [me]],
                uniqueID: [{ param: { areaSetContent: { uniqueID:_ } } }, [me]],
                
                facetProj: [
                            [defun, "attr", { "#attr":_ }],
                            [{ uniqueID: _}, [me]]
                           ],
                           
                spacingFromPrev: 20,

                // CalculatorRefElement params
                calculatorRefVal: [{ uniqueID: _}, [me]], 
                calculatorRefName: [{ name:_ }, [me]]               
            },          
            position: {
                attachToBottomOfCalculator: {
                    point1: { element: [areaOfClass, "TestCalculatorApp"], type: "bottom" },
                    point2: { type: "top" },
                    equals: 20
                }
            },
            children: {
                name: {
                    description: {
                        "class": "TestFacetName"
                    }
                },
                cell: {
                    description: {
                        "class": "TestFacetCell"
                    }
                }               
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: [{ spacingFromPrev:_ }, [me]]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetName: {
        "class": o("GeneralArea", "TextAlignCenter", "TextBold", "BottomBorder", "DefaultDisplayText", "CalculatorRefElementUX"),
        context: {
            displayText: [{ name:_ }, [embedding]],
            // CalculatorRefElementUX params:
            myCalculatorController: [areaOfClass, "TestCalculatorApp"],
            myCalculatorRefElement: [embedding]
        },
        position: {
            height: 20,
            width: 50
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestFacetCell: {
        "class": o("GeneralArea", "TextAlignCenter", "DefaultDisplayText", "DisplayDimension"),
        context: {          
            displayText: [{ content:_ }, [me]]
        },
        content: [
                  [{ facetProj:_ }, [embedding]],
                  [{ myApp: { testDB:_ } }, [me]]
                 ],
        position: {
            "horizontal-center": 0,
            attachToBottomOfName: {
                point1: { element: [{ children: { name:_ } }, [embedding]], type: "bottom" },
                point2: { type: "top" },
                equals: 0               
            }
        }
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TestAnnotation: {
        "class": superclass,
        context: {
            displayText: "Demonstrating a user-defined calculation.\n1.numbers/operands can be entered via the buttons or keyboard.\n2. Backspace to delete the last element.\n3. Click on 'Facet' headers (A/B/C/D) to add them to formula"
        }
    }   

};

var screenArea = {
    "class": o("ScreenArea", "TestApp"),
    context: {
        testDB: o(
                  { "f1": 5, "f2": 10, "f3": 15, "f4": 20 }
                 ),
        facetData: o(
                      { uniqueID: "f1", name: "F999999" },
                      { uniqueID: "f2", name: "F2" },
                      { uniqueID: "f3", name: "F3" },
                      { uniqueID: "f4", name: "F4" }
                     )
    },
    children: {
        app: {
            description: {
                "class": "TestCalculatorApp"
            }
        },
        facets: {
            data: [{ facetData:_ }, [me]],
            description: {
                "class": "TestFacet"
            }
        }
    }
};
