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

    ///////////////////////////////////////////////
    OverlayHandleDesign: o(
        { // default
            display: { 
                image: {
                    src: "%%image:(overlayHandle.png)%%"
                }
            }
        },
        {
            qualifier: { tmd: true },
            display: {
                image: {
                    src: "%%image:(overlayHandleSelected.png)%%"
                }
            }
        }
    ),
        
    //////////////////////////////////////////////////////
    OverlayNameDesign: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { zoomBoxingButNotLast: true },
            "class": "TextUnderline"
        }
    ),
        
    //////////////////////////////////////////////////////
    OSRDesign: o(
        { // default
            "class": superclass
        },
        {
            qualifier: { ofExtOverlay: true,
                         ofExpandedOverlay: true },
            display: {
                background: designConstants.globalBGColor
            }
        }
    ),

    //////////////////////////////////////////////////////
    OverlayMinimizationControlDesign: o(
        {
            qualifier: { ofExpandedOverlay: true },
            display: { 
                image: {
                    src: "%%image:(arrowSouthEast.png)%%"
                }
            }
        },
        {
            qualifier: { ofMinimizedOverlay: true },
            display: { 
                image: {
                    src: "%%image:(arrowNorthEast.png)%%"
                }
            }
        }
    ),
    
    //////////////////////////////////////////////////////
    OverlayShowControlDesign: o(
        {
            qualifier: { show: false },
            display: { 
                image: {
                    src: "%%image:(overlayHidden.png)%%"
                }
            }
        },
        {
            qualifier: { show: true },
            display: { 
                image: {
                    src: "%%image:(overlayShown.png)%%"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    OverlaySolutionSetCounterDesign: {
        "class": o("TextBold", superclass)
    },
    
    //////////////////////////////////////////////////////
    SolutionSetViewControlDesign: {
        "class": superclass,
        display: {
            borderRadius: 2,
            background: designConstants.globalBGColor
        }
    },
        
    //////////////////////////////////////////////////////
    OverlayMoreControlsOpenDisplayDesign: {
        display: {
            background: {
                linearGradient: {
                    start: "left",
                    stops: o({color: "transparent", length: "0%"},
                             {color: "grey", length: "100%"})
                }
            }
        }
    },    
        
    //////////////////////////////////////////////////////
    OverlayMaximizationControlDesign: o(
        {
            qualifier: { ofMaximizedOverlay: true },
            display: { 
                image: {
                    src: "%%image:(unMaximizeOverlay.png)%%"
                }
            }
        },
        {
            qualifier: { ofMaximizedOverlay: false },
            display: { 
                image: {
                    src: "%%image:(maximizeOverlay.png)%%"
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    OverlayZoomBoxingControlDesign: {
        display: { 
            image: {
                src: "%%image:(zoomBoxing.png)%%"
            }
        }
    },
    
    //////////////////////////////////////////////////////
    OverlayTrashControlDesign: {
        display: { 
            image: {
                src: "%%image:(overlaysTrash.png)%%"
            }
        }
    },
        
    //////////////////////////////////////////////////////
    OSRTriangleDesign: {
        display: {
            triangle: {
                color: [{ color:_ }, [me]]
            }
        }
    },
    
    //////////////////////////////////////////////////////
    BackgroundOfDefiningZoomBoxingOSRDesign: {
        display: {
            background: [{ color:_ }, [me]]
        }
    }   
};
