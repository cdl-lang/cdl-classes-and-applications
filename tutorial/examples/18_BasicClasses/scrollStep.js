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


// %%classfile%%: "scrollToAnchor.js"

// The classes in this file implement 'scroll step' controllers, that is,
// controllers which change the scroll position by a specified 'step', such
// as item backward/forward or page backward/forward.
//
// For uniform item scrolled documents, this can be implemented directly
// by calculating the desired offset between the document and the view.
// For non-uniform item scrolling this makes use of the scroll to anchor
// mechanism.

var classes = {

    // This implements a scroll step controller for a uniform item
    // scrolled document based on the required change in offset of the
    // scrolled document. The offset between the document and the view is
    // changed directly, by calculating the new offset and setting it on the
    // 'initialScrollOffset' (together with setting 'wasMoved' to false).
    // This class is inherited by specific classes (defined below) which
    // implement +/-1 item scroll or +/-1 page scroll.
    // This class can be embedded* under any area useing class
    // ScrolledDocumentContext such that the scrolled document belonging
    // to is a uniform item scrolled document. 
    
    UniformScrollStepController: o(
        {
            context: {
                
                scrolledDocument: [{ scrolledDocument: _ },
                                   [myContext, "ScrolledDocument"]],

                // define the maximal scroll offset (the minimal is 0).
                // This is the minimal scroll larger than 0 which brings
                // the last item into full view.
                maxScrollOffset: [max, 0,
                                  [minus,
                                   [{ documentLength: _ },
                                    [{ scrolledDocument: _ }, [me]]],
                                   [{ viewLength: _ },
                                    [{ scrolledDocument: _ }, [me]]]]]
            },

            // this write operation implements the scrolling operation.
            // The 'upon' which triggers it must be defined by the
            // derived class as well as the scroll offset to which the
            // the document needs to be scrolled.

            write: {
                // add write clauses as below (under different clause names
                // in case more than one upon can trigger the write (and
                // the scroll required for each of them is different):
                //
                // scrollByOffset: {
                //    "class": "UniformScrollStepWrite"
                      // add here the 'upon' and 'merge' clauses (see
                      // "UniformScrollStepWrite" for more details)
                // }
            }
        }
    ),

    // auxiliary class to define a single write operation (a single
    // controller may implement more than one of these).

    UniformScrollStepWrite: {
        // upon should be defined in derived class
        true: {
            setScrollOffset: {
                to: [{ initialScrollOffset: _ },
                     [{ scrolledDocument: _ }, [me]]],
                // merge: should be defined in derived class
            },
            resetToInitialOffset: {
                to: [{ wasMoved: _ },
                     [{ scrolledDocument: _ }, [me]]],
                merge: false
            }
        }
    },
    
    // scroll one item forward

    // 'upon' of write clause below must be defined by 
    
    UniformScrollToNextItemController: o(
        {
            "class": "UniformScrollStepController",

            write: {
                scrollToNext: {
                    "class": "UniformScrollStepWrite",
                    // add here the 'upon' to trigger the scroll
                    true: {
                        setScrollOffset: {
                            merge: [min,
                                    [plus,
                                     [{ startViewOffset: _ },
                                      [{ scrolledDocument: _ }, [me]]],
                                     [{ itemOffset: _ },
                                      [{ scrolledDocument: _ }, [me]]]],
                                    [{ maxScrollOffset: _ }, [me]]]
                        }
                    }
                } 
            }
        }
    ),

    UniformScrollToPrevItemController: o(
        {
            "class": "UniformScrollStepController",

            write: {
                scrollToPrev: {
                    "class": "UniformScrollStepWrite",
                    // add here the 'upon' to trigger the scroll
                    true: {
                        setScrollOffset: {
                            merge: [max, 0,
                                    [minus,
                                     [{ startViewOffset: _ },
                                      [{ scrolledDocument: _ }, [me]]],
                                     [{ itemOffset: _ },
                                      [{ scrolledDocument: _ }, [me]]]]]
                        }
                    }
                }
            }
        }
    ),  
};
