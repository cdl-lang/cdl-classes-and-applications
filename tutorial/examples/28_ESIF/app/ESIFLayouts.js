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


// This file defines classes which define layouts of the application.

var classes = {

    // This layout class defines a layout which consists of a single
    // view (displaying slices) and selectors.
    
    ESIFSingleViewLayout: o(
        {
            "class": o("ESIFSelectorDesignContext",
                       "ESIFSliceViewDesignContext"),
            
            context: {
                // this should hold an object whose 'id' attribute stores
                // the ID of the single view which is currently displayed
                // in the layout.
                activeView: mustBeDefined,

                // is there a slice being edited
                sliceBeingEdited: [
                    notEmpty, [{ slice: _ },
                               { children: { selectors: _ }}, [me]]]
            },
            
            children: {
                view: { description: {
                    "class": "ESIFView",
                    context: {
                        // This provide the ESIFView class access to the
                        // view properties
                        id: [{ id: _ }, [{ activeView: _ }, [embedding]]]
                    },

                    // temporary design xxxxxxxxxxxxxx
                    
                    position: {
                        // left and right determined by the selectors
                        top: 0,
                        bottom: 0
                    },

                    display: {
                        borderStyle: "solid",
                        borderWidth: 4,
                        borderColor: "#004494",
                    }
                }},

                selectors: { description: {
                    "class": o("ESIFSliceEditor",
                               "ESIFSingleViewSliceEditorLayout"),
                    context: {
                        // the ID of the slice being edited (may be empty)
                        "^editedSliceId": o(),
                        slice: [
                            { id: [{ editedSliceId: _ }, [me]] },
                            [{ slices: _ }, [areaOfClass, "ESIFSliceManager"]]],
                        hasSlice: [notEmpty, [{ slice: _ }, [me]]],
                    }
                }}
            }
        },
    ),
    
    // Layout for the selectors
    
    ESIFSingleViewSliceEditorLayout: o({

        context: {
            dimensionSelectorPanelSide: "right",
            facetSelectorPanelSide: "left",            
            // when editing is turned on or off and, as a result, the selectors
            // should be shown or hidden, this number runs from 0 to 1
            // over the specified period of time (defined below). This
            // allows transition animation to take place.
            sumTimeVariables: [sum,
                o(
                    [{ startTransition: _ }, [me]],
                    [{ transitionDuration: _ }, [me]],
                    [{ endTransition: _ }, [me]]
                )
            ],
            timeFunction: [time, 
                [{ hasSlice: _ }, [me]], 
                0.05,
                [{ sumTimeVariables: _ }, [me]]
            ],
            selectorShowOrHideFactor: [
                min, 1,
                [div,
                 [max, 0,
                  [minus,
                   [{ timeFunction: _ }, [me]],
                   [{ startTransition: _ }, [me]]]],
                 [{ transitionDuration: _ }, [me]]]],
            // delay in starting transition. This allows various calculations
            // to take place before the transition begins. During this
            // time, selectorShowOrHideFactor remains 0.
            inTheMiddleOfAnimation: [Rco(0, [{ sumTimeVariables: _ }, [me]]), [{ timeFunction: _ }, [me]]],
            //inTheMiddleOfAnimation: [Roo(0,1), [{ selectorShowOrHideFactor: _ }, [me]]],            
            startTransition: 0.3,
            // duration of the transition. This begins after the startTransition
            // time has elapsed.
            transitionDuration: 0.4,
            endTransition: 0.5
        },
        
        position: {
            top: 0,
            bottom: 0,
            facetSelectorLeftOfView: {
                point1: { type: "right",
                          element: [{ children: { facetSelectors: _ }}, [me]] },
                point2: { type: "left",
                          element: [{ children: { view: _ }}, [embedding]] },
                equals: 0
            },
            dimensionSelectorRightOfView: {
                point1: { type: "left",
                          element: [
                              { children: { dimensionSelector: _ }}, [me]] },
                point2: { type: "right",
                          element: [{ children: { view: _ }}, [embedding]] },
                equals: 0
            },

            showDimensionSelector: {
                point1: { type: "right", element: [embedding] },
                point2: { type: "right",
                          element: [
                              { children: { dimensionSelector: _ }}, [me]] },
                
                equals: [{ dimensionSelectorHide: _ }, [me]],
            },

            showFacetSelectors: {
                point1: { type: "left",
                          element: [
                              { children: { facetSelectors: _ }}, [me]] },
                point2: { type: "left", element: [embedding] },
                equals: [{ facetSelectorHide: _ }, [me]]
            }
        },
    },{
        // no slice being edited
        qualifier: { slice: false },

        context: {
            // how many pixels of the dimension selector need to be hidden
            // (between 0 and the full width of the selector)
            dimensionSelectorHide: [
                mul,
                [{ selectorShowOrHideFactor: _ }, [me]],
                [offset,
                 { type: "left",
                   element: [
                       { children: { dimensionSelector: _ }}, [me]] },
                 { type: "right",
                   element: [
                       { children: { dimensionSelector: _ }}, [me]] },
                 
                ]],
            facetSelectorHide: [
                mul,
                [{ selectorShowOrHideFactor: _ }, [me]],
                [offset,
                 { type: "left",
                   element: [
                       { children: { facetSelectors: _ }}, [me]] },
                 { type: "right",
                   element: [
                       { children: { facetSelectors: _ }}, [me]] }]]
        }
    },{
        // a slice is being edited
        qualifier: { slice: true },

        context: {
            // how many pixels of the dimension selector need to be hidden
            // (between 0 and the full width of the selector)
            dimensionSelectorHide: [
                mul,
                [minus, 1, [{ selectorShowOrHideFactor: _ }, [me]]],
                [offset,
                 { type: "left",
                   element: [
                       { children: { dimensionSelector: _ }}, [me]] },
                 { type: "right",
                   element: [
                       { children: { dimensionSelector: _ }}, [me]] },
                 
                ]],
            facetSelectorHide: [
                mul,
                [minus, 1, [{ selectorShowOrHideFactor: _ }, [me]]],
                [offset,
                 { type: "left",
                   element: [
                       { children: { facetSelectors: _ }}, [me]] },
                 { type: "right",
                   element: [
                       { children: { facetSelectors: _ }}, [me]] }]]
        }
    })
};
