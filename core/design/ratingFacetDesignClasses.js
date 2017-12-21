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
    SymbolsValueDesign: o(
        { 
            qualifier: { ratingSymbol: true,
                         noValue: false },
            context: {
                emptySymbol: "%%image:(starEmpty.png)%%",
                fullSymbol: "%%image:(starFull.png)%%",
                emphasizedSymbol: "%%image:(starEmphasized.png)%%"
            },
            display: {
                background: {
                    repeat: "repeat",
                    image: [{ emptySymbol:_ }, [me]]
                }
            }       
        }
    ),
    
    //////////////////////////////////////////////////////
    RatingValueDesign: {
        "class": "DiscreteValueDesign"
    },
    
    ///////////////////////////////////////////////
    RatingValueNameDesign: o(
        { // default
            "class": "SymbolsValueDesign"
        },
        {
            qualifier: { noValue: true },
            "class": "DiscreteValueNameDesign"
        }
    ),
        
    ///////////////////////////////////////////////
    RatingSymbolsValueCellDisplayDesign: o(
        { // default
            "class": "SymbolsValueDesign"
        },
        {
            qualifier: { noValue: true },
            "class": "DefaultDisplayText"
        },
        { 
            qualifier: { writeMode: true },
            display: {
                background: "pink"
            }
        }
    ),
 
    ///////////////////////////////////////////////
    RatingFullSymbolsDesign: o(
        { // default
            display: {
                background: {
                    repeat: "repeat",
                    image: [{ myRatingSymbolsValue: { fullSymbol:_ } }, [me]]
                }
            }       
        },
        {
            qualifier: { disabledAppearance: true },
           "class": "DisabledSymbolsDesign"
        }
    ),
    
    ///////////////////////////////////////////////
    RatingEmphasizedSymbolsDesign: {
        display: {
            background: {
                repeat: "repeat",
                image: [{ myRatingSymbolsValue: { emphasizedSymbol:_ } }, [me]]
            }
        }       
    },
    
    ///////////////////////////////////////////////
    RatingSelectionValueDesign: {
        "class": "RatingSelectionDesign"
    },
    
    ///////////////////////////////////////////////
    RatingSelectionStarDesign: {
        display: {
            image: { 
                src: "%%image:(starFull.png)%%",
                alt: "Star"
            }
        }       
    },
    
    ///////////////////////////////////////////////
    RatingSelectionOrBetterDesign: {
        "class": "RatingSelectionDesign"
    },
    
    ///////////////////////////////////////////////
    RatingSelectionRangeModifierDesign: {
        "class": "RatingSelectionDesign"
    },
 
    ///////////////////////////////////////////////
    RatingSelectionDesign: {
        "class": "FacetSelectionDesign",
        context: {
            textInFocus: [ // override the textInFocus definition of FacetSelectionDesign
                          { 
                                inFocus: true,
                                myFacetXIntOSR: [{ myFacetXIntOSR:_ }, [me]]
                          },
                          [areaOfClass, "RatingSelectionElement"]
                         ]
        }
    },
    
    ///////////////////////////////////////////////
    RatingSymbolCellDeleteControlDesign: {      
        "class": o("Border", "DeleteControlDesign")
    },

    RatingWritableTextualCellDisplayDesign: {
        "class": "DropDownMenuableDesign"
    }
};
