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

var generalPosConst = {
    hotspotMargin: 3,
    expansionHandle1DLength: 16,
    expansionHandle1DShortLength: 12,
    expansionHandle2DDimension: 16,
    sorterUXDisplayWidth: 16,
    sorterUXDisplayHeight: 16,
    dropDownMenuMaxNumLines: 5,
    heightOfDropDownMenuLine: 20,
    searchBoxControlWidthIncrementWRTHeight: { "V1": 3, "V2": 3, "V3": 5 },
    menuItemHeight: 36,
    menuIconWidth: 36,
    menuOriginTriangleHeight: 20,
    menuOriginTriangleWidth: 12,
    menuOriginTriangleHorizontalOffsetFromOrigin: 0,

    dottedScrollerDotSpacing: 5,
    dottedScrollerSpacingFromControl: 10,
    scrollableDotRadius: 5,
    verticalOffsetToTooltip: 20,

    inputErrorHorizontalOffset: 0,
    inputErrorVerticalOffset: 2,

    modalDialogBorderWidth: 3,
    modalDialogMinWidth: 275,
    modalDialogMinHeight: 160,
    modalDialogMaxWidth: 400,
    modalDialogControlHeight: 40,
    modalDialogControlWidth: 110,
    modalDialogMinMarginAroundEmbeddedElements: 12,
    modalDialogControlVerticalMarginFromText: 12,
    modalDialogIconDimension: 40,

    okCancelModalDialogControlOffsetFromCenter: 12,
    okCancelModalDialogTextPadding: 5,

    scaleModeControlArrowBase: 13,
    scaleModeControlArrowHeight: 9,

    searchBoxHeight: 20

};

initGlobalDefaults.fsPosConst = {
    primaryTickmarkSize: 3,
    secondaryTickmarkSize: 1,

    facetControlMargin: { "V1": 2, "V2": 2, "V3": 3 },

    defaultSorterHeight: 7,
    sorterWidthToHeightRatio: 1.5,
    defaultRefreshSorterHeight: 14,

    overlayXWidgetLegendMarginFromMoreControls: { "V1": 2, "V2": 3, "V3": 4 },
    overlayXWidgetMoreControlsHeight: { "V1": 7, "V2": 7, "V3": 11 },
    overlayXWidgetMoreControlsSpacingFromPrev: { "V1": 1, "V2": 2, "V3": 2 },
    overlayXWidgetMoreControlsElementMargin: { "V1": 2, "V2": 3, "V3": 3 },
    overlayXWidgetMoreControlsElementDimension: { "V1": 3, "V2": 3, "V3": 5 },

    additionalControlsElementSpacingFromPrev: { "V1": 3, "V2": 3, "V3": 4 },
    additionalControlsElementMargin: { "V1": 3, "V2": 4, "V3": 4 },
    additionalControlsUXElementDimension: { "V1": 3, "V2": 3, "V3": 4 },

    infoIconDimension: { "V1": 12, "V2": 19, "V3": 21 },

    extraSomethingForMaxWidthOfCells: { "V1": 16, "V2": 20, "V3": 24 },

    tooltipMaxWidth: 400,
    tooltipHorizontalMargin: { "V1": 4, "V2": 5, "V3": 5 },
    tooltipVerticalMargin: { "V1": 2, "V2": 3, "V3": 3 },

    multiplierForToggleMenuItemHeight: 1.1,
    multiplierForToggleMenuItemTextHeight: 0.6
};

var bFSPosConst = {
    showOverlayInFacetControlRightMargin: 5,

    sorterUXWidth: 20,
    sorterUXHeight: 20,

    deleteControlDimension: { "V1": 8, "V2": 9, "V3": 12 },

    defaultBorderWidth: { "V1": 1, "V2": 2, "V3": 3 },

    facetBorderWidth: { "V1": 1, "V2": 2, "V3": 3 },

    //facetTopControlIconDimension: { "V1": 12, "V2": 18, "V3": 22 },

    handleHeightDimension: { "V1": 20, "V2": 25, "V3": 30 },

    // equal to handleHeightDimension

    minimizedFacetsHorizontalSpacing: { "V1": 4, "V2": 6, "V3": 8 },
    minimizedFacetsVerticalSpacing: { "V1": 4, "V2": 6, "V3": 8 },

    //defaultFacetWidthOnOneFinger: 40, // ???
    expandedFacetHeaderHeight: 50,
    horizontalMarginAroundExpandedFacetName: 10,
    defaultHorizontalMarginAroundMinimizedFacetName: 5,

    /*minWidthOfNonOMFacetXIntOSR: { "V1": 90, "V2": 95, "V3": 100 },
    minWidthOfFacetSelections: 60,*/

    facetSelectionsHorizontalMargin: 5,

    oMFOverlayLegendTopMargin: 2,
    oMFOverlayLegendDimension: { "V1": 14, "V2": 22, "V3": 28 },
    oMFContentGirth: { "V1": 18, "V2": 28, "V3": 36 },
    borderAroundOMF: 0,

    verticalSpacingOfItems: 0,
    itemHeight: { "V1": 18, "V2": 28, "V3": 36 },
    // excluding border

    verticalMarginAroundFacet: 0,
    overlayXWidgetGirth: 20,
    overlayXWidgetsSpacing: 2,
    overlayXWidgetFromVerticalWidgetTop: 0,
    overlayXWidgetFromHorizontalWidgetLeft: 0,
    amoebaControlMargin: 1,
    amoebaHorizontalMargin: 10,
    marginAboveAmoeba: 5,
    marginBelowAmoeba: 5,
    amoebaMarginFromEmbeddedOnRight: { "V1": 6, "V2": 8, "V3": 10 },

    maxInitWidthOfCells: 250,
    cellMarginFromIntersectionParents: 0,
    cellContentHorizontalMargin: 4,

    secondaryAxisSelectorMarginOnTop: 10,
    twoDPlotAxisThickness: 2,
    valueMarker2DRadius: 5,

    defaultTwoDPlotWidth: 200,

    verticalOffsetMinimizedFacetNameToOverlayLegends: 2,
    overlayLegendIntraHorizontalSpacing: 1,
    selectionsMadeOverlayLegendDimension: 10,

    facetNameTooltipWidth: 300,

    facetNameBottomMargin: { "V1": 3, "V2": 6, "V3": 9 },
    facetNameTopMargin: { "V1": 12, "V2": 14, "V3": 16 },

    amoebaControlPanelVerticalOffset: 2,
    amoebaControlPanelHorizontalOffset: 2,
    amoebaCloseControlRightMargin: 0,
    showFacetCellsControlLeftMargin: 0,
    amoebaControlPanelMarginBelow: 5,

    minimizedFacetFacetNameRightMargin: 5,
    MinimizedFacetOverlayLegendsContainerRightMargin: 4,

    horizontalMarginAroundExpandedOMFName: { "V1": 2, "V2": 3, "V3": 4 },
    //originally in fsPosConst
    binBorder: 1,
    overlayVerticalElementGirth: 20,
};

var bSliderPosConst = {
    valSelectorKnobGirth: 6,
    valSelectorKnobLength: 3,
    handleHeight: 1,
    infinityPointOffsetFromWidgetBeginning: 15,
    arrowToSelectionsHorizontalOffset: 5,
    scaleGirth: { "V1": 1, "V2": 1, "V3": 2 },

    intraWidgetMarginOnLengthAxis: { "V1": 3, "V2": 5, "V3": 7 },

    girthOfBaseOverlayXWidget: 10,

    horizontalOffsetSelectionToDeletionControl: 2,

    scaleLineToSegmentLinesOffset: 1,
    fromWidgetToScaleBeginningGirth: 10,
    fromScaleToBaseOverlayXWidgetBeginningGirth: 5,

    offsetToFirstOverlayXWidget: 0,
    overlayXWidgetGirth: 14,

    continuousRangeGirth: 10,

    numInfinityLines: 1,
    lengthOfInfinityLine: 5,
    lengthAxisSpacingOfInfinityLines: 0,
    infinityPointLengthAxisOffsetFromLastLine: 0,

    valueMarker1DRadius: { "V1": 4, "V2": 4, "V3": 5 },
    baseSetValueMarkerLength: 2,

    offsetTriggeringElasticSelection: 2,
    discreteValueNamesExpandableAreaInitialWidth: 55,
    sliderScaleEditControlMenuItemRadioButtonsHorizontalMargin: 25,
    sliderScaleEditControlMenuItemRadioButtonsLeft: 5
};

var bDiscretePosConst = {
    valueLengthAxisSpacing: 0,
    discretePrimaryWidgetFromAmoebaBottom: 10,
    valueNameMarginAtBeginningGirth: 5,
    overlayXWidgetGirth: 20,
    bottomMarginOfDiscreteValuesView: 0,
    deleteControlhorizontalMargin: 3,

    discreteCellSideInFormTest: 42,

    valueReorderHandleGirth: 10,
    reorderHandleMarginFromValueOnLengthAxis: 1,
    discreteValueNamesExpandableAreaInitialWidth: 80,
    distanceBetweenDiscreteValueNamesExpandableAreaAndFirstOverlayXWidget: 3,
    minWidthConstraintFactor: 0.65
};

var bRatingPosConst = {
    symbolHeight: 13,
    symbolWidth: 13,
    selectionHorizontalSpacing: 5,
    marginAroundSymbolsValueName: 5,
    leftMarginOfOrBetterIndicator: 5,
    deleteControlOffsetFromRatingValue: 10
};

var bFSAppPosConst = {
    appFrameHorizontalMargin: 10,
    appFrameVerticalMargin: 10,

    appControlsHeight: 24,

    heightOfDraggedOpenedLocalFile: 20,

    // these three values are hard-coding of calculated heights of the ZoomBoxPart, which we reinforce with these
    // constants as the elements used for this calculation (namely the facets and their headers) aren't guaranteed to always
    // be there.
    zoomBoxTopHeight: { "V1": 70, "V2": 82, "V3": 95 },

    horizontalMarginOfAppFrameTitles: 10,

    bigMarginOnLeftOfOverlayName: 0,

    minimizedPaneWidth: 8,

    expandedFacetSpacing: 8,

    solutionSetViewControlTriangleBase: { "V1": 9, "V2": 13, "V3": 19 },

    solutionSetViewControlTriangleHeight: { "V1": 4, "V2": 6, "V3": 8 },

    solutionSetViewControlTriangleMarginOnSides: 2,
    solutionSetViewControlTriangleBaseFromEmbedding: 4,
    solutionSetViewControlTriangleTipFromEmbedding: 3,

    solutionSetViewControlDimension: { "V1": 13, "V2": 15, "V3": 17 },
    solutionSetViewControlHotspotMargin: 1,

    visibleOverlayFrameWidth: 1,

    bottomOfZoomBoxingVisibleOverlayToBottomOfZoomBoxTop: 5,
    horizontalSpacingOfZoomBoxingOSRs: 10,
    marginAboveZoomBoxingOSR: 0,
    marginBelowZoomBoxingOSR: 2,

    marginFromZoomBoxOrnament: 5,
    horizontalSpacingBetweenFacetViewPanes: 0,
    expandedOverlaysViewToMinimizedFacetsView: 10,
    facetViewPaneOffsetFromZoomBoxTop: 10,

    verticalOffsetOfBaseOverlaySolutionSetViewFromFacetHeaders: 2,

    heightOfZoomBoxingOverlaySolutionSetView: 120,

    verticalMarginBelowZoomBoxingOverlaySolutionSetView: 10,

    frozenFacetViewPaneLeftFromExpandedOverlaysViewLeft: 5,
    movingFacetViewPaneRightFromExpandedOverlaysViewRight: 0,
    offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom: 10,
    zoomBoxBottomTopFromExpandedOverlaysViewTop: 0,

    horizontalOffsetOfAppFrameMinimizationButtonFromAppFrame: 5,
    verticalOffsetOfAppFrameMinimizationButtonFromAppFrame: 5,

    effectiveBaseSummaryLeftOffset: 10,
    maximizedAppFrameWidth: 3,
    minimizedAppFrameWidth: 3,
    zoomBoxOrnamentWidth: 1,

    bottomViewHeight: 40,
    osrElementsHorizontalSpacing: { "V1": 6, "V2": 8, "V3": 10 },

    firstVerticalVisibleOverlayFromTopOfView: 0,
    verticalVisibleOverlaysSpacing: 0,
    firstHorizontalVisibleOverlayFromLeftOfView: 10,
    horizontalVisibleOverlaysSpacing: 5,
    visibleOverlayVerticalOffsetFromViewRefPoint: 0,
    minimizedVisibleOverlayHorizontalSpacing: 10,
    minimizedVisibleOverlayVerticalSpacing: 10,

    bottomViewFromFacetViewPane: 0,
    bottomViewsHorizontalMarginFromEmbedding: 10,
    bottomViewsMarginFromBottomOfEmbedding: 0,
    dimensionOfAppTrashDisplay: 40,
    marginAroundTrashDisplay: 2,
    marginAboveOpenAppTrash: 0,
    horizontalOffsetMinimizedOverlaysViewToClosedAppTrash: 0,

    minimizedFacetsViewOffsetFromZoomBoxRight: 10,
    minimizedFacetViewPaneVerticalBorder: 1,

    facetSnappableControlRadius: 25,
    facetSnappableControlTriangleSide: 12,

    minimizedFacetOverlayLegendsContainerTopBottomMargin: 2,
    minimizedFacetOverlayLegendsContainerWidth: 15,

    minimizedFacetOverlayLegendsItemHeight: 4,
    MinimizedFacetOverlayLegendsItemSpacingFromPrev: 2,

    minimizedFacetOverlayLegendsMenuItemLineHorizontalMargin: 8,
    minimizedFacetOverlayLegendsMenuItemLineWidth: 32,
    minimizedFacetOverlayLegendsMenuItemLineHeight: 6,

    densityControlOptionsHorizontalSpacing: 4,
    appSettingsControlHeight: 19,
    appSettingsControlWidth: 25,
    appSettingsControlsHorizontalSpacing: 10,
    connectionIndicatorFromExternalDataSourceSelectorTitle: 10,

    effectiveBaseSummaryHorizontalMargin: 5,

    horizontalMinimizedPaneTriangleWidth: 6,
    horizontalMinimizedPaneTriangleHeight: 12,
    verticalMinimizedPaneTriangleWidth: 12,
    verticalMinimizedPaneTriangleHeight: 6,

    zoomBoxOrnamentOffsetFromZoomBox: 2,

    minimizedPaneIconDimension: { "V1": 14, "V2": 16, "V3": 18 }
};


var bTransitions = { // in seconds!
    defaultVal: 0.5,
    movingFacet: 0.5,
    expandedFacetStarts: 0,
    expandedFacetStops: 1,
    movingAmoeba: 0.5,

    visibleOverlayPosition: 0.5,
    overlayDuplicateNameWarningHeight: 0.5
};

var bFSAppSandwichMenuPositioningConstraints = {
    sandwichMenuButtonHeight: 40
};

initGlobalDefaults.histogramPosConst = {
    moreControlsTopMargin: { "V1": 0, "V2": 3, "V3": 3 },
    scaleCrossbarGirth: 1,
    histogramViewWidth: { "V1": 120, "V2": 140, "V3": 160 },
    histogramViewBeginningBorderWidth: 3,
    horizontalSpacingBetweenHistograms: { "V1": 5, "V2": 5, "V3": 5 },
    verticalSpacingBetweenHistograms: { "V1": 8, "V2": 8, "V3": 8 },
    linearLogControlHorizontalMargin: 2,
    marginOnHorizontalHistogramViewLeft: { "V1": 6, "V2": 6, "V3": 6 },
    marginOnHorizontalHistogramViewRight: { "V1": 37, "V2": 45, "V3": 53 },
    marginOnVerticalHistogramViewBottom: { "V1": 2, "V2": 3, "V3": 4 },
    marginOnVerticalHistogramViewTop: { "V1": 37, "V2": 45, "V3": 53 },
    histogramBarValDisplayFixedHeight: 15,
    baseBarMarginFromBin: 1,
    offsetOfHistogramBarFromItsValDisplay: 0,
    horizontalMeasureFacetTitleTopMargin: { "V1": 3, "V2": 5, "V3": 7 },
    horizontalMarginAroundHistogramScaleControlDisplay: 0,
    histogramScaleControlTopMargin: 5,
    spacingBeforeHistogramOr2DPlot: 2,
    minWidthForSolutionSetHistogramBar: 2,
    solutionSetBarSpacing: 1,
    measureTitleElementsHorizontalSpacing: { "V1": 3, "V2": 4, "V3": 5 },
    dropDownMenuHeight: { "V1": 12, "V2": 14, "V3": 16 },
    dropDownMenusVerticalOffset: { "V1": 1, "V2": 2, "V3": 3 },
    measureFacetDropDownMenuVerticalOffsetFromHistogramView: { "V1": 6, "V2": 10, "V3": 14 },
    dropDownMenuSearchBoxMargin: { "V1": 1, "V2": 2, "V3": 3 },
    dropDownMenuMarginFromMenuableBottom: { "V1": 1, "V2": 2, "V3": 2 },
    dropDownMenuHorizontalMarginFromHistogramView: { "V1": 9, "V2": 11, "V3": 13 },
    uDFMeasureFacetAggregationControlDimensionScaledown: 0.75,
    uDFMeasureFacetAggregationControlOffsetFromMeasureFacetName: { "V1": 10, "V2": 15, "V3": 20 },
    uDFMeasureFacetAggregationControlHeight: { "V1": 14, "V2": 16, "V3": 18 },
    uDFMeasureFacetAggregationControlWidth: { "V1": 24, "V2": 26, "V3": 30 }
};

initGlobalDefaults.bFSAppDataSourcePosConst = {
    paneTitleHeight: { "V1": 44, "V2": 54, "V3": 56 },
    heightOfDataSourceFileSelectorDialogControl: { "V1": 18, "V2": 21, "V3": 25 },
    dataSourceTrashMarginOnRight: 30,
    dataSourceSelectorCentralSeparatorWidth: 2,
    dataSourceSelectorCentralSeparatorVerticalMargin: 5,
    //    marginAboveZCLandingPageTitle: 10,
    //    marginBelowZCLandingPageTitle: 10,
    marginBelowDataSourceSelectorsOnLandingPage: 5,
    dataSourceSelectorTitleLeftMargin: 10,
    dataSourceSelectorTitleVerticalMargin: { "V1": 8, "V2": 10, "V3": 12 },
    dataSourceDropDownBottomMargin: { "V1": 2, "V2": 3, "V3": 4 },
    dataSourceDropDownMarginFromRefreshButton: { "V1": 4, "V2": 6, "V3": 8 },
    dataSourceRefreshControlWidth: { "V1": 80, "V2": 85, "V3": 105 },
    dataSourceRefreshControlHeight: { "V1": 13, "V2": 15, "V3": 17 },
    dataSourceRefreshControlIconDimension: { "V1": 11, "V2": 11, "V3": 13 },
    dataSourceRefreshControlIconMargin: { "V1": 1, "V2": 2, "V3": 2 },
    horizontalSeparatorVerticalMargin: 10,

    showDataSourcePaneControlExternalRadius: 9,
    showDataSourcePaneControlInternalRadius: 7,
    showDataSourcePaneControlTriangleBase: 8,
    showDataSourcePaneControlTriangleHeight: 6,

    dataSourceSelectorTitleBackgroundToViewOffset: 0,
    dataSourceSelectorViewOffsetToTopSeparator: 0,
    openedDataSourceHorizontalSpacing: 10,
    openedDataSourceVerticalSpacing: 4,
    appDataSourceSelectorsContainerHorizontalMargin: 0,
    appDataSourceSelectorsHeight: 200,
    dataSourceSelectorTopSeparatorHeight: 0, // invisible for now
    dataSourceSelectorsBottomSeparatorHeight: 1,
    dataSourceSelectorHorizontalSeparatorWidth: 2,

    initHeightOfDataSourceSelectors: { "V1": 150, "V2": 200, "V3": 250 },

    dataSourceSelectorTopSeparatorHorizontalMargin: 10,

    invitationTextContainerMargin: 5,
    leftMarginOfDataSourceSelectorFromEmbedded: { "V1": 4, "V2": 6, "V3": 8 },
    rightMarginOfDataSourceSelectorFromEmbedded: { "V1": 0, "V2": 0, "V3": 0 },
    horizontalMarginAroundHorizontalSeparator: 2,

    horizontalMarginOfSourceSelectorTitle: { "V1": 8, "V2": 10, "V3": 12 },

    fileSelectorDialogControlMargin: { "V1": 8, "V2": 10, "V3": 12 },

    dataSourceIconToNameHorizontalMargin: 3,

    dataSourceNameWidth: { "V1": 60, "V2": 70, "V3": 90 },

    dataSourceTitlePaneHorizontalMargin: { "V1": 8, "V2": 10, "V3": 12 },

    dataSourceTitleVerticalMargin: { "V1": 4, "V2": 6, "V3": 8 },

    datasourceSearchBoxWidth: { "V1": 146, "V2": 170, "V3": 200 },
    datasourceSearchBoxHeight: { "V1": 26, "V2": 32, "V3": 38 },

    widthOfUploadedDataSourceName: 300,
    marginAroundRemoteUploadFileDrop: 30,

    externalDataSourceDeleteControlRadius: { "V1": 6, "V2": 8, "V3": 9 },

    marginAroundDropSiteForDraggedOpenedLocalFile: 2
};

initGlobalDefaults.bFSAppNewSlicePosConst = {
    buttonLabelHorizontalSpacing: { "V1": 2, "V2": 3, "V3": 4 },

    //offsetFromZoomBoxOrnament: 5,

    horizontalOffsetBetweenFilterAndListContainers: { "V1": 10, "V2": 10, "V3": 10 },

    horizontalOffsetBetweenNewSlicePaneAndMinimizedOverlaysView: { "V1": 0, "V2": 0, "V3": 0 }
};

var bFSAppBoxStatsPosConst = {
    boxMarginFromStatsContainer: 2,
    boxStatsMedianWidth: 1
};

var bFSAppFacetFormulaPanelPosConst = {
    keyboardExpansionControlVerticalSpacing: 3,
};


initGlobalDefaults.facetSettingsPanelPosConst = {
    hyperlinkInfoIconWidth: 320,
    verticalOffsetBetweenLabelAndAreaContent: 4,
    defaultSpacing: 5,
    facetTypeButtonWidth: { "V1": 90, "V2": 105, "V3": 125 },
    buttonHeight: { "V1": 12, "V2": 15, "V3": 18 }
};

initGlobalDefaults.discretePosConst = {
    selectionControlBorderWidth: { "V1": 3, "V2": 3, "V3": 4 },
    selectionControlRadius: { "V1": 7.5, "V2": 8.5, "V3": 9.5 },
    valueMarker1DRadius: { "V1": 2.5, "V2": 3.5, "V3": 3.5 },
    valueMarker1DRadiusFormTest: 5,
    defaultHeightOfDiscreteValue: { "V1": 22, "V2": 24, "V3": 26 }
};

initGlobalDefaults.sliderPosConst = {
    scaleSegmentLineGirth: 2,
    valSelectorDisplayRootWidth: 4,
    valSelectorDisplayRootHeight: 7,
    valSelectorDisplayVerticalMarginFromEmbedding: 6,
    valSelectorDisplayHorizontalMarginFromEmbedding: 10,
    valSelectorDisplayBodyHeightWhenEdited: { "V1": 14, "V2": 15, "V3": 19 },
    valSelectorDisplayBodyWidthWhenEdited: { "V1": 60, "V2": 80, "V3": 100 },
    sliderHistogramBinCountControlFromRightmostHistogramView: { "V1": 8, "V2": 10, "V3": 12 },
    continuousRangeContentGirth: { "V1": 19, "V2": 21, "V3": 25 },
    selectorGirthAxis: { "V1": 10, "V2": 12, "V3": 14 },
    selectorRectangleLengthAxis: { "V1": 8, "V2": 10, "V3": 12 },
    continuousRangeInnerFrameContentGirth: { "V1": 1, "V2": 2, "V3": 2 }
};

initGlobalDefaults.msPosConst = {
    horizontalMarginAroundWidgetControls: 5,
    sorterMarginAboveValuesView: { "V1": 8, "V2": 10, "V3": 12 },
};

initGlobalDefaults.oMFConst = {
    oMMRadius: { "V1": 3.5, "V2": 4.5, "V3": 5.5 },
    selectionControlRadius: { "V1": 7.5, "V2": 8.5, "V3": 12.5 },
    selectionControlBorderWidth: { "V1": 2, "V2": 2, "V3": 4 }
};

initGlobalDefaults.fsAppPosConst = {
    marginBetweenZoomBoxAndExpandedFrame: { "V1": 40, "V2": 44, "V3": 48 },
    margin: { "V1": 1, "V2": 2, "V3": 3 },

    appControlMargin: { "V1": 2, "V2": 2, "V3": 3 },
    appElementDimension: { "V1": 15, "V2": 21, "V3": 25 },

    offsetBottomOfFacetHeaderAnchorAndZoomBoxOrnamentTop: { "V1": 50, "V2": 60, "V3": 65 },
    marginBelowOverlayXWidgetMoreControls: { "V1": 14, "V2": 16, "V3": 18 },

    amoebaControlVerticalMargin: { "V1": 1, "V2": 2, "V3": 3 },
    amoebaControlHorizontalMargin: { "V1": 4, "V2": 5, "V3": 6 },

    newElementButtonDimension: { "V1": 20, "V2": 25, "V3": 30 },

    marginOnRightOfNewElementLabel: { "V1": 8, "V2": 10, "V3": 12 },

    /*searchBoxIconWidth: { "V1": 20, "V2": 20, "V3": 36 },
    searchBoxIconHeight: { "V1": 17, "V2": 17, "V3": 31 },
*/
    appUserElementHeight: { "V1": 20, "V2": 25, "V3": 30 },

    facetTagsHorizontalSpacing: { "V1": 2, "V2": 3, "V3": 4 },
    facetTagsVerticalSpacing: { "V1": 2, "V2": 3, "V3": 4 },

    expandedOSRHeight: { "V1": 22, "V2": 26, "V3": 32 },
    widthOfOSRControls: { "V1": 120, "V2": 150, "V3": 180 },

    newSliceContainerWidth: { "V1": 60, "V2": 80, "V3": 100 },

    minimizedFacetWidth: { "V1": 130, "V2": 148, "V3": 182 },
    minimizedFacetViewPaneHorizontalMarginAroundScrollbar: 3,

    // override default values above in a few cases:    
    minimizedFacetSearchBoxIconWidth: { "V1": 18, "V3": 26 },
    minimizedFacetSearchBoxIconHeight: { "V1": 15, "V3": 22 },

    effectiveBaseSummaryVerticalMargin: { "V1": 4, "V2": 6, "V3": 8 },

    facetSelectionVerticalMarginToEmbedding: { "V1": 1, "V2": 1, "V3": 1 },

    expansionControllerDefaultSize: { "V1": 12, "V2": 14, "V3": 16 },

    expansionControllerDefaultTriangleSize: { "V1": 6, "V2": 8, "V3": 10 },

    overlayNameWidth: { "V1": 68, "V2": 76, "V3": 94 },

    overlaySearchBoxHeightMargin: { "V1": 2, "V2": 3, "V3": 4 },

    widthOfMinimizedSearchBox: { "V1": 20, "V2": 25, "V3": 30 },

    widthOfExpandedOverlaySearchBox: { "V1": 106, "V2": 117, "V3": 144 },

    widthOfSearchBoxMinimizationButton: { "V1": 5, "V2": 7, "V3": 10 },

    widthOfSearchBoxMinimizationButtonTriangle: { "V1": 3, "V2": 5, "V3": 7 },

    heightOfSearchBoxMinimizationButtonTriangle: { "V1": 4, "V2": 6, "V3": 8 },

    widthOfTotalMinimizedOverlaySearchBox: { "V1": 126, "V2": 142, "V3": 174 },

    minimizedFacetViewPaneTagsPaneControlsMarginFromEmbedded: { "V1": 2, "V2": 3, "V3": 3 },

    minimizedFacetsColumnNumControlHeight: { "V1": 5, "V2": 6, "V3": 9 },
    minimizedFacetsColumnNumControlBase: { "V1": 8, "V2": 10, "V3": 15 },
    minimizedFacetsColumnNumControlHotspotMargin: { "V1": 2, "V2": 2, "V3": 3 },
    minimizedFacetsColumnNumControlMarginFromIcon: { "V1": 2, "V2": 2, "V3": 3 },
    minimizedFacetsColumnNumControlCoreVerticalMargin: { "V1": 0, "V2": 1, "V3": 0 },
    minimizedFacetsNumColumnsControlIconBarWidth: { "V1": 7, "V2": 9, "V3": 13 },
    minimizedFacetsNumColumnsControlIconBarHeight: { "V1": 1, "V2": 2, "V3": 3 },
    numColumnsControlIconBarRadius: { "V1": 1, "V2": 3, "V3": 5 }
};

initGlobalDefaults.fsAppSavedViewPosConst = {
    widthOfMinimizedSavedViewPane: { "V1": 18, "V2": 22, "V3": 26 },
    savedViewPaneExpandedWidth: { "V1": 140, "V2": 190, "V3": 220 },

    horizontalMarginFromSavedViewPane: { "V1": 10, "V2": 10, "V3": 10 },
    marginWithinSavedViewPane: { "V1": 6, "V2": 8, "V3": 10 },

    heightOfSavedViewPaneControl: { "V1": 20, "V2": 25, "V3": 40 },

    widthOfSaveNewViewAndSaveAsControls: { "V1": 56, "V2": 80, "V3": 94 },

    savedViewHeight: { "V1": 37, "V2": 45, "V3": 45 },
    savedViewNameSemiCircleRadius: { "V1": 12, "V2": 12, "V3": 12 },
    loadedSavedViewWidth: { "V1": 115, "V2": 165, "V3": 180 },
    nonLoadedSavedViewWidth: { "V1": 105, "V2": 147, "V3": 174 },
    savedViewNameVerticalSpacing: { "V1": 6, "V2": 8, "V3": 10 },

    savedViewNameRightMarginOnSaveAs: { "V1": 4, "V2": 5, "V3": 7 },

    savedViewNameBlurRadius: { "V1": 4, "V2": 5, "V3": 7 },

    trashedSavedViewWidth: { "V1": 150, "V2": 175, "V3": 200 }
};

initGlobalDefaults.bFSAppTrashPosConst = {
    tabNameWidth: 80,

    trashDisplayDimension: { "V1": 28, "V2": 34, "V3": 40 },

    trashDisplayBottomMargin: { "V1": 5, "V2": 8, "V3": 8 },

    offsetOfTrashDisplayFromEmbeddingVerticalCenter: -10,

    marginAboveTab: { "V1": 10, "V2": 10, "V3": 10 },

    /*    tabNameWidth: { "V1": 80, "V2": 100, "V3": 120 },
        tabNameHeight: { "V1": 20, "V2": 25, "V3": 30 },
    */
    tabNameVerticalMargin: { "V1": 2, "V2": 4, "V3": 6 },

    heightOfUnselectedTab: { "V1": 29, "V2": 29, "V3": 29 },

    incHeightOfSelectedTab: { "V1": 4, "V2": 4, "V3": 4 },

    tabClipWidth: { "V1": 13, "V2": 13, "V3": 13 },

    selectedTabClipIncWidth: { "V1": 1, "V2": 1, "V3": 1 },

    marginBelowTrashTabViewHandle: { "V1": 0, "V2": 0, "V3": 0 },

    trashedElementHorizontalSpacing: { "V1": 4, "V2": 6, "V3": 8 },

    trashedElementVerticalSpacing: { "V1": 4, "V2": 6, "V3": 8 }

};

initGlobalDefaults.numericPosConst = {
    scaleLineGirth: { "V1": 1, "V2": 1, "V3": 2 },
};

initGlobalDefaults.datePosConst = {
    continousRangeMarginOnHorizontalAxis: { "V1": 60, "V2": 70, "V3": 80 },
    continousRangeMarginOnVerticalAxis: { "V1": 25, "V2": 30, "V3": 35 },
    scaleLineDefaultLength: 300,
    dateScaleElementTopMargin: { "V1": 0, "V2": 0, "V3": 0 },
    tickmarkToTextVerticalOffset: { "V1": 4, "V2": 6, "V3": 8 }
};

initGlobalDefaults.exportApp = {
    verticalMarginOfTitle: 10,
    horizontalMarginOfTitle: 10,
    microMargin: 1,
    tinyMargin: 2,
    smallMargin: 5,
    defaultMargin: 10,
    mediumMargin: 20,
    hugeMargin: 50
};

initGlobalDefaults.calculatorPosConst = {
    buttonSpacing: 7
};

initGlobalDefaults.uDFPosConst = {
    horizontalMarginAroundUDFEditor: 10,
    editorMarginFromEmbedded: 7,
    verticalMarginBelowInputField: 7,
    keypadButtonWidth: { "V1": 30, "V2": 34, "V3": 38 },
    keypadButtonHeight: { "V1": 14, "V2": 16, "V3": 18 },
    keypadButtonHorizontalSpacing: 5,
    keypadButtonVerticalSpacing: 5,
    editorOffsetFromFacetHeaderBottom: 0,
    editorKeypadControlDimension: 10,
    timeButtonsSectionVerticalMarginFactor: 2
};

