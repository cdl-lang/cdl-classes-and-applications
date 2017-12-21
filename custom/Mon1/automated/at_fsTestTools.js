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

// %%include%%: <cdl/core/automated/at_testTools.js>

///////////////////////
//General functions
///////////////////////

function assertNFacets(expectedNFacets) { // assert on the number of expanded moving facets!
    var actualNumFacets = [size, [areaOfClass, "MovingFacet"]];
    return assertTestVal(expectedNFacets,
        actualNumFacets,
        "Number of expanded moving facets"
    );
};

function assertNItems(expectedNItems) {
    var actualNumItems = [arg, "nItems", defaultNumItems];
    return assertTestVal(expectedNItems,
        actualNumItems,
        "Number of items"
    );
};

function assertInitialExpansionState(expectedExpansionState) {
    var initialExpansionState = [arg, "initialExpansionStateAllFacets", 1];
    return assertTestVal(expectedExpansionState,
        initialExpansionState,
        "Expansionstate of Expanded Facets"
    );
}

function assertOverlaySolutionSetSize(overlay, expectedNSolutionSet) {
    var actualNSolutionSet = [{ solutionSetSize: _ }, overlay];
    return assertTestVal(expectedNSolutionSet,
        actualNSolutionSet,
        [concatStr,
            o(
                " Overlay ",
                [{ name: _ }, overlay],
                " solutionSet size"
            )
        ]
    );
};

function assertOverlayExpansion(overlay, expectedState) {
    var actualState = [{ expanded: _ }, overlay];
    return assertTestVal(expectedState,
        actualState,
        [concatStr,
            o(
                " Overlay ",
                [{ name: _ }, overlay],
                " expansion"
            )
        ]
    );
};

function assertOverlayTrashed(overlay, expectedState) {
    var actualState = [{ trashed: _ }, overlay];
    return assertTestVal(expectedState,
        actualState,
        [concatStr,
            o(
                " Overlay ",
                [{ name: _ }, overlay],
                " trashed"
            )
        ]
    );
};

function assertCompareOverlaysSolutionSets(overlayA, overlayB) {
    return assertTestVal(
        [{ sortedStableSolutionSetUniqueIDs: _ }, overlayA],
        [{ sortedStableSolutionSetUniqueIDs: _ }, overlayB],
        [concatStr,
            o(
                " Comparison of solutionSets for overlays: ",
                [{ name: _ }, overlayA],
                " and ",
                [{ name: _ }, overlayB]
            )
        ]
    );
};

function assertCompareOverlaysSolutionSetSizes(overlayA, overlayB) {
    return assertTestVal([{ solutionSetSize: _ }, overlayA],
        [{ solutionSetSize: _ }, overlayB],
        [concatStr,
            o(
                " Comparison of solutionSet sizes for overlays: ",
                [{ name: _ }, overlayA],
                " and ",
                [{ name: _ }, overlayB]
            )
        ]
    );
};

function assertSelectableFacetXIntOverlaySelectionsMade(selectableFacetXIntOverlay, expectedSelectionsMade) {
    var actualSelectionsMade = [bool, [{ selectionsMade: _ }, selectableFacetXIntOverlay]];
    return assertTestVal(expectedSelectionsMade,
        actualSelectionsMade,
        [concatStr, o(
            "selectionsMade of SelectableFacetXIntOverlay of ",
            [{ myFacet: { uniqueID: _ } }, selectableFacetXIntOverlay],
            " facet, and ",
            [{ myOverlay: { name: _ } }, selectableFacetXIntOverlay],
            " overlay"
        )
        ]
    );
};

function assertSelectableFacetXIntOverlayDisabled(selectableFacetXIntOverlay, expectedDisabled) {
    var actualDisabled = [{ disabled: _ }, selectableFacetXIntOverlay];
    return assertTestVal(expectedDisabled,
        actualDisabled,
        [concatStr, o(
            "disabled of SelectableFacetXIntOverlay of ",
            [{ myFacet: { uniqueID: _ } }, selectableFacetXIntOverlay],
            " facet, and ",
            [{ myOverlay: { name: _ } }, selectableFacetXIntOverlay],
            " overlay"
        )
        ]
    );
};

function dragAndDropSampleDataFile() {
    return o(
        pickFileInZCApp("../../../../data/euroFundDB.csv"),
        log("after dragging euroFundDB.csv into FileInputHotspot area"),
        assertTestVal(true, [notEmpty, [areaOfClass, "MovingFacet"]], "there are MovingFacets"),
        assertTestVal(true, [{ allowRecordIDAsItemUniqueID:_ }, [areaOfClass, "FSApp"]], "allowRecordIDAsItemUniqueID should be set to true in the URL"),
        log("after checking that there is at least one expanded moving facet")
    );
};

function resetApp() {
    return o(
        clickControl([areaOfClass, "FSAppUserMenuController"]),
        clickControl([areaOfClass, "FSAppResetAppMenuItem"]),
        clickControl([areaOfClass, "AppResetModalDialogOKControl"]),
        log("after resetting app")
    )
};

function getSolutionSetItemByPos(overlay, itemPosInOverlay) {
    return [pos,
        itemPosInOverlay,
        [
            { children: { solutionSetItems: _ } },
            [
                { myOverlay: overlay },
                [areaOfClass, "OverlaySolutionSetView"]
            ]
        ]
    ];
};

function getSolutionSetItemUniqueIDByPos(overlay, itemPosInOverlay) {
    return [
        { uniqueID: _ },
        getSolutionSetItemByPos(overlay, itemPosInOverlay)
    ];
};

function getCell(facet, overlay, itemPosInOverlay) {
    return [
        {
            myFacet: facet,
            mySolutionSetItem: getSolutionSetItemByPos(overlay, itemPosInOverlay)
        },
        [areaOfClass, "Cell"]
    ];
};

function getOverlayByStoredUniqueID(storedUniqueIDQuery) {
    return [
        { uniqueID: [storedUniqueIDQuery, [testStore]] },
        [areaOfClass, "Overlay"]
    ];
};

function getOverlayByName(overlayName) {
    return [
        { name: overlayName },
        [areaOfClass, "Overlay"]
    ];
};

function getOverlayHandle(overlay) {
    return [
        { myOverlay: overlay },
        [areaOfClass, "OverlayHandle"]
    ]
};

function getOverlayXWidget(overlay, facet) {
    return [
        {
            myOverlay: overlay,
            myFacet: facet
        },
        [areaOfClass, "OverlayXWidget"]
    ];
};

function getOMFacetXIntOSR(oSROverlay, oMFOverlay) {
    return [
        {
            myOverlay: oSROverlay,
            myFacet: [
                { myOverlay: oMFOverlay },
                [areaOfClass, "OMF"]
            ]
        },
        [areaOfClass, "OMFacetXIntOSR"]
    ]
};

function getOverlayControl(overlay, controlClass) {
    return [
        { myOverlay: overlay },
        [areaOfClass, controlClass]
    ];
};

function clickControlAreaByClassName(className) {
    clickControl([areaOfClass, className])
};


function clickOverlayControl(overlay, controlClass) {
    return o(
        {
            // OverlayShowControl is not under moreControls, but rather directly available in the OSRControls
            // doubleClicklick on OverlaySolutionSetCounter to expand a minimized overlay - it is not a control per se
            if: [not, [controlClass, o("OverlayShowControl", "OverlaySolutionSetCounter", "OverlayName")]],
            then: o(
                clickControl(getOverlayControl(overlay, "OverlayMoreControls")), // first, click on the moreControls
                assertTestVal(true, [{ moreControlsOpen: _ }, overlay], "Overlay moreControls")
            )
        },
        {
            if: [controlClass, "OverlayResetControl"],
            then: o(
                {
                    if: [areaOfClass, "OverlayResetControl"], // the ResetControl won't exist if there's nothing to reset!
                    then: o(
                        clickControl(getOverlayControl(overlay, controlClass)) // then on the actual control of interest
                    )
                }
            ),
            else: o(
                clickControl(getOverlayControl(overlay, controlClass)) // then on the actual control of interest
            )
        }
    );
};

function setOverlaySolutionSetView(overlay, flag) {
    return o(
        {
            if: [notEqual, flag, [{ showSolutionSet: _ }, overlay]],
            then: o(
                clickControl(getOverlayControl(overlay, "SolutionSetViewControl")),
                assertTestVal(flag, [{ showSolutionSet: _ }, overlay], [concatStr, o(overlay, "'s showSolutionSet")])
            )
        }
    );
};

function showOverlaySolutionSetView(overlay) {
    return o(
        {
            if: [not, [{ expanded: _ }, overlay]],
            then: doubleClickControl(getOverlayControl(overlay, "OverlayName")),
            else: setOverlaySolutionSetView(overlay, true)
        }
    );
};

function hideOverlaySolutionSetView(overlay) {
    return o(
        {
            if: [not, [{ expanded: _ }, overlay]],
            then: doubleClickControl(getOverlayControl(overlay, "OverlayName")),
            else: setOverlaySolutionSetView(overlay, false)
        }
    );
};

function clearOverlay(overlay) {
    return clickOverlayControl(overlay, "OverlayResetControl");
};

function clickOverlayXWidgetControl(overlay, facet, controlClass) {
    return o(
        clickControl([{ myOverlayXWidget: getOverlayXWidget(overlay, facet) }, [areaOfClass, "OverlayXWidgetMoreControlsUX"]]), // first click on the OverlayXWidget's moreControls
        log([concatStr, o("after opening the controls for the OverlayXWidget of the ", [{ name: _ }, overlay], " overlay and the ", [{ name: _ }, facet], " facet")]),
        clickControl([areaOfClass, controlClass]), // then on the specific control of interest
        log([concatStr, o("after clicking on its ", controlClass, " Control")])
    );
};

function toggleOverlayXWidgetInclusionExclusionMode(overlay, facet) {
    var inclusionExclusionToggleUX = controlOfEmbeddingStar("ToggleControlUX", [areaOfClass, "InclusionExclusionModeControl"]);
    var inclusionMode = [{ inclusionMode: _ }, [areaOfClass, "InclusionExclusionModeControl"]];

    return o(
        clickControl([{ myOverlayXWidget: getOverlayXWidget(overlay, facet) }, [areaOfClass, "OverlayXWidgetMoreControlsUX"]]), // first click on the OverlayXWidget's moreControls
        storeInto(inclusionMode, "originalInclusionMode"),
        log([concatStr, o("after opening the controls for the OverlayXWidget of the ", [{ name: _ }, overlay], " overlay and the ", [{ name: _ }, facet], " facet")]),
        {
            if: inclusionMode, 
            then: o(
                clickControlX(inclusionExclusionToggleUX, 0.75),
                log("click to switch to exculsion mode")
            ),
            else: o(
                clickControlX(inclusionExclusionToggleUX, 0.25),
                log("click to switch to inculsion mode")
            )
        },
        assertTestVal(inclusionMode, [not, [{ originalInclusionMode: _ }, [testStore]]], "New inclusionMode")
    )
};

function getSelectableFacetXIntOverlay(overlay, facet) {
    return [
        {
            myOverlay: overlay,
            myFacet: facet
        },
        [areaOfClass, "SelectableFacetXIntOverlay"]
    ];
};

function getFacet(paneType, index, subType) {
    var type = true; // if no subType specified, the true value will capture any facetType
    if (subType !== undefined) {
        type = subType
    };

    return [pos,
        index,
        [
            { facetType: type },
            [{ myFacets: _ }, [areaOfClass, paneType]]
        ]
    ];
};

function getMovingFacet(index, subType) {
    return getFacet("MovingFacetViewPane", index, subType);
};

function getFrozenFacet(index, subType) {
    return getFacet("FrozenFacetViewPane", index, subType);
};

function getMinimizedFacet(index, subType) {
    return getFacet("MinimizedFacetsView", index, subType);
};

// this function retrieves a minimized facet by name using the search input text
function expandMinimizedFacetViaSearchByName(name) {
    return o(
        clickControl([areaOfClass, "MinimizedFacetViewPaneSearchBox"]),
        //log("After clicking on MinimizedFacetViewPaneSearchBox"),
        textInput(name),
        //log("After inputting the facet name in the search input text"),
        doubleClickControl(getFacetByName(name)),
        //log("After doubleClicking on the facet name"),
        clickControl([areaOfClass, "MinimizedFacetViewPaneSearchBox"]),
        textInput(''), //clearing the input text
        //log("After clearing the input text"),
        //pressEnterKey
        clickControl([areaOfClass, "EffectiveBaseCounter"]) //removing focus from MinimizedFacetViewPaneSearchBox
    )
};

function getFacetHandle(facet) {
    return [
        { myFacet: facet },
        [areaOfClass, "ReorderableFacetHandle"]
    ]
};

function getDiscreteValueByPos(discreteFacet, index) {
    return [pos,
        index,
        [
            { children: { values: _ } },
            [
                {
                    myFacet: discreteFacet,
                    ofPrimaryWidget: true
                },
                [areaOfClass, "DiscreteValuesView"]
            ]
        ]
    ];
};

function getDiscreteValueByVal(discreteFacet, val) {
    return [
        {
            myFacet: discreteFacet,
            value: val,
            ofPrimaryWidget: true
        },
        [areaOfClass, "DiscreteValue"]
    ];
};

function getOverlayDiscreteValue(overlayXWidget, discreteValue) { // parameters are two areaRefs!
    return [
        {
            myOverlayXWidget: overlayXWidget,
            myDiscreteValue: discreteValue
        },
        [areaOfClass, "OverlayDiscreteValue"]
    ];
};

function getOverlayDiscreteValueByPos(discreteFacet, overlay, index) {
    return getOverlayDiscreteValue(getOverlayXWidget(overlay, discreteFacet), getDiscreteValueByPos(discreteFacet, index));
};

function getOverlayDiscreteValueByVal(discreteFacet, overlay, val) {
    return getOverlayDiscreteValue(getOverlayXWidget(overlay, discreteFacet), getDiscreteValueByVal(discreteFacet, val));
};

function getSliderScaleEdgeLabel(facet, whichEdge) {
    var myFacetScaleEditableLabels = [
        { myFacet: facet },
        [areaOfClass, "SliderScaleEditableLabelText"]
    ];
    if (whichEdge === "Max")
        return [
            { isScaleMaxValue: true },
            myFacetScaleEditableLabels
        ]
    else[
        { isScaleMinValue: true },
        myFacetScaleEditableLabels
    ];
};

function setSliderScaleEdgeValue(facet, whichEdge, valueStr, value) {
    var sliderScaleEdgeLabel = getSliderScaleEdgeLabel(facet, whichEdge);
    return o(
        clickControl(sliderScaleEdgeLabel),
        assertTestVal(true, [{ editInputText: _ }, sliderScaleEdgeLabel], "Slider Scale Edge Label Input Text"),
        log([concatStr, o("after setting slider ", [{ name: _ }, facet], " edge label to edit mode ", [{ editInputText: _ }, sliderScaleEdgeLabel])]),
        textInput(valueStr),
        log([concatStr, o("after entering slider ", [{ name: _ }, facet], " edge label value: ", valueStr)]),
        keyDownUp("Return"),
        assertTestVal(false, [{ editInputText: _ }, sliderScaleEdgeLabel], "Slider Scale Edge Label Input Text"),
        log([concatStr, o("after slider ", [{ name: _ }, facet], " edge label value is set as ", value)]),
        assertTestVal(value, [{ displayText: _ }, sliderScaleEdgeLabel], "Slider Scale Edge Label Value")
    );
};

function resetSliderScaleEdgeValue(facet, whichEdge) {
    var sliderScaleEdgeLabel = getSliderScaleEdgeLabel(facet, whichEdge);
    var sliderCanvas = [{ myFacet: facet }, [areaOfClass, "SliderCanvas"]];

    return o(
        log([concatStr, o("reset slider ", [{ name: _ }, facet], " edge label value")]),
        clickControl(sliderScaleEdgeLabel),
        log([concatStr, o("after setting slider ", [{ name: _ }, facet], " edge label to edit mode ", [{ editInputText: _ }, sliderScaleEdgeLabel])]),
        textInput(""), // pressDelKey or pressBackspaceKey won't work here - sending key events to input elements not supported (yet) in testing environment.
        keyDownUp("Return"),
        log([concatStr, o("after backspacing the slider ", [{ name: _ }, facet], " edge label value")]),
        assertTestVal(false, [{ editInputText: _ }, sliderScaleEdgeLabel], "Slider Scale Edge Label Input Text"),
        {
            if: [equal, whichEdge, "Max"],
            then: assertTestVal([{ maxRoundEdge: _ }, sliderCanvas], [{ displayText: _ }, sliderScaleEdgeLabel], "Slider Edge Label Value Reset"),
            else: assertTestVal([{ minRoundEdge: _ }, sliderCanvas], [{ displayText: _ }, sliderScaleEdgeLabel], "Slider Edge Label Value Reset")
        }
    );
};

function getOSRControls(overlay) {
    return [
        { myOverlay: overlay },
        [areaOfClass, "OSRControls"]
    ];
};

function getOverlayXWidgetLegend(overlay, facet) {
    return [
        {
            myOverlay: overlay,
            myFacet: facet
        },
        [areaOfClass, "OverlayXWidgetLegend"]
    ];
};

function getFacetSelectionDeleteControl(facetSelection) {
    return [{ children: { deletionControl: _ } }, facetSelection];
};


function addNewIntensionalOverlay() {
    return clickControl(
        [areaOfClass, "NewIntOverlayControl"]
    )
};

function addNewExtensionalOverlay() {
    return clickControl(
        [areaOfClass, "NewExtOverlayControl"]
    )
};

function untrashElement(trashableElement) {
    return clickControl(
        [
            { myTrashable: trashableElement },
            [areaOfClass, "UntrashControl"]
        ]
    )
};

function untrashOverlay(overlay) {
    return untrashElement([{ myOverlay: overlay }, [areaOfClass, "VisibleOverlay"]]) // the VisibleOverlay is the TrashableElement, not the Overlay!
};

function dragOverlayToMinimization(overlay) {
    return o(
        mouseDownControlXY(getOverlayHandle(overlay), 0, 0),
        mouseUpControlXY([areaOfClass, "MinimizedOverlaysView"], 0, 1) // to leftmost position in minimized overlays        
    );
};

function dragOverlayToExpansion(overlay) {
    return o(
        mouseDownControlXY(getOverlayHandle(overlay), 0, 0),
        mouseUpControlY([areaOfClass, "ExpandedOverlaysView"], 0) // to topmost position in expanded overlays        
    );
};

function assertNOverlays(expectedNOverlay) { // assert on the number of overlays
    var actualNumOverlays = [size, [areaOfClass, "PermIntExtOverlay"]]; // excludes the EffectiveGlobalBase
    return assertTestVal(expectedNOverlay,
        actualNumOverlays,
        "Number of Overlays"
    );
};

function getKeyboardButton(inputValue) {
    return [
        { calcValue: inputValue },
        [areaOfClass, "CalculatorButton"]
    ];
};

function openFSPController(facetName) {
    var editControl = [
        { myFacet: { name: facetName } },
        [areaOfClass, "FSPController"]
    ];
    return clickControl(editControl);
};

function minimizeFacetByName(facetName) {
    var minimizationControl = [
        { myFacet: { name: facetName } },
        [areaOfClass, "FacetMinimizationControl"]
    ];
    return clickControl(minimizationControl)
};

function minimizeLeftmostExpandedFacet() {
    var minimizationControl = [
        { myFacet: { uniqueID: [first, [{ expandedMovingFacetUniqueIDs: _ }, [areaOfClass, "FSApp"]]] } },
        [areaOfClass, "FacetMinimizationControl"]
    ];
    return clickControl(minimizationControl)
};

function minimizeFacet(facet) {
    var minimizationControl = [
        { myFacet: facet },
        [areaOfClass, "FacetMinimizationControl"]
    ];
    return clickControl(minimizationControl)
};


function closeFacetAmoeba(facet) {
    return clickControl([{ myFacet: facet }, [areaOfClass, "AmoebaCloseControl"]]);
};

function openFacetAmoeba(facet) {
    return clickControl([{ myFacet: facet }, [areaOfClass, "FacetAmoebaControl"]]);
};

function dragFacetToMinimization(facet) {
    return o(
        mouseDownControlX(getFacetHandle(facet), 0.5),
        mouseUpControlXY([areaOfClass, "MinimizedFacetViewPane"], 1, 0) // to rightmost/topmost position in minimized facets pane
    );
};

function dragFacetToExpansion(facet) {
    return o(
        mouseDownControlX(facet, 0.1),
        mouseUpControlX([areaOfClass, "MovingFacetViewPane"], 0) // to leftmost position in moving facets pane
    );
};

function getOMFByOverlayName(overlayName) {
    return [
        { myOverlay: { name: overlayName } },
        [areaOfClass, "OMF"]
    ];
};

function assertFacetIsExpanded(facet, expectedValue) {
    var actualValue = [{ expanded: _ }, facet];
    return assertTestVal(expectedValue,
        actualValue,
        "Expanded");
};

function assertFilterType(facet, expectedFilterType) {
    var actualFilterType = [{ facetType: _ }, facet];
    return assertTestVal(expectedFilterType,
        actualFilterType,
        "FilterType");
};

function setFacetFilterType(facet, filterType) {
    return o(
        clickControl([{ myFacet: facet }, [areaOfClass, "FSPController"]]), // open the panel
        // can't use controlOfEmbeddingStar for FilterTypeControlElement as it is not embeddedStar in facet (it's in an interesection child of it)
        clickControl([{ type: filterType, myFacet: facet }, [areaOfClass, "FilterTypeControlElement"]]),
        assertFilterType(facet, filterType),
        clickControl([{ myFacet: facet }, [areaOfClass, "FacetPanelMinimizationControl"]]) // close the panel
    );
};

///////////////////////////////////////
// newDataType is expected to be either fsAppConstants.dataTypeStringLabel or fsAppConstants.dataTypeNumberLabel
// (in theory also fsAppConstants.dataTypeBooleanLabel, though it isn't available through the UX just yet)
///////////////////////////////////////
function setDataTypeControl(facet, newDataType) {
    //assertFacetIsExpanded(facet, true)
    return o(
        {
            if: [notEqual, newDataType, [{ dataType: _ }, facet]],
            then: clickControl(controlOfEmbeddingStar("DataTypeControl", facet))
        }
    );
};

///////////////////////////////////////
//UDF-related variables and functions
//////////////////////////////////////

// variables
var udfPlusButton = [areaOfClass, "FSAppAddUDFacetControl"]
var udfApplyButton = [areaOfClass, "UDFEditorApplyButton"]

// functions
function addUdf() {
    return o(
        clickControl(udfPlusButton),
        mouseMoveControl([areaOfClass, "EffectiveBaseName"]) //move away to remove tooltip
    )
};

function udfClickOnApplyButton() {
    return o(
        mouseMoveControl([areaOfClass, "UDFEditorInputFieldContainer"]),
        clickControl(udfApplyButton),
        mouseMoveControl([areaOfClass, "EffectiveBaseName"]) //move away to remove tooltip
    );
};

function getFacetUDFRefByFacetName(facetName) {
    return [
        { myFacet: { name: facetName } },
        [areaOfClass, "UDFRefElementUX"]
    ];
};

function getFacetByName(facetName) {
    return [
        { name: facetName },
        [areaOfClass, "Facet"]
    ];
};

function getUDFacet(facetName) {
    return [
        { name: facetName },
        [areaOfClass, "UDFacet"]
    ];
};

function deleteUDF(facetName) {
    var formulaControl = [
        { myFacet: { name: facetName } },
        [areaOfClass, "UDFFormulaPanelController"]
    ];
    return o(
        clickControl(formulaControl), //press on the facet's formula control
        clickControl([areaOfClass, "DeleteUDFacetControl"]), // press on delete control
        pressEnterKey
    );
};

function assertMeaningfulValueRangeUDF(facetName, expectedMeaningfulValueRange) {
    var actualMeaningfulValueRange = [
        { name: facetName, meaningfulValueRange: _ },
        [areaOfClass, "UDFacet"]
    ];
    return assertTestVal(expectedMeaningfulValueRange,
        actualMeaningfulValueRange,
        [concatStr, o(facetName, " meaningfulValueRange")]
    );
};

function assertProperFormulaInUDF(facetName, expectedValue) {
    var actualValue = [
        { name: facetName, properFormula: _ },
        [areaOfClass, "UDFacet"]
    ];
    return assertTestVal(expectedValue,
        actualValue,
        "properFormula"
    );
};

function assertProperReferencesInUDF(facetName, expectedValue) {
    var actualValue = [
        { name: facetName, properReferences: _ },
        [areaOfClass, "UDFacet"]
    ];
    return assertTestVal(expectedValue,
        actualValue,
        "properReferences"
    );
};

function assertNumUDFFacets(expectedNUDFFacets) { // assert on the number of UDFs
    var actualNumFacets = [size, [areaOfClass, "UDFacet"]];
    return assertTestVal(expectedNUDFFacets,
        actualNumFacets,
        "Number of UDFacets"
    );
};

function assertNumMovingFacets(expectedNumMovingFacets) {
    var actualNumFacets = [size, [areaOfClass, "MovingFacet"]];
    return assertTestVal(expectedNumMovingFacets,
        actualNumFacets,
        "Number of Moving Facets"
    );
};

function assertUDFDisabledToAvoidCircularRef(facetName, expectedValue) {
    var facet = getUDFacet(facetName);
    var actualValue = [
        { disabledToAvoidCircularRef: _ },
        [[embeddedStar, facet],
        [areaOfClass, "FacetName"]]
    ];
    return assertTestVal(expectedValue,
        actualValue,
        "UDF disabledToAvoidCircularRef value"
    );
};

function openUDFFormulaPanel(facetName) {
    var editControl = [
        { myFacet: { name: facetName } },
        [areaOfClass, "UDFFormulaPanelController"]
    ];
    return clickControl(editControl);
};

/////////////////////////////
// this function conducts a bunch of sanity tests on the solutionSetItems of an input overlay
/////////////////////////////
function assertSolutionSetItems(overlay) {
    var originalShowSolutionSetViewFlag = [{ showSolutionSet: _ }, overlay];
    var overlaySolutionSetView = [{ myOverlay: overlay }, [areaOfClass, "OverlaySolutionSetView"]];
    var overlayName = [{ name: _ }, overlay];
    // after we've opened the solutionSetView, we can look at the SolutionSetItems:
    var solutionSetItems = [{ movables: _ }, overlaySolutionSetView];
    var verifyInterItemSpacing = [map,
        [defun,
            "solutionSetItem",
            [using,
                "prevSolutionSetItem",
                [prev, solutionSetItems, "solutionSetItem"],
                [cond,
                    "prevSolutionSetItem",
                    o(
                        {
                            on: false, // i.e "solutionSetItem" is the first
                            use: [equal,
                                [offset, { element: overlaySolutionSetView, type: "top", content: true }, { element: "solutionSetItem", type: "top" }],
                                0
                            ]
                        },
                        {
                            on: true, // i.e "solutionSetItem" is not the first, so we can reference "prevSolutionSetItem"
                            use: [equal,
                                [offset, { element: "prevSolutionSetItem", type: "bottom" }, { element: "solutionSetItem", type: "top" }],
                                [{ verticalSpacingOfItems: _ }, overlaySolutionSetView]
                            ]
                        }
                    )
                ]
            ]
        ],
        solutionSetItems
    ];

    return o(
        setOverlaySolutionSetView(overlay, true),
        {
            if: [equal, [{ solutionSetSize: _ }, overlay], 0],
            then: assertTestVal(0, [size, solutionSetItems], [concatStr, o(overlayName, "'s number of solutionSetItems")]),
            else: o(
                assertTestVal(true, [greaterThan, [size, solutionSetItems], 0], [concatStr, o(overlayName, "'s positive number of solutionSetItems")]),
                // check that the firstInView in OverlaySolutionSetView is indeed the first element in solutionSetItems
                assertTestVal([first, solutionSetItems], [{ firstInView: _ }, overlaySolutionSetView], [concatStr, o(overlayName, "'s firstInView")])
            )
        },
        {
            if: [greaterThan, 0, [size, verifyInterItemSpacing]],
            then: assertTestVal(true, [bool, verifyInterItemSpacing], [concatStr, o(overlayName, "'s inter item spacing")]),
        },
        setOverlaySolutionSetView(overlay, originalShowSolutionSetViewFlag) // return things to their original state
    );
};

/////////////////////////////
// this function takes a facet name. it checks that the size of the primary overlay doesn't change when this facet is minimized and the reexpanded.
// the interesting case is of course when this facet has some selection in it prior to the minimization.
///////////////////////////// 
function selectionUnderFacetMinimizationReexpansion(facet) {
    return o(
        storeInto(primarySolutionSetSize, "primaryOverlaySolutionSetSizeBeforeFacetMinimization"),
        storeInto([{ name: _ }, facet], "nameOfFacetToBeMinimized"),
        minimizeFacetByName([{ nameOfFacetToBeMinimized: _ }, [testStore]]),
        log([concatStr, o("after minimizing ", [{ nameOfFacetToBeMinimized: _ }, [testStore]])]),
        assertOverlaySolutionSetSize(primaryOverlay, [{ primaryOverlaySolutionSetSizeBeforeFacetMinimization: _ }, [testStore]]),
        log([concatStr, o("after verifying primary's solutionSet is unfazed by the facet minimization")]),
        doubleClickControl(getFacetByName([{ nameOfFacetToBeMinimized: _ }, [testStore]])),
        log([concatStr, o("after expanding ", [{ nameOfFacetToBeMinimized: _ }, [testStore]])]),
        assertOverlaySolutionSetSize(primaryOverlay, [{ primaryOverlaySolutionSetSizeBeforeFacetMinimization: _ }, [testStore]]),
        log([concatStr, o("after verifying primary's solutionSet is unfazed by the facet's reexpansion")])
    );
};

///////////////////////
//Saved Views-related functions
///////////////////////

function getSavedViewByName(savedViewName) {
    return [
        { name: savedViewName },
        [areaOfClass, "SavedView"]
    ];
};

function isSavedViewModified(savedViewName) {
    return [{ loadedViewModified: _ }, [areaOfClass, "SaveViewController"]];
};

///////////////////////
//ZCApp related functions
///////////////////////

function pickFileInZCApp(filePath) {
    return {
        FileChoice: filePath,
        //area: [areaOfClass, "FileInputHotspot"],
        area: [{ children: { hotspot: _ } }, [areaOfClass, "DataSourceLocalFileSelectorDialogControl"]],
        subType: "pick" // "Drop", "Click"
    }
};


///////////////////////
// variable definitions
///////////////////////

var primaryOverlayUniqueID = [
    getOverlayUniqueID,
    fsAppConstants.primaryOverlayCounter
];


var primaryOverlay = [
    { uniqueID: primaryOverlayUniqueID },
    [areaOfClass, "Overlay"]
];

var favoritesOverlayUniqueID = [
    getOverlayUniqueID,
    fsAppConstants.defaultFavoritesCounter
];

var favoritesOverlay = [
    { uniqueID: favoritesOverlayUniqueID },
    [areaOfClass, "Overlay"]
];

var blacklistOverlayUniqueID = [
    getOverlayUniqueID,
    fsAppConstants.defaultBlacklistCounter
];

var blacklistOverlay = [
    { uniqueID: blacklistOverlayUniqueID },
    [areaOfClass, "Overlay"]
];

var lastOverlayAdded = [pos, 1, [{ permOverlays: _ }, [areaOfClass, "FSApp"]]]; // as [pos, 0] is the EffectiveBase

var primaryOverlayHandle = getOverlayHandle(primaryOverlay);
var favoritesOverlayHandle = getOverlayHandle(favoritesOverlay);

var nameFacet = [
    { displayedUniqueIDFacet: true },
    [areaOfClass, "Facet"]
];

var firstFrozenFacet = getFrozenFacet(0);
var firstMovingFacet = getMovingFacet(0);
var firstSliderFacet = getMovingFacet(0, "SliderFacet");
var secondSliderFacet = getMovingFacet(1, "SliderFacet");
var firstMSFacet = getMovingFacet(0, "MSFacet");

var favoritesOMF = [
    { uniqueID: favoritesOverlayUniqueID },
    [areaOfClass, "OMF"]
];
var blacklistOMF = [
    { uniqueID: blacklistOverlayUniqueID },
    [areaOfClass, "OMF"]
];
var primarySolutionSetSize = [{ solutionSetSize: _ }, primaryOverlay];
var favoritesSolutionSetSize = [{ solutionSetSize: _ }, favoritesOverlay];
var blacklistSolutionSetSize = [{ solutionSetSize: _ }, blacklistOverlay];

// Slider facet elements:
var firstSliderPrimaryOverlayXWidget = getOverlayXWidget(primaryOverlay, firstSliderFacet);
var firstSliderXPrimaryOverlay = getSelectableFacetXIntOverlay(primaryOverlay, firstSliderFacet);
// all variables here pertain to the primary overlay
var firstSliderContinuousRange = controlOfEmbeddingStar("SliderContinuousRange", firstSliderPrimaryOverlayXWidget);
var firstSliderContinuousSelectedRange = controlOfEmbeddingStar("SliderContinuousSelectedRange", firstSliderPrimaryOverlayXWidget);
var firstSliderHighValSelector = controlOfEmbeddingStar("HighValSelector", firstSliderPrimaryOverlayXWidget);
var firstSliderLowValSelector = controlOfEmbeddingStar("LowValSelector", firstSliderPrimaryOverlayXWidget);
var firstSliderOverlayXWidgetLegend = getOverlayXWidgetLegend(primaryOverlay, firstSliderFacet);
var firstSliderHighValSelection = controlOfEmbeddingStar("SliderHighValSelection", firstSliderFacet);
var firstSliderLowValSelection = controlOfEmbeddingStar("SliderLowValSelection", firstSliderFacet);
var firstSliderHighValSelectionDeleteControl = getFacetSelectionDeleteControl(firstSliderHighValSelection);
var firstSliderLowValSelectionDeleteControl = getFacetSelectionDeleteControl(firstSliderLowValSelection);
var firstSliderAmoebaControl = controlOfEmbeddingStar("FacetAmoebaControl",
    firstSliderFacet);

// MS facet elements:
var firstMSPrimaryOverlayXWidget = getOverlayXWidget(primaryOverlay, firstMSFacet);
var firstMSXPrimaryOverlay = getSelectableFacetXIntOverlay(primaryOverlay, firstMSFacet);
// all variables here pertain to the primary overlay
var firstMSOverlayXWidgetLegend = getOverlayXWidgetLegend(primaryOverlay, firstMSFacet);
var firstValueInPrimaryAndFirstMSFacet = getOverlayDiscreteValueByPos(firstMSFacet, primaryOverlay, 0);
var secondValueInPrimaryAndFirstMSFacet = getOverlayDiscreteValueByPos(firstMSFacet, primaryOverlay, 1);

var selectionsInPrimaryAndFirstMSFacet = [
    { children: { selections: _ } },
    [
        {
            myOverlay: primaryOverlay,
            myFacet: firstMSFacet
        },
        [areaOfClass, "MSSelections"]
    ]
];

// called "selectionA" as the selections in MSSelections are sorted per the msWidget sorting (alphabetical by default), and not by the order in which selections were made.
var selectionAInPrimaryAndFirstMSFacet = [pos, 0, selectionsInPrimaryAndFirstMSFacet];
var selectionBInPrimaryAndFirstMSFacet = [pos, 1, selectionsInPrimaryAndFirstMSFacet];
var selectionAInPrimaryAndFirstMSFacetDeleteControl = getFacetSelectionDeleteControl(selectionAInPrimaryAndFirstMSFacet);
var selectionBInPrimaryAndFirstMSFacetDeleteControl = getFacetSelectionDeleteControl(selectionBInPrimaryAndFirstMSFacet);


// saved views variables
var plusSavedViewButton = [areaOfClass, "SavedViewPaneNewViewControl"]
var savedViewAsButton = [areaOfClass, "SavedViewPaneSaveAsControl"]
var clearViewButton = [areaOfClass, "SavedViewPaneClearViewControl"]
var savedViewMinimizationControl = [areaOfClass, "SavedViewPaneMinimizationControl"]