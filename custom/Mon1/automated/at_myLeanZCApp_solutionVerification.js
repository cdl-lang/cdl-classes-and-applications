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



// function definitions

function assertEqulityOfOverlaysSolutionSetItems(intOverlays) {
    var overlaysEqualItemsTest = [map,
        [defun,
            "singleIntOverlay",
            [using,
                // beginning of using defs
                "referenceOverlay",
                [first, intOverlays],
                // end of using defs
                // beginning of defun body
                [and,
                    [not,
                        [
                            n([{ solutionSetUniqueIDs: _ }, "referenceOverlay"]),
                            [{ solutionSetUniqueIDs: _ }, "singleIntOverlay"]
                        ]
                    ],
                    true
                    /* [equal,
                        [{ solutionSetSize: _ }, "referenceOverlay"],
                        [{ solutionSetSize: _ }, "singleIntOverlay"]
                    ] */
                ]
            ]
        ],
        intOverlays
    ];

    var allOverlaysAreEqualInSizeAndItems = [and,
        overlaysEqualItemsTest, // duplicate...
        overlaysEqualItemsTest
    ];
    return o(

        log(
            [concatStr,
                o(
                    "Overlays ABC-BAC SolutionSetSize match:",
                    [equal,
                        [{ solutionSetSize: _ }, overlayABC],
                        [{ solutionSetSize: _ }, overlayBAC]
                    ]
                )
            ]
        ),
        log(
            [concatStr,
                o(
                    "Overlays ABC-CAB SolutionSetSize match:",
                    [equal,
                        [{ solutionSetSize: _ }, overlayABC],
                        [{ solutionSetSize: _ }, overlayCAB]
                    ]
                )
            ]
        ),
        assertTestVal(true, allOverlaysAreEqualInSizeAndItems, "Overlays solutionSetItems is not equal")
    );
};
/*
function storeIntoOverlayInitialSolutionSetSize(intOverlays) {
    var storeOverlaySolutionSetSize = [map,
        [defun,
            "singleIntOverlay",
            [using,
                // beginning of using defs
                "overlaySizeTestStoreRefStr",
                [concatStr,
                    o(
                        "overlay",
                        [{ name: _ }, "singleIntOverlay",],
                        "SolutionSizeIntialSolutionSetSize"
                    )
                ],
                "overlaySizeTestStoreRef",
                [[defun, "attr", { "#attr": _ }],
                [{ "overlaySizeTestStoreRefStr"}]],
                // end of using defs
                // beginning of defun body
                storeInto([{ solutionSetSize: _ }, "singleIntOverlay"], "overlaySizeTestStoreRef"),
            ]
        ],
        intOverlays
    ];
    return //storeOverlaySolutionSetSize
};
*/
function overlayInitialSolutionSetSizeAssertTestVal(intOverlays) {
    var storeOverlaySolutionSetSize = [map,
        [defun,
            "singleIntOverlay",
            [using,
                // beginning of using defs
                "overlaySizeTestStore",
                [concatStr,
                    o(
                        "[{overlay",
                        [{ name: _ }, "singleIntOverlay",],
                        "SolutionSizeIntialSolutionSetSize: _ }, [testStore]]"
                    )
                ],
                // end of using defs
                // beginning of defun body
                assertTestVal("overlaySizeTestStore", [{ solutionSetSize: _ }, "singleIntOverlay"], [concatStr, o("SolutionSetSize", [{ name: _ }, "singleIntOverlay",], "doesn't equal starting value")]),
            ]
        ],
        intOverlays
    ];
    return o(
        storeOverlaySolutionSetSize
    )
};


function resetOverlaysIndividually(intOverlays) {
    var resetOverlay = [map,
        [defun,
            "singleIntOverlay",

            // beginning of defun body
            clickOverlayControl("singleIntOverlay", "OverlayResetControl"),
        ],
        intOverlays
    ];
    return log("After overlays were reset Individually")
};


function copyAndRenamePrimaryOverlay(overlayToCopy, newOverlayName) {
    return o(
        clickOverlayControl(overlayToCopy, "OverlayCopyControl"),
        textInput(newOverlayName),
        keyDownUp("Return"),
        assertTestVal(
            newOverlayName,
            [{ name: _ }, lastOverlayAdded],
            "Added Overlay's Actual vs. Expected Name"
        )
    );
};

function getSelector(selector, facet, overlay) {
    return [
        {
            myOverlayXWidget: getOverlayXWidget(overlay, facet)
        },
        [areaOfClass, selector]
    ];
};


function getSelector(selector, facet, overlay) {
    return [
        {
            myOverlayXWidget: getOverlayXWidget(overlay, facet)
        },
        [areaOfClass, selector]
    ];
};

function moveSelectorToSpecificVal(selector, val) {
    return o(
        clickControl(selector),
        textInput(val),
        keyDownUp("Return")
    );
};

function scrollToBottom(scroller) {
    return o(
        mouseDownControl(scroller),
        mouseUpControlY(scroller, 1)
    );
};

function expandMinimizedFacetByName(facetName) {
    var minimizedFacet = [
        { myFacet: { name: facetName } },
        [areaOfClass, "FacetName"]
    ];
    return o(
        doubleClickControl(minimizedFacet)
    );
};

function disableSelection(overlay) {
    var sliderFacet0 = getMovingFacet(0, "SliderFacet");
    var sliderFacet1 = getMovingFacet(1, "SliderFacet");
    var mSFacet0 = getMovingFacet(0, "MSFacet");
    return o(
        clickOverlayXWidgetControl(overlay, sliderFacet0, "DisableSelectionsControl"),
        keyDownUp("Esc"),
        clickOverlayXWidgetControl(overlay, sliderFacet1, "DisableSelectionsControl"),
        keyDownUp("Esc"),
        clickOverlayXWidgetControl(overlay, mSFacet0, "DisableSelectionsControl"),
        keyDownUp("Esc")
    );
};

function selectionStepA(overlay) {
    var facet = getMovingFacet(0, "SliderFacet");
    var HighSelectorareaRef = getSelector("HighValSelector", facet, overlay);
    var LowSelectorareaRef = getSelector("LowValSelector", facet, overlay);
    return o(
        log("Enter step A"),
        moveSelectorToSpecificVal(HighSelectorareaRef, firstHighValSelectorValueFacet0),
        moveSelectorToSpecificVal(LowSelectorareaRef, firstLowValSelectorValueFacet0)
    );
};

function selectionStepB(overlay) {
    var facet = getMovingFacet(0, "MSFacet");
    return o(
        log("Enter step B"),
        clickControl(getOverlayDiscreteValueByPos(facet, overlay, selectionAInMSFacet0)),
        clickControl(getOverlayDiscreteValueByPos(facet, overlay, selectionBInMSFacet0))
    );
};

function selectionStepC(overlay) {
    var facet = getMovingFacet(1, "SliderFacet");
    // var sliderEnabled = [concatStr, o([{ name:_ }, facet], "sliderEnabled = ", [{ sliderEnabled:_ }, facet] )];
    var compressedEffectiveBaseNumericalValues = [concatStr, o([{ name:_ }, facet], "compressedEffectiveBaseNumericalValues = ", [{ compressedEffectiveBaseNumericalValues:_ }, facet] )];
    var compressedEffectiveBaseValues = [concatStr, o([{ name:_ }, facet], "compressedEffectiveBaseValues = ", [{ compressedEffectiveBaseValues:_ }, secondSliderFacet] )];
    var meaningfulValueRange = [concatStr, o([{ name:_ }, secondSliderFacet], "meaningfulValueRange = ", [{ meaningfulValueRange:_ }, facet] )];
    var HighSelectorareaRef = getSelector("HighValSelector", facet, overlay);
    var LowSelectorareaRef = getSelector("LowValSelector", facet, overlay);
    return o(
        log("Enter step C"),
        log(facet),
        log(secondSliderFacet),
        log([concatStr, o([{ name:_ }, secondSliderFacet], "sliderEnabled = ", [{ sliderEnabled:_ }, secondSliderFacet] )]),
        log(compressedEffectiveBaseNumericalValues),
        log(meaningfulValueRange),
        log(compressedEffectiveBaseValues),
        doubleClickControl(HighSelectorareaRef),
        keyDownUp("Backspace"),
        moveSelectorToSpecificVal(LowSelectorareaRef, firstLowValSelectorValueFacet1)
    );
};

function selectionStepD(overlay) {
    var facet = getMovingFacet(1, "SliderFacet");
    var noValueSelection = getSelector("PermOverlaySliderDiscreteValue", facet, overlay);
    return o(
        clickControl(noValueSelection)
    );
};

function selectionStepE(overlay) {
    var facet = getMovingFacet(0, "MSFacet");
    return o(
        toggleOverlayXWidgetInclusionExclusionMode(overlay, facet),
        clickControl(getOverlayDiscreteValueByPos(facet, overlay, -1))
    );
};

function selectionStepF(overlay) {
    var facet = getMovingFacet(0, "SliderFacet");
    var ValSelectorsConnector = getSelector("ValSelectorsConnector", facet, overlay);
    return o(
        mouseDownControl(ValSelectorsConnector, "control"),
        mouseUpControlY(ValSelectorsConnector, -10),
        toggleOverlayXWidgetInclusionExclusionMode(overlay, facet),
        clickControl(getOverlayDiscreteValueByPos(facet, overlay, 0))
    );
};

function minimizeAndExpandFacet(facet) {
    return o(
        minimizeFacetByName(facet),
        { sleep: 20000 },
        expandMinimizedFacetByName(facet)
    );
};

function deselectReselectOverlayDiscreteValueSelection(discreteVal) {
    return o(
        selectionStepB(overlayABC),
        selectionStepB(overlayABC)
    );
};

function appCheckPuase(test) {
    return {
        switch: test,
        "minimizeAndExpandFacet": minimizeAndExpandFacet([{ mSFacetName: _ }, [testStore]]),
        "deselectReselectOverlayDiscreteValueSelection": deselectReselectOverlayDiscreteValueSelection(selectionAInMSFacet0)
    };
};

function performSelectionStep(overlay, step) {

    return {
        switch: step,
        "A": selectionStepA(overlay),
        "B": selectionStepB(overlay),
        "C": selectionStepC(overlay),
        "D": selectionStepD(overlay),
        "E": selectionStepE(overlay),
        "F": selectionStepF(overlay)
    };
};

function selectionStepOrder(overlay, stepOne, stepTwo, stepThree) {
    var overlayName = [{ name: _ }, overlay];
    return o(
        performSelectionStep(overlay, stepOne),
        log([concatStr, o("Finished stage", stepOne, ", overlay", overlayName)]),
        performSelectionStep(overlay, stepTwo),
        log([concatStr, o("Finished stage", stepTwo, ", overlay", overlayName)]),
        performSelectionStep(overlay, stepThree),
        log([concatStr, o("Finished stage", stepThree, ", overlay", overlayName)])
    );
};

function verificationTest() {
    return o(
        selectionStepOrder(overlayABC, "A", "B", "C"),
        log("Finished ABC first set"),
        storeInto([{ solutionSetSize: _ }, overlayABC], "overlayABCMidSolutionSetSize"),

        selectionStepOrder(overlayCAB, "C", "A", "B"),
        log("Finished CAB first set"),
        storeInto([{ solutionSetSize: _ }, overlayABC], "overlayCABMidSolutionSetSize"),

        selectionStepOrder(overlayBAC, "B", "A", "C"),
        log("Finished BAC first set"),
        storeInto([{ solutionSetSize: _ }, overlayABC], "overlayBACMidSolutionSetSize"),

        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal first"),


        disableSelection(overlayABC),
        disableSelection(overlayCAB),
        disableSelection(overlayBAC),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal after disable"),

        assertTestVal([{ overlayABCSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayABC], "SolutionSetSize ABC doesn't equal starting value"),
        assertTestVal([{ overlayCABSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayCAB], "SolutionSetSize CAB doesn't equal starting value"),
        assertTestVal([{ overlayBACSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayBAC], "SolutionSetSize BAC doesn't equal starting value"),
        log("Overlays solutionSetSize equals to starting value"),

        disableSelection(overlayABC),
        disableSelection(overlayCAB),
        disableSelection(overlayBAC),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal after disable and enable"),


        storeInto([{ name: _ }, mSFacet], "mSFacetName"),
        appCheckPuase("minimizeAndExpandFacet"),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Destruction and re-creation of the facet's indexer didn’t affect overlay solution set size"),

        appCheckPuase("deselectReselectOverlayDiscreteValueSelection"),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Deselecting and reselecting discreteVal doesn't change SolutionSetSize"),

        selectionStepOrder(overlayABC, "D", "E", "F"),
        log("Finished ABC second set"),
        storeInto([{ solutionSetSize: _ }, overlayABC], "overlayABCEndSolutionSetSize"),

        selectionStepOrder(overlayCAB, "F", "D", "E"),
        log("Finished CAB second set"),
        storeInto([{ solutionSetSize: _ }, overlayCAB], "overlayCABEndSolutionSetSize"),

        selectionStepOrder(overlayBAC, "E", "D", "F"),
        log("Finished BAC second set"),
        storeInto([{ solutionSetSize: _ }, overlayBAC], "overlayBACEndSolutionSetSize"),

        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal 2"),


        disableSelection(overlayABC),
        disableSelection(overlayCAB),
        disableSelection(overlayBAC),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal after disable"),

        assertTestVal([{ overlayABCSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayABC], "SolutionSetSize ABC doesn't equal starting value"),
        assertTestVal([{ overlayCABSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayCAB], "SolutionSetSize CAB doesn't equal starting value"),
        assertTestVal([{ overlayBACSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayBAC], "SolutionSetSize BAC doesn't equal starting value"),
        log("Overlays solutionSetSize equals to starting value"),

        disableSelection(overlayABC),
        disableSelection(overlayCAB),
        disableSelection(overlayBAC),
        assertEqulityOfOverlaysSolutionSetItems(intOverlays),
        log("Overlays solutionSetSize is equal after disable and enable"),

        assertTestVal([{ overlayABCEndSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayABC], "SolutionSetSize ABC doesn't equal starting value"),
        assertTestVal([{ overlayCABEndSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayCAB], "SolutionSetSize CAB doesn't equal starting value"),
        assertTestVal([{ overlayBACEndSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayBAC], "SolutionSetSize BAC doesn't equal starting value"),
        log("Overlays solutionSetSize is equal to value before disable+enable`")
    );
};

// variable definitions
var solutionVerificationParam = {
    nTestRepetitions: 1, // a single iteration for now, as test runs too long as it is..
    nExpandedMovingFacets: 3,  // this test should be run with nExpandedMovingFacets facets
    nItemsRequired: 100 // and with nItemsRequired items
};

var overlayABC = primaryOverlay;
var overlayCAB = [
    { myOverlay: { name: "CAB" } },
    [areaOfClass, "IntOverlay"]
];
var overlayBAC = [
    { myOverlay: { name: "BAC" } },
    [areaOfClass, "IntOverlay"]
];

var intOverlays = [areaOfClass, "IntOverlay"];
var mSFacet = getMovingFacet(0, "MSFacet");
var mSFacetScroller = [
    {
        myScrollbarContainer: { myWidget: { myFacet: mSFacet } }
    },
    [areaOfClass, "Scroller"]
];
var firstHighValSelectorValueFacet0 = 20;
var firstLowValSelectorValueFacet0 = 4;
var firstHighValSelectorValueFacet1 = 25;
var firstLowValSelectorValueFacet1 = 9;
var selectionAInMSFacet0 = 5;
var selectionBInMSFacet0 = 3;

// the test
var solutionVerification_test = o(
    testInit,
    dragAndDropSampleDataFile(),

    createTestRepetitions(
        [

            dragFacetToExpansion(getMinimizedFacet(1, "MSFacet")),
            log([concatStr, o("Number of expanded facets: ", [{ expanded: true}, [areaOfClass, "Facet"]])]),
            log([concatStr, o("Number of slider facets: ", [areaOfClass, "SliderFacet"])]),
            log([concatStr, o("Expanded facets type: ", [{ facetType:_ }, [{ expanded: true }, [areaOfClass, "Facet"]]])]),
            clickControl(getOverlayControl(overlayABC, "OverlayName")),
            textInput("ABC"),
            keyDownUp("Return"),
            assertTestVal(
                "ABC",
                [{ name: _ }, overlayABC],
                "Primary Overlay's Actual vs. Expected Name"
            ),

            copyAndRenamePrimaryOverlay(overlayABC, "CAB"),
            copyAndRenamePrimaryOverlay(overlayABC, "BAC"),

            assertEqulityOfOverlaysSolutionSetItems(intOverlays),

            //storeIntoOverlayInitialSolutionSetSize(intOverlays), 
            storeInto([{ solutionSetSize: _ }, overlayABC], "overlayABCSolutionSizeIntialSolutionSetSize"),
            storeInto([{ solutionSetSize: _ }, overlayBAC], "overlayBACSolutionSizeIntialSolutionSetSize"),
            storeInto([{ solutionSetSize: _ }, overlayCAB], "overlayCABSolutionSizeIntialSolutionSetSize"),
            log("Preparation complete "),

            verificationTest(),

            // resetOverlaysIndividually(intOverlays), 
            clickOverlayControl(overlayABC, "OverlayResetControl"),
            clickOverlayControl(overlayCAB, "OverlayResetControl"),
            clickOverlayControl(overlayBAC, "OverlayResetControl"),

            // overlayInitialSolutionSetSizeAssertTestVal(intOverlays), 
            assertTestVal([{ overlayABCSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayABC], "SolutionSetSize ABC doesn't equal starting value"),
            assertTestVal([{ overlayCABSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayCAB], "SolutionSetSize CAB doesn't equal starting value"),
            assertTestVal([{ overlayBACSolutionSizeIntialSolutionSetSize: _ }, [testStore]], [{ solutionSetSize: _ }, overlayBAC], "SolutionSetSize BAC doesn't equal starting value"),

            assertEqulityOfOverlaysSolutionSetItems(intOverlays),

            verificationTest(),

            resetApp(),

        ],
        solutionVerificationParam.nTestRepetitions
    ),
    testFinish
);



