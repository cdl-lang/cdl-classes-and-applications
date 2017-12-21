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

initGlobalDefaults.uDFDesign = {
    editorElementBorderColor: "#8a8a8a"
};

var classes = {
    //////////////////////////////////////////////////////
    UDFEditorInputFieldContainerDesign: {
        "class": "CalculatorInputFieldContainerDesign",
        context: {
            borderColor: [{ uDFDesign: { editorElementBorderColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    UDFRefElementsDropDownDesign: {
        "class": "CalculatorRefElementsDropDownDesign",
        context: {
            borderColor: [{ uDFDesign: { editorElementBorderColor: _ } }, [globalDefaults]]
        }
    },

    //////////////////////////////////////////////////////
    /*
    UDFacetEditControlDesign: {
        "class": "OnHoverFrameDesign",
        display: {
            image: {                
                src: [cond,
                      [{ myFacet: { editUDF:_ } }, [me]],
                      o(
                        { on: false, use: "%%image:(editControl.svg)%%" },
                        { on: true, use: "%%image:(editExitControl.svg)%%" }
                       )
                     ],
                alt: [{ tooltipText:_ }, [me]],
                size: "100%"
            }
        }
    },
    */

    //////////////////////////////////////////////////////
    UDFFormulaPanelControllerDesign: {
        "class": "AppControlDesign",
        context: {
            // AppControlDesign params
            imgSrc: "%%image:(formula.svg)%%",
            imgAlt: "Formula"
        }
    },

    //////////////////////////////////////////////////////
    UDFEditorDesign: {
        /*"class": o("BackgroundColor", "Border"),
        context: {
            backgroundColor: "#B3B3B3",
            borderColor: "#8B8B8B"
        }*/
    },

    //////////////////////////////////////////////////////
    UDFEditorEquationSymbolDesign: {
        "class": o("BackgroundColor")
    },

    //////////////////////////////////////////////////////
    UDFEditorKeypadExpansionControlDesign: {
        context: {
            curtainLineWidth: 1,
            curtainLineColor: "#C8C8C8"
        }
    },

    //////////////////////////////////////////////////////
    UDFEditorApplyButtonDesign: o(
        { // default
            "class": o("BackgroundColor", "PaddingDesign", "TextAlignCenter", "DefaultDisplayText"),
            context: {
                textSize: 9,
                backgroundColor: "#E8E8E8",
                padding: 3
            },
        },
        {
            qualifier: { inFocus: true },
            context: {
                textColor: "#ffffff",
                backgroundColor: "#949494"
            }
        }
    ),

    //////////////////////////////////////////////////////
    DuplicateUDFacetControlDesign: {
        "class": "OnHoverFrameDesign",
        display: {
            image: {
                src: "%%image:(duplicateUDFControl.svg)%%",
                alt: "Duplicate",
                size: "100%"
            }
        }
    },

    //////////////////////////////////////////////////////
    DeleteUDFacetControlDesign: {
        "class": "OnHoverFrameDesign",
        display: {
            image: {
                src: "%%image:(trashUDFControl.svg)%%",
                alt: "Trash",
                size: "100%"
            }
        }
    },

    //////////////////////////////////////////////////////
    InputFieldTypeAheadDropDownMenuLineDesign: o(
        { // default
        },
        {
            qualifier: { lastFunctionName: true },
            "class": "BottomBorder"
        }
    ),

    //////////////////////////////////////////////////////
    InputFieldTypeAheadTextInputDesign: {
        "class": "CalculatorInputElementDesign"
    }
};
