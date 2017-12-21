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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Redefining NumericElementRef in NumericElement for this library
    // (originally it was myFacet which doesn't exists here)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericElement: {
        "class": superclass,
        context: {
            numericElementRef: [{ myWidget: _ }, [me]]
        }
    },
    NumericFormatOfReference: { //(was NumericFormatOfReference)
        "class": superclass,
        context: {
            myReference: [{ myWidget: _ }, [me]]
        }
    },
    ScaleElement: {
        "class": superclass,
        context: {
            // in exportHisstogram scale elements shoudn't be editable
            allowEditableSliderScaleElements: false
        }
    },
    HistogramScaleElement: {
        "class": superclass,
        context: {
            myCanvas: [areaOfClass, "ExpHistogramCanvas"],
            myHistogramView: [areaOfClass, "ExpHistogramView"]
        }        
    },
    /*HistogramScaleCrossbar: {
        "class": superclass,
        stacking: {
            aboveBins: {
                higher: [me],
                lower: [areaOfClass, "ExpHistogramBin"]
            }
        }
    }*/
}


var screenArea = {
    "class": o("ScreenArea"),
    children: {
        app: {
            description: {
                "class": "ExpHistogramApp"
            }
        }
    }
};
