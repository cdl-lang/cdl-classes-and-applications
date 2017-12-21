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



var classes = {
    
    Selectable: o(
        {
            context: {
                elementId: mustBeDefined, 
                selectedIds: mustBeDefined, // must be writable
                // an os when multiple choice is on
                multipleChoice: true                
            },
            children: {
                selectableBox: {
                    description: {
                        "class": "SelectableTickBox",
                        context: {
                            elementId: [{ elementId: _ }, [embedding]],
                            selectedIds: [{ selectedIds: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    ),

    SelectableTickBox: o(
        {
            context: {
                elementId: mustBeDefined,
                selectedIds: mustBeDefined,
                selected: [[{ elementId: _ }, [me]], [{ selectedIds: _ }, [me]]],
                multipleChoice: [{ multipleChoice: _ }, [embedding]],
            },
            write: {
                onClick: {
                    upon: [{ type: "MouseUp", subType: "Click" }, [myMessage]],
                    true: {
                        toggleSelected: {
                            to: [{ selectedIds: _ }, [me]],
                            merge: [{ mergeOperation: _ }, [me]]
                        }
                    }
                }
            },
            display: {
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "black"
            }
        },
        {
            qualifier: { multipleChoice: true, selected: false },
            context: {
                mergeOperation: push([{ elementId: _ }, [me]]) // adds a value to an os
            }
        },
        {
            qualifier: { multipleChoice: true, selected: true },
            context: {
                mergeOperation: [n([{ elementId: _ }, [me]]), [{ selectedIds: _ }, [me]]]
            }            
        },
        {
            qualifier: { multipleChoice: false, selected: false },
            context: {
                mergeOperation: [{ elementId: _ }, [me]]
            }
        },
        {
            qualifier: {selected: true},
            display: {
                //background: "black"
                text: {
                    value: "✔",
                    fontSize: 10,
                }
            }            
        }
    )
}