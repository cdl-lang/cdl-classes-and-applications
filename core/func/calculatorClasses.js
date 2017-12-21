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

// %%classfile%%: <calculatorDesignClasses.js>
initGlobalDefaults.calculator = {
    verticalSpacingBetweenInputRows: 3,
    verticalMarginAroundCalculatorEditorExternalRows: 10,
    calculatorEditorTypeAheadMenuWidth: 200
};

var generateFormula = [defun,
    o("expression", "projectionForFormula", "calculatorAllElements", "aggregationFunctionStr"),
    [concatStr,
        [map,
            [defun,
                o("expressionElement"),
                [using,
                    "expressionElementVal",
                    [concatStr,
                        o(
                            "\"",
                            [escapeQuotes,
                                [ // this may seem redundant, but we first retrieve the object corresponding to the elements calculatorRefVal (the uniqueID)
                                    // from the calculatorRefElements os, and from there we get the projectionForFormula, which would either be once again
                                    // the calculatorRefVal (if the invoking function was generateFormulaForCalculation), or
                                    // the calculatorRefName (if the invoking function was generateFormulaForDisplay)
                                    "projectionForFormula",
                                    [
                                        { calculatorRefVal: [{ calculatorRefVal: _ }, "expressionElement"] },
                                        "calculatorAllElements"
                                    ]
                                ]
                            ],
                            "\""
                        )
                    ],
                    [cond,
                        [{ calculatorRefVal: _ }, "expressionElement"],
                        o(

                            {   // if refElement, take its calculatorRefVal attribute and wrap it in quotes
                                on: true,
                                use: [cond,
                                    [equal, "", "aggregationFunctionStr"],
                                    o(
                                        {
                                            on: true,
                                            use: "expressionElementVal"
                                        },
                                        {
                                            on: false,
                                            use: [concatStr,
                                                o(
                                                    "aggregationFunctionStr",
                                                    "(",
                                                    "expressionElementVal",
                                                    ")"
                                                )
                                            ]
                                        }
                                    )
                                ]
                            },
                            // otherwise, use the expression element itself
                            {
                                on: false,
                                use: "expressionElement"
                            }
                        )
                    ]
                ]
            ],
            "expression"
        ]
    ]
];

var generateFormulaForCalculation = [defun,
    o("expression", "calculatorAllElements"),
    [generateFormula,
        "expression",
        { calculatorRefVal: _ },
        "calculatorAllElements",
        "" // the aggregation function isn't needed here, only in some cases in the generateFormulaForDisplay, so we pass an empty string instead.
    ]
];

var generateFormulaForDisplay = [defun,
    o("expression", "calculatorAllElements", "aggregationFunctionStr"),
    [generateFormula,
        "expression",
        { calculatorRefName: _ },
        "calculatorAllElements",
        "aggregationFunctionStr"
    ]
];

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API
    // 1. calculatorRefElements: an os of objects that include the attributes calculatorRefVal / calculatorRefName
    // 2. calculatorAllElements: an os of objects that include those in calculatorRefElements, and also those already trashed.
    // 2. defaultExpression: defaults provided for both.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*typeAheadTextInput": o()
            }
        },
        { // default
            "class": o("GeneralArea"),
            context: {
                minusOperand: "-",
                operands: o("+", [{ minusOperand: _ }, [me]], "*", "/", "^", "%", [{ separator: _ }, [me]]),
                digits: o("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"), // note these are strings not numbers (as keyboard events don't handle numbers for some reason)
                uppercase: o("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"),
                lowercase: o("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"),
                abc: o(
                    [{ lowercase: _ }, [me]],
                    [{ uppercase: _ }, [me]]
                ),
                openParentheses: "(",
                closeParentheses: ")",
                parentheses: o([{ openParentheses: _ }, [me]], [{ closeParentheses: _ }, [me]]),
                decimalPoint: ".",
                separator: ",",
                timeFunctions: o("year", "quarter", "month", "dayOfMonth", "dayOfWeek"
                    /*, "hour", "minute", "second"*/ // commented out as csv parser doesn't support this just yet
                ),

                directKeyboardChars: o(
                    [{ digits: _ }, [me]],
                    [{ decimalPoint: _ }, [me]],
                    [{ separator: _ }, [me]],
                    [{ operands: _ }, [me]],
                    [{ parentheses: _ }, [me]]
                ),
                switchToTypeAheadChars: [{ abc: _ }, [me]], // the set of keys that will switch us to type-ahead mode (to enter function or facet names via keyboard)

                evaluate: "=",
                functions: o(
                    "ln", "log10", "logb", "sqrt", "exp", "abs", "avg", "sum", "min", "max",
                    [{ timeFunctions: _ }, [me]]
                ),
                allClear: "AC",
                calculatedValue: false,
                // inheriting classes may refer to this event, to trigger a call to evaluateFormula
                defaultEvaluateEvent: o(
                    /*[clickHandledBy, // either a click on this button,
                        [ 
                            { myCalculatorController: [me] },
                            [areaOfClass, "CalculatorEvaluateButton"]
                        ]
                    ],*/
                    enterEvent
                ),
                //defaultDisplayText: "Enter +, -, *, /, avg, sum,..., or click on a facet to add it to the formula",
                defaultDisplayText: "Define a new facet by applying operations to existing facets, for example:\nsqrt(<Facet Name>)+3",

                maxLengthOfPossibleRefName: [
                    { children: { auxMaxWidthOfInputFieldText: { maxLengthOfPossibleRefName: _ } } }, [me]
                ],
                showEqualSymbol: true,

                defaultExpression: o(),
                "^expressionAD": o(),

                expression: [mergeWrite,
                    [{ expressionAD: _ }, [me]],
                    [{ defaultExpression: _ }, [me]]
                ],

                expressionNumElements: [size, [{ expression: _ }, [me]]],

                aggregationFunctionStr: "", // default value. overridden by UDF
                // generateFormulaForDisplay produces as string
                expressionAsStr: [generateFormulaForDisplay,
                    [{ expression: _ }, [me]],
                    [{ calculatorAllElements: _ }, [me]],
                    [{ aggregationFunctionStr: _ }, [me]] // the aggregation function isn't needed here, only in some cases in the generateFormulaForDisplay, so we pass an empty string instead.
                ],
                expressionIsNumber: [and,
                    [equal, [{ expressionNumElements: _ }, [me]], 1],
                    // this should be modified once we allow numbers to end with "K"/"M"/"B"...
                    [ // is expression a number? (http://stackoverflow.com/questions/12117024/decimal-number-regular-expression-where-digit-after-decimal-is-optional)
                        s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/),
                        [{ expression: _ }, [me]]
                    ]
                ],
                "^expressionClipboard": o() // for ctrl+X/V/C operations.
            },
            children: {
                auxMaxWidthOfInputFieldText: {
                    description: {
                        "class": "MaxWidthOfInputFieldText"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MaxWidthOfInputFieldText: {
        // to provide the textSize that's also used in CalculatorInputFieldText. 
        // this is merged by the displayQuery in CalculateMaxWidthOfStrings
        "class": o("CalculatorInputFieldTextDesign", "CalculateMaxWidthOfStrings"),
        context: {
            maxLengthOfPossibleRefName: [
                [{ maxWidthOfStrings: _ }, [me]],
                [{ calculatorRefElements: { calculatorRefName: _ } }, [embedding]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyCalculatorController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                expression: [{ myCalculatorController: { expression: _ } }, [me]],
                expressionClipboard: [{ myCalculatorController: { expressionClipboard: _ } }, [me]],
                expressionNumElements: [{ myCalculatorController: { expressionNumElements: _ } }, [me]],
                typeAheadTextInput: [{ myCalculatorController: { typeAheadTextInput: _ } }, [me]]
            }
        },
        { // default
            context: {
                myCalculatorController: [
                    [embeddingStar, [me]],
                    [areaOfClass, "CalculatorController"]
                ],
                myCalculatorInputField: [
                    { myCalculatorController: [{ myCalculatorController: _ }, [me]] },
                    [areaOfClass, "CalculatorInputField"]
                ],
                myInputElements: [
                    { children: { inputElements: _ } },
                    [
                        { myCalculatorController: [{ myCalculatorController: _ }, [me]] },
                        [areaOfClass, "CalculatorInputFieldDoc"]
                    ]
                ],

                calculatorRefElements: [{ myCalculatorController: { calculatorRefElements: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. calculatorDB: the db used by [evaluateFormula]
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*PocketCalculatorController: {
        "class": "CalculatorController",
        context: {
            showEqualSymbol: false,
            defaultExpression: "0",
            "^calculatedValue": true,
 
            evaluatedExpression: [evaluateFormula,
                [generateFormulaForCalculation,
                    [{ expression: _ }, [me]]
                ],
                [{ calculatorDB: _ }, [me]]
            ]
        },
        write: {
            onPocketCalculatorControllerUpdateCalculatedValue: {
                upon: [{ defaultEvaluateEvent: _ }, [me]],
                true: {
                    evaluateFormula: {
                        to: [{ expression: _ }, [me]],
                        merge: [{ evaluatedExpression: _ }, [me]]
                    },
                    setCalculatedValue: {
                        to: [{ calculatedValue: _ }, [me]],
                        merge: [{ expressionIsNumber: _ }, [me]]
                    }
                }
            }
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myCalculatorController. default provided
    // 2. buttonsData: default provided
    // 3. show: default appData initialization provided.
    // 4. positioning
    // 5. verticalButtonSpacing/horizontalButtonSpacing: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorButtons: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^show": true
            }
        },
        { // default
            "class": o("MinWrap", "TrackMyCalculatorController"),
            context: {
                minWrapAround: 0,
                buttonsData: o(
                    [{ myCalculatorController: { digits: _ } }, [me]],
                    [{ myCalculatorController: { decimalPoint: _ } }, [me]],
                    [{ myCalculatorController: { operands: _ } }, [me]],
                    [{ myCalculatorController: { parentheses: _ } }, [me]],
                    [{ myCalculatorController: { functions: _ } }, [me]],
                    [{ myCalculatorController: { abc: _ } }, [me]],
                    [{ myCalculatorController: { allClear: _ } }, [me]],
                    [{ myCalculatorController: { evaluate: _ } }, [me]]
                ),
                verticalButtonSpacing: [{ calculatorPosConst: { buttonSpacing: _ } }, [globalDefaults]],
                horizontalButtonSpacing: [{ calculatorPosConst: { buttonSpacing: _ } }, [globalDefaults]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The view containing the number and operand buttons. 
    // API: 
    // 1. Inheriting class should provide the embedded CalculatorButton areas 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*DigitAndOperandButtons: {
        "class": "MinWrap",
        context: {
            minWrapAround: 0,
            // note the order in which digitAndOperandsData appear matters - they will be sequenced per this sequence.
            // for instances of CalculatorButton for which buttonOnNewRow: true, they will start a new row in the calculator panel.
            digitAndOperandsData: o("1", "2", "3", "+", "*", "4", "5", "6", "-", "/", "7", "8", "9", ".", "^",
                [{ myCalculatorController: { allClear: _ } }, [embedding]],
                0,
                [{ myCalculatorController: { parentheses: _ } }, [embedding]],
                ","
            )
        },
        position: {
            top: 0
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The view containing the function buttons. 
    // API: 
    // 1. Inheriting class should provide the embedded CalculatorButton areas 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*FunctionButtons: {
        "class": "MinWrap",
        context: {
            minWrapAround: 0
        },
        position: {
            attachToDigitAndOperandButtons: {
                point1: {
                    element: [
                        [areaOfClass, "DigitAndOperandButtons"],
                        [embedded, [embedding]]
                    ],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: [{ verticalButtonSpacing: _ }, [embedding]]
            }
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. myCalculatorController: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*CalculatorInputFieldContainer: {
        "class": o("CalculatorInputFieldContainerDesign", "GeneralArea", "TrackMyCalculatorController"),
        children: {
            equationSymbol: {
                description: {
                    "class": "CalculatorEquationSymbol"
                }
            },
            inputField: {
                description: {
                    "class": "CalculatorInputField"
                }
            }
        }
    },*/

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorEquationSymbol: {
        "class": o("CalculatorEquationSymbolDesign", "GeneralArea", "TrackMyCalculatorController"),
        context: {
            displayText: [cond,
                [{ myCalculatorController: { showEqualSymbol: _ } }, [me]],
                o({ on: true, use: "=" }, { on: false, use: o() })
            ]
        },
        position: {
            left: 0,
            top: 0,
            bottom: 0,
            attachToLeftOfInputField: {
                point1: { type: "right" },
                point2: {
                    element: [{ myCalculatorInputField: _ }, [me]],
                    type: "left"
                },
                equals: 0
            },
            "content-width": [displayWidth]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. separateInputIntoElements: true, by default.
    // 2. rowHeight: default provided
    // 3. maxNumRows: default provided. If the embedded document contains more rows than maxNumRows, a scrollbar will be used.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputField: o(
        { // variant-controller
            qualifier: "!",
            context: {
                textInputEditedElsewhere: [
                    { editInputText: true },
                    [
                        n([me]), // for now CalculatorInputField isn't a TextInput field, but i have a suspicion it may become one.
                        [areaOfClass, "TextInput"]
                    ]
                ],
                expectingNewValue: o(
                    [not, [{ expression: _ }, [me]]],
                    [{ lastElementIsNonMinusOperandOrOpenParentheses: _ }, [me]]
                ),
                allowDecimalPoint: true, // for now. should be refined to offer protection from multiple decimal points, etc.
                inputSelected: [
                    {
                        myCalculatorInputField: [me],
                        inputSelected: _
                    },
                    [areaOfClass, "CalculatorInputFieldDoc"]
                ],
                displayDefaultText: [and,
                    [not, [{ expression: _ }, [me]]],
                    [not, [{ typeAheadTextInput: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o("CalculatorInputFieldDesign", "GeneralArea",
                "BlockMouseEvent", "VerticalContMovableController",
                "TrackMyCalculatorController"
            ),
            context: {
                // rowHeight: without the +1, and at defaultFontSize of 11, you encounter the odd bug #2049.
                rowHeight: [plus, [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]], 1],
                minNumberOfRows: 3,
                leftMarginFromFirstElement: 1,
                minWidth: 200,

                // VerticalContMovableController params
                beginningOfDocPoint: { element: [{ children: { inputFieldDoc: _ } }, [me]], type: "top" },
                endOfDocPoint: { element: [{ children: { inputFieldDoc: _ } }, [me]], type: "bottom" },

                expressionIsNumber: [{ myCalculatorController: { expressionIsNumber: _ } }, [me]],
                calculatedValue: [{ myCalculatorController: { calculatedValue: _ } }, [me]],
                separateInputIntoElements: true,

                lastElement: [last, [{ expression: _ }, [me]]],
                lastElementIsOperandOrParentheses: [
                    [{ lastElement: _ }, [me]],
                    o(
                        [{ myCalculatorController: { operands: _ } }, [me]],
                        [{ myCalculatorController: { parentheses: _ } }, [me]]
                    )
                ],
                lastElementIsOperandOrOpenParentheses: [
                    [{ lastElement: _ }, [me]],
                    o(
                        [{ myCalculatorController: { operands: _ } }, [me]],
                        [{ myCalculatorController: { openParentheses: _ } }, [me]]
                    )
                ],
                lastElementIsNonMinusOperandOrOpenParentheses: [
                    [{ lastElement: _ }, [me]],
                    o(
                        [
                            // the minus operand is excluded, as the minus is also an unary operand
                            n([{ myCalculatorController: { minusOperand: _ } }, [me]]),
                            [{ myCalculatorController: { operands: _ } }, [me]]
                        ],
                        [{ myCalculatorController: { openParentheses: _ } }, [me]]
                    )
                ],
                lastElementIsOperandOrCloseParentheses: [
                    [{ lastElement: _ }, [me]],
                    o(
                        [{ myCalculatorController: { operands: _ } }, [me]],
                        [{ myCalculatorController: { closeParentheses: _ } }, [me]]
                    )
                ],
                "*myCursorPos": [{ expressionNumElements: _ }, [me]],
                addToExpression: [defun,
                    o("element"), // could be multiple elements, as when copy-pasting!
                    o(
                        [pos,
                            Rco(0, [{ indexOfFirstSelected: _ }, [me]]), // the closed-open interval
                            [{ expression: _ }, [me]]
                        ],
                        "element",
                        [pos,
                            r( // the closed interval
                                [cond,
                                    [{ inputSelected: _ }, [me]],
                                    o(
                                        { on: false, use: [{ indexOfFirstSelected: _ }, [me]] },
                                        { on: true, use: [plus, [{ indexOfLastSelected: _ }, [me]], 1] }
                                    )
                                ],
                                [{ expressionNumElements: _ }, [me]]
                            ),
                            [{ expression: _ }, [me]]
                        ]
                    )
                ],

                inputFieldTypeAheadMenuAndEmbeddeStar: [
                    [areaOfClass, "DropDownMenuElement"], // DropDownMenuElement is a mask z-higher than all other elements of the DropDownMenu
                    [embedded, [areaOfClass, "InputFieldTypeAheadDropDownMenu"]]
                ]

            },
            write: {
                onCalculatorInputFieldInit: {
                    upon: true,
                    true: {
                        initMyCursorPos: {
                            to: [{ myCursorPos: _ }, [me]],
                            merge: [{ expressionNumElements: _ }, [me]]
                        }
                    }
                }
            },
            position: {
                top: 0,
                bottom: 0,
                right: 0,
                wideEnoughForLongestReferenceName: {
                    point1: { type: "left", content: true },
                    point2: { type: "right", content: true },
                    min: [max,
                        [{ myCalculatorController: { maxLengthOfPossibleRefName: _ } }, [me]],
                        [{ minWidth: _ }, [me]]
                    ],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            },
            children: {
                inputFieldScrollbar: {
                    description: {
                        "class": "InputFieldScrollbar"
                    }
                },
                inputFieldDoc: {
                    description: {
                        "class": "CalculatorInputFieldDoc"
                    }
                }
            }
        },
        {
            qualifier: { displayDefaultText: true },
            context: {
                displayText: [{ myCalculatorController: { defaultDisplayText: _ } }, [me]]
            }
        },
        {
            qualifier: { separateInputIntoElements: false },
            position: {
                height: [{ rowHeight: _ }, [me]]
            }
        },
        {
            qualifier: { separateInputIntoElements: true },
            context: {
                inputElementsHorizontalSpacing: 0,
                inputElementsVerticalSpacing: [{ calculator: { verticalSpacingBetweenInputRows: _ } }, [globalDefaults]],
                maxNumRows: 2,
                displayAllRowsInView: [greaterThanOrEqual,
                    [{ maxNumRows: _ }, [me]],
                    [{ children: { inputFieldDoc: { wrapAroundNumRows: _ } } }, [me]]
                ],
                actualNumRows: [cond,
                    [{ displayAllRowsInView: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [max, [{ children: { inputFieldDoc: { wrapAroundNumRows: _ } } }, [me]], 1]
                        },
                        {
                            on: false,
                            use: [{ maxNumRows: _ }, [me]]
                        }
                    )
                ]
            },
            position: {
                height: [plus,
                    [plus,
                        [mul,
                            [{ minNumberOfRows: _ }, [me]],
                            [{ rowHeight: _ }, [me]]
                        ],
                        [mul,
                            [minus, [{ actualNumRows: _ }, [me]], 1],
                            [{ inputElementsVerticalSpacing: _ }, [me]]
                        ]
                    ],
                    // some margin above the topmost row, and below the bottommost row
                    [mul,
                        [{ calculator: { verticalMarginAroundCalculatorEditorExternalRows: _ } }, [globalDefaults]],
                        2
                    ]
                ]
            }
        },
        {
            qualifier: { textInputEditedElsewhere: false }, // take control of the key events only if there isn't a TextInput area being edited currently
            context: {
                "*selectionDirection": o(),
                indexForShiftLeft: [cond,
                    [{ selectionDirection: _ }, [me]],
                    o(
                        { on: "left", use: [{ indexOfFirstSelected: _ }, [me]] },
                        { on: "right", use: [plus, [{ indexOfLastSelected: _ }, [me]], 1] },
                        { on: null, use: [{ myCursorPos: _ }, [me]] } // i.e. no selection made
                    )
                ],
                indexForShiftRight: [cond,
                    [{ selectionDirection: _ }, [me]],
                    o(
                        { on: "left", use: [{ indexOfFirstSelected: _ }, [me]] },
                        { on: "right", use: [plus, [{ indexOfLastSelected: _ }, [me]], 1] },
                        { on: null, use: [{ myCursorPos: _ }, [me]] } // i.e. no selection made
                    )
                ],
                elementForShiftLeft: [pos,
                    [minus, [{ indexForShiftLeft: _ }, [me]], 1],
                    [{ myInputElements: _ }, [me]]
                ],
                elementForShiftRight: [pos,
                    [{ indexForShiftRight: _ }, [me]],
                    [{ myInputElements: _ }, [me]]
                ],
                newExpressionElement: [cond, // AddToExpressionActions param
                    ctrlVEvent,
                    o(
                        { on: false, use: [{ key: _ }, [message]] },
                        { on: true, use: [{ expressionClipboard: _ }, [me]] }
                    )
                ]
            },
            write: {
                onCalculatorInputFieldNoSelection: {
                    upon: [not, [{ inputSelected: _ }, [me]]],
                    true: {
                        resetSelectionDirection: {
                            to: [{ selectionDirection: _ }, [me]],
                            merge: o()
                        }
                    }
                },
                onCalculatorInputFieldAllowedKeysOrCtrlV: {
                    upon: o(
                        [keyEvent,
                            "KeyPress",
                            [{ myCalculatorController: { directKeyboardChars: _ } }, [me]]
                        ],
                        ctrlVEvent
                    ),
                    true: {
                        "class": "AddToExpressionActions"
                    }
                },
                onCalculatorInputFieldBackspace: {
                    "class": "OnBackspace",
                    true: {
                        continuePropagation: false // this is supposed to prevent the browser from handling the keyboard event.
                        // we want this done even when onCalculatorInputFieldBackspaceIfPossible is not called
                    }
                },
                onCalculatorInputFieldShiftLeft: {
                    upon: [and,
                        [greaterThan, [{ indexForShiftLeft: _ }, [me]], 0],
                        shiftLeftArrowEvent
                    ],
                    true: {
                        toggleSelectOfElementForShiftLeft: {
                            to: [{ elementForShiftLeft: { selected: _ } }, [me]],
                            merge: [not, [{ elementForShiftLeft: { selected: _ } }, [me]]]
                        }
                    }
                },
                onCalculatorInputFieldShiftRight: {
                    upon: [and,
                        [lessThan, [{ indexForShiftRight: _ }, [me]], [{ expressionNumElements: _ }, [me]]],
                        shiftRightArrowEvent
                    ],
                    true: {
                        toggleSelectOfElementForShiftRight: {
                            to: [{ elementForShiftRight: { selected: _ } }, [me]],
                            merge: [not, [{ elementForShiftRight: { selected: _ } }, [me]]]
                        }
                    }
                },
                onCalculatorInputFieldShiftHome: {
                    "class": "OnShiftHome",
                    true: {
                        selectFromBeginningToCursor: {
                            to: [
                                { selected: _ },
                                [pos,
                                    Rco(0, [{ indexOfFirstSelected: _ }, [me]]),
                                    [{ myInputElements: _ }, [me]]
                                ]
                            ],
                            merge: true
                        },
                        setSelectionDirection: {
                            to: [{ selectionDirection: _ }, [me]],
                            merge: "left"
                        }
                    }
                },
                onCalculatorInputFieldShiftHomeInRightSelection: {
                    upon: [and,
                        shiftHomeEvent,
                        [equal, "right", [{ selectionDirection: _ }, [me]]]
                    ],
                    true: {
                        deselectFromIndexOfFirstSelectedToEnd: {
                            to: [
                                { selected: _ },
                                [pos,
                                    r([{ indexOfFirstSelected: _ }, [me]], [{ expressionNumElements: _ }, [me]]),
                                    [{ myInputElements: _ }, [me]]
                                ]
                            ],
                            merge: false
                        }
                    }
                },
                onCalculatorInputFieldShiftEnd: {
                    "class": "OnShiftEnd",
                    true: {
                        selectFromCursorToEnd: {
                            to: [
                                { selected: _ },
                                [pos,
                                    r([{ indexOfLastSelected: _ }, [me]], [{ expressionNumElements: _ }, [me]]),
                                    [{ myInputElements: _ }, [me]]
                                ]
                            ],
                            merge: true
                        },
                        setSelectionDirection: {
                            to: [{ selectionDirection: _ }, [me]],
                            merge: "right"
                        }
                    }
                },
                onCalculatorInputFieldShiftEndInLeftSelection: {
                    upon: [and,
                        shiftEndEvent,
                        [equal, "left", [{ selectionDirection: _ }, [me]]]
                    ],
                    true: {
                        deselectFromBeginningToIndexOfLastSelected: {
                            to: [
                                { selected: _ },
                                [pos,
                                    Rco(0, [{ indexOfLastSelected: _ }, [me]]),
                                    [{ myInputElements: _ }, [me]]
                                ]
                            ],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { inputSelected: false },
            context: {
                indexOfFirstSelected: [{ myCursorPos: _ }, [me]],
                indexOfLastSelected: [{ myCursorPos: _ }, [me]]
            }
        },
        {
            qualifier: {
                typeAheadTextInput: false,
                textInputEditedElsewhere: false,
                inputSelected: false
            },
            write: {
                onCalculatorInputFieldBackspaceIfPossible: {
                    upon: [and,
                        [greaterThan, [{ indexOfFirstSelected: _ }, [me]], 0],
                        backspaceEvent
                    ],
                    true: {
                        removeElementBeforeCursor: {
                            to: [{ expression: _ }, [me]],
                            merge: o(
                                [pos,
                                    Rco(0, [minus, [{ myCursorPos: _ }, [me]], 1]),
                                    [{ expression: _ }, [me]]
                                ],
                                [pos,
                                    r([{ myCursorPos: _ }, [me]], [{ expressionNumElements: _ }, [me]]),
                                    [{ expression: _ }, [me]]
                                ]
                            )
                        },
                        updateCursorPos: {
                            to: [{ myCursorPos: _ }, [me]],
                            merge: [minus, [{ indexOfFirstSelected: _ }, [me]], 1]
                        }
                    }
                },
                onCalculatorInputFieldShiftLeft: {
                    // upon: see { textInputEditedElsewhere: false } variant above
                    true: {
                        setSelectionDirection: {
                            to: [{ selectionDirection: _ }, [me]],
                            merge: "left"
                        }
                    }
                },
                onCalculatorInputFieldShiftRight: {
                    // upon: see { textInputEditedElsewhere: false } variant above
                    true: {
                        setSelectionDirection: {
                            to: [{ selectionDirection: _ }, [me]],
                            merge: "right"
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                textInputEditedElsewhere: false,
                inputSelected: true
            },
            context: {
                indexOfFirstSelected: [
                    {
                        iAmFirstSelected: true,
                        myIndex: _
                    },
                    [{ myInputElements: _ }, [me]]
                ],
                indexOfLastSelected: [
                    {
                        iAmLastSelected: true,
                        myIndex: _
                    },
                    [{ myInputElements: _ }, [me]]
                ]
            },
            write: {
                onCalculatorInputFieldLeftArrow: {
                    "class": "OnLeftArrow",
                    true: {
                        unselect: {
                            to: [{ myInputElements: { selected: _ } }, [me]],
                            merge: false
                        },
                        updateMyCursorPos: {
                            to: [{ myCursorPos: _ }, [me]],
                            merge: [{ indexOfFirstSelected: _ }, [me]]
                        }
                    }
                },
                onCalculatorInputFieldRightArrow: {
                    "class": "OnRightArrow",
                    true: {
                        deselect: {
                            to: [{ myInputElements: { selected: _ } }, [me]],
                            merge: false
                        },
                        updateMyCursorPos: {
                            to: [{ myCursorPos: _ }, [me]],
                            merge: [plus,
                                [{ indexOfLastSelected: _ }, [me]],
                                1
                            ]
                        }
                    }
                },
                onCalculatorInputFieldBackspace: {
                    "class": "OnBackspace",
                    true: {
                        "class": "RemoveSelectedElements"
                    }
                },
                onCalculatorInputFieldCtrlX: {
                    "class": "OnCtrlX",
                    true: {
                        "class": o("StoreInExpressionClipboard", "RemoveSelectedElements")
                    }
                },
                onCalculatorInputFieldCtrlC: {
                    "class": "OnCtrlC",
                    true: {
                        "class": "StoreInExpressionClipboard"
                    }
                }
            }
        },
        {
            qualifier: {
                textInputEditedElsewhere: false,
                typeAheadTextInput: false
            },
            write: {
                onCalculatorInputFieldSwitchToTypeAheadChars: {
                    upon: [keyEvent,
                        "KeyPress",
                        [{ myCalculatorController: { switchToTypeAheadChars: _ } }, [me]]
                    ],
                    true: {
                        setSwitchToTypeAheadCharsMode: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: [{ key: _ }, [message]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { typeAheadTextInput: true },
            write: {
                onCalculatorInputFieldExitIndirectKeyboardCharMode: {
                    upon: o(
                        enterEvent,
                        escEvent,
                        [mouseDownNotHandledBy,
                            [{ inputFieldTypeAheadMenuAndEmbeddeStar: _ }, [me]]
                        ]
                    ),
                    true: {
                        clearTypeAheadTextInput: {
                            to: [{ typeAheadTextInput: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InputFieldScrollbar: {
        "class": o("VerticalScrollbarContainer", "AboveSiblings", "TrackMyFacet"),
        context: {
            movableController: [embedding],
            attachToView: "end",
            attachToViewOverlap: true,
            fixedLengthScroller: 12 // override the default value of SCrollbarContainer: scrollbarPosConst.fixedLengthScroller
        }
    },
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    StoreInExpressionClipboard: {
        storeInExpressionClipboard: {
            to: [{ expressionClipboard: _ }, [me]],
            merge: [pos,
                r([{ indexOfFirstSelected: _ }, [me]], [{ indexOfLastSelected: _ }, [me]]),
                [{ expression: _ }, [me]]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    RemoveSelectedElements: {
        removeSelectedElements: {
            to: [{ expression: _ }, [me]],
            merge: o(
                [pos,
                    Rco(0, [{ indexOfFirstSelected: _ }, [me]]),
                    [{ expression: _ }, [me]]
                ],
                [pos,
                    Roc([{ indexOfLastSelected: _ }, [me]], [{ expressionNumElements: _ }, [me]]),
                    [{ expression: _ }, [me]]
                ]
            )
        },
        deselect: {
            to: [{ myInputElements: { selected: _ } }, [me]],
            merge: false
        },
        updateCursorPos: {
            to: [{ myCursorPos: _ }, [me]],
            merge: [{ indexOfFirstSelected: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. newExpressionElement
    // 2. Inheriting class should inherit TrackMyCalculatorController (which defines myCalculatorInputField and expression)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddToExpressionActions: {
        writeToInputField: {
            to: [{ expression: _ }, [me]],
            merge: [
                [{ myCalculatorInputField: { addToExpression: _ } }, [me]],
                [{ newExpressionElement: _ }, [me]]
            ]
        },
        deselect: { // if any
            to: [{ myInputElements: { selected: _ } }, [me]],
            merge: false
        },
        incCursorPos: {
            to: [{ myCalculatorInputField: { myCursorPos: _ } }, [me]],
            merge: [plus, [size, [{ newExpressionElement: _ }, [me]]], [{ myCalculatorInputField: { indexOfFirstSelected: _ } }, [me]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputFieldDoc: o(
        { // variant-controller
            qualifier: "!",
            context: {
                separateInputIntoElements: [{ separateInputIntoElements: _ }, [embedding]],
                displayAllRowsInView: [{ displayAllRowsInView: _ }, [embedding]],
                inputSelected: [{ myInputElements: { selected: _ } }, [me]],
                embedCursor: [and,
                    o(
                        [not, [{ textInputEditedElsewhere: _ }, [embedding]]],
                        [{ typeAheadTextInput: _ }, [me]]  // note in this case textInputEditedElsewhere will be true!
                    ),
                    [not, [{ inputSelected: _ }, [me]]]
                ]
            }
        },
        { // default
            "class": o(
                "CalculatorInputFieldDocDesign",
                "GeneralArea",
                "MinWrapVertical",
                "Tmdable",
                "TrackMyCalculatorController"
            ),
            position: {
                left: 0,
                right: 0
            },
            write: {
                onCalculatorInputFieldDocMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        moveCursorOnMouseDown: {
                            to: [{ myCalculatorInputField: { myCursorPos: _ } }, [me]],
                            merge: [{ expressionNumElements: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { embedCursor: true },
            children: {
                cursor: {
                    description: {
                        "class": "CalculatorInputCursor"
                    }
                }
            }
        },
        {
            qualifier: { displayAllRowsInView: true },
            position: {
                "vertical-center": 0
            },
            write: {
                onCalculatorInputFieldDocUnselect: {
                    upon: o(
                        [mouseDownNotHandledBy,
                            [{ myInputElements: _ }, [me]]
                        ],
                        escEvent,
                        [mouseUpHandledBy,
                            [{ myInputElements: _ }, [me]]
                        ]
                    ),
                    true: {
                        unselect: {
                            to: [{ myInputElements: { selected: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { displayAllRowsInView: false },
            "class": "DraggableMovable",
            context: {
                // DraggableMovable params
                movableController: [embedding]
            }
        },
        {
            qualifier: { separateInputIntoElements: false },
            context: {
                displayText: [{ myCalculatorController: { expressionAsStr: _ } }, [me]]
            }
        },
        {
            qualifier: { separateInputIntoElements: true },
            "class": "HorizontalWrapAroundController",
            context: {
                wrapArounds: [{ myInputElements: _ }, [me]],
                wrapAroundSpacing: [{ inputElementsHorizontalSpacing: _ }, [embedding]],
                wrapAroundSecondaryAxisSpacing: [{ inputElementsVerticalSpacing: _ }, [embedding]],
                verticallyDraggable: true // to override the inheritance of Horizontal by HorizontalWrapAroundController       
            },
            children: {
                inputElements: {
                    data: [{ expression: _ }, [me]],
                    description: {
                        "class": "CalculatorInputElement"
                    }
                }
            },
            write: {
                onCalculatorInputFieldDocScrollToNewRow: {
                    // this holds whether the number of wrapAround rows increases or decreases!
                    upon: [changed, [{ wrapAroundNumRows: _ }, [me]]],
                    true: {
                        scrollDownToBottomOfDoc: {
                            to: [message],
                            merge: {
                                msgType: "EndOfDoc",
                                recipient: [{ movableController: _ }, [me]]
                            }
                        }
                    }
                },
                onCalculatorInputFieldDocDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        selectAllInputElements: {
                            to: [{ inputSelected: _ }, [me]],
                            merge: true
                        },
                        continuePropagation: false
                    }
                }
            },
            position: {
                equalVerticalSpacingFromEdgeElements: {
                    pair1: {
                        point1: { type: "top" },
                        point2: {
                            element: [{ firstInAreaOS: true }, [{ wrapArounds: _ }, [me]]],
                            type: "top"
                        }
                    },
                    pair2: {
                        point1: {
                            element: [{ lastInAreaOS: true }, [{ wrapArounds: _ }, [me]]],
                            type: "bottom"
                        },
                        point2: { type: "bottom" }
                    },
                    ratio: 1
                }
            }
        }
    ),


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputElementCore: {

    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputElement: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                isRefElement: [{ param: { areaSetContent: { calculatorRefVal: _ } } }, [me]],
                elementsInASingleRow: [equal, 1, [{ wrapAroundNumRows: _ }, [me]]],
                "*selected": false
            }
        },
        { // default
            "class": o("CalculatorInputElementDesign", "GeneralArea", "CalculatorInputElementCore",
                "WrapAround", "Tmdable", "Tooltipable", "TrackMyCalculatorController"),
            context: {
                calcValue: [{ param: { areaSetContent: _ } }, [me]],
                firstInRowOffsetFromView: [{ myCalculatorInputField: { leftMarginFromFirstElement: _ } }, [me]], // override WrapAround default
                mouseDownLeftOfHorizontalCenter: [greaterThanOrEqual,
                    [offset,
                        { element: [pointer], type: "left" },
                        { type: "horizontal-center" }
                    ],
                    0],
                myIndex: [index,
                    [{ myInputElements: _ }, [me]],
                    [me]
                ],
                //myUDFEditorApplyButton: [{ myUDFEditorApplyButton : _ }, [embedding]]
            },
            position: {
                "content-width": [displayWidth],
                height: [{ myCalculatorInputField: { rowHeight: _ } }, [me]]
            },
            write: {
                onCalculatorInputElementMouseDown: {
                    upon: o(
                        [and,
                            mouseDownEvent,
                            [not, [{ selected: _ }, [me]]]
                        ],
                        [and,
                            mouseUpEvent,
                            [{ selected: _ }, [me]]
                        ]
                    ),
                    true: {
                        moveCursorOnMouseDown: {
                            to: [{ myCalculatorInputField: { myCursorPos: _ } }, [me]],
                            merge: [cond,
                                [{ mouseDownLeftOfHorizontalCenter: _ }, [me]],
                                o(
                                    { on: true, use: [{ myIndex: _ }, [me]] },
                                    { on: false, use: [plus, [{ myIndex: _ }, [me]], 1] }
                                )
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { elementsInASingleRow: true },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: { isRefElement: false },
            context: {
                displayText: [{ calcValue: _ }, [me]]
            }
        },
        {
            qualifier: { isRefElement: true },
            context: {
                latestRefElementName: [{ param: { areaSetContent: { calculatorRefName: _ } } }, [me]], // the last known calculatorRefName of the ref element
                liveRefElementName: [ // as the reference may be to a UDF that's been deleted *after* being referenced.
                    {
                        calculatorRefVal: [{ isRefElement: _ }, [me]], // this is the calculatorRefVal attribute of the param.areaSetContent
                        calculatorRefName: _
                    },
                    [{ calculatorRefElements: _ }, [me]]
                ],
                refFacet: [ // as the reference may be to a facet that is no longer numeric (e.g., after the urser has changed its dataType) 
                    { calculatorRefName: [{ isRefElement: _ }, [me]] },
                    [areaOfClass, "Facet"]
                ],
                displayText: [cond,
                    [{ liveRefElementName: _ }, [me]],
                    o(
                        { on: true, use: [{ liveRefElementName: _ }, [me]] },
                        { on: false, use: [{ latestRefElementName: _ }, [me]] }
                    )]
            }
        },
        {
            qualifier: {
                isRefElement: true,
                liveRefElementName: false,
                refFacet: false
            },
            context: {
                tooltipText: "Obsolete Reference"
            }
        },
        {
            qualifier: {
                isRefElement: true,
                liveRefElementName: false,
                refFacet: true
            },
            context: {
                tooltipText: "Not a Numerical Reference"
            }
        },
        {
            qualifier: { selected: true },
            context: {
                iAmFirstSelected: [equal,
                    [first, [{ myInputElements: { selected: true } }, [me]]],
                    [me]
                ],
                iAmLastSelected: [equal,
                    [last, [{ myInputElements: { selected: true } }, [me]]],
                    [me]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputCursor: o(
        { // variant-controller
            qualifier: "!",
            context: {
                atBeginningOfExpression: [equal, [{ pos: _ }, [me]], 0],
                atEndOfExpression: [equal, [{ pos: _ }, [me]], [{ expressionNumElements: _ }, [me]]],
                refExpressionElement: [cond,
                    [{ atEndOfExpression: _ }, [me]],
                    o(
                        { on: false, use: [pos, [{ pos: _ }, [me]], [{ myInputElements: _ }, [me]]] },
                        { on: true, use: [last, [{ myInputElements: _ }, [me]]] }
                    )
                ]
            }
        },
        { // default
            "class": o("CalculatorInputCursorDesign", "GeneralArea", "TrackMyCalculatorController"),
            context: {
                pos: [{ myCalculatorInputField: { myCursorPos: _ } }, [me]]
            },
            position: {
                width: 1,
                height: [{ myCalculatorInputField: { rowHeight: _ } }, [me]]
            }
        },
        {
            qualifier: { refExpressionElement: true },
            position: {
                positionVerticallyWRTRefExpressionElement: {
                    point1: { type: "vertical-center" },
                    point2: { element: [{ refExpressionElement: _ }, [me]], type: "vertical-center" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                refExpressionElement: true,
                atBeginningOfExpression: false
            },
            write: {
                onCalculatorInputCursorLeftArrow: {
                    "class": "OnLeftArrow",
                    true: {
                        decPos: {
                            to: [{ pos: _ }, [me]],
                            merge: [minus, [{ pos: _ }, [me]], 1]
                        }
                    }
                },
                onCalculatorInputCursorHome: {
                    "class": "OnHome",
                    true: {
                        posToHome: {
                            to: [{ pos: _ }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                refExpressionElement: true,
                atEndOfExpression: false
            },
            write: {
                onCalculatorInputCursorRightArrow: {
                    "class": "OnRightArrow",
                    true: {
                        incPos: {
                            to: [{ pos: _ }, [me]],
                            merge: [plus, [{ pos: _ }, [me]], 1]
                        }
                    }
                },
                onCalculatorInputCursorEnd: {
                    "class": "OnEnd",
                    true: {
                        posToHome: {
                            to: [{ pos: _ }, [me]],
                            merge: [{ expressionNumElements: _ }, [me]]
                        }
                    }
                }
            },
            position: {
                positionHorizontallyWRTRefExpressionElement: {
                    point1: { type: "right" },
                    point2: { element: [{ refExpressionElement: _ }, [me]], type: "left" },
                    equals: 0
                }
            }
        },
        {
            qualifier: {
                refExpressionElement: true,
                atEndOfExpression: true
            },
            position: {
                positionHorizontallyWRTRefExpressionElement: {
                    point1: { element: [{ refExpressionElement: _ }, [me]], type: "right" },
                    point2: { type: "left" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { refExpressionElement: false },
            position: {
                positionVerticallyWRTCalculatorInputField: {
                    point1: { type: "vertical-center" },
                    point2: { element: [{ myCalculatorInputField: _ }, [me]], type: "vertical-center" },
                    equals: 0
                },
                positionHorizontallyWRTCalculatorInputField: {
                    point1: { element: [{ myCalculatorInputField: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: [{ myCalculatorInputField: { leftMarginFromFirstElement: _ } }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorSelectionRangeCursor: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: "red"
        },
        position: {
            width: 1,
            height: 10,
            attachToCursorHorizontally: {
                point1: { element: [areaOfClass, "CalculatorInputCursor"], type: "right" },
                point2: { type: "left" },
                equals: 1
            },
            attachToCursorVertically: {
                point1: { element: [areaOfClass, "CalculatorInputCursor"], type: "vertical-center" },
                point2: { type: "vertical-center" },
                equals: 0
            }
        }
    },
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. Inheriting class should give this class its dimension/position, and its display object.
    // 2. Inheriting class may override the definition of disabled, and reuse the defaultDisabled
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorButton: o(
        { // variant-controller
            qualifier: "!",
            context: {
                show: [{ myButtonsPanel: { show: _ } }, [me]],
                digitButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { digits: _ } }, [me]]
                ],
                decimalButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { decimalPoint: _ } }, [me]]
                ],
                operandButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { operands: _ } }, [me]]
                ],
                parenthesesButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { parentheses: _ } }, [me]]
                ],
                functionButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { functions: _ } }, [me]]
                ],
                abcButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { abc: _ } }, [me]]
                ],
                allClearButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { allClear: _ } }, [me]]
                ],
                evaluateButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { evaluate: _ } }, [me]]
                ],
                timeButton: [
                    [{ param: { areaSetContent: _ } }, [me]],
                    [{ myCalculatorController: { timeFunctions: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o("CalculatorButtonDesign", "ModifyPointerClickable", "TrackMyCalculatorController"),
            context: {
                myButtonsPanel: [
                    [areaOfClass, "CalculatorButtons"],
                    [embeddingStar, [me]]
                ],

                calcValue: [{ param: { areaSetContent: _ } }, [me]],
                displayText: [{ calcValue: _ }, [me]],
                newExpressionElement: [{ calcValue: _ }, [me]], // CalculatorInputButton param

                horizontalButtonSpacing: [{ myButtonsPanel: { horizontalButtonSpacing: _ } }, [me]],
                verticalButtonSpacing: [{ myButtonsPanel: { verticalButtonSpacing: _ } }, [me]]
            }
        },
        {
            qualifier: { show: true },
            "class": "MemberOfLeftToRightAreaOS",
            context: {
                spacingFromPrev: [{ horizontalButtonSpacing: _ }, [me]]
            },
            position: {
                matchPrevTop: {
                    point1: { element: [{ myPrevInAreaOS: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: 0,
                    priority: positioningPrioritiesConstants.weakerThanDefault
                }
            }
        },
        {
            qualifier: {
                show: true,
                firstInAreaOS: true
            },
            position: {
                top: 0
            }
        },
        {
            qualifier: { digitButton: true },
            "class": "CalculatorDigitButton"
        },
        {
            qualifier: { decimalButton: true },
            "class": "CalculatorDecimalButton"
        },
        {
            qualifier: { operandButton: true },
            "class": "CalculatorOperandButton"
        },
        {
            qualifier: { parenthesesButton: true },
            "class": "CalculatorParenthesesButton"
        },
        {
            qualifier: { functionButton: true },
            "class": "CalculatorFunctionButton"
        },
        {
            qualifier: { abcButton: true },
            "class": "CalculatorABCButton"
        }
        /*      
        {
            qualifier: { evaluateButton: true },
            "class": "CalculatorEvaluateButton"
        },        
        {
            qualifier: { allClearButton: true },
            "class": "CalculatorAllClearButton"
        }
        */
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. newExpressionElement
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorInputButton: o(
        { // variant-controller
            qualifier: "!",
            context: {
                expressionIsNumber: [{ myCalculatorInputField: { expressionIsNumber: _ } }, [me]],
                expectingNewValue: [{ myCalculatorInputField: { expectingNewValue: _ } }, [me]],
                calculatedValue: [{ myCalculatorInputField: { calculatedValue: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyCalculatorController"),
            context: {
                // for the disabled mechanism is not really in use (except for UDFRefElementUX)
                disabled: false // [{ defaultDisabled:_ }, [me]]                
            }
        },
        {
            qualifier: { disabled: false },
            write: {
                onCalculatorInputButtonMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        "class": "AddToExpressionActions"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorDigitButton: o(
        { // default
            "class": o("CalculatorInputButton"), //"NumberExpressionElement"
            context: {
                defaultDisabled: o(
                    [and,
                        [
                            s(/^0$/), // i.e. an exact match to "0" (and not to "0.", for example)
                            [{ myCalculatorInputField: { lastElement: _ } }, [me]]
                        ],
                        [not, [{ calculatedValue: _ }, [me]]]
                    ],
                    [
                        s(/[a-z]|[A-Z]/),
                        [{ myCalculatorInputField: { lastElement: _ } }, [me]]
                    ]
                )
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorDecimalButton: o(
        { // default
            "class": o("CalculatorInputButton"), //"NumberExpressionElement"
            context: {
                fullDecimalPoint: [concatStr, o("0", [{ myCalculatorController: { decimalPoint: _ } }, [me]])],
                defaultDisabled: [
                    s(/[0-9]*\.[0-9]*$/),
                    [{ myCalculatorInputField: { lastElement: _ } }, [me]]
                ]
            }
        },
        {
            qualifier: {
                calculatedValue: false,
                expectingNewValue: true
            },
            context: {
                expressionValue: [{ fullDecimalPoint: _ }, [me]] // override NumberExpressionElement's default
            }
        },
        {
            qualifier: { calculatedValue: true },
            context: {
                expressionValue: [{ fullDecimalPoint: _ }, [me]] // override NumberExpressionElement's default
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inherited by CalculatorDigitButton and CalculatorDecimalButton
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //NumberExpressionElement: o(
    /*{ // default
    }
    { // default
        context: {
            expressionValue: [{ calcValue:_ }, [me]]
        }
    },
    {
        qualifier: { calculatedValue: false,
                     expectingNewValue: true },
        context: {
            expression: o(
                          [{ myCalculatorController: { expression:_ } }, [me]],
                          [{ expressionValue:_ }, [me]]
                         )
        }
    },
    {
        qualifier: { calculatedValue: false,
                     expectingNewValue: false },
        context: {
            expression: o(
                          [{ myCalculatorInputField: { beforeLastElements:_ } }, [me]], 
                          [concatStr, o([{ myCalculatorInputField: { lastElement:_ } }, [me]], [{ expressionValue:_ }, [me]])]
                         )
        }
    },
    {
        qualifier: { calculatedValue: true },
        context: {
            expression: [{ expressionValue:_ }, [me]]
        }
    }  */
    //),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorOperandButton: o(
        { // default
            "class": "CalculatorInputButton",
            context: {
                defaultDisabled: [and,
                    [notEqual, [{ calcValue: _ }, [me]], [{ myCalculatorController: { minusOperand: _ } }, [me]]], // minus never disabled
                    o(
                        [{ myCalculatorInputField: { lastElementIsOperandOrOpenParentheses: _ } }, [me]],
                        [not, [{ expression: _ }, [me]]]
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    CalculatorParenthesesButton: {
        "class": "CalculatorInputButton"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    CalculatorFunctionButton: o(
        { // default
            "class": "CalculatorInputButton",
            context: {
                defaultDisabled: [and,
                    [{ expression: _ }, [me]],
                    [not, [{ expressionIsNumber: _ }, [me]]],
                    [not,
                        [
                            [{ myCalculatorInputField: { lastElement: _ } }, [me]],
                            o(
                                [{ myCalculatorController: { openParentheses: _ } }, [me]],
                                [{ myCalculatorController: { operands: _ } }, [me]]
                            )
                        ]
                    ]
                ],
                textSize: [minus, [{ defaultFontSize: _ }, [me]], 2]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    CalculatorABCButton: { // default
        "class": "CalculatorInputButton",
        context: {
            defaultDisabled: [and,
                [not, [{ expressionIsNumber: _ }, [me]]],
                [
                    s(/[0-9]/),
                    [{ myCalculatorInputField: { lastElement: _ } }, [me]]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    CalculatorAllClearButton: {
        write: {
            onCalculatorAllClearButtonMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetExpression: {
                        to: [{ expression: _ }, [me]],
                        merge: [{ myCalculatorController: { defaultExpression: _ } }, [me]]
                    }
                    // reset of cursor position handled by onCalculatorControllerAppEvaluate                   
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // replaced by UDFEditorApplyButton
    /*
    CalculatorEvaluateButton: {
        // nothing for now
    },
    */

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. calculatorRefVal
    // 2. calculatorRefName
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorRefElement: {
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myCalculatorController 
    // 2. myCalculatorRefElement
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorRefElementUX: {
        "class": o("GeneralArea", "CalculatorInputButton"),
        context: {
            defaultDisabled: [and,
                [{ expression: _ }, [me]],
                [not,
                    [
                        [{ myCalculatorInputField: { lastElement: _ } }, [me]],
                        o(
                            [{ myCalculatorController: { openParentheses: _ } }, [me]],
                            [{ myCalculatorController: { operands: _ } }, [me]]
                        )
                    ]
                ]
            ],
            newExpressionElement: {     // CalculatorInputButton param:
                // for RefElements, we store both their value and calculatorRefName.
                // when displaying them, if the calculatorRefVal still exists (i.e. is not to a UDF that's been deleted), we look up its current 
                // calculatorRefName (as the calculatorRefName may have been changed). Otherwise, we display the calculatorRefName recorded in this appData.
                // to be added: if UDF1 is referenced in UDF2's defintion, then UDF1 is renamed ABC, then ABC is deleted, then UDF2 
                // will keep in store the old calculatorRefName. we may want to change referenced names (such as in UDF2) when renaming a UDF 
                // (such as UDF1)
                calculatorRefVal: [{ myCalculatorRefElement: { calculatorRefVal: _ } }, [me]],
                calculatorRefName: [{ myCalculatorRefElement: { calculatorRefName: _ } }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. positioning
    // 2. myCalculatorController (referenced by the associated FacetRefControlMenuLines). Default provided
    // 3. refElelementAboveMe (the element above to set the positioning constraints)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorRefElementsDropDown: o(
        {
            "class": o("RefElementsDropDownMenuable", "TrackMyCalculatorController"),
            context: {
                displayText: [concatStr,
                    o(
                        [{ myApp: { addStr: _ } }, [me]],
                        [{ myApp: { facetEntityStr: _ } }, [me]],
                        [{ myApp: { fromStr: _ } }, [me]],
                        [{ myApp: { extOverlayEntityStr: _ } }, [me]]
                    ),
                    " "
                ],
                // RefElementsDropDownMenuable API        
                storeDropDownMenuSelection: false, // override DropDownMenuable default value
                displayMenuSelection: false, // override DropDownMenuable default value                
                dropDownMenuLogicalSelectionsOS: [{ calculatorRefElements: { calculatorRefVal: _ } }, [me]],
                dropDownMenuDisplaySelectionsOS: [{ calculatorRefElements: { calculatorRefName: _ } }, [me]]
            },
            position: {
                leftAlignedWithUDFEditorFunctionButtons: {
                    point1: { element: [{ refElelementAboveMe: _ }, [me]], type: "left" },
                    point2: { type: "left" },
                    equals: 0
                },
                rightAlignedWithUDFEditorFunctionButtons: {
                    point1: { element: [{ refElelementAboveMe: _ }, [me]], type: "right" },
                    point2: { type: "right" },
                    equals: 0
                },
                attachToTestCalculatorButtonsBottom: {
                    point1: { element: [{ refElelementAboveMe: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: [{ calculatorPosConst: { buttonSpacing: _ } }, [globalDefaults]]
                },
                centerAlignWithCalculatorButtons: {
                    point1: { element: [{ refElelementAboveMe: _ }, [me]], type: "horizontal-center" },
                    point2: { type: "horizontal-center" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { createDropDownMenu: true },
            children: {
                menu: { // part of the DropDownMenuable API: adding 
                    description: {
                        "class": "CalculatorRefElementsMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by an area which also inherits DropDownMenu
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorRefElementsMenu: {
        "class": o("CalculatorRefElementsMenuDesign", "RightSideScrollbarDropDownMenu"),
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "CalculatorRefElementsMenuLine"
                            }
                        }
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by an area which also inherits DropDownMenuLine
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CalculatorRefElementsMenuLine: o(
        {
            "class": o("CalculatorRefElementsMenuLineDesign", "RefElementsMenuLine", "CalculatorRefElementUX", "TrackMyCalculatorController"),
            context: {
                myCalculatorRefElement: [ // CalculatorRefElementUX param
                    { calculatorRefName: [{ calculatorRefName: _ }, [me]] },
                    [areaOfClass, "CalculatorRefElement"]
                ],
                myCalculatorController: [{ myDropDownMenuable: { myCalculatorController: _ } }, [me]] // override default definition in TrackMyCalculatorController
            }
        },
        {
            qualifier: {
                disabled: false,
                lineInFocus: true
            },
            write: {
                onCalculatorRefElementsMenuLineInFocusEnter: {
                    "class": "OnEnter",
                    true: {
                        "class": "AddToExpressionActions"
                    }
                }
            }
        }
    )
};
