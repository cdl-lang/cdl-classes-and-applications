CDL
===

## Introduction

CDL is a mature functional programming language for web-based applications.

## Dependencies

In order to develop cdl programs, you have to install the following via npm:

* typescript@2.2.2
* uglify-js@2.7.5

### Dependencies Notes

* uglifyjs is only needed when you want to build a minified/uglified version of
  the runtime.

* The Makefile assumes `tsc` and `uglifyjs` are the commands to invoke
  them and that they are installed globally. If your system is organized
  differently, please change the definitions of the makefile variables `TSC` in
  `scripts/feg/Makefile` and scripts/remoting/Makefile, and/or `UGLIFY` in
  `utils/mmk`.

* Building a persistence server or running tests downloads node
  modules via npm, and that the persistence server depends on websockets, which
  in turn requires a C compiler to build.

## Third party source code

For printing and saving to SVG the following libraries are used

* dom-to-image: converts HTML to png or svg;
  version: 2.6.0;
  source: https://github.com/tsayen/dom-to-image;
  license: MIT

* FileSaver: a file-save-as function that is compatible with many browsers;
  version: 1.3.3;
  source: https://github.com/eligrey/FileSaver.js;
  license: MIT

## License

[Apache 2.0](./link_to_license_file)
