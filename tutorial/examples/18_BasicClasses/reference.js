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


// This file defines basic reference mechanisms to allow one area to access
// a set of values defined in some other area.
//
// When a class X takes input (parameters, data) which is expected to be
// defined elsewhere, one can defined a class XContext which can be inherited
// by some area embedding* an area of class X. Inside class X,
// [myContext, "X"] will provide access to the first (closest)
// embedding* area which is of class "XContext".
//
// [globalContext, "X"] returns references to all XContext areas, but it is
// meant to be used when there is only one such area, close to the top.
//
// Remark: [myContext, ] may only be used with a constant string
// as argument (because class names must be constants).

var myContext = [
    defun, "className",
    [first, [[embeddingStar],
             [areaOfClass, [concatStr, o("className", "Context")]]]]
];

var globalContext = [
    defun, "className",
    [areaOfClass, [concatStr, o("className", "Context")]]
];

var my = [
    defun, "className",
    [first, [[embeddingStar], [areaOfClass, "className"]]]];
