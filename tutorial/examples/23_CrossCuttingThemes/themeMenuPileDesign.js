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


// This file provides a template for a specific design of the theme menu
// (and, more specifically, the design of top themes which have sub-themes
// under them). The classes here provide an extension of the top theme
// item classes on the theme menu.

var classes = {

    // Special design class for displaying a closed top-theme which has
    // sub-themes. This should be used to extend a TopLevelThemeMatrixItem
    // area but only does anything under the { hasSubThemes: true } qualifier.
    // This extension class implements a design where the sub-themes of a closed
    // top theme are displayed as a stack of areas. The number of areas visible
    // in the pile can be determined, but this number cannot be larger than
    // the number of sub-themes actually available. When the top theme
    // is opened, the sub-theme areas can be animated as moving from the
    // pile to the position under the open top theme.
    //
    // The following parameters need to be specified for the design class:
    //
    // pileVShift: the vertical shift (in pixels) between consecutive areas
    //     in the pile.
    // pileHShift: the horizontal shift (in pixels) between consecutive areas
    //     in the pile.
    // pileColors: an ordered set of colors (of the type that can be taken
    //     by the color fields of the 'display' section). These are the
    //     colors assigned to the different areas in the pile, with the
    //     first color being the color of the topmost area. If there are
    //     more areas displayed than colors, the last color in the list
    //     is assigned to all remaining areas.
    // pileBorderColor: color to use for the border of each area in the
    //     pile on the side where the next area in the pile is visible.
    // pileBorderWidth: the widths (in pixels) of the border on the side
    //    where the next area in the pile is visible. By default this is 1,
    //    which is usually the right number.
    // pileBackgroundColor: the color of the background behind the pile. 
    // maxNumInPile: the number of areas to display in the pile. This is a
    //     maximum: if the number of sub-themes (including the top-theme)
    //     is smaller than this number, only that number of items is
    //     displayed in the pile.

    TopThemeItemWithCloseSubThemePileExt: o(
        {
            qualifier: { hasSubThemes: true },

            "class": "TransitionToIsOpen",
            
            context: {
                
                // default value
                maxNumInPile: 3,
                
                // default value
                pileBorderWidth: 1,
                
                // number of areas to display in the pile, including the
                // top element
                numInPile: [min, o([size, [{ children: { subItems: _ }}, [me]]],
                                   [{ maxNumInPile: _ }, [me]])],
                maxIndexInPile: [minus, [{ numInPile: _ }, [me]], 1],
            },

            children: {
                subItems: {
                    description: {
                        "class": "ClosedSubThemePileItem"
                    }
                }
            }
        },

        {
            qualifier: { hasSubThemes: true, isOpen: false },

            display: {
                background: [{ pileBackgroundColor: _ }, [me]],
            },
        },

        {
            qualifier: { transitionToIsOpen:  true },

            display: {
                transitions: {
                    background: [{ transitionTime: _ }, [me]]
                }
            }
        }
    ),

    // Auxiliary transition classes

    // applies at the top level item while it is being opened
    TransitionToIsOpen: Transition("isOpen",
                                   [plus, 0.1, [{ transitionTime: _ }, [me]]]),

    // applies at sub-items while the top level item is being opened.
    TransitionToIsTopThemeOpen: Transition("isTopThemeOpen",
                                           [plus, 0.1,
                                            [{ transitionTime: _ }, [me]]]),
    
    // This class implements the sub-theme items when the top theme item is
    // closed.
    
    ClosedSubThemePileItem: o(

        {
            "class": "SubThemeItem",

            context: {
                // the index in the pile: all areas beyond the maximal
                // index get the same maximal index.
                indexInPile: [min, [{ maxIndexInPile: _ }, [embedding]],
                              [index, [{ children: { subItems: _ }},
                                       [embedding]], [me]]],
            },
            
            // for correct piling, each area must be higher than the next
            stacking: {
                higherThanTheNext: {
                    lower: [next, [me]],
                    higher: [me]
                }
            }
        },

        {
            qualifier: { isTopTheme: false },

            "class": "TransitionToIsTopThemeOpen",

            context: {
                transitionTime: [{ transitionTime: _ }, [embedding]]
            },            
        },

        {
            qualifier: { transitionToIsTopThemeOpen: true },
            
            display: {
                transitions: {
                    top: [{ transitionTime: _ }, [me]],
                    left: [{ transitionTime: _ }, [me]],
                    width: [{ transitionTime: _ }, [me]],
                    height: [{ transitionTime: _ }, [me]],
                }
            }
        },
        
        // this class only applies when the top theme is closed
        
        {
            qualifier: { isTopThemeOpen: false, isTopTheme: false },
            
            "class": "ItemInThemePile"
        },

        {
            qualifier: { isTopThemeOpen: false, isTopTheme: true },

            // in this case, the pile item is displayed by a child of this
            // area, not the area itself, so that the area could extend to
            // the full size of the top theme item and display the text
            // aligned based on this positions.

            context: {
                // bring required properties here, to make them available
                // for the child.
                maxIndexInPile: [{ maxIndexInPile: _ }, [embedding]],
                pileHShift: [{ pileHShift: _ }, [embedding]],
                pileVShift: [{ pileVShift: _ }, [embedding]],
                pileColors: [{ pileColors: _ }, [embedding]],
                pileBorderColor: [{ pileBorderColor: _ }, [embedding]],
                pileBorderWidth: [{ pileBorderWidth: _ }, [embedding]],
            },

            position: {
                frame: 0
            },

            stacking: {
                belowParentText: {
                    higher: [me],
                    lower: [{ children: { pileItem: _ }}, [me]]
                },
                pileItemAboveNextPileItem: {
                    higher: [{ children: { pileItem: _ }}, [me]],
                    lower: [next, [me]]
                }
            },

            children: {
                pileItem: {
                    description: {
                        "class": "ItemInThemePile",
                        context: {
                            indexInPile: [{ indexInPile: _ }, [embedding]]
                        }
                    }
                }
            }
        }
    ),

    ItemInThemePile: o(
        {
            position: {
                left: [mul, [{ pileHShift: _ }, [embedding]],
                       [{ indexInPile: _ }, [me]]],
                top: [mul, [{ pileVShift: _ }, [embedding]],
                      [{ indexInPile: _ }, [me]]],
                right: [mul, [{ pileHShift: _ }, [embedding]],
                        [minus, [{ maxIndexInPile: _ }, [embedding]],
                         [{ indexInPile: _ }, [me]]]],
                bottom: [mul, [{ pileVShift: _ }, [embedding]],
                         [minus,
                          [{ maxIndexInPile: _ }, [embedding]],
                          [{ indexInPile: _ }, [me]]]],
            },
            
            display: {
                background: [first,
                             o([pos, [{ indexInPile: _ }, [me]], 
                                [{ pileColors: _ }, [embedding]]],
                               [last, [{ pileColors: _ }, [embedding]]])],
                borderStyle: "solid",
                borderColor: [{ pileBorderColor: _ }, [embedding]],
                borderBottomWidth: [{ pileBorderWidth: _ }, [embedding]],
                borderRightWidth: [{ pileBorderWidth: _ }, [embedding]]
            },
        }
    )    
};
