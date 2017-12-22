# Keep intermediate files
.SECONDARY:

JS_SOURCES=app.js

ROOTDIR=../../../..

CDLDIR=.
CUSTOMERDIR=.
CUSTOMERDATADIR=../../../../data

include $(ROOTDIR)/lang/util/mmk

TSC=tsc --noImplicitAny

%.js: %.ts
	$(TSC) $<
