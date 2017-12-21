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

// %%classfile%%: "dataLoader.js"
// %%classfile%%: "inspector.js"
// %%classfile%%: "selectionChain.js"
// %%classfile%%: "slice.js"
// %%classfile%%: "utils.js"

var classes = {

    /*--------------------
    Main class
    --------------------*/
    MainArea: {
        class: "DataLoader", // provides data, attributes from uploadedData 
        context: {
            // required: uploadedData, topLevelFacetsParams, sumFieldName
            "^selectedSlice": [first, [{ children: { slices: _ } }, [me]]],
        },
        position: {
            frame: 0
        },
        children: {
            multiFacetSelector: {
                description: {
                    "class": "Inspector",
                    context: {
                        topLevelFacetsParams: [{ topLevelFacetsParams: _ }, [embedding]],
                        firstLevelFacetsParams: [{ firstLevelFacetsParams: _ }, [embedding]],
                    },
                    position: {
                        left: 10,
                        bottom: 10,
                        top: 10,
                        rightToTheLeftOfCenter: {
                            point1: { type: "right" },
                            point2: { element: [embedding], type: "horizontal-center" },
                            equals: 10,
                        },
                    }
                }
            },
            slices: {
                data: o(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
                description: {
                    "class": "Slice",
                    context: {
                        sumFieldsParams: [{ sumFieldsParams: _ }, [embedding]],
                        topPointConstraint: [cond,
                            [prev, [me]],
                            o(
                                { on: true, use: { element: [prev, [me]], type: "bottom" } },
                                { on: false, use: { element: [embedding], type: "top" } }
                            )
                        ],
                    },
                    position: {
                        leftToTheRightOfCenter: {
                            point1: { element: [embedding], type: "horizontal-center" },
                            point2: { type: "left" },
                            equals: 20,
                        },
                        topConstrint: {
                            point1: [{ topPointConstraint: _ }, [me]],
                            point2: { type: "top" },
                            equals: 10
                        },
                        width: 500,
                        // height depending on labels                        
                    }
                }
            }
        }
    }


};
