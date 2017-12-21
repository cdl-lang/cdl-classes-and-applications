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

// %%constantfile%%: <fsPositioningConstants.js>

var classes = {

    //////////////////////////////////////////////////////
    ExpHistogramBinDesign: o(
        {
            //default
            context: {
                // assuming top to bottom arragment by default
                bottomMostElement: [{ lastInAreaOS: _ }, [me]] 
            }
        },
        {
            qualifier: {verticalBars: false},
            "class": "TopBorder",
            display: {
                borderColor: [{ histogramDesign: { binBorderColor:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: {verticalBars: true},
            "class": "LeftBorder",
            display: {
                borderColor: [{ histogramDesign: { binBorderColor:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { verticalBars: false, bottomMostElement: true },
            display: {
                borderBottomWidth: [{ defaultBorderWidth: _ }, [me]]
            }
        },
        {
            qualifier: { verticalBars: true, bottomMostElement: true },
            display: {
                borderRightWidth: [{ defaultBorderWidth: _ }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    // API:
    // counter: overlay counter of current bar (1-based)
    // barColor: color of the bar
    //////////////////////////////////////////////////////
    ExpHistogramBarDesign: o(
        {   // default
            "class": o("BackgroundColor"),
            context: {
                userDefaultColor: true,
                color: [{ barColor: _ }, [me]],
                opacity: 1
            },
            display: {
                opacity: [{ opacity: _ }, [me]]
            }
        }
    ),

    ////////////////////////////////////////////////////////
    ColorChangableDesign: o(
        {
            //default
            "class": o(
                "BackgroundColor", 
                "Border"
            ),
            context: {
                onHover: [{ param: { pointerInArea: _ } }, [me]],
                borderColor: "gray",
                borderWidth: 1
            },
            display: {
                image: {
                    src: "%%image:(triangleNorthEastBW.svg)%%",
                    size: "100%",
                }
            }
        },
        {
            qualifier: { onHover: true },
            
        }
    ),

};
