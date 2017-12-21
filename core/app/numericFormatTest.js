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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    NumericFormatButton: o(
        { //default            
            "class": o("NumericFormat", "BackgroundColor", "Border", "DefaultDisplayText",
                "GeneralArea", "ControlModifiedPointer", "WrapAround"),
            context: {
                displayText: 123456.789,
                formatAttributes: [{ param: { areaSetContent: _ } }, [me]],
                numericFormatType: [{ formatAttributes: { numericFormatType: _ } }, [me]],
                numberOfDigits: [{ formatAttributes: { numberOfDigits: _ } }, [me]],
                commaDelimited: [{ formatAttributes: { commaDelimited: _ } }, [me]],                
                backgroundColor: "#CCCCCC",
            },
            position: {
                "content-height": [displayHeight],
                "content-width": 70, //[displayWidth]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericFormatPane: {
        "class": o("BackgroundColor", "GeneralArea", "HorizontalWrapAroundController"),
        context: {
            backgroundColor: "yellow",
            wrapAroundSpacing: 10,
            wrapAroundSecondaryAxisSpacing: 10
        },
        position: {
            top: 100,
            left: 100,
            width: 250,
            height: 200
        },
        children: {
            button: {
                data: o(
                    {                        
                        numericFormatType: "intl",
                        commaDelimited: true,
                        numberOfDigits: 0,
                    },
                    {
                        numericFormatType: "financialSuffix",
                        numberOfDigits: 0,
                    },
                    {
                        numericFormatType: "exponential",
                        numberOfDigits: 0
                    },
                    {                        
                        numericFormatType: "intl",
                        commaDelimited: true,
                        numberOfDigits: 1,
                    },
                    {
                        numericFormatType: "financialSuffix",
                        numberOfDigits: 1,
                    },
                    {
                        numericFormatType: "exponential",
                        numberOfDigits: 1
                    },
                    {                        
                        numericFormatType: "intl",
                        commaDelimited: true,
                        numberOfDigits: 2,
                    },
                    {
                        numericFormatType: "financialSuffix",
                        numberOfDigits: 2,
                    },
                    {
                        numericFormatType: "exponential",
                        numberOfDigits: 2
                    },
                    {                        
                        numericFormatType: "intl",
                        commaDelimited: true,
                        numberOfDigits: 3,
                    },
                    {
                        numericFormatType: "financialSuffix",
                        numberOfDigits: 3,
                    },
                    {
                        numericFormatType: "exponential",
                        numberOfDigits: 3
                    }
                ),
                description: {
                    "class": "NumericFormatButton"    
                }
            }
        }

    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumericFormatTestApp: {
        "class": o("TestApp"),
        context: {
            
        },
        position: {
            frame: 0
        },
        children: {
            formatArea: {
                description: {
                    "class": "NumericFormatPane"
                }
            },
        }
    }
};

//NumericFormatByType

var screenArea = { 
    "class": "ScreenArea",
    children: {
        app: {
            description: {
                "class": "NumericFormatTestApp"
            }
        }
    }
};
