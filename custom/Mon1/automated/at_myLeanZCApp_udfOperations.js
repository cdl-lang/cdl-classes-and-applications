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


// function definitions: nothing for now

// variable definitions
var udfOperationsParam = {
    nTestRepetitions: nTestRepetitionsDefault, // defined in at_testTools
    nExpandedMovingFacets: 2,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

var firstMinimizedStringFacet = [first,
    [
        {
            minimized: true,
            dataType: fsAppConstants.dataTypeStringLabel
        },
        [{ facets: _ }, [areaOfClass, "FSApp"]]
    ]
];

// the test
var udfOperations_test = o(
    testInit,
    dragAndDropSampleDataFile(),
    createTestRepetitions(
        [

            storeInto([{ name: _ }, firstSliderFacet], "nameOfFirstSliderFacet"),
            storeInto([{ name: _ }, secondSliderFacet], "nameOfSecondSliderFacet"),
            minimizeLeftmostExpandedFacet(), // minimize the leftmost on load
            assertNumMovingFacets(1),
            minimizeLeftmostExpandedFacet(), // and then the one that was to its right (and now is leftmost)
            assertNumMovingFacets(0),
            log("after minimizing the two slider facets"),

            //re-expand them
            doubleClickControl(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]])),
            doubleClickControl(getFacetByName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            //expandMinimizedFacetViaSearchByName([{ nameOfFirstSliderFacet: _ }, [testStore]]),
            //expandMinimizedFacetViaSearchByName([{ nameOfSecondSliderFacet: _ }, [testStore]]),
            log("after re-expanding the original slider facets"),

            dragOverlayToExpansion(primaryOverlay), // add a UDF only after expanding the primary overlay - testing the #1821 scenario
            log("after dragging primary back to expansion"),
            assertOverlayExpansion(primaryOverlay, true),

            addUdf(),
            storeInto([{ name: _ }, firstMovingFacet],
                "nameOfFirstUDF"),
            log([concatStr,
                o(
                    "after adding first udf (",
                    [{ nameOfFirstUDF: _ }, [testStore]],
                    ")"
                )
            ]),
            assertNumUDFFacets(1),

            dragOverlayToMinimization(primaryOverlay),
            log("after dragging primary to minimization"),
            assertOverlayExpansion(primaryOverlay, false),

            clickControl(controlOfEmbeddingStar("FacetHeader", firstMinimizedStringFacet)),
            assertTestVal(o(), [{ expression: _ }, [areaOfClass, "UDF"]], "Expression of UDF"),
            assertTestVal(true, [{ minimized: _ }, firstMinimizedStringFacet], "Minimization state of first minimized STRING dataType facet"),
            log("after clicking on a STRING minimized facet, and verifying it is neither added to the formula, nor results in the expansion of the facet"),

            clickControl(getFacetUDFRefByFacetName([{ nameOfFirstSliderFacet: _ }, [testStore]])),
            keyDownPressUp("+"),
            udfClickOnApplyButton(), //pressEnterKey,
            log([concatStr, o("after inserting ",
                [{ nameOfFirstSliderFacet: _ }, [testStore]],
                " + in ",
                [{ nameOfFirstUDF: _ }, [testStore]]
            )
            ]),

            assertProperFormulaInUDF([{ nameOfFirstUDF: _ }, [testStore]], false),
            log([concatStr, o("after asserting ",
                [{ nameOfFirstUDF: _ }, [testStore]],
                " doesn't have a proper formula")
            ]),

            keyDownPressUp("2"),
            keyDownPressUp("+"),
            clickControl(getFacetUDFRefByFacetName([{ nameOfFirstSliderFacet: _ }, [testStore]])),
            keyDownPressUp("*"),
            keyDownPressUp("2"),
            //udfClickOnApplyButton(), 
            pressEnterKey,

            log([concatStr, o("after appending 2 + ",
                [{ nameOfFirstSliderFacet: _ }, [testStore]],
                " * 2 in ",
                [{ nameOfFirstUDF: _ }, [testStore]],
                " formula")
            ]),

            assertProperFormulaInUDF([{ nameOfFirstUDF: _ }, [testStore]], true),
            log([concatStr,
                o("after asserting ",
                    [{ nameOfFirstUDF: _ }, [testStore]],
                    " has a properFormula")
            ]),

            ////////////////////////////
            // make a selection in the first UDF, minimize it, verify the selection holds, reexpand it, remove selection:
            mouseDownControl( // drag the first UDF's highValSelector to the bottom of the continous range
                controlOfEmbeddingStar("HighValSelector", getFacetByName([{ nameOfFirstUDF: _ }, [testStore]]))
            ),
            mouseUpControlY(
                controlOfEmbeddingStar("SliderIntOverlayXWidget", getFacetByName([{ nameOfFirstUDF: _ }, [testStore]])),
                1
            ),
            log("after dragging first UDF's highVal selector to the bottom of the continuous range"),
            selectionUnderFacetMinimizationReexpansion(getFacetByName([{ nameOfFirstUDF: _ }, [testStore]])),
            assertTestVal( // verify after reexpansion that sliderEnabled is true (checking #1827 doesn't reappear)
                true,
                [{ sliderEnabled: _ }, getFacetByName([{ nameOfFirstUDF: _ }, [testStore]])],
                [concatStr, o([{ nameOfFirstUDF: _ }, [testStore]], " sliderEnabled")]
            ),
            mouseDownControl( // now drag it back.
                controlOfEmbeddingStar("HighValSelector", getFacetByName([{ nameOfFirstUDF: _ }, [testStore]]))
            ),
            mouseUpControlY(getFacetByName([{ nameOfFirstUDF: _ }, [testStore]]), 0),
            log("after dragging first UDF's highVal selector back to +infinity"),
            ////////////////////////////

            setDataTypeControl(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]]), fsAppConstants.dataTypeStringLabel),
            assertProperReferencesInUDF([{ nameOfFirstUDF: _ }, [testStore]], false),
            log([concatStr,
                o("after asserting ",
                    [{ nameOfFirstUDF: _ }, [testStore]],
                    " no longer has a proper references: it has a reference to a STRING dataType facet")
            ]),
            setDataTypeControl(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]]), fsAppConstants.dataTypeNumberLabel),
            assertProperReferencesInUDF([{ nameOfFirstUDF: _ }, [testStore]], true),
            log([concatStr,
                o("after asserting ",
                    [{ nameOfFirstUDF: _ }, [testStore]],
                    " once again has proper references (the STRING dataType facet was changed back to a NUMBER dataType facet)")
            ]),
            addUdf(),
            storeInto([{ name: _ }, firstMovingFacet],
                "nameOfSecondUDF"),
            log([concatStr,
                o("after adding second udf (",
                    [{ nameOfSecondUDF: _ }, [testStore]],
                    ")")
            ]),

            assertNumUDFFacets(2),

            clickControl(getFacetUDFRefByFacetName([{ nameOfFirstUDF: _ }, [testStore]])),
            keyDownPressUp("+"),
            clickControl(getFacetUDFRefByFacetName([{ nameOfFirstSliderFacet: _ }, [testStore]])), // add first as a sliderFacet
            setFacetFilterType(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]]), "MSFacet"), // turn the first slider facet into an msFacet
            log("after verifying that first slider facet was turned into an MS facet"),
            keyDownPressUp("+"),
            clickControl(getFacetUDFRefByFacetName([{ nameOfFirstSliderFacet: _ }, [testStore]])), // and once more, this time as an MSFacet
            udfClickOnApplyButton(),
            //pressEnterKey,

            log(
                [concatStr,
                    o(
                        "after inserting ",
                        [{ nameOfFirstUDF: _ }, [testStore]],
                        " + ",
                        [{ nameOfFirstSliderFacet: _ }, [testStore]],
                        " + ",
                        [{ nameOfFirstSliderFacet: _ }, [testStore]],
                        " in ",
                        [{ nameOfSecondUDF: _ }, [testStore]],
                        " once as a SliderFacet, then as an MSFacet"
                    )
                ]),

            assertTestVal(
                2, // we check that the expression of the UDF being edited ends up with two instances of nameOfFirstSliderFacet:
                // one when it was still a SliderFacet, and another after it was changed to an MSFacet 
                [size,
                    [
                        { calculatorRefName: [{ nameOfFirstSliderFacet: _ }, [testStore]] },
                        [
                            { expression: _ },
                            [
                                { name: [{ nameOfSecondUDF: _ }, [testStore]] },
                                [areaOfClass, "UDF"]
                            ]
                        ]
                    ]
                ],
                [concatStr,
                    o(
                        "Instances of the first SliderFacet in the UDF expression: ",
                        [{ nameOfFirstSliderFacet: _ }, [testStore]]
                    )
                ]
            ),

            setFacetFilterType(getFacetByName([{ nameOfFirstSliderFacet: _ }, [testStore]]), "SliderFacet"), // turn the first slider facet into an msFacet
            log("after verifying that first slider facet was turned back from an MS facet to a slider facet"),

            addUdf(),
            storeInto([{ name: _ }, firstMovingFacet],
                "nameOfThirdUDF"),
            log([concatStr,
                o("after adding third udf (",
                    [{ nameOfThirdUDF: _ }, [testStore]],
                    ")")
            ]),

            assertNumUDFFacets(3),

            clickControl(getKeyboardButton("logb")),
            keyDownPressUp("("),
            clickControl(getFacetUDFRefByFacetName([{ nameOfSecondUDF: _ }, [testStore]])),
            keyDownPressUp(","),
            keyDownPressUp("2"),
            keyDownPressUp(")"),
            udfClickOnApplyButton(), //pressEnterKey,
            log([concatStr,
                o("after inserting logb(",
                    [{ nameOfSecondUDF: _ }, [testStore]],
                    ",2) in ",
                    [{ nameOfThirdUDF: _ }, [testStore]])
            ]),

            assertMeaningfulValueRangeUDF([{ nameOfFirstUDF: _ }, [testStore]], true),
            assertMeaningfulValueRangeUDF([{ nameOfSecondUDF: _ }, [testStore]], true),
            assertMeaningfulValueRangeUDF([{ nameOfThirdUDF: _ }, [testStore]], true),
            log("after asserting all 3 UDFs are meaningful"),

            assertUDFDisabledToAvoidCircularRef([{ nameOfFirstUDF: _ }, [testStore]], false),
            assertUDFDisabledToAvoidCircularRef([{ nameOfSecondUDF: _ }, [testStore]], false),
            assertUDFDisabledToAvoidCircularRef([{ nameOfThirdUDF: _ }, [testStore]], false),
            log("after asserting all 3 UDFs are not disabledToAvoidCircularRef"),

            addUdf(),
            storeInto([{ name: _ }, firstMovingFacet],
                "nameOfFourthUDF"),
            log([concatStr,
                o("after adding fourth udf (",
                    [{ nameOfFourthUDF: _ }, [testStore]],
                    ")")
            ]),

            // define fourth udf as second slider facet ^ 2
            clickControl(getFacetUDFRefByFacetName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            keyDownPressUp("*"),
            clickControl(getFacetUDFRefByFacetName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            pressEnterKey,
            log([concatStr,
                o("after inserting ",
                    [{ nameOfSecondUDF: _ }, [testStore]],
                    "^2 in ",
                    [{ nameOfFourthUDF: _ }, [testStore]])
            ]),

            log([concatStr,
                o(
                    "fourth UDF minVal: ",
                    [{ minVal:_ }, getFacetByName([{ nameOfFourthUDF: _ }, [testStore]])]
                )
            ]),
            log([concatStr,
                o(
                    "fourth UDF maxVal: ",
                    [{ maxVal:_ }, getFacetByName([{ nameOfFourthUDF: _ }, [testStore]])]
                )
            ]),
            openUDFFormulaPanel([{ nameOfFourthUDF: _ }, [testStore]]),
            log([concatStr, "after clicking the fourth UDF's formula icon to reedit its formula"]),
            pressBackspaceKey, // remove the preexisting formula there (secondSliderFacet ^ 2) - poor and non-resilient testing code here..
            pressBackspaceKey,
            pressBackspaceKey,
            // and now introduce a new formula into the fourth UDF (testing the likes of bug #2008)
            clickControl(getFacetUDFRefByFacetName([{ nameOfThirdUDF: _ }, [testStore]])),
            keyDownPressUp("*"),
            keyDownPressUp("5"),
            //udfClickOnApplyButton(), 
            pressEnterKey,
            log([concatStr,
                o("after inserting ",
                    [{ nameOfThirdUDF: _ }, [testStore]],
                    "*5 in ",
                    [{ nameOfFourthUDF: _ }, [testStore]])
            ]),

            assertMeaningfulValueRangeUDF([{ nameOfFourthUDF: _ }, [testStore]], true),

            deleteUDF([{ nameOfSecondUDF: _ }, [testStore]]),

            log([concatStr,
                o("after deleting ",
                    [{ nameOfSecondUDF: _ }, [testStore]])
            ]),
            assertNumUDFFacets(3),

            assertMeaningfulValueRangeUDF([{ nameOfThirdUDF: _ }, [testStore]], false),
            log([concatStr,
                o("after asserting ",
                    [{ nameOfThirdUDF: _ }, [testStore]],
                    " has no meaningful range")
            ]),

            assertMeaningfulValueRangeUDF([{ nameOfFourthUDF: _ }, [testStore]], false),
            log([concatStr,
                o("after asserting ",
                    [{ nameOfFourthUDF: _ }, [testStore]],
                    " has no meaningful range")
            ]),
            openUDFFormulaPanel([{ nameOfThirdUDF: _ }, [testStore]]),
            log([concatStr,
                o("after opening edit control of ",
                    [{ nameOfThirdUDF: _ }, [testStore]])
            ]),


            //assertUDFDisabledToAvoidCircularRef([{ nameOfFourthUDF:_ }, [testStore]], true),            
            //log([concatStr, 
            //     o("after asserting that ",
            //       [{ nameOfFourthUDF:_ }, [testStore]],
            //       " is disabled to avoid circular ref")
            //    ]),

            //clickControl(getKeyboardButton("AC")),
            repeatTestCommand(pressBackspaceKey, 6),
            log([concatStr,
                o("after erasing the formula in ",
                    [{ nameOfThirdUDF: _ }, [testStore]])
            ]),

            clickControl(getFacetUDFRefByFacetName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            keyDownPressUp("/"),
            keyDownPressUp("4"),
            keyDownPressUp("+"),
            clickControl(getKeyboardButton("avg")),
            keyDownPressUp("("),
            clickControl(getFacetUDFRefByFacetName([{ nameOfSecondSliderFacet: _ }, [testStore]])),
            keyDownPressUp(","),
            keyDownPressUp("2"),
            keyDownPressUp(")"),
            pressEnterKey,
            log([concatStr,
                o("after adding ",
                    [{ nameOfSecondSliderFacet: _ }, [testStore]],
                    "/ 4 + avg(",
                    [{ nameOfSecondSliderFacet: _ }, [testStore]],
                    ", 2) ",
                    "in ",
                    [{ nameOfThirdUDF: _ }, [testStore]])
            ]),

            assertMeaningfulValueRangeUDF([{ nameOfThirdUDF: _ }, [testStore]], true),
            assertMeaningfulValueRangeUDF([{ nameOfFourthUDF: _ }, [testStore]], true),

            deleteUDF([{ nameOfFirstUDF: _ }, [testStore]]),
            deleteUDF([{ nameOfThirdUDF: _ }, [testStore]]),
            deleteUDF([{ nameOfFourthUDF: _ }, [testStore]]),
            assertNumUDFFacets(0),
            log("after removing all UDFs"),
            resetApp()
        ],
        udfOperationsParam.nTestRepetitions
    ),
    testFinish
);
