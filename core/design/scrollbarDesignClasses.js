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

// %%classfile%%: <generalDesignClasses.js>

var scrollbarPosConst = {
    scrollerGirth: 6,
    scrollerBorderRadius: 3,
    fixedLengthScroller: 20,
    scrollbarMarginFromScroller: 1,
    scrollbarBorderWidth: 1,
    marginAroundScrollbar: 1,
    scrollbarMarginFromView: 3,
    buttonInScrollbarContainerLength: 10,
    offsetBetweenDocAndScrollbar: 2
};

scrollbarPosConst.widthOfScrollbar = scrollbarPosConst.scrollerGirth +
                                                 scrollbarPosConst.scrollerBorderRadius +
                                                 scrollbarPosConst.scrollbarMarginFromScroller +
                                                 scrollbarPosConst.marginAroundScrollbar;
scrollbarPosConst.docOffsetAllowingForScrollbar = scrollbarPosConst.widthOfScrollbar + 
                                                  scrollbarPosConst.offsetBetweenDocAndScrollbar;

 var classes = {

    ///////////////////////////////////////////////
    ScrollbarContainerDesign: o(
        { 
            qualifier: { show: true },
            "class": o("RoundedCorners", "BackgroundColor"),
            context: {
                borderRadius: [sum, 
                               o(
                                 scrollbarPosConst.scrollerBorderRadius, 
                                 scrollbarPosConst.scrollbarMarginFromScroller,
                                 scrollbarPosConst.scrollbarBorderWidth,
                                 scrollbarPosConst.marginAroundScrollbar
                                )
                              ]
            },
            display: {
                pointerOpaque: false
            }      
        }
    ),
    
    ///////////////////////////////////////////////
    ScrollbarDesign: {
        "class": o("RoundedCorners", "Border"),
        context: {
            borderRadius: [sum, 
                           o(
                             scrollbarPosConst.scrollerBorderRadius, 
                             scrollbarPosConst.scrollbarMarginFromScroller,
                             scrollbarPosConst.scrollbarBorderWidth
                            )
                          ],
            borderWidth: [{ myScrollbarContainer: { scrollbarBorderWidth:_ } }, [me]],
            borderColor: [{ myScrollbarContainer: { scrollbarBorderColor:_ } }, [me]]
        },
        display: {
            pointerOpaque: true
        }        
    },
    
    ///////////////////////////////////////////////
    ScrollableControlDesign: {
        display: {
            pointerOpaque: false
        }
    },
    
    ///////////////////////////////////////////////
    ScrollerDesign: o(
        { // default
            "class": o("BackgroundColor", "RoundedCorners"),
            context: {
                borderRadius: scrollbarPosConst.scrollerBorderRadius, 
                color: [{ myScrollbarContainer: { scrollerDefaultColor:_ } }, [me]]
            }
        },
        {
            qualifier: { inFocus: true,
                         tmd: false },
            context: {
                color: [{ myScrollbarContainer: { scrollerOnHoverColor:_ } }, [me]]
            }
        },
        {
            qualifier: { tmd: true },
            context: {
                color: [{ myScrollbarContainer: { scrollerOnDraggedColor:_ } }, [me]]
            }
        }
    ),
    
    ///////////////////////////////////////////////
    // API:
    // 1. inAreaOfScrollbarContainer
    ButtonInScrollbarContainerDesign: o(
        { // default
            "class": "Border",
            context: {
                borderColor: designConstants.fadedFGColor
            }
        },
        {
            qualifier: { inAreaOfScrollbarContainer: true },
            context: {
                borderColor: designConstants.defaultBorderColor
            }
        }
    ),
        
    ///////////////////////////////////////////////
    ButtonInScrollbarContainerBeginningOfDocDesign: {
        "class": "BackgroundColor",     
        context: {
            backgroundColor: "red"
        }
    },

    ///////////////////////////////////////////////
    ButtonInScrollbarContainerEndOfDocDesign: {
        display: {
            background: "red"
        }
    },

    ///////////////////////////////////////////////
    ButtonInScrollbarContainerViewBackDesign: {
        display: {
            background: "pink"
        }
    },
    
    ///////////////////////////////////////////////
    ButtonInScrollbarContainerViewFwdDesign: {
        display: {
            background: "pink"
        }
    },

    ///////////////////////////////////////////////
    ButtonInScrollbarContainerPrevDesign: {
        display: {
            background: "yellow"
        }
    },
    
    ///////////////////////////////////////////////
    ButtonInScrollbarContainerNextDesign: {
        display: {
            background: "yellow"
        }
    },
    
   //////////////////////////////////////////////////////
    DottedScrollerControlDesign: o(
        { // default
            "class": "ColorBySurroundingAndState",
            context: {
                surroundingColor: [definedOrDefault,
                                   [{ backgroundColor:_ }, [me]],
                                   "white"
                                  ],
                arrowHeadcolor: [[{ colorBySurroundingAndState:_ }, [me]],
                                 [{ surroundingColor:_ }, [me]],
                                 "enabled"
                                ]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            display: {
                transform: {
                    rotate: 90
                }
            }
        },
        {
            qualifier: { inFocus: true,
                         disabled: false },
            context: {
                arrowHeadcolor: [[{ colorBySurroundingAndState:_ }, [me]],
                                 [{ surroundingColor:_ }, [me]],
                                 "onHover"
                                ]
            }
        },
        {
            qualifier: { disabled: true },
            context: {
                arrowHeadcolor: [[{ colorBySurroundingAndState:_ }, [me]],
                                 [{ surroundingColor:_ }, [me]],
                                 "disabled"
                                ]
            }
        }       
    ),
    
    //////////////////////////////////////////////////////
    DottedPrevScrollerDesign: {
        "class": o("DottedScrollerControlDesign", "LeftArrowHead")
    },
    
    //////////////////////////////////////////////////////
    DottedNextScrollerDesign: {
        "class": o("DottedScrollerControlDesign", "RightArrowHead")
    },
    
    //////////////////////////////////////////////////////
    ScrollableDotDesign: {
        "class": o("BackgroundColor", "ColorBySurroundingAndState"),
        context: {
            surroundingColor: "white",
            backgroundColor: [[{ colorBySurroundingAndState:_}, [me]],                
                              [{ surroundingColor:_ }, [me]],
                              [cond,
                               [{ inFocus:_ }, [me]],
                               o(
                                 { 
                                    on: true, 
                                    use: "onHover" 
                                 },
                                 { 
                                    on: false, 
                                    use: [cond,
                                          [{ snappablesBeingReordered:_ }, [me]],
                                          o(
                                            { on: true, use: "enabled" },
                                            { on: false, use: [cond,
                                                               [{ snappableRepresentedInView:_ }, [me]],
                                                               o({ on: true, use: "selected" }, { on: false, use: "enabled" })
                                                              ]
                                            }
                                           )
                                         ]
                                 }
                                )
                              ]
                             ] 
        }
    }
};
