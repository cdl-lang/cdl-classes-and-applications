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


var initGlobalDefaults = {
    scrollableSelectorItemSize: 30,
};

// %%classfile%%: "../../19_selectionChain/selector.js"
// %%classfile%%: "../../18_BasicClasses/wrap.js"
// %%classfile%%: "../../18_BasicClasses/matrixLayout.js"
// %%classfile%%: "../../18_BasicClasses/draggable.js"
// %%classfile%%: "../../18_BasicClasses/screenArea.js"
// %%classfile%%: "../crossCuttingThemes/ESIFCrossCuttingThemes.js"
// %%classfile%%: "../data/ESIFData.js"
// %%classfile%%: "../app/ESIFSlices.js"
// %%classfile%%: "ESIFSelectorSearch.js"
// %%classfile%%: "ESIFValueTranslation.js"

var classes = {
    
    // This area implements a single slice editor, which takes a slice
    // a creates a set of selectors for it.
    
    ESIFSliceEditor: o(
        { 
            context: {
                // this is the ESIFSlice area which defines the slice being
                // edited here.
                slice: mustBeDefined,
            },
            children: {
                dimensionSelector: { description: {
                    "class": "ESIFSidePanelDimensionSelector",
                    context: {
                        initialWidth: 300,
                    }
                }},
                facetSelectors: { description: {
                    "class": "ESIFFacetSelectorSidePanel",
                }}
            }
        }
    ),
    
    // The context class for the embedded selectors. It is assumed that
    // that it is embedded* inside a slice editor and has access o the
    // slice through the slice editor.
    // This class may either embed* the relevant selector or be part of the
    // selector (to allow each selector to have a different context).
    
    ESIFSelectorContext: o(
        {
            "class": o("FacetSelectorContext"),
            context: {
                selectionChain: [
                    { selectionChain: _ }, [{ slice: _ },
                                            [my, "ESIFSliceEditor"]]],
                selectedDimensionType: [
                    { selectedDimensionType: _}, [{ slice: _ },
                                                  [my, "ESIFSliceEditor"]]],
                
                // translation table for facet names

                facetTitleTranslation: o(
                    { facetName: "MS", title: "Country" },
                    { facetName: "Fund", title: "Fund" },
                    { facetName: "category_of_region",
                      title: "Region Category" },
                    { facetName: "TO", title: "Thematic Objective" },
                    { facetName: "EsfSecondaryTheme",
                      title: "ESF Secondary Theme" },
                    { facetName: "FinanceForm",
                      title: "Finance Form" },
                    { facetName: "InterventionField",
                      title: "Intervention Field" },
                )
            }
        }
    ),    

    // This class defines various selector design properties. This should
    // be placed in an area which embeds all facet selectors (each selector
    // may later decide which values to use out of this object).
    
    ESIFSelectorDesignContext: o(
        {
            context: {
                selectorTitlePalette: {
                    background: "#004494",
                    textColor: "#f0f0f0",
                    toggleMenuButtonHoverColor: "#0060b0",
                    toggleMenuTriangleColor: "#e0e0e0",
                    notSelectedMenuItem: {
                        background: "#006aba",
                        borderColor: "#003080",
                        mouseOverBackground: "#0062b2",
                        textColor: "#d0d0d0",
                    },
                    selectedMenuItem: {
                        background: "#008ada",
                        borderColor: "#002070",
                        mouseOverBackground: "#0082d2",
                        textColor: "#e0e0e0",
                    }
                },
                
                /*selectorTitlePalette: {
                    background: "#00a7a7",
                    textColor: "#000000",
                    toggleMenuTriangleColor: "#000000",
                    toggleMenuButtonHoverColor: "#00b3b3",
                    menuItemPrimaryColor: "#00b0b0",
                    menuItemTextColor: "#404040",
                    menuItemPrimaryBorderColor: "#009090",
                    menuItemSelectedColor: "#00d0d0",
                    menuItemSelectedTextColor: "#404040",
                    menuItemSelectedBorderColor: "#008080"
                    },*/
                selectorBackground: "#d0e0f0",
                searchBackground: "#c8d8e8",
                searchBorderColor: "#808080",
                selectorScrollbarCursorColor: "#a0a0a0",
            }
        }
    ),
    
    ESIFFacetSelectors: o(
        {
            "class": o("ESIFSelectorContext"),

            children: {
                selectors: {
                    // hard-coded list of facet names, for now
                    data: o("MS", "Fund", "category_of_region", "TO"),
                    description: {
                        "class": "ESIFSelectorWithTitle",
                        context: {
                            initialWidth: 300,
                            initialLeft: 0,
                            initialTop: 0
                        },
                    }
                }
            }
        }
    ),

    // Use this class to create a side panel (left or right depending on the
    // value of "panelSide") which contains all teh facets which define
    // the allocated category.
    
    ESIFFacetSelectorSidePanel: o(
        {
            "class": o("ESIFSelectorContext"),
            
            context: {
                // left or right
                panelSide: [{ facetSelectorPanelSide: _ },
                            [my, "ESIFSliceEditor"]],

                // define the initial width of the panel (enough to have
                // 5 country items side by side).
                initialWidth: 368,
            },

            position: {
                top: 0,
                bottom: 0,
                firstChildAtTop: {
                    point1: { type: "top" },
                    point2: {
                        type: "top",
                        element: [first,
                                  [{ children: { selectors: _ }}, [me]]]
                    },
                    equals: 0,
                },
                lastChildAtBottom: {
                    point1: {
                        type: "bottom",
                        element: [last,
                                  [{ children: { selectors: _ }}, [me]]]
                    },
                    point2: { type: "bottom" },
                    equals: 0
                }
            },
            
            children: {
                selectors: {
                    // hard-coded list of facet names, for now
                    data: o("MS", "Fund", "category_of_region", "TO"),
                    description: {
                        "class": "ESIFSelectorWithTitle",
                        position: {
                            left: 0,
                            right: 0,
                            // each selector under the previous one
                            underPrev: {
                                point1: {
                                    type: "bottom", element: [prev, [me]] },
                                point2: { type: "top" },
                                equals: 2
                            }
                        }  
                    }
                }
            }
        },

        {
            qualifier: { panelSide: "right" },

            "class": o("DraggableEdgeLeft"),

            context: {
                draggableEdgeLeftIsResize: true
            },

            position: {
                right: 0
            }
        },
        
        {
            qualifier: { panelSide: "left" },

            "class": o("DraggableEdgeRight"),

            context: {
                draggableEdgeRightIsResize: true
            },

            position: {
                left: 0
            },

            // adjust the response area of the drag handle so that it does not
            // cover the scrollbar.

            children: { rightDragHandle: { description: {
                context: {
                    responseWidth: 10,
                    responseCenterHorizontalOffset: 4
                }
            }}}
        }
    ),
    
    //
    // Base classes for the ESIF selector.
    //

    ESIFSelector: o(
        {
            context: {
                // the selector name (for which this selector is constructed)
                // is often also the facte name, but the dimension title
                // facet is dynamic, serving different facet names.
                selectorName: [{ param: { areaSetContent: _ }}, [me]],
                facetName: [{ selectorName: _ }, [me]],
                // take the (possibly translated) facet name as the title
                title: [
                    first,
                    o([{ facetName: [{ facetName: _ }, [me]],
                         title: _ },
                       [{ facetTitleTranslation: _ },
                        [myContext,"FacetSelector"]]],
                      [{ facetName: _ }, [me]])],

                // function to translate values of selectors to the
                // values which should be displayed for them.
                getDisplayName: [
                    { getDisplayName: _ , facetName: [{ facetName: _ }, [me]] },
                    [{ displayNameTranslation: _ },
                     [my, "ESIFValueTranslation"]]]
            },
        },
    ),

    // selector class with a title area and (optionally) a search area.
    
    ESIFSelectorWithTitle: o(
        {
            "class": o("ESIFSelectorDesign", "ESIFSelector"),

            context: {
                isFirst: [empty, [prev, [me]]],
            },

            children: {
                title: { description: {
                    "class": o("ESIFSelectorTitle"),
                }},
            }
        },
        
        {
            qualifier: { selectorName: o("MS", "Fund", "category_of_region") },
            "class": "ESIFMatrixSelector",
        },

        {
            qualifier: { selectorName: o("TO") },
            "class": o("ESIFScrollableSelector"),
            
        }
    ),

    // Use this class if the selector should be draggable
    // One still needs to set the initial position of the area. See the
    // documentation of "DraggableInContainer" for this.
    
    ESIFDraggableSelectorWithTitle: o(
        {
            "class": o("ESIFSelectorWithTitle", "DraggableInContainer"),

            context: {
                // for dragging around the container
                dragContainer: [my, "ESIFSliceEditor"],
                dragInContainerHandle: [{ children: { dragHandle: _ }}, [me]],
                // define here the initial offset and width
                // initialWidth: ?
                // initialLeft: ?
                // initialRight: ?
                // initialTop: ?
            },

            children: {
                title: { description: {
                    "class": o("DraggableEdgeRight"),
                    context: {
                        draggableEdgeRightIsResize: true,
                        initialWidth: [{ initialWidth: _ }, [embedding]]
                    }
                }},
                dragHandle: { description: {
                    "class": o("ESIFSelectorTitleDragHandle"),
                }}
            }
        }
    ),

    // Drag handle for the selector which covers the title
    
    ESIFSelectorTitleDragHandle: o(
        {
            "class": "DraggableInContainerHandle",

            position: {
                // the drag handle covers the title 
                leftAlignWithTitle: {
                    point1: { type: "left" },
                    point2: { type: "left",
                              element: [
                                  { children: { title: _ }}, [embedding]] },
                    equals: 0
                },
                rightAlignWithTitle: {
                    point1: { type: "right" },
                    point2: { type: "right",
                              element: [
                                  { children: { title: _ }}, [embedding]] },
                    equals: 0
                },
                topAlignWithTitle: {
                    point1: { type: "top" },
                    point2: { type: "top",
                              element: [
                                  { children: { title: _ }}, [embedding]] },
                    equals: 0
                },
                bottomAlignWithTitle: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom",
                              element: [
                                  { children: { title: _ }}, [embedding]] },
                    equals: 0
                }
            }
        }
    ),
        
    ESIFSelectorDesign: o(
        {
            // wrap the children (default margin is 0)
            "class": o("WrapChildren", "ESIFSelectorItemContext"),

            display: {
                background: [{ selectorBackground: _ },
                             [myContext, "ESIFSelectorDesign"]]
            },
        }
    ),

    // Context class for the selector items. Is used to specify colors and
    // other properties. Some defaults are already defined here.
    
    ESIFSelectorItemContext: {
        context: {
            itemFontFamily: "sans-serif",
            // For each of the following cases, define some or all of the
            // following properties
            // background,
            // borderColor,
            // (borderWidth is not specified here, as different item
            // classes display different borders).
            // mouseOverBackground,
            // fontSize,
            // textColor,
            // fontWeight
            itemSelectedAvailableDesign: {
                background: "#a8b8d0", // "#c0d0e0",
                borderColor: "#8090a0",
                mouseOverBackground: "#a0b0c8", 
                textColor: "#303030",
                fontWeight: 300
            },
            itemSelectedNotAvailableDesign: {
                background: "#c8c8c8",
                borderColor: "#b0b0b0", // "#909090",
                mouseOverBackground: "#c0c0c0", 
                textColor: "#909090",
                fontWeight: 300
            },
            itemNotSelectedAvailableDesign: {
                background: "#c0d0e0",
                borderColor: "#c0d0e0", // "#a8b8c8", // "#909090",
                mouseOverBackground: "#b8c8d8", 
                textColor: "#404040",
                fontWeight: 300
            },
            itemNotSelectedNotAvailableDesign: {
                background: "#d0d0d0",
                borderColor: "#d0d0d0", // "#c0d0e0", // "#a8b8c8", // "#909090",
                mouseOverBackground: "#c8c8c8", 
                textColor: "#a8a8a8",
                fontWeight: 300
            },
        },
    },

    // Single selector item base class (shared by scrolled and matrix
    // selectors).
    
    ESIFSelectorItem: o(
        {
            context: {
                getDisplayName: [{ getDisplayName: _ }, [my, "ESIFSelector"]],
                pointerInArea: [{ param: { pointerInArea: _ }}, [me]]
            },
            display: {
                background: [{ background: _ }, [{ displayProps: _ },[me]]],
                borderStyle: "solid",
                borderColor: [{ borderColor: _ }, [{ displayProps: _ },[me]]],
                text: {
                    fontFamily: [
                        { itemFontFamily: _ }, [myContext, "ESIFSelectorItem"]],
                    fontSize: 12,
                    color: [{ textColor: _ }, [{ displayProps: _ },[me]]],
                    fontWeight: [{ fontWeight: _ }, [{ displayProps: _ },[me]]],
                    value: [{ content: _ }, [me]]
                }
            }
        },

        {
            qualifier: { pointerInArea: true },

            display: {
                background: [
                    { mouseOverBackground: _}, [{ displayProps: _ },[me]]],
            }
        },
        
        {
            qualifier: { getDisplayName: true },

            display: {
                text: {
                    value: [
                        [{ getDisplayName: _ }, [me]], [{ content: _ }, [me]]
                    ]
                }
            }
        },

        {
            qualifier: { isInImplicitSolutionSet: false },

            context: {
                isClickable: false                               
            }
        },
        
        {
            qualifier: { isSelected: false, isInImplicitSolutionSet: true },

            context: {
                displayProps: [{ itemNotSelectedAvailableDesign: _ },
                               [myContext, "ESIFSelectorItem"]],
                               
            },
        },

        {
            qualifier: { isSelected: false, isInImplicitSolutionSet: false },

            context: {
                displayProps: [{ itemNotSelectedNotAvailableDesign: _ },
                               [myContext, "ESIFSelectorItem"]],
                               
            }
        },

        {
            qualifier: { isSelected: true, isInImplicitSolutionSet: true },

            context: {
                displayProps: [{ itemSelectedAvailableDesign: _ },
                               [myContext, "ESIFSelectorItem"]],
                               
            }
        },

        {
            qualifier: { isSelected: true, isInImplicitSolutionSet: false },

            context: {
                displayProps: [{ itemSelectedNotAvailableDesign: _ },
                               [myContext, "ESIFSelectorItem"]],
                               
            }
        }
    ),

    // This class defines the list of 'allValues' for this selector to
    // be (if available) the list from the slice manager (rather than the
    // list from the selection chain of the specific slice) 
    
    ESIFSelectorAllValues: o(
        {
            context: {
                // area storing the list of all values, if available.
                allValuesForFacet: [
                    { allValues: _ },
                    [{ facetName: [{ facetName: _ }, [me]] },
                     [{ children: { allValuesPerFacet: _ }},
                      [areaOfClass, "ESIFSliceManager"]]]],
            }
        },
        {
            qualifier: { allValuesForFacet:  true },
            context: {
                allValues: [{ allValuesForFacet: _ }, [me]],
            }
        }
    ),
    
    //
    // Scrollable selector
    //
    
    ESIFScrollableSelector: o(
        {
            "class": o("ESIFScrollableSelectorDesign"),
            
            children: {
                selector: { description: {
                    "class": o("ESIFSelectorAllValues",
                               { name: "ScrollableSelector",
                                 itemClass: "ESIFScrollableSelectorItem" }),
                    context: {
                        facetName: [{ facetName: _ }, [embedding]],
                        isRadioSelector: [{ isRadioSelector: _ }, [embedding]]
                    }
                }}
            }
        }
    ),

    // This class implement variant of the scrollable selector which can be
    // resized vertically
    
    ESIFVerticallyResizeableScrollableSelector: o(
        {
            "class": o("DraggableEdgeBottom", "ESIFScrollableSelector"),

            // one still needs to set the initial position (see documentation
            // of DraggableEdgeBottom).
        },

        {
            qualifier: { verticalResizeBeingDragged: true },
            
            children: { selector: { description: {
                context: {
                    // set to indicate to the scroll mechanism that resizing
                    // is taking place.
                    scrollViewBeingResized: true
                }
            }}}
        },
    ),
    
    ESIFScrollableSelectorDesign: o(
        {
            context: {
                hasTitle: [notEmpty, [{ children: { title: _ }}, [me]]]
            },
            position: {
                // default, if there are no other elements (title/search)
                listBelowOtherElements: {
                    point1: { type: "top", element: [me] },
                    point2: {
                        type: "top",
                        element: [{ children: { selector: _ }}, [me]]
                    },
                    equals: 0
                },
                // not below bottom of embedding
                notBeyondBottom: {
                    point1: { type: "bottom" },
                    point2: { type: "bottom", element: [embedding] },
                    min: 0
                }
            },
            children: {
                selector: { description: {
                    "class": "ESIFSelectorScrolledListDesign",
                    position: {
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }}
            }
        },
        {
            qualifier: { hasTitle: true, hasSearch: false },

            position: {
                listBelowOtherElements: {
                    point1: {
                        type: "bottom",
                        element: [{ children: { title: _ }}, [me]]
                    }
                }
            }
        },
        {
            qualifier: { hasSearch: true },

            position: {
                listBelowOtherElements: {
                    point1: {
                        type: "bottom",
                        element: [{ children: { search: _ }}, [me]]
                    }
                },
                searchTop: {
                    point2: {
                        type: "top",
                        element: [{ children: { search: _ }}, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { hasTitle: true, hasSearch: true },

            position: {
                searchTop: {
                    point1: {
                        type: "bottom",
                        element: [{ children: { title: _ }}, [me]]
                    }
                }
            }
        },

        {
            qualifier: { hasTitle: false, hasSearch: true },

            position: {
                searchTop: {
                    point1: { type: "top", element: [me] }
                }
            }
        }
        
    ),

    ESIFSelectorScrolledListDesign: o(
        {
            context: {
                itemSize: [
                    first,
                    o([{ scrollableSelectorItemSize: _ }, [globalDefaults]], 30)
                ],
                itemSpacing: 0,

                isDraggable: true,
                
                scrollbarWidth: 8,
                scrollbarEdgeOffset: 2,

                scrollbarCursorColor: [
                    { selectorScrollbarCursorColor: _ },
                    [myContext, "ESIFSelectorDesign"]],
                scrollbarCursorOpacity: 0.5,
                scrollbarCursorBorderRadius: 5 
            }
        }
    ),

    ESIFScrollableSelectorItem: o(
        {
            "class": "ESIFSelectorItem",

            display: {
                borderLeftWidth: 4,
                padding: 4,
                text: {
                    textAlign: "left"
                }
            }
        }
    ),
    
    //
    // Matrix selector
    //
    
    ESIFMatrixSelector: o(
        {
            "class": o("ESIFMatrixSelectorDesign"),
            children: {
                selector: { description: {
                    "class": o("ESIFSelectorAllValues",
                               { name: "MatrixSelector",
                                 itemClass: "ESIFMatrixSelectorItem" }),
                    context: {
                        facetName: [{ facetName: _ }, [embedding]],
                        isRadioSelector: [{ isRadioSelector: _ }, [embedding]]
                    }
                }}
            }
        }
    ),

    ESIFMatrixSelectorDesign: o(
        {
            children: {
                selector: { description: {
                    "class": o("ESIFSelectorMatrixDesign","WrapChildren"),
                    context: {
                        // wrap children only from below
                        wrapHorizontalMargin: false,
                        wrapTopMargin: false,
                        wrapBottomMargin: 2
                    },
                    position: {
                        left: 3,
                        right: 3,
                        belowTitleOrSearch: {
                            point1: {
                                type: "bottom",
                                element: [
                                    { children: { title: _ }}, [embedding]]
                            },
                            point2: { type: "top" },
                            equals: 2
                        },
                        firstItemAtTop: {
                            point1: { type: "top" },
                            point2: {
                                type: "top",
                                element: [first, [{ matrixItems: _ }, [me]]]
                            },
                            equals: 2
                        }
                    }
                }}
            }
        },
        {
            qualifier: { dontShowSelectors: true },

            context: {
                wrapBottomMargin: false
            },

            position: {
                wrapBottomOfTitle: {
                    point1: {
                        type: "bottom",
                        element: [{ children: { title: _ }}, [me]]
                    },
                    point2: { type: "bottom" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { hasSearch: true },

            children: {
                selector: { description: {
                    position: {
                        belowTitleOrSearch: {
                            point1: {
                                element: [
                                    { children: { search: _ }}, [embedding]]
                            },
                        }
                    }
                }}
            }
        },
        {
            qualifier: { facetName: "MS" },

            // reorder the selector values
            children: { selector: { description: {
                context: {
                    sortedItemsToShow: [
                        sort,
                        [{ itemsToShow: _ }, [me]],
                        c(unmatched, "TC"),
                    ]
                }
            }}}
        }
    ),

    ESIFSelectorMatrixDesign: o(
        {
            context: {
                minMatrixSpacing: 3,
                maxMatrixSpacing: 3,
                matrixSelectorItemMinWidth: 70,
                matrixSelectorItemMaxWidth: 140,
                preferredMinSize: 70,
                preferredMinSpacing: 3,
                orthogonalSpacing: 3,

                matrixSelectorItemHeight: 35,
            },
            position: {
                left: 0,
                right: 0
            }
        },

        {
            qualifier: { facetName: "Fund" },

            context: {
                matrixSelectorItemMinWidth: 40,
                preferredMinSize: 40,
            }
        },

        {
            qualifier: { facetName: "Dimension_Type" },

            context: {
                matrixSelectorItemMinWidth: 100,
                preferredMinSize: 100,
                matrixSelectorItemMaxWidth: 200,
                matrixSelectorItemHeight: 40,
            }
        }
    ),

    ESIFMatrixSelectorItem: o(
        {
            "class": "ESIFSelectorItem",

            display: {
                borderWidth: 2,
            },

            position: {
                height: [{ matrixSelectorItemHeight: _ },
                         [my, "ESIFSelectorMatrixDesign"]],
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: [{ matrixSelectorItemMinWidth: _ },
                          [my, "ESIFSelectorMatrixDesign"]],
                },

                maxWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: [{ matrixSelectorItemMaxWidth: _ },
                          [my, "ESIFSelectorMatrixDesign"]],
                },
            },
        },

        {
            qualifier: { isNotFirstInSubSequence: false },

            position: {
                left: 0
            }
        }
    ),

    // special types of selectors

    ESIFDimensionSelector: o(
        {
            "class": "ESIFSelectorContext",
            
            children: {
                dimensionTypeSelector: { description: {
                    "class": o("ESIFDimensionTypeSelector"),
                    
                    position: {
                        top: 0,
                        left: 0,
                        right: 0
                    },
                }},
                
                dimensionTitleSelector: { description: {
                    "class": "ESIFDimensionTitleSelector",
                    position: {
                        left: 0,
                        right: 0,
                        justUnderTypeSelector: {
                            point1: {
                                type: "bottom",
                                element: [{
                                    children: { dimensionTypeSelector: _ }},
                                          [embedding]]
                            },
                            point2: { type: "top" },
                            equals: 0
                        },
                        bottom: 0
                    }
                }},
            }
        }
    ),

    // Use this class with panelSide right/left for a dimension selector
    // which is a right or left panel (which can be resized horizontally).

    ESIFSidePanelDimensionSelector: o(
        {
            "class": o("ESIFDimensionSelector"),

            context: {
                // left or right
                panelSide: [{ dimensionSelectorPanelSide: _ },
                            [my, "ESIFSliceEditor"]],
                
                // define the initial width
                // initialWidth: ?

                // stored width (in case we want to return to it, for example,
                // when the search panel is opened)
                "^storedWidth": o(), 
                
                // is the search panel open?
                searchIsOpen: [
                    { isOpen: _ },
                    [{ children: { search: _ }},
                     [{ children: { dimensionTitleSelector: _ }}, [me]]]]
            },
            
            position: {
                top: 0,
                bottom: 0,
            }
        },

        {
            qualifier: { searchIsOpen: false },
            write: {
                searchPanelAboutToBeOpened: {
                    upon: [{ type: "MouseDown",
                             recipient: [
                                 { children: { search: _ }},
                                 [{ children: { dimensionTitleSelector: _ }},
                                  [me]]] }, [message]],
                    true: {
                        storeWidth: {
                            to: [{ storedWidth: _ }, [me]],
                            merge: [offset, { type: "left" }, { type: "right" }]
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { storedWidth: true },

            position: {
                initialWidth: {
                    equals: [{ storedWidth: _ }, [me]]
                }
            },

            write: {
                searchPanelOpened: {
                    upon: [{ searchIsOpen: _ }, [me]],
                    true: {
                        resetWasDragged: {
                            to: [{ horizontalResizeWasDragged: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        
        {
            qualifier: { panelSide: "right" },

            "class": o("DraggableEdgeLeft"),

            context: {
                draggableEdgeLeftIsResize: true
            },

            position: {
                right: 0
            }
        },
        {
            qualifier: { panelSide: "left" },

            "class": o("DraggableEdgeRight"),

            context: {
                draggableEdgeRightIsResize: true
            },

            position: {
                left: 0
            },

            // adjust the response area of the drag handle so that it does not
            // cover the scrollbar.

            children: { rightDragHandle: { description: {
                context: {
                    responseWidth: 10,
                    responseCenterHorizontalOffset: 4
                }
            }}}
        }
    ),
    
    // Use this class if you want the dimension selector to be draggable.
    // One still needs to set its initial position (see the documentation
    // of DraggableInContainer and DraggableEdgeBottom for this).
    
    ESIFDraggableDimensionSelector:  o(
        {
            "class": o("ESIFDimensionSelector", "DraggableInContainer",
                       "DraggableEdgeBottom"),
            
            context: {
                dragInContainerHandle: [
                    { children: { dragHandle: _ }}, [me]]
                // define here the initial offset and width
                // initialWidth: ?
                // initialLeft: ?
                // initialRight: ?
                // initialTop: ?
                // initialBottomSpacing: ?
            },
            
            children: {
                dragHandle: { description: {
                    "class": "DraggableInContainerHandle",
                    // the drag handle is positioned over the title of
                    // the type selector, but without overlapping the open
                    // menu button.
                    context: {
                        titleArea: [
                            { children: { title: _ }},
                            [{ children: { dimensionTypeSelector: _ }},
                             [embedding]]],
                        menuButton: [
                            { children: { openCloseButton: _ }},
                            [{ titleArea: _ }, [me]]]
                    },
                    stacking: {
                        aboveSiblings: {
                            lower: [embedding],
                            higher: [me]
                        }
                    },
                    position: {
                        alignTitleLeft: {
                            point1: { type: "left" },
                            point2: { type: "left",
                                      element: [{ titleArea: _ },[me]] },
                            equals: 0
                        },
                        alignTitleTop: {
                            point1: { type: "top" },
                            point2: { type: "top",
                                      element: [{ titleArea: _ },[me]] },
                            equals: 0
                        },
                        alignTitleBottom: {
                            point1: { type: "bottom" },
                            point2: { type: "bottom",
                                      element: [{ titleArea: _ },[me]] },
                            equals: 0
                        },
                        attachToButtonRight: {
                            point1: { type: "right" },
                            point2: { type: "left",
                                      element: [{ menuButton: _ },[me]] },
                            equals: 0
                        }
                    }
                }},
                
                dimensionTypeSelector: { description: {
                    "class": o("DraggableEdgeRight"),
                    context: {
                        draggableEdgeRightIsResize: true,
                        initialWidth: [{ initialWidth: _ }, [embedding]],
                    }
                }},

                dimensionTitleSelector: { description: {
                    context: {
                        // indicate to the scrolled list that the view is
                        // being resized
                        verticalResizeBeingDragged: [
                            { verticalResizeBeingDragged: _ }, [embedding]]
                    }
                }}
            }
        }
    ),
    
    ESIFDimensionTypeSelector: o(
        {
            "class": o("ESIFMatrixSelector", "ESIFSelector",
                       "FacetSelectorContext",
                       "ESIFDimensionTypeSelectorDesign"),
            
            context: {
                selectionChain: [
                    { dimensionTypeSelectionChain: _ },
                    [{ slice: _ }, [my, "ESIFSliceEditor"]]],
                selectorName: "Dimension_Type",
                isRadioSelector: true,
                "^dontShowSelectors": true,
                selectedDimensionType: [{ selectedDimensionType: _},
                                        [myContext, "ESIFSelector"]],
                title: [first,
                        o([{ facetName: [{ selectedDimensionType: _ }, [me]],
                             title: _ },
                           [{ facetTitleTranslation: _ },
                            [myContext,"FacetSelector"]]],
                      [{ selectedDimensionType: _ }, [me]])],
                initialWidth: [{ intialWidth: _ }, [embedding]]
            },

            display: {
                // same color as title
                background: [
                    { selectorTitlePalette: { background: _ }},
                             [myContext, "ESIFSelectorDesign"]]
            },
            
            children: { title: { description: {
                "class": o("ESIFMenuSelectorTitle")
            }}}
        }
    ),

    ESIFDimensionTypeSelectorDesign: o(
        {
            "class": o("WrapChildren", "ESIFSelectorItemContext"),
            
            context: {
                wrapBottomMargin: 4,
                // For each of the following cases, define some or all of the
                // following properties
                // background,
                // borderColor,
                // (borderWidth is not specified here, as different item
                // classes display different borders).
                // mouseOverBackground,
                // fontSize,
                // textColor,
                // fontWeight
                itemSelectedAvailableDesign: [
                    { selectorTitlePalette: { selectedMenuItem: _ }},
                    [myContext, "ESIFSelectorDesign"]],
                itemNotSelectedAvailableDesign: [
                    { selectorTitlePalette: { notSelectedMenuItem: _ }},
                    [myContext, "ESIFSelectorDesign"]],
            },

            // constraints for determining the width of the selector
            position: {
                // assign a minimal width
                minWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    min: 150, // xxxxxxxxxxx temporary
                }
            },
        }
    ),
    
    ESIFDimensionTitleSelector: o(

        {
            "class": o("ESIFScrollableSelectorDesign",
                       "ESIFSelectorDesign",
                       "ESIFSelector", "ESIFScrollableSelector",
                       "FacetSelectorContext", "ESIFSelectorItemContext"),
            context: {
                selectorName: "Dimension_title",
                selectedDimensionType: [
                    { selectedDimensionType: _ }, [myContext, "ESIFSelector"]],
                selectionChain: [
                    { selectionChain: _ }, [myContext, "ESIFSelector"]],
                facetName: [{ selectedDimensionType: _}, [me]],
            },
        },

        {
            qualifier: { facetName: "InterventionField" },

            "class": "SelectorWithSearch",
            context: {
                hasSearch: true
            },
            children: { search: { description: {
                "class": "ESIFInterventionFieldSearch"
            }}}
        },

        {
            // applies only if the area is (vertically) resizeable
            qualifier: { verticalResizeBeingDragged: true },
            
            children: { selector: { description: {
                context: {
                    // set to indicate to the scroll mechanism that resizing
                    // is taking place.
                    scrollViewBeingResized: true
                }
            }}}
        },
    ),
    
    //
    // Additional selector components
    //
    
    ESIFSelectorTitle: o(
        {
            display: {
                background: [{ selectorTitlePalette: { background: _ }},
                             [myContext, "ESIFSelectorDesign"]],
                text: {
                    fontSize: 14,
                    fontFamily: "sans-serif",
                    color: [{ selectorTitlePalette: { textColor: _ }},
                            [myContext, "ESIFSelectorDesign"]],
                    value: [{ title: _ }, [embedding]]
                }
            },

            position: {
                top: 0,
                left: 0,
                right: 0,
                height: 35
            },
        }
    ),

    ESIFMenuSelectorTitle: o(
        {
            "class": "ESIFSelectorTitle",

            context: {
                dontShowSelectors: [{ dontShowSelectors: _ }, [embedding]]
            },

            children: { openCloseButton: { description: {
                "class": "ESIFMenuTitleOpenCloseButton",
                position: {
                    width: 19,
                    height: 19,
                    "vertical-center": 0,
                    right: 10
                }
            }}}
        }
    ),

    ESIFMenuTitleOpenCloseButton: o(
        {
            context: {
                dontShowSelectors: [{ dontShowSelectors: _ }, [embedding]],
                pointerInArea: [{ param: { pointerInArea: true }}, [me]],
            },
            display: {
                padding: 4,
            },
            write: { toggleOpenClosed: {
                upon: [{ type: "MouseUp",
                         subType: o("Click","DoubleClick") },
                       [myMessage]],
                true: { toggleOpenClosed: {
                    to: [{ dontShowSelectors: _ }, [me]],
                    merge: [not, [{ dontShowSelectors: _ }, [me]]]
                }}
            }}
        },

        {
            qualifier: { pointerInArea: true },

            display: {
                background: [{ selectorTitlePalette:
                               { toggleMenuButtonHoverColor: _ }},
                             [myContext, "ESIFSelectorDesign"]]
            }
        },
        
        {
            qualifier: { dontShowSelectors: true },
            display: {
                triangle: {
                    baseSide: "top",
                    color: [
                        { selectorTitlePalette: { toggleMenuTriangleColor: _ }},
                        [myContext, "ESIFSelectorDesign"]]
                }
            }
        },

        {
            qualifier: { dontShowSelectors: false },
            display: {
                triangle: {
                    baseSide: "bottom",
                    color: [
                        { selectorTitlePalette: { toggleMenuTriangleColor: _ }},
                        [myContext, "ESIFSelectorDesign"]]
                }
            }
        }
    ),
};
