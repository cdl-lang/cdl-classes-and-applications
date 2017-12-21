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


// %%classfile%%: "draggable.js"

var classes = {

    // This class implements a set of positioning constraints such that
    // the area wraps its embedded children. One can specify the margin
    // (left, right, top, bottom) between the wrapping area and its children.
    // At least this offset will be maintained with each of the children and
    // exactly this offset will be maintained with each of the children.
    // The default margin is 0.
    // The following margin labels can be set in the context of this class.
    // Those which apply to a set of sides apply to all those sides
    // except for those for which there is a more specific specification.
    // wrapMargin: all side
    // wrapHorizontalMargin: left and right sides
    // wrapVerticalMargin: top and bottom sides
    // wrapTopMargin: top
    // wrapBottomMargin: bottom
    // wrapLeftMargin: left
    // wrapRightMargin: right
    //
    // Setting any of these properties to false will result in there being
    // no wrapping on the relevant side(s)
    
    WrapChildren: o(
        {
            context: {
                wrapMargin: 0, // default value
                // default inheritance of properties. Each of these can
                // be overridden separately.
                wrapHorizontalMargin: [{ wrapMargin: _ }, [me]],
                wrapVerticalMargin: [{ wrapMargin: _ }, [me]],
                wrapLeftMargin: [{ wrapHorizontalMargin: _ }, [me]],
                wrapRightMargin: [{ wrapHorizontalMargin: _ }, [me]],
                wrapTopMargin: [{ wrapVerticalMargin: _ }, [me]],
                wrapBottomMargin: [{ wrapVerticalMargin: _ }, [me]],
            }
        },
        {
            qualifier: { wrapLeftMargin: true },
            position: {
                wrapLeftMinMargin: {
                    point1: { type: "left" }, 
                    point2: { type: "left", element: [embedded] },
                    min: [{ wrapLeftMargin: _ }, [me]]
                },
                wrapLeftMaxMargin: {
                    point1: { type: "left" }, 
                    point2: { type: "left", element: [embedded] },
                    max: [{ wrapLeftMargin: _ }, [me]],
                    // only one of the embedded must satisfy this constraint
                    orGroups: { label: "wrapLeftMaxMargin" }
                }
            },
        },
        {
            qualifier: { wrapRightMargin: true },
            position: {
                wrapRightMinMargin: {
                    point1: { type: "right", element: [embedded] },
                    point2: { type: "right" }, 
                    min: [{ wrapRightMargin: _ }, [me]]
                },
                wrapRightMaxMargin: {
                    point1: { type: "right", element: [embedded] },
                    point2: { type: "right" }, 
                    max: [{ wrapRightMargin: _ }, [me]],
                    // only one of the embedded must satisfy this constraint
                    orGroups: { label: "wrapRightMaxMargin" }
                }
            },
        },
        {
            qualifier: { wrapTopMargin: true },
            position: {
                wrapTopMinMargin: {
                    point1: { type: "top" }, 
                    point2: { type: "top", element: [embedded] },
                    min: [{ wrapTopMargin: _ }, [me]]
                },
                wrapTopMaxMargin: {
                    point1: { type: "top" }, 
                    point2: { type: "top", element: [embedded] },
                    max: [{ wrapTopMargin: _ }, [me]],
                    // only one of the embedded must satisfy this constraint
                    orGroups: { label: "wrapTopMaxMargin" }
                }
            },
        },
        {
            qualifier: { wrapBottomMargin: true },
            position: {
                wrapBottomMinMargin: {
                    point1: { type: "bottom", element: [embedded] },
                    point2: { type: "bottom" }, 
                    min: [{ wrapBottomMargin: _ }, [me]]
                },
                wrapBottomMaxMargin: {
                    point1: { type: "bottom", element: [embedded] },
                    point2: { type: "bottom" }, 
                    max: [{ wrapBottomMargin: _ }, [me]],
                    // only one of the embedded must satisfy this constraint
                    orGroups: { label: "wrapBottomMaxMargin" }
                }
            },
        }
    )
}
