#######################################################################
#
# This file is not a stand-alone script, but is rather meant to be
#  executed from within a test script, e.g. sanityTest.sh
#
#######################################################################

################
CDLDIR=${ROOTDIR}/cdl/core/automated
################
run at_areaInFocusTest ""

run at_coselectableTest ""

run at_reorderableTest "nColumns=15"

run at_snappableTest "nColumns=15 nRows=15"

################
CDLDIR=${ROOTDIR}/cdl/custom/Mon1/automated
################
	
###############
# at_myLeanZCApp
###############
ABORT_ON_ERROR=yes # if the compilation flag fails, no point in continuing.
run at_myLeanZCApp "testName=compilationFlags"
run at_myLeanZCApp "testName=loadFiles nItems=100 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 allowRecordIDAsItemUniqueID=true"
ABORT_ON_ERROR=no 

run at_myLeanZCApp "testName=msSelections nItems=100 limitExpandedFacetsType=MS maxInitialNumFacetsExpanded=1 initialExpansionStateAllFacets=3 allowRecordIDAsItemUniqueID=true displayFacetXOSR=true"

run at_myLeanZCApp "testName=sliderSelections nItems=100 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 initialExpansionStateAllFacets=2 allowRecordIDAsItemUniqueID=true displayFacetXOSR=true"

run at_myLeanZCApp "testName=scrollItems nItems=500 maxInitialNumFacetsExpanded=2 allowRecordIDAsItemUniqueID=true"

run at_myLeanZCApp "testName=sortFacets nItems=200 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 allowRecordIDAsItemUniqueID=true"

run at_myLeanZCApp "testName=udfOperations nItems=100 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 initialExpansionStateAllFacets=2 allowRecordIDAsItemUniqueID=true"

run at_myLeanZCApp "testName=savedViews nItems=100 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 initialExpansionStateAllFacets=2 allowRecordIDAsItemUniqueID=true"

run at_myLeanZCApp "testName=solutionVerification nItems=100 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2  initialExpansionStateAllFacets=2 maxTestDuration=1000 allowRecordIDAsItemUniqueID=true"

###############
# at_myFatZCApp
###############

run at_myFatZCApp "testName=unionOverlays nItems=100 limitExpandedFacetsType=MS maxInitialNumFacetsExpanded=1 initialExpansionStateAllFacets=2 allowRecordIDAsItemUniqueID=true"

run at_myFatZCApp "testName=zoomBoxing enableZoomBoxing=true nItems=10 limitExpandedFacetsType=MS maxInitialNumFacetsExpanded=2 allowRecordIDAsItemUniqueID=true"

run at_myFatZCApp "testName=favoritesOperations nItems=100 maxInitialNumFacetsExpanded=2 allowRecordIDAsItemUniqueID=true"

run at_myFatZCApp "testName=overlayCreation nItems=10 limitExpandedFacetsType=Slider maxInitialNumFacetsExpanded=2 initialExpansionStateAllFacets=2 allowRecordIDAsItemUniqueID=true"
