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

// %%include%%: <globalFuncs.js>  

// add to initGlobalDefaults used by [globalDefaults]
initGlobalDefaults.generalDesign = {
    controlOpacityNotOnHover: 0.4,
    controlOpacityNotOnHoverNearShinyAreas: 0.6,
    controlOpacityDisabled: 0.15,
    disabledFacetControllersOpacity: 0.82,

    lightText: "lighter",

    darkElementDefaultOpacity: 0.25,
    darkElementInFocusOpacity: 0.35,

    lighControlDefaultOpacity: 0.5,
    lightElementInFocusOpacity: 0.55,

    textSize: { "V1": 9, "V2": 11, "V3": 13 },
    titleTextSize: { "V1": 18, "V2": 20, "V3": 22 },

    searchBoxTextSize: { "V1": 12, "V2": 13, "V3": 14 },
    modalDialogTextSize: 18,
    modalDialogTextColor: "#414141",

    appBlueTextColor: "#4888f1",
    disabledTextColor: "#d3d3d3",

    selectableBlueButtonTextSize: { "V1": 10, "V2": 12, "V3": 14 },
    infoFrameWidth: { "V1": 2, "V2": 3, "V3": 4 },

    justHappenedTimeoutDuration: 0.5, // seconds
    popupControlAppearsAfter: 1.2, // seconds

    tooltipBoxShadowBlurRadius: 4,
    tooltipBoxShadowSpread: 2,
    tooltipBoxShadowColor: "rgba(0,0,0,0.2)",
    tooltipBodyShadowDimension: 3,

    scalePrimaryLabelTextColor: "#878787",
    scaleSecondaryLabelTextColor: "#979797",

    arrowHotspot: 2
};

var numericFormats = o(
    { // pos 0
        type: "intl",
        commaDelimited: true,
        numberOfDigits: 0
    },
    { // pos 1
        type: "financialSuffix",
        commaDelimited: false,
        numberOfDigits: 0
    },
    { // pos 2
        type: "exponential",
        commaDelimited: false,
        numberOfDigits: 0
    },
    { // pos 3
        type: "intl",
        commaDelimited: true,
        numberOfDigits: 1
    },
    { // pos 4
        type: "financialSuffix",
        commaDelimited: false,
        numberOfDigits: 1
    },
    { // pos 5
        type: "exponential",
        commaDelimited: false,
        numberOfDigits: 1
    },
    { // pos 6
        type: "intl",
        commaDelimited: true,
        numberOfDigits: 2
    },
    {
        type: "financialSuffix",
        commaDelimited: false,
        numberOfDigits: 2
    },
    {
        type: "exponential",
        commaDelimited: false,
        numberOfDigits: 2
    },
    {
        type: "intl",
        commaDelimited: true,
        numberOfDigits: 3
    },
    {
        type: "financialSuffix",
        commaDelimited: false,
        numberOfDigits: 3
    },
    {
        type: "exponential",
        commaDelimited: false,
        numberOfDigits: 3
    }
);

initGlobalDefaults.numericConstants = {
    // in order to ensure that a preconfigured facet is given only one of these predefined numeric formats, the choice of numeric formatting will be
    // specified as the position of the object in the os numericFormats. so the ordering of elements in it matters! if it is changed, then referencing to 
    // its objects should also be changed! 
    defaultNumericFormattingObjPos: 6, // the pos in the numericFormats os above
    bigNumberThreshold: 100000, // 100K
    bigNumberNumericFormattingObjPos: 4 // the pos in the numericFormats os above
};

var defaultHistogramDistributionNumOfDigits = 2;

var designConstants = {
    globalBGColor: "white",
    baseFGColor: "#222426",
    fadedFGColor: "grey",
    defaultBorderColor: "black",

    defaultTriangleColor: "black",

    // below are three sets of colors, depending on the surrounding color and the state (of the UX). see ColorBySurroundingAndState below
    // when over a white surrounding
    disabledColor: "#ebebeb",
    enabledColor: "#cccccc",
    onHoverColor: "#464646",
    selectedColor: "#8f8f8f",

    enabledBlueBorderColor: "#4485f4",
    onHoverBlueBorderColor: "#1a57c0",

    scrollbarBorderDefaultColor: "#cccccc",
    scrollerDefaultColor: "#e2e2e2",
    scrollerOnHoverColor: "#b6b6b6",
    scrollerOnDraggedColor: "#5d5d5d",

    // when over a black surrounding
    disabledColorOverBlack: "#646464",
    enabledColorOverBlack: "#acacac",
    selectedColorOverBlack: "#e3e3e3",
    onHoverColorOverBlack: "#ffffff",

    // when over a colored surrounding (for now, using opacity levels of white)
    disabledColorOverColored: "rgba(255,255,255,0.3)",
    enabledColorOverColored: "rgba(255,255,255,0.5)",
    selectedColorOverColored: "rgba(255,255,255,0.75)",
    onHoverColorOverColored: "rgba(255,255,255,1)",

    defaultBoxShadowColor: "#777777",
    defaultBoxShadowRadius: 5,
    defaultBoxShadowSpread: 2,
    defaultBorderWidth: { "V1": 1, "V2": 1, "V3": 2 },

    modalDialogBackgroundOpacity: 0.6,

    delicateRoundedCornerRadius: 3,
    standardRoundedCornerRadius: 5,
    thickRoundedCornerRadius: 10,

    radioButtonControlRadius: { "V1": 4, "V2": 6, "V3": 8 },
    radioButtonControlSpacing: { "V1": 0, "V2": 2, "V3": 4 },

    textInputBoxShadowRadius: 1,

    valueMarkerOpacityWhenStatsOff: 1,
    valueMarkerOpacityWhenStatsOn: 0.65,

    discreteIncludeExcludeValueMarkerOpacityWhenInTempPreviewMode: 0.35,

    globalBaseRGB: o(198, 198, 198), // #c6c6c6

    loadedViewBorderColor: "grey",

    padding: { "V1": 2, "V2": 3, "V3": 4 },

    //standardBlueColorHSL: { "H": 218, "S": 87, "L": 55 },
    standardBlueColor: "#4485f4",
    blueButtonBorderColor: "#E2E2E2",
    blueButtonTextColor: "#EEEEEE",
};

initGlobalDefaults.designConstants = {
    appUserElementTextSize: { "V1": 12, "V2": 15, "V3": 18 }
};

var classes = {

    ///////////////////////////////////////////////
    AppDesign: {
        "class": "DefaultDisplayText"
    },

    ///////////////////////////////////////////////
    LoadingScreenDesign: {
        children: {
            loadingImage: {
                description: {
                    position: {
                        "class": "AlignCenterWithEmbedding",
                        width: 100,
                        height: 100
                    },
                    display: {
                        image: {
                            src: "%%image:(loading.gif)%%",
                            size: "100%",
                            alt: "Loading"
                        }
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////
    // This class should appear after any other text-design related classes, so that it doesn't override their more-specific definitions
    // API:
    // 1. displayText: the string to be displayed.
    ///////////////////////////////////////////////
    DefaultDisplayText: o(
        { // variant-controller
            qualifier: "!",
            context: {
                textSize: [{ defaultFontSize: _ }, [me]],
                displayTextDefined: o(
                    [bool, [{ displayText: _ }, [me]]],
                    // if the inheriting class also inherits TextInput:
                    [{ editInputText: _ }, [me]]
                )
            }
        },
        {
            qualifier: { displayTextDefined: true },
            "class": "TextParams",
            display: {
                text: {
                    "class": "TextObj"
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    TextParams: {
        "class": "GeneralArea",
        context: {
            textColor: designConstants.baseFGColor,
            defaultFontSize: [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]],
            textSize: [{ defaultFontSize: _ }, [me]],
            fontFamily: "Roboto, 'Segoe UI',Verdana, Arial, Helvetica, sans-serif"
        }
    },

    ///////////////////////////////////////////////
    // Inherited within a display.text or a display.html object.
    // API:
    // Assumes inheriting class inherits TextParams
    ///////////////////////////////////////////////
    TextObj: {
        value: [{ displayText: _ }, [me]],
        fontFamily: "Roboto, 'Segoe UI',Verdana, Arial, Helvetica, sans-serif", // workaround for #1553.
        // remove line above once #1553 is fixed and uncomment definition below 
        //fontFamily: [{ fontFamily:_ }, [me]], 
        fontSize: [{ textSize: _ }, [me]],
        color: [{ textColor: _ }, [me]],
        textAlign: "left"
    },

    ///////////////////////////////////////////////
    TextAlignLeft: {
        display: {
            text: {
                textAlign: "left"
            }
        }
    },

    ///////////////////////////////////////////////
    TextAlignRight: {
        display: {
            text: {
                textAlign: "right"
            }
        }
    },

    ///////////////////////////////////////////////
    TextAlignCenter: {
        display: {
            text: {
                textAlign: "center"
            }
        }
    },

    ///////////////////////////////////////////////
    // This class doesn't have much of an effect (or any) typically.
    // It seems a safer bet is to use a 'Light' version of the font of interest.
    ///////////////////////////////////////////////
    TextLight: {
        display: {
            text: {
                fontWeight: [{ generalDesign: { lightText: _ } }, [globalDefaults]]
            }
        }
    },

    ///////////////////////////////////////////////
    TextNormalWeight: {
        display: {
            text: {
                fontWeight: "normal"
            }
        }
    },

    ///////////////////////////////////////////////
    TextBold: {
        display: {
            text: {
                fontWeight: "bold"
            }
        }
    },

    ///////////////////////////////////////////////
    TextItalic: {
        display: {
            text: {
                fontStyle: "italic"
            }
        }
    },

    ///////////////////////////////////////////////
    TextLineThrough: {
        display: {
            text: {
                textDecoration: "line-through"
            }
        }
    },

    ///////////////////////////////////////////////
    TextUnderline: {
        display: {
            text: {
                textDecoration: "underline"
            }
        }
    },

    ///////////////////////////////////////////////
    TextUpperCase: {
        display: {
            text: {
                textTransform: "uppercase"
            }
        }
    },

    ///////////////////////////////////////////////
    TextLowerCase: {
        display: {
            text: {
                textTransform: "lowercase"
            }
        }
    },

    ///////////////////////////////////////////////
    WhiteSpaceNoWrap: {
        display: {
            text: {
                whiteSpace: "nowrap"
            }
        }
    },

    ///////////////////////////////////////////////
    TextOverflowEllipsis: {
        display: {
            text: {
                overflow: "ellipsis"
            }
        }
    },

    //////////////////////////////////////////////////////
    // API:
    // Inheriting class may refine definition of displayTooltipForOverflowingText. default def provided.
    // API:
    // 1. enableTextOverflowTooltip: true, by default
    //////////////////////////////////////////////////////
    TextOverflowEllipsisDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayTooltipForOverflowingText: [and,
                    [{ enableTextOverflowTooltip: _ }, [me]],
                    [{ contentSpillsOver: _ }, [me]],
                    [not, [{ editInputText: _ }, [me]]] // in case inheriting class also inherits TextInput
                ],
                enableTextOverflowTooltip: true
            }
        },
        { // default
            "class": o("TextOverflowEllipsis", "WhiteSpaceNoWrap"),
            context: {
                contentSpillsOver: [lessThan,
                    [offset, { type: "left", content: true }, { type: "right", content: true }],
                    [displayWidth]
                ]
            }
        },
        { // appears before Tooltipable, to override its default definition of tooltipText
            qualifier: { displayTooltipForOverflowingText: true },
            context: {
                tooltipText: [{ displayText: _ }, [me]]
            }
        },
        {
            qualifier: { enableTextOverflowTooltip: true },
            "class": "Tooltipable"
        }
    ),

    //////////////////////////////////////////////////////
    ContentSpillsOverDesign: {
        "class": "TextOverflowEllipsisDesign"
    },

    //////////////////////////////////////////////////////
    TitleTextDesign: {
        "class": "DefaultDisplayText",
        context: {
            textSize: [densityChoice, [{ generalDesign: { titleTextSize: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class displays the displayDebugObj context label. Note it uses the html object within the display object, and not the text object (as is done in GeneralArea).
    // We assume that an inheriting class that assigned a value to displayDebugObj, makes no use of its displayText.
    //
    // API:
    // 1. displayDebugObj: an object, or an os of objects.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugDisplay: o(
        {
            qualifier: "!",
            context: {
                displayDebugObjDefined: [{ displayDebugObj: _ }, [me]]
            }
        },
        { // default
        },
        {
            qualifier: { displayDebugObjDefined: true },
            "class": "HTMLDisplay",
            context: {
                displayText: [debugNodeToStr, [{ displayDebugObj: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    HTMLDisplay: {
        "class": "TextParams",
        display: {
            html: {
                "class": "TextObj"
            }
        }
    },

    //////////////////////////////////////////////////////
    PrevScaleModeControlDesign: o(
        { // default
            "class": "ScaleModeControlDesign",
        },
        {
            qualifier: { ofVerticalElement: true },
            children: {
                arrow: {
                    description: {
                        // ScaleControlArrow inherited by ScaleModeControlDesign
                        "class": "TopSideTriangle"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            children: {
                arrow: {
                    description: {
                        // ScaleControlArrow inherited by ScaleModeControlDesign
                        "class": "RightSideTriangle"
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    NextScaleModeControlDesign: o(
        { // default
            "class": "ScaleModeControlDesign"
        },
        {
            qualifier: { ofVerticalElement: true },
            children: {
                arrow: {
                    description: {
                        // ScaleControlArrow inherited by ScaleModeControlDesign
                        "class": "BottomSideTriangle"
                    }
                }
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            children: {
                arrow: {
                    description: {
                        // ScaleControlArrow inherited by ScaleModeControlDesign
                        "class": "LeftSideTriangle"
                    }
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    // API: 
    // 1. inheriting class should provide the particular Triangle class
    //////////////////////////////////////////////////////
    ScaleModeControlDesign: {
        children: {
            arrow: {
                description: {
                    // Triangle class inherited within PrevScaleModeControlDesign/NextScaleModeControlDesign
                    "class": "ScaleControlArrow"
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    ScaleControlArrow: o(
        { // variant-controller
            qualifier: "!",
            context: {
                indicateSelectability: [{ inFocus: _ }, [embedding]],
                activeControl: [{ activeControl: _ }, [embedding]],
                ofVerticalElement: [{ ofVerticalElement: _ }, [embedding]],
                defaultDimension: true
            }
        },
        { // default
            context: {
                arrowBase: generalPosConst.scaleModeControlArrowBase,
                arrowHeight: generalPosConst.scaleModeControlArrowHeight,
                arrowHotspot: [{ generalDesign: { arrowHotspot:_ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { defaultDimension: true },
            position: {
                frame: [{ arrowHotspot: _ }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            position: {
                width: [{ arrowBase: _ }, [me]],
                height: [{ arrowHeight: _ }, [me]]
            }
        },
        {
            qualifier: { ofVerticalElement: false },
            position: {
                height: [{ arrowBase: _ }, [me]],
                width: [{ arrowHeight: _ }, [me]]
            }
        },
        {
            qualifier: { activeControl: false },
            display: {
                triangle: {
                    color: designConstants.disabledColor
                }
            }
        },
        {
            qualifier: {
                activeControl: true,
                indicateSelectability: false
            },
            display: {
                triangle: {
                    color: designConstants.enabledColor
                }
            }
        },
        {
            qualifier: {
                activeControl: true,
                indicateSelectability: true
            },
            display: {
                triangle: {
                    color: designConstants.onHoverColor
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    // Beginning of numeric formatting classes
    ///////////////////////////////////////////////

    ///////////////////////////////////////////////
    // API:
    // 1. displayNumericFormat: should this class define a display object. true by default. Inheriting classes may turn this off (e.g. when they use numbertoString)
    // 2. numericFormatType: intl | exponential | metricPrefix | financialSuffix
    // 3. numberOfDigits: number of digits for exponential / number of fractionDigits for intl
    // 4. commaDelimited: true | false (only for intl )
    // The inherited classes in the class' variants generate a numericFormat object (context label), which is set as the display.text.numericFormat
    ///////////////////////////////////////////////
    NumericFormat: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayNumericFormat: true
            }
        },
        { // default
            "class": "TextAlignRight"
        },
        {
            qualifier: { displayNumericFormat: true },
            display: {
                text: {
                    numericFormat: [{ numericFormat: _ }, [me]]
                }
            }
        },
        {
            qualifier: { numericFormatType: "intl" },
            "class": "IntlNumericFormat"
        },
        {
            qualifier: { numericFormatType: "exponential" },
            "class": "ExponentialNumericFormat"
        },
        {
            qualifier: { numericFormatType: "precision" },
            "class": "PrecisionNumericFormat"
        },
        {
            qualifier: { numericFormatType: "fixed" },
            "class": "FixedNumericFormat"
        },
        {
            qualifier: { numericFormatType: "metricPrefix" },
            "class": "MetricPrefixFormat"
        },
        {
            qualifier: { numericFormatType: "financialSuffix" },
            "class": "FinancialSuffixFormat"
        }
    ),

    ///////////////////////////////////////////////    
    // Feature: intl number formatting. The author can add the following
    // attributes under display:text:numericFormat when type is “intl”:
    //
    // locale: name of the formatting locale, can be undefined
    // localeMatcher: undefined, “lookup”, or "best fit"
    // style: “decimal”, “currency”, or "percent"
    // currency: indication of the currency
    // currencyDisplay: How to display the currency in currency formatting. Possible values are "symbol" to use a localized currency symbol such as €, "code" to use the ISO currency code, "name" to use a localized currency name such as "dollar"; the default is "symbol".
    // useGrouping: separate per 3 digits or not
    // minimumIntegerDigits: The minimum number of integer digits to use. Possible values are from 1 to 21; the default is 1.
    // minimumFractionDigits: The minimum number of fraction digits to use. Possible values are from 0 to 20
    // maximumFractionDigits: The maximum number of fraction digits to use. Possible values are from 0 to 20
    // minimumSignificantDigits: The minimum number of significant digits to use. Possible values are from 1 to 21; the default is 1.
    // maximumSignificantDigits: a number
    // For details, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
    // Note that certain combinations cause exceptions.    
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    IntlNumericFormat: o(
        { // default
            context: {
                numberOfDigits: 1,
                minimumFractionDigits: [{ numberOfDigits: _ }, [me]],
                maximumFractionDigits: [{ numberOfDigits: _ }, [me]],
                commaDelimited: true,

                numericFormat: {
                    type: "intl",
                    useGrouping: [{ commaDelimited: _ }, [me]],
                    minimumFractionDigits: [{ minimumFractionDigits: _ }, [me]],
                    maximumFractionDigits: [{ maximumFractionDigits: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofCurrencyFacet: true },
            context: {
                currency: "USD", // default value
                numericFormat: {
                    style: "currency",
                    currency: [{ currency: _ }, [me]]
                }
            }
        },
        {
            qualifier: { ofPercentFacet: true },
            context: {
                numericFormat: {
                    style: "percent"
                }
            }
        }
    ),

    ///////////////////////////////////////////////    
    // Feature: exponential number formatting. The author can add the following
    // attributes under display:text:numericFormat when type is “exponential”:
    //
    // numberOfDigits: the desired precision
    // For details, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ExponentialNumericFormat: {
        context: {
            numberOfDigits: 1,
            numericFormat: {
                type: "exponential",
                numberOfDigits: [{ numberOfDigits: _ }, [me]],
            }
        }
    },

    ///////////////////////////////////////////////
    PrecisionNumericFormat: {
        context: {
            numberOfDigits: 2,
            numericFormat: {
                type: "precision",
                numberOfDigits: [{ numberOfDigits: _ }, [me]]
            }
        }
    },

    ///////////////////////////////////////////////
    FixedNumericFormat: {
        context: {
            numberOfDigits: 2,
            numericFormat: {
                type: "fixed",
                numberOfDigits: [{ numberOfDigits: _ }, [me]]
            }
        }
    },

    ///////////////////////////////////////////////
    // add metric prefixes - 'k' for x1000, 'M' for x1000000, etc.
    // the numeric part is in the range [1, 1000) - except for edge cases
    // 'numberOfDigits' represents the number of meaningful digits, both before and after the decimal point
    ///////////////////////////////////////////////
    MetricPrefixFormat: {
        "class": "NumericSuffixBase",
        context: {
            numberOfDigits: 3
        }
    },

    ///////////////////////////////////////////////
    FinancialSuffixFormat: {
        "class": "NumericSuffixBase",
        context: {
            numberOfDigits: 3,
            // numericFormat is not used defined here because the format 
            // is not a standard one (e.g., intl, exponential,  ...)
        }
    },

    ///////////////////////////////////////////////
    NumericSuffixBase: o(
        {
            qualifier: "!",
            context: {
                nsbIsNumeric: [
                    Roo(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
                    [{ displayText: _ }, [me]]
                ]
            }
        },
        {   //default
            context: {
                useStandardPrecision: true
            }
        },
        {
            qualifier: { displayNumericFormat: true, nsbIsNumeric: true },
            display: {
                text: {
                    value: [translateNumToSuffixBaseFormat,
                        [{ displayText: _ }, [me]], // the number in its pristine representation,
                        [{ numericFormatType: _ }, [me]],
                        [{ numberOfDigits: _ }, [me]],
                        [{ useStandardPrecision: _ }, [me]]
                    ]
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    NumericSuffixByType: o(
        {
            qualifier: { numericFormatType: "metricPrefix" },
            "class": "MetricPrefixFormat"
        },
        {
            qualifier: { numericFormatType: "financialSuffix" },
            "class": "FinancialSuffixFormat"
        }
    ),

    ///////////////////////////////////////////////
    // End of numeric formatting classes
    ///////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // API:
    // 1. color
    //////////////////////////////////////////////////////
    BackgroundColor: {
        context: {
            defaultBackgroundColor: designConstants.globalBGColor,
            backgroundColor: [{ color: _ }, [me]]
        },
        display: {
            background: [definedOrDefault,
                [{ backgroundColor: _ }, [me]],
                [{ defaultBackgroundColor: _ }, [me]]
            ]
        }
    },

    //////////////////////////////////////////////////////
    // API:
    // 1. opacity: 
    //////////////////////////////////////////////////////
    AppControlOpacityDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: true // default`
            }
        },
        { // default
            context: {
                opacity: 1
            },
            display: {
                opacity: [{ opacity: _ }, [me]]
            }
        },
        {
            qualifier: { inFocus: false, enabled: true },
            context: {
                opacityWhenNotInFocus: [{ generalDesign: { controlOpacityNotOnHover: _ } }, [globalDefaults]],
                opacity: [{ opacityWhenNotInFocus: _ }, [me]]
            }
        }/*,
        {
            qualifier: { enabled: false },
            context: {
                opacity: [{ generalDesign: { controlOpacityDisabled: _ } }, [globalDefaults]]
            }
        }*/
    ),

    //////////////////////////////////////////////////////
    // API:
    //  1. imgSrc file name (e.g., "<percent_symbol><percent_symbol>image:(fileName.svg)<percent_symbol><percent_symbol>",)
    //  2. imgAlt display.image.alt field
    //////////////////////////////////////////////////////
    AppControlDesign: {
        "class": "AppControlOpacityDesign",
        display: {
            image: {
                size: "100%",
                src: [{ imgSrc: _ }, [me]],
                alt: [{ imgAlt: _ }, [me]],
            }
        }
    },

    ///////////////////////////////////////////////
    // API
    // 1. borderWidth (default provided)
    // 2. borderColor (default provided)
    // 2. borderStyle (default provided)
    ///////////////////////////////////////////////
    Border: {
        "class": "GeneralArea",
        context: {
            defaultBorderWidth: [densityChoice, designConstants.defaultBorderWidth],
            defaultBorderColor: designConstants.defaultBorderColor,
            borderWidth: [{ defaultBorderWidth: _ }, [me]],
            borderStyle: "solid"
        },
        display: {
            borderWidth: [{ borderWidth: _ }, [me]],
            borderStyle: [{ borderStyle: _ }, [me]],
            borderColor: [definedOrDefault,
                [{ borderColor: _ }, [me]],
                [{ defaultBorderColor: _ }, [me]]
            ]
        }
    },

    ///////////////////////////////////////////////
    DashedBorder: {
        "class": "Border",
        display: {
            borderStyle: "dashed"
        }
    },

    ///////////////////////////////////////////////
    DottedBorder: {
        "class": "Border",
        display: {
            borderStyle: "dotted"
        }
    },

    ///////////////////////////////////////////////
    LeftBorder: {
        "class": "Border",
        context: {
            borderLeftWidth: [{ defaultBorderWidth: _ }, [me]],
            borderWidth: 0
        },
        display: {
            borderLeftWidth: [{ borderLeftWidth: _ }, [me]],
            borderRightWidth: [{ borderWidth: _ }, [me]],
            borderTopWidth: [{ borderWidth: _ }, [me]],
            borderBottomWidth: [{ borderWidth: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    RightBorder: {
        "class": "Border",
        context: {
            borderRightWidth: [{ defaultBorderWidth: _ }, [me]],
            borderWidth: 0
        },
        display: {
            borderRightWidth: [{ borderRightWidth: _ }, [me]],
            borderLeftWidth: [{ borderWidth: _ }, [me]],
            borderTopWidth: [{ borderWidth: _ }, [me]],
            borderBottomWidth: [{ borderWidth: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    TopBorder: {
        "class": "Border",
        context: {
            borderTopWidth: [{ defaultBorderWidth: _ }, [me]],
            borderWidth: 0
        },
        display: {
            borderTopWidth: [{ borderTopWidth: _ }, [me]],
            borderLeftWidth: [{ borderWidth: _ }, [me]],
            borderRightWidth: [{ borderWidth: _ }, [me]],
            borderBottomWidth: [{ borderWidth: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    BottomBorder: {
        "class": "Border",
        context: {
            borderBottomWidth: [{ defaultBorderWidth: _ }, [me]],
            borderWidth: 0
        },
        display: {
            borderBottomWidth: [{ borderBottomWidth: _ }, [me]],
            borderLeftWidth: [{ borderWidth: _ }, [me]],
            borderRightWidth: [{ borderWidth: _ }, [me]],
            borderTopWidth: [{ borderWidth: _ }, [me]],
        }
    },

    ///////////////////////////////////////////////
    // API:
    // 1. width
    // 2. height
    // 3. triangleColor
    // 4. baseSide (either "top"/"bottom"/"left"/"right")
    ///////////////////////////////////////////////
    Triangle: o(
        { // default
            display: {
                triangle: {
                    baseSide: [{ baseSide: _ }, [me]],
                    color: [definedOrDefault,
                        [{ triangleColor: _ }, [me]],
                        designConstants.defaultTriangleColor
                    ]
                }
            }
        },
        {
            qualifier: { width: true },
            position: {
                width: [{ width: _ }, [me]]
            }
        },
        {
            qualifier: { height: true },
            position: {
                height: [{ height: _ }, [me]]
            }
        }
    ),

    ///////////////////////////////////////////////
    TopSideTriangle: {
        "class": "Triangle",
        context: {
            baseSide: "top"
        }
    },

    ///////////////////////////////////////////////
    BottomSideTriangle: {
        "class": "Triangle",
        context: {
            baseSide: "bottom"
        }
    },

    ///////////////////////////////////////////////
    LeftSideTriangle: {
        "class": "Triangle",
        context: {
            baseSide: "left"
        }
    },

    ///////////////////////////////////////////////
    RightSideTriangle: {
        "class": "Triangle",
        context: {
            baseSide: "right"
        }
    },

    ///////////////////////////////////////////////
    RoundedCorners: {
        display: {
            borderRadius: [{ borderRadius: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    DelicateRoundedCorners: {
        "class": "RoundedCorners",
        context: {
            borderRadius: designConstants.delicateRoundedCornerRadius
        }
    },

    ///////////////////////////////////////////////
    StandardRoundedCorners: {
        "class": "RoundedCorners",
        context: {
            borderRadius: designConstants.standardRoundedCornerRadius
        }
    },

    ///////////////////////////////////////////////
    ThickRoundedCorners: {
        "class": "RoundedCorners",
        context: {
            borderRadius: designConstants.thickRoundedCornerRadius
        }
    },

    ///////////////////////////////////////////////
    DefaultBoxShadow: {
        context: {
            bodyShadowDimension: [{ generalDesign: { tooltipBodyShadowDimension: _ } }, [globalDefaults]],
            boxShadowBlurRadius: [{ generalDesign: { tooltipBoxShadowBlurRadius: _ } }, [globalDefaults]],
            boxShadowSpread: [{ generalDesign: { tooltipBoxShadowSpread: _ } }, [globalDefaults]],
            boxShadowColor: [{ generalDesign: { tooltipBoxShadowColor: _ } }, [globalDefaults]],
        },
        display: {
            boxShadow: {
                color: [{ boxShadowColor: _ }, [me]],
                horizontal: [{ bodyShadowDimension: _ }, [me]],
                vertical: [{ bodyShadowDimension: _ }, [me]],
                blurRadius: [{ boxShadowBlurRadius: _ }, [me]],
                spread: [{ boxShadowSpread: _ }, [me]],
            }
        }
    },

    ///////////////////////////////////////////////
    // Expected behavior can be played around with here: 
    // http://css3gen.com/box-shadow/
    // http://www.cssmatic.com/box-shadow
    ///////////////////////////////////////////////
    DropShadow: {
        display: {
            boxShadow: {
                color: designConstants.defaultBoxShadowColor,
                horizontal: 0,
                vertical: 0,
                blurRadius: designConstants.defaultBoxShadowRadius,
                spread: designConstants.defaultBoxShadowSpread
            }
        }
    },

    ///////////////////////////////////////////////
    InsetDropShadow: {
        "class": "DropShadow",
        display: {
            boxShadow: {
                inset: true
            }
        }
    },

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    CircleCore: {
        context: {
            circleDiameter: [mul, [{ radius: _ }, [me]], 2]
        },
        position: {
            height: [{ circleDiameter: _ }, [me]],
            width: [{ circleDiameter: _ }, [me]]
        }
    },

    ///////////////////////////////////////////////
    // API:
    // 1. radius
    ///////////////////////////////////////////////
    Circle: {
        "class": "CircleCore",
        context: {
            defaultBorderWidth: 0
        },
        display: {
            borderRadius: [{ radius: _ }, [me]],
            borderWidth: [definedOrDefault,
                [{ borderWidth: _ }, [me]],
                [{ defaultBorderWidth: _ }, [me]]
            ]
        }
    },

    ///////////////////////////////////////////////
    // API:
    // 1. circleCore API (radius would be the radius of the outside of the outer circle)
    // 2. borderWidth: the width of the outer ring.
    // 3. innerCircleRadius
    // 4. borderColor
    // 5. innerCircleColor
    // 6. opacity: 1, by default
    ///////////////////////////////////////////////
    CircleArc: {
        "class": "CircleCore",
        context: {
            outerCircleRadius: [{ radius: _ }, [me]],
            borderWidth: 0,
            innerCircleRadius: 0,
            opacity: 1
        },
        display: {
            opacity: [{ opacity: _ }, [me]],
            arc: {
                color: o([{ borderColor: _ }, [me]], [{ innerCircleColor: _ }, [me]]),
                radius: o([{ outerCircleRadius: _ }, [me]], [{ innerCircleRadius: _ }, [me]]),
                inset: o([minus, [{ outerCircleRadius: _ }, [me]], [{ borderWidth: _ }, [me]]], 0),
                range: o(100, 100),
                start: o(0, 0),
            }
        }
    },

    ///////////////////////////////////////////////
    ButtonDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText")
    },

    ///////////////////////////////////////////////
    ManualClockRunnerDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "Border")
    },

    ///////////////////////////////////////////////
    DeleteControlDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                emphasizeMe: [{ inFocus: _ }, [me]]
            }
        },
        { // default
            display: {
                opacity: 0.75,
                image: {
                    size: "100%",
                    src: "%%image:(deleteControl.svg)%%",
                    alt: "Delete"
                }
            }
        },
        {
            qualifier: { emphasizeMe: true },
            display: {
                opacity: 1
            }
        }
    ),

    ///////////////////////////////////////////////
    CollapsableViewDesign: o(
        { // default
            "class": o("TextBold", "TextAlignCenter", "DefaultDisplayText", "Border")
        },
        { // variant-controller
            qualifier: "!",
            context: {
                collapsableViewOpen: [{ collapsableViewOpen: _ }, [embedding]]
            }
        }
    ),

    /////////////////////////////////////////////// 
    TextWhenViewCollapsedDesign: {
        "class": "DefaultDisplayText"
    },

    /////////////////////////////////////////////// 
    IconInTextAndIconDesign: {
        display: {
            image: {
                src: [{ icon: _ }, [embedding]]
            }
        }
    },


    /////////////////////////////////////////////// 
    HorizontalPaddingDesign: {
        context: {
            padding: [densityChoice, designConstants.padding],
            paddingLeft: [{ padding: _ }, [me]],
            paddingRight: [{ padding: _ }, [me]]
        },
        display: {
            paddingLeft: [{ paddingLeft: _ }, [me]],
            paddingRight: [{ paddingRight: _ }, [me]]
        }
    },

    /////////////////////////////////////////////// 
    VerticalPaddingDesign: {
        context: {
            padding: [densityChoice, designConstants.padding],
            paddingTop: [{ padding: _ }, [me]],
            paddingBottom: [{ padding: _ }, [me]],
        },
        display: {
            paddingTop: [{ paddingTop: _ }, [me]],
            paddingBottom: [{ paddingBottom: _ }, [me]]
        }
    },

    /////////////////////////////////////////////// 
    PaddingDesign: {
        "class": o("VerticalPaddingDesign", "HorizontalPaddingDesign")
    },

    /////////////////////////////////////////////// 
    PostItDesign: {
        "class": "Border",
        display: {
            background: "#DEB887"
        }
    },

    /////////////////////////////////////////////// 
    PostItTitleDesign: {
        "class": "BottomBorder",
        context: {
            textSize: 16
        },
        display: {
            paddingLeft: 10
        }
    },

    /////////////////////////////////////////////// 
    PostItBodyDesign: o(
        { // default
            display: {
                paddingLeft: 10
            }
        },
        {
            qualifier: { editInputText: true },
            display: {
                text: {
                    input: {
                        multiLine: true // so that /n translates to a new line
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////// 
    PostItCloseDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText"),
        context: {
            displayText: "X"
        }
    },

    //////////////////////////////////////////////////////
    // API
    // 1. arrowHeadcolor: black, by default
    // 2. backgroundColor: white, by default
    //////////////////////////////////////////////////////
    ArrowHead: {
        "class": o("BackgroundColor", "Horizontal"),
        context: {
            arrowHeadThickness: 6,
            lengthAxis: 14,
            girthAxis: 14,

            defaultArrowHeadColor: "black"
        },
        position: {
            lengthAxisConstraint: {
                point1: { type: [{ lowHTMLLength: _ }, [me]] },
                point2: { type: [{ highHTMLLength: _ }, [me]] },
                equals: [{ lengthAxis: _ }, [me]]
            },
            girthAxisConstraint: {
                point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                point2: { type: [{ highHTMLGirth: _ }, [me]] },
                equals: [{ girthAxis: _ }, [me]]
            }
        },
        children: {
            arrowHeadColoredTriangle: {
                description: {
                    "class": "ArrowHeadTriangle",
                    position: {
                        right: 0
                    },
                    display: {
                        triangle: {
                            color: [definedOrDefault,
                                [{ arrowHeadcolor: _ }, [embedding]],
                                [{ defaultArrowHeadColor: _ }, [embedding]]
                            ]
                        }
                    }
                }
            },
            arrowHeadWhiteTriangle: {
                description: {
                    "class": "ArrowHeadTriangle",
                    position: {
                        attachToColoredTriangleTip: {
                            point1: { type: "right" },
                            point2: { element: [{ children: { arrowHeadColoredTriangle: _ } }, [embedding]], type: "right" },
                            equals: [{ arrowHeadThickness: _ }, [embedding]]
                        }
                    },
                    display: {
                        triangle: {
                            color: [definedOrDefault,
                                [{ backgroundColor: _ }, [embedding]],
                                [{ defaultBackgroundColor: _ }, [embedding]]
                            ]
                        }
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    ArrowHeadTriangle: {
        "class": o("LeftSideTriangle", "Horizontal"),
        position: {
            lengthAxisConstraint: {
                point1: { type: [{ lowHTMLLength: _ }, [me]] },
                point2: { type: [{ highHTMLLength: _ }, [me]] },
                equals: [{ lengthAxis: _ }, [embedding]]
            },
            girthAxisConstraint: {
                point1: { type: [{ lowHTMLGirth: _ }, [me]] },
                point2: { type: [{ highHTMLGirth: _ }, [me]] },
                equals: [mul, 2, [{ lengthAxis: _ }, [embedding]]]
            },
            "vertical-center": 0
        }
    },

    //////////////////////////////////////////////////////
    RightArrowHead: {
        "class": "ArrowHead"
    },

    //////////////////////////////////////////////////////
    LeftArrowHead: {
        "class": "ArrowHead",
        display: {
            transform: {
                rotate: 180
            }
        }
    },

    //////////////////////////////////////////////////////
    BottomArrowHead: {
        "class": "ArrowHead",
        display: {
            transform: {
                rotate: 90
            }
        }
    },

    //////////////////////////////////////////////////////
    TopArrowHead: {
        "class": "ArrowHead",
        display: {
            transform: {
                rotate: 270
            }
        }
    },

    //////////////////////////////////////////////////////
    BooleanButtonDesign: o(
        {
            "class": "RadioButtonControlDesign"
        },
        {
            qualifier: {performWriteOnClick: false},
            context: {
                //radioButtonColor: designConstants.baseFGColor,
                //innerCircleColor: designConstants.baseFGColor                
            },
            display: {
                opacity: 0.3
            }
        }
    ),

    //////////////////////////////////////////////////////
    RadioButtonControlDesign: o(
        {
            "class": "CircleArc",
            context: {
                radioButtonColor: "#535353",
                radius: [densityChoice, designConstants.radioButtonControlRadius],
                borderWidth: 2, // default for a selection control
                defaultBorderColor: designConstants.enabledColor,
                borderColor: [{ radioButtonColor: _ }, [me]]
            }
        },
        {
            qualifier: { selected: true },
            context: {
                innerCircleRadius: [minus, [{ outerCircleRadius: _ }, [me]], 3],
                innerCircleColor: [{ radioButtonColor: _ }, [me]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    RadioButtonNameDesign: {
        "class": "DefaultDisplayText"
    },

    //////////////////////////////////////////////////////
    TextInputDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultEditInputDisplay: true
            }
        },
        { // default
            "class": o("TextAlignLeft", "DefaultDisplayText")
        },
        {
            qualifier: {
                defaultEditInputDisplay: true,
                editInputText: true
            },
            "class": "BackgroundColor",
            context: {
                backgroundColor: designConstants.fadedFGColor
            }
        },
        {
            qualifier: {
                defaultEditInputDisplay: true,
                enableBoxShadow: true,
                editInputText: true
            },
            display: {
                boxShadow: {
                    color: "black",
                    horizontal: 0,
                    vertical: 0,
                    blurRadius: 2,
                    spread: designConstants.textInputBoxShadowRadius
                }
            }
        },
        {
            qualifier: {
                defaultEditInputDisplay: true,
                enableBoxShadow: true,
                editInputText: true,
                errorMsgOnDisplay: true
            },
            display: {
                boxShadow: {
                    color: "red" // override the definition above
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    InputErrorMsgDesign: {
        "class": "DefaultDisplayText",
        display: {
            background: designConstants.globalBGColor,
            paddingLeft: 5,
            paddingRight: 5,
            boxShadow: {
                color: "#777777",
                horizontal: 0,
                vertical: 0,
                blurRadius: 2,
                spread: 1
            }
        }
    },

    //////////////////////////////////////////////////////
    // API:
    // 1. enabled: true, by default.
    // 2. enabledTrigger: inFocus, by default.
    //////////////////////////////////////////////////////
    OnHoverFrameDesign: {
        "class": o("BackgroundColor", "Border"),
        context: {
            enabled: true,
            enabledTrigger: [{ inFocus: _ }, [me]],
            enabledOnHover: [and,
                [{ enabledTrigger: _ }, [me]],
                [{ enabled: _ }, [me]]
            ],
            onHoverBorderColor: designConstants.onHoverColor,
            enabledBorderColor: designConstants.enabledColor,
            onHoverBackgroundColor: designConstants.globalBGColor,
            enabledBackgroundColor: designConstants.globalBGColor,
            borderWidth: [densityChoice, { "V1": 1, "V2": 1, "V3": 2 }],
            borderColor: [cond,
                [{ enabledOnHover: _ }, [me]],
                o(
                    { on: false, use: [{ enabledBorderColor: _ }, [me]] },
                    { on: true, use: [{ onHoverBorderColor: _ }, [me]] }
                )
            ],
            backgroundColor: [cond,
                [{ enabledOnHover: _ }, [me]],
                o(
                    { on: false, use: [{ enabledBackgroundColor: _ }, [me]] },
                    { on: true, use: [{ onHoverBackgroundColor: _ }, [me]] }
                )
            ]

        }
    },

    //////////////////////////////////////////////////////
    ColorBySurroundingAndState: {
        context: {
            colorBySurroundingAndState: [defun,
                o("surroundingColor", "state"),
                [cond,
                    "surroundingColor",
                    o(
                        { // a certain abuse of the selectedColor, as there is nothing selected about this state...
                            on: designConstants.globalBGColor,
                            use: [cond,
                                "state",
                                o(
                                    { on: "disabled", use: designConstants.disabledColor },
                                    { on: "enabled", use: designConstants.enabledColor },
                                    { on: "selected", use: designConstants.selectedColor },
                                    { on: "onHover", use: designConstants.onHoverColor }
                                )
                            ]
                        },
                        {
                            on: "colored",
                            use: [cond,
                                "state",
                                o(
                                    { on: "disabled", use: designConstants.disabledColorOverColored },
                                    { on: "enabled", use: designConstants.enabledColorOverColored },
                                    { on: "selected", use: designConstants.selectedColorOverColored },
                                    { on: "onHover", use: designConstants.onHoverColorOverColored }
                                )
                            ]
                        },
                        {
                            on: "black",
                            use: [cond,
                                "state",
                                o(
                                    { on: "disabled", use: designConstants.disabledColorOverBlack },
                                    { on: "enabled", use: designConstants.enabledColorOverBlack },
                                    { on: "selected", use: designConstants.selectedColorOverBlack },
                                    { on: "onHover", use: designConstants.onHoverColorOverBlack }
                                )
                            ]
                        }
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////
    // DisplayDimension
    //
    // set the area's content-width/content-height so that it fits the
    //  displayed content
    //
    // if 'displayDimensionMaxWidth' is set, it is assumed to be the
    //  preferred width. Note that in practice the displayed width may be
    //  somewhat larger (or smaller), as this is merely a hint going into
    //  the display-width calculation
    //
    // API: 
    // 1. displayDimensionWidthMin / displayDimensionHeightMin - boolean. false, by default. Is the content-height/content-width equal to the display query
    //    or at least the display query.
    /////////////////////////////////////////////////////////////////////////
    DisplayDimension: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // apply max width only if it is narrower than the 'natural'
                // width
                displayDimensionWithMaxWidth: [
                    and,
                    [{ displayDimensionMaxWidth: true }, [me]],
                    [
                        greaterThan,
                        [displayWidth],
                        [{ displayDimensionMaxWidth: _ }, [me]]
                    ]
                ],
                displayDimensionWidthMin: false,
                displayDimensionHeightMin: false
            }
        },
        {
            qualifier: {
                displayDimensionWithMaxWidth: false,
                displayDimensionWidthMin: false
            },
            position: {
                "content-width": [displayWidth]
            }
        },
        {
            qualifier: {
                displayDimensionWithMaxWidth: false,
                displayDimensionHeightMin: false
            },
            position: {
                "content-height": [displayHeight]
            }
        },
        {
            qualifier: {
                displayDimensionWithMaxWidth: false,
                displayDimensionWidthMin: true
            },
            position: {
                minContentWidth: {
                    point1: { type: "left", content: true },
                    point2: { type: "right", content: true },
                    min: [displayWidth]
                }
            }
        },
        {
            qualifier: {
                displayDimensionWithMaxWidth: false,
                displayDimensionHeightMin: true
            },
            position: {
                minContentHeight: {
                    point1: { type: "top", content: true },
                    point2: { type: "bottom", content: true },
                    min: [displayHeight]
                }
            }
        },
        {
            qualifier: { displayDimensionWithMaxWidth: true },
            position: {
                "content-height": [
                    displayHeight,
                    {
                        width: [{ displayDimensionMaxWidth: _ }, [me]]
                    }
                ],
                "content-width": [
                    displayWidth,
                    {
                        width: [{ displayDimensionMaxWidth: _ }, [me]]
                    }
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines a function that takes an os of strings and returns the width of the maximum width string. 
    // This should be inherited by the class that defines the display.text.value, to ensure that the displayWidth takes its particular vals into consideration.
    // It is this need that requires the function to be defined in the area, where the display object can be queried, and not be a global func. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculateMaxWidthOfStrings: {
        context: {
            maxWidthOfStrings: [defun,
                "strings",
                [max,
                    [map,
                        [defun,
                            o("str"),
                            // perform a displayWidth query for each one of the strings
                            [displayWidth,
                                {
                                    display: {
                                        text: {
                                            value: "str",
                                            // the input:o() is to ensure that the calculated dimension remains fixed, if we are in edit mode for this area,
                                            // as if we're not.
                                            input: o()
                                        }
                                    }
                                }
                            ]

                        ],
                        "strings"
                    ]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines a function that takes an os of strings and returns the height of the maximum width string. 
    // This should be inherited by the class that defines the display.text.value, to ensure that the displayWidth takes its particular vals into consideration.
    // It is this need that requires the function to be defined in the area, where the display object can be queried, and not be a global func. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculateMaxHeightOfStrings: {
        context: {
            maxHeightOfStrings: [defun,
                "strings",
                [max,
                    [map,
                        [defun,
                            o("str"),
                            // perform a displayHeight query for each one of the strings
                            [displayHeight, { display: { text: { value: "str" } } }]
                        ],
                        "strings"
                    ]
                ]
            ]
        }
    },

    /////////////////////////////////////////////// 
    // To be inherited by classes which wish to have their transition effect controlled by an app-level transition control flag
    /////////////////////////////////////////////// 
    VisualTransition: o(
        { // variant-controller
            qualifier: "!",
            context: {
                visualTransition: [{ myApp: { transitionControl: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    //////////////////////////////////////////////////////
    // API:
    // 1. transitionable: [me], by default. 
    // 2. Inheriting classes may override allowTransition
    //////////////////////////////////////////////////////
    DraggableToReorderTransition: o(
        { // variant-controller
            qualifier: "!",
            context: {
                allowTransition: [{ allowDraggableToReorderTransition: _ }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                transitionable: [me],
                allowDraggableToReorderTransition: [and,
                    [not, [{ transitionable: { iAmDraggedToReorder: _ } }, [me]]],
                    o(
                        // either when there is no [message]
                        [not, [true, [message]]], // not working as intended. reported as bug #1822
                        // or there is a [message], but it's not a mouse wheel event.
                        [{ type: n("Wheel") }, [message]]
                    )
                ]
            }
        }
    ),

    //////////////////////////////////////////////////////
    DraggableHandleDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                backgroundColor: "#D3D3D3"
            }
        },
        {
            qualifier: { dragged: true },
            display: {
                pointerOpaque: false // so the trash, for example, could see we're hovering over it
            }
        }
    ),

    //////////////////////////////////////////////////////
    SearchBoxDesign: o(
        {
            qualifier: { expandedSearchBox: true },
            "class": "ExpandedSearchBoxDesign"
        },
        {
            qualifier: { expandedSearchBox: false },
            "class": "MinimizedSearchBoxDesign"
        }
    ),

    //////////////////////////////////////////////////////
    SearchBoxInputDesign: o(
        { // default
            "class": o("HorizontalPaddingDesign", "TextAlignLeft", "DefaultDisplayText"),
            context: {
                textSize: [{ searchBoxTextSize: _ }, [embedding]]
            }
        },
        {
            qualifier: { searchDefined: false },
            "class": "TextItalic",
            context: {
                textColor: [{ searchBoxDefaultTextColor: _ }, [embedding]]
            }
        },
        {
            qualifier: { editInputText: false },
            "class": "TextOverflowEllipsisDesign"
        }
    ),

    //////////////////////////////////////////////////////
    SearchBoxMinimizationButtonDesign: {
        "class": o("BackgroundColor", "Border"),
        context: {
            backgroundColor: "#878787",
            borderWidth: 1,
            borderColor: "#878787"
        }
    },

    //////////////////////////////////////////////////////
    SearchBoxBorderBackgroundDesign: {
        "class": o("Border", "BackgroundColor"),
        context: {
            borderColor: "#878787"
        }
    },

    //////////////////////////////////////////////////////
    ExpandedSearchBoxDesign: {
        "class": o("SearchBoxBorderBackgroundDesign", "TextParams"),
        context: {
            searchBoxTextSize: [densityChoice, [{ generalDesign: { searchBoxTextSize: _ } }, [globalDefaults]]],
            searchBoxDefaultTextColor: "#bbbbbb"
        }
    },

    //////////////////////////////////////////////////////
    MinimizedSearchBoxDesign: {
        "class": o("SearchBoxBorderBackgroundDesign", "AppControlOpacityDesign"),
        context: {
            backgroundColor: "#1d1d1d"
        },
        display: {
            image: {
                size: "100%",
                src: [
                    cond,
                    [{ searchStr: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: "%%image:(searchClosedFull2.svg)%%"

                        },
                        {
                            on: false,
                            use: "%%image:(searchClosedEmpty2.svg)%%"

                        }
                    )
                ],
                alt: [
                    cond,
                    [{ searchStr: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: "SearchBox Closed and Loaded"

                        },
                        {
                            on: false,
                            use: "SearchBox Closed"

                        }
                    )
                ]
            }
        }
    },

    //////////////////////////////////////////////////////
    SearchControlDesign: {
        display: {
            image: {
                src: "%%image:(search.svg)%%",
                size: "100%",
                alt: "Search"
            }
        }
    },

    //////////////////////////////////////////////////////
    TriangleExpansionControllerDesign: o(
        {
            context: {
                triangleColor: designConstants.defaultTriangleColor
            }
        },
        {
            qualifier: { embedInCircle: true },
            "class": "BackgroundColor",
            context: {
                triangleColor: designConstants.globalBGColor,
                backgroundColor: "#B0B0B0"
            }
        }
    ),

    ///////////////////////////////////////////////
    TrashDesign: o(
        { // default
            "class": o("BackgroundColor", "Border"),
            context: {
                borderColor: "transparent"
            },
            children: {
                trashDisplay: {
                    description: {
                        position: {
                            frame: 0
                        },
                        display: {
                            image: {
                                src: "%%image:(trash.svg)%%",
                                alt: "Trash",
                                size: "90%"
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { hoveringOverTrash: true },
            context: {
                borderColor: designConstants.defaultBorderColor // to override the borderColor definition provided above
            }
        }
    ),

    ///////////////////////////////////////////////
    // API: 
    // 1. increaseOpacity: inFocus, by default (via GeneralArea)
    ///////////////////////////////////////////////
    DarkControlOpacityDesign: o(
        {
            qualifier: "!",
            context: {
                increaseOpacity: [{ inFocus: _ }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            display: {
                opacity: [{ generalDesign: { darkElementDefaultOpacity: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { increaseOpacity: true },
            display: {
                opacity: [{ generalDesign: { darkElementInFocusOpacity: _ } }, [globalDefaults]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    DraggedIconElementOpacity: {
        context: {
            opacity: [{ generalDesign: { darkElementInFocusOpacity: _ } }, [globalDefaults]]
        },
        display: {
            opacity: [{ opacity: _ }, [me]]
        }
    },

    //////////////////////////////////////////////////////
    // API:
    // 1. selected (in which case it will be blue)
    // 2. enabled (if not it will have no background and the text will be light gray)
    //////////////////////////////////////////////////////
    SelectableBlueButtonDesign: o(
        { //default
            "class": o("Border", "DefaultDisplayText"),
            context: {
                borderColor: designConstants.blueButtonBorderColor,
                textSize: [densityChoice, [{ generalDesign: { selectableBlueButtonTextSize: _ } }, [globalDefaults]]],
                padding: 2
            },
            display: {
                padding: [{ padding: _ }, [me]]
            }
        },
        {
            qualifier: { selected: true },
            "class": o("BackgroundColor"),
            context: {
                textColor: designConstants.blueButtonTextColor,
                backgroundColor: designConstants.standardBlueColor
                //[generateHSL, designConstants.standardBlueColorHSL]
            }
        },
        {
            qualifier: { selected: false, enabled: true },
            "class": "BackgroundColor",
            context: {
                textColor: "#5d5d5d",
                backgroundColor: designConstants.globalBGColor

            }
        },
        {
            qualifier: { enabled: false },
            context: {
                textColor: designConstants.baseFGColor,
            }
        }
    ),

    //////////////////////////////////////////////////////
    HideControlDesign: {
        children: {
            hideDiagonal: {
                description: {
                    position: {
                        frame: 0
                    },
                    display: {
                        image: {
                            size: "100%",
                            src: "%%image:(diagonalHide.svg)%%",
                            alt: "Close"
                        }
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    InfoFrameDesign: {
        "class": "Border",
        context: {
            borderWidth: [densityChoice, [{ generalDesign: { infoFrameWidth: _ } }, [globalDefaults]]],
            borderColor: designConstants.standardBlueColor
        }
    },

    //////////////////////////////////////////////////////
    ToggleControlUXDesign: o(
        { // default
            display: {
                image: {
                    size: "100%",
                    src: "%%image:(toggleControl.svg)%%",
                    alt: "Toggle"
                }
            }
        },
        {
            qualifier: { leftSelected: false },
            display: {
                transform: {
                    rotate: 180
                }
            }
        }
    ),

    //////////////////////////////////////////////////////
    ToggleLabelDesign: o(
        { // default
            "class": "DefaultDisplayText",
            context: {
                textSize: [{ toggleLabelTextSize: _ }, [embedding]]
            }
        },
        {
            qualifier: { selected: true },
            context: {
                textColor: [{ selectedToggleLabelTextColor: _ }, [embedding]]
            }
        },
        {
            qualifier: { selected: false },
            context: {
                textColor: [{ unselectedToggleLabelTextColor: _ }, [embedding]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    DateInputDesign: {
        "class": "TextAlignCenter"
    }
};
