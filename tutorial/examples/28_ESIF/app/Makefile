# Keep intermediate files
.SECONDARY:

JS_SOURCES=fileLoad.js

ROOTDIR=../../../../..

CDLDIR=.
CUSTOMERDIR=.
CUSTOMERDATADIR=../../../../../data

include $(ROOTDIR)/util/mmk

TSC=tsc --noImplicitAny

%.js: %.ts
	$(TSC) $<
