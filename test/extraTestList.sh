#######################################################################
#
# This file is not a stand-alone script, but is rather meant to be
#  executed from within a test script, e.g. fulltest.sh
#
#######################################################################

################
CDLDIR=${ROOTDIR}/cdl/custom/Mon1/automated
################
# run at_myFatFSApp "testName=overlayRename nItems=10 maxInitialNumFacetsExpanded=2"
# run at_myLeanSF1App "testName=sliderSelectorDrag nItems=5000 maxInitialNumFacetsExpanded=2"

################
CDLDIR=${ROOTDIR}/cdl/core/automated
################
run at_b1082EvaluationNodeActivationTest ""
