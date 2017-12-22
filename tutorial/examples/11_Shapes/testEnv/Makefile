# Keep intermediate files
.SECONDARY:

JS_SOURCES=areaTriggerTest.js changeColor.js fundIntersection1.js	  \
	jumpToMouse.js spellingerror.js testCrossAreaQuery.js testSort.js \
	undefinedQualifier.js writeThroughQuery.js


ROOTDIR=../../../../..

CDLDIR=.
CUSTOMERDIR=.
CUSTOMERDATADIR=../../../../../data

include $(ROOTDIR)/lang/util/mmk

TSC=tsc --noImplicitAny

%.js: %.ts
	$(TSC) $<
