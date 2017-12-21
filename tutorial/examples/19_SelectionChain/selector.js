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


// %%classfile%%: "selectionChain.js"
// %%classfile%%: "../18_BasicClasses/scrollableDesign.js"
// %%classfile%%: "../18_BasicClasses/matrixLayout.js"

// This file defines the basic functionality for a component which selects
// on a single facet. This does not define any of the visual aspects of
// the selection, but simply handles the logical aspects of this selection.
// These classes can then be inherited together with other classes which
// determine the design of the selection component.

var classes = {

    // The context class for the facet selector, which should be inherited
    // by one of the embedding* classes of the facet selector provides
    // access to input required by the facet selector.
    
    FacetSelectorContext: {

        context: {
            // selection chain
            selectionChain: mustBeDefined,
            // the place to which the selections should be written
            selectedValues: [{ selectedValues: _ },
                             [{ selectionChain: _ }, [me]]],
        }
    },

    // Context class for items in a facet selector
    ItemSelectorContext: {
        context: {
            // if this is true, only one item can be selected at a time
            isRadioSelector: false
        }
    },
    
    FacetSelector: o(
        {
            // this area is the myContext area for individual item selectors
            // embedded inside it. These can access this are using
            // [myContext, "ItemSelector"]
            "class": o("ItemSelectorContext"),
            context: {
                facetName: mustBeDefined,
                selectionChain: [
                    { selectionChain: _ }, [myContext, "FacetSelector"]],
                // access to the list of selection values for this facet.
                // Writing true/false through the query
                // {
                //   facetName: <name of this facet>
                //   value: <value>,
                //   selected: _
                // }
                // applied to this will
                // result in the given value being added/removed as a
                // selected value for this facet.
                selectionValues: [
                    // currently, writing through two selections does not
                    // work, so both the selection on the value and the
                    // selection on the facet name must take place at the
                    // same time, at the place where the value is known
                    // { facetName: [{ facetName: _ }, [me]] },
                    { selectedValues: _ }, [myContext, "FacetSelector"]],
                
                // all values which may appear in this selector, regardless
                // of the selections performed on the input data. This is
                // the list of values that is available in the input data
                // set.
                allValues: [
                    _,
                    [[{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ facetName: _ }, [me]],
                     [{ inputData: _ }, [{ selectionChain: _ }, [me]]]]],
                // values in implicit solution set
                availableValues: [_,
                    [[{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ facetName: _ }, [me]],
                     [
                         [{ getImplicitSolutionSet: _ },
                          [{ selectionChain: _ }, [me]]],
                         [{ facetName: _ }, [me]]
                     ]]],

                // values in solution set
                solutionSetValues: [
                    _,
                    [[{ projectOnFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ facetName: _ }, [me]],
                     [{ solutionSet: _ }, [{ selectionChain: _ }, [me]]]]
                ],

                // selected values (the value for this facet which are currently
                // selected).
                selectedValues: [
                    { facetName: [{ facetName: _ }, [me]],
                      value: _,
                      selected: true },
                    [{ selectionValues: _ }, [me]]],
            }
        },

        // If a primaryFacet is defined, then the facet selector defines a query
        // on the path <primaryFacet>.<facetName>.
        // Multiple selectors with the same primary key are considered to
        // select together under the primary key path (in other words,
        // it will only select sub-items under the primary key which are
        // matched by both selections).
        
        {
            qualifier: { primaryFacet: true },

            context: {

                // access to the list of selection values for this facet.
                // Writing true/false through the query
                // { value: <value>, selected: _ } applied to this will
                // result in the given value being added/removed as a
                // selected value for this facet.
                selectionValues: [
                    // currently, writing through two selections does not
                    // work, so both the selection on the value and the
                    // selection on the facet name must take place at the
                    // same time, at the place where the value is known
                    // { facetName: [{ facetName: _ }, [me]] },
                    { facetName: [{ primaryFacet: _ }, [me]],
                      subFacets: _ },
                     [{ selectedValues: _ }, [myContext, "FacetSelector"]]],

                // all values which may appear in this selector, regardless
                // of the selections performed on the input data. This is
                // the list of values that is available in the input data
                // set.
                allValues: [
                    _,
                    [[{ projectOnSubFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ primaryFacet: _ },[me]], [{ facetName: _ }, [me]],
                     // apply this projection function on the projection of
                     // the input data on the primary facet.
                     [[[defun, o("x"), { "#x": _ }],[{ primaryFacet: _ },[me]]],
                      [{ inputData: _ }, [{ selectionChain: _ }, [me]]]]]],
                // values in implicit solution set
                availableValues: [_,
                    [[{ projectOnSubFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ primaryFacet: _ },[me]], [{ facetName: _ }, [me]],
                     [
                         [{ getSubFacetImplicitSolutionSet: _ },
                          [{ selectionChain: _ }, [me]]],
                         [{ primaryFacet: _ }, [me]], [{ facetName: _ }, [me]]
                     ]]
                ],

                // values in solution set
                solutionSetValues: [_,
                    [[{ projectOnSubFacet: _ }, [{ selectionChain: _ }, [me]]],
                     [{ primaryFacet: _ },[me]], [{ facetName: _ }, [me]],
                     [
                         [{ getProjectedSolutionSet: _ },
                          [{ selectionChain: _ }, [me]]],
                         [{ primaryFacet: _ }, [me]]
                     ]]
                ],
            }
        }
    ),

    // This class should be used for creating the button for selecting
    // and deselecting an item in the selection list, if one wishes the
    // selection to be performed by a toggle switch. Both 'radio' selection
    // (where exactly one item is selected) and multiple selection modes
    // are supported (whether it is the one or the other is determined in
    // the selector class, since this has to be agreed for all items in the
    // selector).
    // This class can also be used as the item class for scrolled lists
    // of selector items.

    // This class assumes that the content of the item is the value on which
    // it selects
    
    FacetSelectorItem: o(
        {
            context: {

                // if this is a radio selector, exactly one value may be
                // selected for this facet (though initially zero values
                // may be selected).
                isRadioSelector: [{ isRadioSelector: _ },
                                  [myContext, "ItemSelector"]],
                
                // is the value in the implicit solution set?
                isInImplicitSolutionSet: [
                    notEmpty,
                    [[{ content: _ }, [me]],
                     [{ availableValues: _ }, [myContext, "ItemSelector"]]]],
                // is the value in the solution set?
                isInSolutionSet: [
                    notEmpty,
                    [[{ content: _ }, [me]],
                     [{ solutionSetValues: _ }, [myContext, "ItemSelector"]]]],

                isClickable: true // disable from inheriting class
            }
        },

        {
            qualifier: { isClickable:true, isRadioSelector: false },

            context: {
                isSelected: [
                    {
                        facetName: [{ facetName: _ },
                                    [myContext, "ItemSelector"]],
                        value: [{ content: _ }, [me]],
                        selected: _
                    },
                    [{ selectionValues: _ }, [myContext, "ItemSelector"]]
                ]
            },
            
            write: {
                toggleSelected: {
                    upon: [{ type: "MouseUp",
                             subType: o("Click","DoubleClick") }, [myMessage]],
                    true: {
                        toggleSelected: {
                            to: [{ isSelected: _ }, [me]],
                            merge: [not, [{ isSelected: _ }, [me]]]
                        }
                    }
                }
            }
        },

        {
            // if this is a radio selector, exactly one value may be selected
            // for this facet (though initially zero values may be selected).
            qualifier: { isClickable:true, isRadioSelector: true },

            context: {
                selectedValue: [
                    {
                        facetName: [{ facetName: _ },
                                    [myContext, "ItemSelector"]],
                        value: _,
                        selected: true
                    },
                    [{ selectionValues: _ }, [myContext, "ItemSelector"]]
                ],
                isSelected: [
                    notEmpty,
                    [[{ content: _ }, [me]], [{ selectedValue: _ },[me]]]]

            },
            
            write: {
                toggleSelected: {
                    upon: [{ type: "MouseUp",
                             subType: o("Click","DoubleClick") }, [myMessage]],
                    true: {
                        setSelected: {
                            to: [{ selectedValue: _ }, [me]],
                            merge: [{ content: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),
    
    
    // This is the most basic implementation of a selector: the list of
    // values is a scrollable vertical list. The exact design properties
    // are not specified by this class but need to be specified by the
    // derived classes.
    //
    // To change design properties of the scrolled list of items, the
    // relevant properties (see VerticalScrollableWithScrollbarBasicDesign)
    // need to be set on this area.
    //
    // To modify the properties of the individual items, one needs to
    // set the item class as a parameter when using this class. So, instead
    // of simple writing;
    //
    // "class": o(..., "ScrollableSelector", ...)
    //
    // one should use:
    //
    // "class": o(...,
    //            { name: "ScrollableSelector", itemClass: <item class name> },
    //            ....)
    
    ScrollableSelector: o(
        {
            "class": o("FacetSelector",
                       "VerticalScrollableWithScrollbarBasicDesign"),

            context: {
                // by default, all values appear in the list
                itemsToShow: [{ allValues: _ }, [me]],
                // this is the [myContext, "ScrolledDocument"] area for
                // the scrolled list.
                scrolledData: [{ itemsToShow: _ }, [me]]
            },
                    
            children: { scrollView: { description: {
                children: { scrolledDocument: { description: {
                    children: { itemsInView: { description: {
                        "class": o("$itemClass", "FacetSelectorItem")
                    }}}
                }}}
            }}},
        },
        {
            // When a derived class defines 'sortedItemsToShow', this list
            // is used as input for the list of items to be displayed, rather
            // that 'itemsToShow'. Typically, 'sortedItemsToShow' will be
            // the result of applying a sort operation on the 'itemsToShow'
            // list.
            qualifier: { sortedItemsToShow: true },

            context: {
                scrolledData: [{ sortedItemsToShow: _ }, [me]] 
            }
        }
    ),

    // This class is to be used to place a set of selector buttons in
    // a matrix grid. The positioning constraint on the items and
    // the matrix as a whole need to be defined by the inheriting class.
    //
    // To modify the properties of the individual items, one needs to
    // set the item class as a parameter when using this class. So, instead
    // of simple writing;
    //
    // "class": o(..., "MatrixSelector", ...)
    //
    // one should use:
    //
    // "class": o(...,
    //            { name: "MatrixSelector", itemClass: <item class name> },
    //            ....)
    //
    // Default spacing between the rows/columns in the matrix can be
    // specified as in the UniformMatrix class (see documentation of that
    // class)
    
    MatrixSelector: o(
        {
            "class": o("FacetSelector", "UniformMatrix"),

            context: {
                // by default, all values appear in the list
                itemsToShow: [{ allValues: _ }, [me]],
                matrixItems: [{ children: { matrixItems: _ }},[me]],
            },
            children: { matrixItems: {
                data: [{ itemsToShow: _ }, [me]], 
                description: {
                    "class": o("$itemClass", "FacetSelectorItem",
                               "UniformMatrixItem"),
                    content: [{ param: { areaSetContent: _ }},[me]]
                }
            }}
        },

        {
            // When a derived class defines 'sortedItemsToShow', this list
            // is used as input for the list of items to be displayed, rather
            // that 'itemsToShow'. Typically, 'sortedItemsToShow' will be
            // the result of applying a sort operation on the 'itemsToShow'
            // list.
            qualifier: { sortedItemsToShow: true },

            children: { matrixItems: {
                data: [{ sortedItemsToShow: _ }, [me]],
            }}
        }
    ),

    // This class implements an area which contains a selector area (e.g.
    // MatrixSelector or ScrollableSelector above) and a search area,
    // which is used to filter the items to show in the selector. This class
    // is mainly responsible for connecting these two components together
    // and for providing a place to store the search criteria which were
    // applied.
    // It is assumed here that the selector only displays the items which
    // appear in its context label 'itemsToShow'.
    // This class needs to be inherited with a priority higher than that of
    // the base selector so that it can override the standard definition
    // of vrious fields (such as 'itemsToShow').
    
    SelectorWithSearch: o(
        {
            children: {
                search: { description: {
                    "class": "SelectorSearch"
                }},

                selector: { description: {
                    context: {
                        // the selector will only display the items which appear
                        // in the 'matchedItems' list of the search area.
                        itemsToShow: [
                            { matchedItems: _ },
                            [{ children: { search: _ }}, [embedding]]]
                    }
                }}
            }
        }
    ),

    // This class is inherited by the area which implements the
    // search operation (the 'search' child of 'SelectorWithSearch').
    // This class provides access to selector information (such as the list
    // of selector items available and the fcet name).
    // It is assumed by the SelectorWithSearch class that the list of
    // matched items is place in this area under the context label
    // 'matchedItems'.
    
    SelectorSearch: o(
        {
            context: {
                facetName: [{ facetName: _ }, [embedding]],
                // the input into the search operation
                inputData: [{ allValues: _ },
                            [{ children: { selector: _ }}, [embedding]]],
                // the result of the search operation. By default, the same
                // as the input.
                matchedItems: mustBeDefined
            },
        }
    )
};
