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
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Mon1
    /// Adds blacklist, zoomboxing, design class, ab testing and colors
    FSApp: o(
        { // default
            "class": o("FSAppDesign", superclass),
            context: {
                blacklistOverlayObj: {
                                           overlay: [{ blacklistOverlay:_ }, [me]],
                                           "^mode": "exclusive"
                                     },         
                zoomBoxingOverlaysByApp: o(
                                           {
                                                 overlay: [{ globalBaseOverlay:_ }, [me]],
                                                 mode: "inclusive"
                                           },
                                           [{ blacklistOverlayObj:_ }, [me]] // defined in FatFSApp, not in LeanFSApp
                                          ),
                zoomBoxingOverlayObjs: o(
                                         [{ zoomBoxingOverlaysByApp:_ }, [me]],
                                         [{ zoomBoxingOverlaysByUser:_ }, [me]]
                                        ),
                // zoomBoxingOverlays expects an os of areaRefs, and so we perform a projection on zoomBoxingOverlaysByApp/zoomBoxingOverlaysByUser
                zoomBoxingOverlays: [{ zoomBoxingOverlayObjs: { overlay:_ } }, [me]],
                inclusiveZoomBoxingOverlays: [
                                              { 
                                                zoomBoxingOverlayObjs: { 
                                                                             overlay:_,
                                                                             mode: "inclusive"
                                                                       }
                                              }, 
                                              [me]
                                             ],
                exclusiveZoomBoxingOverlays: [
                                              { 
                                                zoomBoxingOverlayObjs: { 
                                                                             overlay:_,
                                                                             mode: "exclusive"
                                                                       }
                                              }, 
                                              [me]
                                             ],                
                offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom: fsAppPosConst.offsetFromExpandedOverlaysViewBottomToFacetViewPaneBottom,
                
                /*getOverlayUniqueIDFromNumber: [
                    defun,
                    o("number"),
                    [concatStr,
                        o(
                            fsAppConstants.newOverlayIDPrefix,
                            "number"
                        )
                    ],
                ]*/
            }
        },
        {
            qualifier: { overlayColorsABTest: "V1" },
            context: {
                overlayFormulaColors: o( // these define the subset which will be used to calculate new overlay colors:
                                        { overlayCounter: fsAppConstants.primaryOverlayCounter, color: o(157, 197, 205)/*"#9dc5cd"*/ },
                                        { overlayCounter: 2, color: o(195, 220, 181)/*"#c3dcb5"*/ }, 
                                        { overlayCounter: 3, color: o(237, 218, 149)/*"#edda95"*/ },        
                                        { overlayCounter: 4, color: o(223, 197, 226)/*"#dfc5e2"*/ }, 
                                        { overlayCounter: 5, color: o(179, 213, 137)/*"#b3d589"*/ },
                                        { overlayCounter: 6, color: o(160, 220, 231)/*"#a0dce7"*/ }
                                       ),
                overlayCoreColors: o(
                                     { overlayCounter: fsAppConstants.globalBaseOverlayCounter, color: o(227, 227, 227)/*"#e3e3e3"*/ },
                                     { overlayCounter: fsAppConstants.defaultBlacklistCounter, color: o(54, 55, 55)/*"#363737"*/ },
                                     { overlayCounter: fsAppConstants.defaultFavoritesCounter, color: o(254, 191, 20)/*"#febf14"*/ },
                                     [{ overlayFormulaColors:_ }, [me]]
                                    )               
            }
        },
        {
            qualifier: { overlayColorsABTest: "V2" },
            context: {
                overlayFormulaColors: o( // these define the subset which will be used to calculate new overlay colors:
                                        { overlayCounter: fsAppConstants.primaryOverlayCounter, color: o(194, 218, 115)/*"#c2da73"*/ },
                                        { overlayCounter: 2, color: o(113, 188, 238)/*"#71bcee"*/ },
                                        { overlayCounter: 3, color: o(155, 89, 182)/*"#9b59b6"*/ },
                                        { overlayCounter: 4, color: o(186, 174, 124)/*"#baae7c"*/ },
                                        { overlayCounter: 5, color: o(61, 113, 166)/*"#3d71a6"*/ },
                                        { overlayCounter: 6, color: o(26, 188, 156)/*"#1abc9c"*/ },
                                        { overlayCounter: 7, color: o(200, 51, 133)/*"#c83385"*/ }, 
                                        { overlayCounter: 8, color: o(230, 126, 34)/*"#e67e22"*/ },        
                                        { overlayCounter: 9, color: o(140, 193, 206)/*"#8cc1ce"*/ }, 
                                        { overlayCounter: 10, color: o(239, 70, 62)/*"#ef463e"*/ },
                                        { overlayCounter: 11, color: o(117, 152, 50)/*"#759832"*/ },
                                        { overlayCounter: 12, color: o(183, 149, 228)/*"#b795e4"*/ },
                                        { overlayCounter: 13, color: o(125, 41, 10)/*"#7d290a"*/ },
                                        { overlayCounter: 14, color: o(63, 138, 164)/*"#3f8aa4"*/ },
                                        { overlayCounter: 15, color: o(213, 191, 98)/*"#d5bf62"*/ },
                                        { overlayCounter: 16, color: o(113, 106, 96)/*"#716a60"*/ },
                                        { overlayCounter: 17, color: o(40, 206, 216)/*"#28ced8"*/ }
                                       ),
                overlayCoreColors: o(
                                     { overlayCounter: fsAppConstants.globalBaseOverlayCounter, color: designConstants.globalBaseRGB/*"#c6c6c6"*/ },
                                     { overlayCounter: fsAppConstants.defaultBlacklistCounter, color: o(54, 55, 55)/*"#363737"*/ },
                                     { overlayCounter: fsAppConstants.defaultFavoritesCounter, color: o(255, 205, 2)/*"#ffcd02"*/ },
                                     [{ overlayFormulaColors:_ }, [me]]
                                    )               
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZoomBoxingOverlaysView: {
        "class": superclass,
        position: {
            topConstraint: {
                pair1: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        element: [areaOfClass, "AppFrame"],
                        type: "top"
                    }
                },
                pair2: {
                    point1: {
                        type: "top"
                    },
                    point2: {
                        type: "bottom"
                    }
                },
                ratio: 5
            }
        }
    },    

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppControlPanelButtonText: {
        "class": o("AppControlPanelButtonTextDesign", "TextInTextAndIcon")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppControlPanelButtonIcon: {
        "class": o("AppControlPanelButtonIconDesign", "IconInTextAndIcon")
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryViewControl: {
        "class": superclass,
        context: {
            displayText: "Compact",
            icon: "%%image:(top_compact.png)%%"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetSummaryStateControl: {
        "class": superclass,
        context: {
            textWidth: fsAppPosConst.tempControlPanelButtonTextWidthLarge
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetStandardStateControl: {
        "class": superclass,
        context: {
            textWidth: fsAppPosConst.tempControlPanelButtonTextWidthLarge
        }       
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FacetMinimizeStateControl: {
        "class": superclass,
        context: {
            textWidth: fsAppPosConst.tempControlPanelButtonTextWidthLarge
        }       
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewIntOverlayControl: {
        "class": superclass,
        context: {
            displayText: "New Filter",
            icon: "%%image:(top_filter.png)%%"
        }
        /*position: {
            leftAlignWithGlobalBase: {
                point1: { type: "left" },
                point2: { element: [areaOfClass, "GlobalBaseItemSet"], type: "left" },
                equals: 0
            }
        }*/
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewExtOverlayControl: {
        "class": superclass,
        context: {
            displayText: "New List",
            icon: "%%image:(top_list.png)%%"
        }
    }
    
    /* nothing for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MoreOptionsControl: {
        "class": superclass,
        context: {
            textWidth: 100, // wider than the default value set above, as this is a longer string. will also be replaced by a display query 
            displayText: "More Options",
            icon: "%%image:(more_large.png)%%"
        }           
    },
    */    
};
