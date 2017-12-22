# Keep intermediate files
.SECONDARY:

JS_SOURCES=ESIFApp.js

ROOTDIR=../../../../..

CDLDIR=.
CUSTOMERDIR=.
CUSTOMERDATADIR=../../../../../data

include $(ROOTDIR)/lang/util/mmk

TSC=tsc --noImplicitAny

%.js: %.ts
	$(TSC) $<
